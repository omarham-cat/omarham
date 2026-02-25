import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface QuoteRequest {
  numDays: number;
  numGuests: number;
  menuSelections: { [dayNumber: string]: { [serviceTime: string]: string[] } };
  addonSelections: { [addonId: string]: number };
}

type MenuItem = { id: string; name: string; price_per_person: number; service_time: string };
type Addon = { id: string; name: string; price: number };
type DayBreakdown = {
  day: number;
  services: { serviceTime: string; items: string[]; subtotal: number }[];
  dayTotal: number;
};

function calculateDayBreakdown(
  dayNumber: string,
  services: { [serviceTime: string]: string[] },
  menuItemsMap: Map<string, MenuItem>,
  numGuests: number
): DayBreakdown {
  const dayServices = Object.entries(services).map(([serviceTime, itemIds]) => {
    let subtotal = 0;
    const items = itemIds.reduce<string[]>((names, itemId) => {
      const item = menuItemsMap.get(itemId);
      if (item) {
        subtotal += item.price_per_person * numGuests;
        names.push(item.name);
      }
      return names;
    }, []);
    return { serviceTime, items, subtotal };
  });

  const dayTotal = dayServices.reduce((sum, s) => sum + s.subtotal, 0);
  return { day: Number.parseInt(dayNumber, 10), services: dayServices, dayTotal };
}

function calculateAddonsTotal(
  addonSelections: { [addonId: string]: number },
  addonsMap: Map<string, Addon>
): number {
  return Object.entries(addonSelections ?? {}).reduce((total, [addonId, quantity]) => {
    const addon = addonsMap.get(addonId);
    return addon ? total + addon.price * quantity : total;
  }, 0);
}

export async function POST(request: Request) {
  try {
    const { numDays, numGuests, menuSelections, addonSelections } =
      (await request.json()) as QuoteRequest;

    if (!numDays || !numGuests || numDays <= 0 || numGuests <= 0) {
      return NextResponse.json(
        { error: "numDays and numGuests must be positive numbers" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const allMenuItemIds = Object.values(menuSelections).flatMap((services) =>
      Object.values(services).flat()
    );
    const uniqueMenuItemIds = [...new Set(allMenuItemIds)];
    const addonIds = Object.keys(addonSelections ?? {});

    const [menuResult, addonsResult] = await Promise.all([
      uniqueMenuItemIds.length > 0
        ? supabase
            .from("catering_menu_items")
            .select("id, name, price_per_person, service_time")
            .in("id", uniqueMenuItemIds)
        : Promise.resolve({ data: [] as MenuItem[], error: null }),
      addonIds.length > 0
        ? supabase
            .from("catering_addons")
            .select("id, name, price")
            .in("id", addonIds)
        : Promise.resolve({ data: [] as Addon[], error: null }),
    ]);

    if (menuResult.error) {
      console.error("Menu items fetch error:", menuResult.error);
      return NextResponse.json(
        { error: "Failed to fetch menu items" },
        { status: 500 }
      );
    }

    if (addonsResult.error) {
      console.error("Addons fetch error:", addonsResult.error);
      return NextResponse.json(
        { error: "Failed to fetch addons" },
        { status: 500 }
      );
    }

    const menuItemsMap = new Map(
      (menuResult.data ?? []).map((item) => [item.id, item])
    );
    const addonsMap = new Map(
      (addonsResult.data ?? []).map((addon) => [addon.id, addon])
    );

    const perDay = Object.entries(menuSelections).map(([dayNumber, services]) =>
      calculateDayBreakdown(dayNumber, services, menuItemsMap, numGuests)
    );
    const menuTotal = perDay.reduce((sum, d) => sum + d.dayTotal, 0);
    const addonsTotal = calculateAddonsTotal(addonSelections, addonsMap);
    const estimatedTotal = menuTotal + addonsTotal;

    return NextResponse.json({
      estimatedTotal,
      breakdown: { menuTotal, addonsTotal, perDay },
    });
  } catch (error) {
    console.error("Quote calculation error:", error);
    return NextResponse.json(
      { error: "Failed to calculate quote" },
      { status: 500 }
    );
  }
}
