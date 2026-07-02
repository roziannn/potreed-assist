"use client";

import { CheckCircle2, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type ToastItem = {
  id: number;
  title: string;
  description?: string;
  variant?: "success" | "error";
};

type ToastContextValue = {
  showToast: (title: string, description?: string, variant?: "success" | "error") => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const pathname = usePathname();

    const showToast = useCallback((title: string, description?: string, variant: "success" | "error" = "success") => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, title, description, variant }]);

    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3200);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const toastParam = params.get("toast");

    if (!toastParam) {
      return;
    }

    if (toastParam === "login-success") {
      showToast("Login berhasil", "Selamat datang di dashboard admin.", "success");
    }

    if (toastParam === "login-failed") {
      showToast("Login gagal", "Periksa kembali kredensial Anda.", "error");
    }

    params.delete("toast");
    const nextUrl = `${pathname}${params.toString() ? `?${params.toString()}` : ""}`;
    window.history.replaceState({}, "", nextUrl);
  }, [pathname, showToast]);

  return (
    <ToastContext.Provider value={useMemo(() => ({ showToast }), [showToast])}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex justify-center px-4">
        <div className="flex w-full max-w-md flex-col gap-2">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`flex items-start justify-between gap-3 rounded-2xl px-4 py-3 backdrop-blur ${
                toast.variant === "error"
                  ? "border border-rose-200/80 bg-white/95 shadow-[0_20px_60px_-28px_rgba(244,63,94,0.15)]"
                  : "border border-emerald-200/80 bg-white/95 shadow-[0_20px_60px_-28px_rgba(16,185,129,0.55)]"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`mt-0.5 rounded-full p-1 ${
                    toast.variant === "error" ? "bg-rose-100 text-rose-600" : "bg-emerald-100 text-emerald-600"
                  }`}
                >
                  {toast.variant === "error" ? <X className="size-4" /> : <CheckCircle2 className="size-4" />}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{toast.title}</p>
                  {toast.description ? <p className="text-sm text-slate-600">{toast.description}</p> : null}
                </div>
              </div>
              <button
                type="button"
                aria-label="Tutup notifikasi"
                onClick={() => setToasts((prev) => prev.filter((item) => item.id !== toast.id))}
                className="text-slate-400 transition hover:text-slate-700"
              >
                <X className="size-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  return context;
}
