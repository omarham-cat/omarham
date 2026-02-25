"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MessageCircle } from "lucide-react";
import { toast } from "sonner";

import { useCartStore } from "@/store/cart-store";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const addressSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Phone must be 10 digits").max(10, "Phone must be 10 digits"),
  addressLine1: z.string().min(5, "Address must be at least 5 characters"),
  addressLine2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().min(6, "Pincode must be 6 digits").max(6, "Pincode must be 6 digits"),
});

type AddressFormData = z.infer<typeof addressSchema>;

function buildWhatsAppMessage(address: AddressFormData, items: ReturnType<typeof useCartStore.getState>["items"], total: number): string {
  const lines: string[] = [
    "🛒 *New Order from Om Arham*",
    "",
    "*Order Items:*",
  ];

  items.forEach((item, i) => {
    lines.push(`${i + 1}. ${item.productName} (${item.variantLabel}) × ${item.quantity} — ₹${item.price * item.quantity}`);
  });

  lines.push("");
  lines.push(`*Total: ₹${total}*`);
  lines.push("");
  lines.push("*Delivery Address:*");
  lines.push(`${address.fullName}`);
  lines.push(`${address.addressLine1}`);
  if (address.addressLine2) lines.push(`${address.addressLine2}`);
  lines.push(`${address.city}, ${address.state} - ${address.pincode}`);
  lines.push(`Phone: ${address.phone}`);

  return lines.join("\n");
}

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const getTotal = useCartStore((s) => s.getTotal);
  const clearCart = useCartStore((s) => s.clearCart);

  const [isSending, setIsSending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
  });

  const total = getTotal();

  function onSubmit(address: AddressFormData) {
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setIsSending(true);

    const whatsappNumber = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "").replaceAll(/\D/g, "");
    const message = buildWhatsAppMessage(address, items, total);
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

    window.open(url, "_blank");

    clearCart();
    toast.success("Order sent! We'll confirm via WhatsApp shortly.");
    router.push("/products");
    setIsSending(false);
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 py-12 text-center">
        <h1 className="text-2xl font-bold">Nothing to checkout</h1>
        <p className="text-muted-foreground">Add items to your cart first.</p>
        <Button asChild>
          <a href="/products">Browse Products</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold">Checkout</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Address</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                id="checkout-form"
                onSubmit={handleSubmit(onSubmit)}
                className="grid gap-4 sm:grid-cols-2"
              >
                <div className="grid gap-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    placeholder="John Doe"
                    {...register("fullName")}
                    aria-invalid={!!errors.fullName}
                  />
                  {errors.fullName && (
                    <p className="text-destructive text-sm">
                      {errors.fullName.message}
                    </p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    placeholder="9876543210"
                    {...register("phone")}
                    aria-invalid={!!errors.phone}
                  />
                  {errors.phone && (
                    <p className="text-destructive text-sm">
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                <div className="grid gap-2 sm:col-span-2">
                  <Label htmlFor="addressLine1">Address Line 1</Label>
                  <Input
                    id="addressLine1"
                    placeholder="123 Main Street"
                    {...register("addressLine1")}
                    aria-invalid={!!errors.addressLine1}
                  />
                  {errors.addressLine1 && (
                    <p className="text-destructive text-sm">
                      {errors.addressLine1.message}
                    </p>
                  )}
                </div>

                <div className="grid gap-2 sm:col-span-2">
                  <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
                  <Input
                    id="addressLine2"
                    placeholder="Apartment, suite, etc."
                    {...register("addressLine2")}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    placeholder="Mumbai"
                    {...register("city")}
                    aria-invalid={!!errors.city}
                  />
                  {errors.city && (
                    <p className="text-destructive text-sm">
                      {errors.city.message}
                    </p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    placeholder="Maharashtra"
                    {...register("state")}
                    aria-invalid={!!errors.state}
                  />
                  {errors.state && (
                    <p className="text-destructive text-sm">
                      {errors.state.message}
                    </p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input
                    id="pincode"
                    placeholder="400001"
                    {...register("pincode")}
                    aria-invalid={!!errors.pincode}
                  />
                  {errors.pincode && (
                    <p className="text-destructive text-sm">
                      {errors.pincode.message}
                    </p>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {items.map((item) => (
                <div
                  key={item.variantId}
                  className="flex items-center justify-between text-sm"
                >
                  <div>
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-muted-foreground">
                      {item.variantLabel} × {item.quantity}
                    </p>
                  </div>
                  <span className="font-medium">
                    ₹{item.price * item.quantity}
                  </span>
                </div>
              ))}

              <Separator />

              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-lg font-bold">₹{total}</span>
              </div>

              <Button
                type="submit"
                form="checkout-form"
                size="lg"
                className="w-full gap-2"
                disabled={isSending}
              >
                <MessageCircle className="size-5" />
                {isSending ? "Sending…" : "Order via WhatsApp"}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                Your order details will be sent via WhatsApp. We&apos;ll confirm availability and delivery time.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
