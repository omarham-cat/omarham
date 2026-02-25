import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  UtensilsCrossed,
  Coffee,
  Cookie,
  Moon,
  Sunrise,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const serviceTimes = [
  {
    label: "Breakfast",
    icon: Sunrise,
    description: "Start the day with fresh parathas, poha, and chai",
  },
  {
    label: "Lunch",
    icon: UtensilsCrossed,
    description: "Full course meals with starters, mains & desserts",
  },
  {
    label: "Snacks",
    icon: Cookie,
    description: "Evening bites — samosas, chaat, sandwiches & more",
  },
  {
    label: "Dinner",
    icon: UtensilsCrossed,
    description: "Grand dinner spreads for memorable evenings",
  },
  {
    label: "Late Night",
    icon: Moon,
    description: "Keep the party going with midnight munchies",
  },
];

const placeholderEvents = [
  {
    id: "p1",
    title: "Wedding Celebrations",
    description:
      "From mehndi to reception, we craft bespoke menus for every wedding function with elegance and flavour.",
    event_type: "wedding",
    image_url: null,
  },
  {
    id: "p2",
    title: "Corporate Events",
    description:
      "Impress clients and team members alike with professional catering for conferences, launches, and offsites.",
    event_type: "corporate",
    image_url: null,
  },
  {
    id: "p3",
    title: "Birthday Parties",
    description:
      "Make birthdays extra special with customised menus, themed snacks, and show-stopping dessert tables.",
    event_type: "birthday",
    image_url: null,
  },
  {
    id: "p4",
    title: "Festival Gatherings",
    description:
      "Celebrate Eid, Diwali, Holi, or any festival with traditional delicacies prepared with love.",
    event_type: "festival",
    image_url: null,
  },
];

const eventTypeColors: Record<string, "default" | "secondary" | "outline"> = {
  wedding: "default",
  corporate: "secondary",
  birthday: "outline",
  festival: "default",
};

export default async function CateringPage() {
  let displayEvents = placeholderEvents as typeof placeholderEvents;

  try {
    const supabase = await createClient();
    const { data: events } = await supabase
      .from("catering_events")
      .select("*")
      .order("created_at", { ascending: false });
    if (events && events.length > 0) {
      displayEvents = events as typeof placeholderEvents;
    }
  } catch {
    // Supabase not configured, use placeholder events
  }

  return (
    <main>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0d4f4f]/5 via-[#c5973e]/5 to-[#0d4f4f]/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(13,79,79,0.18),transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-4">
              <Coffee className="mr-1 size-3" />
              Trusted by 500+ events
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              Catering Services
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gray-600 sm:text-xl">
              From intimate gatherings to grand celebrations, we bring
              extraordinary flavours to every occasion. Let us make your event
              truly memorable with our curated menus and impeccable service.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Button
                size="lg"
                className="bg-[#0d4f4f] hover:bg-[#0a3d3d]"
                asChild
              >
                <Link href="/catering/quote">
                  Get a Quote
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#events">View Our Work</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Service Times */}
      <section className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              We Cover Every Meal
            </h2>
            <p className="mt-2 text-muted-foreground">
              Five service times to keep your guests delighted all day long
            </p>
          </div>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
            {serviceTimes.map((time) => (
              <div
                key={time.label}
                className="group flex flex-col items-center rounded-xl border bg-gray-50/50 p-6 text-center transition-all hover:border-[#0d4f4f]/20 hover:bg-[#0d4f4f]/5 hover:shadow-sm"
              >
                <div className="mb-3 flex size-14 items-center justify-center rounded-full bg-[#0d4f4f]/10 text-[#c5973e] transition-colors group-hover:bg-[#0d4f4f]/20">
                  <time.icon className="size-6" />
                </div>
                <h3 className="font-semibold">{time.label}</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {time.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Events Showcase */}
      <section id="events" className="bg-gray-50/50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Events We Cater
            </h2>
            <p className="mt-2 text-muted-foreground">
              Every event deserves a culinary experience that matches its spirit
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {displayEvents.map((event) => (
              <Card
                key={event.id}
                className="group overflow-hidden py-0 transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                  {event.image_url ? (
                    <Image
                      src={event.image_url}
                      alt={event.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#0d4f4f]/10 to-[#c5973e]/10">
                      <UtensilsCrossed className="size-10 text-[#c5973e]/40" />
                    </div>
                  )}
                  <div className="absolute right-2 top-2">
                    <Badge
                      variant={
                        eventTypeColors[event.event_type] ?? "secondary"
                      }
                      className="capitalize"
                    >
                      {event.event_type}
                    </Badge>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">{event.title}</CardTitle>
                  {event.description && (
                    <CardDescription className="line-clamp-2">
                      {event.description}
                    </CardDescription>
                  )}
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-[#0d4f4f] to-[#0a3d3d]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center text-white">
            <h2 className="text-2xl font-bold sm:text-3xl">
              Ready to Plan Your Event?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-white/70">
              Tell us about your event and we&apos;ll put together a custom
              quote tailored to your taste, budget, and guest count.
            </p>
            <Button
              size="lg"
              variant="secondary"
              className="mt-8"
              asChild
            >
              <Link href="/catering/quote">
                Get a Quote
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
