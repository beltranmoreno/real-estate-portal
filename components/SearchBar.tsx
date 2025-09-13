'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { type DateRange } from 'react-day-picker'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Switch } from '@/components/ui/switch'
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
  ChevronUp,
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
  allowCompact?: boolean
  forceCompact?: boolean
}

export default function SearchBar({
  className,
  variant = 'default',
  locale = 'en',
  defaultValues = {},
  onSearch,
  allowCompact = false,
  forceCompact = false
}: SearchBarProps) {
  const router = useRouter()
  const [showGuestDropdown, setShowGuestDropdown] = useState(false)
  const [showBedroomDropdown, setShowBedroomDropdown] = useState(false)
  const [isCompactMode, setIsCompactMode] = useState(false) // Always start expanded
  
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
  
  const [exactBedroomMatch, setExactBedroomMatch] = useState(false)

  // Update compact mode based on forceCompact prop
  useEffect(() => {
    if (allowCompact) {
      setIsCompactMode(forceCompact)
    }
  }, [forceCompact, allowCompact])


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
      checkOut: dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : '',
      exactBedrooms: exactBedroomMatch
    }
    
    // Collapse search bar on mobile after search
    if (allowCompact) {
      setIsCompactMode(true)
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

  // Generate compact display text
  const getCompactDisplayText = () => {
    const parts = []
    
    if (dateRange?.from && dateRange?.to) {
      parts.push(`${format(dateRange.from, "MMM d")} - ${format(dateRange.to, "MMM d")}`)
    }
    
    if (searchParams.bedrooms > 0) {
      const bedroomText = `${searchParams.bedrooms}${exactBedroomMatch ? '' : '+'} ${
        searchParams.bedrooms === 1 
          ? (locale === 'es' ? 'hab' : 'bed')
          : (locale === 'es' ? 'habs' : 'beds')
      }`
      parts.push(bedroomText)
    }
    
    if (searchParams.guests > 0) {
      const guestText = `${searchParams.guests} ${
        searchParams.guests === 1 
          ? (locale === 'es' ? 'huésped' : 'guest')
          : (locale === 'es' ? 'huéspedes' : 'guests')
      }`
      parts.push(guestText)
    }
    
    return parts.length > 0 ? parts.join(' • ') : (locale === 'es' ? 'Buscar propiedades' : 'Search properties')
  }

  return (
    <div className={cn(
      "w-full overflow-visible",
      isHero ? "max-w-5xl mx-auto" : "max-w-full",
      className
    )}>
      <AnimatePresence mode="wait">
        {allowCompact && isCompactMode ? (
          <motion.div
            key="compact"
            initial={{ height: 'auto', opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ 
              duration: 0.4,
              ease: [0.25, 0.46, 0.45, 0.94] // easeOutQuart
            }}
            className=""
          >
            <motion.button
              onClick={() => setIsCompactMode(false)}
              className="w-full flex items-center justify-between p-3 bg-white/80 backdrop-blur-md shadow-lg border border-slate-200 rounded-lg text-left hover:bg-white/90"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Search className="w-4 h-4 text-slate-500 shrink-0" />
                <span className="text-sm font-medium text-slate-700 truncate">
                  {getCompactDisplayText()}
                </span>
              </div>
              <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="expanded"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 'auto', opacity: 0 }}
            transition={{ 
              duration: 0.4,
              ease: [0.25, 0.46, 0.45, 0.94] // easeOutQuart
            }}
            className=""
          >
            <motion.div 
              className={cn(
                "flex flex-col lg:flex-row gap-3 rounded-2xl",
                isHero 
                  ? "bg-white/40 backdrop-blur-md border border-stone-200/50 p-6 shadow-lg hover:bg-white/90 hover:shadow-xl" 
                  : "bg-white/80 backdrop-blur-md shadow-lg border border-slate-200 p-4"
              )}
              initial={{ y: -10 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
        {/* Date Range Picker */}
        <div className="flex-1 min-w-0 lg:min-w-[280px]">
          <label className={cn(
            "flex items-center gap-2 text-xs font-medium mb-1.5",
            isHero ? "text-stone-600" : "text-slate-600"
          )}>
            <CalendarIcon className="w-3.5 h-3.5" />
            {locale === 'es' ? 'Fechas' : 'Dates'}
          </label>
          <Popover modal={false}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start text-base text-left font-medium p-1 h-auto hover:bg-stone-100/50",
                  isHero && "text-stone-800 hover:text-stone-900",
                  !dateRange && (isHero ? "text-stone-500" : "text-muted-foreground")
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
                  <span className="text-xs">{locale === 'es' ? 'Seleccionar fechas' : 'Select dates'}</span>
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
          isHero ? "bg-stone-300/50" : "bg-slate-200"
        )} />

        {/* Bedrooms */}
        <div className="flex-1 min-w-0">
          <label className={cn(
            "flex items-center gap-2 text-xs font-medium mb-1.5",
            isHero ? "text-stone-600" : "text-slate-600"
          )}>
            <Bed className="w-3.5 h-3.5" />
            {locale === 'es' ? 'Habitaciones' : 'Bedrooms'}
          </label>
          <Popover open={showBedroomDropdown} onOpenChange={setShowBedroomDropdown} modal={false}>
            <PopoverTrigger asChild>
              <button 
                type="button"
                className={cn(
                  "flex items-center justify-between w-full text-left rounded-md p-1 transition-colors",
                  isHero 
                    ? "text-stone-800 hover:bg-stone-100/50" 
                    : "hover:bg-slate-50"
                )}
              >
                <span className="text-base font-medium">
                  {searchParams.bedrooms === 0 
                    ? (locale === 'es' ? 'Cualquiera' : 'Any')
                    : `${searchParams.bedrooms}${exactBedroomMatch ? '' : '+'} ${searchParams.bedrooms === 1 
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
                    className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:border-slate-500 transition-colors"
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
                    className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:border-slate-500 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {/* Exact match toggle */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-200">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-slate-700">
                    {locale === 'es' ? 'Coincidencia exacta' : 'Exact match'}
                  </span>
                  <span className="text-xs text-slate-500">
                    {locale === 'es' 
                      ? 'Buscar exactamente el número seleccionado' 
                      : 'Search for exactly the selected number'
                    }
                  </span>
                </div>
                <Switch
                  checked={exactBedroomMatch}
                  onCheckedChange={setExactBedroomMatch}
                />
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
                        ? "border-slate-500 bg-slate-50 text-slate-700"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    )}
                  >
                    {count === 0 ? (locale === 'es' ? 'Cualq.' : 'Any') : `${count}${exactBedroomMatch ? '' : '+'}`}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className={cn(
          "hidden lg:block w-px",
          isHero ? "bg-stone-300/50" : "bg-slate-200"
        )} />

        {/* Guests */}
        <div className="flex-1 min-w-0">
          <label className={cn(
            "flex items-center gap-2 text-xs font-medium mb-1.5",
            isHero ? "text-stone-600" : "text-slate-600"
          )}>
            <Users className="w-3.5 h-3.5" />
            {locale === 'es' ? 'Huéspedes' : 'Guests'}
          </label>
          <Popover open={showGuestDropdown} onOpenChange={setShowGuestDropdown} modal={false}>
            <PopoverTrigger asChild>
              <button 
                type="button"
                className={cn(
                  "flex items-center justify-between w-full text-left rounded-md p-1 transition-colors",
                  isHero 
                    ? "text-stone-800 hover:bg-stone-100/50" 
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
                    className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:border-slate-500 transition-colors"
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
                    className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:border-slate-500 transition-colors"
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
                        ? "border-slate-500 bg-slate-50 text-slate-700"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    )}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Search Button and Collapse */}
        <div className="flex items-end gap-2">
          <Button 
            onClick={handleSearch}
            size={isHero ? "lg" : "default"}
            className={cn(
              "px-6 transition-all duration-300",
              isHero 
                ? "h-12 rounded-xl bg-slate-800 text-white hover:bg-slate-700 hover:shadow-lg font-light tracking-wide" 
                : "bg-slate-700 hover:bg-slate-600"
            )}
          >
            <Search className="w-4 h-4 mr-2" />
            {locale === 'es' ? 'Buscar' : 'Search'}
          </Button>
          
          {/* Collapse button for mobile compact mode */}
          {allowCompact && !isHero && (
            <Button
              variant="outline"
              size="default"
              onClick={() => setIsCompactMode(true)}
              className="md:hidden p-2"
              aria-label={locale === 'es' ? 'Colapsar búsqueda' : 'Collapse search'}
            >
              <ChevronDown className="w-4 h-4" />
            </Button>
          )}
        </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Filters for Hero variant */}
      {isHero && (
        <div className="flex flex-wrap gap-3 mt-6 justify-center relative">
          {['beachfront', 'golf', 'family', 'luxury', 'events'].map((theme) => (
            <button
              key={theme}
              onClick={() => handleQuickFilter(theme)}
              className="px-5 py-2.5 rounded-full bg-white/60 backdrop-blur-md border border-stone-300/50 text-sm font-light text-stone-700 hover:bg-slate-100/80 hover:border-slate-800/50 hover:text-slate-700 transition-all duration-300"
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