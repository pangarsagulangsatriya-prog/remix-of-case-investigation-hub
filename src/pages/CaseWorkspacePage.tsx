// BUILD_VERSION: 2026-05-18 — Modularized Forensic Architecture with Inline Renaming
import React, { useState, useEffect, useMemo, Suspense } from "react"; 
import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { useCase, useCases, useUpdateCase, useDeleteCase } from "@/hooks/useCases";
import { useEvidence, useUploadEvidence } from "@/hooks/useEvidence";
import { useInsertAuditLog } from "@/hooks/useAuditLogs";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { StatusChip } from "@/components/StatusChip";
import { Loader2, ArrowLeft, ChevronLeft, ChevronRight, Clock, AlertTriangle, Pencil, Check, X, Trash2, ShieldAlert, Lock, Cpu, ExternalLink, CheckCircle2, Database, FileText, BookOpen, User, PlayCircle, List, Search, ChevronDown, Building2, MapPin, Target, Sparkles, Server, Calendar } from "lucide-react";
import { TourProvider, useTour } from '@/components/workspace/TourContext';
import { ProductTourOverlay } from '@/components/workspace/ProductTourOverlay';
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { AgentState, ReportStatusType, ReportSnapshot, ReportAuditEntry } from "@/types/workspace";
import { initialAgentsState } from "@/components/workspace/Tabs/AnalysisTab";
import { useReadiness } from "@/hooks/useReadiness";
import { EvidenceReadinessModal } from "@/components/workspace/EvidenceReadinessModal";


// Modular Tab Components (Lazy Loaded)
const ExtractionTab = React.lazy(() => import("@/components/workspace/Tabs/ExtractionTab"));
const EvidenceTab = React.lazy(() => import("@/components/workspace/Tabs/EvidenceTab"));
const AnalysisTab = React.lazy(() => import("@/components/workspace/Tabs/AnalysisTab"));
const ReportsTab = React.lazy(() => import("@/components/workspace/Tabs/ReportsTab"));
const ReviewTab = React.lazy(() => import("@/components/workspace/Tabs/ReviewTab"));
const AuditTrailTab = React.lazy(() => import("@/components/workspace/Tabs/AuditTrailTab"));

const tabs = ["CCR", "Evidence", "Analysis", "Reports"];

class WorkspaceErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: any }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen flex-col items-center justify-center bg-slate-50 p-10">
          <div className="bg-white border border-rose-200 p-8 rounded-sm max-w-lg w-full shadow-2xl">
            <h2 className="text-xl font-black text-rose-600 uppercase tracking-widest mb-4">Workspace Integrity Failure</h2>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              A runtime error occurred within the forensic workspace. This may be due to a malformed data payload or a missing component chunk.
            </p>
            <div className="bg-slate-900 text-rose-300 p-4 rounded font-mono text-[10px] overflow-auto max-h-40 mb-6">
              {this.state.error?.toString()}
            </div>
            <Button onClick={() => window.location.reload()} className="w-full bg-slate-900 text-white font-bold">
              Hard Reload System
            </Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Standalone ProductTourButton — declared outside CaseWorkspaceInner so it can call useTour()
const ProductTourButton = () => {
  const { startTour } = useTour();
  return (
    <button 
      onClick={startTour} 
      className="group flex items-center justify-center border border-slate-200 bg-white rounded-md px-3 h-9 hover:border-emerald-200 hover:bg-emerald-50 transition-all duration-300 focus:outline-none overflow-hidden"
      title="Panduan"
    >
      <Sparkles className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 transition-colors shrink-0" />
      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 group-hover:text-emerald-700 transition-all duration-300 max-w-0 opacity-0 group-hover:max-w-xs group-hover:opacity-100 group-hover:ml-2 whitespace-nowrap">Panduan</span>
    </button>
  );
};

