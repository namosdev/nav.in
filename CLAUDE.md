# CLAUDE.md — Project Briefing for Claude Code

## Project Overview
Personal website for Navin Oswal — CA, Co-Founder of UNITS and UNIVEN, based in Pune.
This is a professional branding site with an admin panel for content management.
Owner is non-technical — all code must be clean, well-commented, and self-explanatory.

## Live Details
- Live URL: https://nav-in-six.vercel.app
- GitHub Repo: github.com/namosdev/nav.in
- Local folder: C:\Users\akrob\namoswal-site
- Vercel project: nav-in (under namosdev-8998 account)
- Supabase project: rnphcqjfzhbxchuveuhd.supabase.co

## Tech Stack
- Framework: Next.js 14 (pages router — NOT app router)
- Database + Auth: Supabase
- Hosting: Vercel (auto-deploys on push to main)
- Version control: GitHub

## File Structure
```
pages/
├── _app.js
├── index.js        → Home
├── about.js        → Full story
├── ventures.js     → UNITS + UNIVEN
├── thoughts.js     → Substack RSS
├── now.js          → Monthly updates
├── stack.js        → AI building stack
├── connect.js      → Meeting form
└── admin/          → Admin panel (in progress)
components/
└── Layout.js       → Shared Nav + Footer
styles/
└── globals.css     → Full design system
public/logos/       → units-logo.png, univen-logo.png
```

## Design System (never deviate from this)
- Primary: Sage #2d6a4f / #52b788
- Accent: Amber #b45309 / #fbbf24
- Secondary: Slate #1e3a5f / #93c5fd
- Display font: Cormorant Garamond (serif)
- Body font: Outfit
- Label font: JetBrains Mono
- Style: Glassmorphism, light background, animated gradient blobs

## Admin Panel Design Exception
- Admin pages use a clean minimal style (white background, no glassmorphism)
- Reason: admin is a tool, not a branding surface
- Still use Outfit font and sage #2d6a4f as primary color

## Environment Variables
These exist in .env.local (never commit this file):
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY

## Supabase Auth
- Magic link (passwordless) is the chosen auth method
- Admin email: namos.dev@gmail.com
- Redirect URLs configured in Supabase:
  - https://nav-in-six.vercel.app/admin/dashboard
  - http://localhost:3000/admin/dashboard

## Coding Conventions
- Use inline styles (not CSS modules) — consistent with existing codebase
- No TypeScript — plain JavaScript only
- Always create supabase client inline in each file (not a shared util yet)
- Comment every logical block so owner can understand what it does
- Keep components simple — no unnecessary abstractions

## Branch Strategy
- main → production (never commit directly, except docs-only changes)
- feature/* → development branches
- fix/* → bug fix branches
- All code changes via PR, tested on Vercel preview URL before merging

## Current Build Status
### Done
- 7 public pages built and live
- Supabase connected (meeting_requests table exists)
- Design system locked
- Admin panel Phase 1 (auth + dashboard + meeting requests viewer)
- Visiting Card ✅ COMPLETE — live at navinoswal.com/card, file at /public/card/index.html. Card is the session gate — first visit to / redirects to /card via sessionStorage check. Flag set on card exit.

### In Progress
- Admin panel security hardening (fix/admin-email-restriction)

### Planned
- Phase 3: Admin edit forms for Now, Ventures, Stack
- Phase 4: Public pages read from Supabase

## Rules for Claude Code
1. NEVER commit directly to main (exception: docs-only files like CLAUDE.md)
2. NEVER expose or hardcode Supabase keys
3. NEVER use app router — this project uses pages router
4. NEVER install new npm packages without noting it in the PR description
5. ALWAYS add comments explaining what each section does
6. ALWAYS keep admin UI minimal and functional (not decorative)
7. ALWAYS test that imports match existing patterns in the codebase
8. ALWAYS follow the Deployment Checklist before marking any task done

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
- [ ] Are any new database tables needed? If yes, include SQL in PR
- [ ] Are any Row Level Security (RLS) policies needed on new tables?
- [ ] Is email auth / magic link still enabled?

### Security
- [ ] Is admin access restricted to authorised email only?
- [ ] Are no secrets or keys hardcoded in any file?
- [ ] Is .env.local in .gitignore?

### Testing
- [ ] Tested on preview URL before merging to main?
- [ ] Auth flow tested end to end?
- [ ] Checked on mobile view?

This checklist is non-negotiable. No PR should be merged without
confirming all relevant items.
