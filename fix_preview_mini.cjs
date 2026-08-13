const fs = require('fs');
let code = fs.readFileSync('src/components/workspace/Tabs/ReportsTab.tsx', 'utf-8');

const coverBlock = `              {/* Cover Layout */}
              <div className="border-b-2 border-slate-900 pb-4 mb-4">
                <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">LAPORAN INVESTIGASI</div>
                <div className="text-[12px] font-black text-slate-900 uppercase leading-snug">Security and Stability Incident</div>
                <div className="text-[8px] text-slate-500 mt-2">Case ID: 771CAA3D &middot; 27 April 2026</div>
              </div>`;

code = code.replace(coverBlock, '');

code = code.replace(/<span className="text-\[9px\] font-mono text-slate-400">01<\/span>/, '<span className="text-[9px] font-mono text-slate-400">P1</span>');
code = code.replace(/<span className="text-\[9px\] font-mono text-slate-400">02<\/span>/, '<span className="text-[9px] font-mono text-slate-400">P2</span>');
code = code.replace(/<span className="text-\[9px\] font-mono text-slate-400">03<\/span>/, '<span className="text-[9px] font-mono text-slate-400">P3</span>');
code = code.replace(/<span className="text-\[9px\] font-mono text-slate-400">04<\/span>/, '<span className="text-[9px] font-mono text-slate-400">P4</span>');
code = code.replace(/<span className="text-\[9px\] font-mono text-slate-400">05<\/span>/, '<span className="text-[9px] font-mono text-slate-400">P5</span>');

fs.writeFileSync('src/components/workspace/Tabs/ReportsTab.tsx', code);
