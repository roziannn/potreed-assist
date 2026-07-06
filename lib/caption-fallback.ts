type CaptionParams = {
  judul: string;
  kategori: string;
  deskripsi: string;
  tone: string; // "hangat" | "elegan" | "editorial"
  captionLength: string; // "pendek" | "sedang" | "panjang"
  captionPlatform: string; // "instagram" | "tiktok" | "whatsapp" | "website"
  useEmoji: boolean;
};

const EMOJI_BY_CATEGORY: Record<string, string[]> = {
  Wedding: ["💍", "🤍", "✨"],
  Engagement: ["💫", "💕", "🌿"],
  Wisuda: ["🎓", "✨", "📸"],
  Birthday: ["🎉", "🎂", "🥳"],
  Personal: ["📸", "✨", "🖤"],
  Produk: ["📦", "✨", "🛍️"],
  Custom: ["📸", "✨", "🎬"],
};

const TONE_OPENERS: Record<string, string[]> = {
  hangat: ["Momen hangat yang selalu layak dikenang.", "Kehangatan yang terekam dalam setiap detail."],
  elegan: ["Keindahan yang terpancar dalam setiap frame.", "Elegansi yang terekam sempurna."],
  editorial: ["Sebuah cerita visual yang berbicara sendiri.", "Narasi yang terangkai dalam setiap sudut foto."],
};

const CTA_BY_PLATFORM: Record<string, string> = {
  instagram: "Yuk abadikan momen spesialmu bareng kami! Klik link di bio 📩",
  tiktok: "Mau momen kamu diabadikan kayak gini? Chat kami sekarang! 🎬",
  whatsapp: "Tertarik booking sesi seperti ini? Langsung chat kami ya!",
  website: "Hubungi kami untuk konsultasi sesi foto/video Anda.",
};

function pickEmoji(kategori: string): string {
  const list = EMOJI_BY_CATEGORY[kategori] ?? EMOJI_BY_CATEGORY.Custom;
  return list[Math.floor(Math.random() * list.length)];
}

function trimToLength(text: string, length: string): string {
  if (length === "pendek") {
    const sentences = text.split(". ");
    return sentences[0] + (sentences[0].endsWith(".") ? "" : ".");
  }
  return text;
}

export function generateFallbackCaption(params: CaptionParams): string {
  const { judul, kategori, deskripsi, tone, captionLength, captionPlatform, useEmoji } = params;

  const opener = TONE_OPENERS[tone]?.[Math.floor(Math.random() * (TONE_OPENERS[tone]?.length ?? 1))] ?? TONE_OPENERS.hangat[0];
  const emoji = useEmoji ? ` ${pickEmoji(kategori)}` : "";

  let caption = `${judul}${emoji}\n\n${opener}`;

  if (deskripsi && captionLength !== "pendek") {
    caption += ` ${deskripsi}`;
  }

  if (captionLength === "panjang") {
    caption += `\n\nSetiap sesi ${kategori.toLowerCase()} punya cerita uniknya sendiri, dan kami senang bisa jadi bagian dari momen ini.`;
  }

  const cta = CTA_BY_PLATFORM[captionPlatform] ?? CTA_BY_PLATFORM.instagram;
  caption += `\n\n${cta}`;

  if (useEmoji && captionPlatform === "instagram") {
    caption += ` ${pickEmoji(kategori)}`;
  }

  return trimToLength(caption, captionLength);
}