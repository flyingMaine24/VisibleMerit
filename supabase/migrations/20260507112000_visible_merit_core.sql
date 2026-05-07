create extension if not exists pgcrypto;

create table if not exists public.packs (
  id text primary key,
  owner_id uuid references auth.users(id) on delete set null,
  user_id text not null,
  email text not null,
  payment_status text not null check (payment_status in ('free_preview', 'checkout_started', 'paid', 'refunded')),
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists packs_owner_id_idx on public.packs(owner_id);
create index if not exists packs_email_idx on public.packs(lower(email));
create index if not exists packs_payment_status_idx on public.packs(payment_status);
create index if not exists packs_updated_at_idx on public.packs(updated_at desc);

alter table public.packs enable row level security;

drop policy if exists "Users can read their own packs" on public.packs;
create policy "Users can read their own packs"
  on public.packs
  for select
  using (owner_id = auth.uid());

drop policy if exists "Users can update their own packs" on public.packs;
create policy "Users can update their own packs"
  on public.packs
  for update
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  pack_id text references public.packs(id) on delete set null,
  user_id text,
  event_name text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists analytics_events_pack_id_idx on public.analytics_events(pack_id);
create index if not exists analytics_events_event_name_idx on public.analytics_events(event_name);
create index if not exists analytics_events_created_at_idx on public.analytics_events(created_at desc);

alter table public.analytics_events enable row level security;

drop policy if exists "Users can read analytics for own packs" on public.analytics_events;
create policy "Users can read analytics for own packs"
  on public.analytics_events
  for select
  using (
    exists (
      select 1
      from public.packs
      where packs.id = analytics_events.pack_id
        and packs.owner_id = auth.uid()
    )
  );
