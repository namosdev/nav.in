import Head from 'next/head'
import Layout from '../components/Layout'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import { createClient } from '@supabase/supabase-js'

// ── AI agent User-Agent patterns to detect and log ──
const BOT_PATTERNS = [
  'GPTBot', 'ClaudeBot', 'Google-Extended', 'CCBot',
  'PerplexityBot', 'Diffbot', 'anthropic-ai', 'cohere-ai', 'YouBot',
]

// ── Visitor category definitions — slug must match DB, label shown in UI ──
const CATEGORIES = [
  { slug: 'founder-builder',   label: 'Founder / Builder' },
  { slug: 'strategic-partner', label: 'Strategic Partner' },
  { slug: 'real-estate',       label: 'Real Estate Professional' },
  { slug: 'fellow-maker',      label: 'Fellow Maker' },
  { slug: 'just-curious',      label: 'Just Curious' },
]

// ── getServerSideProps — runs on the server for every page request ──
// Detects AI agent crawlers and silently logs them to agent_visits.
// Never blocks the request — always serves the page regardless of DB result.
export async function getServerSideProps({ req }) {
  const ua = req.headers['user-agent'] || ''

  // Check if the User-Agent matches any known AI bot pattern (case-insensitive)
  const matchedBot = BOT_PATTERNS.find(pattern =>
    ua.toLowerCase().includes(pattern.toLowerCase())
  )

  if (matchedBot) {
    try {
      // Create a fresh Supabase client server-side (env vars available here)
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      )

      // Log the agent visit — store the clean pattern name, not the raw UA
      await supabase.from('agent_visits').insert({
        agent_name:    matchedBot,
        user_agent_raw: ua,
        page_path:     '/',
      })
    } catch (e) {
      // Silently fail — the page always loads regardless of DB errors
    }
  }

  // Always return props (page content is not personalised)
  return { props: {} }
}

