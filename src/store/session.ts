"use client";

import { create } from "zustand";
import { api } from "@/lib/http";

export interface SessionUser {
  userId: string;
  email: string;
  name?: string;
}

type SessionState = {
  status: "loading" | "authenticated" | "anonymous";
  user: SessionUser | null;
  /** load the current session from /api/auth/session (called on mount) */
  refresh: () => Promise<void>;
  setUser: (user: SessionUser | null) => void;
  login: (payload: { email: string; password: string; name?: string }) => Promise<void>;
  signup: (payload: { email: string; password: string; name: string }) => Promise<void>;
  logout: () => Promise<void>;
};

export const useSession = create<SessionState>((set, get) => ({
  status: "loading",
  user: null,

  refresh: async () => {
    try {
      const res = await api.get<{ ok: boolean; data: SessionUser | null }>(
        "/api/auth/session",
      );
      const user = res.data;
      set({ user, status: user ? "authenticated" : "anonymous" });
    } catch {
      set({ user: null, status: "anonymous" });
    }
  },

  login: async (payload) => {
    await api.post("/api/auth/login", payload);
    await get().refresh();
  },

  signup: async (payload) => {
    await api.post("/api/auth/signup", payload);
    await get().refresh();
  },

  logout: async () => {
    await api.post("/api/auth/logout");
    set({ user: null, status: "anonymous" });
  },

  setUser: (user) => set({ user, status: user ? "authenticated" : "anonymous" }),
}));