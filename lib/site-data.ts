export type ServicePackage = {
  name: string;
  category: "Wedding" | "Wisuda" | "Custom";
  price: string;
  badge: string;
  description: string;
  features: string[];
};

export type Testimonial = {
  name: string;
  event: string;
  quote: string;
  rating: number;
};

export type BookingItem = {
  client: string;
  eventType: "Wedding" | "Wisuda" | "Custom";
  packageName: string;
  eventDate: string;
  status: "Pending" | "Confirmed" | "Follow Up";
  budget: string;
  notes: string;
};

export const servicePackages: ServicePackage[] = [
  {
    name: "Wisuda Essential",
    category: "Wisuda",
    price: "Rp1.850.000",
    badge: "Paling Praktis",
    description:
      "Sesi singkat untuk calon wisudawan yang ingin hasil clean, cepat, dan tetap premium.",
    features: [
      "1 fotografer",
      "45 menit sesi foto",
      "15 edit warna premium",
      "1 reels behind the scene",
    ],
  },
  {
    name: "Wisuda Signature",
    category: "Wisuda",
    price: "Rp3.250.000",
    badge: "Favorit Client",
    description:
      "Pilihan paling sering diambil untuk keluarga kecil dengan banyak variasi pose dan frame.",
    features: [
      "2 fotografer",
      "90 menit sesi foto",
      "30 edit premium + 1 print A4",
      "Akses galeri online 30 hari",
    ],
  },
  {
    name: "Wedding Intimate",
    category: "Wedding",
    price: "Rp6.900.000",
    badge: "Untuk Akad & Intimate Event",
    description:
      "Cocok untuk akad, lamaran, dan resepsi intimate dengan dokumentasi yang hangat dan elegan.",
    features: [
      "2 fotografer",
      "8 jam coverage",
      "Highlight album digital",
      "Preview 24 jam",
    ],
  },
  {
    name: "Wedding Luxury",
    category: "Wedding",
    price: "Rp12.500.000",
    badge: "Best Value",
    description:
      "Paket lengkap untuk hari besar dengan storytelling yang kuat dari preparation sampai closing.",
    features: [
      "3 fotografer + 1 videografer",
      "12 jam coverage",
      "Wedding teaser 60 detik",
      "Photobook eksklusif",
    ],
  },
  {
    name: "Custom Event",
    category: "Custom",
    price: "Mulai Rp4.500.000",
    badge: "Fleksibel",
    description:
      "Untuk brand shoot, prewedding editorial, atau kebutuhan konsep khusus dengan moodboard terarah.",
    features: [
      "Creative briefing",
      "Konsep visual dan rundown",
      "Pilihan add-on studio atau outdoor",
      "Bisa gabung foto + video",
    ],
  },
];

export const testimonials: Testimonial[] = [
  {
    name: "Nadya & Fikri",
    event: "Wedding, Bandung",
    quote:
      "Timnya responsif banget, hasil fotonya rapi, dan tamu kami juga bilang prosesnya terasa tenang.",
    rating: 5,
  },
  {
    name: "Raisa Putri",
    event: "Wisuda, Jakarta",
    quote:
      "Aku suka karena dari chat sampai file jadi terasa jelas. Paket yang disarankan juga pas sama budget.",
    rating: 5,
  },
  {
    name: "Dinda Family",
    event: "Wisuda Keluarga",
    quote:
      "Floating assistant-nya membantu banget buat tanya harga dan jadwal tanpa harus nunggu admin balas manual.",
    rating: 5,
  },
];

export const portfolioHighlights = [
  {
    title: "Garden Wedding Story",
    tag: "Wedding",
    description: "Tone hangat, candid natural, dan fokus ke momen keluarga inti.",
  },
  {
    title: "Graduation Street Session",
    tag: "Wisuda",
    description: "Sesi outdoor yang clean dengan framing urban dan detail toga.",
  },
  {
    title: "Editorial Couple Morning",
    tag: "Custom",
    description: "Mood sinematik untuk pasangan yang ingin visual lebih fashion-forward.",
  },
];

export const engagementSummary = {
  totalClicks: 2847,
  floatingChatStarts: 613,
  consultationClicks: 189,
  bookingIntent: 96,
};

export const topGuestQuestions = [
  { topic: "Harga paket wisuda", count: 148 },
  { topic: "Apakah tanggal weekend masih kosong?", count: 126 },
  { topic: "Bisa custom budget?", count: 91 },
  { topic: "Berapa lama file jadi?", count: 74 },
];

export const mostCheckedPackages = [
  { name: "Wisuda Signature", views: 212 },
  { name: "Wedding Grand Story", views: 168 },
  { name: "Wedding Intimate", views: 127 },
  { name: "Custom Campaign", views: 86 },
];

export const bookingDateInsights = [
  { label: "Sabtu, 12 Juli 2026", intent: 34, curiosity: 61 },
  { label: "Minggu, 20 Juli 2026", intent: 28, curiosity: 44 },
  { label: "Sabtu, 2 Agustus 2026", intent: 22, curiosity: 57 },
];

export const budgetRanges = [
  { label: "Rp1jt - Rp3jt", share: "31%" },
  { label: "Rp3jt - Rp7jt", share: "42%" },
  { label: "Rp7jt - Rp12jt", share: "19%" },
  { label: "> Rp12jt", share: "8%" },
];

export const bookingItems: BookingItem[] = [
  {
    client: "Nadya & Fikri",
    eventType: "Wedding",
    packageName: "Wedding Luxury",
    eventDate: "12 Juli 2026",
    status: "Confirmed",
    budget: "Rp12.500.000",
    notes: "Sudah DP 50%, minta tone hangat dan candid keluarga.",
  },
  {
    client: "Raisa Putri",
    eventType: "Wisuda",
    packageName: "Wisuda Signature",
    eventDate: "20 Juli 2026",
    status: "Pending",
    budget: "Rp3.250.000",
    notes: "Masih menunggu final konfirmasi jadwal kampus dan jumlah keluarga.",
  },
  {
    client: "Aldo Creative",
    eventType: "Custom",
    packageName: "Custom Event",
    eventDate: "2 Agustus 2026",
    status: "Follow Up",
    budget: "Mulai Rp4.500.000",
    notes: "Perlu follow up untuk kebutuhan moodboard dan lokasi studio.",
  },
];
