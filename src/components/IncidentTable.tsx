import { ArrowUpRight, ChevronRight, Circle } from "lucide-react";
import type { IncidentEvent } from "../types/incident";
import { formatRelativeTime } from "../utils/format";
import SeverityBadge from "./SeverityBadge";
import StatusBadge from "./StatusBadge";

interface IncidentTableProps {
  incidents: IncidentEvent[];
  onSelect: (incident: IncidentEvent) => void;
  loading?: boolean;
  compact?: boolean;
}

export default function IncidentTable({ incidents, onSelect, loading = false, compact = false }: IncidentTableProps) {
  return (
    <div className="table-wrap">
      <table className="incident-table">
        <thead><tr>
          <th>Incident</th><th>Service / system</th><th>Severity</th><th>Status</th><th>Confidence</th><th>Received</th><th aria-label="Open" />
        </tr></thead>
        <tbody>
          {loading && <tr><td colSpan={7} className="table-message"><span className="spinner" />Loading incidents…</td></tr>}
          {!loading && incidents.length === 0 && <tr><td colSpan={7} className="table-message">No incidents match these filters.</td></tr>}
          {!loading && incidents.map((incident) => (
            <tr key={incident.incidentId} className="clickable-row" onClick={() => onSelect(incident)} tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter") onSelect(incident); }}>
              <td><div className="incident-id">{incident.incidentId}</div><div className="incident-title">{incident.title}</div></td>
              <td><div className="service-name">{incident.service}</div><div className="environment-label"><Circle size={6} fill="currentColor" />{incident.environment}</div></td>
              <td><SeverityBadge severity={incident.severity} /></td>
              <td><StatusBadge status={incident.status} /></td>
              <td><div className="confidence-cell"><span className="confidence-track"><span style={{ width: `${incident.confidence}%` }} /></span><span>{incident.confidence ? `${incident.confidence}%` : "—"}</span></div></td>
              <td className="time-cell">{formatRelativeTime(incident.timestamp)}</td>
              <td><span className="row-open">{compact ? <ArrowUpRight size={16} /> : <ChevronRight size={16} />}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
