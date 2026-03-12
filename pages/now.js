import Layout from '../components/Layout'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

// ╔══════════════════════════════════════════════════════════════╗
// ║  This page now reads content from Supabase (now_content).   ║
// ║  Edit content via the admin panel, not this file.           ║
// ║  If Supabase is unreachable, hardcoded fallback is shown.   ║
// ╚══════════════════════════════════════════════════════════════╝

// ── Hardcoded fallback content ──
// Used if the Supabase fetch fails or the table has no data yet.
const FALLBACK = {
  lastUpdated: 'March 2026',

  building: [
    {
      title: 'UNITS — Real Estate CRM',
      detail: 'Deep in the 0→1 phase. 4 real estate developers live, 2.5 lakh users being served. Current focus: hardening the core sales pipeline flows before adding more modules to BasalOS.',
      link: 'https://sayunits.com',
      status: 'active',
    },
    {
      title: 'UNIVEN — Business Credentials',
      detail: 'Under active development. Final push before going live. The trust infrastructure layer I\'ve been building toward for the last 2 years.',
      link: 'https://univen.co',
      status: 'launching',
    },
    {
      title: 'This Website',
      detail: 'Rebuilding my personal site properly — from a landing page to a full multi-page presence. Learning Next.js in the process. Using Claude + Vercel + GitHub + Supabase as the stack.',
      status: 'active',
    },
  ],

  learning: [
    {
      topic: 'Next.js & React',
      detail: 'Moving from plain HTML to proper component-based frontend architecture. Understanding how the AI engineering world actually builds. This site is the first real project.',
    },
    {
      topic: 'Product-Market Fit conversations',
      detail: 'Having direct conversations with UNITS customers about what "simple" really means to a real estate sales team. Unlearning assumptions I built up over 10 years of being on the other side.',
    },
    {
      topic: 'AI-assisted building',
      detail: 'Claude as a thinking partner and builder — not just a code generator. Learning how to structure prompts that produce production-quality output from a non-coder\'s perspective.',
    },
  ],

  reading: {
    title: 'Thinking in Bets — Annie Duke',
    note: 'Revisiting this for the third time. Every failed attempt I\'ve had was partly a decision quality problem, not just an execution problem. This book frames it clearly.',
  },

  testing: {
    hypothesis: 'Domain expertise + AI tooling = a structural competitive moat for no-code founders in niche markets.',
    detail: 'The bet: someone who understands real estate finance deeply and can now build software using AI tools will consistently out-build a pure software team that\'s learning real estate. Testing this in real time with UNITS.',
  },

  currentQuestion: 'When does simplicity become a constraint and complexity become a feature? Where is that line in a product — and who decides?',
}

// ── Badge colours for building status ──
const statusColors = {
  active:    { bg: 'rgba(45,106,79,0.1)',   color: 'var(--sage)',       label: 'Active' },
  launching: { bg: 'rgba(180,83,9,0.1)',    color: 'var(--amber)',      label: 'Launching Soon' },
  paused:    { bg: 'rgba(100,116,139,0.1)', color: 'var(--text-muted)', label: 'Paused' },
}

