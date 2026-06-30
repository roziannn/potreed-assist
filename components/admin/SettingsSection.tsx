"use client";

import { useState } from "react";
import { Settings, Save, MessageCircle, MapPin, Store, LucideInbox } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BusinessSettingsSection() {
  const [formData, setFormData] = useState({
    businessName: "Studio Foto Bahagia",
    whatsapp: "08123456789",
    instagram: "studiofoto.bahagia",
    tiktok: "studiofoto.bahagia",
    address: "Jl. Raya Utama No. 123, Bekasi",
    serviceArea: "Bekasi, Jakarta Timur, Depok",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <section className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_24px_100px_-52px_rgba(15,23,42,0.34)] backdrop-blur-xl">
      <div className="mb-8 flex items-center gap-4">
        <div className="rounded-3xl bg-sky-100 p-4 text-sky-700">
          <Settings className="size-7" />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Pengaturan Bisnis</h2>
          <p className="text-slate-500">Kelola informasi publik dan identitas bisnis Anda.</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Info Dasar */}
        <div className="rounded-[1.9rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-5 font-bold text-slate-900 flex items-center gap-2">
            <Store className="size-4" /> Informasi Utama
          </h3>
          <div className="space-y-4">
            <Field label="Nama Bisnis">
              <input name="businessName" value={formData.businessName} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none" />
            </Field>
            <Field label="Nomor WhatsApp">
              <input name="whatsapp" value={formData.whatsapp} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none" placeholder="628..." />
            </Field>
          </div>
        </div>

        {/* Media Sosial */}
        <div className="rounded-[1.9rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-5 font-bold text-slate-900 flex items-center gap-2">
            <LucideInbox className="size-4" /> Media Sosial
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Username Instagram">
              <input name="instagram" value={formData.instagram} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none" />
            </Field>
            <Field label="Username TikTok">
              <input name="tiktok" value={formData.tiktok} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none" />
            </Field>
          </div>
        </div>

        {/* Alamat & Wilayah */}
        <div className="rounded-[1.9rem] border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <h3 className="mb-5 font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="size-4" /> Alamat & Layanan
          </h3>
          <div className="grid gap-6 md:grid-cols-2">
            <Field label="Alamat Lengkap">
              <textarea name="address" value={formData.address} onChange={handleChange} rows={3} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none" />
            </Field>
            <Field label="Wilayah Layanan">
              <textarea name="serviceArea" value={formData.serviceArea} onChange={handleChange} rows={3} placeholder="Contoh: Jakarta, Bogor, Depok..." className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none" />
            </Field>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <Button className="h-12 rounded-2xl bg-slate-900 px-8 text-white hover:bg-slate-800 gap-2">
          <Save className="size-4" /> Simpan Pengaturan
        </Button>
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}