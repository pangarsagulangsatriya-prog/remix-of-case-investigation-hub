import React, { useState, useEffect } from "react";
import { Play, Network, Clock, Users, Database, Shield, ChevronRight, CheckCircle2, Lock } from "lucide-react";
import { AgentState } from "@/types/workspace";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface AnalysisEmptyStateProps {
  agents: AgentState[];
  globalStatus: "idle" | "running" | "blocked" | "completed" | "stopped" | "failed" | "paused";
  onStartAll: () => void;
  onSelectAgent: (id: string) => void;
  hoveredAgentId: string | null;
  setHoveredAgentId: (id: string | null) => void;
}

const AGENT_ORDER = ['fact', 'actor', 'peepo', 'ipls', 'prev'];

const STAGE_LABELS: Record<string, string> = {
  fact: "Fakta & Kronologi",
  actor: "Analisis Aktor",
  peepo: "Faktor PEEPO",
  ipls: "Lapisan IPLS",
  prev: "Rencana Pencegahan"
};

const STAGE_DESC: Record<string, string> = {
  fact: "Menyusun urutan kejadian dari evidence.",
  actor: "Mengidentifikasi pihak yang terlibat.",
  peepo: "Mengelompokkan faktor investigasi.",
  ipls: "Memetakan temuan ke lapisan pertahanan.",
  prev: "Menyusun tindakan perbaikan dan pencegahan."
};

const renderNode = (
  id: string, 
  agents: AgentState[], 
  hoveredAgentId: string | null, 
  setHoveredAgentId: (id: string | null) => void,
  isPreparing: boolean,
  prepStage: string | null,
  isLayered = false,
  isTerminal = false
) => {
  const isHovered = hoveredAgentId === id;
  const isPrepActive = prepStage === id;
  const orderIdx = AGENT_ORDER.indexOf(id);
  const hoverIdx = hoveredAgentId ? AGENT_ORDER.indexOf(hoveredAgentId) : -1;
  const isUpstream = hoverIdx !== -1 && orderIdx <= hoverIdx;
  const isCompleted = agents.find(a => a.id === id)?.status === 'completed';
  
  return (
    <div 
       key={id}
       className="flex flex-col w-[110px] cursor-default group relative z-10 shrink-0"
       onMouseEnter={() => !isPreparing && setHoveredAgentId(id)}
       onMouseLeave={() => !isPreparing && setHoveredAgentId(null)}
    >
       <div className={cn(
          "h-12 rounded-xl border flex items-center justify-center transition-all duration-300 relative overflow-hidden bg-white mb-2 shadow-sm",
          isLayered ? "border-slate-300 rounded-md" : "",
          isTerminal ? "border-slate-300 rounded-full" : "",
          isHovered ? "border-indigo-400 shadow-md ring-2 ring-indigo-50 -translate-y-0.5" : 
          isPrepActive ? "border-indigo-500 shadow-lg bg-indigo-50/80 -translate-y-1" : 
          isUpstream ? "border-indigo-200 bg-indigo-50/40" :
          isCompleted ? "border-emerald-200 bg-emerald-50/30" :
          "border-slate-200 group-hover:border-slate-300"
       )}>
          {/* Inner geometry */}
          {isLayered ? (
             <div className="flex flex-col gap-1 w-full px-3">
                <div className={cn("h-1 w-full rounded-sm transition-colors", (isHovered || isUpstream) ? "bg-indigo-300" : isCompleted ? "bg-emerald-300" : "bg-slate-200")} />
                <div className={cn("h-1 w-4/5 rounded-sm transition-colors", (isHovered || isUpstream) ? "bg-indigo-400" : isCompleted ? "bg-emerald-400" : "bg-slate-300")} />
                <div className={cn("h-1 w-full rounded-sm transition-colors", (isHovered || isUpstream) ? "bg-indigo-500" : isCompleted ? "bg-emerald-500" : "bg-slate-400")} />
             </div>
          ) : isTerminal ? (
             <div className={cn(
                "h-4 w-4 rounded-[3px] rotate-45 transition-colors",
                isHovered ? "bg-emerald-500" : isUpstream ? "bg-indigo-500" : isCompleted ? "bg-emerald-500" : "bg-slate-300"
             )} />
          ) : (
             <div className={cn(
                "h-3 w-3 rounded-[3px] transition-colors",
                (isHovered || isUpstream) ? "bg-indigo-500" : isCompleted ? "bg-emerald-500" : "bg-slate-300"
             )} />
          )}
          
          {isPrepActive && <div className="absolute inset-0 bg-indigo-500/10 animate-pulse" />}
       </div>
       
       <div className="flex flex-col px-1 -mx-1 rounded-md text-center">
          <span className={cn(
             "text-[10px] font-extrabold transition-colors duration-200 leading-tight mb-1 uppercase tracking-tight",
             (isHovered || isUpstream || isPrepActive) ? "text-indigo-900" : "text-slate-800"
          )}>
             {STAGE_LABELS[id]}
          </span>
          <span className={cn(
             "text-[9px] transition-colors duration-200 leading-tight",
             (isHovered || isUpstream || isPrepActive) ? "text-indigo-700/80" : "text-slate-500"
          )}>
             {STAGE_DESC[id]}
          </span>
       </div>
    </div>
  );
};

