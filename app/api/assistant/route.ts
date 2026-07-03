import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabase-admin";

const normalize = (text: string) => text.trim().toLowerCase();

const BIZ = {
  namaBisnis: "Potreed", 
  jamOperasional: "09.00–18.00 WIB, Senin–Sabtu", 
  areaLayanan:
    "Jakarta, Bandung, Bekasi, dan Karawang. Di luar area ini bisa didiskusikan dengan tambahan biaya transportasi & akomodasi", // TODO
  leadTimeBooking: "minimal H-14 (2 minggu) sebelum tanggal acara, walau last-minute booking tetap kami usahakan sesuai ketersediaan tim", // TODO
  turnaroundFoto: "7–14 hari kerja", 
  turnaroundVideo: "14–21 hari kerja", 
  jumlahRevisi: "1 kali revisi minor (warna/cropping), revisi besar di luar itu bisa dikenakan biaya tambahan", // TODO
  formatFile: "foto JPG resolusi tinggi, dan video MP4 Full HD/4K tergantung paket", // TODO
  rawFileKebijakan:
    "file RAW/mentah tidak termasuk secara default, tapi bisa ditambahkan sebagai add-on di beberapa paket", // TODO
  metodePengiriman: "link cloud (Google Drive) yang bisa diunduh kapan saja", // TODO
  masaBackup: "3 bulan setelah file diserahkan", 
  jumlahKru: "2–3 orang (fotografer/videografer utama + asisten), tergantung paket dan skala acara", // TODO
  durasiSesi:
    "sekitar 2–4 jam untuk sesi reguler (mis. wisuda 1–2 jam, prewedding 3–4 jam), sedangkan untuk wedding fullday menyesuaikan rundown acara", // TODO
  bawaKeluargaTeman:
    "boleh banget, kamu bisa mengajak keluarga atau teman saat sesi foto/video, bahkan untuk beberapa paket seperti wisuda atau family portrait itu memang disarankan supaya hasilnya lebih hangat", // TODO
  seragamKru: "kru memakai pakaian rapi bertema netral/hitam, bukan seragam berlogo besar, supaya tidak mengganggu foto/video", // TODO
  kebijakanKontrak: "ada, setiap booking akan disertai kontrak/perjanjian kerja tertulis sebelum acara berlangsung", // TODO
  kebijakanFotograferBerhalangan:
    "kami memiliki tim cadangan yang bisa menggantikan dengan kualitas setara jika fotografer utama berhalangan mendadak", // TODO
  kebijakanReschedule:
    "boleh reschedule maksimal 1x dengan pemberitahuan minimal 7 hari sebelum tanggal acara, tanpa biaya tambahan", // TODO
  kebijakanRefund:
    "DP pada dasarnya tidak dapat dikembalikan jika pembatalan murni dari pihak klien, tapi bisa dialihkan ke tanggal lain (reschedule)", // TODO
  kebijakanHakCipta:
    "hasil foto/video boleh kamu gunakan dan publikasikan bebas untuk keperluan pribadi; kami juga berhak menampilkan sebagian hasil di portofolio kami kecuali kamu minta privat", // TODO
  kebijakanHujan:
    "kami tetap jalan dengan skenario indoor/alternatif, dan tim membawa perlengkapan pelindung alat untuk kondisi outdoor yang tidak menentu", // TODO
  kontakAdmin: "admin kami (kontak ada di halaman utama/WhatsApp)", 
} as const;


function pick<T>(variants: T[]): T {
  return variants[Math.floor(Math.random() * variants.length)];
}

function withClosing(text: string, closings: string[] = []) {
  const defaultClosings = [
    "Ada lagi yang mau ditanyakan?",
    "Kalau ada pertanyaan lain, tanya saja ya.",
    "Mau saya bantu lanjut ke pilihan paket juga?",
  ];
  return `${text}\n\n${pick(closings.length ? closings : defaultClosings)}`;
}

const ANALYTICS_SIMILARITY_THRESHOLD = 0.55;
const ANALYTICS_STOPWORDS = new Set([
  "apa", "apakah", "yang", "di", "ke", "dari", "dan", "atau", "untuk", "dengan", "ya",
  "nih", "dong", "saya", "aku", "mau", "ingin", "kak", "min", "nya", "kah",
  "buat", "gimana", "gmn", "bisa", "boleh", "tolong", "sama",
  "gak", "ga", "gk", "nggak", "enggak", "kalo", "kalau", "sih", "deh", "kok", "itu", "ini",
]);

const DP_QUESTION_VARIANTS = [
  "berapa dp", "berapa down payment", "berapa uang muka", "berapa booking fee",
  "berapa fee booking", "berapa deposit booking", "dp berapa",
  "down payment berapa", "uang muka berapa", "booking fee berapa",
  "deposit berapa", "minimal dp berapa", "minimal down payment berapa",
  "minimal uang muka berapa", "dp minimal berapa", "berapa persen dp",
  "berapa persen down payment", "berapa persen uang muka", "dp nya berapa",
  "dpnya berapa", "berapa ya dp nya", "berapa ya down payment nya",
  "berapa uang muka untuk booking", "berapa dp untuk booking",
  "berapa down payment untuk booking", "kalau booking bayar berapa dulu",
  "kalau mau booking bayar berapa dulu", "untuk booking harus bayar berapa dulu",
  "untuk booking bayar berapa dulu", "harus dp dulu berapa",
  "harus bayar dp berapa", "harus bayar uang muka berapa",
  "apakah harus dp dulu", "apakah perlu dp dulu", "booking harus dp dulu kah",
  "booking pakai dp kah", "bisa booking pakai dp",
  "dp untuk lock tanggal berapa", "berapa dp untuk lock tanggal",
  "berapa deposit untuk lock tanggal", "berapa uang muka untuk mengunci jadwal",
  "berapa dp untuk amankan tanggal", "berapa biaya awal untuk booking",
  "berapa pembayaran awal untuk booking", "berapa tanda jadi untuk booking",
  "booking tanda jadi berapa", "berapa fee tanda jadi",
  "kalau pesan paket bayar dp berapa", "kalau reserve tanggal bayar berapa dulu",
  "reservasi harus bayar berapa dulu", "berapa termin pertama untuk booking",
  "berapa pembayaran pertama untuk booking", "uang jadi untuk booking berapa",
  "berapa panjar untuk booking", "nominal dp yang diperlukan untuk lock tanggal",
  "kapan sisa pembayaran dilunasi", "kapan pelunasan harus dilakukan",
];

