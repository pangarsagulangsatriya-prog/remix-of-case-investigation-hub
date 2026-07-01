// Knowledge Repository — Mock Data
// Seeded from Berau Coal HSE 5-Layer Taxonomy

import type {
  KnowledgeLayer,
  KnowledgeFolder,
  KnowledgeDocument,
  KnowledgeExtraction,
  KnowledgeHistoryEvent,
  RelatedDocument,
  KnowledgeSyncBatch,
  KnowledgeSyncItem,
} from "@/types/knowledge";

// ─── Layers ──────────────────────────────────────────────────────────────────

export const mockLayers: KnowledgeLayer[] = [
  { 
    id: "L1", code: "L1", name: "Layer 1 — Management & Policy", order: 1,
    description: "Dokumen pada layer ini mengatur fondasi kebijakan, organisasi, tanggung jawab, kompetensi, compliance, dan sistem manajemen K3.",
    semanticKeywords: ["management policy", "organizational responsibility", "safety governance", "compliance", "contractor management", "training competency"],
    folderCount: 11, documentCount: 8, indexedCount: 18, lastSyncedAt: "2026-06-29T15:28:00Z"
  },
  { 
    id: "L2", code: "L2", name: "Layer 2 — Planning & Assessment", order: 2,
    folderCount: 10, documentCount: 6, indexedCount: 6, lastSyncedAt: "2026-06-29T15:28:00Z"
  },
  { 
    id: "L3", code: "L3", name: "Layer 3 — Operational Control", order: 3,
    folderCount: 18, documentCount: 3, indexedCount: 3, lastSyncedAt: "2026-06-29T15:28:00Z"
  },
  { 
    id: "L4", code: "L4", name: "Layer 4 — Technology & Monitoring", order: 4,
    folderCount: 9, documentCount: 2, indexedCount: 2, lastSyncedAt: "2026-06-29T15:28:00Z"
  },
  { 
    id: "L5", code: "L5", name: "Layer 5 — Physical Protection", order: 5,
    folderCount: 5, documentCount: 2, indexedCount: 2, lastSyncedAt: "2026-06-29T15:28:00Z"
  },
];

// ─── Folders ─────────────────────────────────────────────────────────────────

