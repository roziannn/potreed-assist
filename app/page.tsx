import { Navbar } from "@/components/Navbar";
import { FloatingChat } from "@/components/FloatingChat";
import { ConsultationModal } from "@/components/ConsultationModal";
import { supabase } from "@/lib/supabase";
import { ArrowRight, Flame, Sparkles } from "lucide-react";
import Link from "next/link";

type PortfolioSnapshot = {
  id: string;
  kategori: string;
  judul: string;
  deskripsi: string;
};

type SettingsData = {
  nomor_whatsapp?: string | null;
};

const normalizeWhatsAppNumber = (value?: string) => {
  const digits = (value ?? "").replace(/\D/g, "");
  return digits.startsWith("0") ? `62${digits.slice(1)}` : digits;
};

export default async function LandingPage() {
  const { data: settings } = await supabase
    .from("settings")
    .select("nomor_whatsapp")
    .eq("id", 1)
    .single();

  const whatsappNumber = normalizeWhatsAppNumber(settings?.nomor_whatsapp);
  const whatsappHref = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        "Halo, saya mau konsultasi sesi foto POTREED."
      )}`
    : "/contact";

  const { data: portfolios } = await supabase
    .from("portfolios")
    .select("id, kategori, judul, deskripsi")
    .order("created_at", { ascending: false })
    .limit(3);

  const snapshotItems = (portfolios ?? []) as PortfolioSnapshot[];

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(186,230,253,0.8),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(253,230,138,0.45),_transparent_28%),linear-gradient(180deg,_#f8fbff_0%,_#f8fafc_45%,_#eff6ff_100%)] pb-24 font-sans">
      <Navbar />
      <FloatingChat />
      <section className="mx-auto grid max-w-6xl gap-10 px-4 pt-14 sm:px-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:items-center lg:pt-20">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-sky-100 bg-white/75 px-4 py-2 text-sm font-semibold text-sky-700 shadow-sm backdrop-blur">
            <Sparkles className="size-4" />
            Where Beautiful Moments Begin
          </div>

          <h1 className="max-w-4xl text-4xl font-bold leading-none tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
            Semua kebutuhan foto dan video
            <span className="block text-sky-600">
              capture momen spesialmu
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            Potreed menghadirkan layanan foto dan video untuk wedding, wisuda,
            prewedding, hingga berbagai momen spesial lainnya. Jelajahi paket,
            cek ketersediaan jadwal.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/packages"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-slate-900 px-6 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Lihat Paket
              <ArrowRight className="size-4" />
            </Link>

            <a
              href={whatsappHref}
              target={whatsappNumber ? "_blank" : undefined}
              rel={whatsappNumber ? "noreferrer" : undefined}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-sky-100 bg-white/80 px-6 text-sm font-semibold text-sky-700 transition hover:bg-sky-50"
            >
              Konsultasi Gratis
            </a>
          </div>
        </div>

        <div className="rounded-[2.25rem] border border-white/70 bg-white/75 p-4 shadow-[0_30px_120px_-48px_rgba(14,116,144,0.42)] backdrop-blur-xl">
          <div className="rounded-[1.8rem] bg-[linear-gradient(145deg,_rgba(14,165,233,0.16),_rgba(255,255,255,0.95)_55%,_rgba(251,191,36,0.12))] p-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                {/* <p className="text-sm font-semibold text-slate-500">New</p> */}
                <div className="flex items-center gap-2">
                  <Flame className="size-5 text-orange-500 drop-shadow-[0_0_12px_rgba(251,146,60,0.7)]" />
                  <h2 className="text-2xl font-bold text-slate-900">Portfolio snapshot</h2>
                </div>
              </div>
              <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-sky-700">
                New shoots
              </span>
            </div>
            <div className="space-y-3">
              {snapshotItems.map((item, index) => (
                <Link key={item.id} href={`/portfolio/${item.id}`} className="group block rounded-[1.5rem] border border-white/80 bg-white/85 p-4 shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:border-sky-200 hover:bg-white cursor-pointer">
                  <div className="mb-2 flex items-center justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-slate-900">{item.judul}</h3>
                      <p className="text-sm font-medium text-sky-700">{item.kategori}</p>
                    </div>
                    <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-sky-600">
                      0{index + 1}
                      <ArrowRight className="size-4 text-sky-500 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-1" />
                    </span>
                  </div>
                  <p className="text-sm leading-6 text-slate-600">{item.deskripsi}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <ConsultationModal />
{/* 
      <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div className="grid gap-6 rounded-[2.25rem] border border-white/70 bg-white/70 p-6 shadow-[0_24px_100px_-55px_rgba(15,23,42,0.45)] backdrop-blur-xl lg:grid-cols-[minmax(0,1fr)_340px]">
          <div>
            <p className="text-sm font-medium text-amber-700">Potreed Social Preview</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Social proof yang tetap terasa premium
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
              Area ini sekarang lebih aman untuk mobile dan bisa dipakai nanti untuk embed Instagram, TikTok, atau reels teaser tanpa membuat layout utama patah di layar kecil.
            </p>
          </div>
          <div className="rounded-[1.8rem] border border-amber-100 bg-[linear-gradient(160deg,_rgba(255,255,255,0.92),_rgba(254,243,199,0.72))] p-5">
            <p className="text-sm font-semibold text-slate-900">Preview embed</p>
            <div className="mt-4 flex aspect-[4/5] items-center justify-center rounded-[1.5rem] border border-dashed border-amber-200 bg-white/80 px-6 text-center text-sm leading-6 text-slate-500">
              Tempat aman untuk embed social media post tanpa merusak responsivitas halaman.
            </div>
          </div>
        </div>
      </section> */}
    </main>
  );
}
