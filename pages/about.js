import Layout from '../components/Layout'
import Link from 'next/link'

const attempts = [
  {
    num: '01',
    name: 'SOCIETYNEXT.COM',
    tagline: 'A unified platform for all the needs of housing societies.',
    what: 'Maintenance billing & collection, intra-society communication, and operations management — all in one place. Born from a personal frustration watching how the society where I lived was managed.',
    struggle: 'Personal challenge to change how operations were managed in the society where I lived.',
    progress: ['Ideation', 'Brainstorming', 'Imagination Lock'],
    highlight: 'Identified the issues faced by SMEs and realised my own potential to build products that can help hundreds.',
    lesson: 'The first time I hit what I now call "imagination lock" — a mental block that prevents the flow of execution. The idea was real. The problem was real. The builder wasn\'t ready yet.',
    color: 'var(--slate)',
    bg: 'rgba(30,58,95,0.06)',
  },
  {
    num: '02',
    name: 'WORKDONE.TECH',
    tagline: 'A custom software development firm helping SMEs with efficiency tools.',
    what: 'Built tools like eGate Pass (visitor management), email parsing systems, and an IT-Admin ticketing system. Small, inefficient processes on the job were disturbing productivity, wasting time, and costing thousands in delays.',
    struggle: 'Small, inefficient processes on the job were disturbing productivity, wasting time, and costing thousands in delay.',
    progress: ['Ideation', 'Brainstorming', 'Building semi-finished products', 'Never sold anything — zero revenue'],
    highlight: 'Identification of real-world business problems and first real attempt to use technology in improving business efficiency.',
    lesson: 'I built products. Real, working products. But I never sold a single one. Zero revenue. The gap between building and selling — that was the lesson nobody teaches you.',
    color: 'var(--amber)',
    bg: 'rgba(180,83,9,0.06)',
  },
  {
    num: '03',
    name: 'FINRISE.AI',
    tagline: 'ML-based SME lending using OCEN framework for instant cashflow-based lending.',
    what: 'Solving for growth capital faced by challenger SMEs trying to champion their products and services, with easy accessibility and low cost of capital using an ML-based underwriting model on traditional and alternative data points.',
    struggle: 'Inspired by the U.K. Sinha Committee report on MSMEs and interactions with entrepreneurs struggling to compete purely on capital — despite having the ability to produce the best quality products.',
    progress: ['Ideation', 'Brainstorming', 'Assembled functional + tech team', 'Built the prototype version', 'Initial conceptual feedback', 'Never moved to usable product', 'Scrapped — COVID delayed OCEN launch'],
    highlight: 'First real attempt at helping SMEs champion the best quality products without worrying about funds to chase scale.',
    lesson: 'This one got furthest. Real team. Working prototype. Market feedback. Then COVID arrived and the OCEN framework launch — the very infrastructure we were building on — got indefinitely delayed. External circumstances killed internal momentum.',
    color: 'var(--sage)',
    bg: 'rgba(45,106,79,0.06)',
  },
  {
    num: '04',
    name: 'FACTWORKS.CO',
    tagline: 'A virtual compliance back office for small businesses — FACT: Financial Accounting, Compliance & Taxation.',
    what: 'Taking care of Financial Accounting, Compliance, and Taxation for small businesses — the back-office work that drains founders\' time but doesn\'t directly build their business.',
    struggle: 'The COVID-19 pandemic, almost like a black swan event, led to a significant shift in the way businesses operate. Compliance activity for thousands of small businesses required a more adaptable & resilient approach.',
    progress: ['Ideation', 'Brainstorming', 'Built the web-based platform', 'Scrapped — COVID emergency with family'],
    highlight: 'The attempt most aligned to my skills and domain experience. The closest I\'d come to the right intersection.',
    lesson: 'Platform was built. It was working. But a family emergency during COVID meant I had to choose between the product and the people. I chose the people. No regrets — but it taught me that timing, family support, and personal bandwidth are co-founders too.',
    color: '#7c3aed',
    bg: 'rgba(124,58,237,0.06)',
  },
]

