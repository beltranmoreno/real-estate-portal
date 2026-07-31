'use client'

import React, { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { useLocale } from '@/contexts/LocaleContext'

interface PropertyMapProps {
  coordinates?: {
    lat: number
    lng: number
  }
  address?: string
  propertyTitle?: string
  className?: string
  /** Overlay resort landmark pins (La Marina, Altos de Chavón, etc.). */
  showAttractions?: boolean
}

interface MapPin {
  id: string
  name_en: string | null
  name_es: string | null
  group: string
  lat: number
  lng: number
  description_en: string | null
  description_es: string | null
  image: string | null
  link: string | null
}

// Toggle groups — order, pin colour, and bilingual label.
const GROUPS: { key: string; color: string; label: { en: string; es: string } }[] = [
  { key: 'restaurants', color: '#f97316', label: { en: 'Restaurants', es: 'Restaurantes' } },
  { key: 'beach', color: '#14b8a6', label: { en: 'Beach', es: 'Playa' } },
  { key: 'golf', color: '#22c55e', label: { en: 'Golf', es: 'Golf' } },
  { key: 'activities', color: '#8b5cf6', label: { en: 'Activities', es: 'Actividades' } },
  { key: 'poi', color: '#0ea5e9', label: { en: 'Points of interest', es: 'Puntos de interés' } },
]
const GROUP_COLOR: Record<string, string> = Object.fromEntries(
  GROUPS.map((g) => [g.key, g.color])
)

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export default function PropertyMap({
  coordinates,
  address,
  propertyTitle = 'Property Location',
  className = '',
  showAttractions = true,
}: PropertyMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const { t, locale } = useLocale()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const markersRef = useRef<{ group: string; marker: mapboxgl.Marker }[]>([])
  const hiddenRef = useRef<Set<string>>(new Set())
  const [hidden, setHidden] = useState<Set<string>>(new Set())
  const [groupsPresent, setGroupsPresent] = useState<string[]>([])

  const applyVisibility = () => {
    for (const { group, marker } of markersRef.current) {
      marker.getElement().style.display = hiddenRef.current.has(group) ? 'none' : ''
    }
  }

  const toggleGroup = (key: string) =>
    setHidden((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })

  // Keep marker visibility in sync when a toggle flips.
  useEffect(() => {
    hiddenRef.current = hidden
    applyVisibility()
  }, [hidden])

  useEffect(() => {
    if (!mapContainer.current) return

    // Set Mapbox access token
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!

    if (!mapboxgl.accessToken) {
      setError('Mapbox token not configured')
      setIsLoading(false)
      return
    }

    const initializeMap = async () => {
      try {
        let mapCenter: [number, number] = [-69.9312, 18.4861] // Default to Dominican Republic
        let zoom = 10

        if (address) {
          // First choice: Geocode the address using Mapbox Geocoding API
          const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${mapboxgl.accessToken}&country=DO&limit=1`
          )
          
          if (response.ok) {
            const data = await response.json()
            if (data.features && data.features.length > 0) {
              const [lng, lat] = data.features[0].center
              mapCenter = [lng, lat]
              zoom = 15
            }
          }
        } else if (coordinates) {
          // Second choice: Use provided coordinates as fallback
          mapCenter = [coordinates.lng, coordinates.lat]
          zoom = 15
        }

        // Initialize the map
        map.current = new mapboxgl.Map({
          container: mapContainer.current!,
          style: process.env.NEXT_PUBLIC_MAPBOX_STYLE_ID || 'mapbox://styles/mapbox/streets-v12',
          center: mapCenter,
          zoom: zoom,
          attributionControl: false
        })

        // Add custom attribution
        map.current.addControl(new mapboxgl.AttributionControl({
          compact: true,
          customAttribution: '© Mapbox'
        }), 'bottom-right')

        // Add navigation controls
        map.current.addControl(new mapboxgl.NavigationControl({
          showCompass: true,
          showZoom: true,
          visualizePitch: true
        }), 'top-right')

        // Add a marker for the property
        const marker = new mapboxgl.Marker({
          color: '#3B82F6', // Blue color
          scale: 1
        })
          .setLngLat(mapCenter)
          .addTo(map.current)

        // Add a popup to the marker
        const popup = new mapboxgl.Popup({
          offset: 25,
          closeButton: false,
          className: 'property-popup'
        }).setHTML(
          `<div class="p-2 text-center">
            <h4 class="font-semibold text-slate-900 mb-1 rounded-md">${propertyTitle}</h4>
            ${address ? `<p class="text-sm text-slate-600">${address}</p>` : ''}
          </div>`
        )

        marker.setPopup(popup)

        // Show popup on load
        popup.addTo(map.current)

        // Overlay resort pins — landmarks (attractions) + restaurants. Each
        // is a group-coloured pin with a click popover (name + blurb + photo).
        markersRef.current = []
        if (showAttractions) {
          try {
            const res = await fetch('/api/map/attractions')
            if (res.ok) {
              const { pins } = (await res.json()) as { pins: MapPin[] }
              const present = new Set<string>()
              const learnMore = t({ en: 'Learn more →', es: 'Ver más →' })
              for (const p of pins) {
                if (typeof p.lat !== 'number' || typeof p.lng !== 'number') continue
                present.add(p.group)
                const name = (locale === 'es' ? p.name_es : p.name_en) || p.name_en || p.name_es || ''
                const desc = (locale === 'es' ? p.description_es : p.description_en) || ''
                const html = `
                  <div class="max-w-[220px]">
                    ${p.image ? `<img src="${p.image}" alt="" class="w-full h-24 object-cover rounded mb-2" />` : ''}
                    <h4 class="font-semibold text-slate-900 text-sm leading-snug">${escapeHtml(name)}</h4>
                    ${desc ? `<p class="text-xs text-slate-600 mt-1 leading-relaxed">${escapeHtml(desc)}</p>` : ''}
                    ${p.link ? `<a href="${p.link}" target="_blank" rel="noopener noreferrer" class="text-xs text-blue-600 underline mt-1.5 inline-block">${learnMore}</a>` : ''}
                  </div>`
                const pPopup = new mapboxgl.Popup({
                  offset: 20,
                  closeButton: true,
                  className: 'attraction-popup',
                  maxWidth: '240px',
                }).setHTML(html)
                const pMarker = new mapboxgl.Marker({
                  color: GROUP_COLOR[p.group] ?? GROUP_COLOR.poi,
                  scale: 0.75,
                })
                  .setLngLat([p.lng, p.lat])
                  .setPopup(pPopup)
                  .addTo(map.current!)
                markersRef.current.push({ group: p.group, marker: pMarker })
              }
              setGroupsPresent(GROUPS.map((g) => g.key).filter((k) => present.has(k)))
              applyVisibility()
            }
          } catch (err) {
            console.error('[PropertyMap] pins fetch failed', err)
          }
        }

        map.current.on('load', () => {
          setIsLoading(false)
        })

        map.current.on('error', (e) => {
          console.error('Map error:', e)
          setError('Failed to load map')
          setIsLoading(false)
        })

      } catch (err) {
        console.error('Error initializing map:', err)
        setError('Failed to initialize map')
        setIsLoading(false)
      }
    }

    initializeMap()

    // Cleanup function
    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [coordinates, address, propertyTitle, showAttractions, locale])

  if (error) {
    return (
      <div className={`bg-slate-100 rounded-lg flex items-center justify-center min-h-[400px] ${className}`}>
        <div className="text-center text-slate-600">
          <svg className="w-12 h-12 mx-auto mb-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className="font-medium">{t({ en: 'Map unavailable', es: 'Mapa no disponible' })}</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className={`relative ${className}`}>
        {isLoading && (
          <div className="absolute inset-0 bg-slate-100 rounded-lg flex items-center justify-center z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-slate-600">{t({ en: 'Loading map...', es: 'Cargando mapa...' })}</p>
            </div>
          </div>
        )}
        <div
          ref={mapContainer}
          className="w-full h-full min-h-[480px] rounded-lg"
          style={{ opacity: isLoading ? 0 : 1 }}
        />
      </div>

      {/* Category toggles — show/hide pin groups on the map. */}
      {groupsPresent.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {GROUPS.filter((g) => groupsPresent.includes(g.key)).map((g) => {
            const on = !hidden.has(g.key)
            return (
              <button
                key={g.key}
                type="button"
                onClick={() => toggleGroup(g.key)}
                aria-pressed={on}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-light transition-colors ${
                  on
                    ? 'border-stone-300 bg-white text-stone-800'
                    : 'border-stone-200 bg-stone-50 text-stone-400'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: g.color, opacity: on ? 1 : 0.35 }}
                />
                {t(g.label)}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}