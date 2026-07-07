import { supabaseAdmin } from "@/lib/supabase-admin";
import { classifyTopic } from "@/lib/topic-classifier";


export type BudgetRangeStat = { label: string; share: string; count: number };

const BUDGET_BUCKETS = [
  { label: "Rp300rb - Rp1jt", min: 300_000, max: 1_000_000 },
  { label: "Rp1jt - Rp3jt", min: 1_000_000, max: 3_000_000 },
  { label: "Rp3jt - Rp5jt", min: 3_000_000, max: 5_000_000 },
  { label: "Rp5jt - Rp8jt", min: 5_000_000, max: 8_000_000 },
  { label: "> Rp8jt", min: 8_000_000, max: Infinity },
];

// Beberapa baris analytics_events kamu tersimpan dengan page "/assistant"
// dan sebagian lagi "assistant" (tanpa slash) — kita tangkap dua-duanya.
const ASSISTANT_PAGE_VALUES = ["/assistant", "assistant"];

// ---- Engagement summary (metric cards paling atas dashboard) ----

export type EngagementSummary = {
  totalClicks: number;
  floatingChatStarts: number;
  consultationClicks: number;
  bookingIntent: number;
};

export async function getEngagementSummary(): Promise<EngagementSummary> {
  const fallback: EngagementSummary = {
    totalClicks: 0,
    floatingChatStarts: 0,
    consultationClicks: 0,
    bookingIntent: 0,
  };

  const [totalRes, chatRes, consultationRes, bookingRes] = await Promise.all([
    // Total klik: semua row di analytics_events, apapun page/event-nya
    supabaseAdmin
      .from("analytics_events")
      .select("*", { count: "exact", head: true }),

    // Chat dimulai: distinct session_id yang pernah hit page /assistant
    supabaseAdmin
      .from("analytics_events")
      .select("session_id")
      .in("page", ASSISTANT_PAGE_VALUES),

    // Klik konsultasi: jumlah row di halaman konsultasi
    supabaseAdmin
      .from("analytics_events")
      .select("*", { count: "exact", head: true })
      .eq("page", "/landing/konsultasi-sesi"),

    // Intent booking: jumlah event_type booking_click
    supabaseAdmin
      .from("analytics_events")
      .select("*", { count: "exact", head: true })
      .eq("event_type", "booking_click"),
  ]);

  if (totalRes.error || chatRes.error || consultationRes.error || bookingRes.error) {
    console.error("getEngagementSummary error:", {
      totalError: totalRes.error,
      chatError: chatRes.error,
      consultationError: consultationRes.error,
      bookingError: bookingRes.error,
    });
    return fallback;
  }

  const distinctChatSessions = new Set(
    (chatRes.data ?? [])
      .map((row: any) => row.session_id)
      .filter((id): id is string => Boolean(id))
  ).size;

  return {
    totalClicks: totalRes.count ?? 0,
    floatingChatStarts: distinctChatSessions,
    consultationClicks: consultationRes.count ?? 0,
    bookingIntent: bookingRes.count ?? 0,
  };
}

export async function getBudgetRangeStats(): Promise<BudgetRangeStat[]> {
  const { data, error } = await supabaseAdmin
    .from("client_needs")
    .select("budget_min, budget_max")
    .not("budget_min", "is", null)
    .not("budget_max", "is", null);

  if (error) {
    console.error("getBudgetRangeStats error:", error);
    return BUDGET_BUCKETS.map((bucket) => ({ label: bucket.label, share: "0%", count: 0 }));
  }

  if (!data?.length) {
    return BUDGET_BUCKETS.map((bucket) => ({ label: bucket.label, share: "0%", count: 0 }));
  }

  const counts = BUDGET_BUCKETS.map(() => 0);

  for (const row of data) {
    const min = Number(row.budget_min);
    const max = Number(row.budget_max);
    if (Number.isNaN(min) || Number.isNaN(max)) continue;

    const midpoint = (min + max) / 2;
    const bucketIndex = BUDGET_BUCKETS.findIndex((bucket) => midpoint >= bucket.min && midpoint < bucket.max);
    if (bucketIndex !== -1) counts[bucketIndex] += 1;
  }

  const total = data.length;

  return BUDGET_BUCKETS.map((bucket, i) => ({
    label: bucket.label,
    share: total > 0 ? `${Math.round((counts[i] / total) * 100)}%` : "0%",
    count: counts[i],
  }));
}

// paket sering ditanya
export type PackageInquiryStat = {
  nama_package: string;
  count: number;
};

