import { submitIntake } from "@/app/actions";

export default function IntakePage() {
  return (
    <main className="page-shell">
      <div className="intake-layout">
        <form action={submitIntake} className="form-panel">
          <p className="eyebrow">Step 1 of 5</p>
          <h1>Your work interview.</h1>
          <p className="lead">Answer in plain language. Visible Merit translates only what your answers can support.</p>

          <div className="field-stack">
            <label>
              Email
              <span>Used to save your pack and return later.</span>
              <input name="email" type="email" required defaultValue="demo@visiblemerit.local" />
            </label>
            <label>
              Current or most recent role
              <span>Example: Ramp agent, gate agent, reservations agent, warehouse associate.</span>
              <input name="currentRole" required defaultValue="Ramp agent" />
            </label>
            <label>
              Industry
              <span>Where did the work happen?</span>
              <input name="industry" required defaultValue="airport operations" />
            </label>
            <label>
              What does a normal day look like?
              <span>Keep it practical. What do you actually do?</span>
              <textarea name="normalDay" required defaultValue="Loaded bags, supported turnarounds, helped recover delays, and coordinated with gate agents." />
            </label>
            <label>
              What problems do you solve most often?
              <textarea name="problemsSolved" required defaultValue="Delay recovery, baggage issues, handoffs, and keeping aircraft turns moving." />
            </label>
            <label>
              What tools or systems do you use?
              <textarea name="toolsUsed" defaultValue="Radio, baggage systems, handheld scanners, airline operations tools" />
            </label>
            <label>
              Who do you communicate with?
              <textarea name="communicatesWith" required defaultValue="Ramp agents, gate agents, supervisors, operations control" />
            </label>
            <label>
              Proof moment
              <span>Training, escalation, process improvement, metric, or moment you are proud of.</span>
              <textarea name="proofMoment" required defaultValue="Trained new agents and helped organize work during repeated delay recovery periods." />
            </label>
            <label>
              Roles you are curious about
              <span>Comma-separated is fine. You can also say “not sure.”</span>
              <input name="targetRoles" defaultValue="Operations Coordinator, Product Operations Associate" />
            </label>
            <label>
              What kind of work do you want to avoid?
              <textarea name="avoidWork" defaultValue="I do not want another role that is only physical labor." />
            </label>
          </div>

          <div className="sticky-mobile-actions cta-row">
            <button type="submit">Generate free preview</button>
          </div>
        </form>

        <aside className="context-panel">
          <h3>What this helps us translate</h3>
          <p>
            These answers identify the proof inside your work: decisions, handoffs, tools, pressure, training, service
            recovery, and the roles that may fit next.
          </p>
          <ul>
            <li>Plain language in.</li>
            <li>Credible career language out.</li>
            <li>No inflated claims.</li>
          </ul>
        </aside>
      </div>
    </main>
  );
}
