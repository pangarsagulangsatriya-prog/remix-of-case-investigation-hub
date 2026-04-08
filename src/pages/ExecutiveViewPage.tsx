import { AppLayout } from "@/components/AppLayout";
import { StatusChip, SeverityChip } from "@/components/StatusChip";
import { ChevronRight } from "lucide-react";

export default function ExecutiveViewPage() {
  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        <div className="filter-bar">
          <span className="text-xs font-medium text-foreground">Executive Overview</span>
          <div className="flex-1" />
          <select className="text-xs border rounded px-2 py-1 bg-background"><option>Last 30 days</option></select>
          <select className="text-xs border rounded px-2 py-1 bg-background"><option>All Sites</option></select>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-4">
          {/* Summary cards */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "Open Investigations", value: "24", sub: "3 critical" },
              { label: "Finalized Reports", value: "18", sub: "this quarter" },
              { label: "Overdue Prevention Actions", value: "12", sub: "4 critical" },
              { label: "Cases by Severity", value: "6 / 10 / 8", sub: "Crit / High / Med" },
            ].map((c) => (
              <div key={c.label} className="metric-card">
                <div className="text-2xl font-semibold">{c.value}</div>
                <div className="text-xs text-muted-foreground">{c.label}</div>
                <div className="text-2xs text-muted-foreground mt-1">{c.sub}</div>
              </div>
            ))}
          </div>

          {/* Pipeline */}
          <div className="border rounded-md">
            <div className="px-3 py-2 border-b bg-surface-sunken">
              <span className="text-xs font-semibold">Investigation Pipeline</span>
            </div>
            <div className="p-4">
              <div className="flex gap-3">
                {[
                  { stage: "New / Draft", count: 4, color: "bg-status-draft" },
                  { stage: "Evidence Collection", count: 6, color: "bg-status-inprogress" },
                  { stage: "Analysis", count: 5, color: "bg-primary" },
                  { stage: "Report Drafting", count: 3, color: "bg-status-review" },
                  { stage: "Under Review", count: 4, color: "bg-severity-medium" },
                  { stage: "Approved", count: 2, color: "bg-status-approved" },
                ].map((s, i) => (
                  <div key={s.stage} className="flex items-center gap-2">
                    <div className="text-center">
                      <div className={`${s.color} text-primary-foreground rounded px-4 py-3 text-lg font-semibold min-w-[60px]`}>
                        {s.count}
                      </div>
                      <div className="text-2xs text-muted-foreground mt-1">{s.stage}</div>
                    </div>
                    {i < 5 && <ChevronRight className="h-4 w-4 text-border" />}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Reports ready */}
          <div className="border rounded-md">
            <div className="px-3 py-2 border-b bg-surface-sunken">
              <span className="text-xs font-semibold">Reports Ready for Management Review</span>
            </div>
            <table className="w-full enterprise-table">
              <thead>
                <tr>
                  <th>Report</th>
                  <th>Case</th>
                  <th>Type</th>
                  <th>Severity</th>
                  <th>Status</th>
                  <th>Owner</th>
                  <th>Submitted</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { report: "RPT-0088", case: "Near miss - haul truck", type: "Internal", severity: "high" as const, status: "in_review" as const, owner: "John Doe", submitted: "4h ago" },
                  { report: "RPT-0087", case: "Near miss - haul truck", type: "Final", severity: "high" as const, status: "in_review" as const, owner: "John Doe", submitted: "6h ago" },
                  { report: "RPT-0084", case: "Vehicle rollover - access road", type: "Initial", severity: "critical" as const, status: "in_review" as const, owner: "Sarah Chen", submitted: "3d ago" },
                ].map((r) => (
                  <tr key={r.report} className="cursor-pointer">
                    <td className="font-mono text-xs text-primary">{r.report}</td>
                    <td className="text-xs">{r.case}</td>
                    <td className="text-xs text-muted-foreground">{r.type}</td>
                    <td><SeverityChip severity={r.severity} /></td>
                    <td><StatusChip status={r.status} /></td>
                    <td className="text-xs">{r.owner}</td>
                    <td className="text-xs text-muted-foreground">{r.submitted}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
