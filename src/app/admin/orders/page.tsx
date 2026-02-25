"use client";

import { useEffect, useState, Fragment } from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
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

type Order = Tables<"orders"> & {
  profile: { full_name: string | null } | null;
};

type OrderItem = Tables<"order_items"> & {
  product: { name: string } | null;
  variant: { label: string; weight_grams: number } | null;
};

const STATUS_OPTIONS = [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
] as const;

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const statusColor: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function OrdersPage() {
  const supabase = createClient();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [orderItems, setOrderItems] = useState<Record<string, OrderItem[]>>({});
  const [loadingItems, setLoadingItems] = useState<Set<string>>(new Set());

  async function fetchOrders() {
    if (!isSupabaseConfigured()) {
      setOrders([]);
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from("orders")
      .select("*, profile:profiles(full_name)")
      .order("created_at", { ascending: false });
    if (error) {
      toast.error("Failed to load orders");
      setLoading(false);
      return;
    }
    setOrders(
      (data ?? []).map((o) => ({
        ...o,
        profile: o.profile as { full_name: string | null } | null,
      }))
    );
    setLoading(false);
  }

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered =
    filterStatus === "all"
      ? orders
      : orders.filter((o) => o.status === filterStatus);

  async function toggleExpand(orderId: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) {
        next.delete(orderId);
        return next;
      }
      next.add(orderId);
      return next;
    });

    if (!orderItems[orderId]) {
      setLoadingItems((prev) => new Set(prev).add(orderId));
      const { data } = await supabase
        .from("order_items")
        .select("*, product:products(name), variant:product_variants(label, weight_grams)")
        .eq("order_id", orderId);
      setOrderItems((prev) => ({
        ...prev,
        [orderId]: (data ?? []).map((item) => ({
          ...item,
          product: item.product as { name: string } | null,
          variant: item.variant as { label: string; weight_grams: number } | null,
        })),
      }));
      setLoadingItems((prev) => {
        const next = new Set(prev);
        next.delete(orderId);
        return next;
      });
    }
  }

  async function updateStatus(
    orderId: string,
    status: Order["status"]
  ) {
    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId);
    if (error) {
      toast.error("Failed to update status");
      return;
    }
    toast.success(`Order status updated to ${status}`);
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
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
        <h1 className="text-2xl font-bold">Orders</h1>
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
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-[180px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No orders found
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((order) => {
                const isExpanded = expanded.has(order.id);
                return (
                  <Fragment key={order.id}>
                    <TableRow
                      className="cursor-pointer"
                      onClick={() => toggleExpand(order.id)}
                    >
                      <TableCell>
                        {isExpanded ? (
                          <ChevronDown className="size-4" />
                        ) : (
                          <ChevronRight className="size-4" />
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {order.id.slice(0, 8)}…
                      </TableCell>
                      <TableCell>
                        {order.profile?.full_name || "Guest"}
                      </TableCell>
                      <TableCell>₹{order.total}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                            statusColor[order.status] ?? ""
                          }`}
                        >
                          {order.status}
                        </span>
                      </TableCell>
                      <TableCell>{formatDate(order.created_at)}</TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Select
                          value={order.status}
                          onValueChange={(v) =>
                            updateStatus(
                              order.id,
                              v as Order["status"]
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
                        <TableCell colSpan={7} className="bg-muted/30 p-4">
                          {loadingItems.has(order.id) ? (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Loader2 className="size-4 animate-spin" />
                              Loading items…
                            </div>
                          ) : (
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Product</TableHead>
                                  <TableHead>Variant</TableHead>
                                  <TableHead>Qty</TableHead>
                                  <TableHead>Price</TableHead>
                                  <TableHead>Subtotal</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {(orderItems[order.id] ?? []).map((item) => (
                                  <TableRow key={item.id}>
                                    <TableCell>
                                      {item.product?.name ?? "Unknown"}
                                    </TableCell>
                                    <TableCell>
                                      {item.variant
                                        ? `${item.variant.label} (${item.variant.weight_grams}g)`
                                        : "—"}
                                    </TableCell>
                                    <TableCell>{item.quantity}</TableCell>
                                    <TableCell>
                                      ₹{item.price_at_purchase}
                                    </TableCell>
                                    <TableCell>
                                      ₹{item.quantity * item.price_at_purchase}
                                    </TableCell>
                                  </TableRow>
                                ))}
                                {(orderItems[order.id] ?? []).length === 0 && (
                                  <TableRow>
                                    <TableCell
                                      colSpan={5}
                                      className="text-center text-muted-foreground"
                                    >
                                      No items
                                    </TableCell>
                                  </TableRow>
                                )}
                              </TableBody>
                            </Table>
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
