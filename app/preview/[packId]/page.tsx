import Link from "next/link";
import { addProofDetail, startCheckout, selectRoleTargets } from "@/app/actions";
import { AddProofDetailForm } from "@/components/AddProofDetailForm";
import { VisibleMeritCheck } from "@/components/VisibleMeritCheck";
import { getRepository } from "@/lib/data/repository";
import { getPrimaryLane } from "@/lib/packs/primary-lane";

export default async function PreviewPage({ params }: { params: Promise<{ packId: string }> }) {
  const { packId } = await params;
  const pack = await getRepository().getPack(packId);
  if (!pack) {
    return (
      <main className="page-shell">
        <section className="narrow form-panel">
          <p className="eyebrow">Preview unavailable</p>
          <h1>This local preview is no longer available.</h1>
          <p className="lead">
            Local demo packs can expire when the development server reloads. Start the work interview again to generate
            a fresh preview.
          </p>
          <div className="cta-row">
            <Link className="button" href="/intake">Return to intake</Link>
            <Link className="button secondary" href="/preview/demo-pack">Open sample pack</Link>
          </div>
        </section>
      </main>
    );
  }
  const warnings = pack.sections.flatMap((section) => section.evidenceWarnings);
  const snapshot = pack.workIdentitySnapshot;
  const primaryLane = getPrimaryLane(pack);

  return (
    <main className="page-shell">
      <section className="page-intro compact">
        <p className="eyebrow">Free preview</p>
        <h1>Your work is already saying more.</h1>
        <p className="lead">Review the supported translation, choose one primary lane, then unlock the full pack when the direction is right.</p>
        {primaryLane && (
          <div className="primary-lane-banner">
            <span>Primary lane</span>
            <strong>{primaryLane.title}</strong>
            <p>Your full pack will be written for this lane first.</p>
          </div>
        )}
      </section>
      <div className="preview-layout">
        <section className="artifact-panel preview-stack">
          <section className="preview-verdict">
            <p className="eyebrow">Your best next move</p>
            <h2>{primaryLane ? `Build around ${primaryLane.title}.` : "Choose a primary lane."}</h2>
            <p>
              {primaryLane
                ? `This lane fits because your answers show ${primaryLane.whyItFits.join(" ")}`
                : "Pick the lane that feels closest to the work you want more of."}
            </p>
            <div className="verdict-actions">
              <form action={startCheckout.bind(null, pack.id)}>
                <button type="submit">Unlock full pack - $29</button>
              </form>
              <form action={selectRoleTargets.bind(null, pack.id)}>
                {primaryLane && <input type="hidden" name="role" value={primaryLane.id} />}
                <button className="secondary" type="submit">Save this lane</button>
              </form>
              <AddProofDetailForm action={addProofDetail.bind(null, pack.id)} />
            </div>
          </section>

          {pack.sections.map((section) => (
            <article key={section.id} className="proof-panel">
              {section.before && (
                <div className="proof-section">
                  <span className="proof-label">Before</span>
                  <p>{section.before}</p>
                </div>
              )}
              <div className="proof-section">
                <span className="proof-label">After</span>
                <p className="proof-after">{section.content}</p>
              </div>
              {section.whyItWorks && (
                <div className="proof-section">
                  <span className="proof-label">Why it works</span>
                  <p className="why">{section.whyItWorks}</p>
                </div>
              )}
            </article>
          ))}

          {snapshot && (
            <section className="identity-snapshot" aria-labelledby="identity-snapshot-title">
              <div>
                <p className="eyebrow">Work identity snapshot</p>
                <h2 id="identity-snapshot-title">{snapshot.headline}</h2>
              </div>
              <div className="strength-list" aria-label="Recognized work patterns">
                {snapshot.strengths.map((strength) => (
                  <span key={strength}>{strength}</span>
                ))}
              </div>
              <details className="proof-confidence-details">
                <summary>View proof confidence</summary>
                <div className="proof-confidence">
                <section>
                  <h3>Strong evidence</h3>
                  <ul>{snapshot.proofConfidence.strongEvidence.map((item) => <li key={item}>{item}</li>)}</ul>
                </section>
                <section>
                  <h3>Needs more detail</h3>
                  <ul>{snapshot.proofConfidence.needsMoreDetail.map((item) => <li key={item}>{item}</li>)}</ul>
                </section>
                <section>
                  <h3>Safe to use now</h3>
                  <ul>{snapshot.proofConfidence.safeToUseNow.map((item) => <li key={item}>{item}</li>)}</ul>
                </section>
                </div>
              </details>
            </section>
          )}

          <section className="role-targets">
            <h2>Choose one primary lane</h2>
            <p className="section-content">
              {snapshot?.laneBridge ?? "The free preview keeps one lane focused. After unlocking, you can compare and save up to three lanes."}
            </p>
            <form action={selectRoleTargets.bind(null, pack.id)} className="role-list">
              {pack.roleRecommendations.map((role) => (
                <label key={role.id} className={`role-card ${pack.selectedRoleTargetIds.includes(role.id) ? "selected" : ""}`}>
                  <span>
                    <input
                      type="radio"
                      name="role"
                      value={role.id}
                      defaultChecked={pack.selectedRoleTargetIds.includes(role.id)}
                    />{" "}
                    {role.title}
                  </span>
                  <span>{role.lane}</span>
                  <div className="fit-gap">
                    <div>
                      <strong>Why this fits</strong>
                      <ul>{role.whyItFits.map((item) => <li key={item}>{item}</li>)}</ul>
                    </div>
                    <div>
                      <strong>Likely gaps</strong>
                      <ul>{role.likelyGaps.map((item) => <li key={item}>{item}</li>)}</ul>
                    </div>
                  </div>
                </label>
              ))}
              <button type="submit" className="secondary">Save role targets</button>
            </form>
          </section>
        </section>

        <aside>
          <VisibleMeritCheck rubric={pack.qualityRubric} warnings={warnings} />
          <section className="artifact-panel unlock-panel">
            <h3>Unlock the full Story + Plan Pack</h3>
            <p>
              $29 unlocks one primary lane pack and lets you compare up to three saved lanes. Separate lane-specific
              rewrites can become an add-on later.
            </p>
            {primaryLane && (
              <div className="notice success">
                Full pack anchor: <strong>{primaryLane.title}</strong>
              </div>
            )}
            <div className="locked-outline">
              {["Account login before checkout", "Resume summary for primary lane", "8-12 role-specific bullets", "LinkedIn headline + About", "Interview stories", "Skills gap checklist", "30-day plan", "PDF + email delivery"].map((item) => (
                <div className="locked-row" key={item}><span aria-hidden="true" />{item}</div>
              ))}
            </div>
            <form action={startCheckout.bind(null, pack.id)} className="cta-row">
              <button type="submit">Unlock full pack - $29</button>
            </form>
          </section>
        </aside>
      </div>
    </main>
  );
}