const DP_ANSWER_VARIANTS = [
  "Untuk booking, kami biasanya pakai DP 50% dulu ya untuk mengamankan tanggal. Setelah DP masuk, jadwal kamu langsung kami hold. Sisa pembayarannya dilunasi mendekati hari-H sesuai kesepakatan dengan admin.",
  "DP untuk lock tanggal biasanya 50% dari total paket. Begitu DP masuk, tanggal langsung aman di sistem kami, dan pelunasan dilakukan menjelang hari acara.",
  "Kami pakai skema DP 50% untuk mengunci jadwal. Setelah itu, sisa pembayaran mengikuti kesepakatan admin dan paket yang kamu pilih.",
];

function extractDpOfferPercent(text: string) {
  const percentMatch = text.match(/(\d{1,3})\s*(%|persen)/i);
  if (percentMatch) return Number(percentMatch[1]);
  if (/\b(setengah|separuh|half)\b/i.test(text)) return 50;
  return null;
}

function buildDpAnswer(text: string) {
  const offeredPercent = extractDpOfferPercent(text);

  const isAskingRefund =
    text.includes("kembali") ||
    text.includes("dikembalikan") ||
    text.includes("refund") ||
    text.includes("hangus") ||
    text.includes("batal") ||
    text.includes("dibatalkan");

  const isAskingPaymentMethod =
    text.includes("cara bayar") ||
    text.includes("bayarnya gimana") ||
    text.includes("bayarnya gmn") ||
    text.includes("bayar dp nya gimana") ||
    text.includes("bayar dp nya gmn") ||
    text.includes("transfer kemana") ||
    text.includes("kirim kemana") ||
    text.includes("pembayarannya gimana") ||
    text.includes("pembayarannya gmn") ||
    text.includes("metode bayar") ||
    text.includes("metode pembayaran") ||
    text.includes("cicilan") ||
    text.includes("kartu kredit");

  const isAskingPelunasan =
    text.includes("pelunasan") || text.includes("sisa pembayaran") || text.includes("dilunasi");

  const isAskingPossibility =
    text.includes("bisa") || text.includes("boleh") || text.includes("gak") || text.includes("nggak");

  if (isAskingRefund) {
    return withClosing(
      `Untuk pengembalian DP: ${BIZ.kebijakanRefund}. Kalau acaranya diundur (bukan dibatalkan), ini kebijakan reschedule-nya: ${BIZ.kebijakanReschedule}.`
    );
  }

  if (isAskingPelunasan) {
    return withClosing(
      `Sisa pembayaran (pelunasan) biasanya dilakukan menjelang hari-H, umumnya H-3 sampai hari acara — nanti admin konfirmasi tanggal pastinya saat booking. Kalau kamu sudah punya tanggal, bisa langsung kasih tahu ya biar saya bantu proses.`
    );
  }

  if (isAskingPaymentMethod) {
    return withClosing(
      "Untuk pembayaran DP, nanti admin kirim detail rekening/metode pembayarannya dulu, lalu kamu transfer sesuai nominal yang disepakati (bisa transfer bank; untuk cicilan/kartu kredit bisa didiskusikan langsung dengan admin). Setelah bukti transfer dikirim dan pembayaran masuk, tanggalnya langsung kami hold."
    );
  }

  if (offeredPercent !== null) {
    if (offeredPercent >= 50) {
      return withClosing(
        `Bisa, DP ${offeredPercent}% sudah cukup untuk lock tanggal dan mengamankan booking. Sisanya nanti dilunasi mengikuti kesepakatan admin dan paket yang dipilih.`
      );
    }
    return withClosing(
      `Untuk booking, minimal DP-nya 50% ya supaya tanggal bisa benar-benar diamankan. Kalau baru ${offeredPercent}%, biasanya belum cukup untuk kami hold penuh — kamu bisa lanjut di angka 50% dulu.`
    );
  }

  if (isAskingPossibility) {
    return withClosing(
      "Bisa kok, booking memang pakai sistem DP dulu, biasanya 50% dari total paket untuk mengamankan tanggal. Sisanya dilunasi mengikuti kesepakatan admin dan paket yang dipilih."
    );
  }

  return withClosing(pick(DP_ANSWER_VARIANTS));
}

function hasDpKeyword(text: string) {
  return (
    text.includes("dp") ||
    text.includes("down payment") ||
    text.includes("uang muka") ||
    text.includes("booking fee") ||
    text.includes("fee booking") ||
    text.includes("deposit") ||
    text.includes("panjar") ||
    text.includes("tanda jadi")
  );
}

type AnalyticsAssistantEvent = { value: string | null; metadata: unknown; created_at: string };

