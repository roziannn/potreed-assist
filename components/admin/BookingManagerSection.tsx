"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase"; // Pastikan path ini benar
import { Button } from "../ui/button";
import { CalendarCheck2, CalendarDays, ChevronLeft, ChevronRight, ClipboardList, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { useToast } from "@/components/ui/toast-provider";

export function BookingManagerSection() {
  const { showToast } = useToast();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const [clientName, setClientName] = useState("");
  const [eventType, setEventType] = useState("Wedding");
  const [packageName, setPackageName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [status, setStatus] = useState("Pending");
  const [budget, setBudget] = useState("");
  const [catatan_admin, setcatatan_admin] = useState("");
  const [whatsapp, setWhatsapp] = useState(""); 
  const [isDone, setIsDone] = useState(false);
  useEffect(() => {
    fetchBookings();
  }, []);

  async function fetchBookings() {
    setLoadingData(true);
    try {
      const { data } = await supabase.from("bookings").select("*").order("created_at", { ascending: false });
      if (data) setBookings(data);
    } finally {
      setLoadingData(false);
    }
  }

  const handleSelectBooking = (booking: any) => {
    setSelectedBooking(booking);
    setClientName(booking.nama_client ?? "");
    setEventType(booking.jenis_event ?? "Wedding");
    setPackageName(booking.package_name ?? "");
    setEventDate(booking.tanggal_event ?? "");
    setStatus(booking.status ?? "Pending");
    setBudget(booking.budget ?? "");
    setcatatan_admin(booking.catatan_admin ?? "");
    setWhatsapp(booking.whatsapp ?? "");
    setIsDone(booking.is_done ?? false);
  };

  const handleSave = async () => {
  setLoading(true);
  // sanitize budget: convert formatted string to number, or null if empty
  const cleanedBudget = (budget || "").toString().replace(/[^0-9.-]/g, "");
  const parsedBudget = cleanedBudget === "" ? null : Number(cleanedBudget);

  const payload = {
    nama_client: clientName,
    jenis_event: eventType,
    tanggal_event: eventDate,
    status: status,
    is_done: isDone,
    budget: parsedBudget,
    catatan_admin: catatan_admin,
    whatsapp: whatsapp,
  };

  try {
    const { data, error } = selectedBooking 
      ? await supabase.from("bookings").update(payload).eq("id", selectedBooking.id)
      : await supabase.from("bookings").insert([payload]);

    if (error) {
      console.error("DEBUG ERROR SUPABASE:", error);
      showToast("Gagal menyimpan booking", error.message, "error");
    } else {
      showToast("Booking tersimpan", "Perubahan booking berhasil disimpan.");
      fetchBookings();
    }
  } catch (err) {
    console.error("Unexpected Error:", err);
  } finally {
    setLoading(false);
  }
};

const handleSaveSettings = async () => {
  setLoading(true);
  const { error } = await supabase
    .from("booking_settings")
    .upsert([
      {
        month: currentDate.getMonth() + 1,
        year: currentDate.getFullYear(),
        session_limit: sessionLimit,
        is_only_weekend: filter === 'weekend',
        is_only_weekday: filter === 'weekday',
      }
    ], { onConflict: 'month, year' });

  setLoading(false);
  if (error) {
    showToast("Gagal menyimpan pengaturan", error.message, "error");
  } else {
    showToast("Pengaturan tersimpan", "Pengaturan kalender berhasil diperbarui.");
  }
};

  const handleAddNew = () => {
    setSelectedBooking("");
    setClientName("");
    setEventType("Wedding");
    setPackageName("");
    setEventDate("");
    setStatus("Pending");
    setBudget("");
    setcatatan_admin("");
    setWhatsapp("");
    setIsDone(false);
  };
  const [showModal, setShowModal] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  
  const [selectedDate, setSelectedDate] = useState<number | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const [sessionLimit, setSessionLimit] = useState(2);

  const bookingsByDate = bookings.reduce<Record<string, number>>((acc, item) => {
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

  useEffect(() => {
  const fetchSettings = async () => {
    const { data } = await supabase
      .from("booking_settings")
      .select("*")
      .eq("month", currentDate.getMonth() + 1)
      .eq("year", currentDate.getFullYear())
      .single();

    if (data) {
      setSessionLimit(data.session_limit);
      if (data.is_only_weekend) setFilter('weekend');
      else if (data.is_only_weekday) setFilter('weekday');
      else setFilter('all');
    } else {
      setSessionLimit(2);
      setFilter('all');
    }
  };

  fetchSettings();
}, [currentDate]);

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
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-medium text-slate-500">Limit sesi per-hari bulan ini:</span>
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

          <Button 
          className="w-full h-9 rounded-full bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold"
          onClick={handleSaveSettings} 
        >
          Simpan Pengaturan
        </Button>
        </div>
      </DialogHeader>

        <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-400 mb-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <div key={d}>{d}</div>)}
        </div>

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
            {loadingData ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-20 w-full animate-pulse rounded-[1.6rem] bg-slate-200/70" />
              ))
            ) : (
              bookings.map((booking) => {
                const isActive = selectedBooking?.id === booking.id;
                const archived = !!booking.is_done;

                const cardClass = archived
                  ? "border-transparent bg-slate-100/70 opacity-80 hover:bg-slate-100"
                  : isActive
                  ? "border-emerald-200 bg-white shadow-[0_20px_60px_-38px_rgba(34,197,94,0.35)]"
                  : "border-white bg-white/90 hover:border-emerald-100 hover:bg-white";

                return (
                  <button
                    key={booking.id}
                    type="button"
                    onClick={() => handleSelectBooking(booking)}
                    className={`block w-full rounded-[1.6rem] border p-5 text-left transition ${cardClass}`}
                  >
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <span className={`font-semibold ${archived ? "text-slate-500" : "text-slate-900"}`}>
                        {booking.nama_client}{archived ? " (selesai)" : ""}
                      </span>
                      <span className={`text-sm ${archived ? "text-slate-400" : "text-emerald-700"}`}>{booking.status}</span>
                    </div>

                    <p className={`text-sm ${archived ? "text-slate-400" : "text-slate-600"}`}>{booking.package_name}</p>

                    <p className={`text-sm font-medium ${archived ? "text-slate-400" : "text-slate-500"}`}>{booking.jenis_event}</p>

                    <p className={`mt-1 text-sm ${archived ? "text-slate-400" : "text-slate-500"}`}>
                      {booking.tanggal_event
                        ? new Date(booking.tanggal_event).toLocaleDateString("id-ID", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          }).replace(/\./g, '/')
                        : "-"}
                    </p>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="rounded-[1.9rem] border border-emerald-100 bg-white p-5 shadow-[0_20px_80px_-48px_rgba(34,197,94,0.28)]">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-lg font-bold text-slate-900">{selectedBooking ? "Edit booking" : "Tambah booking baru"}</p>
              <p className="text-sm text-slate-500">Update status, paket yang dipilih, tanggal event, dan catatan follow up client.</p>
            </div>
            <div className="rounded-full bg-emerald-50 p-2 text-emerald-700">
              {selectedBooking ? <CalendarCheck2 className="size-4" /> : <ClipboardList className="size-4" />}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nama client">
              <input
                value={clientName}
                onChange={(event) => setClientName(event.target.value)}
                placeholder="Contoh: Nadya & Fikri"
                className="w-full rounded-2xl border border-slate-200 bg-emerald-50/30 px-4 py-3 text-sm outline-none transition-colors hover:border-emerald-300 focus:border-emerald-400"
              />
            </Field>

            <Field label="Nomor WhatsApp">
              <input
                value={whatsapp}
                onChange={(event) => setWhatsapp(event.target.value)}
                placeholder="Contoh: 08123456789"
                type="tel"
                className="w-full rounded-2xl border border-slate-200 bg-emerald-50/30 px-4 py-3 text-sm outline-none transition-colors hover:border-emerald-300 focus:border-emerald-400"
              />
            </Field>

            <Field label="Jenis event">
              <select
                value={eventType}
                onChange={(event) => setEventType(event.target.value as "Wedding" | "Wisuda" | "Custom")}
                className="w-full rounded-2xl border border-slate-200 bg-emerald-50/30 px-4 py-3 text-sm outline-none transition-colors hover:border-emerald-300 focus:border-emerald-400"
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
                className="w-full rounded-2xl border border-slate-200 bg-emerald-50/30 px-4 py-3 text-sm outline-none transition-colors hover:border-emerald-300 focus:border-emerald-400"
              />
            </Field>

            <Field label="Tanggal event">
              <input
                value={eventDate}
                onChange={(event) => setEventDate(event.target.value)}
                placeholder="12 Juli 2026"
                className="w-full rounded-2xl border border-slate-200 bg-emerald-50/30 px-4 py-3 text-sm outline-none transition-colors hover:border-emerald-300 focus:border-emerald-400"
              />
            </Field>

            <Field label="Status">
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value as "Pending" | "Confirmed" | "Follow Up")}
                className="w-full rounded-2xl border border-slate-200 bg-emerald-50/30 px-4 py-3 text-sm outline-none transition-colors hover:border-emerald-300 focus:border-emerald-400"
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
                className="w-full rounded-2xl border border-slate-200 bg-emerald-50/30 px-4 py-3 text-sm outline-none transition-colors hover:border-emerald-300 focus:border-emerald-400"
              />
            </Field>

            <div className="sm:col-span-2">
              <Field label="Catatan admin">
                <textarea
                  value={catatan_admin}
                  onChange={(event) => setcatatan_admin(event.target.value)}
                  rows={4}
                  placeholder="Tambahkan catatan follow up, kebutuhan client, atau status pembayaran."
                  className="w-full rounded-2xl border border-slate-200 bg-emerald-50/30 px-4 py-3 text-sm outline-none transition-colors hover:border-emerald-300 focus:border-emerald-400"
                />
              </Field>
            </div>

            <div className="sm:col-span-2">
              <div className="flex items-center justify-between rounded-2xl border border-emerald-100 bg-emerald-50/50 px-6 py-4 mb-3">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-900">Selesai</span>
                  <span className="text-xs text-slate-500">Tandai booking sudah selesai</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDone(!isDone)}
                  className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${isDone ? "bg-emerald-500" : "bg-slate-300"}`}>
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${isDone ? "translate-x-8" : "translate-x-1"}`} />
                </button>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button onClick={handleSave} className="h-11 rounded-2xl bg-emerald-600 px-5 text-white hover:bg-emerald-700">
                  {selectedBooking ? "Simpan perubahan" : "Tambah booking"}
                </Button>
                {selectedBooking ? (
                  <Button type="button" variant="outline" className="h-11 rounded-2xl border-slate-200" onClick={handleAddNew}>
                    Buat booking baru
                  </Button>
                ) : null}
              </div>
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

