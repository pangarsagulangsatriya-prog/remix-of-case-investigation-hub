import React, { useState } from "react";
import { AlertTriangle, MapPin, Building2, Calendar, Clock, History, Layers, FileX, Pencil, Trash2, Plus, Check, X, Eye, BarChart3, Bot, User } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const SourceBadge = ({ type, className, showText = false }: { type?: string, className?: string, showText?: boolean }) => {
  if (!type) return null;
  if (type === 'AI') {
    return (
      <span className={cn(`inline-flex items-center justify-center rounded bg-indigo-50 text-indigo-600 border border-indigo-200 ${showText ? 'px-2 py-1 text-[10px] font-bold uppercase tracking-wider' : 'p-0.5'}`, className)} title="AI Generated">
        <Bot className={showText ? "w-3 h-3 mr-1.5" : "w-3 h-3"} />
        {showText && "AI GENERATED"}
      </span>
    );
  }
  if (type === 'HUMAN') {
    return (
      <span className={cn(`inline-flex items-center justify-center rounded bg-blue-50 text-blue-600 border border-blue-200 ${showText ? 'px-2 py-1 text-[10px] font-bold uppercase tracking-wider' : 'p-0.5'}`, className)} title="Human Annotated">
        <User className={showText ? "w-3 h-3 mr-1.5" : "w-3 h-3"} />
        {showText && "ANNOTATED"}
      </span>
    );
  }
  if (type === 'MANUAL') {
    return (
      <span className={cn(`inline-flex items-center justify-center rounded bg-amber-50 text-amber-600 border border-amber-200 ${showText ? 'px-2 py-1 text-[10px] font-bold uppercase tracking-wider' : 'p-0.5'}`, className)} title="Edit Manual">
        <Pencil className={showText ? "w-3 h-3 mr-1.5" : "w-3 h-3"} />
        {showText && "MANUAL"}
      </span>
    );
  }
  return null;
};

const SkeletonLine = ({ active, className }: { active: boolean, className?: string }) => (
  <div className={`bg-slate-200 rounded ${className || 'h-4 w-full'} ${active ? 'animate-pulse' : 'opacity-50'}`} />
);
const SkeletonBlock = ({ active, lines = 1 }: { active: boolean, lines?: number }) => (
  <div className="space-y-2 w-full">
    {Array.from({ length: lines }).map((_, i) => (
      <SkeletonLine key={i} active={active} className={`h-3 ${i === lines - 1 && lines > 1 ? 'w-2/3' : 'w-full'}`} />
    ))}
  </div>
);

export interface SafetyAlertPosterProps {
  isGenerating?: boolean;
  generationStep?: number;
  onOpenDetail?: (title: string) => void;
  readOnly?: boolean;
}

