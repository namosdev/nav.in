import Head from 'next/head'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

// ── Supabase client (reads from .env.local — never commit those keys) ──
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Security: restrict access to authorised email only
// Must match the email registered as admin in Supabase
const ALLOWED_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'your@email.com'

// ── Navigation cards shown on the main dashboard ──
const navCards = [
  {
    href:  '/admin/requests',
    icon:  '📬',
    title: 'Meeting Requests',
    desc:  'View and manage all incoming meeting requests from the Connect page.',
    color: '#2d6a4f',
  },
  {
    href:  '/admin/now',
    icon:  '📍',
    title: 'Now',
    desc:  'Update your monthly "Now" page — what you\'re building, learning, and reading.',
    color: '#1e3a5f',
  },
  {
    href:  '/admin/ventures',
    icon:  '🚀',
    title: 'Ventures',
    desc:  'Edit your UNITS and UNIVEN venture details, status, and highlights.',
    color: '#b45309',
  },
  {
    href:  '/admin/stack',
    icon:  '🧰',
    title: 'Stack',
    desc:  'Update the AI building stack tools and lessons you share publicly.',
    color: '#7c3aed',
  },
  {
    href:  '/admin/homepage',
    icon:  '🏠',
    title: 'Homepage',
    desc:  'Update monthly question · View vote tally',
    color: '#2d6a4f',
  },
]

export default function AdminDashboard() {
  const router = useRouter()

  // ── Auth state ──
  const [user, setUser]               = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  // ── On mount: verify the user is logged in AND is the authorised email ──
  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        // Not authenticated — redirect to login
        router.replace('/admin')
        return
      }

      // Security: second layer — verify authorised email even if session exists
      // This catches any edge case where a different email somehow has a session
      if (session.user.email.toLowerCase() !== ALLOWED_EMAIL.toLowerCase()) {
        await supabase.auth.signOut()
        router.replace('/admin')
        return
      }

      setUser(session.user)
      setAuthLoading(false)
    }

    checkAuth()

    // Listen for auth state changes (e.g., token expiry)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session) router.replace('/admin')
      }
    )
    return () => subscription.unsubscribe()
  }, [router])

  // ── Sign out ──
  async function handleSignOut() {
    await supabase.auth.signOut()
    router.replace('/admin')
  }

  // ── Show a simple loading screen while verifying the session ──
  if (authLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Outfit', sans-serif",
        background: '#f8fafc',
      }}>
        <p style={{ color: '#64748b', fontSize: 14 }}>Verifying session…</p>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Admin Dashboard — Navin Oswal</title>
        {/* Prevent search engines from indexing admin pages */}
        <meta name="robots" content="noindex, nofollow" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'Outfit', sans-serif" }}>

        {/* ── Top navigation bar ── */}
        <header style={{
          background: '#fff',
          borderBottom: '1px solid #e2e8f0',
          padding: '0 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 60,
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}>
          {/* Left: site name + breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <a
              href="/"
              target="_blank"
              rel="noopener"
              style={{ fontSize: 15, fontWeight: 700, color: '#2d6a4f', textDecoration: 'none' }}
            >
              nav.in ↗
            </a>
            <span style={{ color: '#cbd5e1' }}>/</span>
            <span style={{ fontSize: 14, fontWeight: 500, color: '#64748b' }}>Admin</span>
          </div>

          {/* Right: logged-in email + sign out */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 12, color: '#94a3b8' }}>{user?.email}</span>
            <button
              onClick={handleSignOut}
              style={{
                fontSize: 13,
                fontWeight: 500,
                padding: '7px 16px',
                borderRadius: 8,
                border: '1px solid #e2e8f0',
                background: '#fff',
                color: '#475569',
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#fff' }}
            >
              Sign out
            </button>
          </div>
        </header>

        {/* ── Main dashboard content ── */}
        <main style={{ maxWidth: 900, margin: '0 auto', padding: '48px 24px' }}>

          {/* Welcome heading */}
          <div style={{ marginBottom: 40 }}>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>
              Welcome back 👋
            </h1>
            <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6 }}>
              What would you like to manage today?
            </p>
          </div>

          {/* ── 4 Navigation cards ── */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 20,
          }}>
            {navCards.map(card => (
              <NavCard key={card.href} {...card} />
            ))}
          </div>

          {/* ── Quick-access footer row ── */}
          <div style={{
            marginTop: 48,
            paddingTop: 24,
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            gap: 12,
            flexWrap: 'wrap',
          }}>
            <QuickLink href="https://supabase.com/dashboard" label="Supabase Dashboard ↗" />
            <QuickLink href="https://vercel.com/dashboard"   label="Vercel Dashboard ↗" />
            <QuickLink href="https://github.com/namosdev/nav.in" label="GitHub Repo ↗" />
          </div>
        </main>
      </div>
    </>
  )
}

// ── Navigation card component ──────────────────────────────────────────────────
function NavCard({ href, icon, title, desc, color }) {
  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <div style={{
        background: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: 14,
        padding: '24px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.borderColor = color
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = 'none'
        e.currentTarget.style.transform = ''
        e.currentTarget.style.borderColor = '#e2e8f0'
      }}>

        {/* Icon bubble */}
        <div style={{
          width: 48, height: 48, borderRadius: 12,
          background: `${color}12`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22,
        }}>
          {icon}
        </div>

        {/* Title + description */}
        <div>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#0f172a', marginBottom: 6 }}>
            {title}
          </div>
          <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.65 }}>
            {desc}
          </div>
        </div>

        {/* Arrow indicator */}
        <div style={{ fontSize: 13, color: color, fontWeight: 600, marginTop: 'auto' }}>
          Open →
        </div>
      </div>
    </Link>
  )
}

// ── Small quick-access link ────────────────────────────────────────────────────
function QuickLink({ href, label }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      style={{
        fontSize: 12, color: '#64748b',
        padding: '6px 12px', borderRadius: 8,
        border: '1px solid #e2e8f0', background: '#fff',
        textDecoration: 'none', transition: 'all 0.15s',
      }}
      onMouseEnter={e => { e.currentTarget.style.color = '#2d6a4f'; e.currentTarget.style.borderColor = '#2d6a4f' }}
      onMouseLeave={e => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.borderColor = '#e2e8f0' }}
    >
      {label}
    </a>
  )
}
