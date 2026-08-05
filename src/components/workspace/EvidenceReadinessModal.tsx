import React, { useState } from "react";
import { Loader2, AlertCircle, AlertTriangle, Lightbulb, CheckCircle2, RotateCcw, X, ChevronLeft, Calendar, ShieldCheck, ChevronDown, ChevronRight, Check, ArrowRight, Activity, ArrowRightCircle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useReadiness, ReadinessRun } from "@/hooks/useReadiness";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

interface EvidenceReadinessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProceedToAnalysis: () => void;
}

export function EvidenceReadinessModal({ open, onOpenChange, onProceedToAnalysis }: EvidenceReadinessModalProps) {
  const { runs, triggerManualCheck, latestRun, isOutdated, overrideAnalysis } = useReadiness();
  const [view, setView] = useState<"RESULT" | "HISTORY" | "ARCHIVE" | "OVERRIDE">("RESULT");
  const [selectedRun, setSelectedRun] = useState<ReadinessRun | null>(null);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [overrideAck, setOverrideAck] = useState(false);
  const [overrideNote, setOverrideNote] = useState("");

  if (!open) return null;

  const handleClose = () => {
    onOpenChange(false);
    setView("RESULT");
    setExpandedItems({});
    setOverrideAck(false);
    setOverrideNote("");
  };

  const handleRecheck = () => {
    triggerManualCheck();
    setView("RESULT");
    setExpandedItems({});
  };

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }));
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
      case "FULFILLED": return "text-emerald-700 bg-emerald-50 border-emerald-200";
      case "BROKEN": return "text-rose-700 bg-rose-50 border-rose-200";
      case "MISSING": 
      case "NEEDS_VERIFICATION": return "text-amber-700 bg-amber-50 border-amber-200";
      default: return "text-slate-700 bg-slate-50 border-slate-200";
    }
  };
  
  const getStatusIconColor = (status: string) => {
    switch (status) {
      case "FULFILLED": return "text-emerald-600 bg-emerald-100";
      case "BROKEN": return "text-rose-600 bg-rose-100";
      case "MISSING": 
      case "NEEDS_VERIFICATION": return "text-amber-600 bg-amber-100";
      default: return "text-slate-600 bg-slate-100";
    }
  };

  // ----------------------------------------------------------------------
  // UI: HISTORY VIEW
  // ----------------------------------------------------------------------
  const renderHistory = () => (
    <div className="flex flex-col h-full bg-[#f8fafc]">
      <div className="px-6 py-4 bg-white border-b border-slate-100 flex items-center justify-between shrink-0 shadow-sm z-10 relative">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8 -ml-2 text-slate-400 hover:text-slate-800 transition-colors" onClick={() => setView("RESULT")}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h3 className="text-[12px] font-semibold text-slate-800 uppercase tracking-widest">
            Riwayat Pemeriksaan
          </h3>
        </div>
        <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
          {runs.length} Rekaman
        </span>
      </div>
      <div className="flex-1 overflow-auto p-6 space-y-4">
        {runs.map((run) => {
          const fulfilled = run.results.filter(c => c.status === "FULFILLED").length;
          const broken = run.results.filter(c => c.status === "BROKEN").length;
          const missing = run.results.filter(c => c.status === "MISSING").length;
          const needsVerif = run.results.filter(c => c.status === "NEEDS_VERIFICATION").length;
          
          const isNotReady = run.status === "NOT_READY";
          const isNeedsAttention = run.status === "NEEDS_ATTENTION";
          
          return (
            <div key={run.id} className="group bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all rounded-xl p-5 space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <h4 className="text-[12px] font-bold text-slate-800 uppercase tracking-widest">Pemeriksaan #{run.runNumber}</h4>
                  </div>
                  <div className={cn(
                    "text-[14px] font-bold mt-1",
                    isNotReady ? "text-rose-700" : isNeedsAttention ? "text-amber-700" : "text-emerald-700"
                  )}>
                    {isNotReady ? "BELUM SIAP" : isNeedsAttention ? "PERLU DILENGKAPI" : "SIAP DIANALISIS"}
                  </div>
                </div>
                <div className="text-right text-[11px] text-slate-500 font-medium">
                  <div className="flex items-center gap-1.5 justify-end mb-1">
                    <span className="h-5 w-5 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-[9px] uppercase">{run.triggeredByUser.name.substring(0, 2)}</span>
                    {run.triggeredByUser.name}
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 justify-end">
                    <Calendar className="h-3 w-3" />
                    {new Date(run.completedAt || run.startedAt).toLocaleString("id-ID", {
                      day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
                    })} WIB
                  </div>
                </div>
              </div>

              <div className="text-[12px] text-slate-600 font-medium bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-1">
                <div>Terpenuhi: <span className="font-bold text-slate-800">{fulfilled}</span></div>
                <div>Bermasalah: <span className="font-bold text-slate-800">{broken}</span></div>
                <div>Belum ada: <span className="font-bold text-slate-800">{missing}</span></div>
                <div>Perlu verifikasi: <span className="font-bold text-slate-800">{needsVerif}</span></div>
              </div>

              <div className="pt-2 flex justify-end">
                {run.status !== "CHECKING" && (
                  <Button variant="ghost" size="sm" className="h-8 text-[11px] font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100" onClick={() => { setSelectedRun(run); setView("ARCHIVE"); }}>
                    Lihat Hasil <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
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
  // UI: OVERRIDE VIEW
  // ----------------------------------------------------------------------
  const renderOverride = () => {
    if (!latestRun) return null;
    const missingReq = latestRun.results.filter(r => r.level === "REQUIRED" && r.status === "MISSING");
    const brokenReq = latestRun.results.filter(r => r.level === "REQUIRED" && r.status === "BROKEN");

    return (
      <div className="flex-1 overflow-auto flex flex-col bg-slate-50">
        <div className="p-8 md:p-12 max-w-2xl mx-auto w-full space-y-8 animate-in slide-in-from-bottom-4 duration-300">
          <div className="text-center space-y-5">
            <div className="mx-auto w-16 h-16 bg-white border border-rose-100 shadow-sm text-rose-500 flex items-center justify-center rounded-2xl mb-4 relative">
              <div className="absolute inset-0 bg-rose-400/20 blur-xl rounded-full" />
              <AlertTriangle className="h-8 w-8 relative z-10" strokeWidth={2.5} />
            </div>
            <h2 className="text-[20px] font-bold text-slate-900 tracking-tight uppercase">
              LANJUTKAN DENGAN EVIDENCE YANG BELUM LENGKAP?
            </h2>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm space-y-5">
            
            {missingReq.length > 0 && (
              <div>
                <h4 className="text-[12px] font-bold text-slate-800 mb-2">Requirement wajib yang belum terpenuhi:</h4>
                <ul className="list-disc pl-5 text-[13px] text-slate-600 space-y-1">
                  {missingReq.map(r => <li key={r.id}>{r.label}</li>)}
                </ul>
              </div>
            )}
            
            {brokenReq.length > 0 && (
              <div className="pt-2">
                <h4 className="text-[12px] font-bold text-slate-800 mb-2">Requirement bermasalah:</h4>
                <ul className="list-disc pl-5 text-[13px] text-slate-600 space-y-1">
                  {brokenReq.map(r => <li key={r.id}>{r.label}</li>)}
                </ul>
              </div>
            )}

            <div className="pt-4 border-t border-slate-100">
              <label className="flex items-start gap-3.5 cursor-pointer group">
                <div className="mt-0.5">
                  <Checkbox 
                    checked={overrideAck} 
                    onCheckedChange={(c) => setOverrideAck(c === true)} 
                    className="data-[state=checked]:bg-rose-600 data-[state=checked]:border-rose-600"
                  />
                </div>
                <span className="text-[13px] font-medium text-slate-700 leading-snug group-hover:text-slate-900 transition-colors">
                  Saya memahami bahwa analisis akan menggunakan evidence yang belum memenuhi requirement standar.
                </span>
              </label>
            </div>
            
            <div className="space-y-2 pt-3">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                Catatan alasan melanjutkan (Opsional)
              </div>
              <Textarea 
                value={overrideNote}
                onChange={(e) => setOverrideNote(e.target.value)}
                placeholder="Tuliskan justifikasi Anda di sini..."
                className="w-full text-[13px] min-h-[90px] border-slate-200 focus-visible:ring-rose-500 resize-none transition-all"
              />
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 pt-4">
            <Button variant="ghost" className="h-12 px-6 font-semibold text-[13px] text-slate-600 hover:bg-slate-200/50 hover:text-slate-900 transition-colors" onClick={() => setView("RESULT")}>
              Kembali Lengkapi Evidence
            </Button>
            <Button 
              variant="default" 
              className="h-12 px-8 font-semibold text-[13px] bg-slate-900 hover:bg-slate-800 text-white shadow-md hover:shadow-lg transition-all disabled:opacity-50"
              disabled={!overrideAck}
              onClick={() => {
                overrideAnalysis(overrideNote, overrideAck);
                onProceedToAnalysis();
                onOpenChange(false);
              }}
            >
              Tetap Lanjutkan
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // ----------------------------------------------------------------------
  // UI: RESULT / ARCHIVE VIEW
  // ----------------------------------------------------------------------
  const renderRunResult = (run: ReadinessRun | null, isArchive: boolean = false) => {
    if (!run) return null;

    if (run.status === "CHECKING") {
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-12 space-y-8 bg-slate-50/50">
          <div className="relative flex items-center justify-center h-24 w-24">
            <div className="absolute inset-0 bg-blue-500/10 rounded-full animate-ping duration-1000" />
            <div className="absolute inset-2 bg-blue-500/20 rounded-full animate-pulse" />
            <div className="h-14 w-14 bg-white border border-slate-100 rounded-full shadow-sm flex items-center justify-center relative z-10">
              <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
            </div>
          </div>
          <div className="text-center space-y-2">
            <h4 className="text-[16px] font-semibold text-slate-900 tracking-tight">Memeriksa Kesiapan Evidence</h4>
            <p className="text-[13px] text-slate-500 font-medium">Memetakan file dengan Standard Evidence Requirements...</p>
          </div>
        </div>
      );
    }

    const fulfilled = run.results.filter(c => c.status === "FULFILLED").length;
    const broken = run.results.filter(c => c.status === "BROKEN").length;
    const missing = run.results.filter(c => c.status === "MISSING").length;
    const needsVerif = run.results.filter(c => c.status === "NEEDS_VERIFICATION").length;
    
    const isReady = run.status === "READY";
    const isNeedsAttention = run.status === "NEEDS_ATTENTION";
    const isNotReady = run.status === "NOT_READY";

    return (
      <div className="flex-1 overflow-auto flex flex-col bg-[#f8fafc]">
        {isArchive && (
          <div className="px-6 py-3 bg-white border-b border-slate-200 flex items-center justify-between sticky top-0 z-10 shadow-sm">
            <div className="flex items-center gap-2 text-[12px] text-slate-700 font-bold uppercase tracking-widest">
              <Button variant="ghost" size="icon" className="h-7 w-7 -ml-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100" onClick={() => setView("HISTORY")}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              Arsip Pemeriksaan #{run.runNumber}
            </div>
            <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(run.completedAt || run.startedAt).toLocaleString("id-ID", {
                day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
              })}
            </div>
          </div>
        )}

        <div className="p-6 md:p-10 space-y-8 max-w-4xl mx-auto w-full animate-in fade-in duration-500">
          
          {/* Outdated Warning */}
          {(!isArchive && isOutdated) && (
            <div className="bg-amber-50/80 border border-amber-200/60 rounded-xl p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between shadow-sm">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-[12px] uppercase tracking-widest">
                  <RotateCcw className="h-4 w-4 text-amber-600" />
                  Pemeriksaan Perlu Diperbarui
                </div>
                <p className="text-[13px] text-amber-700/90 font-medium">Evidence telah berubah sejak pemeriksaan terakhir. Segera periksa ulang untuk hasil pemetaan terbaru.</p>
              </div>
              <Button variant="default" className="shrink-0 text-[11px] font-semibold tracking-wide bg-amber-600 hover:bg-amber-700 text-white h-9 px-6 rounded-lg shadow-sm" onClick={handleRecheck}>
                Periksa Ulang
              </Button>
            </div>
          )}

          {/* Progress Tracker */}
          {(!isArchive && run.previousRunId && !isOutdated) && (() => {
            const prevRun = runs.find(r => r.id === run.previousRunId);
            if (prevRun) {
              const prevCompleted = prevRun.results.filter(c => c.status === "FULFILLED").length;
              const currCompleted = fulfilled;
              const diff = currCompleted - prevCompleted;
              const label = diff > 0 ? "Membaik" : diff < 0 ? "Menurun" : "Tidak Berubah";
              
              const iconColor = diff > 0 ? "text-emerald-500" : diff < 0 ? "text-rose-500" : "text-slate-400";
              const bgColor = diff > 0 ? "bg-emerald-50 border-emerald-100" : diff < 0 ? "bg-rose-50 border-rose-100" : "bg-slate-50 border-slate-100";

              return (
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                    <Activity className="h-4 w-4" /> PERKEMBANGAN
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[11px] text-slate-400 font-medium mb-1">Pemeriksaan #{prevRun.runNumber}</span>
                      <div className="text-[14px] font-semibold text-slate-800">
                        {prevCompleted} dari {prevRun.results.length} terpenuhi
                      </div>
                    </div>
                    
                    <div className="flex-1 px-8 flex items-center justify-center relative">
                      <div className="absolute w-full border-t border-dashed border-slate-300" />
                      <div className={cn("relative z-10 px-3 py-1.5 rounded-full border text-[11px] font-bold flex flex-col items-center", bgColor, iconColor)}>
                        {label}
                      </div>
                    </div>

                    <div className="flex flex-col text-right">
                      <span className="text-[11px] text-slate-400 font-medium mb-1">Pemeriksaan #{run.runNumber}</span>
                      <div className="text-[14px] font-semibold text-slate-800">
                        {currCompleted} dari {run.results.length} terpenuhi
                      </div>
                    </div>
                  </div>
                  {diff > 0 && (
                     <div className="text-[12px] text-emerald-600 font-medium text-center border-t border-slate-100 pt-3">
                       {diff} requirement berhasil dilengkapi
                     </div>
                  )}
                </div>
              );
            }
            return null;
          })()}

          {/* Golden Gate Summary */}
          <div className="text-center space-y-5 py-2">
            <h2 className={cn(
              "text-[28px] font-black uppercase tracking-widest",
              isNotReady ? "text-rose-700" : isNeedsAttention ? "text-amber-700" : "text-emerald-700"
            )}>
              {isNotReady ? "BELUM SIAP" : isNeedsAttention ? "PERLU DILENGKAPI" : "SIAP DIANALISIS"}
            </h2>
            
            <div className="text-[15px] font-medium text-slate-800 space-y-1">
              <div>{fulfilled} dari {run.results.length} requirement terpenuhi</div>
              {broken > 0 && <div className="text-rose-600">{broken} requirement bermasalah</div>}
              {missing > 0 && <div className="text-amber-600">{missing} requirement belum ada</div>}
              {needsVerif > 0 && <div className="text-amber-600">{needsVerif} requirement perlu verifikasi</div>}
            </div>
            
            <p className="text-[14px] leading-relaxed max-w-2xl mx-auto text-slate-600 bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
              {isNotReady ? "Beberapa evidence wajib belum tersedia atau belum dapat digunakan. Lengkapi requirement berikut agar hasil analisis lebih kuat." :
               isNeedsAttention ? "Beberapa evidence yang disarankan belum terpenuhi. Anda dapat melengkapinya atau langsung melanjutkan analisis." :
               "Seluruh Standard Evidence Requirements telah terpenuhi."}
            </p>
          </div>

          {/* Requirement Rows */}
          <div className="space-y-4 max-w-3xl mx-auto">
            {run.results.map(item => {
              const isExpanded = expandedItems[item.id];
              const statusColor = getStatusColor(item.status);
              const iconColor = getStatusIconColor(item.status);
              
              return (
                <div key={item.id} className="group bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm transition-all">
                  <div 
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 cursor-pointer hover:bg-slate-50 transition-colors gap-4"
                    onClick={() => toggleExpand(item.id)}
                  >
                    <div className="flex-1 space-y-2">
                      <div className="text-[14px] font-bold text-slate-800 uppercase tracking-wide">
                        {item.label}
                      </div>
                      <div className={cn(
                        "inline-flex items-center text-[10px] font-bold uppercase tracking-widest rounded-md px-2 py-0.5 border bg-slate-50",
                        item.level === "REQUIRED" ? "text-slate-800 border-slate-300" :
                        item.level === "RECOMMENDED" ? "text-slate-500 border-slate-200" : "text-slate-400 border-slate-100"
                      )}>
                        {translateLevel(item.level)}
                      </div>
                    </div>
                    
                    <div className="flex-shrink-0 flex items-center gap-4">
                      <div className="flex flex-col items-end gap-1.5">
                        <div className={cn("text-[11px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md border", statusColor)}>
                          {translateStatus(item.status)}
                        </div>
                        {item.matchedFiles.length > 0 && !isExpanded && (
                           <div className="text-[11px] text-slate-500 font-medium line-clamp-1 max-w-[200px]">
                             {item.matchedFiles[0].name}
                           </div>
                        )}
                      </div>
                      <div className="text-slate-400">
                        {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-5 bg-slate-50/80 border-t border-slate-100 space-y-5">
                      
                      {item.matchedFiles.length > 0 ? (
                        <div className="space-y-2">
                          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">File yang ditemukan</div>
                          <div className="flex flex-col gap-2">
                            {item.matchedFiles.map(mf => (
                              <div key={mf.id} className="inline-flex items-center gap-2 text-[13px] font-semibold text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm">
                                <FileText className="h-4 w-4 text-slate-400" />
                                {mf.name}
                                {mf.processingStatus === "ERROR" && <span className="text-[10px] text-white bg-rose-500 px-1.5 py-0.5 rounded ml-2">ERROR</span>}
                                {mf.processingStatus === "DONE" && <span className="text-[10px] text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded ml-2">DONE</span>}
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="text-[13px] font-medium text-slate-600 bg-white border border-slate-200 px-4 py-2.5 rounded-lg shadow-sm">
                            Belum ada file yang memenuhi requirement ini.
                          </div>
                        </div>
                      )}

                      {item.impact && (
                        <div className="space-y-1.5">
                          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Dampak</div>
                          <div className="text-[13px] font-medium text-slate-700 leading-relaxed bg-white border border-slate-100 p-3 rounded-lg shadow-sm">
                            {item.impact}
                          </div>
                        </div>
                      )}
                      
                      {item.recommendation && (
                        <div className="space-y-1.5">
                          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Rekomendasi</div>
                          <div className="text-[13px] font-semibold text-slate-800 leading-relaxed bg-white border border-slate-200 p-3 rounded-lg shadow-sm">
                            {item.recommendation}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 md:p-6 transition-all duration-300">
      <div className="bg-white w-full max-w-[1000px] max-h-[95vh] rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] flex flex-col overflow-hidden relative border border-slate-200/50 animate-in zoom-in-[0.98] duration-300">
        
        {/* Header */}
        <div className="h-16 px-6 border-b border-slate-100 flex items-center justify-between bg-white shrink-0 z-10 relative shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-slate-900 flex items-center justify-center shadow-sm">
              <ShieldCheck className="h-4 w-4 text-white" />
            </div>
            <div className="flex flex-col">
              <h3 className="text-[13px] font-bold text-slate-900 uppercase tracking-widest leading-none">
                EVIDENCE GOLDEN GATE
              </h3>
              <span className="text-[10px] font-medium text-slate-500 mt-0.5">Pemeriksaan Kesiapan Analisis</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-slate-500 font-semibold text-[11px] uppercase tracking-widest hidden sm:block bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
              {view === "HISTORY" ? "Riwayat Pemeriksaan" : 
               view === "ARCHIVE" ? `Arsip #${selectedRun?.runNumber}` :
               view === "OVERRIDE" ? "Konfirmasi Analisis" :
               latestRun ? `Pemeriksaan #${latestRun.runNumber}` : "Pemeriksaan Baru"}
            </div>
            
            {view === "RESULT" && runs.length > 0 && latestRun?.status !== "CHECKING" && (
              <>
                <div className="w-px h-5 bg-slate-200" />
                <Button variant="ghost" size="sm" className="h-8 text-[11px] font-bold uppercase tracking-widest text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors" onClick={() => setView("HISTORY")}>
                  Riwayat
                </Button>
              </>
            )}
            
            <div className="w-px h-5 bg-slate-200" />
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content Body */}
        {view === "HISTORY" ? renderHistory() : 
         view === "OVERRIDE" ? renderOverride() : 
         renderRunResult(view === "ARCHIVE" ? selectedRun : latestRun, view === "ARCHIVE")}

        {/* Footer Actions */}
        {(view === "RESULT" && latestRun?.status !== "CHECKING") && (
          <div className="px-6 py-4 bg-white border-t border-slate-100 flex items-center justify-between gap-3 shrink-0 shadow-[0_-5px_15px_-10px_rgba(0,0,0,0.05)]">
            <Button variant="ghost" className="h-10 px-6 text-[12px] font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors" onClick={handleClose}>
              Tutup
            </Button>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" className="h-10 px-6 text-[12px] font-semibold text-slate-700 bg-white shadow-sm hover:bg-slate-50 border-slate-200 transition-all" onClick={handleRecheck}>
                <RotateCcw className="h-3.5 w-3.5 mr-2 text-slate-400" /> Periksa Ulang
              </Button>
              
              <Button 
                className="h-10 px-8 text-[12px] font-semibold tracking-wide bg-slate-900 text-white shadow-md hover:shadow-lg hover:bg-slate-800 transition-all group" 
                onClick={() => {
                  const isNotReady = latestRun.status === "NOT_READY";
                  if (isNotReady) {
                    setView("OVERRIDE");
                  } else {
                    onProceedToAnalysis();
                    onOpenChange(false);
                  }
                }}
              >
                Lanjutkan ke Analysis <ArrowRightCircle className="h-4 w-4 ml-2 opacity-70 group-hover:opacity-100 transition-opacity" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
