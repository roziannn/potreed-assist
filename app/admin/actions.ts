"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export type LoginFormState = { error?: string; success?: boolean };

export async function loginAdmin(
  _prevState: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return { error: "Email atau password salah." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  if (profile?.role !== "admin") {
    await supabase.auth.signOut();
    return { error: "Akun ini tidak memiliki akses admin." };
  }

  return { success: true };
}

export async function logoutAdmin() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}