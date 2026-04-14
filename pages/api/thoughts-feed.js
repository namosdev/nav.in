// pages/api/thoughts-feed.js
// Fetches the Substack RSS feed server-side and returns parsed posts as JSON.
// Running this server-side avoids CORS restrictions and removes the dependency
// on third-party services like rss2json.com.

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).end()
  }

  const FEED_URL = 'https://namos.substack.com/feed'

  try {
    // Fetch the RSS/Atom feed directly from Substack
    const response = await fetch(FEED_URL, {
      headers: {
        // Some feeds require a User-Agent header — provide a descriptive one
        'User-Agent': 'Mozilla/5.0 (compatible; navinoswal.com/1.0; RSS reader)',
      },
    })

    if (!response.ok) {
      console.error('[thoughts-feed] Feed fetch failed:', response.status)
      return res.status(502).json({ error: 'Could not fetch RSS feed', status: response.status })
    }

    const xml = await response.text()

    // ── Split XML into individual <item> blocks ──
    // Substack RSS wraps each post in <item>...</item>
    const itemBlocks = xml.match(/<item>([\s\S]*?)<\/item>/g) || []

    // Helper: extract a field value from an item block.
    // Handles both CDATA-wrapped values (<tag><![CDATA[...]]></tag>)
    // and plain text values (<tag>value</tag>).
    function getField(block, tag) {
      // Build regex dynamically — colon in "content:encoded" is not a special regex char
      const cdataRe = new RegExp(
        '<' + tag + '[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/' + tag + '>'
      )
      const cdataMatch = block.match(cdataRe)
      if (cdataMatch) return cdataMatch[1]

      const plainRe = new RegExp('<' + tag + '[^>]*>([\\s\\S]*?)<\\/' + tag + '>')
      const plainMatch = block.match(plainRe)
      return plainMatch ? plainMatch[1].trim() : ''
    }

    // ── Parse each item block into a plain object ──
    const items = itemBlocks
      .map(block => {
        // Collect all <category> values — a post may have multiple tags
        const catMatches = [
          ...block.matchAll(/<category[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/category>/gs),
        ]
        const categories = catMatches.map(m => m[1].trim()).filter(Boolean)

        return {
          title:       getField(block, 'title'),
          link:        getField(block, 'link'),
          pubDate:     getField(block, 'pubDate'),
          // description = excerpt/summary Substack puts in the feed
          description: getField(block, 'description'),
          // content:encoded = full post HTML body (Substack includes this)
          content:     getField(block, 'content:encoded') || getField(block, 'description'),
          categories,
        }
      })
      // Drop any item that somehow has no title or link
      .filter(item => item.title && item.link)

    // Cache the response for 1 hour on the CDN edge; serve stale for up to 24 h
    // while a fresh fetch happens in the background (stale-while-revalidate).
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400')
    return res.status(200).json({ items })
  } catch (err) {
    console.error('[thoughts-feed] Unexpected error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
