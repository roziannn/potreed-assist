"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  ArrowRight,
  ArrowLeft,
  BadgeCheck,
  Camera,
  Video,
  Megaphone,
  UtensilsCrossed,
  Sparkles,
  Check,
  Heart,
  GraduationCap,
  Briefcase,
  User,
  MapPin,
  Building2,
  Clock,
  CalendarClock,
  Hourglass,
} from "lucide-react";
import { FloatingChat } from "@/components/FloatingChat";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";

type PackageItem = {
  id: string;
  nama_package: string;
  kategori: string;
  harga: number | string;
  highlight_package?: string;
  deskripsi_singkat?: string;
  is_active?: boolean;
};

const serviceTypes = [
  { id: "photo", label: "Pemotretan", icon: Camera },
  { id: "video", label: "Videografi", icon: Video },
  { id: "social", label: "Social Media Campaign", icon: Megaphone },
  { id: "food", label: "Makanan", icon: UtensilsCrossed },
];

const eventTypes = [
  { id: "wedding", label: "Wedding", icon: Heart },
  { id: "wisuda", label: "Wisuda", icon: GraduationCap },
  { id: "corporate", label: "Korporat / Produk", icon: Briefcase },
  { id: "personal", label: "Personal / Lainnya", icon: User },
];

const locationOptions = [
  { id: "studio", label: "Di studio", icon: Building2 },
  { id: "outdoor", label: "Outdoor / lokasi client", icon: MapPin },
];

const durationOptions = [
  { id: "half", label: "Setengah hari (±3 jam)" },
  { id: "full", label: "Full day (±8 jam)" },
  { id: "multi", label: "Lebih dari 1 hari" },
];

const timelineOptions = [
  { id: "urgent", label: "Segera (minggu ini)", icon: Clock },
  { id: "1month", label: "Dalam 1 bulan", icon: CalendarClock },
  { id: "3month", label: "1–3 bulan lagi", icon: CalendarClock },
  { id: "flexible", label: "Masih fleksibel", icon: CalendarClock },
];

const MIN_BUDGET = 500_000;
const MAX_BUDGET = 10_000_000;
const FALLBACK_WHATSAPP_NUMBER = "6281231931";
// step 1-5 pertanyaan, 6 ringkasan, 7 loading, 8 hasil
const QUESTION_STEPS = 6;
const LOADING_STEP = 7;
const RESULT_STEP = 8;

function normalizeWhatsAppNumber(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.startsWith("0") ? `62${digits.slice(1)}` : digits;
}

