"use client";

import { useEffect, useState } from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { MOCK_CATERING_ADDONS } from "@/lib/mock-data";
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
import type { Tables } from "@/types/database";
import { Pencil, Trash2, Plus, Loader2 } from "lucide-react";

type Addon = Tables<"catering_addons">;

export default function CateringAddonsPage() {
  const supabase = createClient();
  const [addons, setAddons] = useState<Addon[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Addon | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    addon_type: "",
    price: "",
    description: "",
  });

  async function fetchAddons() {
    if (!isSupabaseConfigured()) {
      setAddons(MOCK_CATERING_ADDONS);
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from("catering_addons")
      .select("*")
      .order("addon_type")
      .order("name");
    if (error) {
      toast.error("Failed to load add-ons");
      setLoading(false);
      return;
    }
    setAddons(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    fetchAddons();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openAdd() {
    setEditing(null);
    setForm({ name: "", addon_type: "", price: "", description: "" });
    setDialogOpen(true);
  }

  function openEdit(addon: Addon) {
    setEditing(addon);
    setForm({
      name: addon.name,
      addon_type: addon.addon_type,
      price: addon.price.toString(),
      description: addon.description ?? "",
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.name.trim() || !form.addon_type.trim() || !form.price) {
      toast.error("Name, type, and price are required");
      return;
    }
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      addon_type: form.addon_type.trim(),
      price: Number.parseFloat(form.price),
      description: form.description.trim() || null,
    };

    if (editing) {
      const { error } = await supabase
        .from("catering_addons")
        .update(payload)
        .eq("id", editing.id);
      if (error) {
        toast.error("Failed to update add-on");
        setSaving(false);
        return;
      }
      toast.success("Add-on updated");
    } else {
      const { error } = await supabase.from("catering_addons").insert(payload);
      if (error) {
        toast.error("Failed to create add-on");
        setSaving(false);
        return;
      }
      toast.success("Add-on created");
    }
    setSaving(false);
    setDialogOpen(false);
    fetchAddons();
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this add-on?")) return;
    const { error } = await supabase
      .from("catering_addons")
      .delete()
      .eq("id", id);
    if (error) {
      toast.error("Failed to delete add-on");
      return;
    }
    toast.success("Add-on deleted");
    fetchAddons();
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
        <h1 className="text-2xl font-bold">Catering Add-ons</h1>
        <Button onClick={openAdd}>
          <Plus className="mr-2 size-4" />
          Add Add-on
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-[120px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {addons.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No add-ons found
                </TableCell>
              </TableRow>
            ) : (
              addons.map((addon) => (
                <TableRow key={addon.id}>
                  <TableCell className="font-medium">{addon.name}</TableCell>
                  <TableCell>{addon.addon_type}</TableCell>
                  <TableCell>₹{addon.price}</TableCell>
                  <TableCell className="max-w-xs truncate text-muted-foreground">
                    {addon.description || "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(addon)}>
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(addon.id)}
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Add-on" : "Add Add-on"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="a-name">Name</Label>
              <Input
                id="a-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="a-type">Type</Label>
              <Input
                id="a-type"
                value={form.addon_type}
                onChange={(e) =>
                  setForm({ ...form, addon_type: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="a-price">Price</Label>
              <Input
                id="a-price"
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="a-desc">Description</Label>
              <Input
                id="a-desc"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
              {editing ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
