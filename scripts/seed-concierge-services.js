/**
 * Seed default concierge services into Sanity.
 *
 * Usage:
 *   yarn seed-concierge          # creates missing, leaves existing alone
 *   yarn seed-concierge --force  # overwrites existing service docs
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
  // ----- Transport & Transfers -----
  {
    slug: 'airport-transfer',
    icon: 'plane',
    category: 'transport',
    isFeatured: true,
    name_en: 'Airport Transfers',
    name_es: 'Traslados al Aeropuerto',
    shortDescription_en:
      'Private door-to-door transfers from La Romana, Punta Cana, or Santo Domingo. Meet-and-greet at arrivals.',
    shortDescription_es:
      'Traslados privados puerta a puerta desde La Romana, Punta Cana o Santo Domingo. Recepción en el aeropuerto.',
  },
  {
    slug: 'private-driver',
    icon: 'car-taxi',
    category: 'transport',
    name_en: 'Private Driver',
    name_es: 'Chofer Privado',
    shortDescription_en:
      'On-call driver for the day or trip — restaurants, shopping in Santo Domingo, beach excursions.',
    shortDescription_es:
      'Chofer disponible por día o viaje — restaurantes, compras en Santo Domingo, excursiones a la playa.',
  },
  {
    slug: 'car-rental',
    icon: 'car',
    category: 'transport',
    name_en: 'Car Rental',
    name_es: 'Alquiler de Auto',
    shortDescription_en:
      'SUVs, sedans, and convertibles delivered to your villa. Insurance and paperwork handled.',
    shortDescription_es:
      'SUVs, sedanes y convertibles entregados en tu villa. Seguro y documentación incluidos.',
  },
  {
    slug: 'golf-cart-rental',
    icon: 'bike',
    category: 'transport',
    isFeatured: true,
    name_en: 'Golf Cart Rental',
    name_es: 'Alquiler de Carrito de Golf',
    shortDescription_en:
      'The way to get around Casa de Campo. 2-, 4-, and 6-seater carts delivered.',
    shortDescription_es:
      'La forma de moverse por Casa de Campo. Carritos de 2, 4 y 6 plazas entregados.',
  },
  {
    slug: 'yacht-charter',
    icon: 'ship',
    category: 'transport',
    name_en: 'Yacht & Boat Charters',
    name_es: 'Alquiler de Yates y Botes',
    shortDescription_en:
      'Day charters from La Marina to Catalina, Saona, and Palmilla. Captain, crew, and provisioning included.',
    shortDescription_es:
      'Charters desde La Marina a Catalina, Saona y Palmilla. Capitán, tripulación y provisiones incluidos.',
  },

  // ----- Food & Beverage -----
  {
    slug: 'pre-arrival-grocery',
    icon: 'shopping-cart',
    category: 'food',
    isFeatured: true,
    name_en: 'Pre-Arrival Grocery Stocking',
    name_es: 'Compra de Supermercado Antes de Llegar',
    shortDescription_en:
      'Send us a list — fridge stocked, pantry filled, fresh fruit on the counter when you walk in.',
    shortDescription_es:
      'Envíanos tu lista — nevera lista, despensa llena, fruta fresca en la mesa cuando llegues.',
  },
  {
    slug: 'private-chef',
    icon: 'chef-hat',
    category: 'food',
    name_en: 'Private Chef',
    name_es: 'Chef Privado',
    shortDescription_en:
      'Breakfast through dinner, in your villa. Local Dominican cuisine, Italian, sushi, BBQ — your call.',
    shortDescription_es:
      'Desayuno hasta cena, en tu villa. Cocina dominicana, italiana, sushi, BBQ — tú decides.',
  },
  {
    slug: 'restaurant-reservations',
    icon: 'utensils',
    category: 'food',
    name_en: 'Restaurant Reservations',
    name_es: 'Reservas de Restaurantes',
    shortDescription_en:
      'Tables at La Casita, La Caña, SBG, Beach Club — including the ones that "have no availability."',
    shortDescription_es:
      'Mesas en La Casita, La Caña, SBG, Beach Club — incluyendo los que "no tienen disponibilidad".',
  },
  {
    slug: 'wine-champagne-stocking',
    icon: 'wine',
    category: 'food',
    name_en: 'Wine & Champagne Stocking',
    name_es: 'Vinos y Champagne',
    shortDescription_en:
      'Curated bottles delivered to your villa. Cellar building, magnums, special-occasion picks.',
    shortDescription_es:
      'Botellas seleccionadas entregadas en tu villa. Cava, magnums, opciones para ocasiones especiales.',
  },
  {
    slug: 'celebration-cake',
    icon: 'cake',
    category: 'food',
    name_en: 'Celebration Cakes',
    name_es: 'Pasteles para Celebraciones',
    shortDescription_en:
      'Birthdays, anniversaries, proposals. Local pastry chef, custom design, delivered to the villa.',
    shortDescription_es:
      'Cumpleaños, aniversarios, propuestas. Pastelero local, diseño personalizado, entregado en la villa.',
  },

  // ----- Experiences & Activities -----
  {
    slug: 'tee-times',
    icon: 'trophy',
    category: 'experiences',
    isFeatured: true,
    name_en: 'Tee Times & Golf',
    name_es: 'Tee Times y Golf',
    shortDescription_en:
      'Teeth of the Dog, Dye Fore, The Links. Caddy assignment, club rentals, lessons.',
    shortDescription_es:
      'Teeth of the Dog, Dye Fore, The Links. Asignación de caddy, alquiler de palos, lecciones.',
  },
  {
    slug: 'island-excursions',
    icon: 'map',
    category: 'experiences',
    name_en: 'Island Excursions',
    name_es: 'Excursiones por la Isla',
    shortDescription_en:
      'Saona Island, Altos de Chavón, Los Haitises National Park, Bávaro. Private guide, no group buses.',
    shortDescription_es:
      'Isla Saona, Altos de Chavón, Parque Nacional Los Haitises, Bávaro. Guía privado, sin buses de grupo.',
  },
  {
    slug: 'event-planning',
    icon: 'calendar',
    category: 'experiences',
    name_en: 'Event Planning',
    name_es: 'Organización de Eventos',
    shortDescription_en:
      'Birthdays, anniversaries, weddings, corporate retreats. Vendor coordination, decor, catering, music.',
    shortDescription_es:
      'Cumpleaños, aniversarios, bodas, retiros corporativos. Coordinación de proveedores, decoración, catering, música.',
  },
  {
    slug: 'private-tours',
    icon: 'camera',
    category: 'experiences',
    name_en: 'Private Photography',
    name_es: 'Fotografía Privada',
    shortDescription_en:
      'Family sessions on the beach, sunset shoots at Altos de Chavón, professional event coverage.',
    shortDescription_es:
      'Sesiones familiares en la playa, fotos al atardecer en Altos de Chavón, cobertura profesional de eventos.',
  },
  {
    slug: 'show-tickets',
    icon: 'ticket',
    category: 'experiences',
    name_en: 'Show & Concert Tickets',
    name_es: 'Boletos para Shows y Conciertos',
    shortDescription_en:
      'Altos de Chavón Amphitheater, Hard Rock concerts, baseball games — premium seats arranged.',
    shortDescription_es:
      'Anfiteatro de Altos de Chavón, conciertos del Hard Rock, juegos de béisbol — asientos premium.',
  },

  // ----- Home & Lifestyle -----
  {
    slug: 'housekeeping-extra',
    icon: 'sparkles',
    category: 'home',
    name_en: 'Extra Housekeeping',
    name_es: 'Limpieza Adicional',
    shortDescription_en:
      'Daily cleans, deep cleans, laundry-only visits beyond what your villa includes.',
    shortDescription_es:
      'Limpieza diaria, limpieza profunda, lavandería — más allá de lo que incluye tu villa.',
  },
  {
    slug: 'florist',
    icon: 'flower',
    category: 'home',
    name_en: 'Florist',
    name_es: 'Florería',
    shortDescription_en:
      'Fresh arrangements for arrival, dinner parties, anniversaries. Local sourcing, tropical or classic.',
    shortDescription_es:
      'Arreglos frescos para tu llegada, cenas, aniversarios. Compra local, tropical o clásico.',
  },
  {
    slug: 'gifts-and-welcome',
    icon: 'gift',
    category: 'home',
    name_en: 'Gifts & Welcome Baskets',
    name_es: 'Regalos y Cestas de Bienvenida',
    shortDescription_en:
      'Surprise a guest, host, or partner. Curated baskets, monogrammed details, kid-friendly versions.',
    shortDescription_es:
      'Sorprende a un invitado, anfitrión o pareja. Cestas seleccionadas, detalles monogramados, opciones para niños.',
  },

  // ----- Wellness & Family -----
  {
    slug: 'in-villa-massage',
    icon: 'heart',
    category: 'wellness',
    name_en: 'In-Villa Massage & Spa',
    name_es: 'Masaje y Spa en la Villa',
    shortDescription_en:
      'Licensed therapists arrive at your villa. Couples massage, prenatal, deep tissue, hair and nails.',
    shortDescription_es:
      'Terapeutas certificadas en tu villa. Masaje en pareja, prenatal, tejido profundo, cabello y uñas.',
  },
  {
    slug: 'babysitter-nanny',
    icon: 'baby',
    category: 'wellness',
    name_en: 'Babysitting & Nanny',
    name_es: 'Niñera',
    shortDescription_en:
      'Vetted, English-speaking sitters for evenings out or full-day childcare while you golf or sail.',
    shortDescription_es:
      'Niñeras de confianza que hablan inglés, para salidas nocturnas o cuidado de día completo mientras juegas golf o navegas.',
  },
  {
    slug: 'kids-activities',
    icon: 'users',
    category: 'wellness',
    name_en: "Kids' Activities",
    name_es: 'Actividades para Niños',
    shortDescription_en:
      'Horseback riding, tennis lessons, beach camp, art classes — set up around your schedule.',
    shortDescription_es:
      'Equitación, lecciones de tenis, campamento en la playa, clases de arte — programado a tu horario.',
  },
  {
    slug: 'pet-care',
    icon: 'dog',
    category: 'wellness',
    name_en: 'Pet Care',
    name_es: 'Cuidado de Mascotas',
    shortDescription_en:
      'Walks, sitters, vet visits, grooming — for the four-legged member of the family who came along.',
    shortDescription_es:
      'Paseos, cuidadoras, visitas al veterinario, peluquería — para el miembro de cuatro patas que vino contigo.',
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
      console.log(`  skip   ${s.slug} (exists)`)
      continue
    }

    if (existingId && force) {
      const patch = { ...doc }
      delete patch._id
      delete patch._type
      await client.patch(existingId).set(patch).commit()
      updated++
      console.log(`  update ${s.slug}`)
      continue
    }

    await client.createOrReplace(doc)
    created++
    console.log(`  create ${s.slug}`)
  }

  console.log(
    `\nDone. created=${created} updated=${updated} skipped=${skipped}`
  )
  console.log('Open Sanity Studio to add prices, descriptions, or new services.')
}

run().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
