"use client";

import { Button } from "@/components/ui/button";
import {
  Aperture,
  CalendarDays,
  FolderHeart,
  LayoutDashboard,
  MessageSquareQuote,
  WalletCards,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-40 border-b border-white/60 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <Link href="/">
          <span className="flex items-center gap-1 text-2xl leading-none font-bold tracking-tight text-sky-700">
            potreed
            <Aperture className="h-5 w-5" />
          </span>
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <Link href="/packages">
            <Button
              variant="ghost"
              className={navButtonClass(pathname, "/packages")}
            >
              <WalletCards className="size-4" />
              Jasa & Biaya
            </Button>
          </Link>
          <Link href="/portfolio">
            <Button
              variant="ghost"
              className={navButtonClass(pathname, "/portfolio")}
            >
              <FolderHeart className="size-4" />
              Portfolio
            </Button>
          </Link>
          <Link href="/testimonials">
            <Button
              variant="ghost"
              className={navButtonClass(pathname, "/testimonials")}
            >
              <MessageSquareQuote className="size-4" />
              Testimonial
            </Button>
          </Link>
          <Link href="/schedule">
            <Button
              variant="ghost"
              className={navButtonClass(pathname, "/schedule")}
            >
              <CalendarDays className="size-4" />
              Check Schedule
            </Button>
          </Link>
          {/* <Link href="/admin/login">
            <Button className="gap-2 rounded-full bg-slate-900 text-white hover:bg-slate-800">
              <LayoutDashboard className="size-4" />
              Admin
            </Button>
          </Link> */}
        </div>
      </div>
    </nav>
  );
}

function navButtonClass(pathname: string, href: string) {
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  return cn(
    "gap-2 rounded-full border border-transparent px-4 transition-colors",
    isActive
      ? "bg-slate-100 text-slate-900 hover:bg-slate-100"
      : "text-slate-700 hover:bg-white hover:text-slate-900"
  );
}
