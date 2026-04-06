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

// Security: restrict admin access to authorised email only
const ALLOWED_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'your@email.com'

export default function AdminHomepage() {
  const router = useRouter()

  // ── Auth state ──
  const [user, setUser]               = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  // ── Section 1: Current question state ──
  const [activeQuestion, setActiveQuestion]     = useState(null)  // { id, question }
  const [questionInput, setQuestionInput]       = useState('')     // text input value
  const [updateStatus, setUpdateStatus]         = useState(null)   // 'saving' | 'success' | 'error'

  // ── Section 2: Tally state ──
  const [tally, setTally]                       = useState(null)   // { yes, no, total }
  const [breakdown, setBreakdown]               = useState([])     // [{ category_slug, yes, no }]
  const [tallyLoading, setTallyLoading]         = useState(false)

  // ── On mount: verify auth and load question data ──
  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.replace('/admin')
        return
      }

      // Security: second layer — verify authorised email
      if (session.user.email.toLowerCase() !== ALLOWED_EMAIL.toLowerCase()) {
        await supabase.auth.signOut()
        router.replace('/admin')
        return
      }

      setUser(session.user)
      setAuthLoading(false)

      // Load the active question and tally after auth passes
      await loadData()
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

  // ── Load active question + tally from Supabase ──
  async function loadData() {
    setTallyLoading(true)

    try {
      // ── Fetch the active question ──
      const { data: questions, error: qError } = await supabase
        .from('homepage_widget')
        .select('id, question')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)

      if (qError) throw qError

      const question = questions?.[0] ?? null
      setActiveQuestion(question)
      setQuestionInput(question?.question ?? '')

      if (!question) {
        setTally(null)
        setBreakdown([])
        setTallyLoading(false)
        return
      }

      // ── Fetch all responses for this question (for tally + breakdown) ──
      const { data: responses, error: rError } = await supabase
        .from('question_responses')
        .select('category_slug, vote')
        .eq('question_id', question.id)

      if (rError) throw rError

      // Compute overall tally
      const yesCount = responses.filter(r => r.vote === 'yes').length
      const noCount  = responses.filter(r => r.vote === 'no').length
      setTally({ yes: yesCount, no: noCount, total: responses.length })

      // Compute per-category breakdown
      const byCategory = {}
      for (const r of responses) {
        if (!byCategory[r.category_slug]) {
          byCategory[r.category_slug] = { yes: 0, no: 0 }
        }
        byCategory[r.category_slug][r.vote]++
      }

      const breakdownRows = Object.entries(byCategory)
        .map(([slug, counts]) => ({ category_slug: slug, yes: counts.yes, no: counts.no }))
        .sort((a, b) => (b.yes + b.no) - (a.yes + a.no)) // sort by total votes desc

      setBreakdown(breakdownRows)

    } catch (err) {
      console.error('[loadData] Error:', err.message)
    } finally {
      setTallyLoading(false)
    }
  }

  // ── Update the active question ──
  // Deactivates all existing questions, then inserts a new active one.
  async function handleUpdateQuestion() {
    const newQuestion = questionInput.trim()
    if (!newQuestion) return

    setUpdateStatus('saving')

    try {
      // Step 1: Set all existing questions to inactive
      const { error: deactivateError } = await supabase
        .from('homepage_widget')
        .update({ is_active: false })
        .neq('id', 0) // matches all rows

      if (deactivateError) throw deactivateError

      // Step 2: Insert the new question as active
      const { data: inserted, error: insertError } = await supabase
        .from('homepage_widget')
        .insert({ question: newQuestion, is_active: true })
        .select('id, question')
        .single()

      if (insertError) throw insertError

      setActiveQuestion(inserted)
      setUpdateStatus('success')

      // Reload tally data (will be empty for the new question)
      await loadData()

      // Clear success message after 3 seconds
      setTimeout(() => setUpdateStatus(null), 3000)

    } catch (err) {
      console.error('[handleUpdateQuestion] Error:', err.message)
      setUpdateStatus('error')
      setTimeout(() => setUpdateStatus(null), 4000)
    }
  }

  // ── Sign out ──
  async function handleSignOut() {
    await supabase.auth.signOut()
    router.replace('/admin')
  }

  // ── Loading screen while auth is being verified ──
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
        <title>Homepage Admin — Navin Oswal</title>
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
          {/* Left: breadcrumb nav */}
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
            <Link
              href="/admin/dashboard"
              style={{ fontSize: 14, color: '#64748b', textDecoration: 'none' }}
            >
              Admin
            </Link>
            <span style={{ color: '#cbd5e1' }}>/</span>
            <span style={{ fontSize: 14, fontWeight: 500, color: '#0f172a' }}>Homepage</span>
          </div>

          {/* Right: email + sign out */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 12, color: '#94a3b8' }}>{user?.email}</span>
            <button
              onClick={handleSignOut}
              style={{
                fontSize: 13, fontWeight: 500,
                padding: '7px 16px', borderRadius: 8,
                border: '1px solid #e2e8f0',
                background: '#fff', color: '#475569',
                cursor: 'pointer', fontFamily: 'inherit',
                transition: 'background 0.15s',
              }}
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
          <div style={{ marginBottom: 40 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>
              Homepage
            </h1>
            <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6 }}>
              Manage the monthly question widget shown to visitors on the homepage.
            </p>
          </div>

          {/* ══════════════════════════════════════════════════════
              SECTION 1 — CURRENT QUESTION
              Shows the active question with an editable input.
              "Update Question" deactivates old, inserts new.
              ══════════════════════════════════════════════════════ */}
          <Section title="Current Question">

            {/* Current active question display */}
            {activeQuestion ? (
              <div style={{
                padding: '12px 16px', borderRadius: 10,
                background: '#f0fdf4', border: '1px solid #bbf7d0',
                marginBottom: 20,
              }}>
                <div style={{ fontSize: 11, color: '#16a34a', fontWeight: 600, marginBottom: 4, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  Active question
                </div>
                <div style={{ fontSize: 14, color: '#0f172a', lineHeight: 1.6 }}>
                  {activeQuestion.question}
                </div>
              </div>
            ) : (
              <div style={{
                padding: '12px 16px', borderRadius: 10,
                background: '#fef9c3', border: '1px solid #fde047',
                marginBottom: 20,
              }}>
                <div style={{ fontSize: 14, color: '#854d0e' }}>
                  No active question. Enter one below to activate.
                </div>
              </div>
            )}

            {/* Editable text input */}
            <div style={{ marginBottom: 16 }}>
              <label style={{
                display: 'block', fontSize: 12, fontWeight: 600,
                color: '#475569', marginBottom: 8, letterSpacing: '0.04em',
              }}>
                NEW QUESTION TEXT
              </label>
              <textarea
                value={questionInput}
                onChange={e => setQuestionInput(e.target.value)}
                rows={3}
                placeholder="Type the new question here…"
                style={{
                  width: '100%', padding: '10px 14px',
                  borderRadius: 10, border: '1.5px solid #e2e8f0',
                  fontFamily: "'Outfit', sans-serif", fontSize: 14,
                  color: '#0f172a', lineHeight: 1.6,
                  resize: 'vertical', outline: 'none',
                  transition: 'border-color 0.15s',
                  boxSizing: 'border-box',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = '#2d6a4f' }}
                onBlur={e  => { e.currentTarget.style.borderColor = '#e2e8f0' }}
              />
            </div>

            {/* Update button + status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <button
                onClick={handleUpdateQuestion}
                disabled={updateStatus === 'saving' || !questionInput.trim()}
                style={{
                  padding: '10px 22px', borderRadius: 10,
                  background: updateStatus === 'saving' ? '#86efac' : '#2d6a4f',
                  color: '#fff', border: 'none',
                  fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 600,
                  cursor: updateStatus === 'saving' ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s',
                  opacity: !questionInput.trim() ? 0.5 : 1,
                }}
                onMouseEnter={e => {
                  if (updateStatus !== 'saving' && questionInput.trim())
                    e.currentTarget.style.background = '#1b4332'
                }}
                onMouseLeave={e => {
                  if (updateStatus !== 'saving')
                    e.currentTarget.style.background = '#2d6a4f'
                }}
              >
                {updateStatus === 'saving' ? 'Saving…' : 'Update Question'}
              </button>

              {/* Status messages */}
              {updateStatus === 'success' && (
                <span style={{ fontSize: 13, color: '#16a34a', fontWeight: 500 }}>
                  ✓ Question updated successfully
                </span>
              )}
              {updateStatus === 'error' && (
                <span style={{ fontSize: 13, color: '#dc2626', fontWeight: 500 }}>
                  ✗ Update failed. Please try again.
                </span>
              )}
            </div>
          </Section>

          {/* ══════════════════════════════════════════════════════
              SECTION 2 — CURRENT TALLY
              Shows yes/no counts, total, and a per-category
              breakdown table. Refresh button re-fetches live data.
              ══════════════════════════════════════════════════════ */}
          <Section title="Current Tally" style={{ marginTop: 32 }}>

            {/* Refresh button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
              <button
                onClick={loadData}
                disabled={tallyLoading}
                style={{
                  padding: '7px 16px', borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  background: '#fff', color: '#475569',
                  fontFamily: "'Outfit', sans-serif", fontSize: 13,
                  cursor: tallyLoading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s',
                  opacity: tallyLoading ? 0.6 : 1,
                }}
                onMouseEnter={e => { if (!tallyLoading) e.currentTarget.style.borderColor = '#2d6a4f' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0' }}
              >
                {tallyLoading ? 'Loading…' : '↻ Refresh'}
              </button>
            </div>

            {/* Loading state */}
            {tallyLoading && (
              <p style={{ fontSize: 13, color: '#94a3b8' }}>Fetching latest data…</p>
            )}

            {/* No active question */}
            {!tallyLoading && !activeQuestion && (
              <p style={{ fontSize: 14, color: '#94a3b8' }}>
                No active question — tally unavailable.
              </p>
            )}

            {/* Tally summary cards */}
            {!tallyLoading && tally && (
              <>
                {/* Summary row: Yes / No / Total */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 12,
                  marginBottom: 28,
                }}>
                  <TallyCard label="Yes" value={tally.yes} color="#16a34a" bg="#f0fdf4" />
                  <TallyCard label="No"  value={tally.no}  color="#1e3a5f" bg="#eff6ff" />
                  <TallyCard label="Total" value={tally.total} color="#475569" bg="#f8fafc" />
                </div>

                {/* Per-category breakdown table */}
                {breakdown.length > 0 ? (
                  <>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 10, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                      Breakdown by category
                    </div>
                    <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden' }}>

                      {/* Table header */}
                      <div style={{
                        display: 'grid', gridTemplateColumns: '1fr 80px 80px 80px',
                        padding: '10px 16px',
                        background: '#f8fafc',
                        borderBottom: '1px solid #e2e8f0',
                      }}>
                        {['Category', 'Yes', 'No', 'Total'].map(h => (
                          <span key={h} style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                            {h}
                          </span>
                        ))}
                      </div>

                      {/* Table rows */}
                      {breakdown.map((row, i) => (
                        <div
                          key={row.category_slug}
                          style={{
                            display: 'grid', gridTemplateColumns: '1fr 80px 80px 80px',
                            padding: '11px 16px',
                            borderBottom: i < breakdown.length - 1 ? '1px solid #f1f5f9' : 'none',
                            background: '#fff',
                          }}
                        >
                          <span style={{ fontSize: 13, color: '#334155', fontWeight: 500 }}>
                            {/* Show slug as readable label */}
                            {row.category_slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                          <span style={{ fontSize: 13, color: '#16a34a', fontWeight: 600 }}>{row.yes}</span>
                          <span style={{ fontSize: 13, color: '#1e3a5f', fontWeight: 600 }}>{row.no}</span>
                          <span style={{ fontSize: 13, color: '#475569' }}>{row.yes + row.no}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p style={{ fontSize: 13, color: '#94a3b8' }}>
                    No votes yet for the current question.
                  </p>
                )}
              </>
            )}
          </Section>

        </main>
      </div>
    </>
  )
}

// ── Section wrapper: white card with title ─────────────────────────────────────
function Section({ title, children, style }) {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e2e8f0',
      borderRadius: 14,
      padding: '28px 28px 32px',
      marginBottom: 20,
      ...style,
    }}>
      <h2 style={{
        fontSize: 15, fontWeight: 700,
        color: '#0f172a', marginBottom: 20,
        paddingBottom: 14,
        borderBottom: '1px solid #f1f5f9',
      }}>
        {title}
      </h2>
      {children}
    </div>
  )
}

// ── Summary tally card: shows one metric in a coloured box ────────────────────
function TallyCard({ label, value, color, bg }) {
  return (
    <div style={{
      background: bg,
      border: `1px solid ${color}22`,
      borderRadius: 10,
      padding: '14px 18px',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: 28, fontWeight: 700, color, lineHeight: 1, marginBottom: 4 }}>
        {value}
      </div>
      <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </div>
    </div>
  )
}
