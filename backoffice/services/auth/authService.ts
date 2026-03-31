import { sessionStore } from "./session";

type LoginPayload = {
  email: string;
  password: string;
};

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Manager" | "Security" | "Resident";
};

type LoginApiResponse = {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  expiresInSeconds: number;
  user: {
    id: string;
    fullName: string;
    email: string;
    role: "Admin" | "Manager" | "Security" | "Resident";
  };
};

type RefreshApiResponse = {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  expiresInSeconds: number;
  user: {
    id: string;
    fullName: string;
    email: string;
    role: "Admin" | "Manager" | "Security" | "Resident";
  };
};

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "http://localhost:4000/v1";

export async function login(payload: LoginPayload): Promise<{ token: string; user: AuthUser }> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email: payload.email,
      password: payload.password
    })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || "Login failed. Check API server and credentials.");
  }

  const data = (await response.json()) as LoginApiResponse;
  const auth = {
    token: data.accessToken,
    refreshToken: data.refreshToken,
    accessTokenExpiresAt: data.accessTokenExpiresAt,
    user: {
      id: data.user.id,
      name: data.user.fullName,
      email: data.user.email,
      role: data.user.role
    }
  };
  sessionStore.set(auth);
  return auth;
}

export async function logout() {
  const session = sessionStore.get();
  if (session?.refreshToken) {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          refreshToken: session.refreshToken
        })
      });
    } catch {
      // If logout API fails, local session is still cleared.
    }
  }
  sessionStore.clear();
}

export function getStoredAuth(): { token: string; user: AuthUser } | null {
  const session = sessionStore.get();
  if (!session) {
    return null;
  }

  return {
    token: session.token,
    user: {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      role: session.user.role
    }
  };
}

export function hasValidAccessToken(): boolean {
  const session = sessionStore.get();
  if (!session) return false;
  return Date.now() < new Date(session.accessTokenExpiresAt).getTime() - 15_000;
}

export async function refreshAccessToken(): Promise<{ token: string; user: AuthUser } | null> {
  const session = sessionStore.get();
  if (!session?.refreshToken) return null;

  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      refreshToken: session.refreshToken
    })
  });

  if (!response.ok) {
    sessionStore.clear();
    return null;
  }

  const data = (await response.json()) as RefreshApiResponse;
  const updatedSession = {
    token: data.accessToken,
    refreshToken: data.refreshToken,
    accessTokenExpiresAt: data.accessTokenExpiresAt,
    user: {
      id: data.user.id,
      name: data.user.fullName,
      email: data.user.email,
      role: data.user.role
    }
  };
  sessionStore.set(updatedSession);
  return {
    token: updatedSession.token,
    user: updatedSession.user
  };
}

export async function ensureValidSession(): Promise<{ token: string; user: AuthUser } | null> {
  const session = getStoredAuth();
  if (!session) return null;
  if (hasValidAccessToken()) {
    return session;
  }
  return refreshAccessToken();
}
