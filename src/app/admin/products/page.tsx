"use client";

import { useEffect, useState, Fragment } from "react";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { supabaseGet, supabaseInsert, supabaseUpdate, supabaseDelete } from "@/lib/supabase/rest";
import { MOCK_PRODUCTS_RAW, MOCK_VARIANTS, MOCK_CATEGORIES, MOCK_INGREDIENTS, MOCK_PRODUCT_INGREDIENTS } from "@/lib/mock-data";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Tables } from "@/types/database";
import { estimateCaloriesPer100g } from "@/lib/ingredient-calories";
import {
  Pencil,
  Trash2,
  Plus,
  Loader2,
  ChevronDown,
  ChevronRight,
  Sparkles,
} from "lucide-react";

type Category = Tables<"categories">;
type Product = Tables<"products">;
type Variant = Tables<"product_variants">;
type Ingredient = Tables<"ingredients">;

export default function ProductsPage() {
  const [products, setProducts] = useState<
    (Product & { category: Category | null; variants: Variant[]; ingredient_ids: string[] })[]
  >([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);

  // Product dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    category_id: "",
    calories: "",
    image_url: "",
    is_available: true,
  });
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);

  // Expanded rows
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  // Variant dialog
  const [variantDialogOpen, setVariantDialogOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<Variant | null>(null);
  const [variantProductId, setVariantProductId] = useState<string>("");
  const [variantForm, setVariantForm] = useState({
    label: "",
    weight_grams: "",
    price: "",
    stock: "",
  });
  const [savingVariant, setSavingVariant] = useState(false);

  async function fetchProducts() {
    if (!isSupabaseConfigured()) {
      const piMap = new Map<string, string[]>();
      MOCK_PRODUCT_INGREDIENTS.forEach((pi) => {
        const list = piMap.get(pi.product_id) ?? [];
        list.push(pi.ingredient_id);
        piMap.set(pi.product_id, list);
      });
      setProducts(
        MOCK_PRODUCTS_RAW.map((p) => ({
          ...p,
          category: MOCK_CATEGORIES.find((c) => c.id === p.category_id) ?? null,
          variants: MOCK_VARIANTS.filter((v) => v.product_id === p.id),
          ingredient_ids: piMap.get(p.id) ?? [],
        }))
      );
      setCategories(MOCK_CATEGORIES);
      setIngredients(MOCK_INGREDIENTS);
      setLoading(false);
      return;
    }

    try {
      const [prodRes, varRes, catRes, ingRes, piRes] = await Promise.all([
        supabaseGet<Product>("products", "select=*&order=name"),
        supabaseGet<Variant>("product_variants", "select=*"),
        supabaseGet<Category>("categories", "select=*&order=name"),
        supabaseGet<Ingredient>("ingredients", "select=*&order=name"),
        supabaseGet<{ product_id: string; ingredient_id: string }>("product_ingredients", "select=*"),
      ]);

      if (prodRes.error) {
        toast.error(prodRes.error ?? "Failed to load products");
        setLoading(false);
        return;
      }

      const catMap = new Map((catRes.data ?? []).map((c) => [c.id, c]));
      const varMap = new Map<string, Variant[]>();
      (varRes.data ?? []).forEach((v) => {
        const list = varMap.get(v.product_id) ?? [];
        list.push(v);
        varMap.set(v.product_id, list);
      });
      const piMap = new Map<string, string[]>();
      (piRes.data ?? []).forEach((pi) => {
        const list = piMap.get(pi.product_id) ?? [];
        list.push(pi.ingredient_id);
        piMap.set(pi.product_id, list);
      });

      setProducts(
        (prodRes.data ?? []).map((p) => ({
          ...p,
          category: catMap.get(p.category_id) ?? null,
          variants: varMap.get(p.id) ?? [],
          ingredient_ids: piMap.get(p.id) ?? [],
        }))
      );
      setCategories(catRes.data ?? []);
      setIngredients(ingRes.data ?? []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to connect to database");
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // --- Product CRUD ---

  function openAddProduct() {
    setEditing(null);
    setForm({
      name: "",
      description: "",
      category_id: categories[0]?.id ?? "",
      calories: "",
      image_url: "",
      is_available: true,
    });
    setSelectedIngredients([]);
    setDialogOpen(true);
  }

  function openEditProduct(p: (typeof products)[0]) {
    setEditing(p);
    setForm({
      name: p.name,
      description: p.description ?? "",
      category_id: p.category_id,
      calories: p.calories?.toString() ?? "",
      image_url: p.image_url ?? "",
      is_available: p.is_available,
    });
    setSelectedIngredients(p.ingredient_ids);
    setDialogOpen(true);
  }

  async function handleSaveProduct() {
    if (!form.name.trim() || !form.category_id) {
      toast.error("Name and category are required");
      return;
    }
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      category_id: form.category_id,
      calories: form.calories ? Number.parseInt(form.calories) : null,
      image_url: form.image_url.trim() || null,
      is_available: form.is_available,
    };

    let productId = editing?.id;

    if (editing) {
      const { error } = await supabaseUpdate("products", `id=eq.${editing.id}`, payload);
      if (error) {
        toast.error("Failed to update product");
        setSaving(false);
        return;
      }
    } else {
      const { data, error } = await supabaseInsert<Product>("products", payload);
      if (error || !data?.length) {
        toast.error("Failed to create product");
        setSaving(false);
        return;
      }
      productId = data[0].id;
    }

    // Sync ingredients
    if (productId) {
      await supabaseDelete("product_ingredients", `product_id=eq.${productId}`);
      if (selectedIngredients.length > 0) {
        await supabaseInsert("product_ingredients",
          selectedIngredients.map((ingredient_id) => ({
            product_id: productId,
            ingredient_id,
          }))
        );
      }
    }

    toast.success(editing ? "Product updated" : "Product created");
    setSaving(false);
    setDialogOpen(false);
    fetchProducts();
  }

  async function handleDeleteProduct(id: string) {
    if (!confirm("Are you sure you want to delete this product?")) return;
    const { error } = await supabaseDelete("products", `id=eq.${id}`);
    if (error) {
      toast.error("Failed to delete product");
      return;
    }
    toast.success("Product deleted");
    fetchProducts();
  }

  // --- Variant CRUD ---

  function openAddVariant(productId: string) {
    setEditingVariant(null);
    setVariantProductId(productId);
    setVariantForm({ label: "", weight_grams: "", price: "", stock: "0" });
    setVariantDialogOpen(true);
  }

  function openEditVariant(v: Variant) {
    setEditingVariant(v);
    setVariantProductId(v.product_id);
    setVariantForm({
      label: v.label,
      weight_grams: v.weight_grams.toString(),
      price: v.price.toString(),
      stock: v.stock.toString(),
    });
    setVariantDialogOpen(true);
  }

  async function handleSaveVariant() {
    if (!variantForm.label.trim() || !variantForm.price) {
      toast.error("Label and price are required");
      return;
    }
    setSavingVariant(true);
    const payload = {
      product_id: variantProductId,
      label: variantForm.label.trim(),
      weight_grams: Number.parseInt(variantForm.weight_grams) || 0,
      price: Number.parseFloat(variantForm.price),
      stock: Number.parseInt(variantForm.stock) || 0,
    };

    if (editingVariant) {
      const { error } = await supabaseUpdate("product_variants", `id=eq.${editingVariant.id}`, payload);
      if (error) {
        toast.error("Failed to update variant");
        setSavingVariant(false);
        return;
      }
      toast.success("Variant updated");
    } else {
      const { error } = await supabaseInsert("product_variants", payload);
      if (error) {
        toast.error("Failed to create variant");
        setSavingVariant(false);
        return;
      }
      toast.success("Variant created");
    }
    setSavingVariant(false);
    setVariantDialogOpen(false);
    fetchProducts();
  }

  async function handleDeleteVariant(id: string) {
    if (!confirm("Delete this variant?")) return;
    const { error } = await supabaseDelete("product_variants", `id=eq.${id}`);
    if (error) {
      toast.error("Failed to delete variant");
      return;
    }
    toast.success("Variant deleted");
    fetchProducts();
  }

  function recalcCalories(ingredientIds: string[]) {
    const names = ingredientIds
      .map((iid) => ingredients.find((i) => i.id === iid)?.name)
      .filter(Boolean) as string[];
    const estimate = estimateCaloriesPer100g(names);
    if (estimate > 0) {
      setForm((f) => ({ ...f, calories: estimate.toString() }));
    }
  }

  function toggleIngredient(id: string) {
    setSelectedIngredients((prev) => {
      const next = prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id];
      recalcCalories(next);
      return next;
    });
  }

  function priceRange(variants: Variant[]) {
    if (variants.length === 0) return "—";
    const prices = variants.map((v) => v.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return min === max ? `₹${min}` : `₹${min} – ₹${max}`;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products</h1>
        <Button onClick={openAddProduct}>
          <Plus className="mr-2 size-4" />
          Add Product
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8" />
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price Range</TableHead>
              <TableHead>Calories</TableHead>
              <TableHead>Available</TableHead>
              <TableHead className="w-[120px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No products found
                </TableCell>
              </TableRow>
            ) : (
              products.map((p) => {
                const isExpanded = expanded.has(p.id);
                return (
                  <Fragment key={p.id}>
                    <TableRow className="cursor-pointer" onClick={() => toggleExpand(p.id)}>
                      <TableCell>
                        {isExpanded ? (
                          <ChevronDown className="size-4" />
                        ) : (
                          <ChevronRight className="size-4" />
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell>{p.category?.name ?? "—"}</TableCell>
                      <TableCell>{priceRange(p.variants)}</TableCell>
                      <TableCell>{p.calories ?? "—"}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                            p.is_available
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {p.is_available ? "Yes" : "No"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); openEditProduct(p); }}>
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => { e.stopPropagation(); handleDeleteProduct(p.id); }}
                          >
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>

                    {isExpanded && (
                      <TableRow>
                        <TableCell colSpan={7} className="bg-muted/30 p-4">
                          <div className="space-y-4">
                            {/* Variants */}
                            <div>
                              <div className="mb-2 flex items-center justify-between">
                                <h4 className="text-sm font-semibold">Variants</h4>
                                <Button size="sm" variant="outline" onClick={() => openAddVariant(p.id)}>
                                  <Plus className="mr-1 size-3" />
                                  Add Variant
                                </Button>
                              </div>
                              {p.variants.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No variants</p>
                              ) : (
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Label</TableHead>
                                      <TableHead>Weight (g)</TableHead>
                                      <TableHead>Price</TableHead>
                                      <TableHead>Stock</TableHead>
                                      <TableHead className="w-[100px]">Actions</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {p.variants.map((v) => (
                                      <TableRow key={v.id}>
                                        <TableCell>{v.label}</TableCell>
                                        <TableCell>{v.weight_grams}g</TableCell>
                                        <TableCell>₹{v.price}</TableCell>
                                        <TableCell>{v.stock}</TableCell>
                                        <TableCell>
                                          <div className="flex items-center gap-1">
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              onClick={() => openEditVariant(v)}
                                            >
                                              <Pencil className="size-3" />
                                            </Button>
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              onClick={() => handleDeleteVariant(v.id)}
                                            >
                                              <Trash2 className="size-3 text-destructive" />
                                            </Button>
                                          </div>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              )}
                            </div>

                            {/* Ingredients */}
                            <div>
                              <h4 className="mb-2 text-sm font-semibold">Ingredients</h4>
                              <div className="flex flex-wrap gap-1">
                                {p.ingredient_ids.length === 0 ? (
                                  <p className="text-sm text-muted-foreground">No ingredients linked</p>
                                ) : (
                                  p.ingredient_ids.map((iid) => {
                                    const ing = ingredients.find((i) => i.id === iid);
                                    return (
                                      <span
                                        key={iid}
                                        className={`rounded-full px-2 py-0.5 text-xs ${
                                          ing?.is_allergen
                                            ? "bg-orange-100 text-orange-700"
                                            : "bg-muted text-muted-foreground"
                                        }`}
                                      >
                                        {ing?.name ?? iid}
                                        {ing?.is_allergen && " ⚠"}
                                      </span>
                                    );
                                  })
                                )}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Product Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Product" : "Add Product"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="p-name">Name</Label>
              <Input
                id="p-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-desc">Description</Label>
              <Input
                id="p-desc"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={form.category_id}
                onValueChange={(v) => setForm({ ...form, category_id: v })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-cal">Calories (per 100g)</Label>
              <Input
                id="p-cal"
                type="number"
                value={form.calories}
                onChange={(e) => setForm({ ...form, calories: e.target.value })}
              />
              {selectedIngredients.length > 0 && (
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Sparkles className="size-3" />
                  Auto-estimated from ingredients. You can override.
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-img">Image URL</Label>
              <Input
                id="p-img"
                value={form.image_url}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="p-avail"
                checked={form.is_available}
                onCheckedChange={(checked) =>
                  setForm({ ...form, is_available: checked === true })
                }
              />
              <Label htmlFor="p-avail">Available</Label>
            </div>

            {/* Ingredients multi-select */}
            <div className="space-y-2">
              <Label>Ingredients</Label>
              <div className="max-h-40 space-y-1 overflow-y-auto rounded-md border p-2">
                {ingredients.map((ing) => (
                  <div key={ing.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`ing-${ing.id}`}
                      checked={selectedIngredients.includes(ing.id)}
                      onCheckedChange={() => toggleIngredient(ing.id)}
                    />
                    <Label htmlFor={`ing-${ing.id}`} className="text-sm font-normal">
                      {ing.name}
                      {ing.is_allergen && (
                        <span className="ml-1 text-orange-600">(allergen)</span>
                      )}
                    </Label>
                  </div>
                ))}
                {ingredients.length === 0 && (
                  <p className="text-sm text-muted-foreground">No ingredients available</p>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveProduct} disabled={saving}>
              {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
              {editing ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Variant Dialog */}
      <Dialog open={variantDialogOpen} onOpenChange={setVariantDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingVariant ? "Edit Variant" : "Add Variant"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="v-label">Label</Label>
              <Input
                id="v-label"
                value={variantForm.label}
                onChange={(e) =>
                  setVariantForm({ ...variantForm, label: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="v-weight">Weight (grams)</Label>
              <Input
                id="v-weight"
                type="number"
                value={variantForm.weight_grams}
                onChange={(e) =>
                  setVariantForm({ ...variantForm, weight_grams: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="v-price">Price</Label>
              <Input
                id="v-price"
                type="number"
                value={variantForm.price}
                onChange={(e) =>
                  setVariantForm({ ...variantForm, price: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="v-stock">Stock</Label>
              <Input
                id="v-stock"
                type="number"
                value={variantForm.stock}
                onChange={(e) =>
                  setVariantForm({ ...variantForm, stock: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVariantDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveVariant} disabled={savingVariant}>
              {savingVariant && <Loader2 className="mr-2 size-4 animate-spin" />}
              {editingVariant ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

