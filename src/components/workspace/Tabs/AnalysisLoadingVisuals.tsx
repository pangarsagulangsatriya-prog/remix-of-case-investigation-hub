import React, { useState, useEffect } from 'react';
import { cn } from '../../../lib/utils';
import { 
  FileText, Activity, Users, AlertTriangle, 
  Layers, ShieldAlert, CheckCircle2,
  Database, GitCommit, ListTree, Loader2, ArrowRight
} from 'lucide-react';

interface LoadingVisualsProps {
  agentId: string;
  elapsedTimeMs: number;
}

export function AgentLoadingVisuals({ agentId, elapsedTimeMs }: LoadingVisualsProps) {
  // A step progresses roughly every 3000ms
  const stepIndex = Math.floor(elapsedTimeMs / 3000);

  switch (agentId) {
    case 'fact':
      return <FactVisual stepIndex={stepIndex} />;
    case 'actor':
      return <ActorVisual stepIndex={stepIndex} />;
    case 'peepo':
      return <PeepoVisual stepIndex={stepIndex} />;
    case 'ipls':
      return <IplsVisual stepIndex={stepIndex} />;
    case 'prev':
      return <PreventionVisual stepIndex={stepIndex} />;
    default:
      return null;
  }
}

// ----------------------------------------------------------------------
// 1. FACT CHRONOLOGY
// ----------------------------------------------------------------------
function FactVisual({ stepIndex }: { stepIndex: number }) {
  const isFinalizing = stepIndex >= 6; // Final transition phase
  const showEvents = stepIndex >= 1;
  const showTime = stepIndex >= 2;
  const isOrdering = stepIndex >= 3;
  const isCategorizing = stepIndex >= 4;
  const isChecking = stepIndex >= 5;

  return (
    <div className="flex flex-col h-full overflow-hidden animate-in fade-in duration-500">
      
      <div className="flex-1 flex gap-6 relative">
         {/* Left Containers (Evidence & Events) that fade out on finalize */}
         <div className={cn("flex-1 flex gap-6 transition-all duration-700 ease-in-out origin-left", isFinalizing ? "opacity-0 -translate-x-8 w-0 absolute pointer-events-none scale-95" : "opacity-100 translate-x-0 w-[60%] scale-100")}>
            
            {/* EVIDENCE INPUT */}
            <div className="flex-1 flex flex-col gap-3 min-w-[140px]">
               <span className="text-[10px] font-bold text-slate-500 tracking-widest flex items-center justify-between">
                  EVIDENCE
                  {stepIndex === 0 && <span className="text-[8px] text-blue-500 animate-pulse">● MEMBACA</span>}
                  {stepIndex > 0 && <span className="text-[8px] text-emerald-500">✓ SELESAI</span>}
               </span>
               <div className={cn("flex-1 space-y-2 transition-colors duration-300", stepIndex === 0 ? "bg-slate-50/50" : "")}>
                  {[
                     { label: 'Source 01', status: stepIndex >= 0 ? '✓' : '●' },
                     { label: 'Source 02', status: stepIndex >= 1 ? '✓' : '●' },
                     { label: 'Source 03', status: stepIndex >= 1 ? '✓' : '○' },
                     { label: 'Source 04', status: stepIndex >= 2 ? '✓' : '○' },
                  ].map((item, i) => {
                     const isScanning = (stepIndex === 0 && i === 0) || (stepIndex === 1 && i === 1);
                     return (
                        <div key={i} className="flex items-center gap-2 p-2 bg-white rounded border border-slate-200 text-[11px] text-slate-600 relative overflow-hidden shadow-sm">
                           <FileText className="h-3 w-3 text-slate-400 shrink-0" /> <span className="truncate">{item.label}</span>
                           <span className={cn("ml-auto text-[10px] font-bold shrink-0", item.status === '✓' ? "text-emerald-500" : "text-slate-300")}>{item.status === '✓' ? 'Dibaca' : 'Antrean'}</span>
                           {isScanning && (
                              <div className="absolute top-0 left-0 w-1/4 h-full bg-blue-500/10 border-b-2 border-blue-400 animate-[progressTrack_1.2s_linear_infinite]" />
                           )}
                        </div>
                     );
                  })}
               </div>
            </div>

            {/* EVENT BUFFER */}
            <div className="flex-1 flex flex-col gap-3 min-w-[160px] relative">
               <span className="text-[10px] font-bold text-slate-500 tracking-widest flex items-center justify-between">
                  KEJADIAN
                  {stepIndex > 0 && stepIndex < 4 && <span className="text-[8px] text-blue-500 animate-pulse">● MEMPROSES</span>}
                  {stepIndex >= 4 && <span className="text-[8px] text-emerald-500">✓ SELESAI</span>}
               </span>
               
               {/* Connector Evidence -> Event */}
               {showEvents && stepIndex < 4 && (
                  <div className="absolute left-[-20px] top-[20%] text-slate-300 animate-[fade-in_300ms_ease-in-out]">
                     <ArrowRight className="h-4 w-4 text-blue-400" />
                  </div>
               )}

               <div className={cn("flex-1 px-2 space-y-3 relative transition-colors duration-300", (stepIndex > 0 && stepIndex < 4) ? "bg-slate-50/50 rounded-lg p-2" : "p-2")}>
                  {/* Event 01 */}
                  <div className={cn("transition-all duration-300", showEvents ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4", isOrdering ? "translate-y-6" : "")}>
                     <div className="p-2 border border-slate-200 bg-white rounded flex flex-col gap-1.5 shadow-sm relative">
                        <div className="flex justify-between items-center">
                           <span className="text-[9px] font-bold text-slate-700">EVENT CANDIDATE</span>
                           {isChecking && <span className="text-[8px] bg-emerald-50 text-emerald-600 px-1 py-0.5 rounded border border-emerald-100 animate-in fade-in">Source: 2 evidence</span>}
                        </div>
                        <div className="flex items-center gap-2">
                           <span className={cn("text-[10px] font-mono transition-all duration-300", showTime ? "text-emerald-600 font-bold" : "text-slate-400 animate-pulse")}>
                              {showTime ? "TIME: Resolved" : "TIME: Checking..."}
                           </span>
                        </div>
                        <div className="flex items-center gap-2">
                           <span className={cn("text-[10px] font-mono transition-all duration-300", isCategorizing ? "text-emerald-600 font-bold" : "text-slate-400")}>
                              {isCategorizing ? "CATEGORY: Resolved" : "CATEGORY: Pending"}
                           </span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-sm mt-1" />
                     </div>
                  </div>

                  {/* Event 02 */}
                  <div className={cn("transition-all duration-300 delay-150", showEvents ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4", isOrdering ? "-translate-y-[68px]" : "")}>
                     <div className="p-2 border border-slate-200 bg-white rounded flex flex-col gap-1.5 shadow-sm relative">
                        <div className="flex justify-between items-center">
                           <span className="text-[9px] font-bold text-slate-700">EVENT CANDIDATE</span>
                           {isChecking && <span className="text-[8px] bg-emerald-50 text-emerald-600 px-1 py-0.5 rounded border border-emerald-100 animate-in fade-in">Source: 1 evidence</span>}
                        </div>
                        <div className="flex items-center gap-2">
                           <span className={cn("text-[10px] font-mono transition-all duration-300 delay-100", showTime ? "text-emerald-600 font-bold" : "text-slate-400 animate-pulse")}>
                              {showTime ? "TIME: Resolved" : "TIME: Checking..."}
                           </span>
                        </div>
                        <div className="flex items-center gap-2">
                           <span className={cn("text-[10px] font-mono transition-all duration-300 delay-100", isCategorizing ? "text-emerald-600 font-bold" : "text-slate-400")}>
                              {isCategorizing ? "CATEGORY: Resolved" : "CATEGORY: Pending"}
                           </span>
                        </div>
                        <div className="h-1.5 w-3/4 bg-slate-100 rounded-sm mt-1" />
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* CHRONOLOGY STRUCTURE */}
         <div className={cn("flex flex-col gap-3 transition-all duration-700 ease-in-out relative", isFinalizing ? "flex-1 ml-0" : "flex-[1.2]")}>
            <span className="text-[10px] font-bold text-slate-500 tracking-widest flex items-center justify-between">
               STRUKTUR KRONOLOGI
               {isCategorizing && !isFinalizing && <span className="text-[8px] text-blue-500 animate-pulse">● MEMPROSES</span>}
            </span>
            
            {/* Connector Event -> Chronology */}
            {isCategorizing && !isFinalizing && (
               <div className="absolute left-[-16px] top-[30%] text-slate-300 animate-[fade-in_300ms_ease-in-out]">
                  <ArrowRight className="h-4 w-4 text-blue-400" />
               </div>
            )}

            <div className={cn("flex-1 bg-white border border-slate-200 rounded-lg p-5 space-y-5 shadow-sm flex flex-col overflow-hidden relative transition-colors duration-300", isCategorizing && !isFinalizing ? "bg-slate-50/30" : "")}>
               
               {/* Pra Kontak */}
               <div className="flex-1 flex flex-col">
                  <h4 className="text-[11px] font-bold text-[#EAB308] border-b-2 border-[#FEF08A] pb-1.5 mb-3 uppercase tracking-wider">PRA-KONTAK</h4>
                  <div className="flex-1 space-y-3 relative">
                     <div className={cn("transition-all duration-500", isCategorizing ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4 absolute")}>
                        <div className="flex gap-4 items-start">
                           <span className="text-[10px] font-mono font-bold text-slate-500 mt-0.5 whitespace-nowrap bg-slate-100 px-1 py-0.5 rounded">[ TIME RESOLVED ]</span>
                           <div className="flex-1 space-y-2 mt-1.5">
                              <div className="text-[11px] text-slate-700 font-medium">[ EVENT STRUCTURED ]</div>
                              <div className="text-[10px] text-slate-500">[ source specific findings attached ]</div>
                              {isChecking && (
                                 <div className="text-[9px] text-emerald-600 flex items-center gap-1 animate-in fade-in">
                                    <CheckCircle2 className="h-3 w-3" /> 2 sources consistent
                                 </div>
                              )}
                           </div>
                        </div>
                     </div>
                     {!isCategorizing && (
                        <div className="text-[10px] text-slate-300 italic py-2">────────────────</div>
                     )}
                  </div>
               </div>
               
               {/* Kontak */}
               <div className="flex-1 flex flex-col">
                  <h4 className="text-[11px] font-bold text-[#EF4444] border-b-2 border-[#FECACA] pb-1.5 mb-3 uppercase tracking-wider">KONTAK</h4>
                  <div className="flex-1 space-y-3 relative">
                     <div className={cn("transition-all duration-500 delay-150", isCategorizing ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4 absolute")}>
                        <div className="flex gap-4 items-start">
                           <span className="text-[10px] font-mono font-bold text-slate-500 mt-0.5 whitespace-nowrap bg-slate-100 px-1 py-0.5 rounded">[ TIME RESOLVED ]</span>
                           <div className="flex-1 space-y-2 mt-1.5">
                              <div className="text-[11px] text-slate-700 font-medium">[ EVENT STRUCTURED ]</div>
                              <div className="text-[10px] text-slate-500">[ source specific findings attached ]</div>
                              {isChecking && (
                                 <div className="text-[9px] text-emerald-600 flex items-center gap-1 animate-in fade-in">
                                    <CheckCircle2 className="h-3 w-3" /> 1 source checked
                                 </div>
                              )}
                           </div>
                        </div>
                     </div>
                     {!isCategorizing && (
                        <div className="text-[10px] text-slate-300 italic py-2">────────────────</div>
                     )}
                  </div>
               </div>

               {/* Pasca Kontak */}
               <div className="flex-1 flex flex-col">
                  <h4 className="text-[11px] font-bold text-[#3B82F6] border-b-2 border-[#BFDBFE] pb-1.5 mb-3 uppercase tracking-wider">PASCA KONTAK</h4>
                  <div className="flex-1 relative">
                     <div className="text-[10px] text-slate-300 italic py-2">────────────────</div>
                  </div>
               </div>

            </div>
         </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 2. ACTOR REGISTRY
// ----------------------------------------------------------------------
function ActorVisual({ stepIndex }: { stepIndex: number }) {
  const isResolving = stepIndex >= 2;
  const isFinalizing = stepIndex >= 5;

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Penyusunan Registri Aktor</h3>
      
      {/* Top Stats */}
      <div className="flex gap-4 mb-6">
         <div className="flex-1 bg-white border border-slate-200 rounded p-3 text-center">
            <div className="text-[20px] font-bold text-slate-700">{isFinalizing ? '8' : isResolving ? '3' : '-'}</div>
            <div className="text-[9px] font-bold text-slate-400 uppercase">Total Aktor</div>
         </div>
         <div className="flex-1 bg-white border border-slate-200 rounded p-3 text-center">
            <div className="text-[20px] font-bold text-slate-700">{isFinalizing ? '2' : '-'}</div>
            <div className="text-[9px] font-bold text-slate-400 uppercase">Perlu Ditinjau</div>
         </div>
         <div className="flex-1 bg-white border border-slate-200 rounded p-3 text-center">
            <div className="text-[20px] font-bold text-emerald-600">{isFinalizing ? '5' : '-'}</div>
            <div className="text-[9px] font-bold text-slate-400 uppercase">Diizinkan</div>
         </div>
      </div>

      <div className="flex-1 flex gap-8">
         {/* Identity Fragments */}
         <div className="flex-1 flex flex-col gap-3">
            <span className="text-[10px] font-bold text-slate-500">SUMBER IDENTITAS</span>
            <div className="space-y-2 relative">
               <div className="p-2 border border-slate-200 bg-white rounded text-[11px] text-slate-600 shadow-sm relative z-10">
                  <div className="font-bold">CCR: Opr. Saiful</div>
                  <div className="text-[10px] text-slate-400">ID: BE-7654</div>
               </div>
               <div className="p-2 border border-slate-200 bg-white rounded text-[11px] text-slate-600 shadow-sm relative z-10">
                  <div className="font-bold">BAP: S. Saiful</div>
                  <div className="text-[10px] text-slate-400">Peran: Operator</div>
               </div>
               <div className="p-2 border border-slate-200 bg-white rounded text-[11px] text-slate-600 shadow-sm relative z-10">
                  <div className="font-bold">Kronologi: Saiful</div>
               </div>
               
               {isResolving && !isFinalizing && (
                  <svg className="absolute top-0 right-[-40px] w-10 h-full overflow-visible z-0" style={{ zIndex: 0 }}>
                     <path d="M 0 20 C 20 20, 20 50, 40 50" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 4" className="animate-[dash_1s_linear_infinite]" />
                     <path d="M 0 70 C 20 70, 20 50, 40 50" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 4" className="animate-[dash_1s_linear_infinite]" />
                     <path d="M 0 120 C 20 120, 20 50, 40 50" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 4" className="animate-[dash_1s_linear_infinite]" />
                  </svg>
               )}
            </div>
         </div>

         {/* Resolution -> Output */}
         <div className="flex-[1.5] flex flex-col gap-3">
            <span className="text-[10px] font-bold text-slate-500">ACTOR REGISTRY</span>
            <div className="flex-1 bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
               <table className="w-full text-left">
                  <thead className="bg-slate-50">
                     <tr>
                        <th className="px-3 py-2 text-[10px] font-bold text-slate-500">IDENTITAS</th>
                        <th className="px-3 py-2 text-[10px] font-bold text-slate-500">PERAN</th>
                     </tr>
                  </thead>
                  <tbody>
                     {isResolving && (
                        <tr className="border-t border-slate-100 animate-in fade-in slide-in-from-left-4">
                           <td className="px-3 py-3">
                              <div className="h-4 w-24 bg-slate-200 rounded animate-pulse mb-1" />
                              <div className="h-3 w-16 bg-slate-100 rounded animate-pulse" />
                           </td>
                           <td className="px-3 py-3">
                              <div className="h-4 w-20 bg-slate-200 rounded animate-pulse" />
                           </td>
                        </tr>
                     )}
                     {isFinalizing && (
                        <tr className="border-t border-slate-100 animate-in fade-in slide-in-from-left-4">
                           <td className="px-3 py-3">
                              <div className="h-4 w-28 bg-slate-200 rounded animate-pulse mb-1" />
                              <div className="h-3 w-20 bg-slate-100 rounded animate-pulse" />
                           </td>
                           <td className="px-3 py-3">
                              <div className="h-4 w-16 bg-slate-200 rounded animate-pulse" />
                           </td>
                        </tr>
                     )}
                  </tbody>
               </table>
            </div>
         </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 3. PEEPO FACTORS
// ----------------------------------------------------------------------
function PeepoVisual({ stepIndex }: { stepIndex: number }) {
  const cats = ['PEOPLE', 'ENVIRONMENT', 'EQUIPMENT', 'PROCEDURES', 'ORGANISATION'];
  
  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Klasifikasi Faktor PEEPO</h3>
      
      <div className="flex gap-8 flex-1">
         <div className="w-[180px] flex flex-col gap-3">
            <span className="text-[10px] font-bold text-slate-500">FINDINGS INTAKE</span>
            <div className="space-y-3">
               {[1,2,3].map(i => (
                  <div key={i} className={cn("p-2 border border-slate-200 bg-white rounded shadow-sm transition-all duration-500", stepIndex >= i ? "opacity-50 scale-95" : "opacity-100")}>
                     <div className="h-3 w-full bg-slate-200 rounded mb-1 animate-pulse" />
                     <div className="h-3 w-2/3 bg-slate-200 rounded animate-pulse" />
                  </div>
               ))}
            </div>
         </div>

         <div className="flex-1 flex flex-col gap-3">
            <span className="text-[10px] font-bold text-slate-500">PEEPO SHEET</span>
            <div className="flex-1 bg-white border border-slate-200 rounded-lg p-4 space-y-4 shadow-sm overflow-auto custom-scrollbar">
               {cats.map((cat, i) => (
                  <div key={cat} className="space-y-2">
                     <div className="flex items-center justify-between">
                        <h4 className="text-[11px] font-bold text-slate-600">{cat}</h4>
                        <span className="text-[10px] font-bold text-slate-400">{stepIndex > i ? '1' : '0'} temuan</span>
                     </div>
                     <div className="min-h-[24px]">
                        {stepIndex > i ? (
                           <div className="h-4 w-full bg-slate-100 rounded animate-in fade-in" />
                        ) : (
                           <div className="h-px w-full bg-slate-100" />
                        )}
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 4. IPLS LAYERS
// ----------------------------------------------------------------------
function IplsVisual({ stepIndex }: { stepIndex: number }) {
  const layers = ['LAYER I', 'LAYER II', 'LAYER III', 'LAYER IV', 'LAYER V'];
  
  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Pemetaan Lapisan IPLS</h3>
      
      <div className="flex-1 flex flex-col bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
         <div className="flex bg-slate-50 border-b border-slate-200">
            {layers.map(l => (
               <div key={l} className="flex-1 px-3 py-2 border-r last:border-r-0 border-slate-200 text-center">
                  <span className="text-[9px] font-bold text-slate-500 uppercase">{l}</span>
               </div>
            ))}
         </div>
         <div className="flex flex-1 relative">
            {/* Finding Scanning Animation */}
            {stepIndex < 5 && (
               <div 
                  className="absolute top-4 left-4 w-40 p-2 bg-blue-50 border border-blue-200 rounded shadow-md z-10 transition-all duration-1000 ease-in-out"
                  style={{ transform: `translateX(${stepIndex * 120}px)` }}
               >
                  <div className="text-[10px] font-bold text-blue-700 mb-1">Mencocokkan Layer</div>
                  <div className="h-2 w-full bg-blue-200 rounded animate-pulse" />
               </div>
            )}

            {/* Buckets */}
            {layers.map((l, i) => (
               <div key={l} className="flex-1 border-r last:border-r-0 border-slate-100 p-3 flex flex-col gap-2">
                  {stepIndex > i + 1 && (
                     <div className="p-2 border border-slate-200 bg-slate-50 rounded shadow-sm animate-in fade-in slide-in-from-top-4">
                        <div className="h-3 w-full bg-slate-200 rounded mb-2" />
                        <span className="text-[8px] font-bold text-rose-600 bg-rose-50 px-1 py-0.5 rounded uppercase">Non Conformity</span>
                     </div>
                  )}
               </div>
            ))}
         </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 5. PREVENTION
// ----------------------------------------------------------------------
function PreventionVisual({ stepIndex }: { stepIndex: number }) {
  const isMapping = stepIndex >= 2;
  const isTableBuilding = stepIndex >= 4;

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Penyusunan Rencana Pencegahan</h3>
      
      <div className="flex gap-6 h-full">
         <div className="w-[180px] flex flex-col gap-2">
            <span className="text-[10px] font-bold text-slate-500">HIRARKI KONTROL</span>
            <div className="flex flex-col gap-1">
               {['Eliminasi', 'Substitusi', 'Rekayasa', 'Administrasi', 'APD'].map((h, i) => (
                  <div key={h} className={cn("p-2 border rounded text-[11px] font-medium transition-colors", isMapping && i === 3 ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-slate-50 border-slate-200 text-slate-500")}>
                     {h}
                  </div>
               ))}
            </div>
         </div>

         <div className="flex-1 flex flex-col gap-2">
            <span className="text-[10px] font-bold text-slate-500">ACTION TABLE</span>
            <div className="flex-1 bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
               <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200">
                     <tr>
                        <th className="px-3 py-2 text-[10px] font-bold text-slate-500">LAYER</th>
                        <th className="px-3 py-2 text-[10px] font-bold text-slate-500">KONTROL</th>
                        <th className="px-3 py-2 text-[10px] font-bold text-slate-500">TINDAKAN</th>
                     </tr>
                  </thead>
                  <tbody>
                     {isTableBuilding && (
                        <tr className="border-b border-slate-100 animate-in fade-in slide-in-from-top-2">
                           <td className="px-3 py-3"><div className="h-3 w-8 bg-slate-200 rounded" /></td>
                           <td className="px-3 py-3"><div className="h-3 w-16 bg-emerald-100 rounded" /></td>
                           <td className="px-3 py-3">
                              <div className="h-3 w-full max-w-[200px] bg-slate-200 rounded mb-1" />
                              <div className="h-3 w-2/3 bg-slate-100 rounded" />
                           </td>
                        </tr>
                     )}
                     {stepIndex >= 6 && (
                        <tr className="border-b border-slate-100 animate-in fade-in slide-in-from-top-2">
                           <td className="px-3 py-3"><div className="h-3 w-8 bg-slate-200 rounded" /></td>
                           <td className="px-3 py-3"><div className="h-3 w-16 bg-blue-100 rounded" /></td>
                           <td className="px-3 py-3">
                              <div className="h-3 w-full max-w-[180px] bg-slate-200 rounded" />
                           </td>
                        </tr>
                     )}
                  </tbody>
               </table>
            </div>
         </div>
      </div>
    </div>
  );
}
