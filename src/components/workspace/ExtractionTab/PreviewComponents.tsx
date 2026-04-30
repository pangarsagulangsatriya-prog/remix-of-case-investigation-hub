import React, { useState, useEffect, useRef } from "react";
import { 
  Plus, Minus, RefreshCcw, Hand, Focus, Ruler, Wand2, 
  Sun, Contrast, Zap, X, Grid3X3, ZoomIn, ZoomOut, 
  Play, Pause, ChevronLeft, ChevronRight, User, 
  Layout, BookText, Search, ExternalLink, Download, 
  Maximize2, Minimize2, Activity, FileText, Folders, Volume2, VolumeX,
  SkipBack, SkipForward, Repeat, Gauge
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { getFileIcon } from "./FileRow";
import { audioDiarizationData } from "@/data/mockData";
import { useMemo } from "react";
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;


const formatTime = (seconds: number) => {
  if (!seconds || isNaN(seconds)) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export function AdaptiveSourcePreview({ 
  file, 
  videoCurrentTime, setVideoCurrentTime, videoIsPlaying, setVideoIsPlaying, videoRef,
  audioCurrentTime, setAudioCurrentTime, audioIsPlaying, setAudioIsPlaying, audioPlaybackSpeed, setAudioPlaybackSpeed, audioRef
}: any) {
  const lowerType = file.type?.toLowerCase();
  const lowerName = file.name?.toLowerCase() || "";

  const isImage = lowerType === "image" || lowerName.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/);
  const isAudio = lowerType === "audio" || lowerName.match(/\.(mp3|wav|ogg|m4a|aac)$/);
  const isVideo = lowerType === "video" || lowerName.match(/\.(mp4|webm|ogg|mov|m4v|avi|wmv)$/);
  const isDocument = lowerType === "document" || lowerName.match(/\.(pdf|doc|docx|txt|rtf|xls|xlsx|csv)$/);

  if (isImage) return <ImagePreview file={file} />;
  if (isAudio) return <AudioPreview file={file} currentTime={audioCurrentTime} setCurrentTime={setAudioCurrentTime} isPlaying={audioIsPlaying} setIsPlaying={setAudioIsPlaying} playbackSpeed={audioPlaybackSpeed} setPlaybackSpeed={setAudioPlaybackSpeed} audioRef={audioRef} />;
  if (isVideo) return <VideoPreview file={file} currentTime={videoCurrentTime} setCurrentTime={setVideoCurrentTime} isPlaying={videoIsPlaying} setIsPlaying={setVideoIsPlaying} videoRef={videoRef} />;
  if (isDocument) return <DocumentPreview file={file} />;

  return (
    <div className="flex flex-col items-center justify-center p-20 text-slate-300 opacity-50 bg-white/50 rounded-sm border-2 border-dashed border-slate-200">
       <Folders className="h-12 w-12 mb-4" />
       <span className="text-[10px] font-black uppercase tracking-[0.2em]">Preview not available for this modality</span>
    </div>
  );
}

export function ImagePreview({ file }: { file: any }) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [handToolActive, setHandToolActive] = useState(false);
  const [viewMode, setViewMode] = useState<'fit' | 'fill' | '100%'>('fit');
  const containerRef = useRef<HTMLDivElement>(null);

  const [enhancements, setEnhancements] = useState({
    exposure: 100,
    contrast: 100,
    saturate: 100,
    invert: 0,
    grayscale: 0,
    sepia: 0,
    hue: 0,
  });
  const [isForensicOpen, setIsForensicOpen] = useState(false);

  // Spotlight State
  const [isSpotlightMode, setIsSpotlightMode] = useState(false);
  const [spotlightRect, setSpotlightRect] = useState<{ x: number, y: number, w: number, h: number } | null>(null);
  const [drawingStart, setDrawingStart] = useState<{ x: number, y: number } | null>(null);

  // Measurement State
  const [isMeasureMode, setIsMeasureMode] = useState(false);
  const [measureMode, setMeasureMode] = useState<'distance' | 'angle' | 'none'>('none');
  const [measurements, setMeasurements] = useState<any[]>([]);
  const [showGrid, setShowGrid] = useState(false);
  const [gridSize, setGridSize] = useState(50);
  const [tempPoints, setTempPoints] = useState<any[]>([]);

  useEffect(() => {
    // Reset on file change
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setViewMode('fit');
    setHandToolActive(false);
    setIsSpotlightMode(false);
    setSpotlightRect(null);
    setIsMeasureMode(false);
    setMeasurements([]);
    setTempPoints([]);
    setShowGrid(false);
    setEnhancements({
      exposure: 100,
      contrast: 100,
      saturate: 100,
      invert: 0,
      grayscale: 0,
      sepia: 0,
      hue: 0,
    });
  }, [file.id]);

  const applyPreset = (preset: string) => {
    const base = { exposure: 100, contrast: 100, saturate: 100, invert: 0, grayscale: 0, sepia: 0, hue: 0 };
    switch(preset) {
      case "high-contrast": setEnhancements({...base, contrast: 180, saturate: 120 }); break;
      case "low-light": setEnhancements({...base, exposure: 160, contrast: 130 }); break;
      case "dust-cut": setEnhancements({...base, contrast: 150, saturate: 80 }); break;
      case "sepia": setEnhancements({...base, sepia: 100 }); break;
      case "grayscale": setEnhancements({...base, grayscale: 100 }); break;
      case "invert": setEnhancements({...base, invert: 100 }); break;
      case "infra": setEnhancements({...base, hue: 180, contrast: 140 }); break;
      default: setEnhancements(base);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSpotlightMode(false);
        setSpotlightRect(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleZoom = (factor: number) => {
    setScale(prev => Math.min(Math.max(0.1, prev * factor), 10));
    if (viewMode !== 'fit') setViewMode('fit');
  };

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.1 : 0.9;
    handleZoom(factor);
  };

  const startDragging = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    // Improved coordinate math: relative to container center, then un-transform
    const mx = e.clientX - rect.left - rect.width/2;
    const my = e.clientY - rect.top - rect.height/2;
    const x = (mx - position.x) / scale + rect.width/2;
    const y = (my - position.y) / scale + rect.height/2;

    if (isSpotlightMode) {
      setDrawingStart({ x, y });
      setSpotlightRect({ x, y, w: 0, h: 0 });
      return;
    }

    if (isMeasureMode && measureMode !== 'none') {
      const newPoints = [...tempPoints, { x, y }];
      
      if (measureMode === 'distance') {
        if (newPoints.length === 2) {
          const dx = newPoints[1].x - newPoints[0].x;
          const dy = newPoints[1].y - newPoints[0].y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          setMeasurements([...measurements, { type: 'distance', points: newPoints, label: `${Math.round(dist)} px` }]);
          setTempPoints([]);
        } else {
          setTempPoints(newPoints);
        }
      } else if (measureMode === 'angle') {
        if (newPoints.length === 3) {
          const angle = Math.atan2(newPoints[2].y - newPoints[0].y, newPoints[2].x - newPoints[0].x) - 
                        Math.atan2(newPoints[1].y - newPoints[0].y, newPoints[1].x - newPoints[0].x);
          let deg = Math.abs(angle * 180 / Math.PI);
          if (deg > 180) deg = 360 - deg;
          setMeasurements([...measurements, { type: 'angle', points: newPoints, label: `${Math.round(deg)}°` }]);
          setTempPoints([]);
        } else {
          setTempPoints(newPoints);
        }
      }
      return;
    }

    if (handToolActive || scale > 1) {
      setIsDragging(true);
      setLastMousePos({ x: e.clientX, y: e.clientY });
    }
  };

  const onDrag = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    if (isSpotlightMode && drawingStart) {
      const mx = e.clientX - rect.left - rect.width/2;
      const my = e.clientY - rect.top - rect.height/2;
      const x = (mx - position.x) / scale + rect.width/2;
      const y = (my - position.y) / scale + rect.height/2;
      
      setSpotlightRect({
        x: Math.min(x, drawingStart.x),
        y: Math.min(y, drawingStart.y),
        w: Math.abs(x - drawingStart.x),
        h: Math.abs(y - drawingStart.y)
      });
      return;
    }

    if (!isDragging) return;
    const dx = e.clientX - lastMousePos.x;
    const dy = e.clientY - lastMousePos.y;
    setPosition(prev => ({ x: prev.x + dx, y: prev.y + dy }));
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const stopDragging = () => {
    setIsDragging(false);
    setDrawingStart(null);
  };

  return (
    <div className="w-full h-full flex flex-col gap-3">
      {/* IBM Carbon Toolbar (Outside Image) */}
      <div className="flex items-center justify-center shrink-0">
        <div className="flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-sm shadow-sm transition-all duration-300">
          <div className="flex items-center gap-0.5 px-2 mr-1 border-r border-slate-100">
            <button onClick={() => handleZoom(0.9)} className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-900 transition-colors"><Minus className="h-3.5 w-3.5" /></button>
            <span className="text-[10px] font-mono font-bold text-slate-700 w-10 text-center">{Math.round(scale * 100)}%</span>
            <button onClick={() => handleZoom(1.1)} className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-900 transition-colors"><Plus className="h-3.5 w-3.5" /></button>
          </div>
          
          <div className="flex items-center gap-0.5 px-1 mr-1 border-r border-slate-100">
            <button 
              onClick={() => { setScale(1); setPosition({ x: 0, y: 0 }); setViewMode('fit'); }}
              className={cn("px-2 py-1 text-[9px] font-black uppercase tracking-widest rounded-sm transition-all", viewMode === 'fit' ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100")}
            >Fit</button>
            <button 
              onClick={() => { setScale(1.5); setPosition({ x: 0, y: 0 }); setViewMode('fill'); }}
              className={cn("px-2 py-1 text-[9px] font-black uppercase tracking-widest rounded-sm transition-all", viewMode === 'fill' ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100")}
            >Fill</button>
            <button 
              onClick={() => { setScale(1); setPosition({ x: 0, y: 0 }); setViewMode('100%'); }}
              className={cn("px-2 py-1 text-[9px] font-black uppercase tracking-widest rounded-sm transition-all", viewMode === '100%' ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100")}
            >100%</button>
          </div>

          <button 
            onClick={() => { setHandToolActive(!handToolActive); setIsSpotlightMode(false); }}
            className={cn("p-1.5 rounded-sm transition-all", handToolActive ? "bg-indigo-500 text-white shadow-inner" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100")}
          >
            <Hand className="h-3.5 w-3.5" />
          </button>
          <button 
            onClick={() => { setIsSpotlightMode(!isSpotlightMode); setHandToolActive(false); }}
            className={cn("p-1.5 rounded-sm transition-all", isSpotlightMode ? "bg-indigo-500 text-white shadow-inner" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100")}
          >
            <Focus className="h-3.5 w-3.5" />
          </button>
        <button 
          onClick={() => { setIsMeasureMode(!isMeasureMode); if(!isMeasureMode) setHandToolActive(false); setIsSpotlightMode(false); }}
          className={cn("p-1.5 rounded-sm transition-all", isMeasureMode ? "bg-blue-600 text-white shadow-inner" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100")}
        >
          <Ruler className="h-3.5 w-3.5" />
        </button>
          <button 
            onClick={() => { setScale(1); setPosition({ x: 0, y: 0 }); setHandToolActive(false); setViewMode('fit'); setSpotlightRect(null); setIsSpotlightMode(false); setIsMeasureMode(false); setMeasurements([]); setShowGrid(false); }}
            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-sm transition-all"
          >
            <RefreshCcw className="h-3.5 w-3.5" />
          </button>
        <div className="w-px h-4 bg-slate-100 mx-1" />
        <button 
          onClick={() => setIsForensicOpen(!isForensicOpen)}
          className={cn("p-1.5 rounded-sm transition-all", isForensicOpen ? "bg-indigo-500 text-white shadow-inner" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100")}
        >
          <Wand2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {isForensicOpen && (
        <div className="flex items-center justify-center shrink-0 -mt-1 scale-95 animate-in slide-in-from-top-2 duration-200">
           <div className="flex items-center gap-4 p-1.5 bg-white border border-slate-200 rounded-sm shadow-sm">
              <div className="flex items-center gap-1 border-r pr-3 border-slate-100">
                 <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mr-2">Presets</span>
                 {[
                   { id: "natural", label: "Original" },
                   { id: "high-contrast", label: "Hi-Contrast" },
                   { id: "low-light", label: "Low-Light" },
                   { id: "dust-cut", label: "Clarity" },
                   { id: "grayscale", label: "B&W" },
                   { id: "invert", label: "Invert" },
                   { id: "infra", label: "Thermal-P" }
                 ].map(p => (
                   <button 
                    key={p.id}
                    onClick={() => applyPreset(p.id)}
                    className="px-2 py-1 text-[8px] font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-sm uppercase tracking-tighter"
                   >
                     {p.label}
                   </button>
                 ))}
              </div>

              <div className="flex items-center gap-4">
                 {[
                   { id: "exposure", label: "EXP", icon: Sun, min: 50, max: 200 },
                   { id: "contrast", label: "CON", icon: Contrast, min: 50, max: 200 },
                   { id: "saturate", label: "SAT", icon: Zap, min: 0, max: 200 }
                 ].map(s => (
                   <div key={s.id} className="flex items-center gap-2">
                      <s.icon className="h-3 w-3 text-slate-400" />
                      <input 
                        type="range" 
                        min={s.min} 
                        max={s.max} 
                        value={(enhancements as any)[s.id]}
                        onChange={(e) => setEnhancements(prev => ({ ...prev, [s.id]: parseInt(e.target.value) }))}
                        className="w-16 h-1 bg-slate-100 rounded-full appearance-none cursor-pointer accent-indigo-500"
                      />
                   </div>
                 ))}
                 <button 
                  onClick={() => setEnhancements({ exposure: 100, contrast: 100, saturate: 100, invert: 0, grayscale: 0, sepia: 0, hue: 0 })}
                  className="p-1 hover:bg-rose-50 text-rose-400 hover:text-rose-600 rounded transition-all"
                 >
                   <RefreshCcw className="h-3 w-3" />
                 </button>
              </div>
           </div>
        </div>
      )}

      {isMeasureMode && (
        <div className="flex items-center justify-center shrink-0 -mt-1 scale-95 animate-in slide-in-from-top-2 duration-200">
           <div className="flex items-center gap-2 p-1.5 bg-white border border-slate-200 rounded-sm shadow-sm">
              <div className="flex items-center gap-1 border-r pr-2 border-slate-100 mr-1">
                <button 
                  onClick={() => { setMeasureMode("distance"); setTempPoints([]); }}
                  className={cn("px-2 py-1 text-[9px] font-bold rounded-sm transition-all uppercase tracking-tight", measureMode === "distance" ? "bg-blue-600 text-white" : "text-slate-500 hover:bg-slate-50")}
                >Distance</button>
                <button 
                  onClick={() => { setMeasureMode("angle"); setTempPoints([]); }}
                  className={cn("px-2 py-1 text-[9px] font-bold rounded-sm transition-all uppercase tracking-tight", measureMode === "angle" ? "bg-blue-600 text-white" : "text-slate-500 hover:bg-slate-50")}
                >Angle</button>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setShowGrid(!showGrid)}
                  className={cn("p-1.5 rounded-sm transition-all", showGrid ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50")}
                ><Grid3X3 className="h-3.5 w-3.5" /></button>
                <button 
                  onClick={() => { setMeasurements([]); setTempPoints([]); }}
                  className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-sm transition-all"
                ><X className="h-3.5 w-3.5" /></button>
              </div>
           </div>
        </div>
      )}
      </div>

      <div 
        ref={containerRef}
        className="relative flex-1 bg-[#0c121e] rounded-sm overflow-hidden group border border-slate-800 shadow-2xl ring-1 ring-white/5"
        onWheel={onWheel}
        onMouseDown={startDragging}
        onMouseMove={onDrag}
        onMouseUp={stopDragging}
        onMouseLeave={stopDragging}
        style={{ cursor: isSpotlightMode ? 'crosshair' : (isDragging ? 'grabbing' : (handToolActive ? 'grab' : 'default')) }}
      >
        <div 
          className="w-full h-full flex items-center justify-center transition-transform duration-75 ease-out select-none relative"
          style={{ 
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: 'center center',
            filter: `brightness(${enhancements.exposure}%) contrast(${enhancements.contrast}%) saturate(${enhancements.saturate}%) invert(${enhancements.invert}%) grayscale(${enhancements.grayscale}%) sepia(${enhancements.sepia}%) hue-rotate(${enhancements.hue}deg)`
          }}
        >

          {/* Forensic Grid */}
          {showGrid && (
            <div 
              className="absolute inset-0 pointer-events-none opacity-20"
              style={{
                backgroundImage: `linear-gradient(to right, #64748b 1px, transparent 1px), linear-gradient(to bottom, #64748b 1px, transparent 1px)`,
                backgroundSize: `${gridSize}px ${gridSize}px`
              }}
            />
          )}

          {/* Measurement Layer */}
          <svg className="absolute inset-0 pointer-events-none overflow-visible" style={{ width: "100%", height: "100%" }}>
            {measurements.map((m, i) => (
              <g key={i}>
                {m.type === "distance" && (
                  <>
                    <line x1={m.points[0].x} y1={m.points[0].y} x2={m.points[1].x} y2={m.points[1].y} stroke="#2563eb" strokeWidth="1.5" />
                    <circle cx={m.points[0].x} cy={m.points[0].y} r="3" fill="#2563eb" />
                    <circle cx={m.points[1].x} cy={m.points[1].y} r="3" fill="#2563eb" />
                    <text x={(m.points[0].x + m.points[1].x)/2} y={(m.points[0].y + m.points[1].y)/2 - 10} fill="#2563eb" fontSize="10" fontWeight="bold" textAnchor="middle" className="drop-shadow-sm">{m.label}</text>
                  </>
                )}
                {m.type === "angle" && (
                  <>
                    <line x1={m.points[0].x} y1={m.points[0].y} x2={m.points[1].x} y2={m.points[1].y} stroke="#ea580c" strokeWidth="1.5" />
                    <line x1={m.points[0].x} y1={m.points[0].y} x2={m.points[2].x} y2={m.points[2].y} stroke="#ea580c" strokeWidth="1.5" />
                    <circle cx={m.points[0].x} cy={m.points[0].y} r="3" fill="#ea580c" />
                    <text x={m.points[0].x} y={m.points[0].y - 15} fill="#ea580c" fontSize="10" fontWeight="bold" textAnchor="middle" className="drop-shadow-sm">{m.label}</text>
                  </>
                )}
              </g>
            ))}
            {tempPoints.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r="3" fill={measureMode === "distance" ? "#2563eb" : "#ea580c"} />
            ))}
          </svg>
          <img 
            src={file.url} 
            alt={file.name} 
            draggable={false}
            className={cn(
              "max-w-full max-h-full transition-all duration-300",
              viewMode === 'fit' ? "object-contain" : (viewMode === 'fill' ? "object-cover w-full h-full" : "object-none")
            )} 
          />

          {/* Spotlight Overlay */}
          {spotlightRect && (
            <div 
              className="absolute inset-0 bg-black/60 pointer-events-none"
              style={{
                clipPath: `polygon(
                  0% 0%, 
                  0% 100%, 
                  ${spotlightRect.x}px 100%, 
                  ${spotlightRect.x}px ${spotlightRect.y}px, 
                  ${spotlightRect.x + spotlightRect.w}px ${spotlightRect.y}px, 
                  ${spotlightRect.x + spotlightRect.w}px ${spotlightRect.y + spotlightRect.h}px, 
                  ${spotlightRect.x}px ${spotlightRect.y + spotlightRect.h}px, 
                  ${spotlightRect.x}px 100%, 
                  100% 100%, 
                  100% 0%
                )`
              }}
            />
          )}
          {spotlightRect && (
            <div 
              className="absolute border border-amber-400 shadow-[0_0_0_1px_rgba(255,255,255,0.2)] pointer-events-none"
              style={{
                left: spotlightRect.x,
                top: spotlightRect.y,
                width: spotlightRect.w,
                height: spotlightRect.h,
              }}
            >
               <div className="absolute top-0 right-0 p-1 bg-amber-400 text-black text-[8px] font-black uppercase leading-none rounded-bl">Focus</div>
            </div>
          )}
        </div>

        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
           <span className="text-[10px] font-black text-white uppercase tracking-widest block">{file.name}</span>
           <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Forensic Visual Evidence · Interactive Analysis Mode</span>
        </div>
      </div>
    </div>
  );
}

export function AudioPreview({ file, currentTime, setCurrentTime, isPlaying, setIsPlaying, playbackSpeed, setPlaybackSpeed, audioRef }: any) {
  const parseTimeToSeconds = (timeStr: string) => {
    if (!timeStr) return 0;
    const parts = timeStr.split(':').map(Number);
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    return parts[0] || 0;
  };

  const derivation = file?.metadata?.audio_derivation;
  const diarization = useMemo(() => {
    if (derivation?.dialogue_map) {
      return derivation.dialogue_map.map((seg: any) => ({
        ...seg,
        start_time: seg.start_time || seg.start_dialog,
        end_time: seg.end_time || seg.end_dialog,
        text: seg.text || seg.verbatim_text
      }));
    }
    return audioDiarizationData;
  }, [derivation]);

  const activeSegmentIndex = diarization.findIndex((seg: any) => {
    const start = parseTimeToSeconds(seg.start_time);
    const end = parseTimeToSeconds(seg.end_time);
    return currentTime >= start && currentTime <= end;
  });

  const activeSegment = activeSegmentIndex !== -1 ? diarization[activeSegmentIndex] : null;
  const nextSegment = activeSegmentIndex !== -1 && activeSegmentIndex < diarization.length - 1 
    ? diarization[activeSegmentIndex + 1] 
    : null;

  return (
    <div className="w-full h-full flex flex-col">
       <div className="w-full h-[220px] bg-[#0c121e] rounded-t-sm border border-slate-800 shadow-xl overflow-hidden flex flex-col shrink-0 relative z-10">
         <audio 
           ref={audioRef} 
           src={file.url} 
           onTimeUpdate={() => audioRef.current && setCurrentTime(audioRef.current.currentTime)} 
           onLoadedMetadata={() => {}}
         />
         <AudioForensicWorkspace 
           file={file}
           currentTime={currentTime}
           setCurrentTime={setCurrentTime}
           isPlaying={isPlaying}
           setIsPlaying={setIsPlaying}
           playbackSpeed={playbackSpeed}
           setPlaybackSpeed={setPlaybackSpeed}
           audioRef={audioRef}
         />
       </div>

       <div className="flex-1 bg-white border border-slate-200 border-t-0 p-10 overflow-hidden relative z-0 flex flex-col items-center justify-center">
          <div className="w-full max-w-2xl relative">
             {activeSegment ? (
               <div key={activeSegment.segment_id} className="animate-in fade-in slide-in-from-bottom-2 duration-700 flex flex-col items-start text-left">
                  <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-6">
                     <div className="h-7 w-7 bg-slate-50 flex items-center justify-center text-slate-400 rounded-sm border border-slate-100">
                        <User className="h-3.5 w-3.5" />
                     </div>
                     <div className="flex flex-col">
                       <span className="leading-none text-slate-500">{activeSegment.speaker_label}</span>
                       <span className="text-[8px] font-mono tracking-tight text-slate-300 mt-1 uppercase">Active Voice · {activeSegment.start_time}</span>
                     </div>
                  </div>
                  
                  <h2 className="text-xl font-bold text-slate-800 leading-relaxed mb-8 tracking-tight">
                     {activeSegment.text}
                  </h2>
                  
                  {nextSegment && (
                     <div className="pt-6 border-t border-slate-50 w-full">
                        <div className="flex items-center gap-2 mb-2">
                           <span className="text-[9px] font-bold text-slate-200 uppercase tracking-widest block">Upcoming</span>
                        </div>
                        <p className="text-sm font-medium text-slate-300 line-clamp-1 italic">{nextSegment.text}</p>
                     </div>
                  )}
               </div>
              ) : (
                 <div className="flex flex-col items-center justify-center py-6 opacity-20">
                   <div className="h-10 w-10 border border-slate-200 flex items-center justify-center mb-4 rounded-sm">
                      <Activity className="h-4 w-4 text-slate-300" />
                   </div>
                   <div className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400">Stream Synchronizing...</div>
                 </div>
              )}
          </div>
       </div>
    </div>
  );
}

export function AudioForensicWorkspace({ 
  file, currentTime, setCurrentTime, isPlaying, setIsPlaying, 
  playbackSpeed, setPlaybackSpeed, audioRef 
}: any) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState(0);
  const [selection, setSelection] = useState<{ start: number, end: number } | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [duration, setDuration] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const waveformCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      const updateDuration = () => setDuration(audioRef.current.duration);
      audioRef.current.addEventListener('loadedmetadata', updateDuration);
      if (audioRef.current.duration) setDuration(audioRef.current.duration);
      return () => audioRef.current?.removeEventListener('loadedmetadata', updateDuration);
    }
  }, [audioRef.current]);

  useEffect(() => {
    const canvas = waveformCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      
      const bars = 200;
      const barW = (w / bars) * zoom;
      const offset = pan * w;

      ctx.fillStyle = '#1e293b';
      for (let i = 0; i < bars; i++) {
        const x = i * (w / bars) * zoom - offset;
        if (x < -barW || x > w) continue;
        const seed = Math.sin(i * 0.5) * 10000;
        const val = (seed - Math.floor(seed)) * (h * 0.7);
        const barH = Math.max(2, val);
        const isPast = (i / bars) * duration < currentTime;
        ctx.fillStyle = isPast ? '#3b82f6' : '#334155';
        ctx.fillRect(x, h/2 - barH/2, barW - 1, barH);
      }

      const px = (currentTime / (duration || 1)) * w * zoom - offset;
      if (px >= 0 && px <= w) {
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(px, 0, 2, h);
      }

      if (selection) {
        const sx = (selection.start / duration) * w * zoom - offset;
        const ex = (selection.end / duration) * w * zoom - offset;
        ctx.fillStyle = 'rgba(59, 130, 246, 0.15)';
        ctx.fillRect(Math.min(sx, ex), 0, Math.abs(ex - sx), h);
      }
    };

    render();
  }, [currentTime, duration, zoom, pan, selection]);

  const handleInteraction = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const normalizedX = (x + pan * rect.width) / (rect.width * zoom);
    const targetTime = normalizedX * duration;

    if (e.type === 'mousedown') {
      setIsSelecting(true);
      setSelection({ start: targetTime, end: targetTime });
      if (audioRef.current) {
        audioRef.current.currentTime = targetTime;
        setCurrentTime(targetTime);
      }
    } else if (e.type === 'mousemove' && isSelecting) {
      setSelection(prev => prev ? { ...prev, end: targetTime } : null);
    } else if (e.type === 'mouseup') {
      setIsSelecting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0c121e] text-white">
       <div className="h-10 border-b border-white/5 bg-[#161e2e] flex items-center justify-between px-4 shrink-0">
          <div></div>
          <div className="flex items-center gap-2">
             <div className="flex bg-black/40 rounded border border-white/5 p-0.5">
                <button onClick={() => setZoom(z => Math.max(1, z / 1.2))} className="p-1.5 hover:bg-white/10 rounded transition-colors text-slate-400 hover:text-white"><ZoomOut className="h-3.5 w-3.5" /></button>
                <div className="px-2 flex items-center text-[9px] font-mono font-bold text-slate-500 border-x border-white/5">{Math.round(zoom * 100)}%</div>
                <button onClick={() => setZoom(z => Math.min(10, z * 1.2))} className="p-1.5 hover:bg-white/10 rounded transition-colors text-slate-400 hover:text-white"><ZoomIn className="h-3.5 w-3.5" /></button>
             </div>
             <Button variant="ghost" size="sm" className="h-7 text-[9px] font-black uppercase text-slate-400 hover:text-white hover:bg-white/5 border border-white/5" onClick={() => { setZoom(1); setPan(0); setSelection(null); }}>
                <RefreshCcw className="h-3 w-3 mr-1.5" /> Reset View
             </Button>
          </div>
       </div>

       <div 
         ref={containerRef}
         className="flex-1 min-h-0 flex flex-col relative cursor-crosshair overflow-hidden group/workspace"
         onMouseDown={handleInteraction}
         onMouseMove={handleInteraction}
         onMouseUp={handleInteraction}
         onMouseLeave={() => setIsSelecting(false)}
       >
          <div className="flex-1 min-h-0 relative bg-black/40">
             <canvas ref={waveformCanvasRef} width={800} height={192} className="absolute inset-0 w-full h-full block" />
             {selection && !isSelecting && (
               <div 
                 className="absolute top-1/2 -translate-y-1/2 bg-slate-900 border border-white/10 p-1.5 rounded shadow-2xl flex items-center gap-1.5 animate-in fade-in zoom-in duration-200"
                 style={{ left: `${((selection.start + selection.end) / 2 / duration) * 100}%`, transform: 'translate(-50%, -50%)' }}
                 onClick={(e) => e.stopPropagation()}
               >
                  <Button size="sm" className="h-7 px-3 bg-primary text-white text-[9px] font-black uppercase rounded-sm hover:bg-primary/90" onClick={() => { if(audioRef.current) { audioRef.current.currentTime = selection.start; audioRef.current.play(); setIsPlaying(true); } }}>
                     Loop
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 px-1 text-slate-500 hover:text-white" onClick={() => setSelection(null)}>
                     <X className="h-3.5 w-3.5" />
                  </Button>
               </div>
             )}
          </div>

          <div className="h-6 bg-[#0c121e] border-t border-white/5 flex items-center px-2 pointer-events-none opacity-40">
             {Array.from({ length: 10 }).map((_, i) => (
               <div key={i} className="flex-1 flex flex-col items-start border-l border-white/10 h-3 pl-1">
                  <span className="text-[8px] font-mono text-white">{formatTime((i / 10) * duration)}</span>
               </div>
             ))}
          </div>
       </div>

       <div className="h-20 bg-[#161e2e] border-t border-white/5 flex items-center px-8 gap-8 shrink-0">
          <div className="flex items-center gap-4">
             <button className="text-slate-400 hover:text-white transition-colors" onClick={() => { if(audioRef.current) audioRef.current.currentTime -= 1; }}><ChevronLeft className="h-5 w-5" /></button>
             <button 
                onClick={() => {
                  if (isPlaying) audioRef.current?.pause();
                  else audioRef.current?.play();
                  setIsPlaying(!isPlaying);
                }}
                className="h-12 w-12 bg-white text-slate-900 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/5"
             >
                {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current ml-0.5" />}
             </button>
             <button className="text-slate-400 hover:text-white transition-colors" onClick={() => { if(audioRef.current) audioRef.current.currentTime += 1; }}><ChevronRight className="h-5 w-5" /></button>
          </div>

          <div className="flex flex-col gap-1.5 min-w-[120px]">
             <div className="flex items-baseline gap-2">
                <span className="text-xl font-mono font-black tabular-nums text-white leading-none">{formatTime(currentTime)}</span>
                <span className="text-[10px] font-mono text-slate-500">/ {formatTime(duration)}</span>
             </div>
          </div>

          <div className="flex items-center gap-6 ml-auto">
             <div className="flex flex-col items-end gap-1">
                <div className="flex bg-black/40 rounded border border-white/5 p-0.5">
                   {[0.5, 1, 1.5].map(s => (
                     <button 
                       key={s} 
                       onClick={() => { setPlaybackSpeed(s); if(audioRef.current) audioRef.current.playbackRate = s; }}
                       className={`px-3 py-1 text-[9px] font-black uppercase rounded transition-all ${playbackSpeed === s ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-white'}`}
                     >
                       {s}x
                     </button>
                   ))}
                </div>
             </div>
          </div>
       </div>
    </div>
  );
}

export function VideoPreview({ file, currentTime, setCurrentTime, isPlaying, setIsPlaying, videoRef }: any) {
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isLooping, setIsLooping] = useState(false);
  const [loopRange, setLoopRange] = useState<{ start: number, end: number } | null>(null);
  
  // Digital Zoom & Pan State
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const stepFrame = (direction: 'prev' | 'next') => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
      // Approximately 1 frame at 30fps
      const frameTime = 1/30;
      videoRef.current.currentTime += (direction === 'next' ? frameTime : -frameTime);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const cur = videoRef.current.currentTime;
      setCurrentTime(cur);

      // Handle Looping
      if (isLooping && loopRange) {
        if (cur >= loopRange.end) {
          videoRef.current.currentTime = loopRange.start;
        }
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleZoom = (factor: number) => {
    setScale(prev => Math.min(Math.max(1, prev * factor), 5));
  };

  const startDragging = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      setLastMousePos({ x: e.clientX, y: e.clientY });
    }
  };

  const onDrag = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - lastMousePos.x;
    const dy = e.clientY - lastMousePos.y;
    setPosition(prev => ({ x: prev.x + dx, y: prev.y + dy }));
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const stopDragging = () => setIsDragging(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const isFullscreen = !!document.fullscreenElement;

  return (
    <div 
      ref={containerRef}
      className="w-full h-full flex flex-col gap-4"
    >
      {/* 1. Video Frame (Unobstructed) */}
      <div 
        className="relative flex-1 bg-black rounded-sm overflow-hidden group border border-slate-800 ring-1 ring-white/5 shadow-2xl"
        onMouseDown={startDragging}
        onMouseMove={onDrag}
        onMouseUp={stopDragging}
        onMouseLeave={stopDragging}
        style={{ cursor: isDragging ? 'grabbing' : (scale > 1 ? 'grab' : 'default') }}
      >
        <video 
          ref={videoRef} 
          src={file.url} 
          className="w-full h-full object-contain transition-transform duration-75 ease-out"
          style={{ 
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: 'center center'
          }}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onClick={togglePlay}
          playsInline
        />
        
        {/* Simple Play Overlay (Only when paused) */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
             <div className="h-16 w-16 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center text-white border border-white/20 shadow-2xl scale-110">
                <Play className="h-6 w-6 fill-current ml-1" />
             </div>
          </div>
        )}

        {/* Zoom Indicator */}
        {scale > 1 && (
          <div className="absolute top-4 left-4 px-2 py-1 bg-indigo-600/90 text-white text-[9px] font-black uppercase tracking-widest rounded-sm backdrop-blur-md shadow-lg z-10 animate-in fade-in zoom-in duration-200">
             Digital Zoom: {Math.round(scale * 100)}%
          </div>
        )}
      </div>
      
      {/* 2. External Forensic Control Panel (Outside Frame) */}
      <div className="bg-white border border-slate-200 rounded-sm p-4 flex flex-col gap-4 shadow-sm">
         {/* Top Row: Progress & Time */}
         <div className="flex flex-col gap-2">
            <div 
               className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden cursor-pointer relative group"
               onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const pct = x / rect.width;
                  if (videoRef.current) videoRef.current.currentTime = pct * duration;
               }}
            >
               <div 
                 className="absolute h-full bg-slate-900 transition-all duration-100" 
                 style={{ width: `${(currentTime / (duration || 1)) * 100}%` }} 
               />
            </div>
            <div className="flex justify-between items-center px-1">
               <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{file.name}</span>
               </div>
               <div className="flex items-center gap-2 text-[10px] font-mono font-bold tabular-nums">
                  <span className="text-slate-900">{formatTime(currentTime)}</span>
                  <span className="text-slate-300">/</span>
                  <span className="text-slate-400">{formatTime(duration)}</span>
               </div>
            </div>
         </div>

         {/* Bottom Row: Functional Clusters */}
         <div className="flex items-center justify-between border-t border-slate-50 pt-4">
            {/* Playback Cluster */}
            <div className="flex items-center gap-4">
               <button 
                 onClick={togglePlay}
                 className="h-9 w-9 bg-slate-900 text-white rounded-sm flex items-center justify-center hover:bg-slate-800 transition-all active:scale-95 shadow-sm"
               >
                 {isPlaying ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current ml-0.5" />}
               </button>

               <div className="flex items-center gap-1 bg-slate-50 border border-slate-100 rounded-sm p-0.5">
                  <button onClick={() => stepFrame('prev')} className="p-1.5 hover:bg-white hover:text-slate-900 text-slate-400 rounded-sm transition-all" title="Previous Frame"><SkipBack className="h-3.5 w-3.5" /></button>
                  <div className="px-2 text-[8px] font-black uppercase text-slate-500 tracking-tighter">Frame Step</div>
                  <button onClick={() => stepFrame('next')} className="p-1.5 hover:bg-white hover:text-slate-900 text-slate-400 rounded-sm transition-all" title="Next Frame"><SkipForward className="h-3.5 w-3.5" /></button>
               </div>

               <div className="h-6 w-[1px] bg-slate-100 mx-1" />

               <div className="flex bg-slate-50 border border-slate-100 rounded-sm p-0.5">
                  {[0.5, 1, 2].map(s => (
                    <button 
                      key={s} 
                      onClick={() => { setPlaybackSpeed(s); if(videoRef.current) videoRef.current.playbackRate = s; }}
                      className={cn(
                        "px-3 py-1 text-[9px] font-black uppercase rounded-sm transition-all",
                        playbackSpeed === s ? "bg-white text-slate-900 shadow-sm border border-slate-100" : "text-slate-400 hover:text-slate-600"
                      )}
                    >
                      {s}x
                    </button>
                  ))}
               </div>
            </div>

            {/* Forensic & Utility Cluster */}
            <div className="flex items-center gap-3">
               <div className="flex items-center gap-2 pr-3 border-r border-slate-100">
                  <button 
                    onClick={() => { setIsMuted(!isMuted); if(videoRef.current) videoRef.current.muted = !isMuted; }} 
                    className="p-1.5 text-slate-400 hover:text-slate-900 transition-colors"
                  >
                     {isMuted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </button>
                  <input 
                    type="range" 
                    min="0" max="1" step="0.01" 
                    value={volume}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      setVolume(v);
                      if(videoRef.current) videoRef.current.volume = v;
                    }}
                    className="w-16 h-1 bg-slate-100 rounded-full appearance-none cursor-pointer accent-slate-900"
                  />
               </div>

               <div className="flex items-center gap-1">
                  <button 
                    onClick={() => handleZoom(0.8)} 
                    className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-sm transition-all"
                  ><ZoomOut className="h-4 w-4" /></button>
                  <button 
                    onClick={() => { setScale(1); setPosition({ x: 0, y: 0 }); }} 
                    className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-sm transition-all"
                  ><RefreshCcw className="h-3.5 w-3.5" /></button>
                  <button 
                    onClick={() => handleZoom(1.2)} 
                    className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-sm transition-all"
                  ><ZoomIn className="h-4 w-4" /></button>
               </div>

               <button 
                 onClick={() => setIsLooping(!isLooping)}
                 className={cn(
                    "px-3 py-1.5 border rounded-sm transition-all flex items-center gap-2",
                    isLooping ? "bg-indigo-50 border-indigo-100 text-indigo-600" : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                 )}
               >
                  <Repeat className="h-3.5 w-3.5" />
                  <span className="text-[9px] font-black uppercase tracking-widest">{isLooping ? "Looping" : "Loop"}</span>
               </button>

               <button onClick={toggleFullscreen} className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
                  {document.fullscreenElement ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
               </button>
            </div>
         </div>
      </div>
    </div>
  );
}

export function DocumentPreview({ file }: { file: any }) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
  };

  const onDocumentLoadError = (err: Error) => {
    console.error("PDF Load Error:", err);
    setError(err.message);
    setLoading(false);
  };

  const changePage = (offset: number) => {
    setPageNumber(prevPageNumber => {
      const next = prevPageNumber + offset;
      return Math.min(Math.max(1, next), numPages || 1);
    });
  };

  const zoom = (factor: number) => {
    setScale(prev => Math.min(Math.max(0.5, prev * factor), 3.0));
  };

  const isPdf = file.url?.split('?')[0].toLowerCase().endsWith('.pdf');

  return (
    <div className="flex flex-col h-full bg-[#f1f3f5] rounded-sm border border-slate-200 overflow-hidden select-none">
       {/* 1. Standardized Forensic Document Toolbar */}
       <div className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 shadow-sm z-20">
         <div className="flex items-center gap-6">
           <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-slate-900 rounded-sm flex items-center justify-center text-white">
                 <FileText className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                 <span className="text-[10px] font-black text-slate-900 uppercase tracking-tight truncate max-w-[200px]">{file.name}</span>
                 <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Forensic Document Asset</span>
              </div>
           </div>

           <div className="h-6 w-[1px] bg-slate-200" />

           <div className="flex items-center gap-1">
              <button onClick={() => zoom(0.9)} className="p-2 hover:bg-slate-100 rounded-sm transition-colors text-slate-500"><Minus className="h-4 w-4" /></button>
              <div className="px-3 py-1.5 text-[11px] font-mono font-black text-slate-700 bg-slate-50 border border-slate-100 rounded-sm min-w-[80px] text-center">
                {Math.round(scale * 100)}%
              </div>
              <button onClick={() => zoom(1.1)} className="p-2 hover:bg-slate-100 rounded-sm transition-colors text-slate-500"><Plus className="h-4 w-4" /></button>
           </div>
         </div>

         <div className="flex items-center gap-4">
           {isPdf && (
             <div className="flex items-center gap-2">
               <button 
                 onClick={() => changePage(-1)} 
                 disabled={pageNumber <= 1}
                 className="p-2 hover:bg-slate-100 rounded-sm transition-colors text-slate-500 disabled:opacity-30"
               >
                 <ChevronLeft className="h-4 w-4" />
               </button>
               <div className="flex items-center gap-1 px-3 py-1.5 border border-slate-100 rounded-sm bg-white text-[11px] font-black text-slate-900 tabular-nums shadow-inner">
                  <span>{pageNumber}</span>
                  <span className="text-slate-300 mx-1">/</span>
                  <span className="text-slate-400">{numPages || "--"}</span>
               </div>
               <button 
                 onClick={() => changePage(1)} 
                 disabled={pageNumber >= numPages}
                 className="p-2 hover:bg-slate-100 rounded-sm transition-colors text-slate-500 disabled:opacity-30"
               >
                 <ChevronRight className="h-4 w-4" />
               </button>
             </div>
           )}
           <div className="h-6 w-[1px] bg-slate-200" />
           <div className="flex items-center gap-1">
              <button onClick={() => window.open(file.url, '_blank')} className="p-2 hover:bg-slate-100 rounded-sm transition-colors text-slate-400 hover:text-slate-900" title="Full View"><ExternalLink className="h-4 w-4" /></button>
              <button className="p-2 hover:bg-slate-100 rounded-sm transition-colors text-slate-400 hover:text-slate-900"><Download className="h-4 w-4" /></button>
           </div>
         </div>
       </div>

        {/* 2. Document Content Area with "Paper" Aesthetic */}
        <div className="flex-1 overflow-auto bg-[#ced4da] p-8 lg:p-12 flex justify-center custom-scrollbar scroll-smooth">
           <div 
              className={cn(
                "bg-white shadow-[0_30px_60px_-12px_rgba(0,0,0,0.25),0_18px_36px_-18px_rgba(0,0,0,0.3)] relative rounded-sm overflow-hidden ring-1 ring-black/5 origin-top will-change-transform",
                !isPdf && "transition-all duration-150 ease-out transition-transform"
              )}
              style={{ 
                 width: isPdf ? 'auto' : '850px', // Standard A4-ish width for non-PDFs
                 minHeight: isPdf ? 'auto' : '1100px',
                 transform: isPdf ? 'none' : `scale(${scale})`,
                 marginBottom: !isPdf ? `${(scale - 1) * 550}px` : '0', 
                 marginTop: !isPdf ? `${(scale - 1) * 550}px` : '0'
              }}
           >
              {isPdf ? (
                 <Document
                   file={file.url}
                   onLoadSuccess={onDocumentLoadSuccess}
                   onLoadError={onDocumentLoadError}
                   loading={
                     <div className="flex flex-col items-center justify-center p-40 gap-4">
                        <RefreshCcw className="h-10 w-10 text-slate-300 animate-spin" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Rendering High-Fidelity PDF...</span>
                     </div>
                   }
                   error={
                     <div className="flex flex-col items-center justify-center p-20 gap-4">
                        <AlertTriangle className="h-12 w-12 text-rose-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-rose-500">Failed to Load Document</span>
                        <p className="text-[9px] text-slate-400 font-bold max-w-[200px] text-center">{error}</p>
                     </div>
                   }
                 >
                   <Page 
                     pageNumber={pageNumber} 
                     scale={scale}
                     loading={
                       <div className="flex flex-col items-center justify-center bg-slate-50/50" style={{ width: '600px', height: '800px' }}>
                          <RefreshCcw className="h-6 w-6 text-slate-200 animate-spin mb-2" />
                          <span className="text-[8px] font-black uppercase tracking-widest text-slate-300">Refreshing Render...</span>
                       </div>
                     }
                     renderAnnotationLayer={true}
                     renderTextLayer={true}
                     className="shadow-sm"
                   />
                 </Document>
              ) : (
                 <div className="w-full h-full relative group/iframe" style={{ height: '1100px' }}>
                    <iframe 
                       src={`https://docs.google.com/viewer?url=${encodeURIComponent(file.url)}&embedded=true`} 
                       className="w-full h-full border-none" 
                       title="Document Preview" 
                    />
                    {/* Gradient overlay to make it look less like a raw iframe */}
                    <div className="absolute inset-0 pointer-events-none border border-black/5" />
                 </div>
              )}
           </div>
        </div>

       {/* 3. Footer Status Bar */}
       <div className="h-8 bg-slate-100 border-t border-slate-200 flex items-center px-6 shrink-0 justify-between">
          <div className="flex items-center gap-4">
             <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Investigation Mode</span>
             <div className="h-3 w-[1px] bg-slate-200" />
             <span className="text-[9px] font-mono text-slate-400 uppercase">{isPdf ? "Adobe PDF Content" : "Embedded Office Resource"}</span>
          </div>
          <div className="text-[9px] font-black text-slate-300 uppercase tracking-tighter">Forensic Review Interface v2.4</div>
       </div>
    </div>
  );
}
