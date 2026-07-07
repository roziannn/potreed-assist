"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LockKeyhole, Mail } from "lucide-react";
import { loginAdmin, type LoginFormState } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast-provider";

const initialState: LoginFormState = {};

export function AdminLoginForm() {
  const [state, action, pending] = useActionState(loginAdmin, initialState);
  const { showToast } = useToast();
  const router = useRouter();
  const hasSubmitted = useRef(false);

  useEffect(() => {
    if (state.error) {
      showToast("Login gagal", state.error, "error");
      hasSubmitted.current = true;
    }
  }, [showToast, state.error]);

  useEffect(() => {
    if (hasSubmitted.current && !state.error) return;
    if (!pending && state !== initialState && !state.error) {
      router.push("/admin/dashboard");
      router.refresh();
    }
  }, [state, pending, router]);

  return (
    <form action={action} className="space-y-5">
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700" htmlFor="email">
          Email admin
        </label>
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
          <Mail className="size-4 text-slate-400" />
          <input
            id="email"
            name="email"
            type="email"
            placeholder="admin@potreed.com"
            className="w-full bg-transparent text-sm text-slate-900 outline-none"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700" htmlFor="password">
          Password
        </label>
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
          <LockKeyhole className="size-4 text-slate-400" />
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Masukkan password admin"
            className="w-full bg-transparent text-sm text-slate-900 outline-none"
            required
          />
        </div>
      </div>

      {state.error ? (
        <p className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {state.error}
        </p>
      ) : null}

      <Button
        type="submit"
        className="h-12 w-full rounded-2xl bg-sky-600 text-white hover:bg-sky-700"
        disabled={pending}
      >
        {pending ? <Loader2 className="size-4 animate-spin" /> : "Masuk ke Dashboard"}
      </Button>
    </form>
  );
}