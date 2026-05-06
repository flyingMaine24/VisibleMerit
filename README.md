# Visible Merit

Visible Merit makes real work visible. It helps frontline workers turn practical experience into credible career language, role paths, and work artifacts without generic AI polish.

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

The app currently runs with a local in-memory store and mock-safe generation so the UX can be exercised before Supabase, Stripe, OpenAI, Resend, and Vercel Queues are configured.

## Quality Gates

```bash
npm test
npm run typecheck
npm run build
npm audit --audit-level=moderate
```

## Core Flow

```text
Landing -> Login -> Intake -> Role Direction -> Free Preview -> Checkout -> Full Pack -> Rewrite/PDF/Email
```

## Integration Notes

- Supabase Auth should use email OTP/magic link.
- Supabase tables must use Row Level Security and `auth.uid()` ownership policies.
- Stripe webhooks must verify signatures and process paid unlocks idempotently.
- Vercel Queues should own paid full-pack generation.
- OpenAI output must pass the typed schema and Visible Merit editorial checks before rendering.
- Analytics events must use allowlisted metadata only, with no raw intake answers or generated career text.

## Design

Read `DESIGN.md` before making UI changes. It is the source of truth for Visible Merit’s visual language, interaction states, responsive behavior, accessibility rules, and banned AI-slop patterns.
