import React from "react";
import { Button } from "@/components/ui/button";
import { AgentState, ReportStatusType, ReportSnapshot, ReportAuditEntry } from "@/types/workspace";
import { FactChronologyModule } from "@/components/analysis/FactChronologyModule";
import { ActorAnalysisModule } from "@/components/analysis/ActorAnalysisModule";
import { IplsAnalysisModule } from "@/components/analysis/IplsAnalysisModule";
import { Download, LayoutGrid, LayoutTemplate, AlertTriangle, FileText, CheckCircle2, History, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReportsTabProps {
  agents: AgentState[];
  reportStatus?: ReportStatusType;
  setReportStatus?: (s: ReportStatusType) => void;
  reportSnapshot?: ReportSnapshot | null;
  setReportSnapshot?: (s: ReportSnapshot | null) => void;
  reportAuditLogs?: ReportAuditEntry[];
  setReportAuditLogs?: (logs: ReportAuditEntry[]) => void;
}

export default function ReportsTab({ 
  agents,
  reportStatus = 'EMPTY',
  setReportStatus,
  reportSnapshot,
  setReportSnapshot,
  reportAuditLogs = [],
  setReportAuditLogs
}: ReportsTabProps) {
  const [isApprovalModalOpen, setIsApprovalModalOpen] = React.useState(false);
  const [approvalChecked, setApprovalChecked] = React.useState(false);
  const [isAuditDrawerOpen, setIsAuditDrawerOpen] = React.useState(false);

  // Use snapshot agents if locked, otherwise use current agents
  const displayAgents = reportStatus === 'FINAL_LOCKED' && reportSnapshot ? reportSnapshot.agentsSnapshot : agents;

  const factAgent = displayAgents.find(a => a.id === "fact");
  const peepoAgent = displayAgents.find(a => a.id === "peepo");
  const prevAgent = displayAgents.find(a => a.id === "prev");
  const actorAgent = displayAgents.find(a => a.id === "actor");
  const iplsAgent = displayAgents.find(a => a.id === "ipls");

  const handlePrint = () => {
    window.print();
  };

  const handleGeneratePreview = () => {
    if (setReportStatus) setReportStatus('PREVIEW');
    if (setReportAuditLogs && reportAuditLogs) {
      setReportAuditLogs([{
        id: `audit-${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: 'PREVIEW_GENERATED',
        actor: 'Administrator (admin)',
        details: 'Report preview generated'
      }, ...reportAuditLogs]);
    }
  };

  const handleApproveReport = () => {
    if (setReportStatus) setReportStatus('FINAL_LOCKED');
    if (setReportSnapshot) {
      setReportSnapshot({
        lockedAt: new Date().toISOString(),
        lockedBy: 'Administrator (admin)',
        reportId: `REP-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        agentsSnapshot: JSON.parse(JSON.stringify(agents)) // deep copy
      });
    }
    if (setReportAuditLogs && reportAuditLogs) {
      setReportAuditLogs([{
        id: `audit-${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: 'REPORT_LOCKED',
        actor: 'Administrator (admin)',
        details: 'Report finalized and locked'
      }, ...reportAuditLogs]);
    }
    setIsApprovalModalOpen(false);
  };

  if (reportStatus === 'EMPTY') {
    return (
      <div className="flex h-full w-full items-center justify-center bg-slate-50/10 p-8">
        <div className="bg-white border border-slate-200 shadow-sm p-12 flex flex-col items-center max-w-md w-full text-center rounded-sm">
           <FileText className="h-16 w-16 text-slate-300 mb-6" strokeWidth={1} />
           <h2 className="text-lg font-black text-slate-800 uppercase tracking-widest mb-2">Belum Ada Report</h2>
           <p className="text-[12px] text-slate-500 mb-8 leading-relaxed">
             Hasil analisis investigasi belum dikunci menjadi laporan final.
           </p>
           <Button 
             onClick={handleGeneratePreview}
             className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 h-10 tracking-widest uppercase text-[10px]"
           >
             Buat Preview Report
           </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full bg-slate-50/10 overflow-auto relative print-container">
      <div className="flex-1 flex flex-col items-center p-8 w-full mx-auto print:p-0">
         
         {/* Top Banner based on status */}
         <div className="w-full max-w-[1300px] mb-6 no-print">
           {reportStatus === 'PREVIEW' && (
             <div className="bg-amber-50 border border-amber-200 rounded-sm p-4 flex items-center justify-between shadow-sm">
               <div className="flex items-center gap-3">
                 <AlertTriangle className="h-5 w-5 text-amber-600" />
                 <div>
                   <h3 className="text-sm font-bold text-amber-900 uppercase tracking-widest">Mode Preview Laporan</h3>
                   <p className="text-[11px] text-amber-700">Tinjau laporan ini sebelum mengesahkan. Laporan yang sudah disahkan tidak dapat diubah lagi.</p>
                 </div>
               </div>
               <div className="flex items-center gap-2">
                 <Button onClick={() => setReportStatus && setReportStatus('EMPTY')} variant="outline" className="h-8 text-xs font-bold bg-white border-amber-300 text-amber-700 hover:bg-amber-100">Batal</Button>
                 <Button onClick={() => setIsApprovalModalOpen(true)} className="h-8 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white uppercase tracking-widest px-6">Sahkan Laporan</Button>
               </div>
             </div>
           )}

           {reportStatus === 'FINAL_LOCKED' && reportSnapshot && (
             <div className="bg-emerald-50 border border-emerald-200 rounded-sm p-4 flex items-center justify-between shadow-sm">
               <div className="flex items-center gap-3">
                 <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                 <div>
                   <h3 className="text-sm font-bold text-emerald-900 uppercase tracking-widest flex items-center gap-2">
                     Laporan Disahkan 
                     <span className="bg-emerald-200 text-emerald-800 text-[9px] px-1.5 py-0.5 rounded font-mono">{reportSnapshot.reportId}</span>
                   </h3>
                   <p className="text-[11px] text-emerald-700">Dikunci oleh <span className="font-bold">{reportSnapshot.lockedBy}</span> pada {new Date(reportSnapshot.lockedAt).toLocaleString('id-ID')}</p>
                 </div>
               </div>
               <div className="flex items-center gap-2">
                 <Button onClick={() => setIsAuditDrawerOpen(true)} variant="outline" className="h-8 text-[11px] font-bold bg-white border-emerald-300 text-emerald-700 hover:bg-emerald-100 uppercase tracking-widest">
                   <History className="h-3.5 w-3.5 mr-1.5" /> Riwayat Laporan
                 </Button>
                 <Button onClick={handlePrint} className="h-8 text-[11px] font-bold bg-blue-600 hover:bg-blue-700 text-white uppercase tracking-widest px-4">
                   <Download className="h-3.5 w-3.5 mr-1.5" /> Cetak PDF
                 </Button>
               </div>
             </div>
           )}
         </div>

         {/* Print Header (Only visible in print or empty state if we wanted) */}
         <div className="w-full max-w-[1300px] flex items-center justify-between bg-white px-6 py-4 rounded-sm border mb-8 no-print shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 border-none p-0">Laporan Lengkap Analisis Investigasi</h2>
            {reportStatus === 'PREVIEW' && (
              <span className="bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded border border-amber-200">DRAFT PREVIEW</span>
            )}
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
                       readonly={true}
                    />
                 </div>
              </div>
            )}

            {/* 2. PEEPO Analysis */}
            {peepoAgent && peepoAgent.results && (
              <div className="w-full flex flex-col print-break-inside-avoid border border-slate-200 shadow-sm rounded-sm overflow-hidden bg-white print:border-none print:shadow-none print:rounded-none">
                 <div className="bg-white px-6 py-4 flex items-center justify-between shrink-0 border-b border-slate-200">
                    <div>
                       <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                          <LayoutGrid className="h-4 w-4 text-slate-500" />
                          LEMBAR ANALISIS FAKTOR PEEPO
                       </h2>
                       <p className="text-[11px] text-slate-500 mt-1">Sintesis temuan berdasarkan kategori People, Environment, Equipment, Procedures, dan Organisation.</p>
                    </div>
                 </div>
                 <div className="flex-1 bg-white p-6 md:p-8 flex justify-center print:p-0">
                    <div className="w-full h-fit shrink-0 space-y-8">
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
                 <ActorAnalysisModule data={actorAgent.results} readonly={true} />
              </div>
            )}

            {/* 4. IPLS */}
            {iplsAgent && iplsAgent.results && (
              <div className="w-full print-break-inside-avoid pointer-events-none">
                 <IplsAnalysisModule data={iplsAgent.results} readonly={true} onSync={() => {}} />
              </div>
            )}

            {/* 5. Prevention */}
            {prevAgent && prevAgent.results && (
              <div className="w-full flex flex-col print-break-inside-avoid border border-slate-200 shadow-sm rounded-sm overflow-hidden bg-white print:border-none print:shadow-none print:rounded-none">
                 <div className="bg-white px-6 py-4 flex items-center justify-between shrink-0 border-b border-slate-200">
                    <div>
                       <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                          <LayoutTemplate className="h-4 w-4 text-slate-500" />
                          RENCANA TINDAKAN PENCEGAHAN (PREVENTION)
                       </h2>
                       <p className="text-[11px] text-slate-500 mt-1">Langkah-langkah perbaikan dan pencegahan insiden untuk meminimalisasi risiko.</p>
                    </div>
                 </div>
                 <div className="flex-1 bg-white p-6 md:p-8 flex justify-center print:p-0">
                    <div className="w-full h-fit shrink-0 print:border-none print:shadow-none print:p-2">
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
      
      {/* Approval Modal */}
      {isApprovalModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm print:hidden">
          <div className="bg-white rounded-md shadow-2xl max-w-md w-full overflow-hidden flex flex-col border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Pengesahan Laporan Final
              </h3>
              <button onClick={() => setIsApprovalModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <p className="text-xs text-slate-600 leading-relaxed">
                Anda akan mengesahkan laporan ini. Setelah disahkan, laporan akan dikunci dan <span className="font-bold text-slate-900">tidak dapat diubah kembali</span>. Laporan ini akan menjadi rekaman resmi dari hasil investigasi.
              </p>
              <label className="flex gap-3 items-start cursor-pointer group bg-slate-50 p-3 rounded border border-slate-200 hover:bg-slate-100 transition-colors">
                <input 
                  type="checkbox" 
                  checked={approvalChecked} 
                  onChange={(e) => setApprovalChecked(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <span className="text-[11px] font-bold text-slate-700 leading-relaxed group-hover:text-slate-900">
                  Saya menyatakan bahwa saya telah meninjau seluruh hasil analisis pada preview laporan ini dan menyetujui isinya untuk disahkan.
                </span>
              </label>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button onClick={() => setIsApprovalModalOpen(false)} variant="outline" className="h-9 text-xs font-bold uppercase tracking-widest">Batal</Button>
              <Button onClick={handleApproveReport} disabled={!approvalChecked} className="h-9 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-widest">Ya, Sahkan & Kunci</Button>
            </div>
          </div>
        </div>
      )}

      {/* Audit Drawer */}
      {isAuditDrawerOpen && (
        <div className="fixed inset-y-0 right-0 w-80 bg-white border-l border-slate-200 shadow-2xl z-[90] flex flex-col animate-in slide-in-from-right duration-200 print:hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="text-[11px] font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
              <History className="h-4 w-4 text-slate-500" />
              Riwayat Laporan
            </h3>
            <button onClick={() => setIsAuditDrawerOpen(false)} className="text-slate-400 hover:text-slate-700">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {reportAuditLogs.map((log) => (
              <div key={log.id} className="relative pl-4 border-l-2 border-slate-200">
                <div className="absolute -left-[5px] top-1.5 h-2 w-2 rounded-full bg-slate-400" />
                <div className="text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-widest">{new Date(log.timestamp).toLocaleString('id-ID')}</div>
                <div className="text-xs font-bold text-slate-900 mb-0.5">{log.details}</div>
                <div className="text-[10px] text-slate-500 font-mono">Oleh: {log.actor}</div>
              </div>
            ))}
            {reportAuditLogs.length === 0 && (
              <div className="text-center text-xs text-slate-500 py-10">Belum ada riwayat.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

