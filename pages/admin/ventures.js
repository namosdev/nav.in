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

export default function AdminVentures() {
  const router = useRouter()
  const [authLoading, setAuthLoading] = useState(true)

  // ── Verify session on mount ──
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.replace('/admin'); return }
      setAuthLoading(false)
    })
  }, [router])

  if (authLoading) return <LoadingScreen />

  return (
    <>
      <Head>
        <title>Ventures — Admin</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'Outfit', sans-serif" }}>

        {/* ── Header ── */}
        <header style={{
          background: '#fff', borderBottom: '1px solid #e2e8f0',
          padding: '0 32px', display: 'flex', alignItems: 'center',
          gap: 12, height: 56,
        }}>
          <Link href="/admin/dashboard" style={{ fontSize: 13, color: '#64748b', textDecoration: 'none' }}>
            ← Dashboard
          </Link>
          <span style={{ color: '#cbd5e1' }}>/</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>🚀 Ventures</span>
        </header>

        <main style={{ maxWidth: 700, margin: '0 auto', padding: '48px 24px' }}>

          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>
            Edit — Ventures Page
          </h1>
          <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.7, marginBottom: 32 }}>
            This editor is coming in <strong>Phase 3</strong>. For now, update the content directly in{' '}
            <code style={{ background: '#f1f5f9', padding: '1px 6px', borderRadius: 4, fontSize: 12 }}>
              pages/ventures.js
            </code>{' '}
            and push to GitHub.
          </p>

          {/* ── Reference card ── */}
          <div style={{
            padding: '24px 28px',
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: 14,
            marginBottom: 20,
          }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', marginBottom: 10 }}>
              🚀 What lives on this page
            </p>
            <ul style={{ fontSize: 13, color: '#64748b', lineHeight: 2, paddingLeft: 20 }}>
              <li><strong>UNITS</strong> — real estate CRM story, mission, stats, and current status</li>
              <li><strong>UNIVEN</strong> — business credentials platform story and launch status</li>
              <li>Metrics (users, developers live, months in market)</li>
              <li>Vision statements and product philosophy</li>
            </ul>
          </div>

          {/* ── Links to both ventures ── */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <a
              href="https://github.com/namosdev/nav.in/blob/main/pages/ventures.js"
              target="_blank" rel="noopener"
              style={{ display: 'inline-block', fontSize: 13, fontWeight: 600, padding: '10px 22px', borderRadius: 9, background: '#0f172a', color: '#fff', textDecoration: 'none' }}>
              Open ventures.js on GitHub ↗
            </a>
            <a href="https://sayunits.com" target="_blank" rel="noopener"
              style={{ display: 'inline-block', fontSize: 13, fontWeight: 600, padding: '10px 22px', borderRadius: 9, border: '1px solid #e2e8f0', background: '#fff', color: '#0f172a', textDecoration: 'none' }}>
              Visit UNITS ↗
            </a>
            <a href="https://univen.co" target="_blank" rel="noopener"
              style={{ display: 'inline-block', fontSize: 13, fontWeight: 600, padding: '10px 22px', borderRadius: 9, border: '1px solid #e2e8f0', background: '#fff', color: '#0f172a', textDecoration: 'none' }}>
              Visit UNIVEN ↗
            </a>
          </div>
        </main>
      </div>
    </>
  )
}

function LoadingScreen() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Outfit', sans-serif", background: '#f8fafc' }}>
      <p style={{ color: '#64748b', fontSize: 14 }}>Verifying session…</p>
    </div>
  )
}
