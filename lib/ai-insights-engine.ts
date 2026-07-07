import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabaseAdmin } from "@/lib/supabase-admin";
import {
  getBudgetRangeStats,
  getPopularPackageStats,
  getTopGuestQuestions,
  getEngagementInsights,
  getAIInsightsFallback,
  type AIInsight,
} from "@/lib/analytics-queries";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const VALID_COLORS = new Set(["sky", "violet", "emerald", "amber"]);

type SmartInsightsResult = { insights: AIInsight[]; source: "gemini" | "fallback" };

// ---- Cache harian di Supabase, biar Gemini cuma dipanggil 1x per hari ----

const CACHE_ROW_ID = 1;

// Hasil "fallback" dikasih umur cache jauh lebih pendek daripada hasil "gemini".
// Alasannya: fallback biasanya terjadi karena Gemini lagi down/limit -- kita mau
// coba lagi secara berkala (bukan nunggu ganti hari), tapi tetap dibatasi supaya
// tidak nge-hit Gemini di SETIAP request selama outage. Ini jadi jaring pengaman;
// kalau Gemini beneran berhasil, hasilnya langsung ke-lock 1 hari penuh seperti biasa.
const FALLBACK_CACHE_TTL_MS = 60 * 60 * 1000; // 1 jam

// Format tanggal ke YYYY-MM-DD berdasarkan timezone WIB, dipakai untuk
// menentukan apakah cache "gemini" masih "hari ini" atau sudah harus di-generate ulang.
function toJakartaDateString(date: Date): string {
  return date.toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });
}

async function getCachedInsights(): Promise<SmartInsightsResult | null> {
  const { data, error } = await supabaseAdmin
    .from("ai_insights_cache")
    .select("insights, source, generated_at")
    .eq("id", CACHE_ROW_ID)
    .maybeSingle();

  if (error) {
    console.error("Gagal baca cache AI insight, lanjut generate baru:", error);
    return null;
  }

  if (!data) return null;

  const generatedAt = new Date(data.generated_at);
  const source = data.source as "gemini" | "fallback";

  if (source === "gemini") {
    // Cache insight Gemini berlaku 1 hari penuh (reset di pergantian tanggal WIB)
    const cachedDate = toJakartaDateString(generatedAt);
    const todayDate = toJakartaDateString(new Date());
    if (cachedDate !== todayDate) return null; // cache basi, sudah ganti hari
  } else {
    // Cache fallback cuma berlaku 1 jam, biar Gemini dicoba lagi secara berkala
    const age = Date.now() - generatedAt.getTime();
    if (age > FALLBACK_CACHE_TTL_MS) return null;
  }

  return {
    insights: data.insights as AIInsight[],
    source,
  };
}

async function saveInsightsToCache(result: SmartInsightsResult): Promise<void> {
  const { error } = await supabaseAdmin.from("ai_insights_cache").upsert({
    id: CACHE_ROW_ID,
    insights: result.insights,
    source: result.source,
    generated_at: new Date().toISOString(),
  });

  if (error) {
    console.error("Gagal simpan cache AI insight:", error);
  }
}

// Deteksi error rate-limit/quota dari Gemini, supaya kita tahu ini "limit habis"
// vs error lain (misal API key salah, network error, dll).
function isRateLimitError(err: any): boolean {
  const status = err?.status ?? err?.response?.status;
  const message = String(err?.message ?? "").toLowerCase();
  return (
    status === 429 ||
    message.includes("quota") ||
    message.includes("rate limit") ||
    message.includes("resource_exhausted")
  );
}

function safeParseInsights(raw: string): AIInsight[] | null {
  try {
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    if (!Array.isArray(parsed)) return null;

    const valid: AIInsight[] = parsed
      .filter((item: any) => item && typeof item.title === "string" && typeof item.desc === "string")
      .map((item: any) => ({
        icon: typeof item.icon === "string" ? item.icon : "✨",
        title: item.title,
        desc: item.desc,
        color: VALID_COLORS.has(item.color) ? item.color : "sky",
      }));

    return valid.length ? valid : null;
  } catch (err) {
    console.error("Gagal parse JSON insight dari Gemini:", err);
    return null;
  }
}

