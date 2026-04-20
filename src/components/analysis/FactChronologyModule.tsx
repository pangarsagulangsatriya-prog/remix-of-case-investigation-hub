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
  onSync 
}) => {
  const [items, setItems] = useState<ChronologyItem[]>(initialItems);
  const [viewMode, setViewMode] = useState<'slide' | 'default'>('slide');
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
          updated_by: "Current User", // In a real app, this would be the actual user name
          original_text: item.original_text || item.chronology_text
        } as ChronologyItem;
      }
      return item;
    }));

    setEditingId(null);
    setEditBuffer({});
    toast.success("Entry updated and marked as human-annotated.");
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
    <div className="flex flex-col h-full bg-white relative">
      {/* Header / Mode Switcher */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-1 bg-slate-100 p-1 rounded-lg border shadow-sm">
        <Button 
          variant={viewMode === 'slide' ? 'default' : 'ghost'} 
          size="sm" 
          onClick={() => setViewMode('slide')}
          className={cn("h-8 text-[10px] font-black uppercase tracking-widest px-3", viewMode === 'slide' ? "bg-slate-900" : "text-slate-500 hover:text-slate-900")}
        >
          <Presentation className="h-3.5 w-3.5 mr-2" /> Slide View
        </Button>
        <Button 
          variant={viewMode === 'default' ? 'default' : 'ghost'} 
          size="sm" 
          onClick={() => setViewMode('default')}
          className={cn("h-8 text-[10px] font-black uppercase tracking-widest px-3", viewMode === 'default' ? "bg-slate-900" : "text-slate-500 hover:text-slate-900")}
        >
          <TableIcon className="h-3.5 w-3.5 mr-2" /> Default View
        </Button>
      </div>

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
        />
      )}

      {/* Persistence Controls */}
      <div className="absolute bottom-6 right-6 z-50">
        {onSync && (
          <Button 
            onClick={() => onSync(items)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black uppercase tracking-[0.2em] px-8 py-6 rounded-xl shadow-xl shadow-emerald-500/20"
          >
            Sync Chronology to Case
          </Button>
        )}
      </div>
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
  onCancel: () => void
}> = ({ 
  items, 
  groupedItems, 
  editingId, 
  editBuffer, 
  setEditBuffer, 
  onEdit, 
  onSave, 
  onCancel 
}) => {
  return (
    <div className="flex-1 flex flex-col p-10 bg-slate-50/30 overflow-auto animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="max-w-6xl mx-auto w-full space-y-10 pb-32">
        {/* Module Header */}
        <div className="flex items-center justify-between border-b-2 border-slate-200 pb-6">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-2xl">
              <TableIcon className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Operational Chronology</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Edit and validate sequence of events</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 border-r pr-6">
              <div className="text-right">
                <span className="text-[10px] font-black text-slate-400 uppercase block">Total Items</span>
                <span className="text-lg font-black text-slate-900">{items.length}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-black text-slate-400 uppercase block">Annotated</span>
                <span className="text-lg font-black text-emerald-600">{items.filter(i => i.annotated_by_human).length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Phase Groups */}
        {(['pre_contact', 'contact', 'post_contact'] as ChronologyPhase[]).map((phase) => {
          const config = PHASE_CONFIG[phase];
          const phaseItems = groupedItems[phase];

          return (
            <div key={phase} className="space-y-4">
              <div className="flex items-center gap-3 px-1">
                <div className={cn("h-5 p-1 px-3 rounded-full flex items-center justify-center", config.color)}>
                  <span className="text-[9px] font-black text-white uppercase tracking-widest">{config.label}</span>
                </div>
                <div className="h-px flex-1 bg-slate-200" />
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-40">Time</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Chronology Event</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-48 text-right">Source & Auth</th>
                    </tr>
                  </thead>
                  <tbody className={cn("divide-y divide-slate-50", config.borderColor)}>
                    {phaseItems.length > 0 ? phaseItems.map((item) => {
                      const isEditing = editingId === item.id;
                      return (
                        <tr key={item.id} className={cn("group transition-all", isEditing ? "bg-primary/5 shadow-inner" : "hover:bg-slate-50/50")}>
                          <td className="px-6 py-5 align-top">
                            {isEditing ? (
                              <Input 
                                value={editBuffer.time_label}
                                onChange={(e) => setEditBuffer({ ...editBuffer, time_label: e.target.value })}
                                className="h-9 font-mono font-bold text-xs"
                              />
                            ) : (
                              <div className="flex items-center gap-2">
                                <Clock className={cn("h-3.5 w-3.5", config.textColor)} />
                                <span className={cn("text-xs font-mono font-black", config.textColor)}>{item.time_label}</span>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-5 align-top">
                            {isEditing ? (
                              <div className="space-y-3">
                                <Textarea 
                                  value={editBuffer.chronology_text}
                                  onChange={(e) => setEditBuffer({ ...editBuffer, chronology_text: e.target.value })}
                                  className="min-h-[100px] text-sm font-medium leading-relaxed resize-none focus:ring-slate-900 border-slate-300"
                                  placeholder="Describe the event chronology..."
                                />
                                <div className="flex items-center gap-2">
                                  <Button size="sm" onClick={onSave} className="bg-slate-900 h-8 px-4 text-[10px] uppercase font-black tracking-widest">
                                    <Check className="h-3 w-3 mr-2" /> Commit Change
                                  </Button>
                                  <Button size="sm" variant="ghost" onClick={onCancel} className="h-8 px-4 text-[10px] uppercase font-black tracking-widest text-slate-400">
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="group/text relative">
                                <p className="text-sm font-medium text-slate-700 leading-relaxed pr-10">
                                  {item.chronology_text}
                                </p>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => onEdit(item)}
                                  className="absolute top-0 right-1 h-8 w-8 p-0 opacity-0 group-hover/text:opacity-100 transition-opacity bg-white/80 backdrop-blur border shadow-sm"
                                >
                                  <Pencil className="h-3.5 w-3.5 text-slate-400" />
                                </Button>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-5 align-top text-right">
                            <div className="flex flex-col items-end gap-2">
                              {item.annotated_by_human ? (
                                <div className="flex flex-col items-end">
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-[9px] font-black uppercase tracking-widest whitespace-nowrap">
                                    <User className="h-3 w-3 mr-1.5" /> Annotated
                                  </span>
                                  <span className="text-[8px] font-bold text-slate-400 mt-1 uppercase">Source: Human Correction</span>
                                  {item.updated_at && (
                                    <span className="text-[8px] font-black text-slate-300 uppercase tracking-tighter mt-1">
                                      {new Date(item.updated_at).toLocaleDateString()} · {item.updated_by}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <div className="flex flex-col items-end">
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100 text-[9px] font-black uppercase tracking-widest whitespace-nowrap">
                                    <Brain className="h-3 w-3 mr-1.5" /> AI Generated
                                  </span>
                                  <span className="text-[8px] font-bold text-slate-400 mt-1 uppercase">Confidence: 94%</span>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    }) : (
                      <tr>
                        <td colSpan={3} className="px-6 py-12 text-center text-slate-300 font-black uppercase tracking-widest opacity-40">
                          No events recorded for this phase
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
  );
};