function tokenizeAnalyticsQuestion(text: string) {
  return normalize(text)
    .replace(/[\u2000-\u206F\u2E00-\u2E7F\p{P}$+<=>^`|~]/gu, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter((token) => token && !ANALYTICS_STOPWORDS.has(token))
    .map((token) => token.replace(/(nya|kah|lah)$/g, (m) => (token.length - m.length >= 3 ? "" : m)));
}

function parseAnalyticsMetadata(metadata: unknown) {
  if (!metadata) return null;
  if (typeof metadata === "string") {
    try {
      return JSON.parse(metadata) as Record<string, unknown>;
    } catch {
      return null;
    }
  }
  if (typeof metadata === "object") return metadata as Record<string, unknown>;
  return null;
}

function scoreQuestionSimilarity(source: string, target: string) {
  const sourceTokens = tokenizeAnalyticsQuestion(source);
  const targetTokens = tokenizeAnalyticsQuestion(target);
  if (!sourceTokens.length || !targetTokens.length) return 0;

  const sourceSet = new Set(sourceTokens);
  const targetSet = new Set(targetTokens);
  const intersection = [...sourceSet].filter((token) => targetSet.has(token)).length;
  const union = new Set([...sourceSet, ...targetSet]).size || 1;
  const jaccard = intersection / union;

  const sourceText = sourceTokens.join(" ");
  const targetText = targetTokens.join(" ");
  const substringBonus = sourceText.includes(targetText) || targetText.includes(sourceText) ? 0.2 : 0;

  return Math.min(1, jaccard + substringBonus);
}

async function findSimilarAnalyticsAnswer(question: string) {
  const { data, error } = await supabaseAdmin
    .from("analytics_events")
    .select("value,metadata,created_at")
    .eq("event_type", "assistant_interaction")
    .not("value", "is", null)
    .limit(400);

  if (error || !data?.length) {
    if (error) console.error("analytics similarity lookup error:", error);
    return null;
  }

  let bestMatch: { answer: string; score: number } | null = null;
  for (const row of data as AnalyticsAssistantEvent[]) {
    const sourceQuestion = (row.value ?? "").trim();
    if (!sourceQuestion) continue;
    const metadata = parseAnalyticsMetadata(row.metadata);
    const answer = typeof metadata?.response === "string" ? metadata.response.trim() : "";
    if (!answer) continue;
    const score = scoreQuestionSimilarity(question, sourceQuestion);
    if (score < ANALYTICS_SIMILARITY_THRESHOLD) continue;
    if (!bestMatch || score > bestMatch.score) bestMatch = { answer, score };
  }
  return bestMatch?.answer ?? null;
}

type PackageRecord = {
  nama_package: string;
  harga: number | string;
  kategori?: string | null;
  highlight_package?: string | null;
  deskripsi_singkat?: string | null;
};

function formatHarga(harga: number | string) {
  return typeof harga === "number"
    ? new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(harga)
    : harga;
}

function extractPackageDeliverables(pkg: PackageRecord) {
  const text = [pkg.highlight_package, pkg.deskripsi_singkat].filter(Boolean).join(", ").toLowerCase();
  const mentionsDigital = /\b(file digital|album digital|digital|softcopy|soft copy)\b/.test(text);
  const mentionsPrint = /\b(print|cetak|hardcopy|hard copy)\b/.test(text);
  const mentionsAlbum = /\balbum\b/.test(text);
  const points: string[] = [];
  if (mentionsDigital) points.push("file digital");
  if (mentionsPrint) points.push("cetak");
  if (mentionsAlbum) points.push("album");
  return points;
}

function buildPackageInclusionAnswer(packages: PackageRecord[]) {
  if (!packages.length) {
    return "Untuk detail isi paket seperti file digital, cetak, atau album, saya belum menemukan data paket yang aktif saat ini.";
  }
  const packageSummaries = packages
    .map((pkg) => {
      const inclusions = extractPackageDeliverables(pkg);
      if (!inclusions.length) return null;
      return `• ${pkg.nama_package}: ${inclusions.join(", ")}`;
    })
    .filter(Boolean) as string[];

  if (packageSummaries.length) {
    return `Tergantung paket yang dipilih ya, tidak semua paket isinya sama.\n\nBeberapa paket yang sudah terlihat dari detail saat ini:\n\n${packageSummaries.join(
      "\n"
    )}\n\nSebutkan nama paketnya kalau mau saya cek lebih detail apakah sudah termasuk cetak, album, atau hanya file digital.`;
  }
  return "Tergantung paket yang dipilih ya. Detail cetak/album/file digital belum tertulis jelas di data paket saat ini — sebutkan nama paketnya atau hubungi admin untuk dicek detail deliverables-nya.";
}

const buildPackageAnswer = (packages: PackageRecord[]) => {
  if (!packages.length) {
    return "Ups, saya belum menemukan paket yang cocok saat ini. Mau coba kata kunci lain?";
  }
  const lines = packages
    .slice(0, 3)
    .map((pkg) => `• ${pkg.nama_package} (${pkg.kategori ?? "Package"}) - ${formatHarga(pkg.harga)}`);
  return `Beberapa paket yang tersedia:\n\n${lines.join("\n")}\n\nSilakan pilih paket yang paling cocok, atau tanyakan detail lain seperti "apa saja fitur paket wedding".`;
};

function detectPriceExtreme(text: string): "min" | "max" | null {
  if (text.includes("termahal") || text.includes("paling mahal") || text.includes("harga tertinggi") || text.includes("yg termahal")) {
    return "max";
  }
  if (text.includes("termurah") || text.includes("paling murah") || text.includes("harga terendah") || text.includes("yg termurah")) {
    return "min";
  }
  return null;
}

const PRICE_RANGE_TRIGGERS = ["kisaran harga", "range harga", "harga mulai dari", "mulai dari harga", "budget minimal", "budget maksimal", "harga dari berapa sampai berapa"];

function buildPackagesQuery(category: string | null) {
  let query = supabase.from("packages").select("nama_package, kategori, harga, highlight_package").eq("is_active", true);
  if (category) query = query.ilike("kategori", `%${category}%`);
  return query;
}

async function getRecentSessionCategory(sessionId: unknown): Promise<string | null> {
  if (!sessionId || typeof sessionId !== "string") return null;
  const { data, error } = await supabaseAdmin
    .from("analytics_events")
    .select("metadata,created_at")
    .eq("session_id", sessionId)
    .eq("event_type", "assistant_interaction")
    .order("created_at", { ascending: false })
    .limit(5);
  if (error || !data?.length) return null;

  for (const row of data as { metadata: unknown }[]) {
    const metadata = parseAnalyticsMetadata(row.metadata);
    const category = typeof metadata?.detectedCategory === "string" ? metadata.detectedCategory : null;
    if (category) return category;
  }
  return null;
}

type FaqTopic = { id: string; examples: string[]; answer: () => string };

const FAQ_TOPICS: FaqTopic[] = [
  {
    id: "lead_time_booking",
    examples: [
      "berapa lama sebelumnya saya harus booking",
      "harus booking berapa lama sebelum acara",
      "apakah menerima last minute booking",
      "h berapa harus booking",
      "minimal booking dari sekarang berapa hari",
    ],
    answer: () =>
      withClosing(`Untuk booking, idealnya ${BIZ.leadTimeBooking}. Ini supaya tim dan tanggal bisa dipastikan tersedia.`),
  },
  {
    id: "service_area",
    examples: [
      "jangkauan lokasi layanan dimana saja",
      "apakah melayani luar kota",
      "apakah bisa ke luar pulau",
      "area layanan sampai mana",
      "lokasi mana saja yang dilayani",
    ],
    answer: () => withClosing(`Untuk area layanan, kami cover ${BIZ.areaLayanan}.`),
  },
  {
    id: "operating_hours",
    examples: ["jam operasional berapa", "kerja jam berapa saja", "kantor buka jam berapa"],
    answer: () => withClosing(`Jam operasional kami ${BIZ.jamOperasional}, di luar itu bisa tetap chat dan akan dibalas secepatnya.`),
  },
  {
    id: "negotiation_hidden_fee",
    examples: [
      "apakah harga bisa dinegosiasi",
      "boleh nego harga",
      "apakah ada biaya tersembunyi",
      "apakah ada biaya tambahan yang tidak disebutkan",
      "harga sudah termasuk pajak belum",
    ],
    answer: () =>
      withClosing(
        "Harga yang tercantum sudah final untuk cakupan yang disebutkan di masing-masing paket, jadi tidak ada biaya tersembunyi. Untuk negosiasi/diskon, itu tergantung kebijakan admin saat itu, terutama untuk paket bundling atau pemesanan lengkap — boleh langsung ditanyakan ke admin."
      ),
  },
  {
    id: "overtime_transport",
    examples: [
      "apakah ada biaya tambahan untuk lembur",
      "biaya overtime berapa",
      "apakah ada biaya transportasi tambahan",
      "biaya akomodasi ditanggung siapa",
    ],
    answer: () =>
      withClosing(
        "Untuk overtime (lembur di luar durasi paket) dan transportasi/akomodasi di luar area layanan reguler, ada biaya tambahan yang disesuaikan per kasus. Admin akan infokan estimasinya sebelum acara supaya tidak ada kejutan biaya."
      ),
  },
  {
    id: "reschedule_refund",
    examples: [
      "apa kebijakan refund jika acara dibatalkan",
      "bagaimana jika acara diundur",
      "apakah bisa reschedule",
      "kalau batal apa dp kembali",
      "kebijakan pengembalian uang",
    ],
    answer: () => withClosing(`Untuk reschedule: ${BIZ.kebijakanReschedule}. Untuk pembatalan: ${BIZ.kebijakanRefund}.`),
  },
  {
    id: "session_duration",
    examples: [
      "durasi foto",
      "durasi sesi berapa lama",
      "durasi pemotretan berapa lama",
      "berapa jam sesi foto",
      "sesi foto berapa lama",
      "durasi video shoot berapa lama",
      "berapa lama sesi pemotretan berlangsung",
      "acara foto berlangsung berapa lama",
      "berapa lama waktu foto di hari acara",
    ],
    answer: () =>
      withClosing(
        `Untuk durasi sesi pemotretan/pengambilan video di hari acara: ${BIZ.durasiSesi}. Kalau maksudnya lama proses edit hasil, itu beda lagi ya — tanya "berapa lama proses edit" biar saya jelaskan.`
      ),
  },
  {
    id: "turnaround",
    examples: [
      "berapa lama proses pengerjaan edit",
      "kapan hasil foto jadi diedit",
      "kapan video hasil edit jadi",
      "turnaround time proses edit berapa lama",
      "berapa hari hasil selesai diedit",
      "berapa lama proses editing hasil foto",
    ],
    answer: () =>
      withClosing(`Estimasi proses edit: foto sekitar ${BIZ.turnaroundFoto}, video sekitar ${BIZ.turnaroundVideo} (menyesuaikan antrean dan kompleksitas edit).`),
  },
  {
    id: "bring_family",
    examples: [
      "apakah boleh bawa keluarga",
      "boleh bawa keluarga tidak",
      "apakah boleh mengajak teman saat sesi foto",
      "boleh ajak keluarga saat pemotretan",
      "apakah keluarga boleh ikut di lokasi",
      "boleh bawa pendamping saat sesi",
      "boleh bawa temen",
      "bisa bareng temen",
      "bisa bareng keluarga",
      "bisa sama keluarga",
      "boleh ajak temen ke lokasi",
      "bisa datang sama temen",
      "boleh datang bareng keluarga",
    ],
    answer: () => withClosing(`Soal membawa keluarga/teman saat sesi: ${BIZ.bawaKeluargaTeman}.`),
  },
  {
    id: "revision",
    examples: [
      "apakah hasil bisa direvisi",
      "berapa kali boleh revisi",
      "boleh revisi hasil edit tidak",
    ],
    answer: () => withClosing(`Untuk revisi: ${BIZ.jumlahRevisi}.`),
  },
  {
    id: "raw_files_format",
    examples: [
      "apakah dapat file raw",
      "apakah dapat semua foto mentah",
      "format file yang diterima apa saja",
      "apakah dapat semua file jpg",
    ],
    answer: () => withClosing(`Untuk format hasil: ${BIZ.formatFile}. Untuk file mentah/RAW: ${BIZ.rawFileKebijakan}.`),
  },
  {
    id: "delivery_backup",
    examples: [
      "bagaimana cara pengiriman hasil",
      "hasil dikirim lewat apa",
      "berapa lama data disimpan setelah selesai",
      "apakah ada backup data",
    ],
    answer: () => withClosing(`Hasil akhir dikirim lewat ${BIZ.metodePengiriman}. Untuk backup, kami simpan sekitar ${BIZ.masaBackup}, jadi ada baiknya diunduh dan disimpan sendiri juga.`),
  },
  {
    id: "crew_count",
    examples: [
      "berapa orang kru yang datang",
      "siapa fotografer utamanya",
      "apakah kru pakai seragam",
      "berapa fotografer yang datang ke lokasi",
    ],
    answer: () => withClosing(`Kru yang datang biasanya ${BIZ.jumlahKru}. Soal penampilan tim: ${BIZ.seragamKru}.`),
  },
  {
    id: "backup_equipment",
    examples: ["apakah kru membawa alat cadangan", "peralatan backup ada tidak", "kalau kamera rusak saat acara bagaimana"],
    answer: () => withClosing("Kami selalu membawa peralatan cadangan (kamera, lensa, lighting, storage) untuk mengantisipasi kendala teknis mendadak saat acara berlangsung."),
  },
  {
    id: "contract_photographer_absent",
    examples: [
      "apakah ada kontrak kerja tertulis",
      "apa yang terjadi jika fotografer sakit",
      "bagaimana jika fotografer berhalangan hadir",
    ],
    answer: () => withClosing(`Untuk kontrak: ${BIZ.kebijakanKontrak}. Untuk antisipasi fotografer berhalangan: ${BIZ.kebijakanFotograferBerhalangan}.`),
  },
  {
    id: "copyright_publish",
    examples: [
      "bagaimana hak cipta foto",
      "apakah boleh publikasikan di media sosial sendiri",
      "apakah hasil boleh diposting di instagram",
      "apakah ada klausul privasi hasil foto",
      "boleh saya post fotonya ke medsos",
      "boleh posting foto ke media sosial",
      "boleh upload foto ke instagram",
      "boleh share fotonya ke sosmed",
      "fotonya boleh diupload tidak",
      "boleh pakai fotonya untuk sosmed sendiri",
    ],
    answer: () => withClosing(`Soal hak penggunaan hasil: ${BIZ.kebijakanHakCipta}. Kalau kamu ingin hasilnya tetap privat, sampaikan saja dari awal ke admin.`),
  },
  {
    id: "rain_weather",
    examples: ["bagaimana jika hari acara hujan", "kalau cuaca buruk gimana", "apakah tetap jalan kalau hujan"],
    answer: () => withClosing(`Untuk kondisi hujan/cuaca buruk: ${BIZ.kebijakanHujan}.`),
  },
  {
    id: "album_print",
    examples: [
      "apakah menyediakan cetak album fisik",
      "berapa lama pembuatan album",
      "bagaimana kualitas cetak album",
      "apakah ada photobook",
    ],
    answer: () =>
      withClosing(
        "Cetak album/photobook fisik tersedia sebagai bagian dari beberapa paket atau bisa ditambahkan sebagai add-on, dengan kualitas cetak premium. Estimasi pembuatan biasanya menyusul setelah hasil final foto disetujui — detail lengkapnya bisa dicek per paket."
      ),
  },
  {
    id: "same_day_edit",
    examples: ["apakah ada paket same day edit", "apakah ada sde", "bisa same day edit tidak"],
    answer: () => withClosing("Same-day edit (SDE) tersedia untuk beberapa paket tertentu, biasanya untuk kebutuhan acara wedding — tanyakan ke admin paket mana saja yang sudah termasuk SDE."),
  },
  {
    id: "music_choice",
    examples: ["bisakah saya memilih lagu sendiri", "apakah boleh request musik untuk video", "backsound bisa custom tidak"],
    answer: () => withClosing("Boleh, kamu bisa memberikan referensi atau request lagu untuk video kamu, selama mengikuti ketentuan lisensi musik yang berlaku."),
  },
  {
    id: "studio_indoor",
    examples: ["apakah ada biaya sewa studio", "apakah bisa foto di studio", "apakah melayani konsep indoor"],
    answer: () =>
      withClosing("Kami melayani sesi indoor di studio maupun outdoor. Untuk sewa studio, biasanya ada biaya tambahan tergantung studio yang dipakai — bisa didiskusikan sesuai konsep yang kamu mau."),
  },
  {
    id: "product_photo_business",
    examples: [
      "apakah melayani foto produk",
      "apakah foto produk dengan background putih polos",
      "apakah produk dikembalikan setelah difoto",
      "bagaimana cara pengiriman produk untuk difoto",
      "berapa kapasitas foto produk per hari",
    ],
    answer: () =>
      withClosing(
        "Untuk kebutuhan bisnis, kami juga melayani foto produk termasuk gaya e-commerce (background putih polos), dan produk yang dikirim akan dikembalikan setelah sesi selesai. Kapasitas per hari menyesuaikan jumlah dan kompleksitas produk — sampaikan detailnya ke admin untuk estimasi waktu dan biaya."
      ),
  },
  {
    id: "social_video_content",
    examples: [
      "apakah melayani video reels atau tiktok",
      "berapa durasi video untuk media sosial",
      "apakah video sudah termasuk subtitle",
      "apakah bisa live streaming",
    ],
    answer: () =>
      withClosing(
        "Kami melayani konten video pendek untuk Reels/TikTok, termasuk opsi subtitle/teks di video. Untuk kebutuhan live streaming juga bisa didiskusikan — tergantung skala dan lokasi acara."
      ),
  },
  {
    id: "testimonial_trust",
    examples: [
      "apakah ada testimoni dari klien sebelumnya",
      "sudah berapa lama bergerak di bidang ini",
      "bisa lihat portofolio lengkap",
      "apa yang membedakan dari fotografer lain",
      "apakah pernah menangani klien besar",
    ],
    answer: () =>
      withClosing(
        "Kamu bisa cek portofolio dan testimoni kami langsung di halaman utama/Instagram untuk melihat hasil kerja dan pengalaman kami menangani berbagai jenis acara. Kalau mau lihat contoh untuk kategori tertentu (misalnya wedding atau wisuda), bilang saja, nanti saya bantu carikan."
      ),
  },
  {
    id: "wo_vendor_coordination",
    examples: [
      "bagaimana koordinasi dengan wedding organizer",
      "apakah bekerja sama dengan mua",
      "apakah bisa koordinasi dengan dekorator",
    ],
    answer: () =>
      withClosing("Tim kami terbiasa koordinasi langsung dengan WO, MUA, maupun dekorator di lokasi acara supaya jadwal dan momen penting tetap terdokumentasi dengan baik."),
  },
  {
    id: "foreign_language",
    examples: ["apakah tim bisa berbahasa inggris", "apakah bisa untuk tamu internasional"],
    answer: () => withClosing("Untuk acara dengan tamu internasional, tim kami bisa berkomunikasi dalam Bahasa Inggris dasar — kalau butuh yang lebih spesifik, sampaikan dari awal ya."),
  },
  {
    id: "multi_location",
    examples: ["apakah bisa foto di lebih dari satu lokasi", "apakah bisa dua tempat berbeda", "multiple location apakah bisa"],
    answer: () => withClosing("Bisa, sesi di lebih dari satu lokasi bisa diatur, biasanya menyesuaikan durasi paket dan jarak antar lokasi — semakin jauh, semakin perlu alokasi waktu ekstra."),
  },
  {
    id: "family_bts_ring",
    examples: [
      "apakah ada sesi family portrait",
      "apakah memotret behind the scene",
      "apakah memotret detail cincin",
      "apakah memotret detail dekorasi",
    ],
    answer: () =>
      withClosing("Untuk acara seperti wedding, sesi family portrait, detail dekorasi, detail cincin/mahar, dan momen behind the scene biasanya sudah termasuk dalam dokumentasi standar kami."),
  },
];

const FAQ_TOPIC_THRESHOLD = 0.3;

function findFaqTopicAnswer(question: string) {
  let best: { topic: FaqTopic; score: number } | null = null;
  for (const topic of FAQ_TOPICS) {
    for (const example of topic.examples) {
      const score = scoreQuestionSimilarity(question, example);
      if (score >= FAQ_TOPIC_THRESHOLD && (!best || score > best.score)) {
        best = { topic, score };
      }
    }
  }
  return best?.topic.answer() ?? null;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const originalMessage = body?.message ?? "";
  const message = normalize(originalMessage ?? "");
  if (!message) {
    return NextResponse.json({ answer: "Tolong tulis pertanyaannya supaya saya bisa bantu 😊" }, { status: 400 });
  }

  const q = message;
  const offeredDpPercent = extractDpOfferPercent(q);
  const isDpQuestion =
    DP_QUESTION_VARIANTS.some((phrase) => q.includes(phrase)) ||
    (hasDpKeyword(q) &&
      (q.includes("bisa") ||
        q.includes("boleh") ||
        q.includes("gak") ||
        q.includes("nggak") ||
        q.includes("dulu") ||
        q.includes("setengah") ||
        q.includes("separuh") ||
        offeredDpPercent !== null ||
        q.includes("%") ||
        q.includes("persen"))) ||
    (hasDpKeyword(q) &&
      (q.includes("booking") ||
        q.includes("bayar") ||
        q.includes("reserve") ||
        q.includes("reservasi") ||
        q.includes("jadwal") ||
        q.includes("tanggal") ||
        q.includes("pelunasan")));

  const detectedCategory = q.includes("wisuda") ? "wisuda" : q.includes("wedding") ? "wedding" : null;
  const smallDateRegex = /(\d{1,2}\s+(januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember)(\s+\d{4})?)/i;
  const dateMatch = q.match(smallDateRegex);
  const detectedDate = dateMatch ? dateMatch[0] : null;

  const sendJson = async (payload: { answer?: string | null }, init?: ResponseInit) => {
    try {
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
      if (error) console.error("analytics insert error:", error);
    } catch (e) {
      console.error("analytics insert failed:", e);
    }
    return NextResponse.json(payload, init);
  };

  const containsAny = (words: string[]) => words.some((word) => q.includes(word));
  const packageTriggers = ["harga", "paket", "biaya", "detail paket", "daftar paket"];
  const packageDetailTriggers = ["termasuk", "include", "included", "sudah termasuk", "isi paket", "fitur paket"];
  const deliverableTriggers = ["cetak", "print", "album", "file digital", "digital", "softcopy", "hardcopy"];
  const customEventTriggers = ["makanan", "food", "kuliner", "brand shoot", "brand", "editorial", "konsep khusus", "moodboard", "custom event"];
  const portfolioTriggers = ["wisuda", "wedding", "prewedding", "proposal", "portfolio", "portofolio"];
  const scheduleTriggers = ["jadwal", "booking", "tanggal", "available", "tersedia"];
  const greetingTriggers = ["halo", "hi", "hai", "hello", "selamat"];
  const clarificationTriggers = ["apa", "bagaimana", "dimana", "siapa", "kapan", "mengapa", "kenapa", "kinilah", "bisa", "tolong"];
  const genericAskPatterns = [/^tanya( dong)?/, /^mau bertanya/, /^saya ingin bertanya/, /^boleh tanya/, /^mau nanya/, /^ingin tanya/, /^silakan bertanya?/, /^saya ada pertanyaan/];
  const isGenericAsk = genericAskPatterns.some((pattern) => pattern.test(q));

  // 1) FAQ statis dari tabel assistant_faqs (kalau ada entri manual yang cocok)
  const { data: faqData, error: faqError } = await supabase
    .from("assistant_faqs")
    .select("id, question, answer, keywords")
    .ilike("question", `%${q}%`)
    .limit(1);

  if (!faqError && faqData?.length) {
    return await sendJson({ answer: faqData[0].answer ?? "Maaf, jawabannya belum tersedia. Mau saya bantu cari alternatif?" });
  }

  if (isDpQuestion) {
    return await sendJson({ answer: buildDpAnswer(q) });
  }

  if (greetingTriggers.some((prefix) => q.startsWith(prefix)) && !containsAny(packageTriggers) && !containsAny(portfolioTriggers) && !containsAny(scheduleTriggers)) {
    return await sendJson({
      answer: pick([
        `Halo! 👋 Selamat datang di ${BIZ.namaBisnis}. Mau tanya soal paket, jadwal, atau jenis sesi foto? Saya siap bantu.`,
        `Hai! Senang kamu mampir 😊 Ada yang bisa saya bantu soal paket, harga, atau jadwal booking?`,
      ]),
    });
  }

  if (isGenericAsk && !containsAny(packageTriggers) && !containsAny(portfolioTriggers) && !containsAny(scheduleTriggers)) {
    return await sendJson({
      answer: "Hai! Ceritakan sedikit kebutuhanmu, misalnya 'butuh paket wedding' atau 'berapa harga paket wisuda', supaya saya bisa bantu lebih tepat.",
    });
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
      return await sendJson({
        answer: `Kami juga punya paket Custom Event untuk kebutuhan seperti brand shoot, foto makanan, atau konsep khusus. Contoh:\n• ${pkg.nama_package} (${pkg.kategori ?? "Custom"}) - ${formatHarga(
          pkg.harga
        )}\n\n${pkg.highlight_package ?? "Kalau mau, kontak kami untuk creative briefing, moodboard, dan opsi studio/outdoor."}`,
      });
    }
  }

  if (containsAny(deliverableTriggers) && (containsAny(packageDetailTriggers) || containsAny(packageTriggers) || q.includes("wisuda") || q.includes("wedding"))) {
    const specificCategory = q.includes("wisuda") ? "wisuda" : q.includes("wedding") ? "wedding" : null;
    let packageQuery = supabase
      .from("packages")
      .select("nama_package, kategori, harga, highlight_package, deskripsi_singkat")
      .eq("is_active", true)
      .order("harga", { ascending: true })
      .limit(5);
    if (specificCategory) packageQuery = packageQuery.ilike("kategori", `%${specificCategory}%`);

    const { data: packages, error } = await packageQuery;
    if (!error && packages) {
      return await sendJson({ answer: buildPackageInclusionAnswer(packages) });
    }
  }

  if (containsAny(scheduleTriggers)) {
    const monthMap: Record<string, number> = {
      januari: 0, februari: 1, maret: 2, april: 3, mei: 4, juni: 5,
      juli: 6, agustus: 7, september: 8, oktober: 9, november: 10, desember: 11,
    };
    const dateRegex = /(\d{1,2})\s+(januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember)\s*(\d{4})?/i;
    const match = q.match(dateRegex);

    if (match) {
      const day = Number(match[1]);
      const monthName = match[2].toLowerCase();
      const year = match[3] ? Number(match[3]) : new Date().getFullYear();
      const month = monthMap[monthName];
      const dateObj = new Date(year, month, day);
      const pad = (n: number) => n.toString().padStart(2, "0");
      const isoDate = `${dateObj.getFullYear()}-${pad(dateObj.getMonth() + 1)}-${pad(dateObj.getDate())}`;

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
        return await sendJson({ answer: `Oh, untuk bulan ${monthYear} kami melayani hanya akhir pekan. Coba pilih tanggal akhir pekan, atau hubungi kami ya.` });
      }
      if (settingsData?.is_only_weekday && isWeekend) {
        return await sendJson({ answer: `Oh, untuk bulan ${monthYear} kami hanya melayani hari kerja. Coba pilih hari kerja lain, atau hubungi kami untuk bantuan.` });
      }

      const bookedCount = bookingsError ? 0 : bookingsData?.length ?? 0;
      if (bookedCount >= sessionLimit) {
        return await sendJson({ answer: `Waduh, tanggal ${dateObj.toLocaleDateString("id-ID")} sudah penuh. Mau coba tanggal lain, atau minta bantuan admin untuk waiting list?` });
      }

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
          const header = `Mantap! Tanggal ${dateObj.toLocaleDateString("id-ID")} masih tersedia untuk booking!`;
          return await sendJson({ answer: `${header}\n\n${buildPackageAnswer(packages)}` });
        }
      }

      return await sendJson({
        answer: `Mantap! Tanggal ${dateObj.toLocaleDateString("id-ID")} masih tersedia untuk booking! Untuk acara apa ya? (mis. "wisuda", "wedding", atau lainnya) — jawab singkat supaya saya bisa rekomendasikan paket yang cocok.`,
      });
    }

    return await sendJson({
      answer: "Untuk cek jadwal, buka halaman jadwal dan pilih tanggal yang tersedia, atau sebutkan tanggalnya di sini (misal 'tanggal 20 Agustus') biar saya cek langsung.",
    });
  }

  const priceExtreme = detectPriceExtreme(q);
  const isPriceRangeQuestion = PRICE_RANGE_TRIGGERS.some((t) => q.includes(t));

  if (containsAny(packageTriggers) || q.includes("wisuda") || q.includes("wedding") || priceExtreme || isPriceRangeQuestion) {
    let specificCategory = q.includes("wisuda") ? "wisuda" : q.includes("wedding") ? "wedding" : null;
    if (!specificCategory && (priceExtreme || isPriceRangeQuestion)) {
      specificCategory = await getRecentSessionCategory(body?.session_id);
    }
    const categoryLabel = specificCategory ? ` untuk ${specificCategory}` : "";

    if (priceExtreme) {
      let { data: packages, error } = await buildPackagesQuery(specificCategory)
        .order("harga", { ascending: priceExtreme === "min" })
        .limit(1);
      if ((error || !packages?.length) && specificCategory) {
        ({ data: packages, error } = await buildPackagesQuery(null).order("harga", { ascending: priceExtreme === "min" }).limit(1));
      }
      if (!error && packages?.length) {
        const pkg = packages[0];
        const label = priceExtreme === "min" ? "termurah" : "termahal";
        return await sendJson({
          answer: withClosing(
            `Paket ${label}${categoryLabel} saat ini adalah ${pkg.nama_package} seharga ${formatHarga(pkg.harga)}.${pkg.highlight_package ? ` ${pkg.highlight_package}` : ""}`
          ),
        });
      }
    }

    if (isPriceRangeQuestion) {
      const [{ data: cheapest }, { data: priciest }] = await Promise.all([
        buildPackagesQuery(specificCategory).order("harga", { ascending: true }).limit(1),
        buildPackagesQuery(specificCategory).order("harga", { ascending: false }).limit(1),
      ]);
      if (cheapest?.length && priciest?.length) {
        const cheap = cheapest[0];
        const expensive = priciest[0];
        const answer =
          cheap.nama_package === expensive.nama_package
            ? `Untuk saat ini harga paket${categoryLabel} adalah ${formatHarga(cheap.harga)} (${cheap.nama_package}).`
            : `Kisaran harga paket${categoryLabel} kami mulai dari ${formatHarga(cheap.harga)} (${cheap.nama_package}) sampai ${formatHarga(expensive.harga)} (${expensive.nama_package}).`;
        return await sendJson({ answer: withClosing(answer) });
      }
    }

    const { data: packages, error } = await buildPackagesQuery(specificCategory).order("harga", { ascending: true }).limit(3);
    if (!error && packages) {
      return await sendJson({ answer: buildPackageAnswer(packages) });
    }
  }

  // 8) Portofolio
  if (containsAny(portfolioTriggers)) {
    const category = q.includes("wisuda") ? "wisuda" : q.includes("wedding") ? "wedding" : "personal";
    const { data: portfolios, error } = await supabase
      .from("portfolios")
      .select("judul, kategori, deskripsi")
      .ilike("kategori", `%${category}%`)
      .order("created_at", { ascending: false })
      .limit(2);

    if (!error && portfolios?.length) {
      const lines = portfolios.map((item: { judul: string; deskripsi: string }) => `• ${item.judul}: ${item.deskripsi}`);
      return await sendJson({ answer: `Berikut beberapa contoh portfolio ${category}:\n${lines.join("\n")}` });
    }
  }

  const faqTopicAnswer = findFaqTopicAnswer(q);
  if (faqTopicAnswer) {
    return await sendJson({ answer: faqTopicAnswer });
  }

  if (clarificationTriggers.some((word) => q.includes(word)) && !containsAny(packageTriggers) && !containsAny(portfolioTriggers) && !containsAny(scheduleTriggers)) {
    return await sendJson({ answer: "Boleh, saya bantu. Contoh: 'berapa harga paket wedding', 'apa saja fitur paket wisuda', atau 'berapa lama proses edit hasil'." });
  }

  const analyticsAnswer = await findSimilarAnalyticsAnswer(q);
  if (analyticsAnswer) {
    return await sendJson({ answer: analyticsAnswer });
  }

  return await sendJson({
    answer: pick([
      `Maaf, saya belum bisa menjawab itu dengan pasti. Coba gunakan kata kunci seperti 'paket', 'harga', 'wisuda', 'wedding', 'jadwal', atau tanyakan langsung ke ${BIZ.kontakAdmin}.`,
      "Hmm, saya belum menangkap maksudnya dengan jelas. Boleh dijelaskan sedikit lagi, atau coba kata kunci seperti 'paket', 'jadwal', atau 'harga'?",
    ]),
  });
}