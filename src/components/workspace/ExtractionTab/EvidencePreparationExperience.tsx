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

import { getEvidenceType, evidenceOutputContractConfig } from './evidenceContract';

export default function EvidencePreparationExperience({ file, isSuccess }: EvidencePreparationExperienceProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [outputsUnlocked, setOutputsUnlocked] = useState(0);

  const evType = getEvidenceType(file);
  const config = evidenceOutputContractConfig[evType];
  const Icon = config.icon;
  const typeKey = evType;

  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (file?.extraction_status === "pending" || file?.extraction_status === "processing") {
      const start = new Date(file.updated_at || file.created_at || new Date()).getTime();
      const updateTimer = () => {
        const diff = Math.max(0, Math.floor((Date.now() - start) / 1000));
        setElapsedSeconds(diff);
      };
      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    }
  }, [file?.extraction_status, file?.created_at, file?.updated_at]);

  const formatCompactTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}h ${m.toString().padStart(2, '0')}m`;
    if (m > 0) return `${m}m ${s.toString().padStart(2, '0')}s`;
    return `${s}s`;
  };

  const uploadProgress = Math.min(99, Math.max(1, Math.floor((elapsedSeconds / 20) * 100)));
  const processingProgress = Math.min(99, Math.max(1, Math.floor(((Math.max(0, elapsedSeconds - 20)) / 30) * 100)));

  const progressPercent = file?.currentRunProgress || 
    (file?.extraction_status === 'pending' ? uploadProgress : 
     file?.extraction_status === 'processing' ? processingProgress : 
     file?.extraction_status === 'completed' ? 100 : 
     file?.extraction_status === 'failed' ? processingProgress : 12);

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
        
        {/* Header Strip */}
        <div className="mb-8 border-b border-slate-100 pb-6">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Selected Evidence</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-800 tracking-wide uppercase">{config.badge}</span>
              <span className="text-slate-300">·</span>
              <span className="text-[13px] font-semibold text-slate-900">{file?.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                {file?.extraction_status === "completed" ? "DONE" : file?.extraction_status === "failed" ? "NEEDS ATTENTION" : "RUNNING"}
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-[11px] font-bold text-slate-500">{formatCompactTime(elapsedSeconds)}</span>
              <span className="text-slate-300">·</span>
              <span className="text-[11px] font-black text-emerald-600">{progressPercent}%</span>
            </div>
          </div>
        </div>

        {/* Title & Description */}
        <div className="flex items-start gap-4 mb-10">
          <div className="h-12 w-12 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center shrink-0">
            {file?.extraction_status === "completed" ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            ) : file?.extraction_status === "failed" ? (
              <AlertCircle className="h-5 w-5 text-rose-600" />
            ) : (
              <Loader2 className="h-5 w-5 text-emerald-600 animate-spin" />
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight mb-2">{config.title}</h1>
            <p className="text-sm text-slate-600 leading-relaxed max-w-lg">{config.subtitle}</p>
            
            {(file?.extraction_status === "pending" || file?.extraction_status === "processing") && (
              <div className="mt-4 max-w-md">
                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  <span>Progress</span>
                  <span className="text-emerald-600">{progressPercent}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-in-out"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-2">Running for {formatCompactTime(elapsedSeconds)}</p>
              </div>
            )}
          </div>
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
                    {step.label}
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
