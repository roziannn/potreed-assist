"use client";

import { useState, useEffect } from "react";
import { PencilLine, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast-provider";
import { supabase } from "@/lib/supabase"; 

export function PackageManagerSection() {
  const { showToast } = useToast();
  const [packages, setPackages] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    nama_package: "",
    kategori: "Wedding",
    harga: "",
    highlight_package: "",
    deskripsi_singkat: "",
    is_active: true,
  });

  useEffect(() => {
    fetchPackages();
  }, []);

  async function fetchPackages() {
    setLoadingData(true);
    try {
      const { data } = await supabase.from("packages").select("*").order("is_active", { ascending: false });
      if (data) setPackages(data);
    } finally {
      setLoadingData(false);
    }
  }

  const handleSelectPackage = (pkg: any) => {
    setSelectedPackage(pkg);
    setFormData({
      nama_package: pkg.nama_package,
      kategori: pkg.kategori,
      harga: pkg.harga,
      highlight_package: pkg.highlight_package,
      deskripsi_singkat: pkg.deskripsi_singkat,
      is_active: pkg.is_active,
    });
  };

const handleSave = async () => {
  setLoading(true);
  console.log("Data yang dikirim:", formData); // Cek apakah datanya ada atau kosong

  const { data, error } = selectedPackage 
    ? await supabase.from("packages").update(formData).eq("id", selectedPackage.id)
    : await supabase.from("packages").insert([formData]);

  if (error) {
    console.error("Error dari Supabase:", error);
    showToast("Gagal menyimpan package", error.message, "error");
  } else {
    showToast("Package tersimpan", "Data package berhasil diperbarui.");
    fetchPackages();
  }
  setLoading(false);
};

const handleAddNew = () => {
  setSelectedPackage(null); 
  setFormData({
    nama_package: "",
    kategori: "Wedding",
    harga: "",
    highlight_package: "",
    deskripsi_singkat: "",
    is_active: true,
  });
};


  return (
    <section className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_24px_100px_-52px_rgba(15,23,42,0.34)] backdrop-blur-xl">
      <div className="mb-6">
        <p className="text-sm font-medium text-sky-700">Package manager</p>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Upload package jasa dan biaya
        </h2>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(300px,0.9fr)_minmax(0,1.1fr)]">
        <div className="rounded-[1.9rem] border border-slate-200 bg-slate-50/85 p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-lg font-bold text-slate-900">Package aktif saat ini</p>
              <p className="text-sm text-slate-500">Pilih card untuk edit data package.</p>
            </div>
            <Button
              type="button"
              variant="outline"
              className="rounded-full border-slate-200 bg-white"
              onClick={handleAddNew}
            >
              <Plus className="size-4" />
              Tambah
            </Button>
          </div>

          <div className="space-y-3">
          {loadingData ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-24 w-full animate-pulse rounded-[1.6rem] bg-slate-200/70" />
            ))
          ) : (
            [...packages]
              .sort((a, b) => (a.is_active === b.is_active ? 0 : a.is_active ? -1 : 1))
              .map((pkg) => {
                const isActive = selectedPackage?.id === pkg.id;

                const baseStyle = "block w-full rounded-[1.6rem] border p-5 text-left transition";
                const stateStyle = isActive
                  ? "border-sky-200 bg-white shadow-[0_20px_60px_-38px_rgba(14,116,144,0.45)]"
                  : pkg.is_active
                  ? "border-white bg-white/90 hover:border-slate-200"
                  : "border-transparent bg-slate-100/50 opacity-70 hover:bg-slate-100";

                return (
                  <button
                    key={pkg.id}
                    type="button"
                    onClick={() => handleSelectPackage(pkg)}
                    className={`${baseStyle} ${stateStyle}`}
                  >
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <span className={`font-semibold ${pkg.is_active ? "text-slate-900" : "text-slate-500"}`}>
                        {pkg.nama_package} {!pkg.is_active && "(paket nonaktif)"}
                      </span>
                      <span className="text-sm text-sky-700">{pkg.kategori}</span>
                    </div>
                    <p className="text-[1.05rem] text-slate-500">Rp{Number(pkg.harga).toLocaleString('id-ID')}</p>
                  </button>
                );
              })
          )}
        </div>
        </div>

      <div className="rounded-[1.9rem] border border-slate-200 bg-white p-6 shadow-[0_20px_80px_-48px_rgba(15,23,42,0.3)] h-full">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-lg font-bold text-slate-900">
              {selectedPackage ? "Edit data package" : "Tambah package baru"}
            </p>
            <p className="text-sm text-slate-500">
              Update detail package yang dipilih.
            </p>
          </div>
          <div className="rounded-full bg-slate-100 p-2 text-slate-600">
            <PencilLine className="size-4" />
          </div>
        </div>

        {/* Grid form dengan gap lebih lebar */}
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Nama package">
            <input
              value={formData.nama_package}
              onChange={(e) => setFormData({...formData, nama_package: e.target.value})}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-500"
            />
          </Field>
          <Field label="Kategori">
            <select
              value={formData.kategori}
              onChange={(e) => setFormData({...formData, kategori: e.target.value})}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-500"
            >
              <option>Wedding</option>
              <option>Wisuda</option>
            </select>
          </Field>

          <Field label="Harga">
            <input
              value={formData.harga}
              onChange={(e) => setFormData({...formData, harga: e.target.value})}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-500"
            />
          </Field>
          <Field label="Highlight package">
            <input
              value={formData.highlight_package}
              onChange={(e) => setFormData({...formData, highlight_package: e.target.value})}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-500"
            />
          </Field>

          <div className="sm:col-span-2">
            <Field label="Deskripsi singkat">
              <textarea
                value={formData.deskripsi_singkat}
                onChange={(e) => setFormData({...formData, deskripsi_singkat: e.target.value})}
                rows={6} // Dibuat lebih tinggi agar terlihat penuh
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-500"
              />
            </Field>
          </div>

          {selectedPackage && (
              <div className="sm:col-span-2 flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <span className="text-sm font-medium text-slate-700">Status Paket</span>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, is_active: !formData.is_active})}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.is_active ? "bg-emerald-500" : "bg-slate-300"
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.is_active ? "translate-x-6" : "translate-x-1"
                  }`} />
                </button>
              </div>
            )}
        </div>

        <div className="mt-8 flex gap-3">
          <Button 
            onClick={handleSave} 
            className="h-12 flex-1 rounded-2xl bg-slate-900 text-white hover:bg-slate-800"
          >
            Simpan perubahan
          </Button>
          {/* <Button 
            variant="outline" 
            onClick={handleAddNew}
            className="h-12 w-12 rounded-2xl p-0"
          >
            <Plus className="size-5" />
          </Button> */}
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
