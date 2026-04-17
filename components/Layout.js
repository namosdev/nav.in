import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'

// ── Navigation ──────────────────────────────────────────
function Nav() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const links = [
    { href: '/about',    label: 'About' },
    { href: '/ventures', label: 'Ventures' },
    { href: '/thoughts', label: 'Thoughts' },
    { href: '/now',      label: 'Now' },
    { href: '/stack',    label: 'Stack' },
    { href: '/connect',  label: 'Connect' },
  ]

  return (
    <>
      <nav className="nav" style={{ boxShadow: scrolled ? '0 2px 20px rgba(45,106,79,0.08)' : 'none' }}>
        <Link href="/" className="nav-logo">
          Navin <span>Oswal</span>
        </Link>
        <ul className="nav-links">
          {links.map(l => (
            <li key={l.href}>
              <Link href={l.href} className={router.pathname === l.href ? 'active' : ''}>
                {l.label}
              </Link>
            </li>
          ))}
          <li>
            <Link href="/connect#meet" className="nav-links a nav-cta"
              style={{ background:'var(--sage)', color:'white', padding:'8px 20px',
                       borderRadius:'100px', fontSize:'13px', fontWeight:600 }}>
              Let&apos;s meet ☕
            </Link>
          </li>
        </ul>
        <button className="nav-mobile-toggle" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? '✕' : '☰'}
        </button>
      </nav>

      {/* Mobile menu */}
      <div className={`nav-mobile ${open ? 'open' : ''}`}>
        {links.map(l => (
          <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
            className={router.pathname === l.href ? 'active' : ''}>
            {l.label}
          </Link>
        ))}
        <Link href="/connect#meet" onClick={() => setOpen(false)}
          style={{ color:'var(--sage)', fontWeight:600 }}>
          Let&apos;s meet ☕
        </Link>
      </div>
    </>
  )
}

// ── Footer ───────────────────────────────────────────────
function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-inner">
          <div className="footer-name">Navin <span>Oswal</span></div>
          <ul className="footer-links">
            <li><Link href="/about">About</Link></li>
            <li><Link href="/ventures">Ventures</Link></li>
            <li><Link href="/thoughts">Thoughts</Link></li>
            <li><Link href="/now">Now</Link></li>
            <li><Link href="/stack">Stack</Link></li>
            <li><a href="https://www.linkedin.com/in/namoswal/" target="_blank" rel="noopener">LinkedIn ↗</a></li>
            <li><a href="https://substack.com/@navinoswal" target="_blank" rel="noopener">Substack ↗</a></li>
          </ul>
          <div className="footer-copy">Curious · Optimist · Builder · Pune</div>
        </div>
      </div>
    </footer>
  )
}

// ── Layout ────────────────────────────────────────────────
export default function Layout({ children, title, description }) {
  const metaTitle = title ? `${title} — Navin Oswal` : 'Navin Oswal — Curious by Nature. Optimist by Choice.'
  const metaDesc  = description || 'CA, Co-Founder of UNITS & UNIVEN, builder from Pune. 15,000 deliberate hours and still compounding.'

  useEffect(() => {
    // Scroll reveal
    const elements = document.querySelectorAll('.reveal')
    elements.forEach(el => el.classList.add('anim'))

    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          setTimeout(() => { e.target.classList.add('on'); obs.unobserve(e.target) }, i * 60)
        }
      })
    }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' })

    elements.forEach(el => obs.observe(el))

    // Safety: reveal anything still hidden after 2s
    const safety = setTimeout(() => {
      document.querySelectorAll('.reveal.anim:not(.on)').forEach(el => el.classList.add('on'))
    }, 2000)

    return () => { obs.disconnect(); clearTimeout(safety) }
  })

  return (
    <>
      <Head>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDesc} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDesc} />
        <meta property="og:type" content="website" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Animated background — shared across all pages */}
      {/* b3 and b4 are hidden on mobile via .mobile-blob-hidden (see globals.css) */}
      <div className="bg-layer">
        <div className="blob b1" /><div className="blob b2" />
        <div className="blob b3 mobile-blob-hidden" /><div className="blob b4 mobile-blob-hidden" />
      </div>

      <Nav />
      <main className="page-content">{children}</main>
      <Footer />
    </>
  )
}
