import { describe, expect, it } from "vitest";
import type { AnalyticsEvent, IntakeAnswers, Pack } from "@/lib/types";
import type { VisibleMeritRepository } from "@/lib/data/repository";
import {
  createPreviewPack,
  markPackPaidFromWebhook,
  selectRoleTargetsForPack,
  startCheckoutForPack
} from "@/lib/packs/workflows";

const answers: IntakeAnswers = {
  currentRole: "Ramp agent",
  industry: "airport operations",
  normalDay: "Loaded bags, supported turns, and coordinated with gate agents.",
  problemsSolved: "Delay recovery, baggage issues, and handoffs.",
  toolsUsed: "Radio, scanners, baggage systems",
  communicatesWith: "Ramp agents, gate agents, supervisors",
  proofMoment: "Trained six newer agents during repeated delay recovery periods.",
  targetRoles: "Operations Coordinator, Implementation Specialist",
  avoidWork: "Only physical labor"
};

function createMemoryRepository(): VisibleMeritRepository {
  const packs = new Map<string, Pack>();
  const analytics: AnalyticsEvent[] = [];

  return {
    async createPack(email, intake) {
      const pack: Pack = {
        id: `pack-${packs.size + 1}`,
        userId: `user-${email.toLowerCase()}`,
        email,
        paymentStatus: "free_preview",
        generationStatus: "intake_complete",
        generationMode: "preview",
        qualityRubric: {
          plainLanguage: "Good",
          credible: "Good",
          specific: "Needs detail",
          evidenceSupported: "Good"
        },
        intake,
        roleRecommendations: [],
        selectedRoleTargetIds: [],
        sections: [],
        previewGenerationCount: 0,
        createdAt: "2026-05-07T00:00:00.000Z",
        updatedAt: "2026-05-07T00:00:00.000Z"
      };
      packs.set(pack.id, pack);
      return pack;
    },
    async getAnalytics() {
      return analytics;
    },
    async getPack(id) {
      return packs.get(id);
    },
    async listPacks() {
      return Array.from(packs.values());
    },
    async savePack(pack) {
      const updated = { ...pack, updatedAt: "2026-05-07T00:00:01.000Z" };
      packs.set(updated.id, updated);
      return updated;
    },
    async trackEvent(event) {
      analytics.push(event);
    }
  };
}

describe("pack workflows", () => {
  it("creates preview packs through one backend boundary", async () => {
    const repository = createMemoryRepository();

    const result = await createPreviewPack("test@example.com", answers, { repository });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.generationStatus).toBe("preview_generated");
      expect(result.value.selectedRoleTargetIds).toHaveLength(1);
      expect(result.value.roleRecommendations.length).toBeGreaterThan(0);
    }
    expect((await repository.getAnalytics()).map((event) => event.eventName)).toContain("preview_generated");
  });

  it("limits role targets before payment and allows three after payment", async () => {
    const repository = createMemoryRepository();
    const preview = await createPreviewPack("test@example.com", answers, { repository });
    expect(preview.ok).toBe(true);
    if (!preview.ok) return;

    const unpaidSelection = await selectRoleTargetsForPack(
      preview.value.id,
      ["ops-coordinator", "implementation-specialist"],
      { repository }
    );
    expect(unpaidSelection.ok).toBe(true);
    if (unpaidSelection.ok) expect(unpaidSelection.value.selectedRoleTargetIds).toEqual(["ops-coordinator"]);

    await repository.savePack({
      ...preview.value,
      paymentStatus: "paid",
      roleRecommendations: [
        ...preview.value.roleRecommendations,
        {
          id: "customer-ops",
          title: "Customer Operations Associate",
          lane: "Customer operations",
          confidence: "good",
          whyItFits: ["You handled service issues."],
          likelyGaps: ["Add customer metrics."]
        },
        {
          id: "team-lead",
          title: "Team Lead",
          lane: "Frontline leadership",
          confidence: "good",
          whyItFits: ["You trained newer agents."],
          likelyGaps: ["Add coaching examples."]
        }
      ]
    });

    const paidSelection = await selectRoleTargetsForPack(
      preview.value.id,
      ["ops-coordinator", "implementation-specialist", "customer-ops", "team-lead"],
      { repository }
    );
    expect(paidSelection.ok).toBe(true);
    if (paidSelection.ok) {
      expect(paidSelection.value.selectedRoleTargetIds).toEqual([
        "ops-coordinator",
        "implementation-specialist",
        "customer-ops"
      ]);
    }
  });

  it("handles checkout and idempotent webhook payment transitions", async () => {
    const repository = createMemoryRepository();
    const preview = await createPreviewPack("test@example.com", answers, { repository });
    expect(preview.ok).toBe(true);
    if (!preview.ok) return;

    const checkout = await startCheckoutForPack(preview.value.id, { repository });
    expect(checkout.ok).toBe(true);
    if (checkout.ok) {
      expect(checkout.value.paymentStatus).toBe("checkout_started");
      expect(checkout.value.generationStatus).toBe("checkout_started");
    }

    const firstWebhook = await markPackPaidFromWebhook(preview.value.id, { repository });
    expect(firstWebhook.ok).toBe(true);
    if (firstWebhook.ok) {
      expect(firstWebhook.value.duplicate).toBe(false);
      expect(firstWebhook.value.pack.paymentStatus).toBe("paid");
    }

    const secondWebhook = await markPackPaidFromWebhook(preview.value.id, { repository });
    expect(secondWebhook.ok).toBe(true);
    if (secondWebhook.ok) expect(secondWebhook.value.duplicate).toBe(true);

    expect((await repository.getAnalytics()).map((event) => event.eventName)).toContain("checkout_started");
  });
});
