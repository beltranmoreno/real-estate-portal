import { client } from '@/sanity/lib/client'

export async function getCollection(slug: string, accessCode?: string) {
  try {
    // Fetch collection details
    const query = `*[_type == "collection" && slug.current == $slug && isActive == true][0] {
      _id,
      title_es,
      title_en,
      description_es,
      description_en,
      "slug": slug.current,
      collectionType,
      coverImage,
      welcomeMessage_es,
      welcomeMessage_en,
      dateRange,
      expiresAt,
      isPublic,
      accessCode,
      organizer,
      customization,
      features,
      metadata,
      "properties": properties[]->{
        _id,
        "slug": slug.current,
        title_es,
        title_en,
        shortDescription_es,
        shortDescription_en,
        propertyCode,
        propertyType,
        themes,
        mainImage,
        gallery[0...3],
        "area": location.area->{
          _id,
          title_es,
          title_en,
          "slug": slug.current,
          region
        },
        "address": location.address_es,
        "address_en": location.address_en,
        "bedrooms": amenities.bedrooms,
        "bathrooms": amenities.bathrooms,
        "maxGuests": amenities.maxGuests,
        "hasGolfCart": amenities.hasGolfCart,
        "hasGenerator": amenities.hasGenerator,
        "hasPool": amenities.hasPool,
        "listingType": pricing.type,
        "nightlyRate": pricing.rentalPricing.nightlyRate,
        "minimumNights": pricing.rentalPricing.minimumNights,
        "salePrice": pricing.salePricing.salePrice,
        "priceOnRequest": pricing.rentalPricing.priceOnRequest || pricing.salePricing.priceOnRequest,
        "isAvailable": availability.isAvailable,
        status
      }
    }`

    const collection = await client.fetch(query, { slug })

    if (!collection) {
      return null
    }

    // Check if collection has expired
    if (collection.expiresAt && new Date(collection.expiresAt) < new Date()) {
      return {
        error: {
          error: 'This collection has expired',
          expired: true
        }
      }
    }

    // Check access code if collection is private
    if (!collection.isPublic && collection.accessCode) {
      if (accessCode !== collection.accessCode) {
        return {
          error: {
            error: 'Invalid access code',
            requiresAccessCode: true
          }
        }
      }
    }

    // Filter out inactive properties
    const activeProperties = collection.properties?.filter(
      (property: any) => property.status === 'active'
    ) || []

    return {
      _id: collection._id,
      slug: collection.slug,
      title: {
        es: collection.title_es,
        en: collection.title_en
      },
      description: {
        es: collection.description_es,
        en: collection.description_en
      },
      welcomeMessage: {
        es: collection.welcomeMessage_es,
        en: collection.welcomeMessage_en
      },
      collectionType: collection.collectionType,
      coverImage: collection.coverImage,
      dateRange: collection.dateRange,
      expiresAt: collection.expiresAt,
      organizer: collection.organizer,
      customization: collection.customization,
      features: collection.features,
      metadata: {
        expectedGuests: collection.metadata?.expectedGuests,
        budget: collection.metadata?.budget
      },
      properties: activeProperties,
      totalProperties: activeProperties.length
    }
  } catch (error) {
    console.error('Error fetching collection:', error)
    return null
  }
}

