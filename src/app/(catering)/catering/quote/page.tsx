"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Minus,
  Plus,
  Sunrise,
  UtensilsCrossed,
  Cookie,
  Moon,
  CalendarDays,
  ClipboardList,
  Sparkles,
  Send,
  IndianRupee,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { supabaseGet, supabaseInsert, getUserId } from "@/lib/supabase/rest";
import type { Tables } from "@/types/database";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type MenuItem = Tables<"catering_menu_items">;
type Addon = Tables<"catering_addons">;

type ServiceTime = "breakfast" | "lunch" | "snacks" | "dinner" | "late_night";

interface EventDetails {
  numDays: number;
  defaultGuests: number;
  eventDate: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  notes: string;
}

type MenuSelections = Record<number, Record<ServiceTime, string[]>>;
type GuestCounts = Record<number, Record<ServiceTime, number>>;
type AddonSelections = Record<string, number>;

const STEPS = [
  { label: "Event Details", icon: CalendarDays },
  { label: "Menu Selection", icon: ClipboardList },
  { label: "Add-ons", icon: Sparkles },
  { label: "Review & Quote", icon: Send },
];

const SERVICE_TIMES: { key: ServiceTime; label: string; icon: typeof Sunrise }[] = [
  { key: "breakfast", label: "Breakfast", icon: Sunrise },
  { key: "lunch", label: "Lunch", icon: UtensilsCrossed },
  { key: "snacks", label: "Snacks", icon: Cookie },
  { key: "dinner", label: "Dinner", icon: UtensilsCrossed },
  { key: "late_night", label: "Late Night", icon: Moon },
];

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function MenuCategoryGroup({
  category,
  items,
  day,
  serviceTime,
  menuSelections,
  onToggle,
}: {
  category: string;
  items: MenuItem[];
  day: number;
  serviceTime: ServiceTime;
  menuSelections: MenuSelections;
  onToggle: (day: number, st: ServiceTime, itemId: string) => void;
}) {
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {category}
      </h4>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {items.map((item) => {
          const isSelected =
            menuSelections[day]?.[serviceTime]?.includes(item.id) ?? false;
          return (
            <div
              key={item.id}
              role="button"
              tabIndex={0}
              onClick={() => onToggle(day, serviceTime, item.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onToggle(day, serviceTime, item.id);
                }
              }}
              className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors select-none ${
                isSelected
                  ? "border-[#0d4f4f]/30 bg-[#0d4f4f]/5"
                  : "hover:bg-gray-50"
              }`}
            >
              <Checkbox
                checked={isSelected}
                tabIndex={-1}
                className="mt-0.5 pointer-events-none"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{item.name}</span>
                  <span className="text-sm font-semibold text-[#c5973e]">
                    {formatCurrency(item.price_per_person)}
                    <span className="text-xs font-normal text-muted-foreground">
                      /person
                    </span>
                  </span>
                </div>
                {item.description && (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {item.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ReviewDayCard({
  day,
  daySelections,
  dayGuestCounts,
  menuItems,
}: {
  day: number;
  daySelections: Record<ServiceTime, string[]>;
  dayGuestCounts: Record<ServiceTime, number>;
  menuItems: MenuItem[];
}) {
  let dayTotal = 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Day {day}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {SERVICE_TIMES.map((st) => {
          const selectedIds = daySelections[st.key] ?? [];
          if (selectedIds.length === 0) return null;
          const guests = dayGuestCounts[st.key] ?? 0;

          return (
            <div key={st.key}>
              <div className="mb-2 flex items-center gap-2">
                <st.icon className="size-4 text-[#c5973e]" />
                <span className="text-sm font-medium">{st.label}</span>
                <Badge variant="outline" className="ml-auto text-xs">
                  <Users className="mr-1 size-3" />
                  {guests} guests
                </Badge>
              </div>
              <div className="space-y-1 pl-6">
                {selectedIds.map((itemId) => {
                  const item = menuItems.find((m) => m.id === itemId);
                  if (!item) return null;
                  const lineTotal = item.price_per_person * guests;
                  dayTotal += lineTotal;
                  return (
                    <div
                      key={itemId}
                      className="flex items-center justify-between text-sm"
                    >
                      <span>{item.name}</span>
                      <span className="text-muted-foreground">
                        {formatCurrency(item.price_per_person)} x {guests} ={" "}
                        <span className="font-medium text-foreground">
                          {formatCurrency(lineTotal)}
                        </span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
        <Separator />
        <div className="flex justify-between text-sm font-semibold">
          <span>Day {day} Subtotal</span>
          <span>{formatCurrency(dayTotal)}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function buildGuestCounts(numDays: number, defaultGuests: number, existing?: GuestCounts): GuestCounts {
  const counts: GuestCounts = {};
  for (let d = 1; d <= numDays; d++) {
    counts[d] = {} as Record<ServiceTime, number>;
    for (const st of SERVICE_TIMES) {
      counts[d][st.key] = existing?.[d]?.[st.key] ?? defaultGuests;
    }
  }
  return counts;
}

function emptyMenuSelections(numDays: number, existing?: MenuSelections): MenuSelections {
  const selections: MenuSelections = {};
  for (let d = 1; d <= numDays; d++) {
    selections[d] = existing?.[d] ?? {
      breakfast: [],
      lunch: [],
      snacks: [],
      dinner: [],
      late_night: [],
    };
  }
  return selections;
}

export default function CateringQuotePage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [addons, setAddons] = useState<Addon[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [quoteTotal, setQuoteTotal] = useState(0);

  const [eventDetails, setEventDetails] = useState<EventDetails>({
    numDays: 1,
    defaultGuests: 50,
    eventDate: "",
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    notes: "",
  });

  const [menuSelections, setMenuSelections] = useState<MenuSelections>(
    emptyMenuSelections(1)
  );
  const [guestCounts, setGuestCounts] = useState<GuestCounts>(
    buildGuestCounts(1, 50)
  );
  const [addonSelections, setAddonSelections] = useState<AddonSelections>({});

  useEffect(() => {
    async function fetchData() {
      if (isSupabaseConfigured()) {
        try {
          const [menuResult, addonsResult] = await Promise.all([
            supabaseGet<MenuItem>("catering_menu_items", "select=*&is_available=eq.true&order=category,name"),
            supabaseGet<Addon>("catering_addons", "select=*&order=addon_type,name"),
          ]);
          if (menuResult.data && menuResult.data.length > 0) {
            setMenuItems(menuResult.data);
            if (addonsResult.data) setAddons(addonsResult.data);
            return;
          }
        } catch {
          // Query failed, fall through to mock data
        }
      }
      const { MOCK_CATERING_MENU_ITEMS, MOCK_CATERING_ADDONS } = await import("@/lib/mock-data");
      setMenuItems(MOCK_CATERING_MENU_ITEMS as MenuItem[]);
      setAddons(MOCK_CATERING_ADDONS as Addon[]);
    }
    fetchData();
  }, []);

  useEffect(() => {
    setMenuSelections((prev) => emptyMenuSelections(eventDetails.numDays, prev));
    setGuestCounts((prev) => buildGuestCounts(eventDetails.numDays, eventDetails.defaultGuests, prev));
  }, [eventDetails.numDays, eventDetails.defaultGuests]);

  const menuByServiceTime = useMemo(() => {
    const grouped: Record<ServiceTime, Record<string, MenuItem[]>> = {
      breakfast: {},
      lunch: {},
      snacks: {},
      dinner: {},
      late_night: {},
    };
    for (const item of menuItems) {
      const st = item.service_time as ServiceTime;
      if (!grouped[st]) continue;
      if (!grouped[st][item.category]) grouped[st][item.category] = [];
      grouped[st][item.category].push(item);
    }
    return grouped;
  }, [menuItems]);

  const addonsByType = useMemo(() => {
    const grouped: Record<string, Addon[]> = {};
    for (const addon of addons) {
      if (!grouped[addon.addon_type]) grouped[addon.addon_type] = [];
      grouped[addon.addon_type].push(addon);
    }
    return grouped;
  }, [addons]);

  const estimatedTotal = useMemo(() => {
    let menuTotal = 0;
    for (let d = 1; d <= eventDetails.numDays; d++) {
      const daySel = menuSelections[d];
      const dayGuests = guestCounts[d];
      if (!daySel || !dayGuests) continue;

      for (const st of SERVICE_TIMES) {
        const selectedIds = daySel[st.key] ?? [];
        const guests = dayGuests[st.key] ?? 0;
        for (const itemId of selectedIds) {
          const item = menuItems.find((m) => m.id === itemId);
          if (item) menuTotal += item.price_per_person * guests;
        }
      }
    }

    const addonTotal = Object.entries(addonSelections).reduce(
      (sum, [addonId, qty]) => {
        if (qty <= 0) return sum;
        const addon = addons.find((a) => a.id === addonId);
        return addon ? sum + addon.price * qty : sum;
      },
      0
    );

    return menuTotal + addonTotal;
  }, [menuSelections, guestCounts, addonSelections, menuItems, addons, eventDetails.numDays]);

  function toggleMenuItem(day: number, serviceTime: ServiceTime, itemId: string) {
    setMenuSelections((prev) => {
      const daySelections = { ...prev[day] };
      const current = daySelections[serviceTime] ?? [];
      daySelections[serviceTime] = current.includes(itemId)
        ? current.filter((id) => id !== itemId)
        : [...current, itemId];
      return { ...prev, [day]: daySelections };
    });
  }

  function updateGuestCount(day: number, serviceTime: ServiceTime, value: number) {
    setGuestCounts((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [serviceTime]: Math.max(1, value),
      },
    }));
  }

  function updateAddonQty(addonId: string, delta: number) {
    setAddonSelections((prev) => {
      const current = prev[addonId] ?? 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [addonId]: next };
    });
  }

  function validateStep(): boolean {
    if (currentStep === 0) {
      if (!eventDetails.contactName.trim()) {
        toast.error("Please enter a contact name");
        return false;
      }
      if (!eventDetails.contactPhone.trim()) {
        toast.error("Please enter a phone number");
        return false;
      }
      if (!eventDetails.contactEmail.trim()) {
        toast.error("Please enter an email address");
        return false;
      }
      if (eventDetails.defaultGuests < 1) {
        toast.error("Default guest count must be at least 1");
        return false;
      }
      if (eventDetails.numDays < 1 || eventDetails.numDays > 7) {
        toast.error("Number of days must be between 1 and 7");
        return false;
      }
    }
    if (currentStep === 1) {
      const hasAnySelection = Object.values(menuSelections).some((day) =>
        Object.values(day).some((items) => items.length > 0)
      );
      if (!hasAnySelection) {
        toast.error("Please select at least one menu item");
        return false;
      }
    }
    return true;
  }

  function goNext() {
    if (!validateStep()) return;
    setCurrentStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function goBack() {
    setCurrentStep((s) => Math.max(s - 1, 0));
  }

  function totalGuestsForQuote(): number {
    let max = 0;
    for (let d = 1; d <= eventDetails.numDays; d++) {
      const dayGuests = guestCounts[d];
      if (!dayGuests) continue;
      for (const st of SERVICE_TIMES) {
        if ((menuSelections[d]?.[st.key]?.length ?? 0) > 0) {
          max = Math.max(max, dayGuests[st.key] ?? 0);
        }
      }
    }
    return max || eventDetails.defaultGuests;
  }

  async function saveQuoteDays(quoteId: string) {
    for (let d = 1; d <= eventDetails.numDays; d++) {
      const { data: quoteDayData, error: dayError } = await supabaseInsert<{ id: string }>(
        "quote_days",
        { quote_id: quoteId, day_number: d }
      );

      if (dayError || !quoteDayData?.[0]) throw new Error(dayError ?? "Failed to create quote day");

      const daySelections = menuSelections[d];
      if (!daySelections) continue;

      const dayItems = SERVICE_TIMES.flatMap((st) =>
        (daySelections[st.key] ?? []).map((itemId) => ({
          quote_day_id: quoteDayData[0].id,
          menu_item_id: itemId,
          service_time: st.key,
        }))
      );

      if (dayItems.length > 0) {
        const { error: itemsError } = await supabaseInsert("quote_day_items", dayItems);
        if (itemsError) throw new Error(itemsError);
      }
    }
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const userId = await getUserId();

      const { data: quoteData, error: quoteError } = await supabaseInsert<{ id: string }>(
        "catering_quotes",
        {
          user_id: userId,
          num_days: eventDetails.numDays,
          num_guests: totalGuestsForQuote(),
          estimated_total: estimatedTotal,
          status: "pending",
          contact_name: eventDetails.contactName,
          contact_phone: eventDetails.contactPhone,
          contact_email: eventDetails.contactEmail,
          event_date: eventDetails.eventDate || null,
          notes: eventDetails.notes || null,
        }
      );

      const quote = quoteData?.[0];
      if (quoteError || !quote) throw new Error(quoteError ?? "Failed to create quote");

      await saveQuoteDays(quote.id);

      const addonInserts = Object.entries(addonSelections)
        .filter(([, qty]) => qty > 0)
        .map(([addonId, quantity]) => ({
          quote_id: quote.id,
          addon_id: addonId,
          quantity,
        }));

      if (addonInserts.length > 0) {
        const { error: addonsError } = await supabaseInsert("quote_addons", addonInserts);
        if (addonsError) throw new Error(addonsError);
      }

      setQuoteTotal(estimatedTotal);
      setSubmitted(true);
      toast.success("Quote submitted successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
        <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-green-100">
          <Check className="size-10 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold">Quote Submitted!</h1>
        <p className="mx-auto mt-4 max-w-md text-muted-foreground">
          Thank you for your interest. We&apos;ll review your requirements and
          get back to you shortly.
        </p>
        <Card className="mx-auto mt-8 max-w-sm">
          <CardContent className="flex flex-col items-center gap-1 pt-2">
            <span className="text-sm text-muted-foreground">Estimated Total</span>
            <span className="text-3xl font-bold text-[#c5973e]">
              {formatCurrency(quoteTotal)}
            </span>
            <span className="text-xs text-muted-foreground">
              {eventDetails.numDays} day{eventDetails.numDays > 1 ? "s" : ""}
            </span>
          </CardContent>
        </Card>
        <div className="mt-8 flex justify-center gap-4">
          <Button variant="outline" asChild>
            <Link href="/catering">
              <ArrowLeft className="mr-2 size-4" />
              Back to Catering
            </Link>
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Link
          href="/catering"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-1 size-4" />
          Back to Catering
        </Link>
        <h1 className="mt-4 text-3xl font-bold tracking-tight">
          Build Your Catering Quote
        </h1>
        <p className="mt-2 text-muted-foreground">
          Customise every detail — we&apos;ll put together a personalised estimate.
        </p>
      </div>

      {/* Step Indicator */}
      <nav className="mb-10">
        <ol className="flex items-center gap-2">
          {STEPS.map((step, idx) => {
            const isActive = idx === currentStep;
            const isCompleted = idx < currentStep;
            return (
              <li key={step.label} className="flex flex-1 items-center gap-2">
                <div className="flex flex-1 flex-col items-center gap-1.5">
                  <div
                    className={`flex size-10 items-center justify-center rounded-full border-2 transition-colors ${
                      isCompleted
                        ? "border-[#0d4f4f] bg-[#0d4f4f] text-white"
                        : ""
                    } ${
                      !isCompleted && isActive
                        ? "border-[#0d4f4f] bg-[#0d4f4f]/5 text-[#c5973e]"
                        : ""
                    } ${
                      !isCompleted && !isActive
                        ? "border-gray-200 bg-gray-50 text-gray-400"
                        : ""
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="size-5" />
                    ) : (
                      <step.icon className="size-5" />
                    )}
                  </div>
                  <span
                    className={`text-xs font-medium ${
                      isActive ? "text-[#c5973e]" : ""
                    } ${isCompleted && !isActive ? "text-foreground" : ""} ${
                      !isActive && !isCompleted ? "text-muted-foreground" : ""
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div
                    className={`mt-[-1.25rem] h-0.5 w-full transition-colors ${
                      idx < currentStep ? "bg-[#0d4f4f]" : "bg-gray-200"
                    }`}
                  />
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Step 1: Event Details */}
      {currentStep === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Event Details</CardTitle>
            <CardDescription>
              Tell us about your event so we can tailor the perfect menu.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="numDays">Number of Days</Label>
                <Input
                  id="numDays"
                  type="number"
                  min={1}
                  max={7}
                  value={eventDetails.numDays}
                  onChange={(e) =>
                    setEventDetails((prev) => ({
                      ...prev,
                      numDays: Math.max(1, Math.min(7, Number.parseInt(e.target.value) || 1)),
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="defaultGuests">Default Guests per Service</Label>
                <Input
                  id="defaultGuests"
                  type="number"
                  min={1}
                  max={5000}
                  value={eventDetails.defaultGuests}
                  onChange={(e) =>
                    setEventDetails((prev) => ({
                      ...prev,
                      defaultGuests: Number.parseInt(e.target.value) || 1,
                    }))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Pre-fills all service times. You can customise per service in the next step.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="eventDate">Event Date</Label>
                <Input
                  id="eventDate"
                  type="date"
                  value={eventDetails.eventDate}
                  onChange={(e) =>
                    setEventDetails((prev) => ({
                      ...prev,
                      eventDate: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="contactName">Contact Name *</Label>
                <Input
                  id="contactName"
                  placeholder="Your full name"
                  value={eventDetails.contactName}
                  onChange={(e) =>
                    setEventDetails((prev) => ({
                      ...prev,
                      contactName: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPhone">Phone Number *</Label>
                <Input
                  id="contactPhone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={eventDetails.contactPhone}
                  onChange={(e) =>
                    setEventDetails((prev) => ({
                      ...prev,
                      contactPhone: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="contactEmail">Email Address *</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  placeholder="you@example.com"
                  value={eventDetails.contactEmail}
                  onChange={(e) =>
                    setEventDetails((prev) => ({
                      ...prev,
                      contactEmail: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any dietary restrictions, theme preferences, venue details..."
                rows={3}
                value={eventDetails.notes}
                onChange={(e) =>
                  setEventDetails((prev) => ({
                    ...prev,
                    notes: e.target.value,
                  }))
                }
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Menu Selection */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Menu Selection</CardTitle>
            <CardDescription>
              Choose dishes for each day and service time. Set custom guest counts per service — prices are per person.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="1">
              <TabsList className="mb-4 w-full flex-wrap">
                {Array.from({ length: eventDetails.numDays }, (_, i) => i + 1).map(
                  (day) => (
                    <TabsTrigger key={day} value={String(day)}>
                      Day {day}
                    </TabsTrigger>
                  )
                )}
              </TabsList>

              {Array.from({ length: eventDetails.numDays }, (_, i) => i + 1).map(
                (day) => (
                  <TabsContent key={day} value={String(day)}>
                    <Accordion type="multiple" className="w-full" defaultValue={SERVICE_TIMES.map(st => st.key)}>
                      {SERVICE_TIMES.map((st) => {
                        const categories = menuByServiceTime[st.key];
                        const categoryEntries = Object.entries(categories);
                        const selectedCount =
                          menuSelections[day]?.[st.key]?.length ?? 0;
                        const guests = guestCounts[day]?.[st.key] ?? eventDetails.defaultGuests;

                        return (
                          <AccordionItem key={st.key} value={st.key}>
                            <AccordionTrigger>
                              <div className="flex items-center gap-3">
                                <div className="flex size-8 items-center justify-center rounded-full bg-[#0d4f4f]/10 text-[#c5973e]">
                                  <st.icon className="size-4" />
                                </div>
                                <span className="font-medium">{st.label}</span>
                                {selectedCount > 0 && (
                                  <Badge variant="secondary" className="ml-1">
                                    {selectedCount} selected
                                  </Badge>
                                )}
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              {/* Per-service guest count */}
                              <div className="mb-4 flex items-center gap-3 rounded-lg border border-dashed border-[#0d4f4f]/30 bg-[#0d4f4f]/5 p-3">
                                <Users className="size-4 shrink-0 text-[#c5973e]" />
                                <Label htmlFor={`guests-${day}-${st.key}`} className="shrink-0 text-sm font-medium">
                                  Guests for this service:
                                </Label>
                                <Input
                                  id={`guests-${day}-${st.key}`}
                                  type="number"
                                  min={1}
                                  max={5000}
                                  value={guests}
                                  onChange={(e) =>
                                    updateGuestCount(
                                      day,
                                      st.key,
                                      Number.parseInt(e.target.value) || 1
                                    )
                                  }
                                  className="h-8 w-24"
                                />
                              </div>

                              {categoryEntries.length === 0 ? (
                                <p className="py-4 text-center text-sm text-muted-foreground">
                                  No items available for {st.label}
                                </p>
                              ) : (
                                <div className="space-y-6">
                                  {categoryEntries.map(([category, items]) => (
                                    <MenuCategoryGroup
                                      key={category}
                                      category={category}
                                      items={items}
                                      day={day}
                                      serviceTime={st.key}
                                      menuSelections={menuSelections}
                                      onToggle={toggleMenuItem}
                                    />
                                  ))}
                                </div>
                              )}
                            </AccordionContent>
                          </AccordionItem>
                        );
                      })}
                    </Accordion>
                  </TabsContent>
                )
              )}
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Add-ons */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Add-ons</CardTitle>
            <CardDescription>
              Enhance your event with extras — staff, counters, decorations, and
              more.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {Object.keys(addonsByType).length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">
                No add-ons available at the moment. You can proceed to the next
                step.
              </p>
            ) : (
              <div className="space-y-8">
                {Object.entries(addonsByType).map(([type, typeAddons]) => (
                  <div key={type}>
                    <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                      {type.replaceAll("_", " ")}
                    </h3>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {typeAddons.map((addon) => {
                        const qty = addonSelections[addon.id] ?? 0;
                        return (
                          <div
                            key={addon.id}
                            className={`flex items-center gap-4 rounded-lg border p-4 transition-colors ${
                              qty > 0
                                ? "border-[#0d4f4f]/30 bg-[#0d4f4f]/5"
                                : ""
                            }`}
                          >
                            <div className="flex-1">
                              <p className="text-sm font-medium">{addon.name}</p>
                              {addon.description && (
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                  {addon.description}
                                </p>
                              )}
                              <p className="mt-1 text-sm font-semibold text-[#c5973e]">
                                {formatCurrency(addon.price)}
                                <span className="text-xs font-normal text-muted-foreground">
                                  {" "}/ unit
                                </span>
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="size-7 p-0"
                                onClick={() => updateAddonQty(addon.id, -1)}
                                disabled={qty === 0}
                              >
                                <Minus className="size-3" />
                              </Button>
                              <span className="w-8 text-center text-sm font-medium">
                                {qty}
                              </span>
                              <Button
                                size="sm"
                                variant="outline"
                                className="size-7 p-0"
                                onClick={() => updateAddonQty(addon.id, 1)}
                              >
                                <Plus className="size-3" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 4: Review & Quote */}
      {currentStep === 3 && (
        <div className="space-y-6">
          {/* Event Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Event Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
                <div>
                  <span className="text-muted-foreground">Days</span>
                  <p className="font-medium">{eventDetails.numDays}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Default Guests</span>
                  <p className="font-medium">{eventDetails.defaultGuests}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Date</span>
                  <p className="font-medium">
                    {eventDetails.eventDate || "Not specified"}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Contact</span>
                  <p className="font-medium">{eventDetails.contactName}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Day-by-Day Breakdown */}
          {Array.from({ length: eventDetails.numDays }, (_, i) => i + 1).map(
            (day) => {
              const daySelections = menuSelections[day];
              const dayGuestCounts = guestCounts[day];
              if (!daySelections) return null;

              const hasItems = Object.values(daySelections).some(
                (items) => items.length > 0
              );
              if (!hasItems) return null;

              return (
                <ReviewDayCard
                  key={day}
                  day={day}
                  daySelections={daySelections}
                  dayGuestCounts={dayGuestCounts}
                  menuItems={menuItems}
                />
              );
            }
          )}

          {/* Add-ons Summary */}
          {Object.entries(addonSelections).some(([, qty]) => qty > 0) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Add-ons</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {Object.entries(addonSelections)
                  .filter(([, qty]) => qty > 0)
                  .map(([addonId, qty]) => {
                    const addon = addons.find((a) => a.id === addonId);
                    if (!addon) return null;
                    return (
                      <div
                        key={addonId}
                        className="flex items-center justify-between text-sm"
                      >
                        <span>
                          {addon.name}{" "}
                          <span className="text-muted-foreground">x{qty}</span>
                        </span>
                        <span className="font-medium">
                          {formatCurrency(addon.price * qty)}
                        </span>
                      </div>
                    );
                  })}
              </CardContent>
            </Card>
          )}

          {/* Grand Total */}
          <Card className="border-[#0d4f4f]/20 bg-[#0d4f4f]/5">
            <CardContent className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <IndianRupee className="size-5 text-[#c5973e]" />
                <span className="text-lg font-semibold">Estimated Total</span>
              </div>
              <span className="text-2xl font-bold text-[#c5973e]">
                {formatCurrency(estimatedTotal)}
              </span>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="mt-8 flex items-center justify-between">
        <Button
          variant="outline"
          onClick={goBack}
          disabled={currentStep === 0}
        >
          <ArrowLeft className="mr-2 size-4" />
          Back
        </Button>

        {currentStep < STEPS.length - 1 ? (
          <Button
            onClick={goNext}
            className="bg-[#0d4f4f] hover:bg-[#0a3d3d]"
          >
            Next
            <ArrowRight className="ml-2 size-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-[#0d4f4f] hover:bg-[#0a3d3d]"
          >
            {submitting ? "Submitting..." : "Submit Quote"}
            {!submitting && <Send className="ml-2 size-4" />}
          </Button>
        )}
      </div>
    </main>
  );
}
