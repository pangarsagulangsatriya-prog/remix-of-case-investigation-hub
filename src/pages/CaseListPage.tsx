import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { StatusChip, SeverityChip } from "@/components/StatusChip";
import { Plus, Download, Filter, X, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const cases = [
  { id: "CS-2026-0147", title: "Conveyor belt failure - Zone B", site: "Site Alpha", incidentDate: "2026-04-05", severity: "critical" as const, status: "in_progress" as const, owner: "Sarah Chen", evidenceCount: 12, reportsCount: 1, pendingReview: 3, updated: "2h ago" },
  { id: "CS-2026-0146", title: "Near miss - haul truck intersection", site: "Site Alpha", incidentDate: "2026-04-04", severity: "high" as const, status: "in_review" as const, owner: "John Doe", evidenceCount: 8, reportsCount: 2, pendingReview: 0, updated: "4h ago" },
  { id: "CS-2026-0145", title: "Chemical spill - processing plant", site: "Site Beta", incidentDate: "2026-04-03", severity: "high" as const, status: "in_progress" as const, owner: "Maria Santos", evidenceCount: 15, reportsCount: 0, pendingReview: 5, updated: "6h ago" },
  { id: "CS-2026-0144", title: "Scaffolding collapse - Pit 3", site: "Site Alpha", incidentDate: "2026-04-02", severity: "critical" as const, status: "draft" as const, owner: "Ahmed Khan", evidenceCount: 6, reportsCount: 0, pendingReview: 0, updated: "1d ago" },
  { id: "CS-2026-0143", title: "Electrical arc flash incident", site: "Site Gamma", incidentDate: "2026-04-01", severity: "medium" as const, status: "approved" as const, owner: "Lisa Park", evidenceCount: 10, reportsCount: 3, pendingReview: 0, updated: "1d ago" },
  { id: "CS-2026-0142", title: "Ground control failure", site: "Site Beta", incidentDate: "2026-03-30", severity: "high" as const, status: "in_review" as const, owner: "John Doe", evidenceCount: 9, reportsCount: 1, pendingReview: 2, updated: "2d ago" },
  { id: "CS-2026-0141", title: "Vehicle rollover - access road", site: "Site Alpha", incidentDate: "2026-03-28", severity: "critical" as const, status: "in_review" as const, owner: "Sarah Chen", evidenceCount: 20, reportsCount: 2, pendingReview: 1, updated: "3d ago" },
  { id: "CS-2026-0140", title: "Dust exposure exceedance", site: "Site Gamma", incidentDate: "2026-03-27", severity: "medium" as const, status: "approved" as const, owner: "Lisa Park", evidenceCount: 5, reportsCount: 1, pendingReview: 0, updated: "4d ago" },
  { id: "CS-2026-0139", title: "Crane load drop near miss", site: "Site Alpha", incidentDate: "2026-03-25", severity: "high" as const, status: "closed" as const, owner: "Ahmed Khan", evidenceCount: 14, reportsCount: 2, pendingReview: 0, updated: "5d ago" },
  { id: "CS-2026-0138", title: "Fatigue-related driving incident", site: "Site Beta", incidentDate: "2026-03-24", severity: "medium" as const, status: "approved" as const, owner: "Maria Santos", evidenceCount: 7, reportsCount: 1, pendingReview: 0, updated: "6d ago" },
];

export default function CaseListPage() {
  const navigate = useNavigate();
  const [selectedCase, setSelectedCase] = useState<typeof cases[0] | null>(null);

  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        {/* Toolbar */}
        <div className="filter-bar justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-foreground">Investigation Cases</span>
            <span className="text-2xs text-muted-foreground">({cases.length})</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
              <Filter className="h-3 w-3" /> Filters
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
              <Download className="h-3 w-3" /> Export
            </Button>
            <Button size="sm" className="h-7 text-xs gap-1" onClick={() => navigate("/cases/new")}>
              <Plus className="h-3 w-3" /> Create Case
            </Button>
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex items-center gap-2 px-4 py-1.5 border-b bg-background">
          <select className="text-xs border rounded px-2 py-1 bg-background">
            <option>All Sites</option>
          </select>
          <select className="text-xs border rounded px-2 py-1 bg-background">
            <option>All Severities</option>
          </select>
          <select className="text-xs border rounded px-2 py-1 bg-background">
            <option>All Statuses</option>
          </select>
          <select className="text-xs border rounded px-2 py-1 bg-background">
            <option>All Owners</option>
          </select>
        </div>

        {/* Table + side panel */}
        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-auto">
            <table className="w-full enterprise-table">
              <thead>
                <tr>
                  <th>Case ID</th>
                  <th>Title</th>
                  <th>Site</th>
                  <th>Incident Date</th>
                  <th>Severity</th>
                  <th>Status</th>
                  <th>Owner</th>
                  <th className="text-center">Evidence</th>
                  <th className="text-center">Reports</th>
                  <th className="text-center">Pending</th>
                  <th>Updated</th>
                </tr>
              </thead>
              <tbody>
                {cases.map((c) => (
                  <tr
                    key={c.id}
                    className={`cursor-pointer ${selectedCase?.id === c.id ? "active" : ""}`}
                    onClick={() => setSelectedCase(c)}
                    onDoubleClick={() => navigate(`/cases/${c.id}`)}
                  >
                    <td className="font-mono text-xs text-primary">{c.id}</td>
                    <td className="text-xs max-w-[220px] truncate">{c.title}</td>
                    <td className="text-xs text-muted-foreground">{c.site}</td>
                    <td className="text-xs text-muted-foreground">{c.incidentDate}</td>
                    <td><SeverityChip severity={c.severity} /></td>
                    <td><StatusChip status={c.status} /></td>
                    <td className="text-xs">{c.owner}</td>
                    <td className="text-xs text-center text-muted-foreground">{c.evidenceCount}</td>
                    <td className="text-xs text-center text-muted-foreground">{c.reportsCount}</td>
                    <td className="text-xs text-center">
                      {c.pendingReview > 0 ? (
                        <span className="text-status-review font-medium">{c.pendingReview}</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="text-xs text-muted-foreground">{c.updated}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Side panel */}
          {selectedCase && (
            <div className="side-panel w-80 shrink-0">
              <div className="flex items-center justify-between px-4 py-3 border-b bg-surface-sunken">
                <span className="text-xs font-semibold">Case Preview</span>
                <button onClick={() => setSelectedCase(null)} className="text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <span className="font-mono text-xs text-primary">{selectedCase.id}</span>
                  <h3 className="text-sm font-medium mt-1">{selectedCase.title}</h3>
                </div>
                <div className="flex gap-2">
                  <SeverityChip severity={selectedCase.severity} />
                  <StatusChip status={selectedCase.status} />
                </div>
                <div className="space-y-2">
                  {[
                    ["Site", selectedCase.site],
                    ["Incident Date", selectedCase.incidentDate],
                    ["Owner", selectedCase.owner],
                    ["Evidence", `${selectedCase.evidenceCount} files`],
                    ["Reports", `${selectedCase.reportsCount}`],
                    ["Updated", selectedCase.updated],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between">
                      <span className="text-xs text-muted-foreground">{label}</span>
                      <span className="text-xs font-medium">{value}</span>
                    </div>
                  ))}
                </div>
                {/* Progress */}
                <div>
                  <span className="section-header">Investigation Progress</span>
                  <div className="space-y-1.5">
                    {[
                      { step: "Evidence Uploaded", done: true },
                      { step: "Extraction Reviewed", done: selectedCase.status !== "draft" },
                      { step: "Analysis Completed", done: selectedCase.status === "in_review" || selectedCase.status === "approved" },
                      { step: "Report Drafted", done: selectedCase.reportsCount > 0 },
                      { step: "Under Review", done: selectedCase.status === "in_review" || selectedCase.status === "approved" },
                      { step: "Approved", done: selectedCase.status === "approved" },
                    ].map((s) => (
                      <div key={s.step} className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${s.done ? "bg-status-approved" : "bg-border"}`} />
                        <span className={`text-xs ${s.done ? "text-foreground" : "text-muted-foreground"}`}>{s.step}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full h-7 text-xs gap-1"
                  onClick={() => navigate(`/cases/${selectedCase.id}`)}
                >
                  Open Case <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
