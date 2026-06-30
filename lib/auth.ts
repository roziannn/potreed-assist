import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const SESSION_COOKIE = "potreed-admin-session";

const adminCredentials = {
  email: process.env.ADMIN_EMAIL ?? "admin@potreed.ai",
  password: process.env.ADMIN_PASSWORD ?? "admin12345",
};

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value === "authenticated";
}

export async function requireAdminSession() {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    redirect("/admin/login");
  }
}

export async function createAdminSession() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, "authenticated", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export function validateAdminCredentials(email: string, password: string) {
  return (
    email.trim().toLowerCase() === adminCredentials.email.toLowerCase() &&
    password === adminCredentials.password
  );
}
