'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import { Property } from '@/lib/types'
import 'mapbox-gl/dist/mapbox-gl.css'

interface MapViewProps {
  properties: Property[]
  selectedProperty?: Property | null
  onPropertySelect: (property: Property) => void
  className?: string
}

export default function MapView({
  properties,
  selectedProperty,
  onPropertySelect,
  className = ""
}: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({})
  const [isLoaded, setIsLoaded] = useState(false)

  const handlePropertySelection = (property: Property) => {
    // Update marker colors
    Object.entries(markersRef.current).forEach(([id, marker]) => {
      const element = marker.getElement()
      if (id === property._id) {
        element.style.background = '#3b82f6' // Blue for selected
        element.style.transform = 'scale(1.2)'
      } else {
        element.style.background = '#ef4444' // Red for unselected
        element.style.transform = 'scale(1)'
      }
    })

    onPropertySelect(property)

    // Fly to property location
    if (property.location?.coordinates) {
      map.current?.flyTo({
        center: [property.location.coordinates.lng, property.location.coordinates.lat],
        zoom: 14,
        duration: 10,
        essential: true
      })
    }
  }

  useEffect(() => {
    if (!mapContainer.current) return

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: process.env.NEXT_PUBLIC_MAPBOX_STYLE_ID || 'mapbox://styles/mapbox/light-v11',
      center: [-68.9444, 19.8849],
      zoom: 10,
      antialias: true
    })

    map.current.on('load', () => {
      setIsLoaded(true)

      // Add navigation controls
      map.current?.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right')

      // Add markers for properties
      properties.forEach(property => {
        if (!property.location?.coordinates?.lng || !property.location?.coordinates?.lat) {
          return
        }

        // Create custom marker element
        const markerEl = document.createElement('div')
        markerEl.className = 'property-marker'
        markerEl.style.cssText = `
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: ${selectedProperty?._id === property._id ? '#3b82f6' : '#ef4444'};
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 12px;
          transition: all 0.2s ease;
          transform: ${selectedProperty?._id === property._id ? 'scale(1.2)' : 'scale(1)'};
        `
        markerEl.textContent = '$'

        const marker = new mapboxgl.Marker(markerEl)
          .setLngLat([property.location.coordinates.lng, property.location.coordinates.lat])
          .addTo(map.current!)

        // Store marker reference
        markersRef.current[property._id] = marker

        // Add click handler to marker element
        markerEl.addEventListener('click', (e) => {
          e.stopPropagation()
          handlePropertySelection(property)
        })
      })

      // Fit map to show all properties
      if (properties.length > 0) {
        const validCoords = properties
          .filter(p => p.location?.coordinates?.lng && p.location?.coordinates?.lat)
          .map(p => [p.location!.coordinates!.lng, p.location!.coordinates!.lat] as [number, number])

        if (validCoords.length > 0) {
          const bounds = new mapboxgl.LngLatBounds()
          validCoords.forEach(coord => bounds.extend(coord))
          map.current?.fitBounds(bounds, { padding: 50 })
        }
      }
    })

    return () => {
      // Clean up markers
      Object.values(markersRef.current).forEach(marker => marker.remove())
      markersRef.current = {}
      map.current?.remove()
    }
  }, [properties, selectedProperty])

  // Update marker selection when selectedProperty changes externally
  useEffect(() => {
    if (!isLoaded) return

    Object.entries(markersRef.current).forEach(([id, marker]) => {
      const element = marker.getElement()
      if (id === selectedProperty?._id) {
        element.style.background = '#3b82f6'
        element.style.transform = 'scale(1.2)'
      } else {
        element.style.background = '#ef4444'
        element.style.transform = 'scale(1)'
      }
    })
  }, [selectedProperty, isLoaded])

  return (
    <div className={`relative ${className}`}>
      <div
        ref={mapContainer}
        className="w-full h-full"
        style={{
          cursor: 'grab'
        }}
      />
    </div>
  )
}