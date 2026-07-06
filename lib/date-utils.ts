const MONTH_MAP: Record<string, number> = {
  januari: 0, februari: 1, maret: 2, april: 3, mei: 4, juni: 5,
  juli: 6, agustus: 7, september: 8, oktober: 9, november: 10, desember: 11,
};

const DATE_REGEX =
  /(\d{1,2})\s+(januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember)\s*(\d{4})?/i;

/**
 * Cari tanggal dalam format Bahasa Indonesia di dalam teks bebas,
 * mis. "20 Juli 2026 saya mau booking" -> "2026-07-20"
 * Kalau tahun tidak disebutkan, pakai tahun ini (atau tahun depan kalau tanggalnya sudah lewat).
 */
export function extractIsoDateFromText(text: string): string | null {
  const match = text.match(DATE_REGEX);
  if (!match) return null;

  const day = Number(match[1]);
  const monthName = match[2].toLowerCase();
  const month = MONTH_MAP[monthName];
  if (month === undefined) return null;

  const now = new Date();
  let year = match[3] ? Number(match[3]) : now.getFullYear();

  let dateObj = new Date(year, month, day);

  // if tahun tidak disebutkan dan tanggalnya sudah lewat, asumsikan tahun depan
  if (!match[3] && dateObj < now) {
    year += 1;
    dateObj = new Date(year, month, day);
  }

  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${dateObj.getFullYear()}-${pad(dateObj.getMonth() + 1)}-${pad(dateObj.getDate())}`;
}

export function formatIsoDateToIndonesian(isoDate: string): string {
  const dateObj = new Date(isoDate);
  return dateObj.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}