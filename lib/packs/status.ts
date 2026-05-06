import type { GenerationStatus } from "@/lib/types";

export type PackEvent =
  | "start_intake"
  | "complete_intake"
  | "recommend_roles"
  | "generate_preview"
  | "start_checkout"
  | "mark_paid"
  | "start_full_generation"
  | "complete_generation"
  | "fail_generation"
  | "flag_needs_review";

const transitions: Record<GenerationStatus, Partial<Record<PackEvent, GenerationStatus>>> = {
  draft: { start_intake: "intake_started" },
  intake_started: { complete_intake: "intake_complete" },
  intake_complete: { recommend_roles: "role_recommendations_ready" },
  role_recommendations_ready: { generate_preview: "preview_generated" },
  preview_generated: { start_checkout: "checkout_started" },
  checkout_started: { mark_paid: "paid" },
  paid: { start_full_generation: "generating" },
  generating: {
    complete_generation: "generated",
    fail_generation: "generation_failed",
    flag_needs_review: "needs_review"
  },
  generated: {},
  generation_failed: { start_full_generation: "generating" },
  needs_review: { complete_generation: "generated", fail_generation: "generation_failed" }
};

export function transitionPackStatus(current: GenerationStatus, event: PackEvent): GenerationStatus {
  const next = transitions[current]?.[event];
  if (!next) {
    throw new Error(`Invalid pack transition: ${current} -> ${event}`);
  }
  return next;
}

export function getUserVisibleStatus(status: GenerationStatus): string {
  switch (status) {
    case "draft":
    case "intake_started":
      return "Your work interview is in progress.";
    case "intake_complete":
      return "Your answers are ready for role direction.";
    case "role_recommendations_ready":
      return "Your role lanes are ready.";
    case "preview_generated":
      return "Your free preview is ready.";
    case "checkout_started":
      return "Checkout is in progress.";
    case "paid":
      return "Payment confirmed.";
    case "generating":
      return "Your full Story + Plan Pack is being prepared.";
    case "generated":
      return "Your full pack is ready.";
    case "generation_failed":
      return "We could not finish this pack yet.";
    case "needs_review":
      return "We are checking this pack because one section did not meet the Visible Merit standard.";
  }
}
