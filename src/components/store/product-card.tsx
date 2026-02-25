"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/types/database";

interface ProductCardProps {
  readonly product: Product;
}

function getPriceLabel(variants?: Product["variants"]): string {
  const prices = variants?.map((v) => v.price) ?? [];
  if (prices.length === 0) return "Price unavailable";
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return min === max ? `₹${min}` : `From ₹${min}`;
}

export function ProductCard({ product }: ProductCardProps) {
  const priceLabel = getPriceLabel(product.variants);

  return (
    <Link href={`/products/${product.id}`}>
      <Card className="group overflow-hidden py-0 transition-all hover:shadow-lg hover:-translate-y-1">
        <div className="relative aspect-square overflow-hidden bg-muted">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              </svg>
            </div>
          )}
          {product.category && (
            <Badge
              variant="secondary"
              className="absolute top-3 left-3 bg-white/90 text-foreground backdrop-blur-sm"
            >
              {product.category.name}
            </Badge>
          )}
        </div>
        <CardContent className="space-y-2 p-4">
          <h3 className="font-semibold leading-tight line-clamp-1">
            {product.name}
          </h3>
          {product.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {product.description}
            </p>
          )}
          <div className="flex items-center justify-between gap-2">
            <span className="text-lg font-bold text-primary">{priceLabel}</span>
            {product.calories && (
              <span className="text-xs text-muted-foreground">
                {product.calories} cal
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
