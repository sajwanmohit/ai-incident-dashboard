import { Download, Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { useIncidents } from "../hooks/useIncidents";
import IncidentDetailsDrawer from "../components/IncidentDetailsDrawer";
import IncidentTable from "../components/IncidentTable";
import PageHeading from "../components/PageHeading";
import type { IncidentEvent, IncidentSeverity, IncidentStatus } from "../types/incident";

export default function MonitorPage() {
  const { incidents, loading, error, refresh } = useIncidents();
  const [selected, setSelected] = useState<IncidentEvent | null>(null);
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState<IncidentSeverity | "ALL">("ALL");
  const [status, setStatus] = useState<IncidentStatus | "ALL">("ALL");
  const filtered = useMemo(() => incidents
    .filter((incident) => severity === "ALL" || incident.severity === severity)
    .filter((incident) => status === "ALL" || incident.status === status)
    .filter((incident) => `${incident.incidentId} ${incident.service} ${incident.title}`.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp)), [incidents, severity, status, search]);

  const exportCsv = () => {
    const columns = ["incidentId", "service", "environment", "severity", "status", "confidence", "timestamp"];
    const rows = filtered.map((item) => columns.map((key) => JSON.stringify(item[key as keyof IncidentEvent] ?? "")).join(","));
    const file = new Blob([[columns.join(","), ...rows].join("\n")], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(file);
    link.download = "incidents.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return <div className="page-view">
    <PageHeading eyebrow="OPERATIONS / MONITOR" title="Incident monitor" description="Search, filter, and inspect production events as they flow through analysis." action={<button className="button button-secondary" onClick={exportCsv}><Download size={15} />Export CSV</button>} />
    <div className="monitor-summary">
      <div className="monitor-summary-item"><span className="summary-number">{incidents.length}</span><span>total incidents</span></div><span className="summary-divider" /><div className="monitor-summary-item"><span className="summary-number summary-critical">{incidents.filter((item) => item.severity === "CRITICAL").length}</span><span>critical</span></div><span className="summary-divider" /><div className="monitor-summary-item"><span className="summary-number summary-active">{incidents.filter((item) => item.status === "PROCESSING" || item.status === "RECEIVED").length}</span><span>in progress</span></div>
    </div>
    <section className="panel monitor-panel">
      <div className="monitor-toolbar">
        <label className="search-control"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search incidents, services…" /></label>
        <div className="filter-controls"><span className="filter-label"><SlidersHorizontal size={14} />Filter by</span><label className="select-control"><select value={severity} onChange={(event) => setSeverity(event.target.value as IncidentSeverity | "ALL")} aria-label="Filter by severity"><option value="ALL">All severities</option>{["CRITICAL", "HIGH", "MEDIUM", "LOW"].map((value) => <option key={value}>{value}</option>)}</select></label><label className="select-control"><select value={status} onChange={(event) => setStatus(event.target.value as IncidentStatus | "ALL")} aria-label="Filter by status"><option value="ALL">All statuses</option>{["RECEIVED", "PROCESSING", "ANALYZED", "RESOLVED", "FAILED"].map((value) => <option key={value} value={value}>{value.charAt(0) + value.slice(1).toLowerCase()}</option>)}</select></label></div>
      </div>
      {error && <div className="error-banner table-error"><span>{error}</span><button onClick={() => void refresh()}>Retry</button></div>}
      <IncidentTable incidents={filtered} loading={loading} onSelect={setSelected} />
      <div className="table-footer"><span>Showing <strong>{filtered.length}</strong> of <strong>{incidents.length}</strong> incidents</span><span className="table-refresh"><span className="live-indicator" />Sorted by latest first</span></div>
    </section>
    <IncidentDetailsDrawer incident={selected} onClose={() => setSelected(null)} />
  </div>;
}
