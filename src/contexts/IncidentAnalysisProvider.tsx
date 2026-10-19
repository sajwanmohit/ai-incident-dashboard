import { useCallback, useMemo, useState, type ReactNode } from "react";
import type { IncidentEvent } from "../types/incident";
import { IncidentAnalysisContext } from "./incidentAnalysisContext";

export function IncidentAnalysisProvider({ children }: { children: ReactNode }) {
  const [incidents, setIncidents] = useState<IncidentEvent[]>([]);

  const recordIncident = useCallback((incident: IncidentEvent) => {
    setIncidents((current) => [
      incident,
      ...current.filter((item) => item.incidentId !== incident.incidentId),
    ]);
  }, []);

  const value = useMemo(() => ({ incidents, recordIncident }), [incidents, recordIncident]);

  return <IncidentAnalysisContext.Provider value={value}>{children}</IncidentAnalysisContext.Provider>;
}
