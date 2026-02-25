"use client";

import { useEffect, useState } from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { MOCK_CATERING_MENU_ITEMS } from "@/lib/mock-data";
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
import { Pencil, Trash2, Plus, Loader2 } from "lucide-react";

type MenuItem = Tables<"catering_menu_items">;

const SERVICE_TIMES = ["breakfast", "lunch", "snacks", "dinner", "late_night"] as const;

const serviceTimeLabel: Record<string, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  snacks: "Snacks",
  dinner: "Dinner",
  late_night: "Late Night",
};

export default function CateringMenuPage() {
  const supabase = createClient();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [filterTime, setFilterTime] = useState<string>("all");

  const [form, setForm] = useState({
    name: "",
    category: "",
    service_time: "breakfast" as MenuItem["service_time"],
    price_per_person: "",
    description: "",
    is_available: true,
  });

  async function fetchItems() {
    if (!isSupabaseConfigured()) {
      setItems(MOCK_CATERING_MENU_ITEMS);
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from("catering_menu_items")
      .select("*")
      .order("service_time")
      .order("name");
    if (error) {
      toast.error("Failed to load menu items");
      setLoading(false);
      return;
    }
    setItems(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered =
    filterTime === "all"
      ? items
      : items.filter((i) => i.service_time === filterTime);

  function openAdd() {
    setEditing(null);
    setForm({
      name: "",
      category: "",
      service_time: "breakfast",
      price_per_person: "",
      description: "",
      is_available: true,
    });
    setDialogOpen(true);
  }

  function openEdit(item: MenuItem) {
    setEditing(item);
    setForm({
      name: item.name,
      category: item.category,
      service_time: item.service_time,
      price_per_person: item.price_per_person.toString(),
      description: item.description ?? "",
      is_available: item.is_available,
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.name.trim() || !form.price_per_person) {
      toast.error("Name and price are required");
      return;
    }
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      category: form.category.trim(),
      service_time: form.service_time,
      price_per_person: Number.parseFloat(form.price_per_person),
      description: form.description.trim() || null,
      is_available: form.is_available,
    };

    if (editing) {
      const { error } = await supabase
        .from("catering_menu_items")
        .update(payload)
        .eq("id", editing.id);
      if (error) {
        toast.error("Failed to update item");
        setSaving(false);
        return;
      }
      toast.success("Item updated");
    } else {
      const { error } = await supabase
        .from("catering_menu_items")
        .insert(payload);
      if (error) {
        toast.error("Failed to create item");
        setSaving(false);
        return;
      }
      toast.success("Item created");
    }
    setSaving(false);
    setDialogOpen(false);
    fetchItems();
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this menu item?")) return;
    const { error } = await supabase
      .from("catering_menu_items")
      .delete()
      .eq("id", id);
    if (error) {
      toast.error("Failed to delete item");
      return;
    }
    toast.success("Item deleted");
    fetchItems();
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
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Catering Menu</h1>
        <div className="flex items-center gap-2">
          <Select value={filterTime} onValueChange={setFilterTime}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filter by time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Times</SelectItem>
              {SERVICE_TIMES.map((t) => (
                <SelectItem key={t} value={t}>
                  {serviceTimeLabel[t]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={openAdd}>
            <Plus className="mr-2 size-4" />
            Add Item
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Service Time</TableHead>
              <TableHead>Price/Person</TableHead>
              <TableHead>Available</TableHead>
              <TableHead className="w-[120px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No menu items found
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>{serviceTimeLabel[item.service_time]}</TableCell>
                  <TableCell>₹{item.price_per_person}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                        item.is_available
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {item.is_available ? "Yes" : "No"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(item)}>
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(item.id)}
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
              {editing ? "Edit Menu Item" : "Add Menu Item"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="m-name">Name</Label>
              <Input
                id="m-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="m-cat">Category</Label>
              <Input
                id="m-cat"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Service Time</Label>
              <Select
                value={form.service_time}
                onValueChange={(v) =>
                  setForm({ ...form, service_time: v as MenuItem["service_time"] })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SERVICE_TIMES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {serviceTimeLabel[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="m-price">Price per Person</Label>
              <Input
                id="m-price"
                type="number"
                value={form.price_per_person}
                onChange={(e) =>
                  setForm({ ...form, price_per_person: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="m-desc">Description</Label>
              <Input
                id="m-desc"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="m-avail"
                checked={form.is_available}
                onCheckedChange={(checked) =>
                  setForm({ ...form, is_available: checked === true })
                }
              />
              <Label htmlFor="m-avail">Available</Label>
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
