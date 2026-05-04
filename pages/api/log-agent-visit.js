import { createClient } from '@supabase/supabase-js'

// ── Known AI agent User-Agent patterns — must stay in sync with middleware.js ──
const BOT_PATTERNS = [
  'GPTBot', 'ClaudeBot', 'Google-Extended', 'CCBot',
  'PerplexityBot', 'Diffbot', 'anthropic-ai', 'cohere-ai', 'YouBot',
]

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { user_agent, page_path } = req.body

  // Require a user_agent string to do anything useful
  if (!user_agent || typeof user_agent !== 'string') {
    return res.status(400).json({ error: 'Missing user_agent' })
  }

  // Identify which pattern matched — this is what we store as the clean agent name
  const matchedBot = BOT_PATTERNS.find(pattern =>
    user_agent.toLowerCase().includes(pattern.toLowerCase())
  )

  // If none matched, nothing to log — middleware already checked, but be safe
  if (!matchedBot) {
    return res.status(200).json({ skipped: true })
  }

  try {
    // Create Supabase client using env vars (never hardcode keys)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    // Insert one row into agent_visits with the page the bot actually visited
    const { error } = await supabase.from('agent_visits').insert({
      agent_name:    matchedBot,
      user_agent_raw: user_agent,
      page_path:     page_path || '/',
    })

    if (error) {
      console.error('[log-agent-visit] Supabase error:', error.message)
      return res.status(500).json({ error: 'Database error' })
    }

    return res.status(200).json({ success: true })
  } catch (err) {
    console.error('[log-agent-visit] Unexpected error:', err.message)
    return res.status(500).json({ error: 'Server error' })
  }
}
