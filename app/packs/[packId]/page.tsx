import { notFound } from "next/navigation";
import { RefreshCcw } from "lucide-react";
import { rewriteSection, selectRoleTargets } from "@/app/actions";
import { PackExportActions } from "@/components/PackExportActions";
import { PackOutlineNav } from "@/components/PackOutlineNav";
import { PackSectionActions } from "@/components/PackSectionActions";
import { VisibleMeritCheck } from "@/components/VisibleMeritCheck";
import { getRepository } from "@/lib/data/repository";
import { getArtifactMeta } from "@/lib/packs/artifacts";
import { getPrimaryLane } from "@/lib/packs/primary-lane";

export default async function PackPage({ params }: { params: Promise<{ packId: string }> }) {
  const { packId } = await params;
  const pack = await getRepository().getPack(packId);
  if (!pack) notFound();
  const warnings = pack.sections.flatMap((section) => section.evidenceWarnings);
  const primaryLane = getPrimaryLane(pack);
  const packTitle = `Visible Merit Story + Plan Pack${primaryLane ? ` - ${primaryLane.title}` : ""}`;
  const outlineItems = [
    { id: "role-lanes", title: "Role lanes", meta: "Direction" },
    ...pack.sections.map((section) => ({
      id: section.id,
      title: section.title,
      meta: section.accessLevel === "paid" ? "Artifact" : "Preview"
    }))
  ];

  return (
    <main className="page-shell pack-document-shell">
      <section className="page-intro compact">
        <p className="eyebrow">Full pack</p>
        <h1>Your Story + Plan Pack</h1>
        <p className="lead">
          A working document set for resumes, interviews, LinkedIn, and the next 30 days
          {primaryLane ? `, written first for ${primaryLane.title}.` : "."}
        </p>
        {primaryLane && (
          <div className="primary-lane-banner">
            <span>Primary lane</span>
            <strong>{primaryLane.title}</strong>
            <p>Use this as the anchor. Save other lanes for comparison, but keep this pack focused.</p>
          </div>
        )}
      </section>
      <div className="workspace-layout">
        <aside className="pack-sidebar no-print">
          <PackOutlineNav items={outlineItems} />
        </aside>

        <section className="workspace-panel">
          <div className="document-heading">
            <p className="eyebrow">Visible Merit document</p>
            <h2>{packTitle}</h2>
            <p>
              Use this as a working draft. Copy individual sections, export the whole pack, or strengthen sections that
              still need more evidence.
            </p>
          </div>

          <section className="proof-section" id="role-lanes">
            <span className="proof-label">Paid lane comparison</span>
            <h2>Save up to three role lanes</h2>
            <p className="section-content">
              Your full pack is written for {primaryLane?.title ?? "the primary lane"}. Saving additional lanes keeps the
              comparison visible while you decide where to focus next.
            </p>
            <form action={selectRoleTargets.bind(null, pack.id)} className="lane-compare-list">
              {pack.roleRecommendations.map((role) => (
                <label key={role.id} className={`lane-row ${pack.selectedRoleTargetIds.includes(role.id) ? "selected" : ""}`}>
                  <span className="lane-check">
                    <input
                      type="checkbox"
                      name="role"
                      value={role.id}
                      defaultChecked={pack.selectedRoleTargetIds.includes(role.id)}
                    />
                  </span>
                  <span className="lane-title">
                    <strong>{role.title}</strong>
                    <em>{role.lane}</em>
                  </span>
                  <div className="lane-detail">
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
              <button type="submit" className="secondary">Save lane comparison</button>
            </form>
          </section>

          {pack.sections.map((section, index) => {
            const artifact = getArtifactMeta(section);
            const copyText = [
              artifact.exportName,
              `Recommended use: ${artifact.use}`,
              section.before ? `Before: ${section.before}` : "",
              section.content,
              section.whyItWorks ? `Why it works: ${section.whyItWorks}` : ""
            ].filter(Boolean).join("\n\n");

            return (
              <article className="proof-section pack-artifact" id={section.id} key={section.id}>
                <header className="artifact-heading">
                  <div>
                    <span className="proof-label">{artifact.label}</span>
                    <h2>{section.title}</h2>
                    <p>{artifact.use}</p>
                  </div>
                  <span className="artifact-number">{String(index + 2).padStart(2, "0")}</span>
                </header>
                {section.before && (
                  <p className="section-before">
                    <strong>Before:</strong> {section.before}
                  </p>
                )}
                <p className="section-content">{section.content}</p>
                {section.whyItWorks && <p className="why section-why">Why it works: {section.whyItWorks}</p>}
                {section.evidenceWarnings.map((warning) => (
                  <div className="notice" key={warning.message}>{warning.message}</div>
                ))}
                <form action={rewriteSection.bind(null, pack.id, section.id)} className="action-bar artifact-actions no-print">
                  <PackSectionActions label="artifact" text={copyText} />
                  <button type="submit" className="ghost"><RefreshCcw size={16} /> Sounds too fake</button>
                </form>
              </article>
            );
          })}
          <PackExportActions
            email={pack.email}
            packTitle={packTitle}
            primaryLaneTitle={primaryLane?.title}
            sections={pack.sections}
          />
        </section>

        <div className="quality-sidebar no-print">
          <VisibleMeritCheck rubric={pack.qualityRubric} warnings={warnings} />
        </div>
      </div>
    </main>
  );
}
