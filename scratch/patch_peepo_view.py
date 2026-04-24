import sys

path = 'src/pages/CaseWorkspacePage.tsx'
with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find the block around the fallback JSON view
start_idx = -1
end_idx = -1
for i, line in enumerate(lines):
    if 'flex-1 bg-[#1a1c23] rounded-sm p-6 overflow-hidden border border-slate-700 relative' in line and i > 4000:
        start_idx = i - 1
        for j in range(i, i + 10):
            if 'JSON.stringify(slides[activeSlide]?.content, null, 2)' in lines[j]:
                end_idx = j + 3
                break
        if end_idx != -1:
            break

if start_idx != -1 and end_idx != -1:
    new_block = """                                        ) : selectedAgentId === 'peepo' ? (
                                           <div className="flex flex-col h-full bg-white overflow-hidden animate-in fade-in duration-500">
                                              <div className="h-16 border-b border-slate-200 flex items-center justify-between px-8 bg-slate-50/30 shrink-0">
                                                 <div className="flex items-center gap-3">
                                                    <Brain className="h-5 w-5 text-slate-900" />
                                                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">PEEPO Factor Analysis</h2>
                                                 </div>
                                                 <div className="flex items-center gap-2">
                                                    <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Synthesis Complete</span>
                                                 </div>
                                              </div>
                                              <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-10 bg-slate-50/10">
                                                 <div className="max-w-5xl mx-auto space-y-8">
                                                    <div className="bg-[#8ba861] p-3 border-2 border-slate-900 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                                                       <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                                                          <ShieldAlert className="h-4 w-4" />
                                                          TABEL PEEPO - Kejadian Pelanggaran PD UNIT DTMB 26
                                                       </h3>
                                                    </div>
                                                    
                                                    <div className="border-2 border-slate-900 bg-white rounded-none shadow-[12px_12px_0px_rgba(0,0,0,0.05)] overflow-hidden">
                                                       {[
                                                          { id: 'people', label: 'People', color: 'bg-emerald-50' },
                                                          { id: 'equipment', label: 'Equipment', color: 'bg-white' },
                                                          { id: 'environment', label: 'Environment', color: 'bg-emerald-50' },
                                                          { id: 'procedures', label: 'Process', color: 'bg-white' },
                                                          { id: 'organisation', label: 'Organization', color: 'bg-emerald-50' },
                                                       ].map((section, sIdx) => (
                                                          <div key={section.id} className={`grid grid-cols-[200px_1fr] border-b border-slate-200 last:border-0 ${section.color}`}>
                                                             <div className="border-r border-slate-200 p-8 flex items-center justify-center bg-slate-50/50">
                                                                <span className="text-2xl font-black text-slate-900 uppercase tracking-tighter text-center">{section.label}</span>
                                                             </div>
                                                             <div className="p-6">
                                                                <ul className="space-y-3">
                                                                   {(selectedAgent?.results?.[section.id] || []).map((item: string, iIdx: number) => (
                                                                      <li key={iIdx} className="flex gap-3 text-sm text-slate-700 leading-relaxed group">
                                                                         <div className="h-1.5 w-1.5 rounded-full bg-slate-400 mt-2 shrink-0 group-hover:bg-[#8ba861] transition-colors" />
                                                                         <span className="font-medium">{item}</span>
                                                                      </li>
                                                                   ))}
                                                                </ul>
                                                             </div>
                                                          </div>
                                                       ))}
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-6">
                                                       <div className="border border-slate-200 bg-white p-6 shadow-sm relative overflow-hidden">
                                                          <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
                                                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Ringkasan Analisis</span>
                                                          <p className="text-sm font-bold text-slate-900 leading-snug">{selectedAgent?.results?.ringkasan}</p>
                                                       </div>
                                                       <div className="border border-slate-200 bg-slate-900 p-6 shadow-sm relative overflow-hidden">
                                                          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
                                                          <span className="text-[9px] font-black text-emerald-400/50 uppercase tracking-widest block mb-2">Synthesis Indicator</span>
                                                          <p className="text-sm font-black text-white italic tracking-tight">{selectedAgent?.results?.synthesis}</p>
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
    print("Successfully patched PEEPO view")
else:
    print(f"Failed to find indices: start={start_idx}, end={end_idx}")
    sys.exit(1)
