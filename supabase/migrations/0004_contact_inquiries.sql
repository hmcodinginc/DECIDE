-- Contact form inbox. Service role / db url only — no public insert.

create table if not exists public.contact_inquiries (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  email text not null,
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.contact_inquiries enable row level security;
