import Head from 'next/head'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { createClient } from '@supabase/supabase-js'

// ── Supabase client (reads from environment variables in .env.local) ──
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function AdminLogin() {
  const router  = useRouter()
  const [email, setEmail]   = useState('')
  const [status, setStatus] = useState(null) // null | 'loading' | 'sent' | 'error'

  // ── If user is already logged in, redirect straight to dashboard ──
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace('/admin/dashboard')
    })
  }, [router])

  // ── Send magic link to the entered email ──
  async function handleSubmit(e) {
    e.preventDefault()
    if (!email.includes('@')) return

    setStatus('loading')
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          // After clicking the magic link, user lands on dashboard
          emailRedirectTo: `${window.location.origin}/admin/dashboard`,
        },
      })
      if (error) throw error
      setStatus('sent')
    } catch (err) {
      console.error('Magic link error:', err.message)
      setStatus('error')
    }
  }

  return (
    <>
      <Head>
        <title>Admin Login — Navin Oswal</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* ── Full-page centered layout ── */}
      <div style={{
        minHeight: '100vh',
        background: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Outfit', sans-serif",
        padding: '24px',
      }}>

        {/* ── Login card ── */}
        <div style={{
          width: '100%',
          maxWidth: 420,
          background: '#fff',
          borderRadius: 16,
          border: '1px solid #e2e8f0',
          padding: '48px 40px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
        }}>

          {/* Header */}
          <div style={{ marginBottom: 32 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: '#2d6a4f', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: 18, marginBottom: 20,
            }}>
              🔐
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 600, color: '#0f172a', marginBottom: 6 }}>
              Admin Panel
            </h1>
            <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6 }}>
              Enter your email to receive a magic login link.
              No password required.
            </p>
          </div>

          {/* ── Success state: magic link sent ── */}
          {status === 'sent' ? (
            <div style={{
              padding: '20px 24px',
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: 12,
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>📬</div>
              <p style={{ fontSize: 15, fontWeight: 600, color: '#166534', marginBottom: 6 }}>
                Check your inbox!
              </p>
              <p style={{ fontSize: 13, color: '#15803d', lineHeight: 1.6 }}>
                A login link was sent to <strong>{email}</strong>.
                Click it to access the dashboard — the link expires in 1 hour.
              </p>
              <button
                onClick={() => setStatus(null)}
                style={{
                  marginTop: 16, fontSize: 13, color: '#2d6a4f',
                  background: 'none', border: 'none', cursor: 'pointer',
                  textDecoration: 'underline',
                }}>
                Try a different email
              </button>
            </div>

          ) : (
            // ── Login form ──
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="namos.dev@gmail.com"
                  required
                  style={{
                    padding: '11px 14px',
                    fontSize: 14,
                    border: '1px solid #d1d5db',
                    borderRadius: 10,
                    outline: 'none',
                    fontFamily: 'inherit',
                    color: '#0f172a',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => { e.target.style.borderColor = '#2d6a4f' }}
                  onBlur={e => { e.target.style.borderColor = '#d1d5db' }}
                />
              </div>

              {/* Error message */}
              {status === 'error' && (
                <p style={{ fontSize: 13, color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px' }}>
                  ⚠️ Something went wrong. Check your Supabase config and try again.
                </p>
              )}

              <button
                type="submit"
                disabled={status === 'loading'}
                style={{
                  padding: '12px 20px',
                  background: status === 'loading' ? '#6b9e84' : '#2d6a4f',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit',
                  transition: 'background 0.2s',
                }}>
                {status === 'loading' ? 'Sending link...' : 'Send magic link →'}
              </button>

              <p style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', lineHeight: 1.6 }}>
                Only authorised email addresses can access the dashboard.
                If you&apos;re locked out, contact the site owner.
              </p>
            </form>
          )}
        </div>
      </div>
    </>
  )
}
