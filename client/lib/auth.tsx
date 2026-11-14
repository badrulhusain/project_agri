"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createContext, useContext, useEffect, useState } from "react";
import { api, normalizeUser, readToken, roleHome, setAccessToken, type RegisterInput, type User } from "./api";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<User>;
  register: (input: RegisterInput) => Promise<User | null>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000, refetchOnWindowFocus: false } },
});

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const token = window.sessionStorage.getItem("vithu:access-token");
    if (!token) {
      queueMicrotask(() => { if (!cancelled) setLoading(false); });
      return () => { cancelled = true; };
    }
    setAccessToken(token);
    api<unknown>("auth/me")
      .then((result) => { if (!cancelled) setUser(normalizeUser(result)); })
      .catch(() => {
        window.sessionStorage.removeItem("vithu:access-token");
        setAccessToken(null);
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const clear = () => {
      window.sessionStorage.removeItem("vithu:access-token");
      setAccessToken(null);
      setUser(null);
      queryClient.clear();
    };
    window.addEventListener("vithu:unauthorized", clear);
    return () => window.removeEventListener("vithu:unauthorized", clear);
  }, []);

  async function establishSession(result: unknown): Promise<User> {
    const token = readToken(result);
    if (!token) throw new Error("The API did not return an access token.");
    setAccessToken(token);
    window.sessionStorage.setItem("vithu:access-token", token);
    try {
      const profile = normalizeUser(await api<unknown>("auth/me"));
      if (!profile) throw new Error("The API did not return a valid user role.");
      setUser(profile);
      return profile;
    } catch (error) {
      window.sessionStorage.removeItem("vithu:access-token");
      setAccessToken(null);
      throw error;
    }
  }

  async function login(identifier: string, password: string) {
    const result = await api<unknown>("auth/login", {
      method: "POST",
      body: JSON.stringify({ identifier, password }),
    });
    return establishSession(result);
  }

  async function register(input: RegisterInput) {
    const result = await api<unknown>("auth/register", {
      method: "POST",
      body: JSON.stringify(input),
    });
    if (readToken(result)) return establishSession(result);
    return null;
  }

  function logout() {
    window.sessionStorage.removeItem("vithu:access-token");
    setAccessToken(null);
    setUser(null);
    queryClient.clear();
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={{ user, loading, login, register, logout }}>
        {children}
      </AuthContext.Provider>
    </QueryClientProvider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AppProviders.");
  return context;
}

export { roleHome };
