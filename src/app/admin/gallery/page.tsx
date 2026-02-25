"use client";

import { useState } from "react";
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
import {
  useGalleryStore,
  GALLERY_CATEGORIES,
  type GalleryImage,
} from "@/store/gallery-store";
import {
  Pencil,
  Trash2,
  Plus,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

export default function AdminGalleryPage() {
  const { images, addImage, updateImage, deleteImage, reorderImage } =
    useGalleryStore();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<GalleryImage | null>(null);
  const [filterCat, setFilterCat] = useState("all");

  const [form, setForm] = useState({
    src: "",
    alt: "",
    category: GALLERY_CATEGORIES[0],
  });

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

  function handleSave() {
    if (!form.src.trim() || !form.alt.trim()) {
      toast.error("Image URL and description are required");
      return;
    }
    if (editing) {
      updateImage(editing.id, form);
      toast.success("Image updated");
    } else {
      addImage(form);
      toast.success("Image added");
    }
    setDialogOpen(false);
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this image?")) return;
    deleteImage(id);
    toast.success("Image deleted");
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
          <Button onClick={openAdd}>
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
                        onClick={() => reorderImage(img.id, "up")}
                      >
                        <ArrowUp className="size-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        onClick={() => reorderImage(img.id, "down")}
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
            <Button onClick={handleSave}>
              {editing ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
