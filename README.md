# ai-incident-dashboard

## Signal — Incident Intelligence

A responsive React + TypeScript dashboard for monitoring production incidents, inspecting AI analysis, and following backend processing flow.

## Run locally

```bash
npm install
npm run dev
```

The dashboard always connects directly to the backend; there is no sample-data mode or API proxy. Vite loads `.env.development` for local development and `.env.production` for production builds. The checked-in development environment targets `http://localhost:8080`, and the production environment targets the Render backend. Both files contain public API URLs, not secrets.

## Spring Boot integration

The Axios service in `src/api/incidents.ts` is the single place to adapt endpoint paths or response mapping:

- `GET /api/v1/incidents` — list incidents
- `GET /api/v1/incidents/{id}` — load an incident
- `POST /api/v1/incidents` — submit an incident and receive its analysis

The expected response is an `IncidentEvent` as defined in `src/types/incident.ts`, with AI results nested under `analysis` and processing timestamps under `timeline`. If your backend returns a different envelope (for example `{ data: ... }`), normalize it in the service rather than in page components. The live flow-monitor view assembles event rows from incident timeline timestamps; replace this with a dedicated log/stream endpoint when the backend exposes one.

The browser connects directly to the configured backend origin. Configure Spring Boot CORS to allow the local dashboard origin (`http://localhost:5173`) and the production Vercel dashboard origin.

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
