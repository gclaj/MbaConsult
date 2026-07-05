import { anthropic, MODEL, parseStructured, sseEncode } from "@/lib/anthropic";
import { RESEARCH_SYSTEM } from "@/lib/prompts";
import { SCHOOL_INTEL_SCHEMA } from "@/lib/schemas";
import type { SchoolIntel } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 800;

export async function POST(req: Request) {
  const { school } = (await req.json()) as { school: string };
  if (!school?.trim()) {
    return Response.json({ error: "school is required" }, { status: 400 });
  }

  const stream = new ReadableStream({
    async start(controller) {
      try {
        controller.enqueue(
          sseEncode({ type: "status", text: `Researching ${school}…` }),
        );

        // Phase 1: live web research → detailed dossier (free text).
        const research = anthropic.messages.stream({
          model: MODEL,
          max_tokens: 32000,
          thinking: { type: "adaptive" },
          system: RESEARCH_SYSTEM,
          tools: [
            { type: "web_search_20260209", name: "web_search", max_uses: 15 },
          ],
          messages: [
            {
              role: "user",
              content: `Build the full admissions intelligence dossier for the full-time MBA program at: ${school}. Today's date is ${new Date().toDateString()} — find the most current application cycle's requirements.`,
            },
          ],
        });

        research.on("streamEvent", (event) => {
          if (
            event.type === "content_block_start" &&
            event.content_block.type === "server_tool_use"
          ) {
            const input = event.content_block.input as { query?: string };
            controller.enqueue(
              sseEncode({
                type: "status",
                text: input?.query
                  ? `Searching: ${input.query}`
                  : "Searching the web…",
              }),
            );
          }
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(
              sseEncode({ type: "delta", text: event.delta.text }),
            );
          }
        });

        const researchMessage = await research.finalMessage();
        const dossier = researchMessage.content
          .filter((b) => b.type === "text")
          .map((b) => b.text)
          .join("\n");

        // Phase 2: convert the dossier into structured SchoolIntel JSON.
        controller.enqueue(
          sseEncode({ type: "status", text: "Structuring the dossier…" }),
        );

        const extraction = anthropic.messages.stream({
          model: MODEL,
          max_tokens: 16000,
          output_config: {
            format: { type: "json_schema", schema: SCHOOL_INTEL_SCHEMA },
          },
          messages: [
            {
              role: "user",
              content: `Convert this MBA program research dossier into the structured format. Preserve essay prompts verbatim with their word limits. Keep all named institutes, centers, clubs, culture keywords, AdCom insights, and source URLs. Use empty strings or empty arrays for anything genuinely unknown.\n\n<dossier>\n${dossier}\n</dossier>`,
            },
          ],
        });
        const intel = parseStructured<SchoolIntel>(
          await extraction.finalMessage(),
        );

        controller.enqueue(sseEncode({ type: "intel", data: intel, dossier }));
        controller.enqueue(sseEncode({ type: "done" }));
      } catch (err) {
        controller.enqueue(
          sseEncode({
            type: "error",
            text: err instanceof Error ? err.message : "Research failed",
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
