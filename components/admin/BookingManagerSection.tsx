"use client";

import { useState } from "react";
import { CalendarCheck2, ClipboardList, Plus } from "lucide-react";
import { bookingItems } from "@/lib/site-data";
import { Button } from "@/components/ui/button";

export function BookingManagerSection() {
  const [selectedBookingClient, setSelectedBookingClient] = useState(
    bookingItems[0]?.client ?? ""
  );

  const selectedBooking =
    bookingItems.find((item) => item.client === selectedBookingClient) ??
    bookingItems[0];

  const [clientName, setClientName] = useState(selectedBooking?.client ?? "");
  const [eventType, setEventType] = useState(selectedBooking?.eventType ?? "Wedding");
  const [packageName, setPackageName] = useState(
    selectedBooking?.packageName ?? ""
  );
  const [eventDate, setEventDate] = useState(selectedBooking?.eventDate ?? "");
  const [status, setStatus] = useState(selectedBooking?.status ?? "Pending");
  const [budget, setBudget] = useState(selectedBooking?.budget ?? "");
  const [notes, setNotes] = useState(selectedBooking?.notes ?? "");

  const handleSelectBooking = (client: string) => {
    const booking = bookingItems.find((item) => item.client === client);
    if (!booking) return;

    setSelectedBookingClient(booking.client);
    setClientName(booking.client);
    setEventType(booking.eventType);
    setPackageName(booking.packageName);
    setEventDate(booking.eventDate);
    setStatus(booking.status);
    setBudget(booking.budget);
    setNotes(booking.notes);
  };

  const handleAddNew = () => {
    setSelectedBookingClient("");
    setClientName("");
    setEventType("Wedding");
    setPackageName("");
    setEventDate("");
    setStatus("Pending");
    setBudget("");
    setNotes("");
  };

  return (
    <section className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_24px_100px_-52px_rgba(34,197,94,0.24)] backdrop-blur-xl">
      <div className="mb-6">
        <p className="text-sm font-medium text-emerald-700">Booking manager</p>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Kelola booking yang masuk dan follow up client
        </h2>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(300px,0.9fr)_minmax(0,1.1fr)]">
        <div className="rounded-[1.9rem] border border-emerald-100 bg-emerald-50/50 p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-lg font-bold text-slate-900">Booking aktif</p>
              <p className="text-sm text-slate-500">Pilih booking untuk lihat atau edit detailnya.</p>
            </div>
            <Button
              type="button"
              variant="outline"
              className="rounded-full border-emerald-100 bg-white"
              onClick={handleAddNew}
            >
              <Plus className="size-4" />
              Tambah
            </Button>
          </div>

          <div className="space-y-3">
            {bookingItems.map((booking) => {
              const isActive = selectedBookingClient === booking.client;

              return (
                <button
                  key={booking.client}
                  type="button"
                  onClick={() => handleSelectBooking(booking.client)}
                  className={`block w-full rounded-[1.6rem] border p-5 text-left transition ${
                    isActive
                      ? "border-emerald-200 bg-white shadow-[0_20px_60px_-38px_rgba(34,197,94,0.35)]"
                      : "border-white bg-white/90 hover:border-emerald-100 hover:bg-white"
                  }`}
                >
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <span className="font-semibold text-slate-900">{booking.client}</span>
                    <span className="text-sm text-emerald-700">{booking.status}</span>
                  </div>
                  <p className="text-sm text-slate-600">{booking.packageName}</p>
                  <p className="mt-1 text-sm text-slate-500">{booking.eventDate}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-[1.9rem] border border-emerald-100 bg-white p-5 shadow-[0_20px_80px_-48px_rgba(34,197,94,0.28)]">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-lg font-bold text-slate-900">
                {selectedBookingClient ? "Edit booking" : "Tambah booking baru"}
              </p>
              <p className="text-sm text-slate-500">
                Update status, paket yang dipilih, tanggal event, dan catatan follow up client.
              </p>
            </div>
            <div className="rounded-full bg-emerald-50 p-2 text-emerald-700">
              {selectedBookingClient ? (
                <CalendarCheck2 className="size-4" />
              ) : (
                <ClipboardList className="size-4" />
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nama client">
              <input
                value={clientName}
                onChange={(event) => setClientName(event.target.value)}
                placeholder="Contoh: Nadya & Fikri"
                className="w-full rounded-2xl border border-slate-200 bg-emerald-50/30 px-4 py-3 text-sm outline-none"
              />
            </Field>
            <Field label="Jenis event">
              <select
                value={eventType}
                onChange={(event) =>
                  setEventType(event.target.value as "Wedding" | "Wisuda" | "Custom")
                }
                className="w-full rounded-2xl border border-slate-200 bg-emerald-50/30 px-4 py-3 text-sm outline-none"
              >
                <option>Wedding</option>
                <option>Wisuda</option>
                <option>Custom</option>
              </select>
            </Field>
            <Field label="Package dipilih">
              <input
                value={packageName}
                onChange={(event) => setPackageName(event.target.value)}
                placeholder="Wedding Luxury"
                className="w-full rounded-2xl border border-slate-200 bg-emerald-50/30 px-4 py-3 text-sm outline-none"
              />
            </Field>
            <Field label="Tanggal event">
              <input
                value={eventDate}
                onChange={(event) => setEventDate(event.target.value)}
                placeholder="12 Juli 2026"
                className="w-full rounded-2xl border border-slate-200 bg-emerald-50/30 px-4 py-3 text-sm outline-none"
              />
            </Field>
            <Field label="Status">
              <select
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as "Pending" | "Confirmed" | "Follow Up")
                }
                className="w-full rounded-2xl border border-slate-200 bg-emerald-50/30 px-4 py-3 text-sm outline-none"
              >
                <option>Pending</option>
                <option>Confirmed</option>
                <option>Follow Up</option>
              </select>
            </Field>
            <Field label="Budget">
              <input
                value={budget}
                onChange={(event) => setBudget(event.target.value)}
                placeholder="Rp3.250.000"
                className="w-full rounded-2xl border border-slate-200 bg-emerald-50/30 px-4 py-3 text-sm outline-none"
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Catatan admin">
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  rows={4}
                  placeholder="Tambahkan catatan follow up, kebutuhan client, atau status pembayaran."
                  className="w-full rounded-2xl border border-slate-200 bg-emerald-50/30 px-4 py-3 text-sm outline-none"
                />
              </Field>
            </div>
            <div className="sm:col-span-2 flex flex-wrap gap-3">
              <Button className="h-11 rounded-2xl bg-emerald-600 px-5 text-white hover:bg-emerald-700">
                {selectedBookingClient ? "Simpan perubahan" : "Tambah booking"}
              </Button>
              {selectedBookingClient ? (
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 rounded-2xl border-slate-200"
                  onClick={handleAddNew}
                >
                  Buat booking baru
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
