-- Fix: re-ensure public insert policies for guest and customer checkout
-- The previous 0004 migration left existing create policies in place, but
-- some environments are missing them after the admin role migration. This
-- explicitly restores the INSERT permissions that the checkout page relies on.

drop policy if exists "Public can create orders" on public.orders;
create policy "Public can create orders"
  on public.orders for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Public can create order items" on public.order_items;
create policy "Public can create order items"
  on public.order_items for insert
  to anon, authenticated
  with check (true);
