-- ============================================================
--  Live chat schema for music-visualizer
--  Run this in the Supabase dashboard: SQL Editor -> New query -> Run.
-- ============================================================

-- 1. Messages table -----------------------------------------------------------
create table if not exists public.messages (
  id         bigint generated always as identity primary key,
  nickname   text        not null,
  gender     text,
  text       text        not null,
  created_at timestamptz not null default now()
);

-- Fast "newest first" reads.
create index if not exists messages_created_at_idx
  on public.messages (created_at desc);

-- 2. Rolling 100-message cap --------------------------------------------------
--    After every insert, delete everything beyond the newest 100 rows so the
--    table can never hold more than 100 messages. Older messages disappear.
create or replace function public.trim_messages()
returns trigger
language plpgsql
as $$
begin
  delete from public.messages
  where id in (
    select id
    from public.messages
    order by created_at desc
    offset 100          -- keep the newest 100, drop the rest
  );
  return null;
end;
$$;

drop trigger if exists trim_messages_after_insert on public.messages;

create trigger trim_messages_after_insert
  after insert on public.messages
  for each statement
  execute function public.trim_messages();

-- 3. Row Level Security -------------------------------------------------------
--    Anonymous (anon) visitors may read all messages and insert their own,
--    with light validation. No updates or deletes from the client.
alter table public.messages enable row level security;

drop policy if exists "read messages" on public.messages;
create policy "read messages"
  on public.messages
  for select
  to anon, authenticated
  using (true);

drop policy if exists "insert messages" on public.messages;
create policy "insert messages"
  on public.messages
  for insert
  to anon, authenticated
  with check (
    char_length(nickname) between 1 and 25
    and char_length(text) between 1 and 300
  );

-- 4. Realtime -----------------------------------------------------------------
--    Broadcast inserts/deletes to subscribed clients.
alter publication supabase_realtime add table public.messages;

-- Ensure DELETE events carry the primary key so clients can drop trimmed rows.
alter table public.messages replica identity full;