// Kumpulkan data teragregasi (angka/statistik), BUKAN teks mentah tiap pertanyaan pengunjung.
// Ini penting supaya prompt kecil/hemat token dan tidak mengirim data personal ke API eksternal.
async function buildInsightSummary() {
  const [budgetRanges, { stats: popularPackages, total: totalPackageViews }, topQuestions] = await Promise.all([
    getBudgetRangeStats(),
    getPopularPackageStats(),
    getTopGuestQuestions(),
  ]);

  const { count: totalAssistantInteractions } = await supabaseAdmin
    .from("analytics_events")
    .select("id", { count: "exact", head: true })
    .in("page", ["/assistant", "assistant"]);

  const { data: eventCountRows } = await supabaseAdmin
    .from("analytics_events")
    .select("event_type")
    .in("event_type", [
      "package_inquiry_click",
      "portfolio_click",
      "booking_click",
      "consultation_package_click",
    ]);

  const eventCounts: Record<string, number> = {};
  eventCountRows?.forEach((row: any) => {
    eventCounts[row.event_type] = (eventCounts[row.event_type] || 0) + 1;
  });

  return {
    totalAssistantInteractions: totalAssistantInteractions ?? 0,
    topQuestions,       // [{ topic, count }]
    budgetRanges,       // [{ label, share, count }]
    popularPackages,    // [{ nama, count }]
    totalPackageViews,
    eventCounts,        // { package_inquiry_click: n, portfolio_click: n, booking_click: n, consultation_package_click: n }
  };
}

async function generateInsightsWithGemini(): Promise<AIInsight[] | null> {
  const summary = await buildInsightSummary();

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction:
      "Kamu adalah asisten bisnis fotografi profesional. Tugasmu menganalisis data engagement website dan menghasilkan insight bisnis yang ringkas dan actionable, berorientasi pada profit.",
  });

  const prompt = `
    Berikut ringkasan data engagement website jasa fotografi (dalam JSON):
    ${JSON.stringify(summary, null, 2)}

    Buat maksimal 4 insight bisnis dari data ini. Setiap insight harus actionable (ada saran konkret),
    bukan cuma menyebutkan ulang angka. Balas HANYA dalam format JSON array, tanpa markdown, tanpa penjelasan
    tambahan, dengan struktur persis seperti ini:

    [
    { "icon": "📈", "title": "judul singkat", "desc": "penjelasan 1-2 kalimat dalam Bahasa Indonesia", "color": "sky" }
    ]

    "color" harus salah satu dari: "sky", "violet", "emerald", "amber". Kalau data terlalu sedikit untuk
    menghasilkan insight yang bermakna, balas dengan array kosong [].
    `.trim();

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return safeParseInsights(text);
    }

export async function getSmartInsights(): Promise<SmartInsightsResult> {
  // 1. Coba pakai cache hari ini dulu, kalau ada -> tidak perlu panggil Gemini sama sekali
  const cached = await getCachedInsights();
  if (cached) {
    return cached;
  }

  // 2. Belum ada cache hari ini (pertama kali diakses hari ini) -> generate baru
  let result: SmartInsightsResult;

  try {
    const geminiInsights = await generateInsightsWithGemini();
    if (geminiInsights && geminiInsights.length > 0) {
      result = { insights: geminiInsights, source: "gemini" };
    } else {
      // Gemini jawab tapi kosong/tidak valid -> pakai fallback manual
      const [engagement, topics] = await Promise.all([getEngagementInsights(), getAIInsightsFallback()]);
      result = { insights: [...engagement, ...topics], source: "fallback" };
    }
  } catch (err) {
    if (isRateLimitError(err)) {
      console.warn("Gemini limit tercapai, pakai fallback manual.");
    } else {
      console.error("Gemini error, pakai fallback manual:", err);
    }
    const [engagement, topics] = await Promise.all([getEngagementInsights(), getAIInsightsFallback()]);
    result = { insights: [...engagement, ...topics], source: "fallback" };
  }

  // 3. Simpan hasilnya sebagai cache hari ini, supaya request berikutnya hari ini tidak generate lagi
  await saveInsightsToCache(result);

  return result;
}