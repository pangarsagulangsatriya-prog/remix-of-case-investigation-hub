import React from "react";
import { FileText, AlertCircle, RefreshCw, Inbox, Loader2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── No Document Selected ────────────────────────────────────────────────────

export function KnowledgeNoDocSelected() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-10">
      <div className="h-14 w-14 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center mb-5">
        <BookOpen className="h-7 w-7 text-slate-300" />
      </div>
      <h3 className="text-sm font-extrabold text-slate-700 uppercase tracking-tight mb-2">
        Knowledge Repository
      </h3>
      <p className="text-xs font-medium text-slate-400 max-w-[280px] leading-relaxed">
        Pilih dokumen dari panel kiri untuk membuka preview dan melihat detail metadata, hasil ekstraksi, serta dokumen terkait.
      </p>
    </div>
  );
}

// ─── Empty Folder ────────────────────────────────────────────────────────────

export function KnowledgeEmptyFolder() {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
      <div className="h-10 w-10 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center mb-3">
        <Inbox className="h-5 w-5 text-slate-300" />
      </div>
      <p className="text-[11px] font-bold text-slate-500 leading-relaxed max-w-[220px]">
        Belum ada dokumen di folder ini.
      </p>
      <p className="text-[10px] font-medium text-slate-400 mt-1">
        Tambahkan dokumen dari source system atau upload manual.
      </p>
    </div>
  );
}

// ─── Document Loading Skeleton ───────────────────────────────────────────────

export function KnowledgeDocLoading() {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <Loader2 className="h-8 w-8 text-slate-300 animate-spin mb-4" />
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
        Memuat dokumen...
      </p>
    </div>
  );
}

// ─── Viewer Skeleton ─────────────────────────────────────────────────────────

export function KnowledgeViewerSkeleton() {
  return (
    <div className="flex h-full bg-[#f0f2f4] overflow-hidden animate-pulse">
      {/* Left panel skeleton */}
      <div className="w-[320px] border-r border-slate-200 bg-white flex flex-col shrink-0">
        <div className="p-5 border-b border-slate-100 space-y-3">
          <div className="h-9 bg-slate-100 rounded" />
          <div className="h-4 bg-slate-50 rounded w-3/4" />
        </div>
        <div className="p-4 space-y-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-8 bg-slate-50 rounded" />
          ))}
        </div>
      </div>
      {/* Center panel skeleton */}
      <div className="flex-1 flex flex-col">
        <div className="h-14 bg-white border-b border-slate-200 px-6 flex items-center">
          <div className="h-4 bg-slate-100 rounded w-1/3" />
        </div>
        <div className="flex-1 bg-slate-50 p-6">
          <div className="h-full bg-slate-100 rounded" />
        </div>
      </div>
      {/* Right panel skeleton */}
      <div className="w-[380px] border-l border-slate-200 bg-white flex flex-col shrink-0">
        <div className="h-11 border-b border-slate-100 px-4 flex items-center gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-4 bg-slate-100 rounded w-16" />
          ))}
        </div>
        <div className="p-5 space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-1">
              <div className="h-2 bg-slate-50 rounded w-1/4" />
              <div className="h-3 bg-slate-100 rounded w-3/4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Extraction Failed ───────────────────────────────────────────────────────

export function KnowledgeExtractionFailed({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
      <div className="h-10 w-10 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center mb-3">
        <AlertCircle className="h-5 w-5 text-rose-400" />
      </div>
      <h4 className="text-[11px] font-black text-rose-600 uppercase tracking-wider mb-1">
        Extraction Failed
      </h4>
      <p className="text-[10px] font-medium text-slate-500 leading-relaxed max-w-[240px] mb-4">
        Dokumen tetap bisa dibuka, tapi hasil ekstraksi belum tersedia. Periksa format dokumen atau coba ulang.
      </p>
      <div className="flex items-center gap-2">
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="h-7 text-[10px] font-bold uppercase tracking-wider gap-1.5 border-rose-200 text-rose-600 hover:bg-rose-50"
          >
            <RefreshCw className="h-3 w-3" /> Retry Extraction
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── No Extraction Inspector ─────────────────────────────────────────────────

export function KnowledgeNoExtractionData() {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
      <div className="h-10 w-10 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center mb-3">
        <FileText className="h-5 w-5 text-amber-400" />
      </div>
      <p className="text-[11px] font-bold text-slate-500 leading-relaxed">
        Hasil ekstraksi belum tersedia.
      </p>
      <p className="text-[10px] font-medium text-slate-400 mt-1">
        Dokumen sedang dalam antrean proses AI.
      </p>
    </div>
  );
}

// ─── Inspector Empty (no doc selected) ───────────────────────────────────────

export function KnowledgeInspectorEmpty() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 text-center">
      <div className="h-10 w-10 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center mb-3">
        <FileText className="h-5 w-5 text-slate-300" />
      </div>
      <p className="text-[11px] font-bold text-slate-400 leading-relaxed">
        Pilih dokumen untuk melihat detail.
      </p>
    </div>
  );
}

// ─── No Results ─────────────────────────────────────────────────────────────

export function KnowledgeNoResults() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-10">
      <div className="h-10 w-10 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center mb-3">
        <Search className="h-5 w-5 text-slate-300" />
      </div>
      <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-tight mb-2">
        Tidak Ada Hasil
      </h3>
      <p className="text-[10px] font-medium text-slate-400 max-w-[200px] leading-relaxed">
        Pencarian tidak menemukan dokumen yang sesuai dengan filter Anda.
      </p>
    </div>
  );
}
