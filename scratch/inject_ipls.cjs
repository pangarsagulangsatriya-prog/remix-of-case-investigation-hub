const fs = require('fs');

const CACHE_FILE = 'src/pages/CaseWorkspacePage.tsx';
let text = fs.readFileSync(CACHE_FILE, 'utf8');

// 1. Replace IPLS Mock Data
const oldIplsMock = `{
    id: "ipls", name: "IPLS Classification", icon: FileSearch, purpose: "Classify incident according to enterprise safety standards.", status: 'idle', dependencies: ["peepo"], dependencyState: 'Waiting for PEEPO',
    results: {
      "Primary Classification": "Mechanical Failure",
      "Subclassification": "Conveyor Belt / Roller Degradation",
      "Severity Level": "High",
      "Supporting Indicators": "Belt deflection, friction anomaly, delayed response mention"
    }
  }`;

const newIplsMock = `{
    id: "ipls", name: "IPLS Classification", icon: FileSearch, purpose: "Classify incident according to enterprise safety standards.", status: 'idle', dependencies: ["peepo"], dependencyState: 'Waiting for PEEPO',
    results: {
      ringkasan: {
        root_dominan: "Ketiadaan prosedur pengawasan spesifik untuk dumping kritis dan kegagalan alat bantu sensor",
        non_conformity: "Pelanggaran SOP Dumping (Vessel belum turun saat unit bergerak)",
        layer_lemah: "Layer IV (Preventive Defense - Sensor/Alarm)",
        catatan_cepat: "Kejadian beruntun dari lemahnya sensor peringatan, pengawasan pasif, hingga fatigue operator. Fokus IPLS jatuh pada rapuhnya proteksi preventif mekanikal."
      },
      layer_1: {
        title: "Layer I - Organization Roles & Responsibilities",
        kontrol: "SOP / resources / pengawasan / management of change",
        temuan: ["SOP Dumping yang ada belum mengatur rigid kewajiban spotter di area padat infrastruktur.", "Pengawasan resource maintenance untuk limit switch kurang optimal."],
        nc: ["Kepatuhan standar pengelolaan risiko tinggi untuk alat operasional di sekitar struktur diam rendah."],
        improvement: ["Revisi SOP Dumping (Wajib Spotter).", "MOC untuk modifikasi alarm PTO di semua unit."]
      },
      layer_2: {
        title: "Layer II - Plan Readiness",
        kontrol: "JSA / emergency preparedness / maintenance / pemenuhan rambu",
        temuan: ["JSA hauling area CPP tidak memetakan bahaya kontak dengan overhead portal.", "Maintenance pre-shift mendeteksi isu kabel namun diabaikan sementara."],
        nc: ["JSA belum komprehensif mengantisipasi ketinggian tiang portal."],
        improvement: ["Review seluruh HIRADC/JSA terkait elevasi batas operasional portal."]
      },
      layer_3: {
        title: "Layer III - Work Readiness & Monitoring",
        kontrol: "P5M / P2H / kondisi area / pelaksanaan sesuai SOP",
        temuan: ["P2H tidak mencakup verifikasi bunyi alarm saat vessel dinaikkan.", "Kelelahan operator tidak terdeteksi via P5M.", "Supervisor tidak observasi di shift kritis."],
        nc: ["Pelaksanaan P2H kurang dari standar (superfisial)."],
        improvement: ["Memasukkan indikator limit switch alarm ke dalam item wajib P2H."]
      },
      layer_4: {
        title: "Layer IV - Preventive Defense",
        kontrol: "fatigue alarm / sensor-alarm in-cabin / mining eyes / GPS",
        temuan: ["Sensor limit switch pada dump truck yang terhubung alarm vessel rusak / pasif.", "DSS (Fatigue camera) tidak bereaksi memadai sebelum insiden."],
        nc: ["Kegagalan alat proteksi aktif (Preventive Defense) untuk memutus mata rantai."],
        improvement: ["Penggantian unit limit switch dan interlock PTO yang menghalangi pergerakan unit saat vessel naik."]
      },
      layer_5: {
        title: "Layer V - Contact Defense",
        kontrol: "guarding / safety devices / portal clearance / emergency response",
        temuan: ["Clearance (jarak batas ukur) portal overhead sangat tipis untuk unit dengan vessel yang terangkat."],
        nc: ["Safety device struktur (seperti palang sentuh atau rantai gawang pre-portal) tidak tersedia."],
        improvement: ["Instalasi proximity gawang fleksibel (chain clearance gauge) sebelum zona portal solid."]
      },
      root_cause: {
        root: ["Tidak ada sistem interlock mekanis untuk menahan pergerakan unit saat vessel menyentuh limit warning.", "Proses manajemen perawatan (Layer I & II) gagal mengidentifikasi sensor pasif secara tepat waktu."],
        contributing: ["Kondisi kelelahan (fatigue) operator menurunkan kesadaran spasial.", "Tidak ada kewajiban Spotter di zona spesifik."],
        missing_layer: ["Layer IV rapuh: In-cabin alarm gagal memberi peringatan dini.", "Gawang peringatan pra-benturan (Layer V) sama sekali absen di lapangan."]
      },
      layer_priority: [
        { layer: "Layer IV (Preventive Defense)", alasan: "Mengembalikan alarm fungsi limit switch & interlock sistem." },
        { layer: "Layer V (Contact Defense)", alasan: "Modifikasi palang pra-sentuh." },
        { layer: "Layer I (Org Roles)", alasan: "Update kewajiban JSA & Spotter." }
      ]
    }
  }`;

