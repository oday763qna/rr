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

1. Copy `.env.example` to `.env.local` and set the Supabase project URL and publishable key.
2. Create a Web OAuth client in Google Cloud Console. Add `http://127.0.0.1:5174` as an Authorized JavaScript origin, and add `https://vcnvawkjdyhvoyeouera.supabase.co/auth/v1/callback` as an Authorized redirect URI. In Supabase Auth Providers, enable Google and add its Client ID and Client Secret there (never in frontend environment files). Add `http://127.0.0.1:5174/**` to Supabase Auth Redirect URLs; add the production origin there too. Disable the email provider in Supabase if Google must be the only account method.
3. Review and apply `supabase/migrations/0001_initial_schema.sql` in the Supabase SQL Editor. It creates `public.tasks` with a foreign key to `auth.users`, owner-only RLS policies, and indexes. This project does not apply remote migrations automatically.
4. Start the app with `npm run dev`. Users can create an account and sign in using email/password, or use Google OAuth. Google OAuth uses the Supabase browser session with PKCE and returns to the current app origin. Supabase Auth persists and refreshes the session in the browser. Email confirmation and delivery depend on the Auth settings and SMTP configured in Supabase.

Task data syncs to Supabase for the signed-in account. Existing device tasks are not uploaded automatically; Settings offers an explicit action to link local tasks to the active account. Other records remain stored locally in IndexedDB.

## Deploy to GitHub Pages

The workflow at `.github/workflows/deploy.yml` builds and deploys the app to GitHub Pages whenever `main` is updated. Create a GitHub repository, push this project to its `main` branch, and enable **Settings → Pages → GitHub Actions**. Add the repository variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`; these are frontend configuration values, never put a service-role key in the repository. The workflow stops instead of publishing if either variable is missing.

Vite automatically uses the repository subpath for GitHub Pages, and the PWA manifest uses that same base path. After the first deploy, add the app URL (for a project repository, `https://<github-user>.github.io/<repository>/`) to Supabase Auth's allowed Redirect URLs and add its origin in Google Cloud OAuth settings. Google must also authorize the Supabase callback URL shown in Supabase Auth Providers. Use HTTPS for production. Notifications are permission-gated; background delivery while the app is closed is not guaranteed.

## Data model

Dexie schema and tables are defined in `src/db.ts`; typed records are in `src/types.ts`. Browser data is device-local and can be removed by clearing site storage, so export a backup before changing devices or clearing browser data. Import validates the OD Tasks format/version and merges records by ID.

## Documentation/tooling notes

The Apple Design Skill and Context7 MCP were not available in this environment. Official documentation was consulted directly: [React](https://react.dev/learn), [Vite](https://vite.dev/guide/), [Dexie](https://dexie.org/docs), [Supabase Auth](https://supabase.com/docs/guides/auth), [Google OAuth setup](https://supabase.com/docs/guides/auth/social-login/auth-google), and [vite-plugin-pwa](https://github.com/vite-pwa/vite-plugin-pwa). Supabase Auth signup, RLS, and cross-device cloud sync require a configured project and user account for live testing.

## Known gaps

Continuous sync/conflict resolution is not implemented; local task linking is explicit and other record types remain local. Study and exam items use task records rather than dedicated planners, the calendar is a dated list rather than a month grid, and global search currently filters tasks rather than notes. The free theme catalog and achievements are not implemented. Focus break modes and completion audio are not implemented. Automated coverage is limited to five business-logic unit tests; Supabase integration, end-to-end, and screen-reader/mobile visual checks were not run. Treat this as a working local-first foundation, not as satisfying every item in the full product brief.

