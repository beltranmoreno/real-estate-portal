/**
 * Per-service request forms for the concierge. Keyed by the Sanity
 * conciergeService slug. Every field is optional for the guest.
 *
 * A field with `column` is stored on the ServiceRequest column of that name
 * (so it drives the itinerary and lists); every other field is stored in
 * `ServiceRequest.details` under its `key`.
 *
 * A service with `legs` (airport transfers) shows a checkbox per leg and
 * creates one request per leg ticked, so arrival and departure are tracked
 * and confirmed separately.
 *
 * Services with no entry here keep the generic form (date / time / party
 * size from the service's scheduling mode in Sanity).
 *
 * Client-safe: no server imports.
 */

type L = { en: string; es: string }

export type ServiceFieldType = 'date' | 'time' | 'number' | 'text' | 'textarea' | 'select'
export type ServiceColumn = 'preferredDate' | 'endDate' | 'preferredTime' | 'partySize'

export interface ServiceField {
  key: string
  type: ServiceFieldType
  label: L
  column?: ServiceColumn
  placeholder?: L
  options?: Array<{ value: string; label: L }>
  /** Suggestions offered while typing (datalist). */
  suggestions?: string[]
  /** Half-width on desktop (pairs with its neighbour). */
  half?: boolean
}

export interface ServiceLeg {
  key: string
  label: L
  fields: ServiceField[]
}

export interface ServiceFormConfig {
  fields?: ServiceField[]
  legs?: ServiceLeg[]
  /** Hide the restaurant picker even if the service has it turned on. */
  hideVenue?: boolean
  /** Show the service's menu PDF (uploaded in Sanity) above the fields. */
  showMenu?: boolean
}

export type ServiceDetails = Record<string, string>

// ── Field builders ─────────────────────────────────────────────────────────

const date = (label: L = { en: 'Date', es: 'Fecha' }, column: ServiceColumn = 'preferredDate', key = 'date'): ServiceField => ({
  key,
  type: 'date',
  label,
  column,
  half: true,
})
// `column: null` keeps the value in `details` (e.g. an "until" time).
const time = (label: L = { en: 'Time', es: 'Hora' }, key = 'time', column: ServiceColumn | null = 'preferredTime'): ServiceField => ({
  key,
  type: 'time',
  label,
  column: column ?? undefined,
  half: true,
})
const text = (key: string, label: L, placeholder?: L, extra: Partial<ServiceField> = {}): ServiceField => ({
  key,
  type: 'text',
  label,
  placeholder,
  ...extra,
})
const count = (key: string, label: L, column?: ServiceColumn): ServiceField => ({
  key,
  type: 'number',
  label,
  column,
  half: true,
})

const people = (label: L = { en: 'Number of people', es: 'Número de personas' }) => count('people', label, 'partySize')
const passengers = () => count('passengers', { en: 'Passengers', es: 'Pasajeros' }, 'partySize')
const reservationName = () =>
  text('reservationName', { en: 'Reservation under', es: 'Reserva a nombre de' }, { en: 'Full name', es: 'Nombre completo' })
const children = () => count('children', { en: 'Number of children', es: 'Número de niños' })
const ages = () =>
  text('ages', { en: 'Ages of the children', es: 'Edades de los niños' }, { en: 'e.g. 4 and 7', es: 'ej. 4 y 7' }, { half: true })
const duration = (): ServiceField => ({
  key: 'duration',
  type: 'select',
  label: { en: 'Duration', es: 'Duración' },
  half: true,
  options: [30, 60, 90, 120].map((m) => ({ value: `${m} min`, label: { en: `${m} minutes`, es: `${m} minutos` } })),
})

