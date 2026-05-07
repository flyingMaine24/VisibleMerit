import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProofTransformation } from "@/components/ProofTransformation";

export default function HomePage() {
  const workflow = [
    ["01", "Answer the work interview", "Role, pressure, systems, handoffs, proof moments, and the work you want next."],
    ["02", "Review the free proof sample", "A short translation, role lanes, and a Visible Merit Check before payment."],
    ["03", "Unlock the working pack", "Resume language, LinkedIn copy, interview stories, role gaps, and a 30-day plan."]
  ];

  const proofNotes = [
    "Names the work without inflating it",
    "Separates evidence from assumption",
    "Shows fit and likely gaps by role lane",
    "Keeps language usable in real hiring conversations"
  ];

  return (
    <main>
      <section className="page-shell hero">
        <div className="hero-copy">
          <p className="eyebrow">Hidden experience. Recognized merit.</p>
          <h1>Visible Merit</h1>
          <p className="lead">
            Translate frontline work into credible career proof for the roles you are actually trying to reach.
          </p>
          <div className="cta-row">
            <Link className="button" href="/intake">
              Start the work interview <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link className="button secondary" href="/preview/demo-pack">Open sample pack</Link>
          </div>
          <div className="hero-proof-strip" aria-label="Visible Merit principles">
            {proofNotes.map((note) => (
              <span key={note}>{note}</span>
            ))}
          </div>
        </div>
        <div className="hero-evidence">
          <ProofTransformation />
          <div className="mini-rubric" aria-label="Visible Merit check summary">
            <span>Visible Merit Check</span>
            <strong>Plain. Specific. Supported.</strong>
          </div>
        </div>
      </section>

      <section className="band process-band">
        <div className="narrow">
          <div className="section-heading">
            <p className="eyebrow">Make real work visible.</p>
            <h2>Built like an evidence review, not a resume prompt.</h2>
          </div>
          <div className="process-list">
            {workflow.map(([step, title, body]) => (
              <article className="process-row" key={step}>
                <span>{step}</span>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
