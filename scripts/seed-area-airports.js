/**
 * Populate every area document's `airports` array with the three airports
 * that serve the region: La Romana (LRM), Punta Cana (PUJ), and Santo
 * Domingo / Las Américas (SDQ).
 *
 * Distances/drive times are approximate from Casa de Campo (La Romana) and
 * are meant as sensible defaults — edit per area in Studio afterward.
 *
 * By default this REPLACES each area's airports array with these three.
 * Use --only-empty to only fill areas that don't already have airports.
 *
 * Usage:
 *   node scripts/seed-area-airports.js               # dry run (logs only)
 *   node scripts/seed-area-airports.js --commit       # apply (replaces airports)
 *   node scripts/seed-area-airports.js --commit --only-empty   # only fill empty
 */
const { createClient } = require('@sanity/client')
const path = require('path')
const dotenv = require('dotenv')

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const commit = process.argv.includes('--commit')
const onlyEmpty = process.argv.includes('--only-empty')

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  // dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  dataset: 'production',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
  apiVersion: '2025-09-06',
})

if (!process.env.SANITY_API_WRITE_TOKEN) {
  console.error('Missing SANITY_API_WRITE_TOKEN in .env.local')
  process.exit(1)
}

// Approximate distances/drive times from Casa de Campo (La Romana).
const AIRPORTS = [
  { _key: 'airport-lrm', _type: 'object', name: 'La Romana (LRM)', distanceKm: 2, driveTime: 5 },
  { _key: 'airport-puj', _type: 'object', name: 'Punta Cana (PUJ)', distanceKm: 75, driveTime: 60 },
  { _key: 'airport-sdq', _type: 'object', name: 'Santo Domingo (SDQ)', distanceKm: 110, driveTime: 70 },
]

async function run() {
  console.log(
    `${commit ? 'COMMIT' : 'Dry run'}${onlyEmpty ? ' (only empty)' : ''} on dataset "${client.config().dataset}"\n`
  )

  const areas = await client.fetch(
    `*[_type == "area"]{ _id, "title": coalesce(title_en, title_es), "count": count(airports) }`
  )

  let updated = 0
  let skipped = 0

  for (const a of areas) {
    const hasAirports = (a.count || 0) > 0
    if (onlyEmpty && hasAirports) {
      skipped++
      console.log(`  skip   ${a.title || a._id} (already has ${a.count})`)
      continue
    }

    updated++
    console.log(
      `  set    ${a.title || a._id} → LRM, PUJ, SDQ${hasAirports ? ` (replaces ${a.count})` : ''}`
    )

    if (commit) {
      await client.patch(a._id).set({ airports: AIRPORTS }).commit()
    }
  }

  console.log(
    `\n${commit ? 'Applied' : 'Would apply'}: ${updated} areas set, ${skipped} skipped`
  )
  if (!commit) console.log('\nRe-run with --commit to apply.')
}

run().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
