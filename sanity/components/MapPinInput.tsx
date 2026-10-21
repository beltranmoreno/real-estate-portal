'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { set, unset, type ObjectInputProps } from 'sanity'
import { Box, Button, Card, Flex, Stack, Text, TextInput } from '@sanity/ui'

/**
 * Studio input for a `geopoint`: a Mapbox map where editors click to drop the
 * pin, drag it to adjust, or search an address — instead of typing latitude
 * and longitude. Uses the same Mapbox token as the site's property maps.
 */

type GeoPoint = { _type?: 'geopoint'; lat?: number; lng?: number; alt?: number }

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
// Casa de Campo, La Romana — where the map opens when there's no pin yet.
const DEFAULT_CENTER: [number, number] = [-68.93, 18.415]
const STYLES = {
  streets: 'mapbox://styles/mapbox/streets-v12',
  satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
}

interface SearchResult {
  id: string
  name: string
  place: string
  lng: number
  lat: number
}

export function MapPinInput(props: ObjectInputProps<GeoPoint>) {
  const { value, onChange, readOnly } = props
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const markerRef = useRef<mapboxgl.Marker | null>(null)
  const [style, setStyle] = useState<keyof typeof STYLES>('streets')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)

  const hasPin = typeof value?.lat === 'number' && typeof value?.lng === 'number'

  const setPin = useCallback(
    (lng: number, lat: number) => {
      onChange(set({ _type: 'geopoint', lat: Number(lat.toFixed(6)), lng: Number(lng.toFixed(6)) }))
    },
    [onChange]
  )

  // Create the map once.
  useEffect(() => {
    if (!TOKEN || !containerRef.current || mapRef.current) return
    mapboxgl.accessToken = TOKEN
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: STYLES.streets,
      center: hasPin ? [value!.lng!, value!.lat!] : DEFAULT_CENTER,
      zoom: hasPin ? 16 : 13,
    })
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right')
    mapRef.current = map
    // Studio may mount the field hidden (tabs, collapsed fieldsets); refit on reveal.
    const observer = new ResizeObserver(() => map.resize())
    observer.observe(containerRef.current)
    return () => {
      observer.disconnect()
      map.remove()
      mapRef.current = null
      markerRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Click to place the pin.
  useEffect(() => {
    const map = mapRef.current
    if (!map || readOnly) return
    const onClick = (e: mapboxgl.MapMouseEvent) => setPin(e.lngLat.lng, e.lngLat.lat)
    map.on('click', onClick)
    map.getCanvas().style.cursor = 'crosshair'
    return () => {
      map.off('click', onClick)
    }
  }, [readOnly, setPin])

  // Keep the marker in sync with the stored value.
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    if (!hasPin) {
      markerRef.current?.remove()
      markerRef.current = null
      return
    }
    const lngLat: [number, number] = [value!.lng!, value!.lat!]
    if (!markerRef.current) {
      const marker = new mapboxgl.Marker({ color: '#33504c', draggable: !readOnly }).setLngLat(lngLat).addTo(map)
      marker.on('dragend', () => {
        const p = marker.getLngLat()
        setPin(p.lng, p.lat)
      })
      markerRef.current = marker
    } else {
      markerRef.current.setLngLat(lngLat)
    }
  }, [hasPin, value?.lat, value?.lng, readOnly, setPin])

  // Streets / satellite.
  useEffect(() => {
    mapRef.current?.setStyle(STYLES[style])
  }, [style])

  const search = async () => {
    if (!TOKEN || !query.trim()) return
    setSearching(true)
    try {
      const url = new URL('https://api.mapbox.com/search/geocode/v6/forward')
      url.searchParams.set('q', query.trim())
      url.searchParams.set('access_token', TOKEN)
      url.searchParams.set('country', 'do')
      url.searchParams.set('proximity', DEFAULT_CENTER.join(','))
      url.searchParams.set('limit', '5')
      const res = await fetch(url)
      const data = await res.json()
      setResults(
        (data.features ?? []).map((f: any) => ({
          id: f.id,
          name: f.properties?.name ?? '',
          place: f.properties?.place_formatted ?? '',
          lng: f.geometry.coordinates[0],
          lat: f.geometry.coordinates[1],
        }))
      )
    } catch {
      setResults([])
    } finally {
      setSearching(false)
    }
  }

  const choose = (r: SearchResult) => {
    mapRef.current?.flyTo({ center: [r.lng, r.lat], zoom: 17 })
    if (!readOnly) setPin(r.lng, r.lat)
    setResults([])
  }

  if (!TOKEN) {
    return (
      <Stack space={3}>
        <Card padding={3} tone="caution" border radius={2}>
          <Text size={1}>Map unavailable: NEXT_PUBLIC_MAPBOX_TOKEN isn’t set. You can still type the coordinates.</Text>
        </Card>
        {props.renderDefault(props)}
      </Stack>
    )
  }

  return (
    <Stack space={3}>
      {!readOnly && (
        <Flex gap={2}>
          <Box flex={1}>
            <TextInput
              value={query}
              placeholder="Search an address or place…"
              onChange={(e) => setQuery(e.currentTarget.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  search()
                }
              }}
            />
          </Box>
          <Button text={searching ? 'Searching…' : 'Search'} mode="ghost" onClick={search} disabled={searching} />
        </Flex>
      )}

      {results.length > 0 && (
        <Card border radius={2}>
          <Stack>
            {results.map((r) => (
              <Button key={r.id} mode="bleed" justify="flex-start" onClick={() => choose(r)} padding={3}>
                <Stack space={2}>
                  <Text size={1} weight="medium">
                    {r.name}
                  </Text>
                  {r.place && (
                    <Text size={1} muted>
                      {r.place}
                    </Text>
                  )}
                </Stack>
              </Button>
            ))}
          </Stack>
        </Card>
      )}

      <Card radius={2} border overflow="hidden">
        <div ref={containerRef} style={{ height: 380, width: '100%' }} />
      </Card>

      <Flex align="center" justify="space-between" gap={2} wrap="wrap">
        <Text size={1} muted>
          {hasPin
            ? `Lat ${value!.lat!.toFixed(6)} · Lng ${value!.lng!.toFixed(6)}`
            : readOnly
              ? 'No location set.'
              : 'Click the map to drop the pin, then drag it to adjust.'}
        </Text>
        <Flex gap={2}>
          <Button
            text={style === 'streets' ? 'Satellite' : 'Streets'}
            mode="ghost"
            fontSize={1}
            padding={2}
            onClick={() => setStyle((s) => (s === 'streets' ? 'satellite' : 'streets'))}
          />
          {hasPin && !readOnly && (
            <Button text="Clear" mode="ghost" tone="critical" fontSize={1} padding={2} onClick={() => onChange(unset())} />
          )}
        </Flex>
      </Flex>
    </Stack>
  )
}
