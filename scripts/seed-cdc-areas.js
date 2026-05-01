/**
 * Seed Casa de Campo neighborhood/sector documents into the `area` schema.
 *
 * Usage:
 *   node scripts/seed-cdc-areas.js          # creates missing, leaves existing alone
 *   node scripts/seed-cdc-areas.js --force  # overwrites existing area docs with seed values
 *
 * Notes:
 *   - All areas are seeded under region: 'la-romana'.
 *   - coverImage is required by the Sanity schema's UI validation, but
 *     direct API mutations bypass that, so the documents will save with
 *     no image. Open each one in Studio to upload a cover photo.
 *   - Slugs use the `_id` form `area-<slug>` for predictability so
 *     re-running the script can detect existing docs.
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

/**
 * Casa de Campo's residential sectors. Names verified from the resort's
 * own community map. Add more or edit as needed; the script is idempotent
 * keyed on the slug.
 */
const AREAS = [
  {
    slug: 'las-cerezas',
    title_en: 'Las Cerezas',
    title_es: 'Las Cerezas',
    description_en:
      'Quiet hillside sector with mature landscaping, close to the Teeth of the Dog golf course.',
    description_es:
      'Sector tranquilo en la ladera con jardines maduros, cerca del campo de golf Teeth of the Dog.',
    isPopular: true,
  },
  {
    slug: 'cacique',
    title_en: 'Cacique',
    title_es: 'Cacique',
    description_en:
      'Established sector close to the Hotel and central amenities, popular for short-term stays.',
    description_es:
      'Sector consolidado cerca del Hotel y amenidades centrales, popular para estancias cortas.',
    isPopular: true,
  },
  {
    slug: 'el-batey',
    title_en: 'El Batey',
    title_es: 'El Batey',
    description_en:
      'One of the original Casa de Campo neighborhoods, walking distance to the central facilities.',
    description_es:
      'Uno de los barrios originales de Casa de Campo, a poca distancia de las instalaciones centrales.',
    isPopular: true,
  },
  {
    slug: 'barranca',
    title_en: 'Barranca',
    title_es: 'Barranca',
    description_en:
      'Sector along the Chavón river ridge with dramatic views and larger lots.',
    description_es:
      'Sector en la cresta del río Chavón con vistas espectaculares y lotes más grandes.',
  },
  {
    slug: 'barranca-este',
    title_en: 'Barranca Este',
    title_es: 'Barranca Este',
    description_en: 'East side of the Barranca ridge.',
    description_es: 'Lado este de la cresta de Barranca.',
  },
  {
    slug: 'vivero',
    title_en: 'Vivero',
    title_es: 'Vivero',
    description_en:
      'Family-friendly sector near schools and the equestrian center.',
    description_es:
      'Sector familiar cerca de escuelas y el centro ecuestre.',
  },
  {
    slug: 'vivero-i',
    title_en: 'Vivero I',
    title_es: 'Vivero I',
  },
  {
    slug: 'vivero-ii',
    title_en: 'Vivero II',
    title_es: 'Vivero II',
  },
  {
    slug: 'las-lomas',
    title_en: 'Las Lomas',
    title_es: 'Las Lomas',
    description_en: 'Hillside sector with elevated views over the resort.',
    description_es: 'Sector en la ladera con vistas elevadas sobre el resort.',
  },
  {
    slug: 'punta-aguila',
    title_en: 'Punta Águila',
    title_es: 'Punta Águila',
    description_en:
      'Premier oceanfront sector along the Teeth of the Dog course.',
    description_es:
      'Sector premium frente al mar a lo largo del campo Teeth of the Dog.',
    isPopular: true,
  },
  {
    slug: 'los-mangos',
    title_en: 'Los Mangos',
    title_es: 'Los Mangos',
  },
  {
    slug: 'los-limones',
    title_en: 'Los Limones',
    title_es: 'Los Limones',
  },
  {
    slug: 'los-tamarindos',
    title_en: 'Los Tamarindos',
    title_es: 'Los Tamarindos',
  },
  {
    slug: 'los-naranjos',
    title_en: 'Los Naranjos',
    title_es: 'Los Naranjos',
  },
  {
    slug: 'costa-mar',
    title_en: 'Costa Mar',
    title_es: 'Costa Mar',
    description_en: 'Oceanfront sector with direct sea views.',
    description_es: 'Sector frente al mar con vistas directas.',
  },
  {
    slug: 'la-marina',
    title_en: 'La Marina',
    title_es: 'La Marina',
    description_en:
      'Casa de Campo Marina — apartments, restaurants, and yacht moorings.',
    description_es:
      'Marina Casa de Campo — apartamentos, restaurantes y atraques de yates.',
    isPopular: true,
  },
]

async function run() {
  console.log(
    `Seeding ${AREAS.length} Casa de Campo areas to dataset "${client.config().dataset}"…`
  )
  if (force) console.log('--force enabled: will overwrite existing area docs')

  // Pull existing areas in one shot to avoid N round-trips.
  const existing = await client.fetch(
    `*[_type == "area" && defined(slug.current)]{ _id, "slug": slug.current }`
  )
  const existingBySlug = new Map(existing.map((a) => [a.slug, a._id]))

  let created = 0
  let updated = 0
  let skipped = 0

  for (const area of AREAS) {
    const docId = `area-${area.slug}`
    const doc = {
      _id: docId,
      _type: 'area',
      title_en: area.title_en,
      title_es: area.title_es,
      slug: { _type: 'slug', current: area.slug },
      region: 'la-romana',
      ...(area.description_en && { description_en: area.description_en }),
      ...(area.description_es && { description_es: area.description_es }),
      ...(area.isPopular && { isPopular: true }),
    }

    const existingId = existingBySlug.get(area.slug)

    if (existingId && !force) {
      skipped++
      console.log(`  skip   ${area.slug} (exists)`)
      continue
    }

    if (existingId && force) {
      // Patch existing — keep any image/coverage data already set.
      const patch = { ...doc }
      delete patch._id
      delete patch._type
      await client.patch(existingId).set(patch).commit()
      updated++
      console.log(`  update ${area.slug}`)
      continue
    }

    await client.createOrReplace(doc)
    created++
    console.log(`  create ${area.slug}`)
  }

  console.log(
    `\nDone. created=${created} updated=${updated} skipped=${skipped}`
  )
  console.log(
    'Open Sanity Studio to upload cover images for each area (the schema requires one before publishing).'
  )
}

run().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
