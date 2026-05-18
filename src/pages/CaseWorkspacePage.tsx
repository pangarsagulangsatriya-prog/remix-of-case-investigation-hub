// BUILD_VERSION: 2026-05-18 — Modularized Forensic Architecture with Inline Renaming
import React, { useState, useEffect, useMemo, Suspense } from "react"; 
import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { useCase, useCases, useUpdateCase } from "@/hooks/useCases";
import { useEvidence, useUploadEvidence } from "@/hooks/useEvidence";
import { useInsertAuditLog } from "@/hooks/useAuditLogs";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, ChevronLeft, ChevronRight, Clock, AlertTriangle, Pencil, Check, X } from "lucide-react";
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
  const { isLoading: evidenceLoading, isError: evidenceError } = useEvidence(caseId || "");

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
              <div className="flex items-center gap-4">
                {hasDemoDerivation && (
                   <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-sm animate-pulse">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                      <span className="text-[10px] font-black text-amber-700 uppercase tracking-tight">Demo Derivation Active</span>
                   </div>
                )}
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
        </div>
      </AppLayout>
    </WorkspaceErrorBoundary>
  );
}
