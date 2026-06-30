import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { isAdminAuthenticated } from "@/lib/auth";

export default async function AdminLoginPage() {
  if (await isAdminAuthenticated()) {
    redirect("/admin/dashboard");
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(186,230,253,0.85),_transparent_30%),linear-gradient(180deg,_#f8fbff_0%,_#f8fafc_45%,_#eef2ff_100%)] px-4 py-10 sm:px-6">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl gap-8 lg:grid-cols-[minmax(0,1fr)_440px] lg:items-center">
        <section className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-white/80 px-4 py-2 text-sm font-semibold text-sky-700 backdrop-blur">
            <ShieldCheck className="size-4" />
            Admin Access
          </div>
          <h1 className="mt-5 text-5xl font-black tracking-tight text-slate-950 sm:text-6xl">
            Login admin untuk melihat insight dan kelola konten studio.
          </h1>
          <p className="mt-5 text-base leading-7 text-slate-600">
            Flow ini sudah dibuat dengan server action dan cookie sederhana supaya akses ke dashboard punya fondasi yang jelas sebelum nanti disambungkan ke database atau auth provider yang sebenarnya.
          </p>
        </section>

        <section className="rounded-[2.25rem] border border-white/70 bg-white/85 p-6 shadow-[0_30px_120px_-54px_rgba(15,23,42,0.45)] backdrop-blur-xl sm:p-8">
          <p className="text-sm font-medium text-slate-500">Demo credential</p>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Email: <span className="font-semibold text-slate-900">admin@potreed.ai</span>
            <br />
            Password: <span className="font-semibold text-slate-900">admin12345</span>
          </p>
          <div className="mt-6">
            <AdminLoginForm />
          </div>
        </section>
      </div>
    </main>
  );
}
