'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { type DateRange } from 'react-day-picker'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { 
  Calendar as CalendarIcon,
  Bed,
  Users,
  Search,
  ChevronDown,
  Plus,
  Minus
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SearchBarProps {
  className?: string
  variant?: 'default' | 'hero'
  locale?: 'es' | 'en'
  defaultValues?: {
    checkIn?: string
    checkOut?: string
    bedrooms?: number | string
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
  const [showGuestDropdown, setShowGuestDropdown] = useState(false)
  const [showBedroomDropdown, setShowBedroomDropdown] = useState(false)
  
  // Convert default date strings to Date objects for the date range
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    if (defaultValues.checkIn && defaultValues.checkOut) {
      return {
        from: new Date(defaultValues.checkIn),
        to: new Date(defaultValues.checkOut)
      }
    }
    return undefined
  })
  
  const [searchParams, setSearchParams] = useState({
    bedrooms: typeof defaultValues.bedrooms === 'string' 
      ? (parseInt(defaultValues.bedrooms) || 0) 
      : (defaultValues.bedrooms || 0),
    guests: typeof defaultValues.guests === 'string' 
      ? (parseInt(defaultValues.guests) || 2) 
      : (defaultValues.guests || 2)
  })


  const updateGuests = (newCount: number) => {
    const guests = Math.max(1, Math.min(16, newCount)) // Min 1, max 16 guests
    setSearchParams({ ...searchParams, guests })
  }

  const updateBedrooms = (newCount: number) => {
    const bedrooms = Math.max(0, Math.min(10, newCount)) // Min 0 (any), max 10 bedrooms
    setSearchParams({ ...searchParams, bedrooms })
  }

  const handleSearch = () => {
    const fullSearchParams = {
      ...searchParams,
      checkIn: dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : '',
      checkOut: dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : ''
    }
    
    if (onSearch) {
      onSearch(fullSearchParams)
    } else {
      const params = new URLSearchParams()
      Object.entries(fullSearchParams).forEach(([key, value]) => {
        if (value) params.set(key, value.toString())
      })
      router.push(`/search?${params.toString()}`)
    }
  }

  const handleQuickFilter = (theme: string) => {
    const params = new URLSearchParams()
    params.set('themes', theme)
    router.push(`/search?${params.toString()}`)
  }

  const isHero = variant === 'hero'

  return (
    <div className={cn(
      "w-full",
      isHero ? "max-w-5xl mx-auto" : "max-w-full",
      className
    )}>
      <div className={cn(
        "flex flex-col lg:flex-row gap-3 rounded-2xl transition-all duration-300",
        isHero 
          ? "bg-white/10 backdrop-blur-xl border border-white/20 p-6 shadow-2xl hover:bg-white/15 hover:border-white/30" 
          : "bg-white shadow-lg border border-slate-200 p-4"
      )}>
        {/* Date Range Picker */}
        <div className="flex-1 min-w-0 lg:min-w-[280px]">
          <label className={cn(
            "flex items-center gap-2 text-xs font-medium mb-1.5",
            isHero ? "text-white/70" : "text-slate-600"
          )}>
            <CalendarIcon className="w-3.5 h-3.5" />
            {locale === 'es' ? 'Fechas' : 'Dates'}
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start text-left font-medium p-0 h-auto hover:bg-transparent",
                  isHero && "text-white hover:text-white/90",
                  !dateRange && (isHero ? "text-white/60" : "text-muted-foreground")
                )}
              >
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "MMM d, yyyy")} -{" "}
                      {format(dateRange.to, "MMM d, yyyy")}
                    </>
                  ) : (
                    format(dateRange.from, "MMM d, yyyy")
                  )
                ) : (
                  <span>{locale === 'es' ? 'Seleccionar fechas' : 'Select dates'}</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent 
              className="w-auto p-0 z-50" 
              align="start"
            >
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                className="rounded-md border"
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className={cn(
          "hidden lg:block w-px",
          isHero ? "bg-white/20" : "bg-slate-200"
        )} />

        {/* Bedrooms */}
        <div className="flex-1 min-w-0">
          <label className={cn(
            "flex items-center gap-2 text-xs font-medium mb-1.5",
            isHero ? "text-white/70" : "text-slate-600"
          )}>
            <Bed className="w-3.5 h-3.5" />
            {locale === 'es' ? 'Habitaciones' : 'Bedrooms'}
          </label>
          <Popover open={showBedroomDropdown} onOpenChange={setShowBedroomDropdown}>
            <PopoverTrigger asChild>
              <button 
                type="button"
                className={cn(
                  "flex items-center justify-between w-full text-left rounded-md p-1 transition-colors",
                  isHero 
                    ? "text-white hover:bg-white/10" 
                    : "hover:bg-slate-50"
                )}
              >
                <span className="text-base font-medium">
                  {searchParams.bedrooms === 0 
                    ? (locale === 'es' ? 'Cualquiera' : 'Any')
                    : `${searchParams.bedrooms} ${searchParams.bedrooms === 1 
                      ? (locale === 'es' ? 'habitación' : 'bedroom')
                      : (locale === 'es' ? 'habitaciones' : 'bedrooms')
                    }`
                  }
                </span>
                <ChevronDown className={cn(
                  "w-4 h-4 text-slate-400 transition-transform",
                  showBedroomDropdown && "rotate-180"
                )} />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4" align="start">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">
                  {locale === 'es' ? 'Habitaciones' : 'Bedrooms'}
                </span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => updateBedrooms(searchParams.bedrooms - 1)}
                    disabled={searchParams.bedrooms <= 0}
                    className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:border-blue-500 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-lg font-medium min-w-[2rem] text-center">
                    {searchParams.bedrooms === 0 ? (locale === 'es' ? 'Cualq.' : 'Any') : searchParams.bedrooms}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateBedrooms(searchParams.bedrooms + 1)}
                    disabled={searchParams.bedrooms >= 10}
                    className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:border-blue-500 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {/* Quick select buttons */}
              <div className="flex gap-2 mt-3 flex-wrap">
                {[0, 1, 2, 3, 4, 5].map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => {
                      updateBedrooms(count)
                      setShowBedroomDropdown(false)
                    }}
                    className={cn(
                      "px-3 py-1.5 text-sm rounded-md border transition-colors",
                      searchParams.bedrooms === count
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-slate-200 hover:border-blue-300 hover:bg-blue-50"
                    )}
                  >
                    {count === 0 ? (locale === 'es' ? 'Cualq.' : 'Any') : count}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className={cn(
          "hidden lg:block w-px",
          isHero ? "bg-white/20" : "bg-slate-200"
        )} />

        {/* Guests */}
        <div className="flex-1 min-w-0">
          <label className={cn(
            "flex items-center gap-2 text-xs font-medium mb-1.5",
            isHero ? "text-white/70" : "text-slate-600"
          )}>
            <Users className="w-3.5 h-3.5" />
            {locale === 'es' ? 'Huéspedes' : 'Guests'}
          </label>
          <Popover open={showGuestDropdown} onOpenChange={setShowGuestDropdown}>
            <PopoverTrigger asChild>
              <button 
                type="button"
                className={cn(
                  "flex items-center justify-between w-full text-left rounded-md p-1 transition-colors",
                  isHero 
                    ? "text-white hover:bg-white/10" 
                    : "hover:bg-slate-50"
                )}
              >
                <span className="text-base font-medium">
                  {searchParams.guests} {searchParams.guests === 1 
                    ? (locale === 'es' ? 'huésped' : 'guest')
                    : (locale === 'es' ? 'huéspedes' : 'guests')
                  }
                </span>
                <ChevronDown className={cn(
                  "w-4 h-4 text-slate-400 transition-transform",
                  showGuestDropdown && "rotate-180"
                )} />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4" align="start">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">
                  {locale === 'es' ? 'Huéspedes' : 'Guests'}
                </span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => updateGuests(searchParams.guests - 1)}
                    disabled={searchParams.guests <= 1}
                    className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:border-blue-500 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-lg font-medium min-w-[2rem] text-center">
                    {searchParams.guests}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateGuests(searchParams.guests + 1)}
                    disabled={searchParams.guests >= 16}
                    className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:border-blue-500 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {/* Quick select buttons */}
              <div className="flex gap-2 mt-3">
                {[1, 2, 4, 6, 8].map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => {
                      updateGuests(count)
                      setShowGuestDropdown(false)
                    }}
                    className={cn(
                      "px-3 py-1.5 text-sm rounded-md border transition-colors",
                      searchParams.guests === count
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-slate-200 hover:border-blue-300 hover:bg-blue-50"
                    )}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Search Button */}
        <div className="flex items-end">
          <Button 
            onClick={handleSearch}
            size={isHero ? "lg" : "default"}
            className={cn(
              "px-6 transition-all duration-300",
              isHero 
                ? "h-12 rounded-xl bg-white text-slate-900 hover:bg-white/90 hover:shadow-lg font-medium" 
                : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            )}
          >
            <Search className="w-4 h-4 mr-2" />
            {locale === 'es' ? 'Buscar' : 'Search'}
          </Button>
        </div>
      </div>

      {/* Quick Filters for Hero variant */}
      {isHero && (
        <div className="flex flex-wrap gap-3 mt-6 justify-center relative">
          {['beachfront', 'golf', 'family', 'luxury', 'events'].map((theme) => (
            <button
              key={theme}
              onClick={() => handleQuickFilter(theme)}
              className="px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-light text-white hover:bg-white/20 hover:border-white/40 transition-all duration-300"
            >
              {theme === 'beachfront' && (locale === 'es' ? 'Frente al mar' : 'Beachfront')}
              {theme === 'golf' && (locale === 'es' ? 'Golf' : 'Golf')}
              {theme === 'family' && (locale === 'es' ? 'Familiar' : 'Family')}
              {theme === 'luxury' && (locale === 'es' ? 'Lujo' : 'Luxury')}
              {theme === 'events' && (locale === 'es' ? 'Eventos' : 'Events')}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}