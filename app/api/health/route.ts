export const runtime = "nodejs";

// Reports whether the server has an API key configured, so the UI can show
// a clear setup warning instead of a cryptic SDK error mid-research.
export async function GET() {
  return Response.json({
    apiKeyConfigured: Boolean(process.env.ANTHROPIC_API_KEY),
  });
}
