const fs = require('fs');
const path = './src/pages/CampaignWorkspacePage.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add State
content = content.replace(
  /const \[selectedAnalysis, setSelectedAnalysis\] = useState<string \| null>\(null\);/,
  "const [selectedAnalysis, setSelectedAnalysis] = useState<string | null>(null);\n  const [showDataInputModal, setShowDataInputModal] = useState(false);"
);

// 2. Remove the existing Data Input button (which I added to the top of Metadata)
const oldDataInputBtnRegex = /<button \n\s*onClick=\{\(\) => \{\n\s*setSelectedAnalysis\('input'\);\n\s*setIsRightPanelExpanded\(true\);\n\s*\}\}\n\s*className="w-full text-left bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-md p-3 flex items-center justify-between group transition-all shadow-none mb-2"\n\s*>\n\s*<div className="flex items-center gap-2">\n\s*<Database className="h-4 w-4 text-slate-400 group-hover:text-slate-600" \/>\n\s*<span className="text-xs font-bold text-slate-700">Data Input<\/span>\n\s*<\/div>\n\s*<ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition-colors" \/>\n\s*<\/button>/;
content = content.replace(oldDataInputBtnRegex, '');

// 3. Add the Data Input button at the end of Metadata (after Waktu Pelaporan)
const metadataEndRegex = /<span className="text-xs font-medium text-slate-800">31 Agu 2026, 16:00 WITA<\/span>\n\s*<\/div>\n\s*<\/div>\n\s*\)}/;
content = content.replace(metadataEndRegex, `<span className="text-xs font-medium text-slate-800">31 Agu 2026, 16:00 WITA</span>
                  </div>
                  
                  <button 
                    onClick={() => setShowDataInputModal(true)}
                    className="w-full text-left bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-md p-3 flex items-center justify-between group transition-all shadow-none mt-2"
                  >
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-slate-400 group-hover:text-slate-600" />
                      <span className="text-xs font-bold text-slate-700">Data Input</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                  </button>
                </div>
              )}`);

// 4. Delete the entire Right Panel for Data Input (selectedAnalysis === 'input')
const rightPanelRegex = /\{\/\* Right Panel \(Sidebar\) \*\/\}\n\s*\{selectedAnalysis === 'input' && \([\s\S]*?\}\)\n\s*<\/div>\n\s*\)\}\n\s*\{\/\* Right Panel for Activity Log \*\/\}/;
content = content.replace(rightPanelRegex, `{/* Right Panel for Activity Log */}`);

// 5. Add the floating Modal right before </AppLayout>
const modalCode = `
      {/* Floating Data Input Modal */}
      {showDataInputModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded bg-slate-800 flex items-center justify-center">
                   <Database className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="text-[14px] font-black text-slate-900 uppercase tracking-wider leading-none mb-1">Data Input</h3>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest">Metadata Campaign</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowDataInputModal(false)} className="h-8 w-8 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md">
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar bg-slate-50/30">
              {dataAnalisis.map((item, index) => (
                <div key={item.id} className="bg-white border border-slate-200 rounded-md p-5 shadow-sm">
                   <h4 className="text-[13px] font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                     <span className="bg-slate-100 text-slate-500 h-5 w-5 rounded flex items-center justify-center text-[10px]">{index + 1}</span>
                     {item.name}
                   </h4>
                   
                   <div className="pl-2 border-l-2 border-slate-100">
                     <div className="text-[12.5px] text-slate-700 leading-[1.8] whitespace-pre-wrap">
                       {item.content}
                     </div>
                   </div>
                </div>
              ))}
            </div>
            
            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-200 bg-white flex justify-end">
              <Button onClick={() => setShowDataInputModal(false)} className="bg-slate-800 hover:bg-slate-900 text-white shadow-none text-xs h-8 px-4 rounded-sm">
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
`;
content = content.replace(/<\/AppLayout>/, modalCode);

fs.writeFileSync(path, content);
console.log("Done");
