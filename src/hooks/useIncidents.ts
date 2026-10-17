import { useCallback, useEffect, useState } from "react";
import { incidentApi } from "../api/incidents";
import type { IncidentEvent } from "../types/incident";

export function useIncidents() {
  const [incidents, setIncidents] = useState<IncidentEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setIncidents(await incidentApi.list());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load incidents.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let current = true;
    const load = () => incidentApi.list()
      .then((items) => {
        if (current) {
          setIncidents(items);
          setError("");
        }
      })
      .catch((cause: unknown) => { if (current) setError(cause instanceof Error ? cause.message : "Unable to load incidents."); })
      .finally(() => { if (current) setLoading(false); });
    void load();
    const intervalId = window.setInterval(() => { void load(); }, 30_000);
    return () => { current = false; window.clearInterval(intervalId); };
  }, []);

  return { incidents, setIncidents, loading, error, refresh };
}
