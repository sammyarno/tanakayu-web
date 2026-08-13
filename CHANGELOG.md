# Changelog

## [Unreleased]

- perf: pinned Vercel functions to `sin1` (Singapore); they were executing in `iad1` while Supabase runs in `ap-southeast-1`, so every DB round trip crossed the Pacific twice — `/api/posts` measured 2849ms, `/api/health` 1266ms, against 28ms browser-to-Supabase directly
- perf: `/post` no longer holds its posts request behind the client-side auth store initialization (~490ms of serial wait)
- perf: navigating to a protected page now paints a skeleton immediately instead of waiting on the server auth check
- perf: home page render cut from ~1030ms to ~25ms by dropping a server-side prefetch that round-tripped to the app's own API and was refetched client-side anyway
- perf: profile requests no longer make a second Auth API call just to read an email already stored on `profiles`
- perf: transaction report fetches its month list and its transactions in parallel instead of one after the other
- fix: first click after login no longer silently does nothing (stale pre-auth route prefetch)
- fix: the TanStack QueryClient is no longer a module-level singleton shared across concurrent SSR requests
- perf: login no longer waits on a redundant profile fetch after establishing the session
- perf: members list no longer downloads the entire auth user table to resolve emails; `profiles.email` is now denormalized
- perf: protected pages (`members`, `waitlist`, `verify-member`, `member/profile`, `post`, `transaction-report`) render immediately from the persisted session instead of blanking until re-verified
- perf: `/post` and `/transaction-report` are now protected server-side by middleware instead of only client-side
- perf: post create/edit dialogs read categories from the existing store instead of issuing a redundant fetch
- perf: transaction amounts reuse a cached number formatter instead of constructing one per row
- infra: added a `custom_access_token_hook` to carry role/username in the session JWT, removing a second DB round trip from every authenticated API call once enabled in the Supabase dashboard
- chore: adopted trunk-based branching; retired `release/v2`
- chore: tracked the live Supabase schema, RLS policies, functions, and the `login-with-username` edge function under `supabase/` as a single baseline migration

## v1.0.0 - 2026-08-13

Baseline tag marking `main` before trunk-based development and the `release/v2` merge (waitlist/invite-based registration, redesigned register flow, themed 404 page, and related work).
