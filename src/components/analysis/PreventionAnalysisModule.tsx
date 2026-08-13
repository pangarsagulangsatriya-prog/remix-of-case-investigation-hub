import React, { useState } from 'react';
import { 
  Crosshair, 
  History,
  Pencil,
  Trash2,
  Check,
  X,
  User,
  PanelRightOpen,
  FileText,
  Eye,
  Brain,
  ChevronRight,
  CheckCircle2,
  Table as TableIcon
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Module-level default: cleanMode is false unless overridden by component props
let cleanMode = false;

export interface AuditEntry {
  id: string;
  itemId: string;
  category: string;
  action: "CREATE" | "UPDATE" | "DELETE";
  actorName: string;
  actorRole: string;
  actorType: "HUMAN" | "AI" | "SYSTEM";
  timestamp: string;
  versionTo: number;
  deletionReason?: string;
  before?: any;
  after?: any;
}

export interface PreventionItem {
  id: string;
  no: string;
  layer: string;
  hierarchy: string;
  action: string;
  type: string; // 'rc', 'nc', 'imp'
  version?: number;
  created_at?: string;
  provenanceType?: string;
  annotated_by_human?: boolean;
}

export interface PreventionData {
  actions: PreventionItem[];
}

interface PreventionAnalysisModuleProps {
  data: PreventionData;
  readonly?: boolean;
  cleanMode?: boolean;
  onSelectRow: (id: string | null) => void;
  selectedRowId: string | null;
  onSync: (updatedData: PreventionData) => void;
}

const extractStringValue = (val: any): string => {
  if (typeof val === 'string') return val;
  if (typeof val === 'object' && val !== null) {
    if (val.value) return String(val.value);
    if (val.text) return String(val.text);
  }
  return String(val || '');
};


export const PreventionTraceabilityPanel: React.FC<{ 
  item: any, 
  onClose: () => void,
  onEdit: () => void,
  readonly?: boolean
}> = ({ item, onClose, readonly, onEdit }) => {

  const [showHistory, setShowHistory] = React.useState(false);

  const currentVersion = item?.currentVersion || item?.version || 1;
  const history = item?.history || [];

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
             <div className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">VERSI {currentVersion} &middot; {item?.provenanceType === 'HUMAN_MANUAL' ? ((item?.manualRevisionCount || 0) > 0 ? 'DIUBAH' : 'DITAMBAHKAN MANUAL') : 'DIUBAH'}</div>
             <div className="bg-white border border-slate-200 rounded p-4 shadow-sm mb-2">
                <div className="text-[10px] text-slate-400 mb-1">
                  {item?.provenanceType === 'HUMAN_MANUAL' && (item?.manualRevisionCount || 0) === 0 ? 'Ditambahkan oleh' : 'Diubah oleh'}
                </div>
                <div className="text-[11px] font-bold text-slate-800 mb-3">{item?.latestHumanChange?.userName || "Gulang Satriya"} &middot; {item?.latestHumanChange?.userRole || "Lead Investigator"}</div>
                
                <div className="text-[11px] text-slate-900 font-bold mb-1">Layer: {item?.layer} &middot; Hierarchy: {item?.hierarchy}</div>
                <div className="text-[11px] text-slate-800 leading-relaxed italic border-l-2 border-slate-300 pl-3 py-1 mb-3">
                  "{item?.action || 'Belum ada deskripsi.'}"
                </div>

                <div className="text-[10px] text-slate-400 mb-3">
                  {item?.latestHumanChange?.timestamp ? new Date(item.latestHumanChange.timestamp).toLocaleString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) + ' WIB' : '05 Agustus 2026, 14:18 WIB'}
                </div>

                {((item?.provenanceType === 'HUMAN_MANUAL' && (item?.manualRevisionCount || 0) > 0) || item?.provenanceType === 'AI_HUMAN_ANNOTATED') && (
                  <details className="group">
                    <summary className="text-[10px] font-bold text-blue-600 cursor-pointer hover:text-blue-700 list-none flex items-center gap-1">
                      <span className="group-open:hidden">[Lihat Detail Perubahan]</span>
                      <span className="hidden group-open:inline">[Tutup Detail Perubahan]</span>
                    </summary>
                    <div className="mt-3 space-y-3 pt-3 border-t border-slate-100">
                      {item?.latestHumanChange?.changeNote && (
                        <div>
                          <div className="text-[9px] font-bold text-slate-400 mb-1">{item?.provenanceType === 'HUMAN_MANUAL' ? 'Catatan' : 'Catatan anotasi'}</div>
                          <div className="text-[11px] text-slate-700 bg-slate-50 p-2 rounded border border-slate-100">{item.latestHumanChange.changeNote}</div>
                        </div>
                      )}
                      <div>
                        <div className="text-[9px] font-bold text-slate-400 mb-1">SEBELUM</div>
                        <div className="bg-red-50 text-red-900 p-2 rounded text-[11px] border border-red-100">{history[0]?.action || "Data sebelumnya."}</div>
                      </div>
                      <div>
                        <div className="text-[9px] font-bold text-slate-400 mb-1">SESUDAH</div>
                        <div className="bg-emerald-50 text-emerald-900 p-2 rounded text-[11px] border border-emerald-100">{item?.action}</div>
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
                      <div className="text-[11px] font-bold text-slate-800 mb-2">Prevention Agent</div>
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
                    <div className="text-[11px] font-bold text-slate-800 mb-3">{histItem.userName || "Gulang Satriya"} &middot; {histItem.userRole || "Lead Investigator"}</div>
                    
                    <div className="text-[11px] text-slate-900 font-bold mb-1">Layer: {histItem.layer || item?.layer} &middot; Hierarchy: {histItem.hierarchy || item?.hierarchy}</div>
                    <div className="text-[11px] text-slate-800 leading-relaxed italic border-l-2 border-slate-300 pl-3 py-1 mb-3">
                      "{histItem.action || item?.action}"
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
                            <div className="bg-red-50 text-red-900 p-2 rounded text-[11px] border border-red-100">{history[idx + 1]?.action || "Data sebelumnya."}</div>
                          </div>
                          <div>
                            <div className="text-[9px] font-bold text-slate-400 mb-1">SESUDAH</div>
                            <div className="bg-emerald-50 text-emerald-900 p-2 rounded text-[11px] border border-emerald-100">{histItem.action || item?.action}</div>
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
          <div className="h-8 w-8 bg-[#8ba861] flex items-center justify-center text-white rounded-none">
            <TableIcon className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-[13px] font-bold text-slate-900 uppercase tracking-wider leading-none">Detail Analisis</h3>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Tindakan Pencegahan (Prevention) &middot; Layer {item?.layer} &middot; NO {item?.no}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="h-7 w-7 p-0 hover:bg-slate-100 rounded-none">
          <X className="h-4 w-4 text-slate-500" />
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-6">
        
        {/* Origin Label */}
        {item?.provenanceType === 'HUMAN_MANUAL' ? (
          <div>
            <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest border border-emerald-200 mb-4">
               <CheckCircle2 className="h-3 w-3" />
               Ditambahkan Manual
            </div>
            
            <div className="text-[10px] text-slate-400 mb-1">Ditambahkan oleh</div>
            <div className="text-[11px] font-bold text-slate-800 mb-1">{item?.latestHumanChange?.userName || "Gulang Satriya"} &middot; Lead Investigator</div>
            <div className="text-[10px] text-slate-500 mb-1">05 Agustus 2026, 13:42 WIB</div>
            
            {(item?.manualRevisionCount || 0) > 0 && (
               <>
                 <div className="text-[10px] text-slate-400 mb-1 mt-3">Terakhir diubah oleh</div>
                 <div className="text-[11px] font-bold text-slate-800 mb-1">{item?.latestHumanChange?.userName || "Gulang Satriya"} &middot; Lead Investigator</div>
                 <div className="text-[10px] text-slate-500 mb-1">05 Agustus 2026, 14:18 WIB</div>
                 <div className="text-[10px] text-slate-500 mt-2">{(item?.manualRevisionCount || 0)} kali perubahan</div>
               </>
            )}
            <div className="text-[10px] font-mono text-slate-400 mt-2">Versi aktif {currentVersion}</div>
          </div>
        ) : item?.provenanceType === 'AI_HUMAN_ANNOTATED' ? (
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
            <div className="text-[10px] text-slate-500 mb-3">{item?.humanAnnotationCount || 1} kali anotasi</div>
            
            <div className="text-[10px] font-mono text-slate-400 mt-2">Versi aktif {currentVersion}</div>
          </div>
        ) : (
          <div>
            <div className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest border border-indigo-200 mb-4">
               <Brain className="h-3 w-3" />
               AI Generated
            </div>
            <div className="text-[10px] text-slate-400 mb-1">Generated by</div>
            <div className="text-[11px] font-bold text-slate-800 mb-1">Prevention Agent</div>
            <div className="text-[10px] text-slate-500 mb-1">05 Agustus 2026, 13:20 WIB</div>
            <div className="text-[10px] font-mono text-slate-400 mt-2">Versi aktif 1</div>
          </div>
        )}

        <hr className="border-slate-100" />
        

        {/* 1. Anotasi / Latest Changes (Only if edited or manual) */}
        {((item?.provenanceType === 'HUMAN_MANUAL' && (item?.manualRevisionCount || 0) > 0) || item?.provenanceType === 'AI_HUMAN_ANNOTATED') && (
           <div className="mb-6">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">HASIL ANOTASI TERAKHIR</div>
              
              <div className="bg-blue-50/30 p-4 rounded border border-blue-100 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                   <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center border border-blue-200 shrink-0">
                     <User className="h-4 w-4 text-blue-600" />
                   </div>
                   <div>
                     <div className="text-[11px] font-bold text-slate-800">{item?.latestHumanChange?.userName || "Gulang Satriya"}</div>
                     <div className="text-[10px] text-slate-500">{item?.latestHumanChange?.timestamp ? new Date(item.latestHumanChange.timestamp).toLocaleString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) + ' WIB' : '05 Agustus 2026, 14:18 WIB'}</div>
                   </div>
                </div>
                
                <div className="text-[12px] text-slate-800 leading-relaxed italic border-l-[3px] border-blue-400 pl-3 py-1 mb-4 bg-white/50">
                  "{item?.action}"
                </div>
                
                {item?.latestHumanChange?.changeNote && (
                  <div className="bg-white p-3 rounded border border-slate-100 text-[11px] shadow-sm">
                    <div className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-widest">
                      {item?.provenanceType === 'HUMAN_MANUAL' ? 'Catatan Perubahan' : 'Catatan Anotasi'}
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
               'TINDAKAN AWAL'
             </div>
             {item?.provenanceType !== 'HUMAN_MANUAL' && (
               <div className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase border border-indigo-200 shadow-sm">
                 <><Brain className="h-2.5 w-2.5" /> AI</>
               </div>
             )}
           </div>
           
           <div className="text-[12.5px] text-slate-800 leading-relaxed bg-slate-50/80 p-4 rounded border border-slate-200">
             <div className="font-bold mb-2 text-slate-900">[{item?.hierarchy}]</div>
             <div>{item?.provenanceType === 'AI_HUMAN_ANNOTATED' ? (item?.original_text || item?.action) : item?.action}</div>
           </div>
        </div>

        {/* Action Button */}
        <div className="pt-4 flex flex-col gap-2">

          <Button 
            variant="outline" 
            className="w-full bg-white text-[11px] font-bold text-slate-700 border-slate-300 hover:bg-slate-50 h-9"
            onClick={() => setShowHistory(true)}
          >
            Lihat Riwayat Perubahan
          </Button>
        </div>
      </div>
    </div>
  );
};

export const PreventionAnalysisModule: React.FC<PreventionAnalysisModuleProps> = ({
  data,
  readonly = false,
  cleanMode = false,
  onSelectRow,
  selectedRowId,
  onSync
}) => {

  const [internalData, setInternalData] = useState<PreventionData>({ actions: data.actions || [] });
  const initialDummyAuditLogs: AuditEntry[] = [
    {
      id: "log-p1",
      itemId: "2",
      category: "prevention",
      action: "UPDATE",
      actorName: "Rina Mahardika",
      actorRole: "Investigator",
      actorType: "HUMAN",
      timestamp: "2026-08-05T09:04:00Z",
      versionTo: 2,
      before: { no: 2, layer: "IV.4", hierarchy: "Adm", action: "Perbaikan awal", pic: "Bimo", due_date: "19 - 10 - 2025", status: "Open", type: "nc" },
      after: { no: 2, layer: "IV.4", hierarchy: "Adm", action: "Mengidentifikasi seluruh DMS, melakukan pengujian fungsi MDVR, memperbaiki DMS yang bermasalah, dan menyerahkan hasil perbaikan kepada tim operasional", pic: "Bimo", due_date: "19 - 10 - 2025", status: "Open", type: "nc" }
    },
    {
      id: "log-p2",
      itemId: "5",
      category: "prevention",
      action: "CREATE",
      actorName: "System",
      actorRole: "AI Agent",
      actorType: "AI",
      timestamp: "2026-08-05T08:00:00Z",
      versionTo: 1,
      after: { no: 5, layer: "III.3", hierarchy: "Adm", action: "Pemberian sanksi administrasi kepada Sdr. Rico", pic: "Muh Faishal", due_date: "18 - 10 - 2025", status: "Closed", type: "rc" }
    }
  ];

  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>(initialDummyAuditLogs);
  const [isAuditDrawerOpen, setIsAuditDrawerOpen] = useState(false);
  
  // CRUD State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addDraft, setAddDraft] = useState<Partial<PreventionItem>>({
    layer: "I.2",
    hierarchy: "Eliminasi",
    action: "",
    type: "rc"
  });
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Partial<PreventionItem>>({});
  
  const [itemToDelete, setItemToDelete] = useState<{id: string, text: string} | null>(null);
  const [deleteReason, setDeleteReason] = useState("");
  
  const [detailItem, setDetailItem] = useState<PreventionItem | null>(null);

  React.useEffect(() => {
    setInternalData({ actions: data.actions || [] });
  }, [data]);

  const handleAdd = () => {
    if (!addDraft.action?.trim()) return;
    
    const newId = "prev-" + Date.now();
    const ts = new Date().toISOString();
    
    const nextNo = internalData.actions.length > 0 
      ? Math.max(...internalData.actions.map(a => parseInt(extractStringValue(a.no)) || 0)) + 1 
      : 1;
    
    const newItem: PreventionItem = {
      id: newId,
      no: String(nextNo),
      layer: addDraft.layer || "I.2",
      hierarchy: addDraft.hierarchy || "Eliminasi",
      action: addDraft.action,
      type: addDraft.type || "rc",
      version: 1,
      created_at: ts
    };
    
    const updatedData = {
      actions: [...internalData.actions, newItem]
    };
    
    const audit: AuditEntry = {
      id: "log-" + Date.now(),
      itemId: newId,
      category: "prevention",
      action: "CREATE",
      actorName: "Gulang Satriya",
      actorRole: "Lead Investigator",
      actorType: "HUMAN",
      timestamp: ts,
      versionTo: 1,
      after: newItem
    };
    
    setAuditLogs([audit, ...auditLogs]);
    setInternalData(updatedData);
    onSync(updatedData);
    setIsAddModalOpen(false);
    setAddDraft({ layer: "I.2", hierarchy: "Eliminasi", action: "", type: "rc" });
    toast.success("Tindakan perbaikan berhasil ditambahkan.");
  };

  const renderProvenanceBadge = (item:  PreventionItem | any, isCleanMode?: boolean) => {
  if (isCleanMode) return null;
    const pType = item.provenanceType || (item.source === 'human' ? 'HUMAN_MANUAL' : (item.annotated_by_human ? 'AI_HUMAN_ANNOTATED' : 'AI_GENERATED'));
    
    if (pType === 'AI_GENERATED') {
      return (
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              {isCleanMode ? null : (<span className="inline-flex items-center justify-center h-[18px] px-1.5 rounded bg-slate-100 text-slate-500 border border-slate-200 cursor-help transition-colors hover:bg-slate-200">
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
              {isCleanMode ? null : (<span className="inline-flex items-center justify-center h-[18px] w-[18px] rounded bg-slate-100 text-slate-500 border border-slate-200 cursor-help transition-colors hover:bg-slate-200">
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
              {isCleanMode ? null : (<span className="inline-flex items-center justify-center h-[18px] w-[18px] rounded bg-slate-100 text-slate-500 border border-slate-200 cursor-help transition-colors hover:bg-slate-200">
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

  const handleSaveEdit = () => {
    if (!editingId) return;
    const ts = new Date().toISOString();
    
    const itemIndex = internalData.actions.findIndex(i => (i.id || (i as any)) === editingId);
    if (itemIndex === -1) return;
    
    const oldItem = internalData.actions[itemIndex];
    
    if (
      oldItem.action === editDraft.action &&
      oldItem.layer === editDraft.layer &&
      oldItem.hierarchy === editDraft.hierarchy &&
      oldItem.type === editDraft.type
    ) {
      setEditingId(null);
      return;
    }
    
    const newItem = {
      ...oldItem,
      id: oldItem.id || editingId,
      layer: editDraft.layer || oldItem.layer,
      hierarchy: editDraft.hierarchy || oldItem.hierarchy,
      action: editDraft.action || oldItem.action,
      type: editDraft.type || oldItem.type,
      version: (oldItem.version || 1) + 1,
      provenanceType: 'HUMAN_MANUAL',
      history: [
        {
          layer: oldItem.layer,
          hierarchy: oldItem.hierarchy,
          action: oldItem.action,
          type: oldItem.type,
          version: oldItem.version || 1,
          timestamp: ts,
          userName: "Gulang Satriya",
          userRole: "Lead Investigator",
          provenanceType: oldItem.provenanceType || 'AI_GENERATED'
        },
        ...(oldItem.history || [])
      ]
    };
    
    const updatedArray = [...internalData.actions];
    updatedArray[itemIndex] = newItem;
    
    const updatedData = {
      actions: updatedArray
    };
    
    const audit: AuditEntry = {
      id: "log-" + Date.now(),
      itemId: editingId,
      category: "prevention",
      action: "UPDATE",
      actorName: "Gulang Satriya",
      actorRole: "Lead Investigator",
      actorType: "HUMAN",
      timestamp: ts,
      versionTo: newItem.version,
      before: oldItem,
      after: newItem
    };
    
    setAuditLogs([audit, ...auditLogs]);
    setInternalData(updatedData);
    onSync(updatedData);
    
    if (detailItem && detailItem.id === editingId) {
       setDetailItem(newItem);
    }
    
    setEditingId(null);
    toast.success("Perubahan disimpan.");
  };

  const confirmDelete = () => {
    if (!itemToDelete) return;
    if (!deleteReason.trim()) {
      toast.error("Alasan wajib diisi");
      return;
    }
    
    const ts = new Date().toISOString();
    const itemIndex = internalData.actions.findIndex(i => (i.id || (i as any)) === itemToDelete.id);
    if (itemIndex === -1) return;
    
    const oldItem = internalData.actions[itemIndex];
    
    const updatedArray = internalData.actions.filter(i => (i.id || (i as any)) !== itemToDelete.id);
    const updatedData = {
      actions: updatedArray
    };
    
    const audit: AuditEntry = {
      id: "log-" + Date.now(),
      itemId: itemToDelete.id,
      category: "prevention",
      action: "DELETE",
      actorName: "Gulang Satriya",
      actorRole: "Lead Investigator",
      actorType: "HUMAN",
      timestamp: ts,
      versionTo: (oldItem.version || 1) + 1,
      deletionReason: deleteReason,
      before: oldItem
    };
    
    setAuditLogs([audit, ...auditLogs]);
    setInternalData(updatedData);
    onSync(updatedData);
    
    if (detailItem && detailItem.id === itemToDelete.id) {
       setDetailItem(null);
    }
    
    setItemToDelete(null);
    setDeleteReason("");
    toast.success("Tindakan dihapus.");
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/10 overflow-hidden relative">
      <div className="flex-1 flex min-w-0 h-full relative">
        <div className="flex-1 flex flex-col h-full overflow-hidden z-10 shadow-sm relative transition-all duration-300">
           <div className={cn("shrink-0 p-4 border-b border-slate-200 bg-white flex flex-col gap-4", readonly ? "hidden" : "")}>
              <div className="flex items-center justify-between">
                 <div>
                    <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                       <Crosshair className="h-4 w-4 text-slate-500" />
                       LEMBAR RENCANA TINDAKAN PENCEGAHAN
                    </h2>
                    <p className="text-[11px] text-slate-500 mt-1">Rumusan tindakan korektif dan preventif untuk mencegah insiden berulang.</p>
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
                   <div className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Rencana Difinalisasi</span>
                   </div>
                 </div>
              </div>
           </div>
           
           <div className={cn("flex-1 overflow-auto flex justify-center", cleanMode ? "bg-white p-0" : "bg-slate-50 p-8 scrollbar-thin")}>
              <div className={cn("w-full max-w-[1300px] h-fit shrink-0", cleanMode ? "bg-white border-0 shadow-none p-0" : "bg-white border border-slate-300 shadow-sm p-8 pb-16")}>
                 <h3 className="font-bold text-[14px] text-slate-900 mb-0.5">Tindakan Perbaikan dan Pencegahan Insiden</h3>
                 <div className="h-[2px] w-[50%] bg-[#8ba861] mb-4 mt-1"></div>
                 <div className="border border-slate-400">
                    <table className="w-full text-left border-collapse">
                       <thead>
                          <tr className="bg-slate-50/80">
                             <th className="px-4 py-2 text-[10px] font-bold text-slate-900 text-center border-r border-b border-slate-400 w-12 uppercase tracking-widest bg-white">NO</th>
                             <th className="px-4 py-2 text-[10px] font-bold text-slate-900 text-center border-r border-b border-slate-400 w-24 uppercase tracking-widest bg-white">LAYER</th>
                             <th className="px-4 py-2 text-[10px] font-bold text-slate-900 text-center border-r border-b border-slate-400 w-28 uppercase tracking-widest bg-white">HIRARKI<br/>KONTROL</th>
                             <th className="px-4 py-2 text-[10px] font-bold text-slate-900 text-left border-b border-slate-400 uppercase tracking-widest bg-white">TINDAKAN PERBAIKAN DAN PENCEGAHAN</th>
                          </tr>
                       </thead>
                       <tbody>
                          {(internalData.actions || []).map((item, idx) => {
                             const itemId = item.id || `prev-${idx}`;
                             let layerBg = "bg-white";
                             let layerText = "text-slate-900";
                             if (item.type === 'rc') {
                                layerBg = "bg-red-500";
                                layerText = "text-white font-black";
                             } else if (item.type === 'nc') {
                                layerBg = "bg-[#ffc000]";
                             } else if (item.type === 'imp') {
                                layerBg = "bg-[#00c950]";
                                layerText = "text-white font-black";
                             }

                             const isSelected = selectedRowId === itemId;
                             
                             return (
                                <tr 
                                   key={itemId} 
                                   onClick={() => {
                                      onSelectRow(itemId);
                                   }}
                                   onDoubleClick={(e) => {
                                      if (!readonly) {
                                         setEditingId(itemId);
                                         setEditDraft({ 
                                            layer: extractStringValue(item.layer), 
                                            hierarchy: extractStringValue(item.hierarchy), 
                                            action: extractStringValue(item.action), 
                                            type: item.type 
                                         });
                                      }
                                   }}
                                   className={cn(
                                      "group transition-all cursor-pointer",
                                      isSelected ? "bg-blue-50/55" : "bg-white hover:bg-slate-100/50"
                                   )}
                                >
                                   <td className="px-4 py-2 border-r border-b border-slate-400 text-center text-[10px] font-mono font-black text-slate-800 align-middle">
                                      {extractStringValue(item.no)}
                                   </td>
                                   <td className={`px-4 py-2 border-r border-b border-slate-400 text-center text-[10px] font-mono font-black ${layerBg} ${layerText} align-middle`}>
                                      {editingId === itemId ? (
                                        <input 
                                          type="text"
                                          value={editDraft.layer || ""}
                                          onChange={(e) => setEditDraft({ ...editDraft, layer: e.target.value })}
                                          onClick={(e) => e.stopPropagation()}
                                          className="w-full bg-white px-2 py-1 text-[11px] font-mono font-black border border-slate-300 rounded text-slate-900 focus:outline-none focus:border-blue-500"
                                        />
                                      ) : extractStringValue(item.layer)}
                                   </td>
                                   <td className={`px-4 py-2 border-r border-b border-slate-400 text-center text-[10px] font-mono font-black ${layerBg} ${layerText} align-middle`}>
                                      {editingId === itemId ? (
                                        <input 
                                          type="text"
                                          value={editDraft.hierarchy || ""}
                                          onChange={(e) => setEditDraft({ ...editDraft, hierarchy: e.target.value })}
                                          onClick={(e) => e.stopPropagation()}
                                          className="w-full bg-white px-2 py-1 text-[11px] font-mono font-black border border-slate-300 rounded text-slate-900 focus:outline-none focus:border-blue-500"
                                        />
                                      ) : extractStringValue(item.hierarchy)}
                                   </td>
                                   <td className="px-4 py-3 border-b border-slate-400 text-[10px] leading-snug text-slate-900 align-top text-justify relative group">
                                      {editingId === itemId ? (
                                        <div className="flex flex-col gap-2 w-full animate-in fade-in duration-200" onClick={(e) => e.stopPropagation()}>
                                           <textarea 
                                              value={editDraft.action || ""}
                                              onChange={(e) => setEditDraft({ ...editDraft, action: e.target.value })}
                                              className="w-full bg-white p-2 resize-none text-[10px] min-h-[60px] border border-slate-300 rounded text-slate-900 focus:outline-none focus:border-blue-500"
                                           />
                                           <div className="flex items-center justify-end gap-1.5 mt-1">
                                              <button 
                                                 onClick={(e) => { e.stopPropagation(); setEditingId(null); setEditDraft({}); }}
                                                 className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 hover:text-slate-800 border border-slate-300 rounded transition-all duration-100"
                                              >
                                                 Batal
                                              </button>
                                              <button 
                                                 onClick={(e) => { e.stopPropagation(); handleSaveEdit(); }}
                                                 className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold text-white bg-blue-600 hover:bg-blue-700 border border-blue-700 rounded transition-all duration-100"
                                              >
                                                 Simpan
                                              </button>
                                           </div>
                                        </div>
                                      ) : (
                                        <div className="flex items-start justify-between gap-4">
                                           <span className="flex-1">
                                              {extractStringValue(item.action)}
                                              <span className="inline-flex ml-2 align-middle">
                                                 {renderProvenanceBadge(item, cleanMode)}
                                              </span>
                                           </span>
                                           {!readonly && !editingId && (
                                             <div className={cn("absolute top-0 right-0 flex items-center gap-0.5 bg-white/95 backdrop-blur-sm p-0.5 rounded shadow-sm border border-slate-200 transition-opacity duration-150 z-10", isSelected ? "opacity-100 pointer-events-auto" : "opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto")}>
                                                <TooltipProvider delayDuration={400}>
                                                  <Tooltip>
                                                    <TooltipTrigger asChild>
                                                      <button 
                                                        onClick={(e) => { 
                                                           e.stopPropagation(); 
                                                           onSelectRow(itemId);
                                                           setDetailItem({
                                                              ...item,
                                                              id: itemId,
                                                              no: extractStringValue(item.no),
                                                              action: extractStringValue(item.action),
                                                              layer: extractStringValue(item.layer),
                                                              hierarchy: extractStringValue(item.hierarchy),
                                                           });
                                                        }}
                                                        className="p-1 rounded text-slate-500 hover:text-blue-600 hover:bg-blue-50 focus:outline-none"
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
                                                        onClick={(e) => { 
                                                           e.stopPropagation(); 
                                                           onSelectRow(itemId);
                                                           setDetailItem({
                                                              ...item,
                                                              id: itemId,
                                                              no: extractStringValue(item.no),
                                                              action: extractStringValue(item.action),
                                                              layer: extractStringValue(item.layer),
                                                              hierarchy: extractStringValue(item.hierarchy),
                                                           });
                                                           setEditingId(itemId); 
                                                           setEditDraft({ 
                                                              layer: extractStringValue(item.layer), 
                                                              hierarchy: extractStringValue(item.hierarchy), 
                                                              action: extractStringValue(item.action), 
                                                              type: item.type 
                                                           }); 
                                                        }}
                                                        className="p-1 rounded text-slate-500 hover:text-blue-600 hover:bg-blue-50 focus:outline-none"
                                                      >
                                                         <Pencil className="h-3 w-3" />
                                                      </button>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="top" className="z-50 text-center">
                                                      <p className="text-[10px] font-bold">Edit tindakan</p>
                                                      <p className="text-[9px] text-slate-400 mt-0.5">Double-click baris sebagai shortcut</p>
                                                    </TooltipContent>
                                                  </Tooltip>
                                                </TooltipProvider>

                                                <TooltipProvider delayDuration={400}>
                                                  <Tooltip>
                                                    <TooltipTrigger asChild>
                                                      <button 
                                                        onClick={(e) => { 
                                                           e.stopPropagation(); 
                                                           setItemToDelete({ id: itemId, text: extractStringValue(item.action) }); 
                                                        }}
                                                        className="p-1 rounded text-slate-500 hover:text-red-600 hover:bg-red-50 focus:outline-none"
                                                      >
                                                         <Trash2 className="h-3 w-3" />
                                                      </button>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="top" className="z-50 text-center">
                                                      <p className="text-[10px] font-bold text-red-600">Hapus Tindakan</p>
                                                    </TooltipContent>
                                                  </Tooltip>
                                                </TooltipProvider>
                                             </div>
                                           )}
                                        </div>
                                      )}
                                   </td>
                                </tr>
                             );
                          })}

                          {!readonly && (
                            <tr>
                               <td colSpan={4} className="px-0 py-0 border-r border-b border-slate-400 relative">
                                  <button 
                                    onClick={(e) => { 
                                      e.stopPropagation(); 
                                      setAddDraft({ layer: "I.2", hierarchy: "Eliminasi", action: "", type: "rc" });
                                      setIsAddModalOpen(true); 
                                    }}
                                    className="w-full text-center py-2 text-[11px] font-bold text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors uppercase tracking-widest bg-slate-50/50 hover:border-emerald-200 border border-transparent"
                                  >
                                    + Tambah Tindakan Perbaikan
                                  </button>
                               </td>
                            </tr>
                          )}
                       </tbody>
                    </table>
                 </div>
              </div>
           </div>
        </div>
        
        {/* Right Detail Panel */}
        {detailItem && (
          <div className="w-[380px] shrink-0 border-l border-slate-200 bg-white h-full animate-in slide-in-from-right duration-300 flex flex-col z-20 shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)]">
            <PreventionTraceabilityPanel 
              item={detailItem} 
              onClose={() => { setDetailItem(null); if(onSelectRow) onSelectRow(null); setEditingId(null); }}
              readonly={readonly}
              onEdit={() => { 
                setEditingId(detailItem.id); 
                setEditDraft({ 
                  layer: detailItem.layer, 
                  hierarchy: detailItem.hierarchy, 
                  action: detailItem.action, 
                  type: detailItem.type 
                }); 
              }} 
            />
          </div>
        )}
      </div>

      {/* Add Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Tambah Tindakan Pencegahan</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-widest">Layer</label>
                <Select value={addDraft.layer} onValueChange={v => setAddDraft({...addDraft, layer: v})}>
                  <SelectTrigger className="bg-white"><SelectValue/></SelectTrigger>
                  <SelectContent>
                    {["I.2", "II.9", "II.9 & I.2", "II.12", "III.3", "III.10", "IV.4", "IV.6"].map(l => (
                      <SelectItem key={l} value={l}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-widest">Hirarki Kontrol</label>
                <Select value={addDraft.hierarchy} onValueChange={v => setAddDraft({...addDraft, hierarchy: v})}>
                  <SelectTrigger className="bg-white"><SelectValue/></SelectTrigger>
                  <SelectContent>
                    {["Eliminasi", "Substitusi", "Rek Eng", "Adm", "APD"].map(h => (
                      <SelectItem key={h} value={h}>{h}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-widest">Jenis Prioritas (Type)</label>
              <Select value={addDraft.type} onValueChange={v => setAddDraft({...addDraft, type: v})}>
                <SelectTrigger className="bg-white"><SelectValue/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="rc">Root Cause (Merah)</SelectItem>
                  <SelectItem value="nc">Non-Compliance (Kuning)</SelectItem>
                  <SelectItem value="imp">Improvement (Hijau)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-widest">Tindakan</label>
              <Textarea 
                value={addDraft.action} 
                onChange={(e) => setAddDraft({...addDraft, action: e.target.value})} 
                placeholder="Deskripsikan tindakan..." 
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Batal</Button>
            <Button onClick={handleAdd} className="bg-slate-900 hover:bg-slate-800 text-white">Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Modal */}
      <Dialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-rose-600">HAPUS TINDAKAN?</DialogTitle>
          </DialogHeader>
          <div className="py-2 text-sm text-slate-600 space-y-4">
            <p>Tindakan perbaikan ini akan dihapus dari analisis aktif.</p>
            {itemToDelete && (
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-md text-xs">
                <div className="text-slate-600 line-clamp-2">
                  {itemToDelete.text}
                </div>
              </div>
            )}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700 uppercase">Alasan Penghapusan</label>
              <Textarea 
                value={deleteReason} 
                onChange={(e) => setDeleteReason(e.target.value)} 
                placeholder="Wajib diisi..." 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setItemToDelete(null)}>Batal</Button>
            <Button onClick={confirmDelete} className="bg-rose-600 hover:bg-rose-700 text-white" disabled={!deleteReason.trim()}>Hapus</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Audit Drawer */}
      <Sheet open={isAuditDrawerOpen} onOpenChange={setIsAuditDrawerOpen}>
        <SheetContent className="w-full sm:max-w-[480px] p-0 flex flex-col bg-slate-50 border-l border-slate-300 shadow-xl overflow-hidden z-[100]">
          <SheetHeader className="p-6 border-b border-slate-200 bg-white shrink-0">
            <SheetTitle className="text-sm font-black text-slate-800 uppercase tracking-widest mb-1 flex items-center gap-2">
              <History className="h-4 w-4 text-blue-600" />
              RIWAYAT PERUBAHAN
            </SheetTitle>
            <SheetDescription className="text-xs text-slate-500 font-medium">
              Analisis Pencegahan · {auditLogs.length} aktivitas
            </SheetDescription>
          </SheetHeader>
          
          <ScrollArea className="flex-1 bg-slate-50/50 p-6">
            <div className="relative border-l border-slate-200 ml-4 pb-4 space-y-8">
              {auditLogs.length === 0 && (
                <div className="ml-6 mt-4 text-sm text-slate-500 bg-white p-4 rounded-md border border-slate-200 text-center">
                  <History className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                  <p className="font-bold text-slate-700">Belum ada perubahan</p>
                </div>
              )}
              {auditLogs.map((log) => {
                const isCreate = log.action === 'CREATE';
                const isUpdate = log.action === 'UPDATE';
                const isDelete = log.action === 'DELETE';
                
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
                          {new Date(log.timestamp).toLocaleString('id-ID')} WIB
                        </span>
                      </div>

                      <div className="p-4 space-y-3">
                        {isDelete && log.deletionReason && (
                          <p className="text-xs text-slate-600 bg-rose-50 p-2 rounded border border-rose-100">
                            <span className="font-bold block mb-1">Alasan Penghapusan:</span>
                            {log.deletionReason}
                          </p>
                        )}
                        
                        {(isCreate || isUpdate) && log.after && (
                          <div className="text-[11px] text-slate-800 leading-relaxed italic border-l-2 border-slate-300 pl-3 py-1">
                            "{log.after.action}"
                          </div>
                        )}
                        
                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                           <div className="flex flex-col gap-0.5">
                             <span className="text-[10px] text-slate-500 font-medium">Actor</span>
                             <div className="flex items-center gap-1.5">
                               <span className="text-xs font-bold text-slate-700">{log.actorName}</span>
                             </div>
                           </div>
                           <div className="flex flex-col items-end gap-1">
                             <div className="flex items-center gap-1 text-blue-500">
                               <User className="h-3 w-3" />
                               <span className="text-[9px] font-bold uppercase tracking-wider">HUMAN</span>
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
              })}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  );
};
