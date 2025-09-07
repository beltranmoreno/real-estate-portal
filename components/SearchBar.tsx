'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Calendar,
  MapPin,
  Users,
  Search,
  ChevronDown
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SearchBarProps {
  className?: string
  variant?: 'default' | 'hero'
  locale?: 'es' | 'en'
  defaultValues?: {
    checkIn?: string
    checkOut?: string
    area?: string
    guests?: number | string
  }
  onSearch?: (params: any) => void
}

export default function SearchBar({
  className,
  variant = 'default',
  locale = 'en',
  defaultValues = {},
  onSearch
}: SearchBarProps) {
  const router = useRouter()
  const [searchParams, setSearchParams] = useState({
    checkIn: defaultValues.checkIn || '',
    checkOut: defaultValues.checkOut || '',
    area: defaultValues.area || '',
    guests: typeof defaultValues.guests === 'string' 
      ? (parseInt(defaultValues.guests) || 2) 
      : (defaultValues.guests || 2)
  })

  const handleSearch = () => {
    if (onSearch) {
      onSearch(searchParams)
    } else {
      const params = new URLSearchParams()
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value) params.set(key, value.toString())
      })
      router.push(`/search?${params.toString()}`)
    }
  }

  const isHero = variant === 'hero'

  return (
    <div className={cn(
      "w-full",
      isHero ? "max-w-5xl mx-auto" : "max-w-full",
      className
    )}>
      <div className={cn(
        "flex flex-col lg:flex-row gap-3 p-4 rounded-2xl",
        isHero 
          ? "bg-white/95 backdrop-blur-md shadow-2xl border border-white/50" 
          : "bg-white shadow-lg border border-slate-200"
      )}>
        {/* Check-in Date */}
        <div className="flex-1 min-w-0">
          <label className="flex items-center gap-2 text-xs font-medium text-slate-600 mb-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {locale === 'es' ? 'Entrada' : 'Check-in'}
          </label>
          <Input
            type="date"
            value={searchParams.checkIn}
            onChange={(e) => setSearchParams({ ...searchParams, checkIn: e.target.value })}
            className="border-0 shadow-none p-0 h-auto text-base font-medium focus-visible:ring-0"
            placeholder={locale === 'es' ? 'Agregar fecha' : 'Add date'}
          />
        </div>

        <div className="hidden lg:block w-px bg-slate-200" />

        {/* Check-out Date */}
        <div className="flex-1 min-w-0">
          <label className="flex items-center gap-2 text-xs font-medium text-slate-600 mb-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {locale === 'es' ? 'Salida' : 'Check-out'}
          </label>
          <Input
            type="date"
            value={searchParams.checkOut}
            onChange={(e) => setSearchParams({ ...searchParams, checkOut: e.target.value })}
            className="border-0 shadow-none p-0 h-auto text-base font-medium focus-visible:ring-0"
            placeholder={locale === 'es' ? 'Agregar fecha' : 'Add date'}
            min={searchParams.checkIn}
          />
        </div>

        <div className="hidden lg:block w-px bg-slate-200" />

        {/* Location */}
        <div className="flex-1 min-w-0">
          <label className="flex items-center gap-2 text-xs font-medium text-slate-600 mb-1.5">
            <MapPin className="w-3.5 h-3.5" />
            {locale === 'es' ? 'Ubicación' : 'Location'}
          </label>
          <div className="relative">
            <Input
              type="text"
              value={searchParams.area}
              onChange={(e) => setSearchParams({ ...searchParams, area: e.target.value })}
              className="border-0 shadow-none p-0 h-auto text-base font-medium focus-visible:ring-0"
              placeholder={locale === 'es' ? 'Cualquier lugar' : 'Anywhere'}
            />
          </div>
        </div>

        <div className="hidden lg:block w-px bg-slate-200" />

        {/* Guests */}
        <div className="flex-1 min-w-0">
          <label className="flex items-center gap-2 text-xs font-medium text-slate-600 mb-1.5">
            <Users className="w-3.5 h-3.5" />
            {locale === 'es' ? 'Huéspedes' : 'Guests'}
          </label>
          <button className="flex items-center justify-between w-full text-left">
            <span className="text-base font-medium">
              {searchParams.guests} {locale === 'es' ? 'huéspedes' : 'guests'}
            </span>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Search Button */}
        <div className="flex items-end">
          <Button 
            onClick={handleSearch}
            size={isHero ? "lg" : "default"}
            className={cn(
              "px-6",
              isHero && "h-12 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            )}
          >
            <Search className="w-4 h-4 mr-2" />
            {locale === 'es' ? 'Buscar' : 'Search'}
          </Button>
        </div>
      </div>

      {/* Quick Filters for Hero variant */}
      {isHero && (
        <div className="flex flex-wrap gap-2 mt-4 justify-center">
          {['beachfront', 'golf', 'family', 'luxury', 'events'].map((theme) => (
            <button
              key={theme}
              className="px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm text-sm font-medium text-slate-700 hover:bg-white hover:shadow-md transition-all"
            >
              {theme === 'beachfront' && (locale === 'es' ? '🏖️ Frente al mar' : '🏖️ Beachfront')}
              {theme === 'golf' && (locale === 'es' ? '⛳ Golf' : '⛳ Golf')}
              {theme === 'family' && (locale === 'es' ? '👨‍👩‍👧‍👦 Familiar' : '👨‍👩‍👧‍👦 Family')}
              {theme === 'luxury' && (locale === 'es' ? '✨ Lujo' : '✨ Luxury')}
              {theme === 'events' && (locale === 'es' ? '🎉 Eventos' : '🎉 Events')}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}