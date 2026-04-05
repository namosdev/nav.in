import { createClient } from '@supabase/supabase-js'

// ── Valid category slugs — must match visitor_categories table ──
const VALID_SLUGS = [
  'founder-builder',
  'strategic-partner',
  'real-estate',
  'fellow-builder',
  'just-curious',
]

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { category_slug } = req.body

  // Validate that the slug is one of the 5 known categories
  if (!category_slug || !VALID_SLUGS.includes(category_slug)) {
    return res.status(400).json({ error: 'Invalid category_slug' })
  }

  try {
    // Create Supabase client using environment variables (never hardcode keys)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    // Insert one visit row into category_visits
    const { error } = await supabase
      .from('category_visits')
      .insert({ category_slug })

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
