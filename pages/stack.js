import Layout from '../components/Layout'
import Link from 'next/link'

const stack = [
  {
    name: 'Claude',
    role: 'AI Thinking Partner & Builder',
    icon: '🧠',
    what: 'The core of everything. Not just code generation — architectural thinking, content writing, design decisions, debugging, and strategy. Claude is the first conversation before any line of code is written.',
    howIUseIt: 'I treat Claude as a co-founder who has no ego. I describe problems, not solutions. The output quality depends entirely on how well I ask the question.',
    color: '#7c3aed',
  },
  {
    name: 'Next.js',
    role: 'Frontend Framework',
    icon: '⚡',
    what: 'React-based framework for building multi-page websites. One file = one page. Shared components written once, used everywhere. Vercel (the company behind Next.js) makes deployment seamless.',
    howIUseIt: 'This website is built entirely in Next.js. Previously used plain HTML — the upgrade was necessary once we went beyond a single landing page.',
    color: '#000',
  },
  {
    name: 'Supabase',
    role: 'Backend & Database',
    icon: '🗄️',
    what: 'Postgres database + authentication + real-time + storage — all in one. The backend layer I never have to think about. Write SQL once, the API is auto-generated.',
    howIUseIt: 'Meeting request forms, dynamic data, anything that needs to persist. The RLS (Row Level Security) system means the database is safe to connect directly from the frontend.',
    color: '#3ecf8e',
  },
  {
    name: 'GitHub',
    role: 'Version Control & Source',
    icon: '🐙',
    what: 'Every file, every change, every version — tracked. The source of truth for all code. Also the trigger that starts the deployment pipeline automatically.',
    howIUseIt: 'I push changes to GitHub → Vercel detects the push → site updates in 30 seconds. No manual deployment needed.',
    color: '#24292e',
  },
  {
    name: 'Vercel',
    role: 'Deployment & Hosting',
    icon: '🚀',
    what: 'The deployment platform made by the same team as Next.js. Connects to GitHub, builds and deploys automatically on every push. Free tier handles everything at this scale.',
    howIUseIt: 'Zero-config deployment. Connect once, forget forever. Every push to GitHub = live site update in under a minute.',
    color: '#000',
  },
  {
    name: 'Lovable.dev',
    role: 'Rapid Prototyping',
    icon: '💜',
    what: 'AI-powered frontend builder. Describe what you want in plain English, get working React code. Best for fast prototypes and exploring UI ideas before committing to production code.',
    howIUseIt: 'Early-stage experiments and UI exploration. When I want to see something quickly without writing code first.',
    color: '#8b5cf6',
  },
]

const lessons = [
  {
    title: 'Prompting is a skill, not a shortcut',
    body: 'The quality of AI output is entirely a function of how well you describe the problem. "Make a button" and "Make a primary call-to-action button in sage green that scales on hover with a subtle shadow" produce wildly different results. Investment in learning to prompt = compound returns.',
  },
  {
    title: 'Components before pages',
    body: 'Build the navigation and footer first. These are shared. Everything else is unique per page. I wasted time on landing pages with copy-pasted nav because I didn\'t know about components. Never again.',
  },
  {
    title: 'Your database schema is your architecture',
    body: 'Supabase tables are simple — but the decisions you make about structure shape everything downstream. Think about what data you\'re collecting and how you\'ll query it before creating the table.',
  },
  {
    title: 'Ship → observe → fix → ship',
    body: 'The cycle time matters more than the perfect build. A live site with three bugs teaches you more than a perfect local version nobody sees. GitHub → Vercel makes this loop fast enough to be useful.',
  },
  {
    title: 'Design system first, pages second',
    body: 'The most valuable thing I built was a consistent set of CSS variables (colours, fonts, radius, shadow) before touching any page. Changing the sage green now means changing one line, not 40.',
  },
  {
    title: 'Domain expertise is the actual differentiator',
    body: 'An AI tool doesn\'t know what a real estate sales team needs. I do. The intersection of "knows the domain deeply" + "can now build using AI" is where the competitive moat lives.',
  },
]

