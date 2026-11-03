/**
 * Creates the resort guides (The Marina, Altos de Chavón, Hotel, Nightlife,
 * Beaches & Islands) with their launch copy, linking every venue to the existing
 * restaurant / shop / place / activity in Studio. Venues that don't exist yet
 * are created: shops, places and activities as active, restaurants as drafts (they show as
 * plain names until someone fills them in and publishes them).
 *
 * Safe to re-run: existing guides are left untouched, and venues are matched
 * by name before anything is created.
 *
 *   npx tsx scripts/seed-resort-guides.ts --dataset development [--dry-run]
 */
import { createClient } from '@sanity/client'
import { config } from 'dotenv'
import { randomUUID } from 'crypto'

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

// ── Venue specs ────────────────────────────────────────────────────────────
type Venue =
  | { kind: 'restaurant'; name: string; area: string; venueType: 'restaurant' | 'cafe' | 'bar' }
  | { kind: 'shop'; name: string; location: string; category: string }
  | { kind: 'landmark'; name: Bi; type: string; location: string; summary: Bi; details?: { label?: Bi; value: Bi }[] }
  // Same _id as in update-activities.ts, so both scripts share one document.
  | { kind: 'activity'; id: string; name: Bi; summary: Bi }
type Item = { venue?: Venue; name?: Bi; note?: Bi }

const R = (name: string, area: string, venueType: 'restaurant' | 'cafe' | 'bar' = 'restaurant', note?: Bi): Item => ({
  venue: { kind: 'restaurant', name, area, venueType },
  note,
})
const S = (name: string, location: string, category: string, note?: Bi): Item => ({
  venue: { kind: 'shop', name, location, category },
  note,
})
const P = (en: string, es = en): Item => ({ name: b(en, es) })

// ── Sections ───────────────────────────────────────────────────────────────
type Button = { label: Bi; href?: string }
type Section =
  | {
      type: 'feature'
      eyebrow?: Bi
      title?: Bi
      body?: Bi
      venue?: Venue
      highlightsLabel?: Bi
      highlights?: Item[]
      button?: Button
      anchor?: string
    }
  | { type: 'venues'; eyebrow?: Bi; title?: Bi; intro?: Bi; listLabel?: Bi; items: Item[]; button?: Button; anchor?: string }
  | {
      type: 'directory'
      eyebrow?: Bi
      title?: Bi
      intro?: Bi
      groups: { title: Bi; description?: Bi; listLabel?: Bi; items: Item[] }[]
      anchor?: string
    }

interface Guide {
  slug: string
  navLabel: Bi
  navOrder: number
  eyebrow: Bi
  title: Bi
  intro: Bi
  button?: Button
  seoDescription?: Bi
  sections: Section[]
}

const EXPLORE = '#explore'

