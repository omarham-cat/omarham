"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Flame, Minus, Plus, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

import { supabaseGet } from "@/lib/supabase/rest";
import { useCartStore } from "@/store/cart-store";
import type { Tables } from "@/types/database";
import { MOCK_PRODUCTS, MOCK_VARIANTS, MOCK_INGREDIENTS, MOCK_PRODUCT_INGREDIENTS } from "@/lib/mock-data";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

type Product = Tables<"products"> & {
  category: Tables<"categories"> | null;
};
type Variant = Tables<"product_variants">;
type Ingredient = Tables<"ingredients">;

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const addItem = useCartStore((s) => s.addItem);

  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    async function fetchProduct() {
      setLoading(true);

      try {
        const [productRes, variantsRes, prodIngredientsRes] = await Promise.all([
          supabaseGet<Tables<"products">>("products", `select=*&id=eq.${id}`),
          supabaseGet<Variant>("product_variants", `select=*&product_id=eq.${id}&order=price`),
          supabaseGet<{ ingredient_id: string }>("product_ingredients", `select=ingredient_id&product_id=eq.${id}`),
        ]);

        const rawProduct = productRes.data?.[0];
        if (rawProduct) {
          let category: Tables<"categories"> | null = null;
          if (rawProduct.category_id) {
            const catRes = await supabaseGet<Tables<"categories">>("categories", `select=*&id=eq.${rawProduct.category_id}`);
            category = catRes.data?.[0] ?? null;
          }
          setProduct({ ...rawProduct, category } as Product);
          if (variantsRes.data) {
            setVariants(variantsRes.data);
            if (variantsRes.data.length > 0) setSelectedVariant(variantsRes.data[0]);
          }
          if (prodIngredientsRes.data && prodIngredientsRes.data.length > 0) {
            const ingredientIds = prodIngredientsRes.data.map((pi) => pi.ingredient_id);
            const { data: ingredientsData } = await supabaseGet<Ingredient>(
              "ingredients",
              `select=*&id=in.(${ingredientIds.join(",")})`
            );
            if (ingredientsData) setIngredients(ingredientsData);
          }
          setLoading(false);
          return;
        }
      } catch {
        // Supabase not configured
      }

      const mockProduct = MOCK_PRODUCTS.find((p) => p.id === id);
      if (mockProduct) {
        setProduct({ ...mockProduct, category: mockProduct.category ?? null } as Product);
        const mockVariants = MOCK_VARIANTS.filter((v) => v.product_id === id);
        setVariants(mockVariants);
        if (mockVariants.length > 0) setSelectedVariant(mockVariants[0]);
        const mockIngIds = MOCK_PRODUCT_INGREDIENTS.filter((pi) => pi.product_id === id).map((pi) => pi.ingredient_id);
        setIngredients(MOCK_INGREDIENTS.filter((i) => mockIngIds.includes(i.id)));
      }
      setLoading(false);
    }

    fetchProduct();
  }, [id]);

  function handleAddToCart() {
    if (!product || !selectedVariant) return;

    addItem(
      {
        productId: product.id,
        variantId: selectedVariant.id,
        productName: product.name,
        variantLabel: selectedVariant.label,
        price: selectedVariant.price,
        imageUrl: product.image_url,
      },
      quantity
    );

    toast.success(`${product.name} added to cart`, {
      description: `${selectedVariant.label} × ${quantity}`,
    });
  }

  if (loading) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4 py-12">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold">Product not found</h1>
        <Link href="/products" className="text-primary mt-4 inline-block underline">
          Back to products
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href="/products"
        className="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-1.5 text-sm transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to products
      </Link>

      <div className="mt-4 grid gap-8 md:grid-cols-2 lg:gap-12">
        {/* Image */}
        <div className="bg-muted flex aspect-square items-center justify-center overflow-hidden rounded-xl">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              width={600}
              height={600}
              className="h-full w-full object-cover"
              priority
            />
          ) : (
            <div className="text-muted-foreground flex flex-col items-center gap-2">
              <ShoppingCart className="size-16 opacity-30" />
              <span className="text-sm">No image available</span>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col gap-6">
          <div>
            {product.category && (
              <Badge variant="secondary" className="mb-2">
                {product.category.name}
              </Badge>
            )}
            <h1 className="text-3xl font-bold">{product.name}</h1>
            {product.description && (
              <p className="text-muted-foreground mt-2">{product.description}</p>
            )}
          </div>

          {product.calories != null && (
            <div className="text-muted-foreground flex items-center gap-1.5 text-sm">
              <Flame className="size-4 text-orange-500" />
              {product.calories} kcal
            </div>
          )}

          {/* Ingredients */}
          {ingredients.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-medium">Ingredients</h3>
              <div className="flex flex-wrap gap-1.5">
                {ingredients.map((ing) => (
                  <Badge
                    key={ing.id}
                    variant={ing.is_allergen ? "destructive" : "outline"}
                  >
                    {ing.name}
                    {ing.is_allergen && " ⚠"}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Variant Selector */}
          {variants.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-medium">Select Variant</h3>
              <RadioGroup
                value={selectedVariant?.id ?? ""}
                onValueChange={(val) => {
                  const v = variants.find((v) => v.id === val);
                  if (v) setSelectedVariant(v);
                }}
              >
                {variants.map((v) => (
                  <div key={v.id} className="flex items-center gap-3">
                    <RadioGroupItem value={v.id} id={`variant-${v.id}`} />
                    <Label
                      htmlFor={`variant-${v.id}`}
                      className="cursor-pointer"
                    >
                      {v.label} — {v.weight_grams}g — ₹{v.price}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          {/* Quantity Selector */}
          <div>
            <h3 className="mb-3 text-sm font-medium">Quantity</h3>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
              >
                <Minus className="size-4" />
              </Button>
              <span className="w-8 text-center text-lg font-semibold">
                {quantity}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                disabled={quantity >= 10}
              >
                <Plus className="size-4" />
              </Button>
            </div>
          </div>

          {/* Price & Add to Cart */}
          {selectedVariant && (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-2xl font-bold">
                ₹{selectedVariant.price * quantity}
              </div>
              <Button size="lg" onClick={handleAddToCart} className="gap-2">
                <ShoppingCart className="size-4" />
                Add to Cart
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
