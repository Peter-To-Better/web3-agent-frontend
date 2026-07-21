import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

/**
 * Client-side axios instance. Always talks to same-origin `/api/*`
 * Next.js route handlers, which proxy to BACKEND_URL server-side.
 * This keeps the real backend host out of the browser and avoids CORS.
 */
export const httpClient = axios.create({
  baseURL: "/api",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

httpClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem("auth_token");
    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`);
    }
  }
  return config;
});

export class ApiError extends Error {
  status?: number;
  data?: unknown;

  constructor(message: string, status?: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

httpClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    const status = error.response?.status;
    const message = error.response?.data?.message ?? error.message ?? "網路請求失敗";
    return Promise.reject(new ApiError(message, status, error.response?.data));
  }
);
