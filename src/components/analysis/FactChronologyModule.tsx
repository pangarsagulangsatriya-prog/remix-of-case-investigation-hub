import React, { useState, useMemo } from 'react';
import { 
  Clock, 
  Brain, 
  User, 
  Pencil, 
  Check, 
  CheckCircle2,
  X, 
  AlertTriangle,
  Presentation,
  Table as TableIcon,
  Search,
  History,
  PanelRightOpen,
  EllipsisVertical,
  Calendar,
  MapPin,
  Tag,
  Shield,
  Layers,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Cpu,
  Maximize2,
  ZoomIn,
  ZoomOut,
  FileText,
  MessageSquare,
  Activity,
  Mic,
  Camera,
  Video,
  FileSearch,
  ChevronDown,
  ExternalLink,
  ShieldCheck,
  Zap,
  Quote,
  XCircle,
  Eye,
  EyeOff,
  Crosshair,
  BarChart3,
  Trash2
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const extractStringValue = (val: any, fallback = "-"): string => {
  if (val === null || val === undefined) return fallback;
  if (typeof val === "string") return val;
  if (typeof val === "number" || typeof val === "boolean") return String(val);
  if (typeof val === "object") {
    if ("value" in val && val.value !== val) return extractStringValue(val.value, fallback);
    if ("label" in val) return extractStringValue(val.label, fallback);
    if ("name" in val) return extractStringValue(val.name, fallback);
    if ("text" in val) return extractStringValue(val.text, fallback);
    try {
      return JSON.stringify(val);
    } catch {
      return fallback;
    }
  }
  return String(val);
};

export type ChronologyPhase = "pre_contact" | "contact" | "post_contact";
export type VerificationStatus = "ai_generated" | "human_verified" | "needs_review" | "partially_supported" | "unsupported";

export interface Traceability {
  trace_id: string;
  source_type: "audio" | "image" | "document" | "video" | "other";
  source_file_name: string;
  source_file_id: string;
  extraction_run_id: string;
  chunk_id?: string;
  page_number?: number;
  timestamp_start?: string;
  timestamp_end?: string;
  frame_ref?: string;
  extracted_content: string;
  extracted_summary?: string;
  support_type: "direct" | "partial" | "contextual";
  confidence_score: number;
}

export interface SPOKField {
  value: string;
  evidence?: string;
  original_value?: string;
  annotated_by_human?: boolean;
  citations?: any[];
}

export type EntityType = "PERSON" | "UNIT" | "SITE" | "COMPANY" | "LOCATION" | "EQUIPMENT" | "SYSTEM";
export type EntityMatchResult = "same_entity" | "different_entity" | "unknown_entity";
export type SemanticMatchResult = "same_meaning" | "partial_meaning" | "different_meaning";

export interface AccuracyFieldResult {
  label: string;
  aiValue: string;
  humanValue: string;
  isAnnotated: boolean;
  levenshteinDistance: number;
  maxLength: number;
  similarityPercent: number;
  level: string;
  fieldScore: number;
  // Hybrid scoring fields
  lexicalSimilarity: number;
  entityType: EntityType | null;
  aiEntity: string | null;
  annotationEntity: string | null;
  aiCanonicalEntityId: string | null;
  annotationCanonicalEntityId: string | null;
  entityMatch: EntityMatchResult | null;
  semanticSimilarity: number | null;
  criticalMismatch: boolean;
  scoreCap: number | null;
  reason: string;
}

export interface AccuracyResult {
  accuracy: number;
  validFieldsCount: number;
  fields: AccuracyFieldResult[];
  calculatedAt: string;
  engineVersion: string;
}

export type AuditAction = "CREATE" | "UPDATE" | "DELETE";
export type ActorType = "HUMAN" | "AI" | "SYSTEM";

export interface AnalysisVersion {
  version: number;
  stage: ChronologyPhase;
  time: string;
  description: string;
  createdAt: string;
  actorName?: string;
  actorRole?: string;
  actorType?: ActorType;
  changeNote?: string;
}

export type ProvenanceType = "AI_GENERATED" | "AI_HUMAN_ANNOTATED" | "HUMAN_MANUAL";

export interface ProvenanceData {
  provenanceType?: ProvenanceType;
  originalSource?: {
    actorId: string;
    actorName: string;
    actorType: "AI" | "HUMAN";
    timestamp: string;
    agentName?: string;
  };
  createdBy?: {
    id: string;
    name: string;
    role: string;
    actorType: "AI" | "HUMAN";
  };
  currentVersion?: number;
  humanAnnotationCount?: number;
  manualRevisionCount?: number;
  latestHumanChange?: {
    userId: string;
    userName: string;
    userRole: string;
    timestamp: string;
    changedFields: string[];
    changeNote: string;
    versionFrom: number;
    versionTo: number;
  };
  versions?: AnalysisVersion[];
}

export interface AuditEntry {
  id: string;
  caseId: string;
  agentId: string;
  itemId: string;
  action: AuditAction;
  actorName: string;
  actorRole: string;
  actorType: ActorType;
  timestamp: string;
  versionFrom?: number;
  versionTo: number;
  changeNote?: string;
  deletionReason?: string;
  changedFields?: string[];
  before?: AnalysisVersion;
  after?: AnalysisVersion;
}

export interface ChronologyItem extends ProvenanceData {
  version?: number;
  id: string;
  time_label: string;
  chronology_text: string;
  description?: string;
  phase: ChronologyPhase;
  source?: "ai" | "human";
  annotated_by_human: boolean;
  verification_status: VerificationStatus;
  created_at: string;
  updated_at: string;
  updated_by?: string;
  original_text?: string;
  traceability?: Traceability[];
  synthesis_summary?: string;
  support_strength?: number;
  confidence?: "high" | "medium" | "low";
  status?: "completed" | "draft" | "reviewed";
  agentId?: string;
  breakdown?: {
    subject?: SPOKField;
    action?: SPOKField;
    object?: SPOKField;
    source_system?: SPOKField;
    condition?: SPOKField;
    time?: string;
    phase?: string;
    actor?: string;
    location?: SPOKField;
    why?: SPOKField;
  };
}

const getEvidenceStackSummary = (item: ChronologyItem) => {
  const fields = ["subject", "action", "object", "source_system", "condition"] as const;
  let primary = 0;
  let operational = 0;
  let visual = 0;
  let gaps = 0;

  fields.forEach((field) => {
    const raw = (item.breakdown?.[field] as any)?.citations || [];
    if (!raw.length && !(item.breakdown?.[field] as any)?.evidence) gaps += 1;
    raw.forEach((citation: any) => {
      const type = citation?.type;
      if (type === "audio" || type === "document" || type === "doc") primary += 1;
      else if (type === "video" || type === "image") visual += 1;
      else operational += 1;
    });
  });

  const status = gaps > 1 ? "Unvalidated" : "Corroborated";
  return { primary, operational, visual, gaps, status };
};

export interface FactMetadata {
  incidentDate: string;
  incidentTime: string;
  location: string;
  incidentType: string;
  department: string;
  evidenceSource: string;
  severity: string;
  summary: string;
  caseCode: string;
}

interface FactChronologyModuleProps {
  initialItems: ChronologyItem[];
  metadata: FactMetadata;
  onSync?: (items: ChronologyItem[]) => void;
  viewMode?: 'slide' | 'default';
  onViewModeChange?: (mode: 'slide' | 'default') => void;
  onSelectItem?: (itemId: string | null) => void;
  selectedItemId?: string | null;
  tableData?: any;
  readonly?: boolean;
  cleanMode?: boolean;
}

const PHASE_CONFIG = {
  pre_contact: {
    label: "PRA-KONTAK",
    color: "bg-[#ffff99]",
    lightColor: "bg-[#ffff99]/20",
    borderColor: "border-[#ffff99]",
    textColor: "text-slate-900",
    dotColor: "bg-[#ffff99]",
  },
  contact: {
    label: "KONTAK",
    color: "bg-[#ff3333]",
    lightColor: "bg-[#ff3333]/20",
    borderColor: "border-[#ff3333]",
    textColor: "text-slate-900",
    dotColor: "bg-[#ff3333]",
  },
  post_contact: {
    label: "PASCA KONTAK",
    color: "bg-[#00b0f0]",
    lightColor: "bg-[#00b0f0]/20",
    borderColor: "border-[#00b0f0]",
    textColor: "text-slate-900",
    dotColor: "bg-[#00b0f0]",
  }
};

export const STATUS_CONFIG: Record<VerificationStatus, { label: string, color: string, icon: any }> = {
  ai_generated: { label: "Dihasilkan AI", color: "bg-blue-50 text-blue-600 border-blue-100", icon: Brain },
  human_verified: { label: "Terverifikasi Manusia", color: "bg-emerald-50 text-emerald-600 border-emerald-100", icon: ShieldCheck },
  needs_review: { label: "Perlu Ditinjau", color: "bg-amber-50 text-amber-600 border-amber-100", icon: Clock },
  partially_supported: { label: "Didukung Sebagian", color: "bg-violet-50 text-violet-600 border-violet-100", icon: Crosshair },
  unsupported: { label: "Tidak Didukung", color: "bg-rose-50 text-rose-600 border-rose-100", icon: AlertTriangle },
};

const initialDummyAuditLogs: AuditEntry[] = [
  {
    id: "a8",
    caseId: "c1",
    agentId: "fact",
    itemId: "post_1",
    action: "DELETE",
    actorName: "Aditya Pratama",
    actorRole: "Safety Superintendent",
    actorType: "HUMAN",
    timestamp: "2026-08-05T09:04:00Z",
    versionTo: 3,
    deletionReason: "Item dihapus dari analisis aktif karena sudah tercatat di laporan terpisah.",
    changeNote: "Menghapus fakta redundan",
    before: {
      version: 2,
      stage: "post_contact",
      time: "Pasca 01:35",
      description: "Item dihapus dari analisis aktif.",
      createdAt: "2026-08-05T08:50:00Z"
    }
  },
  {
    id: "a7",
    caseId: "c1",
    agentId: "fact",
    itemId: "post_1",
    action: "CREATE",
    actorName: "Aditya Pratama",
    actorRole: "Safety Superintendent",
    actorType: "HUMAN",
    timestamp: "2026-08-05T08:50:00Z",
    versionTo: 1,
    after: {
      version: 1,
      stage: "post_contact",
      time: "Pasca 01:35",
      description: "Item dihapus dari analisis aktif.",
      createdAt: "2026-08-05T08:50:00Z"
    }
  },
  {
    id: "a6",
    caseId: "c1",
    agentId: "fact",
    itemId: "pre_2",
    action: "UPDATE",
    actorName: "Gulang Satriya",
    actorRole: "Lead Investigator",
    actorType: "HUMAN",
    timestamp: "2026-08-05T08:16:00Z",
    versionFrom: 1,
    versionTo: 2,
    changeNote: "Mengoreksi format waktu",
    changedFields: ["time_label"],
    before: {
      version: 1,
      stage: "pre_contact",
      time: "22:15",
      description: "DMS memberikan peringatan kepada operator.",
      createdAt: "2026-08-05T07:42:00Z"
    },
    after: {
      version: 2,
      stage: "pre_contact",
      time: "22:15 WITA",
      description: "Sistem DMS memicu peringatan kritis kategori Lockdown pada unit yang sedang dioperasikan oleh Operator Saiful.",
      createdAt: "2026-08-05T07:42:00Z"
    }
  },
  {
    id: "a5",
    caseId: "c1",
    agentId: "fact",
    itemId: "pre_2",
    action: "UPDATE",
    actorName: "Gulang Satriya",
    actorRole: "Lead Investigator",
    actorType: "HUMAN",
    timestamp: "2026-08-05T08:00:00Z",
    versionFrom: 1,
    versionTo: 2,
    changeNote: "Memperbaiki narasi kejadian",
    changedFields: ["chronology_text"],
    before: {
      version: 1,
      stage: "pre_contact",
      time: "22:15",
      description: "DMS memberikan peringatan kepada operator.",
      createdAt: "2026-08-05T07:42:00Z"
    },
    after: {
      version: 2,
      stage: "pre_contact",
      time: "22:15",
      description: "Sistem DMS memicu peringatan kritis kategori Lockdown pada unit yang sedang dioperasikan oleh Operator Saiful.",
      createdAt: "2026-08-05T07:42:00Z"
    }
  },
  {
    id: "a4",
    caseId: "c1",
    agentId: "fact",
    itemId: "pre_2",
    action: "CREATE",
    actorName: "Rina Mahardika",
    actorRole: "Investigator",
    actorType: "HUMAN",
    timestamp: "2026-08-05T07:42:00Z",
    versionTo: 1,
    after: {
      version: 1,
      stage: "pre_contact",
      time: "22:15",
      description: "DMS memberikan peringatan kepada operator.",
      createdAt: "2026-08-05T07:42:00Z"
    }
  },
  {
    id: "a3",
    caseId: "c1",
    agentId: "fact",
    itemId: "post_2",
    action: "CREATE",
    actorName: "Fact & Chronology Agent",
    actorRole: "AI Analysis Agent",
    actorType: "AI",
    timestamp: "2026-08-05T07:05:00Z",
    versionTo: 1,
    after: {
      version: 1,
      stage: "post_contact",
      time: "Pasca 01:35",
      description: "Tim rescue tiba di lokasi dan melakukan evakuasi.",
      createdAt: "2026-08-05T07:05:00Z"
    }
  },
  {
    id: "a2",
    caseId: "c1",
    agentId: "fact",
    itemId: "contact_1",
    action: "CREATE",
    actorName: "Fact & Chronology Agent",
    actorRole: "AI Analysis Agent",
    actorType: "AI",
    timestamp: "2026-08-05T07:02:00Z",
    versionTo: 1,
    after: {
      version: 1,
      stage: "contact",
      time: "01:35 WITA",
      description: "Unit Operator Saiful mengalami kecelakaan tunggal.",
      createdAt: "2026-08-05T07:02:00Z"
    }
  },
  {
    id: "a1",
    caseId: "c1",
    agentId: "fact",
    itemId: "pre_1",
    action: "CREATE",
    actorName: "Fact & Chronology Agent",
    actorRole: "AI Analysis Agent",
    actorType: "AI",
    timestamp: "2026-08-05T07:00:00Z",
    versionTo: 1,
    after: {
      version: 1,
      stage: "pre_contact",
      time: "Minggu 10-41",
      description: "Petugas DMS mengidentifikasi riwayat deviasi kelelahan.",
      createdAt: "2026-08-05T07:00:00Z"
    }
  }
];

export const FactChronologyModule: React.FC<FactChronologyModuleProps> = ({ 
  initialItems, 
  metadata,
  onSync,
  viewMode: controlledViewMode,
  onViewModeChange,
  onSelectItem,
  selectedItemId: controlledSelectedItemId,
  tableData,
  readonly = false,
  cleanMode = false
}) => {
  const [items, setItems] = useState<ChronologyItem[]>(initialItems.map(item => ({ ...item, version: item.version || 1 })));
  const [internalSelectedFactId, setInternalSelectedFactId] = useState<string | null>(null);
  const [displayFormat, setDisplayFormat] = useState<'timeline' | 'table' | 'flow'>('timeline');
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>(initialDummyAuditLogs);
  const [isAuditDrawerOpen, setIsAuditDrawerOpen] = useState(false);
  const [editChangeNote, setEditChangeNote] = useState("");
  const [addChangeNote, setAddChangeNote] = useState("");
  const [itemToDelete, setItemToDelete] = useState<ChronologyItem | null>(null);
  const [deleteReason, setDeleteReason] = useState("");
  const [auditItemFilter, setAuditItemFilter] = useState<string | null>(null);

  React.useEffect(() => {
    setItems(initialItems.map(item => ({ ...item, version: item.version || 1 })));
  }, [initialItems]);
  
  const viewMode = 'default';
  const selectedFactId = controlledSelectedItemId || internalSelectedFactId;
  const setSelectedFactId = (id: string | null) => {
    if (onSelectItem) onSelectItem(id);
    setInternalSelectedFactId(id);
  };

  const selectedItem = useMemo(() => {
    if (!selectedFactId) return null;
    return items.find(i => i.id === selectedFactId) || null;
  }, [items, selectedFactId]);

  const [detailFactId, setDetailFactId] = useState<string | null>(null);
  const [detailMode, setDetailMode] = useState<'detail' | 'history'>('detail');

  const detailItem = useMemo(() => {
    if (!detailFactId) return null;
    return items.find(i => i.id === detailFactId) || null;
  }, [items, detailFactId]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBuffer, setEditBuffer] = useState<Partial<ChronologyItem>>({});

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalPhase, setAddModalPhase] = useState<string>("pre_contact");
  const [addModalTime, setAddModalTime] = useState("");
  const [addModalDesc, setAddModalDesc] = useState("");
  const [addModalErrors, setAddModalErrors] = useState<{phase?: string, time?: string, desc?: string}>({});
  const [isAddingFact, setIsAddingFact] = useState(false);
  const [showAddSuccess, setShowAddSuccess] = useState(false);

  const openAddModal = (phase: string) => {
    setAddModalPhase(phase);
    setAddModalTime("");
        setAddModalDesc("");
    setAddModalErrors({});
    setShowAddSuccess(false);
    setIsAddModalOpen(true);
  };

  const handleSaveNewFact = () => {
    const errors: {phase?: string, time?: string, desc?: string} = {};
    if (!addModalPhase) errors.phase = "Pilih fase terlebih dahulu";
    if (!addModalTime.trim()) errors.time = "Isi waktu kejadian";
    if (!addModalDesc.trim()) errors.desc = "Deskripsi kejadian belum diisi";

    if (Object.keys(errors).length > 0) {
      setAddModalErrors(errors);
      return;
    }

    setAddModalErrors({});
    setIsAddingFact(true);
    
    setTimeout(() => {
      const newId = "new-fact-" + Date.now();
      const ts = new Date().toISOString();
      const combinedTime = addModalTime.trim();
      const newFact: ChronologyItem = {
        id: newId,
        version: 1,
        no: (items.length + 1).toString(),
        time: combinedTime,
        date: "",
        time_label: combinedTime,
        chronology_text: addModalDesc,
        phase: addModalPhase as ChronologyPhase,
        source: "human",
        annotated_by_human: true,
        verification_status: "human_verified",
        created_at: ts,
        updated_at: ts
      };
      setItems(prev => [...prev, newFact]);
      
      const audit: AuditEntry = {
        id: "log-" + Date.now(),
        caseId: "c1",
        agentId: "fact",
        itemId: newId,
        action: "CREATE",
        actorName: "Gulang Satriya",
        actorRole: "Lead Investigator",
        actorType: "HUMAN",
        timestamp: ts,
        versionTo: 1,
        after: {
          version: 1,
          stage: newFact.phase,
          time: newFact.time_label,
          description: newFact.chronology_text,
          createdAt: ts
        }
      };
      setAuditLogs(prev => [audit, ...prev]);
      
      setIsAddingFact(false);
      setShowAddSuccess(true);
      
      setTimeout(() => {
        setIsAddModalOpen(false);
        setInternalSelectedFactId(newId);
        // We do not reset success here to avoid flash, but rely on openAddModal for reset
      }, 1000);
    }, 600);
  };
  const handleEdit = (item: ChronologyItem) => {
    setEditingId(item.id);
    setEditBuffer({ ...item });
    setEditChangeNote("");
  };

  const handleAddFact = (phase: string) => {
    openAddModal(phase);
  };

  const handleSaveEdit = () => {
    if (!editingId) return;
    const ts = new Date().toISOString();
    setItems(prev => prev.map(item => {
      if (item.id === editingId) {
        const isActuallyChanged = 
          item.chronology_text !== editBuffer.chronology_text || 
          item.time_label !== editBuffer.time_label ||
          item.verification_status !== editBuffer.verification_status;
        
        if (!isActuallyChanged) return item;

        const nextVersion = (item.version || 1) + 1;
        const updatedItem = {
          ...item,
          ...editBuffer,
          version: nextVersion,
          source: "human",
          annotated_by_human: true,
          updated_at: ts,
          updated_by: "Gulang Satriya",
          original_text: item.original_text || item.chronology_text
        } as ChronologyItem;

        const changedFields: string[] = [];
        if (item.time_label !== updatedItem.time_label) changedFields.push("Time");
        if (item.chronology_text !== updatedItem.chronology_text) changedFields.push("Description");

        const audit: AuditEntry = {
          id: "log-" + Date.now(),
          caseId: "c1",
          agentId: "fact",
          itemId: updatedItem.id,
          action: "UPDATE",
          actorName: "Gulang Satriya",
          actorRole: "Lead Investigator",
          actorType: "HUMAN",
          timestamp: ts,
          versionFrom: item.version || 1,
          versionTo: nextVersion,
          changeNote: editChangeNote,
          changedFields,
          before: {
            version: item.version || 1,
            stage: item.phase,
            time: item.time_label,
            description: item.chronology_text,
            createdAt: item.created_at
          },
          after: {
            version: nextVersion,
            stage: updatedItem.phase,
            time: updatedItem.time_label,
            description: updatedItem.chronology_text,
            createdAt: updatedItem.created_at
          }
        };
        setAuditLogs(prevLogs => [audit, ...prevLogs]);

        return updatedItem;
      }
      return item;
    }));

    setEditingId(null);
    setEditBuffer({});
    setEditChangeNote("");
    toast.success("Perubahan disimpan sebagai versi " + (items.find(i => i.id === editingId)?.version ? items.find(i => i.id === editingId)!.version! + 1 : 2) + ".");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditBuffer({});
    setEditChangeNote("");
  };

  const handleDelete = (id: string) => {
    const item = items.find(i => i.id === id);
    if (item) {
      setItemToDelete(item);
      setDeleteReason("");
    }
  };

  const confirmDelete = () => {
    if (!itemToDelete) return;
    if (!deleteReason.trim()) {
      toast.error("Alasan penghapusan wajib diisi!");
      return;
    }
    
    const ts = new Date().toISOString();
    const audit: AuditEntry = {
      id: "log-" + Date.now(),
      caseId: "c1",
      agentId: "fact",
      itemId: itemToDelete.id,
      action: "DELETE",
      actorName: "Gulang Satriya",
      actorRole: "Lead Investigator",
      actorType: "HUMAN",
      timestamp: ts,
      versionTo: (itemToDelete.version || 1) + 1,
      deletionReason: deleteReason,
      before: {
        version: itemToDelete.version || 1,
        stage: itemToDelete.phase,
        time: itemToDelete.time_label,
        description: itemToDelete.chronology_text,
        createdAt: itemToDelete.created_at
      }
    };
    
    setAuditLogs(prev => [audit, ...prev]);
    setItems(prev => prev.filter(item => item.id !== itemToDelete.id));
    setItemToDelete(null);
    setDeleteReason("");
    toast.success("Fakta dihapus dari analisis aktif. Riwayat tetap tersimpan.");
  };

  const groupedItems = useMemo(() => {
    return {
      pre_contact: items.filter(i => i.phase === 'pre_contact'),
      contact: items.filter(i => i.phase === 'contact'),
      post_contact: items.filter(i => i.phase === 'post_contact'),
    };
  }, [items]);

  return (
    <div className={cn(
      "flex h-full bg-white relative transition-all duration-300",
      viewMode === 'default' ? "overflow-hidden" : ""
    )}>
      <div className="flex-1 flex flex-col min-w-0 h-full relative">

        <div className="shrink-0 p-4 border-b border-slate-200 bg-white flex flex-col gap-4 z-10 shadow-sm">
           <div className="flex items-center justify-between">
              <div>
                 <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <History className="h-4 w-4 text-slate-500" />
                    FAKTA & KRONOLOGI
                 </h2>
                 <p className="text-[11px] text-slate-500 mt-1">Rangkaian peristiwa, bukti objektif, dan verifikasi silang multi-sumber.</p>
              </div>
              <div className="flex items-center gap-4">
                {!readonly && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setIsAuditDrawerOpen(true)}
                    className="text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 h-8"
                  >
                    <History className="h-4 w-4 mr-2" />
                    Riwayat Perubahan &middot; {auditLogs.length} aktivitas
                  </Button>
                )}
                
                {!readonly && (
                  <div className="flex bg-slate-100 rounded-lg p-1 border border-slate-200">
                     <button
                        onClick={() => setDisplayFormat('timeline')}
                        className={cn(
                           "px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-md transition-all flex items-center gap-2",
                           displayFormat === 'timeline' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                        )}
                     >
                      <History className="h-3.5 w-3.5" />
                      Timeline
                   </button>
                <button
                   onClick={() => setDisplayFormat('table')}
                   className={cn(
                      "px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-md transition-all flex items-center gap-2",
                      displayFormat === 'table' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                   )}
                >
                   <TableIcon className="h-3.5 w-3.5" />
                   Table
                </button>
             </div>
                )}
           </div>
        </div>
        </div>

        <div className="flex-1 overflow-hidden">
            {displayFormat === 'timeline' ? (
               <FactDefaultView 
                 items={items} 
                 groupedItems={groupedItems} 
                 editingId={editingId} 
                 editBuffer={editBuffer} 
                 setEditBuffer={setEditBuffer} 
                 onEdit={handleEdit} 
                 onSave={handleSaveEdit} 
                 onCancel={() => { setEditingId(null); setEditBuffer({}); setEditChangeNote(""); }} 
                 onDelete={handleDelete}
                 onOpenDetail={(id, mode = 'detail') => {
                   setDetailFactId(id);
                   setDetailMode(mode);
                 }}
                 metadata={metadata}
                 selectedFactId={selectedFactId}
                 onSelectItem={setSelectedFactId}
                 onAddFact={handleAddFact}
                 editChangeNote={editChangeNote}
                 setEditChangeNote={setEditChangeNote}
                 readonly={readonly}
               />
            ) : (
               <FactTableView 
                 groupedItems={groupedItems}
                 editingId={editingId}
                 editBuffer={editBuffer}
                 setEditBuffer={setEditBuffer}
                 onEdit={handleEdit}
                 onSave={handleSaveEdit}
                 onCancel={handleCancelEdit}
                 onDelete={handleDelete}
                 onOpenDetail={(id, mode = 'detail') => {
                   setDetailFactId(id);
                   setDetailMode(mode);
                 }}
                 selectedFactId={selectedFactId}
                 onSelectItem={setSelectedFactId}
                 onAddFact={openAddModal}
                 setDisplayFormat={setDisplayFormat} 
                 readonly={readonly}
                 editChangeNote={editChangeNote}
                 setEditChangeNote={setEditChangeNote}
               />
            )}
        </div>

        {/* Sync Button Removed */}
      </div>

      {/* Add Fact Modal (Upgraded) */}
      <Dialog open={isAddModalOpen} onOpenChange={(open) => {
        if (!open && (addModalTime || addModalDesc) && !showAddSuccess) {
           if (window.confirm("Batal menambahkan fakta? Data yang Anda ketik akan hilang.")) {
             setIsAddModalOpen(false);
           }
        } else {
           setIsAddModalOpen(open);
        }
      }}>
        <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border-slate-200 shadow-2xl transition-all duration-300 gap-0">
          <div className="px-6 pt-6 pb-4 border-b border-slate-100 bg-white">
            <DialogTitle className="text-lg font-bold text-slate-900 tracking-tight">Tambah Data Fakta Baru</DialogTitle>
            <p className="text-[13px] text-slate-500 mt-1">Tambahkan fakta manual ke kronologi investigasi</p>
          </div>
          <div className="px-6 py-6 space-y-6 bg-slate-50/50">
            <div className="flex gap-4">
              {/* Phase */}
              <div className="flex-1 space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-widest">Fase</label>
                <Select value={addModalPhase} onValueChange={(val) => {
                  setAddModalPhase(val);
                  if (addModalErrors.phase) setAddModalErrors(e => ({...e, phase: undefined}));
                }}>
                  <SelectTrigger className={cn("bg-white h-9 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors", addModalErrors.phase && "border-rose-300 focus:border-rose-500 focus:ring-rose-500/20")}>
                    <SelectValue placeholder="Pilih fase" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pre_contact" className="hover:bg-slate-50">Pra-Kontak</SelectItem>
                    <SelectItem value="contact" className="hover:bg-slate-50">Kontak</SelectItem>
                    <SelectItem value="post_contact" className="hover:bg-slate-50">Pasca-Kontak</SelectItem>
                  </SelectContent>
                </Select>
                {addModalErrors.phase && <p className="text-[11px] text-rose-500">{addModalErrors.phase}</p>}
              </div>

              {/* Time Group */}
              <div className="flex-1 space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-widest">Waktu Kejadian</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    value={addModalTime} 
                    onChange={(e) => {
                      setAddModalTime(e.target.value);
                      if (addModalErrors.time) setAddModalErrors(err => ({...err, time: undefined}));
                    }} 
                    placeholder="Contoh: 14:30 WIB" 
                    className={cn("pl-9 h-9 bg-white focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 transition-colors placeholder:text-slate-300", addModalErrors.time && "border-rose-300 focus-visible:border-rose-500 focus-visible:ring-rose-500/20")}
                    autoFocus
                  />
                </div>
                {addModalErrors.time && <p className="text-[11px] text-rose-500">{addModalErrors.time}</p>}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-end">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-widest">Deskripsi Kejadian</label>
                <span className="text-[10px] text-slate-400">Jelas & Spesifik</span>
              </div>
              <Textarea 
                value={addModalDesc} 
                onChange={(e) => {
                  setAddModalDesc(e.target.value);
                  if (addModalErrors.desc) setAddModalErrors(err => ({...err, desc: undefined}));
                }} 
                placeholder="Tulis fakta atau kejadian yang ingin ditambahkan..." 
                className={cn("min-h-[120px] bg-white resize-none text-[13px] leading-relaxed focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 transition-colors placeholder:text-slate-300", addModalErrors.desc && "border-rose-300 focus-visible:border-rose-500 focus-visible:ring-rose-500/20")}
              />
              {addModalErrors.desc && <p className="text-[11px] text-rose-500">{addModalErrors.desc}</p>}
            </div>
          </div>

          <div className="px-6 py-4 border-t border-slate-100 bg-white flex items-center justify-between">
            <div className="flex-1">
              {showAddSuccess && (
                <div className="flex items-center gap-2 text-emerald-600 animate-in fade-in zoom-in-95 duration-200">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-xs font-medium">Fakta berhasil ditambahkan</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                className="text-xs font-medium h-9 text-slate-500 hover:text-slate-800" 
                onClick={() => setIsAddModalOpen(false)}
                disabled={isAddingFact || showAddSuccess}
              >
                Batal
              </Button>
              <Button 
                onClick={handleSaveNewFact} 
                disabled={isAddingFact || showAddSuccess}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold h-9 px-5 transition-all shadow-sm"
              >
                {isAddingFact ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                    Menyimpan...
                  </>
                ) : showAddSuccess ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5 mr-2" />
                    Tersimpan
                  </>
                ) : (
                  "Simpan Fakta"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Fact Modal */}
      <Dialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-rose-600">HAPUS FAKTA?</DialogTitle>
          </DialogHeader>
          <div className="py-2 text-sm text-slate-600">
            <p>Item ini akan dihapus dari analisis aktif.</p>
            <p>Riwayat dan versi sebelumnya tetap tersimpan dalam Audit Log.</p>
          </div>
          
          {itemToDelete && (
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-md text-xs">
              <div className="font-bold text-slate-700 mb-1">
                {PHASE_CONFIG[itemToDelete.phase]?.label} &middot; {itemToDelete.time_label}
              </div>
              <div className="text-slate-600 line-clamp-2">
                {itemToDelete.chronology_text}
              </div>
            </div>
          )}

          <div className="grid gap-4 py-2">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700 uppercase">Alasan Penghapusan</label>
              <Textarea 
                value={deleteReason} 
                onChange={(e) => setDeleteReason(e.target.value)} 
                placeholder="Wajib diisi..." 
                className="min-h-[80px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setItemToDelete(null)}>Batal</Button>
            <Button onClick={confirmDelete} className="bg-rose-600 hover:bg-rose-700 text-white">Hapus Fakta</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Traceability Panel */}
      {detailItem && (
        <div className="w-[420px] shrink-0 border-l border-slate-200 h-full animate-in slide-in-from-right duration-300">
          <TraceabilityPanel 
            readonly={true}
            defaultShowHistory={detailMode === 'history'}
            item={{ ...detailItem, agentId: 'fact' }}
            onClose={() => setDetailFactId(null)}
            onUpdateStatus={(newStatus) => {
              setItems(prev => {
                const updated = prev.map(item => 
                  item.id === detailItem.id 
                    ? { 
                        ...item, 
                        verification_status: newStatus,
                        annotated_by_human: true,
                        updated_at: new Date().toISOString(),
                        updated_by: "Current User"
                      } 
                    : item
                );
                if (onSync) onSync(updated);
                return updated;
              });
              toast.success("Verification status updated.");
            }}
            onUpdateBreakdown={(newBreakdown) => {
              setItems(prev => {
                const updated = prev.map(item => 
                  item.id === selectedItem.id 
                    ? { 
                        ...item, 
                        breakdown: newBreakdown,
                        annotated_by_human: true,
                        updated_at: new Date().toISOString(),
                        updated_by: "Current User"
                      } 
                    : item
                );
                if (onSync) onSync(updated);
                return updated;
              });
              toast.success("Dekomposisi Fakta updated.");
            }}
            onUpdateChronologyText={(newText) => {
              setItems(prev => {
                const updated = prev.map(item => 
                  item.id === selectedItem.id 
                    ? { 
                        ...item, 
                        chronology_text: newText,
                        annotated_by_human: true,
                        updated_at: new Date().toISOString(),
                        updated_by: "Current User"
                      } 
                    : item
                );
                if (onSync) onSync(updated);
                return updated;
              });
              toast.success("Chronology text updated.");
            }}
            onEdit={() => handleEdit(selectedItem)}
          />
        </div>
      )}

      {/* Audit Log Drawer */}
      <Sheet open={isAuditDrawerOpen} onOpenChange={setIsAuditDrawerOpen}>
        <SheetContent className="w-full sm:max-w-[480px] p-0 flex flex-col bg-slate-50 border-l border-slate-300 shadow-xl overflow-hidden">
          <SheetHeader className="p-6 border-b border-slate-200 bg-white shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <SheetTitle className="text-sm font-black text-slate-800 uppercase tracking-widest mb-1 flex items-center gap-2">
                  <History className="h-4 w-4 text-blue-600" />
                  RIWAYAT PERUBAHAN
                </SheetTitle>
                <SheetDescription className="text-xs text-slate-500 font-medium">
                  {auditItemFilter ? (
                    <span className="flex items-center gap-2">
                      <button onClick={() => setAuditItemFilter(null)} className="text-blue-600 hover:underline">← Semua Perubahan</button>
                      <span>&middot;</span>
                      Riwayat Item
                    </span>
                  ) : (
                    `Fakta & Kronologi · ${auditLogs.length} aktivitas`
                  )}
                </SheetDescription>
              </div>
            </div>
            
            {!auditItemFilter && (
              <div className="mt-4 flex flex-col gap-3">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <Input 
                    placeholder="Cari waktu, pengguna, atau isi perubahan..."
                    className="pl-8 h-9 text-xs bg-slate-50 border-slate-300"
                  />
                </div>
                <div className="flex gap-2">
                  <Select defaultValue="all">
                    <SelectTrigger className="h-8 text-xs bg-white border-slate-300 flex-1">
                      <SelectValue placeholder="Semua Aksi" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua</SelectItem>
                      <SelectItem value="CREATE">Dibuat</SelectItem>
                      <SelectItem value="UPDATE">Diubah</SelectItem>
                      <SelectItem value="DELETE">Dihapus</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select defaultValue="all">
                    <SelectTrigger className="h-8 text-xs bg-white border-slate-300 flex-1">
                      <SelectValue placeholder="Semua Pengguna" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Pengguna</SelectItem>
                      <SelectItem value="HUMAN">Human</SelectItem>
                      <SelectItem value="AI">AI/System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </SheetHeader>

          <ScrollArea className="flex-1 bg-slate-50/50 p-6">
            <div className="relative border-l border-slate-200 ml-4 pb-4 space-y-8">
              {auditLogs.filter(log => !auditItemFilter || log.itemId === auditItemFilter).length === 0 && (
                <div className="ml-6 mt-4 text-sm text-slate-500 bg-white p-4 rounded-md border border-slate-200 text-center">
                  <History className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                  <p className="font-bold text-slate-700">Belum ada perubahan</p>
                  <p className="text-xs mt-1">Aktivitas create, edit, dan delete pada agent ini akan muncul di sini.</p>
                </div>
              )}
              {auditLogs.filter(log => !auditItemFilter || log.itemId === auditItemFilter).length > 0 && (
                auditLogs
                  .filter(log => !auditItemFilter || log.itemId === auditItemFilter)
                  .map((log) => {
                  const isCreate = log.action === 'CREATE';
                  const isUpdate = log.action === 'UPDATE';
                  const isDelete = log.action === 'DELETE';
                  
                  const phaseLabel = log.after?.stage || log.before?.stage;
                  const timeLabel = log.after?.time || log.before?.time;
                  const previewText = log.after?.description || log.before?.description;

                  return (
                    <div key={log.id} className="relative pl-8">
                      <div className={cn(
                        "absolute -left-2.5 top-1 h-5 w-5 rounded-full border-2 border-white flex items-center justify-center z-10 shadow-sm",
                        isCreate && "bg-emerald-500",
                        isUpdate && "bg-blue-500",
                        isDelete && "bg-rose-500"
                      )}>
                        {isCreate && <Check className="h-3 w-3 text-white" />}
                        {isUpdate && <Pencil className="h-3 w-3 text-white" />}
                        {isDelete && <Trash2 className="h-3 w-3 text-white" />}
                      </div>

                      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden group">
                        <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                          <div className={cn(
                            "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm",
                            isCreate && "bg-emerald-100 text-emerald-700",
                            isUpdate && "bg-blue-100 text-blue-700",
                            isDelete && "bg-rose-100 text-rose-700"
                          )}>
                            {isCreate && "DIBUAT"}
                            {isUpdate && "DIUBAH"}
                            {isDelete && "DIHAPUS"}
                          </div>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {new Date(log.timestamp).toLocaleString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })} WIB
                          </span>
                        </div>

                        <div className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span 
                              className="text-xs font-bold text-slate-700 cursor-pointer hover:text-blue-600 transition-colors"
                              onClick={() => setAuditItemFilter(log.itemId)}
                            >
                              {PHASE_CONFIG[phaseLabel as ChronologyPhase]?.label || "FAKTA"} &middot; {timeLabel}
                            </span>
                          </div>

                          {isDelete && log.deletionReason && (
                            <p className="text-xs text-slate-600 mb-3 bg-rose-50 p-2 rounded border border-rose-100">
                              <span className="font-bold block mb-1">Alasan Penghapusan:</span>
                              {log.deletionReason}
                            </p>
                          )}

                          {(isCreate || isUpdate) && (
                            <div className="text-[11px] text-slate-800 leading-relaxed italic border-l-2 border-slate-300 pl-3 py-1 mb-3">
                              "{isUpdate && log.after ? log.after.description : previewText}"
                            </div>
                          )}

                          {isUpdate && log.before && log.after && (
                            <details className="group">
                              <summary className="text-[10px] font-bold text-blue-600 cursor-pointer hover:text-blue-700 list-none flex items-center gap-1">
                                <span className="group-open:hidden">[Lihat Detail Perubahan]</span>
                                <span className="hidden group-open:inline">[Tutup Detail Perubahan]</span>
                              </summary>
                              
                              <div className="mt-3 space-y-3 pt-3 border-t border-slate-100">
                                {log.changeNote && (
                                  <div>
                                    <div className="text-[9px] font-bold text-slate-400 mb-1">CATATAN ANOTASI</div>
                                    <div className="text-[11px] text-slate-700 bg-slate-50 p-2 rounded border border-slate-100">{log.changeNote}</div>
                                  </div>
                                )}
                                
                                <div>
                                  <div className="text-[9px] font-bold text-slate-400 mb-1">SEBELUM</div>
                                  <div className="bg-red-50 text-red-900 p-2 rounded text-[11px] border border-red-100">
                                    {log.before.time && <span className="font-bold mr-1">{log.before.time} -</span>}
                                    {log.before.description}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-[9px] font-bold text-slate-400 mb-1">SESUDAH</div>
                                  <div className="bg-emerald-50 text-emerald-900 p-2 rounded text-[11px] border border-emerald-100">
                                    {log.after.time && <span className="font-bold mr-1">{log.after.time} -</span>}
                                    {log.after.description}
                                  </div>
                                </div>
                              </div>
                            </details>
                          )}

                          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[10px] text-slate-500 font-medium">Actor</span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-slate-700">{log.actorName}</span>
                                <span className="text-[10px] text-slate-400">&middot; {log.actorRole}</span>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <div className="flex items-center gap-1">
                                {log.actorType === 'AI' && <Brain className="h-3 w-3 text-purple-500" />}
                                {log.actorType !== 'AI' && <User className="h-3 w-3 text-blue-500" />}
                                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                                  {log.actorType === 'AI' ? 'AI GENERATED' : log.actorType === 'SYSTEM' ? 'SYSTEM' : 'HUMAN'}
                                </span>
                              </div>
                              <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                                Versi {log.versionTo}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  );
};

const calculateLevenshteinDistance = (a: string, b: string): number => {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
        );
      }
    }
  }
  return matrix[b.length][a.length];
};

