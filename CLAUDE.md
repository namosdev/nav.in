# CLAUDE.md — Project Briefing for Claude Code

## Project Overview
Personal website for Navin Oswal — CA, Co-Founder of UNITS and UNIVEN, based in Pune.
Professional branding site with admin panel for content management.
Owner is non-technical — all code must be clean, well-commented, and self-explanatory.

## Live Details
- Live URL (primary): https://navinoswal.com
- Live URL (www): https://www.navinoswal.com
- Legacy URL: https://nav-in-six.vercel.app (still active)
- GitHub Repo: github.com/namosdev/nav.in
- Vercel project: nav-in (under namosdev-8998 account)
- Supabase project: rnphcqjfzhbxchuveuhd.supabase.co
- Admin email: namos.dev@gmail.com (Supabase Auth + Vercel env only — never in code)

## Tech Stack
- Framework: Next.js 14 (pages router — NOT app router, ever)
- Database + Auth: Supabase
- Hosting: Vercel (auto-deploys on push to main)
- Version control: GitHub

## File Structure
```
pages/
├── _app.js
├── index.js        → Home (photo bg + avatar + visitor widget + question widget)
├── about.js        → Full story
├── ventures.js     → DB-driven: UNITS + UNIVEN from Supabase
├── thoughts.js     → Substack RSS (4 series tabs)
├── now.js          → DB-driven: now_content table
├── stack.js        → DB-driven: stack_items table (grouped by category)
├── connect.js      → Meeting form
└── admin/
    ├── index.js       → Magic link login
    ├── dashboard.js   → Protected dashboard
    ├── homepage.js    → Question widget admin
    ├── now.js         → Edit now_content
    ├── ventures.js    → Edit ventures
    └── stack.js       → CRUD stack_items
pages/api/
├── log-human-visit.js
├── visitor-counts.js
├── question-data.js
├── vote-question.js
└── ping.js            → Supabase keepalive cron endpoint
components/
└── Layout.js       → Shared Nav + Footer
styles/
└── globals.css     → Full design system
public/
├── logos/          → units-logo.png, univen-logo.png
├── images/
│   ├── Navin_Original-Photo.JPG
│   ├── Navin_Social-Share.jpg
│   ├── navin-hero.webp
│   └── navin-profile-avatar.webp
├── robots.txt
└── card/
    ├── index.html           → Visiting card (standalone, no nav/footer)
    └── navin-card-print.pdf
vercel.json         → Cron: /api/ping every 6 days at 06:00 UTC
```

## Design System (never deviate from this)
- Primary: Sage #2d6a4f / #52b788
- Accent: Amber #b45309 / #fbbf24
- Secondary: Slate #1e3a5f / #93c5fd
- Display font: Cormorant Garamond (serif)
- Body font: Outfit
- Label font: JetBrains Mono
- Style: Glassmorphism, light background, animated gradient blobs
- Card page: Full-screen dark #060a09, sage/amber, no nav/footer

## Admin Panel Design Exception
- Admin pages use clean minimal style (white background, no glassmorphism)
- Reason: admin is a tool, not a branding surface
- Still use Outfit font and sage #2d6a4f as primary color

## Stack Categories (locked — do not change)
Five buckets for stack_items.category: think → design → build → test → ship
- think: Claude, Gemini
- design: Lovable.dev, Claude HTML+CSS in chat
- build: Next.js, Supabase
- ship: Vercel, GitHub

## Supabase Tables
| Table | Purpose |
|---|---|
| meeting_requests | Connect form submissions |
| now_content | Single row — 4 fields (see column names below) |
| ventures | UNITS + UNIVEN rows |
| stack_items | status column + think/design/build/test/ship categories |
| visitor_categories | 5 human visitor categories seeded |
| category_visits | sentiment column live |
| agent_visits | AI agent auto-log |
| homepage_widget | Active question live |
| question_responses | Visitor votes |

## now_content Column Names (CRITICAL — verified Apr 10)
- focus_text (NOT focused_on — this caused a silent fetch failure)
- building
- reading
- thinking
Always use .maybeSingle() not .single() on this table.

## Environment Variables
These exist in .env.local (never commit this file):
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- NEXT_PUBLIC_ADMIN_EMAIL

