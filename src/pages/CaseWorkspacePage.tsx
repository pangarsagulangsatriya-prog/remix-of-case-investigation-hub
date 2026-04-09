import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { StatusChip, SeverityChip, ConfidenceChip } from "@/components/StatusChip";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Upload,
  Play,
  Brain,
  FileText,
  Send,
  XCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileSearch,
  ChevronRight,
  Eye,
  Check,
  X,
  Pencil,
  FileText as DocIcon, 
  Image as ImageIcon, 
  Mic as AudioIcon, 
  Video as VideoIcon, 
  Folders,
  FileCode,
  Search,
  Grid,
  MoreVertical,
  CheckCircle,
  Clock as PendingIcon,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  Star,
  Tag,
  Paperclip,
  Maximize2,
  LayoutGrid,
  History,
  Settings,
  MessageSquare,
  ChevronLeft
} from "lucide-react";

import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { UploadModal } from "@/components/UploadModal";

// --- Mock Data ---

const tabs = ["Overview", "Evidence", "Extraction Review", "Analysis", "Reports", "Review", "Audit Trail"];

const progressSteps = [
  { label: "Evidence", done: true },
  { label: "Extraction", done: true },
  { label: "Analysis", done: true },
  { label: "Report", done: false },
  { label: "Review", done: false },
  { label: "Approved", done: false },
];

const evidenceBatches = [
  { id: "B1", name: "Mechanical Inspection - Zone B", description: "Photos and detail logs from conveyor section 14 incident area", type: "Images", fileCount: 12, uploadedBy: "Ahmed Khan", updated: "2h ago", extractionProgress: 100, reviewProgress: 80, keyEvidenceCount: 4, linkedAnalysis: 3 },
  { id: "B2", name: "Incident Documentation Batch", description: "Initial HSE reports and hazard observation forms", type: "Documents", fileCount: 5, uploadedBy: "Sarah Chen", updated: "4h ago", extractionProgress: 80, reviewProgress: 40, keyEvidenceCount: 2, linkedAnalysis: 5 },
  { id: "B3", name: "Maintenance & CAL History", description: "Historical telemetry for haul trucks and conveyor drives", type: "Documents", fileCount: 3, uploadedBy: "Maria Santos", updated: "1d ago", extractionProgress: 100, reviewProgress: 0, keyEvidenceCount: 0, linkedAnalysis: 1 },
  { id: "B4", name: "Witness Statements & Radio", description: "Digital audio recordings from 14:15 - 14:45 incident window", type: "Audio", fileCount: 3, uploadedBy: "John Doe", updated: "1d ago", extractionProgress: 100, reviewProgress: 66, keyEvidenceCount: 2, linkedAnalysis: 2 },
  { id: "B5", name: "CCTV Storage Export", description: "Footage from Zone B cameras during incident window", type: "Video", fileCount: 1, uploadedBy: "System", updated: "4h ago", extractionProgress: 25, reviewProgress: 0, keyEvidenceCount: 0, linkedAnalysis: 0 },
];

const evidenceFiles = [
  // Images
  { id: "F1", batchId: "B1", name: "mechanical_failure_detail_01.jpg", type: "Image", source: "Field Cam 01", uploadedBy: "Ahmed Khan", uploadDate: "2026-04-05", extractionStatus: "completed", reviewStatus: "reviewed", tags: ["key", "roller-detail"], linked: 2, size: "2.4 MB" },
  { id: "F2", batchId: "B1", name: "conveyor_belt_tear_A.jpg", type: "Image", source: "Field Cam 01", uploadedBy: "Ahmed Khan", uploadDate: "2026-04-05", extractionStatus: "completed", reviewStatus: "reviewed", tags: ["key"], linked: 1, size: "3.1 MB" },
  { id: "F3", batchId: "B1", name: "haul_road_spillage_zone_3.jpg", type: "Image", source: "UAV Inspection", uploadedBy: "Ahmed Khan", uploadDate: "2026-04-06", extractionStatus: "completed", reviewStatus: "pending", tags: ["spillage"], linked: 0, size: "5.2 MB" },
  
  // Documents
  { id: "F4", batchId: "B2", name: "incident_report_initial.pdf", type: "Document", source: "HSE Portal", uploadedBy: "Sarah Chen", uploadDate: "2026-04-05", extractionStatus: "completed", reviewStatus: "reviewed", tags: ["key"], linked: 5, size: "1.2 MB", snippet: "The belt tore at section 14, causing material spillage across the walkway. Tensioners failed to retract." },
  { id: "F5", batchId: "B2", name: "hazard_observation_form_04.pdf", type: "Document", source: "Safety Tablet", uploadedBy: "Sarah Chen", uploadDate: "2026-04-05", extractionStatus: "completed", reviewStatus: "pending", tags: ["observation"], linked: 1, size: "850 KB" },
  { id: "F6", batchId: "B3", name: "maintenance_log_conveyor_C.xlsx", type: "Document", source: "Maintenance Sys", uploadedBy: "Maria Santos", uploadDate: "2026-04-06", extractionStatus: "completed", reviewStatus: "pending", tags: [], linked: 1, size: "450 KB" },
  
  // Audio
  { id: "F7", batchId: "B4", name: "witness_statement_operator_A.wav", type: "Audio", source: "Field Voice Link", uploadedBy: "John Doe", uploadDate: "2026-04-06", extractionStatus: "completed", reviewStatus: "reviewed", tags: ["interview"], linked: 2, size: "12 MB", duration: "04:22" },
  { id: "F8", batchId: "B4", name: "supervisor_followup_interview.mp3", type: "Audio", source: "Digital Recorder", uploadedBy: "John Doe", uploadDate: "2026-04-06", extractionStatus: "completed", reviewStatus: "partial", tags: ["interview", "management"], linked: 1, size: "8.5 MB", duration: "02:15" },
  { id: "F9", batchId: "B4", name: "radio_communication_shift_B.m4a", type: "Audio", source: "Radio Link Archiver", uploadedBy: "System", uploadDate: "2026-04-05", extractionStatus: "completed", reviewStatus: "pending", tags: ["radio-log"], linked: 0, size: "4.1 MB", duration: "10:05" },
  { id: "F10", batchId: "B5", name: "cctv_zone_b_cam2_1430.mp4", type: "Video", source: "CCTV Server", uploadedBy: "System", uploadDate: "2026-04-05", extractionStatus: "processing", reviewStatus: "pending", tags: [], linked: 0, size: "124 MB" },
];

const analysisAgents = [
  { name: "PEEPO Reasoning", icon: Brain, purpose: "Analyzing high-level safety culture and human factors.", inputReady: true, lastRun: "2h ago", lastStatus: "reviewed" },
  { name: "IPLS Classification", icon: FileSearch, purpose: "Classifying incident according to enterprise safety standards.", inputReady: true, lastRun: "1h ago", lastStatus: "draft" },
  { name: "Fact & Chronology", icon: Clock, purpose: "Building a verified timeline from evidence fragments.", inputReady: true, lastRun: "30m ago", lastStatus: "reviewed" },
  { name: "Prevention Engine", icon: CheckCircle2, purpose: "Generating preventive actions and control recommendations.", inputReady: false, lastRun: "—", lastStatus: "not_run" },
  { name: "Actor Intelligence", icon: DocIcon, purpose: "Analyzing worker profiles, training history and fatigue levels.", inputReady: true, lastRun: "4h ago", lastStatus: "draft" },
];

const runHistory = [
  { runId: "RUN-046", agent: "PEEPO Reasoning", triggeredBy: "Sarah Chen", inputSource: "Evidence Batch B1, B2", status: "completed", createdAt: "2026-04-08 10:12" },
  { runId: "RUN-045", agent: "Fact & Chronology", triggeredBy: "System (Auto)", inputSource: "witness_statement_operator_A.mp3", status: "completed", createdAt: "2026-04-08 09:30" },
  { runId: "RUN-044", agent: "IPLS Classification", triggeredBy: "Ahmed Khan", inputSource: "incident_report_initial.pdf", status: "completed", createdAt: "2026-04-07 15:20" },
];

// --- Components ---

function StatusIndicator({ status, type }: { status: string, type: 'extraction' | 'review' }) {
  const isAlt = status === "completed" || status === "reviewed";
  const isProcess = status === "processing" || status === "partial";
  const isFail = status === "failed";
  
  return (
    <div className={`
      inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider shadow-sm transition-all
      ${isAlt ? "bg-emerald-50 text-emerald-700 border-emerald-100" : 
        isProcess ? "bg-amber-50 text-amber-700 border-amber-100" :
        isFail ? "bg-rose-50 text-rose-700 border-rose-100" :
        "bg-slate-50 text-slate-400 border-slate-100"}
    `}>
      {isAlt ? <CheckCircle className="h-2.5 w-2.5" /> : 
       isProcess ? <PendingIcon className="h-2.5 w-2.5 animate-pulse" /> : 
       isFail ? <AlertCircle className="h-2.5 w-2.5" /> : 
       <div className="h-2 w-2 rounded-full bg-slate-200" />}
      {status.replace('_', ' ')}
    </div>
  );
}

