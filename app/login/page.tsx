import Link from "next/link";
import { continueAfterLogin } from "@/app/actions";
import { getPrimaryLane } from "@/lib/packs/primary-lane";
import { getPack } from "@/lib/store";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ packId?: string; next?: string }> }) {
  const { packId = "demo-pack", next = "intake" } = await searchParams;
  const pack = getPack(packId);
  const primaryLane = pack ? getPrimaryLane(pack) : undefined;
  const loginAction = continueAfterLogin.bind(null, packId, next);

  return (
    <main className="page-shell">
      <section className="narrow form-panel">
        <p className="eyebrow">Account</p>
        <h1>
          {next === "checkout"
            ? "Create your account before checkout."
            : next === "preview"
              ? "Sign in to save this role lane."
              : "Save your pack and return later."}
        </h1>
        <p className="lead">
          {next === "checkout"
            ? "Visible Merit saves the preview before payment so the full pack is tied to your email."
            : next === "preview"
              ? "Visible Merit saves your selected lane so you can return to the same preview later."
            : "Enter your email to continue. In production, Visible Merit sends a magic link."}
        </p>
        {primaryLane && next === "checkout" && (
          <div className="primary-lane-banner compact">
            <span>Primary lane</span>
            <strong>{primaryLane.title}</strong>
            <p>This is the lane your paid pack will be written around.</p>
          </div>
        )}
        <form action={loginAction} className="field-stack">
          <label>
            Email
            <span>Use the same email next time to access saved packs.</span>
            <input type="email" name="email" placeholder="you@example.com" defaultValue={pack?.email} required />
          </label>
          <div className="cta-row">
            <button type="submit">
              {next === "checkout" ? "Continue to checkout" : next === "preview" ? "Save and return to preview" : "Continue"}
            </button>
            <Link className="button secondary" href={pack ? `/preview/${pack.id}` : "/intake"}>
              Back
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}