export const mockFolders: KnowledgeFolder[] = [
  // Layer 1
  { id: "F1.1", layerId: "L1", code: "1.1", name: "HIRA", documentCount: 3, indexedCount: 2, failedCount: 0, needReindexCount: 1, lastSyncedAt: "2026-06-29T15:28:00Z" },
  { 
    id: "F1.2", layerId: "L1", code: "1.2", name: "Kebijakan Perusahaan", 
    description: "Folder ini berisi kebijakan perusahaan yang menjadi rujukan utama untuk standar, prosedur, audit, dan kontrol operasional K3.",
    semanticKeywords: ["policy", "procedure", "K3", "lingkungan", "audit", "investigation", "reporting"],
    searchBoostTerms: ["kebijakan perusahaan", "pedoman K3", "lingkungan hidup", "incident reporting"],
    relatedConcepts: ["Incident Investigation & Reporting", "Management Review", "Regulation Compliance"],
    documentCount: 2, indexedCount: 2, failedCount: 0, needReindexCount: 0, lastSyncedAt: "2026-06-29T15:28:00Z" 
  },
  { id: "F1.3", layerId: "L1", code: "1.3", name: "Management Review", documentCount: 1, indexedCount: 0, failedCount: 1, needReindexCount: 0 },
  { id: "F1.4", layerId: "L1", code: "1.4", name: "Pengelolaan Kontraktor", documentCount: 1, indexedCount: 1, failedCount: 0, needReindexCount: 0 },
  { id: "F1.5", layerId: "L1", code: "1.5", name: "Personnel Identity", documentCount: 0, indexedCount: 0, failedCount: 0, needReindexCount: 0 },
  { id: "F1.6", layerId: "L1", code: "1.6", name: "Human Resource", documentCount: 0, indexedCount: 0, failedCount: 0, needReindexCount: 0 },
  { id: "F1.7", layerId: "L1", code: "1.7", name: "Organizational", documentCount: 0, indexedCount: 0, failedCount: 0, needReindexCount: 0 },
  { id: "F1.8", layerId: "L1", code: "1.8", name: "Management of Change", documentCount: 1, indexedCount: 0, failedCount: 1, needReindexCount: 0 },
  { id: "F1.9", layerId: "L1", code: "1.9", name: "Regulation Compliance", documentCount: 0, indexedCount: 0, failedCount: 0, needReindexCount: 0 },
  { id: "F1.10", layerId: "L1", code: "1.10", name: "Training Kompetensi", documentCount: 0, indexedCount: 0, failedCount: 0, needReindexCount: 0 },
  { id: "F1.11", layerId: "L1", code: "1.11", name: "Pembelian dan Penanganan Material", documentCount: 0, indexedCount: 0, failedCount: 0, needReindexCount: 0 },
  // Layer 2
  { id: "F2.1", layerId: "L2", code: "2.1", name: "JSA & Assessment", documentCount: 2, indexedCount: 2, failedCount: 0, needReindexCount: 0 },
  { id: "F2.2", layerId: "L2", code: "2.2", name: "Daily Operation Plan (DOP)", documentCount: 1, indexedCount: 1, failedCount: 0, needReindexCount: 0 },
  { id: "F2.3", layerId: "L2", code: "2.3", name: "Rencana Kerja", documentCount: 0, indexedCount: 0, failedCount: 0, needReindexCount: 0 },
  { id: "F2.4", layerId: "L2", code: "2.4", name: "Safety Accountability Program (SAP)", documentCount: 0, indexedCount: 0, failedCount: 0, needReindexCount: 0 },
  { id: "F2.5", layerId: "L2", code: "2.5", name: "Design / General Arrangement", documentCount: 0, indexedCount: 0, failedCount: 0, needReindexCount: 0 },
  { id: "F2.6", layerId: "L2", code: "2.6", name: "Standarisasi & Inspection Tools", documentCount: 2, indexedCount: 2, failedCount: 0, needReindexCount: 0 },
  { id: "F2.7", layerId: "L2", code: "2.7", name: "Lingkungan Kerja", documentCount: 0, indexedCount: 0, failedCount: 0, needReindexCount: 0 },
  { id: "F2.8", layerId: "L2", code: "2.8", name: "HSE Campaign", documentCount: 0, indexedCount: 0, failedCount: 0, needReindexCount: 0 },
  { id: "F2.9", layerId: "L2", code: "2.9", name: "Incident Investigation & Reporting", documentCount: 1, indexedCount: 1, failedCount: 0, needReindexCount: 0 },
  { id: "F2.10", layerId: "L2", code: "2.10", name: "Safety Dashboard & Evaluation", documentCount: 0, indexedCount: 0, failedCount: 0, needReindexCount: 0 },
  // Layer 3
  { id: "F3.1", layerId: "L3", code: "3.1", name: "P5M / Safety Briefing", documentCount: 1, indexedCount: 1, failedCount: 0, needReindexCount: 0 },
  { id: "F3.2", layerId: "L3", code: "3.2", name: "P2H incl. emergency equipment", documentCount: 0, indexedCount: 0, failedCount: 0, needReindexCount: 0 },
  { id: "F3.3", layerId: "L3", code: "3.3", name: "Speak Up", documentCount: 0, indexedCount: 0, failedCount: 0, needReindexCount: 0 },
  { id: "F3.4", layerId: "L3", code: "3.4", name: "Rencana Kerja Harian / Daily Maintenance", documentCount: 0, indexedCount: 0, failedCount: 0, needReindexCount: 0 },
  { id: "F3.5", layerId: "L3", code: "3.5", name: "Pengecekan Tongkang Before After Loading", documentCount: 0, indexedCount: 0, failedCount: 0, needReindexCount: 0 },
  { id: "F3.6", layerId: "L3", code: "3.6", name: "Kondisi Area Kerja", documentCount: 0, indexedCount: 0, failedCount: 0, needReindexCount: 0 },
  { id: "F3.7", layerId: "L3", code: "3.7", name: "Last Minutes Check", documentCount: 0, indexedCount: 0, failedCount: 0, needReindexCount: 0 },
  { id: "F3.8", layerId: "L3", code: "3.8", name: "Pengawasan Pekerjaan oleh Pengawas", documentCount: 0, indexedCount: 0, failedCount: 0, needReindexCount: 0 },
  { id: "F3.9", layerId: "L3", code: "3.9", name: "Safety Patrol", documentCount: 0, indexedCount: 0, failedCount: 0, needReindexCount: 0 },
  { id: "F3.10", layerId: "L3", code: "3.10", name: "Pelaksanaan Pekerjaan Sesuai SOP", documentCount: 1, indexedCount: 1, failedCount: 0, needReindexCount: 0 },
  { id: "F3.11", layerId: "L3", code: "3.11", name: "Fit to Work and Health Issue", documentCount: 0, indexedCount: 0, failedCount: 0, needReindexCount: 0 },
  { id: "F3.12", layerId: "L3", code: "3.12", name: "Fatigue Test", documentCount: 0, indexedCount: 0, failedCount: 0, needReindexCount: 0 },
  { id: "F3.13", layerId: "L3", code: "3.13", name: "Izin Kerja Khusus", documentCount: 0, indexedCount: 0, failedCount: 0, needReindexCount: 0 },
  { id: "F3.14", layerId: "L3", code: "3.14", name: "Pemenuhan Rambu / Safety Sign / IMO Sign", documentCount: 0, indexedCount: 0, failedCount: 0, needReindexCount: 0 },
  { id: "F3.15", layerId: "L3", code: "3.15", name: "Drugs / Alcohol Influence", documentCount: 0, indexedCount: 0, failedCount: 0, needReindexCount: 0 },
  { id: "F3.16", layerId: "L3", code: "3.16", name: "Security Check & Patrol", documentCount: 0, indexedCount: 0, failedCount: 0, needReindexCount: 0 },
  { id: "F3.17", layerId: "L3", code: "3.17", name: "Maintenance", documentCount: 1, indexedCount: 1, failedCount: 0, needReindexCount: 0 },
  { id: "F3.18", layerId: "L3", code: "3.18", name: "Emergency Preparedness", documentCount: 0, indexedCount: 0, failedCount: 0, needReindexCount: 0 },
  // Layer 4
  { id: "F4.1", layerId: "L4", code: "4.1", name: "Fatigue Alarm", documentCount: 1, indexedCount: 1, failedCount: 0, needReindexCount: 0 },
  { id: "F4.2", layerId: "L4", code: "4.2", name: "Geotech RADAR / Radar Marine", documentCount: 0, indexedCount: 0, failedCount: 0, needReindexCount: 0 },
  { id: "F4.3", layerId: "L4", code: "4.3", name: "Cabin Camera / DMS", documentCount: 1, indexedCount: 1, failedCount: 0, needReindexCount: 0 },
  { id: "F4.4", layerId: "L4", code: "4.4", name: "Speed Awareness", documentCount: 0, indexedCount: 0, failedCount: 0, needReindexCount: 0 },
  { id: "F4.5", layerId: "L4", code: "4.5", name: "GPS Posisi dan Kecepatan", documentCount: 0, indexedCount: 0, failedCount: 0, needReindexCount: 0 },
  { id: "F4.6", layerId: "L4", code: "4.6", name: "CCTV Mining Eyes", documentCount: 0, indexedCount: 0, failedCount: 0, needReindexCount: 0 },
  { id: "F4.7", layerId: "L4", code: "4.7", name: "Echosounder", documentCount: 0, indexedCount: 0, failedCount: 0, needReindexCount: 0 },
  { id: "F4.8", layerId: "L4", code: "4.8", name: "Sensor / Alarm", documentCount: 0, indexedCount: 0, failedCount: 0, needReindexCount: 0 },
  { id: "F4.9", layerId: "L4", code: "4.9", name: "Wind Indicator", documentCount: 0, indexedCount: 0, failedCount: 0, needReindexCount: 0 },
  // Layer 5
  { id: "F5.1", layerId: "L5", code: "5.1", name: "APD", documentCount: 1, indexedCount: 1, failedCount: 0, needReindexCount: 0 },
  { id: "F5.2", layerId: "L5", code: "5.2", name: "Guards or Barriers", documentCount: 1, indexedCount: 1, failedCount: 0, needReindexCount: 0 },
  { id: "F5.3", layerId: "L5", code: "5.3", name: "Emergency Report and Response", documentCount: 0, indexedCount: 0, failedCount: 0, needReindexCount: 0 },
  { id: "F5.4", layerId: "L5", code: "5.4", name: "Safety Device", documentCount: 0, indexedCount: 0, failedCount: 0, needReindexCount: 0 },
  { id: "F5.5", layerId: "L5", code: "5.5", name: "Control Systems", documentCount: 0, indexedCount: 0, failedCount: 0, needReindexCount: 0 },
];

// ─── Documents ───────────────────────────────────────────────────────────────

