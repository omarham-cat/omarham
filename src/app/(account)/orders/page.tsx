"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Package, Calendar, CreditCard } from "lucide-react";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/types/database";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

type Order = Tables<"orders">;
type OrderItem = Tables<"order_items"> & {
  productName: string;
  variantLabel: string;
};
type OrderWithItems = Order & { items: OrderItem[] };

const statusConfig: Record<
  Order["status"],
  { label: string; className: string }
> = {
  pending: {
    label: "Pending",
    className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  },
  confirmed: {
    label: "Confirmed",
    className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  },
  shipped: {
    label: "Shipped",
    className: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  },
  delivered: {
    label: "Delivered",
    className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  },
};

function OrderCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-5 w-20" />
        </div>
        <div className="flex flex-wrap items-center gap-4 pt-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-36" />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Separator />
        <Skeleton className="h-5 w-24 self-end" />
      </CardContent>
    </Card>
  );
}

async function enrichOrderWithItems(
  order: Order
): Promise<OrderWithItems> {
  const supabase = createClient();
  const { data: itemsData } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", order.id);

  if (!itemsData || itemsData.length === 0) {
    return { ...order, items: [] };
  }

  const productIds = [...new Set(itemsData.map((i: Tables<"order_items">) => i.product_id))];
  const variantIds = [...new Set(itemsData.map((i: Tables<"order_items">) => i.variant_id))];

  const [{ data: products }, { data: variants }] = await Promise.all([
    supabase.from("products").select("id, name").in("id", productIds),
    supabase.from("product_variants").select("id, label").in("id", variantIds),
  ]);

  const productMap = new Map((products ?? []).map((p: { id: string; name: string }) => [p.id, p.name]));
  const variantMap = new Map((variants ?? []).map((v: { id: string; label: string }) => [v.id, v.label]));

  const items: OrderItem[] = itemsData.map((item: Tables<"order_items">) => ({
    ...item,
    productName: productMap.get(item.product_id) ?? "Unknown product",
    variantLabel: variantMap.get(item.variant_id) ?? "Unknown variant",
  }));

  return { ...order, items };
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login?redirect=/orders");
        return;
      }

      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (ordersError) {
        toast.error("Failed to load orders");
        setLoading(false);
        return;
      }

      if (!ordersData || ordersData.length === 0) {
        setOrders([]);
        setLoading(false);
        return;
      }

      const ordersWithItems = await Promise.all(
        ordersData.map((order) => enrichOrderWithItems(order))
      );

      setOrders(ordersWithItems);
      setLoading(false);
    }

    fetchOrders();
  }, [router]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-8 text-2xl font-bold">My Orders</h1>
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <OrderCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 py-12 text-center">
        <Package className="text-muted-foreground size-12" />
        <h1 className="text-2xl font-bold">No orders yet</h1>
        <p className="text-muted-foreground">
          When you place an order, it will show up here.
        </p>
        <Button asChild>
          <Link href="/products">Browse Products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold">My Orders</h1>

      <div className="flex flex-col gap-4">
        {orders.map((order) => {
          const status = statusConfig[order.status];
          return (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <CardTitle className="text-base">
                    Order #{order.id.slice(0, 8)}
                  </CardTitle>
                  <Badge variant="outline" className={status.className}>
                    {status.label}
                  </Badge>
                </div>
                <div className="text-muted-foreground flex flex-wrap items-center gap-4 text-sm">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="size-3.5" />
                    {new Date(order.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  {order.razorpay_payment_id && (
                    <span className="inline-flex items-center gap-1">
                      <CreditCard className="size-3.5" />
                      {order.razorpay_payment_id}
                    </span>
                  )}
                </div>
              </CardHeader>

              <CardContent className="flex flex-col gap-3">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <div>
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-muted-foreground">
                        {item.variantLabel} × {item.quantity}
                      </p>
                    </div>
                    <span className="font-medium">
                      ₹{item.price_at_purchase * item.quantity}
                    </span>
                  </div>
                ))}

                <Separator />

                <div className="flex items-center justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="text-lg font-bold">₹{order.total}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