if (text.includes(oldIplsMock)) {
   text = text.replace(oldIplsMock, newIplsMock);
} else {
   console.log("Could not find oldIplsMock");
}

// 2. Inject IPLS logic into React.useMemo
const slidesInjectionTarget = `         {
            id: 'peepo-slide-4',
            type: 'peepo_factor_cards',
            title: 'Factor Analysis: Organisation',
            content: [
                 { title: 'Organisation (Organisasi)', data: agent.results.organisation, border: 'border-purple-200', bg: 'bg-purple-50', text: 'text-purple-700', marker: 'bg-purple-500' }
            ]
         }
       ];
    }`;

const slidesInjectionContent = slidesInjectionTarget + `
    if (agent.id === 'ipls' && agent.results) {
       return [
         {
            id: 'ipls-slide-1',
            type: 'ipls_summary',
            title: 'IPLS Core Classification & Root Cause',
            content: {
               ringkasan: agent.results.ringkasan,
               root_cause: agent.results.root_cause,
               layer_priority: agent.results.layer_priority
            }
         },
         {
            id: 'ipls-slide-2',
            type: 'ipls_layer_cards',
            title: 'IPLS Layers Mapping (I & II)',
            content: [
                { title: 'Layer I', data: agent.results.layer_1, border: 'border-blue-200', bg: 'bg-blue-50', text: 'text-blue-700', marker: 'bg-blue-500' },
                { title: 'Layer II', data: agent.results.layer_2, border: 'border-cyan-200', bg: 'bg-cyan-50', text: 'text-cyan-700', marker: 'bg-cyan-500' }
            ]
         },
         {
            id: 'ipls-slide-3',
            type: 'ipls_layer_cards',
            title: 'IPLS Layers Mapping (III & IV)',
            content: [
                { title: 'Layer III', data: agent.results.layer_3, border: 'border-emerald-200', bg: 'bg-emerald-50', text: 'text-emerald-700', marker: 'bg-emerald-500' },
                { title: 'Layer IV', data: agent.results.layer_4, border: 'border-amber-300', bg: 'bg-amber-50', text: 'text-amber-700', marker: 'bg-amber-500' }
            ]
         },
         {
            id: 'ipls-slide-4',
            type: 'ipls_layer_cards',
            title: 'IPLS Layers Mapping (V)',
            content: [
                 { title: 'Layer V', data: agent.results.layer_5, border: 'border-rose-200', bg: 'bg-rose-50', text: 'text-rose-700', marker: 'bg-rose-500' }
            ]
         }
       ];
    }`;

if (text.includes(slidesInjectionTarget)) {
   text = text.replace(slidesInjectionTarget, slidesInjectionContent);
} else {
   console.log("Could not find slidesInjectionTarget for IPLS");
}

// 3. Inject IPLS JSX inside Slide Canvas
const jsxInjectionTarget = `{slides[activeSlide]?.type === 'raw' && (`;

