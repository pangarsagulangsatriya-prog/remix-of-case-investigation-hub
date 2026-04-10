const fs = require('fs');

const CACHE_FILE = 'src/pages/CaseWorkspacePage.tsx';
let text = fs.readFileSync(CACHE_FILE, 'utf8');

// 1. Replace PEEPO Mock Data
const oldPeepoMock = `{
    id: "peepo", name: "PEEPO Reasoning", icon: Brain, purpose: "Analyze high-level safety culture and human factors.", status: 'idle', dependencies: ["fact", "actor"], dependencyState: 'Waiting for upstream',
    results: {
      "Human Factor Signals": "Operator reacted after noticing unusual vibration",
      "Task / Process Pressure": "Escalation happened after operational anomaly was already noticeable",
      "Environmental Context": "Conveyor zone appears active and high-risk",
      "Organizational Signal": "Early response depended on verbal relay"
    }
  }`;

const newPeepoMock = `{
    id: "peepo", name: "PEEPO Reasoning", icon: Brain, purpose: "Analyze high-level safety culture and human factors.", status: 'idle', dependencies: ["fact", "actor"], dependencyState: 'Waiting for upstream',
    results: {
      ringkasan: {
        temuan_dominan: "Procedures & Equipment",
        arah_penyebab: "Mixed (weak procedure & equipment failure)",
        catatan_cepat: "Intervensi operator tidak berjalan karena tidak ada peringatan sistem saat batas tinggi dump terlewati, diperparah SOP supervisi lemah."
      },
      people: {
        temuan: ["Operator lambat mengamankan vessel saat berjalan", "Fatigue menurunkan kepekaan spasial"],
        deviasi: ["Kegagalan observasi 360", "Komunikasi tidak tertutup loopnya"],
        dampak: "Operator gagal melihat portal overhead",
        evidence: "Log fatigue, Wawancara saksi"
      },
      environment: {
        temuan: ["Area ROM tertutup debu saat kejadian", "Lighting di area portal redundansi rendah"],
        deviasi: ["Visibilitas kurang dari 10m"],
        dampak: "Mengaburkan pandangan operator terhadap siluet portal",
        evidence: "CCTV, Foto lapangan pasca kejadian"
      },
      equipment: {
        temuan: ["Tidak ada sensor / alarm active limit switch di upper vessel"],
        deviasi: ["PTO ter-engage namun alarm kabin pasif"],
        dampak: "Operator tidak sadar vessel naik tinggi",
        evidence: "History maintenance & Spesifikasi unit DTMB"
      },
      procedures: {
        temuan: ["SOP Dumping tidak mewajibkan spotter", "JSA tidak mencakup risiko tabrakan portal area hauling"],
        deviasi: ["P2H tanpa spesifik check limit switch vessel"],
        dampak: "Aktivitas tanpa pengawasan langsung di titik kritis",
        evidence: "SOP Dumping BRC-01, Dokumen P2H"
      },
      organisation: {
        temuan: ["Tidak ada campaign mengenai risiko portal dalam 6 bulan terakhir"],
        deviasi: ["Pengawasan budget perbaikan limit switch tertunda"],
        dampak: "Terbiasanya kelemahan sistem mekanik",
        evidence: "Notulen meeting OHS, Budget plan"
      },
      synthesis: {
        faktor_dominan: "Equipment issue (sensor limit switch)",
        faktor_pendukung: "Procedures (tanpa spotter)",
        faktor_pemicu: "People (fatigue operator & kurang observasi)",
        interpretasi: "Kejadian berakar pada kelemahan sistem alarm yang tidak diatasi secara organisasional, membuat prosedur bergantung penuh pada operator yang bertugas dengan kondisi kepekaan spasial menurun akibat faktor lingkungan dan shift malam."
      }
    }
  }`;

if (text.includes(oldPeepoMock)) {
   text = text.replace(oldPeepoMock, newPeepoMock);
} else {
   console.log("Could not find oldPeepoMock");
}

// 2. Inject PEEPO logic into React.useMemo
const slidesInjectionTarget = `         {
            id: 'actor-slide-3',
            type: 'actor_profiles',
            title: 'Involved Actor Profiles',
            content: agent.results.aktor
         }
       ];
    }`;