export function SafetyAlertPoster({ onOpenDetail, isGenerating, generationStep = 0, readOnly = false }: SafetyAlertPosterProps = {}) {
  const [kronologis, setKronologis] = useState([
    { id: 1, title: "Kronologis (31 Agu 2026 | 13:50 WITA):", text: "Operator mengoperasikan BMCDZ 116 untuk brushing di WMP 21 sejak pukul 13:05 WITA. Pada dorongan ke-6 saat unit bergerak mundur, track sisi kiri amblas dan unit langsung dihentikan. Evakuasi unit dilakukan pukul 14:50 WITA, nihil cedera.", icon: "History", source: "HUMAN" },
    { id: 2, title: "Penyebab Utama:", text: "Area kerja memiliki titik lembek bekas parit aliran air menuju WMP, namun belum ada patok boundary dari tim Survey sebagai acuan batas area kerja. Potensi amblas tidak teridentifikasi pada inspeksi awal shift.", icon: "Layers", source: "AI" },
    { id: 3, title: "Kelemahan Prosedur:", text: "Belum ada MPRP aktivitas pembuatan saluran WMP 21 maupun Do's & Don'ts aktivitas brushing. Operator tidak mengisi FTW awal shift dan pengawas tidak memastikannya; temuan inspeksi juga belum dimasukkan ke report Beats.", icon: "FileX", source: "AI" },
  ]);

  const [tindakan, setTindakan] = useState([
    { id: 1, text: "Pastikan setiap aktifitas pekerjaan telah dibuatkan DOP", source: "AI" },
    { id: 2, text: "Pasang boundary/ patok area kerja untuk setiap area kerja dan area yang berpotensi amblas", source: "HUMAN" },
    { id: 3, text: "Pastikan setiap pembuatan saluran WMP telah dibuatkan MPRP", source: "AI" },
    { id: 4, text: "Lakukan assemen setiap lokasi baru yang akan dilakukan pekerjaan", source: "AI" },
    { id: 5, text: "Terpasang CCTV di area aktivitas pekerjaan WMP", source: "AI" }
  ]);

  const [imbauan, setImbauan] = useState({
    title: "AREA LEMBEK TIDAK SELALU TERLIHAT DARI KABIN:",
    text: "Sebelum brushing atau dozing, pastikan batas area kerja sudah berpatok dan kenali bekas parit maupun genangan di sekitar lokasi. Isi FTW awal shift. Bila permukaan terasa lembek atau unit mulai turun: HENTIKAN UNIT DAN LAPORKAN KE PENGAWAS!",
    subtext: "Dokumentasikan setiap temuan kedalam Aplikasi BeATS (Hazard, Inspeksi & Observasi)"
  });

  const [lesson, setLesson] = useState({
    title: "TANAH LEMBEK TIDAK MEMBERI PERINGATAN SEBELUM AMBLAS.",
    text: "Sekali track turun, unit dan operator sudah berada dalam risiko. Batas area kerja yang jelas dan inspeksi yang tercatat adalah pengaman utamanya."
  });

  // State for inline editing
  const [editingKronologisId, setEditingKronologisId] = useState<number | null>(null);
  const [editKronologisData, setEditKronologisData] = useState({ title: "", text: "" });

  const [editingTindakanId, setEditingTindakanId] = useState<number | null>(null);
  const [editTindakanText, setEditTindakanText] = useState("");

  const [editingImbauan, setEditingImbauan] = useState(false);
  const [editImbauanData, setEditImbauanData] = useState(imbauan);

  const [editingLesson, setEditingLesson] = useState(false);
  const [editLessonData, setEditLessonData] = useState(lesson);

  // State for detail panel (Eye icon)
  const [detailPanelOpen, setDetailPanelOpen] = useState(false);
  const [detailPanelTitle, setDetailPanelTitle] = useState("");

  const handleOpenDetail = (title: string) => {
    if (onOpenDetail) {
      onOpenDetail(title);
    } else {
      setDetailPanelTitle("Detail Analisis: " + title);
      setDetailPanelOpen(true);
    }
  };

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case "History": return <History className="h-4 w-4 text-slate-600" />;
      case "Layers": return <Layers className="h-4 w-4 text-slate-600" />;
      case "FileX": return <FileX className="h-4 w-4 text-slate-600" />;
      default: return <History className="h-4 w-4 text-slate-600" />;
    }
  };

  const inputStyle = "w-full text-xs bg-white border border-slate-300 rounded px-2 py-1 outline-none focus:border-blue-500 mb-1 shadow-none focus:shadow-none focus:ring-0";
  const textareaStyle = "w-full text-xs bg-white border border-slate-300 rounded px-2 py-1 outline-none focus:border-blue-500 shadow-none focus:shadow-none focus:ring-0";

  return (
    <>
      <div className="w-[1000px] bg-white text-black font-sans shadow-none rounded-sm overflow-hidden border border-slate-200">
        {/* Header section */}
        <div className="flex bg-[#161616] text-white relative">
          {isGenerating && generationStep < 3 ? (
          <div className="flex-1 py-4 pl-6 pr-4">
            <div className="bg-slate-700 text-transparent text-[11px] font-bold px-2 py-0.5 inline-block mb-1.5 uppercase tracking-wider rounded">
              SAFETY ALERT:
            </div>
            <div className="space-y-2 mt-1">
              <SkeletonLine active={isGenerating && generationStep === 2} className="h-6 w-3/4 bg-slate-600" />
              <SkeletonLine active={isGenerating && generationStep === 2} className="h-6 w-1/2 bg-slate-600" />
            </div>
          </div>
        ) : (
          <div className="flex-1 py-4 pl-6 pr-4">
            <div className="bg-[#ed1c24] text-white text-[11px] font-bold px-2 py-0.5 inline-block mb-1.5 uppercase tracking-wider">
              SAFETY ALERT:
            </div>
            <h1 className="text-2xl font-black uppercase tracking-wide leading-tight">
              TRACK DOZER AMBLAS SAAT BRUSHING DI AREA TITIK LEMBEK
            </h1>
          </div>
        )}
          <div className="bg-[#ed1c24] w-[260px] flex items-center justify-center transform -skew-x-12 translate-x-4 border-l-4 border-white/20">
            <div className="transform skew-x-12 flex items-center gap-2">
              <AlertTriangle className="h-7 w-7 text-white fill-white" />
              {isGenerating && generationStep < 3 ? <div className="h-6 w-24 bg-slate-700 rounded animate-pulse" /> : <span className="text-2xl font-black uppercase tracking-wider">NEAR MISS</span>}
            </div>
          </div>
        </div>
        
        {/* Sub header */}
        <div className="bg-slate-100 flex items-center text-[10px] font-bold text-slate-600 px-6 py-1.5 border-b border-slate-300">
          <div className="flex w-1/3">
            <span className="w-24 text-slate-400">NO. ALERT</span>
            {isGenerating && generationStep < 3 ? <SkeletonLine active={generationStep === 2} className="h-3 w-20" /> : <span className="text-black">[SA-004/IX/2026]</span>}
          </div>
          <div className="flex w-1/3">
            <span className="w-28 text-slate-400">TANGGAL RILIS</span>
            <span className="text-black">[08 SEPTEMBER 2026]</span>
          </div>
        </div>

        <div className="flex p-6 gap-6">
          {/* Left Column */}
          <div className="w-[45%] flex flex-col gap-5">
            
            {/* 1. IDENTITAS KEJADIAN */}
            <section>
              <h2 className="text-[14px] font-black uppercase tracking-wide border-b-2 border-slate-800 pb-1 mb-3">
                1. KONTEKS & FAKTA KEJADIAN
              </h2>
              <h3 className="text-xs font-bold mb-2 uppercase">1. IDENTITAS KEJADIAN</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-50 border border-slate-200 rounded-md p-2 flex items-center gap-3">
                  <div className="bg-white p-1.5 rounded shadow-none">
                    <MapPin className="h-4 w-4 text-slate-700" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-slate-500 font-semibold">Site / Lokasi:</span>
                    <span className="text-[10px] font-bold text-slate-900 leading-tight">WMP 21, Blok 7 - BMO 2</span>
                  </div>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-md p-2 flex items-center gap-3">
                  <div className="bg-white p-1.5 rounded shadow-none">
                    <Building2 className="h-4 w-4 text-slate-700" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-slate-500 font-semibold">Perusahaan:</span>
                    <span className="text-[10px] font-bold text-slate-900 leading-tight">PT Bandang Mining Coal</span>
                  </div>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-md p-2 flex items-center gap-3">
                  <div className="bg-white p-1.5 rounded shadow-none">
                    <Calendar className="h-4 w-4 text-slate-700" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-slate-500 font-semibold">Tanggal:</span>
                    <span className="text-[10px] font-bold text-slate-900 leading-tight">Senin, 31 Agustus 2026</span>
                  </div>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-md p-2 flex items-center gap-3">
                  <div className="bg-white p-1.5 rounded shadow-none">
                    <Clock className="h-4 w-4 text-slate-700" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-slate-500 font-semibold">Jam:</span>
                    <span className="text-[10px] font-bold text-slate-900 leading-tight">13:50 WITA</span>
                  </div>
                </div>
              </div>
            </section>

            {/* 2. VISUAL KEJADIAN */}
            <section>
              <h3 className="text-xs font-bold mb-2 uppercase">2. VISUAL KEJADIAN</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-200 rounded-sm aspect-[4/3] flex items-center justify-center border border-slate-300 overflow-hidden relative">
                  <img src="/images/dozer_stuck.jpg" alt="Dozer Amblas" className="object-cover w-full h-full grayscale opacity-80 mix-blend-multiply" />
                  <div className="absolute inset-0 border-2 border-[#ed1c24]/50 pointer-events-none" />
                  <span className="absolute bottom-1 right-1 text-[8px] font-bold bg-white/80 px-1 text-slate-800">Unit Dozer</span>
                </div>
                <div className="bg-slate-200 rounded-sm aspect-[4/3] flex items-center justify-center border border-slate-300 overflow-hidden relative">
                  <img src="/images/aerial_site.jpg" alt="Area Udara" className="object-cover w-full h-full grayscale opacity-80 mix-blend-multiply" />
                  <div className="absolute inset-0 border-2 border-yellow-500/50 pointer-events-none" />
                  <span className="absolute bottom-1 right-1 text-[8px] font-bold bg-white/80 px-1 text-slate-800">Area Titik Lembek</span>
                </div>
              </div>
            </section>

            {/* 3. KRONOLOGIS & AKAR MASALAH (CRUD) */}
            <section>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold uppercase">3. KRONOLOGIS & AKAR MASALAH</h3>
              </div>
              
              <div className="flex flex-col gap-3">
                {kronologis.map(item => (
                  <div 
                    key={item.id} 
                    className="group relative flex gap-3 items-start p-1.5 -mx-1.5 rounded transition-all border border-transparent hover:border-slate-200 hover:bg-slate-50/70"
                  >
                    <div className="bg-slate-100 p-2 rounded shrink-0 border border-slate-200">
                      {renderIcon(item.icon)}
                    </div>
                    <div className="text-[10px] text-slate-700 leading-tight pr-6">
                      <span className="font-bold text-black flex items-center mb-0.5">
                        {item.title}
                        <SourceBadge type={item.source} className="ml-1" />
                      </span>
                      {item.text}
                    </div>
                    
                    {/* Action Icons */}
                    <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 p-0.5 rounded shadow-none border border-slate-200">
                      <button onClick={(e) => { e.stopPropagation(); handleOpenDetail(item.title); }} className="p-1 text-slate-400 hover:text-indigo-600 rounded transition-colors" title="Detail Analisis">
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Divider */}
          <div className="w-[2px] bg-slate-200 shrink-0" />

          {/* Right Column */}
          <div className="w-[55%] flex flex-col gap-5">
            {/* 4. TINDAKAN PERBAIKAN (CRUD) */}
            <section>
              <div className="flex items-center justify-between border-b-2 border-slate-800 pb-1 mb-3">
                <h2 className="text-[14px] font-black uppercase tracking-wide">
                  TINDAKAN PERBAIKAN SEMUA SITE
                </h2>
                {!readOnly && (
                  <button 
                    onClick={() => {
                      const newId = tindakan.length > 0 ? Math.max(...tindakan.map(t => t.id)) + 1 : 1;
                      setTindakan([...tindakan, { id: newId, text: "Tindakan perbaikan baru...", source: "MANUAL" }]);
                      setEditingTindakanId(newId);
                      setEditTindakanText("Tindakan perbaikan baru...");
                    }}
                    className="text-slate-400 hover:text-blue-500 p-1 rounded"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                )}
              </div>
              
              <div className="flex flex-col gap-2.5">
                {isGenerating && generationStep < 5 ? (
                  <div className="space-y-3">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className="flex gap-3 items-start p-3 bg-white border border-slate-200 rounded">
                        <div className="h-6 w-6 rounded bg-slate-100 flex items-center justify-center shrink-0">
                          <span className="text-[10px] font-bold text-slate-400">0{i}</span>
                        </div>
                        <SkeletonBlock active={generationStep === 4} lines={2} />
                      </div>
                    ))}
                  </div>
                ) : tindakan.map((item, idx) => (
                  <div 
                    key={item.id} 
                    onDoubleClick={() => {
                      if (!readOnly && editingTindakanId !== item.id) {
                        setEditingTindakanId(item.id);
                        setEditTindakanText(item.text);
                      }
                    }}
                    className={cn(
                      "group relative flex overflow-hidden rounded-md shadow-none border border-slate-200 transition-all",
                      !readOnly ? "hover:border-slate-300 cursor-pointer" : ""
                    )}
                  >
                    <div className="bg-[#ed1c24] text-white font-black text-xl w-14 flex items-center justify-center shrink-0">
                      {String(idx + 1).padStart(2, '0')}
                    </div>
                    <div className="bg-slate-50 p-2.5 flex items-center w-full text-slate-800 text-[11px] font-bold leading-tight relative">
                      {editingTindakanId === item.id ? (
                        <div className="flex w-full items-center gap-2">
                          <textarea
                            value={editTindakanText}
                            onChange={(e) => setEditTindakanText(e.target.value)}
                            className={textareaStyle}
                            rows={2}
                          />
                          <div className="flex flex-col gap-1 shrink-0">
                            <button onClick={() => {
                              setTindakan(tindakan.map(t => t.id === item.id ? { ...t, text: editTindakanText, source: "MANUAL" } : t));
                              setEditingTindakanId(null);
                            }} className="text-emerald-600 hover:bg-emerald-50 p-1 rounded border border-transparent">
                              <Check className="h-4 w-4" />
                            </button>
                            <button onClick={() => setEditingTindakanId(null)} className="text-slate-400 hover:bg-slate-100 p-1 rounded border border-transparent">
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="pr-12">
                            <span>{item.text}</span>
                            <SourceBadge type={item.source} className="ml-1.5 align-middle -mt-0.5" />
                          </div>
                          {/* Action Icons */}
                          {!readOnly && (
                            <div className="absolute top-1/2 -translate-y-1/2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 p-0.5 rounded border border-slate-200 shadow-none">
                              <button onClick={(e) => { e.stopPropagation(); handleOpenDetail("Tindakan Perbaikan " + (idx + 1)); }} className="p-1 text-slate-400 hover:text-indigo-600 rounded transition-colors" title="Detail Analisis">
                                <Eye className="h-3.5 w-3.5" />
                              </button>
                              <button onClick={(e) => {
                                e.stopPropagation();
                                setEditingTindakanId(item.id);
                                setEditTindakanText(item.text);
                              }} className="p-1 text-slate-400 hover:text-blue-600 rounded transition-colors" title="Edit Teks">
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button onClick={(e) => {
                                e.stopPropagation();
                                setTindakan(tindakan.filter(t => t.id !== item.id));
                              }} className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors" title="Hapus">
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 5. IMBAUAN AKSI KONKRET (CRUD) */}
            <section>
              <h3 className="text-xs font-bold mb-2 uppercase">5. IMBAUAN AKSI KONKRET PEKERJA LAPANGAN</h3>
              <div 
                className="group relative bg-slate-100 border border-slate-300 rounded p-3 flex gap-4 items-start shadow-none transition-all hover:border-slate-400"
              >
                <AlertTriangle className="h-10 w-10 text-[#ed1c24] fill-[#ed1c24]/10 shrink-0 mt-1" />
                <div className="flex flex-col w-full">
                  <span className="text-[11px] font-black text-[#ed1c24] uppercase mb-1 flex items-center gap-2">
                    {imbauan.title}
                    <SourceBadge type="AI" />
                  </span>
                  <span className="text-[10px] text-slate-700 leading-tight mb-2 pr-12 whitespace-pre-wrap">
                    {imbauan.text}
                  </span>
                  <span className="text-[9px] italic text-slate-500 border-t border-slate-300/50 pt-1">
                    {imbauan.subtext}
                  </span>
                  
                  {/* Action Icons */}
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={() => handleOpenDetail("Imbauan Aksi Konkret")} className="p-1.5 text-slate-400 hover:text-indigo-500 hover:bg-white rounded shadow-none border border-transparent hover:border-slate-200">
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* 6. LESSON LEARNED (CRUD) */}
            <section>
              <h3 className="text-xs font-bold mb-2 uppercase">6. LESSON LEARNED</h3>
              <div 
                className="group relative bg-[#161616] text-white rounded p-4 text-center shadow-none border-b-4 border-[#ed1c24] transition-all hover:border-b-[#ff333a]"
              >
                <span className="flex flex-col items-center justify-center mb-1.5 gap-1.5">
                  <span className="text-[12px] font-black uppercase tracking-wide text-yellow-400">{lesson.title}</span>
                  <SourceBadge type="HUMAN" className="bg-yellow-400/10 text-yellow-500 border-yellow-400/20" />
                </span>
                <span className="block text-[10px] text-slate-300 leading-relaxed font-medium px-4 whitespace-pre-wrap">
                  {lesson.text}
                </span>
                
                {/* Action Icons */}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  <button onClick={() => handleOpenDetail("Lesson Learned")} className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-[#252525] rounded border border-transparent hover:border-slate-700">
                    <Eye className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Detail Analysis Panel (Sheet) */}
      <Sheet open={detailPanelOpen} onOpenChange={setDetailPanelOpen}>
        <SheetContent className="w-[600px] sm:max-w-none border-l shadow-none p-0 flex flex-col h-full bg-slate-50 overflow-y-auto custom-dark-scrollbar">
          <SheetHeader className="p-6 border-b border-slate-200 bg-white sticky top-0 z-10">
            <SheetTitle className="text-sm font-black uppercase flex flex-col gap-1 text-slate-800">
              <div className="flex items-center gap-2">
                <div className="bg-slate-900 text-white p-1.5 rounded shrink-0">
                  <BarChart3 className="h-4 w-4" />
                </div>
                <div className="flex flex-col text-left">
                  <span>DETAIL ANALISIS</span>
                  <span className="text-[10px] text-slate-400 font-medium">ANALISIS BUKTI INVESTIGASI</span>
                </div>
              </div>
            </SheetTitle>
          </SheetHeader>
          
          <div className="flex-1 p-8 flex flex-col gap-8">
            {/* Header Badges */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                <SourceBadge type="AI" showText={true} />
                <span>›</span>
                <SourceBadge type="HUMAN" showText={true} />
              </div>
              <div className="text-[11px] text-slate-500 font-medium flex flex-col gap-1">
                <span>2 kali anotasi</span>
                <span>Versi aktif <span className="font-bold">3</span></span>
              </div>
            </div>

            {/* HASIL ANOTASI TERAKHIR */}
            <div className="flex flex-col gap-3">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">HASIL ANOTASI TERAKHIR</span>
              <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm flex flex-col gap-4 relative">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                    <User className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-800">Gulang Satriya</span>
                    <span className="text-[10px] text-slate-400">05 Agustus 2026 pukul 16.12 WIB</span>
                  </div>
                </div>
                
                <div className="border-l-2 border-blue-500 pl-4 py-1 italic text-sm text-slate-700">
                  "Sistem DMS memicu peringatan kritis kategori Lockdown pada unit yang sedang dioperasikan oleh Operator Saiful."
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded p-4 flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">CATATAN ANOTASI</span>
                  <span className="text-xs text-slate-700 font-medium">Waktu diperjelas berdasarkan rekaman DMS.</span>
                </div>
                
                <div className="text-right text-[10px] font-mono text-slate-400">
                  Versi 2 → Versi 3
                </div>
              </div>
            </div>

            {/* PERNYATAAN AI GENERATED */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">PERNYATAAN AI GENERATED</span>
                <SourceBadge type="AI" showText={true} />
              </div>
              <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm text-sm text-slate-700">
                Sistem DMS memicu peringatan kritis kategori Lockdown pada unit yang sedang dioperasikan oleh Operator Saiful.
              </div>
            </div>

            {/* EVENT & EVIDENCE LINK */}
            <div className="flex flex-col gap-3 mb-4">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">EVENT & EVIDENCE LINK</span>
              <div className="bg-white border border-slate-200 rounded-lg flex flex-col shadow-sm divide-y divide-slate-100">
                <div className="p-4 flex items-start gap-4 cursor-pointer hover:bg-slate-50">
                  <span className="text-xs font-bold text-slate-500 shrink-0 mt-0.5">EVENT 1</span>
                  <span className="bg-slate-100 text-slate-500 text-[10px] px-1.5 py-0.5 rounded font-bold shrink-0 mt-0.5 border border-slate-200 flex items-center gap-1"><FileX className="w-3 h-3" /> 2</span>
                  <p className="text-xs text-slate-700 flex-1 leading-relaxed">
                    Sistem DMS memicu peringatan kritis kategori Lockdown pada unit yang sedang dioperasikan oleh Operator Saiful.
                  </p>
                </div>
              </div>
            </div>
            
            {/* RIWAYAT PERUBAHAN */}
            <div className="border-t border-slate-200 pt-8 mt-2 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-800">RIWAYAT PERUBAHAN</h4>
                <span className="text-xs text-slate-400">2 versi</span>
              </div>
              
              <div className="relative border-l border-slate-200 ml-3 pl-6 flex flex-col gap-8">
                {/* Timeline Item 2 */}
                <div className="relative">
                  <div className="absolute -left-[31px] top-1 h-3.5 w-3.5 bg-blue-500 border-[3px] border-white rounded-full shadow-sm" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">VERSI 2 · DIUBAH</span>
                  <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm flex flex-col gap-4 relative">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-slate-400">Diubah oleh</span>
                      <span className="text-xs font-bold text-slate-800">Gulang Satriya · Lead Investigator</span>
                      <span className="text-[10px] text-slate-400">05 Agustus 2026 pukul 16.30 WIB</span>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">SEBELUM</span>
                      <div className="bg-rose-50 border border-rose-100 rounded p-3 text-xs text-rose-700">
                        Sistem DMS memicu peringatan.
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">SESUDAH</span>
                      <div className="bg-emerald-50 border border-emerald-100 rounded p-3 text-xs text-emerald-700">
                        Sistem DMS memicu peringatan kritis kategori Lockdown pada unit yang sedang dioperasikan oleh Operator Saiful.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Timeline Item 1 */}
                <div className="relative">
                  <div className="absolute -left-[31px] top-1 h-3.5 w-3.5 bg-emerald-500 border-[3px] border-white rounded-full shadow-sm" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">VERSI 1 · DIBUAT OLEH AI</span>
                  <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm flex flex-col gap-3 relative">
                    <span className="text-xs font-bold text-slate-800">Fact & Chronology Agent</span>
                    <span className="text-[10px] text-slate-400">05 Agustus 2026 pukul 13.20 WIB</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
