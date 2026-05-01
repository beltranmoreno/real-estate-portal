'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { completionTranslations, type Locale } from './translations'
import type { AreaOption } from '@/lib/listingCompletion'

interface InitialProperty {
  propertyType: string
  amenities: Record<string, any>
  pricing: Record<string, any>
  location: Record<string, any>
  houseRules: Record<string, any>
  contactInfo: Record<string, any>
}

export const BED_TYPES = [
  { value: 'king', en: 'King', es: 'King' },
  { value: 'queen', en: 'Queen', es: 'Queen' },
  { value: 'full', en: 'Full / Double', es: 'Doble' },
  { value: 'twin', en: 'Twin / Single', es: 'Sencilla' },
  { value: 'bunk', en: 'Bunk bed', es: 'Litera' },
  { value: 'sofa', en: 'Sofa bed', es: 'Sofá cama' },
  { value: 'crib', en: 'Crib', es: 'Cuna' },
] as const

export type BedType = (typeof BED_TYPES)[number]['value']

export interface FormBed {
  bedType: BedType
  quantity: number
}

export interface FormRoom {
  name: string
  bathrooms: number
  beds: FormBed[]
}

export interface FormSeason {
  name: string
  startDate: string
  endDate: string
  nightlyRate: string
  minimumNights: string
}

interface FormState {
  propertyType: string
  amenities: Record<string, any>
  rooms: FormRoom[]
  pricing: {
    // "Base rate" — the default nightly price when no seasonal rule matches.
    nightlyRate: string
    minimumNights: string
    priceOnRequest: boolean
    seasons: FormSeason[]
  }
  location: {
    street: string
    // Either an area document _id, the literal 'other', or '' for unset.
    areaSelection: string
    customArea: string
    city: string
    country: string
    postcode: string
    isPrivateAddress: boolean
  }
  houseRules: {
    smokingAllowed: boolean
    petsAllowed: boolean
    eventsAllowed: boolean
    maxEventGuests: string
  }
  contactInfo: {
    hostName: string
    email: string
    phone: string
    whatsapp: string
  }
}

function buildInitialState(
  property: InitialProperty,
  draft: Record<string, any>
): FormState {
  // Draft takes precedence over property (so owners resume where they left off),
  // but property values are the fallback for anything the agent pre-filled.
  const pick = <T,>(draftVal: T | undefined, fallback: T): T =>
    draftVal !== undefined && draftVal !== null && draftVal !== ''
      ? draftVal
      : fallback

  // Seed rooms from draft (preferred) or from any existing roomBreakdown
  // the agent may have entered in Studio. We keep a single name field per
  // room because the owner form is intentionally simpler than Studio —
  // we'll mirror the value into both roomName_en and roomName_es on submit.
  const seedRooms = (): FormRoom[] => {
    if (Array.isArray(draft?.rooms)) return draft.rooms as FormRoom[]
    const existing = property.amenities?.roomBreakdown
    if (Array.isArray(existing)) {
      return existing.map((r: any) => ({
        name: r?.roomName_en || r?.roomName_es || '',
        bathrooms: Number(r?.bathrooms) || 0,
        beds: Array.isArray(r?.beds)
          ? r.beds.map((b: any) => ({
              bedType: b?.bedType ?? 'queen',
              quantity: Number(b?.quantity) || 1,
            }))
          : [],
      }))
    }
    return []
  }

  const seedSeasons = (): FormSeason[] => {
    if (Array.isArray(draft?.pricing?.seasons)) return draft.pricing.seasons as FormSeason[]
    const existing = property.pricing?.rentalPricing?.seasonalPricing
    if (Array.isArray(existing)) {
      return existing.map((s: any) => ({
        name: s?.name ?? '',
        startDate: s?.startDate ?? '',
        endDate: s?.endDate ?? '',
        nightlyRate: (s?.nightlyRate?.amount ?? '').toString(),
        minimumNights: (s?.minimumNights ?? '').toString(),
      }))
    }
    return []
  }

  return {
    propertyType: pick(draft.propertyType, property.propertyType) || '',
    amenities: {
      ...property.amenities,
      ...(draft.amenities ?? {}),
    },
    rooms: seedRooms(),
    pricing: {
      nightlyRate:
        draft?.pricing?.nightlyRate ??
        (property.pricing?.rentalPricing?.nightlyRate?.amount ?? '').toString(),
      minimumNights:
        draft?.pricing?.minimumNights ??
        (property.pricing?.rentalPricing?.minimumNights ?? '').toString(),
      priceOnRequest:
        draft?.pricing?.priceOnRequest ??
        Boolean(property.pricing?.rentalPricing?.priceOnRequest),
      seasons: seedSeasons(),
    },
    location: {
      street: pick(draft?.location?.street, property.location?.street) || '',
      // Pick the existing area reference _id if present, otherwise 'other'
      // (when only customArea was set), otherwise empty.
      areaSelection:
        draft?.location?.areaSelection ??
        property.location?.area?._ref ??
        (property.location?.customArea ? 'other' : ''),
      customArea:
        pick(draft?.location?.customArea, property.location?.customArea) || '',
      city:
        pick(draft?.location?.city, property.location?.city) || 'La Romana',
      country:
        pick(draft?.location?.country, property.location?.country) ||
        'Dominican Republic',
      postcode:
        pick(draft?.location?.postcode, property.location?.postcode) || '22000',
      isPrivateAddress:
        draft?.location?.isPrivateAddress ??
        Boolean(property.location?.isPrivateAddress),
    },
    houseRules: {
      smokingAllowed:
        draft?.houseRules?.smokingAllowed ?? Boolean(property.houseRules?.smokingAllowed),
      petsAllowed:
        draft?.houseRules?.petsAllowed ?? Boolean(property.houseRules?.petsAllowed),
      eventsAllowed:
        draft?.houseRules?.eventsAllowed ?? Boolean(property.houseRules?.eventsAllowed),
      maxEventGuests:
        draft?.houseRules?.maxEventGuests ??
        (property.houseRules?.maxEventGuests ?? '').toString(),
    },
    contactInfo: {
      hostName: pick(draft?.contactInfo?.hostName, property.contactInfo?.hostName) || '',
      email: pick(draft?.contactInfo?.email, property.contactInfo?.email) || '',
      phone: pick(draft?.contactInfo?.phone, property.contactInfo?.phone) || '',
      whatsapp:
        pick(draft?.contactInfo?.whatsapp, property.contactInfo?.whatsapp) || '',
    },
  }
}

