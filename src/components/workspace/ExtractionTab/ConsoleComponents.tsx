import React, { useState, useMemo, useEffect, useRef } from 'react';
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
import { SECTION_DESCRIPTIONS, videoExtractionRefined, documentDerivationMock, imageDerivationMock, videoDerivationMock, audioDerivationMock } from "@/data/mockData";
import { supabase } from "@/lib/supabase";
import { normalizeAudioTimestamp } from "@/lib/normalizeAudioTimestamp";

const PROCESSING_PHASES = {
  audio: [
    "📄 Reading file structure and verifying audio quality...",
    "🎙️ Identifying speakers and mapping conversation timelines...",
    "🔍 Analyzing conversation context and organizing data findings"
  ],
  video: [
    "📄 Loading video stream and verifying file track integrity...",
    "👁️ Scanning frames and indexing visual timeline changes...",
    "🔍 Analyzing timeline sequence and compiling incident markers"
  ],
  image: [
    "📄 Processing image resolution and reading metadata layout...",
    "📐 Detecting environmental layout and structural boundaries...",
    "🔍 Framing spatial reference elements for the investigation review"
  ],
  document: [
    "📄 Reading file format and initializing text alignment...",
    "📝 Processing text content and indexing document chapters...",
    "🔍 Reviewing text context against operational information logs"
  ]
};

function AdaptiveProcessingStatus({ type }: { type: 'audio' | 'video' | 'image' | 'document' }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 4000);
    const t2 = setTimeout(() => setPhase(2), 8500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const phrases = PROCESSING_PHASES[type] || PROCESSING_PHASES.document;
  const currentText = phrases[phase];

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/60 backdrop-blur-[2px]">
      <div className="w-8 h-8 border-[3px] border-slate-200 border-t-slate-600 rounded-full animate-spin mb-5 shadow-sm" />
      <div className="bg-white/95 px-5 py-2.5 rounded shadow-sm border border-slate-100 flex items-center justify-center text-center max-w-sm">
        <p className="text-xs text-slate-500 font-medium">
          {currentText}
          {phase === 2 && (
            <span className="inline-flex tracking-widest animate-pulse ml-0.5">...</span>
          )}
        </p>
      </div>
    </div>
  );
}

