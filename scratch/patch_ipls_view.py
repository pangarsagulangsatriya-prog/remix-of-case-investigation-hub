import sys

path = 'src/pages/CaseWorkspacePage.tsx'
with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find the block around the fallback JSON view
start_idx = -1
end_idx = -1
for i, line in enumerate(lines):
    if 'selectedAgentId === \'peepo\'' in line and i > 4000:
        # We want to inject BEFORE the final fallback else
        # Look for the last ')}' that closes the peepo block
        for j in range(i, len(lines)):
            if 'JSON.stringify(slides[activeSlide]?.content, null, 2)' in lines[j]:
                start_idx = j - 3
                end_idx = j + 3
                break
        if start_idx != -1:
            break

if start_idx != -1 and end_idx != -1:
    new_block = """                                        ) : selectedAgentId === 'ipls' ? (
                                           <div className="flex flex-col h-full bg-white overflow-hidden animate-in fade-in duration-500">
                                              <div className="h-16 border-b border-slate-200 flex items-center justify-between px-8 bg-slate-50/30 shrink-0">
                                                 <div className="flex items-center gap-3">
                                                    <Layers className="h-5 w-5 text-slate-900" />
                                                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Integrated Profile Layer (IPLS)</h2>
                                                 </div>
                                                 <div className="flex items-center gap-2">
                                                    <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Defensive Audit Complete</span>
                                                 </div>
                                              </div>
                                              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-slate-50/10">
                                                 <div className="max-w-[1400px] mx-auto space-y-6">
                                                    {/* Defensive Layers Grid */}
                                                    <div className="grid grid-cols-5 gap-px bg-slate-200 border-2 border-slate-900 shadow-[12px_12px_0px_rgba(0,0,0,0.05)]">
                                                       {(selectedAgent?.results?.layers || []).map((layer: any) => (
                                                          <div key={layer.id} className="bg-white flex flex-col min-h-[500px]">
                                                             <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col items-center gap-1">
                                                                <span className="text-[10px] font-black text-[#8ba861] uppercase tracking-widest italic">Layer {["I", "II", "III", "IV", "V"][layer.id - 1]}</span>
                                                                <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-tight text-center leading-tight min-h-[32px] flex items-center">{layer.title}</h3>
                                                             </div>
                                                             <div className="p-4 space-y-3 flex-1 bg-[#f1f6ea]/30">
                                                                {layer.items.map((item: any, idx: number) => (
                                                                   <div key={idx} className="flex gap-3 group">
                                                                      <div className="mt-1 shrink-0">
                                                                         {item.status === 'rootcause' ? (
                                                                            <div className="h-4 w-4 rounded-full border-2 border-red-500 flex items-center justify-center">
                                                                               <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                                                                            </div>
                                                                         ) : item.status === 'non-conformity' ? (
                                                                            <div className="h-4 w-4 rounded-full border-2 border-amber-500 flex items-center justify-center">
                                                                               <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                                                            </div>
                                                                         ) : (
                                                                            <div className="h-4 w-4 rounded-full border-2 border-emerald-500 flex items-center justify-center">
                                                                               <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                                            </div>
                                                                         )}
                                                                      </div>
                                                                      <div className="space-y-1">
                                                                         <span className="text-[10px] font-bold text-slate-400">{item.id}.</span>
                                                                         <p className="text-[10px] font-black text-slate-800 leading-tight uppercase tracking-tight group-hover:text-slate-900 transition-colors">{item.label}</p>
                                                                      </div>
                                                                   </div>
                                                                ))}
                                                             </div>
                                                          </div>
                                                       ))}
                                                    </div>

                                                    {/* Legend and Summary */}
                                                    <div className="grid grid-cols-[1fr_400px] gap-6">
                                                       <div className="bg-slate-900 p-6 flex items-center justify-between shadow-sm border border-slate-800">
                                                          <div className="flex items-center gap-10">
                                                             <div className="flex items-center gap-3">
                                                                <div className="h-5 w-5 rounded-full border-2 border-red-500 flex items-center justify-center"><div className="h-2 w-2 rounded-full bg-red-500" /></div>
                                                                <span className="text-[10px] font-black text-white uppercase tracking-widest">Rootcause</span>
                                                             </div>
                                                             <div className="flex items-center gap-3">
                                                                <div className="h-5 w-5 rounded-full border-2 border-amber-500 flex items-center justify-center"><div className="h-2 w-2 rounded-full bg-amber-500" /></div>
                                                                <span className="text-[10px] font-black text-white uppercase tracking-widest">Non Conformity</span>
                                                             </div>
                                                             <div className="flex items-center gap-3">
                                                                <div className="h-5 w-5 rounded-full border-2 border-emerald-500 flex items-center justify-center"><div className="h-2 w-2 rounded-full bg-emerald-500" /></div>
                                                                <span className="text-[10px] font-black text-white uppercase tracking-widest">Improvement</span>
                                                             </div>
                                                          </div>
                                                          <div className="flex items-center gap-3 border-l border-slate-700 pl-10">
                                                             <img src="https://upload.wikimedia.org/wikipedia/commons/d/df/Berau_Coal_Energy_logo.png" alt="Berau Coal" className="h-4 opacity-50 grayscale invert" />
                                                          </div>
                                                       </div>
                                                       <div className="bg-white border-2 border-slate-900 p-6 shadow-[8px_8px_0px_rgba(0,0,0,0.05)] relative overflow-hidden">
                                                          <div className="absolute top-0 right-0 w-16 h-16 bg-slate-50 flex items-center justify-center -mr-8 -mt-8 rotate-45">
                                                             <AlertTriangle className="h-6 w-6 text-amber-500 -rotate-45 mt-4" />
                                                          </div>
                                                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Investigation Priority</span>
                                                          <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-2">{selectedAgent?.results?.priority_layer}</h4>
                                                          <p className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase">{selectedAgent?.results?.summary}</p>
                                                       </div>
                                                    </div>
                                                 </div>
                                              </div>
                                           </div>
                                        ) : (
                                           <div className="flex-1 bg-[#1a1c23] rounded-sm p-6 overflow-hidden border border-slate-700 relative">
                                              <pre className="text-[12px] font-mono text-emerald-400/90 leading-tight h-full overflow-auto custom-scrollbar">
                                                 {JSON.stringify(slides[activeSlide]?.content, null, 2)}
                                              </pre>
                                           </div>
                                        )
"""
    lines[start_idx:end_idx] = [new_block + '\n']
    with open(path, 'w', encoding='utf-8') as f:
        f.writelines(lines)
    print("Successfully patched IPLS view")
else:
    print(f"Failed to find indices: start={start_idx}, end={end_idx}")
    sys.exit(1)
