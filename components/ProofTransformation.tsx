export function ProofTransformation() {
  return (
    <section className="proof-panel" aria-label="Before and after translation example">
      <div className="proof-section">
        <span className="proof-label">Before</span>
        <p className="proof-before">“I helped with daily ops and handled delays.”</p>
      </div>
      <div className="proof-section">
        <span className="proof-label">After</span>
        <p className="proof-after">
          “Coordinated time-sensitive airport operations across ramp, gate, and supervisor teams to recover delays and
          keep service moving.”
        </p>
      </div>
      <div className="proof-section">
        <span className="proof-label">Why it works</span>
        <p className="why">Specific, plain, and tied to real operational work.</p>
      </div>
    </section>
  );
}
