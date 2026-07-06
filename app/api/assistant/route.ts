import { NextResponse } from "next/server";
import { model } from "@/lib/gemini";
import { executeToolCall } from "@/lib/assistant-tools";
import { tryStaticAnswer } from "@/lib/assistant-static";
import { logAssistantInteraction } from "@/lib/assistant-analytics";
import { extractIsoDateFromText, formatIsoDateToIndonesian } from "@/lib/date-utils";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const originalMessage: string = body?.message ?? "";

  if (!originalMessage.trim()) {
    return NextResponse.json({ answer: "Tolong tulis pertanyaannya supaya saya bisa bantu 😊" }, { status: 400 });
  }

  const staticResult = await tryStaticAnswer(originalMessage, body?.session_id);
  if (staticResult) {
    await logAssistantInteraction({
      originalMessage,
      answer: staticResult.answer,
      sessionId: body?.session_id,
      visitorId: body?.visitor_id,
      page: body?.page,
      packageId: body?.package_id,
      detectedCategory: staticResult.detectedCategory,
      detectedDate: staticResult.detectedDate,
    });
    return NextResponse.json({ answer: staticResult.answer });
  }

  // 2) Grounding paksa: kalau ada tanggal di pesan user, cek availability SEKARANG
  //    dan suapkan hasilnya ke Gemini sebagai "data sistem" — supaya Gemini
  //    tidak bisa mengarang atau melewatkan pengecekan tanggal.
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

  // 3) Fallback ke Gemini dengan function calling (untuk paket, portofolio, dst.)
  try {
    const chat = model.startChat();
    let result = await chat.sendMessage(augmentedMessage);
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
      sessionId: body?.session_id,
      visitorId: body?.visitor_id,
      page: body?.page,
      packageId: body?.package_id,
      detectedDate: detectedIsoDate,
    });

    return NextResponse.json({ answer });
  } catch (error) {
    console.error("AI Error:", error);
    return NextResponse.json({ answer: "Maaf, asisten sedang sibuk. Silakan coba lagi." });
  }
}