import React, { useState, useEffect } from 'react';
import { 
  FileVideo, FileImage, FileText, FileAudio, Files, 
  CheckCircle2, AlertCircle, Loader2, PlaySquare, 
  Scan, Layers, Waves, FileSearch, ArrowRight,
  Database, Clock, User, List, Target, Check
} from 'lucide-react';
import { cn } from "@/lib/utils";

interface EvidencePreparationExperienceProps {
  file: any;
  isSuccess?: boolean;
}

// ... (keep TYPE_CONFIGS as is)
const TYPE_CONFIGS = {
  video: {
    icon: FileVideo,
    title: "Preparing sequence blocks from the video.",
    steps: [
      "Reading video file",
      "Checking playback quality",
      "Finding key moments",
      "Preparing sequence blocks",
      "Preparing analysis workspace"
    ],
    outputs: [
      { icon: Layers, label: "Sequence Blocks", desc: "Video broken into scene segments." },
      { icon: Target, label: "Key Moments", desc: "Important events automatically flagged." },
      { icon: Scan, label: "Visual Observations", desc: "Objects and entities identified." },
      { icon: Clock, label: "Timeline Notes", desc: "Chronological event mapping." },
      { icon: Database, label: "Metadata", desc: "Source, codec, and device info." }
    ],
    warning: "Video has dark or unclear frames. Key moments may need manual review."
  },
  image: {
    icon: FileImage,
    title: "Reading the image and marking visible observations.",
    steps: [
      "Reading image file",
      "Checking image clarity",
      "Marking visible details",
      "Preparing observation notes",
      "Preparing analysis workspace"
    ],
    outputs: [
      { icon: Scan, label: "Visual Observations", desc: "Detected entities and context." },
      { icon: Target, label: "Detected Areas", desc: "Bounding boxes of interest." },
      { icon: FileText, label: "Image Notes", desc: "AI-generated image descriptions." },
      { icon: CheckCircle2, label: "Quality Check", desc: "Resolution and clarity score." },
      { icon: Database, label: "Metadata", desc: "EXIF, location, and device data." }
    ],
    warning: "Image looks blurry. Results may need manual review."
  },
  document: {
    icon: FileText,
    title: "Reading the document and preparing key notes.",
    steps: [
      "Reading document pages",
      "Checking readable text",
      "Finding key sections",
      "Preparing document notes",
      "Preparing analysis workspace"
    ],
    outputs: [
      { icon: FileSearch, label: "Document Summary", desc: "High-level overview of contents." },
      { icon: Layers, label: "Key Sections", desc: "Important paragraphs highlighted." },
      { icon: Target, label: "Extracted Facts", desc: "Names, dates, and locations." },
      { icon: List, label: "Page References", desc: "Indexed pages for quick lookup." },
      { icon: Database, label: "Metadata", desc: "Author, creation date, and format." }
    ],
    warning: "Some text may be difficult to read. Please review the highlighted sections."
  },
  audio: {
    icon: FileAudio,
    title: "Listening to the audio and preparing transcript segments.",
    steps: [
      "Reading audio file",
      "Checking sound quality",
      "Preparing transcript",
      "Separating speaker turns",
      "Preparing analysis workspace"
    ],
    outputs: [
      { icon: FileText, label: "Transcript Segments", desc: "Conversation in time-based sections." },
      { icon: User, label: "Speaker Turns", desc: "Identified distinct voices." },
      { icon: Target, label: "Important Mentions", desc: "Flagged keywords and phrases." },
      { icon: Clock, label: "Time References", desc: "Chronological mapping of speech." },
      { icon: Database, label: "Metadata", desc: "Duration, format, and quality." }
    ],
    warning: "Audio has low volume or background noise. Transcript may need checking."
  },
  mixed: {
    icon: Files,
    title: "Preparing all evidence files for review.",
    steps: [
      "Reading evidence files",
      "Checking file quality",
      "Preparing file-specific outputs",
      "Connecting related evidence",
      "Preparing review workspace"
    ],
    outputs: [
      { icon: List, label: "Evidence List", desc: "Inventory of processed files." },
      { icon: Layers, label: "Cross-file Notes", desc: "Connections between evidence." },
      { icon: Clock, label: "Timeline Candidates", desc: "Multi-source event mapping." },
      { icon: FileSearch, label: "Source References", desc: "Traceability back to origin files." },
      { icon: Database, label: "Metadata", desc: "Aggregated collection data." }
    ],
    warning: "Some files need manual review before final analysis."
  }
};

