"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { FloatingChat } from "@/components/FloatingChat";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast-provider";
import { supabase } from "@/lib/supabase";

export default function CreateTestimonialPage() {
  const { showToast } = useToast();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!comment.trim()) {
      showToast("Isi testimoni dulu", "Tolong tulis kesan kamu setelah sesi.", "error");
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase.from("testimonials").insert([
      {
        name: name || "Anonim",
        event: "Sesi Foto",
        quote: comment.trim(),
        rating,
      },
    ]);

    setIsSubmitting(false);

    if (error) {
      console.error("DEBUG SUPABASE testimonial insert:", error);
      showToast("Gagal submit testimonial", error.message, "error");
      return;
    }

    setRating(5);
    setComment("");
    setName("");
    showToast("Terima kasih!", "Testimoni Anda sudah terkirim.", "success");
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(251,207,232,0.45),_transparent_26%),radial-gradient(circle_at_bottom_right,_rgba(186,230,253,0.65),_transparent_28%),linear-gradient(180deg,_#fffafc_0%,_#f8fafc_48%,_#eff6ff_100%)] pb-24">
      <Navbar />
      <FloatingChat />

      <section className="mx-auto max-w-5xl px-4 pt-14 sm:px-6">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase text-rose-500">Kirim Testimoni</p>
          <h1 className="mt-3 text-5xl font-black tracking-tight text-slate-950 sm:text-6xl">
            Ceritakan pengalamanmu setelah sesi
          </h1>
          <p className="mt-5 text-base leading-7 text-slate-600">
            Isi testimoni singkat dan beri nilai 1 sampai 5 untuk membantu calon client lain memahami kualitas sesi kami.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <form
          onSubmit={handleSubmit}
          className="rounded-[2rem] border border-white/70 bg-white/90 p-8 shadow-[0_24px_100px_-56px_rgba(244,114,182,0.18)] backdrop-blur-xl"
        >
          <div className="space-y-6">
            <div>
              <label className="text-sm font-semibold text-slate-900">Nama (opsional)</label>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Contoh: Rina & Fajar"
                className="mt-3 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-rose-300 focus:bg-white"
              />
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900">Nilai sesi</p>
              <div className="mt-3 flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl border text-slate-700 transition ${
                      value <= rating
                        ? "border-rose-400 bg-rose-100 text-rose-700"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <Star className="size-5" />
                  </button>
                ))}
              </div>
              <p className="mt-2 text-sm text-slate-500">Pilih bintang untuk menilai kesan sesi fotomu.</p>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-900">Kesan testimoni</label>
              <textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                rows={6}
                placeholder="Tulis pengalamanmu setelah sesi foto..."
                className="mt-3 w-full rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-900 outline-none transition focus:border-rose-300 focus:bg-white"
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {/* <div>
                <p className="text-sm font-semibold text-slate-900">Siap kirim?</p>
                <p className="text-sm text-slate-500">Testimonimu akan muncul setelah kami verifikasi.</p>
              </div> */}
              <Button type="submit" className="h-12 rounded-2xl bg-rose-500 px-6 text-white hover:bg-rose-600" disabled={isSubmitting}>
                {isSubmitting ? "Mengirim..." : "Kirim Testimoni"}
              </Button>
            </div>
          </div>
        </form>
      </section>
    </main>
  );
}
