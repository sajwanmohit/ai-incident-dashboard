export type IncidentSeverity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export type IncidentStatus =
  | "RECEIVED"
  | "PROCESSING"
  | "ANALYZED"
  | "RESOLVED"
  | "FAILED";

export interface IncidentAnalysisResult {
  severity: IncidentSeverity;
  confidence: number;
  summary: string;
  recommendedActions: string[];
  rootCause?: string;
  riskExplanation?: string;
}

export interface IncidentTimeline {
  received?: string;
  publishedToKafka?: string;
  analyzedByAI?: string;
  responseGenerated?: string;
}

export interface IncidentEvent {
  incidentId: string;
  service: string;
  environment: string;
  title: string;
  description: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  timestamp: string;
  confidence: number;
  analysis: IncidentAnalysisResult;
  originalPayload: Record<string, unknown>;
  timeline: IncidentTimeline;
}

export type LogLevel = "INFO" | "WARN" | "ERROR";

export interface LogEntry {
  id: string;
  incidentId: string;
  level: LogLevel;
  stage: string;
  message: string;
  timestamp: string;
}

export type IncidentCreatePayload = Pick<
  IncidentEvent,
  "incidentId" | "service" | "environment" | "title" | "description" | "severity" | "timestamp"
>;
