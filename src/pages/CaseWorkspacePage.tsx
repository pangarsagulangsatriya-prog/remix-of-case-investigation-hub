import { useState } from "react";
import { useParams } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { StatusChip, SeverityChip, ConfidenceChip } from "@/components/StatusChip";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Upload,
  Play,
  Brain,
  FileText,
  Send,
  XCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileSearch,
  ChevronRight,
  Eye,
  Check,
  X,
  Pencil,
} from "lucide-react";

const tabs = ["Overview", "Evidence", "Extraction Review", "Analysis", "Reports", "Review", "Audit Trail"];

const progressSteps = [
  { label: "Evidence", done: true },
  { label: "Extraction", done: true },
  { label: "Analysis", done: true },
  { label: "Report", done: false },
  { label: "Review", done: false },
  { label: "Approved", done: false },
];

const evidenceFiles = [
  { name: "site_inspection_photos.zip", type: "Images", source: "Field Team", uploadedBy: "Ahmed Khan", extractionStatus: "completed", reviewStatus: "reviewed", tags: ["key"], linkedAnalysis: 3 },
  { name: "incident_report_initial.pdf", type: "Document", source: "HSE Dept", uploadedBy: "Sarah Chen", extractionStatus: "completed", reviewStatus: "reviewed", tags: ["key"], linkedAnalysis: 5 },
  { name: "witness_statement_operator_A.mp3", type: "Audio", source: "Interview", uploadedBy: "John Doe", extractionStatus: "completed", reviewStatus: "partial", tags: [], linkedAnalysis: 2 },
  { name: "cctv_footage_zone_b.mp4", type: "Video", source: "CCTV", uploadedBy: "System", extractionStatus: "processing", reviewStatus: "pending", tags: [], linkedAnalysis: 0 },
  { name: "maintenance_log_march.xlsx", type: "Document", source: "Maintenance", uploadedBy: "Maria Santos", extractionStatus: "completed", reviewStatus: "pending", tags: [], linkedAnalysis: 1 },
  { name: "shift_handover_notes.pdf", type: "Document", source: "Operations", uploadedBy: "Lisa Park", extractionStatus: "failed", reviewStatus: "pending", tags: [], linkedAnalysis: 0 },
];

const extractedItems = [
  { fact: "Conveyor belt showed signs of wear on roller #14 during last inspection (2026-03-15)", type: "Observation", source: "maintenance_log_march.xlsx, p.3", confidence: "high" as const, status: "accepted" },
  { fact: "Operator A reported unusual vibration at 14:30 on April 5", type: "Witness Statement", source: "witness_statement_operator_A.mp3, 02:15", confidence: "high" as const, status: "accepted" },
  { fact: "Belt alignment was last calibrated on 2026-02-20", type: "Maintenance Record", source: "maintenance_log_march.xlsx, p.7", confidence: "medium" as const, status: "accepted" },
  { fact: "No warning signs were posted in Zone B at the time of incident", type: "Observation", source: "site_inspection_photos.zip, IMG_0234", confidence: "high" as const, status: "accepted" },
  { fact: "Emergency stop was activated at 14:47 by Supervisor B", type: "Action", source: "incident_report_initial.pdf, p.2", confidence: "high" as const, status: "accepted" },
  { fact: "Temperature reading was approximately 42°C (possible sensor error)", type: "Measurement", source: "maintenance_log_march.xlsx, p.12", confidence: "low" as const, status: "pending" },
  { fact: "Similar incident occurred in Zone A in 2025-Q3", type: "Historical", source: "incident_report_initial.pdf, p.5", confidence: "medium" as const, status: "edited" },
  { fact: "Replacement parts were on order since March 1st but delayed", type: "Supply Chain", source: "maintenance_log_march.xlsx, p.9", confidence: "high" as const, status: "pending" },
];

