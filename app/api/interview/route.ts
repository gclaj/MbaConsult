import { anthropic, MODEL, parseStructured } from "@/lib/anthropic";
import { playbookBlock } from "@/lib/knowledge";
import {
  candidateSummary,
  EVALUATION_SYSTEM,
  fitContextBlock,
  notesBlock,
  QUESTIONS_SYSTEM,
} from "@/lib/prompts";
import { EVALUATION_SCHEMA, QUESTIONS_SCHEMA } from "@/lib/schemas";
import type {
  CandidateProfile,
  FitProfile,
  InterviewQuestion,
  SchoolIntel,
  StoryEvaluation,
} from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 300;

interface InterviewRequest {
  action: "generate_questions" | "evaluate_answer";
  candidate: CandidateProfile;
  intel: SchoolIntel;
  fit: FitProfile;
  notes?: string;
  question?: InterviewQuestion;
  answer?: string;
  priorAttempt?: { answer: string; pushback: string };
}

export async function POST(req: Request) {
  const body = (await req.json()) as InterviewRequest;

  try {
    if (body.action === "generate_questions") {
      const stream = anthropic.messages.stream({
        model: MODEL,
        max_tokens: 16000,
        thinking: { type: "adaptive" },
        system: QUESTIONS_SYSTEM,
        output_config: {
          format: { type: "json_schema", schema: QUESTIONS_SCHEMA },
        },
        messages: [
          {
            role: "user",
            content: `${fitContextBlock(body.intel, body.fit)}
${playbookBlock(body.intel.school)}${notesBlock(body.notes)}
${candidateSummary(body.candidate)}

Generate the story-discovery questions. Use the exact essay titles from the dossier's essays array as essayTitle.`,
          },
        ],
      });
      const data = parseStructured<{ questions: InterviewQuestion[] }>(
        await stream.finalMessage(),
      );
      return Response.json(data);
    }

    if (body.action === "evaluate_answer" && body.question && body.answer) {
      const prior = body.priorAttempt
        ? `\nNOTE: this is a REVISED or REPLACEMENT story. Earlier attempt:\n"${body.priorAttempt.answer}"\nYour earlier pushback: "${body.priorAttempt.pushback}"\nJudge the new answer on its own merits, but check whether the earlier concern was addressed.`
        : "";

      const stream = anthropic.messages.stream({
        model: MODEL,
        max_tokens: 8000,
        thinking: { type: "adaptive" },
        system: EVALUATION_SYSTEM,
        output_config: {
          format: { type: "json_schema", schema: EVALUATION_SCHEMA },
        },
        messages: [
          {
            role: "user",
            content: `${fitContextBlock(body.intel, body.fit)}
${playbookBlock(body.intel.school)}${notesBlock(body.notes)}
${candidateSummary(body.candidate)}

INTERVIEW QUESTION (essay: ${body.question.essayTitle})
Question: ${body.question.question}
Purpose: ${body.question.purpose}
Target story type: ${body.question.storyType}
${prior}
CANDIDATE'S ANSWER:
${body.answer}

Evaluate this story against the school's fit profile.`,
          },
        ],
      });
      const evaluation = parseStructured<StoryEvaluation>(
        await stream.finalMessage(),
      );
      return Response.json({ evaluation });
    }

    return Response.json({ error: "Invalid request" }, { status: 400 });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Interview step failed" },
      { status: 500 },
    );
  }
}
