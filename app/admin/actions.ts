"use server";

import { redirect } from "next/navigation";
import {
  clearAdminSession,
  createAdminSession,
  validateAdminCredentials,
} from "@/lib/auth";

export type LoginFormState = {
  error?: string;
};

export async function loginAdmin(
  _prevState: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return {
      error: "Email dan password admin masih wajib diisi.",
    };
  }

  if (!validateAdminCredentials(email, password)) {
    return {
      error: "Kredensial admin belum cocok. Coba cek lagi email atau password-nya.",
    };
  }

  await createAdminSession();
  redirect("/admin/dashboard");
}

export async function logoutAdmin() {
  await clearAdminSession();
  redirect("/admin/login");
}
