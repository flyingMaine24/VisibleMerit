import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="page-shell">
      <section className="narrow form-panel">
        <p className="eyebrow">Account</p>
        <h1>Save your pack and return later.</h1>
        <p className="lead">
          Enter your email to continue. In production, Visible Merit sends a magic link. Locally, this demo flow uses
          your email on the intake form.
        </p>
        <form className="field-stack">
          <label>
            Email
            <span>Use the same email next time to access saved packs.</span>
            <input type="email" name="email" placeholder="you@example.com" />
          </label>
          <Link className="button" href="/intake">Continue to intake</Link>
        </form>
      </section>
    </main>
  );
}
