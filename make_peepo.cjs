const fs = require('fs');

const peepoCode = `import React, { useState, useMemo } from 'react';
import { 
  LayoutGrid, 
  History,
  Pencil,
  Trash2,
  Check,
  X,
  User,
  Brain,
  CheckCircle2,
  Search,
  Loader2,
  PanelRightOpen,
  XCircle,
  FileText
} from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Similar AuditEntry as FactChronology
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

export const PeepoAnalysisModule: React.FC<PeepoAnalysisModuleProps> = ({
  data,
  readonly = false,
  onSelectRow,
  selectedRowId,
  onSync
}) => {
  const [internalData, setInternalData] = useState<PeepoData>(data);
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);
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

  React.useEffect(() => {
    setInternalData(data);
  }, [data]);

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
      [addCategory]: [...(internalData[addCategory as keyof PeepoData] as PeepoItem[] || []), newItem]
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
    const itemIndex = categoryArray.findIndex(i => i.id === editingId);
    if (itemIndex === -1) return;
    
    const oldItem = categoryArray[itemIndex];
    if (oldItem.chronology_text === editText) {
      setEditingId(null);
      return;
    }
    
    const newItem = {
      ...oldItem,
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
    const itemIndex = categoryArray.findIndex(i => i.id === itemToDelete.id);
    if (itemIndex === -1) return;
    
    const oldItem = categoryArray[itemIndex];
    
    const updatedArray = categoryArray.filter(i => i.id !== itemToDelete.id);
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
    <div className="flex h-full bg-white relative overflow-hidden transition-all duration-300">
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        <div className="shrink-0 p-4 border-b border-slate-200 bg-white flex flex-col gap-4 z-10 shadow-sm">
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
                <div className="flex items-center gap-2">
                   <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
                   <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Sintesis Selesai</span>
                </div>
              </div>
           </div>
        </div>
        
        <div className="flex-1 overflow-auto bg-slate-50 p-8 flex justify-center scrollbar-thin">
           <div className="w-full max-w-[1300px] bg-white border border-slate-300 shadow-sm p-8 pb-16 h-fit shrink-0 space-y-8">
              {CATEGORIES.map((section) => (
                 <div key={section.id} className="space-y-3">
                    <div className="flex items-center gap-3">
                       <span className="px-2.5 py-1 rounded text-[9px] font-black text-white uppercase tracking-widest bg-slate-900">
                          {section.label}
                       </span>
                       <div className="h-px flex-1 bg-slate-200" />
                    </div>
                    <div className="bg-white border-l border-t border-slate-200 overflow-hidden shadow-sm">
                       <table className="w-full text-left border-collapse">
                          <thead>
                             <tr className="bg-slate-50/80">
                                <th className="px-5 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest border-r border-b border-slate-200 bg-slate-50/30">TEMUAN</th>
                             </tr>
                          </thead>
                          <tbody>
                             {(internalData[section.id as keyof PeepoData] as PeepoItem[] || []).map((item, idx) => {
                                const itemId = item.id || \`\${section.id}-\${idx}\`;
                                const isSelected = selectedRowId === itemId;
                                const isEditingInline = editingId === itemId;
                                
                                return (
                                   <tr 
                                      key={itemId} 
                                      onClick={() => {
                                         onSelectRow(itemId);
                                         setDetailItem({ id: itemId, category: section.id, text: item.chronology_text || (item as any).label || (item as any) });
                                      }}
                                      onDoubleClick={() => {
                                        if (readonly) return;
                                        setEditingId(itemId);
                                        setEditingCategory(section.id);
                                        setEditText(item.chronology_text || (item as any).label || (item as any));
                                      }}
                                      className={cn(
                                         "group transition-all cursor-pointer",
                                         isSelected ? "bg-blue-50/50 border-l-2 border-l-blue-500" : "hover:bg-slate-50/50 border-l-2 border-l-transparent"
                                      )}
                                   >
                                      <td className="px-5 py-4 align-top border-r border-b border-slate-200 relative">
                                         {isEditingInline ? (
                                            <div className="flex flex-col gap-2">
                                              <Textarea 
                                                value={editText}
                                                onChange={e => setEditText(e.target.value)}
                                                className="min-h-[80px] text-[11px] font-bold"
                                                autoFocus
                                                onClick={e => e.stopPropagation()}
                                              />
                                              <div className="flex gap-2 justify-end">
                                                <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); setEditingId(null); }}>Batal</Button>
                                                <Button size="sm" onClick={(e) => { e.stopPropagation(); handleSaveEdit(); }} className="bg-blue-600 hover:bg-blue-700 text-white">Simpan</Button>
                                              </div>
                                            </div>
                                         ) : (
                                            <>
                                              <p className={cn(
                                                 "text-[11px] font-bold leading-relaxed pr-8",
                                                 isSelected ? "text-slate-900" : "text-slate-700"
                                              )}>
                                                 {item.chronology_text || (item as any).label || (item as any)}
                                              </p>
                                              {!readonly && (
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                                                   <span className="text-[9px] text-blue-600 font-bold bg-blue-50/80 px-2 py-1 rounded border border-blue-200/60 flex items-center gap-1.5 shadow-sm">
                                                      <Pencil className="h-2.5 w-2.5" /> Double-click to edit
                                                   </span>
                                                   <button 
                                                      className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded"
                                                      onClick={(e) => { 
                                                        e.stopPropagation(); 
                                                        setItemToDelete({ id: itemId, category: section.id, text: item.chronology_text || (item as any) }); 
                                                      }}
                                                   >
                                                      <Trash2 className="h-3.5 w-3.5" />
                                                   </button>
                                                </div>
                                              )}
                                            </>
                                         )}
                                      </td>
                                   </tr>
                                );
                             })}
                             {!readonly && (
                               <tr>
                                   <td className="px-0 py-0 border-r border-b border-slate-200 relative">
                                     <button 
                                       onClick={(e) => { 
                                         e.stopPropagation(); 
                                         setAddCategory(section.id);
                                         setAddText("");
                                         setIsAddModalOpen(true);
                                       }}
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
              ))}

              {/* Summary & Synthesis Indicator */}
              <div className="grid grid-cols-2 gap-6 pt-4">
                 <div className="bg-white border-l border-t border-slate-200 p-6 shadow-sm rounded-sm">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Ringkasan Analisis</span>
                    <p className="text-[11px] font-bold text-slate-600 leading-relaxed italic">"{internalData.ringkasan}"</p>
                 </div>
                 <div className="bg-slate-900 p-6 shadow-sm border border-slate-800 rounded-sm">
                    <span className="text-[9px] font-black text-emerald-400/50 uppercase tracking-widest block mb-2">Kecerdasan Sintesis</span>
                    <p className="text-[11px] font-black text-white uppercase tracking-tight leading-relaxed">{internalData.synthesis}</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
      
      {/* Right Detail Panel */}
      {detailItem && (
        <div className="w-[420px] shrink-0 border-l border-slate-200 bg-white h-full animate-in slide-in-from-right duration-300 flex flex-col z-20 shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)]">
          <div className="h-14 border-b border-slate-200 flex items-center justify-between px-4 bg-slate-50/50 shrink-0">
             <div className="flex items-center gap-2">
                <PanelRightOpen className="h-4 w-4 text-slate-500" />
                <span className="text-xs font-bold text-slate-700 uppercase tracking-widest">Detail PEEPO</span>
             </div>
             <button 
                onClick={() => { setDetailItem(null); onSelectRow(null); }}
                className="h-8 w-8 rounded-md flex items-center justify-center text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors"
             >
                <X className="h-4 w-4" />
             </button>
          </div>
          
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Kategori</label>
                <div className="px-3 py-1.5 bg-slate-900 text-white rounded text-[11px] font-black uppercase tracking-widest inline-block">
                  {CATEGORIES.find(c => c.id === detailItem.category)?.label}
                </div>
              </div>
              
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Teks Temuan</label>
                {editingId === detailItem.id ? (
                  <div className="flex flex-col gap-2">
                    <Textarea 
                      value={editText}
                      onChange={e => setEditText(e.target.value)}
                      className="min-h-[120px] text-[12px] font-medium leading-relaxed"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleSaveEdit} className="bg-blue-600 hover:bg-blue-700 text-white">Simpan</Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>Batal</Button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-md">
                    <p className="text-[12px] font-medium leading-relaxed text-slate-800">{detailItem.text}</p>
                    {!readonly && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="mt-3 text-[10px] font-bold text-blue-600 h-7 px-2"
                        onClick={() => {
                          setEditingId(detailItem.id);
                          setEditingCategory(detailItem.category);
                          setEditText(detailItem.text);
                        }}
                      >
                        <Pencil className="h-3 w-3 mr-1.5" /> Edit Konten
                      </Button>
                    )}
                  </div>
                )}
              </div>
              
              <div className="pt-6 border-t border-slate-100">
                <div className="flex items-center gap-2 text-slate-400 text-[10px] font-medium">
                   <FileText className="h-3 w-3" /> ID Ref: {detailItem.id}
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>
      )}

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
          <div className="py-2 text-sm text-slate-600 space-y-4">
            <p>Item ini akan dihapus dari analisis aktif.</p>
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
            <Button onClick={confirmDelete} className="bg-rose-600 hover:bg-rose-700 text-white">Hapus</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Audit Drawer */}
      <Sheet open={isAuditDrawerOpen} onOpenChange={setIsAuditDrawerOpen}>
        <SheetContent className="w-full sm:max-w-[480px] p-0 flex flex-col bg-slate-50 border-l border-slate-300 shadow-xl overflow-hidden">
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
\`

fs.writeFileSync('src/components/analysis/PeepoAnalysisModule.tsx', peepoCode);
console.log('PeepoAnalysisModule.tsx created successfully');
