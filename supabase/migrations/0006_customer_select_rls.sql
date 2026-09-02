-- Fix authenticated customer read access for the storefront.
-- 0004 removed the broad authenticated SELECT policies on products/variants/colors
-- but the 0001 "Public" policies only applied to anon, so logged-in customers
-- lost the ability to view the product catalog. This restores that access.

drop policy if exists "Customers can view active products" on public.products;
create policy "Customers can view active products"
  on public.products for select
  to authenticated
  using (status = 'active');

drop policy if exists "Customers can view variants of active products" on public.product_variants;
create policy "Customers can view variants of active products"
  on public.product_variants for select
  to authenticated
  using (
    exists (
      select 1
      from public.products
      where products.id = product_variants.product_id
        and products.status = 'active'
    )
  );

drop policy if exists "Customers can view colors of active product variants" on public.variant_colors;
create policy "Customers can view colors of active product variants"
  on public.variant_colors for select
  to authenticated
  using (
    exists (
      select 1
      from public.product_variants
      join public.products on products.id = product_variants.product_id
      where product_variants.id = variant_colors.variant_id
        and products.status = 'active'
    )
  );
