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

export default function AdminVentures() {
  const router = useRouter()

  // ── Auth state ──
  const [user, setUser]               = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  // ── Data state ──
  const [ventures,    setVentures]    = useState([])
  const [dataLoading, setDataLoading] = useState(false)

  // ── Edit state ──
  // editingId: the id of the card currently in edit mode (null = none)
  // draft: a copy of that card's fields for the user to modify
  const [editingId, setEditingId] = useState(null)
  const [draft,     setDraft]     = useState({})

  // Per-card save status keyed by id: null | 'saving' | 'success' | 'error'
  const [saveStatus, setSaveStatus] = useState({})

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

  // ── Fetch all venture rows ordered by display_order ──
  async function loadData() {
    setDataLoading(true)
    try {
      const { data, error } = await supabase
        .from('ventures')
        .select('*')
        .order('display_order', { ascending: true })

      if (error) throw error
      setVentures(data ?? [])
    } catch (err) {
      console.error('[AdminVentures] loadData error:', err.message)
    } finally {
      setDataLoading(false)
    }
  }

  // ── Enter edit mode: populate draft with the venture's current values ──
  function startEdit(venture) {
    setEditingId(venture.id)
    setDraft({
      name:          venture.name          ?? '',
      tagline:       venture.tagline       ?? '',
      description:   venture.description   ?? '',
      website_url:   venture.website_url   ?? '',
      logo_url:      venture.logo_url      ?? '',
      status:        venture.status        ?? 'active',
      display_order: venture.display_order ?? 0,
    })
  }

  // ── Cancel edit: discard draft and return to read mode ──
  function cancelEdit() {
    setEditingId(null)
    setDraft({})
  }

  // ── Save draft back to Supabase and update local state ──
  async function handleSave(id) {
    setSaveStatus(prev => ({ ...prev, [id]: 'saving' }))
    try {
      const { error } = await supabase
        .from('ventures')
        .update(draft)
        .eq('id', id)

      if (error) throw error

      // Reflect the saved values in the list immediately (no reload needed)
      setVentures(prev => prev.map(v => v.id === id ? { ...v, ...draft } : v))
      setEditingId(null)
      setDraft({})
      setSaveStatus(prev => ({ ...prev, [id]: 'success' }))
      setTimeout(() => setSaveStatus(prev => ({ ...prev, [id]: null })), 3000)
    } catch (err) {
      console.error('[AdminVentures] save error:', err.message)
      setSaveStatus(prev => ({ ...prev, [id]: 'error' }))
      setTimeout(() => setSaveStatus(prev => ({ ...prev, [id]: null })), 4000)
    }
  }

  // ── Sign out ──
  async function handleSignOut() {
    await supabase.auth.signOut()
    router.replace('/admin')
  }

  if (authLoading) return <LoadingScreen />

  return (
    <>
      <Head>
        <title>Ventures — Admin · Navin Oswal</title>
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
            <span style={{ fontSize: 14, fontWeight: 500, color: '#0f172a' }}>Ventures</span>
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
              Edit — Ventures
            </h1>
            <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6 }}>
              Update your venture details, taglines, and status. Click Edit on a card to modify it inline.
            </p>
          </div>

          {dataLoading && (
            <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 20 }}>Loading ventures…</p>
          )}

          {/* ── Venture cards ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {ventures.map(venture => (
              <div
                key={venture.id}
                style={{
                  background: '#fff',
                  border: `1px solid ${editingId === venture.id ? '#2d6a4f' : '#e2e8f0'}`,
                  borderRadius: 14,
                  padding: '24px 28px',
                  transition: 'border-color 0.15s',
                }}
              >
                {editingId === venture.id ? (
                  /* ══ EDIT MODE — inline form ══ */
                  <EditForm
                    draft={draft}
                    setDraft={setDraft}
                    onSave={() => handleSave(venture.id)}
                    onCancel={cancelEdit}
                    saveStatus={saveStatus[venture.id]}
                  />
                ) : (
                  /* ══ READ MODE — summary card ══ */
                  <ReadCard
                    venture={venture}
                    onEdit={() => startEdit(venture)}
                    savedStatus={saveStatus[venture.id]}
                  />
                )}
              </div>
            ))}
          </div>
        </main>
      </div>
    </>
  )
}

