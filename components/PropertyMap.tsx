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
}

export default function PropertyMap({ 
  coordinates, 
  address, 
  propertyTitle = 'Property Location',
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
  }, [coordinates, address, propertyTitle])

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