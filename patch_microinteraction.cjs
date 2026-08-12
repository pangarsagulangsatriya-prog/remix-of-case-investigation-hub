const fs = require('fs');

// 1. UPDATE CSS
const cssPath = 'src/index.css';
let cssContent = fs.readFileSync(cssPath, 'utf8');

const newAnimations = `
@media (prefers-reduced-motion: no-preference) {
  .animate-badge-dot {
    animation: badgeDot 1.4s infinite;
  }
  @keyframes badgeDot {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.45; transform: scale(0.9); }
  }

  .animate-slow-spin {
    animation: spin 1.6s linear infinite;
  }
  
  .animate-stepper-spin {
    animation: spin 1.5s linear infinite;
  }

  .animate-connector-travel {
    animation: connectorTravel 1.8s linear infinite;
  }
  @keyframes connectorTravel {
    0% { transform: translateY(0); opacity: 0; }
    10% { opacity: 1; }
    90% { opacity: 1; }
    100% { transform: translateY(32px); opacity: 0; }
  }

  .animate-stepper-connector {
    animation: stepperConnector 1.6s linear infinite;
  }
  @keyframes stepperConnector {
    0% { transform: translateY(-100%); opacity: 0; }
    20% { opacity: 1; }
    80% { opacity: 1; }
    100% { transform: translateY(200%); opacity: 0; }
  }

  .animate-progress-track {
    animation: progressTrack 1.6s linear infinite;
  }
  @keyframes progressTrack {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(300%); }
  }

  .animate-border-travel {
    animation: borderTravel 2.2s linear infinite;
  }
  @keyframes borderTravel {
    0%, 100% { opacity: 0; }
    10%, 90% { opacity: 1; }
    0% { top: 0; height: 0; }
    50% { top: 0; height: 100%; }
    100% { top: 100%; height: 0; }
  }
}
`;

if (!cssContent.includes('.animate-badge-dot')) {
  cssContent += newAnimations;
  fs.writeFileSync(cssPath, cssContent);
}

// 2. UPDATE TSX
const file = 'src/components/workspace/Tabs/AnalysisTab.tsx';
let content = fs.readFileSync(file, 'utf8');

// --- A. Left Orchestration Rail ---

// Card Border (Active Border Traveling Line)
const cardBorderOld = `                              {/* Background Scanner Effect for Running State */}
                              {isRunning && (
                                 <div className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-indigo-500/10 to-transparent -translate-x-full" style={{ animation: 'shimmer 2s infinite linear' }}>
                                    <style>{\`
                                       @keyframes shimmer {
                                          100% { transform: translateX(100%); }
                                       }
                                    \`}</style>
                                 </div>
                              )}`;
const cardBorderNew = `                              {/* Active Status Border Highlight */}
                              {isRunning && (
                                 <div className="absolute left-0 top-0 bottom-0 w-[2px] overflow-hidden rounded-l-sm">
                                    <div className="absolute left-0 w-full bg-indigo-500 h-1/4 motion-safe:animate-[slideDown_2s_linear_infinite]" />
                                 </div>
                              )}`;
content = content.replace(cardBorderOld, cardBorderNew);

// Active Node Icon
const nodeIconOld = `                                       {isRunning ? (
                                             <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                          ) : isCompleted ? (
                                             <CheckCircle2 className="h-4 w-4" />`;
const nodeIconNew = `                                       {isRunning ? (
                                             <div className="relative flex items-center justify-center">
                                                <div className="absolute inset-[-4px] rounded-full border border-indigo-500/40 border-t-indigo-500 motion-safe:animate-slow-spin transition-opacity duration-200" />
                                                <Activity className="h-3.5 w-3.5 text-indigo-600" />
                                             </div>
                                          ) : isCompleted ? (
                                             <CheckCircle2 className="h-4 w-4 animate-in zoom-in duration-200" />`;
content = content.replace(nodeIconOld, nodeIconNew);