export const mockDocuments: KnowledgeDocument[] = [
  // Layer 1 — 1.1 HIRA
  {
    id: "DOC-001", folderId: "F1.1", documentNo: "R-HIRA-TBG-01", title: "HIRA Tambang Pit 1 Binungan",
    fileName: "HIRA_Tambang_Pit1.pdf", fileUrl: "#", fileType: "pdf",
    department: "Safety Operations", documentType: "Risk Assessment", keywords: ["HIRA", "Tambang", "Pit 1", "Binungan"],
    subCategories: ["Hazard Identification", "Risk Assessment", "Kontrol Operasional"],
    publishTarget: "Berau Coal Internal", effectiveDate: "2026-01-15", revision: "2",
    status: "active", syncStatus: "done", sourceSystem: "HSE Automation",
    owner: "Dept. Safety", createdBy: "Admin HSE", uploadedAt: "2026-01-10T08:00:00Z",
    updatedAt: "2026-05-20T10:30:00Z", indexedAt: "2026-05-20T11:00:00Z", pageCount: 12,
    lastSyncedAt: "2026-06-29T15:28:00Z",
  },
  {
    id: "DOC-002", folderId: "F1.1", documentNo: "R-HIRA-HLD-01", title: "HIRA Hauling Road Lati–Dermaga",
    fileName: "HIRA_Hauling_Lati.pdf", fileUrl: "#", fileType: "pdf",
    department: "Safety Operations", documentType: "Risk Assessment", keywords: ["HIRA", "Hauling", "Road", "Lati"],
    subCategories: ["Hazard Identification", "Risk Assessment", "Hauling"],
    publishTarget: "Berau Coal Internal", effectiveDate: "2026-02-01", revision: "1",
    status: "active", syncStatus: "done", sourceSystem: "HSE Automation",
    owner: "Dept. Safety", createdBy: "Admin HSE", uploadedAt: "2026-01-25T09:00:00Z",
    updatedAt: "2026-04-12T14:00:00Z", indexedAt: "2026-04-12T15:00:00Z", pageCount: 8,
    lastSyncedAt: "2026-06-29T15:28:00Z",
  },
  {
    id: "DOC-003", folderId: "F1.1", documentNo: "R-HIRA-WSP-01", title: "HIRA Workshop Area",
    fileName: "HIRA_Workshop.pdf", fileUrl: "#", fileType: "pdf",
    department: "Safety Operations", documentType: "Risk Assessment", keywords: ["HIRA", "Workshop"],
    subCategories: ["Hazard Identification", "Workshop"],
    publishTarget: "Berau Coal Internal", effectiveDate: "2026-03-10", revision: "0",
    status: "active", syncStatus: "extracting", sourceSystem: "HSE Automation",
    owner: "Dept. Safety", createdBy: "Admin HSE", uploadedAt: "2026-03-08T10:00:00Z",
    updatedAt: "2026-03-10T08:00:00Z", indexedAt: undefined, pageCount: 6,
    lastSyncedAt: "2026-06-29T15:30:00Z",
  },
  // Layer 1 — 1.2 Kebijakan Perusahaan
  {
    id: "DOC-004", folderId: "F1.2", documentNo: "M-BC-001", title: "Pedoman K3 dan Lingkungan Hidup",
    fileName: "Pedoman_K3_Lingkungan.pdf", fileUrl: "#", fileType: "pdf",
    department: "HSE Department", documentType: "Pedoman", keywords: ["K3", "Lingkungan", "Kebijakan"],
    subCategories: ["Kebijakan Utama", "Lingkungan Hidup"],
    publishTarget: "Berau Coal & Mitra", effectiveDate: "2025-07-01", revision: "3",
    status: "active", syncStatus: "done", sourceSystem: "HSE Automation",
    owner: "VP HSE", createdBy: "Admin HSE", uploadedAt: "2025-06-15T08:00:00Z",
    updatedAt: "2026-01-05T09:00:00Z", indexedAt: "2026-01-05T10:00:00Z", pageCount: 24,
    lastSyncedAt: "2026-06-29T15:29:00Z",
    semanticKeywords: ["K3", "lingkungan", "audit", "pelatihan", "investigasi insiden"],
    detectedTopics: ["Kebijakan K3", "Komitmen manajemen", "Program pelatihan", "Investigasi insiden", "Audit berkala"],
    searchAliases: ["pedoman K3", "pedoman lingkungan", "safety policy", "HSE policy"],
    semanticConfidence: 92,
  },
  {
    id: "DOC-005", folderId: "F1.2", documentNo: "M-BC-002", title: "Kebijakan Keselamatan Pertambangan",
    fileName: "Kebijakan_Keselamatan.pdf", fileUrl: "#", fileType: "pdf",
    department: "HSE Department", documentType: "Kebijakan", keywords: ["Keselamatan", "Pertambangan"],
    subCategories: ["Kebijakan Utama"],
    publishTarget: "Berau Coal", effectiveDate: "2025-08-01", revision: "2",
    status: "active", syncStatus: "done", sourceSystem: "HSE Automation",
    owner: "VP HSE", createdBy: "Admin HSE", uploadedAt: "2025-07-20T08:00:00Z",
    updatedAt: "2025-12-01T09:00:00Z", indexedAt: "2025-12-01T10:00:00Z", pageCount: 18,
    lastSyncedAt: "2026-06-29T15:28:00Z",
  },
  // Layer 1 — 1.3 Management Review
  {
    id: "DOC-006", folderId: "F1.3", documentNo: "MR-Q2-2026", title: "Management Review Q2 2026",
    fileName: "Management_Review_Q2.pdf", fileUrl: "#", fileType: "pdf",
    department: "HSE Department", documentType: "Review Report", keywords: ["Management Review", "Q2"],
    subCategories: ["Quarterly Review"],
    publishTarget: "Berau Coal Internal", effectiveDate: "2026-06-01", revision: "0",
    status: "draft", syncStatus: "failed", sourceSystem: "Manual Upload",
    owner: "VP HSE", createdBy: "Admin HSE", uploadedAt: "2026-06-28T08:00:00Z",
    updatedAt: "2026-06-28T08:00:00Z", indexedAt: undefined, pageCount: 15,
    lastSyncedAt: "2026-06-29T15:32:00Z",
  },
  // Layer 1 — 1.4 Pengelolaan Kontraktor
  {
    id: "DOC-007", folderId: "F1.4", documentNo: "P-KTR-001", title: "Prosedur Pengelolaan Kontraktor K3",
    fileName: "Prosedur_Kontraktor_K3.pdf", fileUrl: "#", fileType: "pdf",
    department: "Safety Operations", documentType: "Prosedur", keywords: ["Kontraktor", "K3", "Pengelolaan"],
    subCategories: ["Kontraktor Management"],
    publishTarget: "Berau Coal & Mitra", effectiveDate: "2025-11-01", revision: "1",
    status: "active", syncStatus: "done", sourceSystem: "HSE Automation",
    owner: "Dept. Safety", createdBy: "Admin HSE", uploadedAt: "2025-10-15T08:00:00Z",
    updatedAt: "2026-02-10T09:00:00Z", indexedAt: "2026-02-10T10:00:00Z", pageCount: 10,
    lastSyncedAt: "2026-06-29T15:28:00Z",
  },
  // Layer 1 — 1.8 Management of Change
  {
    id: "DOC-008", folderId: "F1.8", documentNo: "P-MOC-001", title: "Prosedur Management of Change",
    fileName: "Prosedur_MOC.pdf", fileUrl: "#", fileType: "pdf",
    department: "HSE Department", documentType: "Prosedur", keywords: ["MOC", "Management of Change"],
    subCategories: ["Change Management"],
    publishTarget: "Berau Coal Internal", effectiveDate: "2026-04-01", revision: "0",
    status: "active", syncStatus: "failed", sourceSystem: "HSE Automation",
    owner: "Dept. Safety", createdBy: "Admin HSE", uploadedAt: "2026-03-20T08:00:00Z",
    updatedAt: "2026-03-25T08:00:00Z", indexedAt: "2026-03-25T09:00:00Z", pageCount: 7,
    lastSyncedAt: "2026-06-29T15:28:00Z",
  },
  // Layer 2 — 2.1 JSA & Assessment
  {
    id: "DOC-009", folderId: "F2.1", documentNo: "JSA-HLD-001", title: "JSA Hauling Road Lati–Dermaga",
    fileName: "JSA_Hauling_Lati.pdf", fileUrl: "#", fileType: "pdf",
    department: "Safety Operations", documentType: "JSA", keywords: ["JSA", "Hauling", "Lati"],
    subCategories: ["Job Safety Analysis", "Hauling"],
    publishTarget: "Berau Coal & Mitra", effectiveDate: "2026-01-20", revision: "1",
    status: "active", syncStatus: "done", sourceSystem: "HSE Automation",
    owner: "Dept. Safety", createdBy: "Admin HSE", uploadedAt: "2026-01-15T08:00:00Z",
    updatedAt: "2026-04-01T09:00:00Z", indexedAt: "2026-04-01T10:00:00Z", pageCount: 5,
    lastSyncedAt: "2026-06-29T15:28:00Z",
  },
  {
    id: "DOC-010", folderId: "F2.1", documentNo: "JSA-PIT-001", title: "JSA Operasi Penambangan Pit 1",
    fileName: "JSA_Pit1.pdf", fileUrl: "#", fileType: "pdf",
    department: "Safety Operations", documentType: "JSA", keywords: ["JSA", "Pit 1", "Penambangan"],
    subCategories: ["Job Safety Analysis", "Mining Operation"],
    publishTarget: "Berau Coal Internal", effectiveDate: "2026-02-10", revision: "0",
    status: "active", syncStatus: "done", sourceSystem: "HSE Automation",
    owner: "Dept. Safety", createdBy: "Admin HSE", uploadedAt: "2026-02-05T08:00:00Z",
    updatedAt: "2026-03-15T09:00:00Z", indexedAt: "2026-03-15T10:00:00Z", pageCount: 4,
    lastSyncedAt: "2026-06-29T15:28:00Z",
  },
  // Layer 2 — 2.2 DOP
  {
    id: "DOC-011", folderId: "F2.2", documentNo: "DOP-JUN-2026", title: "Daily Operation Plan Juni 2026",
    fileName: "DOP_Juni_2026.pdf", fileUrl: "#", fileType: "pdf",
    department: "Mine Planning", documentType: "Operation Plan", keywords: ["DOP", "Juni", "Planning"],
    subCategories: ["Daily Operation"],
    publishTarget: "Berau Coal Internal", effectiveDate: "2026-06-01", revision: "0",
    status: "active", syncStatus: "done", sourceSystem: "HSE Automation",
    owner: "Mine Planning", createdBy: "Admin HSE", uploadedAt: "2026-05-28T08:00:00Z",
    updatedAt: "2026-06-01T09:00:00Z", indexedAt: "2026-06-01T10:00:00Z", pageCount: 3,
    lastSyncedAt: "2026-06-29T15:28:00Z",
  },
  // Layer 2 — 2.6 Standarisasi
  {
    id: "DOC-012", folderId: "F2.6", documentNo: "S-SFO-07", title: "Standar Workshop Eksplorasi",
    fileName: "Standar_Workshop_Eksplorasi.pdf", fileUrl: "#", fileType: "pdf",
    department: "Safety Operations", documentType: "Standar", keywords: ["Workshop", "Eksplorasi", "Maintenance", "Drilling"],
    subCategories: ["27 Maintenance Unit", "High Risk Activity", "Operasional", "GR 3 Lock Out & Tag Out", "29 Penggunaan Tools"],
    publishTarget: "Berau Coal Mitra", effectiveDate: "2026-06-10", revision: "0",
    status: "active", syncStatus: "done", sourceSystem: "HSE Automation",
    owner: "Dept. Safety", createdBy: "Admin HSE", uploadedAt: "2026-06-08T04:00:00Z",
    updatedAt: "2026-06-10T04:05:00Z", indexedAt: "2026-06-10T04:07:00Z", pageCount: 3,
    lastSyncedAt: "2026-06-29T15:31:00Z",
  },
  {
    id: "DOC-013", folderId: "F2.6", documentNo: "S-SFO-12", title: "Standar Inspeksi Alat Berat",
    fileName: "Standar_Inspeksi_AlatBerat.pdf", fileUrl: "#", fileType: "pdf",
    department: "Safety Operations", documentType: "Standar", keywords: ["Inspeksi", "Alat Berat"],
    subCategories: ["Inspection Tools", "Heavy Equipment"],
    publishTarget: "Berau Coal Internal", effectiveDate: "2026-05-01", revision: "1",
    status: "active", syncStatus: "need_reindex", sourceSystem: "HSE Automation",
    owner: "Dept. Safety", createdBy: "Admin HSE", uploadedAt: "2026-04-20T08:00:00Z",
    updatedAt: "2026-05-01T09:00:00Z", indexedAt: "2026-05-01T10:00:00Z", pageCount: 5,
    lastSyncedAt: "2026-06-29T15:28:00Z",
  },
  // Layer 2 — 2.9 Incident Investigation
  {
    id: "DOC-014", folderId: "F2.9", documentNo: "P-INV-001", title: "Prosedur Investigasi Insiden",
    fileName: "Prosedur_Investigasi_Insiden.pdf", fileUrl: "#", fileType: "pdf",
    department: "Safety Operations", documentType: "Prosedur", keywords: ["Investigasi", "Insiden", "Reporting"],
    subCategories: ["Incident Management"],
    publishTarget: "Berau Coal & Mitra", effectiveDate: "2025-09-01", revision: "2",
    status: "active", syncStatus: "done", sourceSystem: "HSE Automation",
    owner: "VP HSE", createdBy: "Admin HSE", uploadedAt: "2025-08-15T08:00:00Z",
    updatedAt: "2026-03-01T09:00:00Z", indexedAt: "2026-03-01T10:00:00Z", pageCount: 14,
    lastSyncedAt: "2026-06-29T15:28:00Z",
  },
  // Layer 3 — 3.1 P5M
  {
    id: "DOC-015", folderId: "F3.1", documentNo: "SOP-P5M-001", title: "SOP Pelaksanaan P5M / Safety Briefing",
    fileName: "SOP_P5M.pdf", fileUrl: "#", fileType: "pdf",
    department: "Safety Operations", documentType: "SOP", keywords: ["P5M", "Safety Briefing", "Pre-shift"],
    subCategories: ["Pre-Shift Meeting"],
    publishTarget: "Berau Coal & Mitra", effectiveDate: "2025-12-01", revision: "1",
    status: "active", syncStatus: "done", sourceSystem: "HSE Automation",
    owner: "Dept. Safety", createdBy: "Admin HSE", uploadedAt: "2025-11-15T08:00:00Z",
    updatedAt: "2026-02-20T09:00:00Z", indexedAt: "2026-02-20T10:00:00Z", pageCount: 6,
    lastSyncedAt: "2026-06-29T15:28:00Z",
  },
  // Layer 3 — 3.10 SOP
  {
    id: "DOC-016", folderId: "F3.10", documentNo: "SOP-OPS-001", title: "SOP Pelaksanaan Pekerjaan Sesuai Standar",
    fileName: "SOP_Pelaksanaan_Standar.pdf", fileUrl: "#", fileType: "pdf",
    department: "Safety Operations", documentType: "SOP", keywords: ["SOP", "Pelaksanaan", "Standar"],
    subCategories: ["Standard Operations"],
    publishTarget: "Berau Coal & Mitra", effectiveDate: "2026-01-01", revision: "0",
    status: "active", syncStatus: "done", sourceSystem: "HSE Automation",
    owner: "Dept. Safety", createdBy: "Admin HSE", uploadedAt: "2025-12-20T08:00:00Z",
    updatedAt: "2026-01-01T09:00:00Z", indexedAt: "2026-01-01T10:00:00Z", pageCount: 8,
    lastSyncedAt: "2026-06-29T15:28:00Z",
  },
  // Layer 3 — 3.17 Maintenance
  {
    id: "DOC-017", folderId: "F3.17", documentNo: "SOP-MNT-001", title: "SOP Maintenance Preventif Unit Hauling",
    fileName: "SOP_Maintenance_Hauling.pdf", fileUrl: "#", fileType: "pdf",
    department: "Maintenance Dept", documentType: "SOP", keywords: ["Maintenance", "Preventif", "Hauling"],
    subCategories: ["Preventive Maintenance", "Hauling Unit"],
    publishTarget: "Berau Coal Internal", effectiveDate: "2026-03-01", revision: "1",
    status: "active", syncStatus: "done", sourceSystem: "HSE Automation",
    owner: "Dept. Maintenance", createdBy: "Admin HSE", uploadedAt: "2026-02-15T08:00:00Z",
    updatedAt: "2026-03-01T09:00:00Z", indexedAt: "2026-03-01T10:00:00Z", pageCount: 9,
    lastSyncedAt: "2026-06-29T15:28:00Z",
  },
  // Layer 4 — 4.1 Fatigue Alarm
  {
    id: "DOC-018", folderId: "F4.1", documentNo: "T-FA-001", title: "Panduan Operasional Fatigue Alarm System",
    fileName: "Panduan_Fatigue_Alarm.pdf", fileUrl: "#", fileType: "pdf",
    department: "Technology & Safety", documentType: "Technical Guide", keywords: ["Fatigue", "Alarm", "System"],
    subCategories: ["Fatigue Management", "Technology"],
    publishTarget: "Berau Coal Internal", effectiveDate: "2026-04-01", revision: "0",
    status: "active", syncStatus: "done", sourceSystem: "HSE Automation",
    owner: "Dept. Technology", createdBy: "Admin HSE", uploadedAt: "2026-03-25T08:00:00Z",
    updatedAt: "2026-04-01T09:00:00Z", indexedAt: "2026-04-01T10:00:00Z", pageCount: 7,
    lastSyncedAt: "2026-06-29T15:28:00Z",
  },
  // Layer 4 — 4.3 Cabin Camera / DMS
  {
    id: "DOC-019", folderId: "F4.3", documentNo: "T-DMS-001", title: "Standar Operasional Cabin Camera / DMS",
    fileName: "Standar_DMS.pdf", fileUrl: "#", fileType: "pdf",
    department: "Technology & Safety", documentType: "Standar Operasional", keywords: ["DMS", "Cabin Camera", "Driver Monitoring"],
    subCategories: ["Driver Monitoring System", "Camera System"],
    publishTarget: "Berau Coal Internal", effectiveDate: "2026-05-01", revision: "0",
    status: "active", syncStatus: "done", sourceSystem: "HSE Automation",
    owner: "Dept. Technology", createdBy: "Admin HSE", uploadedAt: "2026-04-20T08:00:00Z",
    updatedAt: "2026-05-01T09:00:00Z", indexedAt: "2026-05-01T10:00:00Z", pageCount: 5,
    lastSyncedAt: "2026-06-29T15:28:00Z",
  },
  // Layer 5 — 5.1 APD
  {
    id: "DOC-020", folderId: "F5.1", documentNo: "S-APD-001", title: "Standar Alat Pelindung Diri (APD)",
    fileName: "Standar_APD.pdf", fileUrl: "#", fileType: "pdf",
    department: "Safety Operations", documentType: "Standar", keywords: ["APD", "Pelindung Diri", "PPE"],
    subCategories: ["Personal Protective Equipment"],
    publishTarget: "Berau Coal & Mitra", effectiveDate: "2025-10-01", revision: "2",
    status: "active", syncStatus: "done", sourceSystem: "HSE Automation",
    owner: "Dept. Safety", createdBy: "Admin HSE", uploadedAt: "2025-09-15T08:00:00Z",
    updatedAt: "2026-01-10T09:00:00Z", indexedAt: "2026-01-10T10:00:00Z", pageCount: 10,
    lastSyncedAt: "2026-06-29T15:28:00Z",
  },
  // Layer 5 — 5.2 Guards or Barriers
  {
    id: "DOC-021", folderId: "F5.2", documentNo: "S-BAR-001", title: "Standar Pemasangan Guards dan Barriers",
    fileName: "Standar_Guards_Barriers.pdf", fileUrl: "#", fileType: "pdf",
    department: "Safety Operations", documentType: "Standar", keywords: ["Guards", "Barriers", "Physical Protection"],
    subCategories: ["Physical Barriers", "Guards"],
    publishTarget: "Berau Coal & Mitra", effectiveDate: "2026-02-01", revision: "0",
    status: "expired", syncStatus: "done", sourceSystem: "HSE Automation",
    owner: "Dept. Safety", createdBy: "Admin HSE", uploadedAt: "2026-01-15T08:00:00Z",
    updatedAt: "2026-06-20T09:00:00Z", indexedAt: "2026-02-01T10:00:00Z", pageCount: 6,
    lastSyncedAt: "2026-06-29T15:28:00Z",
  },
];

