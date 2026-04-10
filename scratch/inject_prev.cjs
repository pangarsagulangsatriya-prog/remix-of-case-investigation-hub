const fs = require('fs');

const CACHE_FILE = 'src/pages/CaseWorkspacePage.tsx';
let text = fs.readFileSync(CACHE_FILE, 'utf8');

// 1. Replace Prevention Engine Mock Data
const oldPrevMock = `{
    id: "prev", name: "Prevention Engine", icon: CheckCircle2, purpose: "Generate preventive actions and control recommendations.", status: 'idle', dependencies: ["ipls"], dependencyState: 'Waiting for IPLS',
    results: {
      "Immediate Actions": "isolate conveyor section, verify roller condition, inspect barrier control",
      "Preventive Controls": "strengthen anomaly reporting trigger and pre-failure inspection checkpoints",
      "Control Hierarchy": "engineering control first, admin control second",
      "Priority Level": "High"
    }
  }`;

const newPrevMock = `{
    id: "prev", name: "Prevention Engine", icon: CheckCircle2, purpose: "Generate preventive actions and control recommendations.", status: 'idle', dependencies: ["ipls"], dependencyState: 'Waiting for IPLS',
    results: {
      ringkasan: {
        jumlah_action: 3,
        prioritas: "High",
        fokus_utama: "Engineering & Administrative",
        catatan_cepat: "Fokus utama perbaikan fisik di area infrastruktur portal dan instalasi sensor interlock pada kabin DTMB, disusul dengan pembenahan operasional JSA hauling."
      },
      actions: [
        {
          layer: "Layer V (Contact Defense)",
          hirarki: "Engineering Control",
          kategori: "Preventive",
          tindakan: "Pemasangan palang peringatan dini (proximity chain clearance) berjarak 15 meter sebelum letak portal utama.",
          tujuan: "Peringatan fisik benturan sebelum menabrak struktur keras.",
          pic: "Dept. Infrastruktur & OHS",
          due_date: "25 Okt 2026",
          status: "Progress",
          evidence: "PO Instalasi",
          catatan: "Gunakan chain gauge berbahan polimer/rubber aman kaca."
        },
        {
          layer: "Layer IV (Preventive Defense)",
          hirarki: "Engineering Control",
          kategori: "Corrective",
          tindakan: "Perbaikan limit switch vessel & interlock switch hidrolik untuk unit DTMB.",
          tujuan: "Memblokir otomatis gear drive jika hidrolik vessel di atas batas aman.",
          pic: "Dept. Plant",
          due_date: "14 Okt 2026",
          status: "Closed",
          evidence: "WO Perbaikan",
          catatan: "Closed di unit insiden, lanjut deployment paralel semua unit."
        },
        {
          layer: "Layer I (Org Roles)",
          hirarki: "Administrative",
          kategori: "Preventive",
          tindakan: "Revisi JSA Hauling menuju ROM serta kewajiban Spotter di zona manuver portal berstruktur atap.",
          tujuan: "Memastikan observasi jarak aman via spion terverifikasi eksternal.",
          pic: "Dept. Operasional",
          due_date: "30 Okt 2026",
          status: "Open",
          evidence: "Draft JSA",
          catatan: "Wajib disosialisasikan lewat Safety Talk pagi."
        }
      ],
      prioritas: {
        immediate: [
          "Perbaikan fungsi limit switch alarm unit DTMB 26",
          "Isolasi sisa portal yang rusak untuk resiko susulan"
        ],
        short_term: [
          "Instalasi proximity gawang",
          "Revisi JSA Operasional"
        ],
        long_term: [
          "Instalasi sensor Interlock aktif secara fleet-wide (seluruh armada)",
          "Integrasi telemetri limit switch ke CCR"
        ]
      },
      risiko: [
        "Terulangnya kerusakan infrastruktur mahal akibat zero spatial awareness",
        "Potensi fatalitas jika portal collapse menimpa kabin",
        "Degradasi habit kepatuhan terhadap indikator alarm absen"
      ],
      fokus_monitoring: [
        "Verifikasi handal alarm interlock tiap P2H harian",
        "Penempatan manpower spotter secara berkelanjutan"
      ]
    }
  }`;

if (text.includes(oldPrevMock)) {
   text = text.replace(oldPrevMock, newPrevMock);
} else {
   console.log("Could not find oldPrevMock");
}

// 2. Inject PREV logic into React.useMemo
const slidesInjectionTarget = `         {
            id: 'ipls-slide-4',
            type: 'ipls_layer_cards',
            title: 'IPLS Layers Mapping (V)',
            content: [
                 { title: 'Layer V', data: agent.results.layer_5, border: 'border-rose-200', bg: 'bg-rose-50', text: 'text-rose-700', marker: 'bg-rose-500' }
            ]
         }
       ];
    }`;

