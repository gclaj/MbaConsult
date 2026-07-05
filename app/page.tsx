"use client";

import StepEssays from "@/components/StepEssays";
import StepFit from "@/components/StepFit";
import StepInterview from "@/components/StepInterview";
import StepResearch from "@/components/StepResearch";
import StepSetup from "@/components/StepSetup";
import { StoreProvider, useStore } from "@/lib/store";

const STEPS = [
  "1 · Profile",
  "2 · School Research",
  "3 · Fit Profile",
  "4 · Story Interview",
  "5 · Essays",
];

function stepUnlocked(step: number, state: ReturnType<typeof useStore>["state"]) {
  switch (step) {
    case 0:
      return true;
    case 1:
      return Boolean(state.candidate.targetSchool);
    case 2:
      return Boolean(state.intel);
    case 3:
      return Boolean(state.fit);
    case 4:
      return state.stories.some((s) => s.accepted);
    default:
      return false;
  }
}

function Wizard() {
  const { state, update, reset, profile, setProfile } = useStore();

  return (
    <div className="container">
      <header className="app-header">
        <h1 className="logo">
          AdCom<span>Pilot</span>
        </h1>
        <div className="profile-tabs">
          <button
            className={`step-chip ${profile === "chris" ? "active" : ""}`}
            onClick={() => setProfile("chris")}
            title="Pre-loaded with Chris's full dossier: strategic context, prior essays, reapplication status"
          >
            Chris Lajeunesse
          </button>
          <button
            className={`step-chip ${profile === "guest" ? "active" : ""}`}
            onClick={() => setProfile("guest")}
            title="Blank profile for another applicant — no personal data preloaded"
          >
            Guest
          </button>
          <button
            className="ghost"
            onClick={() => {
              if (
                confirm(
                  `Start over for the "${profile}" profile? Its progress will be erased.`,
                )
              )
                reset();
            }}
          >
            Start over
          </button>
        </div>
      </header>
      <p className="tagline">
        Your MBA consultant and seasoned AdCom — research, fit scoring, story
        discovery, and essays in your own voice.
        {profile === "chris" && (
          <>
            {" "}
            <b style={{ color: "var(--green)" }}>
              Chris mode: strategic context, prior essays, and reapplication
              rules load automatically.
            </b>
          </>
        )}
      </p>

      <nav className="stepper">
        {STEPS.map((label, i) => (
          <button
            key={label}
            className={`step-chip ${state.step === i ? "active" : ""} ${
              stepUnlocked(i + 1, state) ? "done" : ""
            }`}
            disabled={!stepUnlocked(i, state)}
            onClick={() => update({ step: i })}
          >
            {label}
          </button>
        ))}
      </nav>

      {state.step === 0 && <StepSetup />}
      {state.step === 1 && <StepResearch />}
      {state.step === 2 && <StepFit />}
      {state.step === 3 && <StepInterview />}
      {state.step === 4 && <StepEssays />}
    </div>
  );
}

export default function Page() {
  return (
    <StoreProvider>
      <Wizard />
    </StoreProvider>
  );
}
