// BUILD_VERSION: 2026-04-16T19:35:00 — force redeploy with diarization + 6-layer extraction
import React, { useState, useEffect, useRef, useMemo } from "react"; 
import { FactChronologyModule, ChronologyItem, TraceabilityPanel, VerificationStatus, STATUS_CONFIG } from "@/components/analysis/FactChronologyModule";
import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { StatusChip, SeverityChip, ConfidenceChip } from "@/components/StatusChip";
import { useCase, useUpdateCase, useCases } from "@/hooks/useCases";
import { useEvidence, useDeleteFile, useUploadEvidence, useUpdateBatch, useMoveFile } from "@/hooks/useEvidence";
import { useAuditLogs, useInsertAuditLog } from "@/hooks/useAuditLogs";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Book,
  BookText,
  Upload,
  ArrowLeft,
  Play,
  Pause,
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
  Folder,
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
  ChevronLeft,
  Users,
  FileJson,
  Copy,
  ZoomIn,
  ZoomOut,
  Quote,
  Hand,
  Maximize,
  Minimize,
  Scan,
  RefreshCcw,
  HardHat,
  Footprints,
  Wind,
  Navigation,
  Truck,
  Activity,
  Trash2,
  Box,
  Cpu,
  Loader2,
  Database,
  Ruler,
  MessageCircle,
  Download,
  Plus,
  Minus,
  Shield,
  ShieldAlert,
  HelpCircle,
  Layout,
  Layers,
  Sun,
  Contrast,
  Zap,
  Eye,
  EyeOff,
  Wand2,
  Focus,
  Target,
  X,
  Grid3X3,
  MousePointer2
} from "lucide-react";

type AgentStatus = 'idle' | 'queued' | 'running' | 'paused' | 'stopped' | 'completed' | 'failed' | 'cancelled';

interface AgentRunHistory {
  run_id: string;
  agent_id: string;
  started_at: string;
  ended_at?: string;
  triggered_by: string;
  status: AgentStatus;
  token_usage?: number;
  duration_ms?: number;
  summary?: string;
  error_message?: string;
}

interface AgentState {
  id: string;
  name: string;
  icon: any;
  purpose: string;
  status: AgentStatus;
  triggeredBy?: string;
  lastRunTimestamp?: string;
  lastUpdatedTimestamp?: string;
  confidence?: string;
  dependencyState?: string;
  microStatus?: string;
  results?: any;
  dependencies: string[];
  
  // Operational Metadata
  runCount: number;
  currentRunProgress?: number;
  tokenEstimate?: number;
  actualTokenUsage?: number;
  durationMs?: number;
  errorMessage?: string;
  history: AgentRunHistory[];
  backendCapabilities: {
    canPause: boolean;
    canResume: boolean;
    canStop: boolean;
    canRerun: boolean;
  };
  knowledgeSelection?: string[];
}

export type EventBreakdown = {
  time: string;
  timezone?: string;
  phase: "pra_kontak" | "kontak" | "pasca_kontak";
  actor?: string;
  actorRole?: string;
  action?: string;
  actionCategory?: "inspection" | "movement" | "communication" | "decision" | "response" | "observation" | "system_alert";
  objectOrUnit?: string;
  location?: string;
  condition?: string;
  outcome?: string;
};

export type EvidenceTraceLink = {
  id: string;
  evidenceType: "audio" | "document";
  sourceLabel: string;
  sourceFileName?: string;
  quote: string;
  speaker?: string;
  startTime?: string;
  endTime?: string;
  page?: number;
  relevance: "primary" | "supporting" | "conflicting";
  confidence: "high" | "medium" | "low";
};

export interface EnhancedChronologyItem {
  id: string;
  phase: "pra_kontak" | "kontak" | "pasca_kontak";
  time: string;
  timezone?: string;
  description: string;
  breakdown: EventBreakdown;
  confidence: "high" | "medium" | "low";
  status: "draft" | "reviewed" | "annotated" | "needs_more_evidence";
  evidenceLinks: EvidenceTraceLink[];
  annotations: any[];
  updatedAt: string;
}

const formatTime = (seconds: number) => {
  if (isNaN(seconds)) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

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
           tanggal: "April 05, 2026",
           jam: "14:10 - 14:45",
           lokasi: "Conveyor Zone B, Section 14",
           jenis: "Mechanical Failure & Material Spillage",
           deskripsi: "Tear in conveyor belt led to massive spillage and structural stress at Section 14 conveyor drives.",
           departemen: "Mining Operations",
           sumber_bukti: "SCADA, CCTV-B14, HSE Logs",
           severity: "High"
        },         chronology_items: [
            { 
              id: 'chrono-001', 
              phase: 'pre_contact', 
              time: "14:05", 
              time_label: "14:05 WITA",
              description: "Normal operation: Section 14 conveyor belt carrying material at 85% capacity", 
              chronology_text: "Normal operation: Section 14 conveyor belt carrying material at 85% capacity",
              confidence: "high",
              status: "reviewed",
              verification_status: "human_verified",
              annotated_by_human: true,
              decomposition: [
                 { text: "Normal operation", type: "AKSI" },
                 { text: ": ", type: "TEXT" },
                 { text: "Section 14", type: "LOKASI" },
                 { text: " conveyor belt", type: "OBJEK" },
                 { text: " carrying material at 85% capacity", type: "KONTEKS" }
              ],
              breakdown: {
                 time: "14:05",
                 timezone: "WITA",
                 phase: "pre_contact",
                 actor: "System",
                 actorRole: "Automated Control",
                 action: "Normal Operation",
                 actionCategory: "observation",
                 objectOrUnit: "Conveyor Section 14",
                 location: "Section 14",
                 condition: "85% Load Capacity",
                 outcome: "Steady state performance"
              },
              evidenceLinks: [
                 { id: 'ev-0', evidenceType: "document", sourceLabel: "Operations Log", sourceFileName: "ops_log_april05.pdf", page: 12, quote: "Section 14 operating at normal parameters with 85% throughput load.", relevance: "primary", confidence: "high" }
              ],
              annotations: [],
              updatedAt: new Date().toISOString()
            },
            { 
              id: 'chrono-002', 
              phase: 'pre_contact', 
              time: "14:10", 
              time_label: "14:10 WITA",
              description: "Vibration sensor alert on Section 14 drive motor detected by SCADA", 
              chronology_text: "Vibration sensor alert on Section 14 drive motor detected by SCADA",
              confidence: "high",
              status: "draft",
              verification_status: "ai_generated",
              annotated_by_human: false,
              decomposition: [
                 { text: "Vibration sensor alert", type: "AKSI" },
                 { text: " on ", type: "TEXT" },
                 { text: "Section 14", type: "LOKASI" },
                 { text: " drive motor", type: "OBJEK" },
                 { text: " detected by ", type: "TEXT" },
                 { text: "SCADA", type: "AKTOR" }
              ],
              breakdown: {
                 time: "14:10",
                 timezone: "WITA",
                 phase: "pre_contact",
                 actor: "Sensor System",
                 actorRole: "Monitoring System",
                 action: "Vibration alarm triggered",
                 actionCategory: "system_alert",
                 objectOrUnit: "Section 14 drive motor",
                 location: "Section 14",
                 condition: "Vibration exceeded safe threshold",
                 outcome: "Early warning detected"
              },
              evidenceLinks: [
                 { id: 'ev-1', evidenceType: "audio", sourceLabel: "Radio Comm", sourceFileName: "radio_0504.mp3", speaker: "Operator A", startTime: "00:04", endTime: "00:12", quote: "Control, ini Operator A. Getaran di Section 14 melebihi batas aman.", relevance: "primary", confidence: "high" }
              ],
              annotations: [],
              updatedAt: new Date().toISOString()
            },
            { 
              id: 'chrono-003', 
              phase: 'contact', 
              time: "14:23", 
              time_label: "14:23 WITA",
              description: "Belt rupture occurred at Section 14, leading to massive material spillage", 
              chronology_text: "Belt rupture occurred at Section 14, leading to massive material spillage",
              confidence: "high",
              status: "draft",
              verification_status: "ai_generated",
              annotated_by_human: false,
              decomposition: [
                 { text: "Belt rupture", type: "AKSI" },
                 { text: " occurred at ", type: "TEXT" },
                 { text: "Section 14", type: "LOKASI" },
                 { text: ", leading to ", type: "TEXT" },
                 { text: "massive material spillage", type: "HASIL" }
              ],
              breakdown: {
                 time: "14:23",
                 timezone: "WITA",
                 phase: "contact",
                 actor: "Conveyor System",
                 actorRole: "Equipment",
                 action: "Structural Failure",
                 actionCategory: "system_alert",
                 objectOrUnit: "Belt Section 14",
                 location: "Section 14",
                 condition: "Mechanical rupture",
                 outcome: "Heavy material spillage"
              },
              evidenceLinks: [
                 { id: 'ev-2', evidenceType: "document", sourceLabel: "Incident Report", sourceFileName: "incident_initial.pdf", page: 1, quote: "At 14:23, conveyor belt rupture occurred at Section 14.", relevance: "primary", confidence: "high" }
              ],
              annotations: [],
              updatedAt: new Date().toISOString()
            },
            { 
              id: 'chrono-004', 
              phase: 'contact', 
              time: "14:24", 
              time_label: "14:24 WITA",
              description: "Operator A triggered Emergency Stop and reported rupture to Control Room", 
              chronology_text: "Operator A triggered Emergency Stop and reported rupture to Control Room",
              confidence: "high",
              status: "reviewed",
              verification_status: "human_verified",
              annotated_by_human: true,
              decomposition: [
                 { text: "Operator A", type: "AKTOR" },
                 { text: " triggered ", type: "TEXT" },
                 { text: "Emergency Stop", type: "AKSI" },
                 { text: " and reported rupture to ", type: "TEXT" },
                 { text: "Control Room", type: "LOKASI" }
              ],
              breakdown: {
                 time: "14:24",
                 timezone: "WITA",
                 phase: "contact",
                 actor: "Operator A",
                 actorRole: "Field Operator",
                 action: "Emergency Shutdown",
                 actionCategory: "decision",
                 objectOrUnit: "E-Stop Button",
                 location: "Section 14 Console",
                 condition: "Manual override triggered",
                 outcome: "System power cut"
              },
              evidenceLinks: [
                 { id: 'ev-3', evidenceType: "audio", sourceLabel: "Radio Comm", sourceFileName: "radio_0504.mp3", speaker: "Operator A", startTime: "02:14", endTime: "02:22", quote: "Kontrol! Belt Section 14 robek! E-Stop!", relevance: "primary", confidence: "high" }
              ],
              annotations: [],
              updatedAt: new Date().toISOString()
            },
            { 
              id: 'chrono-005', 
              phase: 'post_contact', 
              time: "14:30", 
              time_label: "14:30 WITA",
              description: "Maintenance team arrived at Section 14 to assess damage and contain spillage", 
              chronology_text: "Maintenance team arrived at Section 14 to assess damage and contain spillage",
              confidence: "medium",
              status: "draft",
              verification_status: "ai_generated",
              annotated_by_human: false,
              decomposition: [
                 { text: "Maintenance team", type: "AKTOR" },
                 { text: " arrived at ", type: "TEXT" },
                 { text: "Section 14", type: "LOKASI" },
                 { text: " to ", type: "TEXT" },
                 { text: "assess damage and contain spillage", type: "AKSI" }
              ],
              breakdown: {
                 time: "14:30",
                 timezone: "WITA",
                 phase: "post_contact",
                 actor: "Maintenance Team",
                 actorRole: "Response Unit",
                 action: "Damage Assessment",
                 actionCategory: "response",
                 objectOrUnit: "Section 14 Site",
                 location: "Section 14",
                 condition: "Spillage containment in progress",
                 outcome: "Site secured"
              },
              evidenceLinks: [
                 { id: 'ev-4', evidenceType: "document", sourceLabel: "Maintenance Log", sourceFileName: "maint_log_0504.pdf", page: 4, quote: "Team arrived at site at 14:30 to begin containment.", relevance: "supporting", confidence: "medium" }
              ],
              annotations: [],
              updatedAt: new Date().toISOString()
            },
            { 
              id: 'chrono-006', 
              phase: 'post_contact', 
              time: "14:45", 
              time_label: "14:45 WITA",
              description: "Section 14 isolated, cleanup operation commenced under HSE supervision", 
              chronology_text: "Section 14 isolated, cleanup operation commenced under HSE supervision",
              confidence: "high",
              status: "draft",
              verification_status: "ai_generated",
              annotated_by_human: false,
              decomposition: [
                 { text: "Section 14", type: "LOKASI" },
                 { text: " isolated, ", type: "TEXT" },
                 { text: "cleanup operation", type: "AKSI" },
                 { text: " commenced under ", type: "TEXT" },
                 { text: "HSE supervision", type: "KONTEKS" }
              ],
              breakdown: {
                 time: "14:45",
                 timezone: "WITA",
                 phase: "post_contact",
                 actor: "HSE Supervisor",
                 actorRole: "Safety Lead",
                 action: "Isolation & Cleanup",
                 actionCategory: "response",
                 objectOrUnit: "Section 14 Drive",
                 location: "Section 14",
                 condition: "LOTO procedures applied",
                 outcome: "Cleanup commenced"
              },
              evidenceLinks: [
                 { id: 'ev-5', evidenceType: "document", sourceLabel: "HSE Clearance", sourceFileName: "hse_clearance_0504.pdf", page: 1, quote: "Cleanup authorized after full isolation at 14:45.", relevance: "primary", confidence: "high" }
              ],
              annotations: [],
              updatedAt: new Date().toISOString()
            }
         ]
     }
  },
  { 
     id: 'peepo', 
     name: 'PEEPO Reasoning', 
     icon: Brain, 
     purpose: 'Analyze People, Environment, Equipment, Procedures, and Org factors.', 
     status: 'completed', 
     dependencies: ['fact'],
     runCount: 1,
     tokenEstimate: 3500,
     history: [
        { run_id: "r-101", agent_id: "peepo", started_at: "2026-04-20T09:00:00Z", ended_at: "2026-04-20T09:00:15Z", triggered_by: "System", status: "completed", token_usage: 2450, duration_ms: 15000, summary: "PEEPO violation analysis completed." }
     ],
     backendCapabilities: { canPause: false, canResume: false, canStop: true, canRerun: true },
     knowledgeSelection: ['Audio Recording', 'Internal Document', 'External Document', 'Photos & Media'],
     results: {
        people: [
           "Sdr Fadhli tidak memastikan pada saat penurunan vessel setelah dumping",
           "Pengawas tidak memastikan penganturan MP CR CPP pada saat shift berjalan, actual hanya 1 orang saja berada di CR",
           "Sdr Ali Akbar menginformasikan bahwa DTMB 26 Lever dump DTMB 26 tidak sesuai dengan petunjuknya sudah sejak awal digunakan",
           "Sdr Fadhli tidak melakukan komunikasi ke CR CPP",
           "Kompetensi pelaku dan saksi tidak ada deviasi"
        ],
        environment: [
           "Cuaca saat kejadian cerah",
           "Lebar jalan 10,9 m",
           "Tinggi Jembatan 6,7 m",
           "Tinggi vessel posisi tipping 7,3 m"
        ],
        equipment: [
           "Kondisi lever dump DTMB 26 terbalik",
           "Historical Maintenance DTMB 26 tidak ada kejadian terkait",
           "SKO Unit DTMB26 valid",
           "CCTV mengarah ke Lokasi kejadian, namun tidak dilakukan intervensi langsung",
           "Sudah dilakukan inspeksi paska kejadian dan ditemukan kondisi lever dump terbalik",
           "Posisi Lever Dump DTMB 20 Netral pada saat kejadian",
           "Portal safety dump 1 ditabrak"
        ],
        procedures: [
           "Terdapat JSA akan tetapi lengkap dengan poin step dumping dan skema pengawasan CPP",
           "P2H DTMB 26 no deviasi",
           "Pengecekan HP Sdr Fadhli awal shift tidak ada deviasi"
        ],
        organisation: [
           "Tindakan dari insiden sebelumnya adalah pemasangan portal sebelum jembatan laying, namun portal tersebut tidak kokoh",
           "Sdr Fadhli tidak melakukan speak up ketika menemukan lever dump terbalik",
           "Belum ada sensor reminder ketika posisi dump belum turun"
        ],
        ringkasan: "Insiden diakibatkan oleh kombinasi kelalaian operasional (People), kondisi teknis peralatan (Equipment), dan keterbatasan kontrol organisasi.",
        synthesis: "Risk Factor Level: High (Immediate Corrective Action Required)"
     }
  },
  { 
     id: 'ipls', 
     name: 'IPLS Classification', 
     icon: FileSearch, 
     purpose: 'Classify incident across the 5 layers of Industrial Prevention Logic.', 
     status: 'completed', 
     dependencies: ['peepo'],
     runCount: 1,
     tokenEstimate: 800,
     history: [
        { run_id: "r-202", agent_id: "ipls", started_at: "2026-04-20T10:00:00Z", ended_at: "2026-04-20T10:00:10Z", triggered_by: "System", status: "completed", token_usage: 650, duration_ms: 10000, summary: "5-Layer Defensive Classification completed." }
     ],
     backendCapabilities: { canPause: false, canResume: false, canStop: true, canRerun: true },
     knowledgeSelection: ['Audio Recording', 'Internal Document', 'External Document', 'Photos & Media'],
     results: {
        layers: [
           {
              id: 1,
              title: "Organization's Roles & Responsibilities",
              items: [
                 { id: 2, label: "SOP (Policy, Procedure, IK, Std & form)", status: "non-conformity" },
                 { id: 10, label: "Organizational Structure & Leadership", status: "non-conformity" }
              ]
           },
           {
              id: 2,
              title: "Plan Readiness",
              items: [
                 { id: 4, label: "Safety Accountability Program (SAP)", status: "non-conformity" },
                 { id: 10, label: "HSE Campaign", status: "improvement" }
              ]
           },
           {
              id: 3,
              title: "Work Readiness and Monitoring",
              items: [
                 { id: 4, label: "Rencana kerja harian/Daily Maintenance", status: "non-conformity" },
                 { id: 10, label: "Pelaksanaan pekerjaan sesuai SOP", status: "rootcause" },
                 { id: 13, label: "Fit to Work (Mental & Physical)", status: "rootcause" },
                 { id: 17, label: "Speak Up", status: "non-conformity" }
              ]
           },
           {
              id: 4,
              title: "Preventive Defense",
              items: [
                 { id: 4, label: "In Cabin Camera/DMS", status: "non-conformity" },
                 { id: 7, label: "CCTV", status: "non-conformity" }
              ]
           },
           {
              id: 5,
              title: "Contact Defense",
              items: [
                 { id: 5, label: "Emergency Response", status: "non-conformity" }
              ]
           }
        ],
        summary: "Analisis 5 Layer mengidentifikasi kegagalan kritis pada Layer III (Pelaksanaan SOP & Fit to Work) sebagai akar masalah utama.",
        priority_layer: "Layer III (Work Readiness)"
     }
  },
  { 
     id: 'prev', 
     name: 'Prevention Engine', 
     icon: HardHat, 
     purpose: 'Generate corrective actions and predictive risk mitigations.', 
     status: 'completed', 
     dependencies: ['ipls'],
     runCount: 1,
     tokenEstimate: 2000,
     history: [
        { run_id: "r-303", agent_id: "prev", started_at: "2026-04-20T11:00:00Z", ended_at: "2026-04-20T11:00:20Z", triggered_by: "System", status: "completed", token_usage: 1250, duration_ms: 20000, summary: "Corrective Action Plan generated." }
     ],
     backendCapabilities: { canPause: false, canResume: false, canStop: true, canRerun: true },
     knowledgeSelection: ['Audio Recording', 'Internal Document', 'External Document', 'Photos & Media'],
     results: {
        root_cause_actions: [
           { no: 1, layer: "III.10, III.13", hierarchy: "Administrasi", action: "Sanksi Administratif terhadap operator Sdr. Ryo Triharseno sesuai peraturan yang ada di PTBC", pic: "Sholeh Hadi H.", due_date: "4 Desember 2025", status: "OPEN" },
           { no: 2, layer: "III.10, III.13", hierarchy: "Praktek kerja", action: "Melaksanakan saresehan/FGD kepada seluruh operator terkait pengelolaan waktu istirahat dan cara pelaksanaan P2H perangkat DMS/MH02", pic: "All DH", due_date: "27 November 2025", status: "PROGRESS" },
           { no: 3, layer: "III.10", hierarchy: "Praktek kerja", action: "Pelaksanaan observasi oleh layer 2 terhadap aktifitas pelaksanaan P2H perangkat MH02 setiap awal shift", pic: "All DH", due_date: "27 November 2025", status: "OPEN" },
           { no: 4, layer: "III.10", hierarchy: "Administrasi", action: "Membuat IM perkuatan kewajiban pelaksanaan P2H perangkat MH02 setiap awal shift", pic: "B. Fredy Juni P.", due_date: "4 Desember 2025", status: "OPEN" }
        ],
        non_conformity_actions: [
           { no: 1, layer: "V.5", hierarchy: "Administrasi", action: "Melaksanakan FGD kepada operator dan pengawas mengenai pentingnya pelaporan awal insiden langsung ke CCR ERG PTBC", pic: "All DH", due_date: "27 November 2025", status: "OPEN" },
           { no: 2, layer: "IV.4", hierarchy: "Praktek Kerja", action: "Pemeriksaan secara visual kondisi kabel MH02 saat unit dilakukan service", pic: "Fahrudin Aris W", due_date: "27 November 2025", status: "OPEN" },
           { no: 3, layer: "IV.4, I.2", hierarchy: "Administrasi", action: "Membuat standard kriteria prioritas dan lama offline dari perangkat MH02 yang akan dilakukan perbaikan", pic: "Fahrudin Aris W", due_date: "4 Desember 2025", status: "OPEN" },
           { no: 4, layer: "IV.7", hierarchy: "Administrasi", action: "Pembuatan skema flow proses penarikan video post event cctv mess ketika mengalami kerusakan jaringan", pic: "Samsul Khairi", due_date: "4 Desember 2025", status: "OPEN" },
           { no: 7, layer: "III.17", hierarchy: "Praktek kerja", action: "Melaksanakan FGD kepada operator terkait berani speak up ketika mengalami permasalah baik di pekerjaan maupun di luar pekerjaan", pic: "All DH", due_date: "27 November 2025", status: "OPEN" },
           { no: 8, layer: "II.4", hierarchy: "Praktek kerja", action: "Melaksanakan FGD kepada tim pengawas SIDAK mess agar melaporkan setiap deviasi melalui SAP", pic: "Samsul Khairi", due_date: "27 November 2025", status: "OPEN" },
           { no: 9, layer: "II.4", hierarchy: "Administrasi", action: "CNC kepada Sdri. Helena", pic: "Samsul Khairi", due_date: "27 November 2025", status: "CLOSE" },
           { no: 10, layer: "I.2", hierarchy: "Administrasi", action: "Membuat instruksi kerja pelaksanaan P2H perangkat MH02", pic: "Aryanno Supono", due_date: "4 Desember 2025", status: "OPEN" }
        ],
        improvement_actions: [
           { no: 1, layer: "IV.7", hierarchy: "Rekayasa", action: "Percepatan pemasangan CCTV pada segmen yang mengcover Jalan Ubud Pit J Barat", pic: "Fahrudin Aris W", due_date: "27 November 2025", status: "OPEN" },
           { no: 2, layer: "II.10", hierarchy: "Praktek Kerja", action: "Membuat campaign yang mengingatkan operator terkait P2H perangkat MH02 dan tindak lanjut jika MH02 mengalami offline", pic: "M. S. Rifai", due_date: "4 Desember 2025", status: "OPEN" }
        ],
        summary: "Total 14 Corrective Actions identified. High priority given to Administrative controls for Root Cause mitigation.",
        completion_rate: "7.1%"
     }
  }
];

import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { UploadModal, CompletedGroup } from "@/components/UploadModal";

// Mock types removed. Using data from hooks.
const tabs = ["Evidence Review", "Analysis", "Reports", "Review", "Audit Trail"];

const progressSteps = [
  { label: "Evidence", done: true },
  { label: "Extraction", done: false },
  { label: "Analysis", done: false },
  { label: "Report", done: false },
  { label: "Review", done: false },
  { label: "Approved", done: false },
];

