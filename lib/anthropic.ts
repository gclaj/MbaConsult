import Anthropic from "@anthropic-ai/sdk";

export const MODEL = "claude-opus-4-8";

export const anthropic = new Anthropic();

// Pull the first text block out of a response and parse it as JSON
// (used with output_config.format structured outputs).
export function parseStructured<T>(response: Anthropic.Message): T {
  const block = response.content.find((b) => b.type === "text");
  if (!block || block.type !== "text") {
    throw new Error(
      `No text block in response (stop_reason: ${response.stop_reason})`,
    );
  }
  return JSON.parse(block.text) as T;
}

// Server-Sent Events helpers for streaming API routes.
export function sseEncode(event: Record<string, unknown>): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify(event)}\n\n`);
}
