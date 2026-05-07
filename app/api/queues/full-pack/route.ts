import { generateQueuedFullPack } from "@/lib/packs/workflows";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const packId = typeof body.packId === "string" ? body.packId : "demo-pack";
  const result = await generateQueuedFullPack(packId);
  if (!result.ok && result.reason === "intake_missing") {
    return Response.json({ error: "pack_not_found" }, { status: 404 });
  }
  if (!result.ok) return Response.json({ generated: false, error: result.reason }, { status: 422 });

  return Response.json({ generated: true });
}
