# SESSION MASTER TEMPLATE — navinoswal.com
### How to use: Copy this file at the start of every new session summary.
### Fill in the [PLACEHOLDERS]. Add new rows to tables. Never delete prior entries.
### Paste the completed summary at the top of your next Claude session.

---

## Cumulative Session Summary — navinoswal.com
### Last updated: April 9, 2026

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
| Gemini | think | Sounding board for counter-arguments |
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
| Adaptive not responsive | Separate `/m/` routes per page, not CSS breakpoints. Deliberately postponed to last. |
| Visiting card is standalone | No auto-redirect, ever. Navigation is always user-initiated. |
| Deployment checklist | Non-negotiable before every merge. |
| `.maybeSingle()` not `.single()` | Supabase queries — graceful null handling. |
| Variable naming discipline | Exact match between `.env.local` and Vercel. One mismatch breaks everything. |
| SQL as standalone block | Never embedded inside Claude Code prompts. Always a separate step. |
| Spec before prompt | All design decisions locked in Claude.ai before Claude Code prompt is written. |
| Conscious by choice | Track time, model, and output per session. Frictionless ≠ free. |
| Silent failures are real bugs | Supabase returns nothing when a field name mismatches. Always verify field names against actual table schema before writing fetch logic. |
| Credit originates honestly | Ideas seeded by others are credited by name in the writing. Collaboration with AI is disclosed in every published piece. |

---

## Content System (Locked)

| Item | Value |
|---|---|
| Substack publication | namos.substack.com — "The Origin Story" |
| Active series | Accidental Engineer |
| Series description | Building real things with AI assistance — as a non-technical founder, learning on the go |
| Publish cadence | 3 stories/month · 1 per week after Day 5 |
| AI attribution line | *The experiences and ideas in this piece are entirely my own. The review, articulation, and framing were shaped in collaboration with AI — Claude, specifically. I think that's worth saying clearly.* |
| Distribution channels | Substack (primary) · LinkedIn (hook post) · WhatsApp (broadcast) |
| LinkedIn timing | 9–10am IST on publish day |
| WhatsApp timing | Same day, a few hours after LinkedIn |

---

## April Content Calendar — Accidental Engineer

| Day | Action | Status |
|---|---|---|
| Day 0 | LinkedIn announcement + WhatsApp announcement | ⏳ Ready to post |
| Day 5 | Story 1: Cron job / free stack · LinkedIn hook · WhatsApp | ⏳ Scheduled |
| Day 12 | Story 3: Carbon log · LinkedIn hook · WhatsApp | ⏳ Scheduled |
| Day 19 | Story 2: Visitor counter · LinkedIn hook · WhatsApp · Tag Om Naik | ⏳ Scheduled |

**Note:** Story 1 LinkedIn hook requires filling in actual Supabase Pro price (₹X,000) before posting.

---

## Supabase Tables — Full Status

| Table | Status | Notes |
|---|---|---|
| `meeting_requests` | ✅ | Connect form submissions |
| `now_content` | ✅ | Single row · 4 plain text fields · fetched by /now |
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
│   ├── index.js           → Home — photo bg + avatar + visitor widget + question widget
│   ├── about.js
│   ├── ventures.js        → DB-driven ✅
│   ├── thoughts.js        → Substack RSS
│   ├── now.js             → DB-driven ✅ (4 fields: focused_on/building/reading/thinking)
│   ├── stack.js           → DB-driven ✅ (grouped by category, chip labels live)
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
Phase 3A: Admin Edit Forms             ✅ COMPLETE
DB-Driven Pages Fix (Apr 9)            ✅ COMPLETE
Substack Content — Accidental Engineer ✅ COMPLETE
  → Series named · 3 stories final draft · 6 distribution hooks
  → Announcement posts (LinkedIn + WhatsApp) written
  → AI attribution line standardised across all stories
  → April content calendar locked · Publish sequence: Day 0/5/12/19
  → Om Naik credited in Story 2 for tracer phrase origin

