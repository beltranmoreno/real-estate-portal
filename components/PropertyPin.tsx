'use client'

import React from 'react'
import { Property } from '@/lib/types'
import { useLocale } from '@/contexts/LocaleContext'
import { Home } from 'lucide-react'

interface PropertyPinProps {
  property: Property
  isSelected?: boolean
  onClick: () => void
}

export default function PropertyPin({
  property,
  isSelected = false,
  onClick
}: PropertyPinProps) {
  const { locale } = useLocale()

  const formatPrice = (amount: number, currency: string) => {
    try {
      return new Intl.NumberFormat(locale === 'es' ? 'es-DO' : 'en-US', {
        style: 'currency',
        currency: currency || 'USD',
        minimumFractionDigits: 0
      }).format(amount)
    } catch (error) {
      return `$${amount.toLocaleString()}`
    }
  }

  const getMinPrice = () => {
    if (!property.pricing?.seasons || property.pricing.seasons.length === 0) {
      return null
    }
    
    const prices = property.pricing.seasons.map(season => season.nightly_rate).filter(Boolean)
    return prices.length > 0 ? Math.min(...prices) : null
  }

  const minPrice = getMinPrice()

  return (
    <button
      onClick={onClick}
      className={`group relative transition-all duration-300 transform hover:scale-110 ${
        isSelected ? 'z-30' : 'z-20'
      }`}
    >
      {/* Pin Base */}
      <div
        className={`relative flex items-center justify-center w-10 h-10 rounded-full border-2 shadow-lg transition-all duration-300 ${
          isSelected
            ? 'bg-slate-800 border-white shadow-xl scale-110'
            : 'bg-white border-slate-800 hover:bg-slate-50'
        }`}
      >
        <Home 
          className={`w-5 h-5 transition-colors duration-300 ${
            isSelected ? 'text-white' : 'text-slate-800'
          }`} 
        />
      </div>

      {/* Pin Pointer */}
      <div
        className={`absolute top-8 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-4 border-transparent transition-all duration-300 ${
          isSelected
            ? 'border-t-slate-800'
            : 'border-t-white'
        }`}
      />

      {/* Price Tooltip */}
      {minPrice && (
        <div
          className={`absolute -top-12 left-1/2 transform -translate-x-1/2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shadow-lg border transition-all duration-300 ${
            isSelected
              ? 'bg-slate-800 text-white border-slate-700 opacity-100 translate-y-0'
              : 'bg-white text-slate-800 border-slate-200 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0'
          }`}
        >
          {formatPrice(minPrice, property.pricing?.currency)}
          <span className="text-slate-400 ml-1">
            {locale === 'es' ? '/noche' : '/night'}
          </span>
          
          {/* Tooltip Arrow */}
          <div
            className={`absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-3 border-transparent ${
              isSelected
                ? 'border-t-slate-800'
                : 'border-t-white'
            }`}
          />
        </div>
      )}

      {/* Selection Ring */}
      {isSelected && (
        <div className="absolute inset-0 rounded-full border-3 border-teal-500 animate-pulse" />
      )}
    </button>
  )
}