// ─── Extractions ─────────────────────────────────────────────────────────────

export const mockExtractions: KnowledgeExtraction[] = [
  {
    id: "EXT-001", documentId: "DOC-001",
    summary: "Dokumen HIRA Tambang Pit 1 Binungan mengidentifikasi hazard utama terkait aktivitas penambangan termasuk ground failure, vehicle collision, dan exposure to dust. Risk assessment dilakukan dengan matriks 5x5 dan kontrol hierarki diterapkan dari eliminasi hingga APD.",
    relatedLayers: [
      { layerCode: "L2", folderCode: "2.1", folderName: "JSA & Assessment" },
      { layerCode: "L3", folderCode: "3.10", folderName: "Pelaksanaan Pekerjaan Sesuai SOP" },
      { layerCode: "L5", folderCode: "5.1", folderName: "APD" },
    ],
    requirements: [
      { id: "REQ-001", code: "REQ-001", text: "Semua pekerja wajib melakukan identifikasi bahaya sebelum memulai aktivitas penambangan.", sourcePage: 3, confidence: 0.95 },
      { id: "REQ-002", code: "REQ-002", text: "Penilaian risiko harus menggunakan matriks 5x5 sesuai standar perusahaan.", sourcePage: 5, confidence: 0.92 },
      { id: "REQ-003", code: "REQ-003", text: "Review HIRA dilakukan minimal setiap 6 bulan atau jika terjadi perubahan kondisi kerja.", sourcePage: 10, confidence: 0.88 },
    ],
    controls: [
      { id: "CTRL-001", code: "CTRL-001", text: "Pemasangan berm dan safety bund di tepi jalan hauling.", sourcePage: 7, confidence: 0.91 },
      { id: "CTRL-002", code: "CTRL-002", text: "Sistem fatigue alarm wajib aktif untuk semua unit hauling.", sourcePage: 8, confidence: 0.93 },
    ],
    chunks: [
      { id: "CHK-001", documentId: "DOC-001", pageStart: 1, pageEnd: 2, heading: "Pendahuluan & Ruang Lingkup", text: "Dokumen ini mencakup identifikasi bahaya dan penilaian risiko untuk seluruh aktivitas operasi penambangan di area Pit 1 Binungan.", confidence: 0.96 },
      { id: "CHK-002", documentId: "DOC-001", pageStart: 3, pageEnd: 5, heading: "Identifikasi Hazard", text: "Hazard diidentifikasi berdasarkan observasi lapangan, data insiden historis, dan input dari pekerja. Kategori hazard meliputi: fisik, kimia, biologi, ergonomi, dan psikososial.", confidence: 0.94 },
      { id: "CHK-003", documentId: "DOC-001", pageStart: 6, pageEnd: 8, heading: "Risk Assessment Matrix", text: "Penilaian risiko menggunakan matriks 5x5 dengan parameter likelihood dan severity. Setiap hazard dinilai kondisi existing dan residual setelah kontrol.", confidence: 0.93 },
      { id: "CHK-004", documentId: "DOC-001", pageStart: 9, pageEnd: 12, heading: "Kontrol & Monitoring", text: "Hierarki kontrol diterapkan: eliminasi, substitusi, engineering control, administrative control, dan APD. Monitoring dilakukan melalui inspeksi berkala dan audit internal.", confidence: 0.90 },
    ],
    confidence: 94, modelName: "document-extraction-v1", processedAt: "2026-05-20T11:00:00Z",
  },
  {
    id: "EXT-012", documentId: "DOC-012",
    summary: "Dokumen ini membahas standar workshop eksplorasi, termasuk kontrol area kerja, alat bantu kerja, aktivitas maintenance, drilling support, dan pemeriksaan unit. Berlaku untuk semua area workshop di site eksplorasi Berau Coal.",
    relatedLayers: [
      { layerCode: "L2", folderCode: "2.6", folderName: "Standarisasi & Inspection Tools" },
      { layerCode: "L3", folderCode: "3.17", folderName: "Maintenance" },
      { layerCode: "L5", folderCode: "5.2", folderName: "Guards or Barriers" },
    ],
    requirements: [
      { id: "REQ-012-1", code: "REQ-001", text: "Pekerja wajib memakai APD sesuai area kerja.", sourcePage: 2, confidence: 0.96 },
      { id: "REQ-012-2", code: "REQ-002", text: "Area workshop harus memiliki barrier dan signage.", sourcePage: 2, confidence: 0.94 },
      { id: "REQ-012-3", code: "REQ-003", text: "Pemeriksaan alat dilakukan sebelum pekerjaan dimulai.", sourcePage: 3, confidence: 0.91 },
    ],
    controls: [
      { id: "CTRL-012-1", code: "CTRL-001", text: "Barrier fisik dipasang di sekeliling area grinding dan welding.", sourcePage: 2, confidence: 0.93 },
    ],
    chunks: [
      { id: "CHK-012-1", documentId: "DOC-012", pageStart: 1, heading: "Header & Approval", text: "Header, nomor dokumen, revisi, tanggal berlaku, approval.", confidence: 0.98 },
      { id: "CHK-012-2", documentId: "DOC-012", pageStart: 2, heading: "Ruang Lingkup", text: "Ruang lingkup pekerjaan, aktivitas workshop, eksplorasi, maintenance.", confidence: 0.95 },
      { id: "CHK-012-3", documentId: "DOC-012", pageStart: 3, heading: "Kontrol & Inspeksi", text: "Kontrol kerja, peralatan, inspeksi, dan dokumen pendukung.", confidence: 0.92 },
    ],
    confidence: 94, modelName: "document-extraction-v1", processedAt: "2026-06-10T04:07:00Z",
  },
  {
    id: "EXT-004", documentId: "DOC-004",
    summary: "Pedoman K3 dan Lingkungan Hidup merupakan kebijakan tertinggi Berau Coal untuk keselamatan kerja. Mencakup komitmen manajemen, organisasi K3, program pelatihan, investigasi insiden, dan audit berkala.",
    relatedLayers: [
      { layerCode: "L1", folderCode: "1.2", folderName: "Kebijakan Perusahaan" },
      { layerCode: "L2", folderCode: "2.9", folderName: "Incident Investigation & Reporting" },
    ],
    requirements: [
      { id: "REQ-004-1", code: "REQ-001", text: "Seluruh karyawan dan kontraktor wajib memahami kebijakan K3.", sourcePage: 4 },
      { id: "REQ-004-2", code: "REQ-002", text: "Audit internal K3 dilakukan setiap kuartal.", sourcePage: 12 },
    ],
    controls: [],
    chunks: [
      { id: "CHK-004-1", documentId: "DOC-004", pageStart: 1, pageEnd: 3, heading: "Kebijakan & Komitmen", text: "Pernyataan komitmen manajemen terhadap K3 dan lingkungan hidup.", confidence: 0.97 },
      { id: "CHK-004-2", documentId: "DOC-004", pageStart: 4, pageEnd: 10, heading: "Organisasi & Tanggung Jawab", text: "Struktur organisasi K3, peran dan tanggung jawab setiap level manajemen.", confidence: 0.94 },
      { id: "CHK-004-3", documentId: "DOC-004", pageStart: 11, pageEnd: 18, heading: "Program Pelatihan & Audit", text: "Program training K3, jadwal audit, dan mekanisme pelaporan.", confidence: 0.91 },
    ],
    confidence: 92, modelName: "document-extraction-v1", processedAt: "2026-01-05T10:00:00Z",
  },
];

