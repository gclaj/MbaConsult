import type { CandidateProfile } from "./types";

export type ProfileId = "chris" | "guest";

export const EMPTY_CANDIDATE: CandidateProfile = {
  name: "",
  targetSchool: "",
  gpa: "",
  undergrad: "",
  major: "",
  testType: "GMAT",
  testScore: "",
  yearsExperience: "",
  industry: "",
  currentRole: "",
  employer: "",
  shortTermGoal: "",
  longTermGoal: "",
  leadership: "",
  extracurriculars: "",
  background: "",
  writingSample: "",
};

// Chris's writing sample is drawn from essays he actually wrote and submitted
// (Columbia, prior cycle) — the truest available sample of his essay voice.
const CHRIS_WRITING_SAMPLE = `As rain seeped into his cinderblock home outside Yaoundé, Cameroon, Jacques, an aspiring entrepreneur, and I calculated the cost of starting a poultry business. It became clear that his limited access to capital and operational leadership would hinder his entrepreneurial journey. Leaving, I realized Jacques had the drive to succeed, but not the opportunity to act on it. That day, I became determined to bridge that gap by becoming a leader who could build systems and optimize capital to expand opportunities in developing economies.

"Sir, if she runs, we won't win." It was the morning of the "All-American 10-Miler", a prestigious race with 60+ teams from Fort Bragg, and my assistant coach wanted to cut Lauren, the only woman on our team.

As we spoke, my assistant reasoned that neither of us knew if Lauren could perform against male-dominated teams, reminding me our commander had stressed the importance of winning this high-profile event. As we debated, I felt drawn to his reasoning and the intense pressure we felt to win. Suddenly, I realized I was weighing a perceived advantage over principled leadership. Lauren had outperformed competitors during our tryouts, and I'd seen women exceed expectations in the toughest environments, including U.S. Army Ranger School. If I caved, I'd be sending the wrong message to the rest of the team and myself: that I cared more about possible success than proven potential.

I stopped the conversation and handed Lauren a bib.

We didn't win, but Lauren placed first among all female competitors, earning her a spot at the 80th anniversary of D-Day at Normandy. After the race, my assistant apologized, highlighting that my values-driven decision had reshaped the definition of success for our team's culture.`;

export const CHRIS_CANDIDATE: CandidateProfile = {
  name: "Gabriel Christian Lajeunesse",
  targetSchool: "Columbia Business School",
  gpa: "2.77 (West Point; ~2.50 pre-mission / ~3.23 post-mission)",
  undergrad: "United States Military Academy (West Point), Class of 2021",
  major: "B.S. Engineering Management",
  testType: "GRE",
  testScore: "GRE 318 (157V/161Q); EA 154; retake planned end of August",
  yearsExperience: "5",
  industry: "U.S. Army — defense & AI integration",
  currentRole:
    "Infantry Captain — Company Commander (145 soldiers) & Brigade Innovation Officer",
  employer: "U.S. Army — Dog Co, 2-506 IN, 3BCT, 101st Airborne (Air Assault)",
  shortTermGoal:
    "Join a strategy consulting firm such as BCG (energy/natural-resources or public-sector/defense practice) to lead operational and strategic value creation — a time-boxed 2–3 year bridge with a written exit thesis.",
  longTermGoal:
    "Per school strategy (see built-in strategic context): either regulated-enterprise AI transformation leadership (Chief AI Officer track) or leading AI-enabled transformation of critical-mineral supply chains through Francophone Africa.",
  leadership:
    "Ranked #1 of 75 captains at brigade/division/corps. Architected the Army's first AI-enabled planning cell (orders generation 73→23 hours, scaled to 16 planning cells / 31 brigades worldwide). Built three company-level agentic AI systems adopted by 12 of 15 companies, automating $22M in equipment accountability. Led JRTC Rotation 26-06, first-of-its-kind multi-domain live-fire coordinating L3Harris, Auterion, and AEVEX.",
  extracurriculars:
    "Two Modern War Institute publications (the 11R article catalyzed a Department of the Army review to restructure Infantry and establish a drone-warfare career field). Briefed a senior advisor to the Secretary of the Army; advised the Maven program manager. LDS proselyting/humanitarian mission, Republic of Congo / Cameroon (2017–2019). French, ACTFL Advanced Mid. Ranger-qualified, EIB. Palantir AIP Foundations.",
  background:
    "REAPPLICANT to Columbia, Wharton, and Tuck (rejected off the CBS waitlist; prior essays are on file in the app). First-time applicant everywhere else. Quant offsets: HBS CORe (Pass with Honors), MBA Math 93%, FE exam passed → Engineer-in-Training. Active security clearance; military transition planned ~2027. Full strategic context, the CBS reapplicant essay draft v4, prior-cycle essays, and school playbooks are built into the app and load automatically for this profile.",
  writingSample: CHRIS_WRITING_SAMPLE,
};

export const PROFILES: Record<
  ProfileId,
  { label: string; candidate: CandidateProfile }
> = {
  chris: { label: "Chris Lajeunesse", candidate: CHRIS_CANDIDATE },
  guest: { label: "Guest", candidate: EMPTY_CANDIDATE },
};
