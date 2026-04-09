import Layout from '../components/Layout'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

// ╔══════════════════════════════════════════════════════════════╗
// ║  This page reads stack_items from Supabase.                 ║
// ║  Items are grouped by category: think → design → build →    ║
// ║  test → ship. Add/edit items via the admin panel.           ║
// ║  If Supabase is unreachable, no category sections render.   ║
// ╚══════════════════════════════════════════════════════════════╝

// ── Category render order ──
// Controls the sequence in which category sections appear on the page.
const CATEGORY_ORDER = ['think', 'design', 'build', 'test', 'ship']

// ── Human-readable labels for each category ──
// eyebrow: small label above the heading (JetBrains Mono style)
// heading: larger display heading (Cormorant Garamond style)
const CATEGORY_META = {
  think:  { eyebrow: 'Research & Planning',  heading: 'Think'  },
  design: { eyebrow: 'UI & Visual',          heading: 'Design' },
  build:  { eyebrow: 'Development',          heading: 'Build'  },
  test:   { eyebrow: 'QA & Validation',      heading: 'Test'   },
  ship:   { eyebrow: 'Deployment & Hosting', heading: 'Ship'   },
}

// ── Workflow diagram steps — always hardcoded ──
const WORKFLOW_STEPS = [
  { icon: '🧠', label: 'Claude',    sub: 'Think & design' },
  { arrow: '→' },
  { icon: '✍️', label: 'Write code', sub: 'Files created' },
  { arrow: '→' },
  { icon: '🐙', label: 'GitHub',    sub: 'Push & store' },
  { arrow: '→' },
  { icon: '🚀', label: 'Vercel',    sub: 'Auto-deploy' },
  { arrow: '→' },
  { icon: '🌐', label: 'Live site', sub: 'In ~30 seconds' },
]

// ── Experiments section — always hardcoded (not in DB schema) ──
const EXPERIMENTS = [
  { name: 'Personal Website v1', desc: 'Single HTML landing page. Form connected to Supabase.', status: 'Shipped', link: null },
  { name: 'Personal Website v2', desc: 'Full multi-page Next.js site. This site.', status: 'Live', link: null },
  { name: 'Meeting Request Form', desc: 'Supabase table → RLS policy → live form. Responses in database.', status: 'Live', link: '/connect' },
  { name: 'Substack RSS Mirror', desc: 'Auto-fetching Substack posts and displaying them in custom design via RSS2JSON.', status: 'Live', link: '/thoughts' },
]

