"use client";

import { create } from "zustand";
import { api } from "@/lib/http";

// ---------------------------------------------------------------------------
// Client-side profile types (mirror server shapes; bullets embedded in exp)
// ---------------------------------------------------------------------------
export interface BulletItem {
  id: string; text: string; tags: string[]; orderIndex: number;
}
export interface ExperienceItem {
  id: string; company: string; role: string; location: string;
  startDate: string; endDate: string; isCurrent: boolean;
  employmentType: string; tags: string[]; bulletIds: string[];
  bullets: BulletItem[]; orderIndex: number;
}
export interface PersonalInfo {
  fullName: string; headline: string; email: string; phone: string;
  city: string; country: string; nationality: string;
  dateOfBirth: string; website: string; photoUrl: string;
  links: { id: string; label: string; url: string }[];
  includeDateOfBirth: boolean; includePhoto: boolean;
}
export interface ProfileData {
  id: string;
  headline: string;
  personalInfo: PersonalInfo;
  summaries: { id: string; label: string; text: string; orderIndex: number }[];
  experience: ExperienceItem[];
  education: Record<string, unknown>[];
  skills: Record<string, unknown>[];
  languages: Record<string, unknown>[];
  certifications: Record<string, unknown>[];
  projects: Record<string, unknown>[];
  publications: Record<string, unknown>[];
  awards: Record<string, unknown>[];
  volunteer: Record<string, unknown>[];
  references: Record<string, unknown>[];
  customSections: Record<string, unknown>[];
}

export type SectionKey = keyof Pick<
  ProfileData,
  "summaries" | "experience" | "education" | "skills" | "languages" | "certifications" |
    "projects" | "publications" | "awards" | "volunteer" | "references" | "customSections"
>;

type SaveState = "idle" | "saving" | "saved";

interface ProfileState {
  status: "idle" | "loading" | "ready" | "error";
  error: string | null;
  profileId: string | null;
  headline: string;
  personalInfo: PersonalInfo;
  sections: Record<SectionKey, unknown[]>;
  saveState: SaveState;
  lastSavedAt: number | null;

  load: () => Promise<void>;
  updateMeta: (patch: { headline?: string; personalInfo?: Partial<PersonalInfo> }) => void;
  addItem: (key: SectionKey, init?: Record<string, unknown>) => void;
  updateItem: (key: SectionKey, id: string, patch: Record<string, unknown>) => void;
  removeItem: (key: SectionKey, id: string) => void;
  moveItem: (key: SectionKey, id: string, dir: -1 | 1) => void;
  flush: () => Promise<void>;
  dirtyCount: () => number;
  undo: () => void;
}

const BLANK_PERSONAL: PersonalInfo = {
  fullName: "", headline: "", email: "", phone: "", city: "", country: "",
  nationality: "", dateOfBirth: "", website: "", photoUrl: "",
  links: [], includeDateOfBirth: false, includePhoto: false,
};

const SECTION_KEYS = [
  "summaries", "experience", "education", "skills", "languages", "certifications",
  "projects", "publications", "awards", "volunteer", "references", "customSections",
] as SectionKey[];

function emptySections(): Record<SectionKey, unknown[]> {
  return {
    summaries: [], experience: [], education: [], skills: [], languages: [],
    certifications: [], projects: [], publications: [], awards: [], volunteer: [],
    references: [], customSections: [],
  };
}

const uid = () =>
  `new_${(typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Date.now().toString(36)).slice(0, 10)}`;

