import { AppLayout } from "@/components/AppLayout";
import { StatusChip } from "@/components/StatusChip";

const analysisRuns = [
  { runId: "RUN-047", case: "CS-2026-0147", agent: "Fact & Chronology", triggeredBy: "Sarah Chen", status: "completed", reviewed: "reviewed", created: "2h ago" },
  { runId: "RUN-046", case: "CS-2026-0147", agent: "PEEPO Reasoning", triggeredBy: "Sarah Chen", status: "completed", reviewed: "draft", created: "2h ago" },
  { runId: "RUN-045", case: "CS-2026-0147", agent: "IPLS Classification", triggeredBy: "Auto-chain", status: "completed", reviewed: "draft", created: "1h ago" },
  { runId: "RUN-044", case: "CS-2026-0147", agent: "Prevention Action", triggeredBy: "Auto-chain", status: "completed", reviewed: "draft", created: "1h ago" },
  { runId: "RUN-040", case: "CS-2026-0146", agent: "Fact & Chronology", triggeredBy: "John Doe", status: "completed", reviewed: "reviewed", created: "1d ago" },
  { runId: "RUN-039", case: "CS-2026-0146", agent: "PEEPO Reasoning", triggeredBy: "John Doe", status: "completed", reviewed: "reviewed", created: "1d ago" },
];

export default function AnalysisGlobalPage() {
  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        <div className="filter-bar">
          <span className="text-xs font-medium text-foreground">Global Analysis Runs</span>
          <div className="flex-1" />
          <select className="text-xs border rounded px-2 py-1 bg-background"><option>All Agents</option></select>
          <select className="text-xs border rounded px-2 py-1 bg-background"><option>All Cases</option></select>
          <select className="text-xs border rounded px-2 py-1 bg-background"><option>All Statuses</option></select>
        </div>
        <div className="flex-1 overflow-auto">
          <table className="w-full enterprise-table">
            <thead>
              <tr>
                <th>Run ID</th>
                <th>Case</th>
                <th>Agent</th>
                <th>Triggered By</th>
                <th>Status</th>
                <th>Reviewed</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {analysisRuns.map((r) => (
                <tr key={r.runId} className="cursor-pointer">
                  <td className="font-mono text-xs text-primary">{r.runId}</td>
                  <td className="font-mono text-xs text-primary">{r.case}</td>
                  <td className="text-xs">{r.agent}</td>
                  <td className="text-xs text-muted-foreground">{r.triggeredBy}</td>
                  <td>
                    <span className="status-chip bg-status-approved/10 text-status-approved">{r.status}</span>
                  </td>
                  <td>
                    <span className={`status-chip ${r.reviewed === "reviewed" ? "bg-status-approved/10 text-status-approved" : "bg-muted text-muted-foreground"}`}>
                      {r.reviewed}
                    </span>
                  </td>
                  <td className="text-xs text-muted-foreground">{r.created}</td>
                  <td><button className="text-2xs text-primary hover:underline">View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
