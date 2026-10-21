/**
 * The pages whose hero is editable in Studio (Page Heroes), with the copy the
 * site shipped with. Used to pre-fill the Studio docs and as the fallback
 * when a page has no doc yet.
 *
 * In titles, wrap words in *asterisks* to set them in italic.
 */
export type Bi = { en: string; es: string }

export interface PageHeroDefaults {
  /** Studio label */
  label: string
  /** Where the page lives, for editors */
  path: string
  /** single = headline stack; split = headline beside the intro (About, Owners) */
  layout: 'single' | 'split'
  eyebrow: Bi
  title: Bi
  subtitle: Bi
  primary?: { label: Bi; href: string }
  secondary?: { label: Bi; href: string }
}

export const PAGE_HEROES = {
  concierge: {
    label: 'Concierge',
    path: '/services/concierge',
    layout: 'single',
    eyebrow: { en: 'Concierge', es: 'Conserjería' },
    title: { en: 'Add anything you need *to your stay.*', es: 'Agrega lo que necesites *a tu estadía.*' },
    subtitle: {
      en: 'When you rent with us, you can add a personal concierge to your stay. The supermarket run, the airport pickup, the dinner reservation, the Sunday excursion — pick what you need and we will arrange it. Get in touch for more information, or to request a concierge service.',
      es: 'Cuando alquilas con nosotros, puedes agregar una conserjería personal a tu estadía. La compra del supermercado, el traslado al aeropuerto, la reserva de cena, la excursión del domingo — elige lo que necesitas y lo coordinamos. Escríbenos para más información o para solicitar un servicio de conserjería.',
    },
    primary: { label: { en: 'Request a service', es: 'Solicitar un servicio' }, href: 'https://wa.me/18293422566' },
    secondary: { label: { en: 'Send a message', es: 'Enviar un mensaje' }, href: '/contact' },
  },
  restaurants: {
    label: 'Restaurants',
    path: '/restaurants',
    layout: 'single',
    eyebrow: { en: 'Restaurants', es: 'Restaurantes' },
    title: { en: 'The tables worth booking.', es: 'Las mesas que vale la pena reservar.' },
    subtitle: {
      en: 'Every restaurant, café and bar inside Casa de Campo — from long lunches on Minitas to late nights in Altos de Chavón — and the ones we book for our guests.',
      es: 'Todos los restaurantes, cafés y bares de Casa de Campo — desde largos almuerzos en Minitas hasta noches en Altos de Chavón — y los que reservamos para nuestros huéspedes.',
    },
  },
  golf: {
    label: 'Golf',
    path: '/courses',
    layout: 'single',
    eyebrow: { en: 'Golf', es: 'Golf' },
    title: { en: 'Championship rounds, *walking distance.*', es: 'Vueltas de campeonato, *a pasos de casa.*' },
    subtitle: {
      en: "Casa de Campo is home to three of the Caribbean's most celebrated courses. Tee times, caddies, and lessons — all arranged by us.",
      es: 'Casa de Campo alberga tres de los campos más reconocidos del Caribe. Tee times, caddies y lecciones — todo lo coordinamos nosotros.',
    },
  },
  contact: {
    label: 'Contact',
    path: '/contact',
    layout: 'single',
    eyebrow: { en: 'Contact', es: 'Contacto' },
    title: { en: "Let's find your *perfect home.*", es: 'Encontremos tu *casa ideal.*' },
    subtitle: {
      en: 'Send us a message and we will get back to you within 24 hours. Tell us what you have in mind — we will start there.',
      es: 'Envíanos un mensaje y te responderemos en 24 horas. Cuéntanos qué tienes en mente — empezamos por ahí.',
    },
  },
  about: {
    label: 'About',
    path: '/about',
    layout: 'split',
    eyebrow: { en: 'About', es: 'Acerca de' },
    title: { en: 'Caribbean luxury, personally curated.', es: 'Lujo caribeño, personalmente curado.' },
    subtitle: {
      en: 'A boutique real estate practice rooted in Casa de Campo. We represent a small, hand-selected portfolio of homes — and the families who own and visit them.',
      es: 'Una práctica inmobiliaria boutique con raíces en Casa de Campo. Representamos una cartera pequeña y cuidadosamente seleccionada de propiedades — y las familias que las habitan y las visitan.',
    },
    primary: { label: { en: 'Browse residences', es: 'Ver residencias' }, href: '/search' },
    secondary: { label: { en: 'Get in touch', es: 'Contáctanos' }, href: '#contact' },
  },
  owners: {
    label: 'For owners',
    path: '/owners',
    layout: 'split',
    eyebrow: { en: 'For owners', es: 'Para propietarios' },
    title: { en: 'Your house, represented properly.', es: 'Tu casa, bien representada.' },
    subtitle: {
      en: 'We look after a small, hand-picked portfolio of villas in Casa de Campo — for rent, for sale, or both. One person is accountable for your house, from the first conversation onward.',
      es: 'Cuidamos una cartera pequeña y seleccionada de villas en Casa de Campo — en alquiler, en venta, o ambas. Una sola persona responde por tu casa, desde la primera conversación.',
    },
    primary: { label: { en: 'Start a conversation', es: 'Iniciar una conversación' }, href: '#contact' },
    secondary: { label: { en: 'How it works', es: 'Cómo funciona' }, href: '#how-it-works' },
  },
} satisfies Record<string, PageHeroDefaults>

export type PageHeroKey = keyof typeof PAGE_HEROES

/** Fixed Studio document id for a page's hero (no dots: those are private). */
export const pageHeroId = (key: PageHeroKey) => `pageHero-${key}`
