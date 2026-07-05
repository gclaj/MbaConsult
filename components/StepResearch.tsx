"use client";

import { useRef, useState } from "react";
import { useStore } from "@/lib/store";
import { streamRequest } from "@/lib/stream";
import type { SchoolIntel } from "@/lib/types";

export default function StepResearch() {
  const { state, update } = useStore();
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [liveText, setLiveText] = useState("");
  const boxRef = useRef<HTMLDivElement>(null);

  const run = async () => {
    setRunning(true);
    setError("");
    setLiveText("");
    setStatus("Starting research…");
    let text = "";
    try {
      await streamRequest(
        "/api/research",
        { school: state.candidate.targetSchool },
        (event) => {
          if (event.type === "status") setStatus(event.text as string);
          if (event.type === "delta") {
            text += event.text as string;
            setLiveText(text);
            boxRef.current?.scrollTo({ top: boxRef.current.scrollHeight });
          }
          if (event.type === "intel") {
            update({
              intel: event.data as SchoolIntel,
              dossier: (event.dossier as string) ?? text,
              // downstream results are stale if the school was re-researched
              fit: null,
              questions: [],
              stories: [],
              drafts: [],
            });
            setStatus("Research complete.");
          }
          if (event.type === "error") setError(event.text as string);
        },
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Research failed");
    } finally {
      setRunning(false);
    }
  };

  const intel = state.intel;

  return (
    <>
      <div className="card">
        <h2>School research — {state.candidate.targetSchool}</h2>
        <p className="sub">
          Live web research across the school’s admissions pages, Class
          Profile, employment report, institutes & centers, clubs, culture, and
          ClearAdmit / AdCom commentary. Takes a few minutes.
        </p>
        {!running && (
          <button className="primary" onClick={run}>
            {intel ? "Re-run research" : "Start research"}
          </button>
        )}
        {running && (
          <p className="status-line">
            <span className="spinner" />
            {status}
          </p>
        )}
        {error && <p className="error-line">{error}</p>}
        {(running || (!intel && liveText)) && liveText && (
          <div className="stream-box" ref={boxRef}>
            {liveText}
          </div>
        )}
      </div>

      {intel && !running && (
        <>
          <div className="card">
            <h2>
              {intel.school} — {intel.program}
            </h2>
            <p className="sub">{intel.applicationCycle}</p>
            <p>{intel.overview}</p>

            <h3>Essays required ({intel.essays.length})</h3>
            {intel.essays.map((e) => (
              <div key={e.title} style={{ marginBottom: 12 }}>
                <b>{e.title}</b>{" "}
                <span className="badge">{e.wordLimit}</span>{" "}
                <span className="badge">{e.type}</span>
                <p style={{ margin: "4px 0", fontSize: 14 }}>{e.prompt}</p>
              </div>
            ))}

            <h3>Class profile</h3>
            <div className="pill-list">
              {intel.classProfile.classSize && (
                <span className="pill">Class: {intel.classProfile.classSize}</span>
              )}
              {intel.classProfile.avgGpa && (
                <span className="pill">GPA: {intel.classProfile.avgGpa}</span>
              )}
              {intel.classProfile.avgGmat && (
                <span className="pill">GMAT: {intel.classProfile.avgGmat}</span>
              )}
              {intel.classProfile.gmatRange && (
                <span className="pill">Range: {intel.classProfile.gmatRange}</span>
              )}
              {intel.classProfile.avgWorkExperience && (
                <span className="pill">
                  Work exp: {intel.classProfile.avgWorkExperience}
                </span>
              )}
              {intel.classProfile.womenPct && (
                <span className="pill">Women: {intel.classProfile.womenPct}</span>
              )}
              {intel.classProfile.internationalPct && (
                <span className="pill">
                  Intl: {intel.classProfile.internationalPct}
                </span>
              )}
            </div>

            <h3>Employment</h3>
            <div className="pill-list">
              {intel.employmentReport.medianBaseSalary && (
                <span className="pill">
                  Median base: {intel.employmentReport.medianBaseSalary}
                </span>
              )}
              {intel.employmentReport.topIndustries.slice(0, 5).map((x) => (
                <span className="pill" key={x}>
                  {x}
                </span>
              ))}
            </div>

            <h3>Institutes & centers</h3>
            <ul className="tight">
              {intel.institutesAndCenters.slice(0, 10).map((i) => (
                <li key={i.name}>
                  <b>{i.name}</b> — {i.description}
                </li>
              ))}
            </ul>

            <h3>Culture & what the AdCom looks for</h3>
            <div className="pill-list">
              {intel.cultureAndValues.map((v) => (
                <span className="pill" key={v}>
                  {v}
                </span>
              ))}
            </div>
            <ul className="tight">
              {intel.adcomInsights.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </div>

          <div className="actions">
            <button className="secondary" onClick={() => update({ step: 0 })}>
              ← Back
            </button>
            <button className="primary" onClick={() => update({ step: 2 })}>
              Continue → Build my fit profile
            </button>
          </div>
        </>
      )}
    </>
  );
}
