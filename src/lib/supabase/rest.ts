"use client";

export function getUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
}

function getKey() {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
}

let cachedSession: { access_token: string | null; user_id: string | null } | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 30_000;

async function fetchSession(): Promise<{ access_token: string | null; user_id: string | null }> {
  const now = Date.now();
  if (cachedSession && now - cacheTimestamp < CACHE_TTL) {
    return cachedSession;
  }
  try {
    const res = await fetch("/api/auth/session");
    if (!res.ok) return { access_token: null, user_id: null };
    cachedSession = await res.json();
    cacheTimestamp = now;
    return cachedSession!;
  } catch {
    return { access_token: null, user_id: null };
  }
}

export function clearSessionCache() {
  cachedSession = null;
  cacheTimestamp = 0;
}

export async function getUserId(): Promise<string | null> {
  const session = await fetchSession();
  return session.user_id;
}

async function getAccessToken(): Promise<string | null> {
  const session = await fetchSession();
  return session.access_token;
}

function buildHeaders(accessToken?: string | null) {
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
    const token = await getAccessToken();
    const res = await fetch(`${getUrl()}/rest/v1/${table}?${query}`, {
      headers: buildHeaders(token),
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
      headers: buildHeaders(token),
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
      headers: buildHeaders(token),
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
      headers: buildHeaders(token),
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
