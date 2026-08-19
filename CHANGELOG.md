# Changelog

## [Unreleased]

- fix: form controls no longer render mismatched fills; shadcn's leftover `dark:` utilities were firing on dark-mode machines even though the app defines no dark theme, painting translucent overlays over inputs and selects. The `dark` variant is now bound to an opt-in `.dark` ancestor, and the contextual field fill moved from ancestor-scoped `!important` rules (which a `FormControl` wrapper silently defeated by replacing the child's `data-slot`) to a `--field-bg` variable the controls consume
- fix: the create-post type select was 132px wide against 348px fields, with a near-white placeholder and chevron on a light fill; it now matches the other controls
- fix: registration stores usernames lowercase, and login lowercases the username before the lookup; both the uniqueness check and the login lookup are exact matches, so casing could previously produce a duplicate-looking username or a login that failed against the stored one
- fix: admin-only lazy dialogs (post create/edit/delete, transaction upload/create) each get their own Suspense boundary; they were suspending the page-level boundary as their chunk loaded, hiding the whole page back to its skeleton and making the Add Post button flash show/hide/show
- fix: navigating to a page no longer flashes two different skeleton shapes; each route's `loading.tsx` now renders its real static shell (breadcrumb, header, filters) plus the same content skeleton the page itself uses, so only the data area transitions, once
- polish: list/card loading states (members, waitlist entries + invites, posts, transaction report, profile) now show skeletons shaped like the real row/card instead of a generic centered spinner; removed the now-unused `LoadingIndicator` spinner component
- perf: pinned Vercel functions to `sin1` (Singapore); they were executing in `iad1` while Supabase runs in `ap-southeast-1`, so every DB round trip crossed the Pacific twice — `/api/posts` measured 2849ms, `/api/health` 1266ms, against 28ms browser-to-Supabase directly
- perf: `/post` no longer holds its posts request behind the client-side auth store initialization (~490ms of serial wait)
- fix: the member edit dialog re-initializes via a `key` remount instead of a `setState`-in-effect cascade
- fix: the create-post dialog resets and closes from its own event handlers instead of effects watching mutation state
- refactor: form fields subscribe with `useWatch` instead of `methods.watch`, so React Compiler can memoize the register page and both post dialogs
- chore: removed the `fileNamePrefix` prop from the rich text editor — it was threaded through two call sites and never used; `/api/upload` names files itself
- chore: `pnpm lint` is clean (was 1 error, 5 warnings)
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
