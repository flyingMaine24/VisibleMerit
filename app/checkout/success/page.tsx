import Link from "next/link";
import { generatePaidPack } from "@/app/actions";
import { getPack } from "@/lib/store";
import { getUserVisibleStatus } from "@/lib/packs/status";
import { getPrimaryLane } from "@/lib/packs/primary-lane";

export default async function CheckoutSuccessPage({ searchParams }: { searchParams: Promise<{ packId?: string }> }) {
  const { packId: requestedPackId } = await searchParams;
  const packId = requestedPackId ?? "demo-pack";
  const pack = getPack(packId);
  const primaryLane = pack ? getPrimaryLane(pack) : undefined;

  return (
    <main className="page-shell">
      <section className="narrow form-panel">
        <p className="eyebrow">Checkout</p>
        <h1>{pack ? getUserVisibleStatus(pack.generationStatus) : "Payment received."}</h1>
        <p className="lead">
          In production, Stripe confirms payment through a signed webhook and Vercel Queues prepares the full pack. In
          local mode, use the button below to simulate the paid generation path.
        </p>
        {primaryLane && (
          <div className="primary-lane-banner compact">
            <span>Primary lane</span>
            <strong>{primaryLane.title}</strong>
            <p>We will build this full pack around your selected lane and proof points.</p>
          </div>
        )}
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
