/**
 * Seed a set of public, curated collections for the homepage
 * "Edited, not listed" section.
 *
 * Usage:
 *   yarn seed-collections          # creates missing, leaves existing alone
 *   yarn seed-collections --force  # overwrites existing seeded collections
 *
 * Properties are picked at run time with a GROQ filter per collection (not
 * hardcoded ids), so the script works against any dataset. The cover image
 * reuses the main image of the first matched property — swap it in Studio
 * for a proper editorial shot.
 *
 * Deterministic ids (`collection-<slug>`) make this idempotent.
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

const MAX_PER_COLLECTION = 6

// `filter` is a GROQ boolean expression evaluated against active properties.
// `order` is the GROQ ordering applied before taking the first N.
const COLLECTIONS = [
  {
    slug: 'the-sunday-table',
    order: 10,
    title: ['The Sunday Table', 'La mesa del domingo'],
    description: [
      'Long tables, shaded terraces and a pool the grandchildren never leave. Houses where three generations fit without anyone noticing.',
      'Mesas largas, terrazas a la sombra y una piscina de la que los nietos no quieren salir. Casas donde caben tres generaciones sin que nadie lo note.',
    ],
    welcome: [
      'These are the houses I send families to when the brief is “everyone, together, and nobody fighting over the good room.” Ask me which ones have a cook who does a proper sancocho.',
      'Estas son las casas que recomiendo a las familias cuando me piden “todos juntos y que nadie pelee por la mejor habitación.” Pregúntame cuáles tienen cocinera que hace un buen sancocho.',
    ],
    filter: `amenities.bedrooms >= 4 && ("family" in themes || amenities.maxGuests >= 10)`,
    order_by: 'amenities.maxGuests desc',
  },
  {
    slug: 'first-tee-second-coffee',
    order: 20,
    title: ['First Tee, Second Coffee', 'Primer tee, segundo café'],
    description: [
      'The cart is charged and waiting by the door. For golfers who would rather be on the course at seven than in a lobby at nine.',
      'El carrito cargado y esperando en la puerta. Para golfistas que prefieren estar en el campo a las siete que en un lobby a las nueve.',
    ],
    welcome: [
      'Tee times at Teeth of the Dog go fast in high season. Book one of these and tell me your dates. I will handle the rest before you land.',
      'Las salidas en Teeth of the Dog se agotan en temporada alta. Reserva una de estas casas, dime tus fechas y yo me encargo del resto antes de que aterrices.',
    ],
    filter: `"golf" in themes || amenities.hasGolfCart == true`,
    order_by: 'pricing.rentalPricing.nightlyRate.amount desc',
  },
  {
    slug: 'where-the-phone-goes-quiet',
    order: 30,
    title: ['Where the Phone Goes Quiet', 'Donde el teléfono se calla'],
    description: [
      'Smaller, slower houses for two. Hammocks, outdoor showers and an empty calendar.',
      'Casas más pequeñas y más lentas, para dos. Hamacas, duchas al aire libre y un calendario vacío.',
    ],
    welcome: [
      'For anniversaries, honeymoons, or simply needing to disappear for a week. I can arrange a private dinner on the terrace. Just ask.',
      'Para aniversarios, lunas de miel o simplemente desaparecer una semana. Puedo organizar una cena privada en la terraza. Solo pídelo.',
    ],
    filter: `amenities.bedrooms <= 3 && ("romantic" in themes || "wellness" in themes)`,
    order_by: 'amenities.bedrooms asc',
  },
  {
    slug: 'barefoot-before-breakfast',
    order: 40,
    title: ['Barefoot Before Breakfast', 'Descalzos antes del desayuno'],
    description: [
      'From the bed to the sand without putting on shoes. The houses closest to the water, chosen for the morning light.',
      'De la cama a la arena sin ponerse zapatos. Las casas más cerca del agua, elegidas por la luz de la mañana.',
    ],
    welcome: [
      'Not every “beachfront” listing really is. These are, and I have stood on each terrace at sunrise to be sure.',
      'No todo lo que dice “frente al mar” lo es. Estas sí lo son. He estado en cada terraza al amanecer para comprobarlo.',
    ],
    filter: `"beachfront" in themes || amenities.hasBeachAccess == true`,
    order_by: 'pricing.rentalPricing.nightlyRate.amount desc',
  },
  {
    slug: 'houses-that-host',
    order: 50,
    title: ['Houses That Host', 'Casas que reciben'],
    description: [
      'Lawns for eighty, kitchens built for caterers and staff who have done this before. Estates for the weekend everyone remembers.',
      'Jardines para ochenta, cocinas pensadas para catering y personal con experiencia. Residencias para el fin de semana que todos recuerdan.',
    ],
    welcome: [
      'Weddings, milestone birthdays, a company retreat. I work with the same planners, florists and musicians every season, and I can put the whole weekend together.',
      'Bodas, cumpleaños importantes, un retiro de empresa. Trabajo con los mismos organizadores, floristas y músicos cada temporada, y puedo armar el fin de semana completo.',
    ],
    filter: `amenities.bedrooms >= 6 && amenities.maxGuests >= 14`,
    order_by: 'amenities.maxGuests desc',
  },
  {
    slug: 'the-quiet-list',
    order: 60,
    title: ['The Quiet List', 'La lista discreta'],
    description: [
      'Residences for sale that are not advertised anywhere else. Shown privately, by introduction.',
      'Residencias en venta que no se anuncian en ningún otro lugar. Se muestran en privado, con presentación previa.',
    ],
    welcome: [
      'Some owners prefer not to put a sign on the gate. If one of these interests you, write to me and I will arrange a private viewing.',
      'Algunos propietarios prefieren no poner un letrero en la entrada. Si alguna te interesa, escríbeme y organizo una visita privada.',
    ],
    filter: `pricing.type in ["sale", "both"] && amenities.bedrooms >= 3`,
    order_by: 'amenities.bedrooms desc',
  },
]

async function pickProperties(def) {
  const query = `*[
    _type == "property" &&
    status == "active" &&
    defined(mainImage.asset) &&
    (${def.filter})
  ] | order(${def.order_by}) [0...${MAX_PER_COLLECTION}] {
    _id,
    "imageRef": mainImage.asset._ref
  }`
  return client.fetch(query)
}

async function main() {
  console.log(`Seeding collections into dataset "${client.config().dataset}"…`)

  // Cover images already taken by an earlier collection, so the homepage
  // grid doesn't show the same photo twice.
  const usedCovers = new Set()

  for (const def of COLLECTIONS) {
    const _id = `collection-${def.slug}`
    const existing = await client.fetch(`*[_id == $id][0]._id`, { id: _id })
    if (existing && !force) {
      console.log(`  • ${def.slug} exists, skipping (use --force to overwrite)`)
      continue
    }

    const props = await pickProperties(def)
    if (props.length === 0) {
      console.log(`  ✗ ${def.slug}: no matching properties, skipping`)
      continue
    }

    const cover = props.find((p) => !usedCovers.has(p.imageRef)) || props[0]
    usedCovers.add(cover.imageRef)

    const doc = {
      _id,
      _type: 'collection',
      title_en: def.title[0],
      title_es: def.title[1],
      slug: { _type: 'slug', current: def.slug },
      description_en: def.description[0],
      description_es: def.description[1],
      welcomeMessage_en: def.welcome[0],
      welcomeMessage_es: def.welcome[1],
      collectionType: 'curated',
      order: def.order,
      coverImage: {
        _type: 'image',
        asset: { _type: 'reference', _ref: cover.imageRef },
      },
      properties: props.map((p) => ({
        _type: 'reference',
        _ref: p._id,
        _key: p._id.replace(/[^a-zA-Z0-9]/g, '').slice(0, 12),
      })),
      isActive: true,
      isPublic: true,
      features: {
        showPricing: true,
        allowInquiries: true,
        showAvailability: true,
        enableSharing: true,
        requireLogin: false,
      },
    }

    await client.createOrReplace(doc)
    console.log(`  ✓ ${def.slug} (${props.length} properties)`)
  }

  console.log('Done.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
