"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export type GenerateCaptionInput = {
  judul: string;
  kategori: string;
  deskripsi: string;
  tone: string;            // "hangat" | "elegan" | "editorial"
  captionLength: string;   // "pendek" | "sedang" | "panjang"
  captionPlatform: string; // "instagram" | "tiktok" | "whatsapp" | "website"
  useEmoji: boolean;
};

const toneMap: Record<string, string> = {
  hangat: "hangat, dekat, dan natural",
  elegan: "elegan, mengalir, dan terasa premium",
  editorial: "bold, rapi, dan terasa editorial/majalah",
};

const lengthMap: Record<string, string> = {
  pendek: "1-2 kalimat pendek (maksimal sekitar 25 kata)",
  sedang: "3-4 kalimat (sekitar 40-60 kata)",
  panjang: "5-7 kalimat, lebih detail dan storytelling (sekitar 80-120 kata)",
};

const platformMap: Record<string, string> = {
  instagram: "caption Instagram, boleh sisipkan ajakan untuk DM atau booking di akhir",
  tiktok: "caption TikTok, gaya santai dan catchy, buat hook kuat di kalimat pertama",
  whatsapp: "status WhatsApp Business, singkat, personal, terasa seperti pesan langsung ke calon klien",
  website: "teks untuk halaman portofolio website, lebih formal, deskriptif, dan enak dibaca",
};

export async function generatePortfolioCaption(input: GenerateCaptionInput) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction:
      "Kamu adalah asisten bisnis fotografi profesional bernama Potreed. Buat caption promosi portofolio yang menarik, membantu closing calon klien, dan berorientasi pada profit. Jangan gunakan tanda kutip, markdown, atau penjelasan tambahan di luar captionnya sendiri.",
  });

  const prompt = `
Buatkan 1 caption promosi untuk portofolio jasa fotografi dengan detail berikut:
- Judul sesi: ${input.judul || "Sesi terbaru"}
- Kategori: ${input.kategori || "Portfolio"}
- Deskripsi momen: ${input.deskripsi || "Momen yang intim dan penuh detail kecil"}
- Tone tulisan: ${toneMap[input.tone] ?? toneMap.hangat}
- Panjang caption: ${lengthMap[input.captionLength] ?? lengthMap.sedang}
- Ditujukan untuk: ${platformMap[input.captionPlatform] ?? platformMap.instagram}
- Emoji: ${input.useEmoji ? "gunakan emoji yang relevan, jangan berlebihan" : "jangan gunakan emoji sama sekali"}

Tulis HANYA teks captionnya saja, tanpa tanda kutip di awal/akhir, tanpa judul, tanpa markdown.
`.trim();

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    return { success: true as const, caption: text };
  } catch (err: any) {
    console.error("DEBUG ERROR GEMINI (generatePortfolioCaption):", err);
    return {
      success: false as const,
      error: err?.message || "Gagal generate caption, coba lagi.",
    };
  }
}