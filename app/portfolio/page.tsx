import { Camera, Sparkles } from "lucide-react";
import { FloatingChat } from "@/components/FloatingChat";
import { Navbar } from "@/components/Navbar";
import { portfolioHighlights } from "@/lib/site-data";

export default function PortfolioPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.2),_transparent_22%),radial-gradient(circle_at_bottom_right,_rgba(186,230,253,0.65),_transparent_28%),linear-gradient(180deg,_#fffdf8_0%,_#f8fafc_55%,_#eff6ff_100%)] pb-24">
      <Navbar />
      <FloatingChat />

      <section className="mx-auto max-w-6xl px-4 pt-14 sm:px-6">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-100 bg-white/80 px-4 py-2 text-sm font-semibold text-amber-700 backdrop-blur">
            <Sparkles className="size-4" />
            Portfolio Highlights
          </div>
          <h1 className="mt-5 text-5xl font-black tracking-tight text-slate-950 sm:text-6xl">
            Karya yang membantu client
            <span className="block text-amber-600">membayangkan hasil akhirnya.</span>
          </h1>
          <p className="mt-5 text-base leading-7 text-slate-600">
            Halaman ini dibuat untuk memperlihatkan arah visual studio dengan layout yang tetap ringan di ponsel dan terasa lebih editorial di desktop.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-5 lg:grid-cols-3">
          {portfolioHighlights.map((item, index) => (
            <article
              key={item.title}
              className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 shadow-[0_24px_100px_-56px_rgba(15,23,42,0.5)] backdrop-blur-xl"
            >
              <div className="flex aspect-[4/5] items-end bg-[linear-gradient(160deg,_rgba(14,165,233,0.15),_rgba(255,255,255,0.2),_rgba(251,191,36,0.3))] p-6">
                <div className="rounded-[1.75rem] bg-white/80 p-5 backdrop-blur">
                  <div className="mb-3 flex items-center justify-between gap-4">
                    <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
                      {item.tag}
                    </span>
                    <Camera className="size-4 text-slate-400" />
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                    {item.title}
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                    Frame 0{index + 1}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
