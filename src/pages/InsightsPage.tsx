import { Activity, ArrowRight, Gauge, Search, Sparkles, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AnalysisSummaryCard from "../components/AnalysisSummaryCard";
import PageHeading from "../components/PageHeading";
import SeverityBadge from "../components/SeverityBadge";
import { useIncidentAnalysis } from "../contexts/useIncidentAnalysis";
import { formatDateTime } from "../utils/format";

export default function InsightsPage() {
  const { incidentId } = useParams();
  const navigate = useNavigate();
  const { incidents } = useIncidentAnalysis();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [search, setSearch] = useState("");
  const active = incidents.find((incident) => incident.incidentId === incidentId) ?? (incidentId ? undefined : incidents[0]);
  const filteredIncidents = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return incidents;
    return incidents.filter((incident) =>
      `${incident.incidentId} ${incident.service} ${incident.title}`.toLowerCase().includes(query),
    );
  }, [incidents, search]);
  const selectIncident = (id: string) => {
    setPickerOpen(false);
    setSearch("");
    navigate(`/insights/${encodeURIComponent(id)}`);
  };

  useEffect(() => {
    if (!pickerOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPickerOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [pickerOpen]);

  return <div className="page-view">
    <PageHeading eyebrow="INTELLIGENCE / MODEL OUTPUT" title="Analysis insights" description="Explore the AI assessment returned for your incident." action={active ? <button className="button button-secondary insight-picker-trigger" onClick={() => setPickerOpen(true)}><Search size={14} />Browse incidents <span>{incidents.length}</span></button> : undefined} />
    {pickerOpen && <div className="incident-picker-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setPickerOpen(false); }}>
      <section className="incident-picker panel" role="dialog" aria-modal="true" aria-labelledby="incident-picker-title">
        <div className="incident-picker-header"><div><span className="eyebrow">SAVED IN THIS SESSION</span><h2 id="incident-picker-title">Choose an analysis</h2></div><button className="icon-button" onClick={() => setPickerOpen(false)} aria-label="Close incident list"><X size={18} /></button></div>
        <label className="incident-picker-search"><Search size={15} /><input autoFocus value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search ID, service, or title…" /></label>
        <div className="incident-picker-list">
          {filteredIncidents.length === 0 && <div className="incident-picker-empty">No saved incidents match your search.</div>}
          {filteredIncidents.map((incident) => <button className={`incident-picker-item ${incident.incidentId === active?.incidentId ? "is-active" : ""}`} key={incident.incidentId} onClick={() => selectIncident(incident.incidentId)}>
            <span className="incident-picker-item-main"><strong>{incident.incidentId}</strong><span>{incident.title}</span><small>{incident.service} · {formatDateTime(incident.timestamp)}</small></span><SeverityBadge severity={incident.analysis.severity} />
          </button>)}
        </div>
      </section>
    </div>}
    {!active && <div className="panel empty-analysis"><Sparkles size={23} /><h3>Analysis data isn't available</h3><p>Create an incident to view its returned analysis here. Your results stay available as you move between screens in this session.</p><Link to="/create" className="button button-primary">Create incident <ArrowRight size={15} /></Link></div>}
    {active && <>
      <section className="insight-overview panel"><div className="insight-incident"><span className="eyebrow">ANALYSIS TARGET</span><h2>{active.title}</h2><p>{active.incidentId} <span>·</span> {active.service} <span>·</span> {formatDateTime(active.timestamp)}</p></div><div className="insight-score"><div className="confidence-ring" style={{ background: `conic-gradient(#59d5cf ${active.confidence * 3.6}deg, #263248 0deg)` }}><div><strong>{active.confidence}<small>%</small></strong><span>CONFIDENCE</span></div></div></div><div className="insight-severity"><span className="eyebrow">AI-ASSESSED SEVERITY</span><SeverityBadge severity={active.analysis.severity} /><span className="severity-context"><Activity size={14} />Model output</span></div></section>
      <div className="insights-grid"><div className="insights-main"><AnalysisSummaryCard analysis={active.analysis} /><section className="panel visual-summary"><div className="section-title-row"><div><h3>Analysis at a glance</h3><p>Signal strength from the model response</p></div><Gauge size={17} className="muted-icon" /></div><div className="visual-metrics"><div><span>Severity classification</span><div className="visual-track"><i className={`severity-fill ${active.analysis.severity.toLowerCase()}`} style={{ width: `${({ CRITICAL: 100, HIGH: 78, MEDIUM: 52, LOW: 27 })[active.analysis.severity]}%` }} /></div><SeverityBadge severity={active.analysis.severity} /></div><div><span>Confidence score</span><div className="visual-track"><i className="confidence-fill" style={{ width: `${active.analysis.confidence}%` }} /></div><strong>{active.analysis.confidence}%</strong></div></div><div className="severity-scale"><span>Low impact</span><span>Critical impact</span></div></section></div><aside className="insights-side"><section className="panel context-card"><span className="eyebrow">EVENT CONTEXT</span><h3>Source details</h3><div className="context-row"><span>Environment</span><strong>{active.environment}</strong></div><div className="context-row"><span>Event severity</span><SeverityBadge severity={active.severity} /></div><div className="context-row"><span>Current status</span><strong>{active.status.toLowerCase()}</strong></div><div className="context-row"><span>Received</span><strong>{formatDateTime(active.timestamp)}</strong></div><p className="context-description">{active.description}</p></section></aside></div>
    </>}
  </div>;
}
