import sys

path = 'src/pages/CaseWorkspacePage.tsx'
with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find the block
start_idx = -1
end_idx = -1
for i, line in enumerate(lines):
    if 'selectedAgentId === \'actor\' ? \'Actor Intelligence Profile\'' in line:
        start_idx = i + 1
    if start_idx != -1 and '</pre>' in line:
        end_idx = i + 2
        break

if start_idx != -1 and end_idx != -1:
    new_block = """                                       {selectedAgentId === 'actor' ? (
                                          <div className="flex-1 overflow-y-auto custom-scrollbar p-0 space-y-10">
                                             <div className="border-2 border-slate-900 bg-white p-8 rounded-none shadow-[12px_12px_0px_rgba(0,0,0,0.05)] relative overflow-hidden group max-w-4xl">
                                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                                   <Brain className="h-48 w-48 text-slate-900 -mr-12 -mt-12 rotate-12" />
                                                </div>
                                                <div className="flex gap-12 relative z-10">
                                                   <div className="flex flex-col gap-6 shrink-0">
                                                      <div className="h-48 w-48 border-4 border-slate-900 bg-slate-50 overflow-hidden rounded-none relative shadow-[4px_4px_0px_rgba(0,0,0,0.1)]">
                                                         <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400&h=400" alt="Actor" className="h-full w-full object-cover grayscale" />
                                                         <div className="absolute bottom-0 left-0 right-0 bg-slate-900 text-white text-[9px] font-black uppercase text-center py-2 tracking-widest">IDENTITY VERIFIED</div>
                                                      </div>
                                                      <div className="p-4 border border-slate-200 bg-white flex flex-col items-center gap-2 shadow-sm">
                                                         <div className="h-20 w-20 bg-slate-100 flex items-center justify-center p-2"><Copy className="h-12 w-12 text-slate-300" /></div>
                                                         <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">NPK: 61230944</span>
                                                      </div>
                                                   </div>
                                                   <div className="flex-1 flex flex-col justify-between py-2">
                                                      <div className="space-y-4">
                                                         <div className="flex items-center gap-3"><span className="px-3 py-1 bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest rounded-none italic shadow-[4px_4px_0px_rgba(0,0,0,0.1)]">OPERATOR</span><span className="text-xs font-black text-slate-400 uppercase tracking-tight">Site Production Area 2</span></div>
                                                         <h2 className="text-6xl font-black text-slate-900 uppercase tracking-tighter leading-none">BAGAS PRAMONO</h2>
                                                         <p className="text-lg font-bold text-slate-500 uppercase tracking-[0.3em] opacity-60">NPK ID: 61230944</p>
                                                      </div>
                                                      <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-100">
                                                         <div className="flex flex-col gap-1"><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Division</span><span className="text-sm font-black text-slate-900 uppercase tracking-tight">ALL DIVISION</span></div>
                                                         <div className="flex flex-col gap-1 border-l border-slate-200 pl-8"><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Company</span><span className="text-sm font-black text-slate-900 uppercase italic tracking-tight">PT Pamapersada Nusantara</span></div>
                                                      </div>
                                                   </div>
                                                </div>
                                             </div>
                                             <div className="space-y-6 max-w-4xl pb-12">
                                                <div className="border border-slate-200 bg-slate-200 flex flex-col gap-px rounded-none overflow-hidden shadow-sm">
                                                   {[
                                                      { label: 'Full Name', value: 'Bagas Pramono' },
                                                      { label: 'NPK / Employee ID', value: '61230944' },
                                                      { label: 'Functional Position', value: 'Operator' },
                                                      { label: 'Structural Position', value: 'OPERATOR TP' },
                                                      { label: 'Work Location', value: 'Site Production Area 2' },
                                                      { label: 'Division', value: 'ALL DIVISION' },
                                                      { label: 'Employment Status', value: 'EKSTERNAL' },
                                                      { label: 'Hiring Date', value: '02 Nov 2023' },
                                                      { label: 'Birth Info', value: 'Kebumen, 01 Oct 2002' },
                                                      { label: 'Contact (Personal)', value: '089525781130' },
                                                      { label: 'Email Address', value: 'xtav1.06.bagaspramono@gmail.com' },
                                                      { label: 'Emergency Contact', value: 'Karmi Ibu (0895329820979)' },
                                                   ].map((field, idx) => (
                                                      <div key={idx} className="grid grid-cols-[240px_1fr] gap-px bg-slate-200">
                                                         <div className="bg-slate-50 p-4 flex items-center"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{field.label}</span></div>
                                                         <div className="bg-white p-4 flex items-center group transition-colors hover:bg-slate-50"><span className="text-sm font-black text-slate-900 uppercase tracking-tight">{field.value}</span></div>
                                                      </div>
                                                   ))}
                                                </div>
                                             </div>
                                          </div>
                                       ) : (
                                          <div className="flex-1 bg-[#1a1c23] rounded-sm p-6 overflow-hidden border border-slate-700 relative">
                                             <pre className="text-[12px] font-mono text-emerald-400/90 leading-tight h-full overflow-auto custom-scrollbar">
                                                {JSON.stringify(slides[activeSlide]?.content, null, 2)}
                                             </pre>
                                          </div>
                                       )}
"""
    # Replace lines from start_idx to end_idx
    lines[start_idx:end_idx+1] = [new_block + '\n']
    
    with open(path, 'w', encoding='utf-8') as f:
        f.writelines(lines)
    print("Successfully patched CaseWorkspacePage.tsx")
else:
    print(f"Failed to find indices: start={start_idx}, end={end_idx}")
    sys.exit(1)
