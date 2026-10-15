/**
 * Seed the shops inside Casa de Campo (Studio → Local Guide → Shops), listed
 * on the Activities guide under "Shopping".
 *
 * Usage:
 *   yarn seed-shops              # dataset from .env.local
 *   yarn seed-shops --dataset production
 *   yarn seed-shops --dry-run
 *
 * Source: casadecampo.com.do/shopping (Oct 2026) — retail only; marina
 * service businesses and restaurants are left out. The resort page swaps the
 * Amber Museum / La Alpagatería descriptions; they're corrected here. Hours
 * are as published — check before relying on them.
 *
 * Idempotent: ids are `shop-<slug>`; a shop matching by name + location is
 * skipped.
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

// [name, location, category, [summary en, summary es], hours]
const SHOPS = [
  // ── Hotel ─────────────────────────────────────────────────────────────
  ['Cabinet Tobacco Boutique', 'hotel', 'cigars', ['Dominican cigars and hand-rolled tobacco.', 'Cigarros dominicanos y tabaco enrollado a mano.'], '8am–9pm daily'],
  ['La Boutique', 'hotel', 'resortwear', ['Beachwear and elegant resort outfits.', 'Ropa de playa y conjuntos elegantes para el resort.'], '8am–9pm daily'],

  // ── Golf & sports ─────────────────────────────────────────────────────
  ['Teeth of the Dog Pro Shop', 'golf', 'sports', ['Golf wear, clubs, shoes and balls.', 'Ropa de golf, palos, zapatos y pelotas.'], '7am–6:30pm daily'],
  ['Dye Fore Pro Shop', 'golf', 'sports', ['Golf wear, clubs, shoes and balls.', 'Ropa de golf, palos, zapatos y pelotas.'], '7am–6:15pm daily'],
  ['Tennis Pro Shop', 'sports', 'sports', ['Rackets, balls, accessories and tennis wear at La Terraza.', 'Raquetas, pelotas, accesorios y ropa de tenis en La Terraza.'], '7am–9pm daily'],
  ['Shooting Center Pro Shop', 'sports', 'sports', ['Ammunition, accessories and gear for the Shooting Center.', 'Municiones, accesorios y equipo para el Centro de Tiro.'], '8am–5pm daily'],

  // ── Altos de Chavón ───────────────────────────────────────────────────
  ['Amber Museum', 'altos-de-chavon', 'jewelry', ['Amber and larimar — a small museum and jewelry store.', 'Ámbar y larimar — un pequeño museo y joyería.'], 'Mon–Sat 8am–7pm, Sun 9am–3pm'],
  ['La Alpagatería', 'altos-de-chavon', 'fashion', ['Handmade espadrilles from an artisan workshop.', 'Alpargatas hechas a mano en un taller artesanal.'], 'Mon–Wed 9:30am–7pm, Thu–Sat 9:30am–9pm'],
  ['Leslie Mota Jewelry', 'altos-de-chavon', 'jewelry', ['Fine jewelry.', 'Alta joyería.'], 'Mon–Thu 9am–7pm, Fri–Sat 9am–8:30pm, Sun 10am–5:30pm'],
  ['Jacqueline Then', 'altos-de-chavon', 'fashion', ['Womenswear, accessories and exclusive collections.', 'Moda femenina, accesorios y colecciones exclusivas.'], '9am–7pm daily'],
  ['Pitusa', 'altos-de-chavon', 'fashion', ['Women’s clothing.', 'Ropa de mujer.'], '9am–7pm'],
  ['Jenny Polanco', 'altos-de-chavon', 'art', ['Handmade crafts — masks, paintings, baskets and furniture.', 'Artesanía hecha a mano — máscaras, pinturas, cestas y muebles.'], '9am–5:40pm daily'],
  ['Tienda Batey', 'altos-de-chavon', 'home', ['Handcrafted fine linens.', 'Lencería fina hecha a mano.'], '9am–5:45pm'],
  ['Luna Taína', 'altos-de-chavon', 'gifts', ['Gifts, art, crafts and souvenirs.', 'Regalos, arte, artesanía y recuerdos.'], '9am–6pm daily'],
  ['Artisan', 'altos-de-chavon', 'gifts', ['Souvenirs and keepsakes.', 'Recuerdos y detalles.'], '9am–5pm'],
  ['El Mercadito', 'altos-de-chavon', 'groceries', ['Minimarket and grocery in the village.', 'Minimercado y colmado en el pueblo.'], 'Mon–Wed 8am–7:30pm, Thu–Sun 8am–6pm'],

  // ── La Marina ─────────────────────────────────────────────────────────
  ['Vilebrequin', 'marina', 'resortwear', ['Swimwear and resortwear from Saint-Tropez.', 'Trajes de baño y ropa de resort de Saint-Tropez.'], '10am–8pm'],
  ['Orlebar Brown', 'marina', 'resortwear', ['Tailored swim shorts and resortwear.', 'Bañadores a medida y ropa de resort.'], '10am–8pm'],
  ['Melissa Odabash', 'marina', 'resortwear', ['Swimwear and beach cover-ups.', 'Trajes de baño y salidas de playa.'], '10am–8pm'],
  ['Poupette Saint Barth', 'marina', 'resortwear', ['Bohemian resort dresses from St Barth.', 'Vestidos bohemios de resort de St Barth.'], '10am–8pm'],
  ['Kiwi', 'marina', 'resortwear', ['Swimwear and beachwear.', 'Trajes de baño y ropa de playa.'], '10am–8pm'],
  ['Harmont & Blaine', 'marina', 'fashion', ['Italian casualwear.', 'Moda casual italiana.'], '10am–8pm'],
  ['Twelve Sixty Nine', 'marina', 'fashion', ['Fashion boutique.', 'Boutique de moda.'], '10am–8pm'],
  ['Nuovo Rinascimento', 'marina', 'fashion', ['Fashion boutique.', 'Boutique de moda.'], '10am–8pm'],
  ['Sole Mio', 'marina', 'fashion', ['Fashion boutique.', 'Boutique de moda.'], '10am–8pm'],
  ['Osole', 'marina', 'fashion', ['Fashion boutique.', 'Boutique de moda.'], '10am–8pm'],
  ['La Mer', 'marina', 'fashion', ['Boutique.', 'Boutique.'], '10am–8pm'],
  ['Mesto', 'marina', 'fashion', ['Boutique.', 'Boutique.'], '10am–8pm'],
  ['Pikua', 'marina', 'fashion', ['Boutique.', 'Boutique.'], '10am–8pm'],
  ['Tienda Hipólito', 'marina', 'fashion', ['Boutique.', 'Boutique.'], '10am–8pm'],
  ['Arenita', 'marina', 'gifts', ['Gifts and accessories.', 'Regalos y accesorios.'], '10am–8pm'],
  ['Jenny Polanco (Marina)', 'marina', 'art', ['Handmade crafts and home pieces.', 'Artesanía y piezas para el hogar.'], '10am–8pm'],
  ['Art Arena', 'marina', 'art', ['Art gallery.', 'Galería de arte.'], '10am–8pm'],
  ['Art Casa', 'marina', 'art', ['Art and decor.', 'Arte y decoración.'], '10am–8pm'],
  ['El Catador', 'marina', 'wine', ['Wine shop and tasting bar.', 'Tienda de vinos y bar de degustación.'], 'Sun–Thu 10am–10pm, Fri–Sat 10am–11pm'],
  ['La Cave', 'marina', 'wine', ['Wine and spirits.', 'Vinos y licores.'], '8am–8pm'],
  ['Supermercado Nacional', 'marina', 'groceries', ['Full supermarket.', 'Supermercado completo.'], 'Mon–Sat 8am–9pm, Sun 8am–7pm'],
  ['The Butcher Shop', 'marina', 'groceries', ['Butcher — meats for the grill.', 'Carnicería — carnes para la parrilla.'], 'Sat 9am–9pm, Sun 9am–7pm'],
]

const slugify = (s) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

async function main() {
  const dataset = client.config().dataset
  console.log(`${dryRun ? '[dry run] ' : ''}Seeding shops into "${dataset}"…`)

  const existing = await client.fetch(`*[_type == "shop"]{ _id, name, location }`)
  const taken = new Set(existing.map((s) => `${slugify(s.name || '')}|${s.location}`))
  const takenIds = new Set(existing.map((s) => s._id))

  const orderIn = {}
  let created = 0
  for (const [name, location, category, summary, hours] of SHOPS) {
    orderIn[location] = (orderIn[location] ?? 0) + 10
    const slug = slugify(name)
    const id = `shop-${slug}`
    if (takenIds.has(id) || taken.has(`${slug}|${location}`)) {
      console.log(`  • ${name} — already exists, skipping`)
      continue
    }
    const doc = {
      _id: id,
      _type: 'shop',
      name,
      slug: { _type: 'slug', current: slug },
      location,
      category,
      summary_en: summary[0],
      summary_es: summary[1],
      hours,
      order: orderIn[location],
      isActive: true,
    }
    if (!dryRun) await client.createIfNotExists(doc)
    created++
    console.log(`  ✓ ${name} (${location})`)
  }
  console.log(`${dryRun ? 'Would create' : 'Created'} ${created} shop(s).`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