const slidesInjectionContent = slidesInjectionTarget + `
    if (agent.id === 'prev' && agent.results) {
       return [
         {
            id: 'prev-slide-1',
            type: 'prev_summary',
            title: 'Prevention Plan & Strategy Overview',
            content: {
               ringkasan: agent.results.ringkasan,
               prioritas: agent.results.prioritas,
               risiko: agent.results.risiko,
               fokus_monitoring: agent.results.fokus_monitoring
            }
         },
         {
            id: 'prev-slide-2',
            type: 'prev_action_log',
            title: 'Corrective & Preventive Action Register',
            content: agent.results.actions
         }
       ];
    }`;

if (text.includes(slidesInjectionTarget)) {
   text = text.replace(slidesInjectionTarget, slidesInjectionContent);
} else {
   console.log("Could not find slidesInjectionTarget for PREV");
}

// 3. Inject PREV JSX inside Slide Canvas
const jsxInjectionTarget = `{slides[activeSlide]?.type === 'raw' && (`;

const newPrevJSX = `{slides[activeSlide]?.type === 'prev_summary' && (
                              <div className="flex flex-col h-full animate-in fade-in duration-300">
                                 <h2 contentEditable suppressContentEditableWarning className="text-[34px] font-bold text-[#0f172a] tracking-tight outline-none mb-6 hover:bg-slate-50 p-2 -ml-2 rounded border border-transparent hover:border-slate-200 focus:bg-white focus:border-blue-400">{slides[activeSlide].title}</h2>
                                 <div className="flex-1 flex gap-6 pb-6 h-0">
                                    <div className="w-[45%] flex flex-col gap-6">
                                        <div className="bg-[#1e293b] rounded-xl p-8 shadow-sm relative shrink-0">
                                            <div className="absolute top-0 left-0 w-2 h-full bg-[#3b82f6] rounded-l-xl" />
                                            <span className="text-[12px] font-bold text-slate-300 uppercase tracking-widest block mb-5 px-4">Ringkasan Konteks Eksekutif</span>
                                            <div className="grid grid-cols-[130px_1fr] items-center gap-y-4 px-4 pb-5 border-b border-slate-700">
                                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Jml. Action</span>
                                                <div contentEditable suppressContentEditableWarning className="text-[14px] font-black text-white outline-none">{slides[activeSlide].content.ringkasan.jumlah_action} Item</div>
                                                
                                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Prioritas</span>
                                                <div contentEditable suppressContentEditableWarning className="text-[13px] font-bold text-rose-400 outline-none">{slides[activeSlide].content.ringkasan.prioritas}</div>

                                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Fokus Utama</span>
                                                <div contentEditable suppressContentEditableWarning className="text-[13px] font-bold text-sky-300 outline-none">{slides[activeSlide].content.ringkasan.fokus_utama}</div>
                                            </div>
                                            <div className="mt-5 px-4">
                                                <div contentEditable suppressContentEditableWarning className="text-[13px] font-medium text-slate-400 outline-none leading-relaxed">{slides[activeSlide].content.ringkasan.catatan_cepat}</div>
                                            </div>
                                        </div>

                                        <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-sm flex-1 flex flex-col overflow-y-auto custom-scrollbar">
                                            <span className="text-[11px] font-bold text-[#10b981] uppercase tracking-widest block mb-4 border-b border-emerald-100 pb-3">Fokus & Evaluasi Monitoring</span>
                                            <ul className="list-disc pl-5 space-y-2.5 mb-6">
                                                {slides[activeSlide].content.fokus_monitoring.map((m, mi) => (
                                                    <li key={mi} contentEditable suppressContentEditableWarning className="text-[13px] font-medium text-slate-700 leading-snug outline-none">{m}</li>
                                                ))}
                                            </ul>
                                            <span className="text-[11px] font-bold text-rose-600 uppercase tracking-widest block mb-4 border-b border-rose-100 pb-3">Risiko Tanpa Tindak Lanjut</span>
                                            <ul className="list-disc pl-5 space-y-2.5">
                                                {slides[activeSlide].content.risiko.map((r, ri) => (
                                                    <li key={ri} contentEditable suppressContentEditableWarning className="text-[13px] font-medium text-rose-900 leading-snug outline-none">{r}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                    
                                    <div className="w-[55%] flex flex-col gap-6">
                                        <div className="bg-[#f8fafc] border border-slate-200 rounded-xl p-8 shadow-sm flex-1 overflow-y-auto custom-scrollbar flex flex-col">
                                            <span className="text-[13px] font-black text-slate-800 uppercase tracking-widest block mb-6 px-1">Tahapan Prioritas Implementasi</span>
                                            
                                            <div className="space-y-6 flex-1">
                                                <div className="bg-rose-50/50 border border-rose-200 rounded-lg p-5">
                                                    <span className="text-[11px] font-bold text-rose-700 uppercase tracking-widest block mb-3 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" /> Immediate Response (0-48h)</span>
                                                    <ul className="list-disc pl-5 space-y-1.5">
                                                        {slides[activeSlide].content.prioritas.immediate.map((i, idx) => (
                                                            <li key={'imm-'+idx} contentEditable suppressContentEditableWarning className="text-[13px] font-bold text-slate-800 leading-snug outline-none">{i}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                
                                                <div className="bg-amber-50/50 border border-amber-200 rounded-lg p-5">
                                                    <span className="text-[11px] font-bold text-amber-700 uppercase tracking-widest block mb-3 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-500" /> Short Term Preventive (1-4 Weeks)</span>
                                                    <ul className="list-disc pl-5 space-y-1.5">
                                                        {slides[activeSlide].content.prioritas.short_term.map((i, idx) => (
                                                            <li key={'st-'+idx} contentEditable suppressContentEditableWarning className="text-[13px] font-medium text-slate-700 leading-snug outline-none">{i}</li>
                                                        ))}
                                                    </ul>
                                                </div>

                                                <div className="bg-indigo-50/50 border border-indigo-200 rounded-lg p-5">
                                                    <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-widest block mb-3 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-indigo-500" /> Structural / Long Term (Sustain)</span>
                                                    <ul className="list-disc pl-5 space-y-1.5">
                                                        {slides[activeSlide].content.prioritas.long_term.map((i, idx) => (
                                                            <li key={'lt-'+idx} contentEditable suppressContentEditableWarning className="text-[13px] font-medium text-slate-700 leading-snug outline-none">{i}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                 </div>
                              </div>
                           )}

                           {slides[activeSlide]?.type === 'prev_action_log' && (
                              <div className="flex flex-col h-full animate-in fade-in duration-300">
                                 <h2 contentEditable suppressContentEditableWarning className="text-[34px] font-bold text-[#0f172a] tracking-tight outline-none mb-6 hover:bg-slate-50 p-2 -ml-2 rounded border border-transparent hover:border-slate-200 focus:bg-white focus:border-blue-400">{slides[activeSlide].title}</h2>
                                 <div className="flex-1 overflow-y-auto custom-scrollbar pb-6 pr-3 space-y-5">
                                     {slides[activeSlide].content.map((act, idx) => (
                                         <div key={idx} className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm hover:border-blue-300 transition-all overflow-hidden flex flex-col group relative shrink-0">
                                             <div className={"absolute top-0 left-0 w-1.5 h-full " + (act.kategori==='Corrective' ? 'bg-amber-400' : 'bg-emerald-400')} />
                                             <div className="bg-[#f8fafc] px-6 py-3 border-b border-slate-100 flex items-center justify-between pl-8">
                                                <div className="flex items-center gap-3">
                                                    <span className="bg-blue-100 text-blue-800 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest outline-none" contentEditable suppressContentEditableWarning>{act.kategori} Action</span>
                                                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest outline-none" contentEditable suppressContentEditableWarning>{act.hirarki}</span>
                                                    <span className="text-[11px] font-bold text-slate-400">|</span>
                                                    <span className="text-[11px] font-bold text-slate-500 outline-none" contentEditable suppressContentEditableWarning>{act.layer}</span>
                                                </div>
                                                <div className={"text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border " + (act.status === 'Closed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : act.status === 'Open' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-amber-50 text-amber-700 border-amber-200')} contentEditable suppressContentEditableWarning>{act.status}</div>
                                             </div>
                                             <div className="p-6 pl-8">
                                                <div className="grid grid-cols-[1fr_300px] gap-8">
                                                    <div>
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2 cursor-text">Deskripsi Tindakan & Tujuan</span>
                                                        <div contentEditable suppressContentEditableWarning className="text-[14px] font-black text-slate-800 outline-none leading-[1.4] tracking-tight mb-2.5">{act.tindakan}</div>
                                                        <div contentEditable suppressContentEditableWarning className="text-[13px] font-medium text-slate-600 outline-none leading-relaxed border-l-2 border-slate-200 pl-3 italic">" {act.tujuan} "</div>
                                                        
                                                        <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-2">
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Catatan Implementasi:</span>
                                                            <div contentEditable suppressContentEditableWarning className="text-[12px] font-semibold text-amber-800 outline-none bg-amber-50 rounded px-2.5 py-1 w-max">{act.catatan}</div>
                                                        </div>
                                                    </div>
                                                    <div className="border-l border-slate-100 pl-8 space-y-4">
                                                        <div>
                                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Due Date</span>
                                                            <div contentEditable suppressContentEditableWarning className="text-[12px] font-black text-slate-800 outline-none">{act.due_date}</div>
                                                        </div>
                                                        <div>
                                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">PIC (Person In Charge)</span>
                                                            <div contentEditable suppressContentEditableWarning className="text-[12px] font-bold text-slate-800 outline-none">{act.pic}</div>
                                                        </div>
                                                        <div>
                                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Evidence of Closure</span>
                                                            <div contentEditable suppressContentEditableWarning className="inline-block text-[11px] font-bold text-slate-600 bg-slate-100 border border-slate-200 rounded px-2.5 py-1 outline-none">{act.evidence}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                             </div>
                                         </div>
                                     ))}
                                 </div>
                              </div>
                           )}

                           ` + jsxInjectionTarget;

if (text.includes(jsxInjectionTarget)) {
   text = text.replace(jsxInjectionTarget, newPrevJSX);
} else {
   console.log("Could not find jsxInjectionTarget for PREV");
}

fs.writeFileSync(CACHE_FILE, text);
console.log("PREV implementation successfully injected!");
