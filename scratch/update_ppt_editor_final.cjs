const fs = require('fs');
const CACHE_FILE = 'src/pages/CaseWorkspacePage.tsx';
let text = fs.readFileSync(CACHE_FILE, 'utf8');

const anchorStart = '{/* FLOATING DETAIL PANEL';
const targetIndex = text.indexOf(anchorStart);
const endIndex = text.indexOf('    </div>\n  );\n}function ReportsTab() {');

if (targetIndex >= 0 && endIndex > targetIndex) {
   const replacementStr = `{/* FLOATING DETAIL PANEL (PowerPoint Editor Experience) */}
      {selectedAgent && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1f2937]/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="bg-[#f0f2f5] border border-slate-300 rounded-xl w-[90vw] h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
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
                     <span className={"border px-1.5 py-0.5 rounded-[3px] text-[8px] font-bold uppercase tracking-widest mr-2 " + (
                        selectedAgent.status === 'completed' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-50 text-slate-500'
                     )}>
                        {selectedAgent.status}
                     </span>
                     <Button variant="outline" size="sm" className="h-7 text-[10px] font-bold border-slate-200 text-slate-600 bg-white hover:bg-slate-50 shadow-sm"><Download className="h-3 w-3 mr-1.5" /> Export PPTX</Button>
                     <Button variant="default" size="sm" className="h-7 text-[10px] font-bold bg-slate-800 hover:bg-slate-900 shadow-sm text-white px-5">Save Artifact</Button>
                     <div className="w-px h-4 bg-slate-300 mx-1" />
                     <Button variant="ghost" size="sm" onClick={() => setSelectedAgentId(null)} className="h-7 w-7 p-0 rounded-md hover:bg-slate-200 text-slate-500"><X className="h-4 w-4" /></Button>
                  </div>
               </div>

               {/* B. Editor Workspace Area */}
               <div className="flex flex-1 overflow-hidden">
                  
                  {/* Left Slide Navigator */}
                  <div className="w-48 bg-[#FAFAFA] border-r border-slate-200 flex flex-col shrink-0 z-10 shadow-[1px_0_10px_rgba(0,0,0,0.02)]">
                     <div className="p-3 border-b border-slate-200 flex justify-between items-center bg-white">
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Slides</span>
                        <Button variant="ghost" size="sm" className="h-5 w-5 p-0 text-slate-500 hover:bg-slate-100 rounded-sm"><Plus className="h-3 w-3" /></Button>
                     </div>
                     <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                        {slides.map((s, i) => (
                           <div key={s.id} onClick={() => setActiveSlide(i)} className={"cursor-pointer group flex gap-2.5 " + (activeSlide === i ? '' : 'opacity-60 hover:opacity-100')}>
                              <span className="text-[10px] font-bold text-slate-400 mt-1">{i + 1}</span>
                              <div className={"flex-1 aspect-video bg-white border outline outline-offset-2 rounded-sm shadow-sm relative overflow-hidden transition-all " + (activeSlide === i ? 'border-blue-500 outline-blue-500/20' : 'border-slate-300 outline-transparent group-hover:border-slate-400')}>
                                 <div className="absolute inset-x-2 top-2 h-1 bg-slate-200 rounded-sm" />
                                 <div className="absolute inset-x-2 top-4 h-0.5 bg-slate-100 rounded-sm w-[60%]" />
                                 <div className="absolute inset-x-2 top-6 h-0.5 bg-slate-100 rounded-sm w-[80%]" />
                                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] text-[7px] font-black text-slate-700 text-center leading-tight tracking-tight">
                                    {s.title}
                                 </div>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>

                  {/* C. Center Slide Canvas */}
                  <div className="flex-1 bg-[#dcdfe5] relative overflow-auto flex items-center justify-center p-8 lg:p-12 custom-scrollbar">
                     
                     {/* Widescreen 16:9 Canvas */}
                     <div className="bg-white shadow-[0_15px_40px_rgba(0,0,0,0.12)] border border-slate-300 shrink-0 flex flex-col relative group transition-all transform origin-center" style={{ width: '920px', minHeight: '517px', aspectRatio: '16/9' }}>
                        
                        {/* Safe Margins Overlay */}
                        <div className="absolute inset-[30px] border border-dashed border-slate-300 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />

                        {/* Slide Content Dynamic View */}
                        <div className="flex-1 p-[45px] flex flex-col relative z-20 w-full h-full">
                           {slides[activeSlide]?.type === 'summary' && (
                              <div className="flex flex-col h-full animate-in fade-in duration-300">
                                 <h2 contentEditable suppressContentEditableWarning className="text-[32px] font-bold text-[#1f2937] tracking-tight outline-none mb-8 hover:bg-slate-50 p-2 -ml-2 rounded border border-transparent hover:border-slate-200 transition-colors">{slides[activeSlide].title}</h2>
                                 
                                 <div className="grid grid-cols-4 gap-6 mb-8 shrink-0 pb-6 border-b border-slate-100">
                                    <div className="group context-block">
                                       <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-2 cursor-text">Date Logged</span>
                                       <div contentEditable suppressContentEditableWarning className="text-[13px] font-semibold text-slate-800 outline-none hover:bg-slate-50 p-1 -ml-1 rounded border border-transparent hover:border-slate-200">{slides[activeSlide].content.date}</div>
                                    </div>
                                    <div className="group context-block">
                                       <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-2 cursor-text">Time Trace</span>
                                       <div contentEditable suppressContentEditableWarning className="text-[13px] font-semibold text-slate-800 outline-none hover:bg-slate-50 p-1 -ml-1 rounded border border-transparent hover:border-slate-200">{slides[activeSlide].content.time}</div>
                                    </div>
                                    <div className="group context-block">
                                       <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-2 cursor-text">Sector Zone</span>
                                       <div contentEditable suppressContentEditableWarning className="text-[13px] font-semibold text-slate-800 outline-none hover:bg-slate-50 p-1 -ml-1 rounded border border-transparent hover:border-slate-200">{slides[activeSlide].content.location}</div>
                                    </div>
                                    <div className="group context-block">
                                       <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-2 cursor-text">Class Type</span>
                                       <div contentEditable suppressContentEditableWarning className="text-[13px] font-semibold text-slate-800 outline-none hover:bg-slate-50 p-1 -ml-1 rounded border border-transparent hover:border-slate-200">{slides[activeSlide].content.incidentType}</div>
                                    </div>
                                 </div>

                                 <div className="flex-1 bg-[#FAFAFA] border border-[#E5E7EB] rounded-lg p-8 shadow-sm group relative">
                                    <span className="text-[10px] font-bold text-[#059669] uppercase tracking-widest block mb-4 cursor-text">Executive Summary</span>
                                    <div contentEditable suppressContentEditableWarning className="text-[15px] text-slate-700 font-medium leading-[1.7] outline-none hover:bg-white hover:shadow-sm p-3 -ml-3 rounded border border-transparent hover:border-slate-200 h-[calc(100%-30px)] overflow-y-auto custom-scrollbar w-full block">{slides[activeSlide].content.summary}</div>
                                 </div>
                              </div>
                           )}

                           {slides[activeSlide]?.type === 'timeline' && (
                              <div className="flex flex-col h-full animate-in fade-in duration-300">
                                 <h2 contentEditable suppressContentEditableWarning className="text-[28px] font-bold text-[#1f2937] tracking-tight outline-none mb-8 hover:bg-slate-50 p-2 -ml-2 rounded border border-transparent hover:border-slate-200">{slides[activeSlide].title}</h2>
                                 
                                 <div className="flex-1 grid grid-cols-3 gap-8">
                                    {/* Pre-Contact */}
                                    <div className="flex flex-col group h-full">
                                       <div className="border-b-[3px] border-[#10B981] pb-2 mb-5 shrink-0">
                                          <span contentEditable suppressContentEditableWarning className="text-[10px] font-black text-[#047857] uppercase tracking-widest outline-none block hover:bg-emerald-50 w-max">Pre-Contact Phase</span>
                                       </div>
                                       <div className="space-y-4 overflow-y-auto custom-scrollbar flex-1 pr-1 pb-4">
                                          {slides[activeSlide].content.praKontak.map((item, idx) => (
                                             <div key={idx} className="bg-white border border-[#E5E7EB] p-3.5 rounded-md shadow-sm relative pl-4 hover:border-blue-400 hover:shadow-md transition-all cursor-text group/item">
                                                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#34D399] rounded-l-md" />
                                                <div className="absolute rounded border bg-white shadow-sm -top-2.5 -right-2.5 hidden group-hover/item:flex items-center gap-0.5 p-0.5 z-10 text-slate-400">
                                                   <Move className="h-3 w-3 hover:text-slate-700 cursor-move" />
                                                   <X className="h-3 w-3 hover:text-rose-600 cursor-pointer" />
                                                </div>
                                                <div contentEditable suppressContentEditableWarning className="text-[11px] font-bold text-slate-800 mb-1 outline-none">{item.waktu}</div>
                                                <div contentEditable suppressContentEditableWarning className="text-[12px] font-medium text-slate-600 leading-[1.4] outline-none mb-3">{item.kejadian}</div>
                                                <div className="flex gap-2 shrink-0">
                                                   <span contentEditable suppressContentEditableWarning className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded-sm text-slate-500 font-medium outline-none">{item.evidence}</span>
                                                   <span contentEditable suppressContentEditableWarning className="text-[9px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-sm border border-emerald-100 font-bold outline-none">{item.confidence}</span>
                                                </div>
                                             </div>
                                          ))}
                                       </div>
                                    </div>

                                    {/* Contact */}
                                    <div className="flex flex-col group h-full">
                                       <div className="border-b-[3px] border-[#F43F5E] pb-2 mb-5 shrink-0">
                                          <span contentEditable suppressContentEditableWarning className="text-[10px] font-black text-[#BE123C] uppercase tracking-widest outline-none block hover:bg-rose-50 w-max">Contact Phase</span>
                                       </div>
                                       <div className="space-y-4 overflow-y-auto custom-scrollbar flex-1 pr-1 pb-4">
                                          {slides[activeSlide].content.kontak.map((item, idx) => (
                                             <div key={idx} className="bg-white border border-[#E5E7EB] p-3.5 rounded-md shadow-sm relative pl-4 hover:border-blue-400 hover:shadow-md transition-all cursor-text group/item">
                                                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#FB7185] rounded-l-md" />
                                                <div className="absolute rounded border bg-white shadow-sm -top-2.5 -right-2.5 hidden group-hover/item:flex items-center gap-0.5 p-0.5 z-10 text-slate-400">
                                                   <Move className="h-3 w-3 hover:text-slate-700 cursor-move" />
                                                   <X className="h-3 w-3 hover:text-rose-600 cursor-pointer" />
                                                </div>
                                                <div contentEditable suppressContentEditableWarning className="text-[11px] font-bold text-rose-800 mb-1 outline-none">{item.waktu}</div>
                                                <div contentEditable suppressContentEditableWarning className="text-[12px] font-bold text-[#4C0519] leading-[1.4] outline-none mb-3">{item.kejadian}</div>
                                                <div className="flex gap-2 shrink-0">
                                                   <span contentEditable suppressContentEditableWarning className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded-sm text-slate-500 font-medium outline-none">{item.evidence}</span>
                                                   <span contentEditable suppressContentEditableWarning className="text-[9px] bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded-sm border border-rose-200 font-bold outline-none">{item.confidence}</span>
                                                </div>
                                             </div>
                                          ))}
                                       </div>
                                    </div>

                                    {/* Post-Contact */}
                                    <div className="flex flex-col group h-full">
                                       <div className="border-b-[3px] border-[#F59E0B] pb-2 mb-5 shrink-0">
                                          <span contentEditable suppressContentEditableWarning className="text-[10px] font-black text-[#B45309] uppercase tracking-widest outline-none block hover:bg-amber-50 w-max">Post-Contact Phase</span>
                                       </div>
                                       <div className="space-y-4 overflow-y-auto custom-scrollbar flex-1 pr-1 pb-4">
                                          {slides[activeSlide].content.pascaKontak.map((item, idx) => (
                                             <div key={idx} className="bg-white border border-[#E5E7EB] p-3.5 rounded-md shadow-sm relative pl-4 hover:border-blue-400 hover:shadow-md transition-all cursor-text group/item">
                                                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#FBBF24] rounded-l-md" />
                                                <div className="absolute rounded border bg-white shadow-sm -top-2.5 -right-2.5 hidden group-hover/item:flex items-center gap-0.5 p-0.5 z-10 text-slate-400">
                                                    <Move className="h-3 w-3 hover:text-slate-700 cursor-move" />
                                                   <X className="h-3 w-3 hover:text-rose-600 cursor-pointer" />
                                                </div>
                                                <div contentEditable suppressContentEditableWarning className="text-[11px] font-bold text-slate-800 mb-1 outline-none">{item.waktu}</div>
                                                <div contentEditable suppressContentEditableWarning className="text-[12px] font-medium text-slate-600 leading-[1.4] outline-none mb-3">{item.kejadian}</div>
                                                <div className="flex gap-2 shrink-0">
                                                   <span contentEditable suppressContentEditableWarning className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded-sm text-slate-500 font-medium outline-none">{item.evidence}</span>
                                                   <span contentEditable suppressContentEditableWarning className="text-[9px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded-sm border border-amber-200 font-bold outline-none">{item.confidence}</span>
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
                                 <h2 contentEditable suppressContentEditableWarning className="text-[32px] font-bold text-[#1f2937] tracking-tight outline-none mb-8 hover:bg-slate-50 p-2 -ml-2 rounded border border-transparent hover:border-slate-200">{slides[activeSlide].title}</h2>
                                 <div className="flex-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-6 font-mono text-[11px] text-slate-600 overflow-auto overflow-x-hidden custom-scrollbar" contentEditable suppressContentEditableWarning>
                                    {JSON.stringify(slides[activeSlide].content, null, 2)}
                                 </div>
                              </div>
                           )}
                           
                           {/* Add Page Footer Margin */}
                           {slides[activeSlide] && <div className="absolute bottom-[20px] right-[40px] text-[8px] font-bold text-slate-400 tracking-widest font-mono">BERAU COAL INTERNAL</div>}
                        </div>
                     </div>
                  </div>

                  {/* D. Right Properties Panel */}
                  <div className="w-[260px] bg-white border-l border-slate-200 shrink-0 flex flex-col z-10 shadow-[-1px_0_10px_rgba(0,0,0,0.02)]">
                     <div className="px-4 py-3 border-b border-slate-200 bg-[#FCFCFD] flex items-center justify-between">
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Properties</span>
                        <Settings className="h-3 w-3 text-slate-400" />
                     </div>
                     <div className="p-5 space-y-7 flex-1 overflow-y-auto custom-scrollbar">
                        <div>
                           <label className="text-[9px] font-bold text-slate-800 mb-3 block uppercase tracking-wider">Slide Layout</label>
                           <div className="grid grid-cols-2 gap-3">
                              <div className="aspect-video border-[1.5px] border-blue-600 rounded bg-blue-50 flex items-center justify-center cursor-pointer shadow-sm relative"><div className="w-[70%] h-1.5 bg-blue-200 rounded-sm" /><div className="absolute top-1 left-1.5 w-2 h-2 bg-blue-500 rounded-full" /></div>
                              <div className="aspect-video border border-slate-200 rounded hover:border-slate-400 flex items-center justify-center cursor-pointer transition-colors"><div className="w-[45%] h-[80%] bg-slate-100 border-r border-slate-200" /></div>
                              <div className="aspect-video border border-slate-200 rounded hover:border-slate-400 flex flex-col items-center justify-center cursor-pointer transition-colors gap-1"><div className="w-[80%] h-[15%] bg-slate-200 rounded-sm"/><div className="w-[80%] h-[15%] bg-slate-200 rounded-sm"/></div>
                              <div className="aspect-video border border-slate-200 rounded hover:border-slate-400 flex items-center justify-center cursor-pointer transition-colors"><div className="w-[60%] h-[60%] bg-slate-100 rounded-sm border border-slate-200" /></div>
                           </div>
                        </div>
                        <div className="border-t border-slate-100 pt-6">
                           <label className="text-[9px] font-bold text-slate-800 mb-3 block uppercase tracking-wider">Text Styling</label>
                           <div className="flex items-center gap-1 bg-slate-50 p-1 border border-slate-200 rounded-md w-max mb-4 shadow-sm">
                              <Button variant="ghost" size="sm" className="h-7 w-8 p-0 text-slate-800 bg-white border border-slate-200 shadow-sm"><Bold className="h-3.5 w-3.5" /></Button>
                              <Button variant="ghost" size="sm" className="h-7 w-8 p-0 text-slate-600 hover:bg-white"><Italic className="h-3.5 w-3.5" /></Button>
                              <Button variant="ghost" size="sm" className="h-7 w-8 p-0 text-slate-600 hover:bg-white"><Underline className="h-3.5 w-3.5" /></Button>
                           </div>
                           <div className="space-y-4">
                               <div className="flex items-center justify-between">
                                   <span className="text-[11px] font-medium text-slate-600">Font Size</span>
                                   <div className="flex items-center border border-slate-200 rounded shadow-sm bg-white overflow-hidden w-16">
                                      <div className="px-2 py-1 text-[11px] font-mono text-slate-800 bg-slate-50 border-r border-slate-200 flex-1 text-center">14</div>
                                      <div className="px-1.5 py-1 text-[9px] text-slate-400 hover:text-slate-700 cursor-pointer">pt</div>
                                   </div>
                               </div>
                               <div className="flex items-center justify-between">
                                   <span className="text-[11px] font-medium text-slate-600">Text Align</span>
                                   <div className="flex gap-1.5">
                                      <div className="h-[18px] w-[22px] border border-blue-600 rounded bg-blue-50 cursor-pointer shadow-sm relative"><div className="absolute top-[4px] left-[3px] w-[14px] h-[1.5px] bg-blue-600 rounded-sm" /><div className="absolute top-[8px] left-[3px] w-[10px] h-[1.5px] bg-blue-600 rounded-sm" /><div className="absolute top-[12px] left-[3px] w-[14px] h-[1.5px] bg-blue-600 rounded-sm" /></div>
                                      <div className="h-[18px] w-[22px] border border-slate-200 rounded hover:border-slate-400 cursor-pointer relative"><div className="absolute top-[4px] left-1/2 -translate-x-1/2 w-[14px] h-[1.5px] bg-slate-400 rounded-sm" /><div className="absolute top-[8px] left-1/2 -translate-x-1/2 w-[10px] h-[1.5px] bg-slate-400 rounded-sm" /><div className="absolute top-[12px] left-1/2 -translate-x-1/2 w-[14px] h-[1.5px] bg-slate-400 rounded-sm" /></div>
                                      <div className="h-[18px] w-[22px] border border-slate-200 rounded hover:border-slate-400 cursor-pointer relative"><div className="absolute top-[4px] right-[3px] w-[14px] h-[1.5px] bg-slate-400 rounded-sm" /><div className="absolute top-[8px] right-[3px] w-[10px] h-[1.5px] bg-slate-400 rounded-sm" /><div className="absolute top-[12px] right-[3px] w-[14px] h-[1.5px] bg-slate-400 rounded-sm" /></div>
                                   </div>
                               </div>
                               <div className="flex items-center justify-between">
                                   <span className="text-[11px] font-medium text-slate-600">Color Fill</span>
                                   <div className="h-5 w-5 bg-[#1f2937] rounded border border-slate-300 shadow-sm cursor-pointer hover:ring-2 ring-slate-200 ring-offset-1" />
                               </div>
                           </div>
                        </div>
                     </div>
                  </div>

               </div>
            </div>
         </div>
      )}`;
      
      let newText = text.slice(0, targetIndex) + replacementStr + text.slice(endIndex);
      
      fs.writeFileSync(CACHE_FILE, newText);
      console.log('Success completely replacing floating modal');
   } else {
      console.log('Could not find endIndex');
   }
} else {
   console.log('Could not find anchorStart');
}
