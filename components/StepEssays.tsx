"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { streamRequest } from "@/lib/stream";
import type { EssayPrompt } from "@/lib/types";

function wordCount(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

function EssayCard({ essay }: { essay: EssayPrompt }) {
  const { state, update } = useStore();
  const draft = state.drafts.find((d) => d.essayTitle === essay.title);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");
  const [liveText, setLiveText] = useState("");
  const [revisionNotes, setRevisionNotes] = useState("");
  const [showRevise, setShowRevise] = useState(false);

  const saveDraft = (text: string) => {
    update({
      drafts: [
        ...state.drafts.filter((d) => d.essayTitle !== essay.title),
        { essayTitle: essay.title, text },
      ],
    });
  };

  const generate = async (revise: boolean) => {
    setRunning(true);
    setError("");
    setLiveText("");
    let text = "";
    try {
      await streamRequest(
        "/api/essays",
        {
          candidate: state.candidate,
          intel: state.intel,
          fit: state.fit,
          stories: state.stories,
          essay,
          previousDraft: revise ? draft?.text : undefined,
          revisionNotes: revise ? revisionNotes : undefined,
        },
        (event) => {
          if (event.type === "delta") {
            text += event.text as string;
            setLiveText(text);
          }
          if (event.type === "error") setError(event.text as string);
        },
      );
      if (text.trim()) {
        saveDraft(text.trim());
        setShowRevise(false);
        setRevisionNotes("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setRunning(false);
      setLiveText("");
    }
  };

  const displayText = running ? liveText : draft?.text ?? "";

  return (
    <div className="card">
      <h2>{essay.title}</h2>
      <div className="q-meta">
        <span className="badge">{essay.wordLimit}</span>
        <span className="badge">{essay.type}</span>
      </div>
      <p className="sub">{essay.prompt}</p>

      {!running && !draft && (
        <button className="primary" onClick={() => generate(false)}>
          Generate this essay
        </button>
      )}
      {running && (
        <p className="status-line">
          <span className="spinner" />
          Writing in your voice…
        </p>
      )}
      {error && <p className="error-line">{error}</p>}

      {displayText && (
        <>
          <div className="stream-box essay">{displayText}</div>
          <div className="word-count">{wordCount(displayText)} words</div>
        </>
      )}

      {draft && !running && (
        <>
          <div className="actions" style={{ justifyContent: "flex-start" }}>
            <button
              className="secondary"
              onClick={() => navigator.clipboard.writeText(draft.text)}
            >
              Copy essay
            </button>
            <button className="secondary" onClick={() => generate(false)}>
              Regenerate from scratch
            </button>
            <button
              className="secondary"
              onClick={() => setShowRevise(!showRevise)}
            >
              Request changes
            </button>
          </div>
          {showRevise && (
            <div style={{ marginTop: 10 }}>
              <textarea
                value={revisionNotes}
                onChange={(e) => setRevisionNotes(e.target.value)}
                placeholder='e.g. "Make the opening scene more vivid", "Emphasize the Analytics Institute more", "Cut 60 words"'
              />
              <div className="actions">
                <button
                  className="primary"
                  disabled={!revisionNotes.trim()}
                  onClick={() => generate(true)}
                >
                  Revise essay
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function StepEssays() {
  const { state, update } = useStore();
  const intel = state.intel;
  if (!intel) return null;

  const acceptedCount = state.stories.filter((s) => s.accepted).length;

  return (
    <>
      <div className="card">
        <h2>Your essays for {intel.school}</h2>
        <p className="sub">
          Drafted in your voice from your writing sample, weaving in your{" "}
          {acceptedCount} accepted stor{acceptedCount === 1 ? "y" : "ies"} and
          school-specific detail from the research dossier. Generate each essay,
          then iterate with “Request changes”.
        </p>
      </div>

      {intel.essays.map((essay) => (
        <EssayCard key={essay.title} essay={essay} />
      ))}

      <div className="actions">
        <button className="secondary" onClick={() => update({ step: 3 })}>
          ← Back to interview
        </button>
      </div>
    </>
  );
}
