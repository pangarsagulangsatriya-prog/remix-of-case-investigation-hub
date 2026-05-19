import React, { useState, useEffect, useRef, useMemo } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { 
  Play, 
  Brain, 
  Clock, 
  AlertTriangle, 
  ChevronRight, 
  Check, 
  X, 
  Search, 
  History, 
  BookText, 
  Folder, 
  ChevronDown, 
  Loader2, 
  Cpu, 
  LayoutGrid, 
  FileText, 
  Paperclip, 
  Quote, 
  Activity, 
  Users, 
  Copy, 
  FileJson,
  XCircle,
  HelpCircle,
  Database,
  Folders,
  Crosshair,
  Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useEvidence } from "@/hooks/useEvidence";
import { AgentState, AgentRunHistory, EvidenceTraceLink } from "@/types/workspace";
import { FactChronologyModule } from "@/components/analysis/FactChronologyModule";

// Icons mapping for local use
const AudioIcon = Activity;
const DocIcon = FileText;

const initialAgentsState: AgentState[] = [
  { 
     id: 'fact', 
     name: 'Fact & Chronology', 
     icon: Clock, 
     purpose: 'Reconstruct sequence of events from raw evidence batches.', 
     status: 'completed', 
     dependencies: [],
     runCount: 3,
     lastRunTimestamp: "Today, 10:42 AM",
     tokenEstimate: 2500,
     actualTokenUsage: 2140,
     durationMs: 4200,
     history: [
       { run_id: "r-101", agent_id: "fact", started_at: "2026-04-20T09:00:00Z", ended_at: "2026-04-20T09:00:05Z", triggered_by: "System", status: "completed", token_usage: 2050, duration_ms: 5000, summary: "Initial extraction" },
       { run_id: "r-102", agent_id: "fact", started_at: "2026-04-20T10:42:00Z", ended_at: "2026-04-20T10:42:04Z", triggered_by: "Current User", status: "completed", token_usage: 2140, duration_ms: 4200, summary: "Rerun after evidence update" }
     ],
     backendCapabilities: { canPause: false, canResume: false, canStop: true, canRerun: true },
     knowledgeSelection: ['Audio Recording', 'Internal Document', 'External Document', 'Photos & Media'],
     results: {
        ringkasan: {
           tanggal: "05 November 2024",
           jam: "22:15 - 01:35",
           lokasi: "KM 12 & KM 7 Hauling Road",
           jenis: "Fatigue Validation Failure & Comms Failure",
           deskripsi: "Kegagalan validasi intervensi kelelahan dan hambatan komunikasi radio berujung pada kecelakaan tunggal Operator Saiful.",
           departemen: "Mining Operations / DMS Control Room",
           sumber_bukti: "DMS Recap, WhatsApp, Radio, Video DMS",
           severity: "Critical"
        },
        chronology_items: [
           { 
             id: 'chrono-saiful-001', 
             phase: 'pre_contact', 
             time_label: "Minggu 10-41",
             description: "Petugas DMS mengidentifikasi riwayat deviasi kelelahan sebanyak 41 kali pada profil Operator Saiful.", 
             chronology_text: "Petugas DMS mengidentifikasi riwayat deviasi kelelahan sebanyak 41 kali pada profil Operator Saiful.",
             confidence: "high",
             status: "completed",
             verification_status: "human_verified",
             annotated_by_human: true,
             breakdown: {
                subject: { value: "Petugas DMS (Aris)", evidence: "tanggung jawab Pak Aris sebagai DMS control room" },
                action: { 
                    value: "Mengidentifikasi riwayat deviasi", 
                    citations: [
                       { type: 'document', content: "ada juga banyak di rekapan juga sampai dari week 10 sampai week 41 itu 41 kali", page: "04", source: "DMS_RECAP_WEEKLY.XLSX" },
                       { type: 'image', content: "Screenshot dashboard DMS menunjukkan lonjakan deviasi pada profil Saiful.", source: "DMS_ALERT_SS_01.PNG", thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=200" }
                    ]
                 },
                object: { 
                    value: "Profil Operator Saiful", 
                    citations: [
                       { type: 'audio', content: "catatannya banyak fatigue, ah itu biasa kami sering intens... mengontrol mereka", speaker: "Aris", time: "02:16", source: "VOIP_REC_01.WAV" },
                       { type: 'video', content: "Rekaman CCTV menunjukkan operator Saiful terlihat kelelahan saat memasuki unit.", time: "22:05", source: "CCTV_GATE_A.MP4", thumbnail: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&q=80&w=200" }
                    ]
                 },
                source_system: { 
                    value: "Rekapitulasi Data DMS", 
                    citations: [
                       { type: 'document', content: "laporan temuan deviasi fatigue itu ada yang kami catat tuh Pak di rekap itu", page: "08", source: "DMS_RECAP_WEEKLY.XLSX" }
                    ]
                 },
                condition: { 
                    value: "Pemantauan Intensif", 
                    citations: [
                       { type: 'audio', content: "kalau misalnya dari orang ini eh catatannya banyak fatigue, ah itu biasa kami sering intens", speaker: "Aris", time: "02:18", source: "VOIP_REC_01.WAV" }
                    ]
                 }
             }
           },
           { 
             id: 'chrono-saiful-002', 
             phase: 'pre_contact', 
             time_label: "22:15 WITA",
             description: "Sistem DMS memicu peringatan kritis kategori Lockdown pada unit yang sedang dioperasikan oleh Operator Saiful.", 
             chronology_text: "Sistem DMS memicu peringatan kritis kategori Lockdown pada unit yang sedang dioperasikan oleh Operator Saiful.",
             confidence: "high",
             status: "completed",
             verification_status: "ai_generated",
             annotated_by_human: false,
             breakdown: {
                subject: { value: "Sistem DMS", evidence: "kalau di klik DMS dua, kalau di Gimo satu" },
                action: { value: "Memicu peringatan kritis", evidence: "Yang pertama itu eh Lockdown, itu di jam 22:15" },
                object: { value: "Unit Operator Saiful", evidence: "Jam 22:15 ada alert lockdown-nya Pak Saiful ya" },
                source_system: { value: "Dashboard Control Room", evidence: "Terus saya pantau lagi di klik DMS" },
                condition: { value: "Operasional Malam Hari", evidence: "pengawas room yang bertugas pada malam hari itu" }
             }
           },
           { 
             id: 'chrono-saiful-003', 
             phase: 'pre_contact', 
             time_label: "Pasca 22:15",
             description: "Pengawas Fatur mengonfirmasi kondisi operator dalam keadaan baik secara verbal melalui aplikasi WhatsApp tanpa bukti visual.", 
             chronology_text: "Pengawas Fatur mengonfirmasi kondisi operator dalam keadaan baik secara verbal melalui aplikasi WhatsApp tanpa bukti visual.",
             confidence: "high",
             status: "completed",
             verification_status: "human_verified",
             annotated_by_human: true,
             breakdown: {
                subject: { value: "Pengawas Fatur", evidence: "dia lapor kondisi beliau yang kondisinya baik-baik saja" },
                action: { value: "Mengonfirmasi status secara verbal", evidence: "Minta evidence lanjut? Enggak. Karena saya yakin chat itu sudah memastikan" },
                object: { value: "Kondisi Operator", evidence: "Sudah diintervensi komunikasi dua arah sama Pak Saiful... beliau baik-baik saja" },
                source_system: { value: "Aplikasi WhatsApp", evidence: "Komunikasi japri lewat WA ke pengawas room" },
                condition: { value: "Ketiadaan Bukti Foto", evidence: "Aris did not request photo evidence of the intervention, relying on the text message" }
             }
           },
           { 
             id: 'chrono-saiful-004', 
             phase: 'contact', 
             time_label: "01:35 WITA",
             description: "Unit Operator Saiful mengalami kecelakaan tunggal yang teramati melalui pemantauan video real-time di Control Room.", 
             chronology_text: "Unit Operator Saiful mengalami kecelakaan tunggal yang teramati melalui pemantauan video real-time di Control Room.",
             confidence: "high",
             status: "completed",
             verification_status: "human_verified",
             annotated_by_human: true,
             breakdown: {
                subject: { value: "Unit Operator Saiful", evidence: "Pak Saiful itu alertnya di mana... kecelakaan tunggal" },
                action: { value: "Mengalami kecelakaan tunggal", evidence: "itu masuk pas di nonton pas di pertengahan video itu sudah kecelakaan tunggal" },
                object: { value: "Fasilitas Operasional", evidence: "sudah kecelakaan tunggal jam 01:35" },
                source_system: { value: "Video Surveillance DMS", evidence: "pas di nonton pas di pertengahan video" },
                condition: { value: "Shift Kritis", evidence: "pada saat shift kritis Pak di hari Jumat" }
             }
           },
           { 
             id: 'chrono-saiful-005', 
             phase: 'post_contact', 
             time_label: "Pasca 01:35",
             description: "Infrastruktur komunikasi mengalami gangguan sinyal pada area KM 12 dan KM 7 menghambat koordinasi jalur radio.", 
             chronology_text: "Infrastruktur komunikasi mengalami gangguan sinyal pada area KM 12 dan KM 7 menghambat koordinasi jalur radio.",
             confidence: "high",
             status: "completed",
             verification_status: "human_verified",
             annotated_by_human: true,
             breakdown: {
                subject: { value: "Sinyal Radio", evidence: "radio enggak nyampe. KM 12 ke hauling enggak nyampe radio" },
                action: { value: "Mengalami kegagalan transmisi", evidence: "Komunikasi via radio sama pengawas di jalur safety itu... radio enggak nyampe" },
                object: { value: "Koordinasi Jalur Radio", evidence: "jalur komunikasi sama pengawas radio" },
                source_system: { value: "Perangkat Radio Lapangan", evidence: "ada di KM 12 dan KM 7 itu radio enggak nyampe" },
                condition: { value: "Zona Mati (Dead Zone)", evidence: "Radio communication dead zones are identified at KM 12 and KM 7" }
             }
           },
           { 
             id: 'chrono-saiful-006', 
             phase: 'post_contact', 
             time_label: "Pasca 01:35",
             description: "Petugas Control Room memfokuskan pemantauan pada jalur darurat dikarenakan respons pengawas lapangan terbatas.", 
             chronology_text: "Petugas Control Room memfokuskan pemantauan pada jalur darurat dikarenakan respons pengawas lapangan terbatas.",
             confidence: "high",
             status: "completed",
             verification_status: "human_verified",
             annotated_by_human: true,
             breakdown: {
                subject: { value: "Petugas Control Room (Aris)", evidence: "Saya monitor stanby di jalur emergency saja fokusnya" },
                action: { value: "Memfokuskan pemantauan darurat", evidence: "sudah enggak kepikiran lagi hubungi beliau... monitor stanby di jalur emergency" },
                object: { value: "Jalur Emergency", evidence: "TC nya sudah kecelakaan tunggal... monitor stanby di jalur emergency" },
                source_system: { value: "Monitoring System", evidence: "Aris focused on the emergency channel rather than further operator contact" },
                condition: { value: "Respons Pengawas Terbatas", evidence: "Pak Fatur cuma balas Allahuakbar gitu aja di WA. Habis itu enggak ditanya lagi" }
             }
           }
        ]
     }
  },
  { 
     id: 'peepo', 
     name: 'PEEPO Factor', 
     icon: Users, 
     purpose: 'Synthesize People, Equipment, Environment, Procedure, and Organisation factors.', 
     status: 'completed', 
     dependencies: ['fact'],
     runCount: 1,
     lastRunTimestamp: "Yesterday, 4:15 PM",
     tokenEstimate: 4500,
     history: [],
     backendCapabilities: { canPause: true, canResume: true, canStop: true, canRerun: true },
     results: {
        people: ["Operator failure to recognize early vibration signs", "Fatigue during end-of-shift transition"],
        environment: ["High dust levels in Zone B affecting sensor accuracy", "Inadequate lighting near Section 14 drives"],
        equipment: ["Belt tensioner malalignment", "Sensor lag in SCADA relay"],
        procedures: ["Incomplete pre-start checklist for conveyor belts", "Delayed emergency response protocol"],
        organisation: ["Insufficient maintenance staffing for Site Alpha", "Budget constraints on high-grade replacement parts"],
        ringkasan: "Multiple systemic failures across all PEEPO categories contributed to the belt rupture.",
        synthesis: "CRITICAL: The interplay between equipment fatigue and procedural gaps created a window for failure."
     }
  },
  { 
     id: 'ipls', 
     name: 'IPLS Layers', 
     icon: LayoutGrid, 
     purpose: 'Integrated Profile Layer analysis for defensive barrier audit.', 
     status: 'completed', 
     dependencies: ['peepo'],
     runCount: 1,
     lastRunTimestamp: "Yesterday, 4:20 PM",
     tokenEstimate: 3200,
     history: [],
     backendCapabilities: { canPause: true, canResume: true, canStop: true, canRerun: true },
     results: {
        layers: [
           { id: 1, title: "Hardware/Equipment Barriers", items: [{ id: 'l1-1', label: "Vibration sensors functional but delayed", status: "non-conformity" }] },
           { id: 2, title: "Procedural Barriers", items: [{ id: 'l2-1', label: "Checklist 404 not followed by operator", status: "rootcause" }] },
           { id: 3, title: "Personnel Barriers", items: [{ id: 'l3-1', label: "Competency certified for current role", status: "conformity" }] }
        ]
     }
  },
  { 
     id: 'prev', 
     name: 'Prevention Plan', 
     icon: Brain, 
     purpose: 'Generate industrial-grade action plan to prevent recurrence.', 
     status: 'completed', 
     dependencies: ['ipls'],
     runCount: 1,
     lastRunTimestamp: "Yesterday, 4:25 PM",
     tokenEstimate: 5000,
     history: [],
     backendCapabilities: { canPause: true, canResume: true, canStop: true, canRerun: true },
     results: {
        root_cause_actions: [
           { id: 'rc-1', no: 1, layer: "II", hierarchy: "Administrative", action: "Retraining on Checklist 404", pic: "Training Dept", due_date: "2026-05-01", status: "OPEN" }
        ],
        non_conformity_actions: [
           { id: 'nc-1', no: 2, layer: "I", hierarchy: "Engineering", action: "Recalibrate vibration sensors", pic: "Maint Dept", due_date: "2026-04-25", status: "PROGRESS" }
        ],
        improvement_actions: [
           { id: 'imp-1', no: 3, layer: "V", hierarchy: "Organisational", action: "Review staffing levels", pic: "HR Site", due_date: "2026-06-01", status: "OPEN" }
        ]
     }
  }
];

function EvidenceCitationPanel({ citations, forceExpand }: { citations: any[], forceExpand?: boolean }) {
  const [localExpanded, setLocalExpanded] = useState<boolean | null>(null);
  
  // Reset local override when global state changes
  useEffect(() => {
    setLocalExpanded(null);
  }, [forceExpand]);

  const isExpanded = localExpanded ?? forceExpand ?? false;

  if (!citations || citations.length === 0) return null;

  return (
    <div className="space-y-4">
      {!isExpanded ? (
        <button 
          onClick={() => setLocalExpanded(true)}
          className="flex items-center gap-3 group/expand"
        >
          <div className="flex -space-x-2">
            {citations.slice(0, 3).map((c, i) => (
              <div key={i} className="h-6 w-6 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm group-hover/expand:border-indigo-300 transition-colors">
                {c.type === 'audio' ? <Activity className="h-3 w-3 text-emerald-500" /> : 
                 c.type === 'document' ? <FileText className="h-3 w-3 text-blue-500" /> :
                 c.type === 'video' ? <Play className="h-3 w-3 text-rose-500" /> :
                 <Paperclip className="h-3 w-3 text-slate-400" />}
              </div>
            ))}
            {citations.length > 3 && (
              <div className="h-6 w-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[8px] font-black text-slate-500">
                +{citations.length - 3}
              </div>
            )}
          </div>
          <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest group-hover/expand:text-indigo-800 flex items-center gap-1.5">
            View {citations.length} Evidence Traces
            <ChevronDown className="h-2.5 w-2.5" />
          </span>
        </button>
      ) : (
        <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
          {citations.map((cite, idx) => (
            <div key={idx} className="bg-indigo-50/40 p-4 rounded-sm border-l-2 border-indigo-400 group/cite relative">
               <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                     <div className="p-1 bg-white rounded-sm border border-indigo-100">
                        {cite.type === 'audio' ? <Activity className="h-3 w-3 text-emerald-500" /> : 
                         cite.type === 'document' ? <FileText className="h-3 w-3 text-blue-500" /> :
                         cite.type === 'video' ? <Play className="h-3 w-3 text-rose-500" /> :
                         <Paperclip className="h-3 w-3 text-slate-400" />}
                     </div>
                     <span className="text-[8px] font-black text-indigo-600 uppercase tracking-widest">{cite.type} Evidence</span>
                  </div>
                  <div className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">REF #{idx + 1}</div>
               </div>

               <div className="flex gap-4 mb-4">
                  {(cite.type === 'image' || cite.type === 'video') && cite.thumbnail && (
                    <div className="h-16 w-24 shrink-0 border border-indigo-200 bg-slate-900 overflow-hidden rounded-sm relative group/thumb">
                       <img src={cite.thumbnail} className="h-full w-full object-cover opacity-60 group-hover/thumb:opacity-100 transition-opacity" />
                       {cite.type === 'video' && (
                          <div className="absolute inset-0 flex items-center justify-center">
                             <Play className="h-4 w-4 text-white fill-current" />
                          </div>
                       )}
                    </div>
                  )}
                  <p className="text-[11px] font-medium text-slate-700 leading-relaxed italic">
                    "{cite.content || cite.text}"
                  </p>
               </div>

               <div className="flex flex-wrap gap-2 pt-3 border-t border-indigo-100/50">
                  {cite.speaker && (
                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white border border-indigo-100 rounded-sm text-[9px] font-bold text-indigo-600">
                       <Users className="h-3 w-3" />
                       <span>{cite.speaker}</span>
                    </div>
                  )}
                  {cite.time && (
                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-100 border border-amber-200 rounded-sm text-[9px] font-mono font-black text-slate-900">
                       <Clock className="h-3 w-3 text-amber-600" />
                       <span>{cite.time}</span>
                    </div>
                  )}
                  {cite.page && (
                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-50 border border-blue-200 rounded-sm text-[9px] font-black text-blue-700">
                       <FileText className="h-3 w-3" />
                       <span>PAGE {cite.page}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-100 border border-slate-200 rounded-sm text-[9px] font-bold text-slate-500">
                     <Paperclip className="h-3 w-3" />
                     <span className="truncate max-w-[150px]">{cite.source}</span>
                  </div>
               </div>
               
               {idx === 0 && (
                  <button 
                    onClick={() => setLocalExpanded(false)}
                    className="absolute top-2 right-2 p-1 text-slate-300 hover:text-slate-500 transition-colors"
                  >
                    <ChevronDown className="h-3 w-3 rotate-180" />
                  </button>
               )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AnalysisTab() {
  const { caseId } = useParams<{ caseId: string }>();
  const { data: evidence } = useEvidence(caseId!);
  const evidenceFiles = evidence?.files || [];
  const batches = evidence?.batches || [];

  const [agents, setAgents] = useState<AgentState[]>(initialAgentsState);
  const [factViewMode, setFactViewMode] = useState<'slide' | 'default'>('default');
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [allEvidenceExpanded, setAllEvidenceExpanded] = useState(false);

  const [activeEvidenceType, setActiveEvidenceType] = useState('audio_diarization');
  const [expandedFolders, setExpandedFolders] = useState<string[]>(['audio', 'document']);
  const [execMode, setExecMode] = useState<"idle" | "full" | "manual">("idle");
  const [globalStatus, setGlobalStatus] = useState<"idle" | "running" | "blocked" | "completed" | "stopped" | "failed">("idle");
  const [chainQueue, setChainQueue] = useState<string[]>([]);
  const [activeTask, setActiveTask] = useState<string | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [canvasZoom, setCanvasZoom] = useState(85);
  const [isExporting, setIsExporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [preRunAgentId, setPreRunAgentId] = useState<string | null>(null);
  const [historyAgentId, setHistoryAgentId] = useState<string | null>(null);
  const [knowledgeAgentId, setKnowledgeAgentId] = useState<string | null>(null);
  const [expandedKnowledgeFolders, setExpandedKnowledgeFolders] = useState<string[]>([]);
  const [localKnowledgeSelection, setLocalKnowledgeSelection] = useState<Record<string, string[]>>({});
  const [isEditingSummary, setIsEditingSummary] = useState(false);

  // NEW: Fact Trace States
  const [activeEvidenceConsoleMode, setActiveEvidenceConsoleMode] = useState<"trace" | "diarization" | "analysis">("trace");
  const [selectedEvidenceLinkId, setSelectedEvidenceLinkId] = useState<string | null>(null);
  const [draftDescription, setDraftDescription] = useState("");
  const [expandedEvidenceGroups, setExpandedEvidenceGroups] = useState<string[]>(['audio', 'document']);
  const [focusedPreview, setFocusedPreview] = useState<EvidenceTraceLink | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isEvidenceExpanded, setIsEvidenceExpanded] = useState(false);
  const [expandedEntityRows, setExpandedEntityRows] = useState<string[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-initialize knowledge selection if empty
  useEffect(() => {
    if (evidenceFiles.length > 0 && agents.length > 0) {
      setAgents(prev => {
        const needsUpdate = prev.some(a => !a.knowledgeSelection || a.knowledgeSelection.length === 0);
        if (!needsUpdate) return prev;
        
        return prev.map(a => 
          (!a.knowledgeSelection || a.knowledgeSelection.length === 0) 
          ? { ...a, knowledgeSelection: evidenceFiles.map(f => f.id) } 
          : a
        );
      });
    }
  }, [evidenceFiles.length, agents.length]);

  const isAnyAgentRunning = useMemo(() => {
    return globalStatus === "running" || agents.some(a => a.status === "running");
  }, [globalStatus, agents]);

  useEffect(() => {
    if (isAnyAgentRunning) {
      localStorage.setItem(`analysis_running_${caseId}`, "true");
    } else {
      localStorage.removeItem(`analysis_running_${caseId}`);
    }
    return () => {
      localStorage.removeItem(`analysis_running_${caseId}`);
    };
  }, [isAnyAgentRunning, caseId]);

  const handleSaveKnowledge = (agentId: string) => {
    const selection = localKnowledgeSelection[agentId];
    if (selection) {
      setAgents(prev => prev.map(a => a.id === agentId ? { ...a, knowledgeSelection: selection } : a));
      toast.success("Knowledge sources updated.");
    }
  };

  const handleSelectRow = (id: string | null) => {
    setSelectedRowId(id);
    if (id) {
      setActiveEvidenceConsoleMode("trace");
      const factAgent = agents.find(a => a.id === 'fact');
      const item = factAgent?.results?.chronology_items?.find((i: any) => i.id === id);
      if (item) {
        setDraftDescription(item.description || item.chronology_text || "");
        setValidationError(null);
      }
      setSelectedEvidenceLinkId(null);
      setFocusedPreview(null);
    }
  };

  const fitToWorkspace = () => {
    if (!containerRef.current) return;
    const cw = containerRef.current.clientWidth - 40; 
    const ch = containerRef.current.clientHeight - 80;
    const scaleW = cw / 1024;
    const scaleH = ch / 576;
    const newZoom = Math.floor(Math.min(scaleW, scaleH) * 100);
    setCanvasZoom(Math.min(newZoom, 110));
  };

  useEffect(() => {
    if (selectedAgentId) {
      setTimeout(fitToWorkspace, 100);
      setActiveSlide(0);
    }
  }, [selectedAgentId]);

  const selectedAgent = agents.find(a => a.id === selectedAgentId);
  
  const slides = React.useMemo(() => {
    const agent = agents.find(a => a.id === selectedAgentId);
    if (!agent) return [];

     if (agent.id === 'fact' && agent.results) {
        return [
           {
              id: 'fact-1',
              type: 'chronology_module',
              title: 'Fact & Chronology',
              subtitle: 'Overview Incident',
              caseCode: 'CS-2026-0147',
              content: {
                 summary: agent.results.ringkasan?.deskripsi || "No summary available.",
                 metadata: {
                    incidentDate: agent.results.ringkasan?.tanggal || "---",
                    incidentTime: agent.results.ringkasan?.jam || "---",
                    location: agent.results.ringkasan?.lokasi || "---",
                    incidentType: agent.results.ringkasan?.jenis || "---",
                    department: agent.results.ringkasan?.departemen || "---",
                    evidenceSource: agent.results.ringkasan?.sumber_bukti || "---",
                    severity: agent.results.ringkasan?.severity || "---",
                    summary: agent.results.ringkasan?.deskripsi || "---",
                    caseCode: 'CS-2026-0147'
                 },
                 items: agent.results.chronology_items || []
              }
           }
        ];
     }
    
    return [{
       id: 'slide-1',
       type: 'raw',
       title: agent.name,
       content: agent.results || {}
    }];
  }, [selectedAgentId, agents]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') return;
      if (e.key === "ArrowLeft") {
        setActiveSlide(prev => Math.max(0, prev - 1));
      } else if (e.key === "ArrowRight") {
        setActiveSlide(prev => Math.min(slides.length - 1, prev + 1));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [slides.length]);

  useEffect(() => {
    if (globalStatus === 'running' && !activeTask && chainQueue.length > 0) {
      const nextId = chainQueue[0];
      const agent = agents.find(a => a.id === nextId)!;
      
      const depsFailedOrBlocked = agent.dependencies.some(dId => {
        const d = agents.find(x => x.id === dId)!;
        return d.status === 'failed' || d.status === 'blocked';
      });

      if (depsFailedOrBlocked && (execMode === "full" || execMode === "manual")) {
        setGlobalStatus('blocked');
        setAgents(prev => prev.map(a => a.id === nextId ? { ...a, status: 'blocked', dependencyState: 'Blocked', microStatus: 'Waiting for upstream...' } : a));
        return;
      }

      setActiveTask(nextId);
      if (execMode === 'full') {
          setSelectedAgentId(nextId);
      }
      setAgents(prev => prev.map(a => a.id === nextId ? { 
          ...a, 
          status: 'running', 
          microStatus: `Analyzing ${a.knowledgeSelection?.length || 0} evidence assets...`, 
          triggeredBy: execMode === 'full' ? 'System' : 'Current User' 
      } : a));

      const stages = [
          'Reading evidence batches...',
          'Mapping involved entities...',
          'Synthesizing workspace findings...',
          'Applying industrial safety logic...',
          'Finalizing output schema...'
      ];
      stages.forEach((msg, idx) => {
          setTimeout(() => {
              setAgents(prev => prev.map(a => a.id === nextId ? { ...a, microStatus: msg } : a));
          }, (idx + 1) * 700);
      });

      setTimeout(() => {
        const d = new Date();
        setAgents(prev => {
          const a = prev.find(x => x.id === nextId);
          if (a?.status === 'running') {
            return prev.map(x => x.id === nextId ? { 
              ...x, 
              status: 'completed', 
              lastRunTimestamp: d.toLocaleTimeString(),
              lastUpdatedTimestamp: d.toLocaleTimeString(),
              confidence: (85 + Math.floor(Math.random() * 10)) + "%",
              dependencyState: 'Resolved',
              microStatus: 'Synthesis complete.'
            } : x);
          }
          return prev;
        });

        setChainQueue(q => q.slice(1));
        setActiveTask(null);
      }, 4000);
    } else if (globalStatus === 'running' && chainQueue.length === 0 && !activeTask) {
      setGlobalStatus('completed');
    }
  }, [globalStatus, chainQueue, activeTask, agents, execMode]);

  const runSingleAgent = (agentId: string, isRerun: boolean = false) => {
    setPreRunAgentId(null);
    setSelectedAgentId(agentId);
    setExecMode("manual");
    
    setAgents(prev => prev.map(a => a.id === agentId ? { 
      ...a, 
      status: 'running', 
      microStatus: isRerun ? `Reprocessing with ${a.knowledgeSelection?.length || 0} evidence assets...` : `Analyzing ${a.knowledgeSelection?.length || 0} evidence assets...`,
      triggeredBy: 'Current User'
    } : a));
    
    // Simulate backend execution
    setTimeout(() => {
      setAgents(prev => prev.map(a => {
        if (a.id === agentId) {
          const actualTokens = (a.tokenEstimate || 1000) * (0.8 + Math.random() * 0.4);
          const duration = 3000 + Math.random() * 2000;
          const newRun: AgentRunHistory = {
            run_id: `run-${Math.random().toString(36).substr(2, 9)}`,
            agent_id: agentId,
            started_at: new Date().toISOString(),
            ended_at: new Date().toISOString(),
            triggered_by: "Current User",
            status: "completed",
            token_usage: Math.floor(actualTokens),
            duration_ms: Math.floor(duration),
            summary: isRerun ? "Re-analysis triggered by user request." : "Initial analysis completed successfully."
          };

          return { 
            ...a, 
            status: 'completed', 
            runCount: a.runCount + 1,
            lastRunTimestamp: "Just now",
            actualTokenUsage: Math.floor(actualTokens),
            durationMs: Math.floor(duration),
            history: [newRun, ...a.history]
          };
        }
        return a;
      }));
      const agentName = agents.find(ag => ag.id === agentId)?.name;
      const knowledgeCount = agents.find(ag => ag.id === agentId)?.knowledgeSelection?.length;
      toast.success(`${agentName} finished using ${knowledgeCount} evidence assets.`);
    }, 4000);
  };

  const stopSingleAgent = (agentId: string) => {
    setAgents(prev => prev.map(a => a.id === agentId ? { ...a, status: 'stopped' } : a));
    toast.error("Agent execution terminated.");
  };

  const startFullChain = () => {
    setExecMode("full");
    setGlobalStatus("running");
    setAgents(prev => prev.map(a => ({ 
        ...a, 
        status: 'queued', 
        dependencyState: a.dependencies.length === 0 ? 'Ready' : `Wait: ${a.dependencies[0]}`
    })));
    setChainQueue(["fact", "peepo", "ipls", "prev"]);
  };

  const stopChain = () => {
    setGlobalStatus("stopped");
    setAgents(prev => prev.map(a => a.status === 'queued' || a.status === 'running' ? { ...a, status: 'cancelled' } : a));
    setChainQueue([]);
    setActiveTask(null);
  };

  return (
    <div className="flex h-full bg-[#f0f2f4] overflow-hidden animate-in fade-in duration-500">
         <div className="w-[320px] border-r border-slate-200 bg-slate-50 flex flex-col shrink-0 z-20 shadow-[1px_0_4px_rgba(0,0,0,0.02)]">
            <div className="h-12 border-b border-slate-200 flex items-center justify-between px-5 bg-white shrink-0">
               <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${globalStatus === 'running' ? 'bg-amber-500 animate-pulse' : 'bg-slate-300'}`} />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Orchestration</span>
               </div>
               {globalStatus === 'running' && (
                  <Button onClick={stopChain} variant="ghost" size="sm" className="h-7 px-2 text-[9px] font-bold text-rose-500 hover:bg-rose-50 border border-rose-100">
                     <XCircle className="h-3 w-3 mr-1" /> Stop
                  </Button>
               )}
            </div>

            <div className="p-4 bg-white border-b border-slate-100">
               <Button 
                  onClick={startFullChain}
                  disabled={globalStatus === 'running'}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] uppercase tracking-wider h-10  border-none group"
               >
                  <Play className="h-3 w-3 mr-2 group-hover:translate-x-0.5 transition-transform" /> Execute Full Chain
               </Button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar relative">
               <div className="absolute left-[39px] top-6 bottom-6 w-px bg-slate-200 z-0" />
               <div className="p-4 space-y-4 relative z-10">
                  {agents.map((agent) => (
                     <div 
                        key={agent.id}
                        onClick={() => setSelectedAgentId(agent.id)}
                        className={`
                           group relative flex flex-col p-5 rounded-sm border bg-white transition-all cursor-pointer overflow-hidden
                           ${selectedAgentId === agent.id ? "border-slate-900  ring-1 ring-slate-900/5 -translate-y-0.5" : "border-slate-200 hover:border-slate-300"}
                        `}
                     >
                        <div className="flex items-start justify-between mb-4">
                           <div className={`h-12 w-12 rounded-sm border flex items-center justify-center transition-all ${selectedAgentId === agent.id ? "bg-slate-900 text-white border-slate-900 shadow-slate-900/20" : "bg-white text-slate-400 border-slate-100"}`}>
                              <agent.icon className="h-5 w-5" />
                           </div>
                           <div className="flex flex-col items-end gap-2">
                              <div className={`
                                   px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border
                                   ${agent.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                                     agent.status === 'running' ? 'bg-blue-50 text-blue-700 border-blue-100 animate-pulse' : 
                                     agent.status === 'stopped' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                                     'bg-slate-50 text-slate-400 border-slate-100'}
                              `}>
                                   {agent.status}
                              </div>
                              {agent.lastRunTimestamp && (
                                 <span className="text-[8px] font-bold text-slate-300 uppercase tracking-tight">{agent.lastRunTimestamp}</span>
                              )}
                           </div>
                        </div>

                        <div className="space-y-1 mb-4">
                           <h4 className={`text-[11px] font-black uppercase tracking-[0.15em] ${selectedAgentId === agent.id ? "text-slate-900" : "text-slate-500"}`}>{agent.name}</h4>
                           <p className="text-[10px] font-medium text-slate-400 leading-snug line-clamp-2 opacity-80">{agent.purpose}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-50">
                           {agent.status === 'running' ? (
                              <Button 
                                 onClick={(e) => { e.stopPropagation(); stopSingleAgent(agent.id); }}
                                 variant="outline" 
                                 className="col-span-2 h-10 bg-rose-50 hover:bg-rose-100 border-rose-100 text-rose-600 text-[10px] font-black uppercase tracking-[0.1em] rounded-sm transition-all"
                              >
                                 <XCircle className="h-4 w-4 mr-2" /> Stop Node
                              </Button>
                           ) : (
                              <>
                                 <Button 
                                    onClick={(e) => { e.stopPropagation(); setPreRunAgentId(agent.id); }}
                                    className="h-10 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-black uppercase tracking-[0.1em] rounded-sm shadow-[0_4px_12px_rgba(0,0,0,0.15)] transition-all hover:-translate-y-0.5 active:translate-y-0"
                                 >
                                    <Play className="h-3.5 w-3.5 mr-2 fill-current" /> {agent.runCount > 0 ? "Rerun" : "Execute"}
                                 </Button>
                                 <div className="flex gap-1.5">
                                    <Button 
                                       variant="outline" 
                                       onClick={(e) => { e.stopPropagation(); setHistoryAgentId(agent.id); }}
                                       className="flex-1 h-10 bg-white border-slate-200 text-slate-500 text-[10px] font-black uppercase tracking-[0.1em] rounded-sm hover:bg-slate-50 transition-colors"
                                    >
                                       <History className="h-4 w-4" />
                                    </Button>
                                     <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                           <Button 
                                              variant="outline" 
                                              onClick={(e) => e.stopPropagation()}
                                              className={cn(
                                                 "flex-1 h-10 border-slate-200 text-[10px] font-black uppercase tracking-[0.1em] rounded-sm transition-all",
                                                 knowledgeAgentId === agent.id ? "bg-slate-900 text-emerald-400 border-slate-900 shadow-lg" : "bg-white text-slate-500 hover:bg-slate-50"
                                              )}
                                           >
                                              <BookText className="h-4 w-4" />
                                           </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent 
                                           side="right" 
                                           align="start" 
                                           sideOffset={12}
                                           className="w-[320px] p-0 border-slate-200 shadow-sm rounded-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200" 
                                           onClick={(e) => e.stopPropagation()}
                                        >
                                           <div className="bg-white">
                                              <div className="p-4 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
                                                 <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Knowledge Sources</h3>
                                                 <span className="text-[9px] font-bold text-slate-400 bg-white px-2 py-0.5 border rounded-full">{evidenceFiles.length} Assets</span>
                                              </div>
                                              
                                              <div className="max-h-[320px] overflow-y-auto p-2 custom-scrollbar">
                                                 {batches.map(b => ({ ...b, files: evidenceFiles.filter(f => f.batch_id === b.id) })).filter(b => b.files.length > 0).map((batch) => {
                                                    const filesInBatch = evidenceFiles.filter(f => f.batch_id === batch.id);
                                                    const isExpanded = expandedKnowledgeFolders.includes(batch.id);
                                                    const currentAgentSelection = localKnowledgeSelection[agent.id] || agent.knowledgeSelection || [];
                                                    const selectedInBatch = filesInBatch.filter(f => currentAgentSelection.includes(f.id));
                                                    const isBatchFullySelected = selectedInBatch.length === filesInBatch.length && filesInBatch.length > 0;
                                                    const isBatchPartiallySelected = selectedInBatch.length > 0 && selectedInBatch.length < filesInBatch.length;

                                                    return (
                                                       <div key={batch.id} className="mb-1">
                                                          <div 
                                                             className={cn(
                                                                "flex items-center gap-2 p-2 rounded-sm hover:bg-slate-50 cursor-pointer transition-colors group",
                                                                isExpanded ? "bg-slate-50/50" : ""
                                                             )}
                                                             onClick={(e) => {
                                                                e.stopPropagation();
                                                                setExpandedKnowledgeFolders(prev => 
                                                                   prev.includes(batch.id) ? prev.filter(id => id !== batch.id) : [...prev, batch.id]
                                                                );
                                                             }}
                                                          >
                                                              <div 
                                                                 className={cn(
                                                                    "h-4 w-4 rounded border flex items-center justify-center transition-all",
                                                                    isBatchFullySelected ? "bg-slate-900 border-slate-900" : 
                                                                    isBatchPartiallySelected ? "bg-slate-400 border-slate-400" : "bg-white border-slate-200"
                                                                 )}
                                                                 onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    const fileIds = filesInBatch.map(f => f.id);
                                                                    setAgents(prev => prev.map(a => a.id === agent.id ? {
                                                                       ...a,
                                                                       knowledgeSelection: isBatchFullySelected 
                                                                          ? a.knowledgeSelection?.filter(id => !fileIds.includes(id))
                                                                          : [...new Set([...(a.knowledgeSelection || []), ...fileIds])]
                                                                    } : a));
                                                                 }}
                                                              >
                                                                 {isBatchFullySelected && <Check className="h-2.5 w-2.5 text-white stroke-[4]" />}
                                                                 {isBatchPartiallySelected && <div className="h-0.5 w-2 bg-white" />}
                                                              </div>
                                                              <div className="flex items-center gap-2 flex-1 overflow-hidden">
                                                                 <Folder className={cn("h-3.5 w-3.5", isExpanded ? "text-primary" : "text-slate-400")} />
                                                                 <span className="text-[11px] font-bold text-slate-700 uppercase tracking-tight truncate">{batch.name}</span>
                                                              </div>
                                                              <ChevronRight className={cn("h-3 w-3 text-slate-300 transition-transform", isExpanded ? "rotate-90" : "")} />
                                                          </div>

                                                          {isExpanded && (
                                                              <div className="ml-6 mt-1 border-l border-slate-100 pl-1 space-y-0.5">
                                                                 {filesInBatch.map((file) => {
                                                                    const isFileSelected = currentAgentSelection.includes(file.id);
                                                                    return (
                                                                       <div 
                                                                          key={file.id}
                                                                          onClick={(e) => {
                                                                             e.stopPropagation();
                                                                             setAgents(prev => prev.map(a => a.id === agent.id ? {
                                                                                ...a,
                                                                                knowledgeSelection: isFileSelected 
                                                                                   ? a.knowledgeSelection?.filter(id => id !== file.id)
                                                                                   : [...(a.knowledgeSelection || []), file.id]
                                                                             } : a));
                                                                          }}
                                                                          className="flex items-center gap-2.5 p-1.5 hover:bg-slate-50 rounded-sm cursor-pointer transition-colors"
                                                                       >
                                                                          <div className={cn(
                                                                             "h-3.5 w-3.5 rounded border flex items-center justify-center transition-all",
                                                                             isFileSelected ? "bg-emerald-500 border-emerald-500" : "bg-white border-slate-200"
                                                                          )}>
                                                                             {isFileSelected && <Check className="h-2 w-2 text-white stroke-[4]" />}
                                                                          </div>
                                                                          <span className={cn("text-[10px] font-semibold truncate flex-1", isFileSelected ? "text-slate-900" : "text-slate-400")}>
                                                                             {file.name}
                                                                          </span>
                                                                       </div>
                                                                    );
                                                                 })}
                                                              </div>
                                                          )}
                                                       </div>
                                                    );
                                                 })}
                                              </div>
                                              
                                              <div className="p-4 border-t border-slate-50 bg-slate-50/10">
                                                 <div className="flex items-center justify-between mb-2">
                                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Active Payload</span>
                                                    <span className="text-[10px] font-black text-slate-900 tabular-nums">
                                                       {(localKnowledgeSelection[agent.id] || []).filter(id => evidenceFiles.some(f => f.id === id)).length} / {evidenceFiles.length}
                                                    </span>
                                                 </div>
                                                 <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner mb-4">
                                                    <div 
                                                       className="h-full bg-slate-900 transition-all duration-700 ease-out" 
                                                       style={{ width: `${(((localKnowledgeSelection[agent.id] || []).filter(id => evidenceFiles.some(f => f.id === id)).length) / (evidenceFiles.length || 1)) * 100}%` }} 
                                                    />
                                                 </div>
                                                 <Button
                                                    onClick={(e) => {
                                                       e.stopPropagation();
                                                       handleSaveKnowledge(agent.id);
                                                    }}
                                                    disabled={JSON.stringify(localKnowledgeSelection[agent.id]) === JSON.stringify(agent.knowledgeSelection)}
                                                    className="w-full h-9 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest rounded-sm disabled:opacity-30 transition-all"
                                                 >
                                                    Save Changes
                                                 </Button>
                                              </div>
                                           </div>
                                        </DropdownMenuContent>
                                     </DropdownMenu>
                                  </div>
                              </>
                           )}
                        </div>

                        {agent.status === 'running' && (
                           <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100 overflow-hidden">
                              <div className="h-full bg-blue-500 animate-pulse w-full origin-left" />
                           </div>
                        )}
                     </div>
                  ))}
               </div>
            </div>
         </div>

         <div className="flex-1 flex flex-col min-w-0 bg-white">
            <div className="flex-1 flex overflow-hidden">
               <div ref={containerRef} className="flex-1 relative overflow-auto custom-scrollbar flex items-start justify-center">
                  {selectedAgentId ? (
                     <div className="bg-white flex-1 flex flex-col relative transition-all duration-300 origin-center overflow-hidden w-full h-full">
                        <div className="flex-1 flex flex-col relative overflow-hidden h-full">
                           {selectedAgent?.status === 'running' ? (
                              <div className="flex flex-col items-center justify-center h-full text-center space-y-8 animate-pulse text-slate-300">
                                 <Loader2 className="h-12 w-12 animate-spin" />
                                 <span className="text-[20px] font-black uppercase tracking-[0.2em]">{selectedAgent.microStatus || "Processing Matrix..."}</span>
                              </div>
                           ) : !selectedAgent?.results ? (
                              <div className="flex flex-col h-full items-center justify-center text-center opacity-30 grayscale pointer-events-none space-y-6">
                                 <Cpu className="h-12 w-12 text-slate-300" />
                                 <h2 className="text-3xl font-black uppercase tracking-[0.2em] text-slate-400">Node Standby</h2>
                              </div>
                           ) : (
                              <div className="flex-1 animate-in fade-in duration-500 overflow-hidden">
                                 {slides[activeSlide]?.type === 'chronology_module' ? (
                                    <FactChronologyModule 
                                       initialItems={slides[activeSlide]?.content?.items || []}
                                       metadata={slides[activeSlide]?.content?.metadata}
                                       viewMode={factViewMode}
                                       onViewModeChange={setFactViewMode}
                                       selectedItemId={selectedRowId || undefined}
                                       onSelectItem={handleSelectRow}
                                       onSync={(newItems) => {
                                          setAgents(prev => prev.map(a => a.id === 'fact' ? {
                                             ...a,
                                             results: {
                                                ...a.results,
                                                chronology_items: newItems
                                             }
                                          } : a));
                                          toast.success("Chronology successfully synced to case intelligence.");
                                       }}
                                    />
                                 ) : (
                                     <div className="flex flex-col h-full">
                                        {selectedAgentId === 'peepo' ? (
                                            <div className="flex flex-col h-full bg-slate-50/10 animate-in fade-in duration-500 overflow-hidden">
                                               <div className="h-12 flex items-center justify-between px-5 border-b border-slate-200 bg-white shrink-0">
                                                  <div className="flex items-center gap-2">
                                                     <div className="h-2 w-2 rounded-full bg-[#8ba861]" />
                                                     <h2 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">PEEPO Factor Analysis Sheet</h2>
                                                  </div>
                                                  <div className="flex items-center gap-2">
                                                     <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
                                                     <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Synthesis Complete</span>
                                                  </div>
                                               </div>
                                               
                                               <div className="flex-1 overflow-auto p-6 scrollbar-thin">
                                                  <div className="max-w-5xl mx-auto space-y-8 pb-12">
                                                     {[
                                                        { id: 'people', label: 'People (Individu)' },
                                                        { id: 'environment', label: 'Environment (Lingkungan)' },
                                                        { id: 'equipment', label: 'Equipment (Peralatan)' },
                                                        { id: 'procedures', label: 'Procedures (Prosedur)' },
                                                        { id: 'organisation', label: 'Organisation (Organisasi)' },
                                                     ].map((section) => (
                                                        <div key={section.id} className="space-y-3">
                                                           <div className="flex items-center gap-3">
                                                              <span className="px-2.5 py-1 rounded text-[9px] font-black text-white uppercase tracking-widest bg-slate-900">
                                                                 {section.label}
                                                              </span>
                                                              <div className="h-px flex-1 bg-slate-200" />
                                                           </div>
                                                           <div className="bg-white border-l border-t border-slate-200 overflow-hidden shadow-sm">
                                                              <table className="w-full text-left border-collapse">
                                                                 <thead>
                                                                    <tr className="bg-slate-50/80">
                                                                       <th className="px-5 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest w-24 border-r border-b border-slate-200 bg-slate-50/30">ID</th>
                                                                       <th className="px-5 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest border-r border-b border-slate-200 bg-slate-50/30">Forensic Finding</th>
                                                                       <th className="px-5 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest w-32 border-r border-b border-slate-200 bg-slate-50/30">Traceability</th>
                                                                    </tr>
                                                                 </thead>
                                                                 <tbody>
                                                                    {(selectedAgent?.results?.[section.id] || []).map((item: any, idx: number) => {
                                                                       const isSelected = selectedRowId === (item.id || item);
                                                                       return (
                                                                          <tr 
                                                                             key={item.id || idx} 
                                                                             onClick={() => handleSelectRow(item.id || item)}
                                                                             className={cn(
                                                                                "group transition-all cursor-pointer",
                                                                                isSelected ? "bg-slate-100/80" : "hover:bg-slate-50/50"
                                                                             )}
                                                                          >
                                                                             <td className="px-5 py-4 align-top border-r border-b border-slate-200">
                                                                                <span className="text-[11px] font-mono font-black text-slate-400">#{section.id.slice(0, 1).toUpperCase()}{idx + 1}</span>
                                                                             </td>
                                                                             <td className="px-5 py-4 align-top border-r border-b border-slate-200">
                                                                                <p className={cn(
                                                                                   "text-[11px] font-bold leading-relaxed pr-8",
                                                                                   isSelected ? "text-slate-900" : "text-slate-700"
                                                                                )}>
                                                                                   {item.label || item}
                                                                                </p>
                                                                             </td>
                                                                             <td className="px-5 py-4 align-top border-r border-b border-slate-200 text-center">
                                                                                <Search className={cn("h-3.5 w-3.5 mx-auto", isSelected ? "text-slate-900" : "text-slate-300")} />
                                                                             </td>
                                                                          </tr>
                                                                       );
                                                                    })}
                                                                 </tbody>
                                                              </table>
                                                           </div>
                                                        </div>
                                                     ))}

                                                     {/* Summary & Synthesis Indicator */}
                                                     <div className="grid grid-cols-2 gap-6 pt-4">
                                                        <div className="bg-white border-l border-t border-slate-200 p-6 shadow-sm rounded-sm">
                                                           <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Analysis Summary</span>
                                                           <p className="text-[11px] font-bold text-slate-600 leading-relaxed italic">"{selectedAgent?.results?.ringkasan}"</p>
                                                        </div>
                                                        <div className="bg-slate-900 p-6 shadow-sm border border-slate-800 rounded-sm">
                                                           <span className="text-[9px] font-black text-emerald-400/50 uppercase tracking-widest block mb-2">Synthesis Intelligence</span>
                                                           <p className="text-[11px] font-black text-white uppercase tracking-tight leading-relaxed">{selectedAgent?.results?.synthesis}</p>
                                                        </div>
                                                     </div>
                                                  </div>
                                               </div>
                                            </div>
                                         ) : selectedAgentId === 'ipls' ? (
                                            <div className="flex flex-col h-full bg-slate-50/10 animate-in fade-in duration-500 overflow-hidden">
                                               <div className="h-12 flex items-center justify-between px-5 border-b border-slate-200 bg-white shrink-0">
                                                  <div className="flex items-center gap-2">
                                                     <div className="h-2 w-2 rounded-full bg-[#8ba861]" />
                                                     <h2 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Integrated Profile Layer (IPLS) Sheet</h2>
                                                  </div>
                                                  <div className="flex items-center gap-2">
                                                     <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
                                                     <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Defensive Audit Complete</span>
                                                  </div>
                                               </div>
                                               
                                               <div className="flex-1 overflow-auto p-6 scrollbar-thin">
                                                  <div className="max-w-[1400px] mx-auto space-y-8 pb-12">
                                                     {(selectedAgent?.results?.layers || []).map((layer: any) => (
                                                        <div key={layer.id} className="space-y-3">
                                                           <div className="flex items-center gap-3">
                                                              <span className="px-2.5 py-1 rounded text-[9px] font-black text-white uppercase tracking-widest bg-slate-900">
                                                                 Layer {["I", "II", "III", "IV", "V"][layer.id - 1]}: {layer.title}
                                                              </span>
                                                              <div className="h-px flex-1 bg-slate-200" />
                                                           </div>
                                                           <div className="bg-white border-l border-t border-slate-200 overflow-hidden shadow-sm">
                                                              <table className="w-full text-left border-collapse">
                                                                 <thead>
                                                                    <tr className="bg-slate-50/80">
                                                                       <th className="px-5 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest w-24 border-r border-b border-slate-200 bg-slate-50/30">STATUS</th>
                                                                       <th className="px-5 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest border-r border-b border-slate-200 bg-slate-50/30">Defensive Audit Point</th>
                                                                       <th className="px-5 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest w-32 border-r border-b border-slate-200 bg-slate-50/30">Traceability</th>
                                                                    </tr>
                                                                 </thead>
                                                                 <tbody>
                                                                    {layer.items.map((item: any, idx: number) => {
                                                                       const isSelected = selectedRowId === item.id;
                                                                       return (
                                                                          <tr 
                                                                             key={item.id || idx} 
                                                                             onClick={() => handleSelectRow(item.id)}
                                                                             className={cn(
                                                                                "group transition-all cursor-pointer",
                                                                                isSelected ? "bg-slate-100/80" : "hover:bg-slate-50/50"
                                                                             )}
                                                                          >
                                                                             <td className="px-5 py-4 align-top border-r border-b border-slate-200">
                                                                                <div className="flex justify-center">
                                                                                   {item.status === 'rootcause' ? (
                                                                                      <div className="h-4 w-4 rounded-full border-2 border-red-500 flex items-center justify-center">
                                                                                         <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                                                                                      </div>
                                                                                   ) : item.status === 'non-conformity' ? (
                                                                                      <div className="h-4 w-4 rounded-full border-2 border-amber-500 flex items-center justify-center">
                                                                                         <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                                                                      </div>
                                                                                   ) : (
                                                                                      <div className="h-4 w-4 rounded-full border-2 border-emerald-500 flex items-center justify-center">
                                                                                         <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                                                      </div>
                                                                                   )}
                                                                                </div>
                                                                             </td>
                                                                             <td className="px-5 py-4 align-top border-r border-b border-slate-200">
                                                                                <p className={cn(
                                                                                   "text-[11px] font-bold leading-relaxed pr-8",
                                                                                   isSelected ? "text-slate-900" : "text-slate-700"
                                                                                )}>
                                                                                   {item.label}
                                                                                </p>
                                                                             </td>
                                                                             <td className="px-5 py-4 align-top border-r border-b border-slate-200 text-center">
                                                                                <Search className={cn("h-3.5 w-3.5 mx-auto", isSelected ? "text-slate-900" : "text-slate-300")} />
                                                                             </td>
                                                                          </tr>
                                                                       );
                                                                    })}
                                                                 </tbody>
                                                              </table>
                                                           </div>
                                                        </div>
                                                     ))}
                                                  </div>
                                               </div>
                                            </div>
                                         ) : selectedAgentId === 'prev' ? (
                                            <div className="flex flex-col h-full bg-slate-50/10 animate-in fade-in duration-500 overflow-hidden">
                                               <div className="h-12 flex items-center justify-between px-5 border-b border-slate-200 bg-white shrink-0">
                                                  <div className="flex items-center gap-2">
                                                     <div className="h-2 w-2 rounded-full bg-[#8ba861]" />
                                                     <h2 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Prevention Action Plan Sheet</h2>
                                                  </div>
                                                  <div className="flex items-center gap-2">
                                                     <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
                                                     <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Plan Finalized</span>
                                                  </div>
                                               </div>
                                               
                                               <div className="flex-1 overflow-auto p-6 scrollbar-thin">
                                                  <div className="max-w-[1600px] mx-auto space-y-10 pb-12">
                                                     {[
                                                        { id: 'root', title: 'Root Cause Actions', color: 'bg-red-500', data: selectedAgent?.results?.root_cause_actions },
                                                        { id: 'nc', title: 'Non Conformity Actions', color: 'bg-amber-500', data: selectedAgent?.results?.non_conformity_actions },
                                                        { id: 'imp', title: 'Improvement Actions', color: 'bg-emerald-500', data: selectedAgent?.results?.improvement_actions },
                                                     ].map((section) => (
                                                        <div key={section.id} className="space-y-3">
                                                           <div className="flex items-center gap-3">
                                                              <span className={cn("px-2.5 py-1 rounded text-[9px] font-black text-white uppercase tracking-widest", section.color)}>
                                                                 {section.title}
                                                              </span>
                                                              <div className="h-px flex-1 bg-slate-200" />
                                                           </div>
                                                           <div className="bg-white border-l border-t border-slate-200 overflow-hidden shadow-sm">
                                                              <table className="w-full text-left border-collapse">
                                                                 <thead>
                                                                    <tr className="bg-slate-50/80">
                                                                       <th className="px-5 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest w-12 border-r border-b border-slate-200 bg-slate-50/30">NO</th>
                                                                       <th className="px-5 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest w-24 border-r border-b border-slate-200 bg-slate-50/30">LAYER</th>
                                                                       <th className="px-5 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest w-32 border-r border-b border-slate-200 bg-slate-50/30">CONTROL</th>
                                                                       <th className="px-5 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest border-r border-b border-slate-200 bg-slate-50/30">Prevention Action</th>
                                                                       <th className="px-5 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest w-32 border-r border-b border-slate-200 bg-slate-50/30">PIC</th>
                                                                       <th className="px-5 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest w-24 border-r border-b border-slate-200 bg-slate-50/30">DUE DATE</th>
                                                                       <th className="px-5 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest w-24 border-b border-slate-200 bg-slate-50/30 text-center">STATUS</th>
                                                                    </tr>
                                                                 </thead>
                                                                 <tbody>
                                                                    {(section.data || []).map((item: any, idx: number) => {
                                                                       const isSelected = selectedRowId === item.id;
                                                                       return (
                                                                          <tr 
                                                                             key={item.id || idx} 
                                                                             onClick={() => handleSelectRow(item.id)}
                                                                             className={cn(
                                                                                "group transition-all cursor-pointer",
                                                                                isSelected ? "bg-slate-100/80" : "hover:bg-slate-50/50"
                                                                             )}
                                                                          >
                                                                             <td className="px-5 py-4 align-top border-r border-b border-slate-200 text-center text-[11px] font-mono font-black text-slate-400">
                                                                                {item.no}
                                                                             </td>
                                                                             <td className="px-5 py-4 align-top border-r border-b border-slate-200 text-center text-[10px] font-black text-slate-500 uppercase">
                                                                                {item.layer}
                                                                             </td>
                                                                             <td className="px-5 py-4 align-top border-r border-b border-slate-200 text-center text-[10px] font-black text-slate-900 uppercase tracking-tighter">
                                                                                {item.hierarchy}
                                                                             </td>
                                                                             <td className="px-5 py-4 align-top border-r border-b border-slate-200">
                                                                                <p className={cn(
                                                                                   "text-[11px] font-bold leading-relaxed pr-8 uppercase tracking-tight",
                                                                                   isSelected ? "text-slate-900" : "text-slate-700"
                                                                                )}>
                                                                                   {item.action}
                                                                                </p>
                                                                             </td>
                                                                             <td className="px-5 py-4 align-top border-r border-b border-slate-200 text-center text-[10px] font-bold text-slate-600">
                                                                                {item.pic}
                                                                             </td>
                                                                             <td className="px-5 py-4 align-top border-r border-b border-slate-200 text-center text-[10px] font-mono text-slate-500">
                                                                                {item.due_date}
                                                                             </td>
                                                                             <td className="p-0 border-b border-slate-200">
                                                                                <div className={cn(
                                                                                   "h-12 flex items-center justify-center text-[9px] font-black tracking-widest uppercase",
                                                                                   item.status === 'OPEN' ? "bg-red-50 text-red-600" :
                                                                                   item.status === 'PROGRESS' ? "bg-amber-50 text-amber-600" :
                                                                                   "bg-emerald-50 text-emerald-600"
                                                                                )}>
                                                                                   {item.status}
                                                                                </div>
                                                                             </td>
                                                                          </tr>
                                                                       );
                                                                    })}
                                                                 </tbody>
                                                              </table>
                                                           </div>
                                                        </div>
                                                     ))}
                                                  </div>
                                               </div>
                                            </div>
                                        ) : (
                                           <div className="flex-1 bg-[#1a1c23] rounded-sm p-6 overflow-hidden border border-slate-700 relative">
                                              <pre className="text-[12px] font-mono text-emerald-400/90 leading-tight h-full overflow-auto custom-scrollbar">
                                                 {JSON.stringify(slides[activeSlide]?.content, null, 2)}
                                              </pre>
                                           </div>
                                        )}
                                     </div>
                                  )}
                               </div>
                            )}
                         </div>
                      </div>
                   ) : (
                      <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-300">
                         <Brain className="h-12 w-12 mb-4 opacity-20" />
                         <h2 className="text-3xl font-black uppercase tracking-[0.2em] text-slate-400">Orchestration Idle</h2>
                         <p className="text-[10px] mt-2 opacity-50 font-bold uppercase">Select a node to view intelligence results</p>
                      </div>
                   )}
               </div>

               {/* Right Sidebar: Fact Trace Panel */}
               <div className="w-[460px] border-l border-slate-200 bg-white flex flex-col shrink-0">
                  {selectedRowId ? (
                     (() => {
                        const agent = agents.find(a => a.id === selectedAgentId);
                        let item = agent?.results?.chronology_items?.find((i: any) => i.id === selectedRowId) || 
                                     agent?.results?.layers?.flatMap((l: any) => l.items).find((i: any) => i.id === selectedRowId) ||
                                     agent?.results?.root_cause_actions?.find((i: any) => i.id === selectedRowId) ||
                                     agent?.results?.non_conformity_actions?.find((i: any) => i.id === selectedRowId) ||
                                     agent?.results?.improvement_actions?.find((i: any) => i.id === selectedRowId);
                        
                        if (!item) return (
                           <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-300">
                              <Search className="h-12 w-12 mb-4 opacity-20" />
                              <h4 className="text-[10px] font-black uppercase tracking-[0.2em]">Finding Not Resolved</h4>
                              <p className="text-[8px] font-bold text-slate-400 uppercase mt-2">Select a row to view forensic evidence</p>
                           </div>
                        );

                        const audioEvidence = {
                           diarization: [
                               { 
                                 start_dialog: '00:00:00', 
                                 end_dialog: '00:00:18', 
                                 speaker_label: 'Investigator', 
                                 verbatim_text: 'Suaranya agak... bisa dijelaskan aktivitas sehari-hari saja di control room, soal tanggung jawab Pak Aris sebagai DMS control room.', 
                                 theme_tag: 'Reporting',
                                 interaction_type: 'Question',
                                 paralinguistics: ['neutral tone'],
                                 extracted_action_or_fact: 'Investigator requests a description of the operator\'s daily responsibilities.',
                                 confidence: 'High' 
                               },
                               { 
                                 start_dialog: '00:00:20', 
                                 end_dialog: '00:00:45', 
                                 speaker_label: 'Operator A', 
                                 verbatim_text: 'Tanggung jawab utama saya di control room adalah memantau seluruh sistem distribusi material secara real-time. Kami memastikan aliran material lancar dan menanggapi setiap anomali sensor dengan cepat.', 
                                 theme_tag: 'Operations',
                                 interaction_type: 'Statement',
                                 paralinguistics: ['informative tone', 'clear voice'],
                                 extracted_action_or_fact: 'Operator A explains his role in monitoring distribution systems.',
                                 confidence: 'High' 
                               },
                               { 
                                 start_dialog: '00:00:50', 
                                 end_dialog: '00:01:05', 
                                 speaker_label: 'Investigator', 
                                 verbatim_text: 'Bagaimana dengan prosedur jika terjadi anomali? Apakah ada protokol khusus?', 
                                 theme_tag: 'Protocol',
                                 interaction_type: 'Question',
                                 paralinguistics: ['analytical tone'],
                                 extracted_action_or_fact: 'Investigator inquires about anomaly response protocols.',
                                 confidence: 'High' 
                               }
                            ],
                           analysis: {
                               speakers: [
                                  { name: 'OPERATOR A', role: 'FIELD SUPERVISOR', talkTime: '02:15', style: 'Urgent, Command style', assertiveness: 'High', stressLevel: 'Elevated', confidence: 'High' },
                                  { name: 'CONTROL ROOM', role: 'SAFETY DISPATCHER', talkTime: '01:45', style: 'Analytical, Following protocol', assertiveness: 'Medium', stressLevel: 'Normal', confidence: 'High' }
                               ]
                           }
                        };

                        if (activeEvidenceConsoleMode === "trace") {
                           return (
                              <div className="flex flex-col h-full bg-white overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
                                 {/* A. Selected Fact Header */}
                                 <div className="h-12 border-b border-slate-200 flex items-center justify-between px-5 bg-white shrink-0">
                                    <div className="flex items-center gap-2">
                                       <div className="h-2 w-2 rounded-none bg-slate-400" />
                                       <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Evidence Console</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                       <div className="flex bg-slate-100 p-0.5 rounded-none border border-slate-200">
                                          <button onClick={() => setActiveEvidenceConsoleMode('trace')} className={cn("px-2 py-1 text-[8px] font-black uppercase rounded-none transition-all", activeEvidenceConsoleMode === 'trace' ? "bg-white shadow-sm text-slate-900" : "text-slate-400")}>Trace</button>
                                          <button onClick={() => setActiveEvidenceConsoleMode('diarization')} className={cn("px-2 py-1 text-[8px] font-black uppercase rounded-none transition-all", activeEvidenceConsoleMode === 'diarization' ? "bg-white shadow-sm text-slate-900" : "text-slate-400")}>Diar</button>
                                       </div>
                                       <Button variant="ghost" size="sm" onClick={() => setSelectedRowId(null)} className="h-8 w-8 p-0 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-none">
                                          <X className="h-4 w-4" />
                                       </Button>
                                    </div>
                                 </div>

                                 <div className="flex-1 overflow-y-auto custom-scrollbar">
                                    <div className="p-5 space-y-8">
                                       {/* Fact Context - Interactive Decomposition */}
                                       <div className="space-y-3">
                                          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                             <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Fact Decomposition</span>
                                             <div className="flex items-center gap-3">
                                                 <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 p-0.5 rounded-sm">
                                                    <button 
                                                       onClick={() => {
                                                          setAllEvidenceExpanded(true);
                                                          setExpandedEntityRows(['time', 'timezone', 'actor', 'action', 'object', 'location', 'condition']);
                                                       }}
                                                       className={cn("px-1.5 py-0.5 text-[8px] font-black uppercase transition-all", allEvidenceExpanded ? "bg-white shadow-sm text-slate-900" : "text-slate-400 hover:text-slate-600")}
                                                    >
                                                       Expand All
                                                    </button>
                                                    <button 
                                                       onClick={() => {
                                                          setAllEvidenceExpanded(false);
                                                          setExpandedEntityRows([]);
                                                       }}
                                                       className={cn("px-1.5 py-0.5 text-[8px] font-black uppercase transition-all", !allEvidenceExpanded ? "bg-white shadow-sm text-slate-900" : "text-slate-400 hover:text-slate-600")}
                                                    >
                                                       Collapse
                                                    </button>
                                                 </div>
                                                <div className="flex items-center gap-1.5">
                                                   <div className="h-1.5 w-1.5 bg-blue-600" />
                                                   <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">AI Entity Extraction</span>
                                                </div>
                                             </div>
                                          </div>
                                            <div className="space-y-4 pt-2">
                                               {[
                                                  { label: "Subject / Pelaku", key: "subject", icon: Users },
                                                  { label: "Action / Predikat", key: "action", icon: Activity },
                                                  { label: "Object / Korban-Alat", key: "object", icon: Crosshair },
                                                  { label: "Source System", key: "source_system", icon: Database },
                                                  { label: "Condition / Keterangan", key: "condition", icon: Shield }
                                               ].map((part) => (
                                                  <div key={part.key} className="group/item flex flex-col border-b border-slate-100 pb-8 last:border-0">
                                                     {/* Header */}
                                                     <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center gap-2">
                                                           <span className="px-1.5 py-0.5 bg-slate-900 text-white rounded-sm text-[8px] font-black uppercase tracking-widest">
                                                              {part.label}
                                                           </span>
                                                        </div>
                                                        <part.icon className="h-3 w-3 text-slate-300" />
                                                     </div>
                                                     
                                                     {/* Body */}
                                                     <div className="p-4">
                                                        <div className="text-[12px] font-black text-slate-900 leading-tight mb-3">
                                                           {(item.breakdown?.[part.key] as any)?.value || "---"}
                                                        </div>
                                                        
                                                        {((item.breakdown?.[part.key] as any)?.citations || (item.breakdown?.[part.key] as any)?.evidence) && (
                                                            <div className="mt-4">
                                                               <EvidenceCitationPanel 
                                                                  citations={(item.breakdown[part.key] as any).citations || [{ 
                                                                     type: 'audio', 
                                                                     content: (item.breakdown[part.key] as any).evidence,
                                                                     speaker: (item.breakdown[part.key] as any).speaker || "Operator Saiful",
                                                                     source: (item.breakdown[part.key] as any).source || "Audio_Rec_2024.mp3",
                                                                     time: (item.breakdown[part.key] as any).time || "00:42"
                                                                  }]} 
                                                                  forceExpand={allEvidenceExpanded}
                                                               />
                                                            </div>
                                                         )}
                                                     </div>
                                                  </div>
                                               ))}
                                            </div>
                                       </div>

                                       {/* B. Event Breakdown */}
                                       <div className="space-y-4">
                                          <div className="flex items-center gap-2">
                                             <LayoutGrid className="h-3 w-3 text-slate-400" />
                                             <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Event Breakdown</span>
                                          </div>
                                          <div className="border border-slate-200 rounded-none overflow-hidden bg-slate-200 flex flex-col gap-px">
                                             {[
                                                { id: 'time', label: 'Time', value: item.breakdown?.time || item.time || item.time_label, 
                                                   evidence: [
                                                      { type: 'audio', speaker: 'OPERATOR A', timeframe: '02:14 --- 02:22', context: 'Control, ini Operator A. Getaran di Section 14 melebihi batas aman.', source: 'VOIP_REC_14.WAV' }
                                                   ]
                                                },
                                                { id: 'timezone', label: 'Timezone', value: item.breakdown?.timezone || item.timezone || 'WITA', 
                                                   evidence: [
                                                      { type: 'doc', page: '01', context: 'Site local timezone configuration for Berau Coal operations.', source: 'SITE_HANDBOOK_2026.PDF' }
                                                   ]
                                                },
                                                { id: 'actor', label: 'Actor', value: (item.breakdown?.subject as any)?.value || item.breakdown?.actor || 'SENSOR SYSTEM', 
                                                   evidence: [
                                                      { type: 'doc', page: '142', context: 'Automated vibration monitoring protocol for Titan-X series drive motors.', source: 'MAINTENANCE_LOG_APR.PDF' },
                                                      { type: 'audio', speaker: 'CONTROL ROOM', timeframe: '02:15 --- 02:20', context: 'Diterima Operator A. Sensor kami juga menunjukkan anomali.', source: 'VOIP_REC_14.WAV' }
                                                   ]
                                                },
                                                { id: 'action', label: 'Action', value: (item.breakdown?.action as any)?.value || item.breakdown?.action || 'VIBRATION ALARM', 
                                                   evidence: [
                                                      { type: 'audio', speaker: 'OPERATOR A', timeframe: '02:14 --- 02:18', context: 'Mohon dicek segera, alarm vibrasi berbunyi.', source: 'VOIP_REC_14.WAV' },
                                                      { type: 'doc', page: '04', context: 'System Status: ALARM_VIB_HIGH triggered at 14:10:22', source: 'SCADA_EVENT_EXPORT.CSV' }
                                                   ]
                                                },
                                                { id: 'object', label: 'Object / Unit', value: (item.breakdown?.object as any)?.value || item.breakdown?.objectOrUnit || 'SECTION 14 MOTOR', 
                                                   evidence: [
                                                      { type: 'doc', page: '12', context: 'Drive Motor Unit ID: UNIT_S14_M01', source: 'ASSET_REGISTRY.XLSX' }
                                                   ]
                                                },
                                                { id: 'location', label: 'Location', value: item.breakdown?.location || 'SECTION 14', 
                                                   evidence: [
                                                      { type: 'audio', speaker: 'OPERATOR A', timeframe: '02:14 --- 02:16', context: 'Saya di lokasi Section 14.', source: 'VOIP_REC_14.WAV' }
                                                   ]
                                                },
                                                { id: 'condition', label: 'Condition', value: (item.breakdown?.condition as any)?.value || item.breakdown?.condition || 'EXCEEDED THRESHOLD', 
                                                   evidence: [
                                                      { type: 'doc', page: '08', context: 'Vibration Level: 4.8mm/s (Limit: 2.5mm/s)', source: 'SCADA_EVENT_EXPORT.CSV' }
                                                   ]
                                                },
                                             ].map((row) => (
                                                <div key={row.id} className="group bg-slate-200">
                                                   <button 
                                                      onClick={() => {
                                                         setExpandedEntityRows(prev => 
                                                            prev.includes(row.id) ? prev.filter(id => id !== row.id) : [...prev, row.id]
                                                         );
                                                      }}
                                                      className="w-full grid grid-cols-[120px_1fr] gap-px bg-slate-200 hover:bg-slate-300 transition-colors"
                                                   >
                                                      <div className="bg-slate-50 p-3 flex items-center justify-between group-hover:bg-slate-100 transition-colors border-r border-slate-200">
                                                         <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{row.label}</span>
                                                      </div>
                                                      <div className="bg-white p-3 flex items-center justify-between">
                                                         <p className="text-[10px] font-bold text-slate-900 uppercase truncate">{row.value}</p>
                                                         <div className="flex items-center gap-4">
                                                            <div className="flex items-center gap-1.5 px-1.5 py-0.5 bg-slate-50 border border-slate-100 rounded-none">
                                                               <FileText className="h-2.5 w-2.5 text-slate-400" />
                                                               <span className="text-[7px] font-black text-slate-400 uppercase tracking-tighter">{row.evidence.length} {row.evidence.length > 1 ? 'TRACES' : 'TRACE'}</span>
                                                            </div>
                                                            <ChevronDown className={cn("h-3 w-3 text-slate-300 transition-transform duration-200", !expandedEntityRows.includes(row.id) && "-rotate-90")} />
                                                         </div>
                                                      </div>
                                                   </button>
                                                   
                                                   {expandedEntityRows.includes(row.id) && (
                                                      <div className="bg-slate-50/50 border-t border-slate-200 p-6 space-y-6 animate-in slide-in-from-top-1 duration-300">
                                                         <div className="flex items-center gap-2">
                                                            <div className="h-px w-8 bg-slate-900" />
                                                            <span className="text-[8px] font-black text-slate-900 uppercase tracking-[0.2em] leading-none">Evidence Citations</span>
                                                         </div>

                                                         <div className="space-y-4">
                                                            {row.evidence.map((ev, evIdx) => (
                                                               <div key={evIdx} className="bg-white border-2 border-slate-900 p-5 rounded-none shadow-[4px_4px_0px_rgba(0,0,0,0.1)] space-y-4">
                                                                  <div className="flex items-center justify-between">
                                                                     <div className="flex items-center gap-3">
                                                                        {ev.type === 'audio' ? (
                                                                           <>
                                                                              <span className="text-[10px] font-mono text-slate-400 tracking-tight">{ev.timeframe}</span>
                                                                              <span className="px-2 py-0.5 bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest rounded-none">{ev.speaker}</span>
                                                                           </>
                                                                        ) : (
                                                                           <div className="flex items-center gap-2">
                                                                              <div className="h-1.5 w-1.5 bg-slate-900" />
                                                                              <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest">PAGE {ev.page}</span>
                                                                           </div>
                                                                        )}
                                                                     </div>
                                                                     {ev.type === 'audio' ? <Activity className="h-3 w-3 text-slate-200" /> : <FileText className="h-3 w-3 text-slate-200" />}
                                                                  </div>
                                                                  
                                                                  <p className="text-xs font-bold text-slate-800 leading-relaxed italic pr-4">
                                                                     "{ev.context}"
                                                                  </p>
                                                                  <div className="pt-3 border-t border-slate-100 flex items-center gap-2 opacity-60">
                                                                     <Paperclip className="h-3 w-3 text-slate-400" />
                                                                     <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{ev.source}</span>
                                                                  </div>
                                                               </div>
                                                            ))}
                                                         </div>
                                                      </div>
                                                   )}
                                                </div>
                                             ))}
                                          </div>
                                       </div>
                                    </div>
                                 </div>
                              </div>
                           );
                        }


                         if (activeEvidenceConsoleMode === "diarization") {
                            return (
                               <div className="flex flex-col h-full bg-white overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
                                  <div className="h-12 border-b border-slate-200 flex items-center justify-between px-5 bg-white shrink-0">
                                     <div className="flex items-center gap-2">
                                        <Activity className="h-4 w-4 text-slate-400" />
                                        <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Diarization Session</span>
                                     </div>
                                     <div className="flex items-center gap-2">
                                        <div className="flex bg-slate-100 p-0.5 rounded-none border border-slate-200">
                                           <button onClick={() => setActiveEvidenceConsoleMode('trace')} className={cn("px-2 py-1 text-[8px] font-black uppercase rounded-none transition-all", activeEvidenceConsoleMode === 'trace' ? "bg-white shadow-sm text-slate-900" : "text-slate-400")}>Trace</button>
                                           <button onClick={() => setActiveEvidenceConsoleMode('diarization')} className={cn("px-2 py-1 text-[8px] font-black uppercase rounded-none transition-all", activeEvidenceConsoleMode === 'diarization' ? "bg-white shadow-sm text-slate-900" : "text-slate-400")}>Diar</button>
                                        </div>
                                        <Button variant="ghost" size="sm" onClick={() => setSelectedRowId(null)} className="h-8 w-8 p-0 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-none">
                                           <X className="h-4 w-4" />
                                        </Button>
                                     </div>
                                  </div>

                                  <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-slate-50/20">
                                     <div className="space-y-6">
                                        {audioEvidence.diarization.map((seg: any, idx: number) => (
                                           <div key={idx} className="bg-white border border-slate-200 rounded-none flex flex-col group hover:border-slate-400 transition-colors shadow-sm">
                                              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2 bg-slate-50/50">
                                                 <div className="flex items-center gap-3">
                                                    <span className="text-[10px] font-mono font-black text-slate-500">{seg.start_dialog} ------ {seg.end_dialog}</span>
                                                    <div className="flex items-center gap-2">
                                                       <span className={cn(
                                                          "px-2 py-0.5 text-white text-[8px] font-black uppercase tracking-wider rounded-none",
                                                          seg.speaker_label?.toUpperCase() === 'INVESTIGATOR' ? "bg-blue-600" : "bg-slate-900"
                                                       )}>
                                                          {seg.speaker_label}
                                                       </span>
                                                       <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">{seg.confidence}</span>
                                                    </div>
                                                 </div>
                                                 <div className="flex items-center gap-2">
                                                    {seg.theme_tag && (
                                                       <div className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-50 border border-blue-100">
                                                          <div className="h-1 w-1 bg-blue-600" />
                                                          <span className="text-[8px] font-black text-blue-700 uppercase tracking-widest">{seg.theme_tag}</span>
                                                       </div>
                                                    )}
                                                    {seg.interaction_type && (
                                                       <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-100 border border-slate-200">
                                                          <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{seg.interaction_type}</span>
                                                       </div>
                                                    )}
                                                 </div>
                                              </div>

                                              <div className="p-4 space-y-4">
                                                 <div className="flex gap-4">
                                                    <Quote className="h-4 w-4 text-slate-200 shrink-0 mt-1" />
                                                    <div className="space-y-2">
                                                       <p className="text-xs font-bold text-slate-800 leading-relaxed">"{seg.verbatim_text}"</p>
                                                       {seg.paralinguistics && seg.paralinguistics.length > 0 && (
                                                          <div className="flex flex-wrap gap-2 pt-1">
                                                             {seg.paralinguistics.map((p: string, pIdx: number) => (
                                                                <span key={pIdx} className="text-[9px] font-medium text-slate-400 italic">[{p}]</span>
                                                             ))}
                                                          </div>
                                                       )}
                                                    </div>
                                                 </div>

                                                 {seg.extracted_action_or_fact && (
                                                    <div className="bg-slate-50 border border-slate-100 p-3 flex gap-3">
                                                       <Brain className="h-3.5 w-3.5 text-blue-500 shrink-0 mt-0.5" />
                                                       <div>
                                                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-1">AI Extracted Fact</span>
                                                          <p className="text-[11px] font-medium text-slate-600 leading-tight">{seg.extracted_action_or_fact}</p>
                                                       </div>
                                                    </div>
                                                 )}
                                              </div>
                                           </div>
                                        ))}
                                     </div>
                                  </div>
                               </div>
                            );
                         }

                        return (
                           <div className="flex flex-col h-full bg-white animate-in fade-in duration-300">
                              <div className="h-12 border-b border-slate-200 flex items-center justify-between px-5 bg-slate-50/50 shrink-0">
                                 <div className="flex items-center gap-2">
                                    <Brain className="h-4 w-4 text-primary" />
                                    <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Evidence Console</span>
                                 </div>
                                 <div className="flex items-center gap-2">
                                    <div className="flex bg-slate-200 p-0.5 rounded-sm">
                                       <button onClick={() => setActiveEvidenceConsoleMode('trace')} className={cn("px-2 py-1 text-[8px] font-black uppercase rounded-sm transition-all", activeEvidenceConsoleMode === 'trace' ? "bg-white shadow-sm text-slate-900" : "text-slate-400")}>Trace</button>
                                       <button onClick={() => setActiveEvidenceConsoleMode('analysis')} className={cn("px-2 py-1 text-[8px] font-black uppercase rounded-sm transition-all", activeEvidenceConsoleMode === 'analysis' ? "bg-white shadow-sm text-slate-900" : "text-slate-400")}>Actor</button>
                                       <button onClick={() => setActiveEvidenceConsoleMode('diarization')} className={cn("px-2 py-1 text-[8px] font-black uppercase rounded-sm transition-all", activeEvidenceConsoleMode === 'diarization' ? "bg-white shadow-sm text-slate-900" : "text-slate-400")}>Diar</button>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => setSelectedRowId(null)} className="h-8 w-8 p-0 text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                                       <X className="h-4 w-4" />
                                    </Button>
                                 </div>
                              </div>

                              <div className="flex-1 flex flex-col overflow-hidden bg-white">
                                 {activeEvidenceConsoleMode === 'analysis' ? (
                                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8 animate-in slide-in-from-right-4 duration-500">
                                       <div className="border border-slate-900 bg-white p-6 rounded-none shadow-[8px_8px_0px_rgba(0,0,0,0.05)] relative overflow-hidden group">
                                          <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                                             <Brain className="h-24 w-24 text-slate-900 -mr-6 -mt-6 rotate-12" />
                                          </div>
                                          
                                          <div className="flex gap-8 relative z-10">
                                             <div className="flex flex-col gap-4 shrink-0">
                                                <div className="h-32 w-32 border-2 border-slate-900 bg-slate-50 overflow-hidden rounded-none relative">
                                                   <img 
                                                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200&h=200" 
                                                      alt="Actor Profile"
                                                      className="h-full w-full object-cover grayscale"
                                                   />
                                                   <div className="absolute bottom-0 left-0 right-0 bg-slate-900/80 text-white text-[7px] font-black uppercase text-center py-1">IDENTITY VERIFIED</div>
                                                </div>
                                                <div className="p-2 border border-slate-200 bg-white flex flex-col items-center gap-1">
                                                   <div className="h-12 w-12 bg-slate-100 flex items-center justify-center">
                                                      <Copy className="h-6 w-6 text-slate-300" />
                                                   </div>
                                                   <span className="text-[6px] font-black text-slate-400 uppercase tracking-widest">NPK: 61230944</span>
                                                </div>
                                             </div>

                                             <div className="flex-1 flex flex-col justify-between py-1">
                                                <div className="space-y-1">
                                                   <div className="flex items-center gap-2">
                                                      <span className="px-2 py-0.5 bg-amber-500 text-white text-[8px] font-black uppercase tracking-widest rounded-none italic">OPERATOR</span>
                                                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Site Production Area 2</span>
                                                   </div>
                                                   <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none">BAGAS PRAMONO</h2>
                                                   <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">NPK ID: 61230944</p>
                                                </div>

                                                <div className="flex gap-4">
                                                   <div className="flex flex-col">
                                                      <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Division</span>
                                                      <span className="text-[10px] font-black text-slate-900 uppercase">ALL DIVISION</span>
                                                   </div>
                                                   <div className="flex flex-col border-l border-slate-200 pl-4">
                                                      <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Company</span>
                                                      <span className="text-[10px] font-black text-slate-900 uppercase italic">PT Pamapersada Nusantara</span>
                                                   </div>
                                                </div>
                                             </div>
                                          </div>
                                       </div>

                                       <div className="space-y-4">
                                          <div className="flex items-center justify-between">
                                             <div className="flex items-center gap-2">
                                                <Users className="h-4 w-4 text-slate-400" />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Actor Intelligence Profile</span>
                                             </div>
                                             <div className="flex items-center gap-2">
                                                <div className="h-1.5 w-1.5 bg-emerald-500" />
                                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Verification Active</span>
                                             </div>
                                          </div>

                                          <div className="border border-slate-200 bg-slate-200 flex flex-col gap-px rounded-none overflow-hidden">
                                             {[
                                                { label: 'Full Name', value: 'Bagas Pramono' },
                                                { label: 'NPK / Employee ID', value: '61230944' },
                                                { label: 'Functional Position', value: 'Operator' },
                                                { label: 'Structural Position', value: 'OPERATOR TP' },
                                                { label: 'Work Location', value: 'Site Production Area 2' },
                                                { label: 'Division', value: 'ALL DIVISION' },
                                                { label: 'Employment Status', value: 'EKSTERNAL' },
                                                { label: 'Hiring Date', value: '02 Nov 2023' },
                                                { label: 'Birth Info', value: 'Kebumen, 01 Oct 2002' },
                                                { label: 'Contact (Personal)', value: '089525781130' },
                                                { label: 'Email Address', value: 'xtav1.06.bagaspramono@gmail.com' },
                                                { label: 'Emergency Contact', value: 'Karmi Ibu (0895329820979)' },
                                             ].map((field, idx) => (
                                                <div key={idx} className="grid grid-cols-[160px_1fr] gap-px bg-slate-200">
                                                   <div className="bg-slate-50 p-3 flex items-center">
                                                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{field.label}</span>
                                                   </div>
                                                   <div className="bg-white p-3 flex items-center group transition-colors hover:bg-slate-50">
                                                      <span className="text-[10px] font-black text-slate-900 uppercase tracking-tight">{field.value}</span>
                                                   </div>
                                                </div>
                                             ))}
                                          </div>

                                          <div className="pt-4 flex justify-end gap-3">
                                             <Button variant="outline" className="rounded-none border-slate-200 text-[9px] font-black uppercase tracking-widest h-9">
                                                <Copy className="h-3 w-3 mr-2" /> Copy Profile
                                             </Button>
                                             <Button className="rounded-none bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest h-9 px-6 shadow-[4px_4px_0px_rgba(0,0,0,0.1)]">
                                                <FileJson className="h-3 w-3 mr-2 text-emerald-400" /> Export JSON
                                             </Button>
                                          </div>
                                       </div>
                                    </div>
                                 ) : (
                                    <div className="flex-1 flex flex-col overflow-hidden bg-white">
                                       <div className="px-5 py-4 border-b border-slate-100 space-y-1 bg-white shrink-0">
                                          <div className="space-y-1">
                                             <button 
                                                onClick={() => setExpandedFolders(prev => prev.includes('audio') ? prev.filter(f => f !== 'audio') : [...prev, 'audio'])}
                                                className="w-full flex items-center justify-between p-2 hover:bg-slate-50 rounded-sm group transition-colors"
                                             >
                                                <div className="flex items-center gap-2">
                                                   <Folders className="h-3.5 w-3.5 text-slate-400 group-hover:text-primary transition-colors" />
                                                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-slate-900 transition-colors">Audio Evidence</span>
                                                </div>
                                                {expandedFolders.includes('audio') ? <ChevronDown className="h-3 w-3 text-slate-300" /> : <ChevronRight className="h-3 w-3 text-slate-300" />}
                                             </button>
                                             
                                             {expandedFolders.includes('audio') && (
                                                <div className="ml-4 pl-2 border-l border-slate-100 space-y-0.5">
                                                   <button 
                                                      onClick={() => setActiveEvidenceType('audio_diarization')}
                                                      className={cn(
                                                         "w-full flex items-center gap-2 p-2 rounded-sm text-[9px] font-black uppercase tracking-widest transition-all text-left",
                                                         activeEvidenceType === 'audio_diarization' ? "bg-slate-900 text-white shadow-sm" : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                                                      )}
                                                   >
                                                      <Activity className={cn("h-3 w-3", activeEvidenceType === 'audio_diarization' ? "text-emerald-400" : "text-slate-300")} />
                                                      Diarization Session
                                                   </button>
                                                   <button 
                                                      onClick={() => setActiveEvidenceType('audio_analysis')}
                                                      className={cn(
                                                         "w-full flex items-center gap-2 p-2 rounded-sm text-[9px] font-black uppercase tracking-widest transition-all text-left",
                                                         activeEvidenceType === 'audio_analysis' ? "bg-slate-900 text-white shadow-sm" : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                                                      )}
                                                   >
                                                      <Activity className={cn("h-3 w-3", activeEvidenceType === 'audio_analysis' ? "text-blue-400" : "text-slate-300")} />
                                                      Protocol Analysis
                                                   </button>
                                                </div>
                                             )}
                                          </div>

                                          <div className="space-y-1">
                                             <button 
                                                onClick={() => setExpandedFolders(prev => prev.includes('document') ? prev.filter(f => f !== 'document') : [...prev, 'document'])}
                                                className="w-full flex items-center justify-between p-2 hover:bg-slate-50 rounded-sm group transition-colors"
                                             >
                                                <div className="flex items-center gap-2">
                                                   <Folders className="h-3.5 w-3.5 text-slate-400 group-hover:text-primary transition-colors" />
                                                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-slate-900 transition-colors">Document Trace</span>
                                                </div>
                                                {expandedFolders.includes('document') ? <ChevronDown className="h-3 w-3 text-slate-300" /> : <ChevronRight className="h-3 w-3 text-slate-300" />}
                                             </button>
                                             
                                             {expandedFolders.includes('document') && (
                                                <div className="ml-4 pl-2 border-l border-slate-100 space-y-0.5">
                                                   <button 
                                                      onClick={() => setActiveEvidenceType('doc_citation')}
                                                      className={cn(
                                                         "w-full flex items-center gap-2 p-2 rounded-sm text-[9px] font-black uppercase tracking-widest transition-all text-left",
                                                         activeEvidenceType === 'doc_citation' ? "bg-slate-900 text-white shadow-sm" : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                                                      )}
                                                   >
                                                      <Quote className={cn("h-3 w-3", activeEvidenceType === 'doc_citation' ? "text-amber-400" : "text-slate-300")} />
                                                      Forensic Citations
                                                   </button>
                                                </div>
                                             )}
                                          </div>
                                       </div>

                                       <div className="flex-1 overflow-y-auto custom-scrollbar p-6 pb-20 bg-slate-50/20">
                                          {activeEvidenceType === 'audio_diarization' && (
                                             <div className="space-y-4">
                                                {audioEvidence.diarization.map((seg: any, idx: number) => (
                                                   <div key={idx} className="bg-white border border-slate-200 rounded-none mb-6 flex flex-col group hover:border-slate-400 transition-colors shadow-sm">
                                                      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2 bg-slate-50/50">
                                                         <div className="flex items-center gap-3">
                                                            <span className="text-[10px] font-mono font-black text-slate-500">{seg.start_dialog} - {seg.end_dialog}</span>
                                                            <div className="flex items-center gap-2">
                                                               <span className={cn(
                                                                  "px-2 py-0.5 text-white text-[8px] font-black uppercase tracking-wider rounded-none",
                                                                  seg.speaker_label?.toUpperCase() === 'INVESTIGATOR' ? "bg-blue-600" : "bg-slate-900"
                                                               )}>
                                                                  {seg.speaker_label}
                                                               </span>
                                                               <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">{seg.confidence}</span>
                                                            </div>
                                                         </div>
                                                         <div className="flex items-center gap-2">
                                                            {seg.theme_tag && (
                                                               <div className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-50 border border-blue-100">
                                                                  <div className="h-1 w-1 bg-blue-600" />
                                                                  <span className="text-[8px] font-black text-blue-700 uppercase tracking-widest">{seg.theme_tag}</span>
                                                               </div>
                                                            )}
                                                            {seg.interaction_type && (
                                                               <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-100 border border-slate-200">
                                                                  <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{seg.interaction_type}</span>
                                                               </div>
                                                            )}
                                                         </div>
                                                      </div>

                                                      <div className="p-4 space-y-4">
                                                         <div className="flex gap-4">
                                                            <Quote className="h-4 w-4 text-slate-200 shrink-0 mt-1" />
                                                            <div className="space-y-2">
                                                               <p className="text-xs font-bold text-slate-800 leading-relaxed">"{seg.verbatim_text}"</p>
                                                               {seg.paralinguistics && seg.paralinguistics.length > 0 && (
                                                                  <div className="flex flex-wrap gap-2 pt-1">
                                                                     {seg.paralinguistics.map((p: string, pIdx: number) => (
                                                                        <span key={pIdx} className="text-[9px] font-medium text-slate-400 italic">[{p}]</span>
                                                                     ))}
                                                                  </div>
                                                               )}
                                                            </div>
                                                         </div>

                                                         {seg.extracted_action_or_fact && (
                                                            <div className="bg-slate-50 border border-slate-100 p-3 flex gap-3">
                                                               <Brain className="h-3.5 w-3.5 text-blue-500 shrink-0 mt-0.5" />
                                                               <div>
                                                                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-1">AI Extracted Fact</span>
                                                                  <p className="text-[11px] font-medium text-slate-600 leading-tight">{seg.extracted_action_or_fact}</p>
                                                               </div>
                                                            </div>
                                                         )}
                                                      </div>
                                                   </div>
                                                ))}
                                             </div>
                                          )}

                                          {activeEvidenceType === 'audio_analysis' && (
                                             <div className="space-y-6">
                                                {audioEvidence.analysis.speakers.map((s, idx) => (
                                                   <div key={idx} className="border border-slate-200 p-5 rounded-sm bg-white shadow-sm">
                                                      <div className="flex items-center gap-4 mb-6">
                                                         <div className="h-10 w-10 bg-slate-900 text-white flex items-center justify-center rounded-sm font-black text-xs">
                                                            {s.name.split(' ').map(n => n[0]).join('')}
                                                         </div>
                                                         <div>
                                                            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">{s.name}</h4>
                                                            <p className="text-[9px] font-bold text-slate-400 uppercase">{s.role}</p>
                                                         </div>
                                                      </div>
                                                      <div className="grid grid-cols-2 gap-4">
                                                         <div className="space-y-1">
                                                            <span className="text-[8px] font-black text-slate-400 uppercase">Style</span>
                                                            <p className="text-[10px] font-bold text-slate-700 uppercase">{s.style}</p>
                                                         </div>
                                                         <div className="space-y-1">
                                                            <span className="text-[8px] font-black text-slate-400 uppercase">Stress</span>
                                                            <p className="text-[10px] font-bold text-slate-700 uppercase">{s.stressLevel}</p>
                                                         </div>
                                                      </div>
                                                   </div>
                                                ))}
                                             </div>
                                          )}

                                          {activeEvidenceType === 'doc_citation' && (
                                             <div className="space-y-4">
                                                <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-sm">
                                                   <p className="text-[10px] font-bold text-amber-800 uppercase tracking-tight mb-2">Technical Discrepancy Note</p>
                                                   <p className="text-[11px] text-amber-700 leading-relaxed italic">"Pressure readings in Report #402 (p. 12) do not align with telemetry timestamps. Discrepancy: +150ms delay in sensor logging."</p>
                                                </div>
                                             </div>
                                          )}
                                       </div>
                                    </div>
                                 )}
                              </div>
                           </div>
                        );
                     })()
                  ) : (
                     <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-300">
                        <Brain className="h-12 w-12 mb-4 opacity-20" />
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em]">Console Standby</h4>
                        <p className="text-[10px] mt-2 opacity-50 font-bold uppercase">Select an event to review evidence</p>
                     </div>
                  )}
               </div>
            </div>
         </div>

         {preRunAgentId && (
            <PreRunModal 
               agent={agents.find(a => a.id === preRunAgentId)!}
               onClose={() => setPreRunAgentId(null)}
               onRun={(rerun) => runSingleAgent(preRunAgentId, rerun)}
            />
         )}

         {historyAgentId && (
            <AgentHistoryPanel 
               agent={agents.find(a => a.id === historyAgentId)!}
               onClose={() => setHistoryAgentId(null)}
            />
         )}
      </div>
  );
}

function PreRunModal({ agent, onClose, onRun }: { agent: AgentState, onClose: () => void, onRun: (isRerun: boolean) => void }) {
  const isRerun = agent.status === 'completed' || agent.status === 'failed' || agent.status === 'cancelled';
  
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-sm  overflow-hidden border border-slate-200">
        <div className="h-14 border-b border-slate-100 flex items-center justify-between px-6 bg-slate-50/50">
          <div className="flex items-center gap-3">
             <div className="h-8 w-8 rounded-sm bg-slate-900 text-white flex items-center justify-center  shadow-slate-900/10">
                <agent.icon className="h-4 w-4" />
             </div>
             <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 leading-none">Execute Node</h3>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 block">Configuration & Cost Warning</span>
             </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 rounded-full hover:bg-slate-200 text-slate-400">
             <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-slate-50 rounded-sm p-5 border border-slate-100 space-y-4">
             <div className="flex flex-col">
                <span className="text-[9px] font-black text-slate-400 uppercase mb-2">Agent Context</span>
                <span className="text-[14px] font-black text-slate-900 uppercase tracking-tight leading-none">{agent.name}</span>
                <p className="text-[11px] font-bold text-slate-500 mt-2 leading-relaxed opacity-70">{agent.purpose}</p>
             </div>
             
             <div className="grid grid-cols-2 gap-6 pt-2">
                <div className="flex flex-col">
                   <span className="text-[8px] font-black text-slate-400 uppercase mb-1">Execution Mode</span>
                   <span className={`text-[10px] font-black uppercase tracking-widest ${isRerun ? "text-amber-600" : "text-emerald-600"}`}>
                      {isRerun ? "Rerun / Re-analysis" : "Fresh Execution"}
                   </span>
                </div>
                <div className="flex flex-col">
                   <span className="text-[8px] font-black text-slate-400 uppercase mb-1">Last Run</span>
                   <span className="text-[10px] font-black text-slate-800 uppercase tabular-nums">{agent.lastRunTimestamp || "Never"}</span>
                </div>
             </div>
          </div>

          <div className="space-y-4">
             <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                   <Database className="h-3 w-3 text-slate-400" />
                   <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Resource Estimate</span>
                </div>
             </div>
             <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-white border border-slate-100 rounded-sm ">
                   <div className="text-[18px] font-black text-slate-900 leading-none">{agent.tokenEstimate?.toLocaleString()}</div>
                   <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-1">
                      Est. Tokens <HelpCircle className="h-2.5 w-2.5" />
                   </div>
                </div>
                <div className="p-4 bg-white border border-slate-100 rounded-sm ">
                   <div className="text-[18px] font-black text-slate-900 leading-none">12</div>
                   <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-2">Source Evidence</div>
                </div>
             </div>
          </div>

          <div className="bg-amber-50/50 border border-amber-100 border-dashed rounded-sm p-4 flex gap-3">
             <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
             <div className="space-y-1">
                <span className="text-[10px] font-black text-amber-800 uppercase block tracking-wider">Token Consumption Warning</span>
                <p className="text-[11px] font-black text-amber-900 leading-snug opacity-70">
                   Running this agent will consume cloud inference tokens. Cost will be billed to the Case ID budget.
                </p>
             </div>
          </div>
        </div>

        <div className="p-6 pt-0 flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1 h-11 text-[11px] font-black uppercase tracking-widest rounded-sm">
             Cancel
          </Button>
          <Button onClick={() => onRun(isRerun)} className="flex-1 h-11 bg-slate-900 hover:bg-black text-white text-[11px] font-black uppercase tracking-widest rounded-sm  shadow-slate-900/10">
             {isRerun ? "Confirm Rerun" : "Confirm Execute"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function AgentHistoryPanel({ agent, onClose }: { agent: AgentState, onClose: () => void }) {
  return (
    <div className="fixed inset-y-0 right-0 w-[420px] bg-white border-l border-slate-200 z-[100]  flex flex-col animate-in slide-in-from-right duration-300">
      <div className="h-16 border-b border-slate-100 flex items-center justify-between px-6 bg-slate-50/50">
        <div className="flex items-center gap-3">
           <History className="h-5 w-5 text-slate-400" />
           <div className="flex flex-col">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Run History</h3>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{agent.name}</span>
           </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="h-9 w-9 p-0 rounded-full hover:bg-slate-200 text-slate-400 transition-all">
           <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {agent.history.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-20 p-12">
             <Activity className="h-12 w-12 text-slate-300 mb-6" />
             <h4 className="text-[12px] font-black uppercase tracking-[0.2em]">No History Found</h4>
             <p className="text-[10px] font-bold text-slate-500 uppercase mt-2">This agent has not been executed yet.</p>
          </div>
        ) : (
          agent.history.map((run, i) => (
            <div key={run.run_id} className="relative pl-6 pb-8 last:pb-0">
               {i !== agent.history.length - 1 && (
                  <div className="absolute left-[7px] top-4 bottom-0 w-px bg-slate-100" />
               )}
               <div className="absolute left-0 top-1.5 h-3.5 w-3.5 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center">
                  <div className={`h-1.5 w-1.5 rounded-full ${run.status === 'completed' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
               </div>
               
               <div className="bg-white border border-slate-100 rounded-sm p-4  hover:border-slate-300 transition-all cursor-default">
                  <div className="flex items-start justify-between mb-4">
                     <div className="flex flex-col">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Timestamp</span>
                        <span className="text-[11px] font-black text-slate-800 tabular-nums">
                           {new Date(run.started_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                        </span>
                     </div>
                     <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${run.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>
                        {run.status}
                     </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                     <div>
                        <div className="text-[8px] font-black text-slate-400 uppercase mb-1">Token Usage</div>
                        <div className="text-[12px] font-black text-slate-900 tabular-nums">{run.token_usage?.toLocaleString() || "---"}</div>
                     </div>
                     <div>
                        <div className="text-[8px] font-black text-slate-400 uppercase mb-1">Duration</div>
                        <div className="text-[12px] font-black text-slate-900 tabular-nums">{(run.duration_ms! / 1000).toFixed(2)}s</div>
                     </div>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                     <Users className="h-3 w-3 text-slate-300" />
                     <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Triggered by: <span className="text-slate-800">{run.triggered_by}</span></span>
                  </div>

                  <div className="bg-slate-50/50 rounded-sm p-3 border border-slate-50">
                     <p className="text-[11px] font-bold text-slate-500 leading-snug italic">
                        "{run.summary || "No summary provided for this run."}"
                     </p>
                  </div>
               </div>
            </div>
          ))
        )}
      </div>

      <div className="p-6 border-t border-slate-100 bg-slate-50/30">
        <div className="flex items-center justify-between mb-4">
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aggregate Metrics</span>
           <span className="text-[10px] font-black text-slate-900 uppercase">{agent.runCount} Total Runs</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
           <div className="bg-white p-3 rounded-sm border ">
              <div className="text-[14px] font-black text-slate-900 leading-none">
                 {agent.history.reduce((a, b) => a + (b.token_usage || 0), 0).toLocaleString()}
              </div>
              <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Total Tokens</div>
           </div>
           <div className="bg-white p-3 rounded-sm border ">
              <div className="text-[14px] font-black text-slate-900 leading-none">
                 {(agent.history.reduce((a, b) => a + (b.duration_ms || 0), 0) / 1000).toFixed(1)}s
              </div>
              <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Total Compute</div>
           </div>
        </div>
      </div>
    </div>
  );
}
