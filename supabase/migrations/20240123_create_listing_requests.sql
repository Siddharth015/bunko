create table if not exists listing_requests (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id),
  title text not null,
  type text,
  requested_at timestamp with time zone default now(),
  status text default 'PENDING' -- PENDING, APPROVED, REJECTED
);

-- RLS
alter table listing_requests enable row level security;

create policy "Users can insert their own requests"
  on listing_requests for insert
  with check (auth.uid() = user_id);
