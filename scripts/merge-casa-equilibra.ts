/**
 * Casa Equilibra existed twice: as a Place (Altos de Chavón guide) and as an
 * Activity (Activities page). Keeps the Activity: guides that listed the Place
 * now list the Activity, with the Place's longer description kept as the
 * guide's note. Then deletes the Place.
 *
 *   npx tsx scripts/merge-casa-equilibra.ts --dataset development [--dry-run]
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
  perspective: 'raw',
})

const ACTIVITY = 'activity-casa-equilibra'

async function main() {
  // Either spelling (it was first created as "Equilibria").
  const places: any[] = await client.fetch(
    `*[_type == "landmark" && name_en match "Casa Equilibr*" && !(_id in path("drafts.**"))]{ _id, summary_en, summary_es }`
  )
  if (!places.length) return console.log(`${dataset}: no Casa Equilibra place, nothing to do`)
  if (!(await client.getDocument(ACTIVITY))) {
    return console.log(`${dataset}: ${ACTIVITY} doesn't exist — run update-activities.ts first`)
  }

  const tx = client.transaction()
  const log: string[] = []
  for (const place of places) {
    const ids = [place._id, `drafts.${place._id}`]
    const referrers: any[] = await client.fetch(`*[references($ids)]`, { ids })

    for (const doc of referrers) {
      // Swap every reference to the place, and give the entry holding it the
      // place's description unless it already has its own.
      const swap = (node: any): any => {
        if (Array.isArray(node)) return node.map(swap)
        if (!node || typeof node !== 'object') return node
        const out: any = {}
        for (const [k, v] of Object.entries(node)) out[k] = swap(v)
        // Checked on the original node: the loop above already swapped its venue.
        if (ids.includes(node.venue?._ref)) {
          if (!out.note_en && !out.note_es) {
            out.note_en = place.summary_en
            out.note_es = place.summary_es
          }
        }
        if (out._type === 'reference' && ids.includes(out._ref)) out._ref = ACTIVITY
        return out
      }
      const { _id, _rev, _type, _createdAt, _updatedAt, ...fields } = doc
      tx.patch(_id, (p) => p.ifRevisionId(_rev).set(swap(fields)))
      log.push(`  ~ ${_id}: now lists the activity`)
    }

    for (const id of ids) {
      if (await client.getDocument(id)) {
        tx.delete(id)
        log.push(`  - ${id}`)
      }
    }
  }

  console.log(`${dataset}:\n${log.join('\n')}`)
  if (dryRun) return
  await tx.commit()
  console.log('Done.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
