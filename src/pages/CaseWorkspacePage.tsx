import React, { useState, useEffect, useRef } from "react";
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
  ChevronLeft,
  Users,
  FileJson,
  Copy,
  ZoomIn,
  ZoomOut,
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
  Loader2
} from "lucide-react";

interface AgentState {
  id: string;
  name: string;
  icon: any;
  purpose: string;
  status: 'idle' | 'queued' | 'running' | 'completed' | 'warning' | 'failed' | 'blocked' | 'cancelled' | 'skipped';
  triggeredBy?: string;
  lastRunTimestamp?: string;
  lastUpdatedTimestamp?: string;
  confidence?: string;
  dependencyState?: string;
  microStatus?: string;
  results?: any;
  dependencies: string[];
}

const initialAgentsState: AgentState[] = [
  { 
     id: 'fact', 
     name: 'Fact & Chronology', 
     icon: Clock, 
     purpose: 'Reconstruct sequence of events from raw evidence batches.', 
     status: 'idle', 
     dependencies: [], 
     results: {
        ringkasan: {
           tanggal: "April 05, 2026",
           jam: "14:23 - 14:45",
           lokasi: "Conveyor Zone B, Section 14",
           jenis: "Mechanical Failure & Material Spillage",
           deskripsi: "Tear in conveyor belt led to massive spillage and structural stress at Section 14 conveyor drives.",
           departemen: "Mining Operations",
           sumber_bukti: "SCADA, CCTV-B14, HSE Logs",
           severity: "High"
        },
        timeline: {
           praKontak: [
              { time: "14:10", name: "System", event: "Vibration sensor alarm start on Section 14 drive motor" },
              { time: "14:20", name: "Ahmed Khan", event: "Operator manual override initiated to maintain throughput" },
              { time: "14:21", name: "System", event: "Secondary tension alarm ignored by control room" }
           ],
           kontak: [
              { time: "14:23", name: "Equipment", event: "Belt rupture detected at Section 14 leading to massive spillage" },
              { time: "14:24", name: "System", event: "Main line conveyor 2 motor torque spike detected" },
              { time: "14:25", name: "System", event: "Emergency stop automatically triggered by belt rip sensors" }
           ],
           pascaKontak: [
              { time: "14:30", name: "HSE Team", event: "Departure to incident site for initial containment and safety cordoning" },
              { time: "14:45", name: "Maria Santos", event: "Area secured and maintenance lockout-tagout (LOTO) procedures applied" },
              { time: "15:00", name: "Ahmed Khan", event: "Initial witness statement provided to HSE supervisor" }
           ]
        }
     }
  },
  { 
     id: 'actor', 
     name: 'Actor Intelligence', 
     icon: Users, 
     purpose: 'Map roles, permissions, and coordination gaps of involved entities.', 
     status: 'idle', 
     dependencies: ['fact'],
     results: {
        aktor: [
           { nama: "Ahmed Khan", peran: "Conveyor Supervisor", status_shift: "Active", tindakan: "Manual Override" },
           { nama: "Maria Santos", peran: "Maintenance Lead", status_shift: "Remote", tindakan: "Log Review" }
        ],
        relasi: "Gaps found between HSE protocol and manual override speed.",
        temuan_utama: " احمد (Ahmed) was operating outside standard speed parameters."
     }
  },
  { 
     id: 'peepo', 
     name: 'PEEPO Reasoning', 
     icon: Brain, 
     purpose: 'Analyze People, Environment, Equipment, Procedures, and Org factors.', 
     status: 'idle', 
     dependencies: ['actor'],
     results: {
        people: ["Operator fatigue suspected", "Training gap on Section 14 override"],
        environment: ["High dust levels impacting sensors", "Limited visibility in sector"],
        equipment: ["Belt tensioner fatigue", "Sensor calibration drift"],
        procedures: ["Incomplete lockout-tagout log", "Delayed radio relay"],
        organisation: ["Shift swap overlap issues"],
        ringkasan: "A combination of equipment fatigue and procedure gaps was the primary driver.",
        synthesis: "Factor convergence score: High (Critical)"
     }
  },
  { 
     id: 'ipls', 
     name: 'IPLS Classification', 
     icon: FileSearch, 
     purpose: 'Classify incident across the 5 layers of Industrial Prevention Logic.', 
     status: 'idle', 
     dependencies: ['peepo'],
     results: {
        layer_1: "Immediate Cause: Mechanical Rupture",
        layer_2: "Direct Cause: Tensioner Override",
        layer_3: "Systemic Factor: Maintenance Cycle",
        layer_4: "Org Factor: Resource Allocation",
        layer_5: "Cultural Factor: Safety Priority",
        root_cause: "Resource allocation led to deferred maintenance on Section 14.",
        layer_priority: "Layer 4 (Organisation)"
     }
  },
  { 
     id: 'prev', 
     name: 'Prevention Engine', 
     icon: HardHat, 
     purpose: 'Generate corrective actions and predictive risk mitigations.', 
     status: 'idle', 
     dependencies: ['ipls'],
     results: {
        actions: [
           { id: "A1", desc: "Automated tensioner shutdown logic upgrade", priority: "Critical", owner: "Maintenance" },
           { id: "A2", desc: "Enhanced radio relay frequency testing", priority: "High", owner: "Ops" }
        ],
        prioritas: "Critical",
        risiko: "Moderate residual risk",
        fokus_monitoring: "Section 14 Telemetry"
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
import { UploadModal } from "@/components/UploadModal";

// --- Mock Data ---

const tabs = ["Overview", "Evidence Review", "Analysis", "Reports", "Review", "Audit Trail"];

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
  { id: "B5", name: "CCTV Storage Export", description: "Footage from Zone B cameras during incident window", type: "Video", fileCount: 1, uploadedBy: "System", updated: "4h ago", extractionProgress: 100, reviewProgress: 0, keyEvidenceCount: 1, linkedAnalysis: 0 },
];

const evidenceFiles = [
  // Images
  { id: "F1", batchId: "B1", name: "pit_overview_west_sector.jpg", type: "Image", source: "Drone-04", uploadedBy: "Ahmed Khan", uploadDate: "2026-04-05", extractionStatus: "completed", reviewStatus: "reviewed", tags: ["key", "site-overview"], linked: 2, size: "4.2 MB", url: "/mining_1.png" },
  { id: "F2", batchId: "B1", name: "conveyor_roller_failure_macro.jpg", type: "Image", source: "Field-Cam-A1", uploadedBy: "Ahmed Khan", uploadDate: "2026-04-05", extractionStatus: "completed", reviewStatus: "reviewed", tags: ["key", "mechanical"], linked: 1, size: "2.8 MB", url: "/mining_2.png" },
  { id: "F3", batchId: "B1", name: "worker_ppe_check_pit_3.jpg", type: "Image", source: "Safety Officer", uploadedBy: "Ahmed Khan", uploadDate: "2026-04-06", extractionStatus: "completed", reviewStatus: "pending", tags: ["ppe", "compliance"], linked: 0, size: "3.5 MB", url: "/mining_3.png" },
  
  // Documents
  { id: "F4", batchId: "B2", name: "incident_report_initial.pdf", type: "Document", source: "HSE Portal", uploadedBy: "Sarah Chen", uploadDate: "2026-04-05", extractionStatus: "completed", reviewStatus: "reviewed", tags: ["key"], linked: 5, size: "1.2 MB", snippet: "The belt tore at section 14, causing material spillage across the walkway. Tensioners failed to retract." },
  { id: "F5", batchId: "B2", name: "hazard_observation_form_04.pdf", type: "Document", source: "Safety Tablet", uploadedBy: "Sarah Chen", uploadDate: "2026-04-05", extractionStatus: "completed", reviewStatus: "pending", tags: ["observation"], linked: 1, size: "850 KB" },
  { id: "F6", batchId: "B3", name: "maintenance_log_conveyor_C.xlsx", type: "Document", source: "Maintenance Sys", uploadedBy: "Maria Santos", uploadDate: "2026-04-06", extractionStatus: "completed", reviewStatus: "pending", tags: [], linked: 1, size: "450 KB" },
  
  // Audio
  { id: "F7", batchId: "B4", name: "witness_statement_operator_A.wav", type: "Audio", source: "Field Voice Link", uploadedBy: "John Doe", uploadDate: "2026-04-06", extractionStatus: "completed", reviewStatus: "reviewed", tags: ["interview"], linked: 2, size: "12 MB", duration: "04:22" },
  { id: "F8", batchId: "B4", name: "supervisor_followup_interview.mp3", type: "Audio", source: "Digital Recorder", uploadedBy: "John Doe", uploadDate: "2026-04-06", extractionStatus: "completed", reviewStatus: "partial", tags: ["interview", "management"], linked: 1, size: "8.5 MB", duration: "02:15" },
  { id: "F9", batchId: "B4", name: "radio_communication_shift_B.m4a", type: "Audio", source: "Radio Link Archiver", uploadedBy: "System", uploadDate: "2026-04-05", extractionStatus: "completed", reviewStatus: "pending", tags: ["radio-log"], linked: 0, size: "4.1 MB", duration: "10:05" },
  { id: "F10", batchId: "B5", name: "cctv_zone_b_conveyor_1430.mp4", type: "Video", source: "CCTV-Z2", uploadedBy: "System", uploadDate: "2026-04-05", extractionStatus: "completed", reviewStatus: "pending", tags: ["cctv", "incident"], linked: 0, size: "124 MB", url: "https://assets.mixkit.co/videos/preview/mixkit-mechanical-gears-moving-in-a-machine-42409-large.mp4" },
];

const analysisAgents = [
  { name: "PEEPO Reasoning", icon: Brain, purpose: "Analyzing high-level safety culture and human factors.", inputReady: true, lastRun: "2h ago", lastStatus: "reviewed" },
  { name: "IPLS Classification", icon: FileSearch, purpose: "Classifying incident according to enterprise safety standards.", inputReady: true, lastRun: "1h ago", lastStatus: "draft" },
  { name: "Fact & Chronology", icon: Clock, purpose: "Building a verified timeline from evidence fragments.", inputReady: true, lastRun: "30m ago", lastStatus: "reviewed" },
  { name: "Prevention Engine", icon: CheckCircle2, purpose: "Generating preventive actions and control recommendations.", inputReady: false, lastRun: "—", lastStatus: "not_run" },
  { name: "Actor Intelligence", icon: DocIcon, purpose: "Analyzing worker profiles, training history and fatigue levels.", inputReady: true, lastRun: "4h ago", lastStatus: "draft" },
];

const extractionData = {
  "image_properties": {
    "scale": "normal",
    "source": "CCTV fixed",
    "lighting": "Daylight",
    "image_quality": "Clear"
  },
  "composition": {
    "activities": [
      "Tumpahan sampah dan material konstruksi di area tanah"
    ],
    "relationships": [
      "Tumpukan sampah berada di samping jalan tanah and dekat bangunan workshop",
      "Kerucut lalu lintas tergeletak di dekat tumpukan sampah",
      "Pagar kayu and papan kayu berserakan di atas tumpukan"
    ],
    "area_condition": "Area tanah berdebu dengan tumpahan sampah and material konstruksi, tidak rapi, and tidak terkendali.",
    "central_object": {
      "name": "Tumpukan sampah dan material konstruksi",
      "shape": "Tidak beraturan",
      "material": "Karet, kayu, plastik, logam, and tanah",
      "estimated_size": "Sedang (sekitar 2-3 meter lebar)"
    },
    "surrounding_objects": [
      "Bangunan workshop dengan dinding seng biru",
      "Jalan tanah berdebu",
      "Pohon and vegetasi di latar belakang",
      "Bendera Indonesia di tiang",
      "Kerucut lalu lintas oranye",
      "Pagar kayu and papan kayu",
      "Tanda peringatan kuning-hitam"
    ]
  },
  "people_ppe": {
    "activities": [],
    "person_count": 0,
    "ppe_equipment": {
      "gloves": { "color": "Tidak terlihat", "detected": false, "description": "Tidak terlihat", "properly_worn": false },
      "earplugs": { "color": "Tidak terlihat", "detected": false, "description": "Tidak terlihat", "properly_worn": false },
      "safety_boots": { "color": "Tidak terlihat", "detected": false, "description": "Tidak terlihat", "properly_worn": false },
      "safety_glass": { "color": "Tidak terlihat", "detected": false, "description": "Tidak terlihat", "properly_worn": false },
      "safety_helmet": { "color": "Tidak terlihat", "detected": false, "description": "Tidak terlihat", "properly_worn": false },
      "safety_harness": { "color": "Tidak terlihat", "detected": false, "description": "Tidak terlihat", "properly_worn": false },
      "reflective_vest": { "color": "Tidak terlihat", "detected": false, "description": "Tidak terlihat", "properly_worn": false },
      "respiratory_mask": { "color": "Tidak terlihat", "detected": false, "description": "Tidak terlihat", "properly_worn": false }
    },
    "hazard_potential": [],
    "people_relationships": []
  },
  "vehicles": [],
  "traffic_control": [],
  "access_infra": [],
  "environment": {
    "size": "Luas area terbuka dengan tumpahan sampah di tengah",
    "type": "Area konstruksi atau workshop luar ruangan",
    "condition": "Tidak terawat, kotor, and berpotensi menimbulkan bahaya lingkungan serta keselamatan.",
    "composition": "Lingkungan luar ruangan dengan tanah berdebu, vegetasi alami di latar belakang, and struktur bangunan workshop di sisi kanan."
  },
  "initial_interpretation": {
    "brief_summary": "Tumpahan sampah and material konstruksi yang tidak dikelola dengan baik di area workshop, menunjukkan ketidaksesuaian dalam pengelolaan sampah and potensi bahaya lingkungan.",
    "main_hazard_potentials": [
      "Bahaya lingkungan akibat penumpahan sampah",
      "Bahaya keselamatan karena material berserakan and kerucut lalu lintas tergeletak",
      "Potensi kebakaran atau pencemaran tanah"
    ],
    "estimated_risk_category": "medium",
    "supporting_hazard_factors": [
      "Tidak ada penandaan atau penghalang yang memadai",
      "Material tidak disimpan atau dikelola sesuai prosedur",
      "Area tidak bersih and tidak terawat"
    ]
  }
};

const audioExtractionData = {
  "recording_properties": {
    "file_name": "witness_statement_operator_A.mp3",
    "duration": "08:42",
    "audio_quality": "High",
    "recording_type": "Interview / Field Recording",
    "source": "B1-Operator-Radio",
    "language": "Indonesian / English (Mixed)",
    "channel_type": "Mono",
    "noise_level": "Moderate (Background Industrial Noise)",
    "clarity": "Good",
    "overlap_level": "Low"
  },
  "participants": {
    "speaker_count": 2,
    "speakers": [
      {
        "speaker_id": "SPK_01",
        "display_name": "Ahnad (Operator)",
        "probable_role": "Primary Operator",
        "role_confidence": "High",
        "total_speaking_time": "05:12",
        "tone_summary": "Distressed, Urgent",
        "pace": "Rapid",
        "stress_level": "High",
        "confidence_level": "High"
      },
      {
        "speaker_id": "SPK_02",
        "display_name": "Supervisor B",
        "probable_role": "Safety Lead",
        "role_confidence": "High",
        "total_speaking_time": "03:30",
        "tone_summary": "Calm, Directive",
        "pace": "Measured",
        "stress_level": "Low",
        "confidence_level": "Very High"
      }
    ]
  },
  "diarization_overview": {
    "total_segments": 14,
    "overlap_count": 2,
    "interruptions_count": 1,
    "silent_gap_count": 3
  },
  "key_statements": [
    {
      "type": "claim",
      "severity": "high",
      "speaker_id": "SPK_01",
      "timestamp": "01:22",
      "statement": "I noticed the vibration around 14:15. It didn't sound right so I called Supervisor B.",
      "evidence_note": "Confirms awareness before total failure."
    },
    {
      "type": "verification",
      "severity": "medium",
      "speaker_id": "SPK_02",
      "timestamp": "03:45",
      "statement": "Understood. We are checking maintenance logs for roller #14 immediately.",
      "evidence_note": "Acknowledge of specific equipment issues."
    }
  ],
  "timeline_events": [
    { "timestamp": "01:22", "speaker_id": "SPK_01", "event_title": "Detection", "event_detail": "Unusual vibration detected by operator.", "importance": "critical" },
    { "timestamp": "01:45", "speaker_id": "SPK_01", "event_title": "Reporting", "event_detail": "First contact with site supervisor.", "importance": "high" },
    { "timestamp": "03:45", "speaker_id": "SPK_02", "event_title": "Response Init", "event_detail": "Supervisor initiates maintenance log check.", "importance": "medium" }
  ],
  "risk_safety_signals": [
    { "signal_type": "Procedure Deviation", "severity": "medium", "timestamp": "04:12", "speaker_id": "SPK_01", "description": "Operator continued to observe the belt from within 5m, ignoring standard standoff protocol." },
    { "signal_type": "Equipment Issue", "severity": "high", "timestamp": "01:22", "speaker_id": "SPK_01", "description": "Audible high-pitched screeching reported but machine not immediately stopped." }
  ],
  "contradictions_unclear_points": [
    { "type": "Timeline Mismatch", "timestamp": "05:20", "description": "Operator claims alarm sounded at 14:30, but SCADA logs show 14:35.", "confidence": "high" }
  ],
  "summary": {
    "brief_summary": "A 8-minute recording of the initial emergency response call during the belt failure.",
    "main_findings": [
      "Operator reported vibration 20 minutes before failure.",
      "Initial response was focused on documentation rather than immediate shutdown.",
      "Clear audible background noise confirms machinery state."
    ],
    "potential_risk_implication": ["Delay in emergency shutdown procedures."],
    "recommended_human_review_focus": ["Review cross-check between Operator A and SCADA logs regarding the alarm time."]
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

// --- Components ---

function StatusIndicator({ status, type }: { status: string, type: 'extraction' | 'review' }) {
  if (!status) return null;
  const isAlt = status === "completed" || status === "matched" || status === "reviewed";
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
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-white/95 backdrop-blur-md px-1.5 py-1 rounded-xl border border-slate-200 shadow-2xl flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-y-2 group-hover:translate-y-0 scale-95 group-hover:scale-100">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-slate-100 rounded-lg" onClick={handleZoomIn} title="Zoom In"><ZoomIn className="h-4 w-4 text-slate-700" /></Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-slate-100 rounded-lg" onClick={handleZoomOut} title="Zoom Out"><ZoomOut className="h-4 w-4 text-slate-700" /></Button>
          <div className="w-px h-4 bg-slate-200 mx-1" />
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-slate-100 rounded-lg" onClick={handleReset} title="Reset View"><RefreshCcw className="h-3.5 w-3.5 text-slate-700" /></Button>
          <div className="w-px h-4 bg-slate-200 mx-1" />
          <Button variant="ghost" size="sm" className="h-8 px-2 text-[9px] font-black text-slate-700 hover:bg-slate-100 rounded-lg uppercase tracking-wider" onClick={() => { setZoom(1); setPosition({x:0, y:0}); }}>Fit</Button>
          <Button variant="ghost" size="sm" className="h-8 px-2 text-[9px] font-black text-slate-700 hover:bg-slate-100 rounded-lg uppercase tracking-wider border border-transparent hover:border-slate-100" onClick={() => setZoom(1.5)}>1.5x</Button>
          <div className="w-px h-4 bg-slate-200 mx-1" />
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-slate-100 rounded-lg" title="Open Original" onClick={() => window.open(file.url, '_blank')}><ExternalLink className="h-3.5 w-3.5 text-slate-700" /></Button>
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
}function AIAnalysisPanel({ file }: { file: any }) {
  const [viewMode, setViewMode] = useState<"Structured" | "JSON">("Structured");
  const [expandedSections, setExpandedSections] = useState<string[]>(["Image Properties", "Initial Interpretation"]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  const categories = [
    { name: "Image Properties", id: "image_properties", icon: ImageIcon, data: extractionData.image_properties },
    { name: "Composition & Objects", id: "composition", icon: LayoutGrid, data: extractionData.composition },
    { name: "People & PPE", id: "people_ppe", icon: Users, data: extractionData.people_ppe },
    { name: "Vehicles", id: "vehicles", icon: Truck, data: extractionData.vehicles },
    { name: "Traffic Control", id: "traffic_control", icon: Navigation, data: extractionData.traffic_control },
    { name: "Access & Infra", id: "access_infra", icon: Box, data: extractionData.access_infra },
    { name: "Environment", id: "environment", icon: Wind, data: extractionData.environment },
    { name: "Initial Interpretation", id: "initial_interpretation", icon: Brain, data: extractionData.initial_interpretation },
  ];

  const DataField = ({ label, value, fullWidth = false }: { label: string, value: any, fullWidth?: boolean }) => (
    <div className={`${fullWidth ? 'col-span-2' : ''} mb-3 last:mb-0`}>
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight block mb-0.5">{label}</span>
      <div className="text-xs font-bold text-slate-800 leading-snug">{value || "—"}</div>
    </div>
  );

  const PPETag = ({ name, data }: { name: string, data: any }) => {
    const isYes = data.detected === true;
    const isNo = data.detected === false;
    
    return (
      <div className="flex flex-col gap-1 p-2 border rounded-lg bg-slate-50/50">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-500 capitalize">{name.replace('_', ' ')}</span>
          <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase text-center min-w-[32px] ${
            isYes ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 
            isNo ? 'bg-rose-50 text-rose-600 border border-rose-100' : 
            'bg-slate-100 text-slate-400 border border-slate-200'
          }`}>
            {isYes ? 'Yes' : isNo ? 'No' : 'N/A'}
          </span>
        </div>
        {(data.color || data.description) && data.color !== "Tidak terlihat" && (
          <span className="text-[9px] text-slate-400 italic leading-tight truncate">{data.color} · {data.description}</span>
        )}
      </div>
    );
  };

  const renderStructuredContent = (id: string, data: any) => {
    switch (id) {
      case "image_properties":
        return (
          <div className="grid grid-cols-2 gap-x-4">
             <DataField label="Scale" value={data.scale} />
             <DataField label="Source" value={data.source} />
             <DataField label="Lighting" value={data.lighting} />
             <DataField label="Quality" value={data.image_quality} />
          </div>
        );
      case "composition":
        return (
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 opacity-60">Activities</span>
              <div className="flex flex-wrap gap-1.5">
                {data.activities.length > 0 ? data.activities.map((a: string, i: number) => (
                  <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded border border-slate-200">{a}</span>
                )) : <span className="text-xs italic text-slate-300">No activities detected</span>}
              </div>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 opacity-60">Relationships</span>
              <ul className="space-y-1">
                {data.relationships.length > 0 ? data.relationships.map((r: string, i: number) => (
                  <li key={i} className="text-[11px] font-bold text-slate-600 flex gap-2">
                    <span className="text-primary mt-1">•</span> {r}
                  </li>
                )) : <span className="text-xs italic text-slate-300">—</span>}
              </ul>
            </div>
            <DataField label="Area Condition" value={data.area_condition} fullWidth />
            <div className="p-3 border rounded-xl bg-slate-50 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
               <span className="text-[10px] font-bold text-primary uppercase tracking-widest block mb-2 border-b border-primary/5 pb-1">Central Object</span>
               <div className="grid grid-cols-2 gap-2">
                 <DataField label="Name" value={data.central_object.name} />
                 <DataField label="Shape" value={data.central_object.shape} />
                 <DataField label="Material" value={data.central_object.material} />
                 <DataField label="Est. Size" value={data.central_object.estimated_size} />
               </div>
            </div>
          </div>
        );
      case "people_ppe":
        return (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <DataField label="Person Count" value={data.person_count} />
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight block mb-0.5">Activities</span>
                <span className="text-xs italic text-slate-300">No data</span>
              </div>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3 opacity-60 border-b pb-1">PPE Compliance Detail</span>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(data.ppe_equipment).map(([key, val]: any) => (
                  <PPETag key={key} name={key} data={val} />
                ))}
              </div>
            </div>
            {data.hazard_potential.length > 0 && (
               <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 opacity-60">Hazard Potential</span>
                  {data.hazard_potential.map((h: string, i: number) => <span key={i} className="text-xs font-bold text-rose-600">• {h}</span>)}
               </div>
            )}
          </div>
        );
      case "environment":
        return (
          <div className="grid grid-cols-2 gap-4">
             <DataField label="Size" value={data.size} />
             <DataField label="Type" value={data.type} />
             <DataField label="Condition" value={data.condition} fullWidth />
             <DataField label="Composition" value={data.composition} fullWidth />
          </div>
        );
      case "initial_interpretation":
        return (
          <div className="space-y-4">
            <DataField label="Brief Summary" value={data.brief_summary} fullWidth />
            <div className="flex items-center justify-between py-2 border-y border-slate-50">
               <span className="text-[10px] font-bold text-slate-400 uppercase">Risk Level</span>
               <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-sm border ${
                 data.estimated_risk_category === 'critical' ? 'bg-rose-500 text-white border-rose-600' :
                 data.estimated_risk_category === 'high' ? 'bg-amber-500 text-white border-amber-600' :
                 'bg-emerald-500 text-white border-emerald-600'
               }`}>
                 {data.estimated_risk_category}
               </span>
            </div>
            <div>
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 opacity-60">Main Hazard Potentials</span>
               <div className="flex flex-wrap gap-1.5">
                 {data.main_hazard_potentials.map((h: string, i: number) => (
                   <span key={i} className="px-2 py-0.5 bg-rose-50 text-rose-700 text-[10px] font-bold rounded border border-rose-100">{h}</span>
                 ))}
               </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="py-6 text-center border-2 border-dashed rounded-xl bg-slate-50">
            <span className="text-xs font-bold text-slate-300 italic tracking-widest uppercase">No Data Available</span>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="px-5 py-4 shrink-0 flex items-center justify-between border-b bg-slate-50/20">
         <div className="flex items-center gap-2">
           <Brain className="h-4 w-4 text-primary" />
           <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Analysis Matrix</span>
         </div>
         <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg border border-slate-200/60 shadow-inner">
            <button 
              onClick={() => setViewMode("Structured")}
              className={`px-3 py-1 text-[9px] font-black uppercase tracking-tighter rounded-md transition-all ${viewMode === "Structured" ? "bg-white text-primary shadow-sm ring-1 ring-slate-200/50" : "text-slate-400 hover:text-slate-600"}`}
            >
              Structured
            </button>
            <button 
              onClick={() => setViewMode("JSON")}
              className={`px-3 py-1 text-[9px] font-black uppercase tracking-tighter rounded-md transition-all ${viewMode === "JSON" ? "bg-white text-primary shadow-sm ring-1 ring-slate-200/50" : "text-slate-400 hover:text-slate-600"}`}
            >
              JSON
            </button>
         </div>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar p-5 space-y-3">
         {categories.map((cat) => (
            <div key={cat.id} className={`border rounded-xl overflow-hidden shadow-sm transition-all duration-300 ${expandedSections.includes(cat.name) ? 'ring-1 ring-primary/20 shadow-md translate-y-[-2px]' : 'hover:border-slate-300'}`}>
               <button 
                 onClick={() => toggleSection(cat.name)}
                 className={`w-full flex items-center justify-between p-4 transition-colors ${expandedSections.includes(cat.name) ? 'bg-slate-50/80 border-b' : 'bg-white hover:bg-slate-50/50'}`}
               >
                 <div className="flex items-center gap-3">
                   <div className={`h-8 w-8 rounded-lg border shadow-sm flex items-center justify-center transition-all ${expandedSections.includes(cat.name) ? 'bg-primary text-white border-primary shadow-primary/20' : 'bg-white text-slate-400'}`}>
                     <cat.icon className="h-4 w-4" />
                   </div>
                   <span className={`text-sm font-bold transition-colors ${expandedSections.includes(cat.name) ? 'text-slate-900' : 'text-slate-700'}`}>{cat.name}</span>
                 </div>
                 <div className={`transition-transform duration-300 ${expandedSections.includes(cat.name) ? 'rotate-180' : ''}`}>
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                 </div>
               </button>
               
               {expandedSections.includes(cat.name) && (
                 <div className="p-5 bg-white animate-in slide-in-from-top-2 duration-300">
                    {viewMode === "Structured" ? (
                      renderStructuredContent(cat.id, cat.data)
                    ) : (
                      <div className="bg-slate-900 rounded-lg p-4 overflow-hidden border border-slate-800 shadow-inner">
                        <pre className="text-[10.5px] font-mono text-emerald-400 leading-relaxed overflow-auto max-h-[400px] custom-scrollbar">
                           {JSON.stringify(cat.data, null, 2)}
                        </pre>
                      </div>
                    )}
                 </div>
               )}
            </div>
         ))}
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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-200">
        <div className="p-6">
          <div className="h-12 w-12 rounded-xl bg-rose-50 flex items-center justify-center mb-4">
             <Trash2 className="h-6 w-6 text-rose-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 border-none p-0 mb-2">Delete Evidence File</h3>
          <p className="text-sm text-slate-500 leading-relaxed mb-6">
            This action is <span className="text-rose-600 font-bold uppercase underline">irreversible</span>. Deleting <span className="font-bold text-slate-900">"{fileName}"</span> will permanently remove it and all associated AI-extracted intelligence from this case.
          </p>

          <div className="space-y-4">
            <div>
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Security Challenge</label>
               <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-2 select-none pointer-events-none flex flex-col items-center">
                  <span className="text-[10px] text-slate-400 uppercase font-black mb-1">Type the code to confirm deletion</span>
                  <span className="text-3xl font-extrabold text-slate-300 tracking-[0.5em]">{captchaCode}</span>
               </div>
               <input 
                  autoFocus
                  className="w-full h-12 border rounded-xl px-4 text-center font-black text-xl tracking-[0.2em] focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all placeholder:text-slate-200"
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
              className={`h-11 px-8 font-black uppercase tracking-widest transition-all ${isConfirmed ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-500/20' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}
           >
              Confirm Delete
           </Button>
        </div>
      </div>
    </div>
  );
}

function ExtractionTab({ files: evidenceFiles, setFiles: setEvidenceFiles }: { files: any[], setFiles: React.Dispatch<React.SetStateAction<any[]>> }) {
  const [selectedFile, setSelectedFile] = useState<any>(evidenceFiles[1]);
  const [activeFilter, setActiveFilter] = useState("All Files");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [expandedBatches, setExpandedBatches] = useState<string[]>(["B1", "B2", "B4", "B5"]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const toggleBatch = (id: string) => {
    setExpandedBatches(prev => prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]);
  };

  const handleUploadComplete = (newFiles: any[]) => {
    const formattedFiles = newFiles.map(f => ({
      ...f,
      batchId: "B2",
      source: "Manual Upload",
      uploadedBy: "Current User",
      extractionStatus: "processing",
      reviewStatus: "pending",
      tags: [],
      linked: 0
    }));
    setEvidenceFiles(prev => [...formattedFiles, ...prev]);
  };

  const handleDelete = () => {
    if (selectedFile) {
      setEvidenceFiles(prev => prev.filter(f => f.id !== selectedFile.id));
      setSelectedFile(null);
      setIsDeleteModalOpen(false);
    }
  };

  const goToNext = () => {
    const allFiles = activeFilter === "All Files" ? groupedFiles.flatMap(b => b.files) : filteredFiles;
    const currentIndex = allFiles.findIndex(f => f.id === selectedFile?.id);
    if (currentIndex < allFiles.length - 1) {
      setSelectedFile(allFiles[currentIndex + 1]);
    }
  };

  const goToPrev = () => {
    const allFiles = activeFilter === "All Files" ? groupedFiles.flatMap(b => b.files) : filteredFiles;
    const currentIndex = allFiles.findIndex(f => f.id === selectedFile?.id);
    if (currentIndex > 0) {
      setSelectedFile(allFiles[currentIndex - 1]);
    }
  };

  const handleReview = () => {
    if (selectedFile) {
      const updatedFiles = evidenceFiles.map(f => 
        f.id === selectedFile.id ? { ...f, reviewStatus: "reviewed" } : f
      );
      setEvidenceFiles(updatedFiles);
      setSelectedFile({ ...selectedFile, reviewStatus: "reviewed" });
    }
  };

  const filteredFiles = evidenceFiles.filter(f => {
    const matchesFilter = activeFilter === "All Files" 
      ? f.extractionStatus !== "not_started"
      : f.type === activeFilter.replace(/s$/, "");
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const groupedFiles = evidenceBatches.map(batch => ({
    ...batch,
    files: filteredFiles.filter(f => f.batchId === batch.id)
  })).filter(b => b.files.length > 0);

  return (
    <div className="flex h-full overflow-hidden">
      {/* LEFT PANEL — Unified Evidence Library */}
      <div className="w-[320px] min-w-[280px] border-r bg-white flex flex-col shrink-0 z-20 shadow-[1px_0_5px_rgba(0,0,0,0.03)]">
        <div className="p-4 border-b space-y-3 bg-slate-50/20">
           <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Evidence Control</span>
              <button className="p-1 hover:bg-slate-200 rounded transition-colors"><Settings className="h-3.5 w-3.5 text-slate-400" /></button>
           </div>
           
           <Button 
            onClick={() => setIsUploadModalOpen(true)}
            className="w-full h-10 bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest text-[10px] gap-2 shadow-lg shadow-slate-900/10 active:scale-[0.98] transition-all"
           >
              <Upload className="h-3.5 w-3.5" /> Add New Evidence
           </Button>

           <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-primary transition-colors" />
              <input 
                placeholder="Search library..." 
                className="w-full h-9 pl-9 pr-4 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
           </div>
        </div>
        
        <div className="px-2.5 py-2 border-b flex gap-1 bg-white shadow-sm">
           {[
             { id: "All Files", label: "All", icon: Grid },
             { id: "Document", label: "Docs", icon: FileText },
             { id: "Image", label: "Images", icon: ImageIcon },
             { id: "Audio", label: "Audio", icon: AudioIcon },
             { id: "Video", label: "Video", icon: VideoIcon },
           ].map(f => (
              <button 
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                title={f.id}
                className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-1.5 px-0.5 rounded-md border transition-all ${
                  activeFilter === f.id
                  ? "bg-slate-900 text-white border-slate-900 shadow-sm" 
                  : "bg-white text-slate-400 border-slate-100 hover:border-slate-300 hover:text-slate-700 hover:bg-slate-50"
                }`}
              >
                <f.icon className="h-3.5 w-3.5" />
                <span className="text-[9px] font-bold uppercase tracking-wide">{f.label}</span>
              </button>
           ))}
        </div>

        <div className="flex-1 overflow-auto custom-scrollbar bg-slate-50/30">
           {activeFilter === "All Files" ? (
             groupedFiles.map(batch => (
               <div key={batch.id} className="border-b last:border-b-0 bg-white">
                  <div 
                    onClick={() => toggleBatch(batch.id)}
                    className="flex items-start gap-2 px-3 py-2.5 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors border-b border-slate-100"
                  >
                     <div className="shrink-0 mt-0.5">
                       {expandedBatches.includes(batch.id) ? <ChevronDown className="h-3 w-3 text-slate-400" /> : <ChevronRight className="h-3 w-3 text-slate-400" />}
                     </div>
                     <Folders className="h-3.5 w-3.5 text-primary/60 shrink-0 mt-0.5" />
                     {/* Allow folder name to wrap — no truncation */}
                     <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter leading-snug flex-1 min-w-0">{batch.name}</span>
                     <span className="text-[9px] font-bold text-slate-400 bg-white px-1.5 py-0.5 rounded-full border shrink-0 mt-0.5 ml-1">{batch.files.length}</span>
                  </div>
                  {expandedBatches.includes(batch.id) && batch.files.map(file => (
                    <div 
                      key={file.id}
                      onClick={() => setSelectedFile(file)}
                      className={`px-3 py-2.5 pl-7 border-b border-slate-50 cursor-pointer transition-all hover:bg-slate-50/80 relative group ${
                        selectedFile?.id === file.id ? "bg-primary/5 border-l-[3px] border-l-primary" : "border-l-[3px] border-l-transparent"
                      }`}
                    >
                       <div className="flex gap-2.5 items-start">
                          <div className={`h-7 w-7 rounded shrink-0 flex items-center justify-center border mt-0.5 ${
                            selectedFile?.id === file.id ? "bg-white border-primary/20 shadow-sm" : "bg-white border-slate-100"
                          }`}>
                             {getFileIcon(file.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                             <div className="flex items-center justify-between mb-0.5 gap-2">
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter shrink-0">{file.type}</span>
                                <span className="text-[9px] font-medium text-slate-400 shrink-0">{file.size}</span>
                             </div>
                             <p className={`text-[11px] font-bold leading-snug break-all line-clamp-2 ${selectedFile?.id === file.id ? "text-primary" : "text-slate-800"}`}>{file.name}</p>
                             <div className="flex items-center gap-2 mt-2">
                                <StatusIndicator status={file.extractionStatus} type="extraction" />
                                <div className="h-1 w-1 rounded-full bg-slate-200" />
                                <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">{file.uploadDate}</span>
                                {file.tags.includes("key") && <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400 ml-auto" />}
                             </div>
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
             ))
           ) : (
             filteredFiles.map(file => (
               <div 
                 key={file.id}
                 onClick={() => setSelectedFile(file)}
                 className={`px-3 py-2.5 border-b border-slate-50 cursor-pointer transition-all hover:bg-slate-50/80 relative group ${
                   selectedFile?.id === file.id ? "bg-primary/5 border-l-[3px] border-l-primary" : "border-l-[3px] border-l-transparent"
                 }`}
               >
                  <div className="flex gap-2.5 items-start">
                     <div className={`h-7 w-7 rounded shrink-0 flex items-center justify-center border mt-0.5 ${
                       selectedFile?.id === file.id ? "bg-white border-primary/20 shadow-sm" : "bg-white border-slate-100"
                     }`}>
                        {getFileIcon(file.type)}
                     </div>
                     <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5 gap-2">
                           <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter shrink-0">{file.type}</span>
                           <span className="text-[9px] font-medium text-slate-400 shrink-0">{file.size}</span>
                        </div>
                        <p className={`text-[11px] font-bold leading-snug break-all line-clamp-2 ${selectedFile?.id === file.id ? "text-primary" : "text-slate-800"}`}>{file.name}</p>
                        <div className="flex items-center gap-2 mt-2">
                           <StatusIndicator status={file.extractionStatus} type="extraction" />
                           <div className="h-1 w-1 rounded-full bg-slate-200" />
                           <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">{file.uploadDate}</span>
                           {file.tags.includes("key") && <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400 ml-auto" />}
                        </div>
                     </div>
                  </div>
               </div>
             ))
           )}
           {(activeFilter === "All Files" ? groupedFiles : filteredFiles).length === 0 && (
               <div className="p-8 text-center text-slate-400">
                  <Search className="h-8 w-8 mx-auto mb-3 opacity-20" />
                  <p className="text-xs font-bold uppercase tracking-widest opacity-50">No files found</p>
               </div>
            )}
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
                      <h2 className="text-sm font-black text-slate-900 tracking-tight">{selectedFile.name}</h2>
                   </div>
                   <div className="h-4 w-px bg-slate-200" />
                   <div className="flex items-center gap-3">
                      <StatusIndicator status={selectedFile.extractionStatus} type="extraction" />
                      <ConfidenceChip level="high" />
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

        {/* CENTER — flex-1, but preview canvas is capped so it doesn't over-expand on wide screens */}
        <div className="flex-1 overflow-auto bg-[#f0f2f4] p-6 flex flex-col items-center custom-scrollbar" style={{ minWidth: 0 }}>
            <div className="w-full max-w-3xl h-full flex items-center justify-center">
              {selectedFile ? (
                <AdaptiveSourcePreview file={selectedFile} />
              ) : (
                <div className="flex flex-col items-center justify-center p-12 text-center">
                   <div className="h-20 w-20 rounded-[2.5rem] bg-white shadow-2xl flex items-center justify-center mb-8 border border-white/50 animate-in fade-in zoom-in duration-700">
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

      {/* RIGHT PANEL — 460px for dense structured content (JSON, accordion, action buttons) */}
      <div className="w-[460px] min-w-[380px] border-l bg-white flex flex-col shrink-0 z-20 shadow-[-2px_0_6px_rgba(0,0,0,0.04)]">
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
        
        <div className="flex-1 overflow-auto custom-scrollbar bg-white">
           {selectedFile?.type === "Image" ? (
             <AIAnalysisPanel file={selectedFile} />
           ) : (
             <div className="p-6">
               <AdaptiveExtractionOutput file={selectedFile} />
             </div>
           )}
        </div>

        {/* Action bar — prominent, stable, always visible */}
        <div className="px-5 py-4 border-t bg-white shrink-0 shadow-[0_-2px_8px_rgba(0,0,0,0.04)]">
           <div className="flex items-center gap-2">
              <Button 
                onClick={handleReview}
                disabled={selectedFile?.reviewStatus === "reviewed"}
                className={`flex-1 h-9 text-xs font-black uppercase tracking-widest shadow-sm transition-all ${
                  selectedFile?.reviewStatus === "reviewed" 
                  ? "bg-emerald-500 hover:bg-emerald-600 text-white" 
                  : "bg-slate-900 hover:bg-slate-800 text-white"
                }`}
              >
                 {selectedFile?.reviewStatus === "reviewed" ? (
                   <span className="flex items-center gap-2 tracking-tighter"><CheckCircle className="h-4 w-4" /> Review Complete</span>
                 ) : "Verify & Mark Reviewed"}
              </Button>
              <Button variant="outline" className="h-9 px-3 border-slate-200 hover:bg-slate-50">
                 <MoreVertical className="h-4 w-4 text-slate-400" />
              </Button>
           </div>
        </div>
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
        onUploadComplete={handleUploadComplete}
      />
    </div>
  );
}

function AdaptiveSourcePreview({ file }: { file: any }) {
  if (!file) return <div className="p-20 text-center text-slate-400 font-bold uppercase tracking-[0.2em] opacity-50">Select evidence for preview</div>;
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
      <div className="w-full max-w-4xl aspect-[4/3] bg-[#0f172a] rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative overflow-hidden group animate-in fade-in zoom-in-95 duration-500 ring-1 ring-white/10">
         <ImageViewer file={file} />
      </div>
    );
  }

  if (file.type === "Audio") {
    // Shared state for playback
    const [currentTime, setCurrentTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    
    // Jump to time helper
    const jumpTo = (timeStr: string) => {
      const parts = timeStr.split(':').map(Number);
      const seconds = parts[0] * 60 + parts[1];
      setCurrentTime(seconds);
      setIsPlaying(true);
    };

    // Helper to check if current time is within a segment
    const isSegmentActive = (start: string, end: string) => {
      const getS = (s: string) => s.split(':').map(Number)[0] * 60 + s.split(':').map(Number)[1];
      return currentTime >= getS(start) && currentTime <= getS(end);
    };

    return (
       <div className="w-full max-w-4xl space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-20">
          {/* Audio Player Card */}
          <div className="bg-white border-2 border-slate-100 rounded-2xl shadow-xl p-8 space-y-8 relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity">
                <AudioIcon className="h-32 w-32 -mr-10 -mt-10 rotate-12" />
             </div>
             
             <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-4">
                   <div className="h-14 w-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-slate-900/20 group-hover:scale-105 transition-transform">
                      <AudioIcon className="h-7 w-7" />
                   </div>
                   <div>
                      <h3 className="text-xl font-black text-slate-900 leading-tight">{file.name}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <p className="text-[11px] text-slate-400 font-black uppercase tracking-[0.2em]">Source: {file.source || "External"}</p>
                        <div className="h-1 w-1 bg-slate-300 rounded-full" />
                        <p className="text-[11px] text-slate-400 font-black uppercase tracking-[0.2em]">{file.duration} · High Fidelity</p>
                      </div>
                   </div>
                </div>
                <div className="flex items-center gap-2">
                   <StatusIndicator status="reviewed" type="review" />
                   <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-full hover:bg-slate-100 transition-colors">
                      <MoreVertical className="h-4 w-4 text-slate-400" />
                   </Button>
                </div>
             </div>

             {/* Functional Seek Bar */}
             <div className="space-y-3">
                <div className="h-20 w-full bg-slate-50/50 flex items-end gap-[2px] px-2 py-3 rounded-xl border border-slate-100 group/wave cursor-pointer relative"
                     onClick={(e) => {
                       const rect = e.currentTarget.getBoundingClientRect();
                       const x = e.clientX - rect.left;
                       const pct = x / rect.width;
                       const totalSeconds = 8 * 60 + 42; // mock duration
                       setCurrentTime(Math.floor(totalSeconds * pct));
                     }}>
                   {Array.from({ length: 120 }).map((_, i) => {
                     const totalSeconds = 8 * 60 + 42;
                     const targetX = (i / 120) * totalSeconds;
                     const isPast = targetX <= currentTime;
                     return (
                        <div key={i} 
                             className={`flex-1 rounded-full transition-all duration-300 ${isPast ? "bg-primary" : "bg-slate-200"}`} 
                             style={{ height: `${20 + Math.sin(i * 0.2) * 20 + Math.random() * 40}%`, opacity: isPast ? 1 : 0.4 }} />
                     );
                   })}
                   {/* Playhead indicator */}
                   <div className="absolute top-0 bottom-0 w-0.5 bg-primary z-20 shadow-[0_0_10px_rgba(37,99,235,0.8)]" 
                        style={{ left: `${(currentTime / (8*60+42)) * 100}%` }} />
                </div>
                <div className="flex justify-between px-1">
                   <span className="text-[11px] font-black text-slate-400 tabular-nums">
                     {Math.floor(currentTime / 60).toString().padStart(2, '0')}:{(currentTime % 60).toString().padStart(2, '0')}
                   </span>
                   <span className="text-[11px] font-black text-slate-400 tabular-nums">{file.duration}</span>
                </div>
             </div>

             <div className="flex items-center justify-between bg-slate-50/50 p-2 rounded-2xl border border-slate-100 shadow-inner">
                <div className="flex items-center gap-1">
                   <Button variant="ghost" size="sm" className="h-9 w-9 p-0 text-slate-500" onClick={() => setCurrentTime(prev => Math.max(0, prev - 10))}><RefreshCcw className="h-4 w-4 -scale-x-100" /></Button>
                   <Button 
                      className="h-12 w-12 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-xl hover:bg-slate-800 transition-all hover:scale-105 active:scale-95"
                      onClick={() => setIsPlaying(!isPlaying)}>
                      {isPlaying ? <div className="h-4 w-4 bg-white rounded-sm" /> : <Play className="h-5 w-5 fill-white ml-1" />}
                   </Button>
                   <Button variant="ghost" size="sm" className="h-9 w-9 p-0 text-slate-500" onClick={() => setCurrentTime(prev => prev + 10)}><RefreshCcw className="h-4 w-4" /></Button>
                </div>
                <div className="flex items-center gap-6">
                   <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rate</span>
                      <select 
                        value={playbackSpeed}
                        onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                        className="bg-transparent text-xs font-black text-slate-700 outline-none border-none cursor-pointer">
                        <option value={0.5}>0.5x</option>
                        <option value={1}>1.0x</option>
                        <option value={1.5}>1.5x</option>
                        <option value={2}>2.0x</option>
                      </select>
                   </div>
                   <div className="flex items-center gap-2">
                       <Wind className="h-4 w-4 text-slate-300" />
                       <div className="w-20 h-1 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full w-3/4 bg-slate-400" />
                       </div>
                   </div>
                </div>
             </div>
          </div>

          {/* Full Diarization Transcript */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
             <div className="px-6 py-4 border-b flex items-center justify-between bg-white relative z-10">
                <div className="flex items-center gap-3">
                   <div className="h-8 w-8 bg-primary/5 rounded-lg flex items-center justify-center border border-primary/10">
                      <FileText className="h-4 w-4 text-primary" />
                   </div>
                   <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Full Diarization Transcript</h3>
                </div>
                <div className="flex items-center gap-3">
                   <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 mr-2">
                      <div className="h-2 w-2 rounded-full bg-primary" /> Current Seg: {currentTime}s
                   </div>
                   <Button variant="outline" size="sm" className="h-7 text-[10px] font-bold gap-1.5 px-3 border-slate-200 hover:bg-slate-50">
                      <Copy className="h-3 w-3" /> Sync Export
                   </Button>
                </div>
             </div>
             
             <div className="flex-1 overflow-auto max-h-[1200px] custom-scrollbar bg-slate-50/20">
                <div className="divide-y divide-slate-100">
                   {audioDiarizationData.map((seg) => {
                     const active = isSegmentActive(seg.start_time, seg.end_time);
                     return (
                        <div 
                          key={seg.segment_id} 
                          id={seg.segment_id}
                          className={`group flex items-start p-6 transition-all cursor-pointer relative overflow-hidden ${active ? "bg-white shadow-[inset_0_0_20px_rgba(37,99,235,0.03)]" : "hover:bg-white"}`}
                          onClick={() => jumpTo(seg.start_time)}>
                          
                          {/* Active Indicator */}
                          <div className={`absolute top-0 bottom-0 left-0 w-1 transition-all ${active ? "bg-primary" : "bg-transparent group-hover:bg-slate-200"}`} />
                          
                          <div className="w-24 shrink-0 pt-0.5">
                             <span className={`text-[11px] font-bold tabular-nums transition-colors ${active ? "text-primary" : "text-slate-400"}`}>
                               {seg.start_time} — {seg.end_time}
                             </span>
                          </div>
                          
                          <div className="flex-1 space-y-2 pl-6">
                             <div className="flex items-center gap-3">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border transition-all ${
                                  seg.speaker_id === "SPK_01" 
                                  ? "bg-amber-50 text-amber-700 border-amber-100 shadow-sm" 
                                  : "bg-indigo-50 text-indigo-700 border-indigo-100 shadow-sm"
                                }`}>
                                   {seg.speaker_label}
                                </span>
                                {seg.flags.includes("key_observation") && <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />}
                                {seg.flags.includes("critical_evidence") && <span className="h-1.5 w-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]" />}
                                {seg.confidence === "medium" && <span className="text-[10px] text-slate-300 italic">low confidence</span>}
                             </div>
                             <p className={`text-sm leading-relaxed transition-colors ${active ? "text-slate-900 font-medium" : "text-slate-600 font-medium"}`}>
                                {seg.text}
                             </p>
                          </div>
                        </div>
                     );
                   })}
                </div>
                {/* Visual End state */}
                <div className="p-12 flex flex-col items-center justify-center text-slate-300 space-y-4 opacity-50">
                    <div className="h-px w-20 bg-slate-200" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Recording Termination</span>
                </div>
             </div>
          </div>
       </div>
    );
  }

  if (file.type === "Video") {
     const [currentTime, setCurrentTime] = useState(0);
     const [isPlaying, setIsPlaying] = useState(false);
     const videoRef = useRef<HTMLVideoElement>(null);

     const activeSegment = videoTimeframesData.find(tf => {
        const getS = (s: string) => s.split(':').map(Number)[0] * 60 + s.split(':').map(Number)[1];
        return currentTime >= getS(tf.start_time) && currentTime <= getS(tf.end_time);
     });

     const jumpTo = (timeStr: string) => {
        const parts = timeStr.split(':').map(Number);
        const seconds = parts[0] * 60 + parts[1];
        if (videoRef.current) {
          videoRef.current.currentTime = seconds;
          videoRef.current.play();
          setIsPlaying(true);
        }
     };

     return (
       <div className="w-full max-w-4xl space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
          {/* Header & Player */}
          <div className="space-y-4">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="h-10 w-10 bg-black rounded-lg flex items-center justify-center text-white border border-white/20 shadow-xl">
                      <VideoIcon className="h-5 w-5" />
                   </div>
                   <div>
                      <h3 className="text-lg font-black text-slate-900 leading-tight uppercase tracking-tight">{file.name}</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-1">
                        {file.source} · High Fidelity Visual Stream · 1080p
                      </p>
                   </div>
                </div>
                <div className="flex items-center gap-2">
                   <StatusIndicator status="completed" type="extraction" />
                   <div className="h-4 w-px bg-slate-200" />
                   <Button variant="outline" size="sm" className="h-8 text-[10px] font-bold uppercase tracking-widest gap-2 bg-white">
                      <Download className="h-3 w-3" /> Export Clip
                   </Button>
                </div>
             </div>

             <div className="aspect-video bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl relative overflow-hidden group">
                <div className="absolute top-4 left-4 z-50 flex items-center gap-2">
                   <div className="h-2 w-2 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
                   <span className="text-[9px] font-black text-white uppercase tracking-[0.2em] bg-black/60 backdrop-blur px-2.5 py-1 rounded border border-white/10">ARCHIVE RECORDING</span>
                </div>
                
                <video
                  ref={videoRef}
                  src={file.url}
                  className="w-full h-full object-contain"
                  onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col gap-4 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                   <div className="flex items-center gap-4">
                      <button onClick={() => isPlaying ? videoRef.current?.pause() : videoRef.current?.play()} className="h-10 w-10 bg-white rounded-full flex items-center justify-center text-slate-900 shadow-xl hover:scale-110 active:scale-95 transition-all">
                        {isPlaying ? <div className="h-3 w-3 bg-slate-900 rounded-sm" /> : <Play className="h-4 w-4 fill-slate-900 ml-0.5" />}
                      </button>
                      <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden cursor-pointer">
                         <div className="h-full bg-primary" style={{ width: `${(currentTime / (14*60+30)) * 100}%` }} />
                      </div>
                      <span className="text-[10px] font-black text-white tabular-nums tracking-widest">
                        {Math.floor(currentTime/60).toString().padStart(2,'0')}:{(Math.floor(currentTime%60)).toString().padStart(2,'0')} / {file.duration}
                      </span>
                   </div>
                </div>
             </div>
          </div>

          {/* Timeframe Review Feed */}
          <div className="space-y-4">
             <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                   <div className="h-8 w-8 bg-slate-900 rounded-lg flex items-center justify-center text-white border border-slate-700">
                      <LayoutGrid className="h-4 w-4" />
                   </div>
                   <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.1em]">Timeframe Investigative Feed</h3>
                </div>
                <div className="flex items-center gap-4">
                   <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-slate-400 uppercase">Interval</span>
                      <span className="px-2 py-0.5 bg-slate-100 text-[10px] font-black rounded border">2:00</span>
                   </div>
                </div>
             </div>

             <div className="space-y-4">
                {videoTimeframesData.map((tf) => {
                  const isActive = activeSegment?.id === tf.id;
                  return (
                    <div key={tf.id} className={`border rounded-2xl overflow-hidden shadow-sm transition-all duration-500 cursor-pointer ${isActive ? "ring-2 ring-primary shadow-2xl scale-[1.01] bg-white translate-x-2" : "bg-white hover:border-slate-300 translate-x-0 opacity-80 hover:opacity-100"}`} onClick={() => jumpTo(tf.start_time)}>
                       <div className={`px-5 py-3 flex items-center justify-between border-b transition-colors ${isActive ? "bg-primary/5 border-primary/10" : "bg-slate-50/50"}`}>
                          <div className="flex items-center gap-3">
                             <div className={`text-[11px] font-black tabular-nums tracking-widest ${isActive ? "text-primary" : "text-slate-500"}`}>
                               {tf.start_time} — {tf.end_time}
                             </div>
                             <div className="h-1 w-1 bg-slate-300 rounded-full" />
                             <span className="text-xs font-black text-slate-800 uppercase tracking-tight">{tf.summary}</span>
                          </div>
                          <div className="flex items-center gap-2">
                             {tf.badges.map(b => (
                               <span key={b} className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border transition-all ${
                                 b === 'critical' || b === 'hazard' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                 b === 'anomaly' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                 'bg-slate-100 text-slate-400 border-slate-200'
                               }`}>{b}</span>
                             ))}
                          </div>
                       </div>
                       
                       <div className="p-8 grid grid-cols-2 gap-10 relative">
                          {/* Script Layer */}
                          <div className="space-y-4 relative">
                             <div className="flex items-center gap-2 mb-2 pb-1 border-b border-slate-50">
                                <FileText className="h-3.5 w-3.5 text-slate-400" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Script / Timeline</span>
                             </div>
                             <div className="space-y-4">
                                <div>
                                   <p className="text-sm font-bold text-slate-900 leading-relaxed italic pr-4">"{tf.script.scene_overview}"</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                   <div>
                                      <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Actors</span>
                                      <ul className="text-[11px] font-bold text-slate-600 space-y-1">
                                         {tf.script.visible_actors.map(a => <li key={a}>• {a}</li>)}
                                      </ul>
                                   </div>
                                   <div>
                                      <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Actions</span>
                                      <ul className="text-[11px] font-bold text-slate-600 space-y-1">
                                         {tf.script.actions.map(a => <li key={a}>• {a}</li>)}
                                      </ul>
                                   </div>
                                </div>
                             </div>
                          </div>

                          {/* Analysis Layer */}
                          <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100 space-y-4 shadow-inner">
                             <div className="flex items-center gap-2 mb-2 pb-1 border-b border-slate-100">
                                <Brain className="h-3.5 w-3.5 text-primary" />
                                <span className="text-[10px] font-black text-primary uppercase tracking-widest">Key Analysis</span>
                             </div>
                             <div className="space-y-4">
                                <div className="flex flex-wrap gap-1.5">
                                   {tf.analysis.events.map(e => (
                                     <span key={e} className="px-2 py-0.5 bg-primary/10 text-primary text-[9px] font-black uppercase rounded border border-primary/20">{e}</span>
                                   ))}
                                </div>
                                <div className="space-y-3">
                                   <div className="flex items-start gap-3">
                                      <div className={`h-2 w-2 mt-1 rounded-full ${tf.analysis.hazards[0] === 'None' ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`} />
                                      <div>
                                         <span className="text-[9px] font-black text-slate-400 uppercase block">Hazard Control</span>
                                         <p className="text-[11px] font-bold text-slate-700">{tf.analysis.hazards[0]}</p>
                                      </div>
                                   </div>
                                   <div className="flex items-start gap-3">
                                      <div className="h-2 w-2 mt-1 rounded-full bg-amber-500" />
                                      <div>
                                         <span className="text-[9px] font-black text-slate-400 uppercase block">Equipment Condition</span>
                                         <p className="text-[11px] font-bold text-slate-700">{tf.analysis.assets}</p>
                                      </div>
                                   </div>
                                </div>
                                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                                   <span className="text-[10px] font-black text-slate-400 uppercase">Analysis Confidence</span>
                                   <span className="text-[10px] font-black text-slate-900">{tf.analysis.confidence}</span>
                                </div>
                             </div>
                          </div>
                       </div>
                    </div>
                  );
                })}
             </div>
          </div>
       </div>
     );
  }

  return null;
}

function AdaptiveExtractionOutput({ file }: { file: any }) {
  if (!file) return null;
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
     const data = audioExtractionData;
     const [viewMode, setViewMode] = useState<"Structured" | "JSON">("Structured");
     const [expandedSections, setExpandedSections] = useState<string[]>(["Recording Properties", "Summary"]);
     
     const toggle = (s: string) => setExpandedSections(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);

     const DataRow = ({ label, value, badge }: any) => (
        <div className="flex items-center justify-between py-1.5">
           <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-tight">{label}</span>
           {badge ? (
             <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${badge.className}`}>{badge.text}</span>
           ) : (
             <span className="text-[11px] font-black text-slate-700">{value || "—"}</span>
           )}
        </div>
     );

     const Section = ({ title, icon: Icon, children }: any) => (
        <div className={`border rounded-xl overflow-hidden shadow-sm transition-all duration-300 ${expandedSections.includes(title) ? 'ring-1 ring-primary/20 shadow-md translate-y-[-2px]' : 'hover:border-slate-300'}`}>
           <button 
              onClick={() => toggle(title)}
              className={`w-full flex items-center justify-between p-4 transition-colors ${expandedSections.includes(title) ? 'bg-slate-50/80 border-b' : 'bg-white hover:bg-slate-50/50'}`}
           >
              <div className="flex items-center gap-3">
                 <div className={`h-8 w-8 rounded-lg border shadow-sm flex items-center justify-center transition-all ${expandedSections.includes(title) ? 'bg-primary text-white border-primary shadow-primary/20' : 'bg-white text-slate-400'}`}>
                    <Icon className="h-4 w-4" />
                 </div>
                 <span className={`text-sm font-black transition-colors ${expandedSections.includes(title) ? 'text-slate-900' : 'text-slate-700'}`}>{title}</span>
              </div>
              <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${expandedSections.includes(title) ? 'rotate-180' : ''}`} />
           </button>
           {expandedSections.includes(title) && (
              <div className="p-5 bg-white space-y-4 animate-in slide-in-from-top-2 duration-300">
                 {children}
              </div>
           )}
        </div>
     );

     return (
        <div className="space-y-3 pb-20">
           {/* Logic Toggle */}
           <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Extraction Console</span>
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border shadow-inner">
                 <button onClick={() => setViewMode("Structured")} className={`px-2 py-0.5 text-[8px] font-black uppercase rounded transition-all ${viewMode === "Structured" ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-slate-600"}`}>Structured</button>
                 <button onClick={() => setViewMode("JSON")} className={`px-2 py-0.5 text-[8px] font-black uppercase rounded transition-all ${viewMode === "JSON" ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-slate-600"}`}>JSON</button>
              </div>
           </div>

           {viewMode === "JSON" ? (
              <div className="bg-slate-900 rounded-2xl p-6 overflow-hidden border border-slate-800 shadow-2xl">
                 <pre className="text-[10.5px] font-mono text-emerald-400 leading-relaxed overflow-auto max-h-[800px] custom-scrollbar">
                    {JSON.stringify(data, null, 2)}
                 </pre>
              </div>
           ) : (
             <>
               <Section title="Recording Properties" icon={Settings}>
                  <div className="divide-y divide-slate-50">
                     <DataRow label="File Name" value={data.recording_properties.file_name} />
                     <DataRow label="Duration" value={data.recording_properties.duration} />
                     <DataRow label="Quality" value={data.recording_properties.audio_quality} badge={{ text: data.recording_properties.audio_quality, className: "bg-emerald-50 text-emerald-700 border-emerald-100" }} />
                     <DataRow label="Source" value={data.recording_properties.source} />
                     <DataRow label="Language" value={data.recording_properties.language} />
                     <DataRow label="Noise Level" value={data.recording_properties.noise_level} />
                     <DataRow label="Clarity" value={data.recording_properties.clarity} />
                  </div>
               </Section>

               <Section title="Participants & Tone" icon={Users}>
                  <div className="space-y-4">
                     <div className="flex items-center justify-between border-b pb-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase">Speaker Count</span>
                        <span className="text-xl font-black text-slate-900">{data.participants.speaker_count}</span>
                     </div>
                     {data.participants.speakers.map(s => (
                        <div key={s.speaker_id} className="p-3 border rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors">
                           <div className="flex items-center justify-between mb-3">
                              <span className="px-2 py-0.5 bg-slate-900 text-white text-[9px] font-black uppercase rounded tracking-widest">{s.display_name}</span>
                              <span className="text-[9px] font-bold text-slate-500">{s.probable_role}</span>
                           </div>
                           <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                              <DataRow label="Time" value={s.total_speaking_time} />
                              <DataRow label="Tone" value={s.tone_summary} />
                              <DataRow label="Pace" value={s.pace} />
                              <DataRow label="Stress" value={s.stress_level} badge={s.stress_level === "High" ? { text: "High Stress", className: "bg-rose-50 text-rose-600 border-rose-100" } : null} />
                           </div>
                        </div>
                     ))}
                  </div>
               </Section>

               <Section title="Key Statements" icon={MessageSquare}>
                  <div className="space-y-3">
                     {data.key_statements.map((ks, i) => (
                        <div key={i} className="bg-white border-2 border-slate-50 rounded-xl p-4 shadow-sm hover:border-primary/20 transition-all cursor-pointer relative overflow-hidden group">
                           <div className={`absolute top-0 right-0 w-12 h-12 -mr-6 -mt-6 rounded-full group-hover:scale-110 transition-transform ${ks.severity === "high" ? "bg-rose-50" : "bg-primary/5"}`} />
                           <div className="flex items-center gap-2 mb-2 relative z-10">
                              <span className="px-1.5 py-0.5 bg-slate-100 text-[8px] font-black uppercase text-slate-500 rounded border">{ks.type}</span>
                              <span className="text-[9px] font-black text-primary">{ks.timestamp}</span>
                              {ks.severity === "high" && <AlertTriangle className="h-3 w-3 text-rose-500" />}
                           </div>
                           <p className="text-xs font-black text-slate-700 italic leading-snug mb-2 relative z-10">"{ks.statement}"</p>
                           <div className="flex items-center gap-2 relative z-10 pt-2 border-t border-slate-50">
                              <div className="h-4 w-4 bg-slate-100 rounded-full flex items-center justify-center text-[7px] font-black">{ks.speaker_id.slice(-2)}</div>
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{ks.evidence_note}</span>
                           </div>
                        </div>
                     ))}
                  </div>
               </Section>

               <Section title="Evidence Timeline" icon={Clock}>
                  <div className="relative pl-6 space-y-6 before:absolute before:top-0 before:bottom-0 before:left-2 before:w-[1.5px] before:bg-slate-100">
                     {data.timeline_events.map((te, i) => (
                        <div key={i} className="relative">
                           <div className="absolute -left-[22.5px] top-1 px-1 bg-white">
                              <div className={`h-3 w-3 rounded-full border-2 transition-transform hover:scale-125 ${te.importance === "critical" ? "bg-rose-500 border-rose-200" : "bg-primary border-primary/20"}`} />
                           </div>
                           <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                 <span className="text-[10px] font-black text-primary tabular-nums">{te.timestamp}</span>
                                 <span className="text-xs font-black text-slate-900">{te.event_title}</span>
                              </div>
                              <p className="text-[11px] font-bold text-slate-500 leading-tight">{te.event_detail}</p>
                           </div>
                        </div>
                     ))}
                  </div>
               </Section>

               <Section title="Risk & Safety Signals" icon={AlertTriangle}>
                  <div className="space-y-3">
                     {data.risk_safety_signals.map((rss, i) => (
                        <div key={i} className="p-3 border rounded-xl bg-orange-50/20 border-orange-100 flex gap-3">
                           <div className="h-8 w-8 bg-orange-100 rounded-lg flex items-center justify-center shrink-0">
                              <AlertCircle className="h-4 w-4 text-orange-600" />
                           </div>
                           <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                 <span className="text-[10px] font-black text-orange-700 uppercase tracking-tighter">{rss.signal_type}</span>
                                 <div className="h-1 w-1 bg-orange-200 rounded-full" />
                                 <span className="text-[9px] font-black text-orange-500">{rss.timestamp}</span>
                              </div>
                              <p className="text-[11px] font-bold text-slate-700 leading-snug">{rss.description}</p>
                           </div>
                        </div>
                     ))}
                  </div>
               </Section>

               <Section title="Investigation Summary" icon={Brain}>
                  <div className="space-y-4">
                     <p className="text-xs font-bold text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border italic">
                        {data.summary.brief_summary}
                     </p>
                     <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 opacity-60">Main Findings</span>
                        <ul className="space-y-2">
                           {data.summary.main_findings.map((f, i) => (
                              <li key={i} className="text-[11px] font-bold text-slate-700 flex gap-3">
                                 <Check className="h-3 w-3 text-emerald-500 mt-0.5 shrink-0" /> {f}
                              </li>
                           ))}
                        </ul>
                     </div>
                     <div className="pt-4 border-t">
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest block mb-2">Review Focus</span>
                        <div className="bg-primary/5 rounded-xl p-3 border border-primary/10">
                           {data.summary.recommended_human_review_focus.map((f, i) => (
                              <p key={i} className="text-[11px] font-black text-primary leading-tight">{f}</p>
                           ))}
                        </div>
                     </div>
                  </div>
               </Section>
             </>
           )}
        </div>
     );
  }

  if (file.type === "Video") {
     return (
        <div className="space-y-6 pb-20">
           <ExtractionSection title="Detected Events" icon={VideoIcon}>
              <ExtractionItem fact="Metal-on-metal friction sparks detected at section 14" type="Visual Anomaly" source="CCTV [14:35:12]" conf="High" />
              <ExtractionItem fact="Conveyor belt deflection exceeding 150mm" type="Measurement" source="Computer Vision" conf="High" />
           </ExtractionSection>
           <ExtractionSection title="Hazards & Alerts" icon={AlertCircle}>
              <ExtractionItem fact="Operator seen approaching moving parts without barriers" type="Safety Violation" source="Scene AI" conf="Medium" />
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
  const [agents, setAgents] = useState<AgentState[]>(initialAgentsState);
  const [execMode, setExecMode] = useState<"idle" | "full" | "manual">("idle");
  const [globalStatus, setGlobalStatus] = useState<"idle" | "running" | "blocked" | "completed" | "stopped" | "failed">("idle");
  const [chainQueue, setChainQueue] = useState<string[]>([]);
  const [activeTask, setActiveTask] = useState<string | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [canvasZoom, setCanvasZoom] = useState(85);
  const [isExporting, setIsExporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  
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
             type: 'chronology',
             title: 'Fact & Chronology',
             subtitle: 'Overview Incident',
             caseCode: 'CS-2026-0147',
             content: {
                summary: agent.results.ringkasan?.deskripsi || "No summary available.",
                metadata: [
                   { label: 'Incident Date', value: agent.results.ringkasan?.tanggal || "—" },
                   { label: 'Incident Time', value: agent.results.ringkasan?.jam || "—" },
                   { label: 'Location', value: agent.results.ringkasan?.lokasi || "—" },
                   { label: 'Incident Type', value: agent.results.ringkasan?.jenis || "—" },
                   { label: 'Department', value: agent.results.ringkasan?.departemen || "—" },
                   { label: 'Evidence Source', value: agent.results.ringkasan?.sumber_bukti || "—" },
                   { label: 'Severity', value: agent.results.ringkasan?.severity || "—" }
                ],
                timeline: agent.results.timeline || { praKontak: [], kontak: [], pascaKontak: [] }
             }
          }
       ];
    }
    
    return [{
       id: 'slide-1',
       type: 'raw',
       title: 'Extraction Result',
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
          microStatus: 'Initializing engine context...', 
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
    } else if (globalStatus === 'running' && !activeTask && chainQueue.length === 0) {
      setGlobalStatus('completed');
    }
  }, [chainQueue, activeTask, globalStatus, agents, execMode]);

  const startFullChain = () => {
    setExecMode("full");
    setGlobalStatus("running");
    setAgents(prev => prev.map(a => ({ 
        ...a, 
        status: 'queued', 
        dependencyState: a.dependencies.length === 0 ? 'Ready' : `Wait: ${a.dependencies[0]}`
    })));
    setChainQueue(["fact", "actor", "peepo", "ipls", "prev"]);
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

  const stats = {
    total: agents.length,
    completed: agents.filter(a => a.status === 'completed').length
  };

  return (
    <div className="flex h-full bg-[#f0f2f4] overflow-hidden animate-in fade-in duration-500">
         {/* PANEL 1: LEFT - ORCHESTRATION NODES (320px) - Aligned with Extraction Review */}
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
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] uppercase tracking-wider h-10 shadow-sm border-none group"
               >
                  <Play className="h-3 w-3 mr-2 group-hover:translate-x-0.5 transition-transform" /> Execute Full Chain
               </Button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar relative">
               {/* Vertical Connecting Line */}
               <div className="absolute left-[39px] top-6 bottom-6 w-px bg-slate-200 z-0" />
               
               <div className="p-4 space-y-4 relative z-10">
                  {agents.map((agent) => (
                     <div 
                        key={agent.id}
                        onClick={() => setSelectedAgentId(agent.id)}
                        className={`
                           group relative flex flex-col p-4 rounded-xl border bg-white transition-all cursor-pointer
                           ${selectedAgentId === agent.id ? "border-slate-900 shadow-md ring-1 ring-slate-900/5 translate-x-1" : "border-slate-200 hover:border-slate-300"}
                        `}
                     >
                        <div className="flex items-start justify-between mb-3">
                           <div className={`h-11 w-11 rounded-xl border flex items-center justify-center transition-all ${selectedAgentId === agent.id ? "bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/10 scale-105" : "bg-white text-slate-400 border-slate-100"}`}>
                              <agent.icon className="h-5 w-5" />
                           </div>
                           <div className={`
                              px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border
                              ${agent.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                                agent.status === 'running' ? 'bg-blue-50 text-blue-700 border-blue-100 animate-pulse' : 
                                'bg-slate-50 text-slate-400 border-slate-100 uppercase'}
                           `}>
                              {agent.status}
                           </div>
                        </div>
                        <h4 className={`text-[10px] font-black uppercase tracking-[0.15em] mb-1.5 ${selectedAgentId === agent.id ? "text-slate-900" : "text-slate-500"}`}>{agent.name}</h4>
                        <p className="text-[10px] font-bold text-slate-400 leading-snug opacity-80">{agent.purpose}</p>
                        
                        {selectedAgentId === agent.id && (
                           <div className="absolute top-0 right-0 w-1 h-full bg-slate-900" />
                        )}
                        {agent.status === 'running' && (
                           <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500/20 overflow-hidden rounded-b-xl">
                              <div className="h-full bg-blue-500 animate-[loading_2s_infinite] w-1/3" />
                           </div>
                        )}
                     </div>
                  ))}
               </div>
            </div>
         </div>

         {/* PANEL 2: CENTER - PRESENTATIONS / SLIDES - Aligned proportion with Source Viewer */}
         <div className="flex-1 flex flex-col min-w-0 bg-[#f0f2f4]">
            {/* Standard Header Rhythm */}
            <div className="h-12 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm z-30">
               <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                     <Grid className="h-4 w-4 text-slate-400" />
                     <span className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">Analysis Matrix</span>
                  </div>
                  <div className="h-4 w-px bg-slate-200" />
                  <div className="flex items-center gap-6">
                     {['Fact', 'Actor', 'PEEPO', 'IPLS', 'Prev'].map((node, i) => {
                        const ag = agents.find(a => a.name.includes(node));
                        return (
                           <div key={node} className="flex items-center gap-2">
                              <div className={`
                                 h-4 w-4 rounded-full border flex items-center justify-center text-[8px] font-black
                                 ${ag?.status === 'completed' ? 'bg-emerald-500 border-emerald-500 text-white' : 
                                   ag?.status === 'running' ? 'border-primary text-primary animate-pulse' : 
                                   'bg-white border-slate-200 text-slate-300'}
                              `}>{i + 1}</div>
                              <span className={`text-[9px] font-black uppercase tracking-wider ${ag?.status === 'completed' ? 'text-slate-800' : 'text-slate-300'}`}>{node}</span>
                           </div>
                        );
                     })}
                  </div>
               </div>

               <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="h-8 text-[10px] font-bold gap-2 bg-white">
                     <ZoomIn className="h-3.5 w-3.5" /> Full Screen
                  </Button>
               </div>
            </div>

            <div 
               ref={containerRef}
               onWheel={(e) => {
                  if (e.ctrlKey) {
                     setCanvasZoom(z => Math.max(20, Math.min(200, z - e.deltaY / 10)));
                     e.preventDefault();
                  }
               }}
               onDoubleClick={fitToWorkspace}
               className="group/workspace flex-1 flex flex-col items-center justify-center p-4 overflow-hidden relative cursor-zoom-in"
               style={{
                  backgroundImage: 'radial-gradient(circle, #E2E8F0 1px, transparent 1px)',
                  backgroundSize: '24px 24px'
               }}
            >
                {!selectedAgentId ? (
                    <div className="py-24 flex flex-col items-center text-center max-w-sm">
                        <div className="h-24 w-24 rounded-[3.rem] bg-white border border-slate-200 shadow-2xl flex items-center justify-center mb-10 rotate-12 transition-transform hover:rotate-0">
                            <Brain className="h-10 w-10 text-slate-200" />
                        </div>
                        <h3 className="text-xl font-black text-slate-800 tracking-tighter mb-3 uppercase opacity-50">Orchestration Standby</h3>
                    </div>
                ) : (
                    <div className="relative flex flex-col items-center transition-all duration-300">
                        {/* Slide Shadow Base */}
                        <div 
                           className="bg-white shadow-[0_30px_90px_-20px_rgba(0,0,0,0.3)] flex flex-col relative transition-all duration-300 origin-center overflow-hidden rounded-[2px] border-b-2 border-slate-300" 
                           style={{ 
                               width: '1024px', 
                               height: '576px', 
                               transform: `scale(${canvasZoom/100})`
                           }}
                        >
                           <div className="flex-1 p-[60px] flex flex-col relative overflow-hidden h-full">
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
                                    {slides[activeSlide]?.type === 'chronology' && (
                                       <div className="flex flex-col h-full text-slate-900">
                                          {/* 1. Top Header Section */}
                                          <div className="flex justify-between items-start mb-6 border-b-2 border-slate-900 pb-4">
                                             <div>
                                                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-1">{slides[activeSlide]?.subtitle}</div>
                                                <h2 contentEditable suppressContentEditableWarning className="text-[32px] font-black uppercase tracking-tighter outline-none leading-none">{slides[activeSlide]?.title}</h2>
                                             </div>
                                             {slides[activeSlide]?.caseCode && (
                                                <div className="text-right">
                                                   <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">Investigation Code</div>
                                                   <div className="text-sm font-mono font-bold text-slate-800 leading-none">#{slides[activeSlide]?.caseCode}</div>
                                                </div>
                                             )}
                                          </div>

                                          {/* 2. Incident Summary Section */}
                                          <div className="mb-6 bg-slate-50 border-l-4 border-slate-900 p-4 rounded-r-lg shadow-sm">
                                             <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Executive Summary / Ringkasan Kejadian</div>
                                             <div contentEditable suppressContentEditableWarning className="text-[14px] text-slate-700 font-medium leading-relaxed outline-none">
                                                {slides[activeSlide]?.content?.summary}
                                             </div>
                                          </div>

                                          {/* 3. Incident Metadata Section */}
                                          <div className="grid grid-cols-4 gap-x-8 gap-y-4 mb-8 bg-white border border-slate-100 p-4 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                                             {(slides[activeSlide]?.content?.metadata || []).map((m: any) => (
                                                <div key={m.label}>
                                                   <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{m.label}</div>
                                                   <div contentEditable suppressContentEditableWarning className="text-[11px] font-bold text-slate-800 outline-none truncate">{m.value}</div>
                                                </div>
                                             ))}
                                          </div>

                                          {/* 4. Main Chronology Section */}
                                          <div className="flex-1 grid grid-cols-3 gap-4 min-h-0 overflow-hidden">
                                             {/* Pra Kontak */}
                                             <div className="flex flex-col border border-slate-100 rounded-xl overflow-hidden bg-white shadow-sm flex-1 min-h-0">
                                                <div className="bg-emerald-600 px-4 py-2 flex items-center justify-between shadow-md">
                                                   <span className="text-[10px] font-black text-white uppercase tracking-widest">A. Pra Kontak</span>
                                                   <span className="h-1.5 w-6 bg-white/30 rounded-full" />
                                                </div>
                                                <div className="flex-1 overflow-y-auto p-3 custom-scrollbar space-y-2.5">
                                                   {(slides[activeSlide]?.content?.timeline?.praKontak || []).map((item: any, idx: number) => (
                                                      <div key={idx} className="flex gap-2 group">
                                                         <div contentEditable suppressContentEditableWarning className="text-[9px] font-black text-emerald-700 bg-emerald-50 h-fit px-1.5 py-0.5 rounded outline-none shrink-0">[{item.time}]</div>
                                                         <div className="flex-1 min-w-0">
                                                            <div contentEditable suppressContentEditableWarning className="text-[10px] font-black text-slate-800 leading-none mb-1 outline-none">[{item.name}]</div>
                                                            <div contentEditable suppressContentEditableWarning className="text-[10px] text-slate-500 font-medium leading-normal outline-none">{item.event}</div>
                                                         </div>
                                                      </div>
                                                   ))}
                                                </div>
                                             </div>

                                             {/* Kontak */}
                                             <div className="flex flex-col border border-slate-100 rounded-xl overflow-hidden bg-white shadow-sm flex-1 min-h-0">
                                                <div className="bg-rose-600 px-4 py-2 flex items-center justify-between shadow-md">
                                                   <span className="text-[10px] font-black text-white uppercase tracking-widest">B. Kontak</span>
                                                   <span className="h-1.5 w-6 bg-white/30 rounded-full" />
                                                </div>
                                                <div className="flex-1 overflow-y-auto p-3 custom-scrollbar space-y-2.5">
                                                   {(slides[activeSlide]?.content?.timeline?.kontak || []).map((item: any, idx: number) => (
                                                      <div key={idx} className="flex gap-2 group">
                                                         <div contentEditable suppressContentEditableWarning className="text-[9px] font-black text-rose-700 bg-rose-50 h-fit px-1.5 py-0.5 rounded outline-none shrink-0">[{item.time}]</div>
                                                         <div className="flex-1 min-w-0">
                                                            <div contentEditable suppressContentEditableWarning className="text-[10px] font-black text-slate-800 leading-none mb-1 outline-none">[{item.name}]</div>
                                                            <div contentEditable suppressContentEditableWarning className="text-[10px] text-slate-500 font-medium leading-normal outline-none">{item.event}</div>
                                                         </div>
                                                      </div>
                                                   ))}
                                                </div>
                                             </div>

                                             {/* Pasca Kontak */}
                                             <div className="flex flex-col border border-slate-100 rounded-xl overflow-hidden bg-white shadow-sm flex-1 min-h-0">
                                                <div className="bg-amber-500 px-4 py-2 flex items-center justify-between shadow-md">
                                                   <span className="text-[10px] font-black text-white uppercase tracking-widest">C. Pasca Kontak</span>
                                                   <span className="h-1.5 w-6 bg-white/30 rounded-full" />
                                                </div>
                                                <div className="flex-1 overflow-y-auto p-3 custom-scrollbar space-y-2.5">
                                                   {(slides[activeSlide]?.content?.timeline?.pascaKontak || []).map((item: any, idx: number) => (
                                                      <div key={idx} className="flex gap-2 group">
                                                         <div contentEditable suppressContentEditableWarning className="text-[9px] font-black text-amber-700 bg-amber-50 h-fit px-1.5 py-0.5 rounded outline-none shrink-0">[{item.time}]</div>
                                                         <div className="flex-1 min-w-0">
                                                            <div contentEditable suppressContentEditableWarning className="text-[10px] font-black text-slate-800 leading-none mb-1 outline-none">[{item.name}]</div>
                                                            <div contentEditable suppressContentEditableWarning className="text-[10px] text-slate-500 font-medium leading-normal outline-none">{item.event}</div>
                                                         </div>
                                                      </div>
                                                   ))}
                                                </div>
                                             </div>
                                          </div>
                                       </div>
                                    )}
                                    
                                    {slides[activeSlide]?.type === 'raw' && (
                                       <div className="flex flex-col h-full">
                                          <div className="flex items-center gap-3 mb-4">
                                             <span className="h-px w-8 bg-slate-400" />
                                             <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Raw Synthesis Data</span>
                                          </div>
                                          <h2 className="text-[32px] font-black text-slate-800 mb-8 tracking-tighter uppercase">{slides[activeSlide]?.title}</h2>
                                          <div className="flex-1 bg-[#1a1c23] rounded-2xl p-6 overflow-hidden border border-slate-700 shadow-2xl relative">
                                             <div className="absolute top-4 right-6 text-[9px] font-mono text-emerald-500/50 uppercase tracking-widest">JSON Output Mode</div>
                                             <pre className="text-[12px] font-mono text-emerald-400/90 leading-tight h-full overflow-auto custom-scrollbar">
                                                {JSON.stringify(slides[activeSlide]?.content, null, 2)}
                                             </pre>
                                          </div>
                                       </div>
                                    )}
                                 </div>
                              )}

                              <div className="absolute bottom-10 left-[60px] right-[60px] flex justify-between items-center opacity-40 border-t border-slate-100 pt-8">
                                 <span className="text-[11px] font-black text-slate-800 uppercase tracking-[0.3em] font-mono whitespace-nowrap">BERAU CORE INTELLIGENCE PIPELINE</span>
                                 <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] font-mono whitespace-nowrap">MATRIX v4.8.2-SYNTH</span>
                              </div>
                           </div>
                        </div>
                     </div>
                )}
            </div>

            <div className="h-12 bg-white border-t border-slate-200 px-6 flex items-center justify-between shrink-0 z-40 shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
                <div className="flex items-center gap-4">
                   <div className="flex items-center gap-1">
                      <Button 
                         onClick={() => setActiveSlide(prev => Math.max(0, prev - 1))}
                         variant="ghost" 
                         size="sm" 
                         className="h-8 w-8 p-0 text-slate-400 hover:text-slate-900 border"
                      ><ChevronLeft className="h-4 w-4" /></Button>
                      <div className="bg-slate-50 border px-3 h-8 flex items-center rounded-md">
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest leading-none">Slide {activeSlide + 1} of {slides.length || 1}</span>
                      </div>
                      <Button 
                         onClick={() => setActiveSlide(prev => Math.min((slides.length || 1) - 1, prev + 1))}
                         variant="ghost" 
                         size="sm" 
                         className="h-8 w-8 p-0 text-slate-400 hover:text-slate-900 border"
                      ><ChevronRight className="h-4 w-4" /></Button>
                   </div>
                   <div className="w-px h-5 bg-slate-200 mx-1" />
                   <div className="flex items-center gap-1 bg-slate-100/50 border border-slate-200 rounded-lg p-1">
                      <Button onClick={() => setCanvasZoom(Math.max(20, canvasZoom - 10))} variant="ghost" className="h-7 w-7 p-0 text-slate-500 hover:bg-white"><ZoomOut className="h-3.5 w-3.5" /></Button>
                      <Button onClick={fitToWorkspace} variant="ghost" className="h-7 px-2 text-[9px] font-black text-slate-600 bg-white border border-slate-200 shadow-sm rounded">AUTO FIT</Button>
                      <div className="w-12 text-center font-bold text-[10px] text-slate-700 leading-none">{canvasZoom}%</div>
                      <Button onClick={() => setCanvasZoom(Math.min(200, canvasZoom + 10))} variant="ghost" className="h-7 w-7 p-0 text-slate-500 hover:bg-white"><ZoomIn className="h-3.5 w-3.5" /></Button>
                   </div>
                </div>

                <div className="flex items-center gap-2">
                   <Button variant="ghost" className="h-8 w-8 p-0 text-slate-400 border hover:bg-slate-50">
                      <Maximize2 className="h-4 w-4" />
                   </Button>
                   <div className="w-px h-6 bg-slate-200 mx-1" />
                   <Button onClick={handleSaveArtifact} disabled={isSaving} className="h-9 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-widest px-6 rounded-lg shadow-sm">
                      {isSaving ? "Syncing..." : "Sync to Case"}
                   </Button>
                </div>
             </div>
         </div>

         {/* PANEL 3: RIGHT - DATA PROPERTIES (460px) - Aligned Proportion with Extraction Console */}
         <div className="w-[460px] border-l border-slate-200 bg-white flex flex-col shrink-0 z-20 shadow-[-2px_0_10px_rgba(0,0,0,0.03)] overflow-hidden">
             <div className="h-12 border-b border-slate-200 flex items-center justify-between px-5 bg-slate-50/50 shrink-0">
                <div className="flex items-center gap-2">
                   <Brain className="h-4 w-4 text-primary" />
                   <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Synthesis Console</span>
                </div>
                <div className="flex items-center gap-2">
                   <Button variant="ghost" size="sm" className="h-7 px-2 text-[9px] font-bold text-slate-400 hover:text-slate-900 border">
                      <History className="h-3.5 w-3.5 mr-1" /> Log
                   </Button>
                   <Button variant="ghost" size="sm" className="h-7 px-2 text-[9px] font-bold text-primary hover:bg-primary/5 border border-primary/20">
                      Rerun Node
                   </Button>
                </div>
             </div>

             <div className="flex-1 overflow-y-auto custom-scrollbar">
                {selectedAgentId ? (
                   <div className="p-6 space-y-8">
                      {/* Node Context Block */}
                      <div className="bg-slate-50 border rounded-xl p-5 space-y-4">
                         <div className="flex items-center gap-2 border-b border-slate-200 pb-2 mb-2">
                            <Settings className="h-3.5 w-3.5 text-slate-400" />
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Node Properties</span>
                         </div>
                         <div className="grid grid-cols-2 gap-6">
                            <div className="flex flex-col">
                               <span className="text-[9px] font-black text-slate-400 uppercase mb-1">State Relay</span>
                               <div className="flex items-center gap-2">
                                  <div className={`h-2 w-2 rounded-full ${selectedAgent?.status === 'running' ? 'bg-blue-500 animate-pulse' : 'bg-emerald-500'}`} />
                                  <span className="text-[11px] font-black text-slate-800 uppercase tracking-tight">{selectedAgent?.status || "STANDBY"}</span>
                               </div>
                            </div>
                            <div className="flex flex-col">
                               <span className="text-[9px] font-black text-slate-400 uppercase mb-1">Last Run</span>
                               <span className="text-[11px] font-black text-slate-800 uppercase tracking-tight">{selectedAgent?.lastRunTimestamp || "—"}</span>
                            </div>
                         </div>
                      </div>

                      {/* Artifact Directory */}
                      <div className="space-y-4">
                         <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                            <FileText className="h-3.5 w-3.5 text-slate-400" />
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Slide Artifacts</span>
                         </div>
                         <div className="grid grid-cols-2 gap-3">
                            {(slides || []).map((s, i) => (
                               <div 
                                  key={s.id} 
                                  onClick={() => setActiveSlide(i)}
                                  className={`group p-4 rounded-xl border-2 transition-all cursor-pointer relative overflow-hidden ${activeSlide === i ? 'bg-white border-blue-500 shadow-md ring-1 ring-blue-500/10' : 'bg-white border-slate-100 hover:border-slate-200'}`}
                               >
                                  <div className="flex items-start justify-between mb-3">
                                     <div className={`h-8 w-8 rounded-lg border flex items-center justify-center transition-colors ${activeSlide === i ? "bg-blue-600 text-white border-blue-600" : "bg-slate-50 text-slate-400"}`}>
                                        <FileCode className="h-4 w-4" />
                                     </div>
                                     <span className="text-[8px] font-black text-slate-400 uppercase">Slide {i + 1}</span>
                                  </div>
                                  <h5 className={`text-[10px] font-black uppercase tracking-tight truncate ${activeSlide === i ? "text-slate-900" : "text-slate-700"}`}>{s.title}</h5>
                                  {activeSlide === i && <div className="absolute top-0 right-0 w-1 h-full bg-blue-600" />}
                               </div>
                            ))}
                         </div>
                      </div>

                      {/* Industrial Context / Citation */}
                      <div className="bg-amber-50/30 border border-amber-100 rounded-xl p-5 space-y-3">
                         <div className="flex items-center gap-2">
                            <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-widest">Reasoning Gap detected</span>
                         </div>
                         <p className="text-[11px] font-bold text-amber-800 leading-relaxed opacity-80"> The Synthesis Matrix identified a high-confidence correlation between Manual Override and Bearing Temperature at Zone B-14. </p>
                      </div>
                   </div>
                ) : (
                   <div className="h-full flex flex-col items-center justify-center text-center p-12 opacity-30 filter grayscale">
                      <div className="h-20 w-20 rounded-[2.5rem] bg-slate-100 border-4 border-white shadow-xl flex items-center justify-center mb-6">
                         <Brain className="h-10 w-10 text-slate-300" />
                      </div>
                      <h4 className="text-sm font-black uppercase tracking-[0.2em] mb-2">Console Idle</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">Select an intelligence node<br />to active the synthesis console</p>
                   </div>
                )}
             </div>
             
             <div className="p-5 border-t border-slate-200 bg-white shrink-0 shadow-[0_-4px_12px_rgba(0,0,0,0.02)]">
                <Button onClick={handleExport} disabled={isExporting} className="w-full h-11 bg-slate-900 hover:bg-slate-800 border-none text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-xl shadow-lg transition-transform active:scale-[0.98]">
                   {isExporting ? "Exporting Deck..." : "Publish Presentation"}
                </Button>
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
    <div className="flex flex-col h-full bg-slate-50/10 h-screen overflow-hidden">
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
  const [activeTab, setActiveTab] = useState("Evidence Review");
  const [files, setFiles] = useState(evidenceFiles);
  const [batches, setBatches] = useState(evidenceBatches);

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
          {activeTab === "Evidence Review" && <ExtractionTab files={files} setFiles={setFiles} />}
          {activeTab === "Analysis" && <AnalysisTab />}
          {activeTab === "Reports" && <ReportsTab />}
          {activeTab === "Review" && <ReviewTab />}
          {activeTab === "Audit Trail" && <AuditTrailTab />}
        </div>
      </div>
    </AppLayout>
  );
}
