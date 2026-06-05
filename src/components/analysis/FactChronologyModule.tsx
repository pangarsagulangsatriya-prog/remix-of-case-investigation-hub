import React, { useState, useMemo } from 'react';
import { 
  Clock, 
  Brain, 
  User, 
  Pencil, 
  Check, 
  X, 
  AlertTriangle,
  Presentation,
  Table as TableIcon,
  Search,
  History,
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
  BarChart3
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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
}

export interface ChronologyItem {
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
}

const PHASE_CONFIG = {
  pre_contact: {
    label: "PRA KONTAK",
    color: "bg-emerald-600",
    lightColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    textColor: "text-emerald-700",
    dotColor: "bg-emerald-500",
  },
  contact: {
    label: "KONTAK",
    color: "bg-rose-600",
    lightColor: "bg-rose-50",
    borderColor: "border-rose-200",
    textColor: "text-rose-700",
    dotColor: "bg-rose-500",
  },
  post_contact: {
    label: "PASCA KONTAK",
    color: "bg-amber-500",
    lightColor: "bg-amber-50",
    borderColor: "border-amber-200",
    textColor: "text-amber-700",
    dotColor: "bg-amber-500",
  }
};

export const STATUS_CONFIG: Record<VerificationStatus, { label: string, color: string, icon: any }> = {
  ai_generated: { label: "AI Generated", color: "bg-blue-50 text-blue-600 border-blue-100", icon: Brain },
  human_verified: { label: "Human Verified", color: "bg-emerald-50 text-emerald-600 border-emerald-100", icon: ShieldCheck },
  needs_review: { label: "Needs Review", color: "bg-amber-50 text-amber-600 border-amber-100", icon: Clock },
  partially_supported: { label: "Partially Supported", color: "bg-violet-50 text-violet-600 border-violet-100", icon: Crosshair },
  unsupported: { label: "Unsupported", color: "bg-rose-50 text-rose-600 border-rose-100", icon: AlertTriangle },
};

