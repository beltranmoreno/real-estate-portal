/**
 * Copies a page hero's title and intro from sanity/lib/pageHeroDefaults.ts
 * into its Studio doc, for when the copy changes after the doc was created.
 * Only overwrites the title and subtitle, plus the buttons with --buttons
 * (a button the defaults don't have is removed).
 *
 *   npx tsx scripts/update-page-hero.ts restaurants golf                      # dataset from .env.local
 *   npx tsx scripts/update-page-hero.ts restaurants golf --dataset production
 *   npx tsx scripts/update-page-hero.ts concierge --buttons
 */
import { createClient } from '@sanity/client'
import path from 'path'
import dotenv from 'dotenv'
import { PAGE_HEROES, pageHeroId, type Bi, type PageHeroKey } from '../sanity/lib/pageHeroDefaults'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const i = process.argv.indexOf('--dataset')
const dataset = (i > -1 ? process.argv[i + 1] : null) || process.env.NEXT_PUBLIC_SANITY_DATASET || 'development'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-09-06',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
})

async function main() {
  const keys = process.argv.slice(2).filter((a, n, all) => !a.startsWith('--') && all[n - 1] !== '--dataset')
  const unknown = keys.filter((k) => !(k in PAGE_HEROES))
  if (!keys.length || unknown.length) {
    console.error(`Name the heroes to update: ${Object.keys(PAGE_HEROES).join(', ')}`)
    process.exit(1)
  }

  for (const key of keys as PageHeroKey[]) {
    const d = PAGE_HEROES[key]
    const fields: Record<string, string> = {
      title_en: d.title.en,
      title_es: d.title.es,
      subtitle_en: d.subtitle.en,
      subtitle_es: d.subtitle.es,
    }
    const unset: string[] = []
    if (process.argv.includes('--buttons')) {
      for (const which of ['primary', 'secondary'] as const) {
        const btn = (d as { primary?: { label: Bi; href: string }; secondary?: { label: Bi; href: string } })[which]
        const keys = [`${which}Label_en`, `${which}Label_es`, `${which}Href`]
        if (btn) Object.assign(fields, { [keys[0]]: btn.label.en, [keys[1]]: btn.label.es, [keys[2]]: btn.href })
        else unset.push(...keys)
      }
    }
    const id = pageHeroId(key)
    if (!(await client.getDocument(id))) {
      console.log(`- ${d.label}: no doc in "${dataset}" yet (scripts/seed-page-heroes.ts creates it)`)
      continue
    }
    const tx = client.transaction().patch(id, (p) => p.set(fields).unset(unset))
    // An unpublished Studio edit would otherwise hide the new copy on publish.
    if (await client.getDocument(`drafts.${id}`)) tx.patch(`drafts.${id}`, (p) => p.set(fields).unset(unset))
    await tx.commit()
    console.log(`✓ ${d.label} hero updated in "${dataset}"`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
