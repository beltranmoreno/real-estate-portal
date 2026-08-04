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
  /** Start collapsed on small screens and open on tap (used by the hero). */
  collapseOnMobile?: boolean
}

export default function SearchBar({
  className,
  variant = 'default',
  locale = 'en',
  defaultValues = {},
  onSearch,
  allowCompact = false,
  forceCompact = false,
  collapseOnMobile = false
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

  // Track mobile viewport so the date picker shows a single month (two months
  // overflow the screen on phones) and the search button can go full-width.
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Decide the initial collapsed/expanded state. `collapseOnMobile` (hero)
  // starts collapsed on small viewports and expanded on desktop; otherwise
  // follow `forceCompact` (the search page's scroll-driven collapse).
  useEffect(() => {
    if (!allowCompact) return
    if (collapseOnMobile) {
      const mobile = typeof window !== 'undefined' && window.innerWidth < 1024
      setIsCompactMode(mobile)
    } else {
      setIsCompactMode(forceCompact)
    }
  }, [forceCompact, allowCompact, collapseOnMobile])


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

  // Generate compact display text. Only summarise once the guest has actually
  // engaged (picked dates); otherwise show an inviting prompt rather than the
  // default "2 guests", which looks like a search is already configured.
  const getCompactDisplayText = () => {
    const hasDates = !!dateRange?.from
    if (!hasDates) {
      return locale === 'es' ? '¿A dónde te gustaría ir?' : 'Where would you like to stay?'
    }

    const parts: string[] = []
    parts.push(
      dateRange?.to
        ? `${format(dateRange.from!, 'MMM d')} - ${format(dateRange.to, 'MMM d')}`
        : format(dateRange.from!, 'MMM d')
    )

    if (searchParams.bedrooms > 0) {
      parts.push(`${searchParams.bedrooms}${exactBedroomMatch ? '' : '+'} ${searchParams.bedrooms === 1
        ? (locale === 'es' ? 'hab' : 'bed')
        : (locale === 'es' ? 'habs' : 'beds')}`)
    }

    if (searchParams.guests > 0) {
      parts.push(`${searchParams.guests} ${searchParams.guests === 1
        ? (locale === 'es' ? 'huésped' : 'guest')
        : (locale === 'es' ? 'huéspedes' : 'guests')}`)
    }

    return parts.join(' • ')
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
              className="w-full flex items-center justify-between p-3 bg-surface/90 backdrop-blur-md shadow-[var(--shadow-float)] border border-line rounded-none text-left hover:bg-surface"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Search className="w-4 h-4 text-muted-2 shrink-0" />
                <span className={cn(
                  "text-sm truncate",
                  dateRange?.from ? "font-medium text-body-strong" : "font-light text-muted-2"
                )}>
                  {getCompactDisplayText()}
                </span>
              </div>
              <ChevronUp className="w-4 h-4 text-faint shrink-0" />
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
                "group flex flex-col lg:flex-row",
                isHero
                  ? "bg-surface/95 backdrop-blur-md shadow-[var(--shadow-over-photo)] rounded-none p-2 lg:p-0 gap-3 lg:gap-0"
                  : "bg-surface/90 backdrop-blur-md shadow-[var(--shadow-float)] border border-line rounded-none p-2 gap-3"
              )}
              initial={{ y: -10 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              {/* Date Range Picker */}
              <div className={cn("flex-1 min-w-0 lg:min-w-[280px]", isHero && "lg:px-6 lg:py-4")}>
                <label className={cn(
                  "flex items-center gap-2 mb-1.5",
                  isHero
                    ? "text-[10px] uppercase tracking-[0.2em] text-eyebrow"
                    : "text-xs font-medium text-muted"
                )}>
                  <CalendarIcon className="w-3.5 h-3.5" />
                  {locale === 'es' ? 'Fechas' : 'Dates'}
                </label>
                <Popover modal={false}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start text-[15px] text-left font-light p-1 h-auto normal-case tracking-normal hover:bg-transparent",
                        isHero ? "text-ink" : "text-body-strong",
                        !dateRange && "text-faint"
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
                        <span className="text-base">{locale === 'es' ? 'Seleccionar fechas' : 'Select dates'}</span>
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
                      numberOfMonths={isMobile ? 1 : 2}
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      className="rounded-md border"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="hidden lg:block w-px bg-line" />

              {/* Bedrooms */}
              <div className={cn("flex-1 min-w-0", isHero && "lg:px-6 lg:py-4")}>
                <label className={cn(
                  "flex items-center gap-2 mb-1.5",
                  isHero
                    ? "text-[10px] uppercase tracking-[0.2em] text-eyebrow"
                    : "text-xs font-medium text-muted"
                )}>
                  <Bed className="w-3.5 h-3.5" />
                  {locale === 'es' ? 'Habitaciones' : 'Bedrooms'}
                </label>
                <Popover open={showBedroomDropdown} onOpenChange={setShowBedroomDropdown} modal={false}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className={cn(
                        "flex items-center justify-between w-full text-left rounded-none p-1 transition-colors",
                        isHero ? "text-ink" : "text-body-strong hover:bg-sand/50"
                      )}
                    >
                      <span className="text-[15px] font-light">
                        {searchParams.bedrooms === 0
                          ? (locale === 'es' ? 'Cualquiera' : 'Any')
                          : `${searchParams.bedrooms}${exactBedroomMatch ? '' : '+'} ${searchParams.bedrooms === 1
                            ? (locale === 'es' ? 'habitación' : 'bedroom')
                            : (locale === 'es' ? 'habitaciones' : 'bedrooms')
                          }`
                        }
                      </span>
                      <ChevronDown className={cn(
                        "w-4 h-4 text-faint transition-transform",
                        showBedroomDropdown && "rotate-180"
                      )} />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-4" align="start">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-body-strong">
                        {locale === 'es' ? 'Habitaciones' : 'Bedrooms'}
                      </span>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => updateBedrooms(searchParams.bedrooms - 1)}
                          disabled={searchParams.bedrooms <= 0}
                          className="w-8 h-8 rounded-full border border-control-border flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:border-ink transition-colors"
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
                          className="w-8 h-8 rounded-full border border-control-border flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:border-ink transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Exact match toggle */}
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-line">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-body-strong">
                          {locale === 'es' ? 'Coincidencia exacta' : 'Exact match'}
                        </span>
                        <span className="text-xs text-muted-2">
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
                    <div className="grid grid-cols-4 gap-2 mt-3">
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((count) => (
                        <button
                          key={count}
                          type="button"
                          onClick={() => {
                            updateBedrooms(count)
                            setShowBedroomDropdown(false)
                          }}
                          className={cn(
                            "px-3 py-2 text-sm rounded-md border transition-colors",
                            searchParams.bedrooms === count
                              ? "border-ink bg-sand/50 text-body-strong font-medium"
                              : "border-line hover:border-control-border hover:bg-sand/50"
                          )}
                        >
                          {count === 0 ? (locale === 'es' ? 'Cualq.' : 'Any') : `${count}${exactBedroomMatch ? '' : '+'}`}
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="hidden lg:block w-px bg-line" />

              {/* Guests */}
              <div className={cn("flex-1 min-w-0", isHero && "lg:px-6 lg:py-4")}>
                <label className={cn(
                  "flex items-center gap-2 mb-1.5",
                  isHero
                    ? "text-[10px] uppercase tracking-[0.2em] text-eyebrow"
                    : "text-xs font-medium text-muted"
                )}>
                  <Users className="w-3.5 h-3.5" />
                  {locale === 'es' ? 'Huéspedes' : 'Guests'}
                </label>
                <Popover open={showGuestDropdown} onOpenChange={setShowGuestDropdown} modal={false}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className={cn(
                        "flex items-center justify-between w-full text-left rounded-none p-1 transition-colors",
                        isHero ? "text-ink" : "text-body-strong hover:bg-sand/50"
                      )}
                    >
                      <span className="text-[15px] font-light">
                        {searchParams.guests} {searchParams.guests === 1
                          ? (locale === 'es' ? 'huésped' : 'guest')
                          : (locale === 'es' ? 'huéspedes' : 'guests')
                        }
                      </span>
                      <ChevronDown className={cn(
                        "w-4 h-4 text-faint transition-transform",
                        showGuestDropdown && "rotate-180"
                      )} />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-4" align="start">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-body-strong">
                        {locale === 'es' ? 'Huéspedes' : 'Guests'}
                      </span>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => updateGuests(searchParams.guests - 1)}
                          disabled={searchParams.guests <= 1}
                          className="w-8 h-8 rounded-full border border-control-border flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:border-ink transition-colors"
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
                          className="w-8 h-8 rounded-full border border-control-border flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:border-ink transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Quick select buttons */}
                    <div className="grid grid-cols-4 gap-2 mt-3">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].map((count) => (
                        <button
                          key={count}
                          type="button"
                          onClick={() => {
                            updateGuests(count)
                            setShowGuestDropdown(false)
                          }}
                          className={cn(
                            "px-3 py-2 text-sm rounded-md border transition-colors",
                            searchParams.guests === count
                              ? "border-ink bg-sand/50 text-body-strong font-medium"
                              : "border-line hover:border-control-border hover:bg-sand/50"
                          )}
                        >
                          {count}
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Search Button and Collapse — full width & taller on mobile,
                  reverting to a content-sized button on desktop. */}
              <div className="flex items-stretch gap-2 w-full lg:w-auto">
                <Button
                  onClick={handleSearch}
                  size={isHero ? "lg" : "default"}
                  className={cn(
                    "flex-1 h-14 lg:flex-none",
                    isHero ? "lg:h-full px-10 rounded-none" : "lg:h-10"
                  )}
                >
                  <Search className="w-4 h-4 mr-2" />
                  {locale === 'es' ? 'Buscar' : 'Search'}
                </Button>

                {/* Collapse button for mobile compact mode */}
                {allowCompact && (
                  <Button
                    variant="outline"
                    size="default"
                    onClick={() => setIsCompactMode(true)}
                    className="lg:hidden shrink-0 h-14 w-14 p-0"
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
      {/* {isHero && (
        <div className="flex flex-wrap gap-3 mt-6 justify-center relative">
          {['beachfront', 'golf', 'family', 'luxury', 'events'].map((theme) => (
            <button
              key={theme}
              onClick={() => handleQuickFilter(theme)}
              className="px-5 py-2 rounded-[2px] bg-white/10 backdrop-blur-md border border-white/25 text-xs uppercase tracking-[0.12em] text-white/90 hover:bg-white/20 hover:text-white transition-colors duration-200"
            >
              {theme === 'beachfront' && (locale === 'es' ? 'Frente al mar' : 'Beachfront')}
              {theme === 'golf' && (locale === 'es' ? 'Golf' : 'Golf')}
              {theme === 'family' && (locale === 'es' ? 'Familiar' : 'Family')}
              {theme === 'luxury' && (locale === 'es' ? 'Lujo' : 'Luxury')}
              {theme === 'events' && (locale === 'es' ? 'Eventos' : 'Events')}
            </button>
          ))}
        </div>
      )} */}
    </div>
  )
}