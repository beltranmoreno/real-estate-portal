import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/sanity/lib/client'

export async function GET(request: NextRequest) {  
  try {
    const searchParams = request.nextUrl.searchParams
    
    // Extract search parameters
    const checkIn = searchParams.get('checkIn')
    const checkOut = searchParams.get('checkOut')
    const bedrooms = searchParams.get('bedrooms')
    const exactBedrooms = searchParams.get('exactBedrooms') === 'true'
    const golf = searchParams.get('golf') === 'true'
    const generator = searchParams.get('generator') === 'true'
    const themes = searchParams.get('themes')?.split(',').filter(Boolean) || []
    const guests = searchParams.get('guests')
    
    // Extended amenities
    const pool = searchParams.get('pool') === 'true'
    const beachAccess = searchParams.get('beachAccess') === 'true'
    const airConditioning = searchParams.get('airConditioning') === 'true'
    const wifi = searchParams.get('wifi') === 'true'
    const kitchen = searchParams.get('kitchen') === 'true'
    const laundry = searchParams.get('laundry') === 'true'
    const parking = searchParams.get('parking') === 'true'
    const bbq = searchParams.get('bbq') === 'true'
    const terrace = searchParams.get('terrace') === 'true'
    const oceanView = searchParams.get('oceanView') === 'true'
    const listingType = searchParams.get('listingType') || 'rental'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const sortBy = searchParams.get('sortBy') || 'featured'

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
    console.log('Filter query:', filterQuery)
    
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

    return NextResponse.json({
      properties: result.properties,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
        hasMore: end < result.total
      },
      facets: result.facets
    })

  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json(
      { error: 'Failed to search properties' },
      { status: 500 }
    )
  }
}