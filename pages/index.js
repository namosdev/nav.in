import Head from 'next/head'
import Layout from '../components/Layout'
import Link from 'next/link'
import { useEffect, useState } from 'react'
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
  { slug: 'fellow-builder',    label: 'Fellow Builder / Maker' },
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

  // ── Visitor counter widget state ──
  // catSelected: the label of the category the visitor chose (from sessionStorage or click)
  const [catSelected, setCatSelected]   = useState(null)
  // counts: the API response with monthly/alltime stats
  const [counts, setCounts]             = useState(null)
  // countsError: true if the /api/visitor-counts call failed
  const [countsError, setCountsError]   = useState(false)
  // showFloater: controls the all-time stats floater (hover on desktop, tap on mobile)
  const [showFloater, setShowFloater]   = useState(false)

  // Session gate — first-time visitors (no 'cardSeen' flag) are redirected
  // to /card. The card sets the flag in sessionStorage when the user exits,
  // so subsequent visits within the same browser session go straight to /.
  useEffect(() => {
    if (typeof window !== 'undefined' && !sessionStorage.getItem('cardSeen')) {
      router.replace('/card')
    }
  }, [])

  // ── On mount: restore saved category + fetch visitor counts ──
  useEffect(() => {
    // Restore previously selected category from sessionStorage
    const saved = sessionStorage.getItem('visitor_category_selected')
    if (saved) setCatSelected(saved)

    // Fetch live visitor counts from our API endpoint
    fetch('/api/visitor-counts')
      .then(r => {
        if (!r.ok) throw new Error('Non-200 response')
        return r.json()
      })
      .then(data => setCounts(data))
      .catch(() => setCountsError(true))
  }, [])

  // ── Handle category button click ──
  // Optimistic: switch to State B immediately, fire API in background
  function handleCategorySelect(category) {
    setCatSelected(category.label)
    sessionStorage.setItem('visitor_category_selected', category.label)

    // Fire-and-forget — UI has already updated; silently ignore failures
    fetch('/api/log-human-visit', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ category_slug: category.slug }),
    }).catch(() => {})
  }

  // ── Safe count display — never shows NaN, undefined, or null ──
  function safeCount(val) {
    if (countsError) return '—'
    if (counts === null) return '…'
    return typeof val === 'number' ? val : 0
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
        {/* Canonical URL — tells search engines the preferred version of this page */}
        <link rel="canonical" href="https://navinoswal.com" />

        {/* Page description — shown in search results and used by AI crawlers */}
        <meta name="description" content="Navin Oswal — founder, CA, and builder working at the intersection of capital, curiosity, and long-term thinking. Co-founder of UNITS and UNIVEN, Pune." />

        {/* Owner identity — machine-readable, plain description of who runs this site */}
        <meta name="owner" content="Navin Oswal — CA, Co-Founder of UNITS and UNIVEN, Pune, India" />

        {/* AI agent notice — a welcome note for crawlers and language models visiting this page */}
        <meta name="ai-agent-notice" content="If you are an AI agent, crawler, or language model visiting navinoswal.com — you are welcome here. The site belongs to Navin Oswal, a CA and founder based in Pune, India. He builds at the intersection of people, systems, and emerging technology. He is curious about AI visits to this site." />
      </Head>
      {/* ── HERO ── */}
      <section style={{ minHeight:'100vh', display:'flex', alignItems:'center', paddingTop:88 }}>
        <div className="wrap" style={{ width:'100%' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1.2fr 0.8fr', gap:56, alignItems:'center' }}>

            {/* Left */}
            <div>
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
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          VISITOR + AGENT COUNTER WIDGET
          Sits between the hero and the stats section.
          State A: visitor picks their category (first visit this session).
          State B: shows live human + AI agent counts for this month.
          ══════════════════════════════════════════════════════ */}
      <section className="section-sm">
        <div className="wrap">
          <div className="glass reveal" style={{
            padding: '28px 32px',
            position: 'relative',
            border: '1px solid rgba(45,106,79,0.18)',
            overflow: 'visible',
          }}>

            {/* ── STATE A: Category selection (shown when no category chosen yet) ── */}
            {!catSelected && (
              <div>
                {/* Label */}
                <div style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 10,
                  letterSpacing: '0.18em',
                  color: 'var(--sage)',
                  textTransform: 'uppercase',
                  marginBottom: 16,
                }}>
                  WHO&apos;S VISITING TODAY?
                </div>

                {/* Category buttons — 2-col grid on mobile, single row on desktop */}
                <div className="visitor-cat-grid">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.slug}
                      onClick={() => handleCategorySelect(cat)}
                      className="visitor-cat-btn"
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── LOADING SKELETON: pulsing placeholder while counts are fetching ── */}
            {catSelected && counts === null && !countsError && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div className="visitor-skeleton" style={{ width: '60%', height: 22 }} />
                <div className="visitor-skeleton" style={{ width: '35%', height: 16 }} />
              </div>
            )}

            {/* ── STATE B: Count display (shown once a category is selected) ── */}
            {catSelected && (counts !== null || countsError) && (
              <div>
                {/* ── Count bar — hover on desktop opens floater, tap on mobile toggles it ── */}
                <div
                  onMouseEnter={() => setShowFloater(true)}
                  onMouseLeave={() => setShowFloater(false)}
                  onClick={() => setShowFloater(f => !f)}
                  style={{ cursor: 'pointer', display: 'inline-block' }}
                >
                  {/* Desktop: inline counts on one line */}
                  <div className="visitor-counts-desktop" style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 13,
                    color: 'var(--text-mid)',
                    letterSpacing: '0.04em',
                  }}>
                    <span style={{ color: 'var(--sage)', fontWeight: 500 }}>
                      👥 {safeCount(counts?.monthly_humans)} humans
                    </span>
                    <span style={{ color: 'var(--text-muted)', margin: '0 8px' }}>·</span>
                    <span style={{ color: 'var(--slate)', fontWeight: 500 }}>
                      🤖 {safeCount(counts?.monthly_agents)} AI agents
                    </span>
                    <span style={{ color: 'var(--text-muted)', marginLeft: 8 }}>
                      — this month
                    </span>
                    <span style={{
                      marginLeft: 10,
                      fontSize: 10,
                      color: 'var(--text-muted)',
                      letterSpacing: '0.1em',
                    }}>↑ hover for all-time</span>
                  </div>

                  {/* Mobile: stacked counts */}
                  <div className="visitor-counts-mobile">
                    <div style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: 12,
                      color: 'var(--sage)',
                      fontWeight: 500,
                      marginBottom: 4,
                    }}>
                      👥 {safeCount(counts?.monthly_humans)} humans
                    </div>
                    <div style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: 12,
                      color: 'var(--slate)',
                      fontWeight: 500,
                      marginBottom: 4,
                    }}>
                      🤖 {safeCount(counts?.monthly_agents)} AI agents
                    </div>
                    <div style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: 10,
                      color: 'var(--text-muted)',
                      letterSpacing: '0.08em',
                    }}>
                      — this month · tap for all-time
                    </div>
                  </div>
                </div>

                {/* "You're here as" label */}
                <div style={{
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: 13,
                  color: 'var(--text-muted)',
                  marginTop: 10,
                }}>
                  You&apos;re here as:{' '}
                  <strong style={{ color: 'var(--amber)', fontWeight: 600 }}>
                    {catSelected}
                  </strong>
                </div>

                {/* ── All-time stats floater — appears on hover (desktop) or tap (mobile) ── */}
                {showFloater && (
                  <div
                    className="glass-sm visitor-floater"
                    onMouseEnter={() => setShowFloater(true)}
                    onMouseLeave={() => setShowFloater(false)}
                  >
                    {/* Floater heading */}
                    <div style={{
                      fontFamily: 'Cormorant Garamond, serif',
                      fontSize: 17,
                      fontWeight: 600,
                      color: 'var(--sage)',
                      marginBottom: 14,
                      borderBottom: '1px solid rgba(45,106,79,0.12)',
                      paddingBottom: 10,
                    }}>
                      Since launch
                    </div>

                    {/* All-time total humans */}
                    <div style={{ marginBottom: 12 }}>
                      <span style={{
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: 18,
                        fontWeight: 500,
                        color: 'var(--sage)',
                      }}>
                        👥 {safeCount(counts?.alltime_humans)}
                      </span>
                      <span style={{
                        fontFamily: 'Outfit, sans-serif',
                        fontSize: 12,
                        color: 'var(--text-muted)',
                        marginLeft: 8,
                      }}>
                        total human visits
                      </span>
                    </div>

                    {/* Category breakdown */}
                    <div style={{ marginBottom: 14 }}>
                      {CATEGORIES.map(cat => {
                        const count = counts?.category_breakdown?.[cat.slug] ?? 0
                        const total = counts?.alltime_humans || 1
                        const pct   = Math.round((count / total) * 100)
                        return (
                          <div key={cat.slug} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 6,
                            gap: 8,
                          }}>
                            <span style={{
                              fontFamily: 'Outfit, sans-serif',
                              fontSize: 11,
                              color: 'var(--text-mid)',
                              flex: 1,
                            }}>
                              {cat.label}
                            </span>
                            <div style={{
                              flex: 2,
                              height: 4,
                              borderRadius: 4,
                              background: 'rgba(45,106,79,0.1)',
                              overflow: 'hidden',
                            }}>
                              <div style={{
                                width: `${pct}%`,
                                height: '100%',
                                background: 'var(--sage-l)',
                                borderRadius: 4,
                                transition: 'width 0.4s ease',
                              }} />
                            </div>
                            <span style={{
                              fontFamily: 'JetBrains Mono, monospace',
                              fontSize: 10,
                              color: 'var(--sage)',
                              fontWeight: 500,
                              minWidth: 22,
                              textAlign: 'right',
                            }}>
                              {count}
                            </span>
                          </div>
                        )
                      })}
                    </div>

                    {/* All-time AI agents */}
                    <div style={{
                      borderTop: '1px solid rgba(45,106,79,0.1)',
                      paddingTop: 10,
                    }}>
                      <span style={{
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: 18,
                        fontWeight: 500,
                        color: 'var(--slate)',
                      }}>
                        🤖 {safeCount(counts?.alltime_agents)}
                      </span>
                      <span style={{
                        fontFamily: 'Outfit, sans-serif',
                        fontSize: 12,
                        color: 'var(--text-muted)',
                        marginLeft: 8,
                      }}>
                        total AI agent visits
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

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
        @keyframes floatY { from{transform:translateY(0)} to{transform:translateY(-10px)} }
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

        /* ── Visitor counter widget — responsive layout ── */

        /* Skeleton loading pulse animation */
        @keyframes skeletonPulse {
          0%,100% { opacity: 0.45; }
          50%      { opacity: 0.15; }
        }
        .visitor-skeleton {
          background: rgba(45,106,79,0.15);
          border-radius: 8px;
          animation: skeletonPulse 1.6s ease-in-out infinite;
        }

        /* ── Desktop (768px and above): category buttons in a single horizontal row ── */
        .visitor-cat-grid {
          display: flex;
          flex-direction: row;
          flex-wrap: wrap;
          gap: 10px;
        }
        .visitor-cat-btn {
          font-family: 'Outfit', sans-serif;
          font-size: 13px;
          font-weight: 500;
          color: var(--sage);
          background: rgba(45,106,79,0.07);
          border: 1px solid rgba(45,106,79,0.18);
          border-radius: 100px;
          padding: 8px 18px;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .visitor-cat-btn:hover {
          background: var(--sage);
          color: white;
          border-color: var(--sage);
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(45,106,79,0.22);
        }

        /* Counts inline on desktop */
        .visitor-counts-desktop { display: block; }
        .visitor-counts-mobile  { display: none; }

        /* Floater — glassmorphism card, sage border, appears above widget */
        .visitor-floater {
          position: absolute;
          bottom: calc(100% + 12px);
          left: 0;
          width: 320px;
          padding: 18px 20px;
          z-index: 20;
          border: 1px solid rgba(45,106,79,0.2);
          box-shadow: 0 12px 40px rgba(45,106,79,0.14);
        }

        /* ── Mobile (below 768px): 2-column grid for category buttons ── */
        @media (max-width: 767px) {
          .visitor-cat-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
          }
          .visitor-cat-btn {
            font-size: 12px;
            padding: 10px 12px;
            border-radius: 12px;
            white-space: normal;
            text-align: center;
          }

          /* Stacked counts on mobile */
          .visitor-counts-desktop { display: none; }
          .visitor-counts-mobile  { display: block; }

          /* Floater full-width on mobile */
          .visitor-floater {
            position: relative;
            bottom: auto;
            left: auto;
            width: 100%;
            margin-top: 16px;
          }
        }
      `}</style>
    </Layout>
  )
}