const slidesInjectionContent = slidesInjectionTarget + `
    if (agent.id === 'peepo' && agent.results) {
       return [
         {
            id: 'peepo-slide-1',
            type: 'peepo_synthesis',
            title: 'PEEPO Analysis & Synthesis',
            content: {
               ringkasan: agent.results.ringkasan,
               synthesis: agent.results.synthesis
            }
         },
         {
            id: 'peepo-slide-2',
            type: 'peepo_factor_cards',
            title: 'Factor Analysis: People & Environment',
            content: [
                { title: 'People (Individu)', data: agent.results.people, border: 'border-blue-200', bg: 'bg-blue-50', text: 'text-blue-700', marker: 'bg-blue-500' },
                { title: 'Environment (Lingkungan)', data: agent.results.environment, border: 'border-emerald-200', bg: 'bg-emerald-50', text: 'text-emerald-700', marker: 'bg-emerald-500' }
            ]
         },
         {
            id: 'peepo-slide-3',
            type: 'peepo_factor_cards',
            title: 'Factor Analysis: Equipment & Procedures',
            content: [
                { title: 'Equipment (Peralatan)', data: agent.results.equipment, border: 'border-amber-300', bg: 'bg-amber-50', text: 'text-amber-700', marker: 'bg-amber-500' },
                { title: 'Procedures (Prosedur)', data: agent.results.procedures, border: 'border-rose-200', bg: 'bg-rose-50', text: 'text-rose-700', marker: 'bg-rose-500' }
            ]
         },
         {
            id: 'peepo-slide-4',
            type: 'peepo_factor_cards',
            title: 'Factor Analysis: Organisation',
            content: [
                 { title: 'Organisation (Organisasi)', data: agent.results.organisation, border: 'border-purple-200', bg: 'bg-purple-50', text: 'text-purple-700', marker: 'bg-purple-500' }
            ]
         }
       ];
    }`;

if (text.includes(slidesInjectionTarget)) {
   text = text.replace(slidesInjectionTarget, slidesInjectionContent);
} else {
   console.log("Could not find slidesInjectionTarget for PEEPO");
}

// 3. Inject PEEPO JSX inside Slide Canvas
const jsxInjectionTarget = `{slides[activeSlide]?.type === 'raw' && (`;

