import { AppLayout } from "@/components/AppLayout";
import { StatusChip, SeverityChip } from "@/components/StatusChip";
import {
  FolderSearch,
  AlertTriangle,
  Clock,
  FileCheck,
  FileSearch,
  ChevronRight,
  MessageSquare,
} from "lucide-react";

const summaryCards = [
  { label: "Open Cases", value: "24", icon: FolderSearch, change: "+3 this week" },
  { label: "In Review", value: "8", icon: FileSearch, change: "2 overdue" },
  { label: "Awaiting Approval", value: "5", icon: FileCheck, change: "1 urgent" },
  { label: "Overdue Actions", value: "12", icon: AlertTriangle, change: "4 critical" },
  { label: "Pending Extraction", value: "31", icon: Clock, change: "from 6 cases" },
];

const recentCases = [
  { id: "CS-2026-0147", title: "Conveyor belt failure - Zone B", site: "Site Alpha", severity: "critical" as const, owner: "Sarah Chen", status: "in_progress" as const, updated: "2h ago" },
  { id: "CS-2026-0146", title: "Near miss - haul truck intersection", site: "Site Alpha", severity: "high" as const, owner: "John Doe", status: "in_review" as const, updated: "4h ago" },
  { id: "CS-2026-0145", title: "Chemical spill - processing plant", site: "Site Beta", severity: "high" as const, owner: "Maria Santos", status: "in_progress" as const, updated: "6h ago" },
  { id: "CS-2026-0144", title: "Scaffolding collapse - Pit 3", site: "Site Alpha", severity: "critical" as const, owner: "Ahmed Khan", status: "draft" as const, updated: "1d ago" },
  { id: "CS-2026-0143", title: "Electrical arc flash incident", site: "Site Gamma", severity: "medium" as const, owner: "Lisa Park", status: "approved" as const, updated: "1d ago" },
  { id: "CS-2026-0142", title: "Ground control failure", site: "Site Beta", severity: "high" as const, owner: "John Doe", status: "in_review" as const, updated: "2d ago" },
];

const pendingReviews = [
  { case: "CS-2026-0146", type: "Extraction Review", items: 14, from: "AI Agent" },
  { case: "CS-2026-0145", type: "Report Approval", items: 1, from: "Maria Santos" },
  { case: "CS-2026-0144", type: "Analysis Review", items: 3, from: "AI Agent" },
  { case: "CS-2026-0141", type: "Report Revision", items: 1, from: "Manager" },
];

const recentComments = [
  { user: "Sarah Chen", case: "CS-0147", text: "Evidence extraction complete, 3 items flagged low confidence", time: "1h ago" },
  { user: "Ahmed Khan", case: "CS-0144", text: "Added 4 new photo evidence from site inspection", time: "3h ago" },
  { user: "Lisa Park", case: "CS-0143", text: "Final report approved by management", time: "5h ago" },
];

