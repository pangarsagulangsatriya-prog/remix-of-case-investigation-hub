function AdaptiveExtractionOutput({ file }: { file: any }) {
  const [viewMode, setViewMode] = useState<"Structured" | "JSON">("Structured");
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  
  useEffect(() => {
    if (file?.type === "Audio") {
      setExpandedSections(["Recording Meta", "Intelligence Seeds"]);
    } else if (file?.type === "Video") {
      setExpandedSections(["Detected Events"]);
    } else {
      setExpandedSections([]);
    }
  }, [file?.id, file?.type]);

  if (!file) return null;

  const toggle = (s: string) => setExpandedSections(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);

  const Section = ({ title, icon: Icon, children }: any) => (
     <div className={`border rounded-xl overflow-hidden shadow-sm transition-all duration-300 ${expandedSections.includes(title) ? 'ring-1 ring-primary/20 shadow-md translate-y-[-2px]' : 'hover:border-slate-300'}`}>
        <button 
           onClick={() => toggle(title)}
           className={`w-full flex items-center justify-between p-4 transition-colors ${expandedSections.includes(title) ? 'bg-slate-50/80 border-b' : 'bg-white hover:bg-slate-50/50'}`}
        >
           <div className="flex items-center gap-3">
              <div className={`h-8 w-8 rounded-lg border shadow-sm flex items-center justify-center transition-all ${expandedSections.includes(title) ? 'bg-primary text-white border-primary shadow-primary/20' : 'bg-white text-slate-400'}`}>
                 <Icon className="h-4 w-4" />
              </div>
              <span className={`text-sm font-black transition-colors ${expandedSections.includes(title) ? 'text-slate-900' : 'text-slate-700'}`}>{title}</span>
           </div>
           <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${expandedSections.includes(title) ? 'rotate-180' : ''}`} />
        </button>
        {expandedSections.includes(title) && (
           <div className="p-5 bg-white space-y-4 animate-in slide-in-from-top-2 duration-300">
              {children}
           </div>
        )}
     </div>
  );

  const DataRow = ({ label, value, badge }: any) => (
     <div className="flex items-center justify-between py-1.5">
        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-tight">{label}</span>
        {badge ? (
          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${badge.className}`}>{badge.text}</span>
        ) : (
          <span className="text-[11px] font-black text-slate-700">{value || "ΓÇö"}</span>
        )}
     </div>
  );

  const ExtractionItem = ({ fact, type, source, conf }: any) => (
    <div className="bg-white border border-slate-200 rounded-lg p-3 hover:border-primary/40 transition-all hover:shadow-md cursor-pointer group mb-3 last:mb-0 relative overflow-hidden">
       <div className="absolute top-0 left-0 w-1 h-full bg-slate-100 group-hover:bg-primary/50 transition-colors" />
       <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{type}</span>
             <ConfidenceChip level={(conf || "Low").toLowerCase() as any} />
          </div>
       </div>
       <p className="text-xs font-bold text-slate-900 leading-snug mb-2 pr-4">{fact}</p>
       <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest border-t pt-2 border-slate-50">
          <Paperclip className="h-2.5 w-2.5" />
          {source}
       </div>
    </div>
  );

  if (file.type === "Audio") {
     const data = audioExtractionData;
     return (
        <div className="space-y-3 pb-20">
           <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Forensic logic</span>
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border shadow-inner">
                 <button onClick={() => setViewMode("Structured")} className={`px-2 py-0.5 text-[8px] font-black uppercase rounded transition-all ${viewMode === "Structured" ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-slate-600"}`}>Structured</button>
                 <button onClick={() => setViewMode("JSON")} className={`px-2 py-0.5 text-[8px] font-black uppercase rounded transition-all ${viewMode === "JSON" ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-slate-600"}`}>JSON</button>
              </div>
           </div>

           {viewMode === "JSON" ? (
              <div className="bg-slate-900 rounded-2xl p-6 overflow-hidden border border-slate-800 shadow-2xl">
                 <pre className="text-[10.5px] font-mono text-emerald-400 leading-relaxed overflow-auto max-h-[800px] custom-scrollbar">
                    {JSON.stringify(data, null, 2)}
                 </pre>
              </div>
           ) : (
              <div className="space-y-4">
                 <Section title="Recording Meta" icon={Settings}>
                    <div className="divide-y divide-slate-50">
                       <DataRow label="Duration" value={data.recording_meta.duration} />
                       <DataRow label="Quality" value={data.recording_meta.audio_quality} badge={{ text: data.recording_meta.audio_quality, className: "bg-emerald-50 text-emerald-700 border-emerald-100" }} />
                       <DataRow label="Type" value={data.recording_meta.recording_type} />
                       <DataRow label="Noise Level" value={data.recording_meta.noise_level} />
                    </div>
                 </Section>
                 <Section title="Diarization & Transcript" icon={MessageSquare}>
                    <div className="space-y-4">
                       {data.full_diarization.map((seg: any) => (
                         <div key={seg.segment_id} className="flex flex-col gap-1.5 pl-3 border-l-2 border-slate-100">
                            <span className="text-[10px] font-black text-slate-500 uppercase">{seg.speaker_label} ┬╖ {seg.start_time}</span>
                            <p className="text-[11px] font-bold text-slate-800 italic leading-relaxed">"{seg.text}"</p>
                         </div>
                       ))}
                    </div>
                 </Section>
                 <Section title="Intelligence Seeds" icon={Brain}>
                    <div className="space-y-4">
                       <div className="p-3 border rounded-xl bg-slate-900 text-white">
                          <span className="text-[10px] font-black text-primary uppercase block mb-2">PEEPO Reasoning</span>
                          {Object.entries(data.peepo_seeds).map(([k, v]: any) => (
                            <div key={k} className="flex gap-2 mb-1.5 last:mb-0 opacity-90">
                               <span className="text-[9px] font-black text-slate-500 uppercase min-w-[60px]">{k}</span>
                               <p className="text-[10px] font-bold text-slate-300 leading-tight">"{v[0]}"</p>
                            </div>
                          ))}
                       </div>
                    </div>
                 </Section>
              </div>
           )}
        </div>
     );
  }

  if (file.type === "Document") {
    return (
      <div className="space-y-6 pb-20">
        <div className="space-y-3 bg-slate-50 p-4 rounded-xl border">
           <div className="flex items-center gap-2 mb-0.5">
              <FileText className="h-3.5 w-3.5 text-primary" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Document Summary</span>
           </div>
           <p className="text-[11px] font-bold text-slate-700 leading-relaxed italic">
             Initial HSE report documenting structural failure of Conveyor Belt 14 in Zone B. 
           </p>
        </div>
        <div className="grid grid-cols-2 gap-2">
           {[
             { label: "Incident Type", value: "Mechanical Failure" },
             { label: "Location", value: "Pit Delta / Zone B" },
             { label: "Critical Assets", value: "Conveyor 14" },
             { label: "Severity", value: "High", badge: "bg-rose-100 text-rose-700" },
           ].map((item, i) => (
              <div key={i} className="bg-slate-50/50 p-2.5 border rounded-lg">
                 <span className="text-[8px] font-black text-slate-400 uppercase block mb-0.5">{item.label}</span>
                 <span className={`text-[10px] font-black ${item.badge ? item.badge + " px-1.5 py-0.5 rounded-sm" : "text-slate-800"}`}>
                    {item.value}
                 </span>
              </div>
           ))}
        </div>
        <Section title="Timeline & Facts" icon={Clock}>
           <ExtractionItem fact="14:35 - Belt tear occurs, E-stop triggered" type="Critical Event" source="Page 1, Para 3" conf="High" />
           <ExtractionItem fact="14:15 - Unusual vibration reported" type="Telemetry" source="Page 1, Para 2" conf="High" />
        </Section>
        <Section title="Risk Signals" icon={AlertTriangle}>
           <ExtractionItem fact="Locked egress: Walkway B blocked" type="Safety Violation" source="Page 1, Para 4" conf="High" />
        </Section>
      </div>
    );
  }

  if (file.type === "Video") {
     return (
        <div className="space-y-4 pb-20">
           <Section title="Detected Events" icon={VideoIcon}>
              <ExtractionItem fact="Metal-on-metal friction sparks detected at section 14" type="Visual Anomaly" source="CCTV [14:35:12]" conf="High" />
              <ExtractionItem fact="Conveyor belt deflection exceeding 150mm" type="Measurement" source="Computer Vision" conf="High" />
           </Section>
           <Section title="Hazards & Alerts" icon={AlertCircle}>
              <ExtractionItem fact="Operator seen approaching moving parts without barriers" type="Safety Violation" source="Scene AI" conf="Medium" />
           </Section>
        </div>
     );
  }

  if (file.type === "Image") {
    return (
      <div className="space-y-4 pb-20">
         <Section title="Composition & Objects" icon={LayoutGrid}>
            <ExtractionItem fact="Visible tear across 90% of belt width" type="Surface Condition" source="Region [X:234, Y:782]" conf="High" />
            <ExtractionItem fact="Roller support bracket appears detached" type="Equipment Hazard" source="Region [X:451, Y:123]" conf="Medium" />
         </Section>
         <Section title="Safety & PPE" icon={CheckCircle2}>
            <ExtractionItem fact="Person wearing high-vis vest & hard hat" type="PPE Compliance" source="Global Scene" conf="High" />
            <ExtractionItem fact="No exclusion zone barriers visible near tear" type="Safety Observation" source="Global Scene" conf="High" />
         </Section>
      </div>
    );
  }

  return (
    <div className="p-12 text-center">
       <span className="text-xs font-bold text-slate-400">No extracted items for this format yet.</span>
    </div>
  );
}

