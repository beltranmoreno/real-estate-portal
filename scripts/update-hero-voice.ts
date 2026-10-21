/**
 * One-off: move the Concierge and Restaurants page-hero subtitles from
 * "Leticia" to "we". Only the exact old phrases are replaced, so any other
 * edits made in Studio are kept.
 *
 *   npx tsx scripts/update-hero-voice.ts --dataset development [--dry-run]
 */
import { createClient } from '@sanity/client'
import { config } from 'dotenv'

config({ path: '.env.local' })

const args = process.argv.slice(2)
const dataset = args[args.indexOf('--dataset') + 1] || process.env.NEXT_PUBLIC_SANITY_DATASET
const dryRun = args.includes('--dry-run')

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset,
  apiVersion: '2025-09-06',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
})

const REPLACEMENTS: Record<string, [string, string][]> = {
  'pageHero-concierge': [
    ['When you rent with Leticia,', 'When you rent with us,'],
    ['Cuando alquilas con Leticia,', 'Cuando alquilas con nosotros,'],
  ],
  'pageHero-restaurants': [
    ['and the ones Leticia books for guests.', 'and the ones we book for our guests.'],
    ['y los que Leticia reserva para sus huéspedes.', 'y los que reservamos para nuestros huéspedes.'],
  ],
}

async function main() {
  for (const [id, reps] of Object.entries(REPLACEMENTS)) {
    const doc = await client.getDocument(id)
    if (!doc) {
      console.log(`${id}: not found, skipped`)
      continue
    }
    const set: Record<string, string> = {}
    for (const field of ['subtitle_en', 'subtitle_es']) {
      let value = doc[field] as string | undefined
      if (!value) continue
      for (const [from, to] of reps) value = value.replace(from, to)
      if (value !== doc[field]) set[field] = value
    }
    if (Object.keys(set).length === 0) {
      console.log(`${id}: already up to date`)
      continue
    }
    console.log(`${id}: updating ${Object.keys(set).join(', ')}${dryRun ? ' (dry run)' : ''}`)
    if (!dryRun) await client.patch(id).set(set).commit()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
