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
const ALLOWED_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'your@email.com'

export default function AdminNow() {
  const router = useRouter()

  // ── Auth state ──
  const [user, setUser]               = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  // ── Form state — mirrors the now_content table columns ──
  const [rowId,     setRowId]     = useState(null)
  const [focusText, setFocusText] = useState('')
  const [building,  setBuilding]  = useState('')
  const [reading,   setReading]   = useState('')
  const [thinking,  setThinking]  = useState('')
  const [updatedAt, setUpdatedAt] = useState(null)

  // ── UI state ──
  const [dataLoading, setDataLoading] = useState(false)
  const [saveStatus,  setSaveStatus]  = useState(null) // null | 'saving' | 'success' | 'error'

  // ── On mount: verify auth then load data ──
  // Matches the auth pattern used in /admin/homepage.js exactly
  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.replace('/admin')
        return
      }

      // Security: second layer — verify authorised email even if session exists
      if (session.user.email.toLowerCase() !== ALLOWED_EMAIL.toLowerCase()) {
        await supabase.auth.signOut()
        router.replace('/admin')
        return
      }

      setUser(session.user)
      setAuthLoading(false)
      loadData()
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

  // ── Fetch the single now_content row ──
  async function loadData() {
    setDataLoading(true)
    try {
      const { data, error } = await supabase
        .from('now_content')
        .select('*')
        .maybeSingle() // Returns null (not error) if the row doesn't exist yet

      if (error) throw error

      if (data) {
        setRowId(data.id)
        setFocusText(data.focus_text ?? '')
        setBuilding(data.building   ?? '')
        setReading(data.reading     ?? '')
        setThinking(data.thinking   ?? '')
        setUpdatedAt(data.updated_at)
      }
    } catch (err) {
      console.error('[AdminNow] loadData error:', err.message)
    } finally {
      setDataLoading(false)
    }
  }

  // ── UPDATE all four fields + updated_at in one call ──
  async function handleSave() {
    if (!rowId) return
    setSaveStatus('saving')
    try {
      const now = new Date().toISOString()
      const { error } = await supabase
        .from('now_content')
        .update({
          focus_text: focusText,
          building,
          reading,
          thinking,
          updated_at: now,
        })
        .eq('id', rowId)

      if (error) throw error

      // Update the "Last updated" display without a page reload
      setUpdatedAt(now)
      setSaveStatus('success')
      setTimeout(() => setSaveStatus(null), 3000)
    } catch (err) {
      console.error('[AdminNow] save error:', err.message)
      setSaveStatus('error')
      setTimeout(() => setSaveStatus(null), 4000)
    }
  }

  // ── Sign out ──
  async function handleSignOut() {
    await supabase.auth.signOut()
    router.replace('/admin')
  }

  // ── Loading screen while auth is being verified ──
  if (authLoading) return <LoadingScreen />

  // Format timestamp for human reading (e.g. "8 Apr 2026, 03:45 pm")
  const lastUpdatedLabel = updatedAt
    ? new Date(updatedAt).toLocaleString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true,
      })
    : '—'

  return (
    <>
      <Head>
        <title>Now — Admin · Navin Oswal</title>
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
          {/* Left: breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <a href="/" target="_blank" rel="noopener"
              style={{ fontSize: 15, fontWeight: 700, color: '#2d6a4f', textDecoration: 'none' }}>
              nav.in ↗
            </a>
            <span style={{ color: '#cbd5e1' }}>/</span>
            <Link href="/admin/dashboard"
              style={{ fontSize: 14, color: '#64748b', textDecoration: 'none' }}>
              Admin
            </Link>
            <span style={{ color: '#cbd5e1' }}>/</span>
            <span style={{ fontSize: 14, fontWeight: 500, color: '#0f172a' }}>Now</span>
          </div>

          {/* Right: email + sign out */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 12, color: '#94a3b8' }}>{user?.email}</span>
            <button
              onClick={handleSignOut}
              style={signOutBtnStyle}
              onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#fff' }}
            >
              Sign out
            </button>
          </div>
        </header>

        {/* ── Main content ── */}
        <main style={{ maxWidth: 760, margin: '0 auto', padding: '48px 24px' }}>

          {/* Page heading */}
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>
              Edit — Now Page
            </h1>
            <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6 }}>
              Update what you&apos;re currently focused on, building, reading, and thinking about.
            </p>
          </div>

          {/* ── Form card ── */}
          <div style={{
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: 14,
            padding: '28px 32px',
          }}>

            {/* Last updated timestamp — pulled from updated_at column */}
            <div style={{
              fontSize: 12,
              color: '#94a3b8',
              marginBottom: 28,
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              Last updated: {lastUpdatedLabel}
            </div>

            {dataLoading ? (
              <p style={{ fontSize: 13, color: '#94a3b8' }}>Loading content…</p>
            ) : (
              <>
                {/* ── Four textarea fields, one per column ── */}
                <AutoTextarea
                  label="What I'm focused on"
                  value={focusText}
                  onChange={setFocusText}
                  placeholder="E.g. Scaling UNITS distribution across Pune + 3 new cities…"
                />
                <AutoTextarea
                  label="What I'm building"
                  value={building}
                  onChange={setBuilding}
                  placeholder="E.g. Admin panel for nav.in, UNIVEN onboarding flow…"
                />
                <AutoTextarea
                  label="What I'm reading"
                  value={reading}
                  onChange={setReading}
                  placeholder="E.g. The Mom Test by Rob Fitzpatrick — notes on customer interviews…"
                />
                <AutoTextarea
                  label="What I'm thinking / testing"
                  value={thinking}
                  onChange={setThinking}
                  placeholder="E.g. Whether freemium works for B2B SaaS in Tier 2 India…"
                />

                {/* ── Save button + inline status message ── */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 8 }}>
                  <button
                    onClick={handleSave}
                    disabled={saveStatus === 'saving'}
                    style={{
                      padding: '10px 24px',
                      borderRadius: 10,
                      background: saveStatus === 'saving' ? '#86efac' : '#2d6a4f',
                      color: '#fff',
                      border: 'none',
                      fontFamily: "'Outfit', sans-serif",
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: saveStatus === 'saving' ? 'not-allowed' : 'pointer',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={e => {
                      if (saveStatus !== 'saving') e.currentTarget.style.background = '#1b4332'
                    }}
                    onMouseLeave={e => {
                      if (saveStatus !== 'saving') e.currentTarget.style.background = '#2d6a4f'
                    }}
                  >
                    {saveStatus === 'saving' ? 'Saving…' : 'Save changes'}
                  </button>

                  {saveStatus === 'success' && (
                    <span style={{ fontSize: 13, color: '#16a34a', fontWeight: 500 }}>
                      ✓ Saved successfully
                    </span>
                  )}
                  {saveStatus === 'error' && (
                    <span style={{ fontSize: 13, color: '#dc2626', fontWeight: 500 }}>
                      ✗ Save failed. Please try again.
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </>
  )
}

// ── Auto-resizing labeled textarea ────────────────────────────────────────────
// Grows vertically as the user types — no manual resize handle needed.
function AutoTextarea({ label, value, onChange, placeholder }) {
  function handleChange(e) {
    // Reset height first so it can shrink if text is deleted, then expand to fit
    e.target.style.height = 'auto'
    e.target.style.height = e.target.scrollHeight + 'px'
    onChange(e.target.value)
  }

  return (
    <div style={{ marginBottom: 24 }}>
      <label style={{
        display: 'block',
        fontSize: 12,
        fontWeight: 600,
        color: '#475569',
        marginBottom: 8,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
      }}>
        {label}
      </label>
      <textarea
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        rows={3}
        style={{
          width: '100%',
          padding: '10px 14px',
          borderRadius: 10,
          border: '1.5px solid #e2e8f0',
          fontFamily: "'Outfit', sans-serif",
          fontSize: 14,
          color: '#0f172a',
          lineHeight: 1.7,
          resize: 'none',       // auto-resize handles this
          outline: 'none',
          overflow: 'hidden',   // hides scrollbar while auto-resizing
          transition: 'border-color 0.15s',
          boxSizing: 'border-box',
        }}
        onFocus={e => { e.currentTarget.style.borderColor = '#2d6a4f' }}
        onBlur={e  => { e.currentTarget.style.borderColor = '#e2e8f0' }}
      />
    </div>
  )
}

// ── Loading screen while session is being verified ────────────────────────────
function LoadingScreen() {
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

// ── Shared style objects ───────────────────────────────────────────────────────
const signOutBtnStyle = {
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
}
