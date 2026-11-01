/**
 * The homepage "The resort" band, as the site shipped it. Pre-fills the
 * Studio doc (scripts/seed-estate-band.ts) and stands in for any field left
 * empty there.
 */
export const ESTATE_BAND_ID = 'estateBand'

export const ESTATE_BAND_DEFAULTS = {
  eyebrow: { en: 'The resort', es: 'El resort' },
  title: {
    en: '7,000 acres, three Pete Dye courses, a world of its own',
    es: '7,000 acres, tres campos de Pete Dye, un mundo propio',
  },
  body: {
    en: 'Since 1974, Casa de Campo has brought together a marina, a world-renowned polo field, a stone-built village above the Chavón River, and a beach reserved for residents and their guests.',
    es: 'Desde 1974, Casa de Campo reúne una marina, un campo de polo de renombre mundial, un pueblo de piedra sobre el río Chavón y una playa reservada para residentes y sus invitados.',
  },
  button: {
    label: { en: 'Explore the resort', es: 'Explora el resort' },
    href: '/about',
  },
}
