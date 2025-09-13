'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import PropertyCard from '@/components/PropertyCard'
import SearchBar from '@/components/SearchBarWrapper'
import MapView from '@/components/MapView'
import PropertyDrawer from '@/components/PropertyDrawer'
import { useLocale } from '@/contexts/LocaleContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { 
  X, 
  SlidersHorizontal,
  Loader2,
  Home,
  Grid3x3,
  Map
} from 'lucide-react'
import { Property } from '@/lib/types'

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface SearchPageClientProps {
  initialProperties?: any[]
  initialPagination?: Pagination
}

export default function SearchPageClient({ initialProperties = [], initialPagination }: SearchPageClientProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { locale, t } = useLocale()
  const [properties, setProperties] = useState(initialProperties)
  const [loading, setLoading] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid')
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [isNavbarVisible, setIsNavbarVisible] = useState(true)
  const [shouldCollapseSearch, setShouldCollapseSearch] = useState(false)
  const [filters, setFilters] = useState({
    checkIn: searchParams.get('checkIn') || '',
    checkOut: searchParams.get('checkOut') || '',
    bedrooms: searchParams.get('bedrooms') || '',
    guests: searchParams.get('guests') || '',
    themes: searchParams.get('themes')?.split(',').filter(Boolean) || [],
    golf: searchParams.get('golf') === 'true',
    generator: searchParams.get('generator') === 'true',
    listingType: searchParams.get('listingType') || 'rental',
    sortBy: searchParams.get('sortBy') || 'featured',
    exactBedrooms: searchParams.get('exactBedrooms') === 'true',
    // Extended amenities
    pool: searchParams.get('pool') === 'true',
    beachAccess: searchParams.get('beachAccess') === 'true',
    airConditioning: searchParams.get('airConditioning') === 'true',
    wifi: searchParams.get('wifi') === 'true',
    kitchen: searchParams.get('kitchen') === 'true',
    laundry: searchParams.get('laundry') === 'true',
    parking: searchParams.get('parking') === 'true',
    bbq: searchParams.get('bbq') === 'true',
    terrace: searchParams.get('terrace') === 'true',
    oceanView: searchParams.get('oceanView') === 'true'
  })
  const [showFilters, setShowFilters] = useState(false)
  const [pagination, setPagination] = useState(initialPagination || {
    page: parseInt(searchParams.get('page') || '1'),
    limit: parseInt(searchParams.get('limit') || '12'),
    total: 0,
    totalPages: 0
  })

  // Helper function to update URL with current filters and pagination
  const updateURL = (newFilters = filters, newPagination = pagination) => {
    const params = new URLSearchParams()
    
    // Add filter parameters
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && value !== '') {
        if (Array.isArray(value)) {
          if (value.length > 0) params.set(key, value.join(','))
        } else {
          params.set(key, value.toString())
        }
      }
    })
    
    // Add pagination parameters
    params.set('page', newPagination.page.toString())
    params.set('limit', newPagination.limit.toString())
    
    // Update the URL without triggering a page reload
    router.push(`/search?${params.toString()}`)
  }

  // Track navbar visibility and search bar collapse based on scroll position
  useEffect(() => {
    let lastScrollY = window.scrollY
    let ticking = false

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const currentScrollY = window.scrollY
          const scrollingDown = currentScrollY > lastScrollY
          const scrolledPastNavbar = currentScrollY > 80 // Navbar height threshold
          const scrolledPastSearchBar = currentScrollY > 200 // Search bar collapse threshold
          const scrollDelta = Math.abs(currentScrollY - lastScrollY)

          // Only update if scroll delta is significant to prevent jumpiness
          if (scrollDelta > 5) {
            if (scrollingDown && scrolledPastNavbar) {
              setIsNavbarVisible(false)
            } else if (!scrollingDown) {
              setIsNavbarVisible(true)
            }

            // Collapse search bar with more refined thresholds
            if (scrollingDown && scrolledPastSearchBar) {
              setShouldCollapseSearch(true)
            } else if (!scrollingDown && currentScrollY < 10) {
              setShouldCollapseSearch(false)
            }

            lastScrollY = currentScrollY
          }
          
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Fetch properties when filters or pagination change (but skip initial load)
  useEffect(() => {
    if (isInitialLoad) {
      setIsInitialLoad(false)
      return
    }
    fetchProperties()
  }, [filters, pagination.page])

  const fetchProperties = async () => {
    setLoading(true)
    console.log('Fetching properties with filters:', filters)
    
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== '') {
          if (Array.isArray(value)) {
            if (value.length > 0) params.set(key, value.join(','))
          } else {
            params.set(key, value.toString())
          }
        }
      })
      params.set('page', pagination.page.toString())
      params.set('limit', pagination.limit.toString())

      const url = `/api/search?${params.toString()}`
      console.log('Fetching from URL:', url)
      
      const response = await fetch(url)
      const data = await response.json()
      
      console.log('API Response:', {
        propertiesCount: data.properties?.length || 0,
        pagination: data.pagination,
        firstProperty: data.properties?.[0]
      })
      
      setProperties(data.properties || [])
      setPagination(data.pagination || pagination)
    } catch (error) {
      console.error('Error fetching properties:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (searchParams: any) => {
    // Convert to string to match filter state type
    const updatedParams = {
      ...searchParams,
      guests: searchParams.guests ? searchParams.guests.toString() : '',
      bedrooms: searchParams.bedrooms ? searchParams.bedrooms.toString() : ''
    }
    
    const newFilters = { ...filters, ...updatedParams }
    const newPagination = { ...pagination, page: 1 }
    
    // Update state
    setFilters(newFilters)
    setPagination(newPagination)
    
    // Update URL
    updateURL(newFilters, newPagination)
  }

  const clearFilter = (key: string) => {
    const newFilters = { ...filters, [key]: key === 'themes' ? [] : '' }
    const newPagination = { ...pagination, page: 1 }
    
    setFilters(newFilters)
    setPagination(newPagination)
    updateURL(newFilters, newPagination)
  }

  const toggleTheme = (theme: string) => {
    const newThemes = filters.themes.includes(theme)
      ? filters.themes.filter(t => t !== theme)
      : [...filters.themes, theme]
    
    const newFilters = { ...filters, themes: newThemes }
    const newPagination = { ...pagination, page: 1 }
    
    setFilters(newFilters)
    setPagination(newPagination)
    updateURL(newFilters, newPagination)
  }

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'sortBy' || key === 'listingType') return false
    if (Array.isArray(value)) return value.length > 0
    if (typeof value === 'boolean') return value === true
    return value && value !== ''
  }).length

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Search Bar Section */}
      <div className={cn(
        "sticky z-40 transition-all duration-300",
        isNavbarVisible ? "top-16" : "top-0"
      )}>
        <div className="container mx-auto px-4 py-4">
          <SearchBar 
            onSearch={handleSearch}
            defaultValues={filters}
            locale={locale}
            allowCompact={true}
            forceCompact={shouldCollapseSearch}
          />
        </div>
      </div>
      
      {/* Spacing compensation for compact mode */}
      <div className={cn(
        "md:hidden transition-all duration-300",
        shouldCollapseSearch ? "h-24" : "h-0"
      )} />

      {/* Filters and Results */}
      <div className={cn(
        "container mx-auto px-4 transition-all duration-300",
        shouldCollapseSearch ? "py-6" : "py-8"
      )}>
        <div className="flex gap-8">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:block w-80 shrink-0">
            <div className={cn("sticky space-y-6 transition-all duration-300", isNavbarVisible ? "top-48" : "top-28")}>
              {/* Sort By */}
              <div className="bg-white rounded-lg p-6">
                <h3 className="font-semibold mb-4">
                  {t({ en: 'Sort By', es: 'Ordenar Por' })}
                </h3>
                <select
                  value={filters.sortBy}
                  onChange={(e) => {
                    const newFilters = { ...filters, sortBy: e.target.value }
                    const newPagination = { ...pagination, page: 1 }
                    setFilters(newFilters)
                    setPagination(newPagination)
                    updateURL(newFilters, newPagination)
                  }}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="featured">{t({ en: 'Featured', es: 'Destacados' })}</option>
                  <option value="price-asc">{t({ en: 'Price: Low to High', es: 'Precio: Menor a Mayor' })}</option>
                  <option value="price-desc">{t({ en: 'Price: High to Low', es: 'Precio: Mayor a Menor' })}</option>
                  <option value="bedrooms">{t({ en: 'Bedrooms', es: 'Habitaciones' })}</option>
                  <option value="newest">{t({ en: 'Newest', es: 'Más Recientes' })}</option>
                </select>
              </div>

              {/* Property Type */}
              <div className="bg-white rounded-lg p-6">
                <h3 className="font-semibold mb-4">
                  {t({ en: 'Property Type', es: 'Tipo de Propiedad' })}
                </h3>
                <div className="space-y-2">
                  {['villa', 'apartment', 'condo', 'house'].map(type => (
                    <label key={type} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="rounded"
                        checked={filters.themes.includes(type)}
                        onChange={() => toggleTheme(type)}
                      />
                      <span className="capitalize">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Basic Amenities */}
              <div className="bg-white rounded-lg p-6">
                <h3 className="font-semibold mb-4">
                  {t({ en: 'Basic Amenities', es: 'Amenidades Básicas' })}
                </h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="rounded"
                      checked={filters.golf}
                      onChange={(e) => {
                        const newFilters = { ...filters, golf: e.target.checked }
                        const newPagination = { ...pagination, page: 1 }
                        setFilters(newFilters)
                        setPagination(newPagination)
                        updateURL(newFilters, newPagination)
                      }}
                    />
                    <span>{t({ en: 'Golf Cart', es: 'Carrito de Golf' })}</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="rounded"
                      checked={filters.generator}
                      onChange={(e) => {
                        const newFilters = { ...filters, generator: e.target.checked }
                        const newPagination = { ...pagination, page: 1 }
                        setFilters(newFilters)
                        setPagination(newPagination)
                        updateURL(newFilters, newPagination)
                      }}
                    />
                    <span>{t({ en: 'Generator', es: 'Generador' })}</span>
                  </label>
                </div>
              </div>

              {/* Extended Amenities */}
              <div className="bg-white rounded-lg p-6">
                <h3 className="font-semibold mb-4">
                  {t({ en: 'Additional Amenities', es: 'Amenidades Adicionales' })}
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {[
                    { key: 'pool', en: 'Pool', es: 'Piscina' },
                    { key: 'beachAccess', en: 'Beach Access', es: 'Acceso a Playa' },
                    { key: 'airConditioning', en: 'Air Conditioning', es: 'Aire Acondicionado' },
                    { key: 'wifi', en: 'WiFi', es: 'WiFi' },
                    { key: 'kitchen', en: 'Full Kitchen', es: 'Cocina Completa' },
                    { key: 'laundry', en: 'Laundry', es: 'Lavandería' },
                    { key: 'parking', en: 'Parking', es: 'Estacionamiento' },
                    { key: 'bbq', en: 'BBQ/Grill', es: 'Parrilla' },
                    { key: 'terrace', en: 'Terrace/Balcony', es: 'Terraza/Balcón' },
                    { key: 'oceanView', en: 'Ocean View', es: 'Vista al Mar' }
                  ].map(amenity => (
                    <label key={amenity.key} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="rounded"
                        checked={Boolean(filters[amenity.key as keyof typeof filters])}
                        onChange={(e) => {
                          const newFilters = { ...filters, [amenity.key]: e.target.checked }
                          const newPagination = { ...pagination, page: 1 }
                          setFilters(newFilters)
                          setPagination(newPagination)
                          updateURL(newFilters, newPagination)
                        }}
                      />
                      <span className="text-sm">{locale === 'es' ? amenity.es : amenity.en}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Themes */}
              <div className="bg-white rounded-lg p-6">
                <h3 className="font-semibold mb-4">
                  {t({ en: 'Themes', es: 'Temas' })}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {['beachfront', 'golf', 'family', 'luxury', 'events'].map(theme => (
                    <Badge
                      key={theme}
                      variant={filters.themes.includes(theme) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => toggleTheme(theme)}
                    >
                      <span className="ml-1 capitalize">{theme}</span>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-light text-slate-900">
                  {t({ en: 'All Properties', es: 'Todas las Propiedades' })}
                </h1>
                <p className="text-slate-600 mt-1">
                  {pagination.total} {t({ en: 'properties found', es: 'propiedades encontradas' })}
                </p>
              </div>

              <div className="flex items-center gap-4 justify-between sm:justify-end">
                {/* View Mode Toggle */}
                <div className="hidden md:flex bg-stone-100/80 rounded-lg p-1 border border-stone-200/50">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-3 py-1.5 text-sm font-light rounded-md transition-all duration-200 flex items-center gap-2 ${
                      viewMode === 'grid'
                        ? 'bg-white text-stone-800 shadow-sm'
                        : 'text-stone-600 hover:text-stone-800'
                    }`}
                  >
                    <Grid3x3 className="w-4 h-4" />
                    {t({ en: 'Grid', es: 'Cuadrícula' })}
                  </button>
                  <button
                    onClick={() => setViewMode('map')}
                    className={`px-3 py-1.5 text-sm font-light rounded-md transition-all duration-200 flex items-center gap-2 ${
                      viewMode === 'map'
                        ? 'bg-white text-stone-800 shadow-sm'
                        : 'text-stone-600 hover:text-stone-800'
                    }`}
                  >
                    <Map className="w-4 h-4" />
                    {t({ en: 'Map', es: 'Mapa' })}
                  </button>
                </div>

                {/* Listing Type Toggle */}
                <div className="flex bg-slate-100 rounded-lg p-1">
                  <button
                    onClick={() => {
                      const newFilters = { ...filters, listingType: 'rental' }
                      const newPagination = { ...pagination, page: 1 }
                      setFilters(newFilters)
                      setPagination(newPagination)
                      updateURL(newFilters, newPagination)
                    }}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      filters.listingType === 'rental'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {t({ en: 'For Rent', es: 'En Alquiler' })}
                  </button>
                  <button
                    onClick={() => {
                      const newFilters = { ...filters, listingType: 'sale' }
                      const newPagination = { ...pagination, page: 1 }
                      setFilters(newFilters)
                      setPagination(newPagination)
                      updateURL(newFilters, newPagination)
                    }}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      filters.listingType === 'sale'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {t({ en: 'For Sale', es: 'En Venta' })}
                  </button>
                  <button
                    onClick={() => {
                      const newFilters = { ...filters, listingType: 'both' }
                      const newPagination = { ...pagination, page: 1 }
                      setFilters(newFilters)
                      setPagination(newPagination)
                      updateURL(newFilters, newPagination)
                    }}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      filters.listingType === 'both'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {t({ en: 'Both', es: 'Ambos' })}
                  </button>
                </div>

                {/* Mobile Filter Button */}
                <Button
                  variant="outline"
                  className="lg:hidden"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  {t({ en: 'Filters', es: 'Filtros' })}
                  {activeFiltersCount > 0 && (
                    <Badge variant="default" className="ml-2">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </div>
            </div>

            {/* Active Filters */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {filters.checkIn && (
                  <Badge variant="secondary" className="pl-3 pr-1 py-1">
                    Check-in: {filters.checkIn}
                    <button
                      onClick={() => clearFilter('checkIn')}
                      className="ml-2 p-1 hover:bg-slate-300 rounded"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                {filters.checkOut && (
                  <Badge variant="secondary" className="pl-3 pr-1 py-1">
                    Check-out: {filters.checkOut}
                    <button
                      onClick={() => clearFilter('checkOut')}
                      className="ml-2 p-1 hover:bg-slate-300 rounded"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                {filters.guests && filters.guests !== '' && (
                  <Badge variant="secondary" className="pl-3 pr-1 py-1">
                    {filters.guests} {parseInt(filters.guests) === 1 
                      ? t({ en: 'guest', es: 'huésped' })
                      : t({ en: 'guests', es: 'huéspedes' })
                    }
                    <button
                      onClick={() => clearFilter('guests')}
                      className="ml-2 p-1 hover:bg-slate-300 rounded"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                {filters.bedrooms && filters.bedrooms !== '' && filters.bedrooms !== '0' && (
                  <Badge variant="secondary" className="pl-3 pr-1 py-1">
                    {filters.bedrooms} {parseInt(filters.bedrooms) === 1 
                      ? t({ en: 'bedroom', es: 'habitación' })
                      : t({ en: 'bedrooms', es: 'habitaciones' })
                    }
                    <button
                      onClick={() => clearFilter('bedrooms')}
                      className="ml-2 p-1 hover:bg-slate-300 rounded"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                {filters.themes.map(theme => (
                  <Badge key={theme} variant="secondary" className="pl-3 pr-1 py-1">
                    {theme}
                    <button
                      onClick={() => toggleTheme(theme)}
                      className="ml-2 p-1 hover:bg-slate-300 rounded"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            {/* Content Area */}
            {viewMode === 'map' ? (
              <div className="relative h-[70vh] rounded-xl overflow-hidden border border-stone-200/50 shadow-lg">
                <MapView
                  properties={properties}
                  selectedProperty={selectedProperty}
                  onPropertySelect={setSelectedProperty}
                  className="w-full h-full"
                />
                <PropertyDrawer
                  property={selectedProperty}
                  isOpen={!!selectedProperty}
                  onClose={() => setSelectedProperty(null)}
                />
              </div>
            ) : (
              /* Properties Grid */
              loading ? (
              <>
                {/* Skeleton Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                  {Array.from({ length: 12 }).map((_, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse">
                      {/* Skeleton Image */}
                      <div className="aspect-[4/3] bg-slate-200" />
                      
                      {/* Skeleton Content */}
                      <div className="p-5 space-y-3">
                        {/* Location */}
                        <div className="flex items-center gap-1">
                          <div className="w-4 h-4 bg-slate-200 rounded" />
                          <div className="h-4 bg-slate-200 rounded w-24" />
                        </div>
                        
                        {/* Title */}
                        <div className="space-y-2">
                          <div className="h-6 bg-slate-200 rounded w-full" />
                          <div className="h-6 bg-slate-200 rounded w-3/4" />
                        </div>
                        
                        {/* Stats */}
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <div className="w-4 h-4 bg-slate-200 rounded" />
                            <div className="h-4 bg-slate-200 rounded w-4" />
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-4 h-4 bg-slate-200 rounded" />
                            <div className="h-4 bg-slate-200 rounded w-4" />
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-4 h-4 bg-slate-200 rounded" />
                            <div className="h-4 bg-slate-200 rounded w-4" />
                          </div>
                        </div>
                        
                        {/* Price */}
                        <div className="pt-3 border-t">
                          <div className="h-6 bg-slate-200 rounded w-32" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Loading indicator */}
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">
                      {t({ en: 'Loading properties...', es: 'Cargando propiedades...' })}
                    </p>
                  </div>
                </div>
              </>
              ) : properties.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {properties.map((property) => (
                    <PropertyCard
                      key={property._id}
                      property={property}
                      locale={locale}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-8">
                    <Button
                      variant="outline"
                      disabled={pagination.page === 1}
                      onClick={() => {
                        const newPagination = { ...pagination, page: pagination.page - 1 }
                        setPagination(newPagination)
                        updateURL(filters, newPagination)
                      }}
                    >
                      {t({ en: 'Previous', es: 'Anterior' })}
                    </Button>
                    <span className="flex items-center px-4">
                      {t({ en: 'Page', es: 'Página' })} {pagination.page} {t({ en: 'of', es: 'de' })} {pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      disabled={pagination.page === pagination.totalPages}
                      onClick={() => {
                        const newPagination = { ...pagination, page: pagination.page + 1 }
                        setPagination(newPagination)
                        updateURL(filters, newPagination)
                      }}
                    >
                      {t({ en: 'Next', es: 'Siguiente' })}
                    </Button>
                  </div>
                )}
              </>
              ) : (
              <div className="text-center py-20">
                <Home className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                <h2 className="text-xl font-semibold text-slate-900 mb-2">
                  {t({ en: 'No properties found', es: 'No se encontraron propiedades' })}
                </h2>
                <p className="text-slate-600">
                  {t({ 
                    en: 'Try adjusting your filters or search criteria', 
                    es: 'Intenta ajustar tus filtros o criterios de búsqueda' 
                  })}
                </p>
              </div>
              )
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filters Modal */}
      {showFilters && (
        <div className="fixed inset-0 bg-black/50 z-50 lg:hidden">
          <div className="absolute right-0 top-0 h-full w-80 bg-white p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">{t({ en: 'Filters', es: 'Filtros' })}</h2>
              <button onClick={() => setShowFilters(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Sort By */}
              <div className="bg-slate-50 rounded-lg p-4">
                <h3 className="font-semibold mb-4">
                  {t({ en: 'Sort By', es: 'Ordenar Por' })}
                </h3>
                <select
                  value={filters.sortBy}
                  onChange={(e) => {
                    const newFilters = { ...filters, sortBy: e.target.value }
                    const newPagination = { ...pagination, page: 1 }
                    setFilters(newFilters)
                    setPagination(newPagination)
                    updateURL(newFilters, newPagination)
                  }}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="featured">{t({ en: 'Featured', es: 'Destacados' })}</option>
                  <option value="price-asc">{t({ en: 'Price: Low to High', es: 'Precio: Menor a Mayor' })}</option>
                  <option value="price-desc">{t({ en: 'Price: High to Low', es: 'Precio: Mayor a Menor' })}</option>
                  <option value="bedrooms">{t({ en: 'Bedrooms', es: 'Habitaciones' })}</option>
                  <option value="newest">{t({ en: 'Newest', es: 'Más Recientes' })}</option>
                </select>
              </div>

              {/* Property Type */}
              <div className="bg-slate-50 rounded-lg p-4">
                <h3 className="font-semibold mb-4">
                  {t({ en: 'Property Type', es: 'Tipo de Propiedad' })}
                </h3>
                <div className="space-y-2">
                  {['villa', 'apartment', 'condo', 'house'].map(type => (
                    <label key={type} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="rounded"
                        checked={filters.themes.includes(type)}
                        onChange={() => toggleTheme(type)}
                      />
                      <span className="capitalize">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Basic Amenities */}
              <div className="bg-slate-50 rounded-lg p-4">
                <h3 className="font-semibold mb-4">
                  {t({ en: 'Basic Amenities', es: 'Amenidades Básicas' })}
                </h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="rounded"
                      checked={filters.golf}
                      onChange={(e) => {
                        const newFilters = { ...filters, golf: e.target.checked }
                        const newPagination = { ...pagination, page: 1 }
                        setFilters(newFilters)
                        setPagination(newPagination)
                        updateURL(newFilters, newPagination)
                      }}
                    />
                    <span>{t({ en: 'Golf Cart', es: 'Carrito de Golf' })}</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="rounded"
                      checked={filters.generator}
                      onChange={(e) => {
                        const newFilters = { ...filters, generator: e.target.checked }
                        const newPagination = { ...pagination, page: 1 }
                        setFilters(newFilters)
                        setPagination(newPagination)
                        updateURL(newFilters, newPagination)
                      }}
                    />
                    <span>{t({ en: 'Generator', es: 'Generador' })}</span>
                  </label>
                </div>
              </div>

              {/* Extended Amenities */}
              <div className="bg-slate-50 rounded-lg p-4">
                <h3 className="font-semibold mb-4">
                  {t({ en: 'Additional Amenities', es: 'Amenidades Adicionales' })}
                </h3>
                <div className="space-y-2">
                  {[
                    { key: 'pool', en: 'Pool', es: 'Piscina' },
                    { key: 'beachAccess', en: 'Beach Access', es: 'Acceso a Playa' },
                    { key: 'airConditioning', en: 'Air Conditioning', es: 'Aire Acondicionado' },
                    { key: 'wifi', en: 'WiFi', es: 'WiFi' },
                    { key: 'kitchen', en: 'Full Kitchen', es: 'Cocina Completa' },
                    { key: 'laundry', en: 'Laundry', es: 'Lavandería' },
                    { key: 'parking', en: 'Parking', es: 'Estacionamiento' },
                    { key: 'bbq', en: 'BBQ/Grill', es: 'Parrilla' },
                    { key: 'terrace', en: 'Terrace/Balcony', es: 'Terraza/Balcón' },
                    { key: 'oceanView', en: 'Ocean View', es: 'Vista al Mar' }
                  ].map(amenity => (
                    <label key={amenity.key} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="rounded"
                        checked={Boolean(filters[amenity.key as keyof typeof filters])}
                        onChange={(e) => {
                          const newFilters = { ...filters, [amenity.key]: e.target.checked }
                          const newPagination = { ...pagination, page: 1 }
                          setFilters(newFilters)
                          setPagination(newPagination)
                          updateURL(newFilters, newPagination)
                        }}
                      />
                      <span>{locale === 'es' ? amenity.es : amenity.en}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Themes */}
              <div className="bg-slate-50 rounded-lg p-4">
                <h3 className="font-semibold mb-4">
                  {t({ en: 'Themes', es: 'Temas' })}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {['beachfront', 'golf', 'family', 'luxury', 'events'].map(theme => (
                    <Badge
                      key={theme}
                      variant={filters.themes.includes(theme) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => toggleTheme(theme)}
                    >
                      {theme === 'beachfront' && '🏖️'}
                      {theme === 'golf' && '⛳'}
                      {theme === 'family' && '👨‍👩‍👧‍👦'}
                      {theme === 'luxury' && '✨'}
                      {theme === 'events' && '🎉'}
                      <span className="ml-1 capitalize">{theme}</span>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Apply Filters Button */}
              <div className="pt-4 border-t">
                <Button 
                  onClick={() => setShowFilters(false)}
                  className="w-full"
                >
                  {t({ en: 'Apply Filters', es: 'Aplicar Filtros' })}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}