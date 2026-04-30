import React, { useState, useMemo, useEffect } from 'react';
import { 
  Database, Info, ChevronDown, Shield, FileText, Plus, Users, 
  MessageSquare, Clock, Brain, AlertTriangle, Activity, Search,
  Video as VideoIcon, Mic as AudioIcon, LayoutGrid, Play, Wind, Cpu, Footprints 
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { SectionHeader, KVP, StatusPill } from "../WorkspacePrimitives";
import { ConfidenceChip } from "../../StatusChip";
import { SECTION_DESCRIPTIONS, videoExtractionRefined } from "@/data/mockData";
import { supabase } from "@/lib/supabase";
import { normalizeAudioTimestamp } from "@/lib/normalizeAudioTimestamp";

export function ImageExtractionConsole({ file }: { file: any }) {
  const [viewMode, setViewMode] = useState<"Structured" | "JSON">("Structured");
  const [expandedSections, setExpandedSections] = useState<string[]>(["General Detection"]);
  
  const properties = useMemo(() => ({
     "General Detection": {
        "Incident Context": "Conveyor Belt zone at Section 14",
        "Environmental Condition": "Low light, heavy coal dust, visible vibration",
        "Modality Strength": "High (Clear visual evidence of tear)",
        "Equipment Serial": "C-14-MS-001"
     },
     "Environment & PPE": {
        "Hazard Zone": "Zone 4 (Active Machinery)",
        "Visibility": "Estimated 8 meters",
        "Dust Level": "Critical (Potential sensor interference)",
        "PPE Presence": "Operator detected at 14:22:15 wearing Level 2 Gear"
     },
     "AI Extraction Metadata": {
        "Model": "Vision Analysis Matrix v4.2",
        "Confidence": "94%",
        "Tokens": 1420,
        "Run ID": "img-node-1423"
     }
  }), []);

  const toggle = (s: string) => setExpandedSections(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="sticky top-0 z-40 bg-white border-b px-5 py-4 flex items-center justify-between shrink-0 shadow-sm">
         <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] leading-none">Protocol Matrix v2.1</span>
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter mt-1 opacity-60">Visual Extraction Matrix</span>
         </div>
         <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-md border shadow-inner">
            <button onClick={() => setViewMode("Structured")} className={cn("px-2 py-1 text-[8px] font-black uppercase rounded transition-all", viewMode === "Structured" ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600")}>Structured</button>
            <button onClick={() => setViewMode("JSON")} className={cn("px-2 py-1 text-[8px] font-black uppercase rounded transition-all", viewMode === "JSON" ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600")}>JSON</button>
         </div>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar">
         {viewMode === "Structured" ? (
            <div className="flex flex-col divide-y divide-slate-100 border-b">
               {Object.entries(properties).map(([section, items]) => (
                  <div key={section} className="flex flex-col">
                     <SectionHeader 
                        title={section} 
                        icon={Database} 
                        isOpen={expandedSections.includes(section)}
                        onToggle={() => toggle(section)}
                        description={SECTION_DESCRIPTIONS[section]}
                     />
                     {expandedSections.includes(section) && (
                        <div className="p-5 space-y-1 bg-white animate-in fade-in slide-in-from-top-1">
                           {Object.entries(items).map(([label, value]) => (
                              <KVP key={label} label={label} value={value} />
                           ))}
                        </div>
                     )}
                  </div>
               ))}
               
               <div className="p-5 bg-slate-900 text-white relative overflow-hidden group border-t-0">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[60px] rounded-full pointer-events-none" />
                  <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] block mb-4 relative z-10">Forensic Integrity Score</span>
                  <div className="flex items-baseline gap-2 relative z-10">
                     <span className="text-4xl font-black text-white group-hover:scale-110 transition-transform duration-500">92</span>
                     <span className="text-[11px] font-black text-slate-500 uppercase">Perception Confidence</span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-800 relative z-10 flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        <Shield className="h-3.5 w-3.5 text-emerald-500" />
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Signed & Encrypted</span>
                     </div>
                     <span className="text-[8px] font-bold text-slate-600 uppercase">SHA-256 Validated</span>
                  </div>
               </div>
            </div>
         ) : (
            <div className="p-4 bg-[#0d1117] min-h-full">
               <pre className="text-[10px] font-mono text-[#79c0ff] bg-[#0d1117] p-6 leading-relaxed overflow-auto custom-scrollbar">
                  {JSON.stringify(properties, null, 2)}
               </pre>
            </div>
         )}
      </div>
    </div>
  );
}

export function DocumentExtractionConsole({ file }: { file: any }) {
  const [activeTab, setActiveTab] = useState<"Fact Extraction">("Fact Extraction");
  const [viewMode, setViewMode] = useState<"Structured" | "JSON">("Structured");
  const [expandedSections, setExpandedSections] = useState<string[]>(["Entity Extraction"]);
  
  const properties = useMemo(() => ({
     "Entity Extraction": {
        "Document Class": "Incident Report Form B-12",
        "Author": "Sarah J. (Safety Officer)",
        "Signature Status": "Verified (Digital Hash)",
        "Entity Mentions": "Ahmed, Sarah, Section 14, Conveyor A-1"
     },
     "Semantic Summary": {
        "Key Findings": "Structural integrity compromised at joint 14A. Immediate cessation recommended.",
        "Timeline Reference": "Event occurred at 14:22:15 local time.",
        "Risk Level": "Level 4 (Life Critical)",
        "Policy Violations": "None detected based on report content"
     },
     "Forensic Metadata": {
        "OCR Engine": "Tesseract Matrix v5.0",
        "Confidence Score": "98.2%",
        "Source Integrity": "SHA-256 Validated",
        "Processing Time": "1.2s"
     }
  }), []);

  const factExtractionData = useMemo(() => [
    { fact: "The document is titled 'How to Overcome the Predictable Crises of Growth'.", context: "The title of the document." },
    { fact: "The authors are bestselling authors of 'Profit from the Core'.", context: "The previous work of the authors." },
    { fact: "The document is written by Chris Zook and James Allen.", context: "The authors of the document." }
  ], []);

  const toggle = (s: string) => setExpandedSections(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="sticky top-0 z-40 bg-white border-b px-5 py-4 flex items-center justify-between shrink-0 shadow-sm">
         <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] leading-none">Protocol Matrix v2.1</span>
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter mt-1 opacity-60">Forensic Document Extraction</span>
         </div>
         <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-md border shadow-inner">
               {(["Fact Extraction"] as const).map(tab => (
                 <button 
                   key={tab}
                   onClick={() => setActiveTab(tab)} 
                   className={cn("px-3 py-1 text-[8px] font-black uppercase rounded transition-all", activeTab === tab ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600")}
                 >
                   {tab}
                 </button>
               ))}
            </div>


         </div>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar">


         {activeTab === "Fact Extraction" && (
            <div className="p-5 space-y-6 animate-in fade-in slide-in-from-top-1">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Page</span>
                     <select className="h-8 px-2 bg-slate-100 border border-slate-200 rounded-sm text-[10px] font-bold outline-none cursor-pointer">
                        <option>1</option>
                        <option>2</option>
                        <option>3</option>
                     </select>
                  </div>
                  <button className="flex items-center gap-1.5 text-primary hover:text-primary/80 transition-colors">
                     <Plus className="h-3 w-3" />
                     <span className="text-[10px] font-black uppercase tracking-widest">Add fact manually</span>
                  </button>
               </div>

               <div className="space-y-4">
                  {factExtractionData.map((f, i) => (
                    <div key={i} className="p-5 bg-slate-50/80 border border-slate-100 rounded-lg hover:border-slate-200 transition-all group">
                       <div className="space-y-4">
                          <div className="space-y-1.5">
                             <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.1em]">Fact</span>
                             <p className="text-[11px] font-medium text-slate-800 leading-relaxed">{f.fact}</p>
                          </div>
                          <div className="space-y-1.5">
                             <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.1em]">Context</span>
                             <p className="text-[11px] font-medium text-slate-600 leading-relaxed italic">{f.context}</p>
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
         )}
      </div>
    </div>
  );
}

export function AudioExtractionConsole({ file, onJump, currentTime }: { file: any, onJump: (s: number) => void, currentTime: number }) {
  const [activeTab, setActiveTab] = useState<"Audio Derivation" | "Metadata">("Audio Derivation");
  const [derivationData, setDerivationData] = useState<any>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchDerivation();
  }, [file.id]);

  const fetchDerivation = async () => {
    setIsLoading(true);
    try {
      // 1. Try specialized table
      const { data, error } = await supabase
        .from('evidence_audio_derivation_outputs')
        .select('*')
        .eq('evidence_id', file.id)
        .eq('is_active', true)
        .single();
      
      if (data) {
        setDerivationData(data);
        setIsDemo(data.is_demo_override);
      } else {
        // 2. Fallback to file metadata
        if (file?.metadata?.audio_derivation) {
           setDerivationData(file.metadata.audio_derivation);
           setIsDemo(file.metadata.audio_derivation.is_demo_override);
        } else {
           // 3. Last ditch: check if we can fetch the file again to get latest metadata
           const { data: latestFile } = await supabase.from('evidence_files').select('metadata').eq('id', file.id).single();
           if (latestFile?.metadata?.audio_derivation) {
              setDerivationData(latestFile.metadata.audio_derivation);
              setIsDemo(latestFile.metadata.audio_derivation.is_demo_override);
           } else {
              setDerivationData(null);
              setIsDemo(false);
           }
        }
      }
    } catch (e) {
      // On error (e.g. table missing), still try metadata fallback
      if (file?.metadata?.audio_derivation) {
        setDerivationData(file.metadata.audio_derivation);
        setIsDemo(file.metadata.audio_derivation.is_demo_override);
      } else {
        setDerivationData(null);
        setIsDemo(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const audioExtractionData = useMemo(() => ({
    recording_meta: {
      file_name: file.name,
      source_type: "Emergency Radio Channel 4",
      duration: "04:22",
      language: "Indonesian / English",
      channel_type: "Mono (Forensic Optimized)",
      recording_type: "Site Alpha Control Room",
      audio_quality: "High",
      noise_level: "Moderate (Conveyor Background)",
      overlap_level: "Low"
    },
    speaker_profiles: [
      { speaker_id: "SPK_01", speaker_label: "Operator A", probable_role: "Field Supervisor", confidence: "High", speaking_time: "02:15", speaking_style: "Urgent, Command style", assertiveness: "High", stress_level: "Elevated" },
      { speaker_id: "SPK_02", speaker_label: "Control Room", probable_role: "Safety Dispatcher", confidence: "High", speaking_time: "01:45", speaking_style: "Analytical, Following protocol", assertiveness: "High", stress_level: "Stable" }
    ],
    communication_events: [
      { timestamp: "00:05", event_type: "Initial Contact", source_speaker: "SPK_01", target_speaker: "SPK_02", content_summary: "Reporting vibration anomalies on Section 14", urgency: "Medium", response_status: "Verified" },
      { timestamp: "02:14", event_type: "Escalation", source_speaker: "SPK_01", target_speaker: "SPK_02", content_summary: "Visual confirmation of structural tear", urgency: "Critical", response_status: "Immediate Action" }
    ],
    factual_statements: [
      { timestamp: "00:10", speaker: "Operator A", fact_text: "Vibration threshold exceeded at Zone B-14", statement_type: "Observation", observed_or_claimed: "Observed", confidence: "High" },
      { timestamp: "02:18", speaker: "Operator A", fact_text: "Structural rupture visible on belt section 14A", statement_type: "Declaration", observed_or_claimed: "Observed", confidence: "High" }
    ],
    timeline_events: [
      { timestamp: "14:10", event_summary: "Initial vibration alert logged by operator", actor: "Ahmed (Operator A)" },
      { timestamp: "14:23", event_summary: "Direct order for emergency stop given", actor: "Supervisor Sarah" }
    ],
    human_performance_signals: { fatigue_clues: [], stress_signals: ["Voice pitch increase during escalation"], coordination_gaps: ["5 second delay in control room response"] },
    risk_and_procedure_clues: { protocol_mentions: ["Section 14 Safety Protocol", "Lockout-Tagout"], safety_warnings: ["Emergency stop bypass not used"] },
    review_meta: { low_confidence_segments: [12, 145], needs_human_review: ["Check transcription for 'tensioner' vs 'tension'"], confidence: "92%" }
  }), [file]);

  const audioDiarizationData = useMemo(() => [
    { 
      segment_id: "seg_1", 
      speaker_id: "SPK_01", 
      speaker_label: "Operator A", 
      start_time: "00:04", 
      end_time: "00:12", 
      duration: "0:08", 
      text: "Control, ini Operator A. Getaran di Section 14 melebihi batas aman. Mohon dicek.", 
      confidence: "High", 
      theme_tag: "Safety",
      interaction_type: "Declaration",
      paralinguistics: ["urgent tone", "stressed breathing"],
      extracted_action_or_fact: "Operator reports excessive vibration on conveyor Section 14.",
      flags: [] 
    },
    { 
      segment_id: "seg_2", 
      speaker_id: "SPK_02", 
      speaker_label: "Control Room", 
      start_time: "00:15", 
      end_time: "00:22", 
      duration: "0:07", 
      text: "Diterima Operator A. Sensor kami juga menunjukkan anomali. Standby.", 
      confidence: "High", 
      theme_tag: "Coordination",
      interaction_type: "Instruction",
      paralinguistics: ["calm tone", "standard protocol voice"],
      extracted_action_or_fact: "Control Room confirms anomaly and instructs operator to standby.",
      flags: [] 
    },
    { 
      segment_id: "seg_3", 
      speaker_id: "SPK_01", 
      speaker_label: "Operator A", 
      start_time: "02:14", 
      end_time: "02:22", 
      duration: "0:08", 
      text: "Kontrol! Belt Section 14 robek! Terjadi tumpahan material berat! E-Stop!", 
      confidence: "High", 
      theme_tag: "Emergency",
      interaction_type: "Urgent Command",
      paralinguistics: ["shouting", "high stress"],
      extracted_action_or_fact: "Operator reports catastrophic belt failure and requests immediate E-Stop.",
      flags: ["URGENT", "STRESS"] 
    }
  ], []);

  const normalizedExtraction = useMemo(() => {
    const raw = audioExtractionData;
    return {
      audio_id: "AUD_" + (file?.id?.slice(0, 4) || "001"),
      case_id: "CS-2026-" + Math.floor(1000 + Math.random() * 9000),
      modality: "audio",
      audio_properties: {
        file_name: raw.recording_meta.file_name,
        source_type: raw.recording_meta.source_type,
        capture_time: "2026-04-12 14:30:22",
        source_device: raw.recording_meta.recording_type,
        location_hint: "Site Alpha - Zone B",
        duration: raw.recording_meta.duration,
        language: raw.recording_meta.language,
        channel_type: raw.recording_meta.channel_type,
        recording_type: raw.recording_meta.recording_type,
        audio_quality: raw.recording_meta.audio_quality,
        noise_level: raw.recording_meta.noise_level,
        overlap_level: raw.recording_meta.overlap_level
      },
      extraction_summary: {
        transcript_summary: "Emergency report regarding Section 14 conveyor belt failure.",
        speaker_profiles: (raw?.speaker_profiles || []).map(s => ({
          ...s,
          label: s.speaker_label,
          role: s.probable_role,
          stress: s.stress_level
        })),
        communication_events: raw.communication_events,
        factual_statements: raw.factual_statements || [],
        timeline_events: raw.timeline_events || [],
        human_performance_signals: raw.human_performance_signals,
        risk_and_procedure_clues: raw.risk_and_procedure_clues,
        review_meta: raw.review_meta
      }
    };
  }, [file, audioExtractionData]);

  const normalizedScene = useMemo(() => {
    if (derivationData) {
      // Map properties to ensure consistency
      const mappedDiarization = (derivationData.dialogue_map || []).map((seg: any) => ({
        ...seg,
        start_time: seg.start_time || seg.start_dialog,
        end_time: seg.end_time || seg.end_dialog,
        text: seg.text || seg.verbatim_text
      }));

      return {
        scene_session: {
          speaker_count: derivationData.investigation_metadata?.total_speakers_detected || 0,
          full_diarization: mappedDiarization
        }
      };
    }
    return {
      scene_session: {
        speaker_count: audioExtractionData.speaker_profiles.length,
        full_diarization: audioDiarizationData
      }
    };
  }, [audioDiarizationData, audioExtractionData.speaker_profiles.length, derivationData]);

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="sticky top-0 z-40 bg-[#f4f7f9] border-b border-slate-200 px-6 pt-3 flex flex-col shrink-0">
          <div className="flex items-center border-b border-slate-200 relative">
             {(["Audio Derivation", "Metadata"] as const).map((tab, idx) => (
               <button 
                 key={tab}
                 onClick={() => setActiveTab(tab)} 
                 className={cn(
                   "py-3.5 text-[10px] font-bold uppercase tracking-widest transition-all relative",
                   idx === 0 ? "pr-5" : "px-5",
                   activeTab === tab ? "text-slate-900" : "text-slate-400 hover:text-slate-600"
                 )}
               >
                 {tab}
                 {activeTab === tab && (
                   <div className="absolute -bottom-[1px] left-0 right-0 h-0.5 bg-slate-900 z-20" />
                 )}
               </button>
             ))}
             {isDemo && (
                <div className="ml-auto flex items-center gap-2 mb-1">
                   <div className="px-2 py-0.5 bg-blue-600 text-white text-[8px] font-black uppercase tracking-widest rounded-sm shadow-sm">DEMO DERIVATION</div>
                </div>
             )}
          </div>


      </div>

      <div className="flex-1 overflow-auto custom-scrollbar">


         {activeTab === "Audio Derivation" && (
           <AudioSceneSession data={normalizedScene} currentTime={currentTime} onJump={onJump} isDemo={isDemo} />
         )}

         {activeTab === "Metadata" && (
           <div className="p-6 space-y-8 animate-in fade-in duration-500">
             {derivationData && (
                <div className="space-y-4">
                   <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] border-b pb-2">Derivation Context</h4>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-slate-50 rounded-sm border border-slate-100">
                         <span className="text-[8px] font-black text-slate-400 uppercase block mb-1">Total Speakers</span>
                         <span className="text-[10px] font-black text-slate-700">{derivationData.investigation_metadata?.total_speakers_detected}</span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-sm border border-slate-100">
                         <span className="text-[8px] font-black text-slate-400 uppercase block mb-1">Source</span>
                         <span className="text-[10px] font-black text-blue-600">{derivationData.output_source}</span>
                      </div>
                   </div>
                </div>
             )}
             <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] border-b pb-2">Technical Properties</h4>
                <div className="grid grid-cols-1 gap-4">
                   <div className="flex justify-between items-center py-1 border-b border-slate-50">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">File Name</span>
                      <span className="text-[11px] font-bold text-slate-700">{file.name}</span>
                   </div>
                   <div className="flex justify-between items-center py-1 border-b border-slate-50">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Format</span>
                      <span className="text-[11px] font-bold text-slate-700">WAV (Pulse Code Modulation)</span>
                   </div>
                   <div className="flex justify-between items-center py-1 border-b border-slate-50">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sample Rate</span>
                      <span className="text-[11px] font-bold text-slate-700">44,100 Hz</span>
                   </div>
                   <div className="flex justify-between items-center py-1 border-b border-slate-50">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Channels</span>
                      <span className="text-[11px] font-bold text-slate-700">Mono (Channel 1)</span>
                   </div>
                </div>
             </div>

             <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] border-b pb-2">Forensic Integrity</h4>
                <div className="p-4 bg-slate-50 rounded-sm border border-dashed border-slate-200">
                   <div className="flex flex-col gap-2">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">SHA-256 Fingerprint</span>
                      <code className="text-[9px] font-mono text-slate-600 break-all leading-relaxed bg-white p-2 border rounded-sm">
                        e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
                      </code>
                   </div>
                </div>
             </div>

             <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] border-b pb-2">AI Processing Meta</h4>
                <div className="grid grid-cols-2 gap-4">
                   <div className="p-3 bg-slate-50 rounded-sm border border-slate-100">
                      <span className="text-[8px] font-black text-slate-400 uppercase block mb-1">Model</span>
                      <span className="text-[10px] font-black text-slate-700">Whisper-V3-Turbo</span>
                   </div>
                   <div className="p-3 bg-slate-50 rounded-sm border border-slate-100">
                      <span className="text-[8px] font-black text-slate-400 uppercase block mb-1">Confidence</span>
                      <span className="text-[10px] font-black text-emerald-600">98.4%</span>
                   </div>
                </div>
             </div>
           </div>
         )}
      </div>
    </div>
  );
}

export function AudioExtractionStructured({ data, onJump }: { data: any, onJump: (s: number) => void }) {
  const [expandedSections, setExpandedSections] = useState<string[]>(["Audio Properties"]);
  const toggle = (s: string) => setExpandedSections(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);

  return (
    <div className="flex flex-col divide-y divide-slate-100 border-b">
      <div className="flex flex-col">
         <SectionHeader 
            title="Audio Properties" 
            icon={AudioIcon} 
            isOpen={expandedSections.includes("Audio Properties")}
            onToggle={() => toggle("Audio Properties")}
            description={SECTION_DESCRIPTIONS["Audio Properties"]}
         />
         {expandedSections.includes("Audio Properties") && (
           <div className="p-5 grid grid-cols-2 gap-4 bg-white animate-in fade-in slide-in-from-top-1">
             <KVP label="Format" value={data.audio_properties.channel_type} />
             <KVP label="Duration" value={data.audio_properties.duration} />
             <KVP label="Quality" value={data.audio_properties.audio_quality} badge={{ text: 'Verified', className: 'bg-emerald-50 text-emerald-600 border-emerald-100' }} />
             <KVP label="Language" value={data.audio_properties.language} />
             <KVP label="Noise Floor" value={data.audio_properties.noise_level} />
             <KVP label="Source Device" value={data.audio_properties.source_device} />
           </div>
         )}
      </div>

      <div className="flex flex-col">
         <SectionHeader 
            title="Speaker Profiles" 
            icon={Users} 
            count={data.extraction_summary.speaker_profiles.length} 
            isOpen={expandedSections.includes("Speaker Profiles")}
            onToggle={() => toggle("Speaker Profiles")}
            description={SECTION_DESCRIPTIONS["Speaker Profiles"]}
         />
         {expandedSections.includes("Speaker Profiles") && (
           <div className="p-5 space-y-3 bg-white animate-in fade-in slide-in-from-top-1">
              {data.extraction_summary.speaker_profiles.map((s: any) => (
                <div key={s.speaker_id} className="p-4 border rounded-sm bg-slate-50/40 hover:bg-white hover:border-slate-300 transition-all group">
                   <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                         <div className="h-8 w-8 rounded-full bg-slate-900 flex items-center justify-center text-[10px] font-black text-white ">
                            {s.speaker_id === 'SPK_01' ? 'OP' : 'CR'}
                         </div>
                         <div className="flex flex-col">
                            <span className="text-[11px] font-black text-slate-900 uppercase tracking-tight leading-none">{s.label}</span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-1">{s.role}</span>
                         </div>
                      </div>
                      <ConfidenceChip level={s.confidence.toLowerCase() as any} />
                   </div>
                   <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                      <KVP label="Talk Time" value={s.speaking_time} />
                      <KVP label="Style" value={s.speaking_style} />
                      <KVP label="Assertiveness" value={s.assertiveness} />
                      <KVP label="Stress level" value={s.stress} badge={s.stress.includes('High') ? { text: 'Alert', className: 'bg-rose-50 text-rose-600 border-rose-100' } : undefined} />
                   </div>
                </div>
              ))}
           </div>
         )}
      </div>

      <div className="flex flex-col">
         <SectionHeader 
            title="Communication Events" 
            icon={MessageSquare} 
            count={data.extraction_summary.communication_events.length} 
            isOpen={expandedSections.includes("Communication Events")}
            onToggle={() => toggle("Communication Events")}
            description={SECTION_DESCRIPTIONS["Communication Events"]}
         />
         {expandedSections.includes("Communication Events") && (
           <div className="p-5 space-y-2.5 bg-white animate-in fade-in slide-in-from-top-1">
              {data.extraction_summary.communication_events.map((e: any, i: number) => (
                <div key={i} className="flex gap-4 p-3 hover:bg-slate-50 rounded-sm transition-all cursor-pointer group" onClick={() => onJump(parseInt(e.timestamp.split(':')[1]))}>
                   <div className="flex flex-col items-center shrink-0 pt-0.5">
                       <span className="text-[10px] font-black text-slate-900 bg-slate-100 px-1.5 py-1 rounded leading-none tabular-nums group-hover:bg-slate-900 group-hover:text-white transition-all shadow-sm border border-slate-200">{e.timestamp}</span>
                      <div className="w-[1.5px] flex-1 bg-slate-100 my-2" />
                   </div>
                   <div className="flex-1 space-y-1.5">
                      <div className="flex items-center gap-2">
                         <StatusPill text={e.event_type} type={e.urgency === 'Critical' ? 'urgent' : 'default'} />
                         <span className="text-[10px] font-bold text-slate-400">Response: {e.response_status}</span>
                      </div>
                      <p className="text-[11px] font-bold text-slate-800 leading-snug pr-2 group-hover:text-primary transition-colors">{e.content_summary}</p>
                   </div>
                </div>
              ))}
           </div>
         )}
      </div>

      <div className="flex flex-col">
         <SectionHeader 
            title="Timeline & Facts" 
            icon={Clock} 
            count={data.extraction_summary.factual_statements.length} 
            isOpen={expandedSections.includes("Timeline & Facts")}
            onToggle={() => toggle("Timeline & Facts")}
            description={SECTION_DESCRIPTIONS["Timeline & Facts"]}
         />
         {expandedSections.includes("Timeline & Facts") && (
           <div className="p-5 space-y-6 bg-white animate-in fade-in slide-in-from-top-1">
              <div className="space-y-4">
                 <span className="text-[10px] font-black text-slate-900 border-b border-slate-900 pb-1 uppercase tracking-widest block">Validated Statements</span>
                 {data.extraction_summary.factual_statements.map((f: any, i: number) => (
                    <div key={i} className="relative pl-4">
                       <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 rounded-full" />
                       <div className="flex items-center gap-2 mb-1.5">
                          <StatusPill text={f.statement_type} type="observed" />
                           <span className="text-[10px] font-black text-slate-900 tabular-nums bg-slate-100 px-1.5 py-0.5 rounded-sm">[{f.timestamp}]</span>
                          <ConfidenceChip level={(f.confidence || "high").toLowerCase() as any} />
                       </div>
                       <p className="text-[11px] font-bold text-slate-900 leading-relaxed italic">"{f.fact_text}"</p>
                       <div className="mt-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest">— {f.speaker} ({f.observed_or_claimed})</div>
                    </div>
                 ))}
              </div>
              <div className="space-y-4">
                 <span className="text-[10px] font-black text-slate-400 border-b border-slate-100 pb-1 uppercase tracking-widest block">Chronological Flow</span>
                 <div className="space-y-3">
                   {data.extraction_summary.timeline_events.map((t: any, i: number) => (
                      <div key={i} className="flex gap-3">
                          <span className="text-[10px] font-black text-slate-900 tabular-nums shrink-0 bg-slate-50 px-1.5 py-0.5 rounded-sm">{t.timestamp}</span>
                         <div className="flex-1">
                            <p className="text-[11px] font-bold text-slate-700 leading-snug">{t.event_summary}</p>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mt-0.5">Actor: {t.actor}</span>
                         </div>
                      </div>
                   ))}
                 </div>
              </div>
           </div>
         )}
      </div>

      <div className="flex flex-col">
         <SectionHeader 
            title="Risks, Gaps, Review" 
            icon={Brain} 
            isOpen={expandedSections.includes("Risks, Gaps, Review")}
            onToggle={() => toggle("Risks, Gaps, Review")}
            description={SECTION_DESCRIPTIONS["Risks, Gaps, Review"]}
         />
         {expandedSections.includes("Risks, Gaps, Review") && (
           <div className="p-5 space-y-6 bg-white animate-in fade-in slide-in-from-top-1">
              <div className="space-y-3">
                 <div className="flex items-center gap-2 text-rose-600 border-b border-rose-100 pb-1.5">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    <span className="text-[11px] font-black uppercase tracking-wider">Risk & Procedure Clues</span>
                 </div>
                 <div className="grid grid-cols-1 gap-2">
                    {Object.entries(data.extraction_summary.risk_and_procedure_clues).map(([key, mentions]: any) => (
                       mentions.length > 0 && (
                         <div key={key} className="p-3 bg-slate-50 border rounded-sm">
                            <span className="text-[9px] font-black text-slate-400 uppercase block mb-1.5">{key.replace(/_/g, ' ')}</span>
                            <div className="space-y-1.5">
                               {mentions.map((m: string, i: number) => (
                                  <div key={i} className="flex items-start gap-2 text-[10px] font-bold text-slate-700 leading-tight">
                                     <div className="h-1 w-1 bg-slate-400 rounded-full mt-1.5 shrink-0" />
                                     {m}
                                  </div>
                               ))}
                            </div>
                         </div>
                       )
                    ))}
                 </div>
              </div>

              <div className="space-y-3">
                 <div className="flex items-center gap-2 text-amber-600 border-b border-amber-100 pb-1.5">
                    <Activity className="h-3.5 w-3.5" />
                    <span className="text-[11px] font-black uppercase tracking-wider">Human Performance Signals</span>
                 </div>
                 <div className="space-y-2">
                    {Object.entries(data.extraction_summary.human_performance_signals).map(([key, signals]: any) => (
                       signals.length > 0 && (
                         <div key={key} className="flex flex-col gap-1 pr-2">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{key.replace(/_/g, ' ')}</span>
                            <div className="space-y-1">
                               {signals.map((s: string, i: number) => (
                                  <div key={i} className="p-2 bg-amber-50/50 border border-amber-100/50 rounded-sm text-[10px] font-bold text-amber-800 leading-snug">
                                     {s}
                                  </div>
                               ))}
                            </div>
                         </div>
                       )
                    ))}
                 </div>
              </div>

              <div className="bg-slate-900 rounded-sm p-5 text-white  relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[60px] rounded-full pointer-events-none" />
                 <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] block mb-3 relative z-10">Review Status Matrix</span>
                 <div className="space-y-3 relative z-10">
                    <div className="flex flex-col gap-1.5">
                       <span className="text-[9px] font-black text-slate-500 uppercase">Critical Review Triggers:</span>
                       <div className="space-y-1">
                          {data.extraction_summary.review_meta.needs_human_review.map((r: string, i: number) => (
                             <div key={i} className="flex items-center gap-2 text-[10px] font-bold text-slate-300">
                                <div className="h-1 w-1 bg-amber-400 rounded-full" />
                                {r}
                             </div>
                          ))}
                       </div>
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-700/50 pt-4">
                       <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-slate-400 uppercase">Confidence:</span>
                          <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[9px] font-black uppercase tracking-widest">{data.extraction_summary.review_meta.confidence}</span>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
         )}
      </div>
    </div>
  );
}

export function AudioSceneSession({ data, currentTime, onJump, isDemo }: { data: any, currentTime: number, onJump: (s: number) => void, isDemo?: boolean }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const getS = (s: string) => {
    if (!s) return 0;
    const parts = s.split(':').map(Number);
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    return Number(s) || 0;
  };

  const isSegmentActive = (start: string, end: string) => {
    return currentTime >= getS(start) && currentTime <= getS(end);
  };

  const filteredData = useMemo(() => {
    if (!data?.scene_session?.full_diarization) return [];
    return data.scene_session.full_diarization.filter((seg: any) => {
      const text = seg.text || seg.verbatim_text || "";
      const matchesSearch = text.toLowerCase().includes(searchQuery.toLowerCase());
      const segStart = getS(seg.start_time || seg.start_dialog);
      const filterStart = startTime ? getS(startTime) : 0;
      const filterEnd = endTime ? getS(endTime) : Infinity;
      return matchesSearch && segStart >= filterStart && segStart <= filterEnd;
    });
  }, [data, searchQuery, startTime, endTime]);

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="px-6 py-4 border-b border-slate-100 bg-white sticky top-0 z-30 flex flex-col gap-4">
         <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
               <span className="text-[11px] font-bold text-slate-900 uppercase tracking-tight">Conversation Flow</span>
               <div className="h-1 w-1 bg-slate-300 rounded-full" />
               <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400 uppercase tabular-nums tracking-tighter">
                  <span>{filteredData.length} Results</span>
               </div>
            </div>
         </div>
         <div className="flex gap-2">
            <div className="relative group flex-1">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
               <input 
                  type="text" 
                  placeholder="Search transcript content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50/50 border border-slate-100 px-9 py-2 text-[10px] font-medium focus:bg-white focus:border-slate-900 focus:ring-0 outline-none transition-all rounded-sm placeholder:text-slate-400"
               />
            </div>
            
            <div className="relative group w-[140px]">
               <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
               <select 
                  className="w-full bg-slate-50/50 border border-slate-100 pl-9 pr-8 py-2 text-[10px] font-bold uppercase tracking-tight focus:bg-white focus:border-slate-900 focus:ring-0 outline-none transition-all rounded-sm appearance-none cursor-pointer text-slate-600 truncate"
                  onChange={(e) => {
                    const val = e.target.value;
                    if (!val) {
                      setStartTime("");
                      setEndTime("");
                    } else {
                      const [s, eTime] = val.split('|');
                      setStartTime(s);
                      setEndTime(eTime);
                    }
                  }}
               >
                  <option value="">All Time</option>
                  {data.scene_session.full_diarization.map((seg: any) => (
                    <option key={seg.segment_id} value={`${seg.start_time}|${seg.end_time}`}>
                      {seg.start_time} — {seg.end_time}
                    </option>
                  ))}
               </select>
               <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 pointer-events-none" />
            </div>
         </div>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar p-4 space-y-4">
        {filteredData.map((seg: any, idx: number) => {
          const active = isSegmentActive(seg.start_time, seg.end_time);
          const nextSeg = filteredData[idx + 1];
          const isNext = !active && idx > 0 && isSegmentActive(filteredData[idx-1].start_time, filteredData[idx-1].end_time);

          return (
            <DiarizationSegment 
               key={seg.segment_id || idx}
               seg={seg}
               active={active}
               isNext={isNext}
               onJump={() => onJump(getS(seg.start_time || seg.start_dialog))}
            />
          );
        })}
      </div>
    </div>
  );
}

