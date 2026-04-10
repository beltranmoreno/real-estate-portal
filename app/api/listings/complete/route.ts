import { NextRequest, NextResponse } from 'next/server'
import { serverClient } from '@/sanity/lib/serverClient'
import { getPropertyByCompletionToken } from '@/lib/listingCompletion'

/**
 * POST /api/listings/complete
 * Body: { token: string, form: OwnerCompletionForm }
 *
 * Final submission from the owner. Maps the form data onto the real
 * property fields, clears the draft and the completion token (so the
 * link can no longer be reused), and leaves status as "pending" so the
 * agent still has to review before publishing.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, form } = body ?? {}

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: 'Missing token' }, { status: 400 })
    }
    if (!form || typeof form !== 'object') {
      return NextResponse.json({ error: 'Missing form data' }, { status: 400 })
    }

    const property = await getPropertyByCompletionToken(token)
    if (!property) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Server-side validation of the minimum required fields. The owner
    // cannot submit until these are filled in; the agent will still
    // review before flipping status to Active.
    const errors: string[] = []

    const num = (v: unknown): number | undefined => {
      if (v === undefined || v === null || v === '') return undefined
      const n = Number(v)
      return Number.isFinite(n) ? n : undefined
    }

    const bedrooms = num(form?.amenities?.bedrooms)
    const bathrooms = num(form?.amenities?.bathrooms)
    const maxGuests = num(form?.amenities?.maxGuests)
    const propertyType = typeof form?.propertyType === 'string' ? form.propertyType : ''

    if (!propertyType) errors.push('propertyType')
    if (bedrooms === undefined || bedrooms < 0) errors.push('bedrooms')
    if (bathrooms === undefined || bathrooms < 0) errors.push('bathrooms')
    if (maxGuests === undefined || maxGuests < 1) errors.push('maxGuests')

    const contactName = typeof form?.contactInfo?.hostName === 'string' ? form.contactInfo.hostName.trim() : ''
    const contactEmail = typeof form?.contactInfo?.email === 'string' ? form.contactInfo.email.trim() : ''
    if (!contactName) errors.push('contactName')
    if (!contactEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
      errors.push('contactEmail')
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { error: 'Validation failed', fields: errors },
        { status: 400 }
      )
    }

    // Build the patch. We merge into existing values so agent-filled
    // fields aren't blown away by owner submission.
    const existingAmenities = property.amenities ?? {}
    const existingPricing = property.pricing ?? {}
    const existingLocation = property.location ?? {}
    const existingHouseRules = property.houseRules ?? {}
    const existingContact = property.contactInfo ?? {}

    // Whitelist of amenity booleans the form is allowed to set. Keeps
    // the endpoint honest if the form ever gets extra fields.
    const amenityBooleanKeys = [
      'hasGolfCart',
      'hasGenerator',
      'hasPool',
      'hasPrivatePool',
      'hasBeachAccess',
      'hasPrivateBeach',
      'hasGym',
      'hasAirConditioning',
      'hasHeating',
      'hasCeilingFans',
      'hasFullKitchen',
      'hasDishwasher',
      'hasCoffeeMaker',
      'hasWineCooler',
      'hasWifi',
      'hasHighSpeedInternet',
      'hasCableTV',
      'hasSmartTV',
      'hasGameRoom',
      'hasBBQ',
      'hasGarden',
      'hasTerrace',
      'hasOutdoorShower',
      'hasOutdoorDining',
      'hasHotTub',
      'hasParking',
      'hasSecuritySystem',
      'hasGatedCommunity',
      'hasHousekeeping',
      'hasHousekeeper',
      'hasChef',
      'hasCook',
      'hasButler',
      'hasConcierge',
      'hasWasher',
      'hasDryer',
      'isWheelchairAccessible',
      'hasElevator',
      'hasCrib',
      'hasHighChair',
      'hasChildSafety',
      'hasWorkspace',
      'hasStaff',
      'hasSecurity',
    ] as const

    const submittedAmenities = (form?.amenities ?? {}) as Record<string, unknown>
    const amenityBooleans: Record<string, boolean> = {}
    for (const key of amenityBooleanKeys) {
      if (key in submittedAmenities) {
        amenityBooleans[key] = Boolean(submittedAmenities[key])
      }
    }

    const amenities = {
      ...existingAmenities,
      ...amenityBooleans,
      bedrooms,
      bathrooms,
      maxGuests,
      squareMeters: num(submittedAmenities.squareMeters) ?? existingAmenities.squareMeters,
      parkingSpaces: num(submittedAmenities.parkingSpaces) ?? existingAmenities.parkingSpaces,
    }

    // Description (bilingual)
    const description_es = typeof form?.description_es === 'string' ? form.description_es : property.description_es
    const description_en = typeof form?.description_en === 'string' ? form.description_en : property.description_en

    // Location
    const location = {
      ...existingLocation,
      address_es: typeof form?.location?.address_es === 'string' ? form.location.address_es : existingLocation.address_es,
      address_en: typeof form?.location?.address_en === 'string' ? form.location.address_en : existingLocation.address_en,
    }

    // Pricing — rental only for MVP owner form
    const rentalPricing = {
      ...(existingPricing.rentalPricing ?? {}),
      minimumNights: num(form?.pricing?.minimumNights) ?? existingPricing.rentalPricing?.minimumNights ?? 2,
      priceOnRequest: form?.pricing?.priceOnRequest === true,
      nightlyRate:
        num(form?.pricing?.nightlyRate) !== undefined
          ? { amount: num(form?.pricing?.nightlyRate), currency: 'USD' }
          : existingPricing.rentalPricing?.nightlyRate,
    }
    const pricing = {
      ...existingPricing,
      type: existingPricing.type ?? 'rental',
      rentalPricing,
    }

    // House Rules
    const houseRules = {
      ...existingHouseRules,
      smokingAllowed: Boolean(form?.houseRules?.smokingAllowed),
      petsAllowed: Boolean(form?.houseRules?.petsAllowed),
      eventsAllowed: Boolean(form?.houseRules?.eventsAllowed),
      maxEventGuests: form?.houseRules?.eventsAllowed
        ? num(form?.houseRules?.maxEventGuests) ?? existingHouseRules.maxEventGuests
        : existingHouseRules.maxEventGuests,
      quietHoursStart: typeof form?.houseRules?.quietHoursStart === 'string'
        ? form.houseRules.quietHoursStart
        : existingHouseRules.quietHoursStart,
      quietHoursEnd: typeof form?.houseRules?.quietHoursEnd === 'string'
        ? form.houseRules.quietHoursEnd
        : existingHouseRules.quietHoursEnd,
    }

    // Contact Info
    const contactInfo = {
      ...existingContact,
      hostName: contactName,
      email: contactEmail,
      phone: typeof form?.contactInfo?.phone === 'string' ? form.contactInfo.phone : existingContact.phone,
      whatsapp: typeof form?.contactInfo?.whatsapp === 'string' ? form.contactInfo.whatsapp : existingContact.whatsapp,
    }

    const patch = serverClient
      .patch(property._id)
      .set({
        propertyType,
        description_es,
        description_en,
        amenities,
        pricing,
        location,
        houseRules,
        contactInfo,
        completedBy: {
          name: contactName,
          email: contactEmail,
          submittedAt: new Date().toISOString(),
        },
      })
      // Clear the token so the link cannot be reused. Agent can generate
      // a new one from the Studio if the owner needs to edit again.
      .unset(['completionToken', 'completionTokenExpiresAt', 'completionDraft'])

    await patch.commit()

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[listings/complete] error', err)
    return NextResponse.json(
      { error: 'Failed to submit listing' },
      { status: 500 }
    )
  }
}
