import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Loader2, ShieldCheck, X, ChevronRight, ChevronLeft, Check, RotateCcw, AlertTriangle, FileText, Info, Search, Upload, Eye, User, Users, Wrench, MapPin, Folder, ArrowRight, Image as ImageIcon, Video, Mic, Clock, Map, Ruler, ShieldAlert, BadgeCheck, ClipboardCheck, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useReadiness, ReadinessRun, EvidenceRequirementResult, RequirementStatus } from "@/hooks/useReadiness";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const InfoTooltip = ({ content, children, className }: { content: React.ReactNode, children?: React.ReactNode, className?: string }) => {
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={cn("inline-flex items-center gap-1.5 cursor-help group", className)}>
            {children}
            <Info className="h-3.5 w-3.5 text-slate-400 group-hover:text-blue-500 transition-colors shrink-0 outline-none" />
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" sideOffset={6} className="max-w-[280px] bg-slate-900 text-slate-50 border-slate-800 shadow-md p-3 rounded-lg z-[120]">
          <p className="text-[12px] font-medium leading-relaxed">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const getCategoryDescription = (category: string) => {
  const lower = category.toLowerCase();
  if (lower.includes("fakta")) return "Bukti yang membantu memastikan apa yang terjadi, kapan terjadi, dan kondisi aktual di sekitar kejadian.";
  if (lower.includes("wawancara")) return "Keterangan orang yang terlibat, melihat, menangani, atau mengetahui konteks kejadian.";
  if (lower.includes("people")) return "Bukti mengenai siapa yang terlibat, perannya saat kejadian, serta kesiapan atau kewenangannya untuk melakukan pekerjaan tersebut.";
  if (lower.includes("part")) return "Bukti mengenai unit, alat, material, komponen, atau benda fisik yang terlibat dalam kejadian.";
  if (lower.includes("position")) return "Bukti yang membantu memahami posisi orang, unit, objek, jalur pergerakan, serta kondisi fisik lokasi kejadian.";
  if (lower.includes("paper")) return "Dokumen yang menjelaskan bagaimana pekerjaan direncanakan, dikendalikan, dan seharusnya dilakukan.";
  return "";
};

const getCategoryDisplayName = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes("event truth")) return "Fakta Kejadian";
  return name.replace(/^\d+\s*/, "").replace(/\b\w/g, c => c.toUpperCase());
};

const getCategoryIcon = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes("event truth")) return <FileText className="h-4 w-4" />;
  if (lower.includes("human testimony")) return <User className="h-4 w-4" />;
  if (lower.includes("people")) return <Users className="h-4 w-4" />;
  if (lower.includes("part")) return <Wrench className="h-4 w-4" />;
  if (lower.includes("position")) return <MapPin className="h-4 w-4" />;
  if (lower.includes("paper")) return <Folder className="h-4 w-4" />;
  return <Folder className="h-4 w-4" />;
};

const getRequirementIcon = (label: string) => {
  const lower = label.toLowerCase();
  if (lower.includes("video") || lower.includes("cctv")) return <Video className="h-4 w-4 text-slate-500" />;
  if (lower.includes("foto")) return <ImageIcon className="h-4 w-4 text-slate-500" />;
  if (lower.includes("waktu") || lower.includes("urutan")) return <Clock className="h-4 w-4 text-slate-500" />;
  if (lower.includes("bap") || lower.includes("sop") || lower.includes("identitas")) return <FileText className="h-4 w-4 text-slate-500" />;
  if (lower.includes("wawancara saksi")) return <Users className="h-4 w-4 text-slate-500" />;
  if (lower.includes("rekaman")) return <Mic className="h-4 w-4 text-slate-500" />;
  if (lower.includes("briefing") || lower.includes("p2h")) return <ClipboardCheck className="h-4 w-4 text-slate-500" />;
  if (lower.includes("kompetensi")) return <BadgeCheck className="h-4 w-4 text-slate-500" />;
  if (lower.includes("part") || lower.includes("komponen") || lower.includes("teknis")) return <Wrench className="h-4 w-4 text-slate-500" />;
  if (lower.includes("kondisi unit")) return <Truck className="h-4 w-4 text-slate-500" />;
  if (lower.includes("lokasi") || lower.includes("posisi")) return <MapPin className="h-4 w-4 text-slate-500" />;
  if (lower.includes("peta")) return <Map className="h-4 w-4 text-slate-500" />;
  if (lower.includes("dimensi") || lower.includes("pengukuran")) return <Ruler className="h-4 w-4 text-slate-500" />;
  if (lower.includes("hira")) return <ShieldAlert className="h-4 w-4 text-slate-500" />;
  if (lower.includes("standar")) return <ShieldCheck className="h-4 w-4 text-slate-500" />;
  return <FileText className="h-4 w-4 text-slate-500" />;
};


interface EvidenceReadinessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProceedToAnalysis: () => void;
}

