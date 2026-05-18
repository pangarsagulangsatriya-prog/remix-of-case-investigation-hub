import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  CheckCircle2, Upload, Plus, Brain, Loader2, 
  Calendar, MapPin, ChevronRight, FileVideo, FileImage, 
  FileAudio, FileText, ArrowRight, Trash2, ToggleLeft, 
  ToggleRight, Sparkles, Check, Database, Clock, 
  ShieldCheck, AlertCircle, PlayCircle, Eye, Info, HelpCircle
} from "lucide-react";
import { useCreateCase } from "@/hooks/useCases";
import { useUploadEvidence } from "@/hooks/useEvidence";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type InitialEvidenceFile = {
  id: string;
  fileName: string;
  fileType: "video" | "image" | "audio" | "document" | "unknown";
  sizeLabel: string;
  status: "queued" | "uploaded" | "failed";
  expectedOutputs: string[];
  rawFile?: File;
};

type WorkspaceInitializerState = {
  title: string;
  eventOccurrence: string;
  siteNode: string;
  severity: "Critical" | "High" | "Medium";
  executiveSummary: string;
  uploadedEvidence: InitialEvidenceFile[];
  autoStartExtraction: boolean;
};

function getFallbackMimeType(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'png': return 'image/png';
    case 'jpg':
    case 'jpeg': return 'image/jpeg';
    case 'mp4': return 'video/mp4';
    case 'mp3': return 'audio/mpeg';
    case 'wav': return 'audio/wav';
    case 'pdf': return 'application/pdf';
    case 'txt': return 'text/plain';
    default: return 'application/octet-stream';
  }
}