// ── Read-mode card: name, tagline, status badge, Edit button ──────────────────
function ReadCard({ venture, onEdit, savedStatus }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>

      {/* Left: name + status badge + tagline */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <span style={{ fontSize: 17, fontWeight: 700, color: '#0f172a' }}>
            {venture.name}
          </span>
          {/* Active / Inactive badge */}
          <span style={{
            fontSize: 11,
            fontWeight: 600,
            padding: '2px 10px',
            borderRadius: 20,
            background: venture.status === 'active' ? '#dcfce7' : '#f1f5f9',
            color:      venture.status === 'active' ? '#16a34a' : '#64748b',
            textTransform: 'capitalize',
            letterSpacing: '0.03em',
          }}>
            {venture.status ?? 'active'}
          </span>
        </div>
        <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>
          {venture.tagline}
        </p>
      </div>

      {/* Right: success/error confirmation + Edit button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, marginLeft: 20 }}>
        {savedStatus === 'success' && (
          <span style={{ fontSize: 12, color: '#16a34a', fontWeight: 500 }}>✓ Saved</span>
        )}
        {savedStatus === 'error' && (
          <span style={{ fontSize: 12, color: '#dc2626', fontWeight: 500 }}>✗ Failed</span>
        )}
        <button
          onClick={onEdit}
          style={{
            fontSize: 13,
            fontWeight: 500,
            padding: '7px 18px',
            borderRadius: 8,
            border: '1px solid #e2e8f0',
            background: '#fff',
            color: '#475569',
            cursor: 'pointer',
            fontFamily: 'inherit',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = '#2d6a4f'
            e.currentTarget.style.color = '#2d6a4f'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = '#e2e8f0'
            e.currentTarget.style.color = '#475569'
          }}
        >
          Edit
        </button>
      </div>
    </div>
  )
}

// ── Edit-mode form: all editable fields with Save / Cancel ────────────────────
function EditForm({ draft, setDraft, onSave, onCancel, saveStatus }) {
  // Helper: returns value + onChange for a given draft key
  function field(key) {
    return {
      value:    draft[key] ?? '',
      onChange: e => setDraft(prev => ({ ...prev, [key]: e.target.value })),
    }
  }

  return (
    <div>

      {/* Row 1: Name + Tagline */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <Field label="Name"    {...field('name')} />
        <Field label="Tagline" {...field('tagline')} />
      </div>

      {/* Row 2: Description textarea (full width) */}
      <Field
        label="Description"
        type="textarea"
        rows={4}
        {...field('description')}
        style={{ marginBottom: 16 }}
      />

      {/* Row 3: Website URL + Logo URL */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <Field label="Website URL" placeholder="https://…" {...field('website_url')} />
        <Field label="Logo URL (path)" placeholder="/logos/units-logo.png" {...field('logo_url')} />
      </div>

      {/* Row 4: Status + Display Order */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, alignItems: 'flex-end' }}>

        {/* Status select: active / inactive */}
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Status</label>
          <select
            value={draft.status ?? 'active'}
            onChange={e => setDraft(prev => ({ ...prev, status: e.target.value }))}
            style={{ ...inputStyle, cursor: 'pointer' }}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Display order: small number input */}
        <div>
          <label style={labelStyle}>Display Order</label>
          <input
            type="number"
            min={0}
            value={draft.display_order ?? 0}
            onChange={e =>
              setDraft(prev => ({ ...prev, display_order: parseInt(e.target.value, 10) || 0 }))
            }
            style={{ ...inputStyle, width: 90 }}
            onFocus={e => { e.currentTarget.style.borderColor = '#2d6a4f' }}
            onBlur={e  => { e.currentTarget.style.borderColor = '#e2e8f0' }}
          />
        </div>
      </div>

      {/* Action buttons + inline status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={onSave}
          disabled={saveStatus === 'saving'}
          style={{
            padding: '9px 22px',
            borderRadius: 9,
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
          {saveStatus === 'saving' ? 'Saving…' : 'Save'}
        </button>

        <button
          onClick={onCancel}
          style={{
            padding: '9px 18px',
            borderRadius: 9,
            border: '1px solid #e2e8f0',
            background: '#fff',
            color: '#475569',
            fontFamily: "'Outfit', sans-serif",
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9' }}
          onMouseLeave={e => { e.currentTarget.style.background = '#fff' }}
        >
          Cancel
        </button>

        {saveStatus === 'error' && (
          <span style={{ fontSize: 13, color: '#dc2626', fontWeight: 500 }}>
            ✗ Save failed. Please try again.
          </span>
        )}
      </div>
    </div>
  )
}

// ── Reusable labeled input / textarea ─────────────────────────────────────────
function Field({ label, type = 'input', rows = 3, placeholder, value, onChange, style }) {
  return (
    <div style={style}>
      <label style={labelStyle}>{label}</label>
      {type === 'textarea' ? (
        <textarea
          value={value}
          onChange={onChange}
          rows={rows}
          placeholder={placeholder}
          style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }}
          onFocus={e => { e.currentTarget.style.borderColor = '#2d6a4f' }}
          onBlur={e  => { e.currentTarget.style.borderColor = '#e2e8f0' }}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          style={inputStyle}
          onFocus={e => { e.currentTarget.style.borderColor = '#2d6a4f' }}
          onBlur={e  => { e.currentTarget.style.borderColor = '#e2e8f0' }}
        />
      )}
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
const labelStyle = {
  display: 'block',
  fontSize: 12,
  fontWeight: 600,
  color: '#475569',
  marginBottom: 6,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
}

const inputStyle = {
  width: '100%',
  padding: '9px 13px',
  borderRadius: 9,
  border: '1.5px solid #e2e8f0',
  fontFamily: "'Outfit', sans-serif",
  fontSize: 14,
  color: '#0f172a',
  outline: 'none',
  transition: 'border-color 0.15s',
  boxSizing: 'border-box',
}

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
