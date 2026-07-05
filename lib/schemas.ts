// JSON Schemas for Claude structured outputs (output_config.format).
// Structured outputs require additionalProperties: false on every object and
// every property listed in required.

const str = { type: "string" } as const;
const strArr = { type: "array", items: { type: "string" } } as const;

export const SCHOOL_INTEL_SCHEMA = {
  type: "object",
  properties: {
    school: str,
    program: str,
    applicationCycle: str,
    overview: str,
    essays: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: str,
          prompt: str,
          wordLimit: str,
          type: str,
          guidance: str,
        },
        required: ["title", "prompt", "wordLimit", "type", "guidance"],
        additionalProperties: false,
      },
    },
    classProfile: {
      type: "object",
      properties: {
        classSize: str,
        avgGpa: str,
        avgGmat: str,
        gmatRange: str,
        avgWorkExperience: str,
        womenPct: str,
        internationalPct: str,
        topIndustries: strArr,
        notes: str,
      },
      required: [
        "classSize",
        "avgGpa",
        "avgGmat",
        "gmatRange",
        "avgWorkExperience",
        "womenPct",
        "internationalPct",
        "topIndustries",
        "notes",
      ],
      additionalProperties: false,
    },
    employmentReport: {
      type: "object",
      properties: {
        medianBaseSalary: str,
        topIndustries: strArr,
        topEmployers: strArr,
        notes: str,
      },
      required: ["medianBaseSalary", "topIndustries", "topEmployers", "notes"],
      additionalProperties: false,
    },
    institutesAndCenters: {
      type: "array",
      items: {
        type: "object",
        properties: { name: str, description: str },
        required: ["name", "description"],
        additionalProperties: false,
      },
    },
    clubsAndActivities: strArr,
    cultureAndValues: strArr,
    adcomInsights: strArr,
    applicationTips: strArr,
    sources: strArr,
  },
  required: [
    "school",
    "program",
    "applicationCycle",
    "overview",
    "essays",
    "classProfile",
    "employmentReport",
    "institutesAndCenters",
    "clubsAndActivities",
    "cultureAndValues",
    "adcomInsights",
    "applicationTips",
    "sources",
  ],
  additionalProperties: false,
} as const;

export const FIT_PROFILE_SCHEMA = {
  type: "object",
  properties: {
    overallScore: { type: "integer" },
    verdict: str,
    summary: str,
    dimensions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: str,
          score: { type: "integer" },
          rationale: str,
        },
        required: ["name", "score", "rationale"],
        additionalProperties: false,
      },
    },
    strengths: strArr,
    gaps: strArr,
    positioning: str,
    idealCandidateTraits: strArr,
    essayStrategies: {
      type: "array",
      items: {
        type: "object",
        properties: {
          essayTitle: str,
          strategy: str,
          storyTypesNeeded: strArr,
        },
        required: ["essayTitle", "strategy", "storyTypesNeeded"],
        additionalProperties: false,
      },
    },
  },
  required: [
    "overallScore",
    "verdict",
    "summary",
    "dimensions",
    "strengths",
    "gaps",
    "positioning",
    "idealCandidateTraits",
    "essayStrategies",
  ],
  additionalProperties: false,
} as const;

export const QUESTIONS_SCHEMA = {
  type: "object",
  properties: {
    questions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: str,
          essayTitle: str,
          question: str,
          purpose: str,
          storyType: str,
        },
        required: ["id", "essayTitle", "question", "purpose", "storyType"],
        additionalProperties: false,
      },
    },
  },
  required: ["questions"],
  additionalProperties: false,
} as const;

export const EVALUATION_SCHEMA = {
  type: "object",
  properties: {
    fitScore: { type: "integer" },
    verdict: { type: "string", enum: ["strong", "moderate", "weak"] },
    strengths: str,
    feedback: str,
    pushback: str,
    suggestedStoryType: str,
    followUpQuestion: str,
  },
  required: [
    "fitScore",
    "verdict",
    "strengths",
    "feedback",
    "pushback",
    "suggestedStoryType",
    "followUpQuestion",
  ],
  additionalProperties: false,
} as const;
