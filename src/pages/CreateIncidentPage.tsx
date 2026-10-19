import { CheckCircle2, CircleAlert, FilePlus2, LoaderCircle, Send, ShieldCheck } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { incidentApi } from "../api/incidents";
import PageHeading from "../components/PageHeading";
import type { IncidentCreatePayload, IncidentEvent, IncidentSeverity } from "../types/incident";
import { recordSessionIncidentActivity } from "../utils/sessionIncidentActivity";

function currentLocalDateTime() {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}

function emptyIncidentForm(): IncidentCreatePayload {
  return {
    incidentId: "",
    service: "",
    environment: "production",
    title: "",
    description: "",
    severity: "MEDIUM",
    timestamp: currentLocalDateTime(),
  };
}

export default function CreateIncidentPage() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [activityWarning, setActivityWarning] = useState("");
  const [result, setResult] = useState<IncidentEvent | null>(null);
  const [form, setForm] = useState<IncidentCreatePayload>(emptyIncidentForm);
  const update = (field: keyof IncidentCreatePayload, value: string) => setForm((current) => ({ ...current, [field]: value }));

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setActivityWarning("");
    setResult(null);
    const submittedAt = new Date().toISOString();
    try {
      const incident = await incidentApi.create({ ...form, timestamp: new Date(form.timestamp).toISOString() });
      setResult(incident);
      setForm(emptyIncidentForm());
      try {
        recordSessionIncidentActivity({
          incident,
          submittedAt,
          responseReceivedAt: new Date().toISOString(),
        });
      } catch (cause) {
        setActivityWarning(cause instanceof Error ? cause.message : "Unable to save browser-session flow activity.");
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Incident submission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return <div className="page-view">
    <PageHeading eyebrow="OPERATIONS / INTAKE" title="Create an incident" description="Submit a production event and wait for the analysis service to return its assessment." />
    <div className="create-layout">
      <form className="panel create-form" onSubmit={(event) => void submit(event)} aria-busy={submitting}>
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
        {activityWarning && <div className="error-banner form-error"><CircleAlert size={16} /><span>Incident analysis succeeded, but Flow Monitoring could not save it: {activityWarning}</span></div>}
        {submitting && <div className="submission-wait-overlay" role="status" aria-live="polite"><div className="submission-wait-card"><LoaderCircle className="submission-wait-spinner" size={34} /><strong>Analyzing your incident</strong><p>The backend is processing the incident. This may take a little while.</p><span className="submission-progress"><i /></span><small>Please keep this page open while we wait for the response.</small></div></div>}
      </form>
      <aside className="create-aside">
        <section className="panel pipeline-card"><span className="eyebrow">WHAT HAPPENS NEXT</span><h3>Your event's journey</h3><p>The request completes after analysis has been generated.</p><div className="journey-list"><div><span>1</span><div><strong>HTTP intake</strong><small>Payload is validated and accepted</small></div></div><div><span>2</span><div><strong>Kafka publish</strong><small>Event is queued for processing</small></div></div><div><span>3</span><div><strong>AI analysis</strong><small>Severity, cause, and actions generated</small></div></div><div><span>4</span><div><strong>Structured response</strong><small>Analysis returned before submission completes</small></div></div></div></section>
        <div className="privacy-note"><ShieldCheck size={16} /><p>Submit only operational context that your organization permits sending to its configured analysis service.</p></div>
      </aside>
    </div>
    {result && <section className="submission-result"><div className="success-banner"><CheckCircle2 size={18} /><div><strong>Incident analyzed</strong><p>{result.incidentId} was submitted successfully. The form is ready for another incident.</p></div><Link className="text-link" to={`/insights/${encodeURIComponent(result.incidentId)}`} state={{ incident: result }}>View analysis insights →</Link></div></section>}
  </div>;
}
