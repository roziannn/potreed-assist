"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, ImagePlus, Menu, PackagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const menuItems = [
  {
    href: "/admin/dashboard",
    label: "Summary",
    icon: BarChart3,
  },
  {
    href: "/admin/dashboard/package-manager",
    label: "Package Manager",
    icon: PackagePlus,
  },
  {
    href: "/admin/dashboard/portfolio-manager",
    label: "Portfolio Manager",
    icon: ImagePlus,
  },
];

export function AdminDashboardNav() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <div className="xl:hidden">
        <Button
          type="button"
          variant="outline"
          className="h-11 rounded-full border-sky-100 bg-white/85 px-4"
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <Menu className="size-4" />
          Menu Admin
        </Button>
      </div>

      {isMobileMenuOpen ? (
        <div className="fixed inset-0 z-50 xl:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/35 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Tutup menu admin"
          />
          <aside className="absolute top-0 left-0 flex h-full w-[min(82vw,320px)] flex-col border-r border-white/70 bg-white/95 p-5 shadow-[0_24px_100px_-42px_rgba(15,23,42,0.5)] backdrop-blur-xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase text-slate-400">
                  Admin Menu
                </p>
                <p className="mt-1 text-lg font-bold text-slate-900">Navigasi Dashboard</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="rounded-full"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="size-4" />
              </Button>
            </div>
            <AdminMenu
              pathname={pathname}
              onNavigate={() => setIsMobileMenuOpen(false)}
            />
          </aside>
        </div>
      ) : null}

      <aside className="hidden h-fit rounded-[2rem] border border-white/70 bg-white/80 p-5 shadow-[0_24px_100px_-48px_rgba(15,23,42,0.4)] backdrop-blur-xl xl:block">
        <p className="mb-4 text-sm font-semibold uppercase text-slate-400">
          Admin Menu
        </p>
        <AdminMenu pathname={pathname} />
      </aside>
    </>
  );
}

function AdminMenu({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="space-y-2 text-sm">
      {menuItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-2xl px-3 py-2 transition ${
              isActive
                ? "bg-sky-100 text-sky-800"
                : "text-slate-700 hover:bg-sky-50 hover:text-sky-700"
            }`}
          >
            <Icon className="size-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
