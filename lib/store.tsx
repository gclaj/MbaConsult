"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { EMPTY_CANDIDATE, PROFILES, type ProfileId } from "./profiles";
import type {
  CandidateProfile,
  EssayDraft,
  FitProfile,
  InterviewQuestion,
  SchoolIntel,
  Story,
} from "./types";

export { EMPTY_CANDIDATE };
export type { ProfileId };

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

const BASE: Omit<AppState, "candidate"> = {
  step: 0,
  dossier: "",
  notes: "",
  intel: null,
  fit: null,
  questions: [],
  stories: [],
  drafts: [],
};

function initialFor(profile: ProfileId): AppState {
  return { ...BASE, candidate: PROFILES[profile].candidate };
}

const PROFILE_KEY = "mba-consult-active-profile";
const stateKey = (profile: ProfileId) => `mba-consult-state-v2:${profile}`;
const LEGACY_KEY = "mba-consult-state-v1";

function loadState(profile: ProfileId): AppState {
  try {
    const saved = localStorage.getItem(stateKey(profile));
    if (saved) return { ...initialFor(profile), ...JSON.parse(saved) };
    if (profile === "chris") {
      // migrate pre-profiles single-user state into the Chris profile
      const legacy = localStorage.getItem(LEGACY_KEY);
      if (legacy) {
        const parsed = JSON.parse(legacy) as Partial<AppState>;
        localStorage.removeItem(LEGACY_KEY);
        return {
          ...initialFor(profile),
          ...parsed,
          candidate: {
            ...PROFILES.chris.candidate,
            ...(parsed.candidate?.targetSchool ? parsed.candidate : {}),
          },
        };
      }
    }
  } catch {
    // corrupted state — start fresh
  }
  return initialFor(profile);
}

interface StoreValue {
  profile: ProfileId;
  setProfile: (profile: ProfileId) => void;
  state: AppState;
  update: (patch: Partial<AppState>) => void;
  reset: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<ProfileId>("chris");
  const [state, setState] = useState<AppState>(() => initialFor("chris"));
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(PROFILE_KEY);
    const active: ProfileId = saved === "guest" ? "guest" : "chris";
    setProfileState(active);
    setState(loadState(active));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(stateKey(profile), JSON.stringify(state));
    } catch {
      // storage full — dossiers can be large; drop the free-text dossier
      try {
        localStorage.setItem(
          stateKey(profile),
          JSON.stringify({ ...state, dossier: "" }),
        );
      } catch {
        // give up silently
      }
    }
  }, [state, profile, hydrated]);

  const value = useMemo<StoreValue>(
    () => ({
      profile,
      setProfile: (next) => {
        if (next === profile) return;
        localStorage.setItem(PROFILE_KEY, next);
        setProfileState(next);
        setState(loadState(next));
      },
      state,
      update: (patch) => setState((s) => ({ ...s, ...patch })),
      reset: () => {
        localStorage.removeItem(stateKey(profile));
        setState(initialFor(profile));
      },
    }),
    [state, profile],
  );

  if (!hydrated) return null;

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
