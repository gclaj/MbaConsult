import { getSchoolPlaybook } from "@/lib/knowledge";

export const runtime = "nodejs";

// Lets the UI show whether a built-in application playbook exists for the
// target school (content itself is only ever used server-side in prompts).
export async function GET(req: Request) {
  const school = new URL(req.url).searchParams.get("school") ?? "";
  const playbook = getSchoolPlaybook(school);
  return Response.json({ match: playbook?.key ?? null });
}
