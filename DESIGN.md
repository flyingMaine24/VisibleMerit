# Visible Merit Design System

## Brand

Visible Merit helps frontline workers make real work visible. The product turns practical experience into credible career language, role paths, and work artifacts without exaggeration or generic AI polish.

Primary tagline:

> Make real work visible.

Core line:

> Hidden experience. Recognized merit.

Voice:

- Plain, respectful, direct.
- Credible before impressive.
- Specific before polished.
- Translate, do not exaggerate.
- Never promise job placement, coaching outcomes, or guaranteed qualification.

Avoid:

- "Unlock your potential"
- "Transform your career"
- "Leverage your professional journey"
- Generic AI productivity copy
- Corporate filler that makes frontline work sound fake

## Logo

Primary mark:

- Use the sharp-point V reveal mark as the primary logo.
- Use the full horizontal lockup for landing and authenticated app headers when space allows.
- Use the compact mark for app icon, mobile header, and tight navigation.

Utility mark:

- Use the one-color reversed mark on Deep Ink or Workwear Navy backgrounds.
- Do not use the rounded-point mark as the primary identity unless the brand direction changes.

## Color

Use these tokens as the foundation. Do not introduce purple, violet, blue-purple gradients, decorative blobs, or generic SaaS accent palettes.

```css
:root {
  --color-deep-ink: #0e1116;
  --color-workwear-navy: #16233a;
  --color-warm-off-white: #f6f6f2;
  --color-merit-gold: #c89b3c;
  --color-growth-green: #6e6b57;
  --color-steel-gray: #6b7280;
  --color-field: #ffffff;
  --color-line: #d8d1c4;
  --color-error: #9f2f2f;
  --color-warning: #b46a24;
  --color-success: #2f6b4f;
}
```

Usage:

- Deep Ink: primary text, dark surfaces, reversed logo backgrounds.
- Workwear Navy: headers, durable panels, high-emphasis surfaces.
- Warm Off-White: page background.
- Merit Gold: recognition, highlights, selected state accent, logo accent.
- Growth Green: progress, fit, constructive next steps.
- Steel Gray: secondary text and quiet metadata.
- Warning Amber: evidence warnings and "Needs detail" states.

Never rely on color alone to communicate warnings, completion, or quality state.

## Typography

Preferred pairing:

- Display: `Source Serif 4` or `Literata`.
- UI/body: `IBM Plex Sans` or `Atkinson Hyperlegible`.

Rules:

- No default `system-ui`, `-apple-system`, Inter, Roboto, or Arial as the primary brand type.
- Body text must be at least 16px.
- Letter spacing should be 0 for body copy. Use modest tracking only for small all-caps labels.
- Headings should be strong but restrained. This is a trust product, not a hype product.

## Layout

Spacing:

- Use an 8px base spacing scale.
- Prefer generous section spacing over decorative dividers.
- Group related controls tightly and separate unrelated areas clearly.

Radius:

- Use 6-8px radius for panels, form controls, and artifact surfaces.
- Avoid bubbly, oversized, uniform rounding on every element.

Surfaces:

- Cards are allowed only when the card is the interaction: role lane selectors, artifact sections, locked pack rows, or warnings attached to a section.
- Do not use decorative card grids as page structure.

## Core Components

### Proof Transformation

The proof transformation is the landing page's visual anchor.

Structure:

```text
Before
"I helped with daily ops and handled delays."

After
"Coordinated time-sensitive airport operations across ramp, gate, and supervisor teams to recover delays and keep service moving."

Why it works
Specific, plain, and tied to real operational work.
```

Rules:

- Show the before/after proof in the first viewport.
- Keep copy short enough to scan.
- Do not hide the proof below a generic hero or feature grid.

### Guided Intake

Use a five-step work interview:

1. Your work: current role, industry, normal day.
2. What you handle: problems solved, tools used, people communicated with.
3. Proof moments: escalations, training, improvements, metrics.
4. Where you want to go: roles, work to avoid, industries of interest.
5. Review answers: edit before preview generation.

Rules:

- One focused step per screen.
- Labels always visible. Never use placeholder-only labels.
- Include short examples under questions.
- Back action always available.
- Save progress after each step.
- Progress appears as direct text, such as `Step 2 of 5`.

### Role Lane Card

Role recommendations must show fit and gaps side by side.

```text
Operations Coordinator

Why this fits
- You handled handoffs and delay recovery.
- You worked across ramp, gate, and supervisor teams.

Likely gaps
- Excel/reporting experience may be needed.
- Corporate stakeholder communication examples would help.

[ ] Use this path
```

Rules:

- Show no more than 5 recommendations.
- User selects 1-3 role targets.
- User-entered roles are visually separate from system-suggested roles.
- Gaps use plain language. Do not make users feel disqualified.

### Visible Merit Check

Use a rubric, not a gamified score.

```text
Visible Merit Check

Plain language       Strong
Credible             Strong
Specific             Needs detail
Evidence supported   Good

Evidence warning:
Add one example of what changed after you improved the process.
```

Rules:

- No score rings.
- No "87/100" presentation.
- Do not grade the user. Evaluate the artifact.
- Use "Needs detail" instead of "bad" or "low."
- Attach evidence warnings to the exact section they affect.

### Transparent Locked Outline

The preview paywall must show what unlocks without fake blurred content.

```text
Your free preview includes
- 2 translated skills
- 1 before / after / why example
- 2 role lanes
- Visible Merit Check

Unlock the full Story + Plan Pack
[ ] Resume summary
[ ] 8-12 role-specific bullets
[ ] LinkedIn headline + About
[ ] Interview stories
[ ] Skills gap checklist
[ ] 30-day plan
[ ] PDF + email delivery

[ Unlock full pack - $29 ]
```

