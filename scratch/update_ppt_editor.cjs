const fs = require('fs');
const CACHE_FILE = 'src/pages/CaseWorkspacePage.tsx';
let text = fs.readFileSync(CACHE_FILE, 'utf8');

// 1. Add missing lucide imports
const iconMatches = text.match(/import\s+\{[^}]+\}\s+from\s+["']lucide-react["'];?/);
if (iconMatches) {
  let imports = iconMatches[0];
  const neededIcons = ['Undo', 'Redo', 'ZoomIn', 'ZoomOut', 'Maximize', 'Download', 'Bold', 'Italic', 'Underline', 'Plus', 'Move'];
  neededIcons.forEach(ic => {
    if (!imports.includes(ic)) {
      imports = imports.replace('}', `, ${ic}}`);
    }
  });
  text = text.replace(iconMatches[0], imports);
}

// 2. Add presentation editor states to AnalysisTab
const stateAnchor = `const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);`;
if (text.includes(stateAnchor) && !text.includes('activeSlide')) {
  const newStates = `const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  
  const [activeSlide, setActiveSlide] = useState(0);
  
  const slides = React.useMemo(() => {
    const agent = agents.find(a => a.id === selectedAgentId);
    if (!agent) return [];
    if (agent.id === 'fact' && agent.results) {
       return [
         {
            id: 'slide-1',
            type: 'summary',
            title: 'Chronology Summary',
            content: {
               date: agent.results.ringkasan.tanggal,
               time: agent.results.ringkasan.jam,
               location: agent.results.ringkasan.lokasi,
               incidentType: agent.results.ringkasan.jenis,
               summary: agent.results.ringkasan.deskripsi
            }
         },
         {
            id: 'slide-2',
            type: 'timeline',
            title: 'Timeline Breakdown',
            content: {
                praKontak: agent.results.timeline.praKontak,
                kontak: agent.results.timeline.kontak,
                pascaKontak: agent.results.timeline.pascaKontak,
            }
         }
       ];
    }
    return [{
       id: 'slide-1',
       type: 'raw',
       title: 'Extraction Result',
       content: agent.results || {}
    }];
  }, [selectedAgentId, agents]);
  
  // reset slide when changing agent
  React.useEffect(() => { setActiveSlide(0); }, [selectedAgentId]);`;
  text = text.replace(stateAnchor, newStates);
}

// 3. Replace the floating panel HTML
const startString = `{/* FLOATING DETAIL PANEL (Preserved & Styled Enterprise) */}`;
const endString = `{/* END FLOATING DETAIL PANEL */}`;

if (!text.includes(endString)) {
  // Let's find the closing tag dynamically
  const split1 = text.split(startString);
  if (split1.length > 1) {
    const afterStart = split1[1];
    // Find the end of AnalysisTab
    const lastDivIndex = text.lastIndexOf('</div>\n    </div>\n  );\n}');
    if (lastDivIndex > split1[0].length) {
      // Just replace everything from startString to lastDivIndex
      const replacementStr = `{/* FLOATING DETAIL PANEL (Preserved & Styled Enterprise) */}
      {selectedAgent && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-[#f0f2f5] border border-slate-300 rounded-xl w-[86vw] h-[88vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
               {/* A. Top Bar / Editor Header */}
               <div className="h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between shrink-0 shadow-sm z-10">
                  <div className="flex items-center gap-4">
                     <div className="flex items-center gap-2 border-r border-slate-200 pr-5">
                        <div className="h-8 w-8 rounded flex items-center justify-center bg-slate-50 border border-slate-200 shadow-sm text-slate-600">
                           <selectedAgent.icon className="h-4 w-4" />
                        </div>
                        <div>
                           <h3 className="text-[13px] font-bold text-slate-800 leading-none mb-0.5">{selectedAgent.name}</h3>
                           <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest block leading-none">Presentation Editor</span>
                        </div>
                     </div>
                     
                     {/* Utilities */}
                     <div className="flex items-center gap-1 bg-slate-50 p-1 border border-slate-200 rounded-md shadow-sm">
                        <Button variant="ghost" size="sm" className="h-6 w-7 p-0 text-slate-600 hover:bg-white"><Undo className="h-3 w-3" /></Button>
                        <Button variant="ghost" size="sm" className="h-6 w-7 p-0 text-slate-600 hover:bg-white"><Redo className="h-3 w-3" /></Button>
                        <div className="w-px h-3.5 bg-slate-200 mx-1.5" />
                        <Button variant="ghost" size="sm" className="h-6 w-7 p-0 text-slate-600 hover:bg-white"><ZoomIn className="h-3 w-3" /></Button>
                        <span className="text-[9px] font-bold text-slate-500 w-8 text-center cursor-ns-resize hover:text-slate-800">85%</span>
                        <Button variant="ghost" size="sm" className="h-6 w-7 p-0 text-slate-600 hover:bg-white"><ZoomOut className="h-3 w-3" /></Button>
                        <Button variant="ghost" size="sm" className="h-6 w-7 p-0 text-slate-600 hover:bg-white"><Maximize className="h-3 w-3" /></Button>
                     </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                     <span className={\`border px-1.5 py-0.5 rounded-[3px] text-[8px] font-bold uppercase tracking-widest mr-2 \${
                        selectedAgent.status === 'completed' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-50 text-slate-500'
                     }\`}>
                        {selectedAgent.status}
                     </span>
                     <Button variant="outline" size="sm" className="h-7 text-[10px] font-bold border-slate-200 text-slate-600 bg-white hover:bg-slate-50 shadow-sm"><Download className="h-3 w-3 mr-1.5" /> Export PPTX</Button>
                     <Button variant="default" size="sm" className="h-7 text-[10px] font-bold bg-slate-800 hover:bg-slate-900 shadow-sm text-white px-5">Save to Artifacts</Button>
                     <div className="w-px h-4 bg-slate-300 mx-1" />
                     <Button variant="ghost" size="sm" onClick={() => setSelectedAgentId(null)} className="h-7 w-7 p-0 rounded-md hover:bg-slate-200 text-slate-500"><X className="h-4 w-4" /></Button>
                  </div>
               </div>

               {/* B. Editor Workspace Area */}
               <div className="flex flex-1 overflow-hidden">
                  
                  {/* Left Slide Navigator */}
                  <div className="w-48 bg-[#FAFAFA] border-r border-slate-200 flex flex-col shrink-0">
                     <div className="p-3 border-b border-slate-200 flex justify-between items-center bg-white">
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Slides</span>
                        <Button variant="ghost" size="sm" className="h-5 w-5 p-0 text-slate-500 hover:bg-slate-100 rounded-sm"><Plus className="h-3 w-3" /></Button>
                     </div>
                     <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
                        {slides.map((s, i) => (
                           <div key={s.id} onClick={() => setActiveSlide(i)} className={\`cursor-pointer group flex gap-2.5 \${activeSlide === i ? '' : 'opacity-60 hover:opacity-100'}\`}>
                              <span className="text-[10px] font-bold text-slate-400 mt-1">{i + 1}</span>
                              <div className={\`flex-1 aspect-video bg-white border-2 rounded shadow-sm relative overflow-hidden transition-all \${activeSlide === i ? 'border-slate-800 ring-2 ring-slate-800/10' : 'border-slate-200 group-hover:border-slate-300'}\`}>
                                 <div className="absolute inset-x-2 top-2 h-1 bg-slate-200 rounded-sm" />
                                 <div className="absolute inset-x-2 top-4 h-0.5 bg-slate-100 rounded-sm w-[60%]" />
                                 <div className="absolute inset-x-2 top-6 h-0.5 bg-slate-100 rounded-sm w-[80%]" />
                                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-1 w-full text-[7px] font-bold text-slate-800 px-2 text-center leading-tight truncate">
                                    {s.title}
                                 </div>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>

                  {/* C. Center Slide Canvas */}
                  <div className="flex-1 bg-[#EBECF0] relative overflow-auto flex items-center justify-center p-8 custom-scrollbar">
                     {/* Widescreen 16:9 Canvas */}
                     <div className="bg-white shadow-xl border border-slate-300 shrink-0 flex flex-col relative group transition-all" style={{ width: '880px', height: '495px' }}>
                        
                        {/* Safe Margins Overlay */}
                        <div className="absolute inset-[30px] border border-dashed border-slate-300 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />

                        {/* Slide Content Dynamic View */}
                        <div className="flex-1 p-10 flex flex-col relative z-10 w-full h-full">
                           {slides[activeSlide]?.type === 'summary' && (
                              <div className="flex flex-col h-full animate-in fade-in duration-300">
                                 <h2 contentEditable suppressContentEditableWarning className="text-[28px] font-bold text-[#1f2937] tracking-tight outline-none mb-6 hover:bg-slate-50 p-2 -ml-2 rounded border border-transparent hover:border-slate-200 transition-colors">{slides[activeSlide].title}</h2>
                                 
                                 <div className="grid grid-cols-4 gap-6 mb-8 shrink-0 pb-4 border-b border-slate-100">
                                    <div className="group context-block">
                                       <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 cursor-text">Date Logged</span>
                                       <div contentEditable suppressContentEditableWarning className="text-[12px] font-semibold text-slate-800 outline-none hover:bg-slate-50 p-1 -ml-1 rounded border border-transparent hover:border-slate-200 truncate">{slides[activeSlide].content.date}</div>
                                    </div>
                                    <div className="group context-block">
                                       <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 cursor-text">Time Trace</span>
                                       <div contentEditable suppressContentEditableWarning className="text-[12px] font-semibold text-slate-800 outline-none hover:bg-slate-50 p-1 -ml-1 rounded border border-transparent hover:border-slate-200 truncate">{slides[activeSlide].content.time}</div>
                                    </div>
                                    <div className="group context-block">
                                       <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 cursor-text">Sector Zone</span>
                                       <div contentEditable suppressContentEditableWarning className="text-[12px] font-semibold text-slate-800 outline-none hover:bg-slate-50 p-1 -ml-1 rounded border border-transparent hover:border-slate-200 truncate">{slides[activeSlide].content.location}</div>
                                    </div>
                                    <div className="group context-block">
                                       <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 cursor-text">Class Type</span>
                                       <div contentEditable suppressContentEditableWarning className="text-[12px] font-semibold text-slate-800 outline-none hover:bg-slate-50 p-1 -ml-1 rounded border border-transparent hover:border-slate-200 truncate">{slides[activeSlide].content.incidentType}</div>
                                    </div>
                                 </div>

                                 <div className="flex-1 bg-[#FAFAFA] border border-[#E5E7EB] rounded-lg p-6 shadow-sm group">
                                    <span className="text-[9px] font-bold text-[#059669] uppercase tracking-widest block mb-3 cursor-text">Executive Summary</span>
                                    <div contentEditable suppressContentEditableWarning className="text-[14px] text-slate-700 font-medium leading-[1.7] outline-none hover:bg-white hover:shadow-sm p-2 -ml-2 rounded border border-transparent hover:border-slate-200 h-full">{slides[activeSlide].content.summary}</div>
                                 </div>
                              </div>
                           )}

                           {slides[activeSlide]?.type === 'timeline' && (
                              <div className="flex flex-col h-full animate-in fade-in duration-300">
                                 <h2 contentEditable suppressContentEditableWarning className="text-[24px] font-bold text-[#1f2937] tracking-tight outline-none mb-6 hover:bg-slate-50 p-2 -ml-2 rounded border border-transparent hover:border-slate-200">{slides[activeSlide].title}</h2>
                                 
                                 <div className="flex-1 grid grid-cols-3 gap-6">
                                    {/* Pre-Contact */}
                                    <div className="flex flex-col group">
                                       <div className="border-b-[3px] border-[#10B981] pb-2 mb-4">
                                          <span contentEditable suppressContentEditableWarning className="text-[9px] font-black text-[#047857] uppercase tracking-widest outline-none block hover:bg-emerald-50">Pre-Contact Phase</span>
                                       </div>
                                       <div className="space-y-4">
                                          {slides[activeSlide].content.praKontak.map((item, idx) => (
                                             <div key={idx} className="bg-white border border-[#E5E7EB] p-3 rounded-md shadow-sm relative pl-3.5 hover:border-blue-400 hover:shadow-md transition-all cursor-text group/item">
                                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#34D399] rounded-l-md" />
                                                <div className="absolute rounded border bg-white shadow-sm -top-2 -right-2 hidden group-hover/item:flex items-center gap-0.5 p-0.5 z-10 text-slate-400">
                                                   <Move className="h-3 w-3 hover:text-slate-700 cursor-move" />
                                                   <X className="h-3 w-3 hover:text-rose-600 cursor-pointer" />
                                                </div>
                                                <div contentEditable suppressContentEditableWarning className="text-[10px] font-bold text-slate-800 mb-1 outline-none">{item.waktu}</div>
                                                <div contentEditable suppressContentEditableWarning className="text-[11px] font-medium text-slate-600 leading-snug outline-none mb-2.5">{item.kejadian}</div>
                                                <div className="flex gap-2">
                                                   <span contentEditable suppressContentEditableWarning className="text-[8px] bg-slate-100 px-1.5 py-0.5 rounded-sm text-slate-500 font-medium outline-none">{item.evidence}</span>
                                                   <span contentEditable suppressContentEditableWarning className="text-[8px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-sm border border-emerald-100 font-bold outline-none">{item.confidence}</span>
                                                </div>
                                             </div>
                                          ))}
                                       </div>
                                    </div>

                                    {/* Contact */}
                                    <div className="flex flex-col group">
                                       <div className="border-b-[3px] border-[#F43F5E] pb-2 mb-4">
                                          <span contentEditable suppressContentEditableWarning className="text-[9px] font-black text-[#BE123C] uppercase tracking-widest outline-none block hover:bg-rose-50">Contact Phase</span>
                                       </div>
                                       <div className="space-y-4">
                                          {slides[activeSlide].content.kontak.map((item, idx) => (
                                             <div key={idx} className="bg-white border border-[#E5E7EB] p-3 rounded-md shadow-sm relative pl-3.5 hover:border-blue-400 hover:shadow-md transition-all cursor-text group/item">
                                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#FB7185] rounded-l-md" />
                                                <div className="absolute rounded border bg-white shadow-sm -top-2 -right-2 hidden group-hover/item:flex items-center gap-0.5 p-0.5 z-10 text-slate-400">
                                                   <Move className="h-3 w-3 hover:text-slate-700 cursor-move" />
                                                   <X className="h-3 w-3 hover:text-rose-600 cursor-pointer" />
                                                </div>
                                                <div contentEditable suppressContentEditableWarning className="text-[10px] font-bold text-rose-800 mb-1 outline-none">{item.waktu}</div>
                                                <div contentEditable suppressContentEditableWarning className="text-[11.5px] font-bold text-[#4C0519] leading-snug outline-none mb-2.5">{item.kejadian}</div>
                                                <div className="flex gap-2">
                                                   <span contentEditable suppressContentEditableWarning className="text-[8px] bg-slate-100 px-1.5 py-0.5 rounded-sm text-slate-500 font-medium outline-none">{item.evidence}</span>
                                                   <span contentEditable suppressContentEditableWarning className="text-[8px] bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded-sm border border-rose-200 font-bold outline-none">{item.confidence}</span>
                                                </div>
                                             </div>
                                          ))}
                                       </div>
                                    </div>

                                    {/* Post-Contact */}
                                    <div className="flex flex-col group">
                                       <div className="border-b-[3px] border-[#F59E0B] pb-2 mb-4">
                                          <span contentEditable suppressContentEditableWarning className="text-[9px] font-black text-[#B45309] uppercase tracking-widest outline-none block hover:bg-amber-50">Post-Contact Phase</span>
                                       </div>
                                       <div className="space-y-4">
                                          {slides[activeSlide].content.pascaKontak.map((item, idx) => (
                                             <div key={idx} className="bg-white border border-[#E5E7EB] p-3 rounded-md shadow-sm relative pl-3.5 hover:border-blue-400 hover:shadow-md transition-all cursor-text group/item">
                                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#FBBF24] rounded-l-md" />
                                                <div className="absolute rounded border bg-white shadow-sm -top-2 -right-2 hidden group-hover/item:flex items-center gap-0.5 p-0.5 z-10 text-slate-400">
                                                   <Move className="h-3 w-3 hover:text-slate-700 cursor-move" />
                                                   <X className="h-3 w-3 hover:text-rose-600 cursor-pointer" />
                                                </div>
                                                <div contentEditable suppressContentEditableWarning className="text-[10px] font-bold text-slate-800 mb-1 outline-none">{item.waktu}</div>
                                                <div contentEditable suppressContentEditableWarning className="text-[11px] font-medium text-slate-600 leading-snug outline-none mb-2.5">{item.kejadian}</div>
                                                <div className="flex gap-2">
                                                   <span contentEditable suppressContentEditableWarning className="text-[8px] bg-slate-100 px-1.5 py-0.5 rounded-sm text-slate-500 font-medium outline-none">{item.evidence}</span>
                                                   <span contentEditable suppressContentEditableWarning className="text-[8px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded-sm border border-amber-200 font-bold outline-none">{item.confidence}</span>
                                                </div>
                                             </div>
                                          ))}
                                       </div>
                                    </div>
                                 </div>
                              </div>
                           )}

                           {slides[activeSlide]?.type === 'raw' && (
                              <div className="flex flex-col h-full animate-in fade-in duration-300">
                                 <h2 contentEditable suppressContentEditableWarning className="text-[28px] font-bold text-[#1f2937] tracking-tight outline-none mb-6 hover:bg-slate-50 p-2 -ml-2 rounded border border-transparent hover:border-slate-200">{slides[activeSlide].title}</h2>
                                 <div className="flex-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-6 font-mono text-[10px] text-slate-600 overflow-auto overflow-x-hidden" contentEditable suppressContentEditableWarning>
                                    {JSON.stringify(slides[activeSlide].content, null, 2)}
                                 </div>
                              </div>
                           )}

                        </div>
                     </div>
                  </div>

                  {/* D. Right Properties Panel */}
                  <div className="w-64 bg-white border-l border-slate-200 shrink-0 flex flex-col z-10">
                     <div className="px-4 py-3 border-b border-slate-200 bg-[#FCFCFD] flex items-center justify-between">
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Properties</span>
                        <Settings className="h-3 w-3 text-slate-400" />
                     </div>
                     <div className="p-5 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
                        <div>
                           <label className="text-[10px] font-bold text-slate-800 mb-3 block uppercase tracking-wide">Slide Layout</label>
                           <div className="grid grid-cols-2 gap-2.5">
                              <div className="h-10 border-[1.5px] border-slate-800 rounded bg-slate-50 flex items-center justify-center cursor-pointer shadow-sm"><div className="w-3/4 h-2 bg-slate-300 rounded-sm" /></div>
                              <div className="h-10 border border-slate-200 rounded hover:border-slate-400 flex items-center justify-center cursor-pointer transition-colors"><div className="w-1/2 h-full bg-slate-100 border-r border-slate-200" /></div>
                              <div className="h-10 border border-slate-200 rounded hover:border-slate-400 flex flex-col items-center justify-center cursor-pointer transition-colors gap-1"><div className="w-3/4 h-1 bg-slate-200 rounded-sm"/><div className="w-3/4 h-1 bg-slate-200 rounded-sm"/></div>
                              <div className="h-10 border border-slate-200 rounded hover:border-slate-400 flex items-center justify-center cursor-pointer transition-colors"><div className="w-2/3 h-2/3 bg-slate-100 rounded-sm border border-slate-200" /></div>
                           </div>
                        </div>
                        <div className="border-t border-slate-100 pt-5">
                           <label className="text-[10px] font-bold text-slate-800 mb-3 block uppercase tracking-wide">Text Styling</label>
                           <div className="flex items-center gap-1 bg-slate-50 p-1 border border-slate-200 rounded-md w-max mb-4 shadow-sm">
                              <Button variant="ghost" size="sm" className="h-7 w-8 p-0 text-slate-800 bg-white border border-slate-200 shadow-sm"><Bold className="h-3 w-3" /></Button>
                              <Button variant="ghost" size="sm" className="h-7 w-8 p-0 text-slate-600 hover:bg-white"><Italic className="h-3 w-3" /></Button>
                              <Button variant="ghost" size="sm" className="h-7 w-8 p-0 text-slate-600 hover:bg-white"><Underline className="h-3 w-3" /></Button>
                           </div>
                           <div className="space-y-3.5">
                               <div className="flex items-center justify-between">
                                   <span className="text-[10px] font-medium text-slate-500">Font Size</span>
                                   <div className="flex items-center border border-slate-200 rounded shadow-sm bg-white overflow-hidden">
                                      <div className="px-2 py-1 text-[10px] font-mono text-slate-700 bg-slate-50 border-r border-slate-200">14</div>
                                      <div className="px-1.5 py-1 text-[10px] text-slate-400 hover:text-slate-700 cursor-pointer border-r border-slate-200">pt</div>
                                   </div>
                               </div>
                               <div className="flex items-center justify-between">
                                   <span className="text-[10px] font-medium text-slate-500">Text Align</span>
                                   <div className="flex gap-1.5">
                                      <div className="h-4 w-5 border border-slate-800 rounded bg-slate-800 cursor-pointer" />
                                      <div className="h-4 w-5 border border-slate-200 rounded hover:border-slate-400 cursor-pointer" />
                                      <div className="h-4 w-5 border border-slate-200 rounded hover:border-slate-400 cursor-pointer" />
                                   </div>
                               </div>
                               <div className="flex items-center justify-between">
                                   <span className="text-[10px] font-medium text-slate-500">Color Fill</span>
                                   <div className="h-4 w-4 bg-[#1f2937] rounded border border-slate-300 shadow-sm cursor-pointer hover:ring-2 ring-slate-200 ring-offset-1" />
                               </div>
                           </div>
                        </div>
                     </div>
                  </div>

               </div>
            </div>
         </div>
      )}
      {/* END FLOATING DETAIL PANEL */}`;
      
      let newText = text.slice(0, split1[0].length) + replacementStr + text.slice(lastDivIndex);
      fs.writeFileSync(CACHE_FILE, newText);
    }
  }
}
