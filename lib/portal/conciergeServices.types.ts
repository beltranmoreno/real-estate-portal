/**
 * Client-safe types and constants for the concierge catalog.
 * The actual Sanity fetchers live in `conciergeServices.ts` (server-only).
 */

export interface ConciergeServiceOption {
  _id: string
  slug: string | null
  name_en: string | null
  name_es: string | null
  shortDescription_en: string | null
  shortDescription_es: string | null
  category: string | null
  icon: string | null
  isFeatured?: boolean
  priceFrom?: {
    amount?: number
    currency?: string
    unit?: string
  } | null
}

export const CATEGORY_LABELS: Record<
  string,
  { en: string; es: string }
> = {
  transport: { en: 'Transport & Transfers', es: 'Transporte y Traslados' },
  food: { en: 'Food & Beverage', es: 'Comida y Bebida' },
  experiences: { en: 'Experiences & Activities', es: 'Experiencias y Actividades' },
  home: { en: 'Home & Lifestyle', es: 'Hogar y Estilo de Vida' },
  wellness: { en: 'Wellness & Family', es: 'Bienestar y Familia' },
}
