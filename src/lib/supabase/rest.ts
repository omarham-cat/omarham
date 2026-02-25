"use client";

export function getUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
}

function getKey() {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
}

function getCookiePrefix(): string {
  try {
    return `sb-${new URL(getUrl()).hostname.split(".")[0]}-auth-token`;
  } catch {
    return "sb-auth-token";
  }
}

function readSessionFromCookies(): Record<string, unknown> | null {
  try {
    const prefix = getCookiePrefix();
    const cookies = document.cookie.split("; ");

    const exact = cookies.find((c) => c.startsWith(`${prefix}=`));
    if (exact) {
      const val = decodeURIComponent(exact.split("=").slice(1).join("="));
      return JSON.parse(val);
    }

    const chunks: string[] = [];
    for (let i = 0; ; i++) {
      const chunk = cookies.find((c) => c.startsWith(`${prefix}.${i}=`));
      if (!chunk) break;
      chunks.push(decodeURIComponent(chunk.split("=").slice(1).join("=")));
    }
    if (chunks.length > 0) {
      return JSON.parse(chunks.join(""));
    }

    return null;
  } catch {
    return null;
  }
}

export function getUserIdFromCookie(): string | null {
  try {
    const session = readSessionFromCookies();
    if (!session) return null;
    const token = (session.access_token as string) ?? (Array.isArray(session) ? session[0] : null);
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.sub ?? null;
  } catch {
    return null;
  }
}

function getAccessToken(): string | null {
  try {
    const session = readSessionFromCookies();
    if (!session) return null;
    return (session.access_token as string) ?? (Array.isArray(session) ? session[0] : null) ?? null;
  } catch {
    return null;
  }
}

function headers(accessToken?: string | null) {
  const key = getKey();
  return {
    apikey: key,
    Authorization: `Bearer ${accessToken || key}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  };
}

export async function supabaseGet<T = unknown>(
  table: string,
  query = "select=*",
): Promise<{ data: T[] | null; error: string | null }> {
  try {
    const token = getAccessToken();
    const res = await fetch(`${getUrl()}/rest/v1/${table}?${query}`, {
      headers: headers(token),
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
  const token = getAccessToken();
  try {
    const res = await fetch(`${getUrl()}/rest/v1/${table}`, {
      method: "POST",
      headers: headers(token),
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
  const token = getAccessToken();
  try {
    const res = await fetch(`${getUrl()}/rest/v1/${table}?${match}`, {
      method: "PATCH",
      headers: headers(token),
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
  const token = getAccessToken();
  try {
    const res = await fetch(`${getUrl()}/rest/v1/${table}?${match}`, {
      method: "DELETE",
      headers: headers(token),
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
