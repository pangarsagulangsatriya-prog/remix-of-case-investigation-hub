export const audioDiarizationData = [
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

export const runHistory = [
  { runId: "RUN-046", agent: "PEEPO Reasoning", triggeredBy: "Sarah Chen", inputSource: "Evidence Batch B1, B2", status: "completed", createdAt: "2026-04-08 10:12" },
  { runId: "RUN-045", agent: "Fact & Chronology", triggeredBy: "System (Auto)", inputSource: "witness_statement_operator_A.mp3", status: "completed", createdAt: "2026-04-08 09:30" },
  { runId: "RUN-044", agent: "IPLS Classification", triggeredBy: "Ahmed Khan", inputSource: "incident_report_initial.pdf", status: "completed", createdAt: "2026-04-07 15:20" },
];

export const videoTimeframesData = [
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

export const SECTION_DESCRIPTIONS: Record<string, string> = {
    "Case Summary": "Primary information regarding the current investigation.",
    "Evidence Overview": "Aggregated view of all digital assets and forensic status.",
    "Forensic Actors": "Key individuals and entities identified during scanning.",
    "General Detection": "AI identification of primary subjects and objects.",
    "Environment & PPE": "Contextual analysis of safety equipment and hazards.",
    "AI Extraction Metadata": "Technical logs regarding model performance.",
    "Entity Extraction": "Specific nouns and organizations discovered.",
    "Semantic Summary": "Deep contextual understanding of the document.",
    "Forensic Metadata": "Technical integrity data and OCR confidence.",
    "Audio Properties": "Metadata regarding the capture quality and source.",
    "Speaker Profiles": "Detailed analysis of unique voices found.",
    "Communication Events": "Key conversational milestones and interactions.",
    "Timeline & Facts": "Chronological reconstruction of events.",
    "Risks, Gaps, Review": "Potential anomalies and investigation blockers."
};

export const videoExtractionRefined = {
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
  ]
};