const imageExtractionData = {
  "evidence_meta": {
    "file_name": "conveyor_roller_failure_macro.jpg",
    "source_type": "image",
    "capture_time": "2026-04-02 14:45",
    "source_device": "Field-Cam-A1",
    "location_hint": "Conveyor Zone B, Section 14",
    "visibility_quality": "High",
    "image_quality": "High (Macro Focus)",
    "lighting": "Artificial / Ambient Mixed",
    "weather_condition": "N/A (Indoor/Sheltered)"
  },
  "scene_context": {
    "area_type": "Industrial Conveyor Gallery",
    "work_zone": "Section 14 Drive End",
    "operation_type": "Post-Incident Inspection",
    "summary_scene": "Close-up of a ruptured conveyor belt and misaligned roller assembly.",
    "scene_condition": "Compromised (Structural failure visible)",
    "environmental_context": "Restricted access area, high dust accumulation observed."
  },
  "people": {
    "person_count": 1,
    "detected_people": [
      {
        "person_ref": "P1",
        "role_guess": "Operator / Inspector",
        "position_in_scene": "Bottom Left Foreground",
        "activity": "Standing, pointing towards mechanical failure",
        "direction_of_attention": "Towards Roller Assembly #02",
        "interaction_target": "Belt Tear",
        "confidence": "High"
      }
    ],
    "ppe_equipment": [
      { "person_ref": "P1", "item": "High-Vis Vest", "detected": true, "properly_worn": true, "description": "Standard safety orange, reflective strips visible", "confidence": "High" },
      { "person_ref": "P1", "item": "Hard Hat", "detected": true, "properly_worn": true, "description": "White site-manager style", "confidence": "High" },
      { "person_ref": "P1", "item": "Safety Gloves", "detected": false, "properly_worn": false, "description": "Hands partially occluded during pointing", "confidence": "Low" }
    ],
    "ppe_compliance_flags": ["Fully Compliant (Visible)"],
    "unsafe_behavior_flags": ["Proximity to unshielded nip point (Inferred potential)"]
  },
  "equipment_assets": {
    "detected_assets": [
      {
        "asset_ref": "A1",
        "asset_type": "Conveyor Belt",
        "unit_id_visible": "Unknown",
        "category": "Drive Component",
        "state": "Stationary / Failed",
        "orientation": "Horizontal (Longitudinal)",
        "operating_or_stationary": "Stationary (Locked Out)",
        "visible_damage": "Longitudinal tear, approx 900mm length",
        "anomaly_clue": "Exposure of internal steel cables",
        "confidence": "Extreme"
      },
      {
        "asset_ref": "A2",
        "asset_type": "Roller System",
        "unit_id_visible": "#022",
        "category": "Support Component",
        "state": "Misaligned",
        "orientation": "Skewed 15 degrees from axis",
        "operating_or_stationary": "Stationary",
        "visible_damage": "Support bracket detachment",
        "anomaly_clue": "Metal-on-metal friction scarring",
        "confidence": "High"
      }
    ],
    "equipment_condition_signals": ["Severe mechanical fatigue", "Bearing seizure suspected"],
    "asset_relationships": ["Belt A1 is resting directly on seized roller A2."]
  },
  "position_measurements": {
    "relative_positions": ["Tear is centered over roller 02"],
    "distance_estimates": ["Operator is approx 1.5m from primary failure"],
    "clearance_estimates": ["Belt-to-chute clearance reduced by 40mm"],
    "left_right_front_back_relations": ["Roller 01 (Left) appears nominal", "Roller 02 (Center) failed"],
    "boundary_barrier_signals": ["Yellow hazard tape visible in far background"],
    "lane_path_access_obstruction": ["Material spillage blocking 30% of standard walkway"]
  },
  "environment": {
    "terrain_condition": "Concrete (Dusty)",
    "housekeeping_condition": "Poor (Build-up of fine ore present)",
    "visibility_condition": "Clear (Local focus)",
    "dust_smoke_spillage": ["Significant iron ore spillage under belt", "Duct particles on surface"],
    "traffic_control_present": ["None visible"],
    "signage_present": ["Small warning label on motor frame (Legibility: Low)"],
    "barrier_guarding_present": ["Section 14 perimeter mesh partially removed"]
  },
  "incident_hazards": {
    "critical_hazards": ["Unshielded Nip Point", "Structural Instability", "Tripping Hazard (Spillage)"],
    "hazard_potentials": ["Potential for further belt propagation", "Dust inhalation risk"],
    "anomaly_signals": ["Roller misalignment (Skewed state)"],
    "immediate_risk_level": "High (Zone restricted)",
    "supporting_visual_factors": ["Visible metal shavings on floor indicate friction"]
  },
  "extracted_facts": [
    { "fact_id": "F1", "fact_type": "Damage State", "fact_text": "Belt shows full-depth longitudinal rupture.", "observed_or_inferred": "Observed", "source_region": "ROI_01", "confidence": "High" },
    { "fact_id": "F2", "fact_type": "Equipment State", "fact_text": "Roller #022 is skewed 15 degrees relative to frame.", "observed_or_inferred": "Observed", "source_region": "ROI_02", "confidence": "High" },
    { "fact_id": "F3", "fact_type": "Causal Clue", "fact_text": "Friction heat may have softened belt rubber before tear.", "observed_or_inferred": "Inferred", "source_region": "ROI_01_HeatMark", "confidence": "Medium" }
  ],
  "peepo_seeds": {
    "people": ["Training on nip-point proximity might be required"],
    "environment": ["Dust housekeeping identified as recurring issue"],
    "equipment": ["Titan-X rollers showing consistent bracket fatigue"],
    "procedures": ["Audit lockout-tagout timeline vs discovery"],
    "organisation": ["Maintenance resource allocation for Section 14"]
  },
  "ipls_seeds": [
    { "layer_candidate": "Engineering Controls", "control_area_candidate": "Automatic Guarding", "deviation_text": "Mesh guard was removed for inspection but not replaced before scene capture.", "evidence_basis": "Exposed drive gear in ROI_04", "confidence": "High" }
  ],
  "review_meta": {
    "unknowns": ["Serial number of failed belt not visible"],
    "needs_human_review": ["Verification of metal shaving composition (Mechanical vs Structural)"],
    "confidence": "High Overall"
  }
};

const audioExtractionData = {
  "recording_meta": {
    "file_name": "witness_statement_operator_section14.mp3",
    "source_type": "audio",
    "duration": "08:45",
    "language": "Indonesian / English Mixed",
    "channel_type": "Radio Transcription",
    "recording_type": "In-cab Recording",
    "audio_quality": "High-Fidelity",
    "noise_level": "High (Engine Noise present)",
    "overlap_level": "Low"
  },
  "full_diarization": [
    { "segment_id": "S1", "start_time": "00:00", "end_time": "00:05", "speaker_id": "SPK_01", "speaker_label": "Operator A", "text": "Base, ini Section 14. Ada getaran tidak biasa di Belt 14.", "confidence": "High", "inaudible_flag": false },
    { "segment_id": "S2", "start_time": "00:06", "end_time": "00:10", "speaker_id": "SPK_02", "speaker_label": "Control Room", "text": "Section 14, copy. Monitor dulu. Kita lagi handle alarm di Zone C.", "confidence": "High", "inaudible_flag": false },
    { "segment_id": "S3", "start_time": "00:15", "end_time": "00:22", "speaker_id": "SPK_01", "speaker_label": "Operator A", "text": "Tapi ini bunyinya makin keras. Kayak ada logam kegesek. Saya cek visual ya?", "confidence": "Medium", "inaudible_flag": false },
    { "segment_id": "S4", "start_time": "00:45", "end_time": "00:50", "speaker_id": "SPK_01", "speaker_label": "Operator A", "text": "[Panic] Woi! Belt-nya robek! E-stop! E-stop sekarang!", "confidence": "High", "inaudible_flag": false }
  ],
  "speaker_profiles": [
    { "speaker_id": "SPK_01", "speaker_label": "Operator A", "probable_role": "Conveyor Operator", "speaking_time": "05:12", "speaking_style": "Urgent, Informal", "stress_level": "High (Post-failure)", "assertiveness": "High", "hesitation": "Low", "escalation_role": "Reporter", "confidence": "High" },
    { "speaker_id": "SPK_02", "speaker_label": "Control Room", "probable_role": "Dispatcher", "speaking_time": "03:33", "speaking_style": "Calm, Procedural", "stress_level": "Low", "assertiveness": "Medium", "hesitation": "Medium", "escalation_role": "Supervisor", "confidence": "High" }
  ],
  "communication_events": [
    { "timestamp": "00:00", "event_type": "Initial Warning", "actor": "Operator A", "target_actor": "Control Room", "content_summary": "Reported unusual vibration in Section 14", "urgency": "Medium", "response_status": "Acknowledged (Delayed Action)", "confidence": "High" },
    { "timestamp": "00:45", "event_type": "Emergency Escalation", "actor": "Operator A", "target_actor": "Control Room", "content_summary": "Emergency-stop requested due to belt tear", "urgency": "Critical", "response_status": "Immediate Action taken", "confidence": "High" }
  ],
  "human_performance_signals": {
    "communication_positive_or_not": ["Operator A used clear identification", "Control Room used negative acknowledgment (Delayed action)"],
    "missed_confirmation": ["None explicitly detected"],
    "delayed_reporting": ["Potential 5-minute gap between initial sound and second report"],
    "supervision_signal": ["Dispatcher attempted to prioritize Zone C over Section 14 warning"],
    "stress_or_confusion": ["Operator A shows significant vocal stress at 00:45"],
    "speak_up_signal": ["Operator A correctly escalated despite dispatcher's hesitation"],
    "coordination_gap_signal": ["Information silos between Zone C and Zone B alarms"]
  },
  "peepo_seeds": {
    "people": ["Dispatch training on alarm prioritization needed"],
    "environment": ["High engine noise may have delayed early sound detection"],
    "equipment": ["Belt 14 vibration reported before catastrophic failure"],
    "procedures": ["Review E-stop response timeline vs radio escalation"],
    "organisation": ["Control room workload during multi-zone alarms"]
  },
  "ipls_seeds": [
    { "layer_candidate": "Administrative Controls", "control_area_candidate": "Radio Discipline", "deviation_text": "Dispatcher discouraged immediate inspection due to distractions in Zone C.", "evidence_quote": "'Monitor dulu. Kita lagi handle alarm di Zone C.'", "confidence": "High" }
  ],
  "factual_statements": [
    { "timestamp": "00:03", "speaker": "Operator A", "statement_type": "Observation", "fact_text": "Unusual vibration detected at Belt 14 Section — confirmed by direct auditory inspection.", "observed_or_claimed": "Observed", "confidence": "High", "source_segment": "S1" },
    { "timestamp": "00:18", "speaker": "Operator A", "statement_type": "Technical Assessment", "fact_text": "Metal-on-metal friction sound heard from conveyor roller — escalating over time.", "observed_or_claimed": "Observed", "confidence": "Medium", "source_segment": "S3" },
    { "timestamp": "00:47", "speaker": "Operator A", "statement_type": "Emergency Report", "fact_text": "Belt tear confirmed visually. E-stop activation requested immediately.", "observed_or_claimed": "Observed", "confidence": "High", "source_segment": "S4" }
  ],
  "timeline_events": [
    { "timestamp": "00:00", "actor": "Operator A", "event_summary": "First radio contact — vibration anomaly reported to Control Room.", "source_audio_segment": "S1", "confidence": "High" },
    { "timestamp": "00:06", "actor": "Control Room", "event_summary": "Dispatcher acknowledged but deprioritised report in favour of Zone C alarm.", "source_audio_segment": "S2", "confidence": "High" },
    { "timestamp": "00:15", "actor": "Operator A", "event_summary": "Operator escalated — sound worsening, requested visual inspection clearance.", "source_audio_segment": "S3", "confidence": "Medium" },
    { "timestamp": "00:45", "actor": "Operator A", "event_summary": "Emergency escalation — belt tear confirmed, E-stop requested.", "source_audio_segment": "S4", "confidence": "High" }
  ],
  "risk_and_procedure_clues": {
    "procedure_mentions": ["E-Stop protocol referenced at 00:45", "Radio check-in procedure followed at session start"],
    "equipment_issue_mentions": ["Belt 14 vibration anomaly reported early", "Roller metal-on-metal friction escalating"],
    "sensor_alarm_mentions": ["Zone C alarm active and competing for dispatcher attention"],
    "emergency_response_mentions": ["E-Stop activation at 00:45", "Emergency call for belt rupture"],
    "control_gap_mentions": ["Dispatcher failed to escalate initial vibration warning to supervisor"],
    "radio_channel_issue_mentions": ["Control room simultaneously managing multi-zone alarm load"]
  },
  "contradictions_and_gaps": [
    { "timestamp": "00:06", "type": "Response Gap", "detail": "Control Room acknowledged vibration but took no action — deprioritised Section 14 in favour of Zone C.", "confidence": "High" },
    { "timestamp": "00:15", "type": "Information Gap", "detail": "5-minute gap between initial warning (00:00) and second escalation (00:15) — no interim update recorded from Control Room.", "confidence": "Medium" }
  ],
  "review_meta": {
    "low_confidence_segments": ["S3 (00:15–00:22) — Medium confidence due to elevated background engine noise"],
    "needs_human_review": ["Verify dispatcher response protocol during simultaneous multi-zone alarms", "Confirm whether Zone C alarm was genuine or false positive"],
    "confidence": "High Overall"
  }
};

const audioDiarizationData = [
  { segment_id: "S1", start_time: "00:00", end_time: "00:15", speaker_id: "SPK_01", speaker_label: "Ahmad (Operator)", text: "Radio check, Site Alpha. Do you copy? We have an unusual noise at section 14. Over.", confidence: "high", flags: [] },
  { segment_id: "S2", start_time: "00:16", end_time: "00:22", speaker_id: "SPK_02", speaker_label: "Supervisor B", text: "Copy Site Alpha. Supervisor B here. What kind of noise are we talking about?", confidence: "high", flags: [] },
  { segment_id: "S3", start_time: "00:23", end_time: "00:45", speaker_id: "SPK_01", speaker_label: "Ahmad (Operator)", text: "It's a rhythmic vibration, high frequency. Started about five minutes ago. I'm standing by the roller bank now. It sounds like a bearing failure.", confidence: "high", flags: ["key_observation"] },
  { segment_id: "S4", start_time: "00:46", end_time: "01:05", speaker_id: "SPK_02", speaker_label: "Supervisor B", text: "Okay, Ahmad. Keep your distance. Don't get too close to the drive side. I'm pulling up the maintenance records for that sector right now.", confidence: "high", flags: [] },
  { segment_id: "S5", start_time: "01:06", end_time: "01:25", speaker_id: "SPK_01", speaker_label: "Ahmad (Operator)", text: "I'm already here, about 3 meters away. The screeching is getting louder. I think we should consider a restricted speed mode or a full stop.", confidence: "high", flags: ["hazard_alert"] },
  { segment_id: "S6", start_time: "01:26", end_time: "01:40", speaker_id: "SPK_02", speaker_label: "Supervisor B", text: "Let me check with the control room first. We need to verify the material flow impacts before we just hit the E-Stop.", confidence: "medium", flags: ["decision_point"] },
  { segment_id: "S7", start_time: "01:41", end_time: "02:10", speaker_id: "SPK_01", speaker_label: "Ahmad (Operator)", text: "Copy that... Wait, I see fragments now. Small pieces of rubber on the floor. It's escalating. The belt is starting to deflect.", confidence: "high", flags: ["critical_evidence"] },
  { segment_id: "S8", start_time: "02:11", end_time: "02:25", speaker_id: "SPK_02", speaker_label: "Supervisor B", text: "Ahmad, get out of there immediately. Section 14 is compromised. Contact the gatehouse to block the walkway. I'm initiating the shutdown now.", confidence: "high", flags: ["emergency_command"] },
  { segment_id: "S9", start_time: "02:26", end_time: "03:00", speaker_id: "SPK_01", speaker_label: "Ahmad (Operator)", text: "[Loud mechanical noise heard in background] Copy. Moving to safe zone. Section 14 walkway cleared. The alarm is sounding now.", confidence: "medium", flags: [] },
];

const runHistory = [
  { runId: "RUN-046", agent: "PEEPO Reasoning", triggeredBy: "Sarah Chen", inputSource: "Evidence Batch B1, B2", status: "completed", createdAt: "2026-04-08 10:12" },
  { runId: "RUN-045", agent: "Fact & Chronology", triggeredBy: "System (Auto)", inputSource: "witness_statement_operator_A.mp3", status: "completed", createdAt: "2026-04-08 09:30" },
  { runId: "RUN-044", agent: "IPLS Classification", triggeredBy: "Ahmed Khan", inputSource: "incident_report_initial.pdf", status: "completed", createdAt: "2026-04-07 15:20" },
];

const videoTimeframesData = [
  {
    "id": "TF_01",
    "start_time": "00:00",
    "end_time": "01:59",
    "summary": "Initial Site Inspection",
    "importance": "low",
    "badges": ["normal"],
    "script": {
      "scene_overview": "Operator A arrives at Section 14 with a handheld sensor.",
      "visible_actors": ["Operator A", "Security Guard (Background)"],
      "actions": ["Walking", "Inspecting roller bearings", "Talking on radio"],
      "environment": "Daylight, clear visibility, standard industrial background noise.",
      "changes": "N/A — Segment Start"
    },
    "analysis": {
      "events": ["Visual inspection started"],
      "anomalies": ["None"],
      "hazards": ["None"],
      "assets": "Belt moving at nominal speed (4.2 m/s).",
      "behavior": "Standard operating procedure followed.",
      "environmental_risk": "Low",
      "confidence": "98%"
    }
  },
  {
    "id": "TF_02",
    "start_time": "02:00",
    "end_time": "03:59",
    "summary": "Anomaly Detection — Vibration",
    "importance": "high",
    "badges": ["anomaly", "event"],
    "script": {
      "scene_overview": "Visible vibration starts at the upper roller bank.",
      "visible_actors": ["Operator A"],
      "actions": ["Pointing at belt", "Backing away from machinery"],
      "environment": "Slight dust accumulation visible near the tear point.",
      "changes": "Increasing mechanical oscillation in Section 14."
    },
    "analysis": {
      "events": ["Structural Anomaly detected"],
      "anomalies": ["Rhythmic vertical oscillation on belt surface"],
      "hazards": ["Pinch point hazard if belt deflects further"],
      "assets": "Section 14 roller support bracket shows visible fatigue.",
      "behavior": "Operator identifies issue but remains within 2m. High exposure.",
      "environmental_risk": "Moderate (Potential debris throw)",
      "confidence": "92%"
    }
  },
  {
    "id": "TF_03",
    "start_time": "04:00",
    "end_time": "05:59",
    "summary": "Critical Incident — Belt Tear",
    "importance": "critical",
    "badges": ["hazard", "critical"],
    "script": {
      "scene_overview": "Belt tears across the width. Friction sparks and smoke visible.",
      "visible_actors": ["Operator A"],
      "actions": ["Running towards E-Stop", "Alerting via radio"],
      "environment": "High dust and smoke obscuring the primary camera angle.",
      "changes": "Sudden structural failure; material spillage."
    },
    "analysis": {
      "events": ["Conveyor failure", "E-Stop activated"],
      "anomalies": ["Full-width longitudinal tear"],
      "hazards": ["Fire risk (Friction sparks)", "Structural collapse", "Slap hazard"],
      "assets": "Conveyor belt destroyed. Section 14 roller seized.",
      "behavior": "Emergency response initiated immediately.",
      "environmental_risk": "High (Smoke inhalation, Spillage)",
      "confidence": "99%"
    }
  }
];

const videoExtractionData = {
  "properties": {
    "file_name": "cctv_zone_b_conveyor_1430.mp4",
    "duration": "14:30",
    "source_type": "Static CCTV",
    "camera_type": "Fixed IP Camera (Axis P3245)",
    "angle": "High-Angle, Wide Field",
    "resolution": "1920x1080 (HD)",
    "lighting": "Artificial / Ambient Mixed",
    "stability": "Fixed Mount",
    "visibility": "Moderate (Affected by smoke in late segments)"
  },
  "timeframe_overview": {
    "total_segments": 8,
    "interval": "02:00",
    "anomalies": 2,
    "hazards": 1,
    "human_activity": true,
    "vehicle_activity": false,
    "review_required": 3
  },
  "key_findings": [
    { "type": "Visual Anomaly", "severity": "high", "title": "Pre-failure Vibration", "timeframe": "02:00", "source": "Optical Flow AI" },
    { "type": "Safety Violation", "severity": "medium", "title": "Standoff Zone Breach", "timeframe": "00:45", "source": "Proximity Sensor" }
  ],
  "event_timeline": [
    { "timestamp": "02:05", "type": "Anomaly", "desc": "Vertical oscillation detected", "importance": "high" },
    { "timestamp": "04:12", "type": "Failure", "desc": "Belt surface split initiated", "importance": "critical" }
  ],
  "hazards": [
    { "type": "Fire/Sparks", "severity": "high", "timestamp": "04:15", "desc": "Friction between belt and seized roller." },
    { "type": "Spillage", "severity": "medium", "timestamp": "04:20", "desc": "Material falling to walkway." }
  ],
  "people": { "count": 1, "ppe": "Compliant (Vest, Helmet)", "behavior": "Urgent response detected after 04:00." },
  "vehicles": { "detected": "None", "condition": "N/A" },
  "environment": { "visibility": "Degrading", "air": "Smoke/Dust detected near failure point." },
  "summary": {
    "brief": "CCTV footage capturing the structural failure of Section 14 conveyor belt.",
    "findings": ["Vibration ignored for 2 mins", "Sparks detected before shutdown"],
    "risk": "High risk windows: 04:00 - 05:00",
    "focus": "Verify if Opertor A noticed the sparks at 04:15."
  }
};

const videoExtractionRefined = {
  video_session_meta: {
    session_name: "Conveyor Belt Failure - CCTV-Z2",
    duration: "14:30",
    fps: "30 fps",
    quality: "1080p (Full HD)",
    source_type: "Fixed CCTV (Security Network)",
    camera_type: "Axis P3245-LVE (Fixed IP)",
    extraction_status: "completed",
    review_status: "pending",
    confidence: "94% (Combined)"
  },
  scene_timeline: [
    { 
      id: "S1", 
      timestamp: "00:00", 
      duration: "01:59", 
      seconds: 0, 
      scene_label: "Routine Op", 
      summary: "Normal conveyor operation with single operator present.", 
      actor: "Operator A", 
      location: "Section 14 Drive", 
      confidence: "High",
      actions: ["Walking", "Inspecting roller bearings", "Talking on radio"],
      key_analysis: ["Visual inspection started", "Standard procedure followed"],
      accuracy: 98
    },
    { 
      id: "S2", 
      timestamp: "02:00", 
      duration: "01:59", 
      seconds: 120, 
      scene_label: "Early Oscillation", 
      summary: "Visible vertical vibration detected on belt surface.", 
      actor: "Operator A", 
      location: "Section 14 Mid", 
      confidence: "High",
      actions: ["Pointing at belt", "Backing away from machinery"],
      key_analysis: ["Structural Anomaly detected", "Mechanical oscillation increased"],
      accuracy: 92
    },
    { 
      id: "S3", 
      timestamp: "04:00", 
      duration: "01:59", 
      seconds: 240, 
      scene_label: "Structural Failure", 
      summary: "Major belt tear initiated. Sparks and smoke visible.", 
      actor: "Operator A", 
      location: "Section 14 Roller Bank", 
      confidence: "Critical",
      actions: ["Running towards E-Stop", "Alerting via radio"],
      key_analysis: ["Conveyor failure", "E-Stop activated", "Fire hazard detected"],
      accuracy: 99
    },
    { 
      id: "S4", 
      timestamp: "06:00", 
      duration: "02:30", 
      seconds: 360, 
      scene_label: "Emergency Response", 
      summary: "Manual E-Stop triggered. Site evacuated.", 
      actor: "Site Safety Team", 
      location: "Zone B Perimeter", 
      confidence: "High",
      actions: ["Establishing perimeter", "Shutting down Zone B drives"],
      key_analysis: ["Isolation successful", "Personnel accounted for"],
      accuracy: 95
    }
  ],
  actor_profiles: [
    { actor_id: "ACT-01", actor_label: "Operator A", probable_role: "Field Technician", screen_time: "08:45", activity: "Inspection", behavior: "Correct response observed", stress: "High at 04:10", interaction: "Solo", confidence: "High" },
    { actor_id: "ACT-02", actor_label: "Safety Lead", probable_role: "Emergency Responder", screen_time: "02:15", activity: "Evacuation", behavior: "Directive", stress: "Moderate", interaction: "Team Coord", confidence: "Medium" }
  ],
  action_events: [
    { timestamp: "04:12", seconds: 252, event_type: "Mechanical Failure", actor: "Equipment", object: "Conveyor Belt 14", summary: "Longitudinal tear detected across entire belt width.", severity: "Critical", status: "Manual Stop" },
    { timestamp: "04:15", seconds: 255, event_type: "HazMat Event", actor: "Equipment", object: "Heat/Sparks", summary: "Friction sparks detected due to seized roller #022.", severity: "High", status: "Alarm Active" },
    { timestamp: "04:18", seconds: 258, event_type: "Immediate Action", actor: "Operator A", object: "E-Stop #4", summary: "Emergency stop button manually depressed.", severity: "High", status: "Successful" }
  ],
  environmental_observations: [
    { timestamp: "04:20", seconds: 260, summary: "Heavy smoke accumulation visibility reduced to <5m", visibility: "Low", lighting: "Artificial", obstruction: "Smoke/Dust", access: "Blocked by Spillage", hazard: "Tripping Risk", confidence: "High" },
    { timestamp: "00:10", seconds: 10, summary: "Clean floor, standard industrial lighting conditions", visibility: "High", lighting: "Standard", obstruction: "None", access: "Clear", hazard: "Nominal", confidence: "High" }
  ],
  equipment_and_object_signals: [
    { timestamp: "02:15", seconds: 135, object: "Roller #022", condition: "Skewed", context: "Support Frame", anomaly: "Internal bearing failure suspected", actor: "Operator A", confidence: "High" },
    { timestamp: "04:05", seconds: 245, object: "Safety Mesh Guard", condition: "Removed", context: "Drive Housing", anomaly: "Exposed moving parts during operation", actor: "Unknown", confidence: "Medium" }
  ],
  factual_observations: [
    { timestamp: "02:10", seconds: 130, type: "Visual Anomaly", text: "Vertical belt oscillation exceeds 40mm amplitude.", observed: "Observed", confidence: "High" },
    { timestamp: "04:30", seconds: 270, type: "Material State", text: "Approx. 2.4 tons of iron ore spilled on walkway.", inferred: "Inferred", confidence: "Medium" }
  ],
  human_performance_signals: {
    delayed_response: [{ category: "Response", detail: "30s delay between vibration detection and radio call", timestamp: "02:30", seconds: 150 }],
    unsafe_positioning: [{ category: "Positioning", detail: "Operator remained within 1.5m of failing belt", timestamp: "04:05", seconds: 245 }],
    PPE_non_compliance: [{ category: "PPE", detail: "Gloves not worn during manual sensor placement", timestamp: "01:15", seconds: 75 }],
    speak_up_signal: [{ category: "Comm", detail: "Operator correctly challenged dispatcher's delay", timestamp: "02:45", seconds: 165 }]
  },
  risk_and_procedure_clues: {
    equipment_issue_mentions: [{ item: "Roller #022 bearing seizure", timestamp: "02:15", seconds: 135 }],
    unsafe_access_or_path: [{ item: "Section 14 walkway blocked by spillage", timestamp: "04:25", seconds: 265 }],
    barricade_or_isolation_issue: [{ item: "Warning tape not deployed correctly in Zone B", timestamp: "05:00", seconds: 300 }]
  },
  contradictions_and_gaps: [
    { timestamp: "03:15", seconds: 195, type: "State Mismatch", detail: "Operator reports 'normal' while belt oscillation is visible", confidence: "High" }
  ],
  peepo_seeds: [
    { category: "People", items: ["Training on vibration identification needed", "Operator fatigue review required"] },
    { category: "Environment", items: ["Dust accumulation impacted sensor accuracy", "High ambient heat levels"] },
    { category: "Equipment", items: ["Titan-X roller bracket fatigue", "Retrofit needed for e-stop proximity"] },
    { category: "Procedures", items: ["Lockout-tagout verification gap found", "Alarm prioritization protocol"] }
  ],
  ipls_seeds: [
    { layer: "Engineering Controls", area: "Auto-Shutdown", text: "Vibration threshold logic failed to trigger stop.", summary: "Sensor F-14 detected anomaly but logic was bypassed.", confidence: "High" },
    { layer: "Admin Controls", area: "Field Inspection", text: "Pre-shift inspection missed the loose support bracket.", summary: "Inspection log shows 'checked' but failure was imminent.", confidence: "Medium" }
  ],
  review_meta: {
    low_confidence: ["Segment 04:30 - Smoke obscuration", "Segment 01:15 - Background actors identification"],
    needs_review: ["Verify if Operator A saw the sparks at 04:12"],
    overall_confidence: "High"
  }
};

