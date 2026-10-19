import { useCallback, useMemo, useState, type ReactNode } from "react";
import type { IncidentEvent } from "../types/incident";
import { loadSessionIncidentActivity } from "../utils/sessionIncidentActivity";
import { IncidentAnalysisContext } from "./incidentAnalysisContext";

function loadSavedIncidents(): { incidents: IncidentEvent[]; error: string } {
  try {
    return {
      incidents: loadSessionIncidentActivity().map(({ incident }) => incident),
      error: "",
    };
  } catch (cause) {
    return {
      incidents: [],
      error: cause instanceof Error ? cause.message : "Unable to restore incidents from this browser session.",
    };
  }
}

export function IncidentAnalysisProvider({ children }: { children: ReactNode }) {
  const [saved] = useState(loadSavedIncidents);
  const [incidents, setIncidents] = useState(saved.incidents);

  const recordIncident = useCallback((incident: IncidentEvent) => {
    setIncidents((current) => [
      incident,
      ...current.filter((item) => item.incidentId !== incident.incidentId),
    ]);
  }, []);

  const value = useMemo(
    () => ({ incidents, recordIncident, sessionError: saved.error }),
    [incidents, recordIncident, saved.error],
  );

  return <IncidentAnalysisContext.Provider value={value}>{children}</IncidentAnalysisContext.Provider>;
}
