const fs = require('fs');

const file = 'src/components/workspace/Tabs/AnalysisTab.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetContent = fs.readFileSync('patch_target.txt', 'utf8');

// Add import
if (!content.includes('AgentLoadingVisuals')) {
  content = content.replace(
    'import {',
    "import { AgentLoadingVisuals } from './AnalysisLoadingVisuals';\nimport {"
  );
}

const newShell = `                           {selectedAgent?.status === 'running' ? (
                              <div className="flex-1 flex flex-col bg-white relative h-full">
                                 {/* Stable Shell Header */}
                                 <div className="px-10 py-6 border-b border-slate-200 shrink-0 bg-white z-10 shadow-sm relative">
                                    <div className="flex items-center justify-between mb-1">
                                       <h2 className="text-[20px] font-bold text-slate-900 uppercase tracking-wide">
                                          {selectedAgent.name}
                                       </h2>
                                       <div className="flex items-center gap-6">
                                          <div className="flex flex-col text-right">
                                             <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">EVIDENCE</span>
                                             <span className="text-[12px] font-semibold text-slate-700">{selectedAgent.knowledgeSelection?.length || 0} digunakan</span>
                                          </div>
                                          <div className="flex flex-col text-right">
                                             <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">STATUS</span>
                                             <span className="text-[12px] font-semibold text-slate-700 font-tabular-nums">Berjalan {formatTime(elapsedTimeMs)}</span>
                                          </div>
                                          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full shrink-0">
                                             <span className="h-1.5 w-1.5 rounded-full bg-blue-600 motion-safe:animate-badge-dot" />
                                             <span className="text-[10px] font-bold text-blue-700 uppercase tracking-widest">BERJALAN</span>
                                          </div>
                                       </div>
                                    </div>
                                    <p className="text-[13px] text-slate-500">{AgentDisplayMeta[selectedAgent.id]?.subtitle || selectedAgent.purpose}</p>
                                 </div>
                                 
                                 {/* Split Pane: Output Visual & Internal Stepper */}
                                 <div className="flex-1 flex min-h-0 relative">
                                    {/* Left: Processing Output Visual */}
                                    <div className="w-[60%] border-r border-slate-200 bg-slate-50/50 p-8 overflow-hidden relative z-0">
                                       <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-100/50 to-transparent pointer-events-none" />
                                       <div className="relative h-full z-10">
                                          <AgentLoadingVisuals agentId={selectedAgent.id} elapsedTimeMs={elapsedTimeMs} />
                                       </div>
                                    </div>
                                    
                                    {/* Right: Detailed Internal Stepper */}
                                    <div className="w-[40%] p-8 overflow-auto bg-white custom-scrollbar">
                                       <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-6">Internal Processing</h3>
                                       <div className="relative space-y-0">
                                          {(() => {
                                             const steps = AGENT_PROCESS_STEPS[selectedAgent.id] || [];
                                             const currentStepIndex = Math.min(Math.floor(elapsedTimeMs / 3000), steps.length - 1);
                                             
                                             return steps.map((step, idx) => {
                                                const isActive = idx === currentStepIndex;
                                                const isCompleted = idx < currentStepIndex;
                                                const isWaiting = idx > currentStepIndex;
                                                const isLast = idx === steps.length - 1;
                                                
                                                return (
                                                   <div key={step.id} className="relative flex items-start group">
                                                      {!isLast && (
                                                         <div className={\`absolute top-6 left-[11px] w-[2px] h-[calc(100%-8px)] transition-colors duration-200 overflow-hidden \${isCompleted ? 'bg-emerald-500' : 'bg-slate-200'}\`}>
                                                            {isActive && (
                                                               <div className="absolute top-0 left-0 w-full h-[24px] bg-blue-500 motion-safe:animate-stepper-connector" />
                                                            )}
                                                         </div>
                                                      )}
                                                      <div className="relative z-10 mr-4 mt-0.5 flex flex-col items-center">
                                                         {isCompleted ? (
                                                            <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 border border-emerald-200 shrink-0 shadow-sm transition-all duration-300 animate-in zoom-in">
                                                               <CheckCircle2 className="h-3.5 w-3.5" />
                                                            </div>
                                                         ) : isActive ? (
                                                            <div className="h-6 w-6 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-200 shrink-0 shadow-sm relative transition-all duration-300">
                                                               <div className="absolute inset-[-1px] rounded-full border-[1.5px] border-blue-200 border-t-blue-500 motion-safe:animate-stepper-spin" />
                                                               <Activity className="h-3 w-3" />
                                                            </div>
                                                         ) : (
                                                            <div className="h-6 w-6 rounded-full bg-white flex items-center justify-center text-slate-300 border border-slate-200 shrink-0 transition-all duration-300">
                                                               <div className="h-2 w-2 rounded-full bg-slate-200" />
                                                            </div>
                                                         )}
                                                      </div>
                                                      <div className={\`flex flex-col pb-8 transition-opacity duration-300 \${isWaiting ? 'opacity-50' : 'opacity-100'}\`}>
                                                         <div className="flex items-center gap-2">
                                                            <span className="text-[12px] font-mono text-slate-400">0{idx + 1}</span>
                                                            <span className={\`text-[13px] font-medium \${isActive ? 'text-blue-700' : isCompleted ? 'text-slate-800' : 'text-slate-500'}\`}>
                                                               {step.label}
                                                            </span>
                                                         </div>
                                                         {isActive && (
                                                            <div className="mt-2 motion-safe:animate-fade-in-up-short">
                                                               <p className="text-[11px] text-slate-500 mb-2 transition-all duration-200">
                                                                  {selectedAgent.microStatus || "Memproses..."}
                                                               </p>
                                                               <div className="w-48 h-1 bg-slate-100 rounded-full overflow-hidden relative">
                                                                  <div className="absolute top-0 bottom-0 left-0 w-1/3 bg-blue-500 rounded-full motion-safe:animate-progress-track" />
                                                               </div>
                                                            </div>
                                                         )}
                                                      </div>
                                                   </div>
                                                );
                                             });
                                          })()}
                                       </div>
                                    </div>
                                 </div>
                                 
                                 {/* Footer: Live Activity Log */}
                                 <div className="h-40 shrink-0 bg-[#0f172a] border-t border-slate-800 text-slate-400 p-6 overflow-auto custom-scrollbar font-mono text-[11px] relative z-20 shadow-[0_-4px_24px_rgba(0,0,0,0.15)]">
                                    <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-2">
                                       <span className="font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                                          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                                          Live Execution Log
                                       </span>
                                       <span className="text-slate-600">ID: {selectedAgent.id.toUpperCase()}_{Math.floor(Date.now()/10000)}</span>
                                    </div>
                                    <div className="space-y-1.5 flex flex-col-reverse">
                                       {(() => {
                                          const steps = AGENT_PROCESS_STEPS[selectedAgent.id] || [];
                                          const logs = [];
                                          const currentStep = Math.min(Math.floor(elapsedTimeMs / 3000), steps.length - 1);
                                          
                                          // Add log for each completed/running step deterministically
                                          for (let i = 0; i <= currentStep; i++) {
                                             logs.unshift(
                                                <div key={i} className={\`flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300 \${i === currentStep ? 'text-emerald-400 font-medium' : 'opacity-60'}\`}>
                                                   <span className="shrink-0 text-slate-500 font-tabular-nums">[{formatTime(i * 3000 + 1000)}]</span>
                                                   <span>{steps[i]?.label} {i === currentStep ? '...' : 'selesai'}</span>
                                                </div>
                                             );
                                             if (i < currentStep) {
                                                logs.unshift(
                                                   <div key={\`\${i}-ok\`} className="flex gap-3 opacity-60 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                                      <span className="shrink-0 text-slate-500 font-tabular-nums">[{formatTime(i * 3000 + 2500)}]</span>
                                                      <span className="text-blue-300">✓ Validation passed</span>
                                                   </div>
                                                );
                                             }
                                          }
                                          return logs;
                                       })()}
                                    </div>
                                 </div>
                              </div>
                           ) : !selectedAgent?.results ? (`;

if (content.includes(targetContent)) {
  content = content.replace(targetContent, newShell);
  fs.writeFileSync(file, content);
  console.log("Successfully replaced shell in AnalysisTab.tsx");
} else {
  console.log("Target content exactly not found in AnalysisTab.tsx. Using substring match.");
  const startIndex = content.indexOf(`{selectedAgent?.status === 'running' ? (`);
  const endIndex = content.indexOf(`                           ) : !selectedAgent?.results ? (`);
  if (startIndex !== -1 && endIndex !== -1) {
    content = content.substring(0, startIndex) + newShell + content.substring(endIndex);
    fs.writeFileSync(file, content);
    console.log("Successfully replaced shell via substring index.");
  } else {
    console.log("Failed completely.");
  }
}
