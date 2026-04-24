
import os

file_path = r"c:\Users\Feedloop\OneDrive\Desktop\Demo File\remix-of-case-investigation-hub\src\pages\CaseWorkspacePage.tsx"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove actor from initialAgentsState
import re
content = re.sub(r'{\s*id: \'actor\',\s*name: \'Actor Intelligence\',.*?results: {.*?}\s*},', '', content, flags=re.DOTALL)

# 2. Update peepo dependency to 'fact'
content = content.replace("dependencies: ['actor']", "dependencies: ['fact']")

# 3. Update chain queue
content = content.replace('setChainQueue(["fact", "actor", "peepo", "ipls", "prev"]);', 'setChainQueue(["fact", "peepo", "ipls", "prev"]);')

# 4. Fix the return statement logic
# We will identify the start and end of the return statement and replace it with a clean version 
# that preserves the sidebar UI the user likes.

lines = content.splitlines()

start_return = -1
for i, line in enumerate(lines):
    if "return (" in line and i > 4000:
        start_return = i
        break

end_comp = -1
for i, line in enumerate(lines):
    if "function ReportsTab()" in line:
        end_comp = i
        break

if start_return == -1 or end_comp == -1:
    print(f"Indices not found: start={start_return}, end={end_comp}")
    exit(1)

# Prepare the clean Return Statement
# We will copy the sidebar part from the original content to ensure it's EXACTLY what they have.

sidebar_start = -1
sidebar_end = -1
for i in range(start_return, end_comp):
    if '<div className="w-[320px] border-r border-slate-200' in lines[i]:
        sidebar_start = i
    if '</div> {/* End Orchestration Sidebar */}' in lines[i] or (sidebar_start != -1 and '</div>' in lines[i] and 'flex-1 flex flex-col min-w-0 bg-white' in lines[i+1]):
        sidebar_end = i
        break

# If we can't find clear markers, we'll just hardcode the clean return but with the user's UI.

