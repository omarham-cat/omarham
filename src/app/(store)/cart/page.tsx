"use client";

import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";

import { useCartStore } from "@/store/cart-store";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const getTotal = useCartStore((s) => s.getTotal);
  const clearCart = useCartStore((s) => s.clearCart);

  if (items.length === 0) {
    return (
      <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 py-12 text-center">
        <ShoppingBag className="text-muted-foreground size-20 opacity-30" />
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <p className="text-muted-foreground max-w-sm">
          Looks like you haven&apos;t added anything to your cart yet. Browse our
          products and find something you love!
        </p>
        <Button asChild size="lg" className="mt-2">
          <Link href="/products">Start Shopping</Link>
        </Button>
      </div>
    );
  }

  const total = getTotal();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Shopping Cart</h1>
        <Button variant="ghost" size="sm" onClick={clearCart}>
          Clear Cart
        </Button>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Image</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Variant</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-center">Quantity</TableHead>
              <TableHead className="text-right">Subtotal</TableHead>
              <TableHead className="w-[50px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.variantId}>
                <TableCell>
                  <div className="bg-muted size-14 overflow-hidden rounded-md">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.productName}
                        width={56}
                        height={56}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <ShoppingBag className="text-muted-foreground size-5 opacity-40" />
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  {item.productName}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {item.variantLabel}
                </TableCell>
                <TableCell className="text-right">₹{item.price}</TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="icon-xs"
                      onClick={() =>
                        updateQuantity(item.variantId, item.quantity - 1)
                      }
                      disabled={item.quantity <= 1}
                    >
                      <Minus />
                    </Button>
                    <span className="w-6 text-center text-sm font-medium">
                      {item.quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon-xs"
                      onClick={() =>
                        updateQuantity(item.variantId, item.quantity + 1)
                      }
                      disabled={item.quantity >= 10}
                    >
                      <Plus />
                    </Button>
                  </div>
                </TableCell>
                <TableCell className="text-right font-medium">
                  ₹{item.price * item.quantity}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => removeItem(item.variantId)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards */}
      <div className="flex flex-col gap-4 md:hidden">
        {items.map((item) => (
          <Card key={item.variantId}>
            <CardContent className="flex gap-4">
              <div className="bg-muted size-20 shrink-0 overflow-hidden rounded-md">
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.productName}
                    width={80}
                    height={80}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <ShoppingBag className="text-muted-foreground size-6 opacity-40" />
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-muted-foreground text-sm">
                      {item.variantLabel}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => removeItem(item.variantId)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 />
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon-xs"
                      onClick={() =>
                        updateQuantity(item.variantId, item.quantity - 1)
                      }
                      disabled={item.quantity <= 1}
                    >
                      <Minus />
                    </Button>
                    <span className="w-6 text-center text-sm font-medium">
                      {item.quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon-xs"
                      onClick={() =>
                        updateQuantity(item.variantId, item.quantity + 1)
                      }
                      disabled={item.quantity >= 10}
                    >
                      <Plus />
                    </Button>
                  </div>
                  <span className="font-semibold">
                    ₹{item.price * item.quantity}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Total & Actions */}
      <Separator className="my-6" />
      <div className="flex flex-col items-end gap-4">
        <div className="text-right">
          <p className="text-muted-foreground text-sm">Total</p>
          <p className="text-3xl font-bold">₹{total}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link href="/products">Continue Shopping</Link>
          </Button>
          <Button asChild size="lg">
            <Link href="/checkout">Proceed to Checkout</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
