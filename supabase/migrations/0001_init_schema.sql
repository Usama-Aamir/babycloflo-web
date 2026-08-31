create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_urdu text,
  slug text not null unique,
  image_url text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id),
  name text not null,
  description text,
  base_images text[],
  status text not null default 'draft' check (status in ('active', 'out_of_stock', 'draft')),
  is_giftable boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id),
  size text not null,
  finish text,
  price numeric(10,2) not null,
  stock_status text not null default 'in_stock' check (stock_status in ('in_stock', 'out_of_stock')),
  sku text,
  created_at timestamptz not null default now()
);

create table public.variant_colors (
  id uuid primary key default gen_random_uuid(),
  variant_id uuid not null references public.product_variants(id),
  color_name text not null,
  swatch_image_url text,
  created_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_type text not null default 'website' check (order_type in ('website', 'whatsapp')),
  customer_name text not null,
  phone text not null,
  address text not null,
  city text not null,
  delivery_charge numeric(10,2) not null default 0,
  status text not null default 'pending' check (status in ('pending', 'packed', 'shipped', 'delivered')),
  notes text,
  is_gift_box boolean not null default false,
  gift_note text,
  gift_wrap_fee numeric(10,2) not null default 0,
  created_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id),
  product_id uuid not null references public.products(id),
  variant_id uuid not null references public.product_variants(id),
  color_id uuid references public.variant_colors(id),
  quantity integer not null default 1,
  price_at_purchase numeric(10,2) not null
);

create table public.store_settings (
  id uuid primary key default gen_random_uuid(),
  delivery_charge numeric(10,2) not null default 0,
  gift_wrap_fee numeric(10,2) not null default 0,
  whatsapp_number text,
  store_contact_email text,
  store_address text
);

create unique index store_settings_single_row on public.store_settings ((true));

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.variant_colors enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.store_settings enable row level security;

create policy "Public can view categories"
on public.categories for select
to anon, authenticated
using (true);

create policy "Authenticated users can insert categories"
on public.categories for insert
to authenticated
with check (true);

create policy "Authenticated users can update categories"
on public.categories for update
to authenticated
using (true)
with check (true);

create policy "Authenticated users can delete categories"
on public.categories for delete
to authenticated
using (true);

create policy "Public can view active products"
on public.products for select
to anon
using (status = 'active');

create policy "Authenticated users can view all products"
on public.products for select
to authenticated
using (true);

create policy "Authenticated users can insert products"
on public.products for insert
to authenticated
with check (true);

create policy "Authenticated users can update products"
on public.products for update
to authenticated
using (true)
with check (true);

create policy "Authenticated users can delete products"
on public.products for delete
to authenticated
using (true);

create policy "Public can view variants of active products"
on public.product_variants for select
to anon
using (
  exists (
    select 1
    from public.products
    where products.id = product_variants.product_id
      and products.status = 'active'
  )
);

create policy "Authenticated users can view all product variants"
on public.product_variants for select
to authenticated
using (true);

create policy "Authenticated users can insert product variants"
on public.product_variants for insert
to authenticated
with check (true);

create policy "Authenticated users can update product variants"
on public.product_variants for update
to authenticated
using (true)
with check (true);

create policy "Authenticated users can delete product variants"
on public.product_variants for delete
to authenticated
using (true);

create policy "Public can view colors of active products"
on public.variant_colors for select
to anon
using (
  exists (
    select 1
    from public.product_variants
    join public.products on products.id = product_variants.product_id
    where product_variants.id = variant_colors.variant_id
      and products.status = 'active'
  )
);

create policy "Authenticated users can view all variant colors"
on public.variant_colors for select
to authenticated
using (true);

create policy "Authenticated users can insert variant colors"
on public.variant_colors for insert
to authenticated
with check (true);

create policy "Authenticated users can update variant colors"
on public.variant_colors for update
to authenticated
using (true)
with check (true);

create policy "Authenticated users can delete variant colors"
on public.variant_colors for delete
to authenticated
using (true);

create policy "Public can create orders"
on public.orders for insert
to anon, authenticated
with check (true);

create policy "Authenticated users can view orders"
on public.orders for select
to authenticated
using (true);

create policy "Authenticated users can update orders"
on public.orders for update
to authenticated
using (true)
with check (true);

create policy "Authenticated users can delete orders"
on public.orders for delete
to authenticated
using (true);

create policy "Public can create order items"
on public.order_items for insert
to anon, authenticated
with check (true);

create policy "Authenticated users can view order items"
on public.order_items for select
to authenticated
using (true);

create policy "Authenticated users can update order items"
on public.order_items for update
to authenticated
using (true)
with check (true);

create policy "Authenticated users can delete order items"
on public.order_items for delete
to authenticated
using (true);

create policy "Public can view store settings"
on public.store_settings for select
to anon, authenticated
using (true);

create policy "Authenticated users can insert store settings"
on public.store_settings for insert
to authenticated
with check (true);

create policy "Authenticated users can update store settings"
on public.store_settings for update
to authenticated
using (true)
with check (true);

create policy "Authenticated users can delete store settings"
on public.store_settings for delete
to authenticated
using (true);