const analysisAgents = [
  { name: "Fact & Chronology", purpose: "Build event timeline from evidence", inputReady: true, lastRun: "2h ago", lastStatus: "reviewed", icon: Clock },
  { name: "PEEPO Reasoning", purpose: "Analyze People, Environment, Equipment, Process, Organization", inputReady: true, lastRun: "2h ago", lastStatus: "draft", icon: Brain },
  { name: "IPLS Classification", purpose: "Classify incident type and severity", inputReady: true, lastRun: "1h ago", lastStatus: "draft", icon: FileSearch },
  { name: "Prevention Action", purpose: "Generate corrective and preventive actions", inputReady: true, lastRun: "1h ago", lastStatus: "draft", icon: CheckCircle2 },
  { name: "Actor Intelligence", purpose: "Map actors, roles, and interactions", inputReady: false, lastRun: "Never", lastStatus: "not_run", icon: AlertTriangle },
];

const runHistory = [
  { runId: "RUN-047", agent: "Fact & Chronology", triggeredBy: "Sarah Chen", inputSource: "Reviewed Extraction", status: "completed", createdAt: "2h ago" },
  { runId: "RUN-046", agent: "PEEPO Reasoning", triggeredBy: "Sarah Chen", inputSource: "Fact & Chronology output", status: "completed", createdAt: "2h ago" },
  { runId: "RUN-045", agent: "IPLS Classification", triggeredBy: "Auto-chain", inputSource: "PEEPO output", status: "completed", createdAt: "1h ago" },
  { runId: "RUN-044", agent: "Prevention Action", triggeredBy: "Auto-chain", inputSource: "IPLS + PEEPO output", status: "completed", createdAt: "1h ago" },
  { runId: "RUN-043", agent: "Fact & Chronology", triggeredBy: "John Doe", inputSource: "Raw Extraction", status: "superseded", createdAt: "1d ago" },
];

