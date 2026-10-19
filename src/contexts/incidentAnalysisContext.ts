import { createContext } from "react";
import type { IncidentEvent } from "../types/incident";

export interface IncidentAnalysisContextValue {
  incidents: IncidentEvent[];
  recordIncident: (incident: IncidentEvent) => void;
  sessionError: string;
}

export const IncidentAnalysisContext = createContext<IncidentAnalysisContextValue | null>(null);
