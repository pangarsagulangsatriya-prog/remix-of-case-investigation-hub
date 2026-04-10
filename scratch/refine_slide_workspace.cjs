const fs = require('fs');

const CACHE_FILE = 'src/pages/CaseWorkspacePage.tsx';
let text = fs.readFileSync(CACHE_FILE, 'utf8');

// 1. Add containerRef and fitToWorkspace logic
// Find state definitions in AnalysisTab
const stateAnchor = 'const [isSaving, setIsSaving] = React.useState(false);';
const stateInsert = `
  const containerRef = useRef<HTMLDivElement>(null);
  
  const fitToWorkspace = () => {
    if (!containerRef.current) return;
    // Tighter padding for a more focused feel (Rule 1)
    const cw = containerRef.current.clientWidth - 40; 
    const ch = containerRef.current.clientHeight - 100;
    const scaleW = cw / 1024;
    const scaleH = ch / 576;
    const newZoom = Math.floor(Math.min(scaleW, scaleH) * 100);
    setZoom(Math.min(newZoom, 110)); // Rule 2: avoid oversized but fill comfortably
  };

  useEffect(() => {
    if (selectedAgentId) {
      setTimeout(fitToWorkspace, 50);
    }
  }, [selectedAgentId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') return;
      if (e.key === "ArrowLeft") {
        setActiveSlide(prev => Math.max(0, prev - 1));
      } else if (e.key === "ArrowRight") {
        setActiveSlide(prev => Math.min(slides.length - 1, prev + 1));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [slides.length]);
`;

if (text.includes(stateAnchor)) {
    text = text.replace(stateAnchor, stateAnchor + stateInsert);
}

// 2. Refine the Panel 2 return block
// I'll update the render block to be more PowerPoint-like

const returnIdx = text.indexOf('return (', text.indexOf('function AnalysisTab()'));
const anchor = '}function ReportsTab()';
const anchorIdx = text.indexOf(anchor);
const lastReturnEnd = text.lastIndexOf(');', anchorIdx);
const endIdx = lastReturnEnd + 2;

