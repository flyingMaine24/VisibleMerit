import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { IntakeAnswers } from "@/lib/types";

const answers: IntakeAnswers = {
  currentRole: "Ramp agent",
  industry: "airport operations",
  normalDay: "Loaded bags and supported turnarounds.",
  problemsSolved: "Delay recovery and baggage issues.",
  toolsUsed: "Radio and scanners",
  communicatesWith: "Ramp agents and supervisors",
  proofMoment: "Trained new agents during delay recovery.",
  targetRoles: "Operations Coordinator",
  avoidWork: "Only physical labor"
};

describe("local store", () => {
  const originalStorePath = process.env.VISIBLE_MERIT_STORE_PATH;
  let tempDir: string | undefined;

  afterEach(() => {
    process.env.VISIBLE_MERIT_STORE_PATH = originalStorePath;
    if (tempDir) rmSync(tempDir, { force: true, recursive: true });
    tempDir = undefined;
    vi.resetModules();
  });

  it("persists packs across module reloads in local mode", async () => {
    tempDir = mkdtempSync(join(tmpdir(), "visible-merit-store-test-"));
    process.env.VISIBLE_MERIT_STORE_PATH = join(tempDir, "store.json");
    vi.resetModules();

    const firstStore = await import("@/lib/store");
    const pack = firstStore.createPack("test@example.com", answers);

    vi.resetModules();
    const secondStore = await import("@/lib/store");

    expect(secondStore.getPack(pack.id)?.intake?.currentRole).toBe("Ramp agent");
  });
});
