"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function chatWithAI(message: string, base64Image?: string) {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash",
    systemInstruction: "Kamu adalah asisten profesional Potreed. Jawab pertanyaan tentang jasa fotografi dengan ramah. Jika ditanya harga, arahkan ke paket yang ada."
  });

  const parts: any[] = [{ text: message }];

  if (base64Image) {
    parts.push({
      inlineData: {
        data: base64Image.split(",")[1],
        mimeType: "image/jpeg",
      },
    });
  }

  const result = await model.generateContent(parts);
  return result.response.text();
}