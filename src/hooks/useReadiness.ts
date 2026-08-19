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

const STORAGE_KEY = "investigation_readiness_state_v6";
const EVENT_KEY = "readiness_state_changed_v6";

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

  const confirmVerification = useCallback((reqId: string, isMatch: boolean) => {
    const currentState = loadState();
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
    saveState({ ...currentState, runs: newRuns });
  }, []);

  const evaluateReadiness = (results: EvidenceRequirementResult[]) => {
    const CATEGORIES = [
      { name: "01 EVENT TRUTH", impact: ["Fact & Chronology"] },
      { name: "02 HUMAN TESTIMONY", impact: ["Fact", "Actor", "PEEPO"] },
      { name: "03 PEOPLE", impact: ["Actor", "PEEPO"] },
      { name: "04 PART / TECHNICAL", impact: ["Fact", "PEEPO", "IPLS"] },
      { name: "05 POSITION", impact: ["Fact", "Chronology", "PEEPO"] },
      { name: "06 PAPER / CONTROL", impact: ["PEEPO", "IPLS"] }
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
    const currentState = loadState();
    
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
      completedAt: "", 
      status: "CHECKING",
      evidenceSnapshot: {
        totalFiles: 4,
        completedFiles: 3,
        errorFiles: 1,
        processingFiles: 0,
        fileIds: ["file-1", "file-2", "file-3", "file-4"]
      },
      results: [],
      categories: [],
      previousRunId
    };

    saveState({ ...currentState, runs: [checkingRun, ...currentState.runs], isOutdated: false });

    // Simulate analysis delay
    setTimeout(() => {
      const stateAfterDelay = loadState();
      
      const dummyResults: EvidenceRequirementResult[] = [
        {
          id: "req-et-1",
          label: "Video kejadian lapangan",
          category: "01 EVENT TRUTH",
          level: "REQUIRED",
          status: "BROKEN",
          downstreamImpact: ["Fact & Chronology"],
          matchedFiles: [
            { id: "file-1", name: "HOPPER_1_converted.mp4", processingStatus: "ERROR" }
          ],
          requiredDesc: "Video utama yang merekam kejadian atau kondisi area lapangan.",
          issue: "File ditemukan, namun konten video belum berhasil diproses.",
          impact: "Rekonstruksi urutan kejadian belum dapat menggunakan evidence video ini.",
        },
        {
          id: "req-et-2",
          label: "CCTV",
          category: "01 EVENT TRUTH",
          level: "RECOMMENDED",
          status: "MISSING",
          downstreamImpact: ["Fact & Chronology"],
          matchedFiles: [],
          requiredDesc: "Rekaman CCTV di sekitar lokasi kejadian.",
          issue: "Belum ada rekaman CCTV yang tersedia.",
        },
        {
          id: "req-et-3",
          label: "Foto pengamatan lapangan",
          category: "01 EVENT TRUTH",
          level: "REQUIRED",
          status: "NEEDS_VERIFICATION",
          downstreamImpact: ["Fact & Chronology"],
          matchedFiles: [
            { 
              id: "file-2", 
              name: "Screenshot_2026-07-01.png", 
              processingStatus: "DONE",
              aiMatchConfidence: "High",
              aiMatchCategory: "Event Truth → Scene Photo"
            }
          ],
          requiredDesc: "Dokumentasi foto yang memperlihatkan kondisi peralatan, area, atau posisi setelah kejadian.",
          issue: "Sistem mendeteksi foto lapangan, namun perlu konfirmasi dari investigator.",
        },
        {
          id: "req-et-4",
          label: "Reliable event timestamp",
          category: "01 EVENT TRUTH",
          level: "REQUIRED",
          status: "FULFILLED",
          downstreamImpact: ["Fact & Chronology"],
          matchedFiles: [
            { id: "file-3", name: "GPS_Log_HD785.csv", processingStatus: "DONE" }
          ],
        },
        {
          id: "req-ht-1",
          label: "BAP / Berita Acara Pemeriksaan",
          category: "02 HUMAN TESTIMONY",
          level: "REQUIRED",
          status: "FULFILLED",
          downstreamImpact: ["Fact", "Actor", "PEEPO"],
          matchedFiles: [
            { id: "file-4", name: "BAP_Operator_HD785.pdf", processingStatus: "DONE" }
          ],
        },
        {
          id: "req-ht-2",
          label: "Audio wawancara",
          category: "02 HUMAN TESTIMONY",
          level: "RECOMMENDED",
          status: "FULFILLED",
          downstreamImpact: ["Fact", "Actor", "PEEPO"],
          matchedFiles: [
            { id: "file-5", name: "wawancara_operator_01.mp3", processingStatus: "DONE" }
          ],
        },
        {
          id: "req-ht-3",
          label: "Transcript wawancara",
          category: "02 HUMAN TESTIMONY",
          level: "RECOMMENDED",
          status: "FULFILLED",
          downstreamImpact: ["Fact", "Actor", "PEEPO"],
          matchedFiles: [
            { id: "file-6", name: "transcript_operator_01.pdf", processingStatus: "DONE" }
          ],
        },
        {
          id: "req-ppl-1",
          label: "Identity & Competency",
          category: "03 PEOPLE",
          level: "REQUIRED",
          status: "MISSING",
          downstreamImpact: ["Actor", "PEEPO"],
          matchedFiles: [],
          issue: "Dokumen identitas dan kompetensi belum tersedia.",
        },
        {
          id: "req-pt-1",
          label: "Component / equipment photo",
          category: "04 PART / TECHNICAL",
          level: "RECOMMENDED",
          status: "MISSING",
          downstreamImpact: ["Fact", "PEEPO", "IPLS"],
          matchedFiles: [],
        },
        {
          id: "req-pos-1",
          label: "Layout / map",
          category: "05 POSITION",
          level: "REQUIRED",
          status: "FULFILLED",
          downstreamImpact: ["Fact", "Chronology", "PEEPO"],
          matchedFiles: [
            { id: "file-7", name: "Site_Plan_Pit_A.pdf", processingStatus: "DONE" }
          ],
        },
        {
          id: "req-pc-1",
          label: "SOP / IK",
          category: "06 PAPER / CONTROL",
          level: "REQUIRED",
          status: "MISSING",
          downstreamImpact: ["PEEPO", "IPLS"],
          matchedFiles: [],
          issue: "Belum ada SOP, IK, JSA/HIRA, P5M/DOP, atau permit yang dapat digunakan.",
          impact: "Operational control comparison cannot yet be fully evaluated."
        }
      ];

      const { categories, finalStatus } = evaluateReadiness(dummyResults);
      const completedAt = new Date().toISOString();

      const finalRun: ReadinessRun = {
        ...checkingRun,
        status: finalStatus,
        completedAt,
        results: dummyResults,
        categories
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
    clearHistory,
    confirmVerification
  };
};
