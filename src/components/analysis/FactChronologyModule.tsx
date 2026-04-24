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
  Target,
  BarChart3
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
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

export interface ChronologyItem {
  id: string;
  time_label: string;
  chronology_text: string;
  phase: ChronologyPhase;
  source: "ai" | "human";
  annotated_by_human: boolean;
  verification_status: VerificationStatus;
  created_at: string;
  updated_at: string;
  updated_by?: string;
  original_text?: string;
  traceability?: Traceability[];
  synthesis_summary?: string;
  support_strength?: number;
}

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
  partially_supported: { label: "Partially Supported", color: "bg-violet-50 text-violet-600 border-violet-100", icon: Target },
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

      {/* RIGHT SIDE PANEL: Traceability Matrix */}
      {selectedItem && (
        <div className="w-[500px] border-l h-full shrink-0 z-40 bg-white animate-in slide-in-from-right duration-300">
          <TraceabilityPanel 
            item={selectedItem}
            onClose={() => setSelectedItemId(null)}
            onUpdateStatus={(newStatus) => {
              setItems(prev => prev.map(it => it.id === selectedItem.id ? { ...it, verification_status: newStatus, annotated_by_human: true } : it));
            }}
            onEdit={() => handleEdit(selectedItem)}
          />
        </div>
      )}
    </div>
  );
};

// ── Traceability Panel Component ──────────────────────────────────────────

