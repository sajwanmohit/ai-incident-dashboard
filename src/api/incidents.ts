import { http, useMockData } from "./http";
import { mockIncidents, mockLogs } from "../data/mockData";
import type { IncidentCreatePayload, IncidentEvent, LogEntry } from "../types/incident";

const pause = (milliseconds = 350) => new Promise((resolve) => window.setTimeout(resolve, milliseconds));

export const incidentApi = {
  async list(): Promise<IncidentEvent[]> {
    if (useMockData) {
      await pause();
      return [...mockIncidents].sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp));
    }
    const { data } = await http.get<IncidentEvent[]>("/api/v1/incidents");
    return data;
  },

  async getById(id: string): Promise<IncidentEvent> {
    if (useMockData) {
      await pause(200);
      const incident = mockIncidents.find((item) => item.incidentId === id);
      if (!incident) throw new Error(`Incident ${id} was not found.`);
      return incident;
    }
    const { data } = await http.get<IncidentEvent>(`/api/v1/incidents/${encodeURIComponent(id)}`);
    return data;
  },

  async create(payload: IncidentCreatePayload): Promise<IncidentEvent> {
    if (useMockData) {
      await pause(700);
      const result: IncidentEvent = {
        ...payload,
        status: "ANALYZED",
        confidence: 92,
        analysis: {
          severity: payload.severity,
          confidence: 92,
          summary: `The ${payload.service} incident is consistent with a ${payload.severity.toLowerCase()} operational issue. Review the recommended actions and validate service health.`,
          rootCause: "Initial analysis based on the submitted incident description; validate against service telemetry.",
          riskExplanation: "If left unaddressed, this issue may affect dependent production workflows.",
          recommendedActions: ["Check recent deployments and service metrics", "Review upstream and downstream dependencies", "Confirm recovery with the on-call team"],
        },
        originalPayload: { ...payload, source: "dashboard" },
        timeline: {
          received: new Date().toISOString(),
          publishedToKafka: new Date(Date.now() + 250).toISOString(),
          analyzedByAI: new Date(Date.now() + 500).toISOString(),
          responseGenerated: new Date(Date.now() + 650).toISOString(),
        },
      };
      mockIncidents.unshift(result);
      const entries: LogEntry[] = [
        { id: `${payload.incidentId}-api`, incidentId: payload.incidentId, level: "INFO", stage: "API request", message: "Incident submitted from dashboard.", timestamp: result.timeline.received! },
        { id: `${payload.incidentId}-llm`, incidentId: payload.incidentId, level: "INFO", stage: "LLM analysis", message: "Analysis response received and validated.", timestamp: result.timeline.responseGenerated! },
      ];
      mockLogs.unshift(...entries);
      return result;
    }
    const { data } = await http.post<IncidentEvent>("/api/v1/incidents", payload);
    return data;
  },
};
