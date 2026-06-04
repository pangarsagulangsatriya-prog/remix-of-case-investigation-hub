import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type StatusType = "draft" | "in_progress" | "in_review" | "approved" | "rejected" | "overdue" | "closed";

const statusConfig: Record<string, { label: string; className: string; title?: string; description?: string }> = {
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
  belum_mulai: { label: "Belum Mulai", className: "bg-slate-100 text-slate-600 border border-slate-200", title: "Status AI: Belum Mulai", description: "Sistem AI belum diinisialisasi atau belum memulai pemrosesan data untuk insiden ini. Menunggu perintah dari user." },
  ekstraksi_bukti: { label: "Ekstraksi Bukti", className: "bg-amber-500/10 text-amber-600 border border-amber-500/20", title: "Proses AI: Ekstraksi Bukti", description: "AI sedang membaca, memecah, dan mengekstrak data relevan dari seluruh dokumen serta file media bukti yang telah dilampirkan." },
  analisis_bukti: { label: "Analisis Bukti", className: "bg-blue-500/10 text-blue-600 border border-blue-500/20", title: "Proses AI: Analisis Mendalam", description: "Sistem AI sedang melakukan penalaran mendalam untuk menyusun kronologi fakta dan menganalisis aktor yang terlibat." },
  tersubmit: { label: "Tersubmit", className: "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20", title: "Status AI: Selesai", description: "Keseluruhan analisis otomatis oleh AI telah berhasil diselesaikan dan draf laporan investigasi siap untuk ditinjau." },
};

export function StatusChip({ status }: { status: string }) {
  const normalizedStatus = status?.toLowerCase() || "draft";
  const config = statusConfig[normalizedStatus] || statusConfig.draft;
  
  const chip = (
    <span className={cn("status-chip", config.description && "cursor-help", config.className)}>
      {config.label}
    </span>
  );

  if (!config.description) return chip;

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          {chip}
        </TooltipTrigger>
        <TooltipContent side="top" className="bg-white p-3.5 max-w-[280px] border border-slate-200 shadow-xl rounded-lg normal-case text-left">
          <div className="flex flex-col gap-1.5">
            <span className="text-[12px] font-bold text-slate-800 tracking-wide">{config.title || config.label}</span>
            <span className="text-xs font-medium text-slate-600 leading-relaxed">{config.description}</span>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
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
