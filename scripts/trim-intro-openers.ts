/**
 * The Golf and Beaches intros now have a title of their own built from their
 * opening line, so drop that line from the text to avoid saying it twice:
 *   Golf     "Three championship courses. Endless ocean views. " → starts "A golfing legacy…"
 *   Beaches  first paragraph ("Some places are meant to be admired…") removed
 * Only trims text that still starts with those exact lines — safe to re-run.
 *
 *   npx tsx scripts/trim-intro-openers.ts --dataset development [--dry-run]
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

const strip = (text: string | undefined, prefix: string) =>
  text && text.startsWith(prefix) ? text.slice(prefix.length).replace(/^\s+/, '') : null

async function main() {
  console.log(`dataset: ${dataset}${dryRun ? ' (dry run)' : ''}`)
  const golf = await client.fetch(`*[_id == "pageHero-golf"][0]{ _id, subtitle_en, subtitle_es }`)
  const beaches = await client.fetch(
    `*[_type == "resortGuide" && slug.current == "beaches" && !(_id in path("drafts.**"))][0]{ _id, intro_en, intro_es }`
  )
  const jobs: { id: string; set: Record<string, string>; label: string }[] = []
  if (golf) {
    const set: Record<string, string> = {}
    const en = strip(golf.subtitle_en, 'Three championship courses. Endless ocean views.')
    const es = strip(golf.subtitle_es, 'Tres campos de campeonato. Vistas infinitas al mar.')
    if (en) set.subtitle_en = en
    if (es) set.subtitle_es = es
    if (Object.keys(set).length) jobs.push({ id: golf._id, set, label: 'Golf' })
  }
  if (beaches) {
    const set: Record<string, string> = {}
    const en = strip(beaches.intro_en, 'Some places are meant to be admired. Others are meant to be experienced.')
    const es = strip(beaches.intro_es, 'Hay lugares que se visitan. Otros se viven.')
    if (en) set.intro_en = en
    if (es) set.intro_es = es
    if (Object.keys(set).length) jobs.push({ id: beaches._id, set, label: 'Beaches & Islands' })
  }
  if (!jobs.length) return console.log('Nothing to trim.')
  for (const j of jobs) {
    for (const [k, v] of Object.entries(j.set)) console.log(`${j.label} ${k} → "${v.slice(0, 70)}…"`)
    if (!dryRun) await client.patch(j.id).set(j.set).commit()
  }
  console.log(dryRun ? 'dry run — nothing written' : 'done')
}

main().catch((e) => {
  console.error(e.message ?? e)
  process.exit(1)
})
