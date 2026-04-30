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
export const documentDerivationMock = {
  document_metadata: {
    inferred_document_type: "Interview BAP / Incident Investigation Data Interview",
    date_mentioned: "5 November 2024",
    location_mentioned: ["Jl Kutilang", "KM 2", "KM 6", "ROM C2HS", "CPP", "Simpang Kaniungan", "Disposal Utara"],
    personnel_involved: [
      "Syaiful Anwar (Operator TC-4007)",
      "Aris Achdiat (Control Room)",
      "Fathurohman (Mine Foreman)",
      "Yusup (Act. Mine Supervisor)",
      "Pak Bambang",
      "Pak Hendro",
      "Pak Thobias",
      "Pak Tommy",
      "Pak Senda",
      "Pak El",
      "Pak Musthofa",
      "Pak Dhehave",
      "Pak Yuda",
      "Bu Nabilah",
      "Pak Elfizar"
    ]
  },
  quick_summary_and_analysis: {
    executive_summary: "This document records interviews following a truck roll-over incident (rebah) involving unit TC-4007 (noted as TC-4008 in the header) driven by Syaiful Anwar. The accident occurred on November 5, 2024, at Jalan Kutilang, primarily caused by operator fatigue/micro-sleep during the 4th night shift after technical delays and ineffective fatigue interventions.",
    critical_findings: [
      "Operator experienced fatigue and micro-sleep leading to the unit hitting a berm and overturning at Jalan Kutilang.",
      "Technical issues (ABS malfunction) at 23:15 caused the driver to wait until 01:02, increasing fatigue risk.",
      "Control Room detected a 'look down' alert at 22:15, but intervention was limited to a WhatsApp message to the foreman who cleared the driver based on a radio check.",
      "Communication gaps: Use of private WhatsApp (japri) instead of radio for fatigue alerts to 'save face' prevented broader situational awareness.",
      "Operator reported noise at home from neighboring construction (molen) affecting sleep quality during the day."
    ]
  },
  readability_status: "High - Clear",
  lossless_chunks: [
    {
      sequence_id: 1,
      structural_context: "Header and Operator Metadata",
      extracted_content: "DATA INTERVIEW TC-4008 REBAH (5 NOVEMBER 2024 PUKUL 01.34 WITA). PELAKU (OPERATOR TC-4007). Nama: Syaiful Anwar, NIK: 16385, SID: FGXOY, Pendidikan: SMA (Biologi), DOH: 4 November 2021. Pengalaman Kerja: MTN 3 tahun, BC 3 tahun. Jabatan: Driver DT 40 TON, Umur: 45 Tahun. Jam tidur: 6 Jam (08.00 – 11.00), (13.00 – 16.00). Hari kerja: Hari ke 4 malam.",
      visual_description: "Title page with bold header and bulleted personal details of the operator."
    },
    {
      sequence_id: 2,
      structural_context: "Operator Chronology",
      extracted_content: "Kronologi: Pada tanggal 4 November setelah shift malam saya tidur jam 08.00 – 11.00 wita, bangun untuk makan, tidur lagi jam 13.00 – 16.00 wita. Pukul 18.00 fingerprint & P5M di ROM C2HS. Jam 23.15 alarm ABS malfunction di CPP, melapor ke timbangan. Jam 01.02 pengawas (Pak Yusuf) datang menyuruh unit ke workshop. Di KM 2 berhenti karena fatigue, cuci muka. Di KM 6 Alert ABS normal kembali, melapor ke pengawas diminta lanjut operasi. Jam 01.25 di simpang kaniungan mata berat tapi terus jalan. Mendekati tanjakan kutilang tidak sadar, menyerempet tanggul, banting steering agar tidak masuk jurang, berakhir rebah.",
      visual_description: "Narrative bullet points describing the timeline from the start of the shift to the accident."
    },
    {
      sequence_id: 3,
      structural_context: "Interview Q&A - Operator Part 1",
      extracted_content: "Pak Bambang: Anak 2, SD kelas 2 & 4. Gangguan tidur: tetangga bangun rumah, ada molen 2 minggu berisik jarak 50m. P5M: saya speak up fatigue tapi diminta pindah ke tempat aman (rest area/rom). Pak Hendro: Pulang kerja nunggu anak. Istri ijin beli HP. Paham program fatigue. Jam 23.00-01.05 di CPP merokok, ngopi, tanya petugas timbangan soal ABS. Pak Thobias: Kewajiban operator shift kritis: check fatigue, sapa teman, pasang bendera. Tanda fatigue: kepala berat, beban di mata.",
      visual_description: "Transcript of questions from various interviewers addressed to the operator Syaiful Anwar."
    },
    {
      sequence_id: 4,
      structural_context: "Interview Q&A - Operator Part 2",
      extracted_content: "Pak Tommy: Keadaan jalan sunyi malam itu. Ingin diperbaiki: baiknya cek unit sekalian ke workshop. Pak Senda: Niat istirahat di workshop tapi di KM 6 ABS normal jadi lanjut. Pak Musthofa: Pernah alert fatigue 2 minggu lalu (yawning). DMS bermanfaat mengingatkan fokus. Pak Dhehave: Setelah kejadian kontak radio sunyi. Main game dengan anak di rumah tapi tidak saat istirahat kerja. Pak Yuda: Saat kejadian terlihat jurang langsung berbelok. TKP gelap dari simpang menuju pit.",
      visual_description: "Continuation of the operator's interview transcript covering fatigue management and road conditions."
    },
    {
      sequence_id: 5,
      structural_context: "Control Room Personnel Metadata and Chronology",
      extracted_content: "PENGAWAS (PETUGAS CONTROL ROOM). Nama: Aris Achdiat, NIK: 16506, SID: E91J6, Jabatan: Petugas Control Room, Umur: 32 tahun. Jam tidur: 6 jam, Hari kerja: Hari ke 2. Kronologi: Jam 22.15 alert TC-4007 look down di DMS. Video di-japri ke pengawas ROM C2HS. Balasan: driver kondisi baik. Jam 01.35 alert masuk lagi, saat putar video TC 4007 mengalami kecelakaan tunggal.",
      visual_description: "Metadata section for the Control Room officer followed by their perspective of the incident timeline."
    },
    {
      sequence_id: 6,
      structural_context: "Interview Q&A - Control Room",
      extracted_content: "Pak Bambang: Fokus alert fatigue. Siang bisa 1000 alert, malam 500. Pak Hendro: Kendala CR: jaringan dan komunikasi hauling terbatas. Alert TC 4007: klik DMS 2, Jimu 3. Look down jam 22.15. Pak Elfizar: Alert 22.15 tidak distop karena mau masuk ROM. Pak Senda: Kriteria stop: 3x temuan (pribadi), standar baru 1x stop. Pak Dhehave: Kenapa tidak langsung kontak Syaiful? Langsung ke pengawas. Alasan tidak lewat radio: menjaga nama baik beliau karena fatigue diawal shift.",
      visual_description: "Transcript of the Control Room officer explaining the monitoring process and intervention decisions."
    },
    {
      sequence_id: 7,
      structural_context: "ROM Foreman Personnel Metadata and Chronology",
      extracted_content: "PENGAWAS (PENGAWAS ROM). Nama: Fathurohman, NIK: 16218, SID: YRGLW, Jabatan: Mine Foreman, Umur: 42 tahun. Kronologi: Pukul 22.33 dikontak petugas CR untuk cek Syaiful. Syaiful jawab aman dan fit. Jam 23.40 info TC 4007 breakdown di CPP. Jam 01.53 telpon dari DMS tanya posisi unit. Pukul 02.05 kabar TC 4007 rebah di Jl Kutilang. Pak Hendro: Syaiful hari ke-4 (hari kritis). Pak Bambang: Kenapa tidak diturunkan? Karena menjawab aman dengan semangat.",
      visual_description: "Metadata and interview transcript for the ROM Foreman regarding his communication with the driver."
    },
    {
      sequence_id: 8,
      structural_context: "Hauling Supervisor Personnel Metadata and Chronology",
      extracted_content: "PENGAWAS (PENGAWAS HAULING MOBILE). Nama: Yusup, NIK: 11508, SID: Y14BN, Jabatan: Act. Mine Supervisor. Kronologi: Jam 01.00 bangunkan rekan di CPP termasuk Syaiful. Syaiful lapor ABS malfunction. Disuruh bawa ke workshop. Jam 01.30 info radio 'urgent di jalan kutilang'. Meluncur ke TKP, unit rebah, Syaiful sudah di luar. Pak Tommy: Miss-nya adalah Pak Syaiful tidak mau speak up, mungkin sungkan. Pak Dhehave: Memungkinkan CR di KM 7? Sangat membantu.",
      visual_description: "Final section covering the mobile supervisor's actions and general feedback on the incident."
    }
  ]
};
export const imageDerivationMock = {
  document_metadata: {
    inferred_document_type: "Sketsa Kejadian / Rekonstruksi Insiden",
    date_mentioned: "05 November 2024",
    location_mentioned: ["Jalan Kutilang", "Jalur Kosongan", "Jalur Muatan", "Tanggul Muatan", "Tanggul Kosongan"],
    personnel_involved: ["Operator TC-4007 (Nama tidak tertera pada dokumen visual)"]
  },
  quick_summary_and_analysis: {
    executive_summary: "Dokumen ini merupakan sketsa teknis rekonstruksi kejadian unit TC-4007 yang mengalami insiden rebah di Jalan Kutilang pada 05 November 2024. Analisis visual menunjukkan unit bergerak dari jalur kosongan melintasi jalan menuju tanggul jalur muatan, menyisir tanggul sepanjang 16 meter, hingga akhirnya terbalik tanpa adanya bukti pengereman di lokasi.",
    critical_findings: [
      "Tidak ditemukan jejak pengereman di area kejadian, mengindikasikan potensi micro-sleep atau kegagalan mekanis rem yang tidak sempat diantisipasi.",
      "Unit menyimpang dari lintasan normal (titik A ke B) sejauh 44,9 meter sebelum menabrak tanggul.",
      "Kontak fisik dengan tanggul setinggi 1,7 meter terjadi sepanjang 16 meter (titik 2) sebelum unit kehilangan keseimbangan.",
      "Kondisi cuaca dilaporkan cerah, sehingga faktor visibilitas akibat cuaca buruk dapat dikesampingkan.",
      "Lebar jalan di area kejadian memadai (20,8m - 21,7m) dengan kemiringan (grade) rendah antara 1% hingga 2%."
    ]
  },
  readability_status: "High - Clear",
  lossless_chunks: [
    {
      sequence_id: 1,
      structural_context: "Header",
      extracted_content: "TANGGAL 05 November 2024. PT MTN-SMO_TC-4007 Rebah di Jalan Kutilang arah kosongan.",
      visual_description: "Judul dokumen di bagian atas dengan teks tebal berisi informasi waktu, unit, dan lokasi kejadian."
    },
    {
      sequence_id: 2,
      structural_context: "Visual Sketch / Map Analysis",
      extracted_content: "SKETSA KEJADIAN TC-4007",
      visual_description: "Diagram pandangan atas (aerial sketch) area Jalan Kutilang. Menunjukkan lintasan unit dengan garis putus-putus berwarna putih dari sisi kiri (Kosongan) ke sisi kanan (Muatan). Terdapat unit DT yang digambarkan dalam posisi rebah (terbalik) di sisi kanan jalan."
    },
    {
      sequence_id: 3,
      structural_context: "Incident Facts Callout",
      extracted_content: "Fakta Kejadian: Cuaca dilokasi kejadian: Cerah. Tidak terdapat jejak pengereman.",
      visual_description: "Kotak teks di pojok kanan atas yang merinci kondisi lingkungan dan temuan fisik di TKP."
    },
    {
      sequence_id: 4,
      structural_context: "Marker Definitions (A-D)",
      extracted_content: "A: Posisi awal unit di jalur kosongan mulai mengarah ke arah muatan. B: Unit mulai menaiki tanggul. C: Unit mulai oleng dan hilang keseimbangan. D: Posisi akhir unit TC 4007 dalam kondisi rebah.",
      visual_description: "Legenda alfabetis yang menjelaskan kronologi fisik pergerakan unit berdasarkan titik-titik yang ditandai pada peta sketsa."
    },
    {
      sequence_id: 5,
      structural_context: "Technical Measurements (1-5)",
      extracted_content: "1: Lebar Jalan titik 1: 21.7M, Grade: 1%. 2: Jarak Tyre menyisir tanggul: 16M. 3: Lebar jalan titik 3: 20.8M, Grade: 2%. 4: Tinggi tanggul kosongan: 1.5 M. 5: Tinggi tanggul Muatan: 1.7 M.",
      visual_description: "Daftar dimensi teknis jalan dan struktur tanggul yang diukur di lokasi kejadian (titik ukur ditandai dengan kotak biru pada sketsa)."
    },
    {
      sequence_id: 6,
      structural_context: "Distance Calculations",
      extracted_content: "Jarak titik A ke B: 44.9m. jarak titik B ke C: 17m.",
      visual_description: "Informasi jarak tempuh unit selama fase kehilangan kendali hingga mulai menaiki tanggul dan akhirnya terbalik."
    }
  ]
};
export const videoDerivationMock = {
  video_metadata: {
    video_source_type: "Dashcam / Cabin Cam",
    total_duration: "02:24",
    scene_environment_notes: "Interior kabin kendaraan berat di lingkungan operasi tambang pada malam hari."
  },
  executive_video_summary: "Video ini merekam insiden keselamatan kerja di dalam kabin kendaraan berat (kemungkinan Dump Truck) yang beroperasi di area tambang pada malam hari. Operator menunjukkan tanda-tanda kelelahan ekstrem, termasuk menguap, menggosok wajah, dan mengalami microsleep berulang kali. Insiden puncak terjadi pada detik ke-02:14.5 ketika operator tertidur sejenak, menyebabkan kendaraan menabrak objek di depan dan operator terlempar ke arah kemudi.",
  ontology_mapping: {
    identified_objects: [
      {
        object_class: "Personnel",
        object_identifier: "Operator_Kendaraan",
        overall_role_or_state: "Operator mengalami kelelahan ekstrem dan microsleep berulang kali selama operasi."
      },
      {
        object_class: "Equipment/Vehicle",
        object_identifier: "Kendaraan_Berat",
        overall_role_or_state: "Kendaraan berat beroperasi di jalan tambang dengan kecepatan bervariasi sebelum terjadi tabrakan."
      }
    ],
    kinetic_events_or_hazards: [
      {
        event_type: "Insiden Tabrakan",
        linked_objects: [
          "Operator_Kendaraan",
          "Kendaraan_Berat"
        ],
        event_description: "Kendaraan mengalami tabrakan mendadak akibat operator tertidur (microsleep), menyebabkan operator terlempar ke depan dan menabrak kemudi."
      }
    ]
  },
  video_blocks: [
    {
      time_block: "00:00 - 00:19",
      visual_summary: "Operator terlihat menguap lebar and menggosok wajahnya, menunjukkan tanda-tanda awal kelelahan. Kendaraan berhenti.",
      confidence_score: "High - Visual jelas dan pencahayaan memadai.",
      critical_audio_cue: "",
      contains_critical_incident: false
    },
    {
      time_block: "00:19 - 00:40",
      visual_summary: "Kendaraan bergerak hingga 40 km/h. Operator mulai mengantuk dengan mata sering tertutup (microsleep).",
      confidence_score: "High - Visual jelas dan pencahayaan memadai.",
      critical_audio_cue: "",
      contains_critical_incident: false
    },
    {
      time_block: "00:40 - 01:10",
      visual_summary: "Operator menunjukkan kelelahan parah, sering menutup mata and menggosok wajah. Kecepatan turun ke 25-30 km/h.",
      confidence_score: "High - Visual jelas dan pencahayaan memadai.",
      critical_audio_cue: "",
      contains_critical_incident: false
    },
    {
      time_block: "01:10 - 02:13",
      visual_summary: "Operator sangat mengantuk with mata hampir tertutup terus menerus. Kecepatan tetap rendah (20-30 km/h).",
      confidence_score: "High - Visual jelas dan pencahayaan memadai.",
      critical_audio_cue: "",
      contains_critical_incident: false
    },
    {
      time_block: "02:13 - 02:24",
      visual_summary: "Operator tertidur sejenak sebelum kendaraan menabrak objek. Operator terlempar ke depan menabrak kemudi.",
      confidence_score: "High - Visual jelas dan pencahayaan memadai.",
      contains_critical_incident: true,
      critical_incident_details: {
        exact_timestamp: "02:14.5",
        incident_type: "Tabrakan akibat Microsleep",
        kinematics_description: "Kendaraan mengalami deceleration mendadak saat menabrak objek, menyebabkan operator terlempar ke depan and menabrak kemudi karena tidak menggunakan sabuk pengaman atau sabuk tidak efektif."
      }
    }
  ],
  investigation_notes: {
    unclear_or_missing_info: [
      "Kondisi jalan di luar kabin tidak terlihat karena video hanya menampilkan interior kabin (DMS).",
      "Objek yang ditabrak tidak terlihat dalam frame video.",
      "Tidak ada data audio yang tersedia untuk analisis suara insiden atau komunikasi operator."
    ]
  }
};

