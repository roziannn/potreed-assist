"use client";

import { useState } from "react";
import { PencilLine, Plus } from "lucide-react";
import { servicePackages } from "@/lib/site-data";
import { Button } from "@/components/ui/button";

export function PackageManagerSection() {
  const [selectedPackageName, setSelectedPackageName] = useState(
    servicePackages[0]?.name ?? ""
  );
  const selectedPackage =
    servicePackages.find((pkg) => pkg.name === selectedPackageName) ??
    servicePackages[0];

  const [packageName, setPackageName] = useState(selectedPackage?.name ?? "");
  const [packageCategory, setPackageCategory] = useState(
    selectedPackage?.category ?? "Wedding"
  );
  const [packagePrice, setPackagePrice] = useState("");
  const [packageHighlight, setPackageHighlight] = useState(
    selectedPackage?.badge ?? ""
  );
  const [packageDescription, setPackageDescription] = useState(
    selectedPackage?.description ?? ""
  );

  const handleSelectPackage = (packageNameValue: string) => {
    const pkg = servicePackages.find((item) => item.name === packageNameValue);
    if (!pkg) return;

    setSelectedPackageName(pkg.name);
    setPackageName(pkg.name);
    setPackageCategory(pkg.category);
    setPackagePrice(pkg.price);
    setPackageHighlight(pkg.badge);
    setPackageDescription(pkg.description);
  };

  const handleAddNew = () => {
    setSelectedPackageName("");
    setPackageName("");
    setPackageCategory("Wedding");
    setPackagePrice("");
    setPackageHighlight("");
    setPackageDescription("");
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
            {servicePackages.slice(0, 4).map((pkg) => {
              const isActive = selectedPackageName === pkg.name;

              return (
                <button
                  key={pkg.name}
                  type="button"
                  onClick={() => handleSelectPackage(pkg.name)}
                  className={`block w-full rounded-[1.6rem] border p-5 text-left transition ${
                    isActive
                      ? "border-sky-200 bg-white shadow-[0_20px_60px_-38px_rgba(14,116,144,0.45)]"
                      : "border-white bg-white/90 hover:border-slate-200 hover:bg-white"
                  }`}
                >
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <span className="text-3 font-semibold text-slate-900 sm:text-[1.05rem]">
                      {pkg.name}
                    </span>
                    <span className="text-sm text-sky-700">{pkg.category}</span>
                  </div>
                  <p className="text-[1.05rem] text-slate-500">{pkg.price}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-[1.9rem] border border-slate-200 bg-white p-5 shadow-[0_20px_80px_-48px_rgba(15,23,42,0.3)]">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-lg font-bold text-slate-900">
                {selectedPackageName ? "Edit data package" : "Tambah package baru"}
              </p>
              <p className="text-sm text-slate-500">
                {selectedPackageName
                  ? "Update detail package yang sedang dipilih dari card di sebelah kiri."
                  : "Isi form berikut untuk menambahkan package baru ke daftar aktif."}
              </p>
            </div>
            <div className="rounded-full bg-slate-100 p-2 text-slate-600">
              {selectedPackageName ? (
                <PencilLine className="size-4" />
              ) : (
                <Plus className="size-4" />
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nama package">
              <input
                value={packageName}
                onChange={(event) => setPackageName(event.target.value)}
                placeholder="Contoh: Wedding Sunset Story"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
              />
            </Field>
            <Field label="Kategori">
              <select
                value={packageCategory}
                onChange={(event) => 
                  setPackageCategory(event.target.value as "Wedding" | "Wisuda" | "Custom")
                }
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
              >
                <option value="Wedding">Wedding</option>
                <option value="Wisuda">Wisuda</option>
                <option value="Custom">Custom</option>
              </select>
            </Field>
            <Field label="Harga">
              <input
                value={packagePrice}
                onChange={(event) => setPackagePrice(event.target.value)}
                placeholder="Rp4.500.000"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
              />
            </Field>
            <Field label="Highlight package">
              <input
                value={packageHighlight}
                onChange={(event) => setPackageHighlight(event.target.value)}
                placeholder="Cocok untuk akad + intimate reception"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Deskripsi singkat">
                <textarea
                  value={packageDescription}
                  onChange={(event) => setPackageDescription(event.target.value)}
                  rows={4}
                  placeholder="Deskripsikan keunggulan package ini untuk admin dan calon client."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
                />
              </Field>
            </div>
            <div className="sm:col-span-2 flex flex-wrap gap-3">
              <Button className="h-11 rounded-2xl bg-slate-900 px-5 text-white hover:bg-slate-800">
                {selectedPackageName ? "Simpan perubahan" : "Tambah package"}
              </Button>
              {selectedPackageName ? (
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 rounded-2xl border-slate-200"
                  onClick={handleAddNew}
                >
                  Buat package baru
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
