/**
 * Seed the Casa de Campo map attractions (landmarks / points of interest)
 * that appear as pins on the property maps.
 *
 * Usage:
 *   yarn seed-attractions          # creates missing, leaves existing alone
 *   yarn seed-attractions --force  # overwrites existing attraction docs
 *
 * ⚠️  COORDINATES ARE APPROXIMATE. They put each pin in the right area, but
 * you should open Local Guide → Map Attractions in Studio and nudge each
 * lat/lng against Google Maps before relying on them.
 *
 * Deterministic ids (`attraction-<slug>`) make this idempotent.
 */
const { createClient } = require('@sanity/client')
const path = require('path')
const dotenv = require('dotenv')

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const force = process.argv.includes('--force')

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'development',
  // dataset: 'production',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
  apiVersion: '2025-09-06',
})

if (!process.env.SANITY_API_WRITE_TOKEN) {
  console.error('Missing SANITY_API_WRITE_TOKEN in .env.local')
  process.exit(1)
}

// [en, es] name + description, category, and APPROXIMATE coordinates.
const ATTRACTIONS = [
  {
    slug: 'la-marina-casa-de-campo',
    category: 'marina',
    name: ['La Marina Casa de Campo', 'La Marina Casa de Campo'],
    description: [
      'Mediterranean-style marina with waterfront dining, shops, and yacht berths.',
      'Marina de estilo mediterráneo con restaurantes frente al mar, tiendas y muelles para yates.',
    ],
    lat: 18.4206,
    lng: -68.9528,
  },
  {
    slug: 'altos-de-chavon',
    category: 'culture',
    name: ['Altos de Chavón', 'Altos de Chavón'],
    description: [
      'A recreated 16th-century Mediterranean village above the Chavón River — galleries, the amphitheater, and dining.',
      'Una recreación de un pueblo mediterráneo del siglo XVI sobre el río Chavón — galerías, el anfiteatro y restaurantes.',
    ],
    lat: 18.4113,
    lng: -68.8948,
  },
  {
    slug: 'minitas-beach-club',
    category: 'beach_club',
    name: ['Minitas Beach Club', 'Minitas Beach Club'],
    description: [
      'The resort’s private beach with calm water, loungers, and beachfront dining.',
      'La playa privada del resort con aguas tranquilas, camastros y restaurante frente al mar.',
    ],
    lat: 18.4249,
    lng: -68.944,
  },
  {
    slug: 'teeth-of-the-dog',
    category: 'golf',
    name: ['Teeth of the Dog (Golf)', 'Teeth of the Dog (Golf)'],
    description: [
      'Pete Dye’s legendary oceanfront course — seven holes play along the sea.',
      'El legendario campo frente al mar de Pete Dye — siete hoyos junto al océano.',
    ],
    lat: 18.423,
    lng: -68.938,
  },
  {
    slug: 'dye-fore',
    category: 'golf',
    name: ['Dye Fore (Golf)', 'Dye Fore (Golf)'],
    description: [
      'Clifftop course with dramatic views over the Chavón River and the marina.',
      'Campo sobre acantilados con vistas espectaculares al río Chavón y la marina.',
    ],
    lat: 18.4045,
    lng: -68.889,
  },
  {
    slug: 'casa-de-campo-airport',
    category: 'airport',
    name: ['La Romana Airport (LRM)', 'Aeropuerto La Romana (LRM)'],
    description: [
      'The local international airport serving Casa de Campo, minutes from the resort.',
      'El aeropuerto internacional local que sirve a Casa de Campo, a minutos del resort.',
    ],
    lat: 18.4507,
    lng: -68.9117,
  },
  {
    slug: 'equestrian-center',
    category: 'activity',
    name: ['Equestrian Center', 'Centro Ecuestre'],
    description: [
      'Horseback riding, trail rides, and polo at the resort’s equestrian center.',
      'Paseos a caballo, cabalgatas y polo en el centro ecuestre del resort.',
    ],
    lat: 18.4175,
    lng: -68.908,
  },
  {
    slug: 'shooting-center',
    category: 'activity',
    name: ['Shooting Center', 'Centro de Tiro'],
    description: [
      'Sporting clays, trap, and skeet across a wooded shooting course.',
      'Tiro al plato, trap y skeet en un recorrido boscoso.',
    ],
    lat: 18.412,
    lng: -68.903,
  },
  {
    slug: 'la-terraza-tennis',
    category: 'activity',
    name: ['La Terraza Tennis Club', 'Club de Tenis La Terraza'],
    description: [
      'Har-Tru tennis courts with lessons and clinics.',
      'Canchas de tenis Har-Tru con clases y clínicas.',
    ],
    lat: 18.42,
    lng: -68.906,
  },
  {
    slug: 'la-romana-country-club',
    category: 'golf',
    name: ['La Romana Country Club', 'La Romana Country Club'],
    description: [
      'Private country club with a golf course and clubhouse near La Romana.',
      'Club campestre privado con campo de golf y casa club cerca de La Romana.',
    ],
    lat: 18.43,
    lng: -68.97,
  },
]

function doc(a, order) {
  return {
    _id: `attraction-${a.slug}`,
    _type: 'attraction',
    name_en: a.name[0],
    name_es: a.name[1],
    slug: { _type: 'slug', current: a.slug },
    category: a.category,
    coordinates: { lat: a.lat, lng: a.lng },
    shortDescription_en: a.description[0],
    shortDescription_es: a.description[1],
    isActive: true,
    order,
  }
}

async function run() {
  const dataset = client.config().dataset
  console.log(
    `Seeding ${ATTRACTIONS.length} map attractions to dataset "${dataset}"…`
  )
  if (force) console.log('--force enabled: will overwrite existing docs')

  const existing = await client.fetch(
    `*[_type == "attraction" && defined(slug.current)]{ _id, "slug": slug.current }`
  )
  const bySlug = new Map(existing.map((e) => [e.slug, e._id]))

  let created = 0
  let updated = 0
  let skipped = 0

  for (let i = 0; i < ATTRACTIONS.length; i++) {
    const a = ATTRACTIONS[i]
    const d = doc(a, i + 1)
    const existingId = bySlug.get(a.slug)

    if (existingId && !force) {
      skipped++
      console.log(`  skip   ${a.category}/${a.slug}`)
      continue
    }
    if (existingId && force && existingId !== d._id) {
      const patch = { ...d }
      delete patch._id
      delete patch._type
      delete patch.slug
      await client.patch(existingId).set(patch).commit()
      updated++
      console.log(`  update ${a.category}/${a.slug} (existing id)`)
      continue
    }

    await client.createOrReplace(d)
    if (existingId) {
      updated++
      console.log(`  update ${a.category}/${a.slug}`)
    } else {
      created++
      console.log(`  create ${a.category}/${a.slug}`)
    }
  }

  console.log(`\nDone. created=${created} updated=${updated} skipped=${skipped}`)
  console.log(
    '\n⚠️  Coordinates are approximate — open Studio → Local Guide → Map ' +
      'Attractions and verify each pin against Google Maps.'
  )
}

run().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
