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

// The five valid category values for stack_items
const CATEGORIES = ['think', 'design', 'build', 'test', 'ship']

// Colour scheme for category badges (matches public stack page feel)
const CATEGORY_COLORS = {
  think:  { bg: '#f0fdf4', text: '#16a34a' },
  design: { bg: '#eff6ff', text: '#1d4ed8' },
  build:  { bg: '#fef3c7', text: '#b45309' },
  test:   { bg: '#fdf4ff', text: '#7c3aed' },
  ship:   { bg: '#fff1f2', text: '#e11d48' },
}

// Empty template used when opening the "add new" form
const BLANK_ITEM = {
  category:      'build',
  tool_name:     '',
  description:   '',
  lesson:        '',
  display_order: 0,
  status:        'active',
}

export default function AdminStack() {
  const router = useRouter()

  // ── Auth state ──
  const [user, setUser]               = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  // ── Data state ──
  const [items,       setItems]       = useState([])
  const [dataLoading, setDataLoading] = useState(false)

  // ── Edit state ──
  // editingId: id of the item with its edit form expanded (null = none)
  const [editingId,   setEditingId]   = useState(null)
  const [editDraft,   setEditDraft]   = useState({})

  // ── Delete state ──
  // confirmDeleteId: id of the item showing the inline delete confirmation
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)

  // ── Add-new state ──
  const [showAddForm, setShowAddForm] = useState(false)
  const [addDraft,    setAddDraft]    = useState({ ...BLANK_ITEM })

  // ── Operation status messages keyed by a string token ──
  // E.g. 'edit_42', 'del_42', 'add'  →  null | 'saving' | 'success' | 'error'
  const [opStatus, setOpStatus] = useState({})

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

  // ── Fetch all stack_items ordered by display_order ──
  async function loadData() {
    setDataLoading(true)
    try {
      const { data, error } = await supabase
        .from('stack_items')
        .select('*')
        .order('display_order', { ascending: true })

      if (error) throw error
      setItems(data ?? [])
    } catch (err) {
      console.error('[AdminStack] loadData error:', err.message)
    } finally {
      setDataLoading(false)
    }
  }

  // ────────────────────────────────────────────────────────────────────────────
  // EDIT
  // ────────────────────────────────────────────────────────────────────────────

  function startEdit(item) {
    // Close the add form and any open delete confirmation before expanding edit
    setShowAddForm(false)
    setConfirmDeleteId(null)
    setEditingId(item.id)
    setEditDraft({
      category:      item.category      ?? 'build',
      tool_name:     item.tool_name     ?? '',
      description:   item.description   ?? '',
      lesson:        item.lesson        ?? '',
      display_order: item.display_order ?? 0,
      status:        item.status        ?? 'active',
    })
  }

  function cancelEdit() {
    setEditingId(null)
    setEditDraft({})
  }

  async function handleSaveEdit(id) {
    setOpStatus(prev => ({ ...prev, [`edit_${id}`]: 'saving' }))
    try {
      const { error } = await supabase
        .from('stack_items')
        .update(editDraft)
        .eq('id', id)

      if (error) throw error

      // Reload the full list so display_order reordering is reflected correctly
      await loadData()
      setEditingId(null)
      setEditDraft({})
      setOpStatus(prev => ({ ...prev, [`edit_${id}`]: 'success' }))
      setTimeout(() => setOpStatus(prev => ({ ...prev, [`edit_${id}`]: null })), 3000)
    } catch (err) {
      console.error('[AdminStack] save error:', err.message)
      setOpStatus(prev => ({ ...prev, [`edit_${id}`]: 'error' }))
      setTimeout(() => setOpStatus(prev => ({ ...prev, [`edit_${id}`]: null })), 4000)
    }
  }

  // ────────────────────────────────────────────────────────────────────────────
  // DELETE
  // ────────────────────────────────────────────────────────────────────────────

  async function handleConfirmDelete(id) {
    setOpStatus(prev => ({ ...prev, [`del_${id}`]: 'saving' }))
    try {
      const { error } = await supabase
        .from('stack_items')
        .delete()
        .eq('id', id)

      if (error) throw error

      // Remove from local list immediately — no reload needed
      setItems(prev => prev.filter(item => item.id !== id))
      setConfirmDeleteId(null)
    } catch (err) {
      console.error('[AdminStack] delete error:', err.message)
      setOpStatus(prev => ({ ...prev, [`del_${id}`]: 'error' }))
      setTimeout(() => setOpStatus(prev => ({ ...prev, [`del_${id}`]: null })), 4000)
    }
  }

  // ────────────────────────────────────────────────────────────────────────────
  // ADD NEW
  // ────────────────────────────────────────────────────────────────────────────

  function openAddForm() {
    // Default display_order to (highest existing order + 1)
    const maxOrder = items.reduce((max, item) => Math.max(max, item.display_order ?? 0), 0)
    setAddDraft({ ...BLANK_ITEM, display_order: maxOrder + 1 })
    setShowAddForm(true)
    // Close any open edit or delete panel
    setEditingId(null)
    setConfirmDeleteId(null)
  }

  function cancelAdd() {
    setShowAddForm(false)
    setAddDraft({ ...BLANK_ITEM })
  }

  async function handleAdd() {
    if (!addDraft.tool_name.trim()) return // guard: tool_name is required
    setOpStatus(prev => ({ ...prev, add: 'saving' }))
    try {
      const { error } = await supabase
        .from('stack_items')
        .insert({
          category:      addDraft.category,
          tool_name:     addDraft.tool_name.trim(),
          description:   addDraft.description.trim(),
          lesson:        addDraft.lesson.trim(),
          display_order: Number(addDraft.display_order) || 0,
          status:        addDraft.status,
        })

      if (error) throw error

      // Reload list to get the new row (with its generated id) in the right order
      await loadData()
      setShowAddForm(false)
      setAddDraft({ ...BLANK_ITEM })
      setOpStatus(prev => ({ ...prev, add: 'success' }))
      setTimeout(() => setOpStatus(prev => ({ ...prev, add: null })), 3000)
    } catch (err) {
      console.error('[AdminStack] add error:', err.message)
      setOpStatus(prev => ({ ...prev, add: 'error' }))
      setTimeout(() => setOpStatus(prev => ({ ...prev, add: null })), 4000)
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
        <title>Stack — Admin · Navin Oswal</title>
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
            <span style={{ fontSize: 14, fontWeight: 500, color: '#0f172a' }}>Stack</span>
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
        <main style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px' }}>

          {/* Page heading + "Add new item" button */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 32,
          }}>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>
                Manage — Stack
              </h1>
              <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6 }}>
                Add, edit, or remove tools from your public AI building stack.
              </p>
            </div>

            {/* Hide the button while the add form is already open */}
            {!showAddForm && (
              <button
                onClick={openAddForm}
                style={{
                  padding: '9px 20px',
                  borderRadius: 9,
                  background: '#2d6a4f',
                  color: '#fff',
                  border: 'none',
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                  flexShrink: 0,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#1b4332' }}
                onMouseLeave={e => { e.currentTarget.style.background = '#2d6a4f' }}
              >
                + Add new item
              </button>
            )}
          </div>

          {/* ══ ADD NEW FORM (above the list) ══ */}
          {showAddForm && (
            <div style={{
              background: '#fff',
              border: '2px solid #2d6a4f',  // green border marks it as new
              borderRadius: 14,
              padding: '24px 28px',
              marginBottom: 20,
            }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 20 }}>
                New Stack Item
              </div>
              <StackItemForm
                draft={addDraft}
                setDraft={setAddDraft}
                onSave={handleAdd}
                onCancel={cancelAdd}
                saveLabel="Add item"
                saveStatus={opStatus.add}
              />
              {opStatus.add === 'error' && (
                <p style={{ fontSize: 12, color: '#dc2626', marginTop: 8 }}>
                  ✗ Failed to add item. Please try again.
                </p>
              )}
            </div>
          )}

          {dataLoading && (
            <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 16 }}>Loading items…</p>
          )}

          {/* ══ STACK ITEMS LIST ══ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {items.map(item => (
              <div
                key={item.id}
                style={{
                  background: '#fff',
                  border: `1px solid ${editingId === item.id ? '#2d6a4f' : '#e2e8f0'}`,
                  borderRadius: 12,
                  overflow: 'hidden',
                  transition: 'border-color 0.15s',
                }}
              >

                {editingId === item.id ? (
                  /* ── EDIT MODE ── */
                  <div style={{ padding: '20px 24px' }}>
                    <StackItemForm
                      draft={editDraft}
                      setDraft={setEditDraft}
                      onSave={() => handleSaveEdit(item.id)}
                      onCancel={cancelEdit}
                      saveLabel="Save"
                      saveStatus={opStatus[`edit_${item.id}`]}
                    />
                    {opStatus[`edit_${item.id}`] === 'error' && (
                      <p style={{ fontSize: 12, color: '#dc2626', marginTop: 8 }}>
                        ✗ Save failed. Please try again.
                      </p>
                    )}
                  </div>

                ) : confirmDeleteId === item.id ? (
                  /* ── DELETE CONFIRMATION ── */
                  <div style={{
                    padding: '14px 20px',
                    background: '#fff7f7',
                    borderLeft: '4px solid #ef4444',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    flexWrap: 'wrap',
                  }}>
                    <span style={{ fontSize: 13, color: '#991b1b', fontWeight: 500, flex: 1 }}>
                      Are you sure? This cannot be undone.
                    </span>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button
                        onClick={() => handleConfirmDelete(item.id)}
                        disabled={opStatus[`del_${item.id}`] === 'saving'}
                        style={{
                          padding: '7px 16px',
                          borderRadius: 8,
                          background: '#ef4444',
                          color: '#fff',
                          border: 'none',
                          fontFamily: "'Outfit', sans-serif",
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: opStatus[`del_${item.id}`] === 'saving' ? 'not-allowed' : 'pointer',
                        }}
                      >
                        {opStatus[`del_${item.id}`] === 'saving' ? 'Deleting…' : 'Confirm delete'}
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        style={{
                          padding: '7px 14px',
                          borderRadius: 8,
                          border: '1px solid #e2e8f0',
                          background: '#fff',
                          color: '#475569',
                          fontFamily: "'Outfit', sans-serif",
                          fontSize: 13,
                          cursor: 'pointer',
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                    {opStatus[`del_${item.id}`] === 'error' && (
                      <span style={{ fontSize: 12, color: '#dc2626' }}>✗ Delete failed.</span>
                    )}
                  </div>

                ) : (
                  /* ── READ MODE ── */
                  <div style={{
                    padding: '13px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                  }}>

                    {/* Category badge */}
                    <span style={{
                      fontSize: 10,
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 20,
                      background: (CATEGORY_COLORS[item.category] ?? CATEGORY_COLORS.build).bg,
                      color:      (CATEGORY_COLORS[item.category] ?? CATEGORY_COLORS.build).text,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      flexShrink: 0,
                    }}>
                      {item.category}
                    </span>

                    {/* Tool name + description (description truncated to one line) */}
                    <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'baseline', gap: 8 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', flexShrink: 0 }}>
                        {item.tool_name}
                      </span>
                      <span style={{
                        fontSize: 13,
                        color: '#64748b',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                      }}>
                        {item.description}
                      </span>
                    </div>

                    {/* Status badge */}
                    <span style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: '2px 9px',
                      borderRadius: 20,
                      background: item.status === 'active' ? '#dcfce7' : '#f1f5f9',
                      color:      item.status === 'active' ? '#16a34a' : '#94a3b8',
                      textTransform: 'capitalize',
                      flexShrink: 0,
                    }}>
                      {item.status ?? 'active'}
                    </span>

                    {/* Edit + Delete buttons */}
                    <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                      <button
                        onClick={() => startEdit(item)}
                        style={actionBtnStyle}
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
                      <button
                        onClick={() => { setConfirmDeleteId(item.id); setEditingId(null) }}
                        style={{ ...actionBtnStyle, color: '#ef4444', borderColor: '#fecaca' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#fff7f7' }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#fff' }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Empty state */}
            {!dataLoading && items.length === 0 && (
              <p style={{
                fontSize: 14,
                color: '#94a3b8',
                textAlign: 'center',
                padding: '40px 0',
              }}>
                No stack items yet. Use the button above to add one.
              </p>
            )}
          </div>
        </main>
      </div>
    </>
  )
}

// ── Shared edit + add form for a stack item ───────────────────────────────────
// Used in both the "Add new" panel and the inline edit expansion.
function StackItemForm({ draft, setDraft, onSave, onCancel, saveLabel, saveStatus }) {
  function set(key) {
    return e => setDraft(prev => ({ ...prev, [key]: e.target.value }))
  }

  return (
    <div>

      {/* Row 1: Category dropdown + Tool name */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>

        {/* Category: exactly the five allowed values */}
        <div>
          <label style={labelStyle}>Category</label>
          <select
            value={draft.category ?? 'build'}
            onChange={set('category')}
            style={{ ...inputStyle, cursor: 'pointer' }}
          >
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={labelStyle}>Tool Name</label>
          <input
            type="text"
            value={draft.tool_name ?? ''}
            onChange={set('tool_name')}
            placeholder="e.g. Claude"
            style={inputStyle}
            onFocus={e => { e.currentTarget.style.borderColor = '#2d6a4f' }}
            onBlur={e  => { e.currentTarget.style.borderColor = '#e2e8f0' }}
          />
        </div>
      </div>

      {/* Description */}
      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle}>Description</label>
        <textarea
          value={draft.description ?? ''}
          onChange={set('description')}
          rows={2}
          placeholder="One-line description of how you use this tool…"
          style={{ ...inputStyle, resize: 'vertical', minHeight: 60 }}
          onFocus={e => { e.currentTarget.style.borderColor = '#2d6a4f' }}
          onBlur={e  => { e.currentTarget.style.borderColor = '#e2e8f0' }}
        />
      </div>

      {/* Lesson / What I learnt */}
      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle}>What I learnt</label>
        <textarea
          value={draft.lesson ?? ''}
          onChange={set('lesson')}
          rows={2}
          placeholder="A key insight or lesson from using this tool…"
          style={{ ...inputStyle, resize: 'vertical', minHeight: 60 }}
          onFocus={e => { e.currentTarget.style.borderColor = '#2d6a4f' }}
          onBlur={e  => { e.currentTarget.style.borderColor = '#e2e8f0' }}
        />
      </div>

      {/* Row 2: Display order + Status */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 20, alignItems: 'flex-end' }}>
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
        <div>
          <label style={labelStyle}>Status</label>
          <select
            value={draft.status ?? 'active'}
            onChange={set('status')}
            style={{ ...inputStyle, width: 140, cursor: 'pointer' }}
          >
            <option value="active">Active</option>
            <option value="deprecated">Deprecated</option>
          </select>
        </div>
      </div>

      {/* Save + Cancel + success indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
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
          {saveStatus === 'saving' ? 'Saving…' : saveLabel}
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

        {saveStatus === 'success' && (
          <span style={{ fontSize: 13, color: '#16a34a', fontWeight: 500 }}>✓ Saved</span>
        )}
      </div>
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

const actionBtnStyle = {
  fontSize: 12,
  fontWeight: 500,
  padding: '5px 12px',
  borderRadius: 7,
  border: '1px solid #e2e8f0',
  background: '#fff',
  color: '#475569',
  cursor: 'pointer',
  fontFamily: 'inherit',
  transition: 'all 0.15s',
}
