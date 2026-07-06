import { supabase } from "@/lib/supabase";

function formatHarga(harga: number | string) {
  return typeof harga === "number"
    ? new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(harga)
    : harga;
}

async function getPackages(args: { category?: string; sort?: "harga_asc" | "harga_desc"; limit?: number }) {
  let query = supabase.from("packages").select("nama_package, kategori, harga, highlight_package, deskripsi_singkat").eq("is_active", true);
  if (args.category) query = query.ilike("kategori", `%${args.category}%`);
  query = query.order("harga", { ascending: args.sort !== "harga_desc" }).limit(args.limit ?? 5);

  const { data, error } = await query;
  if (error) return { error: error.message };
  return {
    packages: (data ?? []).map((p) => ({
      nama_package: p.nama_package,
      kategori: p.kategori,
      harga: formatHarga(p.harga),
      highlight: p.highlight_package,
      deskripsi: p.deskripsi_singkat,
    })),
  };
}

async function checkDateAvailability(args: { date: string }) {
  const isoDate = args.date;
  const [{ data: settingsData }, { data: bookingsData, error: bookingsError }] = await Promise.all([
    supabase.from("booking_settings").select("is_only_weekend,is_only_weekday,session_limit").limit(1).single(),
    supabase.from("bookings").select("id").gte("tanggal_event", `${isoDate}T00:00:00`).lt("tanggal_event", `${isoDate}T23:59:59`),
  ]);

  const dateObj = new Date(isoDate);
  const isWeekend = [0, 6].includes(dateObj.getDay());
  const sessionLimit = settingsData?.session_limit ?? 2;
  const bookedCount = bookingsError ? 0 : bookingsData?.length ?? 0;

  if (settingsData?.is_only_weekend && !isWeekend) return { available: false, reason: "Periode ini hanya melayani akhir pekan" };
  if (settingsData?.is_only_weekday && isWeekend) return { available: false, reason: "Periode ini hanya melayani hari kerja" };
  if (bookedCount >= sessionLimit) return { available: false, reason: "Slot pada tanggal ini sudah penuh" };
  return { available: true, booked_count: bookedCount, session_limit: sessionLimit };
}

async function getPortfolio(args: { category?: string }) {
  let query = supabase.from("portfolios").select("judul, kategori, deskripsi").order("created_at", { ascending: false }).limit(3);
  if (args.category) query = query.ilike("kategori", `%${args.category}%`);
  const { data, error } = await query;
  if (error) return { error: error.message };
  return { portfolios: data ?? [] };
}

export async function executeToolCall(name: string, args: any) {
  switch (name) {
    case "get_packages": return getPackages(args ?? {});
    case "check_date_availability": return checkDateAvailability(args ?? {});
    case "get_portfolio": return getPortfolio(args ?? {});
    default: return { error: `Unknown tool: ${name}` };
  }
}