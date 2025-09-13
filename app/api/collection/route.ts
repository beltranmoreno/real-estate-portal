import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/sanity/lib/client'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const slug = searchParams.get('slug')
    const accessCode = searchParams.get('accessCode')

    if (!slug) {
      return NextResponse.json(
        { error: 'Collection slug is required' },
        { status: 400 }
      )
    }

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
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      )
    }

    // Check if collection has expired
    if (collection.expiresAt && new Date(collection.expiresAt) < new Date()) {
      return NextResponse.json(
        { 
          error: 'This collection has expired',
          expired: true 
        },
        { status: 410 } // Gone
      )
    }

    // Check access code if collection is private
    if (!collection.isPublic && collection.accessCode) {
      if (accessCode !== collection.accessCode) {
        return NextResponse.json(
          { 
            error: 'Invalid access code',
            requiresAccessCode: true 
          },
          { status: 401 }
        )
      }
    }

    // Filter out inactive properties
    const activeProperties = collection.properties?.filter(
      (property: any) => property.status === 'active'
    ) || []

    // Update view analytics (in production, this would be done server-side)
    // await updateCollectionAnalytics(collection._id, 'view')

    return NextResponse.json({
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
    })

  } catch (error) {
    console.error('Collection API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch collection' },
      { status: 500 }
    )
  }
}

// Share collection endpoint
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { collectionId, sharedBy } = body

    if (!collectionId) {
      return NextResponse.json(
        { error: 'Collection ID is required' },
        { status: 400 }
      )
    }

    // Update share analytics (in production)
    // await updateCollectionAnalytics(collectionId, 'share')

    // Log share event
    console.log('Collection shared:', {
      collectionId,
      sharedBy,
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({
      ok: true,
      message: 'Collection share tracked successfully'
    })

  } catch (error) {
    console.error('Collection share error:', error)
    return NextResponse.json(
      { error: 'Failed to track collection share' },
      { status: 500 }
    )
  }
}