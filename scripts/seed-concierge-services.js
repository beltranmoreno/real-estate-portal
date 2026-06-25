/**
 * Seed concierge services into Sanity.
 *
 * Content source: "Concierge - Final texts - CONCIERGE" (Leticia, 2026).
 * Each service is a simple grid card: name + the editorial paragraph as the
 * blurb. The accompanying headlines and CTA labels from that document are not
 * used here (cards-only layout).
 *
 * Usage:
 *   yarn seed-concierge          # creates missing, leaves existing alone
 *   yarn seed-concierge --force  # overwrites existing service docs
 *
 * Either way, any active conciergeService whose slug is NOT in the list below
 * is deactivated (isActive=false) so the live grid matches this document.
 */
const { createClient } = require('@sanity/client')
const path = require('path')
const dotenv = require('dotenv')

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const force = process.argv.includes('--force')

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'development',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
  apiVersion: '2025-09-06',
})

if (!process.env.SANITY_API_WRITE_TOKEN) {
  console.error('Missing SANITY_API_WRITE_TOKEN in .env.local')
  process.exit(1)
}

const SERVICES = [
  // ───────────────── 1. Arrival & Essentials ─────────────────
  {
    slug: 'airport-transfers',
    icon: 'plane',
    category: 'arrival',
    isFeatured: true,
    name_en: 'Airport Transfers',
    name_es: 'Traslados al Aeropuerto',
    shortDescription_en:
      'From the moment you land, every detail is taken care of. Enjoy a seamless transfer from the airport to your villa and begin experiencing the relaxed sophistication of Casa de Campo from the very first mile.',
    shortDescription_es:
      'Desde el momento de tu llegada, cada detalle está previsto. Disfruta de un traslado cómodo y sin interrupciones hacia tu villa y comienza a vivir la esencia de Casa de Campo desde el primer instante.',
  },
  {
    slug: 'private-chauffeur',
    icon: 'car-taxi',
    category: 'arrival',
    name_en: 'Private Chauffeur',
    name_es: 'Chofer Privado',
    shortDescription_en:
      'Move effortlessly throughout Casa de Campo and beyond. Whether for dining, shopping, special events, or exploring the destination, enjoy the comfort, privacy, and flexibility of dedicated transportation tailored entirely around your plans.',
    shortDescription_es:
      'Desplázate con total comodidad dentro y fuera de Casa de Campo. Ya sea para disfrutar de una cena, realizar compras o asistir a eventos especiales, disfruta de la privacidad y flexibilidad de un servicio pensado exclusivamente para ti.',
  },
  {
    slug: 'rent-a-car',
    icon: 'car',
    category: 'arrival',
    name_en: 'Rent a Car',
    name_es: 'Alquiler de Auto',
    shortDescription_en:
      'The right vehicle, waiting upon arrival. From luxury SUVs to practical family transportation, enjoy the freedom to explore at your own pace with every detail prepared before you arrive.',
    shortDescription_es:
      'El vehículo ideal te espera desde tu llegada. Desde SUVs de lujo hasta opciones familiares, disfruta de la libertad de explorar a tu propio ritmo con todo preparado antes de tu llegada.',
  },
  {
    slug: 'golf-carts',
    icon: 'golf-cart',
    category: 'arrival',
    isFeatured: true,
    name_en: 'Golf Carts',
    name_es: 'Carritos de Golf',
    shortDescription_en:
      'Golf carts are part of everyday life in Casa de Campo. Convenient, comfortable, and easy to navigate, they offer the ideal way to move between beaches, restaurants, golf courses, and the marina throughout your stay.',
    shortDescription_es:
      'Los carritos de golf forman parte del estilo de vida de Casa de Campo. Cómodos, prácticos y fáciles de utilizar, son la forma ideal de desplazarse entre playas, restaurantes, campos de golf y la marina durante tu estadía.',
  },
  {
    slug: 'grocery-pre-stocking',
    icon: 'shopping-cart',
    category: 'arrival',
    name_en: 'Grocery Pre-Stocking',
    name_es: 'Abastecimiento de Supermercado',
    shortDescription_en:
      'Step into a villa that already feels like home. Before your arrival, your preferred groceries, beverages, and essentials can be thoughtfully selected and stocked, allowing you to settle in and begin enjoying your time from the very first moment.',
    shortDescription_es:
      'Llega a una villa preparada exactamente para ti. Antes de tu llegada, podemos seleccionar y abastecer cuidadosamente alimentos, bebidas y productos esenciales para que puedas instalarte y comenzar a disfrutar desde el primer instante.',
  },

  // ───────────────── 2. Dining & Celebrations ─────────────────
  {
    slug: 'restaurants',
    icon: 'utensils',
    category: 'dining',
    isFeatured: true,
    name_en: 'Restaurants',
    name_es: 'Restaurantes',
    shortDescription_en:
      "From waterfront lunches overlooking the marina to intimate dinners and celebratory evenings, Casa de Campo offers an exceptional culinary scene. Discover some of the destination's most sought-after tables throughout your stay.",
    shortDescription_es:
      'Desde almuerzos frente a la marina hasta cenas íntimas y celebraciones especiales, Casa de Campo ofrece una destacada propuesta gastronómica. Descubre algunos de los restaurantes más deseados del destino durante tu estancia.',
  },
  {
    slug: 'wine-champagne',
    icon: 'wine',
    category: 'dining',
    name_en: 'Wine & Champagne',
    name_es: 'Vinos y Champagne',
    shortDescription_en:
      'Whether celebrating a special occasion or simply enjoying an evening with family and friends, discover a curated selection of fine wines and exceptional champagnes delivered directly to your villa. Because the most memorable moments often begin with the perfect bottle.',
    shortDescription_es:
      'Ya sea para celebrar una ocasión especial o disfrutar una velada entre familia y amigos, descubre una selección curada de vinos y champagnes excepcionales entregados directamente a tu villa. Porque los mejores recuerdos suelen comenzar con la botella perfecta.',
  },
  {
    slug: 'celebration-cakes',
    icon: 'cake',
    category: 'dining',
    name_en: 'Celebration Cakes',
    name_es: 'Pasteles de Celebración',
    shortDescription_en:
      "Birthdays, anniversaries, engagements, and life's meaningful milestones deserve thoughtful details. Beautifully crafted custom cakes become part of the occasion, adding a personal touch to moments that will be remembered long after the celebration ends.",
    shortDescription_es:
      'Cumpleaños, aniversarios, compromisos y los momentos más especiales merecen detalles memorables. Nuestros pasteles personalizados están diseñados para complementar cada celebración y convertir cada ocasión en un recuerdo inolvidable.',
  },
  {
    slug: 'flowers',
    icon: 'flower',
    category: 'dining',
    name_en: 'Flowers',
    name_es: 'Flores',
    shortDescription_en:
      'Floral arrangements bring warmth, beauty, and character to every occasion. Whether welcoming loved ones, elevating a private dinner, or marking a special celebration, each arrangement is thoughtfully designed to complement the moment.',
    shortDescription_es:
      'Las flores tienen la capacidad de transformar cualquier espacio y ocasión. Desde una cálida bienvenida hasta una cena íntima o una celebración especial, cada arreglo floral es cuidadosamente diseñado para complementar el momento.',
  },

  // ───────────────── 3. Wellness & Beauty ─────────────────
  {
    slug: 'casa-de-campo-spa',
    icon: 'heart',
    category: 'wellness',
    isFeatured: true,
    name_en: 'Casa de Campo Spa',
    name_es: 'Spa Casa de Campo',
    shortDescription_en:
      'Wellness takes many forms. From restorative massages and rejuvenating treatments to full days dedicated to relaxation, discover Casa de Campo Spa for an experience designed to leave you feeling balanced, refreshed, and renewed.',
    shortDescription_es:
      'El bienestar se vive de muchas maneras. Desde masajes relajantes y tratamientos rejuvenecedores hasta jornadas completas de desconexión, descubre el Spa de Casa de Campo para una experiencia diseñada para renovar cuerpo y mente.',
  },
  {
    slug: 'in-villa-massages',
    icon: 'sparkles',
    category: 'wellness',
    name_en: 'In-Villa Massages',
    name_es: 'Masajes en la Villa',
    shortDescription_en:
      'Enjoy the comfort of professional spa treatments without leaving your villa. Designed around your schedule, these personalized wellness experiences allow you to fully unwind in your own private sanctuary.',
    shortDescription_es:
      'Disfruta de tratamientos de bienestar profesionales sin salir de tu villa. Experiencias personalizadas diseñadas para relajarse, desconectar y renovar energías en la privacidad de tu propio espacio.',
  },
  {
    slug: 'beauty-services',
    icon: 'gift',
    category: 'wellness',
    name_en: 'Beauty Services',
    name_es: 'Servicios de Belleza',
    shortDescription_en:
      'Prepare for an unforgettable evening, celebrate a special occasion, or simply enjoy a moment of self-care. Professional beauty services can be enjoyed in the comfort and privacy of your villa, entirely on your schedule.',
    shortDescription_es:
      'Prepárate para una ocasión especial o simplemente disfruta de un momento para ti. Servicios profesionales de belleza disponibles en la privacidad y comodidad de tu villa, adaptados a tu horario y preferencias.',
  },

  // ───────────────── 4. Family Experiences ─────────────────
  {
    slug: 'nanny-services',
    icon: 'baby',
    category: 'family',
    name_en: 'Nanny Services',
    name_es: 'Servicio de Niñera',
    shortDescription_en:
      'Family time becomes even more enjoyable when everyone feels cared for. Trusted childcare professionals provide attentive and dependable support, allowing parents and children alike to make the most of their stay.',
    shortDescription_es:
      'El tiempo en familia se disfruta aún más cuando cada miembro recibe la atención adecuada. Profesionales de confianza ofrecen apoyo y cuidado personalizado para que todos puedan disfrutar plenamente de su estancia.',
  },
  {
    slug: 'kids-club',
    icon: 'users',
    category: 'family',
    name_en: 'Kids Club',
    name_es: 'Club de Niños',
    shortDescription_en:
      'From horseback riding and tennis lessons to creative workshops and beach adventures and kids club, younger guests can discover a world designed around fun, learning, and unforgettable memories.',
    shortDescription_es:
      'Desde clases de tenis y equitación hasta talleres creativos y aventuras junto al mar, el club de niños, los más pequeños encontrarán experiencias diseñadas para aprender, explorar y crear recuerdos inolvidables.',
  },

  // ───────────────── 5. Ocean Experiences ─────────────────
  {
    slug: 'boat-experiences',
    icon: 'sailboat',
    category: 'ocean',
    isFeatured: true,
    name_en: 'Boat Experiences',
    name_es: 'Experiencias en Bote',
    shortDescription_en:
      'The Caribbean is best experienced from the water. Spend the day exploring the turquoise shallows of Palmilla, the pristine beaches of Catalina Island and Isla Saona, or hidden stretches of coastline only accessible by sea. Every itinerary is tailored around your pace, preferences, and idea of the perfect day.',
    shortDescription_es:
      'El Caribe se disfruta mejor desde el mar. Descubre las aguas turquesas de Palmilla, las playas vírgenes de Isla Catalina e Isla Saona, o rincones escondidos accesibles únicamente por embarcación. Cada experiencia se adapta a tu ritmo, tus preferencias y tu propia idea de un día perfecto.',
  },

  // ───────────────── 6. Events & Entertainment ─────────────────
  {
    slug: 'events-concerts',
    icon: 'music',
    category: 'events',
    name_en: 'Events & Concerts',
    name_es: 'Eventos y Conciertos',
    shortDescription_en:
      'From world-renowned performers at the Altos de Chavón Amphitheater to exclusive events, sporting fixtures, and seasonal celebrations, Casa de Campo offers a vibrant cultural calendar throughout the year. Gain access to the experiences that define the destination, with every detail thoughtfully considered.',
    shortDescription_es:
      'Desde artistas de reconocimiento internacional en el Anfiteatro de Altos de Chavón hasta eventos exclusivos, encuentros deportivos y celebraciones de temporada, Casa de Campo ofrece una agenda vibrante durante todo el año. Descubre las experiencias que dan vida al destino mientras nosotros nos ocupamos de cada detalle.',
  },

  // ───────────────── 7. Private Moments ─────────────────
  {
    slug: 'private-photography',
    icon: 'camera',
    category: 'private',
    name_en: 'Private Photography',
    name_es: 'Fotografía Privada',
    shortDescription_en:
      'Some moments deserve more than a photograph—they deserve to be remembered beautifully. From family gatherings by the sea and sunset portraits in Altos de Chavón to milestone celebrations within the privacy of your villa, our trusted photography partners capture each experience with authenticity, discretion, and elegance.',
    shortDescription_es:
      'Hay momentos que merecen más que una fotografía; merecen ser recordados de manera extraordinaria. Desde encuentros familiares junto al mar y retratos al atardecer en Altos de Chavón hasta celebraciones especiales en la privacidad de su villa, nuestros fotógrafos seleccionados capturan cada experiencia con naturalidad, discreción y elegancia.',
  },

  // ───────────────── 8. Sports & Outdoor Living ─────────────────
  {
    slug: 'active-lifestyle',
    icon: 'trophy',
    category: 'sports',
    name_en: 'Active Lifestyle',
    name_es: 'Vida Activa',
    shortDescription_en:
      "From championship golf courses and world-class tennis facilities to polo, equestrian pursuits, and watersports, Casa de Campo offers one of the Caribbean's most complete sporting lifestyles. Discover experiences designed around movement, competition, wellness, and the outdoors.",
    shortDescription_es:
      'Desde campos de golf de campeonato y facilidades de tenis de clase mundial hasta polo, equitación y deportes acuáticos, Casa de Campo ofrece uno de los estilos de vida deportivos más completos del Caribe. Descubre las experiencias pensadas para quienes disfrutan del movimiento, el bienestar y la aventura.',
  },
  {
    slug: 'casa-de-campo-lifestyle',
    icon: 'map',
    category: 'sports',
    name_en: 'Casa de Campo Lifestyle',
    name_es: 'Estilo de Vida Casa de Campo',
    shortDescription_en:
      'More than a destination, Casa de Campo is a way of life. World-class golf, polo, tennis, watersports, wellness, family adventures, and endless days under the Caribbean sun create an environment where every generation can find their perfect rhythm.',
    shortDescription_es:
      'Más que un destino, Casa de Campo es una forma de vivir. Golf de clase mundial, polo, tenis, deportes acuáticos, bienestar, actividades familiares y días interminables bajo el sol del Caribe crean un entorno donde cada generación encuentra su propio ritmo.',
  },
]

