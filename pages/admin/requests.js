import Head from 'next/head'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

// ── Supabase client ──
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// ── Format ISO timestamp to readable Indian date ──
function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

// ── Meeting type badge ──
function Badge({ value }) {
  const map = {
    online:  { bg: '#eff6ff', color: '#1d4ed8', label: '💻 Online' },
    offline: { bg: '#f0fdf4', color: '#166534', label: '☕ In-person' },
  }
  const s = map[value] || { bg: '#f1f5f9', color: '#475569', label: value || '—' }
  return (
    <span style={{
      fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 100,
      background: s.bg, color: s.color, whiteSpace: 'nowrap',
    }}>
      {s.label}
    </span>
  )
}

export default function AdminRequests() {
  const router = useRouter()
  const [authLoading, setAuthLoading] = useState(true)
  const [requests, setRequests]       = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState(null)
  const [expanded, setExpanded]       = useState(null) // id of the expanded row

  // ── Check auth on mount, then fetch data ──
  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.replace('/admin'); return }
      setAuthLoading(false)
      fetchRequests()
    }
    init()
  }, [router])

  // ── Fetch all meeting requests from Supabase, newest first ──
  async function fetchRequests() {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('meeting_requests')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      setRequests(data || [])
    } catch (err) {
      console.error(err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) return <LoadingScreen />

  return (
    <>
      <Head>
        <title>Meeting Requests — Admin</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'Outfit', sans-serif" }}>

        {/* ── Sub-page header with back link ── */}
        <header style={{
          background: '#fff',
          borderBottom: '1px solid #e2e8f0',
          padding: '0 32px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          height: 56,
        }}>
          <Link href="/admin/dashboard" style={{ fontSize: 13, color: '#64748b', textDecoration: 'none' }}>
            ← Dashboard
          </Link>
          <span style={{ color: '#cbd5e1' }}>/</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>📬 Meeting Requests</span>
        </header>

        <main style={{ maxWidth: 900, margin: '0 auto', padding: '36px 24px' }}>

          {/* Page title + refresh */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
                Meeting Requests
              </h1>
              <p style={{ fontSize: 13, color: '#64748b' }}>
                {loading ? 'Loading…' : `${requests.length} request${requests.length !== 1 ? 's' : ''} received`}
              </p>
            </div>
            <button
              onClick={fetchRequests}
              style={{
                fontSize: 12, padding: '8px 16px',
                border: '1px solid #d1d5db', borderRadius: 8,
                background: '#fff', color: '#475569',
                cursor: 'pointer', fontFamily: 'inherit',
              }}>
              ↻ Refresh
            </button>
          </div>

          {/* Error */}
          {error && (
            <div style={{ padding: '14px 18px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, fontSize: 13, color: '#dc2626', marginBottom: 20 }}>
              ⚠️ {error}
            </div>
          )}

          {/* Empty */}
          {!loading && !error && requests.length === 0 && (
            <div style={{ textAlign: 'center', padding: '64px 0', color: '#94a3b8', fontSize: 14 }}>
              No requests yet. Share your{' '}
              <a href="/connect" target="_blank" rel="noopener" style={{ color: '#2d6a4f' }}>Connect page</a>!
            </div>
          )}

          {/* ── Requests list ── */}
          {!loading && requests.length > 0 && (
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, overflow: 'hidden' }}>

              {/* Column headers */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1.6fr 110px 140px',
                padding: '10px 20px',
                background: '#f8fafc',
                borderBottom: '1px solid #e2e8f0',
                fontSize: 11, fontWeight: 600,
                color: '#94a3b8', letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}>
                <span>Name</span>
                <span>Email</span>
                <span>Type</span>
                <span>Received</span>
              </div>

              {/* Request rows */}
              {requests.map((req, i) => (
                <div key={req.id || i}>

                  {/* Clickable row — click to expand message */}
                  <div
                    onClick={() => setExpanded(expanded === req.id ? null : req.id)}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1.6fr 110px 140px',
                      padding: '14px 20px',
                      alignItems: 'center',
                      borderBottom: i < requests.length - 1 ? '1px solid #f1f5f9' : 'none',
                      cursor: 'pointer',
                      background: expanded === req.id ? '#fafbfc' : 'transparent',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => { if (expanded !== req.id) e.currentTarget.style.background = '#fafbfc' }}
                    onMouseLeave={e => { if (expanded !== req.id) e.currentTarget.style.background = 'transparent' }}
                  >
                    <span style={{ fontSize: 14, fontWeight: 500, color: '#0f172a' }}>
                      {req.name || '—'}
                    </span>
                    <a
                      href={`mailto:${req.email}`}
                      onClick={e => e.stopPropagation()}
                      style={{ fontSize: 13, color: '#2d6a4f', textDecoration: 'none' }}
                      onMouseEnter={e => { e.currentTarget.style.textDecoration = 'underline' }}
                      onMouseLeave={e => { e.currentTarget.style.textDecoration = 'none' }}
                    >
                      {req.email || '—'}
                    </a>
                    <Badge value={req.meeting_type} />
                    <span style={{ fontSize: 12, color: '#94a3b8' }}>
                      {formatDate(req.created_at)}
                    </span>
                  </div>

                  {/* Expanded message panel */}
                  {expanded === req.id && (
                    <div style={{
                      padding: '16px 20px 20px',
                      background: '#f8fafc',
                      borderBottom: i < requests.length - 1 ? '1px solid #f1f5f9' : 'none',
                    }}>
                      <p style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                        Message
                      </p>
                      <p style={{ fontSize: 14, color: '#334155', lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>
                        {req.message || 'No message provided.'}
                      </p>
                      <a
                        href={`mailto:${req.email}?subject=Re: Your meeting request`}
                        style={{
                          display: 'inline-block', marginTop: 16,
                          fontSize: 13, fontWeight: 600,
                          padding: '9px 20px', borderRadius: 8,
                          background: '#2d6a4f', color: '#fff',
                          textDecoration: 'none',
                        }}>
                        Reply via email →
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  )
}

// ── Shared loading screen ──
function LoadingScreen() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontFamily: "'Outfit', sans-serif", background: '#f8fafc',
    }}>
      <p style={{ color: '#64748b', fontSize: 14 }}>Verifying session…</p>
    </div>
  )
}