export async function searchProperties(params: {
  limit?: number
  checkIn?: string
  checkOut?: string
  bedrooms?: string
  exactBedrooms?: boolean
  golf?: boolean
  generator?: boolean
  themes?: string[]
  guests?: string
  pool?: boolean
  beachAccess?: boolean
  airConditioning?: boolean
  wifi?: boolean
  kitchen?: boolean
  laundry?: boolean
  parking?: boolean
  bbq?: boolean
  terrace?: boolean
  oceanView?: boolean
  listingType?: string
  page?: number
  sortBy?: string
}) {
  const {
    limit = 12,
    bedrooms,
    exactBedrooms = false,
    golf = false,
    generator = false,
    themes = [],
    guests,
    pool = false,
    beachAccess = false,
    airConditioning = false,
    wifi = false,
    kitchen = false,
    laundry = false,
    parking = false,
    bbq = false,
    terrace = false,
    oceanView = false,
    listingType = 'rental',
    page = 1,
    sortBy = 'featured',
    checkIn,
    checkOut
  } = params

  // Build GROQ query
  let filters = ['_type == "property"', 'status == "active"']

  if (bedrooms && bedrooms !== '0') {
    if (exactBedrooms) {
      filters.push(`amenities.bedrooms == ${bedrooms}`)
    } else {
      filters.push(`amenities.bedrooms >= ${bedrooms}`)
    }
  }

  if (guests) {
    filters.push(`amenities.maxGuests >= ${guests}`)
  }

  if (golf) {
    filters.push('amenities.hasGolfCart == true')
  }

  if (generator) {
    filters.push('amenities.hasGenerator == true')
  }

  // Extended amenities filters
  if (pool) {
    filters.push('amenities.hasPool == true')
  }

  if (beachAccess) {
    filters.push('amenities.hasBeachAccess == true')
  }

  if (airConditioning) {
    filters.push('amenities.hasAirConditioning == true')
  }

  if (wifi) {
    filters.push('amenities.hasWifi == true')
  }

  if (kitchen) {
    filters.push('amenities.hasKitchen == true')
  }

  if (laundry) {
    filters.push('amenities.hasLaundry == true')
  }

  if (parking) {
    filters.push('amenities.hasParking == true')
  }

  if (bbq) {
    filters.push('amenities.hasBBQ == true')
  }

  if (terrace) {
    filters.push('amenities.hasTerrace == true')
  }

  if (oceanView) {
    filters.push('amenities.hasOceanView == true')
  }

  if (themes.length > 0) {
    const themeFilters = themes.map(theme => `"${theme}" in themes`).join(' || ')
    filters.push(`(${themeFilters})`)
  }

  // Listing type filter
  if (listingType && listingType !== 'both') {
    filters.push(`pricing.type == "${listingType}"`)
  }

  // Date availability check (simplified - in production, this would be more complex)
  if (checkIn && checkOut) {
    filters.push(`availability.isAvailable == true`)
    // Additional date range checks would go here
  }

  const filterQuery = filters.join(' && ')

  // Sorting
  let orderBy = ''
  switch (sortBy) {
    case 'price-asc':
      orderBy = '| order(pricing.rentalPricing.nightlyRate.amount asc)'
      break
    case 'price-desc':
      orderBy = '| order(pricing.rentalPricing.nightlyRate.amount desc)'
      break
    case 'bedrooms':
      orderBy = '| order(amenities.bedrooms desc)'
      break
    case 'newest':
      orderBy = '| order(_createdAt desc)'
      break
    case 'featured':
    default:
      orderBy = '| order(isFeatured desc, _createdAt desc)'
      break
  }

  // Calculate pagination
  const start = (page - 1) * limit
  const end = start + limit

  // Main query
  const query = `{
    "properties": *[${filterQuery}] ${orderBy} [${start}...${end}] {
      _id,
      "slug": slug.current,
      title_es,
      title_en,
      shortDescription_es,
      shortDescription_en,
      propertyCode,
      propertyType,
      themes,
      isFeatured,
      mainImage,
      "location": {
        "area": location.area->{
          _id,
          title_es,
          title_en,
          "slug": slug.current,
          region
        },
        "coordinates": location.coordinates,
        "address_es": location.address_es,
        "address_en": location.address_en
      },
      "bedrooms": amenities.bedrooms,
      "bathrooms": amenities.bathrooms,
      "maxGuests": amenities.maxGuests,
      "hasGolfCart": amenities.hasGolfCart,
      "hasGenerator": amenities.hasGenerator,
      "hasPool": amenities.hasPool,
      "hasBeachAccess": amenities.hasBeachAccess,
      "hasAirConditioning": amenities.hasAirConditioning,
      "hasWifi": amenities.hasWifi,
      "hasKitchen": amenities.hasKitchen,
      "hasLaundry": amenities.hasLaundry,
      "hasParking": amenities.hasParking,
      "hasBBQ": amenities.hasBBQ,
      "hasTerrace": amenities.hasTerrace,
      "hasOceanView": amenities.hasOceanView,
      "listingType": pricing.type,
      "nightlyRate": pricing.rentalPricing.nightlyRate,
      "minimumNights": pricing.rentalPricing.minimumNights,
      "salePrice": pricing.salePricing.salePrice,
      "priceOnRequest": pricing.rentalPricing.priceOnRequest || pricing.salePricing.priceOnRequest,
      "isAvailable": availability.isAvailable,
      "instantBooking": availability.instantBooking
    },
    "total": count(*[${filterQuery}]),
    "facets": {
      "areas": *[_type == "area"] {
        _id,
        title_es,
        title_en,
        "slug": slug.current,
        "count": count(*[_type == "property" && location.area._ref == ^._id && status == "active"])
      },
      "propertyTypes": *[_type == "property" && status == "active"] {
        propertyType
      } | {"types": array::unique([].propertyType)},
      "themes": *[_type == "property" && status == "active"] {
        themes
      } | {"available": array::unique([].themes[])}
    }
  }`

  const result = await client.fetch(query)

  return {
    properties: result.properties || [],
    pagination: {
      page,
      limit,
      total: result.total || 0,
      totalPages: Math.ceil((result.total || 0) / limit),
      hasMore: end < (result.total || 0)
    },
    facets: result.facets
  }
}