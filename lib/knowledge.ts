import fs from "fs";
import path from "path";

// Built-in application playbooks (knowledge/*.md) — the user's own
// school-by-school research master doc, split per school. Matched against
// the target school name and injected into research extraction, fit
// analysis, interview questions/evaluations, and essay generation.

const ALIASES: Record<string, string[]> = {
  tuck: ["tuck", "dartmouth"],
  columbia: ["columbia", "cbs"],
  wharton: ["wharton", "upenn", "penn", "pennsylvania"],
  booth: ["booth", "uchicago", "university of chicago", "chicago"],
  kellogg: ["kellogg", "northwestern"],
  duke: ["duke", "fuqua"],
  owen: ["owen", "vanderbilt"],
};

function matchSchoolKey(school: string): string | null {
  const q = (school || "").toLowerCase();
  for (const [key, aliases] of Object.entries(ALIASES)) {
    if (aliases.some((a) => q.includes(a))) return key;
  }
  return null;
}

export function getSchoolPlaybook(
  school: string,
): { key: string; text: string } | null {
  const key = matchSchoolKey(school);
  if (!key) return null;
  try {
    const text = fs.readFileSync(
      path.join(process.cwd(), "knowledge", `${key}.md`),
      "utf-8",
    );
    return { key, text };
  } catch {
    return null;
  }
}

// Essays actually submitted to this school in the prior cycle
// (knowledge/prior-essays/<key>.md). What the AdCom has already read.
export function priorEssaysBlock(school: string): string {
  const key = matchSchoolKey(school);
  if (!key) return "";
  let text: string;
  try {
    text = fs.readFileSync(
      path.join(process.cwd(), "knowledge", "prior-essays", `${key}.md`),
      "utf-8",
    );
  } catch {
    return "";
  }
  return `\nPRIOR-CYCLE ESSAYS — the essays the candidate actually submitted to THIS school last year. This is what the AdCom has already read; for reapplications the new materials are read side-by-side with these. Rules: maintain consistency of character and goals-evolution (refine, never reverse); never recycle sentences or scenes verbatim — reference or build on them instead; know which stories this AdCom has already seen so new materials add NEW evidence rather than repeating. These essays are also authentic samples of the candidate's real essay voice:\n<prior_essays>\n${text}\n</prior_essays>\n`;
}

// Standing strategic context about the candidate (knowledge/candidate.md):
// application history, reapplicant status, positioning thesis. Injected
// alongside the form profile so every stage reasons with the full picture.
export function candidateContextBlock(): string {
  try {
    const text = fs.readFileSync(
      path.join(process.cwd(), "knowledge", "candidate.md"),
      "utf-8",
    );
    return `\nCANDIDATE STRATEGIC CONTEXT — standing background on this candidate's application history, positioning strategy, and constraints. If the candidate is a REAPPLICANT to the target school, treat the application as a reapplication: the fit analysis must weigh what has changed since the prior attempt, the interview must surface growth-since-last-application stories, and the essays must demonstrate that growth concretely. If the context lists multiple LIVE career theses, the fit analysis must state which thesis fits THIS school best and why (in the positioning field), interview questions should gather stories usable under the recommended thesis, and each essay must run on exactly one thesis spine — the one recommended for this school unless the candidate directs otherwise:\n<candidate_context>\n${text}\n</candidate_context>\n`;
  } catch {
    return "";
  }
}

export function playbookBlock(school: string): string {
  const playbook = getSchoolPlaybook(school);
  if (!playbook) return "";
  return `\nAPPLICATION PLAYBOOK — the candidate's school-specific knowledge base. Deep insider guidance on this school: the brand traits and "fit" signals its AdCom screens for, essay-by-essay advice, traps to avoid, and interview/recommendation strategy. Treat this as authoritative, expert-level context — follow its guidance on what this school rewards and penalizes, and reconcile it with the researched dossier:\n<playbook>\n${playbook.text}\n</playbook>\n`;
}
