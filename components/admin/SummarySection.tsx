import { BarChart3, CalendarDays, MessageSquareQuote, Sparkles, MousePointer2, MessageCircle, Info, Target } from "lucide-react";
import {
  bookingDateInsights,
  budgetRanges,
  engagementSummary,
  mostCheckedPackages,
  topGuestQuestions,
} from "@/lib/site-data";

export function SummarySection() {
  const totalPackageViews = mostCheckedPackages.reduce(
    (total, item) => total + item.views,
    0
  );

  return (
    <section className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_24px_100px_-52px_rgba(14,116,144,0.38)] backdrop-blur-xl">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium text-sky-700">Engagement summary</p>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Ringkasan interaksi calon client
          </h2>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        icon={<MousePointer2 className="size-5" />}
        label="Total klik"
        value={engagementSummary.totalClicks.toLocaleString("id-ID")}
      />
      <MetricCard
        icon={<MessageCircle className="size-5" />}
        label="Chat dimulai"
        value={engagementSummary.floatingChatStarts.toLocaleString("id-ID")}
      />
      <MetricCard
        icon={<Info className="size-5" />}
        label="Klik konsultasi"
        value={engagementSummary.consultationClicks.toLocaleString("id-ID")}
      />
      <MetricCard
        icon={<Target className="size-5" />}
        label="Intent booking"
        value={engagementSummary.bookingIntent.toLocaleString("id-ID")}
      />
    </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <InsightPanel
          icon={<MessageSquareQuote className="size-4" />}
          title="Pertanyaan paling sering"
          subtitle="Apa yang paling sering ditanya guest calon client"
        >
          {topGuestQuestions.map((item) => (
            <div
              key={item.topic}
              className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3"
            >
              <span className="text-sm text-slate-700">{item.topic}</span>
              <span className="text-sm font-semibold text-sky-700">{item.count}x</span>
            </div>
          ))}
        </InsightPanel>

        <InsightPanel
          icon={<Sparkles className="size-4" />}
          title="Paket yang sering dicek"
          subtitle={`Total page/package views: ${totalPackageViews.toLocaleString("id-ID")}`}
        >
          {mostCheckedPackages.map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3"
            >
              <span className="text-sm text-slate-700">{item.name}</span>
              <span className="text-sm font-semibold text-sky-700">{item.views} view</span>
            </div>
          ))}
        </InsightPanel>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <InsightPanel
          icon={<CalendarDays className="size-4" />}
          title="Pola pilihan tanggal"
          subtitle="Bedakan orang yang benar-benar berniat booking vs sekadar eksplor tanggal"
        >
          {bookingDateInsights.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700"
            >
              <div className="mb-2 font-semibold text-slate-900">{item.label}</div>
              <div className="flex items-center justify-between">
                <span>Intent booking</span>
                <span className="font-semibold text-sky-700">{item.intent} orang</span>
              </div>
              <div className="mt-1 flex items-center justify-between">
                <span>Sekadar klik tanggal</span>
                <span className="font-semibold text-amber-600">{item.curiosity} orang</span>
              </div>
            </div>
          ))}
        </InsightPanel>

        <InsightPanel
          icon={<BarChart3 className="size-4" />}
          title="Budget range terbanyak"
          subtitle="Bisa dipakai untuk menyusun positioning harga dan promo"
        >
          {budgetRanges.map((item) => (
            <div key={item.label} className="rounded-2xl bg-slate-50 px-4 py-3">
              <div className="mb-2 flex items-center justify-between text-sm text-slate-700">
                <span>{item.label}</span>
                <span className="font-semibold text-sky-700">{item.share}</span>
              </div>
              <div className="h-2 rounded-full bg-slate-200">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-sky-500 to-cyan-400"
                  style={{ width: item.share }}
                />
              </div>
            </div>
          ))}
        </InsightPanel>
      </div>
    </section>
  );
}

function MetricCard({ 
  label, 
  value, 
  icon 
}: { 
  label: string; 
  value: string; 
  icon: React.ReactNode; // Tambahkan ini
}) {
  return (
    <div className="rounded-[1.75rem] border border-slate-100 bg-slate-50 p-5">
      <div className="flex items-center gap-3">
        <div className="text-sky-600">{icon}</div>
        <p className="text-sm text-slate-500">{label}</p>
      </div>
      <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
    </div>
  );
}
function InsightPanel({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[1.75rem] border border-slate-100 bg-white p-5">
      <div className="mb-4 flex items-start gap-3">
        <div className="rounded-2xl bg-sky-50 p-2 text-sky-700">{icon}</div>
        <div>
          <h3 className="font-semibold text-slate-900">{title}</h3>
          <p className="text-sm text-slate-500">{subtitle}</p>
        </div>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}
