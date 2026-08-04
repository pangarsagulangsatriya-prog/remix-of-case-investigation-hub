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
      <div className="flex-1 flex flex-col items-center p-8 w-full mx-auto print:p-0">
         {/* Print Controls - Hidden in print */}
         <div className="w-full max-w-[1300px] flex items-center justify-between bg-white px-6 py-4 rounded-sm border mb-8 no-print shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 border-none p-0">Laporan Lengkap Analisis Investigasi</h2>
            <Button onClick={handlePrint} className="h-9 font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white flex gap-2">
              <Download className="h-4 w-4" /> Download PDF
            </Button>
         </div>

         {/* Report Body */}
         <div className="w-full max-w-[1300px] space-y-12 print:space-y-8 pb-32 print:pb-0 print-bg-white print-m-0">
            
            {/* 1. Fakta & Kronologi */}
            {factAgent && factAgent.results && (
              <div className="w-full print-break-inside-avoid">
                 <div className="pointer-events-none">
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
              <div className="w-full flex flex-col print-break-inside-avoid border border-slate-300 shadow-sm rounded-sm overflow-hidden print:border-none print:shadow-none print:rounded-none">
                 <div className="bg-slate-900 px-6 py-4 flex items-center justify-between shrink-0">
                    <div>
                       <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                          <LayoutGrid className="h-4 w-4 text-slate-400" />
                          LEMBAR ANALISIS FAKTOR PEEPO
                       </h2>
                       <p className="text-[11px] text-slate-400 mt-1">Sintesis temuan berdasarkan kategori People, Environment, Equipment, Procedures, dan Organisation.</p>
                    </div>
                 </div>
                 <div className="flex-1 bg-slate-50 p-8 flex justify-center print:p-0 print:bg-white">
                    <div className="w-full bg-white border border-slate-300 shadow-sm p-8 h-fit shrink-0 space-y-8 print:border-none print:shadow-none print:p-2">
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
                                      {peepoAgent.results[section.id]?.length > 0 ? (
                                         peepoAgent.results[section.id].map((item: any, idx: number) => (
                                            <tr key={idx} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                                               <td className="px-5 py-4 align-top border-r border-b border-slate-200 relative">
                                                  <p className="text-[11px] font-bold leading-relaxed pr-8 text-slate-700">
                                                     {typeof item === 'string' ? item : (item.chronology_text || item.label || item.id || '-')}
                                                  </p>
                                               </td>
                                            </tr>
                                         ))
                                      ) : (
                                         <tr><td className="px-5 py-4 text-[11px] text-slate-400 italic">Tidak ada temuan.</td></tr>
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
              <div className="w-full print-break-inside-avoid pointer-events-none">
                 <ActorAnalysisModule data={actorAgent.results} />
              </div>
            )}

            {/* 4. IPLS */}
            {iplsAgent && iplsAgent.results && (
              <div className="w-full print-break-inside-avoid pointer-events-none">
                 <IplsAnalysisModule data={iplsAgent.results} />
              </div>
            )}

            {/* 5. Prevention */}
            {prevAgent && prevAgent.results && (
              <div className="w-full flex flex-col print-break-inside-avoid shadow-sm border border-slate-300 rounded overflow-hidden">
                 <div className="bg-slate-900 px-6 py-4 flex items-center justify-between shrink-0">
                    <div>
                       <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                          <LayoutTemplate className="h-4 w-4 text-slate-400" />
                          RENCANA TINDAKAN PENCEGAHAN (PREVENTION)
                       </h2>
                       <p className="text-[11px] text-slate-400 mt-1">Langkah-langkah perbaikan dan pencegahan insiden untuk meminimalisasi risiko.</p>
                    </div>
                 </div>
                 <div className="flex-1 bg-slate-50 p-8 flex justify-center print:p-0 print:bg-white">
                    <div className="w-full bg-white border border-slate-300 shadow-sm p-10 h-fit shrink-0 print:border-none print:shadow-none print:p-2">
                       <h3 className="font-bold text-[14px] text-slate-900 mb-0.5">5. Tindakan Perbaikan dan Pencegahan Insiden NM LV BM 391</h3>
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
                                {prevAgent.results.actions?.map((item: any, idx: number) => {
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
                                   
                                   const getVal = (v: any) => typeof v === 'object' ? v?.text || v?.value || String(v) : String(v || '');
                                   
                                   return (
                                      <tr key={idx} className="bg-white hover:bg-slate-100/50">
                                         <td className="px-4 py-2 border-r border-b border-slate-400 text-center text-[11px] font-mono font-black text-slate-800 align-middle">
                                            {getVal(item.no)}
                                         </td>
                                         <td className={`px-4 py-2 border-r border-b border-slate-400 text-center text-[11px] font-mono font-black ${layerBg} ${layerText} align-middle`}>
                                            {getVal(item.layer)}
                                         </td>
                                         <td className="px-4 py-2 border-r border-b border-slate-400 text-center text-[11px] font-bold text-slate-700 align-middle uppercase">
                                            {getVal(item.hierarchy)}
                                         </td>
                                         <td className="px-4 py-2 border-b border-slate-400 text-[11px] font-bold text-slate-800 leading-relaxed align-middle">
                                            {getVal(item.action)}
                                         </td>
                                      </tr>
                                   );
                                })}
                             </tbody>
                          </table>
                       </div>
                    </div>
                 </div>
              </div>
            )}
         </div>
      </div>
    </div>
  );
}

