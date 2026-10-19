import type { IncidentEvent } from "../types/incident";

const storageKey = "signal:session-incident-activity";

export interface SessionIncidentActivity {
  incident: IncidentEvent;
  submittedAt: string;
  responseReceivedAt: string;
}

function isSessionIncidentActivity(value: unknown): value is SessionIncidentActivity {
  if (typeof value !== "object" || value === null) return false;
  const activity = value as Partial<SessionIncidentActivity>;
  return typeof activity.submittedAt === "string"
    && typeof activity.responseReceivedAt === "string"
    && typeof activity.incident === "object"
    && activity.incident !== null
    && typeof activity.incident.incidentId === "string";
}

export function loadSessionIncidentActivity(): SessionIncidentActivity[] {
  const stored = window.sessionStorage.getItem(storageKey);
  if (!stored) return [];

  const parsed: unknown = JSON.parse(stored);
  if (!Array.isArray(parsed) || !parsed.every(isSessionIncidentActivity)) {
    throw new Error("Saved browser-session incident activity has an invalid format.");
  }
  return parsed;
}

export function recordSessionIncidentActivity(activity: SessionIncidentActivity): void {
  const activities = loadSessionIncidentActivity().filter(
    (item) => item.incident.incidentId !== activity.incident.incidentId,
  );
  activities.unshift(activity);
  window.sessionStorage.setItem(storageKey, JSON.stringify(activities));
}