function createWhatsAppUrl(phone: string, message: string) {
  const normalized = normalizeWhatsAppNumber(phone);
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function parsePriceToNumber(price: string | number) {
  const normalized = typeof price === "number" ? String(price) : price;
  const digitsOnly = normalized.replace(/[^0-9]/g, "");
  return digitsOnly ? Number(digitsOnly) : 0;
}

export default function PackagesPage() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [loadingPackages, setLoadingPackages] = useState(true);

  const [budget, setBudget] = useState(2_500_000);
  const [selectedType, setSelectedType] = useState("");
  const [selectedEvent, setSelectedEvent] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedDuration, setSelectedDuration] = useState("");
  const [selectedTimeline, setSelectedTimeline] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");

  const resetWizard = () => {
    setStep(1);
    setBudget(2_500_000);
    setSelectedType("");
    setSelectedEvent("");
    setSelectedLocation("");
    setSelectedDuration("");
    setSelectedTimeline("");
  };

  useEffect(() => {
    const fetchPackages = async () => {
      setLoadingPackages(true);
      const { data } = await supabase
        .from("packages")
        .select("id, nama_package, kategori, harga, highlight_package, deskripsi_singkat, is_active")
        .eq("is_active", true)
        .order("harga", { ascending: true });

      if (data) {
        setPackages(data);
      }
      setLoadingPackages(false);
    };

    fetchPackages();

    const fetchWhatsAppNumber = async () => {
      const { data } = await supabase
        .from("settings")
        .select("nomor_whatsapp")
        .eq("id", 1)
        .single();

      if (data?.nomor_whatsapp) {
        setWhatsappNumber(normalizeWhatsAppNumber(data.nomor_whatsapp));
      }
    };

    fetchWhatsAppNumber();
  }, []);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      setTimeout(resetWizard, 200);
    }
  };

  const goNext = () => setStep((s) => Math.min(QUESTION_STEPS, s + 1));
  const goBack = () => setStep((s) => Math.max(1, s - 1));

  const handleSeeRecommendation = () => {
    setStep(LOADING_STEP);
    setTimeout(() => {
      setStep(RESULT_STEP);
    }, 1800);
  };

  const selectedTypeLabel = serviceTypes.find((t) => t.id === selectedType)?.label;
  const selectedEventLabel = eventTypes.find((e) => e.id === selectedEvent)?.label;
  const selectedLocationLabel = locationOptions.find((l) => l.id === selectedLocation)?.label;
  const selectedDurationLabel = durationOptions.find((d) => d.id === selectedDuration)?.label;
  const selectedTimelineLabel = timelineOptions.find((t) => t.id === selectedTimeline)?.label;

  const isNextDisabled =
    (step === 2 && !selectedType) ||
    (step === 3 && !selectedEvent) ||
    (step === 4 && (!selectedLocation || !selectedDuration)) ||
    (step === 5 && !selectedTimeline);

  // logic rekomendasi paket
  const recommendedPackage = (() => {
    if (!packages.length) return null;

    const typeKeyword = selectedTypeLabel?.toLowerCase() ?? "";
    const matchingCategory = packages.filter((pkg) =>
      typeKeyword ? pkg.kategori.toLowerCase().includes(typeKeyword.split(" ")[0]) : false
    );

    const pool = matchingCategory.length > 0 ? matchingCategory : packages;

    return pool.reduce<PackageItem>((closest, pkg) => {
      const pkgPrice = parsePriceToNumber(pkg.harga);
      const closestPrice = parsePriceToNumber(closest.harga);
      return Math.abs(pkgPrice - budget) < Math.abs(closestPrice - budget) ? pkg : closest;
    }, pool[0]);
  })();

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

            <Dialog open={open} onOpenChange={handleOpenChange}>
              <DialogTrigger asChild>
                <button
                  type="button"
                  className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-sky-700"
                >
                  Cari tahu kebutuhanmu
                  <ArrowRight className="size-4" />
                </button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-lg rounded-[2rem] p-6">
                {step < LOADING_STEP && (
                  <>
                    <DialogHeader>
                      <div className="flex items-center gap-2">
                        <div className="rounded-full bg-sky-50 p-2 text-sky-700">
                          <Sparkles className="size-4" />
                        </div>
                        <DialogTitle className="text-lg font-bold text-slate-900">
                          Cari tahu kebutuhanmu
                        </DialogTitle>
                      </div>
                    </DialogHeader>

                    {/* Progress indicator */}
                    <div className="mb-2 mt-3 flex items-center gap-2 px-1">
                      {Array.from({ length: QUESTION_STEPS }, (_, i) => i + 1).map((s) => (
                        <div
                          key={s}
                          className={`h-1.5 flex-1 rounded-full transition-colors ${
                            s <= step ? "bg-sky-600" : "bg-slate-200"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="mb-5 px-1 text-xs font-medium text-slate-400">
                      Langkah {step} dari {QUESTION_STEPS}
                    </p>
                  </>
                )}

                {/* STEP 1: Budget */}
                {step === 1 && (
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-slate-800">
                      Berapa estimasi budget kamu?
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500">Range budget</span>
                      <span className="rounded-full bg-sky-50 px-3 py-1 text-sm font-semibold text-sky-700">
                        {formatRupiah(budget)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={MIN_BUDGET}
                      max={MAX_BUDGET}
                      step={250_000}
                      value={budget}
                      onChange={(event) => setBudget(Number(event.target.value))}
                      className="w-full accent-sky-600"
                    />
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>{formatRupiah(MIN_BUDGET)}</span>
                      <span>{formatRupiah(MAX_BUDGET)}</span>
                    </div>
                  </div>
                )}

                {/* STEP 2: Tipe layanan */}
                {step === 2 && (
                  <div>
                    <p className="mb-3 text-sm font-semibold text-slate-800">
                      Tipe layanan apa yang kamu cari?
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {serviceTypes.map((type) => {
                        const Icon = type.icon;
                        const isActive = selectedType === type.id;
                        return (
                          <button
                            key={type.id}
                            type="button"
                            onClick={() => setSelectedType(type.id)}
                            className={`flex items-center gap-2 rounded-2xl border px-4 py-3 text-left text-sm font-medium transition ${
                              isActive
                                ? "border-sky-200 bg-sky-50 text-sky-700"
                                : "border-slate-200 bg-white text-slate-600 hover:border-sky-100 hover:bg-sky-50/50"
                            }`}
                          >
                            <Icon className="size-4 shrink-0" />
                            {type.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* STEP 3: Jenis acara */}
                {step === 3 && (
                  <div>
                    <p className="mb-3 text-sm font-semibold text-slate-800">
                      Ini untuk acara atau kebutuhan apa?
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {eventTypes.map((ev) => {
                        const Icon = ev.icon;
                        const isActive = selectedEvent === ev.id;
                        return (
                          <button
                            key={ev.id}
                            type="button"
                            onClick={() => setSelectedEvent(ev.id)}
                            className={`flex items-center gap-2 rounded-2xl border px-4 py-3 text-left text-sm font-medium transition ${
                              isActive
                                ? "border-sky-200 bg-sky-50 text-sky-700"
                                : "border-slate-200 bg-white text-slate-600 hover:border-sky-100 hover:bg-sky-50/50"
                            }`}
                          >
                            <Icon className="size-4 shrink-0" />
                            {ev.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* STEP 4: Lokasi & durasi */}
                {step === 4 && (
                  <div className="space-y-5">
                    <div>
                      <p className="mb-3 text-sm font-semibold text-slate-800">
                        Sesinya di mana?
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        {locationOptions.map((loc) => {
                          const Icon = loc.icon;
                          const isActive = selectedLocation === loc.id;
                          return (
                            <button
                              key={loc.id}
                              type="button"
                              onClick={() => setSelectedLocation(loc.id)}
                              className={`flex items-center gap-2 rounded-2xl border px-4 py-3 text-left text-sm font-medium transition ${
                                isActive
                                  ? "border-sky-200 bg-sky-50 text-sky-700"
                                  : "border-slate-200 bg-white text-slate-600 hover:border-sky-100 hover:bg-sky-50/50"
                              }`}
                            >
                              <Icon className="size-4 shrink-0" />
                              {loc.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <p className="mb-3 text-sm font-semibold text-slate-800">
                        Estimasi durasi sesi?
                      </p>
                      <div className="grid gap-2">
                        {durationOptions.map((dur) => {
                          const isActive = selectedDuration === dur.id;
                          return (
                            <button
                              key={dur.id}
                              type="button"
                              onClick={() => setSelectedDuration(dur.id)}
                              className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm font-medium transition ${
                                isActive
                                  ? "border-sky-200 bg-sky-50 text-sky-700"
                                  : "border-slate-200 bg-white text-slate-600 hover:border-sky-100 hover:bg-sky-50/50"
                              }`}
                            >
                              {dur.label}
                              {isActive && <Check className="size-4" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 5: Target tanggal */}
                {step === 5 && (
                  <div>
                    <p className="mb-3 text-sm font-semibold text-slate-800">
                      Kapan kira-kira kamu butuh jasa ini?
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {timelineOptions.map((t) => {
                        const Icon = t.icon;
                        const isActive = selectedTimeline === t.id;
                        return (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setSelectedTimeline(t.id)}
                            className={`flex items-center gap-2 rounded-2xl border px-4 py-3 text-left text-sm font-medium transition ${
                              isActive
                                ? "border-sky-200 bg-sky-50 text-sky-700"
                                : "border-slate-200 bg-white text-slate-600 hover:border-sky-100 hover:bg-sky-50/50"
                            }`}
                          >
                            <Icon className="size-4 shrink-0" />
                            {t.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* STEP 6: Ringkasan */}
                {step === 6 && (
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-sky-100 bg-sky-50/50 p-4">
                      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-sky-700">
                        <Check className="size-4" />
                        Ringkasan kebutuhanmu
                      </div>
                      <div className="space-y-2 text-sm text-slate-700">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Budget</span>
                          <span className="font-semibold">{formatRupiah(budget)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Tipe layanan</span>
                          <span className="font-semibold">{selectedTypeLabel ?? "-"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Jenis acara</span>
                          <span className="font-semibold">{selectedEventLabel ?? "-"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Lokasi</span>
                          <span className="font-semibold">{selectedLocationLabel ?? "-"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Durasi</span>
                          <span className="font-semibold">{selectedDurationLabel ?? "-"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Target tanggal</span>
                          <span className="font-semibold">{selectedTimelineLabel ?? "-"}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm leading-6 text-slate-500">
                      Tim potreed akan rekomendasikan paket paling pas berdasarkan jawaban ini.
                    </p>
                  </div>
                )}

                {/* STEP 7: Loading */}
                {step === LOADING_STEP && (
                  <div className="flex flex-col items-center justify-center gap-4 py-12">
                    <Hourglass className="size-10 animate-spin text-sky-600" style={{ animationDuration: "1.4s" }} />
                    <div className="text-center">
                      <p className="text-sm font-semibold text-slate-800">
                        Mencari paket paling pas buat kamu...
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        Sebentar ya, lagi dicocokkan dengan budget & kebutuhanmu
                      </p>
                    </div>
                  </div>
                )}

                {/* STEP 8: Hasil rekomendasi */}
                {step === RESULT_STEP && recommendedPackage && (
                  <div className="space-y-4">
                    <div className="mb-1 flex items-center gap-2">
                      <div className="rounded-full bg-emerald-50 p-2 text-emerald-700">
                        <Check className="size-4" />
                      </div>
                      <p className="text-sm font-semibold text-slate-800">
                        Ini rekomendasi paling cocok buat kamu
                      </p>
                    </div>

                    <div className="rounded-[1.6rem] border border-sky-100 bg-white p-5 shadow-[0_20px_60px_-38px_rgba(14,116,144,0.35)]">
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div>
                          <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold uppercase text-sky-700">
                            {recommendedPackage.kategori}
                          </span>
                          <h3 className="mt-2 text-xl font-bold text-slate-900">
                            {recommendedPackage.nama_package}
                          </h3>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-semibold uppercase text-slate-400">
                            Mulai dari
                          </p>
                          <p className="text-lg font-black text-slate-950">
                            {typeof recommendedPackage.harga === "number"
                              ? formatRupiah(recommendedPackage.harga)
                              : recommendedPackage.harga}
                          </p>
                        </div>
                      </div>

                      <p className="text-sm leading-6 text-slate-600">
                        {recommendedPackage.highlight_package ?? recommendedPackage.deskripsi_singkat}
                      </p>

                      {recommendedPackage.deskripsi_singkat && (
                        <div className="mt-4 grid gap-2">
                          {recommendedPackage.deskripsi_singkat
                            .split(",")
                            .map((item) => item.trim())
                            .filter(Boolean)
                            .slice(0, 3)
                            .map((feature) => (
                              <div
                                key={feature}
                                className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-700"
                              >
                                <BadgeCheck className="size-3.5 text-sky-600" />
                                {feature}
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Navigation buttons */}
                {step !== LOADING_STEP && (
                  <div className="mt-6 flex items-center justify-between gap-3">
                    {step > 1 && step < RESULT_STEP ? (
                      <Button
                        type="button"
                        variant="outline"
                        className="h-11 rounded-2xl border-slate-200 px-5"
                        onClick={goBack}
                      >
                        <ArrowLeft className="mr-1 size-4" />
                        Kembali
                      </Button>
                    ) : (
                      <span />
                    )}

                    {step < QUESTION_STEPS && (
                      <Button
                        type="button"
                        className="h-11 rounded-2xl bg-sky-600 px-5 text-white hover:bg-sky-700"
                        onClick={goNext}
                        disabled={isNextDisabled}
                      >
                        Lanjut
                        <ArrowRight className="ml-1 size-4" />
                      </Button>
                    )}

                    {step === QUESTION_STEPS && (
                      <Button
                        type="button"
                        className="h-11 rounded-2xl bg-sky-600 px-5 text-white hover:bg-sky-700"
                        onClick={handleSeeRecommendation}
                      >
                        Lihat rekomendasi paket
                      </Button>
                    )}

                    {step === RESULT_STEP && (
                      <Button
                        type="button"
                        className="h-11 w-full rounded-2xl bg-slate-900 text-white hover:bg-slate-800"
                        onClick={() => handleOpenChange(false)}
                      >
                        Tutup
                      </Button>
                    )}
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-5 lg:grid-cols-2">
          {loadingPackages ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-80 animate-pulse rounded-[2rem] border border-white/70 bg-slate-100/75"
              />
            ))
          ) : (
            packages.map((pkg) => {
              const features = pkg.deskripsi_singkat
                ? pkg.deskripsi_singkat.split(",").map((item: string) => item.trim()).filter(Boolean)
                : [];

              return (
                <article
                  key={pkg.id}
                  className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_24px_100px_-56px_rgba(15,23,42,0.5)] backdrop-blur-xl"
                >
                  <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold uppercase text-sky-700">
                        {pkg.kategori}
                      </span>
                      <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
                        {pkg.nama_package}
                      </h2>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold uppercase text-slate-400">
                        Mulai dari
                      </p>
                      <p className="mt-1 text-2xl font-black text-slate-950">
                        {typeof pkg.harga === "number"
                          ? formatRupiah(pkg.harga)
                          : pkg.harga}
                      </p>
                    </div>
                  </div>

                  <p className="mb-5 text-md leading-7 text-slate-600">
                    {pkg.highlight_package}
                  </p>
                  {/* <p className="text-sm leading-7 text-slate-600">{pkg.deskripsi_singkat}</p> */}

                  {features.length > 0 && (
                    <div className="mt-6 grid gap-3">
                      {features.map((feature: string) => (
                        <div key={feature} className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                          <BadgeCheck className="size-4 text-sky-600" />
                          {feature}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-6">
                    <Button asChild className="h-11 rounded-full bg-slate-900 px-5 text-white hover:bg-slate-800">
                      <a
                        href={createWhatsAppUrl(
                          whatsappNumber || FALLBACK_WHATSAPP_NUMBER,
                          `Halo, saya mau tanya paket ${pkg.nama_package}.`
                        )}
                        target="_blank"
                        rel="noreferrer"
                        data-analytics="package_inquiry_click"
                        data-analytics-value="Tanya paket ini"
                        data-analytics-package-id={pkg.id}
                      >
                        Tanya paket ini
                      </a>
                    </Button>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>
    </main>
  );
}