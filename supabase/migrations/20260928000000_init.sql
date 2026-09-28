-- Feedbackbox — initial schema
--
-- Security model
--   * Every table has Row Level Security enabled.
--   * Signed-in developers can only see and change their own projects and the
--     feedback that belongs to those projects.
--   * The anonymous role cannot read or write any table directly.
--   * Public widget submissions go through `public.submit_feedback`, which is
--     only executable by the service role (i.e. the Next.js API route). It
--     validates the project and applies database-backed rate limits.
--   * The widget reads its public appearance settings through
--     `public.get_widget_config`, which returns nothing but the widget config.

create schema if not exists extensions;
create extension if not exists pg_trgm with schema extensions;

-- Internal helpers that must never be exposed through the REST API.
create schema if not exists private;
revoke all on schema private from public;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  created_at timestamptz not null default now()
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 80),
  description text check (description is null or char_length(description) <= 500),
  widget_config jsonb not null default jsonb_build_object(
    'buttonLabel', 'Feedback',
    'accentColor', '#ff5a1f',
    'position', 'bottom-right'
  ) check (jsonb_typeof(widget_config) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index projects_user_id_created_at_idx on public.projects (user_id, created_at desc);

create table public.feedback (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  message text not null check (char_length(btrim(message)) between 3 and 5000),
  type text not null default 'other'
    check (type in ('bug', 'feature', 'improvement', 'question', 'other')),
  status text not null default 'open'
    check (status in ('open', 'in_progress', 'resolved', 'archived')),
  email text check (
    email is null
    or (char_length(email) <= 254 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$')
  ),
  page_url text check (page_url is null or char_length(page_url) <= 2048),
  browser text check (browser is null or char_length(browser) <= 100),
  os text check (os is null or char_length(os) <= 100),
  screen_width integer check (screen_width is null or screen_width between 0 and 20000),
  screen_height integer check (screen_height is null or screen_height between 0 and 20000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index feedback_project_created_at_idx on public.feedback (project_id, created_at desc);
create index feedback_project_status_idx on public.feedback (project_id, status);
create index feedback_message_trgm_idx on public.feedback
  using gin (message extensions.gin_trgm_ops);

-- Fixed-window counters used by submit_feedback. Not linked to feedback rows
-- and keyed by an opaque hash, so no personal data is stored here.
create table private.rate_limits (
  key text not null,
  window_start timestamptz not null,
  hits integer not null default 0,
  primary key (key, window_start)
);

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------

create function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function private.set_updated_at();

create trigger feedback_set_updated_at
  before update on public.feedback
  for each row execute function private.set_updated_at();

-- Create a profile row for every new auth user.
create function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.feedback enable row level security;
alter table private.rate_limits enable row level security;

create policy "Users can read their own profile"
  on public.profiles for select to authenticated
  using (id = (select auth.uid()));

create policy "Users can read their own projects"
  on public.projects for select to authenticated
  using (user_id = (select auth.uid()));

create policy "Users can create their own projects"
  on public.projects for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy "Users can update their own projects"
  on public.projects for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "Users can delete their own projects"
  on public.projects for delete to authenticated
  using (user_id = (select auth.uid()));

create policy "Users can read feedback for their projects"
  on public.feedback for select to authenticated
  using (
    exists (
      select 1 from public.projects p
      where p.id = feedback.project_id and p.user_id = (select auth.uid())
    )
  );

create policy "Users can update feedback for their projects"
  on public.feedback for update to authenticated
  using (
    exists (
      select 1 from public.projects p
      where p.id = feedback.project_id and p.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.projects p
      where p.id = feedback.project_id and p.user_id = (select auth.uid())
    )
  );

create policy "Users can delete feedback for their projects"
  on public.feedback for delete to authenticated
  using (
    exists (
      select 1 from public.projects p
      where p.id = feedback.project_id and p.user_id = (select auth.uid())
    )
  );

-- No insert policy on feedback: rows are only created by submit_feedback.

-- ---------------------------------------------------------------------------
-- Privileges (defence in depth on top of RLS)
-- ---------------------------------------------------------------------------

revoke all on public.profiles, public.projects, public.feedback from anon;
revoke all on public.profiles, public.projects, public.feedback from authenticated;

grant select on public.profiles to authenticated;
grant select, insert, delete on public.projects to authenticated;
grant update (name, description, widget_config) on public.projects to authenticated;
grant select, delete on public.feedback to authenticated;
-- Developers can triage feedback but never rewrite what users said.
grant update (status) on public.feedback to authenticated;

revoke all on private.rate_limits from anon, authenticated;

-- Per-project counts. security_invoker makes the view respect the caller's RLS.
create view public.project_feedback_counts
with (security_invoker = on) as
select
  p.id as project_id,
  count(f.id)::int as total,
  (count(f.id) filter (where f.status = 'open'))::int as open,
  (count(f.id) filter (where f.status = 'in_progress'))::int as in_progress,
  (count(f.id) filter (where f.status = 'resolved'))::int as resolved,
  (count(f.id) filter (where f.status = 'archived'))::int as archived
from public.projects p
left join public.feedback f on f.project_id = p.id
group by p.id;

revoke all on public.project_feedback_counts from anon;
grant select on public.project_feedback_counts to authenticated;

-- ---------------------------------------------------------------------------
-- Functions
-- ---------------------------------------------------------------------------

-- Returns true while `key` is within `max_hits` for the current fixed window.
create function private.hit_rate_limit(p_key text, p_window_seconds integer, p_max_hits integer)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_window timestamptz;
  v_hits integer;
begin
  v_window := to_timestamp(
    floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds
  );

  insert into private.rate_limits as rl (key, window_start, hits)
  values (p_key, v_window, 1)
  on conflict (key, window_start) do update set hits = rl.hits + 1
  returning rl.hits into v_hits;

  -- Occasionally clear out expired windows.
  if random() < 0.01 then
    delete from private.rate_limits where window_start < now() - interval '1 day';
  end if;

  return v_hits <= p_max_hits;
end;
$$;

revoke all on function private.hit_rate_limit(text, integer, integer) from public, anon, authenticated;

-- Public widget config. Exposes nothing but appearance settings.
create function public.get_widget_config(p_project_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select widget_config from public.projects where id = p_project_id;
$$;

revoke all on function public.get_widget_config(uuid) from public, anon, authenticated;
grant execute on function public.get_widget_config(uuid) to anon, authenticated, service_role;

-- The only way feedback enters the database.
-- Returns {"ok": true, "id": "..."} or {"ok": false, "error": "..."}.
create function public.submit_feedback(
  p_project_id uuid,
  p_message text,
  p_type text,
  p_email text default null,
  p_page_url text default null,
  p_browser text default null,
  p_os text default null,
  p_screen_width integer default null,
  p_screen_height integer default null,
  p_client_key text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
  v_client text := coalesce(p_client_key, 'unknown');
begin
  if not exists (select 1 from public.projects where id = p_project_id) then
    return jsonb_build_object('ok', false, 'error', 'project_not_found');
  end if;

  if not private.hit_rate_limit('c:' || p_project_id || ':' || v_client, 60, 5)
     or not private.hit_rate_limit('c:' || p_project_id || ':' || v_client, 3600, 30)
     or not private.hit_rate_limit('p:' || p_project_id, 3600, 500) then
    return jsonb_build_object('ok', false, 'error', 'rate_limited');
  end if;

  insert into public.feedback (
    project_id, message, type, email, page_url, browser, os, screen_width, screen_height
  ) values (
    p_project_id, btrim(p_message), p_type, nullif(btrim(p_email), ''), p_page_url,
    p_browser, p_os, p_screen_width, p_screen_height
  )
  returning id into v_id;

  return jsonb_build_object('ok', true, 'id', v_id);
end;
$$;

-- Supabase grants EXECUTE on new functions to anon/authenticated by default,
-- so revoking from PUBLIC alone is not enough.
revoke all on function public.submit_feedback(uuid, text, text, text, text, text, text, integer, integer, text)
  from public, anon, authenticated;
grant execute on function public.submit_feedback(uuid, text, text, text, text, text, text, integer, integer, text) to service_role;
