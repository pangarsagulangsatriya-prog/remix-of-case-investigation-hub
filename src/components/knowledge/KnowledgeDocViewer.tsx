import React, { useState } from "react";
import {
  ZoomIn, ZoomOut, RotateCw, Download, Maximize2, ExternalLink,
  ChevronLeft, ChevronRight, FileText
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { KnowledgeDocument } from "@/types/knowledge";
import { KnowledgeNoDocSelected } from "./KnowledgeEmptyStates";
import { mockFolders, mockLayers } from "@/data/mockKnowledgeData";

interface KnowledgeDocViewerProps {
  document: KnowledgeDocument | null;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export default function KnowledgeDocViewer({
  document,
  currentPage,
  onPageChange,
}: KnowledgeDocViewerProps) {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);

  if (!document) {
    return (
      <div className="flex-1 flex flex-col bg-[#f0f2f4]">
        <KnowledgeNoDocSelected />
      </div>
    );
  }

  const totalPages = document.pageCount || 1;

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 250));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50));
  const handleFitWidth = () => setZoom(100);
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);
  const handlePrevPage = () => onPageChange(Math.max(1, currentPage - 1));
  const handleNextPage = () => onPageChange(Math.min(totalPages, currentPage + 1));

  // Breadcrumb
  const folder = mockFolders.find(f => f.id === document.folderId);
  const layer = folder ? mockLayers.find(l => l.id === folder.layerId) : null;

  // Format effective date
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  return (
    <div className="flex-1 flex flex-col bg-[#f0f2f4] min-w-0">
      {/* Document Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 shrink-0">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
            {layer?.name || "—"}
          </span>
          <ChevronRight className="h-2.5 w-2.5 text-slate-300" />
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
            {folder ? `${folder.code} ${folder.name}` : "—"}
          </span>
          <ChevronRight className="h-2.5 w-2.5 text-slate-300" />
          <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider truncate">
            {document.title}
          </span>
        </div>

        {/* Title */}
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-sm font-extrabold text-slate-900 truncate">
              {document.title}
            </h2>
            <div className="flex flex-wrap items-center gap-2 mt-0.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                {document.documentNo}
              </span>
              <span className="text-[10px] text-slate-300">·</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                PDF
              </span>
              <span className="text-[10px] text-slate-300">·</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {totalPages} halaman
              </span>
              {document.revision && (
                <>
                  <span className="text-[10px] text-slate-300">·</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Rev {document.revision}
                  </span>
                </>
              )}
              {document.effectiveDate && (
                <>
                  <span className="text-[10px] text-slate-300">·</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Efektif {formatDate(document.effectiveDate)}
                  </span>
                </>
              )}
              {document.lastSyncedAt && (
                <>
                  <span className="text-[10px] text-slate-300">·</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Synced {
                      new Date(document.lastSyncedAt).toLocaleString("id-ID", {
                        day: "numeric", month: "short", year: "numeric",
                        hour: "2-digit", minute: "2-digit"
                      }).replace("pukul", "").trim()
                    }
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white border-b border-slate-100 px-4 py-1.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1">
          <button onClick={handleZoomOut} className="h-7 w-7 rounded hover:bg-slate-100 flex items-center justify-center transition-colors" title="Zoom Out">
            <ZoomOut className="h-3.5 w-3.5 text-slate-500" />
          </button>
          <span className="text-[10px] font-bold text-slate-500 w-10 text-center">{zoom}%</span>
          <button onClick={handleZoomIn} className="h-7 w-7 rounded hover:bg-slate-100 flex items-center justify-center transition-colors" title="Zoom In">
            <ZoomIn className="h-3.5 w-3.5 text-slate-500" />
          </button>
          <div className="h-4 w-px bg-slate-200 mx-1" />
          <button onClick={handleFitWidth} className="h-7 px-2 rounded hover:bg-slate-100 flex items-center justify-center transition-colors" title="Fit Width">
            <Maximize2 className="h-3.5 w-3.5 text-slate-500" />
          </button>
          <button onClick={handleRotate} className="h-7 w-7 rounded hover:bg-slate-100 flex items-center justify-center transition-colors" title="Rotate">
            <RotateCw className="h-3.5 w-3.5 text-slate-500" />
          </button>
        </div>

        {/* Page Nav */}
        <div className="flex items-center gap-1.5">
          <button onClick={handlePrevPage} disabled={currentPage <= 1} className="h-7 w-7 rounded hover:bg-slate-100 flex items-center justify-center transition-colors disabled:opacity-30">
            <ChevronLeft className="h-3.5 w-3.5 text-slate-500" />
          </button>
          <span className="text-[10px] font-bold text-slate-600">
            {currentPage} / {totalPages}
          </span>
          <button onClick={handleNextPage} disabled={currentPage >= totalPages} className="h-7 w-7 rounded hover:bg-slate-100 flex items-center justify-center transition-colors disabled:opacity-30">
            <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button className="h-7 w-7 rounded hover:bg-slate-100 flex items-center justify-center transition-colors" title="Download">
            <Download className="h-3.5 w-3.5 text-slate-500" />
          </button>
          <button className="h-7 w-7 rounded hover:bg-slate-100 flex items-center justify-center transition-colors" title="Open Source">
            <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
          </button>
        </div>
      </div>

      {/* PDF Viewer Area */}
      <div className="flex-1 overflow-auto p-6 flex items-start justify-center">
        <div
          className="bg-white shadow-lg border border-slate-200 rounded-sm overflow-hidden transition-transform duration-200"
          style={{
            transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
            transformOrigin: "top center",
          }}
        >
          {/* Simulated PDF Page */}
          <div className="w-[595px] min-h-[842px] p-12 relative">
            {/* Page watermark */}
            <div className="absolute top-4 right-4 text-[9px] font-bold text-slate-300 uppercase tracking-widest">
              Page {currentPage} of {totalPages}
            </div>

            {/* Simulated document content */}
            <div className="space-y-6">
              {/* Header block */}
              <div className="border-b-2 border-slate-800 pb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-emerald-600 rounded flex items-center justify-center">
                      <span className="text-[8px] font-black text-white uppercase">BC</span>
                    </div>
                    <div>
                      <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">PT Berau Coal</div>
                      <div className="text-[9px] font-bold text-slate-400">HSE Department</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[9px] font-black text-slate-500 uppercase tracking-wider">
                      {document.documentNo}
                    </div>
                    <div className="text-[9px] font-bold text-slate-400">
                      Rev {document.revision || "0"} · {formatDate(document.effectiveDate)}
                    </div>
                  </div>
                </div>
                <h1 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                  {document.title}
                </h1>
              </div>

              {/* Simulated body content */}
              {currentPage === 1 ? (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2">1. Pendahuluan</h2>
                    <div className="space-y-2">
                      <div className="h-3 bg-slate-100 rounded w-full" />
                      <div className="h-3 bg-slate-100 rounded w-11/12" />
                      <div className="h-3 bg-slate-100 rounded w-10/12" />
                      <div className="h-3 bg-slate-100 rounded w-full" />
                      <div className="h-3 bg-slate-100 rounded w-9/12" />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2">2. Ruang Lingkup</h2>
                    <div className="space-y-2">
                      <div className="h-3 bg-slate-100 rounded w-full" />
                      <div className="h-3 bg-slate-100 rounded w-10/12" />
                      <div className="h-3 bg-slate-100 rounded w-11/12" />
                      <div className="h-3 bg-slate-100 rounded w-8/12" />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2">3. Referensi</h2>
                    <div className="space-y-2">
                      <div className="h-3 bg-slate-100 rounded w-9/12" />
                      <div className="h-3 bg-slate-100 rounded w-10/12" />
                      <div className="h-3 bg-slate-100 rounded w-7/12" />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2">4. Definisi</h2>
                    <div className="space-y-2">
                      <div className="h-3 bg-slate-100 rounded w-full" />
                      <div className="h-3 bg-slate-100 rounded w-11/12" />
                      <div className="h-3 bg-slate-100 rounded w-10/12" />
                      <div className="h-3 bg-slate-100 rounded w-full" />
                      <div className="h-3 bg-slate-100 rounded w-9/12" />
                      <div className="h-3 bg-slate-100 rounded w-10/12" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2">
                      {currentPage + 3}. Bagian {currentPage}
                    </h2>
                    <div className="space-y-2">
                      {[...Array(8)].map((_, i) => (
                        <div key={i} className="h-3 bg-slate-100 rounded" style={{ width: `${70 + Math.random() * 30}%` }} />
                      ))}
                    </div>
                  </div>
                  {/* Simulated table */}
                  <div className="border border-slate-200 rounded overflow-hidden">
                    <div className="bg-slate-50 px-3 py-2 border-b border-slate-200">
                      <div className="flex gap-6">
                        <div className="h-2.5 bg-slate-200 rounded w-20" />
                        <div className="h-2.5 bg-slate-200 rounded w-32" />
                        <div className="h-2.5 bg-slate-200 rounded w-24" />
                      </div>
                    </div>
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="px-3 py-2 border-b border-slate-100 last:border-b-0">
                        <div className="flex gap-6">
                          <div className="h-2.5 bg-slate-50 rounded w-20" />
                          <div className="h-2.5 bg-slate-50 rounded w-32" />
                          <div className="h-2.5 bg-slate-50 rounded w-24" />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-3 bg-slate-100 rounded" style={{ width: `${65 + Math.random() * 35}%` }} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Page footer */}
            <div className="absolute bottom-6 left-12 right-12 flex items-center justify-between border-t border-slate-200 pt-3">
              <span className="text-[8px] font-bold text-slate-400">{document.documentNo} · {document.title}</span>
              <span className="text-[8px] font-bold text-slate-400">Halaman {currentPage} dari {totalPages}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
