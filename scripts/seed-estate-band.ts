/**
 * Creates the homepage "The resort band" doc in Studio, pre-filled with the
 * shipped copy and the photo the band showed before it was editable (the
 * second homepage hero photo). Does nothing if the doc already exists, so
 * Studio edits are never overwritten.
 *
 *   npx tsx scripts/seed-estate-band.ts --dataset development [--dry-run]
 */
import { createClient } from '@sanity/client'
import { config } from 'dotenv'
import { ESTATE_BAND_DEFAULTS as D, ESTATE_BAND_ID } from '../sanity/lib/estateBandDefaults'

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
  if (await client.getDocument(ESTATE_BAND_ID)) {
    console.log(`${dataset}: ${ESTATE_BAND_ID} already exists, left as is`)
    return
  }

  const heroImages: any[] = (await client.fetch(`*[_id == "homepageMediaConfig"][0].heroImages`)) ?? []
  const photo = (heroImages[1] ?? heroImages[0])?.asset?._ref

  const doc = {
    _id: ESTATE_BAND_ID,
    _type: 'estateBand',
    ...(photo ? { image: { _type: 'image', asset: { _type: 'reference', _ref: photo } } } : {}),
    eyebrow_en: D.eyebrow.en,
    eyebrow_es: D.eyebrow.es,
    title_en: D.title.en,
    title_es: D.title.es,
    body_en: D.body.en,
    body_es: D.body.es,
    buttonLabel_en: D.button.label.en,
    buttonLabel_es: D.button.label.es,
    buttonHref: D.button.href,
  }

  if (dryRun) {
    console.log(JSON.stringify(doc, null, 2))
    return
  }
  await client.createIfNotExists(doc)
  console.log(`${dataset}: created ${ESTATE_BAND_ID}${photo ? ' with the current homepage photo' : ' (no photo found)'}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
