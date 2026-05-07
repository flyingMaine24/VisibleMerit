import type { IntakeAnswers, PackSection, QualityRubric, RoleRecommendation, WorkIdentitySnapshot } from "@/lib/types";
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

function includesAny(text: string, terms: string[]): boolean {
  const normalized = text.toLowerCase();
  return terms.some((term) => normalized.includes(term));
}

function workIdentitySnapshot(answers: IntakeAnswers): WorkIdentitySnapshot {
  const combined = [
    answers.normalDay,
    answers.problemsSolved,
    answers.toolsUsed,
    answers.communicatesWith,
    answers.proofMoment
  ].join(" ");

  const strengths = [
    includesAny(combined, ["delay", "handoff", "turnaround", "coordinate", "moving"]) && "Coordination under pressure",
    includesAny(combined, ["gate", "supervisor", "team", "communicat", "agent"]) && "Cross-team communication",
    includesAny(combined, ["customer", "service", "recovery", "issue", "problem"]) && "Service recovery and issue handling",
    includesAny(combined, ["radio", "scanner", "system", "tool", "software"]) && "Tool-based execution",
    includesAny(combined, ["train", "trained", "coach", "lead", "organize"]) && "Training and team support",
    includesAny(combined, ["process", "standard", "document", "improve"]) && "Process improvement"
  ].filter(Boolean) as string[];

  const uniqueStrengths = strengths.length
    ? Array.from(new Set(strengths)).slice(0, 4)
    : ["Daily execution", "Practical problem solving", "Team communication"];

  const needsMoreDetail = [
    "Measured outcomes, volume, speed, error reduction, or service impact.",
    "One example of reporting, documentation, or stakeholder follow-up."
  ];

  if (!answers.toolsUsed.trim()) {
    needsMoreDetail.push("Specific tools or systems employers would recognize.");
  }

  return {
    headline: `Your ${answers.currentRole || "frontline"} work shows ${uniqueStrengths.slice(0, 3).join(", ").toLowerCase()}.`,
    strengths: uniqueStrengths,
    laneBridge:
      "You do not need to know the job title yet. These lanes are based on the work patterns in your answers.",
    proofConfidence: {
      strongEvidence: [
        answers.problemsSolved ? `Problems handled: ${answers.problemsSolved}` : "Daily operational problem solving.",
        answers.communicatesWith ? `Communication path: ${answers.communicatesWith}` : "Communication across people and teams.",
        answers.proofMoment ? `Proof moment: ${answers.proofMoment}` : "A real work moment that can be strengthened with detail."
      ],
      needsMoreDetail,
      safeToUseNow: [
        "Plain operational translation.",
        "Role lane direction.",
        "Evidence warnings that keep claims credible."
      ]
    }
  };
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

function paidSections(answers: IntakeAnswers, primaryLaneTitle?: string): PackSection[] {
  const targetRole = primaryLaneTitle || answers.targetRoles.split(/,|\n/).map((role) => role.trim()).filter(Boolean)[0] || "Operations Coordinator";
  const currentRole = answers.currentRole || "frontline operations";
  const industry = answers.industry || "operations";
  const problems = answers.problemsSolved || "daily operational issues";
  const communication = answers.communicatesWith || "team members and supervisors";
  const tools = answers.toolsUsed || "frontline tools and systems";
  const proofMoment = answers.proofMoment || "helped the team resolve issues and keep work moving";
  const baseWarnings = detectEvidenceWarnings({
    content: proofMoment,
    proofMoment: answers.proofMoment,
    section: "Resume bullets"
  });

  return [
    ...previewSections(answers),
    {
      id: "summary",
      type: "summary",
      title: "Resume summary",
      content: `Frontline ${industry} professional moving toward ${targetRole} work, with practical experience coordinating daily execution, resolving ${problems}, and communicating across ${communication}. Brings direct operating context, service recovery judgment, and a clear view of how work actually moves through frontline teams.`,
      accessLevel: "paid",
      evidenceWarnings: []
    },
    {
      id: "bullets",
      type: "bullets",
      title: "Resume bullets",
      content: `- Coordinated daily ${currentRole} responsibilities while keeping service moving across time-sensitive ${industry} workflows.\n- Resolved recurring operational problems involving ${problems}, balancing speed, accuracy, and team handoffs.\n- Communicated with ${communication} to keep work aligned during normal operations and recovery moments.\n- Used ${tools} to track, coordinate, or complete work in a live operating environment.\n- Supported issue recovery by identifying what needed attention, who needed to know, and what had to happen next.\n- Helped maintain continuity between teams by making handoffs clearer and reducing missed context.\n- Built practical judgment in high-pressure frontline conditions where delays, customers, tools, and teams intersect.\n- Contributed proof for ${targetRole} work through coordination, communication, problem solving, and execution discipline.`,
      accessLevel: "paid",
      evidenceWarnings: baseWarnings
    },
    {
      id: "linkedin",
      type: "linkedin",
      title: "LinkedIn headline and About",
      content: `Headline: ${currentRole} experience moving toward ${targetRole} | Operations, service recovery, and frontline execution\n\nAbout: I bring practical ${industry} experience from work where timing, communication, tools, and team handoffs matter. My background includes solving ${problems}, working with ${communication}, and learning how daily operations succeed or break down in real conditions. I am interested in ${targetRole} opportunities where frontline judgment, clear follow-through, and real operating context can help teams improve how work gets done.`,
      accessLevel: "paid",
      evidenceWarnings: []
    },
    {
      id: "stories",
      type: "stories",
      title: "Interview stories",
      content: `Story 1 - Coordinating under pressure\nSituation: ${answers.normalDay || "A normal workday required staying organized under pressure."}\nAction: I stayed focused on the next handoff, communicated with the right people, and kept the work moving through the issue.\nResult: The team had clearer context and the operation had a better chance of recovering without avoidable confusion.\n\nStory 2 - Solving practical work problems\nSituation: The work involved recurring problems around ${problems}.\nAction: I used the tools and communication paths available, including ${tools}, to help resolve the issue and keep people aligned.\nResult: This shows the kind of practical judgment useful in ${targetRole} work: noticing the problem, coordinating next steps, and following through.\n\nStory 3 - Supporting others\nSituation: ${proofMoment}.\nAction: I helped make the work easier for others to understand or continue.\nResult: This can support examples around training, team support, process clarity, or frontline leadership.`,
      accessLevel: "paid",
      evidenceWarnings: baseWarnings
    },
    {
      id: "gaps",
      type: "gaps",
      title: "Skills gap checklist",
      content: `For ${targetRole}, strengthen these proof points next:\n- Add one measurable outcome: volume handled, time saved, errors reduced, customers helped, or delays recovered.\n- Capture one example of reporting, documentation, scheduling, or stakeholder follow-up.\n- Name the systems or tools you used and what decisions they helped you make.\n- Prepare one story showing how you improved a handoff, process, or team communication point.\n- Identify one business-facing phrase for your work, such as service recovery, operational coordination, implementation support, or process follow-through.`,
      accessLevel: "paid",
      evidenceWarnings: []
    },
    {
      id: "plan",
      type: "plan",
      title: "30-day move-up plan",
      content: `Week 1: Use ${targetRole} as the primary lane. Update your resume summary and choose the strongest 4 bullets from this pack.\nWeek 2: Add detail to weak proof points: numbers, tools, reporting, handoffs, or stakeholder examples.\nWeek 3: Update LinkedIn with the new headline/about section and find 8-10 ${targetRole} postings to compare language.\nWeek 4: Apply selectively, practice the three interview stories, and track which role requirements keep repeating.`,
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
    workIdentitySnapshot: workIdentitySnapshot(answers),
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

export async function generateFullPack(answers: IntakeAnswers, primaryLaneTitle?: string): Promise<GenerationResult> {
  const sections = paidSections(answers, primaryLaneTitle);
  const rubric = createQualityRubric(sections);
  const qualityFailure = validateQuality(sections, rubric);
  if (qualityFailure) return qualityFailure;

  const output = {
    workIdentitySnapshot: workIdentitySnapshot(answers),
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
