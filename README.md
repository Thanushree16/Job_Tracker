# Waypoint

A job application tracker that actually tracks your applications — no spreadsheets, no forgetting which companies you applied to three weeks ago.

Waypoint exists because of one annoying reality of job hunting: you end up applying across a dozen different sites — LinkedIn, Indeed, Naukri, random company career pages — and none of them talk to each other. So this is a dashboard to keep everything in one place, paired with a Chrome extension that quietly watches for "Apply" clicks and asks if you want to log the job. No manual data entry required.

## What it does

**The web app**
- Dashboard with all your applications — company, role, status, and a link back to the original posting
- Inline editing and a live status dropdown, so updating "Applied" to "Interview" is a one-click thing, not a modal
- Stats that update as you go — total applied, interviews, offers, rejections, no-response
- A "Paste to Track" flow: drop in a job description and Groq/LLaMA pulls out the company and role for you
- Manual "Add Job" for anything that never went through the extension
- Full auth, including forgot/reset password
- Light and dark mode

**The Chrome extension**
This is the part that actually turned into a real engineering problem. It:
- Detects "Apply" clicks across Indeed, Naukri, and LinkedIn — three sites that each structure their job pages completely differently
- Pulls company and role from whatever's actually available on the page: structured JSON-LD when a site has it, targeted DOM scraping (and, for LinkedIn, parsing the page's own SEO title) when it doesn't
- Shows a "Save this job?" confirmation before anything gets written — nothing gets tracked without you saying yes
- Survives multi-step apply flows — Indeed's redirect into a separate apply subdomain, LinkedIn's Easy Apply modal, external redirects to a company's own career page or even a Google Form — by carrying the captured job data across tabs and page loads instead of re-detecting (and potentially getting it wrong) at every step
- Refuses to guess: if it can't find real job data on a page, it tells you instead of silently saving a blank or garbage entry
- Ignores generic "Submit" buttons on unrelated pages (quizzes, assessments, random forms) unless a real "Apply" click already started that flow — otherwise almost anything with a Submit button would trigger it
- Won't create duplicate rows even if you double-click Save

## Tech stack

- **Frontend:** React + Vite, Tailwind CSS
- **Backend:** Supabase (Postgres, Auth, Row-Level Security)
- **Extension:** Chrome Manifest V3 — vanilla JS content script + background service worker
- **AI:** Groq API (LLaMA 3.3 70B) for job-detail extraction
- **Hosting:** Vercel

## Project structure

```
Job-tracker/
├── src/
│   ├── components/     # Dashboard, modals, shared UI
│   ├── context/        # theme provider + hook
│   ├── hooks/          # useJobs — all the Supabase read/write logic lives here
│   ├── lib/            # Supabase client setup
│   └── pages/          # Auth, Dashboard, Profile, etc.
├── extension/           # the Chrome extension — manifest, content script, background script
└── ...
```

## Running it locally

```bash
git clone <your-repo-url>
cd Job-tracker
npm install
npm run dev
```

You'll need your own Supabase project. Add a `.env.local` in the root:

```
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Row-Level Security policies are required on the `jobs` table for select, insert, update, and delete — all scoped to `auth.uid() = user_id`. Without all four, the app will fail silently on whichever operation is missing a policy (ask me how I know).

### Loading the extension

1. Go to `chrome://extensions`
2. Turn on Developer mode
3. Click **Load unpacked**
4. Select the `/extension` folder

The extension shares a session with the web app via `chrome.storage.local`, synced automatically once you're logged into the site — including handling access-token refresh on its own, since it can't rely on the web app's tab staying open to keep the token fresh.

## Known limitations

- Extraction is currently tuned specifically for Indeed, Naukri, and LinkedIn. A new job site will likely need its own selector or parsing logic added to `content.js` — there's no generic solution that reliably works everywhere, since every ATS structures its pages differently.
- The extension captures job data at the moment you click Apply, not after you've actually finished a multi-step application. If you back out partway through, it can still end up in your tracker.

## Why I built this

Mostly because I kept losing track of where I'd applied. The web app part was fairly standard CRUD work — the extension is where it got genuinely interesting, since every job site behaves differently and several of them route you through 2–3 different domains before you actually submit. Getting it to capture the right data at the right moment, without creating duplicates or saving garbage when a page has nothing useful on it, took a lot more edge-case handling than it looked like it would going in.