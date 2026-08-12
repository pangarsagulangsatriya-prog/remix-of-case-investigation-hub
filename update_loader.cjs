const fs = require('fs');

const cssPath = 'src/index.css';
let cssContent = fs.readFileSync(cssPath, 'utf8');
if (!cssContent.includes('@keyframes slideDown')) {
  cssContent += `
@keyframes slideDown {
  0% { transform: translateY(-100%); opacity: 0; }
  20% { opacity: 1; }
  80% { opacity: 1; }
  100% { transform: translateY(100%); opacity: 0; }
}

@keyframes shimmer {
  0% { transform: translateX(-150%); }
  100% { transform: translateX(350%); }
}
`;
  fs.writeFileSync(cssPath, cssContent);
  console.log('Added CSS keyframes');
}

const file = 'src/components/workspace/Tabs/AnalysisTab.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Insert AGENT_PROCESS_STEPS and ACTIVITY_FEED_EVENTS
const constantsStr = `
export const AGENT_PROCESS_STEPS: Record<string, { id: string, label: string }[]> = {
  fact: [
    { id: 'f1', label: 'Menyiapkan evidence' },
    { id: 'f2', label: 'Mengekstrak event' },
    { id: 'f3', label: 'Menyusun kronologi' },
    { id: 'f4', label: 'Validasi konsistensi' },
    { id: 'f5', label: 'Finalisasi hasil' }
  ],
  actor: [
    { id: 'a1', label: 'Membaca Fakta & Kronologi' },
    { id: 'a2', label: 'Mengidentifikasi aktor' },
    { id: 'a3', label: 'Memetakan aktor ke event' },
    { id: 'a4', label: 'Memeriksa keterlibatan' },
    { id: 'a5', label: 'Finalisasi hasil' }
  ],
  peepo: [
    { id: 'p1', label: 'Membaca konteks investigasi' },
    { id: 'p2', label: 'Mengidentifikasi faktor' },
    { id: 'p3', label: 'Mengelompokkan PEEPO' },
    { id: 'p4', label: 'Memeriksa evidence pendukung' },
    { id: 'p5', label: 'Finalisasi hasil' }
  ],
  ipls: [
    { id: 'i1', label: 'Membaca faktor investigasi' },
    { id: 'i2', label: 'Memetakan lapisan IPLS' },
    { id: 'i3', label: 'Memeriksa conformity' },
    { id: 'i4', label: 'Mengidentifikasi gap' },
    { id: 'i5', label: 'Finalisasi hasil' }
  ],
  prev: [
    { id: 'v1', label: 'Membaca hasil investigasi' },
    { id: 'v2', label: 'Memetakan penyebab' },
    { id: 'v3', label: 'Mengidentifikasi kontrol' },
    { id: 'v4', label: 'Menyusun tindakan pencegahan' },
    { id: 'v5', label: 'Finalisasi rekomendasi' }
  ]
};

export const ACTIVITY_FEED_EVENTS: Record<string, string[]> = {
  fact: [
    "Evidence scope disiapkan",
    "Ekstraksi event kandidat selesai",
    "Event dipetakan ke timeline",
    "Konsistensi log diverifikasi",
    "Hasil kronologi final"
  ],
  actor: [
    "Konteks kronologi dibaca",
    "Aktor terkait ditemukan",
    "Aktor dipetakan ke event",
    "Keterlibatan dianalisis",
    "Matriks aktor final"
  ],
  peepo: [
    "Konteks investigasi dimuat",
    "Faktor insiden diidentifikasi",
    "Faktor dikelompokkan (PEEPO)",
    "Evidence pendukung diperiksa",
    "Analisis PEEPO final"
  ],
  ipls: [
    "Faktor investigasi dibaca",
    "Lapisan IPLS dipetakan",
    "Conformity divalidasi",
    "Gap lapisan diidentifikasi",
    "Analisis IPLS final"
  ],
  prev: [
    "Hasil investigasi dimuat",
    "Akar penyebab dipetakan",
    "Kontrol saat ini dievaluasi",
    "Tindakan pencegahan disusun",
    "Rekomendasi final"
  ]
};

export const initialAgentsState`;

