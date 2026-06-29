/** Standard API response wrapper */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/** Paginated response */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

/** Complaint list query params */
export interface ComplaintQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  category?: string;
  severity?: string;
  lat?: number;
  lng?: number;
  radius?: number; // km
  sortBy?: "createdAt" | "impactScore" | "severity";
  sortOrder?: "asc" | "desc";
}

/** Analytics dashboard data */
export interface DashboardAnalytics {
  totalComplaints: number;
  pending: number;
  inProgress: number;
  resolved: number;
  escalated: number;
  resolutionRate: number;
  avgResolutionDays: number;
  categoryCounts: Record<string, number>;
  severityCounts: Record<string, number>;
  recentActivity: ActivityItem[];
  trendData: TrendPoint[];
}

export interface ActivityItem {
  id: string;
  type: "created" | "verified" | "status_changed" | "resolved" | "escalated";
  complaintTitle: string;
  complaintId: string;
  userName: string;
  timestamp: Date;
  details?: string;
}

export interface TrendPoint {
  date: string;
  count: number;
  resolved: number;
}
