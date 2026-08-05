import { useState, useEffect, useCallback } from "react";

export type ReadinessStatus = 
  | "NOT_CHECKED"
  | "CHECKING"
  | "READY"
  | "NEEDS_ATTENTION"
  | "NOT_READY"
  | "OUTDATED";

export type FindingSeverity = "CRITICAL" | "WARNING" | "SUGGESTION";

export interface ReadinessFinding {
  id: string;
  severity: FindingSeverity;
  title: string;
  description: string;
  impact: string;
  suggestion: string;
  relatedFileId?: string;
  relatedFileName?: string;
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
  findings: ReadinessFinding[];
  previousRunId?: string;
}

export interface AnalysisOverride {
  id: string;
  readinessRunId: string;
  userName: string;
  userRole: string;
  timestamp: string;
  activeFindingCount: number;
  criticalFindingCount: number;
  acknowledgement: boolean;
  reason?: string;
}

const STORAGE_KEY = "investigation_readiness_state_v2";
const EVENT_KEY = "readiness_state_changed_v2";

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
      findings: [],
      previousRunId
    };

    saveState({ ...currentState, runs: [checkingRun, ...currentState.runs], isOutdated: false });

    // Simulate analysis delay
    setTimeout(() => {
      const stateAfterDelay = loadState();
      
      const dummyFindings: ReadinessFinding[] = [
        {
          id: `fnd-${Date.now()}-1`,
          severity: "CRITICAL",
          title: "VIDEO GAGAL DIPROSES",
          description: "File HOPPER_1_converted.mp4 gagal dianalisis oleh sistem.",
          impact: "Informasi visual dan audio dari file ini tidak akan masuk ke proses analisis.",
          suggestion: "Unggah ulang file, periksa format video, atau gunakan versi file lain.",
          relatedFileName: "HOPPER_1_converted.mp4"
        },
        {
          id: `fnd-${Date.now()}-2`,
          severity: "WARNING",
          title: "KONTEKS KEJADIAN MASIH TERBATAS",
          description: "Evidence yang tersedia belum memberikan informasi yang cukup mengenai waktu, lokasi, dan urutan kejadian utama.",
          impact: "Penyusunan kronologi dapat menghasilkan bagian yang belum terverifikasi.",
          suggestion: "Tambahkan dokumen, foto, video, rekaman komunikasi, atau pernyataan saksi yang relevan."
        },
        {
          id: `fnd-${Date.now()}-3`,
          severity: "SUGGESTION",
          title: "SUMBER EVIDENCE MASIH TERBATAS",
          description: "Evidence saat ini didominasi oleh gambar dan video.",
          impact: "Sistem membutuhkan data yang lebih beragam untuk verifikasi silang.",
          suggestion: "Tambahkan sumber pembanding agar hasil investigasi dapat diverifikasi silang."
        }
      ];

      const completedAt = new Date().toISOString();
      const finalStatus: ReadinessStatus = "NOT_READY"; // based on the dummy findings (1 critical, 2 warning/suggestion)

      const finalRun: ReadinessRun = {
        ...checkingRun,
        status: finalStatus,
        completedAt,
        findings: dummyFindings
      };

      const newRuns = [finalRun, ...stateAfterDelay.runs.filter(r => r.id !== checkingRun.id)];
      saveState({ ...stateAfterDelay, runs: newRuns, isOutdated: false });

    }, 2500);
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
    const criticalCount = latest.findings.filter(f => f.severity === "CRITICAL").length;

    const newOverride: AnalysisOverride = {
      id: `ovr-${Date.now()}`,
      readinessRunId: latest.id,
      userName: "Gulang Satriya",
      userRole: "Lead Investigator",
      timestamp: new Date().toISOString(),
      activeFindingCount: latest.findings.length,
      criticalFindingCount: criticalCount,
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