export const useProfile = create<ProfileState>((set, get) => {
  let history: {
    headline: string; personalInfo: PersonalInfo; sections: Record<SectionKey, unknown[]>;
  }[] = [];
  let saveTimer: ReturnType<typeof setTimeout> | null = null;
  let dirtySections = new Set<SectionKey>();
  let dirtyMeta = false;

  const snapshot = () => {
    history = [...history.slice(-49), {
      headline: get().headline,
      personalInfo: get().personalInfo,
      sections: get().sections,
    }];
  };

  const scheduleSave = () => {
    set({ saveState: "saving" });
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => void get().flush(), 750);
  };

  return {
    status: "idle",
    error: null,
    profileId: null,
    headline: "",
    personalInfo: { ...BLANK_PERSONAL },
    sections: emptySections(),
    saveState: "idle",
    lastSavedAt: null,

    load: async () => {
      set({ status: "loading", error: null });
      try {
        const res = await api.get<{ ok: boolean; data: ProfileData }>("/api/profile");
        const d = res.data;
        const sections = emptySections();
        for (const k of SECTION_KEYS) sections[k] = (d[k] as unknown[]) ?? [];
        set({
          status: "ready",
          profileId: d.id,
          headline: d.headline ?? "",
          personalInfo: { ...BLANK_PERSONAL, ...(d.personalInfo ?? {}) },
          sections,
        });
      } catch (err) {
        set({ status: "error", error: err instanceof Error ? err.message : "Failed to load profile" });
      }
    },

    updateMeta: (patch) => {
      snapshot();
      dirtyMeta = true;
      set((s) => ({
        headline: patch.headline !== undefined ? patch.headline : s.headline,
        personalInfo: patch.personalInfo ? { ...s.personalInfo, ...patch.personalInfo } : s.personalInfo,
      }));
      scheduleSave();
    },

    addItem: (key, factory) => {
      snapshot();
      set((s) => ({
        sections: { ...s.sections, [key]: [...(s.sections[key] ?? []), { id: uid(), orderIndex: (s.sections[key] ?? []).length, ...(factory ?? {}) }] },
      }));
      dirtySections.add(key);
      scheduleSave();
    },

    updateItem: (key, id, patch) => {
      snapshot();
      set((s) => {
        const items = (s.sections[key] ?? []) as Record<string, unknown>[];
        return {
          sections: {
            ...s.sections,
            [key]: items.map((it) =>
              it.id === id ? { ...it, ...patch } : it,
            ),
          },
        };
      });
      dirtySections.add(key);
      scheduleSave();
    },

    removeItem: (key, id) => {
      snapshot();
      set((s) => {
        const items = (s.sections[key] ?? []) as Record<string, unknown>[];
        return {
          sections: {
            ...s.sections,
            [key]: items.filter((it) => it.id !== id),
          },
        };
      });
      dirtySections.add(key);
      scheduleSave();
    },

    moveItem: (key, id, dir) => {
      snapshot();
      set((s) => {
        const items = [...((s.sections[key] ?? []) as Record<string, unknown>[])];
        const idx = items.findIndex((it) => it.id === id);
        const swap = idx + dir;
        if (idx < 0 || swap < 0 || swap >= items.length) return {};
        [items[idx], items[swap]] = [items[swap], items[idx]];
        return { sections: { ...s.sections, [key]: items } };
      });
      dirtySections.add(key);
      scheduleSave();
    },

    flush: async () => {
      if (saveTimer) { clearTimeout(saveTimer); saveTimer = null; }

      const metaDirty = dirtyMeta;
      dirtyMeta = false;
      if (metaDirty) {
        await api.patch("/api/profile", {
          headline: get().headline,
          personalInfo: { ...get().personalInfo, links: get().personalInfo.links ?? [] },
        }).catch(() => {});
      }

      const pending = [...dirtySections];
      dirtySections = new Set();
      set({ saveState: "saving" });
      for (const key of pending) {
        await api
          .patch(`/api/profile/${key}`, { items: get().sections[key] ?? [] })
          .catch((err) => console.error(`[profile] save ${key}:`, err?.message ?? err));
      }
      set({ saveState: "saved", lastSavedAt: Date.now() });
    },

    dirtyCount: () => dirtySections.size + (dirtyMeta ? 1 : 0),

    undo: () => {
      const snap = history.pop();
      if (!snap) return;
      set({ headline: snap.headline, personalInfo: snap.personalInfo, sections: snap.sections });
      dirtySections = new Set(Object.keys(snap.sections) as SectionKey[]);
      dirtyMeta = true;
      scheduleSave();
    },
  };
});