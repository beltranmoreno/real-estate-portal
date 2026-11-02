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
  search: {
    label: 'Properties (search)',
    path: '/search',
    layout: 'single',
    eyebrow: { en: 'Properties', es: 'Propiedades' },
    title: { en: 'A private collection of exceptional villas.', es: 'Una colección privada de villas excepcionales.' },
    subtitle: {
      en: 'Discover a curated selection of luxury villas in Casa de Campo, each offering a distinctive expression of Caribbean living.',
      es: 'Descubre una selección curada de villas de lujo en Casa de Campo, cada una con una expresión única de la vida caribeña.',
    },
  },
  concierge: {
    label: 'Concierge',
    path: '/services/concierge',
    layout: 'single',
    eyebrow: { en: 'Concierge', es: 'Conserjería' },
    title: { en: 'Every Detail, Thoughtfully Considered', es: 'Cada Detalle, Cuidadosamente Pensado' },
    subtitle: {
      en: 'Thoughtfully curated experiences, personalized service, and every detail arranged with care throughout your stay.',
      es: 'Experiencias cuidadosamente seleccionadas, servicio personalizado y cada detalle atendido con dedicación para que disfrute una estancia completamente fluida y sin preocupaciones.',
    },
    primary: { label: { en: 'Discover Concierge Services', es: 'Explorar Servicios Concierge' }, href: '#services' },
  },
  restaurants: {
    label: 'Restaurants',
    path: '/restaurants',
    layout: 'single',
    eyebrow: { en: 'Restaurants', es: 'Restaurantes' },
    title: { en: 'A taste of\nCasa de Campo', es: 'Un sabor de\nCasa de Campo' },
    subtitle: {
      en: 'From leisurely lunches at Minitas to intimate dinners in Altos de Chavón, discover the restaurants, cafés and bars that make dining here part of the experience.',
      es: 'Desde almuerzos sin prisa en Minitas hasta cenas íntimas en Altos de Chavón, descubre los restaurantes, cafés y bares que hacen de cada comida parte de la experiencia.',
    },
  },
  golf: {
    label: 'Golf',
    path: '/courses',
    layout: 'single',
    eyebrow: { en: 'Golf', es: 'Golf' },
    title: { en: 'Where the Caribbean Meets the Game.', es: 'Donde el Caribe se Encuentra con el Juego' },
    subtitle: {
      en: 'Three championship courses. Endless ocean views. A golfing legacy unlike anywhere else in the Caribbean.\n\nHome to the legendary Teeth of the Dog and two additional Pete Dye masterpieces, Casa de Campo has become one of the world’s most celebrated golf destinations—where every round is defined by extraordinary scenery, thoughtful design, and unforgettable moments.',
      es: 'Tres campos de campeonato. Vistas infinitas al mar. Un legado de golf incomparable en el Caribe.\n\nHogar del legendario Teeth of the Dog y de otras dos obras maestras diseñadas por Pete Dye, Casa de Campo se ha consolidado como uno de los destinos de golf más prestigiosos del mundo, donde cada recorrido está definido por paisajes extraordinarios, diseño excepcional y momentos inolvidables.',
    },
  },
  activities: {
    label: 'Activities',
    path: '/info/activities',
    layout: 'single',
    eyebrow: { en: 'Active Lifestyle', es: 'Estilo de Vida Activo' },
    title: {
      en: 'Every Day, a New Way to Experience Casa de Campo',
      es: 'Cada Día, una Nueva Forma de Vivir Casa de Campo',
    },
    subtitle: {
      en: 'Whether your perfect day begins on the tennis court, aboard a fishing boat, on horseback, or exploring miles of tropical landscapes, Casa de Campo offers one of the Caribbean’s most complete collections of sporting and outdoor experiences. Designed for every generation and every level, each activity invites you to experience the destination in your own way.',
      es: 'Ya sea que tu día ideal comience en una cancha de tenis, a bordo de una embarcación, montando a caballo o recorriendo los paisajes tropicales del destino, Casa de Campo ofrece una de las propuestas deportivas y al aire libre más completas del Caribe. Diseñadas para todas las edades y niveles, cada experiencia invita a descubrir el destino a tu propio ritmo.',
    },
    primary: { label: { en: 'Explore Experiences', es: 'Descubrir Experiencias' }, href: '#experiences' },
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
    primary: { label: { en: 'Browse properties', es: 'Ver propiedades' }, href: '/search' },
    secondary: { label: { en: 'Get in touch', es: 'Contáctanos' }, href: '#contact' },
  },
  owners: {
    label: 'For owners',
    path: '/owners',
    layout: 'split',
    eyebrow: { en: 'For owners', es: 'Para propietarios' },
    title: { en: 'Your property, in trusted hands.', es: 'Tu propiedad, en manos de confianza.' },
    subtitle: {
      en: 'We manage a select portfolio of properties in Casa de Campo for rental and sale. With one dedicated point of contact, your property receives personal attention and consistent oversight from the very beginning.',
      es: 'Gestionamos una cartera selecta de propiedades en Casa de Campo para alquiler y venta. Con un único punto de contacto dedicado, tu propiedad recibe atención personal y una supervisión constante desde el primer día.',
    },
    primary: { label: { en: 'Start a conversation', es: 'Iniciar una conversación' }, href: '#contact' },
    secondary: { label: { en: 'How it works', es: 'Cómo funciona' }, href: '#how-it-works' },
  },
} satisfies Record<string, PageHeroDefaults>

export type PageHeroKey = keyof typeof PAGE_HEROES

/** Fixed Studio document id for a page's hero (no dots: those are private). */
export const pageHeroId = (key: PageHeroKey) => `pageHero-${key}`