const experiments = [
  { name: 'Personal Website v1', desc: 'Single HTML landing page. Form connected to Supabase.', status: 'Shipped', link: null },
  { name: 'Personal Website v2', desc: 'Full multi-page Next.js site. This site.', status: 'Live', link: null },
  { name: 'Meeting Request Form', desc: 'Supabase table → RLS policy → live form. Responses in database.', status: 'Live', link: '/connect' },
  { name: 'Substack RSS Mirror', desc: 'Auto-fetching Substack posts and displaying them in custom design via RSS2JSON.', status: 'Live', link: '/thoughts' },
]

export default function Stack() {
  return (
    <Layout title="Stack" description="How Navin Oswal builds — tools, learnings, and honest notes from a non-coder building with AI.">

      <div className="page-header">
        <div className="wrap">
          <p className="eyebrow reveal">How I Build</p>
          <h1 className="sec-h reveal" style={{ fontSize:'clamp(42px,5vw,72px)' }}>
            The Stack.
          </h1>
          <p className="sec-p reveal">
            A non-coder&apos;s toolkit for building real products. Honest notes on what works,
            what surprised me, and what I&apos;d do differently. Not a tutorial — a practitioner&apos;s log.
          </p>
          <div className="reveal" style={{ marginTop:20 }}>
            <span className="chip chip-sage">~6 months of AI-assisted building</span>
          </div>
        </div>
      </div>

      {/* ── THE STACK ── */}
      <section className="section">
        <div className="wrap">
          <p className="eyebrow reveal">The Tools</p>
          <h2 className="sec-h reveal" style={{ fontSize:36 }}>Six tools. One workflow.</h2>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:20, marginTop:40 }}>
            {stack.map((tool, i) => (
              <div key={i} className="glass reveal" style={{ padding:'32px 28px', position:'relative', overflow:'hidden', transition:'all 0.3s' }}
                onMouseEnter={e => { e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='var(--g-shadow-lg)' }}
                onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='' }}>
                <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:tool.color === '#000' ? 'var(--text)' : tool.color, opacity:0.5 }}/>

                <div style={{ display:'flex', gap:14, alignItems:'flex-start', marginBottom:16 }}>
                  <div style={{ fontSize:32 }}>{tool.icon}</div>
                  <div>
                    <h3 style={{ fontFamily:'Cormorant Garamond, serif', fontSize:24, fontWeight:600 }}>{tool.name}</h3>
                    <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:10, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--text-muted)' }}>{tool.role}</div>
                  </div>
                </div>

                <p style={{ fontSize:13, color:'var(--text-muted)', lineHeight:1.7, marginBottom:14 }}>{tool.what}</p>

                <div style={{ padding:'12px 16px', borderRadius:10, background:'rgba(45,106,79,0.05)', borderLeft:'3px solid var(--sage)' }}>
                  <div style={{ fontSize:10, fontWeight:700, color:'var(--sage)', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:4 }}>How I actually use it</div>
                  <p style={{ fontSize:12, color:'var(--text-muted)', lineHeight:1.65 }}>{tool.howIUseIt}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW THEY CONNECT ── */}
      <section className="section" style={{ paddingTop:0 }}>
        <div className="wrap">
          <p className="eyebrow reveal">The Workflow</p>
          <h2 className="sec-h reveal" style={{ fontSize:36 }}>How it all connects.</h2>
          <div className="glass reveal" style={{ padding:'40px 48px', marginTop:36 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:0, flexWrap:'wrap' }}>
              {[
                { icon:'🧠', label:'Claude', sub:'Think & design' },
                { arrow:'→' },
                { icon:'✍️', label:'Write code', sub:'Files created' },
                { arrow:'→' },
                { icon:'🐙', label:'GitHub', sub:'Push & store' },
                { arrow:'→' },
                { icon:'🚀', label:'Vercel', sub:'Auto-deploy' },
                { arrow:'→' },
                { icon:'🌐', label:'Live site', sub:'In ~30 seconds' },
              ].map((item, i) => item.arrow ? (
                <div key={i} style={{ fontSize:20, color:'var(--sage)', padding:'0 12px', fontWeight:300 }}>{item.arrow}</div>
              ) : (
                <div key={i} style={{ textAlign:'center', padding:'8px 20px' }}>
                  <div style={{ fontSize:28, marginBottom:4 }}>{item.icon}</div>
                  <div style={{ fontSize:13, fontWeight:600 }}>{item.label}</div>
                  <div style={{ fontSize:11, color:'var(--text-muted)' }}>{item.sub}</div>
                </div>
              ))}
            </div>
            <div style={{ borderTop:'1px solid rgba(45,106,79,0.1)', marginTop:32, paddingTop:20, fontSize:13, color:'var(--text-muted)', lineHeight:1.7, textAlign:'center' }}>
              Supabase sits separately — connected via URL + publishable key. Any page that needs to store or retrieve data talks to it directly.
              No server. No backend code to maintain. Just a database URL in the config.
            </div>
          </div>
        </div>
      </section>

      {/* ── LESSONS ── */}
      <section className="section" style={{ paddingTop:0 }}>
        <div className="wrap">
          <p className="eyebrow reveal">Honest Lessons</p>
          <h2 className="sec-h reveal" style={{ fontSize:36 }}>What actually surprised me.</h2>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:16, marginTop:36 }}>
            {lessons.map((l, i) => (
              <div key={i} className="glass reveal" style={{ padding:'28px 24px', transition:'all 0.3s' }}
                onMouseEnter={e => e.currentTarget.style.transform='translateY(-3px)'}
                onMouseLeave={e => e.currentTarget.style.transform=''}>
                <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:9, letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--amber)', marginBottom:10 }}>Lesson {i+1}</div>
                <h3 style={{ fontFamily:'Cormorant Garamond, serif', fontSize:19, fontWeight:600, marginBottom:10 }}>{l.title}</h3>
                <p style={{ fontSize:13, color:'var(--text-muted)', lineHeight:1.7 }}>{l.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── EXPERIMENTS ── */}
      <section className="section" style={{ paddingTop:0 }}>
        <div className="wrap">
          <p className="eyebrow reveal">What I&apos;ve Built</p>
          <h2 className="sec-h reveal" style={{ fontSize:36 }}>Experiments from the playground.</h2>
          <div style={{ display:'flex', flexDirection:'column', gap:12, marginTop:36 }}>
            {experiments.map((exp, i) => (
              <div key={i} className="glass reveal" style={{ padding:'20px 28px', display:'flex', alignItems:'center', gap:16, flexWrap:'wrap', transition:'all 0.3s' }}
                onMouseEnter={e => e.currentTarget.style.transform='translateX(4px)'}
                onMouseLeave={e => e.currentTarget.style.transform=''}>
                <div style={{ width:8, height:8, borderRadius:'50%', background: exp.status==='Live' ? 'var(--sage)' : 'var(--amber)', flexShrink:0, animation:'pulse 2s infinite' }}/>
                <div style={{ flex:1 }}>
                  <span style={{ fontWeight:600, marginRight:10 }}>{exp.name}</span>
                  <span style={{ fontSize:13, color:'var(--text-muted)' }}>{exp.desc}</span>
                </div>
                <span style={{ fontSize:11, padding:'3px 12px', borderRadius:100,
                  background: exp.status==='Live' ? 'rgba(45,106,79,0.1)' : 'rgba(180,83,9,0.1)',
                  color: exp.status==='Live' ? 'var(--sage)' : 'var(--amber)', fontWeight:600 }}>
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
          <div className="glass reveal" style={{ padding:'44px 52px', display:'flex', gap:32, alignItems:'center', flexWrap:'wrap', justifyContent:'space-between' }}>
            <div>
              <h3 style={{ fontFamily:'Cormorant Garamond, serif', fontSize:28, fontWeight:600, marginBottom:8 }}>
                Curious about the process?
              </h3>
              <p style={{ fontSize:14, color:'var(--text-muted)' }}>I write about building here — in the context of a non-coder founder navigating the AI engineering world.</p>
            </div>
            <div style={{ display:'flex', gap:12, flexWrap:'wrap', flexShrink:0 }}>
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
