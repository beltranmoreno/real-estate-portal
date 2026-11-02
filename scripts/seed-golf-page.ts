/**
 * Creates the "Golf page" doc in Studio, pre-filled with the shipped copy.
 * Does nothing if the doc already exists, so Studio edits are never
 * overwritten.
 *
 *   npx tsx scripts/seed-golf-page.ts --dataset development [--dry-run]
 */
import { createClient } from '@sanity/client'
import { config } from 'dotenv'
import { GOLF_PAGE_DEFAULTS as D, GOLF_PAGE_ID } from '../sanity/lib/golfPageDefaults'

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

async function main() {
  if (await client.getDocument(GOLF_PAGE_ID)) {
    console.log(`${dataset}: ${GOLF_PAGE_ID} already exists, left as is`)
    return
  }

  const doc = {
    _id: GOLF_PAGE_ID,
    _type: 'golfPage',
    aboutEyebrow_en: D.about.eyebrow.en,
    aboutEyebrow_es: D.about.eyebrow.es,
    aboutTitle_en: D.about.title.en,
    aboutTitle_es: D.about.title.es,
    aboutBody_en: D.about.body.en,
    aboutBody_es: D.about.body.es,
  }

  if (dryRun) {
    console.log(JSON.stringify(doc, null, 2))
    return
  }
  await client.createIfNotExists(doc)
  console.log(`${dataset}: created ${GOLF_PAGE_ID}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
