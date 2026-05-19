// BUILD_VERSION: 2026-05-18 — Modularized Forensic Architecture with Inline Renaming
import React, { useState, useEffect, useMemo, Suspense } from "react"; 
import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { useCase, useCases, useUpdateCase, useDeleteCase } from "@/hooks/useCases";
import { useEvidence, useUploadEvidence } from "@/hooks/useEvidence";
import { useInsertAuditLog } from "@/hooks/useAuditLogs";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, ChevronLeft, ChevronRight, Clock, AlertTriangle, Pencil, Check, X, Trash2, ShieldAlert, Lock, Cpu } from "lucide-react";
import { supabase } from "@/lib/supabase";

// Modular Tab Components (Lazy Loaded)
const ExtractionTab = React.lazy(() => import("@/components/workspace/Tabs/ExtractionTab"));
const AnalysisTab = React.lazy(() => import("@/components/workspace/Tabs/AnalysisTab"));
const ReportsTab = React.lazy(() => import("@/components/workspace/Tabs/ReportsTab"));
const ReviewTab = React.lazy(() => import("@/components/workspace/Tabs/ReviewTab"));
const AuditTrailTab = React.lazy(() => import("@/components/workspace/Tabs/AuditTrailTab"));

const tabs = ["Evidence Review", "Analysis", "Reports", "Review", "Audit Trail"];

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

export default function CaseWorkspacePage() {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Evidence Review");
  const [hasDemoDerivation, setHasDemoDerivation] = useState(false);

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState("");

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
      <AppLayout hideHeader>
        <div className="flex flex-col h-screen overflow-hidden bg-slate-50/10">
          {/* Case Header */}
          <div className="bg-white border-b px-6 py-4 flex items-center justify-between shrink-0 relative z-30">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/cases')}
                className="h-9 w-9 p-0 rounded-full hover:bg-slate-100 text-slate-500 border border-slate-100 "
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                {isEditingTitle ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={titleInput}
                      onChange={(e) => setTitleInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleSaveTitle();
                        } else if (e.key === "Escape") {
                          setIsEditingTitle(false);
                          setTitleInput(caseData?.title || "");
                        }
                      }}
                      onBlur={handleSaveTitle}
                      className="text-lg font-bold tracking-tight text-slate-900 border border-slate-200 rounded px-2.5 py-1 bg-slate-50 w-72 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all leading-tight h-8"
                      autoFocus
                      maxLength={100}
                      disabled={updateCaseMutation.isPending}
                    />
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={handleSaveTitle}
                      disabled={updateCaseMutation.isPending}
                      className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded"
                    >
                      {updateCaseMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => {
                        setIsEditingTitle(false);
                        setTitleInput(caseData?.title || "");
                      }}
                      disabled={updateCaseMutation.isPending}
                      className="h-8 w-8 p-0 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div 
                    className="flex items-center gap-2 group/title cursor-pointer py-1 px-1.5 -ml-1.5 rounded hover:bg-slate-50 transition-colors"
                    onClick={() => setIsEditingTitle(true)}
                    title="Click to rename case"
                  >
                    <h1 className="text-xl font-bold tracking-tight text-slate-900 border-none p-0 flex items-center gap-2 leading-none">
                      {caseData?.title || "Unknown Case"}
                    </h1>
                    <span className="text-slate-400 font-mono text-sm leading-none ml-1">#{caseData?.case_number || "???"}</span>
                    <button 
                      className="opacity-0 group-hover/title:opacity-100 p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all ml-1 shrink-0"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 border-r pr-4 border-slate-100">
                 <Button
                   variant="ghost"
                   size="sm"
                   disabled={!prevCase}
                   onClick={() => navigate(`/cases/${prevCase?.id}`)}
                   className="h-8 px-2 text-[10px] font-black uppercase tracking-widest gap-1 text-slate-400 hover:text-slate-900 transition-all"
                 >
                   <ChevronLeft className="h-3.5 w-3.5" /> Previous
                 </Button>
                 <Button
                   variant="ghost"
                   size="sm"
                   disabled={!nextCase}
                   onClick={() => navigate(`/cases/${nextCase?.id}`)}
                   className="h-8 px-2 text-[10px] font-black uppercase tracking-widest gap-1 text-slate-400 hover:text-slate-900 transition-all"
                 >
                   Next <ChevronRight className="h-3.5 w-3.5" />
                 </Button>
              </div>
              <div className="flex items-center gap-2">
                {hasDemoDerivation && (
                   <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-sm animate-pulse mr-2">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                      <span className="text-[10px] font-black text-amber-700 uppercase tracking-tight">Demo Derivation Active</span>
                   </div>
                )}
                <Button
                  variant="outline"
                  onClick={() => {
                    setDeleteCaptchaInput("");
                    setIsConsentChecked(false);
                    setIsDeleteModalOpen(true);
                  }}
                  className="h-9 font-bold px-3 border-rose-200 hover:border-rose-400 hover:bg-rose-50/50 text-rose-600 transition-all flex items-center gap-1.5"
                >
                  <Trash2 className="h-4 w-4" />
                  Hapus Kasus
                </Button>
                <Button className="h-9 font-bold px-4 bg-slate-900 text-white ">Submit Case</Button>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bg-white border-b h-12 flex items-center justify-between px-6 shrink-0 relative z-20 ">
            <div className="flex gap-1 h-full items-center">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`h-full px-5 text-xs font-bold transition-all relative ${
                    activeTab === tab ? "text-primary bg-primary/5" : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  {tab}
                  {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary " />}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-6">
               <div className="flex items-center gap-2 border-l pl-6 border-slate-100">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    {caseData?.created_at ? new Date(caseData.created_at).toLocaleDateString() : 'Now'}
                  </span>
               </div>
            </div>
          </div>

          {/* Tab Content Area */}
          <div className="flex-1 overflow-hidden relative">
            <Suspense fallback={
              <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 text-slate-200 animate-spin" />
              </div>
            }>
              {activeTab === "Evidence Review" && <ExtractionTab />}
              {activeTab === "Analysis" && <AnalysisTab />}
              {activeTab === "Reports" && <ReportsTab />}
              {activeTab === "Review" && <ReviewTab />}
              {activeTab === "Audit Trail" && <AuditTrailTab />}
            </Suspense>
          </div>

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
                      className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-[10px] uppercase tracking-wider px-5 h-9 rounded-sm shadow-sm transition-all"
                    >
                      Kembali ke Workspace
                    </Button>
                  ) : (
                    <>
                      <Button 
                        variant="ghost"
                        onClick={() => setIsDeleteModalOpen(false)}
                        className="text-slate-400 hover:text-slate-800 font-extrabold text-[10px] uppercase tracking-wider h-9 px-4 rounded-sm border border-slate-200/80 bg-white hover:bg-slate-50 transition-all"
                      >
                        Batal
                      </Button>
                      <Button 
                        onClick={handleDeleteCase}
                        disabled={deleteCaptchaInput.trim() !== (caseData?.case_number || "") || !isConsentChecked || deleteCaseMutation.isPending}
                        className="bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-extrabold text-[10px] uppercase tracking-wider px-5 h-9 gap-1.5 rounded-sm shadow-sm transition-all flex items-center justify-center"
                      >
                        {deleteCaseMutation.isPending ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                        {deleteCaseMutation.isPending ? 'Purging...' : 'PURGE CASE PERMANENTLY'}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </AppLayout>
    </WorkspaceErrorBoundary>
  );
}
