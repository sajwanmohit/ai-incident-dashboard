import { ArrowUpRight, Check, ShieldAlert, Sparkles } from "lucide-react";
import type { IncidentAnalysisResult } from "../types/incident";
import SeverityBadge from "./SeverityBadge";

export default function AnalysisSummaryCard({ analysis }: { analysis: IncidentAnalysisResult }) {
  return (
    <section className="panel analysis-card">
      <div className="section-title-row">
        <div className="analysis-heading"><span className="analysis-spark"><Sparkles size={16} /></span><div><h3>AI analysis</h3><p>Structured model output</p></div></div>
        <span className="analysis-live"><span />Analysis ready</span>
      </div>
      <div className="analysis-metrics">
        <div><span className="metric-label">Assessed severity</span><SeverityBadge severity={analysis.severity} /></div>
        <div><span className="metric-label">Confidence</span><strong className="metric-confidence">{analysis.confidence}% <span><ArrowUpRight size={13} /> high confidence</span></strong></div>
      </div>
      <div className="analysis-summary">
        <span className="metric-label">Summary</span>
        <p>{analysis.summary}</p>
      </div>
      <div className="actions-block">
        <span className="metric-label">Recommended actions</span>
        <ul>{analysis.recommendedActions.map((action) => <li key={action}><span><Check size={12} /></span>{action}</li>)}</ul>
      </div>
      {analysis.evidence?.length ? <div className="explanation-block"><span className="metric-label">Evidence</span><ul>{analysis.evidence.map((item) => <li key={item}>{item}</li>)}</ul></div> : null}
      {analysis.rootCause && <div className="explanation-block"><span className="metric-label"><ShieldAlert size={13} /> Root cause</span><p>{analysis.rootCause}</p></div>}
      {analysis.riskExplanation && <div className="explanation-block risk-explanation"><span className="metric-label">Risk explanation</span><p>{analysis.riskExplanation}</p></div>}
    </section>
  );
}
