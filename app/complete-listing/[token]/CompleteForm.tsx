'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { completionTranslations, type Locale } from './translations'

interface InitialProperty {
  propertyType: string
  description_es: string
  description_en: string
  amenities: Record<string, any>
  pricing: Record<string, any>
  location: Record<string, any>
  houseRules: Record<string, any>
  contactInfo: Record<string, any>
}

interface FormState {
  propertyType: string
  description_es: string
  description_en: string
  amenities: Record<string, any>
  pricing: {
    nightlyRate: string
    minimumNights: string
    priceOnRequest: boolean
  }
  location: {
    address_en: string
    address_es: string
  }
  houseRules: {
    smokingAllowed: boolean
    petsAllowed: boolean
    eventsAllowed: boolean
    maxEventGuests: string
    quietHoursStart: string
    quietHoursEnd: string
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

  return {
    propertyType: pick(draft.propertyType, property.propertyType) || '',
    description_es: pick(draft.description_es, property.description_es) || '',
    description_en: pick(draft.description_en, property.description_en) || '',
    amenities: {
      ...property.amenities,
      ...(draft.amenities ?? {}),
    },
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
    },
    location: {
      address_en: pick(draft?.location?.address_en, property.location?.address_en) || '',
      address_es: pick(draft?.location?.address_es, property.location?.address_es) || '',
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
      quietHoursStart:
        pick(draft?.houseRules?.quietHoursStart, property.houseRules?.quietHoursStart) || '',
      quietHoursEnd:
        pick(draft?.houseRules?.quietHoursEnd, property.houseRules?.quietHoursEnd) || '',
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

const PROPERTY_TYPES = ['villa', 'apartment', 'condo', 'house', 'penthouse', 'townhouse', 'studio', 'loft'] as const

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
      { key: 'hasHousekeeping', en: 'Housekeeping', es: 'Limpieza' },
      { key: 'hasHousekeeper', en: 'Dedicated housekeeper', es: 'Ama de llaves' },
      { key: 'hasChef', en: 'Private chef', es: 'Chef privado' },
      { key: 'hasCook', en: 'Cook', es: 'Cocinero(a)' },
      { key: 'hasButler', en: 'Butler', es: 'Mayordomo' },
      { key: 'hasConcierge', en: 'Concierge', es: 'Concierge' },
      { key: 'hasSecurity', en: 'Security', es: 'Seguridad' },
      { key: 'hasSecuritySystem', en: 'Security system', es: 'Sistema de seguridad' },
      { key: 'hasGatedCommunity', en: 'Gated community', es: 'Comunidad cerrada' },
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
    groupKey: 'premium',
    items: [
      { key: 'hasGolfCart', en: 'Golf cart included', es: 'Carrito de golf incluido' },
      { key: 'hasGenerator', en: 'Backup generator', es: 'Generador de respaldo' },
      { key: 'hasGym', en: 'Gym', es: 'Gimnasio' },
      { key: 'hasElevator', en: 'Elevator', es: 'Ascensor' },
      { key: 'isWheelchairAccessible', en: 'Wheelchair accessible', es: 'Accesible en silla de ruedas' },
    ],
  },
]

export function CompleteListingForm({
  token,
  locale,
  initialProperty,
  initialDraft,
  lastSavedAt: initialLastSavedAt,
}: {
  token: string
  locale: Locale
  initialProperty: InitialProperty
  initialDraft: Record<string, any>
  lastSavedAt?: string
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
      <div className="bg-white rounded-2xl border border-neutral-200 p-8 text-center">
        <h2 className="text-2xl font-semibold mb-3">{t.completedTitle}</h2>
        <p className="text-neutral-600">{t.completedBody}</p>
      </div>
    )
  }

