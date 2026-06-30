"use client";

import { useState } from "react";
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
  const [portfolioTitle, setPortfolioTitle] = useState("");
  const [portfolioCategory, setPortfolioCategory] = useState("Wedding");
  const [portfolioDescription, setPortfolioDescription] = useState("");
  const [captionTone, setCaptionTone] = useState("hangat");
  const [generatedCaption, setGeneratedCaption] = useState("");

  return (
    <section className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_24px_100px_-52px_rgba(217,119,6,0.32)] backdrop-blur-xl">
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
            {generatedCaption ||
              "Caption hasil AI akan muncul di sini setelah admin isi brief singkat portfolio."}
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