function DiarizationSegment({ seg, active, isNext, onJump }: { seg: any, active: boolean, isNext: boolean, onJump: () => void }) {
  const [isExpanded, setIsExpanded] = useState(active);

  // Auto-expand if it becomes active
  useEffect(() => {
    if (active) setIsExpanded(true);
  }, [active]);

  return (
    <div className="flex flex-col space-y-1">
      {isNext && (
        <div className="flex items-center gap-2 px-1 mb-1">
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Upcoming Sequence</span>
           <div className="h-[1px] flex-1 bg-slate-100" />
        </div>
      )}
      
      <div 
         className={cn(
            "flex flex-col border transition-all duration-300 cursor-pointer overflow-hidden rounded-sm",
            active ? "border-slate-900 bg-white shadow-md z-10" : 
            (isNext ? "border-slate-200 bg-slate-50/50 opacity-60" : "border-slate-100 hover:border-slate-300 bg-white shadow-sm")
         )}
         onClick={onJump}
      >
         {/* Top Row: compact enterprise style */}
         <div className="p-3 bg-white flex items-center justify-between border-b border-slate-50">
            <div className="flex items-center gap-2">
               <span className={cn(
                  "px-1.5 py-0.5 rounded-sm text-[9px] font-black tabular-nums tracking-widest border transition-colors",
                  active ? "bg-slate-900 text-white border-slate-900" : "bg-slate-50 text-slate-500 border-slate-100"
               )}>
                  {normalizeAudioTimestamp(seg.start_time || seg.start_dialog)} — {normalizeAudioTimestamp(seg.end_time || seg.end_dialog)}
               </span>
               <span className={cn(
                  "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-sm transition-colors",
                  active ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
               )}>
                  {seg.speaker_label}
               </span>
               {seg.theme_tag && (
                  <span className="px-2 py-0.5 bg-slate-50 text-slate-400 border border-slate-100 text-[8px] font-black uppercase tracking-widest rounded-sm">
                    {seg.theme_tag}
                  </span>
               )}
               {seg.interaction_type && (
                  <span className="px-2 py-0.5 bg-slate-50 text-slate-400 border border-slate-100 text-[8px] font-black uppercase tracking-widest rounded-sm hidden sm:inline-block">
                    {seg.interaction_type}
                  </span>
               )}
            </div>
            
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="p-1 hover:bg-slate-50 rounded transition-all"
            >
               <ChevronDown className={cn("h-3 w-3 text-slate-400 transition-transform", isExpanded ? "rotate-180" : "")} />
            </button>
         </div>

         {/* Body: Verbatim Text */}
         <div className="p-4 bg-white">
            <p className={cn(
               "text-[11px] font-bold leading-relaxed transition-colors",
               active ? "text-slate-900" : "text-slate-600"
            )}>
               {seg.text || seg.verbatim_text}
            </p>
         </div>

         {/* Expanded Section */}
         {isExpanded && (
            <div className="px-4 pb-4 bg-white space-y-3 animate-in fade-in slide-in-from-top-1">
               {seg.paralinguistics && Array.isArray(seg.paralinguistics) && seg.paralinguistics.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                     {seg.paralinguistics.map((p: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 bg-amber-50 text-amber-600 border border-amber-100 text-[8px] font-black uppercase tracking-widest rounded-sm">
                           {p}
                        </span>
                     ))}
                  </div>
               )}
               
               {seg.extracted_action_or_fact && (
                  <div className="mt-2 pt-3 border-t border-slate-100">
                     <div className="bg-slate-50 p-3 rounded-sm border border-slate-200 group/fact relative">
                        <div className="absolute top-0 right-0 p-1 opacity-20">
                           <Brain className="h-3 w-3" />
                        </div>
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Extracted Action / Fact</span>
                        <p className="text-[10px] font-bold text-slate-800 leading-snug">
                           {seg.extracted_action_or_fact}
                        </p>
                     </div>
                  </div>
               )}
            </div>
         )}
      </div>
    </div>
  );
}

