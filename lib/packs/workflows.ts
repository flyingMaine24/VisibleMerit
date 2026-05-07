import { generateFullPack, generatePreview } from "@/lib/ai/generate";
import { sanitizeAnalyticsMetadata } from "@/lib/analytics/allowlist";
import { shouldRejectRewrite } from "@/lib/editorial/standard";
import { getRepository, type VisibleMeritRepository } from "@/lib/data/repository";
import { getPrimaryLane } from "@/lib/packs/primary-lane";
import { transitionPackStatus } from "@/lib/packs/status";
import type { IntakeAnswers, Pack } from "@/lib/types";

type WorkflowOptions = {
  repository?: VisibleMeritRepository;
};

type WorkflowFailure =
  | "pack_not_found"
  | "intake_missing"
  | "empty_input"
  | "preview_generation_failed"
  | "full_generation_failed"
  | "rewrite_rejected"
  | "section_not_found";

type WorkflowResult<T> = { ok: true; value: T } | { ok: false; reason: WorkflowFailure };

function repoFrom(options?: WorkflowOptions): VisibleMeritRepository {
  return options?.repository ?? getRepository();
}

function roleIdeasFrom(rawIntent: string): string[] {
  return rawIntent.split(/,|\n/).map((role) => role.trim()).filter(Boolean);
}

export async function createPreviewPack(
  email: string,
  intake: IntakeAnswers,
  options?: WorkflowOptions
): Promise<WorkflowResult<Pack>> {
  const repository = repoFrom(options);
  let pack = repository.createPack(email, intake);
  const preview = await generatePreview(intake);

  if (!preview.ok) {
    return { ok: false, reason: "preview_generation_failed" };
  }

  pack = repository.savePack({
    ...pack,
    generationStatus: transitionPackStatus(
      transitionPackStatus(pack.generationStatus, "recommend_roles"),
      "generate_preview"
    ),
    rolePreference: {
      id: `${pack.id}-preference`,
      rawIntent: intake.targetRoles,
      targetRoleIdeas: roleIdeasFrom(intake.targetRoles),
      workToAvoid: intake.avoidWork
    },
    workIdentitySnapshot: preview.output.workIdentitySnapshot,
    roleRecommendations: preview.output.roleRecommendations,
    selectedRoleTargetIds: preview.output.roleRecommendations.slice(0, 1).map((role) => role.id),
    sections: preview.output.sections,
    qualityRubric: preview.output.qualityRubric,
    previewGenerationCount: pack.previewGenerationCount + 1
  });

  repository.trackEvent({
    eventName: "preview_generated",
    packId: pack.id,
    userId: pack.userId,
    metadata: sanitizeAnalyticsMetadata({
      industry: intake.industry,
      selected_role_count: pack.selectedRoleTargetIds.length,
      generation_status: pack.generationStatus
    }),
    createdAt: new Date().toISOString()
  });

  return { ok: true, value: pack };
}

export function selectRoleTargetsForPack(
  packId: string,
  roleIds: string[],
  options?: WorkflowOptions
): WorkflowResult<Pack> {
  const repository = repoFrom(options);
  const pack = repository.getPack(packId);
  if (!pack) return { ok: false, reason: "pack_not_found" };

  const selectedLimit = pack.paymentStatus === "paid" ? 3 : 1;
  const selected = roleIds.slice(0, selectedLimit);
  const updated = repository.savePack({
    ...pack,
    selectedRoleTargetIds: selected.length ? selected : pack.selectedRoleTargetIds
  });

  return { ok: true, value: updated };
}

export async function addProofDetailToPack(
  packId: string,
  proofDetail: string,
  options?: WorkflowOptions
): Promise<WorkflowResult<Pack>> {
  const repository = repoFrom(options);
  const pack = repository.getPack(packId);
  if (!pack?.intake) return { ok: false, reason: "intake_missing" };
  if (!proofDetail.trim()) return { ok: false, reason: "empty_input" };

  const intake = {
    ...pack.intake,
    proofMoment: `${pack.intake.proofMoment}\n${proofDetail.trim()}`
  };
  const preview = await generatePreview(intake);
  if (!preview.ok) return { ok: false, reason: "preview_generation_failed" };

  const updated = repository.savePack({
    ...pack,
    intake,
    workIdentitySnapshot: preview.output.workIdentitySnapshot,
    roleRecommendations: preview.output.roleRecommendations,
    sections: preview.output.sections,
    qualityRubric: preview.output.qualityRubric,
    previewGenerationCount: pack.previewGenerationCount + 1
  });

  repository.trackEvent({
    eventName: "proof_detail_added",
    packId,
    userId: updated.userId,
    metadata: sanitizeAnalyticsMetadata({ generation_status: updated.generationStatus }),
    createdAt: new Date().toISOString()
  });

  return { ok: true, value: updated };
}

export function startCheckoutForPack(packId: string, options?: WorkflowOptions): WorkflowResult<Pack> {
  const repository = repoFrom(options);
  const pack = repository.getPack(packId);
  if (!pack) return { ok: false, reason: "pack_not_found" };

  const updated = repository.savePack({
    ...pack,
    paymentStatus: "checkout_started",
    generationStatus: transitionPackStatus(pack.generationStatus, "start_checkout")
  });

  repository.trackEvent({
    eventName: "checkout_started",
    packId,
    userId: updated.userId,
    metadata: sanitizeAnalyticsMetadata({ payment_status: updated.paymentStatus }),
    createdAt: new Date().toISOString()
  });

  return { ok: true, value: updated };
}

