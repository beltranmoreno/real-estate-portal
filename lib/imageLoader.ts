'use client'

/**
 * Global next/image loader. Sanity's CDN already resizes and re-encodes on
 * the fly, so Sanity images skip Vercel's optimizer (which bills per source
 * image × width) and ask Sanity for each srcset width directly.
 *
 * The width set with urlFor(...).width() is treated as the maximum, and a
 * fixed height scales with it so crops keep their aspect ratio.
 */
export default function imageLoader({ src, width, quality }: { src: string; width: number; quality?: number }) {
  if (!src.startsWith('https://cdn.sanity.io/')) {
    // Local files in /public (logo, avatar) are small; serve them as-is.
    return src
  }

  const url = new URL(src)
  const params = url.searchParams
  const maxW = Number(params.get('w')) || Infinity
  const w = Math.min(width, maxW)

  const h = Number(params.get('h'))
  if (h && maxW !== Infinity) params.set('h', String(Math.round((h * w) / maxW)))
  params.set('w', String(w))
  if (quality || !params.has('q')) params.set('q', String(quality || 75))
  // WebP/AVIF for browsers that accept it.
  params.set('auto', 'format')

  return url.toString()
}