const newIplsJSX = `{slides[activeSlide]?.type === 'ipls_summary' && (
                              <div className="flex flex-col h-full animate-in fade-in duration-300">
                                 <h2 contentEditable suppressContentEditableWarning className="text-[34px] font-bold text-[#0f172a] tracking-tight outline-none mb-6 hover:bg-slate-50 p-2 -ml-2 rounded border border-transparent hover:border-slate-200 focus:bg-white focus:border-blue-400 focus:shadow-sm">{slides[activeSlide].title}</h2>
                                 <div className="flex-1 flex flex-col gap-6 pb-6">
                                     <div className="bg-white border border-[#E5E7EB] rounded-xl p-8 shadow-sm group hover:border-slate-300 transition-colors relative shrink-0">
                                        <div className="absolute top-0 left-0 w-2 h-full bg-[#3b82f6] rounded-l-xl" />
                                        <div className="grid grid-cols-[auto_1fr_auto_1fr] items-start gap-x-6 gap-y-4 px-4 pb-5 border-b border-slate-100">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Root Dominan</span>
                                            <div contentEditable suppressContentEditableWarning className="text-[13px] font-bold text-slate-800 outline-none">{slides[activeSlide].content.ringkasan.root_dominan}</div>
                                            
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Layer Terlemah</span>
                                            <div contentEditable suppressContentEditableWarning className="text-[13px] font-black text-rose-600 outline-none">{slides[activeSlide].content.ringkasan.layer_lemah}</div>

                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Non-Conformity</span>
                                            <div className="col-span-3" contentEditable suppressContentEditableWarning><span className="text-[13px] font-bold text-amber-700 outline-none">{slides[activeSlide].content.ringkasan.non_conformity}</span></div>
                                        </div>
                                        <div className="mt-5 px-4">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2 cursor-text">Catatan Cepat</span>
                                            <div contentEditable suppressContentEditableWarning className="text-[14px] font-medium text-slate-600 outline-none leading-[1.6]">{slides[activeSlide].content.ringkasan.catatan_cepat}</div>
                                        </div>
                                     </div>

                                     <div className="flex-1 flex gap-6 overflow-hidden min-h-0">
                                        <div className="bg-[#f0f9ff] border border-[#bae6fd] rounded-xl p-6 shadow-sm relative flex-[2] flex flex-col overflow-y-auto custom-scrollbar">
                                            <span className="text-[12px] font-bold text-sky-700 uppercase tracking-widest block mb-5 border-b border-[#bae6fd] pb-4">Root Cause Summary</span>
                                            <div className="space-y-4 flex-1">
                                                <div>
                                                    <span className="text-[10px] font-bold text-sky-600 uppercase tracking-widest block mb-2">Root Cause Primer</span>
                                                    <ul className="list-disc pl-5 space-y-1">
                                                        {slides[activeSlide].content.root_cause.root.map((r, ri) => <li key={ri} className="text-[13px] font-bold text-slate-800 leading-snug outline-none" contentEditable suppressContentEditableWarning>{r}</li>)}
                                                    </ul>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] font-bold text-sky-600 uppercase tracking-widest block mb-2">Contributing Factors</span>
                                                    <ul className="list-disc pl-5 space-y-1">
                                                        {slides[activeSlide].content.root_cause.contributing.map((c, ci) => <li key={ci} className="text-[13px] font-medium text-slate-700 leading-snug outline-none" contentEditable suppressContentEditableWarning>{c}</li>)}
                                                    </ul>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] font-bold text-sky-600 uppercase tracking-widest block mb-2">Missing/Broken Defense</span>
                                                    <ul className="list-disc pl-5 space-y-1">
                                                        {slides[activeSlide].content.root_cause.missing_layer.map((m, mi) => <li key={mi} className="text-[13px] font-bold text-rose-700 leading-snug outline-none" contentEditable suppressContentEditableWarning>{m}</li>)}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-[#fff1f2] border border-rose-200 rounded-xl p-6 shadow-sm relative flex-1 flex flex-col overflow-y-auto custom-scrollbar">
                                            <span className="text-[12px] font-bold text-rose-800 uppercase tracking-widest block mb-5 border-b border-rose-200 pb-4">Layer Action Priority</span>
                                            <div className="space-y-4">
                                                {slides[activeSlide].content.layer_priority.map((lp, lpi) => (
                                                    <div key={lpi} className="bg-white rounded border border-rose-100 p-3 shadow-sm group hover:border-rose-300 transition-colors">
                                                        <div className="flex items-center gap-2 mb-1.5">
                                                            <div className="bg-rose-600 text-white w-4 h-4 rounded text-[9px] font-bold flex items-center justify-center shrink-0">{lpi + 1}</div>
                                                            <span className="text-[11px] font-bold text-rose-800 uppercase tracking-widest outline-none" contentEditable suppressContentEditableWarning>{lp.layer}</span>
                                                        </div>
                                                        <div className="text-[12px] font-medium text-slate-700 leading-snug outline-none pl-6" contentEditable suppressContentEditableWarning>{lp.alasan}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                     </div>
                                 </div>
                              </div>
                           )}

                           {slides[activeSlide]?.type === 'ipls_layer_cards' && (
                              <div className="flex flex-col h-full animate-in fade-in duration-300">
                                 <h2 contentEditable suppressContentEditableWarning className="text-[34px] font-bold text-[#0f172a] tracking-tight outline-none mb-6 hover:bg-slate-50 p-2 -ml-2 rounded border border-transparent hover:border-slate-200 focus:bg-white focus:border-blue-400">{slides[activeSlide].title}</h2>
                                 <div className={"flex-1 grid gap-8 pb-6 content-start " + (slides[activeSlide].content.length === 1 ? 'grid-cols-1 max-w-4xl mx-auto w-full' : 'grid-cols-2')}>
                                     {slides[activeSlide].content.map((card, idx) => (
                                         <div key={idx} className={"border rounded-xl flex flex-col shadow-sm relative overflow-hidden bg-white " + card.border + (slides[activeSlide].content.length === 1 ? " min-h-[400px]" : " h-full")}>
                                             <div className={"h-3 w-full shrink-0 " + card.marker} />
                                             <div className={"px-6 py-4 border-b shrink-0 " + card.bg + " " + card.border}>
                                                 <div className="flex items-center gap-3">
                                                    <span contentEditable suppressContentEditableWarning className={"text-[15px] font-black uppercase tracking-widest block outline-none shrink-0 " + card.text}>{card.title}</span>
                                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                                                    <span contentEditable suppressContentEditableWarning className={"text-[13px] font-bold truncate outline-none " + card.text}>{card.data.title.replace(/Layer [I|V]+ - /, '')}</span>
                                                 </div>
                                             </div>
                                             <div className="px-6 py-3 border-b border-slate-100 bg-slate-50/50">
                                                 <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Area Kontrol</span>
                                                 <div contentEditable suppressContentEditableWarning className="text-[12px] font-semibold text-slate-700 outline-none">{card.data.kontrol}</div>
                                             </div>
                                             <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1">
                                                 <div>
                                                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2 border-l-[3px] border-amber-400 pl-2">Temuan Lapangan</span>
                                                     <ul className="space-y-1.5 list-disc pl-5">
                                                         {card.data.temuan.map((item, idxx) => (
                                                             <li key={idxx} contentEditable suppressContentEditableWarning className="text-[13px] font-medium text-slate-700 leading-snug outline-none">{item}</li>
                                                         ))}
                                                     </ul>
                                                 </div>
                                                 <div>
                                                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2 border-l-[3px] border-rose-400 pl-2">Non-Conformity Indikator</span>
                                                     <ul className="space-y-1.5 list-disc pl-5">
                                                         {card.data.nc.map((item, idxx) => (
                                                             <li key={idxx} contentEditable suppressContentEditableWarning className="text-[13px] font-medium text-rose-800 leading-snug outline-none">{item}</li>
                                                         ))}
                                                     </ul>
                                                 </div>
                                                 <div>
                                                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2 border-l-[3px] border-emerald-400 pl-2">Improvement Awal</span>
                                                     <ul className="space-y-1.5 list-disc pl-5">
                                                         {card.data.improvement.map((item, idxx) => (
                                                             <li key={idxx} contentEditable suppressContentEditableWarning className="text-[13px] font-bold text-emerald-800 leading-snug outline-none">{item}</li>
                                                         ))}
                                                     </ul>
                                                 </div>
                                             </div>
                                         </div>
                                     ))}
                                 </div>
                              </div>
                           )}

                           ` + jsxInjectionTarget;

if (text.includes(jsxInjectionTarget)) {
   text = text.replace(jsxInjectionTarget, newIplsJSX);
} else {
   console.log("Could not find jsxInjectionTarget for IPLS");
}

fs.writeFileSync(CACHE_FILE, text);
console.log("IPLS implementation successfully injected!");