const getSemanticDifferenceScale = (val: string, orig: string) => {
  const v1 = (val || "").toString().toLowerCase().trim();
  const v2 = (orig || "").toString().toLowerCase().trim();
  if (v1 === v2) return { label: "Identik / Sangat Mirip", score: 100, color: "text-emerald-400", bg: "bg-emerald-500" };
  const distance = calculateLevenshteinDistance(v1, v2);
  const maxLen = Math.max(v1.length, v2.length);
  const sim = maxLen === 0 ? 1 : (maxLen - distance) / maxLen;
  const realPercent = Math.round(sim * 100);
  if (sim >= 0.75) return { label: "Identik / Sangat Mirip", score: realPercent, color: "text-emerald-400", bg: "bg-emerald-500" };
  if (sim >= 0.4) return { label: "Berbeda Parsial", score: realPercent, color: "text-amber-400", bg: "bg-amber-500" };
  return { label: "Berbeda Signifikan", score: realPercent, color: "text-rose-400", bg: "bg-rose-500" };
};

const calculateNormalizedSimilarity = (a: string, b: string): { distance: number, maxLength: number, similarity: number } => {
  const v1 = (a || "").toString().toLowerCase().trim();
  const v2 = (b || "").toString().toLowerCase().trim();
  if (v1 === v2) return { distance: 0, maxLength: Math.max(v1.length, v2.length) || 1, similarity: 100 };
  const distance = calculateLevenshteinDistance(v1, v2);
  const maxLength = Math.max(v1.length, v2.length);
  const similarity = maxLength === 0 ? 100 : Math.round(((maxLength - distance) / maxLength) * 100);
  return { distance, maxLength, similarity };
};

