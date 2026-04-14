import Layout from '../components/Layout'
import { useState, useEffect } from 'react'

const CATEGORIES = [
  { id:'all',      label:'All Thoughts',       icon:'✍️' },
  { id:'business', label:'Running a Business', icon:'🏗️' },
  { id:'life',     label:'Living Life',        icon:'🌱' },
  { id:'world',    label:'Evolving World',     icon:'🌍' },
]

function formatDate(str) {
  const d = new Date(str)
  if (isNaN(d)) return ''
  return d.toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })
}

function stripHtml(html) {
  if (typeof window === 'undefined') return ''
  const el = document.createElement('div')
  el.innerHTML = html || ''
  return el.textContent || el.innerText || ''
}

function truncate(str, n) {
  const w = (str || '').trim().split(/\s+/)
  return w.length > n ? w.slice(0,n).join(' ') + '…' : str
}

// Map a post to one of the three category tabs.
// Strategy: check the post's category tags for the exact Substack series name
// first (Substack sends the series name as a <category> in the RSS feed).
// Only fall back to title/keyword guessing when no series name matches.
function guessCategory(item) {
  const cats = (item.categories || []).map(c => c.toLowerCase().trim())

  // Direct series-name match — handles "Evolving World", "Living Life",
  // "Running a Business" exactly as Substack publishes them
  if (cats.some(c => c.includes('evolving world')))     return 'world'
  if (cats.some(c => c.includes('living life')))         return 'life'
  if (cats.some(c => c.includes('running a business'))) return 'business'

  // Fallback keyword scan across title + all tags
  const text = ((item.title || '') + ' ' + cats.join(' ')).toLowerCase()
  if (/startup|founder|product|revenue|customer|sales|execution|venture/.test(text)) return 'business'
  if (/family|personal|health|mind|habit|learn|gratitude|reflect/.test(text))        return 'life'
  if (/india|tech|ai|policy|economy|future|society|change/.test(text))               return 'world'
  return 'business' // default
}

