import { z } from "zod";

/** Validate complaint creation input */
export const createComplaintSchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().min(10).max(2000),
  category: z.enum([
    "road_damage",
    "water_supply",
    "sewage",
    "streetlight",
    "garbage",
    "encroachment",
    "noise_pollution",
    "public_safety",
    "parks_recreation",
    "other",
  ]),
  severity: z.enum(["low", "medium", "high", "critical"]),
  department: z.string().min(1),
  estimatedResolutionDays: z.number().min(1).max(90),
  impactScore: z.number().min(1).max(100),
  imageUrl: z.string().url(),
  imageAnalysis: z.object({
    labels: z.array(z.string()),
    detectedIssues: z.array(z.string()),
    confidence: z.number().min(0).max(1),
  }),
  location: z.object({
    type: z.literal("Point"),
    coordinates: z.tuple([z.number(), z.number()]),
    address: z.string().min(1),
    ward: z.string().optional(),
    zone: z.string().optional(),
  }),
  coraAnalysis: z.object({
    reasoning: z.string(),
    suggestedActions: z.array(z.string()),
    duplicateCandidates: z.array(z.string()),
    followUps: z.array(
      z.object({
        date: z.coerce.date(),
        message: z.string(),
        actionTaken: z.string().optional(),
      })
    ),
    escalationRecommended: z.boolean(),
    escalationReason: z.string().optional(),
  }),
});

/** Validate verification vote */
export const verificationSchema = z.object({
  vote: z.enum(["confirm", "reject"]),
  comment: z.string().max(500).optional(),
  location: z.object({
    type: z.literal("Point"),
    coordinates: z.tuple([z.number(), z.number()]),
  }),
});

/** Validate role update (admin) */
export const updateRoleSchema = z.object({
  role: z.enum(["citizen", "authority", "admin"]),
  department: z.string().optional(),
  jurisdiction: z.string().optional(),
});

/** Validate complaint status update */
export const updateStatusSchema = z.object({
  status: z.enum([
    "pending",
    "verified",
    "in_progress",
    "resolved",
    "escalated",
  ]),
  resolutionNotes: z.string().max(2000).optional(),
});

export type CreateComplaintInput = z.infer<typeof createComplaintSchema>;
export type VerificationInput = z.infer<typeof verificationSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
