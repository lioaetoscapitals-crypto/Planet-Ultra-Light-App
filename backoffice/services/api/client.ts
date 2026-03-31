import { sessionStore } from "../auth/session";
import { refreshAccessToken } from "../auth/authService";

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  token?: string;
};

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "http://localhost:4000/v1";
const API_ROLE_FALLBACK = (import.meta.env.VITE_API_ROLE as string | undefined) ?? "Admin";
const API_USER_ID_FALLBACK = (import.meta.env.VITE_API_USER_ID as string | undefined) ?? "usr-admin-001";

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, token } = options;
  const url = `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  const session = sessionStore.get();

  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token || session?.token ? { Authorization: `Bearer ${token ?? session?.token}` } : {}),
      "x-role": session?.user.role ?? API_ROLE_FALLBACK,
      "x-user-id": session?.user.id ?? API_USER_ID_FALLBACK
    },
    body: body ? JSON.stringify(body) : undefined
  });

  if (response.status === 401 && !path.startsWith("/auth/")) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      const retryResponse = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${refreshed.token}`,
          "x-role": refreshed.user.role,
          "x-user-id": refreshed.user.id
        },
        body: body ? JSON.stringify(body) : undefined
      });

      if (!retryResponse.ok) {
        const retryText = await retryResponse.text();
        throw new Error(`API ${method} ${path} failed (${retryResponse.status}): ${retryText || retryResponse.statusText}`);
      }

      return (await retryResponse.json()) as T;
    }
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API ${method} ${path} failed (${response.status}): ${text || response.statusText}`);
  }

  return (await response.json()) as T;
}
