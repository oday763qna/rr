# OD Tasks

OD Tasks is a mobile-first, local-first PWA for organizing tasks, notes, projects, habits, study dates, and focus time. It is free to use, has no ads or AI functionality, and supports English and Arabic with RTL layout. Guest mode works without a cloud account.

## Run locally

Requirements: Node.js 20.19+ (Vite/PWA plugin requirement) and npm.

```sh
npm install
npm run dev
```

Build and preview:

```sh
npm run build
npm run preview
```

Run unit tests with `npm test`.

## Current features

- First-run setup for display name, language, and appearance.
- English and Arabic UI, document direction, light/dark/system themes, and responsive bottom navigation.
- IndexedDB storage through Dexie for tasks, notes, projects, habits, check-ins, and settings.
- Task status progression, priorities, due dates, project association, search, and task kinds (task/study/exam). Each task supports editable, checkable subtasks, its own Pomodoro duration, a one-tap timer, and completed-session counts.
- Date-based planner, editable notes, project progress, daily habit check-ins, and a configurable focus countdown.
- Weekly completion counts and overdue count based on local task records.
- JSON backup export and validated import.
- Installable manifest and service-worker precache via `vite-plugin-pwa`.

## Supabase setup

1. Copy `.env.example` to `.env.local` and set the Supabase project URL and publishable key. For Vercel, add these same two values as environment variables.
2. Review and apply `supabase/migrations/0001_initial_schema.sql` in the Supabase SQL Editor. It creates `public.tasks` with a foreign key to `auth.users`, owner-only RLS policies, and indexes. This project does not apply remote migrations automatically.
3. In Supabase Auth → URL Configuration, add the local app URL (for example, `http://127.0.0.1:5174/**`) and the production app URL to Redirect URLs. Email confirmation uses Supabase Auth with PKCE; open the confirmation link in the same browser that started signup so Supabase can complete the session exchange. If no session is returned, the app keeps the email and lets the user sign in after confirmation. Email delivery requires suitable SMTP configuration in Supabase.
4. For account deletion on Vercel, add `SUPABASE_SECRET_KEY` as a Vercel **Secret** environment variable in every deployed environment that needs this endpoint. Use the Supabase project's server-side secret key (or legacy service-role key); never add it to a `VITE_` variable, repository, or browser code. Redeploy after setting it. The account panel requires the current password and an exact email confirmation, and deletion is handled by the serverless endpoint at `/api/account/delete`.
5. Start the frontend with `npm run dev`. Email/password registration, login, password recovery, and sign-out run through Supabase Auth. The `/api/account/delete` serverless endpoint is available on Vercel; a plain Vite dev server or GitHub Pages does not run that API endpoint, so use Vercel's local development command to try account deletion locally.

Task data syncs to Supabase for the signed-in account. Existing device tasks are not uploaded automatically; Settings offers an explicit action to link local tasks to the active account. Other records remain stored locally in IndexedDB.

## Deploy to GitHub Pages

The workflow at `.github/workflows/deploy.yml` builds and deploys the app to GitHub Pages whenever `main` is updated. Create a GitHub repository, push this project to its `main` branch, and enable **Settings → Pages → GitHub Actions**. Add the repository variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`; these are frontend configuration values, never put a service-role key in the repository. GitHub Pages is static hosting and cannot run the account deletion API; use Vercel for that feature. The workflow stops instead of publishing if either public configuration value is missing.

Vite automatically uses the repository subpath for GitHub Pages, and the PWA manifest uses that same base path. After the first deploy, add the app URL (for a project repository, `https://<github-user>.github.io/<repository>/`) to Supabase Auth's allowed Redirect URLs. Use HTTPS for production. Notifications are permission-gated; background delivery while the app is closed is not guaranteed.

## Data model

Dexie schema and tables are defined in `src/db.ts`; typed records are in `src/types.ts`. Browser data is device-local and can be removed by clearing site storage, so export a backup before changing devices or clearing browser data. Import validates the OD Tasks format/version and merges records by ID.

## Documentation/tooling notes

The Apple Design Skill and Context7 MCP were not available in this environment. Official documentation was consulted directly: [React](https://react.dev/learn), [Vite](https://vite.dev/guide/), [Dexie](https://dexie.org/docs), [Supabase Auth](https://supabase.com/docs/guides/auth), [Supabase Auth setup](https://supabase.com/docs/guides/auth), and [vite-plugin-pwa](https://github.com/vite-pwa/vite-plugin-pwa). Supabase Auth signup, RLS, and cross-device cloud sync require a configured project and user account for live testing.

## Known gaps

Continuous sync/conflict resolution is not implemented; local task linking is explicit and other record types remain local. Study and exam items use task records rather than dedicated planners, the calendar is a dated list rather than a month grid, and global search currently filters tasks rather than notes. The free theme catalog and achievements are not implemented. Focus break modes and completion audio are not implemented. Automated coverage is limited to five business-logic unit tests; Supabase integration, end-to-end, and screen-reader/mobile visual checks were not run. Treat this as a working local-first foundation, not as satisfying every item in the full product brief.
