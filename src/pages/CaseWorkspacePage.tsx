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
  Loader2,
  Database,
  Ruler,
  MessageCircle,
  Download
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
import { UploadModal, CompletedGroup } from "@/components/UploadModal";

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
}

function AIAnalysisPanel({ file }: { file: any }) {
  const [viewMode, setViewMode] = useState<"Structured" | "JSON">("Structured");
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  useEffect(() => {
    if (file?.type === "Audio") {
      setExpandedSections(["Audio Meta", "Intelligence Seeds"]);
    } else {
      setExpandedSections(["Image Properties", "Initial Interpretation"]);
    }
  }, [file?.id, file?.type]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  const categories = file.type === "Audio" ? [
    { name: "Audio Meta", id: "audio_meta", icon: History, data: audioExtractionData.recording_meta },
    { name: "Diarization & Transcript", id: "audio_diarization", icon: MessageSquare, data: audioExtractionData.full_diarization },
    { name: "Speaker Profiles", id: "audio_speakers", icon: Users, data: audioExtractionData.speaker_profiles },
    { name: "Intelligence Seeds", id: "audio_intelligence", icon: Brain, data: audioExtractionData },
  ] : [
    { name: "Image Properties", id: "image_properties", icon: ImageIcon, data: imageExtractionData.evidence_meta },
    { name: "Composition & Objects", id: "composition", icon: LayoutGrid, data: imageExtractionData.scene_context },
    { name: "People & PPE", id: "people_ppe", icon: Users, data: imageExtractionData.people },
    { name: "Environment", id: "environment", icon: Wind, data: imageExtractionData.environment },
    { name: "Initial Interpretation", id: "initial_interpretation", icon: Brain, data: imageExtractionData },
  ];

  const DataField = ({ label, value, fullWidth = false }: { label: string, value: any, fullWidth?: boolean }) => (
    <div className={`${fullWidth ? 'col-span-2' : ''} mb-3 last:mb-0`}>
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight block mb-0.5">{label}</span>
      <div className="text-xs font-bold text-slate-800 leading-snug">{value || "—"}</div>
    </div>
  );

  const renderStructuredContent = (id: string, data: any) => {
    switch (id) {
      case "audio_meta":
        return (
          <div className="grid grid-cols-2 gap-4">
             <DataField label="Duration" value={data.duration} />
             <DataField label="Quality" value={data.audio_quality} />
             <DataField label="Noise Level" value={data.noise_level} />
             <DataField label="Lang" value={data.language} />
          </div>
        );
      case "audio_diarization":
        return (
          <div className="space-y-4 max-h-[400px] overflow-auto pr-2 custom-scrollbar">
            {data.map((seg: any) => (
              <div key={seg.segment_id} className="flex flex-col gap-1 relative pl-4 border-l-2 border-slate-100 hover:border-primary/30 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{seg.speaker_label} · {seg.start_time}</span>
                  <ConfidenceChip level={seg.confidence.toLowerCase()} />
                </div>
                <p className="text-[11px] font-black text-slate-800 leading-relaxed italic">"{seg.text}"</p>
              </div>
            ))}
          </div>
        );
      case "audio_speakers":
        return (
          <div className="grid grid-cols-1 gap-3">
             {data.map((s: any) => (
                <div key={s.speaker_id} className="p-3 border rounded-xl bg-slate-50/50 hover:bg-white transition-all">
                   <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-black text-slate-900 uppercase">{s.probable_role} ({s.speaker_id})</span>
                      <span className={`px-2 py-0.5 text-[8px] font-black uppercase rounded ${s.stress_level.includes('High') ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                         Stress: {s.stress_level.split(' ')[0]}
                      </span>
                   </div>
                   <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-500">
                      <div>Assertiveness: <span className="text-slate-800">{s.assertiveness}</span></div>
                      <div>Style: <span className="text-slate-800">{s.speaking_style}</span></div>
                   </div>
                </div>
             ))}
          </div>
        );
      case "audio_intelligence":
        return (
          <div className="space-y-4">
             <div className="bg-rose-50 border border-rose-100 p-3 rounded-xl">
                <span className="text-[10px] font-black text-rose-700 uppercase block mb-2">Human Performance Signals</span>
                <div className="space-y-1">
                   {data.human_performance_signals.delayed_reporting.map((sig: string, i: number) => (
                     <div key={i} className="flex items-center gap-2 text-[10px] font-bold text-rose-800">
                       <AlertCircle className="h-3 w-3" /> {sig}
                     </div>
                   ))}
                   {data.human_performance_signals.supervision_signal.map((sig: string, i: number) => (
                     <div key={i} className="flex items-center gap-2 text-[10px] font-bold text-rose-800">
                       <Users className="h-3 w-3 text-rose-400" /> {sig}
                     </div>
                   ))}
                </div>
             </div>
             
             <div className="p-3 border rounded-xl bg-slate-900 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/20 blur-3xl rounded-full" />
                <span className="text-[10px] font-black text-primary uppercase tracking-widest block mb-1 relative z-10">Reasoning Seeds (PEEPO)</span>
                {Object.entries(data.peepo_seeds).map(([key, val]: any) => (
                  <div key={key} className="flex gap-2 mb-1 last:mb-0 relative z-10">
                    <span className="text-[9px] font-black text-slate-500 uppercase min-w-[60px]">{key}</span>
                    <p className="text-[10px] font-bold text-slate-400 leading-tight">"{val[0]}"</p>
                  </div>
                ))}
             </div>
          </div>
        );
      case "image_properties":
        return (
          <div className="grid grid-cols-2 gap-x-4">
             <DataField label="Source Device" value={data.source_device} />
             <DataField label="Location" value={data.location_hint} />
             <DataField label="Visibility" value={data.visibility_quality} />
             <DataField label="Weather" value={data.weather_condition} />
          </div>
        );
      case "composition":
        return (
          <div className="space-y-4">
            <DataField label="Area Type" value={data.area_type} />
            <DataField label="Work Zone" value={data.work_zone} />
            <DataField label="Operation" value={data.operation_type} />
            <div className="p-3 border rounded-xl bg-slate-50 shadow-inner">
               <span className="text-[10px] font-bold text-primary uppercase tracking-widest block mb-2 border-b border-primary/5 pb-1">Scene Summary</span>
               <p className="text-[11px] font-bold text-slate-700 leading-relaxed italic">"{data.summary_scene}"</p>
            </div>
          </div>
        );
      case "people_ppe":
        return (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <DataField label="Detected" value={`${data.person_count} Identification`} />
              <div className="bg-slate-50 p-2 rounded border border-slate-100">
                <span className="text-[8px] font-black text-slate-400 uppercase block mb-1">Status</span>
                <span className="text-[10px] font-black text-emerald-600 uppercase">PPE Compliant</span>
              </div>
            </div>
            {data.detected_people.map((p: any, i: number) => (
              <div key={i} className="p-3 border rounded-xl bg-slate-50/50">
                 <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black text-slate-900 uppercase">Person {p.person_ref}</span>
                    <span className="px-1.5 py-0.5 bg-white border text-[8px] font-bold text-slate-500 rounded uppercase">{p.role_guess}</span>
                 </div>
                 <div className="grid grid-cols-2 gap-2 mb-2">
                    <DataField label="Action" value={p.activity} />
                    <DataField label="Target" value={p.interaction_target} />
                 </div>
                 <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-200/40">
                    {data.ppe_equipment.filter((ppe: any) => ppe.person_ref === p.person_ref).map((ppe: any, j: number) => (
                      <span key={j} className={`px-2 py-0.5 text-[8px] font-black uppercase rounded border ${ppe.detected ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-200 opacity-50'}`}>
                        {ppe.item}
                      </span>
                    ))}
                 </div>
              </div>
            ))}
          </div>
        );
      case "environment":
        return (
          <div className="space-y-4">
             <div className="grid grid-cols-2 gap-4">
                <DataField label="Terrain" value={data.terrain_condition} />
                <DataField label="Housekeeping" value={data.housekeeping_condition} />
             </div>
             <div className="space-y-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block opacity-60">Barriers & Signage</span>
                <div className="flex flex-wrap gap-1.5">
                   {data.barrier_guarding_present.map((b: string, i: number) => (
                     <span key={i} className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[9px] font-black uppercase rounded border border-amber-100">{b}</span>
                   ))}
                </div>
             </div>
          </div>
        );
      case "initial_interpretation":
        return (
          <div className="space-y-4">
            <div className="p-3 border rounded-xl bg-slate-900 shadow-2xl overflow-hidden relative">
               <div className="absolute top-0 right-0 w-20 h-20 bg-primary/20 blur-3xl rounded-full" />
               <span className="text-[10px] font-black text-primary uppercase tracking-widest block mb-1 relative z-10">Reasoning Seeds (PEEPO)</span>
               <div className="space-y-2 relative z-10">
                  {Object.entries(data.peepo_seeds).map(([key, val]: any) => (
                    <div key={key} className="flex gap-2">
                       <span className="text-[9px] font-black text-slate-500 uppercase min-w-[60px]">{key}</span>
                       <p className="text-[10px] font-bold text-slate-400 leading-tight">"{val[0]}"</p>
                    </div>
                  ))}
               </div>
            </div>
            
            <div className="space-y-2">
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1 opacity-60">IPLS Layer Candidates</span>
               {data.ipls_seeds.map((ipls: any, i: number) => (
                 <div key={i} className="p-3 border-l-4 border-l-primary bg-slate-50 rounded-r-lg">
                    <span className="text-[9px] font-black text-primary uppercase">{ipls.layer_candidate}</span>
                    <p className="text-[11px] font-bold text-slate-700 mt-1">{ipls.deviation_text}</p>
                 </div>
               ))}
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

// ── Audio Right Panel ────────────────────────────────────────────────────────

function AudioRightPanel({
  audioCurrentTime,
  onSeek,
}: {
  audioCurrentTime: number;
  onSeek: (seconds: number) => void;
}) {
  const [activeTab, setActiveTab] = useState<'extraction' | 'diary'>('extraction');
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
      <div className={`border rounded-lg overflow-hidden transition-all ${open ? 'ring-1 ring-primary/15 shadow-sm' : 'hover:border-slate-200'}`}>
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

  // ── Extraction tab ─────────────────────────────────────────────────────────

  const renderExtraction = () => {
    if (viewMode === 'JSON') {
      return (
        <div className="p-3">
          <div className="bg-slate-900 rounded-xl p-4 overflow-hidden border border-slate-800">
            <pre className="text-[10px] font-mono text-emerald-400 leading-relaxed overflow-auto max-h-[700px] custom-scrollbar">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        </div>
      );
    }

    const hps = data.human_performance_signals as any;
    const rpc = (data as any).risk_and_procedure_clues;

    return (
      <div className="p-3 space-y-2">

        {/* 1 — Audio Session Meta */}
        <AccSection id="audio_session_meta" title="Audio Session Meta" icon={Settings}>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            {([
              ['Session', data.recording_meta.file_name],
              ['Duration', data.recording_meta.duration],
              ['Quality', data.recording_meta.audio_quality],
              ['Type', data.recording_meta.recording_type],
              ['Noise', data.recording_meta.noise_level],
              ['Channel', data.recording_meta.channel_type],
              ['Language', data.recording_meta.language],
              ['Overlap', data.recording_meta.overlap_level],
            ] as [string, string][]).map(([label, value]) => (
              <div key={label} className="min-w-0">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-wide block">{label}</span>
                <span className="text-[10px] font-bold text-slate-800 truncate block">{value || '—'}</span>
              </div>
            ))}
          </div>
        </AccSection>

        {/* 2 — Speaker Profiles */}
        <AccSection id="speaker_profiles" title="Speaker Profiles" icon={Users} count={data.speaker_profiles.length}>
          <div className="space-y-2">
            {data.speaker_profiles.map((s: any) => (
              <div key={s.speaker_id} className="p-2.5 border rounded-lg bg-slate-50/50 hover:bg-white transition-all">
                <div className="flex items-start justify-between mb-1.5">
                  <div>
                    <span className="text-[10px] font-black text-slate-900 block">{s.speaker_label || s.speaker_id}</span>
                    <span className="text-[9px] font-bold text-slate-400">{s.probable_role}</span>
                  </div>
                  <Chip label={`Stress: ${s.stress_level.split(' ')[0]}`} variant={s.stress_level.includes('High') ? 'critical' : 'ok'} />
                </div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[9px] font-bold text-slate-400">
                  <span>Speaking: <span className="text-slate-700">{s.speaking_time}</span></span>
                  <span>Style: <span className="text-slate-700">{s.speaking_style.split(',')[0]}</span></span>
                  <span>Assert: <span className="text-slate-700">{s.assertiveness}</span></span>
                  <span>Hesit: <span className="text-slate-700">{s.hesitation}</span></span>
                  <span>Role: <span className="text-slate-700">{s.escalation_role}</span></span>
                  <span>Conf: <span className="text-slate-700">{s.confidence}</span></span>
                </div>
              </div>
            ))}
          </div>
        </AccSection>

        {/* 3 — Communication Events */}
        <AccSection id="comm_events" title="Communication Events" icon={MessageCircle} count={data.communication_events.length}>
          <div className="space-y-2">
            {data.communication_events.map((ev: any, i: number) => (
              <div key={i} className="flex gap-2 p-2 border rounded-lg bg-white hover:bg-slate-50/50 transition-all">
                <TsBtn time={ev.timestamp} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap mb-1">
                    <span className="text-[9px] font-black text-slate-800 truncate">{ev.event_type}</span>
                    <Chip label={ev.urgency} variant={ev.urgency === 'Critical' ? 'critical' : ev.urgency === 'Medium' ? 'warn' : 'default'} />
                  </div>
                  <p className="text-[9px] font-bold text-slate-600 leading-snug mb-1">{ev.content_summary}</p>
                  <div className="flex items-center gap-1 text-[8px] font-bold text-slate-400 flex-wrap">
                    <span>{ev.actor}</span><span>→</span><span>{ev.target_actor}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </AccSection>

        {/* 4 — Factual Statements */}
        <AccSection id="factual_statements" title="Factual Statements" icon={FileText} count={(data as any).factual_statements?.length || 0}>
          <div className="space-y-2">
            {((data as any).factual_statements || []).map((f: any, i: number) => (
              <div key={i} className="flex gap-2 p-2 border rounded-lg bg-white hover:bg-slate-50/50 transition-all">
                <TsBtn time={f.timestamp} />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-slate-800 leading-snug mb-1">{f.fact_text}</p>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[8px] font-bold text-slate-500">{f.speaker}</span>
                    <Chip label={f.statement_type} />
                    <Chip label={f.observed_or_claimed} variant={f.observed_or_claimed === 'Observed' ? 'ok' : 'info'} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </AccSection>

        {/* 5 — Timeline Events */}
        <AccSection id="timeline_events" title="Timeline Events" icon={Clock} count={(data as any).timeline_events?.length || 0}>
          <div className="relative">
            <div className="absolute left-[10px] top-1 bottom-1 w-px bg-slate-100" />
            <div className="space-y-3">
              {((data as any).timeline_events || []).map((ev: any, i: number) => (
                <div key={i} className="flex gap-2.5 items-start relative z-10">
                  <button
                    onClick={() => seek(ev.timestamp)}
                    className="h-[20px] w-[20px] rounded-full border-2 border-white bg-slate-100 flex items-center justify-center hover:bg-primary/15 transition-colors flex-shrink-0 mt-0.5 shadow-sm"
                    title="Seek to this time"
                  >
                    <div className="h-1.5 w-1.5 rounded-full bg-primary/60" />
                  </button>
                  <div className="flex-1 min-w-0 pb-1">
                    <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                      <span className="text-[9px] font-black text-primary tabular-nums">{ev.timestamp}</span>
                      <span className="text-[9px] font-bold text-slate-400">· {ev.actor}</span>
                    </div>
                    <p className="text-[9px] font-bold text-slate-700 leading-snug">{ev.event_summary}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </AccSection>

        {/* 6 — Human Performance Signals */}
        <AccSection id="human_perf" title="Human Performance Signals" icon={Activity}>
          <div className="space-y-1.5">
            {([
              { key: 'communication_positive_or_not', label: 'Communication',     icon: MessageSquare, tone: 'neutral' },
              { key: 'missed_confirmation',           label: 'Missed Confirmation', icon: AlertCircle,  tone: 'warn' },
              { key: 'delayed_reporting',             label: 'Delayed Reporting',   icon: Clock,         tone: 'warn' },
              { key: 'supervision_signal',            label: 'Supervision',         icon: Users,         tone: 'warn' },
              { key: 'stress_or_confusion',           label: 'Stress / Confusion',  icon: AlertTriangle, tone: 'critical' },
              { key: 'speak_up_signal',               label: 'Speak-Up',            icon: MessageSquare, tone: 'ok' },
              { key: 'coordination_gap_signal',       label: 'Coordination Gap',    icon: AlertCircle,   tone: 'warn' },
            ] as any[]).map(({ key, label, icon: Icon, tone }) => {
              const raw = hps[key];
              const arr: string[] = Array.isArray(raw) ? raw : (raw ? [raw] : []);
              if (arr.length === 0) return null;
              const dot = tone === 'critical' ? 'bg-rose-400' : tone === 'warn' ? 'bg-amber-400' : tone === 'ok' ? 'bg-emerald-400' : 'bg-slate-300';
              return (
                <div key={key} className="p-2 border rounded-lg bg-slate-50/30">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Icon className="h-3 w-3 text-slate-400" />
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-wide">{label}</span>
                  </div>
                  <div className="space-y-0.5">
                    {arr.map((item: string, i: number) => (
                      <div key={i} className="flex items-start gap-1.5">
                        <div className={`h-1.5 w-1.5 rounded-full mt-1 flex-shrink-0 ${dot}`} />
                        <p className="text-[9px] font-bold text-slate-600 leading-snug">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </AccSection>

        {/* 7 — Risk & Procedure Clues */}
        <AccSection id="risk_clues" title="Risk & Procedure Clues" icon={AlertTriangle}>
          <div className="space-y-2.5">
            {rpc && ([
              { key: 'procedure_mentions',          label: 'Procedure' },
              { key: 'equipment_issue_mentions',    label: 'Equipment' },
              { key: 'sensor_alarm_mentions',       label: 'Sensor / Alarm' },
              { key: 'emergency_response_mentions', label: 'Emergency' },
              { key: 'control_gap_mentions',        label: 'Control Gap' },
              { key: 'radio_channel_issue_mentions',label: 'Radio / Comms' },
            ] as { key: string; label: string }[]).map(({ key, label }) => {
              const items: string[] = rpc[key] || [];
              if (items.length === 0) return null;
              return (
                <div key={key}>
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-wide block mb-1">{label}</span>
                  <div className="space-y-0.5">
                    {items.map((item, i) => (
                      <div key={i} className="flex items-start gap-1.5">
                        <div className="h-1 w-1 rounded-full bg-slate-300 mt-1.5 flex-shrink-0" />
                        <p className="text-[9px] font-bold text-slate-600 leading-snug">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </AccSection>

        {/* 8 — Contradictions & Gaps */}
        <AccSection id="contradictions" title="Contradictions & Gaps" icon={AlertCircle} count={(data as any).contradictions_and_gaps?.length || 0}>
          <div className="space-y-2">
            {((data as any).contradictions_and_gaps || []).map((c: any, i: number) => (
              <div key={i} className="p-2.5 border border-amber-100 rounded-lg bg-amber-50/30 hover:bg-amber-50/60 transition-all">
                <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                  <TsBtn time={c.timestamp} />
                  <Chip label={c.type} variant="warn" />
                  <span className="ml-auto text-[8px] font-bold text-slate-400">{c.confidence}</span>
                </div>
                <p className="text-[9px] font-bold text-slate-700 leading-snug">{c.detail}</p>
              </div>
            ))}
          </div>
        </AccSection>

        {/* 9 — PEEPO Seeds */}
        <AccSection id="peepo" title="PEEPO Seeds" icon={Brain}>
          <div className="space-y-1.5">
            {Object.entries(data.peepo_seeds).map(([cat, items]: any) => {
              const arr: string[] = Array.isArray(items) ? items : [items];
              return (
                <div key={cat} className="p-2 rounded-lg border border-slate-100 bg-slate-50/40 hover:bg-white transition-all">
                  <span className="text-[8px] font-black text-primary uppercase tracking-wider block mb-1">{cat}</span>
                  {arr.map((item: string, i: number) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <div className="h-1 w-1 rounded-full bg-primary/40 mt-1.5 flex-shrink-0" />
                      <p className="text-[9px] font-bold text-slate-600 leading-snug">{item}</p>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </AccSection>

        {/* 10 — IPLS Seeds */}
        <AccSection id="ipls" title="IPLS Seeds" icon={FileSearch} count={data.ipls_seeds.length}>
          <div className="space-y-2">
            {data.ipls_seeds.map((ipls: any, i: number) => (
              <div key={i} className="p-2.5 border-l-2 border-l-primary border border-slate-100 rounded-r-lg bg-slate-50/40">
                <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                  <span className="text-[9px] font-black text-primary">{ipls.layer_candidate}</span>
                  <span className="text-[8px] text-slate-300">·</span>
                  <span className="text-[9px] font-bold text-slate-500">{ipls.control_area_candidate}</span>
                </div>
                <p className="text-[9px] font-bold text-slate-700 leading-snug mb-1">{ipls.deviation_text}</p>
                {ipls.evidence_quote && (
                  <p className="text-[9px] font-medium text-slate-400 italic leading-snug">"{ipls.evidence_quote}"</p>
                )}
              </div>
            ))}
          </div>
        </AccSection>

        {/* 11 — Review Meta */}
        <AccSection id="review_meta" title="Review Meta" icon={CheckCircle2}>
          <div className="space-y-2">
            {((data as any).review_meta?.low_confidence_segments || []).map((seg: string, i: number) => (
              <div key={i} className="flex items-start gap-1.5">
                <AlertCircle className="h-3 w-3 text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-[9px] font-bold text-slate-600 leading-snug">{seg}</p>
              </div>
            ))}
            {((data as any).review_meta?.needs_human_review || []).length > 0 && (
              <div>
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-wide block mb-1">Needs Human Review</span>
                {(data as any).review_meta.needs_human_review.map((item: string, i: number) => (
                  <div key={i} className="flex items-start gap-1.5 mb-1 last:mb-0">
                    <Eye className="h-3 w-3 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-[9px] font-bold text-slate-600 leading-snug">{item}</p>
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-center justify-between pt-1.5 border-t border-slate-100">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Overall Confidence</span>
              <span className="text-[10px] font-black text-emerald-600">{(data as any).review_meta?.confidence || '—'}</span>
            </div>
          </div>
        </AccSection>

      </div>
    );
  };

  // ── Diary Session tab ──────────────────────────────────────────────────────

  const renderDiary = () => {
    const segments = audioDiarizationData;
    const totalSpeakers = [...new Set(segments.map(s => s.speaker_id))].length;
    const curMin = Math.floor(audioCurrentTime / 60).toString().padStart(2, '0');
    const curSec = (audioCurrentTime % 60).toString().padStart(2, '0');

    return (
      <div className="flex flex-col h-full">
        {/* Mini header stats */}
        <div className="px-3 py-1.5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3 text-[9px] font-bold text-slate-400 uppercase tracking-wide flex-shrink-0">
          <span>{segments.length} segments</span>
          <span className="h-3 w-px bg-slate-200" />
          <span>{totalSpeakers} speakers</span>
          <span className="h-3 w-px bg-slate-200" />
          <span>04:22 total</span>
          <div className="ml-auto flex items-center gap-1.5">
            <div className={`h-1.5 w-1.5 rounded-full ${audioCurrentTime > 0 ? 'bg-primary animate-pulse' : 'bg-slate-200'}`} />
            <span className="tabular-nums text-slate-500">{curMin}:{curSec}</span>
          </div>
        </div>

        {/* Segment list */}
        <div className="flex-1 overflow-auto custom-scrollbar divide-y divide-slate-50">
          {segments.map((seg) => {
            const active = isSegActive(seg.start_time, seg.end_time);
            return (
              <div
                key={seg.segment_id}
                onClick={() => seek(seg.start_time)}
                className={`flex gap-2.5 px-3 py-2.5 cursor-pointer transition-all relative group ${
                  active
                    ? 'bg-primary/5 border-l-2 border-l-primary'
                    : 'border-l-2 border-l-transparent hover:bg-slate-50/80 hover:border-l-slate-200'
                }`}
              >
                {/* Timestamp range */}
                <div className="w-[72px] flex-shrink-0 pt-0.5">
                  <span className={`text-[9px] font-black tabular-nums leading-tight block ${active ? 'text-primary' : 'text-slate-400'}`}>
                    {seg.start_time}
                  </span>
                  <span className={`text-[8px] font-bold tabular-nums block ${active ? 'text-primary/60' : 'text-slate-300'}`}>
                    –{seg.end_time}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wide border ${
                      seg.speaker_id === 'SPK_01'
                        ? 'bg-amber-50 text-amber-700 border-amber-100'
                        : 'bg-indigo-50 text-indigo-700 border-indigo-100'
                    }`}>
                      {seg.speaker_label}
                    </span>
                    {seg.flags.includes('critical_evidence') && <span className="h-1.5 w-1.5 rounded-full bg-rose-500" title="Critical evidence" />}
                    {seg.flags.includes('hazard_alert') && <span className="h-1.5 w-1.5 rounded-full bg-amber-400" title="Hazard alert" />}
                    {seg.flags.includes('key_observation') && <Star className="h-2.5 w-2.5 text-amber-400 fill-amber-400" />}
                    {seg.flags.includes('emergency_command') && <span className="h-1.5 w-1.5 rounded-full bg-rose-600 animate-pulse" title="Emergency command" />}
                  </div>
                  <p className={`text-[10px] leading-relaxed ${active ? 'text-slate-900 font-medium' : 'text-slate-600 font-medium'}`}>
                    {seg.text}
                  </p>
                </div>
              </div>
            );
          })}

          {/* End marker */}
          <div className="flex flex-col items-center justify-center py-6 gap-1">
            <div className="h-px w-8 bg-slate-100" />
            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-300">End of Recording</span>
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
          {(['extraction', 'diary'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 text-[9px] font-black uppercase tracking-tight rounded transition-all ${
                activeTab === tab
                  ? 'bg-white text-primary shadow-sm ring-1 ring-slate-200/60'
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
                  viewMode === mode ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'
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
            {renderDiary()}
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
      <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="px-6 pt-6 pb-5">
          <div className="flex items-start justify-between mb-4">
            <div className="h-10 w-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center">
              <Trash2 className="h-5 w-5 text-rose-500" />
            </div>
            {!isDeleting && (
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400"
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
        <div className="mx-6 mb-5 rounded-xl border border-slate-100 bg-slate-50/60 overflow-hidden">
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
        <div className="mx-6 mb-5 flex items-start gap-2 px-3 py-2.5 rounded-lg bg-amber-50 border border-amber-100">
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
                    "flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border transition-all",
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
                ? "bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-200"
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

function ExtractionTab({ files: evidenceFiles, setFiles: setEvidenceFiles, batches, setBatches }: { files: any[], setFiles: React.Dispatch<React.SetStateAction<any[]>>, batches: any[], setBatches: React.Dispatch<React.SetStateAction<any[]>> }) {
  const [selectedFile, setSelectedFile] = useState<any>(evidenceFiles[1]);
  const [activeFilter, setActiveFilter] = useState("All Files");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedBatches, setExpandedBatches] = useState<string[]>(["B1", "B2", "B4", "B5"]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Lifted audio state — shared between center player and right panel
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioIsPlaying, setAudioIsPlaying] = useState(false);
  const [audioPlaybackSpeed, setAudioPlaybackSpeed] = useState(1);
  const [deleteFolderTarget, setDeleteFolderTarget] = useState<DeleteFolderTarget | null>(null);

  const openDeleteFolderModal = (batch: any) => {
    const filesInBatch = evidenceFiles.filter(f => f.batchId === batch.id);
    setDeleteFolderTarget({
      id: batch.id,
      name: batch.name,
      fileCount: filesInBatch.length,
      sampleFiles: filesInBatch.slice(0, 5).map((f: any) => f.name),
    });
  };

  const handleDeleteFolder = () => {
    if (!deleteFolderTarget) return;
    const targetId = deleteFolderTarget.id;
    setBatches(prev => prev.filter(b => b.id !== targetId));
    setEvidenceFiles(prev => prev.filter(f => f.batchId !== targetId));
    setExpandedBatches(prev => prev.filter(id => id !== targetId));
    if (selectedFile?.batchId === targetId) setSelectedFile(null);
    setDeleteFolderTarget(null);
  };

  const toggleBatch = (id: string) => {
    setExpandedBatches(prev => prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]);
  };

  const handleUploadComplete = (completedGroups: CompletedGroup[]) => {
    const today = new Date().toISOString().split("T")[0];
    const newBatches: any[] = [];
    const newFiles: any[] = [];
    const newExpandedIds: string[] = [];

    for (const group of completedGroups) {
      // Determine dominant file type for batch label
      const counts: Record<string, number> = { Image: 0, Audio: 0, Video: 0, Document: 0 };
      for (const f of group.files) { if (f.type in counts) counts[f.type]++; }
      const dominant = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
      const batchType = dominant === "Image" ? "Images" : dominant === "Audio" ? "Audio" : dominant === "Video" ? "Video" : "Documents";

      newBatches.push({
        id: group.batchId,
        name: group.name,
        description: group.isFolder ? `Uploaded from folder: ${group.name}` : "Manually uploaded files",
        type: batchType,
        fileCount: group.files.length,
        uploadedBy: "Current User",
        updated: "Just now",
        extractionProgress: 0,
        reviewProgress: 0,
        keyEvidenceCount: 0,
        linkedAnalysis: 0,
      });
      newExpandedIds.push(group.batchId);

      for (const file of group.files) {
        newFiles.push({
          id: file.id,
          batchId: group.batchId,
          name: file.name,
          type: file.type,
          source: group.isFolder ? "Folder Upload" : "Manual Upload",
          uploadedBy: "Current User",
          uploadDate: today,
          extractionStatus: "processing",
          reviewStatus: "pending",
          tags: [],
          linked: 0,
          size: file.size,
          relativePath: file.relativePath,
        });
      }
    }

    setBatches(prev => [...prev, ...newBatches]);
    setEvidenceFiles(prev => [...newFiles, ...prev]);
    setExpandedBatches(prev => [...new Set([...prev, ...newExpandedIds])]);
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

  const groupedFiles = batches.map(batch => ({
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
                    className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors border-b border-slate-100 group/brow"
                  >
                     <div className="shrink-0">
                       {expandedBatches.includes(batch.id) ? <ChevronDown className="h-3 w-3 text-slate-400" /> : <ChevronRight className="h-3 w-3 text-slate-400" />}
                     </div>
                     <Folders className="h-3.5 w-3.5 text-primary/60 shrink-0" />
                     <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter leading-snug flex-1 min-w-0 truncate">{batch.name}</span>
                     <span className="text-[9px] font-bold text-slate-400 bg-white px-1.5 py-0.5 rounded-full border shrink-0">{batch.files.length}</span>
                     <button
                       onClick={(e) => { e.stopPropagation(); openDeleteFolderModal(batch); }}
                       className="p-1 hover:bg-rose-50 rounded transition-colors opacity-0 group-hover/brow:opacity-100 text-slate-300 hover:text-rose-400 shrink-0"
                       title="Delete folder"
                     >
                       <Trash2 className="h-3 w-3" />
                     </button>
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

        <div className="flex-1 overflow-auto bg-[#f0f2f4] p-6 flex flex-col items-center custom-scrollbar" style={{ minWidth: 0 }}>
             <div className={`w-full flex ${selectedFile?.type === "Image" ? "max-w-3xl h-full items-center justify-center" : "max-w-5xl items-start justify-center pt-4"}`}>
               {selectedFile ? (
                 <AdaptiveSourcePreview
                   file={selectedFile}
                   audioCurrentTime={audioCurrentTime}
                   setAudioCurrentTime={setAudioCurrentTime}
                   audioIsPlaying={audioIsPlaying}
                   setAudioIsPlaying={setAudioIsPlaying}
                   audioPlaybackSpeed={audioPlaybackSpeed}
                   setAudioPlaybackSpeed={setAudioPlaybackSpeed}
                 />
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

      <div className="w-[460px] min-w-[380px] border-l bg-white flex flex-col shrink-0 z-20 shadow-[-2px_0_6px_rgba(0,0,0,0.04)]">

        {selectedFile?.type === "Audio" ? (
          /* ── Audio: new 2-tab panel (Extraction + Diary Session) ── */
          <div className="flex-1 min-h-0 overflow-hidden">
            <AudioRightPanel
              audioCurrentTime={audioCurrentTime}
              onSeek={(sec) => { setAudioCurrentTime(sec); setAudioIsPlaying(true); }}
            />
          </div>
        ) : (
          /* ── Non-Audio: existing extraction console ── */
          <>
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
          </>
        )}

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

      <DeleteFolderModal
        key={deleteFolderTarget?.id ?? "none"}
        target={deleteFolderTarget}
        onClose={() => setDeleteFolderTarget(null)}
        onConfirm={handleDeleteFolder}
      />
    </div>
  );
}

function AdaptiveSourcePreview({
  file,
  audioCurrentTime: externalAudioCurrentTime,
  setAudioCurrentTime: setExternalAudioCurrentTime,
  audioIsPlaying: externalAudioIsPlaying,
  setAudioIsPlaying: setExternalAudioIsPlaying,
  audioPlaybackSpeed: externalAudioPlaybackSpeed,
  setAudioPlaybackSpeed: setExternalAudioPlaybackSpeed,
}: {
  file: any;
  audioCurrentTime?: number;
  setAudioCurrentTime?: (t: number) => void;
  audioIsPlaying?: boolean;
  setAudioIsPlaying?: (p: boolean) => void;
  audioPlaybackSpeed?: number;
  setAudioPlaybackSpeed?: (s: number) => void;
}) {
  const [localAudioCurrentTime, setLocalAudioCurrentTime] = useState(0);
  const [localAudioIsPlaying, setLocalAudioIsPlaying] = useState(false);
  const [localAudioPlaybackSpeed, setLocalAudioPlaybackSpeed] = useState(1);

  const audioCurrentTime    = externalAudioCurrentTime    ?? localAudioCurrentTime;
  const setAudioCurrentTime = setExternalAudioCurrentTime ?? setLocalAudioCurrentTime;
  const audioIsPlaying      = externalAudioIsPlaying      ?? localAudioIsPlaying;
  const setAudioIsPlaying   = setExternalAudioIsPlaying   ?? setLocalAudioIsPlaying;
  const audioPlaybackSpeed  = externalAudioPlaybackSpeed  ?? localAudioPlaybackSpeed;
  const setAudioPlaybackSpeed = setExternalAudioPlaybackSpeed ?? setLocalAudioPlaybackSpeed;
  
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);
  const [videoIsPlaying, setVideoIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  if (!file) return <div className="p-20 text-center text-slate-400 font-bold uppercase tracking-[0.2em] opacity-50">Select evidence for preview</div>;
  
  if (file.type === "Document") {
    return (
      <div className="flex flex-col gap-6 w-full max-w-4xl pb-20">
        <div className="bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-500">
           <div className="h-10 bg-slate-50 border-b flex items-center justify-between px-4">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Digital Evidence / PDF Source</span>
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-bold text-slate-400">Page 1 of 4</span>
                <div className="flex items-center gap-1">
                   <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-slate-200"><ChevronLeft className="h-4 w-4" /></Button>
                   <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-slate-200"><ChevronRight className="h-4 w-4" /></Button>
                </div>
              </div>
           </div>
           <div className="flex-1 p-12 min-h-[600px] space-y-6 relative overflow-hidden bg-white">
              <div className="absolute top-48 left-0 right-0 h-8 bg-amber-100/30 border-y border-amber-200/50 mix-blend-multiply" />
              <div className="absolute top-[320px] left-0 right-0 h-6 bg-primary/10 border-y border-primary/20 mix-blend-multiply" />
              <h1 className="text-2xl font-bold text-slate-900 border-none p-0">HSE Incident Report - Initial Findings</h1>
              <div className="h-px bg-slate-100 w-full" />
              <div className="space-y-4">
                 {[1, 2, 3, 4, 5, 2, 4, 3, 1, 5, 4, 2].map((w, i) => (
                    <div key={i} className="flex gap-2">
                       <div className="h-3 bg-slate-100 rounded" style={{ width: `${w * 10 + 20}%` }} />
                       <div className="h-3 bg-slate-50 rounded" style={{ width: `${(10 - w) * 5 + 10}%` }} />
                    </div>
                 ))}
                 <p className="text-sm text-slate-800 leading-relaxed font-medium bg-amber-50 p-3 rounded border border-amber-100 shadow-sm relative z-10 transition-colors hover:bg-amber-100/50">
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

        <div className="space-y-4">
           <div className="flex items-center justify-between border-b pb-2 px-1">
              <div className="flex items-center gap-2">
                 <FileSearch className="h-4 w-4 text-primary" />
                 <h2 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">Thematic Investigation Facts</h2>
              </div>
              <div className="flex items-center gap-2">
                 <span className="text-[10px] font-bold text-slate-400">Showing 8 findings across 4 pages</span>
              </div>
           </div>

           <div className="grid gap-3">
              {[
                { title: "Incident Timeline", type: "Timeline Event", conf: "High", page: "Page 1, Para 2", detail: "Conveyor belt segment 14 identified as initial failure point at 14:35 during standard operation." },
                { title: "Equipment Specification", type: "Asset Detail", conf: "High", page: "Page 2, Table 1.1", detail: "Belt model 'Titan-X 4000' installed Jan 2024. Last maintenance recorded 14 days prior to failure." },
                { title: "Observed Hazard", type: "Safety Deviation", conf: "Medium", page: "Page 1, Para 4", detail: "Material spillage blocked critical walkway, impeding emergency response path for approximately 12 minutes." },
                { title: "Witness Statement", type: "Actor Statement", conf: "High", page: "Page 3, Section A", detail: "Shift supervisor reported unusual vibration patterns 5 minutes before the structural tear happened." },
                { title: "Environmental Context", type: "Climate Detail", conf: "Med", page: "Page 4, Footer", detail: "Ambient temperature recorded at 38°C with 85% humidity at time of incident." },
              ].map((fact, i) => (
                 <div key={i} className="bg-white border rounded-xl p-4 shadow-sm hover:border-primary/40 transition-all group relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-slate-100 group-hover:bg-primary/50 transition-all" />
                    <div className="flex items-start justify-between mb-2">
                       <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-slate-900 uppercase tracking-tight">{fact.title}</span>
                          <span className="px-1.5 py-0.5 bg-slate-100 border text-[8px] font-bold text-slate-500 rounded-full uppercase tracking-widest">{fact.type}</span>
                       </div>
                       <ConfidenceChip level={fact.conf.toLowerCase() as any} />
                    </div>
                    <p className="text-[12px] font-medium text-slate-700 leading-relaxed mb-3 pr-4">{fact.detail}</p>
                    <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-[0.1em] border-t pt-3 border-slate-50">
                       <Navigation className="h-2.5 w-2.5 text-primary" />
                       Source: {fact.page}
                    </div>
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
    const jumpTo = (timeStr: string) => {
      const parts = timeStr.split(':').map(Number);
      const seconds = parts[0] * 60 + parts[1];
      setAudioCurrentTime(seconds);
      setAudioIsPlaying(true);
    };

    const isSegmentActive = (start: string, end: string) => {
      const getS = (s: string) => s.split(':').map(Number)[0] * 60 + s.split(':').map(Number)[1];
      return audioCurrentTime >= getS(start) && audioCurrentTime <= getS(end);
    };

    return (
       <div className="w-full max-w-4xl space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-20">
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

             <div className="space-y-3">
                <div className="h-20 w-full bg-slate-50/50 flex items-end gap-[2px] px-2 py-3 rounded-xl border border-slate-100 group/wave cursor-pointer relative"
                     onClick={(e) => {
                       const rect = e.currentTarget.getBoundingClientRect();
                       const x = e.clientX - rect.left;
                       const pct = x / rect.width;
                       const totalSeconds = 8 * 60 + 42; 
                       setAudioCurrentTime(Math.floor(totalSeconds * pct));
                     }}>
                   {Array.from({ length: 120 }).map((_, i) => {
                     const totalSeconds = 8 * 60 + 42;
                     const targetX = (i / 120) * totalSeconds;
                     const isPast = targetX <= audioCurrentTime;
                     return (
                        <div key={i} 
                             className={`flex-1 rounded-full transition-all duration-300 ${isPast ? "bg-primary" : "bg-slate-200"}`} 
                             style={{ height: `${20 + Math.sin(i * 0.2) * 20 + Math.random() * 40}%`, opacity: isPast ? 1 : 0.4 }} />
                     );
                   })}
                   <div className="absolute top-0 bottom-0 w-0.5 bg-primary z-20 shadow-[0_0_10px_rgba(37,99,235,0.8)]" 
                        style={{ left: `${(audioCurrentTime / (8*60+42)) * 100}%` }} />
                </div>
                <div className="flex justify-between px-1">
                   <span className="text-[11px] font-black text-slate-400 tabular-nums">
                     {Math.floor(audioCurrentTime / 60).toString().padStart(2, '0')}:{(audioCurrentTime % 60).toString().padStart(2, '0')}
                   </span>
                   <span className="text-[11px] font-black text-slate-400 tabular-nums">{file.duration}</span>
                </div>
             </div>

             <div className="flex items-center justify-between bg-slate-50/50 p-2 rounded-2xl border border-slate-100 shadow-inner">
                <div className="flex items-center gap-1">
                   <Button variant="ghost" size="sm" className="h-9 w-9 p-0 text-slate-500" onClick={() => setAudioCurrentTime(prev => Math.max(0, prev - 10))}><RefreshCcw className="h-4 w-4 -scale-x-100" /></Button>
                   <Button 
                      className="h-12 w-12 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-xl hover:bg-slate-800 transition-all hover:scale-105 active:scale-95"
                      onClick={() => setAudioIsPlaying(!audioIsPlaying)}>
                      {audioIsPlaying ? <div className="h-4 w-4 bg-white rounded-sm" /> : <Play className="h-5 w-5 fill-white ml-1" />}
                   </Button>
                   <Button variant="ghost" size="sm" className="h-9 w-9 p-0 text-slate-500" onClick={() => setAudioCurrentTime(prev => prev + 10)}><RefreshCcw className="h-4 w-4" /></Button>
                </div>
                <div className="flex items-center gap-6">
                   <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rate</span>
                      <select 
                        value={audioPlaybackSpeed}
                        onChange={(e) => setAudioPlaybackSpeed(Number(e.target.value))}
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
                      <div className="h-2 w-2 rounded-full bg-primary" /> Current Seg: {audioCurrentTime}s
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
                             </div>
                             <p className={`text-sm leading-relaxed transition-colors ${active ? "text-slate-900 font-medium" : "text-slate-600 font-medium"}`}>
                                {seg.text}
                             </p>
                          </div>
                        </div>
                     );
                   })}
                </div>
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
     const activeSegment = videoTimeframesData.find(tf => {
        const getS = (s: string) => s.split(':').map(Number)[0] * 60 + s.split(':').map(Number)[1];
        return videoCurrentTime >= getS(tf.start_time) && videoCurrentTime <= getS(tf.end_time);
     });

     const jumpTo = (timeStr: string) => {
        const parts = timeStr.split(':').map(Number);
        const seconds = parts[0] * 60 + parts[1];
        if (videoRef.current) {
          videoRef.current.currentTime = seconds;
          videoRef.current.play();
          setVideoIsPlaying(true);
        }
     };

     return (
       <div className="w-full max-w-4xl space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
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
                  onTimeUpdate={(e) => setVideoCurrentTime(e.currentTarget.currentTime)}
                  onPlay={() => setVideoIsPlaying(true)}
                  onPause={() => setVideoIsPlaying(false)}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col gap-4 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                   <div className="flex items-center gap-4">
                      <button onClick={() => videoIsPlaying ? videoRef.current?.pause() : videoRef.current?.play()} className="h-10 w-10 bg-white rounded-full flex items-center justify-center text-slate-900 shadow-xl hover:scale-110 active:scale-95 transition-all">
                        {videoIsPlaying ? <div className="h-3 w-3 bg-slate-900 rounded-sm" /> : <Play className="h-4 w-4 fill-slate-900 ml-0.5" />}
                      </button>
                      <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden cursor-pointer">
                         <div className="h-full bg-primary" style={{ width: `${(videoCurrentTime / (14*60+30)) * 100}%` }} />
                      </div>
                      <span className="text-[10px] font-black text-white tabular-nums tracking-widest">
                        {Math.floor(videoCurrentTime/60).toString().padStart(2,'0')}:{(Math.floor(videoCurrentTime%60)).toString().padStart(2,'0')} / {file.duration}
                      </span>
                   </div>
                </div>
             </div>
          </div>

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
  const [viewMode, setViewMode] = useState<"Structured" | "JSON">("Structured");
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  
  useEffect(() => {
    if (file?.type === "Audio") {
      setExpandedSections(["Recording Meta", "Intelligence Seeds"]);
    } else if (file?.type === "Video") {
      setExpandedSections(["Detected Events"]);
    } else {
      setExpandedSections([]);
    }
  }, [file?.id, file?.type]);

  if (!file) return null;

  const toggle = (s: string) => setExpandedSections(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);

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

  const ExtractionItem = ({ fact, type, source, conf }: any) => (
    <div className="bg-white border border-slate-200 rounded-lg p-3 hover:border-primary/40 transition-all hover:shadow-md cursor-pointer group mb-3 last:mb-0 relative overflow-hidden">
       <div className="absolute top-0 left-0 w-1 h-full bg-slate-100 group-hover:bg-primary/50 transition-colors" />
       <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{type}</span>
             <ConfidenceChip level={(conf || "Low").toLowerCase() as any} />
          </div>
       </div>
       <p className="text-xs font-bold text-slate-900 leading-snug mb-2 pr-4">{fact}</p>
       <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest border-t pt-2 border-slate-50">
          <Paperclip className="h-2.5 w-2.5" />
          {source}
       </div>
    </div>
  );

  if (file.type === "Audio") {
     const data = audioExtractionData;
     return (
        <div className="space-y-3 pb-20">
           <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Forensic logic</span>
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
              <div className="space-y-4">
                 <Section title="Recording Meta" icon={Settings}>
                    <div className="divide-y divide-slate-50">
                       <DataRow label="Duration" value={data.recording_meta.duration} />
                       <DataRow label="Quality" value={data.recording_meta.audio_quality} badge={{ text: data.recording_meta.audio_quality, className: "bg-emerald-50 text-emerald-700 border-emerald-100" }} />
                       <DataRow label="Type" value={data.recording_meta.recording_type} />
                       <DataRow label="Noise Level" value={data.recording_meta.noise_level} />
                    </div>
                 </Section>
                 <Section title="Diarization & Transcript" icon={MessageSquare}>
                    <div className="space-y-4">
                       {data.full_diarization.map((seg: any) => (
                         <div key={seg.segment_id} className="flex flex-col gap-1.5 pl-3 border-l-2 border-slate-100">
                            <span className="text-[10px] font-black text-slate-500 uppercase">{seg.speaker_label} · {seg.start_time}</span>
                            <p className="text-[11px] font-bold text-slate-800 italic leading-relaxed">"{seg.text}"</p>
                         </div>
                       ))}
                    </div>
                 </Section>
                 <Section title="Intelligence Seeds" icon={Brain}>
                    <div className="space-y-4">
                       <div className="p-3 border rounded-xl bg-slate-900 text-white">
                          <span className="text-[10px] font-black text-primary uppercase block mb-2">PEEPO Reasoning</span>
                          {Object.entries(data.peepo_seeds).map(([k, v]: any) => (
                            <div key={k} className="flex gap-2 mb-1.5 last:mb-0 opacity-90">
                               <span className="text-[9px] font-black text-slate-500 uppercase min-w-[60px]">{k}</span>
                               <p className="text-[10px] font-bold text-slate-300 leading-tight">"{v[0]}"</p>
                            </div>
                          ))}
                       </div>
                    </div>
                 </Section>
              </div>
           )}
        </div>
     );
  }

  if (file.type === "Document") {
    return (
      <div className="space-y-6 pb-20">
        <div className="space-y-3 bg-slate-50 p-4 rounded-xl border">
           <div className="flex items-center gap-2 mb-0.5">
              <FileText className="h-3.5 w-3.5 text-primary" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Document Summary</span>
           </div>
           <p className="text-[11px] font-bold text-slate-700 leading-relaxed italic">
             Initial HSE report documenting structural failure of Conveyor Belt 14 in Zone B. 
           </p>
        </div>
        <div className="grid grid-cols-2 gap-2">
           {[
             { label: "Incident Type", value: "Mechanical Failure" },
             { label: "Location", value: "Pit Delta / Zone B" },
             { label: "Critical Assets", value: "Conveyor 14" },
             { label: "Severity", value: "High", badge: "bg-rose-100 text-rose-700" },
           ].map((item, i) => (
              <div key={i} className="bg-slate-50/50 p-2.5 border rounded-lg">
                 <span className="text-[8px] font-black text-slate-400 uppercase block mb-0.5">{item.label}</span>
                 <span className={`text-[10px] font-black ${item.badge ? item.badge + " px-1.5 py-0.5 rounded-sm" : "text-slate-800"}`}>
                    {item.value}
                 </span>
              </div>
           ))}
        </div>
        <Section title="Timeline & Facts" icon={Clock}>
           <ExtractionItem fact="14:35 - Belt tear occurs, E-stop triggered" type="Critical Event" source="Page 1, Para 3" conf="High" />
           <ExtractionItem fact="14:15 - Unusual vibration reported" type="Telemetry" source="Page 1, Para 2" conf="High" />
        </Section>
        <Section title="Risk Signals" icon={AlertTriangle}>
           <ExtractionItem fact="Locked egress: Walkway B blocked" type="Safety Violation" source="Page 1, Para 4" conf="High" />
        </Section>
      </div>
    );
  }

  if (file.type === "Video") {
     return (
        <div className="space-y-4 pb-20">
           <Section title="Detected Events" icon={VideoIcon}>
              <ExtractionItem fact="Metal-on-metal friction sparks detected at section 14" type="Visual Anomaly" source="CCTV [14:35:12]" conf="High" />
              <ExtractionItem fact="Conveyor belt deflection exceeding 150mm" type="Measurement" source="Computer Vision" conf="High" />
           </Section>
           <Section title="Hazards & Alerts" icon={AlertCircle}>
              <ExtractionItem fact="Operator seen approaching moving parts without barriers" type="Safety Violation" source="Scene AI" conf="Medium" />
           </Section>
        </div>
     );
  }

  if (file.type === "Image") {
    return (
      <div className="space-y-4 pb-20">
         <Section title="Composition & Objects" icon={LayoutGrid}>
            <ExtractionItem fact="Visible tear across 90% of belt width" type="Surface Condition" source="Region [X:234, Y:782]" conf="High" />
            <ExtractionItem fact="Roller support bracket appears detached" type="Equipment Hazard" source="Region [X:451, Y:123]" conf="Medium" />
         </Section>
         <Section title="Safety & PPE" icon={CheckCircle2}>
            <ExtractionItem fact="Person wearing high-vis vest & hard hat" type="PPE Compliance" source="Global Scene" conf="High" />
            <ExtractionItem fact="No exclusion zone barriers visible near tear" type="Safety Observation" source="Global Scene" conf="High" />
         </Section>
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
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] uppercase tracking-wider h-10 shadow-sm border-none group"
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
                                 'bg-slate-50 text-slate-400 border-slate-100'}
                           `}>
                               {agent.status}
                           </div>
                        </div>
                        <h4 className={`text-[10px] font-black uppercase tracking-[0.15em] mb-1.5 ${selectedAgentId === agent.id ? "text-slate-900" : "text-slate-500"}`}>{agent.name}</h4>
                        <p className="text-[10px] font-bold text-slate-400 leading-snug opacity-80">{agent.purpose}</p>
                        {agent.status === 'running' && (
                           <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500/20 overflow-hidden rounded-b-xl">
                              <div className="h-full bg-blue-500 animate-pulse w-full" />
                           </div>
                        )}
                     </div>
                  ))}
               </div>
            </div>
         </div>

         <div className="flex-1 flex flex-col min-w-0 bg-[#f0f2f4]">
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
               className="flex-1 flex flex-col items-center justify-center p-4 overflow-hidden relative"
               style={{
                  backgroundImage: 'radial-gradient(circle, #E2E8F0 1px, transparent 1px)',
                  backgroundSize: '24px 24px'
               }}
            >
                {!selectedAgentId ? (
                    <div className="py-24 flex flex-col items-center text-center max-w-sm">
                        <div className="h-24 w-24 rounded-[3rem] bg-white border border-slate-200 shadow-2xl flex items-center justify-center mb-10 rotate-12 transition-transform hover:rotate-0">
                            <Brain className="h-10 w-10 text-slate-200" />
                        </div>
                        <h3 className="text-xl font-black text-slate-800 tracking-tighter mb-3 uppercase opacity-50">Orchestration Standby</h3>
                    </div>
                ) : (
                    <div className="bg-white shadow-[0_30px_90px_-20px_rgba(0,0,0,0.3)] flex flex-col relative transition-all duration-300 origin-center overflow-hidden rounded-[2px]" 
                         style={{ width: '1024px', height: '576px', transform: `scale(${canvasZoom/100})` }}>
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
                                {slides[activeSlide]?.type === 'chronology' ? (
                                   <div className="flex flex-col h-full text-slate-900">
                                      <div className="flex justify-between items-start mb-6 border-b-2 border-slate-900 pb-4">
                                         <div>
                                            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-1">{slides[activeSlide]?.subtitle}</div>
                                            <h2 className="text-[32px] font-black uppercase tracking-tighter leading-none">{slides[activeSlide]?.title}</h2>
                                         </div>
                                         <div className="text-right">
                                            <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Investigation Code</div>
                                            <div className="text-sm font-mono font-bold text-slate-800">#{slides[activeSlide]?.caseCode}</div>
                                         </div>
                                      </div>
                                      <div className="mb-6 bg-slate-50 border-l-4 border-slate-900 p-4 rounded-r-lg">
                                         <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Executive Summary</div>
                                         <div className="text-[14px] text-slate-700 font-medium leading-relaxed">{slides[activeSlide]?.content?.summary}</div>
                                      </div>
                                      <div className="grid grid-cols-4 gap-4 mb-8 bg-white border border-slate-100 p-4 rounded-xl">
                                         {slides[activeSlide]?.content?.metadata.map((m: any) => (
                                            <div key={m.label}>
                                               <div className="text-[8px] font-black text-slate-400 uppercase mb-1">{m.label}</div>
                                               <div className="text-[11px] font-bold text-slate-800">{m.value}</div>
                                            </div>
                                         ))}
                                      </div>
                                      <div className="flex-1 grid grid-cols-3 gap-4 min-h-0 overflow-hidden">
                                         {['praKontak', 'kontak', 'pascaKontak'].map((key, i) => (
                                            <div key={key} className="flex flex-col border border-slate-100 rounded-xl overflow-hidden bg-white">
                                               <div className={`${i === 0 ? 'bg-emerald-600' : i === 1 ? 'bg-rose-600' : 'bg-amber-500'} px-4 py-2`}>
                                                  <span className="text-[10px] font-black text-white uppercase tracking-widest">{key.replace('K', ' K')}</span>
                                               </div>
                                               <div className="flex-1 overflow-y-auto p-3 space-y-2.5 custom-scrollbar">
                                                  {slides[activeSlide]?.content?.timeline[key].map((item: any, idx: number) => (
                                                     <div key={idx} className="flex gap-2">
                                                        <div className="text-[9px] font-black text-slate-400">[{item.time}]</div>
                                                        <div>
                                                           <div className="text-[10px] font-black text-slate-800 mb-0.5">[{item.name}]</div>
                                                           <div className="text-[10px] text-slate-500 font-medium leading-normal">{item.event}</div>
                                                        </div>
                                                     </div>
                                                  ))}
                                               </div>
                                            </div>
                                         ))}
                                      </div>
                                   </div>
                                ) : (
                                   <div className="flex flex-col h-full">
                                      <h2 className="text-[32px] font-black text-slate-800 mb-8 tracking-tighter uppercase">{slides[activeSlide]?.title}</h2>
                                      <div className="flex-1 bg-[#1a1c23] rounded-2xl p-6 overflow-hidden border border-slate-700 shadow-2xl relative">
                                         <pre className="text-[12px] font-mono text-emerald-400/90 leading-tight h-full overflow-auto custom-scrollbar">
                                            {JSON.stringify(slides[activeSlide]?.content, null, 2)}
                                         </pre>
                                      </div>
                                   </div>
                                )}
                             </div>
                          )}
                          <div className="absolute bottom-10 left-[60px] right-[60px] flex justify-between items-center opacity-40 border-t border-slate-100 pt-8">
                             <span className="text-[11px] font-black text-slate-800 uppercase tracking-[0.3em] font-mono">BERAU CORE INTELLIGENCE PIPELINE</span>
                             <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] font-mono">MATRIX v4.8.2-SYNTH</span>
                          </div>
                       </div>
                    </div>
                )}
            </div>

            <div className="h-12 bg-white border-t border-slate-200 px-6 flex items-center justify-between shrink-0 z-40">
                <div className="flex items-center gap-4">
                   <div className="flex items-center gap-1">
                      <Button onClick={() => setActiveSlide(prev => Math.max(0, prev - 1))} variant="ghost" size="sm" className="h-8 w-8 p-0 border"><ChevronLeft className="h-4 w-4" /></Button>
                      <div className="bg-slate-50 border px-3 h-8 flex items-center rounded-md">
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Slide {activeSlide + 1} of {slides.length || 1}</span>
                      </div>
                      <Button onClick={() => setActiveSlide(prev => Math.min((slides.length || 1) - 1, prev + 1))} variant="ghost" size="sm" className="h-8 w-8 p-0 border"><ChevronRight className="h-4 w-4" /></Button>
                   </div>
                   <div className="flex items-center gap-1 bg-slate-100/50 border border-slate-200 rounded-lg p-1">
                      <Button onClick={() => setCanvasZoom(Math.max(20, canvasZoom - 10))} variant="ghost" className="h-7 w-7 p-0"><ZoomOut className="h-3.5 w-3.5" /></Button>
                      <Button onClick={fitToWorkspace} variant="ghost" className="h-7 px-2 text-[9px] font-black text-slate-600 bg-white border shadow-sm rounded">AUTO FIT</Button>
                      <div className="w-12 text-center font-bold text-[10px] text-slate-700">{canvasZoom}%</div>
                      <Button onClick={() => setCanvasZoom(Math.min(200, canvasZoom + 10))} variant="ghost" className="h-7 w-7 p-0"><ZoomIn className="h-3.5 w-3.5" /></Button>
                   </div>
                </div>
                <div className="flex items-center gap-2">
                   <Button variant="ghost" className="h-8 w-8 p-0 border hover:bg-slate-50"><Maximize2 className="h-4 w-4" /></Button>
                   <Button onClick={handleSaveArtifact} disabled={isSaving} className="h-9 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-widest px-6 rounded-lg">
                      {isSaving ? "Syncing..." : "Sync to Case"}
                   </Button>
                </div>
             </div>
         </div>

         <div className="w-[460px] border-l border-slate-200 bg-white flex flex-col shrink-0 z-20 shadow-[-2px_0_10px_rgba(0,0,0,0.03)] overflow-hidden">
             <div className="h-12 border-b border-slate-200 flex items-center justify-between px-5 bg-slate-50/50 shrink-0">
                <div className="flex items-center gap-2">
                   <Brain className="h-4 w-4 text-primary" />
                   <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Synthesis Console</span>
                </div>
                <div className="flex items-center gap-2">
                   <Button variant="ghost" size="sm" className="h-7 px-2 text-[9px] font-bold text-slate-400 border">
                      <History className="h-3.5 w-3.5 mr-1" /> Log
                   </Button>
                   <Button variant="ghost" size="sm" className="h-7 px-2 text-[9px] font-bold text-primary border border-primary/20">
                      Rerun Node
                   </Button>
                </div>
             </div>

             <div className="flex-1 overflow-y-auto custom-scrollbar">
                {selectedAgentId ? (
                   <div className="p-6 space-y-8">
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
                                  <span className="text-[11px] font-black text-slate-800 tracking-tight uppercase">{selectedAgent?.status || "STANDBY"}</span>
                               </div>
                            </div>
                            <div className="flex flex-col">
                               <span className="text-[9px] font-black text-slate-400 uppercase mb-1">Last Run</span>
                               <span className="text-[11px] font-black text-slate-800 uppercase tabular-nums">{selectedAgent?.lastRunTimestamp || "—"}</span>
                            </div>
                         </div>
                      </div>

                      <div className="space-y-4">
                         <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                            <FileText className="h-3.5 w-3.5 text-slate-400" />
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Slide Artifacts</span>
                         </div>
                         <div className="grid grid-cols-2 gap-3">
                            {slides.map((s, i) => (
                               <div key={s.id} onClick={() => setActiveSlide(i)} className={`group p-4 rounded-xl border-2 transition-all cursor-pointer relative overflow-hidden ${activeSlide === i ? 'bg-white border-blue-500' : 'bg-white border-slate-100 hover:border-slate-200'}`}>
                                  <div className="flex items-start justify-between mb-3">
                                     <div className={`h-8 w-8 rounded-lg border flex items-center justify-center ${activeSlide === i ? "bg-blue-600 text-white" : "bg-slate-50 text-slate-400"}`}>
                                        <FileCode className="h-4 w-4" />
                                     </div>
                                     <span className="text-[8px] font-black text-slate-400 uppercase">Slide {i + 1}</span>
                                  </div>
                                  <h5 className="text-[10px] font-black uppercase truncate">{s.title}</h5>
                               </div>
                            ))}
                         </div>
                      </div>

                      <div className="bg-amber-50/30 border border-amber-100 rounded-xl p-5 space-y-3">
                         <div className="flex items-center gap-2">
                            <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-widest">Reasoning Gap</span>
                         </div>
                         <p className="text-[11px] font-bold text-amber-800 opacity-80 leading-relaxed">The Matrix identified a correlation between Manual Override and Bearing Temperature at Zone B-14.</p>
                      </div>
                   </div>
                ) : (
                   <div className="h-full flex flex-col items-center justify-center text-center p-12 opacity-30">
                      <Brain className="h-10 w-10 text-slate-300 mb-6" />
                      <h4 className="text-sm font-black uppercase tracking-[0.2em]">Console Idle</h4>
                   </div>
                )}
             </div>
             
             <div className="p-5 border-t bg-white shrink-0">
                <Button onClick={handleExport} disabled={isExporting} className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-xl">
                   {isExporting ? "Exporting..." : "Publish Presentation"}
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
             <div key={i} className={`p-3 rounded-lg border cursor-pointer ${i === 0 ? 'bg-primary/5 border-primary/20' : 'bg-white border-transparent'}`}>
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
            <div className="flex items-center justify-between bg-white px-6 py-4 rounded-xl border shadow-sm w-full mb-8">
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
                  <div key={idx} className="group relative bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
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
          <div className="bg-white border rounded-2xl shadow-sm p-8 flex items-center justify-between">
             <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-sm">
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

          <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
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
                     step.status === "reviewed" || step.status === "submitted" ? "bg-emerald-500 border-white text-white shadow-lg shadow-emerald-500/20" :
                     step.status === "pending" ? "bg-amber-500 border-white text-white shadow-lg shadow-amber-500/20 animate-pulse" :
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
  const auditEntries = [
    { timestamp: "2026-04-08 10:15", user: "System", role: "AI Agent", action: "Analysis Completed", objectType: "Analysis", objectName: "PEEPO Reasoning - RUN-046", prevState: "running", newState: "completed" },
    { timestamp: "2026-04-08 10:12", user: "System", role: "AI Agent", action: "Analysis Started", objectType: "Analysis", objectName: "PEEPO Reasoning - RUN-046", prevState: "—", newState: "running" },
    { timestamp: "2026-04-08 10:11", user: "Sarah Chen", role: "Investigator", action: "Extraction Accepted", objectType: "Evidence", objectName: "6 items accepted", prevState: "pending", newState: "reviewed" },
    { timestamp: "2026-04-08 09:45", user: "System", role: "AI Agent", action: "Extraction Metadata Sync", objectType: "Evidence", objectName: "incident_report_initial.pdf", prevState: "—", newState: "synced" },
    { timestamp: "2026-04-08 09:30", user: "System", role: "AI Agent", action: "Extraction Completed", objectType: "Evidence", objectName: "incident_report_initial.pdf", prevState: "processing", newState: "extracted" },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50/10 h-screen overflow-hidden">
      <div className="h-12 border-b bg-white flex items-center justify-between px-6 shrink-0 shadow-sm relative z-10">
         <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Audit Logs</span>
      </div>
      <div className="flex-1 overflow-auto p-4">
         <div className="bg-white border rounded-xl shadow-sm overflow-hidden overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b">
                  <th className="p-4 text-[10px] font-black uppercase text-slate-400">Timestamp</th>
                  <th className="p-4 text-[10px] font-black uppercase text-slate-400">User</th>
                  <th className="p-4 text-[10px] font-black uppercase text-slate-400">Action</th>
                  <th className="p-4 text-[10px] font-black uppercase text-slate-400">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {auditEntries.map((e, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="p-4 text-[10px] font-mono text-slate-400">{e.timestamp}</td>
                    <td className="p-4">
                       <div className="text-xs font-bold text-slate-800">{e.user}</div>
                       <div className="text-[9px] text-slate-400 uppercase">{e.role}</div>
                    </td>
                    <td className="p-4 text-[11px] font-bold text-slate-900">{e.action}</td>
                    <td className="p-4">
                       <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${e.newState === 'completed' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                          {e.newState}
                       </span>
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

export default function CaseWorkspacePage() {
  const { caseId } = useParams();
  const [activeTab, setActiveTab] = useState("Evidence Review");
  const [files, setFiles] = useState(evidenceFiles);
  const [batches, setBatches] = useState(evidenceBatches);

  return (
    <AppLayout>
      <div className="flex flex-col h-full bg-slate-50/10 h-screen overflow-hidden">
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
                <div key={i} className="h-7 w-7 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold shadow-sm">U{i}</div>
              ))}
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <Button className="h-9 font-bold px-4 bg-slate-900 text-white shadow-md">Submit Case</Button>
          </div>
        </div>

        <div className="bg-white border-b h-12 flex items-center justify-between px-6 shrink-0 relative z-20 shadow-sm">
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
                {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary shadow-md" />}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-2 border-l pl-6 border-slate-100">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">3 Days Remaining</span>
             </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden relative">
          {activeTab === "Overview" && <OverviewTab />}
          {activeTab === "Evidence Review" && <ExtractionTab files={files} setFiles={setFiles} batches={batches} setBatches={setBatches} />}
          {activeTab === "Analysis" && <AnalysisTab />}
          {activeTab === "Reports" && <ReportsTab />}
          {activeTab === "Review" && <ReviewTab />}
          {activeTab === "Audit Trail" && <AuditTrailTab />}
        </div>
      </div>
    </AppLayout>
  );
}
