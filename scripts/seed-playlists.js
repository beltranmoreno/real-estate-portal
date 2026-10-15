/**
 * Seed Leticia's Spotify playlists (Studio → Concierge → Playlists), shown in
 * the guest portal's "Music for the house" section.
 *
 * Usage:
 *   yarn seed-playlists              # dataset from .env.local
 *   yarn seed-playlists --dataset production
 *   yarn seed-playlists --dry-run
 *
 * Source: open.spotify.com/user/31wcvyn2ebyrgg5iv44kqrobtucu (public
 * playlists, Oct 2026). Idempotent: ids are `playlist-<spotify id>`, and a
 * playlist already linked by URL is skipped. The "when to play it" lines are
 * suggestions — edit them in Studio.
 */
const { createClient } = require('@sanity/client')
const path = require('path')
const dotenv = require('dotenv')

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const argDataset = (() => {
  const i = process.argv.indexOf('--dataset')
  return i > -1 ? process.argv[i + 1] : null
})()
const dryRun = process.argv.includes('--dry-run')

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: argDataset || process.env.NEXT_PUBLIC_SANITY_DATASET || 'development',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
  apiVersion: '2025-09-06',
})

if (!process.env.SANITY_API_WRITE_TOKEN) {
  console.error('Missing SANITY_API_WRITE_TOKEN in .env.local')
  process.exit(1)
}

// [spotify id, title, [moment en, moment es]] — in the order guests see them.
const PLAYLISTS = [
  ['4rGGhp1kvWW1H9F6nRIzur', 'Check in & Turn up', ['For the first evening, bags still by the door.', 'Para la primera noche, con las maletas aún en la puerta.']],
  ['2GzX83ZUEQToJt7D7tCf6p', 'Slow Mornings in Casa', ['Coffee on the terrace, nowhere to be.', 'Café en la terraza, sin prisa.']],
  ['5Y9Mf3jlkQ2UkqKyFIGMpJ', 'Sunday by the Pool', ['Long afternoons in and out of the water.', 'Tardes largas entre la piscina y la sombra.']],
  ['7BZv8cz7wCt1xSlgpYIcc8', 'Feeling the Breeze', ['Windows open, golf cart rides, easy days.', 'Ventanas abiertas, paseos en carrito, días tranquilos.']],
  ['1RD2tOTziPVnhYJtotzcVx', 'Postcards from Chavón', ['An afternoon wandering Altos de Chavón.', 'Una tarde paseando por Altos de Chavón.']],
  ['3XECXAIyRwPxPaMmbnwIVD', 'Cocktails at Sunset', ['The hour before dinner.', 'La hora antes de la cena.']],
  ['6ujDABIm5Mn5aSbKV34uq5', 'Dinner Under the Palms', ['A long table outside.', 'Una mesa larga al aire libre.']],
  ['24HpTvhBdBH51e52PzmFd0', 'After Dinner in Casa', ['When nobody wants the night to end.', 'Cuando nadie quiere que termine la noche.']],
  ['5KVHetPgKFRoxBtxTa1Tk8', 'Casa in Full Swing', ['For when the house fills up.', 'Para cuando la casa se llena.']],
  ['3F2MermMfgrSNNMimcq7M5', 'One More Mile', ['Morning runs and workouts.', 'Para correr o entrenar por la mañana.']],
]

async function main() {
  const dataset = client.config().dataset
  console.log(`${dryRun ? '[dry run] ' : ''}Seeding playlists into "${dataset}"…`)

  const existing = await client.fetch(`*[_type == "playlist"]{ _id, spotifyUrl }`)
  const takenIds = new Set(existing.map((p) => p._id))
  const takenSpotify = new Set(
    existing.map((p) => (p.spotifyUrl || '').match(/playlist\/([A-Za-z0-9]{22})/)?.[1]).filter(Boolean)
  )

  let created = 0
  for (const [index, [spotifyId, title, moment]] of PLAYLISTS.entries()) {
    const id = `playlist-${spotifyId}`
    if (takenIds.has(id) || takenSpotify.has(spotifyId)) {
      console.log(`  • ${title} — already exists, skipping`)
      continue
    }
    const doc = {
      _id: id,
      _type: 'playlist',
      spotifyUrl: `https://open.spotify.com/playlist/${spotifyId}`,
      title,
      moment_en: moment[0],
      moment_es: moment[1],
      order: (index + 1) * 10,
      isActive: true,
    }
    if (!dryRun) await client.createIfNotExists(doc)
    created++
    console.log(`  ✓ ${title}`)
  }
  console.log(`${dryRun ? 'Would create' : 'Created'} ${created} playlist(s).`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
