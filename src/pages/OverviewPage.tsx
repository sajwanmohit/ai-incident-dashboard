import { ArrowRight, AlertOctagon, CheckCircle2, CircleAlert, Plus, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { useIncidents } from "../hooks/useIncidents";
import type { IncidentEvent, IncidentSeverity } from "../types/incident";
import IncidentDetailsDrawer from "../components/IncidentDetailsDrawer";
import IncidentTable from "../components/IncidentTable";
import PageHeading from "../components/PageHeading";
import StatCard from "../components/StatCard";
import { formatDateTime } from "../utils/format";

const severityColors: Record<IncidentSeverity, string> = { CRITICAL: "#fa5b64", HIGH: "#f29a55", MEDIUM: "#edc464", LOW: "#55c99a" };

function buildTrend(incidents: IncidentEvent[]) {
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    return { key: date.toLocaleDateString("en", { month: "short", day: "numeric" }), date: date.toDateString(), incidents: 0, critical: 0 };
  });
  incidents.forEach((incident) => {
    const day = days.find((item) => item.date === new Date(incident.timestamp).toDateString());
    if (day) {
      day.incidents += 1;
      if (incident.severity === "CRITICAL") day.critical += 1;
    }
  });
  return days;
}

export default function OverviewPage() {
  const { incidents, loading, error, refresh } = useIncidents();
  const [selected, setSelected] = useState<IncidentEvent | null>(null);
  const critical = incidents.filter((incident) => incident.severity === "CRITICAL").length;
  const resolved = incidents.filter((incident) => incident.status === "RESOLVED").length;
  const analyzed = incidents.filter((incident) => incident.confidence > 0);
  const averageConfidence = analyzed.length ? Math.round(analyzed.reduce((total, incident) => total + incident.confidence, 0) / analyzed.length) : 0;
  const trend = useMemo(() => buildTrend(incidents), [incidents]);
  const distribution = (["CRITICAL", "HIGH", "MEDIUM", "LOW"] as const).map((severity) => ({
    name: severity,
    value: incidents.filter((incident) => incident.severity === severity).length,
  }));

  return (
    <div className="page-view">
      <PageHeading eyebrow={new Intl.DateTimeFormat("en", { weekday: "long", month: "long", day: "numeric" }).format(new Date()).toUpperCase()} title="Good morning, Alex" description="Here's what's happening across your production systems." action={<Link className="button button-primary" to="/create"><Plus size={16} />New incident</Link>} />
      {error && <div className="error-banner"><CircleAlert size={17} /><div><strong>Could not load incident data</strong><p>{error}</p></div><button onClick={() => void refresh()}>Retry</button></div>}
      <section className="stats-grid">
        <StatCard label="Total incidents" value={loading ? "—" : incidents.length.toString().padStart(2, "0")} detail="Across all environments" icon={AlertOctagon} tone="cyan" />
        <StatCard label="Critical incidents" value={loading ? "—" : critical.toString().padStart(2, "0")} detail={critical ? "Needs immediate attention" : "No active critical incidents"} icon={CircleAlert} tone="red" />
        <StatCard label="Resolved" value={loading ? "—" : resolved.toString().padStart(2, "0")} detail={incidents.length ? `${Math.round(resolved / incidents.length * 100)}% resolution rate` : "No resolved incidents"} icon={CheckCircle2} tone="green" />
        <StatCard label="Avg. AI confidence" value={loading ? "—" : `${averageConfidence}%`} detail="Across analyzed incidents" icon={ShieldCheck} tone="violet" />
      </section>
      <section className="charts-grid">
        <article className="panel chart-panel trend-panel">
          <div className="section-title-row"><div><h3>Incident activity</h3><p>Volume and critical events over the last 7 days</p></div><button className="period-button">Last 7 days <span>⌄</span></button></div>
          <div className="chart-legend"><span><i className="legend-dot total" />All incidents</span><span><i className="legend-dot critical" />Critical</span></div>
          <div className="trend-chart">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ top: 12, right: 8, left: -18, bottom: 0 }}>
                <defs><linearGradient id="totalFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#47c7cc" stopOpacity={0.2} /><stop offset="95%" stopColor="#47c7cc" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid stroke="#20283a" strokeDasharray="3 5" vertical={false} />
                <XAxis dataKey="key" axisLine={false} tickLine={false} tick={{ fill: "#737d92", fontSize: 11 }} dy={10} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: "#737d92", fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "#151c2b", border: "1px solid #293246", borderRadius: 10, color: "#eef2fa", fontSize: 12 }} />
                <Area type="monotone" dataKey="incidents" name="Incidents" stroke="#47c7cc" strokeWidth={2.5} fill="url(#totalFill)" />
                <Area type="monotone" dataKey="critical" name="Critical" stroke="#fa5b64" strokeWidth={2} fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>
        <article className="panel chart-panel distribution-panel">
          <div className="section-title-row"><div><h3>Severity distribution</h3><p>Incidents by assessed severity</p></div></div>
          <div className="distribution-content">
            <div className="donut-chart"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={distribution} dataKey="value" nameKey="name" innerRadius={58} outerRadius={79} paddingAngle={4} stroke="none">{distribution.map((item) => <Cell key={item.name} fill={severityColors[item.name]} />)}</Pie><Tooltip contentStyle={{ background: "#151c2b", border: "1px solid #293246", borderRadius: 10, color: "#eef2fa", fontSize: 12 }} /></PieChart></ResponsiveContainer><div className="donut-center"><strong>{incidents.length}</strong><span>TOTAL</span></div></div>
            <div className="severity-legend">{distribution.map((item) => <div key={item.name}><span><i style={{ backgroundColor: severityColors[item.name] }} />{item.name}</span><strong>{item.value}</strong></div>)}</div>
          </div>
        </article>
      </section>
      <section className="panel recent-panel">
        <div className="section-title-row recent-heading"><div><h3>Recent incidents</h3><p>Latest events across your services</p></div><Link className="text-link" to="/incidents">View all incidents <ArrowRight size={15} /></Link></div>
        <IncidentTable incidents={incidents.slice(0, 5)} loading={loading} onSelect={setSelected} compact />
      </section>
      <div className="dashboard-bottom-note"><span className="live-indicator" />Last synced {formatDateTime(new Date().toISOString())}<span className="note-divider">·</span>Auto-refresh every 30 seconds</div>
      <IncidentDetailsDrawer incident={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
