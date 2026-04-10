const fs = require('fs');

const CACHE_FILE = 'src/pages/CaseWorkspacePage.tsx';
let text = fs.readFileSync(CACHE_FILE, 'utf8');

// 1. Replace Actor Intelligence Mock Data
const oldActorMock = `{
    id: "actor", name: "Actor Intelligence", icon: Users, purpose: "Analyze worker profiles, training history, and behavioral signals.", status: 'idle', dependencies: ["fact"], dependencyState: 'Waiting for Fact',
    results: {
      "Detected Actors / Roles": "Operator, Supervisor",
      "Operational Role Note": "Operator detected anomaly, supervisor became escalation point",
      "Behavior Signal": "Response appears reactive, not preemptive",
      "Capability / Readiness Note": "communication chain exists but may be too dependent on manual reporting"
    }
  }`;

const newActorMock = `{
    id: "actor", name: "Actor Intelligence", icon: Users, purpose: "Analyze worker profiles, training history, and behavioral signals.", status: 'idle', dependencies: ["fact"], dependencyState: 'Waiting for Fact',
    results: {
      ringkasan: {
        jumlah_aktor: 2,
        aktor_utama: "Sdr Fadhli / Operator",
        aktor_pendukung: "Herianto / Pengawas",
        sinyal_dominan: "Operator, Pengawas",
        catatan_cepat: "Keterlambatan pengambilan keputusan oleh operator yang diduga tidak memperhatikan alarm PTO. Pengawas baru terlibat pasca-insiden."
      },
      aktor: [
        {
          nama: "Sdr Fadhli",
          peran: "Operator DTMB 26",
          perusahaan: "PT Berau Coal",
          nrp: "1829910",
          umur: "34 Tahun",
          masa_kerja: "4 Tahun 2 Bulan",
          shift: "Shift Siang",
          kompetensi: { sid: "Aktif", simper: "Aktif", utama: "KPO / Heavy Equipment" },
          keterlibatan: "Mengoperasikan unit keluar CPP setelah dumping dengan posisi vessel belum turun sempurna menabrak portal overhead.",
          sinyal_perilaku: "Menunggu instruksi pasca tabrakan, tingkat kewaspadaan pra-kejadian rendah.",
          performa_manusia: "Kepatuhan terhadap SOP dumping dipertanyakan, kewaspadaan menurun akhir shift, komunikasi radio telat.",
          confidence: "High",
          photo: "https://i.pravatar.cc/150?u=1829910"
        },
        {
          nama: "Sdr Herianto",
          peran: "Pengawas CCP",
          perusahaan: "PT Berau Coal",
          nrp: "1482001",
          umur: "41 Tahun",
          masa_kerja: "8 Tahun",
          shift: "Shift Siang",
          kompetensi: { sid: "Aktif", simper: "Aktif", utama: "POP" },
          keterlibatan: "Menerima laporan dari operator lain, mendatangi lokasi dan menjadi eskalasi pertama ke CCR.",
          sinyal_perilaku: "Respon proaktif mengamankan area pasca insiden, namun minim intervensi sebelum kejadian.",
          performa_manusia: "Pengawasan blind spot kurang optimal, ketaatan prosedural baik dalam eskalasi krisis.",
          confidence: "High",
          photo: "https://i.pravatar.cc/150?u=1482001"
        }
      ],
      relasi: {
        interaksi: "Operator Fadhli tidak melapor via radio setelah menabrak. Pengawas Herianto mengetahui event dari operator lain (radio).",
        eskalasi: "Sdr Fadhli -> Pekerja melintas -> Sdr Herianto -> CCR",
        celah: [
          "Operator tidak sigap memegang radio setelah panik mobil menabrak portal",
          "Tidak ada sistem notifikasi langsung otomatis ke pengawas saat limit switch patah"
        ]
      },
      temuan_utama: [
        "Pelanggaran standard dumping: vessel mulai diangkat saat unit bergerak",
        "Kompetensi operator aktif namun indikasi fatigue mempengaruhi kewaspadaan",
        "Jeda kritis 10 menit antara benturan dan eskalasi radio ke CCR"
      ],
      review_manusia: [
        "Validasi catatan fatigue bulan lalu Sdr Fadhli",
        "Verifikasi rekaman dashboard monitoring unit terkait sensor PTO"
      ]
    }
  }`;

