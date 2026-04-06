import { createClient } from '@supabase/supabase-js'

// All 5 valid category slugs — used to initialise the breakdown object
const CATEGORY_SLUGS = [
  'founder-builder',
  'strategic-partner',
  'real-estate',
  'fellow-maker',
  'just-curious',
]

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Create Supabase client (reads keys from environment — never hardcoded)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    // ── Calculate start of current month in UTC ──
    const now = new Date()
    const firstOfMonth = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)
    ).toISOString()

    // ── Run all queries in parallel for speed ──
    const [
      monthlyHumansRes,
      alltimeHumansRes,
      monthlyAgentsRes,
      alltimeAgentsRes,
      breakdownRes,
    ] = await Promise.all([
      // Monthly human visits (category_visits this month)
      supabase
        .from('category_visits')
        .select('*', { count: 'exact', head: true })
        .gte('visited_at', firstOfMonth),

      // All-time human visits
      supabase
        .from('category_visits')
        .select('*', { count: 'exact', head: true }),

      // Monthly AI agent visits (agent_visits this month)
      supabase
        .from('agent_visits')
        .select('*', { count: 'exact', head: true })
        .gte('visited_at', firstOfMonth),

      // All-time AI agent visits
      supabase
        .from('agent_visits')
        .select('*', { count: 'exact', head: true }),

      // All category_slug values for breakdown aggregation
      supabase
        .from('category_visits')
        .select('category_slug'),
    ])

    // ── Aggregate category breakdown in JS (group by slug) ──
    // Initialise all 5 slugs to 0 so we never return undefined for a category
    const category_breakdown = {}
    CATEGORY_SLUGS.forEach(slug => { category_breakdown[slug] = 0 })

    if (breakdownRes.data) {
      breakdownRes.data.forEach(row => {
        if (row.category_slug in category_breakdown) {
          category_breakdown[row.category_slug]++
        }
      })
    }

    // ── Return all counts — use 0 as fallback if a query returned null ──
    return res.status(200).json({
      monthly_humans:     monthlyHumansRes.count  ?? 0,
      alltime_humans:     alltimeHumansRes.count   ?? 0,
      monthly_agents:     monthlyAgentsRes.count   ?? 0,
      alltime_agents:     alltimeAgentsRes.count   ?? 0,
      category_breakdown,
    })
  } catch (err) {
    console.error('[visitor-counts] Unexpected error:', err.message)
    return res.status(500).json({ error: 'Server error' })
  }
}
