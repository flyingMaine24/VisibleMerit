import { markPackPaidFromWebhook } from "@/lib/packs/workflows";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (process.env.STRIPE_WEBHOOK_SECRET && !signature) {
    return Response.json({ error: "missing_signature" }, { status: 400 });
  }

  const payload = rawBody ? JSON.parse(rawBody) : {};
  const packId = payload?.data?.object?.metadata?.packId;
  const result = typeof packId === "string" ? await markPackPaidFromWebhook(packId) : undefined;
  if (!result?.ok) {
    return Response.json({ received: true, ignored: "pack_not_found" });
  }

  if (result.value.duplicate) {
    return Response.json({ received: true, duplicate: true });
  }

  return Response.json({ received: true });
}
