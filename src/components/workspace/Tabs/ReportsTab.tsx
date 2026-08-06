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
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [generationStep, setGenerationStep] = React.useState(0);

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
    setIsGenerating(true);
    setGenerationStep(1);
    
    setTimeout(() => setGenerationStep(2), 600);
    setTimeout(() => setGenerationStep(3), 1200);
    setTimeout(() => setGenerationStep(4), 1800);
    setTimeout(() => setGenerationStep(5), 2400);
    
    setTimeout(() => {
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
      setIsGenerating(false);
      setGenerationStep(0);
    }, 3000);
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
    const readyAgents = agents.filter(a => a.status === 'COMPLETED').length;
    const totalAgents = 5;
    const isAllReady = readyAgents >= totalAgents;

    return (
      <div className="flex h-full w-full items-center justify-center bg-slate-50/10 p-4 sm:p-8">
        <div className="bg-white border border-slate-200 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col md:flex-row max-w-[1120px] w-full rounded-sm overflow-hidden animate-in fade-in duration-200">
          
          {/* LEFT COLUMN - SETUP */}
          <div className="w-full md:w-[42%] p-8 md:p-10 flex flex-col border-b md:border-b-0 md:border-r border-slate-200">
            {!isGenerating ? (
              <div className="flex-1 flex flex-col animate-in fade-in duration-200">
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      REPORT INVESTIGASI
                    </span>
                    <span className="bg-slate-100 text-slate-500 border border-slate-200 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm">
                      Status: Belum Dibuat
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 mb-3">Buat Laporan Lengkap Investigasi</h2>
                  <p className="text-[12px] text-slate-600 leading-relaxed">
                    Sistem akan menyusun preview dari hasil terbaru seluruh agent analisis.
                    Periksa isi report sebelum disahkan dan dikunci.
                  </p>
                </div>

                <div className="mb-8">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                    BAGIAN YANG AKAN DISUSUN
                  </h3>
                  <div className="space-y-2.5">
                    {[
                      { name: 'Fakta & Kronologi', agent: factAgent },
                      { name: 'Analisis Aktor', agent: actorAgent },
                      { name: 'Faktor PEEPO', agent: peepoAgent },
                      { name: 'Lapisan IPLS', agent: iplsAgent },
                      { name: 'Rencana Pencegahan', agent: prevAgent },
                    ].map((section, i) => {
                      const isReady = section.agent?.status === 'COMPLETED';
                      return (
                        <div key={i} className="flex items-center justify-between text-[11.5px]">
                          <div className="flex items-center gap-2">
                            {isReady ? (
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                            ) : (
                              <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                            )}
                            <span className="text-slate-800 font-medium">{section.name}</span>
                          </div>
                          <span className={cn(
                            "text-[10px] font-bold uppercase tracking-wider",
                            isReady ? "text-emerald-600" : "text-amber-600"
                          )}>
                            {isReady ? 'Siap' : 'Belum Selesai'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mb-8 bg-slate-50 border border-slate-200 rounded p-4">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                    SUMBER PREVIEW
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-[10px] text-slate-500 mb-1">Versi data</div>
                      <div className="text-[11px] font-bold text-slate-800">Hasil analisis terbaru</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 mb-1">Total agent</div>
                      <div className="text-[11px] font-bold text-slate-800">{readyAgents} dari {totalAgents} tersedia</div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-200 text-[10px] text-slate-500">
                    Perubahan yang dilakukan di tab Analysis sebelum report disahkan akan masuk ke preview terbaru.
                  </div>
                </div>

                <div className="mt-auto">
                  {isAllReady ? (
                    <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      SIAP MEMBUAT PREVIEW
                    </div>
                  ) : (
                    <div className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      PREVIEW DAPAT DIBUAT DENGAN CATATAN ({totalAgents - readyAgents} BAGIAN BELUM SELESAI)
                    </div>
                  )}
                  
                  <Button 
                    onClick={handleGeneratePreview}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 tracking-widest uppercase text-[11px] shadow-sm transition-all"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Buat Preview Report
                  </Button>
                  <p className="text-[10px] text-center text-slate-400 mt-3">
                    Preview belum mengunci data dan masih dapat diperiksa kembali.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col justify-center py-10 animate-in slide-in-from-right-4 duration-300">
                <h2 className="text-xl font-bold text-slate-900 mb-6 text-center">Menyusun Preview Report</h2>
                <div className="space-y-4 max-w-[280px] mx-auto w-full">
                  {[
                    "Mengambil hasil analisis terbaru",
                    "Menyusun Fakta & Kronologi",
                    "Menyusun Analisis Aktor",
                    "Menyusun Faktor PEEPO",
                    "Menyusun Lapisan IPLS",
                    "Menyusun Rencana Pencegahan"
                  ].map((stepText, idx) => {
                    const isDone = generationStep > idx;
                    const isCurrent = generationStep === idx;
                    return (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="w-4 flex justify-center shrink-0">
                          {isDone ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 animate-in zoom-in duration-200" />
                          ) : isCurrent ? (
                            <div className="h-1.5 w-1.5 bg-blue-500 rounded-full animate-pulse" />
                          ) : (
                            <div className="h-1.5 w-1.5 border border-slate-300 rounded-full" />
                          )}
                        </div>
                        <span className={cn(
                          "text-[11.5px] transition-colors duration-200",
                          isDone ? "text-slate-700 font-medium" : 
                          isCurrent ? "text-blue-600 font-bold" : "text-slate-400"
                        )}>
                          {stepText}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <p className="text-[11px] text-center text-slate-500 mt-10 font-medium">
                  Menyusun {Math.min(generationStep, 5)} dari 5 bagian...
                </p>
              </div>
            )}
          </div>
          
          {/* RIGHT COLUMN - PREVIEW MINIATURE */}
          <div className="hidden md:flex w-[58%] bg-slate-50/80 items-center justify-center relative p-12 overflow-hidden group">
            
            {/* Document Stack Background */}
            <div className="absolute w-[320px] h-[450px] bg-white border border-slate-200 shadow-sm rounded-sm translate-x-3 translate-y-3 opacity-50 pointer-events-none transition-transform duration-300 group-hover:translate-x-4 group-hover:translate-y-4" />
            <div className="absolute w-[320px] h-[450px] bg-white border border-slate-200 shadow-md rounded-sm translate-x-1.5 translate-y-1.5 opacity-75 pointer-events-none transition-transform duration-300 group-hover:translate-x-2 group-hover:translate-y-2" />
            
            {/* Front Document Miniature */}
            <div className="relative w-[320px] h-[450px] bg-white border border-slate-200 shadow-lg rounded-sm p-6 flex flex-col transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl pointer-events-auto">
              
              <div className="absolute top-4 right-4 bg-slate-900 text-white text-[8px] font-bold px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 uppercase tracking-widest pointer-events-none">
                Preview struktur report
              </div>

              {/* Cover Layout */}
              <div className="border-b-2 border-slate-900 pb-4 mb-4">
                <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">LAPORAN INVESTIGASI</div>
                <div className="text-[12px] font-black text-slate-900 uppercase leading-snug">Security and Stability Incident</div>
                <div className="text-[8px] text-slate-500 mt-2">Case ID: 771CAA3D &middot; 27 April 2026</div>
              </div>

              {/* Section Outlines */}
              <div className="flex-1 space-y-3">
                 <div className="flex gap-2">
                    <span className="text-[9px] font-mono text-slate-400">01</span>
                    <div className="flex-1">
                       <div className="text-[9px] font-bold text-slate-800 uppercase tracking-wider mb-1">Fakta & Kronologi</div>
                       <div className="flex items-center gap-1 mb-1">
                          <div className="h-1.5 w-full bg-slate-100 rounded-sm" />
                          <div className="h-1.5 w-10 bg-slate-100 rounded-sm" />
                       </div>
                       <div className="flex gap-0.5">
                          <div className="h-1 w-1/3 bg-blue-100 rounded-sm" />
                          <div className="h-1 w-2/3 bg-slate-100 rounded-sm" />
                       </div>
                    </div>
                 </div>

                 <div className="flex gap-2">
                    <span className="text-[9px] font-mono text-slate-400">02</span>
                    <div className="flex-1">
                       <div className="text-[9px] font-bold text-slate-800 uppercase tracking-wider mb-1">Analisis Aktor</div>
                       <div className="grid grid-cols-2 gap-1 mb-1">
                          <div className="h-6 bg-slate-50 border border-slate-100 rounded-sm" />
                          <div className="h-6 bg-slate-50 border border-slate-100 rounded-sm" />
                       </div>
                    </div>
                 </div>

                 <div className="flex gap-2">
                    <span className="text-[9px] font-mono text-slate-400">03</span>
                    <div className="flex-1">
                       <div className="text-[9px] font-bold text-slate-800 uppercase tracking-wider mb-1">Faktor PEEPO</div>
                       <div className="h-[20px] bg-slate-50 border border-slate-100 flex flex-col justify-between p-0.5 rounded-sm">
                          <div className="h-1 w-full bg-slate-200" />
                          <div className="h-0.5 w-3/4 bg-slate-100" />
                          <div className="h-0.5 w-1/2 bg-slate-100" />
                       </div>
                    </div>
                 </div>

                 <div className="flex gap-2">
                    <span className="text-[9px] font-mono text-slate-400">04</span>
                    <div className="flex-1">
                       <div className="text-[9px] font-bold text-slate-800 uppercase tracking-wider mb-1">Lapisan IPLS</div>
                       <div className="flex items-center gap-1">
                         <div className="h-3 w-3 bg-red-100 rounded-full" />
                         <div className="h-3 w-3 bg-amber-100 rounded-full" />
                         <div className="h-3 w-3 bg-emerald-100 rounded-full" />
                         <div className="h-1 w-full bg-slate-100 rounded-sm" />
                       </div>
                    </div>
                 </div>
                 
                 <div className="flex gap-2">
                    <span className="text-[9px] font-mono text-slate-400">05</span>
                    <div className="flex-1">
                       <div className="text-[9px] font-bold text-slate-800 uppercase tracking-wider mb-1">Rencana Pencegahan</div>
                       <div className="h-1.5 w-1/2 bg-slate-200 mb-1 rounded-sm" />
                       <div className="space-y-0.5">
                          <div className="h-1 w-full bg-slate-100 rounded-sm" />
                          <div className="h-1 w-full bg-slate-100 rounded-sm" />
                       </div>
                    </div>
                 </div>
              </div>

              {/* Page Footer */}
              <div className="mt-auto pt-3 border-t border-slate-100 flex justify-between items-center">
                 <div className="h-1 w-8 bg-slate-200 rounded-sm" />
                 <div className="text-[6px] font-mono text-slate-400">PAGE 1 OF 1</div>
              </div>
              
              {/* Generation Overlay */}
              {isGenerating && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] flex items-center justify-center transition-opacity duration-300">
                  <div className="h-8 w-8 rounded-full border-2 border-slate-200 border-t-blue-600 animate-spin" />
                </div>
              )}
            </div>
            
          </div>
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

