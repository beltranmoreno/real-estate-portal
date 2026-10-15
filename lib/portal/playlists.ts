import 'server-only'
import { client as sanityClient } from '@/sanity/lib/client'

export interface PortalPlaylist {
  id: string
  url: string
  title: string
  cover: string | null
  moment_en?: string | null
  moment_es?: string | null
}

/** Leticia's Spotify profile, linked under the playlists. */
export const SPOTIFY_PROFILE_URL = 'https://open.spotify.com/user/31wcvyn2ebyrgg5iv44kqrobtucu'

interface PlaylistDoc {
  _id: string
  spotifyUrl: string
  title?: string | null
  moment_en?: string | null
  moment_es?: string | null
}

/**
 * Cover art + Spotify's own title via the public oEmbed endpoint (no API key).
 * Cached for a day; a failed lookup just means no cover.
 */
async function spotifyMeta(url: string): Promise<{ title?: string; cover?: string }> {
  try {
    const res = await fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`, {
      next: { revalidate: 86400 },
    })
    if (!res.ok) return {}
    const data = await res.json()
    return { title: data?.title, cover: data?.thumbnail_url }
  } catch {
    return {}
  }
}

/** Active playlists from Studio (Concierge → Playlists), in their set order. */
export async function getPortalPlaylists(): Promise<PortalPlaylist[]> {
  let docs: PlaylistDoc[] = []
  try {
    docs = await sanityClient.fetch(
      `*[_type == "playlist" && isActive != false && defined(spotifyUrl)]
        | order(coalesce(order, 999) asc, _createdAt asc) {
          _id, spotifyUrl, title, moment_en, moment_es
        }`
    )
  } catch (err) {
    console.error('[portal/playlists] fetch failed', err)
    return []
  }

  return Promise.all(
    docs.map(async (d) => {
      const meta = await spotifyMeta(d.spotifyUrl)
      return {
        id: d._id,
        url: d.spotifyUrl,
        title: d.title || meta.title || 'Playlist',
        cover: meta.cover ?? null,
        moment_en: d.moment_en,
        moment_es: d.moment_es,
      }
    })
  )
}