export function VideoAnalysisPanel({ file, currentTime, onJump }: { file: any, currentTime: number, onJump: (s: number) => void }) {
  const [activeTab, setActiveTab] = useState<"Extraction" | "Diarization">("Extraction");
  const [viewMode, setViewMode] = useState<"Structured" | "JSON">("Structured");

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="sticky top-0 z-40 bg-white border-b px-5 py-4 flex items-center justify-between shrink-0 shadow-sm">
         <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] leading-none">Protocol Matrix v2.1</span>
            <div className="flex items-center gap-2 mt-1">
               <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter opacity-60">Video Layer Analysis</span>
               <div className="h-1 w-1 rounded-full bg-slate-200" />
               <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter opacity-60">ID: {file?.id?.slice(0,8) || "N/A"}</span>
            </div>
         </div>
         <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-md border shadow-inner">
               {(["Extraction", "Diarization"] as const).map(tab => (
                 <button 
                   key={tab}
                   onClick={() => setActiveTab(tab)} 
                   className={cn("px-3 py-1 text-[8px] font-black uppercase rounded transition-all", activeTab === tab ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600")}
                 >
                   {tab}
                 </button>
               ))}
            </div>
            
            {activeTab === "Extraction" && (
               <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-md border shadow-inner">
                  <button onClick={() => setViewMode("Structured")} className={cn("px-2 py-1 text-[8px] font-black uppercase rounded transition-all", viewMode === "Structured" ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600")}>Structured</button>
                  <button onClick={() => setViewMode("JSON")} className={cn("px-2 py-1 text-[8px] font-black uppercase rounded transition-all", viewMode === "JSON" ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600")}>JSON</button>
               </div>
            )}
         </div>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar">
        {activeTab === "Extraction" ? (
          <div className="flex flex-col min-h-full">
             <div className="flex-1">
                {viewMode === "Structured" ? (
                  <VideoExtractionStructured data={videoExtractionRefined} onJump={onJump} />
                ) : (
                  <div className="p-4 bg-[#0d1117] min-h-full">
                     <pre className="text-[10px] font-mono text-[#79c0ff] bg-[#0d1117] p-6 leading-relaxed overflow-auto custom-scrollbar">
                        {JSON.stringify(videoExtractionRefined, null, 2)}
                     </pre>
                  </div>
                )}
             </div>
          </div>
        ) : (
          <VideoSceneSession currentTime={currentTime} onJump={onJump} />
        )}
      </div>
    </div>
  );
}

export function VideoExtractionStructured({ data, onJump }: { data: typeof videoExtractionRefined, onJump: (s: number) => void }) {
  const [expandedSections, setExpandedSections] = useState<string[]>(["Video Session Meta"]);
  const toggle = (s: string) => setExpandedSections(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);

  return (
    <div className="flex flex-col divide-y divide-slate-100 border-b">
      <div className="flex flex-col">
        <SectionHeader 
           title="Video Session Meta" 
           icon={VideoIcon} 
           isOpen={expandedSections.includes("Video Session Meta")}
           onToggle={() => toggle("Video Session Meta")}
           description={SECTION_DESCRIPTIONS["Video Session Meta"]}
        />
        {expandedSections.includes("Video Session Meta") && (
          <div className="p-5 grid grid-cols-2 gap-y-3 gap-x-4 bg-white animate-in fade-in slide-in-from-top-1">
            <KVP label="Session" value={data.video_session_meta.session_name} />
            <KVP label="Duration" value={data.video_session_meta.duration} />
            <KVP label="Quality" value={data.video_session_meta.quality} />
            <KVP label="FPS" value={data.video_session_meta.fps} />
            <KVP label="Source" value={data.video_session_meta.camera_type} />
            <KVP label="Confidence" value={data.video_session_meta.confidence} />
          </div>
        )}
      </div>

      <div className="flex flex-col">
        <SectionHeader 
           title="Scene Timeline" 
           icon={LayoutGrid} 
           count={data.scene_timeline.length}
           isOpen={expandedSections.includes("Scene Timeline")}
           onToggle={() => toggle("Scene Timeline")}
           description={SECTION_DESCRIPTIONS["Scene Timeline"]}
        />
        {expandedSections.includes("Scene Timeline") && (
          <div className="p-5 bg-white space-y-2 animate-in fade-in slide-in-from-top-1">
            {data.scene_timeline.map((s) => (
              <div 
                key={s.id} 
                onClick={() => onJump(s.seconds)}
                className="p-2.5 rounded-sm border border-slate-50 bg-slate-50/30 hover:bg-white hover:border-primary/20 hover: cursor-pointer transition-all group"
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
        )}
      </div>

      <div className="flex flex-col">
        <SectionHeader 
           title="Actor Profiles" 
           icon={Users} 
           count={data.actor_profiles.length}
           isOpen={expandedSections.includes("Actor Profiles")}
           onToggle={() => toggle("Actor Profiles")}
           description={SECTION_DESCRIPTIONS["Actor Profiles"]}
        />
        {expandedSections.includes("Actor Profiles") && (
          <div className="p-5 bg-white space-y-2 animate-in fade-in slide-in-from-top-1">
            {data.actor_profiles.map((a) => (
              <div key={a.actor_id} className="p-3 rounded-sm border border-slate-100 bg-white ">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{a.actor_label}</span>
                  <ConfidenceChip level={a.confidence.toLowerCase() as any} />
                </div>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <KVP label="Role" value={a.probable_role} />
                  <KVP label="Screen Time" value={a.screen_time} />
                </div>
                <div className="p-2 rounded-sm bg-slate-50 border border-slate-100 space-y-1.5">
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
                      <span className={cn("px-1 rounded", a.stress.includes('High') ? 'bg-rose-100 text-rose-700' : 'text-slate-700')}>{a.stress}</span>
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col">
        <SectionHeader 
           title="Action / Event Detection" 
           icon={Activity} 
           count={data.action_events.length}
           isOpen={expandedSections.includes("Action / Event Detection")}
           onToggle={() => toggle("Action / Event Detection")}
           description={SECTION_DESCRIPTIONS["Action / Event Detection"]}
        />
        {expandedSections.includes("Action / Event Detection") && (
          <div className="p-5 bg-white space-y-1.5 animate-in fade-in slide-in-from-top-1">
            {data.action_events.map((e, i) => (
              <div 
                key={i} 
                onClick={() => onJump(e.seconds)}
                className="flex gap-3 p-2 rounded-sm hover:bg-slate-50 cursor-pointer group"
              >
                <span className="text-[10px] font-black text-slate-400 tabular-nums pt-0.5">{e.timestamp}</span>
                <div className="flex-1 space-y-1">
                   <div className="flex items-center gap-2">
                      <span className={cn(
                        "text-[9px] font-black uppercase px-1.5 py-0.5 rounded border",
                        e.severity === 'Critical' ? 'bg-rose-50 text-rose-700 border-rose-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                      )}>{e.event_type}</span>
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
        )}
      </div>

      <div className="flex flex-col">
        <SectionHeader 
           title="Environmental Observations" 
           icon={Wind} 
           isOpen={expandedSections.includes("Environmental Observations")}
           onToggle={() => toggle("Environmental Observations")}
           description={SECTION_DESCRIPTIONS["Environmental Observations"]}
        />
        {expandedSections.includes("Environmental Observations") && (
          <div className="p-5 bg-white space-y-3 animate-in fade-in slide-in-from-top-1">
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
        )}
      </div>

      <div className="flex flex-col">
        <SectionHeader 
           title="Equipment & Object Signals" 
           icon={Cpu} 
           isOpen={expandedSections.includes("Equipment & Object Signals")}
           onToggle={() => toggle("Equipment & Object Signals")}
           description={SECTION_DESCRIPTIONS["Equipment & Object Signals"]}
        />
        {expandedSections.includes("Equipment & Object Signals") && (
          <div className="p-5 bg-white grid gap-2 animate-in fade-in slide-in-from-top-1">
            {data.equipment_and_object_signals.map((o, i) => (
              <div key={i} onClick={() => onJump(o.seconds)} className="p-2.5 rounded-sm bg-slate-50 border border-transparent hover:bg-white hover:border-slate-100 hover: cursor-pointer group">
                <div className="flex items-center justify-between mb-1.5">
                   <span className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{o.object}</span>
                   <span className="text-[9px] font-black text-primary bg-primary/5 px-1.5 py-0.5 rounded">{o.timestamp}</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                   <span className={cn("px-1.5 py-0.5 text-[8px] font-black uppercase rounded", o.condition === 'Removed' || o.condition === 'Skewed' ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-500')}>{o.condition}</span>
                   <span className="text-[9px] font-bold text-slate-400 italic">"{o.anomaly}"</span>
                </div>
                <div className="flex items-center justify-between text-[9px] font-bold text-slate-400 uppercase">
                   <span>Actor: {o.actor}</span>
                   <ConfidenceChip level={o.confidence.toLowerCase() as any} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col">
        <SectionHeader 
           title="Human Performance Signals" 
           icon={Footprints} 
           isOpen={expandedSections.includes("Human Performance Signals")}
           onToggle={() => toggle("Human Performance Signals")}
           description={SECTION_DESCRIPTIONS["Human Performance Signals"]}
        />
        {expandedSections.includes("Human Performance Signals") && (
          <div className="p-5 bg-white space-y-3 animate-in fade-in slide-in-from-top-1">
            {Object.entries(data.human_performance_signals).map(([key, items]: [string, any]) => (
              <div key={key}>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.1em] mb-1.5 block">{key.replace(/_/g, ' ')}</span>
                <div className="space-y-1.5">
                  {items.map((item: any, i: number) => (
                    <div key={i} className="p-2 bg-slate-50 border border-slate-100 rounded-sm">
                       <div className="flex items-center justify-between mb-1">
                          <span className="text-[9px] font-black text-primary bg-primary/5 px-1.5 py-0.5 rounded tabular-nums">{item.timestamp}</span>
                          <span className="text-[8px] font-bold text-slate-400 uppercase">{item.category}</span>
                       </div>
                       <p className="text-[10px] font-bold text-slate-700 leading-snug">{item.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function VideoSceneSession({ currentTime, onJump }: { currentTime: number, onJump: (s: number) => void }) {
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
              className={cn(
                "group flex items-start gap-4 p-4 rounded-sm border transition-all duration-300 cursor-pointer relative overflow-hidden active:scale-[0.98]",
                isActive ? "bg-white border-primary ring-1 ring-primary/20 translate-x-1" : "bg-white border-slate-100 hover:border-primary/30 hover:bg-slate-50/50"
              )}
            >
              {isActive && <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />}
              {!isActive && <div className="absolute top-0 right-0 px-2 py-0.5 bg-slate-100 text-[8px] font-black text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity rounded-bl-lg border-l border-b border-slate-200">SEEK TO TIMESTAMP</div>}
              
              <div className="w-16 shrink-0 flex flex-col items-center gap-1.5 pt-0.5">
                <div className={cn("text-[10px] font-black tabular-nums tracking-tighter transition-colors", isActive ? "text-primary" : "text-slate-400 group-hover:text-primary/70")}>
                  {seg.timestamp}
                </div>
                <div className={cn(
                  "w-full aspect-video rounded flex items-center justify-center border transition-all duration-300 overflow-hidden relative",
                  isActive ? "bg-primary/5 border-primary/20" : "bg-slate-50 border-slate-200 group-hover:border-primary/20 group-hover:bg-white"
                )}>
                   <Play className={cn("h-3 w-3 transition-all duration-300", isActive ? "text-primary animate-pulse scale-125" : "text-slate-300 opacity-0 group-hover:opacity-100 group-hover:text-primary/50")} />
                </div>
                <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">{seg.duration}</span>
              </div>
              <div className="flex-1 space-y-3">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                      <span className={cn("text-[11px] font-black uppercase transition-colors", isActive ? "text-primary" : "text-slate-900")}>{seg.scene_label}</span>
                      <div className="h-1 w-1 rounded-full bg-slate-200" />
                      <span className="text-[10px] font-black text-slate-400 tabular-nums">{seg.accuracy}% ACC</span>
                   </div>
                   <ConfidenceChip level={seg.confidence.toLowerCase() as any} />
                </div>
                
                <p className={cn("text-[11px] leading-relaxed transition-colors", isActive ? "text-slate-800 font-bold" : "text-slate-500 font-medium")}>
                   {seg.summary}
                </p>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-50">
                   <div className="space-y-1">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Action</span>
                      <ul className="space-y-0.5">
                         {seg.actions.map((a: string, i: number) => (
                           <li key={i} className={cn("text-[9px] font-bold", isActive ? "text-slate-700" : "text-slate-400")}>• {a}</li>
                         ))}
                      </ul>
                   </div>
                   <div className="space-y-1">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Key Analysis</span>
                      <div className="flex flex-wrap gap-1">
                         {seg.key_analysis.map((e: string, i: number) => (
                           <span key={i} className={cn("px-1.5 py-0.5 rounded-[4px] border text-[8px] font-black uppercase transition-all", isActive ? "bg-primary/5 text-primary border-primary/10" : "bg-slate-50 text-slate-400 border-slate-100")}>{e}</span>
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
    </div>
  );
}