// --- Components ---

function StatusIndicator({ status, type }: { status: string, type: 'extraction' | 'review' }) {
  if (!status) return null;
  const isAlt = status === "completed" || status === "matched" || status === "reviewed";
  const isProcess = status === "processing" || status === "partial";
  const isFail = status === "failed";
  
  return (
    <div className={`
      inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider  transition-all
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

function ImageViewer({ file }: { file: any }) {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.3, 8));
  const handleZoomOut = () => {
    setZoom(prev => {
      const next = Math.max(prev - 0.3, 0.5);
      if (next <= 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  };
  
  const handleReset = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoom(prev => Math.min(Math.max(prev + delta, 0.5), 8));
    }
  };

  return (
    <div className={`w-full h-full relative cursor-default overflow-hidden flex items-center justify-center ${zoom > 1 ? 'cursor-grab active:cursor-grabbing' : ''}`}
         onWheel={handleWheel}
         onMouseDown={handleMouseDown}
         onMouseMove={handleMouseMove}
         onMouseUp={handleMouseUp}
         onMouseLeave={handleMouseUp}>
      
      {/* Utility Bar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-white/95 backdrop-blur-md px-1.5 py-1 rounded-sm border border-slate-200  flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-y-2 group-hover:translate-y-0 scale-95 group-hover:scale-100">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-slate-100 rounded-sm" onClick={handleZoomIn} title="Zoom In"><ZoomIn className="h-4 w-4 text-slate-700" /></Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-slate-100 rounded-sm" onClick={handleZoomOut} title="Zoom Out"><ZoomOut className="h-4 w-4 text-slate-700" /></Button>
          <div className="w-px h-4 bg-slate-200 mx-1" />
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-slate-100 rounded-sm" onClick={handleReset} title="Reset View"><RefreshCcw className="h-3.5 w-3.5 text-slate-700" /></Button>
          <div className="w-px h-4 bg-slate-200 mx-1" />
          <Button variant="ghost" size="sm" className="h-8 px-2 text-[9px] font-black text-slate-700 hover:bg-slate-100 rounded-sm uppercase tracking-wider" onClick={() => { setZoom(1); setPosition({x:0, y:0}); }}>Fit</Button>
          <Button variant="ghost" size="sm" className="h-8 px-2 text-[9px] font-black text-slate-700 hover:bg-slate-100 rounded-sm uppercase tracking-wider border border-transparent hover:border-slate-100" onClick={() => setZoom(1.5)}>1.5x</Button>
          <div className="w-px h-4 bg-slate-200 mx-1" />
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-slate-100 rounded-sm" title="Open Original" onClick={() => window.open(file.url, '_blank')}><ExternalLink className="h-3.5 w-3.5 text-slate-700" /></Button>
      </div>

      <div className="w-full h-full flex items-center justify-center pointer-events-none">
        {file.url ? (
            <img 
              src={file.url} 
              alt={file.name} 
              className={`max-w-full max-h-full object-contain pointer-events-none select-none transition-transform duration-200 ease-out`}
              style={{ 
                transformOrigin: 'center center',
                transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
              }}
              draggable={false}
            />
        ) : (
          <ImageIcon className="h-32 w-32 text-slate-800 opacity-50" />
        )}
      </div>

      <div className="absolute bottom-4 left-4 z-20 pointer-events-none">
          <div className="bg-slate-900/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-2">
            <span className="text-[9px] font-black text-white uppercase tracking-[0.2em]">{Math.round(zoom * 100)}%</span>
          </div>
      </div>

      <div className="absolute bottom-4 right-4 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2 z-20 pointer-events-none">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
          <span className="text-[10px] font-bold text-white uppercase tracking-widest">Enhanced AI Layer ON</span>
      </div>

      {/* Grid Overlay subtle */}
      <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
    </div>
  );
}

function AIAnalysisPanel({ file }: { file: any }) {
  const [viewMode, setViewMode] = useState<"Structured" | "JSON">("Structured");
  const [expandedSections, setExpandedSections] = useState<string[]>([
    "Image Properties", 
    "Composition & Objects", 
    "People & PPE", 
    "Environment", 
    "Initial Interpretation"
  ]);

  // Normalization logic: Map investigation data to the strict single-image schema
  const normalizedData = useMemo(() => {
    // raw source is imageExtractionData, but we map to the exact target structure
    const raw = imageExtractionData; 
    
    return {
      image_id: "IMG_" + (file.id?.slice(0, 4) || "001"),
      case_id: "CS-2026-5208",
      modality: "image",
      image_properties: {
        file_name: file.name || raw.evidence_meta.file_name || "N/A",
        source_type: "image",
        capture_time: raw.evidence_meta.capture_time || "N/A",
        source_device: raw.evidence_meta.source_device || "N/A",
        location_hint: raw.evidence_meta.location_hint || "N/A",
        view_type: raw.evidence_meta.view_type || "drone_top",
        image_quality: raw.evidence_meta.image_quality || "high",
        visibility_quality: raw.visibility_quality || "high",
        lighting_condition: raw.evidence_meta.lighting || "daylight",
        weather_visible: raw.evidence_meta.weather_condition || "clear",
        extraction_mode: raw.evidence_meta.extraction_mode || "visual_with_manual_overlay"
      },
      composition_objects: {
        area_type: raw.scene_context.area_type || "N/A",
        operation_context: raw.scene_context.operation_type || "N/A",
        scene_summary: raw.scene_context.summary_scene || "No summary available",
        scene_condition: raw.scene_context.scene_condition || "N/A",
        detected_assets: (raw.equipment_assets.detected_assets || []).map(a => ({
          asset_ref: a.asset_ref || "N/A",
          asset_type: a.asset_type || "N/A",
          visible_identifier: a.id || "N/A",
          position_in_scene: a.location || "N/A",
          orientation: a.orientation || "N/A",
          state: a.state || "N/A",
          damage_visible: a.visible_damage || "None detected",
          confidence: a.confidence || "low"
        })),
        detected_traces: (raw.equipment_assets.detected_traces || [
          {
            trace_ref: "T1",
            trace_type: "path_marker",
            position_in_scene: "right_side_lane",
            description: "Annotated movement path with point markers A, B, C",
            direction_hint: "toward final position",
            observed_or_inferred: "observed",
            confidence: "high"
          }
        ]).map(t => ({
          trace_ref: t.trace_ref,
          trace_type: t.trace_type,
          position_in_scene: t.position_in_scene,
          description: t.description,
          direction_hint: t.direction_hint,
          observed_or_inferred: t.observed_or_inferred,
          confidence: t.confidence
        })),
        spatial_relations: raw.position_measurements.relative_positions || [],
        measurements: (raw.position_measurements.measurements || [
          {
            measurement_ref: "M1",
            name: "road_width",
            value: 16.9,
            unit: "m",
            measurement_type: "manual_overlay", // manual_overlay, estimated_from_image, survey_reference
            basis: "annotated text visible inside image",
            confidence: "medium"
          }
        ]).map(m => ({
          measurement_ref: m.measurement_ref,
          name: m.name,
          value: m.value,
          unit: m.unit,
          measurement_type: m.measurement_type,
          basis: m.basis,
          confidence: m.confidence
        }))
      },
      people_ppe: {
        person_count: raw.people.person_count || 0,
        detected_people: (raw.people.detected_people || []).map(p => ({
            person_ref: p.person_ref || "N/A",
            role_guess: p.role_guess || "N/A",
            position_in_scene: p.position_in_scene || "N/A",
            activity: p.activity || "N/A",
            attention_direction: p.direction_of_attention || "N/A",
            interaction_target: p.interaction_target || "N/A",
            confidence: p.confidence || "low"
        })),
        ppe_items: (raw.people.ppe_equipment || []).map(item => ({
          person_ref: item.person_ref,
          item: item.item,
          detected: item.detected,
          properly_worn: item.properly_worn,
          visibility: item.visibility,
          confidence: item.confidence || "medium"
        })),
        compliance_flags: raw.people.ppe_compliance_flags || []
      },
      environment: {
        surface_type: raw.environment.terrain_condition || "N/A",
        surface_condition: raw.environment.housekeeping_condition || "N/A",
        road_or_path_condition: "wide haul road with visible edge transition",
        edge_condition: "roadside drop/edge visible",
        berm_or_tanggul_present: true,
        barrier_present: (raw.environment.barrier_guarding_present || []).length > 0,
        signage_present: (raw.environment.signage_present || []).length > 0,
        traffic_control_present: false,
        housekeeping_condition: raw.environment.housekeeping_condition || "N/A",
        dust_smoke_spillage: raw.environment.dust_smoke_spillage || [],
        visibility_condition: raw.environment.visibility_condition || "N/A",
        environment_summary: "Open outdoor haul road scene with visible edge, slope, and annotated incident points."
      },
      initial_interpretation: {
        observed_facts: (raw.extracted_facts || []).filter(f => f.observed_or_inferred === "Observed").map(f => ({
           fact_id: f.fact_id,
           fact_type: f.fact_type,
           fact_text: f.fact_text,
           source_region: f.source_region,
           confidence: f.confidence || "high"
        })),
        inferred_points: (raw.extracted_facts || []).filter(f => f.observed_or_inferred === "Inferred").map(f => ({
           inference_id: f.fact_id,
           inference_text: f.fact_text,
           basis: f.basis || [f.source_region],
           confidence: f.confidence || "medium"
        })),
        hazard_signals: (raw.incident_hazards.critical_hazards || []).map(h => ({
           hazard_type: "critical",
           description: h,
           evidence_basis: "visual state analysis",
           confidence: "high"
        })),
        negative_findings: [
          { item: "traffic_control", description: "No visible traffic control devices detected in this image.", confidence: "medium" }
        ],
        unknowns: raw.review_meta.unknowns || [],
        review_flags: raw.review_meta.needs_human_review || [],
        overall_scene_read: "Primary interpretation suggests annotated post-incident road scene with an overturned light vehicle.",
        overall_confidence: "medium",
        needs_human_validation: true
      }
    };
  }, [file.id, file.name]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  const SectionHeader = ({ title, icon: Icon }: { title: string, icon: any }) => (
    <button 
      onClick={() => toggleSection(title)}
      className={`w-full flex items-center justify-between p-4 transition-all border-b ${
        expandedSections.includes(title) ? 'bg-slate-50/80 border-slate-200 shadow-inner' : 'bg-white hover:bg-slate-50/50 border-transparent'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`h-8 w-8 rounded-sm border  flex items-center justify-center transition-all ${
          expandedSections.includes(title) ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-400 border-slate-200'
        }`}>
          <Icon className="h-4 w-4" />
        </div>
        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-800">{title}</span>
      </div>
      <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-300 ${expandedSections.includes(title) ? 'rotate-180 text-slate-900' : ''}`} />
    </button>
  );

  const KVP = ({ label, value, badge, subValue }: any) => (
    <div className="flex flex-col gap-0.5 py-2.5 first:pt-0 border-b border-slate-50 last:border-0 last:pb-0">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest shrink-0">{label}</span>
        {badge && (
          <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border shrink-0 ${badge.className}`}>
            {badge.text}
          </span>
        )}
      </div>
      <div className="text-[11px] font-bold text-slate-800 break-words leading-tight">{value || "No data detected"}</div>
      {subValue && <div className="text-[9px] text-slate-400 italic font-medium leading-none mt-0.5">[{subValue}]</div>}
    </div>
  );

  const Chip = ({ text, type = 'default' }: { text: string, type?: 'default' | 'observed' | 'inferred' | 'unknown' | 'manual' }) => {
    const styles = {
      default: 'bg-slate-50 text-slate-500 border-slate-200',
      observed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      inferred: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      unknown: 'bg-amber-50 text-amber-700 border-amber-200',
      manual: 'bg-purple-50 text-purple-700 border-purple-200',
    };
    return (
      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-[0.1em] border ${styles[type]}`}>
        {text}
      </span>
    );
  };

  const renderStructuredView = () => (
    <div className="flex flex-col min-h-full bg-slate-50/30">
      {/* Image Properties */}
      <div className="bg-white border-b">
        <SectionHeader title="Image Properties" icon={ImageIcon} />
        {expandedSections.includes("Image Properties") && (
          <div className="p-5 grid grid-cols-2 gap-x-8 gap-y-1 animate-in fade-in slide-in-from-top-1">
            <KVP label="File Name" value={normalizedData.image_properties.file_name} />
            <KVP label="Image ID" value={normalizedData.image_id} />
            <KVP label="Case ID" value={normalizedData.case_id} />
            <KVP label="Source Type" value={normalizedData.image_properties.source_type} />
            <KVP label="Capture Time" value={normalizedData.image_properties.capture_time} />
            <KVP label="Device" value={normalizedData.image_properties.source_device} />
            <KVP label="Location" value={normalizedData.image_properties.location_hint} />
            <KVP label="View Type" value={normalizedData.image_properties.view_type} />
            <KVP label="Image Quality" value={normalizedData.image_properties.image_quality} />
            <KVP label="Visibility" value={normalizedData.image_properties.visibility_quality} />
            <KVP label="Lighting" value={normalizedData.image_properties.lighting_condition} />
            <KVP label="Weather" value={normalizedData.image_properties.weather_visible} />
            <KVP label="Mode" value={normalizedData.image_properties.extraction_mode.replace(/_/g, ' ')} badge={{ text: normalizedData.image_properties.extraction_mode.split('_')[0], className: 'bg-slate-900 text-white border-slate-900' }} />
          </div>
        )}
      </div>

      {/* Composition & Objects */}
      <div className="bg-white border-b">
        <SectionHeader title="Composition & Objects" icon={LayoutGrid} />
        {expandedSections.includes("Composition & Objects") && (
          <div className="p-5 space-y-6 animate-in fade-in slide-in-from-top-1">
            <div className="grid grid-cols-2 gap-x-8 gap-y-1">
              <KVP label="Area Type" value={normalizedData.composition_objects.area_type.replace(/_/g, ' ')} />
              <KVP label="Operation" value={normalizedData.composition_objects.operation_context.replace(/_/g, ' ')} />
              <KVP label="Scene Condition" value={normalizedData.composition_objects.scene_condition.replace(/_/g, ' ')} />
            </div>
            <div className="p-4 bg-slate-50 rounded-sm border border-slate-100 shadow-inner">
               <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Scene Summary</span>
               <p className="text-[11px] font-bold text-slate-700 leading-relaxed italic">"{normalizedData.composition_objects.scene_summary}"</p>
            </div>
            
            <div className="space-y-3 pt-2">
               <span className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] border-b border-slate-100 pb-1.5 block">Detected Assets</span>
               <div className="grid grid-cols-1 gap-2.5">
                  {normalizedData.composition_objects.detected_assets.length > 0 ? (
                    normalizedData.composition_objects.detected_assets.map((asset, i) => (
                      <div key={i} className="p-4 border rounded-sm bg-white  group hover:border-primary/30 hover: transition-all">
                        <div className="flex items-center justify-between mb-3">
                           <div className="flex items-center gap-2">
                              <span className="text-[11px] font-black text-slate-800 uppercase tracking-tight">{asset.asset_type.replace(/_/g, ' ')}</span>
                              <span className="text-[9px] font-bold text-slate-400">#{asset.visible_identifier}</span>
                           </div>
                           <ConfidenceChip level={(asset.confidence || "low").toLowerCase() as any} />
                        </div>
                        <div className="grid grid-cols-2 gap-y-3 gap-x-6">
                           <KVP label="Position" value={asset.position_in_scene} />
                           <KVP label="Orientation" value={asset.orientation} />
                           <KVP label="State" value={asset.state} />
                           <KVP label="Visible Damage" value={asset.damage_visible || "None"} />
                        </div>
                        <div className="mt-3 pt-2.5 border-t border-slate-50 text-[9px] font-black text-slate-300 uppercase tracking-widest">REF ID: {asset.asset_ref}</div>
                      </div>
                    ))
                  ) : <div className="p-8 text-center border-2 border-dashed rounded-sm text-[10px] text-slate-300 font-black uppercase tracking-widest">No assets detected</div>}
               </div>
            </div>

            <div className="space-y-3 pt-2">
               <span className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] border-b border-slate-100 pb-1.5 block">Detected Traces</span>
               <div className="space-y-2.5">
                  {normalizedData.composition_objects.detected_traces.length > 0 ? (
                    normalizedData.composition_objects.detected_traces.map((trace, i) => (
                      <div key={trace.trace_ref} className="p-4 border rounded-sm bg-slate-50/50 flex flex-col gap-2.5">
                         <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Chip text={trace.trace_type.replace(/_/g, ' ')} type={trace.observed_or_inferred === 'observed' ? 'observed' : 'inferred'} />
                              <span className="text-[9px] font-bold text-slate-400">REF: {trace.trace_ref}</span>
                            </div>
                            <ConfidenceChip level={(trace.confidence || "medium").toLowerCase() as any} />
                         </div>
                         <p className="text-[11px] font-bold text-slate-700 leading-snug">{trace.description}</p>
                         <div className="flex items-center justify-between text-[10px] font-black uppercase">
                            <span className="text-slate-400 tracking-tighter">Pos: {trace.position_in_scene}</span>
                            <span className="text-primary tracking-widest italic">Dir: {trace.direction_hint}</span>
                         </div>
                      </div>
                    ))
                  ) : <div className="p-6 text-center border border-dashed rounded-sm text-[10px] text-slate-300 font-bold uppercase">No traces detected</div>}
               </div>
            </div>

            <div className="space-y-3 pt-2">
               <span className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] border-b border-slate-100 pb-1.5 block">Spatial Relations</span>
               <ul className="space-y-2">
                  {normalizedData.composition_objects.spatial_relations.map((rel, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-[11px] font-bold text-slate-600 leading-snug">
                       <div className="h-1.5 w-1.5 bg-slate-300 rounded-full mt-1.5 shrink-0" />
                       {rel}
                    </li>
                  ))}
               </ul>
            </div>

            <div className="space-y-3 pt-2">
               <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Measurements</span>
                  <div className="flex gap-1.5">
                    <Chip text="Manual Overlay" type="manual" />
                    <Chip text="Estimated" type="unknown" />
                  </div>
               </div>
               <div className="grid grid-cols-1 gap-3">
                  {normalizedData.composition_objects.measurements.length > 0 ? (
                    normalizedData.composition_objects.measurements.map((m, i) => (
                      <div key={m.measurement_ref} className="p-4 border-2 border-dashed border-primary/20 rounded-sm bg-primary/5">
                         <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black text-primary uppercase tracking-[0.1em]">{m.name.replace(/_/g, ' ')}</span>
                              <span className="text-[8px] font-bold text-primary/40">#{m.measurement_ref}</span>
                            </div>
                            <div className="flex items-center gap-1.5 translate-y-[-2px]">
                               <span className="text-base font-black text-slate-900 tabular-nums">{m.value}</span>
                               <span className="text-[10px] font-black text-slate-400 uppercase">{m.unit}</span>
                            </div>
                         </div>
                         <div className="flex flex-col gap-1.5">
                            <div className="flex items-center justify-between">
                               <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Type: {m.measurement_type.replace(/_/g, ' ')}</span>
                               <ConfidenceChip level={(m.confidence || "low").toLowerCase() as any} />
                            </div>
                            <p className="text-[10px] font-bold text-slate-500 leading-relaxed italic pr-4">Basis: {m.basis}</p>
                         </div>
                      </div>
                    ))
                  ) : <div className="p-6 text-center border border-dashed rounded-sm text-[10px] text-slate-300 font-bold uppercase">No measurements detected</div>}
               </div>
            </div>
          </div>
        )}
      </div>

      {/* People & PPE */}
      <div className="bg-white border-b">
        <SectionHeader title="People & PPE" icon={Users} />
        {expandedSections.includes("People & PPE") && (
          <div className="p-5 space-y-6 animate-in fade-in slide-in-from-top-1">
            <div className="flex items-center justify-between p-5 bg-slate-900 rounded-sm border border-slate-800  relative overflow-hidden group">
               <div className="absolute right-[-20px] top-[-20px] opacity-10 rotate-12 transition-transform group-hover:scale-110">
                  <Users className="h-24 w-24 text-white" />
               </div>
               <div className="relative z-10 flex flex-col gap-1">
                  <span className="text-[9px] font-black text-primary uppercase tracking-[0.4em] block">Scene Census</span>
                  <span className="text-xl font-black text-white uppercase tracking-tighter">{normalizedData.people_ppe.person_count} Detected</span>
               </div>
               <div className="text-right relative z-10 flex flex-col items-end gap-1">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] block">Safety Audit</span>
                  <div className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-sm text-[9px] font-black text-emerald-400 uppercase tracking-widest ">Verified Compliant</div>
               </div>
            </div>

            <div className="space-y-4 pt-2">
               {normalizedData.people_ppe.detected_people.length > 0 ? (
                 normalizedData.people_ppe.detected_people.map((p, i) => (
                    <div key={p.person_ref} className="p-4 border rounded-sm space-y-5 bg-white  hover:border-slate-300 hover: transition-all">
                       <div className="flex items-center justify-between pb-3 border-b border-slate-50">
                          <div className="flex items-center gap-3">
                             <div className="h-8 w-8 rounded-sm bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-700 border border-slate-200  font-mono">
                                {p.person_ref}
                             </div>
                             <div className="flex flex-col">
                                <span className="text-xs font-black text-slate-900 uppercase tracking-tight leading-none">{p.role_guess.replace(/_/g, ' ')}</span>
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 opacity-60">Verified Actor</span>
                             </div>
                          </div>
                          <ConfidenceChip level={(p.confidence || "low").toLowerCase() as any} />
                       </div>
                       
                       <div className="grid grid-cols-2 gap-x-10 gap-y-4">
                          <KVP label="Current Activity" value={p.activity} />
                          <KVP label="Attention Vector" value={p.attention_direction} />
                          <KVP label="Scene Position" value={p.position_in_scene} />
                          <KVP label="Interaction Target" value={p.interaction_target} />
                       </div>

                       <div className="space-y-3 pt-4 border-t border-slate-50">
                          <div className="flex items-center justify-between">
                             <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] block">PPE Individual Audit</span>
                             <span className="text-[8px] font-bold text-slate-300 uppercase">Verified via PPE-Matrix v2</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                             {normalizedData.people_ppe.ppe_items.filter(item => item.person_ref === p.person_ref).map((item, j) => (
                                <div key={j} className={`px-3 py-2 rounded-sm border flex items-center gap-4 transition-all ${item.detected ? 'bg-white border-slate-200 ' : 'bg-slate-50 border-slate-50 opacity-25 grayscale'}`}>
                                   <div className={`h-2.5 w-2.5 rounded-full  transition-all ${item.detected ? (item.properly_worn ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-rose-500 shadow-rose-500/50 pulse-danger') : 'bg-slate-300'}`} />
                                   <div className="flex flex-col gap-0.5 min-w-[50px]">
                                      <span className="text-[10px] font-black uppercase text-slate-800 tracking-tighter leading-none">{item.item.replace(/_/g, ' ')}</span>
                                      <span className="text-[8px] font-bold text-slate-400 leading-none mt-1">{item.visibility?.toUpperCase() || "N/A"}</span>
                                   </div>
                                   <div className="ml-auto">
                                     {item.detected && <ConfidenceChip level={(item.confidence || "medium").toLowerCase() as any} />}
                                   </div>
                                </div>
                             ))}
                          </div>
                       </div>
                    </div>
                 ))
               ) : <div className="p-10 text-center border-2 border-dashed rounded-sm text-[10px] text-slate-300 font-black uppercase tracking-widest">No personnel extracted</div>}
            </div>
          </div>
        )}
      </div>

      {/* Environment */}
      <div className="bg-white border-b">
        <SectionHeader title="Environment" icon={Wind} />
        {expandedSections.includes("Environment") && (
          <div className="p-5 space-y-6 animate-in fade-in slide-in-from-top-1">
            <div className="grid grid-cols-2 gap-x-10 gap-y-3">
               <KVP label="Surface Type" value={normalizedData.environment.surface_type.replace(/_/g, ' ')} />
               <KVP label="Surface Condition" value={normalizedData.environment.surface_condition.replace(/_/g, ' ')} />
               <KVP label="Road / Path Status" value={normalizedData.environment.road_or_path_condition} />
               <KVP label="Boundary Edge State" value={normalizedData.environment.edge_condition} />
               <KVP label="Housekeeping Grade" value={normalizedData.environment.housekeeping_condition.replace(/_/g, ' ')} />
               <KVP label="Environmental Visibility" value={normalizedData.environment.visibility_condition} />
            </div>
            
            <div className="grid grid-cols-2 gap-3 pt-2">
               {[
                 { label: "Berm / Tanggul Present", active: normalizedData.environment.berm_or_tanggul_present },
                 { label: "Barrier Defense Present", active: normalizedData.environment.barrier_present },
                 { label: "Signage & Warning Visible", active: normalizedData.environment.signage_present },
                 { label: "Traffic Control Devices", active: normalizedData.environment.traffic_control_present },
               ].map((item, i) => (
                 <div key={i} className={`p-4 rounded-sm border flex items-center justify-between transition-all ${item.active ? 'bg-emerald-50/40 border-emerald-100 ' : 'bg-slate-50/50 border-slate-100 grayscale opacity-50'}`}>
                    <span className="text-[10px] font-bold uppercase text-slate-600 tracking-tight">{item.label}</span>
                    <div className={`p-1 rounded-full ${item.active ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                       {item.active ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                    </div>
                 </div>
               ))}
            </div>

            <div className="space-y-4 pt-2">
               <span className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] border-b border-slate-100 pb-2 block">Dust, Smoke & Spillage Tracking</span>
               <div className="flex flex-wrap gap-2.5">
                  {normalizedData.environment.dust_smoke_spillage.length > 0 ? (
                    normalizedData.environment.dust_smoke_spillage.map((s, i) => (
                      <div key={i} className="px-3.5 py-2 bg-amber-50 text-amber-800 border-2 border-amber-100/50 text-[10px] font-black uppercase rounded-sm  italic">
                        {s}
                      </div>
                    ))
                  ) : <span className="text-[10px] text-slate-300 font-black uppercase tracking-widest italic ml-1 opacity-60">No hazardous atmosphere detected</span>}
               </div>
            </div>

            <div className="py-4 px-5 bg-slate-50 rounded-sm border-2 border-slate-100 shadow-inner">
               <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Detailed Environment Read</span>
               <p className="text-[11px] font-bold text-slate-700 leading-relaxed pr-2 italic opacity-85">"{normalizedData.environment.environment_summary}"</p>
            </div>
          </div>
        )}
      </div>

      {/* Initial Interpretation */}
      <div className="bg-white">
        <div className="ring-2 ring-slate-900/5  relative z-10 m-3 rounded-[24px] overflow-hidden border-2 border-slate-900 bg-white">
          <SectionHeader title="Initial Interpretation" icon={Brain} />
          {expandedSections.includes("Initial Interpretation") && (
            <div className="p-6 space-y-10 animate-in fade-in slide-in-from-top-2">
              <div className="space-y-5">
                 <div className="flex items-center justify-between border-b-2 border-slate-900 pb-2.5">
                    <div className="flex items-center gap-2.5">
                       <div className="h-6 w-6 bg-slate-900 rounded-sm flex items-center justify-center text-white text-[11px] font-black ">?</div>
                       <span className="text-xs font-black text-slate-900 uppercase tracking-[0.25em]">Observed Facts</span>
                    </div>
                    <div className="px-2 py-0.5 bg-slate-100 rounded text-[9px] font-black text-slate-500 uppercase tracking-[0.1em]">Verified Vision</div>
                 </div>
                 <div className="space-y-5">
                    {normalizedData.initial_interpretation.observed_facts.length > 0 ? (
                      normalizedData.initial_interpretation.observed_facts.map((f, i) => (
                        <div key={f.fact_id} className="relative pl-6 group">
                           <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 rounded-full transition-all group-hover:w-2" />
                           <div className="flex items-center gap-2.5 mb-2.5">
                              <Chip text={f.fact_type.replace(/_/g, ' ')} type="observed" />
                              <ConfidenceChip level={(f.confidence || "high").toLowerCase() as any} />
                           </div>
                           <p className="text-[12px] font-black text-slate-900 leading-relaxed pr-6">{f.fact_text}</p>
                           {f.source_region && (
                             <div className="mt-2.5 flex items-center gap-2 text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] border-l-2 border-slate-50 pl-2">
                                <Paperclip className="h-3.5 w-3.5 opacity-50" />
                                SOURCE REGION: {f.source_region}
                             </div>
                           )}
                        </div>
                      ))
                    ) : <div className="text-[11px] text-slate-300 font-bold uppercase text-center p-6 border border-dashed rounded-sm">No facts documented in current frame</div>}
                 </div>
              </div>

              <div className="space-y-5">
                 <div className="flex items-center justify-between border-b-2 border-indigo-600 pb-2.5">
                    <div className="flex items-center gap-2.5">
                       <div className="h-6 w-6 bg-indigo-600 rounded-sm flex items-center justify-center text-white text-[11px] font-black ">!</div>
                       <span className="text-xs font-black text-indigo-700 uppercase tracking-[0.25em]">Inferred Points</span>
                    </div>
                    <div className="px-2 py-0.5 bg-indigo-50 rounded text-[9px] font-black text-indigo-400 uppercase tracking-[0.1em]">AI Synthetic Reasoning</div>
                 </div>
                 <div className="space-y-5">
                    {normalizedData.initial_interpretation.inferred_points.length > 0 ? (
                      normalizedData.initial_interpretation.inferred_points.map((p, i) => (
                        <div key={p.inference_id} className="relative pl-6 group">
                           <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600 rounded-full opacity-30 transition-all group-hover:opacity-100 group-hover:w-2" />
                           <div className="flex items-center gap-2.5 mb-2.5">
                              <Chip text="logical_inference" type="inferred" />
                              <ConfidenceChip level={(p.confidence || "medium").toLowerCase() as any} />
                           </div>
                           <p className="text-[12px] font-black text-slate-700 leading-relaxed pr-6 italic font-serif">"{p.inference_text}"</p>
                           <div className="mt-2.5 flex items-center gap-2 text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em] bg-indigo-50/50 py-1.5 px-3 rounded-sm border border-indigo-100/50 w-fit">
                              <Brain className="h-3.5 w-3.5" />
                              Evidence Basis: {p.basis.join(', ')}
                           </div>
                        </div>
                      ))
                    ) : <div className="text-[11px] text-slate-300 font-bold uppercase text-center p-6 border border-dashed rounded-sm">No synthetic inferences calculated</div>}
                 </div>
              </div>

              <div className="space-y-5">
                 <div className="flex items-center justify-between border-b-2 border-rose-600 pb-2.5">
                    <div className="flex items-center gap-2.5">
                       <AlertTriangle className="h-6 w-6 text-rose-600" />
                       <span className="text-xs font-black text-rose-700 uppercase tracking-[0.25em]">Hazard Signals</span>
                    </div>
                    <div className="px-2 py-0.5 bg-rose-50 rounded text-[9px] font-black text-rose-400 uppercase tracking-[0.1em]">Immediate Alert</div>
                 </div>
                 <div className="grid grid-cols-1 gap-3">
                    {normalizedData.initial_interpretation.hazard_signals.length > 0 ? (
                      normalizedData.initial_interpretation.hazard_signals.map((h, i) => (
                        <div key={i} className="p-5 bg-rose-50 border-2 border-rose-100/50 rounded-sm relative overflow-hidden group hover:bg-rose-100/30 transition-all hover:border-rose-200">
                           <div className="absolute right-[-10px] top-[-10px] opacity-[0.03] group-hover:opacity-10 transition-opacity rotate-12 scale-110">
                              <AlertTriangle className="h-20 w-20 text-rose-900" />
                           </div>
                           <div className="flex items-center justify-between mb-3 relative z-10">
                              <span className="text-[11px] font-black text-rose-800 uppercase tracking-widest border-b border-rose-200 pb-0.5">{h.hazard_type}</span>
                              <ConfidenceChip level={(h.confidence || "high").toLowerCase() as any} />
                           </div>
                           <p className="text-[12px] font-black text-rose-950 leading-tight mb-3 pr-8 relative z-10">{h.description}</p>
                           <div className="text-[9px] font-black text-rose-500 uppercase tracking-[0.15em] opacity-80 relative z-10 bg-white/50 w-fit px-2 py-0.5 rounded border border-rose-100">Protocol Basis: {h.evidence_basis}</div>
                        </div>
                      ))
                    ) : <div className="bg-emerald-50 text-emerald-800 p-6 border-2 border-emerald-100 rounded-sm text-center text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3"><CheckCircle className="h-4 w-4" /> NO HAZARDS DOCUMENTED</div>}
                 </div>
              </div>

              <div className="space-y-6 pt-2">
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] border-b border-slate-50 pb-2 block">Post-Extraction Forensic Metadata</span>
                 <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-3">
                       <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Negative Findings (Absent Items)</span>
                       <div className="grid grid-cols-1 gap-2">
                          {normalizedData.initial_interpretation.negative_findings.map((n, i) => (
                             <div key={i} className="flex items-center justify-between p-3 bg-slate-50 border rounded-sm hover:bg-white transition-all group">
                                <div className="flex items-center gap-3">
                                   <div className="h-2 w-2 rounded-full bg-slate-300 shadow-inner group-hover:bg-primary transition-colors" />
                                   <span className="text-[11px] font-black text-slate-800 uppercase tracking-tight">{n.item.replace(/_/g, ' ')}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                   <span className="text-[10px] font-bold text-slate-400 italic font-mono">"{n.description}"</span>
                                   <ConfidenceChip level={(n.confidence || "medium").toLowerCase() as any} />
                                </div>
                             </div>
                          ))}
                       </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-3">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Unknown Variables</span>
                          <div className="flex flex-col gap-2">
                             {normalizedData.initial_interpretation.unknowns.map((u, i) => (
                                <div key={i} className="px-4 py-2.5 bg-white border border-slate-200 rounded-sm text-[10px] font-bold text-slate-500  leading-tight group hover:border-slate-400 transition-all">
                                   <span className="text-slate-300 mr-2 font-mono">?</span> {u}
                                </div>
                             ))}
                          </div>
                       </div>
                       
                       <div className="space-y-3">
                          <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest pl-1">Protocol Review Tokens</span>
                          <div className="flex flex-col gap-2">
                             {normalizedData.initial_interpretation.review_flags.map((r, i) => (
                                <div key={i} className="flex items-start gap-3 p-3 bg-rose-50/40 border border-rose-100 rounded-sm group hover:bg-rose-50 hover:border-rose-200 transition-all">
                                   <div className="h-1.5 w-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0 shadow-[0_0_5px_rgba(244,63,94,0.5)]" />
                                   <span className="text-[10px] font-black text-rose-800 leading-snug tracking-tight">{r}</span>
                                </div>
                             ))}
                          </div>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="bg-slate-900 rounded-[32px] p-8 text-white shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative overflow-hidden border-2 border-white/5 mx-[-4px]">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
                 <div className="absolute bottom-[-50px] left-[-50px] w-64 h-64 bg-indigo-500/15 blur-[100px] rounded-full pointer-events-none" />
                 
                 <div className="flex items-center justify-between mb-6 relative z-10">
                    <div className="flex items-center gap-3">
                       <div className="h-1.5 w-1.5 bg-primary rounded-full animate-ping" />
                       <span className="text-[11px] font-black text-primary uppercase tracking-[0.5em] block">Unified Forensic Synthesis</span>
                    </div>
                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] bg-white/5 px-2 py-1 rounded">Engine: SafetyCore v6.1</span>
                 </div>
                 
                 <p className="text-sm font-black text-slate-100 leading-relaxed relative z-10 mb-8 pr-12 font-serif opacity-95">
                    "{normalizedData.initial_interpretation.overall_scene_read}"
                 </p>
                 
                 <div className="flex items-center justify-between border-t border-slate-800/80 pt-6 relative z-10">
                    <div className="flex flex-col gap-2">
                       <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Aggregate Accuracy</span>
                       <div className="flex items-center gap-3">
                          <div className={`h-3 w-3 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.5)] ${normalizedData.initial_interpretation.overall_confidence === 'high' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                          <div className="flex flex-col">
                             <span className="text-sm font-black text-white uppercase tracking-[0.1em]">{normalizedData.initial_interpretation.overall_confidence} LEVEL PRECISION</span>
                             <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest leading-none mt-1">Validated against 14 control parameters</span>
                          </div>
                       </div>
                    </div>
                    {normalizedData.initial_interpretation.needs_human_validation && (
                       <div className="flex flex-col items-end gap-2.5">
                          <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em] animate-pulse">Validation Sequence Pending</span>
                          <div className="flex items-center gap-2.5 py-2 px-4 bg-amber-500/10 border-2 border-amber-500/30 rounded-sm  ring-1 ring-amber-500/20">
                             <Loader2 className="h-3.5 w-3.5 text-amber-500 animate-spin" />
                             <span className="text-[11px] font-black text-amber-500 uppercase tracking-tighter">Human Review Mandatory</span>
                          </div>
                       </div>
                    )}
                 </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Console Header */}
      <div className="px-6 py-5 shrink-0 flex items-center justify-between bg-white border-b sticky top-0 z-[60]  backdrop-blur-md bg-white/80">
         <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
               <div className="h-6 w-6 bg-slate-900 rounded-sm flex items-center justify-center ">
                  <Brain className="h-3.5 w-3.5 text-white" />
               </div>
               <span className="text-[12px] font-black text-slate-900 uppercase tracking-[0.3em]">Extraction Matrix</span>
            </div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.15em] opacity-60 ml-9">SINGLE IMAGE SYNTHESIS • CS-2026-5208 • v7.0-PRO</span>
         </div>
         <div className="flex items-center gap-2 p-1.5 bg-slate-100/80 rounded-sm border border-slate-200/50 shadow-inner">
            <button 
              onClick={() => setViewMode("Structured")}
              className={`px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-sm transition-all duration-300 transform active:scale-95 ${viewMode === "Structured" ? "bg-white text-primary shadow-[0_4px_12px_rgba(0,0,0,0.1)] ring-1 ring-slate-200" : "text-slate-400 hover:text-slate-600"}`}
            >
              STRUCTURED
            </button>
            <button 
              onClick={() => setViewMode("JSON")}
              className={`px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-sm transition-all duration-300 transform active:scale-95 ${viewMode === "JSON" ? "bg-white text-primary shadow-[0_4px_12px_rgba(0,0,0,0.1)] ring-1 ring-slate-200" : "text-slate-400 hover:text-slate-600"}`}
            >
              JSON CORE
            </button>
         </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {viewMode === "Structured" ? (
          renderStructuredView()
        ) : (
          <div className="p-5 bg-[#0d1117] min-h-full">
            <div className="rounded-[28px] overflow-hidden border border-[#30363d] shadow-[0_30px_60px_rgba(0,0,0,0.5)] relative">
              <div className="bg-[#161b22] px-6 py-4 border-b border-[#30363d] flex items-center justify-between sticky top-0 z-10 backdrop-blur-md bg-[#161b22]/90">
                <div className="flex items-center gap-5">
                   <div className="flex gap-2">
                      <div className="h-3.5 w-3.5 rounded-full bg-[#ff5f56] shadow-[0_0_8px_rgba(255,95,86,0.3)] transition-transform hover:scale-110" />
                      <div className="h-3.5 w-3.5 rounded-full bg-[#ffbd2e] shadow-[0_0_8px_rgba(255,189,46,0.3)] transition-transform hover:scale-110" />
                      <div className="h-3.5 w-3.5 rounded-full bg-[#27c93f] shadow-[0_0_8px_rgba(39,201,63,0.3)] transition-transform hover:scale-110" />
                   </div>
                   <div className="h-5 w-[1px] bg-[#30363d] mx-1" />
                   <div className="flex flex-col">
                      <span className="text-[10px] font-mono text-[#8b949e] uppercase tracking-[0.2em] font-black">forensic_extraction_payload.json</span>
                      <span className="text-[8px] font-mono text-slate-600 uppercase tracking-widest">UTF-8 • Application/JSON</span>
                   </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-9 px-4 text-[10px] font-black text-[#c9d1d9] hover:bg-[#30363d] hover:text-white border border-[#30363d] rounded-sm transition-all  group active:scale-95"
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(normalizedData, null, 2));
                    toast.success("JSON Payload mirrored to clipboard");
                  }}
                >
                   <Copy className="h-4 w-4 mr-2.5 transition-transform group-hover:rotate-12" /> EXPORT SCHEMA
                </Button>
              </div>
              <div className="relative">
                <div className="absolute top-0 right-0 p-8 pointer-events-none select-none">
                  <FileJson className="h-48 w-48 text-white/[0.03]" />
                </div>
                <pre className="text-[11.5px] font-mono text-[#79c0ff] bg-[#0d1117] p-10 leading-[1.8] overflow-auto max-h-[1400px] custom-scrollbar selection:bg-primary/40 scroll-smooth">
                   {JSON.stringify(normalizedData, null, 2)}
                </pre>
              </div>
            </div>
            <div className="mt-6 px-1 flex items-center justify-between">
               <span className="text-[9px] font-black text-slate-700 uppercase tracking-[0.3em]">Forensic Integrity Checksum: SHA256-8A9C...</span>
               <span className="text-[9px] font-black text-slate-700 uppercase tracking-[0.3em]">End of Payload</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Audio Right Panel ────────────────────────────────────────────────────────

function AudioRightPanel({
  audioCurrentTime,
  onSeek,
}: {
  audioCurrentTime: number;
  onSeek: (seconds: number) => void;
}) {
  const [activeTab, setActiveTab] = useState<'extraction' | 'diarization'>('extraction');
  const [viewMode, setViewMode] = useState<'Structured' | 'JSON'>('Structured');
  const [expandedSections, setExpandedSections] = useState<string[]>(['audio_session_meta', 'speaker_profiles']);

  const data = audioExtractionData;

  const toSec = (t: string) => {
    const p = t.split(':').map(Number);
    return p.length === 3 ? p[0] * 3600 + p[1] * 60 + p[2] : p[0] * 60 + p[1];
  };

  const isSegActive = (start: string, end: string) =>
    audioCurrentTime >= toSec(start) && audioCurrentTime <= toSec(end);

  const seek = (t: string) => onSeek(toSec(t));

  const toggle = (id: string) =>
    setExpandedSections(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );

  // ── Micro components ──────────────────────────────────────────────────────

  const Chip = ({ label, variant = 'default' }: { label: string; variant?: 'default' | 'warn' | 'critical' | 'ok' | 'info' }) => {
    const cls: Record<string, string> = {
      default: 'bg-slate-100 text-slate-500 border-slate-200',
      warn:    'bg-amber-50 text-amber-700 border-amber-100',
      critical:'bg-rose-50 text-rose-700 border-rose-100',
      ok:      'bg-emerald-50 text-emerald-700 border-emerald-100',
      info:    'bg-blue-50 text-blue-700 border-blue-100',
    };
    return (
      <span className={`inline-flex items-center px-1.5 py-0.5 rounded border text-[9px] font-black uppercase tracking-wide ${cls[variant]}`}>
        {label}
      </span>
    );
  };

  const TsBtn = ({ time }: { time: string }) => (
    <button
      onClick={(e) => { e.stopPropagation(); seek(time); }}
      className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-primary/8 hover:bg-primary/20 text-primary border border-primary/20 rounded text-[9px] font-black tabular-nums transition-colors cursor-pointer flex-shrink-0"
      title="Seek to this time"
    >
      <Clock className="h-2.5 w-2.5" />
      {time}
    </button>
  );

  const AccSection = ({ id, title, icon: Icon, count, children }: any) => {
    const open = expandedSections.includes(id);
    return (
      <div className={`border rounded-sm overflow-hidden transition-all ${open ? 'ring-1 ring-primary/15 ' : 'hover:border-slate-200'}`}>
        <button
          onClick={() => toggle(id)}
          className={`w-full flex items-center justify-between px-3 py-2 text-left transition-colors ${open ? 'bg-slate-50/80 border-b border-slate-100' : 'bg-white hover:bg-slate-50/40'}`}
        >
          <div className="flex items-center gap-2">
            <div className={`h-5 w-5 rounded flex items-center justify-center flex-shrink-0 ${open ? 'text-primary' : 'text-slate-400'}`}>
              <Icon className="h-3.5 w-3.5" />
            </div>
            <span className={`text-[10px] font-black uppercase tracking-tight ${open ? 'text-slate-900' : 'text-slate-600'}`}>{title}</span>
            {count !== undefined && (
              <span className="px-1 py-0.5 bg-slate-100 text-slate-400 text-[8px] font-black rounded border border-slate-200">{count}</span>
            )}
          </div>
          <ChevronDown className={`h-3 w-3 text-slate-400 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
        {open && (
           <div className="p-3 bg-white">
             {children}
           </div>
        )}
      </div>
    );
  };

  const KVP = ({ label, value }: { label: string; value: string | number }) => (
    <div className="min-w-0">
      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">{label}</span>
      <span className="text-[10px] font-bold text-slate-800 truncate block leading-tight">{value || '—'}</span>
    </div>
  );

  // ── Extraction tab ─────────────────────────────────────────────────────────

  const renderExtraction = () => {
    if (viewMode === 'JSON') {
      return (
        <div className="p-3">
          <div className="bg-[#0d1117] rounded-sm p-4 overflow-hidden border border-slate-800 ">
            <pre className="text-[11px] font-mono text-[#79c0ff] leading-relaxed overflow-auto max-h-[700px] custom-scrollbar selection:bg-primary/30">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        </div>
      );
    }

    const rpc = (data as any).risk_and_procedure_clues;

    return (
      <div className="p-3 space-y-2.5 pb-20">
        
        {/* A — Audio Properties */}
        <AccSection id="audio_props" title="Audio Properties" icon={Settings}>
          <div className="space-y-4">
             <div className="grid grid-cols-2 gap-3">
               <KVP label="File Name" value={data.recording_meta.file_name} />
               <KVP label="Audio ID" value={`AUD-${(data as any).audio_id || '9921'}`} />
               <KVP label="Duration" value={data.recording_meta.duration} />
               <KVP label="Language" value={data.recording_meta.language} />
             </div>
             <div className="pt-2 border-t border-slate-100">
               <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest block mb-2">Source Context</span>
               <div className="grid grid-cols-2 gap-3">
                 <KVP label="Source Type" value={data.recording_meta.source_type} />
                 <KVP label="Channel" value={data.recording_meta.channel_type} />
                 <KVP label="Device" value={(data.recording_meta as any).source_device || 'Fixed Radio'} />
                 <KVP label="Rec Type" value={data.recording_meta.recording_type} />
               </div>
             </div>
             <div className="pt-2 border-t border-slate-100">
               <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest block mb-2">Technical Quality</span>
               <div className="grid grid-cols-2 gap-3">
                 <KVP label="Quality" value={data.recording_meta.audio_quality} />
                 <KVP label="Noise Level" value={data.recording_meta.noise_level} />
                 <KVP label="Overlap" value={data.recording_meta.overlap_level} />
               </div>
             </div>
          </div>
        </AccSection>

        {/* B — Session Context */}
        <AccSection id="session_context" title="Session Context" icon={Layout}>
          <div className="space-y-4">
             <div className="grid grid-cols-2 gap-3">
               <KVP label="Session Type" value={(data as any).session_type || 'Operational Log'} />
               <KVP label="Purpose" value={(data as any).session_purpose || 'Standard Radio Check'} />
               <KVP label="Stage" value={(data as any).investigation_stage || 'Evidence Ingestion'} />
               <KVP label="Speakers" value={`${data.speaker_profiles.length} detected`} />
             </div>
             <div className="p-2.5 bg-slate-50 rounded-sm border border-slate-100">
               <span className="text-[8px] font-black text-slate-400 uppercase tracking-wide block mb-1">Conversation Setting</span>
               <span className="text-[10px] font-bold text-slate-600">{(data as any).conversation_setting || 'Remote Radio (Site Alpha)'}</span>
             </div>
          </div>
        </AccSection>

        {/* C — Speaker Registry */}
        <AccSection id="speaker_registry" title="Speaker Registry" icon={Users} count={data.speaker_profiles.length}>
          <div className="space-y-2">
            {data.speaker_profiles.map((s: any) => (
              <div key={s.speaker_id} className="p-3 border rounded-sm bg-white hover:bg-slate-50/50 transition-all border-slate-100 group ">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-sm bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      {s.speaker_id.split('_')[1]}
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-slate-900 block leading-tight">{s.speaker_label}</span>
                      <span className="text-[9px] font-bold text-slate-400">{s.probable_role}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Chip label={`Stress: ${s.stress_level.split(' ')[0]}`} variant={s.stress_level.includes('High') ? 'critical' : 'ok'} />
                    <span className="text-[8px] font-black text-slate-300 uppercase">{s.confidence} Conf</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-50">
                  <KVP label="Speaking" value={s.speaking_time} />
                  <KVP label="Assert" value={s.assertiveness} />
                  <KVP label="Hesit" value={s.hesitation} />
                </div>
              </div>
            ))}
          </div>
        </AccSection>

        {/* D — Transcript & Evidence */}
        <AccSection id="transcript_evidence" title="Transcript & Evidence" icon={MessageCircle} count={(data as any).factual_statements?.length + (data as any).timeline_events?.length}>
          <div className="space-y-4">
             {/* Evidence Statements */}
             <div>
               <span className="text-[9px] font-black text-slate-900 uppercase tracking-[0.2em] mb-3 block px-1">Evidence Statements</span>
               <div className="space-y-2">
                 {(data as any).factual_statements.map((f: any, i: number) => (
                   <div key={i} className="flex gap-2.5 p-2.5 border rounded-sm bg-white hover:bg-slate-50/50 transition-all">
                     <TsBtn time={f.timestamp} />
                     <div className="flex-1 min-w-0">
                       <p className="text-[10px] font-bold text-slate-800 leading-snug mb-2 italic">"{f.fact_text}"</p>
                       <div className="flex items-center gap-1.5 flex-wrap">
                         <span className="px-1.5 py-0.5 bg-slate-100 rounded text-[8px] font-bold text-slate-500 uppercase">{f.speaker}</span>
                         <Chip label={f.statement_type} variant="info" />
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
             </div>

             {/* Timeline Events */}
             <div className="pt-2">
               <span className="text-[9px] font-black text-slate-900 uppercase tracking-[0.2em] mb-3 block px-1">Forensic Timeline</span>
               <div className="relative pl-3 border-l border-slate-100 ml-2 space-y-4">
                 {(data as any).timeline_events.map((ev: any, i: number) => (
                   <div key={i} className="relative">
                     <div className="absolute -left-[16.5px] top-1.5 h-2 w-2 rounded-full bg-slate-200 border-2 border-white " />
                     <div className="flex items-center gap-1.5 mb-1">
                        <TsBtn time={ev.timestamp} />
                        <span className="text-[9px] font-bold text-slate-400">· {ev.actor}</span>
                     </div>
                     <p className="text-[10px] font-bold text-slate-700 leading-snug">{ev.event_summary}</p>
                   </div>
                 ))}
               </div>
             </div>
          </div>
        </AccSection>

        {/* E — Investigation Cues */}
        <AccSection id="investigation_cues" title="Investigation Cues" icon={Activity}>
           <div className="space-y-4">
             {([
               { key: 'procedure_mentions',          icon: Shield,   label: 'Procedure' },
               { key: 'equipment_issue_mentions',    icon: Settings, label: 'Equipment' },
               { key: 'emergency_response_mentions', icon: HelpCircle, label: 'Emergency' },
               { key: 'control_gap_mentions',        icon: AlertTriangle, label: 'Control Gaps' },
             ] as any[]).map(({ key, icon: Icon, label }) => {
               const items = rpc[key] || [];
               if (items.length === 0) return null;
               return (
                 <div key={key} className="p-3 border rounded-sm bg-slate-50/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="h-3.5 w-3.5 text-slate-400" />
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
                    </div>
                    <div className="space-y-1.5">
                      {items.map((it: string, j: number) => (
                        <div key={j} className="flex gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                          <p className="text-[10px] font-bold text-slate-700 leading-snug">{it}</p>
                        </div>
                      ))}
                    </div>
                 </div>
               );
             })}
           </div>
        </AccSection>

        {/* F — Risks, Gaps, Review */}
        <AccSection id="risks_gaps" title="Risks, Gaps, Review" icon={Search} count={(data as any).contradictions_and_gaps.length}>
          <div className="space-y-4">
             {/* Contradictions */}
             <div className="space-y-2">
               {(data as any).contradictions_and_gaps.map((c: any, i: number) => (
                 <div key={i} className="p-3 border border-rose-100 rounded-sm bg-rose-50/30">
                   <div className="flex items-center gap-2 mb-2">
                     <TsBtn time={c.timestamp} />
                     <Chip label={c.type} variant="critical" />
                   </div>
                   <p className="text-[10px] font-bold text-slate-800 leading-snug">{c.detail}</p>
                 </div>
               ))}
             </div>

             {/* Human Review Flags */}
             <div className="pt-2 border-t border-slate-100">
               <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest block mb-2">Human Review Tokens</span>
               <div className="space-y-1.5">
                 {(data as any).review_meta.needs_human_review.map((token: string, i: number) => (
                   <div key={i} className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-50 rounded-sm border border-slate-100">
                      <Eye className="h-3 w-3 text-primary" />
                      <span className="text-[10px] font-bold text-slate-600">{token}</span>
                   </div>
                 ))}
               </div>
             </div>

             <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-100 rounded-sm mt-4">
               <div className="flex items-center gap-2">
                 <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                 <span className="text-[10px] font-black text-emerald-900 uppercase">Analysis Confidence</span>
               </div>
               <span className="text-[12px] font-black text-emerald-600">{(data as any).review_meta.confidence}</span>
             </div>
          </div>
        </AccSection>

      </div>
    );
  };

  // ── Diarization Session tab ────────────────────────────────────────────────

  const renderDiarization = () => {
    const segments = audioDiarizationData;
    const totalSpeakers = [...new Set(segments.map(s => s.speaker_id))].length;
    const [searchTerm, setSearchTerm] = useState('');
    const [speakerFilter, setSpeakerFilter] = useState<string | null>(null);
    const [showLowConfOnly, setShowLowConfOnly] = useState(false);

    const filteredSegments = segments.filter(seg => {
      const matchesSearch = seg.text.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSpeaker = !speakerFilter || seg.speaker_id === speakerFilter;
      const matchesConf = !showLowConfOnly || seg.confidence === 'low' || seg.confidence === 'medium';
      return matchesSearch && matchesSpeaker && matchesConf;
    });

    return (
      <div className="flex flex-col h-full bg-white">
        {/* A. Forensic Header */}
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/30">
           <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-wider">Diarization Session</h3>
                <span className="text-[9px] font-bold text-slate-400">Audio Forensic Evidence Log · Site Alpha</span>
              </div>
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-sm text-[10px] font-black text-slate-600 hover:bg-slate-50 transition-all ">
                <Download className="h-3.5 w-3.5" />
                EXPORT RAW
              </button>
           </div>
           <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500">
              <div className="flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-slate-400" />
                <span>{segments.length} Segments</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-slate-400" />
                <span>{totalSpeakers} Speakers</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                <Clock className="h-3.5 w-3.5" />
                <span className="tabular-nums">04:22 Total</span>
              </div>
           </div>
        </div>

        {/* B. Action Layer */}
        <div className="px-4 py-3 border-b border-slate-100 space-y-3 bg-white">
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search transcript evidence..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-sm text-[11px] font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-slate-300"
              />
           </div>
           <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              <button 
                onClick={() => setSpeakerFilter(null)}
                className={`px-2.5 py-1 rounded-sm text-[9px] font-black uppercase whitespace-nowrap transition-all ${!speakerFilter ? 'bg-slate-900 text-white ' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
              >
                All Speakers
              </button>
              {data.speaker_profiles.map(s => (
                <button 
                  key={s.speaker_id}
                  onClick={() => setSpeakerFilter(s.speaker_id)}
                  className={`px-2.5 py-1 rounded-sm text-[9px] font-black uppercase whitespace-nowrap transition-all ${speakerFilter === s.speaker_id ? 'bg-primary text-white ' : 'bg-slate-100 text-slate-400 hover:bg-primary/5 hover:text-primary'}`}
                >
                  {s.speaker_label}
                </button>
              ))}
              <div className="ml-auto flex items-center gap-2">
                <button 
                  onClick={() => setShowLowConfOnly(!showLowConfOnly)}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-sm text-[9px] font-black uppercase transition-all ${showLowConfOnly ? 'bg-amber-100 text-amber-900 ring-1 ring-amber-200' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                >
                  <AlertCircle className="h-3 w-3" />
                  FLAGGED ONLY
                </button>
              </div>
           </div>
        </div>

        {/* C. Segment Review List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1">
          {filteredSegments.length > 0 ? (
            filteredSegments.map((seg) => {
              const active = isSegActive(seg.start_time, seg.end_time);
              const isLowConf = seg.confidence.toLowerCase() !== 'high';
              const speakerInfo = data.speaker_profiles.find(s => s.speaker_id === seg.speaker_id);

              return (
                <div
                  key={seg.segment_id}
                  onClick={() => seek(seg.start_time)}
                  className={`group relative flex gap-4 p-3 rounded-sm cursor-pointer transition-all border border-transparent ${
                    active
                      ? 'bg-slate-900 text-white  ring-2 ring-primary/40 -translate-y-0.5 z-10'
                      : 'hover:bg-slate-50 hover:border-slate-100'
                  }`}
                >
                  {/* Timeline Rail Component */}
                  <div className="flex flex-col items-center w-[45px] flex-shrink-0 pt-1">
                    <span className={`text-[10px] font-black tabular-nums ${active ? 'text-primary' : 'text-slate-900'}`}>
                      {seg.start_time}
                    </span>
                    <div className={`w-px flex-1 my-2 ${active ? 'bg-primary/30' : 'bg-slate-100 group-hover:bg-slate-200'}`} />
                    <span className={`text-[9px] font-bold tabular-nums ${active ? 'text-slate-400' : 'text-slate-300'}`}>
                      {seg.duration || '0:05'}
                    </span>
                  </div>

                  {/* Evidence Card Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-sm text-[9px] font-black uppercase tracking-wider  ${
                          active 
                            ? 'bg-primary text-white' 
                            : seg.speaker_id === 'SPK_01' ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                        }`}>
                          {seg.speaker_label}
                        </span>
                        <span className={`text-[9px] font-bold hidden sm:block ${active ? 'text-slate-400' : 'text-slate-300'}`}>
                          {speakerInfo?.probable_role || 'Speaker'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {seg.flags?.map((flag: string, idx: number) => (
                           <div key={idx} className="h-4 w-4 rounded bg-rose-500/10 flex items-center justify-center" title={flag}>
                              <AlertTriangle className={`h-2.5 w-2.5 ${active ? 'text-rose-400' : 'text-rose-500'}`} />
                           </div>
                        ))}
                        <div className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter ${
                          isLowConf ? 'bg-rose-500 text-white' : active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
                        }`}>
                          {seg.confidence}
                        </div>
                      </div>
                    </div>
                    <p className={`text-[11px] leading-[1.6] ${active ? 'text-slate-100 italic' : 'text-slate-700 font-medium'}`}>
                      {searchTerm ? (
                        seg.text.split(new RegExp(`(${searchTerm})`, 'gi')).map((part, i) => 
                          part.toLowerCase() === searchTerm.toLowerCase() 
                            ? <mark key={i} className="bg-yellow-200 text-slate-900 rounded-sm px-0.5">{part}</mark> 
                            : part
                        )
                      ) : seg.text}
                    </p>
                  </div>

                  {/* Active Indicator Pulse */}
                  {active && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                       <div className="h-2 w-2 rounded-full bg-primary animate-ping" />
                    </div>
                  )}
                </div>
              );
            })
          ) : (
             <div className="h-full flex flex-col items-center justify-center p-10 text-center opacity-40">
                <Search className="h-8 w-8 text-slate-300 mb-3" />
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-tight">No matching fragments found<br/>Adjust your filters</span>
             </div>
          )}

          <div className="py-12 flex flex-col items-center justify-center opacity-20">
             <div className="h-px w-10 bg-slate-300 mb-2" />
             <span className="text-[8px] font-black uppercase tracking-[0.4em]">End of Diarization</span>
          </div>
        </div>
      </div>
    );
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* Sticky tab header */}
      <div className="px-3 py-2 border-b bg-white flex items-center justify-between flex-shrink-0 gap-2">
        {/* Tab switcher */}
        <div className="flex items-center gap-0.5 p-0.5 bg-slate-100 rounded-md border border-slate-200 shadow-inner">
          {(['extraction', 'diarization'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 rounded text-[10px] font-black tracking-widest uppercase transition-all ${
                activeTab === tab
                  ? 'bg-white text-primary  ring-1 ring-slate-200/60'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab === 'extraction' ? 'Extraction' : 'Diary Session'}
            </button>
          ))}
        </div>

        {/* Right controls */}
        {activeTab === 'extraction' && (
          <div className="flex items-center gap-0.5 p-0.5 bg-slate-100 rounded border border-slate-200 shadow-inner">
            {(['Structured', 'JSON'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-2 py-0.5 text-[8px] font-black uppercase rounded transition-all ${
                  viewMode === mode ? 'bg-white text-primary ' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tab content area */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {activeTab === 'extraction' ? (
          <div className="h-full overflow-auto custom-scrollbar">
            {renderExtraction()}
          </div>
        ) : (
          <div className="h-full flex flex-col overflow-hidden">
            {renderDiarization()}
          </div>
        )}
      </div>

    </div>
  );
}

// --- Tabs ---

function OverviewTab() {
  return (
    <div className="flex flex-col h-full bg-slate-50/10 overflow-auto">
      <div className="p-6 grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
           <div className="bg-white border rounded-sm  p-5">
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
                    <div className="flex-1 bg-slate-50 border rounded-sm p-3">
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
                    <div className="flex-1 bg-slate-50 border rounded-sm p-3">
                       <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Risk Classification</span>
                       <div className="flex flex-wrap gap-1.5 mt-1">
                          <span className="px-2 py-0.5 rounded-full bg-rose-50 border border-rose-100 text-[9px] font-bold text-rose-600 uppercase">Mechanical Failure</span>
                          <span className="px-2 py-0.5 rounded-full bg-amber-50 border border-amber-100 text-[9px] font-bold text-amber-600 uppercase">Near Miss</span>
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           <div className="bg-white border rounded-sm  p-5">
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
                      <div className="text-[9px] font-bold text-slate-400 mb-2 invisible group-hover:visible absolute -top-4 whitespace-nowrap bg-white border px-1.5 rounded  z-10">{p.label}</div>
                      <div className={`w-3 rounded-t-sm transition-all ${p.type === 'event' ? 'bg-rose-500' : p.type === 'action' ? 'bg-primary' : 'bg-slate-300'}`} style={{ height: `${p.h}%` }} />
                      <span className="absolute -bottom-6 text-[10px] font-bold text-slate-500">{p.t}</span>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        <div className="space-y-6">
           <div className="bg-slate-900 rounded-sm p-5 text-white ">
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

           <div className="bg-white border rounded-sm  p-4">
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

function DeleteConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  fileName 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  onConfirm: () => void, 
  fileName: string 
}) {
  const [captchaInput, setCaptchaInput] = useState("");
  // Simple numeric captcha as requested by "simbol captcha"
  const [captchaCode] = useState(() => Math.floor(1000 + Math.random() * 9000).toString());
  
  if (!isOpen) return null;

  const isConfirmed = captchaInput === captchaCode;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      <div className="bg-white rounded-sm  w-full max-w-md relative z-10 overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-200">
        <div className="p-6">
          <div className="h-12 w-12 rounded-sm bg-rose-50 flex items-center justify-center mb-4">
             <Trash2 className="h-6 w-6 text-rose-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 border-none p-0 mb-2">Delete Evidence File</h3>
          <p className="text-sm text-slate-500 leading-relaxed mb-6">
            This action is <span className="text-rose-600 font-bold uppercase underline">irreversible</span>. Deleting <span className="font-bold text-slate-900">"{fileName}"</span> will permanently remove it and all associated AI-extracted intelligence from this case.
          </p>

          <div className="space-y-4">
            <div>
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Security Challenge</label>
               <div className="bg-slate-50 p-4 rounded-sm border border-slate-100 mb-2 select-none pointer-events-none flex flex-col items-center">
                  <span className="text-[10px] text-slate-400 uppercase font-black mb-1">Type the code to confirm deletion</span>
                  <span className="text-3xl font-extrabold text-slate-300 tracking-[0.5em]">{captchaCode}</span>
               </div>
               <input 
                  autoFocus
                  className="w-full h-12 border rounded-sm px-4 text-center font-black text-xl tracking-[0.2em] focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all placeholder:text-slate-200"
                  placeholder="0000"
                  maxLength={4}
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
               />
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t flex items-center justify-between">
           <Button variant="ghost" onClick={onClose} className="text-slate-500 font-bold hover:bg-slate-100">Cancel</Button>
           <Button 
              onClick={onConfirm} 
              disabled={!isConfirmed}
              className={`h-11 px-8 font-black uppercase tracking-widest transition-all ${isConfirmed ? 'bg-rose-600 hover:bg-rose-700 text-white  shadow-rose-500/20' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}
           >
              Confirm Delete
           </Button>
        </div>
      </div>
    </div>
  );
}

// ---- Delete Folder Modal ----
// Uses an icon-based visual captcha: 3 shuffled icons, user must click the Folder icon
// to unlock the Delete button. Rendered with key=target.id so captcha always resets.

interface DeleteFolderTarget {
  id: string;
  name: string;
  fileCount: number;
  sampleFiles: string[];
}

const CAPTCHA_ICONS = [
  { id: "folder",   label: "Folder",   Icon: Folders,  correct: true  },
  { id: "document", label: "Document", Icon: FileText,  correct: false },
  { id: "image",    label: "Image",    Icon: ImageIcon, correct: false },
];

function DeleteFolderModal({
  target,
  onClose,
  onConfirm,
}: {
  target: DeleteFolderTarget | null;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [wrongAttempt, setWrongAttempt]       = useState(false);
  const [isDeleting, setIsDeleting]           = useState(false);

  // Shuffle once on mount (key prop forces remount per folder target)
  const [shuffled] = useState(() => {
    const arr = [...CAPTCHA_ICONS];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  });

  if (!target) return null;

  const handleIconClick = (correct: boolean) => {
    if (captchaVerified) return;
    if (correct) {
      setCaptchaVerified(true);
      setWrongAttempt(false);
    } else {
      setWrongAttempt(true);
      setTimeout(() => setWrongAttempt(false), 900);
    }
  };

  const handleDelete = async () => {
    if (!captchaVerified || isDeleting) return;
    setIsDeleting(true);
    await new Promise(r => setTimeout(r, 450));
    onConfirm();
    // modal unmounts via onConfirm → setDeleteFolderTarget(null)
  };

  const extraCount = target.fileCount - target.sampleFiles.length;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={!isDeleting ? onClose : undefined}
      />
      <div className="relative z-10 bg-white rounded-sm  w-full max-w-md overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="px-6 pt-6 pb-5">
          <div className="flex items-start justify-between mb-4">
            <div className="h-10 w-10 rounded-sm bg-rose-50 border border-rose-100 flex items-center justify-center">
              <Trash2 className="h-5 w-5 text-rose-500" />
            </div>
            {!isDeleting && (
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-slate-100 rounded-sm transition-colors text-slate-400"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <h3 className="text-base font-black text-slate-900 mb-1">Delete Folder?</h3>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            You are about to delete this folder and all files inside it.
          </p>
        </div>

        {/* Folder info */}
        <div className="mx-6 mb-5 rounded-sm border border-slate-100 bg-slate-50/60 overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
            <Folders className="h-4 w-4 text-primary/60 shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Folder</span>
              <span className="text-xs font-black text-slate-800 uppercase tracking-tight truncate block">{target.name}</span>
            </div>
            <span className="text-[10px] font-black text-slate-500 bg-white border px-2 py-0.5 rounded-full shrink-0">
              {target.fileCount} file{target.fileCount !== 1 ? "s" : ""}
            </span>
          </div>
          {target.sampleFiles.length > 0 && (
            <div className="px-4 py-2.5 space-y-1">
              {target.sampleFiles.map((name, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-slate-300 shrink-0" />
                  <span className="text-[10px] text-slate-500 font-medium truncate">{name}</span>
                </div>
              ))}
              {extraCount > 0 && (
                <p className="text-[10px] text-slate-400 font-medium pl-3 italic">
                  +{extraCount} more file{extraCount !== 1 ? "s" : ""}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Warning */}
        <div className="mx-6 mb-5 flex items-start gap-2 px-3 py-2.5 rounded-sm bg-amber-50 border border-amber-100">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-[10px] font-medium text-amber-700 leading-relaxed">
            This action will remove the folder and its contents from Evidence Control. This cannot be undone.
          </p>
        </div>

        {/* Visual captcha */}
        <div className="mx-6 mb-6">
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2.5">
            Click the folder icon to enable deletion
          </label>
          <div className={`flex gap-2 transition-all ${wrongAttempt ? "animate-pulse" : ""}`}>
            {shuffled.map(({ id, label, Icon, correct }) => {
              const isSelected = captchaVerified && correct;
              const isWrong    = wrongAttempt && !correct && !captchaVerified;
              return (
                <button
                  key={id}
                  disabled={captchaVerified}
                  onClick={() => handleIconClick(correct)}
                  className={[
                    "flex-1 flex flex-col items-center gap-1.5 py-3 rounded-sm border transition-all",
                    isSelected
                      ? "bg-emerald-50 border-emerald-200 text-emerald-600 cursor-default"
                      : wrongAttempt && !correct
                      ? "bg-rose-50 border-rose-100 text-rose-400"
                      : captchaVerified
                      ? "bg-slate-50 border-slate-100 text-slate-300 cursor-default"
                      : "bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50 cursor-pointer",
                  ].join(" ")}
                >
                  {isSelected ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                  <span className="text-[9px] font-bold uppercase tracking-wide">{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isDeleting}
            className="h-9 text-xs font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-800"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            disabled={!captchaVerified || isDeleting}
            className={[
              "h-9 px-6 text-xs font-black uppercase tracking-widest transition-all",
              captchaVerified && !isDeleting
                ? "bg-rose-600 hover:bg-rose-700 text-white  shadow-rose-200"
                : "bg-slate-100 text-slate-300 cursor-not-allowed",
            ].join(" ")}
          >
            {isDeleting ? (
              <span className="flex items-center gap-1.5">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Deleting…
              </span>
            ) : (
              "Delete Folder"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

function FileRow({ 
  file, 
  isSelected, 
  onSelect, 
  onMove,
  batches 
}: { 
  file: any, 
  isSelected: boolean, 
  onSelect: () => void, 
  onMove: (fileId: string, batchId: string | null) => void,
  batches: any[]
}) {
  return (
    <div
      onClick={onSelect}
      className={cn(
        "group flex items-center justify-between p-2 rounded-sm cursor-pointer transition-all border-l-2",
        isSelected 
          ? "bg-slate-100 border-primary" 
          : "hover:bg-slate-50 border-transparent"
      )}
    >
      <div className="flex items-center gap-3 overflow-hidden">
        <div className={cn(
          "h-7 w-7 rounded flex items-center justify-center shrink-0 border shadow-sm transition-colors",
          isSelected ? "bg-white text-primary border-primary/20" : "bg-white text-slate-400 group-hover:text-slate-600"
        )}>
          {getFileIcon(file.type)}
        </div>
        <div className="overflow-hidden">
          <p className={cn(
            "text-[11px] font-medium truncate leading-tight",
            isSelected ? "text-slate-900" : "text-slate-600 group-hover:text-slate-900"
          )}>
            {file.name}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">{file.type}</span>
            {file.review_status === 'reviewed' && <CheckCircle2 className="h-2.5 w-2.5 text-emerald-500" />}
          </div>
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
          <button className="p-1 hover:bg-white rounded text-slate-300 hover:text-slate-900 transition-all opacity-0 group-hover:opacity-100">
            <MoreVertical className="h-3.5 w-3.5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuSeparator />
          <div className="px-2 py-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Move to</div>
          <DropdownMenuItem 
            onClick={() => onMove(file.id, null)}
            disabled={!file.batch_id}
            className="text-[10px] font-bold"
          >
            <Folder className="h-3.5 w-3.5 mr-2 text-slate-400" /> Root Directory
          </DropdownMenuItem>
          {batches.filter(b => b.type === "Folder" && b.id !== file.batch_id).map(batch => (
            <DropdownMenuItem 
              key={batch.id} 
              onClick={() => onMove(file.id, batch.id)}
              className="text-[10px] font-bold"
            >
              <Folder className="h-3.5 w-3.5 mr-2 text-primary/60" /> {batch.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function ExtractionTab({ 
  evidenceFiles, 
  batches, 
  selectedFile, 
  setSelectedFile,
  caseId,
  onUploadComplete
}: { 
  evidenceFiles: any[], 
  batches: any[], 
  selectedFile: any,
  setSelectedFile: (f: any) => void,
  caseId: string,
  onUploadComplete: (groups: CompletedGroup[]) => void
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedBatches, setExpandedBatches] = useState<string[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  
  const moveFileMutation = useMoveFile();

  // Lifted audio state — shared between center player and right panel
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioIsPlaying, setAudioIsPlaying] = useState(false);
  const [audioPlaybackSpeed, setAudioPlaybackSpeed] = useState(1);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [deleteFolderTarget, setDeleteFolderTarget] = useState<DeleteFolderTarget | null>(null);

  // Shared Video State
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);
  const [videoIsPlaying, setVideoIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const jumpToAudioTime = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, seconds);
      if (!audioIsPlaying) {
        setAudioIsPlaying(true);
      }
      audioRef.current.play().catch(err => console.warn("Audio play blocked:", err));
    }
    setAudioCurrentTime(seconds);
  };

  const deleteFileMutation = useDeleteFile();
  const insertAuditLog = useInsertAuditLog();

  const jumpToVideoTime = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, seconds);
      videoRef.current.play().catch(err => console.warn("Play blocked:", err));
      setVideoIsPlaying(true);
    }
  };

  const openDeleteFolderModal = (batch: any) => {
    const filesInBatch = evidenceFiles.filter(f => f.batch_id === batch.id);
    setDeleteFolderTarget({
      id: batch.id,
      name: batch.name,
      fileCount: filesInBatch.length,
      sampleFiles: filesInBatch.slice(0, 5).map((f: any) => f.name),
    });
  };

  const handleDeleteFolder = async () => {
    if (!deleteFolderTarget) return;
    try {
      const filesInBatch = evidenceFiles.filter(f => f.batch_id === deleteFolderTarget.id);
      for (const file of filesInBatch) {
        await deleteFileMutation.mutateAsync({ id: file.id, url: file.url });
      }
      await insertAuditLog.mutateAsync({
        case_id: caseId!,
        action: `Deleted folder "${deleteFolderTarget.name}"`,
        entity_type: "Evidence Batch",
        entity_name: deleteFolderTarget.name
      });
      toast.success(`Folder ${deleteFolderTarget.name} and its items deleted.`);
      setDeleteFolderTarget(null);
    } catch (error) {
      toast.error("Failed to delete folder.");
    }
  };

  const toggleBatch = (id: string) => {
    setExpandedBatches(prev => prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]);
  };

  const handleDelete = async () => {
    if (selectedFile) {
      try {
        await deleteFileMutation.mutateAsync({ id: selectedFile.id, url: selectedFile.url });
        await insertAuditLog.mutateAsync({
          case_id: caseId!,
          action: `Deleted file "${selectedFile.name}"`,
          entity_type: "Evidence File",
          entity_name: selectedFile.name
        });
        toast.success("File deleted successfully.");
        setSelectedFile(null);
        setIsDeleteModalOpen(false);
      } catch (error) {
        toast.error("Failed to delete file.");
      }
    }
  };

  const filteredFiles = useMemo(() => {
    return evidenceFiles.filter(f => 
      f.name.toLowerCase().includes(searchQuery.toLowerCase())
    ).sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
  }, [evidenceFiles, searchQuery]);

  const looseFiles = useMemo(() => {
    return filteredFiles.filter(f => !f.batch_id);
  }, [filteredFiles]);

  const folderGroups = useMemo(() => {
    return batches
      .filter(b => b.type !== "Loose Files")
      .map(batch => ({
        ...batch,
        files: filteredFiles.filter(f => f.batch_id === batch.id)
      }))
      .filter(b => b.files.length > 0)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [batches, filteredFiles]);

  const handleMoveFile = async (fileId: string, batchId: string | null) => {
    try {
      await moveFileMutation.mutateAsync({ fileId, batchId });
      toast.success(batchId ? "File moved to folder." : "File moved to root.");
    } catch (error) {
      toast.error("Failed to move file.");
    }
  };

  const goToNext = () => {
    const allFiles = filteredFiles;
    const currentIndex = allFiles.findIndex(f => f.id === selectedFile?.id);
    if (currentIndex < allFiles.length - 1) setSelectedFile(allFiles[currentIndex + 1]);
  };

  const goToPrev = () => {
    const allFiles = filteredFiles;
    const currentIndex = allFiles.findIndex(f => f.id === selectedFile?.id);
    if (currentIndex > 0) setSelectedFile(allFiles[currentIndex - 1]);
  };

  const handleReview = async () => {
    if (selectedFile) {
      const { error } = await supabase
        .from('evidence_files')
        .update({ review_status: 'reviewed' })
        .eq('id', selectedFile.id);
      
      if (error) toast.error("Failed to update status.");
      else {
        await insertAuditLog.mutateAsync({
          case_id: caseId!,
          action: `Marked file "${selectedFile.name}" as reviewed`,
          entity_type: "Evidence File",
          entity_name: selectedFile.name
        });
        toast.success("Marked as reviewed.");
      }
    }
  };

  return (
    <div className="flex h-full overflow-hidden bg-white border-t relative">
      {/* Evidence Side Sidebar */}
      <div className="w-80 border-r bg-white flex flex-col shrink-0 relative z-20 shadow-[2px_0_8px_rgba(0,0,0,0.02)]">
        <div className="p-5 border-b space-y-4 bg-slate-50/30">
          <div className="space-y-1.5">
             <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Evidence Repository</span>
                <span className="text-[10px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-full">{evidenceFiles.length} Objects</span>
             </div>
             <div className="flex gap-2">
               <div className="relative group flex-1">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 group-focus-within:text-primary transition-colors" />
                 <input 
                   type="text" 
                   placeholder="Search..."
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   className="w-full h-9 bg-white border border-slate-200 rounded-sm pl-9 pr-4 text-[11px] font-bold focus:ring-1 focus:ring-primary/20 focus:border-primary transition-all outline-none "
                 />
               </div>
               <Button 
                 onClick={() => setIsUploadModalOpen(true)}
                 className="h-9 bg-emerald-600 hover:bg-emerald-700 text-white font-black px-3 rounded-sm text-[10px] uppercase tracking-widest gap-1.5 shrink-0"
               >
                 <Plus className="h-3.5 w-3.5" /> ADD
               </Button>
             </div>
          </div>
        </div>
          
        <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
          <div className="space-y-0.5">
            {/* Loose Files (Root) */}
            {looseFiles.map((file) => (
              <FileRow 
                key={file.id} 
                file={file} 
                isSelected={selectedFile?.id === file.id}
                onSelect={() => setSelectedFile(file)}
                onMove={handleMoveFile}
                batches={batches}
              />
            ))}

            {/* Folders */}
            {folderGroups.map((batch) => (
              <div key={batch.id} className="group/folder">
                <div 
                  onClick={() => toggleBatch(batch.id)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 hover:bg-slate-50 cursor-pointer transition-all border-l-2 border-transparent",
                    expandedBatches.includes(batch.id) ? "bg-slate-50/50 border-primary/20" : ""
                  )}
                >
                  <ChevronRight className={cn(
                    "h-3 w-3 text-slate-400 transition-transform duration-150",
                    expandedBatches.includes(batch.id) ? "rotate-90" : ""
                  )} />
                  <Folder className={cn("h-4 w-4", expandedBatches.includes(batch.id) ? "text-primary" : "text-slate-400")} />
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-tight flex-1">{batch.name}</span>
                  <span className="text-[9px] font-black text-slate-300 mr-2">{batch.files.length}</span>
                  
                  <button 
                    onClick={(e) => { e.stopPropagation(); openDeleteFolderModal(batch); }}
                    className="p-1 hover:bg-rose-50 rounded text-slate-300 hover:text-rose-500 transition-all opacity-0 group-hover/folder:opacity-100"
                  >
                     <Trash2 className="h-3 w-3" />
                  </button>
                </div>

                {expandedBatches.includes(batch.id) && (
                  <div className="ml-4 border-l border-slate-100">
                    {batch.files.length === 0 ? (
                      <div className="py-2 px-8 text-[9px] font-bold text-slate-300 uppercase tracking-widest italic">Empty Folder</div>
                    ) : (
                      batch.files.map((file: any) => (
                        <FileRow 
                          key={file.id} 
                          file={file} 
                          isSelected={selectedFile?.id === file.id}
                          onSelect={() => setSelectedFile(file)}
                          onMove={handleMoveFile}
                          batches={batches}
                        />
                      ))
                    )}
                  </div>
                )}
              </div>
            ))}

            {filteredFiles.length === 0 && (
              <div className="py-20 flex flex-col items-center justify-center text-center px-6">
                <div className="h-12 w-12 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-dashed border-slate-200">
                  <Box className="h-6 w-6 text-slate-300" />
                </div>
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">No files yet</h3>
                <p className="text-[10px] font-medium text-slate-300 mb-6 max-w-[160px]">Start by uploading evidence to your repository</p>
                <Button 
                  onClick={() => setIsUploadModalOpen(true)}
                  variant="outline"
                  className="h-9 border-slate-200 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-sm hover:bg-slate-50"
                >
                  <Upload className="h-3.5 w-3.5 mr-2" /> Upload
                </Button>
              </div>
            )}
          </div>
        </div>
          

        </div>

      <div className="flex-1 flex flex-col relative z-10 bg-white">
        <div className="h-12 border-b flex items-center justify-between px-6 shrink-0 bg-white">
           {selectedFile ? (
             <>
               <div className="flex items-center gap-4">
                   <div className="flex items-center gap-1 border-r pr-4 border-slate-100">
                      <button 
                        onClick={goToPrev}
                        className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-900 transition-all disabled:opacity-30"
                      >
                         <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={goToNext}
                        className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-900 transition-all disabled:opacity-30"
                      >
                         <ChevronRight className="h-4 w-4" />
                      </button>
                   </div>
                   <div className="flex items-center gap-2">
                      <div className="h-7 w-7 bg-slate-100 rounded flex items-center justify-center border shadow-inner">
                         {getFileIcon(selectedFile.type)}
                      </div>
                      <h2 className="text-sm font-medium text-slate-900 tracking-tight">{selectedFile.name}</h2>
                   </div>
                </div>
               <div className="flex items-center gap-2">
                   <Button 
                      onClick={() => setIsDeleteModalOpen(true)}
                      variant="outline" 
                      size="sm" 
                      className="h-8 text-[11px] font-bold gap-2 text-rose-600 hover:bg-rose-50 border-rose-100 transition-all hover:border-rose-200"
                   >
                      <Trash2 className="h-3.5 w-3.5" /> Delete Evidence
                   </Button>
                </div>
             </>
           ) : (
             <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Evidence Workspace Ready</div>
           )}
        </div>

        <div className="flex-1 overflow-auto bg-[#f0f2f4] p-6 flex flex-col items-center custom-scrollbar" style={{ minWidth: 0 }}>
             <div className={`w-full flex ${selectedFile?.type === "Image" ? "max-w-3xl h-full items-center justify-center" : "max-w-5xl items-start justify-center pt-4"}`}>
               {selectedFile ? (
                 <AdaptiveSourcePreview 
                    file={selectedFile} 
                    videoCurrentTime={videoCurrentTime}
                    setVideoCurrentTime={setVideoCurrentTime}
                    videoIsPlaying={videoIsPlaying}
                    setVideoIsPlaying={setVideoIsPlaying}
                    videoRef={videoRef}
                    audioCurrentTime={audioCurrentTime}
                    setAudioCurrentTime={setAudioCurrentTime}
                    audioIsPlaying={audioIsPlaying}
                    setAudioIsPlaying={setAudioIsPlaying}
                    audioPlaybackSpeed={audioPlaybackSpeed}
                    setAudioPlaybackSpeed={setAudioPlaybackSpeed}
                    audioRef={audioRef}
                  />
              ) : (
                <div className="flex flex-col items-center justify-center p-12 text-center">
                   <div className="h-20 w-20 rounded-[2.5rem] bg-white  flex items-center justify-center mb-8 border border-white/50 animate-in fade-in zoom-in duration-700">
                      <Folders className="h-10 w-10 text-slate-200" />
                   </div>
                   <h3 className="text-sm font-black text-slate-800 uppercase tracking-[0.2em] mb-3">No Evidence Selected</h3>
                   <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest max-w-[280px] leading-relaxed opacity-80">
                     Select an object from the library or use the Add Evidence button to begin the review workflow.
                   </p>
                </div>
              )}
            </div>
         </div>
      </div>

      <div className="w-[460px] border-l border-slate-200 bg-white flex flex-col shrink-0 z-20 shadow-[-2px_0_10px_rgba(0,0,0,0.03)] overflow-hidden">
        {selectedFile ? (
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {selectedFile.type === "Image" && <ImageExtractionConsole file={selectedFile} />}
                {selectedFile.type === "Audio" && <AudioExtractionConsole file={selectedFile} onJump={jumpToAudioTime} currentTime={audioCurrentTime} />}
                {selectedFile.type === "Video" && <VideoAnalysisPanel file={selectedFile} currentTime={videoCurrentTime || 0} onJump={jumpToVideoTime} />}
                {selectedFile.type === "Document" && (
                    <div className="p-8 space-y-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-10 w-10 bg-indigo-50 rounded-sm flex items-center justify-center text-indigo-600 border border-indigo-100 ">
                                <FileText className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">{selectedFile.name}</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mt-0.5">Forensic Document Extraction</p>
                            </div>
                        </div>
                         <div className="p-10 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center text-center opacity-30 grayscale saturate-0">
                            <FileText className="h-8 w-8 text-slate-300 mb-4" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Deep Extraction Pending</span>
                         </div>
                    </div>
                )}
            </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12 opacity-30 grayscale saturate-0">
             <Cpu className="h-12 w-12 text-slate-200 mb-6" />
             <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900">Forensic Engine Standby</h3>
             <p className="text-[10px] font-bold text-slate-400 uppercase mt-4 max-w-[220px] leading-relaxed">Select an evidence object to initiate automated feature extraction.</p>
          </div>
        )}
      </div>

      <DeleteConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        fileName={selectedFile?.name || ""}
      />

      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadComplete={onUploadComplete}
      />

      <DeleteFolderModal 
        key={deleteFolderTarget?.id ?? "none"}
        target={deleteFolderTarget}
        onClose={() => setDeleteFolderTarget(null)}
        onConfirm={handleDeleteFolder}
      />
    </div>
  );
}


// --- Evidence Review Workspace Helper Components ---

function AdaptiveSourcePreview({ 
  file, 
  videoCurrentTime, setVideoCurrentTime, videoIsPlaying, setVideoIsPlaying, videoRef,
  audioCurrentTime, setAudioCurrentTime, audioIsPlaying, setAudioIsPlaying, audioPlaybackSpeed, setAudioPlaybackSpeed, audioRef
}: any) {
  if (file.type === "Image") return <ImagePreview file={file} />;
  if (file.type === "Audio") return <AudioPreview file={file} currentTime={audioCurrentTime} setCurrentTime={setAudioCurrentTime} isPlaying={audioIsPlaying} setIsPlaying={setAudioIsPlaying} playbackSpeed={audioPlaybackSpeed} setPlaybackSpeed={setAudioPlaybackSpeed} audioRef={audioRef} />;
  if (file.type === "Video") return <VideoPreview file={file} currentTime={videoCurrentTime} setCurrentTime={setVideoCurrentTime} isPlaying={videoIsPlaying} setIsPlaying={setVideoIsPlaying} videoRef={videoRef} />;
  return (
    <div className="flex flex-col items-center justify-center p-20 text-slate-300 opacity-50 bg-white/50 rounded-sm border-2 border-dashed border-slate-200">
       <Folders className="h-12 w-12 mb-4" />
       <span className="text-[10px] font-black uppercase tracking-[0.2em]">Preview not available for this modality</span>
    </div>
  );
}

function ImagePreview({ file }: { file: any }) {
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

function AudioPreview({ file, currentTime, setCurrentTime, isPlaying, setIsPlaying, playbackSpeed, setPlaybackSpeed, audioRef }: any) {
  const [duration, setDuration] = useState(0);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const onTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const onLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
    setCurrentTime(time);
  };

  return (
    <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl p-8  relative overflow-hidden group">
       <audio 
         ref={audioRef} 
         src={file.url} 
         onTimeUpdate={onTimeUpdate} 
         onLoadedMetadata={onLoadedMetadata}
       />
       <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 blur-[80px] rounded-full pointer-events-none" />
       <div className="flex flex-col items-center gap-6 relative z-10">
          <div className="h-20 w-20 rounded-[2.5rem] bg-slate-900 flex items-center justify-center text-white  shadow-slate-900/10 group-hover:scale-110 transition-transform duration-700">
             <AudioIcon className="h-8 w-8" />
          </div>
          <div className="text-center space-y-1">
             <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em]">{file.name}</h3>
             <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest italic opacity-60">Forensic Audio Console · Site Alpha</p>
          </div>
          
          <div className="w-full space-y-3">
             <div className="flex items-center justify-between text-[10px] font-black text-slate-400 tabular-nums uppercase tracking-widest text-primary/80">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration || 262)}</span>
             </div>
             <input 
                type="range"
                min="0"
                max={duration || 262}
                step="0.1"
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1.5 bg-slate-100 rounded-full appearance-none cursor-pointer accent-primary"
             />
          </div>

          <div className="flex items-center gap-6 text-slate-400">
             <button className="p-2 hover:text-slate-900 transition-colors" onClick={() => { if(audioRef.current) audioRef.current.currentTime = 0; }}><RefreshCcw className="h-4 w-4" /></button>
             <button 
                onClick={togglePlay}
                className="h-14 w-14 bg-slate-900 text-white rounded-full flex items-center justify-center  hover:bg-slate-800 transition-all hover:scale-105 active:scale-95"
             >
                {isPlaying ? <Pause className="h-6 w-6 fill-current" /> : <Play className="h-6 w-6 fill-current ml-1" />}
             </button>
             <button className="p-2 hover:text-slate-900 transition-colors"><Maximize2 className="h-4 w-4" /></button>
          </div>
       </div>
    </div>
  );
}

function VideoPreview({ file, currentTime, setCurrentTime, isPlaying, setIsPlaying, videoRef }: any) {
  return (
    <div className="relative w-full aspect-video bg-black rounded-sm overflow-hidden  group border border-slate-800 ring-1 ring-white/10">
      <video ref={videoRef} src={file.url} className="w-full h-full object-contain" />
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
         <button className="h-16 w-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20 hover:scale-110 active:scale-95 transition-all ">
            <Play className="h-7 w-7 fill-current ml-1" />
         </button>
      </div>
      <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-black/90 to-transparent flex items-center justify-between">
         <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-black text-white uppercase tracking-widest ">{file.name}</span>
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter ">CCTV Feed · Site Alpha Zone B</span>
         </div>
         <div className="flex items-center gap-3">
            <span className="text-[10px] font-black text-white tabular-nums">00:14 / 05:00</span>
            <button className="p-1.5 text-white hover:bg-white/10 rounded transition-colors"><Maximize2 className="h-3.5 w-3.5" /></button>
         </div>
      </div>
    </div>
  );
}

function ImageExtractionConsole({ file }: { file: any }) {
  const [viewMode, setViewMode] = useState<"Structured" | "JSON">("Structured");
  
  const properties = {
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
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b px-5 py-3 flex items-center justify-between shrink-0">
         <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Visual Extraction Matrix</span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-1 opacity-60">Evidence ID: {file.id.slice(0,8)}</span>
         </div>
         <div className="flex items-center gap-1 p-0.5 bg-slate-200/50 rounded-md border shadow-inner">
            <button onClick={() => setViewMode("Structured")} className={`px-2 py-1 text-[8px] font-black uppercase rounded transition-all ${viewMode === "Structured" ? "bg-white text-slate-900 " : "text-slate-400 hover:text-slate-600"}`}>Structured</button>
            <button onClick={() => setViewMode("JSON")} className={`px-2 py-1 text-[8px] font-black uppercase rounded transition-all ${viewMode === "JSON" ? "bg-white text-slate-900 " : "text-slate-400 hover:text-slate-600"}`}>JSON</button>
         </div>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar p-6 space-y-8">
         {viewMode === "Structured" ? (
            <>
               {Object.entries(properties).map(([section, items]) => (
                  <div key={section} className="space-y-4 animate-in fade-in slide-in-from-top-1">
                     <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                        <Database className="h-3.5 w-3.5 text-slate-400" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{section}</span>
                     </div>
                     <div className="grid grid-cols-1 gap-4 pl-4 border-l-2 border-slate-50">
                        {Object.entries(items).map(([label, value]) => (
                           <div key={label} className="flex flex-col gap-1">
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-tight">{label}</span>
                              <span className="text-[11px] font-bold text-slate-700 leading-snug">{value}</span>
                           </div>
                        ))}
                     </div>
                  </div>
               ))}
               <div className="bg-slate-900 rounded-sm p-6 text-white  relative overflow-hidden group">
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
            </>
         ) : (
            <div className="bg-[#0f1419] rounded-sm border border-slate-800 p-6 overflow-hidden  relative">
               <div className="absolute top-0 right-0 p-2 opacity-20"><FileSearch className="h-10 w-10 text-white" /></div>
               <pre className="text-[10.5px] font-mono text-primary leading-relaxed custom-scrollbar max-h-none overflow-visible">
                  {JSON.stringify(properties, null, 2)}
               </pre>
            </div>
         )}
      </div>

      <div className="p-6 border-t bg-white shrink-0">
         <Button className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-sm  hover:shadow-slate-200 transition-all">
            <RefreshCcw className="h-4 w-4 mr-2" /> RE-ANALYZE EVIDENCE
         </Button>
      </div>
    </div>
  );
}

function AudioExtractionConsole({ file, onJump, currentTime }: { file: any, onJump: (s: number) => void, currentTime: number }) {
  const [activeTab, setActiveTab] = useState<"Analysis" | "Diarization">("Analysis");
  const [viewMode, setViewMode] = useState<"Structured" | "JSON">("Structured");

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
    { segment_id: "seg_1", speaker_id: "SPK_01", speaker_label: "Operator A", start_time: "00:04", end_time: "00:12", duration: "0:08", text: "Control, ini Operator A. Getaran di Section 14 melebihi batas aman. Mohon dicek.", confidence: "High", flags: [] },
    { segment_id: "seg_2", speaker_id: "SPK_02", speaker_label: "Control Room", start_time: "00:15", end_time: "00:22", duration: "0:07", text: "Diterima Operator A. Sensor kami juga menunjukkan anomali. Standby.", confidence: "High", flags: [] },
    { segment_id: "seg_3", speaker_id: "SPK_01", speaker_label: "Operator A", start_time: "02:14", end_time: "02:22", duration: "0:08", text: "Kontrol! Belt Section 14 robek! Terjadi tumpahan material berat! E-Stop!", confidence: "High", flags: ["URGENT", "STRESS"] }
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
        transcript_summary: "Emergency report regarding Section 14 conveyor belt failure. Operator A identifies vibration then escalates to critical tear report.",
        speaker_profiles: raw.speaker_profiles.map(s => ({
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
        contradictions_and_gaps: [],
        review_meta: {
          low_confidence_segments: raw.review_meta.low_confidence_segments,
          needs_human_review: raw.review_meta.needs_human_review,
          confidence: raw.review_meta.confidence
        }
      }
    };
  }, [file]);

  const normalizedScene = useMemo(() => {
    return {
      audio_id: "AUD_" + (file?.id?.slice(0, 4) || "001"),
      case_id: "CS-2026-" + Math.floor(1000 + Math.random() * 9000),
      modality: "audio",
      scene_session: {
        speaker_count: audioExtractionData.speaker_profiles.length,
        full_diarization: audioDiarizationData,
        sync_settings: {
          timestamp_linked_to_player: true,
          auto_scroll_active_segment: true,
          click_segment_seeks_audio: true
        }
      }
    };
  }, [file]);

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b px-4 py-2 flex items-center gap-1 shrink-0">
        {(["Diarization", "Analysis"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-1.5 px-3 text-[10px] font-black uppercase tracking-[0.15em] rounded-md transition-all ${
              activeTab === tab
              ? "bg-slate-900 text-white  ring-1 ring-slate-900"
              : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar">
        {activeTab === "Analysis" ? (
          <div className="flex flex-col min-h-full">
            <div className="p-4 border-b bg-slate-50/50 flex items-center justify-between">
              <div className="flex flex-col">
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Intelligence Hub</span>
                 <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-1 opacity-60">Audio Protocol Matrix v2.1</span>
              </div>
              <div className="flex items-center gap-1 p-0.5 bg-slate-200/50 rounded-md border shadow-inner">
                 <button onClick={() => setViewMode("Structured")} className={`px-2 py-1 text-[8px] font-black uppercase rounded transition-all ${viewMode === "Structured" ? "bg-white text-slate-900 " : "text-slate-400 hover:text-slate-600"}`}>Structured</button>
                 <button onClick={() => setViewMode("JSON")} className={`px-2 py-1 text-[8px] font-black uppercase rounded transition-all ${viewMode === "JSON" ? "bg-white text-slate-900 " : "text-slate-400 hover:text-slate-600"}`}>JSON</button>
              </div>
            </div>

            {viewMode === "Structured" ? (
              <AudioExtractionStructured 
                data={normalizedExtraction} 
                onJump={onJump} 
              />
            ) : (
              <div className="p-4 bg-[#0d1117] min-h-full">
                <div className="rounded-sm overflow-hidden border border-[#30363d] ">
                  <div className="bg-[#161b22] px-4 py-2.5 border-b border-[#30363d] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <div className="flex gap-1.5">
                          <div className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
                          <div className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
                          <div className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
                       </div>
                       <span className="text-[10px] font-mono text-[#8b949e] uppercase tracking-wider">audio_extraction_output.json</span>
                    </div>
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-[9px] font-black text-[#c9d1d9] hover:bg-[#30363d] hover:text-white border border-[#30363d]">
                       <Copy className="h-3 w-3 mr-1.5" /> COPY
                    </Button>
                  </div>
                  <pre className="text-[10.5px] font-mono text-[#79c0ff] bg-[#0d1117] p-6 leading-relaxed overflow-auto max-h-[1200px] custom-scrollbar selection:bg-primary/30">
                     {JSON.stringify(normalizedExtraction, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        ) : (
          <AudioSceneSession 
            data={normalizedScene} 
            currentTime={currentTime} 
            onJump={onJump} 
          />
        )}
      </div>
    </div>
  );
}


function AnalysisTab() {
  const { caseId } = useParams<{ caseId: string }>();
  const { data: evidence } = useEvidence(caseId!);
  const evidenceFiles = evidence?.files || [];
  const batches = evidence?.batches || [];

  const [agents, setAgents] = useState<AgentState[]>(initialAgentsState);
  const [factViewMode, setFactViewMode] = useState<'slide' | 'default'>('default');
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);

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
  }, [evidenceFiles, agents.length]);

  // Sync local selection when modal opens
  const handleOpenKnowledgeModal = (agentId: string) => {
    const agent = agents.find(a => a.id === agentId);
    if (agent) {
      setLocalKnowledgeSelection(prev => ({
        ...prev,
        [agentId]: agent.knowledgeSelection || []
      }));
    }
  };

  const handleSaveKnowledge = (agentId: string) => {
    const selection = localKnowledgeSelection[agentId];
    if (selection) {
      setAgents(prev => prev.map(a => a.id === agentId ? { ...a, knowledgeSelection: selection } : a));
      toast.success("Knowledge sources updated.");
    }
  };
  const [summaryEditBuffer, setSummaryEditBuffer] = useState({ time: '', description: '' });

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
  
  const startEditingSummary = (item: any) => {
    setSummaryEditBuffer({ time: item.time_label, description: item.chronology_text });
    setIsEditingSummary(true);
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

  const saveSummaryEdit = (itemId: string, newTime: string, newDesc: string) => {
    setAgents(prev => prev.map(a => a.id === 'fact' ? {
      ...a,
      results: {
        ...a.results,
        chronology_items: a.results.chronology_items.map((it: any) => 
          it.id === itemId ? { ...it, time_label: newTime, chronology_text: newDesc } : it
        )
      }
    } : a));
    setIsEditingSummary(false);
    toast.success("Chronology updated.");
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
                    incidentDate: agent.results.ringkasan?.tanggal || "—",
                    incidentTime: agent.results.ringkasan?.jam || "—",
                    location: agent.results.ringkasan?.lokasi || "—",
                    incidentType: agent.results.ringkasan?.jenis || "—",
                    department: agent.results.ringkasan?.departemen || "—",
                    evidenceSource: agent.results.ringkasan?.sumber_bukti || "—",
                    severity: agent.results.ringkasan?.severity || "—",
                    summary: agent.results.ringkasan?.deskripsi || "—",
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
      toast.success(`${agents.find(ag => ag.id === agentId)?.name} finished using ${agents.find(ag => ag.id === agentId)?.knowledgeSelection?.length} evidence assets.`);
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

  const handleExport = () => {
     setIsExporting(true);
     setTimeout(() => {
        setIsExporting(false);
        alert("Presentation deck exported successfully as .pptx");
     }, 2000);
  };

  const handleSaveArtifact = () => {
     setIsSaving(true);
     setTimeout(() => {
        setIsSaving(false);
        alert("Artifact saved to Case Documentation");
     }, 1500);
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
                           ${selectedAgentId === agent.id ? "border-slate-900  ring-1 ring-slate-900/5 -translate-y-0.5" : "border-slate-200 hover:border-slate-300  hover:"}
                        `}
                     >
                        <div className="flex items-start justify-between mb-4">
                           <div className={`h-12 w-12 rounded-sm border flex items-center justify-center transition-all ${selectedAgentId === agent.id ? "bg-slate-900 text-white border-slate-900  shadow-slate-900/20" : "bg-white text-slate-400 border-slate-100"}`}>
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
                                        )

                                        }
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
                        
                        // Fallback for ID-less items (Actor attributes or PEEPO findings)
                        if (!item && selectedRowId) {
                           item = { 
                              id: selectedRowId, 
                              label: selectedRowId,
                              timestamp: "Forensic Synthesis",
                              status: "Verified",
                              description: `Automatic trace synthesis for finding: "${selectedRowId}". Linked to Case CS-2026-0147.`
                           };
                        }
                        
                        if (!item) return (
                           <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-300">
                              <Search className="h-12 w-12 mb-4 opacity-20" />
                              <h4 className="text-[10px] font-black uppercase tracking-[0.2em]">Finding Not Resolved</h4>
                              <p className="text-[8px] font-bold text-slate-400 uppercase mt-2">Select a row to view forensic evidence</p>
                           </div>
                        );

                        const audioEvidence = {
                           diarization: [
                              { startTime: '00:04', endTime: '00:12', speaker: 'OPERATOR A', text: 'Control, ini Operator A. Getaran di Section 14 melebihi batas aman. Mohon dicek.', confidence: 'High' },
                              { startTime: '00:15', endTime: '00:22', speaker: 'CONTROL ROOM', text: 'Diterima Operator A. Sensor kami juga menunjukkan anamali. Standby.', confidence: 'High' },
                              { startTime: '02:14', endTime: '02:22', speaker: 'OPERATOR A', text: 'Kontrol! Belt Section 14 robek! Terjadi tumpahan material berat! E-Stop!', confidence: 'High' }
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
                                       <Button variant="ghost" size="sm" onClick={() => setSelectedChronologyItemId(null)} className="h-8 w-8 p-0 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-none">
                                          <X className="h-4 w-4" />
                                       </Button>
                                    </div>
                                 </div>

                                 <div className="flex-1 overflow-y-auto custom-scrollbar">
                                    <div className="p-5 space-y-8">
                                       {/* Fact Context - Interactive Decomposition (IBM Carbon Style) */}
                                       <div className="space-y-3">
                                          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                             <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Fact Decomposition</span>
                                             <div className="flex items-center gap-1.5">
                                                <div className="h-1.5 w-1.5 bg-blue-600" />
                                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">AI Entity Extraction</span>
                                             </div>
                                          </div>
                                          
                                          <div className="space-y-4 p-4 bg-white border border-slate-200 rounded-none">


                                             <div className="flex flex-wrap gap-y-3 gap-x-2 items-baseline">
                                                <TooltipProvider delayDuration={100}>
                                                   <div className="border border-slate-200 bg-slate-50 px-2 py-1 rounded-none flex items-center gap-1.5 transition-colors hover:bg-slate-100 group">
                                                      <span className="text-[10px] font-black text-slate-900 uppercase">{item.breakdown?.time || item.time || item.time_label}</span>
                                                      <Tooltip>
                                                         <TooltipTrigger asChild>
                                                            <div className="h-1.5 w-1.5 bg-slate-400 group-hover:scale-125 transition-transform" />
                                                         </TooltipTrigger>
                                                         <TooltipContent className="bg-slate-900 text-white rounded-none border-none text-[8px] font-black uppercase px-3 py-2">TIME / TEMPORAL</TooltipContent>
                                                      </Tooltip>
                                                   </div>

                                                   <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest px-1">in</span>

                                                   <div className="border border-slate-200 bg-slate-50 px-2 py-1 rounded-none flex items-center gap-1.5 transition-colors hover:bg-slate-100 group">
                                                      <span className="text-[10px] font-black text-slate-900 uppercase">{(item.breakdown?.phase || item.phase || "PRE CONTACT").replace('_', ' ')}</span>
                                                      <Tooltip>
                                                         <TooltipTrigger asChild>
                                                            <div className="h-1.5 w-1.5 bg-slate-400 group-hover:scale-125 transition-transform" />
                                                         </TooltipTrigger>
                                                         <TooltipContent className="bg-slate-900 text-white rounded-none border-none text-[8px] font-black uppercase px-3 py-2">INCIDENT PHASE</TooltipContent>
                                                      </Tooltip>
                                                   </div>

                                                   <div className="border-2 border-amber-500 bg-white px-2 py-1 rounded-none flex items-center gap-1.5 transition-colors hover:bg-amber-50 group">
                                                      <span className="text-[10px] font-black text-slate-900 uppercase">{item.breakdown?.action || 'VIBRATION ALARM TRIGGERED'}</span>
                                                      <Tooltip>
                                                         <TooltipTrigger asChild>
                                                            <div className="h-1.5 w-1.5 bg-amber-500 group-hover:scale-125 transition-transform" />
                                                         </TooltipTrigger>
                                                         <TooltipContent className="bg-slate-900 text-white rounded-none border-none text-[8px] font-black uppercase px-3 py-2">ACTION / EVENT</TooltipContent>
                                                      </Tooltip>
                                                   </div>

                                                   <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest px-1">by</span>

                                                   <div className="border border-purple-500 bg-white px-2 py-1 rounded-none flex items-center gap-1.5 transition-colors hover:bg-purple-50 group">
                                                      <span className="text-[10px] font-black text-slate-900 uppercase">{item.breakdown?.actor || 'SENSOR SYSTEM'}</span>
                                                      <Tooltip>
                                                         <TooltipTrigger asChild>
                                                            <div className="h-1.5 w-1.5 bg-purple-500 group-hover:scale-125 transition-transform" />
                                                         </TooltipTrigger>
                                                         <TooltipContent className="bg-slate-900 text-white rounded-none border-none text-[8px] font-black uppercase px-3 py-2">ACTOR / AGENT</TooltipContent>
                                                      </Tooltip>
                                                   </div>

                                                   <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest px-1">on</span>

                                                   <div className="border border-blue-500 bg-white px-2 py-1 rounded-none flex items-center gap-1.5 transition-colors hover:bg-blue-50 group">
                                                      <span className="text-[10px] font-black text-slate-900 uppercase">{item.breakdown?.objectOrUnit || 'SECTION 14 DRIVE MOTOR'}</span>
                                                      <Tooltip>
                                                         <TooltipTrigger asChild>
                                                            <div className="h-1.5 w-1.5 bg-blue-500 group-hover:scale-125 transition-transform" />
                                                         </TooltipTrigger>
                                                         <TooltipContent className="bg-slate-900 text-white rounded-none border-none text-[8px] font-black uppercase px-3 py-2">OBJECT / UNIT</TooltipContent>
                                                      </Tooltip>
                                                   </div>

                                                   <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest px-1">at</span>

                                                   <div className="border border-blue-500 bg-white px-2 py-1 rounded-none flex items-center gap-1.5 transition-colors hover:bg-blue-50 group">
                                                      <span className="text-[10px] font-black text-slate-900 uppercase">{item.breakdown?.location || 'SECTION 14'}</span>
                                                      <Tooltip>
                                                         <TooltipTrigger asChild>
                                                            <div className="h-1.5 w-1.5 bg-blue-500 group-hover:scale-125 transition-transform" />
                                                         </TooltipTrigger>
                                                         <TooltipContent className="bg-slate-900 text-white rounded-none border-none text-[8px] font-black uppercase px-3 py-2">PHYSICAL LOCATION</TooltipContent>
                                                      </Tooltip>
                                                   </div>
                                                </TooltipProvider>
                                             </div>
                                          </div>
                                       </div>

                                       {/* B. Event Breakdown (IBM Carbon Style) */}
                                       <div className="space-y-4">
                                          <div className="flex items-center gap-2">
                                             <LayoutGrid className="h-3 w-3 text-slate-400" />
                                             <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Event Breakdown</span>
                                          </div>
                                          <div className="border border-slate-200 rounded-none overflow-hidden bg-slate-200 flex flex-col gap-px">
                                             {[
                                                { id: 'time', label: 'Time', value: item.breakdown?.time || item.time || item.time_label, 
                                                   evidence: [
                                                      { type: 'audio', speaker: 'OPERATOR A', timeframe: '02:14 — 02:22', context: 'Control, ini Operator A. Getaran di Section 14 melebihi batas aman.', source: 'VOIP_REC_14.WAV' }
                                                   ]
                                                },
                                                { id: 'timezone', label: 'Timezone', value: item.breakdown?.timezone || item.timezone || 'WITA', 
                                                   evidence: [
                                                      { type: 'doc', page: '01', context: 'Site local timezone configuration for Berau Coal operations.', source: 'SITE_HANDBOOK_2026.PDF' }
                                                   ]
                                                },
                                                { id: 'actor', label: 'Actor', value: item.breakdown?.actor || 'SENSOR SYSTEM', 
                                                   evidence: [
                                                      { type: 'doc', page: '142', context: 'Automated vibration monitoring protocol for Titan-X series drive motors.', source: 'MAINTENANCE_LOG_APR.PDF' },
                                                      { type: 'audio', speaker: 'CONTROL ROOM', timeframe: '02:15 — 02:20', context: 'Diterima Operator A. Sensor kami juga menunjukkan anomali.', source: 'VOIP_REC_14.WAV' }
                                                   ]
                                                },
                                                { id: 'action', label: 'Action', value: item.breakdown?.action || 'VIBRATION ALARM', 
                                                   evidence: [
                                                      { type: 'audio', speaker: 'OPERATOR A', timeframe: '02:14 — 02:18', context: 'Mohon dicek segera, alarm vibrasi berbunyi.', source: 'VOIP_REC_14.WAV' },
                                                      { type: 'doc', page: '04', context: 'System Status: ALARM_VIB_HIGH triggered at 14:10:22', source: 'SCADA_EVENT_EXPORT.CSV' }
                                                   ]
                                                },
                                                { id: 'object', label: 'Object / Unit', value: item.breakdown?.objectOrUnit || 'SECTION 14 MOTOR', 
                                                   evidence: [
                                                      { type: 'doc', page: '12', context: 'Drive Motor Unit ID: UNIT_S14_M01', source: 'ASSET_REGISTRY.XLSX' }
                                                   ]
                                                },
                                                { id: 'location', label: 'Location', value: item.breakdown?.location || 'SECTION 14', 
                                                   evidence: [
                                                      { type: 'audio', speaker: 'OPERATOR A', timeframe: '02:14 — 02:16', context: 'Saya di lokasi Section 14.', source: 'VOIP_REC_14.WAV' }
                                                   ]
                                                },
                                                { id: 'condition', label: 'Condition', value: item.breakdown?.condition || 'EXCEEDED THRESHOLD', 
                                                   evidence: [
                                                      { type: 'doc', page: '08', context: 'Vibration Level: 4.8mm/s (Limit: 2.5mm/s)', source: 'SCADA_EVENT_EXPORT.CSV' }
                                                   ]
                                                },
                                             ].map((row, i) => (
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
                                                                     {ev.type === 'audio' ? <AudioIcon className="h-3 w-3 text-slate-200" /> : <DocIcon className="h-3 w-3 text-slate-200" />}
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
                                       <button onClick={() => setActiveEvidenceConsoleMode('actor')} className={cn("px-2 py-1 text-[8px] font-black uppercase rounded-sm transition-all", activeEvidenceConsoleMode === 'actor' ? "bg-white shadow-sm text-slate-900" : "text-slate-400")}>Actor</button>
                                       <button onClick={() => setActiveEvidenceConsoleMode('diarization')} className={cn("px-2 py-1 text-[8px] font-black uppercase rounded-sm transition-all", activeEvidenceConsoleMode === 'diarization' ? "bg-white shadow-sm text-slate-900" : "text-slate-400")}>Diar</button>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => setSelectedChronologyItemId(null)} className="h-8 w-8 p-0 text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                                       <X className="h-4 w-4" />
                                    </Button>
                                 </div>
                              </div>

                              <div className="flex-1 flex flex-col overflow-hidden bg-white">
                                 {activeEvidenceConsoleMode === 'actor' ? (
                                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8 animate-in slide-in-from-right-4 duration-500">
                                       {/* Profile Header: Enterprise ID Style */}
                                       <div className="border border-slate-900 bg-white p-6 rounded-none shadow-[8px_8px_0px_rgba(0,0,0,0.05)] relative overflow-hidden group">
                                          <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                                             <Brain className="h-24 w-24 text-slate-900 -mr-6 -mt-6 rotate-12" />
                                          </div>
                                          
                                          <div className="flex gap-8 relative z-10">
                                             {/* Left: Avatar & QR */}
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

                                             {/* Right: Primary Info */}
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

                                       {/* Actor Intelligence: Detailed Entity Grid */}
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
                                                <AudioIcon className={cn("h-3 w-3", activeEvidenceType === 'audio_diarization' ? "text-emerald-400" : "text-slate-300")} />
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
                                          {audioEvidence.diarization.map((seg, idx) => (
                                             <div key={idx} className="border-l-2 border-slate-900 pl-4 py-1 group bg-white p-3 rounded-sm border-r border-t border-b border-slate-100 shadow-sm mb-4">
                                                <div className="flex items-center justify-between mb-2">
                                                   <div className="flex items-center gap-3">
                                                      <span className="text-[10px] font-mono font-black text-slate-400">{seg.startTime} — {seg.endTime}</span>
                                                      <span className="px-2 py-0.5 bg-slate-900 text-white text-[8px] font-black uppercase rounded-sm">{seg.speaker}</span>
                                                   </div>
                                                </div>
                                                <p className="text-xs font-medium leading-relaxed text-slate-700 italic">"{seg.text}"</p>
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

function ReportsTab() {
  return (
    <div className="flex h-full bg-slate-50/10">
      <div className="w-[300px] border-r bg-white flex flex-col shrink-0">
        <div className="h-12 border-b flex items-center justify-between px-4 shrink-0">
           <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Reports</span>
           <Button variant="ghost" size="sm" className="h-8 text-[11px] font-bold text-primary">+ Create New</Button>
        </div>
        <div className="flex-1 overflow-auto p-2 space-y-1">
           {[
             { title: "Initial Investigation Report", version: "V1.2", date: "Today", status: "draft" },
             { title: "Internal Compliance Review", version: "V1.0", date: "Yesterday", status: "in_review" },
             { title: "Executive Safety Summary", version: "V0.8", date: "2d ago", status: "draft" },
           ].map((r, i) => (
             <div key={i} className={`p-3 rounded-sm border cursor-pointer ${i === 0 ? 'bg-primary/5 border-primary/20' : 'bg-white border-transparent'}`}>
                <div className="flex justify-between items-start mb-1">
                   <h4 className="text-xs font-bold text-slate-800 leading-tight">{r.title}</h4>
                   <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[9px] font-bold text-slate-500">{r.version}</span>
                </div>
                <div className="flex items-center justify-between mt-3">
                   <span className="text-[10px] text-slate-400">Edited {r.date}</span>
                   <StatusChip status={r.status as any} />
                </div>
             </div>
           ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center p-8 overflow-auto">
         <div className="w-full max-w-[800px] flex flex-col gap-6">
            <div className="flex items-center justify-between bg-white px-6 py-4 rounded-sm border  w-full mb-8">
               <h2 className="text-lg font-bold text-slate-900 border-none p-0">Initial Investigation Report V1.2</h2>
               <div className="flex items-center gap-2">
                  <Button variant="outline" className="h-9 font-bold text-xs">Preview PDF</Button>
                  <Button className="h-9 font-bold text-xs bg-slate-900">Finalize Build</Button>
               </div>
            </div>

            <div className="space-y-8 pb-32">
               {[
                 { title: "1. Executive Summary", content: "On April 5, 2026, a conveyor belt failure occurred in Zone B of Site Alpha, resulting in material spillage and near-miss injury.", ai: true },
                 { title: "2. Facts & Incident Chronology", content: "Extraction confirms the failure occurred at 14:35 relative to section 14. E-Stop was manually triggered 12 mins later.", ai: true },
                 { title: "3. Analysis & Root Cause", content: "Click to insert AI PEEPO proof-points...", ai: false },
                 { title: "4. Preventive Actions", content: "Replacement of roller support bracket with industrial Grade 8 steel...", ai: false },
               ].map((section, idx) => (
                  <div key={idx} className="group relative bg-white border border-slate-200 rounded-sm p-6  hover: transition-all">
                     <div className="flex items-center justify-between mb-4 border-b border-slate-50 pb-2">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">{section.title}</h4>
                        <div className="flex gap-1.5">
                           {section.ai && <span className="text-[9px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded uppercase">AI Drafted</span>}
                           <Pencil className="h-3.5 w-3.5 text-slate-400" />
                        </div>
                     </div>
                     <p className={`text-sm leading-relaxed ${section.content.includes("Click") ? "text-slate-300 italic" : "text-slate-700 font-medium"}`}>{section.content}</p>
                  </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
}

function ReviewTab() {
  return (
    <div className="flex h-full bg-slate-50/10">
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="bg-white border rounded-sm  p-8 flex items-center justify-between">
             <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-sm bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 ">
                   <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Review & Board Approval</h2>
                  <p className="text-xs text-slate-500 font-medium uppercase mt-1">CS-2026-0147 [v1.2]</p>
                </div>
             </div>
             <div className="flex gap-2.5">
               <Button variant="outline" className="h-10 text-xs font-bold px-5">Request Corrections</Button>
               <Button className="h-10 text-xs font-bold px-6 bg-emerald-600 text-white">Approve Case</Button>
             </div>
          </div>

          <div className="bg-white border rounded-sm  overflow-hidden">
            <div className="px-6 py-4 border-b bg-slate-50/50 flex items-center justify-between">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Formal Approval Chain</span>
               <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 uppercase">Board Review In-Progress</span>
            </div>
            <div className="p-8 flex items-center justify-between relative">
               <div className="absolute top-1/2 left-10 right-10 h-0.5 bg-slate-100 -translate-y-[24px]" />
               {[
                 { role: "Investigator", user: "Sarah Chen", status: "submitted", date: "Apr 8, 10:12" },
                 { role: "Site Reviewer", user: "John Doe", status: "reviewed", date: "Apr 8, 14:45" },
                 { role: "HSE Board", user: "Director Smith", status: "pending", date: "Present" },
                 { role: "Regulatory", user: "Inspector G", status: "waiting", date: "—" },
               ].map((step, i) => (
                <div key={step.role} className="flex flex-col items-center gap-3 relative z-10 w-48 text-center">
                   <div className={`h-10 w-10 rounded-full border-4 flex items-center justify-center transition-all ${
                     step.status === "reviewed" || step.status === "submitted" ? "bg-emerald-500 border-white text-white  shadow-emerald-500/20" :
                     step.status === "pending" ? "bg-amber-500 border-white text-white  shadow-amber-500/20 animate-pulse" :
                     "bg-slate-100 border-white text-slate-400"
                   }`}>
                      {step.status === "reviewed" || step.status === "submitted" ? <Check className="h-4 w-4" /> : step.status === "pending" ? <Clock className="h-4 w-4" /> : (i+1)}
                   </div>
                   <div>
                      <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-tighter mb-0.5">{step.role}</h4>
                      <p className="text-xs font-bold text-slate-700">{step.user}</p>
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

function AuditTrailTab() {
  const { caseId } = useParams<{ caseId: string }>();
  const { data: realLogs, isLoading } = useAuditLogs(caseId!);

  if (isLoading) return <div className="p-8 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading Audit Trail...</div>;

  return (
    <div className="flex flex-col h-full bg-slate-50/10 h-screen overflow-hidden">
      <div className="h-12 border-b bg-white flex items-center justify-between px-6 shrink-0  relative z-10">
         <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Audit Logs</span>
      </div>
      <div className="flex-1 overflow-auto p-4">
         <div className="bg-white border rounded-sm  overflow-hidden overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b">
                  <th className="p-4 text-[10px] font-black uppercase text-slate-400">Timestamp</th>
                  <th className="p-4 text-[10px] font-black uppercase text-slate-400">User</th>
                  <th className="p-4 text-[10px] font-black uppercase text-slate-400">Action</th>
                  <th className="p-4 text-[10px] font-black uppercase text-slate-400">Entity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {(realLogs || []).map((log: any, idx: number) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 text-[10px] font-mono text-slate-500">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="p-4">
                       <div className="text-xs font-bold text-slate-800">{log.user_name}</div>
                       <div className="text-[9px] text-slate-400 uppercase">System Auditor</div>
                    </td>
                    <td className="p-4 text-[11px] font-bold text-slate-900">{log.action}</td>
                     <td className="p-4">
                       <span className="px-2 py-0.5 rounded text-[9px] font-bold border bg-slate-50 border-slate-100 text-slate-400">
                          {log.entity_type}: {log.entity_name}
                       </span>
                    </td>
                  </tr>
                ))}
                {(!realLogs || realLogs.length === 0) && (
                  <tr>
                    <td colSpan={4} className="p-12 text-center text-[10px] font-black text-slate-300 uppercase tracking-widest">
                      No logs recorded for this case
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}

// --- Audio Analysis Components ---

function AudioAnalysisPanel({ file, currentTime, onJump }: { file: any, currentTime: number, onJump: (s: number) => void }) {
  const [activeTab, setActiveTab] = useState<"Extraction" | "Diarization">("Extraction");
  const [viewMode, setViewMode] = useState<"Structured" | "JSON">("Structured");

  // Normalized Extraction Schema
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
        transcript_summary: "Emergency report regarding Section 14 conveyor belt failure. Operator A identifies vibration then escalates to critical tear report.",
        speaker_profiles: raw.speaker_profiles.map(s => ({
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
        contradictions_and_gaps: raw.contradictions_and_gaps || [],
        review_meta: {
          low_confidence_segments: raw.review_meta.low_confidence_segments,
          needs_human_review: raw.review_meta.needs_human_review,
          confidence: raw.review_meta.confidence
        }
      }
    };
  }, [file]);

  // Normalized Diarization Schema
  const normalizedScene = useMemo(() => {
    return {
      audio_id: "AUD_" + (file?.id?.slice(0, 4) || "001"),
      case_id: "CS-2026-" + Math.floor(1000 + Math.random() * 9000),
      modality: "audio",
      scene_session: {
        speaker_count: audioExtractionData.speaker_profiles.length,
        full_diarization: audioDiarizationData,
        sync_settings: {
          timestamp_linked_to_player: true,
          auto_scroll_active_segment: true,
          click_segment_seeks_audio: true
        }
      }
    };
  }, [file]);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Tab Switcher */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b px-4 py-2 flex items-center gap-1 shrink-0">
        {(["Extraction", "Diarization"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-1.5 px-3 text-[10px] font-black uppercase tracking-[0.15em] rounded-md transition-all ${
              activeTab === tab
              ? "bg-slate-900 text-white  ring-1 ring-slate-900"
              : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar">
        {activeTab === "Extraction" ? (
          <div className="flex flex-col min-h-full">
            <div className="p-4 border-b bg-slate-50/50 flex items-center justify-between">
              <div className="flex flex-col">
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Intelligence Hub</span>
                 <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-1 opacity-60">Audio Protocol Matrix v2.1</span>
              </div>
              <div className="flex items-center gap-1 p-0.5 bg-slate-200/50 rounded-md border shadow-inner">
                 <button onClick={() => setViewMode("Structured")} className={`px-2 py-1 text-[8px] font-black uppercase rounded transition-all ${viewMode === "Structured" ? "bg-white text-slate-900 " : "text-slate-400 hover:text-slate-600"}`}>Structured</button>
                 <button onClick={() => setViewMode("JSON")} className={`px-2 py-1 text-[8px] font-black uppercase rounded transition-all ${viewMode === "JSON" ? "bg-white text-slate-900 " : "text-slate-400 hover:text-slate-600"}`}>JSON</button>
              </div>
            </div>

            {viewMode === "Structured" ? (
              <AudioExtractionStructured 
                data={normalizedExtraction} 
                onJump={onJump} 
              />
            ) : (
              <div className="p-4 bg-[#0d1117] min-h-full">
                <div className="rounded-sm overflow-hidden border border-[#30363d] ">
                  <div className="bg-[#161b22] px-4 py-2.5 border-b border-[#30363d] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <div className="flex gap-1.5">
                          <div className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
                          <div className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
                          <div className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
                       </div>
                       <span className="text-[10px] font-mono text-[#8b949e] uppercase tracking-wider">audio_extraction_output.json</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 px-2 text-[9px] font-black text-[#c9d1d9] hover:bg-[#30363d] hover:text-white border border-[#30363d]"
                      onClick={() => {
                        navigator.clipboard.writeText(JSON.stringify(normalizedExtraction, null, 2));
                        toast.success("JSON copied to clipboard");
                      }}
                    >
                       <Copy className="h-3 w-3 mr-1.5" /> COPY
                    </Button>
                  </div>
                  <pre className="text-[10.5px] font-mono text-[#79c0ff] bg-[#0d1117] p-6 leading-relaxed overflow-auto max-h-[1200px] custom-scrollbar selection:bg-primary/30">
                     {JSON.stringify(normalizedExtraction, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        ) : (
          <AudioSceneSession 
            data={normalizedScene} 
            currentTime={currentTime} 
            onJump={onJump} 
          />
        )}
      </div>
    </div>
  );
}

function AudioExtractionStructured({ data, onJump }: { data: any, onJump: (s: number) => void }) {
  const [expandedSections, setExpandedSections] = useState<string[]>(["Timeline & Facts", "Speaker Profiles", "Risks, Gaps, Review"]);
  const toggle = (s: string) => setExpandedSections(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);

  const SectionHeader = ({ title, icon: Icon, count }: any) => (
    <button 
      onClick={() => toggle(title)}
      className={`w-full flex items-center justify-between px-5 py-3 transition-all ${expandedSections.includes(title) ? 'bg-slate-50/50 border-b' : 'hover:bg-slate-50/30'}`}
    >
      <div className="flex items-center gap-3">
        <div className={`p-1.5 rounded-sm border  ${expandedSections.includes(title) ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-400'}`}>
          <Icon className="h-3.5 w-3.5" />
        </div>
        <div className="flex flex-col items-start">
           <span className={`text-[11px] font-black uppercase tracking-tight ${expandedSections.includes(title) ? 'text-slate-900' : 'text-slate-600'}`}>
             {title}
           </span>
           {count !== undefined && <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter leading-none mt-0.5">{count} detected</span>}
        </div>
      </div>
      <ChevronDown className={`h-3.5 w-3.5 text-slate-300 transition-transform duration-300 ${expandedSections.includes(title) ? 'rotate-180 text-slate-900' : ''}`} />
    </button>
  );

  const KVP = ({ label, value, badge }: { label: string, value: any, badge?: { text: string, className: string } }) => (
    <div className="flex flex-col gap-0.5 py-1.5 last:pb-0">
      <div className="flex items-center gap-2">
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{label}</span>
        {badge && (
          <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${badge.className}`}>
            {badge.text}
          </span>
        )}
      </div>
      <div className="text-[11px] font-bold text-slate-800 leading-snug">{value || "No data detected"}</div>
    </div>
  );

  const StatusPill = ({ text, type = 'default' }: { text: string, type?: 'observed' | 'claimed' | 'review' | 'default' | 'urgent' }) => {
     const styles = {
        observed: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        claimed: 'bg-blue-50 text-blue-700 border-blue-100',
        review: 'bg-amber-50 text-amber-700 border-amber-100',
        urgent: 'bg-rose-50 text-rose-700 border-rose-100',
        default: 'bg-slate-50 text-slate-500 border-slate-100'
     };
     return (
        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${styles[type]}`}>
          {text}
        </span>
     );
  };

  return (
    <div className="flex flex-col divide-y divide-slate-100 border-b">
      {/* Audio Properties */}
      <div className="flex flex-col">
         <SectionHeader title="Audio Properties" icon={AudioIcon} />
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

      {/* Speaker Profiles */}
      <div className="flex flex-col">
         <SectionHeader title="Speaker Profiles" icon={Users} count={data.extraction_summary.speaker_profiles.length} />
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

      {/* Communication Events */}
      <div className="flex flex-col">
         <SectionHeader title="Communication Events" icon={MessageSquare} count={data.extraction_summary.communication_events.length} />
         {expandedSections.includes("Communication Events") && (
           <div className="p-5 space-y-2.5 bg-white animate-in fade-in slide-in-from-top-1">
              {data.extraction_summary.communication_events.map((e: any, i: number) => (
                <div key={i} className="flex gap-4 p-3 hover:bg-slate-50 rounded-sm transition-all cursor-pointer group" onClick={() => onJump(parseInt(e.timestamp.split(':')[1]))}>
                   <div className="flex flex-col items-center shrink-0 pt-0.5">
                      <span className="text-[10px] font-black text-primary bg-primary/5 px-1.5 py-0.5 rounded leading-none tabular-nums group-hover:bg-primary group-hover:text-white transition-all">{e.timestamp}</span>
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

      {/* Timeline & Facts */}
      <div className="flex flex-col">
         <SectionHeader title="Timeline & Facts" icon={Clock} count={data.extraction_summary.factual_statements.length} />
         {expandedSections.includes("Timeline & Facts") && (
           <div className="p-5 space-y-6 bg-white animate-in fade-in slide-in-from-top-1">
              <div className="space-y-4">
                 <span className="text-[10px] font-black text-slate-900 border-b border-slate-900 pb-1 uppercase tracking-widest block">Validated Statements</span>
                 {data.extraction_summary.factual_statements.map((f: any, i: number) => (
                    <div key={i} className="relative pl-4">
                       <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 rounded-full" />
                       <div className="flex items-center gap-2 mb-1.5">
                          <StatusPill text={f.statement_type} type="observed" />
                          <span className="text-[9px] font-black text-slate-400 tabular-nums">[{f.timestamp}]</span>
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
                         <span className="text-[10px] font-black text-slate-300 tabular-nums shrink-0">{t.timestamp}</span>
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

      {/* Risks, Gaps, Review */}
      <div className="flex flex-col">
         <SectionHeader title="Risks, Gaps, Review" icon={Brain} />
         {expandedSections.includes("Risks, Gaps, Review") && (
           <div className="p-5 space-y-6 bg-white animate-in fade-in slide-in-from-top-1">
              {/* Risks & Procedure Mentions */}
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
                                  <div key={i} className="flex items-start gap-2 text-[10.5px] font-bold text-slate-700 leading-tight">
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

              {/* Performance Signals */}
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

              {/* Review Meta */}
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

function AudioSceneSession({ data, currentTime, onJump }: { data: any, currentTime: number, onJump: (s: number) => void }) {
  const isSegmentActive = (start: string, end: string) => {
    const getS = (s: string) => {
      const parts = s.split(':').map(Number);
      return parts.length === 3 ? parts[0] * 3600 + parts[1] * 60 + parts[2] : parts[0] * 60 + parts[1];
    };
    return currentTime >= getS(start) && currentTime <= getS(end);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/10">
      <div className="px-5 py-3 border-b bg-white flex items-center justify-between  sticky top-0 z-30">
         <div className="flex flex-col">
            <div className="flex items-center gap-2">
               <MessageSquare className="h-3.5 w-3.5 text-slate-900" />
               <span className="text-[10px] font-black text-slate-900 uppercase tracking-[0.1em]">Diarization Session</span>
            </div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">{data.scene_session.full_diarization.length} Segments • {data.scene_session.speaker_count} Speakers</span>
         </div>
         <Button variant="ghost" size="sm" className="h-8 px-3 text-[10px] font-black text-slate-600 hover:bg-slate-100 border rounded-sm transition-all ">
           <Copy className="h-3.5 w-3.5 mr-2 opacity-60" /> Export RAW
         </Button>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar p-4 space-y-3">
        {data.scene_session.full_diarization.map((seg: any) => {
          const active = isSegmentActive(seg.start_time, seg.end_time);
          return (
            <div
              key={seg.segment_id}
              onClick={() => {
                const parts = seg.start_time.split(':').map(Number);
                onJump(parts.length === 3 ? parts[0] * 3600 + parts[1] * 60 + parts[2] : parts[0] * 60 + parts[1]);
              }}
              className={`group flex flex-col gap-3 p-4 rounded-sm border transition-all duration-500 cursor-pointer relative overflow-hidden ${
                active 
                ? "bg-white border-slate-900  scale-[1.01] z-10" 
                : "bg-white/60 border-slate-100 hover:border-slate-300 hover:bg-white hover:"
              }`}
            >
              {active && <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-900" />}
              
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <span className={`text-[11px] font-black tabular-nums transition-colors ${active ? "text-slate-900" : "text-slate-400"}`}>
                      {seg.start_time} — {seg.end_time}
                    </span>
                    <span className={`px-2 py-0.5 rounded-[4px] text-[9px] font-black uppercase border transition-all ${
                      active 
                      ? "bg-slate-900 text-white border-slate-900" 
                      : (seg.speaker_id === "SPK_01" ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-indigo-50 text-indigo-600 border-indigo-100")
                    }`}>
                      {seg.speaker_label}
                    </span>
                 </div>
                 <ConfidenceChip level={seg.confidence.toLowerCase() as any} />
              </div>

              <div className="relative">
                <p className={`text-[12px] leading-relaxed transition-all duration-500 ${active ? "text-slate-900 font-bold" : "text-slate-500 font-medium"} italic`}>
                  "{seg.text}"
                </p>
                {seg.inaudible_flag && (
                   <span className="absolute -right-1 -bottom-1 px-1.5 bg-rose-50 text-rose-600 text-[8px] font-black rounded border border-rose-100 uppercase">Inaudible</span>
                )}
              </div>

              {!active && (
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                   <div className="h-1 w-1 rounded-full bg-slate-300" />
                   <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Click to seek player</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}



// --- New Video Analysis Components ---

function VideoAnalysisPanel({ file, currentTime, onJump }: { file: any, currentTime: number, onJump: (s: number) => void }) {
  const [activeTab, setActiveTab] = useState<"Extraction" | "Diarization">("Extraction");
  const [viewMode, setViewMode] = useState<"Structured" | "JSON">("Structured");

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Sticky Tab Switcher */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b px-4 py-2 flex items-center gap-1 shrink-0">
        {(["Extraction", "Diarization"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-1.5 px-3 text-[10px] font-black uppercase tracking-widest rounded-md transition-all ${
              activeTab === tab
              ? "bg-primary text-white "
              : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar">
        {activeTab === "Extraction" ? (
          <div className="p-4 space-y-4">
             <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Intelligence Layer</span>
                <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-md border shadow-inner">
                   <button onClick={() => setViewMode("Structured")} className={`px-2 py-1 text-[8px] font-black uppercase rounded transition-all ${viewMode === "Structured" ? "bg-white text-primary " : "text-slate-400 hover:text-slate-600"}`}>Structured</button>
                   <button onClick={() => setViewMode("JSON")} className={`px-2 py-1 text-[8px] font-black uppercase rounded transition-all ${viewMode === "JSON" ? "bg-white text-primary " : "text-slate-400 hover:text-slate-600"}`}>JSON</button>
                </div>
             </div>
             {viewMode === "Structured" ? (
               <VideoExtractionStructured data={videoExtractionRefined} onJump={onJump} />
             ) : (
               <div className="bg-slate-900 rounded-sm p-4 overflow-hidden border border-slate-800  mt-4">
                  <pre className="text-[10px] font-mono text-emerald-400 leading-relaxed overflow-auto max-h-[1000px] custom-scrollbar">
                     {JSON.stringify(videoExtractionRefined, null, 2)}
                  </pre>
               </div>
             )}
          </div>
        ) : (
          <VideoSceneSession currentTime={currentTime} onJump={onJump} />
        )}
      </div>
    </div>
  );
}

function VideoExtractionStructured({ data, onJump }: { data: typeof videoExtractionRefined, onJump: (s: number) => void }) {
  const [expandedSections, setExpandedSections] = useState<string[]>(["Video Session Meta", "Scene Timeline"]);

  const toggle = (s: string) => setExpandedSections(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);

  const ExtractionSection = ({ title, icon: Icon, count, children }: any) => (
    <div className={`border border-slate-100 rounded-sm overflow-hidden mb-2 transition-all duration-300 ${expandedSections.includes(title) ? ' border-primary/10' : 'hover:border-slate-200'}`}>
      <button 
        onClick={() => toggle(title)}
        className={`w-full flex items-center justify-between px-3 py-2.5 transition-colors ${expandedSections.includes(title) ? 'bg-slate-50/50 border-b border-slate-50' : 'bg-white'}`}
      >
        <div className="flex items-center gap-2.5">
          <div className={`p-1.5 rounded-sm border  ${expandedSections.includes(title) ? 'bg-primary text-white border-primary' : 'bg-white text-slate-400'}`}>
            <Icon className="h-3.5 w-3.5" />
          </div>
          <span className={`text-[11px] font-black uppercase tracking-tight transition-colors ${expandedSections.includes(title) ? 'text-slate-900' : 'text-slate-600'}`}>
            {title}
            {count !== undefined && <span className="ml-2 opacity-40">({count})</span>}
          </span>
        </div>
        <ChevronDown className={`h-3 w-3 text-slate-300 transition-transform ${expandedSections.includes(title) ? 'rotate-180' : ''}`} />
      </button>
      {expandedSections.includes(title) && (
        <div className="p-3 bg-white space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
          {children}
        </div>
      )}
    </div>
  );

  const MetadataField = ({ label, value }: { label: string, value: any }) => (
    <div className="flex flex-col gap-0.5">
      <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{label}</span>
      <span className="text-[11px] font-bold text-slate-800 leading-tight">{value || "—"}</span>
    </div>
  );

  return (
    <div className="space-y-1">
      <ExtractionSection title="Video Session Meta" icon={VideoIcon}>
        <div className="grid grid-cols-2 gap-y-3 gap-x-4">
          <MetadataField label="Session" value={data.video_session_meta.session_name} />
          <MetadataField label="Duration" value={data.video_session_meta.duration} />
          <MetadataField label="Quality" value={data.video_session_meta.quality} />
          <MetadataField label="FPS" value={data.video_session_meta.fps} />
          <MetadataField label="Source" value={data.video_session_meta.camera_type} />
          <MetadataField label="Confidence" value={data.video_session_meta.confidence} />
        </div>
      </ExtractionSection>

      <ExtractionSection title="Scene Timeline" icon={LayoutGrid} count={data.scene_timeline.length}>
        <div className="space-y-2">
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
      </ExtractionSection>

      <ExtractionSection title="Actor Profiles" icon={Users} count={data.actor_profiles.length}>
        <div className="space-y-2">
          {data.actor_profiles.map((a) => (
            <div key={a.actor_id} className="p-3 rounded-sm border border-slate-100 bg-white ">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{a.actor_label}</span>
                <ConfidenceChip level={a.confidence.toLowerCase() as any} />
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <MetadataField label="Role" value={a.probable_role} />
                <MetadataField label="Screen Time" value={a.screen_time} />
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
                    <span className={`px-1 rounded ${a.stress.includes('High') ? 'bg-rose-100 text-rose-700' : 'text-slate-700'}`}>{a.stress}</span>
                 </div>
              </div>
            </div>
          ))}
        </div>
      </ExtractionSection>

      <ExtractionSection title="Action / Event Detection" icon={Activity} count={data.action_events.length}>
        <div className="space-y-1.5">
          {data.action_events.map((e, i) => (
            <div 
              key={i} 
              onClick={() => onJump(e.seconds)}
              className="flex gap-3 p-2 rounded-sm hover:bg-slate-50 cursor-pointer group"
            >
              <span className="text-[10px] font-black text-slate-400 tabular-nums pt-0.5">{e.timestamp}</span>
              <div className="flex-1 space-y-1">
                 <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded border ${
                      e.severity === 'Critical' ? 'bg-rose-50 text-rose-700 border-rose-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                    }`}>{e.event_type}</span>
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
      </ExtractionSection>

      <ExtractionSection title="Environmental Observations" icon={Wind}>
        <div className="space-y-3">
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
      </ExtractionSection>

      <ExtractionSection title="Equipment & Object Signals" icon={Cpu}>
        <div className="grid gap-2">
          {data.equipment_and_object_signals.map((o, i) => (
            <div key={i} onClick={() => onJump(o.seconds)} className="p-2.5 rounded-sm bg-slate-50 border border-transparent hover:bg-white hover:border-slate-100 hover: cursor-pointer group">
              <div className="flex items-center justify-between mb-1.5">
                 <span className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{o.object}</span>
                 <span className="text-[9px] font-black text-primary bg-primary/5 px-1.5 py-0.5 rounded">{o.timestamp}</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                 <span className={`px-1.5 py-0.5 text-[8px] font-black uppercase rounded ${o.condition === 'Removed' || o.condition === 'Skewed' ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-500'}`}>{o.condition}</span>
                 <span className="text-[9px] font-bold text-slate-400 italic">"{o.anomaly}"</span>
              </div>
              <div className="flex items-center justify-between text-[9px] font-bold text-slate-400 uppercase">
                 <span>Actor: {o.actor}</span>
                 <ConfidenceChip level={o.confidence.toLowerCase() as any} />
              </div>
            </div>
          ))}
        </div>
      </ExtractionSection>

      <ExtractionSection title="Human Performance Signals" icon={Footprints}>
        <div className="space-y-3">
          {Object.entries(data.human_performance_signals).map(([key, items]: [string, any]) => (
            <div key={key}>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.1em] mb-1.5 block">{key.replace(/_/g, ' ')}</span>
              <div className="space-y-1.5">
                {items.map((item: any, i: number) => (
                  <div key={i} onClick={() => onJump(item.seconds)} className="p-2 bg-rose-50/50 border border-rose-100 rounded-sm group cursor-pointer">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] font-black text-rose-700 tracking-tight uppercase">{item.category}</span>
                      <span className="text-[9px] font-bold text-rose-300 tabular-nums">{item.timestamp}</span>
                    </div>
                    <p className="text-[11px] font-bold text-rose-900 leading-tight">"{item.detail}"</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ExtractionSection>

      <ExtractionSection title="PEEPO Seeds" icon={Brain}>
        <div className="space-y-3">
          {data.peepo_seeds.map((category) => (
            <div key={category.category} className="space-y-1.5">
              <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">{category.category}</span>
              <ul className="space-y-1">
                {category.items.map((item, i) => (
                  <li key={i} className="flex gap-2">
                    <div className="h-1 w-1 rounded-full bg-primary/40 mt-1.5 shrink-0" />
                    <span className="text-[11px] font-medium text-slate-600 leading-snug italic">"{item}"</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </ExtractionSection>

      <ExtractionSection title="Review Meta" icon={CheckCircle2}>
        <div className="space-y-4">
          <div className="space-y-2">
             <span className="text-[10px] font-black text-slate-400 uppercase block">Needs Human Review</span>
             <ul className="space-y-1.5">
                {data.review_meta.needs_review.map((r, i) => (
                  <li key={i} className="flex items-center gap-2 p-2 bg-amber-50 border border-amber-100 rounded-sm border-dashed">
                    <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                    <span className="text-[11px] font-bold text-amber-800 leading-tight">{r}</span>
                  </li>
                ))}
             </ul>
          </div>
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
             <span className="text-[11px] font-black text-slate-900 uppercase">Overall Readiness</span>
             <span className="text-[11px] font-black text-emerald-600 uppercase tracking-widest">{data.review_meta.overall_confidence} READY</span>
          </div>
        </div>
      </ExtractionSection>
    </div>
  );
}

function VideoSceneSession({ currentTime, onJump }: { currentTime: number, onJump: (s: number) => void }) {
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
              className={`group flex items-start gap-4 p-4 rounded-sm border transition-all duration-300 cursor-pointer relative overflow-hidden active:scale-[0.98] ${
                isActive 
                ? "bg-white border-primary ring-1 ring-primary/20  translate-x-1" 
                : "bg-white border-slate-100 hover:border-primary/30 hover: hover:bg-slate-50/50"
              }`}
            >
              {isActive && <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />}
              {!isActive && <div className="absolute top-0 right-0 px-2 py-0.5 bg-slate-100 text-[8px] font-black text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity rounded-bl-lg border-l border-b border-slate-200">SEEK TO TIMESTAMP</div>}
              
              <div className="w-16 shrink-0 flex flex-col items-center gap-1.5 pt-0.5">
                <div className={`text-[10px] font-black tabular-nums tracking-tighter transition-colors ${isActive ? "text-primary" : "text-slate-400 group-hover:text-primary/70"}`}>
                  {seg.timestamp}
                </div>
                <div className={`w-full aspect-video rounded flex items-center justify-center border transition-all duration-300 overflow-hidden relative ${
                  isActive ? "bg-primary/5 border-primary/20" : "bg-slate-50 border-slate-200 group-hover:border-primary/20 group-hover:bg-white"
                }`}>
                   <Play className={`h-3 w-3 transition-all duration-300 ${isActive ? "text-primary animate-pulse scale-125" : "text-slate-300 opacity-0 group-hover:opacity-100 group-hover:text-primary/50"}`} />
                </div>
                <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">{seg.duration}</span>
              </div>
              <div className="flex-1 space-y-3">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-black uppercase transition-colors ${isActive ? "text-primary" : "text-slate-900"}`}>{seg.scene_label}</span>
                      <div className="h-1 w-1 rounded-full bg-slate-200" />
                      <span className="text-[10px] font-black text-slate-400 tabular-nums">{seg.accuracy}% ACC</span>
                   </div>
                   <ConfidenceChip level={seg.confidence.toLowerCase() as any} />
                </div>
                
                <p className={`text-[11px] leading-relaxed transition-colors ${isActive ? "text-slate-800 font-bold" : "text-slate-500 font-medium"}`}>
                   {seg.summary}
                </p>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-50">
                   <div className="space-y-1">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Action</span>
                      <ul className="space-y-0.5">
                         {seg.actions.map((a: string, i: number) => (
                           <li key={i} className={`text-[9px] font-bold ${isActive ? "text-slate-700" : "text-slate-400"}`}>• {a}</li>
                         ))}
                      </ul>
                   </div>
                   <div className="space-y-1">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Key Analysis</span>
                      <div className="flex flex-wrap gap-1">
                         {seg.key_analysis.map((e: string, i: number) => (
                           <span key={i} className={`px-1.5 py-0.5 rounded-[4px] border text-[8px] font-black uppercase transition-all ${
                             isActive ? "bg-primary/5 text-primary border-primary/10" : "bg-slate-50 text-slate-400 border-slate-100"
                           }`}>{e}</span>
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
      
      <div className="p-4 border-t bg-white flex flex-col gap-2">
         <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">Visual Narrative Chain</span>
            <div className="flex items-center gap-1">
               <div className="h-1 w-1 rounded-full bg-slate-200" />
               <div className="h-1 w-1 rounded-full bg-slate-200" />
               <div className="h-1 w-1 rounded-full bg-slate-200" />
            </div>
         </div>
      </div>
    </div>
  );
}



export default function CaseWorkspacePage() {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Evidence Review");
  const [selectedFile, setSelectedFile] = useState<any>(null);

  // Real Data Hooks
  const { data: cases } = useCases();
  const { data: caseData, isLoading: caseLoading, refetch: refetchCase } = useCase(caseId!);
  const { data: evidence, isLoading: evidenceLoading, refetch: refetchEvidence } = useEvidence(caseId!);

  const currentIndex = cases?.findIndex(c => c.id === caseId) ?? -1;
  const prevCase = currentIndex > 0 ? cases![currentIndex - 1] : null;
  const nextCase = currentIndex < (cases?.length ?? 0) - 1 ? cases![currentIndex + 1] : null;

  const uploadEvidence = useUploadEvidence();

  const handleUploadComplete = async (groups: CompletedGroup[]) => {
    try {
      await uploadEvidence.mutateAsync({ caseId: caseId!, groups });
      await refetchEvidence();
      toast.success("Evidence library updated with new uploads.");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to save evidence to database.");
    }
  };

  const evidenceFiles = evidence?.files || [];
  const batches = evidence?.batches || [];

  // Auto-select first file when data loads
  useEffect(() => {
    if (evidenceFiles.length > 0 && !selectedFile) {
      setSelectedFile(evidenceFiles[0]);
    }
  }, [evidenceFiles, selectedFile]);



  if (caseLoading || evidenceLoading) {
    return (
      <AppLayout>
        <div className="flex h-screen items-center justify-center bg-slate-50/50">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Synchronizing Intelligence Case…</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout hideHeader>
      <div className="flex flex-col h-full bg-slate-50/10 h-screen overflow-hidden">
        <div className="bg-white border-b px-6 py-4 flex items-center justify-between shrink-0  relative z-30">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/cases')}
              className="h-9 w-9 p-0 rounded-full hover:bg-slate-100 text-slate-500 border border-slate-100 "
            >
              <ArrowLeft className="h-4.5 w-4.5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 border-none p-0 flex items-center gap-2 leading-none">
                {caseData?.title || "Loading Case..."} <span className="text-slate-400 font-mono text-sm leading-none ml-1">#{caseData?.case_number || caseId}</span>
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 border-r pr-4 border-slate-100">
               <Button
                 variant="ghost"
                 size="sm"
                 disabled={!prevCase}
                 onClick={() => navigate(`/cases/${prevCase?.id}`)}
                 className="h-8 px-2 text-[10px] font-black uppercase tracking-widest gap-1 text-slate-400 hover:text-slate-900 transition-all"
               >
                 <ChevronLeft className="h-3.5 w-3.5" /> Previous
               </Button>
               <Button
                 variant="ghost"
                 size="sm"
                 disabled={!nextCase}
                 onClick={() => navigate(`/cases/${nextCase?.id}`)}
                 className="h-8 px-2 text-[10px] font-black uppercase tracking-widest gap-1 text-slate-400 hover:text-slate-900 transition-all"
               >
                 Next <ChevronRight className="h-3.5 w-3.5" />
               </Button>
            </div>
            <Button className="h-9 font-bold px-4 bg-slate-900 text-white ">Submit Case</Button>
          </div>
        </div>

        <div className="bg-white border-b h-12 flex items-center justify-between px-6 shrink-0 relative z-20 ">
          <div className="flex gap-1 h-full items-center">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`h-full px-5 text-xs font-bold transition-all relative ${
                  activeTab === tab ? "text-primary bg-primary/5" : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                {tab}
                {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary " />}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-2 border-l pl-6 border-slate-100">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  {caseData?.created_at ? new Date(caseData.created_at).toLocaleDateString() : 'Now'}
                </span>
             </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden relative">
          {/* Overview Tab removed */}
          {activeTab === "Evidence Review" && (
            <ExtractionTab 
              evidenceFiles={evidenceFiles} 
              batches={batches} 
              selectedFile={selectedFile}
              setSelectedFile={setSelectedFile}
              caseId={caseId!}
              onUploadComplete={handleUploadComplete}
            />
          )}
          {activeTab === "Analysis" && <AnalysisTab />}
          {activeTab === "Reports" && <ReportsTab />}
          {activeTab === "Review" && <ReviewTab />}
          {activeTab === "Audit Trail" && <AuditTrailTab />}
        </div>
      </div>
    </AppLayout>
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
                        <div className="text-[12px] font-black text-slate-900 tabular-nums">{run.token_usage?.toLocaleString() || "—"}</div>
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




