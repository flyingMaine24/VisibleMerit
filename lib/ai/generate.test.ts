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
      expect(result.output.roleRecommendations.length).toBeGreaterThan(0);
      expect(result.output.sections[0].accessLevel).toBe("preview");
      expect(result.output.qualityRubric.plainLanguage).toBe("Strong");
    }
  });

  it("generates a full pack with paid sections", async () => {
    const result = await generateFullPack(answers);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.output.sections.length).toBeGreaterThanOrEqual(6);
      expect(result.output.sections.some((section) => section.accessLevel === "paid")).toBe(true);
    }
  });
});
