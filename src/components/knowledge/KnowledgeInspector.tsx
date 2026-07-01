import React, { useState } from "react";
import {
  Cpu, FileText, Link2, Clock, ChevronRight, ArrowLeft,
  CheckCircle2, AlertCircle, Loader2, ShieldCheck, BookOpen,
  Copy, Search, Layers
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { KnowledgeDocument } from "@/types/knowledge";
import {
  getExtractionByDocumentId,
  getRelatedDocuments,
  getHistoryByDocumentId,
  getDocumentById,
  mockFolders,
  mockLayers,
} from "@/data/mockKnowledgeData";
import {
  KnowledgeInspectorEmpty,
  KnowledgeExtractionFailed,
  KnowledgeNoExtractionData,
} from "./KnowledgeEmptyStates";
import { toast } from "sonner";

// ─── Tab definitions ─────────────────────────────────────────────────────────

const inspectorTabs = [
  { id: "extraction", label: "Extraction", icon: Cpu },
  { id: "metadata", label: "Metadata", icon: FileText },
  { id: "ontology", label: "Ontology", icon: BookOpen },
  { id: "related", label: "Dokumen Terkait", icon: Link2 },
  { id: "history", label: "History", icon: Clock },
] as const;

type InspectorTabId = typeof inspectorTabs[number]["id"];

// ─── KVP Component ───────────────────────────────────────────────────────────

function KVP({ label, value, subValues }: { label: string; value: string | undefined; subValues?: string[] }) {
  return (
    <div className="flex flex-col gap-0.5 py-2 border-b border-slate-50 last:border-b-0">
      <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{label}</span>
      <div className="text-[11px] font-bold text-slate-800 leading-snug">
        {value || "—"}
      </div>
      {subValues && subValues.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {subValues.map((sv, i) => (
            <span key={i} className="px-1.5 py-0.5 bg-slate-50 border border-slate-100 rounded text-[9px] font-bold text-slate-600">
              {sv}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Inspector Component ─────────────────────────────────────────────────────

interface KnowledgeInspectorProps {
  document: KnowledgeDocument | null;
  onNavigateToPage: (page: number) => void;
  onOpenRelatedDoc: (docId: string) => void;
}

export default function KnowledgeInspector({
  document,
  onNavigateToPage,
  onOpenRelatedDoc,
}: KnowledgeInspectorProps) {
  const [activeTab, setActiveTab] = useState<InspectorTabId>("extraction");

  if (!document) {
    return (
      <div className="w-[380px] border-l border-slate-200 bg-white flex flex-col shrink-0">
        <KnowledgeInspectorEmpty />
      </div>
    );
  }

  const extraction = getExtractionByDocumentId(document.id);
  const relatedDocs = getRelatedDocuments(document.id);
  const history = getHistoryByDocumentId(document.id);

  const folder = mockFolders.find(f => f.id === document.folderId);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}, ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Teks disalin ke clipboard");
  };

  return (
    <div className="w-[380px] border-l border-slate-200 bg-white flex flex-col shrink-0">
      {/* Tab Headers */}
      <div className="flex items-center border-b border-slate-100 shrink-0 h-11 px-1">
        {inspectorTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "h-full px-3 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider transition-all relative",
              activeTab === tab.id ? "text-emerald-700" : "text-slate-400 hover:text-slate-600"
            )}
          >
            <tab.icon className="h-3 w-3" />
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {activeTab === "extraction" && (
          <ExtractionTabContent
            document={document}
            extraction={extraction}
            onNavigateToPage={onNavigateToPage}
            onCopyText={handleCopyText}
          />
        )}
        {activeTab === "metadata" && (
          <MetadataTabContent document={document} />
        )}
        {activeTab === "ontology" && (
          <OntologyTabContent document={document} />
        )}
        {activeTab === "related" && (
          <RelatedTabContent
            relatedDocs={relatedDocs}
            onOpenRelatedDoc={onOpenRelatedDoc}
          />
        )}
        {activeTab === "history" && (
          <HistoryTabContent history={history} />
        )}
      </div>
    </div>
  );
}

// ─── Tab 1: Extraction ───────────────────────────────────────────────────────

function ExtractionTabContent({
  document,
  extraction,
  onNavigateToPage,
  onCopyText,
}: {
  document: KnowledgeDocument;
  extraction: ReturnType<typeof getExtractionByDocumentId>;
  onNavigateToPage: (page: number) => void;
  onCopyText: (text: string) => void;
}) {
  if (document.syncStatus === "failed") {
    return <KnowledgeExtractionFailed onRetry={() => toast.info("Retry extraction dimulai...")} />;
  }

  if (document.syncStatus === "pending" || document.syncStatus === "processing" || document.syncStatus === "extracting") {
    return <KnowledgeNoExtractionData />;
  }

  if (!extraction) {
    return <KnowledgeNoExtractionData />;
  }

  return (
    <div className="p-5 space-y-5">
      {/* Status */}
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-[9px] font-black text-emerald-600 uppercase tracking-widest">
          <CheckCircle2 className="h-3 w-3" /> Extraction Complete
        </span>
        <span className="text-[9px] font-bold text-slate-400">
          Confidence: {extraction.confidence}%
        </span>
      </div>

      {/* Summary */}
      <div className="space-y-1.5">
        <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Extraction Summary</h4>
        <p className="text-[11px] font-medium text-slate-700 leading-relaxed bg-slate-50 border border-slate-100 rounded p-3">
          {extraction.summary}
        </p>
      </div>

      {/* Related Layers */}
      {extraction.relatedLayers.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Related Knowledge Layer</h4>
          <div className="space-y-1">
            {extraction.relatedLayers.map((rl, i) => (
              <div key={i} className="flex items-center gap-1.5 py-1 px-2 bg-emerald-50/50 border border-emerald-100/50 rounded text-[10px] font-bold text-emerald-700">
                <Layers className="h-3 w-3 shrink-0" />
                {rl.layerCode} &gt; {rl.folderCode} {rl.folderName}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Requirements */}
      {extraction.requirements.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Key Requirements</h4>
          <div className="space-y-2">
            {extraction.requirements.map(req => (
              <div key={req.id} className="bg-white border border-slate-100 rounded p-3 space-y-1.5 hover:border-emerald-200 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black text-emerald-600 uppercase tracking-wider">{req.code}</span>
                  {req.confidence && (
                    <span className="text-[8px] font-bold text-slate-400">{Math.round(req.confidence * 100)}%</span>
                  )}
                </div>
                <p className="text-[11px] font-medium text-slate-700 leading-relaxed">{req.text}</p>
                <button
                  onClick={() => onNavigateToPage(req.sourcePage)}
                  className="text-[9px] font-bold text-blue-600 hover:text-blue-800 uppercase tracking-wider flex items-center gap-1 transition-colors"
                >
                  <FileText className="h-2.5 w-2.5" /> Source: page {req.sourcePage}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Safety Controls */}
      {extraction.controls.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Safety Controls</h4>
          <div className="space-y-2">
            {extraction.controls.map(ctrl => (
              <div key={ctrl.id} className="bg-white border border-slate-100 rounded p-3 space-y-1.5 hover:border-emerald-200 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black text-blue-600 uppercase tracking-wider">{ctrl.code}</span>
                </div>
                <p className="text-[11px] font-medium text-slate-700 leading-relaxed">{ctrl.text}</p>
                <button
                  onClick={() => onNavigateToPage(ctrl.sourcePage)}
                  className="text-[9px] font-bold text-blue-600 hover:text-blue-800 uppercase tracking-wider flex items-center gap-1 transition-colors"
                >
                  <FileText className="h-2.5 w-2.5" /> Source: page {ctrl.sourcePage}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Extracted Chunks */}
      <div className="space-y-2">
        <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Extracted Chunks</h4>
        <div className="space-y-2">
          {extraction.chunks.map(chunk => (
            <button
              key={chunk.id}
              onClick={() => onNavigateToPage(chunk.pageStart)}
              className="w-full text-left bg-white border border-slate-100 rounded p-3 space-y-1 hover:border-emerald-200 hover:bg-emerald-50/20 transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">{chunk.id}</span>
                <span className="text-[9px] font-bold text-slate-400">
                  Page {chunk.pageStart}{chunk.pageEnd && chunk.pageEnd > chunk.pageStart ? `–${chunk.pageEnd}` : ""}
                </span>
              </div>
              {chunk.heading && (
                <p className="text-[10px] font-bold text-slate-700">{chunk.heading}</p>
              )}
              <p className="text-[10px] font-medium text-slate-500 leading-relaxed">{chunk.text}</p>
              {chunk.confidence && (
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-400 rounded-full"
                      style={{ width: `${chunk.confidence * 100}%` }}
                    />
                  </div>
                  <span className="text-[8px] font-bold text-slate-400">{Math.round(chunk.confidence * 100)}%</span>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Footer metadata */}
      <div className="border-t border-slate-100 pt-3 space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-bold text-slate-400">Model</span>
          <span className="text-[9px] font-bold text-slate-600">{extraction.modelName || "—"}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-bold text-slate-400">Processed</span>
          <span className="text-[9px] font-bold text-slate-600">
            {extraction.processedAt ? new Date(extraction.processedAt).toLocaleString("id-ID") : "—"}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Tab 2: Metadata ─────────────────────────────────────────────────────────

function MetadataTabContent({ document }: { document: KnowledgeDocument }) {
  return (
    <div className="p-5 space-y-1">
      <KVP label="Nomor Dokumen" value={document.documentNo} />
      <KVP label="Nama Dokumen" value={document.title} />
      <KVP label="Kategori Departemen" value={document.department} />
      <KVP label="Jenis Dokumen" value={document.documentType} />
      <KVP label="Kata Kunci Spesifik" value={(document.keywords || []).join("; ")} />
      <KVP label="Sub Kategori" value={undefined} subValues={document.subCategories} />
      <KVP label="Tujuan Publish" value={document.publishTarget} />
      <KVP
        label="Tanggal Efektif"
        value={document.effectiveDate ? new Date(document.effectiveDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : undefined}
      />
      <KVP label="Revisi" value={document.revision} />
      <KVP label="Status Dokumen" value={document.status.charAt(0).toUpperCase() + document.status.slice(1)} />
      <KVP label="Owner" value={document.owner} />
      <KVP label="Uploaded by" value={document.createdBy} />
      <KVP
        label="Uploaded at"
        value={document.uploadedAt ? new Date(document.uploadedAt).toLocaleString("id-ID") : undefined}
      />
      <KVP
        label="Last indexed at"
        value={document.indexedAt ? new Date(document.indexedAt).toLocaleString("id-ID") : undefined}
      />
      <KVP label="Source System" value={document.sourceSystem} />
      <KVP label="Alasan Pengajuan" value={document.alasanPengajuan} />
    </div>
  );
}

// ─── Tab 3: Related Documents ────────────────────────────────────────────────

function RelatedTabContent({
  relatedDocs,
  onOpenRelatedDoc,
}: {
  relatedDocs: ReturnType<typeof getRelatedDocuments>;
  onOpenRelatedDoc: (docId: string) => void;
}) {
  if (relatedDocs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <Link2 className="h-8 w-8 text-slate-200 mb-3" />
        <p className="text-[11px] font-bold text-slate-400">Tidak ada dokumen terkait.</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="border border-slate-200 rounded overflow-hidden">
        {/* Table Header */}
        <div className="bg-slate-50 px-4 py-2.5 flex items-center gap-4 border-b border-slate-200">
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest w-[90px] shrink-0">Nomor</span>
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex-1">Nama Dokumen</span>
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest w-[100px] shrink-0 text-right">Relation</span>
        </div>
        {/* Table Rows */}
        {relatedDocs.map((rd, i) => (
          <button
            key={i}
            onClick={() => onOpenRelatedDoc(rd.relatedDocumentId)}
            className="w-full flex items-center gap-4 px-4 py-3 border-b border-slate-100 last:border-b-0 hover:bg-emerald-50/30 transition-colors text-left group"
          >
            <span className="text-[10px] font-bold text-emerald-700 w-[90px] shrink-0 group-hover:underline">
              {rd.relatedDocumentNo}
            </span>
            <span className="text-[10px] font-bold text-slate-700 flex-1 truncate">
              {rd.relatedDocumentTitle}
            </span>
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest w-[100px] shrink-0 text-right">
              {rd.relationType}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Tab 4: History ──────────────────────────────────────────────────────────

function HistoryTabContent({ history }: { history: ReturnType<typeof getHistoryByDocumentId> }) {
  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <Clock className="h-8 w-8 text-slate-200 mb-3" />
        <p className="text-[11px] font-bold text-slate-400">Belum ada history.</p>
      </div>
    );
  }

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case "created": return <FileText className="h-3 w-3" />;
      case "uploaded": return <FileText className="h-3 w-3" />;
      case "extraction_completed": return <CheckCircle2 className="h-3 w-3" />;
      case "extraction_failed": return <AlertCircle className="h-3 w-3" />;
      case "approved": return <ShieldCheck className="h-3 w-3" />;
      case "expired": return <AlertCircle className="h-3 w-3" />;
      case "reindexed": return <Cpu className="h-3 w-3" />;
      case "metadata_updated": return <FileText className="h-3 w-3" />;
      case "revision_changed": return <FileText className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case "extraction_completed": return "bg-emerald-100 text-emerald-600 border-emerald-200";
      case "extraction_failed": return "bg-rose-100 text-rose-600 border-rose-200";
      case "approved": return "bg-emerald-100 text-emerald-600 border-emerald-200";
      case "expired": return "bg-amber-100 text-amber-600 border-amber-200";
      case "reindexed": return "bg-blue-100 text-blue-600 border-blue-200";
      default: return "bg-slate-100 text-slate-500 border-slate-200";
    }
  };

  const formatTimestamp = (ts: string) => {
    const d = new Date(ts);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  return (
    <div className="p-5">
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-[13px] top-6 bottom-0 w-px bg-slate-200" />

        <div className="space-y-0">
          {history.map((event, i) => (
            <div key={event.id} className="relative flex gap-3 pb-5 last:pb-0">
              {/* Dot */}
              <div className={cn(
                "h-[26px] w-[26px] rounded-full flex items-center justify-center shrink-0 border z-10",
                getEventColor(event.eventType)
              )}>
                {getEventIcon(event.eventType)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pt-0.5">
                <div className="text-[10px] font-bold text-slate-400 mb-0.5">
                  {formatTimestamp(event.timestamp)}
                </div>
                <p className="text-[11px] font-bold text-slate-700 leading-relaxed">
                  {event.description}
                </p>
                <div className="text-[9px] font-bold text-slate-400 mt-0.5">
                  By: {event.actor}
                </div>
                {event.changes && (
                  <div className="mt-1.5 bg-slate-50 border border-slate-100 rounded p-2">
                    {Object.entries(event.changes).map(([key, val]) => (
                      <div key={key} className="text-[9px] font-bold text-slate-500">
                        <span className="text-slate-400">{key}:</span> {String(val)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
