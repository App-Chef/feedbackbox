# Feedbackbox

A tiny feedback widget for solo developers and small products.

Drop one `<script>` tag on your site and visitors get a small feedback button. Everything they send lands in one
dashboard, together with the page, browser, OS and screen size it came from. There's no support desk and no CRM,
just a button that works and a clean place to read what comes in.

## Features

- **One-line install.** A dependency-free widget that renders inside a closed Shadow DOM, so your site's styles can't
  leak in or out.
- **Anonymous by default.** Visitors don't need an account, and email is optional.
- **Useful context.** Every message records the page URL, browser, OS and screen size.
- **Triage dashboard.** Search, filter by type and status, and move feedback through open → in progress → resolved →
  archived.
- **Multiple projects.** Each project has its own widget, settings and inbox.
- **Dark mode.** System-aware theme with manual toggle for light, dark, or system preference.
- **Secure by design.** Row Level Security on every table, a service-role-only submission function, and rate limits
  both in memory and in the database.

## Tech stack

- [Next.js](https://nextjs.org) 16 (App Router) and React 19
- [Supabase](https://supabase.com) for Postgres, Auth and Row Level Security
- [Tailwind CSS](https://tailwindcss.com) 4
- [Zod](https://zod.dev) for validation

## Getting started

### Prerequisites

- Node.js 20.9 or newer
- A Supabase project (the free tier is enough)

### 1. Install dependencies

```bash
npm install
```

### 2. Set up the database

Apply the schema in [supabase/migrations/20260928000000_init.sql](supabase/migrations/20260928000000_init.sql). Either
paste it into the Supabase SQL editor, or use the Supabase CLI:

```bash
supabase link --project-ref your-project-ref
supabase db push
```

In **Authentication → URL Configuration**, add `http://localhost:3000/auth/callback` (and your production URL's
equivalent) to the redirect URLs.

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

| Variable                         | Description                                                                          |
| -------------------------------- | ------------------------------------------------------------------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`       | Your Supabase project URL                                                            |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`  | Your Supabase anon (public) key                                                      |
| `SUPABASE_SERVICE_ROLE_KEY`      | Service role key. **Server only**: never prefix it with `NEXT_PUBLIC_`               |
| `NEXT_PUBLIC_APP_URL`            | Public URL of this app, used in install snippets and auth redirects                  |
| `NEXT_PUBLIC_ENABLE_GOOGLE_AUTH` | Set to `true` after enabling the Google provider in Supabase Auth                    |
| `RATE_LIMIT_SALT`                | Any long random string, used to hash visitor IPs for rate limiting                   |

### 4. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), create an account and add your first project.

## Installing the widget

Copy the snippet from your project's **Install** tab, or add it by hand before `</body>`:

```html
<script src="https://your-feedbackbox.app/widget.js" data-project="YOUR_PROJECT_ID" async></script>
```

These optional attributes override the settings saved in the dashboard:

| Attribute       | Values                                   | Default          |
| --------------- | ---------------------------------------- | ---------------- |
| `data-label`    | Button text                              | `Feedback`       |
| `data-color`    | Accent color, e.g. `#ff5a1f`             | `#ff5a1f`        |
| `data-position` | `bottom-right` \| `bottom-left`          | `bottom-right`   |
| `data-theme`    | `light` \| `dark` \| `auto`              | `light`          |
| `data-demo`     | `true` renders the widget without sending anything | —      |

With `data-theme="auto"`, the widget follows the host page's `<html data-theme>` or `class="dark"`/`"light"` when one
is set, and otherwise the OS preference.

## Scripts

| Command             | Description                      |
| ------------------- | -------------------------------- |
| `npm run dev`       | Start the development server     |
| `npm run build`     | Build for production             |
| `npm run start`     | Start the production server      |
| `npm run lint`      | Run ESLint                       |
| `npm run typecheck` | Type-check with `tsc --noEmit`   |

## Project structure

```
app/
  (marketing)/        Landing page and demo
  (auth)/             Login, signup and password reset
  dashboard/          Projects, feedback inbox, install and settings
  api/feedback/       Public endpoint the widget posts to
  api/widget/         Public widget configuration
components/           UI, dashboard, feedback and auth components
lib/                  Supabase clients, validation, rate limiting, helpers
public/widget.js      The embeddable widget
supabase/migrations/  Database schema, RLS policies and functions
```

## Security model

- Every table has Row Level Security enabled. Signed-in users can only see and change their own projects and the
  feedback on them.
- The anonymous role can't read or write any table directly.
- Widget submissions go through `public.submit_feedback`, which only the service role (the Next.js API route) can
  execute. It validates the project and applies per-visitor and per-project rate limits.
- Developers can change a feedback item's status but can never edit what the user wrote.
- Visitor IPs are only stored as salted hashes, and only for rate limiting.

## License

[MIT](LICENSE)
