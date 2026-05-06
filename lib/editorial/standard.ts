import type { EvidenceWarning, PackSection, QualityRubric } from "@/lib/types";

export const bannedCorporateSlop = [
  "unlock your potential",
  "leverage",
  "synergy",
  "dynamic professional",
  "results-driven",
  "fast-paced environment",
  "proven track record",
  "transform your career",
  "optimize your journey",
  "empower"
];

export const editorialDimensions = [
  "plainLanguage",
  "credible",
  "specific",
  "evidenceSupported"
] as const;

export function findBannedTerms(text: string): string[] {
  const normalized = text.toLowerCase();
  return bannedCorporateSlop.filter((term) => normalized.includes(term));
}

export function createQualityRubric(sections: Pick<PackSection, "content" | "evidenceWarnings">[]): QualityRubric {
  const text = sections.map((section) => section.content).join(" ");
  const banned = findBannedTerms(text);
  const warningCount = sections.flatMap((section) => section.evidenceWarnings).length;
  const vague = /\b(assisted|helped|worked on|various|stuff|things)\b/i.test(text);

  return {
    plainLanguage: banned.length === 0 ? "Strong" : "Needs detail",
    credible: warningCount === 0 ? "Strong" : "Good",
    specific: vague ? "Needs detail" : "Good",
    evidenceSupported: warningCount > 1 ? "Needs detail" : warningCount === 1 ? "Good" : "Strong"
  };
}

export function detectEvidenceWarnings(input: {
  content: string;
  metrics?: string;
  proofMoment?: string;
  section: string;
}): EvidenceWarning[] {
  const warnings: EvidenceWarning[] = [];
  const claimsMetric = /\b(reduced|increased|improved|lowered|saved|raised|cut)\b/i.test(input.content);
  const hasMetric = Boolean(input.metrics?.trim()) || /\d/.test(input.proofMoment ?? "");

  if (claimsMetric && !hasMetric) {
    warnings.push({
      section: input.section,
      severity: "warning",
      message: "Add one number, rough estimate, or concrete before/after example to support this claim."
    });
  }

  if ((input.proofMoment ?? "").trim().length < 24) {
    warnings.push({
      section: input.section,
      severity: "info",
      message: "One more detail about what changed would make this section stronger."
    });
  }

  return warnings;
}

export function shouldRejectRewrite(oldRubric: QualityRubric, newRubric: QualityRubric): boolean {
  const score = (rubric: QualityRubric) =>
    Object.values(rubric).reduce((total, state) => total + (state === "Strong" ? 3 : state === "Good" ? 2 : 1), 0);
  return score(newRubric) < score(oldRubric);
}