// Orchestration Connector
const connectorOld = `                           {/* Connector Line to Next Node */}
                           <div className="flex justify-center items-center h-8 relative">
                              <div className={\`h-full transition-colors relative overflow-hidden \${
                                 isCompleted ? 'w-[2px] bg-emerald-400' : 'w-px border-l border-dashed border-slate-300'
                              }\`}>
                                 {isNextRunning && (
                                    <div className="absolute top-0 w-full h-1/2 bg-gradient-to-b from-transparent to-blue-500 animate-pulse" />
                                 )}
                              </div>`;
const connectorNew = `                           {/* Connector Line to Next Node */}
                           <div className="flex justify-center items-center h-8 relative">
                              <div className={\`h-full transition-colors duration-200 relative overflow-hidden \${
                                 isCompleted ? 'w-[2px] bg-emerald-500' : 'w-[2px] bg-slate-200'
                              }\`}>
                                 {isNextRunning && (
                                    <div className="absolute top-[-24px] left-0 w-full h-[24px] bg-indigo-500 motion-safe:animate-connector-travel" />
                                 )}
                              </div>`;
content = content.replace(connectorOld, connectorNew);

// --- B. Main Execution Loader Area ---

// Active Badge (BERJALAN)
const badgeOld = `<div className="flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full shrink-0">
                                             <Activity className="h-3.5 w-3.5 text-blue-600 animate-pulse" />
                                             <span className="text-[10px] font-bold text-blue-700 uppercase tracking-widest">BERJALAN</span>
                                          </div>`;
const badgeNew = `<div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 border border-blue-200 rounded-full shrink-0 transition-opacity duration-200">
                                             <span className="h-1.5 w-1.5 rounded-full bg-blue-600 motion-safe:animate-badge-dot" />
                                             <span className="text-[10px] font-bold text-blue-700 uppercase tracking-widest">BERJALAN</span>
                                          </div>`;
content = content.replace(badgeOld, badgeNew);

// Stepper Connector
const stepperConnOld = `<div className={\`absolute top-6 left-[11px] w-[2px] h-[calc(100%-8px)] transition-colors duration-300 overflow-hidden \${isCompleted ? 'bg-emerald-500' : 'bg-slate-200'}\`}>
                                                               {/* Animated highlight for active connector */}
                                                               {isActive && (
                                                                  <div className="absolute top-0 left-0 w-full h-1/2 bg-blue-500/50 animate-[slideDown_1.5s_ease-in-out_infinite]" />
                                                               )}
                                                            </div>`;
const stepperConnNew = `<div className={\`absolute top-6 left-[11px] w-[2px] h-[calc(100%-8px)] transition-colors duration-200 overflow-hidden \${isCompleted ? 'bg-emerald-500' : 'bg-slate-200'}\`}>
                                                               {/* Animated highlight for active connector */}
                                                               {isActive && (
                                                                  <div className="absolute top-0 left-0 w-full h-[24px] bg-blue-500 motion-safe:animate-stepper-connector" />
                                                               )}
                                                            </div>`;
content = content.replace(stepperConnOld, stepperConnNew);

// Stepper Icon Container
const stepperIconOld = `                                                            {isCompleted ? (
                                                               <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 border border-emerald-200 shrink-0 shadow-sm transition-all duration-300">
                                                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                                               </div>
                                                            ) : isActive ? (
                                                               <div className="h-6 w-6 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-200 shrink-0 shadow-sm relative transition-all duration-300">
                                                                  <Loader2 className="h-3.5 w-3.5 animate-[spin_1.5s_linear_infinite]" />
                                                                  <div className="absolute inset-0 rounded-full border border-blue-400 animate-ping opacity-20" />
                                                               </div>
                                                            ) : (`;
const stepperIconNew = `                                                            {isCompleted ? (
                                                               <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 border border-emerald-200 shrink-0 shadow-sm transition-all duration-300 animate-in zoom-in duration-300">
                                                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                                               </div>
                                                            ) : isActive ? (
                                                               <div className="h-6 w-6 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-200 shrink-0 shadow-sm relative transition-all duration-300">
                                                                  <div className="absolute inset-[-1px] rounded-full border-[1.5px] border-blue-200 border-t-blue-500 motion-safe:animate-stepper-spin" />
                                                                  <Activity className="h-3 w-3" />
                                                               </div>
                                                            ) : (`;