const PROPERTY_TYPES = ['villa', 'apartment', 'condo', 'house', 'penthouse', 'townhouse', 'studio', 'loft', 'plot'] as const

// Grouped amenity checkboxes. The English label here is a fallback; the
// real labels come from the translations file per-locale where available.
const AMENITY_GROUPS: Array<{
  groupKey: keyof typeof completionTranslations.en.amenityGroups
  items: Array<{ key: string; en: string; es: string }>
}> = [
  {
    groupKey: 'climate',
    items: [
      { key: 'hasAirConditioning', en: 'Air conditioning', es: 'Aire acondicionado' },
      { key: 'hasHeating', en: 'Heating', es: 'Calefacción' },
      { key: 'hasCeilingFans', en: 'Ceiling fans', es: 'Ventiladores de techo' },
    ],
  },
  {
    groupKey: 'kitchen',
    items: [
      { key: 'hasFullKitchen', en: 'Full kitchen', es: 'Cocina completa' },
      { key: 'hasDishwasher', en: 'Dishwasher', es: 'Lavavajillas' },
      { key: 'hasCoffeeMaker', en: 'Coffee maker', es: 'Cafetera' },
      { key: 'hasWineCooler', en: 'Wine cooler', es: 'Enfriador de vinos' },
    ],
  },
  {
    groupKey: 'entertainment',
    items: [
      { key: 'hasWifi', en: 'WiFi', es: 'WiFi' },
      { key: 'hasHighSpeedInternet', en: 'High-speed internet', es: 'Internet de alta velocidad' },
      { key: 'hasCableTV', en: 'Cable TV', es: 'TV por cable' },
      { key: 'hasSmartTV', en: 'Smart TV', es: 'Smart TV' },
      { key: 'hasGameRoom', en: 'Game room', es: 'Sala de juegos' },
    ],
  },
  {
    groupKey: 'outdoor',
    items: [
      { key: 'hasPool', en: 'Pool', es: 'Piscina' },
      { key: 'hasPrivatePool', en: 'Private pool', es: 'Piscina privada' },
      { key: 'hasBeachAccess', en: 'Beach access', es: 'Acceso a playa' },
      { key: 'hasPrivateBeach', en: 'Private beach', es: 'Playa privada' },
      { key: 'hasHotTub', en: 'Hot tub', es: 'Jacuzzi' },
      { key: 'hasBBQ', en: 'BBQ grill', es: 'Parrilla BBQ' },
      { key: 'hasGarden', en: 'Garden', es: 'Jardín' },
      { key: 'hasTerrace', en: 'Terrace / balcony', es: 'Terraza / balcón' },
      { key: 'hasOutdoorShower', en: 'Outdoor shower', es: 'Ducha exterior' },
      { key: 'hasOutdoorDining', en: 'Outdoor dining', es: 'Comedor exterior' },
    ],
  },
  {
    groupKey: 'services',
    items: [
      { key: 'hasSecuritySystem', en: 'Security system', es: 'Sistema de seguridad' },
      { key: 'hasSecurity', en: 'Private security', es: 'Seguridad privada' },
      { key: 'hasParking', en: 'Parking', es: 'Estacionamiento' },
    ],
  },
  {
    groupKey: 'laundry',
    items: [
      { key: 'hasWasher', en: 'Washer', es: 'Lavadora' },
      { key: 'hasDryer', en: 'Dryer', es: 'Secadora' },
    ],
  },
  {
    groupKey: 'family',
    items: [
      { key: 'hasCrib', en: 'Baby crib', es: 'Cuna' },
      { key: 'hasHighChair', en: 'High chair', es: 'Silla alta' },
      { key: 'hasChildSafety', en: 'Child safety features', es: 'Seguridad infantil' },
    ],
  },
  {
    groupKey: 'work',
    items: [
      { key: 'hasWorkspace', en: 'Dedicated workspace', es: 'Espacio de trabajo' },
    ],
  },
  {
    // hasGolfCart is handled separately in the basics section because it
    // has a quantity input attached to it.
    groupKey: 'premium',
    items: [
      { key: 'hasGenerator', en: 'Backup generator', es: 'Generador de respaldo' },
      { key: 'hasGym', en: 'Gym', es: 'Gimnasio' },
      { key: 'hasElevator', en: 'Elevator', es: 'Ascensor' },
      { key: 'isWheelchairAccessible', en: 'Wheelchair accessible', es: 'Accesible en silla de ruedas' },
    ],
  },
]

