import React, { useState, useMemo, useEffect } from "react";
import { Loader2, ShieldCheck, X, ChevronRight, Check, ArrowLeft, ArrowRight, RotateCcw, AlertTriangle, FileText, ChevronLeft, HelpCircle, Camera, Mic, Paperclip, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useReadiness, ReadinessRun, EvidenceRequirementResult } from "@/hooks/useReadiness";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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

const getCategoryDisplayName = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes("event truth")) return "Fakta Kejadian";
  // For others like "Human Testimony" or "People", the user said English is fine.
  // We'll strip the leading numbers like "01 EVENT TRUTH" -> "Event Truth"
  return name.replace(/^\d+\s*/, "").replace(/\b\w/g, c => c.toUpperCase());
};


interface EvidenceReadinessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProceedToAnalysis: () => void;
}

export function EvidenceReadinessModal({ open, onOpenChange, onProceedToAnalysis }: EvidenceReadinessModalProps) {
  const { runs, triggerManualCheck, latestRun, isOutdated, overrideAnalysis } = useReadiness();
  const [view, setView] = useState<"RESULT" | "HISTORY" | "ARCHIVE" | "CONFIRM_OVERRIDE">("RESULT");
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [showRecheckModal, setShowRecheckModal] = useState(false);
  const [selectedRun, setSelectedRun] = useState<ReadinessRun | null>(null);
  const [activeReqId, setActiveReqId] = useState<string | null>(null);
  const [overrideAck, setOverrideAck] = useState(false);
  const [overrideNote, setOverrideNote] = useState("");

  const [checkSequence, setCheckSequence] = useState(0);
  const [hasEvidence, setHasEvidence] = useState(true); // Mock edge case: zero evidence
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  const activeRun = view === "ARCHIVE" ? selectedRun : latestRun;

  // Auto-select priority requirement on ready
  useEffect(() => {
    if (open && activeRun && activeRun.results.length > 0 && !activeReqId && latestRun?.status !== "CHECKING") {
      const getPriority = (r: EvidenceRequirementResult) => {
        if (r.status === "BROKEN") return 1;
        if (r.status === "MISSING" && r.level === "REQUIRED") return 2;
        if (r.status === "NEEDS_VERIFICATION") return 3;
        if (r.status === "MISSING" && r.level !== "REQUIRED") return 4;
        return 5;
      };
      const sorted = [...activeRun.results].sort((a, b) => getPriority(a) - getPriority(b));
      setActiveReqId(sorted[0].id);

      // Auto-expand categories with issues
      const newExpanded: Record<string, boolean> = {};
      activeRun.categories?.forEach(cat => {
        if (cat.status === "NOT_READY" || cat.status === "NEEDS_ATTENTION") {
          newExpanded[cat.name] = true;
        } else {
          newExpanded[cat.name] = false;
        }
      });
      setExpandedCategories(newExpanded);
    }
  }, [open, activeRun, activeReqId, latestRun?.status]);

  // Checking sequence animation
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

  const groupedResults = useMemo(() => {
    if (!activeRun) return {};
    return activeRun.results.reduce((acc, req) => {
      const cat = req.category;
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(req);
      return acc;
    }, {} as Record<string, EvidenceRequirementResult[]>);
  }, [activeRun]);

  const activeRequirement = useMemo(() => {
    if (!activeRun || !activeReqId) return null;
    return activeRun.results.find(r => r.id === activeReqId) || null;
  }, [activeRun, activeReqId]);

  if (!open) return null;

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setView("RESULT");
      setOverrideAck(false);
      setOverrideNote("");
    }, 300);
  };

  const handleRecheck = () => {
    setActiveReqId(null);
    triggerManualCheck();
    setView("RESULT");
  };

  const translateLevel = (level: string) => {
    switch (level) {
      case "REQUIRED": return "WAJIB";
      case "RECOMMENDED": return "DISARANKAN";
      case "OPTIONAL": return "OPSIONAL";
      default: return level;
    }
  };

  const translateStatus = (status: string) => {
    switch (status) {
      case "FULFILLED": return "TERPENUHI";
      case "MISSING": return "BELUM ADA";
      case "BROKEN": return "ADA TAPI BERMASALAH";
      case "NEEDS_VERIFICATION": return "PERLU VERIFIKASI";
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "FULFILLED": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "BROKEN": return "bg-rose-50 text-rose-700 border-rose-200";
      case "MISSING": 
      case "NEEDS_VERIFICATION": return "bg-amber-50 text-amber-700 border-amber-200";
      default: return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };
  
  const getIndicatorColor = (status: string) => {
    switch (status) {
      case "FULFILLED": return "bg-emerald-500";
      case "BROKEN": return "bg-rose-500";
      case "MISSING": 
      case "NEEDS_VERIFICATION": return "bg-amber-500";
      default: return "bg-slate-300";
    }
  };
  // COMPACT GATE SUMMARY
  // ----------------------------------------------------------------------
  const renderSummary = () => {
    if (!activeRun) return null;
    const categoriesReady = activeRun.categories?.filter(c => c.status === "READY").length || 0;
    const totalCategories = activeRun.categories?.length || 6;
    
    const needsAttentionItems = activeRun.results.filter(c => c.status === "BROKEN" || (c.status === "MISSING" && c.level === "REQUIRED")).length;
    const needsVerifItems = activeRun.results.filter(c => c.status === "NEEDS_VERIFICATION").length;
    
    const isReady = activeRun.status === "READY";
    const isNeedsAttention = activeRun.status === "NEEDS_ATTENTION";
    const isNotReady = activeRun.status === "NOT_READY";

    let diffText = "";
    if (activeRun.previousRunId) {
      const prevRun = runs.find(r => r.id === activeRun.previousRunId);
      if (prevRun) {
        const prevReady = prevRun.categories?.filter(c => c.status === "READY").length || 0;
        const diff = categoriesReady - prevReady;
        if (diff !== 0) {
          diffText = `${diff > 0 ? '+' : ''}${diff} kategori siap dari Pemeriksaan #${prevRun.runNumber}`;
        } else {
          diffText = `Tidak ada perubahan kategori dari Pemeriksaan #${prevRun.runNumber}`;
        }
      }
    }

    // Calculate Analysis Readiness
    const analysisStatus: Record<string, "Ready" | "Needs Verification" | "Limited Evidence" | "Insufficient Evidence"> = {};
    const ALL_ANALYSES = ["Fact & Chronology", "Fact", "Actor", "PEEPO", "IPLS", "Chronology"];
    
    ALL_ANALYSES.forEach(analysis => {
      // Find all categories that impact this analysis
      const impactingCats = activeRun.categories?.filter(c => c.downstreamImpact.includes(analysis)) || [];
      if (impactingCats.length === 0) return;
      
      let worstStatus = 0; // 0=Ready, 1=Needs Verif, 2=Limited, 3=Insufficient
      
      impactingCats.forEach(cat => {
        if (cat.status === "NOT_READY") worstStatus = Math.max(worstStatus, 3);
        else if (cat.status === "NEEDS_ATTENTION") {
          // check if it's needs attention because of verification or missing recommended
          const catItems = activeRun.results.filter(r => r.category === cat.name);
          if (catItems.some(r => r.status === "NEEDS_VERIFICATION")) {
            worstStatus = Math.max(worstStatus, 1);
          } else {
            worstStatus = Math.max(worstStatus, 2);
          }
        }
      });
      
      if (worstStatus === 3) analysisStatus[analysis] = "Insufficient Evidence";
      else if (worstStatus === 2) analysisStatus[analysis] = "Limited Evidence";
      else if (worstStatus === 1) analysisStatus[analysis] = "Needs Verification";
      else analysisStatus[analysis] = "Ready";
    });

    const readyCount = Object.values(analysisStatus).filter(s => s === "Ready").length;
    const limitedCount = Object.values(analysisStatus).filter(s => s === "Limited Evidence").length;
    const insufficientCount = Object.values(analysisStatus).filter(s => s === "Insufficient Evidence").length;

    const summaryParts = [];
    if (readyCount > 0) summaryParts.push(`${readyCount} siap`);
    if (limitedCount > 0) summaryParts.push(`${limitedCount} terbatas`);
    if (insufficientCount > 0) summaryParts.push(`${insufficientCount} belum cukup`);
    
    const summaryLine = summaryParts.join(" · ");

    return (
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 shrink-0">
        <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center">
          <InfoTooltip content="Ringkasan kesiapan evidence untuk melanjutkan analisis AI. Bagian ini membantu melihat status umum case secara cepat.">
            GATE SUMMARY
          </InfoTooltip>
        </h4>
        
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-sm flex flex-col gap-3">
          <div className="flex items-center gap-4">
            <span className="text-[12px] font-semibold text-slate-500 w-32">Status</span>
            <div className={cn(
              "text-[11px] font-bold uppercase px-2.5 py-1 rounded-md border transition-colors duration-300",
              isNotReady ? "bg-rose-50 text-rose-700 border-rose-200" :
              isNeedsAttention ? "bg-amber-50 text-amber-700 border-amber-200" :
              "bg-emerald-50 text-emerald-700 border-emerald-200"
            )}>
              {isNotReady ? "BELUM SIAP" : isNeedsAttention ? "PERLU DILENGKAPI" : "SIAP DIANALISIS"}
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 pt-3 border-t border-slate-100">
            <div>
              <div className="text-[11px] font-semibold text-slate-500 mb-0.5 flex items-center">
                <InfoTooltip content="Menunjukkan berapa banyak kategori evidence yang sudah cukup siap digunakan dalam analisis.">
                  Semantic Coverage
                </InfoTooltip>
              </div>
              <div className="text-[14px] font-bold text-slate-800">{categoriesReady} / {totalCategories} siap</div>
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-500 mb-0.5 flex items-center">
                <InfoTooltip content="Jumlah kategori atau evidence yang punya masalah dan perlu ditindaklanjuti.">
                  Needs Attention
                </InfoTooltip>
              </div>
              <div className="text-[14px] font-bold text-rose-600">{needsAttentionItems}</div>
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-500 mb-0.5 flex items-center">
                <InfoTooltip content="Jumlah evidence yang terdeteksi sistem tetapi masih perlu konfirmasi dari pengguna.">
                  Needs Verification
                </InfoTooltip>
              </div>
              <div className="text-[14px] font-bold text-amber-600">{needsVerifItems}</div>
            </div>
          </div>

          {diffText && (
             <div className="text-[11px] font-medium text-slate-500 pt-2 border-t border-slate-100">
               {diffText}
             </div>
          )}
        </div>
        
        {/* KESIAPAN ANALISIS */}
        <div className="mt-3 bg-white border border-slate-200 rounded-lg p-3.5 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center mb-0.5">
                <InfoTooltip content="Ringkasan kesiapan tiap modul analisis berdasarkan evidence yang sudah tersedia saat ini.">
                  KESIAPAN ANALISIS
                </InfoTooltip>
              </h4>
              <p className="text-[10px] text-slate-400 font-medium">Berdasarkan evidence saat ini</p>
            </div>
            <div className="text-[11px] font-semibold text-slate-600 bg-slate-50 px-2.5 py-1 rounded border border-slate-100 shadow-sm transition-all duration-300">
              {summaryLine || "Belum dievaluasi"}
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(analysisStatus).map(([analysis, status]) => {
              let localizedAnalysis = analysis;
              if (analysis === "Fact & Chronology") localizedAnalysis = "Fakta & Kronologi";
              else if (analysis === "Fact") localizedAnalysis = "Fakta";
              else if (analysis === "Actor") localizedAnalysis = "Aktor";
              else if (analysis === "Chronology") localizedAnalysis = "Kronologi";

              let analysisTooltip = "";
              if (analysis === "Fact & Chronology") analysisTooltip = "Modul ini menyusun fakta kejadian dan urutan waktunya berdasarkan bukti lapangan dan sumber pendukung.";
              else if (analysis === "Fact") analysisTooltip = "Modul ini membantu menyusun fakta-fakta utama yang relevan dengan kejadian.";
              else if (analysis === "Actor") analysisTooltip = "Modul ini membantu mengenali pihak yang terlibat, peran, dan hubungan antarorang dalam kejadian.";
              else if (analysis === "PEEPO") analysisTooltip = "Modul ini membantu analisis dari sisi People, Environment, Equipment, Process, dan Organization.";
              else if (analysis === "IPLS") analysisTooltip = "Modul ini membantu analisis lapisan pengendalian dan titik kelemahan dalam sistem kerja.";
              else if (analysis === "Chronology") analysisTooltip = "Modul ini fokus pada urutan kejadian dari awal sampai akhir berdasarkan evidence yang tersedia.";

              let localizedStatus = "";
              if (status === "Ready") localizedStatus = "Siap";
              else if (status === "Limited Evidence") localizedStatus = "Terbatas";
              else if (status === "Insufficient Evidence") localizedStatus = "Belum Cukup";
              else if (status === "Needs Verification") localizedStatus = "Perlu Verifikasi";

              let statusTooltip = "";
              if (status === "Ready") statusTooltip = "Evidence untuk modul ini sudah cukup mendukung analisis.";
              else if (status === "Limited Evidence") statusTooltip = "Modul ini bisa berjalan, tetapi evidence yang tersedia masih terbatas.";
              else if (status === "Insufficient Evidence") statusTooltip = "Evidence untuk modul ini belum cukup untuk menghasilkan analisis yang kuat.";
              else if (status === "Needs Verification") statusTooltip = "Masih ada evidence yang menunggu konfirmasi pengguna.";

              return (
                <div key={analysis} className="flex flex-col bg-slate-50/50 border border-slate-200 px-2 py-1.5 rounded-md hover:border-slate-300 transition-colors group cursor-default">
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-[10px] font-bold text-slate-700 truncate">{localizedAnalysis}</span>
                    <InfoTooltip content={analysisTooltip} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <TooltipProvider delayDuration={150}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className={cn(
                          "text-[9px] font-bold uppercase w-fit outline-none transition-colors",
                          status === "Ready" ? "text-emerald-600" :
                          status === "Insufficient Evidence" ? "text-rose-600" :
                          "text-amber-600"
                        )}>{localizedStatus}</span>
                      </TooltipTrigger>
                      <TooltipContent side="top" sideOffset={6} className="max-w-[280px] bg-slate-900 text-slate-50 border-slate-800 shadow-md p-3 rounded-lg z-[120]">
                        <p className="text-[12px] font-medium leading-relaxed">{statusTooltip}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // ----------------------------------------------------------------------
  // TWO-COLUMN LAYOUT
  // ----------------------------------------------------------------------
  const renderChecklist = () => {
    if (!activeRun) return null;
    return (
      <div className="w-[50%] border-r border-slate-200 flex flex-col bg-white overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
          <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center">
            <InfoTooltip content="Daftar kategori evidence yang dibutuhkan sistem untuk menilai kesiapan analisis secara semantik, bukan sekadar jumlah file.">
              SEMANTIC EVIDENCE REQUIREMENTS
            </InfoTooltip>
          </h4>
          <span className="text-[11px] text-slate-400 font-medium">{activeRun.categories?.length || 0} categories</span>
        </div>
        
        <div className="flex-1 overflow-auto p-4 space-y-4">
          {activeRun.categories?.map(category => {
            const isExpanded = expandedCategories[category.name];
            const items = activeRun.results.filter(r => r.category === category.name);
            const toggleCategory = () => setExpandedCategories(prev => ({ ...prev, [category.name]: !isExpanded }));
            
            let catTooltip = "";
            const catNameLower = category.name.toLowerCase();
            if (catNameLower.includes("event truth")) catTooltip = "Evidence yang membantu memastikan apa yang terjadi, kapan terjadi, dan di mana kejadian berlangsung.";
            else if (catNameLower.includes("human testimony")) catTooltip = "Evidence berupa keterangan manusia, seperti wawancara, BAP, audio, atau transkrip.";
            else if (catNameLower.includes("people")) catTooltip = "Evidence yang menjelaskan siapa saja yang terlibat, peran mereka, dan konteks personel yang relevan.";
            else if (catNameLower.includes("part") || catNameLower.includes("technical")) catTooltip = "Evidence teknis terkait alat, komponen, kondisi peralatan, inspeksi, atau riwayat perawatan.";
            else if (catNameLower.includes("position")) catTooltip = "Evidence yang menunjukkan posisi, tata letak, hubungan ruang, atau lokasi kejadian secara visual.";
            else if (catNameLower.includes("paper") || catNameLower.includes("control")) catTooltip = "Evidence berupa dokumen pengendalian kerja, seperti SOP, IK, JSA, HIRA, permit, atau dokumen kerja lain.";

            let catStatusTooltip = "";
            if (category.status === "READY") catStatusTooltip = "Kategori ini sudah memiliki evidence yang cukup untuk mendukung analisis terkait.";
            else if (category.status === "NEEDS_ATTENTION") catStatusTooltip = "Ada evidence pada kategori ini, tetapi ada masalah yang perlu dicek atau diperbaiki.";
            else if (category.status === "NOT_READY") catStatusTooltip = "Kategori ini belum memiliki evidence yang cukup dan masih memerlukan pelengkapan.";

            return (
              <div key={category.name} className="flex flex-col border border-slate-200 rounded-lg overflow-hidden transition-all bg-white shadow-sm">
                {/* Category Header */}
                <div 
                  className="flex items-center justify-between p-3.5 bg-slate-50/80 hover:bg-slate-100/50 cursor-pointer transition-colors"
                  onClick={toggleCategory}
                >
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <h5 className="text-[12px] font-bold text-slate-800 uppercase tracking-widest flex items-center">
                        <InfoTooltip content={catTooltip}>
                          {getCategoryDisplayName(category.name)}
                        </InfoTooltip>
                      </h5>
                      <span className="text-[11px] text-slate-500 font-medium bg-white px-2 py-0.5 rounded border border-slate-200 shadow-sm">{category.fulfilledCount}/{category.totalCount} siap</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Impact:</span>
                      <div className="flex flex-wrap gap-1">
                        {category.downstreamImpact.map(imp => {
                          let impTooltip = `Evidence pada kategori ini digunakan untuk membantu analisis ${imp}.`;
                          if (imp === "Fact & Chronology") impTooltip = "Evidence pada kategori ini digunakan untuk membantu penyusunan fakta dan kronologi kejadian.";
                          else if (imp === "PEEPO") impTooltip = "Evidence pada kategori ini akan dipakai dalam analisis PEEPO.";
                          else if (imp === "IPLS") impTooltip = "Evidence pada kategori ini akan dipakai dalam analisis IPLS.";
                          
                          return (
                            <TooltipProvider delayDuration={150} key={imp}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-sm bg-blue-50 text-blue-700 border border-blue-100 cursor-help outline-none">
                                    {imp}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent side="top" sideOffset={6} className="max-w-[280px] bg-slate-900 text-slate-50 border-slate-800 shadow-md p-3 rounded-lg z-[120]">
                                  <p className="text-[12px] font-medium leading-relaxed">{impTooltip}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      "text-[10px] font-bold uppercase px-2 py-1 rounded-md border",
                      category.status === "READY" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                      category.status === "NEEDS_ATTENTION" ? "bg-amber-50 text-amber-700 border-amber-200" :
                      "bg-rose-50 text-rose-700 border-rose-200"
                    )}>
                      {category.status === "READY" ? "SIAP" : category.status === "NEEDS_ATTENTION" ? "PERLU PERHATIAN" : "BELUM SIAP"}
                    </span>
                    <ChevronRight className={cn("h-4 w-4 text-slate-400 transition-transform", isExpanded ? "rotate-90" : "")} />
                  </div>
                </div>

                {/* Items */}
                <div className={cn("flex-col divide-y divide-slate-100 border-t border-slate-100", isExpanded ? "flex" : "hidden")}>
                  {items.length === 0 && (
                     <div className="p-4 text-[12px] text-slate-500 text-center">
                       Belum ada evidence untuk kategori ini.
                     </div>
                  )}
                  {items.map(req => {
                    const isActive = req.id === activeReqId;
                    return (
                      <div 
                        key={req.id}
                        onClick={() => setActiveReqId(req.id)}
                        className={cn(
                          "relative flex items-center gap-3 p-3 cursor-pointer transition-colors group",
                          isActive ? "bg-blue-50/30" : "bg-white hover:bg-slate-50/50"
                        )}
                      >
                        <div className={cn("absolute left-0 top-0 bottom-0 w-[3px]", isActive ? getIndicatorColor(req.status) : "bg-transparent group-hover:bg-slate-200")} />
                        
                        <div className="flex-1 min-w-0 pl-2">
                          <div className={cn("text-[13px] font-bold truncate mb-1 transition-colors", isActive ? "text-blue-900" : "text-slate-700 group-hover:text-slate-900")}>
                            {req.label}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-slate-500 truncate">
                              {req.matchedFiles.length > 0 ? req.matchedFiles.map(f => f.name).join(", ") : "Belum ada file"}
                            </span>
                          </div>
                        </div>
                        
                        <div className="shrink-0">
                          <span className={cn("text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-md border", getStatusColor(req.status))}>
                            {translateStatus(req.status)}
                          </span>
                        </div>
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

  const renderDetail = () => {
    if (!activeRequirement) return (
      <div className="w-[50%] flex items-center justify-center bg-slate-50/50">
        <span className="text-[13px] text-slate-400 font-medium">Pilih requirement untuk melihat detail</span>
      </div>
    );

    const req = activeRequirement;

    return (
      <div className="w-[50%] flex flex-col bg-[#f8fafc] overflow-hidden">
        <div className="px-8 py-5 border-b border-slate-200 bg-white shrink-0">
          <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">
            {getCategoryDisplayName(req.category)}
          </h4>
          <h2 className="text-[16px] font-bold text-slate-900 uppercase tracking-wide mb-3 leading-snug">
            {req.label}
          </h2>
          <div className="flex items-center gap-2">
            <TooltipProvider delayDuration={150}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className={cn("text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md border cursor-help outline-none", getStatusColor(req.status))}>
                    {translateStatus(req.status)}
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top" sideOffset={6} className="max-w-[280px] bg-slate-900 text-slate-50 border-slate-800 shadow-md p-3 rounded-lg z-[120]">
                  <p className="text-[12px] font-medium leading-relaxed">
                    {req.status === "FULFILLED" ? "Evidence sudah tersedia dan berhasil dibaca atau dipakai sistem." : 
                     req.status === "MISSING" ? "Sistem belum menemukan evidence yang sesuai untuk kebutuhan ini." : 
                     req.status === "BROKEN" ? "Evidence tersedia, tetapi belum bisa digunakan karena ada kendala seperti file rusak, gagal diproses, atau isi tidak terbaca." : 
                     req.status === "NEEDS_VERIFICATION" ? "Sistem mendeteksi evidence yang mungkin sesuai, tetapi masih butuh konfirmasi pengguna." : ""}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-8 space-y-8">
          
          <div className="space-y-2">
            <h5 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center">
              <InfoTooltip content="Menjelaskan jenis evidence yang dicari sistem untuk memenuhi kebutuhan ini.">
                EVIDENCE YANG DIBUTUHKAN
              </InfoTooltip>
            </h5>
            <div className="text-[13px] text-slate-700 leading-relaxed bg-white border border-slate-200 p-4 rounded-lg shadow-sm">
              {req.requiredDesc || "Standard requirement description."}
            </div>
          </div>

          <div className="space-y-2">
            <h5 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center">
              <InfoTooltip content="Menampilkan file atau dokumen yang berhasil ditemukan dan dikaitkan ke kebutuhan evidence ini.">
                EVIDENCE YANG DITEMUKAN
              </InfoTooltip>
            </h5>
            {req.matchedFiles.length > 0 ? (
              <div className="flex flex-col gap-2">
                {req.matchedFiles.map(mf => (
                  <div key={mf.id} className="flex flex-col gap-3 bg-white border border-slate-200 p-4 rounded-lg shadow-sm">
                    <div className="flex items-start gap-3">
                      <FileText className="h-4 w-4 text-slate-400 mt-0.5" />
                      <div className="flex flex-col">
                        <span className="text-[13px] font-semibold text-slate-800">{mf.name}</span>
                        <span className="text-[11px] text-slate-500">
                          Status: <span className="font-bold">{mf.processingStatus === "DONE" ? "Success" : mf.processingStatus === "ERROR" ? "Processing Error" : "Unknown State"}</span>
                        </span>
                      </div>
                    </div>
                    {req.status === "NEEDS_VERIFICATION" && mf.aiMatchCategory && (
                      <div className="mt-2 pt-3 border-t border-slate-100 flex flex-col gap-3">
                        <div className="flex flex-col">
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">AI MENDETEKSI</span>
                          <span className="text-[12px] text-slate-700 font-medium">Possible category: <span className="font-bold">{mf.aiMatchCategory}</span></span>
                          <span className="text-[11px] text-slate-400">Confidence: {mf.aiMatchConfidence || "Medium"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 text-[11px] font-semibold bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:text-emerald-800"
                            onClick={() => confirmVerification(req.id, true)}
                          >
                            Konfirmasi Evidence
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 text-[11px] font-semibold text-slate-600 hover:text-rose-600"
                            onClick={() => confirmVerification(req.id, false)}
                          >
                            Bukan Evidence Ini
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-[13px] text-slate-600 bg-white border border-slate-200 p-4 rounded-lg shadow-sm">
                Belum ada file yang dipetakan ke requirement ini.
              </div>
            )}
          </div>

          {req.issue && req.status !== "NEEDS_VERIFICATION" && (
             <div className="space-y-2">
               <h5 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center">
                 <InfoTooltip content="Menjelaskan hasil pengecekan sistem terhadap evidence yang ditemukan.">
                   HASIL PEMERIKSAAN
                 </InfoTooltip>
               </h5>
               <div className="text-[13px] text-slate-700 leading-relaxed bg-white border border-slate-200 p-4 rounded-lg shadow-sm">
                 {req.issue}
               </div>
             </div>
          )}

          <div className="space-y-2">
            <h5 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center">
              <InfoTooltip content="Menjelaskan modul analisis mana yang terpengaruh oleh kondisi evidence ini.">
                DAMPAK KE ANALISIS
              </InfoTooltip>
            </h5>
            <div className="text-[13px] text-slate-700 leading-relaxed bg-white border border-slate-200 p-4 rounded-lg shadow-sm border-l-2 border-l-blue-400 flex flex-col gap-3">
              <div className="flex flex-wrap gap-1.5">
                {req.downstreamImpact.map(imp => {
                  let impTooltip = `Evidence pada kategori ini digunakan untuk membantu analisis ${imp}.`;
                  if (imp === "Fact & Chronology") impTooltip = "Evidence pada kategori ini digunakan untuk membantu penyusunan fakta dan kronologi kejadian.";
                  else if (imp === "PEEPO") impTooltip = "Evidence pada kategori ini akan dipakai dalam analisis PEEPO.";
                  else if (imp === "IPLS") impTooltip = "Evidence pada kategori ini akan dipakai dalam analisis IPLS.";

                  return (
                    <TooltipProvider delayDuration={150} key={imp}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-sm bg-blue-50 text-blue-700 border border-blue-100 cursor-help outline-none">
                            {imp}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="top" sideOffset={6} className="max-w-[280px] bg-slate-900 text-slate-50 border-slate-800 shadow-md p-3 rounded-lg z-[120]">
                          <p className="text-[12px] font-medium leading-relaxed">{impTooltip}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                })}
              </div>
              {req.impact && (
                <span className="text-[12px]">{req.impact}</span>
              )}
            </div>
          </div>

        </div>
      </div>
    );
  };

  // ----------------------------------------------------------------------
  // HISTORY LIST VIEW
  // ----------------------------------------------------------------------
  const renderHistory = () => (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="px-8 py-5 border-b border-slate-200 bg-white shrink-0 flex flex-col gap-2 shadow-sm z-10">
        <Button variant="ghost" size="sm" className="w-fit -ml-2 h-7 text-[11px] font-bold text-slate-500 hover:text-slate-900" onClick={() => setView("RESULT")}>
          <ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Kembali ke Hasil Terbaru
        </Button>
        <div>
          <h2 className="text-[16px] font-bold text-slate-900 uppercase tracking-wide">RIWAYAT PEMERIKSAAN</h2>
          <span className="text-[12px] text-slate-500">{runs.length} pemeriksaan</span>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-8 space-y-4">
        {runs.map(run => {
          const fulfilled = run.results.filter(c => c.status === "FULFILLED").length;
          const broken = run.results.filter(c => c.status === "BROKEN").length;
          const missing = run.results.filter(c => c.status === "MISSING").length;
          const needsVerif = run.results.filter(c => c.status === "NEEDS_VERIFICATION").length;
          
          const isNotReady = run.status === "NOT_READY";
          const isNeedsAttention = run.status === "NEEDS_ATTENTION";

          return (
            <div key={run.id} className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <div>
                  <h4 className="text-[12px] font-bold text-slate-800 uppercase tracking-widest mb-1">Pemeriksaan #{run.runNumber}</h4>
                  <div className={cn("text-[13px] font-bold uppercase", isNotReady ? "text-rose-700" : isNeedsAttention ? "text-amber-700" : "text-emerald-700")}>
                    {isNotReady ? "BELUM SIAP" : isNeedsAttention ? "PERLU DILENGKAPI" : "SIAP DIANALISIS"}
                  </div>
                </div>
                <div className="text-[12px] text-slate-600 font-medium">
                  {fulfilled} / {run.results.length} terpenuhi<br/>
                  {broken} bermasalah<br/>
                  {missing} belum ada<br/>
                  {needsVerif} perlu verifikasi
                </div>
              </div>
              
              <div className="flex flex-col items-start sm:items-end gap-3 justify-between">
                <div className="text-left sm:text-right text-[11px] text-slate-500 font-medium">
                  <div>{run.triggeredByUser.name} · {run.triggeredByUser.role}</div>
                  <div>
                    {new Date(run.completedAt || run.startedAt).toLocaleString("id-ID", {
                      day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
                    })} WIB
                  </div>
                </div>
                {run.status !== "CHECKING" && (
                  <Button variant="outline" size="sm" className="h-8 text-[11px] font-semibold shadow-sm" onClick={() => { setSelectedRun(run); setView("ARCHIVE"); }}>
                    Lihat Snapshot
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ----------------------------------------------------------------------
  // MAIN DRAWER RENDER
  // ----------------------------------------------------------------------
  return (
    <>
      {/* Backdrop */}
      <div 
        className={cn(
          "fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-[2px] transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        )} 
        onClick={handleClose}
      />
      
      {/* Drawer */}
      <div 
        className={cn(
          "fixed top-0 bottom-0 right-0 z-[101] w-[60vw] min-w-[760px] max-w-[980px] bg-white border-l border-slate-200 shadow-2xl flex flex-col transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header (Hidden in Override & History) */}
        {(view === "RESULT" || view === "ARCHIVE") && (
          <div className="px-8 py-5 border-b border-slate-200 flex items-start justify-between shrink-0 bg-white">
            <div className="flex items-center gap-4">
              <ShieldCheck className="h-6 w-6 text-slate-800" />
              <div className="flex flex-col">
                <h3 className="text-[15px] font-bold text-slate-900 uppercase tracking-wide leading-none">
                  EVIDENCE GOLDEN GATE
                </h3>
                <span className="text-[12px] font-medium text-slate-500 mt-1">Pemeriksaan Kesiapan Analisis</span>
              </div>
            </div>
            <div className="flex items-center gap-5 mt-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
                {view === "ARCHIVE" ? `Arsip #${selectedRun?.runNumber}` : 
                 latestRun?.status === "CHECKING" ? "MEMERIKSA" : 
                 latestRun ? `Pemeriksaan #${latestRun.runNumber}` : "BELUM DIPERIKSA"}
              </span>
              
              {runs.length > 0 && latestRun?.status !== "CHECKING" ? (
                <button 
                  className="text-[12px] font-bold text-slate-500 hover:text-slate-900 uppercase tracking-widest transition-colors"
                  onClick={() => setView("HISTORY")}
                >
                  Riwayat
                </button>
              ) : (
                <div className="relative group flex items-center">
                   <button 
                     disabled
                     className="text-[12px] font-bold text-slate-300 uppercase tracking-widest cursor-not-allowed"
                   >
                     Riwayat
                   </button>
                   <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 hidden group-hover:block w-max bg-slate-800 text-white text-[11px] px-2.5 py-1.5 rounded shadow-md z-50 pointer-events-none">
                     Riwayat tersedia setelah pemeriksaan pertama.
                   </div>
                </div>
              )}
              
              <div className="w-px h-5 bg-slate-200 mx-2" />
              
              <button className="text-slate-400 hover:text-slate-800" onClick={handleClose}>
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-hidden flex flex-col relative bg-white">
          {latestRun?.status === "CHECKING" ? (
             <div className="flex-1 flex flex-col bg-white overflow-y-auto overflow-x-hidden relative">
               <div className="p-10 mx-auto w-full max-w-[560px] flex flex-col items-center">
                 <div className="w-full flex flex-col items-center text-center mt-6">
                   <div className="h-10 w-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center mb-4 relative">
                     <ShieldCheck className="h-5 w-5 text-slate-700 relative z-10" />
                     <div className="absolute inset-0 rounded-xl border-2 border-slate-900/10 animate-ping opacity-20" />
                   </div>
                   <h2 className="text-[19px] font-bold text-slate-900 tracking-tight mb-2">Memeriksa kesiapan evidence</h2>
                   <p className="text-[14px] text-slate-500 max-w-[420px] mb-6 leading-relaxed">
                     Evidence sedang dipetakan ke kebutuhan investigasi.
                   </p>
                   <Button 
                     disabled
                     className="w-[200px] h-10 text-[13px] font-semibold bg-slate-900 text-white shadow-sm"
                   >
                     <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Memeriksa...
                   </Button>
                 </div>

                 <div className="space-y-4 mb-16 mt-12 px-2 w-full max-w-[320px]">
                   <div className="flex items-center gap-4">
                     <div className={cn("flex items-center justify-center h-5 w-5 rounded-full transition-colors duration-200 shrink-0", checkSequence >= 1 ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400")}>
                       {checkSequence >= 1 ? <Check className="h-3 w-3" /> : <Loader2 className="h-3 w-3 animate-spin" />}
                     </div>
                     <span className={cn("text-[13px] font-medium transition-colors duration-200", checkSequence >= 1 ? "text-slate-800" : "text-slate-500")}>
                       Membaca evidence tersedia
                     </span>
                   </div>
                   <div className="flex items-center gap-4">
                     <div className={cn("flex items-center justify-center h-5 w-5 rounded-full transition-colors duration-200 shrink-0", checkSequence >= 2 ? "bg-emerald-100 text-emerald-600" : checkSequence === 1 ? "bg-slate-100 text-slate-400" : "bg-transparent")}>
                       {checkSequence >= 2 ? <Check className="h-3 w-3" /> : checkSequence === 1 ? <Loader2 className="h-3 w-3 animate-spin" /> : <div className="h-1.5 w-1.5 rounded-full border border-slate-300" />}
                     </div>
                     <span className={cn("text-[13px] font-medium transition-colors duration-200", checkSequence >= 2 ? "text-slate-800" : checkSequence === 1 ? "text-slate-600" : "text-slate-400")}>
                       Memetakan evidence ke requirement
                     </span>
                   </div>
                   <div className="flex items-center gap-4">
                     <div className={cn("flex items-center justify-center h-5 w-5 rounded-full transition-colors duration-200 shrink-0", checkSequence >= 3 ? "bg-emerald-100 text-emerald-600" : checkSequence === 2 ? "bg-slate-100 text-slate-400" : "bg-transparent")}>
                       {checkSequence >= 3 ? <Check className="h-3 w-3" /> : checkSequence === 2 ? <Loader2 className="h-3 w-3 animate-spin" /> : <div className="h-1.5 w-1.5 rounded-full border border-slate-300" />}
                     </div>
                     <span className={cn("text-[13px] font-medium transition-colors duration-200", checkSequence >= 3 ? "text-slate-800" : checkSequence === 2 ? "text-slate-600" : "text-slate-400")}>
                       Memeriksa kelengkapan dan kualitas
                     </span>
                   </div>
                 </div>

                 {/* Skeletons */}
                 <div className="w-full space-y-3 pt-8 border-t border-slate-100 opacity-60">
                   <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">STANDARD EVIDENCE REQUIREMENTS</h4>
                   {[1, 2, 3, 4].map(i => (
                     <div key={i} className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-lg shadow-sm">
                       <div className="h-full w-[3px] bg-slate-200 rounded-r-md absolute left-0 top-2 bottom-2" />
                       <div className="h-8 w-full animate-pulse bg-slate-100/80 rounded-md" />
                     </div>
                   ))}
                 </div>
               </div>
             </div>
          ) : view === "CONFIRM_OVERRIDE" && latestRun ? (
             <div className="flex-1 flex flex-col bg-white h-full animate-in fade-in duration-300">
                {/* Header */}
                <div className="px-12 pt-12 pb-8 flex flex-col">
                  <h2 className="text-[16px] font-bold text-slate-900 uppercase tracking-widest">KONFIRMASI ANALYSIS</h2>
                  <p className="text-[13px] text-slate-500 mt-1">Evidence Golden Gate</p>
                </div>
                
                <div className="flex-1 overflow-auto px-12 pb-12 custom-scrollbar">
                  {/* Red Warning Box */}
                  <div className="bg-[#FFF5F6] rounded-xl p-6 mb-12">
                     {latestRun.results.filter(r => r.level === "REQUIRED" && r.status === "MISSING").length > 0 && (
                       <div className="text-[13px] font-semibold text-rose-600">
                         {latestRun.results.filter(r => r.level === "REQUIRED" && r.status === "MISSING").length} requirement wajib belum terpenuhi
                       </div>
                     )}
                     {latestRun.results.filter(r => r.level === "REQUIRED" && r.status === "BROKEN").length > 0 && (
                       <div className="text-[13px] font-semibold text-rose-600 mt-1.5">
                         {latestRun.results.filter(r => r.level === "REQUIRED" && r.status === "BROKEN").length} requirement wajib bermasalah
                       </div>
                     )}
                  </div>

                  {/* Detail Blocker */}
                  <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-6">DETAIL BLOCKER</h3>
                  <ul className="list-disc pl-5 space-y-4 mb-14 text-[13px] marker:text-slate-300">
                    {latestRun.results.filter(r => r.level === "REQUIRED" && r.status !== "FULFILLED").map(req => (
                      <li key={req.id} className="text-slate-400 pl-1 leading-relaxed">
                        <span className="font-bold text-slate-800">{req.label}</span> <span className="text-slate-400">— {req.issue || (req.status === "MISSING" ? "Belum ada file yang dipetakan ke requirement ini." : "bermasalah")}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Checkbox */}
                  <label className="flex items-start gap-3.5 cursor-pointer group mb-12">
                    <Checkbox 
                      checked={overrideAck} 
                      onCheckedChange={(c) => setOverrideAck(c === true)} 
                      className="mt-0.5 border-slate-200 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                    />
                    <span className="text-[13px] text-slate-700 leading-relaxed font-medium">
                      Saya memahami bahwa Analysis akan menggunakan evidence yang belum memenuhi requirement standar.
                    </span>
                  </label>

                  {/* Textarea */}
                  <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4">CATATAN ALASAN MELANJUTKAN (OPSIONAL)</h3>
                  <Textarea 
                    value={overrideNote}
                    onChange={(e) => setOverrideNote(e.target.value)}
                    className="w-full h-32 bg-white border-slate-200 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-emerald-400 resize-none rounded-lg text-[13px] p-4 placeholder:text-slate-400 shadow-sm"
                    placeholder="Tambahkan catatan jika diperlukan..."
                  />
                </div>

                {/* Footer */}
                <div className="px-12 py-6 bg-white flex items-center justify-between mt-auto shrink-0 border-t-0">
                  <Button variant="ghost" className="text-[13px] font-semibold text-slate-500 px-0 hover:bg-transparent hover:text-slate-800" onClick={() => setView("RESULT")}>
                    Kembali ke Pemeriksaan
                  </Button>
                  <Button 
                    className="px-8 h-10 text-[13px] font-semibold bg-slate-400 text-white hover:bg-slate-500 rounded-md shadow-sm transition-all"
                    disabled={!overrideAck}
                    onClick={() => {
                      overrideAnalysis(overrideNote, overrideAck);
                      onProceedToAnalysis();
                      onOpenChange(false);
                      setView("RESULT");
                    }}
                  >
                    Tetap Lanjutkan
                  </Button>
                </div>
             </div>
          ) : view === "HISTORY" ? (
             renderHistory()
          ) : !activeRun ? (
            !hasEvidence ? (
              <div className="flex-1 flex flex-col items-center justify-center bg-slate-50/50 p-8 text-center">
                <div className="h-16 w-16 bg-white border border-slate-200 rounded-2xl flex items-center justify-center shadow-sm mb-5">
                  <FileText className="h-8 w-8 text-slate-300" />
                </div>
                <h3 className="text-[18px] font-bold text-slate-900 tracking-tight mb-2">Belum ada evidence untuk diperiksa</h3>
                <p className="text-[14px] text-slate-500 max-w-sm leading-relaxed mb-8">
                  Tambahkan evidence kasus terlebih dahulu agar sistem dapat memeriksa kesiapan analisis.
                </p>
                <div className="flex items-center gap-3">
                  <Button variant="ghost" onClick={handleClose} className="text-slate-500">Tutup</Button>
                  <Button 
                    className="px-8 h-10 text-[13px] font-semibold bg-slate-900 text-white hover:bg-slate-800 shadow-sm"
                    onClick={() => {
                      handleClose(); 
                    }}
                  >
                    Tambah Evidence
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col bg-white overflow-y-auto">
                <div className="p-8 pb-12 flex flex-col items-center">
                  
                  {/* MAIN INTRO AREA */}
                  <div className="w-full max-w-[600px] pt-8 flex flex-col items-center text-center">
                    <div className="h-11 w-11 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center mb-4">
                      <ShieldCheck className="h-5 w-5 text-slate-700" />
                    </div>
                    <h2 className="text-[19px] font-bold text-slate-900 tracking-tight mb-2">Periksa kesiapan evidence</h2>
                    <p className="text-[14px] text-slate-500 max-w-[460px] mb-6 leading-relaxed">
                      Sistem akan memetakan evidence yang tersedia ke kebutuhan investigasi dan menunjukkan data yang masih perlu dilengkapi.
                    </p>
                    <Button 
                      className="w-[200px] h-10 text-[13px] font-semibold bg-slate-900 text-white hover:bg-slate-800 shadow-sm transition-all active:scale-[0.98]"
                      onClick={handleRecheck}
                    >
                      Periksa Kesiapan
                    </Button>
                    <p className="text-[12px] text-slate-400 mt-3 font-medium">
                      File evidence tidak akan diubah.
                    </p>
                  </div>

                  <div className="w-full max-w-[600px] h-px bg-slate-100 my-10" />

                  {/* YANG AKAN DIPERIKSA */}
                  <div className="w-full max-w-[600px] space-y-4">
                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center mb-4">YANG AKAN DIPERIKSA</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex items-start gap-3 bg-white p-3 rounded-lg border border-slate-200/60 transition-colors hover:bg-slate-50/50">
                        <div className="p-2 bg-slate-50 rounded border border-slate-100 shrink-0"><Camera className="h-4 w-4 text-slate-500"/></div>
                        <div className="pt-0.5">
                          <div className="text-[13px] font-bold text-slate-800 mb-0.5">Bukti Lapangan</div>
                          <div className="text-[12px] text-slate-500 leading-snug">Video kejadian dan foto pengamatan</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 bg-white p-3 rounded-lg border border-slate-200/60 transition-colors hover:bg-slate-50/50">
                        <div className="p-2 bg-slate-50 rounded border border-slate-100 shrink-0"><FileText className="h-4 w-4 text-slate-500"/></div>
                        <div className="pt-0.5">
                          <div className="text-[13px] font-bold text-slate-800 mb-0.5">Dokumen Formal</div>
                          <div className="text-[12px] text-slate-500 leading-snug">BAP, laporan awal, dan dokumen investigasi</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 bg-white p-3 rounded-lg border border-slate-200/60 transition-colors hover:bg-slate-50/50">
                        <div className="p-2 bg-slate-50 rounded border border-slate-100 shrink-0"><Mic className="h-4 w-4 text-slate-500"/></div>
                        <div className="pt-0.5">
                          <div className="text-[13px] font-bold text-slate-800 mb-0.5">Wawancara & Komunikasi</div>
                          <div className="text-[12px] text-slate-500 leading-snug">Rekaman operator, saksi, dan pihak terkait</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 bg-white p-3 rounded-lg border border-slate-200/60 transition-colors hover:bg-slate-50/50">
                        <div className="p-2 bg-slate-50 rounded border border-slate-100 shrink-0"><Paperclip className="h-4 w-4 text-slate-500"/></div>
                        <div className="pt-0.5">
                          <div className="text-[13px] font-bold text-slate-800 mb-0.5">Evidence Pendukung</div>
                          <div className="text-[12px] text-slate-500 leading-snug">File tambahan yang relevan dengan analisis</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="w-full max-w-[600px] h-px bg-slate-100 my-10" />

                  {/* PROSES PEMERIKSAAN */}
                  <div className="w-full max-w-[600px] mb-4">
                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center mb-5">PROSES PEMERIKSAAN</h4>
                    <div className="flex items-center justify-center text-[12px] font-medium text-slate-500 px-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">01</span>
                        <span>Pemetaan Evidence</span>
                      </div>
                      <ArrowRight className="h-3 w-3 text-slate-300 mx-3 shrink-0" />
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">02</span>
                        <span>Pemeriksaan Requirement</span>
                      </div>
                      <ArrowRight className="h-3 w-3 text-slate-300 mx-3 shrink-0" />
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">03</span>
                        <span>Kesiapan Analisis</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          ) : (
            <div className="flex flex-col h-full">
              {renderSummary()}
              <div className="flex-1 flex overflow-hidden">
                {renderChecklist()}
                {renderDetail()}
              </div>
            </div>
          )}
        </div>

        {/* Sticky Footer */}
        {latestRun?.status !== "CHECKING" && view !== "CONFIRM_OVERRIDE" && (
          <div className="px-8 py-5 border-t border-slate-200 bg-white shrink-0 flex items-center justify-between shadow-[0_-4px_10px_-4px_rgba(0,0,0,0.05)] z-20 relative">
            {view === "HISTORY" ? (
              <Button variant="ghost" className="text-[13px] font-semibold text-slate-600" onClick={() => setView("RESULT")}>
                Kembali
              </Button>
            ) : !activeRun ? (
              hasEvidence && (
                <>
                  <Button variant="ghost" className="text-[13px] font-semibold text-slate-600" onClick={handleClose}>
                    Tutup
                  </Button>
                  <Button 
                    variant="outline"
                    className="px-8 text-[13px] font-semibold text-slate-700 border-slate-300 transition-all active:scale-[0.98]"
                    onClick={handleRecheck}
                  >
                    Periksa Kesiapan
                  </Button>
                </>
              )
            ) : (
              <>
                <Button variant="ghost" className="text-[13px] font-semibold text-slate-600" onClick={handleClose}>
                  Tutup
                </Button>
                <div className="flex items-center gap-3">
                  <Button variant="outline" className="text-[13px] font-semibold text-slate-700 border-slate-300" onClick={() => setShowRecheckModal(true)}>
                    Periksa Ulang
                  </Button>
                  <Button 
                    className="px-8 text-[13px] font-semibold bg-slate-900 text-white hover:bg-slate-800"
                    onClick={() => {
                      const isNotReady = activeRun?.status === "NOT_READY";
                      if (isNotReady && view !== "ARCHIVE") {
                        setView("CONFIRM_OVERRIDE");
                      } else {
                        onProceedToAnalysis();
                        onOpenChange(false);
                      }
                    }}
                  >
                    Lanjutkan ke Analysis
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

      </div>

      

      {/* Recheck Modal */}
      {showRecheckModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-[2px]">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-[400px] overflow-hidden flex flex-col m-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-5 flex items-start gap-4">
              <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                <RotateCcw className="h-5 w-5 text-slate-700" />
              </div>
              <div className="flex flex-col pt-1">
                <h3 className="text-[15px] font-bold text-slate-900">Periksa ulang evidence?</h3>
                <p className="text-[13px] text-slate-500 mt-1 leading-relaxed">
                  Evidence terbaru akan diperiksa kembali. Hasil sebelumnya tetap tersedia di Riwayat.
                </p>
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 flex items-center justify-end gap-3 border-t border-slate-100">
              <Button variant="ghost" className="text-[13px] font-semibold text-slate-600" onClick={() => setShowRecheckModal(false)}>
                Batal
              </Button>
              <Button 
                className="px-6 text-[13px] font-semibold bg-slate-900 text-white hover:bg-slate-800"
                onClick={() => {
                  setShowRecheckModal(false);
                  handleRecheck();
                }}
              >
                Periksa Ulang
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
