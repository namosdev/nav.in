import { createClient } from '@supabase/supabase-js'

// ── Supabase Keepalive Ping ──────────────────────────────────────────────────
// This endpoint is called once daily by the Vercel cron job (see vercel.json).
// It performs a lightweight read from the visitor_categories table to keep the
// Supabase free-tier project alive (Supabase pauses after 7 days of inactivity).
// No auth required — this is an internal cron-only endpoint.
// ────────────────────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  try {
    // Create Supabase client using existing env variables — never hardcoded
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    // Lightweight read — just fetch 1 row to touch the database
    const { error } = await supabase
      .from('visitor_categories')
      .select('id')
      .limit(1)

    // If Supabase returned an error, surface it as a 500
    if (error) {
      console.error('[ping] Supabase error:', error.message)
      return res.status(500).json({ status: 'error', detail: error.message })
    }

    // Success — database is alive
    return res.status(200).json({
      status: 'alive',
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    // Catch any unexpected runtime errors
    console.error('[ping] Unexpected error:', err.message)
    return res.status(500).json({ status: 'error', detail: err.message })
  }
}
