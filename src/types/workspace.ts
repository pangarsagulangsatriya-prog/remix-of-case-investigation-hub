import { LucideIcon } from "lucide-react";

export type AgentStatus = 'idle' | 'queued' | 'running' | 'paused' | 'stopped' | 'completed' | 'failed' | 'cancelled';

export interface AgentRunHistory {
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

export interface AgentState {
  id: string;
  name: string;
  icon: LucideIcon;
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
    canStop?: boolean;
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
