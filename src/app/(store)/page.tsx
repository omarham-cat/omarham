import { createClient } from "@/lib/supabase/server";
import type { Product, Tables } from "@/types/database";
import { MOCK_CATEGORIES, MOCK_PRODUCTS } from "@/lib/mock-data";
import { HomeContent } from "@/components/store/home-content";

export default async function HomePage() {
  let categories: Tables<"categories">[] = [];
  let featuredProducts: Product[] = [];

  try {
    const supabase = await createClient();

    const [categoriesResult, productsResult, variantsResult] = await Promise.all([
      supabase.from("categories").select("*"),
      supabase
        .from("products")
        .select("*")
        .eq("is_available", true)
        .order("created_at", { ascending: false })
        .limit(8),
      supabase.from("product_variants").select("*"),
    ]);

    const fetchedCategories = (categoriesResult.data ?? []) as Tables<"categories">[];
    const rawProducts = (productsResult.data ?? []) as Tables<"products">[];
    const variants = (variantsResult.data ?? []) as Tables<"product_variants">[];

    if (rawProducts.length > 0) {
      categories = fetchedCategories;
      featuredProducts = rawProducts.map((product) => ({
        ...product,
        category: fetchedCategories.find((c) => c.id === product.category_id),
        variants: variants.filter((v) => v.product_id === product.id),
      }));
    }
  } catch {
    // Supabase not configured
  }

  if (featuredProducts.length === 0) {
    categories = MOCK_CATEGORIES;
    featuredProducts = MOCK_PRODUCTS.slice(0, 8);
  }

  return (
    <HomeContent categories={categories} featuredProducts={featuredProducts} />
  );
}
