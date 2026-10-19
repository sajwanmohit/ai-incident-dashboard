import { Activity, AlertTriangle, CheckCircle2, Radio, RefreshCw } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import LogPanel from "../components/LogPanel";
import PageHeading from "../components/PageHeading";
import type { LogEntry } from "../types/incident";
import { loadSessionIncidentActivity, type SessionIncidentActivity } from "../utils/sessionIncidentActivity";

function readActivityState(): { activities: SessionIncidentActivity[]; error: string } {
  try {
    return { activities: loadSessionIncidentActivity(), error: "" };
  } catch (cause) {
    return {
      activities: [],
      error: cause instanceof Error ? cause.message : "Unable to load browser-session flow activity.",
    };
  }
}

export default function LogsPage() {
  const [activityState, setActivityState] = useState(readActivityState);
  const { activities, error } = activityState;
  const refresh = useCallback(() => setActivityState(readActivityState()), []);

  const logs = useMemo<LogEntry[]>(() => {
    return activities.flatMap(({ incident, submittedAt, responseReceivedAt }) => {
      const message = `${incident.service} · ${incident.incidentId}`;
      return [
        { id: `${incident.incidentId}-submitted`, incidentId: incident.incidentId, level: "INFO" as const, stage: "Incident submitted from dashboard", message, timestamp: submittedAt },
        { id: `${incident.incidentId}-analysis`, incidentId: incident.incidentId, level: "INFO" as const, stage: "Analysis response received", message, timestamp: responseReceivedAt },
      ];
    }).sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp));
  }, [activities]);

  const count = (level: string) => logs.filter((log) => log.level === level).length;
  return <div className="page-view">
    <PageHeading eyebrow="OBSERVABILITY / FLOW" title="Flow monitoring" description="Review incident submissions and analysis responses captured in this browser tab." action={<button className="button button-secondary" onClick={refresh}><RefreshCw size={14} />Refresh activity</button>} />
    {error && <div className="error-banner"><AlertTriangle size={16} /><p>{error}</p><button onClick={() => void refresh()}>Retry</button></div>}
    <div className="flow-strip panel">{[["API Gateway", "HTTP intake", "intake"], ["Kafka", "incidents.incoming", "queue"], ["Analysis worker", "LLM orchestration", "analysis"], ["Response API", "JSON output", "response"]].map(([name, detail, state], index) => <div className="flow-node" key={name}><div className="flow-node-icon"><span>{index === 0 ? <Radio size={17} /> : index === 1 ? <Activity size={17} /> : index === 2 ? <Activity size={17} /> : <CheckCircle2 size={17} />}</span></div><div><strong>{name}</strong><small>{detail}</small></div><span className="flow-state">{state}</span>{index < 3 && <span className="flow-connector" />}</div>)}</div>
    <div className="log-stats"><div className="panel log-stat"><span className="log-stat-icon log-stat-info"><Activity size={17} /></span><div><span>Info events</span><strong>{count("INFO")}</strong></div></div><div className="panel log-stat"><span className="log-stat-icon log-stat-warn"><AlertTriangle size={17} /></span><div><span>Warnings</span><strong>{count("WARN")}</strong></div></div><div className="panel log-stat"><span className="log-stat-icon log-stat-error"><AlertTriangle size={17} /></span><div><span>Errors</span><strong>{count("ERROR")}</strong></div></div></div>
    <LogPanel logs={logs} />
    <p className="data-note">This is browser-session activity recorded after successful incident submissions. It does not call a backend GET endpoint and does not show Kafka/worker events or activity from other users. The pipeline diagram above is an architecture illustration, not live service status.</p>
  </div>;
}