function CaseWorkspaceInner() {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [agents, setAgents] = useState<AgentState[]>(initialAgentsState);
  const [reportStatus, setReportStatus] = useState<ReportStatusType>('EMPTY');
  const [reportSnapshot, setReportSnapshot] = useState<ReportSnapshot | null>(null);
  const [reportAuditLogs, setReportAuditLogs] = useState<ReportAuditEntry[]>([]);
  const [showAuditTrail, setShowAuditTrail] = useState(false);
  const [hasDemoDerivation, setHasDemoDerivation] = useState(false);

  const { currentStatus, latestRun, isOutdated, isOverrideActive, overrideAnalysis } = useReadiness(caseId);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [overrideNote, setOverrideNote] = useState("");
  const [overrideAck, setOverrideAck] = useState(false);
  const hasCritical = latestRun?.results.some(c => c.level === "REQUIRED" && (c.status === "MISSING" || c.status === "BROKEN")) ?? false;


  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  const [showCaseList, setShowCaseList] = useState(false);
  const [caseSearchQuery, setCaseSearchQuery] = useState("");
  const [showAIProgress, setShowAIProgress] = useState(false);

  const updateCaseMutation = useUpdateCase();
  const insertAuditLogMutation = useInsertAuditLog();

  // Real Data Hooks
  const { data: cases } = useCases();
  const { data: caseData, isLoading: caseLoading, isError: caseError } = useCase(caseId || "");
  const { data: evidenceData, isLoading: evidenceLoading, isError: evidenceError } = useEvidence(caseId || "");

  // Delete Case Workflow States
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteCaptchaInput, setDeleteCaptchaInput] = useState("");
  const [isConsentChecked, setIsConsentChecked] = useState(false);
  const deleteCaseMutation = useDeleteCase();

  // Active Process Interlock / Validation
  const evidenceFiles = evidenceData?.files || [];
  const runningFiles = evidenceFiles.filter(f => f.extraction_status === "pending" || f.extraction_status === "processing");
  const isAnalysisActive = localStorage.getItem(`analysis_running_${caseId}`) === "true";
  const isProcessingActive = runningFiles.length > 0 || isAnalysisActive;

  // AI Progress Sync (matching CaseListPage)
  const aiSteps = [
    { step: "Ekstraksi Data Bukti", done: true }, // Default true for mock consistency
    { step: "Analisis Fact & Cronology", done: caseData?.status !== "draft" },
    { step: "Analisis Aktor", done: caseData?.status !== "draft" },
    { step: "Analisis PEEPO", done: caseData?.status !== "draft" && caseData?.status !== "in_progress" },
    { step: "Analisis IPLS", done: caseData?.status !== "draft" && caseData?.status !== "in_progress" },
    { step: "Analisis Prevention", done: (caseData?.reports_count ?? 0) > 0 || caseData?.status === "approved" || caseData?.status === "closed" },
    { step: "Submit AI value", done: caseData?.status === "approved" || caseData?.status === "closed" },
  ];
  const aiCompletedCount = aiSteps.filter(s => s.done).length;
  const aiProgressPercent = Math.round((aiCompletedCount / aiSteps.length) * 100);

  const handleDeleteCase = async () => {
    if (isProcessingActive) {
      toast.error(isAnalysisActive 
        ? "Proses analisis AI sedang berjalan menggunakan sumber daya dari repositori bukti. Silakan tunggu hingga selesai."
        : "Proses ekstraksi/analisis masih berjalan pada berkas bukti. Silakan tunggu hingga selesai."
      );
      return;
    }
    if (deleteCaptchaInput.trim() !== (caseData?.case_number || "")) {
      toast.error("Kode verifikasi captcha tidak cocok.");
      return;
    }
    if (!isConsentChecked) {
      toast.error("Anda harus menyetujui pernyataan kesediaan.");
      return;
    }

    try {
      await deleteCaseMutation.mutateAsync(caseId || "");
      toast.success("Kasus berhasil dihapus secara permanen.");
      
      // Audit log
      insertAuditLogMutation.mutate({
        case_id: caseId || "",
        action: `Permanently deleted case "${caseData?.title}"`,
        entity_type: "case",
        entity_name: caseData?.title || ""
      });

      navigate("/cases");
    } catch (err: any) {
      toast.error(`Gagal menghapus kasus: ${err.message || 'Error tidak dikenal'}`);
    }
  };

  useEffect(() => {
    if (caseData?.title) {
      setTitleInput(caseData.title);
    }
  }, [caseData?.title]);

  useEffect(() => {
    const checkDemo = async () => {
      try {
        const { count, error } = await supabase
          .from('evidence_audio_derivation_outputs')
          .select('*', { count: 'exact', head: true })
          .eq('case_id', caseId)
          .eq('is_active', true)
          .eq('is_demo_override', true);
        
        if (error) {
          // Silent fail if table missing
          setHasDemoDerivation(false);
          return;
        }
        
        setHasDemoDerivation((count || 0) > 0);
      } catch (e) {
        setHasDemoDerivation(false);
      }
    };
    if (caseId) checkDemo();
  }, [caseId]);

  const handleSaveTitle = async () => {
    const trimmedTitle = titleInput.trim();
    if (!trimmedTitle) {
      toast.error("Case title cannot be empty");
      setTitleInput(caseData?.title || "");
      setIsEditingTitle(false);
      return;
    }
    
    if (trimmedTitle === caseData?.title) {
      setIsEditingTitle(false);
      return;
    }

    try {
      await updateCaseMutation.mutateAsync({
        id: caseId || "",
        title: trimmedTitle
      });
      toast.success("Case renamed successfully");
      setIsEditingTitle(false);

      // Audit Log insertion
      insertAuditLogMutation.mutate({
        case_id: caseId || "",
        action: `Renamed case to "${trimmedTitle}"`,
        entity_type: "case",
        entity_name: trimmedTitle
      });
    } catch (err: any) {
      toast.error(`Failed to rename case: ${err.message || 'Unknown error'}`);
      setTitleInput(caseData?.title || "");
    }
  };

  const currentIndex = Array.isArray(cases) ? cases.findIndex(c => c.id === caseId) : -1;
  const prevCase = currentIndex > 0 ? cases![currentIndex - 1] : null;
  const nextCase = currentIndex < (cases?.length ?? 0) - 1 ? cases![currentIndex + 1] : null;

  if (caseLoading || evidenceLoading) {
    return (
      <AppLayout>
        <div className="flex h-full min-h-[400px] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Synchronizing Intelligence Case…</p>
          </div>
        </div>
      </AppLayout>

    );
  }

  if (caseError || evidenceError || !caseId) {
    return (
      <AppLayout>
        <div className="flex h-full flex-col items-center justify-center p-20 text-center">
          <h2 className="text-lg font-black text-slate-900 uppercase mb-2">Case Resolution Failed</h2>
          <p className="text-sm text-slate-500 mb-8 max-w-sm">The intelligence package for this case ID could not be retrieved from the central repository.</p>
          <Button onClick={() => navigate('/cases')} variant="outline">Return to Case Directory</Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <WorkspaceErrorBoundary>
      <ProductTourOverlay />
      <AppLayout hideHeader>
        <div className="flex flex-col h-screen overflow-hidden bg-slate-50/10">
            {/* Global Utility Bar */}
            <div className="bg-slate-50 border-b px-8 py-2 flex items-center justify-between shrink-0 relative z-30 no-print">
              <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => navigate('/cases')}
                    className="h-6 px-2 -ml-2 text-[10px] font-bold text-slate-500 hover:text-slate-900 gap-1 rounded uppercase tracking-widest transition-colors"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" /> KEMBALI
                  </Button>
                  <div className="h-3 w-[1px] bg-slate-300 mx-1"></div>
                  <div className="flex items-center">
                     <div className="relative mr-1">
                       <Button
                         variant="ghost"
                         size="sm"
                         onClick={() => setShowCaseList(!showCaseList)}
                         className={`h-6 px-2 text-[9px] font-bold rounded gap-1.5 transition-colors uppercase tracking-widest ${showCaseList ? 'bg-slate-200 text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}
                         title="Semua Kasus"
                       >
                         <List className="h-3.5 w-3.5" /> DAFTAR
                       </Button>
                       {showCaseList && (
                         <div className="absolute left-0 top-full mt-2 bg-white border border-slate-200 shadow-xl rounded-lg p-3 w-[300px] z-50">
                            <div className="relative mb-3">
                              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                              <input 
                                type="text" 
                                placeholder="Search cases..." 
                                value={caseSearchQuery}
                                onChange={(e) => setCaseSearchQuery(e.target.value)}
                                className="w-full text-xs border border-slate-200 rounded-md pl-8 pr-3 py-1.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                              />
                            </div>
                            <div className="max-h-[300px] overflow-y-auto pr-1 space-y-1">
                              {cases?.filter(c => c.title.toLowerCase().includes(caseSearchQuery.toLowerCase()) || c.id.toLowerCase().includes(caseSearchQuery.toLowerCase())).map(c => (
                                 <div 
                                   key={c.id}
                                   onClick={() => { navigate(`/cases/${c.id}`); setShowCaseList(false); }}
                                   className={`p-2 rounded cursor-pointer transition-colors ${c.id === caseId ? 'bg-emerald-50 text-emerald-700' : 'hover:bg-slate-50 text-slate-700'}`}
                                 >
                                   <div className="truncate text-xs font-bold leading-tight">{c.title || 'Untitled Case'}</div>
                                   <div className="text-[9px] text-slate-400 font-medium uppercase tracking-wider mt-0.5">ID: {c.id.substring(0,8)}</div>
                                 </div>
                              ))}
                              {cases?.filter(c => c.title.toLowerCase().includes(caseSearchQuery.toLowerCase()) || c.id.toLowerCase().includes(caseSearchQuery.toLowerCase())).length === 0 && (
                                 <div className="text-xs text-slate-400 text-center py-6 font-medium">No cases found.</div>
                              )}
                            </div>
                         </div>
                       )}
                     </div>
                    <Button
                       variant="ghost"
                       size="sm"
                       disabled={!prevCase}
                       onClick={() => navigate(`/cases/${prevCase?.id}`)}
                       className="h-6 px-2 text-[9px] font-bold text-slate-500 hover:text-slate-900 rounded gap-1.5 uppercase tracking-widest transition-colors"
                       title="Kasus Sebelumnya"
                     >
                       <ChevronLeft className="h-3.5 w-3.5" /> SEBELUMNYA
                     </Button>
                     <Button
                       variant="ghost"
                       size="sm"
                       disabled={!nextCase}
                       onClick={() => navigate(`/cases/${nextCase?.id}`)}
                       data-tour="next-case-btn"
                       className="h-6 px-2 text-[9px] font-bold text-slate-500 hover:text-slate-900 rounded gap-1.5 uppercase tracking-widest transition-colors"
                       title="Kasus Selanjutnya"
                     >
                       SELANJUTNYA <ChevronRight className="h-3.5 w-3.5" />
                     </Button>
                  </div>
              </div>
              
              <div className="flex items-center gap-4">
                 <a href="#" className="flex items-center gap-1.5 text-[9px] font-bold text-slate-500 hover:text-slate-900 uppercase tracking-widest transition-colors">
                   <BookOpen className="h-3 w-3" /> Documentation
                 </a>
                 <Button 
                   variant="outline" 
                   size="sm" 
                   onClick={() => setShowAuditTrail(!showAuditTrail)} 
                   className={`h-6 text-[9px] font-bold px-3 uppercase tracking-wider rounded-full bg-white border-slate-200 shadow-sm transition-colors ${showAuditTrail ? 'bg-slate-100 text-slate-900 border-slate-300' : 'text-slate-600 hover:text-slate-900'}`}
                 >
                   <Clock className="h-3 w-3 mr-1.5" />
                   {showAuditTrail ? "Close Audit Trail" : "Audit Trail"}
                 </Button>
                 <div className="h-4 w-[1px] bg-slate-300 mx-1"></div>
                 <div className="relative">
                   <button onClick={() => setShowProfile(!showProfile)} className="flex items-center justify-center h-6 w-6 rounded-full bg-slate-200 text-slate-500 hover:bg-slate-300 hover:text-slate-700 transition-colors focus:outline-none">
                     <User className="h-3.5 w-3.5" />
                   </button>
                   {showProfile && (
                     <div className="absolute right-0 top-full mt-2 bg-white border border-slate-200 shadow-xl rounded-lg p-4 min-w-[200px] z-50">
                       <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Signed in as</div>
                       <div className="text-sm font-bold text-slate-800">Investigator Pro</div>
                       <div className="text-xs text-slate-500 mt-1">ID: INV-88293</div>
                     </div>
                   )}
                 </div>
              </div>
            </div>

            {/* Main Workspace Header Container */}
            <div id="tour-step-1-header" data-tour="workspace-header" className="bg-white border-b flex flex-col shrink-0 relative z-20">
              {/* Main Header Top Row (Title + Controls) */}
              <div className="px-6 pt-4 pb-2 flex items-start justify-between gap-4">
                 {/* Project Title Area */}
                 <div className="flex-1 min-w-[300px] flex flex-col items-start">
                   <div className="flex-1 w-full">
                     {/* Top Row: ID, Date, Investigation Status */}
                     <div className="flex items-center gap-2 mb-1.5 text-[9px] font-bold tracking-wider uppercase">
                       <span className="text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                         {caseData?.id?.substring(0, 8) || "N/A"}
                       </span>
                       <div className="h-1 w-1 rounded-full bg-slate-300 hidden md:block mx-1"></div>
                       <div className="flex items-center gap-1.5 text-slate-400">
                         <Clock className="h-3 w-3" />
                         {caseData?.created_at ? new Date(caseData.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Date Unknown'}
                       </div>
                       <div className="h-1 w-1 rounded-full bg-slate-300 hidden md:block mx-1"></div>
                       <div className="flex items-center gap-1.5 text-slate-700 font-black">
                         {caseData?.investigation_status || "INVESTIGASI"}
                       </div>
                     </div>

                     {/* Middle Row: Title Area */}
                     {isEditingTitle ? (
                       <div className="flex items-center gap-2">
                         <input
                           type="text"
                           value={titleInput}
                           onChange={(e) => setTitleInput(e.target.value)}
                           onKeyDown={(e) => {
                             if (e.key === "Enter") handleSaveTitle();
                             else if (e.key === "Escape") {
                               setIsEditingTitle(false);
                               setTitleInput(caseData?.title || "");
                             }
                           }}
                           onBlur={handleSaveTitle}
                           className="text-lg font-bold tracking-tight text-slate-900 border border-slate-200 rounded px-2.5 py-1 bg-slate-50 w-full focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all leading-tight h-8"
                           autoFocus
                           maxLength={100}
                           disabled={updateCaseMutation.isPending}
                         />
                         <Button size="sm" variant="ghost" onClick={handleSaveTitle} disabled={updateCaseMutation.isPending} className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded shrink-0">
                           {updateCaseMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin text-slate-400" /> : <Check className="h-4 w-4" />}
                         </Button>
                       </div>
                     ) : (
                       <div 
                         className="group/title cursor-pointer py-1 px-1.5 -ml-1.5 rounded hover:bg-slate-50 transition-colors w-full"
                         onClick={() => setIsEditingTitle(true)}
                         title={caseData?.title || "Click to rename case"}
                       >
                         <div className="flex items-start gap-2">
                           <h1 className="text-lg font-medium tracking-tight text-slate-400 border-none p-0 flex items-center gap-2 leading-none uppercase">
                             {caseData?.title ? <span className="text-slate-700 font-bold line-clamp-1">{caseData.title}</span> : "UNTITLED PROJECT..."}
                           </h1>
                           <button className="opacity-0 group-hover/title:opacity-100 p-1 mt-0 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-all shrink-0">
                             <Pencil className="h-3 w-3" />
                           </button>
                         </div>
                       </div>
                     )}
                     
                     {/* Bottom Row: AI Status and Progress */}
                     <div className="mt-1 flex items-center gap-2 relative z-50">
                       <StatusChip status={caseData?.ai_status || "belum_mulai"} />
                       <div 
                         onClick={() => setShowAIProgress(!showAIProgress)}
                         className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-full px-2 py-0.5 cursor-pointer hover:bg-slate-100 hover:border-emerald-200 transition-all group"
                       >
                          <Sparkles className="h-3 w-3 text-emerald-500 group-hover:text-emerald-600" />
                          <div className="w-16 h-1 bg-slate-200 rounded-full overflow-hidden">
                             <div className="h-full bg-emerald-500 rounded-full transition-all duration-300" style={{width: `${aiProgressPercent}%`}}></div>
                          </div>
                          <span className="text-[9px] font-bold text-slate-600 group-hover:text-emerald-700">{aiProgressPercent}%</span>
                       </div>
                       
                       {showAIProgress && (
                          <div className="absolute top-full mt-2 left-0 bg-white border border-slate-200 rounded-lg shadow-xl p-4 w-64 z-50">
                             <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                                <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest">PROGRESS AI INVESTIGASI</div>
                                <button onClick={() => setShowAIProgress(false)} className="hover:bg-slate-100 p-1 rounded-full transition-colors"><X className="h-3 w-3 text-slate-400 hover:text-slate-600" /></button>
                             </div>
                             <div className="space-y-2">
                                {aiSteps.map((s, idx) => {
                                  const isCurrent = !s.done && (idx === 0 || aiSteps[idx - 1].done);
                                  return (
                                    <div key={s.step} className={cn("flex items-center gap-2 text-[10px] font-medium", s.done ? "text-slate-600" : isCurrent ? "text-emerald-600" : "text-slate-400")}>
                                      {s.done ? (
                                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                      ) : isCurrent ? (
                                        <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-500" />
                                      ) : (
                                        <div className="h-3.5 w-3.5 rounded-full border border-slate-300 flex items-center justify-center text-[7px]">{idx + 1}</div>
                                      )}
                                      <span>{s.step}</span>
                                    </div>
                                  );
                                })}
                             </div>
                          </div>
                       )}
                     </div>
                   </div>
                 </div>
                 
                 {/* Right Controls Area */}
                 <div className="flex flex-row justify-end items-center gap-2 mt-1">
                    <button onClick={() => setShowTutorial(true)} title="Video" className="group flex items-center justify-center border border-slate-200 bg-white rounded-md px-3 h-9 hover:border-emerald-200 hover:bg-emerald-50 transition-all duration-300 focus:outline-none overflow-hidden">
                      <PlayCircle className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 transition-colors shrink-0" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 group-hover:text-emerald-700 transition-all duration-300 max-w-0 opacity-0 group-hover:max-w-xs group-hover:opacity-100 group-hover:ml-2 whitespace-nowrap">Video</span>
                    </button>
                    <ProductTourButton />
                 </div>
              </div>

              {/* Tabs Navigation Bottom Row */}
              <div className="px-6 flex items-end gap-1 mt-2 no-print">
                 {[
                   { id: 1, name: "CCR", isActive: currentStep === 1 && !showAuditTrail, onClick: () => { setCurrentStep(1); setShowAuditTrail(false); } },
                   { id: 2, name: "Evidence", isActive: currentStep === 2 && !showAuditTrail, onClick: () => { setCurrentStep(2); setShowAuditTrail(false); } },
                   { id: 3, name: "Analysis", isActive: currentStep === 3 && !showAuditTrail, onClick: () => {
                      if (currentStatus === "CHECKING") {
                         toast.error("Pemeriksaan data masih berlangsung. Tunggu hingga pemeriksaan selesai sebelum memulai analisis.");
                         return;
                      }
                      if (currentStatus === "NOT_CHECKED" || currentStatus === "OUTDATED" || ((currentStatus === "NEEDS_ATTENTION" || currentStatus === "NOT_READY") && !isOverrideActive)) {
                         setIsAnalysisModalOpen(true);
                         return;
                      }
                      setCurrentStep(3);
                      setShowAuditTrail(false);
                   } },
                   { id: 4, name: "Reports", isActive: currentStep === 4 && !showAuditTrail, onClick: () => { setCurrentStep(4); setShowAuditTrail(false); } },
                 ].map((tab) => (
                    <button
                      key={tab.name}
                      onClick={tab.onClick}
                      className={cn(
                        "px-6 py-2.5 text-xs font-bold transition-all relative focus:outline-none border-b-[3px]",
                        tab.isActive 
                          ? "text-emerald-800 bg-[#dcfce7] border-emerald-600"
                          : "text-slate-500 hover:text-slate-800 hover:bg-slate-50 border-transparent"
                      )}
                    >
                      {tab.name}
                    </button>
                 ))}
              </div>
            </div>

            {/* Step Content Area */}
            <div className="flex-1 overflow-hidden relative bg-slate-50/30">
              <Suspense fallback={
                <div className="flex h-full items-center justify-center">
                  <Loader2 className="h-8 w-8 text-slate-300 animate-spin" />
                </div>
              }>
                {showAuditTrail ? (
                  <AuditTrailTab />
                ) : (
                  <>
                    {currentStep === 1 && <ExtractionTab />}
                    {currentStep === 2 && <EvidenceTab onProceedToAnalysis={() => {
                      setCurrentStep(3);
                      setShowAuditTrail(false);
                    }} />}
                    {currentStep === 3 && <AnalysisTab agents={agents} setAgents={setAgents} reportStatus={reportStatus} />}
                    {currentStep === 4 && <ReportsTab 
                      agents={agents} 
                      reportStatus={reportStatus}
                      setReportStatus={setReportStatus}
                      reportSnapshot={reportSnapshot}
                      setReportSnapshot={setReportSnapshot}
                      reportAuditLogs={reportAuditLogs}
                      setReportAuditLogs={setReportAuditLogs}
                    />}
                  </>
                )}
              </Suspense>
            </div>

            
            <EvidenceReadinessModal 
              open={isAnalysisModalOpen} 
              onOpenChange={setIsAnalysisModalOpen} 
              onProceedToAnalysis={() => {
                setCurrentStep(3);
                setShowAuditTrail(false);
              }}
            />

            {/* Delete Case Confirmation Modal */}
            {isDeleteModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-[6px] transition-all duration-300">
                <div className="bg-white border border-slate-200/80 w-full max-w-md rounded-md shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-[0.98] duration-200 border-t-4 border-t-rose-600">
                  {/* Header Banner - Clinical, precise layout */}
                  <div className="px-6 py-5 flex items-start gap-4 border-b border-slate-100 bg-slate-50/50">
                    <div className={`h-10 w-10 rounded flex items-center justify-center shrink-0 shadow-sm border ${isProcessingActive ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-rose-50 border-rose-200 text-rose-600'}`}>
                      <ShieldAlert className="h-5 w-5 stroke-[2]" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] font-black text-rose-600 uppercase tracking-[0.25em] block leading-none">
                        {isProcessingActive ? 'SYSTEM PURGE LOCKED' : 'DESTRUCTION PROTOCOL'}
                      </span>
                      <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight leading-tight">
                        {isProcessingActive ? 'Penghapusan Ditangguhkan' : 'Hapus Kasus Forensik'}
                      </h3>
                      <p className="text-[10px] text-slate-400 font-semibold tracking-tight">
                        {isProcessingActive ? 'Interlock proteksi berkas aktif' : 'Tindakan kritis • Bersifat permanen & irreversible'}
                      </p>
                    </div>
                  </div>

                  {/* Content Body */}
                  <div className="p-6 space-y-5 flex-1 overflow-y-auto">
                    {isProcessingActive ? (
                      /* CASE A: Active Extraction / Analysis Running */
                      <div className="space-y-4">
                        <div className="bg-rose-50/30 border border-rose-100 p-4 rounded-sm space-y-3">
                          <span className="text-[10px] font-black text-rose-700 uppercase tracking-widest block flex items-center gap-1.5 leading-none">
                            <Cpu className="h-3.5 w-3.5 animate-spin" />
                            {isAnalysisActive ? "Analisis AI Sedang Berjalan" : `Berkas Bukti Aktif (${runningFiles.length})`}
                          </span>
                          <p className="text-xs font-semibold text-rose-950/80 leading-relaxed">
                            {isAnalysisActive 
                              ? "Ada proses analisis AI (Fact & Chronology, dll.) yang sedang berjalan menggunakan sumber daya dari repositori bukti pada kasus ini. Demi menjaga integritas data dan kestabilan sistem, tindakan penghapusan diblokir hingga proses analisis selesai secara tuntas."
                              : "Ada proses ekstraksi data bukti forensik yang sedang berlangsung pada kasus ini. Demi menjaga integritas data dan kestabilan sistem, tindakan penghapusan diblokir hingga seluruh proses berikut selesai secara tuntas."}
                          </p>
                          
                          {!isAnalysisActive && (
                            <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                              {runningFiles.map(f => (
                                <div key={f.id} className="flex items-center justify-between p-2.5 bg-white border border-rose-100/50 rounded-sm shadow-sm">
                                  <div className="flex items-center gap-2">
                                    <Loader2 className="h-3.5 w-3.5 text-rose-500 animate-spin" />
                                    <span className="text-xs font-bold text-slate-700 truncate max-w-[200px]">{f.name}</span>
                                  </div>
                                  <span className="text-[9px] font-black text-rose-600 uppercase tracking-wider bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                                    {f.extraction_status}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      /* CASE B: Safe to Delete (Idle) */
                      <div className="space-y-5">
                        {/* Authorized Initiator Info - Dossier / Badge Style */}
                        <div className="bg-slate-50 border border-slate-100 p-4 rounded-sm relative overflow-hidden space-y-3 shadow-inner">
                          <div className="absolute top-0 right-0 bg-slate-200/50 border-l border-b border-slate-200/80 text-[7px] font-black text-slate-500 uppercase tracking-widest px-2.5 py-1 rounded-bl-sm">
                            AUTHENTICATED OPERATOR
                          </div>
                          
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block leading-none">
                            Initiating Officer
                          </span>
                          
                          <div className="flex items-center gap-3 pt-1">
                            <div className="h-9 w-9 rounded-sm bg-slate-900 text-white flex items-center justify-center font-bold text-xs uppercase border border-slate-800">
                              AD
                            </div>
                            <div>
                              <div className="text-xs font-black text-slate-900 uppercase">Administrator (admin)</div>
                              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Senior Lead Investigator — Forensic Ops</div>
                            </div>
                          </div>
                        </div>

                        {/* Captcha Verification - Precise typography */}
                        <div className="space-y-2.5">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">
                            Masukkan Kode Konfirmasi Kasus
                          </label>
                          <p className="text-xs text-slate-500 leading-normal">
                            Ketik kode kasus unik <span className="font-mono font-bold bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded border border-rose-100/50">#{caseData?.case_number}</span> di bawah untuk membypass proteksi.
                          </p>
                          <div className="relative">
                            <input
                              type="text"
                              value={deleteCaptchaInput}
                              onChange={(e) => setDeleteCaptchaInput(e.target.value)}
                              placeholder="Ketik nomor kasus di sini..."
                              className="w-full text-xs font-mono tracking-widest border border-slate-200 rounded p-2.5 bg-slate-50 focus:outline-none focus:bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all uppercase h-10 pr-10 shadow-sm"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                              <Lock className="h-4 w-4" />
                            </div>
                          </div>
                        </div>

                        {/* Consent Checkbox - Formally Wrapped */}
                        <label className="flex gap-3 items-start cursor-pointer group select-none bg-rose-50/20 hover:bg-rose-50/30 border border-rose-100/40 p-3.5 rounded-sm transition-all">
                          <input
                            type="checkbox"
                            checked={isConsentChecked}
                            onChange={(e) => setIsConsentChecked(e.target.checked)}
                            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500 cursor-pointer shadow-sm"
                          />
                          <span className="text-xs font-bold text-slate-600 group-hover:text-slate-900 transition-colors leading-relaxed">
                            Saya menyatakan secara sadar bertanggung jawab penuh atas segala konsekuensi penghapusan berkas kasus ini secara permanen dari basis data sistem.
                          </span>
                        </label>
                      </div>
                    )}
                  </div>

                  {/* Footer Action Bar */}
                  <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                    {isProcessingActive ? (
                      <Button 
                        onClick={() => setIsDeleteModalOpen(false)}
                        className="h-10 px-6 bg-slate-900 hover:bg-slate-800 text-white font-black text-[10px] uppercase tracking-widest rounded-[4px] transition-all"
                      >
                        Kembali ke Workspace
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => { setIsDeleteModalOpen(false); setDeleteCaptchaInput(""); setIsConsentChecked(false); }}
                          className="h-10 px-5 font-bold text-xs uppercase tracking-wider rounded-[4px] border-slate-200"
                        >
                          Batalkan
                        </Button>
                        <Button
                          onClick={async () => {
                            try {
                              await deleteCaseMutation.mutateAsync(caseId!);
                              toast.success("Case permanently deleted.");
                              navigate('/cases');
                            } catch (error) {
                              toast.error("Failed to delete case.");
                            }
                          }}
                          disabled={deleteCaptchaInput !== caseData?.case_number || !isConsentChecked || deleteCaseMutation.isPending}
                          className="h-10 px-6 bg-rose-600 hover:bg-rose-700 text-white font-black text-[10px] uppercase tracking-widest rounded-[4px] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        >
                          {deleteCaseMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Hapus Permanen"}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Tutorial Modal */}
            {showTutorial && (
              <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-8 backdrop-blur-sm" onClick={() => setShowTutorial(false)}>
                <div className="bg-white border border-slate-200 rounded-lg shadow-2xl max-w-2xl w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
                  <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">
                    Workspace Tutorial
                    </h2>
                    <button onClick={() => setShowTutorial(false)} className="text-slate-400 hover:text-slate-700 p-1 rounded-md hover:bg-slate-200 transition-colors focus:outline-none">
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="p-6">
                    <p className="text-sm text-slate-600 leading-relaxed">Tutorial content will be available soon.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </AppLayout>
      </WorkspaceErrorBoundary>
  );
}

export default function CaseWorkspacePage() {
  return (
    <TourProvider>
      <CaseWorkspaceInner />
    </TourProvider>
  );
}