const getSimilarityLevel = (similarity: number): string => {
  if (similarity >= 75) return "Identik / Sangat Mirip";
  if (similarity >= 40) return "Berbeda Parsial";
  return "Berbeda Signifikan";
};

// --- HYBRID ENGINE HELPERS ---

const ENTITY_REGISTRY: Record<string, { id: string, type: EntityType, names: string[] }> = {
  "P001": { id: "P001", type: "PERSON", names: ["fatur", "faturrahman", "fatur rahman"] },
  "P002": { id: "P002", type: "PERSON", names: ["fatimah", "siti fatimah"] },
  "U001": { id: "U001", type: "UNIT", names: ["hd-785", "hd785", "komatsu hd 785"] },
  "S001": { id: "S001", type: "SITE", names: ["bmo2", "bmo-2", "site bmo 2"] },
  "C001": { id: "C001", type: "COMPANY", names: ["buma", "pt buma", "pt bukit makmur mandiri utama"] }
};

const resolveEntity = (text: string): { id: string | null, type: EntityType | null, name: string | null } => {
  if (!text) return { id: null, type: null, name: null };
  const normalized = text.toLowerCase().trim();
  
  for (const [id, entity] of Object.entries(ENTITY_REGISTRY)) {
    if (entity.names.some(n => normalized.includes(n) || n.includes(normalized))) {
      return { id: entity.id, type: entity.type, name: entity.names[0] };
    }
  }
  return { id: null, type: null, name: text }; 
};

