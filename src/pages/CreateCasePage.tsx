// BUILD_VERSION: 2026-05-19 — Evidence-First WYSIWYG Case Workspace Initializer
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  ArrowLeft, Search, Plus, Trash2, Loader2, FileVideo, 
  FileImage, FileAudio, FileText, CheckCircle2, Clock, 
  Play, Pause, Info, Folder, AlertCircle, Calendar, 
  MapPin, Shield, Brain, Sparkles, ChevronRight, ChevronLeft, Check, 
  Volume2, Eye, Database, Upload, Cpu
} from "lucide-react";
import { useCreateCase } from "@/hooks/useCases";
import { useUploadEvidence, getFallbackMimeType } from "@/hooks/useEvidence";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type StagedFile = {
  id: string;
  name: string;
  type: "video" | "image" | "audio" | "document" | "unknown";
  sizeLabel: string;
  sizeBytes: number;
  status: "READY" | "UPLOADING" | "FAILED";
  rawFile?: File;
  uploadedAt: string;
};

export default function CreateCasePage() {
  const navigate = useNavigate();
  const createCaseMutation = useCreateCase();
  const uploadEvidenceMutation = useUploadEvidence();

  // Staged Files & Case configuration state
  const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [caseName, setCaseName] = useState("");
  const [isTitleManuallyEdited, setIsTitleManuallyEdited] = useState(false);

  // Optional case metadata (collapsed by default)
  const [showOptionalDetails, setShowOptionalDetails] = useState(false);
  const [optionalDetails, setOptionalDetails] = useState({
    site: "Site Alpha - Northern Link",
    date: "",
    severity: "Critical",
    description: ""
  });

  // Creation loading state
  const [isCreating, setIsCreating] = useState(false);
  const [createProgress, setCreateProgress] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Mock player states for the workspace draft preview
  const [isPlaying, setIsPlaying] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-suggest Case Title based on staged files
  useEffect(() => {
    if (isTitleManuallyEdited) return;

    if (stagedFiles.length === 0) {
      setCaseName("");
    } else if (stagedFiles.length === 1) {
      // Suggest title from first file name without extension
      const fileName = stagedFiles[0].name;
      const baseName = fileName.substring(0, fileName.lastIndexOf('.')) || fileName;
      // Sanitize underscores/dashes to spaces for a clean title
      const cleanName = baseName.replace(/[_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      setCaseName(`Investigasi: ${cleanName}`);
    } else {
      const today = new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric"
      });
      setCaseName(`Kasus Multi-Bukti – ${today}`);
    }
  }, [stagedFiles, isTitleManuallyEdited]);

  // Handle initialization elapsed timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCreating) {
      const start = Date.now();
      interval = setInterval(() => {
        setElapsedSeconds(Math.floor((Date.now() - start) / 1000));
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isCreating]);

  // Set first file as selected if none selected
  useEffect(() => {
    if (stagedFiles.length > 0 && !selectedFileId) {
      setSelectedFileId(stagedFiles[0].id);
    }
  }, [stagedFiles, selectedFileId]);

  const activeStagedFile = stagedFiles.find(f => f.id === selectedFileId);

  // Output mappings for expected output highlights
  const outputMappings = {
    video: ["Sequence Blocks", "Key Moments", "Timeline Notes", "Metadata"],
    image: ["Visual Observations", "Marked Areas", "Quality Check", "Metadata"],
    audio: ["Transcript Segments", "Speaker Turns", "Time References", "Metadata"],
    document: ["Summary", "Key Sections", "Extracted Facts", "Page References"],
    unknown: ["Evidence Notes", "Source Details", "Metadata"]
  };

  // Add 1-click sandbox testing presets
  const presets = [
    { name: "CCTV_ZoneB_0512.mp4", type: "video" as const, sizeLabel: "42.4 MB", sizeBytes: 44458905 },
    { name: "dispatch_voice_log.mp3", type: "audio" as const, sizeLabel: "12.8 MB", sizeBytes: 13421772 },
    { name: "site_failure_photo.png", type: "image" as const, sizeLabel: "4.1 MB", sizeBytes: 4299161 },
    { name: "maintenance_log_report.pdf", type: "document" as const, sizeLabel: "1.2 MB", sizeBytes: 1258291 }
  ];

  const handleAddPreset = (preset: typeof presets[number]) => {
    if (stagedFiles.some(f => f.name === preset.name)) {
      toast.error("File already added to intake list");
      return;
    }

    const newFile: StagedFile = {
      id: Math.random().toString(36).substring(7),
      name: preset.name,
      type: preset.type,
      sizeLabel: preset.sizeLabel,
      sizeBytes: preset.sizeBytes,
      status: "READY",
      uploadedAt: new Date().toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })
    };

    setStagedFiles(prev => [...prev, newFile]);
    setSelectedFileId(newFile.id);
    toast.success(`Attached preset ${preset.type}: ${preset.name}`);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);

    const newFiles: StagedFile[] = files.map(file => {
      let type: "video" | "image" | "audio" | "document" | "unknown" = "unknown";
      const name = file.name.toLowerCase();
      if (name.match(/\.(mp4|webm|ogg|mov|avi)$/)) type = "video";
      else if (name.match(/\.(jpg|jpeg|png|gif|webp)$/)) type = "image";
      else if (name.match(/\.(mp3|wav|ogg|m4a|aac)$/)) type = "audio";
      else if (name.match(/\.(pdf|doc|docx|txt|xls|xlsx)$/)) type = "document";

      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);

      return {
        id: Math.random().toString(36).substring(7),
        name: file.name,
        type,
        sizeLabel: `${sizeMB} MB`,
        sizeBytes: file.size,
        status: "READY",
        rawFile: file,
        uploadedAt: new Date().toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })
      };
    });

    setStagedFiles(prev => [...prev, ...newFiles]);
    if (newFiles.length > 0) {
      setSelectedFileId(newFiles[0].id);
    }
    toast.success(`Staged ${files.length} custom files`);
  };

  const handleRemoveFile = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setStagedFiles(prev => {
      const filtered = prev.filter(f => f.id !== id);
      if (selectedFileId === id) {
        setSelectedFileId(filtered.length > 0 ? filtered[0].id : null);
      }
      return filtered;
    });
  };

  const handleCreateWorkspace = async () => {
    if (stagedFiles.length === 0) {
      toast.error("Please stage at least one evidence file");
      return;
    }

    try {
      setIsCreating(true);
      setCreateProgress(5);
      setActiveStep(0);

      // Create unique case number
      const year = new Date().getFullYear();
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const caseNumber = `CS-${year}-${randomSuffix}`;

      // Progress animation simulation
      const advanceProgress = (targetVal: number, duration: number) => {
        return new Promise<void>((resolve) => {
          let current = createProgress;
          const stepTime = Math.max(10, Math.floor(duration / (targetVal - current)));
          const interval = setInterval(() => {
            current += 1;
            setCreateProgress(current);
            if (current >= targetVal) {
              clearInterval(interval);
              resolve();
            }
          }, stepTime);
        });
      };

      await advanceProgress(20, 300);
      setActiveStep(1); // Attaching evidence...

      // 1. Create case
      const finalTitle = caseName.trim() || `New Case Staging - ${new Date().toLocaleDateString()}`;
      const caseResult = await createCaseMutation.mutateAsync({
        title: finalTitle,
        description: optionalDetails.description || `Case initialized with early evidence payload.`,
        severity: optionalDetails.severity as any,
        status: "open",
        case_number: caseNumber
      });

      await advanceProgress(55, 400);
      setActiveStep(2); // Preparing Evidence Review...

      // 2. Upload staged files
      const groups = [
        {
          name: "Intake Staging",
          isFolder: false,
          files: stagedFiles.map(item => {
            const fileObj = item.rawFile || new File(
              ["dummy content for mock forensic evidence intake blueprint"], 
              item.name, 
              { type: getFallbackMimeType(item.name) }
            );

            let category = "Document";
            if (item.type === "video") category = "Video";
            else if (item.type === "image") category = "Image";
            else if (item.type === "audio") category = "Audio";
            else if (item.type === "document") category = "Document";

            return {
              file: fileObj,
              category,
              relativePath: item.name
            };
          })
        }
      ];

      await uploadEvidenceMutation.mutateAsync({
        caseId: caseResult.id,
        groups
      });

      await advanceProgress(85, 300);
      setActiveStep(3); // Opening workspace...

      await advanceProgress(100, 200);

      toast.success("Workspace initialized successfully");
      navigate(`/cases/${caseResult.id}`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to initialize workspace");
      setIsCreating(false);
    }
  };

  // Determine what file types exist in the staging queue
  const hasType = (type: "video" | "image" | "audio" | "document") => {
    return stagedFiles.some(f => f.type === type);
  };

  return (
    <AppLayout hideHeader>
      <div className="flex flex-col h-screen overflow-hidden bg-slate-50/10">
        
        {/* Workspace Top Header (Mirroring CaseWorkspacePage) */}
        <div className="bg-white border-b px-6 py-4 flex items-center justify-between shrink-0 relative z-30">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/cases')}
              className="h-9 w-9 p-0 rounded-full hover:bg-slate-100 text-slate-500 border border-slate-100"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            
            <div>
              <div className="flex items-center gap-2 py-1 px-1.5 -ml-1.5">
                <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2 leading-none">
                  Create New Case
                </h1>
                <span className="text-slate-400 font-mono text-sm leading-none ml-1">#Draft-Workspace</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <Button variant="ghost" size="sm" className="text-xs font-bold text-slate-500 hover:bg-slate-50" onClick={() => navigate("/cases")}>Discard</Button>
             <Button 
               size="sm" 
               className={cn(
                 "h-9 font-bold px-6 text-xs gap-2 transition-all duration-300 uppercase tracking-wider rounded-lg shadow-sm border",
                 stagedFiles.length > 0 
                   ? "bg-slate-900 text-white hover:bg-slate-800" 
                   : "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
               )}
               disabled={stagedFiles.length === 0 || isCreating}
               onClick={handleCreateWorkspace}
             >
                {stagedFiles.length === 0 ? "Upload Evidence First" : "Create Workspace"}
             </Button>
          </div>
        </div>

        {/* Tab Navigation (Mirroring CaseWorkspacePage - Ghost Mode) */}
        <div className="bg-white border-b h-12 flex items-center justify-between px-6 shrink-0 relative z-20">
          <div className="flex gap-1 h-full items-center">
            {["Evidence Review", "Analysis", "Reports", "Review", "Audit Trail"].map((tab) => (
              <div
                key={tab}
                className={cn(
                  "h-full px-5 text-xs font-bold transition-all relative flex items-center select-none cursor-default",
                  tab === "Evidence Review" ? "text-primary bg-primary/5" : "text-slate-300 opacity-60"
                )}
              >
                {tab}
                {tab === "Evidence Review" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-2 border-l pl-6 border-slate-100">
                <Clock className="h-3.5 w-3.5 text-slate-300" />
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                  Drafting Case
                </span>
             </div>
          </div>
        </div>

        {/* THREE PANEL GRID LAYOUT */}
        <div className="flex-1 flex overflow-hidden relative">

          {/* LEFT PANEL: Evidence Intake */}
          <div className="w-[320px] border-r border-slate-200 bg-white flex flex-col shrink-0 z-10 shadow-[1px_0_10px_rgba(0,0,0,0.02)]">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Evidence Intake</span>
                {stagedFiles.length > 0 && (
                  <span className="text-[9px] font-black bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded border border-emerald-100 uppercase">
                    {stagedFiles.length} Files
                  </span>
                )}
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="text-[9.5px] font-black text-slate-800 hover:text-slate-900 border border-slate-200 hover:border-slate-300 px-2.5 py-1 rounded bg-slate-50 uppercase tracking-wider flex items-center gap-1 transition-all"
              >
                <Plus className="h-3 w-3" /> Tambah
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                multiple 
                className="hidden" 
                onChange={handleFileChange}
              />
            </div>

            {/* Evidence List Staging */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1.5">
              {stagedFiles.length > 0 ? (
                stagedFiles.map((file) => {
                  const Icon = file.type === 'video' ? FileVideo : file.type === 'image' ? FileImage : file.type === 'audio' ? FileAudio : FileText;
                  const isSelected = file.id === selectedFileId;
                  
                  return (
                    <div 
                      key={file.id} 
                      onClick={() => setSelectedFileId(file.id)}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg border text-left cursor-pointer transition-all",
                        isSelected 
                          ? "border-emerald-600 bg-emerald-50/20 shadow-2xs" 
                          : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50/50"
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={cn(
                          "h-8 w-8 rounded flex items-center justify-center shrink-0 border",
                          isSelected ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-slate-50 border-slate-100 text-slate-500"
                        )}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-bold text-slate-800 truncate block max-w-[150px]">{file.name}</span>
                            <span className={cn(
                              "text-[7px] font-black px-1 rounded uppercase tracking-wider",
                              file.type === 'video' ? "bg-indigo-100 text-indigo-700" : file.type === 'audio' ? "bg-amber-100 text-amber-700" : file.type === 'image' ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"
                            )}>
                              {file.type}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                            <span>{file.sizeLabel}</span>
                            <span>·</span>
                            <span className="text-emerald-600">{file.status}</span>
                          </div>
                        </div>
                      </div>
                      
                      <button 
                        onClick={(e) => handleRemoveFile(file.id, e)}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-all shrink-0 ml-2"
                        title="Remove evidence"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })
              ) : (
                // Hint/Empty State Rows
                <div className="space-y-2 p-2 pt-4">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block px-1 mb-3">Suggested Formats</span>
                  {[
                    { type: "Video Evidence", outputs: "Sequence Blocks · Key Moments", icon: FileVideo, color: "text-indigo-500", bg: "bg-indigo-50" },
                    { type: "Audio Evidence", outputs: "Transcript · Speaker Turns", icon: FileAudio, color: "text-amber-500", bg: "bg-amber-50" },
                    { type: "Image Evidence", outputs: "Observations · Quality Check", icon: FileImage, color: "text-emerald-500", bg: "bg-emerald-50" },
                    { type: "Document Evidence", outputs: "Summary · Extracted Facts", icon: FileText, color: "text-blue-500", bg: "bg-blue-50" }
                  ].map((hint, idx) => {
                    const HintIcon = hint.icon;
                    return (
                      <div key={idx} className="flex items-center gap-3 p-3 rounded-lg border border-dashed border-slate-200 bg-slate-50/20">
                        <div className={cn("h-8 w-8 rounded flex items-center justify-center border", hint.bg, hint.color)}>
                          <HintIcon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-[11px] font-bold text-slate-700 leading-none">{hint.type}</p>
                          <span className="text-[9px] text-slate-400 font-semibold block mt-1 leading-none">{hint.outputs}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* CENTER PANEL: Evidence Upload & Staged Preview */}
          <div className="flex-1 overflow-auto bg-[#f0f2f4] p-6 flex flex-col items-center custom-scrollbar relative" style={{ minWidth: 0 }}>
            <div className="w-full max-w-5xl flex flex-col h-full">
              
              {/* Header inside the workspace */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Evidence Workspace Draft</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase">Interactive Preview Canvas</span>
              </div>

              {/* Dynamic Center Canvas */}
              {stagedFiles.length > 0 && activeStagedFile ? (
                <div className="flex-1 flex flex-col gap-6 animate-in fade-in duration-300 bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm min-h-0 overflow-y-auto custom-scrollbar">
                  
                  {/* File Metadata Header */}
                  <div className="flex items-start justify-between border-b pb-4 shrink-0">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn(
                          "text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-wider text-white shadow-sm",
                          activeStagedFile.type === 'video' ? "bg-indigo-600" : activeStagedFile.type === 'audio' ? "bg-amber-600" : activeStagedFile.type === 'image' ? "bg-emerald-600" : "bg-blue-600"
                        )}>
                          {activeStagedFile.type}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{activeStagedFile.sizeLabel}</span>
                      </div>
                      <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">{activeStagedFile.name}</h3>
                    </div>
                    
                    <div className="text-right">
                      <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 rounded px-2 py-0.5 tracking-wider uppercase block">Staged Ready</span>
                      <span className="text-[9.5px] text-slate-400 font-bold block mt-1 uppercase tracking-tighter">Intake: {activeStagedFile.uploadedAt}</span>
                    </div>
                  </div>

                  {/* CUSTOM INTEGRATED STAGED PREVIEW WORKSPACES */}
                  <div className="flex-1 min-h-[220px] bg-slate-50 rounded-xl border border-slate-200/50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
                    
                    {/* VIDEO PREVIEW */}
                    {activeStagedFile.type === 'video' && (
                      <div className="w-full h-full flex flex-col justify-between">
                        {/* Mock Video Canvas Frame */}
                        <div className="flex-1 bg-slate-950 rounded-lg flex items-center justify-center relative group overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-80" />
                          
                          {/* CCTV Overlay details */}
                          <div className="absolute top-3 left-3 font-mono text-[9px] text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-600 animate-ping shrink-0" />
                            <span>REC · BLUEPRINT DRAFT VIDEO</span>
                          </div>

                          <div className="absolute bottom-3 left-3 font-mono text-[9px] text-white/80">
                            CAM 04 B - ZONE B COAL SLIP
                          </div>

                          {/* Play circle trigger */}
                          <button 
                            onClick={() => setIsPlaying(!isPlaying)}
                            className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center text-white hover:scale-105 hover:bg-white/30 transition-all shadow-lg"
                          >
                            {isPlaying ? <Pause className="h-5 w-5 fill-white" /> : <Play className="h-5 w-5 fill-white ml-0.5" />}
                          </button>
                        </div>
                        
                        {/* Waveform timeline placeholder */}
                        <div className="h-10 mt-3 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between px-3 text-[9px] font-mono text-slate-400">
                          <span className="text-[#2FAE8B]">00:00:00</span>
                          <div className="flex-1 mx-4 h-1 bg-slate-800 rounded relative">
                            <div className="absolute top-1/2 left-[35%] -translate-y-1/2 h-3 w-0.5 bg-emerald-500" />
                            <div className="absolute top-0 left-0 h-full bg-[#2FAE8B]/40 rounded w-[35%]" />
                          </div>
                          <span>00:04:12</span>
                        </div>
                      </div>
                    )}

                    {/* AUDIO PREVIEW */}
                    {activeStagedFile.type === 'audio' && (
                      <div className="w-full h-full flex flex-col justify-between p-4">
                        {/* Audio Waveform visualization */}
                        <div className="flex-1 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-center gap-0.5 p-6 relative">
                          <div className="absolute top-3 left-3 font-mono text-[9px] text-amber-500 uppercase tracking-widest">
                            AUDIO VOICE TIMELINE
                          </div>
                          {/* Draw mock waveform bars */}
                          {[15, 30, 20, 45, 60, 25, 40, 75, 90, 40, 55, 30, 20, 45, 65, 80, 50, 20, 35, 10, 45, 30, 60, 75, 40, 25, 50, 10, 15, 30].map((h, i) => (
                            <div 
                              key={i} 
                              className={cn(
                                "w-1 rounded-full transition-all duration-300",
                                isPlaying ? "bg-amber-500" : "bg-slate-700"
                              )} 
                              style={{ 
                                height: `${h}%`,
                                animation: isPlaying ? `pulse 1.2s ease-in-out infinite alternate ${i * 0.05}s` : 'none'
                              }} 
                            />
                          ))}
                        </div>

                        {/* Controls */}
                        <div className="h-10 mt-3 bg-white border border-slate-200 rounded-lg flex items-center justify-between px-3 text-[9px] font-mono text-slate-500 shadow-2xs">
                          <button 
                            onClick={() => setIsPlaying(!isPlaying)}
                            className="flex items-center gap-1.5 text-slate-800 hover:text-slate-900 font-bold"
                          >
                            {isPlaying ? <Pause className="h-3 w-3 fill-slate-800" /> : <Play className="h-3 w-3 fill-slate-800" />} PLAY DISPATCH LOG
                          </button>
                          <div className="flex items-center gap-1.5">
                            <Volume2 className="h-3.5 w-3.5 text-slate-400" />
                            <div className="w-16 h-1 bg-slate-200 rounded-full overflow-hidden">
                              <div className="h-full bg-slate-500 w-[80%]" />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* IMAGE PREVIEW */}
                    {activeStagedFile.type === 'image' && (
                      <div className="w-full h-full flex items-center justify-center p-2 relative bg-slate-900 rounded-lg overflow-hidden border border-slate-800">
                        <div className="absolute top-3 left-3 font-mono text-[9px] text-emerald-400 uppercase tracking-widest z-10 bg-slate-950/80 px-2 py-0.5 rounded border border-emerald-500/20">
                          OBSERVATION INSPECTOR
                        </div>
                        {/* Render placeholder image bounds */}
                        <div className="border border-emerald-500/20 p-8 rounded-xl bg-slate-950 flex flex-col items-center justify-center max-w-sm text-center relative group">
                          <div className="absolute -top-1.5 -left-1.5 h-3 w-3 border-t-2 border-l-2 border-emerald-500" />
                          <div className="absolute -top-1.5 -right-1.5 h-3 w-3 border-t-2 border-r-2 border-emerald-500" />
                          <div className="absolute -bottom-1.5 -left-1.5 h-3 w-3 border-b-2 border-l-2 border-emerald-500" />
                          <div className="absolute -bottom-1.5 -right-1.5 h-3 w-3 border-b-2 border-r-2 border-emerald-500" />
                          
                          <FileImage className="h-10 w-10 text-emerald-500 mb-3 animate-pulse" />
                          <p className="text-[10.5px] font-bold text-slate-300 uppercase tracking-wide">Image Bounds Staged</p>
                          <span className="text-[9px] text-slate-500 font-bold uppercase mt-1 leading-none">Auto Quality Analysis Queue</span>
                        </div>
                      </div>
                    )}

                    {/* DOCUMENT PREVIEW */}
                    {activeStagedFile.type === 'document' && (
                      <div className="w-full h-full flex flex-col bg-white border rounded-lg shadow-2xs p-4 text-left justify-between overflow-hidden">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between border-b pb-2">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                              <FileText className="h-3 w-3" /> Page Reference Blueprint
                            </span>
                            <span className="text-[8px] font-mono text-slate-400">PAGE 1 OF 3</span>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="h-2 w-32 bg-slate-200 rounded" />
                            <div className="h-1.5 w-full bg-slate-100 rounded" />
                            <div className="h-1.5 w-5/6 bg-slate-100 rounded" />
                            <div className="h-1.5 w-full bg-slate-100 rounded" />
                          </div>

                          <div className="border border-blue-100 bg-blue-50/20 p-2.5 rounded-lg space-y-1.5">
                            <span className="text-[8px] font-black text-blue-700 uppercase tracking-widest block leading-none">Auto Fact Decomposition Target</span>
                            <div className="h-1.5 w-3/4 bg-blue-200/30 rounded" />
                            <div className="h-1.5 w-1/2 bg-blue-200/30 rounded" />
                          </div>
                        </div>

                        <span className="text-[8px] text-slate-400 uppercase tracking-wider block border-t pt-2 mt-2 leading-none text-center">Decompilation model staged successfully</span>
                      </div>
                    )}

                  </div>

                  {/* Extraction Pipeline Queue placeholder */}
                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 border border-emerald-100">
                        <Brain className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <p className="text-[11.5px] font-bold text-slate-800 leading-none">Extraction queued for initialization</p>
                        <span className="text-[9.5px] text-[#2FAE8B] font-bold block mt-1 uppercase tracking-wide">
                          ⚙️ Pipeline starts automatically upon workspace creation
                        </span>
                      </div>
                    </div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider italic">Engine Standby</span>
                  </div>

                  {/* Small Case Title inline setup */}
                  <div className="border-t border-slate-100 pt-5 mt-2 flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-4 items-start">
                      
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Case Name</label>
                        <Input 
                          className="h-9 text-xs border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-bold text-slate-800 rounded-lg" 
                          placeholder="Auto-generated from uploaded evidence" 
                          value={caseName}
                          onChange={(e) => {
                            setCaseName(e.target.value);
                            setIsTitleManuallyEdited(true);
                          }}
                        />
                        <span className="text-[9px] text-slate-400 font-semibold mt-1 block">You can rename this case catalog entry later inside the workspace.</span>
                      </div>

                      {/* Collapsed Options Drawer */}
                      <div className="space-y-1.5 flex flex-col">
                        <button
                          onClick={() => setShowOptionalDetails(!showOptionalDetails)}
                          className="text-[10px] font-black text-slate-500 hover:text-slate-800 uppercase tracking-wider flex items-center gap-1 mt-6 transition-all"
                        >
                          {showOptionalDetails ? "▼ Hide optional case details" : "▶ Add optional case details"}
                        </button>
                        <span className="text-[9px] text-slate-400 font-semibold leading-none">These details can be completed later.</span>
                      </div>

                    </div>

                    {showOptionalDetails && (
                      <div className="bg-slate-50/50 p-4 border rounded-xl space-y-4 animate-in slide-in-from-top-2 duration-200">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block border-b pb-2">Staged Incident Parameters</span>
                        
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[9.5px] font-black text-slate-500 uppercase tracking-widest">Site Location</label>
                            <select 
                              className="flex h-9 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 outline-none"
                              value={optionalDetails.site}
                              onChange={(e) => setOptionalDetails(prev => ({ ...prev, site: e.target.value }))}
                            >
                              <option>Site Alpha - Northern Link</option>
                              <option>Site Beta - Processing Area</option>
                              <option>Site Gamma - Storage Facility</option>
                            </select>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[9.5px] font-black text-slate-500 uppercase tracking-widest">Event Occurred</label>
                            <Input 
                              type="datetime-local" 
                              className="h-9 text-xs border-slate-200 bg-white rounded-lg text-slate-700" 
                              value={optionalDetails.date}
                              onChange={(e) => setOptionalDetails(prev => ({ ...prev, date: e.target.value }))}
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[9.5px] font-black text-slate-500 uppercase tracking-widest">Severity Priority</label>
                            <select 
                              className="flex h-9 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-750 outline-none"
                              value={optionalDetails.severity}
                              onChange={(e) => setOptionalDetails(prev => ({ ...prev, severity: e.target.value }))}
                            >
                              <option>Critical</option>
                              <option>High</option>
                              <option>Medium</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[9.5px] font-black text-slate-500 uppercase tracking-widest">Initial Context Summary</label>
                          <Textarea 
                            className="min-h-[60px] text-xs border-slate-200 bg-white focus:bg-white transition-all font-medium leading-relaxed rounded-lg" 
                            placeholder="Add brief details about the event context if available..."
                            value={optionalDetails.description}
                            onChange={(e) => setOptionalDetails(prev => ({ ...prev, description: e.target.value }))}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              ) : (
                // Center Empty State Upload Card (Structured like future preview)
                <div className="flex-1 bg-white border border-slate-200/60 rounded-2xl p-8 flex flex-col justify-between shadow-sm min-h-[360px] overflow-hidden relative">
                  
                  <div className="border-b pb-4 flex justify-between items-center">
                    <div>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.25em] block">Setup Guidance</span>
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Workspace Initialization Intake</h4>
                    </div>
                    <span className="text-[8px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded tracking-widest uppercase">Draft Standby</span>
                  </div>

                  {/* Intake Upload Core Area */}
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center my-6">
                    <div className="h-16 w-16 rounded-[2rem] bg-slate-50 flex items-center justify-center mb-6 border border-slate-200/50 shadow-2xs relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                       <Upload className="h-7 w-7 text-slate-400 group-hover:scale-105 transition-transform" />
                       <div className="absolute inset-0 rounded-full border border-emerald-500/20 animate-ping opacity-30" />
                    </div>
                    
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-[0.2em] mb-2">Upload evidence to create workspace</h3>
                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest max-w-[420px] leading-relaxed mb-6">
                      Drop video, image, audio, or document files. The review workspace will be prepared automatically from your staged evidence.
                    </p>

                    {/* Presets Intake bar */}
                    <div className="bg-slate-50/80 border border-slate-100 p-4 rounded-xl max-w-xl w-full">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-3">1-Click Mock Intake Presets (Select to test)</span>
                      <div className="grid grid-cols-4 gap-2">
                        {presets.map((preset) => {
                          const Icon = preset.type === 'video' ? FileVideo : preset.type === 'image' ? FileImage : preset.type === 'audio' ? FileAudio : FileText;
                          return (
                            <button
                              key={preset.name}
                              onClick={() => handleAddPreset(preset)}
                              className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200/80 hover:border-slate-400 hover:shadow-2xs text-left transition-all"
                            >
                              <div className="h-6 w-6 rounded bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100 text-slate-500">
                                <Icon className="h-3.5 w-3.5" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-[9.5px] font-black text-slate-700 truncate leading-none mb-0.5">{preset.name}</p>
                                <span className="text-[7.5px] text-slate-400 font-bold uppercase">{preset.type}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Ghost Preview Footer */}
                  <div className="border-t border-slate-100 pt-4 flex justify-between items-center text-[10.5px] font-medium text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Info className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>Staging files automatically configures your extraction pipelines. You can customize details later.</span>
                    </span>
                    <span className="text-[9px] font-black text-[#2FAE8B] uppercase tracking-wider">WYSIWYG INTENT ACTIVE</span>
                  </div>

                </div>
              )}

            </div>
          </div>

          {/* RIGHT PANEL: Expected Review Output */}
          <div className="w-[460px] border-l border-slate-200 bg-white flex flex-col shrink-0 z-20 shadow-[-2px_0_10px_rgba(0,0,0,0.03)] overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between shrink-0">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Expected Review Output</span>
              <span className="text-[9px] font-bold text-slate-400 uppercase">Analysis Target Schema</span>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
              
              {stagedFiles.length === 0 ? (
                <div className="h-[240px] border border-dashed rounded-xl flex flex-col items-center justify-center p-6 text-center text-slate-400 bg-slate-50/20">
                  <Cpu className="h-8 w-8 text-slate-300 mb-3 animate-pulse" />
                  <p className="text-[11.5px] font-black uppercase tracking-wider">Ready when evidence is added</p>
                  <span className="text-[10px] text-slate-400 mt-1 max-w-[200px] leading-relaxed">
                    Review outputs will adapt to your uploaded file type distribution automatically.
                  </span>
                </div>
              ) : (
                <div className="bg-emerald-50/30 border border-emerald-100 rounded-xl p-4 flex gap-3 mb-2 animate-in fade-in duration-300">
                  <Brain className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[11.5px] font-black text-emerald-950 block leading-tight">Workspace Blueprint Matched</span>
                    <span className="text-[9.5px] text-emerald-800 font-semibold block mt-1">
                      Matched {Array.from(new Set(stagedFiles.map(f => f.type))).length} format schema(s). Active review console modules are highlighted below.
                    </span>
                  </div>
                </div>
              )}

              {/* Granular Expected output cards */}
              {[
                {
                  type: "video",
                  label: "Video Evidence Outputs",
                  active: hasType("video"),
                  desc: "Sequence blocks, key moments, and timeline notes.",
                  bullets: ["Frame-accurate Timeline Indexes", "Visual Event Keyframes", "Action Sequence Markers", "Incident Chronology Notes"],
                  color: "border-indigo-100 bg-indigo-50/10 text-indigo-700 hover:border-indigo-300 shadow-2xs"
                },
                {
                  type: "audio",
                  label: "Audio Evidence Outputs",
                  active: hasType("audio"),
                  desc: "Transcript segments, speaker turns, and time references.",
                  bullets: ["Synchronized Voice Transcripts", "Speaker Identification & Logs", "Acoustic Event Timestamps", "Communication Derivations"],
                  color: "border-amber-100 bg-amber-50/10 text-amber-700 hover:border-amber-300 shadow-2xs"
                },
                {
                  type: "image",
                  label: "Image Evidence Outputs",
                  active: hasType("image"),
                  desc: "Visual observations, marked areas, and quality check.",
                  bullets: ["Target Focus Observations", "Incident Region Markups", "Visual Quality Warnings", "Image Metadata Extraction"],
                  color: "border-emerald-100 bg-emerald-50/10 text-emerald-700 hover:border-emerald-300 shadow-2xs"
                },
                {
                  type: "document",
                  label: "Document Evidence Outputs",
                  active: hasType("document"),
                  desc: "Summary, key sections, facts, and page references.",
                  bullets: ["Decomposed Fact Inventories", "Page & Section References", "Executive Structural Summaries", "Extracted Name-Entity Registers"],
                  color: "border-blue-100 bg-blue-50/10 text-blue-700 hover:border-blue-300 shadow-2xs"
                }
              ].map((card) => {
                const isActive = card.active;
                
                return (
                  <div 
                    key={card.type}
                    className={cn(
                      "p-4 rounded-xl border text-left transition-all duration-300 relative",
                      isActive 
                        ? card.color 
                        : "border-slate-100 bg-white opacity-40 grayscale"
                    )}
                  >
                    {isActive && (
                      <div className="absolute top-3.5 right-3.5 h-4 w-4 bg-[#2FAE8B] text-white rounded-full flex items-center justify-center shadow-sm">
                        <Check className="h-2.5 w-2.5" />
                      </div>
                    )}
                    
                    <h5 className="text-[11.5px] font-black uppercase tracking-wider mb-0.5">{card.label}</h5>
                    <p className="text-[10px] text-slate-500 font-bold mb-3 leading-snug">{card.desc}</p>
                    
                    <div className="space-y-1.5 border-t border-slate-200/50 pt-3">
                      {card.bullets.map((b, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-[9.5px] font-medium text-slate-600">
                          <CheckCircle2 className={cn("h-3 w-3 shrink-0", isActive ? "text-emerald-500" : "text-slate-350")} />
                          <span>{b}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

            </div>
          </div>

        </div>

        {/* INLINE CENTER TRANSITION LOADING STATE */}
        {isCreating && (
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-2xs z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8 border border-slate-200 animate-in zoom-in-95 duration-200 flex flex-col items-center text-center">
              
              {/* Spinning Ring */}
              <div className="relative h-16 w-16 flex items-center justify-center mb-6">
                <div className="absolute inset-0 rounded-full border-2 border-slate-100 animate-pulse" />
                <div className="absolute inset-0 rounded-full border-2 border-t-emerald-600 animate-spin" />
                <Database className="h-6 w-6 text-slate-900" />
              </div>

              <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Intake handshaking</span>
              <h3 className="text-base font-black text-slate-800 uppercase tracking-wider mb-1">Creating workspace</h3>
              <p className="text-2xs text-slate-400 uppercase tracking-widest mb-6">
                {createProgress}% · 00:{elapsedSeconds.toString().padStart(2, '0')} elapsed
              </p>

              {/* Progress Bar */}
              <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden mb-6 border">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-300 rounded-full" 
                  style={{ width: `${createProgress}%` }} 
                />
              </div>

              {/* Small validation checks checklist */}
              <div className="w-full text-left space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                {[
                  { id: 0, label: "Creating Case Index" },
                  { id: 1, label: "Attaching Evidence Staging" },
                  { id: 2, label: "Preparing Evidence Review" },
                  { id: 3, label: "Opening Workspace dashboard" }
                ].map((step) => {
                  const isDone = activeStep > step.id;
                  const isActive = activeStep === step.id;
                  return (
                    <div key={step.id} className="flex items-center gap-2.5">
                      <div className={cn(
                        "h-3.5 w-3.5 rounded-full flex items-center justify-center border shrink-0",
                        isDone ? "bg-emerald-500 border-emerald-500 text-white" : isActive ? "border-emerald-600 bg-white" : "border-slate-200"
                      )}>
                        {isDone ? <Check className="h-2 w-2" /> : isActive ? <Loader2 className="h-2 w-2 text-emerald-600 animate-spin" /> : null}
                      </div>
                      <span className={cn(
                        isDone ? "text-slate-700" : isActive ? "text-slate-900" : "text-slate-350"
                      )}>{step.label}</span>
                    </div>
                  );
                })}
              </div>

            </div>
          </div>
        )}

      </div>
    </AppLayout>
  );
}
