/**
 * Sets up the Activities page: creates the Activity groups (Racket Sports,
 * Equestrian & Polo…), updates the activities that already exist with their
 * new names and descriptions, and creates the missing ones. Every activity
 * listed here is put in its group, in this order.
 *
 * Re-running resets the names, descriptions, groups and order of the
 * activities listed here (photos and other fields are kept). Groups are only
 * created, never overwritten. Activities not listed here are left as they
 * are; without a group they don't appear on the site.
 *
 *   npx tsx scripts/update-activities.ts --dataset development [--dry-run]
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

// Map Attractions (Studio → Map Attractions) activities happen at.
const TENNIS = 'attraction-la-terraza-tennis'
const EQUESTRIAN = 'attraction-equestrian-center'
const MARINA = 'attraction-la-marina-casa-de-campo'
const SHOOTING = 'attraction-shooting-center'

interface Group {
  slug: string
  name: Bi
  title: Bi
  intro: Bi
  activities: { id: string; name: Bi; summary: Bi; location?: string }[]
}

const GROUPS: Group[] = [
  {
    slug: 'racket-sports',
    name: b('Racket Sports', 'Deportes de Raqueta'),
    title: b('Game. Set. Caribbean.', 'Donde el Juego Cobra Vida'),
    intro: b(
      'The Caribbean’s largest Racquet Center brings together championship facilities, expert instruction, international tournaments, and a vibrant community of players—all under the Caribbean sun.',
      'El Centro de Raquetas más grande del Caribe reúne instalaciones de primer nivel, instructores especializados, torneos internacionales y una comunidad apasionada por los deportes de raqueta.'
    ),
    activities: [
      {
        id: 'activity-tennis',
        name: b('Tennis', 'Tenis'),
        summary: b(
          'Championship Har-Tru courts, private coaching, clinics, and international tournaments create an exceptional experience for players of every level.',
          'Canchas Har-Tru de nivel de campeonato, clases privadas, clínicas especializadas y torneos internacionales ofrecen una experiencia excepcional para jugadores de todos los niveles.'
        ),
        location: TENNIS,
      },
      {
        id: 'activity-padel',
        name: b('Padel', 'Pádel'),
        summary: b(
          'Dynamic, social, and easy to enjoy, padel has become one of Casa de Campo’s most popular sports, with premium courts and year-round instruction.',
          'Dinámico, social y fácil de aprender, el pádel se ha convertido en uno de los deportes favoritos de Casa de Campo, con modernas canchas y clases durante todo el año.'
        ),
        location: TENNIS,
      },
      {
        id: 'activity-pickleball',
        name: b('Pickleball', 'Pickleball'),
        summary: b(
          'Discover one of the world’s fastest-growing sports with dedicated courts, private lessons, and organized matches for beginners and experienced players alike.',
          'Disfruta de uno de los deportes de mayor crecimiento en el mundo con canchas profesionales, clases privadas y partidos organizados para todos los niveles.'
        ),
        location: TENNIS,
      },
      {
        id: 'activity-junior-tennis-academy',
        name: b('Junior Tennis Academy', 'Academia Juvenil de Tenis'),
        summary: b(
          'Young players build confidence, technique, and a lifelong passion for tennis through professional coaching and structured development programs.',
          'Niños y jóvenes desarrollan técnica, confianza y pasión por el tenis mediante programas dirigidos por entrenadores profesionales.'
        ),
        location: TENNIS,
      },
    ],
  },
  {
    slug: 'equestrian-polo',
    name: b('Equestrian & Polo', 'Polo y Experiencias Ecuestres'),
    title: b('A Timeless Equestrian Tradition', 'Una Tradición Ecuestre que Perdura'),
    intro: b(
      'From championship polo to scenic horseback trails, Casa de Campo celebrates one of the Caribbean’s most distinguished equestrian lifestyles.',
      'Desde emocionantes partidos de polo hasta recorridos por senderos naturales, Casa de Campo ofrece una de las experiencias ecuestres más completas y reconocidas del Caribe.'
    ),
    activities: [
      {
        id: 'activity-polo',
        name: b('Polo', 'Polo'),
        summary: b(
          'Three professional polo fields, expert instruction, seasonal tournaments, and world-class facilities welcome both experienced players and those discovering the sport for the first time.',
          'Tres campos profesionales, clases personalizadas, torneos de temporada e instalaciones de primer nivel reciben tanto a jugadores experimentados como a quienes desean descubrir este deporte.'
        ),
        location: EQUESTRIAN,
      },
      {
        id: 'activity-horseback-riding',
        name: b('Horseback Riding', 'Equitación'),
        summary: b(
          'Explore private trails, open countryside, and working ranches through guided rides designed for riders of every experience level.',
          'Recorre senderos privados, paisajes naturales y estancias ganaderas mediante paseos guiados para jinetes de todos los niveles.'
        ),
        location: EQUESTRIAN,
      },
      {
        id: 'activity-show-jumping',
        name: b('Show Jumping', 'Salto Ecuestre'),
        summary: b(
          'Experienced instructors guide riders looking to develop confidence and technique in one of the Caribbean’s leading equestrian centers.',
          'Instructores especializados acompañan a jinetes que desean perfeccionar su técnica en uno de los centros ecuestres más prestigiosos del Caribe.'
        ),
        location: EQUESTRIAN,
      },
      {
        id: 'activity-donkey-polo',
        name: b('Donkey Polo', 'Polo en Burros'),
        summary: b(
          'A signature Casa de Campo tradition combining friendly competition, laughter, and unforgettable moments for families, celebrations, and corporate groups.',
          'Una tradición única de Casa de Campo que combina diversión, competencia y trabajo en equipo para familias, grupos y eventos especiales.'
        ),
        location: EQUESTRIAN,
      },
      {
        id: 'activity-rancho-peligro-trail-ride',
        name: b('Rancho Peligro Trail Ride', 'Tour Rancho Peligro'),
        summary: b(
          'Ride beyond the resort through sugar cane fields, lagoons, cattle ranches, and the authentic Dominican countryside.',
          'Descubre el lado más auténtico del campo dominicano recorriendo cañaverales, lagunas y estancias ganaderas a caballo.'
        ),
      },
    ],
  },
  {
    slug: 'marina-sport-fishing',
    name: b('Marina & Sport Fishing', 'Marina y Pesca Deportiva'),
    title: b('Where the Caribbean Comes to Life', 'Donde Comienza la Aventura en el Mar'),
    intro: b(
      'The Marina is more than a waterfront destination—it’s the starting point for unforgettable adventures at sea.',
      'La Marina es mucho más que un puerto deportivo; es el punto de partida para descubrir algunas de las mejores experiencias del Caribe.'
    ),
    activities: [
      {
        id: 'activity-deep-sea-fishing',
        name: b('Sport Fishing', 'Pesca Deportiva'),
        summary: b(
          'Target blue marlin, sailfish, mahi-mahi, wahoo, and kingfish alongside experienced captains aboard fully equipped sport fishing boats.',
          'Persigue marlín azul, pez vela, mahi-mahi, wahoo y pez rey junto a experimentados capitanes a bordo de embarcaciones totalmente equipadas.'
        ),
        location: MARINA,
      },
    ],
  },
  {
    slug: 'shooting-center',
    name: b('Shooting Center', 'Centro de Tiro'),
    title: b('Precision Surrounded by Nature', 'Precisión en un Entorno Natural'),
    intro: b(
      'One of the Caribbean’s most complete shooting facilities combines championship-level courses with spectacular natural surroundings.',
      'Uno de los centros de tiro más completos del Caribe reúne instalaciones de clase mundial en un entorno natural incomparable.'
    ),
    activities: [
      {
        id: 'activity-shooting-center',
        name: b('Sporting Clays', 'Sporting Clays'),
        summary: b(
          'More than 200 stations, realistic shooting scenarios, private instruction, and one of the world’s tallest clay target towers create an experience unlike any other.',
          'Más de 200 estaciones, escenarios realistas, clases privadas y una de las torres de lanzamiento de platos más altas del mundo ofrecen una experiencia única.'
        ),
        location: SHOOTING,
      },
    ],
  },
  {
    slug: 'wellness-fitness',
    name: b('Wellness & Fitness', 'Bienestar y Fitness'),
    title: b('Wellness in Motion', 'Bienestar que Acompaña Cada Día'),
    intro: b(
      'Balance every adventure with spaces dedicated to movement, recovery, and wellbeing.',
      'Mantén tu rutina o descubre nuevas formas de cuidar cuerpo y mente durante tu estadía.'
    ),
    activities: [
      {
        id: 'activity-fitness-center',
        name: b('Fitness Center', 'Fitness Center'),
        summary: b(
          'State-of-the-art equipment, personal training, and spacious facilities designed to keep you active throughout your stay.',
          'Equipos de última generación, entrenamiento personalizado y espacios diseñados para mantenerte activo durante toda tu estancia.'
        ),
      },
      {
        id: 'activity-casa-equilibra',
        name: b('Casa Equilibra', 'Casa Equilibra'),
        summary: b(
          'A holistic wellness destination offering yoga, breathwork, recovery therapies, meditation, and personalized wellbeing experiences.',
          'Un espacio dedicado al bienestar integral donde el yoga, la meditación, las terapias de recuperación y las experiencias personalizadas se unen para reconectar cuerpo y mente.'
        ),
      },
    ],
  },
  {
    slug: 'kids-family',
    name: b('Kids & Family', 'Niños y Familia'),
    title: b('Small Moments, Big Memories', 'Pequeños momentos, grandes recuerdos'),
    intro: b(
      'Places to play, explore and spend time together as a family during your stay at Casa de Campo.',
      'Espacios para jugar, explorar y compartir en familia durante tu estancia en Casa de Campo.'
    ),
    activities: [
      {
        id: 'activity-vista-lagos-playground',
        name: b('Vista Lagos Playground & Walking Track', 'Parque infantil y senderos de Vista Lagos'),
        summary: b(
          'Near Altos de Chavón, Vista Lagos offers an outdoor playground and walking track—a lovely setting for children to play and families to enjoy time outdoors.',
          'Cerca de Altos de Chavón, Vista Lagos cuenta con un parque infantil y circuito para caminar. Un entorno ideal para que los niños jueguen y toda la familia disfrute de un paseo al aire libre.'
        ),
      },
      {
        id: 'activity-bonche-4-teens',
        name: b('Bonche 4 Teens', 'Bonche 4 Teens'),
        summary: b(
          'Located in the resort’s main hotel area, Bonche offers billiards, air hockey, music and movies in a supervised setting. Designed especially for ages 13–17, it also welcomes younger children accompanied by a parent or guardian.',
          'Ubicado en el área principal del hotel, Bonche ofrece billar, hockey de aire, música y películas en un espacio supervisado. Está pensado especialmente para jóvenes de 13 a 17 años; los menores de 13 años deben estar acompañados por un padre o tutor.'
        ),
      },
    ],
  },
]

const slugify = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

async function main() {
  const tx = client.transaction()
  const log: string[] = []

  for (const [gi, g] of GROUPS.entries()) {
    const groupId = `activityGroup-${g.slug}`
    tx.createIfNotExists({
      _id: groupId,
      _type: 'activityGroup',
      name_en: g.name.en,
      name_es: g.name.es,
      slug: { _type: 'slug', current: g.slug },
      title_en: g.title.en,
      title_es: g.title.es,
      intro_en: g.intro.en,
      intro_es: g.intro.es,
      order: (gi + 1) * 10,
      isActive: true,
    })

    for (const [ai, a] of g.activities.entries()) {
      const existing = await client.getDocument(a.id)
      const fields = {
        name_en: a.name.en,
        name_es: a.name.es,
        summary_en: a.summary.en,
        summary_es: a.summary.es,
        group: { _type: 'reference', _ref: groupId },
        order: (ai + 1) * 10,
        ...(a.location ? { location: { _type: 'reference', _ref: a.location } } : {}),
      }
      if (!existing) {
        tx.createIfNotExists({
          _id: a.id,
          _type: 'activity',
          slug: { _type: 'slug', current: slugify(a.name.en) },
          isActive: true,
          ...fields,
        })
        log.push(`  + ${a.name.en} (${g.name.en})`)
      } else {
        tx.patch(a.id, (p) => p.set(fields))
        // An unpublished Studio edit would otherwise bring the old text back on publish.
        if (await client.getDocument(`drafts.${a.id}`)) tx.patch(`drafts.${a.id}`, (p) => p.set(fields))
        log.push(`  ~ ${existing.name_en === a.name.en ? a.name.en : `${existing.name_en} → ${a.name.en}`} (${g.name.en})`)
      }
    }
  }

  // The Activities info page's title and intro are only used for SEO now.
  const info = await client.fetch(`*[_type == "infoPage" && slug.current == "activities"][0]._id`)
  if (info) {
    tx.patch(info, (p) =>
      p.set({
        title_en: 'Activities',
        title_es: 'Actividades',
        intro_en:
          'Tennis, padel, polo, horseback riding, sport fishing, the shooting center and wellness — one of the Caribbean’s most complete collections of sporting and outdoor experiences.',
        intro_es:
          'Tenis, pádel, polo, equitación, pesca deportiva, el centro de tiro y bienestar — una de las propuestas deportivas y al aire libre más completas del Caribe.',
      })
    )
  }

  console.log(`${dataset}: ${GROUPS.length} groups, activities:\n${log.join('\n')}`)
  if (dryRun) return
  await tx.commit()
  console.log('Done.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
