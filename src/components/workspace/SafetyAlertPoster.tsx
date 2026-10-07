import React, { useState } from "react";
import { AlertTriangle, MapPin, Building2, Calendar, Clock, History, Layers, FileX, Pencil, Trash2, Plus, Check, X, Eye, BarChart3, Bot, User, ChevronRight, Brain, ChevronDown } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const SourceBadge = ({ type, className, showText = false }: { type?: string, className?: string, showText?: boolean }) => {
  if (!type) return null;
  if (type === 'AI') {
    return (
      <span className={cn(`inline-flex items-center justify-center rounded bg-indigo-50 text-indigo-600 border border-indigo-200 ${showText ? 'px-2 py-1 text-[10px] font-bold uppercase tracking-wider' : 'px-1.5 py-[2px] text-[9px] font-bold tracking-widest'}`, className)} title="AI Generated">
        {showText ? (
          <>
            <Bot className="w-3 h-3 mr-1.5" />
            AI GENERATED
          </>
        ) : (
          "AI"
        )}
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
  const [itemToDelete, setItemToDelete] = useState<{ id: number, text: string } | null>(null);
  const [deleteReason, setDeleteReason] = useState("");

  const confirmDeleteTindakan = () => {
    if (!itemToDelete) return;
    if (!deleteReason.trim()) {
      toast.error("Alasan penghapusan wajib diisi!");
      return;
    }
    setTindakan(tindakan.filter(t => t.id !== itemToDelete.id));
    setItemToDelete(null);
    setDeleteReason("");
    toast.success("Tindakan perbaikan berhasil dihapus. Riwayat tersimpan di Audit Log.");
  };

  const [editingImbauan, setEditingImbauan] = useState(false);
  const [editImbauanData, setEditImbauanData] = useState(imbauan);

  const [editingLesson, setEditingLesson] = useState(false);
  const [editLessonData, setEditLessonData] = useState(lesson);

  // State for detail panel (Eye icon)
  const [detailPanelOpen, setDetailPanelOpen] = useState(false);
  const [detailPanelTitle, setDetailPanelTitle] = useState("");
  const [detailPanelData, setDetailPanelData] = useState<any>(null);
  const [showHistory, setShowHistory] = useState(false);

  const handleOpenDetail = (title: string, itemData?: any) => {
    if (onOpenDetail) {
      onOpenDetail(title);
    } else {
      setDetailPanelTitle(title);
      setDetailPanelData(itemData || null);
      setShowHistory(false);
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
                    onDoubleClick={() => {
                      if (!readOnly && editingKronologisId !== item.id) {
                        setEditingKronologisId(item.id);
                        setEditKronologisData({ title: item.title, text: item.text });
                      }
                    }}
                    className={cn(
                      "group relative flex gap-3 items-start p-1.5 -mx-1.5 rounded transition-all border border-transparent",
                      !readOnly ? "hover:border-slate-200 hover:bg-slate-50/70 cursor-pointer" : ""
                    )}
                  >
                    <div className="bg-slate-100 p-2 rounded shrink-0 border border-slate-200">
                      {renderIcon(item.icon)}
                    </div>
                    
                    {editingKronologisId === item.id ? (
                      <div className="flex-1 w-full bg-white p-2 rounded border border-blue-200 shadow-sm relative z-10">
                        <input
                          value={editKronologisData.title}
                          onChange={(e) => setEditKronologisData({...editKronologisData, title: e.target.value})}
                          className={inputStyle}
                        />
                        <textarea
                          value={editKronologisData.text}
                          onChange={(e) => setEditKronologisData({...editKronologisData, text: e.target.value})}
                          className={textareaStyle}
                          rows={3}
                        />
                        <div className="flex justify-end gap-1 mt-2">
                          <button onClick={(e) => {
                            e.stopPropagation();
                            setKronologis(kronologis.map(k => k.id === item.id ? { ...k, title: editKronologisData.title, text: editKronologisData.text, source: "HUMAN" } : k));
                            setEditingKronologisId(null);
                          }} className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1">
                            <Check className="h-3 w-3" /> Simpan
                          </button>
                          <button onClick={(e) => {
                            e.stopPropagation();
                            setEditingKronologisId(null);
                          }} className="bg-slate-50 text-slate-500 hover:bg-slate-100 px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1">
                            <X className="h-3 w-3" /> Batal
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-[10px] text-slate-700 leading-tight pr-6">
                        <span className="font-bold text-black flex items-center mb-0.5">
                          {item.title}
                          <SourceBadge type={item.source} className="ml-1" />
                        </span>
                        {item.text}
                      </div>
                    )}
                    
                    {/* Action Icons */}
                    {!readOnly && editingKronologisId !== item.id && (
                      <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 p-0.5 rounded shadow-none border border-slate-200">
                        <button onClick={(e) => { e.stopPropagation(); handleOpenDetail(item.title, item); }} className="p-1 text-slate-400 hover:text-indigo-600 rounded transition-colors" title="Detail Analisis">
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={(e) => {
                          e.stopPropagation();
                          setEditingKronologisId(item.id);
                          setEditKronologisData({ title: item.title, text: item.text });
                        }} className="p-1 text-slate-400 hover:text-blue-600 rounded transition-colors" title="Edit Teks">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
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
                              <button onClick={(e) => { e.stopPropagation(); handleOpenDetail("Tindakan Perbaikan " + (idx + 1), item); }} className="p-1 text-slate-400 hover:text-indigo-600 rounded transition-colors" title="Detail Analisis">
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
                                setItemToDelete({ id: item.id, text: item.text });
                                setDeleteReason("");
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
                onDoubleClick={() => {
                  if (!readOnly && !editingImbauan) {
                    setEditingImbauan(true);
                    setEditImbauanData(imbauan);
                  }
                }}
                className={cn(
                  "group relative bg-slate-100 border rounded p-3 flex gap-4 items-start shadow-none transition-all",
                  !readOnly ? "hover:border-slate-400 border-slate-300 cursor-pointer" : "border-slate-300"
                )}
              >
                <AlertTriangle className="h-10 w-10 text-[#ed1c24] fill-[#ed1c24]/10 shrink-0 mt-1" />
                <div className="flex flex-col w-full">
                  {editingImbauan ? (
                    <div className="flex flex-col gap-2 w-full bg-white p-2 rounded border border-blue-200 shadow-sm relative z-10">
                      <input
                        value={editImbauanData.title}
                        onChange={(e) => setEditImbauanData({...editImbauanData, title: e.target.value})}
                        className={inputStyle}
                        placeholder="Judul imbauan..."
                      />
                      <textarea
                        value={editImbauanData.text}
                        onChange={(e) => setEditImbauanData({...editImbauanData, text: e.target.value})}
                        className={textareaStyle}
                        rows={3}
                        placeholder="Teks imbauan utama..."
                      />
                      <input
                        value={editImbauanData.subtext}
                        onChange={(e) => setEditImbauanData({...editImbauanData, subtext: e.target.value})}
                        className={inputStyle}
                        placeholder="Teks tambahan (opsional)..."
                      />
                      <div className="flex justify-end gap-1 mt-1">
                        <button onClick={(e) => {
                          e.stopPropagation();
                          setImbauan(editImbauanData);
                          setEditingImbauan(false);
                        }} className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1">
                          <Check className="h-3 w-3" /> Simpan
                        </button>
                        <button onClick={(e) => {
                          e.stopPropagation();
                          setEditingImbauan(false);
                        }} className="bg-slate-50 text-slate-500 hover:bg-slate-100 px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1">
                          <X className="h-3 w-3" /> Batal
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
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
                    </>
                  )}
                  
                  {/* Action Icons */}
                  {!readOnly && !editingImbauan && (
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={(e) => { e.stopPropagation(); handleOpenDetail("Imbauan Aksi Konkret", { ...imbauan, source: "AI" }); }} className="p-1.5 text-slate-400 hover:text-indigo-500 hover:bg-white rounded shadow-none border border-transparent hover:border-slate-200" title="Detail Analisis">
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={(e) => {
                        e.stopPropagation();
                        setEditingImbauan(true);
                        setEditImbauanData(imbauan);
                      }} className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-white rounded shadow-none border border-transparent hover:border-slate-200" title="Edit Teks">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* 6. LESSON LEARNED (CRUD) */}
            <section>
              <h3 className="text-xs font-bold mb-2 uppercase">6. LESSON LEARNED</h3>
              <div 
                onDoubleClick={() => {
                  if (!readOnly && !editingLesson) {
                    setEditingLesson(true);
                    setEditLessonData(lesson);
                  }
                }}
                className={cn(
                  "group relative bg-[#161616] text-white rounded p-4 text-center shadow-none border-b-4 transition-all",
                  !readOnly ? "hover:border-b-[#ff333a] border-[#ed1c24] cursor-pointer" : "border-[#ed1c24]"
                )}
              >
                {editingLesson ? (
                  <div className="flex flex-col gap-2 w-full bg-[#252525] p-3 rounded border border-slate-700 shadow-sm relative z-10 text-left">
                    <input
                      value={editLessonData.title}
                      onChange={(e) => setEditLessonData({...editLessonData, title: e.target.value})}
                      className={cn(inputStyle, "bg-[#333] border-slate-600 text-white focus:border-blue-500")}
                      placeholder="Judul lesson learned..."
                    />
                    <textarea
                      value={editLessonData.text}
                      onChange={(e) => setEditLessonData({...editLessonData, text: e.target.value})}
                      className={cn(textareaStyle, "bg-[#333] border-slate-600 text-white focus:border-blue-500")}
                      rows={3}
                      placeholder="Teks lesson learned..."
                    />
                    <div className="flex justify-end gap-1 mt-1">
                      <button onClick={(e) => {
                        e.stopPropagation();
                        setLesson(editLessonData);
                        setEditingLesson(false);
                      }} className="bg-emerald-900/50 text-emerald-400 hover:bg-emerald-900 px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 border border-emerald-800">
                        <Check className="h-3 w-3" /> Simpan
                      </button>
                      <button onClick={(e) => {
                        e.stopPropagation();
                        setEditingLesson(false);
                      }} className="bg-slate-800 text-slate-400 hover:bg-slate-700 px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 border border-slate-700">
                        <X className="h-3 w-3" /> Batal
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <span className="flex flex-col items-center justify-center mb-1.5 gap-1.5">
                      <span className="text-[12px] font-black uppercase tracking-wide text-yellow-400">{lesson.title}</span>
                      <SourceBadge type="HUMAN" className="bg-yellow-400/10 text-yellow-500 border-yellow-400/20" />
                    </span>
                    <span className="block text-[10px] text-slate-300 leading-relaxed font-medium px-4 whitespace-pre-wrap">
                      {lesson.text}
                    </span>
                  </>
                )}
                
                {/* Action Icons */}
                {!readOnly && !editingLesson && (
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={(e) => { e.stopPropagation(); handleOpenDetail("Lesson Learned", { ...lesson, source: "HUMAN" }); }} className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-[#252525] rounded border border-transparent hover:border-slate-700" title="Detail Analisis">
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={(e) => {
                      e.stopPropagation();
                      setEditingLesson(true);
                      setEditLessonData(lesson);
                    }} className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-[#252525] rounded border border-transparent hover:border-slate-700" title="Edit Teks">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Detail Analysis Panel (Sheet) */}
      <Sheet open={detailPanelOpen} onOpenChange={setDetailPanelOpen}>
        <SheetContent className="w-[600px] sm:max-w-none border-l shadow-none p-0 flex flex-col h-full bg-slate-50 overflow-y-auto custom-dark-scrollbar">
          {showHistory ? (
            <div className="flex flex-col h-full bg-slate-50 relative overflow-hidden animate-in slide-in-from-right duration-300">
              <div className="p-4 border-b border-slate-200 bg-white shrink-0 flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={() => setShowHistory(false)} className="h-7 px-2 text-slate-500 hover:text-slate-800">
                  &larr; Kembali
                </Button>
                <div className="flex-1">
                  <h3 className="text-[13px] font-bold text-slate-900 uppercase tracking-wider leading-none">RIWAYAT PERUBAHAN</h3>
                  <p className="text-[10px] text-slate-500 mt-1">{detailPanelData?.source === 'HUMAN' ? '1 versi' : '2 versi'}</p>
                </div>
              </div>
              <div className="flex-1 overflow-auto p-6 bg-slate-50">
                <div className="relative pl-5 border-l-2 border-slate-200">
                  <div className="absolute w-3 h-3 rounded-full bg-blue-500 -left-[7px] top-1" />
                  <div className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">VERSI {detailPanelData?.source === 'HUMAN' ? '1' : '2'} &middot; {detailPanelData?.source === 'HUMAN' ? 'DITAMBAHKAN MANUAL' : 'DIUBAH'}</div>
                  <div className="bg-white border border-slate-200 rounded p-4 shadow-sm mb-6">
                    <div className="text-[10px] text-slate-400 mb-1">
                      {detailPanelData?.source === 'HUMAN' ? 'Ditambahkan oleh' : 'Diubah oleh'}
                    </div>
                    <div className="text-[11px] font-bold text-slate-800 mb-3">Gulang Satriya &middot; Lead Investigator</div>
                    <div className="text-[11px] text-slate-800 leading-relaxed italic border-l-2 border-slate-300 pl-3 py-1 mb-3">
                      "{detailPanelData?.text}"
                    </div>
                    <div className="text-[10px] text-slate-400 mb-3">05 Agustus 2026 pukul 16.30 WIB</div>
                    
                    <details className="group">
                      <summary className="text-[10px] font-bold text-blue-600 cursor-pointer hover:text-blue-700 list-none flex items-center gap-1">
                        <span className="group-open:hidden">[Lihat Detail Perubahan]</span>
                        <span className="hidden group-open:inline">[Tutup Detail Perubahan]</span>
                      </summary>
                      <div className="mt-3 space-y-3 pt-3 border-t border-slate-100">
                        <div>
                          <div className="text-[9px] font-bold text-slate-400 mb-1">{detailPanelData?.source === 'HUMAN' ? 'Catatan' : 'Catatan anotasi'}</div>
                          <div className="text-[11px] text-slate-700 bg-slate-50 p-2 rounded border border-slate-100">Menambahkan alasan atau koreksi manual.</div>
                        </div>
                        <div>
                          <div className="text-[9px] font-bold text-slate-400 mb-1">SEBELUM</div>
                          <div className="bg-red-50 text-red-900 p-2 rounded text-[11px] border border-red-100">Data sebelum diubah.</div>
                        </div>
                        <div>
                          <div className="text-[9px] font-bold text-slate-400 mb-1">SESUDAH</div>
                          <div className="bg-emerald-50 text-emerald-900 p-2 rounded text-[11px] border border-emerald-100">{detailPanelData?.text}</div>
                        </div>
                      </div>
                    </details>
                  </div>
                </div>
                {detailPanelData?.source !== 'HUMAN' && (
                  <div className="relative pl-5 border-l-2 border-transparent mt-6">
                    <div className="absolute w-3 h-3 rounded-full bg-slate-300 -left-[7px] top-1" />
                    <div className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">VERSI 1 &middot; AI GENERATED</div>
                    <div className="bg-slate-100 border border-slate-200 rounded p-4 shadow-sm">
                      <div className="text-[11px] font-bold text-slate-800 mb-2">Fact & Chronology Agent</div>
                      <div className="text-[10px] text-slate-400">05 Agustus 2026 pukul 13.20 WIB</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full bg-slate-50 relative overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-white shrink-0 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-slate-900 flex items-center justify-center text-white rounded-none">
                    <BarChart3 className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-[13px] font-bold text-slate-900 uppercase tracking-wider leading-none">DETAIL ANALISIS</h3>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">{detailPanelTitle}</p>
                  </div>
                </div>
                {/* DO NOT ADD Close X button here to keep native Dialog Close trigger functioning, or handle via setDetailPanelOpen(false) if we need custom */}
              </div>

              <div className="flex-1 overflow-auto p-6 space-y-6">
                {detailPanelData?.source === 'HUMAN' ? (
                  <div>
                    <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest border border-emerald-200 mb-4">
                       <Check className="h-3 w-3" />
                       Ditambahkan Manual
                    </div>
                    <div className="text-[10px] text-slate-400 mb-1">Ditambahkan oleh</div>
                    <div className="text-[11px] font-bold text-slate-800 mb-1">Gulang Satriya &middot; Lead Investigator</div>
                    <div className="text-[10px] text-slate-500 mb-1">05 Agustus 2026, 13:42 WIB</div>
                    <div className="text-[10px] font-mono text-slate-400 mt-2">Versi aktif 1</div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center flex-wrap gap-2 mb-4">
                      <div className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest border border-indigo-200">
                         <Brain className="h-3 w-3" />
                         AI Generated
                      </div>
                      <ChevronRight className="h-3 w-3 text-slate-400" />
                      <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest border border-blue-200">
                         <Pencil className="h-3 w-3" />
                         Annotated
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-500 mb-3">1 kali anotasi</div>
                    <div className="text-[10px] font-mono text-slate-400 mt-2">Versi aktif 2</div>
                  </div>
                )}

                <hr className="border-slate-100" />

                {/* HASIL ANOTASI TERAKHIR */}
                {detailPanelData?.source !== 'HUMAN' && (
                   <div className="mb-6">
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">HASIL ANOTASI TERAKHIR</div>
                      <div className="bg-blue-50/30 p-4 rounded border border-blue-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                           <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center border border-blue-200 shrink-0">
                             <User className="h-4 w-4 text-blue-600" />
                           </div>
                           <div>
                             <div className="text-[11px] font-bold text-slate-800">Gulang Satriya</div>
                             <div className="text-[10px] text-slate-500">05 Agustus 2026 pukul 16.30 WIB</div>
                           </div>
                        </div>
                        <div className="text-[12px] text-slate-800 leading-relaxed italic border-l-[3px] border-blue-400 pl-3 py-1 mb-4 bg-white/50">
                          "{detailPanelData?.text}"
                        </div>
                        <div className="bg-white p-3 rounded border border-slate-100 text-[11px] shadow-sm">
                          <div className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-widest">Catatan Anotasi</div>
                          <div className="text-slate-700 font-medium">Menambahkan alasan atau koreksi.</div>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-4 text-right">
                           Versi 1 &rarr; Versi 2
                        </div>
                      </div>
                   </div>
                )}

                {/* PERNYATAAN AWAL */}
                <div className="mb-6">
                   <div className="flex items-center gap-2 mb-2">
                     <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                       {detailPanelData?.source === 'HUMAN' ? 'PERNYATAAN AWAL' : 'PERNYATAAN AWAL (AI)'}
                     </div>
                     {detailPanelData?.source !== 'HUMAN' && (
                       <div className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase border border-indigo-200 shadow-sm">
                         <Brain className="h-2.5 w-2.5" /> AI
                       </div>
                     )}
                   </div>
                   <div className="text-[12.5px] text-slate-800 leading-relaxed bg-slate-50/80 p-4 rounded border border-slate-200">
                     {detailPanelData?.source === 'HUMAN' ? detailPanelData?.text : 'Data pernyataan AI sebelumnya.'}
                   </div>
                </div>

                {/* EVENT & EVIDENCE LINK */}
                {detailPanelData?.source !== 'HUMAN' && (
                  <div className="mb-6">
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">EVENT & EVIDENCE LINK</div>
                    <div className="bg-white border border-slate-200 rounded-lg flex flex-col shadow-sm divide-y divide-slate-100">
                      <div className="p-4 flex items-start gap-4 cursor-pointer hover:bg-slate-50">
                        <span className="text-xs font-bold text-slate-500 shrink-0 mt-0.5">EVENT 1</span>
                        <span className="bg-slate-100 text-slate-500 text-[10px] px-1.5 py-0.5 rounded font-bold shrink-0 mt-0.5 border border-slate-200 flex items-center gap-1"><FileX className="w-3 h-3" /> 2</span>
                        <p className="text-xs text-slate-700 flex-1 leading-relaxed">
                          Sistem DMS memicu peringatan kritis kategori Lockdown pada unit yang sedang dioperasikan oleh Operator Saiful.
                        </p>
                        <ChevronDown className="h-4 w-4 text-slate-400 mt-1" />
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-4">
                  <Button 
                    variant="outline" 
                    className="w-full bg-white text-[11px] font-bold text-slate-700 border-slate-300 hover:bg-slate-50 h-9"
                    onClick={() => setShowHistory(true)}
                  >
                    Lihat Riwayat Perubahan
                  </Button>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <DialogContent className="sm:max-w-[500px] bg-white border-0 p-0 shadow-2xl overflow-hidden rounded-xl">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-100 bg-slate-50/50 relative">
            <button onClick={() => setItemToDelete(null)} className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors">
              <X className="h-4 w-4" />
            </button>
            <DialogTitle className="text-base font-black text-rose-600 uppercase tracking-widest text-left mt-2 flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              Hapus Tindakan Perbaikan?
            </DialogTitle>
          </DialogHeader>
          <div className="p-6 pb-2 space-y-5">
            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              Item ini akan dihapus dari analisis aktif.<br/>
              Riwayat dan versi sebelumnya tetap tersimpan dalam Audit Log.
            </p>
            
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 shadow-sm">
              <span className="text-[11px] font-bold text-slate-800 uppercase mb-2 block tracking-wider">
                Tindakan Perbaikan
              </span>
              <p className="text-xs text-slate-700 leading-relaxed">
                {itemToDelete?.text}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Alasan Penghapusan</label>
              <Textarea 
                placeholder="Wajib diisi..." 
                className="text-sm min-h-[100px] border-emerald-500 focus-visible:ring-emerald-500/20 rounded-lg resize-none shadow-sm"
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center gap-3 justify-end sm:justify-end">
            <Button variant="outline" onClick={() => setItemToDelete(null)} className="h-9 px-5 text-xs font-semibold text-slate-600 hover:text-slate-900 border-slate-200">
              Batal
            </Button>
            <Button variant="destructive" onClick={confirmDeleteTindakan} className="h-9 px-6 text-xs font-bold bg-rose-600 hover:bg-rose-700 shadow-sm transition-colors">
              Hapus Tindakan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