function getFileIcon(type: string) {
  switch (type) {
    case "Document": return <DocIcon className="h-4 w-4 text-blue-500" />;
    case "Image": return <ImageIcon className="h-4 w-4 text-emerald-500" />;
    case "Audio": return <AudioIcon className="h-4 w-4 text-amber-500" />;
    case "Video": return <VideoIcon className="h-4 w-4 text-purple-500" />;
    default: return <FileCode className="h-4 w-4 text-slate-400" />;
  }
}

// --- Tabs ---

function OverviewTab() {
  return (
    <div className="flex flex-col h-full bg-slate-50/10 overflow-auto">
      <div className="p-6 grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
           <div className="bg-white border rounded-xl shadow-sm p-5">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-50">
                 <div className="flex items-center gap-2">
                    <div className="h-8 w-8 bg-primary/5 rounded flex items-center justify-center text-primary font-bold text-xs border border-primary/10">IQ</div>
                    <div>
                       <h3 className="text-sm font-bold text-slate-900 border-none">Case Intelligence Summary</h3>
                       <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">AI Generated • Last Updated 12m ago</p>
                    </div>
                 </div>
                 <Button variant="ghost" size="sm" className="h-7 text-xs font-bold gap-2 text-primary hover:bg-primary/5">
                    <Play className="h-3 w-3" /> Regenerate
                 </Button>
              </div>
              <div className="space-y-4">
                 <p className="text-sm text-slate-700 leading-relaxed font-medium">
                    Investigation into the <span className="text-primary font-bold">Conveyor Belt Failure (CS-2026-0147)</span> at Site Alpha. Preliminary extraction from witness interviews and maintenance logs indicate a structural tear in <span className="text-amber-600 font-bold">Section 14</span>, likely caused by a failed roller bearing. Current evidence confidence is high (92%). PEEPO analysis in progress.
                 </p>
                 <div className="flex gap-4">
                    <div className="flex-1 bg-slate-50 border rounded-lg p-3">
                       <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Key Findings</span>
                       <ul className="space-y-1.5">
                          <li className="text-[11px] font-bold text-slate-700 flex items-center gap-2">
                             <div className="h-1 w-1 bg-amber-500 rounded-full" /> Tear started at 14:30 (Witness A)
                          </li>
                          <li className="text-[11px] font-bold text-slate-700 flex items-center gap-2">
                             <div className="h-1 w-1 bg-emerald-500 rounded-full" /> E-Stop response: 17 mins delay
                          </li>
                       </ul>
                    </div>
                    <div className="flex-1 bg-slate-50 border rounded-lg p-3">
                       <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Risk Classification</span>
                       <div className="flex flex-wrap gap-1.5 mt-1">
                          <span className="px-2 py-0.5 rounded-full bg-rose-50 border border-rose-100 text-[9px] font-bold text-rose-600 uppercase">Mechanical Failure</span>
                          <span className="px-2 py-0.5 rounded-full bg-amber-50 border border-amber-100 text-[9px] font-bold text-amber-600 uppercase">Near Miss</span>
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           <div className="bg-white border rounded-xl shadow-sm p-5">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] block mb-4">Event Chronology Visualization</span>
              <div className="relative h-32 w-full flex items-end justify-between px-4 pb-8">
                 <div className="absolute bottom-6 left-0 right-0 h-px bg-slate-200" />
                 {[
                   { t: "14:15", h: 20, label: "Vibration Detection", type: "system" },
                   { t: "14:30", h: 80, label: "Belt Failure", type: "event" },
                   { t: "14:35", h: 40, label: "Operator Alert", type: "action" },
                   { t: "14:47", h: 60, label: "E-Stop Activated", type: "action" },
                 ].map((p, i) => (
                   <div key={i} className="relative flex flex-col items-center group">
                      <div className="text-[9px] font-bold text-slate-400 mb-2 invisible group-hover:visible absolute -top-4 whitespace-nowrap bg-white border px-1.5 rounded shadow-sm z-10">{p.label}</div>
                      <div className={`w-3 rounded-t-sm transition-all ${p.type === 'event' ? 'bg-rose-500' : p.type === 'action' ? 'bg-primary' : 'bg-slate-300'}`} style={{ height: `${p.h}%` }} />
                      <span className="absolute -bottom-6 text-[10px] font-bold text-slate-500">{p.t}</span>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        <div className="space-y-6">
           <div className="bg-slate-900 rounded-xl p-5 text-white shadow-xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-4">Case Statistics</span>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <span className="text-2xl font-bold block">14</span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Evidence Files</span>
                 </div>
                 <div>
                    <span className="text-2xl font-bold block text-emerald-400">92%</span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Fact Confidence</span>
                 </div>
                 <div>
                    <span className="text-2xl font-bold block text-amber-400">03</span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Open Gaps</span>
                 </div>
                 <div>
                    <span className="text-2xl font-bold block text-primary">05</span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">AI Agents Run</span>
                 </div>
              </div>
           </div>

           <div className="bg-white border rounded-xl shadow-sm p-4">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3 border-b pb-2">Investigation Team</span>
              <div className="space-y-3">
                 {[
                   { name: "Sarah Chen", role: "Lead Investigator", status: "Active" },
                   { name: "John Doe", role: "Safety Manager", status: "Reviewing" },
                   { name: "Ahmed Khan", role: "Field Expert", status: "Offline" },
                 ].map(u => (
                    <div key={u.name} className="flex items-center justify-between">
                       <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-slate-100 border flex items-center justify-center text-[10px] font-bold text-slate-600">{u.name[0]}</div>
                          <div>
                             <p className="text-[11px] font-bold text-slate-800 leading-tight">{u.name}</p>
                             <p className="text-[9px] text-slate-400 uppercase tracking-tighter">{u.role}</p>
                          </div>
                       </div>
                       <span className={`h-1.5 w-1.5 rounded-full ${u.status === 'Active' ? 'bg-emerald-500' : u.status === 'Reviewing' ? 'bg-amber-500' : 'bg-slate-300'}`} />
                    </div>
                 ))}
                 <Button variant="outline" size="sm" className="w-full h-7 text-[10px] font-bold mt-2">Manage Access</Button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function EvidenceTab() {
  const [viewMode, setViewMode] = useState<"grouped" | "files">("grouped");
  const [filterType, setFilterType] = useState("All Evidence");
  const [localEvidenceFiles, setLocalEvidenceFiles] = useState(evidenceFiles);
  const [selectedFile, setSelectedFile] = useState<typeof evidenceFiles[0] | null>(null);
  const [expandedBatches, setExpandedBatches] = useState<string[]>(["B1", "B2", "B4"]);
  
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadType, setUploadType] = useState<"Document" | "Image" | "Audio" | "Video" | undefined>();

  const toggleBatch = (id: string) => {
    setExpandedBatches(prev => prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]);
  };

  const currentFiles = filterType === "All Evidence" 
    ? localEvidenceFiles 
    : localEvidenceFiles.filter(f => f.type === filterType.replace(/s$/, ""));

  const filteredBatches = filterType === "All Evidence"
    ? evidenceBatches
    : evidenceBatches.filter(b => b.type === filterType);

  const handleUploadComplete = (newFiles: any[]) => {
    const formattedFiles = newFiles.map(f => ({
      ...f,
      batchId: "B2", // Default to documentation batch for now
      source: "Manual Upload",
      uploadedBy: "Current User",
      extractionStatus: "processing",
      reviewStatus: "pending",
      tags: [],
      linked: 0
    }));
    setLocalEvidenceFiles(prev => [...formattedFiles, ...prev]);
  };

  const openUpload = (type: "Document" | "Image" | "Audio" | "Video") => {
    setUploadType(type);
    setIsUploadModalOpen(true);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/10">
      <div className="h-12 border-b bg-white flex items-center justify-between px-4 shrink-0 shadow-sm relative z-10">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-md border">
          {["All Evidence", "Documents", "Images", "Audio", "Video"].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1 text-2xs font-bold rounded-sm transition-all ${
                filterType === type 
                ? "bg-white text-primary shadow-sm" 
                : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input 
              placeholder="Search evidence library..." 
              className="h-8 w-64 pl-8 text-[11px] bg-slate-50 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all focus:bg-white"
            />
          </div>
          
          <div className="flex items-center bg-slate-100 p-1 rounded-md border">
            <button 
              onClick={() => setViewMode("grouped")}
              className={`p-1 rounded-sm transition-all ${viewMode === "grouped" ? "bg-white shadow-sm text-primary" : "text-slate-400 hover:text-slate-600"}`}
              title="Group by Batch"
            >
              <Folders className="h-4 w-4" />
            </button>
            <button 
              onClick={() => setViewMode("files")}
              className={`p-1 rounded-sm transition-all ${viewMode === "files" ? "bg-white shadow-sm text-primary" : "text-slate-400 hover:text-slate-600"}`}
              title="Show Files Only"
            >
              <Grid className="h-4 w-4" />
            </button>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="h-8 text-[11px] font-bold gap-2 px-3 bg-primary hover:bg-primary/90 shadow-md transition-all active:scale-95">
                <Upload className="h-3.5 w-3.5" /> Upload Evidence <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-1.5 shadow-2xl border-slate-200">
              <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-slate-500 font-bold p-2 pb-1.5">Ingest Structured Evidence</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => openUpload("Document")} className="text-xs font-bold py-2.5 cursor-pointer rounded-md focus:bg-primary/5 transition-colors">
                 <DocIcon className="h-4 w-4 mr-3 text-primary" /> Documents
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openUpload("Image")} className="text-xs font-bold py-2.5 cursor-pointer rounded-md focus:bg-emerald-50 transition-colors">
                 <ImageIcon className="h-4 w-4 mr-3 text-emerald-500" /> Images
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openUpload("Audio")} className="text-xs font-bold py-2.5 cursor-pointer rounded-md focus:bg-amber-50 transition-colors">
                 <AudioIcon className="h-4 w-4 mr-3 text-amber-500" /> Audio Recordings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openUpload("Video")} className="text-xs font-bold py-2.5 cursor-pointer rounded-md focus:bg-slate-100 transition-colors">
                 <VideoIcon className="h-4 w-4 mr-3 text-slate-700" /> Video Footage
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-auto p-4 custom-scrollbar">
          <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
            <table className="w-full enterprise-table">
              <thead>
                <tr className="bg-slate-50 border-b">
                  <th className="w-10"></th>
                  <th>File / Batch Name</th>
                  <th>Type</th>
                  <th>Source</th>
                  <th>Uploaded By</th>
                  <th>Extraction</th>
                  <th>Review</th>
                  <th className="text-center w-20">Linked</th>
                  <th className="w-10 pr-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {viewMode === "grouped" ? (
                  filteredBatches.map(batch => (
                    <React.Fragment key={batch.id}>
                      <tr 
                        className={`group bg-white hover:bg-slate-50/50 transition-colors cursor-pointer ${expandedBatches.includes(batch.id) ? "bg-slate-50/20" : ""}`}
                        onClick={() => toggleBatch(batch.id)}
                      >
                        <td className="pl-4 py-3">
                          <button className="text-slate-400 group-hover:text-primary transition-colors">
                            {expandedBatches.includes(batch.id) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                          </button>
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded bg-primary/5 flex items-center justify-center border border-primary/10">
                              <Folders className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <span className="text-xs font-bold text-slate-900 leading-tight block">{batch.name}</span>
                              <span className="text-[10px] font-medium text-slate-400 mt-0.5">{batch.fileCount} files · Updated {batch.updated}</span>
                            </div>
                          </div>
                        </td>
                        <td className="text-xs text-slate-600 font-bold">{batch.type}</td>
                        <td className="text-[11px] text-slate-500 font-medium">—</td>
                        <td className="text-xs text-slate-700 font-bold">{batch.uploadedBy}</td>
                        <td>
                          <div className="flex flex-col gap-1.5 min-w-[120px]">
                            <div className="flex justify-between items-center px-0.5">
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{batch.extractionProgress}%</span>
                              <span className="text-[9px] font-bold text-slate-500">PROCESSED</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                              <div className="h-full bg-primary transition-all duration-500" style={{ width: `${batch.extractionProgress}%` }} />
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="flex flex-col gap-1.5 min-w-[120px]">
                            <div className="flex justify-between items-center px-0.5">
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{batch.reviewProgress}%</span>
                              <span className="text-[9px] font-bold text-slate-500">REVIEWED</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                              <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${batch.reviewProgress}%` }} />
                            </div>
                          </div>
                        </td>
                        <td className="text-center">
                          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">{batch.linkedAnalysis}</span>
                        </td>
                        <td className="pr-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <button className="p-1 rounded hover:bg-slate-200 transition-colors opacity-0 group-hover:opacity-100">
                                <MoreVertical className="h-4 w-4 text-slate-400" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem className="text-xs font-bold py-2">Manage Batch</DropdownMenuItem>
                              <DropdownMenuItem className="text-xs font-bold py-2">Download ZIP</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-xs font-bold text-destructive py-2">Archive Batch</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                      {expandedBatches.includes(batch.id) && localEvidenceFiles.filter(f => f.batchId === batch.id).map(file => (
                        <tr 
                          key={file.id} 
                          className={`hover:bg-primary/5 transition-all cursor-pointer border-l-2 border-transparent ${selectedFile?.id === file.id ? "bg-primary/5 border-primary shadow-[inset_0_1px_0_0_rgba(0,0,0,0.05)]" : ""}`}
                          onClick={() => setSelectedFile(file)}
                        >
                          <td className="pl-12 py-2.5">
                            {getFileIcon(file.type)}
                          </td>
                          <td className="py-2.5">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-700 truncate max-w-[240px]">{file.name}</span>
                              {file.tags.includes("key") && (
                                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                              )}
                            </div>
                          </td>
                          <td className="text-[11px] text-slate-500 font-bold">{file.type}</td>
                          <td className="text-[11px] text-slate-500 font-medium italic">{file.source}</td>
                          <td className="text-[11px] text-slate-600 font-bold">{file.uploadedBy}</td>
                          <td>
                            <StatusIndicator status={file.extractionStatus} type="extraction" />
                          </td>
                          <td>
                            <StatusIndicator status={file.reviewStatus} type="review" />
                          </td>
                          <td className="text-center">
                            <span className="text-[11px] font-bold text-slate-500">{file.linked || "—"}</span>
                          </td>
                          <td className="pr-4"></td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))
                ) : (
                  currentFiles.map(file => (
                    <tr 
                      key={file.id}
                      className={`hover:bg-slate-50 transition-all cursor-pointer border-l-2 border-transparent ${selectedFile?.id === file.id ? "bg-primary/5 border-primary" : ""}`}
                      onClick={() => setSelectedFile(file)}
                    >
                      <td className="pl-4 py-2.5">
                        {getFileIcon(file.type)}
                      </td>
                      <td className="py-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-700">{file.name}</span>
                          {file.tags.includes("key") && (
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          )}
                        </div>
                      </td>
                      <td className="text-[11px] text-slate-500 font-bold">{file.type}</td>
                      <td className="text-[11px] text-slate-500 font-medium italic">{file.source}</td>
                      <td className="text-[11px] text-slate-600 font-bold">{file.uploadedBy}</td>
                      <td>
                        <StatusIndicator status={file.extractionStatus} type="extraction" />
                      </td>
                      <td>
                        <StatusIndicator status={file.reviewStatus} type="review" />
                      </td>
                      <td className="text-center">
                        <span className="text-[11px] font-bold text-slate-500">{file.linked || "—"}</span>
                      </td>
                      <td className="pr-4"></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {selectedFile && (
          <div className="w-[360px] border-l bg-white flex flex-col shrink-0 animate-in slide-in-from-right duration-300">
            <div className="h-12 border-b flex items-center justify-between px-4 shrink-0 bg-slate-50/50">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Evidence Context Panel</span>
               <button onClick={() => setSelectedFile(null)} className="p-1 hover:bg-slate-200 rounded transition-colors">
                  <X className="h-4 w-4 text-slate-400" />
               </button>
            </div>
            <div className="flex-1 overflow-auto p-5 custom-scrollbar">
              <div className="space-y-6">
                 <div className="aspect-video bg-slate-900 rounded-lg flex items-center justify-center overflow-hidden border border-slate-200 shadow-sm group relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                       {selectedFile.type === "Image" ? (
                         <ImageIcon className="h-12 w-12 text-slate-700/50" />
                       ) : selectedFile.type === "Audio" ? (
                         <div className="flex flex-col items-center gap-3 w-full px-6">
                            <div className="h-12 flex items-center gap-1 w-full justify-center">
                               {[1, 2, 3, 4, 3, 5, 2, 4, 6, 4, 2].map((h, i) => (
                                 <div key={i} className="w-1 bg-primary/40 rounded-full animate-pulse" style={{ height: `${h * 15}%`, animationDelay: `${i * 100}ms` }} />
                               ))}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                               <Play className="h-3 w-3 fill-slate-400" />
                               <span>{selectedFile.duration}</span>
                            </div>
                         </div>
                       ) : (
                         <div className="text-center space-y-2 p-4">
                            <DocIcon className="h-12 w-12 text-primary/20 mx-auto" />
                            <span className="text-2xs font-bold text-slate-400 uppercase tracking-widest">Document Text Rendering...</span>
                         </div>
                       )}
                    </div>
                    <button className="absolute bottom-3 right-3 p-1.5 bg-white/90 backdrop-blur shadow-lg border rounded-md text-slate-600 hover:text-primary opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                       <ExternalLink className="h-3.5 w-3.5" />
                    </button>
                 </div>

                 <div className="space-y-4">
                   <div>
                     <div className="flex items-center justify-between mb-1">
                       <span className="text-[10px] font-bold text-primary uppercase tracking-widest">File Identity</span>
                       <span className="text-[10px] font-bold text-slate-400">{selectedFile.size}</span>
                     </div>
                     <h3 className="text-sm font-bold text-slate-900 leading-snug">{selectedFile.name}</h3>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter block mb-1">System Accuracy</span>
                        <div className="flex items-center gap-2">
                           <ConfidenceChip level="high" />
                           <span className="text-[10px] font-bold text-slate-900">94%</span>
                        </div>
                     </div>
                     <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter block mb-1">Audit Status</span>
                        <StatusIndicator status={selectedFile.reviewStatus} type="review" />
                     </div>
                   </div>
                 </div>

                 <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 space-y-3 shadow-inner">
                    <div className="flex items-center justify-between">
                       <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">AI Extraction Summary</span>
                       <Button variant="ghost" className="h-6 text-[10px] font-bold text-primary hover:bg-white px-2 border border-primary/10">Rerun Engine</Button>
                    </div>
                    <div className="bg-white border border-slate-100 p-2.5 rounded shadow-sm italic">
                       <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                         {selectedFile.snippet || "Extraction engine has identified 5 key entities and 2 potential risk factors within this evidence object. Confidence score: High (94%)."}
                       </p>
                    </div>
                    <div className="flex items-center gap-1.5 mt-2">
                       <FileSearch className="h-3.5 w-3.5 text-primary" />
                       <span className="text-[11px] font-bold text-slate-700">Linked to Chronology: 14:30 Event</span>
                    </div>
                 </div>

                 <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Classification</span>
                      <Button variant="ghost" size="sm" className="h-6 text-[10px] font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 px-2 transition-colors">+ Tag</Button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                       {selectedFile.tags.map(tag => (
                         <div key={tag} className="flex items-center gap-1 bg-slate-50 border px-2 py-0.5 rounded text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                           <Tag className="h-2.5 w-2.5" />
                           {tag}
                         </div>
                       ))}
                       {selectedFile.tags.includes("key") && (
                         <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-[10px] font-bold text-amber-600 uppercase tracking-wider shadow-sm">
                            <Star className="h-2.5 w-2.5 fill-amber-500" />
                            CRITICAL EVIDENCE
                         </div>
                       )}
                    </div>
                 </div>

                 <div className="space-y-2 pt-4 border-t">
                    <Button className="w-full h-9 text-xs font-bold gap-2 bg-slate-900 hover:bg-slate-800 shadow-md transition-all">
                       <ExternalLink className="h-3 w-3" /> View Extraction Workspace
                    </Button>
                    <div className="grid grid-cols-2 gap-2">
                       <Button variant="outline" className="h-8 text-[10px] font-bold border-slate-200 bg-white hover:bg-slate-50">
                          Link to Analysis
                       </Button>
                       <Button variant="outline" className="h-8 text-[10px] font-bold border-slate-200 bg-white hover:bg-slate-50">
                          Assign Owner
                       </Button>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <UploadModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
        onUploadComplete={handleUploadComplete}
        initialType={uploadType}
      />
    </div>
  );
}

function ExtractionTab() {
  const [selectedFile, setSelectedFile] = useState<typeof evidenceFiles[0]>(evidenceFiles[1]);
  const [activeFilter, setActiveFilter] = useState("All Files");

  const filteredFiles = activeFilter === "All Files" 
    ? evidenceFiles.filter(f => f.extractionStatus !== "not_started")
    : evidenceFiles.filter(f => f.type === activeFilter.replace(/s$/, ""));

  return (
    <div className="flex h-full bg-slate-50/10">
      <div className="w-[280px] border-r bg-white flex flex-col shrink-0 z-20 shadow-[1px_0_5px_rgba(0,0,0,0.02)]">
        <div className="h-12 border-b flex items-center px-4 shrink-0 justify-between bg-slate-50/50">
           <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Evidence Feed</span>
           <div className="flex items-center gap-2">
              <button className="p-1 hover:bg-slate-200 rounded"><Search className="h-3.5 w-3.5 text-slate-400" /></button>
              <button className="p-1 hover:bg-slate-200 rounded"><Settings className="h-3.5 w-3.5 text-slate-400" /></button>
           </div>
        </div>
        <div className="p-2.5 border-b flex gap-1 bg-white">
           {["All Files", "Docs", "Images", "Audio"].map(f => (
              <button 
                key={f}
                onClick={() => setActiveFilter(f === "Docs" ? "Documents" : f === "All Files" ? "All Files" : f)}
                className={`flex-1 py-1 text-[9px] font-bold rounded-sm border transition-all ${
                  (activeFilter === f || (f === "Docs" && activeFilter === "Documents")) 
                  ? "bg-slate-900 text-white border-slate-900" 
                  : "bg-white text-slate-500 border-slate-100 hover:border-slate-300"
                }`}
              >
                {f}
              </button>
           ))}
        </div>
        <div className="flex-1 overflow-auto custom-scrollbar">
           {filteredFiles.map(file => (
             <div 
               key={file.id}
               onClick={() => setSelectedFile(file)}
               className={`p-3 border-b cursor-pointer transition-all hover:bg-slate-50 relative group ${
                 selectedFile.id === file.id ? "bg-primary/5 border-l-4 border-l-primary" : "border-l-4 border-l-transparent"
               }`}
             >
                <div className="flex gap-2.5">
                   <div className={`h-8 w-8 rounded shrink-0 flex items-center justify-center border ${
                     selectedFile.id === file.id ? "bg-white border-primary/20 shadow-sm" : "bg-slate-50 border-slate-100"
                   }`}>
                      {getFileIcon(file.type)}
                   </div>
                   <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{file.type}</span>
                         <span className="text-[9px] font-bold text-slate-400">{file.uploadDate}</span>
                      </div>
                      <p className={`text-xs font-bold truncate ${selectedFile.id === file.id ? "text-primary" : "text-slate-700"}`}>{file.name}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                         <StatusIndicator status={file.extractionStatus} type="extraction" />
                         {file.tags.includes("key") && <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />}
                      </div>
                   </div>
                </div>
             </div>
           ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col relative z-10 bg-white">
        <div className="h-12 border-b flex items-center justify-between px-6 shrink-0 bg-white">
           <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                 <div className="h-7 w-7 bg-slate-100 rounded flex items-center justify-center border">
                    {getFileIcon(selectedFile.type)}
                 </div>
                 <h2 className="text-sm font-bold text-slate-900">{selectedFile.name}</h2>
              </div>
              <div className="h-4 w-px bg-slate-200" />
              <div className="flex items-center gap-3">
                 <StatusIndicator status={selectedFile.extractionStatus} type="extraction" />
                 <ConfidenceChip level="high" />
              </div>
           </div>
           <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-8 text-[11px] font-bold gap-2">
                 <Maximize2 className="h-3.5 w-3.5" /> Fullscreen
              </Button>
              <Button variant="outline" size="sm" className="h-8 text-[11px] font-bold gap-2">
                 <Upload className="h-3.5 w-3.5" /> Replace Source
              </Button>
           </div>
        </div>

        <div className="flex-1 overflow-auto bg-slate-100/50 p-6 flex flex-col items-center custom-scrollbar">
           <AdaptiveSourcePreview file={selectedFile} />
        </div>
      </div>

      <div className="w-[380px] border-l bg-white flex flex-col shrink-0 z-20 shadow-[-1px_0_5px_rgba(0,0,0,0.02)]">
        <div className="h-12 border-b flex items-center justify-between px-4 shrink-0 bg-slate-50/50">
           <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary" />
              <span className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">Extraction Console</span>
           </div>
           <div className="flex items-center gap-1.5">
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-full hover:bg-slate-200">
                 <History className="h-3.5 w-3.5 text-slate-400" />
              </Button>
              <Button variant="ghost" size="sm" className="h-7 px-2 text-[10px] font-bold text-primary hover:bg-primary/5">Rerun Engine</Button>
           </div>
        </div>
        
        <div className="flex-1 overflow-auto p-5 custom-scrollbar bg-slate-50/10">
           <AdaptiveExtractionOutput file={selectedFile} />
        </div>

        <div className="p-4 border-t bg-white shrink-0 shadow-[0_-1px_5px_rgba(0,0,0,0.01)]">
           <div className="flex items-center gap-2">
              <Button className="flex-1 h-9 text-xs font-bold bg-slate-900 hover:bg-slate-800 shadow-md">Accept All Findings</Button>
              <Button variant="outline" className="h-9 px-3 border-slate-200">
                 <MoreVertical className="h-4 w-4 text-slate-400" />
              </Button>
           </div>
        </div>
      </div>
    </div>
  );
}

function AdaptiveSourcePreview({ file }: { file: any }) {
  if (file.type === "Document") {
    return (
      <div className="w-full max-w-4xl min-h-[800px] bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-500">
         <div className="h-10 bg-slate-50 border-b flex items-center justify-between px-4">
            <span className="text-[10px] font-bold text-slate-500">Page 1 of 4</span>
            <div className="flex items-center gap-2">
               <Button variant="ghost" size="sm" className="h-7 w-7 p-0"><ChevronLeft className="h-4 w-4" /></Button>
               <Button variant="ghost" size="sm" className="h-7 w-7 p-0"><ChevronRight className="h-4 w-4" /></Button>
            </div>
         </div>
         <div className="flex-1 p-12 space-y-6 relative overflow-hidden">
            <div className="absolute top-48 left-0 right-0 h-8 bg-amber-100/30 border-y border-amber-200/50 mix-blend-multiply" />
            <div className="absolute top-[320px] left-0 right-0 h-6 bg-primary/10 border-y border-primary/20 mix-blend-multiply" />
            <h1 className="text-2xl font-bold text-slate-900 border-none p-0">HSE Incident Report - Initial Findings</h1>
            <div className="h-px bg-slate-100 w-full" />
            <div className="space-y-4">
               {[1, 2, 3, 4, 5, 2, 4, 3, 1, 5, 4, 2].map((w, i) => (
                  <div key={i} className="flex gap-2">
                     <div className="h-3 bg-slate-100 rounded transition-all group-hover:bg-slate-200" style={{ width: `${w * 10 + 20}%` }} />
                     <div className="h-3 bg-slate-50 rounded" style={{ width: `${(10 - w) * 5 + 10}%` }} />
                  </div>
               ))}
               <p className="text-sm text-slate-800 leading-relaxed font-medium bg-amber-50 p-2 rounded border border-amber-100 shadow-sm relative z-10">
                 "The conveyor belt tore at section 14 at approximately 14:35, causing material spillage across the walkway which blocked emergency access."
               </p>
               {[4, 2, 5, 3, 4, 1, 2].map((w, i) => (
                  <div key={i+20} className="flex gap-2">
                     <div className="h-3 bg-slate-100 rounded" style={{ width: `${w * 12}%` }} />
                     <div className="h-3 bg-slate-50 rounded" style={{ width: `${(6 - w) * 8}%` }} />
                  </div>
               ))}
            </div>
         </div>
      </div>
    );
  }

  if (file.type === "Image") {
    return (
      <div className="w-full max-w-4xl aspect-[4/3] bg-white border border-slate-300 rounded-lg shadow-2xl relative overflow-hidden group animate-in fade-in zoom-in-95 duration-500">
         <div className="absolute inset-0 bg-slate-900 flex items-center justify-center p-4">
            <div className="relative w-full h-full border-4 border-slate-700 rounded-lg overflow-hidden shadow-2xl flex items-center justify-center">
               <ImageIcon className="h-32 w-32 text-slate-800 opacity-50" />
               <div className="absolute top-[20%] left-[15%] w-[40%] h-[35%] border-2 border-amber-500 bg-amber-500/10 rounded cursor-pointer hover:bg-amber-500/20 transition-all group-hover:scale-[1.01] shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                  <div className="absolute -top-6 left-0 bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-t tracking-wider shadow-sm uppercase">Equipment Hazard [92%]</div>
                  <div className="absolute inset-0 border border-white/20 animate-pulse" />
               </div>
               <div className="absolute top-[60%] left-[60%] w-[25%] h-[25%] border-2 border-emerald-500 bg-emerald-500/10 rounded cursor-pointer hover:bg-emerald-500/20 transition-all group-hover:scale-[1.01] shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                  <div className="absolute -top-6 left-0 bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-t tracking-wider shadow-sm uppercase">PPE Compliance [98%]</div>
                  <div className="absolute inset-0 border border-white/20 animate-pulse" />
               </div>
               <div className="absolute bottom-4 right-4 bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  <span className="text-[10px] font-bold text-white uppercase tracking-widest">Enhanced AI Layer ON</span>
               </div>
            </div>
         </div>
         <div className="absolute bottom-0 left-0 right-0 h-1 border-t border-slate-200/50 bg-white/20 blur-[1px]" />
      </div>
    );
  }

  if (file.type === "Audio") {
    return (
      <div className="w-full max-w-4xl space-y-8 animate-in slide-in-from-bottom-4 duration-500">
         <div className="bg-white border-2 border-slate-100 rounded-2xl shadow-2xl p-8 space-y-6">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-amber-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
                     <AudioIcon className="h-5 w-5" />
                  </div>
                  <div>
                     <h3 className="text-lg font-bold text-slate-900">{file.name}</h3>
                     <p className="text-xs text-slate-400 font-medium uppercase tracking-[0.2em]">{file.duration} · High Fidelity Recording</p>
                  </div>
               </div>
               <StatusIndicator status="reviewed" type="review" />
            </div>

            <div className="h-32 w-full bg-slate-50 rounded-xl relative overflow-hidden border border-slate-100 shadow-inner group">
               <div className="absolute inset-0 flex items-center justify-evenly px-4">
                  {[2, 4, 3, 6, 8, 4, 2, 5, 9, 3, 5, 8, 4, 6, 2, 4, 6, 8, 4, 2, 3, 5, 7, 5, 3, 2, 4, 6, 4, 2].map((h, i) => (
                    <div key={i} className="w-1.5 bg-slate-200 rounded-full transition-all group-hover:bg-slate-300" style={{ height: `${h * 10}%` }} />
                  ))}
               </div>
               <div className="absolute inset-0 flex items-center justify-evenly px-4">
                  {[2, 4, 3, 6, 8, 4, 2, 5, 9, 3, 5, 8, 4, 6, 2, 4, 6, 8, 4, 2, 3, 5, 7, 5, 3, 2, 4, 6, 4, 2].map((h, i) => (
                    <div key={i} className={`w-1.5 bg-primary/60 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.2)] transition-all ${i < 12 ? "opacity-100" : "opacity-0"}`} style={{ height: `${h * 10}%` }} />
                  ))}
               </div>
               <div className="absolute top-0 bottom-0 left-[40%] w-0.5 bg-primary shadow-[0_0_15px_rgba(37,99,235,0.5)] z-20" />
               <div className="absolute top-0 bottom-0 left-[40%] -translate-x-1/2 flex items-center">
                  <div className="h-4 w-4 bg-primary rounded-full border-2 border-white shadow-lg shadow-primary/30" />
               </div>
            </div>

            <div className="flex items-center justify-center gap-10">
               <button className="text-slate-400 hover:text-primary transition-colors hover:scale-110 active:scale-95"><Clock className="h-6 w-6" /></button>
               <button className="h-14 w-14 bg-slate-900 rounded-full flex items-center justify-center text-white shadow-xl hover:bg-slate-800 transition-all hover:scale-105 active:scale-95">
                  <Play className="h-6 w-6 fill-white ml-1" />
               </button>
               <button className="text-slate-400 hover:text-emerald-600 transition-colors hover:scale-110 active:scale-95"><Settings className="h-6 w-6" /></button>
            </div>
         </div>

         <div className="grid grid-cols-2 gap-4">
            <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm relative overflow-hidden">
               <div className="absolute top-0 left-0 w-1 h-full bg-emerald-600" />
               <div className="flex items-center gap-2 mb-2">
                  <div className="h-6 w-6 rounded bg-emerald-50 flex items-center justify-center text-emerald-600 text-xs font-bold">A</div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Speaker A (Operator)</span>
               </div>
               <p className="text-xs text-slate-600 italic font-medium">"I noticed the vibration around 14:15. It didn't sound right so I called Supervisor B."</p>
            </div>
            <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm relative overflow-hidden">
               <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
               <div className="flex items-center gap-2 mb-2">
                  <div className="h-6 w-6 rounded bg-amber-50 flex items-center justify-center text-amber-600 text-xs font-bold">B</div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Speaker B (Supervisor)</span>
               </div>
               <p className="text-xs text-slate-600 italic font-medium">"Understood. We are checking maintenance logs for roller #14 immediately."</p>
            </div>
         </div>
      </div>
    );
  }

  return null;
}

function AdaptiveExtractionOutput({ file }: { file: any }) {
  const ExtractionItem = ({ fact, type, source, conf }: any) => (
    <div className="bg-white border border-slate-200 rounded-lg p-3 hover:border-primary/40 transition-all hover:shadow-md cursor-pointer group mb-3 last:mb-0 relative overflow-hidden">
       <div className="absolute top-0 left-0 w-1 h-full bg-slate-100 group-hover:bg-primary/50 transition-colors" />
          <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{type}</span>
             <ConfidenceChip level={conf.toLowerCase() as any} />
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
             <button className="p-1 hover:bg-emerald-50 text-emerald-600 rounded transition-colors" title="Accept"><Check className="h-3 w-3" /></button>
             <button className="p-1 hover:bg-slate-100 text-slate-400 rounded transition-colors" title="Edit"><Pencil className="h-3 w-3" /></button>
             <button className="p-1 hover:bg-rose-50 text-rose-600 rounded transition-colors" title="Reject"><X className="h-3 w-3" /></button>
          </div>
       </div>
       <p className="text-xs font-bold text-slate-900 leading-snug mb-2 pr-4">{fact}</p>
       <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest border-t pt-2 border-slate-50">
          <Paperclip className="h-2.5 w-2.5" />
          {source}
       </div>
    </div>
  );

  const ExtractionSection = ({ title, icon: Icon, children }: { title: string, icon: any, children: React.ReactNode }) => (
    <div className="space-y-3 mb-8 last:mb-0">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
        <Icon className="h-3.5 w-3.5 text-slate-400" />
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">{title}</span>
      </div>
      <div>{children}</div>
    </div>
  );

  if (file.type === "Document") {
    return (
      <div className="space-y-2 pb-20">
         <ExtractionSection title="Facts & Measurements" icon={FileText}>
            <ExtractionItem fact="Conveyor belt tear identified at section 14" type="Critical Event" source="Page 1, Para 2" conf="High" />
            <ExtractionItem fact="Tear length measured at 920mm (90% width)" type="Measurement" source="Page 2, Table 1" conf="High" />
         </ExtractionSection>
         <ExtractionSection title="Timeline & Sequence" icon={Clock}>
            <ExtractionItem fact="14:15: First report of unusual vibration" type="Timestamp" source="Witness A Statement" conf="High" />
            <ExtractionItem fact="14:47: Final e-stop activation detected" type="Timestamp" source="SCADA System Log" conf="Medium" />
         </ExtractionSection>
         <ExtractionSection title="Potential Risk Factors" icon={AlertTriangle}>
            <ExtractionItem fact="Likely mechanical failure of bearing section" type="Root Cause" source="Maintenance Sys" conf="Medium" />
         </ExtractionSection>
      </div>
    );
  }

  if (file.type === "Image") {
    return (
      <div className="space-y-2 pb-20">
         <ExtractionSection title="Composition & Objects" icon={LayoutGrid}>
            <ExtractionItem fact="Visible tear across 90% of belt width" type="Surface Condition" source="Region [X:234, Y:782]" conf="High" />
            <ExtractionItem fact="Roller support bracket appears detached" type="Equipment Hazard" source="Region [X:451, Y:123]" conf="Medium" />
         </ExtractionSection>
         <ExtractionSection title="Safety & PPE" icon={CheckCircle2}>
            <ExtractionItem fact="Person wearing high-vis vest & hard hat" type="PPE Compliance" source="Global Scene" conf="High" />
            <ExtractionItem fact="No exclusion zone barriers visible near tear" type="Safety Observation" source="Global Scene" conf="High" />
         </ExtractionSection>
      </div>
    );
  }

  if (file.type === "Audio") {
     return (
        <div className="space-y-6 pb-20">
           <ExtractionSection title="Key Statements" icon={MessageSquare}>
              <ExtractionItem fact="Supervisor B was notified 15 mins before failure" type="Statement" source="Audio [01:22]" conf="High" />
              <ExtractionItem fact="Warning lights were functioning (audible alarm)" type="Verification" source="Audio [03:45]" conf="High" />
           </ExtractionSection>
           <ExtractionSection title="Participants & Tone" icon={DocIcon}>
              <ExtractionItem fact="Speaker A: High stress, rapid speech" type="Affect Analysis" source="Metadata" conf="Medium" />
           </ExtractionSection>
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
  return (
    <div className="flex flex-col h-full bg-slate-50/10 overflow-auto">
      <div className="p-6 space-y-6">
        <div className="bg-white border rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-6 pb-2 border-b">
            <h3 className="text-sm font-bold text-slate-900 border-none">Analysis Agents & Execution Chain</h3>
            <Button size="sm" className="h-8 text-xs font-bold gap-2 bg-slate-900 hover:bg-slate-800">
               <Play className="h-3 w-3" /> Run Full Intelligence Chain
            </Button>
          </div>
          <div className="grid grid-cols-5 gap-4">
            {analysisAgents.map((agent) => (
              <div key={agent.name} className="border rounded-xl p-4 hover:border-primary/30 transition-all hover:shadow-md bg-white group cursor-pointer relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-full h-1 ${agent.lastStatus === 'reviewed' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-7 w-7 rounded bg-slate-50 flex items-center justify-center border group-hover:bg-primary/5 transition-colors">
                    {agent.icon && <agent.icon className="h-4 w-4 text-slate-600 group-hover:text-primary" />}
                  </div>
                  <span className="text-xs font-bold text-slate-800">{agent.name}</span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium leading-relaxed mb-4 h-8 overflow-hidden">{agent.purpose}</p>
                <div className="space-y-1.5 border-t pt-3">
                  <div className="flex justify-between text-[10px] font-bold">
                    <span className="text-slate-400 uppercase tracking-tighter">Status</span>
                    <span className={agent.lastStatus === "reviewed" ? "text-emerald-600" : "text-amber-600"}>{agent.lastStatus}</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-bold">
                    <span className="text-slate-400 uppercase tracking-tighter">Confidence</span>
                    <span className="text-slate-800">92%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border rounded-xl shadow-sm p-5">
           <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-4">Execution History</span>
           <table className="w-full enterprise-table">
              <thead>
                <tr className="bg-slate-50">
                  <th className="rounded-tl-lg">Run ID</th>
                  <th>Agent</th>
                  <th>Triggered By</th>
                  <th>Input Source</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th className="rounded-tr-lg">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {runHistory.map((run) => (
                  <tr key={run.runId} className="hover:bg-slate-50 transition-colors">
                    <td className="font-mono text-[11px] font-bold text-primary">{run.runId}</td>
                    <td className="text-xs font-bold text-slate-700">{run.agent}</td>
                    <td className="text-[11px] text-slate-500">{run.triggeredBy}</td>
                    <td className="text-[11px] text-slate-400 italic">"{run.inputSource}"</td>
                    <td>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${
                        run.status === "completed" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-slate-50 text-slate-400 border-slate-100"
                      }`}>
                        {run.status}
                      </span>
                    </td>
                    <td className="text-[11px] text-slate-500">{run.createdAt}</td>
                    <td>
                      <button className="text-[10px] font-bold text-primary hover:underline">View Proof-Points</button>
                    </td>
                  </tr>
                ))}
              </tbody>
           </table>
        </div>
      </div>
    </div>
  );
}

