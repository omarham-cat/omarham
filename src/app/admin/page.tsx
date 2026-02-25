import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MOCK_PRODUCTS_RAW } from "@/lib/mock-data";

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  return url.startsWith("https://") && !url.includes("your-project");
}

export default async function AdminDashboard() {
  let totalProducts = 0;
  let totalOrders = 0;
  let totalQuotes = 0;
  let totalRevenue = 0;

  if (isSupabaseConfigured()) {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();

    const [productsRes, ordersRes, quotesRes, revenueRes] = await Promise.all([
      supabase.from("products").select("id", { count: "exact", head: true }),
      supabase.from("orders").select("id", { count: "exact", head: true }),
      supabase.from("catering_quotes").select("id", { count: "exact", head: true }),
      supabase.from("orders").select("total"),
    ]);

    totalProducts = productsRes.count ?? 0;
    totalOrders = ordersRes.count ?? 0;
    totalQuotes = quotesRes.count ?? 0;
    totalRevenue =
      revenueRes.data?.reduce((sum, o) => sum + (o.total || 0), 0) ?? 0;
  } else {
    totalProducts = MOCK_PRODUCTS_RAW.length;
    totalOrders = 5;
    totalQuotes = 3;
    totalRevenue = 24750;
  }

  const stats = [
    { title: "Total Products", value: totalProducts },
    { title: "Total Orders", value: totalOrders },
    { title: "Total Quotes", value: totalQuotes },
    {
      title: "Total Revenue",
      value: `₹${totalRevenue.toLocaleString("en-IN")}`,
    },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
