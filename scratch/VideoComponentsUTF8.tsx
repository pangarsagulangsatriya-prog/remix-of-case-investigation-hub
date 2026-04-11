function VideoAnalysisPanel({ file, currentTime, onJump }: { file: any, currentTime: number, onJump: (s: number) => void }) {
  const [activeTab, setActiveTab] = useState<"Extraction" | "Scene Session">("Extraction");
  const [viewMode, setViewMode] = useState<"Structured" | "JSON">("Structured");

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Sticky Tab Switcher */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b px-4 py-2 flex items-center gap-1 shrink-0">
        {(["Extraction", "Scene Session"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-1.5 px-3 text-[10px] font-black uppercase tracking-widest rounded-md transition-all ${
              activeTab === tab
              ? "bg-primary text-white shadow-sm"
              : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar">
        {activeTab === "Extraction" ? (
          <div className="p-4 space-y-4">
             <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Intelligence Layer</span>
                <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-md border shadow-inner">
                   <button onClick={() => setViewMode("Structured")} className={`px-2 py-1 text-[8px] font-black uppercase rounded transition-all ${viewMode === "Structured" ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-slate-600"}`}>Structured</button>
                   <button onClick={() => setViewMode("JSON")} className={`px-2 py-1 text-[8px] font-black uppercase rounded transition-all ${viewMode === "JSON" ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-slate-600"}`}>JSON</button>
                </div>
             </div>
             {viewMode === "Structured" ? (
               <VideoExtractionStructured data={videoExtractionRefined} onJump={onJump} />
             ) : (
               <div className="bg-slate-900 rounded-xl p-4 overflow-hidden border border-slate-800 shadow-2xl mt-4">
                  <pre className="text-[10px] font-mono text-emerald-400 leading-relaxed overflow-auto max-h-[1000px] custom-scrollbar">
                     {JSON.stringify(videoExtractionRefined, null, 2)}
                  </pre>
               </div>
             )}
          </div>
        ) : (
          <VideoSceneSession currentTime={currentTime} onJump={onJump} />
        )}
      </div>
    </div>
  );
}

function VideoExtractionStructured({ data, onJump }: { data: typeof videoExtractionRefined, onJump: (s: number) => void }) {
  const [expandedSections, setExpandedSections] = useState<string[]>(["Video Session Meta", "Scene Timeline"]);

  const toggle = (s: string) => setExpandedSections(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);

  const ExtractionSection = ({ title, icon: Icon, count, children }: any) => (
    <div className={`border border-slate-100 rounded-xl overflow-hidden mb-2 transition-all duration-300 ${expandedSections.includes(title) ? 'shadow-sm border-primary/10' : 'hover:border-slate-200'}`}>
      <button 
        onClick={() => toggle(title)}
        className={`w-full flex items-center justify-between px-3 py-2.5 transition-colors ${expandedSections.includes(title) ? 'bg-slate-50/50 border-b border-slate-50' : 'bg-white'}`}
      >
        <div className="flex items-center gap-2.5">
          <div className={`p-1.5 rounded-lg border shadow-sm ${expandedSections.includes(title) ? 'bg-primary text-white border-primary' : 'bg-white text-slate-400'}`}>
            <Icon className="h-3.5 w-3.5" />
          </div>
          <span className={`text-[11px] font-black uppercase tracking-tight transition-colors ${expandedSections.includes(title) ? 'text-slate-900' : 'text-slate-600'}`}>
            {title}
            {count !== undefined && <span className="ml-2 opacity-40">({count})</span>}
          </span>
        </div>
        <ChevronDown className={`h-3 w-3 text-slate-300 transition-transform ${expandedSections.includes(title) ? 'rotate-180' : ''}`} />
      </button>
      {expandedSections.includes(title) && (
        <div className="p-3 bg-white space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
          {children}
        </div>
      )}
    </div>
  );

  const MetadataField = ({ label, value }: { label: string, value: any }) => (
    <div className="flex flex-col gap-0.5">
      <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{label}</span>
      <span className="text-[11px] font-bold text-slate-800 leading-tight">{value || "ΓÇö"}</span>
    </div>
  );

  return (
    <div className="space-y-1">
      <ExtractionSection title="Video Session Meta" icon={VideoIcon}>
        <div className="grid grid-cols-2 gap-y-3 gap-x-4">
          <MetadataField label="Session" value={data.video_session_meta.session_name} />
          <MetadataField label="Duration" value={data.video_session_meta.duration} />
          <MetadataField label="Quality" value={data.video_session_meta.quality} />
          <MetadataField label="FPS" value={data.video_session_meta.fps} />
          <MetadataField label="Source" value={data.video_session_meta.camera_type} />
          <MetadataField label="Confidence" value={data.video_session_meta.confidence} />
        </div>
      </ExtractionSection>

      <ExtractionSection title="Scene Timeline" icon={LayoutGrid} count={data.scene_timeline.length}>
        <div className="space-y-2">
          {data.scene_timeline.map((s) => (
            <div 
              key={s.id} 
              onClick={() => onJump(s.seconds)}
              className="p-2.5 rounded-lg border border-slate-50 bg-slate-50/30 hover:bg-white hover:border-primary/20 hover:shadow-sm cursor-pointer transition-all group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-black text-primary bg-primary/5 px-1.5 py-0.5 rounded tabular-nums">{s.timestamp}</span>
                <ConfidenceChip level={s.confidence.toLowerCase() as any} />
              </div>
              <p className="text-[11px] font-black text-slate-900 group-hover:text-primary transition-colors leading-snug">{s.scene_label}</p>
              <p className="text-[10px] font-medium text-slate-500 line-clamp-2 mt-1 italic leading-relaxed">"{s.summary}"</p>
              <div className="flex items-center gap-2 mt-2 opacity-60">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{s.actor}</span>
                <div className="h-0.5 w-0.5 rounded-full bg-slate-300" />
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{s.location}</span>
              </div>
            </div>
          ))}
        </div>
      </ExtractionSection>

      <ExtractionSection title="Actor Profiles" icon={Users} count={data.actor_profiles.length}>
        <div className="space-y-2">
          {data.actor_profiles.map((a) => (
            <div key={a.actor_id} className="p-3 rounded-xl border border-slate-100 bg-white shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{a.actor_label}</span>
                <ConfidenceChip level={a.confidence.toLowerCase() as any} />
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <MetadataField label="Role" value={a.probable_role} />
                <MetadataField label="Screen Time" value={a.screen_time} />
              </div>
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 space-y-1.5">
                 <div className="flex items-center justify-between text-[9px] font-bold">
                    <span className="text-slate-400">Activity:</span>
                    <span className="text-slate-700">{a.activity}</span>
                 </div>
                 <div className="flex items-center justify-between text-[9px] font-bold">
                    <span className="text-slate-400">Behavior:</span>
                    <span className="text-slate-700">{a.behavior}</span>
                 </div>
                 <div className="flex items-center justify-between text-[9px] font-bold">
                    <span className="text-slate-400">Stress:</span>
                    <span className={`px-1 rounded ${a.stress.includes('High') ? 'bg-rose-100 text-rose-700' : 'text-slate-700'}`}>{a.stress}</span>
                 </div>
              </div>
            </div>
          ))}
        </div>
      </ExtractionSection>

      <ExtractionSection title="Action / Event Detection" icon={Activity} count={data.action_events.length}>
        <div className="space-y-1.5">
          {data.action_events.map((e, i) => (
            <div 
              key={i} 
              onClick={() => onJump(e.seconds)}
              className="flex gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer group"
            >
              <span className="text-[10px] font-black text-slate-400 tabular-nums pt-0.5">{e.timestamp}</span>
              <div className="flex-1 space-y-1">
                 <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded border ${
                      e.severity === 'Critical' ? 'bg-rose-50 text-rose-700 border-rose-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                    }`}>{e.event_type}</span>
                    <span className="text-[9px] font-bold text-slate-400 truncate">{e.object}</span>
                 </div>
                 <p className="text-[11px] font-bold text-slate-800 leading-snug group-hover:text-primary transition-colors">{e.summary}</p>
                 <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400">
                    <span className="uppercase">{e.actor}</span>
                    <div className="h-0.5 w-0.5 bg-slate-300 rounded-full" />
                    <span>Status: {e.status}</span>
                 </div>
              </div>
            </div>
          ))}
        </div>
      </ExtractionSection>

      <ExtractionSection title="Environmental Observations" icon={Wind}>
        <div className="space-y-3">
          {data.environmental_observations.map((o, i) => (
            <div key={i} onClick={() => onJump(o.seconds)} className="p-2 border-l-2 border-slate-100 hover:border-primary/40 cursor-pointer">
              <span className="text-[10px] font-black text-slate-300 tabular-nums">{o.timestamp}</span>
              <p className="text-[11px] font-bold text-slate-700 leading-snug mb-2 mt-0.5">{o.summary}</p>
              <div className="flex flex-wrap gap-1.5">
                 <span className="px-1.5 py-0.5 bg-slate-100 text-[8px] font-black uppercase rounded text-slate-500">Vis: {o.visibility}</span>
                 <span className="px-1.5 py-0.5 bg-slate-100 text-[8px] font-black uppercase rounded text-slate-500">Hazard: {o.hazard}</span>
              </div>
            </div>
          ))}
        </div>
      </ExtractionSection>

      <ExtractionSection title="Equipment & Object Signals" icon={Cpu}>
        <div className="grid gap-2">
          {data.equipment_and_object_signals.map((o, i) => (
            <div key={i} onClick={() => onJump(o.seconds)} className="p-2.5 rounded-lg bg-slate-50 border border-transparent hover:bg-white hover:border-slate-100 hover:shadow-sm cursor-pointer group">
              <div className="flex items-center justify-between mb-1.5">
                 <span className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{o.object}</span>
                 <span className="text-[9px] font-black text-primary bg-primary/5 px-1.5 py-0.5 rounded">{o.timestamp}</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                 <span className={`px-1.5 py-0.5 text-[8px] font-black uppercase rounded ${o.condition === 'Removed' || o.condition === 'Skewed' ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-500'}`}>{o.condition}</span>
                 <span className="text-[9px] font-bold text-slate-400 italic">"{o.anomaly}"</span>
              </div>
              <div className="flex items-center justify-between text-[9px] font-bold text-slate-400 uppercase">
                 <span>Actor: {o.actor}</span>
                 <ConfidenceChip level={o.confidence.toLowerCase() as any} />
              </div>
            </div>
          ))}
        </div>
      </ExtractionSection>

      <ExtractionSection title="Human Performance Signals" icon={Footprints}>
        <div className="space-y-3">
          {Object.entries(data.human_performance_signals).map(([key, items]: [string, any]) => (
            <div key={key}>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.1em] mb-1.5 block">{key.replace(/_/g, ' ')}</span>
              <div className="space-y-1.5">
                {items.map((item: any, i: number) => (
                  <div key={i} onClick={() => onJump(item.seconds)} className="p-2 bg-rose-50/50 border border-rose-100 rounded-lg group cursor-pointer">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] font-black text-rose-700 tracking-tight uppercase">{item.category}</span>
                      <span className="text-[9px] font-bold text-rose-300 tabular-nums">{item.timestamp}</span>
                    </div>
                    <p className="text-[11px] font-bold text-rose-900 leading-tight">"{item.detail}"</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ExtractionSection>

      <ExtractionSection title="PEEPO Seeds" icon={Brain}>
        <div className="space-y-3">
          {data.peepo_seeds.map((category) => (
            <div key={category.category} className="space-y-1.5">
              <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">{category.category}</span>
              <ul className="space-y-1">
                {category.items.map((item, i) => (
                  <li key={i} className="flex gap-2">
                    <div className="h-1 w-1 rounded-full bg-primary/40 mt-1.5 shrink-0" />
                    <span className="text-[11px] font-medium text-slate-600 leading-snug italic">"{item}"</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </ExtractionSection>

      <ExtractionSection title="Review Meta" icon={CheckCircle2}>
        <div className="space-y-4">
          <div className="space-y-2">
             <span className="text-[10px] font-black text-slate-400 uppercase block">Needs Human Review</span>
             <ul className="space-y-1.5">
                {data.review_meta.needs_review.map((r, i) => (
                  <li key={i} className="flex items-center gap-2 p-2 bg-amber-50 border border-amber-100 rounded-lg border-dashed">
                    <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                    <span className="text-[11px] font-bold text-amber-800 leading-tight">{r}</span>
                  </li>
                ))}
             </ul>
          </div>
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
             <span className="text-[11px] font-black text-slate-900 uppercase">Overall Readiness</span>
             <span className="text-[11px] font-black text-emerald-600 uppercase tracking-widest">{data.review_meta.overall_confidence} READY</span>
          </div>
        </div>
      </ExtractionSection>
    </div>
  );
}

function VideoSceneSession({ currentTime, onJump }: { currentTime: number, onJump: (s: number) => void }) {
  const data = videoExtractionRefined.scene_timeline;
  
  return (
    <div className="flex flex-col h-full bg-slate-50/30">
      <div className="px-4 py-3 border-b bg-white flex items-center justify-between">
         <div className="flex items-center gap-2">
            <LayoutGrid className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Active Sequence Session</span>
         </div>
         <span className="text-[10px] font-black text-slate-900 uppercase bg-slate-100 px-2 py-0.5 rounded">{data.length} Segments</span>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar p-3 space-y-2">
        {data.map((seg) => {
          const isActive = currentTime >= seg.seconds && (currentTime < (seg.seconds + (parseInt(seg.duration.split(':')[0]) * 60 + parseInt(seg.duration.split(':')[1]))));
          
          return (
            <div
              key={seg.id}
              onClick={() => onJump(seg.seconds)}
              className={`group flex items-start gap-4 p-4 rounded-xl border transition-all duration-300 cursor-pointer relative overflow-hidden active:scale-[0.98] ${
                isActive 
                ? "bg-white border-primary ring-1 ring-primary/20 shadow-xl translate-x-1" 
                : "bg-white border-slate-100 hover:border-primary/30 hover:shadow-md hover:bg-slate-50/50"
              }`}
            >
              {isActive && <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />}
              {!isActive && <div className="absolute top-0 right-0 px-2 py-0.5 bg-slate-100 text-[8px] font-black text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity rounded-bl-lg border-l border-b border-slate-200">SEEK TO TIMESTAMP</div>}
              
              <div className="w-16 shrink-0 flex flex-col items-center gap-1.5 pt-0.5">
                <div className={`text-[10px] font-black tabular-nums tracking-tighter transition-colors ${isActive ? "text-primary" : "text-slate-400 group-hover:text-primary/70"}`}>
                  {seg.timestamp}
                </div>
                <div className={`w-full aspect-video rounded flex items-center justify-center border transition-all duration-300 overflow-hidden relative ${
                  isActive ? "bg-primary/5 border-primary/20" : "bg-slate-50 border-slate-200 group-hover:border-primary/20 group-hover:bg-white"
                }`}>
                   <Play className={`h-3 w-3 transition-all duration-300 ${isActive ? "text-primary animate-pulse scale-125" : "text-slate-300 opacity-0 group-hover:opacity-100 group-hover:text-primary/50"}`} />
                </div>
                <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">{seg.duration}</span>
              </div>
              <div className="flex-1 space-y-3">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-black uppercase transition-colors ${isActive ? "text-primary" : "text-slate-900"}`}>{seg.scene_label}</span>
                      <div className="h-1 w-1 rounded-full bg-slate-200" />
                      <span className="text-[10px] font-black text-slate-400 tabular-nums">{seg.accuracy}% ACC</span>
                   </div>
                   <ConfidenceChip level={seg.confidence.toLowerCase() as any} />
                </div>
                
                <p className={`text-[11px] leading-relaxed transition-colors ${isActive ? "text-slate-800 font-bold" : "text-slate-500 font-medium"}`}>
                   {seg.summary}
                </p>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-50">
                   <div className="space-y-1">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Action</span>
                      <ul className="space-y-0.5">
                         {seg.actions.map((a: string, i: number) => (
                           <li key={i} className={`text-[9px] font-bold ${isActive ? "text-slate-700" : "text-slate-400"}`}>ΓÇó {a}</li>
                         ))}
                      </ul>
                   </div>
                   <div className="space-y-1">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Key Analysis</span>
                      <div className="flex flex-wrap gap-1">
                         {seg.key_analysis.map((e: string, i: number) => (
                           <span key={i} className={`px-1.5 py-0.5 rounded-[4px] border text-[8px] font-black uppercase transition-all ${
                             isActive ? "bg-primary/5 text-primary border-primary/10" : "bg-slate-50 text-slate-400 border-slate-100"
                           }`}>{e}</span>
                         ))}
                      </div>
                   </div>
                </div>

                <div className="flex items-center gap-2 mt-2 opacity-50 group-hover:opacity-100 transition-opacity">
                   <span className="px-1.5 py-0.5 bg-slate-100 text-[8px] font-bold text-slate-500 uppercase rounded">{seg.actor}</span>
                   <span className="px-1.5 py-0.5 bg-slate-100 text-[8px] font-bold text-slate-500 uppercase rounded">{seg.location}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="p-4 border-t bg-white flex flex-col gap-2">
         <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">Visual Narrative Chain</span>
            <div className="flex items-center gap-1">
               <div className="h-1 w-1 rounded-full bg-slate-200" />
               <div className="h-1 w-1 rounded-full bg-slate-200" />
               <div className="h-1 w-1 rounded-full bg-slate-200" />
            </div>
         </div>
      </div>
    </div>
  );
}

export default function CaseWorkspacePage() {
  const { caseId } = useParams();
  const [activeTab, setActiveTab] = useState("Evidence Review");
  const [files, setFiles] = useState(evidenceFiles);
  const [batches, setBatches] = useState(evidenceBatches);

  return (
    <AppLayout>
      <div className="flex flex-col h-full bg-slate-50/10 h-screen overflow-hidden">
        <div className="bg-white border-b px-6 py-4 flex items-center justify-between shrink-0 shadow-sm relative z-30">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-slate-900 rounded-lg flex items-center justify-center shadow-lg border-2 border-slate-800">
               <Brain className="h-6 w-6 text-primary animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-bold text-slate-400 tracking-[0.2em] uppercase">Safety Investigation Case</span>
                <StatusChip status="in_progress" />