## Supabase Auth
- Magic link (passwordless) is the chosen auth method
- Admin email: namos.dev@gmail.com (from NEXT_PUBLIC_ADMIN_EMAIL env var — never hardcode)
- Redirect URLs configured in Supabase:
  - https://nav-in-six.vercel.app/admin/dashboard
  - http://localhost:3000/admin/dashboard
  - https://navinoswal.com/admin/dashboard
  - https://www.navinoswal.com/admin/dashboard

## Visiting Card Rules (non-negotiable)
- Lives at /card (public/card/index.html) — standalone, no nav/footer
- Never auto-redirect from any page to /card
- All navigation to/from card is always user-initiated
- sessionStorage is domain-scoped — always use relative URLs to avoid www vs apex mismatch

## Supabase Keepalive
- vercel.json runs a cron calling /api/ping every 6 days at 06:00 UTC
- This prevents Supabase free tier from pausing after 7 days of inactivity
- Do not remove or modify this cron without explicit instruction

## Coding Conventions
- Use inline styles (not CSS modules) — consistent with existing codebase
- No TypeScript — plain JavaScript only
- Always create Supabase client inline in each file
- Comment every logical block so owner can understand what it does
- Keep components simple — no unnecessary abstractions
- Use .maybeSingle() not .single() on all Supabase single-row queries
- Always verify field names match actual table schema before writing fetch logic
- SQL changes always go as a standalone block — never embedded in a PR description

## Branch Strategy
- main → production (never commit directly, except docs-only changes like CLAUDE.md)
- feature/* → development branches
- fix/* → bug fix branches
- All code changes via PR, tested on Vercel preview URL before merging

## Current Build Status
### Complete
- All 7 public pages live
- Domain: navinoswal.com (primary) + www
- Full design system locked
- Auth: magic link, dual-layer security, admin email restriction
- Visiting card: /card with particle effects, flip animation
- Visitor + Agent counter: human self-identification widget + AI agent auto-log
- Homepage enhancements: monthly question widget, sentiment strip, hero photo + avatar
- Phase 3A: Admin edit forms for /admin/now, /admin/ventures, /admin/stack
- DB-driven public pages: ventures, now, stack all reading from Supabase
- Supabase keepalive cron: /api/ping every 6 days
- Substack content: 3 stories final draft, Accidental Engineer series created

### Pending (in priority order)
- Fix /now page fetch — focus_text field name mismatch in pages/now.js
- Remove developer note box from public /now page
- Fix /stack public page category display (categories not rendering correctly)
- Phase 3B: /m/ route migration + mobile polish (deliberately postponed — do last)
- Phase 4: Connect form end-to-end

## Rules for Claude Code
1. NEVER commit directly to main (exception: docs-only files like CLAUDE.md)
2. NEVER expose or hardcode Supabase keys or admin email
3. NEVER use app router — this project uses pages router only
4. NEVER install new npm packages without noting it in the PR description
5. ALWAYS add comments explaining what each section does
6. ALWAYS keep admin UI minimal and functional (not decorative)
7. ALWAYS test that imports match existing patterns in the codebase
8. ALWAYS follow the Deployment Checklist before marking any task done
9. ALWAYS verify Supabase field names against actual table schema before writing fetch logic
10. NEVER use .single() — always use .maybeSingle() for single-row Supabase queries

---

## Deployment Checklist (ALWAYS follow before marking any task done)
Every code change must be accompanied by ALL of the following checks.
Claude Code must list which of these apply and confirm each is handled
in the PR description.

### Vercel
- [ ] Are any new environment variables needed? If yes, add to Vercel
      with All Environments checked
- [ ] Are variable NAMES consistent between .env.local and Vercel?
- [ ] Does the preview deployment succeed before merging?

### Supabase
- [ ] Are any new redirect URLs needed? If yes, add to Authentication
      → URL Configuration
- [ ] Are any new database tables needed? If yes, include SQL as
      a standalone block (never embedded in the prompt)
- [ ] Are any Row Level Security (RLS) policies needed on new tables?
- [ ] Is email auth / magic link still enabled?

### Security
- [ ] Is admin access restricted to namos.dev@gmail.com only?
- [ ] Are no secrets or keys hardcoded in any file?
- [ ] Is .env.local in .gitignore?

### Testing
- [ ] Tested on preview URL before merging to main?
- [ ] Auth flow tested end to end?
- [ ] Checked on mobile view?

This checklist is non-negotiable. No PR should be merged without
confirming all relevant items.
