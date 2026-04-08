import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { CheckCircle2, XCircle } from "lucide-react";

const roles = ["Contributor", "Investigator", "Reviewer", "Manager", "Executive Viewer", "Enterprise Admin"];

const permissions = [
  "Create Case", "Upload Evidence", "Review Extraction", "Run Analysis",
  "Edit Report", "Approve Report", "View Audit Trail", "Manage Taxonomy", "Manage Templates",
];

const permissionMatrix: Record<string, string[]> = {
  "Contributor": ["Upload Evidence"],
  "Investigator": ["Create Case", "Upload Evidence", "Review Extraction", "Run Analysis", "Edit Report"],
  "Reviewer": ["Review Extraction", "Run Analysis", "Edit Report", "Approve Report", "View Audit Trail"],
  "Manager": ["Create Case", "Upload Evidence", "Review Extraction", "Run Analysis", "Edit Report", "Approve Report", "View Audit Trail"],
  "Executive Viewer": ["View Audit Trail"],
  "Enterprise Admin": permissions,
};

const tabs = ["Roles & Permissions", "Templates & Taxonomy"];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [selectedRole, setSelectedRole] = useState("Investigator");

  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        <div className="filter-bar">
          <span className="text-xs font-medium text-foreground">Administration</span>
        </div>
        <div className="flex border-b bg-background px-4">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
                activeTab === tab ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "Roles & Permissions" && (
          <div className="flex flex-1 overflow-hidden">
            {/* Roles list */}
            <div className="w-48 border-r shrink-0 overflow-auto">
              <div className="px-3 py-2 border-b bg-surface-sunken">
                <span className="text-xs font-semibold">Roles</span>
              </div>
              {roles.map((role) => (
                <div
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={`px-3 py-2 text-xs cursor-pointer border-b ${selectedRole === role ? "bg-row-active font-medium text-primary" : "hover:bg-row-hover"}`}
                >
                  {role}
                </div>
              ))}
            </div>

            {/* Permission matrix */}
            <div className="flex-1 overflow-auto">
              <div className="px-3 py-2 border-b bg-surface-sunken">
                <span className="text-xs font-semibold">Permission Matrix</span>
              </div>
              <table className="w-full enterprise-table">
                <thead>
                  <tr>
                    <th>Permission</th>
                    {roles.map((r) => (
                      <th key={r} className={`text-center ${selectedRole === r ? "bg-row-active" : ""}`}>{r}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {permissions.map((perm) => (
                    <tr key={perm}>
                      <td className="text-xs font-medium">{perm}</td>
                      {roles.map((role) => (
                        <td key={role} className={`text-center ${selectedRole === role ? "bg-row-active" : ""}`}>
                          {permissionMatrix[role]?.includes(perm) ? (
                            <CheckCircle2 className="h-4 w-4 text-status-approved inline-block" />
                          ) : (
                            <XCircle className="h-4 w-4 text-border inline-block" />
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Scope panel */}
            <div className="w-64 border-l shrink-0 overflow-auto">
              <div className="px-3 py-2 border-b bg-surface-sunken">
                <span className="text-xs font-semibold">Scope: {selectedRole}</span>
              </div>
              <div className="p-3 space-y-3">
                <div>
                  <span className="section-header">Access Level</span>
                  <div className="space-y-1.5 mt-1">
                    {[
                      { scope: "Tenant", enabled: true },
                      { scope: "All Sites", enabled: selectedRole === "Enterprise Admin" || selectedRole === "Manager" },
                      { scope: "Assigned Sites Only", enabled: selectedRole === "Investigator" || selectedRole === "Reviewer" || selectedRole === "Contributor" },
                      { scope: "Case-Level Restriction", enabled: selectedRole === "Contributor" || selectedRole === "Executive Viewer" },
                    ].map((s) => (
                      <div key={s.scope} className="flex items-center gap-2 text-xs">
                        <div className={`h-2 w-2 rounded-full ${s.enabled ? "bg-status-approved" : "bg-border"}`} />
                        <span className={s.enabled ? "text-foreground" : "text-muted-foreground"}>{s.scope}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="section-header">Assigned Users</span>
                  <div className="space-y-1 mt-1">
                    {selectedRole === "Investigator" && ["Sarah Chen", "Ahmed Khan", "Maria Santos"].map((u) => (
                      <div key={u} className="text-xs text-muted-foreground">{u}</div>
                    ))}
                    {selectedRole === "Manager" && ["John Doe", "Director HSE"].map((u) => (
                      <div key={u} className="text-xs text-muted-foreground">{u}</div>
                    ))}
                    {selectedRole === "Reviewer" && ["John Doe", "Lisa Park"].map((u) => (
                      <div key={u} className="text-xs text-muted-foreground">{u}</div>
                    ))}
                    {selectedRole !== "Investigator" && selectedRole !== "Manager" && selectedRole !== "Reviewer" && (
                      <div className="text-xs text-muted-foreground">—</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "Templates & Taxonomy" && (
          <div className="flex flex-1 overflow-hidden">
            <div className="w-56 border-r shrink-0 overflow-auto">
              <div className="px-3 py-2 border-b bg-surface-sunken">
                <span className="text-xs font-semibold">Report Templates</span>
              </div>
              {["Standard Investigation", "Near Miss Report", "Management Summary", "Regulatory Report"].map((t) => (
                <div key={t} className="px-3 py-2 text-xs border-b hover:bg-row-hover cursor-pointer">{t}</div>
              ))}
              <div className="px-3 py-2 border-b bg-surface-sunken mt-2">
                <span className="text-xs font-semibold">Classification Taxonomy</span>
              </div>
              {["Equipment Failure", "Human Factor", "Environmental", "Process/Procedure", "Management System"].map((t) => (
                <div key={t} className="px-3 py-2 text-xs border-b hover:bg-row-hover cursor-pointer">{t}</div>
              ))}
            </div>
            <div className="flex-1 p-4">
              <h3 className="text-sm font-semibold mb-3">Standard Investigation Template</h3>
              <div className="space-y-2">
                {["Incident Summary", "Facts & Chronology", "PEEPO Reasoning", "Classification", "Prevention Actions", "Actor Intelligence", "Conclusion", "Appendix"].map((section, i) => (
                  <div key={section} className="flex items-center justify-between px-3 py-2 border rounded-md">
                    <div className="flex items-center gap-2">
                      <span className="text-2xs text-muted-foreground w-4">{i + 1}.</span>
                      <span className="text-xs font-medium">{section}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xs text-muted-foreground">{i < 5 ? "Required" : "Optional"}</span>
                      <span className="text-2xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{i < 4 ? "AI-enabled" : "Manual"}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
