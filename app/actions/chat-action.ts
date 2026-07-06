"use server";

import { model } from "@/lib/gemini";
import { executeToolCall } from "@/lib/assistant-tools";
import { tryStaticAnswer } from "@/lib/assistant-static";
import { logAssistantInteraction } from "@/lib/assistant-analytics";
import { extractIsoDateFromText, formatIsoDateToIndonesian } from "@/lib/date-utils";
import { isRateLimitError, getDegradedModeAnswer } from "@/lib/assistant-fallback";

export async function chatWithAI(message: string, base64Image?: string, sessionId?: string) {
  const originalMessage = message ?? "";

  if (!originalMessage.trim() && !base64Image) {
    return "Tolong tulis pertanyaannya supaya saya bisa bantu 😊";
  }

  // 1) Fast-path statis if hanya kalau tidak ada gambar (static belum bisa "lihat" gambar)
  if (!base64Image) {
    const staticResult = await tryStaticAnswer(originalMessage, sessionId);
    if (staticResult) {
      await logAssistantInteraction({
        originalMessage,
        answer: staticResult.answer,
        sessionId,
        detectedCategory: staticResult.detectedCategory,
        detectedDate: staticResult.detectedDate,
      });
      return staticResult.answer;
    }
  }

  // 2) Grounding paksa: kalau ada tanggal spesifik disebutkan, cek availability
  //    langsung ke DB SEKARANG, suapkan hasilnya ke Gemini sebagai data sistem.
  let augmentedMessage = originalMessage;
  const detectedIsoDate = extractIsoDateFromText(originalMessage);

  if (detectedIsoDate) {
    const availability = await executeToolCall("check_date_availability", { date: detectedIsoDate });
    const tanggalIndo = formatIsoDateToIndonesian(detectedIsoDate);

    augmentedMessage = `${originalMessage}

[DATA SISTEM — jangan tampilkan format mentah ini ke user, gunakan untuk menjawab secara natural]
Tanggal yang dimaksud user: ${tanggalIndo} (${detectedIsoDate})
Hasil cek ketersediaan: ${JSON.stringify(availability)}
Instruksi: Sampaikan status ketersediaan tanggal ini ke user dalam bahasa natural. Jangan minta user menyebutkan ulang tanggalnya. Kalau tersedia, boleh lanjut tanya jenis layanan/kategori untuk rekomendasi paket.`;
  }

  // 3) Susun parts (text + gambar opsional)
  const parts: any[] = [{ text: augmentedMessage }];
  if (base64Image) {
    parts.push({
      inlineData: {
        data: base64Image.split(",")[1],
        mimeType: "image/jpeg",
      },
    });
  }

  // 4) Panggil Gemini dengan function-calling loop
  try {
    const chat = model.startChat();
    let result = await chat.sendMessage(parts);
    let response = result.response;

    let loopCount = 0;
    while (loopCount < 3) {
      const calls = response.functionCalls();
      if (!calls || calls.length === 0) break;

      const functionResponses = await Promise.all(
        calls.map(async (call) => ({
          functionResponse: { name: call.name, response: await executeToolCall(call.name, call.args) },
        }))
      );

      result = await chat.sendMessage(functionResponses);
      response = result.response;
      loopCount++;
    }

    const answer = response.text();

    await logAssistantInteraction({
      originalMessage,
      answer,
      sessionId,
      detectedDate: detectedIsoDate,
    });

    return answer;
  } catch (error) {
    console.error("AI Error:", error);

    // Kalau kena rate limit / quota exceeded -> fallback jawab dari DB langsung, tanpa AI
    if (isRateLimitError(error)) {
      const fallbackAnswer = await getDegradedModeAnswer(originalMessage);
      await logAssistantInteraction({
        originalMessage,
        answer: fallbackAnswer,
        sessionId,
      });
      return fallbackAnswer;
    }

    return "Maaf, asisten sedang sibuk. Silakan coba lagi.";
  }
}