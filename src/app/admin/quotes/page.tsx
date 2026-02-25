"use client";

import { useEffect, useState, Fragment } from "react";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { supabaseGet, supabaseUpdate } from "@/lib/supabase/rest";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Tables } from "@/types/database";
import { Loader2, ChevronDown, ChevronRight } from "lucide-react";

type Quote = Tables<"catering_quotes">;

type QuoteDay = Tables<"quote_days"> & {
  quote_day_items: (Tables<"quote_day_items"> & {
    menu_item: { name: string; service_time: string } | null;
  })[];
};

type QuoteAddon = Tables<"quote_addons"> & {
  addon: { name: string; price: number } | null;
};

type QuoteDetails = {
  days: QuoteDay[];
  addons: QuoteAddon[];
};

const STATUS_OPTIONS = [
  "pending",
  "reviewed",
  "accepted",
  "rejected",
] as const;

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const statusColor: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  pending: "bg-yellow-100 text-yellow-700",
  reviewed: "bg-blue-100 text-blue-700",
  accepted: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [details, setDetails] = useState<Record<string, QuoteDetails>>({});
  const [loadingDetails, setLoadingDetails] = useState<Set<string>>(new Set());

  async function fetchQuotes() {
    if (!isSupabaseConfigured()) {
      setQuotes([]);
      setLoading(false);
      return;
    }
    try {
      const { data, error } = await supabaseGet<Quote>("catering_quotes", "select=*&order=created_at.desc");
      if (error) {
        toast.error(error ?? "Failed to load quotes");
        setLoading(false);
        return;
      }
      setQuotes(data ?? []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to connect to database");
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchQuotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered =
    filterStatus === "all"
      ? quotes
      : quotes.filter((q) => q.status === filterStatus);

  async function toggleExpand(quoteId: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(quoteId)) {
        next.delete(quoteId);
        return next;
      }
      next.add(quoteId);
      return next;
    });

    if (!details[quoteId]) {
      setLoadingDetails((prev) => new Set(prev).add(quoteId));

      try {
        const [daysRes, dayItemsRes, menuItemsRes, addonsRes, addonDefsRes] = await Promise.all([
          supabaseGet<Tables<"quote_days">>("quote_days", `select=*&quote_id=eq.${quoteId}&order=day_number`),
          supabaseGet<Tables<"quote_day_items">>("quote_day_items", "select=*"),
          supabaseGet<{ id: string; name: string; service_time: string }>("catering_menu_items", "select=id,name,service_time"),
          supabaseGet<Tables<"quote_addons">>("quote_addons", `select=*&quote_id=eq.${quoteId}`),
          supabaseGet<{ id: string; name: string; price: number }>("catering_addons", "select=id,name,price"),
        ]);

        const menuMap = new Map((menuItemsRes.data ?? []).map((m) => [m.id, m]));
        const addonMap = new Map((addonDefsRes.data ?? []).map((a) => [a.id, a]));

        setDetails((prev) => ({
          ...prev,
          [quoteId]: {
            days: (daysRes.data ?? []).map((d) => ({
              ...d,
              quote_day_items: (dayItemsRes.data ?? [])
                .filter((di) => di.quote_day_id === d.id)
                .map((di) => ({
                  ...di,
                  menu_item: menuMap.get(di.menu_item_id) ?? null,
                })),
            })) as QuoteDay[],
            addons: (addonsRes.data ?? []).map((a) => ({
              ...a,
              addon: addonMap.get(a.addon_id) ?? null,
            })) as QuoteAddon[],
          },
        }));
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to load quote details");
      } finally {
        setLoadingDetails((prev) => {
          const next = new Set(prev);
          next.delete(quoteId);
          return next;
        });
      }
    }
  }

  async function updateStatus(
    quoteId: string,
    status: Quote["status"]
  ) {
    const { error } = await supabaseUpdate("catering_quotes", `id=eq.${quoteId}`, { status });
    if (error) {
      toast.error("Failed to update status");
      return;
    }
    toast.success(`Quote status updated to ${status}`);
    setQuotes((prev) =>
      prev.map((q) => (q.id === quoteId ? { ...q, status } : q))
    );
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
        <h1 className="text-2xl font-bold">Catering Quotes</h1>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8" />
              <TableHead>Quote ID</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Guests</TableHead>
              <TableHead>Days</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-[180px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground">
                  No quotes found
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((quote) => {
                const isExpanded = expanded.has(quote.id);
                return (
                  <Fragment key={quote.id}>
                    <TableRow
                      className="cursor-pointer"
                      onClick={() => toggleExpand(quote.id)}
                    >
                      <TableCell>
                        {isExpanded ? (
                          <ChevronDown className="size-4" />
                        ) : (
                          <ChevronRight className="size-4" />
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {quote.id.slice(0, 8)}…
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {quote.contact_name || "—"}
                          </div>
                          {quote.contact_email && (
                            <div className="text-xs text-muted-foreground">
                              {quote.contact_email}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{quote.num_guests}</TableCell>
                      <TableCell>{quote.num_days}</TableCell>
                      <TableCell>₹{quote.estimated_total.toLocaleString("en-IN")}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                            statusColor[quote.status] ?? ""
                          }`}
                        >
                          {quote.status}
                        </span>
                      </TableCell>
                      <TableCell>{formatDate(quote.created_at)}</TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Select
                          value={quote.status}
                          onValueChange={(v) =>
                            updateStatus(
                              quote.id,
                              v as Quote["status"]
                            )
                          }
                        >
                          <SelectTrigger className="h-8 w-[140px]" size="sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUS_OPTIONS.map((s) => (
                              <SelectItem key={s} value={s}>
                                {s.charAt(0).toUpperCase() + s.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>

                    {isExpanded && (
                      <TableRow>
                        <TableCell colSpan={9} className="bg-muted/30 p-4">
                          {loadingDetails.has(quote.id) ? (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Loader2 className="size-4 animate-spin" />
                              Loading details…
                            </div>
                          ) : (
                            <div className="space-y-6">
                              {/* Quote info */}
                              <div className="grid gap-2 text-sm sm:grid-cols-3">
                                {quote.contact_phone && (
                                  <div>
                                    <span className="font-medium">Phone:</span>{" "}
                                    {quote.contact_phone}
                                  </div>
                                )}
                                {quote.event_date && (
                                  <div>
                                    <span className="font-medium">Event Date:</span>{" "}
                                    {formatDate(quote.event_date)}
                                  </div>
                                )}
                                {quote.notes && (
                                  <div className="sm:col-span-3">
                                    <span className="font-medium">Notes:</span>{" "}
                                    {quote.notes}
                                  </div>
                                )}
                              </div>

                              {/* Days and menu items */}
                              {(details[quote.id]?.days ?? []).map((day) => (
                                <div key={day.id}>
                                  <h4 className="mb-2 text-sm font-semibold">
                                    Day {day.day_number}
                                  </h4>
                                  {day.quote_day_items.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">
                                      No items
                                    </p>
                                  ) : (
                                    <Table>
                                      <TableHeader>
                                        <TableRow>
                                          <TableHead>Menu Item</TableHead>
                                          <TableHead>Service Time</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {day.quote_day_items.map((di) => (
                                          <TableRow key={di.id}>
                                            <TableCell>
                                              {di.menu_item?.name ?? "Unknown"}
                                            </TableCell>
                                            <TableCell>
                                              {di.menu_item?.service_time ??
                                                di.service_time}
                                            </TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  )}
                                </div>
                              ))}

                              {/* Add-ons */}
                              {(details[quote.id]?.addons ?? []).length > 0 && (
                                <div>
                                  <h4 className="mb-2 text-sm font-semibold">
                                    Add-ons
                                  </h4>
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>Add-on</TableHead>
                                        <TableHead>Qty</TableHead>
                                        <TableHead>Unit Price</TableHead>
                                        <TableHead>Subtotal</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {(details[quote.id]?.addons ?? []).map(
                                        (qa) => (
                                          <TableRow key={qa.id}>
                                            <TableCell>
                                              {qa.addon?.name ?? "Unknown"}
                                            </TableCell>
                                            <TableCell>{qa.quantity}</TableCell>
                                            <TableCell>
                                              ₹{qa.addon?.price ?? 0}
                                            </TableCell>
                                            <TableCell>
                                              ₹
                                              {qa.quantity *
                                                (qa.addon?.price ?? 0)}
                                            </TableCell>
                                          </TableRow>
                                        )
                                      )}
                                    </TableBody>
                                  </Table>
                                </div>
                              )}
                            </div>
                          )}
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
    </div>
  );
}
