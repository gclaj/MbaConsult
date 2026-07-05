export interface CandidateProfile {
  name: string;
  targetSchool: string;
  gpa: string;
  undergrad: string;
  major: string;
  testType: "GMAT" | "GRE" | "EA" | "Not taken yet";
  testScore: string;
  yearsExperience: string;
  industry: string;
  currentRole: string;
  employer: string;
  shortTermGoal: string;
  longTermGoal: string;
  leadership: string;
  extracurriculars: string;
  background: string;
  writingSample: string;
}

export interface EssayPrompt {
  title: string;
  prompt: string;
  wordLimit: string;
  type: string;
  guidance: string;
}

export interface SchoolIntel {
  school: string;
  program: string;
  applicationCycle: string;
  overview: string;
  essays: EssayPrompt[];
  classProfile: {
    classSize: string;
    avgGpa: string;
    avgGmat: string;
    gmatRange: string;
    avgWorkExperience: string;
    womenPct: string;
    internationalPct: string;
    topIndustries: string[];
    notes: string;
  };
  employmentReport: {
    medianBaseSalary: string;
    employmentRate: string;
    topIndustries: string[];
    topEmployers: string[];
    industryBreakdown?: {
      industry: string;
      pctOfClass: string;
      medianBase: string;
    }[];
    functionBreakdown?: { function: string; pctOfClass: string }[];
    notes: string;
  };
  institutesAndCenters: { name: string; description: string }[];
  clubsAndActivities: string[];
  cultureAndValues: string[];
  adcomInsights: string[];
  applicationTips: string[];
  sources: string[];
}

export interface FitDimension {
  name: string;
  score: number;
  rationale: string;
}

export interface EssayStrategy {
  essayTitle: string;
  strategy: string;
  storyTypesNeeded: string[];
}

export interface CareerPathOption {
  path: string;
  pipelineStrength: number;
  backgroundAlignment: number;
  overallViability: number;
  evidence: string;
  rationale: string;
}

export interface CareerPathAnalysis {
  paths: CareerPathOption[];
  recommendedPath: string;
  recommendationRationale: string;
}

export interface FitProfile {
  overallScore: number;
  verdict: string;
  summary: string;
  // optional so fit profiles saved before this feature still render
  careerPathAnalysis?: CareerPathAnalysis;
  dimensions: FitDimension[];
  strengths: string[];
  gaps: string[];
  positioning: string;
  idealCandidateTraits: string[];
  essayStrategies: EssayStrategy[];
}

export interface InterviewQuestion {
  id: string;
  essayTitle: string;
  question: string;
  purpose: string;
  storyType: string;
}

export interface StoryEvaluation {
  fitScore: number;
  verdict: "strong" | "moderate" | "weak";
  strengths: string;
  feedback: string;
  pushback: string;
  suggestedStoryType: string;
  followUpQuestion: string;
}

export interface Story {
  questionId: string;
  essayTitle: string;
  question: string;
  answer: string;
  evaluation: StoryEvaluation | null;
  accepted: boolean;
}

export interface EssayDraft {
  essayTitle: string;
  text: string;
}
