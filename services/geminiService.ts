import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from '../types';

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzePromptContent = async (content: string): Promise<AnalysisResult> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Analyze the following AI prompt. 
      
      1. Title: A short, simple, plain English title describing the outcome (max 8 words). No jargon.
      2. Breakdown: A detailed explanation of the prompt's logic and structure.
      3. Tags: Up to 5 relevant keywords.
      4. Use Cases: Identify 3 distinct professional scenarios or job roles where this prompt solves a specific problem. Make it relatable to users.
      
      Prompt to analyze:
      """
      ${content}
      """`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "Simple, outcome-focused title." },
            breakdown: { type: Type.STRING, description: "Detailed logic explanation." },
            tags: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "5 keywords" 
            },
            useCases: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3 specific professional use cases (e.g., 'Marketing Managers can use this to...')"
            }
          },
          required: ["title", "breakdown", "tags", "useCases"]
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