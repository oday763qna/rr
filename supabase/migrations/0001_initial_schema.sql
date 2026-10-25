create table if not exists public.tasks (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 120),
  description text not null default '',
  status text not null default 'todo' check (status in ('todo', 'doing', 'done')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  due_date date,
  project_id text not null default '',
  kind text not null default 'task' check (kind in ('task', 'study', 'exam')),
  subtasks jsonb not null default '[]'::jsonb check (jsonb_typeof(subtasks) = 'array'),
  pomodoro_minutes integer not null default 25 check (pomodoro_minutes between 1 and 180),
  pomodoros_completed integer not null default 0 check (pomodoros_completed >= 0),
  color text,
  icon text,
  related_task_ids jsonb not null default '[]'::jsonb check (jsonb_typeof(related_task_ids) = 'array'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);
create index if not exists tasks_user_updated_idx on public.tasks (user_id, updated_at desc);
create index if not exists tasks_user_due_date_idx on public.tasks (user_id, due_date) where due_date is not null;
alter table public.tasks enable row level security;
revoke all on table public.tasks from anon;
grant select, insert, update, delete on table public.tasks to authenticated;
drop policy if exists "Tasks are readable by their owner" on public.tasks;
drop policy if exists "Tasks are insertable by their owner" on public.tasks;
drop policy if exists "Tasks are updatable by their owner" on public.tasks;
drop policy if exists "Tasks are deletable by their owner" on public.tasks;
create policy "Tasks are readable by their owner" on public.tasks for select to authenticated using (user_id = (select auth.uid()));
create policy "Tasks are insertable by their owner" on public.tasks for insert to authenticated with check (user_id = (select auth.uid()));
create policy "Tasks are updatable by their owner" on public.tasks for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "Tasks are deletable by their owner" on public.tasks for delete to authenticated using (user_id = (select auth.uid()));
