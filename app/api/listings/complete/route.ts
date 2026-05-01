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

    // Staff fields are 3-state enums: 'included' | 'onRequest' | undefined.
    // Validate and pass through only the legal values; everything else
    // becomes undefined so the field is cleared.
    const staffKeys = [
      'hasHousekeeping',
      'hasChef',
      'hasCook',
      'hasButler',
    ] as const
    const staffValues: Record<string, 'included' | 'onRequest' | undefined> = {}
    for (const key of staffKeys) {
      const v = submittedAmenities[key]
      if (v === 'included' || v === 'onRequest') {
        staffValues[key] = v
      } else {
        staffValues[key] = undefined
      }
    }

    // Golf cart: boolean toggle plus quantity. Quantity is preserved
    // only when the toggle is true.
    const hasGolfCart = Boolean(submittedAmenities.hasGolfCart)
    const golfCartQty = hasGolfCart
      ? num(submittedAmenities.numberOfGolfCarts) ?? existingAmenities.numberOfGolfCarts ?? 1
      : undefined

    // Room breakdown — mirror the single owner-facing name into both
    // bilingual fields the schema expects. Owners can refine in Studio.
    const submittedRooms = Array.isArray(form?.rooms) ? form.rooms : []
    const roomBreakdown = submittedRooms
      .filter((r: any) => typeof r?.name === 'string' && r.name.trim().length > 0)
      .map((r: any) => ({
        roomName_en: r.name.trim(),
        roomName_es: r.name.trim(),
        bathrooms: num(r.bathrooms) ?? 0,
        beds: Array.isArray(r.beds)
          ? r.beds
              .filter((b: any) => num(b?.quantity) && b?.bedType)
              .map((b: any) => ({
                bedType: b.bedType,
                quantity: num(b.quantity) ?? 1,
              }))
          : [],
      }))

    const amenities = {
      ...existingAmenities,
      ...amenityBooleans,
      ...staffValues,
      bedrooms,
      bathrooms,
      maxGuests,
      hasGolfCart,
      numberOfGolfCarts: golfCartQty,
      squareMeters: num(submittedAmenities.squareMeters) ?? existingAmenities.squareMeters,
      parkingSpaces: num(submittedAmenities.parkingSpaces) ?? existingAmenities.parkingSpaces,
      // Only overwrite roomBreakdown if the owner submitted at least one
      // room — preserve any pre-existing data otherwise.
      ...(roomBreakdown.length > 0 ? { roomBreakdown } : {}),
    }

    // Location — structured fields. Area can be either a Sanity area
    // document _id (becomes a reference) or the literal 'other' (becomes
    // a free-text customArea string). City and country fall back to the
    // Casa de Campo defaults if the owner clears them.
    const submittedLocation = (form?.location ?? {}) as Record<string, unknown>
    const areaSelection = typeof submittedLocation.areaSelection === 'string'
      ? submittedLocation.areaSelection
      : ''
    const customArea = typeof submittedLocation.customArea === 'string'
      ? submittedLocation.customArea.trim()
      : ''

    let areaRef: { _type: 'reference'; _ref: string } | undefined
    let resolvedCustomArea: string | undefined

    if (areaSelection === 'other') {
      areaRef = undefined
      resolvedCustomArea = customArea || undefined
    } else if (areaSelection) {
      // Validate it looks like a Sanity document id (loose UUID check).
      if (/^[a-zA-Z0-9_.-]+$/.test(areaSelection)) {
        areaRef = { _type: 'reference', _ref: areaSelection }
        resolvedCustomArea = undefined
      }
    } else {
      // Empty selection — preserve existing reference if any.
      areaRef = existingLocation.area
      resolvedCustomArea = existingLocation.customArea
    }

    const location: Record<string, unknown> = {
      ...existingLocation,
      street:
        typeof submittedLocation.street === 'string'
          ? submittedLocation.street
          : existingLocation.street,
      city:
        typeof submittedLocation.city === 'string' && submittedLocation.city.trim()
          ? submittedLocation.city.trim()
          : existingLocation.city || 'La Romana',
      country:
        typeof submittedLocation.country === 'string' && submittedLocation.country.trim()
          ? submittedLocation.country.trim()
          : existingLocation.country || 'Dominican Republic',
      postcode:
        typeof submittedLocation.postcode === 'string'
          ? submittedLocation.postcode
          : existingLocation.postcode,
      isPrivateAddress: Boolean(submittedLocation.isPrivateAddress),
    }
    if (areaRef) {
      location.area = areaRef
    } else {
      // Drop the key entirely so Sanity's `.set()` clears any prior
      // reference rather than leaving it in place.
      delete location.area
    }
    if (resolvedCustomArea !== undefined) {
      location.customArea = resolvedCustomArea
    } else {
      delete location.customArea
    }

    // Pricing — rental only for MVP owner form. We accept a base rate,
    // minimum nights, optional price-on-request flag, and an optional
    // list of seasonal rules with their own date range / rate / minimum.
    const submittedSeasons = Array.isArray(form?.pricing?.seasons)
      ? form.pricing.seasons
      : []
    const seasonalPricing = submittedSeasons
      .filter(
        (s: any) =>
          typeof s?.name === 'string' &&
          s.name.trim().length > 0 &&
          typeof s?.startDate === 'string' &&
          s.startDate &&
          typeof s?.endDate === 'string' &&
          s.endDate &&
          num(s?.nightlyRate) !== undefined
      )
      .map((s: any) => ({
        name: s.name.trim(),
        startDate: s.startDate,
        endDate: s.endDate,
        nightlyRate: { amount: num(s.nightlyRate), currency: 'USD' },
        ...(num(s?.minimumNights) !== undefined
          ? { minimumNights: num(s.minimumNights) }
          : {}),
      }))

    const rentalPricing = {
      ...(existingPricing.rentalPricing ?? {}),
      minimumNights: num(form?.pricing?.minimumNights) ?? existingPricing.rentalPricing?.minimumNights ?? 2,
      priceOnRequest: form?.pricing?.priceOnRequest === true,
      nightlyRate:
        num(form?.pricing?.nightlyRate) !== undefined
          ? { amount: num(form?.pricing?.nightlyRate), currency: 'USD' }
          : existingPricing.rentalPricing?.nightlyRate,
      // Owner-submitted seasons replace the previous list. Empty list
      // means owner removed all seasons — that's the intended behavior.
      seasonalPricing,
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
        // description_es/en are agent-managed only — not collected from the
        // owner form, so we don't write them here.
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
