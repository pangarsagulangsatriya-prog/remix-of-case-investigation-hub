const fs = require('fs');
const file = 'src/components/workspace/EvidenceReadinessModal.tsx';
let content = fs.readFileSync(file, 'utf8');

const startStr = `          ) : view === "CONFIRM_OVERRIDE" && latestRun ? (`;
const endStr = `             </div>`;
const startIndex = content.indexOf(startStr);

if (startIndex !== -1) {
  // Find the end index of the confirm inline block.
  // We can search for the endStr after startIndex. But there are multiple `</div>`.
  // The structure ends right before `          ) : view === "HISTORY" ? (`
  const endBlock = `          ) : view === "HISTORY" ? (`
  const endIndex = content.indexOf(endBlock, startIndex);
  
  if (endIndex !== -1) {
    const newUI = `          ) : view === "CONFIRM_OVERRIDE" && latestRun ? (
             <div className="flex-1 flex flex-col bg-white h-full animate-in fade-in duration-300">
                {/* Header */}
                <div className="px-12 pt-12 pb-8 flex flex-col">
                  <h2 className="text-[16px] font-bold text-slate-900 uppercase tracking-widest">KONFIRMASI ANALYSIS</h2>
                  <p className="text-[13px] text-slate-500 mt-1">Evidence Golden Gate</p>
                </div>
                
                <div className="flex-1 overflow-auto px-12 pb-12 custom-scrollbar">
                  {/* Red Warning Box */}
                  <div className="bg-[#FFF5F6] rounded-xl p-6 mb-12">
                     {latestRun.results.filter(r => r.level === "REQUIRED" && r.status === "MISSING").length > 0 && (
                       <div className="text-[13px] font-semibold text-rose-600">
                         {latestRun.results.filter(r => r.level === "REQUIRED" && r.status === "MISSING").length} requirement wajib belum terpenuhi
                       </div>
                     )}
                     {latestRun.results.filter(r => r.level === "REQUIRED" && r.status === "BROKEN").length > 0 && (
                       <div className="text-[13px] font-semibold text-rose-600 mt-1.5">
                         {latestRun.results.filter(r => r.level === "REQUIRED" && r.status === "BROKEN").length} requirement wajib bermasalah
                       </div>
                     )}
                  </div>

                  {/* Detail Blocker */}
                  <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-6">DETAIL BLOCKER</h3>
                  <ul className="list-disc pl-5 space-y-4 mb-14 text-[13px] marker:text-slate-300">
                    {latestRun.results.filter(r => r.level === "REQUIRED" && r.status !== "FULFILLED").map(req => (
                      <li key={req.id} className="text-slate-400 pl-1 leading-relaxed">
                        <span className="font-bold text-slate-800">{req.label}</span> <span className="text-slate-400">— {req.issue || (req.status === "MISSING" ? "Belum ada file yang dipetakan ke requirement ini." : "bermasalah")}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Checkbox */}
                  <label className="flex items-start gap-3.5 cursor-pointer group mb-12">
                    <Checkbox 
                      checked={overrideAck} 
                      onCheckedChange={(c) => setOverrideAck(c === true)} 
                      className="mt-0.5 border-slate-200 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                    />
                    <span className="text-[13px] text-slate-700 leading-relaxed font-medium">
                      Saya memahami bahwa Analysis akan menggunakan evidence yang belum memenuhi requirement standar.
                    </span>
                  </label>

                  {/* Textarea */}
                  <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4">CATATAN ALASAN MELANJUTKAN (OPSIONAL)</h3>
                  <Textarea 
                    value={overrideNote}
                    onChange={(e) => setOverrideNote(e.target.value)}
                    className="w-full h-32 bg-white border-slate-200 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-emerald-400 resize-none rounded-lg text-[13px] p-4 placeholder:text-slate-400 shadow-sm"
                    placeholder="Tambahkan catatan jika diperlukan..."
                  />
                </div>

                {/* Footer */}
                <div className="px-12 py-6 bg-white flex items-center justify-between mt-auto shrink-0 border-t-0">
                  <Button variant="ghost" className="text-[13px] font-semibold text-slate-500 px-0 hover:bg-transparent hover:text-slate-800" onClick={() => setView("RESULT")}>
                    Kembali ke Pemeriksaan
                  </Button>
                  <Button 
                    className="px-8 h-10 text-[13px] font-semibold bg-slate-400 text-white hover:bg-slate-500 rounded-md shadow-sm transition-all"
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
             </div>
`;
    
    content = content.substring(0, startIndex) + newUI + content.substring(endIndex);
    fs.writeFileSync(file, content);
    console.log("Successfully updated modal padding and colors.");
  } else {
    console.log("End block not found.");
  }
} else {
  console.log("Start block not found.");
}
