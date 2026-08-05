import React, { useState } from "react";
import { Loader2, AlertCircle, AlertTriangle, Lightbulb, Clock, CheckCircle2, RotateCcw, X, FileText, ChevronLeft, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useReadiness, ReadinessRun } from "@/hooks/useReadiness";
import { cn } from "@/lib/utils";

interface EvidenceReadinessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EvidenceReadinessModal({ open, onOpenChange }: EvidenceReadinessModalProps) {
  const { runs, currentStatus, triggerManualCheck, latestRun, isOutdated } = useReadiness();
  const [view, setView] = useState<"RESULT" | "HISTORY" | "ARCHIVE">("RESULT");
  const [selectedRun, setSelectedRun] = useState<ReadinessRun | null>(null);

  if (!open) return null;

  const handleClose = () => {
    onOpenChange(false);
    setView("RESULT");
  };

  const handleRecheck = () => {
    triggerManualCheck();
    setView("RESULT");
  };

  // If in history view, show list of runs
  const renderHistory = () => (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="px-6 py-4 bg-white border-b border-slate-100 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8 -ml-2 text-slate-500 hover:text-slate-900" onClick={() => setView("RESULT")}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-[13px] font-black text-slate-900 uppercase tracking-widest">
            RIWAYAT PEMERIKSAAN
          </h3>
        </div>
        <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">{runs.length} kali pemeriksaan</span>
      </div>
      <div className="flex-1 overflow-auto p-6 space-y-4">
        {runs.map((run) => (
          <div key={run.id} className="bg-white border border-slate-200 rounded-md p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h4 className="text-[12px] font-black text-slate-900 uppercase tracking-widest">PEMERIKSAAN #{run.runNumber}</h4>
                <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                  <Calendar className="h-3 w-3" />
                  {new Date(run.completedAt || run.startedAt).toLocaleString("id-ID", {
                    day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
                  })} WIB
                </div>
              </div>
              <div className={cn(
                "px-2.5 py-1 rounded border text-[10px] font-bold uppercase tracking-widest",
                run.status === "NOT_READY" ? "bg-rose-50 text-rose-700 border-rose-200" :
                run.status === "NEEDS_ATTENTION" ? "bg-amber-50 text-amber-700 border-amber-200" :
                run.status === "READY" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                "bg-slate-50 text-slate-600 border-slate-200"
              )}>
                {run.status === "NOT_READY" ? "Belum Siap" :
                 run.status === "NEEDS_ATTENTION" ? "Perlu Perhatian" :
                 run.status === "READY" ? "Siap Dianalisis" : "Sedang Diperiksa"}
              </div>
            </div>

            <div className="flex items-center gap-4 text-[11px] text-slate-600 font-medium">
              <div className="flex items-center gap-1.5"><FileText className="h-3.5 w-3.5 text-slate-400" /> {run.evidenceSnapshot.totalFiles} file diperiksa</div>
              <div className="flex items-center gap-1.5"><AlertCircle className="h-3.5 w-3.5 text-rose-400" /> {run.findings.filter(f=>f.severity==='CRITICAL').length} temuan kritis</div>
              <div className="flex items-center gap-1.5"><AlertTriangle className="h-3.5 w-3.5 text-amber-400" /> {run.findings.filter(f=>f.severity!=='CRITICAL').length} temuan lain</div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
              <div className="text-[10px] text-slate-500 font-medium flex items-center gap-1.5">
                <span className="h-5 w-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[9px] uppercase">{run.triggeredByUser.name.substring(0, 2)}</span>
                Dijalankan oleh {run.triggeredByUser.name} · {run.triggeredByUser.role}
              </div>
              {run.status !== "CHECKING" && (
                <Button variant="outline" size="sm" className="h-7 text-[10px] font-bold uppercase tracking-widest" onClick={() => { setSelectedRun(run); setView("ARCHIVE"); }}>
                  Lihat Hasil
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderRunResult = (run: ReadinessRun | null, isArchive: boolean = false) => {
    if (!run) return null;

    if (run.status === "CHECKING") {
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-12 space-y-6 animate-in fade-in duration-500">
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full animate-pulse" />
            <div className="h-16 w-16 bg-white border border-slate-200 rounded-full shadow-lg flex items-center justify-center relative z-10">
              <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
            </div>
          </div>
          <div className="text-center space-y-2">
            <h4 className="text-[15px] font-black text-slate-900 uppercase tracking-widest">Memeriksa kualitas dan kelengkapan evidence...</h4>
            <p className="text-[12px] text-slate-500 font-medium">{run.evidenceSnapshot.totalFiles} file sedang diperiksa</p>
          </div>
          <div className="w-full max-w-sm space-y-3 pt-8">
            <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Memeriksa status pemrosesan file
            </div>
            <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Memeriksa kualitas data
            </div>
            <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium opacity-50">
              <Loader2 className="h-4 w-4 text-slate-400 animate-spin" /> Memeriksa kelengkapan konteks
            </div>
          </div>
        </div>
      );
    }

    const criticalCount = run.findings.filter(f => f.severity === "CRITICAL").length;
    const isReady = run.status === "READY";
    const isNeedsAttention = run.status === "NEEDS_ATTENTION";
    const isNotReady = run.status === "NOT_READY";

    return (
      <div className="flex-1 overflow-auto flex flex-col bg-slate-50/50">
        {isArchive && (
          <div className="px-6 py-3 bg-amber-50 border-b border-amber-100 flex items-center gap-2 text-[11px] text-amber-800 font-bold uppercase tracking-widest sticky top-0 z-10">
            <Button variant="ghost" size="icon" className="h-6 w-6 -ml-2 text-amber-600 hover:text-amber-900 hover:bg-amber-100/50" onClick={() => setView("HISTORY")}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            Arsip Hasil Pemeriksaan #{run.runNumber}
          </div>
        )}

        <div className="p-6 md:p-8 space-y-6 max-w-4xl mx-auto w-full">
          {/* Outdated Warning */}
          {(!isArchive && isOutdated) && (
            <div className="bg-slate-100 border border-slate-300 rounded-md p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-slate-700 font-black text-[11px] uppercase tracking-widest">
                  <RotateCcw className="h-4 w-4" />
                  HASIL PERLU DIPERBARUI
                </div>
                <p className="text-[12px] text-slate-600 font-medium">Evidence telah berubah sejak pemeriksaan terakhir.</p>
              </div>
              <Button variant="default" className="shrink-0 text-[10px] font-black uppercase tracking-widest bg-slate-900 text-white h-9" onClick={handleRecheck}>
                Jalankan Pemeriksaan Baru
              </Button>
            </div>
          )}

          {/* Progress Tracker (only if history view and there's a previous run) */}
          {isArchive && run.previousRunId && (
            <div className="bg-white border border-slate-200 rounded-md p-4 shadow-sm flex items-center justify-between">
              <div>
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">PERUBAHAN DARI PEMERIKSAAN #{run.runNumber - 1}</div>
                <div className="flex items-center gap-4 text-[11px] font-medium text-slate-700">
                  <div className="flex items-center gap-1"><span className="text-emerald-600 font-bold px-1.5 py-0.5 bg-emerald-50 rounded">Membaik</span></div>
                  <div>Temuan aktif: <span className="font-bold">4 → 3</span></div>
                  <div>Temuan kritis: <span className="font-bold">1 → {criticalCount}</span></div>
                </div>
              </div>
            </div>
          )}

          {/* Summary Block */}
          <div className={cn(
            "rounded-md border p-6 shadow-sm",
            isNotReady ? "bg-rose-50/50 border-rose-200" :
            isNeedsAttention ? "bg-amber-50/50 border-amber-200" :
            "bg-emerald-50/50 border-emerald-200"
          )}>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 space-y-3">
                <h2 className={cn(
                  "text-[16px] font-black uppercase tracking-widest",
                  isNotReady ? "text-rose-700" :
                  isNeedsAttention ? "text-amber-700" : "text-emerald-700"
                )}>
                  {isNotReady ? "BELUM SIAP" : isNeedsAttention ? "PERLU PERHATIAN" : "SIAP DIANALISIS"}
                </h2>
                
                <p className={cn(
                  "text-[13px] font-medium leading-relaxed max-w-xl",
                  isNotReady ? "text-rose-900/80" :
                  isNeedsAttention ? "text-amber-900/80" : "text-emerald-900/80"
                )}>
                  {isNotReady ? "Evidence utama belum dapat diproses. Hasil analisis berisiko memiliki informasi yang tidak lengkap." :
                   isNeedsAttention ? "Evidence dapat digunakan untuk analisis awal. Beberapa kekurangan dapat menurunkan ketepatan hasil analisis." :
                   "Evidence utama berhasil diproses dan memiliki konteks yang cukup untuk analisis AI yang mendalam."}
                </p>

                {run.findings.length > 0 && (
                  <div className="flex flex-wrap gap-3 pt-3">
                    <span className="text-[11px] font-bold bg-white/60 border border-black/10 px-3 py-1.5 rounded text-slate-800">{run.findings.length} temuan aktif</span>
                    <span className={cn("text-[11px] font-bold bg-white/60 border px-3 py-1.5 rounded", criticalCount > 0 ? "border-rose-200 text-rose-700" : "border-black/10 text-slate-800")}>{criticalCount} kritis</span>
                    <span className="text-[11px] font-bold bg-white/60 border border-black/10 px-3 py-1.5 rounded text-slate-800">{run.findings.length - criticalCount} perlu dilengkapi</span>
                  </div>
                )}
              </div>
              
              <div className="w-px bg-black/10 hidden md:block" />
              
              <div className="md:w-48 space-y-2">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">EVIDENCE YANG DIPERIKSA</div>
                <div className="text-[18px] font-bold text-slate-900">{run.evidenceSnapshot.totalFiles} <span className="text-[12px] font-medium text-slate-500">file</span></div>
                <div className="text-[11px] text-slate-600 font-medium space-y-1 pt-1">
                  <div className="flex justify-between"><span>Berhasil diproses</span> <span className="font-bold text-emerald-600">{run.evidenceSnapshot.completedFiles}</span></div>
                  <div className="flex justify-between"><span>Gagal diproses</span> <span className="font-bold text-rose-600">{run.evidenceSnapshot.errorFiles}</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* Findings List */}
          {run.findings.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-widest pb-2 border-b border-slate-200">Rincian Temuan</h3>
              
              <div className="grid gap-4">
                {run.findings.map(finding => (
                  <div key={finding.id} className="bg-white border border-slate-200 rounded-md p-5 shadow-sm space-y-4">
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "mt-0.5 shrink-0",
                        finding.severity === "CRITICAL" ? "text-rose-500" :
                        finding.severity === "WARNING" ? "text-amber-500" : "text-blue-500"
                      )}>
                        {finding.severity === "CRITICAL" ? <AlertCircle className="h-5 w-5" /> : 
                         finding.severity === "WARNING" ? <AlertTriangle className="h-5 w-5" /> : 
                         <Lightbulb className="h-5 w-5" />}
                      </div>
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded",
                            finding.severity === "CRITICAL" ? "bg-rose-100 text-rose-700" :
                            finding.severity === "WARNING" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                          )}>
                            {finding.severity === "CRITICAL" ? "KRITIS" : finding.severity === "WARNING" ? "PERLU DILENGKAPI" : "SARAN PENINGKATAN"}
                          </span>
                        </div>
                        <h4 className="text-[14px] font-bold text-slate-900 leading-snug">{finding.title}</h4>
                      </div>
                    </div>

                    <div className="pl-8 space-y-4">
                      {finding.relatedFileName && (
                        <div>
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">File</div>
                          <div className="text-[12px] font-medium text-slate-800 bg-slate-50 px-2.5 py-1.5 rounded inline-flex border border-slate-200">{finding.relatedFileName}</div>
                        </div>
                      )}
                      <div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Kondisi</div>
                        <div className="text-[12px] text-slate-700 leading-relaxed font-medium">{finding.description}</div>
                      </div>
                      <div>
                        <div className="text-[10px] font-black text-rose-400/80 uppercase tracking-widest mb-1">Dampak</div>
                        <div className="text-[12px] text-rose-900/80 leading-relaxed font-medium">{finding.impact}</div>
                      </div>
                      <div className="bg-blue-50/50 p-3 rounded-md border border-blue-100">
                        <div className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Saran Perbaikan</div>
                        <div className="text-[12px] text-blue-900/80 leading-relaxed font-medium">{finding.suggestion}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 md:p-8 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-[960px] max-h-full rounded-xl shadow-2xl flex flex-col overflow-hidden relative">
        
        {/* Header */}
        <div className="h-14 px-6 border-b border-slate-100 flex items-center justify-between bg-white shrink-0 z-10 relative">
          <div className="flex items-center gap-3">
            <h3 className="text-[12px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
              ANALISIS KESIAPAN EVIDENCE
              <span className="text-slate-300">/</span>
              <span className="text-slate-500 font-medium text-[11px]">
                {view === "HISTORY" ? "Riwayat Pemeriksaan" : 
                 view === "ARCHIVE" ? `Pemeriksaan #${selectedRun?.runNumber}` :
                 latestRun ? `Pemeriksaan #${latestRun.runNumber}` : "Pemeriksaan Baru"}
              </span>
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {view === "RESULT" && runs.length > 0 && latestRun?.status !== "CHECKING" && (
              <Button variant="ghost" size="sm" className="h-8 text-[10px] font-bold uppercase tracking-widest text-slate-600 hover:text-slate-900" onClick={() => setView("HISTORY")}>
                Riwayat Pemeriksaan
              </Button>
            )}
            <div className="w-px h-4 bg-slate-200 mx-1" />
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-900" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content Body */}
        {view === "HISTORY" ? renderHistory() : renderRunResult(view === "ARCHIVE" ? selectedRun : latestRun, view === "ARCHIVE")}

        {/* Footer Actions (Only for RESULT view if not checking) */}
        {(view === "RESULT" && latestRun?.status !== "CHECKING") && (
          <div className="p-5 bg-white border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
            <Button variant="outline" className="h-10 px-6 text-[11px] font-bold uppercase tracking-widest text-slate-600 border-slate-200" onClick={handleClose}>
              Tutup
            </Button>
            <Button className="h-10 px-6 text-[11px] font-bold uppercase tracking-widest bg-slate-900 text-white hover:bg-slate-800" onClick={handleRecheck}>
              <RotateCcw className="h-3.5 w-3.5 mr-2" />
              Periksa Ulang
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
