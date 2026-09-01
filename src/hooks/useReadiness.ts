import { useState, useEffect, useCallback } from "react";

export type ReadinessStatus = 
  | "NOT_CHECKED"
  | "CHECKING"
  | "READY"
  | "NEEDS_ATTENTION"
  | "NOT_READY"
  | "OUTDATED";

export type RequirementLevel = "REQUIRED" | "RECOMMENDED" | "OPTIONAL";
export type RequirementStatus = "FULFILLED" | "MISSING" | "BROKEN" | "NEEDS_VERIFICATION";

export interface EvidenceRequirementResult {
  id: string;
  label: string;
  category: string;
  level: RequirementLevel;
  status: RequirementStatus;
  downstreamImpact: string[];
  matchedFiles: {
    id: string;
    name: string;
    processingStatus: string;
    aiMatchConfidence?: "High" | "Medium" | "Low";
    aiMatchCategory?: string;
  }[];
  requiredDesc?: string;
  uploadAdvice?: string;
  formatHint?: string;
  issue?: string;
  impact?: string;
  recommendation?: string;
  relatedInfo?: { title: string; type: string; desc: string; statusBadge: string; typeDesc?: string };
  verificationFocus?: { issue: string; advice: string };
  actionAdvice?: { title: string; helper: string };
  impactDetails?: { label: string; desc: string }[];
  extractedValues?: { value: string; label: string }[];
}

export interface EvidenceSnapshot {
  totalFiles: number;
  completedFiles: number;
  errorFiles: number;
  processingFiles: number;
  fileIds: string[];
}

export interface ReadinessRun {
  id: string;
  runNumber: number;
  triggeredBy: "MANUAL";
  triggeredByUser: {
    id: string;
    name: string;
    role: string;
  };
  startedAt: string;
  completedAt: string;
  status: ReadinessStatus;
  evidenceSnapshot: EvidenceSnapshot;
  results: EvidenceRequirementResult[];
  previousRunId?: string;
  categories: {
    name: string;
    status: ReadinessStatus;
    fulfilledCount: number;
    totalCount: number;
    downstreamImpact: string[];
  }[];
}

export interface AnalysisOverride {
  id: string;
  readinessRunId: string;
  userName: string;
  userRole: string;
  timestamp: string;
  acknowledgement: boolean;
  reason?: string;
  missingRequired: string[];
  brokenRequired: string[];
}

const STORAGE_KEY_PREFIX = "investigation_readiness_state_v7";
const EVENT_KEY_PREFIX = "readiness_state_changed_v6";

interface ReadinessState {
  runs: ReadinessRun[];
  overrides: AnalysisOverride[];
  isOutdated: boolean;
}

const getDefaultState = (): ReadinessState => ({
  runs: [],
  overrides: [],
  isOutdated: false,
});

const getStorageKey = (caseId?: string) => caseId ? `${STORAGE_KEY_PREFIX}_${caseId}` : STORAGE_KEY_PREFIX;
const getEventKey = (caseId?: string) => caseId ? `${EVENT_KEY_PREFIX}_${caseId}` : EVENT_KEY_PREFIX;

const loadState = (caseId?: string): ReadinessState => {
  try {
    const data = localStorage.getItem(getStorageKey(caseId));
    return data ? JSON.parse(data) : getDefaultState();
  } catch {
    return getDefaultState();
  }
};

const saveState = (caseId: string | undefined, state: ReadinessState) => {
  localStorage.setItem(getStorageKey(caseId), JSON.stringify(state));
  window.dispatchEvent(new Event(getEventKey(caseId)));
};

const DEMO_CASES = ["1CC209A3"];
let hasResetDemoCases = false;

