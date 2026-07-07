# Potreed AI

Platform manajemen dan portofolio digital berbasis **Generative AI** untuk usaha jasa fotografi dan videografi. Dibangun untuk menjawab kebutuhan nyata UMKM kreatif: konsolidasi informasi layanan, konsultasi otomatis untuk calon pelanggan, serta dashboard analitik dan insight berbasis AI untuk mendukung keputusan bisnis owner.

🔗 **Demo:**
- Guest: [potreed-assist.vercel.app](https://potreed-assist.vercel.app)
- Admin: [potreed-assist.vercel.app/admin/login](https://potreed-assist.vercel.app/admin/login)

---

## ✨ Fitur Utama

- **AI Assistant** — konsultasi percakapan berbasis Generative AI yang memahami konteks kebutuhan calon pelanggan dan memberi rekomendasi paket/portofolio yang relevan.
- **AI Insight** — mengubah data analitik pengunjung menjadi ringkasan dan rekomendasi strategi bisnis berbahasa natural, dengan mekanisme cache harian agar hemat biaya API.
- **AI Caption Generator** — generate draft caption media sosial (Instagram, TikTok, dll) otomatis berdasarkan judul portofolio, kategori paket, dan deskripsi singkat, dengan tone, panjang, dan platform tujuan yang bisa disesuaikan.
- **Dashboard Analitik** — Visitor Analytics, Package Analytics, AI Conversation Analytics, CTA Analytics, Daily Activity, dan Visitor Trend.
- **Manajemen Konten** — kelola paket layanan, portofolio, dan ketersediaan jadwal langsung dari dashboard admin.
- **Check Schedule** — kalender ketersediaan jadwal real-time untuk calon pelanggan.

---

## 🛠️ Tech Stack

| Layer | Teknologi |
|---|---|
| Frontend | [Next.js](https://nextjs.org) (App Router, SSR) |
| UI | [Shadcn UI](https://ui.shadcn.com) + Tailwind CSS |
| Backend & Database | [Supabase](https://supabase.com) (Auth + Postgres) |
| Generative AI | [Google Gemini](https://ai.google.dev) (`gemini-2.5-flash`) |
| Deployment | [Vercel](https://vercel.com) |

---

## 🚀 Getting Started

### 1. Clone & install dependencies

```bash
git clone https://github.com/roziannn/potreed-assist.git
cd potreed-assist
npm install
```

### 2. Konfigurasi environment variables

Buat file `.env.local` di root project, isi sesuai kredensial Supabase dan Gemini kamu:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Generative AI
GEMINI_API_KEY=your_gemini_api_key
```

> Sesuaikan nama variable di atas dengan yang dipakai di `lib/supabase-admin.ts` kalau ada perbedaan penamaan.

### 3. Jalankan development server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser untuk melihat hasilnya.

### 4. Build untuk production

```bash
npm run build
npm run start
```

---

## 📁 Struktur Project 

```
app/                  # Routes (App Router)
├─ admin/             # Dashboard admin (analytics, portfolio, packages, dll)
└─ (guest)/           # Halaman publik (portfolio, paket, AI Assistant, booking)
lib/
├─ analytics-queries.ts     # Query agregasi data dari analytics_events & client_needs
├─ ai-insights-engine.ts    # Generate & cache AI Insight (Gemini + fallback)
├─ supabase-admin.ts        # Supabase client (server-side)
└─ topic-classifier.ts      # Klasifikasi topik pertanyaan guest
```

---

## 📦 Deploy

Deploy paling mudah lewat [Vercel Platform](https://vercel.com/new), pembuat Next.js. Pastikan environment variables di atas sudah diset di dashboard Vercel sebelum deploy.

Lihat juga [dokumentasi deployment Next.js](https://nextjs.org/docs/app/building-your-application/deploying) untuk opsi lain.

---

## 📄 Studi Kasus

Proyek ini dikembangkan berdasarkan kebutuhan nyata **Potreed**, usaha jasa fotografi dan videografi di wilayah JABODETABEK, sebagai solusi untuk mengintegrasikan informasi layanan, portofolio, dan komunikasi pelanggan dalam satu sistem berbasis data dan AI.