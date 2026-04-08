# SESSION MASTER TEMPLATE — navinoswal.com
### How to use: Copy this file at the start of every new session summary.
### Fill in the [PLACEHOLDERS]. Add new rows to tables. Never delete prior entries.
### Paste the completed summary at the top of your next Claude session.

---

## Cumulative Session Summary — navinoswal.com
### Last updated: [DATE]

---

## Who This Is For
Navin Oswal — CA, Co-Founder of UNITS and UNIVEN, Pune. Non-technical founder
building with AI assistance. All work done via browser (GitHub web UI +
claude.ai/code). No local terminal usage.

---

## Live Details

| Item | Value |
|---|---|
| Live URL (primary) | navinoswal.com |
| Live URL (www) | www.navinoswal.com |
| Legacy URL | nav-in-six.vercel.app |
| GitHub Repo | github.com/namosdev/nav.in |
| Vercel project | nav-in (under namosdev-8998 account) |
| Supabase project | rnphcqjfzhbxchuveuhd.supabase.co |
| Admin email | namos.dev@gmail.com (Supabase Auth + Vercel env only — never in code) |

---

## Tech Stack

```
Next.js 14 (pages router) → GitHub → Vercel (auto-deploy)
                                           ↕
                                  Supabase DB + Auth
                            (multiple tables + magic link)
```

---

## Workflow (Established & Working)

```
Plan in Claude.ai (this chat)
        ↓
Write Claude Code prompt here
        ↓
Paste into claude.ai/code → it creates PR automatically
        ↓
Vercel auto-generates preview URL for that branch
        ↓
Fix any Vercel + Supabase config (checklist below)
        ↓
Test on preview URL
        ↓
Merge PR to main → live site updates
```

---

## Deployment Checklist (Non-negotiable before every merge)

### Vercel
- [ ] New environment variables needed? → Add with All Environments checked
- [ ] Variable NAMES match between .env.local and Vercel exactly?
- [ ] Preview deployment succeeds before merging?

### Supabase
- [ ] New redirect URLs needed? → Add to Authentication → URL Configuration
- [ ] New database tables needed? → Include SQL as standalone block
- [ ] RLS policies needed?
- [ ] Magic link auth still enabled?

### Security
- [ ] Admin access restricted to namos.dev@gmail.com only?
- [ ] No secrets or keys hardcoded in any file?
- [ ] .env.local in .gitignore?

### Testing
- [ ] Tested on preview URL before merging?
- [ ] Auth flow tested end to end?
- [ ] Checked on mobile view?

---

## Vercel Environment Variables

| Variable | Scope |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | All Environments |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | All Environments |
| `NEXT_PUBLIC_ADMIN_EMAIL` | All Environments |

---

## Supabase Redirect URLs (All configured)

| URL |
|---|
| https://nav-in-six.vercel.app/admin/dashboard |
| http://localhost:3000/admin/dashboard |
| https://navinoswal.com/admin/dashboard |
| https://www.navinoswal.com/admin/dashboard |

---

## Design System (Locked)

| Token | Value |
|---|---|
| Primary | Sage `#2d6a4f` / `#52b788` |
| Accent | Amber `#b45309` / `#fbbf24` |
| Secondary | Slate `#1e3a5f` / `#93c5fd` |
| Display font | Cormorant Garamond (serif) |
| Body font | Outfit |
| Label font | JetBrains Mono |
| Style | Glassmorphism · Light · Animated gradient blobs |
| Admin style | Clean minimal · White bg · No glassmorphism |
| Card style | Full-screen dark `#060a09` · Sage/amber · No nav/footer · 67% width desktop · 92% mobile |

---

## Stack Categories (Locked)

Five buckets for `stack_items.category`: **think → design → build → test → ship**

| Tool | Category | Notes |
|---|---|---|
| Claude | think | Planning, reasoning, prompting |
| Lovable.dev | design | UI ideation + rapid prototyping |
| Claude HTML+CSS in chat | design | Immediate visual ideas, no full setup |
| Next.js | build | Frontend framework |
| Supabase | build | Database + auth |
| Vercel | ship | Hosting + auto-deploy |
| GitHub | ship | Version control + deployment pipeline |

---

## Key Principles (Locked — never override without deliberate decision)

| Principle | Detail |
|---|---|
| Table is source of truth | If a field shows on a public page, it lives in the DB. No exceptions. |
| Adaptive not responsive | Separate `/m/` routes per page, not CSS breakpoints. Migration at Phase 3B start. |
| Visiting card is standalone | No auto-redirect, ever. Navigation is always user-initiated. |
| Deployment checklist | Non-negotiable before every merge. |
| `.maybeSingle()` not `.single()` | Supabase queries — graceful null handling. |
| Variable naming discipline | Exact match between `.env.local` and Vercel. One mismatch breaks everything. |
| SQL as standalone block | Never embedded inside Claude Code prompts. Always a separate step. |
| Spec before prompt | All design decisions locked in Claude.ai before Claude Code prompt is written. |
| Conscious by choice | Track time, model, and output per session. Frictionless ≠ free. |

---

## Supabase Tables — Full Status

| Table | Status | Notes |
|---|---|---|
| `meeting_requests` | ✅ | Connect form submissions |
| `now_content` | ✅ | Single row · fetched by /now |
| `ventures` | ✅ | UNITS + UNIVEN rows |
| `stack_items` | ✅ | status column · categories: think/design/build/test/ship |
| `visitor_categories` | ✅ | 5 categories seeded |
| `category_visits` | ✅ | sentiment column live |
| `agent_visits` | ✅ | AI agent auto-log |
| `homepage_widget` | ✅ | Active question live |
| `question_responses` | ✅ | Visitor votes |

