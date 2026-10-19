import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import AppShell from "./components/AppShell";
import { IncidentAnalysisProvider } from "./contexts/IncidentAnalysisProvider";

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    hydrateFallbackElement: <div className="app-startup"><span className="spinner" />Loading Signal…</div>,
    children: [
      { index: true, element: <Navigate to="/logs" replace /> },
      { path: "incidents", element: <Navigate to="/logs" replace /> },
      { path: "incidents/:incidentId", lazy: async () => ({ Component: (await import("./pages/IncidentDetailPage")).default }) },
      { path: "logs", lazy: async () => ({ Component: (await import("./pages/LogsPage")).default }) },
      { path: "create", lazy: async () => ({ Component: (await import("./pages/CreateIncidentPage")).default }) },
      { path: "insights", lazy: async () => ({ Component: (await import("./pages/InsightsPage")).default }) },
      { path: "insights/:incidentId", lazy: async () => ({ Component: (await import("./pages/InsightsPage")).default }) },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);

export default function App() {
  return <IncidentAnalysisProvider><RouterProvider router={router} /></IncidentAnalysisProvider>;
}