if (text.includes(oldActorMock)) {
   text = text.replace(oldActorMock, newActorMock);
} else {
   console.log("Could not find oldActorMock");
}

// 2. Inject Actor logic into React.useMemo
const slidesInjectionTarget = `         {
            id: 'slide-2',
            type: 'timeline',
            title: 'Timeline Breakdown',
            content: {
                praKontak: agent.results.timeline?.praKontak || [],
                kontak: agent.results.timeline?.kontak || [],
                pascaKontak: agent.results.timeline?.pascaKontak || [],
            }
         }
       ];
    }`;

const slidesInjectionContent = slidesInjectionTarget + `
    if (agent.id === 'actor' && agent.results) {
       return [
         {
            id: 'actor-slide-1',
            type: 'actor_summary',
            title: 'Actor Intelligence Overview',
            content: {
               ringkasan: agent.results.ringkasan,
               temuan_utama: agent.results.temuan_utama
            }
         },
         {
            id: 'actor-slide-2',
            type: 'actor_relations',
            title: 'Relations & Coordination Gaps',
            content: {
                relasi: agent.results.relasi,
                review: agent.results.review_manusia
            }
         },
         {
            id: 'actor-slide-3',
            type: 'actor_profiles',
            title: 'Involved Actor Profiles',
            content: agent.results.aktor
         }
       ];
    }`;

text = text.replace(slidesInjectionTarget, slidesInjectionContent);

// 3. Inject Actor JSX inside Slide Canvas
const jsxInjectionTarget = `{slides[activeSlide]?.type === 'raw' && (`;

