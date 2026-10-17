import { Circle, Filter } from "lucide-react";
import { useMemo, useState } from "react";
import type { LogEntry, LogLevel } from "../types/incident";
import { formatDateTime } from "../utils/format";

const levels: Array<LogLevel | "ALL"> = ["ALL", "INFO", "WARN", "ERROR"];

export default function LogPanel({ logs, compact = false }: { logs: LogEntry[]; compact?: boolean }) {
  const [level, setLevel] = useState<LogLevel | "ALL">("ALL");
  const filteredLogs = useMemo(
    () => logs.filter((log) => level === "ALL" || log.level === level).slice(0, compact ? 5 : undefined),
    [logs, level, compact],
  );
  return (
    <section className="panel logs-panel">
      <div className="section-title-row logs-title-row">
        <div><h3>Flow logs</h3><p>{compact ? "Latest backend activity" : "Event processing pipeline activity"}</p></div>
        {!compact && <label className="select-control log-filter"><Filter size={14} /><select value={level} onChange={(event) => setLevel(event.target.value as LogLevel | "ALL")} aria-label="Filter logs by level">{levels.map((item) => <option key={item} value={item}>{item === "ALL" ? "All levels" : item}</option>)}</select></label>}
      </div>
      <div className="log-list">
        {filteredLogs.length === 0 && <div className="empty-inline">No log entries at this level.</div>}
        {filteredLogs.map((log) => (
          <div className="log-row" key={log.id}>
            <span className={`log-level log-${log.level.toLowerCase()}`}>{log.level}</span>
            <span className="log-stage"><Circle size={7} fill="currentColor" />{log.stage}</span>
            <span className="log-message">{log.message}</span>
            <time>{formatDateTime(log.timestamp)}</time>
          </div>
        ))}
      </div>
    </section>
  );
}
