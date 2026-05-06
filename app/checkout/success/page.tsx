import Link from "next/link";
import { generatePaidPack } from "@/app/actions";
import { getPack } from "@/lib/store";
import { getUserVisibleStatus } from "@/lib/packs/status";

export default async function CheckoutSuccessPage({ searchParams }: { searchParams: Promise<{ packId?: string }> }) {
  const { packId: requestedPackId } = await searchParams;
  const packId = requestedPackId ?? "demo-pack";
  const pack = getPack(packId);

  return (
    <main className="page-shell">
      <section className="narrow form-panel">
        <p className="eyebrow">Checkout</p>
        <h1>{pack ? getUserVisibleStatus(pack.generationStatus) : "Payment received."}</h1>
        <p className="lead">
          In production, Stripe confirms payment through a signed webhook and Vercel Queues prepares the full pack. In
          local mode, use the button below to simulate the paid generation path.
        </p>
        <div className="notice success">
          Your preview is preserved. Refreshing this page will not create a duplicate pack.
        </div>
        <form action={generatePaidPack.bind(null, packId)} className="cta-row">
          <button type="submit">Prepare full pack</button>
          <Link className="button secondary" href={`/preview/${packId}`}>Back to preview</Link>
        </form>
      </section>
    </main>
  );
}