---

## Full File Structure (update when files are added)

```
namoswal-site\
├── pages\
│   ├── _app.js
│   ├── index.js           → Home
│   ├── about.js
│   ├── ventures.js        → DB-driven ✅
│   ├── thoughts.js        → Substack RSS
│   ├── now.js             → DB-driven ✅
│   ├── stack.js           → DB-driven ✅
│   ├── connect.js
│   └── admin\
│       ├── index.js       → Magic link login
│       ├── dashboard.js   → Protected dashboard ✅
│       ├── homepage.js    → Question widget admin ✅
│       ├── now.js         → Edit now_content ✅
│       ├── ventures.js    → Edit ventures ✅
│       └── stack.js       → CRUD stack_items ✅
├── pages\api\
│   ├── log-human-visit.js
│   ├── visitor-counts.js
│   ├── question-data.js
│   ├── vote-question.js
│   └── ping.js            → Supabase keepalive ✅
├── components\
│   └── Layout.js
├── styles\
│   └── globals.css
├── public\
│   ├── logos\
│   ├── images\
│   │   ├── Navin_Original-Photo.JPG
│   │   ├── Navin_Social-Share.jpg
│   │   ├── navin-hero.webp
│   │   └── navin-profile-avatar.webp
│   ├── robots.txt
│   └── card\
│       ├── index.html     → Visiting card ✅
│       └── navin-card-print.pdf
├── vercel.json            → cron: /api/ping every 6 days 06:00 UTC ✅
├── CLAUDE.md
├── next.config.js
└── .env.local
```

---

## Build Status — All Phases

```
Phase 1: Auth                          ✅ COMPLETE
Phase 2: DB-Driven Public Pages        ✅ COMPLETE
Domain Migration                       ✅ COMPLETE
Security Hardening                     ✅ COMPLETE
Visiting Card                          ✅ COMPLETE
Visitor + Agent Counter                ✅ COMPLETE
Visitor Widget Redesign                ✅ COMPLETE
Phase 2A: Homepage Enhancements        ✅ COMPLETE
Phase 2B: Mobile Audit                 ✅ COMPLETE (polish parked → Phase 3B)
Bridge: supabase_alive_24X7            ✅ COMPLETE
Substack Drafts                        ✅ COMPLETE (3 stories ready)
Phase 3A: Admin Edit Forms             ✅ COMPLETE

Phase 3B: /m/ Routes + Mobile Polish   ⏳ PENDING
Phase 4: Connect Form                  ⏳ PENDING
```

---

## SESSION RESOURCE LOG

**Philosophy:** AI building is not free. Time, tokens, compute, and carbon go
into every session. Track these consciously — not to feel guilty, but to build
with awareness. *"Conscious by choice. Sustainable by nature."*

**Note on token tracking:** claude.ai does not surface token counts in the UI.
Duration is the honest proxy. Consistent proxies, tracked across sessions, are
directionally true.

| # | Date | Model | Duration | What shipped |
|---|---|---|---|---|
| 1–N | Pre Apr 8, 2026 | Various | Not tracked | All phases up to 2B + Bridge |
| N+1 | Apr 8, 2026 | Claude Sonnet 4.6 | ~2.5 hrs | Phase 3A admin forms · SQL schema changes · Stack categories remapped · Story 3 drafted · Resource Log system introduced · Master template created |
| [N+2] | [DATE] | [MODEL] | [DURATION] | [WHAT SHIPPED] |

**Cumulative (from Apr 8 tracking start):**
Sessions logged: 1 | Total tracked duration: ~2.5 hrs | Model: Claude Sonnet 4.6

---

## Parked Ideas — With Triggers

| Idea | Trigger phrase |
|---|---|
| Fix /stack public page category display bug | *"Fix stack page categories"* |
| Content pipeline: write → draft → hook → publish per channel | *"Let's build the content pipeline."* |
| Autonomous self-improvement loop (after Phase 3 + real data) | *"Let's revisit the autonomous loop."* |
| Story 3 — Personal carbon log for AI building | ✅ Drafted — ready to publish |
| Story 4 — Meta-learning: threaded Claude sessions, cumulative summarization | *"Let's write the session structure story."* |

---

## Pending Items — Priority Order

- [ ] **NEXT:** Phase 3B — /m/ route migration + mobile polish
- [ ] Fix /stack public page category display logic (new categories not rendering)
- [ ] Publish Substack Story 1 + 2 + 3
- [ ] Phase 2B polish carry-ins (card page, About layout, Stack logos, hero tab switcher)
- [ ] Phase 4: Connect form end-to-end testing
- [ ] Update /now page with current content
- [ ] Review all 7 public pages for content edits
- [ ] Test Admin magic link from navinoswal.com
- [ ] Physical card: send print PDF to vendor · confirm QR → navinoswal.com/card
- [ ] Logo fix (waiting for logo files)
- [ ] Button audit (waiting for screenshots)
- [ ] Monitor agent_visits table — first real data ~3 months out
- [ ] Search "Navin Oswal" on Perplexity in ~3 months (tracer phrase check)

---

## How to Use This Template Next Session

1. Copy this entire file
2. Paste at the top of your new Claude session
3. Update "Last updated" date
4. Add a new row to the SESSION RESOURCE LOG
5. Update Build Status for anything completed
6. Move completed pending items to Build Status or remove
7. Add any new parked ideas
8. Save updated file back to project

---
*Template version: Apr 8, 2026 — add version date when structure changes*
