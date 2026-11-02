/**
 * Creates the "Owners page" doc in Studio (why owners work with us, what we
 * do, how it works, contact intro), pre-filled with the shipped copy. Only
 * created, never overwritten, so it's safe to re-run. The hero is a Page
 * Hero: scripts/update-page-hero.ts owners.
 *
 *   npx tsx scripts/update-owners.ts --dataset development [--dry-run]
 */
import { createClient } from '@sanity/client'
import { config } from 'dotenv'
import { OWNERS_PAGE_DEFAULTS as D, OWNERS_PAGE_ID } from '../sanity/lib/ownersPageDefaults'

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

type Bi = { en: string; es: string }
const bi = (name: string, v: Bi) => ({ [`${name}_en`]: v.en, [`${name}_es`]: v.es })
const points = (prefix: string, items: { title: Bi; body: Bi }[]) =>
  items.map((p, i) => ({ _key: `${prefix}${i + 1}`, _type: 'point', ...bi('title', p.title), ...bi('body', p.body) }))

async function main() {
  const doc = {
    _id: OWNERS_PAGE_ID,
    _type: 'ownersPage',
    ...bi('whyEyebrow', D.why.eyebrow),
    ...bi('whyTitle', D.why.title),
    reasons: points('reason', D.why.items),
    ...bi('servicesEyebrow', D.services.eyebrow),
    services: D.services.items.map((s, i) => ({
      _key: `service${i + 1}`,
      _type: 'ownerService',
      ...bi('eyebrow', s.eyebrow),
      ...bi('title', s.title),
      list_en: s.list.map((l) => l.en),
      list_es: s.list.map((l) => l.es),
      ...bi('buttonLabel', s.buttonLabel),
      href: s.href,
    })),
    ...bi('howEyebrow', D.how.eyebrow),
    ...bi('howTitle', D.how.title),
    steps: points('step', D.how.items),
    ...bi('contactEyebrow', D.contact.eyebrow),
    ...bi('contactTitle', D.contact.title),
    ...bi('contactBody', D.contact.body),
  }

  if (await client.getDocument(OWNERS_PAGE_ID)) {
    console.log(`${dataset}: ${OWNERS_PAGE_ID} already exists, left as is`)
    return
  }
  if (dryRun) return console.log(JSON.stringify(doc, null, 2))
  await client.createIfNotExists(doc)
  console.log(`${dataset}: created ${OWNERS_PAGE_ID}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