const newRenderBlock = `return (
    <div className="flex flex-col h-full bg-[#f1f3f6]">
      {/* 1. COMPACT GLOBAL PIPELINE HEADER */}
      <div className="h-12 bg-white border-b border-slate-200 px-5 flex items-center justify-between shrink-0 z-30 shadow-sm relative">
         <div className="flex items-center gap-4">
            <div className="flex flex-col">
                <h2 className="text-[14px] font-bold text-slate-800 tracking-tight flex items-center gap-2 leading-none">
                   Mining Operations Intelligence
                   {globalStatus === 'running' && <span className="flex h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />}
                </h2>
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Pipeline: CS-2026-0147 • {execMode === 'full' ? 'Sequential' : 'Selective'}</span>
            </div>
         </div>
         <div className="flex items-center gap-2">
            {globalStatus === 'running' ? (
               <Button onClick={stopChain} variant="destructive" className="h-7 text-[9px] font-bold px-3 bg-rose-600 shadow-none ring-0 border-none transition-all">Stop Pipeline</Button>
            ) : globalStatus === 'blocked' ? (
               <Button onClick={continueChain} className="h-7 text-[9px] font-bold px-3 bg-amber-500 hover:bg-amber-600 shadow-none border-none transition-all">Resume Chain</Button>
            ) : (
               <Button onClick={startFullChain} className="h-7 text-[9px] font-bold px-5 bg-slate-800 hover:bg-black shadow-lg shadow-slate-200/50 border-none text-white transition-all">
                  Initialize Full Synthesis
               </Button>
            )}
            <div className="w-px h-5 bg-slate-200 mx-1" />
            <Button variant="outline" className="h-7 px-2 border-slate-200 text-slate-400 hover:text-slate-800 text-[9px] font-bold gap-1.5"><History className="h-3.5 w-3.5" /> Logs</Button>
            <Button variant="outline" className="h-7 w-7 p-0 border-slate-200 text-slate-300 hover:text-slate-800"><Settings className="h-3.5 w-3.5" /></Button>
         </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
         {/* PANEL 1: LEFT - ENGINE STACK (320px) */}
         <div className="w-[320px] border-r border-slate-200 bg-white flex flex-col shrink-0 z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
            <div className="p-3 border-b border-slate-100 flex items-center justify-between shrink-0">
               <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Synthesis Engine</span>
               <div className="text-[8px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 uppercase">{stats.completed}/{stats.total}</div>
            </div>
            <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5 custom-scrollbar bg-slate-50/10">
               {agents.map((agent) => {
                  const isSelected = selectedAgentId === agent.id;
                  const isActive = activeTask === agent.id;
                  const isQueued = chainQueue.includes(agent.id) && !isActive;
                  
                  return (
                    <div 
                       key={agent.id} 
                       onClick={() => setSelectedAgentId(agent.id)}
                       className={\`group relative p-3 rounded-lg border transition-all cursor-pointer \${
                          isSelected 
                          ? 'bg-white border-blue-500 shadow-xl shadow-blue-500/5' 
                          : 'bg-white border-slate-200 hover:border-slate-300'
                       } \${isActive ? 'ring-2 ring-blue-500/10' : ''}\`}
                    >
                       <div className="flex items-start gap-3">
                          <div className={\`mt-1 h-8 w-8 rounded-md flex items-center justify-center border shadow-sm transition-colors \${
                             isSelected ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-50 border-slate-200 text-slate-400'
                          }\`}>
                             <agent.icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                             <div className="flex items-center justify-between mb-0.5">
                                <h3 className={\`text-[12px] font-bold truncate \${isSelected ? 'text-blue-600' : 'text-slate-800'}\`}>{agent.name}</h3>
                                <div className={\`h-1.5 w-1.5 rounded-full \${
                                    agent.status === 'completed' ? 'bg-emerald-500' :
                                    agent.status === 'running' ? 'bg-blue-500 animate-pulse' :
                                    'bg-slate-200'
                                }\`} />
                             </div>
                             
                             {isActive ? (
                                <div className="mt-1 mb-1">
                                   <span className="text-[8px] font-bold text-blue-600 uppercase italic animate-pulse">{agent.microStatus || "Processing..."}</span>
                                </div>
                             ) : (
                                <p className="text-[9px] text-slate-400 font-medium leading-tight mb-1 opacity-70 truncate">{agent.purpose}</p>
                             )}

                             <div className="flex items-center gap-3 mt-2 pt-2 border-t border-slate-50">
                                <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">{agent.confidence || "---"}</span>
                                <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest leading-none translate-y-[-0.5px]">CONF</span>
                                <div className="ml-auto flex gap-1">
                                   <Button size="sm" variant="ghost" className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100"><Play className="h-2.5 w-2.5 text-slate-400" fill="currentColor" /></Button>
                                   <Button size="sm" variant="ghost" className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100"><Settings className="h-2.5 w-2.5 text-slate-300" /></Button>
                                </div>
                             </div>
                          </div>
                       </div>
                    </div>
                  );
               })}
            </div>
         </div>

         {/* PANEL 2: CENTER - POWERPOINT-STYLE WORKSPACE (Dominant) */}
         <div className="flex-1 bg-[#d9dde4] flex flex-col relative overflow-hidden">
            {/* 2a. AGENTIC EXECUTION OVERLAY (Rule 4: Cleaner context) */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1.5 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full border border-white shadow-2xl shadow-slate-900/10 pointer-events-none transition-all">
               {agents.map((a, i) => (
                  <React.Fragment key={\`nano-\${a.id}\`}>
                     <div className={\`h-1.5 w-1.5 rounded-full transition-all \${
                         activeTask === a.id ? 'bg-blue-600 scale-150 ring-2 ring-blue-500/20' : 
                         a.status === 'completed' ? 'bg-emerald-500' : 'bg-slate-200'
                     }\`} />
                     {i < agents.length - 1 && <div className="w-2 h-[1px] bg-slate-100" />}
                  </React.Fragment>
               ))}
               <div className="w-px h-3 bg-slate-200 mx-1" />
               <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">{selectedAgent?.name || "Ready"}</span>
            </div>

            {/* 2b. SLIDE WORKSPACE (The PowerPoint "Gray" area) */}
            <div 
               ref={containerRef}
               className="flex-1 overflow-auto relative flex flex-col items-center justify-center p-4 custom-scrollbar"
            >
                {!selectedAgentId ? (
                    <div className="flex flex-col items-center text-center max-w-sm">
                        <div className="h-20 w-20 rounded-3xl bg-white border border-slate-200 shadow-xl flex items-center justify-center mb-8 rotate-3">
                            <Brain className="h-8 w-8 text-slate-100" />
                        </div>
                        <h3 className="text-md font-black text-slate-600 uppercase tracking-widest mb-2">Workspace Standby</h3>
                        <p className="text-[12px] text-slate-400 font-medium">Select a synthesis node to focus the workspace.</p>
                    </div>
                ) : (
                    <div className="relative group/slide flex flex-col items-center">
                        {/* Slide Shadow Container */}
                        <div 
                           className="bg-white shadow-[0_30px_90px_-20px_rgba(0,0,0,0.3)] flex flex-col relative transition-all duration-300 origin-center overflow-hidden rounded-[2px]" 
                           style={{ 
                               width: '1024px', 
                               height: '576px', 
                               transform: \`scale(\${zoom/100})\`
                           }}
                        >
                           <div className="flex-1 p-[60px] flex flex-col relative overflow-hidden h-full">
                              {selectedAgent?.status === 'running' ? (
                                 <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                                    <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
                                    <div className="space-y-2">
                                       <h3 className="text-[24px] font-black text-slate-900 tracking-tight uppercase leading-none">{selectedAgent.microStatus || "Orchestrating..."}</h3>
                                       <p className="text-[13px] text-slate-400 font-medium max-w-xs mx-auto">Compiling industrial logic fragments into workspace results.</p>
                                    </div>
                                 </div>
                              ) : !selectedAgent?.results ? (
                                 <div className="flex flex-col h-full items-center justify-center text-center opacity-20 grayscale space-y-4">
                                    <Cpu className="h-12 w-12 text-slate-400" />
                                    <h2 className="text-2xl font-black uppercase text-slate-400">Layer Inactive</h2>
                                 </div>
                              ) : (
                                 <div className="flex-1 animate-in fade-in duration-500">
                                    {/* EXISTING SLIDE COMPONENTS - REFACTORED FOR TIGHTER FIT */}
                                    {slides[activeSlide]?.type === 'summary' && (
                                       <div className="flex flex-col h-full">
                                          <div className="flex items-center gap-3 mb-4">
                                             <span className="h-px w-8 bg-blue-600" />
                                             <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Synthesis Summary</span>
                                          </div>
                                          <h2 contentEditable suppressContentEditableWarning className="text-[48px] font-black text-[#0f172a] leading-[1] tracking-tight outline-none mb-10 hover:bg-slate-50 p-2 -ml-2 rounded-lg transition-all">{slides[activeSlide].title}</h2>
                                          <div className="grid grid-cols-4 gap-10 mb-12 border-y border-slate-100 py-8">
                                             {[
                                                { label: 'Observed', val: slides[activeSlide].content.date, icon: Clock },
                                                { label: 'Time', val: slides[activeSlide].content.time, icon: Activity },
                                                { label: 'Spatial', val: slides[activeSlide].content.location, icon: Navigation },
                                                { label: 'Vector', val: slides[activeSlide].content.incidentType, icon: Box }
                                             ].map(item => (
                                                <div key={item.label}>
                                                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">{item.label}</span>
                                                   <div contentEditable suppressContentEditableWarning className="text-[17px] font-black text-slate-800 outline-none leading-tight">{item.val}</div>
                                                </div>
                                             ))}
                                          </div>
                                          <div className="flex-1 bg-slate-50/50 rounded-3xl p-10 relative overflow-hidden border border-slate-100 shadow-inner">
                                             <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500" />
                                             <div contentEditable suppressContentEditableWarning className="text-[18px] text-slate-600 font-medium leading-relaxed outline-none h-full overflow-y-auto custom-scrollbar italic">{slides[activeSlide].content.summary}</div>
                                          </div>
                                       </div>
                                    )}
                                    {/* (Include other slide blocks as needed...) */}
                                 </div>
                              )}
                              
                              {/* Slide Footer */}
                              <div className="absolute bottom-8 left-[60px] right-[60px] flex justify-between items-center opacity-30 border-t border-slate-100 pt-6">
                                 <span className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em]">BERAU CORE HQ • {selectedAgent?.id.toUpperCase()}</span>
                                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">STRICTLY INTERNAL</span>
                              </div>
                           </div>
                        </div>

                        {/* 2c. FLOATING NAV OVERLAYS (Rule 6) */}
                        <div className="absolute inset-y-0 -left-16 flex items-center opacity-0 group-hover/slide:opacity-100 transition-all">
                           <Button 
                              onClick={() => setActiveSlide(prev => Math.max(0, prev - 1))}
                              disabled={activeSlide === 0}
                              variant="ghost" 
                              className="h-12 w-12 rounded-full bg-white shadow-xl hover:bg-slate-50 text-slate-400 disabled:opacity-0"
                           >
                              <ChevronLeft className="h-6 w-6" />
                           </Button>
                        </div>
                        <div className="absolute inset-y-0 -right-16 flex items-center opacity-0 group-hover/slide:opacity-100 transition-all">
                           <Button 
                              onClick={() => setActiveSlide(prev => Math.min(slides.length - 1, prev + 1))}
                              disabled={activeSlide === slides.length - 1}
                              variant="ghost" 
                              className="h-12 w-12 rounded-full bg-white shadow-xl hover:bg-slate-50 text-slate-400 disabled:opacity-0"
                           >
                              <ChevronRight className="h-6 w-6" />
                           </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* 2d. POWERPOINT UTILITY BAR (Rule 5: Viewing Controls) */}
            <div className="h-10 bg-white border-t border-slate-200 px-4 flex items-center justify-between shrink-0 z-40 shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
               <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2">Page {activeSlide + 1} of {slides.length}</span>
                  <div className="w-px h-4 bg-slate-200 mx-1" />
                  <Button onClick={() => setActiveSlide(0)} variant="ghost" className="h-7 w-7 p-0 text-slate-400 hover:text-slate-900"><FastForward className="h-3.5 w-3.5 rotate-180" /></Button>
                  <Button onClick={() => setActiveSlide(prev => Math.max(0, prev - 1))} variant="ghost" className="h-7 w-7 p-0 text-slate-400 hover:text-slate-900"><ChevronLeft className="h-4 w-4" /></Button>
                  <Button onClick={() => setActiveSlide(prev => Math.min(slides.length - 1, prev + 1))} variant="ghost" className="h-7 w-7 p-0 text-slate-400 hover:text-slate-900"><ChevronRight className="h-4 w-4" /></Button>
                  <Button onClick={() => setActiveSlide(slides.length - 1)} variant="ghost" className="h-7 w-7 p-0 text-slate-400 hover:text-slate-900"><FastForward className="h-3.5 w-3.5" /></Button>
               </div>

               <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-md p-0.5 shadow-inner">
                  <Button onClick={() => setZoom(Math.max(20, zoom - 10))} variant="ghost" className="h-6 w-6 p-0 text-slate-500 rounded"><ZoomOut className="h-3.5 w-3.5" /></Button>
                  <Button onClick={fitToWorkspace} variant="ghost" className="h-6 px-1.5 text-[9px] font-black text-slate-700 bg-white border border-slate-200 shadow-sm rounded">FIT</Button>
                  <div className="w-10 text-center font-black text-[9px] text-slate-600 leading-none">{zoom}%</div>
                  <Button onClick={() => setZoom(Math.min(200, zoom + 10))} variant="ghost" className="h-6 w-6 p-0 text-slate-500 rounded"><ZoomIn className="h-3.5 w-3.5" /></Button>
               </div>

               <div className="flex items-center gap-2">
                  <Button onClick={() => setZoom(100)} variant="ghost" className="h-7 px-2 text-[9px] font-bold text-slate-400 hover:text-slate-800">1:1 Scale</Button>
                  <div className="w-px h-4 bg-slate-200 mx-1" />
                  <Button onClick={handleSaveArtifact} disabled={isSaving} className="h-7 bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-bold px-4 rounded-md shadow-lg shadow-emerald-500/10">
                     {isSaving ? "Saving..." : "Save to Case"}
                  </Button>
               </div>
            </div>
         </div>

         {/* PANEL 3: RIGHT - PROPERTIES / CONTEXT (280px) */}
         <div className="w-[280px] border-l border-slate-200 bg-white flex flex-col shrink-0 z-10">
            <div className="p-3 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
               <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">Context Matrix</span>
               <div className="flex gap-1">
                   <Button variant="ghost" className="h-6 w-6 p-0 text-slate-300 hover:text-slate-600"><History className="h-3 w-3" /></Button>
                   <Button variant="ghost" className="h-6 w-6 p-0 text-slate-300 hover:text-slate-600"><Search className="h-3 w-3" /></Button>
               </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-slate-100">
               {selectedAgentId ? (
                  <>
                    <div className="p-4 bg-blue-50/30">
                       <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest block mb-2">Operational Relay</span>
                       <div className="flex flex-col gap-2">
                          <div className="flex justify-between items-center text-[10px]">
                             <span className="font-bold text-slate-400 uppercase">Input</span>
                             <span className="font-black text-slate-800">Verified Evidence</span>
                          </div>
                          <div className="flex justify-between items-center text-[10px]">
                             <span className="font-bold text-slate-400 uppercase">Output</span>
                             <span className="font-black text-blue-600">Slide {activeSlide + 1} Artifact</span>
                          </div>
                       </div>
                    </div>
                    
                    <div className="p-4">
                       <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-4">Content Controls</span>
                       <div className="space-y-3">
                          <div className="flex flex-col gap-1.5">
                             <label className="text-[9px] font-bold text-slate-500 uppercase">Layer Visibility</label>
                             <div className="flex gap-1">
                                {['Content', 'Evidence', 'Metadata'].map(l => (
                                   <button key={l} className="flex-1 h-6 bg-slate-50 border border-slate-100 rounded text-[8px] font-black uppercase text-slate-400 hover:border-blue-200 hover:text-blue-600">{l}</button>
                                ))}
                             </div>
                          </div>
                       </div>
                    </div>

                    <div className="p-4">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-4">Citations</span>
                        <div className="space-y-2">
                           {evidenceFiles.slice(0, 2).map(f => (
                              <div key={f.id} className="p-2 border border-slate-100 rounded-lg flex items-center justify-between text-[9px] group hover:border-blue-200 transition-all cursor-pointer">
                                 <span className="font-bold text-slate-500 uppercase truncate max-w-[120px]">{f.name}</span>
                                 <ExternalLink className="h-2.5 w-2.5 text-slate-300 group-hover:text-blue-500" />
                              </div>
                           ))}
                        </div>
                    </div>
                  </>
               ) : (
                  <div className="p-10 text-center space-y-4 opacity-30">
                     <Database className="h-8 w-8 mx-auto text-slate-200" />
                     <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">Context Detached</p>
                  </div>
               )}
            </div>
            
            <div className="p-4 border-t border-slate-100 bg-slate-50/20">
               <Button onClick={handleExport} disabled={isExporting} className="w-full h-10 bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest rounded-lg shadow-xl shadow-slate-200">
                  {isExporting ? "Exporting..." : "Finalize Report Deck"}
               </Button>
            </div>
         </div>
      </div>
    </div>
  );\`;

text = text.substring(0, returnIdx) + newRenderBlock + text.substring(endIdx);

fs.writeFileSync(CACHE_FILE, text);
console.log("AnalysisTab Slide Workspace refined successfully!");
