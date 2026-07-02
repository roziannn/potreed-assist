"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Camera, ChevronRight, MessageCircleMore, Star } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

const consultationPackages = [
  "Paket Wisuda",
  "Paket Wedding",
  "Paket Custom",
];

const cards = [
  {
    title: "Lihat Portfolio",
    desc: "Kumpulan karya wedding, wisuda, dan sesi editorial dengan tone yang terarah.",
    href: "/portfolio",
    icon: Camera,
    accent: "from-amber-200/70 to-white/30",
  },
  {
    title: "Jasa & Biaya",
    desc: "Daftar paket, rentang harga, dan opsi add-on yang paling sering dipilih calon client.",
    href: "/packages",
    icon: ChevronRight,
    accent: "from-sky-200/80 to-white/20",
  },
  {
    title: "Testimonial",
    desc: "Ulasan singkat dari client wedding dan wisuda yang sudah booking sebelumnya.",
    href: "/testimonials",
    icon: Star,
    accent: "from-rose-200/70 to-white/20",
  },
];

const normalizeWhatsAppNumber = (value: string) => {
  const digits = value.replace(/\D/g, "");
  return digits.startsWith("0") ? `62${digits.slice(1)}` : digits;
};

const createWhatsAppUrl = (phone: string, message: string) => {
  const normalized = normalizeWhatsAppNumber(phone);
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
};

export function ConsultationModal() {
  const [isConsultModalOpen, setIsConsultModalOpen] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState("");

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from("settings")
        .select("nomor_whatsapp")
        .eq("id", 1)
        .single();

      if (data?.nomor_whatsapp) {
        setWhatsappNumber(data.nomor_whatsapp);
      }
    };

    fetchSettings();
  }, []);

  const fallbackWhatsapp = "6281231931";

  return (
    <>
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {cards.map(({ title, desc, href, icon: Icon, accent }) => (
            <Link key={title} href={href} className="group">
              <div className="h-full rounded-[2rem] border border-white/70 bg-white/70 p-6 shadow-[0_20px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-sky-200 hover:shadow-[0_28px_90px_-42px_rgba(14,116,144,0.4)]">
                <div
                  className={`mb-5 inline-flex rounded-2xl bg-gradient-to-br ${accent} p-3 text-slate-800`}
                >
                  <Icon className="size-6" />
                </div>
                <h3 className="mb-2 text-2xl font-bold tracking-tight text-slate-900 transition-colors group-hover:text-sky-700">
                  {title}
                </h3>
                <p className="text-sm leading-6 text-slate-600">{desc}</p>
              </div>
            </Link>
          ))}

          <button
            type="button"
            onClick={() => setIsConsultModalOpen(true)}
            className="group text-left"
          >
            <div className="h-full rounded-[2rem] border border-sky-200/70 bg-[radial-gradient(circle_at_top_left,_rgba(125,211,252,0.45),_rgba(255,255,255,0.85)_55%)] p-6 shadow-[0_20px_80px_-40px_rgba(14,116,144,0.45)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-sky-300 hover:shadow-[0_30px_100px_-42px_rgba(14,116,144,0.55)]">
              <div className="mb-5 inline-flex rounded-2xl bg-white/70 p-3 text-sky-700">
                <MessageCircleMore className="size-6" />
              </div>
              <h3 className="mb-2 text-2xl font-bold tracking-tight text-slate-900 transition-colors group-hover:text-sky-700">
                Konsultasi Sesi Foto
              </h3>
              <p className="text-sm leading-6 text-slate-600">
                Buka pilihan sesi dan lanjutkan percakapan ke WhatsApp agar briefing lebih cepat.
              </p>
            </div>
          </button>
        </div>
      </section>

      <Dialog open={isConsultModalOpen} onOpenChange={setIsConsultModalOpen}>
        <DialogContent className="rounded-[2rem] border-white/70 bg-white/95 p-6 shadow-2xl sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl text-sky-700">
              Pilih Paket Konsultasi
            </DialogTitle>
            <DialogDescription>
              Pilih jalur percakapan yang paling dekat dengan kebutuhanmu supaya admin bisa langsung kasih rekomendasi.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            {consultationPackages.map((pkg) => (
              <Button
                key={pkg}
                variant="outline"
                className="h-14 justify-between rounded-2xl border-sky-100 bg-sky-50/40 px-4 text-left hover:bg-sky-50"
                onClick={() => {
                  const message = `Halo, saya mau tanya-tanya ${pkg}.`;
                  window.open(
                    createWhatsAppUrl(
                      whatsappNumber || fallbackWhatsapp,
                      message
                    ),
                    "_blank"
                  );
                  setIsConsultModalOpen(false);
                }}
              >
                <span>{pkg}</span>
                <ChevronRight className="size-4" />
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
