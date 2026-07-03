import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabase-admin";

const normalize = (text: string) => text.trim().toLowerCase();

const buildPackageAnswer = (packages: { nama_package: string; harga: number | string; kategori?: string; highlight_package?: string }[]) => {
  if (!packages.length) {
    return "Ups, saya belum menemukan paket yang cocok saat ini. Mau coba kata kunci lain?";
  }

  const lines = packages.slice(0, 3).map((pkg) => {
    const harga = typeof pkg.harga === "number" ? new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(pkg.harga) : pkg.harga;
    return `• ${pkg.nama_package} (${pkg.kategori ?? "Package"}) - ${harga}`;
  });

  // Ensure each bullet is on its own line and the closing instruction is separated by a blank line.
  return `Beberapa paket yang tersedia:\n\n${lines.join("\n")}\n\nSilakan pilih paket yang paling cocok atau tanyakan detail lain seperti "apa saja fitur paket wedding".`;
};

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const originalMessage = body?.message ?? "";
  const message = normalize(originalMessage ?? "");
  if (!message) {
    return NextResponse.json({ answer: "Tolong tulis pertanyaannya supaya saya bisa bantu 😊" }, { status: 400 });
  }

  const q = message;

  // Simple detectors for analytics metadata
  const detectedCategory = q.includes("wisuda") ? "wisuda" : q.includes("wedding") ? "wedding" : null;
  const smallDateRegex = /(\d{1,2}\s+(januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember)(\s+\d{4})?)/i;
  const dateMatch = q.match(smallDateRegex);
  const detectedDate = dateMatch ? dateMatch[0] : null;

  // Helper to send JSON response and record analytic event (non-blocking on errors).
  const sendJson = async (payload: any, init?: ResponseInit) => {
    try {
      // Avoid saving placeholder values coming from UI instrumentation (e.g. "input" placeholder).
      const rawValue = (originalMessage || q || "").toString();
      const placeholderValues = ["input", "potreed", "", null];
      const safeValue = placeholderValues.includes(rawValue) ? null : rawValue;
      if (safeValue === null) console.info("analytics: detected placeholder value, storing NULL instead", { rawValue });

      const { error } = await supabaseAdmin.from("analytics_events").insert({
        event_type: "assistant_interaction",
        session_id: body?.session_id ?? null,
        visitor_id: body?.visitor_id ?? null,
        page: body?.page ?? "assistant",
        package_id: body?.package_id ?? null,
        value: safeValue,
        metadata: JSON.stringify({ response: payload?.answer ?? null, detectedCategory, detectedDate }),
      });

      if (error) {
        console.error("analytics insert error:", error);
      }
    } catch (e) {
      console.error("analytics insert failed:", e);
    }

    return NextResponse.json(payload, init);
  };

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
    return await sendJson({ answer: faqData[0].answer ?? "Maaf, jawabannya belum tersedia. Mau saya bantu cari alternatif?" });
  }

  if (greetingTriggers.some((prefix) => q.startsWith(prefix)) && !containsAny(packageTriggers) && !containsAny(portfolioTriggers) && !containsAny(scheduleTriggers)) {
    return await sendJson({ answer: "Halo! 👋 Mau tanya tentang paket, jadwal, atau jenis sesi foto? Saya siap bantu." });
  }

  if (isGenericAsk && !containsAny(packageTriggers) && !containsAny(portfolioTriggers) && !containsAny(scheduleTriggers)) {
    return await sendJson({
      answer:
        "Hai! Ceritakan sedikit kebutuhanmu, misalnya 'butuh paket wedding' atau 'berapa harga paket wisuda', supaya saya bisa bantu.",
    });
  }

  if (clarificationTriggers.some((word) => q.includes(word)) && !containsAny(packageTriggers) && !containsAny(portfolioTriggers) && !containsAny(scheduleTriggers)) {
    return await sendJson({ answer: "Boleh, saya bantu. Contoh: 'berapa harga paket wedding' atau 'apa saja fitur paket wisuda'." });
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
      return await sendJson({
        answer: `Kami juga punya paket Custom Event untuk kebutuhan seperti brand shoot, foto makanan, atau konsep khusus. Contoh:
• ${pkg.nama_package} (${pkg.kategori ?? "Custom"}) - ${harga}

${pkg.highlight_package ?? "Kalau mau, kontak kami untuk creative briefing, moodboard, dan opsi studio/outdoor."}`,
      });
    }
  }

  // Schedule/date handling should come before package responses so date queries get availability checks.
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
        return await sendJson({ answer: `Oh, untuk bulan ${monthYear} kami melayani hanya akhir pekan. Kalau bisa, coba pilih tanggal akhir pekan atau hubungi kami ya.` });
      }

      if (settingsData?.is_only_weekday && isWeekend) {
        return await sendJson({ answer: `Oh, untuk bulan ${monthYear} kami hanya melayani hari kerja. Coba pilih hari kerja lain atau hubungi kami untuk bantuan.` });
      }

      const bookedCount = bookingsError ? 0 : bookingsData?.length ?? 0;
      if (bookedCount >= sessionLimit) {
        return await sendJson({ answer: `Waduh, tanggal ${dateObj.toLocaleDateString("id-ID")} sudah penuh. Mau coba tanggal lain atau minta bantuan kami?` });
      }

      // If the user already mentioned a specific category (e.g., "wisuda" or "wedding") in the same query,
      // return the available packages for that category immediately. Otherwise, ask a follow-up question.
      const specificCategory = q.includes("wisuda") ? "wisuda" : q.includes("wedding") ? "wedding" : null;
      if (specificCategory) {
        const { data: packages, error } = await supabase
          .from("packages")
          .select("nama_package, kategori, harga, highlight_package")
          .eq("is_active", true)
          .ilike("kategori", `%${specificCategory}%`)
          .order("harga", { ascending: true })
          .limit(3);

        if (!error && packages && packages.length) {
          const header = `Mantap! tanggal ${dateObj.toLocaleDateString("id-ID")} tersedia untuk booking!`;
          return await sendJson({ answer: `${header}\n\n${buildPackageAnswer(packages)}` });
        }
      }

      return await sendJson({ answer: `Mantap! tanggal ${dateObj.toLocaleDateString("id-ID")} tersedia untuk booking! Untuk acara apa ya? (mis. "wisuda", "wedding", atau lainnya). Jawab singkat supaya saya bisa rekomendasikan paket yang cocok.` });
    }

    return await sendJson({
      answer:
        "Untuk cek jadwal, buka halaman jadwal dan pilih tanggal yang tersedia. Mau saya bantu pilih tanggal juga?",
    });
  }

  // Show packages when user asks about packages or explicitly mentions a package category like "wisuda" or "wedding".
  if (containsAny(packageTriggers) || q.includes("wisuda") || q.includes("wedding")) {
    const specificCategory = q.includes("wisuda") ? "wisuda" : q.includes("wedding") ? "wedding" : null;

    if (specificCategory) {
      const { data: packages, error } = await supabase
        .from("packages")
        .select("nama_package, kategori, harga, highlight_package")
        .eq("is_active", true)
        .ilike("kategori", `%${specificCategory}%`)
        .order("harga", { ascending: true })
        .limit(3);

      if (!error && packages) {
        return await sendJson({ answer: buildPackageAnswer(packages) });
      }
    } else {
      const { data: packages, error } = await supabase
        .from("packages")
        .select("nama_package, kategori, harga, highlight_package")
        .eq("is_active", true)
        .order("harga", { ascending: true })
        .limit(3);

      if (!error && packages) {
        return await sendJson({ answer: buildPackageAnswer(packages) });
      }
    }
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
      return await sendJson({ answer: `Berikut beberapa contoh portfolio ${category}:
${lines.join("\n")}` });
    }
  }

  return await sendJson({
    answer:
      "Maaf, saya belum bisa menjawab itu. Coba gunakan kata kunci seperti 'paket', 'harga', 'wisuda', 'wedding', atau 'jadwal', ya.",
  });
}
