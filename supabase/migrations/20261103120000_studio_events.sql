-- NJS Studio funnel events. No personal data: no names, emails, phones or raw IPs.
-- Written only by the event-intake edge function with the service role; RLS on, no policies,
-- so the public API keys can neither read nor write this table.

create table public.studio_events (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  event text not null check (event in (
    'page_view', 'picker_open', 'business_picked', 'plan_picked',
    'build_step', 'plan_seen', 'form_open', 'lead_sent', 'call_click'
  )),
  page text not null check (char_length(page) <= 200),
  sid text not null check (sid ~ '^[a-z0-9]{8,32}$'),
  business_type text check (char_length(business_type) <= 60),
  tier text check (char_length(tier) <= 30),
  detail text check (char_length(detail) <= 80),
  referrer_host text check (char_length(referrer_host) <= 120),
  utm_source text check (char_length(utm_source) <= 120),
  utm_campaign text check (char_length(utm_campaign) <= 120),
  device text check (device in ('phone', 'tablet', 'desktop')),
  ip_hash text not null
);

comment on table public.studio_events is
  'NJS Studio funnel events (no personal data). Written only by the event-intake edge function.';

alter table public.studio_events enable row level security;

create index studio_events_created_idx on public.studio_events (created_at desc);
create index studio_events_event_created_idx on public.studio_events (event, created_at desc);
create index studio_events_ip_created_idx on public.studio_events (ip_hash, created_at desc);
create index studio_events_sid_idx on public.studio_events (sid);

-- The one question Wave 3 needs answered: how many sessions reach each step this week.
create view public.studio_funnel_7d with (security_invoker = true) as
select event,
       count(*) as events,
       count(distinct sid) as sessions
from public.studio_events
where created_at > now() - interval '7 days'
group by event;

revoke all on public.studio_funnel_7d from anon, authenticated;
