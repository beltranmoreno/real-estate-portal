import { ArrowUpRight } from 'lucide-react'
import type { PortalPlaylist } from '@/lib/portal/playlists'

/**
 * Leticia's Spotify playlists as a grid of covers. Each opens in Spotify
 * (app or web); a quiet link to the profile sits underneath.
 */
export function PlaylistGrid({
  playlists,
  profileUrl,
  locale,
}: {
  playlists: PortalPlaylist[]
  profileUrl: string
  locale: 'en' | 'es'
}) {
  const t = (en: string, es: string) => (locale === 'es' ? es : en)
  if (playlists.length === 0) return null

  return (
    <div>
      <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-5 gap-y-8">
        {playlists.map((p) => {
          const moment = (locale === 'es' ? p.moment_es : p.moment_en) || p.moment_en
          return (
            <li key={p.id}>
              <a href={p.url} target="_blank" rel="noopener noreferrer" className="group block">
                <div className="relative aspect-square overflow-hidden bg-sand">
                  {p.cover && (
                    // Spotify's image CDN; a plain <img> avoids whitelisting
                    // its rotating hostnames for next/image.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.cover} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                  )}
                </div>
                <p className="mt-3 font-title text-lg text-ink leading-tight decoration-1 underline-offset-4 group-hover:underline">
                  {p.title}
                </p>
                {moment && <p className="mt-1 text-[13px] text-muted font-light leading-snug">{moment}</p>}
              </a>
            </li>
          )
        })}
      </ul>

      <a
        href={profileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-8 inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.14em] text-ink border-b border-line pb-1 hover:border-ink transition-colors"
      >
        {t('All of Leticia’s playlists on Spotify', 'Todas las playlists de Leticia en Spotify')}
        <ArrowUpRight className="w-3.5 h-3.5" aria-hidden />
      </a>
    </div>
  )
}
