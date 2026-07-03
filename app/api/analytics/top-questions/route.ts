import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

const STOPWORDS = new Set([
  "apa",
  "apakah",
  "berapa",
  "yang",
  "saya",
  "kamu",
  "untuk",
  "di",
  "hari",
  "dengan",
  "adalah",
  "apa",
  "paket",
  "paketnya",
  "apa",
  "ga",
  "ada",
  "tgl",
  "tanggal",
  "berapa",
  "berapa",
  "yah",
  "ya",
  "nih",
  "dong",
  "ingin",
  "mau",
  "boleh",
  "buat",
  "kalo",
  "kalau",
  "tanya",
  "bisa",
  "gak",
  "nggak",
  "tidak",
  "perlu",
]);

const EVENT_TOKENS = ["wisuda", "wedding", "prewedding", "proposal", "personal", "keluarga", "family"] as const;
type AnalyticsEventRow = {
  value: string | null;
  metadata: unknown;
  created_at: string;
};

function normalizeRawQuestion(s: string) {
  if (!s) return "";
  let text = s.toLowerCase();

  // Replace common date patterns (e.g., "7 juli 2026", "20agustus", "20/08/2026") with a DATE token
  const monthNames = "januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember";
  const dateRegex1 = new RegExp(`(\\d{1,2}\\s*(?:${monthNames})(?:\\s*\\d{2,4})?)`, "gi");
  const dateRegex2 = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/g;
  const relativeDateRegex = /\b(hari ini|besok|lusa|nanti malam|minggu ini|bulan ini)\b/g;
  const dayNameRegex = /\b(senin|selasa|rabu|kamis|jumat|jum'at|jum at|sabtu|minggu)\b/g;
  text = text.replace(dateRegex1, " date ").replace(dateRegex2, " date ");
  text = text.replace(relativeDateRegex, " date ").replace(dayNameRegex, " date ");

  // Normalize punctuation and non-alphanum to spaces
  text = text.replace(/[\u2000-\u206F\u2E00-\u2E7F\p{P}$+<=>^`|~]/gu, " ").replace(/[^a-z0-9\s]/g, " ");

  // Normalize some synonyms: booking/pesan/bookingnya -> booking
  text = text.replace(/\b(pesan|pesen|booking|book|reserve|reservasi)\b/g, " booking ");
  text = text.replace(/\b(photo ?shoot|foto ?shoot|pemotretan)\b/g, " photoshoot ");
  text = text.replace(/\b(group|grup)\b/g, " group ");
  text = text.replace(/\b(down payment|uang muka|booking fee|fee booking|deposit booking|deposit|panjar|tanda jadi)\b/g, " dp ");
  text = text.replace(/\b(setengah|separuh|50 persen|50%|lima puluh persen)\b/g, " half ");

  // Normalize whitespace
  return text.replace(/\s+/g, " ").trim();
}

function tokenizeQuestion(s: string) {
  const text = normalizeRawQuestion(s);
  if (!text) return [];
  const baseTokens = text.split(" ").filter((t) => t && !STOPWORDS.has(t));
  const enrichedTokens = [...baseTokens];
  const hasDate = baseTokens.includes("date");
  const hasSchedulingIntent = baseTokens.includes("booking") || hasDate;

  if (hasDate && !enrichedTokens.includes("schedule")) {
    enrichedTokens.push("schedule");
  }

  if (hasSchedulingIntent && !enrichedTokens.includes("availability")) {
    enrichedTokens.push("availability");
  }

  return enrichedTokens;
}

function buildClusterKey(tokens: string[]) {
  const eventTokens = tokens.filter((t) => EVENT_TOKENS.includes(t as (typeof EVENT_TOKENS)[number]));
  const hasBooking = tokens.some((t) => t === "booking");
  const hasDate = tokens.includes("date");
  const hasSchedule = tokens.includes("schedule");
  const hasDp = tokens.includes("dp");
  const hasHalf = tokens.includes("half");
  const hasTheme = tokens.includes("tema");
  const hasPhotoshoot = tokens.includes("photoshoot") || tokens.includes("model");
  const hasPrice = tokens.some((t) => ["murah", "budget", "hemat"].includes(t));
  const hasGroup = tokens.some((t) => ["group", "keluarga", "family"].includes(t));

  const keyParts: string[] = [];

  if (hasBooking) keyParts.push("booking");
  if (hasTheme) keyParts.push("tema");
  if (hasPhotoshoot) keyParts.push("photoshoot");
  if (eventTokens.length) keyParts.push(eventTokens[0]);
  if (hasDp) keyParts.push("dp");
  if (hasHalf) keyParts.push("half");
  if (hasSchedule) keyParts.push("schedule");
  if (hasDate) keyParts.push("date");
  if (hasPrice) keyParts.push("murah");
  if (hasGroup) keyParts.push("group");

  const remaining = tokens.filter(
    (t) =>
      t !== "date" &&
      t !== "booking" &&
      t !== "dp" &&
      t !== "half" &&
      t !== "tema" &&
      t !== "photoshoot" &&
      t !== "schedule" &&
      t !== "availability" &&
      t !== "model" &&
      !eventTokens.includes(t as (typeof EVENT_TOKENS)[number]) &&
      !["murah", "budget", "hemat", "group"].includes(t),
  );

  keyParts.push(...remaining.slice(0, 3));

  return keyParts.join(" ").trim();
}

function buildQuestionLabel(tokenGroups: string[][], examples: string[]) {
  const allTokens = tokenGroups.flat();
  const firstExample = examples[0]?.trim();
  const has = (values: string[]) => values.some((value) => allTokens.includes(value));
  const event = EVENT_TOKENS.find((value) => allTokens.includes(value));

  if (has(["tema"]) && has(["photoshoot", "model"])) {
    return "tema untuk photoshoot model";
  }

  if (has(["booking"]) && has(["date"])) {
    return event ? `booking ${event} di tanggal tertentu` : "booking di tanggal tertentu";
  }

  if (has(["dp"])) {
    return "dp untuk booking";
  }

  if (has(["schedule", "availability"]) && has(["date"])) {
    return event ? `jadwal ${event} untuk waktu dekat` : "jadwal untuk waktu dekat";
  }

  if (has(["murah", "budget", "hemat"])) {
    return event ? `paket ${event} yang murah` : "paket yang murah";
  }

  if (has(["group", "keluarga", "family"])) {
    return event ? `paket ${event} untuk grup keluarga` : "paket untuk grup keluarga";
  }

  if (has(["booking"]) && event) {
    return `booking ${event}`;
  }

  if (firstExample) {
    return firstExample.replace(/\s+/g, " ").trim();
  }

  return tokenGroups[0]?.join(" ") ?? "";
}

function shouldClusterDocs(leftTokens: string[], rightTokens: string[]) {
  const leftHasDp = leftTokens.includes("dp");
  const rightHasDp = rightTokens.includes("dp");

  if (leftHasDp !== rightHasDp) {
    return false;
  }

  return true;
}

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("analytics_events")
      .select("value,metadata,created_at")
      .eq("event_type", "assistant_interaction")
      .not("value", "is", null)
      .limit(10000);

    if (error) {
      console.error("top-questions: fetch error", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Build documents and tokens
    const docs: { raw: string; tokens: string[]; key: string }[] = [];
    for (const row of (data ?? []) as AnalyticsEventRow[]) {
      const raw = (row.value ?? "").toString();
      const tokens = tokenizeQuestion(raw);
      const key = buildClusterKey(tokens);
      docs.push({ raw, tokens, key });
    }

    if (docs.length === 0) return NextResponse.json({ top: [] });

    // Build vocabulary and document frequencies
    const df: Record<string, number> = {};
    for (const d of docs) {
      const seen = new Set<string>();
      for (const t of d.tokens) {
        if (!seen.has(t)) {
          df[t] = (df[t] ?? 0) + 1;
          seen.add(t);
        }
      }
    }

    const vocab = Object.keys(df);
    const N = docs.length;

    // Compute TF-IDF vectors
    const idf: Record<string, number> = {};
    for (const t of vocab) idf[t] = Math.log((N + 1) / (1 + (df[t] ?? 0))) + 1;

    const vectors: number[][] = docs.map((d) => {
      const tf: Record<string, number> = {};
      for (const t of d.tokens) tf[t] = (tf[t] ?? 0) + 1;
      const vec = vocab.map((t) => (tf[t] ? tf[t] * idf[t] : 0));
      // normalize
      const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0)) || 1;
      return vec.map((v) => v / norm);
    });

    // Greedy clustering by cosine similarity threshold
    const assigned = new Array(docs.length).fill(false);
    const clusters: { members: number[] }[] = [];
    const COS_THRESHOLD = 0.62;

    const cosine = (a: number[], b: number[]) => a.reduce((s, v, i) => s + v * (b[i] ?? 0), 0);

    for (let i = 0; i < docs.length; i++) {
      if (assigned[i]) continue;
      const members = [i];
      assigned[i] = true;
      for (let j = i + 1; j < docs.length; j++) {
        if (assigned[j]) continue;
        if (!shouldClusterDocs(docs[i].tokens, docs[j].tokens)) continue;
        const sim = cosine(vectors[i], vectors[j]);
        if (sim >= COS_THRESHOLD) {
          members.push(j);
          assigned[j] = true;
        }
      }
      clusters.push({ members });
    }

    // Map clusters to results
    const clusterResults = clusters
      .map((c) => {
        const examples = Array.from(new Set(c.members.slice(0, 10).map((idx) => docs[idx].raw)));
        const tokenGroups = c.members.map((idx) => docs[idx].tokens);
        const repCounts: Record<string, number> = {};
        for (const idx of c.members) {
          const key = docs[idx].key || docs[idx].tokens.join(" ") || docs[idx].raw.toLowerCase();
          repCounts[key] = (repCounts[key] ?? 0) + 1;
        }
        const rep = Object.entries(repCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "";
        const question = buildQuestionLabel(tokenGroups, examples) || rep || examples[0] || "";
        return { question, count: c.members.length, examples };
      })
      .sort((a, b) => b.count - a.count);

    const mergedResults = new Map<string, { question: string; count: number; examples: string[] }>();
    for (const item of clusterResults) {
      const existing = mergedResults.get(item.question);
      if (!existing) {
        mergedResults.set(item.question, {
          question: item.question,
          count: item.count,
          examples: item.examples,
        });
        continue;
      }

      existing.count += item.count;
      existing.examples = Array.from(new Set([...existing.examples, ...item.examples])).slice(0, 10);
    }

    const results = Array.from(mergedResults.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return NextResponse.json({ top: results });
  } catch (error: unknown) {
    console.error("top-questions error", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
