/**
 * Seed Casa de Campo activities as concierge services, so Leticia can offer
 * them per booking and guests can request them from the portal.
 *
 * Usage:
 *   yarn seed-activities              # dataset from .env.local
 *   yarn seed-activities --dataset production
 *   yarn seed-activities --dry-run
 *
 * Each activity is its own service even where an umbrella service ("Active
 * Lifestyle", "Boat Experiences") already covers it. Exact duplicates are
 * skipped: a service matching by name, alias or slug is left untouched.
 * No prices are set — add "Price from" in Studio if you want one shown.
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

// category: values from the conciergeService schema (sports | ocean | …)
// icon: keys of app/(main)/services/concierge/iconMap.ts
// mode: schedulingMode — date_time for bookable slots, single_day for outings
const ACTIVITIES = [
  // ── Sports & outdoor ────────────────────────────────────────────────────
  {
    name: ['Golf Tee Times', 'Salidas de golf'], slug: 'golf-tee-times', category: 'sports', icon: 'trophy', mode: 'date_time',
    aliases: ['Tee Times & Golf', 'Tee Times', 'Golf'],
    desc: ['Tee times on Teeth of the Dog, Dye Fore and The Links, arranged for you.', 'Salidas en Teeth of the Dog, Dye Fore y The Links, organizadas por nosotros.'],
  },
  {
    name: ['Tennis', 'Tenis'], slug: 'tennis', category: 'sports', icon: 'trophy', mode: 'date_time',
    aliases: ['Tennis Court Rentals', 'Tennis Court Rental'],
    desc: ['Courts and lessons at La Terraza Tennis Center.', 'Canchas y clases en La Terraza Tennis Center.'],
  },
  {
    name: ['Padel', 'Pádel'], slug: 'padel', category: 'sports', icon: 'trophy', mode: 'date_time',
    aliases: ['Padel Court Rentals', 'Padel Court Rental'],
    desc: ['Padel courts and lessons.', 'Canchas y clases de pádel.'],
  },
  {
    name: ['Pickleball', 'Pickleball'], slug: 'pickleball', category: 'sports', icon: 'trophy', mode: 'date_time',
    aliases: ['Pickleball Court Rentals', 'Pickleball Court Rental'],
    desc: ['Pickleball courts and equipment.', 'Canchas y equipo de pickleball.'],
  },
  {
    name: ['Shooting Center', 'Centro de Tiro'], slug: 'shooting-center', category: 'sports', icon: 'map', mode: 'date_time',
    aliases: ['Shooting', 'Shooting Center Casa de Campo'],
    desc: ['Sporting clays, skeet and trap at the resort’s shooting center.', 'Sporting clays, skeet y trap en el centro de tiro del resort.'],
  },
  {
    name: ['Horseback Riding', 'Paseos a caballo'], slug: 'horseback-riding', category: 'sports', icon: 'map', mode: 'date_time',
    aliases: ['Equestrian Center', 'Horseback'],
    desc: ['Trail rides and lessons at the Equestrian Center.', 'Paseos y clases en el Centro Ecuestre.'],
  },
  {
    name: ['ATV Tours', 'Tours en ATV'], slug: 'atv-tours', category: 'sports', icon: 'map', mode: 'single_day',
    aliases: ['ATV', 'ATVs', 'Four-wheeler tours'],
    desc: ['Guided ATV rides through the countryside around the resort.', 'Recorridos guiados en ATV por el campo alrededor del resort.'],
  },

  // ── On the water ────────────────────────────────────────────────────────
  {
    name: ['Yacht Charter', 'Alquiler de yate'], slug: 'yacht-charter', category: 'ocean', icon: 'ship', mode: 'single_day',
    aliases: ['Yacht & Boat Charters', 'Yacht Charters'],
    desc: ['Private yachts from the Marina, by the half or full day.', 'Yates privados desde la Marina, por medio día o día completo.'],
  },
  {
    name: ['Sailing', 'Vela'], slug: 'sailing', category: 'ocean', icon: 'sailboat', mode: 'single_day',
    desc: ['Sailing outings and lessons along the coast.', 'Salidas y clases de vela por la costa.'],
  },
  {
    name: ['Banana Boat', 'Banana boat'], slug: 'banana-boat', category: 'ocean', icon: 'ship', mode: 'date_time',
    desc: ['Banana boat rides off Minitas beach.', 'Paseos en banana boat frente a la playa Minitas.'],
  },
  {
    name: ['Snorkeling & Diving', 'Snorkel y buceo'], slug: 'snorkeling-diving', category: 'ocean', icon: 'ship', mode: 'single_day',
    aliases: ['Snorkeling', 'Diving', 'Scuba Diving'],
    desc: ['Reef snorkelling and dives, including around Catalina Island.', 'Snorkel y buceo en arrecifes, incluida la isla Catalina.'],
  },
  {
    name: ['Deep-Sea Fishing', 'Pesca de altura'], slug: 'deep-sea-fishing', category: 'ocean', icon: 'ship', mode: 'single_day',
    aliases: ['Fishing', 'Sport Fishing'],
    desc: ['Sport-fishing charters from the Marina.', 'Salidas de pesca deportiva desde la Marina.'],
  },
  {
    name: ['Jet Ski', 'Moto acuática'], slug: 'jet-ski', category: 'ocean', icon: 'ship', mode: 'date_time',
    aliases: ['Jet Skis', 'Waverunner'],
    desc: ['Jet ski rentals and guided rides.', 'Alquiler de motos acuáticas y paseos guiados.'],
  },
  {
    name: ['Kayak & Paddleboard', 'Kayak y paddleboard'], slug: 'kayak-paddleboard', category: 'ocean', icon: 'sailboat', mode: 'date_time',
    aliases: ['Kayak', 'Paddleboard', 'SUP'],
    desc: ['Kayaks and stand-up paddleboards at Minitas beach.', 'Kayaks y paddleboards en la playa Minitas.'],
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

  const existing = await client.fetch(
    `*[_type == "conciergeService"]{ _id, name_en, name_es, "slug": slug.current, order }`
  )
  const takenNames = new Set(existing.flatMap((s) => [norm(s.name_en), norm(s.name_es)]).filter(Boolean))
  const takenSlugs = new Set(existing.map((s) => norm(s.slug)).filter(Boolean))
  const takenIds = new Set(existing.map((s) => s._id))
  let order = Math.max(0, ...existing.map((s) => s.order ?? 0)) + 1

  let created = 0
  for (const a of ACTIVITIES) {
    const names = [...a.name, ...(a.aliases || [])].map(norm)
    if (
      names.some((n) => takenNames.has(n)) ||
      takenSlugs.has(norm(a.slug)) ||
      takenIds.has(`concierge-${a.slug}`)
    ) {
      console.log(`  • ${a.name[0]} — already exists, skipping`)
      continue
    }

    const doc = {
      _id: `concierge-${a.slug}`,
      _type: 'conciergeService',
      name_en: a.name[0],
      name_es: a.name[1],
      slug: { _type: 'slug', current: a.slug },
      category: a.category,
      icon: a.icon,
      schedulingMode: a.mode,
      shortDescription_en: a.desc[0],
      shortDescription_es: a.desc[1],
      isActive: true,
      isFeatured: false,
      order: order++,
    }

    if (!dryRun) await client.createIfNotExists(doc)
    created++
    console.log(`  ✓ ${a.name[0]} (${a.category})`)
  }

  console.log(`${dryRun ? 'Would create' : 'Created'} ${created} activit${created === 1 ? 'y' : 'ies'}.`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