export function AnalysisEmptyState({
  agents,
  globalStatus,
  onStartAll,
  onSelectAgent,
  hoveredAgentId,
  setHoveredAgentId
}: AnalysisEmptyStateProps) {
  const [isPreparing, setIsPreparing] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [prepStage, setPrepStage] = useState<string | null>(null);
  const hasAnyCompleted = agents.some(a => a.status === 'completed');
  const allCompleted = agents.length > 0 && agents.every(a => a.status === 'completed');

  useEffect(() => {
    // Trigger entrance animation once
    const t = setTimeout(() => setShowIntro(true), 100);
    return () => clearTimeout(t);
  }, []);

  const handleStartAll = () => {
    if (isPreparing) return;
    setIsPreparing(true);
    setPrepStage('fact'); // Briefly activate first stage
    // Add small delay to show "Menyiapkan analisis..." before executing
    setTimeout(() => {
      onStartAll();
    }, 450);
  };

  // State C: Workspace Loading
  if (agents.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center space-y-4 max-w-sm mx-auto h-full animate-in fade-in">
        <div className="flex flex-col space-y-2 w-full max-w-[200px]">
          <div className="h-4 w-full bg-slate-100 rounded animate-pulse" />
          <div className="h-4 w-3/4 bg-slate-100 rounded animate-pulse" />
          <div className="h-4 w-5/6 bg-slate-100 rounded animate-pulse" />
        </div>
        <p className="text-[11px] text-slate-400 uppercase tracking-widest font-bold mt-4">Memuat status analisis...</p>
      </div>
    );
  }

  // Setup state checks
  const completedAgents = AGENT_ORDER.filter(id => agents.find(a => a.id === id)?.status === 'completed');
  const lastResultId = completedAgents[completedAgents.length - 1] || 'fact';
  const activeResults = agents.filter(a => a.status === 'completed').length;

  return (
    <div className="flex w-full max-w-[860px] mx-auto gap-12 items-center transition-all duration-300 relative z-10" style={{ marginTop: '12vh' }}>
      
      {/* LEFT PANEL */}
      <div className="flex-1 max-w-[360px] flex flex-col">
        <div className={cn(
          "h-12 w-12 border rounded-xl shadow-sm flex items-center justify-center mb-6 transition-all duration-500",
          showIntro ? "opacity-100 scale-100" : "opacity-0 scale-95",
          hasAnyCompleted ? "bg-emerald-50 border-emerald-200" : "bg-slate-50 border-slate-200"
        )}>
          {hasAnyCompleted ? (
            <CheckCircle2 className="h-6 w-6 text-emerald-500 stroke-[1.5]" />
          ) : (
            <Network className="h-6 w-6 text-slate-500 stroke-[1.5]" />
          )}
        </div>
        <div className={cn(
           "transition-all duration-500 delay-100",
           showIntro ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        )}>
          <h2 className="text-[20px] font-extrabold text-slate-900 tracking-tight mb-2">
            {hasAnyCompleted ? "Hasil analisis tersedia" : "Mulai analisis investigasi"}
          </h2>
          <p className="text-[13px] text-slate-500 max-w-[320px] leading-relaxed mb-4">
            {hasAnyCompleted 
               ? (allCompleted ? `Seluruh ${activeResults} tahap analisis telah selesai dijalankan.` : `Beberapa tahap analisis telah selesai. Pilih tahap untuk melihat hasil.`)
               : "Jalankan rangkaian analisis berdasarkan evidence yang tersedia."}
          </p>
          
          {/* Readiness Strip */}
          <div className="flex items-center gap-3 mb-8">
             {hasAnyCompleted ? (
               <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md border border-emerald-100">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">{activeResults} Tahap Selesai</span>
               </div>
             ) : (
               <>
                 <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md border border-emerald-100">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">5 Tahap Siap</span>
                 </div>
                 <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md border border-blue-100">
                    <Database className="h-3.5 w-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Evidence Tersedia</span>
                 </div>
               </>
             )}
          </div>

          <div className="flex flex-wrap gap-3">
             {hasAnyCompleted && (
                <button 
                  onClick={() => onSelectAgent(lastResultId)}
                  className="group flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-md text-[13px] font-bold shadow-md hover:bg-slate-800 hover:shadow-lg hover:-translate-y-px active:translate-y-0 active:shadow-sm transition-all"
                >
                  {allCompleted ? "Buka Hasil Terakhir" : "Lihat Hasil Terakhir"}
                </button>
             )}

             <AlertDialog>
               <AlertDialogTrigger asChild>
                 <button 
                   disabled={isPreparing}
                   className={cn(
                     "group flex items-center gap-2 px-6 py-2.5 rounded-md text-[13px] font-bold shadow-md transition-all disabled:opacity-80 justify-center",
                     hasAnyCompleted 
                        ? "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                        : "bg-slate-900 text-white hover:bg-slate-800 hover:shadow-lg hover:-translate-y-px active:translate-y-0 active:shadow-sm min-w-[180px]"
                   )}
                 >
                   {isPreparing ? (
                     <span className="flex items-center gap-2 animate-in fade-in duration-200">Menyiapkan...</span>
                   ) : (
                     <span className="flex items-center gap-2 animate-in fade-in duration-200">
                        {!hasAnyCompleted && <Play className="h-3.5 w-3.5 fill-current transition-transform duration-200 group-hover:translate-x-0.5" />} 
                        {hasAnyCompleted ? "Jalankan Ulang" : "Mulai Semua"}
                     </span>
                   )}
                 </button>
               </AlertDialogTrigger>
               <AlertDialogContent>
                 <AlertDialogHeader>
                   <AlertDialogTitle>
                      {hasAnyCompleted ? "Jalankan Ulang Orkestrasi?" : "Mulai Orkestrasi Analisis?"}
                   </AlertDialogTitle>
                   <AlertDialogDescription>
                     {hasAnyCompleted 
                        ? "Sistem akan menjalankan ulang analisis untuk seluruh tahap investigasi dan mengganti hasil yang sudah ada. Apakah Anda yakin?"
                        : "Sistem akan menjalankan analisis berurutan untuk seluruh tahap investigasi, dimulai dari Fakta & Kronologi hingga Rencana Pencegahan. Apakah Anda yakin ingin memulai proses ini?"}
                   </AlertDialogDescription>
                 </AlertDialogHeader>
                 <AlertDialogFooter>
                   <AlertDialogCancel>Batal</AlertDialogCancel>
                   <AlertDialogAction onClick={() => {
                     setIsPreparing(true);
                     setPrepStage('fact');
                     setTimeout(() => {
                       onStartAll();
                       onSelectAgent('fact');
                     }, 450);
                   }}>
                     Lanjutkan
                   </AlertDialogAction>
                 </AlertDialogFooter>
               </AlertDialogContent>
             </AlertDialog>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className={cn(
         "flex-[1.2] bg-white/70 backdrop-blur-md border border-slate-200/80 rounded-2xl p-8 shadow-[0_8px_30px_rgba(0,0,0,0.03)] transition-all duration-700 delay-200 relative overflow-hidden",
         showIntro ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}>
         {/* Subtle domain map background */}
         <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />
         <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.04)_0%,transparent_70%)] rounded-full blur-3xl pointer-events-none" />
         
         <div className="relative z-10 flex flex-col h-full">
            <div className="mb-8">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1 block">Alur Orkestrasi</span>
               <span className="text-[11px] text-slate-500 block max-w-[280px]">Evidence diproses berurutan menjadi struktur hasil analisis investigasi.</span>
            </div>
            
            {/* Map container */}
            <div className="flex-1 flex flex-col relative gap-8">
               
               {/* LAYER 1: DATA & RECONSTRUCTION */}
               <div className="flex items-center gap-4 relative">
                  
                  {/* Evidence Input Node */}
                  <div className="flex flex-col w-[110px] bg-slate-50 border border-slate-200/70 p-2.5 rounded-xl shadow-sm relative group z-10 shrink-0">
                     <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                        <Database className="h-3 w-3" /> Input Evidence
                     </span>
                     <div className="flex flex-wrap gap-1.5">
                        {['CCTV', 'Foto', 'Audio', 'File'].map((tok, i) => (
                           <div key={tok} className={cn(
                              "px-1.5 py-0.5 rounded-[4px] border border-slate-200 bg-white shadow-sm text-[8px] font-bold text-slate-600 transition-all duration-500",
                              showIntro ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
                              (hoveredAgentId || isPreparing) ? "border-indigo-300 text-indigo-700 bg-indigo-50" : ""
                           )} style={{ transitionDelay: `${300 + (i * 50)}ms` }}>
                              {tok}
                           </div>
                        ))}
                     </div>
                     {/* Connector out */}
                     <div className={cn(
                        "absolute top-1/2 -right-4 w-4 h-[2px] transition-colors duration-300",
                        (hoveredAgentId || isPreparing) ? "bg-indigo-400" : "bg-slate-200"
                     )} />
                  </div>

                  <ChevronRight className="h-4 w-4 text-slate-300 mx-[-4px] shrink-0" />

                  {/* Fact Node */}
                  {renderNode('fact', agents, hoveredAgentId, setHoveredAgentId, isPreparing, prepStage)}

                  <ChevronRight className="h-4 w-4 text-slate-300 mx-[-4px] shrink-0" />

                  {/* Actor Node */}
                  {renderNode('actor', agents, hoveredAgentId, setHoveredAgentId, isPreparing, prepStage)}
               </div>

               {/* LAYER 2: ANALYSIS & PREVENTION */}
               <div className="flex items-center gap-4 relative pl-[10px]">
                  {/* Abstract connection route from top layer */}
                  <div className={cn(
                     "absolute -top-[42px] left-[55px] w-[20px] h-[64px] border-l-[2px] border-b-[2px] rounded-bl-xl transition-colors duration-500",
                     (hoveredAgentId === 'peepo' || hoveredAgentId === 'ipls' || hoveredAgentId === 'prev' || isPreparing) 
                        ? "border-indigo-400" : "border-slate-200"
                  )} />

                  {/* PEEPO Node */}
                  {renderNode('peepo', agents, hoveredAgentId, setHoveredAgentId, isPreparing, prepStage)}

                  <ChevronRight className="h-4 w-4 text-slate-300 mx-[-4px] shrink-0" />

                  {/* IPLS Node */}
                  {renderNode('ipls', agents, hoveredAgentId, setHoveredAgentId, isPreparing, prepStage, true)}

                  <ChevronRight className="h-4 w-4 text-slate-300 mx-[-4px] shrink-0" />

                  {/* Prev Node */}
                  {renderNode('prev', agents, hoveredAgentId, setHoveredAgentId, isPreparing, prepStage, false, true)}
               </div>

            </div>
         </div>
      </div>
    </div>
  );
}