export default function CreateCasePage() {
  const navigate = useNavigate();
  const createCaseMutation = useCreateCase();
  const uploadEvidenceMutation = useUploadEvidence();

  // Unified Blueprint state
  const [state, setState] = useState<WorkspaceInitializerState>({
    title: "",
    eventOccurrence: "",
    siteNode: "Site Alpha - Northern Link",
    severity: "Critical",
    executiveSummary: "",
    uploadedEvidence: [],
    autoStartExtraction: true,
  });

  const [isInitializing, setIsInitializing] = useState(false);
  const [initStep, setInitStep] = useState(0);
  const [initProgress, setInitProgress] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Timer for initialization progress
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isInitializing) {
      const start = Date.now();
      interval = setInterval(() => {
        setElapsedSeconds(Math.floor((Date.now() - start) / 1000));
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isInitializing]);

  // Visual checklist validations
  const checks = {
    caseIdentity: state.title.trim().length > 5 && state.eventOccurrence !== "",
    incidentParameters: state.severity !== undefined,
    siteClassification: state.siteNode !== "",
    executiveSummary: state.executiveSummary.trim().length >= 20,
    evidenceAttachment: state.uploadedEvidence.length > 0,
    extractionPlan: state.uploadedEvidence.length > 0 && state.autoStartExtraction
  };

  const isReady = checks.caseIdentity && checks.siteClassification && checks.executiveSummary;

  // Expected Outputs mappings
  const outputMappings = {
    video: ["Sequence Blocks", "Key Moments", "Timeline Notes", "Metadata"],
    image: ["Visual Observations", "Marked Areas", "Quality Check", "Metadata"],
    audio: ["Transcript Segments", "Speaker Turns", "Time References", "Metadata"],
    document: ["Summary", "Key Sections", "Extracted Facts", "Page References"],
    unknown: ["Evidence Notes", "Source Details", "Metadata"]
  };

  // Add sample mock files presets
  const presets = [
    {
      fileName: "CCTV_ZoneB_0512.mp4",
      fileType: "video" as const,
      sizeLabel: "42.4 MB"
    },
    {
      fileName: "dispatch_voice_log.mp3",
      fileType: "audio" as const,
      sizeLabel: "12.8 MB"
    },
    {
      fileName: "site_failure_photo.png",
      fileType: "image" as const,
      sizeLabel: "4.1 MB"
    },
    {
      fileName: "maintenance_log_report.pdf",
      fileType: "document" as const,
      sizeLabel: "1.2 MB"
    }
  ];

  const handleAddPreset = (preset: typeof presets[number]) => {
    if (state.uploadedEvidence.find(f => f.fileName === preset.fileName)) {
      toast.error("File already added to queue");
      return;
    }
    
    const newFile: InitialEvidenceFile = {
      id: Math.random().toString(36).substring(7),
      fileName: preset.fileName,
      fileType: preset.fileType,
      sizeLabel: preset.sizeLabel,
      status: "queued",
      expectedOutputs: outputMappings[preset.fileType]
    };

    setState(prev => ({
      ...prev,
      uploadedEvidence: [...prev.uploadedEvidence, newFile]
    }));
    toast.success(`Attached sample ${preset.fileType}: ${preset.fileName}`);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    
    const newFiles: InitialEvidenceFile[] = files.map(file => {
      let fileType: "video" | "image" | "audio" | "document" | "unknown" = "unknown";
      const name = file.name.toLowerCase();
      if (name.match(/\.(mp4|webm|ogg|mov|avi)$/)) fileType = "video";
      else if (name.match(/\.(jpg|jpeg|png|gif|webp)$/)) fileType = "image";
      else if (name.match(/\.(mp3|wav|ogg|m4a|aac)$/)) fileType = "audio";
      else if (name.match(/\.(pdf|doc|docx|txt|xls|xlsx)$/)) fileType = "document";

      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);

      return {
        id: Math.random().toString(36).substring(7),
        fileName: file.name,
        fileType,
        sizeLabel: `${sizeMB} MB`,
        status: "queued",
        expectedOutputs: outputMappings[fileType],
        rawFile: file
      };
    });

    setState(prev => ({
      ...prev,
      uploadedEvidence: [...prev.uploadedEvidence, ...newFiles]
    }));
    toast.success(`Staged ${files.length} custom files for upload`);
  };

  const handleRemoveFile = (id: string) => {
    setState(prev => ({
      ...prev,
      uploadedEvidence: prev.uploadedEvidence.filter(f => f.id !== id)
    }));
  };

  const handleInitialize = async () => {
    if (!isReady) {
      toast.error("Please fill in all required operational metadata");
      return;
    }

    try {
      setIsInitializing(true);
      setInitProgress(5);
      setInitStep(0);

      // STEP 1: Create the case record in Supabase
      const year = new Date().getFullYear();
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const caseNumber = `CS-${year}-${randomSuffix}`;

      // Progress animation simulation helper
      const advanceProgress = (targetVal: number, duration: number) => {
        return new Promise<void>((resolve) => {
          let current = initProgress;
          const stepTime = Math.max(10, Math.floor(duration / (targetVal - current)));
          const interval = setInterval(() => {
            current += 1;
            setInitProgress(current);
            if (current >= targetVal) {
              clearInterval(interval);
              resolve();
            }
          }, stepTime);
        });
      };

      await advanceProgress(20, 400);
      setInitStep(1); // Preparing evidence repository...

      const caseResult = await createCaseMutation.mutateAsync({
        title: state.title,
        description: state.executiveSummary,
        severity: state.severity,
        status: "open",
        case_number: caseNumber
      });

      await advanceProgress(45, 600);
      setInitStep(2); // Attaching staged payload files...

      // STEP 2: Upload evidence files if present
      if (state.uploadedEvidence.length > 0) {
        const groups = [
          {
            name: "Intake Staging",
            isFolder: false,
            files: state.uploadedEvidence.map(item => {
              const fileObj = item.rawFile || new File(
                ["dummy content for mock forensic evidence intake blueprint"], 
                item.fileName, 
                { type: getFallbackMimeType(item.fileName) }
              );

              let category = "Document";
              if (item.fileType === "video") category = "Video";
              else if (item.fileType === "image") category = "Image";
              else if (item.fileType === "audio") category = "Audio";
              else if (item.fileType === "document") category = "Document";

              return {
                file: fileObj,
                category,
                relativePath: item.fileName
              };
            })
          }
        ];

        await uploadEvidenceMutation.mutateAsync({
          caseId: caseResult.id,
          groups
        });
      }

      await advanceProgress(75, 500);
      setInitStep(3); // Setting up auto-start extraction queues...

      await advanceProgress(95, 500);
      setInitStep(4); // Handshake complete, opening workspace...
      await advanceProgress(100, 200);

      toast.success("Workspace blueprint instantiated successfully!");
      navigate(`/cases/${caseResult.id}`);
    } catch (error) {
      console.error(error);
      toast.error("Blueprint instantiation failed");
      setIsInitializing(false);
    }
  };

  const fileTypeDistribution = () => {
    const counts = { video: 0, image: 0, audio: 0, document: 0, unknown: 0 };
    state.uploadedEvidence.forEach(f => {
      counts[f.fileType] = (counts[f.fileType] || 0) + 1;
    });
    return counts;
  };

  const dist = fileTypeDistribution();

  return (
    <AppLayout>
      <div className="flex flex-col h-full bg-[#f8fafc] overflow-hidden relative">
        
        {/* Workspace Title bar */}
        <div className="h-14 border-b bg-white flex items-center justify-between px-6 shrink-0 shadow-sm relative z-10">
           <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-slate-950 rounded-lg flex items-center justify-center text-white shadow-md">
                 <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h1 className="text-xs font-black text-slate-900 uppercase tracking-widest leading-none">Case Blueprint Builder</h1>
                <span className="text-[10px] text-slate-400 font-bold tracking-wider mt-1 block">New Investigation Workspace</span>
              </div>
           </div>
           
           <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" className="text-xs font-bold text-slate-500 hover:bg-slate-50 rounded-lg h-9" onClick={() => navigate("/cases")}>Discard</Button>
              <Button 
                size="sm" 
                className={cn(
                  "h-9 text-xs font-black px-6 gap-2 rounded-lg uppercase tracking-wider shadow-sm transition-all",
                  isReady 
                    ? "bg-[#0F172A] hover:bg-[#1E293B] text-white" 
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                )}
                disabled={!isReady || isInitializing}
                onClick={handleInitialize}
              >
                 {isReady ? "Initialize Workspace" : "Complete required fields"}
              </Button>
           </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          <div className="max-w-7xl mx-auto space-y-6">

            {/* FLOW DIAGRAM BAR */}
            <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.25em]">Workspace Setup Blueprint</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase">Interactive Setup Map</span>
              </div>
              
              <div className="flex items-center w-full justify-between px-4 py-2 relative">
                
                {/* Connecting Line Background */}
                <div className="absolute top-1/2 left-0 w-full h-[2px] bg-slate-100 -translate-y-1/2 -z-0" />
                
                {/* Active connecting lines based on progression */}
                <div 
                  className="absolute top-1/2 left-0 h-[2px] bg-[#2FAE8B] -translate-y-1/2 -z-0 transition-all duration-500" 
                  style={{ 
                    width: checks.caseIdentity 
                      ? checks.evidenceAttachment 
                        ? "100%" 
                        : "50%" 
                      : "0%" 
                  }} 
                />

                {/* Node 1: Identity */}
                <div className="flex flex-col items-center z-10 bg-white px-2">
                  <div className={cn(
                    "h-8 w-8 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                    checks.caseIdentity ? "bg-emerald-50 border-emerald-500 text-emerald-600 shadow-sm" : "border-slate-200 bg-slate-50 text-slate-400"
                  )}>
                    <Check className={cn("h-4 w-4", checks.caseIdentity ? "block" : "hidden")} />
                    <span className={cn("text-xs font-black", !checks.caseIdentity ? "block" : "hidden")}>1</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-700 mt-2">Case Identity</span>
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-wide">{checks.caseIdentity ? "READY" : "REQUIRED"}</span>
                </div>

                {/* Node 2: Severity */}
                <div className="flex flex-col items-center z-10 bg-white px-2">
                  <div className={cn(
                    "h-8 w-8 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                    checks.incidentParameters ? "bg-emerald-50 border-emerald-500 text-emerald-600 shadow-sm" : "border-slate-200 bg-slate-50 text-slate-400"
                  )}>
                    <Check className={cn("h-4 w-4", checks.incidentParameters ? "block" : "hidden")} />
                    <span className={cn("text-xs font-black", !checks.incidentParameters ? "block" : "hidden")}>2</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-700 mt-2">Severity</span>
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-wide">CONFIGURED</span>
                </div>

                {/* Node 3: Evidence Payload */}
                <div className="flex flex-col items-center z-10 bg-white px-2">
                  <div className={cn(
                    "h-8 w-8 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                    checks.evidenceAttachment ? "bg-emerald-50 border-emerald-500 text-emerald-600 shadow-sm" : "border-slate-200 bg-slate-50 text-slate-400"
                  )}>
                    <Check className={cn("h-4 w-4", checks.evidenceAttachment ? "block" : "hidden")} />
                    <span className={cn("text-xs font-black", !checks.evidenceAttachment ? "block" : "hidden")}>3</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-700 mt-2">Evidence Payload</span>
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-wide">{checks.evidenceAttachment ? "ATTACHED" : "OPTIONAL"}</span>
                </div>

                {/* Node 4: Extraction Plan */}
                <div className="flex flex-col items-center z-10 bg-white px-2">
                  <div className={cn(
                    "h-8 w-8 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                    checks.extractionPlan ? "bg-emerald-50 border-emerald-500 text-emerald-600 shadow-sm" : "border-slate-200 bg-slate-50 text-slate-400"
                  )}>
                    <Check className={cn("h-4 w-4", checks.extractionPlan ? "block" : "hidden")} />
                    <span className={cn("text-xs font-black", !checks.extractionPlan ? "block" : "hidden")}>4</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-700 mt-2">Extraction Plan</span>
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-wide">{checks.extractionPlan ? "ENGAGED" : "STANDBY"}</span>
                </div>

                {/* Node 5: Review Workspace */}
                <div className="flex flex-col items-center z-10 bg-white px-2">
                  <div className={cn(
                    "h-8 w-8 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                    isReady ? "bg-emerald-50 border-emerald-500 text-emerald-600 shadow-sm" : "border-slate-200 bg-slate-50 text-slate-400"
                  )}>
                    <Check className={cn("h-4 w-4", isReady ? "block" : "hidden")} />
                    <span className={cn("text-xs font-black", !isReady ? "block" : "hidden")}>5</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-700 mt-2">Review Workspace</span>
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-wide">{isReady ? "READY" : "WAITING"}</span>
                </div>

              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-[10.5px] font-medium text-slate-500">
                <span>💡 Your workspace will automatically follow this blueprint structure after initialization.</span>
                <span className="text-[9px] font-bold text-[#2FAE8B] uppercase">WYSIWYG Mode Active</span>
              </div>
            </div>

            {/* TWO COLUMN GRID */}
            <div className="grid grid-cols-12 gap-6">
              
              {/* LEFT COLUMN: Setup blueprint forms */}
              <div className="col-span-8 space-y-6">

                {/* Incident Identity Card */}
                <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm p-6 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-[#2FAE8B]/20" />
                  
                  <div className="mb-6">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1">Incident Identity</h3>
                    <p className="text-2xs text-slate-400 font-bold uppercase tracking-widest">Establish the primary investigation record</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Investigation Title</label>
                        <span className="text-[9px] font-semibold text-slate-400">Title will become the workspace header</span>
                      </div>
                      <Input 
                        className="h-10 text-xs border-slate-200 bg-slate-50/30 focus:bg-white transition-all font-medium rounded-lg" 
                        placeholder="e.g. Conveyor Belt Failure - Zone B Site Alpha" 
                        value={state.title}
                        onChange={(e) => setState(prev => ({ ...prev, title: e.target.value }))}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Event Occurence</label>
                        <Input 
                          type="datetime-local" 
                          className="h-10 text-xs border-slate-200 bg-slate-50/30 rounded-lg text-slate-700" 
                          value={state.eventOccurrence}
                          onChange={(e) => setState(prev => ({ ...prev, eventOccurrence: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Site / Node Location</label>
                        <select 
                          className="flex h-10 w-full rounded-lg border border-slate-200 bg-slate-50/30 px-3 py-2 text-xs font-bold text-slate-700 outline-none"
                          value={state.siteNode}
                          onChange={(e) => setState(prev => ({ ...prev, siteNode: e.target.value }))}
                        >
                          <option>Site Alpha - Northern Link</option>
                          <option>Site Beta - Processing Area</option>
                          <option>Site Gamma - Storage Facility</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Classification & Severity Card */}
                <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm p-6 space-y-6">
                  <div>
                     <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1">Classification & Severity</h3>
                     <p className="text-2xs text-slate-400 font-bold uppercase tracking-widest">Categorize the incident impact level</p>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { level: "Critical", label: "Level 5", color: "text-rose-600", border: "border-rose-100", bg: "bg-rose-50/30", ring: "ring-rose-500/20", desc: "Major incident or high operational impact." },
                      { level: "High", label: "Level 4", color: "text-amber-600", border: "border-amber-100", bg: "bg-amber-50/30", ring: "ring-amber-500/20", desc: "Significant incident requiring structured review." },
                      { level: "Medium", label: "Level 3", color: "text-emerald-700", border: "border-emerald-100", bg: "bg-emerald-50/30", ring: "ring-emerald-500/20", desc: "Moderate incident requiring documentation." }
                    ].map((s) => (
                      <button 
                         key={s.level}
                         onClick={() => setState(prev => ({ ...prev, severity: s.level as any }))}
                         className={cn(
                           "p-4 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between h-[110px]",
                           state.severity === s.level 
                             ? `border-slate-900 ${s.bg} ring-1 ring-slate-900/10 shadow-sm` 
                             : "border-slate-200/60 hover:bg-slate-50"
                         )}
                      >
                         <div>
                           <span className={cn("text-[9px] font-black uppercase tracking-[0.15em] block mb-0.5", s.color)}>{s.level}</span>
                           <span className="text-xs font-black text-slate-800">{s.label}</span>
                         </div>
                         <p className="text-[10px] text-slate-400 font-medium leading-normal mt-2 leading-snug">{s.desc}</p>
                         {state.severity === s.level && (
                           <div className="absolute top-1.5 right-1.5 h-3.5 w-3.5 bg-slate-950 text-white rounded-full flex items-center justify-center">
                             <Check className="h-2 w-2" />
                           </div>
                         )}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-1.5">
                     <div className="flex justify-between items-center">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Initial Executive Summary</label>
                       <span className="text-[9px] font-semibold text-slate-400">Min. 100 characters for optimal mapping</span>
                     </div>
                     <Textarea 
                        className="min-h-[100px] text-xs border-slate-200 bg-slate-50/30 focus:bg-white transition-all font-medium leading-relaxed rounded-lg" 
                        placeholder="Provide a high-level overview of the incident as currently understood..." 
                        value={state.executiveSummary}
                        onChange={(e) => setState(prev => ({ ...prev, executiveSummary: e.target.value }))}
                     />
                     <div className="flex justify-between items-center mt-1">
                       <span className="text-[9px] text-slate-400 font-bold uppercase">Executive summary will outline early walking timeline parameters</span>
                       <span className={cn(
                         "text-[9px] font-bold",
                         state.executiveSummary.length >= 20 ? "text-emerald-600" : "text-amber-500"
                       )}>
                         {state.executiveSummary.length} / 100 chars
                       </span>
                     </div>
                  </div>
                </div>

                {/* Evidence Payload Intake Card */}
                <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm p-6 space-y-6">
                  <div className="flex justify-between items-start">
                    <div>
                       <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1">Evidence Payload</h3>
                       <p className="text-2xs text-slate-400 font-bold uppercase tracking-widest">Attach early files for immediate extraction after workspace creation.</p>
                    </div>
                    <span className="text-[8px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded tracking-widest uppercase">Intake Portal</span>
                  </div>

                  {/* Upload Dropzone */}
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-slate-400 transition-all cursor-pointer bg-slate-50/30 relative group">
                     <input 
                       type="file" 
                       multiple 
                       onChange={handleFileChange}
                       className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                     />
                     <div className="h-10 w-10 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform">
                        <Upload className="h-4 w-4 text-slate-500" />
                     </div>
                     <p className="text-xs font-black text-slate-900">
                        Drop investigation assets here or{" "}
                        <span className="text-slate-900 underline decoration-2 underline-offset-4">browse corporate storage</span>
                     </p>
                     <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.15em] mt-2">VIDEO, IMAGE, AUDIO, DOCUMENT • MAX 250MB / FILE</p>
                  </div>

                  {/* Interactive Mock Presets */}
                  <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] block mb-3">Instant Preset Sandbox (Click to Attach)</span>
                    <div className="grid grid-cols-4 gap-2">
                      {presets.map((preset) => {
                        const Icon = preset.fileType === 'video' ? FileVideo : preset.fileType === 'image' ? FileImage : preset.fileType === 'audio' ? FileAudio : FileText;
                        const isStaged = state.uploadedEvidence.some(e => e.fileName === preset.fileName);
                        return (
                          <button
                            key={preset.fileName}
                            onClick={() => handleAddPreset(preset)}
                            disabled={isStaged}
                            className={cn(
                              "flex items-center gap-2 p-2 rounded-lg border text-left transition-all",
                              isStaged 
                                ? "bg-slate-100 border-slate-200 opacity-60 text-slate-400 cursor-not-allowed" 
                                : "bg-white border-slate-200 hover:border-slate-400 hover:shadow-sm"
                            )}
                          >
                            <div className="h-6 w-6 rounded bg-slate-50 flex items-center justify-center shrink-0">
                              <Icon className="h-3.5 w-3.5 text-slate-500" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[10px] font-bold text-slate-700 truncate leading-none mb-0.5">{preset.fileName}</p>
                              <span className="text-[8px] text-slate-400 font-medium uppercase">{preset.fileType}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Evidence Staged List / Upload Queue */}
                  {state.uploadedEvidence.length > 0 ? (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center border-b pb-2">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Staged Evidence Payload ({state.uploadedEvidence.length})</span>
                        <button 
                          onClick={() => setState(prev => ({ ...prev, uploadedEvidence: [] }))}
                          className="text-[9px] font-bold text-rose-600 hover:underline uppercase"
                        >
                          Clear All
                        </button>
                      </div>
                      <div className="space-y-2 max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
                        {state.uploadedEvidence.map((file) => {
                          const Icon = file.fileType === 'video' ? FileVideo : file.fileType === 'image' ? FileImage : file.fileType === 'audio' ? FileAudio : FileText;
                          
                          return (
                            <div key={file.id} className="flex items-center justify-between p-3 bg-white border border-slate-200/50 rounded-xl shadow-2xs">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="h-8 w-8 rounded bg-slate-50 flex items-center justify-center border border-slate-100 shrink-0">
                                  <Icon className="h-4 w-4 text-slate-500" />
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[11px] font-bold text-slate-800 truncate" title={file.fileName}>{file.fileName}</span>
                                    <span className="text-[8px] font-black bg-slate-100 text-slate-400 px-1 py-0.2 rounded uppercase">{file.fileType}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 mt-0.5 text-[9px] text-slate-400 font-medium">
                                    <span>{file.sizeLabel}</span>
                                    <span>·</span>
                                    <span className="text-emerald-600">Outputs: {file.expectedOutputs.slice(0, 3).join(" · ")}</span>
                                  </div>
                                </div>
                              </div>
                              <button 
                                onClick={() => handleRemoveFile(file.id)}
                                className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded transition-all"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    // Staged Empty Guidance Preview Cards
                    <div className="grid grid-cols-4 gap-3 pt-2">
                      {[
                        { type: 'Video', desc: 'Sequence blocks, key moments, and timeline notes.', color: 'text-indigo-500', bg: 'bg-indigo-50/20', border: 'border-indigo-100', icon: FileVideo },
                        { type: 'Image', desc: 'Visual observations, marked areas, and quality checks.', color: 'text-emerald-500', bg: 'bg-emerald-50/20', border: 'border-emerald-100', icon: FileImage },
                        { type: 'Audio', desc: 'Transcript segments, speaker turns, speaker logs.', color: 'text-amber-500', bg: 'bg-amber-50/20', border: 'border-amber-100', icon: FileAudio },
                        { type: 'Document', desc: 'Fact extractions, key sections, document references.', color: 'text-blue-500', bg: 'bg-blue-50/20', border: 'border-blue-100', icon: FileText }
                      ].map((item) => {
                        const ItemIcon = item.icon;
                        return (
                          <div key={item.type} className={cn("p-3 rounded-xl border flex flex-col gap-2 bg-white border-slate-200/60 shadow-2xs hover:shadow-sm transition-all")}>
                            <div className={cn("h-7 w-7 rounded flex items-center justify-center border shrink-0", item.bg, item.border, item.color)}>
                              <ItemIcon className="h-3.5 w-3.5" />
                            </div>
                            <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-wide leading-none">{item.type}</h4>
                            <p className="text-[9px] font-medium text-slate-400 leading-normal leading-snug">{item.desc}</p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Extraction Plan Preview Card */}
                <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Extraction Queue & Plan</h4>
                      <p className="text-2xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">Simulate post-creation workflow pipeline</p>
                    </div>
                    
                    <button
                      onClick={() => setState(prev => ({ ...prev, autoStartExtraction: !prev.autoStartExtraction }))}
                      className="flex items-center gap-1.5"
                    >
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Auto-start on creation</span>
                      {state.autoStartExtraction ? (
                        <ToggleRight className="h-6 w-6 text-[#2FAE8B]" />
                      ) : (
                        <ToggleLeft className="h-6 w-6 text-slate-300" />
                      )}
                    </button>
                  </div>

                  {state.uploadedEvidence.length > 0 ? (
                    <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-4 flex flex-col gap-3 animate-in fade-in duration-300">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-[#2FAE8B]/10 rounded-lg flex items-center justify-center text-[#2FAE8B] border border-[#2FAE8B]/20">
                          <Brain className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-[11.5px] font-bold text-slate-800 leading-none">Extraction plan ready for immediate initialization</p>
                          <span className="text-[9px] text-slate-400 font-semibold block mt-0.5">
                            {state.uploadedEvidence.length} files queued · {dist.video} video · {dist.audio} audio · {dist.image} image · {dist.document} doc
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-1">
                        {dist.video > 0 && (
                          <div className="flex items-center gap-2 text-[10px] font-medium text-slate-500 bg-white border border-slate-100 p-2 rounded-lg">
                            <div className="h-2 w-2 rounded-full bg-indigo-500" />
                            <span>Prepare {dist.video} video timeline keys</span>
                          </div>
                        )}
                        {dist.audio > 0 && (
                          <div className="flex items-center gap-2 text-[10px] font-medium text-slate-500 bg-white border border-slate-100 p-2 rounded-lg">
                            <div className="h-2 w-2 rounded-full bg-amber-500" />
                            <span>Transcribe {dist.audio} audio channels</span>
                          </div>
                        )}
                        {dist.image > 0 && (
                          <div className="flex items-center gap-2 text-[10px] font-medium text-slate-500 bg-white border border-slate-100 p-2 rounded-lg">
                            <div className="h-2 w-2 rounded-full bg-emerald-500" />
                            <span>Index {dist.image} image observations</span>
                          </div>
                        )}
                        {dist.document > 0 && (
                          <div className="flex items-center gap-2 text-[10px] font-medium text-slate-500 bg-white border border-slate-100 p-2 rounded-lg">
                            <div className="h-2 w-2 rounded-full bg-blue-500" />
                            <span>Decompose {dist.document} documents</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 border border-dashed rounded-xl text-slate-400 bg-slate-50/20">
                      <HelpCircle className="h-6 w-6 text-slate-300 mx-auto mb-2" />
                      <p className="text-[11px] font-bold uppercase tracking-wider">Upload evidence to preview the extraction plan.</p>
                      <span className="text-[9.5px] text-slate-400 mt-1 block">Staged assets will display active pipeline sequences here.</span>
                    </div>
                  )}
                </div>

              </div>

              {/* RIGHT COLUMN: Readiness checklists and WYSIWYG Live Previews */}
              <div className="col-span-4 space-y-6">

                {/* Readiness Protocol Checklist */}
                <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm p-6 sticky top-6 space-y-6">
                  
                  <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Readiness Protocol</h4>
                    <p className="text-[11px] font-medium text-slate-400 leading-none">Validate investigation setup integrity</p>
                  </div>

                  <div className="space-y-3.5">
                    {[
                      { 
                        key: 'caseIdentity', 
                        label: 'Case Identity', 
                        req: 'Required', 
                        done: checks.caseIdentity, 
                        desc: state.title.trim().length <= 5 ? 'Investigation operational title is required' : 'Title and event date entered'
                      },
                      { 
                        key: 'incidentParameters', 
                        label: 'Severity Level', 
                        req: 'Required', 
                        done: checks.incidentParameters, 
                        desc: 'Level categorizes operational priority' 
                      },
                      { 
                        key: 'siteClassification', 
                        label: 'Site Classification', 
                        req: 'Required', 
                        done: checks.siteClassification, 
                        desc: 'Operational sector node target' 
                      },
                      { 
                        key: 'executiveSummary', 
                        label: 'Executive Summary', 
                        req: 'Recommended', 
                        done: checks.executiveSummary, 
                        desc: state.executiveSummary.trim().length < 20 ? 'Min. 20 characters recommended' : 'High quality summary staging'
                      },
                      { 
                        key: 'evidenceAttachment', 
                        label: 'Evidence Attachment', 
                        req: 'Optional', 
                        done: checks.evidenceAttachment, 
                        desc: state.uploadedEvidence.length === 0 ? 'No immediate payload staging' : `${state.uploadedEvidence.length} assets ready`
                      }
                    ].map((step) => (
                      <div key={step.key} className="flex items-start gap-3 group">
                        <div className={cn(
                          "mt-0.5 h-4.5 w-4.5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                          step.done 
                            ? "bg-emerald-500 border-emerald-500 text-white shadow-sm" 
                            : step.req === 'Recommended' 
                              ? "border-amber-200 bg-amber-50/20 text-amber-500" 
                              : step.req === 'Optional' 
                                ? "border-slate-200 bg-slate-50 text-slate-400" 
                                : "border-slate-200 bg-slate-50 text-slate-300"
                        )}>
                          {step.done ? (
                            <Check className="h-2.5 w-2.5" />
                          ) : step.req === 'Recommended' ? (
                            <AlertCircle className="h-2.5 w-2.5 text-amber-500" />
                          ) : null}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className={cn("text-[11px] font-bold leading-none", step.done ? "text-slate-800" : "text-slate-400")}>{step.label}</p>
                            <span className={cn(
                              "text-[8px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded shrink-0",
                              step.req === 'Required' 
                                ? step.done ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"
                                : step.req === 'Recommended'
                                  ? step.done ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                                  : "bg-slate-100 text-slate-400"
                            )}>{step.req}</span>
                          </div>
                          <span className="text-[9.5px] text-slate-400 leading-snug mt-1 block leading-none">{step.desc}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* AI Status / Blueprint priming */}
                  <div className="pt-4 border-t border-slate-100">
                    <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-100 flex gap-3">
                       <div className="h-7 w-7 bg-emerald-600 rounded flex items-center justify-center text-white shrink-0 border border-emerald-500/20">
                          <Brain className="h-3.5 w-3.5" />
                       </div>
                       <div>
                          <p className="text-[11px] font-bold text-emerald-900 leading-tight">AI Priming Configured</p>
                          <p className="text-[9.5px] text-emerald-700 font-medium leading-relaxed mt-1">
                            Workspace blueprint will spin up automatic analysis nodes upon database initialization.
                          </p>
                       </div>
                    </div>
                  </div>

                </div>

                {/* Live Workspace Preview Panel (WYSIWYG Concept) */}
                <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm p-5 space-y-4">
                  <div className="flex justify-between items-center border-b pb-3">
                    <div>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Live Preview</span>
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Future Workspace Preview</h4>
                    </div>
                    <span className="text-[8px] font-black bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded tracking-widest uppercase">Live Sync</span>
                  </div>

                  {/* Mini Blueprint Workspace Frame */}
                  <div className="border border-slate-200/50 rounded-xl p-4 bg-slate-50/50 shadow-2xs space-y-4 relative overflow-hidden text-left">
                    <div className="absolute top-0 left-0 w-full h-[3px] bg-[#2FAE8B]" />

                    {/* MOCK WORKSPACE HEADER */}
                    <div className="border-b border-slate-200 pb-3">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="text-[8px] font-black px-1.5 py-0.2 rounded bg-slate-950 text-white uppercase tracking-wider shadow-sm">
                          {state.severity.toUpperCase()}
                        </span>
                        {state.siteNode && (
                          <span className="text-[8px] font-bold px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 uppercase tracking-wide truncate max-w-[120px]">
                            {state.siteNode.split(' - ')[0]}
                          </span>
                        )}
                        {state.uploadedEvidence.length > 0 && (
                          <span className="text-[8px] font-black bg-emerald-50 text-emerald-700 px-1.5 py-0.2 border border-emerald-100 rounded shrink-0">
                            {state.uploadedEvidence.length} FILE(S)
                          </span>
                        )}
                      </div>
                      <h5 className="text-[13px] font-black text-slate-800 truncate">
                        {state.title.trim() || <span className="text-slate-400 font-medium italic">e.g. Incident Workspace Title...</span>}
                      </h5>
                      <span className="text-[9px] font-medium text-slate-400 block mt-0.5 uppercase tracking-tighter">
                        Created: Just Now {state.eventOccurrence && `· Event Occurred: ${new Date(state.eventOccurrence).toLocaleDateString()}`}
                      </span>
                    </div>

                    {/* TAB LIST */}
                    <div className="flex gap-2.5 border-b border-slate-200 pb-2 text-[9px] font-black text-slate-400 uppercase tracking-widest shrink-0">
                      <span className="text-slate-900 border-b border-slate-900 pb-2">Evidence Review</span>
                      <span>Analysis</span>
                      <span>Reports</span>
                      <span>Audit Trail</span>
                    </div>

                    {/* MINI PANELS GRID */}
                    <div className="grid grid-cols-12 gap-2 text-[8px] font-bold text-slate-400">
                      
                      {/* Left Side Repository Preview */}
                      <div className="col-span-3 border border-slate-200 bg-white p-1 rounded min-h-[70px] space-y-1">
                        <span className="text-[7px] font-bold text-slate-400 uppercase block tracking-wider border-b pb-0.5">Sidebar</span>
                        {state.uploadedEvidence.length > 0 ? (
                          <div className="space-y-0.5">
                            {state.uploadedEvidence.slice(0, 3).map(file => (
                              <div key={file.id} className="flex items-center gap-1 bg-slate-50 p-0.5 rounded border border-slate-200/30 truncate">
                                <CheckCircle2 className="h-1.5 w-1.5 text-emerald-500 shrink-0" />
                                <span className="text-[7.5px] truncate text-slate-600 leading-none">{file.fileName}</span>
                              </div>
                            ))}
                            {state.uploadedEvidence.length > 3 && (
                              <span className="text-[6.5px] font-bold text-[#2FAE8B] block mt-0.5 text-center">+{state.uploadedEvidence.length - 3} MORE</span>
                            )}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-[50px] opacity-40">
                            <Database className="h-2.5 w-2.5 mb-1" />
                            <span className="text-[6.5px] uppercase">Empty Repo</span>
                          </div>
                        )}
                      </div>

                      {/* Middle Canvas Preview */}
                      <div className="col-span-5 border border-slate-200 bg-white p-1 rounded min-h-[70px] flex flex-col justify-between">
                        <span className="text-[7px] font-bold text-slate-400 uppercase block tracking-wider border-b pb-0.5">Preparation Preview</span>
                        
                        {state.uploadedEvidence.length > 0 ? (
                          <div className="space-y-1 py-1">
                            <div className="flex justify-between items-center text-[7px] text-slate-600">
                              <span className="font-bold">Intake Extraction</span>
                              <span>65%</span>
                            </div>
                            <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500 w-[65%]" />
                            </div>
                            <div className="h-1.5 w-12 bg-slate-100 rounded mt-1" />
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-[50px] opacity-40">
                            <PlayCircle className="h-2.5 w-2.5 mb-1" />
                            <span className="text-[6.5px] uppercase">Review Standby</span>
                          </div>
                        )}
                        <span className="text-[6px] text-slate-300 uppercase block border-t pt-0.5">Workspace center console</span>
                      </div>

                      {/* Right expected card preview */}
                      <div className="col-span-4 border border-slate-200 bg-white p-1 rounded min-h-[70px] space-y-1">
                        <span className="text-[7px] font-bold text-slate-400 uppercase block tracking-wider border-b pb-0.5">Expected Output</span>
                        {state.uploadedEvidence.length > 0 ? (
                          <div className="space-y-1">
                            {Array.from(new Set(state.uploadedEvidence.map(f => f.fileType))).slice(0, 2).map(type => (
                              <div key={type} className="bg-emerald-50/50 border border-emerald-100 rounded p-1 flex flex-col gap-0.5 scale-95">
                                <span className="text-[7px] font-black text-emerald-700 uppercase leading-none">{type} Output</span>
                                <div className="h-[2px] w-full bg-emerald-200/50 rounded" />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-[50px] opacity-40">
                            <Eye className="h-2.5 w-2.5 mb-1" />
                            <span className="text-[6.5px] uppercase">Engine standby</span>
                          </div>
                        )}
                      </div>

                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl">
                    <p className="text-[10px] font-semibold text-slate-500 leading-snug flex items-start gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-[#2FAE8B] shrink-0 mt-0.5" />
                      <span>This blueprint live updates as you configure the forms. Changes persist directly upon initialization.</span>
                    </p>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>

        {/* STEP-BY-STEP INITIALIZATION LOADING DIALOG */}
        {isInitializing && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-slate-200/80 animate-in zoom-in-95 duration-200 flex flex-col items-center text-center">
              
              {/* Spinner/Rings */}
              <div className="relative h-20 w-20 flex items-center justify-center mb-6">
                {/* Outermost Pulsing Ring */}
                <div className="absolute inset-0 rounded-full border border-emerald-100 animate-ping opacity-40" />
                {/* Secondary Rotating Ring */}
                <div className="absolute inset-2 rounded-full border-2 border-[#2FAE8B]/10 border-t-[#2FAE8B] animate-spin" />
                {/* Core Icon */}
                <ShieldCheck className="h-8 w-8 text-[#2FAE8B]" />
              </div>

              <span className="text-[9px] font-black text-[#2FAE8B] uppercase tracking-[0.25em] mb-2 block">Case blueprint builder</span>
              <h3 className="text-lg font-bold text-slate-900 mb-1">Creating investigation workspace</h3>
              <p className="text-xs text-slate-500 max-w-xs mb-8">
                Instantiating the case schema and staging evidence extraction queue.
              </p>

              {/* Progress and Timer Block */}
              <div className="w-full space-y-2 mb-8">
                <div className="flex justify-between items-center text-[10.5px] font-bold text-slate-500">
                  <span>Progress ({initProgress}%)</span>
                  <span>{elapsedSeconds.toString().padStart(2, '0')}:{state.uploadedEvidence.length > 0 ? "24" : "08"}s elapsed</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border">
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-300 rounded-full" 
                    style={{ width: `${initProgress}%` }} 
                  />
                </div>
              </div>

              {/* Step Validation Logs */}
              <div className="w-full text-left space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                {[
                  { id: 0, label: "Creating primary case record" },
                  { id: 1, label: "Preparing evidence catalog batches" },
                  { id: 2, label: "Attaching uploaded evidence payloads" },
                  { id: 3, label: "Preparing extraction queue targets" },
                  { id: 4, label: "Instantiating review dashboard panels" }
                ].map((step) => {
                  const isDone = initStep > step.id;
                  const isActive = initStep === step.id;
                  return (
                    <div key={step.id} className="flex items-center gap-3">
                      <div className={cn(
                        "h-4 w-4 rounded-full flex items-center justify-center shrink-0 border",
                        isDone 
                          ? "bg-emerald-500 border-emerald-500 text-white shadow-sm" 
                          : isActive 
                            ? "border-emerald-500 bg-white" 
                            : "border-slate-200 bg-white text-slate-300"
                      )}>
                        {isDone ? (
                          <Check className="h-2 w-2" />
                        ) : isActive ? (
                          <Loader2 className="h-2 w-2 text-emerald-600 animate-spin" />
                        ) : null}
                      </div>
                      <span className={cn(
                        "text-[11px] font-bold tracking-tight",
                        isDone ? "text-slate-700" : isActive ? "text-slate-900" : "text-slate-400"
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
