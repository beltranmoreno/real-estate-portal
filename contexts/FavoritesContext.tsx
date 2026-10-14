'use client'

import React, { createContext, useContext, useState, useEffect, useRef } from 'react'
import useSWR from 'swr'
import { fetcher } from '@/lib/swr'

export interface FavoriteProperty {
  _id: string
  slug: string
  title_es: string
  title_en: string
  mainImage: any
  bedrooms: number
  bathrooms: number
  maxGuests: number
  area?: {
    title_es: string
    title_en: string
    slug: string
  }
  nightlyRate?: {
    amount: number
    currency: string
  }
  salePrice?: {
    amount: number
    currency: string
  }
  listingType: 'rental' | 'sale' | 'both'
}

interface FavoritesResponse {
  authenticated: boolean
  favorites: FavoriteProperty[]
}

interface FavoritesContextType {
  favorites: FavoriteProperty[]
  addFavorite: (property: FavoriteProperty) => void
  removeFavorite: (propertyId: string) => void
  isFavorite: (propertyId: string) => boolean
  clearFavorites: () => void
  favoritesCount: number
  /** True once the account favorites have been loaded (signed-in users). */
  isAuthenticated: boolean
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

const STORAGE_KEY = 'lcs-real-estate-favorites'
const API_KEY = '/api/favorites'

function readStorage(): FavoriteProperty[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

const dedupeAdd = (list: FavoriteProperty[], property: FavoriteProperty) =>
  list.some((f) => f._id === property._id) ? list : [...list, property]

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  // Anonymous store — held in localStorage until the visitor signs in.
  const [localFavorites, setLocalFavorites] = useState<FavoriteProperty[]>([])
  const [isHydrated, setIsHydrated] = useState(false)
  const syncedRef = useRef(false)

  // Background fetch of the account's favorites. Always resolves 200 with
  // `{ authenticated, favorites }`, so we branch on `authenticated` instead
  // of handling a 401. Signed-out visitors get `authenticated: false`.
  const { data, mutate } = useSWR<FavoritesResponse>(API_KEY, fetcher)
  const authenticated = data?.authenticated ?? false
  const serverFavorites = data?.favorites ?? []

  // Load the anonymous list from localStorage on mount.
  useEffect(() => {
    setLocalFavorites(readStorage())
    setIsHydrated(true)
  }, [])

  // Persist the anonymous list. Once signed in the account is the source of
  // truth (and localStorage is cleared by the sync below), so skip writing.
  useEffect(() => {
    if (!isHydrated || authenticated) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(localFavorites))
    } catch (error) {
      console.error('Error saving favorites to localStorage:', error)
    }
  }, [localFavorites, isHydrated, authenticated])

  // On sign-in / sign-up: merge any locally-held favorites into the account
  // (once), then clear localStorage and adopt the merged server list.
  useEffect(() => {
    if (!isHydrated || !authenticated || syncedRef.current) return
    syncedRef.current = true

    const pending = readStorage()
    if (pending.length === 0) return

    ;(async () => {
      try {
        const res = await fetch(`${API_KEY}/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ propertyIds: pending.map((f) => f._id) }),
        })
        if (res.ok) {
          const merged: FavoritesResponse = await res.json()
          mutate(merged, { revalidate: false })
        } else {
          mutate()
        }
      } catch {
        mutate()
      } finally {
        try {
          localStorage.removeItem(STORAGE_KEY)
        } catch {}
        setLocalFavorites([])
      }
    })()
  }, [authenticated, isHydrated, mutate])

  // Effective list: account when signed in, otherwise the local list.
  const favorites = authenticated ? serverFavorites : localFavorites

  const addFavorite = (property: FavoriteProperty) => {
    if (!authenticated) {
      setLocalFavorites((prev) => dedupeAdd(prev, property))
      return
    }
    // Optimistic cache update, then persist + revalidate (invalidate).
    mutate(
      (cur) => ({ authenticated: true, favorites: dedupeAdd(cur?.favorites ?? [], property) }),
      { revalidate: false }
    )
    fetch(API_KEY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ propertyId: property._id }),
    })
      .catch(() => {})
      .finally(() => mutate())
  }

  const removeFavorite = (propertyId: string) => {
    if (!authenticated) {
      setLocalFavorites((prev) => prev.filter((f) => f._id !== propertyId))
      return
    }
    mutate(
      (cur) => ({
        authenticated: true,
        favorites: (cur?.favorites ?? []).filter((f) => f._id !== propertyId),
      }),
      { revalidate: false }
    )
    fetch(`${API_KEY}?propertyId=${encodeURIComponent(propertyId)}`, { method: 'DELETE' })
      .catch(() => {})
      .finally(() => mutate())
  }

  const clearFavorites = () => {
    if (!authenticated) {
      setLocalFavorites([])
      return
    }
    mutate({ authenticated: true, favorites: [] }, { revalidate: false })
    fetch(API_KEY, { method: 'DELETE' })
      .catch(() => {})
      .finally(() => mutate())
  }

  const isFavorite = (propertyId: string) => favorites.some((fav) => fav._id === propertyId)

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        addFavorite,
        removeFavorite,
        isFavorite,
        clearFavorites,
        favoritesCount: favorites.length,
        isAuthenticated: authenticated,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider')
  }
  return context
}