export const TraceabilityPanel: React.FC<{ 
  item: ChronologyItem, 
  onClose: () => void,
  onUpdateStatus: (status: VerificationStatus) => void,
  onEdit: () => void
}> = ({ item, onClose, onUpdateStatus, onEdit }) => {
  const status = STATUS_CONFIG[item.verification_status];
  
  const groupedTraceability = useMemo(() => {
    return {
      audio: item.traceability?.filter(t => t.source_type === 'audio') || [],
      image: item.traceability?.filter(t => t.source_type === 'image') || [],
      document: item.traceability?.filter(t => t.source_type === 'document') || [],
      video: item.traceability?.filter(t => t.source_type === 'video') || [],
    };
  }, [item.traceability]);

  return (
    <div className="flex flex-col h-full bg-white shadow-[-8px_0_30px_-15px_rgba(0,0,0,0.1)]">
      {/* Panel Header */}
      <div className="p-6 border-b bg-white shrink-0">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-slate-900 flex items-center justify-center text-white">
              <Zap className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight leading-none">Traceability Matrix</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Audit & Validation Console</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 rounded-full hover:bg-slate-100">
            <X className="h-4 w-4 text-slate-400" />
          </Button>
        </div>

        <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-black text-slate-400 bg-white px-2 py-0.5 border rounded">[{item.time_label}]</span>
              <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border", status.color)}>
                <status.icon className="h-3 w-3" /> {status.label}
              </div>
            </div>
            <span className={cn("text-[9px] font-black px-2 py-0.5 rounded uppercase border", 
              item.phase === 'pre_contact' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
              item.phase === 'contact' ? "bg-rose-50 text-rose-600 border-rose-100" :
              "bg-amber-50 text-amber-600 border-amber-100"
            )}>
              {item.phase.replace("_", " ")}
            </span>
          </div>
          <p className="text-[13px] font-bold text-slate-800 leading-relaxed pr-2">
            {item.chronology_text}
          </p>
          <div className="flex gap-2 pt-2 border-t border-slate-200/50">
             <Button variant="ghost" size="sm" onClick={onEdit} className="h-8 px-3 text-[9px] font-black uppercase tracking-widest gap-2 hover:bg-white border">
                <Pencil className="h-3 w-3 text-slate-400" /> Edit Text
             </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto p-6 scrollbar-thin bg-slate-50/20">
        <div className="space-y-8">
          {/* AI Synthesis Summary */}
          {item.synthesis_summary && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Brain className="h-3.5 w-3.5 text-blue-500" />
                <h4 className="text-[10px] font-black text-slate-700 uppercase tracking-[0.15em]">AI Synthesis Strategy</h4>
              </div>
              <div className="bg-blue-50/40 border border-blue-100/50 rounded-sm p-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-5">
                   <Quote className="h-12 w-12 rotate-180" />
                </div>
                <p className="text-[11px] font-bold text-blue-800/80 leading-relaxed relative z-10">
                  {item.synthesis_summary}
                </p>
                <div className="mt-3 flex items-center gap-4">
                   <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                         <span className="text-[9px] font-black text-blue-400 uppercase tracking-tighter">Support Strength</span>
                         <span className="text-[9px] font-black text-blue-600 uppercase">{(item.support_strength || 0) * 100}%</span>
                      </div>
                      <div className="h-1 bg-blue-100 rounded-full overflow-hidden">
                         <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(item.support_strength || 0) * 100}%` }} />
                      </div>
                   </div>
                </div>
              </div>
            </div>
          )}

          {/* Evidence Traceability */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="h-3.5 w-3.5 text-slate-400" />
                <h4 className="text-[10px] font-black text-slate-700 uppercase tracking-[0.15em]">Supporting Lineage</h4>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.traceability?.length || 0} Sources</span>
            </div>

            {(!item.traceability || item.traceability.length === 0) ? (
              <div className="bg-white border border-dashed border-slate-200 rounded-sm p-10 text-center">
                 <Search className="h-8 w-8 text-slate-200 mx-auto mb-4" />
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No traceability data available for this node</p>
              </div>
            ) : (
              <div className="space-y-6">
                {(Object.entries(groupedTraceability) as [string, Traceability[]][]).map(([type, traces]) => {
                  if (traces.length === 0) return null;
                  const Icon = type === 'audio' ? Mic : type === 'image' ? Camera : type === 'document' ? FileText : Video;
                  return (
                    <div key={type} className="space-y-3">
                      <div className="flex items-center gap-2 px-1">
                         <Icon className="h-3 w-3 text-slate-400" />
                         <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{type} Evidence</span>
                      </div>
                      {traces.map((t, idx) => (
                        <div key={t.trace_id} className="bg-white border border-slate-200 rounded-sm overflow-hidden transition-all group">
                          <div className="p-3 bg-slate-50/50 border-b flex items-center justify-between">
                             <div className="flex items-center gap-2">
                                <div className="h-6 w-6 rounded bg-white border flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                                   <Icon className="h-3 w-3" />
                                </div>
                                <div className="flex flex-col">
                                   <span className="text-[10px] font-black text-slate-700 truncate max-w-[180px]">{t.source_file_name}</span>
                                   <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                                      {t.page_number ? `Page ${t.page_number}` : t.timestamp_start ? `[${t.timestamp_start}]` : "Full Asset"}
                                   </span>
                                </div>
                             </div>
                             <div className="flex items-center gap-2">
                                <span className={cn("text-[8px] font-black px-1.5 py-0.5 rounded uppercase border whitespace-nowrap", 
                                  t.support_type === 'direct' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                  t.support_type === 'partial' ? "bg-amber-50 text-amber-600 border-amber-100" :
                                  "bg-slate-50 text-slate-500 border-slate-100"
                                )}>
                                   {t.support_type}
                                </span>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 rounded-full hover:bg-slate-200">
                                   <ExternalLink className="h-2.5 w-2.5 text-slate-400" />
                                </Button>
                             </div>
                          </div>
                          <div className="p-4 space-y-3">
                             <div className="space-y-1.5">
                                <div className="flex items-center gap-1.5 opacity-40">
                                   <Quote className="h-2.5 w-2.5 text-slate-400" />
                                   <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.1em]">Extracted Material</span>
                                </div>
                                <div className="bg-slate-50/80 rounded-lg p-3 border border-slate-100/50">
                                   <p className="text-[11px] font-bold text-slate-600 italic leading-relaxed">
                                      "{t.extracted_content}"
                                   </p>
                                </div>
                             </div>
                             {t.extracted_summary && (
                               <div className="pt-2 border-t border-slate-50 flex items-start gap-2">
                                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-1 shrink-0" />
                                  <p className="text-[10px] font-bold text-slate-400 leading-tight">
                                     {t.extracted_summary}
                                  </p>
                               </div>
                             )}
                          </div>
                          <div className="px-4 py-2.5 bg-slate-50/30 border-t flex items-center justify-between">
                             <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1">
                                   <BarChart3 className="h-2.5 w-2.5 text-slate-300" />
                                   <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Confidence: {t.confidence_score * 100}%</span>
                                </div>
                                <div className="flex items-center gap-1">
                                   <Cpu className="h-2.5 w-2.5 text-slate-300" />
                                   <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Node: {t.extraction_run_id.slice(-4)}</span>
                                </div>
                             </div>
                             <span className="text-[8px] font-bold text-slate-300 uppercase tabular-nums">ID: {t.trace_id.slice(0, 8)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reviewer Actions */}
      <div className="p-6 border-t bg-white shrink-0 space-y-4">
        <h5 className="text-[10px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-2 mb-2">
           <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Formal Verification Action
        </h5>
        <div className="grid grid-cols-2 gap-2">
           <Button 
             onClick={() => onUpdateStatus('human_verified')}
             className="bg-emerald-600 hover:bg-emerald-700 text-white h-10 text-[9px] font-black uppercase tracking-widest gap-2 rounded-sm"
           >
              <Check className="h-3.5 w-3.5" /> Approve Full 
           </Button>
           <Button 
             onClick={() => onUpdateStatus('partially_supported')}
             variant="outline"
             className="border-slate-200 text-slate-700 h-10 text-[9px] font-black uppercase tracking-widest gap-2 rounded-sm"
           >
              <Target className="h-3.5 w-3.5 text-blue-500" /> Part Support
           </Button>
           <Button 
             onClick={() => onUpdateStatus('needs_review')}
             variant="outline"
             className="border-slate-200 text-slate-700 h-10 text-[9px] font-black uppercase tracking-widest gap-2 rounded-sm"
           >
              <Clock className="h-3.5 w-3.5 text-amber-500" /> Mark Review
           </Button>
           <Button 
             onClick={() => onUpdateStatus('unsupported')}
             variant="outline"
             className="border-slate-200 text-slate-700 h-10 text-[9px] font-black uppercase tracking-widest gap-2 rounded-sm"
           >
              <XCircle className="h-3.5 w-3.5 text-rose-500" /> Unsupported
           </Button>
        </div>
        <div className="bg-slate-50 rounded-sm p-3 border border-slate-100">
           <p className="text-[9px] font-bold text-slate-400 leading-relaxed">
             Approving or marking this row will flag it as **Human Evaluated** in the final audit trail and PDF report.
           </p>
        </div>
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
  return (
    <div className="flex flex-col h-full bg-slate-50/10">
      <div className="flex items-center justify-between px-6 py-4 border-b bg-white shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-slate-900 rounded-lg flex items-center justify-center text-white">
            <History className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-tight">Case Chronology</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-0.5">#{metadata.caseCode} • Investigation Intelligence</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100">
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{items.filter(i => i.annotated_by_human).length} Annotated</span>
           </div>
           <div className="h-4 w-px bg-slate-200" />
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{items.length} Total items</span>
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
                      </tr>
                    </thead>
                    <tbody className="">
                      {phaseItems.length > 0 ? phaseItems.map((item) => {
                        const isSelected = selectedItemId === item.id;

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
                          </tr>
                        );
                      }) : (
                        <tr>
                          <td colSpan={2} className="px-5 py-8 text-center text-slate-300 text-[10px] font-black uppercase tracking-widest border-r border-b border-slate-200">
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
