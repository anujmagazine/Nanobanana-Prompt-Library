import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from '../types';

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzePromptContent = async (content: string): Promise<AnalysisResult> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Analyze the following AI prompt. I need a short, descriptive title, a detailed breakdown explaining what the prompt does and its structure, and a list of relevant tags (max 5).
      
      Prompt to analyze:
      """
      ${content}
      """`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "A short, catchy title for the prompt (max 10 words)" },
            breakdown: { type: Type.STRING, description: "A detailed explanation of the prompt's logic, structure, and intent." },
            tags: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Up to 5 keywords describing the prompt" 
            }
          },
          required: ["title", "breakdown", "tags"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    return JSON.parse(text) as AnalysisResult;
  } catch (error) {
    console.error("Analysis failed:", error);
    throw error;
  }
};
