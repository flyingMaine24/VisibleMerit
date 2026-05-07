# Visible Merit

Visible Merit makes real work visible. It helps frontline workers turn practical experience into credible career language, role paths, and work artifacts without generic AI polish.

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

The app defaults to a local file-backed store at `.visible-merit/local-store.json` and mock-safe generation so the UX can be exercised before Stripe, OpenAI, Resend, and Vercel Queues are configured.

Copy `.env.example` to `.env.local` for local configuration.

## Persistence

Visible Merit uses a repository boundary in `lib/data/repository.ts`.

- Local development uses `lib/store.ts`.
- Production can use `SupabaseRepository` by setting `VISIBLE_MERIT_REPOSITORY=supabase`, `SUPABASE_URL`, and `SUPABASE_SERVICE_ROLE_KEY`.
- Apply `supabase/migrations/20260507112000_visible_merit_core.sql` before enabling the Supabase repository.

The Supabase adapter is used from server-side routes/actions and stores packs as typed JSON documents with indexed top-level fields for ownership, email, payment status, and timestamps. This keeps V1 flexible while preserving a clean path to normalized tables when usage patterns are clearer.

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
