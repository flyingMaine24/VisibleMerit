import { describe, expect, it } from "vitest";
import { sanitizeAnalyticsMetadata } from "@/lib/analytics/allowlist";

describe("analytics allowlist", () => {
  it("drops raw private career text", () => {
    const sanitized = sanitizeAnalyticsMetadata({
      industry: "airport operations",
      resume_text: "private generated resume bullet",
      raw_intake_answer: "private work story",
      selected_role_count: 2
    });

    expect(sanitized).toEqual({
      industry: "airport operations",
      selected_role_count: 2
    });
  });
});
