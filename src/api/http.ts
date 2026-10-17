import axios from "axios";

export const useMockData = import.meta.env.VITE_USE_MOCK_DATA !== "false";

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080",
  headers: { "Content-Type": "application/json" },
  timeout: 15_000,
});
