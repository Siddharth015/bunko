-- Trigger to automatically create a profile when a new user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username, bio, top_four_ids, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data ->> 'username',
    '',
    '[]'::jsonb,
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

-- Drop the trigger if it exists to allow for idempotent execution
drop trigger if exists on_auth_user_created on auth.users;

-- Create the trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
