const EventCitationList: React.FC<{ item: any }> = ({ item }) => {
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const toggleRow = (label: string) => {
    setExpandedRows(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const mappedTraceability = item.traceability?.map((t: any) => ({
    type: t.source_type,
    content: t.extracted_content,
    time: t.timestamp_start,
    speaker: t.source_file_name,
    thumbnail: t.source_type === 'video' ? 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=300&q=80' : undefined
  })) || [];

  const breakdown = item.breakdown || {};
  const whatCitations = [...(breakdown.action?.citations || []), ...mappedTraceability];

  const getDummyCitations = (label: string) => [
    {
      type: "document",
      content: `Data tercatat pada berkas BAP untuk parameter ${label} sesuai dengan SOP-204.`,
      speaker: "Audit Log",
      time: "10:42 AM",
      source: "BAP_INVESTIGASI_SOP-204.PDF"
    },
    {
      type: "audio",
      content: `Saksi mengkonfirmasi elemen ${label} pada saat interogasi awal berlangsung.`,
      speaker: "Saksi Utama",
      time: "10:45 AM",
      source: "REKAMAN_INTEROGASI_SAKSI.MP3"
    }
  ];

  const generateEventsFromText = (text: string) => {
    if (!text) return [];
    let normalized = text
      .replace(/^identifikasi\b/i, 'Mengidentifikasi')
      .replace(/^perbaikan\b/i, 'Memperbaiki')
      .replace(/^pemberian\b/i, 'Memberikan')
      .replace(/^pelaksanaan\b/i, 'Melakukan')
      .replace(/^trial\b/i, 'Melakukan trial')
      .replace(/^campaign\b/i, 'Melakukan campaign');

    const verbRegex = /^(membuat|menetapkan|memeriksa|memperbaiki|memasang|menguji|memverifikasi|menyerahkan|mengawasi|melakukan|mengidentifikasi|memberikan)\b/i;
    
    const rawParts = normalized.split(/,\s*dan\s+|\s+dan\s+|,\s*/i);
    const events: string[] = [];
    
    let currentEvent = "";
    for (let i = 0; i < rawParts.length; i++) {
      let part = rawParts[i].trim();
      if (!part) continue;
      
      if (i === 0) {
        currentEvent = part;
      } else {
        if (verbRegex.test(part)) {
          events.push(currentEvent);
          currentEvent = part;
        } else {
          currentEvent += " dan " + part;
        }
      }
    }
    if (currentEvent) {
      events.push(currentEvent);
    }

    return events.map((ev, i) => {
      let clean = ev.trim();
      clean = clean.charAt(0).toUpperCase() + clean.slice(1);
      if (!clean.endsWith('.')) clean += '.';
      return {
        label: `EVENT ${i + 1}`,
        value: clean,
        citations: whatCitations.length > 0 ? whatCitations : getDummyCitations(`EVENT ${i + 1}`),
        evidence_count: whatCitations.length > 0 ? whatCitations.length : 2
      };
    });
  };

  const tableRows = generateEventsFromText(item.chronology_text || "");

  if (tableRows.length === 0) return null;

  return (
    <div className="mt-6 border-t border-slate-100 pt-6">
      <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5">
         <Zap className="h-3 w-3 text-blue-600" />
         Event & Evidence Link
      </div>
      <div className="border border-slate-200 rounded-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <tbody className="bg-white">
            {tableRows.map((row) => {
              const isExpanded = !!expandedRows[row.label];
              const hasCitations = row.citations && row.citations.length > 0;
              
              return (
                <React.Fragment key={row.label}>
                  <tr 
                    className={cn(
                      "border-b border-slate-100 transition-all duration-300 rounded-none",
                      hasCitations ? "hover:bg-slate-50/80 cursor-pointer" : "bg-white",
                      isExpanded ? "bg-slate-50" : ""
                    )}
                    onClick={() => {
                      if (hasCitations) toggleRow(row.label);
                    }}
                  >
                    <td className="px-3 py-3 align-middle border-r border-slate-100 font-mono text-[9px] font-bold text-slate-500 tracking-wider w-20 bg-slate-50">
                      <div className="flex items-center gap-1.5">
                        {hasCitations ? (
                          <ChevronDown 
                            className={cn(
                              "h-3 w-3 shrink-0 text-slate-400 transition-transform duration-200", 
                              isExpanded ? "rotate-180 text-blue-600" : ""
                            )} 
                          />
                        ) : (
                          <div className="w-3 shrink-0" />
                        )}
                        <span>{row.label}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 align-middle text-[11.5px] text-slate-700 font-normal leading-normal">
                      <span className="pr-4">{row.value}</span>
                    </td>
                    <td className="px-3 py-3 align-middle text-center border-l border-slate-100 bg-slate-50 w-12">
                      {hasCitations ? (
                        <span className="inline-flex items-center justify-center min-w-[20px] text-[10px] font-bold text-blue-600 bg-blue-50/80 px-1.5 py-0.5 border border-blue-200/50 rounded-none">
                          {row.citations.length}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-normal">-</span>
                      )}
                    </td>
                  </tr>
                  
                  {isExpanded && hasCitations && (
                    <tr className="bg-white border-b border-slate-200">
                      <td colSpan={3} className="p-0 border-l-2 border-l-blue-600">
                        <div className="bg-slate-50/50 p-4 border-t border-slate-100 shadow-inner">
                          {renderGroupedCitations(row.citations)}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
