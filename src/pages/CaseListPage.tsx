import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { StatusChip, SeverityChip } from "@/components/StatusChip";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog";
import { useCases, useDeleteCase } from "@/hooks/useCases";
import { toast } from "sonner";
import { 
  Loader2, 
  AlertCircle, 
  Trash2, 
  AlertTriangle,
  Info,
  List,
  FileText,
  Globe,
  Clock,
  History,
  MoreVertical,
  ExternalLink,
  Search,
  Grid
} from "lucide-react";

// Mock types for legacy compatibility if needed, but we'll use Case from hook
import type { Case } from "@/hooks/useCases";

type ViewMode = "table" | "grid-compact" | "grid-expanded";

export default function CaseListPage() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [caseToDelete, setCaseToDelete] = useState<Case | null>(null);

  const { data: casesData, isLoading, error } = useCases();
  const deleteCaseMutation = useDeleteCase();
  const cases = casesData || [];

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
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-64 bg-white border rounded-lg shadow-sm">
                <Loader2 className="h-8 w-8 text-primary animate-spin mb-3" />
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Synchronizing Workspace...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-64 bg-white border rounded-lg shadow-sm p-8 text-center">
                <div className="h-12 w-12 bg-rose-50 rounded-full flex items-center justify-center mb-4">
                  <AlertCircle className="h-6 w-6 text-rose-500" />
                </div>
                <h3 className="text-sm font-black text-slate-900 uppercase mb-2">Sync Error</h3>
                <p className="text-xs text-slate-500 font-medium mb-4 max-w-xs ">{(error as Error).message}</p>
                <Button variant="outline" size="sm" onClick={() => window.location.reload()}>Retry Connection</Button>
              </div>
            ) : cases.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 bg-white border rounded-lg shadow-sm p-8 text-center border-dashed">
                <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 border border-slate-100 shadow-sm">
                  <FileText className="h-8 w-8 text-slate-300" />
                </div>
                <h3 className="text-base font-black text-slate-900 border-none p-0 mb-1">No Cases Found</h3>
                <p className="text-xs text-slate-500 font-medium mb-6 max-w-sm ml-auto mr-auto">Your investigation workspace is empty. Create a new case to start extracting intelligence from evidence.</p>
                <Button size="sm" className="h-9 px-6 font-black uppercase tracking-widest bg-primary" onClick={() => navigate("/cases/new")}>
                  <Plus className="h-4 w-4 mr-2" /> Start New Case
                </Button>
              </div>
            ) : viewMode === "table" ? (
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
                        <td className="pl-4 font-mono text-xs text-primary font-semibold">{c.case_number || c.id.slice(0, 8)}</td>
                        <td className="text-xs font-medium text-slate-900 truncate max-w-[200px]">{c.title}</td>
                        <td className="text-xs text-slate-600 font-medium">Site Alpha</td>
                        <td className="text-xs text-slate-500 font-medium">{new Date(c.created_at).toLocaleDateString()}</td>
                        <td className="py-2.5"><SeverityChip severity={c.severity.toLowerCase() as any} /></td>
                        <td className="py-2.5"><StatusChip status={c.status as any} /></td>
                        <td className="text-xs text-slate-700 font-medium">Admin</td>
                        <td className="text-xs text-center font-medium text-slate-600">0</td>
                        <td className="text-xs text-center font-medium text-slate-600">0</td>
                        <td className="text-xs text-center">
                          <span className="text-slate-300">—</span>
                        </td>
                        <td className="pr-4 py-2.5">
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-xs text-slate-500 font-medium mr-4">{new Date(c.updated_at).toLocaleDateString()}</span>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-slate-200">
                                  <MoreVertical className="h-3.5 w-3.5" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-40">
                                <DropdownMenuItem onClick={() => navigate(`/cases/${c.id}`)}>
                                  <ExternalLink className="mr-2 h-3.5 w-3.5" /> Open Workspace
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="text-rose-600 focus:text-rose-600 focus:bg-rose-50"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setCaseToDelete(c);
                                  }}
                                >
                                  <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete Case
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
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
                      { label: "Case ID", value: selectedCase.case_number, icon: FileText },
                      { label: "Site", value: "Site Alpha", icon: Globe },
                      { label: "Created", value: new Date(selectedCase.created_at).toLocaleDateString(), icon: Clock },
                      { label: "Updated", value: new Date(selectedCase.updated_at).toLocaleDateString(), icon: History },
                      { label: "Status", value: selectedCase.status.toUpperCase(), icon: List },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between py-1.5 px-1 rounded-md hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-2">
                          <item.icon className="h-3 w-3 text-slate-400" />
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
                  <Button 
                    variant="outline" 
                    className="flex-1 h-8 text-xs font-bold bg-white border-slate-200 text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-all"
                    onClick={() => setCaseToDelete(selectedCase)}
                  >
                    <Trash2 className="h-3 w-3 mr-2" /> Delete
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <DeleteCaseDialog 
        caseData={caseToDelete}
        isOpen={!!caseToDelete}
        onClose={() => setCaseToDelete(null)}
        onConfirm={async () => {
          if (caseToDelete) {
            try {
              await deleteCaseMutation.mutateAsync(caseToDelete.id);
              toast.success("Case deleted successfully");
              setCaseToDelete(null);
              if (selectedCase?.id === caseToDelete.id) setSelectedCase(null);
            } catch (err) {
              toast.error("Failed to delete case");
            }
          }
        }}
        isDeleting={deleteCaseMutation.isPending}
      />
    </AppLayout>
  );
}

