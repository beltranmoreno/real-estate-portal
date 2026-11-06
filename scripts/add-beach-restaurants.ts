/**
 * Adds a "Dining at the beach" restaurants section to the Beaches & Islands
 * guide, right after Minitas Beach — the same restaurant cards as on The Marina
 * and Altos de Chavón. The section is set to "Restaurants from an area: Minitas
 * Beach", so it always shows every published beach restaurant — new ones appear
 * on their own. Pin or describe specific ones in Studio if you like.
 *
 * Safe to re-run: a section added by an earlier version (a fixed list) is
 * switched over to the area; otherwise nothing changes once it's there.
 *
 *   npx tsx scripts/add-beach-restaurants.ts --dataset development [--dry-run]
 */
import { createClient } from '@sanity/client'
import { config } from 'dotenv'

config({ path: '.env.local' })

const args = process.argv.slice(2)
const dataset = args[args.indexOf('--dataset') + 1] || process.env.NEXT_PUBLIC_SANITY_DATASET
const dryRun = args.includes('--dry-run')
const SECTION_KEY = 'beachdining1'
const AREA = 'beach-club'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset,
  apiVersion: '2025-09-06',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
})

async function main() {
  console.log(`dataset: ${dataset}${dryRun ? ' (dry run)' : ''}`)
  const guide = await client.fetch(
    `*[_type == "resortGuide" && slug.current == "beaches" && !(_id in path("drafts.**"))][0]{ _id, sections[]{ _key, _type, eyebrow_en, restaurantArea, "count": count(items) } }`
  )
  if (!guide) throw new Error('No Beaches guide in this dataset — run scripts/seed-resort-guides.ts first.')

  const names: string[] = await client.fetch(
    `*[_type == "restaurant" && area == $area && status == "published" && isActive != false && !(_id in path("drafts.**"))].name_en`,
    { area: AREA }
  )
  console.log(`Minitas Beach restaurants it will show today (${names.length}): ${names.map((n) => n.trim()).join(', ') || 'none yet'}`)

  const existing = guide.sections?.find((s: any) => s._key === SECTION_KEY)
  if (existing) {
    if (existing.restaurantArea === AREA && !existing.count) {
      console.log('Section already there — nothing to do.')
      return
    }
    console.log(`${dryRun ? 'would switch' : 'switching'} the section to list Minitas Beach restaurants automatically`)
    if (!dryRun) {
      await client
        .patch(guide._id)
        .set({ [`sections[_key=="${SECTION_KEY}"].restaurantArea`]: AREA })
        .unset([`sections[_key=="${SECTION_KEY}"].items`])
        .commit()
    }
    return
  }

  const section = {
    _key: SECTION_KEY,
    _type: 'guideVenues',
    eyebrow_en: 'Dining at the beach',
    eyebrow_es: 'Gastronomía frente al mar',
    title_en: 'Lunch with Your Feet in the Sand',
    title_es: 'Almuerzos con los Pies en la Arena',
    intro_en:
      'From long lunches at the beach club to fresh juices, food trucks and sunset champagne, Minitas offers some of Casa de Campo’s most relaxed places to eat and drink by the sea.',
    intro_es:
      'Desde largos almuerzos en el beach club hasta jugos naturales, food trucks y champán al atardecer, Minitas reúne algunos de los lugares más relajados de Casa de Campo para comer y beber frente al mar.',
    listLabel_en: 'Restaurants & bars',
    listLabel_es: 'Restaurantes y bares',
    restaurantArea: AREA,
    buttonLabel_en: 'Discover Dining',
    buttonLabel_es: 'Descubrir Restaurantes',
    buttonHref: '/restaurants#area-beach-club',
  }

  // Right after the Minitas Beach feature (else at the end).
  const minitas = guide.sections?.find((s: any) => /minitas/i.test(s.eyebrow_en ?? ''))
  const where = minitas ? 'after Minitas Beach' : 'at the end'
  if (dryRun) {
    console.log(`would add the section ${where}`)
    return
  }
  const patch = client.patch(guide._id).setIfMissing({ sections: [] })
  await (minitas
    ? patch.insert('after', `sections[_key=="${minitas._key}"]`, [section])
    : patch.append('sections', [section])
  ).commit()
  console.log(`added the section ${where}`)
}

main().catch((err) => {
  console.error(err.message ?? err)
  process.exit(1)
})
