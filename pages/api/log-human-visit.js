import { createClient } from '@supabase/supabase-js'

// ── Valid category slugs — must match category_visits table in DB ──
// Note: 'none' is a special sentinel used when sentiment is submitted
// before the visitor has selected a category chip.
const VALID_SLUGS = [
  'founder-builder',
  'strategic-partner',
  'real-estate',
  'fellow-maker',
  'just-curious',
  'none',
]

// ── Valid sentiment values ──
const VALID_SENTIMENTS = ['positive', 'neutral', 'negative']

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { slug, sentiment } = req.body

  // Validate slug — must be provided and must be a known value
  if (!slug || !VALID_SLUGS.includes(slug)) {
    return res.status(400).json({ error: 'Invalid slug' })
  }

  // Validate sentiment if provided — must be one of the 3 allowed values
  if (sentiment !== undefined && sentiment !== null && !VALID_SENTIMENTS.includes(sentiment)) {
    return res.status(400).json({
      error: 'Invalid sentiment — must be positive, neutral, or negative',
    })
  }

  try {
    // Create Supabase client using environment variables (never hardcode keys)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    // Build the insert row — include sentiment only if it was provided
    const row = {
      category_slug: slug,
      sentiment:     sentiment ?? null,
    }

    // Insert one visit row into category_visits
    const { error } = await supabase
      .from('category_visits')
      .insert(row)

    if (error) {
      console.error('[log-human-visit] Supabase insert error:', error.message)
      return res.status(500).json({ error: 'Database error' })
    }

    return res.status(200).json({ success: true })
  } catch (err) {
    console.error('[log-human-visit] Unexpected error:', err.message)
    return res.status(500).json({ error: 'Server error' })
  }
}
