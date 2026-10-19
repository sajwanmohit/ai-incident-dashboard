import { ChevronRight, Clock3, Copy, ExternalLink, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useIncidentAnalysis } from "../contexts/useIncidentAnalysis";
import type { IncidentEvent } from "../types/incident";
import { formatDateTime } from "../utils/format";
import AnalysisSummaryCard from "./AnalysisSummaryCard";
import SeverityBadge from "./SeverityBadge";

const timelineSteps = [
  ["received", "Event received"],
  ["publishedToKafka", "Published to Kafka"],
  ["analyzedByAI", "Analyzed by AI"],
  ["responseGenerated", "Response generated"],
] as const;

export default function IncidentDetailsDrawer({ incident, onClose }: { incident: IncidentEvent | null; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const { recordIncident } = useIncidentAnalysis();
  if (!incident) return null;

  const copyPayload = async () => {
    await navigator.clipboard.writeText(JSON.stringify(incident.originalPayload, null, 2));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="drawer-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <aside className="details-drawer" role="dialog" aria-modal="true" aria-label={`Incident ${incident.incidentId}`}>
        <div className="drawer-topbar"><span className="eyebrow">INCIDENT DETAILS</span><button className="icon-button" onClick={onClose} aria-label="Close details"><X size={18} /></button></div>
        <div className="drawer-content">
          <div className="drawer-incident-head"><div className="incident-id">{incident.incidentId}</div><SeverityBadge severity={incident.severity} /><h2>{incident.title}</h2><p>{incident.description}</p><div className="drawer-meta"><span>{incident.service}</span><span className="meta-divider" />{incident.environment}<span className="meta-divider" />{formatDateTime(incident.timestamp)}</div></div>
          <AnalysisSummaryCard analysis={incident.analysis} />
          <section className="panel drawer-timeline">
            <div className="section-title-row"><div><h3>Processing timeline</h3><p>From request to analysis</p></div><Clock3 size={17} className="muted-icon" /></div>
            <div className="timeline-list">{timelineSteps.map(([key, label], index) => {
              const value = incident.timeline[key];
              return <div className={`timeline-item ${value ? "is-complete" : ""}`} key={key}><span className="timeline-marker">{value ? <span /> : index + 1}</span><div><strong>{label}</strong><time>{formatDateTime(value)}</time></div><ChevronRight size={14} /></div>;
            })}</div>
          </section>
          <section className="panel raw-payload">
            <div className="section-title-row"><div><h3>Original event payload</h3><p>Raw request body</p></div><button className="copy-button" onClick={() => void copyPayload()}><Copy size={13} />{copied ? "Copied" : "Copy JSON"}</button></div>
            <pre>{JSON.stringify(incident.originalPayload, null, 2)}</pre>
          </section>
        </div>
        <div className="drawer-footer"><Link className="button button-primary full-width" to={`/insights/${encodeURIComponent(incident.incidentId)}`} onClick={() => { recordIncident(incident); onClose(); }}>Open full analysis <ExternalLink size={15} /></Link></div>
      </aside>
    </div>
  );
}
