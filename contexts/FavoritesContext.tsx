'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

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

interface FavoritesContextType {
  favorites: FavoriteProperty[]
  addFavorite: (property: FavoriteProperty) => void
  removeFavorite: (propertyId: string) => void
  isFavorite: (propertyId: string) => boolean
  clearFavorites: () => void
  favoritesCount: number
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

const STORAGE_KEY = 'lcs-real-estate-favorites'

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<FavoriteProperty[]>([])
  const [isHydrated, setIsHydrated] = useState(false)

  // Load favorites from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        setFavorites(parsed)
      }
    } catch (error) {
      console.error('Error loading favorites from localStorage:', error)
    }
    setIsHydrated(true)
  }, [])

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites))
      } catch (error) {
        console.error('Error saving favorites to localStorage:', error)
      }
    }
  }, [favorites, isHydrated])

  const addFavorite = (property: FavoriteProperty) => {
    setFavorites((prev) => {
      // Prevent duplicates
      if (prev.some(fav => fav._id === property._id)) {
        return prev
      }
      return [...prev, property]
    })
  }

  const removeFavorite = (propertyId: string) => {
    setFavorites((prev) => prev.filter(fav => fav._id !== propertyId))
  }

  const isFavorite = (propertyId: string) => {
    return favorites.some(fav => fav._id === propertyId)
  }

  const clearFavorites = () => {
    setFavorites([])
  }

  const favoritesCount = favorites.length

  return (
    <FavoritesContext.Provider value={{
      favorites,
      addFavorite,
      removeFavorite,
      isFavorite,
      clearFavorites,
      favoritesCount
    }}>
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