export default function DashboardPage() {
  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        {/* Filter bar */}
        <div className="filter-bar">
          <span className="text-xs font-medium text-foreground">Dashboard</span>
          <div className="flex-1" />
          <select className="text-xs border rounded px-2 py-1 bg-background">
            <option>Last 30 days</option>
            <option>Last 7 days</option>
            <option>Last 90 days</option>
          </select>
          <select className="text-xs border rounded px-2 py-1 bg-background">
            <option>All Sites</option>
            <option>Site Alpha</option>
            <option>Site Beta</option>
          </select>
          <select className="text-xs border rounded px-2 py-1 bg-background">
            <option>All Severities</option>
            <option>Critical</option>
            <option>High</option>
          </select>
        </div>

        <div className="flex-1 overflow-auto">
          {/* Summary cards */}
          <div className="grid grid-cols-5 gap-3 p-4">
            {summaryCards.map((card) => (
              <div key={card.label} className="metric-card cursor-pointer hover:border-primary/30 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <card.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-2xs text-muted-foreground">{card.change}</span>
                </div>
                <div className="text-2xl font-semibold text-foreground">{card.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{card.label}</div>
              </div>
            ))}
          </div>

          <div className="flex gap-0 flex-1 px-4 pb-4">
            {/* Main content */}
            <div className="flex-1 min-w-0">
              {/* Case status mini chart */}
              <div className="border rounded-md mb-3">
                <div className="flex items-center justify-between px-3 py-2 border-b bg-surface-sunken">
                  <span className="text-xs font-semibold text-foreground">Case Status Distribution</span>
                </div>
                <div className="p-3">
                  <div className="flex gap-1 h-5 rounded overflow-hidden">
                    <div className="bg-status-draft" style={{ width: "15%" }} title="Draft: 4" />
                    <div className="bg-status-inprogress" style={{ width: "35%" }} title="In Progress: 8" />
                    <div className="bg-status-review" style={{ width: "25%" }} title="In Review: 6" />
                    <div className="bg-status-approved" style={{ width: "15%" }} title="Approved: 4" />
                    <div className="bg-muted-foreground/30" style={{ width: "10%" }} title="Closed: 2" />
                  </div>
                  <div className="flex gap-4 mt-2">
                    {[
                      { label: "Draft", color: "bg-status-draft", count: 4 },
                      { label: "In Progress", color: "bg-status-inprogress", count: 8 },
                      { label: "In Review", color: "bg-status-review", count: 6 },
                      { label: "Approved", color: "bg-status-approved", count: 4 },
                      { label: "Closed", color: "bg-muted-foreground/30", count: 2 },
                    ].map((s) => (
                      <div key={s.label} className="flex items-center gap-1.5">
                        <div className={`h-2 w-2 rounded-sm ${s.color}`} />
                        <span className="text-2xs text-muted-foreground">{s.label} ({s.count})</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent cases table */}
              <div className="border rounded-md">
                <div className="flex items-center justify-between px-3 py-2 border-b bg-surface-sunken">
                  <span className="text-xs font-semibold text-foreground">Recent Cases</span>
                  <button className="text-2xs text-primary hover:underline flex items-center gap-0.5">
                    View all <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
                <table className="w-full enterprise-table">
                  <thead>
                    <tr>
                      <th>Case ID</th>
                      <th>Title</th>
                      <th>Site</th>
                      <th>Severity</th>
                      <th>Owner</th>
                      <th>Status</th>
                      <th>Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentCases.map((c) => (
                      <tr key={c.id} className="cursor-pointer">
                        <td className="font-mono text-xs text-primary">{c.id}</td>
                        <td className="text-xs max-w-[200px] truncate">{c.title}</td>
                        <td className="text-xs text-muted-foreground">{c.site}</td>
                        <td><SeverityChip severity={c.severity} /></td>
                        <td className="text-xs">{c.owner}</td>
                        <td><StatusChip status={c.status} /></td>
                        <td className="text-xs text-muted-foreground">{c.updated}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right panel */}
            <div className="w-72 ml-3 space-y-3 shrink-0">
              {/* Pending reviews */}
              <div className="border rounded-md">
                <div className="px-3 py-2 border-b bg-surface-sunken">
                  <span className="text-xs font-semibold text-foreground">Pending Reviews</span>
                </div>
                <div className="divide-y">
                  {pendingReviews.map((r, i) => (
                    <div key={i} className="px-3 py-2 hover:bg-row-hover cursor-pointer">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-primary">{r.case}</span>
                        <span className="text-2xs text-muted-foreground">{r.items} item{r.items > 1 ? "s" : ""}</span>
                      </div>
                      <div className="text-xs text-foreground mt-0.5">{r.type}</div>
                      <div className="text-2xs text-muted-foreground">From: {r.from}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent comments */}
              <div className="border rounded-md">
                <div className="px-3 py-2 border-b bg-surface-sunken">
                  <span className="text-xs font-semibold text-foreground">Recent Activity</span>
                </div>
                <div className="divide-y">
                  {recentComments.map((c, i) => (
                    <div key={i} className="px-3 py-2">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <MessageSquare className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs font-medium">{c.user}</span>
                        <span className="text-2xs text-muted-foreground">on {c.case}</span>
                        <span className="text-2xs text-muted-foreground ml-auto">{c.time}</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{c.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
