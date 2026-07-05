"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";

function scoreColor(score: number): string {
  if (score >= 75) return "var(--green)";
  if (score >= 55) return "var(--amber)";
  return "var(--red)";
}

export default function StepFit() {
  const { state, update } = useStore();
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");

  const run = async () => {
    setRunning(true);
    setError("");
    try {
      const res = await fetch("/api/fit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidate: state.candidate,
          intel: state.intel,
          dossier: state.dossier,
          notes: state.notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Fit analysis failed");
      update({ fit: data.fit, questions: [], stories: [], drafts: [] });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fit analysis failed");
    } finally {
      setRunning(false);
    }
  };

  const fit = state.fit;

  return (
    <>
      <div className="card">
        <h2>Fit profile — you × {state.intel?.school}</h2>
        <p className="sub">
          An honest AdCom-style read: your stats vs the class profile, your
          goals vs the employment pipeline, your interests vs the school’s
          institutes and culture.
        </p>
        {!running && (
          <button className="primary" onClick={run}>
            {fit ? "Re-run fit analysis" : "Analyze my fit"}
          </button>
        )}
        {running && (
          <p className="status-line">
            <span className="spinner" />
            The AdCom is reading your file…
          </p>
        )}
        {error && <p className="error-line">{error}</p>}
      </div>

      {fit && !running && (
        <>
          <div className="card">
            <div className="score-hero">
              <div
                className="score-ring"
                style={{
                  border: `4px solid ${scoreColor(fit.overallScore)}`,
                  color: scoreColor(fit.overallScore),
                }}
              >
                {fit.overallScore}
              </div>
              <div>
                <h2 style={{ margin: 0 }}>{fit.verdict}</h2>
                <p style={{ margin: "6px 0 0", fontSize: 14.5 }}>{fit.summary}</p>
              </div>
            </div>

            {fit.dimensions.map((d) => (
              <div className="dim-row" key={d.name} title={d.rationale}>
                <div className="dim-name">{d.name}</div>
                <div className="dim-bar">
                  <div
                    className="dim-fill"
                    style={{
                      width: `${d.score}%`,
                      background: scoreColor(d.score),
                    }}
                  />
                </div>
                <div className="dim-score">{d.score}</div>
              </div>
            ))}
            <p className="progress-note">Hover a dimension for the rationale.</p>
          </div>

          {fit.careerPathAnalysis && (
            <div className="card">
              <h2>Career trajectory × {state.intel?.school} employment report</h2>
              <p className="sub">
                Your projected paths, cross-referenced against where this
                school actually places graduates.
              </p>
              <div
                className="eval-box strong"
                style={{ marginTop: 0, marginBottom: 16 }}
              >
                <p>
                  <span className="eval-label">Recommended path at this school</span>
                  <br />
                  <b>{fit.careerPathAnalysis.recommendedPath}</b>
                </p>
                <p>{fit.careerPathAnalysis.recommendationRationale}</p>
              </div>
              {fit.careerPathAnalysis.paths.map((p) => (
                <div key={p.path} style={{ marginBottom: 14 }}>
                  <b>{p.path}</b>
                  <div className="dim-row">
                    <div className="dim-name">School pipeline strength</div>
                    <div className="dim-bar">
                      <div
                        className="dim-fill"
                        style={{
                          width: `${p.pipelineStrength}%`,
                          background: scoreColor(p.pipelineStrength),
                        }}
                      />
                    </div>
                    <div className="dim-score">{p.pipelineStrength}</div>
                  </div>
                  <div className="dim-row">
                    <div className="dim-name">Your background alignment</div>
                    <div className="dim-bar">
                      <div
                        className="dim-fill"
                        style={{
                          width: `${p.backgroundAlignment}%`,
                          background: scoreColor(p.backgroundAlignment),
                        }}
                      />
                    </div>
                    <div className="dim-score">{p.backgroundAlignment}</div>
                  </div>
                  <div className="dim-row">
                    <div className="dim-name">
                      <b>Overall viability</b>
                    </div>
                    <div className="dim-bar">
                      <div
                        className="dim-fill"
                        style={{
                          width: `${p.overallViability}%`,
                          background: scoreColor(p.overallViability),
                        }}
                      />
                    </div>
                    <div className="dim-score">{p.overallViability}</div>
                  </div>
                  <p style={{ margin: "4px 0", fontSize: 13.5 }}>{p.rationale}</p>
                  <p
                    style={{
                      margin: "4px 0",
                      fontSize: 12.5,
                      color: "var(--muted)",
                    }}
                  >
                    Employment-report evidence: {p.evidence}
                  </p>
                </div>
              ))}
            </div>
          )}

          <div className="card">
            <h3 style={{ marginTop: 0 }}>Strengths to lead with</h3>
            <ul className="tight">
              {fit.strengths.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
            <h3>Gaps to address</h3>
            <ul className="tight">
              {fit.gaps.map((g) => (
                <li key={g}>{g}</li>
              ))}
            </ul>
            <h3>Positioning</h3>
            <p style={{ fontSize: 14.5 }}>{fit.positioning}</p>
            <h3>What this school’s ideal admit looks like</h3>
            <div className="pill-list">
              {fit.idealCandidateTraits.map((t) => (
                <span className="pill" key={t}>
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 style={{ marginTop: 0 }}>Per-essay strategy</h3>
            {fit.essayStrategies.map((s) => (
              <div key={s.essayTitle} style={{ marginBottom: 14 }}>
                <b>{s.essayTitle}</b>
                <p style={{ margin: "4px 0", fontSize: 14 }}>{s.strategy}</p>
                <div className="pill-list">
                  {s.storyTypesNeeded.map((t) => (
                    <span className="pill" key={t}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="actions">
            <button className="secondary" onClick={() => update({ step: 1 })}>
              ← Back
            </button>
            <button className="primary" onClick={() => update({ step: 3 })}>
              Continue → Story interview
            </button>
          </div>
        </>
      )}
    </>
  );
}