export const FactChronologyModule: React.FC<FactChronologyModuleProps> = ({ 
  initialItems, 
  metadata,
  onSync,
  viewMode: controlledViewMode,
  onViewModeChange,
  onSelectItem,
  selectedItemId: controlledSelectedItemId
}) => {
  const [items, setItems] = useState<ChronologyItem[]>(initialItems);
  const [internalSelectedItemId, setInternalSelectedItemId] = useState<string | null>(null);
  
  React.useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);
  
  const viewMode = 'default';
  const selectedItemId = controlledSelectedItemId || internalSelectedItemId;
  const setSelectedItemId = (id: string | null) => {
    if (onSelectItem) onSelectItem(id);
    setInternalSelectedItemId(id);
  };

  const selectedItem = useMemo(() => {
    if (!selectedItemId) return null;
    return items.find(i => i.id === selectedItemId) || null;
  }, [items, selectedItemId]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBuffer, setEditBuffer] = useState<Partial<ChronologyItem>>({});

  const handleEdit = (item: ChronologyItem) => {
    setEditingId(item.id);
    setEditBuffer({ ...item });
  };

  const handleSaveEdit = () => {
    if (!editingId) return;

    setItems(prev => prev.map(item => {
      if (item.id === editingId) {
        const isActuallyChanged = 
          item.chronology_text !== editBuffer.chronology_text || 
          item.time_label !== editBuffer.time_label ||
          item.verification_status !== editBuffer.verification_status;
        
        if (!isActuallyChanged) return item;

        return {
          ...item,
          ...editBuffer,
          source: "human",
          annotated_by_human: true,
          updated_at: new Date().toISOString(),
          updated_by: "Current User",
          original_text: item.original_text || item.chronology_text
        } as ChronologyItem;
      }
      return item;
    }));

    setEditingId(null);
    setEditBuffer({});
    toast.success("Entry updated.");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditBuffer({});
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


        <div className="flex-1 overflow-hidden">
            <FactDefaultView 
              items={items} 
              groupedItems={groupedItems}
              editingId={editingId}
              editBuffer={editBuffer}
              setEditBuffer={setEditBuffer}
              onEdit={handleEdit}
              onSave={handleSaveEdit}
              onCancel={handleCancelEdit}
              metadata={metadata}
              selectedItemId={selectedItemId}
              onSelectItem={setSelectedItemId}
            />
        </div>

        {/* Sync Button Removed */}
      </div>

      {/* Traceability Panel */}
      {selectedItem && (
        <div className="w-[420px] shrink-0 border-l border-slate-200 h-full animate-in slide-in-from-right duration-300">
          <TraceabilityPanel 
            item={selectedItem}
            onClose={() => setSelectedItemId(null)}
            onUpdateStatus={(newStatus) => {
              setItems(prev => {
                const updated = prev.map(item => 
                  item.id === selectedItem.id 
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
  if (sim >= 0.75) return { label: "Identik / Sangat Mirip", score: 90, color: "text-emerald-400", bg: "bg-emerald-500" };
  if (sim >= 0.4) return { label: "Berbeda Parsial", score: 60, color: "text-amber-400", bg: "bg-amber-500" };
  return { label: "Berbeda Signifikan", score: 20, color: "text-rose-400", bg: "bg-rose-500" };
};

const calculateItemAccuracy = (item: ChronologyItem) => {
  const breakdown = item.breakdown || {};
  const fieldsForAccuracy = [
    { label: "WAKTU", val: breakdown.time || item.time_label, orig: (breakdown as any).time_original_value || breakdown.time || item.time_label, isHuman: !!(breakdown as any).time_annotated_by_human },
    { label: "PIHAK", val: breakdown.subject?.value || breakdown.actor, orig: breakdown.subject?.original_value || breakdown.subject?.value || breakdown.actor, isHuman: !!(breakdown.subject as any)?.annotated_by_human },
    { label: "OBJEK", val: breakdown.object?.value || (breakdown.location as any)?.value, orig: breakdown.object?.original_value || (breakdown.location as any)?.original_value || breakdown.object?.value || (breakdown.location as any)?.value, isHuman: !!(breakdown.location as any)?.annotated_by_human || !!(breakdown.object as any)?.annotated_by_human },
    { label: "KEJADIAN", val: breakdown.action?.value, orig: breakdown.action?.original_value || breakdown.action?.value, isHuman: !!(breakdown.action as any)?.annotated_by_human },
    { label: "KONTEKS", val: breakdown.condition?.value, orig: breakdown.condition?.original_value || breakdown.condition?.value, isHuman: !!(breakdown.condition as any)?.annotated_by_human },
    { label: "SUMBER", val: breakdown.source_system?.value, orig: breakdown.source_system?.original_value || breakdown.source_system?.value, isHuman: !!(breakdown.source_system as any)?.annotated_by_human },
    { label: "DAMPAK", val: (breakdown.why as any)?.value, orig: (breakdown.why as any)?.original_value || (breakdown.why as any)?.value, isHuman: !!(breakdown.why as any)?.annotated_by_human }
  ];

  let totalScore = 0;
  let totalValidFields = 0;

  fieldsForAccuracy.forEach(f => {
    if ((f.val && f.val !== "-") || (f.orig && f.orig !== "-")) {
      totalValidFields++;
      if (!f.isHuman) {
        totalScore += 100;
      } else {
        const v1 = (f.val || "").toString().toLowerCase().trim();
        const v2 = (f.orig || "").toString().toLowerCase().trim();
        if (v1 === v2) {
          totalScore += 100;
        } else {
          const distance = calculateLevenshteinDistance(v1, v2);
          const maxLen = Math.max(v1.length, v2.length);
          const sim = maxLen === 0 ? 1 : (maxLen - distance) / maxLen;
          
          if (sim >= 0.75) totalScore += 90;
          else if (sim >= 0.4) totalScore += 60;
          else totalScore += 20;
        }
      }
    }
  });

  return {
    accuracy: totalValidFields > 0 ? Math.round(totalScore / totalValidFields) : 100,
    validFieldsCount: totalValidFields
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

const renderHighlightedStatement = (text: string, item: ChronologyItem, activeDimension: string | null, setActiveDimension: (dim: string | null) => void) => {
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
      val: d.originalValue?.trim(),
      color: d.isHuman ? humanTagColor : tagColor,
      isHuman: !!d.isHuman,
      currentValue: d.value?.trim() || ""
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
      val: d.originalValue?.trim(),
      color: d.isHuman ? humanTagColor : tagColor,
      isHuman: !!d.isHuman,
      currentValue: d.value?.trim() || ""
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

// ── Traceability Panel Component ──────────────────────────────────────────


export const TraceabilityPanel: React.FC<{ 
  item: ChronologyItem, 
  onClose: () => void,
  onUpdateStatus: (status: VerificationStatus) => void,
  onUpdateBreakdown: (newBreakdown: any) => void,
  onEdit: () => void,
  onUpdateChronologyText?: (newText: string) => void
}> = ({ item, onClose, onUpdateBreakdown, onUpdateChronologyText }) => {
  const [isEditingStatement, setIsEditingStatement] = useState(false);
  const [segments, setSegments] = useState<Segment[]>([]);

  const handleTextSegmentChange = (index: number, newValue: string) => {
    setSegments(prev => prev.map((seg, idx) => 
      idx === index ? { ...seg, value: newValue } : seg
    ));
  };
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [editingRowLabel, setEditingRowLabel] = useState<string | null>(null);
  const [tempRowValue, setTempRowValue] = useState<string>("");
  const [activeDimension, setActiveDimension] = useState<string | null>(null);

  const toggleRow = (label: string) => {
    setExpandedRows(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const breakdown = item.breakdown || {};

  const handleSaveRow = (label: string, newValue: string) => {
    let updatedBreakdown = { ...breakdown };
    if (label === "KEJADIAN") {
      updatedBreakdown.action = { 
        ...(breakdown.action || {}), 
        value: newValue, 
        original_value: breakdown.action?.original_value || breakdown.action?.value || item.chronology_text,
        annotated_by_human: true 
      };
    } else if (label === "PIHAK") {
      updatedBreakdown.subject = { 
        ...(breakdown.subject || {}), 
        value: newValue, 
        original_value: breakdown.subject?.original_value || breakdown.subject?.value || breakdown.actor,
        annotated_by_human: true 
      };
    } else if (label === "OBJEK") {
      const origLocation = (breakdown.location as any)?.original_value || (breakdown.location as any)?.value;
      const origObject = breakdown.object?.original_value || breakdown.object?.value;
      updatedBreakdown.location = { 
        ...((breakdown.location as any) || {}), 
        value: newValue, 
        original_value: origLocation,
        annotated_by_human: true 
      };
      updatedBreakdown.object = { 
        ...(breakdown.object || {}), 
        value: newValue, 
        original_value: origObject,
        annotated_by_human: true 
      };
    } else if (label === "WAKTU") {
      (updatedBreakdown as any).time_original_value = (breakdown as any).time_original_value || breakdown.time || item.time_label;
      updatedBreakdown.time = newValue;
      (updatedBreakdown as any).time_annotated_by_human = true;
    } else if (label === "DAMPAK") {
      updatedBreakdown.why = { 
        ...((breakdown.why as any) || {}), 
        value: newValue, 
        original_value: (breakdown.why as any)?.original_value || (breakdown.why as any)?.value,
        annotated_by_human: true 
      };
    } else if (label === "KONTEKS") {
      updatedBreakdown.condition = { 
        ...(breakdown.condition || {}), 
        value: newValue, 
        original_value: breakdown.condition?.original_value || breakdown.condition?.value,
        annotated_by_human: true 
      };
    } else if (label === "SUMBER") {
      updatedBreakdown.source_system = { 
        ...(breakdown.source_system || {}), 
        value: newValue, 
        original_value: breakdown.source_system?.original_value || breakdown.source_system?.value,
        annotated_by_human: true 
      };
    }
    onUpdateBreakdown(updatedBreakdown);
    setEditingRowLabel(null);
  };
  
  const mappedTraceability = item.traceability?.map(t => ({
    type: t.source_type,
    content: t.extracted_content,
    time: t.timestamp_start,
    speaker: t.source_file_name,
    thumbnail: t.source_type === 'video' ? 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=300&q=80' : undefined
  })) || [];

  const whatCitations = [...((breakdown.action as any)?.citations || []), ...mappedTraceability];

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

  const w5h1 = [
    { label: "WAKTU", value: breakdown.time || item.time_label, citations: getDummyCitations("WAKTU") },
    { label: "PIHAK", value: breakdown.subject?.value || breakdown.actor || "-", citations: (breakdown.subject as any)?.citations?.length ? (breakdown.subject as any)?.citations : getDummyCitations("PIHAK") },
    { label: "OBJEK", value: breakdown.object?.value || (breakdown.location as any)?.value || "-", citations: getDummyCitations("OBJEK") },
    { label: "KEJADIAN", value: breakdown.action?.value || item.chronology_text, citations: whatCitations.length > 0 ? whatCitations : getDummyCitations("KEJADIAN") },
    { label: "KONTEKS", value: breakdown.condition?.value || "-", citations: (breakdown.condition as any)?.citations?.length ? (breakdown.condition as any)?.citations : getDummyCitations("KONTEKS") },
    { label: "SUMBER", value: breakdown.source_system?.value || "DMS & Kamera Pengawas", citations: getDummyCitations("SUMBER") },
    { label: "STATUS", value: item.status === "human_verified" ? "Terkonfirmasi" : "Menunggu Validasi", citations: getDummyCitations("STATUS") },
    { label: "DAMPAK", value: (breakdown.why as any)?.value || "Risiko Operasional & Keselamatan", citations: getDummyCitations("DAMPAK") },
    { label: "TINDAKAN", value: "Proses Investigasi", citations: getDummyCitations("TINDAKAN") }
  ];

  const { accuracy: accuracyPercent, validFieldsCount: totalValidFields } = calculateItemAccuracy(item);


  return (
    <div className="flex flex-col h-full bg-white border-l border-slate-200">
      {/* Panel Header */}
      <div className="p-4 border-b border-slate-200 bg-white shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 bg-slate-900 flex items-center justify-center text-white rounded-none">
              <TableIcon className="h-3.5 w-3.5" />
            </div>
            <div>
              <h3 className="text-[13px] font-bold text-slate-900 uppercase tracking-wider leading-none">Dekomposisi Fakta</h3>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Investigation Evidence Analysis</p>
            </div>
          </div>
          <div className="flex items-center">
            <Button variant="ghost" size="sm" onClick={onClose} className="h-7 w-7 p-0 hover:bg-slate-100 rounded-none">
              <X className="h-4 w-4 text-slate-500" />
            </Button>
          </div>
        </div>

        {/* AI Metrics Bar */}
        <TooltipProvider delayDuration={150}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-none mb-3 flex flex-col gap-2 cursor-help group hover:bg-slate-100 transition-colors">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-mono text-slate-500 font-bold uppercase tracking-wider group-hover:text-slate-700">Akurasi Ekstraksi AI</span>
                  <span className={cn(
                    "font-mono font-black px-1.5 py-0.5 border border-blue-200/50 transition-colors",
                    accuracyPercent >= 90 ? "text-emerald-600 bg-emerald-50/80 border-emerald-200/50 group-hover:bg-emerald-100" : 
                    accuracyPercent >= 70 ? "text-blue-600 bg-blue-50/80 border-blue-200/50 group-hover:bg-blue-100" :
                    accuracyPercent >= 40 ? "text-amber-600 bg-amber-50/80 border-amber-200/50 group-hover:bg-amber-100" :
                    "text-rose-600 bg-rose-50/80 border-rose-200/50 group-hover:bg-rose-100"
                  )}>{accuracyPercent}%</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-none overflow-hidden flex">
                  <div 
                    className={cn(
                      "h-full transition-all duration-500 ease-out",
                      accuracyPercent >= 90 ? "bg-emerald-500" : 
                      accuracyPercent >= 70 ? "bg-blue-500" :
                      accuracyPercent >= 40 ? "bg-amber-500" :
                      "bg-rose-500"
                    )}
                    style={{ width: `${accuracyPercent}%` }} 
                  />
                </div>
                <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 mt-0.5 uppercase tracking-wide">
                  <span>Deviasi Semantik Anotator</span>
                  <span>Skala 3-Level ({totalValidFields} Atribut)</span>
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent side="left" align="start" className="w-[320px] bg-slate-900 text-slate-300 text-[10.5px] p-3 font-sans rounded-none shadow-xl flex flex-col gap-2 z-50 border border-slate-700">
              <div className="text-white font-bold text-[11px] mb-1 flex items-center gap-2">
                <Brain className="w-3.5 h-3.5 text-blue-400" />
                Penghitungan Akurasi Ekstraksi
              </div>
              <p className="leading-relaxed">
                Akurasi dihitung menggunakan <strong>Algoritma Levenshtein Distance</strong> untuk mengukur kemiripan string secara semantik antara hasil ekstraksi AI dan anotasi manual oleh manusia.
              </p>
              <div className="mt-1 flex flex-col gap-1.5 p-2 bg-slate-800/50 border border-slate-700">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>Identik / Sangat Mirip</span>
                  <span className="font-mono text-[9px] text-slate-400">Similarity ≥ 75%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>Berbeda Parsial</span>
                  <span className="font-mono text-[9px] text-slate-400">Similarity ≥ 40%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>Berbeda Signifikan</span>
                  <span className="font-mono text-[9px] text-slate-400">Similarity &lt; 40%</span>
                </div>
              </div>
              <p className="text-[9.5px] text-slate-400 leading-relaxed mt-1">
                Atribut yang tidak dianotasi manusia dianggap memiliki akurasi 100%. Total skor dari setiap atribut dirata-rata untuk persentase keseluruhan.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <div className="bg-slate-50/50 p-3 border border-slate-200 rounded-none mb-1 group/stmt">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-slate-400">Chronology Statement</span>
            {!isEditingStatement && (
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover/stmt:opacity-100 h-5 w-5 p-0 hover:bg-slate-200 rounded-none transition-opacity"
                onClick={() => {
                  const initialSegments = getStatementSegments(item.chronology_text, item);
                  setSegments(initialSegments);
                  setIsEditingStatement(true);
                }}
              >
                <Pencil className="h-3 w-3 text-slate-400 hover:text-blue-600" />
              </Button>
            )}
          </div>
          {isEditingStatement ? (
            <div className="flex flex-col gap-2 mt-1">
              <div className="flex flex-wrap items-center leading-[2.6] text-slate-700 text-[12.5px] font-sans p-2 border border-slate-200 bg-white min-h-[80px]">
                {segments.map((seg, idx) => {
                  if (seg.type === 'label') {
                    return (
                      <span 
                        key={idx} 
                        className={cn(
                          "inline-block px-2 py-0.5 border font-sans font-semibold mx-1 my-0.5 rounded-none align-middle text-[12.5px] leading-relaxed cursor-not-allowed select-none", 
                          seg.color
                        )}
                      >
                        {seg.value}
                      </span>
                    );
                  } else {
                    return (
                      <span
                        key={idx}
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) => handleTextSegmentChange(idx, e.currentTarget.innerText)}
                        className="inline-block text-[12.5px] text-slate-800 font-normal leading-relaxed border-b border-dashed border-slate-300 focus:border-blue-600 focus:outline-none bg-slate-50/50 hover:bg-slate-100/70 py-0.5 px-1 font-sans mx-0.5 min-w-[20px] outline-none"
                      >
                        {seg.value}
                      </span>
                    );
                  }
                })}
              </div>
              <div className="flex items-center gap-1.5 justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const newText = segments.map(s => s.value).join('');
                    if (onUpdateChronologyText) {
                      onUpdateChronologyText(newText);
                    }
                    setIsEditingStatement(false);
                  }}
                  className="h-7 px-3 text-[10px] font-bold uppercase tracking-wider bg-blue-600 text-white hover:bg-blue-700 rounded-none flex items-center gap-1 shadow-sm"
                >
                  <Check className="h-3 w-3" /> Save
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditingStatement(false)}
                  className="h-7 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-none flex items-center gap-1 border border-slate-200"
                >
                  <X className="h-3 w-3" /> Discard
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-1">
              {renderHighlightedStatement(item.chronology_text, item, activeDimension, setActiveDimension)}
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area: 5W1H Full-Width Table */}
      <div className="flex-1 overflow-auto p-0 scrollbar-thin bg-slate-50/20">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100/80 border-b border-slate-200">
              <th className="px-3 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest w-[110px] border-r border-slate-200">
                Kategori
              </th>
              <th className="px-3 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Nilai Fakta
              </th>
              <th className="px-3 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest w-16 text-center border-l border-slate-200/60">
                Bukti
              </th>
            </tr>
          </thead>
          <tbody>
            {w5h1.map((row) => {
              const isExpanded = !!expandedRows[row.label];
              const hasCitations = row.citations && row.citations.length > 0;
              const isDimmed = activeDimension !== null && activeDimension !== row.label;
              
              return (
                <React.Fragment key={row.label}>
                  <tr 
                    onMouseEnter={() => setActiveDimension(row.label)}
                    onMouseLeave={() => setActiveDimension(null)}
                    className={cn(
                      "border-b border-slate-200 transition-all duration-300 rounded-none",
                      !editingRowLabel && hasCitations ? "hover:bg-slate-50/80 cursor-pointer" : "bg-white",
                      isExpanded ? "bg-slate-50" : "",
                      activeDimension === row.label ? "bg-blue-50/50" : "",
                      isDimmed ? "opacity-30" : "opacity-100"
                    )}
                    onClick={() => {
                      if (!editingRowLabel && hasCitations) toggleRow(row.label);
                      if (!editingRowLabel) setActiveDimension(activeDimension === row.label ? null : row.label);
                    }}
                  >
                     {editingRowLabel === row.label ? (
                      <td colSpan={3} className="px-4 py-3 bg-slate-50/50" onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-col gap-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                            Kategori: {row.label}
                          </span>
                          <textarea
                            value={tempRowValue}
                            onChange={(e) => setTempRowValue(e.target.value)}
                            className="w-full text-[12.5px] text-slate-800 font-normal leading-normal border border-slate-300 p-2 rounded-none font-sans focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 bg-white"
                            rows={3}
                          />
                          <div className="flex items-center gap-2 justify-end mt-3">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleSaveRow(row.label, tempRowValue)} 
                              className="h-8 px-4 text-[11px] font-bold uppercase tracking-wider bg-blue-600 text-white hover:bg-blue-700 rounded-none flex items-center gap-1.5 shadow-sm"
                            >
                              <Check className="h-3.5 w-3.5" /> Save
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => setEditingRowLabel(null)} 
                              className="h-8 px-4 text-[11px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-none flex items-center gap-1.5 border border-slate-200"
                            >
                              <X className="h-3.5 w-3.5" /> Discard
                            </Button>
                          </div>
                          
                          {hasCitations && (
                            <div className="mt-4 pt-4 border-t border-slate-200 text-left">
                              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                <Zap className="h-3 w-3 text-blue-600" />
                                Evidence List ({row.citations.length})
                              </div>
                              {renderGroupedCitations(row.citations)}
                            </div>
                          )}
                        </div>
                      </td>
                    ) : (
                      <>
                        <td className="px-3 py-3 align-middle border-r border-slate-200 font-mono text-[11px] font-bold text-slate-700 tracking-wider">
                          <div className="flex items-center gap-2">
                            {!editingRowLabel && hasCitations ? (
                              <ChevronDown 
                                className={cn(
                                  "h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform duration-200", 
                                  isExpanded ? "rotate-180 text-blue-600" : ""
                                )} 
                              />
                            ) : (
                              <div className="w-3.5 shrink-0" />
                            )}
                            {CATEGORY_EXPLANATIONS[row.label] ? (
                              <TooltipProvider delayDuration={150}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="cursor-help hover:text-blue-600 transition-colors border-b border-dotted border-slate-300">
                                      {row.label}
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent side="right" className="w-[280px] bg-slate-900 text-white p-3 font-sans rounded-none shadow-xl border border-slate-700 z-[9999]">
                                    <div className="font-bold text-[11px] leading-tight text-white mb-1">
                                      {CATEGORY_EXPLANATIONS[row.label].title}
                                    </div>
                                    <div className="font-semibold text-[10px] text-blue-400 leading-none mb-2">
                                      {CATEGORY_EXPLANATIONS[row.label].subtitle}
                                    </div>
                                    <p className="text-[10px] text-slate-300 leading-relaxed">
                                      {CATEGORY_EXPLANATIONS[row.label].text}
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ) : (
                              <span>{row.label}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-3 align-middle text-[12.5px] text-slate-800 font-normal leading-normal">
                          <div className="flex items-center justify-between group/cell min-h-[24px]">
                            <span className="pr-4">{row.value}</span>
                            {row.label !== "STATUS" && row.label !== "TINDAKAN" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="opacity-0 group-hover/cell:opacity-100 h-6 w-6 p-0 hover:bg-slate-100 rounded-none transition-opacity ml-2 shrink-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingRowLabel(row.label);
                                  setTempRowValue(row.value === "-" ? "" : row.value);
                                }}
                              >
                                <Pencil className="h-3.5 w-3.5 text-slate-400 hover:text-blue-600" />
                              </Button>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-3 align-middle text-center border-l border-slate-200/60">
                          {hasCitations ? (
                            <span className="inline-flex items-center justify-center min-w-[20px] text-[10px] font-bold text-blue-600 bg-blue-50/80 px-1.5 py-0.5 border border-blue-200/50 rounded-none">
                              {row.citations.length}
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-normal">-</span>
                          )}
                        </td>
                      </>
                    )}
                  </tr>
                  
                  {!editingRowLabel && isExpanded && hasCitations && (
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <td colSpan={3} className="p-0 border-l-4 border-l-blue-600">
                        <div className="bg-slate-50 p-4 border-b border-slate-200/60">
                          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                            <Zap className="h-3 w-3 text-blue-600" />
                            Evidence List ({row.citations.length})
                          </div>
                          {renderGroupedCitations(row.citations)}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ── Slide View Component ───────────────────────────────────────────────────

const FactSlideView: React.FC<{ 
  metadata: FactMetadata, 
  groupedItems: Record<ChronologyPhase, ChronologyItem[]>,
  selectedItemId?: string | null,
  onSelectItem: (id: string | null) => void
}> = ({ 
  metadata, 
  groupedItems,
  selectedItemId,
  onSelectItem
}) => {
  return (
    <div className="flex-1 flex flex-col p-[60px] text-slate-900 animate-in fade-in duration-500 relative">
      {/* Title Area */}
      <div className="flex justify-between items-start mb-6 border-b-2 border-slate-900 pb-4">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-1">OVERVIEW INCIDENT</div>
          <h2 className="text-[36px] font-black uppercase tracking-tighter leading-none">FACT & CHRONOLOGY</h2>
        </div>
        <div className="text-right">
          <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Investigation Code</div>
          <div className="text-sm font-mono font-bold text-slate-800">#{metadata.caseCode}</div>
        </div>
      </div>

      {/* Summary Block */}
      <div className="mb-6 bg-slate-50 border-l-4 border-slate-900 p-5 rounded-r-lg shadow-sm">
        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
          <Shield className="h-3 w-3" /> EXECUTIVE SUMMARY
        </div>
        <div className="text-[15px] text-slate-700 font-medium leading-relaxed italic">
          {metadata.summary}
        </div>
      </div>

      {/* Metadata Grid */}
      <div className="grid grid-cols-4 gap-x-8 gap-y-4 mb-8 bg-white border border-slate-100 p-6 rounded-xl shadow-sm">
        {[
          { label: 'Incident Date', value: metadata.incidentDate, icon: Calendar },
          { label: 'Incident Time', value: metadata.incidentTime, icon: Clock },
          { label: 'Location', value: metadata.location, icon: MapPin },
          { label: 'Incident Type', value: metadata.incidentType, icon: Search },
          { label: 'Department', value: metadata.department, icon: User },
          { label: 'Evidence Source', value: metadata.evidenceSource, icon: Layers },
          { label: 'Severity', value: metadata.severity, icon: AlertTriangle },
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
                <span className="text-[9px] font-black text-white/60">{groupedItems[phase].length} Events</span>
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar bg-slate-50/10">
                {groupedItems[phase].length > 0 ? groupedItems[phase].map((item) => (
                  <div 
                    key={item.id} 
                    onClick={() => onSelectItem(item.id)}
                    className={cn(
                      "relative group cursor-pointer p-2 -mx-2 rounded-lg transition-all",
                      selectedItemId === item.id ? "bg-slate-100 shadow-inner" : "hover:bg-slate-50"
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
                             {item.annotated_by_human && (
                               <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" title="Human Annotated" />
                             )}
                          </div>
                          {item.traceability && (
                             <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Trace</span>
                                <ChevronRight className="h-2.5 w-2.5 text-slate-300" />
                             </div>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                          {item.chronology_text}
                        </p>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="h-full flex flex-col items-center justify-center opacity-20 py-10">
                    <History className="h-8 w-8 mb-2" />
                    <span className="text-[9px] font-black uppercase">No Data</span>
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
  metadata: FactMetadata,
  selectedItemId?: string | null,
  onSelectItem: (id: string | null) => void
}> = ({ 
  items, 
  groupedItems, 
  editingId, 
  editBuffer, 
  setEditBuffer, 
  onEdit, 
  onSave, 
  onCancel,
  metadata,
  selectedItemId,
  onSelectItem
}) => {
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
          <div className="flex items-center gap-2 border-r border-slate-200 pr-4">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Rata-Rata Akurasi Global</span>
            <span className={cn(
              "font-mono font-black text-[11px] px-2 py-0.5 border rounded-none transition-colors",
              globalAverage >= 90 ? "text-emerald-600 bg-emerald-50 border-emerald-200" :
              globalAverage >= 70 ? "text-blue-600 bg-blue-50 border-blue-200" :
              globalAverage >= 40 ? "text-amber-600 bg-amber-50 border-amber-200" :
              "text-rose-600 bg-rose-50 border-rose-200"
            )}>{globalAverage}%</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowLocalAccuracy(!showLocalAccuracy)}
              className="h-6 w-6 p-0 hover:bg-slate-100 rounded-none ml-1 text-slate-500"
              title={showLocalAccuracy ? "Sembunyikan Akurasi AI" : "Tunjukkan Akurasi AI"}
            >
              {showLocalAccuracy ? (
                <Eye className="h-3.5 w-3.5" />
              ) : (
                <EyeOff className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{items.length} TOTAL ITEMS</span>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 scrollbar-thin">
        <div className="max-w-5xl mx-auto space-y-8">
          {(['pre_contact', 'contact', 'post_contact'] as ChronologyPhase[]).map((phase) => {
            const config = PHASE_CONFIG[phase];
            const phaseItems = groupedItems[phase];

            return (
              <div key={phase} className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className={cn("px-2.5 py-1 rounded text-[9px] font-black text-white uppercase tracking-widest", config.color)}>
                    {config.label}
                  </span>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>

                <div className="bg-white border-l border-t border-slate-200 overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/80">
                        <th className="px-5 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest w-32 border-r border-b border-slate-200 bg-slate-50/30">Time</th>
                        <th className="px-5 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest border-r border-b border-slate-200 bg-slate-50/30">Description</th>
                        {showLocalAccuracy && (
                          <th className="px-5 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest w-32 border-r border-b border-slate-200 bg-slate-50/30 text-center">Akurasi AI</th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="">
                      {phaseItems.length > 0 ? phaseItems.map((item) => {
                        const isSelected = selectedItemId === item.id;
                        const { accuracy: rowAcc } = calculateItemAccuracy(item);

                        return (
                          <tr 
                            key={item.id} 
                            onClick={() => onSelectItem(item.id)}
                            className={cn(
                              "group transition-all cursor-pointer relative", 
                              isSelected ? "bg-slate-100/80 " : "hover:bg-slate-50/50"
                            )}
                          >
                            <td className="px-5 py-4 align-top border-r border-b border-slate-200">
                              <div className="flex flex-col gap-1">
                                <span className={cn("text-[11px] font-mono font-black", config.textColor)}>{item.time_label}</span>
                              </div>
                            </td>
                            <td className="px-5 py-4 align-top border-r border-b border-slate-200">
                              <div className="relative">
                                <p className={cn("text-xs font-medium leading-relaxed pr-8 transition-colors", 
                                  isSelected ? "text-slate-900" : "text-slate-700"
                                )}>
                                  {item.chronology_text}
                                </p>

                              </div>
                            </td>
                            {showLocalAccuracy && (
                              <td className="px-5 py-4 align-middle text-center border-r border-b border-slate-200 w-32">
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
                          <td colSpan={showLocalAccuracy ? 3 : 2} className="px-5 py-8 text-center text-slate-300 text-[10px] font-black uppercase tracking-widest border-r border-b border-slate-200">
                            No data available
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

