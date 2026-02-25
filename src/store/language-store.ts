"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import en, { type Translations } from "@/lib/i18n/en";
import hi from "@/lib/i18n/hi";

export type Locale = "en" | "hi";

const translations: Record<Locale, Translations> = { en, hi };

interface LanguageState {
  locale: Locale;
  t: Translations;
  setLocale: (locale: Locale) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      locale: "en",
      t: en,
      setLocale: (locale) =>
        set({ locale, t: translations[locale] }),
    }),
    {
      name: "omarham-lang",
      partialize: (state) => ({ locale: state.locale }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.t = translations[state.locale];
        }
      },
    }
  )
);
