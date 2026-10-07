import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { useCase } from "@/hooks/useCases";
import { Button } from "@/components/ui/button";
import { 
  Loader2, ArrowLeft, Megaphone, Sparkles, Clock, CheckCircle2, XCircle, 
  ChevronDown, ChevronRight, History, BarChart3, Info, ExternalLink, Play, 
  Database, Brain, Send, Bot, FileText, Search, Trash2, Edit3, User, Link2, 
  Sparkle, PanelLeft, PanelLeftClose, PanelRight, X, Pencil, List, BookOpen, PlayCircle, ChevronLeft, Download, Check, Lock, Monitor, Image, Minus, Plus,
  Printer, AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SafetyAlertPoster } from "@/components/workspace/SafetyAlertPoster";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Hand, Eye, Maximize2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { toast } from "sonner";

export default function CampaignWorkspacePage() {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const isCreatingParam = searchParams.get("isCreating") === "true";
  const { data: caseData, isLoading } = useCase(campaignId || "");
  
  const [isGenerating, setIsGenerating] = useState(isCreatingParam);
  const [isGenerated, setIsGenerated] = useState(!isCreatingParam);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationTimeLeft, setGenerationTimeLeft] = useState(15);
  const [generationStep, setGenerationStep] = useState(1);
    const [showMetadata, setShowMetadata] = useState(true);

  // Header State
  const [showCampaignList, setShowCampaignList] = useState(false);
  const [campaignSearchQuery, setCampaignSearchQuery] = useState("");
  const [showAuditTrail, setShowAuditTrail] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState("");
  const [showAIProgress, setShowAIProgress] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [showValidateModal, setShowValidateModal] = useState(false);

  // Modal State
  const [selectedAnalysis, setSelectedAnalysis] = useState<string | null>(null);
  const [showDataInputModal, setShowDataInputModal] = useState(false);
  const [showRevisionHistory, setShowRevisionHistory] = useState(false);

  // Status & Activity Log
  const [isLeftPanelExpanded, setIsLeftPanelExpanded] = useState(true);
  const [isRightPanelExpanded, setIsRightPanelExpanded] = useState(false);
  const [status, setStatus] = useState(isCreatingParam ? "Proses AI" : "Created");
  const [canvasMode, setCanvasMode] = useState<'edit' | 'preview'>('edit');

  // Zoom Controls
  const [zoomMode, setZoomMode] = useState<'FIT' | 'FILL' | '100%' | 'CUSTOM'>('100%');
  const [customZoom, setCustomZoom] = useState<number>(100);
  const [fitZoom, setFitZoom] = useState<number>(80);
  const [fillZoom, setFillZoom] = useState<number>(100);
  const mainContentRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mainContentRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const width = entry.contentRect.width;
        // 1000 is poster width, 64 is padding
        const fitScale = Math.min((width - 64) / 1000, 1) * 100;
        const fillScale = (width / 1000) * 100;
        setFitZoom(Math.max(10, Math.floor(fitScale)));
        setFillZoom(Math.floor(fillScale));
      }
    });
    resizeObserver.observe(mainContentRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  const currentZoom = 
    zoomMode === 'FIT' ? fitZoom : 
    zoomMode === 'FILL' ? fillZoom : 
    zoomMode === '100%' ? 100 : 
    customZoom;

  const handleZoomIn = () => {
    setZoomMode('CUSTOM');
    setCustomZoom(Math.min(currentZoom + 10, 200));
  };
  
  const handleZoomOut = () => {
    setZoomMode('CUSTOM');
    setCustomZoom(Math.max(currentZoom - 10, 10));
  };

  // 15-second dummy loader for creation
  useEffect(() => {
    if (!isGenerating) return;

    const DURATION = 15000; // 15 detik dummy
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progressPercent = Math.min(100, Math.floor((elapsed / DURATION) * 100));
      const remainingSeconds = Math.max(0, Math.ceil((DURATION - elapsed) / 1000));

      setGenerationProgress(progressPercent);
      setGenerationTimeLeft(remainingSeconds);

      if (progressPercent < 15) {
        setGenerationStep(1);
      } else if (progressPercent < 30) {
        setGenerationStep(2);
      } else if (progressPercent < 45) {
        setGenerationStep(3);
      } else if (progressPercent < 60) {
        setGenerationStep(4);
      } else if (progressPercent < 75) {
        setGenerationStep(5);
      } else if (progressPercent < 90) {
        setGenerationStep(6);
      } else {
        setGenerationStep(7);
      }

      if (elapsed >= DURATION) {
        clearInterval(interval);
        setIsGenerating(false);
        setIsGenerated(true);
        setStatus("Created");
        toast.success("Poster Safety Alert Campaign berhasil di-generate!");
        setSearchParams({}, { replace: true });
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isGenerating, setSearchParams]);
  
  
  const [isAuditDrawerOpen, setIsAuditDrawerOpen] = useState(false);
  const [auditItemFilter, setAuditItemFilter] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [modalZoom, setModalZoom] = useState<number>(65);
  const [modalPanMode, setModalPanMode] = useState(false);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const modalViewportRef = useRef<HTMLDivElement>(null);
  const isDraggingPanRef = useRef<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number; scrollLeft: number; scrollTop: number }>({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });

  // Smart FIT calculation for Preview Modal
  const handleModalFit = useCallback(() => {
    if (!modalViewportRef.current) return;
    const vpWidth = modalViewportRef.current.clientWidth;
    const vpHeight = modalViewportRef.current.clientHeight;
    // Poster base width 1000px, base height ~1420px. Subtract padding
    const availW = Math.max(100, vpWidth - 80);
    const availH = Math.max(100, vpHeight - 80);
    const scaleW = availW / 1000;
    const scaleH = availH / 1420;
    const fitScale = Math.min(scaleW, scaleH) * 100;
    setModalZoom(Math.max(25, Math.min(100, Math.round(fitScale))));
  }, []);

  const handleModalFill = useCallback(() => {
    if (!modalViewportRef.current) return;
    const vpWidth = modalViewportRef.current.clientWidth;
    const availW = Math.max(100, vpWidth - 64);
    const fillScale = (availW / 1000) * 100;
    setModalZoom(Math.max(25, Math.min(150, Math.round(fillScale))));
  }, []);

  const handleModalZoomIn = () => {
    setModalZoom(prev => Math.min(prev + 10, 200));
  };

  const handleModalZoomOut = () => {
    setModalZoom(prev => Math.max(prev - 10, 25));
  };

  // Keyboard shortcut listener for preview modal
  useEffect(() => {
    if (!isPreviewOpen) return;

    // Auto calculate FILL on open so it's not too small
    const timer = setTimeout(() => {
      handleModalFill();
    }, 60);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsPreviewOpen(false);
      } else if (e.key === "+" || e.key === "=") {
        setModalZoom(prev => Math.min(prev + 10, 200));
      } else if (e.key === "-" || e.key === "_") {
        setModalZoom(prev => Math.max(prev - 10, 25));
      } else if (e.key === "0") {
        setModalZoom(100);
      } else if (e.key.toLowerCase() === "f") {
        handleModalFit();
      } else if (e.code === "Space" && !isSpacePressed) {
        setIsSpacePressed(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        setIsSpacePressed(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isPreviewOpen, handleModalFit, isSpacePressed]);

  // Pan handlers for modal
  const handleModalMouseDown = (e: React.MouseEvent) => {
    if (modalPanMode || isSpacePressed || e.button === 1) {
      if (!modalViewportRef.current) return;
      isDraggingPanRef.current = true;
      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        scrollLeft: modalViewportRef.current.scrollLeft,
        scrollTop: modalViewportRef.current.scrollTop,
      };
      e.preventDefault();
    }
  };

  const handleModalMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingPanRef.current || !modalViewportRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    modalViewportRef.current.scrollLeft = dragStartRef.current.scrollLeft - dx;
    modalViewportRef.current.scrollTop = dragStartRef.current.scrollTop - dy;
  };

  const handleModalMouseUp = () => {
    isDraggingPanRef.current = false;
  };

  const handleModalWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const step = e.deltaY < 0 ? 5 : -5;
      setModalZoom(prev => Math.max(25, Math.min(200, prev + step)));
    }
  };

  const handlePrint = () => {
    toast.info("Membuka dialog cetak browser...");
    setTimeout(() => {
      window.print();
    }, 200);
  };


  const auditLogs = [
    {
      id: "a3",
      action: "DELETE",
      actorName: "Aditya Pratama",
      actorRole: "Safety Superintendent",
      actorType: "HUMAN",
      timestamp: "2026-08-05T09:04:00Z",
      versionTo: 3,
      deletionReason: "Item dihapus dari analisis aktif karena tidak relevan dengan konteks campaign.",
      changeNote: "Menghapus elemen yang kurang sesuai",
      before: {
        version: 2,
        stage: "Metadata",
        time: "14:35",
        description: "Gambar referensi amblas.",
      }
    },
    {
      id: "a2",
      action: "UPDATE",
      actorName: "Gulang Satriya",
      actorRole: "Lead Investigator",
      actorType: "HUMAN",
      timestamp: "2026-08-05T08:16:00Z",
      versionTo: 2,
      changeNote: "Penyesuaian rekomendasi perbaikan untuk pekerja lapangan",
      before: {
        version: 1,
        stage: "Lesson Learned",
        time: "14:10",
        description: "Draft awal otomatis oleh AI.",
      },
      after: {
        version: 2,
        stage: "Lesson Learned",
        time: "14:15",
        description: "Penekanan pada kewaspadaan area lembek dan checklist FTW.",
      }
    },
    {
      id: "a1",
      action: "CREATE",
      actorName: "System AI",
      actorRole: "Campaign Generator",
      actorType: "AI",
      timestamp: "2026-08-05T08:00:00Z",
      versionTo: 1,
      after: {
        version: 1,
        stage: "Poster Generation",
        time: "14:00",
        description: "Poster Campaign berhasil digenerate berdasarkan data Investigation.",
      }
    }
  ];


  const dataAnalisis = [
    { id: "kronologi", name: "Kronologi", content: "Agent Fact & Chronology telah mengekstrak urutan kejadian:\n\n1. 13:05 WITA: Operator mulai brushing di WMP 21.\n2. 13:50 WITA: Track sisi kiri amblas pada dorongan ke-6.\n3. 14:50 WITA: Unit berhasil dievakuasi, nihil cedera." },
    { id: "aktor", name: "Aktor", content: "Aktor yang terlibat:\n- Operator Saiful (Mengoperasikan BMCDZ 116)\n- Pengawas Fatur (Tidak memastikan FTW awal shift)" },
    { id: "pepo", name: "PEEPO", content: "Analisis Faktor PEEPO:\n- People: Kurang kewaspadaan, tidak mengisi FTW.\n- Environment: Area kerja memiliki titik lembek bekas parit aliran air.\n- Process: Belum ada MPRP aktivitas pembuatan saluran WMP 21." },
    { id: "ipls", name: "IPLS", content: "Evaluasi Lapisan Pertahanan:\n- Lapis 1 (Engineering): Gagal. Tidak ada patok boundary.\n- Lapis 2 (Administrative): Gagal. Inspeksi awal shift tidak teridentifikasi." },
    { id: "prevention", name: "Prevention", content: "Rencana Pencegahan:\n1. Pastikan setiap aktifitas dibuatkan DOP.\n2. Pasang boundary/patok area kerja.\n3. Lakukan asesmen lokasi baru." }
  ];

  const handleGenerate = () => {
    setIsGenerating(true);
    setIsGenerated(false);
    setGenerationProgress(0);
    setGenerationTimeLeft(15);
    setGenerationStep(1);
    setStatus("Proses AI");
  };

  return (
    <AppLayout hideHeader>
      <div className="flex flex-col h-screen overflow-hidden bg-slate-50/50">
        {/* Global Utility Bar */}
        <div className="bg-slate-50 border-b px-8 py-2 flex items-center justify-between shrink-0 relative z-30 no-print">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/campaign')}
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
                  onClick={() => setShowCampaignList(!showCampaignList)}
                  className={`h-6 px-2 text-[9px] font-bold rounded gap-1.5 transition-colors uppercase tracking-widest ${showCampaignList ? 'bg-slate-200 text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}
                  title="Semua Campaign"
                >
                  <List className="h-3.5 w-3.5" /> DAFTAR
                </Button>
                {/* Dummy Dropdown for List */}
                {showCampaignList && (
                  <div className="absolute left-0 top-full mt-2 bg-white border border-slate-200 shadow-xl rounded-lg p-3 w-[300px] z-50">
                    <div className="relative mb-3">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                      <input 
                        type="text" 
                        placeholder="Search campaigns..." 
                        value={campaignSearchQuery}
                        onChange={(e) => setCampaignSearchQuery(e.target.value)}
                        className="w-full text-xs border border-slate-200 rounded-md pl-8 pr-3 py-1.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                      />
                    </div>
                    <div className="text-xs text-slate-400 text-center py-6 font-medium">Coming soon...</div>
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                disabled={true}
                className="h-6 px-2 text-[9px] font-bold text-slate-500 hover:text-slate-900 rounded gap-1.5 uppercase tracking-widest transition-colors"
                title="Campaign Sebelumnya"
              >
                <ChevronLeft className="h-3.5 w-3.5" /> SEBELUMNYA
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={true}
                className="h-6 px-2 text-[9px] font-bold text-slate-500 hover:text-slate-900 rounded gap-1.5 uppercase tracking-widest transition-colors"
                title="Campaign Selanjutnya"
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
                  <div className="text-sm font-bold text-slate-800">Gulang Satriya</div>
                  <div className="text-xs text-slate-500 mt-1">ID: GS-12345</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Workspace Header Container */}
        <div id="tour-step-1-header" data-tour="workspace-header" className="bg-white border-b flex flex-col shrink-0 relative z-20">
          <div className="px-6 pt-4 pb-2 flex items-start justify-between gap-4">
            <div className="flex-1 min-w-[300px] flex flex-col items-start">
              <div className="flex-1 w-full">
                {/* Top Row: ID, Date, Status */}
                <div className="flex items-center gap-2 mb-1.5 text-[9px] font-bold tracking-wider uppercase">
                  <span className="text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    {caseData?.id?.substring(0, 8) || "BS073809"}
                  </span>
                  <div className="h-1 w-1 rounded-full bg-slate-300 hidden md:block mx-1"></div>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Clock className="h-3 w-3" />
                    {caseData?.created_at ? new Date(caseData.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '14 AGU 2026'}
                  </div>
                  <div className="h-1 w-1 rounded-full bg-slate-300 hidden md:block mx-1"></div>
                  <div className="flex items-center gap-1.5 text-slate-700 font-black">
                    CAMPAIGN WORKSPACE
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
                        if (e.key === "Enter" || e.key === "Escape") {
                          setIsEditingTitle(false);
                        }
                      }}
                      onBlur={() => setIsEditingTitle(false)}
                      className="text-lg font-bold tracking-tight text-slate-900 border border-slate-200 rounded px-2.5 py-1 bg-slate-50 w-full focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all leading-tight h-8"
                      autoFocus
                    />
                    <Button size="sm" variant="ghost" onClick={() => setIsEditingTitle(false)} className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded shrink-0">
                      <CheckCircle2 className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div 
                    className="group/title cursor-pointer py-1 px-1.5 -ml-1.5 rounded hover:bg-slate-50 transition-colors w-full"
                    onClick={() => {
                      setTitleInput(caseData?.title || "KEBAKARAN - TERSAMBAR PETIR");
                      setIsEditingTitle(true);
                    }}
                  >
                    <div className="flex items-start gap-2">
                      <h1 className="text-lg font-medium tracking-tight text-slate-400 border-none p-0 flex items-center gap-2 leading-none uppercase">
                        <span className="text-slate-700 font-bold line-clamp-1">{caseData?.title || "KEBAKARAN - TERSAMBAR PETIR"}</span>
                      </h1>
                      <button className="opacity-0 group-hover/title:opacity-100 p-1 mt-0 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-all shrink-0">
                        <Pencil className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Bottom Row: AI Status and Progress */}
                <div className="mt-1 flex items-center gap-2 relative z-50">
                  <div className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-1.5"></span>
                    {status || "Belum Dimulai"}
                  </div>
                  <div 
                    onClick={() => setShowAIProgress(!showAIProgress)}
                    className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-full px-2 py-0.5 cursor-pointer hover:bg-slate-100 hover:border-emerald-200 transition-all group"
                  >
                     <Sparkles className="h-3 w-3 text-emerald-500 group-hover:text-emerald-600" />
                     <div className="w-16 h-1 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full transition-all duration-300" style={{width: `${isGenerating ? generationProgress : 71}%`}}></div>
                     </div>
                     <span className="text-[9px] font-bold text-slate-600 group-hover:text-emerald-700">{isGenerating ? generationProgress : 71}%</span>
                  </div>
                  
                  {showAIProgress && (
                     <div className="absolute top-full mt-2 left-0 bg-white border border-slate-200 rounded-lg shadow-xl p-4 w-64 z-50">
                        <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                           <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest">PROGRESS AI GENERATION</div>
                           <button onClick={() => setShowAIProgress(false)} className="hover:bg-slate-100 p-1 rounded-full transition-colors"><X className="h-3 w-3 text-slate-400 hover:text-slate-600" /></button>
                        </div>
                        <div className="space-y-2">
                          <div className={cn("flex items-center gap-2 text-[10px] font-medium", generationStep >= 1 ? "text-emerald-600" : "text-slate-400")}>
                            {generationStep > 1 ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <div className="h-3.5 w-3.5 rounded-full border border-slate-300 flex items-center justify-center text-[7px]">1</div>}
                            <span>Analisis Data Input</span>
                          </div>
                          <div className={cn("flex items-center gap-2 text-[10px] font-medium", generationStep >= 3 ? "text-emerald-600" : "text-slate-400")}>
                            {generationStep > 3 ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <div className="h-3.5 w-3.5 rounded-full border border-slate-300 flex items-center justify-center text-[7px]">2</div>}
                            <span>Drafting Poster</span>
                          </div>
                          <div className={cn("flex items-center gap-2 text-[10px] font-medium", generationStep >= 5 ? "text-emerald-600" : "text-slate-400")}>
                            {generationStep > 5 ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <div className="h-3.5 w-3.5 rounded-full border border-slate-300 flex items-center justify-center text-[7px]">3</div>}
                            <span>Reviewing & Polishing</span>
                          </div>
                        </div>
                     </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel */}
          <div className={cn("border-r border-slate-200 bg-white flex flex-col shrink-0 overflow-y-auto transition-all duration-300", isLeftPanelExpanded ? "w-80" : "w-12 overflow-hidden border-r")}>
            {!isLeftPanelExpanded && (
              <div className="h-full w-full flex flex-col items-center pt-4">
                <button 
                  onClick={() => setIsLeftPanelExpanded(true)}
                  className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
                  title="Expand Left Panel"
                >
                  <PanelLeft className="h-5 w-5" />
                </button>
              </div>
            )}
            {/* Campaign Generator Area */}
            {isLeftPanelExpanded && (
              <div className="border-b border-slate-100 bg-white">
                <div className="px-5 pt-5 pb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Megaphone className="h-4 w-4 text-slate-700" />
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Campaign Generator</span>
                  </div>
                  <button onClick={() => setIsLeftPanelExpanded(false)} className="text-slate-400 hover:text-slate-700">
                    <PanelLeftClose className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="px-5 pb-5 flex flex-col gap-4">
                  {isApproved ? (
                    <>
                      <div className="bg-slate-50 border border-slate-100 rounded-md p-4">
                        <div className="flex items-start gap-3">
                          <Lock className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                          <div>
                            <h4 className="text-xs font-bold text-slate-800 mb-1">Konten telah disahkan</h4>
                            <p className="text-[11px] text-slate-500 leading-relaxed">Versi ini telah dikunci sebagai konten final.</p>
                          </div>
                        </div>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-10 shadow-none rounded-md">
                            <Download className="mr-2 h-4 w-4" /> Download Konten
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="center" className="w-[280px] p-2">
                          <DropdownMenuItem onClick={() => toast.success("Mendownload format JPEG...")} className="flex items-start gap-3 p-3 cursor-pointer rounded-md focus:bg-slate-50">
                            <Image className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                            <div>
                              <div className="text-xs font-bold text-slate-800 mb-0.5">Download sebagai JPEG</div>
                              <div className="text-[10px] text-slate-500">Format file .jpg</div>
                            </div>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toast.success("Mendownload format PNG...")} className="flex items-start gap-3 p-3 cursor-pointer rounded-md focus:bg-slate-50 mt-1">
                            <Image className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                            <div>
                              <div className="text-xs font-bold text-slate-800 mb-0.5">Download sebagai PNG</div>
                              <div className="text-[10px] text-slate-500">Format file .png</div>
                            </div>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </>
                  ) : isGenerated ? (
                    <>
                      <div className="flex items-center justify-between p-2.5 bg-amber-50/70 border border-amber-200/80 rounded-md">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                          <span className="text-xs font-bold text-amber-900">Menunggu Pengesahan</span>
                        </div>
                        <span className="text-[9px] font-bold text-amber-700 bg-amber-100/70 px-1.5 py-0.5 rounded tracking-wide uppercase">Draft</span>
                      </div>
                      
                      <Button 
                        onClick={() => setShowValidateModal(true)}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-9 rounded-md shadow-none text-xs flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="h-4 w-4" /> Sahkan Konten
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="bg-slate-50 border border-slate-100 rounded-md p-4">
                        <div className="flex items-start gap-3">
                          <Sparkles className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                          <div>
                            <h4 className="text-xs font-bold text-slate-800 mb-1">Mulai Generate</h4>
                            <p className="text-[11px] text-slate-500 leading-relaxed">Klik tombol di bawah untuk men-generate konten dari data input yang tersedia.</p>
                          </div>
                        </div>
                      </div>
                      
                      <Button 
                        onClick={handleGenerate} 
                        disabled={isGenerating || isLoading}
                        className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-10 rounded-md shadow-none"
                      >
                        {isGenerating ? (
                          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
                        ) : (
                          <><Sparkles className="mr-2 h-4 w-4" /> Generate Campaign</>
                        )}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="border-b border-slate-100">
              <button 
                onClick={() => setShowMetadata(!showMetadata)}
                className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-slate-700" />
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Metadata</span>
                </div>
                {showMetadata ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
              </button>
              
              {showMetadata && (
                <div className="px-5 pb-5 flex flex-col gap-3">
                  
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider">Kategori</span>
                    <span className="text-xs font-medium text-slate-800">Near Miss - Dozer Amblas</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider">Perusahaan</span>
                    <span className="text-xs font-medium text-slate-800">PT Bandang Mining Coal</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider">Waktu Insiden</span>
                    <span className="text-xs font-medium text-slate-800">31 Agu 2026, 13:50 WITA</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider">Waktu Pelaporan</span>
                    <span className="text-xs font-medium text-slate-800">31 Agu 2026, 16:00 WITA</span>
                  </div>
                  
                  <div className="pt-2">
                    <button 
                      onClick={() => setShowDataInputModal(true)}
                      className="w-full text-left bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-md p-3 flex items-center justify-between group transition-all shadow-none"
                    >
                      <div className="flex items-center gap-2">
                        <Database className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                        <span className="text-xs font-bold text-slate-700">Data Input</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            
            {/* Riwayat Perubahan */}
            <div className="border-b border-slate-100 bg-white">
              <div className="px-5 pt-5 pb-3 flex items-center gap-2">
                <History className="h-4 w-4 text-slate-700" />
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Riwayat</span>
              </div>
              <div className="px-5 pb-5">
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-2 h-9 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border-slate-200 shadow-none"
                  onClick={() => setIsAuditDrawerOpen(true)}
                >
                  <History className="h-4 w-4 text-slate-500" />
                  Lihat {auditLogs.length} aktivitas
                </Button>
              </div>
            </div>
          </div>


          {/* Main Content Area */}
          <div 
            ref={mainContentRef} 
            className={cn(
              "flex-1 overflow-auto p-6 relative transition-colors duration-300",
              canvasMode === 'preview' ? "bg-[#080b11]" : "bg-slate-50/50"
            )}
          >
            <div className="max-w-6xl mx-auto flex flex-col items-center justify-center min-h-[60vh]">
              {!isGenerated && !isGenerating && (
                <div className="flex w-full max-w-[860px] mx-auto gap-12 items-center transition-all duration-300 mt-10">
                  <div className="flex-1 max-w-[360px] flex flex-col">
                    <div className="h-12 w-12 border rounded-xl shadow-none flex items-center justify-center mb-6 bg-slate-50 border-slate-200">
                      <Megaphone className="h-6 w-6 text-slate-500 stroke-[1.5]" />
                    </div>
                    <h2 className="text-[20px] font-extrabold text-slate-900 tracking-tight mb-2">
                      Generate Campaign Poster
                    </h2>
                    <p className="text-[13px] text-slate-500 max-w-[320px] leading-relaxed mb-4">
                      Ekstrak otomatis hasil investigasi menjadi poster Safety Alert untuk didistribusikan ke seluruh pekerja.
                    </p>
                    <div className="flex items-center gap-3 mb-8">
                      <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md border border-emerald-100">
                         <CheckCircle2 className="h-3.5 w-3.5" />
                         <span className="text-[10px] font-bold uppercase tracking-widest">Data Input Siap</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <Button onClick={handleGenerate} className="bg-slate-900 text-white hover:bg-slate-800 shadow-none flex items-center gap-2 border-0">
                        <Play className="h-3.5 w-3.5 fill-current" /> Mulai Generate
                      </Button>
                    </div>
                  </div>
                  
                  {/* Visual flowchart */}
                  <div className="flex-1 bg-white border border-slate-200 shadow-none rounded-xl p-6 relative overflow-hidden h-64 flex flex-col justify-center">
                     {/* Background grid */}
                     <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:14px_24px]" />
                     <div className="relative z-10 flex flex-col items-center">
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-8">Alur Orkestrasi Poster</span>
                        
                        <div className="flex items-center justify-center gap-4 w-full">
                           <div className="flex flex-col items-center gap-2">
                              <div className="bg-white border border-slate-200 shadow-none p-3 rounded-lg flex flex-col items-center justify-center w-24">
                                <Database className="h-5 w-5 text-slate-500 mb-1" />
                                <span className="text-[8px] font-bold text-slate-600 uppercase text-center">Data Input</span>
                              </div>
                           </div>
                           
                           <ChevronRight className="h-4 w-4 text-slate-300" />
                           
                           <div className="flex flex-col items-center gap-2">
                              <div className="bg-white border border-slate-200 shadow-none p-3 rounded-lg flex flex-col items-center justify-center w-24 border-indigo-200 ring-2 ring-indigo-50">
                                <Brain className="h-5 w-5 text-indigo-500 mb-1" />
                                <span className="text-[8px] font-bold text-slate-600 uppercase text-center">Agent AI</span>
                              </div>
                           </div>

                           <ChevronRight className="h-4 w-4 text-slate-300" />
                           
                           <div className="flex flex-col items-center gap-2">
                              <div className="bg-white border border-slate-200 shadow-none p-3 rounded-lg flex flex-col items-center justify-center w-24">
                                <Megaphone className="h-5 w-5 text-emerald-500 mb-1" />
                                <span className="text-[8px] font-bold text-slate-600 uppercase text-center">Poster Jadi</span>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
                </div>
              )}

              {(isGenerated || isGenerating) && (
              <div className="w-full flex justify-center animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 mt-4 flex-col items-center">
                
                {/* Canvas Control Toolbar */}
                {isGenerated && !isGenerating && (
                  <div className={cn(
                    "w-full max-w-[1000px] mb-3 flex items-center justify-between rounded-md px-3.5 py-1.5 shadow-sm transition-colors",
                    canvasMode === 'preview' 
                      ? "bg-[#111622] border border-white/10 text-white shadow-lg" 
                      : "bg-white border border-slate-200"
                  )}>
                    {/* Left: Canvas Zoom Controls (Interactive & Compact) */}
                    <div className="flex items-center gap-1.5">
                      <div className={cn(
                        "flex items-center rounded border p-0.5",
                        canvasMode === 'preview' ? "bg-white/5 border-white/10" : "bg-slate-100 border border-slate-200"
                      )}>
                        <button 
                          onClick={handleZoomOut}
                          className={cn(
                            "p-1 rounded transition-colors",
                            canvasMode === 'preview' ? "text-slate-400 hover:text-white hover:bg-white/10" : "text-slate-500 hover:text-slate-900 hover:bg-white"
                          )}
                          title="Perkecil (-)"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className={cn(
                          "text-xs font-mono font-bold w-11 text-center select-none",
                          canvasMode === 'preview' ? "text-slate-200" : "text-slate-700"
                        )}>
                          {Math.round(currentZoom)}%
                        </span>
                        <button 
                          onClick={handleZoomIn}
                          className={cn(
                            "p-1 rounded transition-colors",
                            canvasMode === 'preview' ? "text-slate-400 hover:text-white hover:bg-white/10" : "text-slate-500 hover:text-slate-900 hover:bg-white"
                          )}
                          title="Perbesar (+)"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className={cn(
                        "flex items-center rounded border p-0.5",
                        canvasMode === 'preview' ? "bg-white/5 border-white/10" : "bg-slate-100 border border-slate-200"
                      )}>
                        <button 
                          onClick={() => setZoomMode('FIT')}
                          className={cn(
                            "px-2 py-0.5 rounded text-[10px] font-bold tracking-wider transition-colors",
                            zoomMode === 'FIT' 
                              ? (canvasMode === 'preview' ? "bg-blue-600 text-white shadow-sm" : "bg-white text-slate-900 shadow-sm") 
                              : (canvasMode === 'preview' ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-800")
                          )}
                          title="Sesuaikan ukuran layar"
                        >
                          FIT
                        </button>
                        <button 
                          onClick={() => setZoomMode('100%')}
                          className={cn(
                            "px-2 py-0.5 rounded text-[10px] font-bold tracking-wider transition-colors",
                            zoomMode === '100%' 
                              ? (canvasMode === 'preview' ? "bg-blue-600 text-white shadow-sm" : "bg-white text-slate-900 shadow-sm") 
                              : (canvasMode === 'preview' ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-800")
                          )}
                          title="Ukuran asli 100%"
                        >
                          100%
                        </button>
                      </div>
                    </div>

                    {/* Right: View Mode Toggle & Fullscreen */}
                    <div className="flex items-center gap-2">
                      {/* Segmented Mode Control */}
                      <div className={cn(
                        "flex items-center p-0.5 rounded border",
                        canvasMode === 'preview' ? "bg-white/5 border-white/10" : "bg-slate-100 border border-slate-200"
                      )}>
                        <button
                          onClick={() => setCanvasMode('edit')}
                          className={cn(
                            "flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold transition-all",
                            canvasMode === 'edit'
                              ? "bg-white text-slate-900 shadow-sm"
                              : (canvasMode === 'preview' ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-800")
                          )}
                          title="Mode Edit: Klik untuk mengubah teks atau analisis"
                        >
                          <Pencil className="h-3 w-3" />
                          Edit
                        </button>
                        <button
                          onClick={() => setCanvasMode('preview')}
                          className={cn(
                            "flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold transition-all",
                            canvasMode === 'preview'
                              ? "bg-blue-600 text-white shadow-sm"
                              : "text-slate-500 hover:text-slate-800"
                          )}
                          title="Mode Preview: Tampilan poster bersih tanpa tombol edit"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Preview
                        </button>
                      </div>

                      <div className={cn("h-3.5 w-px mx-0.5", canvasMode === 'preview' ? "bg-white/15" : "bg-slate-200")} />

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsPreviewOpen(true)}
                        className={cn(
                          "h-7 px-2 text-xs font-semibold gap-1 rounded",
                          canvasMode === 'preview'
                            ? "text-slate-200 hover:text-white hover:bg-white/10"
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                        )}
                        title="Buka Pratinjau Layar Penuh"
                      >
                        <Maximize2 className="h-3.5 w-3.5" />
                        <span className="text-[11px] font-bold">Layar Penuh</span>
                      </Button>
                    </div>
                  </div>
                )}

                <div className="w-full max-w-[1200px] flex justify-center gap-6 animate-in fade-in duration-300 origin-top">
                  <div 
                    style={currentZoom === 100 ? undefined : ({ zoom: currentZoom / 100 } as any)} 
                    className={cn(
                      "flex justify-center",
                      canvasMode === 'preview' && "drop-shadow-[0_25px_60px_rgba(0,0,0,0.85)]",
                      "w-full"
                    )}
                  >
                    <SafetyAlertPoster 
                      isGenerating={isGenerating} 
                      generationStep={generationStep}
                      readOnly={canvasMode === 'preview'}
                      onOpenDetail={(title) => { setSelectedAnalysis('poster:' + title); setIsRightPanelExpanded(true); setIsLeftPanelExpanded(false); }} 
                    />
                  </div>

                  {isGenerating && (
                    <div className="w-[380px] shrink-0 p-8 bg-white border border-slate-200 rounded-lg shadow-sm self-start sticky top-6">
                      <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-6">Tahap Penyusunan</h3>
                      <div className="relative space-y-0">
                        {[
                          { id: '1', label: 'Menyiapkan hasil analisis' },
                          { id: '2', label: 'Menyusun konteks kejadian' },
                          { id: '3', label: 'Menyusun kronologi & akar masalah' },
                          { id: '4', label: 'Menyusun tindakan perbaikan' },
                          { id: '5', label: 'Menyusun imbauan pekerja' },
                          { id: '6', label: 'Menyusun lesson learned' },
                          { id: '7', label: 'Memeriksa konsistensi Campaign' },
                        ].map((step, idx) => {
                          const currentStepIndex = Math.min(generationStep - 1, 6);
                          const isActive = idx === currentStepIndex;
                          const isCompleted = idx < currentStepIndex;
                          const isWaiting = idx > currentStepIndex;
                          const isLast = idx === 6;
                          
                          // Descriptions for each step to match the vertical stepper style
                          const stepDescriptions = [
                            "Membaca seluruh hasil analisis agen terkait.",
                            "Menyusun ringkasan fakta dan konteks utama.",
                            "Menata kronologi dan menentukan akar masalah.",
                            "Menyesuaikan rekomendasi perbaikan.",
                            "Merancang pesan imbauan yang persuasif.",
                            "Mengumpulkan dan merumuskan lesson learned.",
                            "Memastikan semua bagian konsisten dan lengkap."
                          ];
                          const description = stepDescriptions[idx] || "Memproses...";
                          
                          return (
                            <div key={step.id} className="relative flex items-start group">
                              {!isLast && (
                                <div className={`absolute top-6 left-[11px] w-[2px] h-[calc(100%-8px)] transition-colors duration-200 overflow-hidden ${isCompleted ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                                  {isActive && (
                                    <div className="absolute top-0 left-0 w-full h-[24px] bg-blue-500 motion-safe:animate-stepper-connector" />
                                  )}
                                </div>
                              )}
                              <div className="relative z-10 mr-4 mt-0.5 flex flex-col items-center">
                                {isCompleted ? (
                                  <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 border border-emerald-200 shrink-0 shadow-sm transition-all duration-300 animate-in zoom-in">
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                  </div>
                                ) : isActive ? (
                                  <div className="h-6 w-6 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-200 shrink-0 shadow-sm relative transition-all duration-300">
                                    <div className="absolute inset-[1px] rounded-full border-[1.5px] border-slate-200 border-t-blue-500 animate-spin" />
                                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                  </div>
                                ) : (
                                  <div className="h-6 w-6 rounded-full bg-white flex items-center justify-center text-slate-300 border border-slate-200 shrink-0 transition-all duration-300">
                                    <div className="h-1.5 w-1.5 rounded-full bg-slate-200" />
                                  </div>
                                )}
                              </div>
                              <div className={`flex flex-col pb-8 transition-opacity duration-300 ${isWaiting ? 'opacity-50' : 'opacity-100'}`}>
                                <div className="flex items-center gap-2">
                                  <span className="text-[12px] font-mono text-slate-400">0{idx + 1}</span>
                                  <span className={`text-[13px] ${isActive ? 'text-blue-600 font-semibold' : isCompleted ? 'text-slate-800 font-medium' : 'text-slate-500'}`}>
                                    {step.label}
                                  </span>
                                </div>
                                {isActive && (
                                  <div className="mt-1 motion-safe:animate-fade-in-up-short">
                                    <p className="text-[11px] text-slate-500 mb-2 transition-all duration-200">
                                      {description}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            </div>
          </div>


          {/* Right Panel (Sidebar) */}
          {/* Right Panel for Activity Log */}
          {selectedAnalysis === 'activity' && (
             <div className={cn("border-l border-slate-200 bg-white flex flex-col shrink-0 overflow-hidden relative transition-all duration-300", isRightPanelExpanded ? "w-[440px]" : "w-12 border-l")}>
              {!isRightPanelExpanded && (
                <div className="h-full w-full flex flex-col items-center pt-4 bg-white">
                  <button 
                    onClick={() => setIsRightPanelExpanded(true)}
                    className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
                    title="Expand Right Panel"
                  >
                    <PanelRight className="h-5 w-5" />
                  </button>
                  <div className="mt-4 writing-vertical text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                    Riwayat Perubahan
                  </div>
                </div>
              )}
                <div className="p-4 border-b border-slate-200 bg-white shrink-0 flex flex-row items-center justify-between sticky top-0 z-20">
                  <div>
                    <h3 className="text-[13px] font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 leading-none">
                      <History className="h-4 w-4 text-slate-800" />
                      Riwayat Perubahan
                    </h3>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">
                      Semua Aktivitas Campaign &middot; 8 Aktivitas
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => { setSelectedAnalysis(null); setIsRightPanelExpanded(false); setIsLeftPanelExpanded(true); }} className="h-7 w-7 p-0 hover:bg-slate-100 rounded-none">
                    <X className="h-4 w-4 text-slate-500" />
                  </Button>
                </div>
                
                <div className="p-4 border-b border-slate-200 bg-slate-50/50 shrink-0">
                  <div className="flex flex-col gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                      <input 
                        type="text" 
                        placeholder="Cari waktu, pengguna, atau isi perubahan..." 
                        className="w-full h-8 pl-9 pr-4 text-[11px] font-medium border border-slate-200 rounded bg-white focus:outline-none focus:border-slate-300 focus:ring-0 shadow-sm"
                      />
                    </div>
                    <div className="flex gap-2">
                      <select className="flex-1 h-8 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-600 border border-slate-200 rounded bg-white focus:outline-none shadow-sm cursor-pointer">
                        <option>Semua Status</option>
                        <option>Dibuat</option>
                        <option>Diubah</option>
                        <option>Dihapus</option>
                      </select>
                      <select className="flex-1 h-8 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-600 border border-slate-200 rounded bg-white focus:outline-none shadow-sm cursor-pointer">
                        <option>Semua Pengguna</option>
                        <option>AI Agent</option>
                        <option>Human (Investigator)</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 overflow-auto p-6 custom-scrollbar bg-slate-50">
                   <div className="flex flex-col gap-6 relative">
                     <div className="absolute left-[13px] top-4 bottom-4 w-0.5 bg-slate-200" />
                     
                     {/* Item 1 - Dihapus */}
                     <div className="relative pl-10">
                       <div className="absolute left-[9px] top-1.5 h-2.5 w-2.5 rounded-full bg-rose-500 ring-4 ring-slate-50" />
                       <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
                         <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                           <div className="flex items-center gap-1.5">
                             <Trash2 className="h-3 w-3 text-rose-500" />
                             <span className="text-[9px] font-black text-rose-600 uppercase tracking-widest bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">Dihapus</span>
                           </div>
                           <span className="text-[9px] font-bold text-slate-400">05 Ags 2026, 16:04 WIB</span>
                         </div>
                         <div className="p-4">
                           <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-wider mb-2">Pasca Kontak - Pasca 01:35</h4>
                           <div className="bg-rose-50/50 border border-rose-100 p-3 rounded mb-3">
                             <p className="text-[11px] font-medium text-rose-800 leading-relaxed italic">Alasan Penghapusan:<br/>Item dihapus dari analisis aktif karena sudah tercatat di laporan terpisah.</p>
                           </div>
                           <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                             <div className="flex flex-col">
                               <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Actor</span>
                               <div className="flex items-center gap-1">
                                 <span className="text-[10px] font-black text-slate-700">Aditya Pratama</span>
                                 <span className="text-[9px] text-slate-400 font-medium">&middot; Safety Sup</span>
                               </div>
                             </div>
                             <div className="flex flex-col items-end">
                               <span className="text-[8px] font-bold text-blue-500 flex items-center gap-1 uppercase tracking-widest mb-1"><User className="h-2.5 w-2.5" /> HUMAN</span>
                               <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">Versi 3</span>
                             </div>
                           </div>
                         </div>
                       </div>
                     </div>
                     
                     {/* Item 2 - Diubah */}
                     <div className="relative pl-10">
                       <div className="absolute left-[9px] top-1.5 h-2.5 w-2.5 rounded-full bg-blue-500 ring-4 ring-slate-50" />
                       <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
                         <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                           <div className="flex items-center gap-1.5">
                             <Edit3 className="h-3 w-3 text-blue-500" />
                             <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">Diubah</span>
                           </div>
                           <span className="text-[9px] font-bold text-slate-400">05 Ags 2026, 15:16 WIB</span>
                         </div>
                         <div className="p-4">
                           <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-wider mb-2">Pra-Kontak - 22:15 WITA</h4>
                           <div className="mb-3 space-y-3">
                             <div>
                               <span className="text-[8.5px] font-bold text-rose-500 uppercase tracking-widest block mb-1">Sebelum</span>
                               <div className="bg-rose-50/50 text-rose-800 text-[10.5px] font-medium p-2.5 rounded border border-rose-100 line-through opacity-80">
                                 Data belum lengkap.
                               </div>
                             </div>
                             <div>
                               <span className="text-[8.5px] font-bold text-emerald-600 uppercase tracking-widest block mb-1">Sesudah</span>
                               <div className="bg-emerald-50/50 text-emerald-800 text-[10.5px] font-medium p-2.5 rounded border border-emerald-100">
                                 Sistem DMS memicu peringatan kritis kategori Lockdown pada unit.
                               </div>
                             </div>
                           </div>
                           <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                             <div className="flex flex-col">
                               <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Actor</span>
                               <div className="flex items-center gap-1">
                                 <span className="text-[10px] font-black text-slate-700">Gulang Satriya</span>
                                 <span className="text-[9px] text-slate-400 font-medium">&middot; Lead Inv.</span>
                               </div>
                             </div>
                             <div className="flex flex-col items-end">
                               <span className="text-[8px] font-bold text-blue-500 flex items-center gap-1 uppercase tracking-widest mb-1"><User className="h-2.5 w-2.5" /> HUMAN</span>
                               <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">Versi 2</span>
                             </div>
                           </div>
                         </div>
                       </div>
                     </div>
                     
                     {/* Item 3 - Dibuat */}
                     <div className="relative pl-10">
                       <div className="absolute left-[9px] top-1.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-4 ring-slate-50" />
                       <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
                         <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                           <div className="flex items-center gap-1.5">
                             <Sparkles className="h-3 w-3 text-emerald-500" />
                             <span className="text-[9px] font-black text-emerald-700 uppercase tracking-widest bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">Dibuat</span>
                           </div>
                           <span className="text-[9px] font-bold text-slate-400">05 Ags 2026, 13:20 WIB</span>
                         </div>
                         <div className="p-4">
                           <div className="bg-slate-50 text-slate-700 text-[10.5px] font-medium p-3 rounded border border-slate-200 mb-3 italic">
                             "Draf awal berhasil di-generate dari data bukti lapangan."
                           </div>
                           <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                             <div className="flex flex-col">
                               <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Actor</span>
                               <div className="flex items-center gap-1">
                                 <span className="text-[10px] font-black text-slate-700">Fact & Chronology Agent</span>
                                 <span className="text-[9px] text-slate-400 font-medium">&middot; AI</span>
                               </div>
                             </div>
                             <div className="flex flex-col items-end">
                               <span className="text-[8px] font-bold text-indigo-500 flex items-center gap-1 uppercase tracking-widest mb-1"><Bot className="h-2.5 w-2.5" /> AI GENERATED</span>
                               <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">Versi 1</span>
                             </div>
                           </div>
                         </div>
                       </div>
                     </div>
                     
                   </div>
                </div>
             </div>
          )}


          {/* Right Panel for Poster Detail */}
          {selectedAnalysis?.startsWith('poster:') && (
             <div className={cn("border-l border-slate-200 bg-white flex flex-col shrink-0 overflow-hidden relative transition-all duration-300", isRightPanelExpanded ? "w-[440px]" : "w-0 border-none")}>
               <div className={cn("p-4 border-b border-slate-100 items-center justify-between bg-slate-50 sticky top-0 z-20 shrink-0", isRightPanelExpanded ? "flex" : "hidden")}>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded bg-slate-900 flex items-center justify-center">
                       <BarChart3 className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-[13px] font-bold text-slate-900 uppercase tracking-wider leading-none">Detail Analisis</h3>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Data Input Campaign</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => { setSelectedAnalysis(null); setIsRightPanelExpanded(false); setIsLeftPanelExpanded(true); }} className="h-7 w-7 p-0 hover:bg-slate-100 rounded-none">
                    <X className="h-4 w-4 text-slate-500" />
                  </Button>
               </div>
               
               <div className={cn("flex-1 overflow-auto p-6 custom-scrollbar pb-20", isRightPanelExpanded ? "block" : "hidden")}>
                  <h4 className="text-[14px] font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
                    {selectedAnalysis.replace('poster:', '')}
                  </h4>
                  
                  <div className="space-y-6 pl-2 border-l-2 border-slate-50">
                    {/* AI Generated Section */}
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                          <div className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-[9.5px] font-bold uppercase tracking-widest border border-indigo-200 shadow-sm">
                            <Brain className="h-3 w-3" />
                            AI Generated
                          </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-5">
                        <div>
                          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Generated By</div>
                          <div className="text-[11px] font-bold text-slate-700">Fact & Chronology Agent</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">05 Agustus 2026, 13:20 WIB</div>
                        </div>
                        <div>
                          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status Versi</div>
                          <div className="text-[10px] font-mono font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded w-fit border border-slate-200">
                            Versi aktif 1
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                        Pernyataan AI Generated
                        <span className="inline-flex items-center justify-center h-[16px] px-1.5 rounded bg-indigo-50 text-indigo-500 border border-indigo-200">
                          <Brain className="h-2.5 w-2.5 mr-1" />
                          <span className="font-black text-[8px] uppercase tracking-wider">AI</span>
                        </span>
                      </div>
                      <div className="text-[12.5px] text-slate-800 leading-[1.7] bg-white p-4 rounded-md border border-slate-200 shadow-sm">
                          Pernyataan atau rekomendasi spesifik yang dihasilkan AI untuk blok ini ditampilkan di sini sebagai penjelasan detail atas data yang dipublikasikan pada campaign poster.
                      </div>
                    </div>

                    {/* Events / Citations */}
                    <div className="pt-2">
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">Event & Evidence Link</div>
                      
                      <div className="border border-slate-200 rounded-md bg-white overflow-hidden shadow-sm">
                          <div className="p-3 border-b border-slate-100 flex gap-3 bg-white">
                            <div className="text-[10px] font-bold text-slate-500 pt-0.5 whitespace-nowrap tracking-wider">EVENT 1</div>
                            <div className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded flex items-center gap-1 text-[10px] h-fit border border-slate-200/60">
                              <FileText className="h-3 w-3" /> 2
                            </div>
                            <div className="text-[11.5px] font-medium text-slate-700 leading-relaxed pt-[2px]">
                              Informasi ini disarikan dari beberapa temuan investigasi lapangan dan catatan wawancara terkait elemen ini.
                            </div>
                            <ChevronDown className="h-4 w-4 text-slate-300 ml-auto shrink-0 mt-0.5" />
                          </div>
                          
                          <div className="bg-slate-50/80 p-4">
                            <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest mb-3 border border-blue-100">
                              <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div> Dokumen
                            </div>
                            
                            <div className="space-y-3">
                              <div className="bg-white border border-slate-200 rounded-md p-3 relative shadow-sm hover:border-blue-200 transition-colors">
                                <div className="absolute left-0 top-3 bottom-3 w-[3px] bg-slate-200 rounded-r"></div>
                                <div className="pl-3">
                                  <div className="flex items-center gap-2 mb-2">
                                    <FileText className="h-3.5 w-3.5 text-slate-400" />
                                    <span className="text-[11px] font-bold text-slate-800">Output Fact & Chronology</span>
                                  </div>
                                  <div className="flex justify-start mb-2">
                                    <span className="text-[8.5px] font-mono font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded uppercase tracking-wider">Evidence &middot; Analysis</span>
                                  </div>
                                  <div className="text-[11px] text-slate-600 leading-relaxed italic bg-slate-50/50 p-2.5 rounded border border-slate-100">
                                    "Berdasarkan bukti dari urutan kejadian sebelumnya mengenai elemen aktivitas operasional."
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                      </div>
                    </div>
                  </div>
               </div>
             </div>
          )}

        </div>
      </div>

    
      
      {/* Audit Log Drawer */}
      <Sheet open={isAuditDrawerOpen} onOpenChange={setIsAuditDrawerOpen}>
        <SheetContent className="w-full sm:max-w-[480px] p-0 flex flex-col bg-slate-50 border-l border-slate-300 shadow-xl overflow-hidden">
          <SheetHeader className="p-6 border-b border-slate-200 bg-white shrink-0 text-left">
            <div className="flex items-center justify-between">
              <div>
                <SheetTitle className="text-sm font-black text-slate-800 uppercase tracking-widest mb-1 flex items-center gap-2">
                  <History className="h-4 w-4 text-blue-600" />
                  RIWAYAT PERUBAHAN
                </SheetTitle>
                <SheetDescription className="text-xs text-slate-500 font-medium">
                  {auditItemFilter ? (
                    <span className="flex items-center gap-2">
                      <button onClick={() => setAuditItemFilter(null)} className="text-blue-600 hover:underline">&larr; Semua Perubahan</button>
                      <span>&middot;</span>
                      Riwayat Item
                    </span>
                  ) : (
                    `Campaign Generator · ${auditLogs.length} aktivitas`
                  )}
                </SheetDescription>
              </div>
            </div>
            
            {!auditItemFilter && (
              <div className="mt-4 flex flex-col gap-3">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <Input 
                    placeholder="Cari waktu, pengguna, atau isi perubahan..."
                    className="pl-8 h-9 text-xs bg-slate-50 border-slate-300"
                  />
                </div>
                <div className="flex gap-2">
                  <Select defaultValue="all">
                    <SelectTrigger className="h-8 text-xs bg-white border-slate-300 flex-1 shadow-none">
                      <SelectValue placeholder="Semua Aksi" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua</SelectItem>
                      <SelectItem value="CREATE">Dibuat</SelectItem>
                      <SelectItem value="UPDATE">Diubah</SelectItem>
                      <SelectItem value="DELETE">Dihapus</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select defaultValue="all">
                    <SelectTrigger className="h-8 text-xs bg-white border-slate-300 flex-1 shadow-none">
                      <SelectValue placeholder="Semua Pengguna" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Pengguna</SelectItem>
                      <SelectItem value="HUMAN">Human</SelectItem>
                      <SelectItem value="AI">AI/System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </SheetHeader>

          <ScrollArea className="flex-1 bg-slate-50/50 p-6">
            <div className="relative border-l border-slate-200 ml-4 pb-4 space-y-8">
              {auditLogs.filter(log => !auditItemFilter || log.id === auditItemFilter).length === 0 && (
                <div className="ml-6 mt-4 text-sm text-slate-500 bg-white p-4 rounded-md border border-slate-200 text-center">
                  <History className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                  <p className="font-bold text-slate-700">Belum ada perubahan</p>
                  <p className="text-xs mt-1">Aktivitas create, edit, dan delete pada agent ini akan muncul di sini.</p>
                </div>
              )}
              {auditLogs.filter(log => !auditItemFilter || log.id === auditItemFilter).length > 0 && (
                auditLogs
                  .filter(log => !auditItemFilter || log.id === auditItemFilter)
                  .map((log) => {
                  const isCreate = log.action === 'CREATE';
                  const isUpdate = log.action === 'UPDATE';
                  const isDelete = log.action === 'DELETE';
                  
                  const phaseLabel = log.after?.stage || log.before?.stage || "Campaign";
                  const timeLabel = log.after?.time || log.before?.time || "";
                  const previewText = log.after?.description || log.before?.description;

                  return (
                    <div key={log.id} className="relative pl-8">
                      <div className={cn(
                        "absolute -left-2.5 top-1 h-5 w-5 rounded-full border-2 border-white flex items-center justify-center z-10 shadow-sm",
                        isCreate && "bg-emerald-500",
                        isUpdate && "bg-blue-500",
                        isDelete && "bg-rose-500"
                      )}>
                        {isCreate && <Check className="h-3 w-3 text-white" />}
                        {isUpdate && <Pencil className="h-3 w-3 text-white" />}
                        {isDelete && <Trash2 className="h-3 w-3 text-white" />}
                      </div>

                      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden group">
                        <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                          <div className={cn(
                            "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm",
                            isCreate && "bg-emerald-100 text-emerald-700",
                            isUpdate && "bg-blue-100 text-blue-700",
                            isDelete && "bg-rose-100 text-rose-700"
                          )}>
                            {isCreate && "DIBUAT"}
                            {isUpdate && "DIUBAH"}
                            {isDelete && "DIHAPUS"}
                          </div>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {new Date(log.timestamp).toLocaleString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })} WIB
                          </span>
                        </div>

                        <div className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span 
                              className="text-xs font-bold text-slate-700 cursor-pointer hover:text-blue-600 transition-colors"
                            >
                              {phaseLabel} &middot; {timeLabel}
                            </span>
                          </div>

                          {isDelete && log.deletionReason && (
                            <p className="text-xs text-slate-600 mb-3 bg-rose-50 p-2 rounded border border-rose-100">
                              <span className="font-bold block mb-1">Alasan Penghapusan:</span>
                              {log.deletionReason}
                            </p>
                          )}

                          {(isCreate || isUpdate) && (
                            <div className="text-[11px] text-slate-800 leading-relaxed italic border-l-2 border-slate-300 pl-3 py-1 mb-3">
                              "{isUpdate && log.after ? log.after.description : previewText}"
                            </div>
                          )}

                          {isUpdate && log.before && log.after && (
                            <details className="group">
                              <summary className="text-[10px] font-bold text-blue-600 cursor-pointer hover:text-blue-700 list-none flex items-center gap-1">
                                <span className="group-open:hidden">[Lihat Detail Perubahan]</span>
                                <span className="hidden group-open:inline">[Tutup Detail Perubahan]</span>
                              </summary>
                              
                              <div className="mt-3 space-y-3 pt-3 border-t border-slate-100">
                                {log.changeNote && (
                                  <div>
                                    <div className="text-[9px] font-bold text-slate-400 mb-1">CATATAN ANOTASI</div>
                                    <div className="text-[11px] text-slate-700 bg-slate-50 p-2 rounded border border-slate-100">{log.changeNote}</div>
                                  </div>
                                )}
                                
                                <div>
                                  <div className="text-[9px] font-bold text-slate-400 mb-1">SEBELUM</div>
                                  <div className="bg-red-50 text-red-900 p-2 rounded text-[11px] border border-red-100">
                                    {log.before.time && <span className="font-bold mr-1">{log.before.time} -</span>}
                                    {log.before.description}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-[9px] font-bold text-slate-400 mb-1">SESUDAH</div>
                                  <div className="bg-emerald-50 text-emerald-900 p-2 rounded text-[11px] border border-emerald-100">
                                    {log.after.time && <span className="font-bold mr-1">{log.after.time} -</span>}
                                    {log.after.description}
                                  </div>
                                </div>
                              </div>
                            </details>
                          )}

                          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[10px] text-slate-500 font-medium">Actor</span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-slate-700">{log.actorName}</span>
                                <span className="text-[10px] text-slate-400">&middot; {log.actorRole}</span>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <div className="flex items-center gap-1">
                                {log.actorType === 'AI' && <Brain className="h-3 w-3 text-purple-500" />}
                                {log.actorType !== 'AI' && <User className="h-3 w-3 text-blue-500" />}
                                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                                  {log.actorType === 'AI' ? 'AI GENERATED' : log.actorType === 'SYSTEM' ? 'SYSTEM' : 'HUMAN'}
                                </span>
                              </div>
                              <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                                Versi {log.versionTo}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>


      
      {/* Preview Modal */}
      {/* Fullscreen Dark Studio / Lightbox Preview */}
      {isPreviewOpen && (
        <div 
          className="fixed inset-0 z-50 flex flex-col bg-[#07090e] text-slate-100 select-none overflow-hidden animate-in fade-in duration-200"
          style={{
            backgroundImage: "radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px)",
            backgroundSize: "24px 24px"
          }}
        >
          {/* Dark Glassmorphic Top Toolbar */}
          <div className="h-14 px-6 bg-[#0f141f]/95 backdrop-blur-md border-b border-white/10 flex items-center justify-between shrink-0 shadow-2xl z-30 select-none">
            {/* Left Title & Status */}
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-md bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Eye className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xs font-black tracking-widest uppercase text-white">
                    PREVIEW KONTEN
                  </h2>
                  <span className="text-[10px] font-mono font-semibold text-slate-400">
                    SA-004/IX/2026
                  </span>
                  <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 rounded uppercase tracking-wider">
                    Siap Publikasi
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 font-medium">
                  Ukuran Standar A4 (1000 &times; 1414 px) &middot; Resolusi Siap Cetak
                </div>
              </div>
            </div>

            {/* Center Zoom & Pan Controls */}
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-white/5 border border-white/10 rounded-md p-0.5 shadow-inner">
                <button 
                  onClick={handleModalZoomOut} 
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded transition-colors"
                  title="Perkecil (-)"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setModalZoom(100)}
                  className="text-xs font-mono font-bold text-slate-200 hover:text-white w-14 text-center select-none py-1 hover:bg-white/10 rounded transition-colors"
                  title="Klik untuk reset ke 100%"
                >
                  {Math.round(modalZoom)}%
                </button>
                <button 
                  onClick={handleModalZoomIn} 
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded transition-colors"
                  title="Perbesar (+)"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center bg-white/5 border border-white/10 rounded-md p-0.5">
                <button 
                  onClick={handleModalFit} 
                  className="px-2.5 py-1 rounded text-[10px] font-bold tracking-wider text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                  title="Sesuaikan dengan Layar (F)"
                >
                  FIT
                </button>
                <button 
                  onClick={handleModalFill} 
                  className="px-2.5 py-1 rounded text-[10px] font-bold tracking-wider text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                  title="Penuhi Lebar Layar"
                >
                  FILL
                </button>
                <button 
                  onClick={() => setModalZoom(100)} 
                  className={`px-2.5 py-1 rounded text-[10px] font-bold tracking-wider transition-colors ${modalZoom === 100 ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white hover:bg-white/10'}`}
                  title="Ukuran Asli 100% (0)"
                >
                  100%
                </button>
              </div>

              <div className="h-4 w-px bg-white/15 mx-1" />

              <button 
                onClick={() => setModalPanMode(!modalPanMode)} 
                className={`p-1.5 px-2.5 rounded-md border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  (modalPanMode || isSpacePressed)
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 shadow-sm' 
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                }`}
                title="Hand Tool / Geser Canvas (Tahan Spasi + Drag Mouse)"
              >
                <Hand className="w-3.5 h-3.5" />
                <span className="text-[11px]">Pan</span>
              </button>

              <div className="text-[10px] text-slate-500 hidden xl:flex items-center gap-1 ml-2">
                <span className="text-slate-400">Tips:</span> Tahan <kbd className="px-1 py-0.2 bg-white/10 rounded text-[9px] font-mono text-slate-300">Spasi</kbd> untuk pan &middot; <kbd className="px-1 py-0.2 bg-white/10 rounded text-[9px] font-mono text-slate-300">Ctrl+Scroll</kbd> untuk zoom
              </div>
            </div>

            {/* Right Action Buttons */}
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsPreviewOpen(false)} 
                className="h-8 px-3 text-xs font-bold bg-white/10 hover:bg-rose-600 hover:text-white text-slate-200 border border-white/10 rounded flex items-center gap-1.5 transition-all group"
                title="Tutup Pratinjau (ESC)"
              >
                <X className="w-4 h-4 text-slate-400 group-hover:text-white" />
                <span>Tutup</span>
                <kbd className="px-1.5 py-0.2 bg-black/40 rounded text-[9px] font-mono text-slate-300 group-hover:bg-rose-800">
                  ESC
                </kbd>
              </button>
            </div>
          </div>

          {/* Canvas Viewport */}
          <div 
            ref={modalViewportRef}
            onMouseDown={handleModalMouseDown}
            onMouseMove={handleModalMouseMove}
            onMouseUp={handleModalMouseUp}
            onMouseLeave={handleModalMouseUp}
            onWheel={handleModalWheel}
            className={cn(
              "flex-1 overflow-auto p-12 relative flex justify-center items-start custom-dark-scrollbar",
              (modalPanMode || isSpacePressed) 
                ? (isDraggingPanRef.current ? "cursor-grabbing" : "cursor-grab") 
                : "cursor-default"
            )}
          >
            <div 
              id="printable-safety-alert-poster"
              style={{ 
                zoom: modalZoom / 100,
                transformOrigin: 'top center',
              } as any} 
              className="transition-transform duration-100 origin-top shadow-[0_25px_80px_rgba(0,0,0,0.9)] ring-1 ring-white/10 rounded-sm bg-white"
            >
              <SafetyAlertPoster 
                isGenerating={isGenerating} 
                generationStep={generationStep}
                readOnly={true}
              />
            </div>
          </div>
        </div>
      )}


      {/* Floating Data Input Modal */}
      {showDataInputModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded bg-slate-800 flex items-center justify-center">
                   <Database className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="text-[14px] font-black text-slate-900 uppercase tracking-wider leading-none mb-1">Data Input</h3>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest">Metadata Campaign</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowDataInputModal(false)} className="h-8 w-8 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md">
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar bg-slate-50/30">
              {dataAnalisis.map((item, index) => (
                <div key={item.id} className="bg-white border border-slate-200 rounded-md p-5 shadow-sm">
                   <h4 className="text-[13px] font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                     <span className="bg-slate-100 text-slate-500 h-5 w-5 rounded flex items-center justify-center text-[10px]">{index + 1}</span>
                     {item.name}
                   </h4>
                   
                   <div className="pl-2 border-l-2 border-slate-100">
                     <div className="text-[12.5px] text-slate-700 leading-[1.8] whitespace-pre-wrap">
                       {item.content}
                     </div>
                   </div>
                </div>
              ))}
            </div>
            
            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-200 bg-white flex justify-end">
              <Button onClick={() => setShowDataInputModal(false)} className="bg-slate-800 hover:bg-slate-900 text-white shadow-none text-xs h-8 px-4 rounded-sm">
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Validate Modal */}
      <Dialog open={showValidateModal} onOpenChange={setShowValidateModal}>
        <DialogContent className="max-w-[425px] p-0 overflow-hidden border-0 shadow-2xl">
          <div className="p-6">
            <DialogHeader className="mb-4 text-left">
              <DialogTitle className="text-xl font-bold text-slate-900">Sahkan konten?</DialogTitle>
              <DialogDescription className="text-sm text-slate-600 mt-3 leading-relaxed text-left">
                Setelah konten disahkan, konten dan seluruh hasil pada Campaign ini akan dikunci dan tidak dapat diedit lagi. Pastikan seluruh hasil sudah diperiksa dan sudah sesuai sebelum melanjutkan.
              </DialogDescription>
            </DialogHeader>
            
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-md my-6 flex flex-col gap-1.5">
              <div className="text-xs text-slate-600">1 halaman Poster</div>
              <div className="text-xs text-slate-600">Terakhir disimpan 02.59 WITA</div>
            </div>
            
            <DialogFooter className="gap-3 sm:gap-0 mt-2">
              <Button variant="ghost" onClick={() => setShowValidateModal(false)} className="font-bold text-slate-700 hover:bg-slate-100">
                Kembali
              </Button>
              <Button 
                onClick={() => {
                  setIsApproved(true);
                  setShowValidateModal(false);
                  toast.success("Konten berhasil disahkan.");
                }} 
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-none px-6"
              >
                Sahkan Konten
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>

  );
}
