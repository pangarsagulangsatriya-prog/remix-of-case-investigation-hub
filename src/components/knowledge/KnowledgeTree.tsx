import React, { useState, useMemo } from "react";
import {
  Search, ChevronRight, ChevronDown, Layers, FolderOpen, Folder,
  FileText, Loader2, CheckCircle2, AlertCircle, Clock, XCircle, RefreshCw, FileEdit, History
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  mockLayers, mockFolders,
  getFoldersByLayer
} from "@/data/mockKnowledgeData";
import type { KnowledgeDocument, KnowledgeDocStatus, KnowledgeSyncStatus } from "@/types/knowledge";
import { KnowledgeEmptyFolder, KnowledgeNoResults } from "./KnowledgeEmptyStates";
import { Button } from "@/components/ui/button";

// ─── Status Badge ────────────────────────────────────────────────────────────

function SyncStatusBadge({ status }: { status: KnowledgeSyncStatus }) {
  if (status === "processing" || status === "extracting" || status === "indexing") {
    return (
      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-blue-50 text-blue-600 border border-blue-100 shrink-0">
        <Loader2 className="h-2.5 w-2.5 animate-spin" /> {status}
      </span>
    );
  }
  if (status === "failed") {
    return (
      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-rose-50 text-rose-600 border border-rose-100 shrink-0">
        Failed
      </span>
    );
  }
  if (status === "queued") {
    return (
      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-slate-50 text-slate-500 border border-slate-200 shrink-0">
        Queued
      </span>
    );
  }
  if (status === "need_reindex") {
    return (
      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-amber-50 text-amber-600 border border-amber-100 shrink-0">
        Need Re-index
      </span>
    );
  }
  if (status === "done") {
    return (
      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100 shrink-0">
        Done
      </span>
    );
  }
  return null;
}

// ─── Tree Component ──────────────────────────────────────────────────────────

interface KnowledgeTreeProps {
  selectedDocumentId: string | null;
  onSelectDocument: (doc: KnowledgeDocument) => void;
  filteredDocuments: KnowledgeDocument[];
}

