import { ArrowLeft, CircleAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { incidentApi } from "../api/incidents";
import AnalysisSummaryCard from "../components/AnalysisSummaryCard";
import PageHeading from "../components/PageHeading";
import SeverityBadge from "../components/SeverityBadge";
import { formatDateTime } from "../utils/format";
import type { IncidentEvent } from "../types/incident";

export default function IncidentDetailPage() {
  const { incidentId = "" } = useParams();
  const [incident, setIncident] = useState<IncidentEvent | null>(null);
  const [loadedFor, setLoadedFor] = useState("");
  const [loadError, setLoadError] = useState<{ id: string; message: string } | null>(null);
  const loading = loadedFor !== incidentId;
  const error = loadError?.id === incidentId ? loadError.message : "";
  useEffect(() => {
    let active = true;
    incidentApi.getById(incidentId).then((data) => { if (active) setIncident(data); })
      .catch((cause: unknown) => { if (active) setLoadError({ id: incidentId, message: cause instanceof Error ? cause.message : "Unable to load incident." }); })
      .finally(() => { if (active) setLoadedFor(incidentId); });
    return () => { active = false; };
  }, [incidentId]);

  return <div className="page-view">
    <Link className="back-link" to="/incidents"><ArrowLeft size={15} />Back to incident monitor</Link>
    {loading && <div className="panel loading-panel"><span className="spinner" />Loading incident…</div>}
    {error && <div className="error-banner"><CircleAlert size={16} /><span>{error}</span></div>}
    {incident && incident.incidentId === incidentId && <>
      <PageHeading eyebrow={`INCIDENT / ${incident.incidentId}`} title={incident.title} description={`${incident.service} · ${incident.environment} · received ${formatDateTime(incident.timestamp)}`} action={<SeverityBadge severity={incident.severity} />} />
      <div className="detail-page-grid"><div><AnalysisSummaryCard analysis={incident.analysis} /><section className="panel raw-payload detail-payload"><div className="section-title-row"><div><h3>Original event payload</h3><p>Complete source event from the backend</p></div></div><pre>{JSON.stringify(incident.originalPayload, null, 2)}</pre></section></div><aside className="panel detail-timeline"><h3>Processing timeline</h3>{[["Event received", incident.timeline.received], ["Published to Kafka", incident.timeline.publishedToKafka], ["Analyzed by AI", incident.timeline.analyzedByAI], ["Response generated", incident.timeline.responseGenerated]].map(([label, value]) => <div className="detail-timeline-row" key={label}><span className={value ? "timeline-complete" : ""} /><div><strong>{label}</strong><time>{formatDateTime(value)}</time></div></div>)}</aside></div>
    </>}
  </div>;
}