Rules:

- No blurred fake content.
- Show price before checkout.
- Keep the preview visible above the unlock section.
- Explain that the full pack uses the same answers and selected role targets.

### Document Workspace

The full pack output should feel like a document workspace, not a dashboard or card stack.

Desktop:

```text
[Section nav]  [Artifact document]              [Visible Merit Check]
Summary        Resume summary                   Plain language: Strong
Bullets        Resume bullets                    Credible: Strong
LinkedIn       Before / After / Why              Specific: Needs detail
Stories        Evidence warnings                 Evidence: Good
Plan           Copy / Rewrite / Export
```

Mobile:

```text
[Segmented section nav]
[Artifact section]
[Visible Merit Check drawer]
[Copy] [Rewrite] [Export]
```

Rules:

- Artifact content is the center of the experience.
- Quality and evidence context stays adjacent to the content.
- Copy, rewrite, export, and email controls use clear icon + label buttons.
- Old text remains visible while rewrite runs.

## Screens

### Landing

Hierarchy:

1. Visible Merit brand.
2. Promise: `Real work, clearly seen.`
3. Before/after proof transformation.
4. Primary CTA: `Start with your work`.
5. Secondary CTA: `View sample pack`.
6. Hint of sample pack content below the first viewport.

Desktop:

- Poster-like first viewport.
- Brand, proof transformation, CTA, and sample-pack hint visible together.

Mobile:

- Brand, promise, before/after proof, and primary CTA visible in the first screen on common mobile heights.
- Before/after/why panels stack vertically.

### Login

Use passwordless email OTP/magic link.

Copy:

- "Enter your email to save your pack and return later."
- "Use the same email next time to access your saved packs."

### Intake

Desktop:

- Two-column layout.
- Questions on the left.
- Context panel on the right: "What this helps us translate."

Mobile:

- One question group per screen.
- Sticky bottom actions: Back and Continue.

### Role Direction

Desktop:

- User-entered role ideas on the left.
- Recommended role lanes on the right.

Mobile:

- Stacked role cards.
- Sticky selected count: `2 of 3 selected`.

### Preview

Desktop:

- Preview artifact on the left.
- Visible Merit Check and locked full-pack outline on the right.

Mobile:

- Preview artifact first.
- Locked sections shown as a compact list.
- Checkout CTA becomes sticky after the user scrolls past the preview.

### Full Pack

Desktop:

- Left section navigation.
- Center artifact document.
- Right quality/evidence panel.

Mobile:

- Segmented section nav.
- One artifact section at a time.
- Visible Merit Check appears in a drawer or collapsible panel.

## Interaction States

Preview generating:

- "Reading your answers and finding the strongest proof in your work."
- Show compact progress panel and what happens next.

Preview failed:

- "We could not make a useful preview from these answers yet."
- Actions: Add more detail / Try again.

Full pack generating:

- "Your full Story + Plan Pack is being prepared."
- Show timeline, email reassurance, and no duplicate generation button.

Needs review:

- "We are checking this pack because one section did not meet the Visible Merit standard."
- Action: email notification when ready.

Rewrite in progress:

- Section-level loading only.
- Old text stays visible.

Rewrite rejected:

- "We kept your original because the rewrite was less clear."

No saved packs:

- "Start with one real work story."
- CTA: Create your first pack.

No role recommendations:

- "We need one more detail to suggest roles."
- CTA: Add detail about the work you want next.

No metrics:

- "No numbers? That is okay."
- CTA: Use rough estimates or describe what changed.

No paid sections yet:

- Show locked full-pack outline, price, and what unlocks.

No admin analytics:

- "No previews or purchases yet."
- CTA: Share sample pack / test the funnel.

## Responsive Model

Use dual-primary responsive design.

Mobile:

- Focused.
- One thing at a time.
- Sticky actions where they reduce anxiety or prevent lost progress.

Desktop:

- Comparative.
- More context visible at once.
- Lets users review, compare, and edit across related panels.

Do not treat mobile as a stacked copy of desktop. Do not treat desktop as a stretched mobile flow.

## Accessibility

Requirements:

- 44px minimum touch targets.
- Body text 16px minimum.
- Contrast ratio 4.5:1 minimum for body text.
- Focus states visible on Deep Ink and Warm Off-White.
- No placeholder-only labels.
- Warnings never rely on color alone.
- Screen reader labels for quality rubric states.
- Forms must be keyboard navigable.
- Error messages must be associated with fields.
- Buttons must describe action outcomes.

## Motion

Use motion sparingly:

- Before -> after translation reveal on landing/sample proof.
- Step transition during intake.
- Section-level rewrite swap.

Avoid:

- Decorative motion.
- Floating blobs.
- Long animations that slow form completion.
- Motion required to understand content.

## Banned Design Patterns

- Purple/violet/indigo gradients.
- Three-column feature grid as first impression.
- Icons in colored circles as decoration.
- Centered everything.
- Decorative blobs, floating circles, wavy dividers.
- Emoji as design elements.
- Colored left-border cards.
- Generic hero copy.
- Cookie-cutter rhythm: hero -> 3 features -> testimonials -> pricing -> CTA.
- Dashboard-style output made of stacked cards.
- Blurred fake locked content.

## Implementation Notes

- Create component primitives for artifact panels, role lane selectors, Visible Merit Check, evidence warnings, locked section outline, intake stepper, and document workspace.
- Keep product copy in plain language.
- Every page must pass a scan test: the user should understand what it is and what to do next from headings and primary actions alone.
- Run `/design-review` after implementation on the live app.
