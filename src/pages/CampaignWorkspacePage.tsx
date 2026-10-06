import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { useCase } from "@/hooks/useCases";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Megaphone, Sparkles, Clock, CheckCircle2, XCircle, ChevronDown, ChevronRight, History, BarChart3, Info, ExternalLink, Play, Database, Brain, Send, Bot, FileText, Search, Trash2, Edit3, User, Link2, Sparkle } from "lucide-react";
import { SafetyAlertPoster } from "@/components/workspace/SafetyAlertPoster";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
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
  const [showActivityLog, setShowActivityLog] = useState(true);
  const [showMetadata, setShowMetadata] = useState(true);
  const [showDataAnalisis, setShowDataAnalisis] = useState(true);

  // Modal State
  const [selectedAnalysis, setSelectedAnalysis] = useState<string | null>(null);
  const [showRevisionHistory, setShowRevisionHistory] = useState(false);

  // Status & Activity Log
    const [isLeftPanelExpanded, setIsLeftPanelExpanded] = useState(true);
  const [isRightPanelExpanded, setIsRightPanelExpanded] = useState(false);
const [status, setStatus] = useState(isCreatingParam ? "Proses AI" : "Created");

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
  
  const activityLogs = [
    { id: 1, action: "Campaign Created", user: "Gulang Satriya", time: "Hari ini, 09:00 WITA", icon: <Megaphone className="h-4 w-4 text-blue-500" /> },
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
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shadow-none z-10 shrink-0">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/campaign")} className="h-8 w-8 text-slate-500 hover:bg-slate-100 shrink-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <Megaphone className="h-4 w-4 text-primary" />
                <h1 className="text-lg font-black text-slate-800 tracking-tight">Campaign Workspace</h1>
              </div>
              <p className="text-xs font-medium text-slate-500">
                {isLoading ? "Loading..." : caseData ? `Case ID: ${caseData.id}` : "Unknown Campaign"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isGenerated && (
              <Button 
                onClick={handleGenerate} 
                disabled={isGenerating || isLoading}
                className="bg-primary hover:bg-primary/90 text-white font-bold rounded-sm shadow-none"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" /> Generate Campaign
                  </>
                )}
              </Button>
            )}
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
            {/* Status & Creator */}
            <div className={cn("p-5 border-b border-slate-100 flex-col gap-5", isLeftPanelExpanded ? "flex" : "hidden")}>
              <div className="flex items-center justify-between w-full mb-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</span>
                  <button onClick={() => setIsLeftPanelExpanded(false)} className="text-slate-400 hover:text-slate-700">
                    <PanelLeftClose className="h-4 w-4" />
                  </button>
                </div>
                <div>
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border ${
                  isGenerating 
                    ? "bg-amber-50 text-amber-700 border-amber-200" 
                    : "bg-blue-50/50 text-blue-700 border-blue-200/50"
                }`}>
                  <span className="relative flex h-2 w-2">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                      isGenerating ? "bg-amber-400" : "bg-blue-400"
                    }`}></span>
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${
                      isGenerating ? "bg-amber-500" : "bg-blue-500"
                    }`}></span>
                  </span>
                  <span className="text-xs font-bold">
                    {isGenerating ? `Proses AI (${generationTimeLeft}s)` : status}
                  </span>
                </div>
              </div>
              
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Created By</span>
                <div className="flex items-center gap-2 mb-1">
                  <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="Creator" className="h-5 w-5 rounded-full border border-slate-200" />
                  <span className="text-[11px] font-bold text-slate-700">Gulang Satriya</span>
                </div>
                <span className="text-[9px] font-medium text-slate-500 block">31 Agu 2026, 09:00 WITA</span>
              </div>
            </div>

            {/* Metadata */}
            <div className="border-b border-slate-100">
              <button 
                onClick={() => setShowMetadata(!showMetadata)}
                className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-slate-700" />
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Metadata Campaign</span>
                </div>
                {showMetadata ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
              </button>
              
              {showMetadata && (
                <div className="px-5 pb-5 flex flex-col gap-2.5">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-slate-500 font-semibold uppercase">Kategori</span>
                    <span className="text-xs font-medium text-slate-800">Near Miss - Dozer Amblas</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-slate-500 font-semibold uppercase">Perusahaan</span>
                    <span className="text-xs font-medium text-slate-800">PT Bandang Mining Coal</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-slate-500 font-semibold uppercase">Waktu Insiden</span>
                    <span className="text-xs font-medium text-slate-800">31 Agu 2026, 13:50 WITA</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-slate-500 font-semibold uppercase">Waktu Pelaporan</span>
                    <span className="text-xs font-medium text-slate-800">31 Agu 2026, 16:00 WITA</span>
                  </div>
                </div>
              )}
            </div>

            {/* Activity Log */}
            <div className="border-b border-slate-100">
              <button 
                onClick={() => setShowActivityLog(!showActivityLog)}
                className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <History className="h-4 w-4 text-slate-700" />
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Activity Log</span>
                </div>
                {showActivityLog ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
              </button>
              
              {showActivityLog && (
                <div className="px-5 pb-5 flex flex-col gap-4">
                  {activityLogs.map((log, index) => (
                    <div key={log.id} className="relative flex gap-3">
                      {index < activityLogs.length - 1 && (
                        <div className="absolute left-[9px] top-6 bottom-[-16px] w-[2px] bg-slate-100" />
                      )}
                      <div className="relative z-10 bg-white border border-slate-200 rounded-full p-1 shrink-0 h-6 w-6 flex items-center justify-center shadow-none">
                        {log.icon}
                      </div>
                      <div className="flex flex-col pt-0.5">
                        <span className="text-xs font-bold text-slate-800 leading-tight">{log.action}</span>
                        <span className="text-[10px] font-medium text-slate-500 mt-0.5">{log.user} • {log.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Data Analisis (replaces AI Agents) */}
            <div className="border-b border-slate-100">
              <button 
                onClick={() => setShowDataAnalisis(!showDataAnalisis)}
                className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-slate-700" />
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Data Analisis</span>
                </div>
                {showDataAnalisis ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
              </button>

              {showDataAnalisis && (
                <div className="px-5 pb-5 flex flex-col gap-2">
                  {dataAnalisis.map((item) => (
                    <button 
                      key={item.id} 
                      onClick={() => setSelectedAnalysis(item.id)}
                      className="text-left bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-md p-3 flex items-center justify-between group transition-all shadow-none"
                    >
                      <span className="text-xs font-bold text-slate-700">{item.name}</span>
                      <ExternalLink className="h-3.5 w-3.5 text-slate-300 group-hover:text-blue-500 transition-colors" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

            <button 
              onClick={() => setIsRightPanelExpanded(true)}
              className="absolute right-4 top-4 z-10 p-2 bg-white border border-slate-200 rounded-md shadow-sm text-slate-500 hover:text-slate-900 transition-colors"
            >
              <PanelRight className="h-4 w-4" />
            </button>
          )}

          {/* Main Content Area */}
          <div className="flex-1 overflow-auto p-6 bg-slate-50/50 relative">
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
                         <span className="text-[10px] font-bold uppercase tracking-widest">Data Analisis Siap</span>
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
                                <span className="text-[8px] font-bold text-slate-600 uppercase text-center">Data Analisis</span>
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
              <div className="w-full flex justify-center animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 mt-6 flex-col items-center">
                
                {isGenerating && (
                  <div className="w-full max-w-[860px] mb-6 animate-in slide-in-from-top-4 fade-in duration-300">
                    <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 shadow-md flex items-center justify-between text-slate-100 relative overflow-hidden">
                      {/* Subdued background pulse */}
                      <div className="absolute inset-0 bg-indigo-500/10 animate-pulse pointer-events-none" />
                      
                      <div className="flex items-center gap-3 relative z-10">
                        <Sparkles className="h-4 w-4 text-indigo-400 animate-spin" />
                        <span className="text-[12px] font-medium tracking-wide">
                          <span className="font-bold text-white">AI menyusun Campaign</span>
                          <span className="text-slate-400 mx-2">·</span>
                          {generationStep === 1 && "Menyiapkan hasil analisis"}
                          {generationStep === 2 && "Menyusun konteks kejadian"}
                          {generationStep === 3 && "Menyusun kronologi & akar masalah"}
                          {generationStep === 4 && "Menyusun tindakan perbaikan"}
                          {generationStep === 5 && "Menyusun imbauan pekerja"}
                          {generationStep === 6 && "Menyusun lesson learned"}
                          {generationStep >= 7 && "Memeriksa konsistensi Campaign"}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-3 relative z-10">
                        <span className="text-[11px] font-mono text-slate-400 font-bold bg-slate-800/50 px-2 py-1 rounded">
                          {Math.min(generationStep, 7)} / 7 tahap
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <SafetyAlertPoster 
                  isGenerating={isGenerating} 
                  generationStep={generationStep}
                  onOpenDetail={(title) => { setSelectedAnalysis('poster:' + title); setIsRightPanelExpanded(true); setIsLeftPanelExpanded(false); }} 
                />
              </div>
            )}
            </div>
          </div>


          {/* Right Panel (Sidebar) */}
          {selectedAnalysis === 'all' && (
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
                    Data Input
                  </div>
                </div>
              )}
               <div className={cn("p-4 border-b border-slate-100 items-center justify-between bg-slate-50 sticky top-0 z-20 shrink-0", isRightPanelExpanded ? "flex" : "hidden")}>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded bg-slate-800 flex items-center justify-center">
                       <Database className="h-4 w-4 text-white" />
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
               
               <div className={cn("flex-1 overflow-auto p-6 space-y-10 custom-scrollbar pb-20", isRightPanelExpanded ? "block" : "hidden")}>
                  {dataAnalisis.map((item, index) => (
                    <div key={item.id} className="border-b border-slate-100 pb-10 last:border-0 last:pb-0 relative">
                       {index !== dataAnalisis.length - 1 && <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>}
                       
                       <h4 className="text-[14px] font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
                         <span className="bg-slate-100 text-slate-500 h-5 w-5 rounded flex items-center justify-center text-[10px]">{index + 1}</span>
                         {item.name}
                       </h4>
                       
                       <div className="space-y-6 pl-2 border-l-2 border-slate-50">
                         {/* AI Generated Section */}
                         <div>
                            <div className="flex items-center gap-2 mb-4">
                               <div className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-[9.5px] font-bold uppercase tracking-widest border border-indigo-200 shadow-sm">
                                 <Brain className="h-3 w-3" />
                                 AI Generated
                               </div>
                               {index === 1 && (
                                 <>
                                   <ChevronRight className="h-3 w-3 text-slate-300" />
                                   <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2 py-1 rounded text-[9.5px] font-bold uppercase tracking-widest border border-blue-200 shadow-sm">
                                     <Pencil className="h-3 w-3" />
                                     Annotated
                                   </div>
                                 </>
                               )}
                               {index === 3 && (
                                 <>
                                   <ChevronRight className="h-3 w-3 text-slate-300" />
                                   <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2 py-1 rounded text-[9.5px] font-bold uppercase tracking-widest border border-emerald-200 shadow-sm">
                                     <CheckCircle2 className="h-3 w-3" />
                                     Human Manual
                                   </div>
                                 </>
                               )}
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 mb-5">
                              <div>
                                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Generated By</div>
                                <div className="text-[11px] font-bold text-slate-700">{item.name} Agent</div>
                                <div className="text-[10px] text-slate-500 mt-0.5">05 Agustus 2026, 13:20 WIB</div>
                              </div>
                              <div>
                                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status Versi</div>
                                <div className="text-[10px] font-mono font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded w-fit border border-slate-200">
                                  Versi aktif {index === 1 ? '2' : index === 3 ? '3' : '1'}
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
                               {item.content}
                            </div>
                         </div>
                         
                         {/* Annotation Note (If human annotated) */}
                         {index === 1 && (
                           <div className="pt-2">
                              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                Catatan Anotasi
                                <span className="inline-flex items-center justify-center h-[16px] px-1.5 rounded bg-blue-50 text-blue-500 border border-blue-200">
                                  <User className="h-2.5 w-2.5 mr-1" />
                                  <span className="font-black text-[8px] uppercase tracking-wider">HUMAN</span>
                                </span>
                              </div>
                              <div className="text-[11.5px] text-blue-900 leading-relaxed bg-blue-50/50 p-4 rounded-md border border-blue-100 italic">
                                 "Pastikan memasukkan nama-nama aktor dengan lebih spesifik sesuai struktur jabatan."
                              </div>
                           </div>
                         )}

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
                                    {item.name === 'Kronologi' ? 'Operator mulai brushing di WMP 21 menggunakan unit dozer.' : 'Sistem DMS memicu peringatan kritis kategori Lockdown pada unit yang sedang dioperasikan oleh Operator Saiful.'}
                                  </div>
                                  <ChevronDown className="h-4 w-4 text-slate-300 ml-auto shrink-0 mt-0.5" />
                               </div>
                               
                               {/* Citation Box */}
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
                                    
                                    <div className="bg-white border border-slate-200 rounded-md p-3 relative shadow-sm hover:border-blue-200 transition-colors">
                                      <div className="absolute left-0 top-3 bottom-3 w-[3px] bg-slate-200 rounded-r"></div>
                                      <div className="pl-3">
                                        <div className="flex items-center gap-2 mb-2">
                                          <FileText className="h-3.5 w-3.5 text-slate-400" />
                                          <span className="text-[11px] font-bold text-slate-800">SOP Investigasi Insiden</span>
                                        </div>
                                        <div className="flex justify-start mb-2">
                                          <span className="text-[8.5px] font-mono font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded uppercase tracking-wider">Knowledge Base &middot; Reference</span>
                                        </div>
                                        <div className="text-[11px] text-slate-600 leading-relaxed italic bg-slate-50/50 p-2.5 rounded border border-slate-100">
                                          "Sesuai dengan standar dan panduan yang tercantum dalam prosedur investigasi untuk pelaporan near miss."
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                               </div>
                            </div>
                         </div>
                       </div>
                    </div>
                  ))}
               </div>
             </div>
          )}
          
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
      </div>

      </AppLayout>
  );
}
