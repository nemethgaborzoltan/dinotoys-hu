create extension if not exists pgcrypto;

create type product_status as enum ('draft','review','active','archived','recalled');
create type order_status as enum ('draft','pending_payment','paid','processing','shipped','delivered','cancelled','returned','refunded');

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.categories(id) on delete set null,
  name text not null,
  slug text not null unique,
  description text,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  supplier text not null default 'dinotoys',
  supplier_id text,
  sku text not null unique,
  ean text unique,
  name text not null,
  slug text not null unique,
  brand text,
  description text,
  short_description text,
  retail_price_huf integer not null check (retail_price_huf >= 0),
  compare_at_price_huf integer check (compare_at_price_huf is null or compare_at_price_huf >= 0),
  vat_rate numeric(5,4) not null default 0.27,
  stock_on_hand integer not null default 0 check (stock_on_hand >= 0),
  safety_stock integer not null default 0 check (safety_stock >= 0),
  age_from integer,
  manufacturer_name text,
  manufacturer_address text,
  manufacturer_email text,
  responsible_person_name text,
  responsible_person_address text,
  responsible_person_email text,
  safety_warning_hu text,
  ce_marked boolean,
  safety_reviewed_at timestamptz,
  status product_status not null default 'draft',
  seo_title text,
  seo_description text,
  source_updated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_status_idx on public.products(status);
create index products_brand_idx on public.products(brand);
create index products_supplier_id_idx on public.products(supplier, supplier_id);

create table public.product_categories (
  product_id uuid not null references public.products(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  primary key (product_id, category_id)
);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  url text not null,
  alt_text text,
  sort_order integer not null default 0
);

create table public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  quantity_delta integer not null,
  reason text not null,
  reference_type text,
  reference_id uuid,
  created_at timestamptz not null default now()
);

create table public.supplier_sync_runs (
  id uuid primary key default gen_random_uuid(),
  supplier text not null,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  status text not null check (status in ('running','success','partial','failed')),
  imported_count integer not null default 0,
  updated_count integer not null default 0,
  failed_count integer not null default 0,
  error_summary jsonb
);

create table public.price_rules (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  target_margin numeric(6,4) not null check (target_margin >= 0 and target_margin < .9),
  fx_buffer numeric(6,4) not null default 0,
  inbound_per_unit_huf integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  marketing_consent boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text,
  country_code text not null default 'HU',
  postal_code text not null,
  city text not null,
  line1 text not null,
  line2 text,
  created_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number bigint generated always as identity unique,
  user_id uuid references auth.users(id) on delete set null,
  email text not null,
  phone text,
  status order_status not null default 'draft',
  currency text not null default 'HUF',
  subtotal_huf integer not null default 0,
  shipping_huf integer not null default 0,
  discount_huf integer not null default 0,
  total_huf integer not null default 0,
  shipping_address jsonb not null,
  billing_address jsonb,
  payment_provider text,
  payment_reference text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  sku text not null,
  product_name text not null,
  quantity integer not null check (quantity > 0),
  unit_gross_huf integer not null check (unit_gross_huf >= 0),
  vat_rate numeric(5,4) not null,
  line_total_huf integer not null check (line_total_huf >= 0)
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  before_data jsonb,
  after_data jsonb,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.addresses enable row level security;
alter table public.orders enable row level security;

create policy "profile owner read" on public.profiles for select using (auth.uid() = id);
create policy "profile owner update" on public.profiles for update using (auth.uid() = id);
create policy "address owner access" on public.addresses for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "order owner read" on public.orders for select using (auth.uid() = user_id);

create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
create trigger products_touch before update on public.products for each row execute function public.touch_updated_at();
create trigger orders_touch before update on public.orders for each row execute function public.touch_updated_at();
