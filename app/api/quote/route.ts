import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/sanity/lib/client'

interface QuoteRequest {
  propertyId: string
  checkIn: string
  checkOut: string
  guests: number
}

export async function POST(request: NextRequest) {
  try {
    const body: QuoteRequest = await request.json()
    const { propertyId, checkIn, checkOut, guests } = body

    // Validate inputs
    if (!propertyId || !checkIn || !checkOut || !guests) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const checkInDate = new Date(checkIn)
    const checkOutDate = new Date(checkOut)
    
    if (checkOutDate <= checkInDate) {
      return NextResponse.json(
        { error: 'Check-out date must be after check-in date' },
        { status: 400 }
      )
    }

    // Fetch property details
    const query = `*[_type == "property" && _id == $propertyId][0] {
      _id,
      title_en,
      title_es,
      "maxGuests": amenities.maxGuests,
      "listingType": pricing.type,
      "nightlyRate": pricing.rentalPricing.nightlyRate,
      "weeklyRate": pricing.rentalPricing.weeklyRate,
      "monthlyRate": pricing.rentalPricing.monthlyRate,
      "minimumNights": pricing.rentalPricing.minimumNights,
      "cleaningFee": pricing.rentalPricing.cleaningFee,
      "securityDeposit": pricing.rentalPricing.securityDeposit,
      "taxRate": pricing.rentalPricing.taxRate,
      "seasonalPricing": pricing.rentalPricing.seasonalPricing,
      "isAvailable": availability.isAvailable,
      "blockedDates": availability.blockedDates,
      "preparationTime": availability.preparationTime
    }`

    const property = await client.fetch(query, { propertyId })

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }

    // Check if property is available
    if (!property.isAvailable) {
      return NextResponse.json({
        available: false,
        reason: 'PROPERTY_UNAVAILABLE',
        message: 'This property is currently unavailable'
      })
    }

    // Check guest capacity
    if (guests > property.maxGuests) {
      return NextResponse.json({
        available: false,
        reason: 'EXCEEDS_CAPACITY',
        message: `This property can accommodate a maximum of ${property.maxGuests} guests`,
        maxGuests: property.maxGuests
      })
    }

    // Calculate nights
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))

    // Check minimum nights
    if (nights < property.minimumNights) {
      return NextResponse.json({
        available: false,
        reason: 'MIN_NIGHTS',
        message: `Minimum stay is ${property.minimumNights} nights`,
        minimumNights: property.minimumNights
      })
    }

    // Check blocked dates
    const isBlocked = property.blockedDates?.some((blocked: any) => {
      const blockedStart = new Date(blocked.startDate)
      const blockedEnd = new Date(blocked.endDate)
      
      // Check if dates overlap
      return !(checkOutDate <= blockedStart || checkInDate >= blockedEnd)
    })

    if (isBlocked) {
      return NextResponse.json({
        available: false,
        reason: 'DATES_BLOCKED',
        message: 'Selected dates are not available'
      })
    }

    // Calculate pricing
    let nightlyRate = property.nightlyRate?.amount || 0
    const currency = property.nightlyRate?.currency || 'USD'

    // Check for seasonal pricing
    if (property.seasonalPricing?.length > 0) {
      for (const season of property.seasonalPricing) {
        const seasonStart = new Date(season.startDate)
        const seasonEnd = new Date(season.endDate)
        
        if (checkInDate >= seasonStart && checkInDate <= seasonEnd) {
          nightlyRate = season.nightlyRate?.amount || nightlyRate
          break
        }
      }
    }

    // Apply weekly/monthly rates if applicable
    let accommodationTotal = nightlyRate * nights
    
    if (nights >= 30 && property.monthlyRate?.amount) {
      const months = Math.floor(nights / 30)
      const remainingNights = nights % 30
      accommodationTotal = (property.monthlyRate.amount * months) + (nightlyRate * remainingNights)
    } else if (nights >= 7 && property.weeklyRate?.amount) {
      const weeks = Math.floor(nights / 7)
      const remainingNights = nights % 7
      accommodationTotal = (property.weeklyRate.amount * weeks) + (nightlyRate * remainingNights)
    }

    // Add fees
    const cleaningFee = property.cleaningFee?.amount || 0
    const securityDeposit = property.securityDeposit?.amount || 0
    
    // Calculate tax
    const taxRate = property.taxRate || 0
    const taxAmount = (accommodationTotal * taxRate) / 100

    // Calculate totals
    const subtotal = accommodationTotal + cleaningFee
    const total = subtotal + taxAmount

    return NextResponse.json({
      available: true,
      quote: {
        propertyId: property._id,
        checkIn,
        checkOut,
        guests,
        nights,
        currency,
        breakdown: {
          accommodationTotal,
          nightlyRate,
          cleaningFee,
          securityDeposit,
          taxAmount,
          taxRate
        },
        subtotal,
        total,
        totalWithDeposit: total + securityDeposit
      },
      message: 'Quote generated successfully'
    })

  } catch (error) {
    console.error('Quote API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate quote' },
      { status: 500 }
    )
  }
}