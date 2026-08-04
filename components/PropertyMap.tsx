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
  /** Override the default zoom (e.g. a wider zoom for sector-only maps). */
  zoom?: number
  /**
   * Sector mode: instead of a precise pin, highlight an approximate radius
   * around `coordinates` (the area center). Used when the exact location
   * must stay hidden.
   */
  sector?: boolean
  /** Radius (km) of the sector highlight circle. Defaults to 0.6km. */
  radiusKm?: number
  /**
   * Raw GeoJSON string outlining the sector. When provided (sector mode),
   * the actual shape is drawn instead of the radius circle.
   */
  boundary?: string
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
  images: string[]
  link: string | null
}

// Toggle groups — order, pin colour, and bilingual label.
// Pin colours drawn from the design's desaturated category keys.
const GROUPS: { key: string; color: string; label: { en: string; es: string } }[] = [
  { key: 'restaurants', color: '#4c6b57', label: { en: 'Restaurants', es: 'Restaurantes' } },
  { key: 'beach', color: '#9a7b4f', label: { en: 'Beach', es: 'Playa' } },
  { key: 'golf', color: '#5a6b7a', label: { en: 'Golf', es: 'Golf' } },
  { key: 'activities', color: '#7a6a86', label: { en: 'Activities', es: 'Actividades' } },
  { key: 'poi', color: '#8c5a55', label: { en: 'Points of interest', es: 'Puntos de interés' } },
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

/** Recursively collect [lng, lat] positions from any GeoJSON node. */
function collectPositions(node: any, out: [number, number][] = []): [number, number][] {
  if (!node) return out
  if (Array.isArray(node)) {
    if (typeof node[0] === 'number' && typeof node[1] === 'number') {
      out.push([node[0], node[1]])
    } else {
      node.forEach((n) => collectPositions(n, out))
    }
    return out
  }
  if (node.type === 'FeatureCollection') (node.features || []).forEach((f: any) => collectPositions(f, out))
  else if (node.type === 'Feature') collectPositions(node.geometry, out)
  else if (node.coordinates) collectPositions(node.coordinates, out)
  return out
}

/**
 * Build a GeoJSON polygon approximating a circle of `radiusKm` around a
 * [lng, lat] center. Used for the sector highlight (Mapbox's circle layer
 * sizes in pixels, not meters, so a polygon is needed to scale with zoom).
 */
function geoJSONCircle(
  center: [number, number],
  radiusKm: number,
  points = 64
): GeoJSON.Feature<GeoJSON.Polygon> {
  const [lng, lat] = center
  const distanceX = radiusKm / (111.32 * Math.cos((lat * Math.PI) / 180))
  const distanceY = radiusKm / 110.574
  const coords: [number, number][] = []
  for (let i = 0; i < points; i++) {
    const theta = (i / points) * (2 * Math.PI)
    coords.push([lng + distanceX * Math.cos(theta), lat + distanceY * Math.sin(theta)])
  }
  coords.push(coords[0])
  return {
    type: 'Feature',
    geometry: { type: 'Polygon', coordinates: [coords] },
    properties: {},
  }
}

export default function PropertyMap({
  coordinates,
  address,
  propertyTitle = 'Property Location',
  showAttractions = true,
  zoom: zoomProp,
  sector = false,
  radiusKm = 0.6,
  boundary,
  className = ''
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
        let zoom = zoomProp ?? 15

        if (coordinates) {
          // First choice: exact coordinates. These are the most reliable
          // pin for gated communities like Casa de Campo, where Mapbox's
          // address geocoder has poor coverage.
          mapCenter = [coordinates.lng, coordinates.lat]
          zoom = zoomProp ?? 14
        } else if (address) {
          // Fallback: geocode the text address via the Mapbox Geocoding API.
          const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${mapboxgl.accessToken}&country=DO&limit=1`
          )

          if (response.ok) {
            const data = await response.json()
            if (data.features && data.features.length > 0) {
              const [lng, lat] = data.features[0].center
              mapCenter = [lng, lat]
              zoom = zoomProp ?? 15
            }
          }
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

        // Sector mode highlights the area (drawn boundary if available,
        // otherwise an approximate radius) instead of pinning the exact
        // spot; a precise marker would defeat the purpose.
        let parsedBoundary: any = null
        if (sector && boundary) {
          try {
            parsedBoundary = JSON.parse(boundary)
          } catch {
            parsedBoundary = null
          }
        }
        const useSectorHighlight =
          sector && (Boolean(coordinates) || Boolean(parsedBoundary))

        if (!useSectorHighlight) {
          // Add a marker for the property
          const marker = new mapboxgl.Marker({
            color: '#1c1917', // Blue color
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
              <h4 class="font-semibold text-ink mb-1 rounded-md">${propertyTitle}</h4>
              ${address ? `<p class="text-sm text-muted">${address}</p>` : ''}
            </div>`
          )

          marker.setPopup(popup)

          // Show popup on load
          popup.addTo(map.current)
        }

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
                const images = Array.isArray(p.images) ? p.images : []
                const hero = images[0]
                  ? `<img src="${images[0]}" alt="" style="width:100%;height:96px;object-fit:cover;border-radius:4px;margin-bottom:6px" />`
                  : ''
                const thumbs =
                  images.length > 1
                    ? `<div style="display:flex;gap:4px;overflow-x:auto;margin-bottom:8px">${images
                        .slice(1, 5)
                        .map(
                          (u) =>
                            `<img src="${u}" alt="" style="height:44px;width:60px;object-fit:cover;border-radius:3px;flex:0 0 auto" />`
                        )
                        .join('')}</div>`
                    : ''
                const html = `
                  <div class="max-w-[220px]">
                    ${hero}
                    ${thumbs}
                    <h4 class="font-semibold text-ink text-sm leading-snug">${escapeHtml(name)}</h4>
                    ${desc ? `<p class="text-xs text-muted mt-1 leading-relaxed">${escapeHtml(desc)}</p>` : ''}
                    ${p.link ? `<a href="${p.link}" target="_blank" rel="noopener noreferrer" class="text-xs text-brand underline mt-1.5 inline-block">${learnMore}</a>` : ''}
                  </div>`
                const pPopup = new mapboxgl.Popup({
                  offset: 20,
                  closeButton: false,
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
          if (useSectorHighlight && map.current) {
            // Prefer the hand-drawn sector boundary; fall back to a circle.
            const data: GeoJSON.Feature | GeoJSON.FeatureCollection =
              parsedBoundary ?? geoJSONCircle(mapCenter, radiusKm)
            map.current.addSource('sector-highlight', {
              type: 'geojson',
              data,
            })
            map.current.addLayer({
              id: 'sector-highlight-fill',
              type: 'fill',
              source: 'sector-highlight',
              paint: {
                'fill-color': '#1c1917',
                'fill-opacity': 0.15,
              },
            })
            map.current.addLayer({
              id: 'sector-highlight-outline',
              type: 'line',
              source: 'sector-highlight',
              paint: {
                'line-color': '#1c1917',
                'line-width': 2,
                'line-opacity': 0.6,
              },
            })

            // Frame the highlighted area.
            const positions = collectPositions(data)
            if (positions.length > 0) {
              const bounds = positions.reduce(
                (b, c) => b.extend(c),
                new mapboxgl.LngLatBounds(positions[0], positions[0])
              )
              map.current.fitBounds(bounds, { padding: 48, duration: 0 })
            }
          }
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
  }, [coordinates, address, propertyTitle, zoomProp, sector, radiusKm, boundary, showAttractions, locale])

  if (error) {
    return (
      <div className={`bg-sand rounded-lg flex items-center justify-center min-h-[400px] ${className}`}>
        <div className="text-center text-muted">
          <svg className="w-12 h-12 mx-auto mb-4 text-faint" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <div className="absolute inset-0 bg-sand rounded-lg flex items-center justify-center z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand mx-auto mb-4"></div>
              <p className="text-muted">{t({ en: 'Loading map...', es: 'Cargando mapa...' })}</p>
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
                    ? 'border-line bg-white text-ink'
                    : 'border-line bg-canvas text-faint'
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