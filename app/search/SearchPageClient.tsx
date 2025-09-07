'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import PropertyCard from '@/components/PropertyCard'
import SearchBar from '@/components/SearchBar'
import { useLocale } from '@/contexts/LocaleContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  X, 
  SlidersHorizontal,
  Loader2,
  Home
} from 'lucide-react'

interface SearchPageClientProps {
  initialProperties?: any[]
}

export default function SearchPageClient({ initialProperties = [] }: SearchPageClientProps) {
  const searchParams = useSearchParams()
  const { locale, t } = useLocale()
  const [properties, setProperties] = useState(initialProperties)
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    checkIn: searchParams.get('checkIn') || '',
    checkOut: searchParams.get('checkOut') || '',
    area: searchParams.get('area') || '',
    bedroomsMin: searchParams.get('bedroomsMin') || '',
    guests: searchParams.get('guests') || '',
    themes: searchParams.get('themes')?.split(',').filter(Boolean) || [],
    golf: searchParams.get('golf') === 'true',
    generator: searchParams.get('generator') === 'true',
    sortBy: searchParams.get('sortBy') || 'featured'
  })
  const [showFilters, setShowFilters] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  })

  // Fetch properties when filters change
  useEffect(() => {
    fetchProperties()
  }, [filters])

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
    // Convert guests to string to match filter state type
    const updatedParams = {
      ...searchParams,
      guests: searchParams.guests ? searchParams.guests.toString() : ''
    }
    setFilters({ ...filters, ...updatedParams })
  }

  const clearFilter = (key: string) => {
    setFilters({ ...filters, [key]: key === 'themes' ? [] : '' })
  }

  const toggleTheme = (theme: string) => {
    const newThemes = filters.themes.includes(theme)
      ? filters.themes.filter(t => t !== theme)
      : [...filters.themes, theme]
    setFilters({ ...filters, themes: newThemes })
  }

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'sortBy') return false
    if (Array.isArray(value)) return value.length > 0
    return value && value !== ''
  }).length

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Search Bar Section */}
      <div className="bg-white border-b sticky top-16 z-40">
        <div className="container mx-auto px-4 py-4">
          <SearchBar 
            onSearch={handleSearch}
            defaultValues={filters}
            locale={locale}
          />
        </div>
      </div>

      {/* Filters and Results */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:block w-80 shrink-0">
            <div className="sticky top-32 space-y-6">
              {/* Sort By */}
              <div className="bg-white rounded-lg p-6">
                <h3 className="font-semibold mb-4">
                  {t({ en: 'Sort By', es: 'Ordenar Por' })}
                </h3>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
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

              {/* Amenities */}
              <div className="bg-white rounded-lg p-6">
                <h3 className="font-semibold mb-4">
                  {t({ en: 'Amenities', es: 'Amenidades' })}
                </h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="rounded"
                      checked={filters.golf}
                      onChange={(e) => setFilters({ ...filters, golf: e.target.checked })}
                    />
                    <span>{t({ en: 'Golf Cart', es: 'Carrito de Golf' })}</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="rounded"
                      checked={filters.generator}
                      onChange={(e) => setFilters({ ...filters, generator: e.target.checked })}
                    />
                    <span>{t({ en: 'Generator', es: 'Generador' })}</span>
                  </label>
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
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  {t({ en: 'All Properties', es: 'Todas las Propiedades' })}
                </h1>
                <p className="text-slate-600 mt-1">
                  {pagination.total} {t({ en: 'properties found', es: 'propiedades encontradas' })}
                </p>
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

            {/* Properties Grid */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
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
                      onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                    >
                      {t({ en: 'Previous', es: 'Anterior' })}
                    </Button>
                    <span className="flex items-center px-4">
                      {t({ en: 'Page', es: 'Página' })} {pagination.page} {t({ en: 'of', es: 'de' })} {pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      disabled={pagination.page === pagination.totalPages}
                      onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
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
            {/* Copy filter content from desktop sidebar here */}
          </div>
        </div>
      )}
    </div>
  )
}