// ─── Related Documents ───────────────────────────────────────────────────────

export const mockRelatedDocuments: RelatedDocument[] = [
  { documentId: "DOC-012", relatedDocumentId: "DOC-004", relatedDocumentNo: "M-BC-001", relatedDocumentTitle: "Pedoman K3 dan Lingkungan Hidup", relationType: "Parent Policy" },
  { documentId: "DOC-012", relatedDocumentId: "DOC-013", relatedDocumentNo: "S-SFO-12", relatedDocumentTitle: "Standar Inspeksi Alat Berat", relationType: "Related Standard" },
  { documentId: "DOC-001", relatedDocumentId: "DOC-009", relatedDocumentNo: "JSA-HLD-001", relatedDocumentTitle: "JSA Hauling Road Lati–Dermaga", relationType: "Related Standard" },
  { documentId: "DOC-001", relatedDocumentId: "DOC-004", relatedDocumentNo: "M-BC-001", relatedDocumentTitle: "Pedoman K3 dan Lingkungan Hidup", relationType: "Parent Policy" },
  { documentId: "DOC-004", relatedDocumentId: "DOC-005", relatedDocumentNo: "M-BC-002", relatedDocumentTitle: "Kebijakan Keselamatan Pertambangan", relationType: "Related Standard" },
  { documentId: "DOC-004", relatedDocumentId: "DOC-014", relatedDocumentNo: "P-INV-001", relatedDocumentTitle: "Prosedur Investigasi Insiden", relationType: "Procedure" },
  { documentId: "DOC-004", relatedDocumentId: "DOC-007", relatedDocumentNo: "P-KTR-001", relatedDocumentTitle: "Prosedur Pengelolaan Kontraktor K3", relationType: "Procedure" },
  { documentId: "DOC-018", relatedDocumentId: "DOC-019", relatedDocumentNo: "T-DMS-001", relatedDocumentTitle: "Standar Operasional Cabin Camera / DMS", relationType: "Reference" },
  { documentId: "DOC-020", relatedDocumentId: "DOC-021", relatedDocumentNo: "S-BAR-001", relatedDocumentTitle: "Standar Pemasangan Guards dan Barriers", relationType: "Related Standard" },
];