export default function KnowledgeTree({
  selectedDocumentId,
  onSelectDocument,
  filteredDocuments,
}: KnowledgeTreeProps) {
  const [expandedLayers, setExpandedLayers] = useState<string[]>(["L1"]);
  const [expandedFolders, setExpandedFolders] = useState<string[]>(["F1.1", "F1.2"]);

  const toggleLayer = (id: string) => {
    setExpandedLayers(prev =>
      prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id]
    );
  };

  const toggleFolder = (id: string) => {
    setExpandedFolders(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  // Group filtered documents by layer and folder
  const groupedDocs = useMemo(() => {
    const map = new Map<string, KnowledgeDocument[]>();
    filteredDocuments.forEach(doc => {
      if (!map.has(doc.folderId)) {
        map.set(doc.folderId, []);
      }
      map.get(doc.folderId)!.push(doc);
    });
    return map;
  }, [filteredDocuments]);

  // If no results
  if (filteredDocuments.length === 0) {
    return (
      <div className="w-[320px] bg-white border-r border-slate-200 flex flex-col shrink-0">
        <KnowledgeNoResults />
      </div>
    );
  }

  // Determine which layers/folders to show based on filtered documents
  const visibleFolderIds = Array.from(groupedDocs.keys());
  const visibleFolders = mockFolders.filter(f => visibleFolderIds.includes(f.id));
  const visibleLayerIds = Array.from(new Set(visibleFolders.map(f => f.layerId)));
  const visibleLayers = mockLayers.filter(l => visibleLayerIds.includes(l.id));

  return (
    <div className="w-[380px] bg-white border-r border-slate-200 flex flex-col shrink-0">
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3">
        {visibleLayers.map(layer => {
          const isLayerExpanded = expandedLayers.includes(layer.id);
          const layerFolders = visibleFolders.filter(f => f.layerId === layer.id);

          return (
            <div key={layer.id} className="space-y-1">
              {/* Layer Header */}
              <button
                onClick={() => toggleLayer(layer.id)}
                className="w-full flex items-start gap-2 p-2 hover:bg-slate-50 rounded text-left group transition-colors"
              >
                {isLayerExpanded ? (
                  <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-slate-600 mt-0.5 shrink-0" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600 mt-0.5 shrink-0" />
                )}
                <Layers className="h-4 w-4 text-indigo-500 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-extrabold text-slate-800 uppercase tracking-tight">
                    {layer.name}
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                    {layer.folderCount} folder · {layer.documentCount} dokumen · {layer.indexedCount} indexed
                  </div>
                </div>
              </button>

              {/* Folders */}
              {isLayerExpanded && (
                <div className="pl-6 space-y-1">
                  {layerFolders.map(folder => {
                    const isFolderExpanded = expandedFolders.includes(folder.id);
                    const docs = groupedDocs.get(folder.id) || [];
                    
                    return (
                      <div key={folder.id} className="space-y-1">
                        {/* Folder Header */}
                        <button
                          onClick={() => toggleFolder(folder.id)}
                          className="w-full flex items-start gap-2 p-1.5 hover:bg-slate-50 rounded text-left group transition-colors"
                        >
                          {isFolderExpanded ? (
                            <ChevronDown className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-600 shrink-0 mt-0.5" />
                          ) : (
                            <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-600 shrink-0 mt-0.5" />
                          )}
                          {isFolderExpanded ? (
                            <FolderOpen className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                          ) : (
                            <Folder className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="text-[11px] font-bold text-slate-700 truncate">
                              {folder.code} {folder.name}
                            </div>
                            <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                              {folder.documentCount} dokumen · {folder.indexedCount} indexed
                            </div>
                          </div>
                        </button>

                        {/* Documents & Folder Info Card */}
                        {isFolderExpanded && (
                          <div className="pl-6 space-y-1 mb-3">
                            
                            {/* Folder Info Card */}
                            <div className="bg-slate-50 border border-slate-200 rounded p-2.5 mb-2 relative">
                              <div className="absolute -left-[13px] top-4 w-[13px] border-t border-slate-200"></div>
                              <div className="absolute -left-[13px] top-0 bottom-4 border-l border-slate-200"></div>
                              
                              <div className="text-[10px] font-extrabold text-slate-800 uppercase tracking-tight mb-1">
                                {folder.code} {folder.name}
                              </div>
                              <div className="text-[10px] text-slate-500 font-medium leading-relaxed mb-2">
                                {folder.description || "Tidak ada deskripsi."}
                              </div>
                              
                              {folder.semanticKeywords && folder.semanticKeywords.length > 0 && (
                                <div className="mb-3">
                                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Semantic Tags</div>
                                  <div className="flex flex-wrap gap-1">
                                    {folder.semanticKeywords.map(tag => (
                                      <span key={tag} className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[9px] text-slate-600">
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[9px] text-slate-500 mb-2">
                                <div className="flex items-center gap-1">
                                  <FileText className="h-3 w-3" /> {folder.documentCount} total
                                </div>
                                <div className="flex items-center gap-1 text-emerald-600">
                                  <CheckCircle2 className="h-3 w-3" /> {folder.indexedCount} indexed
                                </div>
                                {folder.failedCount > 0 && (
                                  <div className="flex items-center gap-1 text-rose-600">
                                    <XCircle className="h-3 w-3" /> {folder.failedCount} failed
                                  </div>
                                )}
                                {folder.lastSyncedAt && (
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" /> 
                                    {new Date(folder.lastSyncedAt).toLocaleString("id-ID", {
                                      day: "numeric", month: "short", year: "numeric",
                                      hour: "2-digit", minute: "2-digit"
                                    }).replace("pukul", "").trim()}
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-1 pt-2 border-t border-slate-200 mt-2">
                                <Button variant="ghost" size="sm" className="h-6 px-2 text-[9px] font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200">
                                  <FileEdit className="h-3 w-3 mr-1" /> Edit
                                </Button>
                                <Button variant="ghost" size="sm" className="h-6 px-2 text-[9px] font-bold text-blue-600 hover:text-blue-700 bg-white border border-slate-200">
                                  <RefreshCw className="h-3 w-3 mr-1" /> Sync
                                </Button>
                                <Button variant="ghost" size="sm" className="h-6 px-2 text-[9px] font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 ml-auto">
                                  <History className="h-3 w-3 mr-1" /> History
                                </Button>
                              </div>
                            </div>

                            {/* Document List */}
                            {docs.length === 0 ? (
                              <KnowledgeEmptyFolder />
                            ) : (
                              <div className="relative">
                                {/* Connecting lines for documents */}
                                <div className="absolute left-[-13px] top-0 bottom-3 border-l border-slate-200 z-0"></div>
                                
                                {docs.map(doc => {
                                  const isSelected = selectedDocumentId === doc.id;
                                  return (
                                    <div key={doc.id} className="relative z-10 group/doc">
                                      {/* Horizontal connector line */}
                                      <div className="absolute left-[-13px] top-1/2 w-[13px] border-t border-slate-200"></div>
                                      
                                      <button
                                        onClick={() => onSelectDocument(doc)}
                                        className={cn(
                                          "w-full flex items-start gap-2 p-1.5 rounded text-left transition-colors",
                                          isSelected ? "bg-emerald-50 border border-emerald-200" : "hover:bg-slate-50 border border-transparent"
                                        )}
                                      >
                                        <FileText className={cn(
                                          "h-3.5 w-3.5 shrink-0 mt-0.5",
                                          isSelected ? "text-emerald-600" : "text-slate-400 group-hover/doc:text-slate-600"
                                        )} />
                                        <div className="flex-1 min-w-0">
                                          <div className={cn(
                                            "text-[10px] font-bold truncate",
                                            isSelected ? "text-emerald-900" : "text-slate-700"
                                          )}>
                                            {doc.title}
                                          </div>
                                          <div className="flex items-center justify-between mt-1 gap-2">
                                            <div className="text-[9px] text-slate-500 font-medium truncate">
                                              {doc.documentNo}
                                            </div>
                                            <SyncStatusBadge status={doc.syncStatus} />
                                          </div>
                                        </div>
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
