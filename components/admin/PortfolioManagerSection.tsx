"use client";

import { useState } from "react";
import { PencilLine, Plus, Sparkles } from "lucide-react";
import { portfolioHighlights } from "@/lib/site-data";
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

export function PortfolioManagerSection() {
  const [selectedPortfolioTitle, setSelectedPortfolioTitle] = useState(
    portfolioHighlights[0]?.title ?? ""
  );
  const selectedPortfolio =
    portfolioHighlights.find((item) => item.title === selectedPortfolioTitle) ??
    portfolioHighlights[0];

  const [portfolioTitle, setPortfolioTitle] = useState(
    selectedPortfolio?.title ?? ""
  );
  const [portfolioCategory, setPortfolioCategory] = useState(
    selectedPortfolio?.tag ?? "Wedding"
  );
  const [portfolioDescription, setPortfolioDescription] = useState(
    selectedPortfolio?.description ?? ""
  );
  const [captionTone, setCaptionTone] = useState("hangat");
  const [generatedCaption, setGeneratedCaption] = useState("");

  const handleSelectPortfolio = (title: string) => {
    const item = portfolioHighlights.find((portfolio) => portfolio.title === title);
    if (!item) return;

    setSelectedPortfolioTitle(item.title);
    setPortfolioTitle(item.title);
    setPortfolioCategory(item.tag);
    setPortfolioDescription(item.description);
  };

  const handleAddNew = () => {
    setSelectedPortfolioTitle("");
    setPortfolioTitle("");
    setPortfolioCategory("Wedding");
    setPortfolioDescription("");
    setCaptionTone("hangat");
    setGeneratedCaption("");
  };

  return (
    <section className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_24px_100px_-52px_rgba(217,119,6,0.32)] backdrop-blur-xl">
      <div className="mb-6">
        <p className="text-sm font-medium text-amber-700">Portfolio manager</p>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Upload portfolio dan generate AI caption
        </h2>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(300px,0.9fr)_minmax(0,1.1fr)]">
        <div className="rounded-[1.9rem] border border-amber-100 bg-amber-50/55 p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-lg font-bold text-slate-900">Portfolio aktif saat ini</p>
              <p className="text-sm text-slate-500">Pilih card untuk edit data portfolio.</p>
            </div>
            <Button
              type="button"
              variant="outline"
              className="rounded-full border-amber-100 bg-white"
              onClick={handleAddNew}
            >
              <Plus className="size-4" />
              Tambah
            </Button>
          </div>

          <div className="space-y-3">
            {portfolioHighlights.map((item) => {
              const isActive = selectedPortfolioTitle === item.title;

              return (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => handleSelectPortfolio(item.title)}
                  className={`block w-full rounded-[1.6rem] border p-5 text-left transition ${
                    isActive
                      ? "border-amber-200 bg-white shadow-[0_20px_60px_-38px_rgba(217,119,6,0.35)]"
                      : "border-white bg-white/90 hover:border-amber-100 hover:bg-white"
                  }`}
                >
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <span className="font-semibold text-slate-900 sm:text-[1.05rem]">
                      {item.title}
                    </span>
                    <span className="text-sm text-amber-700">{item.tag}</span>
                  </div>
                  <p className="line-clamp-2 text-sm leading-6 text-slate-500">
                    {item.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-[1.9rem] border border-amber-100 bg-white p-5 shadow-[0_20px_80px_-48px_rgba(217,119,6,0.28)]">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-lg font-bold text-slate-900">
                {selectedPortfolioTitle ? "Edit data portfolio" : "Tambah portfolio baru"}
              </p>
              <p className="text-sm text-slate-500">
                {selectedPortfolioTitle
                  ? "Update judul, kategori, deskripsi, lalu generate caption dari item yang dipilih."
                  : "Isi data portfolio baru lalu buat caption AI untuk deskripsinya."}
              </p>
            </div>
            <div className="rounded-full bg-amber-50 p-2 text-amber-700">
              {selectedPortfolioTitle ? (
                <PencilLine className="size-4" />
              ) : (
                <Plus className="size-4" />
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Judul portfolio">
              <input
                value={portfolioTitle}
                onChange={(event) => setPortfolioTitle(event.target.value)}
                placeholder="Contoh: Akad pagi di rumah keluarga"
                className="w-full rounded-2xl border border-slate-200 bg-amber-50/30 px-4 py-3 text-sm outline-none"
              />
            </Field>
            <Field label="Kategori">
              <select
                value={portfolioCategory}
                onChange={(event) => setPortfolioCategory(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-amber-50/30 px-4 py-3 text-sm outline-none"
              >
                <option>Wedding</option>
                <option>Wisuda</option>
                <option>Custom</option>
              </select>
            </Field>
            <div className="sm:col-span-2">
              <Field label="Deskripsi momen">
                <textarea
                  value={portfolioDescription}
                  onChange={(event) => setPortfolioDescription(event.target.value)}
                  rows={4}
                  placeholder="Ceritakan mood, lokasi, dan detail utama sesi foto"
                  className="w-full rounded-2xl border border-slate-200 bg-amber-50/30 px-4 py-3 text-sm outline-none"
                />
              </Field>
            </div>
            <Field label="Tone caption">
              <select
                value={captionTone}
                onChange={(event) => setCaptionTone(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-amber-50/30 px-4 py-3 text-sm outline-none"
              >
                <option value="hangat">Hangat</option>
                <option value="elegan">Elegan</option>
                <option value="editorial">Editorial</option>
              </select>
            </Field>
            <div className="rounded-[1.5rem] border border-amber-100 bg-amber-50/55 p-4 sm:col-span-2">
              <div className="mb-3 flex items-center gap-2 text-slate-900">
                <Sparkles className="size-4 text-amber-600" />
                <p className="text-sm font-semibold">Draft caption</p>
              </div>
              <div className="min-h-36 rounded-2xl border border-white/80 bg-white p-4 text-sm leading-6 text-slate-600">
                {generatedCaption ||
                  "Caption hasil AI akan muncul di sini setelah admin isi brief singkat portfolio."}
              </div>
            </div>
            <div className="sm:col-span-2 flex flex-wrap gap-3">
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
              <Button type="button" variant="outline" className="h-11 rounded-2xl border-amber-100">
                Upload foto
              </Button>
              {selectedPortfolioTitle ? (
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 rounded-2xl border-slate-200"
                  onClick={handleAddNew}
                >
                  Buat portfolio baru
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}
