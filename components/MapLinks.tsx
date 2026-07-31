import { MapPin, ArrowUpRight } from 'lucide-react'

interface Props {
  lat?: number | null
  lng?: number | null
  address?: string | null
  label?: string | null
  className?: string
}

/**
 * "Open in Google Maps / Apple Maps" buttons. Prefers exact coordinates
 * (most accurate); falls back to the text address. Renders nothing when
 * neither is available.
 */
export function MapLinks({ lat, lng, address, label, className = '' }: Props) {
  const hasCoords = typeof lat === 'number' && typeof lng === 'number'
  if (!hasCoords && !address) return null

  const q = encodeURIComponent(label || address || `${lat},${lng}`)

  const googleUrl = hasCoords
    ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
    : `https://www.google.com/maps/search/?api=1&query=${q}`

  const appleUrl = hasCoords
    ? `https://maps.apple.com/?ll=${lat},${lng}&q=${q}`
    : `https://maps.apple.com/?q=${q}`

  const btn =
    'inline-flex items-center gap-1.5 px-4 py-2 border border-stone-300 text-stone-800 text-sm font-light tracking-wide rounded-sm hover:bg-stone-100 transition-colors'

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      <a href={googleUrl} target="_blank" rel="noopener noreferrer" className={btn}>
        <MapPin className="w-4 h-4" />
        Google Maps
        <ArrowUpRight className="w-3.5 h-3.5 text-stone-400" />
      </a>
      <a href={appleUrl} target="_blank" rel="noopener noreferrer" className={btn}>
        <MapPin className="w-4 h-4" />
        Apple Maps
        <ArrowUpRight className="w-3.5 h-3.5 text-stone-400" />
      </a>
    </div>
  )
}
