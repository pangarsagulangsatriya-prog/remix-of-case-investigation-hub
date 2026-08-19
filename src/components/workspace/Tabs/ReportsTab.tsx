import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { AgentState, ReportStatusType, ReportSnapshot, ReportAuditEntry } from "@/types/workspace";
import { 
  FileText, CheckCircle2, AlertTriangle, History, X, Maximize2, Minimize2, Layout, 
  ChevronLeft, ChevronRight, Lock, FileDown, Loader2, Save, FileCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  ReportCoverPage, ReportFactPage, ReportActorPage, 
  ReportPeepoPage, ReportIplsPage, ReportPreventionPage 
} from "./ReportPages";
import { ReportViewerContext, PAGE_WIDTH, PAGE_HEIGHT } from "./ReportDocumentCanvas";
import { Hand, MousePointer2, ZoomIn, ZoomOut, Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface ReportsTabProps {
  agents: AgentState[];
  reportStatus?: ReportStatusType;
  setReportStatus?: (s: ReportStatusType) => void;
  reportSnapshot?: ReportSnapshot | null;
  setReportSnapshot?: (s: ReportSnapshot | null) => void;
  reportAuditLogs?: ReportAuditEntry[];
  setReportAuditLogs?: (logs: ReportAuditEntry[]) => void;
}

const TOTAL_PAGES = 5;

export default function ReportsTab({ 
  agents,
  reportStatus = 'EMPTY',
  setReportStatus,
  reportSnapshot,
  setReportSnapshot,
  reportAuditLogs = [],
  setReportAuditLogs
}: ReportsTabProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [thumbnailsOpen, setThumbnailsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [isApproving, setIsApproving] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgressText, setExportProgressText] = useState("");

  // --- NEW VIEWER STATE ---
  const [zoomMode, setZoomMode] = useState<number | 'fit-page' | 'fit-width'>('fit-page');
  const [actualZoom, setActualZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [activeTool, setActiveTool] = useState<'pointer' | 'hand'>('pointer');
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  
  // Fit logic
  useEffect(() => {
    if (!canvasContainerRef.current) return;
    const calculateFit = () => {
      const container = canvasContainerRef.current;
      if (!container) return;
      const cw = container.clientWidth;
      const ch = container.clientHeight;
      if (zoomMode === 'fit-page') {
        const scaleX = Math.max(0.1, (cw - 96) / PAGE_WIDTH);
        const scaleY = Math.max(0.1, (ch - 96) / PAGE_HEIGHT);
        setActualZoom(Math.min(scaleX, scaleY));
        setPanOffset({ x: 0, y: 0 });
      } else if (zoomMode === 'fit-width') {
        setActualZoom(Math.max(0.1, (cw - 96) / PAGE_WIDTH));
        setPanOffset({ x: 0, y: 0 });
      } else if (typeof zoomMode === 'number') {
        setActualZoom(zoomMode);
      }
    };
    
    calculateFit();
    const ro = new ResizeObserver(calculateFit);
    ro.observe(canvasContainerRef.current);
    return () => ro.disconnect();
  }, [zoomMode, thumbnailsOpen]);

  // Thumbnail Auto-scroll
  useEffect(() => {
    if (thumbnailsOpen) {
      const activeThumb = document.getElementById(`thumbnail-rail-${currentPage}`);
      if (activeThumb) {
        activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [currentPage, thumbnailsOpen]);

  // Keyboard Shortcuts
  useEffect(() => {
    if (reportStatus === 'EMPTY') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === 'ArrowDown') {
        setCurrentPage(p => Math.min(TOTAL_PAGES, p + 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp' || e.key === 'ArrowUp') {
        setCurrentPage(p => Math.max(1, p - 1));
      } else if ((e.ctrlKey || e.metaKey) && e.key === '=') {
        e.preventDefault();
        setZoomMode(prev => typeof prev === 'number' ? Math.min(prev + 0.1, 3) : actualZoom + 0.1);
      } else if ((e.ctrlKey || e.metaKey) && e.key === '-') {
        e.preventDefault();
        setZoomMode(prev => typeof prev === 'number' ? Math.max(prev - 0.1, 0.4) : actualZoom - 0.1);
      } else if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        e.preventDefault();
        setZoomMode('fit-page');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [reportStatus, actualZoom]);

  // Pan handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    if (activeTool !== 'hand') return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setPanOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };
  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  
  // Autosave simulation
  const [autosaveState, setAutosaveState] = useState<'IDLE' | 'SAVING' | 'SAVED'>('SAVED');
  
  useEffect(() => {
    if (reportStatus === 'DRAFT') {
      const interval = setInterval(() => {
        setAutosaveState('SAVING');
        setTimeout(() => setAutosaveState('SAVED'), 1500);
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [reportStatus]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const handleGenerate = () => {
    setIsGenerating(true);
    setReportStatus?.('DRAFT');
    setReportSnapshot?.({
      reportId: `REP-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      version: '1.0',
      generatedAt: new Date().toISOString(),
      lastSavedAt: new Date().toISOString(),
      agentsSnapshot: JSON.parse(JSON.stringify(agents))
    });
    
    // Simulate generation sequence
    setGenerationStep(1);
    setTimeout(() => setGenerationStep(2), 500);
    setTimeout(() => setGenerationStep(3), 1000);
    setTimeout(() => setGenerationStep(4), 1500);
    setTimeout(() => setGenerationStep(5), 2000);

    setTimeout(() => {
      setIsGenerating(false);
      setGenerationStep(0);
      if (setReportAuditLogs) {
        setReportAuditLogs([{
          id: `audit-${Date.now()}`, timestamp: new Date().toISOString(),
          action: 'REPORT_GENERATED', actor: 'System', version: '1.0'
        }, ...reportAuditLogs]);
      }
    }, 2500);
  };

  const handleApprove = () => {
    setIsApproving(true);
    setTimeout(() => {
      setIsApproving(false);
      setShowApprovalModal(false);
      setReportStatus?.('APPROVED');
      
      const updatedSnapshot = reportSnapshot ? { ...reportSnapshot } : ({} as any);
      updatedSnapshot.lockedAt = new Date().toISOString();
      updatedSnapshot.lockedBy = 'Gulang Satriya';
      setReportSnapshot?.(updatedSnapshot);
      
      if (setReportAuditLogs) {
        setReportAuditLogs([{
          id: `audit-${Date.now()}`, timestamp: new Date().toISOString(),
          action: 'REPORT_APPROVED', actor: 'Gulang Satriya', version: reportSnapshot?.version || '1.0'
        }, ...reportAuditLogs]);
      }
    }, 1500);
  };

  const handleExport = (format: 'pdf' | 'word') => {
    setIsExporting(true);
    const docName = format === 'pdf' ? 'PDF' : 'Word';
    
    toast.promise(
      new Promise((resolve) => {
        setTimeout(() => {
          setIsExporting(false);
          const updatedSnapshot = reportSnapshot ? { ...reportSnapshot } : ({} as any);
          updatedSnapshot.lastExportedAt = new Date().toISOString();
          setReportSnapshot?.(updatedSnapshot);
          
          if (setReportAuditLogs) {
            setReportAuditLogs([{
              id: `audit-${Date.now()}`, timestamp: new Date().toISOString(),
              action: `${docName.toUpperCase()}_EXPORTED`, actor: 'Gulang Satriya', version: reportSnapshot?.version || '1.0'
            }, ...reportAuditLogs]);
          }
          resolve(true);
        }, 2500);
      }),
      {
        loading: `Generating ${docName} document...`,
        success: `Report exported successfully as ${docName}.`,
        error: `Failed to export ${docName}.`
      }
    );
  };

  // Content Selection
  const displayAgents = (reportStatus === 'APPROVED' && reportSnapshot) ? reportSnapshot.agentsSnapshot : agents;
  
  if (reportStatus === 'EMPTY') {
    const readyAgents = agents.filter(a => a.status === 'COMPLETED').length;
    const totalAgents = 5;
    const factAgent = agents.find(a => a.id === "fact");
    const peepoAgent = agents.find(a => a.id === "peepo");
    const prevAgent = agents.find(a => a.id === "prev");
    const actorAgent = agents.find(a => a.id === "actor");
    const iplsAgent = agents.find(a => a.id === "ipls");

    const isAllReady = readyAgents >= totalAgents;

    return (
      <div className="flex h-full w-full items-center justify-center bg-slate-50/10 p-4 sm:p-8">
        <div className="bg-white border border-slate-200 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col md:flex-row max-w-[1120px] w-full rounded-sm overflow-hidden animate-in fade-in duration-200">
          
          {/* LEFT COLUMN - SETUP */}
          <div className="w-full md:w-[42%] p-8 md:p-10 flex flex-col border-b md:border-b-0 md:border-r border-slate-200">
            {!isGenerating ? (
              <div className="flex-1 flex flex-col animate-in fade-in duration-200">
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      REPORT INVESTIGASI
                    </span>
                    <span className="bg-slate-100 text-slate-500 border border-slate-200 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm">
                      Status: Belum Dibuat
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 mb-3">Buat Laporan Lengkap Investigasi</h2>
                  <p className="text-[12px] text-slate-600 leading-relaxed">
                    Sistem akan menyusun preview dari hasil terbaru seluruh agent analisis.
                    Periksa isi report sebelum disahkan dan dikunci.
                  </p>
                </div>

                <div className="mb-8">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                    BAGIAN YANG AKAN DISUSUN
                  </h3>
                  <div className="space-y-2.5">
                    {[
                      { name: 'Fakta & Kronologi', agent: factAgent },
                      { name: 'Analisis Aktor', agent: actorAgent },
                      { name: 'Faktor PEEPO', agent: peepoAgent },
                      { name: 'Lapisan IPLS', agent: iplsAgent },
                      { name: 'Rencana Pencegahan', agent: prevAgent },
                    ].map((section, i) => {
                      const isReady = section.agent?.status === 'COMPLETED';
                      return (
                        <div key={i} className="flex items-center justify-between text-[11.5px]">
                          <div className="flex items-center gap-2">
                            {isReady ? (
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                            ) : (
                              <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                            )}
                            <span className="text-slate-800 font-medium">{section.name}</span>
                          </div>
                          <span className={cn(
                            "text-[10px] font-bold uppercase tracking-wider",
                            isReady ? "text-emerald-600" : "text-amber-600"
                          )}>
                            {isReady ? 'Siap' : 'Belum Selesai'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mb-8 bg-slate-50 border border-slate-200 rounded p-4">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                    SUMBER PREVIEW
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-[10px] text-slate-500 mb-1">Versi data</div>
                      <div className="text-[11px] font-bold text-slate-800">Hasil analisis terbaru</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 mb-1">Total agent</div>
                      <div className="text-[11px] font-bold text-slate-800">{readyAgents} dari {totalAgents} tersedia</div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-200 text-[10px] text-slate-500">
                    Perubahan yang dilakukan di tab Analysis sebelum report disahkan akan masuk ke preview terbaru.
                  </div>
                </div>

                <div className="mt-auto">
                  {isAllReady ? (
                    <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      SIAP MEMBUAT PREVIEW
                    </div>
                  ) : (
                    <div className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      PREVIEW DAPAT DIBUAT DENGAN CATATAN ({totalAgents - readyAgents} BAGIAN BELUM SELESAI)
                    </div>
                  )}
                  
                  <Button 
                    onClick={handleGenerate}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 tracking-widest uppercase text-[11px] shadow-sm transition-all"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Buat Preview Report
                  </Button>
                  <p className="text-[10px] text-center text-slate-400 mt-3">
                    Preview belum mengunci data dan masih dapat diperiksa kembali.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col justify-center py-10 animate-in slide-in-from-right-4 duration-300">
                <h2 className="text-xl font-bold text-slate-900 mb-6 text-center">Menyusun Preview Report</h2>
                <div className="space-y-4 max-w-[280px] mx-auto w-full">
                  {[
                    "Mengambil hasil analisis terbaru",
                    "Menyusun Fakta & Kronologi",
                    "Menyusun Analisis Aktor",
                    "Menyusun Faktor PEEPO",
                    "Menyusun Lapisan IPLS",
                    "Menyusun Rencana Pencegahan"
                  ].map((stepText, idx) => {
                    const isDone = generationStep > idx;
                    const isCurrent = generationStep === idx;
                    return (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="w-4 flex justify-center shrink-0">
                          {isDone ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 animate-in zoom-in duration-200" />
                          ) : isCurrent ? (
                            <div className="h-1.5 w-1.5 bg-blue-500 rounded-full animate-pulse" />
                          ) : (
                            <div className="h-1.5 w-1.5 border border-slate-300 rounded-full" />
                          )}
                        </div>
                        <span className={cn(
                          "text-[11.5px] transition-colors duration-200",
                          isDone ? "text-slate-700 font-medium" : 
                          isCurrent ? "text-blue-600 font-bold" : "text-slate-400"
                        )}>
                          {stepText}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <p className="text-[11px] text-center text-slate-500 mt-10 font-medium">
                  Menyusun {Math.min(generationStep, 5)} dari 5 bagian...
                </p>
              </div>
            )}
          </div>
          
          {/* RIGHT COLUMN - PREVIEW MINIATURE */}
          <div className="hidden md:flex w-[58%] bg-slate-50/80 items-center justify-center relative p-12 overflow-hidden group">
            
            {/* Document Stack Background */}
            <div className="absolute w-[320px] h-[450px] bg-white border border-slate-200 shadow-sm rounded-sm translate-x-3 translate-y-3 opacity-50 pointer-events-none transition-transform duration-300 group-hover:translate-x-4 group-hover:translate-y-4" />
            <div className="absolute w-[320px] h-[450px] bg-white border border-slate-200 shadow-md rounded-sm translate-x-1.5 translate-y-1.5 opacity-75 pointer-events-none transition-transform duration-300 group-hover:translate-x-2 group-hover:translate-y-2" />
            
            {/* Front Document Miniature */}
            <div className="relative w-[320px] h-[450px] bg-white border border-slate-200 shadow-lg rounded-sm p-6 flex flex-col transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl pointer-events-auto">
              
              <div className="absolute top-4 right-4 bg-slate-900 text-white text-[8px] font-bold px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 uppercase tracking-widest pointer-events-none">
                Preview struktur report
              </div>



              {/* Section Outlines */}
              <div className="flex-1 space-y-3">
                 <div className="flex gap-2">
                    <span className="text-[9px] font-mono text-slate-400">P1</span>
                    <div className="flex-1">
                       <div className="text-[9px] font-bold text-slate-800 uppercase tracking-wider mb-1">Fakta & Kronologi</div>
                       <div className="flex items-center gap-1 mb-1">
                          <div className="h-1.5 w-full bg-slate-100 rounded-sm" />
                          <div className="h-1.5 w-10 bg-slate-100 rounded-sm" />
                       </div>
                       <div className="flex gap-0.5">
                          <div className="h-1 w-1/3 bg-blue-100 rounded-sm" />
                          <div className="h-1 w-2/3 bg-slate-100 rounded-sm" />
                       </div>
                    </div>
                 </div>

                 <div className="flex gap-2">
                    <span className="text-[9px] font-mono text-slate-400">P2</span>
                    <div className="flex-1">
                       <div className="text-[9px] font-bold text-slate-800 uppercase tracking-wider mb-1">Analisis Aktor</div>
                       <div className="grid grid-cols-2 gap-1 mb-1">
                          <div className="h-6 bg-slate-50 border border-slate-100 rounded-sm" />
                          <div className="h-6 bg-slate-50 border border-slate-100 rounded-sm" />
                       </div>
                    </div>
                 </div>

                 <div className="flex gap-2">
                    <span className="text-[9px] font-mono text-slate-400">P3</span>
                    <div className="flex-1">
                       <div className="text-[9px] font-bold text-slate-800 uppercase tracking-wider mb-1">Faktor PEEPO</div>
                       <div className="h-[20px] bg-slate-50 border border-slate-100 flex flex-col justify-between p-0.5 rounded-sm">
                          <div className="h-1 w-full bg-slate-200" />
                          <div className="h-0.5 w-3/4 bg-slate-100" />
                          <div className="h-0.5 w-1/2 bg-slate-100" />
                       </div>
                    </div>
                 </div>

                 <div className="flex gap-2">
                    <span className="text-[9px] font-mono text-slate-400">P4</span>
                    <div className="flex-1">
                       <div className="text-[9px] font-bold text-slate-800 uppercase tracking-wider mb-1">Lapisan IPLS</div>
                       <div className="flex items-center gap-1">
                         <div className="h-3 w-3 bg-red-100 rounded-full" />
                         <div className="h-3 w-3 bg-amber-100 rounded-full" />
                         <div className="h-3 w-3 bg-emerald-100 rounded-full" />
                         <div className="h-1 w-full bg-slate-100 rounded-sm" />
                       </div>
                    </div>
                 </div>
                 
                 <div className="flex gap-2">
                    <span className="text-[9px] font-mono text-slate-400">P5</span>
                    <div className="flex-1">
                       <div className="text-[9px] font-bold text-slate-800 uppercase tracking-wider mb-1">Rencana Pencegahan</div>
                       <div className="h-1.5 w-1/2 bg-slate-200 mb-1 rounded-sm" />
                       <div className="space-y-0.5">
                          <div className="h-1 w-full bg-slate-100 rounded-sm" />
                          <div className="h-1 w-full bg-slate-100 rounded-sm" />
                       </div>
                    </div>
                 </div>
              </div>

              {/* Page Footer */}
              <div className="mt-auto pt-3 border-t border-slate-100 flex justify-between items-center">
                 <div className="h-1 w-8 bg-slate-200 rounded-sm" />
                 <div className="text-[6px] font-mono text-slate-400">PAGE 1 OF 1</div>
              </div>
              
              {/* Generation Overlay */}
              {isGenerating && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] flex items-center justify-center transition-opacity duration-300">
                  <div className="h-8 w-8 rounded-full border-2 border-slate-200 border-t-blue-600 animate-spin" />
                </div>
              )}
            </div>
            
          </div>
        </div>
      </div>
    );
  }



  // --- Document Workspace View ---
  return (
    <div ref={containerRef} className="flex h-full w-full bg-slate-200/50 overflow-hidden font-sans">
      
      {/* LEFT: 75-80% DOCUMENT CANVAS */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        
        {/* Toolbar */}
        <TooltipProvider delayDuration={400}>
        <div className="h-12 bg-white border-b border-slate-200 flex items-center justify-between px-4 shrink-0 z-20 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          
          {/* Left: Branding & Tool toggle */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-800 mr-4">Report Preview</span>
            <div className="h-4 w-px bg-slate-200 mr-2" />
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={cn("h-8 w-8 transition-colors", activeTool === 'hand' ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:bg-slate-50")}
                  onClick={() => setActiveTool('hand')}
                >
                  <Hand className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-[10px] font-bold">Pan Tool</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={cn("h-8 w-8 transition-colors", activeTool === 'pointer' ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:bg-slate-50")}
                  onClick={() => setActiveTool('pointer')}
                >
                  <MousePointer2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-[10px] font-bold">Select</TooltipContent>
            </Tooltip>
            
            <div className="h-4 w-px bg-slate-200 mx-2" />
            
            {/* Zoom Controls */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:bg-slate-50" onClick={() => setZoomMode(z => typeof z === 'number' ? Math.max(0.4, z - 0.1) : Math.max(0.4, actualZoom - 0.1))}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-[10px] font-bold">Zoom Out (-)</TooltipContent>
            </Tooltip>
            
            <select 
              className="h-8 text-xs font-medium text-slate-700 bg-transparent border-none outline-none cursor-pointer hover:bg-slate-50 px-1 rounded"
              value={zoomMode}
              onChange={(e) => {
                const val = e.target.value;
                if (val === 'fit-page' || val === 'fit-width') setZoomMode(val);
                else setZoomMode(Number(val));
              }}
            >
              <option value="fit-page">Fit Page</option>
              <option value="fit-width">Fit Width</option>
              <option value="0.5">50%</option>
              <option value="0.75">75%</option>
              <option value="0.9">90%</option>
              <option value="1">100%</option>
              <option value="1.25">125%</option>
              <option value="1.5">150%</option>
              <option value="2">200%</option>
            </select>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:bg-slate-50" onClick={() => setZoomMode(z => typeof z === 'number' ? Math.min(3, z + 0.1) : Math.min(3, actualZoom + 0.1))}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-[10px] font-bold">Zoom In (+)</TooltipContent>
            </Tooltip>
          </div>
          
          {/* Center: Pagination */}
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:bg-slate-50" onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-[10px] font-bold">Previous Page (↑/←)</TooltipContent>
            </Tooltip>
            <span className="text-xs font-mono font-bold text-slate-600 w-16 text-center">
              {String(currentPage).padStart(2, '0')} / {String(TOTAL_PAGES).padStart(2, '0')}
            </span>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:bg-slate-50" onClick={() => setCurrentPage(Math.min(TOTAL_PAGES, currentPage + 1))} disabled={currentPage === TOTAL_PAGES}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-[10px] font-bold">Next Page (↓/→)</TooltipContent>
            </Tooltip>
          </div>
          
          {/* Right: View Toggles */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className={cn("h-8 text-xs font-bold", thumbnailsOpen ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50")} onClick={() => setThumbnailsOpen(!thumbnailsOpen)}>
              <Layout className="h-4 w-4 mr-1.5" /> Thumbnails
            </Button>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 text-xs font-bold text-slate-600 hover:bg-slate-50" onClick={toggleFullscreen}>
                  {isFullscreen ? <Minimize2 className="h-4 w-4 mr-1.5" /> : <Maximize2 className="h-4 w-4 mr-1.5" />}
                  {isFullscreen ? 'Exit' : 'Fullscreen'}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-[10px] font-bold">Toggle Fullscreen (Esc to exit)</TooltipContent>
            </Tooltip>
          </div>
        </div>
        </TooltipProvider>

        <div className="flex-1 flex overflow-hidden relative">
          {/* Thumbnail Rail */}
          {thumbnailsOpen && (
            <div className="w-48 bg-slate-50 border-r border-slate-200 overflow-y-auto shrink-0 z-10 animate-in slide-in-from-left-4 duration-200">
              <div className="p-4 space-y-4">
                {[
                  { n: 1, title: 'Chronology', cmp: <ReportFactPage isActive isThumbnail isLoading={isGenerating} pageNumber={1} totalPages={TOTAL_PAGES} version={reportSnapshot?.version || "1.0"} status={reportStatus} factAgent={displayAgents.find(a=>a.id==='fact')} /> },
                  { n: 2, title: 'Actor Analysis', cmp: <ReportActorPage isActive isThumbnail isLoading={isGenerating} pageNumber={2} totalPages={TOTAL_PAGES} version={reportSnapshot?.version || "1.0"} status={reportStatus} actorAgent={displayAgents.find(a=>a.id==='actor')} /> },
                  { n: 3, title: 'PEEPO', cmp: <ReportPeepoPage isActive isThumbnail isLoading={isGenerating} pageNumber={3} totalPages={TOTAL_PAGES} version={reportSnapshot?.version || "1.0"} status={reportStatus} peepoAgent={displayAgents.find(a=>a.id==='peepo')} /> },
                  { n: 4, title: 'IPLS', cmp: <ReportIplsPage isActive isThumbnail isLoading={isGenerating} pageNumber={4} totalPages={TOTAL_PAGES} version={reportSnapshot?.version || "1.0"} status={reportStatus} iplsAgent={displayAgents.find(a=>a.id==='ipls')} /> },
                  { n: 5, title: 'Prevention', cmp: <ReportPreventionPage isActive isThumbnail isLoading={isGenerating} pageNumber={5} totalPages={TOTAL_PAGES} version={reportSnapshot?.version || "1.0"} status={reportStatus} prevAgent={displayAgents.find(a=>a.id==='prev')} /> },
                ].map(thumb => (
                  <div 
                    id={`thumbnail-rail-${thumb.n}`}
                    key={thumb.n}
                    className="flex gap-2 group cursor-pointer"
                    onClick={() => setCurrentPage(thumb.n)}
                  >
                    <div className={cn("text-[10px] font-bold pt-1 w-3 text-right select-none transition-colors", currentPage === thumb.n ? "text-blue-600" : "text-slate-400")}>
                      {thumb.n}
                    </div>
                    <div className="flex-1 flex flex-col gap-1.5">
                      <div className={cn(
                        "w-full aspect-video bg-white rounded-sm shadow-sm transition-all overflow-hidden relative border-2 flex flex-col",
                        currentPage === thumb.n ? "border-blue-500 ring-4 ring-blue-500/10 shadow-md" : "border-transparent hover:border-slate-300 hover:shadow-md hover:-translate-y-[1px]"
                      )}>
                        {/* Slide Miniature Content */}
                        <div className="absolute inset-0 bg-white pointer-events-none">
                           {thumb.cmp}
                        </div>
                        {/* Overlay to catch clicks and prevent interaction with thumbnail content */}
                        <div className="absolute inset-0 z-10" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Canvas Area */}
          <div 
            ref={canvasContainerRef}
            className={cn(
              "flex-1 relative overflow-auto bg-[#F8FAFC]", 
              activeTool === 'hand' ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'
            )}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          >
            <ReportViewerContext.Provider value={{ zoom: actualZoom, panOffset }}>
            
            <ReportFactPage 
              isActive={currentPage === 1} isLoading={isGenerating} pageNumber={2} totalPages={TOTAL_PAGES}
              version={reportSnapshot?.version || "1.0"} status={reportStatus} factAgent={displayAgents.find(a=>a.id==='fact')}
            />
            <ReportActorPage 
              isActive={currentPage === 2} isLoading={isGenerating} pageNumber={3} totalPages={TOTAL_PAGES}
              version={reportSnapshot?.version || "1.0"} status={reportStatus} actorAgent={displayAgents.find(a=>a.id==='actor')}
            />
            <ReportPeepoPage 
              isActive={currentPage === 3} isLoading={isGenerating} pageNumber={4} totalPages={TOTAL_PAGES}
              version={reportSnapshot?.version || "1.0"} status={reportStatus} peepoAgent={displayAgents.find(a=>a.id==='peepo')}
            />
            <ReportIplsPage 
              isActive={currentPage === 4} isLoading={isGenerating} pageNumber={5} totalPages={TOTAL_PAGES}
              version={reportSnapshot?.version || "1.0"} status={reportStatus} iplsAgent={displayAgents.find(a=>a.id==='ipls')}
            />
            <ReportPreventionPage 
              isActive={currentPage === 5} isLoading={isGenerating} pageNumber={5} totalPages={TOTAL_PAGES}
              version={reportSnapshot?.version || "1.0"} status={reportStatus} prevAgent={displayAgents.find(a=>a.id==='prev')}
            />
            </ReportViewerContext.Provider>
          </div>
        </div>
      </div>

      {/* RIGHT: 20-25% REPORT CONTROL */}
      {!isFullscreen && (
        <div className="w-[320px] bg-white border-l border-slate-200 shrink-0 flex flex-col z-20 relative">
          <div className="p-5 border-b border-slate-100">
            <h3 className="text-[14px] font-bold text-slate-900">Report Control</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-5 space-y-8">
            
            {/* Status Section */}
            <div>
              <div className="mb-5">
                {reportStatus === 'DRAFT' && (
                  <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-widest border border-amber-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                    DRAFT PREVIEW
                  </div>
                )}
                {reportStatus === 'READY_FOR_REVIEW' && (
                  <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-widest border border-blue-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                    READY FOR REVIEW
                  </div>
                )}
                {reportStatus === 'APPROVED' && (
                  <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-widest border border-emerald-200">
                    <CheckCircle2 className="h-3 w-3" />
                    APPROVED
                  </div>
                )}
                
                {reportStatus === 'DRAFT' && (
                  <div className="text-[11px] font-medium text-slate-500 mt-3 flex items-center gap-1.5">
                    {autosaveState === 'SAVING' ? (
                      <><span className="h-1 w-1 rounded-full border border-slate-400" /> Saving...</>
                    ) : (
                      <><span className="h-1 w-1 rounded-full bg-slate-400" /> Saved &middot; {new Date().toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})} WITA</>
                    )}
                  </div>
                )}
              </div>

              {/* Metadata */}
              <div className="space-y-4">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Version</div>
                  <div className="text-[12px] font-bold text-slate-900">v{reportSnapshot?.version || "1.0"}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Generated</div>
                  <div className="text-[12px] font-bold text-slate-900">{new Date(reportSnapshot?.generatedAt || Date.now()).toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric'})} &middot; {new Date(reportSnapshot?.generatedAt || Date.now()).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Pages</div>
                  <div className="text-[12px] font-bold text-slate-900">{TOTAL_PAGES} pages</div>
                </div>
                
                {reportStatus === 'APPROVED' && reportSnapshot?.lockedAt && (
                  <div>
                    <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-0.5">Approved</div>
                    <div className="text-[12px] font-bold text-slate-900">{new Date(reportSnapshot.lockedAt).toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric'})} &middot; {new Date(reportSnapshot.lockedAt).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}</div>
                    <div className="text-[11px] text-slate-500">by {reportSnapshot.lockedBy}</div>
                  </div>
                )}
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Actions */}
            <div>
              {reportStatus !== 'APPROVED' ? (
                <div className="space-y-3">
                  <div className="flex gap-2 items-start bg-slate-50 p-3 rounded border border-slate-100 mb-3">
                    <Lock className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Setelah laporan disahkan, isi laporan akan dikunci dan tercatat di Audit Trail.
                    </p>
                  </div>
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-10 text-[11px] uppercase tracking-widest transition-transform active:scale-[0.98]"
                    onClick={() => setShowApprovalModal(true)}
                  >
                    Sahkan Laporan
                  </Button>
                  <Button variant="outline" className="w-full text-slate-600 font-bold h-9 text-[11px] hover:bg-slate-50">
                    Preview PDF
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-10 text-[11px] uppercase tracking-widest"
                        disabled={isExporting}
                      >
                        {isExporting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <FileDown className="h-4 w-4 mr-2" />}
                        Export Report
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[280px]">
                      <DropdownMenuItem onClick={() => handleExport('pdf')} className="cursor-pointer font-medium text-xs py-2.5">
                        PDF Document (.pdf)
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleExport('word')} className="cursor-pointer font-medium text-xs py-2.5">
                        Microsoft Word (.docx)
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  {reportSnapshot?.lastExportedAt && !isExporting && (
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Last Export</div>
                      <div className="text-[11px] font-bold text-slate-800">
                        {new Date(reportSnapshot.lastExportedAt).toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric'})} &middot; {new Date(reportSnapshot.lastExportedAt).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})} WITA
                      </div>
                      <div className="text-[10px] text-slate-500 mb-2">PDF &middot; Version {reportSnapshot.version}</div>
                      <button className="text-[10px] font-bold text-blue-600 hover:underline">View export history</button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <hr className="border-slate-100" />

            {/* Audit Trail Preview */}
            <div>
              <div className="text-[11px] font-bold text-slate-900 uppercase tracking-widest mb-4">Report Activity</div>
              <div className="space-y-4 border-l-2 border-slate-100 ml-2 pl-4">
                {reportAuditLogs.slice(0, 3).map((log, i) => (
                  <div key={log.id || i} className="relative">
                    <div className="absolute -left-[23px] top-1 h-2.5 w-2.5 rounded-full bg-blue-500 border-2 border-white shadow-sm" />
                    <div className="text-[11px] font-bold text-slate-800">{log.action === 'PDF_EXPORTED' ? 'PDF Exported' : log.action === 'WORD_EXPORTED' ? 'Word Exported' : log.action === 'REPORT_APPROVED' ? 'Report Approved' : log.action === 'REPORT_GENERATED' ? 'Report Generated' : log.action}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{new Date(log.timestamp).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})} WITA</div>
                    <div className="text-[10px] text-slate-500">{log.actor}</div>
                  </div>
                ))}
              </div>
              <button className="text-[10px] font-bold text-blue-600 mt-5 hover:underline flex items-center gap-1">View full activity &rarr;</button>
            </div>
            
          </div>
        </div>
      )}

      {/* Approval Modal */}
      {showApprovalModal && (
        <div className="absolute inset-0 bg-slate-900/40 z-[100] flex items-center justify-center backdrop-blur-[1px]">
          <div className="bg-white rounded-lg shadow-2xl p-6 w-[340px] animate-in zoom-in-[0.98] duration-150">
            <h3 className="text-[16px] font-bold text-slate-900 mb-2">Sahkan laporan?</h3>
            <p className="text-[12px] text-slate-600 leading-relaxed mb-4">
              Versi {reportSnapshot?.version || "1.0"} akan dikunci sebagai laporan resmi investigasi.
            </p>
            <div className="bg-slate-50 p-3 rounded border border-slate-100 mb-6 space-y-1">
              <div className="text-[11px] text-slate-600">{TOTAL_PAGES} halaman</div>
              <div className="text-[11px] text-slate-600">Terakhir disimpan {new Date().toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})} WITA</div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" className="text-[11px] font-bold h-8 text-slate-600" onClick={() => setShowApprovalModal(false)} disabled={isApproving}>
                Kembali
              </Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] h-8 transition-transform active:scale-[0.98]" onClick={handleApprove} disabled={isApproving}>
                {isApproving ? <Loader2 className="h-3 w-3 animate-spin mr-1.5" /> : null}
                {isApproving ? "Mengesahkan..." : "Sahkan Laporan"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