export default function EvidencePreparationExperience({ file, isSuccess }: EvidencePreparationExperienceProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [outputsUnlocked, setOutputsUnlocked] = useState(0);

  const fileType = file?.type?.toLowerCase() || 'document';
  const typeKey = Object.keys(TYPE_CONFIGS).find(k => fileType.includes(k)) || 'document';
  const config = TYPE_CONFIGS[typeKey as keyof typeof TYPE_CONFIGS];
  const Icon = config.icon;

  useEffect(() => {
    // Simulate step progression
    const stepInterval = setInterval(() => {
      setCurrentStep(prev => (prev < 4 ? prev + 1 : prev));
    }, 4500);

    // Simulate warning appearing after step 1
    const warningTimer = setTimeout(() => {
      // randomly show warning or strictly show it based on file name if we want to simulate
      if (file?.name?.includes('WhatsApp') || file?.name?.includes('Blurry') || Math.random() > 0.5) {
        setShowWarning(true);
      }
    }, 7000);

    // Unlock outputs gradually
    const outputInterval = setInterval(() => {
      setOutputsUnlocked(prev => (prev < 5 ? prev + 1 : prev));
    }, 3000);

    return () => {
      clearInterval(stepInterval);
      clearTimeout(warningTimer);
      clearInterval(outputInterval);
    };
  }, [file?.name]);

  if (file?.extraction_status === 'failed') {
    return (
      <div className="flex-1 flex items-center justify-center bg-white animate-in fade-in zoom-in-95 duration-300">
        <div className="text-center flex flex-col items-center">
          <div className="h-16 w-16 bg-rose-50 rounded-full flex items-center justify-center mb-6 shadow-sm border border-rose-100">
            <AlertCircle className="h-8 w-8 text-rose-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2 tracking-tight">This file could not be prepared.</h2>
          <p className="text-[13px] font-medium text-slate-500 max-w-[280px] mb-8">Try uploading the file again or use a clearer version.</p>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-slate-900 text-white rounded-[4px] text-[11px] font-bold uppercase tracking-widest shadow-sm hover:bg-slate-800 transition-colors">Retry</button>
            <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-[4px] text-[11px] font-bold uppercase tracking-widest hover:bg-slate-50 transition-colors">Replace File</button>
            <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-[4px] text-[11px] font-bold uppercase tracking-widest hover:bg-slate-50 transition-colors">Continue</button>
          </div>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white animate-in fade-in zoom-in-95 duration-300">
        <div className="text-center flex flex-col items-center">
          <div className="h-16 w-16 bg-emerald-50 rounded-full flex items-center justify-center mb-6 shadow-sm border border-emerald-100">
            <CheckCircle2 className="h-8 w-8 text-emerald-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2 tracking-tight">Evidence ready for review</h2>
          <p className="text-[13px] font-medium text-slate-500 max-w-[280px]">The extracted results have been organized into review cards.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex bg-[#F8FAFC] overflow-hidden">
      {/* 1. LEFT PANEL - Evidence Preview */}
      <div className="w-[320px] lg:w-[380px] border-r border-slate-200 bg-white flex flex-col p-6 shrink-0 relative">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Evidence Preview</h3>
        
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-full aspect-[4/5] bg-slate-50 border border-slate-100 rounded-2xl relative overflow-hidden flex flex-col items-center justify-center p-6 shadow-sm">
            
            {/* Dynamic Preview Animations based on type */}
            {typeKey === 'video' && (
              <div className="w-full h-full relative">
                <div className="absolute inset-x-0 top-1/4 h-32 bg-slate-200/50 rounded-lg overflow-hidden">
                  <div className="w-full h-0.5 bg-emerald-500/50 absolute top-0 animate-[ping_3s_ease-in-out_infinite]" />
                </div>
                <div className="absolute bottom-4 inset-x-4 h-8 flex gap-1">
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className="flex-1 bg-slate-200 rounded-sm opacity-50" />
                  ))}
                </div>
                <PlaySquare className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-12 w-12 text-slate-300" />
              </div>
            )}

            {typeKey === 'image' && (
              <div className="w-full h-full relative flex items-center justify-center">
                <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-emerald-500" />
                <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-emerald-500" />
                <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-emerald-500" />
                <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-emerald-500" />
                <div className="w-48 h-48 border border-emerald-500/20 rounded-full animate-[pulse_3s_ease-in-out_infinite] flex items-center justify-center">
                  <Scan className="h-12 w-12 text-slate-300" />
                </div>
              </div>
            )}

            {typeKey === 'document' && (
              <div className="w-3/4 h-5/6 bg-white border border-slate-200 shadow-sm rounded-md relative overflow-hidden p-4">
                <div className="space-y-3 opacity-30">
                  <div className="h-3 bg-slate-300 rounded w-3/4" />
                  <div className="h-3 bg-slate-300 rounded w-full" />
                  <div className="h-3 bg-slate-300 rounded w-5/6" />
                  <div className="h-3 bg-slate-300 rounded w-full" />
                  <div className="h-3 bg-slate-300 rounded w-2/3" />
                </div>
                <div className="absolute left-0 right-0 h-16 bg-gradient-to-b from-transparent to-emerald-500/10 border-b border-emerald-500/30 animate-[slide-down_4s_linear_infinite] origin-top" style={{ top: '-4rem' }} />
                <style>{`
                  @keyframes slide-down {
                    0% { transform: translateY(0); }
                    100% { transform: translateY(500px); }
                  }
                `}</style>
              </div>
            )}

            {typeKey === 'audio' && (
              <div className="w-full h-full flex items-center justify-center relative">
                <div className="flex items-center gap-1 h-24">
                  {[...Array(24)].map((_, i) => (
                    <div 
                      key={i} 
                      className="w-1.5 bg-slate-300 rounded-full"
                      style={{ 
                        height: `${Math.max(20, Math.random() * 100)}%`,
                        opacity: i < (currentStep * 5) ? 1 : 0.3
                      }}
                    />
                  ))}
                </div>
                <div 
                  className="absolute top-1/2 -translate-y-1/2 w-0.5 h-32 bg-emerald-500 transition-all duration-1000 ease-linear shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                  style={{ left: `${20 + (currentStep * 15)}%` }}
                />
              </div>
            )}
            
          </div>
          
          <div className="mt-6 w-full space-y-3">
             <div className="flex items-center gap-3">
               <div className="p-2 bg-slate-100 rounded-lg shrink-0">
                 <Icon className="h-4 w-4 text-slate-600" />
               </div>
               <div className="min-w-0">
                 <p className="text-xs font-bold text-slate-900 truncate">{file.name}</p>
                 <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{file.type || 'Unknown Type'}</p>
               </div>
             </div>
             
             {typeKey === 'image' && (
               <div className="flex gap-2">
                 <span className="px-2 py-1 bg-slate-100 text-[9px] font-bold text-slate-500 uppercase tracking-widest rounded">Image Quality Check</span>
                 <span className="px-2 py-1 bg-slate-100 text-[9px] font-bold text-slate-500 uppercase tracking-widest rounded">Observation</span>
               </div>
             )}
             {typeKey === 'document' && (
               <div className="flex gap-2">
                 <span className="px-2 py-1 bg-slate-100 text-[9px] font-bold text-slate-500 uppercase tracking-widest rounded">Text Reading</span>
                 <span className="px-2 py-1 bg-slate-100 text-[9px] font-bold text-slate-500 uppercase tracking-widest rounded">Key Sections</span>
               </div>
             )}
          </div>
        </div>
      </div>

      {/* 2. CENTER PANEL - Preparation Console */}
      <div className="flex-1 flex flex-col p-10 max-w-3xl border-r border-slate-200 bg-white">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-12">
          <div className="h-12 w-12 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center shrink-0">
            <Loader2 className="h-5 w-5 text-emerald-600 animate-spin" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Preparing Evidence</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 border border-emerald-200 text-[10px] font-black uppercase tracking-widest text-emerald-700 flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Running
              </span>
            </div>
            <p className="text-[13px] font-medium text-slate-500">{config.title}</p>
          </div>
        </div>

        {/* Primary Message */}
        <div className="mb-10">
          <p className="text-sm text-slate-600 leading-relaxed max-w-lg">
            Please wait while the system checks file quality, extracts important information, and prepares the review workspace.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="space-y-6 mb-10 flex-1">
          {config.steps.map((step, idx) => {
            const isCompleted = currentStep > idx;
            const isActive = currentStep === idx;
            const isPending = currentStep < idx;

            return (
              <div key={idx} className={cn("flex items-start gap-4 transition-all duration-500", 
                isPending ? "opacity-40" : "opacity-100",
                isActive ? "scale-[1.02] transform origin-left" : ""
              )}>
                <div className="mt-0.5 shrink-0 relative">
                  {isCompleted ? (
                    <div className="h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center shadow-sm">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  ) : isActive ? (
                    <div className="h-5 w-5 rounded-full border-2 border-emerald-500 flex items-center justify-center bg-white relative">
                      <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping absolute" />
                      <div className="h-2 w-2 rounded-full bg-emerald-500 relative z-10" />
                    </div>
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-slate-200 bg-slate-50" />
                  )}
                  {idx !== config.steps.length - 1 && (
                    <div className={cn("absolute top-5 left-1/2 -translate-x-1/2 w-0.5 h-6", 
                      isCompleted ? "bg-emerald-500" : "bg-slate-200"
                    )} />
                  )}
                </div>
                <div className="flex-1">
                  <p className={cn("text-[13px] font-bold tracking-wide", 
                    isActive ? "text-emerald-700" : isCompleted ? "text-slate-700" : "text-slate-400"
                  )}>
                    {step}
                  </p>
                  {isActive && (
                    <div className="h-1 w-full max-w-[200px] bg-slate-100 rounded-full mt-2 overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full animate-[progress_4.5s_ease-in-out_forwards]" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <style>{`
          @keyframes progress {
            0% { width: 0%; }
            100% { width: 100%; }
          }
        `}</style>

        {/* Quality Warning */}
        {showWarning && (
          <div className="p-4 bg-amber-50/80 border border-amber-200/60 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
            <p className="text-[12px] font-semibold text-amber-800 leading-relaxed">
              {config.warning}
            </p>
          </div>
        )}

      </div>

      {/* 3. RIGHT PANEL - Expected Output Preview */}
      <div className="w-[320px] lg:w-[380px] bg-white flex flex-col p-6 shrink-0 shadow-[-4px_0_24px_rgba(0,0,0,0.02)]">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Expected Output</h3>
        
        <div className="space-y-3">
          {config.outputs.map((out, idx) => {
            const isUnlocked = outputsUnlocked > idx;
            const OutputIcon = out.icon;
            
            return (
              <div 
                key={idx} 
                className={cn(
                  "p-4 border rounded-xl flex items-start gap-4 transition-all duration-700 transform",
                  isUnlocked 
                    ? "bg-white border-slate-200 shadow-sm translate-y-0 opacity-100" 
                    : "bg-slate-50 border-transparent translate-y-4 opacity-40 grayscale"
                )}
              >
                <div className={cn("p-2 rounded-lg shrink-0", isUnlocked ? "bg-emerald-50 text-emerald-600" : "bg-slate-200 text-slate-400")}>
                  <OutputIcon className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-[12px] font-bold text-slate-900 mb-0.5">{out.label}</h4>
                  <p className="text-[10px] font-medium text-slate-500 leading-relaxed">{out.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-auto pt-6">
           <div className="px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
             <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Readiness</span>
             <span className="text-[11px] font-black text-slate-900">{Math.min(100, Math.round((outputsUnlocked / 5) * 100))}%</span>
           </div>
        </div>
      </div>
    </div>
  );
}