const AIRPORTS = ['La Romana (LRM)', 'Punta Cana (PUJ)', 'Santo Domingo (SDQ)']
const flightFields = (): ServiceField[] => [
  text('airport', { en: 'Airport', es: 'Aeropuerto' }, { en: 'e.g. La Romana (LRM)', es: 'ej. La Romana (LRM)' }, { suggestions: AIRPORTS, half: true }),
  text('airline', { en: 'Airline', es: 'Aerolínea' }, undefined, { half: true }),
  text('flightNumber', { en: 'Flight number', es: 'Número de vuelo' }, { en: 'e.g. AA 1234', es: 'ej. AA 1234' }, { half: true }),
]

// ── Forms ─────────────────────────────────────────────────────────────────

const AIRPORT_TRANSFERS: ServiceFormConfig = {
  legs: [
    {
      key: 'arrival',
      label: { en: 'Arrival', es: 'Llegada' },
      fields: [
        date({ en: 'Arrival date', es: 'Fecha de llegada' }),
        time({ en: 'Landing time', es: 'Hora de llegada' }),
        ...flightFields(),
        passengers(),
      ],
    },
    {
      key: 'departure',
      label: { en: 'Departure', es: 'Salida' },
      fields: [
        date({ en: 'Departure date', es: 'Fecha de salida' }),
        time({ en: 'Flight time', es: 'Hora del vuelo' }, 'flightTime', null),
        ...flightFields(),
        time({ en: 'Pick-up time at the house', es: 'Hora de recogida en la casa' }, 'pickupTime'),
        passengers(),
      ],
    },
  ],
}

const SPA: ServiceFormConfig = {
  hideVenue: true,
  showMenu: true,
  fields: [
    text('serviceType', { en: 'Type of service', es: 'Tipo de servicio' }, { en: 'e.g. Deep-tissue massage — see the menu', es: 'ej. Masaje de tejido profundo — ver el menú' }),
    duration(),
    reservationName(),
    date(),
    time(),
  ],
}

const IN_VILLA_MASSAGE: ServiceFormConfig = {
  fields: [
    text('massageType', { en: 'Type of massage', es: 'Tipo de masaje' }, { en: 'e.g. Relaxing, deep tissue', es: 'ej. Relajante, tejido profundo' }),
    duration(),
    date(),
    time(),
  ],
}

