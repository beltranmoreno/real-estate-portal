import Image from 'next/image'
import Link from 'next/link'
import { urlFor } from '@/sanity/lib/image'

/**
 * Compact restaurant card (restaurants page, resort guides). Image on top, lean meta below.
 * Whole card is one tap target — wrapped in <Link>.
 */
export function RestaurantCard({
  restaurant,
  locale,
  eyebrow,
}: {
  restaurant: any
  locale: string
  /** Overrides the cuisine line, e.g. the area for bars. */
  eyebrow?: string
}) {
  const name = locale === 'en' ? restaurant.name_en : restaurant.name_es
  const summary = locale === 'en' ? restaurant.summary_en : restaurant.summary_es

  const getTodayHours = () => {
    const today = new Date().getDay()
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const todaySchedule = restaurant.hours?.schedule?.find((s: any) => s.day_en === dayNames[today])
    // No hours entered for today → say nothing rather than claim it's closed.
    if (!todaySchedule) return null
    if (todaySchedule.closed) {
      return locale === 'en' ? 'Closed today' : 'Cerrado hoy'
    }
    if (!todaySchedule.openTime || !todaySchedule.closeTime) return null
    return `${todaySchedule.openTime} – ${todaySchedule.closeTime}`
  }

  return (
    <Link
      href={`/restaurants/${restaurant.slug}`}
      className="group block"
    >
      <div className="relative aspect-[4/3] bg-sand overflow-hidden">
        {restaurant.featuredImage && (
          <Image
            src={urlFor(restaurant.featuredImage).width(600).height(450).url()}
            alt={name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        )}
      </div>

      {/* Same rhythm as PropertyCard: name, eyebrow line, one quiet detail line. */}
      <div className="mt-4 flex flex-col gap-1">
        <h3 className="font-serif text-[23px] leading-tight text-ink decoration-1 underline-offset-4 group-hover:underline">
          {name}
        </h3>
        {(() => {
          const line =
            eyebrow ||
            restaurant.cuisine?.slice(0, 2).join(' · ') ||
            (restaurant.venueType === 'cafe'
              ? locale === 'en' ? 'Café & quick bites' : 'Café y bocados'
              : '')
          return line ? <span className="eyebrow !tracking-[0.16em]">{line}</span> : null
        })()}
        {summary && (
          <p className="mt-0.5 text-[13px] font-light text-muted leading-relaxed line-clamp-2">{summary}</p>
        )}
        {getTodayHours() && (
          <p className="mt-0.5 text-[13px] font-light text-muted-2">{getTodayHours()}</p>
        )}
      </div>
    </Link>
  )
}
