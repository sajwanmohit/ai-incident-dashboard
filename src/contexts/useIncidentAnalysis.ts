import { useContext } from "react";
import { IncidentAnalysisContext } from "./incidentAnalysisContext";

export function useIncidentAnalysis() {
  const context = useContext(IncidentAnalysisContext);
  if (!context) throw new Error("useIncidentAnalysis must be used within IncidentAnalysisProvider.");
  return context;
}
