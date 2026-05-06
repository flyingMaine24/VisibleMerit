import type { IntakeAnswers, PackSection, QualityRubric, RoleRecommendation } from "@/lib/types";
import { createQualityRubric, detectEvidenceWarnings, findBannedTerms } from "@/lib/editorial/standard";
import { fullPackSchema, previewPackSchema, type FullPackOutput, type PreviewPackOutput } from "@/lib/ai/schema";

export type GenerationResult =
  | { ok: true; output: PreviewPackOutput | FullPackOutput; usage: { provider: "mock" | "openai"; tokens: number } }
  | {
      ok: false;
      error: "timeout" | "schema_invalid" | "empty_output" | "refusal" | "quality_failed" | "insufficient_evidence";
      retryable: boolean;
    };

function roleRecommendations(answers: IntakeAnswers): RoleRecommendation[] {
  const roleIdeas = answers.targetRoles
    .split(/,|\n/)
    .map((role) => role.trim())
    .filter(Boolean);

  const primary = roleIdeas[0] || "Operations Coordinator";
  const recommendations: RoleRecommendation[] = [
    {
      id: "ops-coordinator",
      title: primary,
      lane: "Corporate operations",
      confidence: answers.proofMoment.length > 30 ? "strong" : "good",
      whyItFits: [
        `You already handle ${answers.problemsSolved || "day-to-day operational problems"}.`,
        `You communicate with ${answers.communicatesWith || "multiple teams"} to keep work moving.`
      ],
      likelyGaps: [
        "Add one example of reporting, analysis, or stakeholder follow-up if you have it.",
        "Name the tools you used so employers can recognize the environment."
      ]
    },
    {
      id: "implementation-specialist",
      title: "Implementation Specialist",
      lane: "Customer and operations systems",
      confidence: "good",
      whyItFits: [
        "Frontline work gives you real context for how systems succeed or fail in daily operations.",
        "Training, escalation, and handoff examples translate well into implementation work."
      ],
      likelyGaps: ["Show one example of helping someone adopt a process or tool."]
    }
  ];
  return recommendations.slice(0, 5);
}

function previewSections(answers: IntakeAnswers): PackSection[] {
  const translated = `Coordinated ${answers.industry || "frontline"} work by handling ${answers.problemsSolved || "daily operational issues"} and communicating with ${answers.communicatesWith || "cross-functional teams"} to keep service moving.`;
  const warnings = detectEvidenceWarnings({
    content: translated,
    proofMoment: answers.proofMoment,
    section: "Preview skill"
  });

  return [
    {
      id: "preview-skill-1",
      type: "skills",
      title: "Translated skill",
      before: answers.normalDay || "I helped with daily operations.",
      content: translated,
      whyItWorks: "Specific, plain, and tied to real operational work.",
      accessLevel: "preview",
      evidenceWarnings: warnings
    }
  ];
}

function paidSections(answers: IntakeAnswers): PackSection[] {
  const baseWarnings = detectEvidenceWarnings({
    content: answers.proofMoment || "Supported daily operations and helped resolve recurring issues.",
    proofMoment: answers.proofMoment,
    section: "Resume bullets"
  });

  return [
    ...previewSections(answers),
    {
      id: "summary",
      type: "summary",
      title: "Resume summary",
      content: `Frontline ${answers.industry || "operations"} professional with experience handling daily workflows, solving practical service problems, and communicating across teams. Ready to move into corporate operations or leadership roles where real-world execution matters.`,
      accessLevel: "paid",
      evidenceWarnings: []
    },
    {
      id: "bullets",
      type: "bullets",
      title: "Resume bullets",
      content: `- Managed daily work across ${answers.currentRole || "frontline operations"} responsibilities while keeping service moving.\n- Resolved recurring problems involving ${answers.problemsSolved || "customer and operational issues"}.\n- Communicated with ${answers.communicatesWith || "team members and supervisors"} to support handoffs and issue recovery.`,
      accessLevel: "paid",
      evidenceWarnings: baseWarnings
    },
    {
      id: "linkedin",
      type: "linkedin",
      title: "LinkedIn headline and About",
      content: `${answers.currentRole || "Frontline operations"} experience translated into operations, customer, and leadership value. I understand how daily work gets done and how to make processes clearer for the people using them.`,
      accessLevel: "paid",
      evidenceWarnings: []
    },
    {
      id: "stories",
      type: "stories",
      title: "Interview story",
      content: `Situation: ${answers.normalDay || "A normal workday required staying organized under pressure."}\nAction: ${answers.proofMoment || "I helped the team resolve issues and keep work moving."}\nResult: The work stayed clearer, faster, and easier for the next person to continue.`,
      accessLevel: "paid",
      evidenceWarnings: baseWarnings
    },
    {
      id: "plan",
      type: "plan",
      title: "30-day move-up plan",
      content: "Week 1: choose 2 target role lanes and update your summary.\nWeek 2: rewrite bullets using proof moments.\nWeek 3: update LinkedIn and contact three people near the role.\nWeek 4: apply selectively and practice the strongest story.",
      accessLevel: "paid",
      evidenceWarnings: []
    }
  ];
}

function validateQuality(sections: PackSection[], rubric: QualityRubric): GenerationResult | null {
  const text = sections.map((section) => section.content).join(" ");
  if (!text.trim()) {
    return { ok: false, error: "empty_output", retryable: true };
  }

  if (findBannedTerms(text).length > 0 || rubric.plainLanguage === "Needs detail") {
    return { ok: false, error: "quality_failed", retryable: true };
  }

  return null;
}

export async function generatePreview(answers: IntakeAnswers): Promise<GenerationResult> {
  const sections = previewSections(answers);
  const output = {
    roleRecommendations: roleRecommendations(answers),
    sections,
    qualityRubric: createQualityRubric(sections)
  };

  const parsed = previewPackSchema.safeParse(output);
  if (!parsed.success) {
    return { ok: false, error: "schema_invalid", retryable: true };
  }

  return { ok: true, output: parsed.data, usage: { provider: "mock", tokens: 0 } };
}

export async function generateFullPack(answers: IntakeAnswers): Promise<GenerationResult> {
  const sections = paidSections(answers);
  const rubric = createQualityRubric(sections);
  const qualityFailure = validateQuality(sections, rubric);
  if (qualityFailure) return qualityFailure;

  const output = {
    roleRecommendations: roleRecommendations(answers),
    sections,
    qualityRubric: rubric
  };

  const parsed = fullPackSchema.safeParse(output);
  if (!parsed.success) {
    return { ok: false, error: "schema_invalid", retryable: true };
  }

  return { ok: true, output: parsed.data, usage: { provider: "mock", tokens: 0 } };
}
