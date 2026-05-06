-- Visible Merit MVP schema draft.
-- Apply in Supabase SQL editor or through a migration tool before enabling production integrations.

create type payment_status as enum ('free_preview', 'checkout_started', 'paid', 'refunded');
create type generation_status as enum (
  'draft',
  'intake_started',
  'intake_complete',
  'role_recommendations_ready',
  'preview_generated',
  'checkout_started',
  'paid',
  'generating',
  'generated',
  'generation_failed',
  'needs_review'
);
create type generation_mode as enum ('preview', 'full');
create type section_access_level as enum ('preview', 'paid');
create type rewrite_status as enum ('requested', 'completed', 'rejected', 'failed');

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  frontline_category text,
  current_role text,
  industry text,
  goal text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table packs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  payment_status payment_status not null default 'free_preview',
  generation_status generation_status not null default 'draft',
  generation_mode generation_mode not null default 'preview',
  quality_score jsonb not null default '{}'::jsonb,
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text unique,
  preview_generation_count integer not null default 0 check (preview_generation_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table intake_responses (
  id uuid primary key default gen_random_uuid(),
  pack_id uuid not null references packs(id) on delete cascade,
  answers jsonb not null,
  created_at timestamptz not null default now()
);

create table role_preferences (
  id uuid primary key default gen_random_uuid(),
  pack_id uuid not null references packs(id) on delete cascade,
  raw_intent text not null,
  target_role_ideas text[] not null default '{}',
  work_to_avoid text,
  created_at timestamptz not null default now()
);

create table role_recommendations (
  id uuid primary key default gen_random_uuid(),
  pack_id uuid not null references packs(id) on delete cascade,
  title text not null,
  lane text not null,
  confidence text not null check (confidence in ('strong', 'good', 'needs_detail')),
  why_it_fits text[] not null default '{}',
  likely_gaps text[] not null default '{}',
  evidence_refs text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table selected_role_targets (
  id uuid primary key default gen_random_uuid(),
  pack_id uuid not null references packs(id) on delete cascade,
  role_recommendation_id uuid references role_recommendations(id) on delete set null,
  role_title text not null,
  created_at timestamptz not null default now()
);

create unique index selected_role_targets_max_guard on selected_role_targets (pack_id, role_title);

create table pack_sections (
  id uuid primary key default gen_random_uuid(),
  pack_id uuid not null references packs(id) on delete cascade,
  section_type text not null,
  title text not null,
  content text not null,
  access_level section_access_level not null,
  before_text text,
  why_it_works text,
  evidence_warnings jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table rewrite_events (
  id uuid primary key default gen_random_uuid(),
  pack_section_id uuid not null references pack_sections(id) on delete cascade,
  status rewrite_status not null default 'requested',
  reason text not null,
  previous_quality_score jsonb,
  new_quality_score jsonb,
  created_at timestamptz not null default now()
);

create table analytics_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete set null,
  pack_id uuid references packs(id) on delete set null,
  event_name text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;
alter table packs enable row level security;
alter table intake_responses enable row level security;
alter table role_preferences enable row level security;
alter table role_recommendations enable row level security;
alter table selected_role_targets enable row level security;
alter table pack_sections enable row level security;
alter table rewrite_events enable row level security;
alter table analytics_events enable row level security;

create policy "profiles are self-owned" on profiles for all using (id = auth.uid()) with check (id = auth.uid());
create policy "packs are self-owned" on packs for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "intake follows pack ownership" on intake_responses
  for all using (exists (select 1 from packs where packs.id = intake_responses.pack_id and packs.user_id = auth.uid()))
  with check (exists (select 1 from packs where packs.id = intake_responses.pack_id and packs.user_id = auth.uid()));

create policy "role preferences follow pack ownership" on role_preferences
  for all using (exists (select 1 from packs where packs.id = role_preferences.pack_id and packs.user_id = auth.uid()))
  with check (exists (select 1 from packs where packs.id = role_preferences.pack_id and packs.user_id = auth.uid()));

create policy "role recommendations follow pack ownership" on role_recommendations
  for all using (exists (select 1 from packs where packs.id = role_recommendations.pack_id and packs.user_id = auth.uid()))
  with check (exists (select 1 from packs where packs.id = role_recommendations.pack_id and packs.user_id = auth.uid()));

create policy "selected targets follow pack ownership" on selected_role_targets
  for all using (exists (select 1 from packs where packs.id = selected_role_targets.pack_id and packs.user_id = auth.uid()))
  with check (exists (select 1 from packs where packs.id = selected_role_targets.pack_id and packs.user_id = auth.uid()));

create policy "pack sections follow pack ownership" on pack_sections
  for all using (exists (select 1 from packs where packs.id = pack_sections.pack_id and packs.user_id = auth.uid()))
  with check (exists (select 1 from packs where packs.id = pack_sections.pack_id and packs.user_id = auth.uid()));

create policy "rewrite events follow section ownership" on rewrite_events
  for all using (
    exists (
      select 1
      from pack_sections
      join packs on packs.id = pack_sections.pack_id
      where pack_sections.id = rewrite_events.pack_section_id and packs.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from pack_sections
      join packs on packs.id = pack_sections.pack_id
      where pack_sections.id = rewrite_events.pack_section_id and packs.user_id = auth.uid()
    )
  );

create policy "analytics are insert-only for owners" on analytics_events
  for insert with check (user_id = auth.uid() or user_id is null);
