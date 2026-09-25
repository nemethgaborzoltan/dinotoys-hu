-- DinoToys.hu backend platform expansion
-- Auth/RBAC, CMS, integrations, commerce operations, media and admin-editable configuration.

alter table public.categories add column if not exists sort_order integer not null default 0;
alter table public.categories add column if not exists active boolean not null default true;

alter table public.products add column if not exists cost_net_eur numeric(12,4);
alter table public.products add column if not exists weight_grams integer;
alter table public.products add column if not exists metadata jsonb not null default '{}'::jsonb;
alter table public.products add column if not exists published_at timestamptz;
alter table public.products add column if not exists version integer not null default 1;

alter table public.audit_logs add column if not exists metadata jsonb not null default '{}'::jsonb;

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  label text not null,
  description text,
  system boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.permissions (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  label text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.role_permissions (
  role_id uuid not null references public.roles(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  primary key (role_id, permission_id)
);

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role_id uuid not null references public.roles(id),
  active boolean not null default true,
  display_name text,
  last_login_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.brands (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  logo_url text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique,
  active boolean not null default true,
  feed_type text not null default 'manual' check (feed_type in ('api','xml','csv','manual')),
  feed_url text,
  config jsonb not null default '{}'::jsonb,
  last_sync_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.supplier_products (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid not null references public.suppliers(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  supplier_sku text not null,
  supplier_ean text,
  supplier_net_eur numeric(12,4),
  available_units integer,
  minimum_order_qty integer,
  pack_qty integer,
  raw_payload jsonb not null default '{}'::jsonb,
  source_updated_at timestamptz,
  imported_at timestamptz not null default now(),
  unique (supplier_id, supplier_sku)
);
create index if not exists supplier_products_product_idx on public.supplier_products(product_id);
create index if not exists supplier_products_ean_idx on public.supplier_products(supplier_ean);

create table if not exists public.settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value jsonb not null default 'null'::jsonb,
  group_name text not null default 'general',
  public boolean not null default false,
  description text,
  updated_at timestamptz not null default now()
);

create table if not exists public.content_pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  body text not null default '',
  seo_title text,
  seo_description text,
  published boolean not null default false,
  published_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists public.navigation_items (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.navigation_items(id) on delete cascade,
  location text not null,
  label text not null,
  href text not null,
  sort_order integer not null default 0,
  active boolean not null default true,
  updated_at timestamptz not null default now()
);
create index if not exists navigation_items_location_idx on public.navigation_items(location, sort_order);

create table if not exists public.homepage_sections (
  id uuid primary key default gen_random_uuid(),
  section_key text not null unique,
  title text,
  enabled boolean not null default true,
  sort_order integer not null default 0,
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.promotions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text unique,
  kind text not null check (kind in ('percentage','fixed','free_shipping','bundle')),
  value numeric(12,2) not null default 0,
  conditions jsonb not null default '{}'::jsonb,
  starts_at timestamptz,
  ends_at timestamptz,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  bucket text not null,
  path text not null unique,
  url text not null,
  file_name text not null,
  mime_type text not null,
  size_bytes bigint not null check (size_bytes >= 0),
  alt_text text,
  tags text[] not null default '{}',
  uploaded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.integration_accounts (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  kind text not null,
  active boolean not null default false,
  config jsonb not null default '{}'::jsonb,
  secret_names text[] not null default '{}',
  last_health_status text,
  last_health_at timestamptz,
  updated_at timestamptz not null default now(),
  unique(provider, kind)
);

create table if not exists public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  external_event_id text not null,
  event_type text not null,
  payload jsonb not null,
  status text not null default 'received' check (status in ('received','processed','failed','ignored')),
  error_message text,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  unique(provider, external_event_id)
);

create table if not exists public.outbox_events (
  id uuid primary key default gen_random_uuid(),
  topic text not null,
  aggregate_type text not null,
  aggregate_id text,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending','processing','sent','failed')),
  attempts integer not null default 0,
  available_at timestamptz not null default now(),
  processed_at timestamptz,
  last_error text,
  created_at timestamptz not null default now()
);
create index if not exists outbox_pending_idx on public.outbox_events(status, available_at);

create table if not exists public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  anonymous_token text unique,
  currency text not null default 'HUF',
  expires_at timestamptz,
  updated_at timestamptz not null default now(),
  check (user_id is not null or anonymous_token is not null)
);

create table if not exists public.cart_items (
  cart_id uuid not null references public.carts(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  quantity integer not null check (quantity > 0),
  updated_at timestamptz not null default now(),
  primary key (cart_id, product_id)
);

create table if not exists public.inventory_reservations (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  order_id uuid references public.orders(id) on delete cascade,
  cart_id uuid references public.carts(id) on delete cascade,
  quantity integer not null check (quantity > 0),
  status text not null default 'active' check (status in ('active','consumed','released','expired')),
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  check (order_id is not null or cart_id is not null)
);
create index if not exists inventory_reservations_active_idx on public.inventory_reservations(product_id, status, expires_at);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  provider text not null,
  provider_reference text not null unique,
  status text not null check (status in ('created','requires_action','authorized','paid','failed','cancelled','refunded','partially_refunded')),
  amount_huf integer not null check (amount_huf >= 0),
  currency text not null default 'HUF',
  idempotency_key text unique,
  raw_status jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.refunds (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null references public.payments(id) on delete cascade,
  provider_reference text unique,
  amount_huf integer not null check (amount_huf > 0),
  reason text,
  status text not null default 'pending' check (status in ('pending','succeeded','failed')),
  created_at timestamptz not null default now()
);

create table if not exists public.shipments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  provider text not null,
  service_id text,
  provider_reference text,
  tracking_code text,
  tracking_url text,
  label_url text,
  status text not null default 'pending',
  shipped_at timestamptz,
  delivered_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.returns (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  status text not null default 'requested' check (status in ('requested','approved','in_transit','received','rejected','refunded','closed')),
  reason text,
  customer_note text,
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.customer_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  note text not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Keep profile rows in sync with Supabase Auth users.
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles(id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_auth_user();

-- Atomic inventory mutation used by order/supplier workflows.
create or replace function public.adjust_inventory(
  p_product_id uuid,
  p_delta integer,
  p_reason text,
  p_reference_type text default null,
  p_reference_id uuid default null
) returns integer
language plpgsql
security definer set search_path = public
as $$
declare
  new_stock integer;
begin
  update public.products
  set stock_on_hand = stock_on_hand + p_delta, updated_at = now(), version = version + 1
  where id = p_product_id and stock_on_hand + p_delta >= 0
  returning stock_on_hand into new_stock;

  if new_stock is null then
    raise exception 'INSUFFICIENT_STOCK_OR_PRODUCT_NOT_FOUND';
  end if;

  insert into public.inventory_movements(product_id, quantity_delta, reason, reference_type, reference_id)
  values (p_product_id, p_delta, p_reason, p_reference_type, p_reference_id);

  return new_stock;
end;
$$;

-- Generic updated_at trigger for editable admin resources.
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

do $$
declare t text;
begin
  foreach t in array array['brands','suppliers','settings','content_pages','navigation_items','homepage_sections','promotions','integration_accounts','carts','payments','shipments','returns']
  loop
    execute format('drop trigger if exists %I_touch on public.%I', t, t);
    execute format('create trigger %I_touch before update on public.%I for each row execute function public.set_updated_at()', t, t);
  end loop;
end $$;

-- RBAC permission catalog.
insert into public.permissions(key,label) values
('*','Minden jogosultság'),
('dashboard.read','Dashboard megtekintése'),
('products.read','Termékek megtekintése'),
('products.write','Termékek szerkesztése'),
('products.publish','Termékek publikálása'),
('categories.write','Kategóriák szerkesztése'),
('inventory.write','Készlet módosítása'),
('pricing.write','Árazás szerkesztése'),
('orders.read','Rendelések megtekintése'),
('orders.write','Rendelések kezelése'),
('orders.refund','Visszatérítés indítása'),
('customers.read','Ügyfelek megtekintése'),
('customers.write','Ügyfelek kezelése'),
('content.write','Tartalom és navigáció szerkesztése'),
('marketing.write','Marketing és promóciók szerkesztése'),
('analytics.read','Analitika megtekintése'),
('media.write','Médiatár kezelése'),
('integrations.write','Integrációk kezelése'),
('settings.write','Rendszerbeállítások szerkesztése'),
('supplier.sync','Beszállítói integráció kezelése'),
('audit.read','Audit log megtekintése'),
('users.manage','Admin felhasználók és szerepkörök kezelése')
on conflict (key) do update set label=excluded.label;

insert into public.roles(name,label,description,system) values
('super_admin','Super Admin','Teljes rendszerjogosultság.',true),
('admin','Admin','Általános admin jogosultság.',true),
('catalog_manager','Katalógus menedzser','Termék, kategória, ár és tartalom kezelés.',true),
('order_manager','Rendelés menedzser','Rendelések, ügyfelek és visszáruk kezelése.',true),
('marketing','Marketing','Tartalom, promóció és analitika.',true),
('warehouse','Raktár','Készlet és szállítási műveletek.',true),
('support','Ügyfélszolgálat','Rendelés/ügyfél olvasás és support folyamatok.',true),
('readonly','Csak olvasás','Admin adatok olvasása módosítás nélkül.',true)
on conflict (name) do update set label=excluded.label, description=excluded.description;

insert into public.role_permissions(role_id,permission_id)
select r.id,p.id from public.roles r cross join public.permissions p
where r.name in ('super_admin','admin')
on conflict do nothing;

insert into public.role_permissions(role_id,permission_id)
select r.id,p.id from public.roles r join public.permissions p on p.key in
('dashboard.read','products.read','products.write','products.publish','categories.write','inventory.write','pricing.write','content.write','media.write','supplier.sync')
where r.name='catalog_manager' on conflict do nothing;

insert into public.role_permissions(role_id,permission_id)
select r.id,p.id from public.roles r join public.permissions p on p.key in
('dashboard.read','orders.read','orders.write','orders.refund','customers.read','customers.write','audit.read')
where r.name='order_manager' on conflict do nothing;

insert into public.role_permissions(role_id,permission_id)
select r.id,p.id from public.roles r join public.permissions p on p.key in
('dashboard.read','products.read','content.write','marketing.write','analytics.read','media.write')
where r.name='marketing' on conflict do nothing;

insert into public.role_permissions(role_id,permission_id)
select r.id,p.id from public.roles r join public.permissions p on p.key in
('dashboard.read','products.read','inventory.write','orders.read','orders.write')
where r.name='warehouse' on conflict do nothing;

insert into public.role_permissions(role_id,permission_id)
select r.id,p.id from public.roles r join public.permissions p on p.key in
('dashboard.read','orders.read','customers.read')
where r.name='support' on conflict do nothing;

insert into public.role_permissions(role_id,permission_id)
select r.id,p.id from public.roles r join public.permissions p on p.key in
('dashboard.read','products.read','orders.read','customers.read','analytics.read','audit.read')
where r.name='readonly' on conflict do nothing;

-- Public defaults are fully admin-editable.
insert into public.settings(key,value,group_name,public,description) values
('shop.name','"DinoToys.hu"'::jsonb,'general',true,'Webshop neve'),
('shop.free_shipping_threshold_huf','15000'::jsonb,'commerce',true,'Ingyenes standard szállítási küszöb'),
('shop.default_vat_rate','0.27'::jsonb,'commerce',true,'Alap ÁFA kulcs'),
('shop.currency','"HUF"'::jsonb,'commerce',true,'Alap pénznem'),
('features.gift_finder','true'::jsonb,'features',true,'AI/Dino Match ajándékkereső'),
('features.compare','true'::jsonb,'features',true,'Termék összehasonlítás'),
('features.wishlist','true'::jsonb,'features',true,'Kedvencek')
on conflict (key) do nothing;

insert into public.homepage_sections(section_key,title,enabled,sort_order,content) values
('hero','Hero',true,10,'{"eyebrow":"Friss trendek hetente","title":"Találd meg gyorsan azt, aminek örülni fog.","primaryCta":"Felfedezem a játékokat"}'::jsonb),
('categories','Kategóriák',true,20,'{}'::jsonb),
('trending','Trend radar',true,30,'{}'::jsonb),
('gift_finder','Dino Match',true,40,'{}'::jsonb),
('newsletter','Dino Drop',true,50,'{}'::jsonb)
on conflict (section_key) do nothing;

-- Supabase Storage bucket. Objects are written through the server-side API.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('product-media','product-media',true,8388608,array['image/jpeg','image/png','image/webp','image/avif','image/svg+xml'])
on conflict (id) do update set public=excluded.public,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;

-- RLS: browser clients get only explicitly public/read-owned data.
alter table public.products enable row level security;
alter table public.categories enable row level security;
alter table public.brands enable row level security;
alter table public.settings enable row level security;
alter table public.content_pages enable row level security;
alter table public.navigation_items enable row level security;
alter table public.homepage_sections enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.returns enable row level security;

create policy "public active products" on public.products for select to anon, authenticated using (status='active');
create policy "public active categories" on public.categories for select to anon, authenticated using (active=true);
create policy "public active brands" on public.brands for select to anon, authenticated using (active=true);
create policy "public settings" on public.settings for select to anon, authenticated using (public=true);
create policy "public content pages" on public.content_pages for select to anon, authenticated using (published=true);
create policy "public navigation" on public.navigation_items for select to anon, authenticated using (active=true);
create policy "public homepage sections" on public.homepage_sections for select to anon, authenticated using (enabled=true);

create policy "user carts" on public.carts for all to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());
create policy "user cart items" on public.cart_items for all to authenticated
using (exists(select 1 from public.carts c where c.id=cart_id and c.user_id=auth.uid()))
with check (exists(select 1 from public.carts c where c.id=cart_id and c.user_id=auth.uid()));
create policy "user returns read" on public.returns for select to authenticated using (user_id=auth.uid());

-- Public object reads are allowed for product-media; mutations stay server-side.
create policy "public product media read" on storage.objects for select to anon, authenticated
using (bucket_id='product-media');

-- Never expose these admin/operational tables directly to browser roles.
alter table public.admin_users enable row level security;
alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.integration_accounts enable row level security;
alter table public.media_assets enable row level security;
alter table public.suppliers enable row level security;
alter table public.supplier_products enable row level security;
alter table public.webhook_events enable row level security;
alter table public.outbox_events enable row level security;
alter table public.payments enable row level security;
alter table public.refunds enable row level security;
alter table public.shipments enable row level security;
alter table public.customer_notes enable row level security;
