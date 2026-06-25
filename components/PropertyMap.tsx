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
  zoom: zoomProp,
  sector = false,
  radiusKm = 0.6,
  boundary,
  className = ''
}: PropertyMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const { t } = useLocale()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
        let zoom = zoomProp ?? 10

        if (coordinates) {
          // First choice: exact coordinates. These are the most reliable
          // pin for gated communities like Casa de Campo, where Mapbox's
          // address geocoder has poor coverage.
          mapCenter = [coordinates.lng, coordinates.lat]
          zoom = zoomProp ?? 15
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
                'fill-color': '#3B82F6',
                'fill-opacity': 0.15,
              },
            })
            map.current.addLayer({
              id: 'sector-highlight-outline',
              type: 'line',
              source: 'sector-highlight',
              paint: {
                'line-color': '#3B82F6',
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
  }, [coordinates, address, propertyTitle, zoomProp, sector, radiusKm, boundary])

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
        className="w-full h-full min-h-[400px] rounded-lg"
        style={{ opacity: isLoading ? 0 : 1 }}
      />
    </div>
  )
}