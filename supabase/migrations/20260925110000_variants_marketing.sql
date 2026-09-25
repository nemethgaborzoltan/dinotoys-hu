-- Product variants, merchandising relations, coupons and marketing popups.
-- Each variant can own SKU/EAN/price/stock/image while the parent product keeps shared content/compliance.

alter table public.products
  add column if not exists variant_options jsonb not null default '[]'::jsonb;

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  sku text not null unique,
  ean text unique,
  retail_price_huf integer not null check (retail_price_huf >= 0),
  compare_at_price_huf integer check (compare_at_price_huf is null or compare_at_price_huf >= 0),
  cost_net_eur numeric(12,4),
  stock_on_hand integer not null default 0 check (stock_on_hand >= 0),
  safety_stock integer not null default 0 check (safety_stock >= 0),
  weight_grams integer,
  image_url text,
  attributes jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists product_variants_product_idx on public.product_variants(product_id, active, sort_order);

create table if not exists public.product_relations (
  product_id uuid not null references public.products(id) on delete cascade,
  related_product_id uuid not null references public.products(id) on delete cascade,
  relation_type text not null check (relation_type in ('upsell','cross_sell')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  primary key (product_id, related_product_id, relation_type),
  check (product_id <> related_product_id)
);
create index if not exists product_relations_parent_idx on public.product_relations(product_id, relation_type, sort_order);

alter table public.promotions
  add column if not exists usage_limit integer,
  add column if not exists per_customer_limit integer,
  add column if not exists max_discount_huf integer,
  add column if not exists combinable boolean not null default false,
  add column if not exists priority integer not null default 0,
  add column if not exists description text;

create table if not exists public.marketing_popups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  title text not null,
  body text,
  eyebrow text,
  coupon_code text,
  cta_label text not null default 'Ajánlat aktiválása',
  cta_href text not null default '/termekek',
  trigger_type text not null default 'delay' check (trigger_type in ('delay','exit_intent','cart_value')),
  delay_seconds integer not null default 4 check (delay_seconds >= 0 and delay_seconds <= 120),
  min_cart_huf integer,
  page_scope text not null default 'all' check (page_scope in ('all','home','catalog','product','cart')),
  frequency text not null default 'session' check (frequency in ('always','session','day','once')),
  starts_at timestamptz,
  ends_at timestamptz,
  active boolean not null default true,
  content jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.inventory_movements add column if not exists variant_id uuid references public.product_variants(id) on delete set null;
alter table public.inventory_reservations add column if not exists variant_id uuid references public.product_variants(id) on delete cascade;
alter table public.order_items
  add column if not exists variant_id uuid references public.product_variants(id) on delete set null,
  add column if not exists variant_sku text,
  add column if not exists variant_label text,
  add column if not exists metadata jsonb not null default '{}'::jsonb;
alter table public.orders
  add column if not exists promotion_id uuid references public.promotions(id) on delete set null,
  add column if not exists coupon_code text;

-- Variant stock can be adjusted independently with a ledger record.
create or replace function public.adjust_variant_inventory(
  p_variant_id uuid,
  p_delta integer,
  p_reason text,
  p_reference_type text default null,
  p_reference_id uuid default null
) returns integer
language plpgsql
security definer set search_path = public
as $$
declare
  v_product_id uuid;
  new_stock integer;
begin
  update public.product_variants
  set stock_on_hand = stock_on_hand + p_delta, updated_at = now()
  where id = p_variant_id and stock_on_hand + p_delta >= 0
  returning product_id, stock_on_hand into v_product_id, new_stock;

  if new_stock is null then
    raise exception 'INSUFFICIENT_VARIANT_STOCK_OR_NOT_FOUND';
  end if;

  insert into public.inventory_movements(product_id, variant_id, quantity_delta, reason, reference_type, reference_id)
  values (v_product_id, p_variant_id, p_delta, p_reason, p_reference_type, p_reference_id);

  return new_stock;
end;
$$;

-- Replace checkout engine: variant-aware pricing/stock + server-side coupon validation.
drop function if exists public.create_checkout_order(text,text,text,jsonb,jsonb);
drop function if exists public.create_checkout_order(text,text,text,jsonb,jsonb,text);

create function public.create_checkout_order(
  p_idempotency_key text,
  p_email text,
  p_phone text,
  p_shipping_address jsonb,
  p_items jsonb,
  p_coupon_code text default null
) returns jsonb
language plpgsql
security definer set search_path = public
as $$
declare
  v_order_id uuid;
  v_existing public.orders%rowtype;
  v_item jsonb;
  v_product public.products%rowtype;
  v_variant public.product_variants%rowtype;
  v_promo public.promotions%rowtype;
  v_variant_id uuid;
  v_quantity integer;
  v_reserved integer;
  v_unit_price integer;
  v_item_sku text;
  v_variant_label text;
  v_subtotal integer := 0;
  v_discount integer := 0;
  v_shipping integer := 0;
  v_total integer := 0;
  v_threshold integer := 15000;
  v_min_subtotal integer := 0;
  v_usage_count integer := 0;
  v_customer_usage integer := 0;
  v_has_coupon boolean := false;
begin
  select * into v_existing from public.orders where idempotency_key = p_idempotency_key;
  if found then
    return jsonb_build_object(
      'order_id',v_existing.id,'order_number',v_existing.order_number,'subtotal_huf',v_existing.subtotal_huf,
      'discount_huf',v_existing.discount_huf,'shipping_huf',v_existing.shipping_huf,'total_huf',v_existing.total_huf,
      'coupon_code',v_existing.coupon_code,'status',v_existing.status,'replayed',true
    );
  end if;

  if jsonb_array_length(p_items)=0 then raise exception 'EMPTY_CART'; end if;

  select coalesce((value #>> '{}')::integer,15000) into v_threshold
  from public.settings where key='shop.free_shipping_threshold_huf';

  insert into public.orders(email,phone,status,shipping_address,idempotency_key)
  values (lower(trim(p_email)),p_phone,'draft',p_shipping_address,p_idempotency_key)
  returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_quantity := greatest(1,least(99,(v_item->>'quantity')::integer));
    v_variant_id := nullif(v_item->>'variant_id','')::uuid;

    select * into v_product
    from public.products
    where id=(v_item->>'product_id')::uuid and status='active'
    for update;
    if not found then raise exception 'PRODUCT_NOT_AVAILABLE:%',v_item->>'product_id'; end if;

    if v_variant_id is not null then
      select * into v_variant
      from public.product_variants
      where id=v_variant_id and product_id=v_product.id and active=true
      for update;
      if not found then raise exception 'VARIANT_NOT_AVAILABLE:%',v_variant_id; end if;

      select coalesce(sum(quantity),0) into v_reserved
      from public.inventory_reservations
      where variant_id=v_variant.id and status='active' and expires_at>now();

      if (v_variant.stock_on_hand-v_variant.safety_stock-v_reserved)<v_quantity then
        raise exception 'INSUFFICIENT_STOCK:%',v_variant.id;
      end if;

      v_unit_price := v_variant.retail_price_huf;
      v_item_sku := v_variant.sku;
      select string_agg(value,' · ' order by key) into v_variant_label
      from jsonb_each_text(v_variant.attributes);
    else
      select coalesce(sum(quantity),0) into v_reserved
      from public.inventory_reservations
      where product_id=v_product.id and variant_id is null and status='active' and expires_at>now();

      if (v_product.stock_on_hand-v_product.safety_stock-v_reserved)<v_quantity then
        raise exception 'INSUFFICIENT_STOCK:%',v_product.id;
      end if;

      v_unit_price := v_product.retail_price_huf;
      v_item_sku := v_product.sku;
      v_variant_label := null;
    end if;

    insert into public.order_items(
      order_id,product_id,variant_id,sku,variant_sku,variant_label,product_name,quantity,unit_gross_huf,vat_rate,line_total_huf
    ) values(
      v_order_id,v_product.id,v_variant_id,v_product.sku,
      case when v_variant_id is null then null else v_item_sku end,
      v_variant_label,v_product.name,v_quantity,v_unit_price,v_product.vat_rate,v_unit_price*v_quantity
    );

    insert into public.inventory_reservations(product_id,variant_id,order_id,quantity,status,expires_at)
    values(v_product.id,v_variant_id,v_order_id,v_quantity,'active',now()+interval '15 minutes');

    v_subtotal := v_subtotal + v_unit_price*v_quantity;
  end loop;

  if p_coupon_code is not null and trim(p_coupon_code) <> '' then
    select * into v_promo
    from public.promotions
    where upper(code)=upper(trim(p_coupon_code))
      and active=true
      and (starts_at is null or starts_at<=now())
      and (ends_at is null or ends_at>=now())
    order by priority desc, created_at asc
    limit 1;

    if not found then raise exception 'COUPON_INVALID'; end if;

    v_min_subtotal := coalesce((v_promo.conditions->>'minSubtotal')::integer,0);
    if v_subtotal < v_min_subtotal then raise exception 'COUPON_MIN_SUBTOTAL:%',v_min_subtotal; end if;

    if v_promo.usage_limit is not null then
      select count(*) into v_usage_count
      from public.orders
      where promotion_id=v_promo.id and status not in ('cancelled','refunded');
      if v_usage_count >= v_promo.usage_limit then raise exception 'COUPON_USAGE_LIMIT'; end if;
    end if;

    if v_promo.per_customer_limit is not null then
      select count(*) into v_customer_usage
      from public.orders
      where promotion_id=v_promo.id and lower(email)=lower(trim(p_email)) and status not in ('cancelled','refunded');
      if v_customer_usage >= v_promo.per_customer_limit then raise exception 'COUPON_CUSTOMER_LIMIT'; end if;
    end if;

    if v_promo.kind='percentage' then
      v_discount := round(v_subtotal * (v_promo.value/100.0));
      if v_promo.max_discount_huf is not null then v_discount := least(v_discount,v_promo.max_discount_huf); end if;
    elsif v_promo.kind='fixed' then
      v_discount := least(v_subtotal,round(v_promo.value));
    elsif v_promo.kind='free_shipping' then
      v_discount := 0;
    end if;
    v_has_coupon := true;
  end if;

  if v_subtotal-v_discount < v_threshold then v_shipping := 1490; end if;
  if v_has_coupon and v_promo.kind='free_shipping' then v_shipping := 0; end if;
  v_total := greatest(0,v_subtotal-v_discount)+v_shipping;

  update public.orders
  set subtotal_huf=v_subtotal,discount_huf=v_discount,shipping_huf=v_shipping,total_huf=v_total,status='pending_payment',
      promotion_id=case when v_has_coupon then v_promo.id else null end,
      coupon_code=case when v_has_coupon then upper(trim(p_coupon_code)) else null end
  where id=v_order_id
  returning order_number into v_existing.order_number;

  insert into public.outbox_events(topic,aggregate_type,aggregate_id,payload)
  values('order.created','order',v_order_id::text,jsonb_build_object(
    'order_id',v_order_id,'email',p_email,'subtotal_huf',v_subtotal,'discount_huf',v_discount,'shipping_huf',v_shipping,'total_huf',v_total,
    'coupon_code',case when v_has_coupon then upper(trim(p_coupon_code)) else null end
  ));

  return jsonb_build_object(
    'order_id',v_order_id,'order_number',v_existing.order_number,'subtotal_huf',v_subtotal,'discount_huf',v_discount,
    'shipping_huf',v_shipping,'total_huf',v_total,'coupon_code',case when v_has_coupon then upper(trim(p_coupon_code)) else null end,
    'status','pending_payment','reservation_expires_in_seconds',900,'replayed',false
  );
end;
$$;

drop trigger if exists product_variants_touch on public.product_variants;
create trigger product_variants_touch before update on public.product_variants for each row execute function public.set_updated_at();
drop trigger if exists marketing_popups_touch on public.marketing_popups;
create trigger marketing_popups_touch before update on public.marketing_popups for each row execute function public.set_updated_at();

alter table public.product_variants enable row level security;
alter table public.product_relations enable row level security;
alter table public.marketing_popups enable row level security;

create policy "public active product variants" on public.product_variants for select to anon, authenticated using (active=true);
create policy "public active marketing popups" on public.marketing_popups for select to anon, authenticated
using (active=true and (starts_at is null or starts_at<=now()) and (ends_at is null or ends_at>=now()));

-- Useful demo marketing defaults; editable/removable in admin.
insert into public.promotions(name,code,kind,value,conditions,active,description,per_customer_limit,priority)
values ('Első rendelés 10%','WELCOME10','percentage',10,'{"minSubtotal":8000}'::jsonb,true,'10% kedvezmény minimum 8 000 Ft kosárértéktől.',1,100)
on conflict (code) do nothing;

insert into public.marketing_popups(name,title,body,eyebrow,coupon_code,cta_label,cta_href,trigger_type,delay_seconds,page_scope,frequency,active,sort_order)
select 'Üdvözlő kupon','Szerezz 10% kedvezményt az első rendelésedre','Aktiváld a WELCOME10 kupont. A kedvezményt a kosár és a checkout is kezeli.','Exkluzív ajánlat','WELCOME10','Kupon aktiválása','/termekek','delay',4,'all','session',true,10
where not exists (select 1 from public.marketing_popups where name='Üdvözlő kupon');
