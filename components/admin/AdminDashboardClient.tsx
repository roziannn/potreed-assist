"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import {
  BarChart3,
  CalendarDays,
  Menu,
  ImagePlus,
  MessageSquareQuote,
  PackagePlus,
  Sparkles,
  X,
} from "lucide-react";
import {
  bookingDateInsights,
  budgetRanges,
  engagementSummary,
  mostCheckedPackages,
  servicePackages,
  topGuestQuestions,
} from "@/lib/site-data";
import { Button } from "@/components/ui/button";

function generateCaption(input: {
  title: string;
  category: string;
  description: string;
  tone: string;
}) {
  const toneMap: Record<string, string> = {
    elegan: "mengalir elegan dan terasa premium",
    hangat: "hangat, dekat, dan natural",
    editorial: "lebih bold, rapi, dan terasa editorial",
  };

  const toneText = toneMap[input.tone] ?? toneMap.hangat;
  return `${input.title || "Sesi terbaru"} dari kategori ${
    input.category || "portfolio"
  } hadir dengan visual yang ${toneText}. ${
    input.description || "Momen utamanya terasa intim dan penuh detail kecil."
  } Jika kamu ingin konsep serupa, tim kami bisa bantu siapkan moodboard dan paket yang paling pas.`;
}

export function AdminDashboardClient() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [packageName, setPackageName] = useState("");
  const [packageCategory, setPackageCategory] = useState("Wedding");
  const [packagePrice, setPackagePrice] = useState("");
  const [packageHighlight, setPackageHighlight] = useState("");
  const [portfolioTitle, setPortfolioTitle] = useState("");
  const [portfolioCategory, setPortfolioCategory] = useState("Wedding");
  const [portfolioDescription, setPortfolioDescription] = useState("");
  const [captionTone, setCaptionTone] = useState("hangat");
  const [generatedCaption, setGeneratedCaption] = useState("");

  const totalPackageViews = useMemo(
    () => mostCheckedPackages.reduce((total, item) => total + item.views, 0),
    []
  );

  const menuItems = [
    {
      href: "#engagement",
      label: "Engagement Summary",
      icon: BarChart3,
    },
    {
      href: "#packages",
      label: "Upload Package",
      icon: PackagePlus,
    },
    {
      href: "#portfolio",
      label: "Portfolio & Caption",
      icon: ImagePlus,
    },
  ];

  return (
    <div className="grid gap-6 xl:grid-cols-[240px_minmax(0,1fr)]">
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
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
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
              items={menuItems}
              onNavigate={() => setIsMobileMenuOpen(false)}
            />
          </aside>
        </div>
      ) : null}

      <aside className="hidden h-fit rounded-[2rem] border border-white/70 bg-white/80 p-5 shadow-[0_24px_100px_-48px_rgba(15,23,42,0.4)] backdrop-blur-xl xl:block">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
          Admin Menu
        </p>
        <AdminMenu items={menuItems} />
      </aside>

      <div className="space-y-6">
        <section id="engagement" className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_24px_100px_-52px_rgba(14,116,144,0.38)] backdrop-blur-xl">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-medium text-sky-700">Engagement summary</p>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                Ringkasan interaksi calon client
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-slate-500">
              Data ini masih memakai mock analytics supaya alur dashboard dan insight yang dibutuhkan sudah bisa dipakai untuk review UX dan kebutuhan backend berikutnya.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Total klik" value={engagementSummary.totalClicks.toLocaleString("id-ID")} />
            <MetricCard label="Chat dimulai" value={engagementSummary.floatingChatStarts.toLocaleString("id-ID")} />
            <MetricCard label="Klik konsultasi" value={engagementSummary.consultationClicks.toLocaleString("id-ID")} />
            <MetricCard label="Intent booking" value={engagementSummary.bookingIntent.toLocaleString("id-ID")} />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <InsightPanel
              icon={<MessageSquareQuote className="size-4" />}
              title="Pertanyaan paling sering"
              subtitle="Apa yang paling sering ditanya guest calon client"
            >
              {topGuestQuestions.map((item) => (
                <div key={item.topic} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <span className="text-sm text-slate-700">{item.topic}</span>
                  <span className="text-sm font-semibold text-sky-700">{item.count}x</span>
                </div>
              ))}
            </InsightPanel>

            <InsightPanel
              icon={<Sparkles className="size-4" />}
              title="Paket yang sering dicek"
              subtitle={`Total page/package views: ${totalPackageViews.toLocaleString("id-ID")}`}
            >
              {mostCheckedPackages.map((item) => (
                <div key={item.name} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <span className="text-sm text-slate-700">{item.name}</span>
                  <span className="text-sm font-semibold text-sky-700">{item.views} view</span>
                </div>
              ))}
            </InsightPanel>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <InsightPanel
              icon={<CalendarDays className="size-4" />}
              title="Pola pilihan tanggal"
              subtitle="Bedakan orang yang benar-benar berniat booking vs sekadar eksplor tanggal"
            >
              {bookingDateInsights.map((item) => (
                <div key={item.label} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  <div className="mb-2 font-semibold text-slate-900">{item.label}</div>
                  <div className="flex items-center justify-between">
                    <span>Intent booking</span>
                    <span className="font-semibold text-sky-700">{item.intent} orang</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <span>Sekadar klik tanggal</span>
                    <span className="font-semibold text-amber-600">{item.curiosity} orang</span>
                  </div>
                </div>
              ))}
            </InsightPanel>

            <InsightPanel
              icon={<BarChart3 className="size-4" />}
              title="Budget range terbanyak"
              subtitle="Bisa dipakai untuk menyusun positioning harga dan promo"
            >
              {budgetRanges.map((item) => (
                <div key={item.label} className="rounded-2xl bg-slate-50 px-4 py-3">
                  <div className="mb-2 flex items-center justify-between text-sm text-slate-700">
                    <span>{item.label}</span>
                    <span className="font-semibold text-sky-700">{item.share}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-200">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-sky-500 to-cyan-400"
                      style={{ width: item.share }}
                    />
                  </div>
                </div>
              ))}
            </InsightPanel>
          </div>
        </section>

        <section id="packages" className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_24px_100px_-52px_rgba(15,23,42,0.34)] backdrop-blur-xl">
          <div className="mb-6">
            <p className="text-sm font-medium text-sky-700">Package manager</p>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Upload package jasa dan biaya
            </h2>
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nama package">
                <input
                  value={packageName}
                  onChange={(event) => setPackageName(event.target.value)}
                  placeholder="Contoh: Wedding Sunset Story"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                />
              </Field>
              <Field label="Kategori">
                <select
                  value={packageCategory}
                  onChange={(event) => setPackageCategory(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                >
                  <option>Wedding</option>
                  <option>Wisuda</option>
                  <option>Custom</option>
                </select>
              </Field>
              <Field label="Harga">
                <input
                  value={packagePrice}
                  onChange={(event) => setPackagePrice(event.target.value)}
                  placeholder="Rp4.500.000"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                />
              </Field>
              <Field label="Highlight package">
                <input
                  value={packageHighlight}
                  onChange={(event) => setPackageHighlight(event.target.value)}
                  placeholder="Cocok untuk akad + intimate reception"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                />
              </Field>
              <div className="sm:col-span-2">
                <Button className="h-11 rounded-2xl bg-slate-900 px-5 text-white hover:bg-slate-800">
                  Simpan draft package
                </Button>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-4">
              <p className="mb-4 text-sm font-semibold text-slate-900">Package aktif saat ini</p>
              <div className="space-y-3">
                {servicePackages.slice(0, 4).map((pkg) => (
                  <div key={pkg.name} className="rounded-2xl border border-white bg-white p-4">
                    <div className="mb-1 flex items-center justify-between gap-3">
                      <span className="font-semibold text-slate-900">{pkg.name}</span>
                      <span className="text-xs text-sky-700">{pkg.category}</span>
                    </div>
                    <p className="text-sm text-slate-500">{pkg.price}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="portfolio" className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_24px_100px_-52px_rgba(217,119,6,0.32)] backdrop-blur-xl">
          <div className="mb-6">
            <p className="text-sm font-medium text-amber-700">Portfolio manager</p>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Upload portfolio dan generate AI caption
            </h2>
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-4">
              <Field label="Judul portfolio">
                <input
                  value={portfolioTitle}
                  onChange={(event) => setPortfolioTitle(event.target.value)}
                  placeholder="Contoh: Akad pagi di rumah keluarga"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                />
              </Field>
              <Field label="Kategori">
                <select
                  value={portfolioCategory}
                  onChange={(event) => setPortfolioCategory(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                >
                  <option>Wedding</option>
                  <option>Wisuda</option>
                  <option>Custom</option>
                </select>
              </Field>
              <Field label="Deskripsi momen">
                <textarea
                  value={portfolioDescription}
                  onChange={(event) => setPortfolioDescription(event.target.value)}
                  rows={4}
                  placeholder="Ceritakan mood, lokasi, dan detail utama sesi foto"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                />
              </Field>
              <Field label="Tone caption">
                <select
                  value={captionTone}
                  onChange={(event) => setCaptionTone(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                >
                  <option value="hangat">Hangat</option>
                  <option value="elegan">Elegan</option>
                  <option value="editorial">Editorial</option>
                </select>
              </Field>
              <div className="flex flex-wrap gap-3">
                <Button
                  type="button"
                  className="h-11 rounded-2xl bg-amber-500 px-5 text-white hover:bg-amber-600"
                  onClick={() =>
                    setGeneratedCaption(
                      generateCaption({
                        title: portfolioTitle,
                        category: portfolioCategory,
                        description: portfolioDescription,
                        tone: captionTone,
                      })
                    )
                  }
                >
                  Generate AI caption
                </Button>
                <Button type="button" variant="outline" className="h-11 rounded-2xl">
                  Upload foto
                </Button>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-amber-100 bg-amber-50/60 p-4">
              <p className="mb-3 text-sm font-semibold text-slate-900">Draft caption</p>
              <div className="min-h-52 rounded-2xl border border-white/80 bg-white p-4 text-sm leading-6 text-slate-600">
                {generatedCaption || "Caption hasil AI akan muncul di sini setelah admin isi brief singkat portfolio."}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function AdminMenu({
  items,
  onNavigate,
}: {
  items: {
    href: string;
    label: string;
    icon: typeof BarChart3;
  }[];
  onNavigate?: () => void;
}) {
  return (
    <nav className="space-y-2 text-sm">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <a
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className="flex items-center gap-3 rounded-2xl px-3 py-2 text-slate-700 transition hover:bg-sky-50 hover:text-sky-700"
          >
            <Icon className="size-4" />
            {item.label}
          </a>
        );
      })}
    </nav>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.75rem] border border-slate-100 bg-slate-50 p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
    </div>
  );
}

function InsightPanel({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string;
  subtitle: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="rounded-[1.75rem] border border-slate-100 bg-white p-5">
      <div className="mb-4 flex items-start gap-3">
        <div className="rounded-2xl bg-sky-50 p-2 text-sky-700">{icon}</div>
        <div>
          <h3 className="font-semibold text-slate-900">{title}</h3>
          <p className="text-sm text-slate-500">{subtitle}</p>
        </div>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}
