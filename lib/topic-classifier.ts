const STOPWORDS = new Set([
  "apa", "apakah", "yang", "di", "ke", "dari", "dan", "atau", "untuk", "dengan", "ya",
  "nih", "dong", "saya", "aku", "mau", "ingin", "kak", "min", "nya", "kah",
  "buat", "gimana", "gmn", "bisa", "boleh", "tolong", "sama",
  "gak", "ga", "gk", "nggak", "enggak", "kalo", "kalau", "sih", "deh", "kok", "itu", "ini",
]);

const GREETINGS = [
  "halo",
  "hai",
  "hi",
  "hello",
  "permisi",
  "halo kak",
  "hallo kak",
  "selamat pagi",
  "selamat siang",
  "selamat sore",
  "selamat malam",
  "assalamualaikum",
  "assalamu'alaikum",
];

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter((token) => token && !STOPWORDS.has(token));
}

function scoreSimilarity(a: string, b: string): number {
  const tokensA = tokenize(a);
  const tokensB = tokenize(b);
  if (!tokensA.length || !tokensB.length) return 0;

  const setA = new Set(tokensA);
  const setB = new Set(tokensB);
  const intersection = [...setA].filter((t) => setB.has(t)).length;
  const union = new Set([...setA, ...setB]).size || 1;
  const jaccard = intersection / union;

  const textA = tokensA.join(" ");
  const textB = tokensB.join(" ");
  const substringBonus = textA.includes(textB) || textB.includes(textA) ? 0.2 : 0;

  return Math.min(1, jaccard + substringBonus);
}

type TopicGroup = { label: string; examples: string[] };

const TOPIC_GROUPS: TopicGroup[] = [
  {
    label: "Berapa persen minimal DP untuk booking?",
    examples: [
      "bisa dp setengah dulu gak", "bisa dp dulu gak", "apakah dp dulu",
      "apakah perlu dp buat booking", "dp berapa", "saya mau booking apakah ada dp dulu",
      "bisa dp 50 persen", "dp 50 rb bisa gak", "dp 70 persen dulu boleh", "kalo dp 70 persen",
      "berapa dp", "down payment berapa", "uang muka berapa", "booking fee berapa",
      "minimal dp berapa", "dp nya berapa",
    ],
  },
  {
    label: "Apakah harga termasuk cetak atau hanya file digital?",
    examples: [
      "apakah harga sudah termasuk biaya cetak atau album atau hanya file digital",
      "apakah dapat file digital", "apakah dapat album", "apakah dapat cetak foto",
      "apakah sudah termasuk album", "isi paket apa saja",
    ],
  },
  {
    label: "Bolehkah bawa keluarga/teman saat sesi?",
    examples: [
      "boleh bawa keluarga gak", "boleh ajak teman", "bisa bawa keluarga saat sesi foto",
      "boleh bawa temen", "bisa sama keluarga",
    ],
  },
  {
    label: "Bolehkah posting hasil ke media sosial?",
    examples: [
      "boleh saya posting gak fotonya", "boleh upload ke instagram", "boleh share ke sosmed",
      "boleh posting foto ke media sosial", "fotonya boleh diupload tidak",
    ],
  },
  {
    label: "Harga untuk paket wisuda?",
    examples: [
      "paket wisuda yang murah", "harga paket wisuda", "paket wisuda hemat",
      "wisuda paket murah", "paket wisuda diskon",
    ],
  },
   {
    label: "Booking wisuda di tanggal tertentu",
    examples: [
      "saya mau tanya kalo tgl 7 juli 2026 bisa booking gak buat wisuda?",
        "saya ingin booking tgl 20agustus 2026",
    ],
  },
  
//   {
//     label: "Sapaan awal",
//     examples: ["halo", "hai", "hi", "hello", "selamat siang", "permisi"],
//   },
];

const TOPIC_MATCH_THRESHOLD = 0.35;

export function classifyTopic(rawText: string): string {
  const text = rawText.trim();
  if (!text) return "Lainnya";

    if (GREETINGS.includes(text)) {
    return "";
  }

  let best: { label: string; score: number } | null = null;

  for (const group of TOPIC_GROUPS) {
    for (const example of group.examples) {
      const score = scoreSimilarity(text, example);
      if (score >= TOPIC_MATCH_THRESHOLD && (!best || score > best.score)) {
        best = { label: group.label, score };
      }
    }
  }

  return best?.label ?? text;
}