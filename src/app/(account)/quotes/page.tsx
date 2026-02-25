"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Calendar, Users, Utensils } from "lucide-react";
import { toast } from "sonner";

import { getUserIdFromCookie } from "@/lib/supabase/rest";
import { supabaseGet } from "@/lib/supabase/rest";
import type { Tables } from "@/types/database";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

type Quote = Tables<"catering_quotes">;

const statusConfig: Record<
  Quote["status"],
  { label: string; className: string }
> = {
  draft: {
    label: "Draft",
    className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  },
  pending: {
    label: "Pending",
    className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  },
  reviewed: {
    label: "Reviewed",
    className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  },
  accepted: {
    label: "Accepted",
    className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  },
  rejected: {
    label: "Rejected",
    className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  },
};

function QuoteCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-5 w-20" />
        </div>
        <Skeleton className="mt-1 h-4 w-32" />
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-28" />
        </div>
        <Skeleton className="h-5 w-24 self-end" />
      </CardContent>
    </Card>
  );
}

export default function QuotesPage() {
  const router = useRouter();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchQuotes() {
      const userId = getUserIdFromCookie();

      if (!userId) {
        router.replace("/login?redirect=/quotes");
        return;
      }

      const { data, error } = await supabaseGet<Quote>(
        "catering_quotes",
        `select=*&user_id=eq.${userId}&order=created_at.desc`
      );

      if (error) {
        toast.error("Failed to load quotes");
        setLoading(false);
        return;
      }

      setQuotes(data ?? []);
      setLoading(false);
    }

    fetchQuotes();
  }, [router]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-8 text-2xl font-bold">My Catering Quotes</h1>
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <QuoteCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (quotes.length === 0) {
    return (
      <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 py-12 text-center">
        <Utensils className="text-muted-foreground size-12" />
        <h1 className="text-2xl font-bold">No quotes yet</h1>
        <p className="text-muted-foreground">
          Plan a catering event and get an instant quote.
        </p>
        <Button asChild>
          <Link href="/catering">Create a Quote</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold">My Catering Quotes</h1>

      <div className="flex flex-col gap-4">
        {quotes.map((quote) => {
          const status = statusConfig[quote.status];
          return (
            <Card key={quote.id}>
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <CardTitle className="text-base">
                    Quote #{quote.id.slice(0, 8)}
                  </CardTitle>
                  <Badge variant="outline" className={status.className}>
                    {status.label}
                  </Badge>
                </div>
                <div className="text-muted-foreground flex items-center gap-1 text-sm">
                  <Calendar className="size-3.5" />
                  {new Date(quote.created_at).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </div>
              </CardHeader>

              <CardContent className="flex flex-col gap-3">
                <div className="text-muted-foreground flex flex-wrap gap-4 text-sm">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="size-3.5" />
                    {quote.num_days} {quote.num_days === 1 ? "day" : "days"}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Users className="size-3.5" />
                    {quote.num_guests} guests
                  </span>
                  {quote.event_date && (
                    <span className="inline-flex items-center gap-1">
                      <Utensils className="size-3.5" />
                      Event:{" "}
                      {new Date(quote.event_date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-semibold">Estimated Total</span>
                  <span className="text-lg font-bold">
                    ₹{quote.estimated_total.toLocaleString("en-IN")}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
