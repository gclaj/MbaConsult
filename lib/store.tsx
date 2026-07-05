"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  CandidateProfile,
  EssayDraft,
  FitProfile,
  InterviewQuestion,
  SchoolIntel,
  Story,
} from "./types";

export const EMPTY_CANDIDATE: CandidateProfile = {
  name: "",
  targetSchool: "",
  gpa: "",
  undergrad: "",
  major: "",
  testType: "GMAT",
  testScore: "",
  yearsExperience: "",
  industry: "",
  currentRole: "",
  employer: "",
  shortTermGoal: "",
  longTermGoal: "",
  leadership: "",
  extracurriculars: "",
  background: "",
  writingSample: "",
};

export interface AppState {
  step: number;
  candidate: CandidateProfile;
  dossier: string;
  notes: string;
  intel: SchoolIntel | null;
  fit: FitProfile | null;
  questions: InterviewQuestion[];
  stories: Story[];
  drafts: EssayDraft[];
}

const INITIAL: AppState = {
  step: 0,
  candidate: EMPTY_CANDIDATE,
  dossier: "",
  notes: "",
  intel: null,
  fit: null,
  questions: [],
  stories: [],
  drafts: [],
};

const STORAGE_KEY = "mba-consult-state-v1";

interface StoreValue {
  state: AppState;
  update: (patch: Partial<AppState>) => void;
  reset: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(INITIAL);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setState({ ...INITIAL, ...JSON.parse(saved) });
    } catch {
      // corrupted state — start fresh
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // storage full — dossiers can be large; drop the free-text dossier
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ ...state, dossier: "" }),
        );
      } catch {
        // give up silently
      }
    }
  }, [state, hydrated]);

  const value = useMemo<StoreValue>(
    () => ({
      state,
      update: (patch) => setState((s) => ({ ...s, ...patch })),
      reset: () => {
        localStorage.removeItem(STORAGE_KEY);
        setState(INITIAL);
      },
    }),
    [state],
  );

  if (!hydrated) return null;

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
