"use client";

import { useStore } from "@/lib/store";
import type { CandidateProfile } from "@/lib/types";

export default function StepSetup() {
  const { state, update } = useStore();
  const c = state.candidate;

  const set = (patch: Partial<CandidateProfile>) =>
    update({ candidate: { ...c, ...patch } });

  const ready =
    c.targetSchool.trim() &&
    c.gpa.trim() &&
    c.yearsExperience.trim() &&
    c.currentRole.trim() &&
    c.shortTermGoal.trim() &&
    c.writingSample.trim().length >= 200;

  return (
    <>
      <div className="card">
        <h2>Target program</h2>
        <p className="sub">
          Which MBA program are you applying to? Be specific (e.g. “Wharton”,
          “Kellogg Full-Time MBA”, “Stanford GSB”).
        </p>
        <label className="field">
          <b>Target school / program *</b>
          <input
            value={c.targetSchool}
            onChange={(e) => set({ targetSchool: e.target.value })}
            placeholder="e.g. Columbia Business School"
          />
        </label>
      </div>

      <div className="card">
        <h2>Your stats</h2>
        <p className="sub">
          These get benchmarked against the school’s Class Profile.
        </p>
        <div className="grid2">
          <label className="field">
            <b>Name</b>
            <input value={c.name} onChange={(e) => set({ name: e.target.value })} />
          </label>
          <label className="field">
            <b>Undergrad institution</b>
            <input
              value={c.undergrad}
              onChange={(e) => set({ undergrad: e.target.value })}
            />
          </label>
          <label className="field">
            <b>Major</b>
            <input value={c.major} onChange={(e) => set({ major: e.target.value })} />
          </label>
          <label className="field">
            <b>GPA *</b>
            <input
              value={c.gpa}
              onChange={(e) => set({ gpa: e.target.value })}
              placeholder="e.g. 3.6 / 4.0"
            />
          </label>
          <label className="field">
            <b>Test</b>
            <select
              value={c.testType}
              onChange={(e) =>
                set({ testType: e.target.value as CandidateProfile["testType"] })
              }
            >
              <option>GMAT</option>
              <option>GRE</option>
              <option>EA</option>
              <option>Not taken yet</option>
            </select>
          </label>
          <label className="field">
            <b>Score</b>
            <input
              value={c.testScore}
              onChange={(e) => set({ testScore: e.target.value })}
              placeholder="e.g. 715"
            />
          </label>
        </div>
      </div>

      <div className="card">
        <h2>Professional background</h2>
        <div className="grid2">
          <label className="field">
            <b>Years of work experience *</b>
            <input
              value={c.yearsExperience}
              onChange={(e) => set({ yearsExperience: e.target.value })}
              placeholder="e.g. 5"
            />
          </label>
          <label className="field">
            <b>Industry</b>
            <input
              value={c.industry}
              onChange={(e) => set({ industry: e.target.value })}
              placeholder="e.g. Management consulting"
            />
          </label>
          <label className="field">
            <b>Current role *</b>
            <input
              value={c.currentRole}
              onChange={(e) => set({ currentRole: e.target.value })}
              placeholder="e.g. Senior Consultant"
            />
          </label>
          <label className="field">
            <b>Employer</b>
            <input
              value={c.employer}
              onChange={(e) => set({ employer: e.target.value })}
            />
          </label>
        </div>
        <label className="field">
          <b>Short-term post-MBA goal *</b>
          <textarea
            value={c.shortTermGoal}
            onChange={(e) => set({ shortTermGoal: e.target.value })}
            placeholder="Role, industry, geography — and why"
          />
        </label>
        <label className="field">
          <b>Long-term goal</b>
          <textarea
            value={c.longTermGoal}
            onChange={(e) => set({ longTermGoal: e.target.value })}
          />
        </label>
      </div>

      <div className="card">
        <h2>Leadership, community & anything else</h2>
        <div className="grid2">
          <label className="field">
            <b>Leadership highlights</b>
            <textarea
              value={c.leadership}
              onChange={(e) => set({ leadership: e.target.value })}
              placeholder="Teams led, initiatives owned, promotions, impact"
            />
          </label>
          <label className="field">
            <b>Extracurriculars & community involvement</b>
            <textarea
              value={c.extracurriculars}
              onChange={(e) => set({ extracurriculars: e.target.value })}
              placeholder="Volunteering, boards, clubs, hobbies, athletics"
            />
          </label>
        </div>
        <label className="field">
          <b>Additional background (optional)</b>
          <textarea
            value={c.background}
            onChange={(e) => set({ background: e.target.value })}
            placeholder="First-gen, international, career pivot, military, anything the AdCom should know — or paste your resume"
          />
        </label>
      </div>

      <div className="card">
        <h2>Writing sample</h2>
        <p className="sub">
          Paste 200+ words of YOUR writing (an old essay, a long email, a blog
          post). The final essays are written to match your voice, tone, and
          style — this is what makes them sound like you.
        </p>
        <label className="field">
          <b>Writing sample * ({c.writingSample.trim().length} chars — need 200+)</b>
          <textarea
            style={{ minHeight: 160 }}
            value={c.writingSample}
            onChange={(e) => set({ writingSample: e.target.value })}
          />
        </label>
      </div>

      <div className="actions">
        <button
          className="primary"
          disabled={!ready}
          onClick={() => update({ step: 1 })}
        >
          Continue → Research {c.targetSchool || "the school"}
        </button>
      </div>
    </>
  );
}
