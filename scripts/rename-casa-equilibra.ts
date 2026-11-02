/**
 * Fixes the spelling of the Casa Equilibra place (it was created as
 * "Casa Equilibria"): its name, slug and the name inside its descriptions.
 *
 *   npx tsx scripts/rename-casa-equilibra.ts --dataset development
 */
import { createClient } from '@sanity/client'
import { config } from 'dotenv'

config({ path: '.env.local' })

const args = process.argv.slice(2)
const dataset = args[args.indexOf('--dataset') + 1] || process.env.NEXT_PUBLIC_SANITY_DATASET

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset,
  apiVersion: '2025-09-06',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
})

const FIELDS = ['name_en', 'name_es', 'summary_en', 'summary_es'] as const

async function main() {
  const tx = client.transaction()
  let count = 0
  for (const id of ['landmark-casa-equilibria', 'drafts.landmark-casa-equilibria']) {
    const doc = await client.getDocument(id)
    if (!doc) continue
    const set: Record<string, any> = { slug: { _type: 'slug', current: 'casa-equilibra' } }
    for (const f of FIELDS) {
      if (typeof doc[f] === 'string') set[f] = doc[f].replace(/Equilibria/g, 'Equilibra')
    }
    tx.patch(id, (p) => p.set(set))
    count++
  }
  if (!count) return console.log(`${dataset}: no Casa Equilibria place found`)
  await tx.commit()
  console.log(`${dataset}: renamed to Casa Equilibra`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
