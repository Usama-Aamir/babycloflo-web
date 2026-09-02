-- Fix: ensure public INSERT policies for guest and customer checkout.
-- The checkout code generates the order id client-side (crypto.randomUUID())
-- and does NOT use .select() on insert, so no SELECT policy is needed for
-- anon/authenticated on the orders table. This avoids exposing other guests'
-- orders to anonymous visitors.

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
