const fs = require('fs');
const file = 'src/components/workspace/EvidenceReadinessModal.tsx';
let content = fs.readFileSync(file, 'utf8');

const oldModal = `      {/* Override Modal */}
      {showOverrideModal && latestRun && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-[2px]">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-[440px] overflow-hidden flex flex-col m-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-slate-100 flex items-start gap-4">
              <div className="h-10 w-10 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-5 w-5 text-rose-600" />
              </div>
              <div className="flex flex-col pt-1">
                <h3 className="text-[15px] font-bold text-slate-900">Lanjutkan ke Analysis?</h3>
                <p className="text-[13px] text-slate-500 mt-1 leading-relaxed">
                  {latestRun.results.filter(r => r.level === "REQUIRED" && r.status !== "FULFILLED").length} requirement wajib masih belum terpenuhi. Analisis tetap dapat dijalankan, tetapi hasil dapat memiliki keterbatasan evidence.
                </p>
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col gap-3">
              <label className="flex items-start gap-3 cursor-pointer group">
                <Checkbox 
                  checked={overrideAck} 
                  onCheckedChange={(c) => setOverrideAck(c === true)} 
                  className="mt-0.5"
                />
                <span className="text-[13px] font-medium text-slate-700 leading-snug">
                  Saya menyetujui penggunaan evidence tidak lengkap.
                </span>
              </label>
            </div>
            <div className="px-6 py-4 bg-white flex items-center justify-end gap-3 border-t border-slate-100">
              <Button variant="ghost" className="text-[13px] font-semibold text-slate-600" onClick={() => setShowOverrideModal(false)}>
                Kembali
              </Button>
              <Button 
                className="px-6 text-[13px] font-semibold bg-rose-600 text-white hover:bg-rose-700"
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

const newModal = `      {/* Override Modal */}
      {showOverrideModal && latestRun && (
        <div className="fixed inset-0 z-[110] flex justify-end bg-slate-900/60 backdrop-blur-[2px] transition-all">
          <div className="bg-white shadow-2xl w-full max-w-[55%] min-w-[600px] h-full flex flex-col animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="px-8 pt-8 pb-4 border-b border-slate-100 flex flex-col">
              <h2 className="text-[14px] font-bold text-slate-900 uppercase tracking-widest">KONFIRMASI ANALYSIS</h2>
              <p className="text-[13px] text-slate-500 mt-1">Evidence Golden Gate</p>
            </div>
            
            <div className="flex-1 overflow-auto p-8 custom-scrollbar">
              {/* Red Warning Box */}
              <div className="bg-rose-50 border border-rose-100 rounded-lg p-5 mb-8">
                 {latestRun.results.filter(r => r.level === "REQUIRED" && r.status === "MISSING").length > 0 && (
                   <div className="text-[13px] font-bold text-rose-700">
                     {latestRun.results.filter(r => r.level === "REQUIRED" && r.status === "MISSING").length} requirement wajib belum terpenuhi
                   </div>
                 )}
                 {latestRun.results.filter(r => r.level === "REQUIRED" && r.status === "BROKEN").length > 0 && (
                   <div className="text-[13px] font-bold text-rose-700 mt-1">
                     {latestRun.results.filter(r => r.level === "REQUIRED" && r.status === "BROKEN").length} requirement wajib bermasalah
                   </div>
                 )}
              </div>

              {/* Detail Blocker */}
              <h3 className="text-[12px] font-bold text-slate-500 uppercase tracking-widest mb-4">DETAIL BLOCKER</h3>
              <ul className="list-disc pl-5 space-y-3 mb-10 text-[13px]">
                {latestRun.results.filter(r => r.level === "REQUIRED" && r.status !== "FULFILLED").map(req => (
                  <li key={req.id} className="text-slate-700">
                    <span className="font-semibold">{req.label}</span> — <span className="text-slate-500">{req.issue || (req.status === "MISSING" ? "belum ada" : "bermasalah")}</span>
                  </li>
                ))}
              </ul>

              {/* Checkbox */}
              <label className="flex items-start gap-3 cursor-pointer group mb-8">
                <Checkbox 
                  checked={overrideAck} 
                  onCheckedChange={(c) => setOverrideAck(c === true)} 
                  className="mt-0.5"
                />
                <span className="text-[13px] font-medium text-slate-800 leading-snug">
                  Saya memahami bahwa Analysis akan menggunakan evidence yang belum memenuhi requirement standar.
                </span>
              </label>

              {/* Textarea */}
              <h3 className="text-[12px] font-bold text-slate-500 uppercase tracking-widest mb-3">CATATAN ALASAN MELANJUTKAN (OPSIONAL)</h3>
              <Textarea 
                value={overrideNote}
                onChange={(e) => setOverrideNote(e.target.value)}
                className="w-full h-32 bg-slate-50 border-slate-200 resize-none"
              />
            </div>

            {/* Footer */}
            <div className="px-8 py-5 bg-white flex items-center justify-between border-t border-slate-100 mt-auto">
              <Button variant="ghost" className="text-[13px] font-semibold text-slate-600 px-0 hover:bg-transparent hover:text-slate-900" onClick={() => setShowOverrideModal(false)}>
                Kembali ke Pemeriksaan
              </Button>
              <Button 
                className="px-6 h-10 text-[13px] font-semibold bg-slate-500 text-white hover:bg-slate-600"
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

if (content.includes('Lanjutkan ke Analysis?')) {
  content = content.replace(oldModal, newModal);
  fs.writeFileSync(file, content);
  console.log('Successfully patched modal');
} else {
  console.log('Could not find modal block');
}