// ─── History ─────────────────────────────────────────────────────────────────

export const mockHistoryEvents: KnowledgeHistoryEvent[] = [
  // DOC-012 history
  { id: "H-012-1", documentId: "DOC-012", eventType: "created", actor: "HSE Automation", timestamp: "2026-06-08T04:00:00Z", description: "Dokumen dibuat dari sumber HSE Automation." },
  { id: "H-012-2", documentId: "DOC-012", eventType: "uploaded", actor: "Admin HSE", timestamp: "2026-06-08T04:02:00Z", description: "File PDF diunggah ke sistem Knowledge Repository." },
  { id: "H-012-3", documentId: "DOC-012", eventType: "extraction_completed", actor: "System AI", timestamp: "2026-06-10T04:07:00Z", description: "AI extraction selesai. Model: document-extraction-v1. Chunks: 3. Confidence: 94%.", changes: { model: "document-extraction-v1", chunks: 3, confidence: 94 } },
  { id: "H-012-4", documentId: "DOC-012", eventType: "approved", actor: "HSE Automation", timestamp: "2026-06-10T04:05:00Z", description: "Dokumen dipublikasikan dan berlaku efektif." },
  { id: "H-012-5", documentId: "DOC-012", eventType: "sync_completed", actor: "System Scheduler", timestamp: "2026-06-29T15:31:00Z", description: "New document indexed", changes: { action: "new_document_indexed" } },
  // DOC-001 history
  { id: "H-001-1", documentId: "DOC-001", eventType: "created", actor: "Admin HSE", timestamp: "2026-01-10T08:00:00Z", description: "Dokumen HIRA Tambang Pit 1 dibuat." },
  { id: "H-001-2", documentId: "DOC-001", eventType: "uploaded", actor: "Admin HSE", timestamp: "2026-01-10T08:05:00Z", description: "File PDF diunggah." },
  { id: "H-001-3", documentId: "DOC-001", eventType: "extraction_completed", actor: "System AI", timestamp: "2026-01-11T10:00:00Z", description: "AI extraction pertama selesai. Chunks: 4. Confidence: 91%.", changes: { model: "document-extraction-v1", chunks: 4, confidence: 91 } },
  { id: "H-001-4", documentId: "DOC-001", eventType: "revision_changed", actor: "Admin HSE", timestamp: "2026-03-15T09:00:00Z", description: "Revisi diperbarui dari Rev 1 ke Rev 2.", changes: { field: "revision", from: "1", to: "2" } },
  { id: "H-001-5", documentId: "DOC-001", eventType: "reindexed", actor: "System AI", timestamp: "2026-05-20T11:00:00Z", description: "Re-indexing selesai setelah revisi. Confidence: 94%.", changes: { model: "document-extraction-v1", chunks: 4, confidence: 94 } },
  // DOC-004 history
  { id: "H-004-1", documentId: "DOC-004", eventType: "created", actor: "VP HSE", timestamp: "2025-06-15T08:00:00Z", description: "Pedoman K3 dan Lingkungan Hidup dibuat." },
  { id: "H-004-2", documentId: "DOC-004", eventType: "uploaded", actor: "Admin HSE", timestamp: "2025-06-15T08:10:00Z", description: "File PDF diunggah." },
  { id: "H-004-3", documentId: "DOC-004", eventType: "approved", actor: "VP HSE", timestamp: "2025-07-01T08:00:00Z", description: "Dokumen disetujui dan berlaku efektif." },
  { id: "H-004-4", documentId: "DOC-004", eventType: "extraction_completed", actor: "System AI", timestamp: "2025-07-02T10:00:00Z", description: "AI extraction selesai. Chunks: 3. Confidence: 92%." },
  { id: "H-004-5", documentId: "DOC-004", eventType: "metadata_updated", actor: "Admin HSE", timestamp: "2026-01-05T09:00:00Z", description: "Metadata diperbarui: Sub Kategori ditambahkan.", changes: { field: "subCategories", added: ["Lingkungan Hidup"] } },
  { id: "H-004-6", documentId: "DOC-004", eventType: "sync_completed", actor: "System Scheduler", timestamp: "2026-06-29T15:29:00Z", description: "Metadata updated. Rev 3 detected, semantic index refreshed", changes: { action: "metadata_updated" } },
  // DOC-008 — failed extraction
  { id: "H-008-1", documentId: "DOC-008", eventType: "created", actor: "Admin HSE", timestamp: "2026-03-20T08:00:00Z", description: "Dokumen Prosedur MOC dibuat." },
  { id: "H-008-2", documentId: "DOC-008", eventType: "uploaded", actor: "Admin HSE", timestamp: "2026-03-20T08:05:00Z", description: "File PDF diunggah." },
  { id: "H-008-3", documentId: "DOC-008", eventType: "extraction_failed", actor: "System AI", timestamp: "2026-03-25T09:00:00Z", description: "Extraction gagal. Error: Document format tidak didukung atau file corrupt." },
  // DOC-021 — expired
  { id: "H-021-1", documentId: "DOC-021", eventType: "created", actor: "Admin HSE", timestamp: "2026-01-15T08:00:00Z", description: "Standar Guards dan Barriers dibuat." },
  { id: "H-021-2", documentId: "DOC-021", eventType: "approved", actor: "Dept. Safety", timestamp: "2026-02-01T08:00:00Z", description: "Dokumen berlaku efektif." },
  { id: "H-021-3", documentId: "DOC-021", eventType: "expired", actor: "System", timestamp: "2026-06-20T09:00:00Z", description: "Dokumen expired. Revisi baru diperlukan." },
];

