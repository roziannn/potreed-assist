import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const model = genAI.getGenerativeModel({ 
 model: "gemini-2.5-flash",
  systemInstruction: "Kamu adalah asisten bisnis fotografi profesional. Berikan jawaban yang ringkas, membantu, dan berorientasi pada profit."
});