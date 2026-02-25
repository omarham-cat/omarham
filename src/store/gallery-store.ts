"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  category: string;
}

export const GALLERY_CATEGORIES = ["Sweets", "Catering", "Events", "Behind the Scenes"];

export const DEFAULT_IMAGES: GalleryImage[] = [
  { id: "g1", src: "https://placehold.co/600x400/FEF3C7/78350F?text=Kaju+Barfi+Platter", alt: "Kaju Barfi arranged on a silver platter", category: "Sweets" },
  { id: "g2", src: "https://placehold.co/600x400/FDE68A/78350F?text=Wedding+Setup", alt: "Grand wedding catering setup with live counters", category: "Events" },
  { id: "g3", src: "https://placehold.co/600x400/FCD34D/78350F?text=Motichoor+Ladoo", alt: "Fresh Motichoor Ladoo being prepared", category: "Sweets" },
  { id: "g4", src: "https://placehold.co/600x400/FBBF24/78350F?text=Live+Chaat+Counter", alt: "Live chaat counter at a corporate event", category: "Catering" },
  { id: "g5", src: "https://placehold.co/600x400/F59E0B/78350F?text=Mithai+Gift+Box", alt: "Premium mithai gift box with assorted sweets", category: "Sweets" },
  { id: "g6", src: "https://placehold.co/600x400/D97706/FEF3C7?text=Kitchen+Team", alt: "Our kitchen team preparing fresh sweets", category: "Behind the Scenes" },
  { id: "g7", src: "https://placehold.co/600x400/B45309/FEF3C7?text=Birthday+Party", alt: "Birthday party dessert table", category: "Events" },
  { id: "g8", src: "https://placehold.co/600x400/92400E/FEF3C7?text=Biryani+Station", alt: "Dum biryani live station at a wedding", category: "Catering" },
  { id: "g9", src: "https://placehold.co/600x400/FEF3C7/78350F?text=Pista+Barfi+Tray", alt: "Freshly cut Pista Barfi on a decorated tray", category: "Sweets" },
  { id: "g10", src: "https://placehold.co/600x400/FDE68A/78350F?text=Corporate+Lunch", alt: "Corporate lunch setup for 200 guests", category: "Catering" },
  { id: "g11", src: "https://placehold.co/600x400/FCD34D/78350F?text=Diwali+Spread", alt: "Diwali special sweet spread", category: "Events" },
  { id: "g12", src: "https://placehold.co/600x400/FBBF24/78350F?text=Halwa+Making", alt: "Gajar ka Halwa being slow-cooked in a large kadhai", category: "Behind the Scenes" },
  { id: "g13", src: "https://placehold.co/600x400/F59E0B/78350F?text=Sangeet+Night", alt: "Sangeet night food stalls with fairy lights", category: "Events" },
  { id: "g14", src: "https://placehold.co/600x400/D97706/FEF3C7?text=Pani+Puri+Live", alt: "Live pani puri counter with guests enjoying", category: "Catering" },
  { id: "g15", src: "https://placehold.co/600x400/B45309/FEF3C7?text=Chocolate+Modak", alt: "Handcrafted chocolate modaks for Ganesh Chaturthi", category: "Sweets" },
  { id: "g16", src: "https://placehold.co/600x400/92400E/FEF3C7?text=Packaging+Line", alt: "Sweet boxes being packed for delivery", category: "Behind the Scenes" },
  { id: "g17", src: "https://placehold.co/600x400/FEF3C7/78350F?text=Dessert+Table", alt: "Elaborate dessert table at a reception", category: "Events" },
  { id: "g18", src: "https://placehold.co/600x400/FDE68A/78350F?text=Tandoor+Counter", alt: "Live tandoor counter serving fresh naan and kulcha", category: "Catering" },
];

interface GalleryState {
  images: GalleryImage[];
  addImage: (image: Omit<GalleryImage, "id">) => void;
  updateImage: (id: string, updates: Partial<Omit<GalleryImage, "id">>) => void;
  deleteImage: (id: string) => void;
  reorderImage: (id: string, direction: "up" | "down") => void;
}

export const useGalleryStore = create<GalleryState>()(
  persist(
    (set) => ({
      images: DEFAULT_IMAGES,

      addImage: (image) =>
        set((state) => ({
          images: [
            ...state.images,
            { ...image, id: `g${Date.now()}` },
          ],
        })),

      updateImage: (id, updates) =>
        set((state) => ({
          images: state.images.map((img) =>
            img.id === id ? { ...img, ...updates } : img
          ),
        })),

      deleteImage: (id) =>
        set((state) => ({
          images: state.images.filter((img) => img.id !== id),
        })),

      reorderImage: (id, direction) =>
        set((state) => {
          const idx = state.images.findIndex((img) => img.id === id);
          if (idx < 0) return state;
          const newIdx = direction === "up" ? idx - 1 : idx + 1;
          if (newIdx < 0 || newIdx >= state.images.length) return state;
          const next = [...state.images];
          [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
          return { images: next };
        }),
    }),
    { name: "omarham-gallery" }
  )
);
