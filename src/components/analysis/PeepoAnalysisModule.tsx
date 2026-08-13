import React, { useState } from 'react';
import { 
  LayoutGrid, 
  History,
  Pencil,
  Trash2,
  Check,
  X,
  User,
  PanelRightOpen,
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

export interface PeepoItem {
  id: string;
  chronology_text: string;
  version?: number;
  created_at?: string;
  provenanceType?: string;
  annotated_by_human?: boolean;
}

export interface PeepoData {
  people: PeepoItem[];
  environment: PeepoItem[];
  equipment: PeepoItem[];
  procedures: PeepoItem[];
  organisation: PeepoItem[];
  ringkasan: string;
  synthesis: string;
}

interface PeepoAnalysisModuleProps {
  data: PeepoData;
  readonly?: boolean;
  cleanMode?: boolean;
  onSelectRow: (id: string | null) => void;
  selectedRowId: string | null;
  onSync: (updatedData: PeepoData) => void;
}

const CATEGORIES = [
  { id: 'people', label: 'People (Individu)' },
  { id: 'environment', label: 'Environment (Lingkungan)' },
  { id: 'equipment', label: 'Equipment (Peralatan)' },
  { id: 'procedures', label: 'Procedures (Prosedur)' },
  { id: 'organisation', label: 'Organisation (Organisasi)' },
] as const;


export const PeepoTraceabilityPanel: React.FC<{ 
  item: any, 
  onClose: () => void,
  onEdit: () => void,
  readonly?: boolean
}> = ({ item, onClose, readonly, onEdit }) => {

  const [showHistory, setShowHistory] = React.useState(false);

  // Fallback version if not defined
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
                
                <div className="text-[11px] text-slate-800 leading-relaxed italic border-l-2 border-slate-300 pl-3 py-1 mb-3">
                  "{item?.chronology_text || item?.text}"
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
                          <div className="text-[9px] font-bold text-slate-400 mb-1">{item?.provenanceType === 'HUMAN_MANUAL' && (item?.manualRevisionCount || 0) === 0 ? 'Catatan' : 'Catatan anotasi'}</div>
                          <div className="text-[11px] text-slate-700 bg-slate-50 p-2 rounded border border-slate-100">{item.latestHumanChange.changeNote}</div>
                        </div>
                      )}
                      <div>
                        <div className="text-[9px] font-bold text-slate-400 mb-1">SEBELUM</div>
                        <div className="bg-red-50 text-red-900 p-2 rounded text-[11px] border border-red-100">{item?.history?.[0]?.chronology_text || "Data sebelum diubah."}</div>
                      </div>
                      <div>
                        <div className="text-[9px] font-bold text-slate-400 mb-1">SESUDAH</div>
                        <div className="bg-emerald-50 text-emerald-900 p-2 rounded text-[11px] border border-emerald-100">{item?.chronology_text || item?.text}</div>
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
                      <div className="text-[11px] font-bold text-slate-800 mb-2">PEEPO Analysis Agent</div>
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
                    
                    <div className="text-[11px] text-slate-800 leading-relaxed italic border-l-2 border-slate-300 pl-3 py-1 mb-3">
                      "{histItem.chronology_text || item?.chronology_text || item?.text}"
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
                            <div className="bg-red-50 text-red-900 p-2 rounded text-[11px] border border-red-100">{history[idx + 1]?.chronology_text || "Data sebelumnya."}</div>
                          </div>
                          <div>
                            <div className="text-[9px] font-bold text-slate-400 mb-1">SESUDAH</div>
                            <div className="bg-emerald-50 text-emerald-900 p-2 rounded text-[11px] border border-emerald-100">{histItem.chronology_text || item?.chronology_text || item?.text}</div>
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
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Analisis Faktor PEEPO</p>
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
            <div className="text-[11px] font-bold text-slate-800 mb-1">PEEPO Analysis Agent</div>
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
                  "{item?.chronology_text || item?.text}"
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
               'PERNYATAAN AWAL'
             </div>
             {item?.provenanceType !== 'HUMAN_MANUAL' && (
               <div className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase border border-indigo-200 shadow-sm">
                 <><Brain className="h-2.5 w-2.5" /> AI</>
               </div>
             )}
           </div>
           
           <div className="text-[12.5px] text-slate-800 leading-relaxed bg-slate-50/80 p-4 rounded border border-slate-200">
             {item?.provenanceType === 'AI_HUMAN_ANNOTATED' ? (item?.original_text || item?.chronology_text || item?.text) : (item?.chronology_text || item?.text)}
           </div>
        </div>

        {/* Action Button */}
        <div className="pt-4">
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

