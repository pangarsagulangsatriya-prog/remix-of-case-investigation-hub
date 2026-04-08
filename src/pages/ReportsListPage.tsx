import { AppLayout } from "@/components/AppLayout";
import { StatusChip } from "@/components/StatusChip";
import { Download, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

const reports = [
  { id: "RPT-0089", caseId: "CS-2026-0147", title: "Initial Investigation Report", type: "Initial", version: "v1.2", status: "draft" as const, owner: "Sarah Chen", approvedBy: "—", updated: "2h ago" },
  { id: "RPT-0088", caseId: "CS-2026-0146", title: "Internal Review Report", type: "Internal", version: "v2.0", status: "in_review" as const, owner: "John Doe", approvedBy: "—", updated: "4h ago" },
  { id: "RPT-0087", caseId: "CS-2026-0146", title: "Final Investigation Report", type: "Final", version: "v1.0", status: "in_review" as const, owner: "John Doe", approvedBy: "—", updated: "6h ago" },
  { id: "RPT-0086", caseId: "CS-2026-0143", title: "Management Summary", type: "Summary", version: "v1.0", status: "approved" as const, owner: "Lisa Park", approvedBy: "Director HSE", updated: "1d ago" },
  { id: "RPT-0085", caseId: "CS-2026-0143", title: "Final Investigation Report", type: "Final", version: "v3.1", status: "approved" as const, owner: "Lisa Park", approvedBy: "Director HSE", updated: "1d ago" },
  { id: "RPT-0084", caseId: "CS-2026-0141", title: "Initial Investigation Report", type: "Initial", version: "v1.0", status: "in_review" as const, owner: "Sarah Chen", approvedBy: "—", updated: "3d ago" },
];

export default function ReportsListPage() {
  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        <div className="filter-bar justify-between">
          <span className="text-xs font-medium text-foreground">Global Reports</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
              <Filter className="h-3 w-3" /> Filters
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
              <Download className="h-3 w-3" /> Export
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-1.5 border-b bg-background">
          <select className="text-xs border rounded px-2 py-1 bg-background"><option>All Types</option></select>
          <select className="text-xs border rounded px-2 py-1 bg-background"><option>All Statuses</option></select>
          <select className="text-xs border rounded px-2 py-1 bg-background"><option>All Sites</option></select>
          <select className="text-xs border rounded px-2 py-1 bg-background"><option>All Owners</option></select>
        </div>
        <div className="flex-1 overflow-auto">
          <table className="w-full enterprise-table">
            <thead>
              <tr>
                <th>Report ID</th>
                <th>Case ID</th>
                <th>Title</th>
                <th>Type</th>
                <th>Version</th>
                <th>Status</th>
                <th>Owner</th>
                <th>Approved By</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.id} className="cursor-pointer">
                  <td className="font-mono text-xs text-primary">{r.id}</td>
                  <td className="font-mono text-xs text-muted-foreground">{r.caseId}</td>
                  <td className="text-xs">{r.title}</td>
                  <td className="text-xs text-muted-foreground">{r.type}</td>
                  <td className="text-xs text-muted-foreground">{r.version}</td>
                  <td><StatusChip status={r.status} /></td>
                  <td className="text-xs">{r.owner}</td>
                  <td className="text-xs text-muted-foreground">{r.approvedBy}</td>
                  <td className="text-xs text-muted-foreground">{r.updated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
