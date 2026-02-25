"use client";

export function getUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
}

export function getUserIdFromCookie(): string | null {
  try {
    const url = getUrl();
    if (!url) return null;
    const key = `sb-${new URL(url).hostname.split(".")[0]}-auth-token`;
    const raw = document.cookie.split("; ").find((c) => c.startsWith(`${key}=`));
    if (!raw) return null;
    const parsed = JSON.parse(decodeURIComponent(raw.split("=").slice(1).join("=")));
    const token = parsed?.access_token ?? parsed?.[0];
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.sub ?? null;
  } catch {
    return null;
  }
}

function getKey() {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
}

function headers(accessToken?: string) {
  const key = getKey();
  return {
    apikey: key,
    Authorization: `Bearer ${accessToken || key}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  };
}

async function getAccessToken(): Promise<string | null> {
  try {
    const key = `sb-${new URL(getUrl()).hostname.split(".")[0]}-auth-token`;
    const raw = document.cookie
      .split("; ")
      .find((c) => c.startsWith(`${key}=`));
    if (!raw) return null;
    const parsed = JSON.parse(decodeURIComponent(raw.split("=").slice(1).join("=")));
    return parsed?.access_token ?? parsed?.[0] ?? null;
  } catch {
    return null;
  }
}

export async function supabaseGet<T = unknown>(
  table: string,
  query = "select=*",
): Promise<{ data: T[] | null; error: string | null }> {
  try {
    const res = await fetch(`${getUrl()}/rest/v1/${table}?${query}`, {
      headers: headers(),
    });
    if (!res.ok) {
      const body = await res.text();
      return { data: null, error: `${res.status}: ${body}` };
    }
    const data = await res.json();
    return { data, error: null };
  } catch (e) {
    return { data: null, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function supabaseInsert<T = unknown>(
  table: string,
  payload: Record<string, unknown> | Record<string, unknown>[],
): Promise<{ data: T[] | null; error: string | null }> {
  const token = await getAccessToken();
  try {
    const res = await fetch(`${getUrl()}/rest/v1/${table}`, {
      method: "POST",
      headers: headers(token ?? undefined),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const body = await res.text();
      return { data: null, error: `${res.status}: ${body}` };
    }
    const data = await res.json();
    return { data, error: null };
  } catch (e) {
    return { data: null, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function supabaseUpdate<T = unknown>(
  table: string,
  match: string,
  payload: Record<string, unknown>,
): Promise<{ data: T[] | null; error: string | null }> {
  const token = await getAccessToken();
  try {
    const res = await fetch(`${getUrl()}/rest/v1/${table}?${match}`, {
      method: "PATCH",
      headers: headers(token ?? undefined),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const body = await res.text();
      return { data: null, error: `${res.status}: ${body}` };
    }
    const data = await res.json();
    return { data, error: null };
  } catch (e) {
    return { data: null, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function supabaseDelete(
  table: string,
  match: string,
): Promise<{ error: string | null }> {
  const token = await getAccessToken();
  try {
    const res = await fetch(`${getUrl()}/rest/v1/${table}?${match}`, {
      method: "DELETE",
      headers: headers(token ?? undefined),
    });
    if (!res.ok) {
      const body = await res.text();
      return { error: `${res.status}: ${body}` };
    }
    return { error: null };
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
}
