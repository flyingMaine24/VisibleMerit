import { notFound } from "next/navigation";
import { Copy, FileText, Mail, RefreshCcw } from "lucide-react";
import { rewriteSection } from "@/app/actions";
import { VisibleMeritCheck } from "@/components/VisibleMeritCheck";
import { getPack } from "@/lib/store";

export default async function PackPage({ params }: { params: Promise<{ packId: string }> }) {
  const { packId } = await params;
  const pack = getPack(packId);
  if (!pack) notFound();
  const warnings = pack.sections.flatMap((section) => section.evidenceWarnings);

  return (
    <main className="page-shell">
      <p className="eyebrow">Full pack</p>
      <h1>Your Story + Plan Pack</h1>
      <div className="workspace-layout" style={{ marginTop: 32 }}>
        <nav className="section-nav" aria-label="Pack sections">
          {pack.sections.map((section) => (
            <a key={section.id} href={`#${section.id}`}>{section.title}</a>
          ))}
        </nav>

        <section className="workspace-panel">
          {pack.sections.map((section) => (
            <article className="proof-section" id={section.id} key={section.id}>
              <span className="proof-label">{section.accessLevel}</span>
              <h2>{section.title}</h2>
              {section.before && (
                <p style={{ marginTop: 16 }}>
                  <strong>Before:</strong> {section.before}
                </p>
              )}
              <p style={{ marginTop: 16, whiteSpace: "pre-line" }}>{section.content}</p>
              {section.whyItWorks && <p className="why" style={{ marginTop: 16 }}>Why it works: {section.whyItWorks}</p>}
              {section.evidenceWarnings.map((warning) => (
                <div className="notice" key={warning.message}>{warning.message}</div>
              ))}
              <form action={rewriteSection.bind(null, pack.id, section.id)} className="action-bar">
                <button type="button" className="ghost"><Copy size={16} /> Copy</button>
                <button type="submit" className="ghost"><RefreshCcw size={16} /> Sounds too fake</button>
              </form>
            </article>
          ))}
          <div className="action-bar" style={{ padding: 24 }}>
            <button className="secondary"><FileText size={16} /> Export PDF</button>
            <button className="secondary"><Mail size={16} /> Email pack</button>
          </div>
        </section>

        <VisibleMeritCheck rubric={pack.qualityRubric} warnings={warnings} />
      </div>
    </main>
  );
}
