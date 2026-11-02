/**
 * Creates the "About page" doc in Studio (founder heading, figures, brand,
 * philosophy, what we do, contact, for owners), pre-filled with the shipped copy, and replaces "residence(s)"
 * with "property/properties" (EN and ES) in the text fields of Studio docs
 * (property listings excluded). The About doc is only created, never
 * overwritten, so it's safe to re-run.
 *
 *   npx tsx scripts/update-about.ts --dataset development [--dry-run]
 */
import { createClient } from '@sanity/client'
import { config } from 'dotenv'
import { ABOUT_PAGE_DEFAULTS as D, ABOUT_PAGE_ID } from '../sanity/lib/aboutPageDefaults'

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

const REPLACEMENTS: [RegExp, string][] = [
  [/Residences/g, 'Properties'],
  [/residences/g, 'properties'],
  [/Residence/g, 'Property'],
  [/residence/g, 'property'],
  [/Residencias/g, 'Propiedades'],
  [/residencias/g, 'propiedades'],
  [/Residencia/g, 'Propiedad'],
  [/residencia/g, 'propiedad'],
]
const replaceAll = (s: string) => REPLACEMENTS.reduce((acc, [re, to]) => acc.replace(re, to), s)

async function main() {
  const tx = client.transaction()

  tx.createIfNotExists({
    _id: ABOUT_PAGE_ID,
    _type: 'aboutPage',
    founderEyebrow_en: D.founder.eyebrow.en,
    founderEyebrow_es: D.founder.eyebrow.es,
    founderTitle_en: D.founder.title.en,
    founderTitle_es: D.founder.title.es,
    propertiesStat: D.stats.properties,
    bookingsStat: D.stats.bookings,
    brandEyebrow_en: D.brand.eyebrow.en,
    brandEyebrow_es: D.brand.eyebrow.es,
    brandTitle_en: D.brand.title.en,
    brandTitle_es: D.brand.title.es,
    brandBody_en: D.brand.body.en,
    brandBody_es: D.brand.body.es,
    philosophyTitle_en: D.philosophy.title.en,
    philosophyTitle_es: D.philosophy.title.es,
    philosophy: D.philosophy.items.map((p, i) => ({
      _key: `principle${i + 1}`,
      _type: 'principle',
      title_en: p.title.en,
      title_es: p.title.es,
      body_en: p.body.en,
      body_es: p.body.es,
    })),
  })

  // Sections added after the doc was first created.
  tx.patch(ABOUT_PAGE_ID, (p) =>
    p.setIfMissing({
      contactEyebrow_en: D.contact.eyebrow.en,
      contactEyebrow_es: D.contact.eyebrow.es,
      contactTitle_en: D.contact.title.en,
      contactTitle_es: D.contact.title.es,
      contactBody_en: D.contact.body.en,
      contactBody_es: D.contact.body.es,
      ownersEyebrow_en: D.owners.eyebrow.en,
      ownersEyebrow_es: D.owners.eyebrow.es,
      ownersTitle_en: D.owners.title.en,
      ownersTitle_es: D.owners.title.es,
      ownersBody_en: D.owners.body.en,
      ownersBody_es: D.owners.body.es,
      whatWeDoEyebrow_en: D.whatWeDo.eyebrow.en,
      whatWeDoEyebrow_es: D.whatWeDo.eyebrow.es,
      offerings: D.whatWeDo.items.map((o, i) => ({
        _key: `offering${i + 1}`,
        _type: 'offering',
        eyebrow_en: o.eyebrow.en,
        eyebrow_es: o.eyebrow.es,
        title_en: o.title.en,
        title_es: o.title.es,
        body_en: o.body.en,
        body_es: o.body.es,
        buttonLabel_en: o.buttonLabel.en,
        buttonLabel_es: o.buttonLabel.es,
        href: o.href,
      })),
    })
  )

  // Top-level text fields only; listings keep their own wording.
  const docs: any[] = await client.fetch(
    `*[!(_type in ["property", "sanity.imageAsset", "sanity.fileAsset"]) && !(_id in path("drafts.**"))]`
  )
  const changes: string[] = []
  for (const d of docs) {
    const set: Record<string, string> = {}
    for (const [k, v] of Object.entries(d)) {
      if (k.startsWith('_') || typeof v !== 'string' || !/residenc/i.test(v)) continue
      set[k] = replaceAll(v)
      changes.push(`  ${d._id}.${k}: ${set[k].slice(0, 90)}`)
    }
    if (Object.keys(set).length) tx.patch(d._id, (p) => p.set(set))
  }

  console.log(`${dataset}: About page doc + ${changes.length} wording changes`)
  changes.forEach((c) => console.log(c))
  if (dryRun) return
  await tx.commit()
  console.log('Done.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
