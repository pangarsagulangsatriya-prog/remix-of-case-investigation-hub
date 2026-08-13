import React, { useState } from "react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  Shield, 
  Trash2,
  History,
  User,
  PanelRightOpen,
  Eye,
  Pencil,
  Check,
  X,
  FileText,
  Brain,
  ChevronRight,
  CheckCircle2,
  Table as TableIcon
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  category: string; // layerId as string
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

export interface IplsItem {
  id: string;
  label: string;
  status: string; // "", "rootcause", "non-conformity", "improvement"
  originalIndex: number;
  description?: string;
  version?: number;
  provenanceType?: string;
  annotated_by_human?: boolean;
}

export interface IplsLayer {
  id: number;
  title: string;
  items: IplsItem[];
}

export interface IplsData {
  layers: IplsLayer[];
}

interface IplsAnalysisModuleProps {
  data: IplsData;
  onSelectRow?: (id: string | null) => void;
  selectedRowId?: string | null;
  onSync: (newData: IplsData) => void;
  readonly?: boolean;
  cleanMode?: boolean;
}


export const IplsTraceabilityPanel: React.FC<{ 
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
                
                <div className="text-[11px] text-slate-900 font-bold mb-1">[{item?.label}]</div>
                <div className="text-[11px] text-slate-800 leading-relaxed italic border-l-2 border-slate-300 pl-3 py-1 mb-3">
                  "{item?.description || 'Belum ada deskripsi.'}"
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
                        <div className="bg-red-50 text-red-900 p-2 rounded text-[11px] border border-red-100">{history[0]?.description || "Data sebelumnya."}</div>
                      </div>
                      <div>
                        <div className="text-[9px] font-bold text-slate-400 mb-1">SESUDAH</div>
                        <div className="bg-emerald-50 text-emerald-900 p-2 rounded text-[11px] border border-emerald-100">{item?.description}</div>
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
                      <div className="text-[11px] font-bold text-slate-800 mb-2">IPLS Analysis Agent</div>
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
                    
                    <div className="text-[11px] text-slate-900 font-bold mb-1">[{histItem.label || item?.label}]</div>
                    <div className="text-[11px] text-slate-800 leading-relaxed italic border-l-2 border-slate-300 pl-3 py-1 mb-3">
                      "{histItem.description || item?.description}"
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
                            <div className="bg-red-50 text-red-900 p-2 rounded text-[11px] border border-red-100">{history[idx + 1]?.description || "Data sebelumnya."}</div>
                          </div>
                          <div>
                            <div className="text-[9px] font-bold text-slate-400 mb-1">SESUDAH</div>
                            <div className="bg-emerald-50 text-emerald-900 p-2 rounded text-[11px] border border-emerald-100">{histItem.description || item?.description}</div>
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
          <div className="h-8 w-8 bg-[#091b4c] flex items-center justify-center text-white rounded-none">
            <TableIcon className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-[13px] font-bold text-slate-900 uppercase tracking-wider leading-none">Detail Analisis</h3>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Lapisan Proteksi (IPLS) &middot; Layer {item?.layerId} &middot; #{item?.originalIndex}</p>
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
            <div className="text-[11px] font-bold text-slate-800 mb-1">IPLS Analysis Agent</div>
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
                  "{item?.description}"
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
               'DESKRIPSI KEJADIAN AWAL'
             </div>
             {item?.provenanceType !== 'HUMAN_MANUAL' && (
               <div className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase border border-indigo-200 shadow-sm">
                 <><Brain className="h-2.5 w-2.5" /> AI</>
               </div>
             )}
           </div>
           
           <div className="text-[12.5px] text-slate-800 leading-relaxed bg-slate-50/80 p-4 rounded border border-slate-200">
             <div className="font-bold mb-2 text-slate-900">[{item?.label}]</div>
             <div>{item?.provenanceType === 'AI_HUMAN_ANNOTATED' ? (item?.original_text || item?.description) : item?.description}</div>
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

export function IplsAnalysisModule({ 
  data, 
  onSelectRow, 
  selectedRowId, 
  onSync, 
  readonly = false,
  cleanMode = false 
}: IplsAnalysisModuleProps) {
  
  const [internalData, setInternalData] = useState<IplsData>(data);
  const initialDummyAuditLogs: AuditEntry[] = [
    {
      id: "log-1",
      itemId: "l2-9",
      category: "2",
      action: "UPDATE",
      actorName: "Aditya Pratama",
      actorRole: "Safety Superintendent",
      actorType: "HUMAN",
      timestamp: "2026-08-05T09:04:00Z",
      versionTo: 2,
      before: { label: "Maintenance", status: "", description: "" },
      after: { label: "Maintenance", status: "non-conformity", description: "Belum ada penentuan lifetime penggunaan terkait Nut Tyre pada LV" }
    },
    {
      id: "log-2",
      itemId: "l3-3",
      category: "3",
      action: "UPDATE",
      actorName: "Gulang Satriya",
      actorRole: "Lead Investigator",
      actorType: "HUMAN",
      timestamp: "2026-08-05T09:15:00Z",
      versionTo: 2,
      before: { label: "P2H", status: "", description: "" },
      after: { label: "P2H (incl. emergency equipment)", status: "rootcause", description: "Sdr. Rico tidak mendeteksi adanya bolt yang sudah terlepas pada tyre depan sebelah kiri LV BM 391" }
    }
  ];

  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>(initialDummyAuditLogs);
  const [isAuditDrawerOpen, setIsAuditDrawerOpen] = useState(false);
  
  const layers = internalData?.layers || [];
  
  // Detail Panel
  const [detailItem, setDetailItem] = useState<{layerId: number, item: IplsItem} | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Partial<IplsItem>>({});
  
  // Delete confirm
  const [itemToDelete, setItemToDelete] = useState<{layerId: number, id: string, label: string} | null>(null);
  const [deleteReason, setDeleteReason] = useState("");

  React.useEffect(() => {
    setInternalData(data);
  }, [data]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addLayerId, setAddLayerId] = useState<number>(1);
  const [addLabel, setAddLabel] = useState("");
  const [addDescription, setAddDescription] = useState("");
  const [addStatus, setAddStatus] = useState("non-conformity");

  const handleAddItemSubmit = () => {
    if (!addLabel.trim()) {
      toast.error("Label harus diisi");
      return;
    }
    
    const ts = new Date().toISOString();
    const newId = "ipls-" + Date.now();
    
    const targetLayer = layers.find(l => l.id === addLayerId);
    if (!targetLayer) return;
    
    const newItem: IplsItem = {
      id: newId,
      label: addLabel,
      status: addStatus,
      originalIndex: targetLayer.items.length + 1,
      description: addDescription,
      version: 1,
      provenanceType: 'HUMAN_MANUAL'
    };

    const newLayers = layers.map((layer) => {
      if (layer.id === addLayerId) {
        return {
          ...layer,
          items: [...layer.items, newItem]
        };
      }
      return layer;
    });
    
    const updatedData = { ...internalData, layers: newLayers };
    
    const audit: AuditEntry = {
      id: "log-" + Date.now(),
      itemId: newId,
      category: `Layer ${addLayerId}`,
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
    toast.success("Data berhasil ditambahkan.");
  };

  const renderProvenanceBadge = (item:  IplsItem | any, isCleanMode?: boolean) => {
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
    if (!editingId || !detailItem) return;
    const ts = new Date().toISOString();
    
    const layer = layers.find(l => l.id === detailItem.layerId);
    if (!layer) return;
    
    const oldItem = layer.items.find(i => i.id === editingId);
    if (!oldItem) return;
    
    if (
      oldItem.label === editDraft.label &&
      oldItem.description === editDraft.description &&
      oldItem.status === editDraft.status
    ) {
      setEditingId(null);
      return;
    }
    
    const newItem = {
      ...oldItem,
      label: editDraft.label || oldItem.label,
      description: editDraft.description || oldItem.description,
      status: editDraft.status || oldItem.status,
      version: (oldItem.version || 1) + 1,
      provenanceType: 'HUMAN_MANUAL',
      history: [
        {
          label: oldItem.label,
          description: oldItem.description,
          status: oldItem.status,
          version: oldItem.version || 1,
          timestamp: ts,
          userName: "Gulang Satriya",
          userRole: "Lead Investigator",
          provenanceType: oldItem.provenanceType || 'AI_GENERATED'
        },
        ...(oldItem.history || [])
      ]
    };
    
    const newLayers = layers.map(l => {
      if (l.id === detailItem.layerId) {
        return {
          ...l,
          items: l.items.map(it => it.id === editingId ? newItem : it)
        };
      }
      return l;
    });
    
    const updatedData = { ...internalData, layers: newLayers };
    
    const audit: AuditEntry = {
      id: "log-" + Date.now(),
      itemId: editingId,
      category: `Layer ${detailItem.layerId}`,
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
    setDetailItem({ layerId: detailItem.layerId, item: newItem });
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
    
    const layer = layers.find(l => l.id === itemToDelete.layerId);
    if (!layer) return;
    
    const oldItem = layer.items.find(i => i.id === itemToDelete.id);
    if (!oldItem) return;
    
    const newLayers = layers.map(l => {
      if (l.id === itemToDelete.layerId) {
        return {
          ...l,
          items: l.items.filter(it => it.id !== itemToDelete.id)
        };
      }
      return l;
    });
    
    const updatedData = { ...internalData, layers: newLayers };
    
    const audit: AuditEntry = {
      id: "log-" + Date.now(),
      itemId: itemToDelete.id,
      category: `Layer ${itemToDelete.layerId}`,
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
    
    if (detailItem && detailItem.item.id === itemToDelete.id) {
       setDetailItem(null);
    }
    
    setItemToDelete(null);
    setDeleteReason("");
    toast.success("Item dihapus.");
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/10 overflow-hidden relative">
      <div className="flex-1 flex min-w-0 h-full relative">
        <div className="flex-1 flex flex-col h-full overflow-hidden z-10 shadow-sm relative transition-all duration-300">
           {/* Title Bar */}
           <div className={cn("shrink-0 p-4 border-b border-slate-200 bg-white flex flex-col gap-4", cleanMode ? "hidden" : "")}>
              <div className="flex items-center justify-between">
                 <div>
                    <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                       <Shield className="h-4 w-4 text-slate-500" />
                       IPLS - BUMA LMO - NM LV BM 391
                    </h2>
                    <p className="text-[11px] text-slate-500 mt-1">Validasi dan evaluasi lapisan proteksi sistem bekerja selamat.</p>
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
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Validasi Selesai</span>
                   </div>
                 </div>
              </div>
           </div>

           <div className={cn("flex-1 overflow-auto flex justify-center", cleanMode ? "bg-white p-0" : "bg-slate-50 p-4 lg:p-8 scrollbar-thin")}>
              <div className={cn("w-full h-fit shrink-0 overflow-x-auto", cleanMode ? "max-w-none bg-white border-0 shadow-none p-0" : "max-w-[1300px] bg-white border border-slate-300 shadow-sm p-8")}>
                 {/* Main Content Area */}
                 <div className="flex-1 flex flex-col">
                    <div className="mb-4">
                       {!cleanMode && (<>
                          <h3 className="font-bold text-[14px] text-slate-900 mb-0.5">Analisa Kejadian</h3>
                          <div className="h-[2px] w-[20%] bg-blue-500 mb-4 mt-1"></div>
                       </>)}

                       {/* Header bar */}
                       <div className="relative h-6 bg-[#a3a6aa] flex items-center justify-center w-full mb-3">
                          <div className="absolute -left-3 top-0 w-0 h-0 border-y-[12px] border-y-transparent border-r-[12px] border-r-[#a3a6aa]"></div>
                          <span className="text-white font-bold text-xs tracking-wide">Investigation</span>
                       </div>

                       {/* Columns Grid */}
                       <div className="grid grid-cols-5 gap-3">
                          {layers.map((layer: IplsLayer, colIdx: number) => {
                             const findingItems = layer.items.filter((i: IplsItem) => i.status);
                             return (
                                <div key={layer.id} className="flex flex-col h-full border-r border-dashed border-slate-300 last:border-r-0 pr-3 min-h-[150px]">
                                   {/* Layer Header */}
                                   <div className="text-center font-bold text-[12px] mb-3 italic text-slate-800">
                                      Layer {["I", "II", "III", "IV", "V"][colIdx]}
                                   </div>

                                   {/* Findings */}
                                   <div className="flex-1 space-y-4">
                                      {findingItems.map((item: IplsItem) => {
                                         const num = item.originalIndex || 0;
                                         let bgColor = "";
                                         let textColor = "text-slate-900";
                                         if (item.status === 'rootcause') {
                                            bgColor = "bg-red-600 border-red-600 hover:bg-red-700";
                                            textColor = "text-white";
                                         } else if (item.status === 'non-conformity') {
                                            bgColor = "bg-[#ffc000] border-[#ffc000] hover:bg-amber-500";
                                         } else if (item.status === 'improvement') {
                                            bgColor = "bg-[#00c950] border-[#00c950] hover:bg-emerald-600";
                                         }

                                         const isSelected = item.id === selectedRowId;
                                         return (
                                            <div 
                                               key={item.id} 
                                               className={cn(
                                                  "flex flex-col cursor-pointer group relative p-2 rounded-md transition-all border border-transparent",
                                                  isSelected ? 'bg-slate-100/80 ring-1 ring-slate-300' : 'hover:bg-slate-50/50'
                                               )}
                                               onClick={() => {
                                                  if (onSelectRow) onSelectRow(item.id);
                                               }}
                                               onDoubleClick={(e) => {
                                                  if (!readonly) {
                                                     setEditingId(item.id);
                                                     setEditDraft({ label: item.label, description: item.description, status: item.status });
                                                  }
                                               }}
                                            >
                                               {editingId === item.id ? (
                                                  <div className="flex flex-col gap-2 w-full animate-in fade-in duration-200" onClick={(e) => e.stopPropagation()}>
                                                     <input 
                                                        type="text"
                                                        value={editDraft.label || ""}
                                                        onChange={(e) => setEditDraft({ ...editDraft, label: e.target.value })}
                                                        placeholder="Label"
                                                        className="w-full bg-white px-2 py-1 text-[11px] font-bold border border-slate-300 rounded text-slate-900 focus:outline-none focus:border-blue-500"
                                                     />
                                                     <textarea 
                                                        value={editDraft.description || ""}
                                                        onChange={(e) => setEditDraft({ ...editDraft, description: e.target.value })}
                                                        placeholder="Deskripsi Kejadian"
                                                        className="w-full bg-white p-2 resize-none text-[10px] min-h-[60px] border border-slate-300 rounded text-slate-900 focus:outline-none focus:border-blue-500"
                                                     />
                                                     <select 
                                                        value={editDraft.status || "non-conformity"}
                                                        onChange={(e) => setEditDraft({ ...editDraft, status: e.target.value as any })}
                                                        className="w-full bg-white px-2 py-1 text-[10px] border border-slate-300 rounded text-slate-900 focus:outline-none focus:border-blue-500"
                                                     >
                                                        <option value="rootcause">Rootcause</option>
                                                        <option value="non-conformity">Non Conformity</option>
                                                        <option value="improvement">Improvement</option>
                                                     </select>
                                                     <div className="flex items-center justify-between mt-1">
                                                        <span className="text-[9px] text-slate-400">Tekan Simpan untuk menyimpan</span>
                                                        <div className="flex items-center gap-1.5">
                                                           <button 
                                                              onClick={(e) => { e.stopPropagation(); setEditingId(null); setEditDraft({}); }}
                                                              className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 hover:text-slate-800 border border-slate-300 rounded transition-all duration-100"
                                                           >
                                                              Batal
                                                           </button>
                                                           <button 
                                                              onClick={(e) => { e.stopPropagation(); handleSaveEdit(layer.id); }}
                                                              className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-white bg-blue-600 hover:bg-blue-700 border border-blue-700 rounded transition-all duration-100"
                                                           >
                                                              Simpan
                                                           </button>
                                                        </div>
                                                     </div>
                                                  </div>
                                               ) : (
                                                  <>
                                                     <div className={`text-[10px] font-bold text-center py-1.5 px-2 rounded-sm border shadow-sm mb-1.5 transition-colors ${bgColor} ${textColor}`}>
                                                        {num}. {item.label}
                                                     </div>
                                                     {item.description && (
                                                        <p className="text-[10px] text-slate-900 mt-1 leading-snug border-l-[1.5px] border-slate-300 pl-2">
                                                           {item.description}
                                                        </p>
                                                     )}
                                                  </>
                                               )}
                                               
                                               <div className="mt-1 flex items-center justify-between">
                                                  {renderProvenanceBadge(item, cleanMode)}
                                               </div>
                                                  
                                               {!readonly && !editingId && (
                                                  <div className={cn(
                                                    "absolute top-0 right-0 flex items-center gap-0.5 bg-white/95 backdrop-blur-sm p-0.5 rounded shadow-sm border border-slate-200 transition-opacity duration-150 z-10", 
                                                    isSelected ? "opacity-100 pointer-events-auto" : "opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto"
                                                  )}>
                                                    <TooltipProvider delayDuration={400}>
                                                      <Tooltip>
                                                        <TooltipTrigger asChild>
                                                          <button 
                                                            onClick={(e) => { 
                                                               e.stopPropagation(); 
                                                               if (onSelectRow) onSelectRow(item.id);
                                                               setDetailItem({ layerId: layer.id, item: item });
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
                                                               setEditingId(item.id); 
                                                               setEditDraft({ label: item.label, description: item.description, status: item.status }); 
                                                            }}
                                                            className="p-1 rounded text-slate-500 hover:text-blue-600 hover:bg-blue-50 focus:outline-none"
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
                                                            onClick={(e) => { 
                                                               e.stopPropagation(); 
                                                               setItemToDelete({ layerId: layer.id, id: item.id, label: item.label }); 
                                                            }}
                                                            className="p-1 rounded text-slate-500 hover:text-red-600 hover:bg-red-50 focus:outline-none"
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
                                            </div>
                                         );
                                      })}
                                      {!readonly && !cleanMode && (
                                         <button 
                                            onClick={(e) => { 
                                               e.stopPropagation(); 
                                               setAddLayerId(layer.id);
                                               setAddLabel("");
                                               setAddDescription("");
                                               setAddStatus("non-conformity");
                                               setIsAddModalOpen(true);
                                            }}
                                            className="w-full mt-2 text-center py-2 text-[9px] font-bold text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors uppercase tracking-wider border border-dashed border-slate-300 hover:border-emerald-300 rounded"
                                         >
                                            + Tambah Data
                                         </button>
                                      )}
                                   </div>
                                </div>
                             );
                          })}
                       </div>

                       {/* Legend */}
                       <div className="flex items-center gap-6 mt-6 pt-4 border-t border-slate-200">
                          <div className="bg-[#091b4c] text-white text-[11px] font-bold px-8 py-1.5 rounded-sm uppercase tracking-wide">
                             Legend
                          </div>
                          <div className="flex items-center gap-6 text-[11px] font-bold text-slate-800">
                             <div className="flex items-center gap-2">
                                <div className="w-5 h-3 rounded-sm bg-red-600 border border-red-700"></div>
                                <span>Rootcause</span>
                             </div>
                             <div className="flex items-center gap-2">
                                <div className="w-5 h-3 rounded-sm bg-[#ffc000] border border-amber-500"></div>
                                <span>Non Conformity</span>
                             </div>
                             <div className="flex items-center gap-2">
                                <div className="w-5 h-3 rounded-sm bg-[#00c950] border border-emerald-600"></div>
                                <span>Improvement</span>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Right Detail Panel */}
        {detailItem && (
          <div className="w-[380px] shrink-0 border-l border-slate-200 bg-white h-full animate-in slide-in-from-right duration-300 flex flex-col z-20 shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)]">
            <IplsTraceabilityPanel 
              item={{...detailItem.item, layerId: detailItem.layerId}} 
              onClose={() => { setDetailItem(null); if(onSelectRow) onSelectRow(null); setEditingId(null); }}
              readonly={readonly}
              onEdit={() => { 
                setEditingId(detailItem.item.id); 
                setEditDraft({ label: detailItem.item.label, description: detailItem.item.description, status: detailItem.item.status }); 
              }} 
            />
          </div>
        )}
      </div>

      {/* Add Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Tambah Data IPLS</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase">Label / Fakta Singkat</label>
              <Input 
                value={addLabel}
                onChange={(e) => setAddLabel(e.target.value)}
                placeholder="Contoh: Unit LV overspeed..."
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase">Deskripsi Detail</label>
              <Textarea 
                value={addDescription}
                onChange={(e) => setAddDescription(e.target.value)}
                placeholder="Konteks tambahan mengenai fakta ini..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase">Status</label>
              <Select value={addStatus} onValueChange={setAddStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="improvement">Improvement / Need Enhancement</SelectItem>
                  <SelectItem value="non-conformity">Non-Conformity</SelectItem>
                  <SelectItem value="success">Success / Implemented</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Batal</Button>
            <Button onClick={handleAddItemSubmit} className="bg-emerald-600 hover:bg-emerald-700 text-white">Simpan Data</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Modal */}
      <Dialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-rose-600">HAPUS ITEM IPLS?</DialogTitle>
          </DialogHeader>
          <div className="py-2 text-sm text-slate-600 space-y-4">
            <p>Item ini akan dihapus dari analisis IPLS.</p>
            {itemToDelete && (
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-md text-xs">
                <div className="font-bold text-slate-700 mb-1">
                  Layer {itemToDelete.layerId}
                </div>
                <div className="text-slate-600">
                  {itemToDelete.label}
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
              Analisis IPLS · {auditLogs.length} aktivitas
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
                             {log.category}
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
                            "{log.after.label}"
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
}
