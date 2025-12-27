import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const explainConcept = async (concept: string, context: string) => {
  try {
    const model = 'gemini-3-flash-preview';
    const prompt = `
      You are a senior full-stack engineer tutor. A junior developer is looking at a simulation of a Vue3 + SpringBoot + MyBatis-Plus + MySQL architecture.
      
      The user asks about: "${concept}"
      Current Simulation Context: "${context}"

      Please explain this concept simply, in Chinese (Mainland China technical terminology). 
      Focus on *how* data flows and *why* we do it this way.
      Keep it under 150 words.
      Use Markdown for code keywords.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });
    
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "AI 解释服务暂时不可用，请检查 API Key 配置。";
  }
};