"use client";

import { useState, useEffect } from "react";
import { PencilLine, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast-provider";
import { supabase } from "@/lib/supabase";

function generateCaption(input: { title: string; category: string; description: string; tone: string; }) {
  const toneMap: Record<string, string> = {
    elegan: "mengalir elegan dan terasa premium",
    hangat: "hangat, dekat, dan natural",
    editorial: "lebih bold, rapi, dan terasa editorial",
  };
  const toneText = toneMap[input.tone] ?? toneMap.hangat;
  return `${input.title || "Sesi terbaru"} dari kategori ${input.category || "portfolio"} hadir dengan visual yang ${toneText}. ${input.description || "Momen utamanya terasa intim dan penuh detail kecil."} Jika kamu ingin konsep serupa, tim kami bisa bantu siapkan moodboard dan paket yang paling pas.`;
}

export function PortfolioManagerSection() {
  const { showToast } = useToast();
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedPortfolio, setSelectedPortfolio] = useState<any | null>(null);
  const [formData, setFormData] = useState({ judul: "", kategori: "Wedding", deskripsi: "", thumbnail_url: "", is_active: true});
  const [captionTone, setCaptionTone] = useState("hangat");
  const [generatedCaption, setGeneratedCaption] = useState("");

  useEffect(() => { fetchPortfolios(); }, []);

  async function fetchPortfolios() {
    setLoadingData(true);
    try {
      const { data } = await supabase.from("portfolios").select("*").order("created_at", { ascending: false });
      if (data) setPortfolios(data);
    } finally {
      setLoadingData(false);
    }
  }

  const handleSelectPortfolio = (item: any) => {
    setSelectedPortfolio(item);
    setFormData({ 
      judul: item.judul, 
      kategori: item.kategori, 
      deskripsi: item.deskripsi, 
      thumbnail_url: item.thumbnail_url || "",
      is_active: item.is_active ?? true 
    });
  };

  const handleSave = async () => {
    const payload = { judul: formData.judul, kategori: formData.kategori, deskripsi: formData.deskripsi, thumbnail_url: formData.thumbnail_url, is_active: formData.is_active };
    const { error } = selectedPortfolio 
      ? await supabase.from("portfolios").update(payload).eq("id", selectedPortfolio.id)
      : await supabase.from("portfolios").insert([payload]);
    
    if (error) showToast("Gagal menyimpan portfolio", error.message, "error");
    else { showToast("Portfolio tersimpan", "Portfolio berhasil disimpan dan diperbarui."); fetchPortfolios(); handleAddNew(); }
  };

  const handleAddNew = () => {
    setSelectedPortfolio(null);
    setFormData({ judul: "", kategori: "Wedding", deskripsi: "", thumbnail_url: "", is_active: true });
    setGeneratedCaption("");
  };

  return (
    <section className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_24px_100px_-52px_rgba(217,119,6,0.32)] backdrop-blur-xl">
      <div className="mb-6">
        <p className="text-sm font-medium text-amber-700">Portfolio manager</p>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Upload portfolio dan generate AI caption</h2>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(300px,0.9fr)_minmax(0,1.1fr)]">
        <div className="rounded-[1.9rem] border border-amber-100 bg-amber-50/55 p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-lg font-bold text-slate-900">Portfolio aktif saat ini</p>
              <p className="text-sm text-slate-500">Pilih card untuk edit data portfolio.</p>
            </div>
            <Button variant="outline" className="rounded-full border-amber-100 bg-white" onClick={handleAddNew}>
              <Plus className="size-4" /> Tambah
            </Button>
          </div>

          <div className="space-y-4">
            {loadingData ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-28 w-full animate-pulse rounded-[1.6rem] bg-slate-200/70" />
              ))
            ) : (
              [...portfolios]
                .sort((a, b) => (a.is_active === b.is_active ? 0 : a.is_active ? -1 : 1))
                .map((item) => {
                  const isActive = selectedPortfolio?.id === item.id;

                  const cardStyle = item.is_active
                    ? isActive
                      ? "border-amber-200 bg-white shadow-[0_20px_60px_-38px_rgba(217,119,6,0.35)]"
                      : "border-white bg-white/90 hover:border-amber-100"
                    : "border-transparent bg-slate-100/70 opacity-80 hover:bg-slate-100";

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectPortfolio(item)}
                      className={`block w-full rounded-[1.6rem] border p-5 text-left transition-all ${cardStyle}`}
                    >
                      <div className="mb-2 flex items-start justify-between gap-3">
                        <span className={`font-semibold ${item.is_active ? "text-slate-900" : "text-slate-500"}`}>
                          {item.judul} {!item.is_active && "(nonaktif)"}
                        </span>
                        <span className={`text-sm ${item.is_active ? "text-amber-700" : "text-slate-400"}`}>
                          {item.kategori}
                        </span>
                      </div>
                      <p className="line-clamp-2 text-sm text-slate-500">{item.deskripsi}</p>
                    </button>
                  );
                })
            )}
          </div>
        </div>

        <div className="rounded-[1.9rem] border border-amber-100 bg-white p-6 shadow-[0_20px_80px_-48px_rgba(217,119,6,0.28)] h-full">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <p className="text-lg font-bold text-slate-900">
                {selectedPortfolio ? "Edit data portfolio" : "Tambah portfolio baru"}
              </p>
              <p className="text-sm text-slate-500">
                {selectedPortfolio
                  ? "Update judul, kategori, deskripsi, lalu generate caption."
                  : "Isi data portfolio baru lalu buat caption AI untuk deskripsinya."}
              </p>
            </div>
            <div className="rounded-full bg-amber-50 p-2 text-amber-700">
              {selectedPortfolio ? <PencilLine className="size-5" /> : <Plus className="size-5" />}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Judul portfolio">
              <input
                value={formData.judul}
                onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                placeholder="Contoh: Akad pagi di rumah keluarga"
                className="w-full rounded-2xl border border-slate-200 bg-amber-50/30 px-4 py-3 text-sm outline-none focus:border-amber-400"
              />
            </Field>

            <Field label="Kategori">
              <select
                value={formData.kategori}
                onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                className="w-full rounded-2xl border border-slate-200 bg-amber-50/30 px-4 py-3 text-sm outline-none focus:border-amber-400"
              >
                <option value="Wedding">Wedding</option>
                <option value="Wisuda">Wisuda</option>
                <option value="Custom">Custom</option>
              </select>
            </Field>

            <div className="sm:col-span-2">
              <Field label="Deskripsi momen">
                <textarea
                  value={formData.deskripsi}
                  onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                  rows={4}
                  placeholder="Ceritakan mood, lokasi, dan detail utama sesi foto"
                  className="w-full rounded-2xl border border-slate-200 bg-amber-50/30 px-4 py-3 text-sm outline-none focus:border-amber-400"
                />
              </Field>
            </div>

            <Field label="Tone caption">
              <select
                value={captionTone}
                onChange={(e) => setCaptionTone(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-amber-50/30 px-4 py-3 text-sm outline-none focus:border-amber-400"
              >
                <option value="hangat">Hangat</option>
                <option value="elegan">Elegan</option>
                <option value="editorial">Editorial</option>
              </select>
            </Field>

            {/* Area Draft Caption */}
            <div className="rounded-[1.5rem] border border-amber-100 bg-amber-50/55 p-4 sm:col-span-2">
              <div className="mb-3 flex items-center gap-2 text-slate-900">
                <Sparkles className="size-4 text-amber-600" />
                <p className="text-sm font-semibold">Draft caption</p>
              </div>
              <div className="min-h-36 rounded-2xl border border-white/80 bg-white p-4 text-sm leading-6 text-slate-600">
                {generatedCaption || "Caption hasil AI akan muncul di sini setelah Anda klik generate."}
              </div>
            </div>

            {selectedPortfolio && (
              <div className="sm:col-span-2 flex items-center justify-between rounded-2xl border border-amber-100 bg-amber-50/50 px-6 py-4">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-900">Status Portfolio</span>
                  <span className="text-xs text-slate-500">
                    {formData.is_active ? "Portfolio sedang aktif (terlihat di web)" : "Portfolio sedang diarsipkan"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                  className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${
                    formData.is_active ? "bg-amber-500" : "bg-slate-300"
                  }`}
                >
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                    formData.is_active ? "translate-x-8" : "translate-x-1"
                  }`} />
                </button>
              </div>
            )}

            <div className="sm:col-span-2 flex flex-wrap gap-3 mt-2">
              <Button
                type="button"
                className="h-11 rounded-2xl bg-amber-500 px-5 text-white hover:bg-amber-600"
                onClick={() =>
                  setGeneratedCaption(
                    generateCaption({
                      title: formData.judul,
                      category: formData.kategori,
                      description: formData.deskripsi,
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

              {selectedPortfolio && (
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 rounded-2xl border-slate-200"
                  onClick={handleAddNew}
                >
                  Buat portfolio baru
                </Button>
              )}

              <Button 
                onClick={handleSave} 
                className="h-11 flex-1 rounded-2xl bg-slate-900 px-5 text-white hover:bg-slate-800"
              >
                {selectedPortfolio ? "Simpan Perubahan" : "Simpan Portfolio Baru"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block space-y-2"><span className="text-sm font-medium text-slate-700">{label}</span>{children}</label>;
}
