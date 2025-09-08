import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/sanity/lib/client'

export async function GET(request: NextRequest) {
  console.log('=== SEARCH API CALLED ===')
  
  try {
    const searchParams = request.nextUrl.searchParams
    console.log('Search params:', Object.fromEntries(searchParams.entries()))
    
    // Extract search parameters
    const checkIn = searchParams.get('checkIn')
    const checkOut = searchParams.get('checkOut')
    const bedrooms = searchParams.get('bedrooms')
    const golf = searchParams.get('golf') === 'true'
    const generator = searchParams.get('generator') === 'true'
    const themes = searchParams.get('themes')?.split(',').filter(Boolean) || []
    const guests = searchParams.get('guests')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const sortBy = searchParams.get('sortBy') || 'featured'

    // Build GROQ query
    let filters = ['_type == "property"', 'status == "active"']
    
    if (bedrooms && bedrooms !== '0') {
      filters.push(`amenities.bedrooms >= ${bedrooms}`)
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
    
    if (themes.length > 0) {
      const themeFilters = themes.map(theme => `"${theme}" in themes`).join(' || ')
      filters.push(`(${themeFilters})`)
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
        "hasBeachAccess": amenities.hasBeachAccess,
        "listingType": pricing.type,
        "nightlyRate": pricing.rentalPricing.nightlyRate,
        "minimumNights": pricing.rentalPricing.minimumNights,
        "salePrice": pricing.salePricing.salePrice,
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

    console.log('Full GROQ query:', query)
    
    const result = await client.fetch(query)
    console.log('Query result:', {
      propertiesCount: result.properties?.length || 0,
      total: result.total,
      firstProperty: result.properties?.[0]
    })

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