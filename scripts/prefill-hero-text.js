/**
 * Pre-fill the homepage hero text on the Homepage Media doc with the wording
 * the site shipped with. Only fills fields that are empty — never overwrites.
 *
 * Usage:
 *   node scripts/prefill-hero-text.js                      # dataset from .env.local
 *   node scripts/prefill-hero-text.js --dataset production
 */
const { createClient } = require('@sanity/client')
const path = require('path')
const dotenv = require('dotenv')

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const argDataset = (() => {
  const i = process.argv.indexOf('--dataset')
  return i > -1 ? process.argv[i + 1] : null
})()

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: argDataset || process.env.NEXT_PUBLIC_SANITY_DATASET || 'development',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
  apiVersion: '2025-09-06',
})

// Keep in sync with sanity/lib/heroDefaults.ts
const DEFAULTS = {
  heroEyebrow_en: 'Casa de Campo · La Romana',
  heroEyebrow_es: 'Casa de Campo · La Romana',
  heroTitle_en: "A private collection of houses on the Caribbean's most guarded coast",
  heroTitle_es: 'Una colección privada de casas en la costa más resguardada del Caribe',
  heroSubtitle_en: 'Residences known personally, arranged with a resident team.',
  heroSubtitle_es: 'Residencias conocidas personalmente, gestionadas por un equipo local.',
}

async function main() {
  const dataset = client.config().dataset
  const exists = await client.fetch(`defined(*[_id == "homepageMediaConfig"][0]._id)`)
  if (!exists) {
    console.log(`No Homepage Media doc in "${dataset}" — open it once in Studio; it will start with this text.`)
    return
  }
  await client.patch('homepageMediaConfig').setIfMissing(DEFAULTS).commit()
  console.log(`Hero text pre-filled in "${dataset}" (existing values left as they were).`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
