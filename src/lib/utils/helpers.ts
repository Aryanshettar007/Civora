import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind classes with conflict resolution.
 * Combines clsx for conditional classes + tailwind-merge for deduplication.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date to a human-readable relative string.
 * e.g., "2 hours ago", "3 days ago", "just now"
 */
export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const target = new Date(date);
  const diffMs = now.getTime() - target.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return "just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;

  return target.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: target.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

/**
 * Format a date to a standard display format.
 */
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Capitalize first letter of a string.
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Format a category slug to display text.
 * e.g., "road_damage" → "Road Damage"
 */
export function formatCategory(category: string): string {
  return category
    .split("_")
    .map((word) => capitalize(word))
    .join(" ");
}

/**
 * Get severity color class.
 */
export function getSeverityColor(severity: string): string {
  const colors: Record<string, string> = {
    low: "text-severity-low",
    medium: "text-severity-medium",
    high: "text-severity-high",
    critical: "text-severity-critical",
  };
  return colors[severity] || "text-muted-foreground";
}

/**
 * Get severity background class.
 */
export function getSeverityBg(severity: string): string {
  const colors: Record<string, string> = {
    low: "bg-severity-low/10 text-severity-low",
    medium: "bg-severity-medium/10 text-severity-medium",
    high: "bg-severity-high/10 text-severity-high",
    critical: "bg-severity-critical/10 text-severity-critical",
  };
  return colors[severity] || "bg-muted text-muted-foreground";
}

/**
 * Get status color class.
 */
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: "bg-warning/10 text-warning",
    verified: "bg-info/10 text-info",
    in_progress: "bg-primary/10 text-primary",
    resolved: "bg-success/10 text-success",
    escalated: "bg-danger/10 text-danger",
  };
  return colors[status] || "bg-muted text-muted-foreground";
}

/**
 * Truncate text to a max length with ellipsis.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
}

/**
 * Sleep utility for animations / delays.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
