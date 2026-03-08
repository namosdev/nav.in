import Layout from '../components/Layout'
import Image from 'next/image'
import Link from 'next/link'

export default function Ventures() {
  return (
    <Layout title="Ventures" description="UNITS — sales made simple. UNIVEN — redefining trust in the Connected Business Ecosystem.">

      <div className="page-header">
        <div className="wrap">
          <p className="eyebrow reveal">Current Ventures</p>
          <h1 className="sec-h reveal" style={{ fontSize:'clamp(42px,5vw,72px)' }}>
            Two bets on the future<br/>of trust and real estate.
          </h1>
          <p className="sec-p reveal">
            Built from a decade of watching what doesn&apos;t work — and finally having
            the decisiveness to build what will. Same mission as always.
            Different builder.
          </p>
        </div>
      </div>

      {/* ══ UNITS ══ */}
      <section className="section">
        <div className="wrap">

          {/* Logo + Name block — dark branded card */}
          <div className="reveal" style={{
            background:'linear-gradient(135deg, #0d1a18 0%, #0a1f1a 100%)',
            borderRadius:28, padding:'52px 56px',
            display:'grid', gridTemplateColumns:'1fr 1fr', gap:48, alignItems:'center',
            marginBottom:24, position:'relative', overflow:'hidden'
          }}>
            {/* Background glow */}
            <div style={{ position:'absolute', top:-60, right:-60, width:300, height:300, borderRadius:'50%', background:'rgba(0,200,170,0.08)', filter:'blur(60px)', pointerEvents:'none' }}/>

            <div>
              <div style={{ marginBottom:32, display:'inline-block', background:'#000', borderRadius:16, padding:16 }}>
                <Image src="/logos/units-logo.png" alt="UNITS" width={220} height={80} style={{ objectFit:'contain' }}/>
              </div>
              <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:10, letterSpacing:'0.2em', textTransform:'uppercase', color:'#52b788', marginBottom:8 }}>
                Real Estate Sales Management
              </div>
              <h2 style={{ fontFamily:'Cormorant Garamond, serif', fontSize:48, fontWeight:600, color:'white', lineHeight:1.0, marginBottom:8 }}>
                Sales made simple.
              </h2>
              <p style={{ fontFamily:'Cormorant Garamond, serif', fontSize:18, fontStyle:'italic', color:'rgba(255,255,255,0.55)', marginBottom:24 }}>
                The simplest tool for an end-to-end customer journey.
              </p>
              <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
                <a href="https://sayunits.com" target="_blank" rel="noopener" style={{
                  display:'inline-flex', alignItems:'center', gap:8,
                  background:'#00c8aa', color:'#0a1f1a',
                  padding:'12px 24px', borderRadius:100,
                  fontSize:14, fontWeight:700, textDecoration:'none',
                  transition:'all 0.25s'
                }}>Visit sayunits.com ↗</a>
                <div style={{
                  display:'inline-flex', alignItems:'center', gap:8,
                  background:'rgba(0,200,170,0.12)', color:'#52b788',
                  padding:'12px 24px', borderRadius:100, fontSize:13, fontWeight:600,
                  border:'1px solid rgba(0,200,170,0.2)'
                }}>
                  <span style={{ width:7, height:7, borderRadius:'50%', background:'#52b788', animation:'pulse 2s infinite', display:'inline-block' }}/>
                  Live & Active
                </div>
              </div>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              {[
                { icon:'🏗️', label:'Part of BasalOS', value:'The Real Estate Operating System' },
                { icon:'👥', label:'Users Served',    value:'2.5 Lakh users' },
                { icon:'🏢', label:'Developers',      value:'4 Real Estate developers' },
                { icon:'🚀', label:'Journey',         value:'0 → 1, actively building' },
                { icon:'🔄', label:'Mission',         value:'Rewriting the OS for real estate' },
              ].map(stat => (
                <div key={stat.label} style={{
                  display:'flex', gap:14, alignItems:'center',
                  padding:'14px 18px', borderRadius:14,
                  background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.08)'
                }}>
                  <span style={{ fontSize:20, flexShrink:0 }}>{stat.icon}</span>
                  <div>
                    <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', marginBottom:2, letterSpacing:'0.04em' }}>{stat.label}</div>
                    <div style={{ fontSize:13, fontWeight:600, color:'rgba(255,255,255,0.85)' }}>{stat.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* UNITS detail cards */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
            {[
              { title:'The Problem I Saw', icon:'🔍',
                body:'A decade inside real estate taught me one thing clearly: sales teams don\'t need more features. They need fewer decisions. Every tool in the market tries to be everything — and ends up being nothing useful.' },
              { title:'What UNITS Does', icon:'⚙️',
                body:'End-to-end customer journey management. From first enquiry to possession. Simple, fast, purpose-built for real estate sales teams. No bloat. No training needed. Just what works.' },
              { title:'Why BasalOS?', icon:'🏛️',
                body:'UNITS is one module inside BasalOS — the real estate operating system. When every module talks to each other, the whole becomes more powerful than the sum of its parts. That\'s the long game.' },
            ].map(c => (
              <div key={c.title} className="glass reveal" style={{ padding:'28px 24px', transition:'all 0.3s' }}
                onMouseEnter={e => e.currentTarget.style.transform='translateY(-4px)'}
                onMouseLeave={e => e.currentTarget.style.transform=''}>
                <span style={{ fontSize:26, display:'block', marginBottom:14 }}>{c.icon}</span>
                <h3 style={{ fontFamily:'Cormorant Garamond, serif', fontSize:18, fontWeight:600, marginBottom:10, color:'#00897b' }}>{c.title}</h3>
                <p style={{ fontSize:13, color:'var(--text-muted)', lineHeight:1.7 }}>{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ UNIVEN ══ */}
      <section className="section">
        <div className="wrap">

          <div className="reveal" style={{
            background:'linear-gradient(135deg, #060c1a 0%, #0a0f22 100%)',
            borderRadius:28, padding:'52px 56px',
            display:'grid', gridTemplateColumns:'1fr 1fr', gap:48, alignItems:'center',
            marginBottom:24, position:'relative', overflow:'hidden'
          }}>
            {/* Background glow */}
            <div style={{ position:'absolute', top:-60, left:-60, width:300, height:300, borderRadius:'50%', background:'rgba(30,80,200,0.1)', filter:'blur(60px)', pointerEvents:'none' }}/>
            <div style={{ position:'absolute', bottom:-40, right:-40, width:200, height:200, borderRadius:'50%', background:'rgba(220,40,40,0.06)', filter:'blur(50px)', pointerEvents:'none' }}/>

            <div>
              <div style={{ marginBottom:32, display:'inline-block', background:'#000', borderRadius:16, padding:16 }}>
                <Image src="/logos/univen-logo.png" alt="UNIVEN" width={220} height={110} style={{ objectFit:'contain' }}/>
              </div>
              <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:10, letterSpacing:'0.2em', textTransform:'uppercase', color:'#93c5fd', marginBottom:8 }}>
                Universal Business Credentials
              </div>
              <h2 style={{ fontFamily:'Cormorant Garamond, serif', fontSize:48, fontWeight:600, color:'white', lineHeight:1.0, marginBottom:8 }}>
                Redefining trust.
              </h2>
              <p style={{ fontFamily:'Cormorant Garamond, serif', fontSize:18, fontStyle:'italic', color:'rgba(255,255,255,0.55)', marginBottom:24 }}>
                In the Connected Business Ecosystem.
              </p>
              <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
                <a href="https://univen.co" target="_blank" rel="noopener" style={{
                  display:'inline-flex', alignItems:'center', gap:8,
                  background:'#1e50c8', color:'white',
                  padding:'12px 24px', borderRadius:100,
                  fontSize:14, fontWeight:700, textDecoration:'none',
                  transition:'all 0.25s'
                }}>Visit univen.co ↗</a>
                <div style={{
                  display:'inline-flex', alignItems:'center', gap:8,
                  background:'rgba(30,80,200,0.15)', color:'#93c5fd',
                  padding:'12px 24px', borderRadius:100, fontSize:13, fontWeight:600,
                  border:'1px solid rgba(30,80,200,0.25)'
                }}>
                  <span style={{ width:7, height:7, borderRadius:'50%', background:'#fbbf24', animation:'pulse 2s infinite', display:'inline-block' }}/>
                  Going Live Soon 🚀
                </div>
              </div>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              {[
                { icon:'🔐', label:'What it is',    value:'Universal Business Credentials platform' },
                { icon:'🌐', label:'Category',      value:'Business Intelligence Catalyst' },
                { icon:'🤝', label:'The Problem',   value:'B2B trust is broken. Every interaction starts with "Can I trust this?"' },
                { icon:'✅', label:'The Solution',  value:'One verified identity — permanent, verifiable, universal' },
                { icon:'📅', label:'Status',        value:'Under active development · Going live soon' },
              ].map(stat => (
                <div key={stat.label} style={{
                  display:'flex', gap:14, alignItems:'flex-start',
                  padding:'14px 18px', borderRadius:14,
                  background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.07)'
                }}>
                  <span style={{ fontSize:20, flexShrink:0 }}>{stat.icon}</span>
                  <div>
                    <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', marginBottom:2, letterSpacing:'0.04em' }}>{stat.label}</div>
                    <div style={{ fontSize:13, fontWeight:600, color:'rgba(255,255,255,0.85)', lineHeight:1.5 }}>{stat.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* UNIVEN detail cards */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
            {[
              { title:'The Trust Problem', icon:'🔍', color:'var(--slate)',
                body:'Every B2B transaction starts with the same friction: can I trust this business? Every vendor verification, every KYC, every due diligence — done repeatedly, from scratch, by everyone.' },
              { title:'The UNIVEN Answer', icon:'🔑', color:'var(--slate)',
                body:'Universal Business Credentials. Answer the trust question once — and have it verified, stored, and shareable across every business relationship. One credential. Infinite trust.' },
              { title:'Why This, Why Now', icon:'⏱️', color:'var(--slate)',
                body:'India\'s Digital Economy is growing but trust infrastructure hasn\'t kept pace. DPDPA 2023 creates the regulatory moment. The OCEN experience taught me to build the infrastructure, not just the application on top.' },
            ].map(c => (
              <div key={c.title} className="glass reveal" style={{ padding:'28px 24px', transition:'all 0.3s' }}
                onMouseEnter={e => e.currentTarget.style.transform='translateY(-4px)'}
                onMouseLeave={e => e.currentTarget.style.transform=''}>
                <span style={{ fontSize:26, display:'block', marginBottom:14 }}>{c.icon}</span>
                <h3 style={{ fontFamily:'Cormorant Garamond, serif', fontSize:18, fontWeight:600, marginBottom:10, color:c.color }}>{c.title}</h3>
                <p style={{ fontSize:13, color:'var(--text-muted)', lineHeight:1.7 }}>{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── THE COMMON THREAD ── */}
      <section className="section-sm">
        <div className="wrap">
          <div className="glass reveal" style={{ padding:'52px 60px', textAlign:'center', background:'linear-gradient(135deg,rgba(45,106,79,0.05),rgba(30,58,95,0.05))' }}>
            <p className="eyebrow" style={{ justifyContent:'center' }}>The Common Thread</p>
            <h3 style={{ fontFamily:'Cormorant Garamond, serif', fontSize:'clamp(26px,3vw,40px)', fontWeight:600, marginBottom:16, lineHeight:1.2 }}>
              Making life easier for businesses in India<br/>using technology.
            </h3>
            <p style={{ fontSize:15, color:'var(--text-muted)', maxWidth:580, margin:'0 auto 32px', lineHeight:1.75 }}>
              This mission hasn&apos;t changed since the first attempt. UNITS does it for real estate sales teams.
              UNIVEN does it for every business that needs to be trusted. Different markets. Same mission.
            </p>
            <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap' }}>
              <Link href="/about" className="btn-ghost">Read the full story →</Link>
              <Link href="/connect" className="btn-primary">Let&apos;s talk ☕</Link>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:0.5;} }
        @media(max-width:860px){
          div[style*="grid-template-columns: 1fr 1fr"]{grid-template-columns:1fr!important;}
          div[style*="grid-template-columns: repeat(3"]{grid-template-columns:1fr!important;}
        }
      `}</style>
    </Layout>
  )
}
