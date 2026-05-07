import { describe, expect, it } from "vitest";
import { generateFullPack, generatePreview } from "@/lib/ai/generate";

const answers = {
  currentRole: "Ramp agent",
  industry: "airport operations",
  normalDay: "Loaded bags, supported turnarounds, helped recover delays, and coordinated with gate agents.",
  problemsSolved: "Delay recovery, baggage issues, handoffs, and keeping aircraft turns moving.",
  toolsUsed: "Radio, baggage systems, handheld scanners, airline operations tools",
  communicatesWith: "Ramp agents, gate agents, supervisors, operations control",
  proofMoment: "Trained new agents and helped organize work during repeated delay recovery periods with 6 newer agents.",
  targetRoles: "Operations Coordinator, Product Operations Associate",
  avoidWork: "I do not want another role that is only physical labor."
};

describe("AI generation boundary", () => {
  it("generates preview with role recommendations and a Visible Merit rubric", async () => {
    const result = await generatePreview(answers);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.output.workIdentitySnapshot.strengths).toContain("Coordination under pressure");
      expect(result.output.workIdentitySnapshot.proofConfidence.strongEvidence.length).toBeGreaterThan(0);
      expect(result.output.roleRecommendations.length).toBeGreaterThan(0);
      expect(result.output.sections[0].accessLevel).toBe("preview");
      expect(result.output.qualityRubric.plainLanguage).toBe("Strong");
    }
  });

  it("generates a full pack with paid sections for the primary lane", async () => {
    const result = await generateFullPack(answers, "Operations Coordinator");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.output.sections.length).toBeGreaterThanOrEqual(6);
      expect(result.output.sections.some((section) => section.accessLevel === "paid")).toBe(true);
      expect(result.output.sections.find((section) => section.id === "summary")?.content).toContain("Operations Coordinator");
      expect(result.output.sections.find((section) => section.id === "bullets")?.content.split("\n").length).toBeGreaterThanOrEqual(8);
      expect(result.output.sections.some((section) => section.id === "gaps")).toBe(true);
    }
  });
});
