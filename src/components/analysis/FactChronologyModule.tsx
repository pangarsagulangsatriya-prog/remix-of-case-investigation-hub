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
  ZoomOut
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export type ChronologyPhase = "pre_contact" | "contact" | "post_contact";

export interface ChronologyItem {
  id: string;
  time_label: string;
  chronology_text: string;
  phase: ChronologyPhase;
  source: "ai" | "human";
  annotated_by_human: boolean;
  created_at: string;
  updated_at: string;
  updated_by?: string;
  original_text?: string;
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

export const FactChronologyModule: React.FC<FactChronologyModuleProps> = ({ 
  initialItems, 
  metadata,
  onSync,
  viewMode: controlledViewMode,
  onViewModeChange
}) => {
  const [items, setItems] = useState<ChronologyItem[]>(initialItems);
  const [internalViewMode, setInternalViewMode] = useState<'slide' | 'default'>('default');
  
  const viewMode = controlledViewMode || internalViewMode;
  const setViewMode = onViewModeChange || setInternalViewMode;

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
          item.time_label !== editBuffer.time_label;
        
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
      "flex flex-col h-full bg-white relative",
      viewMode === 'default' ? "overflow-hidden" : ""
    )}>
      {/* Header / Mode Switcher */}
      <div className={cn(
        "z-50 flex items-center gap-1 p-1 rounded-lg border shadow-sm bg-white",
        viewMode === 'slide' ? "absolute top-4 right-4" : "sticky top-0 m-4 mb-0 self-end"
      )}>
        <Button 
          variant={viewMode === 'default' ? 'default' : 'ghost'} 
          size="sm" 
          onClick={() => setViewMode('default')}
          className={cn("h-8 text-[10px] font-black uppercase tracking-widest px-3", viewMode === 'default' ? "bg-slate-900" : "text-slate-500 hover:text-slate-900")}
        >
          <TableIcon className="h-3.5 w-3.5 mr-2" /> Default View
        </Button>
        <Button 
          variant={viewMode === 'slide' ? 'default' : 'ghost'} 
          size="sm" 
          onClick={() => setViewMode('slide')}
          className={cn("h-8 text-[10px] font-black uppercase tracking-widest px-3", viewMode === 'slide' ? "bg-slate-900" : "text-slate-500 hover:text-slate-900")}
        >
          <Presentation className="h-3.5 w-3.5 mr-2" /> Slide View
        </Button>
      </div>

      <div className="flex-1 overflow-hidden">
        {viewMode === 'slide' ? (
          <FactSlideView metadata={metadata} groupedItems={groupedItems} />
        ) : (
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
          />
        )}
      </div>

      {/* Persistence Controls */}
      {viewMode === 'default' && (
        <div className="p-4 border-t bg-slate-50/50 flex justify-end shrink-0">
          {onSync && (
            <Button 
              onClick={() => onSync(items)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-[0.2em] px-6 h-10 rounded-lg shadow-lg shadow-emerald-500/10"
            >
              Sync to Case Intelligence
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

// ── Slide View Component ───────────────────────────────────────────────────

const FactSlideView: React.FC<{ metadata: FactMetadata, groupedItems: Record<ChronologyPhase, ChronologyItem[]> }> = ({ 
  metadata, 
  groupedItems 
}) => {
  return (
    <div className="flex-1 flex flex-col p-[60px] text-slate-900 animate-in fade-in duration-500">
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
                  <div key={item.id} className="relative group">
                    <div className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={cn("h-2.5 w-2.5 rounded-full mt-1.5 shadow-sm", config.dotColor)} />
                        <div className="w-px flex-1 bg-slate-100 my-1 group-last:hidden" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-mono font-black text-slate-400">[{item.time_label}]</span>
                          {item.annotated_by_human && (
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" title="Human Annotated" />
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
  metadata: FactMetadata
}> = ({ 
  items, 
  groupedItems, 
  editingId, 
  editBuffer, 
  setEditBuffer, 
  onEdit, 
  onSave, 
  onCancel,
  metadata
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

                <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50/50 border-b">
                        <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest w-32">Time</th>
                        <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</th>
                        <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest w-40 text-right">Verification</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {phaseItems.length > 0 ? phaseItems.map((item) => {
                        const isEditing = editingId === item.id;
                        return (
                          <tr key={item.id} className={cn("group transition-colors", isEditing ? "bg-primary/5" : "hover:bg-slate-50/50")}>
                            <td className="px-5 py-4 align-top">
                              {isEditing ? (
                                <Input 
                                  value={editBuffer.time_label}
                                  onChange={(e) => setEditBuffer({ ...editBuffer, time_label: e.target.value })}
                                  className="h-8 font-mono text-[11px] font-bold border-slate-300"
                                />
                              ) : (
                                <span className={cn("text-[11px] font-mono font-black", config.textColor)}>{item.time_label}</span>
                              )}
                            </td>
                            <td className="px-5 py-4 align-top">
                              {isEditing ? (
                                <div className="space-y-2">
                                  <Textarea 
                                    value={editBuffer.chronology_text}
                                    onChange={(e) => setEditBuffer({ ...editBuffer, chronology_text: e.target.value })}
                                    className="min-h-[80px] text-xs font-medium leading-relaxed resize-none border-slate-300"
                                  />
                                  <div className="flex items-center gap-2">
                                    <Button size="sm" onClick={onSave} className="h-7 px-3 bg-slate-900 text-[9px] uppercase font-black tracking-widest">
                                      <Check className="h-3 w-3 mr-1.5" /> Save
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={onCancel} className="h-7 px-3 text-[9px] uppercase font-black tracking-widest">
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="relative group/edit">
                                  <p className="text-xs font-medium text-slate-700 leading-relaxed pr-8">
                                    {item.chronology_text}
                                  </p>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => onEdit(item)}
                                    className="absolute top-0 -right-2 h-7 w-7 p-0 opacity-0 group-hover/edit:opacity-100 transition-opacity"
                                  >
                                    <Pencil className="h-3 w-3 text-slate-400" />
                                  </Button>
                                </div>
                              )}
                            </td>
                            <td className="px-5 py-4 align-top text-right">
                              <div className="flex flex-col items-end">
                                {item.annotated_by_human ? (
                                  <div className="flex flex-col items-end">
                                    <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1.5">
                                      <User className="h-3 w-3" /> Human Verified
                                    </span>
                                    <span className="text-[8px] font-bold text-slate-300 uppercase mt-1">{item.updated_by}</span>
                                  </div>
                                ) : (
                                  <div className="flex flex-col items-end border border-blue-100 bg-blue-50/30 px-2 py-1 rounded">
                                    <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-1.5">
                                      <Brain className="h-3 w-3" /> AI Core
                                    </span>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      }) : (
                        <tr>
                          <td colSpan={3} className="px-5 py-8 text-center text-slate-300 text-[10px] font-black uppercase tracking-widest">
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
