import { createClient } from "@/lib/supabase/server";
import { ProductWizard } from "../product-wizard";

export default async function NewProductPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .order("sort_order");

  return <ProductWizard categories={categories ?? []} />;
}