async function run() {
  console.log(
    `Seeding ${SERVICES.length} concierge services to dataset "${client.config().dataset}"…`
  )
  if (force) console.log('--force enabled: will overwrite existing service docs')

  const existing = await client.fetch(
    `*[_type == "conciergeService" && defined(slug.current)]{ _id, "slug": slug.current }`
  )
  const existingBySlug = new Map(existing.map((s) => [s.slug, s._id]))

  let created = 0
  let updated = 0
  let skipped = 0
  let deactivated = 0

  for (let i = 0; i < SERVICES.length; i++) {
    const s = SERVICES[i]
    const docId = `concierge-${s.slug}`
    const doc = {
      _id: docId,
      _type: 'conciergeService',
      name_en: s.name_en,
      name_es: s.name_es,
      slug: { _type: 'slug', current: s.slug },
      shortDescription_en: s.shortDescription_en,
      shortDescription_es: s.shortDescription_es,
      category: s.category,
      icon: s.icon,
      isActive: true,
      ...(s.isFeatured && { isFeatured: true }),
      order: i,
    }

    const existingId = existingBySlug.get(s.slug)

    if (existingId && !force) {
      skipped++
      console.log(`  skip       ${s.slug} (exists)`)
      continue
    }

    if (existingId && force) {
      const patch = { ...doc }
      delete patch._id
      delete patch._type
      await client.patch(existingId).set(patch).commit()
      updated++
      console.log(`  update     ${s.slug}`)
      continue
    }

    await client.createOrReplace(doc)
    created++
    console.log(`  create     ${s.slug}`)
  }

  // Deactivate any service that is no longer part of this document so the
  // public grid matches the source. Data is preserved (isActive=false),
  // so this is reversible from Sanity Studio.
  const newSlugs = new Set(SERVICES.map((s) => s.slug))
  for (const e of existing) {
    if (newSlugs.has(e.slug)) continue
    await client.patch(e._id).set({ isActive: false }).commit()
    deactivated++
    console.log(`  deactivate ${e.slug} (not in document)`)
  }

  console.log(
    `\nDone. created=${created} updated=${updated} skipped=${skipped} deactivated=${deactivated}`
  )
  console.log('Open Sanity Studio to add images, prices, or detail pages.')
}

run().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