export const audioDerivationMock = {
  document_metadata: {
    inferred_document_type: "Audio Forensic Transcript / Diarization",
    date_mentioned: "05 November 2024",
    location_mentioned: ["KM 12 Hauling", "KM 7 Hauling", "Control Room DMS", "Workshop"],
    personnel_involved: ["Aris (DMS Control Room)", "Tommy (Hauling Supervisor)", "Syaiful (Operator)", "Yusup (Mobile Supervisor)"]
  },
  quick_summary_and_analysis: {
    executive_summary: "Rekaman audio ini merinci kegagalan komunikasi dan validasi intervensi kelelahan pada shift malam 05 November 2024. Poin kritis meliputi riwayat 41 kali deviasi fatigue Operator Saiful, alert 'Lockdown' pada pukul 22:15 yang hanya divalidasi via WhatsApp tanpa bukti visual, serta adanya 'Radio Dead Zone' di KM 12 dan KM 7 yang menghambat koordinasi saat insiden terjadi pukul 01:35.",
    critical_findings: [
      "Operator Saiful memiliki 41 riwayat deviasi fatigue sejak Week 10 hingga Week 41, mengindikasikan akumulasi kelelahan kronis.",
      "Intervensi terhadap alert 'Lockdown' (22:15) dilakukan secara informal via WA; Pengawas tidak meminta bukti foto/visual kondisi operator.",
      "Terjadi hambatan komunikasi radio di area KM 12 ke hauling, menyebabkan keterlambatan respon darurat.",
      "Operator terdeteksi mengalami micro-sleep sesaat sebelum unit rebah di Jalan Kutilang.",
      "Terdapat indikasi rasa 'sungkan' atau enggan melaporkan kondisi lelah dari sisi operator kepada pengawas (Missed Speak-up)."
    ]
  },
  sentiment_analysis: {
    overall_tone: "Analytical / Forensic",
    emotional_peaks: [
      { timestamp: "01:30", speaker: "Tommy", sentiment: "Urgent", context: "Reporting 'Urgent di Jalan Kutilang' via radio." },
      { timestamp: "01:40", speaker: "Aris", sentiment: "Stressed", context: "Managing emergency channel focus after visual confirmation of accident." }
    ]
  },
  lossless_chunks: [
    {
      sequence_id: 1,
      structural_context: "Fatigue History Disclosure",
      extracted_content: "Ada juga banyak di rekapan juga sampai dari week 10 sampai week 41 itu 41 kali (Saiful). Catatannya banyak fatigue. Kami sering intens mengontrol mereka.",
      visual_description: "DMS Control Room recap data analysis."
    },
    {
      sequence_id: 2,
      structural_context: "Intervention Protocol Failure",
      extracted_content: "Jam 22:15 ada alert lockdown-nya Pak Saiful. Sudah diintervensi komunikasi dua arah sama Pak Saiful, beliau baik-baik saja. Minta evidence lanjut (foto)? Enggak. Karena saya yakin chat itu sudah memastikan.",
      visual_description: "Validation of WhatsApp-based informal intervention."
    },
    {
      sequence_id: 3,
      structural_context: "Communication Infrastructure Failure",
      extracted_content: "Radio enggak nyampe. KM 12 ke hauling enggak nyampe radio. Ada di KM 12 dan KM 7 itu radio enggak nyampe. Fokus di jalur emergency saja.",
      visual_description: "Radio signal coverage gap identification."
    },
    {
      sequence_id: 4,
      structural_context: "Post-Incident Forensic Feedback",
      extracted_content: "Syaiful tidak mau speak up, mungkin sungkan. Memungkinkan CR (Control Room) di KM 7? Sangat membantu.",
      visual_description: "Management feedback on reporting culture and infrastructure improvements."
    }
  ]
};

