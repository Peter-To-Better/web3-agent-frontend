import type { AxiosRequestConfig } from "axios";
import { httpClient } from "./http";

export async function apiGet<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const { data } = await httpClient.get<T>(url, config);
  return data;
}

export async function apiPost<T, D = unknown>(
  url: string,
  body?: D,
  config?: AxiosRequestConfig
): Promise<T> {
  const { data } = await httpClient.post<T>(url, body, config);
  return data;
}

export async function apiPut<T, D = unknown>(
  url: string,
  body?: D,
  config?: AxiosRequestConfig
): Promise<T> {
  const { data } = await httpClient.put<T>(url, body, config);
  return data;
}

export async function apiPatch<T, D = unknown>(
  url: string,
  body?: D,
  config?: AxiosRequestConfig
): Promise<T> {
  const { data } = await httpClient.patch<T>(url, body, config);
  return data;
}

export async function apiDelete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const { data } = await httpClient.delete<T>(url, config);
  return data;
}