content = content.replace('export const initialAgentsState', constantsStr);

// 2. Replace the loader block
const oldLoaderStart = `                           {selectedAgent?.status === 'running' ? (
                              <div className="flex flex-col items-center justify-center h-full text-center space-y-8 bg-slate-50/50">
                                 <div className="relative flex items-center justify-center">
                                    <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-20 animate-pulse rounded-full w-32 h-32" />
                                    <div className="h-20 w-20 bg-white rounded-full border border-blue-100 shadow-xl flex items-center justify-center relative z-10">
                                       <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
                                    </div>
                                 </div>
                                 <div className="flex flex-col items-center space-y-3">
                                    <span className="text-[20px] font-black uppercase tracking-[0.2em] text-slate-800">{selectedAgent.microStatus || "Memproses Matriks..."}</span>
                                    <div className="flex items-center gap-2 px-4 py-1.5 bg-blue-50 border border-blue-200 rounded-full">
                                       <Activity className="h-3.5 w-3.5 text-blue-600 animate-pulse" />
                                       <span className="text-[10px] font-black text-blue-700 uppercase tracking-widest">AI Sedang Bekerja</span>
                                    </div>
                                 </div>
                              </div>
                           ) : !selectedAgent?.results ? (`;

const newLoaderStart = `                           {selectedAgent?.status === 'running' ? (
                              <div className="flex-1 overflow-auto bg-white relative">
                                 <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 to-white pointer-events-none" />
                                 <div className="relative pt-12 pl-16 max-w-[800px] pb-24">
                                    {/* Header */}
                                    <div className="flex flex-col mb-8">
                                       <div className="flex items-center justify-between mb-1">
                                          <h2 className="text-[22px] font-semibold text-slate-900 uppercase tracking-wide">
                                             {selectedAgent.name}
                                          </h2>
                                          <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full shrink-0">
                                             <Activity className="h-3.5 w-3.5 text-blue-600 animate-pulse" />
                                             <span className="text-[10px] font-bold text-blue-700 uppercase tracking-widest">BERJALAN</span>
                                          </div>
                                       </div>
                                       <p className="text-[14px] text-slate-500">{AgentDisplayMeta[selectedAgent.id]?.subtitle || selectedAgent.purpose}</p>

                                       <div className="mt-6 flex flex-col gap-1">
                                          <span className="text-[16px] font-semibold text-slate-800">
                                             {(selectedAgent.runCount || 0) > 1 ? "Memproses ulang hasil analisis" : "Memulai proses analisis baru"}
                                          </span>
                                          <p className="text-[13px] text-slate-500">
                                             {selectedAgent.knowledgeSelection?.length || 0} evidence digunakan untuk pemrosesan {(selectedAgent.runCount || 0) > 1 ? "ulang" : "awal"}.
                                          </p>
                                       </div>
                                    </div>

                                    {/* Metadata Strip */}
                                    <div className="flex items-center gap-10 py-3 border-y border-slate-200 mb-8">
                                       <div className="flex flex-col">
                                          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">EVIDENCE</span>
                                          <span className="text-[13px] font-semibold text-slate-700">{selectedAgent.knowledgeSelection?.length || 0} digunakan</span>
                                       </div>
                                       <div className="flex flex-col">
                                          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">STATUS</span>
                                          <span className="text-[13px] font-semibold text-slate-700">Berjalan {formatTime(elapsedTimeMs)}</span>
                                       </div>
                                       {(selectedAgent.runCount || 0) > 1 && (
                                          <div className="flex flex-col">
                                             <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">RUN TYPE</span>
                                             <span className="text-[13px] font-semibold text-slate-700">Reprocess #{selectedAgent.runCount}</span>
                                          </div>
                                       )}
                                    </div>

                                    {/* Vertical Stepper & Activity Feed Row */}
                                    <div className="flex gap-16">
                                       {/* Process Stepper */}
                                       <div className="flex-1">
                                          <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-6">Proses Analisis</h3>
                                          <div className="relative space-y-0">
                                             {(() => {
                                                const steps = AGENT_PROCESS_STEPS[selectedAgent.id] || [];
                                                // Calculate pseudo active step based on elapsedTimeMs (each step = 3 seconds approx)
                                                const currentStepIndex = Math.min(Math.floor(elapsedTimeMs / 3000), steps.length - 1);
                                                
                                                return steps.map((step, idx) => {
                                                   const isActive = idx === currentStepIndex;
                                                   const isCompleted = idx < currentStepIndex;
                                                   const isWaiting = idx > currentStepIndex;
                                                   const isLast = idx === steps.length - 1;
                                                   
                                                   return (
                                                      <div key={step.id} className="relative flex items-start group">
                                                         {/* Vertical Line Connector */}
                                                         {!isLast && (
                                                            <div className={\`absolute top-6 left-[11px] w-[2px] h-[calc(100%-8px)] transition-colors duration-300 overflow-hidden \${isCompleted ? 'bg-emerald-500' : 'bg-slate-200'}\`}>
                                                               {/* Animated highlight for active connector */}
                                                               {isActive && (
                                                                  <div className="absolute top-0 left-0 w-full h-1/2 bg-blue-500/50 animate-[slideDown_1.5s_ease-in-out_infinite]" />
                                                               )}
                                                            </div>
                                                         )}
                                                         
                                                         {/* Icon Container */}
                                                         <div className="relative z-10 mr-4 mt-0.5 flex flex-col items-center">
                                                            {isCompleted ? (
                                                               <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 border border-emerald-200 shrink-0 shadow-sm transition-all duration-300">
                                                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                                               </div>
                                                            ) : isActive ? (
                                                               <div className="h-6 w-6 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-200 shrink-0 shadow-sm relative transition-all duration-300">
                                                                  <Loader2 className="h-3.5 w-3.5 animate-[spin_1.5s_linear_infinite]" />
                                                                  <div className="absolute inset-0 rounded-full border border-blue-400 animate-ping opacity-20" />
                                                               </div>
                                                            ) : (
                                                               <div className="h-6 w-6 rounded-full bg-white flex items-center justify-center text-slate-300 border border-slate-200 shrink-0 transition-all duration-300">
                                                                  <div className="h-2 w-2 rounded-full bg-slate-200" />
                                                               </div>
                                                            )}
                                                         </div>
                                                         
                                                         {/* Content */}
                                                         <div className={\`flex flex-col pb-8 transition-opacity duration-300 \${isWaiting ? 'opacity-50' : 'opacity-100'}\`}>
                                                            <div className="flex items-center gap-2">
                                                               <span className="text-[12px] font-mono text-slate-400">0{idx + 1}</span>
                                                               <span className={\`text-[14px] font-medium \${isActive ? 'text-blue-700' : isCompleted ? 'text-slate-800' : 'text-slate-500'}\`}>
                                                                  {step.label}
                                                               </span>
                                                            </div>
                                                            
                                                            {/* Active Status Context & Animation */}
                                                            {isActive && (
                                                               <div className="mt-2 animate-in fade-in slide-in-from-top-1 duration-300">
                                                                  <p className="text-[12px] text-slate-500 mb-2">
                                                                     {selectedAgent.microStatus || "Memproses..."}
                                                                  </p>
                                                                  {/* Indeterminate Progress Track */}
                                                                  <div className="w-48 h-1 bg-slate-100 rounded-full overflow-hidden relative">
                                                                     <div className="absolute top-0 bottom-0 left-0 w-1/3 bg-blue-400/80 rounded-full animate-[shimmer_1.8s_infinite_linear] shadow-[0_0_8px_rgba(96,165,250,0.5)]" />
                                                                  </div>
                                                               </div>
                                                            )}
                                                            {isCompleted && (
                                                               <div className="mt-1 animate-in fade-in duration-300">
                                                                  <span className="text-[11px] text-emerald-600 font-medium">Selesai</span>
                                                               </div>
                                                            )}
                                                         </div>
                                                      </div>
                                                   );
                                                });
                                             })()}
                                          </div>
                                       </div>

                                       {/* Live Activity Feed */}
                                       <div className="w-[300px] shrink-0 border-l border-slate-100 pl-8">
                                          <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-6">Aktivitas Terkini</h3>
                                          <div className="flex flex-col gap-3 font-mono text-[11px]">
                                             {(() => {
                                                const currentStepIndex = Math.min(Math.floor(elapsedTimeMs / 3000), (AGENT_PROCESS_STEPS[selectedAgent.id] || []).length - 1);
                                                const activities = ACTIVITY_FEED_EVENTS[selectedAgent.id] || [];
                                                
                                                // Only show events that have logically "completed" based on elapsed time (time per step = 3s)
                                                // Create a stable feed array based on currentStepIndex (only render what's already completed or actively starting)
                                                const feed = [];
                                                // Started timestamp
                                                const startedTime = Date.now() - elapsedTimeMs;
                                                
                                                for(let i = 0; i <= currentStepIndex; i++) {
                                                   if (activities[i]) {
                                                      const eventTime = new Date(startedTime + (i * 3000));
                                                      feed.unshift({
                                                         label: activities[i],
                                                         time: eventTime.toLocaleTimeString('id-ID', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
                                                      });
                                                   }
                                                }
                                                
                                                return feed.slice(0, 5).map((evt, idx) => (
                                                   <div key={idx} className="flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
                                                      <span className="text-slate-400 shrink-0">{evt.time}</span>
                                                      <span className="text-slate-600 leading-tight">{evt.label}</span>
                                                   </div>
                                                ));
                                             })()}
                                             
                                             <div className="mt-4 pt-4 border-t border-slate-100">
                                                <button className="text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest text-[9px] font-sans font-bold">
                                                   [ Lihat aktivitas lengkap ]
                                                </button>
                                             </div>
                                          </div>
                                       </div>
                                    </div>
                                    
                                    {/* Finalization Result Skeleton */}
                                    {(() => {
                                       const steps = AGENT_PROCESS_STEPS[selectedAgent.id] || [];
                                       const currentStepIndex = Math.min(Math.floor(elapsedTimeMs / 3000), steps.length - 1);
                                       if (currentStepIndex === steps.length - 1) {
                                          return (
                                             <div className="mt-8 pt-8 border-t border-slate-200 animate-in fade-in slide-in-from-top-4 duration-500">
                                                <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4">Mempersiapkan Hasil Analisis</h3>
                                                <div className="space-y-3 opacity-40">
                                                   <div className="h-4 w-3/4 bg-slate-200 rounded-sm animate-pulse" />
                                                   <div className="h-4 w-1/2 bg-slate-200 rounded-sm animate-pulse delay-75" />
                                                   <div className="h-4 w-5/6 bg-slate-200 rounded-sm animate-pulse delay-150" />
                                                </div>
                                             </div>
                                          );
                                       }
                                       return null;
                                    })()}
                                 </div>
                              </div>
                           ) : !selectedAgent?.results ? (`;

if (content.includes('AI Sedang Bekerja')) {
  content = content.replace(oldLoaderStart, newLoaderStart);
  fs.writeFileSync(file, content);
  console.log('Successfully replaced loader in AnalysisTab.tsx!');
} else {
  console.log('Could not find AI Sedang Bekerja in AnalysisTab.tsx!');
}

