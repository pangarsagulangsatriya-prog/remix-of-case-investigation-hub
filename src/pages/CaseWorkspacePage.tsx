// BUILD_VERSION: 2026-04-28 — Modularized Forensic Architecture
import React, { useState, useEffect, useMemo, Suspense } from "react"; 
import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { useCase, useCases } from "@/hooks/useCases";
import { useEvidence, useUploadEvidence } from "@/hooks/useEvidence";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, ChevronLeft, ChevronRight, Clock } from "lucide-react";

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

  // Real Data Hooks
  const { data: cases } = useCases();
  const { data: caseData, isLoading: caseLoading, isError: caseError } = useCase(caseId || "");
  const { isLoading: evidenceLoading, isError: evidenceError } = useEvidence(caseId || "");

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
                <h1 className="text-xl font-bold tracking-tight text-slate-900 border-none p-0 flex items-center gap-2 leading-none">
                  {caseData?.title || "Unknown Case"} <span className="text-slate-400 font-mono text-sm leading-none ml-1">#{caseData?.case_number || "???"}</span>
                </h1>
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
              <Button className="h-9 font-bold px-4 bg-slate-900 text-white ">Submit Case</Button>
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
