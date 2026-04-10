import Layout from '../components/Layout'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

// ╔══════════════════════════════════════════════════════════════╗
// ║  This page reads content from the `now_content` Supabase    ║
// ║  table. Edit content via the admin panel, not this file.    ║
// ║  If Supabase is unreachable, hardcoded fallback is shown.   ║
// ╚══════════════════════════════════════════════════════════════╝

// ── Hardcoded fallback content ──
// Used when the Supabase fetch fails or the table has no row yet.
// All four fields are plain text — the admin panel will write to them.
const FALLBACK = {
  lastUpdated: 'March 2026',
  focus_text:  'Content coming soon — check back after the next update.',
  building:    'Content coming soon — check back after the next update.',
  reading:     'Content coming soon — check back after the next update.',
  thinking:    'Content coming soon — check back after the next update.',
}

// ── Page component ──
// Receives four plain-text strings from getServerSideProps (or fallback).
export default function Now({
  lastUpdated = FALLBACK.lastUpdated,
  focus_text  = FALLBACK.focus_text,
  building    = FALLBACK.building,
  reading     = FALLBACK.reading,
  thinking    = FALLBACK.thinking,
}) {
  return (
    <Layout title="Now" description="What Navin Oswal is focused on right now — updated monthly.">

      {/* ── PAGE HEADER ── */}
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
            {/* Last-updated badge — value comes from updated_at in Supabase */}
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

      {/* ── FOCUSED ON ── */}
      {/* Displays the `focus_text` text field from now_content */}
      <section className="section">
        <div className="wrap">
          <p className="eyebrow reveal">Focused On</p>
          <h2 className="sec-h reveal" style={{ fontSize: 36 }}>What has my attention.</h2>
          <div className="glass reveal" style={{ padding: '36px 40px', marginTop: 36 }}>
            <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.85, whiteSpace: 'pre-line' }}>
              {focus_text}
            </p>
          </div>
        </div>
      </section>

      {/* ── BUILDING ── */}
      {/* Displays the `building` text field from now_content */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <p className="eyebrow reveal">Building</p>
          <h2 className="sec-h reveal" style={{ fontSize: 36 }}>What I&apos;m working on.</h2>
          <div className="glass reveal" style={{ padding: '36px 40px', marginTop: 36 }}>
            <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.85, whiteSpace: 'pre-line' }}>
              {building}
            </p>
          </div>
        </div>
      </section>

      {/* ── READING ── */}
      {/* Displays the `reading` text field from now_content */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <p className="eyebrow reveal">Reading</p>
          <h2 className="sec-h reveal" style={{ fontSize: 36 }}>What I&apos;m reading.</h2>
          <div className="glass reveal" style={{ padding: '36px 40px', marginTop: 36 }}>
            <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.85, whiteSpace: 'pre-line' }}>
              {reading}
            </p>
          </div>
        </div>
      </section>

      {/* ── THINKING ── */}
      {/* Displays the `thinking` text field from now_content */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <p className="eyebrow reveal">Thinking</p>
          <h2 className="sec-h reveal" style={{ fontSize: 36 }}>What&apos;s on my mind.</h2>
          <div className="glass reveal" style={{ padding: '36px 40px', marginTop: 36 }}>
            <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.85, whiteSpace: 'pre-line' }}>
              {thinking}
            </p>
          </div>
        </div>
      </section>

      {/* ── CONNECT CTA ── */}
      <section className="section-sm">
        <div className="wrap">
          <div className="glass reveal" style={{
            padding: '52px 60px', textAlign: 'center',
            background: 'linear-gradient(135deg,rgba(45,106,79,0.04),rgba(180,83,9,0.04))',
            border: '1px solid rgba(45,106,79,0.1)',
          }}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: '0.25em', color: 'var(--sage)', textTransform: 'uppercase', marginBottom: 20 }}>
              Have a thought?
            </div>
            <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(20px,2.5vw,28px)', lineHeight: 1.5, fontStyle: 'italic', maxWidth: 540, margin: '0 auto 28px', color: 'var(--text)' }}>
              If anything here resonates — I&apos;d love to hear your perspective.
            </p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              <Link href="/connect" style={{ color: 'var(--sage)', fontWeight: 600 }}>
                Let&apos;s talk. ☕
              </Link>
            </p>
          </div>
        </div>
      </section>

    </Layout>
  )
}

// ── Server-side data fetching ──
// Runs on every page request so content is always fresh.
// Reads the single row from `now_content` in Supabase.
// Falls back to FALLBACK constants if anything goes wrong.
export async function getServerSideProps() {
  try {
    // Create Supabase client using env vars (never hardcode keys)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    // Fetch the one content row.
    // .maybeSingle() safely returns null when no row exists (no error thrown).
    const { data, error } = await supabase
      .from('now_content')
      .select('focus_text, building, reading, thinking, updated_at')
      .maybeSingle()

    // If Supabase returned an error or the table is empty, use fallback
    if (error || !data) {
      return { props: { ...FALLBACK } }
    }

    // Format updated_at → "Month Year" (e.g. "April 2026")
    const lastUpdated = data.updated_at
      ? new Date(data.updated_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      : FALLBACK.lastUpdated

    // Return each text field, falling back to the FALLBACK string if the
    // field is null/empty so the page never shows a blank section.
    return {
      props: {
        lastUpdated,
        focus_text: data.focus_text || FALLBACK.focus_text,
        building:   data.building   || FALLBACK.building,
        reading:    data.reading    || FALLBACK.reading,
        thinking:   data.thinking   || FALLBACK.thinking,
      },
    }
  } catch (err) {
    // Catch unexpected errors (e.g. missing env vars in dev) and fall back
    console.error('[now.js] Supabase fetch failed, using fallback:', err.message)
    return { props: { ...FALLBACK } }
  }
}