export async function getPopularPackageStats() {
  const { data: eventsData, error: eventsError } = await supabaseAdmin
    .from("analytics_events")
    .select("package_id")
    .eq("event_type", "package_inquiry_click")
    .not("package_id", "is", null);

  if (eventsError || !eventsData) {
    console.error("Error fetching analytics:", eventsError);
    return { stats: [], total: 0 };
  }

  const countMap: Record<string, number> = {};
  eventsData.forEach((row) => {
    countMap[row.package_id] = (countMap[row.package_id] || 0) + 1;
  });

  const packageIds = Object.keys(countMap);
  if (packageIds.length === 0) return { stats: [], total: 0 };

  const { data: packagesData, error: packagesError } = await supabaseAdmin
    .from("packages")
    .select("id, nama_package")
    .in("id", packageIds);

  if (packagesError) {
    console.error("Error fetching packages details:", packagesError);
    return { stats: [], total: 0 };
  }

  const stats = packagesData
    .map((pkg) => ({
      nama: pkg.nama_package,
      count: countMap[pkg.id] || 0,
    }))
    .sort((a, b) => b.count - a.count);

  return { 
    stats, 
    total: eventsData.length 
  };
}

// // top questions
export type TopQuestionStat = {
  topic: string;
  count: number;
};

export async function getTopGuestQuestions(): Promise<TopQuestionStat[]> {
  const { data, error } = await supabaseAdmin
    .from("analytics_events")
    .select("value")
    .in("page", ASSISTANT_PAGE_VALUES)
    .not("value", "is", null);

  if (error || !data) {
    console.error("Error fetching guest questions:", error);
    return [];
  }

  const countMap: Record<string, number> = {};

  data.forEach((row: any) => {
    if (!row.value) return;
    const topic = classifyTopic(row.value);
    countMap[topic] = (countMap[topic] || 0) + 1;
  });

  const stats = Object.entries(countMap)
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return stats;
}

export type AIInsight = {
  icon: string;
  title: string;
  desc: string;
  color: "sky" | "violet" | "emerald" | "amber";
};

// AI Insight fallback (kategori pertanyaan) — dihitung dari analytics_events asli
// (dipakai saat panggilan AI eksternal (Gemini) gagal/limit)

// Label ini harus persis sama dengan `label` di TOPIC_GROUPS pada topic-classifier.ts
const DP_TOPIC_LABEL = "Berapa persen minimal DP untuk booking?";
const WISUDA_TOPIC_LABELS = new Set([
  "Harga untuk paket wisuda?",
  "Booking wisuda di tanggal tertentu",
]);

// Ambang batas biar insight yang muncul cukup signifikan, bukan noise dari 1-2 kejadian.
// Bebas disesuaikan sesuai volume traffic kamu.
const MIN_OCCURRENCE = {
  dp: 3,
  wisuda: 3,
  weekdayReject: 2,
  otherTopic: 3,
};

export async function getAIInsightsFallback(): Promise<AIInsight[]> {
  const { data, error } = await supabaseAdmin
    .from("analytics_events")
    .select("value, metadata")
    .in("page", ASSISTANT_PAGE_VALUES)
    .not("value", "is", null);

  if (error) {
    console.error("getAIInsightsFallback error:", error);
    return [];
  }

  if (!data?.length) return [];

  let dpCount = 0;
  let wisudaCount = 0;
  let weekdayRejectCount = 0;
  const topicCounts: Record<string, number> = {};

  for (const row of data as any[]) {
    const text: string = row.value ?? "";
    const topic = classifyTopic(text);

    if (topic) {
      topicCounts[topic] = (topicCounts[topic] || 0) + 1;
      if (topic === DP_TOPIC_LABEL) dpCount++;
      if (WISUDA_TOPIC_LABELS.has(topic)) wisudaCount++;
    }

    const response: string = row.metadata?.response?.toLowerCase?.() ?? "";
    if (response.includes("hanya melayani") && response.includes("akhir pekan")) {
      weekdayRejectCount++;
    }
  }

  const insights: AIInsight[] = [];

  if (dpCount >= MIN_OCCURRENCE.dp) {
    insights.push({
      icon: "💡",
      title: "Banyak pertanyaan seputar DP",
      desc: `Ada ${dpCount} dari ${data.length} interaksi yang menanyakan Down Payment. Pertimbangkan menambahkan FAQ kebijakan DP dan refund di halaman utama.`,
      color: "sky",
    });
  }

  if (weekdayRejectCount >= MIN_OCCURRENCE.weekdayReject) {
    insights.push({
      icon: "📈",
      title: "Potensi booking weekday terlewat",
      desc: `Sistem menjawab "hanya melayani akhir pekan" sebanyak ${weekdayRejectCount} kali. Pertimbangkan membuka slot weekday terbatas untuk menangkap permintaan ini.`,
      color: "violet",
    });
  }

  if (wisudaCount >= MIN_OCCURRENCE.wisuda) {
    insights.push({
      icon: "✨",
      title: "Minat tinggi pada paket wisuda",
      desc: `Topik seputar wisuda muncul ${wisudaCount} kali. Pertimbangkan mempromosikan paket wisuda lebih gencar di halaman utama atau chat assistant.`,
      color: "emerald",
    });
  }

  const otherTopics = Object.entries(topicCounts)
    .filter(([label]) => label !== DP_TOPIC_LABEL && !WISUDA_TOPIC_LABELS.has(label))
    .sort((a, b) => b[1] - a[1]);

  const topOther = otherTopics[0];
  if (topOther && topOther[1] >= MIN_OCCURRENCE.otherTopic) {
    insights.push({
      icon: "🔎",
      title: "Topik lain yang sering ditanyakan",
      desc: `"${topOther[0]}" ditanyakan ${topOther[1]} kali. Pertimbangkan menambahkan jawaban ini secara eksplisit di halaman FAQ.`,
      color: "amber",
    });
  }

  return insights;
}