const GUIDES: Guide[] = [
  // ── The Marina ───────────────────────────────────────────────────────────
  {
    slug: 'marina',
    navLabel: b('The Marina', 'La Marina'),
    navOrder: 1,
    eyebrow: b('The Marina', 'La Marina'),
    title: b('Where Casa de Campo Comes Together', 'Donde Casa de Campo se Encuentra'),
    intro: b(
      'Beyond its yachts and waterfront views, the Marina is the social heart of Casa de Campo. Inspired by the charm of Mediterranean seaside villages, its colorful promenade invites guests to stroll, shop, dine, and experience one of the destination’s most vibrant gathering places.\n\nFrom morning coffee overlooking the water to sunset cocktails and lively evenings by the marina, every visit reveals something new.',
      'Mucho más que un puerto deportivo, La Marina es el corazón social de Casa de Campo. Inspirada en los encantadores pueblos costeros del Mediterráneo, sus calles invitan a pasear, descubrir boutiques, disfrutar de su gastronomía y vivir uno de los espacios más emblemáticos del destino.\n\nDesde un café por la mañana hasta un cóctel al atardecer frente a los yates, cada visita ofrece una experiencia diferente.'
    ),
    button: { label: b('Explore The Marina', 'Descubre La Marina'), href: EXPLORE },
    seoDescription: b(
      'The social heart of Casa de Campo: waterfront restaurants, boutiques, Coconut Mall and everything you need, moments from your villa.',
      'El corazón social de Casa de Campo: restaurantes frente al mar, boutiques, Coconut Mall y todo lo que necesitas, a minutos de tu villa.'
    ),
    sections: [
      {
        type: 'feature',
        eyebrow: b('Waterfront dining & lifestyle', 'Gastronomía y estilo de vida'),
        title: b('A Place to Gather', 'Un Lugar para Compartir'),
        body: b(
          'The Marina is home to some of Casa de Campo’s most celebrated restaurants, cafés, lounges, and waterfront terraces. Whether enjoying fresh seafood, handcrafted cocktails, or an elegant dinner overlooking the yachts, every venue reflects the relaxed sophistication of Caribbean living.\n\nDiscover destinations including SBG Marina, Peperoni, Shibuya, La Casita, Limoncello, Causa, Dolce Italia, and many more.',
          'La Marina reúne algunos de los restaurantes, cafés y terrazas más reconocidos de Casa de Campo. Desde almuerzos frente al agua y gastronomía internacional hasta coctelería de autor y elegantes cenas junto a los yates, cada espacio refleja el estilo relajado y sofisticado del destino.\n\nDescubre lugares como SBG Marina, Peperoni, Shibuya, La Casita, Limoncello, Causa, Dolce Italia, entre otros.'
        ),
        button: { label: b('Discover Dining', 'Descubrir Restaurantes'), href: '/restaurants#area-marina' },
      },
      {
        type: 'feature',
        eyebrow: b('Shopping', 'Compras'),
        title: b('Boutiques Worth Discovering', 'Boutiques para Descubrir'),
        body: b(
          'Luxury fashion, beachwear, jewelry, cigars, wines, local art, and everyday essentials come together along the Marina’s elegant promenade. Carefully curated boutiques and specialty stores invite guests to browse at their own pace while enjoying the atmosphere of the waterfront.\n\nFeatured boutiques include Vilebrequin, Orlebar Brown, Melissa Odabash, Poupette St Barth, Jenny Polanco, Kiwi Saint-Tropez, Harmont & Blaine, Fumo Cigars, El Catador, Art Arena, and more.',
          'Moda de lujo, ropa de playa, joyería, vinos, puros, arte y productos exclusivos se combinan a lo largo del paseo de La Marina. Una colección cuidadosamente seleccionada de boutiques invita a recorrer cada rincón mientras disfruta del ambiente frente al mar.\n\nEntre las boutiques más reconocidas se encuentran Vilebrequin, Orlebar Brown, Melissa Odabash, Poupette St Barth, Jenny Polanco, Kiwi Saint-Tropez, Harmont & Blaine, Fumo Cigars, El Catador, Art Arena, entre otras.'
        ),
        button: { label: b('Explore Boutiques', 'Explorar Boutiques'), href: '#marina-guide' },
      },
      {
        type: 'feature',
        eyebrow: b('Coconut Mall', 'Coconut Mall'),
        title: b('Everyday Convenience, Elegantly Connected', 'Todo lo que Necesita, Muy Cerca'),
        body: b(
          'Located just steps from the Marina, Coconut Mall brings together practical services and everyday conveniences within Casa de Campo. From banking, pharmacies, and supermarkets to courier services, marine specialists, and home essentials, everything you may need is always close at hand.\n\nServices include Supermercado Nacional, Farmacia Carol, Banco Popular, ATM, Trueshore Logistics Courier (FedEx, DHL), Ferremart, Aquapro, and more.',
          'Ubicado a pocos pasos de La Marina, Coconut Mall reúne los principales servicios y comercios esenciales de Casa de Campo. Desde supermercado, farmacia y banco hasta servicios de mensajería, soluciones náuticas y artículos para el hogar, todo se encuentra convenientemente en un mismo lugar.\n\nAquí encontrará Supermercado Nacional, Farmacia Carol, Banco Popular, Cajero Automático, Trueshore Logistics (FedEx, DHL), Ferremart, Aquapro, entre otros.'
        ),
        button: { label: b('Explore Coconut Mall', 'Descubrir Coconut Mall'), href: '#marina-guide' },
      },
      {
        type: 'directory',
        anchor: 'marina-guide',
        eyebrow: b('Marina guide', 'Guía de la Marina'),
        title: b('Everything Within Easy Reach', 'Todo lo que Necesita, a Solo Unos Pasos'),
        intro: b(
          'From waterfront dining and luxury boutiques to gourmet markets, beauty services, pharmacies, and everyday essentials, The Marina and Coconut Mall bring together everything you need to enjoy your stay—just moments from your villa.',
          'Desde restaurantes frente al mar y boutiques de lujo hasta supermercados, farmacias, servicios y tiendas especializadas, La Marina y Coconut Mall reúnen todo lo necesario para disfrutar de una estancia cómoda, práctica y sin preocupaciones.'
        ),
        groups: [
          {
            title: b('Dining & Restaurants', 'Restaurantes'),
            description: b(
              'Waterfront dining, international cuisine, cafés, cocktails, and relaxed terraces overlooking the yachts.',
              'Cocina frente al mar, gastronomía internacional, cafés, cócteles y terrazas con vista a los yates.'
            ),
            listLabel: b('Featured venues', 'Lugares destacados'),
            items: [
              R("SBG (Sofia's Bar & Grill)", 'marina'),
              R('La Casita', 'marina'),
              R('Peperoni', 'marina'),
              R('Limoncello', 'marina'),
              R('Causa', 'marina'),
              R('Shibuya Ichiban', 'marina'),
              R('Dolce Italia', 'marina'),
              R('Cinco Gelato', 'marina', 'cafe'),
            ],
          },
          {
            title: b('Fashion & Resort Wear', 'Moda y Ropa de Resort'),
            description: b(
              'Luxury fashion, resort collections, swimwear, and contemporary designers.',
              'Moda de lujo, colecciones resort, trajes de baño y diseñadores contemporáneos.'
            ),
            listLabel: b('Boutiques', 'Boutiques'),
            items: [
              S('Orlebar Brown', 'marina', 'resortwear'),
              S('Vilebrequin', 'marina', 'resortwear'),
              S('Melissa Odabash', 'marina', 'resortwear'),
              S('Poupette Saint Barth', 'marina', 'resortwear'),
              S('Jenny Polanco (Marina)', 'marina', 'fashion'),
              S('Harmont & Blaine', 'marina', 'fashion'),
              S('Kiwi', 'marina', 'resortwear'),
              S('Azurro', 'marina', 'fashion'),
              S('Hippólito', 'marina', 'fashion'),
              S('Osole', 'marina', 'fashion'),
              S('Twelve Sixty Nine', 'marina', 'fashion'),
              S('La Mer', 'marina', 'fashion'),
            ],
          },
          {
            title: b('Art & Gifts', 'Arte y Regalos'),
            description: b(
              'Local art, handcrafted pieces, unique gifts, and home décor.',
              'Arte local, piezas hechas a mano, regalos únicos y decoración para el hogar.'
            ),
            listLabel: b('Stores', 'Tiendas'),
            items: [S('Art Arena', 'marina', 'art'), S('Mesto', 'marina', 'fashion')],
          },
          {
            title: b('Fine Wines & Cigars', 'Vinos y Puros'),
            description: b(
              'Premium wines, spirits, gourmet products, and handcrafted Dominican cigars.',
              'Vinos y licores premium, productos gourmet y puros dominicanos hechos a mano.'
            ),
            listLabel: b('Specialty stores', 'Tiendas especializadas'),
            items: [S('El Catador', 'marina', 'wine'), S('Fumo Cigars', 'marina', 'cigars')],
          },
          {
            title: b('Beauty & Wellness', 'Belleza y Bienestar'),
            description: b(
              'Professional beauty services and personal care to help you look and feel your best throughout your stay.',
              'Servicios de belleza y cuidado personal para que te veas y te sientas bien durante toda tu estancia.'
            ),
            listLabel: b('Beauty salon', 'Salón de belleza'),
            items: [S('Amadeus Beauty Center', 'marina', 'beauty')],
          },
          {
            title: b('Sports & Lifestyle', 'Deporte y Estilo de Vida'),
            description: b(
              'Cycling equipment, accessories, and outdoor lifestyle.',
              'Equipos de ciclismo, accesorios y artículos para la vida al aire libre.'
            ),
            listLabel: b('Store', 'Tienda'),
            items: [S('One Way Bike', 'marina', 'sports')],
          },
          {
            title: b('Groceries & Gourmet', 'Supermercado y Gourmet'),
            description: b(
              'Everything you need to stock your villa with fresh produce, premium meats, beverages, gourmet products, and everyday essentials.',
              'Todo lo necesario para abastecer tu villa: productos frescos, carnes premium, bebidas, productos gourmet y artículos de uso diario.'
            ),
            listLabel: b('Markets', 'Mercados'),
            items: [S('Supermercado Nacional', 'marina', 'groceries'), S('The Butcher Shop', 'marina', 'groceries')],
          },
          {
            title: b('Pharmacy & Health', 'Farmacia y Salud'),
            description: b(
              'Health, wellness, and personal care essentials conveniently located within The Marina.',
              'Artículos de salud, bienestar y cuidado personal, convenientemente ubicados en La Marina.'
            ),
            listLabel: b('Pharmacy', 'Farmacia'),
            items: [S('Farmacia Carol', 'coconut-mall', 'pharmacy')],
          },
          {
            title: b('Banking & Business Services', 'Banca y Servicios Empresariales'),
            description: b(
              'Banking, international shipping, courier services, and business support for added convenience during your stay.',
              'Banca, envíos internacionales, mensajería y apoyo empresarial para mayor comodidad durante tu estancia.'
            ),
            listLabel: b('Services', 'Servicios'),
            items: [
              S('Banco Popular', 'coconut-mall', 'banking'),
              P('ATM', 'Cajero automático'),
              S('FedEx Business Center', 'coconut-mall', 'banking'),
              S('Trueshore Logistics', 'coconut-mall', 'banking'),
            ],
          },
          {
            title: b('Marine Services', 'Servicios Náuticos'),
            description: b(
              'Professional yacht support, marine equipment, maintenance, and specialized nautical services.',
              'Asistencia profesional para yates, equipos marinos, mantenimiento y servicios náuticos especializados.'
            ),
            listLabel: b('Services', 'Servicios'),
            items: [
              S('Automarina', 'marina', 'marine'),
              S('Aquapro', 'coconut-mall', 'marine'),
              S('IBC Shipyard', 'marina', 'marine'),
            ],
          },
          {
            title: b('Home & Hardware', 'Hogar y Ferretería'),
            description: b(
              'Home improvement supplies, hardware, outdoor equipment, and landscaping solutions.',
              'Artículos para el hogar, ferretería, equipos para exteriores y soluciones de jardinería.'
            ),
            listLabel: b('Stores', 'Tiendas'),
            items: [S('Ferremart', 'coconut-mall', 'hardware'), S('Caribbean Turf', 'coconut-mall', 'hardware')],
          },
        ],
      },
    ],
  },

  // ── Altos de Chavón ──────────────────────────────────────────────────────
  {
    slug: 'altos-de-chavon',
    navLabel: b('Altos de Chavón', 'Altos de Chavón'),
    navOrder: 2,
    eyebrow: b('Altos de Chavón', 'Altos de Chavón'),
    title: b('Where Culture Meets the Caribbean', 'Donde la Cultura se Encuentra con el Caribe'),
    intro: b(
      'More than a landmark, Altos de Chavón is the cultural soul of Casa de Campo. Perched above the Chavón River and inspired by a 16th-century Mediterranean village, its cobblestone streets, artisan workshops, galleries, restaurants, and iconic amphitheater create a place where history, creativity, and Caribbean lifestyle come together.\n\nWhether visiting for lunch, an art exhibition, a concert beneath the stars, or simply a leisurely stroll, every corner tells a story waiting to be discovered.',
      'Más que un lugar para visitar, Altos de Chavón representa el alma cultural de Casa de Campo. Inspirado en un pueblo mediterráneo del siglo XVI y construido sobre las alturas del río Chavón, sus calles de piedra reúnen arte, historia, gastronomía y una vibrante vida cultural en un escenario verdaderamente único.\n\nYa sea para almorzar, visitar una galería, asistir a un concierto o simplemente recorrer sus calles, cada rincón invita a descubrir una nueva historia.'
    ),
    button: { label: b('Discover Altos de Chavón', 'Descubre Altos de Chavón'), href: EXPLORE },
    seoDescription: b(
      'The cultural soul of Casa de Campo: a stone village above the Chavón River with museums, the amphitheater, workshops, restaurants and boutiques.',
      'El alma cultural de Casa de Campo: un pueblo de piedra sobre el río Chavón con museos, el anfiteatro, talleres, restaurantes y boutiques.'
    ),
    sections: [
      {
        type: 'feature',
        eyebrow: b('History & heritage', 'Historia y patrimonio'),
        title: b('A Village Built to Inspire', 'Un Pueblo Creado para Inspirar'),
        body: b(
          'Designed by Dominican architect José Antonio Caro and Italian designer Roberto Coppa, Altos de Chavón was handcrafted by local artisans and has become one of the Dominican Republic’s most recognized cultural landmarks. Today it is home to museums, galleries, workshops, and year-round cultural events.',
          'Diseñado por el arquitecto dominicano José Antonio Caro y el diseñador italiano Roberto Coppa, Altos de Chavón fue construido por artesanos locales y hoy es uno de los centros culturales más importantes del país. Alberga reconocidos museos, galerías, talleres y eventos culturales durante todo el año.'
        ),
      },
      {
        type: 'venues',
        eyebrow: b('Culture & landmarks', 'Cultura y lugares emblemáticos'),
        title: b('Places Worth Discovering', 'Espacios para Descubrir'),
        items: [
          {
            venue: {
              kind: 'landmark',
              name: b('Regional Archaeological Museum', 'Museo Arqueológico Regional'),
              type: 'museum',
              location: 'altos-de-chavon',
              summary: b(
                'Explore one of the Caribbean’s finest collections of pre-Columbian artifacts, showcasing more than 3,000 pieces that tell the story of the island’s earliest civilizations.',
                'Descubre una de las colecciones precolombinas más importantes del Caribe, con más de 3,000 piezas que narran los orígenes de la isla.'
              ),
            },
          },
          {
            venue: {
              kind: 'landmark',
              name: b('St. Stanislaus Church', 'Iglesia San Estanislao'),
              type: 'church',
              location: 'altos-de-chavon',
              summary: b(
                'A timeless stone church overlooking the Chavón River, admired for its architecture, peaceful atmosphere, and historical significance. Open to visitors throughout the week, it also welcomes guests to its weekly Catholic Masses and remains one of the Dominican Republic’s most sought-after wedding venues.',
                'Una emblemática iglesia de piedra con vistas al río Chavón, reconocida por su arquitectura, tranquilidad y valor histórico. Además de recibir visitantes durante la semana, celebra misas católicas cada fin de semana y es uno de los escenarios más solicitados para bodas en República Dominicana.'
              ),
              details: [
                { label: b('Mass', 'Misa'), value: b('Saturday — 5:00 PM', 'Sábado — 5:00 PM') },
                { label: b('Mass', 'Misa'), value: b('Sunday — 6:00 PM', 'Domingo — 6:00 PM') },
              ],
            },
          },
          {
            venue: {
              kind: 'landmark',
              name: b('Altos de Chavón Amphitheater', 'Anfiteatro Altos de Chavón'),
              type: 'venue',
              location: 'altos-de-chavon',
              summary: b(
                'Since its inauguration with Frank Sinatra’s legendary Concert for the Americas, this iconic 5,000-seat venue has welcomed many of the world’s most celebrated performers and remains one of the Caribbean’s premier open-air concert stages.',
                'Uno de los escenarios al aire libre más emblemáticos del Caribe. Desde su inauguración por Frank Sinatra en 1982, ha recibido a algunos de los artistas más importantes del mundo, convirtiéndose en un referente de la música y la cultura.'
              ),
            },
          },
        ],
      },
      {
        type: 'venues',
        eyebrow: b('Arts & experiences', 'Arte y experiencias'),
        title: b('Create, Learn & Be Inspired', 'Crear, Aprender e Inspirarse'),
        intro: b(
          'Altos de Chavón invites guests to experience creativity firsthand through pottery, weaving, artisan workshops, rotating art exhibitions, and the monthly Chavón Market. Whether creating your own piece or exploring local craftsmanship, every visit offers a deeper connection to Dominican culture.',
          'Altos de Chavón invita a descubrir el arte de forma participativa mediante talleres de cerámica, tejido, exposiciones, los talleres de Artisan Chavón y el tradicional Mercado de Chavón. Cada experiencia acerca al visitante a la creatividad y al patrimonio cultural dominicano.'
        ),
        listLabel: b('Featured experiences', 'Experiencias'),
        items: [
          P('Pottery Workshops', 'Talleres de Cerámica'),
          P('Weaving Workshops', 'Talleres de Tejido'),
          P('Artisan Chavón Studios', 'Artisan Chavón'),
          P('Art Gallery', 'Galería de Arte'),
          P('Chavón Market (Monthly)', 'Mercado de Chavón (Mensual)'),
        ],
      },
      {
        type: 'venues',
        eyebrow: b('Dining & nightlife', 'Gastronomía y vida nocturna'),
        title: b('From Relaxed Afternoons to Vibrant Evenings', 'Del Almuerzo al Último Brindis'),
        intro: b(
          'Whether you’re enjoying a leisurely lunch, sunset cocktails, or live music beneath the stars, Altos de Chavón offers one of Casa de Campo’s most dynamic social scenes.',
          'Desde almuerzos relajados y cafés hasta cócteles al atardecer y música en vivo, Altos de Chavón ofrece uno de los ambientes sociales más vibrantes de Casa de Campo.'
        ),
        listLabel: b('Restaurants & bars', 'Restaurantes y bares'),
        items: [
          R('Chilango Taqueria', 'altos-de-chavon'),
          R('La Piazzetta', 'altos-de-chavon'),
          R('La Cantina Latin Bistro', 'altos-de-chavon'),
          R('Alegría Bar & Restaurant', 'altos-de-chavon'),
          R('Dye Fore Bar', 'altos-de-chavon', 'bar'),
          R('Café Marietta', 'altos-de-chavon'),
          R('Voalá Café Marché', 'altos-de-chavon', 'cafe'),
          R('Park Deli', 'altos-de-chavon', 'cafe'),
          R(
            "Onno's",
            'altos-de-chavon',
            'restaurant',
            b(
              'A Casa de Campo favorite where casual dining naturally transitions into one of the destination’s liveliest evening atmospheres, with handcrafted cocktails, live DJs, and an open-air setting.',
              'Un clásico de Casa de Campo donde la gastronomía se transforma, al caer la tarde, en uno de los ambientes más animados del destino, con coctelería, DJ en vivo y una atmósfera al aire libre.'
            )
          ),
          R(
            'Genesis Nightclub',
            'altos-de-chavon',
            'bar',
            b(
              'The destination’s signature late-night venue, where internationally inspired music, guest DJs, and an energetic atmosphere keep the celebration going well into the night.',
              'El club nocturno emblemático de Casa de Campo, ideal para quienes desean prolongar la noche entre música, DJ invitados y un ambiente lleno de energía.'
            )
          ),
        ],
      },
      {
        type: 'venues',
        eyebrow: b('Shopping', 'Compras'),
        title: b('Curated Boutiques & Local Design', 'Boutiques con Identidad Propia'),
        intro: b(
          'Discover luxury fashion, handcrafted jewelry, artisan boutiques, Dominican cigars, local design, and unique gifts inspired by the Caribbean.',
          'Moda resort, joyería, diseño local, artesanía, puros dominicanos y regalos cuidadosamente seleccionados hacen de Altos de Chavón uno de los mejores lugares para comprar dentro de Casa de Campo.'
        ),
        listLabel: b('Featured boutiques', 'Boutiques destacadas'),
        items: [
          S('Pitusa', 'altos-de-chavon', 'fashion'),
          S('Jenny Polanco', 'altos-de-chavon', 'fashion'),
          S('Leslie Mota Jewelry', 'altos-de-chavon', 'jewelry'),
          S('Everett Designs', 'altos-de-chavon', 'jewelry'),
          S('La Alpagatería', 'altos-de-chavon', 'fashion'),
          S('Luna Taína', 'altos-de-chavon', 'gifts'),
          S('Amber Museum', 'altos-de-chavon', 'jewelry'),
          S('Cabinet Tobacco Boutique', 'altos-de-chavon', 'cigars'),
          S('Tienda Batey', 'altos-de-chavon', 'gifts'),
          S('La Tienda', 'altos-de-chavon', 'gifts'),
          S('Jacqueline Then', 'altos-de-chavon', 'fashion'),
        ],
      },
      {
        type: 'venues',
        eyebrow: b('Wellness', 'Bienestar'),
        title: b('Restore Mind, Body & Balance', 'Un Espacio para Reconectar'),
        items: [
          {
            // The Activities page's entry; the longer copy is this guide's note.
            venue: {
              kind: 'activity',
              id: 'activity-casa-equilibra',
              name: b('Casa Equilibra', 'Casa Equilibra'),
              summary: b(
                'A holistic wellness destination offering yoga, breathwork, recovery therapies, meditation, and personalized wellbeing experiences.',
                'Un espacio dedicado al bienestar integral donde el yoga, la meditación, las terapias de recuperación y las experiencias personalizadas se unen para reconectar cuerpo y mente.'
              ),
            },
            note: b(
              'A contemporary wellness space dedicated to movement, mindfulness, and holistic living. Offering yoga, Pilates, breathwork, sound healing, meditation, and specialized wellness experiences, Casa Equilibra provides a peaceful retreat designed to restore balance and reconnect with yourself in the inspiring surroundings of Altos de Chavón.',
              'Un moderno espacio dedicado al bienestar integral donde el movimiento, la respiración y la conexión personal se unen en un entorno inspirador. Disfruta de clases de yoga, Pilates, meditación, sound healing y experiencias diseñadas para restaurar el equilibrio entre cuerpo y mente.'
            ),
          },
        ],
      },
    ],
  },

  // ── Hotel Casa de Campo ──────────────────────────────────────────────────
  {
    slug: 'hotel',
    navLabel: b('Hotel Casa de Campo', 'Hotel Casa de Campo'),
    navOrder: 3,
    eyebrow: b('Hotel Casa de Campo', 'Hotel Casa de Campo'),
    title: b('More Than a Villa Stay.', 'Más que una Estancia en Villa.'),
    intro: b(
      'Staying in a villa doesn’t mean missing the Hotel—it means enjoying the best of both worlds.',
      'Hospedarse en una villa no significa perderse el Hotel: significa disfrutar lo mejor de ambos mundos.'
    ),
    button: { label: b('Discover the Hotel', 'Descubrir el Hotel'), href: EXPLORE },
    seoDescription: b(
      'Hotel Casa de Campo as an extension of your villa stay: restaurants, in-villa dining, pools, boutiques, fitness and services.',
      'El Hotel Casa de Campo como extensión de tu estancia en villa: restaurantes, servicio a la villa, piscinas, boutiques, gimnasio y servicios.'
    ),
    sections: [
      {
        type: 'feature',
        eyebrow: b('Hotel Casa de Campo', 'Hotel Casa de Campo'),
        title: b('The Resort’s Original Heart', 'El Corazón del Resort'),
        body: b(
          'While the privacy of your villa offers the comfort of feeling at home, Hotel Casa de Campo invites you to discover another side of the destination. Surrounded by lush tropical gardens, elegant pools, acclaimed restaurants, boutique shopping, and wellness experiences, the hotel naturally becomes an extension of your stay.\n\nWhether you’re enjoying breakfast overlooking the gardens, spending a relaxing afternoon by the pool, browsing the boutiques, or gathering for dinner after a day of golf, the hotel offers countless ways to enrich your Casa de Campo experience.',
          'Mientras la privacidad de tu villa te ofrece la tranquilidad de sentirte como en casa, el Hotel Casa de Campo te invita a descubrir otra faceta del destino. Rodeado de exuberantes jardines tropicales, elegantes piscinas, reconocidos restaurantes, boutiques y espacios de bienestar, el hotel se convierte en una extensión natural de tu estancia.\n\nYa sea para disfrutar de un desayuno entre jardines, relajarse junto a la piscina, recorrer sus boutiques o reunirse para cenar después de una jornada de golf, el hotel ofrece múltiples experiencias para complementar tu estancia en Casa de Campo.'
        ),
      },
      {
        type: 'venues',
        eyebrow: b('Dining', 'Gastronomía'),
        title: b('Relaxed Dining, Thoughtfully Curated', 'Sabores para Cada Momento del Día'),
        intro: b(
          'The Hotel offers a refined collection of restaurants and lounges designed for every moment of the day, from leisurely breakfasts to elegant dinners and evening cocktails.',
          'El Hotel reúne una cuidada selección de restaurantes y bares ideales para disfrutar desde un desayuno relajado hasta una elegante cena o un cóctel al finalizar el día.'
        ),
        listLabel: b('Featured venues', 'Restaurantes destacados'),
        items: [
          R(
            'La Caña Restaurant & Bar',
            'hotel',
            'restaurant',
            b(
              'French-inspired cuisine crafted with local ingredients, complemented by an elegant bar, live music, Dominican cigars, and an inviting atmosphere from breakfast through dinner.',
              'Cocina de inspiración francesa elaborada con ingredientes locales, acompañada de un elegante bar, música en vivo y una cuidada selección de puros y rones dominicanos.'
            )
          ),
          R(
            'Lago',
            'hotel',
            'restaurant',
            b(
              'A favorite among golfers and families alike, Lago serves generous breakfast and lunch buffets overlooking the legendary Teeth of the Dog® course and the Caribbean Sea.',
              'Reconocido por sus desayunos y almuerzos con vistas privilegiadas al legendario campo Teeth of the Dog® y al mar Caribe.'
            )
          ),
          R(
            'La Caña Bar & Lounge',
            'hotel',
            'bar',
            b(
              'The perfect setting for handcrafted cocktails, premium rums, and relaxed evenings in the heart of the resort.',
              'El lugar ideal para disfrutar de cócteles, rones premium y un ambiente relajado en el corazón del resort.'
            )
          ),
        ],
        button: { label: b('Discover Dining', 'Descubrir Restaurantes'), href: '/restaurants#area-hotel' },
      },
      {
        type: 'feature',
        eyebrow: b('In-villa dining', 'Servicio gastronómico en la villa'),
        title: b('Hotel Dining, Delivered to Your Villa', 'La Experiencia del Hotel, en la Privacidad de su Villa'),
        body: b(
          'Enjoy the convenience of the Hotel’s culinary offerings without leaving the privacy of your villa. Breakfast on the terrace, a relaxed poolside lunch, family dinner, or a late-night meal can all be delivered directly to your door, allowing you to experience the comfort of resort dining in your own private setting.\n\nBecause true luxury is enjoying exceptional service without interrupting the moments that matter most. Room service is available throughout the day, with breakfast, lunch, dinner, beverages, and desserts.',
          'Disfrute de la propuesta gastronómica del Hotel sin salir de la comodidad de su villa. Un desayuno en la terraza, un almuerzo junto a la piscina, una cena en familia o una comida al finalizar el día pueden ser entregados directamente a su alojamiento para que disfrute cada momento con total privacidad.\n\nPorque el verdadero lujo consiste en disfrutar un servicio excepcional sin interrumpir los momentos que realmente importan. El servicio incluye desayunos, almuerzos, cenas, bebidas y postres durante todo el día.'
        ),
        button: { label: b('Order In-Villa Dining', 'Solicitar Servicio Gastronómico'), href: 'https://wa.me/18293422566' },
      },
      {
        type: 'feature',
        eyebrow: b('Pools & leisure', 'Piscinas y relax'),
        title: b('A Place to Unwind', 'Un Espacio para Desconectar'),
        body: b(
          'Surrounded by tropical gardens, the Hotel’s pool area offers a peaceful retreat with comfortable loungers, private cabanas, attentive poolside service, and inviting spaces designed for relaxation between adventures.',
          'Rodeadas de jardines tropicales, las piscinas del Hotel ofrecen un ambiente tranquilo con cómodos camastros, gazebos privados y servicio junto a la piscina, creando el lugar ideal para relajarse durante el día.'
        ),
        button: { label: b('Discover the Pools', 'Descubrir las Piscinas') },
      },
      {
        type: 'venues',
        eyebrow: b('Shopping', 'Compras'),
        title: b('Boutiques Worth Visiting', 'Boutiques para Descubrir'),
        intro: b(
          'Whether searching for resort fashion, premium cigars, or exclusive golf apparel, the Hotel’s boutiques offer a carefully curated shopping experience.',
          'Desde moda resort hasta puros dominicanos y artículos exclusivos de golf, las boutiques del Hotel ofrecen una experiencia de compras cuidadosamente seleccionada.'
        ),
        listLabel: b('Featured boutiques', 'Boutiques destacadas'),
        items: [
          S('La Boutique', 'hotel', 'resortwear', b('Luxury resort wear, accessories, gifts, and vacation essentials.', 'Moda resort, accesorios, regalos y artículos esenciales para sus vacaciones.')),
          S('Cabinet Tobacco Boutique', 'hotel', 'cigars', b('Premium Dominican cigars and tobacco accessories.', 'Puros dominicanos premium y accesorios especializados.')),
          S(
            'Teeth of the Dog Pro Shop',
            'golf',
            'sports',
            b(
              'Official golf apparel, equipment, footwear, accessories, and exclusive merchandise from one of the world’s most celebrated golf courses.',
              'Ropa, zapatos, accesorios y artículos oficiales de uno de los campos de golf más prestigiosos del mundo.'
            )
          ),
        ],
        button: { label: b('Explore the Boutiques', 'Explorar Boutiques') },
      },
      {
        type: 'feature',
        eyebrow: b('Fitness & wellness', 'Bienestar y fitness'),
        title: b('Stay Active, Recharge Naturally', 'Manténgase Activo o Simplemente Relájese'),
        body: b(
          'Maintain your wellness routine at the Hotel’s fully equipped Fitness Center or enjoy a peaceful walk through the surrounding gardens. The Hotel complements the resort’s wellness offerings, providing everything needed to recharge between days of golf, beach, and adventure.',
          'Continúe con su rutina en el moderno gimnasio del Hotel o disfrute de un paseo entre los jardines tropicales. El Hotel complementa la oferta de bienestar del resort, ofreciendo espacios ideales para recuperar energías entre un día de golf, playa y actividades.'
        ),
        button: { label: b('Discover Wellness', 'Descubrir Bienestar') },
      },
      {
        type: 'venues',
        eyebrow: b('Hotel services', 'Servicios del hotel'),
        title: b('Everything Close at Hand', 'Todo lo que Necesita, Muy Cerca'),
        intro: b(
          'The Hotel also offers a selection of convenient services designed to make every visit even more comfortable.',
          'El Hotel reúne una selección de servicios pensados para brindar mayor comodidad durante su estancia.'
        ),
        listLabel: b('Available services', 'Servicios disponibles'),
        items: [
          P('Beauty Salon', 'Salón de Belleza'),
          P('Banco Popular ATM', 'Cajero Automático Banco Popular'),
          P('Emergency Medical Assistance', 'Asistencia Médica de Emergencia'),
          P('Concierge Services', 'Servicio de Concierge'),
        ],
        button: { label: b('Discover Hotel Services', 'Descubrir Servicios') },
      },
    ],
  },

  // ── Nightlife ────────────────────────────────────────────────────────────
  {
    slug: 'nightlife',
    navLabel: b('Nightlife', 'Vida Nocturna'),
    navOrder: 4,
    eyebrow: b('Nightlife', 'Vida Nocturna'),
    title: b('Where the Night Finds Its Rhythm', 'Donde la Noche Encuentra su Ritmo'),
    intro: b(
      'As daylight fades, Casa de Campo transforms into one of the Caribbean’s most vibrant social destinations. Waterfront cocktails, open-air lounges, live DJs, and unforgettable celebrations create an atmosphere where every evening naturally unfolds into an extraordinary night.\n\nWhether you’re toasting beneath the stars, dancing with friends, or enjoying the energy of the marina, every venue offers its own unique rhythm.',
      'Cuando cae el sol, Casa de Campo revela una de las escenas sociales más vibrantes del Caribe. Cócteles frente al mar, terrazas al aire libre, DJ en vivo y noches llenas de energía crean el ambiente perfecto para celebrar, compartir y disfrutar hasta tarde.\n\nDesde una copa al atardecer hasta la última canción de la noche, cada lugar ofrece una experiencia diferente.'
    ),
    button: { label: b('Discover Nightlife', 'Descubre la Vida Nocturna'), href: EXPLORE },
    seoDescription: b(
      'Casa de Campo after dark: SBG at the Marina, Onno’s in Altos de Chavón and Genesis Night Club.',
      'Casa de Campo de noche: SBG en La Marina, Onno’s en Altos de Chavón y Genesis Night Club.'
    ),
    sections: [
      {
        type: 'feature',
        eyebrow: b('SBG Marina', 'SBG Marina'),
        title: b('Where Every Great Night Begins', 'Donde Comienzan las Mejores Noches'),
        body: b(
          'With panoramic views over the Marina, SBG has become Casa de Campo’s signature evening destination. As the sun sets, the atmosphere gradually shifts from refined waterfront dining to one of the destination’s most sought-after nightlife experiences.\n\nSignature cocktails, live DJs, exceptional cuisine, and an effortlessly sophisticated crowd make every evening feel like an occasion worth celebrating.',
          'Con una ubicación privilegiada frente a la Marina, SBG se ha convertido en el escenario más icónico para comenzar la noche en Casa de Campo. Lo que inicia como una elegante cena frente al agua evoluciona naturalmente hacia una de las experiencias nocturnas más exclusivas del destino.\n\nCoctelería de autor, excelente gastronomía, DJ en vivo y un ambiente sofisticado convierten cada noche en una ocasión para celebrar.'
        ),
        venue: { kind: 'restaurant', name: "SBG (Sofia's Bar & Grill)", area: 'marina', venueType: 'restaurant' },
        button: { label: b('Reserve Your Table', 'Reservar una Mesa') },
      },
      {
        type: 'feature',
        eyebrow: b("Onno's", "Onno's"),
        title: b('The Night Comes Alive', 'Donde la Noche Cobra Vida'),
        body: b(
          'As the lights illuminate the cobblestone streets of Altos de Chavón, Onno’s becomes one of the destination’s liveliest gathering places. Music, handcrafted cocktails, and an energetic open-air atmosphere make it the perfect setting to continue the evening with friends.\n\nRelaxed, vibrant, and unmistakably Caribbean.',
          'Cuando las calles de Altos de Chavón se iluminan, Onno’s se transforma en uno de los puntos de encuentro más animados del destino. Música, coctelería y un ambiente al aire libre crean el escenario perfecto para continuar la noche entre amigos.\n\nRelajado, vibrante y auténticamente caribeño.'
        ),
        venue: { kind: 'restaurant', name: "Onno's", area: 'altos-de-chavon', venueType: 'restaurant' },
        button: { label: b("Visit Onno's", "Visita Onno's") },
      },
      {
        type: 'feature',
        eyebrow: b('Genesis Night Club', 'Genesis Night Club'),
        title: b('Dance Into the Night', 'La Noche Aún Continúa'),
        body: b(
          'For those who believe every unforgettable evening deserves one last stop, Genesis is Casa de Campo’s iconic late-night destination. International DJs, contemporary music, and an electric atmosphere keep the celebration going well into the early hours.',
          'Para quienes saben que las mejores noches siempre tienen un último destino, Genesis es el club nocturno emblemático de Casa de Campo. DJ invitados, música y una atmósfera llena de energía convierten cada visita en el cierre perfecto de una gran noche.'
        ),
        venue: { kind: 'restaurant', name: 'Genesis Nightclub', area: 'altos-de-chavon', venueType: 'bar' },
        button: { label: b('Experience Genesis', 'Descubre Genesis') },
      },
    ],
  },
  // ── Beaches & Islands ────────────────────────────────────────────────────
  {
    slug: 'beaches',
    navLabel: b('Beaches & Islands', 'Playas e Islas'),
    navOrder: 5,
    eyebrow: b('Beaches & Islands', 'Playas e Islas'),
    title: b('Where the Caribbean Becomes Your Playground', 'Donde el Caribe se Convierte en tu Lugar Favorito'),
    intro: b(
      'Some places are meant to be admired. Others are meant to be experienced.\n\nFrom the exclusive shores of Minitas Beach to the turquoise sandbanks of Palmilla and the protected islands of Catalina and Saona, discover a collection of coastal experiences that capture the very essence of the Caribbean—whether you’re seeking relaxation, adventure, or simply a quiet day by the sea.',
      'Hay lugares que se visitan. Otros se viven.\n\nDesde la playa privada de Minitas hasta las aguas turquesas de Palmilla y las islas protegidas de Catalina y Saona, descubre una colección de experiencias que reflejan la esencia del Caribe. Espacios creados para relajarse, explorar y disfrutar del mar a tu propio ritmo.'
    ),
    button: { label: b('Explore the Caribbean', 'Explora el Caribe'), href: EXPLORE },
    seoDescription: b(
      'From the exclusive shores of Minitas Beach to the turquoise sandbanks of Palmilla and the protected islands of Catalina and Saona — the beaches and islands of Casa de Campo.',
      'Desde la playa privada de Minitas hasta las aguas turquesas de Palmilla y las islas protegidas de Catalina y Saona — las playas e islas de Casa de Campo.'
    ),
    sections: [
      {
        type: 'feature',
        eyebrow: b('Minitas Beach', 'Playa Minitas'),
        title: b('The Social Heart of the Coast', 'El Corazón del Estilo de Vida Frente al Mar'),
        body: b(
          'More than Casa de Campo’s private beach, Minitas is where beach days naturally unfold into unforgettable moments. Swim in calm Caribbean waters, enjoy watersports, relax by the infinity pool, browse beach boutiques, or spend the afternoon between oceanfront restaurants, bars, and the iconic Minitas Beach Club.\n\nWhether you’re sharing lunch with family, enjoying a signature Piña Colada, or watching the sunset with your feet in the sand, Minitas brings together everything that defines the resort’s coastal lifestyle in one extraordinary setting.',
          'Más que la playa privada de Casa de Campo, Minitas es el lugar donde cada día junto al mar cobra vida. Disfruta de tranquilas aguas caribeñas, deportes acuáticos, una piscina infinity, boutiques, bares, restaurantes frente al mar y el reconocido Minitas Beach Club, todo en un mismo lugar.\n\nYa sea compartiendo un almuerzo en familia, disfrutando una Piña Colada o contemplando el atardecer con los pies en la arena, Playa Minitas reúne todo lo que hace único el estilo de vida de Casa de Campo.'
        ),
        venue: {
          kind: 'landmark',
          name: b('Minitas Beach', 'Playa Minitas'),
          type: 'beach',
          location: 'beach',
          summary: b(
            'Casa de Campo’s private beach, with calm water, the Minitas Beach Club, an infinity pool, restaurants, bars and watersports.',
            'La playa privada de Casa de Campo, con aguas tranquilas, el Minitas Beach Club, piscina infinity, restaurantes, bares y deportes acuáticos.'
          ),
        },
        highlightsLabel: b('Experience Highlights', 'Lo Más Destacado'),
        highlights: [
          P('Private Beach', 'Playa Privada'),
          P('Minitas Beach Club'),
          P('Infinity and Family Pool', 'Piscina Infinity y Familiar'),
          P('Beachfront Restaurant', 'Restaurante Frente al Mar'),
          P('Bars & Lounge Areas', 'Bares de Playa'),
          P('Food Truck Village', 'Área de Food Trucks'),
          P('Beach Boutiques', 'Boutiques'),
          P('Watersports', 'Deportes Acuáticos'),
        ],
        // No page to send this to yet — add a link in Studio to show it.
        button: { label: b('Discover Minitas Beach', 'Descubre Playa Minitas') },
      },
      {
        type: 'feature',
        eyebrow: b('Palmilla', 'Palmilla'),
        title: b('The Caribbean’s Natural Sandbar', 'El Banco de Arena Más Emblemático del Caribe'),
        body: b(
          'Just offshore from Saona Island lies Palmilla, a breathtaking stretch of shallow turquoise water where boats gather for one of the Dominican Republic’s most iconic day trips. With powder-soft sand beneath crystal-clear water and endless Caribbean views, Palmilla is the perfect place to swim, snorkel, or simply enjoy the beauty of the sea.',
          'Frente a Isla Saona se encuentra Palmilla, un espectacular banco de arena de aguas poco profundas y tonos turquesa donde el Caribe se muestra en su máxima expresión. Un escenario perfecto para nadar, practicar snorkel o simplemente relajarse rodeado de un paisaje inolvidable.'
        ),
        venue: {
          kind: 'landmark',
          name: b('Palmilla', 'Palmilla'),
          type: 'island',
          location: 'off-resort',
          summary: b(
            'A shallow turquoise sandbar just off Saona Island, for swimming and snorkelling.',
            'Un banco de arena de aguas turquesas poco profundas frente a Isla Saona, para nadar y hacer snorkel.'
          ),
          details: [
            {
              value: b(
                'Located approximately 30 minutes by private boat from Casa de Campo Marina.',
                'Ubicado a aproximadamente 30 minutos en embarcación privada desde la Marina de Casa de Campo.'
              ),
            },
          ],
        },
        button: { label: b('Plan Your Escape', 'Planifica Tu Experiencia'), href: 'https://wa.me/18293422566' },
      },
      {
        type: 'feature',
        eyebrow: b('Catalina Island', 'Isla Catalina'),
        title: b('An Island Shaped by Nature', 'Una Isla Donde la Naturaleza Es la Protagonista'),
        body: b(
          'Protected as part of Cotubanamá National Park, Catalina Island is renowned for its white-sand beaches and vibrant coral reefs. Its calm, transparent waters make it one of the Caribbean’s premier destinations for snorkeling, while its untouched shoreline offers a peaceful escape just beyond the mainland.',
          'Protegida como parte del Parque Nacional Cotubanamá, Isla Catalina combina playas de arena blanca, arrecifes de coral y aguas cristalinas que la convierten en uno de los mejores destinos para practicar snorkel en el Caribe. Un refugio natural ideal para disfrutar del mar en su estado más puro.'
        ),
        venue: {
          kind: 'landmark',
          name: b('Catalina Island', 'Isla Catalina'),
          type: 'island',
          location: 'off-resort',
          summary: b(
            'White-sand beaches and coral reefs in Cotubanamá National Park, one of the Caribbean’s best snorkelling spots.',
            'Playas de arena blanca y arrecifes de coral en el Parque Nacional Cotubanamá, uno de los mejores lugares para hacer snorkel en el Caribe.'
          ),
          details: [
            {
              value: b(
                'Located approximately 25 minutes by private boat from Casa de Campo Marina.',
                'Ubicada a aproximadamente 25 minutos en embarcación privada desde la Marina de Casa de Campo.'
              ),
            },
          ],
        },
        button: { label: b('Discover Catalina Island', 'Descubre Isla Catalina'), href: 'https://wa.me/18293422566' },
      },
      {
        type: 'feature',
        eyebrow: b('Saona Island', 'Isla Saona'),
        title: b('A Caribbean Icon', 'Un Ícono del Caribe'),
        body: b(
          'Few places capture the spirit of the Dominican Republic quite like Saona Island. Protected within Cotubanamá National Park, its untouched beaches, swaying palms, and turquoise waters have made it one of the Caribbean’s most celebrated natural treasures.\n\nWhether exploring hidden coves, swimming in crystal-clear waters, or simply enjoying the journey by private boat, Saona offers an unforgettable escape surrounded by extraordinary natural beauty.',
          'Pocos lugares representan la belleza natural de República Dominicana como Isla Saona. Protegida dentro del Parque Nacional Cotubanamá, sus playas vírgenes, palmeras y aguas turquesas la han convertido en uno de los destinos más admirados del Caribe.\n\nYa sea explorando sus rincones naturales, disfrutando de un baño en aguas cristalinas o simplemente navegando hasta ella en una embarcación privada, Saona ofrece una experiencia inolvidable rodeada de paisajes únicos.'
        ),
        venue: {
          kind: 'landmark',
          name: b('Saona Island', 'Isla Saona'),
          type: 'island',
          location: 'off-resort',
          summary: b(
            'Untouched beaches, palms and turquoise water in Cotubanamá National Park.',
            'Playas vírgenes, palmeras y aguas turquesas en el Parque Nacional Cotubanamá.'
          ),
          details: [
            {
              value: b(
                'Located approximately 45–60 minutes by private boat from Casa de Campo Marina.',
                'Ubicada a aproximadamente 45–60 minutos en embarcación privada desde la Marina de Casa de Campo.'
              ),
            },
          ],
        },
        button: { label: b('Visit Saona Island', 'Visita Isla Saona'), href: 'https://wa.me/18293422566' },
      },
    ],
  },
]

