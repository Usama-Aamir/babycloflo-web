-- Migration: introduce admin role via profiles table and lock down elevated RLS policies
-- Run this manually in the Supabase SQL Editor (or via `supabase migration up`) after customer auth is planned.

-- 1. Profiles table: one row per auth.users, tracks admin flag.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

-- Index for fast admin checks.
create index if not exists idx_profiles_is_admin on public.profiles(is_admin);

-- Enable RLS on profiles; lookups used inside policies are done via security-definer functions below.
alter table public.profiles enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

-- 2. Trigger: every newly registered Supabase Auth user gets a default non-admin profile.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, is_admin)
  values (new.id, false)
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Drop and recreate so the migration is idempotent.
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3. Promote the existing admin account to is_admin = true.
-- Replace 'abrar@gmail.com' with the email actually used for the admin Auth user.
insert into public.profiles (id, is_admin)
select id, true
from auth.users
where email = 'abrar@gmail.com'
on conflict (id) do update set is_admin = true;

-- 4. Helper functions for admin checks inside RLS policies.
create or replace function public.current_user_is_admin()
returns boolean
language plpgsql
security definer set search_path = public
as $$
begin
  return exists (
    select 1
    from public.profiles
    where id = auth.uid() and is_admin = true
  );
end;
$$;

create or replace function public.is_admin(user_id uuid)
returns boolean
language plpgsql
security definer set search_path = public
as $$
begin
  return exists (
    select 1
    from public.profiles
    where id = user_id and is_admin = true
  );
end;
$$;

-- 5. Link orders to a logged-in customer account (nullable so guest checkout still works).
alter table public.orders
  add column if not exists customer_id uuid references auth.users(id) on delete set null;

-- 6. Convert elevated (write) policies on catalog/settings tables to require admin.
--    The SELECT policies that granted authenticated users broader-than-public access
--    are also converted to admin-only, otherwise signed-up customers would see draft inventory.

-- categories: INSERT, UPDATE, DELETE
drop policy if exists "Authenticated users can insert categories" on public.categories;
create policy "Admins can insert categories"
  on public.categories for insert
  to authenticated
  with check (public.current_user_is_admin());

drop policy if exists "Authenticated users can update categories" on public.categories;
create policy "Admins can update categories"
  on public.categories for update
  to authenticated
  using (public.current_user_is_admin())
  with check (public.current_user_is_admin());

drop policy if exists "Authenticated users can delete categories" on public.categories;
create policy "Admins can delete categories"
  on public.categories for delete
  to authenticated
  using (public.current_user_is_admin());

-- products: admin-only view-all, INSERT, UPDATE, DELETE
drop policy if exists "Authenticated users can view all products" on public.products;
create policy "Admins can view all products"
  on public.products for select
  to authenticated
  using (public.current_user_is_admin());

drop policy if exists "Authenticated users can insert products" on public.products;
create policy "Admins can insert products"
  on public.products for insert
  to authenticated
  with check (public.current_user_is_admin());

drop policy if exists "Authenticated users can update products" on public.products;
create policy "Admins can update products"
  on public.products for update
  to authenticated
  using (public.current_user_is_admin())
  with check (public.current_user_is_admin());

drop policy if exists "Authenticated users can delete products" on public.products;
create policy "Admins can delete products"
  on public.products for delete
  to authenticated
  using (public.current_user_is_admin());

-- product_variants: admin-only view-all, INSERT, UPDATE, DELETE
drop policy if exists "Authenticated users can view all product variants" on public.product_variants;
create policy "Admins can view all product variants"
  on public.product_variants for select
  to authenticated
  using (public.current_user_is_admin());

drop policy if exists "Authenticated users can insert product variants" on public.product_variants;
create policy "Admins can insert product variants"
  on public.product_variants for insert
  to authenticated
  with check (public.current_user_is_admin());

drop policy if exists "Authenticated users can update product variants" on public.product_variants;
create policy "Admins can update product variants"
  on public.product_variants for update
  to authenticated
  using (public.current_user_is_admin())
  with check (public.current_user_is_admin());

drop policy if exists "Authenticated users can delete product variants" on public.product_variants;
create policy "Admins can delete product variants"
  on public.product_variants for delete
  to authenticated
  using (public.current_user_is_admin());

-- variant_colors: admin-only view-all, INSERT, UPDATE, DELETE
drop policy if exists "Authenticated users can view all variant colors" on public.variant_colors;
create policy "Admins can view all variant colors"
  on public.variant_colors for select
  to authenticated
  using (public.current_user_is_admin());

drop policy if exists "Authenticated users can insert variant colors" on public.variant_colors;
create policy "Admins can insert variant colors"
  on public.variant_colors for insert
  to authenticated
  with check (public.current_user_is_admin());

drop policy if exists "Authenticated users can update variant colors" on public.variant_colors;
create policy "Admins can update variant colors"
  on public.variant_colors for update
  to authenticated
  using (public.current_user_is_admin())
  with check (public.current_user_is_admin());

drop policy if exists "Authenticated users can delete variant colors" on public.variant_colors;
create policy "Admins can delete variant colors"
  on public.variant_colors for delete
  to authenticated
  using (public.current_user_is_admin());

-- store_settings: INSERT, UPDATE, DELETE limited to admins (SELECT remains public).
drop policy if exists "Authenticated users can insert store settings" on public.store_settings;
create policy "Admins can insert store settings"
  on public.store_settings for insert
  to authenticated
  with check (public.current_user_is_admin());

drop policy if exists "Authenticated users can update store settings" on public.store_settings;
create policy "Admins can update store settings"
  on public.store_settings for update
  to authenticated
  using (public.current_user_is_admin())
  with check (public.current_user_is_admin());

drop policy if exists "Authenticated users can delete store settings" on public.store_settings;
create policy "Admins can delete store settings"
  on public.store_settings for delete
  to authenticated
  using (public.current_user_is_admin());

-- 7. Lock down orders/order_items SELECT/UPDATE/DELETE to admins and add customer self-service SELECT.
--    INSERT remains available to anon/authenticated for guest and customer checkout.

drop policy if exists "Authenticated users can view orders" on public.orders;
create policy "Admins can view all orders"
  on public.orders for select
  to authenticated
  using (public.current_user_is_admin());

drop policy if exists "Authenticated users can update orders" on public.orders;
create policy "Admins can update orders"
  on public.orders for update
  to authenticated
  using (public.current_user_is_admin())
  with check (public.current_user_is_admin());

drop policy if exists "Authenticated users can delete orders" on public.orders;
create policy "Admins can delete orders"
  on public.orders for delete
  to authenticated
  using (public.current_user_is_admin());

-- Authenticated customers can read only their own orders.
drop policy if exists "Customers can view their own orders" on public.orders;
create policy "Customers can view their own orders"
  on public.orders for select
  to authenticated
  using (customer_id = auth.uid());

-- order_items: SELECT/UPDATE/DELETE limited to admins.
drop policy if exists "Authenticated users can view order items" on public.order_items;
create policy "Admins can view all order items"
  on public.order_items for select
  to authenticated
  using (public.current_user_is_admin());

drop policy if exists "Authenticated users can update order items" on public.order_items;
create policy "Admins can update order items"
  on public.order_items for update
  to authenticated
  using (public.current_user_is_admin())
  with check (public.current_user_is_admin());

drop policy if exists "Authenticated users can delete order items" on public.order_items;
create policy "Admins can delete order items"
  on public.order_items for delete
  to authenticated
  using (public.current_user_is_admin());
