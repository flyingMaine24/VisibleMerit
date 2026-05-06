import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { ProofTransformation } from "@/components/ProofTransformation";

export default function HomePage() {
  return (
    <main>
      <section className="page-shell hero">
        <div>
          <p className="eyebrow">Visible Merit</p>
          <h1>Real work, clearly seen.</h1>
          <p className="lead">
            Turn frontline experience into credible career language you can use for corporate, leadership, and better-fit
            opportunities.
          </p>
          <div className="cta-row">
            <Link className="button" href="/intake">
              Start with your work <ArrowRight size={18} />
            </Link>
            <Link className="button secondary" href="/preview/demo-pack">View sample pack</Link>
          </div>
        </div>
        <ProofTransformation />
      </section>

      <section className="band">
        <div className="narrow">
          <p className="eyebrow">Hidden experience. Recognized merit.</p>
          <h2>A pack built around what you actually did.</h2>
          <div className="sample-grid">
            <article className="artifact-panel">
              <CheckCircle2 aria-hidden="true" />
              <h3>Free mini artifact</h3>
              <p>See two translated skills, role lanes, and a Visible Merit Check before paying.</p>
            </article>
            <article className="artifact-panel">
              <CheckCircle2 aria-hidden="true" />
              <h3>Story + Plan Pack</h3>
              <p>Unlock resume language, LinkedIn copy, interview stories, role gaps, and a 30-day plan.</p>
            </article>
            <article className="artifact-panel">
              <CheckCircle2 aria-hidden="true" />
              <h3>No fake polish</h3>
              <p>Evidence warnings and plain-language checks keep the output credible and defensible.</p>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}
