# ai-incident-dashboard

## Incident Analyser

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

The create response is expected to contain the analysis result. List and detail endpoints are not currently available in the backend; pages that depend on them cannot load server-side incident history. Successful incident responses, including the complete incident and analysis details, are stored in `sessionStorage` and shared between pages for the current browser tab/session. Flow monitoring derives submission and response activity from that saved data; it is not a live view of backend pipeline events.

The browser connects directly to the configured backend origin. Configure Spring Boot CORS to allow the local dashboard origin (`http://localhost:5173`) and the production Vercel dashboard origin.

## Features

- Compact navigation focused on flow monitoring, incident creation, and analysis insights
- Full incident details with original payload JSON, model analysis, and processing timeline
- Browser-session flow activity with INFO/WARN/ERROR filtering and an API → Kafka → AI → response architecture illustration
- Incident submission form with loading, error, success, and returned analysis states
- Analysis insights with confidence visualization, severity summary, root cause, and recommended actions
- Responsive navigation and layouts for desktop, tablet, and mobile

## Quality checks

```bash
npm run build
npm run lint
```
