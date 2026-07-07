import "server-only";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function getAdminSession() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, email")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") return null;

  return { user, profile };
}

export async function isAdminAuthenticated() {
  const session = await getAdminSession();
  return session !== null;
}

export async function requireAdminSession() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }
  return session;
}

export async function clearAdminSession() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
}