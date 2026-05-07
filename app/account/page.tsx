import Link from "next/link";
import { getRepository } from "@/lib/data/repository";
import { getPrimaryLane } from "@/lib/packs/primary-lane";

export default async function AccountPage() {
  const packs = await getRepository().listPacks();

  return (
    <main className="page-shell">
      <section className="page-intro compact">
        <p className="eyebrow">Account</p>
        <h1>Your saved packs.</h1>
        <p className="lead">Local V1 saves previews and full packs so you can return to the same work direction.</p>
      </section>

      <section className="account-list" aria-label="Saved packs">
        {packs.length === 0 ? (
          <div className="form-panel">
            <h2>No saved packs yet.</h2>
            <p className="section-content">Start the work interview to create your first Visible Merit preview.</p>
            <Link className="button" href="/intake">Start intake</Link>
          </div>
        ) : (
          packs.map((pack) => {
            const primaryLane = getPrimaryLane(pack);
            const href = pack.generationMode === "full" || pack.generationStatus === "generated" ? `/packs/${pack.id}` : `/preview/${pack.id}`;

            return (
              <article className="account-pack" key={pack.id}>
                <div>
                  <span className="proof-label">{pack.paymentStatus === "paid" ? "Full pack" : "Free preview"}</span>
                  <h2>{primaryLane?.title ?? "Role lane pending"}</h2>
                  <p>{pack.email}</p>
                </div>
                <dl>
                  <div>
                    <dt>Status</dt>
                    <dd>{pack.generationStatus.replaceAll("_", " ")}</dd>
                  </div>
                  <div>
                    <dt>Updated</dt>
                    <dd>{new Date(pack.updatedAt).toLocaleDateString()}</dd>
                  </div>
                </dl>
                <div className="cta-row">
                  <Link className="button" href={href}>Open</Link>
                  <Link className="button secondary" href={`/preview/${pack.id}`}>Preview</Link>
                </div>
              </article>
            );
          })
        )}
      </section>
    </main>
  );
}