// ── Page component ──
// `stackItems` is an array of rows from Supabase, or null if fetch failed.
// Items are grouped by `category` into sections rendered in CATEGORY_ORDER.
// Categories with zero items are skipped entirely.
export default function Stack({ stackItems }) {

  // ── Group DB rows by their category field ──
  // Result: { think: [...], design: [...], build: [...], ... }
  const grouped = {}
  if (stackItems && stackItems.length > 0) {
    stackItems.forEach(item => {
      const cat = (item.category || '').toLowerCase().trim()
      if (!grouped[cat]) grouped[cat] = []
      grouped[cat].push(item)
    })
  }

  return (
    <Layout title="Stack" description="How Navin Oswal builds — tools, learnings, and honest notes from a non-coder building with AI.">

      {/* ── PAGE HEADER ── */}
      <div className="page-header">
        <div className="wrap">
          <p className="eyebrow reveal">How I Build</p>
          <h1 className="sec-h reveal" style={{ fontSize: 'clamp(42px,5vw,72px)' }}>
            The Stack.
          </h1>
          <p className="sec-p reveal">
            A non-coder&apos;s toolkit for building real products. Honest notes on what works,
            what surprised me, and what I&apos;d do differently. Not a tutorial — a practitioner&apos;s log.
          </p>
          <div className="reveal" style={{ marginTop: 20 }}>
            <span className="chip chip-sage">~6 months of AI-assisted building</span>
          </div>
        </div>
      </div>

      {/* ── CATEGORY SECTIONS ── */}
      {/* One section per category, in the order: think → design → build → test → ship. */}
      {/* If a category has no items in the DB, it is skipped entirely.               */}
      {CATEGORY_ORDER.map(cat => {
        const items = grouped[cat]

        // Skip this category if it has no items
        if (!items || items.length === 0) return null

        const meta = CATEGORY_META[cat]

        return (
          <section key={cat} className="section">
            <div className="wrap">

              {/* Category eyebrow + heading */}
              <p className="eyebrow reveal">{meta.eyebrow}</p>
              <h2 className="sec-h reveal" style={{ fontSize: 36 }}>
                {meta.heading}.
              </h2>

              {/* Item grid — two columns on desktop, one on mobile */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 20, marginTop: 40 }}>
                {items.map((item, i) => (
                  <div
                    key={i}
                    className="glass reveal"
                    style={{ padding: '32px 28px', position: 'relative', overflow: 'hidden', transition: 'all 0.3s' }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-4px)'
                      e.currentTarget.style.boxShadow = 'var(--g-shadow-lg)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = ''
                      e.currentTarget.style.boxShadow = ''
                    }}
                  >
                    {/* Sage accent line at top of each card */}
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'var(--sage)', opacity: 0.5 }} />

                    {/* Item name — display heading */}
                    <h3 style={{
                      fontFamily: 'Cormorant Garamond, serif',
                      fontSize: 24,
                      fontWeight: 600,
                      marginBottom: 6,
                    }}>
                      {item.name}
                    </h3>

                    {/* Status badge — shows current usage status (e.g. "Using", "Exploring") */}
                    {item.status && (
                      <div style={{ marginBottom: 14 }}>
                        <span style={{
                          fontFamily: 'JetBrains Mono, monospace',
                          fontSize: 10,
                          letterSpacing: '0.14em',
                          textTransform: 'uppercase',
                          padding: '3px 10px',
                          borderRadius: 100,
                          background: 'rgba(180,83,9,0.08)',
                          color: 'var(--amber)',
                          fontWeight: 600,
                        }}>
                          {item.status}
                        </span>
                      </div>
                    )}

                    {/* Description — what this tool does and how it is used */}
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7 }}>
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )
      })}

      {/* ── THE WORKFLOW — always hardcoded, no DB equivalent ── */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <p className="eyebrow reveal">The Workflow</p>
          <h2 className="sec-h reveal" style={{ fontSize: 36 }}>How it all connects.</h2>
          <div className="glass reveal" style={{ padding: '40px 48px', marginTop: 36 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, flexWrap: 'wrap' }}>
              {WORKFLOW_STEPS.map((item, i) => item.arrow ? (
                <div key={i} style={{ fontSize: 20, color: 'var(--sage)', padding: '0 12px', fontWeight: 300 }}>
                  {item.arrow}
                </div>
              ) : (
                <div key={i} style={{ textAlign: 'center', padding: '8px 20px' }}>
                  <div style={{ fontSize: 28, marginBottom: 4 }}>{item.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{item.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.sub}</div>
                </div>
              ))}
            </div>
            <div style={{
              borderTop: '1px solid rgba(45,106,79,0.1)',
              marginTop: 32,
              paddingTop: 20,
              fontSize: 13,
              color: 'var(--text-muted)',
              lineHeight: 1.7,
              textAlign: 'center',
            }}>
              Supabase sits separately — connected via URL + publishable key. Any page that needs to store
              or retrieve data talks to it directly. No server. No backend code to maintain. Just a database URL in the config.
            </div>
          </div>
        </div>
      </section>

      {/* ── EXPERIMENTS — always hardcoded ── */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <p className="eyebrow reveal">What I&apos;ve Built</p>
          <h2 className="sec-h reveal" style={{ fontSize: 36 }}>Experiments from the playground.</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 36 }}>
            {EXPERIMENTS.map((exp, i) => (
              <div
                key={i}
                className="glass reveal"
                style={{ padding: '20px 28px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', transition: 'all 0.3s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(4px)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = '' }}
              >
                {/* Pulsing dot — green for Live, amber for Shipped */}
                <div style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: exp.status === 'Live' ? 'var(--sage)' : 'var(--amber)',
                  flexShrink: 0,
                  animation: 'pulse 2s infinite',
                }} />
                <div style={{ flex: 1 }}>
                  <span style={{ fontWeight: 600, marginRight: 10 }}>{exp.name}</span>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{exp.desc}</span>
                </div>
                <span style={{
                  fontSize: 11,
                  padding: '3px 12px',
                  borderRadius: 100,
                  background: exp.status === 'Live' ? 'rgba(45,106,79,0.1)' : 'rgba(180,83,9,0.1)',
                  color: exp.status === 'Live' ? 'var(--sage)' : 'var(--amber)',
                  fontWeight: 600,
                }}>
                  {exp.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="section-sm">
        <div className="wrap">
          <div className="glass reveal" style={{ padding: '44px 52px', display: 'flex', gap: 32, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 28, fontWeight: 600, marginBottom: 8 }}>
                Curious about the process?
              </h3>
              <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
                I write about building here — in the context of a non-coder founder navigating the AI engineering world.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', flexShrink: 0 }}>
              <Link href="/thoughts" className="btn-primary">Read my thoughts →</Link>
              <Link href="/connect" className="btn-ghost">Let&apos;s talk ☕</Link>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:0.5;} }
        @media(max-width:860px){
          div[style*="grid-template-columns: repeat(2"]{grid-template-columns:1fr!important;}
        }
      `}</style>
    </Layout>
  )
}

// ── Server-side data fetching ──
// Runs on every request so stack content is always fresh from Supabase.
// Fetches all rows from `stack_items` ordered by display_order ascending.
// Items are grouped by `category` in the component above.
// If fetch fails or table is empty, `stackItems` is null and no
// category sections are rendered (workflow + experiments still show).
export async function getServerSideProps() {
  try {
    // Create Supabase client using env vars (never hardcode keys)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    // Fetch all stack items; select only the fields we need.
    // display_order controls card sequence within each category.
    const { data, error } = await supabase
      .from('stack_items')
      .select('category, name, description, status, display_order')
      .order('display_order', { ascending: true })

    // If Supabase returned an error, log it and pass null to the page
    if (error) {
      console.error('[stack.js] Supabase fetch error:', error.message)
      return { props: { stackItems: null } }
    }

    // data is [] when the table is empty, null when query fails entirely.
    // Pass null in both cases so the component handles it gracefully.
    return { props: { stackItems: data ?? null } }

  } catch (err) {
    // Catch any unexpected errors (network, env var missing, etc.)
    console.error('[stack.js] Unexpected fetch failure:', err.message)
    return { props: { stackItems: null } }
  }
}