// ── Resolving venues ───────────────────────────────────────────────────────
const norm = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
const slugify = (s: string) => norm(s).replace(/ /g, '-').slice(0, 80)
const key = () => randomUUID().replace(/-/g, '').slice(0, 12)

let existing: { restaurants: any[]; shops: any[]; landmarks: any[]; activities: string[] }
const created: string[] = []
const toCreate: any[] = []

/** The _id of the matching venue, creating it (once) if it doesn't exist. */
function resolve(v: Venue): string {
  if (v.kind === 'restaurant') {
    const hit = existing.restaurants.find((r) => norm(r.name_en || '') === norm(v.name))
    if (hit) return hit._id
    const _id = `restaurant-${slugify(v.name)}`
    if (!toCreate.some((d) => d._id === _id)) {
      toCreate.push({
        _id,
        _type: 'restaurant',
        name_en: v.name,
        name_es: v.name,
        slug: { _type: 'slug', current: slugify(v.name) },
        area: v.area,
        venueType: v.venueType,
        status: 'draft',
      })
      created.push(`restaurant (draft): ${v.name}`)
    }
    return _id
  }
  if (v.kind === 'shop') {
    const hit = existing.shops.find((s) => norm(s.name || '') === norm(v.name) && s.location === v.location)
    if (hit) return hit._id
    const _id = `shop-${slugify(v.name)}-${v.location}`
    if (!toCreate.some((d) => d._id === _id)) {
      toCreate.push({
        _id,
        _type: 'shop',
        name: v.name,
        slug: { _type: 'slug', current: slugify(`${v.name} ${v.location}`) },
        location: v.location,
        category: v.category,
        isActive: true,
      })
      created.push(`shop: ${v.name} (${v.location})`)
    }
    return _id
  }
  if (v.kind === 'activity') {
    // update-activities.ts sets its group and order; it patches, so either
    // script can run first.
    if (!existing.activities.includes(v.id) && !toCreate.some((d) => d._id === v.id)) {
      toCreate.push({
        _id: v.id,
        _type: 'activity',
        name_en: v.name.en,
        name_es: v.name.es,
        slug: { _type: 'slug', current: slugify(v.name.en) },
        summary_en: v.summary.en,
        summary_es: v.summary.es,
        isActive: true,
      })
      created.push(`activity: ${v.name.en}`)
    }
    return v.id
  }
  const hit = existing.landmarks.find((l) => norm(l.name_en || '') === norm(v.name.en))
  if (hit) return hit._id
  const _id = `landmark-${slugify(v.name.en)}`
  if (!toCreate.some((d) => d._id === _id)) {
    toCreate.push({
      _id,
      _type: 'landmark',
      name_en: v.name.en,
      name_es: v.name.es,
      slug: { _type: 'slug', current: slugify(v.name.en) },
      kind: v.type,
      location: v.location,
      summary_en: v.summary.en,
      summary_es: v.summary.es,
      ...(v.details
        ? {
            details: v.details.map((d) => ({
              _key: key(),
              _type: 'detailLine',
              ...biFields('label', d.label),
              value_en: d.value.en,
              value_es: d.value.es,
            })),
          }
        : {}),
      isActive: true,
    })
    created.push(`place: ${v.name.en}`)
  }
  return _id
}

