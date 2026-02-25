"use client";

import { Star, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useTestimonialsStore } from "@/store/testimonials-store";
import { useLanguageStore } from "@/store/language-store";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`size-4 ${
            i < rating
              ? "fill-[#c5973e] text-[#c5973e]"
              : "fill-gray-200 text-gray-200"
          }`}
        />
      ))}
    </div>
  );
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function TestimonialsPage() {
  const testimonials = useTestimonialsStore((s) => s.testimonials);
  const { t: tr } = useLanguageStore();

  const avgRating =
    testimonials.length > 0
      ? (
          testimonials.reduce((sum, t) => sum + t.rating, 0) /
          testimonials.length
        ).toFixed(1)
      : "0.0";

  return (
    <main>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#0d4f4f]/5 via-[#c5973e]/5 to-[#0d4f4f]/10">
        <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 sm:py-24 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            {tr.testimonials.title}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            {tr.testimonials.subtitle}
          </p>
          <div className="mt-8 inline-flex items-center gap-3 rounded-full bg-white px-6 py-3 shadow-sm">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="size-5 fill-[#c5973e] text-[#c5973e]" />
              ))}
            </div>
            <span className="text-lg font-bold">{avgRating}</span>
            <span className="text-sm text-muted-foreground">
              {testimonials.length} {tr.testimonials.reviews}
            </span>
          </div>
        </div>
      </section>

      {/* Testimonials Grid */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Sweet Orders */}
        <div className="mb-12">
          <h2 className="mb-6 text-2xl font-bold">{tr.testimonials.sweetOrders}</h2>
          <div className="columns-1 gap-6 sm:columns-2 lg:columns-3">
            {testimonials.filter((t) => t.type === "sweets").map((t) => (
              <Card key={t.id} className="mb-6 break-inside-avoid">
                <CardContent className="pt-6">
                  <Quote className="mb-3 size-6 text-[#d4a84b]/70" />
                  <p className="text-sm leading-relaxed text-foreground">
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <div className="mt-4 flex items-center gap-3">
                    <Avatar className="size-10">
                      <AvatarFallback className="bg-[#0d4f4f]/10 text-[#a67d30] text-sm font-semibold">
                        {getInitials(t.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.location}</p>
                    </div>
                    <StarRating rating={t.rating} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Catering */}
        <div>
          <h2 className="mb-6 text-2xl font-bold">{tr.testimonials.cateringEvents}</h2>
          <div className="columns-1 gap-6 sm:columns-2 lg:columns-3">
            {testimonials.filter((t) => t.type === "catering").map((t) => (
              <Card key={t.id} className="mb-6 break-inside-avoid">
                <CardContent className="pt-6">
                  <div className="mb-3 flex items-center justify-between">
                    <Quote className="size-6 text-[#d4a84b]/70" />
                    {t.eventDetail && (
                      <Badge variant="outline" className="text-xs">
                        {t.eventDetail}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm leading-relaxed text-foreground">
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <div className="mt-4 flex items-center gap-3">
                    <Avatar className="size-10">
                      <AvatarFallback className="bg-[#0d4f4f]/10 text-[#a67d30] text-sm font-semibold">
                        {getInitials(t.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.location}</p>
                    </div>
                    <StarRating rating={t.rating} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
