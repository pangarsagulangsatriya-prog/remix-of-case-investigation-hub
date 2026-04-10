const fs = require('fs');
const CACHE_FILE = 'src/pages/CaseWorkspacePage.tsx';
let text = fs.readFileSync(CACHE_FILE, 'utf8');

// Update fact payload in initialAgentsState
const newFactStateStr = `{
    id: "fact", name: "Fact & Chronology", icon: Clock, purpose: "Build a verified timeline from available evidence fragments.", status: 'idle', dependencies: [], dependencyState: 'Ready',
    results: {
      ringkasan: {
        tanggal: "12 Oktober 2026",
        jam: "17:05 - 20:20 WITA",
        lokasi: "ROM Central & Hauling Road",
        jenis: "Property Damage (Tabrakan Portal)",
        deskripsi: "Unit DTMB 26 beroperasi setelah P2H. Saat dump coal ritasi ke-4, vessel tidak diturunkan sempurna sehingga menabrak Safety Dump Portal saat keluar area CPP."
      },
      timeline: {
        praKontak: [
          { waktu: "17:05", kejadian: "Sdr Fadhli berangkat kerja menuju posgab", evidence: "Log Absensi", confidence: "High" },
          { waktu: "17:35", kejadian: "P2H unit DTMB 26, tidak ditemukan deviasi", evidence: "Form P2H", confidence: "High" },
          { waktu: "18:49", kejadian: "Dumping coal ritasi 2 di Roxon 4", evidence: "CCTV ROM", confidence: "Medium" }
        ],
        kontak: [
          { waktu: "20:05:10", kejadian: "Keluar area CPP dengan vessel unit masih naik menabrak Safety Dump Portal", evidence: "Inspeksi / Saksi", confidence: "High" },
          { waktu: "20:05:23", kejadian: "Portal bagian atas terlepas pasca ditabrak", evidence: "Foto CCTV", confidence: "High" }
        ],
        pascaKontak: [
          { waktu: "20:07", kejadian: "Sdr Fadhli meminjam radio LV yang melintas", evidence: "Log Radio", confidence: "Medium" },
          { waktu: "20:20", kejadian: "Pengawas Herianto lapor ke CCR", evidence: "Log CCR", confidence: "High" }
        ]
      },
      faktaTerkonfirmasi: [
        "Sdr Fadhli mengikuti tes fatigue & periksa HP (17:30)",
        "Pelaksanaan P2H pada DTMB 26 tanpa deviasi (17:35)",
        "Dumping normal ritasi 1 hingga ritasi 4"
      ],
      inferensi: [
        "Kelalaian prosedural menurunkan vessel pasca dumping ritasi 4",
        "Kurangnya peringatan sensor / alarm vessel up di cabin"
      ],
      gap: [
        "Fokus pandangan operator saat detik-detik menabrak portal",
        "Kondisi interlock vessel PTO saat kejadian"
      ],
      referensi: {
        People: "Sdr Fadhli (Operator), Sdr Herianto",
        Paper: "Log Absensi, P2H",
        Part: "Safety Dump Portal, Unit DTMB 26",
        Position: "Arah keluar CPP ke ROM Central"
      }
    }
  }`;

