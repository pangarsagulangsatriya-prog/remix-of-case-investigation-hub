import { cn } from "@/lib/utils";

type StatusType = "draft" | "in_progress" | "in_review" | "approved" | "rejected" | "overdue" | "closed";

const statusConfig: Record<string, { label: string; className: string }> = {
  open: { label: "Open", className: "bg-emerald-500/10 text-emerald-600" },
  draft: { label: "Draft", className: "bg-muted text-status-draft" },
  in_progress: { label: "In Progress", className: "bg-status-inprogress/10 text-status-inprogress" },
  in_review: { label: "In Review", className: "bg-status-review/10 text-status-review" },
  approved: { label: "Approved", className: "bg-status-approved/10 text-status-approved" },
  rejected: { label: "Rejected", className: "bg-status-rejected/10 text-status-rejected" },
  overdue: { label: "Overdue", className: "bg-destructive/10 text-destructive" },
  closed: { label: "Closed", className: "bg-muted text-muted-foreground" },
  pending: { label: "Pending", className: "bg-status-review/10 text-status-review" },
  archived: { label: "Archived", className: "bg-slate-100 text-slate-500" },
};

export function StatusChip({ status }: { status: string }) {
  const normalizedStatus = status?.toLowerCase() || "draft";
  const config = statusConfig[normalizedStatus] || statusConfig.draft;
  
  return (
    <span className={cn("status-chip", config.className)}>
      {config.label}
    </span>
  );
}

type SeverityType = "critical" | "high" | "medium" | "low";

const severityConfig: Record<SeverityType, { label: string; className: string }> = {
  critical: { label: "Critical", className: "bg-severity-critical/10 text-severity-critical" },
  high: { label: "High", className: "bg-severity-high/10 text-severity-high" },
  medium: { label: "Medium", className: "bg-severity-medium/10 text-severity-medium" },
  low: { label: "Low", className: "bg-severity-low/10 text-severity-low" },
};

export function SeverityChip({ severity }: { severity: string }) {
  const normalizedSeverity = (severity?.toLowerCase() || "medium") as SeverityType;
  const config = severityConfig[normalizedSeverity] || severityConfig.medium;

  return (
    <span className={cn("severity-chip", config.className)}>
      {config.label}
    </span>
  );
}

export function ConfidenceChip({ level }: { level: "high" | "medium" | "low" }) {
  const colors = {
    high: "text-confidence-high",
    medium: "text-confidence-medium",
    low: "text-confidence-low",
  };
  return (
    <span className={cn("text-xs font-medium", colors[level])}>
      {level === "high" ? "High" : level === "medium" ? "Med" : "Low"}
    </span>
  );
}
