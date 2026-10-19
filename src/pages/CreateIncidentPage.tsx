import { CheckCircle2, CircleAlert, FilePlus2, LoaderCircle, Send, ShieldCheck } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { incidentApi } from "../api/incidents";
import AnalysisSummaryCard from "../components/AnalysisSummaryCard";
import PageHeading from "../components/PageHeading";
import type { IncidentCreatePayload, IncidentEvent, IncidentSeverity } from "../types/incident";

function currentLocalDateTime() {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}

export default function CreateIncidentPage() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<IncidentEvent | null>(null);
  const [form, setForm] = useState<IncidentCreatePayload>({
    incidentId: "",
    service: "",
    environment: "production",
    title: "",
    description: "",
    severity: "MEDIUM",
    timestamp: currentLocalDateTime(),
  });
  const update = (field: keyof IncidentCreatePayload, value: string) => setForm((current) => ({ ...current, [field]: value }));

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setResult(null);
    try {
      const incident = await incidentApi.create({ ...form, timestamp: new Date(form.timestamp).toISOString() });
      setResult(incident);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Incident submission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return <div className="page-view">
    <PageHeading eyebrow="OPERATIONS / INTAKE" title="Create an incident" description="Submit a production event and wait for the analysis service to return its assessment." />
    <div className="create-layout">
      <form className="panel create-form" onSubmit={(event) => void submit(event)}>
        <div className="form-section-heading"><span className="form-section-icon"><FilePlus2 size={16} /></span><div><h3>Incident details</h3><p>Provide the source event information</p></div></div>
        <div className="form-grid">
          <label className="form-field"><span>Incident ID <i>*</i></span><input required value={form.incidentId} onChange={(event) => update("incidentId", event.target.value)} placeholder="INC-2026-0001" /></label>
          <label className="form-field"><span>Service / system <i>*</i></span><input required value={form.service} onChange={(event) => update("service", event.target.value)} placeholder="e.g. Payment Gateway" /></label>
          <label className="form-field"><span>Environment <i>*</i></span><select required value={form.environment} onChange={(event) => update("environment", event.target.value)}><option value="production">Production</option><option value="staging">Staging</option><option value="development">Development</option></select></label>
          <label className="form-field"><span>Severity <i>*</i></span><select required value={form.severity} onChange={(event) => update("severity", event.target.value as IncidentSeverity)}><option value="CRITICAL">Critical</option><option value="HIGH">High</option><option value="MEDIUM">Medium</option><option value="LOW">Low</option></select></label>
          <label className="form-field form-field-wide"><span>Incident title <i>*</i></span><input required maxLength={160} value={form.title} onChange={(event) => update("title", event.target.value)} placeholder="Short summary of the incident" /></label>
          <label className="form-field form-field-wide"><span>Description <i>*</i></span><textarea required rows={5} maxLength={4000} value={form.description} onChange={(event) => update("description", event.target.value)} placeholder="Describe the symptoms, impact, and relevant context…" /><small>Include relevant metrics or observed behavior. {form.description.length}/4000</small></label>
          <label className="form-field form-field-wide"><span>Event timestamp <i>*</i></span><input required type="datetime-local" value={form.timestamp} onChange={(event) => update("timestamp", event.target.value)} /></label>
        </div>
        <div className="form-footer"><span><ShieldCheck size={15} />The request stays open until analysis is complete.</span><button className="button button-primary" type="submit" disabled={submitting}>{submitting ? <><LoaderCircle className="spin" size={16} />Waiting for analysis…</> : <><Send size={15} />Submit for analysis</>}</button></div>
        {error && <div className="error-banner form-error"><CircleAlert size={16} /><span>{error}</span></div>}
        {submitting && <div className="processing-result"><LoaderCircle className="spin" size={17} /><span>Incident submitted. Waiting for the backend to finish the AI analysis and return its response…</span></div>}
      </form>
      <aside className="create-aside">
        <section className="panel pipeline-card"><span className="eyebrow">WHAT HAPPENS NEXT</span><h3>Your event's journey</h3><p>The request completes after analysis has been generated.</p><div className="journey-list"><div><span>1</span><div><strong>HTTP intake</strong><small>Payload is validated and accepted</small></div></div><div><span>2</span><div><strong>Kafka publish</strong><small>Event is queued for processing</small></div></div><div><span>3</span><div><strong>AI analysis</strong><small>Severity, cause, and actions generated</small></div></div><div><span>4</span><div><strong>Structured response</strong><small>Analysis returned before submission completes</small></div></div></div></section>
        <div className="privacy-note"><ShieldCheck size={16} /><p>Submit only operational context that your organization permits sending to its configured analysis service.</p></div>
      </aside>
    </div>
    {result && <section className="submission-result"><div className="success-banner"><CheckCircle2 size={18} /><div><strong>Incident analyzed</strong><p>{result.incidentId} and its analysis were returned by the backend.</p></div><Link className="text-link" to={`/insights/${encodeURIComponent(result.incidentId)}`}>View insights →</Link></div><AnalysisSummaryCard analysis={result.analysis} /></section>}
  </div>;
}
