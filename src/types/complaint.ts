export type ComplaintCategory =
  | "road_damage"
  | "water_supply"
  | "sewage"
  | "streetlight"
  | "garbage"
  | "encroachment"
  | "noise_pollution"
  | "public_safety"
  | "parks_recreation"
  | "other";

export type ComplaintStatus =
  | "pending"
  | "verified"
  | "in_progress"
  | "resolved"
  | "escalated";

export type Severity = "low" | "medium" | "high" | "critical";

export interface GeoLocation {
  type: "Point";
  coordinates: [number, number]; // [lng, lat] — GeoJSON
  address: string;
  ward?: string;
  zone?: string;
}

export interface ImageAnalysis {
  labels: string[];
  detectedIssues: string[];
  confidence: number;
}

export interface VerificationSummary {
  confirmed: number;
  rejected: number;
  voters: string[];
}

export interface CoraFollowUp {
  date: Date;
  message: string;
  actionTaken?: string;
}

export interface CoraAnalysis {
  reasoning: string;
  suggestedActions: string[];
  duplicateCandidates: string[];
  followUps: CoraFollowUp[];
  escalationRecommended: boolean;
  escalationReason?: string;
}

export interface IComplaint {
  _id: string;
  reportedBy: string;

  // CORA-generated
  title: string;
  description: string;
  category: ComplaintCategory;
  severity: Severity;
  department: string;
  estimatedResolutionDays: number;
  impactScore: number;

  // Media
  imageUrl: string;
  imageAnalysis: ImageAnalysis;

  // Location
  location: GeoLocation;

  // Lifecycle
  status: ComplaintStatus;
  assignedTo?: string;
  resolvedAt?: Date;
  resolutionNotes?: string;

  // Community
  verifications: VerificationSummary;

  // CORA
  coraAnalysis: CoraAnalysis;

  createdAt: Date;
  updatedAt: Date;
}

export interface IVerification {
  _id: string;
  complaintId: string;
  userId: string;
  vote: "confirm" | "reject";
  comment?: string;
  location: {
    type: "Point";
    coordinates: [number, number];
  };
  createdAt: Date;
}
