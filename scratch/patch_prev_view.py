import sys

path = 'src/pages/CaseWorkspacePage.tsx'
with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find the block around the fallback JSON view
start_idx = -1
end_idx = -1
for i, line in enumerate(lines):
    if 'selectedAgentId === \'ipls\'' in line and i > 4000:
        # We want to inject BEFORE the final fallback else
        for j in range(i, len(lines)):
            if 'JSON.stringify(slides[activeSlide]?.content, null, 2)' in lines[j]:
                start_idx = j - 3
                end_idx = j + 3
                break
        if start_idx != -1:
            break

if start_idx != -1 and end_idx != -1:
    new_block = """                                        ) : selectedAgentId === 'prev' ? (
                                           <div className="flex flex-col h-full bg-white overflow-hidden animate-in fade-in duration-500">
                                              <div className="h-16 border-b border-slate-200 flex items-center justify-between px-8 bg-slate-50/30 shrink-0">
                                                 <div className="flex items-center gap-3">
                                                    <HardHat className="h-5 w-5 text-slate-900" />
                                                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Prevention Action Plan</h2>
                                                 </div>
                                                 <div className="flex items-center gap-2">
                                                    <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Plan Generated</span>
                                                 </div>
                                              </div>
                                              <div className="flex-1 overflow-y-auto custom-scrollbar p-8 bg-slate-50/10">
                                                 <div className="max-w-[1600px] mx-auto space-y-12">
                                                    
                                                    {[
                                                       { id: 'root', title: 'Root Cause', color: 'text-red-600', data: selectedAgent?.results?.root_cause_actions },
                                                       { id: 'nc', title: 'Non Conformity', color: 'text-amber-500', data: selectedAgent?.results?.non_conformity_actions },
                                                       { id: 'imp', title: 'Improvement', color: 'text-emerald-600', data: selectedAgent?.results?.improvement_actions },
                                                    ].map((section) => (
                                                       <div key={section.id} className="space-y-4">
                                                          <h3 className={`text-2xl font-black uppercase tracking-tight ${section.color}`}>{section.title}</h3>
                                                          <div className="border-2 border-slate-900 shadow-[12px_12px_0px_rgba(0,0,0,0.05)] overflow-hidden">
                                                             <table className="w-full border-collapse">
                                                                <thead>
                                                                   <tr className="bg-slate-200 border-b-2 border-slate-900">
                                                                      <th className="p-3 text-[10px] font-black text-slate-600 uppercase border-r border-slate-300 w-12 text-center">NO</th>
                                                                      <th className="p-3 text-[10px] font-black text-slate-600 uppercase border-r border-slate-300 w-24 text-center">LAYER</th>
                                                                      <th className="p-3 text-[10px] font-black text-slate-600 uppercase border-r border-slate-300 w-32 text-center">HIRARKI KONTROL</th>
                                                                      <th className="p-3 text-[10px] font-black text-slate-600 uppercase border-r border-slate-300 text-left">TINDAKAN PERBAIKAN</th>
                                                                      <th className="p-3 text-[10px] font-black text-slate-600 uppercase border-r border-slate-300 w-40 text-center">PENANGGUNG JAWAB</th>
                                                                      <th className="p-3 text-[10px] font-black text-slate-600 uppercase border-r border-slate-300 w-32 text-center">DUE DATE</th>
                                                                      <th className="p-3 text-[10px] font-black text-slate-600 uppercase w-32 text-center">STATUS</th>
                                                                   </tr>
                                                                </thead>
                                                                <tbody>
                                                                   {(section.data || []).map((item: any, idx: number) => (
                                                                      <tr key={idx} className="border-b border-slate-200 bg-white hover:bg-slate-50 transition-colors">
                                                                         <td className="p-4 text-[11px] font-bold text-slate-900 border-r border-slate-100 text-center">{item.no}</td>
                                                                         <td className="p-4 text-[11px] font-black text-slate-500 border-r border-slate-100 text-center">{item.layer}</td>
                                                                         <td className="p-4 text-[11px] font-bold text-slate-900 border-r border-slate-100 text-center uppercase tracking-tighter">{item.hierarchy}</td>
                                                                         <td className="p-4 text-[11px] font-black text-slate-900 border-r border-slate-100 uppercase tracking-tight leading-tight">{item.action}</td>
                                                                         <td className="p-4 text-[11px] font-bold text-slate-700 border-r border-slate-100 text-center">{item.pic}</td>
                                                                         <td className="p-4 text-[11px] font-bold text-slate-500 border-r border-slate-100 text-center">{item.due_date}</td>
                                                                         <td className="p-0 border-r border-slate-100">
                                                                            <div className={cn(
                                                                               "h-full w-full p-4 flex items-center justify-center font-black text-[10px] tracking-widest",
                                                                               item.status === 'OPEN' ? "bg-red-600 text-white" :
                                                                               item.status === 'PROGRESS' ? "bg-yellow-400 text-slate-900" :
                                                                               "bg-emerald-600 text-white"
                                                                            )}>
                                                                               {item.status}
                                                                            </div>
                                                                         </td>
                                                                      </tr>
                                                                   ))}
                                                                </tbody>
                                                             </table>
                                                          </div>
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
                                        )
"""
    lines[start_idx:end_idx] = [new_block + '\n']
    with open(path, 'w', encoding='utf-8') as f:
        f.writelines(lines)
    print("Successfully patched Prevention view")
else:
    print(f"Failed to find indices: start={start_idx}, end={end_idx}")
    sys.exit(1)
