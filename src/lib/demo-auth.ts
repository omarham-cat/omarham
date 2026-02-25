const DEMO_KEY = "omarham_demo_user";

export const DEMO_ADMIN = {
  email: "admin@omarham.com",
  password: "admin123",
  full_name: "Om Arham Admin",
  role: "admin" as const,
};

export type DemoUser = {
  email: string;
  full_name: string;
  role: "customer" | "admin";
};

export function getDemoUser(): DemoUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DEMO_KEY);
    return raw ? (JSON.parse(raw) as DemoUser) : null;
  } catch {
    return null;
  }
}

export function setDemoUser(user: DemoUser): void {
  localStorage.setItem(DEMO_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event("demo-auth-change"));
}

export function clearDemoUser(): void {
  localStorage.removeItem(DEMO_KEY);
  window.dispatchEvent(new Event("demo-auth-change"));
}

export function demoLogin(email: string, password: string): DemoUser | null {
  if (email === DEMO_ADMIN.email && password === DEMO_ADMIN.password) {
    const user: DemoUser = {
      email: DEMO_ADMIN.email,
      full_name: DEMO_ADMIN.full_name,
      role: DEMO_ADMIN.role,
    };
    setDemoUser(user);
    return user;
  }
  return null;
}
