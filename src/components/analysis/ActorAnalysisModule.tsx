import React, { useState } from 'react';
import { 
  Users, User, ShieldAlert, CheckCircle2, AlertTriangle, 
  HelpCircle, Eye, Search, Filter, ShieldCheck, UserCog, UserCheck, 
  Activity, Calendar, MapPin, Tag, ChevronDown, ChevronRight, X, Pencil, Trash2
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Types matching the Output Contract
export interface ActorRegistryStatus {
  total_ccr_actors: number;
  total_fact_chronology_actors: number;
  total_system_actors: number;
  matched_actors: number;
  unmatched_ccr_actors: number;
  missing_from_ccr: number;
  predicted_actor_type_count: number;
  recommended_for_review_count: number;
  downstream_allowed_count: number;
  downstream_hold_for_review_count: number;
  confidence: "High" | "Medium" | "Low";
}

export interface ReviewRecommendation {
  recommended_for_review: boolean;
  review_priority: "High" | "Medium" | "Low" | "None";
  review_reason: string | null;
  downstream_usage: "allowed" | "allowed_with_note" | "hold_for_review";
  downstream_note: string | null;
}

import { ProvenanceData, ProvenanceBlock, AnnotationHistoryView } from "./FactChronologyModule";

// Module-level default: cleanMode is false unless overridden by component props
let cleanMode = false;

export interface ActorItem extends ProvenanceData {
  actor_id: string;
  beid: string | null;
  name: string;
  company: string | null;
  ccr_category: string | null;
  jabatan_struktural: string | null;
  involvement_level: string;
  actor_type_assignments: any[];
  identity_decomposition: any;
  role_crosscheck_decomposition: any;
  linked_events: any[];
  review_recommendation: ReviewRecommendation;
}

interface ActorAnalysisModuleProps {
  data: {
    actor_registry_status: ActorRegistryStatus;
    actor_registry: ActorItem[];
    crosscheck_findings: any;
  };
  onSelectActor: (actorId: string | null) => void;
  selectedActorId: string | null;
  onDeleteActor?: (id: string) => void;
  onUpdateActors?: (actors: ActorItem[]) => void;
  onLogAudit?: (desc: string) => void;
  readonly?: boolean;
  cleanMode?: boolean;
}

export const ActorAnalysisModule: React.FC<ActorAnalysisModuleProps> = ({ data, onSelectActor, selectedActorId, onDeleteActor, readonly = false,
  cleanMode = false }) => {
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [editingActorId, setEditingActorId] = useState<string | null>(null);
  const [editActorDraft, setEditActorDraft] = useState<Partial<ActorItem>>({});
  const [actors, setActors] = useState<ActorItem[]>(data.actor_registry);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addName, setAddName] = useState("");
  const [addCompany, setAddCompany] = useState("");
  const [addCcr, setAddCcr] = useState("");
  const [addInvolvement, setAddInvolvement] = useState("system_actor");

  React.useEffect(() => {
    setActors(data.actor_registry);
  }, [data.actor_registry]);

  const openAddModal = () => {
    setAddName("");
    setAddCompany("");
    setAddCcr("");
    setAddInvolvement("system_actor");
    setIsAddModalOpen(true);
  };

  const handleSaveNewActor = () => {
    const newActor: ActorItem = {
      actor_id: "new-actor-" + Date.now(),
      beid: "",
      name: addName || "New Actor",
      company: addCompany,
      ccr_category: addCcr,
      jabatan_struktural: "",
      involvement_level: addInvolvement,
      actor_type_assignments: [],
      identity_decomposition: {},
      role_crosscheck_decomposition: {},
      linked_events: [],
      review_recommendation: {
        recommended_for_review: false,
        review_priority: "None",
        review_reason: null,
        downstream_usage: "allowed",
        downstream_note: null
      }
    };
    const updatedActors = [...actors, newActor];
    setActors(updatedActors);
    setIsAddModalOpen(false);
    if (onUpdateActors) onUpdateActors(updatedActors);
    if (onLogAudit) onLogAudit(`Menambahkan aktor baru: ${newActor.name}`);
  };
  const { actor_registry_status, actor_registry } = data;

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header Summary */}
      {!cleanMode && (
      <div className="shrink-0 p-4 border-b border-slate-200 bg-white flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <UserCog className="h-4 w-4 text-slate-500" />
              Registri Aktor & Pemeriksaan Silang Peran
            </h2>
            <p className="text-[11px] text-slate-500 mt-1">Pencocokan identitas multi-sumber dan pemetaan batas tanggung jawab.</p>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <div className="flex flex-col items-end">
              <span className="text-slate-500 uppercase tracking-wider font-bold text-[9px]">Tingkat Keyakinan</span>
              <span className={cn(
                "font-bold",
                actor_registry_status.confidence === 'High' ? "text-emerald-600" :
                actor_registry_status.confidence === 'Medium' ? "text-amber-600" : "text-rose-600"
              )}>{actor_registry_status.confidence}</span>
            </div>
            <div className="h-6 w-px bg-slate-200 mx-2"></div>
            <div className="flex flex-col items-end">
              <span className="text-slate-500 uppercase tracking-wider font-bold text-[9px]">Cocok</span>
              <span className="font-bold text-slate-700">{actor_registry_status.matched_actors} / {actor_registry_status.total_ccr_actors}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3">
          <div className="bg-slate-50 border border-slate-200 p-3 rounded-none flex flex-col justify-center">
            <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Total Aktor CCR</div>
            <div className="text-lg font-black text-slate-800">{actor_registry_status.total_ccr_actors}</div>
          </div>
          <div className="bg-slate-50 border border-slate-200 p-3 rounded-none flex flex-col justify-center">
            <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Aktor Fakta Kronologi</div>
            <div className="text-lg font-black text-slate-800">{actor_registry_status.total_fact_chronology_actors}</div>
          </div>
          <div className="bg-amber-50 border border-amber-200 p-3 rounded-none flex flex-col justify-center">
            <div className="text-[9px] font-bold text-amber-600 uppercase tracking-wider mb-1">Perlu Ditinjau</div>
            <div className="text-lg font-black text-amber-700">{actor_registry_status.recommended_for_review_count}</div>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-none flex flex-col justify-center">
            <div className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider mb-1">Diizinkan ke Berikutnya</div>
            <div className="text-lg font-black text-emerald-700">{actor_registry_status.downstream_allowed_count}</div>
          </div>
        </div>
      </div>
      )}

      <div className={cn("flex-1 overflow-auto flex justify-center", cleanMode ? "bg-white p-0" : "bg-slate-50 p-4 lg:p-8 scrollbar-thin")}>
        <div className={cn("w-full max-w-[1300px] h-fit shrink-0", cleanMode ? "bg-white border-0 shadow-none p-0" : "bg-white border border-slate-300 shadow-sm p-8")}>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200">
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest w-1/4">Identitas Aktor</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest w-1/4">Kategori CCR / Peran</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tingkat Keterlibatan</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center w-24">Penggunaan</th>
              </tr>
            </thead>
            <tbody>
              {actors.map((actor, idx) => {
                const isSelected = selectedActorId === actor.actor_id;
                const rec = actor.review_recommendation;
                return (
                  <tr 
                    key={actor.actor_id || idx}
                    onClick={() => {
                      if (!readonly) onSelectActor(actor.actor_id);
                    }}
                    onDoubleClick={() => {
                      if (!readonly) {
                        setEditingActorId(actor.actor_id);
                        setEditActorDraft(actor);
                      }
                    }}
                    className={cn(
                      "border-b border-slate-100 transition-colors cursor-pointer group",
                      isSelected ? "bg-blue-50/50 hover:bg-blue-50" : "hover:bg-slate-50"
                    )}
                  >
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1 relative">
                        <div className="flex items-center gap-2">
                          <span className="text-[12.5px] font-bold text-slate-800">{actor.name}</span>
                          {!cleanMode && actor.provenanceType === 'AI_HUMAN_ANNOTATED' && (
                            <span className="text-[8px] font-black uppercase text-blue-500 tracking-widest bg-blue-50 px-1 py-0.5 rounded" title="Human Annotated">Human Annotated &middot; {actor.humanAnnotationCount}&times;</span>
                          )}
                          {!cleanMode && actor.provenanceType === 'HUMAN_MANUAL' && (
                            <span className="text-[8px] font-black uppercase text-emerald-500 tracking-widest bg-emerald-50 px-1 py-0.5 rounded" title="Added Manually">Added Manually</span>
                          )}
                          {!cleanMode && (!actor.provenanceType || actor.provenanceType === 'AI_GENERATED') && (
                            <span className="text-[8px] font-black uppercase text-indigo-400 tracking-widest bg-indigo-50/50 px-1 py-0.5 rounded" title="AI Generated">AI Generated</span>
                          )}
                        </div>
                        {(actor.beid || actor.company) && (
                          <span className="text-[10px] text-slate-500 font-mono">
                            {actor.beid ? `${actor.beid}` : ''} {actor.beid && actor.company ? '•' : ''} {actor.company || ''}
                          </span>
                        )}
                        <div className="absolute top-0 right-0 flex items-center gap-2">
                          {!readonly && (
                            deleteConfirmId === String(actor.actor_id || idx) ? (
                              <div className="flex items-center gap-1.5 animate-in fade-in bg-white p-1 rounded shadow-sm border border-slate-200" onClick={(e) => e.stopPropagation()}>
                                <span className="text-[10px] font-bold text-red-600 mr-1 whitespace-nowrap">Yakin hapus?</span>
                                <button className="px-2 py-1 bg-red-600 text-white rounded text-[10px] font-bold hover:bg-red-700 shadow-sm" onClick={(e) => { e.stopPropagation(); onDeleteActor?.(String(actor.actor_id || idx)); if (onLogAudit) onLogAudit(`Menghapus data aktor (ID: ${actor.actor_id || idx})`); setDeleteConfirmId(null); }}>Ya</button>
                                <button className="px-2 py-1 bg-slate-200 text-slate-800 rounded text-[10px] font-bold hover:bg-slate-300 shadow-sm" onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(null); }}>Batal</button>
                              </div>
                            ) : (
                              <>
                                <span className="opacity-0 group-hover:opacity-100 transition-all duration-200 text-[9px] text-blue-600 font-bold bg-blue-50/80 px-2 py-1 rounded border border-blue-200/60 flex items-center gap-1.5 shadow-sm active:scale-95">
                                  <Pencil className="h-2.5 w-2.5" /> Double-click to edit
                                </span>
                                <button 
                                  className="opacity-0 group-hover:opacity-100 transition-all duration-200 text-slate-400 hover:text-red-500 hover:bg-red-50 p-1 rounded shadow-sm bg-white border border-slate-200"
                                  onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(String(actor.actor_id || idx)); }}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </>
                            )
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <span className="text-[11.5px] text-slate-700 font-medium">{actor.ccr_category || '-'}</span>
                        {actor.jabatan_struktural && (
                          <span className="text-[10px] text-slate-500">{actor.jabatan_struktural}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] font-bold tracking-wider uppercase bg-slate-100 text-slate-600 border border-slate-200">
                        {actor.involvement_level?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {rec.downstream_usage === 'allowed' ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="inline-flex h-6 w-6 items-center justify-center bg-emerald-100 text-emerald-600 rounded-sm">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="left" className="text-[10px]">Diizinkan ke Tahap Berikut (PEEPO/IPLS)</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : rec.downstream_usage === 'allowed_with_note' ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="inline-flex h-6 w-6 items-center justify-center bg-amber-100 text-amber-600 rounded-sm">
                                <AlertTriangle className="h-3.5 w-3.5" />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="left" className="text-[10px]">{rec.downstream_note}</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="inline-flex h-6 w-6 items-center justify-center bg-rose-100 text-rose-600 rounded-sm">
                                <ShieldAlert className="h-3.5 w-3.5" />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="left" className="text-[10px]">Tahan untuk Ditinjau</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </td>
                  </tr>
                );
              })}
              {!readonly && (
                <tr>
                  <td colSpan={4} className="px-0 py-0 border-b border-slate-100">
                    <button 
                      onClick={() => {
                        const newActor = {
                          actor_id: "new-actor-" + Date.now(),
                          beid: "",
                          name: "New Actor",
                          company: "",
                          ccr_category: "",
                          jabatan_struktural: "",
                          involvement_level: "system_actor",
                          actor_type_assignments: [],
                          identity_decomposition: {},
                          role_crosscheck_decomposition: {},
                          linked_events: [],
                          review_recommendation: {
                            recommended_for_review: false,
                            review_priority: "None" as const,
                            review_reason: null,
                            downstream_usage: "allowed" as const,
                            downstream_note: null
                          }
                        };
                        if (onUpdateActors) onUpdateActors([...data.actor_registry, newActor]);
                      }}
                      className="w-full text-center py-2 text-[11px] font-bold text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors uppercase tracking-widest bg-slate-50/50 hover:border-emerald-200 border border-transparent"
                    >
                      + Tambah Aktor
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Add Actor Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Tambah Data Aktor Baru</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700 uppercase">Nama Aktor</label>
              <Input 
                value={addName} 
                onChange={(e) => setAddName(e.target.value)} 
                placeholder="Nama lengkap" 
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700 uppercase">Perusahaan / Afiliasi</label>
              <Input 
                value={addCompany} 
                onChange={(e) => setAddCompany(e.target.value)} 
                placeholder="Contoh: PT BUMA" 
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700 uppercase">Kategori CCR / Peran</label>
              <Input 
                value={addCcr} 
                onChange={(e) => setAddCcr(e.target.value)} 
                placeholder="Contoh: Operator / Pengawas" 
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700 uppercase">Tingkat Keterlibatan</label>
              <Select value={addInvolvement} onValueChange={setAddInvolvement}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih tingkat keterlibatan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="direct_actor">Direct Actor</SelectItem>
                  <SelectItem value="indirect_actor">Indirect Actor</SelectItem>
                  <SelectItem value="system_actor">System Actor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Batal</Button>
            <Button onClick={handleSaveNewActor} className="bg-blue-600 hover:bg-blue-700 text-white">Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export const ActorDetailPanel: React.FC<{ actor: ActorItem, onClose: () => void }> = ({ actor, onClose }) => {
  const [showHistory, setShowHistory] = useState(false);
  return (
    <div className="flex flex-col h-full bg-slate-50 w-[420px] shrink-0 border-l border-slate-200 shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.1)] z-20 animate-in slide-in-from-right duration-300 relative overflow-hidden">
      {showHistory && <AnnotationHistoryView item={actor as any} onClose={() => setShowHistory(false)} />}
      <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-white">
        <div>
          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
            <UserCog className="h-3 w-3" />
            DEKOMPOSISI AKTOR
          </div>
          <h3 className="text-sm font-bold text-slate-800">{actor.name}</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0 hover:bg-slate-100 rounded-sm">
          <X className="h-4 w-4 text-slate-500" />
        </Button>
      </div>
      
      <div className="px-4 pt-2 bg-white border-b border-slate-200">
        <ProvenanceBlock item={actor} onOpenHistory={() => setShowHistory(true)} />
      </div>

      <div className="flex-1 overflow-auto scrollbar-thin">
        {/* Identity Decomposition */}
        <div className="p-4 border-b border-slate-200">
          <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Dekomposisi Identitas</h4>
          <div className="bg-white border border-slate-200 rounded-none shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <tbody>
                {['subject', 'action', 'object', 'source_system', 'condition'].map((key) => {
                  const val = actor.identity_decomposition?.[key]?.value;
                  if (!val) return null;
                  return (
                    <tr key={key} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                      <td className="px-3 py-2 text-[9px] font-bold text-slate-400 uppercase tracking-wider w-24 bg-slate-50/50 border-r border-slate-100 align-top">
                        {key.replace('_', ' ')}
                      </td>
                      <td className="px-3 py-2 text-[11.5px] text-slate-700 font-medium leading-relaxed align-top">
                        {val}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Role Crosscheck */}
        <div className="p-4 border-b border-slate-200">
          <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Pemeriksaan Silang Peran</h4>
          <div className="bg-white border border-slate-200 rounded-none shadow-sm p-3 flex flex-col gap-3">
            <div>
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Klaim Peran CCR</div>
              <div className="text-[11.5px] text-slate-700 font-medium">{actor.role_crosscheck_decomposition?.ccr_role_claim?.value || '-'}</div>
            </div>
            <div className="h-px bg-slate-100 w-full" />
            <div>
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Observasi Peran Kronologi</div>
              <div className="text-[11.5px] text-slate-700 font-medium">{actor.role_crosscheck_decomposition?.chronology_role_observation?.value || '-'}</div>
            </div>
            <div className="h-px bg-slate-100 w-full" />
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Hasil Kecocokan</span>
              <span className={cn(
                "inline-flex items-center px-1.5 py-0.5 rounded-sm text-[9px] font-bold tracking-wider uppercase border",
                actor.role_crosscheck_decomposition?.match_result?.value === 'Matched' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                actor.role_crosscheck_decomposition?.match_result?.value === 'Role Conflict' ? "bg-rose-50 text-rose-700 border-rose-200" :
                "bg-slate-50 text-slate-700 border-slate-200"
              )}>
                {actor.role_crosscheck_decomposition?.match_result?.value || '-'}
              </span>
            </div>
          </div>
        </div>

        {/* Linked Events summary */}
        {actor.linked_events && actor.linked_events.length > 0 && (
          <div className="p-4">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Keterlibatan Kejadian ({actor.linked_events.length})</h4>
            <div className="flex flex-col gap-2">
              {actor.linked_events.map((event: any, idx: number) => (
                <div key={idx} className="bg-white border border-slate-200 rounded-none shadow-sm p-3 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className={cn(
                      "inline-flex items-center px-1.5 py-0.5 rounded-sm text-[8px] font-bold tracking-wider uppercase border",
                      event.phase === 'PRA_KONTAK' ? "bg-amber-50 text-amber-600 border-amber-200" :
                      event.phase === 'KONTAK' ? "bg-rose-50 text-rose-600 border-rose-200" :
                      "bg-blue-50 text-blue-600 border-blue-200"
                    )}>
                      {event.phase?.replace('_', ' ')}
                    </span>
                    <span className="text-[9px] font-mono text-slate-400">{event.time}</span>
                  </div>
                  <div className="text-[11px] text-slate-700 leading-relaxed font-medium">
                    {event.action_summary}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {/* Add Actor Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Tambah Data Aktor Baru</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700 uppercase">Nama Aktor</label>
              <Input 
                value={addName} 
                onChange={(e) => setAddName(e.target.value)} 
                placeholder="Nama lengkap" 
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700 uppercase">Perusahaan / Afiliasi</label>
              <Input 
                value={addCompany} 
                onChange={(e) => setAddCompany(e.target.value)} 
                placeholder="Contoh: PT BUMA" 
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700 uppercase">Kategori CCR / Peran</label>
              <Input 
                value={addCcr} 
                onChange={(e) => setAddCcr(e.target.value)} 
                placeholder="Contoh: Operator / Pengawas" 
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700 uppercase">Tingkat Keterlibatan</label>
              <Select value={addInvolvement} onValueChange={setAddInvolvement}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih tingkat keterlibatan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="direct_actor">Direct Actor</SelectItem>
                  <SelectItem value="indirect_actor">Indirect Actor</SelectItem>
                  <SelectItem value="system_actor">System Actor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Batal</Button>
            <Button onClick={handleSaveNewActor} className="bg-blue-600 hover:bg-blue-700 text-white">Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};








