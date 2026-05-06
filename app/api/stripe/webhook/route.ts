import { getPack, savePack } from "@/lib/store";
import { transitionPackStatus } from "@/lib/packs/status";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (process.env.STRIPE_WEBHOOK_SECRET && !signature) {
    return Response.json({ error: "missing_signature" }, { status: 400 });
  }

  const payload = rawBody ? JSON.parse(rawBody) : {};
  const packId = payload?.data?.object?.metadata?.packId;
  const pack = typeof packId === "string" ? getPack(packId) : undefined;

  if (!pack) {
    return Response.json({ received: true, ignored: "pack_not_found" });
  }

  if (pack.paymentStatus === "paid") {
    return Response.json({ received: true, duplicate: true });
  }

  savePack({
    ...pack,
    paymentStatus: "paid",
    generationStatus: transitionPackStatus(pack.generationStatus, "mark_paid")
  });

  return Response.json({ received: true });
}