const biFields = (name: string, v?: Bi) => (v ? { [`${name}_en`]: v.en, [`${name}_es`]: v.es } : {})
const ref = (v: Venue) => ({ _type: 'reference', _ref: resolve(v) })
const buttonFields = (btn?: Button) =>
  btn ? { ...biFields('buttonLabel', btn.label), ...(btn.href ? { buttonHref: btn.href } : {}) } : {}

const itemDoc = (i: Item) => ({
  _key: key(),
  _type: 'guideItem',
  ...(i.venue ? { venue: ref(i.venue) } : {}),
  ...biFields('name', i.name),
  ...biFields('note', i.note),
})

function sectionDoc(s: Section) {
  const base = { _key: key(), ...biFields('eyebrow', s.eyebrow), ...biFields('title', s.title), ...(s.anchor ? { anchor: s.anchor } : {}) }
  if (s.type === 'feature') {
    return {
      ...base,
      _type: 'guideFeature',
      ...biFields('body', s.body),
      ...(s.venue ? { venue: ref(s.venue) } : {}),
      ...biFields('highlightsLabel', s.highlightsLabel),
      ...(s.highlights ? { highlights: s.highlights.map(itemDoc) } : {}),
      ...buttonFields(s.button),
    }
  }
  if (s.type === 'venues') {
    return {
      ...base,
      _type: 'guideVenues',
      ...biFields('intro', s.intro),
      ...biFields('listLabel', s.listLabel),
      items: s.items.map(itemDoc),
      ...buttonFields(s.button),
    }
  }
  return {
    ...base,
    _type: 'guideDirectory',
    ...biFields('intro', s.intro),
    groups: s.groups.map((g) => ({
      _key: key(),
      _type: 'guideGroup',
      ...biFields('title', g.title),
      ...biFields('description', g.description),
      ...biFields('listLabel', g.listLabel),
      items: g.items.map(itemDoc),
    })),
  }
}

