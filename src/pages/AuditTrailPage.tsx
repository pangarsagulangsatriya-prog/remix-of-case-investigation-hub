import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { X } from "lucide-react";

const auditLog = [
  { timestamp: "2026-04-08 10:15:32", user: "System", role: "AI Agent", action: "Analysis Completed", objectType: "Analysis", objectName: "PEEPO Reasoning - RUN-046", prevState: "running", newState: "completed", caseId: "CS-2026-0147" },
  { timestamp: "2026-04-08 10:12:01", user: "System", role: "AI Agent", action: "Analysis Started", objectType: "Analysis", objectName: "PEEPO Reasoning - RUN-046", prevState: "—", newState: "running", caseId: "CS-2026-0147" },
  { timestamp: "2026-04-08 09:45:18", user: "Sarah Chen", role: "Investigator", action: "Extraction Reviewed", objectType: "Extraction", objectName: "6 items accepted", prevState: "pending", newState: "reviewed", caseId: "CS-2026-0147" },
  { timestamp: "2026-04-08 09:30:42", user: "System", role: "AI Agent", action: "Extraction Completed", objectType: "Evidence", objectName: "incident_report_initial.pdf", prevState: "processing", newState: "extracted", caseId: "CS-2026-0147" },
  { timestamp: "2026-04-08 08:00:15", user: "Ahmed Khan", role: "Investigator", action: "Evidence Uploaded", objectType: "Evidence", objectName: "4 files uploaded", prevState: "—", newState: "uploaded", caseId: "CS-2026-0147" },
  { timestamp: "2026-04-07 16:30:00", user: "John Doe", role: "Manager", action: "Case Assigned", objectType: "Case", objectName: "CS-2026-0147", prevState: "unassigned", newState: "assigned to Sarah Chen", caseId: "CS-2026-0147" },
  { timestamp: "2026-04-07 16:00:00", user: "John Doe", role: "Manager", action: "Case Created", objectType: "Case", objectName: "CS-2026-0147", prevState: "—", newState: "draft", caseId: "CS-2026-0147" },
  { timestamp: "2026-04-07 14:22:00", user: "Lisa Park", role: "Investigator", action: "Report Approved", objectType: "Report", objectName: "RPT-0085 - Final Report", prevState: "in_review", newState: "approved", caseId: "CS-2026-0143" },
  { timestamp: "2026-04-07 11:00:00", user: "Maria Santos", role: "Investigator", action: "Report Submitted", objectType: "Report", objectName: "RPT-0088", prevState: "draft", newState: "submitted", caseId: "CS-2026-0145" },
];

export default function AuditTrailPage() {
  const [selected, setSelected] = useState<typeof auditLog[0] | null>(null);

  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        <div className="filter-bar">
          <span className="text-xs font-medium text-foreground">Global Audit Trail</span>
          <div className="flex-1" />
          <select className="text-xs border rounded px-2 py-1 bg-background"><option>All Users</option></select>
          <select className="text-xs border rounded px-2 py-1 bg-background"><option>All Roles</option></select>
          <select className="text-xs border rounded px-2 py-1 bg-background"><option>All Actions</option></select>
          <select className="text-xs border rounded px-2 py-1 bg-background"><option>All Objects</option></select>
        </div>
        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-auto">
            <table className="w-full enterprise-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>User</th>
                  <th>Role</th>
                  <th>Action</th>
                  <th>Object Type</th>
                  <th>Object</th>
                  <th>Previous</th>
                  <th>New State</th>
                  <th>Case</th>
                </tr>
              </thead>
              <tbody>
                {auditLog.map((e, i) => (
                  <tr key={i} className={`cursor-pointer ${selected === e ? "active" : ""}`} onClick={() => setSelected(e)}>
                    <td className="text-xs font-mono text-muted-foreground whitespace-nowrap">{e.timestamp}</td>
                    <td className="text-xs">{e.user}</td>
                    <td className="text-xs text-muted-foreground">{e.role}</td>
                    <td className="text-xs font-medium">{e.action}</td>
                    <td className="text-xs text-muted-foreground">{e.objectType}</td>
                    <td className="text-xs text-primary">{e.objectName}</td>
                    <td className="text-xs text-muted-foreground">{e.prevState}</td>
                    <td className="text-xs font-medium">{e.newState}</td>
                    <td className="text-xs font-mono text-primary">{e.caseId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selected && (
            <div className="side-panel w-72 shrink-0">
              <div className="flex items-center justify-between px-3 py-2 border-b bg-surface-sunken">
                <span className="text-xs font-semibold">Change Detail</span>
                <button onClick={() => setSelected(null)}><X className="h-4 w-4 text-muted-foreground" /></button>
              </div>
              <div className="p-3 space-y-3">
                {Object.entries(selected).map(([key, value]) => (
                  <div key={key}>
                    <span className="text-2xs text-muted-foreground uppercase">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <div className="text-xs font-medium">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