const getCategoryEntityType = (label: string): EntityType | null => {
  if (label === "PIHAK") return "PERSON";
  if (label === "OBJEK") return "UNIT";
  if (label === "SUMBER") return "SYSTEM";
  return null;
};

const isIdentitySensitive = (label: string) => ["PIHAK", "OBJEK", "SUMBER"].includes(label);

const evaluateSemanticSimilarity = (aiVal: string, humVal: string): SemanticMatchResult => {
  const { similarity } = calculateNormalizedSimilarity(aiVal, humVal);
  if (similarity >= 75) return "same_meaning";
  if (similarity >= 40) return "partial_meaning";
  return "different_meaning";
};

const extractCoreEntityName = (text: string): string => {
  if (!text) return "";
  const t = text.trim();
  const match = t.match(/\(([^)]+)\)/);
  if (match) return match[1].toLowerCase().trim();
  const words = t.split(/\s+/);
  if (words.length > 1) return words[words.length - 1].toLowerCase().trim();
  return t.toLowerCase().trim();
};

// --- END HYBRID ENGINE HELPERS ---

const calculateItemAccuracy = (item: ChronologyItem): AccuracyResult => {
  const breakdown = item.breakdown || {};
  const fieldsForAccuracy = [
    { label: "WAKTU", val: breakdown.time || item.time_label, orig: (breakdown as any).time_original_value || breakdown.time || item.time_label, isHuman: !!(breakdown as any).time_annotated_by_human },
    { label: "PIHAK", val: breakdown.subject?.value || breakdown.actor, orig: breakdown.subject?.original_value || breakdown.subject?.value || breakdown.actor, isHuman: !!breakdown.subject?.annotated_by_human },
    { label: "OBJEK", val: breakdown.object?.value || breakdown.location?.value, orig: breakdown.object?.original_value || breakdown.location?.original_value || breakdown.object?.value || breakdown.location?.value, isHuman: !!breakdown.location?.annotated_by_human || !!breakdown.object?.annotated_by_human },
    { label: "KEJADIAN", val: breakdown.action?.value, orig: breakdown.action?.original_value || breakdown.action?.value, isHuman: !!breakdown.action?.annotated_by_human },
    { label: "KONTEKS", val: breakdown.condition?.value, orig: breakdown.condition?.original_value || breakdown.condition?.value, isHuman: !!breakdown.condition?.annotated_by_human },
    { label: "SUMBER", val: breakdown.source_system?.value, orig: breakdown.source_system?.original_value || breakdown.source_system?.value, isHuman: !!breakdown.source_system?.annotated_by_human },
    { label: "DAMPAK", val: breakdown.why?.value, orig: breakdown.why?.original_value || breakdown.why?.value, isHuman: !!breakdown.why?.annotated_by_human }
  ];

  let totalScore = 0;
  let totalValidFields = 0;
  const fields: AccuracyFieldResult[] = [];

  fieldsForAccuracy.forEach(f => {
    const aiValue = f.orig || "-";
    const humanValue = f.val || "-";
    const hasData = aiValue !== "-" || humanValue !== "-";

    if (!hasData) {
      fields.push({
        label: f.label, aiValue, humanValue, isAnnotated: false,
        levenshteinDistance: 0, maxLength: 0, similarityPercent: 100,
        level: "Tidak ada data", fieldScore: 100,
        lexicalSimilarity: 100, entityType: null, aiEntity: null, annotationEntity: null,
        aiCanonicalEntityId: null, annotationCanonicalEntityId: null, entityMatch: null,
        semanticSimilarity: null, criticalMismatch: false, scoreCap: null, reason: "No data available"
      });
      return;
    }

    totalValidFields++;

    if (!f.isHuman) {
      totalScore += 100;
      fields.push({
        label: f.label, aiValue, humanValue, isAnnotated: false,
        levenshteinDistance: 0, maxLength: Math.max(aiValue.length, humanValue.length) || 1, similarityPercent: 100,
        level: "Belum ada koreksi manusia", fieldScore: 100,
        lexicalSimilarity: 100, entityType: null, aiEntity: null, annotationEntity: null,
        aiCanonicalEntityId: null, annotationCanonicalEntityId: null, entityMatch: null,
        semanticSimilarity: null, criticalMismatch: false, scoreCap: null, reason: "No human correction yet"
      });
      return;
    }

    const { distance, maxLength, similarity: lexicalSim } = calculateNormalizedSimilarity(humanValue, aiValue);
    
    let finalScore = lexicalSim;
    let criticalMismatch = false;
    let scoreCap: number | null = null;
    let reason = "Lexical similarity calculation";
    let level = getSimilarityLevel(lexicalSim);
    
    let entityType: EntityType | null = null;
    let aiEntity: string | null = null;
    let annotationEntity: string | null = null;
    let aiCanonicalId: string | null = null;
    let annotationCanonicalId: string | null = null;
    let entityMatch: EntityMatchResult | null = null;
    let semanticSimilarity: number | null = null;

    if (isIdentitySensitive(f.label)) {
      entityType = getCategoryEntityType(f.label) || "PERSON";
      const entAI = resolveEntity(aiValue);
      const entHuman = resolveEntity(humanValue);
      
      aiEntity = entAI.name;
      annotationEntity = entHuman.name;
      aiCanonicalId = entAI.id;
      annotationCanonicalId = entHuman.id;
      
      if (entAI.id && entHuman.id) {
        entityMatch = entAI.id === entHuman.id ? "same_entity" : "different_entity";
      } else {
        const coreAI = extractCoreEntityName(aiValue);
        const coreHuman = extractCoreEntityName(humanValue);
        if (coreAI === coreHuman) {
          entityMatch = "same_entity";
        } else {
          entityMatch = "different_entity";
        }
      }

      if (entityMatch === "different_entity") {
        criticalMismatch = true;
        scoreCap = 20;
        finalScore = Math.min(finalScore, 20);
        level = "Berbeda Signifikan";
        reason = "Entitas merujuk pada identitas yang berbeda";
      } else if (entityMatch === "unknown_entity") {
        reason = "Entity unresolved, relying on lexical similarity";
      } else {
        reason = "Entity match confirmed";
      }
    } else {
      // Descriptive field
      semanticSimilarity = lexicalSim; // Simplified mock for semantic similarity
      const semanticMatch = evaluateSemanticSimilarity(aiValue, humanValue);
      
      if (semanticMatch === "different_meaning") {
        finalScore = Math.min(finalScore, 40);
        level = "Berbeda Signifikan";
        reason = "Makna semantik berbeda secara signifikan";
      } else if (semanticMatch === "same_meaning" && lexicalSim < 75) {
        finalScore = Math.max(finalScore, 80);
        level = "Identik / Sangat Mirip";
        reason = "Makna semantik serupa meskipun teks berbeda";
      } else {
        reason = "Semantic match aligns with lexical similarity";
      }
    }

    totalScore += finalScore;

    fields.push({
      label: f.label, aiValue, humanValue, isAnnotated: true,
      levenshteinDistance: distance, maxLength, similarityPercent: finalScore,
      level, fieldScore: finalScore,
      lexicalSimilarity: lexicalSim, entityType, aiEntity, annotationEntity,
      aiCanonicalEntityId: aiCanonicalId, annotationCanonicalEntityId: annotationCanonicalId,
      entityMatch, semanticSimilarity, criticalMismatch, scoreCap, reason
    });
  });

  return {
    accuracy: totalValidFields > 0 ? Math.round(totalScore / totalValidFields) : 100,
    validFieldsCount: totalValidFields,
    fields,
    calculatedAt: new Date().toISOString(),
    engineVersion: "Hybrid-1.0"
  };
};



