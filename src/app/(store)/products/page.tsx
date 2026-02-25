"use client";

import { useEffect, useState, useMemo } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ProductCard } from "@/components/store/product-card";
import type { Product, Tables } from "@/types/database";

type SortOption = "price_asc" | "price_desc" | "name_asc" | "newest";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Tables<"categories">[]>([]);
  const [allIngredients, setAllIngredients] = useState<Tables<"ingredients">[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [allergenFreeOnly, setAllergenFreeOnly] = useState(false);
  const [sort, setSort] = useState<SortOption>("newest");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const supabase = createClient();

        const [
          productsRes,
          categoriesRes,
          variantsRes,
          ingredientsRes,
          productIngredientsRes,
        ] = await Promise.all([
          supabase.from("products").select("*").eq("is_available", true),
          supabase.from("categories").select("*"),
          supabase.from("product_variants").select("*"),
          supabase.from("ingredients").select("*"),
          supabase.from("product_ingredients").select("*"),
        ]);

        const rawProducts = productsRes.data ?? [];
        const cats = categoriesRes.data ?? [];
        const variants = variantsRes.data ?? [];
        const ings = ingredientsRes.data ?? [];
        const prodIngs = productIngredientsRes.data ?? [];

        if (rawProducts.length > 0) {
          const joined: Product[] = rawProducts.map((p) => ({
            ...p,
            category: cats.find((c: Tables<"categories"> ) => c.id === p.category_id),
            variants: variants.filter((v: Tables<"product_variants">) => v.product_id === p.id),
            ingredients: prodIngs
              .filter((pi: { product_id: string; ingredient_id: string }) => pi.product_id === p.id)
              .map((pi: { product_id: string; ingredient_id: string }) => ings.find((i: Tables<"ingredients">) => i.id === pi.ingredient_id)!)
              .filter(Boolean),
          }));

          setProducts(joined);
          setCategories(cats);
          setAllIngredients(ings);
          setLoading(false);
          return;
        }
      } catch {
        // Supabase not configured, fall through to mock data
      }

      const { MOCK_PRODUCTS, MOCK_CATEGORIES, MOCK_INGREDIENTS } = await import("@/lib/mock-data");
      setProducts(MOCK_PRODUCTS);
      setCategories(MOCK_CATEGORIES);
      setAllIngredients(MOCK_INGREDIENTS);
      setLoading(false);
    }

    fetchData();
  }, []);

  const filtered = useMemo(() => {
    let result = [...products];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.category?.name.toLowerCase().includes(q)
      );
    }

    if (selectedCategories.length > 0) {
      result = result.filter((p) =>
        selectedCategories.includes(p.category_id)
      );
    }

    if (selectedIngredients.length > 0) {
      result = result.filter((p) =>
        selectedIngredients.every((ingId) =>
          p.ingredients?.some((i) => i.id === ingId)
        )
      );
    }

    if (allergenFreeOnly) {
      result = result.filter(
        (p) => !p.ingredients?.some((i) => i.is_allergen)
      );
    }

    switch (sort) {
      case "price_asc":
        result.sort((a, b) => {
          const aMin = Math.min(...(a.variants?.map((v) => v.price) ?? [Infinity]));
          const bMin = Math.min(...(b.variants?.map((v) => v.price) ?? [Infinity]));
          return aMin - bMin;
        });
        break;
      case "price_desc":
        result.sort((a, b) => {
          const aMax = Math.max(...(a.variants?.map((v) => v.price) ?? [0]));
          const bMax = Math.max(...(b.variants?.map((v) => v.price) ?? [0]));
          return bMax - aMax;
        });
        break;
      case "name_asc":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "newest":
        result.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
    }

    return result;
  }, [products, search, selectedCategories, selectedIngredients, allergenFreeOnly, sort]);

  function toggleCategory(id: string) {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  function toggleIngredient(id: string) {
    setSelectedIngredients((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }

  function clearFilters() {
    setSearch("");
    setSelectedCategories([]);
    setSelectedIngredients([]);
    setAllergenFreeOnly(false);
    setSort("newest");
  }

  const hasActiveFilters =
    search.trim() !== "" ||
    selectedCategories.length > 0 ||
    selectedIngredients.length > 0 ||
    allergenFreeOnly;

  const filterContent = (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Categories
        </h3>
        <div className="space-y-2">
          {categories.map((cat) => (
            <label
              key={cat.id}
              className="flex cursor-pointer items-center gap-2"
            >
              <Checkbox
                checked={selectedCategories.includes(cat.id)}
                onCheckedChange={() => toggleCategory(cat.id)}
              />
              <span className="text-sm">{cat.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Allergen-free toggle */}
      <div>
        <label className="flex cursor-pointer items-center gap-2">
          <Checkbox
            checked={allergenFreeOnly}
            onCheckedChange={(checked) =>
              setAllergenFreeOnly(checked === true)
            }
          />
          <span className="text-sm font-medium">Allergen-free only</span>
        </label>
      </div>

      {/* Ingredients */}
      {allIngredients.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Ingredients
          </h3>
          <div className="space-y-2">
            {allIngredients.map((ing) => (
              <label
                key={ing.id}
                className="flex cursor-pointer items-center gap-2"
              >
                <Checkbox
                  checked={selectedIngredients.includes(ing.id)}
                  onCheckedChange={() => toggleIngredient(ing.id)}
                />
                <span className="text-sm">{ing.name}</span>
                {ing.is_allergen && (
                  <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                    Allergen
                  </Badge>
                )}
              </label>
            ))}
          </div>
        </div>
      )}

      {hasActiveFilters && (
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={clearFilters}
        >
          <X className="mr-2 size-3" />
          Clear All Filters
        </Button>
      )}
    </div>
  );

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Our Products</h1>
        <p className="mt-2 text-muted-foreground">
          Browse our full collection of premium sweets and treats
        </p>
      </div>

      {/* Search & Sort Bar */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-md">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-3">
          {/* Mobile filter trigger */}
          <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="lg:hidden">
                <SlidersHorizontal className="mr-2 size-4" />
                Filters
                {hasActiveFilters && (
                  <Badge className="ml-2 size-5 items-center justify-center rounded-full p-0 text-[10px]">
                    !
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="px-4 pb-4">{filterContent}</div>
            </SheetContent>
          </Sheet>

          <div className="flex items-center gap-2">
            <Label htmlFor="sort" className="shrink-0 text-sm text-muted-foreground">
              Sort by
            </Label>
            <Select
              value={sort}
              onValueChange={(val) => setSort(val as SortOption)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price_asc">Price: Low to High</SelectItem>
                <SelectItem value="price_desc">Price: High to Low</SelectItem>
                <SelectItem value="name_asc">Name A–Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-8">{filterContent}</div>
        </aside>

        {/* Product Grid */}
        <div className="min-w-0 flex-1">
          {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-[3/4] animate-pulse rounded-xl bg-muted"
                />
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <>
              <p className="mb-4 text-sm text-muted-foreground">
                {filtered.length} product{filtered.length !== 1 && "s"} found
              </p>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="flex size-16 items-center justify-center rounded-full bg-muted">
                <Search className="size-6 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">No products found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Try adjusting your search or filter criteria
              </p>
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={clearFilters}
                >
                  Clear All Filters
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
