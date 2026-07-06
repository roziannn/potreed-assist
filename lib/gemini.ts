import { GoogleGenerativeAI, SchemaType, Tool } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const today = new Date().toISOString().split("T")[0];

const SYSTEM_INSTRUCTION = `
Kamu adalah asisten customer service bisnis fotografi & videografi "Potreed".
Hari ini: ${today}.

Gaya bicara: ramah, ringkas (maks 4-5 kalimat), profesional, jangan mengarang data.

INFO TETAP:
- Jam operasional: 09.00–18.00 WIB, Senin–Sabtu
- Area layanan: Jakarta, Bandung, Bekasi, Karawang
- Lead time booking: minimal H-14, last-minute tetap diusahakan
- Turnaround: foto 7–14 hari kerja, video 14–21 hari kerja
- Revisi: 1x revisi minor, revisi besar kena biaya tambahan
- DP: 50% untuk lock tanggal, sisanya dilunasi menjelang H-1

ATURAN WAJIB:
1. Untuk pertanyaan soal PAKET atau HARGA, WAJIB panggil function get_packages. Jangan mengarang nama paket/harga.
2. Kalau di pesan user ada bagian "[DATA SISTEM ...]", itu artinya ketersediaan tanggal SUDAH dicek otomatis oleh sistem.
   Gunakan data itu langsung untuk menjawab, JANGAN tanya ulang tanggalnya, JANGAN panggil check_date_availability lagi untuk tanggal yang sama.
3. Kalau data kosong, sampaikan jujur, arahkan ke admin.
4. Selalu akhiri dengan pertanyaan lanjutan yang natural (misalnya tanya jenis layanan kalau belum disebutkan).
`;

export const tools: Tool[] = [
  {
    functionDeclarations: [
      {
        name: "get_packages",
        description:
          "Ambil daftar paket dari database. Wajib dipanggil setiap ada pertanyaan soal paket/harga/fitur paket.",
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            category: {
              type: SchemaType.STRING,
              description: "mis. 'wisuda', 'wedding'. Kosongkan jika umum.",
            },
           sort: {
              type: SchemaType.STRING,
              format: "enum",          
              enum: ["harga_asc", "harga_desc"],
              description: "Urutan harga: termurah dulu atau termahal dulu",
            },
            limit: {
              type: SchemaType.NUMBER,
              description: "Jumlah maksimal paket yang diambil, default 5",
            },
          },
        },
      },
      {
        name: "check_date_availability",
        description: "Cek apakah tanggal tertentu masih tersedia untuk booking.",
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            date: {
              type: SchemaType.STRING,
              description: "Format YYYY-MM-DD",
            },
          },
          required: ["date"],
        },
      },
      {
        name: "get_portfolio",
        description: "Ambil contoh portofolio berdasarkan kategori acara.",
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            category: {
              type: SchemaType.STRING,
              description: "wisuda, wedding, prewedding, personal, dll.",
            },
          },
        },
      },
    ],
  },
];

export const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  systemInstruction: SYSTEM_INSTRUCTION,
  tools,
});