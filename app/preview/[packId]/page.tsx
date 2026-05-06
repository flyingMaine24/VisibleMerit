import { notFound } from "next/navigation";
import { startCheckout, selectRoleTargets } from "@/app/actions";
import { VisibleMeritCheck } from "@/components/VisibleMeritCheck";
import { getPack } from "@/lib/store";

export default async function PreviewPage({ params }: { params: Promise<{ packId: string }> }) {
  const { packId } = await params;
  const pack = getPack(packId);
  if (!pack) notFound();
  const warnings = pack.sections.flatMap((section) => section.evidenceWarnings);

  return (
    <main className="page-shell">
      <div className="preview-layout">
        <section className="artifact-panel">
          <p className="eyebrow">Free preview</p>
          <h1>Your work is already saying more.</h1>
          {pack.sections.map((section) => (
            <article key={section.id} className="proof-panel" style={{ marginTop: 24 }}>
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

          <section style={{ marginTop: 32 }}>
            <h2>Choose 1-3 role lanes</h2>
            <form action={selectRoleTargets.bind(null, pack.id)} className="role-list" style={{ marginTop: 16 }}>
              {pack.roleRecommendations.map((role) => (
                <label key={role.id} className={`role-card ${pack.selectedRoleTargetIds.includes(role.id) ? "selected" : ""}`}>
                  <span>
                    <input
                      type="checkbox"
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
          <section className="artifact-panel" style={{ marginTop: 24 }}>
            <h3>Unlock the full Story + Plan Pack</h3>
            <p>Your full pack uses the same answers and selected role targets.</p>
            <div className="locked-outline">
              {["Resume summary", "8-12 role-specific bullets", "LinkedIn headline + About", "Interview stories", "Skills gap checklist", "30-day plan", "PDF + email delivery"].map((item) => (
                <div className="locked-row" key={item}>□ {item}</div>
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
