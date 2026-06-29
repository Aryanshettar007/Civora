import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.warn(
    "⚠️ GEMINI_API_KEY is not set. CORA AI features will not work."
  );
}

/**
 * Google Generative AI client instance.
 * Used for both Vision (image analysis) and text generation (CORA reasoning).
 */
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || "");

/**
 * Get Gemini model for multimodal (image + text) analysis.
 * Used by CORA Step 1: Image Analysis
 */
export function getVisionModel() {
  return genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: {
      temperature: 0.3, // Low temperature for consistent classification
      topP: 0.8,
      maxOutputTokens: 2048,
    },
  });
}

/**
 * Get Gemini model for text-only reasoning and generation.
 * Used by CORA Steps 2-9: Classification, description, insights
 */
export function getTextModel() {
  return genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: {
      temperature: 0.5,
      topP: 0.9,
      maxOutputTokens: 4096,
    },
  });
}

/**
 * Get Gemini model for CORA insights generation.
 * Higher temperature for more creative, natural-language summaries.
 */
export function getInsightsModel() {
  return genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: {
      temperature: 0.7,
      topP: 0.95,
      maxOutputTokens: 4096,
    },
  });
}

export { genAI };
