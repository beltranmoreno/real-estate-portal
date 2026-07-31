import type { RequestKind } from '@prisma/client'

/**
 * Catalog of preset request templates. Lives in code (not the DB) so
 * editing copy is a code change — easier to iterate than a CMS table.
 *
 * `expectsDocument: true` means the request expects a file upload; false
 * means a text response is enough (e.g. dietary preferences).
 *
 * Custom requests bypass this and let the admin type their own
 * title/description. They're modeled with `RequestKind.CUSTOM`.
 */
interface PresetDefinition {
  kind: RequestKind
  expectsDocument: boolean
  label: { en: string; es: string }
  description: { en: string; es: string }
}

export const REQUEST_PRESETS: Record<Exclude<RequestKind, 'CUSTOM'>, PresetDefinition> = {
  // -------------------- Document presets --------------------
  PASSPORT: {
    kind: 'PASSPORT',
    expectsDocument: true,
    label: { en: 'Passport copy', es: 'Copia del pasaporte' },
    description: {
      en: 'A clear photo or scan of the passport main page, for each guest.',
      es: 'Foto o escaneo claro de la página principal del pasaporte, para cada huésped.',
    },
  },
  RENTAL_CONTRACT: {
    kind: 'RENTAL_CONTRACT',
    expectsDocument: true,
    label: { en: 'Signed rental contract', es: 'Contrato de alquiler firmado' },
    description: {
      en: 'Please review the contract, sign it, and upload the signed copy.',
      es: 'Por favor revisa el contrato, fírmalo y sube la copia firmada.',
    },
  },
  DEPOSIT_RECEIPT: {
    kind: 'DEPOSIT_RECEIPT',
    expectsDocument: true,
    label: { en: 'Deposit transfer receipt', es: 'Comprobante del depósito' },
    description: {
      en: 'Wire-transfer or payment receipt confirming the security deposit.',
      es: 'Comprobante de transferencia o pago confirmando el depósito de seguridad.',
    },
  },
  ID_PHOTO: {
    kind: 'ID_PHOTO',
    expectsDocument: true,
    label: { en: 'Photo ID', es: 'Identificación con foto' },
    description: {
      en: 'A government-issued ID with photo (driver\'s license, national ID).',
      es: 'Identificación oficial con foto (licencia de conducir, cédula).',
    },
  },
  TRAVEL_INSURANCE: {
    kind: 'TRAVEL_INSURANCE',
    expectsDocument: true,
    label: { en: 'Travel insurance', es: 'Seguro de viaje' },
    description: {
      en: 'Proof of travel insurance covering the dates of your stay.',
      es: 'Prueba de seguro de viaje que cubra las fechas de tu estadía.',
    },
  },
  PET_DOCUMENTATION: {
    kind: 'PET_DOCUMENTATION',
    expectsDocument: true,
    label: { en: 'Pet documentation', es: 'Documentación de mascota' },
    description: {
      en: 'Vaccination certificates and any other paperwork for pets staying at the property.',
      es: 'Certificados de vacunación y demás documentos para las mascotas que se hospedan.',
    },
  },

  // -------------------- Information presets --------------------
  ARRIVAL_DETAILS: {
    kind: 'ARRIVAL_DETAILS',
    expectsDocument: false,
    label: { en: 'Arrival details', es: 'Detalles de llegada' },
    description: {
      en: 'Flight number, arrival airport, arrival time, and any transfer needs.',
      es: 'Número de vuelo, aeropuerto de llegada, hora y necesidades de traslado.',
    },
  },
  GUEST_LIST: {
    kind: 'GUEST_LIST',
    expectsDocument: false,
    label: { en: 'Guest list', es: 'Lista de huéspedes' },
    description: {
      en: 'Full names of every guest staying at the property, including children.',
      es: 'Nombres completos de cada huésped que se hospedará, incluyendo niños.',
    },
  },
  DIETARY_PREFERENCES: {
    kind: 'DIETARY_PREFERENCES',
    expectsDocument: false,
    label: { en: 'Dietary preferences', es: 'Preferencias alimentarias' },
    description: {
      en: 'Any allergies, dietary restrictions, or food preferences for grocery stocking and chef arrangements.',
      es: 'Alergias, restricciones alimentarias o preferencias para la compra del supermercado y servicios de chef.',
    },
  },
  SERVICE_PREFERENCES: {
    kind: 'SERVICE_PREFERENCES',
    expectsDocument: false,
    label: { en: 'Service preferences', es: 'Preferencias de servicio' },
    description: {
      en: 'Any concierge services you\'d like arranged ahead of arrival (transfers, golf cart, chef, etc.).',
      es: 'Servicios de conserjería que quisieras coordinar antes de tu llegada (traslados, carrito de golf, chef, etc.).',
    },
  },
}

/** Convenience array for dropdowns. Custom is appended separately in the UI. */
export const PRESET_LIST = Object.values(REQUEST_PRESETS)

export function getPreset(kind: RequestKind): PresetDefinition | null {
  if (kind === 'CUSTOM') return null
  return REQUEST_PRESETS[kind] ?? null
}