const career = [
  {
    period: 'Aug 2010 – Jul 2013',
    role: 'Articled Assistant',
    org: 'Shah Khandelwal Jain & Associates, CA',
    desc: 'Statutory audits, tax audits, US individual taxation, and compliance services. Where the "why" behind every number was first understood. Three years of learning the language of business through its financial statements.',
    tags: ['Audit', 'Tax', 'Compliance', 'US Taxation'],
    color: 'var(--slate)',
  },
  {
    period: 'Jan 2014 – Oct 2024 · 10 yrs 10 mos',
    role: 'FinOps Leader',
    org: 'Rohan Builders, Pune',
    desc: '~15,000 deliberate hours inside one of Pune\'s established real estate groups. Started as an operations executive, grew to leading FinOps — covering financial closure, RERA compliance, ERP transformation, credit ratings (CARE/CRISIL), MIS architecture, and cross-functional people management. I was patiently compounding every single year.',
    tags: ['Real Estate', 'RERA', 'ERP', 'FinOps', 'CARE/CRISIL', 'MIS', 'Team Leadership'],
    color: 'var(--sage)',
  },
  {
    period: 'October 2024 – Present',
    role: 'Co-Founder',
    org: 'UNIVEN',
    desc: 'Redefining trust in the Connected Business Ecosystem with Universal Business Credentials. The B2B identity layer that businesses need — but don\'t yet have.',
    tags: ['Business Identity', 'Trust Infrastructure', 'B2B'],
    color: 'var(--amber)',
  },
  {
    period: 'December 2024 – Present',
    role: 'Co-Founder',
    org: 'UNITS · Part of BasalOS',
    desc: 'The simplest real estate sales management tool for an end-to-end customer journey. 4 real estate developers. 2.5 lakh users being served. Rewriting the OS for real estate.',
    tags: ['Real Estate', 'Sales Management', 'BasalOS'],
    color: '#00897b',
  },
]

