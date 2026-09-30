import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { useCase } from "@/hooks/useCases";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Megaphone, Sparkles, Clock, CheckCircle2, XCircle, ChevronDown, ChevronRight, History, BarChart3, Info, ExternalLink, Play, Database, Brain, Send, Bot, FileText, Search, Trash2, Edit3, User, Link2, Sparkle } from "lucide-react";
import { SafetyAlertPoster } from "@/components/workspace/SafetyAlertPoster";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export default function CampaignWorkspacePage() {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const { data: caseData, isLoading } = useCase(campaignId || "");
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(true);
  const [showActivityLog, setShowActivityLog] = useState(true);
  const [showMetadata, setShowMetadata] = useState(true);
  const [showDataAnalisis, setShowDataAnalisis] = useState(true);

  // Modal State
  const [selectedAnalysis, setSelectedAnalysis] = useState<string | null>(null);
  const [showRevisionHistory, setShowRevisionHistory] = useState(false);

  // Status & Submit State
  const [status, setStatus] = useState("Sedang Direview");
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [captchaInput, setCaptchaInput] = useState("");
  const captchaTarget = "8421";
  
  const activityLogs = [
    { id: 1, action: "Campaign Created", user: "Gulang Satriya", time: "Hari ini, 09:00 WITA", icon: <Megaphone className="h-4 w-4 text-blue-500" /> },
    { id: 2, action: "Submitted for Review", user: "Gulang Satriya", time: "Hari ini, 09:30 WITA", icon: <Clock className="h-4 w-4 text-amber-500" /> },
    { id: 3, action: "Approved (Tahap 1)", user: "Rina Mahardika", time: "Hari ini, 10:15 WITA", icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" /> },
    { id: 4, action: "Revision Requested", user: "Budi Santoso", time: "Hari ini, 10:45 WITA", icon: <XCircle className="h-4 w-4 text-rose-500" /> },
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
    setTimeout(() => {
      setIsGenerating(false);
      setIsGenerated(true);
      setStatus("Draft");
    }, 3000);
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
            {!isGenerated ? (
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
            ) : (
              <>
                <Button 
                  onClick={handleGenerate} 
                  disabled={isGenerating}
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary/5 font-bold rounded-sm shadow-none"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Regenerating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" /> Regenerate Ulang
                    </>
                  )}
                </Button>
                <Button 
                  onClick={() => setIsSubmitModalOpen(true)}
                  disabled={status === "Sedang Direview" || isGenerating}
                  className="bg-primary hover:bg-primary/90 text-white font-bold rounded-sm shadow-none"
                >
                  {status === "Sedang Direview" ? (
                    <>
                      <Clock className="mr-2 h-4 w-4" /> Sedang Direview
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" /> Submit to Approval
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel */}
          <div className="w-80 border-r border-slate-200 bg-white flex flex-col shrink-0 overflow-y-auto">
            {/* Status & Approver */}
            <div className="p-5 border-b border-slate-100 flex flex-col gap-5">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Status Approval</span>
                <div className="inline-flex items-center gap-1.5 bg-blue-50/50 text-blue-700 px-2.5 py-1 rounded-md border border-blue-200/50">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                  </span>
                  <span className="text-xs font-bold">{status}</span>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Created By</span>
                  <div className="flex items-center gap-2 mb-1">
                    <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="Creator" className="h-5 w-5 rounded-full border border-slate-200" />
                    <span className="text-[11px] font-bold text-slate-700">Gulang Satriya</span>
                  </div>
                  <span className="text-[9px] font-medium text-slate-500 block">31 Agu 2026, 09:00 WITA</span>
                </div>
                
                <div className="w-px bg-slate-200" />
                
                <div className="flex-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Current Approver</span>
                  <div className="flex items-center gap-2 mb-1">
                    <img src="https://i.pravatar.cc/150?u=a042581f4e29026704e" alt="Approver" className="h-5 w-5 rounded-full border border-slate-200" />
                    <span className="text-[11px] font-bold text-slate-700">Budi Santoso</span>
                  </div>
                  <span className="text-[9px] font-medium text-slate-500 block">Safety Manager</span>
                </div>
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

              {isGenerating && (
                <div className="flex flex-col items-center justify-center w-full max-w-[500px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 mt-10">
                  <div className="h-14 w-14 mb-8 rounded-full border-[3px] border-indigo-100 border-t-indigo-500 animate-spin shadow-none" />
                  
                  <div className="w-full bg-white border border-slate-200 shadow-none rounded-xl p-6 relative overflow-hidden">
                    {/* Background grid */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />
                    
                    <h3 className="relative z-10 text-[11px] font-black uppercase text-slate-800 tracking-widest mb-6 border-b border-slate-100 pb-3">Tahap Penyusunan Poster</h3>
                    
                    <div className="flex flex-col gap-6 relative z-10">
                      <div className="absolute left-[11px] top-2 bottom-2 w-[2px] bg-slate-100" />
                      
                      {/* Step 1 */}
                      <div className="flex gap-4 items-center relative z-10">
                         <div className="h-6 w-6 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0 shadow-none">
                           <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                         </div>
                         <div className="flex-1 flex justify-between items-center">
                           <span className="text-[12px] font-bold text-slate-600">Membaca Data Analisis</span>
                           <span className="text-[9px] text-emerald-600 font-bold tracking-wider uppercase bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">Selesai</span>
                         </div>
                      </div>

                      {/* Step 2 */}
                      <div className="flex gap-4 items-center relative z-10">
                         <div className="h-6 w-6 rounded-full bg-indigo-50 border border-indigo-500 flex items-center justify-center shrink-0 shadow-none ring-2 ring-indigo-50">
                           <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                         </div>
                         <div className="flex-1 flex flex-col">
                           <span className="text-[12px] font-bold text-indigo-900">Merangkum PEEPO & IPLS</span>
                           <span className="text-[10px] text-indigo-500/80 mt-0.5 leading-relaxed">Mengidentifikasi poin krusial untuk lesson learned...</span>
                         </div>
                      </div>

                      {/* Step 3 */}
                      <div className="flex gap-4 items-center relative z-10 opacity-40">
                         <div className="h-6 w-6 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0">
                           <span className="text-[9px] font-bold text-slate-400">03</span>
                         </div>
                         <div className="flex-1">
                           <span className="text-[12px] font-semibold text-slate-500">Menyusun tata letak poster otomatis</span>
                         </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {isGenerated && (
                <div className="w-full flex justify-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <SafetyAlertPoster />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Drawer / Sheet for Data Analisis */}
      <Sheet 
        open={!!selectedAnalysis} 
        onOpenChange={(open) => {
          if (!open) {
            setSelectedAnalysis(null);
            setShowRevisionHistory(false);
          }
        }}
      >
        <SheetContent className="w-[85vw] sm:max-w-[60vw] border-l shadow-none p-0 flex flex-col h-full bg-slate-50 rounded-l-none">
          {!showRevisionHistory ? (
            <>
              <SheetHeader className="p-6 border-b border-slate-200 bg-white shrink-0">
                <SheetTitle className="text-lg font-black uppercase flex items-center gap-2 text-slate-800">
                  <BarChart3 className="h-5 w-5 text-slate-800" />
                  Detail Analisis
                </SheetTitle>
                <SheetDescription className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
                  Analisis {selectedAnalysis ? dataAnalisis.find(a => a.id === selectedAnalysis)?.name : ""}
                </SheetDescription>
              </SheetHeader>

              <div className="flex-1 overflow-auto p-8 custom-scrollbar">
                
                {/* AI Generated Tag */}
                <div className="flex items-center gap-1.5 mb-6 bg-blue-50/50 border border-blue-200 text-blue-700 w-fit px-3 py-1.5 rounded-sm">
                  <Bot className="h-4 w-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">AI GENERATED</span>
                </div>

                {/* Metadata */}
                <div className="flex flex-col gap-2 mb-8">
                  <div className="grid grid-cols-[140px_1fr] items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Generated by</span>
                    <span className="text-[11px] font-bold text-slate-800">Fact & Chronology Agent</span>
                  </div>
                  <div className="grid grid-cols-[140px_1fr] items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Waktu Eksekusi</span>
                    <span className="text-[11px] font-bold text-slate-800">05 Agustus 2026, 13:20 WIB</span>
                  </div>
                  <div className="grid grid-cols-[140px_1fr] items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status Versi</span>
                    <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-sm w-fit border border-emerald-100">Versi aktif 1</span>
                  </div>
                </div>

                {/* Main Content Card */}
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Pernyataan AI Generated</span>
                    <Sparkles className="h-3.5 w-3.5 text-blue-500" />
                  </div>
                  <div className="bg-white border border-slate-200 rounded-sm p-6 shadow-none">
                    <div className="prose prose-sm prose-slate max-w-none text-[13px] leading-relaxed font-medium text-slate-700 whitespace-pre-wrap">
                      {selectedAnalysis ? dataAnalisis.find(a => a.id === selectedAnalysis)?.content : ""}
                    </div>
                  </div>
                </div>

                {/* Links / References */}
                <div className="mb-10">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Event & Evidence Link</span>
                  </div>
                  <div className="flex flex-col gap-3">
                    {/* Mock References */}
                    <div className="bg-white border border-slate-200 rounded-sm p-4 flex gap-4 items-start hover:border-slate-300 transition-colors cursor-pointer group shadow-none">
                      <div className="flex items-center gap-2 mt-0.5 shrink-0">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider w-14">Event 1</span>
                        <div className="flex items-center gap-1 bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-sm text-[9px] font-bold">
                          <FileText className="h-3 w-3" /> 1
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-[11px] font-bold text-slate-700 leading-tight">Bukti pendukung nomor 1 (Teks rekaman percakapan).</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition-colors shrink-0" />
                    </div>
                    
                    <div className="bg-white border border-slate-200 rounded-sm p-4 flex gap-4 items-start hover:border-slate-300 transition-colors cursor-pointer group shadow-none">
                      <div className="flex items-center gap-2 mt-0.5 shrink-0">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider w-14">Event 2</span>
                        <div className="flex items-center gap-1 bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-sm text-[9px] font-bold">
                          <FileText className="h-3 w-3" /> 2
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-[11px] font-bold text-slate-700 leading-tight">Bukti video CCTV LMO, timestamp 14:00.</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition-colors shrink-0" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-center border-t border-slate-200 pt-8 pb-4">
                  <Button 
                    variant="outline" 
                    className="w-full sm:w-auto px-8 h-12 text-xs font-black uppercase tracking-widest text-slate-600 hover:text-slate-900 border-slate-300 rounded-sm"
                    onClick={() => setShowRevisionHistory(true)}
                  >
                    <History className="mr-2 h-4 w-4" /> Lihat Riwayat Perubahan
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Riwayat Perubahan View */}
              <SheetHeader className="p-6 border-b border-slate-200 bg-white shrink-0 flex flex-row items-center justify-between">
                <div>
                  <SheetTitle className="text-lg font-black uppercase flex items-center gap-2 text-slate-800">
                    <History className="h-5 w-5 text-slate-800" />
                    Riwayat Perubahan
                  </SheetTitle>
                  <SheetDescription className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
                    {selectedAnalysis ? dataAnalisis.find(a => a.id === selectedAnalysis)?.name : ""} • 3 Aktivitas
                  </SheetDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setShowRevisionHistory(false)} className="text-xs font-bold text-slate-500 hover:text-slate-800">
                  <ArrowLeft className="mr-2 h-3.5 w-3.5" /> Kembali
                </Button>
              </SheetHeader>

              <div className="p-6 border-b border-slate-200 bg-slate-50/50 shrink-0">
                <div className="flex gap-4 items-center">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Cari waktu, pengguna, atau isi perubahan..." 
                      className="w-full h-10 pl-9 pr-4 text-[11px] font-medium border border-slate-200 rounded-sm bg-white focus:outline-none focus:border-slate-300 focus:ring-0 shadow-none"
                    />
                  </div>
                  <div className="flex gap-3">
                    <select className="h-10 px-3 text-[11px] font-bold border border-slate-200 rounded-sm bg-white focus:outline-none shadow-none cursor-pointer min-w-[120px]">
                      <option>Semua Status</option>
                      <option>Dibuat</option>
                      <option>Diubah</option>
                      <option>Dihapus</option>
                    </select>
                    <select className="h-10 px-3 text-[11px] font-bold border border-slate-200 rounded-sm bg-white focus:outline-none shadow-none cursor-pointer min-w-[140px]">
                      <option>Semua Pengguna</option>
                      <option>AI Agent</option>
                      <option>Human (Investigator)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-auto p-8 custom-scrollbar bg-slate-50">
                <div className="flex flex-col gap-8 relative">
                  <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-slate-200" />
                  
                  {/* Item 1 - Dihapus */}
                  <div className="relative pl-12">
                    <div className="absolute left-2.5 top-1 h-3.5 w-3.5 rounded-full bg-rose-500 ring-4 ring-slate-50" />
                    <div className="bg-white border border-slate-200 rounded-sm shadow-none overflow-hidden">
                      <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <div className="flex items-center gap-2">
                          <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                          <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest bg-rose-50 px-2 py-0.5 rounded-sm border border-rose-100">Dihapus</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400">06 Agustus 2026 pukul 16:04 WIB</span>
                      </div>
                      <div className="p-5">
                        <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-wider mb-2">Pasca Kontak - Pasca 01:35</h4>
                        <div className="bg-rose-50/50 border border-rose-100 p-3 rounded-sm mb-4">
                          <p className="text-[11px] font-medium text-rose-800 leading-relaxed italic">Alasan Penghapusan:<br/>Item dihapus dari analisis aktif karena sudah tercatat di laporan terpisah.</p>
                        </div>
                        <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-2">
                          <div className="flex flex-col">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Actor</span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] font-black text-slate-700">Aditya Pratama</span>
                              <span className="text-[10px] text-slate-400 font-medium">· Safety Superintendent</span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-[9px] font-bold text-blue-500 flex items-center gap-1 uppercase tracking-widest mb-1"><User className="h-3 w-3" /> HUMAN</span>
                            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-sm">Versi 3</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Item 2 - Diubah */}
                  <div className="relative pl-12">
                    <div className="absolute left-2.5 top-1 h-3.5 w-3.5 rounded-full bg-blue-500 ring-4 ring-slate-50" />
                    <div className="bg-white border border-slate-200 rounded-sm shadow-none overflow-hidden">
                      <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <div className="flex items-center gap-2">
                          <Edit3 className="h-3.5 w-3.5 text-blue-500" />
                          <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-sm border border-blue-100">Diubah</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400">05 Agustus 2026 pukul 15:16 WIB</span>
                      </div>
                      <div className="p-5">
                        <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-wider mb-2">Pra-Kontak - 22:15 WITA</h4>
                        <div className="mb-4 space-y-4">
                          <div>
                            <span className="text-[9px] font-bold text-rose-500 uppercase tracking-widest block mb-1">Sebelum</span>
                            <div className="bg-rose-50/50 text-rose-800 text-[11px] font-medium p-3 rounded-sm border border-rose-100 line-through opacity-80">
                              Data belum lengkap.
                            </div>
                          </div>
                          <div>
                            <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest block mb-1">Sesudah</span>
                            <div className="bg-emerald-50/50 text-emerald-800 text-[11px] font-medium p-3 rounded-sm border border-emerald-100">
                              Sistem DMS memicu peringatan kritis kategori Lockdown pada unit yang sedang dioperasikan oleh Operator Saiful.
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-2">
                          <div className="flex flex-col">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Actor</span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] font-black text-slate-700">Gulang Satriya</span>
                              <span className="text-[10px] text-slate-400 font-medium">· Lead Investigator</span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-[9px] font-bold text-blue-500 flex items-center gap-1 uppercase tracking-widest mb-1"><User className="h-3 w-3" /> HUMAN</span>
                            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-sm">Versi 2</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Item 3 - Dibuat */}
                  <div className="relative pl-12">
                    <div className="absolute left-2.5 top-1 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-4 ring-slate-50" />
                    <div className="bg-white border border-slate-200 rounded-sm shadow-none overflow-hidden">
                      <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
                          <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-sm border border-emerald-200">Dibuat</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400">05 Agustus 2026 pukul 13:20 WIB</span>
                      </div>
                      <div className="p-5">
                        <div className="bg-slate-50 text-slate-700 text-[11px] font-medium p-3 rounded-sm border border-slate-200 mb-4 italic">
                          "Draf awal berhasil di-generate dari data bukti lapangan."
                        </div>
                        <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-2">
                          <div className="flex flex-col">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Actor</span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] font-black text-slate-700">Fact & Chronology Agent</span>
                              <span className="text-[10px] text-slate-400 font-medium">· AI Model</span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-[9px] font-bold text-indigo-500 flex items-center gap-1 uppercase tracking-widest mb-1"><Bot className="h-3 w-3" /> AI GENERATED</span>
                            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-sm">Versi 1</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Submit Approval Modal */}
      <Dialog open={isSubmitModalOpen} onOpenChange={(open) => {
        if (!open) {
          setIsSubmitModalOpen(false);
          setCaptchaInput("");
          setIsConfirmed(false);
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-slate-800 flex items-center gap-2">
              <Send className="h-5 w-5 text-indigo-500" />
              Konfirmasi Submit Campaign
            </DialogTitle>
            <DialogDescription className="text-sm font-medium text-slate-500 pt-2">
              Anda yakin untuk men-submit konten campaign berikut untuk approval?
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 flex flex-col gap-2 my-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Judul Alert:</span>
              <span className="text-xs font-black text-slate-800 text-right">TRACK DOZER AMBLAS SAAT BRUSHING...</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Kategori:</span>
              <span className="text-xs font-bold text-slate-800 text-right">Near Miss</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Diajukan Oleh:</span>
              <span className="text-xs font-bold text-slate-800 text-right">Gulang Satriya</span>
            </div>
          </div>

          <div className="flex flex-col gap-4 pt-2">
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="flex items-center h-5 mt-0.5">
                <input 
                  type="checkbox" 
                  checked={isConfirmed}
                  onChange={(e) => setIsConfirmed(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                />
              </div>
              <span className="text-xs text-slate-600 font-medium group-hover:text-slate-800">
                Saya telah meninjau hasil poster, kronologi, tindakan perbaikan, dan imbauan aksi konkret serta memastikan informasi tersebut sudah sesuai.
              </span>
            </label>

            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Verifikasi Keamanan</span>
              <div className="flex gap-3">
                <div className="bg-slate-100 border border-slate-300 rounded-md px-4 py-2 flex items-center justify-center select-none shadow-none">
                  <span className="text-lg font-black tracking-[0.2em] text-slate-700 blur-[0.5px] line-through decoration-slate-400">{captchaTarget}</span>
                </div>
                <input 
                  type="text" 
                  placeholder="Ketik angka di samping..."
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  className="flex-1 text-sm bg-white border border-slate-300 rounded-md px-3 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsSubmitModalOpen(false)}>
              Batal
            </Button>
            <Button 
              disabled={!isConfirmed || captchaInput !== captchaTarget || isSubmitting}
              onClick={() => {
                setIsSubmitting(true);
                setTimeout(() => {
                  setIsSubmitting(false);
                  setIsSubmitModalOpen(false);
                  setStatus("Menunggu Approval");
                }, 1000);
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {isSubmitting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>
              ) : (
                <><Send className="mr-2 h-4 w-4" /> Submit Campaign</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
