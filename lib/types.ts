// Property and related types for the real estate portal

export interface Property {
  _id: string
  slug: string
  title_es: string
  title_en: string
  description_es?: string
  description_en?: string
  shortDescription_es?: string
  shortDescription_en?: string
  mainImage?: any
  images?: Array<{
    url: string
    alt?: string
  }>
  gallery?: any[]
  
  // Location
  location?: {
    area?: {
      name_es: string
      name_en: string
      slug: string
      title_es?: string
      title_en?: string
    }
    coordinates?: {
      lat: number
      lng: number
    }
  }
  
  // Basic property info
  amenities?: {
    bedrooms?: number
    bathrooms?: number
    maxGuests?: number
    squareMeters?: number
    hasGolfCart?: boolean
    hasGenerator?: boolean
    hasPool?: boolean
    hasBeachAccess?: boolean
    hasGym?: boolean
    hasAirConditioning?: boolean
    hasHeating?: boolean
    hasCeilingFans?: boolean
    hasFullKitchen?: boolean
    hasDishwasher?: boolean
    hasCoffeeMaker?: boolean
    hasWifi?: boolean
    hasCableTV?: boolean
    hasSmartTV?: boolean
    hasGameRoom?: boolean
    hasBBQ?: boolean
    hasGarden?: boolean
    hasTerrace?: boolean
    hasOutdoorShower?: boolean
    hasParking?: boolean
    parkingSpaces?: number
    hasSecuritySystem?: boolean
    hasGatedCommunity?: boolean
    hasHousekeeping?: boolean
    hasConcierge?: boolean
    hasWasher?: boolean
    hasDryer?: boolean
    isWheelchairAccessible?: boolean
    hasElevator?: boolean
    hasCrib?: boolean
    hasHighChair?: boolean
    hasChildSafety?: boolean
    hasWorkspace?: boolean
    hasHighSpeedInternet?: boolean
    customAmenities?: Array<{
      name_en: string
      name_es: string
      icon?: string
    }>
  }
  
  // Legacy fields for backward compatibility
  bedrooms?: number
  bathrooms?: number
  maxGuests?: number
  hasGolfCart?: boolean
  hasGenerator?: boolean
  hasPool?: boolean
  hasBeachAccess?: boolean
  
  // Pricing
  pricing?: {
    currency?: string
    seasons?: Array<{
      name: string
      nightly_rate: number
      start_date?: string
      end_date?: string
    }>
  }
  nightlyRate?: {
    amount: number
    currency: string
  }
  salePrice?: {
    amount: number
    currency: string
  }
  
  // Themes and categorization
  themes?: Array<{
    name_en: string
    name_es: string
    slug: string
  }>
  
  // Availability
  blockedDates?: Array<{
    from: string
    to: string
    reason?: string
  }>
  minimumNights?: number
  
  // Metadata
  isFeatured?: boolean
  isActive?: boolean
  listingType?: 'rental' | 'sale' | 'both'
  createdAt?: string
  updatedAt?: string
}

export interface Area {
  _id: string
  name_es: string
  name_en: string
  slug: string
  description_es?: string
  description_en?: string
}

export interface Theme {
  _id: string
  name_en: string
  name_es: string
  slug: string
  description_es?: string
  description_en?: string
}

export interface SearchFilters {
  checkIn?: string
  checkOut?: string
  bedrooms?: string | number
  guests?: string | number
  themes?: string[]
  golf?: boolean
  generator?: boolean
  listingType?: 'rental' | 'sale' | 'both'
  sortBy?: 'featured' | 'price-asc' | 'price-desc' | 'bedrooms' | 'newest'
  area?: string
}

export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface SearchResponse {
  properties: Property[]
  pagination: Pagination
  filters?: SearchFilters
}