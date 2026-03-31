import { createContext, useEffect, useMemo, useState } from "react";
import * as authService from "../../services/auth/authService";
import type { AuthUser } from "../../services/auth/authService";

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

type Props = {
  children: React.ReactNode;
};

export default function AuthProvider({ children }: Props) {
  const [bootSession] = useState(() => authService.getStoredAuth());
  const [user, setUser] = useState<AuthUser | null>(bootSession?.user ?? null);
  const [token, setToken] = useState<string | null>(bootSession?.token ?? null);
  const [isLoading, setIsLoading] = useState(Boolean(bootSession));

  useEffect(() => {
    const bootstrap = async () => {
      const restored = await authService.ensureValidSession();
      if (!restored) {
        setUser(null);
        setToken(null);
        setIsLoading(false);
        return;
      }
      setUser(restored.user);
      setToken(restored.token);
      setIsLoading(false);
    };

    if (!bootSession) {
      setIsLoading(false);
      return;
    }

    void bootstrap();
  }, [bootSession]);

  useEffect(() => {
    if (!token) return;

    const interval = window.setInterval(() => {
      if (authService.hasValidAccessToken()) {
        return;
      }

      void authService.ensureValidSession().then((restored) => {
        if (!restored) {
          setUser(null);
          setToken(null);
          return;
        }
        setUser(restored.user);
        setToken(restored.token);
      });
    }, 30_000);

    return () => window.clearInterval(interval);
  }, [token]);

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authService.login({ email, password });
      setUser(response.user);
      setToken(response.token);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token),
      isLoading,
      login: handleLogin,
      logout: handleLogout
    }),
    [user, token, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
