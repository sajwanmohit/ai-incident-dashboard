import { http } from "./http";
import type { IncidentAnalysisResult, IncidentCreatePayload, IncidentEvent } from "../types/incident";

export const incidentApi = {
  async list(): Promise<IncidentEvent[]> {
    const { data } = await http.get<IncidentEvent[]>("/api/v1/incidents");
    return data;
  },

  async getById(id: string): Promise<IncidentEvent> {
    const { data } = await http.get<IncidentEvent>(`/api/v1/incidents/${encodeURIComponent(id)}`);
    return data;
  },

  async create(payload: IncidentCreatePayload): Promise<IncidentEvent> {
    const { data } = await http.post<IncidentAnalysisResult>("/api/v1/incidents", {
      ...payload,
      message: payload.description,
    }, { timeout: 0 });
    const analysis = {
      ...data,
      confidence: data.confidence <= 1 ? data.confidence * 100 : data.confidence,
    };
    return {
      ...payload,
      status: "ANALYZED",
      confidence: analysis.confidence,
      analysis,
      originalPayload: { ...payload, message: payload.description },
      timeline: {},
    };
  },
};
