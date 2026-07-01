// Knowledge Repository — Type Definitions

export type KnowledgeSyncStatus =
  | "idle"
  | "queued"
  | "fetching"
  | "extracting"
  | "indexing"
  | "done"
  | "failed"
  | "need_reindex";

export type KnowledgeLayer = {
  id: string;
  code: string;          // "L1", "L2"
  name: string;          // "Layer 1"
  order: number;
  description?: string;
  semanticKeywords?: string[];
  searchBoostTerms?: string[];
  relatedConcepts?: string[];
  folderCount: number;
  documentCount: number;
  indexedCount: number;
  lastSyncedAt?: string;
};

export type KnowledgeFolder = {
  id: string;
  layerId: string;
  code: string;          // "1.1"
  name: string;          // "HIRA"
  description?: string;
  semanticKeywords?: string[];
  searchBoostTerms?: string[];
  relatedConcepts?: string[];
  aliases?: string[];
  documentCount: number;
  indexedCount: number;
  failedCount: number;
  needReindexCount: number;
  lastSyncedAt?: string;
};

export type KnowledgeDocStatus = "draft" | "active" | "expired";

export type KnowledgeDocument = {
  id: string;
  folderId: string;
  documentNo: string;    // "S-SFO-07"
  title: string;
  fileName: string;
  fileUrl: string;
  fileType: "pdf";
  department?: string;
  documentType?: string;
  keywords?: string[];
  subCategories?: string[];
  publishTarget?: string;
  effectiveDate?: string;
  revision?: string;
  status: KnowledgeDocStatus;
  sourceSystem?: string;
  owner?: string;
  createdBy?: string;
  uploadedAt?: string;
  updatedAt?: string;
  indexedAt?: string;
  pageCount?: number;
  alasanPengajuan?: string;
  
  // New Sync & Semantic Fields
  lastSyncedAt?: string;
  syncStatus: KnowledgeSyncStatus;
  semanticKeywords?: string[];
  searchAliases?: string[];
  detectedTopics?: string[];
  semanticConfidence?: number;
};

export type KnowledgeRequirement = {
  id: string;
  code: string;          // "REQ-001"
  text: string;
  sourcePage: number;
  confidence?: number;
};

export type KnowledgeControl = {
  id: string;
  code: string;          // "CTRL-001"
  text: string;
  sourcePage: number;
  confidence?: number;
};

export type KnowledgeChunk = {
  id: string;
  documentId: string;
  pageStart: number;
  pageEnd?: number;
  heading?: string;
  text: string;
  summary?: string;
  confidence?: number;
};

export type KnowledgeExtraction = {
  id: string;
  documentId: string;
  summary: string;
  relatedLayers: { layerCode: string; folderCode: string; folderName: string }[];
  requirements: KnowledgeRequirement[];
  controls: KnowledgeControl[];
  chunks: KnowledgeChunk[];
  confidence: number;
  modelName?: string;
  processedAt?: string;
};

export type KnowledgeHistoryEvent = {
  id: string;
  documentId: string;
  eventType: "created" | "uploaded" | "metadata_updated" | "revision_changed" | "reindexed" | "extraction_completed" | "extraction_failed" | "approved" | "expired" | "sync_started" | "sync_completed" | "sync_failed";
  actor: string;
  timestamp: string;
  description: string;
  changes?: Record<string, unknown>;
};

export type RelatedDocument = {
  documentId: string;
  relatedDocumentId: string;
  relatedDocumentNo: string;
  relatedDocumentTitle: string;
  relationType: "Parent Policy" | "Related Standard" | "Procedure" | "Reference" | "Same Folder";
};

export type KnowledgeSyncBatch = {
  id: string;
  batchNo: string;
  source: string;
  scope: "all" | "layer" | "folder" | "document";
  scopeId?: string;
  triggeredBy: string;
  startedAt: string;
  finishedAt?: string;
  totalDocuments: number;
  processedDocuments: number;
  updatedDocuments: number;
  indexedDocuments: number;
  failedDocuments: number;
  progressPercent: number;
  status: "queued" | "processing" | "done" | "failed" | "partial_failed";
};

export type KnowledgeSyncItem = {
  id: string;
  batchId: string;
  documentId: string;
  documentTitle: string;
  documentNo?: string;
  layerName: string;
  folderName: string;
  action:
    | "new_document_indexed"
    | "metadata_updated"
    | "pdf_updated"
    | "extraction_rebuild"
    | "semantic_index_rebuild"
    | "failed_fetch"
    | "no_change";
  status:
    | "queued"
    | "fetching"
    | "extracting"
    | "indexing"
    | "done"
    | "failed";
  progressPercent: number;
  updatedAt?: string;
  message?: string;
};
