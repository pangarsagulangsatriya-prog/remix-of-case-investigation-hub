const fs = require('fs');

const CACHE_FILE = 'src/pages/CaseWorkspacePage.tsx';
let text = fs.readFileSync(CACHE_FILE, 'utf8');

const anchor = '}function ReportsTab()';
const anchorIdx = text.indexOf(anchor);

const analysisTabStart = text.indexOf('function AnalysisTab()');
const returnIdx = text.indexOf('return (', analysisTabStart);

const lastReturnEnd = text.lastIndexOf(');', anchorIdx);
const endIdx = lastReturnEnd + 2;

if (returnIdx === -1 || anchorIdx === -1 || lastReturnEnd === -1) {
    console.log("Could not find anchors", { returnIdx, anchorIdx, lastReturnEnd });
    process.exit(1);
}

const newRenderBlock = `return (
    <div className="flex flex-col h-full bg-[#f4f5f7]">
      {/* Page Header / Global Actions */}
      <div className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 z-20 shadow-sm relative">
         <div className="flex items-center gap-4">
            <div className="flex flex-col">
                <h2 className="text-[15px] font-bold text-slate-800 tracking-tight flex items-center gap-2">
                   Mining Intelligence & Analytics
                   {globalStatus === 'running' && <span className="flex h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />}
                </h2>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Workspace CS-2026-0147</span>
            </div>
         </div>
         <div className="flex items-center gap-3">
            {globalStatus === 'running' ? (
               <Button onClick={stopChain} variant="destructive" className="h-8 text-[10px] font-bold gap-1.5 px-4 bg-rose-600 hover:bg-rose-700 shadow-sm border-none text-white"><StopCircle className="h-3.5 w-3.5" /> Terminate All</Button>
            ) : globalStatus === 'blocked' ? (
               <Button onClick={continueChain} className="h-8 text-[10px] font-bold gap-1.5 px-4 bg-amber-500 hover:bg-amber-600 shadow-sm border-none text-white"><FastForward className="h-3.5 w-3.5" /> Resume Chain</Button>
            ) : (
               <Button onClick={startFullChain} className="h-8 text-[10px] font-bold gap-2 px-6 bg-slate-800 hover:bg-black shadow-lg shadow-slate-200 border-none text-white">
                  <Play className="h-3 w-3" fill="currentColor" /> Run Full Intelligence Chain
               </Button>
            )}
            <div className="w-px h-6 bg-slate-200 mx-1" />
            <Button variant="outline" className="h-8 w-8 p-0 border-slate-200 text-slate-400 hover:text-slate-800"><History className="h-4 w-4" /></Button>
            <Button variant="outline" className="h-8 w-8 p-0 border-slate-200 text-slate-400 hover:text-slate-800"><Settings className="h-4 w-4" /></Button>
         </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
         {/* PANEL 1: LEFT - ENGINE STACK (340px) */}
         <div className="w-[340px] border-r border-slate-200 bg-[#FCFCFD] flex flex-col shrink-0 z-10 shadow-[2px_0_10px_rgba(0,0,0,0.02)]">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white/50">
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Orchestration Modules</span>
               <div className="flex gap-2">
                   <div className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">{stats.completed}/{stats.total}</div>
               </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
               {agents.map((agent) => {
                  const isSelected = selectedAgentId === agent.id;
                  return (
                    <div 
                       key={agent.id} 
                       onClick={() => setSelectedAgentId(agent.id)}
                       className={\`group relative p-4 rounded-xl border transition-all cursor-pointer \${
                          isSelected 
                          ? 'bg-white border-blue-500 shadow-md ring-1 ring-blue-500/10' 
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
                       }\`}
                    >
                       {/* Status Bar */}
                       <div className={\`absolute top-0 left-4 right-4 h-[3px] rounded-b-full transition-all \${
                           agent.status === 'completed' ? 'bg-emerald-500' :
                           agent.status === 'running' ? 'bg-blue-500 animate-pulse' :
                           agent.status === 'blocked' ? 'bg-amber-500' :
                           agent.status === 'failed' ? 'bg-rose-500' :
                           'bg-slate-200'
                       }\`} />

                       <div className="flex items-start gap-4 mt-1">
                          <div className={\`mt-1 h-9 w-9 rounded-lg flex items-center justify-center border shadow-sm transition-colors \${
                             isSelected ? 'bg-blue-50 border-blue-100 text-blue-600' : 'bg-slate-50 border-slate-100 text-slate-400'
                          }\`}>
                             <agent.icon className="h-4.5 w-4.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                             <div className="flex items-center justify-between mb-0.5">
                                <h3 className={\`text-[13px] font-bold tracking-tight truncate \${isSelected ? 'text-blue-600' : 'text-slate-800'}\`}>{agent.name}</h3>
                                <span className={\`text-[8px] font-black uppercase px-1.5 py-0.5 rounded border \${getStatusColor(agent.status)}\`}>
                                   {agent.status}
                                </span>
                             </div>
                             <p className="text-[10px] text-slate-400 font-medium leading-tight mb-3 line-clamp-1">{agent.purpose}</p>
                             
                             <div className="flex items-center justify-between gap-2">
                                <div className="flex flex-col">
                                   <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Confidence</span>
                                   <span className="text-[10px] font-bold text-slate-700 leading-none">{agent.confidence || "—"}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                   <Button 
                                      size="sm" 
                                      variant="ghost" 
                                      onClick={(e) => runSingle(agent.id, e)}
                                      disabled={agent.status === 'running'}
                                      className="h-7 w-7 p-0 rounded-md hover:bg-slate-100 text-slate-500"
                                   >
                                      <Play className="h-3 w-3" fill="currentColor" />
                                   </Button>
                                   <button className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-slate-100 text-slate-400">
                                      <MoreHorizontal className="h-4 w-4" />
                                   </button>
                                </div>
                             </div>
                          </div>
                       </div>
                    </div>
                  );
               })}
            </div>
            {/* Legend / Mini Footer */}
            <div className="p-4 border-t border-slate-100 bg-white/50 grid grid-cols-2 gap-2 text-[9px] font-bold text-slate-400 px-5 pb-6">
               <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Resolved</div>
               <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Running</div>
               <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Blocked</div>
               <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-slate-200" /> Idle</div>
            </div>
         </div>

         {/* PANEL 2: CENTER - RESULT CANVAS (Dominant) */}
         <div className="flex-1 bg-[#EBEDF2] flex flex-col items-center justify-center relative p-8 custom-scrollbar">
            {/* Background Texture / Grid */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#1e293b 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
            
            {!selectedAgentId ? (
                <div className="flex flex-col items-center text-center max-w-sm animate-in fade-in slide-in-from-bottom-4">
                    <div className="h-16 w-16 rounded-3xl bg-white border border-slate-200 shadow-md flex items-center justify-center mb-6">
                        <LayoutGrid className="h-7 w-7 text-slate-200" />
                    </div>
                    <h3 className="text-base font-bold text-slate-500 mb-2">Select a processing module</h3>
                    <p className="text-xs text-slate-400 font-medium">Choose an engine from the left panel to inspect investigation findings and structured proof-points.</p>
                </div>
            ) : (
                <div className="flex flex-col items-center gap-8 w-full h-full relative z-10 max-w-[1200px]">
                    {/* Floating Toolbar (Optional but nice) */}
                    <div className="bg-white/80 backdrop-blur-md border border-slate-200 px-4 py-2 rounded-full shadow-lg flex items-center gap-4 animate-in slide-in-from-top-4">
                        <div className="flex items-center gap-1">
                            <Button onClick={() => setZoom(Math.max(50, zoom - 10))} variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500"><ZoomOut className="h-3.5 w-3.5" /></Button>
                            <span className="text-[11px] font-black text-slate-600 w-10 text-center">{zoom}%</span>
                            <Button onClick={() => setZoom(Math.min(150, zoom + 10))} variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500"><ZoomIn className="h-3.5 w-3.5" /></Button>
                        </div>
                        <div className="w-px h-4 bg-slate-300" />
                        <div className="flex gap-1">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500"><Undo className="h-3.5 w-3.5" /></Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500"><Redo className="h-3.5 w-3.5" /></Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500"><Maximize className="h-3.5 w-3.5" /></Button>
                        </div>
                        <div className="w-px h-4 bg-slate-300" />
                        <Button 
                           onClick={handleExport} 
                           disabled={isExporting} 
                           variant="ghost" 
                           size="sm" 
                           className="h-8 gap-2 text-[10px] font-bold text-blue-600 hover:bg-blue-50"
                        >
                           {isExporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />} 
                           Export
                        </Button>
                    </div>

                    {/* The Canvas */}
                    <div className="flex-1 flex items-center justify-center w-full min-h-0">
                         <div 
                            className="bg-white border border-slate-300 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)] flex flex-col relative transition-all origin-center" 
                            style={{ 
                                width: '1024px', 
                                minHeight: '576px', 
                                aspectRatio: '16/9',
                                transform: \`scale(\${zoom/100})\`
                            }}
                         >
                            <div className="flex-1 p-[60px] flex flex-col relative overflow-hidden h-full">
                               {/* Slide Header Context */}
                               <div className="absolute top-8 left-[60px] right-[60px] flex items-center justify-between pointer-events-none opacity-40">
                                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{selectedAgent?.name} / Slide {activeSlide + 1}</span>
                                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">BC-OPS-CS2026</span>
                               </div>

                               {/* Dynamic Content Mapping */}
                               {slides[activeSlide]?.type === 'summary' && (
                                  <div className="flex flex-col h-full animate-in fade-in duration-300">
                                     <h2 contentEditable suppressContentEditableWarning className="text-[42px] font-black text-[#0f172a] leading-tight tracking-tighter outline-none mb-10 hover:bg-slate-50 p-2 -ml-2 rounded border border-transparent hover:border-slate-200 transition-colors focus:bg-white">{slides[activeSlide].title}</h2>
                                     
                                     <div className="grid grid-cols-4 gap-8 mb-12 shrink-0 pb-10 border-b border-slate-100">
                                        {[
                                           { label: 'Date Logged', val: slides[activeSlide].content.date },
                                           { label: 'Time Trace', val: slides[activeSlide].content.time },
                                           { label: 'Sector Zone', val: slides[activeSlide].content.location },
                                           { label: 'Class Type', val: slides[activeSlide].content.incidentType }
                                        ].map(item => (
                                           <div key={item.label} className="group">
                                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2 cursor-text">{item.label}</span>
                                              <div contentEditable suppressContentEditableWarning className="text-[16px] font-bold text-slate-800 outline-none hover:bg-slate-50 p-1 -ml-1 rounded">{item.val}</div>
                                           </div>
                                        ))}
                                     </div>

                                     <div className="flex-1 bg-[#FAFAFA] border border-[#E5E7EB] rounded-2xl p-10 relative group hover:border-slate-300 transition-colors">
                                        <div className="absolute top-0 left-0 w-2 h-full bg-[#10b981] rounded-l-2xl" />
                                        <span className="text-[11px] font-black text-[#059669] uppercase tracking-[0.15em] block mb-5">Professional Narrative Summary</span>
                                        <div contentEditable suppressContentEditableWarning className="text-[17px] text-slate-700 font-medium leading-[1.8] outline-none hover:bg-white p-2 -ml-2 rounded-md h-[calc(100%-40px)] overflow-y-auto custom-scrollbar">{slides[activeSlide].content.summary}</div>
                                     </div>
                                  </div>
                               )}

                               {/* Fact & Chronology Timeline Slide */}
                               {slides[activeSlide]?.type === 'timeline' && (
                                  <div className="flex flex-col h-full animate-in fade-in duration-300">
                                     <h2 contentEditable suppressContentEditableWarning className="text-[34px] font-black text-[#0f172a] leading-tight tracking-tighter outline-none mb-10 hover:bg-slate-50 p-2 -ml-2 rounded border border-transparent hover:border-slate-200">{slides[activeSlide].title}</h2>
                                     <div className="flex-1 grid grid-cols-3 gap-10 min-h-0">
                                        {/* Phased Views */}
                                        {[
                                           { label: 'Pre-Contact Phase', color: '#10B981', data: slides[activeSlide].content.praKontak },
                                           { label: 'Contact Phase', color: '#F43F5E', data: slides[activeSlide].content.kontak },
                                           { label: 'Post-Contact Phase', color: '#F59E0B', data: slides[activeSlide].content.pascaKontak }
                                        ].map(phase => (
                                           <div key={phase.label} className="flex flex-col min-h-0 h-full">
                                              <div className="border-b-4 pb-3 mb-6 shrink-0" style={{ borderColor: phase.color }}>
                                                 <span className="text-[11px] font-black uppercase tracking-widest opacity-80" style={{ color: phase.color }}>{phase.label}</span>
                                              </div>
                                              <div className="space-y-5 overflow-y-auto custom-scrollbar flex-1 pr-2 pb-4">
                                                 {phase.data.map((item, idx) => (
                                                    <div key={idx} className="bg-white border border-[#E5E7EB] p-4 rounded-xl shadow-sm relative pl-6 hover:border-blue-400 hover:shadow-md transition-all">
                                                       <div className="absolute left-0 top-0 bottom-0 w-2.5 rounded-l-xl" style={{ backgroundColor: phase.color }} />
                                                       <div contentEditable suppressContentEditableWarning className="text-[12px] font-black text-slate-800 mb-1 outline-none">{item.waktu}</div>
                                                       <div contentEditable suppressContentEditableWarning className="text-[13px] font-bold text-slate-600 leading-[1.6] outline-none mb-4">{item.kejadian}</div>
                                                       <div className="flex gap-2">
                                                          <span className="text-[9px] bg-slate-100 px-2 py-0.5 rounded-sm text-slate-500 font-bold">{item.evidence}</span>
                                                          <span className="text-[9px] bg-slate-50 px-2 py-0.5 rounded-sm border border-slate-200 text-slate-700 font-black">{item.confidence}</span>
                                                       </div>
                                                    </div>
                                                 ))}
                                              </div>
                                           </div>
                                        ))}
                                     </div>
                                  </div>
                               )}

                               {/* Actor Intelligence Overview Slide */}
                               {slides[activeSlide]?.type === 'actor_summary' && (
                                  <div className="flex flex-col h-full animate-in fade-in duration-300">
                                     <h2 contentEditable suppressContentEditableWarning className="text-[40px] font-black text-[#0f172a] leading-tight tracking-tighter outline-none mb-10 hover:bg-slate-50 p-2 -ml-2 rounded">{slides[activeSlide].title}</h2>
                                     <div className="flex-1 grid grid-cols-2 gap-10">
                                        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-10 shadow-sm relative flex flex-col">
                                            <div className="absolute top-0 left-0 w-2.5 h-full bg-blue-600 rounded-l-2xl" />
                                            <span className="text-[12px] font-black text-blue-600 uppercase tracking-widest block mb-8">Operational Archetype Analysis</span>
                                            <div className="space-y-6 flex-1">
                                                {[
                                                   { k: 'Identified Actors', v: slides[activeSlide].content.ringkasan.jumlah_aktor + ' Personnel' },
                                                   { k: 'Primary Operator', v: slides[activeSlide].content.ringkasan.aktor_utama, accent: 'text-rose-700' },
                                                   { k: 'Active Supv', v: slides[activeSlide].content.ringkasan.aktor_pendukung },
                                                   { k: 'Behavior Signal', v: slides[activeSlide].content.ringkasan.sinyal_dominan }
                                                ].map(item => (
                                                   <div key={item.k} className="grid grid-cols-[160px_1fr] items-center border-b border-slate-50 pb-5 last:border-none">
                                                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">{item.k}</span>
                                                      <div contentEditable suppressContentEditableWarning className={\`text-[16px] font-black outline-none \${item.accent || 'text-slate-800'}\`}>{item.v}</div>
                                                   </div>
                                                ))}
                                            </div>
                                            <div className="mt-10 border-t border-slate-100 pt-8">
                                                <div contentEditable suppressContentEditableWarning className="text-[16px] font-medium text-slate-600 leading-relaxed outline-none">{slides[activeSlide].content.ringkasan.catatan_cepat}</div>
                                            </div>
                                        </div>
                                        <div className="bg-[#f8fafc] border border-slate-200 rounded-2xl p-10 shadow-sm flex flex-col relative">
                                            <div className="absolute top-0 left-0 w-2.5 h-full bg-amber-500 rounded-l-2xl" />
                                            <span className="text-[12px] font-black text-amber-600 uppercase tracking-widest block mb-8">High-Value Intelligence Findings</span>
                                            <ul className="space-y-6 list-disc pl-8 flex-1">
                                                {slides[activeSlide].content.temuan_utama.map((item, idx) => (
                                                    <li key={idx} contentEditable suppressContentEditableWarning className="text-[16px] font-bold text-slate-700 leading-relaxed outline-none">{item}</li>
                                                ))}
                                            </ul>
                                        </div>
                                     </div>
                                  </div>
                               )}

                               {/* Actor Profiles Slide */}
                               {slides[activeSlide]?.type === 'actor_profiles' && (
                                  <div className="flex flex-col h-full animate-in fade-in duration-300">
                                     <h2 contentEditable suppressContentEditableWarning className="text-[40px] font-black text-[#0f172a] tracking-tight outline-none mb-8 hover:bg-slate-50 p-2 -ml-2 rounded">{slides[activeSlide].title}</h2>
                                     <div className="flex-1 grid grid-cols-2 gap-8 overflow-y-auto custom-scrollbar pb-10 pr-4 content-start">
                                         {slides[activeSlide].content.map((aktor, i) => (
                                             <div key={i} className="bg-white border border-slate-200 rounded-2xl flex flex-col shadow-sm hover:border-blue-400 hover:shadow-lg transition-all relative overflow-hidden shrink-0 min-h-[480px]">
                                                 <div className="h-4 w-full bg-[#1e293b] shrink-0" />
                                                 <div className="p-8">
                                                     <div className="flex items-start gap-6 border-b border-slate-100 pb-8 mb-8">
                                                         <div className="w-20 h-20 rounded-full overflow-hidden shrink-0 border-4 border-slate-50 shadow-inner bg-slate-100 flex items-center justify-center">
                                                             {aktor.photo ? <img src={aktor.photo} className="w-full h-full object-cover" alt="Actor" /> : <Users className="h-8 w-8 text-slate-300" />}
                                                         </div>
                                                         <div className="flex-1">
                                                             <div contentEditable suppressContentEditableWarning className="text-[22px] font-black text-slate-900 leading-tight outline-none mb-1.5">{aktor.nama}</div>
                                                             <div contentEditable suppressContentEditableWarning className="text-[13px] font-bold text-blue-600 uppercase tracking-wider outline-none">{aktor.peran}</div>
                                                             <div className="text-[11px] font-bold text-slate-400 mt-2">NRP: {aktor.nrp} &bull; {aktor.perusahaan}</div>
                                                         </div>
                                                     </div>
                                                     <div className="grid grid-cols-3 gap-6 mb-10">
                                                        {[
                                                           { l: 'Age', v: aktor.umur },
                                                           { l: 'Service', v: aktor.masa_kerja },
                                                           { l: 'SID', v: aktor.kompetensi.sid, color: 'text-emerald-600' },
                                                           { l: 'SIMPER', v: aktor.kompetensi.simper, color: 'text-emerald-600' },
                                                           { l: 'Comp.', v: aktor.kompetensi.utama }
                                                        ].map(stat => (
                                                           <div key={stat.l}>
                                                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">{stat.l}</span>
                                                              <div contentEditable suppressContentEditableWarning className={\`text-[14px] font-black outline-none \${stat.color || 'text-slate-800'}\`}>{stat.v}</div>
                                                           </div>
                                                        ))}
                                                     </div>
                                                     <div className="space-y-6">
                                                        {[
                                                           { l: 'Event Involvement', v: aktor.keterlibatan, b: 'border-slate-300' },
                                                           { l: 'Behavior Signal', v: aktor.sinyal_perilaku, b: 'border-amber-400' },
                                                           { l: 'Human Performance Rating', v: aktor.performa_manusia, b: 'border-rose-400' }
                                                        ].map(row => (
                                                           <div key={row.l}>
                                                              <span className={\`text-[10px] font-black uppercase tracking-widest block mb-2 border-l-4 pl-3 \${row.b.replace('border-','text-')}\`}>{row.l}</span>
                                                              <div contentEditable suppressContentEditableWarning className="text-[14px] font-medium text-slate-700 leading-relaxed outline-none pl-4">{row.v}</div>
                                                           </div>
                                                        ))}
                                                     </div>
                                                 </div>
                                             </div>
                                         ))}
                                     </div>
                                  </div>
                               )}

                               {/* PEEPO Synthesis Slide */}
                               {slides[activeSlide]?.type === 'peepo_synthesis' && (
                                  <div className="flex flex-col h-full animate-in fade-in duration-300">
                                     <h2 contentEditable suppressContentEditableWarning className="text-[40px] font-black text-[#0f172a] leading-tight tracking-tighter outline-none mb-10 hover:bg-slate-50 p-2 -ml-2 rounded">{slides[activeSlide].title}</h2>
                                     <div className="flex-1 flex flex-col gap-10">
                                         <div className="bg-white border border-[#E5E7EB] rounded-2xl p-10 shadow-sm group hover:border-slate-400 transition-all relative flex-1">
                                            <div className="absolute top-0 left-0 w-2.5 h-full bg-[#1e293b] rounded-l-2xl" />
                                            <span className="text-[13px] font-black text-slate-500 uppercase tracking-widest block mb-8">PEEPO Contextual Executive Breakdown</span>
                                            <div className="grid grid-cols-[200px_1fr] items-center gap-y-6 pb-10 border-b border-slate-100">
                                                <span className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Dominant Findings</span>
                                                <div contentEditable suppressContentEditableWarning className="text-[20px] font-black text-rose-700 outline-none">{slides[activeSlide].content.ringkasan.temuan_dominan}</div>
                                                
                                                <span className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Causality Direction</span>
                                                <div contentEditable suppressContentEditableWarning className="text-[18px] font-bold text-slate-700 outline-none">{slides[activeSlide].content.ringkasan.arah_penyebab}</div>
                                            </div>
                                            <div className="mt-8">
                                                <div contentEditable suppressContentEditableWarning className="text-[17px] font-medium text-slate-600 outline-none leading-relaxed italic border-l-4 border-slate-200 pl-6">"{slides[activeSlide].content.ringkasan.catatan_cepat}"</div>
                                            </div>
                                         </div>

                                         <div className="bg-[#f0f9ff] border border-[#bae6fd] rounded-2xl p-10 shadow-sm relative flex-1">
                                            <span className="text-[13px] font-black text-sky-700 uppercase tracking-widest block mb-8">Integrated Intelligence Synthesis</span>
                                            <div className="grid grid-cols-3 gap-8 mb-10">
                                                {[
                                                   { l: 'Dominant Factor', v: slides[activeSlide].content.synthesis.faktor_dominan },
                                                   { l: 'Contributing Force', v: slides[activeSlide].content.synthesis.faktor_pendukung },
                                                   { l: 'Proximal Trigger', v: slides[activeSlide].content.synthesis.faktor_pemicu }
                                                ].map(f => (
                                                   <div key={f.l} className="bg-white rounded-xl p-6 border border-sky-100 shadow-sm">
                                                      <span className="text-[11px] font-black text-sky-600 uppercase tracking-widest block mb-2">{f.l}</span>
                                                      <div contentEditable suppressContentEditableWarning className="text-[15px] font-black text-slate-800 outline-none leading-tight">{f.v}</div>
                                                   </div>
                                                ))}
                                            </div>
                                            <div className="bg-white rounded-xl p-8 border border-sky-100 shadow-sm">
                                                <span className="text-[11px] font-black text-sky-600 uppercase tracking-widest block mb-3">Final Incident Interpretation</span>
                                                <div contentEditable suppressContentEditableWarning className="text-[17px] font-medium text-slate-700 leading-[1.8] outline-none">{slides[activeSlide].content.synthesis.interpretasi}</div>
                                            </div>
                                         </div>
                                     </div>
                                  </div>
                               )}

                               {/* PEEPO Factor Cards Slide */}
                               {slides[activeSlide]?.type === 'peepo_factor_cards' && (
                                  <div className="flex flex-col h-full animate-in fade-in duration-300">
                                     <h2 contentEditable suppressContentEditableWarning className="text-[36px] font-black text-[#0f172a] leading-tight outline-none mb-10 hover:bg-slate-50 p-2 -ml-2 rounded">{slides[activeSlide].title}</h2>
                                     <div className={"flex-1 grid gap-10 min-h-0 " + (slides[activeSlide].content.length === 1 ? 'grid-cols-1 mx-auto max-w-3xl w-full' : 'grid-cols-2')}>
                                         {slides[activeSlide].content.map((card, idx) => (
                                             <div key={idx} className={"border rounded-2xl flex flex-col shadow-sm relative overflow-hidden bg-white " + card.border}>
                                                 <div className={"h-4 w-full shrink-0 " + card.marker} />
                                                 <div className={"px-8 py-5 border-b shrink-0 " + card.bg + " " + card.border}>
                                                     <span contentEditable suppressContentEditableWarning className={"text-[18px] font-black uppercase tracking-[0.1em] outline-none " + card.text}>{card.title}</span>
                                                 </div>
                                                 <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar flex-1">
                                                     <div>
                                                         <span className="text-[12px] font-black text-slate-400 uppercase tracking-widest block mb-4 border-l-4 border-slate-300 pl-4">Core Findings</span>
                                                         <ul className="space-y-3 list-disc pl-10">
                                                             {card.data.temuan.map((item, idxx) => (
                                                                 <li key={idxx} contentEditable suppressContentEditableWarning className="text-[15px] font-bold text-slate-700 leading-snug outline-none">{item}</li>
                                                             ))}
                                                         </ul>
                                                     </div>
                                                     <div>
                                                         <span className="text-[12px] font-black text-slate-400 uppercase tracking-widest block mb-4 border-l-4 border-rose-400 pl-4">Standard Deviations</span>
                                                         <ul className="space-y-3 list-disc pl-10">
                                                             {card.data.deviasi.map((item, idxx) => (
                                                                 <li key={idxx} contentEditable suppressContentEditableWarning className="text-[15px] font-bold text-rose-800 leading-snug outline-none">{item}</li>
                                                             ))}
                                                         </ul>
                                                     </div>
                                                     <div className="pt-4 border-t border-slate-50">
                                                         <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-3 pl-4">Incident Impact Vector</span>
                                                         <div contentEditable suppressContentEditableWarning className="text-[15px] font-black text-slate-800 leading-relaxed outline-none pl-4 border-l-4 border-amber-400">{card.data.dampak}</div>
                                                     </div>
                                                 </div>
                                             </div>
                                         ))}
                                     </div>
                                  </div>
                               )}

                               {/* IPLS Classification / Root Cause Slide */}
                               {slides[activeSlide]?.type === 'ipls_summary' && (
                                  <div className="flex flex-col h-full animate-in fade-in duration-300">
                                     <h2 contentEditable suppressContentEditableWarning className="text-[36px] font-black text-[#0f172a] leading-tight outline-none mb-8 hover:bg-slate-50 p-2 -ml-2 rounded">{slides[activeSlide].title}</h2>
                                     <div className="flex-1 flex flex-col gap-8 min-h-0">
                                         <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm relative shrink-0">
                                            <div className="absolute top-0 left-0 w-2.5 h-full bg-blue-600 rounded-l-2xl" />
                                            <div className="grid grid-cols-[auto_1fr_auto_1fr] items-center gap-x-10 gap-y-6 px-4">
                                                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Dominant Root</span>
                                                <div contentEditable suppressContentEditableWarning className="text-[15px] font-black text-slate-800 outline-none">{slides[activeSlide].content.ringkasan.root_dominan}</div>
                                                
                                                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Vulnerable Layer</span>
                                                <div contentEditable suppressContentEditableWarning className="text-[16px] font-black text-rose-600 outline-none">{slides[activeSlide].content.ringkasan.layer_lemah}</div>

                                                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Non-Conformity</span>
                                                <div className="col-span-3" contentEditable suppressContentEditableWarning><span className="text-[15px] font-bold text-amber-700 outline-none">{slides[activeSlide].content.ringkasan.non_conformity}</span></div>
                                            </div>
                                         </div>

                                         <div className="flex-1 flex gap-8 min-h-0 overflow-hidden pb-4">
                                            <div className="bg-[#f0f9ff] border border-sky-200 rounded-2xl p-8 shadow-sm relative flex-[1.6] flex flex-col overflow-y-auto custom-scrollbar">
                                                <span className="text-[13px] font-black text-sky-700 uppercase tracking-widest block mb-6 border-b border-sky-200 pb-5">Root Cause Taxonomy</span>
                                                <div className="space-y-8 flex-1">
                                                    <div>
                                                        <span className="text-[11px] font-black text-sky-600 uppercase tracking-[0.1em] block mb-3">Primary Root Causes</span>
                                                        <ul className="space-y-3 list-disc pl-10">
                                                            {slides[activeSlide].content.root_cause.root.map((r, ri) => <li key={ri} className="text-[15px] font-black text-slate-800 leading-snug outline-none" contentEditable suppressContentEditableWarning>{r}</li>)}
                                                        </ul>
                                                    </div>
                                                    <div>
                                                        <span className="text-[11px] font-black text-sky-600 uppercase tracking-[0.1em] block mb-3">Broken/Failed Controls</span>
                                                        <ul className="space-y-3 list-disc pl-10">
                                                            {slides[activeSlide].content.root_cause.missing_layer.map((m, mi) => <li key={m} className="text-[15px] font-black text-rose-700 leading-snug outline-none" contentEditable suppressContentEditableWarning>{m}</li>)}
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="bg-[#fff1f2] border border-rose-200 rounded-2xl p-8 shadow-sm relative flex-1 flex flex-col overflow-y-auto custom-scrollbar">
                                                <span className="text-[13px] font-black text-rose-800 uppercase tracking-widest block mb-6 border-b border-rose-200 pb-5">Mitigation Priority</span>
                                                <div className="space-y-5">
                                                    {slides[activeSlide].content.layer_priority.map((lp, lpi) => (
                                                        <div key={lpi} className="bg-white rounded-xl border border-rose-100 p-5 shadow-sm group hover:border-rose-400 transition-all">
                                                            <div className="flex items-center gap-3 mb-2">
                                                                <div className="bg-rose-600 text-white w-5 h-5 rounded-md text-[10px] font-black flex items-center justify-center shrink-0">{lpi + 1}</div>
                                                                <span className="text-[13px] font-black text-rose-800 uppercase tracking-tight outline-none" contentEditable suppressContentEditableWarning>{lp.layer}</span>
                                                            </div>
                                                            <div className="text-[13px] font-medium text-slate-600 leading-relaxed outline-none pl-8" contentEditable suppressContentEditableWarning>{lp.alasan}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                         </div>
                                     </div>
                                  </div>
                               )}

                               {/* Prevention Engine Summary Slide */}
                               {slides[activeSlide]?.type === 'prev_summary' && (
                                  <div className="flex flex-col h-full animate-in fade-in duration-300">
                                     <h2 contentEditable suppressContentEditableWarning className="text-[40px] font-black text-[#0f172a] tracking-tight outline-none mb-10 hover:bg-slate-50 p-2 -ml-2 rounded">{slides[activeSlide].title}</h2>
                                     <div className="flex-1 flex gap-8 pb-4 h-0 min-h-0">
                                        <div className="w-[48%] flex flex-col gap-8">
                                            <div className="bg-[#1e293b] rounded-2xl p-10 shadow-lg relative shrink-0">
                                                <div className="absolute top-0 left-0 w-2.5 h-full bg-blue-600 rounded-l-2xl" />
                                                <span className="text-[13px] font-black text-slate-400 uppercase tracking-widest block mb-8 px-2">Strategic Control Summary</span>
                                                <div className="grid grid-cols-[140px_1fr] items-center gap-y-6 px-2 pb-8 border-b border-slate-700">
                                                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Action Items</span>
                                                    <div contentEditable suppressContentEditableWarning className="text-[18px] font-black text-white outline-none">{slides[activeSlide].content.ringkasan.jumlah_action} Required Actions</div>
                                                    
                                                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Crit. Priority</span>
                                                    <div contentEditable suppressContentEditableWarning className="text-[18px] font-black text-rose-400 outline-none uppercase tracking-tighter">{slides[activeSlide].content.ringkasan.prioritas}</div>

                                                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Main Strategy</span>
                                                    <div contentEditable suppressContentEditableWarning className="text-[16px] font-bold text-sky-400 outline-none">{slides[activeSlide].content.ringkasan.fokus_utama}</div>
                                                </div>
                                                <div className="mt-8 px-2">
                                                    <div contentEditable suppressContentEditableWarning className="text-[15px] font-medium text-slate-400 outline-none leading-relaxed italic border-l-4 border-slate-600 pl-6">"{slides[activeSlide].content.ringkasan.catatan_cepat}"</div>
                                                </div>
                                            </div>

                                            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm flex-1 flex flex-col overflow-y-auto custom-scrollbar">
                                                <span className="text-[12px] font-black text-emerald-600 uppercase tracking-widest block mb-6 border-b border-emerald-50 pb-4">Continuous Monitoring Focus</span>
                                                <ul className="space-y-4 list-disc pl-8 mb-10">
                                                    {slides[activeSlide].content.fokus_monitoring.map((m, mi) => (
                                                        <li key={mi} contentEditable suppressContentEditableWarning className="text-[14px] font-bold text-slate-700 outline-none leading-snug">{m}</li>
                                                    ))}
                                                </ul>
                                                <span className="text-[12px] font-black text-rose-600 uppercase tracking-widest block mb-6 border-b border-rose-50 pb-4">Residual Risk exposure</span>
                                                <ul className="space-y-4 list-disc pl-8">
                                                    {slides[activeSlide].content.risiko.map((r, ri) => (
                                                        <li key={ri} contentEditable suppressContentEditableWarning className="text-[14px] font-bold text-rose-900 outline-none leading-snug">{r}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                        
                                        <div className="flex-1 flex flex-col gap-8 bg-[#f8fafc] border border-slate-200 rounded-2xl p-10 shadow-inner overflow-y-auto custom-scrollbar">
                                            <span className="text-[15px] font-black text-slate-800 uppercase tracking-[0.15em] block mb-2">Implementation Roadmap</span>
                                            <div className="space-y-10">
                                                {[
                                                   { label: 'Immediate Field Actions (0-48h)', color: 'bg-rose-600', sub: 'bg-rose-50', text: 'text-rose-900', data: slides[activeSlide].content.prioritas.immediate, pulse: true },
                                                   { label: 'Preventive Tech Guarding (1-4 Weeks)', color: 'bg-amber-500', sub: 'bg-amber-50', text: 'text-amber-900', data: slides[activeSlide].content.prioritas.short_term },
                                                   { label: 'Structural / Organizational Alignment', color: 'bg-indigo-600', sub: 'bg-indigo-50', text: 'text-indigo-900', data: slides[activeSlide].content.prioritas.long_term }
                                                ].map(tier => (
                                                   <div key={tier.label} className={\`rounded-2xl p-8 shadow-sm border \${tier.sub.replace('bg-','border-')} \${tier.sub}\`}>
                                                      <div className="flex items-center gap-3 mb-6">
                                                         <div className={\`w-2.5 h-2.5 rounded-full \${tier.color} \${tier.pulse ? 'animate-pulse' : ''}\`} />
                                                         <span className={\`text-[13px] font-black uppercase tracking-widest \${tier.text.replace('900','700')}\`}>{tier.label}</span>
                                                      </div>
                                                      <ul className="space-y-3 list-disc pl-8">
                                                         {tier.data.map((i, idx) => (
                                                            <li key={idx} contentEditable suppressContentEditableWarning className={\`text-[15px] font-black outline-none leading-tight \${tier.text}\`}>{i}</li>
                                                         ))}
                                                      </ul>
                                                   </div>
                                                ))}
                                            </div>
                                        </div>
                                     </div>
                                  </div>
                               )}

                               {/* Prevention Action Register Slide */}
                               {slides[activeSlide]?.type === 'prev_action_log' && (
                                  <div className="flex flex-col h-full animate-in fade-in duration-300">
                                     <h2 contentEditable suppressContentEditableWarning className="text-[40px] font-black text-[#0f172a] leading-tight outline-none mb-10 hover:bg-slate-50 p-2 -ml-2 rounded">{slides[activeSlide].title}</h2>
                                     <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 space-y-6 pb-6">
                                         {slides[activeSlide].content.map((act, idx) => (
                                             <div key={idx} className="bg-white border-2 border-slate-100 rounded-3xl shadow-sm hover:border-blue-400 hover:shadow-xl transition-all overflow-hidden flex flex-col group relative shrink-0">
                                                 <div className={"absolute top-0 left-0 w-2.5 h-full " + (act.kategori==='Corrective' ? 'bg-amber-400' : 'bg-emerald-400')} />
                                                 <div className="bg-[#f8fafc] px-10 py-4 border-b border-slate-100 flex items-center justify-between">
                                                    <div className="flex items-center gap-6">
                                                        <span className="bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest outline-none" contentEditable suppressContentEditableWarning>{act.kategori} Action</span>
                                                        <span className="text-[12px] font-black text-slate-400 uppercase tracking-widest block outline-none" contentEditable suppressContentEditableWarning>{act.hirarki}</span>
                                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                                                        <span className="text-[12px] font-black text-slate-500 outline-none" contentEditable suppressContentEditableWarning>{act.layer}</span>
                                                    </div>
                                                    <div className={"text-[11px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border-2 " + (act.status === 'Closed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : act.status === 'Open' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-amber-50 text-amber-700 border-amber-200')} contentEditable suppressContentEditableWarning>{act.status}</div>
                                                 </div>
                                                 <div className="p-10 pl-14">
                                                    <div className="grid grid-cols-[1fr_340px] gap-12">
                                                        <div>
                                                            <span className="text-[11px] font-black text-slate-300 uppercase tracking-widest block mb-3">Tindakan & Deskripsi Mitigasi</span>
                                                            <div contentEditable suppressContentEditableWarning className="text-[20px] font-black text-slate-900 outline-none leading-tight mb-5 tracking-tight">{act.tindakan}</div>
                                                            <div contentEditable suppressContentEditableWarning className="text-[15px] font-medium text-slate-500 outline-none leading-relaxed border-l-4 border-slate-100 pl-6 italic">"{act.tujuan}"</div>
                                                            <div className="mt-8 pt-8 border-t border-slate-50 flex items-center gap-4">
                                                                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Internal Memo:</span>
                                                                <div contentEditable suppressContentEditableWarning className="text-[13px] font-black text-amber-800 outline-none bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100">{act.catatan}</div>
                                                            </div>
                                                        </div>
                                                        <div className="bg-slate-50/50 rounded-2xl p-8 space-y-6">
                                                            <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Date</span>
                                                                <div contentEditable suppressContentEditableWarning className="text-[14px] font-black text-slate-800 outline-none">{act.due_date}</div>
                                                            </div>
                                                            <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ownership (PIC)</span>
                                                                <div contentEditable suppressContentEditableWarning className="text-[14px] font-black text-slate-800 outline-none">{act.pic}</div>
                                                            </div>
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Evidence</span>
                                                                <div contentEditable suppressContentEditableWarning className="text-[12px] font-black text-blue-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm">{act.evidence}</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                 </div>
                                             </div>
                                         ))}
                                     </div>
                                  </div>
                               )}
                               
                               {/* Empty state for modules not run yet */}
                               {!slides[activeSlide] && (
                                   <div className="flex flex-col items-center justify-center h-full text-center">
                                       <Loader2 className="h-10 w-10 text-slate-200 animate-spin mb-6" />
                                       <h3 className="text-xl font-bold text-slate-400 uppercase tracking-widest">Processing Layer</h3>
                                       <p className="text-sm text-slate-300 font-medium">Synthesizing findings from evidence batches...</p>
                                   </div>
                               )}

                               {/* Presentation Footer */}
                               <div className="absolute bottom-[40px] left-[60px] right-[60px] flex justify-between items-center pointer-events-none opacity-40">
                                  <div className="flex items-center gap-3">
                                      <div className="h-4 w-4 bg-slate-800 rounded-sm" />
                                      <span className="text-[9px] font-black text-slate-800 uppercase tracking-[0.2em] font-mono">BERAU COAL INTELLIGENCE UNIT</span>
                                  </div>
                                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] font-mono">STRICTLY CONFIDENTIAL</span>
                               </div>
                            </div>
                         </div>
                    </div>
                </div>
            )}
         </div>

         {/* PANEL 3: RIGHT - UTILITIES (300px) */}
         <div className="w-[300px] border-l border-slate-200 bg-white flex flex-col shrink-0 z-10 shadow-[-2px_0_10px_rgba(0,0,0,0.02)]">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-[#FCFCFD] shrink-0">
               <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Result Properties</span>
               <div className="flex gap-2">
                   <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-slate-400 hover:text-slate-800"><History className="h-4 w-4" /></Button>
                   <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-slate-400 hover:text-slate-800"><Settings className="h-4 w-4" /></Button>
               </div>
            </div>

            {!selectedAgentId ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/50">
                    <ShieldAlert className="h-10 w-10 text-slate-200 mb-4" />
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-2">No Context</span>
                    <p className="text-[10px] text-slate-400 font-medium leading-relaxed">Select a module to view contextual controls and slide settings.</p>
                </div>
            ) : (
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Slide Navigation Area */}
                    <div className="p-5 border-b border-slate-100 flex flex-col shrink-0">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Page Directory</span>
                            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">{activeSlide + 1} / {slides.length}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 overflow-y-auto max-h-[300px] custom-scrollbar pr-2 py-1">
                            {slides.map((s, i) => (
                                <div 
                                    key={s.id} 
                                    onClick={() => setActiveSlide(i)}
                                    className={\`group cursor-pointer relative rounded-lg border-2 transition-all overflow-hidden aspect-video flex flex-col \${
                                        activeSlide === i 
                                        ? 'border-blue-500 bg-blue-50 shadow-md transform scale-[1.02]' 
                                        : 'border-slate-100 bg-white hover:border-slate-300'
                                    }\`}
                                >
                                    <div className="flex-1 p-2 flex flex-col items-center justify-center text-center">
                                        <h4 className={\`text-[9px] font-black \${activeSlide === i ? 'text-blue-700' : 'text-slate-500'}\`}>{s.title}</h4>
                                    </div>
                                    <div className={\`mt-auto px-2 py-1 text-[8px] font-black uppercase \${activeSlide === i ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}\`}>
                                        Slide {i + 1}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Metadata & Controls */}
                    <div className="p-6 flex-1 overflow-y-auto custom-scrollbar space-y-8">
                        <div>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-5">Configuration & Logic</span>
                            <div className="space-y-4">
                               <div className="flex items-center justify-between">
                                  <span className="text-[11px] font-bold text-slate-500">Edit Mode</span>
                                  <div className="h-5 w-10 bg-blue-600 rounded-full flex items-center px-1"><div className="h-3 w-3 bg-white rounded-full ml-auto" /></div>
                               </div>
                               <div className="flex items-center justify-between">
                                  <span className="text-[11px] font-bold text-slate-500">Payload Source</span>
                                  <span className="text-[10px] font-black text-slate-700 bg-slate-100 px-2 py-0.5 rounded uppercase border border-slate-200">Extraction-V4</span>
                               </div>
                               <div className="flex items-center justify-between">
                                  <span className="text-[11px] font-bold text-slate-500">Auto-Update</span>
                                  <div className="h-5 w-10 bg-slate-200 rounded-full flex items-center px-1"><div className="h-3 w-3 bg-white rounded-full" /></div>
                               </div>
                            </div>
                        </div>

                        <div className="border-t border-slate-100 pt-8">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-5">Supporting Citations</span>
                            <div className="space-y-2.5">
                                {evidenceFiles.filter(f => f.tags.includes('key')).slice(0, 3).map(f => (
                                    <div key={f.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between group hover:bg-white hover:border-blue-200 transition-all cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <DocIcon className="h-3.5 w-3.5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                                            <span className="text-[10px] font-bold text-slate-600 truncate max-w-[140px]">{f.name}</span>
                                        </div>
                                        <ExternalLink className="h-3 w-3 text-slate-300 group-hover:text-slate-600" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="pt-4 pb-10">
                            <Button variant="outline" className="w-full h-10 border-slate-200 text-slate-600 font-bold text-[11px] gap-2 hover:bg-slate-50 hover:text-slate-900 shadow-sm transition-all mb-3">
                                <RefreshCcw className="h-3.5 w-3.5" /> Re-execute Module
                            </Button>
                            <Button 
                               onClick={() => { setSelectedAgentId(null); setActiveSlide(0); }}
                               variant="ghost" 
                               className="w-full h-10 text-rose-600 font-bold text-[11px] hover:bg-rose-50 hover:text-rose-700"
                            >
                                <X className="h-3.5 w-3.5 mr-2" /> Deselect Module
                            </Button>
                        </div>
                    </div>
                </div>
            )}
         </div>
      </div>
    </div>
  );`;

text = text.substring(0, returnIdx) + newRenderBlock + text.substring(endIdx);

fs.writeFileSync(CACHE_FILE, text);
console.log("AnalysisTab successfully redesigned!");