const SERVICE_FORMS: Record<string, ServiceFormConfig> = {
  'airport-transfers': AIRPORT_TRANSFERS,
  'private-chauffeur': {
    fields: [
      text('pickup', { en: 'Pick-up place', es: 'Lugar de recogida' }, undefined, { half: true }),
      text('destination', { en: 'Destination', es: 'Destino' }, undefined, { half: true }),
      date(),
      passengers(),
      time({ en: 'From', es: 'Desde' }),
      time({ en: 'Until', es: 'Hasta' }, 'timeUntil', null),
    ],
  },
  'rent-a-car': {
    fields: [date({ en: 'Start date', es: 'Fecha de inicio' }), date({ en: 'End date', es: 'Fecha de fin' }, 'endDate', 'endDate')],
  },
  'golf-carts': {
    fields: [
      {
        key: 'cartSize',
        type: 'select',
        label: { en: 'Cart size', es: 'Tamaño del carrito' },
        half: true,
        options: [
          { value: '4 seats', label: { en: '4 passengers', es: '4 pasajeros' } },
          { value: '6 seats', label: { en: '6 passengers', es: '6 pasajeros' } },
        ],
      },
      count('quantity', { en: 'How many carts', es: 'Cuántos carritos' }),
      date({ en: 'From', es: 'Desde' }),
      date({ en: 'Until', es: 'Hasta' }, 'endDate', 'endDate'),
    ],
  },
  // Only notes — no date.
  // Guests choose from the grocery menu PDF uploaded in Studio; the team
  // buys accordingly. No date (it's stocked before arrival).
  'grocery-pre-stocking': {
    showMenu: true,
    fields: [
      {
        key: 'selection',
        type: 'textarea',
        label: { en: 'Your selection', es: 'Tu selección' },
        placeholder: { en: 'What you’d like from the menu, and how much', es: 'Lo que te gustaría del menú, y cuánto' },
      },
    ],
  },
  'nanny-services': {
    fields: [date(), children(), time({ en: 'From', es: 'Desde' }), time({ en: 'Until', es: 'Hasta' }, 'timeUntil', null), ages()],
  },
  'kids-club': {
    fields: [
      text('activity', { en: 'Type of activity', es: 'Tipo de actividad' }),
      date(),
      children(),
      ages(),
    ],
  },
  'wine-champagne': {
    showMenu: true,
    fields: [
      {
        key: 'selection',
        type: 'textarea',
        label: { en: 'Your selection', es: 'Tu selección' },
        placeholder: { en: 'Bottles and quantities from the menu', es: 'Botellas y cantidades del menú' },
      },
      date({ en: 'Delivery date', es: 'Fecha de entrega' }),
    ],
  },
  'boat-experiences': {
    fields: [
      text('beach', { en: 'Beach', es: 'Playa' }, { en: 'e.g. Isla Catalina, Isla Saona', es: 'ej. Isla Catalina, Isla Saona' }),
      date(),
      people({ en: 'Guests', es: 'Personas' }),
      time({ en: 'Pick-up time', es: 'Hora de recogida' }),
      time({ en: 'Return time', es: 'Hora de regreso' }, 'returnTime', null),
    ],
  },
  'private-photography': { fields: [date(), time()] },
  'active-lifestyle': {
    fields: [
      text('activity', { en: 'Activity', es: 'Actividad' }, { en: 'e.g. Tennis, padel, horseback riding', es: 'ej. Tenis, pádel, equitación' }),
      reservationName(),
      date(),
      time(),
    ],
  },
  'casa-de-campo-spa': SPA,
  'beauty-services': {
    fields: [
      text('serviceType', { en: 'Type of service', es: 'Tipo de servicio' }, { en: 'e.g. Hair, nails, make-up', es: 'ej. Peinado, uñas, maquillaje' }),
      date(),
      time(),
    ],
  },
  'in-villa-massages': IN_VILLA_MASSAGE,
  'in-villa-pilates-yoga': { fields: [date(), time(), people()] },
  'private-dining': {
    fields: [
      date(),
      time(),
      people(),
      text('celebration', { en: 'Type of celebration', es: 'Tipo de celebración' }, { en: 'e.g. Birthday, anniversary', es: 'ej. Cumpleaños, aniversario' }, { half: true }),
    ],
  },
}

// Older catalog entries for the same services.
const ALIASES: Record<string, string> = {
  'airport-transfer': 'airport-transfers',
  'private-driver': 'private-chauffeur',
  'car-rental': 'rent-a-car',
  'golf-cart-rental': 'golf-carts',
  'pre-arrival-grocery': 'grocery-pre-stocking',
  'babysitter-nanny': 'nanny-services',
  'kids-activities': 'kids-club',
  'wine-champagne-stocking': 'wine-champagne',
  'yacht-charter': 'boat-experiences',
  'in-villa-massage': 'in-villa-massages',
}

export function getServiceForm(slug: string | null | undefined): ServiceFormConfig | null {
  if (!slug) return null
  return SERVICE_FORMS[slug] ?? SERVICE_FORMS[ALIASES[slug] ?? ''] ?? null
}

/** Every field a config can show (all legs flattened). */
function allFields(config: ServiceFormConfig, leg?: string | null): ServiceField[] {
  if (config.legs) return (config.legs.find((l) => l.key === leg) ?? config.legs[0]).fields
  return config.fields ?? []
}

/**
 * Split form values into the ServiceRequest columns and `details`. Blank
 * values are dropped.
 */
export function splitServiceValues(
  fields: ServiceField[],
  values: ServiceDetails
): { columns: Partial<Record<ServiceColumn, string>>; details: ServiceDetails } {
  const columns: Partial<Record<ServiceColumn, string>> = {}
  const details: ServiceDetails = {}
  for (const f of fields) {
    const v = values[f.key]?.trim()
    if (!v) continue
    if (f.column) columns[f.column] = v
    else details[f.key] = v
  }
  return { columns, details }
}

