const fs = require('fs');
const file = 'src/components/workspace/EvidenceReadinessModal.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add CONFIRM_OVERRIDE to state
content = content.replace(
  'const [view, setView] = useState<"RESULT" | "HISTORY" | "ARCHIVE">("RESULT");',
  'const [view, setView] = useState<"RESULT" | "HISTORY" | "ARCHIVE" | "CONFIRM_OVERRIDE">("RESULT");'
);

// 2. Hide Main Header
content = content.replace(
  '{view !== "HISTORY" && (',
  '{view !== "HISTORY" && view !== "CONFIRM_OVERRIDE" && ('
);

// 3. Hide Main Footer
content = content.replace(
  '{/* Sticky Footer */}\n        {latestRun?.status !== "CHECKING" && (',
  '{/* Sticky Footer */}\n        {latestRun?.status !== "CHECKING" && view !== "CONFIRM_OVERRIDE" && ('
);

// 4. Update Button Logic
content = content.replace(
  /if \(isNotReady && view !== "ARCHIVE"\) \{\s*setShowOverrideModal\(true\);\s*\}/,
  `if (isNotReady && view !== "ARCHIVE") {
                        setView("CONFIRM_OVERRIDE");
                      }`
);

// 5. Build Inline UI
const inlineUI = `          ) : view === "CONFIRM_OVERRIDE" && latestRun ? (
             <div className="flex-1 flex flex-col bg-white h-full animate-in fade-in duration-300">
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
                <div className="px-10 py-5 bg-white flex items-center justify-between border-t border-slate-100 mt-auto shrink-0">
                  <Button variant="ghost" className="text-[13px] font-semibold text-slate-600 px-0 hover:bg-transparent hover:text-slate-900" onClick={() => setView("RESULT")}>
                    Kembali ke Pemeriksaan
                  </Button>
                  <Button 
                    className="px-8 h-10 text-[13px] font-semibold bg-slate-500 text-white hover:bg-slate-600 rounded-md shadow-sm"
                    disabled={!overrideAck}
                    onClick={() => {
                      overrideAnalysis(overrideNote, overrideAck);
                      onProceedToAnalysis();
                      onOpenChange(false);
                      setView("RESULT");
                    }}
                  >
                    Tetap Lanjutkan
                  </Button>
                </div>
             </div>`;

content = content.replace(
  '          ) : view === "HISTORY" ? (',
  inlineUI + '\n          ) : view === "HISTORY" ? ('
);

// 6. Remove the old Override Modal block completely
const startStr = `{/* Override Modal */}`;
const endStr = `Tetap Lanjutkan
              </Button>
            </div>
          </div>
        </div>
      )}`;
const startIndex = content.indexOf(startStr);
const endIndex = content.indexOf(endStr);
if (startIndex !== -1 && endIndex !== -1) {
  content = content.substring(0, startIndex) + content.substring(endIndex + endStr.length);
}

fs.writeFileSync(file, content);
console.log('Successfully made modal inline!');
