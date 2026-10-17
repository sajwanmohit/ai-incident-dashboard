import type { IncidentSeverity } from "../types/incident";

export default function SeverityBadge({ severity }: { severity: IncidentSeverity }) {
  return <span className={`severity-badge severity-${severity.toLowerCase()}`}><span className="severity-dot" />{severity}</span>;
}
