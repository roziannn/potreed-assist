import { BarChart3, CalendarDays, MessageSquareQuote, Sparkles, MousePointer2, MessageCircle, Info, Target } from "lucide-react";
import {
  getBudgetRangeStats,
  getPopularPackageStats,
  getTopGuestQuestions,
  getEngagementSummary,
} from "@/lib/analytics-queries";
import { getSmartInsights } from "@/lib/ai-insights-engine";

export async function SummarySection() {
  const [
    budgetRanges, 
    { stats: popularPackages, total: totalPackageViews },
    dynamicTopQuestions,
    { insights: dynamicInsights, source: insightSource },
    engagementSummary,
  ] = await Promise.all([
    getBudgetRangeStats(),
    getPopularPackageStats(),
    getTopGuestQuestions(),
    getSmartInsights(),
    getEngagementSummary(),
  ]);

  const colorMap: Record<string, string> = {
    violet: "border-violet-100 bg-violet-50 text-violet-700",
    sky: "border-sky-100 bg-sky-50 text-sky-700",
    emerald: "border-emerald-100 bg-emerald-50 text-emerald-700",
    amber: "border-amber-100 bg-amber-50 text-amber-700",
  };

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
          {dynamicTopQuestions.length === 0 ? (
             <p className="text-sm text-slate-500">Belum ada data pertanyaan.</p>
          ) : (
            dynamicTopQuestions.map((item) => (
              <div
                key={item.topic}
                className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3"
              >
                <span className="text-sm text-slate-700">{item.topic}</span>
                <span className="text-sm font-semibold text-sky-700">{item.count}x</span>
              </div>
            ))
          )}
        </InsightPanel>
        
       <InsightPanel
          icon={<Sparkles className="size-4" />}
          title="Paket yang sering ditanya"
          subtitle={`Total page/package asked: ${totalPackageViews.toLocaleString("id-ID")}`}
        >
          {popularPackages.length === 0 ? (
            <p className="text-sm text-slate-500">Belum ada data inquiry paket.</p>
          ) : (
            popularPackages.map((item) => (
              <div
                key={item.nama} 
                className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3"
              >
                <span className="text-sm text-slate-700">{item.nama}</span>
                <span className="text-sm font-semibold text-sky-700">{item.count}x asked</span>
              </div>
            ))
          )}
        </InsightPanel>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <InsightPanel
          icon={<Sparkles className="size-4" />}
          title="AI Insight"
          subtitle={
            insightSource === "fallback"
              ? "Ringkasan perilaku pengunjung berdasarkan aktivitas di website (mode fallback)"
              : "Ringkasan perilaku pengunjung berdasarkan aktivitas di website"
          }
        >
          <div className="space-y-3">
            {dynamicInsights.length === 0 ? (
               <p className="text-sm text-slate-500">Belum ada insight yang cukup dari data saat ini.</p>
            ) : (
              dynamicInsights.map((insight, index) => (
                <div 
                  key={index} 
                  className={`rounded-2xl border p-4 ${colorMap[insight.color] || colorMap.sky}`}
                >
                  <p className="text-sm font-semibold">
                    {insight.icon} {insight.title}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {insight.desc}
                  </p>
                </div>
              ))
            )}
          </div>
        </InsightPanel>

        <InsightPanel
          icon={<BarChart3 className="size-4" />}
          title="Estimasi budget paling banyak dicari"
          subtitle="Bisa dipakai untuk positioning harga dan promo"
        >
          {budgetRanges.length === 0 || budgetRanges.every((item) => item.count === 0) ? (
            <p className="text-sm text-slate-500">Belum ada data budget dari client_needs.</p>
          ) : (
            budgetRanges.map((item) => (
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
            ))
          )}
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
  icon: React.ReactNode;
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