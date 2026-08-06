export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

/** Thin JSON fetch wrapper for our API. Throws ApiError on non-OK. */
export async function apiFetch<T = unknown>(
  url: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    ...init,
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const message =
      (json && typeof json === "object" && "error" in json && (json as { error?: string }).error) ||
      `Request failed (${res.status})`;
    throw new ApiError(message, res.status);
  }
  return json as T;
}

export const api = {
  get: <T>(url: string) => apiFetch<T>(url),
  post: <T>(url: string, body?: unknown) =>
    apiFetch<T>(url, { method: "POST", body: JSON.stringify(body ?? {}) }),
  patch: <T>(url: string, body?: unknown) =>
    apiFetch<T>(url, { method: "PATCH", body: JSON.stringify(body ?? {}) }),
  put: <T>(url: string, body?: unknown) =>
    apiFetch<T>(url, { method: "PUT", body: JSON.stringify(body ?? {}) }),
  del: <T>(url: string) => apiFetch<T>(url, { method: "DELETE" }),
};