const renderGroupedCitations = (citations: any[]) => {
  const grouped: Record<string, Record<string, any[]>> = {};

  citations.forEach((cite: any) => {
    const typeKey = (cite.type || 'other').toLowerCase();
    const sourceKey = cite.source || 'Sumber Tidak Diketahui';
    
    if (!grouped[typeKey]) {
      grouped[typeKey] = {};
    }
    if (!grouped[typeKey][sourceKey]) {
      grouped[typeKey][sourceKey] = [];
    }
    grouped[typeKey][sourceKey].push(cite);
  });

  const typeLabels: Record<string, string> = {
    document: "Dokumen",
    audio: "Audio",
    video: "Video",
    image: "Gambar / Media",
    other: "Lainnya"
  };

  const typeColors: Record<string, string> = {
    document: "bg-blue-500/10 text-blue-700 border-blue-200/50",
    audio: "bg-emerald-500/10 text-emerald-700 border-emerald-200/50",
    video: "bg-rose-500/10 text-rose-700 border-rose-200/50",
    image: "bg-purple-500/10 text-purple-700 border-purple-200/50",
    other: "bg-slate-500/10 text-slate-700 border-slate-200/50"
  };

  const typeDots: Record<string, string> = {
    document: "bg-blue-500",
    audio: "bg-emerald-500",
    video: "bg-rose-500",
    image: "bg-purple-500",
    other: "bg-slate-500"
  };

  return (
    <div className="space-y-4 text-left mt-2">
      {Object.keys(grouped).map((typeKey) => {
        const typeLabel = typeLabels[typeKey] || typeKey.toUpperCase();
        const typeColor = typeColors[typeKey] || typeColors.other;
        const typeDot = typeDots[typeKey] || typeDots.other;
        const sources = grouped[typeKey];

        return (
          <div key={typeKey} className="space-y-2">
            {/* Type Header */}
            <div className="flex items-center gap-2 border-b border-slate-200/50 pb-1.5">
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 border text-[9px] font-black uppercase tracking-widest ${typeColor}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${typeDot}`} />
                {typeLabel}
              </span>
            </div>

            {/* Sources in this Type */}
            <div className="space-y-3 pl-1">
              {Object.keys(sources).map((sourceName) => {
                const cites = sources[sourceName];
                const citeSample = cites[0] || {};
                const Icon = citeSample.type === 'audio' 
                  ? Mic 
                  : citeSample.type === 'video' 
                    ? Video 
                    : citeSample.type === 'image' 
                      ? Camera 
                      : FileText;

                return (
                  <div key={sourceName} className="space-y-2">
                    {/* Source Name Sub-header */}
                    <div className="flex items-center gap-2 bg-slate-100/60 px-2 py-1.5 border-l-2 border-slate-400">
                      <Icon className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                      <span className="text-[10.5px] font-bold text-slate-800 tracking-wide break-all font-mono">
                        {sourceName}
                      </span>
                    </div>

                    {/* Citations list under this Source */}
                    <div className="space-y-2 pl-3.5 border-l border-slate-200">
                      {cites.map((cite: any, i: number) => (
                        <div 
                          key={i} 
                          className="bg-white border border-slate-150 p-2.5 flex flex-col gap-1.5 hover:border-slate-200 transition-colors"
                        >
                          {(cite.speaker || cite.time) && (
                            <div className="flex items-center justify-end">
                              <span className="text-[9px] font-mono text-slate-400 bg-slate-50 px-1 py-0.5 border border-slate-105 rounded-none">
                                {cite.speaker} {cite.time ? `• ${cite.time}` : ''}
                              </span>
                            </div>
                          )}
                          <div className="text-[11.5px] text-slate-600 leading-relaxed font-sans font-normal italic pl-2 border-l border-slate-300">
                            "{cite.content || cite.text || cite.extracted_content}"
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ── Highlight 5W1H Substrings helper ────────────────────────────────────────

const renderHighlightedStatement = (rawText: any, item: ChronologyItem, activeDimension: string | null, setActiveDimension: (dim: string | null) => void) => {
  const text = extractStringValue(rawText, "");
  const breakdown = item.breakdown || {};
  
  const tagColor = "bg-slate-100 text-slate-800 border-slate-300/80";
  const humanTagColor = "bg-blue-50 text-blue-700 border-blue-200/85";

  const dimensions = [
    { label: "WAKTU", value: extractStringValue(breakdown.time?.value || breakdown.time || item.time_label), originalValue: extractStringValue((breakdown as any).time_original_value || breakdown.time || item.time_label), isHuman: !!(breakdown as any).time_annotated_by_human },
    { label: "PIHAK", value: extractStringValue(breakdown.subject?.value || breakdown.subject || breakdown.actor), originalValue: extractStringValue(breakdown.subject?.original_value || breakdown.subject?.value || breakdown.actor), isHuman: !!(breakdown.subject as any)?.annotated_by_human },
    { label: "OBJEK", value: extractStringValue(breakdown.object?.value || breakdown.object || (breakdown.location as any)?.value), originalValue: extractStringValue(breakdown.object?.original_value || (breakdown.location as any)?.original_value || breakdown.object?.value || (breakdown.location as any)?.value), isHuman: !!(breakdown.location as any)?.annotated_by_human || !!(breakdown.object as any)?.annotated_by_human },
    { label: "KEJADIAN", value: extractStringValue(breakdown.action?.value || breakdown.action), originalValue: extractStringValue(breakdown.action?.original_value || breakdown.action?.value), isHuman: !!(breakdown.action as any)?.annotated_by_human },
    { label: "KONTEKS", value: extractStringValue(breakdown.condition?.value || breakdown.condition), originalValue: extractStringValue(breakdown.condition?.original_value || breakdown.condition?.value), isHuman: !!(breakdown.condition as any)?.annotated_by_human },
    { label: "SUMBER", value: extractStringValue(breakdown.source_system?.value || breakdown.source_system), originalValue: extractStringValue(breakdown.source_system?.original_value || breakdown.source_system?.value), isHuman: !!(breakdown.source_system as any)?.annotated_by_human },
    { label: "STATUS", value: item.status === "human_verified" ? "Terkonfirmasi" : "Menunggu Validasi", originalValue: item.status === "human_verified" ? "Terkonfirmasi" : "Menunggu Validasi", isHuman: item.annotated_by_human },
    { label: "DAMPAK", value: extractStringValue((breakdown.why as any)?.value || breakdown.why), originalValue: extractStringValue((breakdown.why as any)?.original_value || (breakdown.why as any)?.value), isHuman: !!(breakdown.why as any)?.annotated_by_human },
    { label: "TINDAKAN", value: "Proses Investigasi", originalValue: "Proses Investigasi", isHuman: false }
  ];

  const searchTargets = dimensions
    .map(d => ({
      label: d.label,
      val: typeof d.originalValue === 'string' ? d.originalValue.trim() : String(d.originalValue || '').trim(),
      color: d.isHuman ? humanTagColor : tagColor,
      isHuman: !!d.isHuman,
      currentValue: typeof d.value === 'string' ? d.value.trim() : String(d.value || '').trim()
    }))
    .filter(t => t.val && t.val !== "-" && t.val.length > 1 && t.val.toLowerCase() !== text.toLowerCase());

  if (searchTargets.length === 0) {
    return <span className="font-sans text-slate-700 text-[12.5px] leading-relaxed">{text}</span>;
  }

  interface MatchRange {
    start: number;
    end: number;
    label: string;
    color: string;
    originalText: string;
    isHuman: boolean;
    currentValue: string;
  }

  const matches: MatchRange[] = [];
  const lowerText = text.toLowerCase();

  searchTargets.forEach(target => {
    const query = target.val!.toLowerCase();
    let idx = lowerText.indexOf(query);
    while (idx !== -1) {
      matches.push({
        start: idx,
        end: idx + query.length,
        label: target.label,
        color: target.color,
        originalText: text.substring(idx, idx + query.length),
        isHuman: target.isHuman,
        currentValue: target.currentValue
      });
      idx = lowerText.indexOf(query, idx + 1);
    }
  });

  matches.sort((a, b) => {
    if (a.start !== b.start) return a.start - b.start;
    return (b.end - b.start) - (a.end - a.start);
  });

  const activeMatches: MatchRange[] = [];
  let lastEnd = 0;
  for (const match of matches) {
    if (match.start >= lastEnd) {
      activeMatches.push(match);
      lastEnd = match.end;
    }
  }

  const result: React.ReactNode[] = [];
  let currentIndex = 0;

  activeMatches.forEach((match, idx) => {
    if (match.start > currentIndex) {
      result.push(
        <span key={`text-${currentIndex}`} className="font-sans text-slate-700 text-[12.5px]">
          {text.substring(currentIndex, match.start)}
        </span>
      );
    }
    const scale = (match.isHuman && match.currentValue !== match.originalText) 
      ? getSemanticDifferenceScale(match.currentValue, match.originalText) 
      : null;

    result.push(
      <TooltipProvider key={`tooltip-${idx}-${match.start}`} delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <span 
              onMouseEnter={() => setActiveDimension(match.label)}
              onMouseLeave={() => setActiveDimension(null)}
              onClick={() => setActiveDimension(activeDimension === match.label ? null : match.label)}
              className={cn(
                "inline-block px-2 py-1 border font-sans font-semibold mx-1.5 my-1 rounded-none align-middle text-[12.5px] leading-[1.6] max-w-full break-words cursor-pointer transition-all duration-300", 
                activeDimension === match.label 
                  ? "bg-blue-100 border-blue-400 text-blue-900 shadow-sm" 
                  : cn(match.color, activeDimension !== null ? "opacity-30" : "opacity-100")
              )}
            >
              {match.isHuman && match.currentValue !== match.originalText ? match.currentValue : match.originalText}
            </span>
          </TooltipTrigger>
          <TooltipContent side="top" className="bg-slate-900 text-white text-[10px] px-2.5 py-1.5 font-sans rounded-none shadow-md flex flex-col gap-1 z-50">
            <div className="font-mono uppercase tracking-wider text-slate-400 text-[9px] leading-none">{match.label}</div>
            {scale && (
              <div className="text-[10px] leading-snug text-slate-300 mt-0.5">
                <span className="font-semibold text-slate-400">AI:</span> <span className="line-through">{match.originalText}</span>
                <div className="mt-1.5 pt-1.5 border-t border-slate-700/50 flex items-center justify-between gap-3">
                  <span className="font-mono text-[8.5px] uppercase tracking-wider text-slate-400">Deviasi</span>
                  <span className={`font-semibold text-[9.5px] ${scale.color}`}>{scale.label}</span>
                </div>
              </div>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
    currentIndex = match.end;
  });

  if (currentIndex < text.length) {
    result.push(
      <span key={`text-end`} className="font-sans text-slate-700 text-[12.5px]">
        {text.substring(currentIndex)}
      </span>
    );
  }

  return <div className="leading-[2.8] text-slate-700 text-[12.5px] font-sans py-2 px-1">{result}</div>;
};

interface Segment {
  type: 'text' | 'label';
  value: string;
  label?: string;
  color?: string;
}

const getStatementSegments = (text: string, item: ChronologyItem) => {
  const breakdown = item.breakdown || {};
  
  const tagColor = "bg-slate-100 text-slate-800 border-slate-300/80";
  const humanTagColor = "bg-blue-50 text-blue-700 border-blue-200/85";

  const dimensions = [
    { label: "WAKTU", value: breakdown.time || item.time_label, originalValue: (breakdown as any).time_original_value || breakdown.time || item.time_label, isHuman: !!(breakdown as any).time_annotated_by_human },
    { label: "PIHAK", value: breakdown.subject?.value || breakdown.actor, originalValue: breakdown.subject?.original_value || breakdown.subject?.value || breakdown.actor, isHuman: !!(breakdown.subject as any)?.annotated_by_human },
    { label: "OBJEK", value: breakdown.object?.value || (breakdown.location as any)?.value, originalValue: breakdown.object?.original_value || (breakdown.location as any)?.original_value || breakdown.object?.value || (breakdown.location as any)?.value, isHuman: !!(breakdown.location as any)?.annotated_by_human || !!(breakdown.object as any)?.annotated_by_human },
    { label: "KEJADIAN", value: breakdown.action?.value, originalValue: breakdown.action?.original_value || breakdown.action?.value, isHuman: !!(breakdown.action as any)?.annotated_by_human },
    { label: "KONTEKS", value: breakdown.condition?.value, originalValue: breakdown.condition?.original_value || breakdown.condition?.value, isHuman: !!(breakdown.condition as any)?.annotated_by_human },
    { label: "SUMBER", value: breakdown.source_system?.value, originalValue: breakdown.source_system?.original_value || breakdown.source_system?.value, isHuman: !!(breakdown.source_system as any)?.annotated_by_human },
    { label: "STATUS", value: item.status === "human_verified" ? "Terkonfirmasi" : "Menunggu Validasi", originalValue: item.status === "human_verified" ? "Terkonfirmasi" : "Menunggu Validasi", isHuman: item.annotated_by_human },
    { label: "DAMPAK", value: (breakdown.why as any)?.value, originalValue: (breakdown.why as any)?.original_value || (breakdown.why as any)?.value, isHuman: !!(breakdown.why as any)?.annotated_by_human },
    { label: "TINDAKAN", value: "Proses Investigasi", originalValue: "Proses Investigasi", isHuman: false }
  ];

  const searchTargets = dimensions
    .map(d => ({
      label: d.label,
      val: typeof d.originalValue === 'string' ? d.originalValue.trim() : String(d.originalValue || '').trim(),
      color: d.isHuman ? humanTagColor : tagColor,
      isHuman: !!d.isHuman,
      currentValue: typeof d.value === 'string' ? d.value.trim() : String(d.value || '').trim()
    }))
    .filter(t => t.val && t.val !== "-" && t.val.length > 1 && t.val.toLowerCase() !== text.toLowerCase());

  interface MatchRange {
    start: number;
    end: number;
    label: string;
    color: string;
    originalText: string;
    isHuman: boolean;
    currentValue: string;
  }

  const matches: MatchRange[] = [];
  const lowerText = text.toLowerCase();

  searchTargets.forEach(target => {
    const query = target.val!.toLowerCase();
    let idx = lowerText.indexOf(query);
    while (idx !== -1) {
      matches.push({
        start: idx,
        end: idx + query.length,
        label: target.label,
        color: target.color,
        originalText: text.substring(idx, idx + query.length),
        isHuman: target.isHuman,
        currentValue: target.currentValue
      });
      idx = lowerText.indexOf(query, idx + 1);
    }
  });

  matches.sort((a, b) => {
    if (a.start !== b.start) return a.start - b.start;
    return (b.end - b.start) - (a.end - a.start);
  });

  const activeMatches: MatchRange[] = [];
  let lastEnd = 0;
  for (const match of matches) {
    if (match.start >= lastEnd) {
      activeMatches.push(match);
      lastEnd = match.end;
    }
  }

  const segments: Segment[] = [];
  let currentIndex = 0;

  activeMatches.forEach((match) => {
    if (match.start > currentIndex) {
      segments.push({
        type: 'text',
        value: text.substring(currentIndex, match.start)
      });
    }
    segments.push({
      type: 'label',
      value: match.isHuman && match.currentValue !== match.originalText ? match.currentValue : match.originalText,
      label: match.label,
      color: match.color
    });
    currentIndex = match.end;
  });

  if (currentIndex < text.length) {
    segments.push({
      type: 'text',
      value: text.substring(currentIndex)
    });
  }

  return segments;
};

const CATEGORY_EXPLANATIONS: Record<string, { title: string, subtitle: string, text: string }> = {
  WAKTU: {
    title: "WAKTU / KRONOLOGI",
    subtitle: "[Keterangan Waktu]",
    text: "Menunjukkan waktu, urutan, atau penanda kronologi dalam fakta."
  },
  PIHAK: {
    title: "PIHAK TERLIBAT",
    subtitle: "[Subjek]",
    text: "Menunjukkan aktor, peran, atau pihak yang terlibat dalam fakta."
  },
  KEJADIAN: {
    title: "KEJADIAN / TEMUAN",
    subtitle: "[Predikat]",
    text: "Menunjukkan aksi, peristiwa, temuan, atau kondisi utama yang terjadi."
  },
  OBJEK: {
    title: "OBJEK / ENTITAS",
    subtitle: "[Objek]",
    text: "Menunjukkan hal yang dikenai aksi, dibahas, terdampak, atau menjadi pusat fakta."
  },
  KONTEKS: {
    title: "KONTEKS OPERASIONAL",
    subtitle: "[Keterangan Konteks]",
    text: "Menunjukkan situasi kerja, fase investigasi, kondisi operasional, atau keadaan saat fakta muncul."
  },
  SUMBER: {
    title: "METODE / SUMBER DETEKSI",
    subtitle: "[Keterangan Sumber]",
    text: "Menunjukkan jalur, alat, sistem, laporan, atau media yang membaca dan menghasilkan fakta."
  },
  STATUS: {
    title: "STATUS VERIFIKASI",
    subtitle: "[Keterangan Status]",
    text: "Menunjukkan posisi validasi fakta, termasuk sudah terkonfirmasi, belum terkonfirmasi, atau masih perlu ditinjau."
  },
  DAMPAK: {
    title: "DAMPAK / RISIKO",
    subtitle: "[Keterangan Dampak]",
    text: "Menunjukkan risiko, konsekuensi, atau gangguan yang dapat muncul dari fakta."
  },
  TINDAKAN: {
    title: "TINDAK LANJUT",
    subtitle: "[Keterangan Aksi Lanjut]",
    text: "Menunjukkan langkah berikutnya yang perlu dilakukan setelah fakta terbaca."
  }
};

// ── Provenance & Annotation Components ─────────────────────────────────────

const EventCitationList: React.FC<{ item: any }> = ({ item }) => {
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const toggleRow = (label: string) => {
    setExpandedRows(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const mappedTraceability = item.traceability?.map((t: any) => ({
    type: t.source_type,
    content: t.extracted_content,
    time: t.timestamp_start,
    speaker: t.source_file_name,
    thumbnail: t.source_type === 'video' ? 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=300&q=80' : undefined
  })) || [];

  const breakdown = item.breakdown || {};
  const whatCitations = [...(breakdown.action?.citations || []), ...mappedTraceability];

  const getDummyCitations = (label: string) => [
    {
      type: "document",
      content: `Data tercatat pada berkas BAP untuk parameter ${label} sesuai dengan SOP-204.`,
      speaker: "Audit Log",
      time: "10:42 AM",
      source: "BAP_INVESTIGASI_SOP-204.PDF"
    },
    {
      type: "audio",
      content: `Saksi mengkonfirmasi elemen ${label} pada saat interogasi awal berlangsung.`,
      speaker: "Saksi Utama",
      time: "10:45 AM",
      source: "REKAMAN_INTEROGASI_SAKSI.MP3"
    }
  ];

  const generateEventsFromText = (text: string) => {
    if (!text) return [];
    let normalized = text
      .replace(/^identifikasi\b/i, 'Mengidentifikasi')
      .replace(/^perbaikan\b/i, 'Memperbaiki')
      .replace(/^pemberian\b/i, 'Memberikan')
      .replace(/^pelaksanaan\b/i, 'Melakukan')
      .replace(/^trial\b/i, 'Melakukan trial')
      .replace(/^campaign\b/i, 'Melakukan campaign');

    const verbRegex = /^(membuat|menetapkan|memeriksa|memperbaiki|memasang|menguji|memverifikasi|menyerahkan|mengawasi|melakukan|mengidentifikasi|memberikan)\b/i;
    
    const rawParts = normalized.split(/,\s*dan\s+|\s+dan\s+|,\s*/i);
    const events: string[] = [];
    
    let currentEvent = "";
    for (let i = 0; i < rawParts.length; i++) {
      let part = rawParts[i].trim();
      if (!part) continue;
      
      if (i === 0) {
        currentEvent = part;
      } else {
        if (verbRegex.test(part)) {
          events.push(currentEvent);
          currentEvent = part;
        } else {
          currentEvent += " dan " + part;
        }
      }
    }
    if (currentEvent) {
      events.push(currentEvent);
    }

    return events.map((ev, i) => {
      let clean = ev.trim();
      clean = clean.charAt(0).toUpperCase() + clean.slice(1);
      if (!clean.endsWith('.')) clean += '.';
      return {
        label: `EVENT ${i + 1}`,
        value: clean,
        citations: whatCitations.length > 0 ? whatCitations : getDummyCitations(`EVENT ${i + 1}`),
        evidence_count: whatCitations.length > 0 ? whatCitations.length : 2
      };
    });
  };

  const tableRows = generateEventsFromText(item.chronology_text || "");

  if (tableRows.length === 0) return null;

  return (
    <div className="mt-6 border-t border-slate-200 pt-6">
      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">
         EVENT & EVIDENCE LINK
      </div>
      <div className="border border-slate-200 rounded overflow-hidden shadow-sm">
        <div className="flex flex-col divide-y divide-slate-100">
          {tableRows.map((row) => {
            const isExpanded = !!expandedRows[row.label];
            const hasCitations = row.citations && row.citations.length > 0;
            
            return (
              <React.Fragment key={row.label}>
                <div 
                  className={cn("flex items-center p-3 bg-white transition-colors", hasCitations ? "cursor-pointer hover:bg-slate-50" : "")}
                  onClick={() => hasCitations && toggleRow(row.label)}
                >
                  <div className="w-24 shrink-0 font-mono text-[10px] font-bold text-slate-500 tracking-wider flex items-center gap-2">
                    {row.label}
                    {hasCitations && (
                      <span className="inline-flex items-center justify-center gap-1 px-1.5 py-0.5 text-[9px] font-bold text-slate-600 bg-slate-100 border border-slate-200 rounded">
                        <FileText className="h-2.5 w-2.5" />
                        {row.citations.length}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 text-[11.5px] text-slate-800 font-normal leading-relaxed pr-4">
                    {row.value}
                  </div>
                  {hasCitations ? (
                    <div className="flex items-center justify-end w-6 shrink-0">
                      <ChevronDown className={cn("h-4 w-4 text-slate-400 transition-transform duration-200", isExpanded ? "rotate-180" : "")} />
                    </div>
                  ) : (
                    <div className="w-6 shrink-0" />
                  )}
                </div>
                {isExpanded && hasCitations && (
                  <div className="bg-slate-50/50 p-4 border-t border-slate-100 shadow-inner border-l-2 border-l-blue-600">
                    {renderGroupedCitations(row.citations)}
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};


export const TraceabilityPanel: React.FC<{ 
  item: ChronologyItem, 
  onClose: () => void,
  onUpdateStatus: (status: VerificationStatus) => void,
  onUpdateBreakdown: (newBreakdown: any) => void,
  onEdit: () => void,
  onUpdateChronologyText: (newText: string) => void,
  readonly?: boolean
}> = ({ item, onClose, readonly }) => {
  const [showHistory, setShowHistory] = useState(false);

  // Fallback version if not defined
  const currentVersion = item.currentVersion || item.version || 1;
  const history = item.history || [];

  if (showHistory) {
    return (
      <div className="flex flex-col h-full bg-white border-l border-slate-200 relative overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 bg-white shrink-0 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setShowHistory(false)} className="h-7 px-2 text-slate-500 hover:text-slate-800">
            &larr; Kembali
          </Button>
          <div className="flex-1">
            <h3 className="text-[13px] font-bold text-slate-900 uppercase tracking-wider leading-none">RIWAYAT PERUBAHAN</h3>
            <p className="text-[10px] text-slate-500 mt-1">{history.length + 1} versi</p>
          </div>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-auto p-6 space-y-6 bg-slate-50">
          {/* Current Version Node */}
          <div className="relative pl-5 border-l-2 border-slate-200">
             <div className="absolute w-3 h-3 rounded-full bg-blue-500 -left-[7px] top-1" />
             <div className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">VERSI {currentVersion} &middot; {item.provenanceType === 'HUMAN_MANUAL' ? ((item.manualRevisionCount || 0) > 0 ? 'DIUBAH' : 'DITAMBAHKAN MANUAL') : 'DIUBAH'}</div>
             <div className="bg-white border border-slate-200 rounded p-4 shadow-sm mb-2">
                <div className="text-[10px] text-slate-400 mb-1">
                  {item.provenanceType === 'HUMAN_MANUAL' && (item.manualRevisionCount || 0) === 0 ? 'Ditambahkan oleh' : 'Diubah oleh'}
                </div>
                <div className="text-[11px] font-bold text-slate-800 mb-3">{item.latestHumanChange?.userName || "Gulang Satriya"} &middot; {item.latestHumanChange?.userRole || "Lead Investigator"}</div>
                
                <div className="text-[11px] text-slate-800 leading-relaxed italic border-l-2 border-slate-300 pl-3 py-1 mb-3">
                  "{item.chronology_text}"
                </div>

                <div className="text-[10px] text-slate-400 mb-3">
                  {item.latestHumanChange?.timestamp ? new Date(item.latestHumanChange.timestamp).toLocaleString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) + ' WIB' : '05 Agustus 2026, 14:18 WIB'}
                </div>

                {((item.provenanceType === 'HUMAN_MANUAL' && (item.manualRevisionCount || 0) > 0) || item.provenanceType === 'AI_HUMAN_ANNOTATED') && (
                  <details className="group">
                    <summary className="text-[10px] font-bold text-blue-600 cursor-pointer hover:text-blue-700 list-none flex items-center gap-1">
                      <span className="group-open:hidden">[Lihat Detail Perubahan]</span>
                      <span className="hidden group-open:inline">[Tutup Detail Perubahan]</span>
                    </summary>
                    <div className="mt-3 space-y-3 pt-3 border-t border-slate-100">
                      {item.latestHumanChange?.changeNote && (
                        <div>
                          <div className="text-[9px] font-bold text-slate-400 mb-1">{item.provenanceType === 'HUMAN_MANUAL' && (item.manualRevisionCount || 0) === 0 ? 'Catatan' : 'Catatan anotasi'}</div>
                          <div className="text-[11px] text-slate-700 bg-slate-50 p-2 rounded border border-slate-100">{item.latestHumanChange.changeNote}</div>
                        </div>
                      )}
                      <div>
                        <div className="text-[9px] font-bold text-slate-400 mb-1">SEBELUM</div>
                        <div className="bg-red-50 text-red-900 p-2 rounded text-[11px] border border-red-100">{item.history?.[0]?.chronology_text || "DMS memberikan peringatan kepada operator."}</div>
                      </div>
                      <div>
                        <div className="text-[9px] font-bold text-slate-400 mb-1">SESUDAH</div>
                        <div className="bg-emerald-50 text-emerald-900 p-2 rounded text-[11px] border border-emerald-100">{item.chronology_text}</div>
                      </div>
                    </div>
                  </details>
                )}
             </div>
          </div>

          {/* Past versions from history */}
          {history.map((histItem: any, idx: number) => {
             const vNum = currentVersion - 1 - idx;
             const isOriginal = idx === history.length - 1;
             
             if (isOriginal && histItem.provenanceType !== 'HUMAN_MANUAL') {
               return (
                 <div key={idx} className="relative pl-5 border-l-2 border-transparent">
                   <div className="absolute w-3 h-3 rounded-full bg-slate-300 -left-[7px] top-1" />
                   <div className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">VERSI {vNum} &middot; AI GENERATED</div>
                   <div className="bg-slate-100 border border-slate-200 rounded p-4 shadow-sm">
                      <div className="text-[11px] font-bold text-slate-800 mb-2">Fact & Chronology Agent</div>
                      <div className="text-[10px] text-slate-400">
                        {histItem.timestamp ? new Date(histItem.timestamp).toLocaleString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) + ' WIB' : '05 Agustus 2026, 13:20 WIB'}
                      </div>
                   </div>
                 </div>
               );
             }

             return (
               <div key={idx} className="relative pl-5 border-l-2 border-slate-200">
                 <div className="absolute w-3 h-3 rounded-full bg-slate-400 -left-[7px] top-1" />
                 <div className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">VERSI {vNum} &middot; {isOriginal && histItem.provenanceType === 'HUMAN_MANUAL' ? 'DITAMBAHKAN MANUAL' : 'DIUBAH'}</div>
                 <div className="bg-white border border-slate-200 rounded p-4 shadow-sm mb-2 opacity-80">
                    <div className="text-[10px] text-slate-400 mb-1">
                      {isOriginal && histItem.provenanceType === 'HUMAN_MANUAL' ? 'Ditambahkan oleh' : 'Diubah oleh'}
                    </div>
                    <div className="text-[11px] font-bold text-slate-800 mb-3">{histItem.userName || "Rina Mahardika"} &middot; {histItem.userRole || "Investigator"}</div>
                    
                    <div className="text-[11px] text-slate-800 leading-relaxed italic border-l-2 border-slate-300 pl-3 py-1 mb-3">
                      "{histItem.chronology_text || item.chronology_text}"
                    </div>

                    <div className="text-[10px] text-slate-400 mb-3">
                      {histItem.timestamp ? new Date(histItem.timestamp).toLocaleString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) + ' WIB' : '05 Agustus 2026, 14:02 WIB'}
                    </div>
                    
                    {!isOriginal && (
                      <details className="group">
                        <summary className="text-[10px] font-bold text-blue-600 cursor-pointer hover:text-blue-700 list-none flex items-center gap-1">
                          <span className="group-open:hidden">[Lihat Detail Perubahan]</span>
                          <span className="hidden group-open:inline">[Tutup Detail Perubahan]</span>
                        </summary>
                        <div className="mt-3 space-y-3 pt-3 border-t border-slate-100">
                          {histItem.changeNote && (
                            <div>
                              <div className="text-[9px] font-bold text-slate-400 mb-1">{isOriginal && histItem.provenanceType === 'HUMAN_MANUAL' ? 'Catatan' : 'Catatan anotasi'}</div>
                              <div className="text-[11px] text-slate-700 bg-slate-50 p-2 rounded border border-slate-100">{histItem.changeNote}</div>
                            </div>
                          )}
                          <div>
                            <div className="text-[9px] font-bold text-slate-400 mb-1">SEBELUM</div>
                            <div className="bg-red-50 text-red-900 p-2 rounded text-[11px] border border-red-100">{history[idx + 1]?.chronology_text || "DMS memberikan peringatan kepada operator."}</div>
                          </div>
                          <div>
                            <div className="text-[9px] font-bold text-slate-400 mb-1">SESUDAH</div>
                            <div className="bg-emerald-50 text-emerald-900 p-2 rounded text-[11px] border border-emerald-100">{histItem.chronology_text || item.chronology_text}</div>
                          </div>
                        </div>
                      </details>
                    )}
                 </div>
               </div>
             );
          })}

        </div>
      </div>
    );
  }

  // --- Main Detail View ---
  return (
    <div className="flex flex-col h-full bg-white border-l border-slate-200 relative overflow-hidden">
      {/* Panel Header */}
      <div className="p-4 border-b border-slate-200 bg-white shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-slate-900 flex items-center justify-center text-white rounded-none">
            <TableIcon className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-[13px] font-bold text-slate-900 uppercase tracking-wider leading-none">Detail Analisis</h3>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Analisis Bukti Investigasi</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="h-7 w-7 p-0 hover:bg-slate-100 rounded-none">
          <X className="h-4 w-4 text-slate-500" />
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-6">
        
        {/* Origin Label */}
        {item.provenanceType === 'HUMAN_MANUAL' ? (
          <div>
            <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest border border-emerald-200 mb-4">
               <CheckCircle2 className="h-3 w-3" />
               Ditambahkan Manual
            </div>
            
            <div className="text-[10px] text-slate-400 mb-1">Ditambahkan oleh</div>
            <div className="text-[11px] font-bold text-slate-800 mb-1">{item.latestHumanChange?.userName || "Gulang Satriya"} &middot; Lead Investigator</div>
            <div className="text-[10px] text-slate-500 mb-1">05 Agustus 2026, 13:42 WIB</div>
            
            {(item.manualRevisionCount || 0) > 0 && (
               <>
                 <div className="text-[10px] text-slate-400 mb-1 mt-3">Terakhir diubah oleh</div>
                 <div className="text-[11px] font-bold text-slate-800 mb-1">{item.latestHumanChange?.userName || "Gulang Satriya"} &middot; Lead Investigator</div>
                 <div className="text-[10px] text-slate-500 mb-1">05 Agustus 2026, 14:18 WIB</div>
                 <div className="text-[10px] text-slate-500 mt-2">{(item.manualRevisionCount || 0)} kali perubahan</div>
               </>
            )}
            <div className="text-[10px] font-mono text-slate-400 mt-2">Versi aktif {currentVersion}</div>
          </div>
        ) : item.provenanceType === 'AI_HUMAN_ANNOTATED' ? (
          <div>
            <div className="flex items-center flex-wrap gap-2 mb-4">
              <div className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest border border-indigo-200">
                 <Brain className="h-3 w-3" />
                 AI Generated
              </div>
              <ChevronRight className="h-3 w-3 text-slate-400" />
              <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest border border-blue-200">
                 <Pencil className="h-3 w-3" />
                 Annotated
              </div>
            </div>
            <div className="text-[10px] text-slate-500 mb-3">{item.humanAnnotationCount || 2} kali anotasi</div>
            
            <div className="text-[10px] font-mono text-slate-400 mt-2">Versi aktif {currentVersion}</div>
          </div>
        ) : (
          <div>
            <div className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest border border-indigo-200 mb-4">
               <Brain className="h-3 w-3" />
               AI Generated
            </div>
            <div className="text-[10px] text-slate-400 mb-1">Generated by</div>
            <div className="text-[11px] font-bold text-slate-800 mb-1">Fact & Chronology Agent</div>
            <div className="text-[10px] text-slate-500 mb-1">05 Agustus 2026, 13:20 WIB</div>
            <div className="text-[10px] font-mono text-slate-400 mt-2">Versi aktif 1</div>
          </div>
        )}

        <hr className="border-slate-100" />

        {/* 1. Anotasi / Latest Changes (Only if edited or manual) */}
        {((item.provenanceType === 'HUMAN_MANUAL' && (item.manualRevisionCount || 0) > 0) || item.provenanceType === 'AI_HUMAN_ANNOTATED') && (
           <div className="mb-6">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">HASIL ANOTASI TERAKHIR</div>
              
              <div className="bg-blue-50/30 p-4 rounded border border-blue-100 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                   <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center border border-blue-200 shrink-0">
                     <User className="h-4 w-4 text-blue-600" />
                   </div>
                   <div>
                     <div className="text-[11px] font-bold text-slate-800">{item.latestHumanChange?.userName || "Gulang Satriya"}</div>
                     <div className="text-[10px] text-slate-500">{item.latestHumanChange?.timestamp ? new Date(item.latestHumanChange.timestamp).toLocaleString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) + ' WIB' : '05 Agustus 2026, 14:18 WIB'}</div>
                   </div>
                </div>
                
                <div className="text-[12px] text-slate-800 leading-relaxed italic border-l-[3px] border-blue-400 pl-3 py-1 mb-4 bg-white/50">
                  "{item.chronology_text}"
                </div>
                
                {item.latestHumanChange?.changeNote && (
                  <div className="bg-white p-3 rounded border border-slate-100 text-[11px] shadow-sm">
                    <div className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-widest">
                      {item.provenanceType === 'HUMAN_MANUAL' ? 'Catatan Perubahan' : 'Catatan Anotasi'}
                    </div>
                    <div className="text-slate-700 font-medium">
                      {item.latestHumanChange.changeNote}
                    </div>
                  </div>
                )}
                
                <div className="text-[10px] text-slate-400 font-mono mt-4 text-right">
                   Versi {currentVersion - 1} &rarr; Versi {currentVersion}
                </div>
              </div>
           </div>
        )}

        {/* 2. Original / Current Statement with AI label */}
        <div className="mb-6">
           <div className="flex items-center gap-2 mb-2">
             <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
               {item.provenanceType === 'HUMAN_MANUAL' ? 'PERNYATAAN AWAL' : 'PERNYATAAN AI GENERATED'}
             </div>
             {item.provenanceType !== 'HUMAN_MANUAL' && (
               <div className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase border border-indigo-200 shadow-sm">
                 {!cleanMode && <><Brain className="h-2.5 w-2.5" /> AI</>}
               </div>
             )}
           </div>
           
           <div className="text-[12.5px] text-slate-800 leading-relaxed bg-slate-50/80 p-4 rounded border border-slate-200">
             {item.provenanceType === 'AI_HUMAN_ANNOTATED' ? (item.original_text || item.chronology_text) : item.chronology_text}
           </div>
        </div>

        {item.provenanceType !== 'HUMAN_MANUAL' && (
          <EventCitationList item={item} />
        )}

        {/* Action Button */}
        {(item.provenanceType === 'HUMAN_MANUAL' || item.provenanceType === 'AI_HUMAN_ANNOTATED') && (
          <div className="pt-4">
            <Button 
              variant="outline" 
              className="w-full bg-white text-[11px] font-bold text-slate-700 border-slate-300 hover:bg-slate-50 h-9"
              onClick={() => setShowHistory(true)}
            >
              Lihat Riwayat Perubahan
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Slide View Component ───────────────────────────────────────────────────


const renderProvenanceBadge = (item:  ChronologyItem, isCleanMode?: boolean) => {
  if (isCleanMode) return null;
  const pType = item.provenanceType || (item.source === 'human' ? 'HUMAN_MANUAL' : (item.annotated_by_human ? 'AI_HUMAN_ANNOTATED' : 'AI_GENERATED'));
  
  if (pType === 'AI_GENERATED') {
    return (
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            {cleanMode ? null : (<span className="inline-flex items-center justify-center h-[18px] px-1.5 rounded bg-slate-100 text-slate-500 border border-slate-200 cursor-help transition-colors hover:bg-slate-200">
              <span className="font-black text-[9px] uppercase tracking-wider">AI</span></span>)}
          </TooltipTrigger>
          <TooltipContent side="top" className="text-[10px] font-bold">Generated by AI</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  } else if (pType === 'AI_HUMAN_ANNOTATED') {
    return (
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            {cleanMode ? null : (<span className="inline-flex items-center justify-center h-[18px] w-[18px] rounded bg-slate-100 text-slate-500 border border-slate-200 cursor-help transition-colors hover:bg-slate-200">
              <User className="h-3 w-3" strokeWidth={2.5} />
            </span>)}
          </TooltipTrigger>
          <TooltipContent side="top" className="text-[10px] font-bold">Annotated by Human</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  } else if (pType === 'HUMAN_MANUAL') {
    return (
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            {cleanMode ? null : (<span className="inline-flex items-center justify-center h-[18px] w-[18px] rounded bg-slate-100 text-slate-500 border border-slate-200 cursor-help transition-colors hover:bg-slate-200">
              <Pencil className="h-3 w-3" strokeWidth={2.5} />
            </span>)}
          </TooltipTrigger>
          <TooltipContent side="top" className="text-[10px] font-bold">Edited Manually</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  return null;
};

const FactSlideView: React.FC<{ 
  metadata: FactMetadata, 
  groupedItems: Record<ChronologyPhase, ChronologyItem[]>,
  selectedFactId?: string | null,
  onSelectItem: (id: string | null) => void,
  onAddFact: (phase: string) => void
}> = ({ 
  metadata, 
  groupedItems,
  selectedFactId,
  onSelectItem,
  onAddFact
}) => {
  return (
    <div className="flex-1 flex flex-col p-[60px] text-slate-900 animate-in fade-in duration-500 relative">
      {/* Title Area */}
      <div className="flex justify-between items-start mb-6 border-b-2 border-slate-900 pb-4">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-1">GAMBARAN UMUM INSIDEN</div>
          <h2 className="text-[36px] font-black uppercase tracking-tighter leading-none">FAKTA & KRONOLOGI</h2>
        </div>
        <div className="text-right">
          <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Kode Investigasi</div>
          <div className="text-sm font-mono font-bold text-slate-800">#{metadata.caseCode}</div>
        </div>
      </div>

      {/* Summary Block */}
      <div className="mb-6 bg-slate-50 border-l-4 border-slate-900 p-5 rounded-r-lg shadow-sm">
        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
          <Shield className="h-3 w-3" /> RINGKASAN EKSEKUTIF
        </div>
        <div className="text-[15px] text-slate-700 font-medium leading-relaxed italic">
          {metadata.summary}
        </div>
      </div>

      {/* Metadata Grid */}
      <div className="grid grid-cols-4 gap-x-8 gap-y-4 mb-8 bg-white border border-slate-100 p-6 rounded-xl shadow-sm">
        {[
          { label: 'Tanggal Insiden', value: metadata.incidentDate, icon: Calendar },
          { label: 'Waktu Insiden', value: metadata.incidentTime, icon: Clock },
          { label: 'Lokasi', value: metadata.location, icon: MapPin },
          { label: 'Jenis Insiden', value: metadata.incidentType, icon: Search },
          { label: 'Departemen', value: metadata.department, icon: User },
          { label: 'Sumber Bukti', value: metadata.evidenceSource, icon: Layers },
          { label: 'Tingkat Keparahan', value: metadata.severity, icon: AlertTriangle },
        ].map((m) => (
          <div key={m.label} className="min-w-0">
            <div className="text-[8px] font-black text-slate-400 uppercase mb-1 flex items-center gap-1">
              <m.icon className="h-2.5 w-2.5" /> {m.label}
            </div>
            <div className="text-[11px] font-bold text-slate-800 truncate">{m.value}</div>
          </div>
        ))}
      </div>

      {/* Visual Chronology Layout */}
      <div className="flex-1 grid grid-cols-3 gap-6 min-h-0 overflow-hidden">
        {(['pre_contact', 'contact', 'post_contact'] as ChronologyPhase[]).map((phase) => {
          const config = PHASE_CONFIG[phase];
          return (
            <div key={phase} className="flex flex-col border border-slate-100 rounded-2xl overflow-hidden bg-white shadow-sm ring-1 ring-slate-200/50">
              <div className={cn(config.color, "px-5 py-3 flex items-center justify-between")}>
                <span className="text-[11px] font-black text-white uppercase tracking-[0.2em]">{config.label}</span>
                <span className="text-[9px] font-black text-white/60">{groupedItems[phase].length} Kejadian</span>
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar bg-slate-50/10">
                {groupedItems[phase].length > 0 ? groupedItems[phase].map((item) => (
                  <div 
                    key={item.id} 
                    onClick={() => onSelectItem(item.id)}
                    className={cn(
                      "relative group cursor-pointer p-2 -mx-2 rounded-lg transition-all",
                      selectedFactId === item.id ? "bg-slate-100 shadow-inner" : "hover:bg-slate-50"
                    )}
                  >
                    <div className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={cn("h-2.5 w-2.5 rounded-full mt-1.5 shadow-sm", config.dotColor)} />
                        <div className="w-px flex-1 bg-slate-100 my-1 group-last:hidden" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                             <span className="text-[10px] font-mono font-black text-slate-400">[{item.time_label}]</span>
                             {item.provenanceType === 'AI_HUMAN_ANNOTATED' && (
                               <span className="text-[8px] font-black uppercase text-blue-500 tracking-widest bg-blue-50 px-1 py-0.5 rounded" title="Human Annotated">Human Annotated &middot; {item.humanAnnotationCount}&times;</span>
                             )}
                             {item.provenanceType === 'HUMAN_MANUAL' && (
                               <span className="text-[8px] font-black uppercase text-emerald-500 tracking-widest bg-emerald-50 px-1 py-0.5 rounded" title="Added Manually">Added Manually</span>
                             )}
                             {(!item.provenanceType || item.provenanceType === 'AI_GENERATED') && (
                               <span className="text-[8px] font-black uppercase text-indigo-400 tracking-widest bg-indigo-50/50 px-1 py-0.5 rounded" title="AI Generated">AI Generated</span>
                             )}
                          </div>
                          {item.traceability && (
                             <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Lacak</span>
                                <ChevronRight className="h-2.5 w-2.5 text-slate-300" />
                             </div>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-900 leading-snug">
                          {item.chronology_text}
                        </p>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="h-full flex flex-col items-center justify-center opacity-20 py-10">
                    <History className="h-8 w-8 mb-2" />
                    <span className="text-[9px] font-black uppercase">Tidak Ada Data</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Branded Line */}
      <div className="absolute bottom-10 left-[60px] right-[60px] flex justify-between items-center opacity-30 border-t border-slate-100 pt-8">
        <span className="text-[11px] font-black text-slate-800 uppercase tracking-[0.35em] font-mono">BERAU CORE INTELLIGENCE PIPELINE</span>
        <div className="flex items-center gap-4">
          <div className="flex gap-1.5">
            <div className="h-4 w-4 rounded-full bg-emerald-600" />
            <div className="h-4 w-4 rounded-full bg-rose-600" />
            <div className="h-4 w-4 rounded-full bg-amber-500" />
          </div>
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] font-mono">MATRIX v4.8.2-SYNTH</span>
        </div>
      </div>
    </div>
  );
};

// ── Default/Operational View Component ─────────────────────────────────────

const FactDefaultView: React.FC<{ 
  items: ChronologyItem[],
  groupedItems: Record<ChronologyPhase, ChronologyItem[]>,
  editingId: string | null,
  editBuffer: Partial<ChronologyItem>,
  setEditBuffer: (b: Partial<ChronologyItem>) => void,
  onEdit: (item: ChronologyItem) => void,
  onSave: () => void,
  onCancel: () => void,
  onDelete: (id: string) => void,
  onOpenDetail: (id: string, type: 'detail' | 'history') => void,
  metadata: FactMetadata,
  selectedFactId?: string | null,
  onSelectItem: (id: string | null) => void,
  onAddFact: (phase: string) => void,
  editChangeNote: string,
  setEditChangeNote: (val: string) => void,
  readonly?: boolean
}> = ({ 
  items, 
  groupedItems, 
  editingId, 
  editBuffer, 
  setEditBuffer, 
  onEdit, 
  onSave, 
  onCancel,
  onDelete,
  onOpenDetail,
  metadata,
  selectedFactId,
  onSelectItem,
  onAddFact,
  editChangeNote,
  setEditChangeNote,
  readonly
}) => {
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showLocalAccuracy, setShowLocalAccuracy] = useState(false);

  const globalAverage = useMemo(() => {
    if (items.length === 0) return 100;
    const totalAcc = items.reduce((sum, item) => sum + calculateItemAccuracy(item).accuracy, 0);
    return Math.round(totalAcc / items.length);
  }, [items]);

  return (
    <div className="flex flex-col h-full bg-slate-50/10">
      <div className="h-12 flex items-center justify-between px-5 border-b border-slate-200 bg-white shrink-0">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500" />
          <h2 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Case Chronology</h2>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{items.length} TOTAL ITEMS</span>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-slate-50 p-8 flex justify-center scrollbar-thin">
        <div className="w-full max-w-[1300px] bg-white border border-slate-300 shadow-sm p-8 pb-16 h-fit shrink-0 space-y-8">
          {(['pre_contact', 'contact', 'post_contact'] as ChronologyPhase[]).map((phase) => {
            const config = PHASE_CONFIG[phase];
            const phaseItems = groupedItems[phase];

            return (
              <div key={phase} className="space-y-0">
                <div className="bg-white border border-slate-400 overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr>
                         <th colSpan={showLocalAccuracy ? 3 : 2} className={cn("px-4 py-2 text-[13px] font-bold text-center border-b border-slate-400 text-slate-900 uppercase tracking-widest", config.color)}>
                            {config.label}
                         </th>
                      </tr>
                      <tr className="bg-slate-50/80">
                        <th className="px-4 py-2 text-[10px] font-bold text-slate-900 uppercase tracking-widest w-32 border-r border-b border-slate-400 bg-white text-center">Time</th>
                        <th className="px-4 py-2 text-[10px] font-bold text-slate-900 uppercase tracking-widest border-r border-b border-slate-400 bg-white">Description</th>
                        {showLocalAccuracy && (
                          <th className="px-4 py-2 text-[10px] font-bold text-slate-900 uppercase tracking-widest w-32 border-r border-b border-slate-400 bg-white text-center">Akurasi AI</th>
                        )}
                        
                      </tr>
                    </thead>
                    <tbody className="">
                      {phaseItems.length > 0 ? phaseItems.map((item) => {
                        const isSelected = selectedFactId === item.id;
                        const isEditing = editingId === item.id;
                        const { accuracy: rowAcc } = calculateItemAccuracy(item);

                        return (
                          <tr 
                            key={item.id} 
                            onClick={() => {
                               if (readonly) {
                                  onSelectItem(item.id);
                                  return;
                               }
                               onSelectItem(item.id);
                            }}
                            onDoubleClick={(e) => {
                               if (!readonly) onEdit(item);
                            }}
                            className={cn(
                              "group transition-all cursor-pointer relative", 
                              isSelected ? "bg-slate-100/70" : "bg-white hover:bg-slate-50/80"
                            )}
                          >
                            <td className={cn("px-4 py-2 align-top border-r border-b border-slate-400 transition-colors", isSelected && "border-l-[3px] border-l-blue-600")}>
                              <div className="flex flex-col gap-1">
                                {isEditing ? (
                                  <input 
                                    type="text"
                                    value={editBuffer.time_label || ""}
                                    onChange={(e) => setEditBuffer({ ...editBuffer, time_label: e.target.value })}
                                    onClick={(e) => e.stopPropagation()}
                                    className="w-full bg-white px-2 py-1 text-[11px] font-mono font-black border border-slate-300 rounded text-slate-900 transition-colors focus:outline-none focus:ring-0 focus:border-blue-500"
                                  />
                                ) : (
                                  <span className={cn("text-[11px] font-mono font-black mt-0.5", config.textColor)}>{item.time_label}</span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-2 align-top border-r border-b border-slate-400">
                              <div className="relative">
                                {isEditing ? (
                                   <div className="flex flex-col gap-2.5 w-full animate-in fade-in slide-in-from-top-1 duration-200" onClick={(e) => e.stopPropagation()}>
                                      <textarea 
                                        value={editBuffer.chronology_text || ""}
                                        onChange={(e) => setEditBuffer({ ...editBuffer, chronology_text: e.target.value })}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                                            e.preventDefault();
                                            onSave();
                                          } else if (e.key === 'Escape') {
                                            onCancel();
                                          }
                                        }}
                                        className="w-full bg-white p-2.5 resize-none font-inherit leading-normal min-h-[80px] border border-slate-300 rounded text-slate-900 transition-colors focus:outline-none focus:ring-0 focus:border-blue-500"
                                        autoFocus
                                      />
                                      <input 
                                        type="text"
                                        value={editChangeNote}
                                        onChange={(e) => setEditChangeNote(e.target.value)}
                                        placeholder="Catatan perubahan (opsional)"
                                        className="w-full bg-white px-2.5 py-1.5 text-[11px] border border-slate-300 rounded text-slate-900 transition-colors focus:outline-none focus:ring-0 focus:border-blue-500"
                                      />
                                      <div className="flex items-center justify-between text-[10px]">
                                        <span className="text-slate-400 font-medium">Ctrl + Enter to Save, Esc to Cancel</span>
                                        <div className="flex items-center gap-1.5">
                                          <button 
                                            onClick={(e) => { e.stopPropagation(); onCancel(); }}
                                            className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 hover:text-slate-800 border border-slate-300 rounded shadow-sm transition-all active:scale-95 duration-100"
                                          >
                                            <X className="h-3 w-3" /> Cancel
                                          </button>
                                          <button 
                                            onClick={(e) => { e.stopPropagation(); onSave(); }}
                                            className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-white bg-blue-600 hover:bg-blue-700 border border-blue-700 rounded shadow-sm transition-all active:scale-95 duration-100 min-w-[70px] justify-center"
                                          >
                                            <Check className="h-3 w-3" /> Save
                                          </button>
                                        </div>
                                      </div>
                                   </div>
                                ) : (
                                  <div className="flex items-start justify-between gap-4">
                                    <p className={cn("text-[10px] leading-snug pr-2 transition-colors text-justify flex-1", 
                                      isSelected ? "text-slate-900" : "text-slate-900"
                                    )}>
                                      {item.chronology_text}
                                      <span className="inline-flex ml-2 align-middle">
                                        {renderProvenanceBadge(item, cleanMode)}
                                      </span>
                                    </p>
                                    {!readonly && (
                                      <div className={cn("flex items-center shrink-0 gap-1 transition-opacity duration-120", isSelected ? "opacity-100 pointer-events-auto" : "opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto")}>
                                        <TooltipProvider delayDuration={400}>
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <button 
                                                onClick={(e) => { e.stopPropagation(); onOpenDetail(item.id, 'detail'); }}
                                                className="p-1.5 rounded transition-colors text-slate-500 hover:text-blue-600 hover:bg-blue-50 outline-none focus:ring-1 focus:ring-slate-400"
                                              >
                                                 <Eye className="h-4 w-4" />
                                              </button>
                                            </TooltipTrigger>
                                            <TooltipContent side="top" className="z-50 text-[10px] font-bold">
                                              Lihat detail analisis
                                            </TooltipContent>
                                          </Tooltip>
                                        </TooltipProvider>

                                        <TooltipProvider delayDuration={400}>
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <button 
                                                onClick={(e) => { e.stopPropagation(); onEdit(item); }}
                                                className="p-1.5 rounded transition-colors text-slate-500 hover:text-blue-600 hover:bg-blue-50 outline-none focus:ring-1 focus:ring-slate-400"
                                              >
                                                 <Pencil className="h-4 w-4" />
                                              </button>
                                            </TooltipTrigger>
                                            <TooltipContent side="top" className="z-50 text-center">
                                              <p className="text-[10px] font-bold">Edit fakta</p>
                                              <p className="text-[9px] text-slate-400 mt-0.5">Double-click baris sebagai shortcut</p>
                                            </TooltipContent>
                                          </Tooltip>
                                        </TooltipProvider>

                                        <TooltipProvider delayDuration={400}>
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <button 
                                                onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                                                className="p-1.5 rounded transition-colors text-slate-500 hover:text-red-600 hover:bg-red-50 outline-none focus:ring-1 focus:ring-slate-400"
                                              >
                                                 <Trash2 className="h-4 w-4" />
                                              </button>
                                            </TooltipTrigger>
                                            <TooltipContent side="top" className="z-50 text-center">
                                              <p className="text-[10px] font-bold text-red-600">Hapus Fakta</p>
                                            </TooltipContent>
                                          </Tooltip>
                                        </TooltipProvider>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </td>
                            {showLocalAccuracy && (
                              <td className="px-4 py-2 align-middle text-center border-r border-b border-slate-400 w-32">
                                <span className={cn(
                                  "font-mono font-black text-[11px] px-2 py-0.5 border rounded-none transition-colors",
                                  rowAcc >= 90 ? "text-emerald-600 bg-emerald-50 border-emerald-200" :
                                  rowAcc >= 70 ? "text-blue-600 bg-blue-50 border-blue-200" :
                                  rowAcc >= 40 ? "text-amber-600 bg-amber-50 border-amber-200" :
                                  "text-rose-600 bg-rose-50 border-rose-200"
                                )}>{rowAcc}%</span>
                              </td>
                            )}
                          </tr>
                        );
                      }) : (
                        <tr>
                          <td colSpan={showLocalAccuracy ? 3 : 2} className="px-5 py-8 text-center text-slate-300 text-[10px] font-black uppercase tracking-widest border-r border-b border-slate-400">
                            No data available
                          </td>
                        </tr>
                      )}
                      {!readonly && (
                        <tr>
                          <td colSpan={showLocalAccuracy ? 3 : 2} className="px-0 py-0 border-r border-b border-slate-400 relative">
                             <button 
                               onClick={(e) => { e.stopPropagation(); onAddFact(phase); }}
                               className="w-full text-center py-2 text-[11px] font-bold text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors uppercase tracking-widest bg-slate-50/50 hover:border-emerald-200 border border-transparent"
                             >
                               + Tambah Data
                             </button>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const FactTableView: React.FC<{ 
  groupedItems: Record<ChronologyPhase, ChronologyItem[]>,
  editingId: string | null,
  editBuffer: Partial<ChronologyItem>,
  setEditBuffer: (b: Partial<ChronologyItem>) => void,
  onEdit: (item: ChronologyItem) => void,
  onSave: () => void,
  onCancel: () => void,
  onDelete: (id: string) => void,
  onOpenDetail: (id: string, type: 'detail' | 'history') => void,
  selectedFactId?: string | null,
  onSelectItem: (id: string | null) => void,
  onAddFact: (phase: string) => void,
  setDisplayFormat: (val: any) => void,
  readonly?: boolean,
  editChangeNote: string,
  setEditChangeNote: (val: string) => void
}> = ({ 
  groupedItems, 
  editingId, 
  editBuffer, 
  setEditBuffer, 
  onEdit, 
  onSave, 
  onCancel,
  onOpenDetail,
  selectedFactId,
  onSelectItem,
  onAddFact,
  setDisplayFormat,
  readonly,
  editChangeNote,
  setEditChangeNote
}) => {
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  return (
    <div className="w-full h-full overflow-auto bg-slate-50 p-8 flex justify-center scrollbar-thin">
      <div className="w-full max-w-[1300px] bg-white border border-slate-300 shadow-sm p-8 pb-16 h-fit shrink-0">
        {/* Header Legend */}
        <div className="flex justify-end items-start mb-6">
          <div className="flex items-center gap-4 text-[10px] font-bold">
            <div className="flex items-center gap-2">
              <div className="w-10 h-4 bg-[#ffff99] border border-slate-500"></div>
              <span>PRA-KONTAK</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-4 bg-[#ff3333] border border-slate-500"></div>
              <span>KONTAK</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-4 bg-[#00b0f0] border border-slate-500"></div>
              <span>PASCA KONTAK</span>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="border border-slate-400">
          <div className="grid grid-cols-3 divide-x divide-slate-400">
            {(['pre_contact', 'contact', 'post_contact'] as ChronologyPhase[]).map((phaseKey, idx) => {
              const phaseItems = groupedItems[phaseKey] || [];
              let bg = "";
              let title = "";
              if (idx === 0) { bg = "bg-[#ffff99]"; title = "PRA-KONTAK"; }
              else if (idx === 1) { bg = "bg-[#ff3333]"; title = "KONTAK"; }
              else { bg = "bg-[#00b0f0]"; title = "PASCA KONTAK"; }
              
              return (
                <div key={idx} className="flex flex-col">
                  {/* Phase */}
                  <div className={`text-center py-2 font-bold text-[13px] border-b border-slate-400 text-slate-900 uppercase tracking-widest ${bg}`}>
                    {title}
                  </div>
                  {/* Body */}
                  <div className="p-4 flex-1 space-y-4 text-[11px] leading-relaxed text-slate-800 text-justify">
                    {phaseItems.map((item) => {
                      const isSelected = selectedFactId === item.id;
                      const isEditing = editingId === item.id;
                      return (
                        <div 
                          key={item.id} 
                          className={cn(
                            "relative group p-2 -mx-2 rounded transition-colors cursor-pointer border border-transparent flex flex-col",
                            isSelected ? "bg-slate-100/80 border-slate-200 border-l-[3px] border-l-blue-600 pl-[5px]" : "hover:bg-slate-50/50"
                          )}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (readonly) {
                              onSelectItem(item.id);
                              return;
                            }
                            onSelectItem(item.id);
                          }}
                          onDoubleClick={(e) => {
                            if (!readonly) onEdit(item);
                          }}
                        >
                          <div className="font-bold mb-1 text-slate-600 text-[10px] flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editBuffer.time_label || ""}
                                  onChange={(e) => setEditBuffer({ ...editBuffer, time_label: e.target.value })}
                                  onClick={(e) => e.stopPropagation()}
                                  className="bg-white px-2 py-0.5 text-[10px] font-bold border border-slate-300 rounded text-slate-900 transition-colors focus:outline-none focus:ring-0 focus:border-blue-500"
                                />
                              ) : (
                                <span>{item.time_label}</span>
                              )}
                            </div>
                          </div>
                          {isEditing ? (
                            <div className="space-y-2 mt-1" onClick={(e) => e.stopPropagation()}>
                              <textarea
                                className="w-full min-h-[80px] p-2 text-[11px] border border-slate-300 rounded-sm focus:outline-none focus:border-emerald-500"
                                value={editBuffer.chronology_text || ""}
                                onChange={(e) => setEditBuffer({ ...editBuffer, chronology_text: e.target.value })}
                              />
                              <input 
                                type="text"
                                value={editChangeNote}
                                onChange={(e) => setEditChangeNote(e.target.value)}
                                placeholder="Catatan perubahan (opsional)"
                                className="w-full p-2 text-[11px] border border-slate-300 rounded-sm focus:outline-none focus:border-emerald-500"
                              />
                              <div className="flex gap-2 justify-end">
                                <button
                                  className="px-3 py-1 text-[10px] font-bold border border-slate-300 text-slate-600 rounded-sm hover:bg-slate-100 transition-all active:scale-95"
                                  onClick={(e) => { e.stopPropagation(); onCancel(); }}
                                >
                                  BATAL
                                </button>
                                <button
                                  className="px-3 py-1 text-[10px] font-bold bg-blue-600 text-white border border-blue-700 rounded-sm hover:bg-blue-700 transition-all active:scale-95"
                                  onClick={(e) => { e.stopPropagation(); onSave(); }}
                                >
                                  SIMPAN
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <p className={cn("whitespace-pre-wrap transition-colors", isSelected ? "text-slate-900" : "")}>
                                {item.chronology_text}
                                <span className="inline-flex ml-2 align-middle">
                                  {renderProvenanceBadge(item, cleanMode)}
                                </span>
                              </p>
                              {!readonly && (
                                <div className={cn("absolute top-1 right-1 flex items-center gap-1 z-10 transition-opacity duration-120", isSelected ? "opacity-100 pointer-events-auto" : "opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto")}>
                                  <TooltipProvider delayDuration={400}>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <button 
                                          onClick={(e) => { e.stopPropagation(); onOpenDetail(item.id, 'detail'); }}
                                          className="p-1.5 bg-white/90 border border-slate-200 shadow-sm rounded transition-colors text-slate-500 hover:text-blue-600 hover:bg-blue-50 outline-none focus:ring-1 focus:ring-slate-400"
                                        >
                                           <Eye className="h-3 w-3" />
                                        </button>
                                      </TooltipTrigger>
                                      <TooltipContent side="top" className="z-50 text-[10px] font-bold">
                                        Lihat detail analisis
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>

                                  <TooltipProvider delayDuration={400}>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <button 
                                          onClick={(e) => { e.stopPropagation(); onEdit(item); }}
                                          className="p-1.5 bg-white/90 border border-slate-200 shadow-sm rounded transition-colors text-slate-500 hover:text-blue-600 hover:bg-blue-50 outline-none focus:ring-1 focus:ring-slate-400"
                                        >
                                           <Pencil className="h-3 w-3" />
                                        </button>
                                      </TooltipTrigger>
                                      <TooltipContent side="top" className="z-50 text-center">
                                        <p className="text-[10px] font-bold">Edit fakta</p>
                                        <p className="text-[9px] text-slate-400 mt-0.5">Double-click baris sebagai shortcut</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>

                                  <TooltipProvider delayDuration={400}>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <button 
                                          onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                                          className="p-1.5 bg-white/90 border border-slate-200 shadow-sm rounded transition-colors text-slate-500 hover:text-red-600 hover:bg-red-50 outline-none focus:ring-1 focus:ring-slate-400"
                                        >
                                           <Trash2 className="h-3 w-3" />
                                        </button>
                                      </TooltipTrigger>
                                      <TooltipContent side="top" className="z-50 text-center">
                                        <p className="text-[10px] font-bold text-red-600">Hapus Fakta</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {!readonly && (
                    <div className="p-0 border-t border-slate-400">
                       <button 
                         onClick={(e) => {
                           e.stopPropagation();
                           onAddFact(phaseKey);
                           setDisplayFormat('timeline');
                         }}
                         className="w-full text-center py-2 text-[11px] font-bold text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors uppercase tracking-widest bg-slate-50/50 hover:border-emerald-200 border border-transparent"
                       >
                         + Tambah Data
                       </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};


export const AnnotationHistoryView: React.FC<any> = () => null;
export const ProvenanceBlock: React.FC<any> = () => null;
