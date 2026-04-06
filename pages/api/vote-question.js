import { createClient } from '@supabase/supabase-js'

// ── Supabase client (reads from .env.local / Vercel environment) ──
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// ── POST /api/vote-question ──
// Accepts a visitor's vote and inserts it into question_responses.
// Returns the updated live tally for that question.
//
// Request body: { question_id, category_slug, vote, session_id }
//   - vote must be exactly 'yes' or 'no'
//
// Response shape: { yes: number, no: number, total: number }

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { question_id, category_slug, vote, session_id } = req.body

  // ── Validate required fields ──
  if (!question_id || !category_slug || !vote || !session_id) {
    return res.status(400).json({ error: 'Missing required fields: question_id, category_slug, vote, session_id' })
  }

  // ── Validate vote value — must be exactly 'yes' or 'no' ──
  if (vote !== 'yes' && vote !== 'no') {
    return res.status(400).json({ error: "Invalid vote value. Must be 'yes' or 'no'." })
  }

  try {
    // ── Step 1: Insert the vote into question_responses ──
    const { error: insertError } = await supabase
      .from('question_responses')
      .insert({
        question_id:   question_id,
        category_slug: category_slug,
        vote:          vote,
        session_id:    session_id,
      })

    if (insertError) throw insertError

    // ── Step 2: Fetch the updated tally for this question ──
    // Run yes and no counts in parallel
    const [yesResult, noResult] = await Promise.all([
      supabase
        .from('question_responses')
        .select('id', { count: 'exact', head: true })
        .eq('question_id', question_id)
        .eq('vote', 'yes'),

      supabase
        .from('question_responses')
        .select('id', { count: 'exact', head: true })
        .eq('question_id', question_id)
        .eq('vote', 'no'),
    ])

    if (yesResult.error) throw yesResult.error
    if (noResult.error)  throw noResult.error

    const yesCount = yesResult.count ?? 0
    const noCount  = noResult.count  ?? 0

    return res.status(200).json({
      yes:   yesCount,
      no:    noCount,
      total: yesCount + noCount,
    })

  } catch (err) {
    console.error('[vote-question] Error:', err.message)
    return res.status(500).json({ error: 'Server error. Please try again.' })
  }
}
