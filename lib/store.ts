import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import type { AnalyticsEvent, IntakeAnswers, Pack } from "@/lib/types";
import { createQualityRubric } from "@/lib/editorial/standard";

const now = () => new Date().toISOString();
const localStorePath =
  process.env.VISIBLE_MERIT_STORE_PATH ??
  join(/*turbopackIgnore: true*/ process.cwd(), ".visible-merit", "local-store.json");

const demoAnswers: IntakeAnswers = {
  currentRole: "Ramp agent",
  industry: "airport operations",
  normalDay: "Loaded bags, supported turnarounds, helped recover delays, and coordinated with gate agents.",
  problemsSolved: "Delay recovery, baggage issues, handoffs, and keeping aircraft turns moving.",
  toolsUsed: "Radio, baggage systems, handheld scanners, airline operations tools",
  communicatesWith: "Ramp agents, gate agents, supervisors, operations control",
  proofMoment: "Trained new agents and helped organize work during repeated delay recovery periods.",
  targetRoles: "Operations Coordinator, Product Operations Associate",
  avoidWork: "I do not want another role that is only physical labor."
};

const demoSections = [
  {
    id: "demo-preview-skill",
    type: "skills" as const,
    title: "Translated skill",
    before: "I helped with daily ops and handled delays.",
    content:
      "Coordinated time-sensitive airport operations across ramp, gate, and supervisor teams to recover delays and keep service moving.",
    whyItWorks: "Specific, plain, and tied to real operational work.",
    accessLevel: "preview" as const,
    evidenceWarnings: []
  }
];

const demoWorkIdentitySnapshot = {
  headline: "Your ramp agent work shows coordination under pressure, cross-team communication, and service recovery.",
  strengths: ["Coordination under pressure", "Cross-team communication", "Service recovery and issue handling", "Tool-based execution"],
  laneBridge: "You do not need to know the job title yet. These lanes are based on the work patterns in your answers.",
  proofConfidence: {
    strongEvidence: [
      "Problems handled: Delay recovery, baggage issues, handoffs, and keeping aircraft turns moving.",
      "Communication path: Ramp agents, gate agents, supervisors, operations control.",
      "Proof moment: Trained new agents and helped organize work during repeated delay recovery periods."
    ],
    needsMoreDetail: [
      "Measured outcomes, volume, speed, error reduction, or service impact.",
      "One example of reporting, documentation, or stakeholder follow-up."
    ],
    safeToUseNow: ["Plain operational translation.", "Role lane direction.", "Evidence warnings that keep claims credible."]
  }
};

type PersistedStore = {
  packs: Pack[];
  analytics: AnalyticsEvent[];
};

function createDemoPack(): Pack {
  return {
    id: "demo-pack",
    userId: "demo-user",
    email: "demo@visiblemerit.local",
    paymentStatus: "free_preview",
    generationStatus: "preview_generated",
    generationMode: "preview",
    qualityRubric: createQualityRubric(demoSections),
    intake: demoAnswers,
    rolePreference: {
      id: "demo-pref",
      rawIntent: demoAnswers.targetRoles,
      targetRoleIdeas: ["Operations Coordinator", "Product Operations Associate"],
      workToAvoid: demoAnswers.avoidWork
    },
    workIdentitySnapshot: demoWorkIdentitySnapshot,
    roleRecommendations: [
      {
        id: "ops-coordinator",
        title: "Operations Coordinator",
        lane: "Corporate operations",
        confidence: "strong",
        whyItFits: ["You handled handoffs and delay recovery.", "You worked across ramp, gate, and supervisor teams."],
        likelyGaps: ["Excel/reporting experience may be needed.", "Corporate stakeholder communication examples would help."]
      },
      {
        id: "product-ops",
        title: "Product Operations Associate",
        lane: "Product and airport technology",
        confidence: "good",
        whyItFits: ["You know how airport tools affect customers and frontline agents.", "You have practical context for service speed."],
        likelyGaps: ["Show one example of documenting a system issue or improving a process."]
      }
    ],
    selectedRoleTargetIds: ["ops-coordinator"],
    sections: demoSections,
    previewGenerationCount: 1,
    createdAt: now(),
    updatedAt: now()
  };
}

function seedStore(): PersistedStore {
  return {
    packs: [createDemoPack()],
    analytics: []
  };
}

function readStore(): PersistedStore {
  if (!existsSync(localStorePath)) return seedStore();

  try {
    const parsed = JSON.parse(readFileSync(localStorePath, "utf8")) as Partial<PersistedStore>;
    const packs = Array.isArray(parsed.packs) ? parsed.packs : [];
    const analytics = Array.isArray(parsed.analytics) ? parsed.analytics : [];
    return {
      packs: packs.some((pack) => pack.id === "demo-pack") ? packs : [createDemoPack(), ...packs],
      analytics
    };
  } catch {
    return seedStore();
  }
}

function writeStore(store: PersistedStore): void {
  mkdirSync(dirname(localStorePath), { recursive: true });
  writeFileSync(localStorePath, JSON.stringify(store, null, 2));
}

const persisted = readStore();
const packs = new Map<string, Pack>(persisted.packs.map((pack) => [pack.id, pack]));
const analytics: AnalyticsEvent[] = persisted.analytics;

function persistStore(): void {
  writeStore({
    packs: Array.from(packs.values()),
    analytics
  });
}

export function listPacks(): Pack[] {
  return Array.from(packs.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getPack(id: string): Pack | undefined {
  return packs.get(id);
}

export function savePack(pack: Pack): Pack {
  const updated = { ...pack, updatedAt: now() };
  packs.set(updated.id, updated);
  persistStore();
  return updated;
}

export function createPack(email: string, intake: IntakeAnswers): Pack {
  const id = `pack-${Date.now()}`;
  const pack: Pack = {
    id,
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
    createdAt: now(),
    updatedAt: now()
  };
  return savePack(pack);
}

export function trackEvent(event: AnalyticsEvent): void {
  analytics.push(event);
  persistStore();
}

export function getAnalytics(): AnalyticsEvent[] {
  return analytics;
}
