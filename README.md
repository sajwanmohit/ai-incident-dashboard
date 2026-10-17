# ai-incident-dashboard

## Signal — Incident Intelligence

A responsive React + TypeScript dashboard for monitoring production incidents, inspecting AI analysis, and following backend processing flow.

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

By default, `.env.example` enables deterministic sample data so the UI is usable without a running backend. To connect to Spring Boot, set `VITE_API_BASE_URL` to the backend origin and set `VITE_USE_MOCK_DATA=false` in `.env.local`, then restart Vite.

## Spring Boot integration

The Axios service in `src/api/incidents.ts` is the single place to adapt endpoint paths or response mapping:

- `GET /api/v1/incidents` — list incidents
- `GET /api/v1/incidents/{id}` — load an incident
- `POST /api/v1/incidents` — submit an incident and receive its analysis

The expected response is an `IncidentEvent` as defined in `src/types/incident.ts`, with AI results nested under `analysis` and processing timestamps under `timeline`. If your backend returns a different envelope (for example `{ data: ... }`), normalize it in the service rather than in page components. The live flow-monitor view assembles event rows from incident timeline timestamps; replace this with a dedicated log/stream endpoint when the backend exposes one.

`VITE_API_BASE_URL` is the backend origin (for example `http://localhost:8080`). Configure CORS in Spring Boot to allow the Vite development origin (`http://localhost:5173`).

## Features

- Overview metrics, incident activity trend, severity distribution, and recent incident drawer
- Searchable, filterable incident monitor sorted newest first; CSV export
- Full incident details with original payload JSON, model analysis, and processing timeline
- Flow monitoring with INFO/WARN/ERROR filtering and API → Kafka → AI → response stages
- Incident submission form with loading, error, success, and returned analysis states
- Analysis insights with confidence visualization, severity summary, root cause, and recommended actions
- Responsive navigation and layouts for desktop, tablet, and mobile

## Quality checks

```bash
npm run build
npm run lint
```