// ── Page component ──
// Props are populated by getServerSideProps below.
// If Supabase is unreachable, they fall back to the FALLBACK object above.
export default function Now({ lastUpdated, building, learning, reading, testing, currentQuestion }) {
  return (
    <Layout title="Now" description="What Navin Oswal is focused on right now — updated monthly.">

      <div className="page-header">
        <div className="wrap">
          <p className="eyebrow reveal">What I&apos;m Doing Now</p>
          <h1 className="sec-h reveal" style={{ fontSize: 'clamp(42px,5vw,72px)' }}>
            Right now.
          </h1>
          <div className="reveal" style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 8, flexWrap: 'wrap' }}>
            <p className="sec-p" style={{ margin: 0 }}>
              A snapshot of what&apos;s occupying my attention.
            </p>
            {/* Last updated badge — sourced from updated_at in Supabase */}
            <span style={{
              fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.15em',
              padding: '5px 14px', borderRadius: 100, textTransform: 'uppercase',
              background: 'rgba(45,106,79,0.1)', color: 'var(--sage)',
            }}>Updated {lastUpdated}</span>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 12, fontStyle: 'italic' }}>
            Inspired by Derek Sivers&apos; /now movement — a page for what&apos;s actually happening, not just what looks good.
          </p>
        </div>
      </div>

      {/* ── BUILDING ── */}
      <section className="section">
        <div className="wrap">
          <p className="eyebrow reveal">Building</p>
          <h2 className="sec-h reveal" style={{ fontSize: 36 }}>What I&apos;m working on.</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 36 }}>
            {building.map((item, i) => {
              const s = statusColors[item.status] || statusColors.active
              return (
                <div key={i} className="glass reveal" style={{ padding: '28px 32px', display: 'flex', gap: 20, alignItems: 'flex-start', transition: 'all 0.3s' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateX(4px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = ''}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, marginTop: 7, flexShrink: 0, animation: 'pulse 2s infinite' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
                      <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 22, fontWeight: 600 }}>{item.title}</h3>
                      <span style={{ fontSize: 11, padding: '3px 12px', borderRadius: 100, background: s.bg, color: s.color, fontWeight: 600 }}>{s.label}</span>
                    </div>
                    <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7 }}>{item.detail}</p>
                    {item.link && (
                      <a href={item.link} target="_blank" rel="noopener" style={{ fontSize: 13, fontWeight: 600, color: 'var(--sage)', marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                        {item.link.replace('https://', '')} ↗
                      </a>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── LEARNING ── */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <p className="eyebrow reveal">Learning</p>
          <h2 className="sec-h reveal" style={{ fontSize: 36 }}>What I&apos;m picking up.</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginTop: 36 }}>
            {learning.map((item, i) => (
              <div key={i} className="glass reveal" style={{ padding: '28px 24px', transition: 'all 0.3s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                onMouseLeave={e => e.currentTarget.style.transform = ''}>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--amber)', marginBottom: 10 }}>Learning #{i + 1}</div>
                <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20, fontWeight: 600, marginBottom: 10 }}>{item.topic}</h3>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7 }}>{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── READING + TESTING ── */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

            <div className="glass reveal" style={{ padding: '36px 32px' }}>
              <p className="eyebrow" style={{ marginBottom: 16 }}>Reading</p>
              <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 24, fontWeight: 600, marginBottom: 14, color: 'var(--sage)' }}>
                📚 {reading.title}
              </h3>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.75 }}>{reading.note}</p>
            </div>

            <div className="glass reveal" style={{ padding: '36px 32px' }}>
              <p className="eyebrow" style={{ marginBottom: 16 }}>Testing a Hypothesis</p>
              <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 18, fontStyle: 'italic', fontWeight: 600, color: 'var(--slate)', marginBottom: 14, lineHeight: 1.4 }}>
                &ldquo;{testing.hypothesis}&rdquo;
              </p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.75 }}>{testing.detail}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CURRENT QUESTION ── */}
      <section className="section-sm">
        <div className="wrap">
          <div className="glass reveal" style={{
            padding: '52px 60px', textAlign: 'center',
            background: 'linear-gradient(135deg,rgba(45,106,79,0.04),rgba(180,83,9,0.04))',
            border: '1px solid rgba(45,106,79,0.1)',
          }}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: '0.25em', color: 'var(--sage)', textTransform: 'uppercase', marginBottom: 20 }}>The Question Occupying My Mind</div>
            <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(20px,2.5vw,30px)', lineHeight: 1.5, fontStyle: 'italic', maxWidth: 640, margin: '0 auto 28px', color: 'var(--text)' }}>
              &ldquo;{currentQuestion}&rdquo;
            </p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              If you have a perspective on this — <Link href="/connect" style={{ color: 'var(--sage)', fontWeight: 600 }}>I&apos;d love to hear it. ☕</Link>
            </p>
          </div>
        </div>
      </section>

      {/* ── HOW TO UPDATE ── */}
      <section className="section-sm">
        <div className="wrap">
          <div className="reveal" style={{ padding: '28px 32px', borderRadius: 16, background: 'rgba(45,106,79,0.05)', border: '1px dashed rgba(45,106,79,0.2)' }}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--sage)', marginBottom: 8 }}>Developer Note</div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7 }}>
              To update this page: use the{' '}
              <code style={{ background: 'rgba(45,106,79,0.08)', padding: '2px 6px', borderRadius: 4, fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>admin panel</code>{' '}
              to edit the{' '}
              <code style={{ background: 'rgba(45,106,79,0.08)', padding: '2px 6px', borderRadius: 4, fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>now_content</code>{' '}
              table in Supabase. Changes go live immediately — no code deployment needed.
            </p>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:0.5;} }
        @media(max-width:860px){
          div[style*="grid-template-columns: repeat(3"]{grid-template-columns:1fr!important;}
          div[style*="grid-template-columns: 1fr 1fr"]{grid-template-columns:1fr!important;}
        }
      `}</style>
    </Layout>
  )
}

// ── Server-side data fetching ──
// Runs on every page request (not cached) so content is always fresh.
// Tries to read from the `now_content` table in Supabase.
// If anything goes wrong (network error, table missing, no row) it returns
// the FALLBACK object above so the page always renders correctly.
export async function getServerSideProps() {
  try {
    // Create Supabase client using env vars (never hardcode keys)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    // Fetch the single content row from now_content.
    // .maybeSingle() returns { data: null, error: null } when the table has
    // no rows — safe fallback. .single() would throw PGRST116 (500 error).
    const { data, error } = await supabase
      .from('now_content')
      .select('focus_text, building, reading, thinking, updated_at')
      .maybeSingle()

    // If Supabase returned an error or no row, use hardcoded fallback
    if (error || !data) {
      return { props: { ...FALLBACK } }
    }

    // Format the updated_at timestamp to a human-readable "Month Year" string
    // e.g. "2026-03-01T00:00:00Z" → "March 2026"
    const lastUpdated = data.updated_at
      ? new Date(data.updated_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      : FALLBACK.lastUpdated

    // Map Supabase fields to the props the component expects.
    // The `thinking` JSONB column holds both learning items and the testing
    // hypothesis: { learning: [...], testing: { hypothesis, detail } }
    return {
      props: {
        lastUpdated,
        building:        data.building            ?? FALLBACK.building,
        reading:         data.reading             ?? FALLBACK.reading,
        learning:        data.thinking?.learning  ?? FALLBACK.learning,
        testing:         data.thinking?.testing   ?? FALLBACK.testing,
        currentQuestion: data.focus_text          ?? FALLBACK.currentQuestion,
      },
    }
  } catch (err) {
    // Catch any unexpected errors (e.g. env vars missing in dev) and fall back
    console.error('[now.js] Supabase fetch failed, using fallback:', err.message)
    return { props: { ...FALLBACK } }
  }
}
