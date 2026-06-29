-- ============================================================
-- Halfway to God — The 100 Days
-- Run this once in the Supabase SQL Editor (Project > SQL Editor > New query)
-- ============================================================

-- One row per person. "tasks" is their personal, self-chosen checklist —
-- everyone can have a different list, exactly like the original artifact's
-- per-friend versions.
create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  tasks jsonb not null default '[]'::jsonb, -- [{ "id": "t_123", "label": "Read 10 pages" }, ...]
  created_at timestamptz not null default now()
);

-- One row per person per day. "checks" maps task id -> boolean.
-- all_complete is recomputed on every save: true only if every task that
-- day was checked. A day with no row, or all_complete = false, breaks
-- the streak — this is the all-or-nothing rule.
create table if not exists daily_logs (
  id bigint generated always as identity primary key,
  user_id uuid not null references profiles (id) on delete cascade,
  log_date date not null,
  checks jsonb not null default '{}'::jsonb,
  all_complete boolean not null default false,
  created_at timestamptz not null default now(),
  unique (user_id, log_date)
);

create index if not exists daily_logs_user_date_idx on daily_logs (user_id, log_date desc);

-- ------------------------------------------------------------
-- Row Level Security
-- ------------------------------------------------------------
alter table profiles enable row level security;
alter table daily_logs enable row level security;

-- People can only see and edit their own profile row directly.
-- (Everyone's streak is still visible to the group via get_leaderboard()
-- below — that function intentionally bypasses this restriction.)
create policy "profiles: select own"
  on profiles for select
  using (auth.uid() = id);

create policy "profiles: upsert own"
  on profiles for insert
  with check (auth.uid() = id);

create policy "profiles: update own"
  on profiles for update
  using (auth.uid() = id);

-- Daily logs are private. Only the owner can read or write their own
-- day-by-day checklist history.
create policy "daily_logs: select own"
  on daily_logs for select
  using (auth.uid() = user_id);

create policy "daily_logs: insert own"
  on daily_logs for insert
  with check (auth.uid() = user_id);

create policy "daily_logs: update own"
  on daily_logs for update
  using (auth.uid() = user_id);

-- ------------------------------------------------------------
-- Streak calculation
-- ------------------------------------------------------------
-- Counts consecutive fully-complete days working backward from
-- YESTERDAY (today is still in progress and never counts until it
-- has passed). The first missing or incomplete day stops the count.
--
-- p_today is passed in by the client as THEIR browser's local date
-- (see lib/dates.js), not computed here with current_date. Supabase's
-- database server runs in UTC by default, which would be several
-- hours off from a person's actual local midnight — passing the date
-- in avoids that mismatch entirely, regardless of where the person is.
--
-- security definer: runs with table-owner privileges so it can be
-- used by get_leaderboard() to read across all users safely, without
-- opening up daily_logs itself to other users.
create or replace function get_streak(p_user_id uuid, p_today date)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  d date := p_today - 1;
  streak int := 0;
  is_complete boolean;
begin
  loop
    select all_complete into is_complete
    from daily_logs
    where user_id = p_user_id and log_date = d;

    if is_complete is true then
      streak := streak + 1;
      d := d - 1;
    else
      exit;
    end if;

    if streak >= 100 then
      exit;
    end if;
  end loop;

  return streak;
end;
$$;

grant execute on function get_streak(uuid, date) to authenticated;

-- ------------------------------------------------------------
-- Leaderboard
-- ------------------------------------------------------------
-- Exposes only display_name + streak to the whole group — never the
-- underlying task list or daily checkbox history of other people.
--
-- p_today is the viewer's local date. This is a deliberate simplification:
-- everyone's streak is computed relative to the same reference date, so if
-- your group spans very different timezones, someone's count may shift by
-- a day depending on who's looking and when. Fine for a friend group in
-- roughly the same timezone; worth knowing if yours isn't.
create or replace function get_leaderboard(p_today date)
returns table (display_name text, streak int)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
    select p.display_name, get_streak(p.id, p_today) as streak
    from profiles p
    order by streak desc, p.display_name asc;
end;
$$;

grant execute on function get_leaderboard(date) to authenticated;