export default function About() {
  return (
    <Layout title="About" description="The full story — 15,000 deliberate hours, 4 failed attempts, and the pattern I finally understood.">
      
      {/* ── PAGE HEADER ── */}
      <div className="page-header">
        <div className="wrap">
          <p className="eyebrow reveal">The Full Story</p>
          <h1 className="sec-h reveal" style={{ fontSize:'clamp(42px,5vw,72px)' }}>
            Capability, Willingness<br/>&amp; Poor Execution.
          </h1>
          <p className="sec-p reveal" style={{ maxWidth:600 }}>
            This is the honest version. Not a curated highlight reel.
            The actual journey — including the four attempts nobody talks about,
            and the pattern I finally understood.
          </p>
        </div>
      </div>

      {/* ── ACT 1 — FOUNDATION ── */}
      <section className="section">
        <div className="wrap">
          <p className="eyebrow reveal">Act One</p>
          <h2 className="sec-h reveal">Patiently Compounding.</h2>
          <p className="sec-p reveal" style={{ marginBottom:48 }}>
            ~15,000 deliberate hours. Not spent waiting — spent building understanding
            that only comes from showing up every single day across every single function.
          </p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:20 }}>
            {career.map((c,i) => (
              <div key={i} className="glass reveal" style={{
                padding:'36px 32px', position:'relative', overflow:'hidden', transition:'all 0.35s'
              }}
              onMouseEnter={e => { e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='var(--g-shadow-lg)' }}
              onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='' }}>
                <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:`linear-gradient(90deg,${c.color},${c.color}88)`, borderRadius:'20px 20px 0 0', opacity:0.7 }}/>
                <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:9, letterSpacing:'0.2em', textTransform:'uppercase', color:c.color, marginBottom:8 }}>{c.period}</div>
                <h3 style={{ fontFamily:'Cormorant Garamond, serif', fontSize:22, fontWeight:600, marginBottom:4 }}>{c.role}</h3>
                <div style={{ fontSize:13, fontWeight:600, color:'var(--text-mid)', marginBottom:14 }}>{c.org}</div>
                <p style={{ fontSize:13, color:'var(--text-muted)', lineHeight:1.7, marginBottom:14 }}>{c.desc}</p>
                <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                  {c.tags.map(t => <span key={t} className="mono-tag" style={{ background:`${c.color}15`, color:c.color }}>{t}</span>)}
                </div>
              </div>
            ))}
          </div>

          {/* The key insight */}
          <div className="glass reveal" style={{
            marginTop:40, padding:'40px 48px', textAlign:'center',
            background:'linear-gradient(135deg,rgba(45,106,79,0.05),rgba(180,83,9,0.04))',
            border:'1px solid rgba(45,106,79,0.12)'
          }}>
            <p style={{ fontFamily:'Cormorant Garamond, serif', fontSize:'clamp(18px,2.5vw,26px)', fontStyle:'italic', lineHeight:1.55, maxWidth:680, margin:'0 auto' }}>
              "Having been part of the finance &amp; operations team for over a decade, I can confirm that{' '}
              <span style={{ color:'var(--sage)', fontStyle:'normal', fontWeight:600 }}>people management is the most underrated skill for leaders.</span>{' '}
              This skill alone decides your ability to succeed."
            </p>
          </div>
        </div>
      </section>

      {/* ── ACT 2 — FOUR ATTEMPTS ── */}
      <section className="section" style={{ background:'rgba(255,255,255,0.2)' }}>
        <div className="wrap">
          <p className="eyebrow reveal">Act Two</p>
          <h2 className="sec-h reveal">Four Private Failed Attempts.</h2>
          <p className="sec-p reveal" style={{ marginBottom:16 }}>
            Seven to eight years. Each attempt got further than the last.
            None passed the execution + validation test.
            Every single one taught me something the previous one couldn&apos;t.
          </p>
          <p className="reveal" style={{ fontSize:14, color:'var(--text-muted)', marginBottom:52, fontStyle:'italic' }}>
            The mission never changed: making life easier for businesses in India using technology.
          </p>

          <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
            {attempts.map((a) => (
              <div key={a.num} className="glass reveal" style={{
                padding:'40px 40px', position:'relative', overflow:'hidden', transition:'all 0.35s'
              }}
              onMouseEnter={e => { e.currentTarget.style.transform='translateX(4px)'; e.currentTarget.style.boxShadow='var(--g-shadow-lg)' }}
              onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='' }}>
                <div style={{ position:'absolute', top:0, left:0, bottom:0, width:4, background:a.color, borderRadius:'20px 0 0 20px' }}/>

                <div style={{ display:'grid', gridTemplateColumns:'auto 1fr', gap:28, alignItems:'start' }}>
                  <div style={{
                    width:56, height:56, borderRadius:16,
                    background:a.bg, border:`1px solid ${a.color}30`,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontFamily:'Cormorant Garamond, serif', fontSize:22, fontWeight:600, color:a.color
                  }}>{a.num}</div>

                  <div>
                    <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:8, flexWrap:'wrap' }}>
                      <h3 style={{ fontFamily:'Cormorant Garamond, serif', fontSize:28, fontWeight:600, color:a.color }}>{a.name}</h3>
                    </div>
                    <p style={{ fontSize:14, fontWeight:500, color:'var(--text-mid)', marginBottom:14, fontStyle:'italic' }}>{a.tagline}</p>
                    <p style={{ fontSize:14, color:'var(--text-muted)', lineHeight:1.72, marginBottom:20 }}>{a.what}</p>

                    <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:20 }}>
                      <div style={{ padding:'14px 16px', borderRadius:12, background:a.bg, border:`1px solid ${a.color}20` }}>
                        <div style={{ fontSize:11, fontWeight:700, color:a.color, marginBottom:6, letterSpacing:'0.06em', textTransform:'uppercase' }}>The Struggle</div>
                        <p style={{ fontSize:12, color:'var(--text-muted)', lineHeight:1.6 }}>{a.struggle}</p>
                      </div>
                      <div style={{ padding:'14px 16px', borderRadius:12, background:a.bg, border:`1px solid ${a.color}20` }}>
                        <div style={{ fontSize:11, fontWeight:700, color:a.color, marginBottom:6, letterSpacing:'0.06em', textTransform:'uppercase' }}>Progress Made</div>
                        <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                          {a.progress.map((p,i) => (
                            <div key={i} style={{ fontSize:12, color:'var(--text-muted)', display:'flex', alignItems:'center', gap:6 }}>
                              <span style={{ width:4, height:4, borderRadius:'50%', background:a.color, flexShrink:0 }}/>
                              {p}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div style={{ padding:'14px 16px', borderRadius:12, background:a.bg, border:`1px solid ${a.color}20` }}>
                        <div style={{ fontSize:11, fontWeight:700, color:a.color, marginBottom:6, letterSpacing:'0.06em', textTransform:'uppercase' }}>Highlight</div>
                        <p style={{ fontSize:12, color:'var(--text-muted)', lineHeight:1.6 }}>{a.highlight}</p>
                      </div>
                    </div>

                    <div style={{ padding:'14px 18px', borderRadius:12, background:'rgba(255,255,255,0.6)', borderLeft:`3px solid ${a.color}` }}>
                      <div style={{ fontSize:11, fontWeight:700, color:a.color, marginBottom:5, letterSpacing:'0.06em', textTransform:'uppercase' }}>What I Actually Learnt</div>
                      <p style={{ fontSize:13, color:'var(--text-mid)', lineHeight:1.7, fontStyle:'italic' }}>{a.lesson}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ACT 3 — THE PATTERN ── */}
      <section className="section">
        <div className="wrap">
          <p className="eyebrow reveal">Act Three</p>
          <h2 className="sec-h reveal">The Pattern, Recognised.</h2>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24, marginTop:48 }}>
            <div className="glass reveal" style={{ padding:'40px 36px' }}>
              <h3 style={{ fontFamily:'Cormorant Garamond, serif', fontSize:26, fontWeight:600, marginBottom:16, color:'var(--amber)' }}>
                The Formula for Failure
              </h3>
              <div style={{ display:'flex', flexDirection:'column', gap:12, marginBottom:24 }}>
                {[
                  { label:'Capability', note:'Had it. FinOps expertise + domain depth.' },
                  { label:'Willingness', note:'Had too much of it. Infinite optimism.' },
                  { label:'+ Decisiveness', note:'Missing. The ability to act on thoughts quickly.' },
                ].map((item,i) => (
                  <div key={i} style={{ display:'flex', gap:12, alignItems:'flex-start' }}>
                    <div style={{ width:6, height:6, borderRadius:'50%', background:'var(--amber)', marginTop:7, flexShrink:0 }}/>
                    <div>
                      <span style={{ fontSize:14, fontWeight:600 }}>{item.label}</span>
                      <span style={{ fontSize:13, color:'var(--text-muted)' }}> — {item.note}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ padding:'14px 18px', borderRadius:12, background:'rgba(180,83,9,0.06)', border:'1px solid rgba(180,83,9,0.15)', fontSize:13, color:'var(--text-muted)', fontStyle:'italic', lineHeight:1.7 }}>
                Capability + Willingness without Decisiveness = Procrastination = Disastrous Execution.
                I was a victim of this for a long time.
              </div>
            </div>
            <div className="glass reveal" style={{ padding:'40px 36px' }}>
              <h3 style={{ fontFamily:'Cormorant Garamond, serif', fontSize:26, fontWeight:600, marginBottom:16, color:'var(--sage)' }}>
                What&apos;s Different Now
              </h3>
              <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                {[
                  { icon:'🎯', point:'The execution + validation test comes first — before falling in love with an idea.' },
                  { icon:'⚡', point:'Maximum 3 months to prove a hypothesis. Not years of building in private.' },
                  { icon:'👥', point:'Co-founders and team are chosen for decisiveness, not just expertise.' },
                  { icon:'🔍', point:'Each attempt taught me to look for the gap between problem and solution — not between idea and product.' },
                  { icon:'📍', point:'From imagination lock to actually building in tech using FinOps experience and domain expertise. Learning never stops.' },
                ].map((item,i) => (
                  <div key={i} style={{ display:'flex', gap:12, alignItems:'flex-start', padding:'12px 14px', borderRadius:10, background:'rgba(45,106,79,0.04)' }}>
                    <span style={{ fontSize:18, flexShrink:0 }}>{item.icon}</span>
                    <p style={{ fontSize:13, color:'var(--text-muted)', lineHeight:1.65 }}>{item.point}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="section-sm">
        <div className="wrap">
          <div className="glass reveal" style={{ padding:'52px 60px', textAlign:'center', background:'linear-gradient(135deg,rgba(45,106,79,0.05),rgba(82,183,136,0.05))' }}>
            <h3 style={{ fontFamily:'Cormorant Garamond, serif', fontSize:34, fontWeight:600, marginBottom:12 }}>
              Attempt five is live.
            </h3>
            <p style={{ fontSize:15, color:'var(--text-muted)', marginBottom:32, maxWidth:500, margin:'0 auto 32px' }}>
              UNITS and UNIVEN — built with everything the first four attempts taught me.
              Same mission. Different builder.
            </p>
            <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap' }}>
              <Link href="/ventures" className="btn-primary">See what I&apos;m building →</Link>
              <Link href="/connect" className="btn-ghost">Let&apos;s talk ☕</Link>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @media(max-width:860px){
          div[style*="grid-template-columns: repeat(2"]{grid-template-columns:1fr!important;}
          div[style*="grid-template-columns: auto 1fr"]{grid-template-columns:1fr!important;}
          div[style*="grid-template-columns: repeat(3"]{grid-template-columns:1fr!important;}
        }
        @media (max-width: 768px) {
          .about-hero-label {
            font-family: var(--font-mono);
            font-size: 11px;
            color: #52b788;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            text-align: center;
            animation: fadeSlideUp 380ms ease-out both;
            animation-delay: 0ms;
          }
          .about-hero-headline {
            font-family: var(--font-display);
            font-size: clamp(34px, 9vw, 44px);
            text-align: center;
            line-height: 1.15;
            animation: fadeSlideUp 380ms ease-out both;
            animation-delay: 80ms;
          }
          .about-hero-subtext {
            font-family: var(--font-body);
            font-size: 14px;
            opacity: 0.70;
            text-align: center;
            max-width: 280px;
            margin: 0 auto;
            animation: fadeSlideUp 380ms ease-out both;
            animation-delay: 160ms;
          }
          .about-section-label {
            font-family: var(--font-mono);
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.08em;
          }
          .about-timeline-card {
            background: rgba(255,255,255,0.06);
            border: 1px solid rgba(83,183,136,0.20);
            border-left: 3px solid #52b788;
            border-radius: 12px;
            padding: 16px;
            margin-bottom: 16px;
          }
          @keyframes fadeSlideUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        }
      `}</style>
    </Layout>
  )
}
