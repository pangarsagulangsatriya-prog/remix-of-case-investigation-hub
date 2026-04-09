import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { StatusChip, SeverityChip } from "@/components/StatusChip";
import { 
  Plus, 
  Download, 
  Filter, 
  X, 
  ChevronRight, 
  LayoutGrid, 
  List, 
  MoreVertical, 
  FileText, 
  MessageSquare, 
  Paperclip,
  Clock,
  ExternalLink,
  History,
  Globe,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

type Case = {
  id: string;
  title: string;
  site: string;
  incidentDate: string;
  severity: "critical" | "high" | "medium" | "low";
  status: "draft" | "in_progress" | "in_review" | "approved" | "closed";
  owner: string;
  evidenceCount: number;
  reportsCount: number;
  pendingReview: number;
  updated: string;
  summary?: string;
};

const cases: Case[] = [
  { id: "CS-2026-0147", title: "Conveyor belt failure - Zone B", site: "Site Alpha", incidentDate: "2026-04-05", severity: "critical", status: "in_progress", owner: "Sarah Chen", evidenceCount: 12, reportsCount: 1, pendingReview: 3, updated: "2h ago", summary: "Mechanical failure in main conveyor roller #14. High risk of extended downtime." },
  { id: "CS-2026-0146", title: "Near miss - haul truck intersection", site: "Site Alpha", incidentDate: "2026-04-04", severity: "high", status: "in_review", owner: "John Doe", evidenceCount: 8, reportsCount: 2, pendingReview: 0, updated: "4h ago", summary: "Haul truck narrowly avoided collision with light vehicle at North intersection." },
  { id: "CS-2026-0145", title: "Chemical spill - processing plant", site: "Site Beta", incidentDate: "2026-04-03", severity: "high", status: "in_progress", owner: "Maria Santos", evidenceCount: 15, reportsCount: 0, pendingReview: 5, updated: "6h ago", summary: "200L hydraulic fluid leakage from pressure vessel. Containment protocols initiated." },
  { id: "CS-2026-0144", title: "Scaffolding collapse - Pit 3", site: "Site Alpha", incidentDate: "2026-04-02", severity: "critical", status: "draft", owner: "Ahmed Khan", evidenceCount: 6, reportsCount: 0, pendingReview: 0, updated: "1d ago", summary: "Unsupported scaffolding structure gave way during shift change. No injuries reported." },
  { id: "CS-2026-0143", title: "Electrical arc flash incident", site: "Site Gamma", incidentDate: "2026-04-01", severity: "medium", status: "approved", owner: "Lisa Park", evidenceCount: 10, reportsCount: 3, pendingReview: 0, updated: "1d ago", summary: "Minor arc flash during scheduled maintenance on LV Switchroom C." },
  { id: "CS-2026-0142", title: "Ground control failure", site: "Site Beta", incidentDate: "2026-03-30", severity: "high", status: "in_review", owner: "John Doe", evidenceCount: 9, reportsCount: 1, pendingReview: 2, updated: "2d ago", summary: "Unexpected movement in highwall section 4B. Stability sensors triggered." },
  { id: "CS-2026-0141", title: "Vehicle rollover - access road", site: "Site Alpha", incidentDate: "2026-03-28", severity: "critical", status: "in_review", owner: "Sarah Chen", evidenceCount: 20, reportsCount: 2, pendingReview: 1, updated: "3d ago", summary: "Light vehicle rollover on unsealed access road. Driver sustained minor injuries." },
  { id: "CS-2026-0140", title: "Dust exposure exceedance", site: "Site Gamma", incidentDate: "2026-03-27", severity: "medium", status: "approved", owner: "Lisa Park", evidenceCount: 5, reportsCount: 1, pendingReview: 0, updated: "4d ago", summary: "Personal dust monitors exceeded TWA limit in processing plant secondary crusher." },
  { id: "CS-2026-0139", title: "Crane load drop near miss", site: "Site Alpha", incidentDate: "2026-03-25", severity: "high", status: "closed", owner: "Ahmed Khan", evidenceCount: 14, reportsCount: 2, pendingReview: 0, updated: "5d ago", summary: "Rigging failure during lift. Load dropped 2m into restricted area." },
  { id: "CS-2026-0138", title: "Fatigue-related driving incident", site: "Site Beta", incidentDate: "2026-03-24", severity: "medium", status: "approved", owner: "Maria Santos", evidenceCount: 7, reportsCount: 1, pendingReview: 0, updated: "6d ago", summary: "Operator self-reported micro-sleep during return journey from site." },
];

type ViewMode = "table" | "grid-compact" | "grid-expanded";

export default function CaseListPage() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);

  return (
    <AppLayout>
      <div className="flex flex-col h-full bg-white">
        {/* Toolbar */}
        <div className="filter-bar border-b-0 h-10 px-4">
          <div className="flex items-center gap-3">
            <h1 className="text-xs font-bold text-foreground">Investigation Cases</h1>
            <span className="text-2xs font-medium text-muted-foreground px-1.5 py-0.5 bg-muted rounded-full">{cases.length}</span>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            {/* View Toggle */}
            <div className="flex items-center bg-muted rounded-md p-1 mr-2">
              <button 
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-sm transition-all ${viewMode === "table" ? "bg-white shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}
                title="Table View"
              >
                <List className="h-3.5 w-3.5" />
              </button>
              <button 
                onClick={() => setViewMode("grid-compact")}
                className={`p-1.5 rounded-sm transition-all ${viewMode === "grid-compact" ? "bg-white shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}
                title="Compact Grid"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
              <button 
                onClick={() => setViewMode("grid-expanded")}
                className={`p-1.5 rounded-sm transition-all ${viewMode === "grid-expanded" ? "bg-white shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}
                title="Expanded Grid"
              >
                <div className="relative">
                  <LayoutGrid className="h-3.5 w-3.5" />
                  <div className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 bg-primary/20 rounded-full border-[0.5px] border-primary" />
                </div>
              </button>
            </div>

            <Button size="sm" className="h-7 text-xs gap-1.5 font-semibold bg-primary hover:bg-primary/90" onClick={() => navigate("/cases/new")}>
              <Plus className="h-3 w-3" /> Create Case
            </Button>
          </div>
        </div>

        {/* Filter Selection Panel */}
        <div className="flex items-center gap-3 px-4 py-2 border-y bg-slate-50/50">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <Input 
              placeholder="Search cases..." 
              className="h-8 w-60 pl-8 text-xs bg-white border-slate-200 focus-visible:ring-primary/20"
            />
          </div>
          <div className="h-4 w-[1px] bg-slate-200 mx-1" />
          <select className="text-xs border rounded-md px-2 py-1 bg-white border-slate-200 text-slate-700 min-w-[120px] focus:outline-none focus:ring-1 focus:ring-primary/20">
            <option>All Sites</option>
            <option>Site Alpha</option>
            <option>Site Beta</option>
            <option>Site Gamma</option>
          </select>
          <select className="text-xs border rounded-md px-2 py-1 bg-white border-slate-200 text-slate-700 min-w-[120px] focus:outline-none focus:ring-1 focus:ring-primary/20">
            <option>All Severities</option>
            <option>Critical</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
          <select className="text-xs border rounded-md px-2 py-1 bg-white border-slate-200 text-slate-700 min-w-[120px] focus:outline-none focus:ring-1 focus:ring-primary/20">
            <option>All Statuses</option>
            <option>Draft</option>
            <option>In Progress</option>
            <option>In Review</option>
            <option>Approved</option>
            <option>Closed</option>
          </select>
          <select className="text-xs border rounded-md px-2 py-1 bg-white border-slate-200 text-slate-700 min-w-[120px] focus:outline-none focus:ring-1 focus:ring-primary/20">
            <option>All Owners</option>
            <option>Sarah Chen</option>
            <option>John Doe</option>
            <option>Maria Santos</option>
            <option>Ahmed Khan</option>
            <option>Lisa Park</option>
          </select>
        </div>

        {/* Main Workspace Area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Main Content Area */}
          <div className="flex-1 overflow-auto bg-slate-50/20 p-4">
            {viewMode === "table" ? (
              <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
                <table className="w-full enterprise-table border-none">
                  <thead>
                    <tr className="bg-slate-50 border-b">
                      <th className="pl-4">Case ID</th>
                      <th>Title</th>
                      <th>Site</th>
                      <th>Incident Date</th>
                      <th>Severity</th>
                      <th>Status</th>
                      <th>Owner</th>
                      <th className="text-center">Evidence</th>
                      <th className="text-center">Reports</th>
                      <th className="text-center">Pending</th>
                      <th className="pr-4">Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cases.map((c) => (
                      <tr
                        key={c.id}
                        className={`cursor-pointer transition-colors ${selectedCase?.id === c.id ? "active" : "hover:bg-slate-50/70"}`}
                        onClick={() => setSelectedCase(c)}
                        onDoubleClick={() => navigate(`/cases/${c.id}`)}
                      >
                        <td className="pl-4 font-mono text-xs text-primary font-semibold">{c.id}</td>
                        <td className="text-xs font-medium text-slate-900 truncate max-w-[200px]">{c.title}</td>
                        <td className="text-xs text-slate-600 font-medium">{c.site}</td>
                        <td className="text-xs text-slate-500 font-medium">{c.incidentDate}</td>
                        <td className="py-2.5"><SeverityChip severity={c.severity} /></td>
                        <td className="py-2.5"><StatusChip status={c.status} /></td>
                        <td className="text-xs text-slate-700 font-medium">{c.owner}</td>
                        <td className="text-xs text-center font-medium text-slate-600">{c.evidenceCount}</td>
                        <td className="text-xs text-center font-medium text-slate-600">{c.reportsCount}</td>
                        <td className="text-xs text-center">
                          {c.pendingReview > 0 ? (
                            <span className="text-status-review font-bold">{c.pendingReview}</span>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                        <td className="pr-4 text-xs text-slate-500 font-medium">{c.updated}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {cases.map((c) => (
                  <CaseGridCard 
                    key={c.id} 
                    caseData={c} 
                    mode={viewMode as "grid-compact" | "grid-expanded"}
                    isSelected={selectedCase?.id === c.id}
                    onClick={() => setSelectedCase(c)}
                    onOpen={() => navigate(`/cases/${c.id}`)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right Side Preview Panel */}
          {selectedCase && (
            <div className="side-panel w-[340px] border-l bg-white shadow-xl z-20 shrink-0 transform transition-transform animate-in slide-in-from-right duration-200">
              <div className="flex items-center justify-between px-4 h-12 border-b bg-slate-50/80 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 bg-primary/10 rounded flex items-center justify-center">
                    <History className="h-3 w-3 text-primary" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 tracking-tight uppercase">Case Preview</span>
                </div>
                <button 
                  onClick={() => setSelectedCase(null)} 
                  className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-all"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 overflow-auto">
                <div className="p-5 space-y-6">
                  {/* Panel Header */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-primary font-bold tracking-wider">{selectedCase.id}</span>
                      <StatusChip status={selectedCase.status} />
                    </div>
                    <h3 className="text-[15px] font-bold text-slate-900 leading-snug">{selectedCase.title}</h3>
                    <SeverityChip severity={selectedCase.severity} />
                  </div>

                  {/* Operational Data */}
                  <div className="grid grid-cols-1 gap-1 border-y border-slate-100 py-4">
                    {[
                      { label: "Site", value: selectedCase.site, icon: Globe },
                      { label: "Incident Date", value: selectedCase.incidentDate, icon: Clock },
                      { label: "Owner", value: selectedCase.owner, icon: List },
                      { label: "Updated", value: selectedCase.updated, icon: History },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between py-1.5 px-1 rounded-md hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500 font-medium">{item.label}</span>
                        </div>
                        <span className="text-xs font-bold text-slate-800">{item.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Summary (for Expanded/Manager feel) */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Summary</span>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium bg-slate-50/50 p-3 rounded-lg border border-slate-100 italic">
                      {selectedCase.summary}
                    </p>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 flex flex-col items-center">
                      <Paperclip className="h-3.5 w-3.5 text-slate-400 mb-1" />
                      <span className="text-lg font-bold text-slate-800 leading-none">{selectedCase.evidenceCount}</span>
                      <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider mt-1">Evidence</span>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 flex flex-col items-center">
                      <FileText className="h-3.5 w-3.5 text-slate-400 mb-1" />
                      <span className="text-lg font-bold text-slate-800 leading-none">{selectedCase.reportsCount}</span>
                      <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider mt-1">Reports</span>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 flex flex-col items-center">
                      <MessageSquare className="h-3.5 w-3.5 text-slate-400 mb-1" />
                      <span className="text-lg font-bold text-status-review leading-none">{selectedCase.pendingReview}</span>
                      <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider mt-1">Pending</span>
                    </div>
                  </div>

                  {/* Progress Matrix */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Investigation Matrix</span>
                    <div className="space-y-2.5 bg-slate-50 p-3 rounded-lg border border-slate-100">
                      {[
                        { step: "Evidence Extraction", done: true },
                        { step: "PEEPO Reasoning", done: selectedCase.status !== "draft" },
                        { step: "IPLS Classification", done: selectedCase.status === "in_review" || selectedCase.status === "approved" || selectedCase.status === "closed" },
                        { step: "Final Report Generation", done: selectedCase.reportsCount > 0 },
                        { step: "Management Approval", done: selectedCase.status === "approved" || selectedCase.status === "closed" },
                      ].map((s) => (
                        <div key={s.step} className="flex items-center gap-3">
                          <div className={`h-1.5 w-1.5 rounded-full ${s.done ? "bg-status-approved shadow-[0_0_5px_rgba(22,163,74,0.4)]" : "bg-slate-200"}`} />
                          <span className={`text-[11px] font-bold tracking-tight ${s.done ? "text-slate-700" : "text-slate-400"}`}>{s.step}</span>
                          {s.done && <div className="h-[0.5px] flex-1 bg-slate-200/50" />}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Panel Footer Actions */}
              <div className="p-4 bg-slate-50 border-t space-y-2">
                <Button 
                  className="w-full h-9 text-xs font-bold gap-2 bg-primary hover:bg-primary/90 shadow-md"
                  onClick={() => navigate(`/cases/${selectedCase.id}`)}
                >
                  Open Workspace <ExternalLink className="h-3 w-3" />
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 h-8 text-xs font-bold bg-white border-slate-200">
                    Analysis
                  </Button>
                  <Button variant="outline" className="flex-1 h-8 text-xs font-bold bg-white border-slate-200">
                    Reports
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

function CaseGridCard({ 
  caseData, 
  mode, 
  isSelected, 
  onClick,
  onOpen 
}: { 
  caseData: Case; 
  mode: "grid-compact" | "grid-expanded"; 
  isSelected: boolean;
  onClick: () => void;
  onOpen: () => void;
}) {
  return (
    <div 
      className={`
        relative flex flex-col h-full bg-white border rounded-lg transition-all duration-200 cursor-pointer
        ${isSelected 
          ? "border-primary ring-1 ring-primary/20 shadow-md bg-white" 
          : "border-slate-200 hover:border-primary/40 hover:shadow-sm hover:translate-y-[-1px] group"
        }
      `}
      onClick={onClick}
    >
      {/* Selection Indicator */}
      {isSelected && <div className="absolute top-0 left-0 w-1 h-full bg-primary rounded-l-lg" />}

      {/* Card Header */}
      <div className="px-4 py-3 border-b border-transparent flex items-start justify-between">
        <div className="flex flex-col">
          <span className="font-mono text-[10px] text-primary font-bold tracking-widest">{caseData.id}</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{caseData.site}</span>
          </div>
        </div>
        <StatusChip status={caseData.status} />
      </div>

      {/* Card Body */}
      <div className="px-4 pb-3 flex-1 flex flex-col">
        <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2 mb-2 group-hover:text-primary transition-colors">
          {caseData.title}
        </h3>
        
        {/* Severity & Date Row */}
        <div className="flex items-center justify-between mb-4">
          <SeverityChip severity={caseData.severity} />
          <div className="flex items-center gap-1.5 text-slate-400">
            <Clock className="h-3 w-3" />
            <span className="text-[11px] font-bold">{caseData.incidentDate}</span>
          </div>
        </div>

        {/* Expanded Summary Area (Only for Manager view) */}
        {mode === "grid-expanded" && (
          <div className="mb-4 p-2.5 rounded bg-slate-50 border border-slate-100">
             <p className="text-[11px] text-slate-600 line-clamp-3 font-medium italic italic">
               {caseData.summary}
             </p>
          </div>
        )}

        <div className="mt-auto space-y-4 pt-1">
          {/* Metadata Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200">
                <span className="text-[9px] font-bold text-slate-600">{caseData.owner.split(' ').map(n => n[0]).join('')}</span>
              </div>
              <span className="text-xs font-bold text-slate-700">{caseData.owner}</span>
            </div>
            <span className="text-[11px] font-bold text-slate-400">{caseData.updated}</span>
          </div>

          {/* Metrics Grid */}
          <div className="flex items-center gap-4 border-t border-slate-100 pt-3">
            <div className="flex items-center gap-1.5" title="Evidence Count">
              <Paperclip className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-xs font-bold text-slate-700">{caseData.evidenceCount}</span>
            </div>
            <div className="flex items-center gap-1.5" title="Reports Count">
              <FileText className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-xs font-bold text-slate-700">{caseData.reportsCount}</span>
            </div>
            {caseData.pendingReview > 0 && (
              <div className="flex items-center gap-1.5" title="Pending Reviews">
                <MessageSquare className="h-3.5 w-3.5 text-status-review" />
                <span className="text-xs font-bold text-status-review">{caseData.pendingReview}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="px-4 py-2 bg-slate-50/50 border-t flex items-center justify-between rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={(e) => { e.stopPropagation(); onOpen(); }}
          className="text-xs font-bold text-primary flex items-center gap-1 hover:underline"
        >
          View Case <ChevronRight className="h-3 w-3" />
        </button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <button className="p-1 rounded hover:bg-slate-200 transition-colors">
              <MoreVertical className="h-3.5 w-3.5 text-slate-400" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={onOpen}>
              <ExternalLink className="mr-2 h-3.5 w-3.5" />
              Open case
            </DropdownMenuItem>
            <DropdownMenuItem>
              <FileText className="mr-2 h-3.5 w-3.5" />
              View reports
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Paperclip className="mr-2 h-3.5 w-3.5" />
              View evidence
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

