import type { IncidentStatus } from "../types/incident";
import { toTitleCase } from "../utils/format";

export default function StatusBadge({ status }: { status: IncidentStatus }) {
  return <span className={`status-badge status-${status.toLowerCase()}`}><span className="status-dot" />{toTitleCase(status)}</span>;
}
