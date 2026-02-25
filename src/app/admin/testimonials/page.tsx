"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { DEFAULT_TESTIMONIALS } from "@/store/testimonials-store";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import {
  supabaseGet,
  supabaseInsert,
  supabaseUpdate,
  supabaseDelete,
} from "@/lib/supabase/rest";
import { Pencil, Trash2, Plus, Star, Loader2 } from "lucide-react";

interface Testimonial {
  id: string;
  name: string;
  location: string;
  rating: number;
  text: string;
  type: "sweets" | "catering";
  eventDetail?: string;
}

interface TestimonialRow {
  id: string;
  name: string;
  location: string;
  rating: number;
  text: string;
  type: "sweets" | "catering";
  event_detail?: string | null;
  created_at?: string;
}

function rowToTestimonial(row: TestimonialRow): Testimonial {
  return {
    id: row.id,
    name: row.name,
    location: row.location,
    rating: row.rating,
    text: row.text,
    type: row.type,
    eventDetail: row.event_detail ?? undefined,
  };
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`size-3.5 ${
            i < rating
              ? "fill-[#c5973e] text-[#c5973e]"
              : "fill-gray-200 text-gray-200"
          }`}
        />
      ))}
    </div>
  );
}

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [filterType, setFilterType] = useState("all");

  const [form, setForm] = useState({
    name: "",
    location: "",
    rating: 5,
    text: "",
    type: "sweets" as Testimonial["type"],
    eventDetail: "",
  });

  const fetchTestimonials = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setTestimonials(DEFAULT_TESTIMONIALS);
      setLoading(false);
      return;
    }
    const { data, error } = await supabaseGet<TestimonialRow>(
      "testimonials",
      "select=*&order=created_at.desc"
    );
    if (error) {
      toast.error("Failed to load testimonials");
      setTestimonials(DEFAULT_TESTIMONIALS);
    } else {
      setTestimonials((data ?? []).map(rowToTestimonial));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  const filtered =
    filterType === "all"
      ? testimonials
      : testimonials.filter((t) => t.type === filterType);

  function openAdd() {
    setEditing(null);
    setForm({
      name: "",
      location: "",
      rating: 5,
      text: "",
      type: "sweets",
      eventDetail: "",
    });
    setDialogOpen(true);
  }

  function openEdit(t: Testimonial) {
    setEditing(t);
    setForm({
      name: t.name,
      location: t.location,
      rating: t.rating,
      text: t.text,
      type: t.type,
      eventDetail: t.eventDetail ?? "",
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.name.trim() || !form.text.trim()) {
      toast.error("Name and review text are required");
      return;
    }
    const payload = {
      name: form.name.trim(),
      location: form.location.trim(),
      rating: form.rating,
      text: form.text.trim(),
      type: form.type,
      event_detail: form.eventDetail.trim() || null,
    };

    setSaving(true);
    if (editing) {
      const { error } = await supabaseUpdate(
        "testimonials",
        `id=eq.${editing.id}`,
        payload
      );
      if (error) {
        toast.error("Failed to update testimonial");
      } else {
        toast.success("Testimonial updated");
        setDialogOpen(false);
        await fetchTestimonials();
      }
    } else {
      const { error } = await supabaseInsert("testimonials", payload);
      if (error) {
        toast.error("Failed to add testimonial");
      } else {
        toast.success("Testimonial added");
        setDialogOpen(false);
        await fetchTestimonials();
      }
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this testimonial?")) return;
    setSaving(true);
    const { error } = await supabaseDelete("testimonials", `id=eq.${id}`);
    if (error) {
      toast.error("Failed to delete testimonial");
    } else {
      toast.success("Testimonial deleted");
      await fetchTestimonials();
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
        <h1 className="text-2xl font-bold">Testimonials</h1>
        <div className="flex items-center gap-2">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filter type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="sweets">Sweets</SelectItem>
              <SelectItem value="catering">Catering</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={openAdd} disabled={saving}>
            <Plus className="mr-2 size-4" />
            Add Testimonial
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead className="max-w-[300px]">Review</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground"
                >
                  No testimonials found
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.name}</TableCell>
                  <TableCell>{t.location}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                        t.type === "sweets"
                          ? "bg-[#0d4f4f]/10 text-[#a67d30]"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {t.type === "sweets" ? "Sweets" : "Catering"}
                    </span>
                    {t.eventDetail && (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {t.eventDetail}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    <StarDisplay rating={t.rating} />
                  </TableCell>
                  <TableCell className="max-w-[300px]">
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {t.text}
                    </p>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(t)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={saving}
                        onClick={() => handleDelete(t.id)}
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
        {testimonials.length} testimonial{testimonials.length !== 1 && "s"}{" "}
        total
      </p>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Testimonial" : "Add Testimonial"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="t-name">Customer Name</Label>
                <Input
                  id="t-name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="t-loc">Location</Label>
                <Input
                  id="t-loc"
                  value={form.location}
                  onChange={(e) =>
                    setForm({ ...form, location: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={form.type}
                  onValueChange={(v) =>
                    setForm({ ...form, type: v as Testimonial["type"] })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sweets">Sweets</SelectItem>
                    <SelectItem value="catering">Catering</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Rating</Label>
                <Select
                  value={form.rating.toString()}
                  onValueChange={(v) =>
                    setForm({ ...form, rating: Number.parseInt(v) })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[5, 4, 3, 2, 1].map((r) => (
                      <SelectItem key={r} value={r.toString()}>
                        {r} Star{r !== 1 && "s"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {form.type === "catering" && (
              <div className="space-y-2">
                <Label htmlFor="t-event">Event Detail</Label>
                <Input
                  id="t-event"
                  placeholder="e.g. Wedding Reception · 400 guests"
                  value={form.eventDetail}
                  onChange={(e) =>
                    setForm({ ...form, eventDetail: e.target.value })
                  }
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="t-text">Review Text</Label>
              <Textarea
                id="t-text"
                rows={4}
                value={form.text}
                onChange={(e) => setForm({ ...form, text: e.target.value })}
              />
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
