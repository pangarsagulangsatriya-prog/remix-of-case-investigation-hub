import React from "react";
import { Button } from "@/components/ui/button";
import { AgentState } from "@/types/workspace";
import { FactChronologyModule } from "@/components/analysis/FactChronologyModule";
import { ActorAnalysisModule } from "@/components/analysis/ActorAnalysisModule";
import { IplsAnalysisModule } from "@/components/analysis/IplsAnalysisModule";
import { Download, LayoutGrid, LayoutTemplate } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReportsTabProps {
  agents: AgentState[];
}

export default function ReportsTab({ agents }: ReportsTabProps) {
  const factAgent = agents.find(a => a.id === "fact");
  const peepoAgent = agents.find(a => a.id === "peepo");
  const prevAgent = agents.find(a => a.id === "prev");
  const actorAgent = agents.find(a => a.id === "actor");
  const iplsAgent = agents.find(a => a.id === "ipls");

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex h-full w-full bg-slate-50/10 overflow-auto relative print-container">
      <div className="flex-1 flex flex-col items-center p-8 w-full max-w-5xl mx-auto">
         {/* Print Controls - Hidden in print */}
         <div className="w-full flex items-center justify-between bg-white px-6 py-4 rounded-sm border mb-8 no-print shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 border-none p-0">Laporan Lengkap Analisis Investigasi</h2>
            <Button onClick={handlePrint} className="h-9 font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white flex gap-2">
              <Download className="h-4 w-4" /> Download PDF
            </Button>
         </div>

         {/* Report Body */}
         <div className="w-full space-y-12 pb-32 bg-white print-bg-white print-m-0">
            {/* 1. Fakta & Kronologi */}
            {factAgent && factAgent.results && (
              <div className="w-full border border-slate-200 rounded-sm overflow-hidden print-border-0">
                 <div className="bg-slate-100/50 p-4 border-b border-slate-200">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">1. Fakta & Kronologi</h3>
                 </div>
                 <div className="p-4 pointer-events-none">
                    <FactChronologyModule 
                       initialItems={factAgent.results.chronology_items || []}
                       metadata={factAgent.results.ringkasan}
                       tableData={factAgent.results.tableData}
                       viewMode="default"
                    />
                 </div>
              </div>
            )}

            {/* 2. PEEPO Analysis */}
            {peepoAgent && peepoAgent.results && (
              <div className="w-full border border-slate-200 rounded-sm overflow-hidden print-border-0 print-break-inside-avoid">
                 <div className="bg-slate-100/50 p-4 border-b border-slate-200">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                      <LayoutGrid className="h-4 w-4" /> 2. Sintesis Temuan PEEPO
                    </h3>
                 </div>
                 <div className="p-4">
                    <div className="w-full bg-white border border-slate-300 shadow-sm p-8 space-y-8">
                       {[
                          { id: 'people', label: 'People (Individu)' },
                          { id: 'environment', label: 'Environment (Lingkungan)' },
                          { id: 'equipment', label: 'Equipment (Peralatan)' },
                          { id: 'procedures', label: 'Procedures (Prosedur)' },
                          { id: 'organisation', label: 'Organisation (Organisasi)' },
                       ].map((section) => (
                          <div key={section.id} className="space-y-3 print-break-inside-avoid">
                             <div className="flex items-center gap-3">
                                <span className="px-2.5 py-1 rounded text-[9px] font-black text-white uppercase tracking-widest bg-slate-900">
                                   {section.label}
                                </span>
                             </div>
                             <div className="bg-white border border-slate-200 rounded-sm overflow-hidden shadow-sm">
                                <table className="w-full text-left text-sm border-collapse">
                                   <tbody>
                                      {peepoAgent.results[section.id]?.length > 0 ? (
                                         peepoAgent.results[section.id].map((item: any, idx: number) => (
                                            <tr key={idx} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                                               <td className="px-4 py-3 align-top w-8 text-[10px] font-bold text-slate-400">{(idx+1).toString().padStart(2, '0')}</td>
                                               <td className="px-4 py-3 text-[11px] font-medium text-slate-700 leading-relaxed max-w-[400px]">
                                                  {typeof item === 'string' ? item : (item.chronology_text || '-')}
                                               </td>
                                               <td className="px-4 py-3 align-top w-32">
                                                  <span className={cn(
                                                     "px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border",
                                                     (item.status || 'valid') === 'valid' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                                                     item.status === 'invalid' ? "bg-rose-50 text-rose-700 border-rose-200" :
                                                     "bg-amber-50 text-amber-700 border-amber-200"
                                                  )}>
                                                     {item.status || 'valid'}
                                                  </span>
                                               </td>
                                            </tr>
                                         ))
                                      ) : (
                                         <tr><td className="p-4 text-xs text-slate-400 italic">Tidak ada temuan.</td></tr>
                                      )}
                                   </tbody>
                                </table>
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>
              </div>
            )}

            {/* 3. Aktor */}
            {actorAgent && actorAgent.results && (
              <div className="w-full border border-slate-200 rounded-sm overflow-hidden print-border-0">
                 <div className="bg-slate-100/50 p-4 border-b border-slate-200">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">3. Analisis Aktor</h3>
                 </div>
                 <div className="p-4 pointer-events-none">
                    <ActorAnalysisModule data={actorAgent.results} />
                 </div>
              </div>
            )}

            {/* 4. IPLS */}
            {iplsAgent && iplsAgent.results && (
              <div className="w-full border border-slate-200 rounded-sm overflow-hidden print-border-0 print-break-inside-avoid">
                 <div className="bg-slate-100/50 p-4 border-b border-slate-200">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">4. Pemetaan IPLS</h3>
                 </div>
                 <div className="p-4 pointer-events-none">
                    <IplsAnalysisModule data={iplsAgent.results} />
                 </div>
              </div>
            )}

            {/* 5. Prevention */}
            {prevAgent && prevAgent.results && (
              <div className="w-full border border-slate-200 rounded-sm overflow-hidden print-border-0 print-break-inside-avoid">
                 <div className="bg-slate-100/50 p-4 border-b border-slate-200">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                      <LayoutTemplate className="h-4 w-4" /> 5. Rencana Tindakan Pencegahan
                    </h3>
                 </div>
                 <div className="p-4">
                    <div className="bg-white border border-slate-300 shadow-sm rounded-none overflow-hidden h-fit shrink-0">
                       <table className="w-full text-left border-collapse">
                          <thead>
                             <tr className="bg-slate-100/80 border-b border-slate-200">
                                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest w-12 text-center">No</th>
                                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest w-24">Layer</th>
                                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest w-24">Hierarki</th>
                                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Rencana Tindakan</th>
                             </tr>
                          </thead>
                          <tbody>
                             {prevAgent.results.actions?.map((item: any, idx: number) => (
                                <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/50">
                                   <td className="px-4 py-3 text-center">
                                      <span className="text-[10px] font-bold text-slate-400">{(idx + 1).toString().padStart(2, '0')}</span>
                                   </td>
                                   <td className="px-4 py-3">
                                      <span className="text-[10.5px] font-bold text-slate-700 bg-slate-100 px-2 py-1 border border-slate-200 rounded">{item.layer}</span>
                                   </td>
                                   <td className="px-4 py-3">
                                      <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider bg-blue-50 px-2 py-1 border border-blue-100 rounded">{item.hierarchy}</span>
                                   </td>
                                   <td className="px-4 py-3">
                                      <p className="text-[11px] font-medium text-slate-700 leading-relaxed">{item.action}</p>
                                   </td>
                                </tr>
                             ))}
                          </tbody>
                       </table>
                    </div>
                 </div>
              </div>
            )}
         </div>
      </div>
    </div>
  );
}
