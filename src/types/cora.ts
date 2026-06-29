import { ImageAnalysis, CoraAnalysis } from "./complaint";

/** CORA's step-by-step analysis pipeline output */
export interface CoraStepResult {
  step: number;
  name: string;
  status: "pending" | "processing" | "completed" | "error";
  result?: string;
  duration?: number; // ms
}

export interface CoraAnalysisRequest {
  imageBase64: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
}

export interface CoraAnalysisResponse {
  title: string;
  description: string;
  category: string;
  severity: string;
  department: string;
  estimatedResolutionDays: number;
  impactScore: number;
  imageAnalysis: ImageAnalysis;
  coraAnalysis: CoraAnalysis;
  steps: CoraStepResult[];
}

export interface CoraInsight {
  id: string;
  summary: string;
  area: string;
  trend: "increasing" | "decreasing" | "stable";
  recommendation: string;
  affectedComplaints: number;
  generatedAt: Date;
}
