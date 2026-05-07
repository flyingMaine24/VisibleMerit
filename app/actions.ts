"use server";

import { redirect } from "next/navigation";
import type { IntakeAnswers } from "@/lib/types";
import { createPack, getPack, savePack, trackEvent } from "@/lib/store";
import { generateFullPack, generatePreview } from "@/lib/ai/generate";
import { sanitizeAnalyticsMetadata } from "@/lib/analytics/allowlist";
import { transitionPackStatus } from "@/lib/packs/status";
import { shouldRejectRewrite } from "@/lib/editorial/standard";
import { getPrimaryLane } from "@/lib/packs/primary-lane";

function formValue(formData: FormData, key: keyof IntakeAnswers | "email"): string {
  return String(formData.get(key) ?? "").trim();
}

function genericFormValue(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

export async function submitIntake(formData: FormData) {
  const email = formValue(formData, "email") || "demo@visiblemerit.local";
  const intake: IntakeAnswers = {
    currentRole: formValue(formData, "currentRole"),
    industry: formValue(formData, "industry"),
    normalDay: formValue(formData, "normalDay"),
    problemsSolved: formValue(formData, "problemsSolved"),
    toolsUsed: formValue(formData, "toolsUsed"),
    communicatesWith: formValue(formData, "communicatesWith"),
    proofMoment: formValue(formData, "proofMoment"),
    targetRoles: formValue(formData, "targetRoles"),
    avoidWork: formValue(formData, "avoidWork")
  };

  let pack = createPack(email, intake);
  const preview = await generatePreview(intake);
  if (preview.ok) {
    pack = savePack({
      ...pack,
      generationStatus: transitionPackStatus(
        transitionPackStatus(pack.generationStatus, "recommend_roles"),
        "generate_preview"
      ),
      rolePreference: {
        id: `${pack.id}-preference`,
        rawIntent: intake.targetRoles,
        targetRoleIdeas: intake.targetRoles.split(/,|\n/).map((role) => role.trim()).filter(Boolean),
        workToAvoid: intake.avoidWork
      },
      workIdentitySnapshot: preview.output.workIdentitySnapshot,
      roleRecommendations: preview.output.roleRecommendations,
      selectedRoleTargetIds: preview.output.roleRecommendations.slice(0, 1).map((role) => role.id),
      sections: preview.output.sections,
      qualityRubric: preview.output.qualityRubric,
      previewGenerationCount: pack.previewGenerationCount + 1
    });
  }

  trackEvent({
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

  redirect(`/preview/${pack.id}`);
}

export async function selectRoleTargets(packId: string, formData: FormData) {
  const pack = getPack(packId);
  if (!pack) return;
  const selectedLimit = pack.paymentStatus === "paid" ? 3 : 1;
  const selected = formData.getAll("role").map(String).slice(0, selectedLimit);
  savePack({ ...pack, selectedRoleTargetIds: selected.length ? selected : pack.selectedRoleTargetIds });
  redirect(pack.paymentStatus === "paid" ? `/packs/${packId}` : `/login?packId=${packId}&next=preview`);
}

export async function addProofDetail(packId: string, formData: FormData) {
  const pack = getPack(packId);
  if (!pack?.intake) redirect("/intake");
  const proofDetail = genericFormValue(formData, "proofDetail");
  if (!proofDetail) redirect(`/preview/${packId}`);

  const intake = {
    ...pack.intake,
    proofMoment: `${pack.intake.proofMoment}\n${proofDetail}`
  };
  const preview = await generatePreview(intake);
  if (!preview.ok) redirect(`/preview/${packId}`);

  const updated = savePack({
    ...pack,
    intake,
    workIdentitySnapshot: preview.output.workIdentitySnapshot,
    roleRecommendations: preview.output.roleRecommendations,
    sections: preview.output.sections,
    qualityRubric: preview.output.qualityRubric,
    previewGenerationCount: pack.previewGenerationCount + 1
  });

  trackEvent({
    eventName: "proof_detail_added",
    packId,
    userId: updated.userId,
    metadata: sanitizeAnalyticsMetadata({ generation_status: updated.generationStatus }),
    createdAt: new Date().toISOString()
  });

  redirect(`/preview/${packId}`);
}

export async function startCheckout(packId: string) {
  const pack = getPack(packId);
  if (!pack) redirect("/intake");
  const checkoutStarted = savePack({
    ...pack,
    paymentStatus: "checkout_started",
    generationStatus: transitionPackStatus(pack.generationStatus, "start_checkout")
  });
  trackEvent({
    eventName: "checkout_started",
    packId,
    userId: checkoutStarted.userId,
    metadata: sanitizeAnalyticsMetadata({ payment_status: checkoutStarted.paymentStatus }),
    createdAt: new Date().toISOString()
  });
  redirect(`/login?packId=${packId}&next=checkout`);
}

export async function continueAfterLogin(packId: string, next: string, formData: FormData) {
  const pack = getPack(packId);
  if (!pack) redirect("/intake");
  const email = genericFormValue(formData, "email") || pack.email;
  const updated = savePack({
    ...pack,
    email,
    userId: `user-${email.toLowerCase()}`
  });

  trackEvent({
    eventName: "login_completed",
    packId,
    userId: updated.userId,
    metadata: sanitizeAnalyticsMetadata({ next }),
    createdAt: new Date().toISOString()
  });

  if (next === "checkout") redirect(`/checkout/success?packId=${packId}`);
  if (next === "preview") redirect(`/preview/${packId}`);
  redirect(`/packs/${packId}`);
}

export async function generatePaidPack(packId: string) {
  const pack = getPack(packId);
  if (!pack?.intake) redirect("/intake");

  if (pack.generationStatus === "generated" && pack.paymentStatus === "paid") {
    redirect(`/packs/${packId}`);
  }

  let updated = savePack({
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
    updated = savePack({
      ...updated,
      generationStatus: generated.error === "quality_failed" ? "needs_review" : "generation_failed"
    });
    redirect(`/checkout/success?packId=${updated.id}`);
  }

  updated = savePack({
    ...updated,
    generationMode: "full",
    generationStatus: "generated",
    sections: generated.output.sections,
    roleRecommendations: generated.output.roleRecommendations,
    workIdentitySnapshot: generated.output.workIdentitySnapshot,
    qualityRubric: generated.output.qualityRubric
  });

  trackEvent({
    eventName: "full_pack_generated",
    packId,
    userId: updated.userId,
    metadata: sanitizeAnalyticsMetadata({ generation_status: updated.generationStatus, payment_status: updated.paymentStatus }),
    createdAt: new Date().toISOString()
  });

  redirect(`/packs/${packId}`);
}

export async function rewriteSection(packId: string, sectionId: string) {
  const pack = getPack(packId);
  const section = pack?.sections.find((candidate) => candidate.id === sectionId);
  if (!pack || !section) return;

  const nextSection = {
    ...section,
    content: section.content.replace(/\b(Coordinated|Managed)\b/, "Handled").replace(/\bprofessional\b/gi, "work")
  };
  const nextRubric = pack.qualityRubric;
  if (shouldRejectRewrite(pack.qualityRubric, nextRubric)) {
    return;
  }

  savePack({
    ...pack,
    sections: pack.sections.map((candidate) => (candidate.id === sectionId ? nextSection : candidate)),
    qualityRubric: nextRubric
  });
}
