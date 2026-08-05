export const TraceabilityPanel: React.FC<{ 
  item: ChronologyItem, 
  onClose: () => void,
  onUpdateStatus: (status: VerificationStatus) => void,
  onUpdateBreakdown: (newBreakdown: any) => void,
  onEdit: () => void,
  onUpdateChronologyText: (newText: string) => void,
  readonly?: boolean
}> = ({ item, onClose, readonly }) => {
  const [showHistory, setShowHistory] = useState(false);

  // Fallback version if not defined
  const currentVersion = item.currentVersion || item.version || 1;
  const history = item.history || [];

  if (showHistory) {
    return (
      <div className="flex flex-col h-full bg-white border-l border-slate-200 relative overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 bg-white shrink-0 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setShowHistory(false)} className="h-7 px-2 text-slate-500 hover:text-slate-800">
            &larr; Kembali
          </Button>
          <div className="flex-1">
            <h3 className="text-[13px] font-bold text-slate-900 uppercase tracking-wider leading-none">RIWAYAT PERUBAHAN</h3>
            <p className="text-[10px] text-slate-500 mt-1">{history.length + 1} versi</p>
          </div>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-auto p-6 space-y-6 bg-slate-50">
          {/* Current Version Node */}
          <div className="relative pl-5 border-l-2 border-slate-200">
             <div className="absolute w-3 h-3 rounded-full bg-blue-500 -left-[7px] top-1" />
             <div className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">VERSI {currentVersion} &middot; {item.provenanceType === 'HUMAN_MANUAL' ? ((item.manualRevisionCount || 0) > 0 ? 'DIUBAH' : 'DITAMBAHKAN MANUAL') : 'DIUBAH'}</div>
             <div className="bg-white border border-slate-200 rounded p-4 shadow-sm mb-2">
                <div className="text-[10px] text-slate-400 mb-1">
                  {item.provenanceType === 'HUMAN_MANUAL' && (item.manualRevisionCount || 0) === 0 ? 'Ditambahkan oleh' : 'Diubah oleh'}
                </div>
                <div className="text-[11px] font-bold text-slate-800 mb-4">{item.latestHumanChange?.userName || "Gulang Satriya"} &middot; {item.latestHumanChange?.userRole || "Lead Investigator"}</div>
                
                {item.latestHumanChange?.changedFields && (
                  <div className="mb-4">
                    <div className="text-[10px] font-bold text-slate-400 mb-1">Field yang diubah</div>
                    <ul className="text-[11px] text-slate-700 space-y-0.5 ml-2">
                      {item.latestHumanChange.changedFields.map((f: string) => (
                        <li key={f} className="flex items-center gap-1.5"><div className="w-1 h-1 bg-slate-400 rounded-full"/>{f}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="mb-4">
                  <div className="text-[10px] font-bold text-slate-400 mb-1">{item.provenanceType === 'HUMAN_MANUAL' && (item.manualRevisionCount || 0) === 0 ? 'Catatan' : 'Catatan anotasi'}</div>
                  <div className="text-[11px] text-slate-700">{item.latestHumanChange?.changeNote || "-"}</div>
                </div>

                <div className="text-[10px] text-slate-400 mb-3">
                  {item.latestHumanChange?.timestamp ? new Date(item.latestHumanChange.timestamp).toLocaleString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) + ' WIB' : '05 Agustus 2026, 14:18 WIB'}
                </div>

                {((item.provenanceType === 'HUMAN_MANUAL' && (item.manualRevisionCount || 0) > 0) || item.provenanceType === 'AI_HUMAN_ANNOTATED') && (
                  <details className="group">
                    <summary className="text-[10px] font-bold text-blue-600 cursor-pointer hover:text-blue-700 list-none flex items-center gap-1">
                      <span className="group-open:hidden">[Lihat Detail Perubahan]</span>
                      <span className="hidden group-open:inline">[Tutup Detail Perubahan]</span>
                    </summary>
                    <div className="mt-3 space-y-3 pt-3 border-t border-slate-100">
                      <div>
                        <div className="text-[9px] font-bold text-slate-400 mb-1">SEBELUM</div>
                        <div className="bg-red-50 text-red-900 p-2 rounded text-[11px] border border-red-100">{item.history?.[0]?.chronology_text || "DMS memberikan peringatan kepada operator."}</div>
                      </div>
                      <div>
                        <div className="text-[9px] font-bold text-slate-400 mb-1">SESUDAH</div>
                        <div className="bg-emerald-50 text-emerald-900 p-2 rounded text-[11px] border border-emerald-100">{item.chronology_text}</div>
                      </div>
                    </div>
                  </details>
                )}
             </div>
          </div>

          {/* Past versions from history */}
          {history.map((histItem: any, idx: number) => {
             const vNum = currentVersion - 1 - idx;
             const isOriginal = idx === history.length - 1;
             
             if (isOriginal && histItem.provenanceType !== 'HUMAN_MANUAL') {
               return (
                 <div key={idx} className="relative pl-5 border-l-2 border-transparent">
                   <div className="absolute w-3 h-3 rounded-full bg-slate-300 -left-[7px] top-1" />
                   <div className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">VERSI {vNum} &middot; AI GENERATED</div>
                   <div className="bg-slate-100 border border-slate-200 rounded p-4 shadow-sm">
                      <div className="text-[11px] font-bold text-slate-800 mb-2">Fact & Chronology Agent</div>
                      <div className="text-[10px] text-slate-400">
                        {histItem.timestamp ? new Date(histItem.timestamp).toLocaleString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) + ' WIB' : '05 Agustus 2026, 13:20 WIB'}
                      </div>
                   </div>
                 </div>
               );
             }

             return (
               <div key={idx} className="relative pl-5 border-l-2 border-slate-200">
                 <div className="absolute w-3 h-3 rounded-full bg-slate-400 -left-[7px] top-1" />
                 <div className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">VERSI {vNum} &middot; {isOriginal && histItem.provenanceType === 'HUMAN_MANUAL' ? 'DITAMBAHKAN MANUAL' : 'DIUBAH'}</div>
                 <div className="bg-white border border-slate-200 rounded p-4 shadow-sm mb-2 opacity-80">
                    <div className="text-[10px] text-slate-400 mb-1">
                      {isOriginal && histItem.provenanceType === 'HUMAN_MANUAL' ? 'Ditambahkan oleh' : 'Diubah oleh'}
                    </div>
                    <div className="text-[11px] font-bold text-slate-800 mb-4">{histItem.userName || "Rina Mahardika"} &middot; {histItem.userRole || "Investigator"}</div>
                    
                    {!isOriginal && histItem.changedFields && (
                      <div className="mb-4">
                        <div className="text-[10px] font-bold text-slate-400 mb-1">Field yang diubah</div>
                        <ul className="text-[11px] text-slate-700 space-y-0.5 ml-2">
                          {histItem.changedFields.map((f: string) => (
                            <li key={f} className="flex items-center gap-1.5"><div className="w-1 h-1 bg-slate-400 rounded-full"/>{f}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="mb-4">
                      <div className="text-[10px] font-bold text-slate-400 mb-1">{isOriginal && histItem.provenanceType === 'HUMAN_MANUAL' ? 'Catatan' : 'Catatan anotasi'}</div>
                      <div className="text-[11px] text-slate-700">{histItem.changeNote || "-"}</div>
                    </div>

                    <div className="text-[10px] text-slate-400 mb-3">
                      {histItem.timestamp ? new Date(histItem.timestamp).toLocaleString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) + ' WIB' : '05 Agustus 2026, 14:02 WIB'}
                    </div>
                    
                    {!isOriginal && (
                      <details className="group">
                        <summary className="text-[10px] font-bold text-blue-600 cursor-pointer hover:text-blue-700 list-none flex items-center gap-1">
                          <span className="group-open:hidden">[Lihat Detail Perubahan]</span>
                          <span className="hidden group-open:inline">[Tutup Detail Perubahan]</span>
                        </summary>
                        <div className="mt-3 space-y-3 pt-3 border-t border-slate-100">
                          <div>
                            <div className="text-[9px] font-bold text-slate-400 mb-1">SEBELUM</div>
                            <div className="bg-red-50 text-red-900 p-2 rounded text-[11px] border border-red-100">{history[idx + 1]?.chronology_text || "DMS memberikan peringatan kepada operator."}</div>
                          </div>
                          <div>
                            <div className="text-[9px] font-bold text-slate-400 mb-1">SESUDAH</div>
                            <div className="bg-emerald-50 text-emerald-900 p-2 rounded text-[11px] border border-emerald-100">{histItem.chronology_text || item.chronology_text}</div>
                          </div>
                        </div>
                      </details>
                    )}
                 </div>
               </div>
             );
          })}

        </div>
      </div>
    );
  }

  // --- Main Detail View ---
  return (
    <div className="flex flex-col h-full bg-white border-l border-slate-200 relative overflow-hidden">
      {/* Panel Header */}
      <div className="p-4 border-b border-slate-200 bg-white shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-slate-900 flex items-center justify-center text-white rounded-none">
            <TableIcon className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-[13px] font-bold text-slate-900 uppercase tracking-wider leading-none">Detail Analisis</h3>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Analisis Bukti Investigasi</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="h-7 w-7 p-0 hover:bg-slate-100 rounded-none">
          <X className="h-4 w-4 text-slate-500" />
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-6">
        
        {/* Origin Label */}
        {item.provenanceType === 'HUMAN_MANUAL' ? (
          <div>
            <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest border border-emerald-200 mb-4">
               <CheckCircle2 className="h-3 w-3" />
               Ditambahkan Manual
            </div>
            
            <div className="text-[10px] text-slate-400 mb-1">Ditambahkan oleh</div>
            <div className="text-[11px] font-bold text-slate-800 mb-1">{item.latestHumanChange?.userName || "Gulang Satriya"} &middot; Lead Investigator</div>
            <div className="text-[10px] text-slate-500 mb-1">05 Agustus 2026, 13:42 WIB</div>
            
            {(item.manualRevisionCount || 0) > 0 && (
               <>
                 <div className="text-[10px] text-slate-400 mb-1 mt-3">Terakhir diubah oleh</div>
                 <div className="text-[11px] font-bold text-slate-800 mb-1">{item.latestHumanChange?.userName || "Gulang Satriya"} &middot; Lead Investigator</div>
                 <div className="text-[10px] text-slate-500 mb-1">05 Agustus 2026, 14:18 WIB</div>
                 <div className="text-[10px] text-slate-500 mt-2">{(item.manualRevisionCount || 0)} kali perubahan</div>
               </>
            )}
            <div className="text-[10px] font-mono text-slate-400 mt-2">Versi aktif {currentVersion}</div>
          </div>
        ) : item.provenanceType === 'AI_HUMAN_ANNOTATED' ? (
          <div>
            <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest border border-blue-200 mb-4">
               <Pencil className="h-3 w-3" />
               Human Annotation
            </div>
            <div className="text-[10px] text-slate-500 mb-3">{item.humanAnnotationCount || 2} kali anotasi</div>
            
            <div className="text-[10px] text-slate-400 mb-1">Terakhir diubah oleh</div>
            <div className="text-[11px] font-bold text-slate-800 mb-1">{item.latestHumanChange?.userName || "Gulang Satriya"} &middot; Lead Investigator</div>
            <div className="text-[10px] text-slate-500 mb-1">05 Agustus 2026, 14:18 WIB</div>
            <div className="text-[10px] font-mono text-slate-400 mt-2">Versi aktif {currentVersion}</div>
          </div>
        ) : (
          <div>
            <div className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest border border-indigo-200 mb-4">
               <Brain className="h-3 w-3" />
               AI Generated
            </div>
            <div className="text-[10px] text-slate-400 mb-1">Generated by</div>
            <div className="text-[11px] font-bold text-slate-800 mb-1">Fact & Chronology Agent</div>
            <div className="text-[10px] text-slate-500 mb-1">05 Agustus 2026, 13:20 WIB</div>
            <div className="text-[10px] font-mono text-slate-400 mt-2">Versi aktif 1</div>
          </div>
        )}

        <hr className="border-slate-100" />

        {/* Current Statement */}
        <div>
           <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">PERNYATAAN</div>
           <div className="text-[12.5px] text-slate-800 leading-relaxed bg-slate-50 p-3 rounded border border-slate-100">
             {item.chronology_text}
           </div>
        </div>

        {/* Latest Changes (if any) */}
        {((item.provenanceType === 'HUMAN_MANUAL' && (item.manualRevisionCount || 0) > 0) || item.provenanceType === 'AI_HUMAN_ANNOTATED') && (
           <>
             <hr className="border-slate-100" />
             <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">PERUBAHAN TERAKHIR</div>
                
                {item.latestHumanChange?.changedFields && (
                  <div className="mb-4">
                     <div className="text-[10px] text-slate-500 mb-1">Field yang diubah</div>
                     <ul className="text-[11px] text-slate-800 space-y-0.5 ml-2 font-medium">
                       {item.latestHumanChange.changedFields.map((f: string) => (
                         <li key={f} className="flex items-center gap-1.5"><div className="w-1 h-1 bg-slate-400 rounded-full"/>{f}</li>
                       ))}
                     </ul>
                  </div>
                )}
                
                <div className="mb-4">
                   <div className="text-[10px] text-slate-500 mb-1">{item.provenanceType === 'HUMAN_MANUAL' ? 'Catatan perubahan' : 'Catatan anotasi'}</div>
                   <div className="text-[11px] text-slate-800 font-medium">
                     {item.latestHumanChange?.changeNote || "Kalimat diperjelas berdasarkan hasil konfirmasi."}
                   </div>
                </div>
                
                <div className="text-[10px] text-slate-400 font-mono">
                   Versi {currentVersion - 1} &rarr; Versi {currentVersion}
                </div>
             </div>
           </>
        )}

        {/* Action Button */}
        {(item.provenanceType === 'HUMAN_MANUAL' || item.provenanceType === 'AI_HUMAN_ANNOTATED') && (
          <div className="pt-4">
            <Button 
              variant="outline" 
              className="w-full bg-white text-[11px] font-bold text-slate-700 border-slate-300 hover:bg-slate-50 h-9"
              onClick={() => setShowHistory(true)}
            >
              Lihat Riwayat Perubahan
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
