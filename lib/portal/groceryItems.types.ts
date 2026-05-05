/**
 * Client-safe types and constants for the grocery / drinks catalog.
 * The Sanity fetchers live in `groceryItems.ts` (server-only).
 */

export interface GroceryItemOption {
  _id: string
  slug: string | null
  name_en: string | null
  name_es: string | null
  category: string | null
  defaultUnit: string | null
  brand: string | null
  shopperNote_en: string | null
  shopperNote_es: string | null
  isPopular?: boolean
}

/**
 * One line on a grocery request — what the renter actually selected.
 * Snapshotted onto `ServiceRequest.groceryItems` (Json) at submission.
 * Keeping the ES + EN names + slug here means the admin sees the
 * locale they prefer and we can resolve back to the catalog if the
 * editor renamed an item.
 */
export interface GroceryLineItem {
  slug: string | null
  name_en: string | null
  name_es: string | null
  category: string | null
  brand: string | null
  qty: number
  unit: string | null
  note: string | null
}

export const GROCERY_CATEGORY_LABELS: Record<
  string,
  { en: string; es: string; emoji: string }
> = {
  produce: { en: 'Fresh produce', es: 'Frutas y verduras', emoji: '🥬' },
  dairy: { en: 'Dairy & eggs', es: 'Lácteos y huevos', emoji: '🥚' },
  meat: { en: 'Meat & poultry', es: 'Carnes y aves', emoji: '🥩' },
  seafood: { en: 'Seafood', es: 'Mariscos', emoji: '🦐' },
  bakery: { en: 'Bakery', es: 'Panadería', emoji: '🥐' },
  pantry: { en: 'Pantry & dry goods', es: 'Despensa', emoji: '🥫' },
  frozen: { en: 'Frozen', es: 'Congelados', emoji: '🧊' },
  snacks: { en: 'Snacks & sweets', es: 'Snacks y dulces', emoji: '🍫' },
  beverages_nonalcoholic: {
    en: 'Non-alcoholic drinks',
    es: 'Bebidas sin alcohol',
    emoji: '🥤',
  },
  beer: { en: 'Beer', es: 'Cerveza', emoji: '🍺' },
  wine: { en: 'Wine', es: 'Vino', emoji: '🍷' },
  spirits: { en: 'Spirits', es: 'Licores', emoji: '🥃' },
  mixers: { en: 'Mixers & bar', es: 'Mezcladores y bar', emoji: '🍹' },
  household: { en: 'Household & cleaning', es: 'Hogar y limpieza', emoji: '🧴' },
  personal_care: { en: 'Personal care', es: 'Cuidado personal', emoji: '🪥' },
  baby: { en: 'Baby', es: 'Bebé', emoji: '🍼' },
  pet: { en: 'Pet', es: 'Mascotas', emoji: '🐾' },
}

/**
 * Display order for category sections. Categories not in this list
 * fall to the bottom alphabetically.
 */
export const GROCERY_CATEGORY_ORDER = [
  'produce',
  'dairy',
  'meat',
  'seafood',
  'bakery',
  'pantry',
  'frozen',
  'snacks',
  'beverages_nonalcoholic',
  'beer',
  'wine',
  'spirits',
  'mixers',
  'household',
  'personal_care',
  'baby',
  'pet',
]
