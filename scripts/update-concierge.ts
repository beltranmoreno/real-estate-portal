/**
 * Concierge services: sets each card's subtitle, puts Restaurants under
 * Dining & Celebrations, and creates In-Villa Pilates & Yoga and Private
 * Dining Experiences. Safe to re-run: it only sets the subtitles (and the
 * Restaurants category), and the two new services are created once.
 *
 *   npx tsx scripts/update-concierge.ts --dataset development [--dry-run]
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

type Bi = { en: string; es: string }
const b = (en: string, es: string): Bi => ({ en, es })

const SUBTITLES: Record<string, Bi> = {
  'concierge-airport-transfers': b('Your Journey Begins Here', 'Tu Viaje Comienza Aquí'),
  'concierge-private-chauffeur': b('Travel at Your Own Pace', 'Viaja a Tu Propio Ritmo'),
  'concierge-rent-a-car': b('Freedom to Explore', 'Libertad para Explorar'),
  'concierge-golf-carts': b('The Preferred Way to Explore Casa de Campo', 'La Forma Preferida de Recorrer Casa de Campo'),
  'concierge-grocery-pre-stocking': b('Arrive. Unpack. Relax.', 'Llega. Desempaca. Relájate.'),
  'concierge-restaurants': b('Exceptional Dining Awaits', 'Una Experiencia Gastronómica Excepcional'),
  'concierge-wine-champagne': b('Savor Every Moment', 'Disfruta Cada Momento'),
  'concierge-celebration-cakes': b('Designed for Celebrations', 'Diseñados para Celebrar'),
  'concierge-flowers': b('The Language of Flowers', 'El Lenguaje de las Flores'),
  'concierge-casa-de-campo-spa': b('Restore, Renew, Reconnect', 'Restaura, Renueva, Reconecta'),
  'concierge-in-villa-massages': b('Wellness in Complete Privacy', 'Bienestar con Total Privacidad'),
  'concierge-beauty-services': b('Beauty, Delivered Privately', 'Belleza, en la Privacidad de Tu Villa'),
  'concierge-nanny-services': b('Thoughtful Care for Every Generation', 'Cuidado Atento para Cada Generación'),
  'concierge-kids-club': b('Adventures for Young Explorers', 'Aventuras para Pequeños Exploradores'),
  'concierge-boat-experiences': b('Beyond the Shoreline', 'Más Allá de la Orilla'),
  'concierge-events-concerts': b('Experience Casa de Campo Beyond the Ordinary', 'Vive Casa de Campo Más Allá de lo Ordinario'),
  'concierge-private-photography': b('Capture Your Caribbean Story', 'Captura Tu Historia en el Caribe'),
  'concierge-active-lifestyle': b('An Active Life, Beautifully Lived', 'Una Vida Activa, Vivida con Estilo'),
  'concierge-casa-de-campo-lifestyle': b('The Art of Living Well', 'El Arte de Vivir Bien'),
}

const NEW_SERVICES = [
  {
    _id: 'concierge-in-villa-pilates-yoga',
    _type: 'conciergeService',
    name_en: 'In-Villa Pilates & Yoga',
    name_es: 'Pilates y Yoga en la Villa',
    subtitle_en: 'Find Your Balance, at Your Own Pace',
    subtitle_es: 'Encuentra Tu Equilibrio, a Tu Propio Ritmo',
    slug: { _type: 'slug', current: 'in-villa-pilates-yoga' },
    shortDescription_en:
      'Make time for yourself with private Pilates and yoga sessions in the comfort of your villa. Whether you prefer gentle stretching, mindful movement, or a more energizing practice, each session is tailored to your level and preferences, with private instructors and scheduling arranged around your stay.',
    shortDescription_es:
      'Regálate un momento para ti con sesiones privadas de Pilates y yoga en la comodidad de tu villa. Ya sea que prefieras estiramientos suaves, movimiento consciente o una práctica más energizante, cada sesión se adapta a tu nivel y preferencias, con instructores privados y horarios coordinados en torno a tu estadía.',
    category: 'wellness',
    icon: 'heart',
    schedulingMode: 'date_time',
    // Right after In-Villa Massages (10).
    order: 10.5,
    isActive: true,
  },
  {
    _id: 'concierge-private-dining',
    _type: 'conciergeService',
    name_en: 'Private Dining Experiences',
    name_es: 'Experiencias Gastronómicas Privadas',
    subtitle_en: 'Memorable Evenings, Beautifully Arranged',
    subtitle_es: 'Veladas Memorables, Cuidadosamente Organizadas',
    slug: { _type: 'slug', current: 'private-dining' },
    shortDescription_en:
      'Some of the most memorable evenings take place at home. From intimate candlelit dinners to special celebrations, we arrange private dining experiences in your villa, with personalized menus, thoughtful table settings, and attentive service. Every detail is considered, leaving you free to enjoy the evening and the company around your table.',
    shortDescription_es:
      'Algunas de las veladas más memorables ocurren en casa. Desde cenas íntimas a la luz de las velas hasta celebraciones especiales, organizamos experiencias gastronómicas privadas en tu villa, con menús personalizados, mesas cuidadosamente montadas y un servicio atento. Cada detalle está pensado para que solo te ocupes de disfrutar la velada y la compañía en tu mesa.',
    category: 'dining',
    icon: 'chef-hat',
    schedulingMode: 'date_time',
    // Right after Restaurants (5).
    order: 5.5,
    isActive: true,
  },
]

async function main() {
  const tx = client.transaction()
  const missing: string[] = []

  for (const [id, s] of Object.entries(SUBTITLES)) {
    const ids = [id, `drafts.${id}`]
    let found = false
    for (const docId of ids) {
      if (!(await client.getDocument(docId))) continue
      found = true
      tx.patch(docId, (p) =>
        p.set({
          subtitle_en: s.en,
          subtitle_es: s.es,
          // Restaurants had an old category the page doesn't show.
          ...(id === 'concierge-restaurants' ? { category: 'dining' } : {}),
        })
      )
    }
    if (!found) missing.push(id)
  }

  NEW_SERVICES.forEach((d) => tx.createIfNotExists(d))

  console.log(`${dataset}: ${Object.keys(SUBTITLES).length - missing.length} subtitles, 2 new services`)
  if (missing.length) console.log(`  not found: ${missing.join(', ')}`)
  if (dryRun) return
  await tx.commit()
  console.log('Done.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
