import { Activity, ArrowRight, ChevronDown, CircleAlert, Gauge, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useIncidents } from "../hooks/useIncidents";
import AnalysisSummaryCard from "../components/AnalysisSummaryCard";
import PageHeading from "../components/PageHeading";
import SeverityBadge from "../components/SeverityBadge";
import { formatDateTime } from "../utils/format";
import type { IncidentEvent } from "../types/incident";

export default function InsightsPage() {
  const { incidentId } = useParams();
  const navigate = useNavigate();
  const { incidents, loading, error, refresh } = useIncidents();
  const [selected, setSelected] = useState("");
  const available = useMemo(() => incidents.filter((incident) => incident.confidence > 0), [incidents]);
  const active: IncidentEvent | undefined = available.find((incident) => incident.incidentId === (incidentId ?? selected)) ?? available[0];

  return <div className="page-view">
    <PageHeading eyebrow="INTELLIGENCE / MODEL OUTPUT" title="Analysis insights" description="Explore AI-generated incident assessments, confidence, and recommended response." action={active ? <label className="select-control insight-select"><span>Incident</span><select value={active.incidentId} onChange={(event) => { setSelected(event.target.value); if (incidentId) navigate(`/insights/${encodeURIComponent(event.target.value)}`); }}>{available.map((incident) => <option key={incident.incidentId} value={incident.incidentId}>{incident.incidentId} · {incident.service}</option>)}</select><ChevronDown size={14} /></label> : undefined} />
    {error && <div className="error-banner"><CircleAlert size={16} /><span>{error}</span><button onClick={() => void refresh()}>Retry</button></div>}
    {loading && !active && <div className="panel loading-panel"><span className="spinner" />Loading analysis results…</div>}
    {!loading && !active && <div className="panel empty-analysis"><Sparkles size={23} /><h3>No completed analyses yet</h3><p>Submit an incident to see its model assessment, or check back when an incident has completed processing.</p><Link to="/create" className="button button-primary">Create incident <ArrowRight size={15} /></Link></div>}
    {active && <>
      <section className="insight-overview panel"><div className="insight-incident"><span className="eyebrow">ANALYSIS TARGET</span><h2>{active.title}</h2><p>{active.incidentId} <span>·</span> {active.service} <span>·</span> {formatDateTime(active.timestamp)}</p></div><div className="insight-score"><div className="confidence-ring" style={{ background: `conic-gradient(#59d5cf ${active.confidence * 3.6}deg, #263248 0deg)` }}><div><strong>{active.confidence}<small>%</small></strong><span>CONFIDENCE</span></div></div></div><div className="insight-severity"><span className="eyebrow">AI-ASSESSED SEVERITY</span><SeverityBadge severity={active.analysis.severity} /><span className="severity-context"><Activity size={14} />Model output</span></div></section>
      <div className="insights-grid"><div className="insights-main"><AnalysisSummaryCard analysis={active.analysis} /><section className="panel visual-summary"><div className="section-title-row"><div><h3>Analysis at a glance</h3><p>Signal strength from the model response</p></div><Gauge size={17} className="muted-icon" /></div><div className="visual-metrics"><div><span>Severity classification</span><div className="visual-track"><i className={`severity-fill ${active.analysis.severity.toLowerCase()}`} style={{ width: `${({ CRITICAL: 100, HIGH: 78, MEDIUM: 52, LOW: 27 })[active.analysis.severity]}%` }} /></div><SeverityBadge severity={active.analysis.severity} /></div><div><span>Confidence score</span><div className="visual-track"><i className="confidence-fill" style={{ width: `${active.analysis.confidence}%` }} /></div><strong>{active.analysis.confidence}%</strong></div></div><div className="severity-scale"><span>Low impact</span><span>Critical impact</span></div></section></div><aside className="insights-side"><section className="panel context-card"><span className="eyebrow">EVENT CONTEXT</span><h3>Source details</h3><div className="context-row"><span>Environment</span><strong>{active.environment}</strong></div><div className="context-row"><span>Event severity</span><SeverityBadge severity={active.severity} /></div><div className="context-row"><span>Current status</span><strong>{active.status.toLowerCase()}</strong></div><div className="context-row"><span>Received</span><strong>{formatDateTime(active.timestamp)}</strong></div><p className="context-description">{active.description}</p></section><Link className="button button-secondary full-width" to={`/incidents/${encodeURIComponent(active.incidentId)}`}>View full incident details <ArrowRight size={15} /></Link></aside></div>
    </>}
  </div>;
}
