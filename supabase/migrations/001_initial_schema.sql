-- Profiles table — auto-created on user sign-up
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  voice_type text,
  vocal_range_low_hz real,
  vocal_range_high_hz real,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Exercise completions
create table public.exercise_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  chapter_slug text not null,
  stage_slug text not null,
  exercise_slug text not null,
  completed_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, chapter_slug, stage_slug, exercise_slug)
);

alter table public.exercise_completions enable row level security;

create policy "Users can view own completions"
  on public.exercise_completions for select
  using (auth.uid() = user_id);

create policy "Users can insert own completions"
  on public.exercise_completions for insert
  with check (auth.uid() = user_id);

-- Auto-create profile on sign-up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Auto-update updated_at timestamp
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

create trigger exercise_completions_updated_at
  before update on public.exercise_completions
  for each row execute procedure public.set_updated_at();