content = content.replace(stepperIconOld, stepperIconNew);

// Progress track
const trackOld = `<div className="w-48 h-1 bg-slate-100 rounded-full overflow-hidden relative">
                                                                     <div className="absolute top-0 bottom-0 left-0 w-1/3 bg-blue-400/80 rounded-full animate-[shimmer_1.8s_infinite_linear] shadow-[0_0_8px_rgba(96,165,250,0.5)]" />
                                                                  </div>`;
const trackNew = `<div className="w-48 h-1 bg-slate-100 rounded-full overflow-hidden relative">
                                                                     <div className="absolute top-0 bottom-0 left-0 w-1/3 bg-blue-500 rounded-full motion-safe:animate-progress-track" />
                                                                  </div>`;
content = content.replace(trackOld, trackNew);

// Activity feed timestamp font
const feedOld = `<span className="text-slate-400 shrink-0">{evt.time}</span>`;
const feedNew = `<span className="text-slate-400 shrink-0 font-tabular-nums">{evt.time}</span>`;
content = content.replace(feedOld, feedNew);

// Activity feed transition
const feedParentOld = `                                                return feed.slice(0, 5).map((evt, idx) => (
                                                   <div key={idx} className="flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
                                                      <span className="text-slate-400 shrink-0">{evt.time}</span>`;
const feedParentNew = `                                                return feed.slice(0, 5).map((evt, idx) => (
                                                   <div key={idx} className="flex items-start gap-3 motion-safe:animate-fade-in-up">
                                                      <span className="text-slate-400 shrink-0 font-tabular-nums">{evt.time}</span>`;
content = content.replace(feedParentOld, feedParentNew);

// Elapsed time
const elapsedOld = `<span className="text-[13px] font-semibold text-slate-700">Berjalan {formatTime(elapsedTimeMs)}</span>`;
const elapsedNew = `<span className="text-[13px] font-semibold text-slate-700 font-tabular-nums">Berjalan {formatTime(elapsedTimeMs)}</span>`;
content = content.replace(elapsedOld, elapsedNew);

// Microstatus transition (opacity / transform)
const statusOld = `                                                            {/* Active Status Context & Animation */}
                                                            {isActive && (
                                                               <div className="mt-2 animate-in fade-in slide-in-from-top-1 duration-300">
                                                                  <p className="text-[12px] text-slate-500 mb-2">
                                                                     {selectedAgent.microStatus || "Memproses..."}`;
const statusNew = `                                                            {/* Active Status Context & Animation */}
                                                            {isActive && (
                                                               <div className="mt-2 motion-safe:animate-fade-in-up-short">
                                                                  <p className="text-[12px] text-slate-500 mb-2 transition-all duration-200">
                                                                     {selectedAgent.microStatus || "Memproses..."}`;
content = content.replace(statusOld, statusNew);

// Header transition context (Memproses ulang... -> add activity cues)
const reprocessOld = `<span className="text-[16px] font-semibold text-slate-800">
                                             {(selectedAgent.runCount || 0) > 1 ? "Memproses ulang hasil analisis" : "Memulai proses analisis baru"}
                                          </span>`;
const reprocessNew = `<div className="flex items-center gap-2">
                                             <span className="text-[16px] font-semibold text-slate-800 transition-colors duration-200">
                                                {(selectedAgent.runCount || 0) > 1 ? "Memproses ulang hasil analisis" : "Memulai proses analisis baru"}
                                             </span>
                                             {((selectedAgent.runCount || 0) > 1) && (
                                                <div className="flex items-end gap-[2px] h-3 ml-2 opacity-60">
                                                   <div className="w-[3px] h-1.5 bg-slate-400 animate-[bounce_1.4s_infinite_0ms]" />
                                                   <div className="w-[3px] h-2.5 bg-slate-400 animate-[bounce_1.4s_infinite_150ms]" />
                                                   <div className="w-[3px] h-1.5 bg-slate-400 animate-[bounce_1.4s_infinite_300ms]" />
                                                </div>
                                             )}
                                          </div>`;
content = content.replace(reprocessOld, reprocessNew);


fs.writeFileSync(file, content);
console.log('Successfully patched microinteractions!');
