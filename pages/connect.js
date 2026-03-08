import Layout from '../components/Layout'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

// ── Replace with your actual values ──
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_PROJECT_URL'
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_KEY || 'YOUR_PUBLISHABLE_KEY'

const goodAreas = [
  {
    icon: '🌿',
    title: 'Ecology & Environment',
    desc: 'Urban greening, carbon awareness, sustainable building practices in real estate. A sector I\'m in daily — and one that moves too slowly on this front.',
    color: 'var(--sage)',
  },
  {
    icon: '💧',
    title: 'Water',
    desc: 'Water conservation, access, and management in urban India. Pune faces real pressure on this. If there\'s a technology angle to explore, I want to be in that conversation.',
    color: 'var(--slate)',
  },
  {
    icon: '📚',
    title: 'Education',
    desc: 'Particularly first-generation learners and bridging the gap between domain knowledge and technology literacy. This is a problem I navigate personally — and can contribute to meaningfully.',
    color: 'var(--amber)',
  },
  {
    icon: '🤝',
    title: 'Social Good',
    desc: 'Any intersection of technology and public welfare where a builder + finance mind can contribute. Open to the problem — I don\'t need the category to be predefined.',
    color: '#7c3aed',
  },
]

export default function Connect() {
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [message, setMessage]   = useState('')
  const [meetType, setMeetType] = useState('online')
  const [status, setStatus]     = useState(null) // null | 'loading' | 'success' | 'error'
  const [db, setDb]             = useState(null)

  useEffect(() => {
    if (SUPABASE_URL !== 'YOUR_PROJECT_URL') {
      setDb(createClient(SUPABASE_URL, SUPABASE_KEY))
    }
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !message.trim()) {
      setStatus('validation')
      return
    }
    if (!email.includes('@')) {
      setStatus('email')
      return
    }
    setStatus('loading')
    try {
      if (db) {
        const { error } = await db.from('meeting_requests').insert([{ name, email, message, meeting_type: meetType }])
        if (error) throw error
      }
      setStatus('success')
      setName(''); setEmail(''); setMessage('')
    } catch (err) {
      console.error(err)
      setStatus('error')
    }
  }

  return (
    <Layout title="Connect" description="Let's meet over chai or coffee. Open to conversations, collaborations, and contributing to good work.">

      <div className="page-header">
        <div className="wrap">
          <p className="eyebrow reveal">Connect</p>
          <h1 className="sec-h reveal" style={{ fontSize:'clamp(42px,5vw,72px)' }}>
            Let&apos;s meet.
          </h1>
          <p className="sec-p reveal">
            Open to interesting conversations, constructive debates, new ideas,
            and collaborations that matter. If you have a problem worth solving
            or a perspective worth sharing — reach out.
          </p>
        </div>
      </div>

      {/* ── MEET FORM ── */}
      <section id="meet" className="section">
        <div className="wrap">
          <div className="glass reveal" style={{
            padding:'52px 56px',
            background:'linear-gradient(135deg,rgba(45,106,79,0.04),rgba(82,183,136,0.04))',
            border:'1px solid rgba(45,106,79,0.1)'
          }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:52, alignItems:'start' }}>

              {/* Left — Info */}
              <div>
                <h2 style={{ fontFamily:'Cormorant Garamond, serif', fontSize:'clamp(28px,3vw,44px)', fontWeight:600, lineHeight:1.15, marginBottom:16 }}>
                  Over <em style={{ color:'var(--sage)' }}>chai or coffee.</em>
                </h2>
                <p style={{ fontSize:15, color:'var(--text-muted)', lineHeight:1.75, marginBottom:28 }}>
                  Based in Pune. Open to in-person meets in the city or online conversations globally.
                  I care most about conversations that challenge assumptions and leave both sides thinking.
                </p>

                <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:28 }}>
                  {[
                    { emoji:'📧', label:'navinoswalz@gmail.com', href:'mailto:navinoswalz@gmail.com' },
                    { emoji:'💼', label:'LinkedIn ↗',            href:'https://www.linkedin.com/in/namoswal/' },
                    { emoji:'✍️', label:'Substack ↗',            href:'https://substack.com/@navinoswal' },
                    { emoji:'🏗️', label:'UNITS — sayunits.com ↗', href:'https://sayunits.com' },
                    { emoji:'🔗', label:'UNIVEN — univen.co ↗',   href:'https://univen.co' },
                  ].map(link => (
                    <a key={link.label} href={link.href}
                      target={link.href.startsWith('mailto') ? undefined : '_blank'}
                      rel="noopener"
                      style={{
                        display:'flex', alignItems:'center', gap:10,
                        padding:'12px 18px', borderRadius:12,
                        background:'rgba(255,255,255,0.65)', border:'1px solid rgba(255,255,255,0.9)',
                        fontSize:13, fontWeight:500, color:'var(--text-mid)',
                        textDecoration:'none', transition:'all 0.25s'
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,0.9)'; e.currentTarget.style.color='var(--sage)'; e.currentTarget.style.transform='translateX(4px)' }}
                      onMouseLeave={e => { e.currentTarget.style.background=''; e.currentTarget.style.color=''; e.currentTarget.style.transform='' }}>
                      <span>{link.emoji}</span> {link.label}
                    </a>
                  ))}
                </div>

                <div style={{ padding:'16px 20px', borderRadius:12, background:'rgba(45,106,79,0.06)', border:'1px solid rgba(45,106,79,0.1)', fontSize:13, color:'var(--text-muted)', lineHeight:1.7 }}>
                  <strong style={{ color:'var(--sage)' }}>What I&apos;m open to:</strong> Product conversations, real estate tech, business trust infrastructure, AI-assisted building, founder-to-founder exchange, mentorship (either direction), and any problem that starts with a genuine "why".
                </div>
              </div>

              {/* Right — Form */}
              <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                  <div className="field">
                    <label>Your Name</label>
                    <input type="text" placeholder="e.g. Rahul Sharma" value={name} onChange={e => setName(e.target.value)}/>
                  </div>
                  <div className="field">
                    <label>Email Address</label>
                    <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)}/>
                  </div>
                </div>

                <div className="field">
                  <label>What&apos;s on your mind?</label>
                  <textarea placeholder="Share a bit about what you'd like to discuss — a problem, an idea, a collaboration, or just a perspective worth exchanging..." value={message} onChange={e => setMessage(e.target.value)}/>
                </div>

                <div className="field">
                  <label>Meeting Preference</label>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                    {[
                      { val:'online',  label:'💻 Online' },
                      { val:'offline', label:'☕ In-person, Pune' },
                    ].map(opt => (
                      <button key={opt.val} type="button" onClick={() => setMeetType(opt.val)} style={{
                        padding:'12px', borderRadius:12, cursor:'pointer', transition:'all 0.25s',
                        border: meetType === opt.val ? '1px solid var(--sage)' : '1px solid rgba(45,106,79,0.2)',
                        background: meetType === opt.val ? 'rgba(45,106,79,0.1)' : 'rgba(255,255,255,0.6)',
                        color: meetType === opt.val ? 'var(--sage)' : 'var(--text-muted)',
                        fontWeight: meetType === opt.val ? 600 : 400,
                        fontSize:13
                      }}>{opt.label}</button>
                    ))}
                  </div>
                </div>

                {status === 'validation' && <div className="form-status error" style={{display:'block'}}>⚠️ Please fill in all fields.</div>}
                {status === 'email'      && <div className="form-status error" style={{display:'block'}}>⚠️ Please enter a valid email.</div>}
                {status === 'error'      && <div className="form-status error" style={{display:'block'}}>❌ Something went wrong. Email me directly at navinoswalz@gmail.com</div>}
                {status === 'success'    && <div className="form-status success" style={{display:'block'}}>✅ Sent! I&apos;ll get back to you soon over chai or coffee.</div>}

                <button type="submit" className="btn-primary" disabled={status === 'loading'} style={{ width:'100%', justifyContent:'center', fontSize:15, padding:'15px' }}>
                  {status === 'loading' ? 'Sending...' : 'Send Request ☕'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ── BETTER & MORE HUMAN ── */}
      <section id="good" className="section">
        <div className="wrap">
          <p className="eyebrow reveal">Beyond Business</p>
          <h2 className="sec-h reveal">Better &amp; more human<br/>in an otherwise material world.</h2>
          <p className="sec-p reveal" style={{ marginBottom:48 }}>
            Business is one dimension. I also want to contribute — in whatever way I can — to the
            problems that don&apos;t have clear profit margins but matter deeply.
            If you&apos;re working on any of these, I want to know you.
          </p>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:20 }}>
            {goodAreas.map((area, i) => (
              <div key={i} className="glass reveal" style={{
                padding:'36px 32px', position:'relative', overflow:'hidden', transition:'all 0.35s'
              }}
              onMouseEnter={e => { e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='var(--g-shadow-lg)' }}
              onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='' }}>
                <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:area.color, opacity:0.6, borderRadius:'20px 20px 0 0' }}/>
                <div style={{ fontSize:36, marginBottom:16 }}>{area.icon}</div>
                <h3 style={{ fontFamily:'Cormorant Garamond, serif', fontSize:24, fontWeight:600, marginBottom:10, color:area.color }}>
                  {area.title}
                </h3>
                <p style={{ fontSize:14, color:'var(--text-muted)', lineHeight:1.75 }}>{area.desc}</p>
              </div>
            ))}
          </div>

          <div className="glass reveal" style={{
            marginTop:28, padding:'36px 40px',
            background:'linear-gradient(135deg,rgba(45,106,79,0.04),rgba(30,58,95,0.04))',
            border:'1px solid rgba(45,106,79,0.1)',
            display:'flex', gap:28, alignItems:'center', flexWrap:'wrap', justifyContent:'space-between'
          }}>
            <div>
              <h3 style={{ fontFamily:'Cormorant Garamond, serif', fontSize:24, fontWeight:600, marginBottom:8 }}>
                Working on something that matters?
              </h3>
              <p style={{ fontSize:14, color:'var(--text-muted)', maxWidth:480, lineHeight:1.7 }}>
                I&apos;m not looking to just donate or advise from a distance. I want to contribute — as a builder, as a thinking partner, as someone who can bring domain expertise and technology into problems worth solving.
              </p>
            </div>
            <a href="mailto:navinoswalz@gmail.com?subject=Let's collaborate on something that matters"
              className="btn-primary" style={{ flexShrink:0 }}>
              Let&apos;s talk about it ↗
            </a>
          </div>
        </div>
      </section>

      <style>{`
        @media(max-width:860px){
          div[style*="grid-template-columns: 1fr 1fr"]{grid-template-columns:1fr!important;}
          div[style*="grid-template-columns: repeat(2"]{grid-template-columns:1fr!important;}
        }
      `}</style>
    </Layout>
  )
}
