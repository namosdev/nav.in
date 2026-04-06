import { createClient } from '@supabase/supabase-js'

// ── Supabase client (reads from .env.local / Vercel environment) ──
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// ── GET /api/question-data ──
// Returns the currently active question and its yes/no vote tally.
// Used by the homepage monthly question widget on load.
//
// Response shape:
//   { question: { id, question }, tally: { yes, no, total } }
//   or { question: null, tally: null } if no active question exists

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // ── Step 1: Fetch the most recent active question ──
    // Order by created_at desc so newer questions take priority if somehow
    // multiple are active at once (shouldn't happen, but defensive).
    const { data: questions, error: qError } = await supabase
      .from('homepage_widget')
      .select('id, question')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)

    if (qError) throw qError

    // If no active question exists, return nulls — frontend will hide the widget
    if (!questions || questions.length === 0) {
      return res.status(200).json({ question: null, tally: null })
    }

    const activeQuestion = questions[0]

    // ── Step 2: Count yes and no votes for this question ──
    // Run both counts in parallel for performance
    const [yesResult, noResult] = await Promise.all([
      supabase
        .from('question_responses')
        .select('id', { count: 'exact', head: true })
        .eq('question_id', activeQuestion.id)
        .eq('vote', 'yes'),

      supabase
        .from('question_responses')
        .select('id', { count: 'exact', head: true })
        .eq('question_id', activeQuestion.id)
        .eq('vote', 'no'),
    ])

    if (yesResult.error) throw yesResult.error
    if (noResult.error)  throw noResult.error

    const yesCount = yesResult.count ?? 0
    const noCount  = noResult.count  ?? 0

    return res.status(200).json({
      question: {
        id:       activeQuestion.id,
        question: activeQuestion.question,
      },
      tally: {
        yes:   yesCount,
        no:    noCount,
        total: yesCount + noCount,
      },
    })

  } catch (err) {
    console.error('[question-data] Error:', err.message)
    // Return nulls on error — frontend silently hides the widget
    return res.status(200).json({ question: null, tally: null })
  }
}