const newActorJSX = `{slides[activeSlide]?.type === 'actor_summary' && (
                              <div className="flex flex-col h-full animate-in fade-in duration-300">
                                 <h2 contentEditable suppressContentEditableWarning className="text-[34px] font-bold text-[#0f172a] tracking-tight outline-none mb-8 hover:bg-slate-50 p-2 -ml-2 rounded border border-transparent hover:border-slate-200 focus:bg-white focus:border-blue-400 focus:shadow-sm">{slides[activeSlide].title}</h2>
                                 
                                 <div className="flex-1 grid grid-cols-2 gap-8 custom-scrollbar pb-6">
                                    <div className="bg-white border border-[#E5E7EB] rounded-xl p-8 shadow-sm group hover:border-slate-300 transition-colors flex flex-col h-full relative">
                                        <div className="absolute top-0 left-0 w-2 h-full bg-blue-500 rounded-l-xl" />
                                        <span className="text-[12px] font-bold text-blue-600 uppercase tracking-widest block mb-6 px-4">Ringkasan Konteks Eksekutif</span>
                                        <div className="space-y-5 px-4 mb-auto">
                                            <div className="grid grid-cols-[130px_1fr] items-center">
                                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Jumlah Aktor</span>
                                                <div contentEditable suppressContentEditableWarning className="text-[14px] font-bold text-slate-800 outline-none">{slides[activeSlide].content.ringkasan.jumlah_aktor} Orang</div>
                                            </div>
                                            <div className="grid grid-cols-[130px_1fr] items-center">
                                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Aktor Utama</span>
                                                <div contentEditable suppressContentEditableWarning className="text-[14px] font-bold text-rose-700 outline-none">{slides[activeSlide].content.ringkasan.aktor_utama}</div>
                                            </div>
                                            <div className="grid grid-cols-[130px_1fr] items-center">
                                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Aktor Pendukung</span>
                                                <div contentEditable suppressContentEditableWarning className="text-[14px] font-semibold text-slate-700 outline-none">{slides[activeSlide].content.ringkasan.aktor_pendukung}</div>
                                            </div>
                                            <div className="grid grid-cols-[130px_1fr] items-center">
                                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Sinyal Dominan</span>
                                                <div contentEditable suppressContentEditableWarning className="text-[14px] font-semibold text-slate-700 outline-none">{slides[activeSlide].content.ringkasan.sinyal_dominan}</div>
                                            </div>
                                        </div>
                                        <div className="mt-8 px-4 border-t border-slate-100 pt-6">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2 cursor-text">Catatan Insiden</span>
                                            <div contentEditable suppressContentEditableWarning className="text-[14px] font-medium text-slate-600 outline-none leading-[1.6]">{slides[activeSlide].content.ringkasan.catatan_cepat}</div>
                                        </div>
                                    </div>
                                    <div className="bg-[#f8fafc] border border-[#E5E7EB] rounded-xl p-8 shadow-sm group hover:border-slate-300 transition-colors flex flex-col h-full relative">
                                        <div className="absolute top-0 left-0 w-2 h-full bg-amber-500 rounded-l-xl" />
                                        <span className="text-[12px] font-bold text-amber-600 uppercase tracking-widest block mb-6 px-4">Temuan Utama Intelligence</span>
                                        <ul className="space-y-4 px-4 list-disc pl-8">
                                            {slides[activeSlide].content.temuan_utama.map((item, idx) => (
                                                <li key={idx} contentEditable suppressContentEditableWarning className="text-[14px] font-medium text-slate-700 leading-[1.6] outline-none">{item}</li>
                                            ))}
                                        </ul>
                                    </div>
                                 </div>
                              </div>
                           )}

                           {slides[activeSlide]?.type === 'actor_relations' && (
                              <div className="flex flex-col h-full animate-in fade-in duration-300">
                                 <h2 contentEditable suppressContentEditableWarning className="text-[34px] font-bold text-[#0f172a] tracking-tight outline-none mb-8 hover:bg-slate-50 p-2 -ml-2 rounded border border-transparent hover:border-slate-200 focus:bg-white focus:border-blue-400">{slides[activeSlide].title}</h2>
                                 <div className="flex-1 flex flex-col gap-8 pb-6">
                                    <div className="bg-white border border-[#E5E7EB] rounded-xl p-8 shadow-sm relative shrink-0">
                                        <div className="absolute top-0 left-0 w-2 h-full bg-[#10b981] rounded-l-xl" />
                                        <span className="text-[12px] font-bold text-[#10b981] uppercase tracking-widest block mb-5 px-4">Alur Analisis Hubungan & Eskalasi</span>
                                        <div className="grid grid-cols-2 gap-8 px-4">
                                            <div>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Interaksi Primer</span>
                                                <div contentEditable suppressContentEditableWarning className="text-[15px] font-medium text-slate-700 leading-[1.6] outline-none">{slides[activeSlide].content.relasi.interaksi}</div>
                                            </div>
                                            <div className="border-l border-slate-100 pl-8">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Eskalasi Chain</span>
                                                <div contentEditable suppressContentEditableWarning className="text-[16px] font-black text-[#0f172a] leading-[1.6] outline-none tracking-tight">{slides[activeSlide].content.relasi.eskalasi}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex-1 grid grid-cols-2 gap-8 min-h-0">
                                        <div className="bg-[#fff1f2] border border-rose-200 rounded-xl p-8 shadow-sm flex flex-col relative h-full">
                                            <span className="text-[12px] font-bold text-rose-600 uppercase tracking-widest block mb-5">Celah Koordinasi (Gaps)</span>
                                            <ul className="space-y-4 list-disc pl-4">
                                                {slides[activeSlide].content.relasi.celah.map((item, idx) => (
                                                    <li key={idx} contentEditable suppressContentEditableWarning className="text-[14px] font-medium text-rose-900 leading-[1.6] outline-none">{item}</li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div className="bg-[#f0fdf4] border border-emerald-200 rounded-xl p-8 shadow-sm flex flex-col relative h-full">
                                            <span className="text-[12px] font-bold text-emerald-600 uppercase tracking-widest block mb-5">Tindakan Review Manusia (HIRADC)</span>
                                            <ul className="space-y-4 list-disc pl-4">
                                                {slides[activeSlide].content.review.map((item, idx) => (
                                                    <li key={idx} contentEditable suppressContentEditableWarning className="text-[14px] font-medium text-emerald-900 leading-[1.6] outline-none">{item}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                 </div>
                              </div>
                           )}

                           {slides[activeSlide]?.type === 'actor_profiles' && (
                              <div className="flex flex-col h-full animate-in fade-in duration-300">
                                 <h2 contentEditable suppressContentEditableWarning className="text-[34px] font-bold text-[#0f172a] tracking-tight outline-none mb-6 hover:bg-slate-50 p-2 -ml-2 rounded border border-transparent hover:border-slate-200 focus:bg-white focus:border-blue-400">{slides[activeSlide].title}</h2>
                                 <div className="flex-1 grid grid-cols-2 gap-6 overflow-hidden">
                                     {slides[activeSlide].content.map((aktor, i) => (
                                         <div key={i} className="bg-white border border-[#E5E7EB] rounded-xl flex flex-col h-full shadow-sm hover:border-blue-300 transition-colors relative overflow-y-auto custom-scrollbar">
                                             <div className="h-4 w-full bg-[#1e293b] rounded-t-xl shrink-0" />
                                             <div className="p-6 pb-4">
                                                 <div className="flex items-start gap-5 border-b border-slate-100 pb-5">
                                                     <div className="w-16 h-16 rounded-full overflow-hidden shrink-0 border-2 border-white shadow-md bg-slate-100 flex items-center justify-center">
                                                         {aktor.photo ? <img src={aktor.photo} className="w-full h-full object-cover" alt="Actor" /> : <Users className="h-6 w-6 text-slate-300" />}
                                                     </div>
                                                     <div className="flex-1 pt-1">
                                                         <div contentEditable suppressContentEditableWarning className="text-[18px] font-black text-slate-900 leading-tight outline-none mb-1">{aktor.nama}</div>
                                                         <div contentEditable suppressContentEditableWarning className="text-[12px] font-bold text-blue-600 outline-none uppercase tracking-wide">{aktor.peran} &bull; {aktor.perusahaan}</div>
                                                     </div>
                                                     <div contentEditable suppressContentEditableWarning className="px-2.5 py-1 rounded bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-500 uppercase">NRP: {aktor.nrp}</div>
                                                 </div>
                                                 <div className="grid grid-cols-3 gap-y-4 gap-x-2 pt-4 shrink-0">
                                                     <div>
                                                         <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Umur</span>
                                                         <div contentEditable suppressContentEditableWarning className="text-[12px] font-bold text-slate-800 outline-none">{aktor.umur}</div>
                                                     </div>
                                                     <div>
                                                         <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Masa Kerja</span>
                                                         <div contentEditable suppressContentEditableWarning className="text-[12px] font-bold text-slate-800 outline-none">{aktor.masa_kerja}</div>
                                                     </div>
                                                     <div>
                                                         <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Shift Info</span>
                                                         <div contentEditable suppressContentEditableWarning className="text-[12px] font-bold text-slate-800 outline-none">{aktor.shift}</div>
                                                     </div>
                                                     <div>
                                                         <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">SID Status</span>
                                                         <div contentEditable suppressContentEditableWarning className="text-[12px] font-bold text-emerald-600 outline-none">{aktor.kompetensi.sid}</div>
                                                     </div>
                                                     <div>
                                                         <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">SIMPER</span>
                                                         <div contentEditable suppressContentEditableWarning className="text-[12px] font-bold text-emerald-600 outline-none">{aktor.kompetensi.simper}</div>
                                                     </div>
                                                     <div>
                                                         <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Level Kompetensi</span>
                                                         <div contentEditable suppressContentEditableWarning className="text-[12px] font-bold text-slate-800 outline-none">{aktor.kompetensi.utama}</div>
                                                     </div>
                                                 </div>
                                                 <div className="pt-5 mt-4 border-t border-slate-100 space-y-4">
                                                    <div>
                                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 border-l-2 border-slate-300 pl-1.5">Insident Keterlibatan</span>
                                                        <div contentEditable suppressContentEditableWarning className="text-[13px] font-medium text-slate-700 leading-snug outline-none">{aktor.keterlibatan}</div>
                                                    </div>
                                                    <div>
                                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 border-l-2 border-amber-400 pl-1.5">Sinyal Perilaku</span>
                                                        <div contentEditable suppressContentEditableWarning className="text-[13px] font-medium text-amber-900 leading-snug outline-none">{aktor.sinyal_perilaku}</div>
                                                    </div>
                                                    <div>
                                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 border-l-2 border-rose-400 pl-1.5">Human Performance Rating</span>
                                                        <div contentEditable suppressContentEditableWarning className="text-[13px] font-medium text-rose-900 leading-snug outline-none">{aktor.performa_manusia}</div>
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
   text = text.replace(jsxInjectionTarget, newActorJSX);
} else {
   console.log("Could not find jsxInjectionTarget");
}

fs.writeFileSync(CACHE_FILE, text);
console.log("Actor implementation successfully injected!");
