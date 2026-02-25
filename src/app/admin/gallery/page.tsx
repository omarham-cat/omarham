"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { GALLERY_CATEGORIES, DEFAULT_IMAGES } from "@/store/gallery-store";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import {
  supabaseGet,
  supabaseInsert,
  supabaseUpdate,
  supabaseDelete,
} from "@/lib/supabase/rest";
import {
  Pencil,
  Trash2,
  Plus,
  ArrowUp,
  ArrowDown,
  Loader2,
} from "lucide-react";

interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  category: string;
  sort_order: number;
}

export default function AdminGalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<GalleryImage | null>(null);
  const [filterCat, setFilterCat] = useState("all");

  const [form, setForm] = useState({
    src: "",
    alt: "",
    category: GALLERY_CATEGORIES[0],
  });

  const fetchImages = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setImages(
        DEFAULT_IMAGES.map((img, i) => ({ ...img, sort_order: i }))
      );
      setLoading(false);
      return;
    }
    const { data, error } = await supabaseGet<GalleryImage>(
      "gallery_images",
      "select=*&order=sort_order"
    );
    if (error) {
      toast.error("Failed to load gallery images");
      setImages(
        DEFAULT_IMAGES.map((img, i) => ({ ...img, sort_order: i }))
      );
    } else {
      setImages(data ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const filtered =
    filterCat === "all"
      ? images
      : images.filter((img) => img.category === filterCat);

  function openAdd() {
    setEditing(null);
    setForm({ src: "", alt: "", category: GALLERY_CATEGORIES[0] });
    setDialogOpen(true);
  }

  function openEdit(img: GalleryImage) {
    setEditing(img);
    setForm({ src: img.src, alt: img.alt, category: img.category });
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.src.trim() || !form.alt.trim()) {
      toast.error("Image URL and description are required");
      return;
    }
    setSaving(true);
    if (editing) {
      const { error } = await supabaseUpdate(
        "gallery_images",
        `id=eq.${editing.id}`,
        { src: form.src, alt: form.alt, category: form.category }
      );
      if (error) {
        toast.error("Failed to update image");
      } else {
        toast.success("Image updated");
        setDialogOpen(false);
        await fetchImages();
      }
    } else {
      const maxOrder = images.reduce(
        (max, img) => Math.max(max, img.sort_order),
        -1
      );
      const { error } = await supabaseInsert("gallery_images", {
        src: form.src,
        alt: form.alt,
        category: form.category,
        sort_order: maxOrder + 1,
      });
      if (error) {
        toast.error("Failed to add image");
      } else {
        toast.success("Image added");
        setDialogOpen(false);
        await fetchImages();
      }
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this image?")) return;
    setSaving(true);
    const { error } = await supabaseDelete("gallery_images", `id=eq.${id}`);
    if (error) {
      toast.error("Failed to delete image");
    } else {
      toast.success("Image deleted");
      await fetchImages();
    }
    setSaving(false);
  }

  async function handleReorder(id: string, direction: "up" | "down") {
    const idx = images.findIndex((img) => img.id === id);
    if (idx < 0) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= images.length) return;

    const current = images[idx];
    const neighbor = images[swapIdx];

    setSaving(true);
    const [r1, r2] = await Promise.all([
      supabaseUpdate("gallery_images", `id=eq.${current.id}`, {
        sort_order: neighbor.sort_order,
      }),
      supabaseUpdate("gallery_images", `id=eq.${neighbor.id}`, {
        sort_order: current.sort_order,
      }),
    ]);
    if (r1.error || r2.error) {
      toast.error("Failed to reorder");
    } else {
      await fetchImages();
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Gallery</h1>
        <div className="flex items-center gap-2">
          <Select value={filterCat} onValueChange={setFilterCat}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {GALLERY_CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={openAdd} disabled={saving}>
            <Plus className="mr-2 size-4" />
            Add Image
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Preview</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="w-[100px]">Order</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-muted-foreground"
                >
                  No images found
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((img) => (
                <TableRow key={img.id}>
                  <TableCell>
                    <div className="relative size-14 overflow-hidden rounded-md bg-muted">
                      <Image
                        src={img.src}
                        alt={img.alt}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="max-w-xs truncate text-sm font-medium">
                      {img.alt}
                    </p>
                    <p className="max-w-xs truncate text-xs text-muted-foreground">
                      {img.src}
                    </p>
                  </TableCell>
                  <TableCell>
                    <span className="rounded-full bg-[#0d4f4f]/10 px-2 py-0.5 text-xs font-medium text-[#a67d30]">
                      {img.category}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        disabled={saving}
                        onClick={() => handleReorder(img.id, "up")}
                      >
                        <ArrowUp className="size-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        disabled={saving}
                        onClick={() => handleReorder(img.id, "down")}
                      >
                        <ArrowDown className="size-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(img)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={saving}
                        onClick={() => handleDelete(img.id)}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <p className="mt-3 text-sm text-muted-foreground">
        {images.length} image{images.length !== 1 && "s"} total
      </p>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Image" : "Add Image"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="img-src">Image URL</Label>
              <Input
                id="img-src"
                placeholder="https://..."
                value={form.src}
                onChange={(e) => setForm({ ...form, src: e.target.value })}
              />
              {form.src && (
                <div className="relative h-32 w-full overflow-hidden rounded-md bg-muted">
                  <Image
                    src={form.src}
                    alt="Preview"
                    fill
                    className="object-contain"
                    sizes="400px"
                  />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="img-alt">Description / Alt Text</Label>
              <Input
                id="img-alt"
                value={form.alt}
                onChange={(e) => setForm({ ...form, alt: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm({ ...form, category: v })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GALLERY_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
              {editing ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
