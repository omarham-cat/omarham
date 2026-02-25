"use client";

import { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  useGalleryStore,
  GALLERY_CATEGORIES,
  type GalleryImage,
} from "@/store/gallery-store";
import { useLanguageStore } from "@/store/language-store";

export default function GalleryPage() {
  const images = useGalleryStore((s) => s.images);
  const { t } = useLanguageStore();
  const [activeCategory, setActiveCategory] = useState("All");
  const [lightboxImage, setLightboxImage] = useState<GalleryImage | null>(null);
  const ALL_CATEGORIES = [t.gallery.all, ...GALLERY_CATEGORIES];

  const filtered =
    activeCategory === t.gallery.all
      ? images
      : images.filter((img) => img.category === activeCategory);

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{t.gallery.title}</h1>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          {t.gallery.subtitle}
        </p>
      </div>

      {/* Category Filter */}
      <div className="mb-8 flex flex-wrap justify-center gap-2">
        {ALL_CATEGORIES.map((cat) => (
          <Button
            key={cat}
            variant={activeCategory === cat ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveCategory(cat)}
            className={
              activeCategory === cat
                ? "bg-[#0d4f4f] hover:bg-[#0a3d3d]"
                : ""
            }
          >
            {cat}
          </Button>
        ))}
      </div>

      {/* Masonry-style Grid */}
      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
        {filtered.map((img, idx) => {
          const isLandscape = idx % 3 !== 0;
          return (
            <div
              key={img.id}
              className="mb-4 break-inside-avoid cursor-pointer overflow-hidden rounded-xl"
              onClick={() => setLightboxImage(img)}
            >
              <div className={`group relative ${isLandscape ? "aspect-[3/2]" : "aspect-[4/5]"} overflow-hidden rounded-xl bg-muted`}>
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="absolute bottom-0 left-0 right-0 translate-y-2 p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  <Badge className="mb-2 bg-[#0d4f4f]">{img.category}</Badge>
                  <p className="text-sm text-white">{img.alt}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="py-20 text-center">
          <p className="text-muted-foreground">{t.gallery.noImages}</p>
        </div>
      )}

      {/* Lightbox */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setLightboxImage(null)}
        >
          <Button
            size="icon"
            variant="ghost"
            className="absolute right-4 top-4 text-white hover:bg-white/20"
            onClick={() => setLightboxImage(null)}
          >
            <X className="size-6" />
          </Button>
          <div
            className="relative max-h-[85vh] max-w-4xl overflow-hidden rounded-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={lightboxImage.src}
              alt={lightboxImage.alt}
              width={900}
              height={600}
              className="h-auto max-h-[85vh] w-auto rounded-xl object-contain"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
              <Badge className="mb-2 bg-[#0d4f4f]">{lightboxImage.category}</Badge>
              <p className="text-white">{lightboxImage.alt}</p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
