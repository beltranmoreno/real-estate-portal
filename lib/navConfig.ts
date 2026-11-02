type Bi = { en?: string | null; es?: string | null }
export interface ResortMenuItem {
  label: { en: string; es: string }
  href: string
}

/**
 * The Resort menu: the Casa de Campo page, then the resort guides from
 * Studio (in their menu order), then the fixed resort pages.
 */
export function resortMenuItems(guides: { slug: string; label: Bi }[]): ResortMenuItem[] {
  return [
    { label: { en: 'Casa de Campo', es: 'Casa de Campo' }, href: '/casa-de-campo' },
    ...guides.map((g) => {
      const en = g.label.en || g.label.es || g.slug
      return { label: { en, es: g.label.es || en }, href: `/casa-de-campo/${g.slug}` }
    }),
    { label: { en: 'Restaurants', es: 'Restaurantes' }, href: '/restaurants' },
    { label: { en: 'Golf Courses', es: 'Campos de Golf' }, href: '/courses' },
    { label: { en: 'Activities', es: 'Actividades' }, href: '/info/activities' },
  ]
}
