"use server";

import { redirect } from "next/navigation";
import type { IntakeAnswers } from "@/lib/types";
import {
  addProofDetailToPack,
  completeLoginForPack,
  createPreviewPack,
  generatePaidPackForPack,
  rewritePackSection,
  selectRoleTargetsForPack,
  startCheckoutForPack
} from "@/lib/packs/workflows";

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

  const result = await createPreviewPack(email, intake);
  if (!result.ok) redirect("/intake");

  redirect(`/preview/${result.value.id}`);
}

export async function selectRoleTargets(packId: string, formData: FormData) {
  const result = await selectRoleTargetsForPack(packId, formData.getAll("role").map(String));
  if (!result.ok) return;
  redirect(result.value.paymentStatus === "paid" ? `/packs/${packId}` : `/login?packId=${packId}&next=preview`);
}

export async function addProofDetail(packId: string, formData: FormData) {
  const proofDetail = genericFormValue(formData, "proofDetail");
  if (!proofDetail) redirect(`/preview/${packId}`);
  const result = await addProofDetailToPack(packId, proofDetail);
  if (!result.ok && result.reason === "intake_missing") redirect("/intake");

  redirect(`/preview/${packId}`);
}

export async function startCheckout(packId: string) {
  const result = await startCheckoutForPack(packId);
  if (!result.ok) redirect("/intake");
  redirect(`/login?packId=${packId}&next=checkout`);
}

export async function continueAfterLogin(packId: string, next: string, formData: FormData) {
  const result = await completeLoginForPack(packId, genericFormValue(formData, "email"), next);
  if (!result.ok) redirect("/intake");

  if (next === "checkout") redirect(`/checkout/success?packId=${packId}`);
  if (next === "preview") redirect(`/preview/${packId}`);
  redirect(`/packs/${packId}`);
}

export async function generatePaidPack(packId: string) {
  const result = await generatePaidPackForPack(packId);
  if (!result.ok && result.reason === "intake_missing") redirect("/intake");
  if (!result.ok) redirect(`/checkout/success?packId=${packId}`);

  redirect(`/packs/${packId}`);
}

export async function rewriteSection(packId: string, sectionId: string) {
  await rewritePackSection(packId, sectionId);
}