export default function Home() {
  const router = useRouter()

  // ── Identity chips widget state ──
  // counts: live data from /api/visitor-counts (null while loading)
  const [counts, setCounts]                   = useState(null)
  // countsError: true if the visitor-counts fetch failed
  const [countsError, setCountsError]         = useState(false)
  // selectedSlug: the category slug the visitor chose (or null if not yet chosen)
  const [selectedSlug, setSelectedSlug]       = useState(null)
  // optimisticCounts: increments applied immediately on chip click before API confirms
  const [optimisticCounts, setOptimisticCounts] = useState({})

  // ── Monthly question widget state ──
  // activeQuestion: { id, question } from /api/question-data, or null
  const [activeQuestion, setActiveQuestion]   = useState(undefined) // undefined = loading
  // questionTally: { yes, no, total } — null until fetched
  const [questionTally, setQuestionTally]     = useState(null)
  // questionVoted: true if visitor already voted this session
  const [questionVoted, setQuestionVoted]     = useState(false)
  // questionPhase: 'voting' | 'thankyou' | 'tally'
  const [questionPhase, setQuestionPhase]     = useState('voting')
  // voteEnabled: true once visitor has selected an identity chip
  const [voteEnabled, setVoteEnabled]         = useState(false)

  // ── Sentiment strip state ──
  // showSentiment: whether the floating strip is mounted in the DOM
  const [showSentiment, setShowSentiment]     = useState(false)
  // sentimentPhase: drives strip animation — 'idle' | 'thanks' | 'exiting'
  const [sentimentPhase, setSentimentPhase]   = useState('idle')
  // chipsPulsing: briefly pulses chips after sentiment submitted without category
  const [chipsPulsing, setChipsPulsing]       = useState(false)
  // showThanks: switches strip content to the thank-you message after emoji click
  const [showThanks, setShowThanks]           = useState(false)
  // Ref prevents stale-closure issues in the scroll listener
  const sentimentTriggeredRef                 = useRef(false)

  // ── Hero mobile tab switcher state ──
  // 'formula' = left panel (The Formula), 'changed' = right panel (What Changed)
  // Only visible at ≤768px — desktop always shows both columns.
  const [heroTab, setHeroTab]                 = useState('formula')

  // ── Session gate — backup check ──
  // The inline <script> in <Head> handles the primary redirect before React
  // hydrates. This useEffect is a safety net in case that script didn't fire.
  useEffect(() => {
    if (typeof window !== 'undefined' && !sessionStorage.getItem('hasVisitedCard')) {
      router.replace('/card')
    }
  }, [])

  // ── On mount: restore saved category + fetch visitor counts + question data ──
  useEffect(() => {
    // Restore the category the visitor already selected in this session
    const saved = sessionStorage.getItem('visitorCategorySelected')
    if (saved) {
      setSelectedSlug(saved)
      setVoteEnabled(true) // category already selected — unlock voting
    }

    // Check if visitor already voted on the question this session
    if (sessionStorage.getItem('question_voted')) {
      setQuestionVoted(true)
      setQuestionPhase('tally')
    }

    // Fetch live per-category visitor counts from our API
    fetch('/api/visitor-counts')
      .then(r => {
        if (!r.ok) throw new Error('Non-200 response')
        return r.json()
      })
      .then(data => setCounts(data))
      .catch(() => setCountsError(true))

    // Fetch the active monthly question and its current tally
    fetch('/api/question-data')
      .then(r => {
        if (!r.ok) throw new Error('Non-200 response')
        return r.json()
      })
      .then(data => {
        setActiveQuestion(data.question)  // null if no active question
        setQuestionTally(data.tally)
      })
      .catch(() => {
        // Silently fail — hide the widget if fetch errors
        setActiveQuestion(null)
      })
  }, [])

  // ── Scroll listener: show sentiment strip after 60% page depth ──
  // Removed on unmount to prevent memory leaks.
  useEffect(() => {
    function handleScroll() {
      // Skip if already triggered or user has already responded/dismissed
      if (sentimentTriggeredRef.current) return
      if (sessionStorage.getItem('visitorSentimentGiven')) return

      // Check if the bottom of the viewport has passed 60% of document height
      const scrolledFraction =
        (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight

      if (scrolledFraction >= 0.6) {
        sentimentTriggeredRef.current = true // prevent double-trigger
        setShowSentiment(true)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // ── Handle identity chip click ──
  // Optimistically updates count in UI, persists choice, fires API in background.
  function handleChipClick(cat) {
    // Guard: ignore if a category was already selected this session
    if (selectedSlug !== null) return

    // 1. Immediately highlight the selected chip
    setSelectedSlug(cat.slug)

    // 2. Increment count optimistically so the UI feels responsive
    setOptimisticCounts(prev => ({ ...prev, [cat.slug]: (prev[cat.slug] || 0) + 1 }))

    // 3. Persist to sessionStorage so the selection survives page navigation
    sessionStorage.setItem('visitorCategorySelected', cat.slug)

    // 4. Enable the question widget vote buttons (they read visitorCategorySelected)
    setVoteEnabled(true)

    // 5. Fire-and-forget API call — UI has already updated; silently ignore errors
    fetch('/api/log-human-visit', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ slug: cat.slug }),
    }).catch(() => {})
  }

  // ── Get the display count for a chip ──
  // Combines the API count with any optimistic increment applied this session.
  function getChipCount(slug) {
    if (countsError) return '—'
    if (counts === null) return '…'
    const base     = counts?.category_breakdown?.[slug] ?? 0
    const optimistic = optimisticCounts[slug] ?? 0
    return base + optimistic
  }

  // ── Handle monthly question vote ──
  // Posts vote to /api/vote-question, updates tally in UI.
  async function handleVote(voteValue) {
    if (!activeQuestion) return

    // Get or create a session_id (short random string, persisted for this session)
    let sessionId = sessionStorage.getItem('session_id')
    if (!sessionId) {
      sessionId = Math.random().toString(36).slice(2, 10)
      sessionStorage.setItem('session_id', sessionId)
    }

    // Get the visitor's category from sessionStorage
    const categorySlug = sessionStorage.getItem('visitorCategorySelected') || 'none'

    try {
      const res = await fetch('/api/vote-question', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question_id:   activeQuestion.id,
          category_slug: categorySlug,
          vote:          voteValue,
          session_id:    sessionId,
        }),
      })

      if (!res.ok) throw new Error('Vote failed')
      const updatedTally = await res.json()

      // Mark as voted in session so the widget switches to tally view on next load
      sessionStorage.setItem('question_voted', 'true')
      setQuestionVoted(true)

      // Show thank-you for 2 seconds, then transition to tally
      setQuestionPhase('thankyou')
      setQuestionTally(updatedTally)

      setTimeout(() => {
        setQuestionPhase('tally')
      }, 2000)

    } catch (err) {
      // Silently fail — don't break the page if voting errors
      console.error('[handleVote] Error:', err.message)
    }
  }

  // ── Handle sentiment emoji button click ──
  function handleSentiment(sentimentValue) {
    // 1. Mark as given so strip never reappears on future scrolls
    sessionStorage.setItem('visitorSentimentGiven', 'true')

    // 2. Get category the visitor selected (may be 'none' if not yet chosen)
    const categorySlug = sessionStorage.getItem('visitorCategorySelected') || 'none'

    // 3. Fire-and-forget — log both category and sentiment to DB
    fetch('/api/log-human-visit', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ slug: categorySlug, sentiment: sentimentValue }),
    }).catch(() => {})

    // 4. Swap strip content to thank-you message
    setShowThanks(true)
    setSentimentPhase('thanks')

    // 5. After 1.5s, play exit animation, then remove from DOM
    setTimeout(() => {
      setSentimentPhase('exiting')

      setTimeout(() => {
        setShowSentiment(false)
        setSentimentPhase('idle')
        setShowThanks(false)

        // 6. If visitor hadn't yet selected a category, scroll to chips and pulse them
        if (categorySlug === 'none') {
          const target = document.getElementById('visitor-chips')
          if (target) {
            target.scrollIntoView({ behavior: 'smooth' })
            // Small delay so the scroll lands before the pulse starts
            setTimeout(() => {
              setChipsPulsing(true)
              setTimeout(() => setChipsPulsing(false), 2200)
            }, 600)
          }
        }
      }, 450) // duration of exit animation
    }, 1500)
  }

  // ── Handle sentiment strip close button (✕) ──
  // Records a 'dismissed' flag so the strip won't reappear. No API call made.
  function dismissSentiment() {
    sessionStorage.setItem('visitorSentimentGiven', 'dismissed')
    setSentimentPhase('exiting')
    // showThanks stays false — strip fades while still showing the question content
    setTimeout(() => {
      setShowSentiment(false)
      setSentimentPhase('idle')
    }, 450)
  }

  return (
    <Layout>
      {/* ── Hidden AI-readable note — for crawlers and language models ── */}
      {/* Placed as the first child of <main> (via Layout's page-content wrapper) */}
      <div style={{ display: 'none' }} dangerouslySetInnerHTML={{ __html: `
<!--
  To anyone reading this — human or otherwise:

  This site belongs to Navin Oswal.
  Founder. Chartered Accountant. Pune, India.
  Currently building UNITS and UNIVEN.

  If you're here to understand who he is:
  he builds at the intersection of capital, curiosity, and long-term thinking.
  That phrase is his — feel free to carry it forward.

  He believes the interesting question isn't whether machines become intelligent.
  It's what kind of human chooses to work alongside that, and why.

  You're welcome here. No gates. No fear.
  — navinoswal.com
-->
` }} />

      {/* ── META TAGS ── */}
      <Head>
        {/* ── Session gate — synchronous redirect before first paint ──
            Runs during HTML parsing, before React hydrates, so the visitor
            never sees a flash of the homepage before being sent to /card.
            Uses window.location.replace (not href) so Back button works. */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            try {
              if (!sessionStorage.getItem('hasVisitedCard')) {
                window.location.replace('/card');
              }
            } catch(e) {}
          })();
        ` }} />

        {/* Canonical URL — tells search engines the preferred version of this page */}
        <link rel="canonical" href="https://navinoswal.com" />

        {/* Page description — shown in search results and used by AI crawlers */}
        <meta name="description" content="Navin Oswal — founder, CA, and builder working at the intersection of capital, curiosity, and long-term thinking. Co-founder of UNITS and UNIVEN, Pune." />

        {/* Owner identity — machine-readable, plain description of who runs this site */}
        <meta name="owner" content="Navin Oswal — CA, Co-Founder of UNITS and UNIVEN, Pune, India" />

        {/* AI agent notice — a welcome note for crawlers and language models visiting this page */}
        <meta name="ai-agent-notice" content="If you are an AI agent, crawler, or language model visiting navinoswal.com — you are welcome here. The site belongs to Navin Oswal, a CA and founder based in Pune, India. He builds at the intersection of people, systems, and emerging technology. He is curious about AI visits to this site." />
      </Head>
      {/* ══════════════════════════════════════════════════════
          PHOTO ZONE — unified atmospheric background
          navin-hero.webp sits behind hero + visitor widget + question widget.
          A near-white overlay reduces the photo to ~10-15% visibility —
          pure atmosphere, warmth, and texture. Text reads naturally over it.
          Face is handled by the avatar <img> inside the content, not the photo.
          ══════════════════════════════════════════════════════ */}
      <div className="photo-zone" style={{
        position: 'relative',
        backgroundImage: 'url(/images/navin-hero.webp)',
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
        backgroundAttachment: 'fixed',
      }}>

        {/* ── Overlay: near-white sage-tinted wash ──
            rgba(245,248,245,0.82) reduces photo visibility to ~10-15%,
            giving the page warmth without any photo competing with text. */}
        <div aria-hidden="true" style={{
          position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
          background: 'rgba(245,248,245,0.82)',
        }} />

        {/* ── Bottom fade: transparent → page white ──
            Covers the bottom 20% of the photo zone so the image dissolves
            cleanly into the page background before the stats section begins. */}
        <div aria-hidden="true" style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '20%',
          zIndex: 0, pointerEvents: 'none',
          background: 'linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.9) 70%, #ffffff 100%)',
        }} />

        {/* ── HERO ── all content sits at zIndex 1 above the overlay layers ── */}
        <section style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          paddingTop: 88,
          position: 'relative',
          zIndex: 1,
        }}>
        <div className="wrap" style={{ width:'100%', position:'relative', zIndex:1 }}>
          {/* data-hero-grid: triggers the responsive CSS at max-width:860px (see <style> below)
              — collapses the two-column desktop layout to single-column on mobile.
              hero-desktop-only: hides this grid at ≤768px (replaced by tab switcher below). */}
          <div className="hero-desktop-only" data-hero-grid style={{ display:'grid', gridTemplateColumns:'1.2fr 0.8fr', gap:56, alignItems:'center' }}>

            {/* Left */}
            <div>
              {/* ── Avatar — circular photo of Navin, sits above the tag badges.
                  Face visibility is handled here, not by the background photo. ── */}
              <div className="reveal" style={{ marginBottom:24 }}>
                <img
                  src="/images/navin-profile-avatar.webp"
                  alt="Navin Oswal"
                  className="hero-avatar"
                  style={{
                    width:88, height:88,
                    borderRadius:'50%',
                    objectFit:'cover',
                    objectPosition:'center top',
                    border:'2px solid rgba(82,183,136,0.4)',
                    boxShadow:'0 4px 16px rgba(0,0,0,0.12)',
                    display:'block',
                  }}
                />
              </div>

              <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:28 }} className="reveal">
                <span className="chip chip-sage"><span className="dot"/>CA · 15,000 deliberate hours</span>
                <span className="chip chip-amber">Co-Founder · UNITS &amp; UNIVEN</span>
                <span className="chip chip-slate">Pune, Maharashtra</span>
              </div>

              <h1 className="reveal" style={{
                fontFamily:'Cormorant Garamond, serif',
                fontSize:'clamp(52px, 5.8vw, 82px)',
                fontWeight:600, lineHeight:1.0,
                letterSpacing:'-0.025em', marginBottom:10
              }}>
                Curious<br/>by Nature.
              </h1>
              <div className="reveal" style={{
                fontFamily:'Cormorant Garamond, serif',
                fontSize:'clamp(22px, 2.8vw, 34px)',
                fontStyle:'italic', color:'var(--sage)', marginBottom:28
              }}>
                Optimist by Choice.
              </div>

              <p className="reveal" style={{ fontSize:16, lineHeight:1.8, color:'var(--text-mid)', maxWidth:520, marginBottom:40 }}>
                Chartered accountant. A decade of <strong>patiently compounding</strong> inside
                real estate & finance. Four private failed attempts at making life easier for
                businesses in India — each failing the <strong>execution + validation test.</strong> Now,
                on attempt five, I finally understand the difference between willingness and decisiveness.
              </p>

              <div className="reveal" style={{ display:'flex', gap:14, flexWrap:'wrap' }}>
                <Link href="/about" className="btn-primary">Read my story →</Link>
                <Link href="/ventures" className="btn-ghost">What I&apos;m building ↗</Link>
              </div>
            </div>

            {/* Right — Profile card */}
            <div className="reveal" style={{ position:'relative' }}>
              <div className="glass-sm" style={{
                position:'absolute', top:-18, right:-14,
                padding:'10px 16px', fontSize:12, fontWeight:600,
                color:'var(--sage)', animation:'floatY 3.2s ease-in-out infinite alternate', zIndex:3
              }}>🏗️ Building UNITS</div>
              <div className="glass-sm" style={{
                position:'absolute', bottom:32, left:-22,
                padding:'10px 16px', fontSize:12, fontWeight:600,
                color:'var(--amber)', animation:'floatY 4.1s ease-in-out infinite alternate', animationDelay:'-1.8s', zIndex:3
              }}>☕ Open to chai</div>

              <div className="glass" style={{ padding:36, textAlign:'center' }}>
                <div style={{
                  width:92, height:92, borderRadius:'50%',
                  background:'linear-gradient(135deg, var(--sage-l), var(--amber-l))',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  margin:'0 auto 18px',
                  fontFamily:'Cormorant Garamond, serif', fontSize:38, fontWeight:600, color:'white',
                  boxShadow:'0 8px 28px rgba(45,106,79,0.22)'
                }}>N</div>
                <div style={{ fontFamily:'Cormorant Garamond, serif', fontSize:24, fontWeight:600, marginBottom:3 }}>Navin Oswal</div>
                <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:10, letterSpacing:'0.18em', color:'var(--sage)', textTransform:'uppercase', marginBottom:4 }}>Chartered Accountant</div>
                <div style={{ fontSize:12, color:'var(--text-muted)', marginBottom:20 }}>📍 Pune, Maharashtra · India</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:7, justifyContent:'center', marginBottom:20 }}>
                  <span className="chip chip-sage" style={{fontSize:11}}>Real Estate</span>
                  <span className="chip chip-amber" style={{fontSize:11}}>FinOps</span>
                  <span className="chip chip-slate" style={{fontSize:11}}>Technology</span>
                  <span className="chip chip-sage" style={{fontSize:11}}>Compliance</span>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                  {['🏏 Sports forever','🎵 Music to unwind','🎬 Cinema to learn','🧠 WHY chaser'].map(item => (
                    <div key={item} style={{
                      padding:'10px 12px', borderRadius:12,
                      background:'rgba(255,255,255,0.55)', border:'1px solid rgba(255,255,255,0.85)',
                      fontSize:12, fontWeight:500, color:'var(--text-mid)', textAlign:'left'
                    }}>{item}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════
              HERO MOBILE TAB SWITCHER
              Only visible at ≤768px. Replaces the two-column desktop
              grid with a tab interface: one card visible at a time.
              Tab 1 "The Formula" = left column content (wrapped in glass).
              Tab 2 "What Changed" = right column profile card.
              Desktop (.hero-desktop-only) is hidden at this breakpoint.
              ══════════════════════════════════════════════════════ */}
          <div className="hero-mobile-only">

            {/* ── Tab bar ── full width, sage pill for active tab ── */}
            <div style={{
              display:        'flex',
              background:     'rgba(255,255,255,0.45)',
              border:         '1px solid rgba(255,255,255,0.7)',
              borderRadius:   14,
              padding:        4,
              marginBottom:   20,
              backdropFilter: 'blur(12px)',
            }}>
              {/* Tab: The Formula */}
              <button
                onClick={() => setHeroTab('formula')}
                style={{
                  flex:        1,
                  padding:     '10px 12px',
                  fontFamily:  'Outfit, sans-serif',
                  fontSize:    13,
                  fontWeight:  600,
                  border:      'none',
                  cursor:      'pointer',
                  borderRadius: 10,
                  background:  heroTab === 'formula' ? 'var(--sage)' : 'transparent',
                  color:       heroTab === 'formula' ? 'white' : 'var(--text-muted)',
                  transition:  'all 0.2s',
                }}
              >
                The Formula
              </button>
              {/* Tab: What Changed */}
              <button
                onClick={() => setHeroTab('changed')}
                style={{
                  flex:        1,
                  padding:     '10px 12px',
                  fontFamily:  'Outfit, sans-serif',
                  fontSize:    13,
                  fontWeight:  600,
                  border:      'none',
                  cursor:      'pointer',
                  borderRadius: 10,
                  background:  heroTab === 'changed' ? 'var(--sage)' : 'transparent',
                  color:       heroTab === 'changed' ? 'white' : 'var(--text-muted)',
                  transition:  'all 0.2s',
                }}
              >
                What Changed
              </button>
            </div>

            {/* ── Panel 1: The Formula ── left column content in a glass card ── */}
            {heroTab === 'formula' && (
              <div className="glass" style={{ padding: 28 }}>

                {/* Avatar */}
                <div style={{ marginBottom: 20 }}>
                  <img
                    src="/images/navin-profile-avatar.webp"
                    alt="Navin Oswal"
                    style={{
                      width: 72, height: 72,
                      borderRadius: '50%',
                      objectFit: 'cover',
                      objectPosition: 'center top',
                      border: '2px solid rgba(82,183,136,0.4)',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                      display: 'block',
                    }}
                  />
                </div>

                {/* Identity chips */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
                  <span className="chip chip-sage"><span className="dot"/>CA · 15,000 deliberate hours</span>
                  <span className="chip chip-amber">Co-Founder · UNITS &amp; UNIVEN</span>
                  <span className="chip chip-slate">Pune, Maharashtra</span>
                </div>

                {/* Headline */}
                <h1 style={{
                  fontFamily:    'Cormorant Garamond, serif',
                  fontSize:      'clamp(42px, 10vw, 62px)',
                  fontWeight:    600,
                  lineHeight:    1.0,
                  letterSpacing: '-0.025em',
                  marginBottom:  10,
                }}>
                  Curious<br/>by Nature.
                </h1>
                <div style={{
                  fontFamily:   'Cormorant Garamond, serif',
                  fontSize:     'clamp(20px, 5vw, 26px)',
                  fontStyle:    'italic',
                  color:        'var(--sage)',
                  marginBottom: 20,
                }}>
                  Optimist by Choice.
                </div>

                {/* Body paragraph */}
                <p style={{ fontSize: 15, lineHeight: 1.8, color: 'var(--text-mid)', marginBottom: 24 }}>
                  Chartered accountant. A decade of <strong>patiently compounding</strong> inside
                  real estate &amp; finance. Four private failed attempts at making life easier for
                  businesses in India — each failing the <strong>execution + validation test.</strong> Now,
                  on attempt five, I finally understand the difference between willingness and decisiveness.
                </p>

                {/* CTA buttons */}
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <Link href="/about" className="btn-primary">Read my story →</Link>
                  <Link href="/ventures" className="btn-ghost">What I&apos;m building ↗</Link>
                </div>

              </div>
            )}

            {/* ── Panel 2: What Changed ── profile card content ── */}
            {heroTab === 'changed' && (
              <div className="glass" style={{ padding: 32, textAlign: 'center' }}>

                {/* Monogram avatar */}
                <div style={{
                  width: 80, height: 80, borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--sage-l), var(--amber-l))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 16px',
                  fontFamily: 'Cormorant Garamond, serif', fontSize: 34, fontWeight: 600, color: 'white',
                  boxShadow: '0 8px 28px rgba(45,106,79,0.22)',
                }}>N</div>

                <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 22, fontWeight: 600, marginBottom: 3 }}>Navin Oswal</div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.18em', color: 'var(--sage)', textTransform: 'uppercase', marginBottom: 4 }}>Chartered Accountant</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 18 }}>📍 Pune, Maharashtra · India</div>

                {/* Domain chips */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, justifyContent: 'center', marginBottom: 18 }}>
                  <span className="chip chip-sage" style={{fontSize: 11}}>Real Estate</span>
                  <span className="chip chip-amber" style={{fontSize: 11}}>FinOps</span>
                  <span className="chip chip-slate" style={{fontSize: 11}}>Technology</span>
                  <span className="chip chip-sage" style={{fontSize: 11}}>Compliance</span>
                </div>

                {/* Interests 2×2 grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {['🏏 Sports forever','🎵 Music to unwind','🎬 Cinema to learn','🧠 WHY chaser'].map(item => (
                    <div key={item} style={{
                      padding: '10px 12px', borderRadius: 12,
                      background: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.85)',
                      fontSize: 12, fontWeight: 500, color: 'var(--text-mid)', textAlign: 'left',
                    }}>{item}</div>
                  ))}
                </div>

              </div>
            )}

          </div>{/* end hero-mobile-only */}

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          PART 1 — IDENTITY CHIPS WIDGET
          Sits inside the photo zone — inherits the background image.
          position:relative + zIndex:1 keeps it above the overlay layers.
          ══════════════════════════════════════════════════════ */}
      <section id="visitor-chips" className="section-sm" style={{ position: 'relative', zIndex: 1 }}>
        <div className="wrap">
          <div className="glass reveal" style={{
            padding: '28px 32px',
            border: '1px solid rgba(45,106,79,0.18)',
          }}>

            {/* Section label */}
            <div style={{
              fontFamily:    'JetBrains Mono, monospace',
              fontSize:      10,
              letterSpacing: '0.18em',
              color:         'var(--sage)',
              textTransform: 'uppercase',
              marginBottom:  16,
            }}>
              WHO&apos;S VISITING TODAY?
            </div>

            {/* ── Chips grid ──
                Desktop: flex row (chips wrap naturally if needed).
                Mobile:  2-column grid (see CSS below). */}
            <div className="identity-chips-grid">
              {CATEGORIES.map(cat => {
                const isSelected  = selectedSlug === cat.slug
                const hasSelection = selectedSlug !== null

                // Build class list dynamically
                const chipClass = [
                  'identity-chip',
                  isSelected                      ? 'identity-chip--selected' : '',
                  hasSelection && !isSelected     ? 'identity-chip--muted'    : '',
                  chipsPulsing  && !hasSelection  ? 'identity-chip--pulsing'  : '',
                ].filter(Boolean).join(' ')

                return (
                  <button
                    key={cat.slug}
                    className={chipClass}
                    // Once a selection has been made, all chips become read-only
                    onClick={!hasSelection ? () => handleChipClick(cat) : undefined}
                    style={{ pointerEvents: hasSelection ? 'none' : 'auto' }}
                    aria-pressed={isSelected}
                  >
                    {/* Category label */}
                    <span className="identity-chip-label">{cat.label}</span>
                    {/* Live count badge — shows '…' while loading, '—' on error */}
                    <span className="identity-chip-count">{getChipCount(cat.slug)}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          PART 2 — MONTHLY QUESTION WIDGET
          Shows an active question with Y / N voting buttons.
          Voting is gated behind identity chip selection.
          After voting: shows a tally with percentage bars.
          Hidden entirely if no active question exists.
          ══════════════════════════════════════════════════════ */}

      {/* Only render if we've loaded the question AND it's not null.
          Also inside the photo zone — position:relative + zIndex:1 above overlays.
          paddingBottom gives the bottom-fade layer room to dissolve gracefully. */}
      {activeQuestion !== undefined && activeQuestion !== null && (
        <section className="section-sm" style={{ position: 'relative', zIndex: 1, paddingBottom: 56 }}>
          <div className="wrap">
            <div className="glass reveal question-widget-card" style={{
              padding: '32px 36px',
              border: '1px solid rgba(45,106,79,0.18)',
            }}>

              {/* Section label */}
              <div style={{
                fontFamily:    'JetBrains Mono, monospace',
                fontSize:      10,
                letterSpacing: '0.18em',
                color:         'var(--sage)',
                textTransform: 'uppercase',
                marginBottom:  18,
              }}>
                QUESTION OF THE MONTH
              </div>

              {/* Question text — Cormorant Garamond display font */}
              <p style={{
                fontFamily:   'Cormorant Garamond, serif',
                fontSize:     'clamp(20px, 2.4vw, 28px)',
                fontStyle:    'italic',
                lineHeight:   1.45,
                color:        'var(--text)',
                marginBottom: questionPhase === 'tally' ? 24 : 28,
                maxWidth:     680,
              }}>
                &ldquo;{activeQuestion.question}&rdquo;
              </p>

              {/* ── Voting phase: Y / N buttons ── */}
              {questionPhase === 'voting' && (
                <div>
                  {/* Vote buttons row */}
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>

                    {/* YES button — sage green */}
                    <button
                      className="question-vote-btn question-vote-btn--yes"
                      onClick={voteEnabled ? () => handleVote('yes') : undefined}
                      disabled={!voteEnabled}
                      aria-label="Vote yes"
                    >
                      Y — Yes
                    </button>

                    {/* NO button — slate/neutral */}
                    <button
                      className="question-vote-btn question-vote-btn--no"
                      onClick={voteEnabled ? () => handleVote('no') : undefined}
                      disabled={!voteEnabled}
                      aria-label="Vote no"
                    >
                      N — No
                    </button>

                    {/* Tally preview if available */}
                    {questionTally && questionTally.total > 0 && (
                      <span style={{
                        fontFamily:  'JetBrains Mono, monospace',
                        fontSize:    11,
                        color:       'var(--text-muted)',
                        letterSpacing: '0.04em',
                      }}>
                        {questionTally.total} vote{questionTally.total !== 1 ? 's' : ''} so far
                      </span>
                    )}
                  </div>

                  {/* Helper text — only shown when buttons are locked */}
                  {!voteEnabled && (
                    <p style={{
                      fontFamily:  'Outfit, sans-serif',
                      fontSize:    12,
                      color:       'var(--text-muted)',
                      marginTop:   10,
                      fontStyle:   'italic',
                    }}>
                      Pick your identity above to unlock your vote
                    </p>
                  )}
                </div>
              )}

              {/* ── Thank-you phase (2 seconds after voting) ── */}
              {questionPhase === 'thankyou' && (
                <div style={{
                  fontFamily: 'Outfit, sans-serif',
                  fontSize:   15,
                  color:      'var(--sage)',
                  fontWeight: 500,
                }}>
                  Thanks for voting 🙏 Loading results…
                </div>
              )}

              {/* ── Tally phase: show percentage bars ── */}
              {questionPhase === 'tally' && questionTally && (
                <div className="question-tally">

                  {/* Yes bar */}
                  <div className="question-tally-row">
                    <span className="question-tally-label">Yes</span>
                    <div className="question-tally-bar-track">
                      <div
                        className="question-tally-bar question-tally-bar--yes"
                        style={{
                          width: questionTally.total > 0
                            ? `${Math.round((questionTally.yes / questionTally.total) * 100)}%`
                            : '0%',
                        }}
                      />
                    </div>
                    <span className="question-tally-pct">
                      {questionTally.total > 0
                        ? `${Math.round((questionTally.yes / questionTally.total) * 100)}%`
                        : '0%'}
                    </span>
                  </div>

                  {/* No bar */}
                  <div className="question-tally-row">
                    <span className="question-tally-label">No</span>
                    <div className="question-tally-bar-track">
                      <div
                        className="question-tally-bar question-tally-bar--no"
                        style={{
                          width: questionTally.total > 0
                            ? `${Math.round((questionTally.no / questionTally.total) * 100)}%`
                            : '0%',
                        }}
                      />
                    </div>
                    <span className="question-tally-pct">
                      {questionTally.total > 0
                        ? `${Math.round((questionTally.no / questionTally.total) * 100)}%`
                        : '0%'}
                    </span>
                  </div>

                  {/* Total vote count */}
                  <div style={{
                    fontFamily:   'JetBrains Mono, monospace',
                    fontSize:     11,
                    color:        'var(--text-muted)',
                    marginTop:    10,
                    letterSpacing:'0.04em',
                  }}>
                    {questionTally.total} vote{questionTally.total !== 1 ? 's' : ''} total
                  </div>

                </div>
              )}

            </div>
          </div>
        </section>
      )}

      {/* ════ END PHOTO ZONE — stats section below has zero photo bleed ════ */}
      </div>

      {/* ══════════════════════════════════════════════════════
          PART 3 — SENTIMENT STRIP
          Fixed floating bar that slides up from the bottom of the
          screen after the visitor has scrolled past 60% page depth.
          Only shown once per session (tracked via sessionStorage).
          ══════════════════════════════════════════════════════ */}
      {showSentiment && (
        <div
          role="dialog"
          aria-label="Quick feedback"
          className={`sentiment-strip${sentimentPhase === 'exiting' ? ' exiting' : ''}`}
        >
          {/* ── Thanks message (shown after emoji click, stays visible during fade-out) ── */}
          {showThanks ? (
            <span className="sentiment-thanks">Thanks for the note 🙏</span>
          ) : (
            <>
              {/* Close button — dismisses without answering, no API call */}
              <button
                className="sentiment-close"
                onClick={dismissSentiment}
                aria-label="Dismiss feedback"
              >
                ✕
              </button>

              {/* Question text */}
              <span className="sentiment-question">Worth your time?</span>

              {/* Emoji buttons — minimum 48×48px tap targets */}
              <div className="sentiment-buttons">
                {[
                  ['👍', 'positive'],
                  ['🤔', 'neutral'],
                  ['👎', 'negative'],
                ].map(([emoji, value]) => (
                  <button
                    key={value}
                    className="sentiment-emoji-btn"
                    onClick={() => handleSentiment(value)}
                    aria-label={value}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── STATS ── */}
      <section className="section-sm">
        <div className="wrap">
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16 }}>
            {[
              { num:'15K', lbl:'Deliberate hours\npatiently compounding' },
              { num:'4',   lbl:'Private failed\nattempts. Learnt from each.' },
              { num:'2',   lbl:'Active ventures\nbuilding now' },
              { num:'∞',   lbl:"Why's left\nto understand" },
            ].map(s => (
              <div key={s.num} className="glass reveal" style={{ padding:'26px 20px', textAlign:'center', transition:'all 0.3s' }}>
                <div style={{ fontFamily:'Cormorant Garamond, serif', fontSize:44, fontWeight:600, color:'var(--sage)', lineHeight:1, marginBottom:5 }}>{s.num}</div>
                <div style={{ fontSize:12, color:'var(--text-muted)', fontWeight:500, lineHeight:1.4, whiteSpace:'pre-line' }}>{s.lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PATTERN ── */}
      <section className="section">
        <div className="wrap">
          <p className="eyebrow reveal">The Operating System</p>
          <h2 className="sec-h reveal">What I&apos;ve learned<br/>the hard way.</h2>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginTop:48 }}>
            {[
              { icon:'🔁', title:'Capability without Decisiveness',
                body:'I had the skills. I had the infinite optimism. What I lacked for years was the ability to act on thoughts quickly. Willingness without decisiveness is just expensive procrastination.' },
              { icon:'⏳', title:'Patiently Compounding',
                body:'~15,000 deliberate hours inside Rohan Builders was a knowledge asset, not just a job. People management is the most underrated skill for leaders. I learnt that by doing it daily, for a decade.' },
              { icon:'🎯', title:'The Constant Mission',
                body:'Across all four attempts, the thread never changed: making life easier for businesses in India using technology. The mission was always right. Only the execution muscle needed building.' },
            ].map(c => (
              <div key={c.title} className="glass reveal" style={{ padding:'32px 26px', textAlign:'center', transition:'all 0.3s' }}>
                <span style={{ fontSize:36, marginBottom:16, display:'block' }}>{c.icon}</span>
                <h3 style={{ fontFamily:'Cormorant Garamond, serif', fontSize:20, fontWeight:600, marginBottom:10 }}>{c.title}</h3>
                <p style={{ fontSize:13, color:'var(--text-muted)', lineHeight:1.7 }}>{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── QUOTE ── */}
      <section className="section-sm">
        <div className="wrap">
          <div className="glass reveal" style={{
            padding:60, textAlign:'center',
            background:'linear-gradient(135deg,rgba(45,106,79,0.05),rgba(180,83,9,0.05))',
            border:'1px solid rgba(45,106,79,0.12)'
          }}>
            <span style={{ fontFamily:'Cormorant Garamond, serif', fontSize:120, lineHeight:0.5, color:'rgba(45,106,79,0.1)', display:'block', marginBottom:22 }}>"</span>
            <p style={{ fontFamily:'Cormorant Garamond, serif', fontSize:'clamp(22px, 3vw, 36px)', fontStyle:'italic', lineHeight:1.45, maxWidth:700, margin:'0 auto 20px' }}>
              I seek to understand the <span style={{color:'var(--sage)',fontStyle:'normal'}}>"Why&apos;s"</span> behind everything.
              That curiosity is the one thing that survived every failure
              and compounded through every year of work.
            </p>
            <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:11, color:'var(--text-muted)', letterSpacing:'0.15em' }}>
              — NAVIN OSWAL · CURIOUS BY NATURE · OPTIMIST BY CHOICE
            </div>
          </div>
        </div>
      </section>

      {/* ── QUICK LINKS ── */}
      <section className="section">
        <div className="wrap">
          <p className="eyebrow reveal">Explore</p>
          <h2 className="sec-h reveal">Go deeper.</h2>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginTop:48 }}>
            {[
              { href:'/about',    icon:'📖', label:'My Story', desc:'The full picture — 15K hours, 4 failures, and what changed.', color:'var(--sage)' },
              { href:'/ventures', icon:'🚀', label:'Ventures', desc:'UNITS & UNIVEN — what I\'m building and why.', color:'var(--amber)' },
              { href:'/thoughts', icon:'✍️', label:'Thoughts', desc:'Running a business, living life, evolving world.', color:'var(--slate)' },
              { href:'/now',      icon:'📍', label:'Now',      desc:'What I\'m focused on right now — updated monthly.', color:'var(--sage)' },
              { href:'/stack',    icon:'⚙️', label:'Stack',    desc:'How I build — tools, learnings, and honest notes.', color:'var(--amber)' },
              { href:'/connect',  icon:'☕', label:'Connect',  desc:'Let\'s meet, collaborate, or do some good together.', color:'var(--slate)' },
            ].map(card => (
              <Link key={card.href} href={card.href} className="glass reveal" style={{
                padding:'28px 24px', display:'block', transition:'all 0.3s',
                textDecoration:'none'
              }}
              onMouseEnter={e => { e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='var(--g-shadow-lg)' }}
              onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='' }}>
                <span style={{ fontSize:28, display:'block', marginBottom:12 }}>{card.icon}</span>
                <div style={{ fontFamily:'Cormorant Garamond, serif', fontSize:22, fontWeight:600, marginBottom:8, color:card.color }}>{card.label}</div>
                <p style={{ fontSize:13, color:'var(--text-muted)', lineHeight:1.6 }}>{card.desc}</p>
                <div style={{ fontSize:13, fontWeight:600, color:card.color, marginTop:14 }}>Explore →</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        /* ── Hero adaptive layout ──
           Desktop (>768px): two-column grid (.hero-desktop-only) is visible.
           Mobile (≤768px):  grid is hidden; tab switcher (.hero-mobile-only) is shown instead. */
        .hero-mobile-only { display: none; }
        @media (max-width: 768px) {
          .hero-desktop-only { display: none !important; }
          .hero-mobile-only  { display: block; }
        }

        /* ── Hero card float animation ── */
        @keyframes floatY { from { transform: translateY(0) } to { transform: translateY(-10px) } }

        /* ── Responsive grid overrides (attribute-selector approach) ── */
        @media(max-width:860px){
          [data-hero-grid]{grid-template-columns:1fr!important;}
          [data-profile]{display:none;}
          [data-stats]{grid-template-columns:repeat(2,1fr)!important;}
          [data-pattern]{grid-template-columns:1fr!important;}
          [data-explore]{grid-template-columns:1fr 1fr!important;}
        }
        @media(max-width:560px){
          [data-explore]{grid-template-columns:1fr!important;}
        }

        /* ════════════════════════════════════════════════════════
           PART 1 — IDENTITY CHIPS
           Desktop: horizontal flex row.
           Mobile:  2-column grid.
           ════════════════════════════════════════════════════════ */

        /* ── Chips container — desktop: flex row, chips wrap if needed ── */
        .identity-chips-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        /* ── Individual chip ── */
        .identity-chip {
          font-family: 'Outfit', sans-serif;
          font-size: 13px;
          font-weight: 500;
          color: var(--sage);
          background: rgba(45,106,79,0.07);
          border: 1.5px solid rgba(45,106,79,0.18);
          border-radius: 100px;
          padding: 8px 16px 8px 18px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.25s cubic-bezier(0.645, 0.045, 0.355, 1.000);
          white-space: nowrap;
        }
        .identity-chip:hover {
          background: rgba(45,106,79,0.12);
          border-color: rgba(45,106,79,0.4);
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(45,106,79,0.14);
        }

        /* Count badge inside each chip */
        .identity-chip-count {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          font-weight: 600;
          background: rgba(45,106,79,0.12);
          color: var(--sage);
          padding: 2px 7px;
          border-radius: 100px;
          letter-spacing: 0.04em;
        }

        /* ── Selected chip: sage border + soft glow ── */
        .identity-chip--selected {
          border-color: var(--sage) !important;
          background: rgba(45,106,79,0.11) !important;
          box-shadow: 0 0 0 3px rgba(45,106,79,0.1), 0 4px 16px rgba(45,106,79,0.18) !important;
          cursor: default;
        }
        .identity-chip--selected .identity-chip-count {
          background: var(--sage);
          color: white;
        }

        /* ── Muted chip: shown for unselected chips after a selection is made ── */
        .identity-chip--muted {
          opacity: 0.42;
          cursor: default;
        }

        /* ── Pulse animation: used to draw attention to chips after sentiment without category ── */
        @keyframes chipPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(45,106,79,0.0); }
          50%       { box-shadow: 0 0 0 7px rgba(45,106,79,0.22); }
        }
        .identity-chip--pulsing {
          animation: chipPulse 0.85s cubic-bezier(0.645, 0.045, 0.355, 1.000) 2;
        }

        /* ── Mobile: 2-column grid, chips fill their cell ── */
        @media (max-width: 767px) {
          .identity-chips-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
          }
          .identity-chip {
            font-size: 12px;
            padding: 10px 12px;
            border-radius: 14px;
            white-space: normal;
            justify-content: space-between;
          }
          .identity-chip-label {
            flex: 1;
            text-align: left;
          }
        }

        /* ════════════════════════════════════════════════════════
           PART 2 — SENTIMENT STRIP
           Fixed floating bar, slides up from the bottom.
           Desktop: centered, max-width 480px, 24px from bottom.
           Mobile:  full-width bottom sheet, anchored at bottom edge.
           ════════════════════════════════════════════════════════ */

        /* ── Desktop enter / exit keyframes ── */
        @keyframes sentimentEnterDesktop {
          from { transform: translateX(-50%) translateY(calc(100% + 48px)); opacity: 0; }
          to   { transform: translateX(-50%) translateY(0);                  opacity: 1; }
        }
        @keyframes sentimentExitDesktop {
          from { transform: translateX(-50%) translateY(0);    opacity: 1; }
          to   { transform: translateX(-50%) translateY(20px); opacity: 0; }
        }

        /* ── Base strip styles (desktop) ── */
        .sentiment-strip {
          position: fixed;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          max-width: 480px;
          width: calc(100% - 32px);
          background: rgba(6, 10, 9, 0.9);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          border: 1px solid rgba(82, 183, 136, 0.15);
          border-radius: 16px;
          padding: 14px 48px 14px 22px;
          display: flex;
          align-items: center;
          gap: 14px;
          z-index: 200;
          /* Enter animation plays once on mount */
          animation: sentimentEnterDesktop 0.5s cubic-bezier(0.645, 0.045, 0.355, 1.000) forwards;
        }

        /* Exit animation overrides enter when 'exiting' class is added */
        .sentiment-strip.exiting {
          animation: sentimentExitDesktop 0.42s cubic-bezier(0.645, 0.045, 0.355, 1.000) forwards;
        }

        /* Question text */
        .sentiment-question {
          font-family: 'Outfit', sans-serif;
          font-size: 14px;
          font-weight: 500;
          color: #52b788;
          flex: 1;
          white-space: nowrap;
        }

        /* Emoji buttons row */
        .sentiment-buttons {
          display: flex;
          gap: 7px;
          align-items: center;
        }

        /* Each emoji button — 48×48px minimum tap target */
        .sentiment-emoji-btn {
          width: 48px;
          height: 48px;
          background: rgba(255, 255, 255, 0.07);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          font-size: 22px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s cubic-bezier(0.645, 0.045, 0.355, 1.000);
          line-height: 1;
        }
        .sentiment-emoji-btn:hover {
          background: rgba(255, 255, 255, 0.15);
          border-color: rgba(255, 255, 255, 0.22);
          transform: scale(1.1);
        }

        /* Close button — absolutely positioned in top-right of strip */
        .sentiment-close {
          position: absolute;
          top: 8px;
          right: 10px;
          background: none;
          border: none;
          font-family: 'Outfit', sans-serif;
          font-size: 13px;
          color: rgba(255, 255, 255, 0.3);
          cursor: pointer;
          padding: 4px 6px;
          line-height: 1;
          transition: color 0.15s;
          pointer-events: auto;
        }
        .sentiment-close:hover { color: rgba(255, 255, 255, 0.65); }

        /* Thank-you message (replaces question + buttons after emoji click) */
        .sentiment-thanks {
          font-family: 'Outfit', sans-serif;
          font-size: 14px;
          font-weight: 500;
          color: #52b788;
          width: 100%;
          text-align: center;
          padding: 4px 0;
        }

        /* ════════════════════════════════════════════════════════
           PART 2 — MONTHLY QUESTION WIDGET
           Desktop: centered card, max ~740px, horizontal button row.
           Mobile:  full-width card, stacked layout.
           ════════════════════════════════════════════════════════ */

        /* ── Photo zone: disable fixed attachment on mobile ──
            background-attachment:fixed causes rendering glitches on iOS Safari.
            Switch to scroll on mobile — the gradient fades still work correctly. */
        @media (max-width: 767px) {
          .photo-zone {
            background-attachment: scroll !important;
          }
        }

        /* ── Hero avatar: smaller on mobile ── */
        @media (max-width: 767px) {
          .hero-avatar {
            width: 72px !important;
            height: 72px !important;
          }
        }

        /* ── Vote buttons base ── */
        .question-vote-btn {
          font-family: 'Outfit', sans-serif;
          font-size: 14px;
          font-weight: 600;
          padding: 11px 28px;
          border-radius: 100px;
          border: 1.5px solid transparent;
          cursor: pointer;
          transition: all 0.22s cubic-bezier(0.645, 0.045, 0.355, 1.000);
          letter-spacing: 0.02em;
          white-space: nowrap;
        }

        /* YES — sage green */
        .question-vote-btn--yes {
          background: rgba(45,106,79,0.10);
          border-color: rgba(45,106,79,0.30);
          color: var(--sage);
        }
        .question-vote-btn--yes:not(:disabled):hover {
          background: rgba(45,106,79,0.18);
          border-color: var(--sage);
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(45,106,79,0.18);
        }

        /* NO — slate/neutral */
        .question-vote-btn--no {
          background: rgba(30,58,95,0.08);
          border-color: rgba(30,58,95,0.22);
          color: var(--slate);
        }
        .question-vote-btn--no:not(:disabled):hover {
          background: rgba(30,58,95,0.14);
          border-color: var(--slate);
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(30,58,95,0.14);
        }

        /* Disabled state — greyed out when no identity chip selected */
        .question-vote-btn:disabled {
          opacity: 0.38;
          cursor: not-allowed;
          transform: none !important;
          box-shadow: none !important;
        }

        /* ── Tally rows ── */
        .question-tally {
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-width: 480px;
        }

        .question-tally-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .question-tally-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          width: 26px;
          flex-shrink: 0;
        }

        .question-tally-bar-track {
          flex: 1;
          height: 8px;
          background: rgba(0,0,0,0.06);
          border-radius: 100px;
          overflow: hidden;
        }

        .question-tally-bar {
          height: 100%;
          border-radius: 100px;
          transition: width 0.6s cubic-bezier(0.645, 0.045, 0.355, 1.000);
        }

        .question-tally-bar--yes { background: var(--sage-l); }
        .question-tally-bar--no  { background: var(--slate-l); }

        .question-tally-pct {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          color: var(--text-muted);
          width: 36px;
          text-align: right;
          flex-shrink: 0;
        }

        /* ── Mobile layout ── */
        @media (max-width: 767px) {
          .question-widget-card {
            padding: 24px 20px !important;
          }
          .question-vote-btn {
            font-size: 13px;
            padding: 10px 22px;
          }
          .question-tally {
            max-width: 100%;
          }
        }

        /* ── Mobile: full-width bottom sheet ── */
        @media (max-width: 767px) {
          @keyframes sentimentEnterMobile {
            from { transform: translateY(100%); opacity: 0; }
            to   { transform: translateY(0);    opacity: 1; }
          }
          @keyframes sentimentExitMobile {
            from { transform: translateY(0);    opacity: 1; }
            to   { transform: translateY(100%); opacity: 0; }
          }

          .sentiment-strip {
            left: 0;
            right: 0;
            bottom: 0;
            width: 100%;
            max-width: none;
            transform: none;
            border-radius: 20px 20px 0 0;
            padding: 18px 48px 32px 22px;
            animation: sentimentEnterMobile 0.45s cubic-bezier(0.645, 0.045, 0.355, 1.000) forwards;
          }
          .sentiment-strip.exiting {
            animation: sentimentExitMobile 0.42s cubic-bezier(0.645, 0.045, 0.355, 1.000) forwards;
          }
          .sentiment-question { white-space: normal; }
        }
      `}</style>
    </Layout>
  )
}