// ─── Sync Utility Data ───────────────────────────────────────────────────────

export const mockSyncBatches: KnowledgeSyncBatch[] = [
  {
    id: "SYNC-B-001",
    batchNo: "SYNC-20260629-1528",
    source: "HSE Automation Document Library",
    scope: "all",
    triggeredBy: "Admin / System Scheduler",
    startedAt: "2026-06-29T15:28:00Z",
    totalDocuments: 120,
    processedDocuments: 86,
    updatedDocuments: 8,
    indexedDocuments: 112,
    failedDocuments: 3,
    progressPercent: 72,
    status: "processing",
  }
];

export const mockSyncItems: KnowledgeSyncItem[] = [
  {
    id: "SYNC-I-001",
    batchId: "SYNC-B-001",
    documentId: "DOC-004",
    documentTitle: "Pedoman K3 dan Lingkungan Hidup",
    layerName: "Layer 1",
    folderName: "1.2 Kebijakan Perusahaan",
    action: "metadata_updated",
    status: "done",
    progressPercent: 100,
    updatedAt: "2026-06-29T15:29:00Z",
    message: "Rev 3 detected, semantic index refreshed"
  },
  {
    id: "SYNC-I-002",
    batchId: "SYNC-B-001",
    documentId: "DOC-003",
    documentTitle: "HIRA Workshop Area",
    layerName: "Layer 1",
    folderName: "1.1 HIRA",
    action: "extraction_rebuild",
    status: "extracting",
    progressPercent: 64,
    updatedAt: "2026-06-29T15:30:00Z",
    message: "Extracting page 8 of 12"
  },
  {
    id: "SYNC-I-003",
    batchId: "SYNC-B-001",
    documentId: "DOC-012",
    documentTitle: "Standar Workshop Eksplorasi",
    layerName: "Layer 2",
    folderName: "2.6 Standarisasi & Inspection Tools",
    action: "new_document_indexed",
    status: "done",
    progressPercent: 100,
    updatedAt: "2026-06-29T15:31:00Z",
    message: "24 chunks created"
  },
  {
    id: "SYNC-I-004",
    batchId: "SYNC-B-001",
    documentId: "DOC-006",
    documentTitle: "Management Review Q2 2026",
    layerName: "Layer 1",
    folderName: "1.3 Management Review",
    action: "failed_fetch",
    status: "failed",
    progressPercent: 0,
    updatedAt: "2026-06-29T15:32:00Z",
    message: "Source file not reachable"
  }
];

// ─── Helper functions ────────────────────────────────────────────────────────

export function getDocumentsByFolder(folderId: string): KnowledgeDocument[] {
  return mockDocuments.filter(d => d.folderId === folderId);
}

export function getFoldersByLayer(layerId: string): KnowledgeFolder[] {
  return mockFolders.filter(f => f.layerId === layerId);
}

export function getExtractionByDocumentId(documentId: string): KnowledgeExtraction | undefined {
  return mockExtractions.find(e => e.documentId === documentId);
}

export function getRelatedDocuments(documentId: string): RelatedDocument[] {
  return mockRelatedDocuments.filter(r => r.documentId === documentId);
}

export function getHistoryByDocumentId(documentId: string): KnowledgeHistoryEvent[] {
  return mockHistoryEvents
    .filter(h => h.documentId === documentId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function getDocumentById(documentId: string): KnowledgeDocument | undefined {
  return mockDocuments.find(d => d.id === documentId);
}
