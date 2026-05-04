import { NextResponse } from 'next/server'

// ── Known AI agent User-Agent patterns — must stay in sync with log-agent-visit.js ──
const BOT_PATTERNS = [
  'GPTBot', 'ClaudeBot', 'Google-Extended', 'CCBot',
  'PerplexityBot', 'Diffbot', 'anthropic-ai', 'cohere-ai', 'YouBot',
]

export function middleware(request) {
  const ua = request.headers.get('user-agent') || ''
  const pathname = request.nextUrl.pathname

  // Check if the User-Agent matches any known AI bot pattern (case-insensitive)
  const isBot = BOT_PATTERNS.some(pattern =>
    ua.toLowerCase().includes(pattern.toLowerCase())
  )

  if (isBot) {
    // Build the absolute URL for the internal log endpoint.
    // request.nextUrl.origin gives us the correct host (localhost in dev, domain in prod).
    const logUrl = new URL('/api/log-agent-visit', request.nextUrl.origin)

    // Fire-and-forget — we do NOT await this fetch so page delivery is never delayed.
    // The page always loads regardless of whether the log call succeeds.
    fetch(logUrl.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_agent: ua,
        page_path:  pathname,
      }),
    }).catch(() => {}) // Silently swallow errors — logging must never break pages
  }

  // Always pass the request through — this middleware never blocks
  return NextResponse.next()
}

// ── Route matcher — which requests this middleware runs on ──
// Exclude: API routes, Next.js internals (_next/), and files with extensions
// (static assets like images, fonts, robots.txt, etc.)
// This ensures middleware runs on real page routes only: /, /about, /ventures, etc.
export const config = {
  matcher: ['/((?!api/|_next/|favicon\\.ico|.*\\..*).*)'],
}
