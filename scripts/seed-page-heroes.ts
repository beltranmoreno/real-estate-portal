/**
 * Pre-fill every page's hero (Studio → Page Heroes) with the copy the site
 * shipped with:
 *  - Homepage: fills the hero text on the Homepage doc (sanity/lib/heroDefaults.ts)
 *  - Other pages: creates their Page Hero docs (sanity/lib/pageHeroDefaults.ts)
 * Never overwrites edits — only empty fields / missing docs are filled.
 *
 * Usage:
 *   npx tsx scripts/seed-page-heroes.ts                      # dataset from .env.local
 *   npx tsx scripts/seed-page-heroes.ts --dataset production
 */
import { createClient } from '@sanity/client'
import path from 'path'
import dotenv from 'dotenv'
import { PAGE_HEROES, pageHeroId, type PageHeroKey } from '../sanity/lib/pageHeroDefaults'
import { HERO_TEXT_DEFAULTS as H } from '../sanity/lib/heroDefaults'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const i = process.argv.indexOf('--dataset')
const dataset = (i > -1 ? process.argv[i + 1] : null) || process.env.NEXT_PUBLIC_SANITY_DATASET || 'development'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset,
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
  apiVersion: '2025-09-06',
})

async function main() {
  if (!process.env.SANITY_API_WRITE_TOKEN) throw new Error('Missing SANITY_API_WRITE_TOKEN in .env.local')
  console.log(`Seeding page heroes into "${dataset}"…`)

  // Homepage — text only; its photos/video are set in Studio.
  const homepageText = {
    heroEyebrow_en: H.eyebrow.en,
    heroEyebrow_es: H.eyebrow.es,
    heroTitle_en: H.title.en,
    heroTitle_es: H.title.es,
    heroSubtitle_en: H.subtitle.en,
    heroSubtitle_es: H.subtitle.es,
  }
  await client.createIfNotExists({ _id: 'homepageMediaConfig', _type: 'homepageMediaConfig', ...homepageText })
  await client.patch('homepageMediaConfig').setIfMissing(homepageText).commit()
  console.log('  ✓ Homepage (homepageMediaConfig — empty hero text filled)')
  for (const key of Object.keys(PAGE_HEROES) as PageHeroKey[]) {
    const d = PAGE_HEROES[key] as (typeof PAGE_HEROES)[PageHeroKey] & {
      primary?: { label: { en: string; es: string }; href: string }
      secondary?: { label: { en: string; es: string }; href: string }
    }
    const res = await client.createIfNotExists({
      _id: pageHeroId(key),
      _type: 'pageHero',
      eyebrow_en: d.eyebrow.en,
      eyebrow_es: d.eyebrow.es,
      title_en: d.title.en,
      title_es: d.title.es,
      subtitle_en: d.subtitle.en,
      subtitle_es: d.subtitle.es,
      overlay: 35,
      ...(d.primary
        ? { primaryLabel_en: d.primary.label.en, primaryLabel_es: d.primary.label.es, primaryHref: d.primary.href }
        : {}),
      ...(d.secondary
        ? { secondaryLabel_en: d.secondary.label.en, secondaryLabel_es: d.secondary.label.es, secondaryHref: d.secondary.href }
        : {}),
    })
    console.log(`  ✓ ${d.label} (${res._id})`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
