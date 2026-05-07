import { submitIntake } from "@/app/actions";
import { IntakeWizard } from "@/components/IntakeWizard";

export default function IntakePage() {
  return (
    <main className="page-shell">
      <section className="page-intro">
        <p className="eyebrow">Work interview</p>
        <h1>Tell the truth in plain language.</h1>
        <p className="lead">Visible Merit turns supported answers into role-ready proof. Unsupported claims stay out.</p>
      </section>
      <div className="intake-layout">
        <IntakeWizard action={submitIntake} />

        <aside className="context-panel">
          <span className="context-kicker">What gets extracted</span>
          <h3>Decisions, handoffs, pressure, tools, and proof.</h3>
          <p>
            The output is only as strong as the evidence in the intake. Short, concrete examples are better than polished
            claims.
          </p>
          <div className="context-rules">
            <span>Plain language in</span>
            <span>Career language out</span>
            <span>No inflated claims</span>
          </div>
        </aside>
      </div>
    </main>
  );
}