text = text.replace(/\{\s*id:\s*"fact"[\s\S]*?(?=\{\s*id:\s*"actor")/, newFactStateStr + ',\n  ');

// Inject the custom renderer
const customRendererStr = `{selectedAgent.id === 'fact' ? (
                     <div className="space-y-6">
                        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                           <h5 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-4">Ringkasan Kronologi</h5>
                           <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4 text-[11px] text-slate-700">
                              <div><span className="font-bold block text-slate-400 text-[8px] uppercase tracking-wider mb-1">Tanggal Kejadian</span>{selectedAgent.results.ringkasan.tanggal}</div>
                              <div><span className="font-bold block text-slate-400 text-[8px] uppercase tracking-wider mb-1">Jam Kejadian</span>{selectedAgent.results.ringkasan.jam}</div>
                              <div><span className="font-bold block text-slate-400 text-[8px] uppercase tracking-wider mb-1">Lokasi</span>{selectedAgent.results.ringkasan.lokasi}</div>
                              <div><span className="font-bold block text-slate-400 text-[8px] uppercase tracking-wider mb-1">Jenis Insiden</span>{selectedAgent.results.ringkasan.jenis}</div>
                           </div>
                           <p className="text-[11px] leading-relaxed text-slate-700 font-medium bg-slate-50 p-3 rounded-lg border border-slate-100">{selectedAgent.results.ringkasan.deskripsi}</p>
                        </div>

                        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                           <h5 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-5">Timeline Kejadian</h5>
                           
                           <div className="space-y-6">
                              {/* Pra Kontak */}
                              <div>
                                 <div className="flex items-center gap-2 mb-3">
                                    <div className="h-5 rounded bg-emerald-100 border border-emerald-200 text-emerald-700 text-[9px] font-black uppercase tracking-widest px-2 flex items-center">Pra Kontak</div>
                                    <div className="h-px bg-slate-100 flex-1"/>
                                 </div>
                                 <div className="pl-2 space-y-4 relative before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-px before:bg-emerald-200">
                                    {selectedAgent.results.timeline.praKontak.map((item: any, idx: number) => (
                                       <div key={idx} className="relative pl-6">
                                          <div className="absolute left-1 top-1.5 h-3 w-3 rounded-full bg-white border-2 border-emerald-400"/>
                                          <span className="block text-[10px] font-bold text-slate-800 mb-0.5">{item.waktu} &mdash; <span className="font-semibold text-slate-600">{item.kejadian}</span></span>
                                          <div className="flex gap-3 text-[9px]">
                                             <span className="text-slate-400">Evid: <span className="font-medium text-slate-500">{item.evidence}</span></span>
                                             <span className="text-slate-400">Conf: <span className="font-medium text-slate-500">{item.confidence}</span></span>
                                          </div>
                                       </div>
                                    ))}
                                 </div>
                              </div>

                              {/* Kontak */}
                              <div>
                                 <div className="flex items-center gap-2 mb-3">
                                    <div className="h-5 rounded bg-rose-100 border border-rose-200 text-rose-700 text-[9px] font-black uppercase tracking-widest px-2 flex items-center">Kontak</div>
                                    <div className="h-px bg-slate-100 flex-1"/>
                                 </div>
                                 <div className="pl-2 space-y-4 relative before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-px before:bg-rose-200">
                                    {selectedAgent.results.timeline.kontak.map((item: any, idx: number) => (
                                       <div key={idx} className="relative pl-6">
                                          <div className="absolute left-1 top-1.5 h-3 w-3 rounded-full bg-white border-2 border-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]"/>
                                          <span className="block text-[10px] font-bold text-rose-900 mb-0.5">{item.waktu} &mdash; <span className="font-semibold text-rose-700">{item.kejadian}</span></span>
                                          <div className="flex gap-3 text-[9px]">
                                             <span className="text-slate-400">Evid: <span className="font-medium text-slate-500">{item.evidence}</span></span>
                                             <span className="text-slate-400">Conf: <span className="font-medium text-rose-600">{item.confidence}</span></span>
                                          </div>
                                       </div>
                                    ))}
                                 </div>
                              </div>

                              {/* Pasca Kontak */}
                              <div>
                                 <div className="flex items-center gap-2 mb-3">
                                    <div className="h-5 rounded bg-amber-100 border border-amber-200 text-amber-700 text-[9px] font-black uppercase tracking-widest px-2 flex items-center">Pasca Kontak</div>
                                    <div className="h-px bg-slate-100 flex-1"/>
                                 </div>
                                 <div className="pl-2 space-y-4 relative before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-px before:bg-amber-200">
                                    {selectedAgent.results.timeline.pascaKontak.map((item: any, idx: number) => (
                                       <div key={idx} className="relative pl-6">
                                          <div className="absolute left-1 top-1.5 h-3 w-3 rounded-full bg-white border-2 border-amber-400"/>
                                          <span className="block text-[10px] font-bold text-slate-800 mb-0.5">{item.waktu} &mdash; <span className="font-semibold text-slate-600">{item.kejadian}</span></span>
                                          <div className="flex gap-3 text-[9px]">
                                             <span className="text-slate-400">Evid: <span className="font-medium text-slate-500">{item.evidence}</span></span>
                                             <span className="text-slate-400">Conf: <span className="font-medium text-slate-500">{item.confidence}</span></span>
                                          </div>
                                       </div>
                                    ))}
                                 </div>
                              </div>
                           </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                           <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                              <h5 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">Fakta Terkonfirmasi</h5>
                              <ul className="list-disc pl-4 space-y-1.5 text-[10px] font-semibold text-slate-700">
                                 {selectedAgent.results.faktaTerkonfirmasi.map((f: string, i: number) => <li key={i}>{f}</li>)}
                              </ul>
                           </div>
                           <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                              <h5 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">Urutan Diinferensikan</h5>
                              <ul className="list-disc pl-4 space-y-1.5 text-[10px] font-semibold text-slate-700">
                                 {selectedAgent.results.inferensi.map((f: string, i: number) => <li key={i}>{f}</li>)}
                              </ul>
                           </div>
                           <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                              <h5 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">Gap / Titik Belum Pasti</h5>
                              <ul className="list-disc pl-4 space-y-1.5 text-[10px] font-semibold text-slate-700 hover:text-rose-600 transition-colors">
                                 {selectedAgent.results.gap.map((f: string, i: number) => <li key={i}>{f}</li>)}
                              </ul>
                           </div>
                           <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                              <h5 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">Referensi Bukti (4P)</h5>
                              <div className="space-y-1.5 text-[10px] font-medium text-slate-700">
                                 {Object.entries(selectedAgent.results.referensi).map(([k, v]) => (
                                    <div key={k} className="flex"><span className="font-bold text-slate-500 w-16 shrink-0">{k}</span> <span>{v as string}</span></div>
                                 ))}
                              </div>
                           </div>
                        </div>

                     </div>
                  ) : (
                     <div className="grid grid-cols-1 gap-3">
                        {Object.entries(selectedAgent.results).map(([key, value]) => (
                           <div key={key} className="bg-white border border-slate-100 rounded-lg p-4 shadow-sm">
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">{key}</span>
                              <div className="text-[11px] text-slate-700 leading-relaxed">
                                 {Array.isArray(value) ? (
                                    <ul className="list-disc pl-4 space-y-1">
                                       {(value as string[]).map(v => <li key={v}>{v}</li>)}
                                    </ul>
                                 ) : (
                                    <p>{value as string}</p>
                                 )}
                              </div>
                           </div>
                        ))}
                     </div>
                  )}`;

const renderSearchStart = `<div className="grid grid-cols-1 gap-3">
                           {Object.entries(selectedAgent.results).map(([key, value]) => (
                              <div key={key} className="bg-white border border-slate-100 rounded-lg p-4 shadow-sm">
                                 <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">{key}</span>
                                 <div className="text-[11px] text-slate-700 leading-relaxed">
                                    {Array.isArray(value) ? (
                                       <ul className="list-disc pl-4 space-y-1">
                                          {(value as string[]).map(v => <li key={v}>{v}</li>)}
                                       </ul>
                                    ) : (
                                       <p>{value as string}</p>
                                    )}
                                 </div>
                              </div>
                           ))}
                        </div>`;

text = text.replace(renderSearchStart, customRendererStr);

fs.writeFileSync(CACHE_FILE, text);
