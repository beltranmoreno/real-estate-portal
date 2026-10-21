/**
 * Airports as documents + pre-filled on every property.
 *
 *  1. Creates the three Airport docs (LRM, PUJ, SDQ) if missing.
 *  2. On every property (published and draft): links each old free-text
 *     airport entry to its Airport doc by name (an unnamed entry with only a
 *     distance is the old "distance to airport" → La Romana), keeps any
 *     distance entered (filling missing distance/drive time with defaults),
 *     and adds whichever of the three is missing with the default distance
 *     and drive time. Never removes entries or changes entered numbers.
 *
 * Usage:
 *   npx tsx scripts/seed-airports.ts                          # dataset from .env.local
 *   npx tsx scripts/seed-airports.ts --dataset production --dry-run
 *   npx tsx scripts/seed-airports.ts --dataset production
 */
import { createClient } from '@sanity/client'
import path from 'path'
import dotenv from 'dotenv'
import { DEFAULT_AIRPORTS } from '../sanity/lib/airportDefaults'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const i = process.argv.indexOf('--dataset')
const dataset = (i > -1 ? process.argv[i + 1] : null) || process.env.NEXT_PUBLIC_SANITY_DATASET || 'development'
const dryRun = process.argv.includes('--dry-run')

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset,
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
  apiVersion: '2025-09-06',
})

const norm = (s?: string) =>
  (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z ]+/g, ' ').trim()

const matchAirport = (name?: string) => {
  const n = norm(name)
  if (!n) return null
  return DEFAULT_AIRPORTS.find((a) => a.aliases.some((alias) => n.includes(norm(alias)))) ?? null
}

async function main() {
  if (!process.env.SANITY_API_WRITE_TOKEN) throw new Error('Missing SANITY_API_WRITE_TOKEN in .env.local')
  console.log(`${dryRun ? '[dry run] ' : ''}Airports on "${dataset}"…`)

  for (const [idx, a] of DEFAULT_AIRPORTS.entries()) {
    if (!dryRun) await client.createIfNotExists({ _id: a.id, _type: 'airport', name: a.name, code: a.code, order: (idx + 1) * 10 })
  }
  console.log(`  ✓ Airport docs: ${DEFAULT_AIRPORTS.map((a) => a.code).join(', ')}`)

  const props: { _id: string; title?: string; airports?: any[] }[] = await client.fetch(
    `*[_type == "property"]{ _id, "title": coalesce(title_en, title_es), "airports": location.airports }`
  )

  let changed = 0
  for (const p of props) {
    const before = Array.isArray(p.airports) ? p.airports : []
    const after = before.map((item: any, n: number) => {
      const linked = item?.airport?._ref
      // Unnamed entries came from the old single "distance to airport" field,
      // which meant the nearest airport — La Romana.
      const match = linked
        ? null
        : matchAirport(item?.name) ?? (!item?.name && typeof item?.distanceKm === 'number' ? DEFAULT_AIRPORTS[0] : null)
      const ref = linked || match?.id
      const def = DEFAULT_AIRPORTS.find((a) => a.id === ref)
      return {
        ...item,
        _key: item?._key || `airport-${n}`,
        _type: 'airportDistance',
        ...(match ? { airport: { _type: 'reference', _ref: match.id } } : {}),
        // Fill numbers that were never entered with the defaults.
        ...(def && typeof item?.distanceKm !== 'number' ? { distanceKm: def.distanceKm } : {}),
        ...(def && typeof item?.driveTime !== 'number' ? { driveTime: def.driveTime } : {}),
      }
    })
    const present = new Set(after.map((it: any) => it.airport?._ref).filter(Boolean))
    for (const a of DEFAULT_AIRPORTS) {
      if (!present.has(a.id)) {
        after.push({
          _key: a.code.toLowerCase(),
          _type: 'airportDistance',
          airport: { _type: 'reference', _ref: a.id },
          distanceKm: a.distanceKm,
          driveTime: a.driveTime,
        })
      }
    }
    if (JSON.stringify(after) === JSON.stringify(before)) continue
    changed++
    const linked = after.filter((it: any, n: number) => it.airport && !before[n]?.airport?._ref && n < before.length).length
    console.log(`  ↻ ${p.title || p._id}: ${before.length} → ${after.length} airports${linked ? ` (${linked} linked)` : ''}`)
    if (!dryRun) {
      await client.patch(p._id).setIfMissing({ location: {} }).set({ 'location.airports': after }).commit()
    }
  }
  console.log(`${dryRun ? 'Would update' : 'Updated'} ${changed} of ${props.length} properties.`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