  const hasFieldError = (field: string) => fieldErrors.includes(field)

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Save indicator */}
      <div className="h-5 text-sm text-neutral-500">{lastSavedLabel}</div>

      {/* Basics */}
      <Section title={t.sectionBasics}>
        <Field label={t.propertyType} error={hasFieldError('propertyType') ? t.requiredField : undefined}>
          <select
            value={form.propertyType}
            onChange={(e) => updateField('propertyType', e.target.value)}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2"
          >
            <option value="">{t.propertyTypePlaceholder}</option>
            {PROPERTY_TYPES.map((type) => (
              <option key={type} value={type}>
                {t.propertyTypeOptions[type]}
              </option>
            ))}
          </select>
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
              className="w-full rounded-lg border border-neutral-300 px-3 py-2"
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
              className="w-full rounded-lg border border-neutral-300 px-3 py-2"
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
              className="w-full rounded-lg border border-neutral-300 px-3 py-2"
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
              className="w-full rounded-lg border border-neutral-300 px-3 py-2"
            />
          </Field>
        </div>
      </Section>

      {/* Description */}
      <Section title={t.sectionDescription}>
        <p className="text-sm text-neutral-500">{t.descriptionHelp}</p>
        <Field label={t.descriptionEn}>
          <textarea
            rows={5}
            value={form.description_en}
            onChange={(e) => updateField('description_en', e.target.value)}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2"
          />
        </Field>
        <Field label={t.descriptionEs}>
          <textarea
            rows={5}
            value={form.description_es}
            onChange={(e) => updateField('description_es', e.target.value)}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2"
          />
        </Field>
      </Section>

      {/* Location */}
      <Section title={t.sectionLocation}>
        <Field label={t.addressEn}>
          <input
            type="text"
            value={form.location.address_en}
            onChange={(e) => updateNested('location', { address_en: e.target.value })}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2"
          />
        </Field>
        <Field label={t.addressEs}>
          <input
            type="text"
            value={form.location.address_es}
            onChange={(e) => updateNested('location', { address_es: e.target.value })}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2"
          />
        </Field>
      </Section>

      {/* Amenity checkboxes */}
      <Section title={t.sectionAmenities}>
        <div className="space-y-6">
          {AMENITY_GROUPS.map((group) => (
            <div key={group.groupKey}>
              <h3 className="text-sm font-semibold text-neutral-700 uppercase tracking-wide mb-2">
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
                      className="h-4 w-4 rounded border-neutral-300"
                    />
                    <span>{locale === 'es' ? item.es : item.en}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Pricing */}
      <Section title={t.sectionPricing}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label={t.nightlyRate}>
            <input
              type="number"
              min={0}
              value={form.pricing.nightlyRate}
              onChange={(e) => updateNested('pricing', { nightlyRate: e.target.value })}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2"
              disabled={form.pricing.priceOnRequest}
            />
          </Field>
          <Field label={t.minimumNights}>
            <input
              type="number"
              min={1}
              value={form.pricing.minimumNights}
              onChange={(e) => updateNested('pricing', { minimumNights: e.target.value })}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2"
            />
          </Field>
        </div>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={form.pricing.priceOnRequest}
            onChange={(e) => updateNested('pricing', { priceOnRequest: e.target.checked })}
            className="h-4 w-4 rounded border-neutral-300"
          />
          <span>{t.priceOnRequest}</span>
        </label>
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
                className="w-full rounded-lg border border-neutral-300 px-3 py-2"
              />
            </Field>
          )}
          <Field label={t.quietHoursStart}>
            <input
              type="time"
              value={form.houseRules.quietHoursStart}
              onChange={(e) => updateNested('houseRules', { quietHoursStart: e.target.value })}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2"
            />
          </Field>
          <Field label={t.quietHoursEnd}>
            <input
              type="time"
              value={form.houseRules.quietHoursEnd}
              onChange={(e) => updateNested('houseRules', { quietHoursEnd: e.target.value })}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2"
            />
          </Field>
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
              className="w-full rounded-lg border border-neutral-300 px-3 py-2"
              required
            />
          </Field>
          <Field label={t.email} error={hasFieldError('contactEmail') ? t.requiredField : undefined}>
            <input
              type="email"
              value={form.contactInfo.email}
              onChange={(e) => updateNested('contactInfo', { email: e.target.value })}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2"
              required
            />
          </Field>
          <Field label={t.phone}>
            <input
              type="tel"
              value={form.contactInfo.phone}
              onChange={(e) => updateNested('contactInfo', { phone: e.target.value })}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2"
            />
          </Field>
          <Field label={t.whatsapp}>
            <input
              type="tel"
              value={form.contactInfo.whatsapp}
              onChange={(e) => updateNested('contactInfo', { whatsapp: e.target.value })}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2"
            />
          </Field>
        </div>
      </Section>

      {submitError && (
        <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
          {submitError}
        </div>
      )}

      <button
        type="submit"
        disabled={submitState === 'submitting'}
        className="w-full bg-neutral-900 text-white rounded-xl py-3 font-medium hover:bg-neutral-800 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {submitState === 'submitting' ? t.submitting : t.submit}
      </button>
    </form>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-4">
      <h2 className="text-lg font-semibold">{title}</h2>
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
      <span className="text-sm font-medium text-neutral-700">{label}</span>
      {children}
      {error && <span className="text-xs text-red-600">{error}</span>}
    </label>
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
    <label className="flex items-center gap-2 text-sm cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-neutral-300"
      />
      <span>{label}</span>
    </label>
  )
}
