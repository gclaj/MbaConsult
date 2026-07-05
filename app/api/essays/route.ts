import { anthropic, MODEL, sseEncode } from "@/lib/anthropic";
import {
  candidateContextBlock,
  playbookBlock,
  priorEssaysBlock,
} from "@/lib/knowledge";
import {
  candidateSummary,
  essaySystem,
  fitContextBlock,
  notesBlock,
  storiesBlock,
} from "@/lib/prompts";
import type {
  CandidateProfile,
  EssayPrompt,
  FitProfile,
  SchoolIntel,
  Story,
} from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 800;

interface EssayRequest {
  candidate: CandidateProfile;
  intel: SchoolIntel;
  fit: FitProfile;
  stories: Story[];
  notes?: string;
  essay: EssayPrompt;
  previousDraft?: string;
  revisionNotes?: string;
}

export async function POST(req: Request) {
  const body = (await req.json()) as EssayRequest;
  const { candidate, intel, fit, stories, essay } = body;

  const strategy = fit.essayStrategies.find(
    (s) => s.essayTitle === essay.title,
  );
  const relevantStories = stories.filter((s) => s.accepted);

  const revision =
    body.previousDraft && body.revisionNotes
      ? `\nThis is a REVISION. Previous draft:\n<previous_draft>\n${body.previousDraft}\n</previous_draft>\n\nThe candidate's revision notes: "${body.revisionNotes}"\nRewrite the essay applying these notes while keeping what already works.`
      : "";

  const userContent = `${fitContextBlock(intel, fit)}
${playbookBlock(intel.school)}${priorEssaysBlock(intel.school)}${notesBlock(body.notes)}
${candidateSummary(candidate)}
${candidateContextBlock()}

ACCEPTED STORIES FROM THE DISCOVERY INTERVIEW (primary raw material — prefer stories tagged to this essay, but borrow details from others where they strengthen the narrative without duplicating content across essays):
${storiesBlock(relevantStories)}

WRITE THIS ESSAY:
Title: ${essay.title}
Prompt (answer it exactly): ${essay.prompt}
Word limit: ${essay.wordLimit}
Strategy for this essay: ${strategy ? `${strategy.strategy} — story types: ${strategy.storyTypesNeeded.join(", ")}` : "Use best judgment based on the fit profile."}
${revision}`;

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const essayStream = anthropic.messages.stream({
          model: MODEL,
          max_tokens: 32000,
          thinking: { type: "adaptive" },
          system: essaySystem(candidate),
          messages: [{ role: "user", content: userContent }],
        });

        essayStream.on("text", (delta) => {
          controller.enqueue(sseEncode({ type: "delta", text: delta }));
        });

        await essayStream.finalMessage();
        controller.enqueue(sseEncode({ type: "done" }));
      } catch (err) {
        controller.enqueue(
          sseEncode({
            type: "error",
            text: err instanceof Error ? err.message : "Essay generation failed",
          }),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
