import { getRepository } from "@/lib/data/repository";

export async function GET() {
  const repository = getRepository();
  const packs = await repository.listPacks();
  const rows = [
    [
      "created_date",
      "frontline_category",
      "current_role_category",
      "industry",
      "recommended_role_lanes",
      "selected_role_targets",
      "preview_generated",
      "checkout_started",
      "paid",
      "full_pack_generated",
      "quality_bucket",
      "generation_failure_code"
    ],
    ...packs.map((pack) => [
      pack.createdAt,
      "frontline",
      pack.intake?.currentRole ?? "",
      pack.intake?.industry ?? "",
      pack.roleRecommendations.map((role) => role.lane).join("|"),
      pack.selectedRoleTargetIds.join("|"),
      String(pack.previewGenerationCount > 0),
      String(pack.paymentStatus === "checkout_started" || pack.paymentStatus === "paid"),
      String(pack.paymentStatus === "paid"),
      String(pack.generationStatus === "generated"),
      pack.qualityRubric.evidenceSupported,
      pack.generationStatus === "generation_failed" ? "generation_failed" : ""
    ])
  ];

  // Touch analytics so this route exercises the allowlisted event path without exposing raw private text.
  await repository.getAnalytics();

  const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": "attachment; filename=visible-merit-analytics.csv"
    }
  });
}
