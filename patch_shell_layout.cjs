const fs = require('fs');

const file = 'src/components/workspace/Tabs/AnalysisTab.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Header Updates (Remove badge background, simple dot, simpler text)
const oldHeader = `<div className="px-10 py-6 border-b border-slate-200 shrink-0 bg-white z-10 shadow-sm relative">
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
                                 </div>`;

const newHeader = `<div className="px-10 py-6 border-b border-slate-200 shrink-0 bg-white z-10 shadow-sm relative">
                                    <div className="flex items-center justify-between mb-1">
                                       <div className="flex flex-col">
                                          <h2 className="text-[20px] font-bold text-slate-900 uppercase tracking-wide">
                                             {selectedAgent.name}
                                          </h2>
                                          <p className="text-[13px] text-slate-500">
                                             {selectedAgent.id === 'fact' ? 'Menyusun urutan kejadian berdasarkan evidence.' : (AgentDisplayMeta[selectedAgent.id]?.subtitle || selectedAgent.purpose)}
                                          </p>
                                       </div>
                                       <div className="flex items-center gap-8">
                                          <div className="flex flex-col text-right">
                                             <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">EVIDENCE</span>
                                             <span className="text-[12px] font-semibold text-slate-700">{selectedAgent.knowledgeSelection?.length || 0} digunakan</span>
                                          </div>
                                          <div className="flex flex-col text-right">
                                             <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">DURASI</span>
                                             <span className="text-[12px] font-semibold text-slate-700 font-tabular-nums">{formatTime(elapsedTimeMs)}</span>
                                          </div>
                                          <div className="flex flex-col text-right">
                                             <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">STATUS</span>
                                             <div className="flex items-center justify-end gap-1.5 mt-0.5">
                                                <span className="h-1.5 w-1.5 rounded-full bg-blue-600 motion-safe:animate-badge-dot" />
                                                <span className="text-[11px] font-bold text-blue-700 uppercase tracking-widest">BERJALAN</span>
                                             </div>
                                          </div>
                                       </div>
                                    </div>
                                 </div>`;
content = content.replace(oldHeader, newHeader);

// 2. Change width of Split Pane
content = content.replace(
  '<div className="w-[60%] border-r border-slate-200 bg-slate-50/50 p-8 overflow-hidden relative z-0">',
  '<div className="w-[65%] border-r border-slate-200 bg-slate-50/50 p-8 overflow-hidden relative z-0">'
);
content = content.replace(
  '<div className="w-[40%] p-8 overflow-auto bg-white custom-scrollbar">',
  '<div className="w-[35%] p-8 overflow-auto bg-white custom-scrollbar">'
);

// 3. Change "Internal Processing" to "TAHAP PENYUSUNAN"
content = content.replace(
  '<h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-6">Internal Processing</h3>',
  '<h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-6">Tahap Penyusunan</h3>'
);

// 4. Remove Footer
const footerStart = content.indexOf('{/* Footer: Live Activity Log */}');
const footerEndStr = `                                 </div>
                              </div>
                           ) : !selectedAgent?.results ? (`;
const footerEnd = content.indexOf(footerEndStr);

if (footerStart !== -1 && footerEnd !== -1) {
  content = content.substring(0, footerStart) + `                              </div>
                           ) : !selectedAgent?.results ? (` + content.substring(footerEnd + footerEndStr.length);
  console.log('Footer removed successfully.');
} else {
  console.log('Could not find footer boundaries.');
}

fs.writeFileSync(file, content);
