import { describe, expect, it } from "vitest";
import { getUserVisibleStatus, transitionPackStatus } from "@/lib/packs/status";

describe("pack status transitions", () => {
  it("moves through the approved preview to paid generation path", () => {
    let status = transitionPackStatus("draft", "start_intake");
    status = transitionPackStatus(status, "complete_intake");
    status = transitionPackStatus(status, "recommend_roles");
    status = transitionPackStatus(status, "generate_preview");
    status = transitionPackStatus(status, "start_checkout");
    status = transitionPackStatus(status, "mark_paid");
    status = transitionPackStatus(status, "start_full_generation");
    status = transitionPackStatus(status, "complete_generation");

    expect(status).toBe("generated");
  });

  it("rejects invalid transitions", () => {
    expect(() => transitionPackStatus("draft", "complete_generation")).toThrow("Invalid pack transition");
  });

  it("maps statuses to user-visible labels", () => {
    expect(getUserVisibleStatus("needs_review")).toContain("Visible Merit standard");
  });
});
