import { AppLayout } from "@/components/AppLayout";
import { StatusChip, SeverityChip } from "@/components/StatusChip";

const reviewQueue = [
  { caseId: "CS-2026-0147", title: "Conveyor belt failure - Zone B", type: "Extraction Review", items: 8, severity: "critical" as const, requestedBy: "System (AI)", requestedAt: "2h ago", status: "in_review" as const },
  { caseId: "CS-2026-0145", title: "Chemical spill - processing plant", type: "Report Approval", items: 1, severity: "high" as const, requestedBy: "Maria Santos", requestedAt: "4h ago", status: "in_review" as const },
  { caseId: "CS-2026-0146", title: "Near miss - haul truck intersection", type: "Analysis Review", items: 3, severity: "high" as const, requestedBy: "System (AI)", requestedAt: "6h ago", status: "in_review" as const },
  { caseId: "CS-2026-0142", title: "Ground control failure", type: "Report Revision", items: 1, severity: "high" as const, requestedBy: "Director HSE", requestedAt: "1d ago", status: "in_review" as const },
  { caseId: "CS-2026-0141", title: "Vehicle rollover - access road", type: "Final Approval", items: 1, severity: "critical" as const, requestedBy: "Sarah Chen", requestedAt: "2d ago", status: "in_review" as const },
];

export default function ReviewApprovalPage() {
  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        <div className="filter-bar">
          <span className="text-xs font-medium text-foreground">Review & Approval Queue</span>
          <div className="flex-1" />
          <select className="text-xs border rounded px-2 py-1 bg-background"><option>All Types</option></select>
          <select className="text-xs border rounded px-2 py-1 bg-background"><option>All Severities</option></select>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-4 gap-3 p-4">
          {[
            { label: "Pending Review", value: "5" },
            { label: "Extraction Reviews", value: "1" },
            { label: "Report Approvals", value: "2" },
            { label: "Analysis Reviews", value: "2" },
          ].map((c) => (
            <div key={c.label} className="metric-card">
              <div className="text-xl font-semibold">{c.value}</div>
              <div className="text-xs text-muted-foreground">{c.label}</div>
            </div>
          ))}
        </div>

        <div className="flex-1 overflow-auto px-4 pb-4">
          <table className="w-full enterprise-table border rounded-md overflow-hidden">
            <thead>
              <tr>
                <th>Case ID</th>
                <th>Case Title</th>
                <th>Review Type</th>
                <th>Items</th>
                <th>Severity</th>
                <th>Requested By</th>
                <th>Requested</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {reviewQueue.map((r) => (
                <tr key={`${r.caseId}-${r.type}`} className="cursor-pointer">
                  <td className="font-mono text-xs text-primary">{r.caseId}</td>
                  <td className="text-xs max-w-[200px] truncate">{r.title}</td>
                  <td className="text-xs font-medium">{r.type}</td>
                  <td className="text-xs text-center">{r.items}</td>
                  <td><SeverityChip severity={r.severity} /></td>
                  <td className="text-xs text-muted-foreground">{r.requestedBy}</td>
                  <td className="text-xs text-muted-foreground">{r.requestedAt}</td>
                  <td><StatusChip status={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
