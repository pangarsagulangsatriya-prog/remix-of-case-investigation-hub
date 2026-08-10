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
  matchedFiles: {
    id: string;
    name: string;
    processingStatus: string;
  }[];
  requiredDesc?: string;
  issue?: string;
  impact?: string;
  recommendation?: string;
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

const STORAGE_KEY = "investigation_readiness_state_v5";
const EVENT_KEY = "readiness_state_changed_v5";

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

const loadState = (): ReadinessState => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : getDefaultState();
  } catch {
    return getDefaultState();
  }
};

const saveState = (state: ReadinessState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new Event(EVENT_KEY));
};

export const useReadiness = () => {
  const [state, setState] = useState<ReadinessState>(loadState());

  useEffect(() => {
    const handleSync = () => {
      setState(loadState());
    };
    window.addEventListener(EVENT_KEY, handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      window.removeEventListener(EVENT_KEY, handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  const latestRun = state.runs.length > 0 ? state.runs[0] : null;

  const currentStatus: ReadinessStatus = latestRun 
    ? (state.isOutdated ? "OUTDATED" : latestRun.status)
    : "NOT_CHECKED";

  const triggerManualCheck = useCallback(() => {
    const currentState = loadState();
    
    // Create checking run
    const ts = new Date().toISOString();
    const runNumber = currentState.runs.length + 1;
    const previousRunId = currentState.runs.length > 0 ? currentState.runs[0].id : undefined;

    const checkingRun: ReadinessRun = {
      id: `run-${Date.now()}`,
      runNumber,
      triggeredBy: "MANUAL",
      triggeredByUser: {
        id: "usr-1",
        name: "Gulang Satriya",
        role: "Lead Investigator"
      },
      startedAt: ts,
      completedAt: "", // empty while checking
      status: "CHECKING",
      evidenceSnapshot: {
        totalFiles: 2,
        completedFiles: 1,
        errorFiles: 1,
        processingFiles: 0,
        fileIds: ["file-1", "file-2"]
      },
      results: [],
      previousRunId
    };

    saveState({ ...currentState, runs: [checkingRun, ...currentState.runs], isOutdated: false });

    // Simulate analysis delay
    setTimeout(() => {
      const stateAfterDelay = loadState();
      
      const dummyResults: EvidenceRequirementResult[] = [
        {
          id: "req-1",
          label: "Video kejadian lapangan",
          category: "BUKTI LAPANGAN",
          level: "REQUIRED",
          status: "BROKEN",
          matchedFiles: [
            { id: "file-1", name: "HOPPER_1_converted.mp4", processingStatus: "ERROR" }
          ],
          requiredDesc: "Video utama yang merekam kejadian atau kondisi area lapangan.",
          issue: "File tersedia, namun sistem gagal membaca konten video.",
          impact: "Informasi visual dan audio dari kejadian utama tidak dapat digunakan\nuntuk menyusun kronologi dan memverifikasi fakta.",
          recommendation: "Unggah ulang file asli atau gunakan versi video lain yang dapat diproses."
        },
        {
          id: "req-2",
          label: "Foto pengamatan lapangan",
          category: "BUKTI LAPANGAN",
          level: "REQUIRED",
          status: "FULFILLED",
          matchedFiles: [
            { id: "file-2", name: "Screenshot 2026-07-01 at 10.20.17.png", processingStatus: "DONE" }
          ],
          requiredDesc: "Dokumentasi foto yang memperlihatkan kondisi peralatan, area, atau posisi setelah kejadian.",
          issue: "File tersedia, dapat dibaca, dan sesuai dengan requirement\nfoto pengamatan lapangan.",
          impact: "",
          recommendation: "Tidak ada tindakan lanjutan."
        },
        {
          id: "req-3",
          label: "BAP / Berita Acara Pemeriksaan",
          category: "DOKUMEN FORMAL",
          level: "REQUIRED",
          status: "MISSING",
          matchedFiles: [],
          requiredDesc: "BAP atau dokumen pemeriksaan resmi yang mencatat hasil klarifikasi awal.",
          issue: "Belum ada file yang dipetakan ke requirement ini.",
          impact: "Keterangan formal dari pihak terkait belum tersedia untuk verifikasi silang.",
          recommendation: "Unggah BAP atau dokumen pemeriksaan resmi sebelum Analysis dijalankan."
        },
        {
          id: "req-4",
          label: "Dokumen kronologi awal / laporan awal",
          category: "DOKUMEN FORMAL",
          level: "REQUIRED",
          status: "MISSING",
          matchedFiles: [],
          requiredDesc: "Dokumen tertulis yang mendeskripsikan runtutan kejadian secara kronologis dari laporan awal.",
          issue: "Belum ada file yang dipetakan ke requirement ini.",
          impact: "Kerangka dasar kronologi untuk memandu proses investigasi tidak tersedia.",
          recommendation: "Unggah laporan awal atau dokumen kronologi resmi."
        },
        {
          id: "req-5",
          label: "Audio wawancara operator",
          category: "WAWANCARA & KOMUNIKASI",
          level: "RECOMMENDED",
          status: "MISSING",
          matchedFiles: [],
          requiredDesc: "Rekaman suara dari wawancara langsung dengan operator alat berat yang bertugas.",
          issue: "Belum ada file yang dipetakan ke requirement ini.",
          impact: "Konteks operasional langsung dari sudut pandang operator tidak dapat dianalisis.",
          recommendation: "Unggah rekaman wawancara operator (opsional tapi disarankan)."
        },
        {
          id: "req-6",
          label: "Audio wawancara saksi",
          category: "WAWANCARA & KOMUNIKASI",
          level: "RECOMMENDED",
          status: "MISSING",
          matchedFiles: [],
          requiredDesc: "Rekaman suara dari saksi mata atau rekan kerja di sekitar lokasi kejadian.",
          issue: "Belum ada file yang dipetakan ke requirement ini.",
          impact: "Perspektif pihak ketiga untuk menguatkan atau menantang kronologi utama tidak tersedia.",
          recommendation: "Unggah rekaman wawancara saksi mata jika ada."
        },
        {
          id: "req-7",
          label: "Data waktu kejadian / timestamp pendukung",
          category: "KONTEKS KEJADIAN",
          level: "RECOMMENDED",
          status: "NEEDS_VERIFICATION",
          matchedFiles: [],
          requiredDesc: "Catatan waktu operasional seperti log radio, dispatch log, atau GPS log.",
          issue: "Waktu kejadian tidak dapat divalidasi dari file yang ada.",
          impact: "Sistem tidak dapat mengurutkan kronologi dan mengkorelasikan kejadian secara otomatis.",
          recommendation: "Pastikan file yang diunggah memiliki metadata waktu atau unggah log sistem."
        },
        {
          id: "req-8",
          label: "Bukti fase kontak utama",
          category: "KONTEKS KEJADIAN",
          level: "REQUIRED",
          status: "MISSING",
          matchedFiles: [],
          requiredDesc: "Titik data spesifik yang membuktikan terjadinya titik kontak fisik dalam insiden.",
          issue: "Belum ada file yang dipetakan ke requirement ini.",
          impact: "Sebab akibat utama tidak dapat dipastikan karena tidak ada bukti visual fase kontak.",
          recommendation: "Unggah foto spesifik atau data telemetri yang menunjukkan saat kejadian."
        }
      ];

      let missingRequired = 0;
      let brokenRequired = 0;
      let missingRecommended = 0;
      let verificationRequired = 0;

      dummyResults.forEach(r => {
        if (r.level === "REQUIRED") {
          if (r.status === "MISSING") missingRequired++;
          if (r.status === "BROKEN") brokenRequired++;
        } else {
          if (r.status === "MISSING") missingRecommended++;
          if (r.status === "NEEDS_VERIFICATION") verificationRequired++;
        }
      });

      let finalStatus: ReadinessStatus = "READY";
      if (missingRequired > 0 || brokenRequired > 0) {
        finalStatus = "NOT_READY";
      } else if (missingRecommended > 0 || verificationRequired > 0) {
        finalStatus = "NEEDS_ATTENTION";
      }

      const completedAt = new Date().toISOString();

      const finalRun: ReadinessRun = {
        ...checkingRun,
        status: finalStatus,
        completedAt,
        results: dummyResults
      };

      const newRuns = [finalRun, ...stateAfterDelay.runs.filter(r => r.id !== checkingRun.id)];
      saveState({ ...stateAfterDelay, runs: newRuns, isOutdated: false });

    }, 3500);
  }, []);

  const markAsOutdated = useCallback(() => {
    const currentState = loadState();
    if (currentState.runs.length > 0 && !currentState.isOutdated && currentState.runs[0].status !== "CHECKING") {
      saveState({ ...currentState, isOutdated: true });
    }
  }, []);

  const overrideAnalysis = useCallback((reason: string, ack: boolean) => {
    const currentState = loadState();
    if (!currentState.runs || currentState.runs.length === 0) return;
    
    const latest = currentState.runs[0];
    
    const missingReq = latest.results.filter(r => r.level === "REQUIRED" && r.status === "MISSING").map(r => r.label);
    const brokenReq = latest.results.filter(r => r.level === "REQUIRED" && r.status === "BROKEN").map(r => r.label);

    const newOverride: AnalysisOverride = {
      id: `ovr-${Date.now()}`,
      readinessRunId: latest.id,
      userName: "Gulang Satriya",
      userRole: "Lead Investigator",
      timestamp: new Date().toISOString(),
      missingRequired: missingReq,
      brokenRequired: brokenReq,
      acknowledgement: ack,
      reason
    };

    saveState({ ...currentState, overrides: [newOverride, ...currentState.overrides] });
  }, []);

  const clearHistory = useCallback(() => {
    saveState(getDefaultState());
  }, []);

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
    clearHistory
  };
};
