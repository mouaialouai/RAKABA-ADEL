import { GoogleGenAI, Type } from "@google/genai";

// Note: This service is for server-side use in Express.
// In the client, we use fetch() to hit our Express endpoints.

export const AI_MODELS = {
  GENERAL: 'gemini-3-flash-preview',
  COMPLEX: 'gemini-3.1-pro-preview',
} as const;

// Types for AI extraction
export interface TraineeExtraction {
  name: string;
  id?: string;
  email?: string;
  group?: string;
}

export interface DropoutRiskAnalysis {
  riskScore: number;
  confidence: number;
  reasoning: string;
  recommendedActions: string[];
}
