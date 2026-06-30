"use client";

import { useState } from "react";
import { CalendarCheck2, CalendarDays, ChevronLeft, ChevronRight, ClipboardList, Plus, X } from "lucide-react";
import { bookingItems } from "@/lib/site-data";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";

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
  const [showModal, setShowModal] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  
  const [selectedDate, setSelectedDate] = useState<number | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const [sessionLimit, setSessionLimit] = useState(2);

  const bookingsByDate = bookingItems.reduce<Record<string, number>>((acc, item) => {
    acc[item.eventDate] = (acc[item.eventDate] ?? 0) + 1;
    return acc;
  }, {});

  const isFullBooked = (d: number, m: number, y: number) => {
  const dateText = new Date(y, m, d).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (bookingsByDate[dateText] ?? 0) >= sessionLimit;
};
const fullDates = Object.entries(bookingsByDate).filter(
  ([, count]) => count >= sessionLimit
);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const [filter, setFilter] = useState<'all' | 'weekend' | 'weekday'>('all'); 

  return (
    <section className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_24px_100px_-52px_rgba(34,197,94,0.24)] backdrop-blur-xl">
   <div className="mb-6 flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-emerald-700">Booking manager</p>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Kelola booking yang masuk dan follow up client
        </h2>
      </div>

      <Dialog>
        <DialogTrigger asChild>
        <Button variant="outline" className="rounded-full gap-2 shrink-0">
          <CalendarDays className="size-4" /> Lihat Kalender
        </Button>
      </DialogTrigger>
        <DialogContent className="sm:max-w-md rounded-[2rem] p-6">
       <DialogHeader>
  {/* Baris 1: Navigasi Bulan */}
  <div className="flex items-center justify-between px-2 mb-4">
    <DialogTitle className="text-lg font-bold text-slate-800">
      {currentDate.toLocaleString('id-ID', { month: 'long', year: 'numeric' })}
    </DialogTitle>
    <div className="flex gap-1">
      <Button variant="ghost" size="icon" onClick={() => setCurrentDate(new Date(year, month - 1, 1))}>
        <ChevronLeft className="w-4 h-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={() => setCurrentDate(new Date(year, month + 1, 1))}>
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  </div>

  <div className="space-y-4 mb-6 border-b pb-6">
    {/* Limit sesi */}
    <div className="flex items-center justify-between px-2">
      <span className="text-xs font-medium text-slate-500">Limit sesi harian bulan ini:</span>
      <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-1.5 py-1">
        <button
          type="button"
          onClick={() => setSessionLimit((prev) => Math.max(1, prev - 1))}
          className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-slate-600 shadow-sm hover:bg-slate-100 disabled:opacity-40"
          disabled={sessionLimit <= 1}
        >−</button>
        <span className="w-5 text-center text-sm font-semibold text-slate-800">{sessionLimit}</span>
        <button
          type="button"
          onClick={() => setSessionLimit((prev) => Math.min(10, prev + 1))}
          className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-slate-600 shadow-sm hover:bg-slate-100 disabled:opacity-40"
          disabled={sessionLimit >= 10}
        >+</button>
      </div>
    </div>

    {/* Filter Availability */}
    <div className="flex items-center justify-between px-2">
      <div className="flex gap-4">
        <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer">
          <input type="radio" checked={filter === 'weekend'} onChange={() => setFilter('weekend')} className="accent-emerald-600" />
          Hanya Open Weekend
        </label>
        <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer">
          <input type="radio" checked={filter === 'weekday'} onChange={() => setFilter('weekday')} className="accent-emerald-600" />
          Hanya Open Weekday
        </label>
      </div>
      <button onClick={() => setFilter('all')} className="text-[10px] text-slate-400 underline">Reset</button>
    </div>

    {/* Tombol Simpan */}
    <Button 
      className="w-full h-9 rounded-full bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold"
      onClick={() => alert("Pengaturan berhasil disimpan!")}
    >
      Simpan Pengaturan
    </Button>
  </div>
</DialogHeader>

        {/* Header Su-Sa */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-400 mb-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <div key={d}>{d}</div>)}
        </div>

        {/* Grid Kalender */}
        <div className="grid grid-cols-7 gap-1">
          {blanks.map(b => <div key={`blank-${b}`} />)}
          {days.map(day => {
            const full = isFullBooked(day, month, year);
            return (
              <div key={day} className="flex flex-col items-center">
                <button 
                  disabled={full}
                  onClick={() => !full && setSelectedDate(day)}
                  className={`h-9 w-9 flex items-center justify-center rounded-full transition-all font-medium text-sm
                  ${full ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'hover:bg-blue-100 text-slate-700'}
                  ${selectedDate === day && !full ? 'bg-blue-600 text-white hover:bg-blue-600' : ''}`}
                >
                  {day}
                </button>
                
                {full && (
                  <span className="text-[9px] font-bold text-red-500 uppercase mt-1 leading-none">
                    Full
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </DialogContent>
      </Dialog>
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

