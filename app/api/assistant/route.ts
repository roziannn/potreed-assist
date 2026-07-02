import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const normalize = (text: string) => text.trim().toLowerCase();

const buildPackageAnswer = (packages: { nama_package: string; harga: number | string; kategori?: string; highlight_package?: string }[]) => {
  if (!packages.length) {
    return "Maaf, saya belum menemukan paket yang sesuai saat ini. Silakan tanyakan lagi dengan detail kebutuhan Anda.";
  }

  const lines = packages.slice(0, 3).map((pkg) => {
    const harga = typeof pkg.harga === "number" ? new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(pkg.harga) : pkg.harga;
    return `• ${pkg.nama_package} (${pkg.kategori ?? "Package"}) - ${harga}`;
  });

  return `Beberapa paket yang tersedia:
${lines.join("\n")}

Silakan pilih paket yang paling cocok atau tanyakan detail lain seperti "apa saja fitur paket wedding".`;
};

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const message = normalize(body?.message ?? "");
  if (!message) {
    return NextResponse.json({ answer: "Silakan tulis pertanyaan Anda agar saya bisa bantu." }, { status: 400 });
  }

  const q = message;

  const containsAny = (words: string[]) => words.some((word) => q.includes(word));
  const packageTriggers = ["harga", "paket", "biaya", "detail paket", "daftar paket"];
  const customEventTriggers = ["makanan", "food", "kuliner", "brand shoot", "brand", "editorial", "konsep khusus", "moodboard", "custom event"];
  const portfolioTriggers = ["wisuda", "wedding", "prewedding", "proposal", "portfolio", "portofolio"];
  const scheduleTriggers = ["jadwal", "booking", "tanggal", "available", "tersedia"];
  const greetingTriggers = ["halo", "hi", "hai", "hello", "selamat"];
  const clarificationTriggers = ["apa", "bagaimana", "dimana", "siapa", "kapan", "mengapa", "kenapa", "kinilah", "bisa", "tolong"];
  const genericAskPatterns = [/^tanya( dong)?/, /^mau bertanya/, /^saya ingin bertanya/, /^boleh tanya/, /^mau nanya/, /^ingin tanya/, /^silakan bertanya?/, /^saya ada pertanyaan/];
  const isGenericAsk = genericAskPatterns.some((pattern) => pattern.test(q));

  // Try FAQ/assistant responses table first.
  const { data: faqData, error: faqError } = await supabase
    .from("assistant_faqs")
    .select("id, question, answer, keywords")
    .ilike("question", `%${q}%`)
    .limit(1);

  if (!faqError && faqData?.length) {
    return NextResponse.json({ answer: faqData[0].answer ?? "Maaf, jawaban belum tersedia." });
  }

  if (greetingTriggers.some((prefix) => q.startsWith(prefix)) && !containsAny(packageTriggers) && !containsAny(portfolioTriggers) && !containsAny(scheduleTriggers)) {
    return NextResponse.json({ answer: "Halo! Silakan langsung tanya tentang paket, jadwal, atau jenis sesi foto yang Anda butuhkan." });
  }

  if (isGenericAsk && !containsAny(packageTriggers) && !containsAny(portfolioTriggers) && !containsAny(scheduleTriggers)) {
    return NextResponse.json({
      answer:
        "Hai! Silakan ceritakan kebutuhanmu dengan lebih detail, misalnya 'saya butuh paket wedding' atau 'berapa harga paket wisuda'.",
    });
  }

  if (clarificationTriggers.some((word) => q.includes(word)) && !containsAny(packageTriggers) && !containsAny(portfolioTriggers) && !containsAny(scheduleTriggers)) {
    return NextResponse.json({ answer: "Saya siap membantu. Silakan beritahu saya apa yang ingin Anda ketahui, misalnya 'berapa harga paket wedding' atau 'apa saja fitur paket wisuda'." });
  }

  if (containsAny(customEventTriggers)) {
    const { data: packages, error } = await supabase
      .from("packages")
      .select("nama_package, kategori, harga, highlight_package")
      .eq("is_active", true)
      .ilike("nama_package", "%custom%")
      .limit(1);

    if (!error && packages?.length) {
      const pkg = packages[0];
      const harga = typeof pkg.harga === "number" ? new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(pkg.harga) : pkg.harga;
      return NextResponse.json({
        answer: `Kami juga memiliki paket Custom Event untuk kebutuhan brand shoot, foto makanan, atau konsep khusus. Contoh:
• ${pkg.nama_package} (${pkg.kategori ?? "Custom"}) - ${harga}

${pkg.highlight_package ?? "Hubungi kami untuk detail creative briefing, moodboard, dan opsi studio/outdoor."}`,
      });
    }
  }

  if (containsAny(packageTriggers)) {
    const { data: packages, error } = await supabase
      .from("packages")
      .select("nama_package, kategori, harga, highlight_package")
      .eq("is_active", true)
      .order("harga", { ascending: true })
      .limit(3);

    if (!error && packages) {
      return NextResponse.json({ answer: buildPackageAnswer(packages) });
    }
  }

  // Schedule/date handling should come before portfolio responses so date queries get availability checks.
  if (containsAny(scheduleTriggers)) {
    // Try to detect explicit date in the query, e.g. "7 juli 2026" or "7 juli"
    const monthMap: Record<string, number> = {
      januari: 0,
      februari: 1,
      maret: 2,
      april: 3,
      mei: 4,
      juni: 5,
      juli: 6,
      agustus: 7,
      september: 8,
      oktober: 9,
      november: 10,
      desember: 11,
    };

    const dateRegex = /(\d{1,2})\s+(januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember)\s*(\d{4})?/i;
    const match = q.match(dateRegex);

    if (match) {
      const day = Number(match[1]);
      const monthName = match[2].toLowerCase();
      const year = match[3] ? Number(match[3]) : new Date().getFullYear();
      const month = monthMap[monthName];
      const dateObj = new Date(year, month, day);

      // Normalize to ISO date for DB comparison (YYYY-MM-DD)
      const pad = (n: number) => n.toString().padStart(2, "0");
      const isoDate = `${dateObj.getFullYear()}-${pad(dateObj.getMonth() + 1)}-${pad(dateObj.getDate())}`;

      // Fetch booking settings and bookings for that date
      const [{ data: settingsData }, { data: bookingsData, error: bookingsError }] = await Promise.all([
        supabase.from("booking_settings").select("is_only_weekend,is_only_weekday,session_limit").limit(1).single(),
        supabase
          .from("bookings")
          .select("id,tanggal_event")
          .gte("tanggal_event", `${isoDate}T00:00:00`)
          .lt("tanggal_event", `${isoDate}T23:59:59`),
      ]);

      const sessionLimit = settingsData?.session_limit ?? 2;
      const isWeekend = [0, 6].includes(dateObj.getDay());
      const monthYear = dateObj.toLocaleDateString("id-ID", { month: "long", year: "numeric" });

      if (settingsData?.is_only_weekend && !isWeekend) {
        return NextResponse.json({ answer: `Maaf, kami hanya melayani booking pada akhir pekan di bulan ${monthYear}.` });
      }

      if (settingsData?.is_only_weekday && isWeekend) {
        return NextResponse.json({ answer: `Maaf, kami hanya melayani booking pada hari kerja di bulan ${monthYear}.` });
      }

      const bookedCount = bookingsError ? 0 : bookingsData?.length ?? 0;
      if (bookedCount >= sessionLimit) {
        return NextResponse.json({ answer: `Maaf, tanggal ${dateObj.toLocaleDateString("id-ID")} sudah penuh. Silakan pilih tanggal lain atau hubungi kami untuk bantuan.` });
      }

      return NextResponse.json({ answer: `Tanggal ${dateObj.toLocaleDateString("id-ID")} tersedia untuk booking. Jika ingin lanjut, beri tahu paket yang Anda pilih atau ketik 'booking' untuk instruksi selanjutnya.` });
    }

    return NextResponse.json({
      answer:
        "Untuk cek jadwal, kamu bisa buka halaman jadwal dan pilih tanggal yang tersedia. Jika ingin booking, pilih tanggal lalu pilih jenis acara.",
    });
  }

  if (containsAny(portfolioTriggers)) {
    const category = q.includes("wisuda") ? "wisuda" : q.includes("wedding") ? "wedding" : "personal";
    const { data: portfolios, error } = await supabase
      .from("portfolios")
      .select("judul, kategori, deskripsi")
      .ilike("kategori", `%${category}%`)
      .order("created_at", { ascending: false })
      .limit(2);

    if (!error && portfolios?.length) {
      const lines = portfolios.map((item) => `• ${item.judul}: ${item.deskripsi}`);
      return NextResponse.json({ answer: `Berikut beberapa contoh portfolio ${category}:
${lines.join("\n")}` });
    }
  }

  return NextResponse.json({
    answer:
      "Maaf, saya belum bisa menjawab itu dengan tepat. Silakan tanyakan kembali dengan kata kunci seperti 'paket', 'harga', 'wisuda', 'wedding', atau 'jadwal'.",
  });
}
