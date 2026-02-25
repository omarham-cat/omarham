"use client";

import Link from "next/link";
import Image from "next/image";
import { useLanguageStore } from "@/store/language-store";

const quickLinks = [
  { href: "/products", key: "shop" as const },
  { href: "/catering", key: "catering" as const },
  { href: "/gallery", key: "gallery" as const },
  { href: "/testimonials", key: "testimonials" as const },
];

export function Footer() {
  const { t } = useLanguageStore();

  return (
    <footer className="border-t bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <div className="flex items-center gap-3">
              <Image src="/logo.png" alt="Om Arham" width={44} height={40} className="h-10 w-auto" />
              <h3 className="text-lg font-bold tracking-tight">Om Arham</h3>
            </div>
            <p className="mt-3 text-sm text-primary-foreground/70">
              {t.footer.tagline}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-accent">
              {t.footer.quickLinks}
            </h4>
            <ul className="mt-3 space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-primary-foreground/70 transition-colors hover:text-accent"
                  >
                    {t.nav[link.key]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-accent">
              {t.footer.contact}
            </h4>
            <ul className="mt-3 space-y-2 text-sm text-primary-foreground/70">
              <li>Email: info@omarham.com</li>
              <li>Phone: +91 98765 43210</li>
              <li>Mumbai, India</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-primary-foreground/20 pt-6 text-center text-xs text-primary-foreground/50">
          &copy; {new Date().getFullYear()} {t.footer.rights}
        </div>
      </div>
    </footer>
  );
}
