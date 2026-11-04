-- Fitness mode: tag each event with the side of the site it came from, and two new events.
alter table public.studio_events add column if not exists mode text check (mode in ('business', 'fitness'));
alter table public.studio_events drop constraint if exists studio_events_event_check;
alter table public.studio_events add constraint studio_events_event_check check (event in (
  'page_view', 'picker_open', 'business_picked', 'plan_picked',
  'build_step', 'plan_seen', 'form_open', 'lead_sent', 'call_click',
  'mode_switch', 'goal_picked'
));
create index if not exists studio_events_mode_created_idx on public.studio_events (mode, created_at desc);
