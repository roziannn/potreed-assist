import { executeToolCall } from "@/lib/assistant-tools";
import { extractIsoDateFromText, formatIsoDateToIndonesian } from "@/lib/date-utils";

const PACKAGE_KEYWORDS = ["paket", "harga", "biaya", "price"];
const CATEGORY_KEYWORDS = ["wisuda", "wedding", "prewedding", "maternity", "family", "personal"];

function detectCategory(text: string): string | null {
  const lower = text.toLowerCase();
  for (const key of CATEGORY_KEYWORDS) {
    if (lower.includes(key)) return key;
  }
  return null;
}

/**
 * Cek apakah error dari Gemini adalah rate limit / quota exceeded (429).
 */
export function isRateLimitError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes("429") || message.toLowerCase().includes("quota") || message.toLowerCase().includes("rate limit");
}

/**
 * Jawaban "darurat" saat Gemini tidak bisa dipanggil (rate limit/error lain).
 * Tetap mencoba ambil data REAL dari Supabase (lewat tools yang sama, tanpa lewat AI),
 * supaya user tidak dapat jawaban ngasal walau AI-nya down.
 */
export async function getDegradedModeAnswer(originalMessage: string): Promise<string> {
  const text = originalMessage.toLowerCase();
  const isoDate = extractIsoDateFromText(originalMessage);
  const category = detectCategory(text);

  // 1) Kalau ada tanggal disebutkan -> cek langsung ke DB booking
  if (isoDate) {
    try {
      const availability: any = await executeToolCall("check_date_availability", { date: isoDate });
      const tanggalIndo = formatIsoDateToIndonesian(isoDate);

      if (availability?.available) {
        const categoryText = category ? ` untuk ${category}` : "";
        return `Tanggal ${tanggalIndo} masih tersedia${categoryText}! Untuk lanjut proses booking dan info paket lebih detail, silakan hubungi admin kami langsung ya 😊`;
      }
      if (availability?.reason) {
        return `Untuk tanggal ${tanggalIndo}: ${availability.reason}. Coba tanggal lain, atau hubungi admin untuk opsi waiting list.`;
      }
    } catch (e) {
      console.error("degraded mode date check failed:", e);
    }
  }

  // 2) if nanya paket/harga -> ambil daftar paket langsung dari DB
  if (PACKAGE_KEYWORDS.some((k) => text.includes(k)) || category) {
    try {
      const result: any = await executeToolCall("get_packages", {
        category: category ?? undefined,
        limit: 3,
      });
      if (result?.packages?.length) {
        const lines = result.packages.map((p: any) => `• ${p.nama_package} (${p.kategori}) - ${p.harga}`);
        return `Beberapa paket yang tersedia:\n\n${lines.join("\n")}\n\nUntuk detail lebih lanjut, silakan hubungi admin kami ya 😊`;
      }
    } catch (e) {
      console.error("degraded mode package fetch failed:", e);
    }
  }

  return "Maaf, asisten AI kami sedang sibuk (limit tercapai). Untuk sementara, silakan hubungi admin kami langsung di halaman utama/WhatsApp supaya bisa dibantu lebih cepat 🙏";
}