async function main() {
  existing = await client.fetch(`{
    "restaurants": *[_type == "restaurant" && !(_id in path("drafts.**"))]{ _id, name_en },
    "shops": *[_type == "shop" && !(_id in path("drafts.**"))]{ _id, name, location },
    "landmarks": *[_type == "landmark" && !(_id in path("drafts.**"))]{ _id, name_en },
    "activities": *[_type == "activity" && !(_id in path("drafts.**"))]._id
  }`)

  const guides: any[] = []
  for (const g of GUIDES) {
    const _id = `resortGuide-${g.slug}`
    if (await client.getDocument(_id)) {
      console.log(`${dataset}: ${_id} already exists, left as is`)
      continue
    }
    guides.push({
      _id,
      _type: 'resortGuide',
      ...biFields('navLabel', g.navLabel),
      slug: { _type: 'slug', current: g.slug },
      showInNav: true,
      navOrder: g.navOrder,
      isActive: true,
      ...biFields('eyebrow', g.eyebrow),
      ...biFields('title', g.title),
      ...biFields('intro', g.intro),
      heroOverlay: 35,
      ...buttonFields(g.button),
      ...biFields('seoDescription', g.seoDescription),
      sections: g.sections.map(sectionDoc),
    })
  }

  if (dryRun) {
    console.log(`Would create ${toCreate.length} venues:\n  ${created.join('\n  ')}`)
    console.log(`Would create guides: ${guides.map((g) => g._id).join(', ') || 'none'}`)
    return
  }

  // Venues first, so the guides' references point at real documents.
  const tx = client.transaction()
  toCreate.forEach((d) => tx.createIfNotExists(d))
  guides.forEach((d) => tx.createIfNotExists(d))
  await tx.commit()

  console.log(`${dataset}: created ${guides.length} guides (${guides.map((g) => g.slug.current).join(', ') || 'none'})`)
  if (created.length) console.log(`and ${created.length} venues:\n  ${created.join('\n  ')}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
