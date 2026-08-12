-- Carries role + username in the JWT's app_metadata so verifyAuth() can skip its
-- separate `profiles` lookup on every authenticated request, once this hook is
-- enabled. Trade-off: claims are baked in at token-issue time, so a username/role
-- change takes up to `auth.jwt_expiry` (1h) to propagate to an existing session.
--
-- MANUAL STEP REQUIRED (not scriptable via available tooling): enable this as the
-- "Custom Access Token" Auth Hook in the Supabase dashboard
-- (Authentication -> Hooks -> Customize Access Token (JWT) Claims hook),
-- pointing it at public.custom_access_token_hook. Until that's done, this function
-- exists but isn't called, and verifyAuth()'s fallback query keeps running as before.

create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
stable
as $$
declare
  claims jsonb;
  profile_role text;
  profile_username text;
begin
  select role, username into profile_role, profile_username
  from public.profiles
  where id = (event->>'user_id')::uuid;

  claims := coalesce(event->'claims', '{}'::jsonb);

  if profile_role is not null then
    claims := jsonb_set(claims, '{app_metadata,role}', to_jsonb(profile_role));
    claims := jsonb_set(claims, '{app_metadata,username}', to_jsonb(profile_username));
  end if;

  event := jsonb_set(event, '{claims}', claims);
  return event;
end;
$$;

grant execute on function public.custom_access_token_hook to supabase_auth_admin;
revoke execute on function public.custom_access_token_hook from authenticated, anon, public;
