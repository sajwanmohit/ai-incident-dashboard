import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import AppShell from "./components/AppShell";

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    hydrateFallbackElement: <div className="app-startup"><span className="spinner" />Loading Signal…</div>,
    children: [
      { index: true, lazy: async () => ({ Component: (await import("./pages/OverviewPage")).default }) },
      { path: "incidents", lazy: async () => ({ Component: (await import("./pages/MonitorPage")).default }) },
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
  return <RouterProvider router={router} />;
}
