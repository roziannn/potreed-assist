"use server";

import { model } from "@/lib/gemini";

export async function generatePhotoAdvice(prompt: string) {
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("AI Error:", error);
    return "Maaf, asisten sedang sibuk. Silakan coba lagi.";
  }
}