"use client";
import { useState } from "react";
import { AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { FloatingChat } from "@/components/FloatingChat";
import { bookingItems } from "@/lib/site-data";

export default function SchedulePage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<number | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const maxBookingsPerDate = 2;

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

    return (bookingsByDate[dateText] ?? 0) >= maxBookingsPerDate;
  };

  const fullDates = Object.entries(bookingsByDate).filter(
    ([, count]) => count >= maxBookingsPerDate
  );

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(186,230,253,0.75),_transparent_28%),linear-gradient(180deg,_#f8fbff_0%,_#f8fafc_45%,_#fff7ed_100%)]">
      <Navbar />
      <FloatingChat />
      
      <div className="container mx-auto max-w-lg px-4 py-10">
        <div className="mb-4">
          <h1 className="mb-2 text-3xl font-bold text-slate-900">Jadwal Tersedia</h1>
          <p className="font-medium text-slate-500">Pilih tanggal untuk melihat sesi yang tersedia.</p>
        </div>

        <Card className="mb-6 rounded-[2rem] border-white/70 bg-white/85 p-4 shadow-[0_24px_100px_-56px_rgba(15,23,42,0.4)] backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4 px-2">
            <h2 className="text-lg font-bold text-slate-800">
              {currentDate.toLocaleString('id-ID', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={() => setCurrentDate(new Date(year, month - 1, 1))}><ChevronLeft className="w-4 h-4" /></Button>
              <Button variant="ghost" size="icon" onClick={() => setCurrentDate(new Date(year, month + 1, 1))}><ChevronRight className="w-4 h-4" /></Button>
            </div>
          </div>

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
        </Card>

        {isFullBooked(1, month, year) && (
        <div className="p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 animate-in fade-in">
            {/* Container ini membuat Icon dan Teks sejajar */}
            <div className="flex items-center gap-2 mb-1">
            <AlertCircle className="w-5 h-5" />
            <p className="font-bold text-md">Bulan Penuh</p>
            </div>
            
            {/* Penjelasan di bawahnya */}
            <p className="font-semibold text-md text-red-500/80 pl-7">
            Mohon maaf, semua jadwal di bulan ini telah terisi penuh. Silakan pilih bulan lainnya.
            </p>
        </div>
        )}

        {selectedDate && !isFullBooked(selectedDate, month, year) && (
        <div className="animate-in fade-in slide-in-from-bottom-4 mt-6">
            <div className="rounded-[2rem] border border-sky-100 bg-sky-50/85 p-6 text-center">
            <h3 className="font-bold text-slate-900 mb-2">
                Sesi Wisuda Potret
            </h3>
            <p className="text-sm text-slate-600 mb-6">
                Tanggal terpilih: <span className="font-bold text-slate-900">{selectedDate} {currentDate.toLocaleString('id-ID', { month: 'long' })}</span>
            </p>
            
            <Button className="h-12 w-full rounded-full bg-sky-600 font-bold shadow-lg shadow-sky-200 hover:bg-sky-700">
                Booking Sekarang
            </Button>
            </div>
        </div>
        )}
      </div>
    </main>
  );
}
