"use client";

import { useState } from "react";
import { servicePackages } from "@/lib/site-data";
import { Button } from "@/components/ui/button";

export function PackageManagerSection() {
  const [packageName, setPackageName] = useState("");
  const [packageCategory, setPackageCategory] = useState("Wedding");
  const [packagePrice, setPackagePrice] = useState("");
  const [packageHighlight, setPackageHighlight] = useState("");

  return (
    <section className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_24px_100px_-52px_rgba(15,23,42,0.34)] backdrop-blur-xl">
      <div className="mb-6">
        <p className="text-sm font-medium text-sky-700">Package manager</p>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Upload package jasa dan biaya
        </h2>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nama package">
            <input
              value={packageName}
              onChange={(event) => setPackageName(event.target.value)}
              placeholder="Contoh: Wedding Sunset Story"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
            />
          </Field>
          <Field label="Kategori">
            <select
              value={packageCategory}
              onChange={(event) => setPackageCategory(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
            >
              <option>Wedding</option>
              <option>Wisuda</option>
              <option>Custom</option>
            </select>
          </Field>
          <Field label="Harga">
            <input
              value={packagePrice}
              onChange={(event) => setPackagePrice(event.target.value)}
              placeholder="Rp4.500.000"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
            />
          </Field>
          <Field label="Highlight package">
            <input
              value={packageHighlight}
              onChange={(event) => setPackageHighlight(event.target.value)}
              placeholder="Cocok untuk akad + intimate reception"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
            />
          </Field>
          <div className="sm:col-span-2">
            <Button className="h-11 rounded-2xl bg-slate-900 px-5 text-white hover:bg-slate-800">
              Simpan draft package
            </Button>
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-4">
          <p className="mb-4 text-sm font-semibold text-slate-900">Package aktif saat ini</p>
          <div className="space-y-3">
            {servicePackages.slice(0, 4).map((pkg) => (
              <div key={pkg.name} className="rounded-2xl border border-white bg-white p-4">
                <div className="mb-1 flex items-center justify-between gap-3">
                  <span className="font-semibold text-slate-900">{pkg.name}</span>
                  <span className="text-xs text-sky-700">{pkg.category}</span>
                </div>
                <p className="text-sm text-slate-500">{pkg.price}</p>
              </div>
            ))}
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
