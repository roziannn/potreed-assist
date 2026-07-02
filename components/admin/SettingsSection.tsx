"use client";

import { useState, useEffect } from "react";
import { Settings, Save, MapPin, Store, LucideInbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast-provider";
import { supabase } from "@/lib/supabase"; 

export function BusinessSettingsSection() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nama_bisnis: "",
    nomor_whatsapp: "",
    instagram_username: "",
    tiktok_username: "",
    alamat_lengkap: "",
    wilayah_layanan: "",
  });
  const [loadingData, setLoadingData] = useState(true);

  // Load data saat komponen mount
  useEffect(() => {
    async function fetchData() {
      setLoadingData(true);
      try {
        const { data } = await supabase.from("settings").select("*").eq("id", 1).single();
        if (data) setFormData(data);
      } finally {
        setLoadingData(false);
      }
    }
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
  setLoading(true);
  
  const { error } = await supabase
    .from("settings")
    .upsert({ 
      id: 1, 
      ...formData 
    });

  if (error) {
    console.error("Detail Error:", error); 
    showToast("Gagal menyimpan pengaturan", error.message, "error");
  } else {
    showToast("Pengaturan tersimpan", "Informasi bisnis berhasil diperbarui.");
  }
  setLoading(false);
};

  return (
    <section className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_24px_100px_-52px_rgba(15,23,42,0.34)] backdrop-blur-xl">
      {/* ... (Header tetap sama) ... */}
      
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[1.9rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-5 font-bold text-slate-900 flex items-center gap-2">
            <Store className="size-4" /> Informasi Utama
          </h3>
          <div className="space-y-4">
            {loadingData ? (
              <div className="space-y-3">
                <div className="h-10 w-3/4 animate-pulse rounded bg-slate-200/70" />
                <div className="h-10 w-2/4 animate-pulse rounded bg-slate-200/70" />
              </div>
            ) : (
              <>
                <Field label="Nama Bisnis">
                  <input name="nama_bisnis" value={formData.nama_bisnis} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none" />
                </Field>
                <Field label="Nomor WhatsApp">
                  <input name="nomor_whatsapp" value={formData.nomor_whatsapp} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none" />
                </Field>
              </>
            )}
          </div>
        </div>

        {/* Ulangi penyesuaian nama field (instagram_username, tiktok_username, dst) sesuai kolom DB */}
        <div className="rounded-[1.9rem] border border-slate-200 bg-white p-6 shadow-sm">
           <h3 className="mb-5 font-bold text-slate-900 flex items-center gap-2">
            <LucideInbox className="size-4" /> Media Sosial
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Username Instagram">
              <input name="instagram_username" value={formData.instagram_username} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none" />
            </Field>
            <Field label="Username TikTok">
              <input name="tiktok_username" value={formData.tiktok_username} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none" />
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
              <textarea 
                name="alamat_lengkap" 
                value={formData.alamat_lengkap} 
                onChange={handleChange} 
                rows={3} 
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none" 
              />
            </Field>
            <Field label="Wilayah Layanan">
              <textarea 
                name="wilayah_layanan" 
                value={formData.wilayah_layanan} 
                onChange={handleChange} 
                rows={3} 
                placeholder="Contoh: Jakarta, Bogor, Depok..." 
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none" 
              />
            </Field>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <Button onClick={handleSave} disabled={loading} className="h-12 rounded-2xl bg-slate-900 px-8 text-white hover:bg-slate-800 gap-2">
          <Save className="size-4" /> {loading ? "Menyimpan..." : "Simpan Pengaturan"}
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