export function completeLoginForPack(
  packId: string,
  email: string,
  next: string,
  options?: WorkflowOptions
): WorkflowResult<Pack> {
  const repository = repoFrom(options);
  const pack = repository.getPack(packId);
  if (!pack) return { ok: false, reason: "pack_not_found" };

  const nextEmail = email || pack.email;
  const updated = repository.savePack({
    ...pack,
    email: nextEmail,
    userId: `user-${nextEmail.toLowerCase()}`
  });

  repository.trackEvent({
    eventName: "login_completed",
    packId,
    userId: updated.userId,
    metadata: sanitizeAnalyticsMetadata({ next }),
    createdAt: new Date().toISOString()
  });

  return { ok: true, value: updated };
}

export async function generatePaidPackForPack(
  packId: string,
  options?: WorkflowOptions
): Promise<WorkflowResult<Pack>> {
  const repository = repoFrom(options);
  const pack = repository.getPack(packId);
  if (!pack?.intake) return { ok: false, reason: "intake_missing" };

  if (pack.generationStatus === "generated" && pack.paymentStatus === "paid") {
    return { ok: true, value: pack };
  }

  let updated = repository.savePack({
    ...pack,
    paymentStatus: "paid",
    generationStatus: transitionPackStatus(
      transitionPackStatus(pack.generationStatus === "checkout_started" ? pack.generationStatus : "checkout_started", "mark_paid"),
      "start_full_generation"
    )
  });

  const primaryLane = getPrimaryLane(pack);
  const generated = await generateFullPack(pack.intake, primaryLane?.title);
  if (!generated.ok) {
    updated = repository.savePack({
      ...updated,
      generationStatus: generated.error === "quality_failed" ? "needs_review" : "generation_failed"
    });
    return { ok: false, reason: "full_generation_failed" };
  }

  updated = repository.savePack({
    ...updated,
    generationMode: "full",
    generationStatus: "generated",
    sections: generated.output.sections,
    roleRecommendations: generated.output.roleRecommendations,
    workIdentitySnapshot: generated.output.workIdentitySnapshot,
    qualityRubric: generated.output.qualityRubric
  });

  repository.trackEvent({
    eventName: "full_pack_generated",
    packId,
    userId: updated.userId,
    metadata: sanitizeAnalyticsMetadata({
      generation_status: updated.generationStatus,
      payment_status: updated.paymentStatus
    }),
    createdAt: new Date().toISOString()
  });

  return { ok: true, value: updated };
}

export function markPackPaidFromWebhook(
  packId: string,
  options?: WorkflowOptions
): WorkflowResult<{ pack: Pack; duplicate: boolean }> {
  const repository = repoFrom(options);
  const pack = repository.getPack(packId);
  if (!pack) return { ok: false, reason: "pack_not_found" };
  if (pack.paymentStatus === "paid") return { ok: true, value: { pack, duplicate: true } };

  const updated = repository.savePack({
    ...pack,
    paymentStatus: "paid",
    generationStatus: transitionPackStatus(pack.generationStatus, "mark_paid")
  });

  return { ok: true, value: { pack: updated, duplicate: false } };
}

export async function generateQueuedFullPack(
  packId: string,
  options?: WorkflowOptions
): Promise<WorkflowResult<Pack>> {
  const repository = repoFrom(options);
  const pack = repository.getPack(packId);
  if (!pack?.intake) return { ok: false, reason: "intake_missing" };

  const result = await generateFullPack(pack.intake, getPrimaryLane(pack)?.title);
  if (!result.ok) {
    repository.savePack({
      ...pack,
      generationStatus: result.error === "quality_failed" ? "needs_review" : "generation_failed"
    });
    return { ok: false, reason: "full_generation_failed" };
  }

  const updated = repository.savePack({
    ...pack,
    paymentStatus: "paid",
    generationMode: "full",
    generationStatus: "generated",
    sections: result.output.sections,
    roleRecommendations: result.output.roleRecommendations,
    workIdentitySnapshot: result.output.workIdentitySnapshot,
    qualityRubric: result.output.qualityRubric
  });

  return { ok: true, value: updated };
}

export function rewritePackSection(packId: string, sectionId: string, options?: WorkflowOptions): WorkflowResult<Pack> {
  const repository = repoFrom(options);
  const pack = repository.getPack(packId);
  const section = pack?.sections.find((candidate) => candidate.id === sectionId);
  if (!pack) return { ok: false, reason: "pack_not_found" };
  if (!section) return { ok: false, reason: "section_not_found" };

  const nextSection = {
    ...section,
    content: section.content.replace(/\b(Coordinated|Managed)\b/, "Handled").replace(/\bprofessional\b/gi, "work")
  };
  const nextRubric = pack.qualityRubric;
  if (shouldRejectRewrite(pack.qualityRubric, nextRubric)) {
    return { ok: false, reason: "rewrite_rejected" };
  }

  const updated = repository.savePack({
    ...pack,
    sections: pack.sections.map((candidate) => (candidate.id === sectionId ? nextSection : candidate)),
    qualityRubric: nextRubric
  });

  return { ok: true, value: updated };
}
