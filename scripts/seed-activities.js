/**
 * Seed Casa de Campo activities (Studio → Local Guide → Activities). They
 * are listed on the Activities guide page (/info/activities), grouped by
 * category. Activities are not concierge services.
 *
 * Usage:
 *   yarn seed-activities              # dataset from .env.local
 *   yarn seed-activities --dataset production
 *   yarn seed-activities --dry-run
 *
 * Idempotent: deterministic ids (`activity-<slug>`); an activity matching an
 * existing one by name or slug is skipped. Where a matching Map Attraction
 * exists in the dataset, the activity's "Where" is linked to it.
 */
const { createClient } = require('@sanity/client')
const path = require('path')
const dotenv = require('dotenv')

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const argDataset = (() => {
  const i = process.argv.indexOf('--dataset')
  return i > -1 ? process.argv[i + 1] : null
})()
const dryRun = process.argv.includes('--dry-run')

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: argDataset || process.env.NEXT_PUBLIC_SANITY_DATASET || 'development',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
  apiVersion: '2025-09-06',
})

if (!process.env.SANITY_API_WRITE_TOKEN) {
  console.error('Missing SANITY_API_WRITE_TOKEN in .env.local')
  process.exit(1)
}

// category: sports | water | land | excursion | family
// where: Map Attraction slug (matched by slug, linked only if it exists)
const ACTIVITIES = [
  // ── Sports ──────────────────────────────────────────────────────────────
  {
    name: ['Golf', 'Golf'], slug: 'golf', category: 'sports', where: 'teeth-of-the-dog',
    summary: ['Three Pete Dye courses: Teeth of the Dog, Dye Fore and The Links.', 'Tres campos de Pete Dye: Teeth of the Dog, Dye Fore y The Links.'],
  },
  {
    name: ['Tennis', 'Tenis'], slug: 'tennis', category: 'sports', where: 'la-terraza-tennis',
    summary: ['Clay courts, lessons and clinics at La Terraza Tennis Center.', 'Canchas de arcilla, clases y clínicas en La Terraza Tennis Center.'],
  },
  {
    name: ['Padel', 'Pádel'], slug: 'padel', category: 'sports', where: 'la-terraza-tennis',
    summary: ['Padel courts with equipment and lessons available.', 'Canchas de pádel con equipo y clases disponibles.'],
  },
  {
    name: ['Pickleball', 'Pickleball'], slug: 'pickleball', category: 'sports', where: 'la-terraza-tennis',
    summary: ['Pickleball courts, easy to pick up for all ages.', 'Canchas de pickleball, fácil de aprender a cualquier edad.'],
  },
  {
    name: ['Shooting Center', 'Centro de Tiro'], slug: 'shooting-center', category: 'sports', where: 'shooting-center',
    summary: ['Sporting clays, skeet and trap, with instruction for beginners.', 'Sporting clays, skeet y trap, con instrucción para principiantes.'],
  },
  {
    name: ['Polo', 'Polo'], slug: 'polo', category: 'sports', where: 'equestrian-center',
    summary: ['Watch a match or take a lesson at the resort’s polo fields.', 'Mira un partido o toma una clase en los campos de polo del resort.'],
  },

  // ── On land ─────────────────────────────────────────────────────────────
  {
    name: ['Horseback Riding', 'Paseos a caballo'], slug: 'horseback-riding', category: 'land', where: 'equestrian-center',
    summary: ['Trail rides and lessons at the Equestrian Center.', 'Paseos y clases en el Centro Ecuestre.'],
  },
  {
    name: ['ATV Tours', 'Tours en ATV'], slug: 'atv-tours', category: 'land',
    summary: ['Guided ATV rides through the countryside around the resort.', 'Recorridos guiados en ATV por el campo alrededor del resort.'],
  },

  // ── On the water ────────────────────────────────────────────────────────
  {
    name: ['Yacht Charter', 'Alquiler de yate'], slug: 'yacht-charter', category: 'water', where: 'la-marina-casa-de-campo',
    summary: ['Private yachts from La Marina, by the half or full day.', 'Yates privados desde La Marina, por medio día o día completo.'],
  },
  {
    name: ['Sailing', 'Vela'], slug: 'sailing', category: 'water', where: 'la-marina-casa-de-campo',
    summary: ['Sailing outings and lessons along the coast.', 'Salidas y clases de vela por la costa.'],
  },
  {
    name: ['Deep-Sea Fishing', 'Pesca de altura'], slug: 'deep-sea-fishing', category: 'water', where: 'la-marina-casa-de-campo',
    summary: ['Sport-fishing charters from La Marina.', 'Salidas de pesca deportiva desde La Marina.'],
  },
  {
    name: ['Banana Boat', 'Banana boat'], slug: 'banana-boat', category: 'water', where: 'minitas-beach-club',
    summary: ['Banana boat rides off Minitas beach.', 'Paseos en banana boat frente a la playa Minitas.'],
  },
  {
    name: ['Jet Ski', 'Moto acuática'], slug: 'jet-ski', category: 'water', where: 'minitas-beach-club',
    summary: ['Jet ski rentals and guided rides.', 'Alquiler de motos acuáticas y paseos guiados.'],
  },
  {
    name: ['Kayak & Paddleboard', 'Kayak y paddleboard'], slug: 'kayak-paddleboard', category: 'water', where: 'minitas-beach-club',
    summary: ['Kayaks and stand-up paddleboards on the calm water at Minitas.', 'Kayaks y paddleboards en las aguas tranquilas de Minitas.'],
  },
  {
    name: ['Snorkeling & Diving', 'Snorkel y buceo'], slug: 'snorkeling-diving', category: 'water',
    summary: ['Reef snorkelling and dives, including around Catalina Island.', 'Snorkel y buceo en arrecifes, incluida la isla Catalina.'],
  },

  // ── Excursions ──────────────────────────────────────────────────────────
  {
    name: ['Saona Island', 'Isla Saona'], slug: 'saona-island', category: 'excursion',
    summary: ['A day by boat to Saona’s beaches and natural pools.', 'Un día en barco a las playas y piscinas naturales de Saona.'],
  },
  {
    name: ['Catalina Island', 'Isla Catalina'], slug: 'catalina-island', category: 'excursion',
    summary: ['A short boat ride to Catalina for snorkelling and a quiet beach.', 'Un corto paseo en barco a Catalina para hacer snorkel y una playa tranquila.'],
  },
]

