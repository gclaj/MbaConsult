"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import type { Story, StoryEvaluation } from "@/lib/types";

export default function StepInterview() {
  const { state, update } = useStore();
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState("");
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [evaluation, setEvaluation] = useState<StoryEvaluation | null>(null);
  const [priorAttempt, setPriorAttempt] = useState<{
    answer: string;
    pushback: string;
  } | null>(null);

  const questions = state.questions;
  const question = questions[index];
  const acceptedCount = state.stories.filter((s) => s.accepted).length;
  const finished = questions.length > 0 && index >= questions.length;

  const generateQuestions = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate_questions",
          candidate: state.candidate,
          intel: state.intel,
          fit: state.fit,
          notes: state.notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Question generation failed");
      update({ questions: data.questions, stories: [] });
      setIndex(0);
      setAnswer("");
      setEvaluation(null);
      setPriorAttempt(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  const evaluate = async () => {
    if (!question || !answer.trim()) return;
    setEvaluating(true);
    setError("");
    try {
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "evaluate_answer",
          candidate: state.candidate,
          intel: state.intel,
          fit: state.fit,
          notes: state.notes,
          question,
          answer,
          priorAttempt,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Evaluation failed");
      setEvaluation(data.evaluation);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Evaluation failed");
    } finally {
      setEvaluating(false);
    }
  };

  const nextQuestion = () => {
    setIndex(index + 1);
    setAnswer("");
    setEvaluation(null);
    setPriorAttempt(null);
  };

  const acceptStory = () => {
    if (!question || !evaluation) return;
    const story: Story = {
      questionId: question.id,
      essayTitle: question.essayTitle,
      question: question.question,
      answer,
      evaluation,
      accepted: true,
    };
    update({
      stories: [
        ...state.stories.filter((s) => s.questionId !== question.id),
        story,
      ],
    });
    nextQuestion();
  };

  const tryDifferentStory = () => {
    if (!evaluation) return;
    setPriorAttempt({ answer, pushback: evaluation.pushback });
    setAnswer("");
    setEvaluation(null);
  };

  if (questions.length === 0) {
    return (
      <div className="card">
        <h2>Story-discovery interview</h2>
        <p className="sub">
          I’ll ask questions tailored to {state.intel?.school}’s essays and your
          fit profile. Each story you tell gets scored against the school’s fit
          criteria — I’ll push back on stories that don’t show fit and steer
          you toward stronger ones.
        </p>
        {!loading ? (
          <button className="primary" onClick={generateQuestions}>
            Start the interview
          </button>
        ) : (
          <p className="status-line">
            <span className="spinner" />
            Preparing questions from your fit profile…
          </p>
        )}
        {error && <p className="error-line">{error}</p>}
      </div>
    );
  }

  if (finished) {
    return (
      <>
        <div className="card">
          <h2>Interview complete</h2>
          <p className="sub">
            {acceptedCount} stor{acceptedCount === 1 ? "y" : "ies"} accepted into
            your story bank.
          </p>
          {state.stories
            .filter((s) => s.accepted)
            .map((s) => (
              <div key={s.questionId} style={{ marginBottom: 12 }}>
                <span
                  className={`badge ${s.evaluation?.verdict ?? ""}`}
                  style={{ marginRight: 8 }}
                >
                  fit {s.evaluation?.fitScore}
                </span>
                <b>{s.essayTitle}</b>
                <p style={{ margin: "4px 0", fontSize: 13.5, color: "var(--muted)" }}>
                  {s.answer.slice(0, 180)}
                  {s.answer.length > 180 ? "…" : ""}
                </p>
              </div>
            ))}
        </div>
        <div className="actions">
          <button className="secondary" onClick={() => setIndex(0)}>
            ← Review questions again
          </button>
          <button
            className="primary"
            disabled={acceptedCount === 0}
            onClick={() => update({ step: 4 })}
          >
            Continue → Generate essays
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="card">
        <p className="progress-note">
          Question {index + 1} of {questions.length} · {acceptedCount} stories
          accepted
        </p>
        <div className="q-meta">
          <span className="badge">{question.essayTitle}</span>
          <span className="badge">{question.storyType}</span>
        </div>
        <h2>{question.question}</h2>
        <p className="sub">Why I’m asking: {question.purpose}</p>
        {priorAttempt && (
          <p className="sub" style={{ color: "var(--amber)" }}>
            Telling a different story this time — your previous one didn’t show
            enough fit.
          </p>
        )}
        <textarea
          style={{ minHeight: 160 }}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Tell the story with specifics: the situation, what was at stake, exactly what YOU did, the obstacles, the result (numbers help), and what it taught you."
        />
        <div className="actions" style={{ justifyContent: "space-between" }}>
          <button className="ghost" onClick={nextQuestion}>
            Skip this question
          </button>
          <button
            className="primary"
            disabled={evaluating || answer.trim().length < 50}
            onClick={evaluate}
          >
            {evaluating ? "Evaluating against fit profile…" : "Evaluate my story"}
          </button>
        </div>
        {error && <p className="error-line">{error}</p>}

        {evaluation && (
          <div className={`eval-box ${evaluation.verdict}`}>
            <p>
              <span className={`badge ${evaluation.verdict}`}>
                {evaluation.verdict.toUpperCase()} · fit {evaluation.fitScore}/100
              </span>
            </p>
            {evaluation.strengths && (
              <p>
                <span className="eval-label">What works</span>
                <br />
                {evaluation.strengths}
              </p>
            )}
            {evaluation.feedback && (
              <p>
                <span className="eval-label">To strengthen it</span>
                <br />
                {evaluation.feedback}
              </p>
            )}
            {evaluation.pushback && (
              <p>
                <span className="eval-label">Pushback</span>
                <br />
                {evaluation.pushback}
              </p>
            )}
            {evaluation.suggestedStoryType && (
              <p>
                <span className="eval-label">Consider a different story</span>
                <br />
                {evaluation.suggestedStoryType}
              </p>
            )}
            {evaluation.followUpQuestion && (
              <p>
                <span className="eval-label">Follow-up</span>
                <br />
                {evaluation.followUpQuestion}
              </p>
            )}
            <div className="actions">
              {evaluation.verdict === "weak" && (
                <button className="secondary" onClick={tryDifferentStory}>
                  Tell a different story
                </button>
              )}
              <button className="secondary" onClick={() => setEvaluation(null)}>
                Revise this answer
              </button>
              <button
                className="primary"
                onClick={acceptStory}
                title={
                  evaluation.verdict === "weak"
                    ? "Not recommended — this story scored weak on fit"
                    : ""
                }
              >
                {evaluation.verdict === "weak"
                  ? "Use it anyway → next"
                  : "Accept story → next"}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
