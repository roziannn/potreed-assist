import Link from "next/link";
import { ArrowRight, BadgeCheck } from "lucide-react";
import { FloatingChat } from "@/components/FloatingChat";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { servicePackages } from "@/lib/site-data";

export default function PackagesPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,_rgba(186,230,253,0.7),_transparent_28%),linear-gradient(180deg,_#f8fbff_0%,_#f8fafc_45%,_#fff7ed_100%)] pb-24">
      <Navbar />
      <FloatingChat />

      <section className="mx-auto max-w-6xl px-4 pt-14 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase text-sky-700">
              Jasa & Biaya
            </p>
            <h1 className="mt-3 text-5xl font-bold tracking-tight text-slate-950 sm:text-6xl">
              Daftar package yang
              <span className="block text-sky-600">siap dipilih calon client.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
              Semua paket disusun untuk memudahkan calon client membandingkan budget, kebutuhan coverage, dan hasil akhir tanpa harus chat panjang dulu.
            </p>
          </div>

          <div className="rounded-[2rem] border border-white/70 bg-white/80 p-5 shadow-[0_24px_90px_-48px_rgba(14,116,144,0.45)] backdrop-blur-xl">
            <p className="text-sm font-medium text-slate-500">Tanya potreed.</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              Bingung pilih paket?
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Gunakan floating AI untuk tanya harga, tanggal, atau paket paling pas sesuai budget.
            </p>
            <Link
              href="/schedule"
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-sky-700"
            >
              Cek jadwal dulu
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-5 lg:grid-cols-2">
          {servicePackages.map((pkg) => (
            <article
              key={pkg.name}
              className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_24px_100px_-56px_rgba(15,23,42,0.5)] backdrop-blur-xl"
            >
              <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold uppercase text-sky-700">
                    {pkg.category}
                  </span>
                  <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
                    {pkg.name}
                  </h2>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold uppercase text-slate-400">
                    Mulai dari
                  </p>
                  <p className="mt-1 text-2xl font-black text-slate-950">{pkg.price}</p>
                </div>
              </div>

              <div className="mb-5 inline-flex rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-700">
                {pkg.badge}
              </div>
              <p className="text-sm leading-7 text-slate-600">{pkg.description}</p>

              <div className="mt-6 grid gap-3">
                {pkg.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                    <BadgeCheck className="size-4 text-sky-600" />
                    {feature}
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <Button className="h-11 rounded-full bg-slate-900 px-5 text-white hover:bg-slate-800">
                  Tanya paket ini
                </Button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