export default function CaseWorkspacePage() {
  const { caseId } = useParams();
  const [activeTab, setActiveTab] = useState("Overview");

  const displayCaseId = caseId || "CS-2026-0147";

  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        {/* Case header */}
        <div className="px-4 py-3 border-b bg-background">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-primary">{displayCaseId}</span>
              <h1 className="text-sm font-semibold">Conveyor belt failure - Zone B</h1>
              <SeverityChip severity="critical" />
              <StatusChip status="in_progress" />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                <Upload className="h-3 w-3" /> Upload Evidence
              </Button>
              <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                <Play className="h-3 w-3" /> Run Extraction
              </Button>
              <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                <Brain className="h-3 w-3" /> Launch Analysis
              </Button>
              <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                <FileText className="h-3 w-3" /> Create Report
              </Button>
              <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                <Send className="h-3 w-3" /> Request Review
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <span>Site: <span className="text-foreground font-medium">Site Alpha</span></span>
            <span>Incident: <span className="text-foreground font-medium">2026-04-05 14:30</span></span>
            <span>Owner: <span className="text-foreground font-medium">Sarah Chen</span></span>
            <span>Aging: <span className="text-foreground font-medium">3 days</span></span>
          </div>
          {/* Progress strip */}
          <div className="flex items-center gap-1 mt-3">
            {progressSteps.map((step, i) => (
              <div key={step.label} className="flex items-center gap-1">
                <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-2xs font-medium ${step.done ? "bg-status-approved/10 text-status-approved" : "bg-muted text-muted-foreground"}`}>
                  {step.done ? <CheckCircle2 className="h-3 w-3" /> : <div className="h-3 w-3 rounded-full border" />}
                  {step.label}
                </div>
                {i < progressSteps.length - 1 && <ChevronRight className="h-3 w-3 text-border" />}
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b bg-background px-4">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-auto">
          {activeTab === "Overview" && <OverviewTab />}
          {activeTab === "Evidence" && <EvidenceTab />}
          {activeTab === "Extraction Review" && <ExtractionTab />}
          {activeTab === "Analysis" && <AnalysisTab />}
          {activeTab === "Reports" && <ReportsTab />}
          {activeTab === "Review" && <ReviewTab />}
          {activeTab === "Audit Trail" && <AuditTrailTab />}
        </div>
      </div>
    </AppLayout>
  );
}

function OverviewTab() {
  return (
    <div className="flex gap-4 p-4">
      <div className="flex-1 space-y-3">
        <div className="border rounded-md">
          <div className="px-3 py-2 border-b bg-surface-sunken">
            <span className="text-xs font-semibold">Case Summary</span>
          </div>
          <div className="p-3 text-xs text-muted-foreground leading-relaxed">
            On April 5, 2026 at approximately 14:30, a conveyor belt in Zone B experienced a catastrophic failure resulting in unplanned downtime and near-miss injury to two operators. Initial evidence suggests roller #14 wear, delayed maintenance parts, and possible calibration issues contributed to the failure. Emergency stop was activated by Supervisor B at 14:47. Investigation is in progress with AI extraction and analysis completed.
          </div>
        </div>

        <div className="border rounded-md">
          <div className="px-3 py-2 border-b bg-surface-sunken">
            <span className="text-xs font-semibold">Activity Timeline</span>
          </div>
          <div className="p-3 space-y-3">
            {[
              { time: "2h ago", user: "System", action: "AI Analysis completed: PEEPO Reasoning, IPLS Classification, Prevention Action", type: "ai" },
              { time: "3h ago", user: "Sarah Chen", action: "Marked 6 extraction items as reviewed and accepted", type: "review" },
              { time: "4h ago", user: "System", action: "AI Extraction completed for 5 evidence files (47 items extracted)", type: "ai" },
              { time: "6h ago", user: "Ahmed Khan", action: "Uploaded 4 new evidence files from site inspection", type: "upload" },
              { time: "1d ago", user: "John Doe", action: "Case created and assigned to Sarah Chen", type: "create" },
            ].map((item, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`h-2 w-2 rounded-full mt-1.5 ${item.type === "ai" ? "bg-primary" : item.type === "review" ? "bg-status-approved" : "bg-muted-foreground"}`} />
                  {i < 4 && <div className="w-px flex-1 bg-border mt-1" />}
                </div>
                <div className="pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium">{item.user}</span>
                    <span className="text-2xs text-muted-foreground">{item.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{item.action}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="w-64 shrink-0 space-y-3">
        <div className="border rounded-md">
          <div className="px-3 py-2 border-b bg-surface-sunken">
            <span className="text-xs font-semibold">Evidence Stats</span>
          </div>
          <div className="p-3 space-y-2">
            {[
              ["Total Files", "6"],
              ["Extraction Done", "4"],
              ["Reviewed", "2"],
              ["Key Evidence", "2"],
              ["Extracted Facts", "47"],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between text-xs">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="border rounded-md">
          <div className="px-3 py-2 border-b bg-surface-sunken">
            <span className="text-xs font-semibold">AI Run Summary</span>
          </div>
          <div className="p-3 space-y-2">
            {analysisAgents.slice(0, 4).map((a) => (
              <div key={a.name} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{a.name}</span>
                <StatusChip status={a.lastStatus === "reviewed" ? "approved" : a.lastStatus === "draft" ? "draft" : "draft"} />
              </div>
            ))}
          </div>
        </div>

        <div className="border rounded-md">
          <div className="px-3 py-2 border-b bg-surface-sunken">
            <span className="text-xs font-semibold">Pending Tasks</span>
          </div>
          <div className="p-3 space-y-2">
            {[
              "Review 2 low-confidence extractions",
              "Review PEEPO analysis output",
              "Review IPLS classification",
              "Run Actor Intelligence agent",
              "Draft investigation report",
            ].map((task) => (
              <div key={task} className="flex items-start gap-2">
                <div className="h-2 w-2 rounded-full bg-status-review mt-1.5 shrink-0" />
                <span className="text-xs text-muted-foreground">{task}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function EvidenceTab() {
  const [selectedEvidence, setSelectedEvidence] = useState<typeof evidenceFiles[0] | null>(null);

  return (
    <div className="flex h-full">
      <div className="flex-1 overflow-auto">
        <div className="filter-bar">
          <select className="text-xs border rounded px-2 py-1 bg-background">
            <option>All Types</option>
          </select>
          <select className="text-xs border rounded px-2 py-1 bg-background">
            <option>All Statuses</option>
          </select>
          <div className="flex-1" />
          <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
            <Upload className="h-3 w-3" /> Upload
          </Button>
        </div>
        <table className="w-full enterprise-table">
          <thead>
            <tr>
              <th>File Name</th>
              <th>Type</th>
              <th>Source</th>
              <th>Uploaded By</th>
              <th>Extraction</th>
              <th>Review</th>
              <th>Tags</th>
              <th className="text-center">Linked</th>
            </tr>
          </thead>
          <tbody>
            {evidenceFiles.map((f) => (
              <tr
                key={f.name}
                className={`cursor-pointer ${selectedEvidence?.name === f.name ? "active" : ""}`}
                onClick={() => setSelectedEvidence(f)}
              >
                <td className="text-xs font-medium">{f.name}</td>
                <td className="text-xs text-muted-foreground">{f.type}</td>
                <td className="text-xs text-muted-foreground">{f.source}</td>
                <td className="text-xs">{f.uploadedBy}</td>
                <td>
                  <span className={`status-chip ${
                    f.extractionStatus === "completed" ? "bg-status-approved/10 text-status-approved" :
                    f.extractionStatus === "processing" ? "bg-status-inprogress/10 text-status-inprogress" :
                    "bg-destructive/10 text-destructive"
                  }`}>
                    {f.extractionStatus}
                  </span>
                </td>
                <td>
                  <span className={`status-chip ${
                    f.reviewStatus === "reviewed" ? "bg-status-approved/10 text-status-approved" :
                    f.reviewStatus === "partial" ? "bg-status-review/10 text-status-review" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {f.reviewStatus}
                  </span>
                </td>
                <td>
                  {f.tags.includes("key") && (
                    <span className="status-chip bg-primary/10 text-primary">key</span>
                  )}
                </td>
                <td className="text-xs text-center text-muted-foreground">{f.linkedAnalysis}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedEvidence && (
        <div className="side-panel w-72 shrink-0">
          <div className="flex items-center justify-between px-3 py-2 border-b bg-surface-sunken">
            <span className="text-xs font-semibold">Evidence Detail</span>
            <button onClick={() => setSelectedEvidence(null)} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="p-3 space-y-3">
            <div className="bg-surface-sunken rounded-md h-32 flex items-center justify-center">
              <Eye className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h4 className="text-xs font-medium">{selectedEvidence.name}</h4>
              {[
                ["Type", selectedEvidence.type],
                ["Source", selectedEvidence.source],
                ["Uploaded by", selectedEvidence.uploadedBy],
                ["Extraction", selectedEvidence.extractionStatus],
                ["Review", selectedEvidence.reviewStatus],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
            </div>
            <div className="space-y-1">
              <Button variant="outline" size="sm" className="w-full h-7 text-xs">Mark as Key Evidence</Button>
              <Button variant="outline" size="sm" className="w-full h-7 text-xs">Rerun Extraction</Button>
              <Button variant="outline" size="sm" className="w-full h-7 text-xs">Add Note</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ExtractionTab() {
  return (
    <div className="flex h-full">
      {/* Left: evidence list */}
      <div className="w-56 border-r overflow-auto shrink-0">
        <div className="px-3 py-2 border-b bg-surface-sunken">
          <span className="text-xs font-semibold">Evidence Files</span>
        </div>
        {evidenceFiles.filter(f => f.extractionStatus === "completed").map((f) => (
          <div key={f.name} className="px-3 py-2 border-b hover:bg-row-hover cursor-pointer text-xs">
            <div className="font-medium truncate">{f.name}</div>
            <div className="text-2xs text-muted-foreground mt-0.5">{f.type} · {f.reviewStatus}</div>
          </div>
        ))}
      </div>

      {/* Center: source preview */}
      <div className="w-80 border-r overflow-auto shrink-0">
        <div className="px-3 py-2 border-b bg-surface-sunken">
          <span className="text-xs font-semibold">Source Preview</span>
        </div>
        <div className="p-4">
          <div className="bg-surface-sunken rounded-md p-4 text-xs text-muted-foreground leading-relaxed space-y-3">
            <p className="font-medium text-foreground">incident_report_initial.pdf — Page 2</p>
            <p>At approximately 14:30 hours on April 5, 2026, the main conveyor belt in Zone B experienced a sudden failure. <span className="bg-primary/15 px-0.5 rounded">The belt tore at section 14</span>, causing material spillage across the walkway.</p>
            <p><span className="bg-primary/15 px-0.5 rounded">Two operators (Operator A and Operator C) were in the immediate vicinity</span> but were able to evacuate without injury.</p>
            <p><span className="bg-primary/15 px-0.5 rounded">Emergency stop was activated at 14:47 by Supervisor B</span> following the standard emergency procedure.</p>
          </div>
        </div>
      </div>

      {/* Right: extracted items */}
      <div className="flex-1 overflow-auto">
        <div className="px-3 py-2 border-b bg-surface-sunken flex items-center justify-between">
          <span className="text-xs font-semibold">Extracted Items ({extractedItems.length})</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-6 text-2xs">Accept All High</Button>
            <Button variant="outline" size="sm" className="h-6 text-2xs">Filter Low Confidence</Button>
          </div>
        </div>
        <table className="w-full enterprise-table">
          <thead>
            <tr>
              <th>Extracted Fact</th>
              <th>Type</th>
              <th>Source</th>
              <th>Conf.</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {extractedItems.map((item, i) => (
              <tr key={i}>
                <td className="text-xs max-w-[280px]">{item.fact}</td>
                <td className="text-xs text-muted-foreground whitespace-nowrap">{item.type}</td>
                <td className="text-2xs text-primary font-mono max-w-[150px] truncate">{item.source}</td>
                <td><ConfidenceChip level={item.confidence} /></td>
                <td>
                  <span className={`status-chip ${
                    item.status === "accepted" ? "bg-status-approved/10 text-status-approved" :
                    item.status === "edited" ? "bg-status-inprogress/10 text-status-inprogress" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td>
                  <div className="flex gap-1">
                    <button className="p-1 rounded hover:bg-status-approved/10 text-muted-foreground hover:text-status-approved" title="Accept">
                      <Check className="h-3.5 w-3.5" />
                    </button>
                    <button className="p-1 rounded hover:bg-primary/10 text-muted-foreground hover:text-primary" title="Edit">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive" title="Reject">
                      <XCircle className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AnalysisTab() {
  return (
    <div className="p-4 space-y-4">
      {/* Data readiness */}
      <div className="border rounded-md">
        <div className="px-3 py-2 border-b bg-surface-sunken flex items-center justify-between">
          <span className="text-xs font-semibold">Data Readiness</span>
          <span className="text-2xs text-status-approved font-medium">4/5 sources ready</span>
        </div>
        <div className="p-3 flex gap-4">
          {[
            { label: "Reviewed Extraction", count: 42, ready: true },
            { label: "Raw Extraction", count: 47, ready: true },
            { label: "Evidence Files", count: 6, ready: true },
            { label: "Previous Analysis", count: 4, ready: true },
            { label: "External Data", count: 0, ready: false },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-2 text-xs">
              <div className={`h-2 w-2 rounded-full ${s.ready ? "bg-status-approved" : "bg-border"}`} />
              <span className="text-muted-foreground">{s.label}</span>
              <span className="font-medium">{s.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Agent cards */}
      <div>
        <span className="section-header">Analysis Agents</span>
        <div className="grid grid-cols-5 gap-3 mt-2">
          {analysisAgents.map((agent) => (
            <div key={agent.name} className="border rounded-md p-3 hover:border-primary/30 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <agent.icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-semibold">{agent.name}</span>
              </div>
              <p className="text-2xs text-muted-foreground mb-3">{agent.purpose}</p>
              <div className="space-y-1 mb-3">
                <div className="flex justify-between text-2xs">
                  <span className="text-muted-foreground">Input Ready</span>
                  <span className={agent.inputReady ? "text-status-approved" : "text-muted-foreground"}>{agent.inputReady ? "Yes" : "No"}</span>
                </div>
                <div className="flex justify-between text-2xs">
                  <span className="text-muted-foreground">Last Run</span>
                  <span>{agent.lastRun}</span>
                </div>
                <div className="flex justify-between text-2xs">
                  <span className="text-muted-foreground">Status</span>
                  <span className={`font-medium ${
                    agent.lastStatus === "reviewed" ? "text-status-approved" :
                    agent.lastStatus === "draft" ? "text-status-draft" :
                    "text-muted-foreground"
                  }`}>{agent.lastStatus === "not_run" ? "Not Run" : agent.lastStatus}</span>
                </div>
              </div>
              <div className="flex gap-1">
                <Button size="sm" className="h-6 text-2xs flex-1" disabled={!agent.inputReady}>
                  <Play className="h-3 w-3 mr-1" /> Run
                </Button>
                <Button variant="outline" size="sm" className="h-6 text-2xs">Config</Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Flow builder */}
      <div className="border rounded-md">
        <div className="px-3 py-2 border-b bg-surface-sunken flex items-center justify-between">
          <span className="text-xs font-semibold">Analysis Chain</span>
          <Button size="sm" className="h-6 text-2xs gap-1">
            <Play className="h-3 w-3" /> Run Full Chain
          </Button>
        </div>
        <div className="p-4">
          <div className="flex items-center gap-2">
            {["Extraction", "Fact & Chronology", "PEEPO", "IPLS", "Prevention", "Actor Intelligence"].map((step, i) => (
              <div key={step} className="flex items-center gap-2">
                <div className={`px-3 py-1.5 rounded border text-xs font-medium ${
                  i < 4 ? "bg-status-approved/5 border-status-approved/30 text-status-approved" :
                  i === 4 ? "bg-status-inprogress/5 border-status-inprogress/30 text-status-inprogress" :
                  "bg-muted text-muted-foreground"
                }`}>
                  {step}
                </div>
                {i < 5 && <ChevronRight className="h-3 w-3 text-border" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Run history */}
      <div className="border rounded-md">
        <div className="px-3 py-2 border-b bg-surface-sunken">
          <span className="text-xs font-semibold">Run History</span>
        </div>
        <table className="w-full enterprise-table">
          <thead>
            <tr>
              <th>Run ID</th>
              <th>Agent</th>
              <th>Triggered By</th>
              <th>Input Source</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {runHistory.map((run) => (
              <tr key={run.runId}>
                <td className="font-mono text-xs text-primary">{run.runId}</td>
                <td className="text-xs">{run.agent}</td>
                <td className="text-xs text-muted-foreground">{run.triggeredBy}</td>
                <td className="text-xs text-muted-foreground">{run.inputSource}</td>
                <td>
                  <span className={`status-chip ${
                    run.status === "completed" ? "bg-status-approved/10 text-status-approved" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {run.status}
                  </span>
                </td>
                <td className="text-xs text-muted-foreground">{run.createdAt}</td>
                <td>
                  <button className="text-2xs text-primary hover:underline">View Result</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ReportsTab() {
  return (
    <div className="flex h-full">
      {/* Left: report list */}
      <div className="w-56 border-r overflow-auto shrink-0">
        <div className="px-3 py-2 border-b bg-surface-sunken flex items-center justify-between">
          <span className="text-xs font-semibold">Reports</span>
          <Button variant="ghost" size="sm" className="h-6 text-2xs">+ New</Button>
        </div>
        {[
          { title: "Initial Investigation Report", version: "v1.2", status: "draft" },
          { title: "Internal Review Report", version: "v1.0", status: "draft" },
        ].map((r) => (
          <div key={r.title} className="px-3 py-2 border-b hover:bg-row-hover cursor-pointer">
            <div className="text-xs font-medium">{r.title}</div>
            <div className="text-2xs text-muted-foreground mt-0.5">{r.version} · {r.status}</div>
          </div>
        ))}
      </div>

      {/* Center: report editor */}
      <div className="flex-1 overflow-auto p-4">
        <div className="max-w-3xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold">Initial Investigation Report — v1.2</h2>
            <StatusChip status="draft" />
          </div>
          <div className="space-y-3">
            {[
              { section: "1. Incident Summary", content: "On April 5, 2026, a conveyor belt failure occurred in Zone B of Site Alpha, resulting in material spillage and near-miss injury to two operators.", hasAI: true },
              { section: "2. Facts & Chronology", content: "14:30 — Unusual vibration reported by Operator A\n14:35 — Belt tear at section 14 observed\n14:47 — Emergency stop activated by Supervisor B", hasAI: true },
              { section: "3. PEEPO Reasoning", content: "Click to insert AI-generated PEEPO analysis...", hasAI: false },
              { section: "4. Classification", content: "Click to insert AI-generated classification...", hasAI: false },
              { section: "5. Prevention Actions", content: "Click to insert AI-generated prevention actions...", hasAI: false },
              { section: "6. Conclusion", content: "", hasAI: false },
            ].map((s) => (
              <div key={s.section} className="border rounded-md">
                <div className="flex items-center justify-between px-3 py-1.5 border-b bg-surface-sunken">
                  <span className="text-xs font-semibold">{s.section}</span>
                  <div className="flex gap-1">
                    {s.hasAI && <span className="text-2xs px-1.5 py-0.5 rounded bg-primary/10 text-primary">AI Generated</span>}
                    <span className="text-2xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">Draft</span>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-xs text-muted-foreground whitespace-pre-line leading-relaxed">
                    {s.content || "No content yet. Click to edit or insert AI output."}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: insert panel */}
      <div className="w-64 border-l shrink-0 overflow-auto">
        <div className="px-3 py-2 border-b bg-surface-sunken">
          <span className="text-xs font-semibold">Insert Content</span>
        </div>
        <div className="p-3 space-y-3">
          <div>
            <span className="section-header">AI Output Blocks</span>
            {["Fact & Chronology", "PEEPO Reasoning", "IPLS Classification", "Prevention Actions"].map((block) => (
              <div key={block} className="flex items-center justify-between py-1.5 border-b last:border-0">
                <span className="text-xs">{block}</span>
                <Button variant="ghost" size="sm" className="h-6 text-2xs text-primary">Insert</Button>
              </div>
            ))}
          </div>
          <div>
            <span className="section-header">Linked Evidence</span>
            {evidenceFiles.slice(0, 3).map((f) => (
              <div key={f.name} className="py-1.5 border-b last:border-0">
                <span className="text-xs truncate block">{f.name}</span>
                <Button variant="ghost" size="sm" className="h-6 text-2xs text-primary">Cite</Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewTab() {
  return (
    <div className="flex h-full">
      <div className="flex-1 overflow-auto p-4">
        <div className="max-w-3xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold">Review & Approval</h2>
              <p className="text-xs text-muted-foreground">Initial Investigation Report — v1.2</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="h-7 text-xs">Request Changes</Button>
              <Button size="sm" className="h-7 text-xs gap-1">
                <CheckCircle2 className="h-3 w-3" /> Approve Report
              </Button>
            </div>
          </div>

          {/* Approval chain */}
          <div className="border rounded-md mb-4">
            <div className="px-3 py-2 border-b bg-surface-sunken">
              <span className="text-xs font-semibold">Approval Chain</span>
            </div>
            <div className="p-3 flex gap-4">
              {[
                { role: "Investigator", user: "Sarah Chen", status: "submitted" },
                { role: "Reviewer", user: "John Doe", status: "pending" },
                { role: "Manager", user: "Director HSE", status: "waiting" },
              ].map((step, i) => (
                <div key={step.role} className="flex items-center gap-2">
                  <div className={`px-3 py-2 rounded border text-xs ${
                    step.status === "submitted" ? "bg-status-approved/5 border-status-approved/30" :
                    step.status === "pending" ? "bg-status-review/5 border-status-review/30" :
                    "bg-muted"
                  }`}>
                    <div className="font-medium">{step.role}</div>
                    <div className="text-2xs text-muted-foreground">{step.user}</div>
                    <div className={`text-2xs font-medium mt-1 ${
                      step.status === "submitted" ? "text-status-approved" :
                      step.status === "pending" ? "text-status-review" :
                      "text-muted-foreground"
                    }`}>{step.status}</div>
                  </div>
                  {i < 2 && <ChevronRight className="h-3 w-3 text-border" />}
                </div>
              ))}
            </div>
          </div>

          {/* Section review */}
          <div className="border rounded-md">
            <div className="px-3 py-2 border-b bg-surface-sunken">
              <span className="text-xs font-semibold">Section Review Status</span>
            </div>
            <table className="w-full enterprise-table">
              <thead>
                <tr>
                  <th>Section</th>
                  <th>Status</th>
                  <th>Comments</th>
                  <th>Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { section: "Incident Summary", status: "approved" as const, comments: 0, updated: "2h ago" },
                  { section: "Facts & Chronology", status: "approved" as const, comments: 1, updated: "2h ago" },
                  { section: "PEEPO Reasoning", status: "draft" as const, comments: 0, updated: "3h ago" },
                  { section: "Classification", status: "draft" as const, comments: 0, updated: "3h ago" },
                  { section: "Prevention Actions", status: "draft" as const, comments: 0, updated: "3h ago" },
                  { section: "Conclusion", status: "draft" as const, comments: 0, updated: "—" },
                ].map((s) => (
                  <tr key={s.section} className="cursor-pointer">
                    <td className="text-xs font-medium">{s.section}</td>
                    <td><StatusChip status={s.status} /></td>
                    <td className="text-xs text-muted-foreground">{s.comments > 0 ? `${s.comments} comment` : "—"}</td>
                    <td className="text-xs text-muted-foreground">{s.updated}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Comments panel */}
      <div className="w-72 border-l shrink-0 overflow-auto">
        <div className="px-3 py-2 border-b bg-surface-sunken">
          <span className="text-xs font-semibold">Comments</span>
        </div>
        <div className="p-3 space-y-3">
          <div className="border rounded-md p-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium">John Doe</span>
              <span className="text-2xs text-muted-foreground">2h ago</span>
            </div>
            <p className="text-xs text-muted-foreground">Chronology looks good. Minor correction needed on timeline entry at 14:35 — should specify which section of belt tore.</p>
            <span className="text-2xs text-primary">On: Facts & Chronology</span>
          </div>
          <div className="border rounded-md p-2">
            <Textarea placeholder="Add a comment..." className="text-xs min-h-[60px] border-0 p-0 focus-visible:ring-0 resize-none" />
            <div className="flex justify-end mt-2">
              <Button size="sm" className="h-6 text-2xs">Comment</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AuditTrailTab() {
  const auditEntries = [
    { timestamp: "2026-04-08 10:15", user: "System", role: "AI Agent", action: "Analysis Completed", objectType: "Analysis", objectName: "PEEPO Reasoning - RUN-046", prevState: "running", newState: "completed" },
    { timestamp: "2026-04-08 10:12", user: "System", role: "AI Agent", action: "Analysis Started", objectType: "Analysis", objectName: "PEEPO Reasoning - RUN-046", prevState: "—", newState: "running" },
    { timestamp: "2026-04-08 09:45", user: "Sarah Chen", role: "Investigator", action: "Extraction Reviewed", objectType: "Extraction", objectName: "6 items accepted", prevState: "pending", newState: "reviewed" },
    { timestamp: "2026-04-08 09:30", user: "System", role: "AI Agent", action: "Extraction Completed", objectType: "Evidence", objectName: "incident_report_initial.pdf", prevState: "processing", newState: "extracted" },
    { timestamp: "2026-04-08 08:00", user: "Ahmed Khan", role: "Investigator", action: "Evidence Uploaded", objectType: "Evidence", objectName: "4 files uploaded", prevState: "—", newState: "uploaded" },
    { timestamp: "2026-04-07 16:00", user: "John Doe", role: "Manager", action: "Case Created", objectType: "Case", objectName: "CS-2026-0147", prevState: "—", newState: "draft" },
  ];

  return (
    <div className="flex h-full">
      <div className="flex-1 overflow-auto">
        <div className="filter-bar">
          <select className="text-xs border rounded px-2 py-1 bg-background"><option>All Users</option></select>
          <select className="text-xs border rounded px-2 py-1 bg-background"><option>All Actions</option></select>
          <select className="text-xs border rounded px-2 py-1 bg-background"><option>All Objects</option></select>
        </div>
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
            </tr>
          </thead>
          <tbody>
            {auditEntries.map((e, i) => (
              <tr key={i} className="cursor-pointer">
                <td className="text-xs font-mono text-muted-foreground whitespace-nowrap">{e.timestamp}</td>
                <td className="text-xs">{e.user}</td>
                <td className="text-xs text-muted-foreground">{e.role}</td>
                <td className="text-xs font-medium">{e.action}</td>
                <td className="text-xs text-muted-foreground">{e.objectType}</td>
                <td className="text-xs text-primary">{e.objectName}</td>
                <td className="text-xs text-muted-foreground">{e.prevState}</td>
                <td className="text-xs font-medium">{e.newState}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