function ReportsTab() {
  return (
    <div className="flex h-full bg-slate-50/10">
      <div className="w-[300px] border-r bg-white flex flex-col shrink-0">
        <div className="h-12 border-b flex items-center justify-between px-4 shrink-0 bg-slate-50/50">
           <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Reports Console</span>
           <Button variant="ghost" size="sm" className="h-8 text-[11px] font-bold gap-2 text-primary hover:bg-primary/5">
              <Folders className="h-3.5 w-3.5" /> + Create New
           </Button>
        </div>
        <div className="flex-1 overflow-auto p-2 custom-scrollbar space-y-1">
           {[
             { title: "Initial Investigation Report", version: "V1.2", date: "Today", status: "draft" },
             { title: "Internal Compliance Review", version: "V1.0", date: "Yesterday", status: "in_review" },
             { title: "Executive Safety Summary", version: "V0.8", date: "2d ago", status: "draft" },
           ].map((r, i) => (
             <div key={i} className={`p-3 rounded-lg border cursor-pointer transition-all hover:border-primary/30 ${i === 0 ? 'bg-primary/5 border-primary/20 shadow-sm' : 'bg-white border-transparent'}`}>
                <div className="flex justify-between items-start mb-1">
                   <h4 className="text-xs font-bold text-slate-800 leading-tight pr-2">{r.title}</h4>
                   <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[9px] font-bold text-slate-500">{r.version}</span>
                </div>
                <div className="flex items-center justify-between mt-3">
                   <span className="text-[10px] text-slate-400 font-medium">Edited {r.date}</span>
                   <StatusChip status={r.status as any} />
                </div>
             </div>
           ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center p-8 overflow-auto custom-scrollbar">
         <div className="w-full max-w-[800px] flex flex-col gap-6">
            <div className="flex items-center justify-between bg-white px-6 py-4 rounded-xl border-b -mx-8 -mt-8 mb-8 shadow-sm">
               <div>
                  <h2 className="text-lg font-bold text-slate-900 border-none p-0 inline-flex items-center gap-3">
                     Initial Investigation Report <span className="text-slate-300 font-mono text-xs">V1.2</span>
                  </h2>
               </div>
               <div className="flex items-center gap-2">
                  <Button variant="outline" className="h-9 gap-2 font-bold text-xs"><Eye className="h-3.5 w-3.5" /> Preview PDF</Button>
                  <Button className="h-9 gap-2 font-bold text-xs bg-slate-900 hover:bg-slate-800"><CheckCircle2 className="h-3.5 w-3.5" /> Finalize Build</Button>
               </div>
            </div>

            <div className="space-y-8 pb-32">
               {[
                 { title: "1. Executive Summary", content: "On April 5, 2026, a conveyor belt failure occurred in Zone B of Site Alpha, resulting in material spillage and near-miss injury to two operators.", ai: true },
                 { title: "2. Facts & Incident Chronology", content: "Extraction from SCADA and witness statements confirms the failure occurred at 14:35 relative to section 14. E-Stop was manually triggered 12 mins later.", ai: true },
                 { title: "3. Analysis & Root Cause", content: "Click to insert AI PEEPO proof-points...", ai: false },
                 { title: "4. Preventive Actions", content: "Replacement of roller support bracket with industrial Grade 8 steel and quarterly vibration monitoring...", ai: false },
               ].map((section, idx) => (
                  <div key={idx} className="group relative bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
                     <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-50">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">{section.title}</h4>
                        <div className="flex gap-1.5">
                           {section.ai && <span className="text-[9px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded uppercase">AI Drafted</span>}
                           <button className="p-1 hover:bg-slate-50 rounded text-slate-400"><Pencil className="h-3.5 w-3.5" /></button>
                        </div>
                     </div>
                     <p className={`text-sm leading-relaxed ${section.content.includes("Click") ? "text-slate-300 italic" : "text-slate-700 font-medium"}`}>
                        {section.content}
                     </p>
                     <div className="mt-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold border border-slate-100 hover:bg-slate-50 px-3">+ Add AI Proof Point</Button>
                        <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold border border-slate-100 hover:bg-slate-50 px-3">+ Cite Evidence</Button>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </div>

      <div className="w-[280px] border-l bg-white flex flex-col shrink-0">
        <div className="h-12 border-b flex items-center justify-between px-4 shrink-0 bg-slate-50/50">
           <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Report Assets</span>
        </div>
        <div className="p-4 space-y-6 overflow-auto custom-scrollbar">
           <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter block mb-3">AI Intelligence Blocks</span>
              <div className="space-y-2">
                 {["PEEPO Fact-Chain", "IPLS Coding Matrix", "Actor Fatigue Analysis", "Prevention Logic"].map(block => (
                    <div key={block} className="p-2 border rounded border-slate-100 bg-slate-50/30 hover:bg-primary/5 hover:border-primary/20 transition-all cursor-move group">
                       <span className="text-[11px] font-bold text-slate-600 group-hover:text-primary transition-colors">{block}</span>
                    </div>
                 ))}
              </div>
           </div>
           <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter block mb-3">High Confidence Citations</span>
              <div className="space-y-2">
                 {evidenceFiles.filter(f => f.tags.includes("key")).map(f => (
                    <div key={f.id} className="p-2 border rounded border-slate-100 bg-slate-50/30 hover:border-amber-200 transition-all cursor-move group">
                       <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-600 truncate max-w-[140px]">{f.name}</span>
                          <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function ReviewTab() {
  return (
    <div className="flex h-full bg-slate-50/10">
      <div className="flex-1 overflow-auto p-8 custom-scrollbar">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="bg-white border rounded-2xl shadow-sm p-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-sm">
                  <CheckCircle2 className="h-6 w-6" />
               </div>
               <div>
                 <h2 className="text-xl font-bold text-slate-900 border-none p-0 inline-flex items-center gap-3">Review & Board Approval</h2>
                 <p className="text-xs text-slate-500 font-medium uppercase tracking-widest mt-1">Final Investigation Report — CS-2026-0147 [v1.2]</p>
               </div>
            </div>
            <div className="flex gap-2.5">
              <Button variant="outline" className="h-10 text-xs font-bold px-5 border-slate-200 hover:bg-slate-50">Request Corrections</Button>
              <Button className="h-10 text-xs font-bold px-6 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 gap-2">
                <CheckCircle2 className="h-4 w-4" /> Approve Case & Close
              </Button>
            </div>
          </div>

          <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b bg-slate-50/50 flex items-center justify-between">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Formal Approval Chain</span>
               <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 uppercase">Board Review In-Progress</span>
            </div>
            <div className="p-8 flex items-center justify-between relative">
               <div className="absolute top-1/2 left-10 right-10 h-0.5 bg-slate-100 -translate-y-[24px] z-0" />
               {[
                 { role: "Investigator", user: "Sarah Chen", status: "submitted", date: "Apr 8, 10:12" },
                 { role: "Site Reviewer", user: "John Doe", status: "reviewed", date: "Apr 8, 14:45" },
                 { role: "HSE Board", user: "Director Smith", status: "pending", date: "Present" },
                 { role: "Regulatory", user: "Inspector G", status: "waiting", date: "—" },
               ].map((step, i) => (
                <div key={step.role} className="flex flex-col items-center gap-3 relative z-10 w-48 text-center">
                   <div className={`h-10 w-10 rounded-full border-4 flex items-center justify-center transition-all ${
                     step.status === "submitted" || step.status === "reviewed" ? "bg-emerald-500 border-white text-white shadow-lg shadow-emerald-500/20" :
                     step.status === "pending" ? "bg-amber-500 border-white text-white shadow-lg shadow-amber-500/20 animate-pulse" :
                     "bg-slate-100 border-white text-slate-400"
                   }`}>
                      {step.status === "reviewed" || step.status === "submitted" ? <Check className="h-5 w-5" /> : step.status === "pending" ? <Clock className="h-5 w-5" /> : (i+1)}
                   </div>
                   <div>
                      <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-tighter mb-0.5">{step.role}</h4>
                      <p className="text-xs font-bold text-slate-700 truncate">{step.user}</p>
                      <p className="text-[9px] text-slate-400 font-medium uppercase tracking-[0.1em] mt-1">{step.date}</p>
                   </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 pb-20">
             <div className="bg-white border rounded-2xl shadow-sm p-6 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Board Comments (3)</h3>
                <div className="space-y-4">
                   <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="flex items-center justify-between mb-1.5">
                         <span className="text-[10px] font-bold text-slate-900 uppercase">Director Smith</span>
                         <span className="text-[9px] text-slate-400 font-bold tracking-widest">2h ago</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed font-medium">"Please confirm the specific grade of steel for the replacement bearings mentioned in Sec 4."</p>
                   </div>
                   <Textarea placeholder="Post a board comment..." className="text-xs min-h-[80px] border-slate-100 bg-slate-50/30 focus:bg-white transition-all shadow-inner" />
                   <div className="flex justify-end">
                      <Button size="sm" className="h-8 px-4 text-xs font-bold bg-slate-900">Post Comment</Button>
                   </div>
                </div>
             </div>

             <div className="bg-white border rounded-2xl shadow-sm p-6 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-1 h-full bg-status-review/50" />
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Compliance Checklist</h3>
                <div className="space-y-2.5">
                   {[
                     { label: "Witness Confidentiality Logged", ok: true },
                     { label: "Site Photos GPS Verified", ok: true },
                     { label: "Root Cause Chain Complete", ok: true },
                     { label: "Regulatory Form #12 Filed", ok: false },
                     { label: "External Peer Review", ok: false },
                   ].map((c, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0 px-1">
                         <span className="text-xs font-bold text-slate-700">{c.label}</span>
                         {c.ok ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <div className="h-4 w-4 rounded-full border-2 border-slate-200" />}
                      </div>
                   ))}
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AuditTrailTab() {
  const auditEntries = [
    { timestamp: "2026-04-08 10:15", user: "System", role: "AI Agent", action: "Analysis Completed", objectType: "Analysis", objectName: "PEEPO Reasoning - RUN-046", prevState: "running", newState: "completed" },
    { timestamp: "2026-04-08 10:12", user: "System", role: "AI Agent", action: "Analysis Started", objectType: "Analysis", objectName: "PEEPO Reasoning - RUN-046", prevState: "—", newState: "running" },
    { timestamp: "2026-04-08 10:11", user: "Sarah Chen", role: "Investigator", action: "Extraction Accepted", objectType: "Evidence", objectName: "6 items accepted", prevState: "pending", newState: "reviewed" },
    { timestamp: "2026-04-08 09:45", user: "System", role: "AI Agent", action: "Extraction Metadata Sync", objectType: "Evidence", objectName: "incident_report_initial.pdf", prevState: "—", newState: "synced" },
    { timestamp: "2026-04-08 09:30", user: "System", role: "AI Agent", action: "Extraction Completed", objectType: "Evidence", objectName: "incident_report_initial.pdf", prevState: "processing", newState: "extracted" },
    { timestamp: "2026-04-08 08:00", user: "Ahmed Khan", role: "Investigator", action: "Evidence Uploaded", objectType: "Evidence", objectName: "4 files uploaded", prevState: "—", newState: "uploaded" },
    { timestamp: "2026-04-07 16:00", user: "John Doe", role: "Manager", action: "Case Created", objectType: "Case", objectName: "CS-2026-0147", prevState: "—", newState: "draft" },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50/10">
      <div className="h-12 border-b bg-white flex items-center justify-between px-6 shrink-0 shadow-sm relative z-10">
         <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Audit Logs</span>
            <div className="h-px w-8 bg-slate-200" />
            <span className="text-[10px] font-bold text-slate-400">Total Entries: {auditEntries.length}</span>
         </div>
         <div className="flex items-center gap-2">
            <div className="flex items-center p-1 bg-slate-100 rounded-md border">
               <button className="px-3 py-1 text-[9px] font-bold rounded-sm bg-white shadow-sm text-primary">Live View</button>
               <button className="px-3 py-1 text-[9px] font-bold rounded-sm text-slate-500 hover:text-slate-900">Historical Archive</button>
            </div>
            <Button variant="outline" size="sm" className="h-8 text-[10px] font-bold gap-2">
               <Upload className="h-3.5 w-3.5" /> Export Logs
            </Button>
         </div>
      </div>
      <div className="flex-1 overflow-auto p-4 custom-scrollbar">
         <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
            <div className="h-12 border-b bg-slate-50 px-4 flex items-center justify-between">
               <div className="flex gap-4">
                  <select className="text-[10px] font-bold border rounded bg-white px-2 py-1 uppercase tracking-tight"><option>All Users</option></select>
                  <select className="text-[10px] font-bold border rounded bg-white px-2 py-1 uppercase tracking-tight"><option>All Actions</option></select>
                  <select className="text-[10px] font-bold border rounded bg-white px-2 py-1 uppercase tracking-tight"><option>All Objects</option></select>
               </div>
               <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400" />
                  <input placeholder="Filter trail..." className="h-7 w-48 pl-8 text-[10px] font-bold border rounded bg-white focus:outline-none focus:ring-1 focus:ring-primary/20" />
               </div>
            </div>
            <table className="w-full enterprise-table">
              <thead>
                <tr className="bg-white">
                  <th className="pl-6">Timestamp</th>
                  <th>User Identity</th>
                  <th>Role</th>
                  <th>Operation</th>
                  <th>Object Type</th>
                  <th>Object Identifier</th>
                  <th>Previous State</th>
                  <th className="pr-6">New State</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {auditEntries.map((e, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors cursor-pointer group">
                    <td className="pl-6 text-[10px] font-mono text-slate-400 whitespace-nowrap">{e.timestamp}</td>
                    <td className="text-xs font-bold text-slate-700 py-3">
                       <div className="flex items-center gap-2">
                          <div className="h-5 w-5 rounded-full bg-slate-100 border flex items-center justify-center text-[9px] font-bold text-slate-600">{e.user[0]}</div>
                          {e.user}
                       </div>
                    </td>
                    <td className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{e.role}</td>
                    <td className="text-xs font-bold text-slate-900 group-hover:text-primary transition-colors">{e.action}</td>
                    <td className="text-[10px] text-slate-400 font-bold uppercase">{e.objectType}</td>
                    <td className="text-xs font-bold text-primary truncate max-w-[180px]">{e.objectName}</td>
                    <td className="text-[10px] font-mono text-slate-400 italic">"{e.prevState}"</td>
                    <td className="pr-6">
                       <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border shadow-sm ${
                         e.newState === 'completed' || e.newState === 'reviewed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                         e.newState === 'running' ? 'bg-amber-50 text-amber-700 border-amber-100 animate-pulse' :
                         'bg-slate-50 text-slate-400 border-slate-100'
                       }`}>
                          {e.newState}
                       </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
         </div>
         <div className="h-20" />
      </div>
    </div>
  );
}

export default function CaseWorkspacePage() {
  const { caseId } = useParams();
  const [activeTab, setActiveTab] = useState("Evidence");

  return (
    <AppLayout>
      <div className="flex flex-col h-full bg-slate-50/10 h-screen overflow-hidden">
        {/* Case Workspace Header */}
        <div className="bg-white border-b px-6 py-4 flex items-center justify-between shrink-0 shadow-sm relative z-30">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-slate-900 rounded-lg flex items-center justify-center shadow-lg border-2 border-slate-800">
               <Brain className="h-6 w-6 text-primary animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-bold text-slate-400 tracking-[0.2em] uppercase">Safety Investigation Case</span>
                <StatusChip status="in_progress" />
                <SeverityChip severity="high" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 border-none p-0 flex items-center gap-2 leading-none">
                Conveyor Belt Failure - Zone B <span className="text-slate-400 font-mono text-sm leading-none ml-1">#{caseId || "CS-2026-0147"}</span>
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-7 w-7 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold shadow-sm ring-1 ring-slate-100">U{i}</div>
              ))}
              <div className="h-7 w-7 rounded-full border-2 border-white bg-primary text-white flex items-center justify-center text-[10px] font-bold shadow-sm ring-1 ring-slate-100">+2</div>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <Button className="h-9 font-bold px-4 gap-2 bg-slate-900 hover:bg-slate-800 shadow-md transition-all active:scale-95 group">
              <Send className="h-3.5 w-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" /> Submit Case for Approval
            </Button>
            <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-full hover:bg-slate-100 transition-colors">
               <MoreVertical className="h-4 w-4 text-slate-400" />
            </Button>
          </div>
        </div>

        {/* Tactical Header / Progress */}
        <div className="bg-white border-b h-12 flex items-center justify-between px-6 shrink-0 relative z-20 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex gap-1 h-full items-center">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`h-full px-5 text-xs font-bold transition-all relative group ${
                  activeTab === tab 
                  ? "text-primary bg-primary/5" 
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                {tab}
                {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary shadow-[0_-2px_10px_rgba(37,99,235,0.5)]" />}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-6">
             <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">Case Maturity</span>
                <div className="flex gap-1.5">
                   {progressSteps.map((step, i) => (
                      <div key={i} className={`h-1.5 w-6 rounded-full transition-all duration-700 ${step.done ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]" : "bg-slate-200"}`} title={step.label} />
                   ))}
                </div>
             </div>
             <div className="flex items-center gap-2 border-l pl-6 border-slate-100">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">3 Days Remaining</span>
             </div>
          </div>
        </div>

        {/* Tab Content Rendering */}
        <div className="flex-1 overflow-hidden relative">
          {activeTab === "Overview" && <OverviewTab />}
          {activeTab === "Evidence" && <EvidenceTab />}
          {activeTab === "Extraction Review" && <ExtractionTab />}
          {activeTab === "Analysis" && <AnalysisTab />}
          {activeTab === "Reports" && <ReportsTab />}
          {activeTab === "Review" && <ReviewTab />}
          {activeTab === "Audit Trail" && <AuditTrailTab />}
        </div>
      </div>
    </AppLayout>
  );
}
