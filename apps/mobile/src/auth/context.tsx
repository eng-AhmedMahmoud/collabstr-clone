import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api, tokens } from "../api/client";

export type Me = {
  id: string;
  email: string;
  name: string;
  role: "brand" | "creator" | "admin";
  avatarUrl?: string | null;
  creatorUsername?: string | null;
  brandName?: string | null;
  locale: "en" | "ar";
};

type AuthResponse = Me & { accessToken: string; refreshToken: string };

type AuthCtx = {
  me: Me | null;
  loading: boolean;
  hydrated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (input: {
    name: string; email: string; password: string;
    role: "brand" | "creator"; locale?: "en" | "ar";
  }) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const user = await api<Me>("/auth/me");
      setMe(user);
    } catch {
      setMe(null);
    }
  }, []);

  useEffect(() => {
    (async () => {
      const { access } = await tokens.get();
      if (access) await refresh();
      setHydrated(true);
    })();
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await api<AuthResponse>("/auth/login", {
        method: "POST",
        auth: false,
        body: { email, password },
      });
      await tokens.set(res.accessToken, res.refreshToken);
      setMe({
        id: res.id, email: res.email, name: res.name, role: res.role,
        locale: res.locale,
      });
      // fetch full /me (includes avatarUrl, creatorUsername, brandName)
      await refresh();
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  const signup = useCallback(async (input: {
    name: string; email: string; password: string;
    role: "brand" | "creator"; locale?: "en" | "ar";
  }) => {
    setLoading(true);
    try {
      const res = await api<AuthResponse>("/auth/signup", {
        method: "POST",
        auth: false,
        body: input,
      });
      await tokens.set(res.accessToken, res.refreshToken);
      setMe({
        id: res.id, email: res.email, name: res.name, role: res.role,
        locale: res.locale,
      });
      await refresh();
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  const logout = useCallback(async () => {
    try {
      await api("/auth/logout", { method: "POST" });
    } catch { /* ignore */ }
    await tokens.clear();
    setMe(null);
  }, []);

  const value = useMemo<AuthCtx>(
    () => ({ me, loading, hydrated, login, signup, logout, refresh }),
    [me, loading, hydrated, login, signup, logout, refresh],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth outside AuthProvider");
  return v;
}