function AnalysisTab() {
  const [agents, setAgents] = useState<AgentState[]>(initialAgentsState);
  const [execMode, setExecMode] = useState<"idle" | "full" | "manual">("idle");
  const [globalStatus, setGlobalStatus] = useState<"idle" | "running" | "blocked" | "completed" | "stopped" | "failed">("idle");
  const [chainQueue, setChainQueue] = useState<string[]>([]);
  const [activeTask, setActiveTask] = useState<string | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [canvasZoom, setCanvasZoom] = useState(85);
  const [isExporting, setIsExporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  
  const fitToWorkspace = () => {
    if (!containerRef.current) return;
    const cw = containerRef.current.clientWidth - 40; 
    const ch = containerRef.current.clientHeight - 80;
    const scaleW = cw / 1024;
    const scaleH = ch / 576;
    const newZoom = Math.floor(Math.min(scaleW, scaleH) * 100);
    setCanvasZoom(Math.min(newZoom, 110));
  };

  useEffect(() => {
    if (selectedAgentId) {
      setTimeout(fitToWorkspace, 100);
      setActiveSlide(0);
    }
  }, [selectedAgentId]);

  const selectedAgent = agents.find(a => a.id === selectedAgentId);
  
  const slides = React.useMemo(() => {
    const agent = agents.find(a => a.id === selectedAgentId);
    if (!agent) return [];

    if (agent.id === 'fact' && agent.results) {
       return [
          {
             id: 'fact-1',
             type: 'chronology',
             title: 'Fact & Chronology',
             subtitle: 'Overview Incident',
             caseCode: 'CS-2026-0147',
             content: {
                summary: agent.results.ringkasan?.deskripsi || "No summary available.",
                metadata: [
                   { label: 'Incident Date', value: agent.results.ringkasan?.tanggal || "ΓÇö" },
                   { label: 'Incident Time', value: agent.results.ringkasan?.jam || "ΓÇö" },
                   { label: 'Location', value: agent.results.ringkasan?.lokasi || "ΓÇö" },
                   { label: 'Incident Type', value: agent.results.ringkasan?.jenis || "ΓÇö" },
                   { label: 'Department', value: agent.results.ringkasan?.departemen || "ΓÇö" },
                   { label: 'Evidence Source', value: agent.results.ringkasan?.sumber_bukti || "ΓÇö" },
                   { label: 'Severity', value: agent.results.ringkasan?.severity || "ΓÇö" }
                ],
                timeline: agent.results.timeline || { praKontak: [], kontak: [], pascaKontak: [] }
             }
          }
       ];
    }
    
    return [{
       id: 'slide-1',
       type: 'raw',
       title: 'Extraction Result',
       content: agent.results || {}
    }];
  }, [selectedAgentId, agents]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') return;
      if (e.key === "ArrowLeft") {
        setActiveSlide(prev => Math.max(0, prev - 1));
      } else if (e.key === "ArrowRight") {
        setActiveSlide(prev => Math.min(slides.length - 1, prev + 1));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [slides.length]);

  useEffect(() => {
    if (globalStatus === 'running' && !activeTask && chainQueue.length > 0) {
      const nextId = chainQueue[0];
      const agent = agents.find(a => a.id === nextId)!;
      
      const depsFailedOrBlocked = agent.dependencies.some(dId => {
        const d = agents.find(x => x.id === dId)!;
        return d.status === 'failed' || d.status === 'blocked';
      });

      if (depsFailedOrBlocked && (execMode === "full" || execMode === "manual")) {
        setGlobalStatus('blocked');
        setAgents(prev => prev.map(a => a.id === nextId ? { ...a, status: 'blocked', dependencyState: 'Blocked', microStatus: 'Waiting for upstream...' } : a));
        return;
      }

      setActiveTask(nextId);
      if (execMode === 'full') {