const newPeepoJSX = `{slides[activeSlide]?.type === 'peepo_synthesis' && (
                              <div className="flex flex-col h-full animate-in fade-in duration-300">
                                 <h2 contentEditable suppressContentEditableWarning className="text-[34px] font-bold text-[#0f172a] tracking-tight outline-none mb-6 hover:bg-slate-50 p-2 -ml-2 rounded border border-transparent hover:border-slate-200 focus:bg-white focus:border-blue-400 focus:shadow-sm">{slides[activeSlide].title}</h2>
                                 <div className="flex-1 flex flex-col gap-8 pb-6">
                                     <div className="bg-white border border-[#E5E7EB] rounded-xl p-8 shadow-sm group hover:border-slate-300 transition-colors relative flex-1">
                                        <div className="absolute top-0 left-0 w-2 h-full bg-[#1e293b] rounded-l-xl" />
                                        <span className="text-[12px] font-bold text-slate-500 uppercase tracking-widest block mb-6 px-4">Ringkasan Konteks Eksekutif</span>
                                        <div className="grid grid-cols-[160px_1fr] items-center gap-y-4 px-4 pb-6 border-b border-slate-100">
                                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Temuan Dominan</span>
                                            <div contentEditable suppressContentEditableWarning className="text-[15px] font-black text-rose-700 outline-none">{slides[activeSlide].content.ringkasan.temuan_dominan}</div>
                                            
                                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Arah Penyebab</span>
                                            <div contentEditable suppressContentEditableWarning className="text-[15px] font-semibold text-slate-700 outline-none">{slides[activeSlide].content.ringkasan.arah_penyebab}</div>
                                        </div>
                                        <div className="mt-6 px-4">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2 cursor-text">Catatan Awal</span>
                                            <div contentEditable suppressContentEditableWarning className="text-[15px] font-medium text-slate-600 outline-none leading-[1.6]">{slides[activeSlide].content.ringkasan.catatan_cepat}</div>
                                        </div>
                                     </div>

                                     <div className="bg-[#f0f9ff] border border-[#bae6fd] rounded-xl p-8 shadow-sm relative flex-1">
                                        <span className="text-[12px] font-bold text-sky-700 uppercase tracking-widest block mb-5">Synthesis Kesimpulan PEEPO</span>
                                        <div className="grid grid-cols-3 gap-6 mb-6">
                                            <div className="bg-white rounded-lg p-5 border border-[#e0f2fe] shadow-sm">
                                                <span className="text-[10px] font-bold text-sky-600 uppercase tracking-widest block mb-1">Faktor Dominan</span>
                                                <div contentEditable suppressContentEditableWarning className="text-[13px] font-bold text-slate-800 outline-none">{slides[activeSlide].content.synthesis.faktor_dominan}</div>
                                            </div>
                                            <div className="bg-white rounded-lg p-5 border border-[#e0f2fe] shadow-sm">
                                                <span className="text-[10px] font-bold text-sky-600 uppercase tracking-widest block mb-1">Faktor Pendukung</span>
                                                <div contentEditable suppressContentEditableWarning className="text-[13px] font-bold text-slate-800 outline-none">{slides[activeSlide].content.synthesis.faktor_pendukung}</div>
                                            </div>
                                            <div className="bg-white rounded-lg p-5 border border-[#e0f2fe] shadow-sm">
                                                <span className="text-[10px] font-bold text-sky-600 uppercase tracking-widest block mb-1">Faktor Pemicu (Trigger)</span>
                                                <div contentEditable suppressContentEditableWarning className="text-[13px] font-bold text-slate-800 outline-none">{slides[activeSlide].content.synthesis.faktor_pemicu}</div>
                                            </div>
                                        </div>
                                        <div className="bg-white rounded-lg p-5 border border-[#e0f2fe] shadow-sm">
                                            <span className="text-[10px] font-bold text-sky-600 uppercase tracking-widest block mb-2 cursor-text">Interpretasi Akhir Insiden</span>
                                            <div contentEditable suppressContentEditableWarning className="text-[15px] font-medium text-slate-700 leading-[1.7] outline-none">{slides[activeSlide].content.synthesis.interpretasi}</div>
                                        </div>
                                     </div>
                                 </div>
                              </div>
                           )}

                           {slides[activeSlide]?.type === 'peepo_factor_cards' && (
                              <div className="flex flex-col h-full animate-in fade-in duration-300">
                                 <h2 contentEditable suppressContentEditableWarning className="text-[34px] font-bold text-[#0f172a] tracking-tight outline-none mb-6 hover:bg-slate-50 p-2 -ml-2 rounded border border-transparent hover:border-slate-200 focus:bg-white focus:border-blue-400">{slides[activeSlide].title}</h2>
                                 <div className={"flex-1 grid gap-8 pb-6 content-start " + (slides[activeSlide].content.length === 1 ? 'grid-cols-1 max-w-4xl' : 'grid-cols-2')}>
                                     {slides[activeSlide].content.map((card, idx) => (
                                         <div key={idx} className={"border rounded-xl flex flex-col shadow-sm relative overflow-hidden bg-white " + card.border}>
                                             <div className={"h-3 w-full shrink-0 " + card.marker} />
                                             <div className={"px-6 py-4 border-b shrink-0 " + card.bg + " " + card.border}>
                                                 <span contentEditable suppressContentEditableWarning className={"text-[15px] font-black uppercase tracking-widest outline-none " + card.text}>{card.title}</span>
                                             </div>
                                             <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
                                                 <div>
                                                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3 border-l-[3px] border-slate-300 pl-2">Temuan Utama</span>
                                                     <ul className="space-y-2.5 list-disc pl-5">
                                                         {card.data.temuan.map((item, idxx) => (
                                                             <li key={idxx} contentEditable suppressContentEditableWarning className="text-[13px] font-medium text-slate-700 leading-snug outline-none">{item}</li>
                                                         ))}
                                                     </ul>
                                                 </div>
                                                 <div>
                                                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3 border-l-[3px] border-rose-400 pl-2">Deviasi Standar</span>
                                                     <ul className="space-y-2.5 list-disc pl-5">
                                                         {card.data.deviasi.map((item, idxx) => (
                                                             <li key={idxx} contentEditable suppressContentEditableWarning className="text-[13px] font-medium text-rose-800 leading-snug outline-none">{item}</li>
                                                         ))}
                                                     </ul>
                                                 </div>
                                                 <div>
                                                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2 border-l-[3px] border-amber-400 pl-2">Dampak ke Kejadian</span>
                                                     <div contentEditable suppressContentEditableWarning className="text-[13px] font-bold text-slate-800 leading-snug outline-none pl-3">{card.data.dampak}</div>
                                                 </div>
                                                 <div className="pt-2">
                                                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Evidence / Sumber Informasi</span>
                                                     <div contentEditable suppressContentEditableWarning className="inline-block text-[11px] font-bold text-slate-600 bg-slate-100 border border-slate-200 rounded px-2.5 py-1 outline-none">{card.data.evidence}</div>
                                                 </div>
                                             </div>
                                         </div>
                                     ))}
                                 </div>
                              </div>
                           )}

                           ` + jsxInjectionTarget;

if (text.includes(jsxInjectionTarget)) {
   text = text.replace(jsxInjectionTarget, newPeepoJSX);
} else {
   console.log("Could not find jsxInjectionTarget for PEEPO");
}

fs.writeFileSync(CACHE_FILE, text);
console.log("PEEPO implementation successfully injected!");
