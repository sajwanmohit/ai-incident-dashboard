import type { IncidentEvent, LogEntry } from "../types/incident";

const now = Date.now();
const minutesAgo = (minutes: number) => new Date(now - minutes * 60_000).toISOString();

const createIncident = (
  incidentId: string,
  service: string,
  environment: string,
  title: string,
  description: string,
  severity: IncidentEvent["severity"],
  status: IncidentEvent["status"],
  confidence: number,
  minutes: number,
  summary: string,
  rootCause: string,
  actions: string[],
): IncidentEvent => {
  const timestamp = minutesAgo(minutes);
  return {
    incidentId,
    service,
    environment,
    title,
    description,
    severity,
    status,
    timestamp,
    confidence,
    analysis: {
      severity,
      confidence,
      summary,
      rootCause,
      riskExplanation: "Customer-facing requests may continue to fail until the underlying dependency recovers.",
      recommendedActions: actions,
    },
    originalPayload: {
      incidentId,
      service,
      environment,
      title,
      description,
      severity,
      timestamp,
      source: "alertmanager",
      region: "us-east-1",
      tags: ["production", service.toLowerCase().replaceAll(" ", "-")],
    },
    timeline: {
      received: timestamp,
      publishedToKafka: minutesAgo(Math.max(0, minutes - 1)),
      analyzedByAI: status === "RECEIVED" ? undefined : minutesAgo(Math.max(0, minutes - 2)),
      responseGenerated: status === "ANALYZED" || status === "RESOLVED" ? minutesAgo(Math.max(0, minutes - 3)) : undefined,
    },
  };
};

export const mockIncidents: IncidentEvent[] = [
  createIncident("INC-2025-0847", "Payment Gateway", "production", "Elevated payment failures",
    "Payment authorization error rate has exceeded 18% for 5 minutes across the primary region.", "CRITICAL", "ANALYZED", 96, 8,
    "Payment authorization failures have surged, likely due to an upstream processor timeout. Immediate failover is recommended.",
    "Processor API latency increased sharply after the latest routing configuration change.",
    ["Fail over traffic to the secondary processor", "Revert routing config v2.18.4", "Notify payments on-call"]),
  createIncident("INC-2025-0846", "API Gateway", "production", "P99 latency above threshold",
    "P99 latency is 4.8s on the public API, affecting checkout and account endpoints.", "HIGH", "PROCESSING", 84, 16,
    "Latency is concentrated on routes with elevated database connection wait time; the analysis is still in progress.",
    "Connection pool saturation following a traffic spike is the leading hypothesis.",
    ["Check connection pool utilization", "Scale API gateway replicas", "Inspect database wait events"]),
  createIncident("INC-2025-0845", "Identity Service", "production", "Intermittent login failures",
    "Login requests are returning 503 responses for a subset of users in the EU region.", "HIGH", "ANALYZED", 91, 34,
    "An unhealthy EU identity-service replica is returning intermittent 503s. Traffic can be safely drained.",
    "Health checks are passing despite worker exhaustion on one replica.",
    ["Drain eu-west-1b replica", "Review worker saturation alerts", "Verify login recovery"]),
  createIncident("INC-2025-0844", "Search Indexer", "staging", "Indexing queue backlog",
    "The search indexing consumer group is 12 minutes behind the latest event.", "MEDIUM", "RESOLVED", 88, 72,
    "A consumer rebalance paused indexing briefly; the backlog is now draining at a healthy rate.",
    "A rolling deployment caused repeated Kafka consumer group rebalances.",
    ["Keep monitoring consumer lag", "Adjust deployment maxUnavailable", "Close incident after verification"]),
  createIncident("INC-2025-0843", "Notification Worker", "production", "Email delivery delayed",
    "Outbound email delivery has a 6-minute delay; retries are accumulating.", "MEDIUM", "ANALYZED", 79, 106,
    "The mail provider is throttling outbound requests. The queue is stable but delivery is delayed.",
    "Provider rate limits were reached during a scheduled campaign.",
    ["Apply provider-aware backoff", "Check campaign send rate", "Notify customer support"]),
  createIncident("INC-2025-0842", "Inventory API", "production", "Cache hit ratio decreased",
    "Redis cache hit ratio has dropped from 92% to 71% over the last 15 minutes.", "LOW", "RESOLVED", 93, 183,
    "A cache key version mismatch caused a temporary increase in database reads; cache hit rate has recovered.",
    "The application and cache were briefly running different key prefixes during rollout.",
    ["Confirm cache metrics remain stable", "Document rollout sequencing"]),
  createIncident("INC-2025-0841", "Order Processor", "production", "Worker restart detected",
    "One order-processing worker restarted unexpectedly and is now healthy.", "LOW", "RESOLVED", 89, 256,
    "The worker recovered after an out-of-memory restart with no confirmed order loss.",
    "A transient memory spike exceeded the container limit.",
    ["Review memory profile", "Verify queue redelivery completed"]),
  createIncident("INC-2025-0840", "Analytics Pipeline", "staging", "Schema validation warning",
    "New optional field was rejected by a downstream staging schema validator.", "LOW", "RECEIVED", 0, 304,
    "Waiting for AI analysis.",
    "Analysis has not completed yet.",
    ["Review the producer schema change"]),
];

export const mockLogs: LogEntry[] = mockIncidents.flatMap<LogEntry>((incident, index) => {
  const t = incident.timestamp;
  return [
    { id: `${incident.incidentId}-1`, incidentId: incident.incidentId, level: "INFO", stage: "API request", message: `Incident received from ${incident.originalPayload.source}.`, timestamp: t },
    { id: `${incident.incidentId}-2`, incidentId: incident.incidentId, level: "INFO", stage: "Kafka publish", message: `Published to incidents.incoming (partition ${index % 4}).`, timestamp: incident.timeline.publishedToKafka ?? t },
    ...(incident.status === "RECEIVED" ? [] : [
      { id: `${incident.incidentId}-3`, incidentId: incident.incidentId, level: "INFO" as const, stage: "Kafka consume", message: "Incident consumed by analysis worker.", timestamp: incident.timeline.analyzedByAI ?? t },
      { id: `${incident.incidentId}-4`, incidentId: incident.incidentId, level: "INFO" as const, stage: "LLM analysis", message: incident.status === "PROCESSING" ? "Analysis started; awaiting model response." : "Analysis response received and validated.", timestamp: incident.timeline.responseGenerated ?? incident.timeline.analyzedByAI ?? t },
    ]),
    ...(incident.severity === "CRITICAL" ? [
      { id: `${incident.incidentId}-5`, incidentId: incident.incidentId, level: "WARN" as const, stage: "Fallback", message: "Secondary processor failover recommended by analysis.", timestamp: t },
    ] : []),
  ];
}).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
