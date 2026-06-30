import type { ReactNode } from "react";
import { LayoutDashboard, LogOut, User } from "lucide-react";
import { logoutAdmin } from "@/app/admin/actions";
import { AdminDashboardNav } from "@/components/admin/AdminDashboardNav";
import { requireAdminSession } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export default async function AdminDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireAdminSession();

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,_rgba(186,230,253,0.72),_transparent_26%),linear-gradient(180deg,_#f8fbff_0%,_#f8fafc_45%,_#fffaf0_100%)] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-5 rounded-[2rem] border border-white/70 bg-white/80 p-8 shadow-[0_30px_120px_-58px_rgba(15,23,42,0.46)] backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
        <div className="grid grid-cols-[40px_1fr] gap-x-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-sky-200 bg-sky-100">
          <User className="h-5 w-5 text-sky-700" />
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-sky-700">
            Admin Potreed
          </p>
          <p className="text-sm text-slate-500">
            Welcome back, Admin 👋
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight leading-tight text-slate-950 lg:text-2xl">
            Monitor engagement dan kelola studio
          </h1>
        </div>
      </div>
        <form action={logoutAdmin}>
          <Button
            type="submit"
            variant="outline"
            className="h-11 rounded-full border-slate-200 bg-white px-5"
          >
            <LogOut className="size-4" />
            Logout
          </Button>
        </form>
      </div>

        <div className="grid gap-6 xl:grid-cols-[240px_minmax(0,1fr)]">
          <AdminDashboardNav />
          <div>{children}</div>
        </div>
      </div>
    </main>
  );
}