Phase 3B: /m/ Routes + Mobile Polish   ⏳ DELIBERATELY POSTPONED — do last
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
| 1–N | Pre Apr 8, 2026 | Various | Not tracked | All phases up to 2B + Bridge + prior stories |
| N+1 | Apr 8, 2026 | Claude Sonnet 4.6 | ~2.5 hrs | Phase 3A admin forms · SQL schema + category remap · Story 3 drafted · Resource Log system · Master template created |
| N+2 | Apr 9, 2026 | Claude Sonnet 4.6 | ~1.5 hrs | /now + /stack public pages wired to DB · category chips live · silent fetch bugs fixed · /m/ migration deliberately postponed · Building Notes concept scoped and parked |
| N+3 | Apr 9, 2026 | Claude Sonnet 4.6 | ~3 hrs | Accidental Engineer series named · Story 1/2/3 final drafts · AI attribution line · April content calendar · 6 distribution hooks (LinkedIn + WhatsApp) · Announcement posts · Om Naik credit in Story 2 · Pre-launch checklist · Two old Substack posts reviewed for voice reference · Series/publication naming confusion resolved |

**Cumulative (from Apr 8 tracking start):**
Sessions logged: 3 | Total tracked duration: ~7 hrs | Model: Claude Sonnet 4.6

---

## Parked Ideas — With Triggers

| Idea | Trigger phrase |
|---|---|
| /thoughts page upgrade — add "Accidental Engineer" as 4th series tab | *"Thoughts page upgrade"* |
| Substack RSS bucketing — stories auto-assigned to correct series on fetch | *"Fix thoughts bucketing"* |
| Tag two old Substack posts (2023/2024) into Evolving World series | *"Fix thoughts bucketing"* (do in same session) |
| Building Notes / Discoveries page — teaser cards → Substack | *"We have 7 published stories"* |
| Content pipeline: write → draft → hook → publish per channel | *"Let's build the content pipeline."* |
| Autonomous self-improvement loop (after Phase 3 + real data) | *"Let's revisit the autonomous loop."* |
| Story 4 — Meta-learning: threaded Claude sessions, cumulative summarization | *"Let's write the session structure story."* |
| /m/ route migration + mobile polish | *"Mobile is now urgent."* |

---

## Pending Items — Priority Order

- [ ] **NEXT (before Day 0):** Complete pre-launch checklist — see interactive checklist from Apr 9 session
  - [ ] Create Accidental Engineer series on namos.substack.com
  - [ ] Add AI attribution line to Story 1 and Story 3 drafts
  - [ ] Save footer as Substack post template
  - [ ] Paste + schedule all 3 stories in Substack (tag as Accidental Engineer)
  - [ ] Fill in actual Supabase Pro price in Story 1 LinkedIn hook
  - [ ] Verify Substack → /thoughts RSS feed pulling correctly
  - [ ] Update /now page content via admin
  - [ ] Review all 7 public pages for stale content
  - [ ] Test navinoswal.com on mobile
- [ ] **Day 0:** Post LinkedIn announcement (9–10am IST) + WhatsApp broadcast
- [ ] **Day 19:** Tag Om Naik on LinkedIn when Story 2 posts
- [ ] Phase 4: Connect form end-to-end testing
- [ ] Phase 2B polish carry-ins: card page · About layout · Stack logos · hero tab switcher
- [ ] Test Admin magic link from navinoswal.com
- [ ] Physical card: send print PDF to vendor · confirm QR → navinoswal.com/card
- [ ] Logo fix (waiting for logo files)
- [ ] Button audit (waiting for screenshots)
- [ ] Monitor agent_visits table — first real data ~3 months out
- [ ] Search "Navin Oswal" on Perplexity in ~3 months (tracer phrase check)
- [ ] Phase 3B: /m/ routes + mobile polish — deliberately last

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
*Template version: Apr 9, 2026 — Content System section added · April calendar added · Key Principles updated*
