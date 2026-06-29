import { ComplaintCategory, Severity, ComplaintStatus } from "@/types/complaint";

/** Application-wide constants */
export const APP_NAME = "Civora";
export const APP_TAGLINE = "See. Understand. Resolve.";
export const APP_DESCRIPTION =
  "AI-Powered Civic Intelligence Platform that enables citizens to identify, report, validate, track, and resolve community issues.";
export const CORA_NAME = "CORA";
export const CORA_FULL_NAME = "Civic Operations & Resolution Assistant";

/** Complaint categories with display labels and icons */
export const COMPLAINT_CATEGORIES: Record<
  ComplaintCategory,
  { label: string; icon: string; department: string }
> = {
  road_damage: {
    label: "Road Damage",
    icon: "construction",
    department: "Public Works Department",
  },
  water_supply: {
    label: "Water Supply",
    icon: "droplets",
    department: "Water Supply Board",
  },
  sewage: {
    label: "Sewage",
    icon: "waves",
    department: "Sewage & Drainage",
  },
  streetlight: {
    label: "Streetlight",
    icon: "lightbulb",
    department: "Electrical Department",
  },
  garbage: {
    label: "Garbage",
    icon: "trash-2",
    department: "Sanitation Department",
  },
  encroachment: {
    label: "Encroachment",
    icon: "shield-alert",
    department: "Municipal Corporation",
  },
  noise_pollution: {
    label: "Noise Pollution",
    icon: "volume-x",
    department: "Environmental Department",
  },
  public_safety: {
    label: "Public Safety",
    icon: "shield",
    department: "Safety & Security",
  },
  parks_recreation: {
    label: "Parks & Recreation",
    icon: "trees",
    department: "Parks Department",
  },
  other: {
    label: "Other",
    icon: "circle-help",
    department: "General Administration",
  },
};

/** Severity levels with display info */
export const SEVERITY_LEVELS: Record<
  Severity,
  { label: string; description: string; priority: number }
> = {
  low: {
    label: "Low",
    description: "Minor issue, no immediate danger",
    priority: 1,
  },
  medium: {
    label: "Medium",
    description: "Moderate issue, needs attention soon",
    priority: 2,
  },
  high: {
    label: "High",
    description: "Significant issue, affects many people",
    priority: 3,
  },
  critical: {
    label: "Critical",
    description: "Urgent, poses immediate danger",
    priority: 4,
  },
};

/** Status workflow with display info */
export const COMPLAINT_STATUSES: Record<
  ComplaintStatus,
  { label: string; description: string }
> = {
  pending: {
    label: "Pending",
    description: "Waiting for community verification",
  },
  verified: {
    label: "Verified",
    description: "Confirmed by community members",
  },
  in_progress: {
    label: "In Progress",
    description: "Being addressed by authorities",
  },
  resolved: {
    label: "Resolved",
    description: "Issue has been resolved",
  },
  escalated: {
    label: "Escalated",
    description: "Escalated due to urgency or inaction",
  },
};

/** Departments list */
export const DEPARTMENTS = [
  "Public Works Department",
  "Water Supply Board",
  "Sewage & Drainage",
  "Electrical Department",
  "Sanitation Department",
  "Municipal Corporation",
  "Environmental Department",
  "Safety & Security",
  "Parks Department",
  "General Administration",
] as const;

/** Pagination defaults */
export const DEFAULT_PAGE_SIZE = 12;
export const MAX_PAGE_SIZE = 50;

/** Map defaults */
export const DEFAULT_MAP_CENTER = { lat: 12.9716, lng: 77.5946 }; // Bangalore
export const DEFAULT_MAP_ZOOM = 13;
export const NEARBY_RADIUS_KM = 5;

/** Verification thresholds */
export const VERIFICATION_THRESHOLD = 3; // Minimum confirms to auto-verify
export const PROXIMITY_RADIUS_KM = 2; // Max distance for community verification

/** Reputation points */
export const REPUTATION_POINTS = {
  REPORT_SUBMITTED: 5,
  REPORT_VERIFIED: 10,
  VERIFICATION_VOTE: 2,
  CORRECT_VOTE: 3,
} as const;
