"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Star, Truck, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProductCard } from "@/components/store/product-card";
import { useLanguageStore } from "@/store/language-store";
import type { Product, Tables } from "@/types/database";

const highlightIcons = [Star, Truck, Shield] as const;

export function HomeContent({
  categories,
  featuredProducts,
}: {
  categories: Tables<"categories">[];
  featuredProducts: Product[];
}) {
  const { t } = useLanguageStore();

  const highlights = [
    { icon: highlightIcons[0], title: t.highlights.premiumQuality, description: t.highlights.premiumQualityDesc },
    { icon: highlightIcons[1], title: t.highlights.fastDelivery, description: t.highlights.fastDeliveryDesc },
    { icon: highlightIcons[2], title: t.highlights.hygienic, description: t.highlights.hygienicDesc },
  ];

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0d4f4f] via-[#0a3d3d] to-[#062e2e]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(197,151,62,0.12),transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              {t.hero.title1}
              <span className="block text-accent">{t.hero.title2}</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-white/70 sm:text-xl">
              {t.hero.subtitle}
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Button size="lg" className="bg-accent text-white hover:bg-accent/90" asChild>
                <Link href="/products">
                  {t.hero.browseProducts}
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button size="lg" variant="ghost" className="border border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white" asChild>
                <Link href="/catering">{t.hero.exploreCatering}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="border-b bg-card">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {highlights.map((item) => (
              <div key={item.title} className="flex items-start gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <item.icon className="size-6" />
                </div>
                <div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="bg-secondary/50">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="mb-10 flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  {t.home.shopByCategory}
                </h2>
                <p className="mt-2 text-muted-foreground">{t.home.shopByCategoryDesc}</p>
              </div>
              <Button variant="ghost" asChild className="hidden sm:inline-flex">
                <Link href="/products">
                  {t.home.viewAll}
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {categories.map((category) => (
                <Link key={category.id} href={`/products?category=${category.id}`}>
                  <Card className="group overflow-hidden py-0 transition-all hover:shadow-md hover:-translate-y-0.5">
                    <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                      {category.image_url ? (
                        <Image
                          src={category.image_url}
                          alt={category.name}
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
                          <span className="text-3xl font-bold text-primary/30">
                            {category.name.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold">{category.name}</h3>
                      {category.description && (
                        <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
                          {category.description}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section>
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="mb-10 flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  {t.home.freshArrivals}
                </h2>
                <p className="mt-2 text-muted-foreground">{t.home.freshArrivalsDesc}</p>
              </div>
              <Button variant="ghost" asChild className="hidden sm:inline-flex">
                <Link href="/products">
                  {t.home.viewAll}
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            <div className="mt-10 text-center sm:hidden">
              <Button variant="outline" asChild>
                <Link href="/products">
                  {t.home.viewAllProducts}
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-gradient-to-r from-primary to-[#0a3d3d]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center text-primary-foreground">
            <h2 className="text-2xl font-bold sm:text-3xl">{t.home.planningEvent}</h2>
            <p className="mx-auto mt-4 max-w-xl text-primary-foreground/70">
              {t.home.planningEventDesc}
            </p>
            <Button size="lg" variant="secondary" className="mt-8" asChild>
              <Link href="/catering">
                {t.home.getCateringQuote}
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