function ImageProcessingSkeleton() {
  return (
    <div className="relative p-6 space-y-6 h-full overflow-hidden">
      <AdaptiveProcessingStatus type="image" />
      <div className="flex items-center justify-between mb-4 animate-pulse">
        <div className="h-4 w-40 bg-slate-200 rounded" />
        <div className="h-4 w-20 bg-slate-200 rounded" />
      </div>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col border border-slate-100 rounded-sm bg-white shadow-sm overflow-hidden animate-pulse">
            <div className="p-3 bg-white border-b border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-4 w-12 bg-slate-200 rounded-sm" />
                <div className="h-4 w-24 bg-slate-200 rounded-sm" />
              </div>
            </div>
            <div className="p-4">
              <div className="space-y-2 mb-4">
                <div className="h-3 w-full bg-slate-200 rounded" />
                <div className="h-3 w-5/6 bg-slate-200 rounded" />
              </div>
              <div className="mt-2 pt-3 border-t border-slate-100">
                <div className="bg-slate-50/50 p-3 rounded-sm border border-slate-100">
                   <div className="h-2 w-24 bg-slate-200 rounded mb-2" />
                   <div className="h-3 w-3/4 bg-slate-200 rounded" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AudioProcessingSkeleton() {
  return (
    <div className="relative p-6 space-y-6 h-full overflow-hidden">
      <AdaptiveProcessingStatus type="audio" />
      <div className="flex items-center justify-between mb-4 animate-pulse">
        <div className="h-4 w-48 bg-slate-200 rounded" />
        <div className="flex gap-2">
          <div className="h-6 w-32 bg-slate-200 rounded" />
          <div className="h-6 w-20 bg-slate-200 rounded" />
        </div>
      </div>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col border border-slate-100 rounded-sm bg-white shadow-sm overflow-hidden animate-pulse">
            <div className="p-3 bg-slate-50/50 border-b border-slate-100 flex items-center gap-3">
              <div className="h-4 w-16 bg-slate-200 rounded-sm" />
              <div className="h-4 w-24 bg-slate-200 rounded-full" />
            </div>
            <div className="p-4">
              <div className="space-y-2 mb-4">
                <div className="h-3 w-full bg-slate-200 rounded" />
                <div className="h-3 w-4/5 bg-slate-200 rounded" />
              </div>
              <div className="mt-2 pt-3 border-t border-slate-100">
                <div className="bg-slate-50 p-3 rounded-sm border border-slate-100">
                   <div className="h-2 w-32 bg-slate-200 rounded mb-2" />
                   <div className="h-3 w-2/3 bg-slate-200 rounded" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function VideoProcessingSkeleton() {
  return (
    <div className="relative p-6 space-y-6 h-full overflow-hidden">
      <AdaptiveProcessingStatus type="video" />
      <div className="flex items-center justify-between mb-4 animate-pulse">
        <div className="h-4 w-48 bg-slate-200 rounded" />
        <div className="h-6 w-32 bg-slate-200 rounded-sm" />
      </div>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col border border-slate-100 rounded-sm bg-white shadow-sm overflow-hidden animate-pulse">
            <div className="p-3 bg-slate-50/50 border-b border-slate-100 flex items-center gap-3">
              <div className="h-4 w-20 bg-slate-200 rounded-sm" />
              <div className="h-4 w-12 bg-slate-200 rounded-sm" />
            </div>
            <div className="p-4">
              <div className="space-y-2">
                <div className="h-3 w-full bg-slate-200 rounded" />
                <div className="h-3 w-5/6 bg-slate-200 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DocumentProcessingSkeleton() {
  return (
    <div className="relative p-6 space-y-6 h-full overflow-hidden">
      <AdaptiveProcessingStatus type="document" />
      <div className="mb-4 animate-pulse">
        <div className="h-4 w-48 bg-slate-200 rounded" />
      </div>
      <div className="space-y-6">
        {[1, 2].map((i) => (
          <div key={i} className="flex flex-col border border-slate-100 rounded-sm bg-white shadow-sm overflow-hidden animate-pulse">
            <div className="p-3 bg-white border-b border-slate-50">
              <div className="h-4 w-24 bg-slate-200 rounded-sm" />
            </div>
            <div className="p-4">
              <div className="space-y-2 mb-4">
                <div className="h-3 w-full bg-slate-200 rounded" />
                <div className="h-3 w-full bg-slate-200 rounded" />
                <div className="h-3 w-full bg-slate-200 rounded" />
                <div className="h-3 w-4/5 bg-slate-200 rounded" />
              </div>
              <div className="mt-2 pt-3 border-t border-slate-100">
                <div className="bg-slate-50 p-3 rounded-sm border border-slate-100">
                   <div className="h-2 w-32 bg-slate-200 rounded mb-2" />
                   <div className="h-3 w-3/4 bg-slate-200 rounded" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ImageExtractionConsole({ file }: { file: any }) {
  const [activeTab, setActiveTab] = useState<"Visual Markers" | "Forensic Analysis" | "Metadata">("Visual Markers");
  const [derivationData, setDerivationData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchDerivation();
  }, [file.id, file.metadata?.image_derivation]);

  const fetchDerivation = async () => {
    setDerivationData(null);
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('evidence_image_derivation_outputs')
        .select('*')
        .eq('evidence_id', file.id)
        .eq('is_active', true)
        .single();
      
      if (data) {
        setDerivationData(data.raw_json || data);
      } else if (file?.metadata?.image_derivation) {
        setDerivationData(file.metadata.image_derivation);
      } else {
        setDerivationData(imageDerivationMock);
      }
    } catch (e) {
      setDerivationData(imageDerivationMock);
    } finally {
      setIsLoading(false);
    }
  };

  const data = derivationData || imageDerivationMock;

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Tab Header - Premium Enterprise Style */}
      <div className="sticky top-0 z-40 bg-[#f8fafc] border-b border-slate-200 px-6 pt-3 flex flex-col shrink-0">
          <div className="flex items-center border-b border-slate-200 relative">
             {(["Visual Markers", "Forensic Analysis", "Metadata"] as const).map((tab, idx) => (
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

          </div>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar relative">
         {file.extraction_status === 'processing' ? (
           <ImageProcessingSkeleton />
         ) : (
           <>
             {activeTab === "Visual Markers" && <ImageMarkersView chunks={data.lossless_chunks} />}
             {activeTab === "Forensic Analysis" && <ImageForensicView data={data} />}
             {activeTab === "Metadata" && <ImageMetadataView file={file} data={data} />}
           </>
         )}
      </div>
    </div>
  );
}

function ImageForensicView({ data }: { data: typeof imageDerivationMock }) {
  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500">
      {/* Classification */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
           <LayoutGrid className="h-4 w-4 text-slate-900" />
           <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">Reconstruction Classification</h4>
        </div>
        <div className="grid grid-cols-1 gap-3">
           <div className="p-4 bg-slate-50 border border-slate-100 rounded-sm">
              <span className="text-[8px] font-black text-slate-400 uppercase block mb-1">Inferred Modality</span>
              <span className="text-[11px] font-black text-slate-800">{data.document_metadata.inferred_document_type}</span>
           </div>
           <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-sm">
                 <span className="text-[8px] font-black text-slate-400 uppercase block mb-1">Event Date</span>
                 <span className="text-[11px] font-black text-slate-800">{data.document_metadata.date_mentioned}</span>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-sm">
                 <span className="text-[8px] font-black text-slate-400 uppercase block mb-1">Quality Status</span>
                 <span className="text-[11px] font-black px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-sm inline-block">High Fidelity</span>
              </div>
           </div>
        </div>
      </div>

      {/* Spatial Analysis Summary */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
           <FileText className="h-4 w-4 text-slate-900" />
           <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">Spatial Analysis Summary</h4>
        </div>
        <div className="bg-slate-50 p-5 rounded-sm border border-slate-200 relative group overflow-hidden">
           <div className="absolute top-0 right-0 p-2 opacity-10">
              <Brain className="h-6 w-6" />
           </div>
           <p className="text-[12px] font-bold text-slate-700 leading-relaxed italic relative z-10">
             "{data.quick_summary_and_analysis.executive_summary}"
           </p>
        </div>
      </div>

      {/* Critical Findings */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
           <AlertTriangle className="h-4 w-4 text-rose-600" />
           <h4 className="text-[11px] font-black text-rose-600 uppercase tracking-[0.2em]">Reconstruction Findings</h4>
        </div>
        <div className="space-y-3">
           {data.quick_summary_and_analysis.critical_findings.map((finding, idx) => (
              <div key={idx} className="flex flex-col border border-slate-100 rounded-sm bg-white shadow-sm hover:border-slate-300 transition-all overflow-hidden">
                 <div className="p-2.5 bg-white border-b border-slate-50 flex items-center justify-between">
                    <span className="px-1.5 py-0.5 bg-slate-900 text-white rounded-sm text-[8px] font-black tabular-nums tracking-widest">
                       FINDING #{idx + 1}
                    </span>
                 </div>
                 <div className="p-4">
                    <p className="text-[11px] font-bold text-slate-800 leading-snug">{finding}</p>
                 </div>
              </div>
           ))}
        </div>
      </div>

      {/* Spatial Context */}
      <div className="space-y-4">
         <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-2">Geographic & Personnel Context</h4>
         <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
               {data.document_metadata.location_mentioned.map((loc, i) => (
                  <span key={i} className="px-2 py-1 bg-slate-900 text-white text-[8px] font-black uppercase rounded-sm tracking-widest">{loc}</span>
               ))}
            </div>
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-sm flex items-center gap-3">
               <Users className="h-4 w-4 text-slate-400" />
               <span className="text-[10px] font-bold text-slate-700 truncate">{data.document_metadata.personnel_involved[0]}</span>
            </div>
         </div>
      </div>
    </div>
  );
}

function ImageMarkersView({ chunks }: { chunks: typeof imageDerivationMock.lossless_chunks }) {
  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
       <div className="flex items-center justify-between mb-4">
          <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">Spatial Markers</h4>
          <span className="text-[9px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded uppercase">{chunks.length} Data Points</span>
       </div>
       
       <div className="space-y-4">
          {chunks.map((chunk) => (
             <div key={chunk.sequence_id} className="group flex flex-col border border-slate-100 rounded-sm bg-white shadow-sm hover:border-slate-300 transition-all overflow-hidden">
                {/* Header */}
                <div className="p-3 bg-white border-b border-slate-50 flex items-center justify-between">
                   <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 bg-slate-900 text-white rounded-sm text-[9px] font-black tabular-nums tracking-widest">
                         VIS-{chunk.sequence_id}
                      </span>
                      <span className="px-2 py-0.5 bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest rounded-sm">
                         {chunk.structural_context}
                      </span>
                   </div>
                </div>
                
                {/* Body */}
                <div className="p-4">
                   <p className="text-[11px] font-bold text-slate-800 leading-relaxed mb-4">
                      {chunk.extracted_content}
                   </p>
                   
                   {/* Ref Box */}
                   <div className="mt-2 pt-3 border-t border-slate-100">
                      <div className="bg-slate-50 p-3 rounded-sm border border-slate-200 group/fact relative">
                         <div className="absolute top-0 right-0 p-1 opacity-20">
                            <Search className="h-3 w-3" />
                         </div>
                         <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Visual Reference</span>
                         <p className="text-[10px] font-bold text-slate-500 italic leading-snug">
                            {chunk.visual_description}
                         </p>
                      </div>
                   </div>
                </div>
             </div>
          ))}
       </div>
    </div>
  );
}

function ImageMetadataView({ file, data }: { file: any, data: typeof imageDerivationMock }) {
  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500">
       <div className="space-y-4">
          <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] border-b pb-2">Technical Properties</h4>
          <div className="grid grid-cols-1 gap-4">
             <div className="flex justify-between items-center py-1 border-b border-slate-50">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Source Filename</span>
                <span className="text-[11px] font-bold text-slate-700">{file.name}</span>
             </div>
             <div className="flex justify-between items-center py-1 border-b border-slate-50">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Resolution</span>
                <span className="text-[11px] font-bold text-slate-700">4096 x 2304 (4K)</span>
             </div>
             <div className="flex justify-between items-center py-1 border-b border-slate-50">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Extraction Confidence</span>
                <span className="text-[11px] font-black text-emerald-600 uppercase tracking-widest">96.5%</span>
             </div>
          </div>
       </div>

       <div className="space-y-4">
          <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] border-b pb-2">Computer Vision Logs</h4>
          <div className="grid grid-cols-1 gap-3">
             <div className="p-3 bg-slate-50 rounded-sm border border-slate-100 flex justify-between items-center">
                <span className="text-[9px] font-black text-slate-400 uppercase">Detection Engine</span>
                <span className="text-[10px] font-black text-slate-700">YOLO-X Forensic v8.1</span>
             </div>
             <div className="p-3 bg-slate-50 rounded-sm border border-slate-100 flex justify-between items-center">
                <span className="text-[9px] font-black text-slate-400 uppercase">OCR Matrix</span>
                <span className="text-[10px] font-black text-slate-700">Vision-Text Fusion v4</span>
             </div>
          </div>
       </div>
    </div>
  );
}


export function DocumentExtractionConsole({ file }: { file: any }) {
  const [activeTab, setActiveTab] = useState<"Sequence Chunks" | "Forensic Analysis" | "Metadata">("Sequence Chunks");
  const [derivationData, setDerivationData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchDerivation();
  }, [file.id, file.metadata?.document_derivation]);

  const fetchDerivation = async () => {
    setDerivationData(null);
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('evidence_document_derivation_outputs')
        .select('*')
        .eq('evidence_id', file.id)
        .eq('is_active', true)
        .single();
      
      if (data) {
        setDerivationData(data.raw_json || data);
      } else if (file?.metadata?.document_derivation) {
        setDerivationData(file.metadata.document_derivation);
      } else {
        setDerivationData(documentDerivationMock);
      }
    } catch (e) {
      setDerivationData(documentDerivationMock);
    } finally {
      setIsLoading(false);
    }
  };

  const data = derivationData || documentDerivationMock;

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Tab Header - Premium Enterprise Style */}
      <div className="sticky top-0 z-40 bg-[#f8fafc] border-b border-slate-200 px-6 pt-3 flex flex-col shrink-0">
          <div className="flex items-center border-b border-slate-200 relative">
             {(["Sequence Chunks", "Forensic Analysis", "Metadata"] as const).map((tab, idx) => (
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

          </div>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar relative">
         {file.extraction_status === 'processing' ? (
           <DocumentProcessingSkeleton />
         ) : (
           <>
             {activeTab === "Sequence Chunks" && <DocumentChunksView chunks={data.lossless_chunks} />}
             {activeTab === "Forensic Analysis" && <DocumentForensicView data={data} />}
             {activeTab === "Metadata" && <DocumentMetadataView file={file} data={data} />}
           </>
         )}
      </div>
    </div>
  );
}

function DocumentForensicView({ data }: { data: typeof documentDerivationMock }) {
  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500">
      {/* Document Classification */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
           <Shield className="h-4 w-4 text-slate-900" />
           <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">Document Classification</h4>
        </div>
        <div className="grid grid-cols-1 gap-3">
           <div className="p-4 bg-slate-50 border border-slate-100 rounded-sm">
              <span className="text-[8px] font-black text-slate-400 uppercase block mb-1">Inferred Type</span>
              <span className="text-[11px] font-black text-slate-800">{data.document_metadata.inferred_document_type}</span>
           </div>
           <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-sm">
                 <span className="text-[8px] font-black text-slate-400 uppercase block mb-1">Date Mentioned</span>
                 <span className="text-[11px] font-black text-slate-800">{data.document_metadata.date_mentioned}</span>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-sm">
                 <span className="text-[8px] font-black text-slate-400 uppercase block mb-1">Readability Status</span>
                 <span className={cn(
                    "text-[11px] font-black px-2 py-0.5 rounded-sm inline-block",
                    data.readability_status.includes('High') ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                 )}>{data.readability_status}</span>
              </div>
           </div>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
           <FileText className="h-4 w-4 text-slate-900" />
           <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">Executive Summary</h4>
        </div>
        <div className="bg-slate-50 p-5 rounded-sm border border-slate-200 relative group overflow-hidden">
           <div className="absolute top-0 right-0 p-2 opacity-10">
              <Brain className="h-6 w-6" />
           </div>
           <p className="text-[12px] font-bold text-slate-700 leading-relaxed italic relative z-10">
             "{data.quick_summary_and_analysis.executive_summary}"
           </p>
        </div>
      </div>

      {/* Critical Findings */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
           <AlertTriangle className="h-4 w-4 text-rose-600" />
           <h4 className="text-[11px] font-black text-rose-600 uppercase tracking-[0.2em]">Critical Findings</h4>
        </div>
        <div className="space-y-3">
           {data.quick_summary_and_analysis.critical_findings.map((finding, idx) => (
              <div key={idx} className="flex flex-col border border-slate-100 rounded-sm bg-white shadow-sm hover:border-slate-900 transition-all overflow-hidden">
                 <div className="p-2.5 bg-white border-b border-slate-50 flex items-center justify-between">
                    <span className="px-1.5 py-0.5 bg-slate-900 text-white rounded-sm text-[8px] font-black tabular-nums tracking-widest">
                       FINDING #{idx + 1}
                    </span>
                 </div>
                 <div className="p-4">
                    <p className="text-[11px] font-bold text-slate-800 leading-snug">{finding}</p>
                 </div>
              </div>
           ))}
        </div>
      </div>

      {/* Location & Personnel */}
      <div className="grid grid-cols-1 gap-6">
         <div className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-2">Location Context</h4>
            <div className="flex flex-wrap gap-2">
               {data.document_metadata.location_mentioned.map((loc, i) => (
                  <span key={i} className="px-2 py-1 bg-slate-900 text-white text-[8px] font-black uppercase rounded-sm tracking-widest">{loc}</span>
               ))}
            </div>
         </div>
         <div className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-2">Personnel Identified</h4>
            <div className="grid grid-cols-2 gap-2">
               {data.document_metadata.personnel_involved.map((person, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-100 rounded-sm">
                     <Users className="h-3 w-3 text-slate-400" />
                     <span className="text-[10px] font-bold text-slate-700 truncate">{person}</span>
                  </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
}

function DocumentChunksView({ chunks }: { chunks: typeof documentDerivationMock.lossless_chunks }) {
  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
       <div className="flex items-center justify-between mb-4">
          <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">Sequential Processing</h4>
          <span className="text-[9px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded uppercase">{chunks.length} Units</span>
       </div>
       
       <div className="space-y-4">
          {chunks.map((chunk) => (
             <div key={chunk.sequence_id} className="group flex flex-col border border-slate-100 rounded-sm bg-white shadow-sm hover:border-slate-900 transition-all overflow-hidden">
                {/* Header */}
                <div className="p-3 bg-white border-b border-slate-50 flex items-center justify-between">
                   <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 bg-slate-900 text-white rounded-sm text-[9px] font-black tabular-nums tracking-widest">
                         CHUNK {chunk.sequence_id}
                      </span>
                      <span className="px-2 py-0.5 bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest rounded-sm">
                         {chunk.structural_context}
                      </span>
                   </div>
                </div>
                
                {/* Body */}
                <div className="p-4">
                   <p className="text-[11px] font-bold text-slate-800 leading-relaxed mb-4">
                      {chunk.extracted_content}
                   </p>
                   
                   {/* Ref Box */}
                   {chunk.visual_description && (
                      <div className="mt-2 pt-3 border-t border-slate-100">
                         <div className="bg-slate-50 p-3 rounded-sm border border-slate-200 group/fact relative">
                            <div className="absolute top-0 right-0 p-1 opacity-20">
                               <Brain className="h-3 w-3" />
                            </div>
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Extracted Action / Fact</span>
                            <p className="text-[10px] font-bold text-slate-500 italic leading-snug">
                               {chunk.visual_description}
                            </p>
                         </div>
                      </div>
                   )}
                </div>
             </div>
          ))}
       </div>
    </div>
  );
}

function DocumentMetadataView({ file, data }: { file: any, data: typeof documentDerivationMock }) {
  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500">
       <div className="space-y-4">
          <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] border-b pb-2">Technical Properties</h4>
          <div className="grid grid-cols-1 gap-4">
             <div className="flex justify-between items-center py-1 border-b border-slate-50">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">File Name</span>
                <span className="text-[11px] font-bold text-slate-700">{file.name}</span>
             </div>
             <div className="flex justify-between items-center py-1 border-b border-slate-50">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Inferred Class</span>
                <span className="text-[11px] font-bold text-slate-700">{data.document_metadata.inferred_document_type}</span>
             </div>
             <div className="flex justify-between items-center py-1 border-b border-slate-50">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Integrity Hash</span>
                <span className="text-[10px] font-mono text-slate-500">SHA-256: e3b0c442...</span>
             </div>
             <div className="flex justify-between items-center py-1 border-b border-slate-50">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Scan Confidence</span>
                <span className="text-[11px] font-black text-emerald-600 uppercase tracking-widest">98.2% (High)</span>
             </div>
          </div>
       </div>

       <div className="space-y-4">
          <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] border-b pb-2">AI Extraction Metadata</h4>
          <div className="grid grid-cols-2 gap-4">
             <div className="p-3 bg-slate-50 rounded-sm border border-slate-100">
                <span className="text-[8px] font-black text-slate-400 uppercase block mb-1">OCR Engine</span>
                <span className="text-[10px] font-black text-slate-700">Tesseract Matrix v5.0</span>
             </div>
             <div className="p-3 bg-slate-50 rounded-sm border border-slate-100">
                <span className="text-[8px] font-black text-slate-400 uppercase block mb-1">Reasoning Agent</span>
                <span className="text-[10px] font-black text-blue-600">PEEPO v4.2</span>
             </div>
          </div>
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
  }, [file.id, file.metadata?.audio_derivation]);

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
    } catch (e: any) {
      console.warn("Audio derivation fetch failed (likely missing table), falling back to mock:", e.message);
      // On error (e.g. table missing), still try metadata fallback, then mock
      if (file?.metadata?.audio_derivation) {
        setDerivationData(file.metadata.audio_derivation);
        setIsDemo(file.metadata.audio_derivation.is_demo_override);
      } else if (file?.name?.includes("Saiful") || file?.id?.includes("saiful")) {
        // High-fidelity fallback for Saiful incident
        setDerivationData(audioDerivationMock);
        setIsDemo(true);
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

      <div className="flex-1 overflow-auto custom-scrollbar relative">
         {file.extraction_status === 'processing' ? (
           <AudioProcessingSkeleton />
         ) : (
           <>
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
           </>
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

  // Auto-sync expansion with active state
  useEffect(() => {
    setIsExpanded(active);
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
         onClick={() => {
            if (active) {
               setIsExpanded(!isExpanded);
            } else {
               onJump();
               setIsExpanded(true);
            }
         }}
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
  const [activeTab, setActiveTab] = useState<"Sequence Blocks" | "Forensic Analysis" | "Ontology Map" | "Metadata">("Sequence Blocks");
  const [derivationData, setDerivationData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchDerivation();
  }, [file.id, file.metadata?.video_derivation]);

  const fetchDerivation = async () => {
    setDerivationData(null);
    setIsLoading(true);
    try {
      // 1. Try specialized table
      const { data, error } = await supabase
        .from('evidence_video_derivation_outputs')
        .select('*')
        .eq('evidence_id', file.id)
        .eq('is_active', true)
        .single();
      
      if (data) {
        setDerivationData(data.raw_json || data);
      } else {
        // 2. Fallback to file metadata
        if (file?.metadata?.video_derivation) {
           setDerivationData(file.metadata.video_derivation);
        } else {
           // 3. Last ditch: check if we can fetch the file again to get latest metadata
           const { data: latestFile } = await supabase.from('evidence_files').select('metadata').eq('id', file.id).single();
           if (latestFile?.metadata?.video_derivation) {
              setDerivationData(latestFile.metadata.video_derivation);
           } else {
              // 4. Default Mock
              setDerivationData(videoDerivationMock);
           }
        }
      }
    } catch (e) {
      console.error(e);
      setDerivationData(videoDerivationMock);
    } finally {
      setIsLoading(false);
    }
  };

  const data = derivationData || videoDerivationMock;

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Tab Header - Premium Enterprise Style */}
      <div className="sticky top-0 z-40 bg-[#f8fafc] border-b border-slate-200 px-6 pt-3 flex flex-col shrink-0">
          <div className="flex items-center border-b border-slate-200 relative">
             {(["Sequence Blocks", "Forensic Analysis", "Ontology Map", "Metadata"] as const).map((tab, idx) => (
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

          </div>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar relative">
         {file.extraction_status === 'processing' ? (
           <VideoProcessingSkeleton />
         ) : (
           <>
             {activeTab === "Sequence Blocks" && <VideoBlocksView blocks={data.video_blocks} onJump={onJump} currentTime={currentTime} />}
             {activeTab === "Forensic Analysis" && <VideoForensicView data={data} />}
             {activeTab === "Ontology Map" && <VideoOntologyView ontology={data.ontology_mapping} />}
             {activeTab === "Metadata" && <VideoMetadataView file={file} data={data} />}
           </>
         )}
      </div>
    </div>
  );
}

function VideoForensicView({ data }: { data: typeof videoDerivationMock }) {
  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500">
      {/* Executive Summary */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
           <Brain className="h-4 w-4 text-slate-900" />
           <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">Executive Video Summary</h4>
        </div>
        <div className="p-5 bg-white border border-slate-200 rounded-sm shadow-sm relative overflow-hidden group border-l-4 border-l-slate-900">
           <p className="text-[12px] font-bold text-slate-700 leading-relaxed italic">
             "{data.executive_video_summary}"
           </p>
        </div>
      </div>

      {/* Kinetic Events */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
           <Activity className="h-4 w-4 text-rose-600" />
           <h4 className="text-[11px] font-black text-rose-600 uppercase tracking-[0.2em]">Kinetic Events & Hazards</h4>
        </div>
        <div className="space-y-3">
           {data.ontology_mapping.kinetic_events_or_hazards.map((event, idx) => (
              <div key={idx} className="p-4 bg-rose-50/30 border border-rose-100 rounded-sm hover:bg-rose-50 transition-all">
                 <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest">{event.event_type}</span>
                    <StatusPill status="Nominal Operation" variant="success" />
                 </div>
                 <p className="text-[11px] font-bold text-slate-800 leading-snug mb-3">{event.event_description}</p>
                 <div className="flex items-center gap-2 pt-3 border-t border-rose-100/50">
                    <span className="text-[8px] font-black text-slate-400 uppercase">Linked:</span>
                    <div className="flex flex-wrap gap-1">
                      {event.linked_objects.map((obj, i) => (
                        <span key={i} className="px-1.5 py-0.5 bg-white border border-rose-100 text-[9px] font-bold text-slate-600 rounded-sm">{obj}</span>
                      ))}
                    </div>
                 </div>
              </div>
           ))}
        </div>
      </div>

      {/* Investigation Notes */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
           <Info className="h-4 w-4 text-slate-900" />
           <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">Investigation Ambiguities</h4>
        </div>
        <div className="space-y-2.5">
           {data.investigation_notes.unclear_or_missing_info.map((note, idx) => (
              <div key={idx} className="flex gap-3 p-4 bg-slate-50 border border-slate-100 rounded-sm group hover:border-amber-200 transition-all">
                 <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5 opacity-40 group-hover:opacity-100 transition-opacity" />
                 <p className="text-[10px] font-bold text-slate-600 leading-snug">{note}</p>
              </div>
           ))}
        </div>
      </div>
    </div>
  );
}

function VideoBlocksView({ blocks, onJump, currentTime }: { blocks: any[], onJump: (s: number) => void, currentTime: number }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const getS = (s: string) => {
    if (!s) return 0;
    const parts = s.split(':').map(Number);
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    return Number(s) || 0;
  };

  const parseStartSeconds = (timeStr: string) => {
    const start = timeStr.split(' - ')[0];
    const parts = start.split(':').map(Number);
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    return Number(start) || 0;
  };

  const parseEndSeconds = (timeStr: string) => {
    const end = timeStr.split(' - ')[1];
    const parts = end.split(':').map(Number);
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    return Number(end) || 0;
  };

  const isSegmentActive = (block: any, idx: number) => {
    const s = parseStartSeconds(block.time_block);
    const e = parseEndSeconds(block.time_block);
    // Non-overlapping boundaries: [start, end)
    // For the last block, make it inclusive
    const isLast = idx === filteredData.length - 1;
    return currentTime >= s && (isLast ? currentTime <= e : currentTime < e);
  };

  const filteredData = useMemo(() => {
    return blocks.filter((block: any) => {
      const text = block.visual_summary || "";
      const matchesSearch = text.toLowerCase().includes(searchQuery.toLowerCase());
      const blockStart = parseStartSeconds(block.time_block);
      const filterStart = startTime ? getS(startTime) : 0;
      const filterEnd = endTime ? getS(endTime) : Infinity;
      return matchesSearch && blockStart >= filterStart && blockStart <= filterEnd;
    });
  }, [blocks, searchQuery, startTime, endTime]);

  const criticalIncidents = blocks.filter((b: any) => b.contains_critical_incident);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Auto-expand the active segment
  useEffect(() => {
    const activeBlock = blocks.find(b => isSegmentActive(b));
    if (activeBlock) {
      setExpandedId(activeBlock.time_block);
    }
  }, [currentTime]);

  return (
    <div className="flex flex-col h-full bg-white">
       {/* Search Header */}
       <div className="px-6 py-4 border-b border-slate-100 bg-white sticky top-0 z-30 flex flex-col gap-4">
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-900 uppercase tracking-tight">Sequential Analysis</span>
                <div className="h-1 w-1 bg-slate-300 rounded-full" />
                <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400 uppercase tabular-nums tracking-tighter">
                   <span>{filteredData.length} Results</span>
                </div>
             </div>
             
              {criticalIncidents.length > 0 && (
                <button 
                  onClick={() => {
                    const block = criticalIncidents[0];
                    const targetTime = parseStartSeconds(block.time_block);
                    onJump(targetTime);
                    setExpandedId(block.time_block);
                  }}
                  className="flex items-center gap-1.5 px-2 py-1 bg-rose-50 text-rose-600 border border-rose-100 rounded-sm text-[9px] font-black uppercase tracking-widest hover:bg-rose-100 transition-all hover:scale-105 active:scale-95"
                >
                  <AlertTriangle className="h-3 w-3" />
                  Jump to Incident
                </button>
              )}
          </div>
          <div className="flex gap-2">
             <div className="relative group flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                <input 
                   type="text" 
                   placeholder="Search visual summary..."
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
                   {blocks.map((block: any, idx: number) => (
                     <option key={idx} value={`${block.time_block.split(' - ')[0]}|${block.time_block.split(' - ')[1]}`}>
                       {block.time_block}
                     </option>
                   ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 pointer-events-none" />
             </div>
          </div>
       </div>

       <div className="flex-1 overflow-auto custom-scrollbar p-4 space-y-4">
         {filteredData.map((block: any, idx: number) => (
           <VideoBlockSegment 
              key={idx}
              block={block}
              active={isSegmentActive(block, idx)}
              isExpanded={expandedId === block.time_block}
              onToggle={() => setExpandedId(expandedId === block.time_block ? null : block.time_block)}
              onJump={() => {
                onJump(parseStartSeconds(block.time_block));
                setExpandedId(block.time_block);
              }}
           />
         ))}
       </div>
    </div>
  );
}

function VideoBlockSegment({ block, active, isExpanded, onToggle, onJump }: { block: any, active: boolean, isExpanded: boolean, onToggle: () => void, onJump: () => void }) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (active) {
      // Only scroll if not already in view to avoid jarring jumps
      elementRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [active]);

  return (
    <div 
       ref={elementRef}
       className={cn(
          "flex flex-col border transition-all duration-300 cursor-pointer overflow-hidden rounded-sm relative",
          active ? "border-slate-900 bg-white shadow-md z-10 scale-[1.01]" : "border-slate-100 hover:border-slate-300 bg-white shadow-sm hover:translate-x-1"
       )}
       onClick={() => {
          onJump();
       }}
    >
       {active && <div className="absolute top-0 left-0 bottom-0 w-1 bg-slate-900" />}
       <div className="p-3 bg-white flex items-center justify-between border-b border-slate-50">
          <div className="flex items-center gap-2">
             <span className={cn(
                "px-1.5 py-0.5 rounded-sm text-[9px] font-black tabular-nums tracking-widest border transition-colors",
                active ? "bg-slate-900 text-white border-slate-900" : "bg-slate-50 text-slate-500 border-slate-100"
             )}>
                {block.time_block}
             </span>
             <ConfidenceChip level={block.confidence_score.split(' - ')[0].toLowerCase() as any} />
          </div>
          
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            className="p-1 hover:bg-slate-50 rounded transition-all"
          >
             <ChevronDown className={cn("h-3 w-3 text-slate-400 transition-transform", isExpanded ? "rotate-180" : "")} />
          </button>
       </div>

       <div className="p-4 bg-white">
          <p className={cn(
             "text-[11px] font-bold leading-relaxed transition-colors",
             active ? "text-slate-900" : "text-slate-600"
          )}>
             {block.visual_summary}
          </p>
       </div>

       {isExpanded && (
          <div className="px-4 pb-4 bg-white space-y-3 animate-in fade-in slide-in-from-top-1">
             <div className="flex items-center gap-2 pt-1">
                <div className="h-1 w-1 rounded-full bg-slate-300" />
                <span className="text-[9px] font-bold text-slate-400 italic leading-none">{block.confidence_score}</span>
             </div>

             {block.contains_critical_incident && block.critical_incident_details && (
                <div className="mt-2 pt-3 border-t border-slate-100">
                   <div className="bg-rose-50 p-4 rounded-sm border border-rose-100 group/incident relative">
                      <div className="absolute top-0 right-0 p-2 opacity-20 text-rose-600">
                         <AlertTriangle className="h-4 w-4" />
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                         <span className="px-2 py-0.5 bg-rose-600 text-white text-[8px] font-black uppercase tracking-widest rounded-sm">Critical Incident</span>
                         <span className="text-[10px] font-black text-rose-600 tabular-nums bg-white px-2 py-0.5 rounded-sm border border-rose-200">
                            T = {block.critical_incident_details.exact_timestamp}
                         </span>
                      </div>
                      <h5 className="text-[11px] font-black text-slate-900 uppercase mb-1">{block.critical_incident_details.incident_type}</h5>
                      <p className="text-[10px] font-bold text-slate-700 leading-snug italic">
                         {block.critical_incident_details.kinematics_description}
                      </p>
                   </div>
                </div>
             )}
          </div>
       )}
    </div>
  );
}

function VideoOntologyView({ ontology }: { ontology: typeof videoDerivationMock.ontology_mapping }) {
  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500">
       <div className="space-y-4">
          <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">Identified Assets & Infrastructure</h4>
          <div className="grid grid-cols-1 gap-3">
             {ontology.identified_objects.map((obj, i) => (
                <div key={i} className="p-4 bg-slate-50 border border-slate-100 rounded-sm group hover:bg-white hover:border-slate-300 transition-all">
                   <div className="flex items-center gap-3 mb-2">
                      <div className={cn(
                        "px-1.5 py-0.5 rounded-sm text-[8px] font-black uppercase tracking-widest",
                        obj.object_class === 'Infrastructure' ? 'bg-amber-100 text-amber-700' : 'bg-slate-900 text-white'
                      )}>
                        {obj.object_class}
                      </div>
                      <span className="text-[11px] font-black text-slate-800 uppercase tracking-tight">{obj.object_identifier}</span>
                   </div>
                   <div className="p-2.5 bg-white border border-slate-100/50 rounded-sm flex items-start gap-2">
                      <span className="text-[8px] font-black text-slate-400 uppercase mt-0.5">Role/State:</span>
                      <p className="text-[10px] font-bold text-slate-600 italic leading-relaxed">{obj.overall_role_or_state}</p>
                   </div>
                </div>
             ))}
          </div>
       </div>
    </div>
  );
}

function VideoMetadataView({ file, data }: { file: any, data: typeof videoDerivationMock }) {
  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500">
       <div className="space-y-4">
          <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] border-b pb-2">Forensic Session Metadata</h4>
          <div className="grid grid-cols-1 gap-4">
             <div className="flex justify-between items-center py-1 border-b border-slate-50">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Modality Source</span>
                <span className="text-[11px] font-bold text-slate-700">{data.video_metadata.video_source_type}</span>
             </div>
             <div className="flex justify-between items-center py-1 border-b border-slate-50">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Certified Duration</span>
                <span className="text-[11px] font-bold text-slate-700 tabular-nums">{data.video_metadata.total_duration}</span>
             </div>
             <div className="flex justify-between items-center py-1 border-b border-slate-50">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Scene Environment</span>
                <span className="text-[11px] font-bold text-slate-700 text-right max-w-[200px]">{data.video_metadata.scene_environment_notes}</span>
             </div>
          </div>
       </div>

       <div className="space-y-4">
          <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] border-b pb-2">Analysis Pipeline Logs</h4>
          <div className="grid grid-cols-1 gap-3">
             <div className="p-3 bg-slate-50 rounded-sm border border-slate-100 flex justify-between items-center hover:bg-white transition-all">
                <span className="text-[9px] font-black text-slate-400 uppercase">Detection Framework</span>
                <span className="text-[10px] font-black text-slate-700">TensorFlow-Video v4.1</span>
             </div>
             <div className="p-3 bg-slate-50 rounded-sm border border-slate-100 flex justify-between items-center hover:bg-white transition-all">
                <span className="text-[9px] font-black text-slate-400 uppercase">Kinetic Mapping</span>
                <span className="text-[10px] font-black text-slate-700">Vision-Flow Fusion v2.0</span>
             </div>
          </div>
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
