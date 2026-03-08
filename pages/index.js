import Layout from '../components/Layout'
import Link from 'next/link'

export default function Home() {
  return (
    <Layout>
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
      `}</style>
    </Layout>
  )
}
