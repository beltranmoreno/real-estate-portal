/**
 * Seed the restaurants, cafés, bars and nightlife inside Casa de Campo.
 *
 * Usage:
 *   yarn seed-restaurants              # dataset from .env.local
 *   yarn seed-restaurants --dataset production
 *   yarn seed-restaurants --dry-run    # print what would be created
 *
 * Source: the official resort dining page (casadecampo.com.do/dining) as of
 * Oct 2026, plus venues already entered in production. New docs are created
 * published, with no photo, hours or prices — add those in Studio.
 *
 * Never duplicates: a venue is skipped when any existing restaurant matches
 * its name, one of its aliases, or its slug (accent/punctuation-insensitive).
 * Docs entered by hand are never modified; docs this script created earlier
 * (id `restaurant-<slug>`) get their venue type and published status synced.
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

// type: restaurant (default) | cafe | bar
// area: altos-de-chavon | marina | hotel | golf-club | beach-club | other
// cuisine / vibes: values from the restaurant schema's option lists only.
const RESTAURANTS = [
  // ── Marina ──────────────────────────────────────────────────────────────
  {
    name: 'SBG', slug: 'sbg', area: 'marina', aliases: ["SBG (Sofia's Bar & Grill)", 'SBG Casa de Campo'],
    cuisine: ['mediterranean', 'international'], vibes: ['lively', 'scenic'],
    summary: ['Bar and grill on the Marina waterfront.', 'Bar y parrilla frente a la Marina.'],
  },
  {
    name: 'Causa', slug: 'causa', area: 'marina',
    cuisine: ['seafood', 'international'],
    summary: ['Peruvian cuisine at the Marina.', 'Cocina peruana en la Marina.'],
  },
  {
    name: 'La Casita', slug: 'la-casita', area: 'marina', aliases: ['La Casita Restaurant'],
    cuisine: ['spanish', 'seafood'], vibes: ['romantic', 'scenic'],
    summary: ['Seafood and Spanish cuisine, with tapas, on the Marina waterfront.', 'Mariscos y cocina española, con tapas, frente a la Marina.'],
  },
  {
    name: 'Shibuya Ichiban', slug: 'shibuya-ichiban', area: 'marina', aliases: ['Shibuya'],
    cuisine: ['japanese', 'asian'],
    summary: ['Japanese cuisine and sushi at the Marina.', 'Cocina japonesa y sushi en la Marina.'],
  },
  {
    name: 'Peperoni', slug: 'peperoni', area: 'marina', aliases: ['Peperoni Restaurant'],
    cuisine: ['international', 'italian'], vibes: ['family'],
    summary: ['International menu of pizza, pasta, sushi and salads at Plaza Portofino.', 'Menú internacional de pizza, pasta, sushi y ensaladas en Plaza Portofino.'],
  },
  {
    name: 'Limoncello', slug: 'limoncello', area: 'marina', aliases: ['Il Limoncello', 'Il Limoncello Restaurant'],
    cuisine: ['italian'], vibes: ['family', 'casual'],
    summary: ['Pizza, pasta and salads at Plaza Portofino.', 'Pizza, pasta y ensaladas en Plaza Portofino.'],
  },
  {
    name: 'Dolce by Liberato', slug: 'dolce-by-liberato', area: 'marina',
    cuisine: ['italian'],
    summary: ['Italian at the Marina.', 'Cocina italiana en la Marina.'],
  },
  {
    name: 'Azimut Café', name_es: 'Azimut Café', slug: 'azimut-cafe', type: 'cafe', area: 'marina', aliases: ['Azimut Cafe'],
    cuisine: ['international'], vibes: ['casual'],
    summary: ['Coffee and light bites on Avenida de la Marina.', 'Café y bocados ligeros en la Avenida de la Marina.'],
  },
  {
    name: 'La Enoteca', slug: 'la-enoteca', type: 'cafe', area: 'marina',
    vibes: ['casual'],
    summary: ['Wine and spirits shop with a bar, at Plaza Portofino.', 'Tienda de vinos y licores con bar, en Plaza Portofino.'],
  },
  {
    name: 'Cacao Ice Cream Shop', name_es: 'Heladería Cacao', slug: 'cacao-ice-cream', type: 'cafe', area: 'marina', aliases: ['Cacao'],
    vibes: ['family', 'casual'],
    summary: ['Ice cream at Coconut Mall.', 'Helados en Coconut Mall.'],
  },
  {
    name: 'Cinco Gelato', slug: 'cinco-gelato', type: 'cafe', area: 'marina',
    vibes: ['family', 'casual'],
    summary: ['Gelato at the Marina.', 'Gelato en la Marina.'],
  },

  // ── Altos de Chavón ─────────────────────────────────────────────────────
  {
    name: 'La Piazzetta', slug: 'la-piazzetta', area: 'altos-de-chavon',
    cuisine: ['italian', 'mediterranean'], vibes: ['romantic', 'fine-dining'],
    summary: ['Italian dinners in the stone village of Altos de Chavón.', 'Cenas italianas en el pueblo de piedra de Altos de Chavón.'],
  },
  {
    name: 'Chilango Taqueria', name_es: 'Chilango Taquería', slug: 'chilango-taqueria', area: 'altos-de-chavon',
    cuisine: ['mexican'], vibes: ['casual', 'family'],
    summary: ['Tacos and Mexican street food in Altos de Chavón.', 'Tacos y comida callejera mexicana en Altos de Chavón.'],
  },
  {
    name: "Onno's", slug: 'onnos', area: 'altos-de-chavon', aliases: ["Onno's Bar"],
    cuisine: ['international'], vibes: ['lively'],
    summary: ['Bar with light international food; DJ on weekends.', 'Bar con comida internacional ligera; DJ los fines de semana.'],
  },
  {
    name: 'Café Marietta', slug: 'cafe-marietta', area: 'altos-de-chavon', aliases: ['Cafe Marieta', 'Café Marieta', 'Cafe Marietta'],
    cuisine: ['italian'], vibes: ['casual'],
    summary: ['Gastropub and Italian kitchen in Altos de Chavón.', 'Gastropub y cocina italiana en Altos de Chavón.'],
  },
  {
    name: 'La Cantina Latin Bistro', slug: 'la-cantina', area: 'altos-de-chavon', aliases: ['La Cantina'],
    cuisine: ['dominican', 'caribbean'], vibes: ['casual', 'local'],
    summary: ['Latin American and Dominican bistro in Altos de Chavón.', 'Bistró latinoamericano y dominicano en Altos de Chavón.'],
  },

  // ── Hotel ───────────────────────────────────────────────────────────────
  {
    name: 'La Caña Restaurant & Bar', slug: 'la-cana', area: 'hotel', aliases: ['La Caña', 'La Cana'],
    cuisine: ['mediterranean'], vibes: ['scenic'],
    summary: ['Restaurant and bar at the main hotel.', 'Restaurante y bar en el hotel principal.'],
  },
  {
    name: 'Lago', slug: 'lago', area: 'hotel', aliases: ['Lago Grill', 'Lago Restaurant'],
    cuisine: ['international', 'caribbean'], vibes: ['family', 'scenic'],
    summary: ['Breakfast through dinner overlooking Teeth of the Dog, next to the clubhouse.', 'Del desayuno a la cena con vista a Teeth of the Dog, junto al clubhouse.'],
  },
  {
    name: 'Villa Minuty', slug: 'villa-minuty', type: 'bar', area: 'hotel',
    cuisine: ['mediterranean'], vibes: ['trendy'],
    summary: ['Rosé lounge and bites at the hotel.', 'Lounge de rosado y bocados en el hotel.'],
  },
  {
    name: 'The Spa Café', name_es: 'Café del Spa', slug: 'spa-cafe', type: 'cafe', area: 'hotel',
    vibes: ['healthy'],
    summary: ['Light, healthy café at The Spa.', 'Café ligero y saludable en The Spa.'],
  },

  // ── Minitas Beach ───────────────────────────────────────────────────────
  {
    name: 'Minitas Beach Club & Restaurant', slug: 'minitas-beach-club', area: 'beach-club',
    aliases: ['Minitas Beach Club', 'Beach Club by Le Cirque', 'The Beach Club by Le Cirque'],
    cuisine: ['seafood', 'mediterranean'], vibes: ['beachfront', 'family'],
    summary: ['Oceanside lunches and dinners on Minitas beach.', 'Almuerzos y cenas junto al mar en la playa Minitas.'],
  },
  {
    name: 'Squeeze! Juice Bar', slug: 'squeeze-juice-bar', type: 'cafe', area: 'beach-club', aliases: ['Squeeze'],
    vibes: ['healthy', 'beachfront'],
    summary: ['Fresh juices and smoothies on Minitas beach.', 'Jugos frescos y batidos en la playa Minitas.'],
  },
  {
    name: 'Brasa Food Truck', slug: 'brasa-food-truck', type: 'cafe', area: 'beach-club', aliases: ['Brasa'],
    vibes: ['casual', 'beachfront'],
    summary: ['Food truck on Minitas beach.', 'Food truck en la playa Minitas.'],
  },
  {
    name: 'Massa Food Truck', slug: 'massa-food-truck', type: 'cafe', area: 'beach-club', aliases: ['Massa'],
    vibes: ['casual', 'beachfront'],
    summary: ['Food truck on Minitas beach.', 'Food truck en la playa Minitas.'],
  },

  // ── Bars & nightlife ────────────────────────────────────────────────────
  {
    name: 'La Caña Pool Bar', name_es: 'Bar de la Piscina La Caña', slug: 'la-cana-pool-bar', type: 'bar', area: 'hotel',
    vibes: ['casual', 'scenic'],
    summary: ['Poolside bar at the main hotel.', 'Bar junto a la piscina del hotel principal.'],
  },
  {
    name: 'Genesis Nightclub', slug: 'genesis-nightclub', type: 'bar', area: 'altos-de-chavon', aliases: ['Genesis'],
    vibes: ['lively'],
    summary: ['Nightclub in Altos de Chavón.', 'Discoteca en Altos de Chavón.'],
  },
  {
    name: 'Dye Fore Bar', slug: 'dye-fore-bar', type: 'bar', area: 'altos-de-chavon',
    vibes: ['scenic'],
    summary: ['Drinks overlooking the Dye Fore course and the Chavón river.', 'Tragos con vista al campo Dye Fore y el río Chavón.'],
  },
  {
    name: 'The 19th Hole', name_es: 'El Hoyo 19', slug: '19th-hole', type: 'bar', area: 'golf-club',
    aliases: ['19th Hole', 'The Teeth of the Dog 19th Hole'],
    vibes: ['casual'],
    summary: ['Sandwiches, snacks and drinks at the Teeth of the Dog pro shop.', 'Sándwiches, picaderas y tragos en el pro shop de Teeth of the Dog.'],
  },
  {
    name: 'Coco Mar', slug: 'coco-mar', type: 'bar', area: 'beach-club', aliases: ['Coco Mar Bar'],
    vibes: ['beachfront', 'casual'],
    summary: ['Beach bar with cocktails and bar food on Minitas.', 'Bar de playa con cócteles y picaderas en Minitas.'],
  },
  {
    name: 'Veuve Clicquot Sun Club', slug: 'veuve-clicquot-sun-club', type: 'bar', area: 'beach-club',
    vibes: ['beachfront', 'trendy'],
    summary: ['Champagne beach club on Minitas.', 'Club de playa con champán en Minitas.'],
  },
  {
    name: 'Premier Club Bar', slug: 'premier-club-bar', type: 'bar', area: 'other',
    vibes: ['casual'],
    summary: ['Bar at the Premier Club.', 'Bar en el Premier Club.'],
  },
]

const norm = (s) =>
  (s || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()

async function main() {
  const dataset = client.config().dataset
  console.log(`${dryRun ? '[dry run] ' : ''}Seeding restaurants into "${dataset}"…`)

  const existing = await client.fetch(
    `*[_type == "restaurant"]{ _id, name_en, name_es, "slug": slug.current, status, venueType }`
  )
  const takenNames = new Set(existing.flatMap((r) => [norm(r.name_en), norm(r.name_es)]).filter(Boolean))
  const takenSlugs = new Set(existing.map((r) => norm(r.slug)).filter(Boolean))
  const takenIds = new Set(existing.map((r) => r._id))

  let created = 0
  let synced = 0
  for (const r of RESTAURANTS) {
    const ownId = `restaurant-${r.slug}`
    const own = existing.find((e) => e._id === ownId)
    if (own) {
      // Created by this script earlier — keep type + published status in sync.
      const type = r.type || 'restaurant'
      if (own.status !== 'published' || own.venueType !== type) {
        if (!dryRun) await client.patch(ownId).set({ status: 'published', venueType: type }).commit()
        synced++
        console.log(`  ↻ ${r.name} — synced (${type}, published)`)
      } else {
        console.log(`  • ${r.name} — already exists, skipping`)
      }
      continue
    }

    const names = [r.name, r.name_es, ...(r.aliases || [])].map(norm)
    const dup =
      names.some((n) => takenNames.has(n)) ||
      takenSlugs.has(norm(r.slug)) ||
      takenIds.has(`restaurant-${r.slug}`)
    if (dup) {
      console.log(`  • ${r.name} — already exists, skipping`)
      continue
    }

    const doc = {
      _id: `restaurant-${r.slug}`,
      _type: 'restaurant',
      name_en: r.name,
      name_es: r.name_es || r.name,
      slug: { _type: 'slug', current: r.slug },
      status: 'published',
      venueType: r.type || 'restaurant',
      area: r.area,
      ...(r.cuisine ? { cuisine: r.cuisine } : {}),
      ...(r.vibes ? { vibes: r.vibes } : {}),
      summary_en: r.summary[0],
      summary_es: r.summary[1],
    }

    if (!dryRun) await client.createIfNotExists(doc)
    created++
    console.log(`  ✓ ${r.name} (${r.area})`)
  }

  console.log(`${dryRun ? 'Would create' : 'Created'} ${created}, ${dryRun ? 'would sync' : 'synced'} ${synced}.`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