export function EvidenceReadinessModal({ open, onOpenChange, onProceedToAnalysis }: EvidenceReadinessModalProps) {
  const { caseId } = useParams<{ caseId: string }>();
  const { runs, triggerManualCheck, latestRun, overrideAnalysis, recheckRequirement } = useReadiness(caseId);
  const [view, setView] = useState<"RESULT" | "HISTORY" | "ARCHIVE">("RESULT");
  const [selectedRun, setSelectedRun] = useState<ReadinessRun | null>(null);
  
  const [activeReqId, setActiveReqId] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [checkSequence, setCheckSequence] = useState(0);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  
  const [recheckingIds, setRecheckingIds] = useState<Record<string, boolean>>({});
  const [uploadingIds, setUploadingIds] = useState<Record<string, { status: "uploading" | "processing", progress: number }>>({});
  const [understood, setUnderstood] = useState(false);
  const [confirmNote, setConfirmNote] = useState("");

  const activeRun = view === "ARCHIVE" ? selectedRun : latestRun;
  
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Flattened list of results for navigation
  const flatResults = useMemo(() => {
    if (!activeRun) return [];
    return activeRun.results || [];
  }, [activeRun]);
  
  const currentIndex = useMemo(() => {
    if (!activeReqId || flatResults.length === 0) return -1;
    return flatResults.findIndex(r => r.id === activeReqId);
  }, [activeReqId, flatResults]);

  // Initial expand logic
  useEffect(() => {
    if (open && activeRun && activeRun.results.length > 0 && latestRun?.status !== "CHECKING") {
      const getPriority = (r: EvidenceRequirementResult) => {
        if (r.status === "BROKEN") return 1;
        if (r.status === "MISSING" && r.level === "REQUIRED") return 2;
        if (r.status === "NEEDS_VERIFICATION") return 3;
        if (r.status === "MISSING" && r.level !== "REQUIRED") return 4;
        return 5;
      };
      
      const sorted = [...activeRun.results].sort((a, b) => getPriority(a) - getPriority(b));
      const target = sorted[0];
      
      if (Object.keys(expandedCategories).length === 0 && target) {
        setExpandedCategories({ [target.category]: true });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, activeRun, latestRun?.status]);

  useEffect(() => {
    if (latestRun?.status === "CHECKING") {
      setCheckSequence(1);
      const t1 = setTimeout(() => setCheckSequence(2), 1000);
      const t2 = setTimeout(() => setCheckSequence(3), 2200);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    } else {
      setCheckSequence(0);
    }
  }, [latestRun?.status]);

  const selectItemAndScroll = useCallback((reqId: string, category: string) => {
    setActiveReqId(reqId);
    setExpandedCategories(prev => ({ ...prev, [category]: true }));
    setTimeout(() => {
      const el = itemRefs.current[reqId];
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 120);
  }, []);

  const handleNext = useCallback(() => {
    if (currentIndex >= 0 && currentIndex < flatResults.length - 1) {
      const nextItem = flatResults[currentIndex + 1];
      selectItemAndScroll(nextItem.id, nextItem.category);
    }
  }, [currentIndex, flatResults, selectItemAndScroll]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      const prevItem = flatResults[currentIndex - 1];
      selectItemAndScroll(prevItem.id, prevItem.category);
    }
  }, [currentIndex, flatResults, selectItemAndScroll]);

  const handleNextGap = useCallback(() => {
    if (currentIndex >= 0 && currentIndex < flatResults.length) {
      const nextIssueIndex = flatResults.findIndex((r, idx) => idx > currentIndex && r.status !== "FULFILLED");
      if (nextIssueIndex !== -1) {
        const nextItem = flatResults[nextIssueIndex];
        selectItemAndScroll(nextItem.id, nextItem.category);
      } else {
        // If no more issues after current, loop from start to find any remaining issue
        const anyIssueIndex = flatResults.findIndex(r => r.status !== "FULFILLED");
        if (anyIssueIndex !== -1 && anyIssueIndex !== currentIndex) {
          const nextItem = flatResults[anyIssueIndex];
          selectItemAndScroll(nextItem.id, nextItem.category);
        }
      }
    }
  }, [currentIndex, flatResults, selectItemAndScroll]);

  const hasNextGap = useMemo(() => {
    if (flatResults.length === 0) return false;
    return flatResults.some((r, idx) => idx !== currentIndex && r.status !== "FULFILLED");
  }, [flatResults, currentIndex]);

  // Keyboard navigation
  useEffect(() => {
    if (!open || latestRun?.status === "CHECKING") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't interfere with inputs/textareas
      if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") {
        return;
      }
      
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          handleNext();
          break;
        case "ArrowUp":
          e.preventDefault();
          handlePrev();
          break;
        case "ArrowRight":
          e.preventDefault();
          handleNext();
          break;
        case "ArrowLeft":
          e.preventDefault();
          handlePrev();
          break;
        case "Escape":
          // Radix Dialog handles ESC, but we can hook if needed
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, handleNext, handlePrev, latestRun?.status]);

  const activeRequirement = useMemo(() => {
    if (currentIndex === -1) return null;
    return flatResults[currentIndex];
  }, [currentIndex, flatResults]);

  const gapCount = useMemo(() => {
    if (!activeRun) return 0;
    return activeRun.results.filter(r => r.status === "MISSING" || r.status === "BROKEN").length;
  }, [activeRun]);

  const checkCount = useMemo(() => {
    if (!activeRun) return 0;
    return activeRun.results.filter(r => r.status === "NEEDS_VERIFICATION").length;
  }, [activeRun]);
  
  const readyCount = useMemo(() => {
    if (!activeRun) return 0;
    return activeRun.results.filter(r => r.status === "FULFILLED").length;
  }, [activeRun]);

  // Map analysis modules to evidence items causing gaps
  const impactMap = useMemo(() => {
    if (!activeRun) return {};
    const ALL_ANALYSES = ["Fact & Chronology", "Fact", "Actor", "PEEPO", "IPLS", "Chronology"];
    const map: Record<string, { status: "Ready" | "Needs Verification" | "Blocked", count: number }> = {};
    
    ALL_ANALYSES.forEach(analysis => {
      const impactingCats = activeRun.categories?.filter(c => c.downstreamImpact.includes(analysis)) || [];
      if (impactingCats.length === 0) {
        map[analysis] = { status: "Ready", count: 0 };
        return;
      }
      
      let blockingCount = 0;
      let reviewCount = 0;
      
      impactingCats.forEach(cat => {
        const items = activeRun.results.filter(r => r.category === cat.name);
        items.forEach(req => {
          if (req.status === "BROKEN" || req.status === "MISSING") blockingCount++;
          else if (req.status === "NEEDS_VERIFICATION") reviewCount++;
        });
      });
      
      if (blockingCount > 0) map[analysis] = { status: "Blocked", count: blockingCount };
      else if (reviewCount > 0) map[analysis] = { status: "Needs Verification", count: reviewCount };
      else map[analysis] = { status: "Ready", count: 0 };
    });
    return map;
  }, [activeRun]);

  if (!open) return null;

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setView("RESULT");
      setActiveReqId(null);
    }, 300);
  };

  const handleInlineRecheck = async (reqId: string) => {
    setRecheckingIds(prev => ({ ...prev, [reqId]: true }));
    if (recheckRequirement) {
      await recheckRequirement(reqId);
    }
    setRecheckingIds(prev => ({ ...prev, [reqId]: false }));
  };

  const handleSimulateUpload = (reqId: string) => {
    onOpenChange(false);
  };

  const handleViewPriorityGap = () => {
    if (!activeRun) return;
    const getPriority = (r: EvidenceRequirementResult) => {
      if (r.status === "BROKEN") return 1;
      if (r.status === "MISSING" && r.level === "REQUIRED") return 2;
      if (r.status === "NEEDS_VERIFICATION") return 3;
      if (r.status === "MISSING" && r.level !== "REQUIRED") return 4;
      return 5;
    };
    
    const issues = activeRun.results.filter(r => r.status !== "FULFILLED");
    if (issues.length === 0) return;
    
    const sorted = [...issues].sort((a, b) => getPriority(a) - getPriority(b));
    const target = sorted[0];
    
    selectItemAndScroll(target.id, target.category);
  };

  const getStatusIcon = (status: RequirementStatus, className?: string) => {
    switch (status) {
      case "FULFILLED": return <Check className={cn("text-emerald-500", className)} />;
      case "NEEDS_VERIFICATION": return <AlertTriangle className={cn("text-amber-500", className)} />;
      case "BROKEN":
      case "MISSING": return <X className={cn("text-rose-500", className)} />;
    }
  };

  const getStatusReason = (req: EvidenceRequirementResult) => {
    if (req.status === "FULFILLED") return "Evidence siap digunakan";
    if (req.status === "NEEDS_VERIFICATION") return req.issue || "Evidence meragukan";
    if (req.status === "BROKEN") return req.issue || "Evidence belum dapat digunakan";
    if (req.status === "MISSING") return "Evidence belum dapat digunakan";
    return "";
  };

  const renderChecklist = () => {
    if (!activeRun) return null;

    return (
      <div className="w-[38%] border-r border-slate-200 flex flex-col bg-white overflow-hidden z-10">
        <div className="px-5 py-4 border-b border-slate-100 bg-white shrink-0 flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <span className="text-[12px] font-medium">
              <span className="text-emerald-600 font-semibold">{readyCount} siap</span>
              <span className="text-slate-400 mx-1.5">·</span>
              <span className={checkCount > 0 ? "text-amber-600 font-semibold" : "text-slate-500"}>{checkCount} cek</span>
              <span className="text-slate-400 mx-1.5">·</span>
              <span className={gapCount > 0 ? "text-rose-600 font-semibold" : "text-slate-500"}>{gapCount} gap</span>
            </span>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {activeRun.categories?.map(category => {
            const isExpanded = expandedCategories[category.name];
            const items = activeRun.results.filter(r => r.category === category.name);
            const toggleCategory = () => setExpandedCategories(prev => ({ ...prev, [category.name]: !isExpanded }));
            
            const blockingItems = items.filter(r => r.status === "BROKEN" || r.status === "MISSING").length;
            const reviewItems = items.filter(r => r.status === "NEEDS_VERIFICATION").length;
            
            const isComplete = blockingItems === 0 && reviewItems === 0;
            
            let statusColor = "bg-emerald-500";
            let textColor = "text-emerald-600";
            let statusIcon = <Check className="h-3.5 w-3.5" />;
            let statusText = "Siap";
            
            if (blockingItems > 0) {
              statusColor = "bg-rose-500";
              textColor = "text-rose-600";
              statusIcon = <X className="h-3.5 w-3.5" />;
              statusText = `${blockingItems} gap`;
            } else if (reviewItems > 0) {
              statusColor = "bg-amber-500";
              textColor = "text-amber-600";
              statusIcon = <AlertTriangle className="h-3.5 w-3.5" />;
              statusText = `${reviewItems} meragukan`;
            }

            return (
              <div key={category.name} className="flex flex-col overflow-hidden bg-white relative">
                <div 
                  className={cn(
                    "flex items-center justify-between px-4 py-3 cursor-pointer transition-colors h-[48px] border-b border-slate-200",
                    isExpanded ? "bg-slate-100/60" : "bg-slate-50 hover:bg-slate-100/70"
                  )}
                  onClick={toggleCategory}
                >
                  <div className="flex items-center gap-3 flex-1 pl-1">
                    <div className="text-slate-500">
                      {getCategoryIcon(category.name)}
                    </div>
                    <h5 className="text-[13.5px] font-bold text-slate-800 tracking-tight">
                      {getCategoryDisplayName(category.name)}
                    </h5>
                    <span className="text-[12px] font-medium text-slate-400 px-1">
                      {category.fulfilledCount}/{category.totalCount}
                    </span>
                    <TooltipProvider delayDuration={300}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className={cn("flex items-center gap-1 ml-auto mr-2", textColor)}>
                            {statusIcon}
                            <span className="text-[12px] font-bold tracking-tight">{statusText}</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <p className="text-[12px] font-medium">
                            {blockingItems > 0 ? `${blockingItems} evidence masih menghambat analisis` : 
                             reviewItems > 0 ? `${reviewItems} evidence meragukan` : "Semua evidence siap digunakan"}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <ChevronRight className={cn("h-4 w-4 text-slate-400 transition-transform duration-200 shrink-0", isExpanded ? "rotate-90" : "")} />
                </div>
                
                {/* Child Evidence Hierarchy */}
                <div 
                  className={cn(
                    "relative flex-col bg-white transition-all overflow-hidden ease-out duration-200",
                    isExpanded ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"
                  )}
                >
                  {items.length === 0 && (
                     <div className="p-3 pl-10 text-[12px] text-slate-500">Belum ada evidence.</div>
                  )}
                  
                  {items.map(req => {
                    const isActive = req.id === activeReqId;
                    return (
                      <div 
                        key={req.id}
                        ref={(el) => (itemRefs.current[req.id] = el)}
                        onClick={() => setActiveReqId(req.id)}
                        className={cn(
                          "relative flex items-center justify-between py-2.5 px-4 pl-[48px] cursor-pointer group min-h-[44px]",
                          isActive ? "bg-blue-50/50" : "hover:bg-slate-50/70 transition-colors"
                        )}
                      >
                        {/* Selected accent line */}
                        {isActive && <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-blue-500 z-20" />}
                        
                        {/* Child Icon */}
                        <div className="absolute left-[20px] top-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-6 rounded bg-slate-50 border border-slate-100 group-hover:bg-white transition-colors z-10">
                          {getRequirementIcon(req.label)}
                        </div>
                        
                        <div className={cn(
                          "text-[12.5px] truncate flex-1 pr-4 transition-colors duration-150 ml-1.5", 
                          isActive ? "text-slate-900 font-semibold" : "text-slate-600 font-medium"
                        )}>
                          <div className="flex flex-col">
                            <span>{req.label}</span>
                          </div>
                        </div>
                        
                        <TooltipProvider delayDuration={200}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="shrink-0 p-1 outline-none">
                                {getStatusIcon(req.status, "h-4 w-4")}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="bg-slate-900 text-slate-50 border-slate-800 shadow-md">
                              <p className="text-[12px] font-medium">{getStatusReason(req)}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderEmptyState = () => (
    <div className="w-[62%] flex flex-col items-center justify-center bg-white">
      <div className="flex flex-col items-center max-w-[320px] text-center">
        <div className="mb-4">
          <Search className="h-10 w-10 text-slate-300 stroke-[1.5]" />
        </div>
        <h3 className="text-[16px] font-bold text-slate-900 mb-2">Pilih evidence</h3>
        <p className="text-[13.5px] text-slate-500 leading-relaxed mb-8">
          Pilih item dari daftar untuk melihat file, hasil pemeriksaan, dan dampaknya ke analisis.
        </p>
        
        {gapCount > 0 ? (
          <div className="flex flex-col items-center gap-4 w-full">
            <Button 
              className="h-10 px-8 text-[13px] font-semibold bg-slate-900 text-white hover:bg-slate-800 shadow-sm transition-all"
              onClick={handleViewPriorityGap}
            >
              Lihat gap prioritas
            </Button>
            <button className="text-[13px] font-medium text-slate-500 hover:text-slate-800 transition-colors" disabled>
              Pilih dari daftar
            </button>
          </div>
        ) : (
          <span className="text-[13px] font-medium text-slate-500">
            Belum ada evidence yang dipilih
          </span>
        )}
      </div>
    </div>
  );

  const renderDetail = () => {
    if (!activeRequirement) return renderEmptyState();

    const req = activeRequirement;
    const isRechecking = recheckingIds[req.id];
    const uploadState = uploadingIds[req.id];

    return (
      <div className="w-[62%] flex flex-col bg-white overflow-hidden animate-in fade-in duration-200 relative">
        <div className="px-10 py-8 border-b border-slate-100 shrink-0">
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{getCategoryDisplayName(req.category)}</span>
            <p className="text-[13px] text-slate-500 mb-1 leading-relaxed max-w-[90%] font-medium">
               {getCategoryDescription(req.category)}
            </p>
            
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-[22px] font-bold text-slate-900 leading-snug">
                {req.label}
              </h2>
              
              {hasNextGap && req.status === "FULFILLED" && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleNextGap}
                    className="h-8 px-3 text-[12.5px] font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 mr-2"
                  >
                    Next gap <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                  </Button>
                )}
                <div className="flex items-center gap-1.5 mt-1 bg-slate-50 rounded-md p-1 border border-slate-100">
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button 
                        onClick={handlePrev} 
                        disabled={currentIndex <= 0}
                        className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded transition-colors disabled:opacity-30 disabled:hover:bg-transparent outline-none"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-[11px] font-semibold bg-slate-800 text-white border-none">
                      Sebelumnya (↑)
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button 
                        onClick={handleNext} 
                        disabled={currentIndex >= flatResults.length - 1}
                        className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded transition-colors disabled:opacity-30 disabled:hover:bg-transparent outline-none"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-[11px] font-semibold bg-slate-800 text-white border-none">
                      Berikutnya (↓)
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              {getStatusIcon(req.status, "h-4 w-4")}
              <span className={cn(
                "text-[12px] font-bold uppercase tracking-widest",
                req.status === "FULFILLED" ? "text-emerald-700" :
                req.status === "NEEDS_VERIFICATION" ? "text-amber-700" : "text-rose-700"
              )}>
                {req.status === "FULFILLED" ? "SIAP" : req.status === "NEEDS_VERIFICATION" ? "MERAGUKAN" : "MENGHAMBAT"}
              </span>
            </div>
            
            
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-10 py-8 space-y-8 custom-scrollbar">

          <div className="space-y-4">
            <h5 className="text-[13px] font-bold text-slate-800">
              {req.status === "FULFILLED" ? "Digunakan untuk" : "Dampak"}
            </h5>
            
            <div className="flex flex-wrap items-center gap-2">
              {req.downstreamImpact.map(imp => {
                let Icon = FileText;
                if (imp.includes('Actor')) Icon = User;
                else if (imp.includes('PEEPO')) Icon = Search;
                else if (imp.includes('Prevention')) Icon = ShieldCheck;
                else if (imp.includes('IPLS')) Icon = Wrench;
                
                return (
                  <div key={imp} className="bg-white text-slate-700 font-semibold text-[12.5px] px-3 py-1.5 rounded-md border border-slate-200 flex items-center gap-2 shadow-sm">
                    <Icon className="h-3.5 w-3.5 text-blue-500" />
                    {imp}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="w-full h-px bg-slate-100" />
          
          <div className="space-y-2">
            <h5 className="text-[13px] font-bold text-slate-800">Yang dibutuhkan</h5>
            <div className="text-[14px] text-slate-600 leading-relaxed mb-4">
              {req.requiredDesc || "Standard requirement description."}
            </div>
            {(req.uploadAdvice || req.formatHint) && (
              <details className="group [&_summary::-webkit-details-marker]:hidden mt-2">
                <summary className="flex items-center gap-1.5 text-[13px] font-semibold text-blue-600 cursor-pointer list-none hover:text-blue-700 w-fit select-none outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded">
                  <Info className="h-4 w-4" /> Saran & format upload
                </summary>
                <div className="mt-3 text-[13px] text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-lg border border-slate-200 shadow-sm">
                  {req.uploadAdvice && (
                    <div className="mb-3">
                      <span className="font-bold text-slate-800 block mb-1 text-[12px] uppercase tracking-wide">Saran upload</span>
                      {req.uploadAdvice}
                    </div>
                  )}
                  {req.formatHint && (
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 text-[12px] uppercase tracking-wide">Contoh tipe file</span>
                      <div className="inline-flex items-center gap-1.5 text-[12px] font-medium text-slate-600 bg-white px-2 py-1 rounded-md border border-slate-200 shadow-sm">
                        <FileText className="h-3.5 w-3.5 text-slate-400" />
                        {req.formatHint}
                      </div>
                    </div>
                  )}
                </div>
              </details>
            )}
          </div>

          
          {req.verificationFocus && (
            <>
              <div className="w-full h-px bg-slate-100" />
              <div className="space-y-3 bg-amber-50/50 p-4 rounded-xl border border-amber-100/50">
                <h5 className="text-[13px] font-bold text-amber-900">Yang meragukan</h5>
                <p className="text-[14px] text-amber-800 leading-relaxed font-medium">{req.verificationFocus.issue}</p>
                <p className="text-[13px] text-amber-700/80 leading-relaxed">{req.verificationFocus.advice}</p>
                {req.actionAdvice && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-9 w-fit mt-2 text-[13px] font-semibold border-amber-200 bg-white shadow-sm hover:bg-amber-50 text-amber-800"
                    onClick={() => handleSimulateUpload(req.id)}
                  >
                    <Upload className="h-4 w-4 mr-2 text-amber-600" />
                    {req.actionAdvice.title}
                  </Button>
                )}
              </div>
            </>
          )}

          {req.extractedValues && (
             <>
              <div className="w-full h-px bg-slate-100" />
              <div className="space-y-4">
                <h5 className="text-[13px] font-bold text-slate-800">Dimensi / Pengukuran Diekstrak</h5>
                <div className="grid grid-cols-3 gap-4">
                  {req.extractedValues.map((ev, i) => (
                    <div key={i} className="flex flex-col gap-1 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                      <span className="text-[20px] font-bold text-slate-900 tracking-tight">{ev.value}</span>
                      <span className="text-[12.5px] text-slate-500 font-medium">{ev.label}</span>
                    </div>
                  ))}
                </div>
              </div>
             </>
          )}

          <div className="w-full h-px bg-slate-100" />

          <div className="space-y-4">
            <h5 className="text-[13px] font-bold text-slate-800">Ditemukan</h5>
            
            {uploadState ? (
              <div className="flex items-center gap-4 bg-white border border-slate-200 p-4 rounded-lg shadow-sm">
                <FileText className="h-5 w-5 text-blue-500" />
                <div className="flex flex-col flex-1 gap-1.5">
                  <span className="text-[13px] font-semibold text-slate-800">Upload_File_New.mp4</span>
                  <div className="flex items-center gap-2 text-[12px] text-slate-500 font-medium">
                    {uploadState.status === "uploading" ? (
                      <><span>Uploading...</span><span className="text-blue-600 font-bold">{uploadState.progress}%</span></>
                    ) : (
                      <><Loader2 className="h-3 w-3 animate-spin"/> Processing...</>
                    )}
                  </div>
                </div>
              </div>
            ) : req.matchedFiles.length > 0 ? (
              <div className="flex flex-col gap-3">
                {req.matchedFiles.map(mf => {
                  const isCCR = mf.id === "file-ccr-1";
                  
                  return (
                  <div key={mf.id} className="flex flex-col gap-4 bg-white border border-slate-200 p-4 rounded-lg shadow-sm group">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={cn("p-2 rounded mt-0.5", isCCR ? "bg-blue-50 text-blue-600" : "bg-slate-50 text-slate-500")}>
                          {isCCR ? <ClipboardCheck className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[13.5px] font-semibold text-slate-900 mb-1">{mf.name}</span>
                          
                          {req.status === "FULFILLED" ? (
                            <>
                              <div className="flex items-center gap-1.5 text-emerald-600 font-medium text-[12.5px] mb-1.5">
                                <Check className="h-3.5 w-3.5" /> Siap digunakan
                              </div>
                              <span className="text-[12px] text-slate-400 font-medium">
                                {isCCR 
                                  ? "Terhubung otomatis dari Laporan Awal (CCR)" 
                                  : `${req.formatHint?.split('·')[0] || "File"} · ${mf.name.split('.').pop()?.toUpperCase()} · ${(Math.random() * 40 + 1).toFixed(1)} MB`
                                }
                              </span>
                            </>
                          ) : mf.processingStatus === "ERROR" || req.status === "BROKEN" ? (
                            <span className="text-[12.5px] text-rose-600 font-medium">{req.issue || "Processing error"}</span>
                          ) : req.status === "NEEDS_VERIFICATION" ? (
                            <span className="text-[12.5px] text-amber-600 font-medium">Evidence meragukan.</span>
                          ) : (
                            <span className="text-[12.5px] text-slate-500 font-medium">Ditemukan</span>
                          )}
                        </div>
                      </div>
                      
                      {req.status === "FULFILLED" && (
                        <Button variant="ghost" size="sm" className="h-8 px-3 text-[12.5px] font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                          {isCCR 
                            ? <><Eye className="h-4 w-4 mr-1.5 text-slate-400 group-hover:text-blue-500 transition-colors" /> Detail tabel &rarr;</>
                            : <><Eye className="h-4 w-4 mr-1.5 text-slate-400 group-hover:text-blue-500 transition-colors" /> Buka evidence &rarr;</>
                          }
                        </Button>
                      )}
                    </div>
                  </div>
                )})}
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <span className="text-[14px] text-slate-600">Belum ada file yang ditemukan.</span>
                
                {req.relatedInfo && (
                  <div className="mt-2 flex flex-col gap-3 bg-white border border-slate-200 p-4 rounded-lg shadow-sm group">
                     <h6 className="text-[12.5px] font-bold text-slate-500 uppercase tracking-widest">Informasi terkait ditemukan</h6>
                     <div className="flex items-start justify-between mt-1">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-slate-50 rounded text-slate-500 mt-0.5">
                            <FileText className="h-4 w-4" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[13.5px] font-semibold text-slate-900 mb-1">{req.relatedInfo.title}</span>
                            <span className="text-[12.5px] text-slate-600 leading-relaxed max-w-[400px]">"{req.relatedInfo.desc}"</span>
                            <div className="mt-3 flex items-center gap-1.5 text-[12.5px] font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-md w-fit">
                               {req.relatedInfo.statusBadge}
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="h-8 px-3 text-[12.5px] font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50 transition-colors shrink-0">
                          <Eye className="h-4 w-4 mr-1.5 text-slate-400 group-hover:text-blue-500 transition-colors" /> Buka &rarr;
                        </Button>
                     </div>
                  </div>
                )}

                {req.actionAdvice ? (
                  <div className="mt-4 flex flex-col gap-3">
                     <h5 className="text-[13px] font-bold text-slate-800">Yang dapat dilakukan</h5>
                     <div className="flex items-center gap-4">
                       <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-9 w-fit text-[13px] font-semibold border-slate-300 bg-white shadow-sm hover:bg-slate-50 text-slate-700"
                          onClick={() => handleSimulateUpload(req.id)}
                        >
                          <Upload className="h-4 w-4 mr-2 text-slate-500" />
                          {req.actionAdvice.title}
                        </Button>
                        <span className="text-[12.5px] text-slate-500">{req.actionAdvice.helper}</span>
                     </div>
                  </div>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-9 w-fit text-[13px] font-semibold border-slate-300 bg-white shadow-sm hover:bg-slate-50 text-slate-700"
                    onClick={() => handleSimulateUpload(req.id)}
                  >
                    <Upload className="h-4 w-4 mr-2 text-slate-500" />
                    Upload file
                  </Button>
                )}
              </div>
            )}
          </div>



        </div>
      </div>
    );
  };

  const renderBottomBar = () => {
    if (!activeRun || view !== "RESULT") return null;

    const blockingIssues = gapCount;
    const hasIssues = blockingIssues > 0 || checkCount > 0;
    
    // Calculate total impacts
    const totalImpacts = Object.values(impactMap).filter(m => m.status !== "Ready").length;
    
    return (
      <div className="h-[76px] bg-white border-t border-slate-200 shrink-0 px-6 flex items-center justify-between z-20 relative shadow-[0_-4px_12px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-4">
          {hasIssues ? (
            <div className="flex items-center gap-3">
              {/* Removed as requested by user to reduce clutter */}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-600" />
              <span className="text-[14px] font-bold text-emerald-800">
                Evidence siap untuk analisis
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {hasIssues ? (
            <Button 
              className="h-10 px-6 text-[13.5px] font-semibold bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition-all"
              onClick={() => {
                setUnderstood(false);
                setConfirmNote("");
                setShowConfirmModal(true);
              }}
            >
              {blockingIssues > 0 ? `Lanjutkan dengan ${blockingIssues} gap` : "Lanjutkan ke analisis"}
            </Button>
          ) : (
            <Button 
              className="h-10 px-6 text-[13.5px] font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all"
              onClick={() => {
                onProceedToAnalysis();
                onOpenChange(false);
              }}
            >
              Mulai analisis
            </Button>
          )}
        </div>
      </div>
    );
  };


  const renderConfirmation = () => {
    const missingReqs = activeRun?.results.filter(r => r.status === "MISSING") || [];
    const brokenReqs = activeRun?.results.filter(r => r.status === "BROKEN" || r.status === "NEEDS_VERIFICATION") || [];
    const allIssues = [...missingReqs, ...brokenReqs];

    return (
      <div className="flex flex-col h-full bg-white animate-in slide-in-from-right-8 duration-300">
        <div className="px-12 py-10 flex-1 overflow-y-auto custom-scrollbar">
          <h2 className="text-[22px] font-bold text-slate-900 tracking-tight">KONFIRMASI ANALYSIS</h2>
          <p className="text-[14px] text-slate-500 mb-8 mt-1">Evidence Golden Gate</p>
          
          <div className="bg-rose-50/50 border border-rose-100 rounded-xl p-5 mb-10 flex flex-col gap-1.5">
            {missingReqs.length > 0 && <div className="text-[14px] font-semibold text-rose-600">{missingReqs.length} requirement wajib belum terpenuhi</div>}
            {brokenReqs.length > 0 && <div className="text-[14px] font-semibold text-rose-600">{brokenReqs.length} requirement wajib bermasalah</div>}
          </div>

          <h4 className="text-[12px] font-bold text-slate-500 uppercase tracking-widest mb-4">DETAIL BLOCKER</h4>
          <div className="flex flex-col gap-4 mb-10">
            {allIssues.map(req => (
              <div key={req.id} className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2 shrink-0" />
                <p className="text-[14px] text-slate-600 leading-relaxed">
                  <span className="font-bold text-slate-800">{req.label}</span> &mdash; {req.issue || getStatusReason(req)}
                </p>
              </div>
            ))}
          </div>

          <label className="flex items-center gap-3 mb-10 cursor-pointer group w-fit">
            <input 
              type="checkbox" 
              checked={understood}
              onChange={(e) => setUnderstood(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
            />
            <span className="text-[14px] text-slate-700 font-medium group-hover:text-slate-900">
              Saya memahami bahwa Analysis akan menggunakan evidence yang belum memenuhi requirement standar.
            </span>
          </label>

          <h4 className="text-[12px] font-bold text-slate-500 uppercase tracking-widest mb-4">CATATAN ALASAN MELANJUTKAN (OPSIONAL)</h4>
          <textarea 
            value={confirmNote}
            onChange={(e) => setConfirmNote(e.target.value)}
            placeholder="Tambahkan catatan jika diperlukan..."
            className="w-full h-[120px] rounded-xl border border-slate-200 p-4 text-[14px] text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all"
          />
        </div>

        <div className="px-12 py-6 border-t border-slate-100 flex items-center justify-between bg-white shrink-0">
          <button 
            onClick={() => setShowConfirmModal(false)}
            className="text-[14px] font-semibold text-slate-500 hover:text-slate-900 transition-colors outline-none"
          >
            Kembali ke Pemeriksaan
          </button>
          <Button 
            disabled={!understood}
            onClick={() => {
              overrideAnalysis(confirmNote, true);
              onProceedToAnalysis();
              setShowConfirmModal(false);
              onOpenChange(false);
              setView("RESULT");
            }}
            className="h-10 px-8 text-[14px] font-semibold bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 disabled:bg-slate-300 disabled:text-slate-500 transition-all"
          >
            Tetap Lanjutkan
          </Button>
        </div>
      </div>
    );
  };

  // ----------------------------------------------------------------------
  // MAIN RENDER
  // ----------------------------------------------------------------------
  return (
    <>
      {/* Backdrop */}
      <div 
        className={cn(
          "fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-[1px] transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        )} 
        onClick={handleClose}
      />
      
      {/* Drawer */}
      <div 
        className={cn(
          "fixed top-0 bottom-0 right-0 z-[101] w-[64vw] min-w-[860px] max-w-[1100px] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {showConfirmModal ? renderConfirmation() : (
          <>
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0 bg-white">
              <div className="flex items-center gap-3">
                <h3 className="text-[14px] font-bold text-slate-800 uppercase tracking-widest">
                  EVIDENCE GOLDEN GATE
                </h3>
              </div>
              <div className="flex items-center gap-4">
                <button className="text-slate-400 hover:text-slate-800 transition-colors p-1 outline-none" onClick={handleClose}>
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden flex flex-col relative bg-white">
              {latestRun?.status === "CHECKING" ? (
                 <div className="flex-1 flex flex-col bg-white overflow-y-auto overflow-x-hidden relative">
                   <div className="p-10 mx-auto w-full max-w-[560px] flex flex-col items-center">
                     <div className="w-full flex flex-col items-center text-center mt-6">
                       <div className="h-12 w-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center mb-5 relative">
                         <ShieldCheck className="h-6 w-6 text-slate-700 relative z-10" />
                         <div className="absolute inset-0 rounded-xl border-2 border-slate-900/10 animate-ping opacity-20" />
                       </div>
                       <h2 className="text-[20px] font-bold text-slate-900 tracking-tight mb-2">Memeriksa kesiapan evidence</h2>
                       <p className="text-[14px] text-slate-500 max-w-[420px] mb-8 leading-relaxed">
                         Evidence sedang dipetakan ke kebutuhan investigasi.
                       </p>
                     </div>
                   </div>
                 </div>
              ) : !activeRun ? (
                <div className="flex-1 flex flex-col items-center justify-center bg-white p-8 text-center">
                  <div className="h-16 w-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center shadow-sm mb-5">
                    <ShieldCheck className="h-8 w-8 text-slate-300" />
                  </div>
                  <h3 className="text-[18px] font-bold text-slate-900 tracking-tight mb-2">Pemeriksaan Kesiapan Evidence</h3>
                  <p className="text-[14px] text-slate-500 max-w-sm leading-relaxed mb-8">
                    Jalankan analisis awal untuk mencocokkan evidence yang tersedia dengan standar requirement investigasi.
                  </p>
                  <div className="flex items-center gap-3">
                    <Button variant="ghost" onClick={handleClose} className="text-slate-500 font-semibold">Tutup</Button>
                    <Button 
                      onClick={triggerManualCheck}
                      className="px-8 h-10 text-[13px] font-semibold bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition-all"
                    >
                      Periksa Evidence
                    </Button>
                  </div>
                </div>
              ) : (
                 <div className="flex-1 flex flex-col relative overflow-hidden">
                   <div className="flex flex-1 overflow-hidden">
                     {renderChecklist()}
                     {renderDetail()}
                   </div>
                   {renderBottomBar()}
                 </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
