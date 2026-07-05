import { anthropic, MODEL, parseStructured } from "@/lib/anthropic";
import { candidateSummary, FIT_SYSTEM, notesBlock } from "@/lib/prompts";
import { FIT_PROFILE_SCHEMA } from "@/lib/schemas";
import type { CandidateProfile, FitProfile, SchoolIntel } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(req: Request) {
  const { candidate, intel, dossier, notes } = (await req.json()) as {
    candidate: CandidateProfile;
    intel: SchoolIntel;
    dossier: string;
    notes?: string;
  };

  try {
    const stream = anthropic.messages.stream({
      model: MODEL,
      max_tokens: 16000,
      thinking: { type: "adaptive" },
      system: FIT_SYSTEM,
      output_config: {
        format: { type: "json_schema", schema: FIT_PROFILE_SCHEMA },
      },
      messages: [
        {
          role: "user",
          content: `TARGET SCHOOL: ${intel.school} — ${intel.program}

RESEARCH DOSSIER:
${dossier}

STRUCTURED SCHOOL DATA:
${JSON.stringify(intel, null, 1)}
${notesBlock(notes)}
${candidateSummary(candidate)}

Produce the complete fit profile. Include one essayStrategy entry for EVERY essay in the structured school data, using the exact essay title.`,
        },
      ],
    });

    const fit = parseStructured<FitProfile>(await stream.finalMessage());
    return Response.json({ fit });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Fit analysis failed" },
      { status: 500 },
    );
  }
}