new_jsx = """   return (
    <div className="flex h-full bg-[#f0f2f4] overflow-hidden animate-in fade-in duration-500">
         {/* Orchestration Sidebar */}
         <div className="w-[320px] border-r border-slate-200 bg-slate-50 flex flex-col shrink-0 z-20 shadow-[1px_0_4px_rgba(0,0,0,0.02)]">
            <div className="h-12 border-b border-slate-200 flex items-center justify-between px-5 bg-white shrink-0">
               <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${globalStatus === 'running' ? 'bg-amber-500 animate-pulse' : 'bg-slate-300'}`} />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Orchestration</span>
               </div>
               {globalStatus === 'running' && (
                  <Button onClick={stopChain} variant="ghost" size="sm" className="h-7 px-2 text-[9px] font-bold text-rose-500 hover:bg-rose-50 border border-rose-100">
                     <XCircle className="h-3 w-3 mr-1" /> Stop
                  </Button>
               )}
            </div>

            <div className="p-4 bg-white border-b border-slate-100">
               <Button 
                  onClick={startFullChain}
                  disabled={globalStatus === 'running'}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] uppercase tracking-wider h-10  border-none group"
               >
                  <Play className="h-3 w-3 mr-2 group-hover:translate-x-0.5 transition-transform" /> Execute Full Chain
               </Button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar relative">
               <div className="absolute left-[39px] top-6 bottom-6 w-px bg-slate-200 z-0" />
               <div className="p-4 space-y-4 relative z-10">
                  {agents.map((agent) => (
                     <div 
                        key={agent.id}
                        onClick={() => setSelectedAgentId(agent.id)}
                        className={`
                           group relative flex flex-col p-5 rounded-sm border bg-white transition-all cursor-pointer overflow-hidden
                           ${selectedAgentId === agent.id ? "border-slate-900  ring-1 ring-slate-900/5 -translate-y-0.5" : "border-slate-200 hover:border-slate-300  hover:"}
                        `}
                     >
                        <div className="flex items-start justify-between mb-4">
                           <div className={`h-12 w-12 rounded-sm border flex items-center justify-center transition-all ${selectedAgentId === agent.id ? "bg-slate-900 text-white border-slate-900  shadow-slate-900/20" : "bg-white text-slate-400 border-slate-100"}`}>
                              <agent.icon className="h-5 w-5" />
                           </div>
                           <div className="flex flex-col items-end gap-2">
                              <div className={`
                                   px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border
                                   ${agent.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                                     agent.status === 'running' ? 'bg-blue-50 text-blue-700 border-blue-100 animate-pulse' : 
                                     agent.status === 'stopped' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                                     'bg-slate-50 text-slate-400 border-slate-100'}
                              `}>
                                   {agent.status}
                              </div>
                              {agent.lastRunTimestamp && (
                                 <span className="text-[8px] font-bold text-slate-300 uppercase tracking-tight">{agent.lastRunTimestamp}</span>
                              )}
                           </div>
                        </div>

                        <div className="space-y-1 mb-4">
                           <h4 className={`text-[11px] font-black uppercase tracking-[0.15em] ${selectedAgentId === agent.id ? "text-slate-900" : "text-slate-500"}`}>{agent.name}</h4>
                           <p className="text-[10px] font-medium text-slate-400 leading-snug line-clamp-2 opacity-80">{agent.purpose}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-50">
                           {agent.status === 'running' ? (
                              <Button 
                                 onClick={(e) => { e.stopPropagation(); stopSingleAgent(agent.id); }}
                                 variant="outline" 
                                 className="col-span-2 h-10 bg-rose-50 hover:bg-rose-100 border-rose-100 text-rose-600 text-[10px] font-black uppercase tracking-[0.1em] rounded-sm transition-all"
                              >
                                 <XCircle className="h-4 w-4 mr-2" /> Stop Node
                              </Button>
                           ) : (
                              <>
                                 <Button 
                                    onClick={(e) => { e.stopPropagation(); setPreRunAgentId(agent.id); }}
                                    className="h-10 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-black uppercase tracking-[0.1em] rounded-sm shadow-[0_4px_12px_rgba(0,0,0,0.15)] transition-all hover:-translate-y-0.5 active:translate-y-0"
                                 >
                                    <Play className="h-3.5 w-3.5 mr-2 fill-current" /> {agent.runCount > 0 ? "Rerun" : "Execute"}
                                 </Button>
                                 <div className="flex gap-1.5">
                                    <Button 
                                       variant="outline" 
                                       onClick={(e) => { e.stopPropagation(); setHistoryAgentId(agent.id); }}
                                       className="flex-1 h-10 bg-white border-slate-200 text-slate-500 text-[10px] font-black uppercase tracking-[0.1em] rounded-sm hover:bg-slate-50 transition-colors"
                                    >
                                       <History className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                       variant="outline" 
                                       className="flex-1 h-10 bg-white border-slate-200 text-slate-500 text-[10px] font-black uppercase tracking-[0.1em] rounded-sm hover:bg-slate-50 transition-colors"
                                    >
                                       <Settings className="h-4 w-4" />
                                    </Button>
                                 </div>
                              </>
                           )}
                        </div>

                        {agent.status === 'running' && (
                           <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100 overflow-hidden">
                              <div className="h-full bg-blue-500 animate-pulse w-full origin-left" />
                           </div>
                        )}
                     </div>
                  ))}
               </div>
            </div>
         </div>

         <div className="flex-1 flex flex-col min-w-0 bg-white">
            <div className="flex-1 flex overflow-hidden">
               <div ref={containerRef} className="flex-1 relative overflow-auto custom-scrollbar flex items-start justify-center">
                  {selectedAgentId ? (
                     <div className="bg-white flex-1 flex flex-col relative transition-all duration-300 origin-center overflow-hidden w-full h-full">
                        <div className="flex-1 flex flex-col relative overflow-hidden h-full">
                           {selectedAgent?.status === 'running' ? (
                              <div className="flex flex-col items-center justify-center h-full text-center space-y-8 animate-pulse text-slate-300">
                                 <Loader2 className="h-12 w-12 animate-spin" />
                                 <span className="text-[20px] font-black uppercase tracking-[0.2em]">{selectedAgent.microStatus || "Processing Matrix..."}</span>
                              </div>
                           ) : !selectedAgent?.results ? (
                              <div className="flex flex-col h-full items-center justify-center text-center opacity-30 grayscale pointer-events-none space-y-6">
                                 <Cpu className="h-12 w-12 text-slate-300" />
                                 <h2 className="text-3xl font-black uppercase tracking-[0.2em] text-slate-400">Node Standby</h2>
                              </div>
                           ) : (
                              <div className="flex-1 animate-in fade-in duration-500 overflow-hidden">
                                 {slides[activeSlide]?.type === 'chronology_module' ? (
                                    <FactChronologyModule 
                                       initialItems={slides[activeSlide]?.content.items}
                                       metadata={slides[activeSlide]?.content.metadata}
                                       viewMode={factViewMode}
                                       onViewModeChange={setFactViewMode}
                                       selectedItemId={selectedRowId || undefined}
                                       onSelectItem={handleSelectRow}
                                       onSync={(newItems) => {
                                          setAgents(prev => prev.map(a => a.id === 'fact' ? {
                                             ...a,
                                             results: {
                                                ...a.results,
                                                chronology_items: newItems
                                             }
                                          } : a));
                                          toast.success("Chronology successfully synced to case intelligence.");
                                       }}
                                    />
                                 ) : (
                                    <div className="flex flex-col h-full p-8">
                                       <h2 className="text-[32px] font-black text-slate-800 mb-8 tracking-tighter uppercase">{slides[activeSlide]?.title}</h2>
                                       {selectedAgentId === 'peepo' ? (
                                          <div className="flex flex-col h-full bg-slate-50/10 animate-in fade-in duration-500 overflow-hidden">
                                             <div className="h-12 flex items-center justify-between px-5 border-b border-slate-200 bg-white shrink-0">
                                                <div className="flex items-center gap-2">
                                                   <div className="h-2 w-2 rounded-full bg-[#8ba861]" />
                                                   <h2 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">PEEPO Factor Analysis Sheet</h2>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                   <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
                                                   <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Synthesis Complete</span>
                                                </div>
                                             </div>
                                             <div className="flex-1 overflow-auto p-6 scrollbar-thin">
                                                <div className="max-w-5xl mx-auto space-y-8 pb-12">
                                                   {[
                                                      { id: 'people', label: 'People (Individu)' },
                                                      { id: 'environment', label: 'Environment (Lingkungan)' },
                                                      { id: 'equipment', label: 'Equipment (Peralatan)' },
                                                      { id: 'procedures', label: 'Procedures (Prosedur)' },
                                                      { id: 'organisation', label: 'Organisation (Organisasi)' },
                                                   ].map((section) => (
                                                      <div key={section.id} className="space-y-3">
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
                                                                     <th className="px-5 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest w-24 border-r border-b border-slate-200 bg-slate-50/30">ID</th>
                                                                     <th className="px-5 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest border-r border-b border-slate-200 bg-slate-50/30">Forensic Finding</th>
                                                                     <th className="px-5 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest w-32 border-r border-b border-slate-200 bg-slate-50/30">Traceability</th>
                                                                  </tr>
                                                               </thead>
                                                               <tbody>
                                                                  {(selectedAgent?.results?.[section.id] || []).map((item: any, idx: number) => {
                                                                     const isSelected = selectedRowId === (item.id || item);
                                                                     return (
                                                                        <tr 
                                                                           key={item.id || idx} 
                                                                           onClick={() => handleSelectRow(item.id || item)}
                                                                           className={cn(
                                                                              "group transition-all cursor-pointer",
                                                                              isSelected ? "bg-slate-100/80" : "hover:bg-slate-50/50"
                                                                           )}
                                                                        >
                                                                           <td className="px-5 py-4 align-top border-r border-b border-slate-200">
                                                                              <span className="text-[11px] font-mono font-black text-slate-400">#{section.id.slice(0, 1).toUpperCase()}{idx + 1}</span>
                                                                           </td>
                                                                           <td className="px-5 py-4 align-top border-r border-b border-slate-200">
                                                                              <p className={cn(
                                                                                 "text-[11px] font-bold leading-relaxed pr-8",
                                                                                 isSelected ? "text-slate-900" : "text-slate-700"
                                                                              )}>
                                                                                 {item.label || item}
                                                                              </p>
                                                                           </td>
                                                                           <td className="px-5 py-4 align-top border-r border-b border-slate-200 text-center">
                                                                              <Search className={cn("h-3.5 w-3.5 mx-auto", isSelected ? "text-slate-900" : "text-slate-300")} />
                                                                           </td>
                                                                        </tr>
                                                                     );
                                                                  })}
                                                               </tbody>
                                                            </table>
                                                         </div>
                                                      </div>
                                                   ))}
                                                   <div className="grid grid-cols-2 gap-6 pt-4">
                                                      <div className="bg-white border-l border-t border-slate-200 p-6 shadow-sm rounded-sm">
                                                         <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Analysis Summary</span>
                                                         <p className="text-[11px] font-bold text-slate-600 leading-relaxed italic">"{selectedAgent?.results?.ringkasan}"</p>
                                                      </div>
                                                      <div className="bg-slate-900 p-6 shadow-sm border border-slate-800 rounded-sm">
                                                         <span className="text-[9px] font-black text-emerald-400/50 uppercase tracking-widest block mb-2">Synthesis Intelligence</span>
                                                         <p className="text-[11px] font-black text-white uppercase tracking-tight leading-relaxed">{selectedAgent?.results?.synthesis}</p>
                                                      </div>
                                                   </div>
                                                </div>
                                             </div>
                                          </div>
                                       ) : selectedAgentId === 'ipls' ? (
                                          <div className="flex flex-col h-full bg-slate-50/10 animate-in fade-in duration-500 overflow-hidden">
                                             <div className="h-12 flex items-center justify-between px-5 border-b border-slate-200 bg-white shrink-0">
                                                <div className="flex items-center gap-2">
                                                   <div className="h-2 w-2 rounded-full bg-[#8ba861]" />
                                                   <h2 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Integrated Profile Layer (IPLS) Sheet</h2>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                   <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
                                                   <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Defensive Audit Complete</span>
                                                </div>
                                             </div>
                                             <div className="flex-1 overflow-auto p-6 scrollbar-thin">
                                                <div className="max-w-[1400px] mx-auto space-y-8 pb-12">
                                                   {(selectedAgent?.results?.layers || []).map((layer: any) => (
                                                      <div key={layer.id} className="space-y-3">
                                                         <div className="flex items-center gap-3">
                                                            <span className="px-2.5 py-1 rounded text-[9px] font-black text-white uppercase tracking-widest bg-slate-900">
                                                               Layer {["I", "II", "III", "IV", "V"][layer.id - 1]}: {layer.title}
                                                            </span>
                                                            <div className="h-px flex-1 bg-slate-200" />
                                                         </div>
                                                         <div className="bg-white border-l border-t border-slate-200 overflow-hidden shadow-sm">
                                                            <table className="w-full text-left border-collapse">
                                                               <thead>
                                                                  <tr className="bg-slate-50/80">
                                                                     <th className="px-5 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest w-24 border-r border-b border-slate-200 bg-slate-50/30">STATUS</th>
                                                                     <th className="px-5 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest border-r border-b border-slate-200 bg-slate-50/30">Defensive Audit Point</th>
                                                                     <th className="px-5 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest w-32 border-r border-b border-slate-200 bg-slate-50/30">Traceability</th>
                                                                  </tr>
                                                               </thead>
                                                               <tbody>
                                                                  {layer.items.map((item: any, idx: number) => {
                                                                     const isSelected = selectedRowId === item.id;
                                                                     return (
                                                                        <tr 
                                                                           key={item.id || idx} 
                                                                           onClick={() => handleSelectRow(item.id)}
                                                                           className={cn(
                                                                              "group transition-all cursor-pointer",
                                                                              isSelected ? "bg-slate-100/80" : "hover:bg-slate-50/50"
                                                                           )}
                                                                        >
                                                                           <td className="px-5 py-4 align-top border-r border-b border-slate-200">
                                                                              <div className="flex justify-center">
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
                                                                           </td>
                                                                           <td className="px-5 py-4 align-top border-r border-b border-slate-200">
                                                                              <p className={cn(
                                                                                 "text-[11px] font-bold leading-relaxed pr-8",
                                                                                 isSelected ? "text-slate-900" : "text-slate-700"
                                                                              )}>
                                                                                 {item.label}
                                                                              </p>
                                                                           </td>
                                                                           <td className="px-5 py-4 align-top border-r border-b border-slate-200 text-center">
                                                                              <Search className={cn("h-3.5 w-3.5 mx-auto", isSelected ? "text-slate-900" : "text-slate-300")} />
                                                                           </td>
                                                                        </tr>
                                                                     );
                                                                  })}
                                                               </tbody>
                                                            </table>
                                                         </div>
                                                      </div>
                                                   ))}
                                                </div>
                                             </div>
                                          </div>
                                       ) : selectedAgentId === 'prev' ? (
                                          <div className="flex flex-col h-full bg-slate-50/10 animate-in fade-in duration-500 overflow-hidden">
                                             <div className="h-12 flex items-center justify-between px-5 border-b border-slate-200 bg-white shrink-0">
                                                <div className="flex items-center gap-2">
                                                   <div className="h-2 w-2 rounded-full bg-[#8ba861]" />
                                                   <h2 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Prevention Action Plan Sheet</h2>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                   <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
                                                   <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Plan Finalized</span>
                                                </div>
                                             </div>
                                             <div className="flex-1 overflow-auto p-6 scrollbar-thin">
                                                <div className="max-w-[1600px] mx-auto space-y-10 pb-12">
                                                   {[
                                                      { id: 'root', title: 'Root Cause Actions', color: 'bg-red-500', data: selectedAgent?.results?.root_cause_actions },
                                                      { id: 'nc', title: 'Non Conformity Actions', color: 'bg-amber-500', data: selectedAgent?.results?.non_conformity_actions },
                                                      { id: 'imp', title: 'Improvement Actions', color: 'bg-emerald-500', data: selectedAgent?.results?.improvement_actions },
                                                   ].map((section) => (
                                                      <div key={section.id} className="space-y-3">
                                                         <div className="flex items-center gap-3">
                                                            <span className={cn("px-2.5 py-1 rounded text-[9px] font-black text-white uppercase tracking-widest", section.color)}>
                                                               {section.title}
                                                            </span>
                                                            <div className="h-px flex-1 bg-slate-200" />
                                                         </div>
                                                         <div className="bg-white border-l border-t border-slate-200 overflow-hidden shadow-sm">
                                                            <table className="w-full text-left border-collapse">
                                                               <thead>
                                                                  <tr className="bg-slate-50/80">
                                                                     <th className="px-5 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest w-12 border-r border-b border-slate-200 bg-slate-50/30">NO</th>
                                                                     <th className="px-5 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest w-24 border-r border-b border-slate-200 bg-slate-50/30">LAYER</th>
                                                                     <th className="px-5 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest w-32 border-r border-b border-slate-200 bg-slate-50/30">CONTROL</th>
                                                                     <th className="px-5 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest border-r border-b border-slate-200 bg-slate-50/30">Prevention Action</th>
                                                                     <th className="px-5 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest w-32 border-r border-b border-slate-200 bg-slate-50/30">PIC</th>
                                                                     <th className="px-5 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest w-24 border-r border-b border-slate-200 bg-slate-50/30">DUE DATE</th>
                                                                     <th className="px-5 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest w-24 border-b border-slate-200 bg-slate-50/30 text-center">STATUS</th>
                                                                  </tr>
                                                               </thead>
                                                               <tbody>
                                                                  {(section.data || []).map((item: any, idx: number) => {
                                                                     const isSelected = selectedRowId === item.id;
                                                                     return (
                                                                        <tr 
                                                                           key={item.id || idx} 
                                                                           onClick={() => handleSelectRow(item.id)}
                                                                           className={cn(
                                                                              "group transition-all cursor-pointer",
                                                                              isSelected ? "bg-slate-100/80" : "hover:bg-slate-50/50"
                                                                           )}
                                                                        >
                                                                           <td className="px-5 py-4 align-top border-r border-b border-slate-200 text-center text-[11px] font-mono font-black text-slate-400">
                                                                              {item.no}
                                                                           </td>
                                                                           <td className="px-5 py-4 align-top border-r border-b border-slate-200 text-center text-[10px] font-black text-slate-500 uppercase">
                                                                              {item.layer}
                                                                           </td>
                                                                           <td className="px-5 py-4 align-top border-r border-b border-slate-200 text-center text-[10px] font-black text-slate-900 uppercase tracking-tighter">
                                                                              {item.hierarchy}
                                                                           </td>
                                                                           <td className="px-5 py-4 align-top border-r border-b border-slate-200">
                                                                              <p className={cn(
                                                                                 "text-[11px] font-bold leading-relaxed pr-8 uppercase tracking-tight",
                                                                                 isSelected ? "text-slate-900" : "text-slate-700"
                                                                              )}>
                                                                                 {item.action}
                                                                              </p>
                                                                           </td>
                                                                           <td className="px-5 py-4 align-top border-r border-b border-slate-200 text-center text-[10px] font-bold text-slate-600">
                                                                              {item.pic}
                                                                           </td>
                                                                           <td className="px-5 py-4 align-top border-r border-b border-slate-200 text-center text-[10px] font-mono text-slate-500">
                                                                              {item.due_date}
                                                                           </td>
                                                                           <td className="p-0 border-b border-slate-200">
                                                                              <div className={cn(
                                                                                 "h-12 flex items-center justify-center text-[9px] font-black tracking-widest uppercase",
                                                                                 item.status === 'OPEN' ? "bg-red-50 text-red-600" :
                                                                                 item.status === 'PROGRESS' ? "bg-amber-50 text-amber-600" :
                                                                                 "bg-emerald-50 text-emerald-600"
                                                                              )}>
                                                                                 {item.status}
                                                                              </div>
                                                                           </td>
                                                                        </tr>
                                                                     );
                                                                  })}
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
                                       )}
                                    </div>
                                 )}
                              </div>
                           )}
                        </div>
                     </div>
                  ) : (
                     <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-300">
                        <Brain className="h-12 w-12 mb-4 opacity-20" />
                        <h2 className="text-3xl font-black uppercase tracking-[0.2em] text-slate-400">Orchestration Idle</h2>
                        <p className="text-[10px] mt-2 opacity-50 font-bold uppercase">Select a node to view intelligence results</p>
                     </div>
                  )}
               </div>

               {/* Right Sidebar: Fact Trace Panel */}
               <div className="w-[460px] border-l border-slate-200 bg-white flex flex-col shrink-0">
                  {selectedRowId ? (
                     (() => {
                        const agent = agents.find(a => a.id === selectedAgentId);
                        let item = agent?.results?.chronology_items?.find((i: any) => i.id === selectedRowId) || 
                                     agent?.results?.layers?.flatMap((l: any) => l.items).find((i: any) => i.id === selectedRowId) ||
                                     agent?.results?.root_cause_actions?.find((i: any) => i.id === selectedRowId) ||
                                     agent?.results?.non_conformity_actions?.find((i: any) => i.id === selectedRowId) ||
                                     agent?.results?.improvement_actions?.find((i: any) => i.id === selectedRowId);
                        
                        // Fallback for ID-less items (Actor attributes or PEEPO findings)
                        if (!item && selectedRowId) {
                           item = { 
                              id: selectedRowId, 
                              label: selectedRowId,
                              timestamp: "Forensic Synthesis",
                              status: "Verified",
                              description: `Automatic trace synthesis for finding: "${selectedRowId}". Linked to Case CS-2026-0147.`
                           };
                        }
                        
                        if (!item) return (
                           <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-300">
                              <Search className="h-12 w-12 mb-4 opacity-20" />
                              <h4 className="text-[10px] font-black uppercase tracking-[0.2em]">Finding Not Resolved</h4>
                              <p className="text-[8px] font-bold text-slate-400 uppercase mt-2">Select a row to view forensic evidence</p>
                           </div>
                        );

                        return (
                           <div className="flex flex-col h-full bg-white animate-in fade-in duration-300">
                              <div className="h-12 border-b border-slate-200 flex items-center justify-between px-5 bg-slate-50/50 shrink-0">
                                 <div className="flex items-center gap-2">
                                    <Brain className="h-4 w-4 text-primary" />
                                    <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Evidence Console</span>
                                 </div>
                                 <div className="flex items-center gap-2">
                                    <div className="flex bg-slate-200 p-0.5 rounded-sm">
                                       <button onClick={() => setActiveEvidenceConsoleMode('trace')} className={cn("px-2 py-1 text-[8px] font-black uppercase rounded-sm transition-all", activeEvidenceConsoleMode === 'trace' ? "bg-white shadow-sm text-slate-900" : "text-slate-400")}>Trace</button>
                                       <button onClick={() => setActiveEvidenceConsoleMode('diarization')} className={cn("px-2 py-1 text-[8px] font-black uppercase rounded-sm transition-all", activeEvidenceConsoleMode === 'diarization' ? "bg-white shadow-sm text-slate-900" : "text-slate-400")}>Diar</button>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => setSelectedRowId(null)} className="h-8 w-8 p-0 text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                                       <X className="h-4 w-4" />
                                    </Button>
                                 </div>
                              </div>

                              <div className="flex-1 flex flex-col overflow-hidden bg-white">
                                 <div className="px-5 py-4 border-b border-slate-100 space-y-1 bg-white shrink-0">
                                    <div className="space-y-1">
                                       <button 
                                          onClick={() => setExpandedFolders(prev => prev.includes('audio') ? prev.filter(f => f !== 'audio') : [...prev, 'audio'])}
                                          className="w-full flex items-center justify-between p-2 rounded-sm group transition-colors"
                                       >
                                          <div className="flex items-center gap-2">
                                             <Folders className="h-3.5 w-3.5 text-slate-400 group-hover:text-primary transition-colors" />
                                             <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-slate-900 transition-colors">Audio Evidence</span>
                                          </div>
                                          {expandedFolders.includes('audio') ? <ChevronDown className="h-3 w-3 text-slate-300" /> : <ChevronRight className="h-3 w-3 text-slate-300" />}
                                       </button>
                                       
                                       {expandedFolders.includes('audio') && (
                                          <div className="ml-4 pl-2 border-l border-slate-100 space-y-0.5">
                                             <button 
                                                onClick={() => setActiveEvidenceType('audio_diarization')}
                                                className={cn(
                                                   "w-full flex items-center gap-2 p-2 rounded-sm text-[9px] font-black uppercase tracking-widest transition-all text-left",
                                                   activeEvidenceType === 'audio_diarization' ? "bg-slate-900 text-white shadow-sm" : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                                                )}
                                             >
                                                <AudioIcon className={cn("h-3 w-3", activeEvidenceType === 'audio_diarization' ? "text-emerald-400" : "text-slate-300")} />
                                                Diarization Session
                                             </button>
                                             <button 
                                                onClick={() => setActiveEvidenceType('audio_analysis')}
                                                className={cn(
                                                   "w-full flex items-center gap-2 p-2 rounded-sm text-[9px] font-black uppercase tracking-widest transition-all text-left",
                                                   activeEvidenceType === 'audio_analysis' ? "bg-slate-900 text-white shadow-sm" : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                                                )}
                                             >
                                                <Activity className={cn("h-3 w-3", activeEvidenceType === 'audio_analysis' ? "text-blue-400" : "text-slate-300")} />
                                                Protocol Analysis
                                             </button>
                                          </div>
                                       )}
                                    </div>

                                    <div className="space-y-1">
                                       <button 
                                          onClick={() => setExpandedFolders(prev => prev.includes('document') ? prev.filter(f => f !== 'document') : [...prev, 'document'])}
                                          className="w-full flex items-center justify-between p-2 rounded-sm group transition-colors"
                                       >
                                          <div className="flex items-center gap-2">
                                             <Folders className="h-3.5 w-3.5 text-slate-400 group-hover:text-primary transition-colors" />
                                             <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-slate-900 transition-colors">Document Trace</span>
                                          </div>
                                          {expandedFolders.includes('document') ? <ChevronDown className="h-3 w-3 text-slate-300" /> : <ChevronRight className="h-3 w-3 text-slate-300" />}
                                       </button>
                                       
                                       {expandedFolders.includes('document') && (
                                          <div className="ml-4 pl-2 border-l border-slate-100 space-y-0.5">
                                             <button 
                                                onClick={() => setActiveEvidenceType('doc_citation')}
                                                className={cn(
                                                   "w-full flex items-center gap-2 p-2 rounded-sm text-[9px] font-black uppercase tracking-widest transition-all text-left",
                                                   activeEvidenceType === 'doc_citation' ? "bg-slate-900 text-white shadow-sm" : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                                                )}
                                             >
                                                <Quote className={cn("h-3 w-3", activeEvidenceType === 'doc_citation' ? "text-amber-400" : "text-slate-300")} />
                                                Forensic Citations
                                             </button>
                                          </div>
                                       )}
                                    </div>
                                 </div>

                                 <div className="flex-1 overflow-y-auto custom-scrollbar p-6 pb-20 bg-slate-50/20">
                                    {activeEvidenceType === 'audio_diarization' && (
                                       <div className="space-y-4">
                                          {audioEvidence.diarization.map((seg, idx) => (
                                             <div key={idx} className="border-l-2 border-slate-900 pl-4 py-1 group bg-white p-3 rounded-sm border-r border-t border-b border-slate-100 shadow-sm mb-4">
                                                <div className="flex items-center justify-between mb-2">
                                                   <div className="flex items-center gap-3">
                                                      <span className="text-[10px] font-mono font-black text-slate-400">{seg.startTime} — {seg.endTime}</span>
                                                      <span className="px-2 py-0.5 bg-slate-900 text-white text-[8px] font-black uppercase rounded-sm">{seg.speaker}</span>
                                                   </div>
                                                </div>
                                                <p className="text-xs font-medium leading-relaxed text-slate-700 italic">"{seg.text}"</p>
                                             </div>
                                          ))}
                                       </div>
                                    )}

                                    {activeEvidenceType === 'doc_citation' && (
                                       <div className="space-y-4">
                                          <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-sm">
                                             <p className="text-[10px] font-bold text-amber-800 uppercase tracking-tight mb-2">Technical Discrepancy Note</p>
                                             <p className="text-[11px] text-amber-700 leading-relaxed italic">"Pressure readings in Report #402 (p. 12) do not align with telemetry timestamps. Discrepancy: +150ms delay in sensor logging."</p>
                                          </div>
                                       </div>
                                    )}
                                 </div>
                              </div>
                           </div>
                        );
                     })()
                  ) : (
                     <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-300">
                        <Search className="h-12 w-12 mb-4 opacity-20" />
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em]">Console Standby</h4>
                        <p className="text-[10px] mt-2 opacity-50 font-bold uppercase">Select an event to review evidence</p>
                     </div>
                  )}
               </div>
            </div>
         </div>

         {preRunAgentId && (
            <PreRunModal 
               agent={agents.find(a => a.id === preRunAgentId)!}
               onClose={() => setPreRunAgentId(null)}
               onRun={(rerun) => runSingleAgent(preRunAgentId, rerun)}
            />
         )}

         {historyAgentId && (
            <AgentHistoryPanel 
               agent={agents.find(a => a.id === historyAgentId)!}
               onClose={() => setHistoryAgentId(null)}
            />
         )}
      </div>
   );
}
"""

final_content = content[:start_return] + [new_jsx] + content[end_comp:]

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(final_content)
