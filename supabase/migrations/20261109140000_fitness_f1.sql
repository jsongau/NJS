-- Fitness F1 (2026-11-09): structured fields on each lead, and three fitness funnel events.
-- leads.meta holds only what the request form chose (discipline, goal, preferred times, entry point).
-- lead-intake allow-lists every key and value, so no free text lands here.
alter table public.leads add column if not exists meta jsonb not null default '{}'::jsonb;
alter table public.leads drop constraint if exists leads_meta_object_check;
alter table public.leads add constraint leads_meta_object_check check (jsonb_typeof(meta) = 'object');

alter table public.studio_events drop constraint if exists studio_events_event_check;
alter table public.studio_events add constraint studio_events_event_check check (event in (
  'page_view', 'picker_open', 'business_picked', 'plan_picked',
  'build_step', 'plan_seen', 'form_open', 'lead_sent', 'call_click',
  'mode_switch', 'goal_picked', 'fit_tab', 'fit_region', 'book_step'
));
