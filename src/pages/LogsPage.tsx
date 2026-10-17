import { Activity, AlertTriangle, CheckCircle2, Radio, RefreshCw } from "lucide-react";
import { useMemo } from "react";
import { useMockData } from "../api/http";
import { mockLogs } from "../data/mockData";
import { useIncidents } from "../hooks/useIncidents";
import LogPanel from "../components/LogPanel";
import PageHeading from "../components/PageHeading";
import type { LogEntry } from "../types/incident";

export default function LogsPage() {
  const { incidents, loading, error, refresh } = useIncidents();
  const logs = useMemo<LogEntry[]>(() => {
    if (useMockData) return mockLogs;
    return incidents.flatMap((incident) => {
      const steps: Array<[string, string | undefined]> = [
        ["API request received", incident.timeline.received],
        ["Published to Kafka", incident.timeline.publishedToKafka],
        ["LLM analysis completed", incident.timeline.analyzedByAI],
        ["Response generated", incident.timeline.responseGenerated],
      ];
      return steps.filter(([, timestamp]) => timestamp).map(([stage, timestamp], index) => {
        const level: LogEntry["level"] = incident.status === "FAILED" ? "ERROR" : incident.severity === "CRITICAL" && stage === "LLM analysis completed" ? "WARN" : "INFO";
        return {
          id: `${incident.incidentId}-${index}`,
          incidentId: incident.incidentId,
          level,
          stage,
          message: `${incident.service} · ${incident.incidentId}`,
          timestamp: timestamp!,
        };
      });
    }).sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp));
  }, [incidents]);

  const count = (level: string) => logs.filter((log) => log.level === level).length;
  return <div className="page-view">
    <PageHeading eyebrow="OBSERVABILITY / FLOW" title="Flow monitoring" description="Follow each incident through the HTTP, Kafka, and AI analysis pipeline." action={<button className="button button-secondary" onClick={() => void refresh()}><RefreshCw size={14} />Refresh logs</button>} />
    {error && <div className="error-banner"><AlertTriangle size={16} /><p>{error}</p><button onClick={() => void refresh()}>Retry</button></div>}
    <div className="flow-strip panel">{[["API Gateway", "HTTP intake", "intake"], ["Kafka", "incidents.incoming", "queue"], ["Analysis worker", "LLM orchestration", "analysis"], ["Response API", "JSON output", "response"]].map(([name, detail, state], index) => <div className="flow-node" key={name}><div className="flow-node-icon"><span>{index === 0 ? <Radio size={17} /> : index === 1 ? <Activity size={17} /> : index === 2 ? <Activity size={17} /> : <CheckCircle2 size={17} />}</span></div><div><strong>{name}</strong><small>{detail}</small></div><span className="flow-state">{state}</span>{index < 3 && <span className="flow-connector" />}</div>)}</div>
    <div className="log-stats"><div className="panel log-stat"><span className="log-stat-icon log-stat-info"><Activity size={17} /></span><div><span>Info events</span><strong>{loading ? "—" : count("INFO")}</strong></div></div><div className="panel log-stat"><span className="log-stat-icon log-stat-warn"><AlertTriangle size={17} /></span><div><span>Warnings</span><strong>{loading ? "—" : count("WARN")}</strong></div></div><div className="panel log-stat"><span className="log-stat-icon log-stat-error"><AlertTriangle size={17} /></span><div><span>Errors</span><strong>{loading ? "—" : count("ERROR")}</strong></div></div></div>
    <LogPanel logs={logs} />
    {useMockData && <p className="data-note">Showing sample flow events. In live mode, entries are assembled from incident processing timestamps; add a dedicated logs endpoint in <code>src/pages/LogsPage.tsx</code> to stream backend logs.</p>}
  </div>;
}
