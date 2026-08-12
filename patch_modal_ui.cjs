const fs = require('fs');
const file = 'src/components/workspace/EvidenceReadinessModal.tsx';
let content = fs.readFileSync(file, 'utf8');

const oldModalRegex = /\{\/\* Override Modal \*\/\}.*?showOverrideModal \?\? false\);\s*\}\}\s*>\s*Tetap Lanjutkan\s*<\/Button>\s*<\/div>\s*<\/div>\s*<\/div>\s*\)}/s;

// We will use standard string replacement targeting the known block
const startStr = `{/* Override Modal */}`;
const endStr = `Tetap Lanjutkan
              </Button>
            </div>
          </div>
        </div>
      )}`;

const startIndex = content.indexOf(startStr);
const endIndex = content.indexOf(endStr) + endStr.length;

if (startIndex !== -1 && endIndex !== -1) {
  const newModal = `{/* Override Modal */}
      {showOverrideModal && latestRun && (
        <div className="fixed inset-0 z-[110] flex justify-end bg-slate-900/60 backdrop-blur-[2px] transition-all">
          <div className="bg-white shadow-2xl w-full max-w-[55%] min-w-[600px] h-full flex flex-col animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="px-10 pt-10 pb-6 flex flex-col">
              <h2 className="text-[16px] font-bold text-slate-900 uppercase tracking-widest">KONFIRMASI ANALYSIS</h2>
              <p className="text-[13px] text-slate-500 mt-1">Evidence Golden Gate</p>
            </div>
            
            <div className="flex-1 overflow-auto px-10 pb-10 custom-scrollbar">
              {/* Red Warning Box */}
              <div className="bg-rose-50/70 rounded-lg p-5 mb-10">
                 {latestRun.results.filter(r => r.level === "REQUIRED" && r.status === "MISSING").length > 0 && (
                   <div className="text-[13px] font-bold text-rose-600">
                     {latestRun.results.filter(r => r.level === "REQUIRED" && r.status === "MISSING").length} requirement wajib belum terpenuhi
                   </div>
                 )}
                 {latestRun.results.filter(r => r.level === "REQUIRED" && r.status === "BROKEN").length > 0 && (
                   <div className="text-[13px] font-bold text-rose-600 mt-1">
                     {latestRun.results.filter(r => r.level === "REQUIRED" && r.status === "BROKEN").length} requirement wajib bermasalah
                   </div>
                 )}
              </div>

              {/* Detail Blocker */}
              <h3 className="text-[11px] font-bold text-slate-600 uppercase tracking-widest mb-5">DETAIL BLOCKER</h3>
              <ul className="list-disc pl-5 space-y-3.5 mb-12 text-[13px] marker:text-slate-400">
                {latestRun.results.filter(r => r.level === "REQUIRED" && r.status !== "FULFILLED").map(req => (
                  <li key={req.id} className="text-slate-600 pl-1">
                    <span className="font-bold text-slate-900">{req.label}</span> — <span className="text-slate-500">{req.issue || (req.status === "MISSING" ? "belum ada" : "bermasalah")}</span>
                  </li>
                ))}
              </ul>

              {/* Checkbox */}
              <label className="flex items-start gap-3.5 cursor-pointer group mb-10">
                <Checkbox 
                  checked={overrideAck} 
                  onCheckedChange={(c) => setOverrideAck(c === true)} 
                  className="mt-0.5 border-slate-300 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                />
                <span className="text-[13px] text-slate-700 leading-relaxed">
                  Saya memahami bahwa Analysis akan menggunakan evidence yang belum memenuhi requirement standar.
                </span>
              </label>

              {/* Textarea */}
              <h3 className="text-[11px] font-bold text-slate-600 uppercase tracking-widest mb-3">CATATAN ALASAN MELANJUTKAN (OPSIONAL)</h3>
              <Textarea 
                value={overrideNote}
                onChange={(e) => setOverrideNote(e.target.value)}
                className="w-full h-28 bg-white border-slate-300 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-emerald-500 resize-none shadow-sm rounded-md text-[13px] p-4 placeholder:text-slate-400"
                placeholder="Tambahkan catatan jika diperlukan..."
              />
            </div>

            {/* Footer */}
            <div className="px-10 py-5 bg-white flex items-center justify-between border-t border-slate-100 mt-auto">
              <Button variant="ghost" className="text-[13px] font-semibold text-slate-600 px-0 hover:bg-transparent hover:text-slate-900" onClick={() => setShowOverrideModal(false)}>
                Kembali ke Pemeriksaan
              </Button>
              <Button 
                className="px-8 h-10 text-[13px] font-semibold bg-slate-500 text-white hover:bg-slate-600 rounded-md shadow-sm"
                disabled={!overrideAck}
                onClick={() => {
                  overrideAnalysis(overrideNote, overrideAck);
                  onProceedToAnalysis();
                  onOpenChange(false);
                  setShowOverrideModal(false);
                }}
              >
                Tetap Lanjutkan
              </Button>
            </div>
          </div>
        </div>
      )}`;

  const result = content.substring(0, startIndex) + newModal + content.substring(endIndex);
  fs.writeFileSync(file, result);
  console.log('Successfully applied UI refinement patch.');
} else {
  console.log('Could not find block to replace.');
}