// Staff and service amenities have three states instead of two:
// none / included / on-request. Rendered as a separate section below
// the regular amenity checkboxes.
const STAFF_ITEMS: Array<{ key: string; en: string; es: string }> = [
  { key: 'hasHousekeeping', en: 'Housekeeping', es: 'Limpieza' },
  { key: 'hasChef', en: 'Private chef', es: 'Chef privado' },
  { key: 'hasCook', en: 'Cook', es: 'Cocinero(a)' },
  { key: 'hasButler', en: 'Butler', es: 'Mayordomo' },
]

export function CompleteListingForm({
  token,
  locale,
  initialProperty,
  initialDraft,
  lastSavedAt: initialLastSavedAt,
  areaOptions,
}: {
  token: string
  locale: Locale
  initialProperty: InitialProperty
  initialDraft: Record<string, any>
  lastSavedAt?: string
  areaOptions: AreaOption[]
}) {
  const t = completionTranslations[locale]
  const [form, setForm] = useState<FormState>(() =>
    buildInitialState(initialProperty, initialDraft)
  )
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [lastSavedAt, setLastSavedAt] = useState<string | undefined>(initialLastSavedAt)
  const [submitState, setSubmitState] = useState<'idle' | 'submitting' | 'done' | 'error'>('idle')
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<string[]>([])

  // Skip auto-save on the very first render so opening the page doesn't
  // immediately write a draft.
  const isFirstRender = useRef(true)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const saveDraft = useCallback(async (state: FormState) => {
    setSaveStatus('saving')
    try {
      const res = await fetch('/api/listings/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, draft: state }),
      })
      if (!res.ok) throw new Error('save failed')
      setSaveStatus('saved')
      setLastSavedAt(new Date().toISOString())
    } catch {
      setSaveStatus('error')
    }
  }, [token])

  // Debounced auto-save. 1.2s after the last change.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    if (submitState === 'done') return
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      saveDraft(form)
    }, 1200)
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
    }
  }, [form, saveDraft, submitState])

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const updateNested = <K extends keyof FormState>(
    key: K,
    patch: Partial<FormState[K]>
  ) => {
    setForm((prev) => ({ ...prev, [key]: { ...(prev[key] as object), ...patch } as FormState[K] }))
  }

  const toggleAmenity = (amenityKey: string) => {
    setForm((prev) => ({
      ...prev,
      amenities: {
        ...prev.amenities,
        [amenityKey]: !prev.amenities[amenityKey],
      },
    }))
  }

  const lastSavedLabel = useMemo(() => {
    if (saveStatus === 'saving') return t.saving
    if (saveStatus === 'error') return t.saveFailed
    if (!lastSavedAt) return null
    const d = new Date(lastSavedAt)
    const fmt = d.toLocaleString(locale === 'es' ? 'es-DO' : 'en-US', {
      hour: 'numeric',
      minute: '2-digit',
      month: 'short',
      day: 'numeric',
    })
    return `${t.savedAt} ${fmt}`
  }, [saveStatus, lastSavedAt, locale, t])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitState('submitting')
    setSubmitError(null)
    setFieldErrors([])

    // Flush any pending draft save first so the server has the latest
    // snapshot even if the submission fails.
    if (saveTimer.current) clearTimeout(saveTimer.current)
    await saveDraft(form)

    try {
      const res = await fetch('/api/listings/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, form }),
      })
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}))
        if (Array.isArray(payload?.fields)) setFieldErrors(payload.fields)
        setSubmitError(payload?.error || t.submitError)
        setSubmitState('error')
        return
      }
      setSubmitState('done')
    } catch {
      setSubmitError(t.submitError)
      setSubmitState('error')
    }
  }

  if (submitState === 'done') {
    return (
      <div className="bg-white rounded-xs border border-stone-200 p-10 text-center">
        <h2 className="text-2xl font-light text-stone-900 mb-3">{t.completedTitle}</h2>
        <p className="text-stone-600 font-light">{t.completedBody}</p>
      </div>
    )
  }

  const hasFieldError = (field: string) => fieldErrors.includes(field)

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Save indicator */}
      <div className="h-5 text-sm text-stone-500">{lastSavedLabel}</div>

      {/* Basics */}
      <Section title={t.sectionBasics}>
        <Field label={t.propertyType} error={hasFieldError('propertyType') ? t.requiredField : undefined}>
          <SelectShell>
            <select
              value={form.propertyType}
              onChange={(e) => updateField('propertyType', e.target.value)}
              className="w-full appearance-none  border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-800 px-3 py-2 pr-9 bg-white"
            >
              <option value="">{t.propertyTypePlaceholder}</option>
              {PROPERTY_TYPES.map((type) => (
                <option key={type} value={type}>
                  {t.propertyTypeOptions[type]}
                </option>
              ))}
            </select>
          </SelectShell>
        </Field>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Field label={t.bedrooms} error={hasFieldError('bedrooms') ? t.requiredField : undefined}>
            <input
              type="number"
              min={0}
              value={form.amenities.bedrooms ?? ''}
              onChange={(e) =>
                setForm((p) => ({ ...p, amenities: { ...p.amenities, bedrooms: e.target.value } }))
              }
              className="w-full  border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-800 px-3 py-2"
            />
          </Field>
          <Field label={t.bathrooms} error={hasFieldError('bathrooms') ? t.requiredField : undefined}>
            <input
              type="number"
              min={0}
              step="0.5"
              value={form.amenities.bathrooms ?? ''}
              onChange={(e) =>
                setForm((p) => ({ ...p, amenities: { ...p.amenities, bathrooms: e.target.value } }))
              }
              className="w-full  border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-800 px-3 py-2"
            />
          </Field>
          <Field label={t.maxGuests} error={hasFieldError('maxGuests') ? t.requiredField : undefined}>
            <input
              type="number"
              min={1}
              value={form.amenities.maxGuests ?? ''}
              onChange={(e) =>
                setForm((p) => ({ ...p, amenities: { ...p.amenities, maxGuests: e.target.value } }))
              }
              className="w-full  border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-800 px-3 py-2"
            />
          </Field>
          <Field label={t.squareMeters}>
            <input
              type="number"
              min={0}
              value={form.amenities.squareMeters ?? ''}
              onChange={(e) =>
                setForm((p) => ({ ...p, amenities: { ...p.amenities, squareMeters: e.target.value } }))
              }
              className="w-full  border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-800 px-3 py-2"
            />
          </Field>
        </div>

      </Section>

      {/* Rooms & Beds */}
      <Section title={t.sectionRoomBreakdown}>
        <p className="text-sm text-stone-500">{t.roomBreakdownHelp}</p>
        <div className="space-y-4">
          {form.rooms.map((room, roomIdx) => (
            <div
              key={roomIdx}
              className=" border border-stone-200 p-4 space-y-3 bg-stone-50/50"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <Field label={t.roomName}>
                      <input
                        type="text"
                        value={room.name}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            rooms: p.rooms.map((r, i) =>
                              i === roomIdx ? { ...r, name: e.target.value } : r
                            ),
                          }))
                        }
                        className="w-full  border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-800 px-3 py-2"
                      />
                    </Field>
                  </div>
                  <Field label={t.roomBathrooms}>
                    <input
                      type="number"
                      min={0}
                      step="0.5"
                      value={room.bathrooms}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          rooms: p.rooms.map((r, i) =>
                            i === roomIdx
                              ? { ...r, bathrooms: Number(e.target.value) || 0 }
                              : r
                          ),
                        }))
                      }
                      className="w-full  border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-800 px-3 py-2"
                    />
                  </Field>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setForm((p) => ({
                      ...p,
                      rooms: p.rooms.filter((_, i) => i !== roomIdx),
                    }))
                  }
                  className="text-xs text-red-600 hover:text-red-700 mt-7"
                >
                  {t.removeRoom}
                </button>
              </div>

              <div>
                <h4 className="text-sm font-light text-stone-700 mb-2">
                  {t.bedsInRoom}
                </h4>
                <div className="space-y-2">
                  {room.beds.map((bed, bedIdx) => (
                    <div key={bedIdx} className="flex gap-2 items-center">
                      <div className="flex-1">
                        <SelectShell>
                          <select
                            value={bed.bedType}
                            onChange={(e) =>
                              setForm((p) => ({
                                ...p,
                                rooms: p.rooms.map((r, i) =>
                                  i === roomIdx
                                    ? {
                                        ...r,
                                        beds: r.beds.map((b, j) =>
                                          j === bedIdx
                                            ? { ...b, bedType: e.target.value as BedType }
                                            : b
                                        ),
                                      }
                                    : r
                                ),
                              }))
                            }
                            className="w-full appearance-none  border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-800 px-3 py-2 pr-9 text-sm bg-white"
                          >
                            {BED_TYPES.map((bt) => (
                              <option key={bt.value} value={bt.value}>
                                {t.bedTypes[bt.value]}
                              </option>
                            ))}
                          </select>
                        </SelectShell>
                      </div>
                      <input
                        type="number"
                        min={1}
                        value={bed.quantity}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            rooms: p.rooms.map((r, i) =>
                              i === roomIdx
                                ? {
                                    ...r,
                                    beds: r.beds.map((b, j) =>
                                      j === bedIdx
                                        ? { ...b, quantity: Number(e.target.value) || 1 }
                                        : b
                                    ),
                                  }
                                : r
                            ),
                          }))
                        }
                        className="w-20  border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-800 px-3 py-2 text-sm"
                        aria-label={t.bedQuantity}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setForm((p) => ({
                            ...p,
                            rooms: p.rooms.map((r, i) =>
                              i === roomIdx
                                ? { ...r, beds: r.beds.filter((_, j) => j !== bedIdx) }
                                : r
                            ),
                          }))
                        }
                        className="text-xs text-red-600 hover:text-red-700 px-2"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      setForm((p) => ({
                        ...p,
                        rooms: p.rooms.map((r, i) =>
                          i === roomIdx
                            ? { ...r, beds: [...r.beds, { bedType: 'queen', quantity: 1 }] }
                            : r
                        ),
                      }))
                    }
                    className="text-sm text-stone-700 hover:text-stone-900 underline"
                  >
                    {t.addBed}
                  </button>
                </div>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              setForm((p) => ({
                ...p,
                rooms: [
                  ...p.rooms,
                  { name: '', bathrooms: 0, beds: [{ bedType: 'queen', quantity: 1 }] },
                ],
              }))
            }
            className="w-full  border border-dashed border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-800 py-3 text-sm text-stone-700 hover:bg-stone-50"
          >
            {t.addRoom}
          </button>
        </div>
      </Section>

      {/* Location */}
      <Section title={t.sectionLocation}>
        <Field label={t.street}>
          <input
            type="text"
            value={form.location.street}
            onChange={(e) => updateNested('location', { street: e.target.value })}
            className="w-full  border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-800 px-3 py-2"
          />
        </Field>

        {/* Area: dropdown of existing area docs + "Other (specify)" — when
            'other' is chosen we show a free-text input. */}
        <Field label={t.area}>
          <SelectShell>
            <select
              value={form.location.areaSelection}
              onChange={(e) =>
                updateNested('location', { areaSelection: e.target.value })
              }
              className="w-full appearance-none  border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-800 px-3 py-2 pr-9 bg-white"
            >
              <option value="">{t.areaPlaceholder}</option>
              {areaOptions.map((a) => (
                <option key={a._id} value={a._id}>
                  {locale === 'es' ? a.title_es || a.title_en : a.title_en || a.title_es}
                </option>
              ))}
              <option value="other">{t.areaOther}</option>
            </select>
          </SelectShell>
        </Field>

        {form.location.areaSelection === 'other' && (
          <Field label={t.customArea}>
            <input
              type="text"
              value={form.location.customArea}
              onChange={(e) =>
                updateNested('location', { customArea: e.target.value })
              }
              className="w-full  border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-800 px-3 py-2"
              placeholder={t.customAreaPlaceholder}
            />
          </Field>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Field label={t.city}>
            <input
              type="text"
              value={form.location.city}
              onChange={(e) => updateNested('location', { city: e.target.value })}
              className="w-full  border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-800 px-3 py-2"
            />
          </Field>
          <Field label={t.country}>
            <input
              type="text"
              value={form.location.country}
              onChange={(e) =>
                updateNested('location', { country: e.target.value })
              }
              className="w-full  border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-800 px-3 py-2"
            />
          </Field>
          <Field label={t.postcode}>
            <input
              type="text"
              value={form.location.postcode}
              onChange={(e) =>
                updateNested('location', { postcode: e.target.value })
              }
              className="w-full  border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-800 px-3 py-2"
            />
          </Field>
        </div>

        <ToggleRow
          label={t.privateAddress}
          checked={form.location.isPrivateAddress}
          onChange={(v) => updateNested('location', { isPrivateAddress: v })}
        />
        <p className="text-xs text-stone-500">{t.privateAddressHelp}</p>
      </Section>

      {/* Amenity checkboxes */}
      <Section title={t.sectionAmenities}>
        {/* Golf cart sits above the grouped checkboxes because it has a
            count input attached to it — quantity is common in Casa de Campo
            (often 2-3 carts per villa). */}
        <div className="pb-4 mb-2 border-b border-stone-100 space-y-2">
          <ToggleRow
            label={t.golfCartIncluded}
            checked={Boolean(form.amenities.hasGolfCart)}
            onChange={(v) =>
              setForm((p) => ({
                ...p,
                amenities: {
                  ...p.amenities,
                  hasGolfCart: v,
                  // Default to 1 when toggled on; clear when toggled off.
                  numberOfGolfCarts: v
                    ? p.amenities.numberOfGolfCarts || 1
                    : undefined,
                },
              }))
            }
          />
          {form.amenities.hasGolfCart && (
            <div className="sm:max-w-[12rem]">
              <Field label={t.numberOfGolfCarts}>
                <input
                  type="number"
                  min={1}
                  value={form.amenities.numberOfGolfCarts ?? 1}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      amenities: {
                        ...p.amenities,
                        numberOfGolfCarts: Number(e.target.value) || 1,
                      },
                    }))
                  }
                  className="w-full  border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-800 px-3 py-2"
                />
              </Field>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {AMENITY_GROUPS.map((group) => (
            <div key={group.groupKey}>
              <h3 className="text-sm font-light text-stone-700 uppercase tracking-wide mb-2">
                {t.amenityGroups[group.groupKey]}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {group.items.map((item) => (
                  <label
                    key={item.key}
                    className="flex items-center gap-2 text-sm cursor-pointer select-none"
                  >
                    <input
                      type="checkbox"
                      checked={Boolean(form.amenities[item.key])}
                      onChange={() => toggleAmenity(item.key)}
                      className="h-4 w-4 rounded border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-800"
                    />
                    <span>{locale === 'es' ? item.es : item.en}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Staff & Services — three-state selector (none / included / on request) */}
      <Section title={t.sectionStaff}>
        <p className="text-sm text-stone-500">{t.staffHelp}</p>
        <div className="space-y-3">
          {STAFF_ITEMS.map((item) => {
            const value = form.amenities[item.key] as
              | 'included'
              | 'onRequest'
              | undefined
              | ''
            return (
              <div
                key={item.key}
                className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-3  border border-stone-200"
              >
                <span className="text-sm font-light text-stone-800 sm:flex-1">
                  {locale === 'es' ? item.es : item.en}
                </span>
                <div className="flex gap-2 text-xs">
                  {(['', 'included', 'onRequest'] as const).map((opt) => (
                    <label
                      key={opt}
                      className={`px-3 py-1.5 rounded-full border cursor-pointer select-none transition-colors ${
                        (value || '') === opt
                          ? 'bg-stone-800 text-white border-stone-800'
                          : 'bg-white text-stone-700 border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-800 hover:bg-stone-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name={item.key}
                        value={opt}
                        checked={(value || '') === opt}
                        onChange={() =>
                          setForm((p) => ({
                            ...p,
                            amenities: {
                              ...p.amenities,
                              [item.key]: opt || undefined,
                            },
                          }))
                        }
                        className="sr-only"
                      />
                      {opt === '' && t.staffOptionNone}
                      {opt === 'included' && t.staffOptionIncluded}
                      {opt === 'onRequest' && t.staffOptionOnRequest}
                    </label>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </Section>

      {/* Pricing */}
      <Section title={t.sectionPricing}>
        <div className="space-y-2">
          <Field label={t.baseRate}>
            <input
              type="number"
              min={0}
              value={form.pricing.nightlyRate}
              onChange={(e) => updateNested('pricing', { nightlyRate: e.target.value })}
              className="w-full  border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-800 px-3 py-2"
              disabled={form.pricing.priceOnRequest}
            />
          </Field>
          <p className="text-xs text-stone-500">{t.baseRateHelp}</p>
        </div>
        <Field label={t.minimumNights}>
          <input
            type="number"
            min={1}
            value={form.pricing.minimumNights}
            onChange={(e) => updateNested('pricing', { minimumNights: e.target.value })}
            className="w-full  border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-800 px-3 py-2 sm:max-w-[12rem]"
          />
        </Field>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={form.pricing.priceOnRequest}
            onChange={(e) => updateNested('pricing', { priceOnRequest: e.target.checked })}
            className="h-4 w-4 rounded border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-800"
          />
          <span>{t.priceOnRequest}</span>
        </label>

        {/* Seasonal pricing */}
        <div className="pt-4 mt-4 border-t border-stone-200">
          <h3 className="text-sm font-light text-stone-700 uppercase tracking-wide mb-1">
            {t.seasonalPricing}
          </h3>
          <p className="text-xs text-stone-500 mb-3">{t.seasonalPricingHelp}</p>
          <div className="space-y-3">
            {form.pricing.seasons.map((season, idx) => (
              <div
                key={idx}
                className=" border border-stone-200 p-3 space-y-2 bg-stone-50/50"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label={t.seasonName}>
                    <input
                      type="text"
                      value={season.name}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          pricing: {
                            ...p.pricing,
                            seasons: p.pricing.seasons.map((s, i) =>
                              i === idx ? { ...s, name: e.target.value } : s
                            ),
                          },
                        }))
                      }
                      className="w-full  border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-800 px-3 py-2"
                    />
                  </Field>
                  <Field label={t.nightlyRate}>
                    <input
                      type="number"
                      min={0}
                      value={season.nightlyRate}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          pricing: {
                            ...p.pricing,
                            seasons: p.pricing.seasons.map((s, i) =>
                              i === idx ? { ...s, nightlyRate: e.target.value } : s
                            ),
                          },
                        }))
                      }
                      className="w-full  border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-800 px-3 py-2"
                    />
                  </Field>
                  <Field label={t.seasonStart}>
                    <input
                      type="date"
                      value={season.startDate}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          pricing: {
                            ...p.pricing,
                            seasons: p.pricing.seasons.map((s, i) =>
                              i === idx ? { ...s, startDate: e.target.value } : s
                            ),
                          },
                        }))
                      }
                      className="w-full  border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-800 px-3 py-2"
                    />
                  </Field>
                  <Field label={t.seasonEnd}>
                    <input
                      type="date"
                      value={season.endDate}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          pricing: {
                            ...p.pricing,
                            seasons: p.pricing.seasons.map((s, i) =>
                              i === idx ? { ...s, endDate: e.target.value } : s
                            ),
                          },
                        }))
                      }
                      className="w-full  border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-800 px-3 py-2"
                    />
                  </Field>
                  <Field label={t.minimumNights}>
                    <input
                      type="number"
                      min={1}
                      value={season.minimumNights}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          pricing: {
                            ...p.pricing,
                            seasons: p.pricing.seasons.map((s, i) =>
                              i === idx ? { ...s, minimumNights: e.target.value } : s
                            ),
                          },
                        }))
                      }
                      className="w-full  border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-800 px-3 py-2 sm:max-w-[8rem]"
                    />
                  </Field>
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() =>
                      setForm((p) => ({
                        ...p,
                        pricing: {
                          ...p.pricing,
                          seasons: p.pricing.seasons.filter((_, i) => i !== idx),
                        },
                      }))
                    }
                    className="text-xs text-red-600 hover:text-red-700"
                  >
                    {t.removeSeason}
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                setForm((p) => ({
                  ...p,
                  pricing: {
                    ...p.pricing,
                    seasons: [
                      ...p.pricing.seasons,
                      { name: '', startDate: '', endDate: '', nightlyRate: '', minimumNights: '' },
                    ],
                  },
                }))
              }
              className="w-full  border border-dashed border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-800 py-2.5 text-sm text-stone-700 hover:bg-stone-50"
            >
              {t.addSeason}
            </button>
          </div>
        </div>
      </Section>

      {/* House Rules */}
      <Section title={t.sectionRules}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ToggleRow
            label={t.smokingAllowed}
            checked={form.houseRules.smokingAllowed}
            onChange={(v) => updateNested('houseRules', { smokingAllowed: v })}
          />
          <ToggleRow
            label={t.petsAllowed}
            checked={form.houseRules.petsAllowed}
            onChange={(v) => updateNested('houseRules', { petsAllowed: v })}
          />
          <ToggleRow
            label={t.eventsAllowed}
            checked={form.houseRules.eventsAllowed}
            onChange={(v) => updateNested('houseRules', { eventsAllowed: v })}
          />
          {form.houseRules.eventsAllowed && (
            <Field label={t.maxEventGuests}>
              <input
                type="number"
                min={0}
                value={form.houseRules.maxEventGuests}
                onChange={(e) => updateNested('houseRules', { maxEventGuests: e.target.value })}
                className="w-full  border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-800 px-3 py-2"
              />
            </Field>
          )}
        </div>
      </Section>

      {/* Contact Info */}
      <Section title={t.sectionContact}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label={t.hostName} error={hasFieldError('contactName') ? t.requiredField : undefined}>
            <input
              type="text"
              value={form.contactInfo.hostName}
              onChange={(e) => updateNested('contactInfo', { hostName: e.target.value })}
              className="w-full  border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-800 px-3 py-2"
              required
            />
          </Field>
          <Field label={t.email} error={hasFieldError('contactEmail') ? t.requiredField : undefined}>
            <input
              type="email"
              value={form.contactInfo.email}
              onChange={(e) => updateNested('contactInfo', { email: e.target.value })}
              className="w-full  border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-800 px-3 py-2"
              required
            />
          </Field>
          <Field label={t.phone}>
            <input
              type="tel"
              value={form.contactInfo.phone}
              onChange={(e) => updateNested('contactInfo', { phone: e.target.value })}
              className="w-full  border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-800 px-3 py-2"
            />
          </Field>
          <Field label={t.whatsapp}>
            <input
              type="tel"
              value={form.contactInfo.whatsapp}
              onChange={(e) => updateNested('contactInfo', { whatsapp: e.target.value })}
              className="w-full  border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-800 px-3 py-2"
            />
          </Field>
        </div>
      </Section>

      {submitError && (
        <div className=" bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm font-light">
          {submitError}
        </div>
      )}

      <button
        type="submit"
        disabled={submitState === 'submitting'}
        className="w-full bg-stone-800 text-white  py-3.5 font-light tracking-wide hover:bg-stone-900 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {submitState === 'submitting' ? t.submitting : t.submit}
      </button>
    </form>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white border border-stone-200 rounded-xs p-6 sm:p-7 space-y-4">
      <h2 className="text-lg font-light text-stone-900 tracking-wide pb-3 border-b border-stone-100">
        {title}
      </h2>
      {children}
    </section>
  )
}

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-light text-stone-700">{label}</span>
      {children}
      {error && <span className="text-xs text-red-600 font-light">{error}</span>}
    </label>
  )
}

/**
 * Wraps a native <select> with a custom chevron icon so the arrow sits a
 * predictable distance from the right edge regardless of the select's
 * width. Uses `appearance-none` to suppress the browser's default arrow.
 */
function SelectShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      {children}
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
    </div>
  )
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className="flex items-center gap-2 text-sm font-light text-stone-700 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-stone-300 accent-stone-800"
      />
      <span>{label}</span>
    </label>
  )
}