const norm = (s) =>
  (s || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()

async function main() {
  const dataset = client.config().dataset
  console.log(`${dryRun ? '[dry run] ' : ''}Seeding activities into "${dataset}"…`)

  const [existing, attractions] = await Promise.all([
    client.fetch(`*[_type == "activity"]{ _id, name_en, name_es, "slug": slug.current }`),
    client.fetch(`*[_type == "attraction"]{ _id, "slug": slug.current }`),
  ])
  const takenNames = new Set(existing.flatMap((a) => [norm(a.name_en), norm(a.name_es)]).filter(Boolean))
  const takenSlugs = new Set(existing.map((a) => a.slug).filter(Boolean))
  const takenIds = new Set(existing.map((a) => a._id))
  const attractionBySlug = new Map(attractions.map((a) => [a.slug, a._id]))

  // Order within each category follows the list above.
  const orderInCategory = {}
  let created = 0
  for (const a of ACTIVITIES) {
    orderInCategory[a.category] = (orderInCategory[a.category] ?? 0) + 10
    const id = `activity-${a.slug}`
    if (takenIds.has(id) || takenSlugs.has(a.slug) || a.name.some((n) => takenNames.has(norm(n)))) {
      console.log(`  • ${a.name[0]} — already exists, skipping`)
      continue
    }

    const whereId = a.where ? attractionBySlug.get(a.where) : null
    const doc = {
      _id: id,
      _type: 'activity',
      name_en: a.name[0],
      name_es: a.name[1],
      slug: { _type: 'slug', current: a.slug },
      category: a.category,
      summary_en: a.summary[0],
      summary_es: a.summary[1],
      order: orderInCategory[a.category],
      isActive: true,
      ...(whereId ? { location: { _type: 'reference', _ref: whereId } } : {}),
    }

    if (!dryRun) await client.createIfNotExists(doc)
    created++
    console.log(`  ✓ ${a.name[0]} (${a.category}${whereId ? `, at ${a.where}` : ''})`)
  }

  console.log(`${dryRun ? 'Would create' : 'Created'} ${created} activit${created === 1 ? 'y' : 'ies'}.`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