export default function Thoughts() {
  const [posts, setPosts]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState('all')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        // Fetch posts from our server-side API route, which pulls directly
        // from https://namos.substack.com/feed — no third-party service needed
        const res  = await fetch('/api/thoughts-feed')
        const data = await res.json()
        if (data.items?.length) {
          setPosts(data.items.map(p => ({ ...p, _cat: guessCategory(p) })))
        }
      } catch (e) {
        console.error('[thoughts] Failed to load feed:', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const visible = filter === 'all' ? posts : posts.filter(p => p._cat === filter)

  return (
    <Layout title="Thoughts" description="Ideas, observations, and lessons from the intersection of running a business, living life, and navigating an evolving world.">

      <div className="page-header">
        <div className="wrap">
          <p className="eyebrow reveal">Thoughts</p>
          <h1 className="sec-h reveal" style={{ fontSize:'clamp(42px,5vw,72px)' }}>
            Things worth<br/>writing down.
          </h1>
          <p className="sec-p reveal">
            Ideas, observations, and lessons from the intersection of running a business,
            living life, and navigating an evolving world.
            Published on Substack — mirrored here automatically.
          </p>
          <div className="reveal" style={{ marginTop:24, display:'flex', gap:12, flexWrap:'wrap' }}>
            <a href="https://substack.com/@navinoswal" target="_blank" rel="noopener" className="btn-primary" style={{ fontSize:13 }}>
              Subscribe on Substack ↗
            </a>
          </div>
        </div>
      </div>

      {/* ── CATEGORY FILTER ── */}
      <section className="section-sm" style={{ paddingBottom:0 }}>
        <div className="wrap">
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {CATEGORIES.map(cat => (
              <button key={cat.id} onClick={() => setFilter(cat.id)} style={{
                display:'inline-flex', alignItems:'center', gap:7,
                padding:'10px 20px', borderRadius:100, border:'none',
                fontSize:13, fontWeight:600, cursor:'pointer', transition:'all 0.25s',
                background: filter === cat.id ? 'var(--sage)' : 'rgba(255,255,255,0.7)',
                color: filter === cat.id ? 'white' : 'var(--text-muted)',
                boxShadow: filter === cat.id ? '0 4px 14px rgba(45,106,79,0.25)' : 'none',
                backdropFilter:'blur(8px)',
              }}>
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── POSTS ── */}
      <section className="section">
        <div className="wrap">
          {loading && (
            <div style={{ textAlign:'center', padding:'60px 20px', color:'var(--text-muted)' }}>
              Loading thoughts...
            </div>
          )}

          {!loading && visible.length === 0 && (
            <div style={{ textAlign:'center', padding:'60px 20px' }}>
              <div style={{ fontFamily:'Cormorant Garamond, serif', fontSize:28, marginBottom:12 }}>Thoughts coming soon.</div>
              <p style={{ color:'var(--text-muted)', fontSize:14, marginBottom:24 }}>
                {posts.length === 0
                  ? 'The first post is being written. Subscribe to be notified.'
                  : 'No posts in this category yet.'}
              </p>
              <a href="https://substack.com/@navinoswal" target="_blank" rel="noopener" className="btn-primary">
                Subscribe on Substack ↗
              </a>
            </div>
          )}

          {!loading && visible.length > 0 && (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:20 }}>
              {visible.map((post, i) => {
                const catInfo = CATEGORIES.find(c => c.id === post._cat) || CATEGORIES[1]
                const isFirst = i === 0 && filter === 'all'
                return (
                  <div key={i}
                    className="glass reveal"
                    onClick={() => setSelected(post)}
                    style={{
                      padding:'32px 28px', cursor:'pointer', transition:'all 0.35s',
                      display:'flex', flexDirection:'column',
                      gridColumn: isFirst ? 'span 2' : 'span 1',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform='translateY(-5px)'; e.currentTarget.style.boxShadow='var(--g-shadow-lg)' }}
                    onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                      <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:10, letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--text-muted)' }}>
                        {formatDate(post.pubDate)}
                      </div>
                      <span style={{ fontSize:11, padding:'3px 10px', borderRadius:100, background:'var(--sage-bg)', color:'var(--sage)', fontWeight:600 }}>
                        {catInfo.icon} {catInfo.label}
                      </span>
                    </div>
                    <h3 style={{
                      fontFamily:'Cormorant Garamond, serif',
                      fontSize: isFirst ? 28 : 20,
                      fontWeight:600, lineHeight:1.25, marginBottom:12, color:'var(--text)', flex:1
                    }}>{post.title}</h3>
                    <p style={{ fontSize:13, color:'var(--text-muted)', lineHeight:1.7, marginBottom:18 }}>
                      {truncate(stripHtml(post.description || post.content || ''), isFirst ? 45 : 28)}
                    </p>
                    {(post.categories || []).length > 0 && (
                      <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:14 }}>
                        {post.categories.slice(0,3).map(t => <span key={t} className="mono-tag mt-sage">{t}</span>)}
                      </div>
                    )}
                    <span style={{ fontSize:13, fontWeight:600, color:'var(--sage)', display:'inline-flex', alignItems:'center', gap:6 }}>
                      Read more →
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── POST MODAL ── */}
      {selected && (
        <div
          onClick={e => { if (e.target === e.currentTarget) setSelected(null) }}
          style={{
            position:'fixed', inset:0, zIndex:200,
            background:'rgba(15,23,42,0.65)',
            backdropFilter:'blur(8px)', WebkitBackdropFilter:'blur(8px)',
            display:'flex', alignItems:'flex-start', justifyContent:'center',
            // clamp top padding so the modal sits lower on desktop but
            // doesn't waste space on mobile
            padding:'clamp(16px,6vh,72px) 16px 48px',
            overflowY:'auto',
          }}>
          {/* Panel — comfortable max-width and responsive horizontal padding */}
          <div className="glass" style={{
            maxWidth:680, width:'100%',
            padding:'40px clamp(24px,5vw,48px)',
            position:'relative', animation:'modalIn 0.35s ease',
          }}>
            <button onClick={() => setSelected(null)} style={{
              position:'absolute', top:16, right:16, width:36, height:36, borderRadius:'50%',
              border:'none', background:'rgba(255,255,255,0.8)', cursor:'pointer', fontSize:16,
              display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-muted)'
            }}>✕</button>

            <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:11, letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--text-muted)', marginBottom:14 }}>
              {formatDate(selected.pubDate)}
            </div>
            <h2 style={{ fontFamily:'Cormorant Garamond, serif', fontSize:'clamp(24px,3.5vw,38px)', fontWeight:600, lineHeight:1.2, marginBottom:20 }}>
              {selected.title}
            </h2>
            {(selected.categories || []).length > 0 && (
              <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:24 }}>
                {selected.categories.map(t => <span key={t} className="mono-tag mt-sage">{t}</span>)}
              </div>
            )}
            {/* Rendered HTML body — prose class provides readable typography */}
            <div className="modal-prose" style={{ fontSize:15, lineHeight:1.85, color:'var(--text-mid)' }}
              dangerouslySetInnerHTML={{ __html: selected.content || selected.description || '' }}/>
            <hr style={{ border:'none', borderTop:'1px solid rgba(45,106,79,0.12)', margin:'28px 0' }}/>
            <div style={{ display:'flex', gap:12, alignItems:'center', flexWrap:'wrap' }}>
              <span style={{ fontSize:13, color:'var(--text-muted)' }}>Share or read on Substack:</span>
              <a href={selected.link} target="_blank" rel="noopener"
                style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'9px 18px', borderRadius:100,
                  background:'rgba(255,102,0,0.1)', color:'#e05a00', fontSize:12, fontWeight:600, textDecoration:'none' }}>
                📖 Read on Substack
              </a>
              <button onClick={() => {
                const url = selected.link
                navigator.clipboard.writeText(url)
                  .then(() => alert('Link copied!'))
                  .catch(() => {})
              }} style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'9px 18px', borderRadius:100,
                background:'rgba(45,106,79,0.1)', color:'var(--sage)', fontSize:12, fontWeight:600, border:'none', cursor:'pointer' }}>
                🔗 Copy link
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes modalIn { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }

        /* ── Prose styles for Substack HTML rendered inside the modal ── */
        .modal-prose p            { margin: 0 0 1em; }
        .modal-prose h2           { font-family:'Cormorant Garamond',serif; font-size:1.45em; font-weight:600; line-height:1.2; margin:1.6em 0 0.5em; }
        .modal-prose h3           { font-family:'Cormorant Garamond',serif; font-size:1.2em;  font-weight:600; line-height:1.25; margin:1.3em 0 0.4em; }
        .modal-prose a            { color:var(--sage); text-decoration:underline; }
        .modal-prose strong, .modal-prose b { font-weight:600; }
        .modal-prose em, .modal-prose i     { font-style:italic; }
        .modal-prose img          { max-width:100%; height:auto; border-radius:8px; margin:1em 0; display:block; }
        .modal-prose blockquote   { border-left:3px solid var(--sage); margin:1.2em 0; padding:0.5em 1em; background:rgba(45,106,79,0.05); font-style:italic; border-radius:0 6px 6px 0; }
        .modal-prose ul, .modal-prose ol { padding-left:1.4em; margin:0.6em 0 1em; }
        .modal-prose li           { margin-bottom:0.35em; line-height:1.75; }
        .modal-prose hr           { border:none; border-top:1px solid rgba(45,106,79,0.15); margin:1.5em 0; }
        .modal-prose pre          { background:rgba(0,0,0,0.05); border-radius:6px; padding:1em; overflow-x:auto; font-size:13px; }

        @media(max-width:860px){
          div[style*="grid-template-columns: repeat(3"]{grid-template-columns:1fr!important;}
          div[style*="grid-column: span 2"]{grid-column:span 1!important;}
        }
      `}</style>
    </Layout>
  )
}
