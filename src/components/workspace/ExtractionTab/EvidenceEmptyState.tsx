import React, { useState, useEffect } from 'react';
import { 
  FileVideo, FileImage, FileAudio, FileText, 
  Upload, FolderPlus, CheckCircle2, AlertCircle, 
  Layers, Target, Scan, Clock, Database, ArrowRight,
  Sparkles, MousePointerClick, Info
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { getEvidenceType, evidenceOutputContractConfig, EvidenceType } from './evidenceContract';

interface EvidenceCenterEmptyStateProps {
  repositoryHasFiles: boolean;
  failedCount: number;
  hoveredFile: any | null;
  onSelectFirstEvidence: () => void;
  onReviewFailedFiles: () => void;
  onUploadEvidence: () => void;
  onCreateFolder: () => void;
}

export function EvidenceCenterEmptyState({
  repositoryHasFiles,
  failedCount,
  hoveredFile,
  onSelectFirstEvidence,
  onReviewFailedFiles,
  onUploadEvidence,
  onCreateFolder
}: EvidenceCenterEmptyStateProps) {
  const [activeChipIndex, setActiveChipIndex] = useState(0);

  // Soft rotate active highlighted chip every 2.5s if not hovered by a real file
  useEffect(() => {
    if (hoveredFile) return;
    const interval = setInterval(() => {
      setActiveChipIndex(prev => (prev + 1) % 4);
    }, 2500);
    return () => clearInterval(interval);
  }, [hoveredFile]);

  // Determine active hovered file type
  const hoveredType: EvidenceType = hoveredFile ? getEvidenceType(hoveredFile) : "unknown";
  
  // Map index to types for chip highlighting
  const typeIndices: Record<number, EvidenceType> = {
    0: 'video',
    1: 'image',
    2: 'audio',
    3: 'document'
  };

  const isTypeHighlighted = (type: EvidenceType) => {
    if (hoveredFile) {
      return hoveredType === type;
    }
    return typeIndices[activeChipIndex] === type;
  };

  if (!repositoryHasFiles) {
    // CASE 2: Repository Has No Files (Empty Dropzone preview)
    return (
      <div className="w-full max-w-2xl bg-white border border-slate-200/60 rounded-2xl p-8 shadow-sm flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-4 duration-500 my-auto">
        <div className="h-16 w-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mb-6 text-slate-400">
          <Upload className="h-7 w-7" />
        </div>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Workspace Empty</span>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight mb-2">Add evidence to start the review</h1>
        <p className="text-[13px] font-medium text-slate-500 max-w-sm mb-8">
          Upload forensic audio recordings, video files, images, or documents to begin the extraction and analysis pipeline.
        </p>

        {/* Droptarget Mock */}
        <div className="w-full border-2 border-dashed border-slate-100 rounded-xl p-8 mb-8 bg-slate-50/50 flex flex-col items-center justify-center">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Supported Media Standards</span>
          <div className="flex gap-4">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200/40 rounded-lg text-slate-600 text-xs font-bold shadow-sm">
              <FileVideo className="h-3.5 w-3.5 text-indigo-500" /> VIDEO
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200/40 rounded-lg text-slate-600 text-xs font-bold shadow-sm">
              <FileImage className="h-3.5 w-3.5 text-emerald-500" /> IMAGE
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200/40 rounded-lg text-slate-600 text-xs font-bold shadow-sm">
              <FileAudio className="h-3.5 w-3.5 text-amber-500" /> AUDIO
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200/40 rounded-lg text-slate-600 text-xs font-bold shadow-sm">
              <FileText className="h-3.5 w-3.5 text-blue-500" /> DOCUMENT
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button 
            onClick={onUploadEvidence}
            className="h-10 bg-slate-900 hover:bg-slate-800 text-white font-black px-6 rounded-lg text-[10px] uppercase tracking-widest gap-2 flex items-center shadow-sm transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            <Upload className="h-3.5 w-3.5" /> Upload Evidence
          </button>
          <button 
            onClick={onCreateFolder}
            className="h-10 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-black px-6 rounded-lg text-[10px] uppercase tracking-widest gap-2 flex items-center shadow-sm transition-all"
          >
            <FolderPlus className="h-3.5 w-3.5" /> Create Folder
          </button>
        </div>
      </div>
    );
  }

  // CASE 1: Repository Has Files, No Selected Evidence (Ghost workspace preview)
  return (
    <div className="w-full max-w-3xl flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500 my-auto py-6">
      
      {/* Top hover hint banner */}
      {hoveredFile ? (
        <div className="mb-4 bg-emerald-50 border border-emerald-100 rounded-lg px-4 py-2 flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
          <MousePointerClick className="h-3.5 w-3.5 text-emerald-600 animate-pulse" />
          <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide">
            Click to open {hoveredType} review ({hoveredFile.name})
          </span>
        </div>
      ) : (
        <div className="mb-4 bg-slate-50 border border-slate-100 rounded-lg px-4 py-2 flex items-center gap-2">
          <Info className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-[11px] font-medium text-slate-500">
            Hover over a repository row to preview its forensic pipeline
          </span>
        </div>
      )}

      {/* Main Workspace Preview Card */}
      <div className="w-full bg-white border border-slate-200/60 rounded-2xl p-8 shadow-sm flex flex-col relative overflow-hidden">
        
        {/* Absolute Glowing Ambient behind the card */}
        <div className="bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.03)_0%,transparent_65%)] w-[300px] h-[300px] absolute -top-20 -right-20 pointer-events-none" />

        {/* Content Panel Header */}
        <div className="border-b border-slate-100 pb-6 mb-8 flex justify-between items-start">
          <div>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 block">Evidence Workspace</span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight mb-2">Select evidence to begin review</h1>
            <p className="text-[13px] font-medium text-slate-500 leading-relaxed max-w-xl">
              Choose a file from the repository. The preview, extraction status, and review cards will appear here.
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <button 
              onClick={onSelectFirstEvidence}
              className="h-9 bg-slate-900 hover:bg-slate-800 text-white font-black px-4 rounded-lg text-[10px] uppercase tracking-widest flex items-center gap-1.5 shadow-sm transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              Select First Evidence <ArrowRight className="h-3.5 w-3.5" />
            </button>
            {failedCount > 0 && (
              <button 
                onClick={onReviewFailedFiles}
                className="h-9 bg-rose-50 hover:bg-rose-100 text-rose-700 font-black px-4 rounded-lg text-[10px] uppercase tracking-widest flex items-center gap-1.5 transition-all border border-rose-100"
              >
                <AlertCircle className="h-3.5 w-3.5" /> Review Failed ({failedCount})
              </button>
            )}
          </div>
        </div>

        {/* GHOST WORKSPACE PREVIEW LAYOUT */}
        <div className="grid grid-cols-12 gap-5 opacity-80 pointer-events-none">
          
          {/* Card 1: Evidence Preview Frame (Left Panel Ghost) */}
          <div className="col-span-5 border border-slate-100 rounded-xl p-4 bg-slate-50/50 flex flex-col justify-between h-[180px] transition-all duration-300">
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Evidence Preview</span>
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="h-10 w-full border border-slate-200/40 rounded bg-white flex items-center px-3 gap-2">
                <div className="h-5 w-5 bg-slate-100 rounded flex items-center justify-center shrink-0">
                  <Layers className="h-3 w-3 text-slate-400" />
                </div>
                <div className="h-2 w-20 bg-slate-100 rounded" />
              </div>
            </div>

            {/* Chips Container */}
            <div className="grid grid-cols-2 gap-2 mt-4">
              <div className={cn(
                "flex items-center gap-1 px-2 py-1.5 rounded border text-[9px] font-bold uppercase tracking-wider transition-all duration-300 bg-white",
                isTypeHighlighted('video') ? "border-emerald-500 text-emerald-700 shadow-sm" : "border-slate-100 text-slate-400"
              )}>
                <FileVideo className="h-3 w-3 shrink-0" /> Video
              </div>
              <div className={cn(
                "flex items-center gap-1 px-2 py-1.5 rounded border text-[9px] font-bold uppercase tracking-wider transition-all duration-300 bg-white",
                isTypeHighlighted('image') ? "border-emerald-500 text-emerald-700 shadow-sm" : "border-slate-100 text-slate-400"
              )}>
                <FileImage className="h-3 w-3 shrink-0" /> Image
              </div>
              <div className={cn(
                "flex items-center gap-1 px-2 py-1.5 rounded border text-[9px] font-bold uppercase tracking-wider transition-all duration-300 bg-white",
                isTypeHighlighted('audio') ? "border-emerald-500 text-emerald-700 shadow-sm" : "border-slate-100 text-slate-400"
              )}>
                <FileAudio className="h-3 w-3 shrink-0" /> Audio
              </div>
              <div className={cn(
                "flex items-center gap-1 px-2 py-1.5 rounded border text-[9px] font-bold uppercase tracking-wider transition-all duration-300 bg-white",
                isTypeHighlighted('document') ? "border-emerald-500 text-emerald-700 shadow-sm" : "border-slate-100 text-slate-400"
              )}>
                <FileText className="h-3 w-3 shrink-0" /> Document
              </div>
            </div>
          </div>

          {/* Card 2: Preparation Status Console (Center Panel Ghost) */}
          <div className="col-span-7 border border-slate-100 rounded-xl p-4 bg-slate-50/50 flex flex-col justify-between h-[180px]">
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Preparation Console</span>
                <span className="text-[8px] font-bold text-slate-400 uppercase bg-slate-100 px-1.5 py-0.5 rounded">Running time</span>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-6 w-6 rounded bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                  <div className="h-3 w-3 bg-emerald-500 rounded-full animate-pulse" />
                </div>
                <div className="space-y-1">
                  <div className="h-2 w-28 bg-slate-300 rounded" />
                  <div className="h-1.5 w-16 bg-slate-200 rounded" />
                </div>
              </div>
            </div>

            {/* Muted steps & progress bar placeholder */}
            <div className="space-y-2">
              <div className="h-1 w-full bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-400 w-[65%] rounded-full animate-pulse" />
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                  <div className="h-3.5 w-3.5 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="h-2.5 w-2.5 text-emerald-600" />
                  </div>
                  <div className="h-1.5 w-24 bg-slate-300 rounded" />
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-3.5 w-3.5 rounded-full border border-slate-300 flex items-center justify-center shrink-0 animate-spin" />
                  <div className="h-1.5 w-20 bg-slate-200 rounded" />
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Review Output (Bottom Panel Ghost) */}
          <div className="col-span-12 border border-slate-100 rounded-xl p-4 bg-slate-50/50 flex flex-col">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest text-left">Generated Workspace Outputs</span>
              <span className="text-[8px] font-bold text-slate-400 uppercase">Interactive Workspace</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white border border-slate-200/40 p-3 rounded-lg flex flex-col gap-1.5 shadow-sm">
                <Scan className="h-3.5 w-3.5 text-emerald-500" />
                <div className="h-2 w-16 bg-slate-300 rounded" />
                <div className="h-1.5 w-full bg-slate-100 rounded" />
              </div>
              <div className="bg-white border border-slate-200/40 p-3 rounded-lg flex flex-col gap-1.5 shadow-sm">
                <Clock className="h-3.5 w-3.5 text-indigo-500" />
                <div className="h-2 w-16 bg-slate-300 rounded" />
                <div className="h-1.5 w-full bg-slate-100 rounded" />
              </div>
              <div className="bg-white border border-slate-200/40 p-3 rounded-lg flex flex-col gap-1.5 shadow-sm">
                <Database className="h-3.5 w-3.5 text-amber-500" />
                <div className="h-2 w-16 bg-slate-300 rounded" />
                <div className="h-1.5 w-full bg-slate-100 rounded" />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

interface EvidenceRightEmptyStateProps {
  hoveredFile: any | null;
}

export function EvidenceRightEmptyState({ hoveredFile }: EvidenceRightEmptyStateProps) {
  const hoveredType: EvidenceType = hoveredFile ? getEvidenceType(hoveredFile) : "unknown";

  const cards = [
    {
      key: 'video' as EvidenceType,
      title: 'Video Evidence',
      desc: 'Sequence blocks, key moments, and timeline notes.',
      badge: 'VIDEO',
      configKey: 'video'
    },
    {
      key: 'image' as EvidenceType,
      title: 'Image Evidence',
      desc: 'Visible observations, marked areas, and quality check.',
      badge: 'IMAGE',
      configKey: 'image'
    },
    {
      key: 'audio' as EvidenceType,
      title: 'Audio Evidence',
      desc: 'Transcript segments, speaker turns, and time references.',
      badge: 'AUDIO',
      configKey: 'audio'
    },
    {
      key: 'document' as EvidenceType,
      title: 'Document Evidence',
      desc: 'Summary, key sections, facts, and page references.',
      badge: 'DOCUMENT',
      configKey: 'document'
    }
  ];

  return (
    <div className="flex-1 flex flex-col p-6 bg-white overflow-y-auto custom-scrollbar h-full justify-between">
      <div>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">EXPECTED REVIEW OUTPUT</span>
        <h3 className="text-sm font-bold text-slate-800 tracking-tight">Ready when evidence is selected</h3>
        <p className="text-[11.5px] font-medium text-slate-400 uppercase mt-1 tracking-wide leading-relaxed">
          Outputs will adapt to the selected file type.
        </p>

        {/* Expected Cards */}
        <div className="space-y-4 mt-6">
          {cards.map((card) => {
            const contract = evidenceOutputContractConfig[card.configKey as keyof typeof evidenceOutputContractConfig];
            const CardIcon = contract.icon;
            const isHovered = hoveredType === card.key;

            return (
              <div 
                key={card.key}
                className={cn(
                  "p-4 rounded-xl border transition-all duration-300 flex items-start gap-3 bg-white",
                  isHovered 
                    ? "border-emerald-500 shadow-[0_4px_16px_rgba(16,185,129,0.05)] scale-[1.02] transform origin-left" 
                    : hoveredFile 
                      ? "border-slate-100 opacity-40 scale-95" 
                      : "border-slate-200/60 shadow-sm"
                )}
              >
                <div className={cn(
                  "h-8 w-8 rounded-lg flex items-center justify-center shrink-0 border",
                  isHovered ? "bg-emerald-50 border-emerald-200 text-emerald-600" : "bg-slate-50 border-slate-100 text-slate-400"
                )}>
                  <CardIcon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className={cn(
                      "text-[12px] font-bold tracking-tight",
                      isHovered ? "text-emerald-700" : "text-slate-700"
                    )}>{card.title}</h4>
                    <span className={cn(
                      "text-[8px] font-black px-1.5 py-0.5 rounded tracking-widest",
                      isHovered ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"
                    )}>{card.badge}</span>
                  </div>
                  <p className="text-[11px] font-medium text-slate-500 leading-normal">{card.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-4 bg-slate-50/50 border border-slate-100 rounded-xl mt-6">
        <p className="text-[10px] font-semibold text-slate-500 leading-normal flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
          The forensic engine automatically maps visual and semantic entities into a structured fact timeline after review.
        </p>
      </div>
    </div>
  );
}