function DeleteCaseDialog({ 
  caseData, 
  isOpen, 
  onClose, 
  onConfirm,
  isDeleting
}: { 
  caseData: Case | null; 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: () => void;
  isDeleting: boolean;
}) {
  const [captcha, setCaptcha] = useState("");
  const expectedCaptcha = caseData?.case_number || "";

  if (!caseData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden border-none shadow-2xl">
        <div className="bg-rose-600 px-6 py-8 text-white relative">
          <AlertTriangle className="h-12 w-12 text-rose-200/40 absolute top-4 right-4" />
          <h2 className="text-lg font-black uppercase tracking-widest mb-1">Confirm Deletion</h2>
          <p className="text-rose-100 text-xs font-bold uppercase tracking-wider opacity-80">Irreversible Action Protocol</p>
        </div>
        
        <div className="p-6 space-y-6 bg-white">
          <div className="flex gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="h-10 w-10 bg-white rounded-lg border shadow-sm flex items-center justify-center shrink-0">
               <div className="h-6 w-6 bg-rose-50 rounded flex items-center justify-center">
                  <FileText className="h-3.5 w-3.5 text-rose-500" />
               </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-0.5">{caseData.case_number}</p>
              <h4 className="text-sm font-bold text-slate-900 truncate">{caseData.title}</h4>
              <p className="text-2xs text-slate-400 font-bold uppercase mt-1">Severity: {caseData.severity} • Status: {caseData.status}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-rose-600">
              <Info className="h-3.5 w-3.5" />
              <span className="text-[10px] font-black uppercase tracking-widest">Pre-deletion Audit</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Deleting this case will permanently erase all associated 0 evidence files, 0 reports, and all extraction metadata. This operation cannot be undone.
            </p>
          </div>

          <div className="space-y-2 pt-2 border-t">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Security Verification</label>
            <p className="text-xs font-bold text-slate-700 mb-2">
              Please type <span className="text-rose-600 select-all font-black">{expectedCaptcha}</span> below to confirm.
            </p>
            <Input 
              value={captcha}
              onChange={(e) => setCaptcha(e.target.value)}
              placeholder="Confirm case ID..."
              className="h-10 text-sm font-bold bg-slate-50 border-slate-200 focus:bg-white transition-all text-center tracking-widest"
              autoFocus
            />
          </div>
        </div>

        <DialogFooter className="p-4 bg-slate-50 border-t gap-2 sm:gap-0">
          <Button variant="ghost" onClick={onClose} disabled={isDeleting} className="text-xs font-bold uppercase tracking-widest">Cancel</Button>
          <Button 
            variant="destructive" 
            onClick={onConfirm}
            disabled={captcha !== expectedCaptcha || isDeleting}
            className="h-9 px-6 text-xs font-black uppercase tracking-widest bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-200 transition-all gap-2"
          >
            {isDeleting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
            Confirm Deletion
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
          <span className="font-mono text-[10px] text-primary font-bold tracking-widest">{caseData.case_number || caseData.id.slice(0, 8)}</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Site Alpha</span>
          </div>
        </div>
        <StatusChip status={caseData.status as any} />
      </div>

      {/* Card Body */}
      <div className="px-4 pb-3 flex-1 flex flex-col">
        <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2 mb-2 group-hover:text-primary transition-colors">
          {caseData.title}
        </h3>
        
        {/* Severity & Date Row */}
        <div className="flex items-center justify-between mb-4">
          <SeverityChip severity={caseData.severity.toLowerCase() as any} />
          <div className="flex items-center gap-1.5 text-slate-400">
            <Clock className="h-3 w-3" />
            <span className="text-[11px] font-bold">{new Date(caseData.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Expanded Summary Area (Only for Manager view) */}
        {mode === "grid-expanded" && (
          <div className="mb-4 p-2.5 rounded bg-slate-50 border border-slate-100">
             <p className="text-[11px] text-slate-600 line-clamp-3 font-medium italic italic">
               {caseData.description}
             </p>
          </div>
        )}

        <div className="mt-auto space-y-4 pt-1">
          {/* Metadata Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200">
                <span className="text-[9px] font-bold text-slate-600">A</span>
              </div>
              <span className="text-xs font-bold text-slate-700">Admin</span>
            </div>
            <span className="text-[11px] font-bold text-slate-400">{new Date(caseData.updated_at).toLocaleDateString()}</span>
          </div>

          {/* Metrics Grid */}
          <div className="flex items-center gap-4 border-t border-slate-100 pt-3">
            <div className="flex items-center gap-1.5" title="Evidence Count">
              <Paperclip className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-xs font-bold text-slate-700">0</span>
            </div>
            <div className="flex items-center gap-1.5" title="Reports Count">
              <FileText className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-xs font-bold text-slate-700">0</span>
            </div>
            {false && (
              <div className="flex items-center gap-1.5" title="Pending Reviews">
                <MessageSquare className="h-3.5 w-3.5 text-status-review" />
                <span className="text-xs font-bold text-status-review">0</span>
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
            <DropdownMenuItem 
              className="text-rose-600 focus:text-rose-600 focus:bg-rose-50"
              onClick={(e) => {
                e.stopPropagation();
                setCaseToDelete(caseData);
              }}
            >
              <Trash2 className="mr-2 h-3.5 w-3.5" />
              Delete Case
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