// ---- Insight engagement: minat weekend, client vehavior tahap eksplorasi web, rekomendasi ----
const MONTHS_ID: Record<string, number> = {
  januari: 0, februari: 1, maret: 2, april: 3, mei: 4, juni: 5,
  juli: 6, agustus: 7, september: 8, oktober: 9, november: 10, desember: 11,
};

// Parse tanggal format "25 Juli 2026" (bagian sebelum "|" di value booking_click)
function parseIndonesianDate(text: string): Date | null {
  const match = text.trim().match(/(\d{1,2})\s+([a-zA-Z]+)\s+(\d{4})/);
  if (!match) return null;
  const [, day, monthName, year] = match;
  const month = MONTHS_ID[monthName.toLowerCase()];
  if (month === undefined) return null;
  return new Date(Number(year), month, Number(day));
}

const ENGAGEMENT_MIN = {
  weekendSample: 3,   // minimal jumlah booking_click yang punya tanggal valid
  engagementSample: 5, // minimal total klik eksplorasi+intent
  explorationRatio: 1.5, // eksplorasi dianggap dominan kalau >= 1.5x intent
};

export async function getEngagementInsights(): Promise<AIInsight[]> {
  const insights: AIInsight[] = [];

  const { data: bookingClicks, error: bookingClickError } = await supabaseAdmin
    .from("analytics_events")
    .select("value")
    .eq("event_type", "booking_click")
    .not("value", "is", null);

  let hasWeekendInsight = false;

  if (!bookingClickError && bookingClicks) {
    let weekend = 0;
    let weekday = 0;

    for (const row of bookingClicks as any[]) {
      const rawDate = String(row.value).split("|")[0]?.trim();
      const date = rawDate ? parseIndonesianDate(rawDate) : null;
      if (!date) continue;
      const day = date.getDay(); // 0 = Minggu, 6 = Sabtu
      if (day === 0 || day === 6) weekend++;
      else weekday++;
    }

    const total = weekend + weekday;
    if (total >= ENGAGEMENT_MIN.weekendSample && weekend > weekday) {
      const weekendShare = Math.round((weekend / total) * 100);
      hasWeekendInsight = true;
      insights.push({
        icon: "📈",
        title: "Minat booking meningkat pada akhir pekan",
        desc: `${weekendShare}% dari ${total} klik jadwal booking jatuh di hari Sabtu atau Minggu. Sesi akhir pekan tampak punya potensi konversi booking yang lebih tinggi dibanding hari kerja.`,
        color: "violet",
      });
    }
  }

  const { data: eventRows, error: eventRowsError } = await supabaseAdmin
    .from("analytics_events")
    .select("event_type")
    .in("event_type", [
      "package_inquiry_click",
      "portfolio_click",
      "booking_click",
      "consultation_package_click",
    ]);

  let hasExplorationInsight = false;

  if (!eventRowsError && eventRows?.length) {
    const counts: Record<string, number> = {};
    eventRows.forEach((row: any) => {
      counts[row.event_type] = (counts[row.event_type] || 0) + 1;
    });

    const explorationCount = (counts["package_inquiry_click"] || 0) + (counts["portfolio_click"] || 0);
    const intentCount = (counts["booking_click"] || 0) + (counts["consultation_package_click"] || 0);
    const totalEngagement = explorationCount + intentCount;

    if (
      totalEngagement >= ENGAGEMENT_MIN.engagementSample &&
      explorationCount > intentCount * ENGAGEMENT_MIN.explorationRatio
    ) {
      hasExplorationInsight = true;
      insights.push({
        icon: "💡",
        title: "Banyak pengunjung masih pada tahap eksplorasi",
        desc: `${explorationCount} klik untuk lihat-lihat paket/portfolio, dibanding hanya ${intentCount} klik ke booking atau konsultasi. Menambahkan CTA setelah pengunjung lihat paket bisa membantu naikin intent booking.`,
        color: "sky",
      });
    }
  }

  // 3. Rekomendasi, disintesis dari insight 1 & 2 di atas
  if (hasWeekendInsight || hasExplorationInsight) {
    const parts: string[] = [];
    if (hasWeekendInsight) {
      parts.push(
        "fokuskan promosi pada slot akhir pekan dan kirim pengingat atau promo terbatas 3-5 hari sebelum tanggal yang paling sering diminati"
      );
    }
    if (hasExplorationInsight) {
      parts.push("tambahkan CTA yang lebih jelas setelah pengunjung membuka halaman paket atau portfolio");
    }

    insights.push({
      icon: "✨",
      title: "Rekomendasi AI",
      desc: `Untuk naikin peluang booking, ${parts.join(", dan ")}.`,
      color: "emerald",
    });
  }

  return insights;
}