/** Readable "label: value" lines for a request's details. */
export function serviceDetailLines(
  slug: string | null | undefined,
  details: unknown,
  locale: 'en' | 'es'
): Array<{ label: string; value: string }> {
  if (!details || typeof details !== 'object' || Array.isArray(details)) return []
  const d = details as Record<string, unknown>
  const config = getServiceForm(slug)
  const fields = config ? allFields(config, typeof d.leg === 'string' ? d.leg : null) : []
  const lines: Array<{ label: string; value: string }> = []
  const seen = new Set(['leg'])

  for (const f of fields) {
    const raw = d[f.key]
    if (raw === undefined || raw === null || raw === '') continue
    seen.add(f.key)
    let value = String(raw)
    if (f.type === 'select') value = f.options?.find((o) => o.value === value)?.label[locale] ?? value
    if (f.type === 'time') value = formatHHmm(value)
    lines.push({ label: f.label[locale], value })
  }
  // Anything not in the current form (renamed fields, older data).
  for (const [k, raw] of Object.entries(d)) {
    if (seen.has(k) || raw === undefined || raw === null || raw === '') continue
    lines.push({ label: k, value: String(raw) })
  }
  return lines
}

/** The leg label ("Arrival") for a request created from a legged form. */
export function serviceLegLabel(slug: string | null | undefined, details: unknown, locale: 'en' | 'es'): string | null {
  const leg = details && typeof details === 'object' ? (details as Record<string, unknown>).leg : null
  if (typeof leg !== 'string') return null
  return getServiceForm(slug)?.legs?.find((l) => l.key === leg)?.label[locale] ?? null
}

function formatHHmm(value: string): string {
  const m = /^(\d{1,2}):(\d{2})$/.exec(value.trim())
  if (!m) return value
  let h = parseInt(m[1], 10)
  const ampm = h >= 12 ? 'PM' : 'AM'
  h = h % 12 || 12
  return `${h}:${m[2]} ${ampm}`
}

/**
 * Form state → one payload per request to create: one for a plain form, one
 * per leg ticked for a legged form (none ticked → one request, no leg).
 */
export function serviceRequestPayloads(
  config: ServiceFormConfig,
  values: Record<string, ServiceDetails>,
  legsOn: string[]
): Array<{ columns: Partial<Record<ServiceColumn, string>>; details: ServiceDetails }> {
  if (config.legs) {
    const legs = config.legs.filter((l) => legsOn.includes(l.key))
    if (legs.length === 0) return [{ columns: {}, details: {} }]
    return legs.map((leg) => {
      const { columns, details } = splitServiceValues(leg.fields, values[leg.key] ?? {})
      return { columns, details: { leg: leg.key, ...details } }
    })
  }
  return [splitServiceValues(config.fields ?? [], values.main ?? {})]
}

/** Server-side tidy-up of submitted details: strings only, trimmed, capped. Null when empty. */
export function cleanServiceDetails(raw: unknown): ServiceDetails | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  const out: ServiceDetails = {}
  for (const [k, v] of Object.entries(raw as Record<string, unknown>).slice(0, 40)) {
    if (!/^[a-zA-Z][a-zA-Z0-9_]{0,40}$/.test(k)) continue
    if (typeof v !== 'string' && typeof v !== 'number') continue
    const s = String(v).trim().slice(0, 1000)
    if (s) out[k] = s
  }
  return Object.keys(out).length > 0 ? out : null
}

/** The request's display name, with the leg when there is one ("Airport Transfers · Arrival"). */
export function serviceNameWithLeg(name: string, slug: string | null | undefined, details: unknown, locale: 'en' | 'es') {
  const leg = serviceLegLabel(slug, details, locale)
  return leg ? `${name} · ${leg}` : name
}
