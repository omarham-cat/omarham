"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  Menu,
  User,
  LogOut,
  Package,
  FileText,
  Settings,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { getDemoUser, clearDemoUser, type DemoUser } from "@/lib/demo-auth";
import { useCartStore } from "@/store/cart-store";
import { useLanguageStore, type Locale } from "@/store/language-store";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const navLinks = [
  { href: "/products", key: "shop" as const },
  { href: "/catering", key: "catering" as const },
  { href: "/gallery", key: "gallery" as const },
  { href: "/testimonials", key: "testimonials" as const },
];

const LOCALES: { value: Locale; label: string; flag: string }[] = [
  { value: "en", label: "English", flag: "EN" },
  { value: "hi", label: "हिन्दी", flag: "हि" },
];

export function Navbar() {
  const router = useRouter();
  const itemCount = useCartStore((s) => s.getItemCount());
  const { t, locale, setLocale } = useLanguageStore();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [demoUser, setDemoUserState] = useState<DemoUser | null>(null);
  const [profile, setProfile] = useState<{
    full_name: string | null;
    avatar_url: string | null;
    role: "customer" | "admin";
  } | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      const du = getDemoUser();
      setDemoUserState(du);
      if (du) {
        setProfile({ full_name: du.full_name, avatar_url: null, role: du.role });
      }

      function onDemoAuthChange() {
        const u = getDemoUser();
        setDemoUserState(u);
        setProfile(u ? { full_name: u.full_name, avatar_url: null, role: u.role } : null);
      }
      window.addEventListener("demo-auth-change", onDemoAuthChange);
      return () => window.removeEventListener("demo-auth-change", onDemoAuthChange);
    }

    const supabase = createClient();

    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("full_name, avatar_url, role")
          .eq("id", user.id)
          .single();
        setProfile(data);
      }
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        const { data } = await supabase
          .from("profiles")
          .select("full_name, avatar_url, role")
          .eq("id", session.user.id)
          .single();
        setProfile(data);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const isLoggedIn = !!(user || demoUser);
  const displayEmail = user?.email ?? demoUser?.email ?? "";

  async function handleLogout() {
    if (!isSupabaseConfigured()) {
      clearDemoUser();
      router.push("/");
      router.refresh();
      return;
    }
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const initials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : (displayEmail?.[0]?.toUpperCase() ?? "U");

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="Om Arham"
            width={40}
            height={36}
            className="h-9 w-auto"
            priority
          />
          <span className="text-xl font-bold tracking-tight text-primary">Om Arham</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {t.nav[link.key]}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          {/* Language Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-9">
                <Globe className="size-4" />
                <span className="sr-only">Language</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
              {LOCALES.map((l) => (
                <DropdownMenuItem
                  key={l.value}
                  onClick={() => setLocale(l.value)}
                  className={locale === l.value ? "bg-accent/20 font-medium" : ""}
                >
                  <span className="mr-2 text-xs font-bold text-muted-foreground">{l.flag}</span>
                  {l.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Cart */}
          <Button variant="ghost" size="icon" asChild>
            <Link href="/cart" className="relative">
              <ShoppingCart className="size-5" />
              {mounted && itemCount > 0 && (
                <Badge className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center p-0 text-[10px]">
                  {itemCount}
                </Badge>
              )}
              <span className="sr-only">{t.nav.cart}</span>
            </Link>
          </Button>

          {/* User menu (desktop) */}
          <div className="hidden md:block">
            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar size="sm">
                      <AvatarImage
                        src={profile?.avatar_url ?? undefined}
                        alt={profile?.full_name ?? "User"}
                      />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel className="font-normal">
                    <p className="text-sm font-medium">
                      {profile?.full_name ?? "User"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {displayEmail}
                    </p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/orders">
                      <Package className="mr-2 size-4" />
                      {t.nav.orders}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/quotes">
                      <FileText className="mr-2 size-4" />
                      {t.nav.myQuotes}
                    </Link>
                  </DropdownMenuItem>
                  {profile?.role === "admin" && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin">
                          <Settings className="mr-2 size-4" />
                          {t.nav.admin}
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 size-4" />
                    {t.nav.logout}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">
                  <User className="mr-2 size-4" />
                  {t.nav.login}
                </Link>
              </Button>
            )}
          </div>

          {/* Mobile hamburger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="size-5" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Image src="/logo.png" alt="Om Arham" width={32} height={29} className="h-7 w-auto" />
                  Om Arham
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-4 px-4 pt-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="text-lg font-medium transition-colors hover:text-foreground"
                  >
                    {t.nav[link.key]}
                  </Link>
                ))}
                <Link
                  href="/cart"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 text-lg font-medium transition-colors hover:text-foreground"
                >
                  <ShoppingCart className="size-5" />
                  {t.nav.cart}
                  {mounted && itemCount > 0 && (
                    <Badge className="ml-auto">{itemCount}</Badge>
                  )}
                </Link>

                {/* Mobile language switch */}
                <div className="flex items-center gap-2">
                  {LOCALES.map((l) => (
                    <Button
                      key={l.value}
                      variant={locale === l.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setLocale(l.value)}
                    >
                      {l.label}
                    </Button>
                  ))}
                </div>

                <div className="my-2 h-px bg-border" />

                {isLoggedIn ? (
                  <>
                    <div className="flex items-center gap-3 pb-2">
                      <Avatar size="sm">
                        <AvatarImage
                          src={profile?.avatar_url ?? undefined}
                          alt={profile?.full_name ?? "User"}
                        />
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">
                          {profile?.full_name ?? "User"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {displayEmail}
                        </p>
                      </div>
                    </div>
                    <Link
                      href="/orders"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 text-base font-medium transition-colors hover:text-foreground"
                    >
                      <Package className="size-4" />
                      {t.nav.orders}
                    </Link>
                    <Link
                      href="/quotes"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 text-base font-medium transition-colors hover:text-foreground"
                    >
                      <FileText className="size-4" />
                      {t.nav.myQuotes}
                    </Link>
                    {profile?.role === "admin" && (
                      <Link
                        href="/admin"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-2 text-base font-medium transition-colors hover:text-foreground"
                      >
                        <Settings className="size-4" />
                        {t.nav.admin}
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileOpen(false);
                      }}
                      className="flex items-center gap-2 text-base font-medium text-destructive transition-colors hover:text-destructive/80"
                    >
                      <LogOut className="size-4" />
                      {t.nav.logout}
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 text-lg font-medium transition-colors hover:text-foreground"
                  >
                    <User className="size-5" />
                    {t.nav.login}
                  </Link>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
