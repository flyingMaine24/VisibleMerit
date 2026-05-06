import { generateFullPack } from "@/lib/ai/generate";
import { getPack, savePack } from "@/lib/store";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const packId = typeof body.packId === "string" ? body.packId : "demo-pack";
  const pack = getPack(packId);

  if (!pack?.intake) {
    return Response.json({ error: "pack_not_found" }, { status: 404 });
  }

  const result = await generateFullPack(pack.intake);
  if (!result.ok) {
    savePack({
      ...pack,
      generationStatus: result.error === "quality_failed" ? "needs_review" : "generation_failed"
    });
    return Response.json({ generated: false, error: result.error }, { status: 422 });
  }

  savePack({
    ...pack,
    paymentStatus: "paid",
    generationMode: "full",
    generationStatus: "generated",
    sections: result.output.sections,
    roleRecommendations: result.output.roleRecommendations,
    qualityRubric: result.output.qualityRubric
  });

  return Response.json({ generated: true });
}
