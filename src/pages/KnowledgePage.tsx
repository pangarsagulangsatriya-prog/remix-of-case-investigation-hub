import React, { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import KnowledgeTree from "@/components/knowledge/KnowledgeTree";
import KnowledgeDocViewer from "@/components/knowledge/KnowledgeDocViewer";
import KnowledgeInspector from "@/components/knowledge/KnowledgeInspector";
import type { KnowledgeDocument, KnowledgeDocStatus, KnowledgeSyncStatus } from "@/types/knowledge";
import { getDocumentById, mockLayers, mockFolders, mockDocuments, mockExtractions } from "@/data/mockKnowledgeData";
import { Search, Filter, ArrowLeftRight, Settings, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function KnowledgePage() {
  const navigate = useNavigate();
  const [selectedDocument, setSelectedDocument] = useState<KnowledgeDocument | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filters
  const [filterLayer, setFilterLayer] = useState<string>("all");
  const [filterFolder, setFilterFolder] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterIndexedOnly, setFilterIndexedOnly] = useState<boolean>(false);
  
  const [previousDocId, setPreviousDocId] = useState<string | null>(null);

  const handleSelectDocument = useCallback((doc: KnowledgeDocument) => {
    setSelectedDocument(doc);
    setCurrentPage(1);
    setPreviousDocId(null);
  }, []);

  const handleNavigateToPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleOpenRelatedDoc = useCallback((docId: string) => {
    const doc = getDocumentById(docId);
    if (doc) {
      if (selectedDocument) {
        setPreviousDocId(selectedDocument.id);
      }
      setSelectedDocument(doc);
      setCurrentPage(1);
    }
  }, [selectedDocument]);

  const handleBackToPrevious = useCallback(() => {
    if (previousDocId) {
      const doc = getDocumentById(previousDocId);
      if (doc) {
        setSelectedDocument(doc);
        setCurrentPage(1);
        setPreviousDocId(null);
      }
    }
  }, [previousDocId]);

  // Derived filtered dropdown options
  const availableFolders = useMemo(() => {
    if (filterLayer === "all") return mockFolders;
    return mockFolders.filter(f => f.layerId === filterLayer);
  }, [filterLayer]);

  // Handle Layer change (reset folder if needed)
  const handleLayerChange = (layerId: string) => {
    setFilterLayer(layerId);
    if (layerId !== "all" && filterFolder !== "all") {
      const folder = mockFolders.find(f => f.id === filterFolder);
      if (folder && folder.layerId !== layerId) {
        setFilterFolder("all");
      }
    }
  };

  // Search & Filter Logic
  const filteredDocuments = useMemo(() => {
    return mockDocuments.filter(doc => {
      // 1. Layer filter
      if (filterLayer !== "all") {
        const folder = mockFolders.find(f => f.id === doc.folderId);
        if (folder?.layerId !== filterLayer) return false;
      }
      
      // 2. Folder filter
      if (filterFolder !== "all") {
        if (doc.folderId !== filterFolder) return false;
      }
      
      // 3. Status filter
      if (filterStatus !== "all") {
        if (doc.syncStatus !== filterStatus) return false;
      }
      
      // 4. Indexed Only filter
      if (filterIndexedOnly) {
        if (doc.syncStatus !== "done") return false;
      }
      
      // 5. Search Query
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const folder = mockFolders.find(f => f.id === doc.folderId);
        const layer = folder ? mockLayers.find(l => l.id === folder.layerId) : null;
        const extraction = mockExtractions.find(e => e.documentId === doc.id);
        
        const matchTitle = doc.title.toLowerCase().includes(q);
        const matchDocNo = doc.documentNo.toLowerCase().includes(q);
        const matchLayer = layer?.name.toLowerCase().includes(q);
        const matchFolder = folder?.name.toLowerCase().includes(q);
        const matchFolderDesc = folder?.description?.toLowerCase().includes(q);
        const matchKeywords = doc.semanticKeywords?.some(k => k.toLowerCase().includes(q)) || folder?.semanticKeywords?.some(k => k.toLowerCase().includes(q));
        const matchAliases = doc.searchAliases?.some(a => a.toLowerCase().includes(q));
        const matchRelatedConcepts = folder?.relatedConcepts?.some(r => r.toLowerCase().includes(q));
        
        let matchExtracted = false;
        if (extraction) {
          matchExtracted = 
            extraction.summary.toLowerCase().includes(q) ||
            extraction.requirements.some(r => r.text.toLowerCase().includes(q)) ||
            extraction.chunks.some(c => c.text.toLowerCase().includes(q));
        }

        if (!(matchTitle || matchDocNo || matchLayer || matchFolder || matchFolderDesc || matchKeywords || matchAliases || matchRelatedConcepts || matchExtracted)) {
          return false;
        }
      }
      
      return true;
    });
  }, [filterLayer, filterFolder, filterStatus, filterIndexedOnly, searchQuery]);

  return (
    <AppLayout hideHeader={false}>
      <div className="flex flex-col h-[calc(100vh-44px)] bg-[#f0f2f4]">
        {/* Top Header */}
        <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shrink-0 shadow-sm z-20">
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight">
              Knowledge Repository
            </h1>
            <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
              5 Layer · HSE Knowledge
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            {previousDocId && (
              <button
                onClick={handleBackToPrevious}
                className="flex items-center gap-1.5 text-[10px] font-bold text-blue-600 hover:text-blue-800 uppercase tracking-wider transition-colors mr-2"
              >
                ← Kembali ke dokumen sebelumnya
              </button>
            )}
            
            <Button
              onClick={() => navigate("/knowledge/sync-history")}
              className="h-8 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold uppercase tracking-wider px-3 shadow-sm rounded gap-1.5"
            >
              <ArrowLeftRight className="h-3.5 w-3.5" />
              Sync Utility
            </Button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white border-b border-slate-200 px-4 py-2 shrink-0 flex items-center gap-2 shadow-[0_1px_3px_rgba(0,0,0,0.02)] z-10">
          <div className="relative w-64 shrink-0">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari dokumen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8 bg-slate-50 border border-slate-200 rounded pl-8 pr-3 text-[11px] font-bold focus:ring-1 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all outline-none placeholder:text-slate-400"
            />
          </div>
          
          <div className="h-4 w-px bg-slate-200 mx-1" />
          
          <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar flex-1">
            <select
              value={filterLayer}
              onChange={(e) => handleLayerChange(e.target.value)}
              className="h-8 bg-slate-50 border border-slate-200 rounded px-2.5 text-[11px] font-bold text-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 min-w-[140px]"
            >
              <option value="all">Semua Layer</option>
              {mockLayers.map(l => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
            
            <select
              value={filterFolder}
              onChange={(e) => setFilterFolder(e.target.value)}
              className="h-8 bg-slate-50 border border-slate-200 rounded px-2.5 text-[11px] font-bold text-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 min-w-[180px]"
            >
              <option value="all">Semua Folder</option>
              {availableFolders.map(f => (
                <option key={f.id} value={f.id}>{f.code} {f.name}</option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="h-8 bg-slate-50 border border-slate-200 rounded px-2.5 text-[11px] font-bold text-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20"
            >
              <option value="all">Semua Status</option>
              <option value="done">Done</option>
              <option value="processing">Processing</option>
              <option value="queued">Queued</option>
              <option value="failed">Failed</option>
              <option value="need_reindex">Need Re-index</option>
            </select>

            <label className="flex items-center gap-1.5 ml-2 cursor-pointer group select-none">
              <input
                type="checkbox"
                checked={filterIndexedOnly}
                onChange={(e) => setFilterIndexedOnly(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
              <span className="text-[11px] font-bold text-slate-600 group-hover:text-slate-900 transition-colors">
                Indexed Only
              </span>
            </label>
          </div>
        </div>

        {/* 3 Panel Layout */}
        <div className="flex flex-1 overflow-hidden relative">
          <KnowledgeTree
            selectedDocumentId={selectedDocument?.id || null}
            onSelectDocument={handleSelectDocument}
            filteredDocuments={filteredDocuments}
          />
          <KnowledgeDocViewer
            document={selectedDocument}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
          <KnowledgeInspector
            document={selectedDocument}
            onNavigateToPage={handleNavigateToPage}
            onOpenRelatedDoc={handleOpenRelatedDoc}
          />
        </div>
      </div>
    </AppLayout>
  );
}
