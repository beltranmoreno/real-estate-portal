/**
 * Creates the "Casa de Campo page" doc in Studio, pre-filled with the launch
 * copy (photos are added in Studio). Does nothing if the doc already exists,
 * so Studio edits are never overwritten. Also points the homepage resort
 * band's button at the new page if it still links to /about.
 *
 *   npx tsx scripts/seed-casa-de-campo.ts --dataset development [--dry-run]
 */
import { createClient } from '@sanity/client'
import { config } from 'dotenv'
import { CASA_DE_CAMPO_DEFAULTS as D, CASA_DE_CAMPO_ID } from '../sanity/lib/casaDeCampoDefaults'
import { ESTATE_BAND_ID } from '../sanity/lib/estateBandDefaults'

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

const bi = (key: string, v: { en: string; es: string }) => ({ [`${key}_en`]: v.en, [`${key}_es`]: v.es })

async function main() {
  const doc = {
    _id: CASA_DE_CAMPO_ID,
    _type: 'casaDeCampoPage',
    ...bi('heroEyebrow', D.hero.eyebrow),
    ...bi('heroTitle', D.hero.title),
    ...bi('heroIntro', D.hero.intro),
    heroOverlay: 35,
    ...bi('storyEyebrow', D.story.eyebrow),
    ...bi('storyTitle', D.story.title),
    ...bi('storyBody', D.story.body),
    ...bi('archiveEyebrow', D.archive.eyebrow),
    ...bi('archiveTitle', D.archive.title),
    ...bi('archiveIntro', D.archive.intro),
    ...bi('personalEyebrow', D.personal.eyebrow),
    ...bi('personalTitle', D.personal.title),
    ...bi('personalBody', D.personal.body),
    personalName: D.personal.name,
    ...bi('personalRole', D.personal.role),
    ...bi('ctaEyebrow', D.cta.eyebrow),
    ...bi('ctaTitle', D.cta.title),
    ...bi('ctaBody', D.cta.body),
    ...bi('ctaButtonLabel', D.cta.buttonLabel),
    ctaButtonHref: D.cta.buttonHref,
  }

  if (dryRun) {
    console.log(JSON.stringify(doc, null, 2))
    return
  }

  if (await client.getDocument(CASA_DE_CAMPO_ID)) {
    console.log(`${dataset}: ${CASA_DE_CAMPO_ID} already exists, left as is`)
  } else {
    await client.createIfNotExists(doc)
    console.log(`${dataset}: created ${CASA_DE_CAMPO_ID}`)
  }

  const band = await client.getDocument(ESTATE_BAND_ID)
  if (band?.buttonHref === '/about') {
    await client.patch(ESTATE_BAND_ID).set({ buttonHref: '/casa-de-campo' }).commit()
    console.log(`${dataset}: resort band button now links to /casa-de-campo`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
