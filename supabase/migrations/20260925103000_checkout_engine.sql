alter table public.orders add column if not exists idempotency_key text unique;
alter table public.orders add column if not exists customer_note text;
alter table public.orders add column if not exists metadata jsonb not null default '{}'::jsonb;

create or replace function public.create_checkout_order(
  p_idempotency_key text,
  p_email text,
  p_phone text,
  p_shipping_address jsonb,
  p_items jsonb
) returns jsonb
language plpgsql
security definer set search_path = public
as $$
declare
  v_order_id uuid;
  v_existing public.orders%rowtype;
  v_item jsonb;
  v_product public.products%rowtype;
  v_quantity integer;
  v_reserved integer;
  v_subtotal integer := 0;
  v_shipping integer := 0;
  v_total integer := 0;
  v_threshold integer := 15000;
begin
  select * into v_existing from public.orders where idempotency_key = p_idempotency_key;
  if found then
    return jsonb_build_object('order_id',v_existing.id,'order_number',v_existing.order_number,'total_huf',v_existing.total_huf,'status',v_existing.status,'replayed',true);
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
    select * into v_product from public.products where id=(v_item->>'product_id')::uuid and status='active' for update;
    if not found then raise exception 'PRODUCT_NOT_AVAILABLE:%',v_item->>'product_id'; end if;

    select coalesce(sum(quantity),0) into v_reserved from public.inventory_reservations
    where product_id=v_product.id and status='active' and expires_at>now();

    if (v_product.stock_on_hand-v_product.safety_stock-v_reserved)<v_quantity then
      raise exception 'INSUFFICIENT_STOCK:%',v_product.id;
    end if;

    insert into public.order_items(order_id,product_id,sku,product_name,quantity,unit_gross_huf,vat_rate,line_total_huf)
    values(v_order_id,v_product.id,v_product.sku,v_product.name,v_quantity,v_product.retail_price_huf,v_product.vat_rate,v_product.retail_price_huf*v_quantity);

    insert into public.inventory_reservations(product_id,order_id,quantity,status,expires_at)
    values(v_product.id,v_order_id,v_quantity,'active',now()+interval '15 minutes');

    v_subtotal := v_subtotal + v_product.retail_price_huf*v_quantity;
  end loop;

  if v_subtotal < v_threshold then v_shipping := 1490; end if;
  v_total := v_subtotal + v_shipping;

  update public.orders set subtotal_huf=v_subtotal,shipping_huf=v_shipping,total_huf=v_total,status='pending_payment'
  where id=v_order_id
  returning order_number into v_existing.order_number;

  insert into public.outbox_events(topic,aggregate_type,aggregate_id,payload)
  values('order.created','order',v_order_id::text,jsonb_build_object('order_id',v_order_id,'email',p_email,'total_huf',v_total));

  return jsonb_build_object('order_id',v_order_id,'order_number',v_existing.order_number,'subtotal_huf',v_subtotal,'shipping_huf',v_shipping,'total_huf',v_total,'status','pending_payment','reservation_expires_in_seconds',900,'replayed',false);
exception
  when others then
    raise;
end;
$$;