export const PeepoAnalysisModule: React.FC<PeepoAnalysisModuleProps> = ({
  data,
  readonly = false,
  cleanMode = false,
  onSelectRow,
  selectedRowId,
  onSync
}) => {

  const [internalData, setInternalData] = useState<PeepoData>(data);
  const initialDummyAuditLogs: AuditEntry[] = [
    {
      id: "log-peepo-1",
      itemId: "peepo-pr1",
      category: "procedures",
      action: "UPDATE",
      actorName: "Gulang Satriya",
      actorRole: "Lead Investigator",
      actorType: "HUMAN",
      timestamp: "2026-08-05T10:15:00Z",
      versionTo: 2,
      before: { chronology_text: "Proses pencucian unit belum diatur.", status: "ai_generated" },
      after: { chronology_text: "Proses pencucian unit pada area engine belum diatur dengan detail dan terukur , sehingga saat dilakukan pencucian unit Whelloader material Fine coal hanya yang berada diatas fuel Tank hanya pada area yang kelihatan dari luar , bagian sisi kanan dan kiri dekat chasis masih terdapat sisa fine coal", status: "needs_review" }
    }
  ];

  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>(initialDummyAuditLogs);
  const [isAuditDrawerOpen, setIsAuditDrawerOpen] = useState(false);
  
  // CRUD State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addCategory, setAddCategory] = useState<string>("people");
  const [addText, setAddText] = useState("");
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  
  const [itemToDelete, setItemToDelete] = useState<{id: string, category: string, text: string} | null>(null);
  const [deleteReason, setDeleteReason] = useState("");
  
  const [detailItem, setDetailItem] = useState<{id: string, category: string, text: string} | null>(null);
  const [viewMode, setViewMode] = useState<'columns' | 'table'>('columns');

  React.useEffect(() => {
    setInternalData(data);
  }, [data]);

  const renderProvenanceBadge = (item:  PeepoItem | any, isCleanMode?: boolean) => {
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

  const handleAdd = () => {
    if (!addText.trim()) return;
    
    const newId = "peepo-" + Date.now();
    const ts = new Date().toISOString();
    
    const newItem: PeepoItem = {
      id: newId,
      chronology_text: addText,
      version: 1,
      created_at: ts
    };
    
    const updatedData = {
      ...internalData,
      [addCategory]: [...((internalData[addCategory as keyof PeepoData] as PeepoItem[]) || []), newItem]
    };
    
    const audit: AuditEntry = {
      id: "log-" + Date.now(),
      itemId: newId,
      category: addCategory,
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
    setAddText("");
    toast.success("Data berhasil ditambahkan.");
  };

  const handleSaveEdit = () => {
    if (!editingId || !editingCategory) return;
    const ts = new Date().toISOString();
    
    const categoryArray = internalData[editingCategory as keyof PeepoData] as PeepoItem[];
    const itemIndex = categoryArray.findIndex(i => (i.id || (i as any)) === editingId);
    if (itemIndex === -1) return;
    
    const oldItem = categoryArray[itemIndex];
    const oldText = oldItem.chronology_text || (oldItem as any).label || (oldItem as any);
    
    if (oldText === editText) {
      setEditingId(null);
      return;
    }
    
    const newItem = {
      ...oldItem,
      id: oldItem.id || editingId,
      chronology_text: editText,
      version: (oldItem.version || 1) + 1,
    };
    
    const updatedArray = [...categoryArray];
    updatedArray[itemIndex] = newItem;
    
    const updatedData = {
      ...internalData,
      [editingCategory]: updatedArray
    };
    
    const audit: AuditEntry = {
      id: "log-" + Date.now(),
      itemId: editingId,
      category: editingCategory,
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
       setDetailItem({ ...detailItem, text: editText });
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
    const categoryArray = internalData[itemToDelete.category as keyof PeepoData] as PeepoItem[];
    const itemIndex = categoryArray.findIndex(i => (i.id || (i as any)) === itemToDelete.id);
    if (itemIndex === -1) return;
    
    const oldItem = categoryArray[itemIndex];
    
    const updatedArray = categoryArray.filter(i => (i.id || (i as any)) !== itemToDelete.id);
    const updatedData = {
      ...internalData,
      [itemToDelete.category]: updatedArray
    };
    
    const audit: AuditEntry = {
      id: "log-" + Date.now(),
      itemId: itemToDelete.id,
      category: itemToDelete.category,
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
    toast.success("Data dihapus.");
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/10 overflow-hidden relative">
      <div className="flex-1 flex min-w-0 h-full relative">
        <div className="flex-1 flex flex-col h-full overflow-hidden z-10 shadow-sm relative transition-all duration-300">
           <div className="shrink-0 p-4 border-b border-slate-200 bg-white flex flex-col gap-4">
              <div className="flex items-center justify-between">
                 <div>
                    <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                       <LayoutGrid className="h-4 w-4 text-slate-500" />
                       LEMBAR ANALISIS FAKTOR PEEPO
                    </h2>
                    <p className="text-[11px] text-slate-500 mt-1">Sintesis temuan berdasarkan kategori People, Environment, Equipment, Procedures, dan Organisation.</p>
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
                    {/* View Switcher */}
                    <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded border border-slate-200">
                       <button
                         onClick={() => setViewMode('columns')}
                         className={cn("px-2.5 py-1 text-[10px] font-bold rounded transition-all active:scale-95 duration-100 flex items-center gap-1", 
                           viewMode === 'columns' ? "bg-white text-slate-900 shadow-sm border border-slate-200" : "text-slate-500 hover:text-slate-800")}
                       >
                         <TableIcon className="h-3 w-3" /> TABLE VIEW
                       </button>
                       <button
                         onClick={() => setViewMode('table')}
                         className={cn("px-2.5 py-1 text-[10px] font-bold rounded transition-all active:scale-95 duration-100 flex items-center gap-1", 
                           viewMode === 'table' ? "bg-white text-slate-900 shadow-sm border border-slate-200" : "text-slate-500 hover:text-slate-800")}
                       >
                         <LayoutGrid className="h-3 w-3" /> LIST VIEW
                       </button>
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
                       <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Sintesis Selesai</span>
                    </div>
                  </div>
              </div>
           </div>
           
           <div className="flex-1 overflow-auto bg-slate-50 p-8 flex justify-center scrollbar-thin">
              {viewMode === 'table' ? (
                <div className="w-full max-w-[1300px] bg-white border border-slate-300 shadow-sm p-8 pb-16 h-fit shrink-0 space-y-8 animate-in fade-in duration-200">
                  {CATEGORIES.map((section) => (
                     <div key={section.id} className="space-y-0">
                        <div className="bg-white border border-slate-400 overflow-hidden">
                           <table className="w-full text-left border-collapse">
                              <thead>
                                 <tr>
                                    <th className="px-4 py-2 text-[13px] font-bold text-center border-b border-slate-400 text-white uppercase tracking-widest bg-slate-900">
                                       {section.label}
                                    </th>
                                 </tr>
                                 <tr className="bg-slate-50/80">
                                    <th className="px-4 py-2 text-[10px] font-bold text-slate-900 uppercase tracking-widest border-r border-b border-slate-400 bg-white">TEMUAN</th>
                                 </tr>
                              </thead>
                              <tbody>
                                 {(internalData[section.id as keyof PeepoData] as PeepoItem[] || []).map((item, idx) => {
                                    const itemId = item.id || `${section.id}-${idx}`;
                                    const textVal = item.text || item.chronology_text || (item as any).label || (item as any);
                                    const isSelected = selectedRowId === itemId;
                                    const isEditingInline = editingId === itemId;
                                    
                                    return (
                                       <tr 
                                          key={itemId} 
                                          onClick={() => {
                                             onSelectRow(itemId);
                                             
                                          }}
                                          onDoubleClick={() => {
                                            if (readonly) return;
                                            setEditingId(itemId);
                                            setEditingCategory(section.id);
                                            setEditText(textVal);
                                          }}
                                          className={cn(
                                             "group transition-all cursor-pointer",
                                             isSelected ? "bg-slate-100/70 border-l-[3px] border-l-blue-600" : "bg-white hover:bg-slate-50/80 border-l-[3px] border-l-transparent"
                                          )}
                                       >
                                          <td className="px-4 py-2 align-top border-r border-b border-slate-400 relative transition-colors">
                                             {isEditingInline ? (
                                                <div className="flex flex-col gap-2.5 w-full animate-in fade-in slide-in-from-top-1 duration-200" onClick={(e) => e.stopPropagation()}>
                                                  <textarea 
                                                    value={editText}
                                                    onChange={e => setEditText(e.target.value)}
                                                    onKeyDown={(e) => {
                                                      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                                                        e.preventDefault();
                                                        handleSaveEdit();
                                                      } else if (e.key === 'Escape') {
                                                        setEditingId(null);
                                                      }
                                                    }}
                                                    className="w-full bg-white p-2.5 resize-none font-inherit leading-normal min-h-[80px] border border-slate-300 rounded text-slate-900 transition-colors focus:outline-none focus:ring-0 focus:border-blue-500 text-[11px]"
                                                    autoFocus
                                                  />
                                                  <div className="flex items-center justify-between text-[10px]">
                                                    <span className="text-slate-400 font-medium">Ctrl + Enter to Save, Esc to Cancel</span>
                                                    <div className="flex items-center gap-1.5">
                                                      <button 
                                                        onClick={(e) => { e.stopPropagation(); setEditingId(null); }}
                                                        className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 hover:text-slate-800 border border-slate-300 rounded shadow-sm transition-all active:scale-95 duration-100"
                                                      >
                                                        <X className="h-3 w-3" /> Cancel
                                                      </button>
                                                      <button 
                                                        onClick={(e) => { e.stopPropagation(); handleSaveEdit(); }}
                                                        className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-white bg-blue-600 hover:bg-blue-700 border border-blue-700 rounded shadow-sm transition-all active:scale-95 duration-100 min-w-[70px] justify-center"
                                                      >
                                                        <Check className="h-3 w-3" /> Save
                                                      </button>
                                                    </div>
                                                  </div>
                                                </div>
                                             ) : (
                                                <div className="flex items-start justify-between gap-4">
                                                  <p className={cn(
                                                     "text-[10px] leading-snug pr-2 transition-colors flex-1 text-justify",
                                                     isSelected ? "text-slate-900" : "text-slate-900"
                                                  )}>
                                                     {textVal}
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
                                                              onClick={(e) => { 
                                                                 e.stopPropagation(); 
                                                                 onSelectRow(itemId);
                                                                 setDetailItem({ id: itemId, category: section.id, text: textVal });
                                                              }}
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
                                                              onClick={(e) => { 
                                                                 e.stopPropagation(); 
                                                                 setEditingId(itemId); 
                                                                 setEditingCategory(section.id); 
                                                                 setEditText(textVal); 
                                                              }}
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
                                                              onClick={(e) => { 
                                                                 e.stopPropagation(); 
                                                                 setItemToDelete({ id: itemId, category: section.id, text: textVal }); 
                                                              }}
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
                                          </td>
                                       </tr>
                                    );
                                 })}
                                 {!readonly && (
                                   <tr>
                                       <td className="px-0 py-0 border-r border-b border-slate-400 bg-white hover:bg-slate-50 transition-colors">
                                         <button 
                                           onClick={(e) => { 
                                             e.stopPropagation(); 
                                             setAddCategory(section.id);
                                             setAddText("");
                                             setIsAddModalOpen(true);
                                           }}
                                           className="w-full text-center py-2.5 text-[10px] font-bold text-slate-500 hover:text-emerald-700 uppercase tracking-widest"
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
                  ))}

                </div>
              ) : (
                <div className="w-full max-w-[1300px] bg-white border border-slate-300 shadow-sm p-8 pb-16 h-fit shrink-0 space-y-6 animate-in fade-in duration-200">
                  <div className="border-[1.5px] border-slate-900 bg-white shadow-sm flex flex-col">
                    <div className="grid grid-cols-5 border-b-[1.5px] border-slate-900 bg-[#78c15c]">
                      {CATEGORIES.map((section, index) => (
                        <div key={section.id} className={cn(
                          "py-3 px-3 text-center text-[10px] font-black uppercase tracking-wider leading-tight min-h-[44px] flex items-center justify-center text-slate-900",
                          index > 0 && "border-l-[1.5px] border-slate-900"
                        )}>
                          {section.label}
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-5 min-h-[480px]">
                      {CATEGORIES.map((section, index) => {
                        const items = (internalData[section.id as keyof PeepoData] as PeepoItem[] || []);
                        return (
                          <div key={section.id} className={cn(
                            "flex flex-col bg-white p-2 relative",
                            index > 0 && "border-l-[1.5px] border-slate-900"
                          )}>
                            {items.map((item, idx) => {
                              const itemId = item.id || `${section.id}-${idx}`;
                              const textVal = item.text || item.chronology_text || (item as any).label || (item as any);
                              const isSelected = selectedRowId === itemId;
                              const isEditingInline = editingId === itemId;

                              return (
                                <div
                                  key={itemId}
                                  onClick={() => {
                                    onSelectRow(itemId);
                                    
                                  }}
                                  onDoubleClick={() => {
                                    if (readonly) return;
                                    setEditingId(itemId);
                                    setEditingCategory(section.id);
                                    setEditText(textVal);
                                  }}
                                  className={cn(
                                    "relative group px-1 py-0.5 rounded transition-colors cursor-pointer flex flex-col my-[1px]",
                                    isSelected ? "bg-blue-50/80" : "hover:bg-slate-50"
                                  )}
                                >
                                  {isEditingInline ? (
                                    <div className="flex flex-col gap-2 w-full z-20" onClick={(e) => e.stopPropagation()}>
                                      <textarea
                                        value={editText}
                                        onChange={e => setEditText(e.target.value)}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                                            e.preventDefault();
                                            handleSaveEdit();
                                          } else if (e.key === 'Escape') {
                                            setEditingId(null);
                                          }
                                        }}
                                        className="w-full bg-white p-2 resize-none font-inherit leading-normal min-h-[90px] border border-blue-400 rounded text-slate-900 transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500 text-[10px] shadow-sm"
                                        autoFocus
                                      />
                                      <div className="flex items-center justify-between text-[8px]">
                                        <span className="text-slate-400 font-medium">Ctrl+Enter to Save</span>
                                        <div className="flex items-center gap-1">
                                          <button 
                                            onClick={() => setEditingId(null)}
                                            className="px-1.5 py-0.5 border border-slate-300 rounded bg-slate-50 hover:bg-slate-100 text-[8px] font-bold text-slate-600 shadow-sm"
                                          >Batal</button>
                                          <button 
                                            onClick={handleSaveEdit}
                                            className="px-1.5 py-0.5 border border-blue-600 rounded bg-blue-600 hover:bg-blue-700 text-[8px] font-bold text-white shadow-sm"
                                          >Simpan</button>
                                        </div>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="w-full relative">
                                      <div className="flex text-[10px] leading-snug text-slate-900 w-full">
                                        <span className="mr-1.5 shrink-0 mt-[1px]">-</span>
                                        <span className="flex-1 min-w-0 pr-1 break-words">
                                           {textVal}
                                           <span className="inline-flex ml-1 align-middle">
                                             {renderProvenanceBadge(item, cleanMode)}
                                           </span>
                                        </span>
                                      </div>

                                      {/* Absolutely positioned hover actions so they don't break text layout */}
                                      {!readonly && (
                                        <div className={cn(
                                          "absolute top-0 right-0 flex items-center gap-0.5 bg-white/95 backdrop-blur-sm p-0.5 rounded shadow-sm border border-slate-200 transition-opacity duration-150 z-10", 
                                          isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto"
                                        )}>
                                          <button 
                                            onClick={(e) => { 
                                              e.stopPropagation(); 
                                              onSelectRow(itemId);
                                              setDetailItem({ id: itemId, category: section.id, text: textVal });
                                            }}
                                            className="p-1 rounded text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                                          >
                                            <Eye className="h-3 w-3" />
                                          </button>
                                          <button 
                                            onClick={(e) => { 
                                              e.stopPropagation(); 
                                              setEditingId(itemId); 
                                              setEditingCategory(section.id); 
                                              setEditText(textVal); 
                                            }}
                                            className="p-1 rounded text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                                          >
                                            <Pencil className="h-3 w-3" />
                                          </button>
                                          <button 
                                            onClick={(e) => { 
                                              e.stopPropagation(); 
                                              setItemToDelete({ id: itemId, category: section.id, text: textVal }); 
                                            }}
                                            className="p-1 rounded text-slate-500 hover:text-red-600 hover:bg-red-50"
                                          >
                                            <Trash2 className="h-3 w-3" />
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                            {!readonly && (
                              <button 
                                onClick={() => { 
                                  setAddCategory(section.id);
                                  setAddText("");
                                  setIsAddModalOpen(true);
                                }}
                                className="w-full mt-2 text-center py-2 text-[9px] font-bold text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors uppercase tracking-wider border border-dashed border-slate-300 hover:border-emerald-300 rounded"
                              >
                                + Tambah Data
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Ringkasan & Synthesis Footer */}
                  <div className="grid grid-cols-2 gap-6 pt-4">
                    <div className="bg-white border-l border-t border-slate-200 p-6 shadow-sm rounded-sm">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Ringkasan Analisis</span>
                      <p className="text-[11px] font-bold text-slate-600 leading-relaxed italic">"${internalData.ringkasan}"</p>
                    </div>
                    <div className="bg-slate-900 p-6 shadow-sm border border-slate-800 rounded-sm">
                      <span className="text-[9px] font-black text-emerald-400/50 uppercase tracking-widest block mb-2">Kecerdasan Sintesis</span>
                      <p className="text-[11px] font-black text-white uppercase tracking-tight leading-relaxed">{internalData.synthesis}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* Traceability Panel */}
        {detailItem && (
          <div className="w-[420px] shrink-0 border-l border-slate-200 h-full animate-in slide-in-from-right duration-300 z-20 shadow-[-10px_0_30px_rgba(0,0,0,0.05)] bg-slate-50">
            <PeepoTraceabilityPanel 
              readonly={readonly}
              item={{
                ...(internalData[detailItem.category as keyof typeof internalData] as any[])?.find((i: any) => i.id === detailItem.id || (i as any) === detailItem.id),
                id: detailItem.id,
                category: detailItem.category,
                text: detailItem.text
              }}
              onClose={() => { setDetailItem(null); onSelectRow(null); }}
              onEdit={() => {
                setEditingId(detailItem.id);
                setEditingCategory(detailItem.category);
                setEditText(detailItem.text);
                setDetailItem(null);
              }}
            />
          </div>
        )}
      </div>

      {/* Add Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Tambah Data PEEPO</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-widest">Kategori</label>
              <Select value={addCategory} onValueChange={setAddCategory}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-widest">Temuan</label>
              <Textarea 
                value={addText} 
                onChange={(e) => setAddText(e.target.value)} 
                placeholder="Tulis temuan..." 
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
            <DialogTitle className="text-rose-600">HAPUS DATA PEEPO?</DialogTitle>
          </DialogHeader>
          <div className="py-2 text-sm text-slate-600">
            <p>Item ini akan dihapus dari analisis aktif.</p>
            <p>Riwayat dan versi sebelumnya tetap tersimpan dalam Audit Log.</p>
          </div>
          
          {itemToDelete && (
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-md text-xs">
              <div className="font-bold text-slate-700 mb-1">
                {CATEGORIES.find(c => c.id === itemToDelete.category)?.label}
              </div>
              <div className="text-slate-600 line-clamp-2">
                {itemToDelete.text}
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
            <Button onClick={confirmDelete} className="bg-rose-600 hover:bg-rose-700 text-white">Hapus Data</Button>
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
              Analisis PEEPO · {auditLogs.length} aktivitas
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
                        <div className="flex items-center gap-2">
                           <span className="text-xs font-bold text-slate-700">
                             {CATEGORIES.find(c => c.id === log.category)?.label}
                           </span>
                        </div>
                        
                        {isDelete && log.deletionReason && (
                          <p className="text-xs text-slate-600 bg-rose-50 p-2 rounded border border-rose-100">
                            <span className="font-bold block mb-1">Alasan Penghapusan:</span>
                            {log.deletionReason}
                          </p>
                        )}
                        
                        {(isCreate || isUpdate) && log.after && (
                          <div className="text-[11px] text-slate-800 leading-relaxed italic border-l-2 border-slate-300 pl-3 py-1">
                            "{log.after.chronology_text || log.after}"
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