export const useReadiness = (caseId?: string) => {
  const [state, setState] = useState<ReadinessState>(() => loadState(caseId));

  useEffect(() => {
    // Reset state on full page reload for demo cases
    if (caseId && DEMO_CASES.includes(caseId) && !hasResetDemoCases) {
      localStorage.removeItem(getStorageKey(caseId));
      hasResetDemoCases = true;
      const emptyState = getDefaultState();
      setState(emptyState);
      window.dispatchEvent(new Event(getEventKey(caseId)));
    }
  }, [caseId]);

  useEffect(() => {
    const handleSync = () => {
      setState(loadState(caseId));
    };
    window.addEventListener(getEventKey(caseId), handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      window.removeEventListener(getEventKey(caseId), handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, [caseId]);

  const latestRun = state.runs.length > 0 ? state.runs[0] : null;

  const currentStatus: ReadinessStatus = latestRun 
    ? (state.isOutdated ? "OUTDATED" : latestRun.status)
    : "NOT_CHECKED";

  const confirmVerification = useCallback((reqId: string, isMatch: boolean) => {
    const currentState = loadState(caseId);
    if (!currentState.runs || currentState.runs.length === 0) return;
    
    const latest = currentState.runs[0];
    if (latest.status === "CHECKING") return;
    
    const updatedResults = latest.results.map(req => {
      if (req.id === reqId) {
        return {
          ...req,
          status: (isMatch ? "FULFILLED" : "MISSING") as RequirementStatus,
          issue: undefined,
          matchedFiles: isMatch ? req.matchedFiles : []
        };
      }
      return req;
    });
    
    const { categories, finalStatus } = evaluateReadiness(updatedResults);
    
    const updatedRun: ReadinessRun = {
      ...latest,
      results: updatedResults,
      categories,
      status: finalStatus
    };
    
    const newRuns = [updatedRun, ...currentState.runs.slice(1)];
    saveState(caseId, { ...currentState, runs: newRuns });
  }, [caseId]);

  const evaluateReadiness = (results: EvidenceRequirementResult[]) => {
        const CATEGORIES = [
      { name: "01 FAKTA KEJADIAN", impact: ["Fact & Chronology", "PEEPO"] },
      { name: "02 WAWANCARA INVESTIGASI", impact: ["Fact & Chronology", "Actor", "PEEPO", "IPLS"] },
      { name: "03 PEOPLE / PERSONEL", impact: ["Actor", "PEEPO", "IPLS"] },
      { name: "04 PART / UNIT & KOMPONEN", impact: ["Fact & Chronology", "PEEPO", "IPLS"] },
      { name: "05 POSITION / LOKASI KEJADIAN", impact: ["Fact & Chronology", "PEEPO", "IPLS"] },
      { name: "06 PAPER / DOKUMEN KERJA", impact: ["PEEPO", "IPLS", "Prevention"] }
    ];

    const categories = CATEGORIES.map(cat => {
      const catResults = results.filter(r => r.category === cat.name);
      const totalCount = catResults.length;
      const fulfilledCount = catResults.filter(r => r.status === "FULFILLED").length;
      const missingRequired = catResults.filter(r => r.level === "REQUIRED" && r.status === "MISSING").length;
      const brokenRequired = catResults.filter(r => r.level === "REQUIRED" && r.status === "BROKEN").length;
      const needsVerification = catResults.filter(r => r.status === "NEEDS_VERIFICATION").length;
      
      let status: ReadinessStatus = "READY";
      if (missingRequired > 0 || brokenRequired > 0 || catResults.some(r => r.status === "BROKEN")) {
        status = "NOT_READY";
      } else if (needsVerification > 0 || catResults.some(r => r.status === "MISSING")) {
        status = "NEEDS_ATTENTION";
      }
      
      return {
        name: cat.name,
        status,
        fulfilledCount,
        totalCount,
        downstreamImpact: cat.impact
      };
    });

    let finalStatus: ReadinessStatus = "READY";
    if (categories.some(c => c.status === "NOT_READY")) {
      finalStatus = "NOT_READY";
    } else if (categories.some(c => c.status === "NEEDS_ATTENTION")) {
      finalStatus = "NEEDS_ATTENTION";
    }
    
    return { categories, finalStatus };
  };

  const triggerManualCheck = useCallback(() => {
    const currentState = loadState(caseId);
    
    const ts = new Date().toISOString();
    const runNumber = currentState.runs.length + 1;
    const evidenceSnapshot = {
        totalFiles: 4,
        completedFiles: 3,
        errorFiles: 1,
        processingFiles: 0,
        fileIds: ["file-1", "file-2", "file-3", "file-4"]
    };

    const newRun: ReadinessRun = {
      id: `run-${Date.now()}`,
      runNumber,
      triggeredBy: "MANUAL",
      triggeredByUser: {
        id: "usr-1",
        name: "Gulang Satriya",
        role: "Lead Investigator"
      },
      startedAt: ts,
      completedAt: "", 
      status: "CHECKING",
      evidenceSnapshot,
      results: [],
      categories: [],
      previousRunId: loadState(caseId).runs[0]?.id
    };

    saveState(caseId, {
      ...loadState(caseId),
      runs: [newRun, ...loadState(caseId).runs],
      isOutdated: false
    });

    // Simulate analysis delay
    setTimeout(() => {
      const stateAfterDelay = loadState(caseId);
      
      const dummyResults: EvidenceRequirementResult[] = [
  // A. FAKTA KEJADIAN
  {
    id: "req-fakta-1",
    label: "CCTV / Video Kejadian",
    category: "01 FAKTA KEJADIAN",
    level: "REQUIRED",
    status: "FULFILLED",
    downstreamImpact: ["Fact & Chronology", "PEEPO"],
    matchedFiles: [
      { id: "file-1", name: "CCTV_Front_Cam_0857.mp4", processingStatus: "DONE" },
      { id: "file-1b", name: "CCTV_Dashcam_TR3219.mp4", processingStatus: "DONE" },
      { id: "file-1c", name: "Video_Amatir_Operator.mp4", processingStatus: "DONE" },
      { id: "file-1d", name: "Rekaman_Drone_Pasca_Kejadian.mp4", processingStatus: "DONE" }
    ],
    requiredDesc: "Rekaman yang memperlihatkan kejadian, aktivitas sebelum kejadian, atau kondisi segera setelah kejadian. Rekaman dapat berasal dari CCTV, dashcam, DMS, video HP, atau kamera lain.",
    uploadAdvice: "Upload file video asli bila tersedia. Pilih rekaman yang mencakup beberapa saat sebelum dan sesudah kejadian. Jika ada beberapa sudut kamera, upload semuanya pada checklist yang sama.",
    formatHint: "Video: MP4, MOV, AVI"
  },
  {
    id: "req-fakta-2",
    label: "Foto Kondisi Kejadian",
    category: "01 FAKTA KEJADIAN",
    level: "REQUIRED",
    status: "NEEDS_VERIFICATION",
    downstreamImpact: ["Fact & Chronology", "PEEPO"],
    matchedFiles: [
      { id: "file-2", name: "Screenshot_2025-12-04_085746.png", processingStatus: "DONE" },
      { id: "file-2b", name: "Screenshot_2025-12-04_085759.png", processingStatus: "DONE" },
      { id: "file-2c", name: "Foto_Tire_Marks.jpg", processingStatus: "DONE" },
      { id: "file-2d", name: "Foto_Posisi_Tergelincir.jpg", processingStatus: "DONE" }
    ],
    requiredDesc: "Foto yang memperlihatkan kondisi lokasi, orang, unit, benda, atau kerusakan pada saat atau segera setelah kejadian.",
    uploadAdvice: "Upload foto asli dengan sudut yang cukup jelas. Utamakan foto keseluruhan lalu foto detail. Hindari hanya mengirim foto yang sudah terlalu banyak dipotong jika file asli masih tersedia.",
    formatHint: "Image: JPG/JPEG, PNG",
    verificationFocus: {
      issue: "Belum ditemukan foto asli lokasi kejadian tanpa anotasi.",
      advice: "Jika tersedia, upload foto asli kondisi unit dan lokasi setelah kejadian."
    }
  },
  
  // B. WAWANCARA INVESTIGASI
  {
    id: "req-wi-1",
    label: "Bukti Wawancara",
    category: "02 WAWANCARA INVESTIGASI",
    level: "REQUIRED",
    status: "FULFILLED",
    downstreamImpact: ["Fact & Chronology", "Actor", "PEEPO"],
    matchedFiles: [
      { id: "file-4", name: "BAP_Operator_TR3219.pdf", processingStatus: "DONE" },
      { id: "file-5", name: "Audio_Wawancara_Danang.mp3", processingStatus: "DONE" }
    ],
    requiredDesc: "Dokumen keterangan atau rekaman audio/video dari pelaku, saksi, atau orang yang terlibat. Keterangan ini membantu menyusun urutan kejadian dan tindakan masing-masing orang.",
    uploadAdvice: "Upload BAP, dokumen wawancara, atau rekaman suara selengkap mungkin. Beberapa bukti dapat diunggah pada checklist yang sama.",
    formatHint: "Document / Audio / Video"
  },
  {
    id: "req-wi-2",
    label: "Wawancara Saksi / Pihak Terkait",
    category: "02 WAWANCARA INVESTIGASI",
    level: "RECOMMENDED",
    status: "FULFILLED",
    downstreamImpact: ["Fact & Chronology", "Actor", "PEEPO", "IPLS"],
    matchedFiles: [
       { id: "file-4b", name: "BAP_Saksi_Pengawas.pdf", processingStatus: "DONE" }
    ],
    requiredDesc: "Keterangan saksi, pengawas, mekanik, responder, medic, engineer, atau pihak lain yang mengetahui bagian tertentu dari kejadian.",
    uploadAdvice: "Upload semua keterangan yang relevan, terutama jika berasal dari sudut pandang berbeda. Tidak perlu digabung menjadi satu file.",
    formatHint: "Document"
  },
  // C. PEOPLE / PERSONEL
  {
    id: "req-ppl-1",
    label: "Identitas & Peran Personel",
    category: "03 PEOPLE / PERSONEL",
    level: "REQUIRED",
    status: "FULFILLED",
    downstreamImpact: ["Actor", "PEEPO"],
    matchedFiles: [
      { id: "file-ccr-1", name: "Metadata Form CCR (Saksi, Operator, dll)", processingStatus: "DONE" }
    ],
    requiredDesc: "Bukti yang membantu mengidentifikasi korban, pelaku, operator, saksi, pengawas, responder, atau personel lain beserta fungsi mereka pada saat kejadian. Data ini secara default diambil dari form laporan CCR.",
    uploadAdvice: "Upload kartu identitas kerja jika ada personel tambahan yang tidak terdaftar di laporan CCR awal.",
    formatHint: "Data CCR / Document"
  },
  {
    id: "req-ppl-2",
    label: "Kehadiran / Briefing Sebelum Kerja",
    category: "03 PEOPLE / PERSONEL",
    level: "RECOMMENDED",
    status: "MISSING",
    downstreamImpact: ["Actor", "PEEPO", "IPLS"],
    matchedFiles: [],
    requiredDesc: "Bukti bahwa personel hadir atau mengikuti aktivitas sebelum pekerjaan, seperti P5M, toolbox meeting, briefing, atau daftar hadir.",
    uploadAdvice: "Upload form atau daftar hadir yang menunjukkan tanggal, nama peserta, dan aktivitas/briefing jika tersedia. Pastikan tulisan atau tanda tangan masih dapat dibaca.",
    formatHint: "Document",
    impactDetails: [
       { label: "Actor", desc: "Kehadiran personel sebelum shift tidak dapat dipastikan." },
       { label: "PEEPO", desc: "Pemahaman personel terhadap instruksi harian tidak dapat dinilai." }
    ]
  },
  {
    id: "req-ppl-3",
    label: "Kompetensi / Otorisasi",
    category: "03 PEOPLE / PERSONEL",
    level: "REQUIRED",
    status: "NEEDS_VERIFICATION",
    downstreamImpact: ["Actor", "PEEPO", "IPLS"],
    matchedFiles: [],
    requiredDesc: "Bukti mengenai kompetensi, pelatihan, lisensi, SIMPER, sertifikasi, atau otorisasi yang relevan dengan pekerjaan saat kejadian.",
    uploadAdvice: "Upload dokumen kompetensi yang berkaitan langsung dengan pekerjaan atau alat yang terlibat. Bila ada beberapa kompetensi, cukup unggah yang relevan dengan case.",
    formatHint: "Document",
    relatedInfo: {
      title: "Data Interview_TR-3219.pdf",
      type: "Document",
      typeDesc: "PDF",
      desc: "Danang Sapto Wahono memiliki pengalaman mengoperasikan unit 777 dan Komatsu 465.",
      statusBadge: "⚠ Informasi kompetensi ditemukan dalam wawancara"
    },
    verificationFocus: {
      issue: "Belum ditemukan dokumen kompetensi atau otorisasi sebagai evidence terpisah.",
      advice: "Jika tersedia, upload scan SIMPER atau sertifikat kompetensi asli."
    },
    actionAdvice: {
       title: "Upload bukti kompetensi",
       helper: "Upload scan dokumen fisik untuk keperluan verifikasi."
    }
  },

  // D. PART / UNIT & KOMPONEN
  {
    id: "req-part-1",
    label: "Foto Part / Komponen Terkait",
    category: "04 PART / UNIT & KOMPONEN",
    level: "REQUIRED",
    status: "FULFILLED",
    downstreamImpact: ["Fact & Chronology", "PEEPO"],
    matchedFiles: [
       { id: "file-p1", name: "komponen_retarder.pdf", processingStatus: "DONE" }
    ],
    requiredDesc: "Foto komponen, alat, material, APD, atau benda lain yang berhubungan langsung dengan mekanisme kejadian.",
    uploadAdvice: "Upload foto keseluruhan dan detail komponen yang relevan. Jika ada titik kerusakan, kontak, aus, patah, terbakar, atau posisi abnormal, sertakan foto detailnya.",
    formatHint: "Image"
  },
  {
    id: "req-part-2",
    label: "Kondisi Unit / Kerusakan",
    category: "04 PART / UNIT & KOMPONEN",
    level: "RECOMMENDED",
    status: "FULFILLED",
    downstreamImpact: ["Fact & Chronology", "PEEPO", "IPLS"],
    matchedFiles: [
      { id: "file-9", name: "kerusakan_TR3219.pdf", processingStatus: "DONE" }
    ],
    requiredDesc: "Bukti kondisi unit atau aset setelah kejadian, termasuk area kerusakan atau kondisi abnormal yang ditemukan.",
    uploadAdvice: "Upload foto dari beberapa sisi bila memungkinkan. Jangan hanya memilih foto paling dekat; foto keseluruhan membantu memahami posisi kerusakan terhadap unit.",
    formatHint: "Image"
  },
  {
    id: "req-part-3",
    label: "P2H / Pemeriksaan Harian",
    category: "04 PART / UNIT & KOMPONEN",
    level: "REQUIRED",
    status: "MISSING",
    downstreamImpact: ["PEEPO", "IPLS"],
    matchedFiles: [],
    requiredDesc: "Form atau catatan pemeriksaan unit sebelum digunakan, untuk melihat kondisi awal serta temuan yang sudah diketahui sebelum kejadian.",
    uploadAdvice: "Upload form P2H pada tanggal atau shift yang terkait dengan kejadian. Pastikan identitas unit, operator, tanggal, hasil pemeriksaan, dan bagian approval terbaca bila tersedia.",
    formatHint: "Document",
    relatedInfo: {
      title: "Data Interview_TR-3219.pdf",
      type: "Document",
      typeDesc: "PDF",
      desc: "Dokumen wawancara menyebut operator melakukan P2H sebelum unit digunakan.",
      statusBadge: "Informasi pendukung · bukan evidence P2H"
    },
    actionAdvice: {
       title: "Upload P2H",
       helper: "Upload form P2H yang digunakan pada shift kejadian."
    },
    impactDetails: [
       { label: "PEEPO", desc: "Kondisi unit sebelum operasi belum dapat diverifikasi." },
       { label: "IPLS", desc: "Pelaksanaan kontrol pemeriksaan pra-operasi belum dapat dibandingkan dengan kondisi aktual." }
    ]
  },
  {
    id: "req-part-4",
    label: "Pemeriksaan / Pengecekan Teknis",
    category: "04 PART / UNIT & KOMPONEN",
    level: "RECOMMENDED",
    status: "MISSING",
    downstreamImpact: ["PEEPO", "IPLS"],
    matchedFiles: [],
    requiredDesc: "Hasil pemeriksaan teknis setelah kejadian, seperti inspection report, mechanical check, electrical check, fault finding, atau laporan engineer/vendor.",
    uploadAdvice: "Upload laporan yang paling dekat dengan kejadian dan berkaitan dengan komponen yang diperiksa. Lampiran foto atau hasil pengukuran sebaiknya tetap disertakan.",
    formatHint: "Document",
    impactDetails: [
       { label: "PEEPO", desc: "Kondisi mekanikal komponen penyebab insiden belum dapat divalidasi." }
    ]
  },

  // E. POSITION / LOKASI KEJADIAN
  {
    id: "req-pos-1",
    label: "Foto / Sketsa Lokasi Kejadian",
    category: "05 POSITION / LOKASI KEJADIAN",
    level: "REQUIRED",
    status: "FULFILLED",
    downstreamImpact: ["Fact & Chronology", "PEEPO"],
    matchedFiles: [
      { id: "file-11", name: "sketsa_lokasi_C2H.pdf", processingStatus: "DONE" }
    ],
    requiredDesc: "Dokumentasi area kejadian yang menunjukkan bentuk lokasi, akses, objek di sekitar, dan titik kejadian.",
    uploadAdvice: "Upload foto wide shot terlebih dahulu, lalu detail area penting. Sketsa sederhana tetap dapat digunakan bila posisi objek dapat dipahami.",
    formatHint: "Image / Document"
  },
  {
    id: "req-pos-2",
    label: "Posisi Orang / Unit / Objek",
    category: "05 POSITION / LOKASI KEJADIAN",
    level: "RECOMMENDED",
    status: "FULFILLED",
    downstreamImpact: ["Fact & Chronology", "PEEPO"],
    matchedFiles: [
       { id: "file-12", name: "posisi_unit_tergelincir.pdf", processingStatus: "DONE" }
    ],
    requiredDesc: "Bukti yang memperlihatkan posisi relatif orang, unit, material, atau objek sebelum, saat, atau setelah kejadian.",
    uploadAdvice: "Upload foto, sketsa, atau diagram dengan penanda posisi jika tersedia. Jika menggunakan foto udara, beri penanda titik kejadian atau objek penting bila memang sudah tersedia dalam dokumen.",
    formatHint: "Image / Document"
  },
  {
    id: "req-pos-3",
    label: "Peta / Layout Lokasi",
    category: "05 POSITION / LOKASI KEJADIAN",
    level: "RECOMMENDED",
    status: "FULFILLED",
    downstreamImpact: ["Fact & Chronology", "PEEPO", "IPLS"],
    matchedFiles: [
      { id: "file-7", name: "Site_Plan_Pit_C2H.pdf", processingStatus: "DONE" }
    ],
    requiredDesc: "Peta, site plan, layout, topografi, atau gambar area yang membantu memahami hubungan antarposisi dalam skala yang lebih luas.",
    uploadAdvice: "Upload versi layout yang paling relevan dengan periode kejadian. Bila ada legenda, skala, koordinat, atau arah utara, pertahankan bagian tersebut.",
    formatHint: "Document"
  },
  {
    id: "req-pos-4",
    label: "Dimensi / Pengukuran",
    category: "05 POSITION / LOKASI KEJADIAN",
    level: "RECOMMENDED",
    status: "FULFILLED",
    downstreamImpact: ["PEEPO", "IPLS"],
    matchedFiles: [
       { id: "file-13", name: "Rekonstruksi_Lokasi_TR3219.pdf", processingStatus: "DONE" }
    ],
    requiredDesc: "Data ukuran yang relevan terhadap mekanisme kejadian, seperti jarak, kemiringan, crossfall, clearance, elevasi, lebar, tinggi, atau ukuran objek.",
    uploadAdvice: "Upload hasil pengukuran, gambar engineering, atau foto yang mencantumkan nilai ukur. Jangan menghapus satuan atau titik referensinya.",
    formatHint: "Document",
    extractedValues: [
       { label: "Jarak jejak menuju tanggul", value: "82.8 m" },
       { label: "Lebar jalan", value: "10.95 m" },
       { label: "Tinggi tanggul", value: "1.82 m" }
    ]
  },

  // F. PAPER / DOKUMEN KERJA
  {
    id: "req-paper-1",
    label: "HIRA / Risk Assessment",
    category: "06 PAPER / DOKUMEN KERJA",
    level: "REQUIRED",
    status: "FULFILLED",
    downstreamImpact: ["PEEPO", "IPLS"],
    matchedFiles: [
       { id: "file-14", name: "HIRA_Hauling_Pit_C2H.pdf", processingStatus: "DONE" }
    ],
    requiredDesc: "Dokumen identifikasi bahaya dan pengendalian risiko untuk aktivitas yang berkaitan dengan kejadian.",
    uploadAdvice: "Upload HIRA/JSA/risk assessment yang berlaku saat pekerjaan dilakukan. Jika ada beberapa revisi, prioritaskan versi yang berlaku pada tanggal kejadian.",
    formatHint: "Document"
  },
  {
    id: "req-paper-2",
    label: "SOP / Instruksi Kerja",
    category: "06 PAPER / DOKUMEN KERJA",
    level: "REQUIRED",
    status: "MISSING",
    downstreamImpact: ["PEEPO", "IPLS"],
    matchedFiles: [],
    requiredDesc: "Prosedur, IK, work instruction, atau panduan yang mengatur langkah kerja yang dilakukan saat kejadian.",
    uploadAdvice: "Upload prosedur yang benar-benar berlaku pada aktivitas tersebut. Bila dokumen memiliki nomor dan revisi, pastikan halaman identitas dokumen ikut terunggah.",
    formatHint: "Document",
    relatedInfo: {
      title: "Data Interview_TR-3219.pdf",
      type: "Document",
      typeDesc: "PDF",
      desc: "Dalam wawancara terdapat pembahasan mengenai penggunaan service brake, retarder dan tindakan saat jalan basah.",
      statusBadge: "Disebut dalam wawancara"
    },
    actionAdvice: {
       title: "Upload SOP / IK",
       helper: "Upload prosedur operasional yang relevan."
    },
    impactDetails: [
       { label: "PEEPO", desc: "Kesesuaian tindakan operator terhadap prosedur belum dapat dinilai." },
       { label: "IPLS", desc: "Expected control belum memiliki referensi." }
    ]
  },
  {
    id: "req-paper-3",
    label: "Standar / Control Reference",
    category: "06 PAPER / DOKUMEN KERJA",
    level: "RECOMMENDED",
    status: "MISSING",
    downstreamImpact: ["PEEPO", "IPLS", "Prevention"],
    matchedFiles: [],
    requiredDesc: "Standar teknis, safety standard, engineering standard, high-risk control, atau referensi lain yang menetapkan kondisi atau kontrol yang seharusnya dipenuhi.",
    uploadAdvice: "Upload standar yang berkaitan langsung dengan pekerjaan, alat, area, atau bahaya pada case. Tidak perlu mengunggah seluruh library standar yang tidak berhubungan dengan kejadian.",
    formatHint: "Document",
    impactDetails: [
       { label: "IPLS", desc: "Control effectiveness belum memiliki pembanding." },
       { label: "Prevention", desc: "Rekomendasi belum memiliki control reference yang cukup kuat." }
    ]
  }
];


      const { categories, finalStatus } = evaluateReadiness(dummyResults);
      const completedAt = new Date().toISOString();

      const finalRun: ReadinessRun = {
        ...newRun,
        status: finalStatus,
        completedAt,
        results: dummyResults,
        categories
      };

      const newRuns = [finalRun, ...stateAfterDelay.runs.filter(r => r.id !== newRun.id)];
      saveState(caseId, { ...stateAfterDelay, runs: newRuns, isOutdated: false });

    }, 3500);
  }, [caseId]);

  const markAsOutdated = useCallback(() => {
    const currentState = loadState(caseId);
    if (!currentState.isOutdated && currentState.runs.length > 0) {
      saveState(caseId, {
        ...currentState,
        isOutdated: true
      });
    }
  }, [caseId]);

  const overrideAnalysis = useCallback((userName: string, userRole: string, reason?: string) => {
    const currentState = loadState(caseId);
    if (!currentState.runs || currentState.runs.length === 0) return;
    
    const latest = currentState.runs[0];
    
    const missingReq = latest.results.filter(r => r.level === "REQUIRED" && r.status === "MISSING").map(r => r.label);
    const brokenReq = latest.results.filter(r => r.level === "REQUIRED" && r.status === "BROKEN").map(r => r.label);

    const newOverride: AnalysisOverride = {
      id: `ovr-${Date.now()}`,
      readinessRunId: latest.id,
      userName: userName,
      userRole: userRole,
      timestamp: new Date().toISOString(),
      missingRequired: missingReq,
      brokenRequired: brokenReq,
      acknowledgement: true,
      reason
    };

    const newOverrides = [newOverride, ...currentState.overrides];
    saveState(caseId, {
      ...currentState,
      overrides: newOverrides
    });
  }, [caseId]);

  const clearHistory = useCallback(() => {
    saveState(caseId, getDefaultState());
  }, [caseId]);

  const recheckRequirement = useCallback((reqId: string) => {
    const currentState = loadState(caseId);
    if (!currentState.runs || currentState.runs.length === 0) return;
    
    const latest = currentState.runs[0];
    if (latest.status === "CHECKING") return;
    
    // Create a promise to simulate network delay so the UI can show a spinner
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const stateAfterDelay = loadState(caseId);
        const currentLatest = stateAfterDelay.runs[0];
        
        const updatedResults = currentLatest.results.map(req => {
          if (req.id === reqId) {
            return {
              ...req,
              status: "FULFILLED" as RequirementStatus,
              issue: undefined,
              matchedFiles: req.matchedFiles.map(mf => ({
                ...mf,
                processingStatus: "DONE"
              }))
            };
          }
          return req;
        });
        
        const { categories, finalStatus } = evaluateReadiness(updatedResults);
        
        const updatedRun: ReadinessRun = {
          ...currentLatest,
          results: updatedResults,
          categories,
          status: finalStatus
        };
        
        const newRuns = [updatedRun, ...stateAfterDelay.runs.slice(1)];
        saveState(caseId, { ...stateAfterDelay, runs: newRuns });
        resolve();
      }, 1500); // 1.5s delay for spinner
    });
  }, [caseId]);

  const isOverrideActive = state.overrides.length > 0 && latestRun && state.overrides[0].readinessRunId === latestRun.id;

  return {
    runs: state.runs,
    latestRun,
    currentStatus,
    isOutdated: state.isOutdated,
    isOverrideActive,
    triggerManualCheck,
    markAsOutdated,
    overrideAnalysis,
    clearHistory,
    confirmVerification,
    recheckRequirement
  };
};
