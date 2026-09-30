import React, { useState } from "react";
import { AlertTriangle, MapPin, Building2, Calendar, Clock, History, Layers, FileX, Pencil, Trash2, Plus, Check, X, Eye, BarChart3 } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";

export function SafetyAlertPoster() {
  const [kronologis, setKronologis] = useState([
    { id: 1, title: "Kronologis (31 Agu 2026 | 13:50 WITA):", text: "Operator mengoperasikan BMCDZ 116 untuk brushing di WMP 21 sejak pukul 13:05 WITA. Pada dorongan ke-6 saat unit bergerak mundur, track sisi kiri amblas dan unit langsung dihentikan. Evakuasi unit dilakukan pukul 14:50 WITA, nihil cedera.", icon: "History" },
    { id: 2, title: "Penyebab Utama:", text: "Area kerja memiliki titik lembek bekas parit aliran air menuju WMP, namun belum ada patok boundary dari tim Survey sebagai acuan batas area kerja. Potensi amblas tidak teridentifikasi pada inspeksi awal shift.", icon: "Layers" },
    { id: 3, title: "Kelemahan Prosedur:", text: "Belum ada MPRP aktivitas pembuatan saluran WMP 21 maupun Do's & Don'ts aktivitas brushing. Operator tidak mengisi FTW awal shift dan pengawas tidak memastikannya; temuan inspeksi juga belum dimasukkan ke report Beats.", icon: "FileX" },
  ]);

  const [tindakan, setTindakan] = useState([
    { id: 1, text: "Pastikan setiap aktifitas pekerjaan telah dibuatkan DOP" },
    { id: 2, text: "Pasang boundary/ patok area kerja untuk setiap area kerja dan area yang berpotensi amblas" },
    { id: 3, text: "Pastikan setiap pembuatan saluran WMP telah dibuatkan MPRP" },
    { id: 4, text: "Lakukan assemen setiap lokasi baru yang akan dilakukan pekerjaan" },
    { id: 5, text: "Terpasang CCTV di area aktivitas pekerjaan WMP" }
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
    setDetailPanelTitle("Detail Analisis: " + title);
    setDetailPanelOpen(true);
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
          <div className="flex-1 py-4 pl-6 pr-4">
            <div className="bg-[#ed1c24] text-white text-[11px] font-bold px-2 py-0.5 inline-block mb-1.5 uppercase tracking-wider">
              SAFETY ALERT:
            </div>
            <h1 className="text-2xl font-black uppercase tracking-wide leading-tight">
              TRACK DOZER AMBLAS SAAT BRUSHING DI AREA TITIK LEMBEK
            </h1>
          </div>
          <div className="bg-[#ed1c24] w-[260px] flex items-center justify-center transform -skew-x-12 translate-x-4 border-l-4 border-white/20">
            <div className="transform skew-x-12 flex items-center gap-2">
              <AlertTriangle className="h-7 w-7 text-white fill-white" />
              <span className="text-2xl font-black uppercase tracking-wider">NEAR MISS</span>
            </div>
          </div>
        </div>
        
        {/* Sub header */}
        <div className="bg-slate-100 flex items-center text-[10px] font-bold text-slate-600 px-6 py-1.5 border-b border-slate-300">
          <div className="flex w-1/3">
            <span className="w-24 text-slate-400">NO. ALERT</span>
            <span className="text-black">[SA-004/IX/2026]</span>
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
                <button 
                  onClick={() => {
                    const newId = kronologis.length > 0 ? Math.max(...kronologis.map(k => k.id)) + 1 : 1;
                    setKronologis([...kronologis, { id: newId, title: "Data Baru:", text: "Deskripsi...", icon: "History" }]);
                    setEditingKronologisId(newId);
                    setEditKronologisData({ title: "Data Baru:", text: "Deskripsi..." });
                  }}
                  className="text-slate-400 hover:text-blue-500 p-1 rounded"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              
              <div className="flex flex-col gap-3">
                {kronologis.map(item => (
                  <div key={item.id} className="group relative flex gap-3 items-start border border-transparent hover:border-slate-200 hover:bg-slate-50/50 p-1.5 -mx-1.5 rounded transition-colors">
                    {editingKronologisId === item.id ? (
                      <div className="flex-1">
                        <input 
                          value={editKronologisData.title}
                          onChange={(e) => setEditKronologisData({ ...editKronologisData, title: e.target.value })}
                          className={inputStyle}
                          placeholder="Title..."
                        />
                        <textarea
                          value={editKronologisData.text}
                          onChange={(e) => setEditKronologisData({ ...editKronologisData, text: e.target.value })}
                          className={textareaStyle}
                          rows={3}
                          placeholder="Description..."
                        />
                        <div className="flex items-center gap-2 mt-2">
                          <button onClick={() => {
                            setKronologis(kronologis.map(k => k.id === item.id ? { ...k, ...editKronologisData } : k));
                            setEditingKronologisId(null);
                          }} className="text-emerald-600 hover:bg-emerald-50 p-1 rounded">
                            <Check className="h-4 w-4" />
                          </button>
                          <button onClick={() => setEditingKronologisId(null)} className="text-slate-400 hover:bg-slate-100 p-1 rounded">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="bg-slate-100 p-2 rounded shrink-0 border border-slate-200">
                          {renderIcon(item.icon)}
                        </div>
                        <div className="text-[10px] text-slate-700 leading-tight pr-6">
                          <span className="font-bold text-black block mb-0.5">{item.title}</span>
                          {item.text}
                        </div>
                        
                        {/* Action Icons */}
                        <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 p-0.5 rounded shadow-none border border-slate-100">
                          <button onClick={() => handleOpenDetail(item.title)} className="p-1 text-slate-400 hover:text-indigo-500 rounded">
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => {
                            setEditingKronologisId(item.id);
                            setEditKronologisData({ title: item.title, text: item.text });
                          }} className="p-1 text-slate-400 hover:text-blue-500 rounded">
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => setKronologis(kronologis.filter(k => k.id !== item.id))} className="p-1 text-slate-400 hover:text-rose-500 rounded">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </>
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
                <button 
                  onClick={() => {
                    const newId = tindakan.length > 0 ? Math.max(...tindakan.map(t => t.id)) + 1 : 1;
                    setTindakan([...tindakan, { id: newId, text: "Tindakan perbaikan baru..." }]);
                    setEditingTindakanId(newId);
                    setEditTindakanText("Tindakan perbaikan baru...");
                  }}
                  className="text-slate-400 hover:text-blue-500 p-1 rounded"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              
              <div className="flex flex-col gap-2.5">
                {tindakan.map((item, idx) => (
                  <div key={item.id} className="group relative flex overflow-hidden rounded-md shadow-none border border-slate-200">
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
                              setTindakan(tindakan.map(t => t.id === item.id ? { ...t, text: editTindakanText } : t));
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
                          <span className="pr-12">{item.text}</span>
                          {/* Action Icons */}
                          <div className="absolute top-1/2 -translate-y-1/2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-50/90 p-0.5 rounded border border-slate-200 shadow-none">
                            <button onClick={() => handleOpenDetail("Tindakan Perbaikan " + (idx + 1))} className="p-1 text-slate-400 hover:text-indigo-500 rounded">
                              <Eye className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => {
                              setEditingTindakanId(item.id);
                              setEditTindakanText(item.text);
                            }} className="p-1 text-slate-400 hover:text-blue-500 rounded">
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => setTindakan(tindakan.filter(t => t.id !== item.id))} className="p-1 text-slate-400 hover:text-rose-500 rounded">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
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
              <div className="group relative bg-slate-100 border border-slate-300 rounded p-3 flex gap-4 items-start shadow-none">
                <AlertTriangle className="h-10 w-10 text-[#ed1c24] fill-[#ed1c24]/10 shrink-0 mt-1" />
                <div className="flex flex-col w-full">
                  {editingImbauan ? (
                    <div className="flex flex-col gap-2 w-full">
                      <input 
                        value={editImbauanData.title}
                        onChange={(e) => setEditImbauanData({ ...editImbauanData, title: e.target.value })}
                        className={inputStyle}
                        placeholder="Title..."
                      />
                      <textarea 
                        value={editImbauanData.text}
                        onChange={(e) => setEditImbauanData({ ...editImbauanData, text: e.target.value })}
                        className={textareaStyle}
                        rows={3}
                        placeholder="Content..."
                      />
                      <input 
                        value={editImbauanData.subtext}
                        onChange={(e) => setEditImbauanData({ ...editImbauanData, subtext: e.target.value })}
                        className={inputStyle}
                        placeholder="Subtext..."
                      />
                      <div className="flex items-center gap-2 mt-1">
                        <button onClick={() => { setImbauan(editImbauanData); setEditingImbauan(false); }} className="bg-emerald-500 text-white text-xs px-3 py-1.5 rounded font-semibold hover:bg-emerald-600 transition-colors">
                          Simpan
                        </button>
                        <button onClick={() => setEditingImbauan(false)} className="bg-slate-200 text-slate-600 text-xs px-3 py-1.5 rounded font-semibold hover:bg-slate-300 transition-colors">
                          Batal
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <span className="text-[11px] font-black text-[#ed1c24] uppercase mb-1">{imbauan.title}</span>
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
                        <button 
                          onClick={() => {
                            setEditingImbauan(true);
                            setEditImbauanData(imbauan);
                          }} 
                          className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-white rounded shadow-none border border-transparent hover:border-slate-200"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </section>

            {/* 6. LESSON LEARNED (CRUD) */}
            <section>
              <h3 className="text-xs font-bold mb-2 uppercase">6. LESSON LEARNED</h3>
              <div className="group relative bg-[#161616] text-white rounded p-4 text-center shadow-none border-b-4 border-[#ed1c24]">
                {editingLesson ? (
                  <div className="flex flex-col gap-2">
                    <input 
                      value={editLessonData.title}
                      onChange={(e) => setEditLessonData({ ...editLessonData, title: e.target.value })}
                      className="w-full text-[12px] font-black uppercase text-center bg-[#252525] border border-slate-700 rounded px-2 py-1.5 outline-none focus:border-yellow-400 text-yellow-400 shadow-none focus:shadow-none focus:ring-0"
                      placeholder="Title..."
                    />
                    <textarea 
                      value={editLessonData.text}
                      onChange={(e) => setEditLessonData({ ...editLessonData, text: e.target.value })}
                      className="w-full text-[10px] text-center bg-[#252525] border border-slate-700 rounded px-2 py-1.5 outline-none focus:border-blue-500 text-slate-300 shadow-none focus:shadow-none focus:ring-0"
                      rows={2}
                      placeholder="Content..."
                    />
                    <div className="flex items-center justify-center gap-2 mt-1">
                      <button onClick={() => { setLesson(editLessonData); setEditingLesson(false); }} className="bg-emerald-500/20 text-emerald-400 text-xs px-3 py-1.5 rounded font-semibold hover:bg-emerald-500/30 transition-colors border border-emerald-500/30">
                        Simpan
                      </button>
                      <button onClick={() => setEditingLesson(false)} className="bg-slate-700/50 text-slate-300 text-xs px-3 py-1.5 rounded font-semibold hover:bg-slate-700 transition-colors">
                        Batal
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <span className="block text-[12px] font-black uppercase mb-1.5 tracking-wide text-yellow-400 pr-12">{lesson.title}</span>
                    <span className="block text-[10px] text-slate-300 leading-relaxed font-medium px-4 whitespace-pre-wrap">
                      {lesson.text}
                    </span>
                    
                    {/* Action Icons */}
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={() => handleOpenDetail("Lesson Learned")} className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-[#252525] rounded border border-transparent hover:border-slate-700">
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <button 
                        onClick={() => {
                          setEditingLesson(true);
                          setEditLessonData(lesson);
                        }} 
                        className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-[#252525] rounded border border-transparent hover:border-slate-700"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Detail Analysis Panel (Sheet) */}
      <Sheet open={detailPanelOpen} onOpenChange={setDetailPanelOpen}>
        <SheetContent className="w-[500px] sm:max-w-none border-l shadow-none p-0 flex flex-col h-full bg-slate-50">
          <SheetHeader className="p-6 border-b border-slate-200 bg-white">
            <SheetTitle className="text-lg font-black uppercase flex items-center gap-2 text-slate-800">
              <BarChart3 className="h-5 w-5 text-indigo-500" />
              {detailPanelTitle}
            </SheetTitle>
            <SheetDescription className="text-xs">
              Isi data detail panel akan dibuat nanti (placeholder).
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-auto p-6 flex items-center justify-center">
            <div className="text-center text-slate-400 text-sm font-medium">
              [ Konten Analisis AI Belum Tersedia ]
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
