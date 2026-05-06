import { describe, expect, it } from "vitest";
import { createQualityRubric, detectEvidenceWarnings, findBannedTerms, shouldRejectRewrite } from "@/lib/editorial/standard";

describe("editorial standard", () => {
  it("detects banned corporate slop", () => {
    expect(findBannedTerms("Unlock your potential and leverage your professional journey.")).toEqual([
      "unlock your potential",
      "leverage"
    ]);
  });

  it("creates a rubric that penalizes vague unsupported content", () => {
    const rubric = createQualityRubric([
      {
        content: "I helped with various things and improved the process.",
        evidenceWarnings: [{ section: "bullets", message: "Add evidence.", severity: "warning" }]
      }
    ]);

    expect(rubric.specific).toBe("Needs detail");
    expect(rubric.evidenceSupported).toBe("Good");
  });

  it("warns when improvement claims lack evidence", () => {
    const warnings = detectEvidenceWarnings({
      content: "Improved workflow consistency across the team.",
      proofMoment: "",
      section: "Resume bullet"
    });

    expect(warnings.some((warning) => warning.severity === "warning")).toBe(true);
  });

  it("rejects rewrites that lower quality", () => {
    expect(
      shouldRejectRewrite(
        { plainLanguage: "Strong", credible: "Strong", specific: "Strong", evidenceSupported: "Strong" },
        { plainLanguage: "Strong", credible: "Good", specific: "Needs detail", evidenceSupported: "Good" }
      )
    ).toBe(true);
  });
});
