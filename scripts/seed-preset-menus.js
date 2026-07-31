/**
 * Seed default preset menus into Sanity.
 *
 * Usage:
 *   yarn seed-menus          # creates missing, leaves existing alone
 *   yarn seed-menus --force  # overwrites existing menu docs
 *
 * These are starter menus across the meal types Leticia commonly arranges
 * for guests at Casa de Campo: welcome breakfasts, lunch spreads, plated
 * dinners, BBQs, sushi nights, kids' menus. Editors can tweak prices,
 * swap dishes, add photos, or build new menus from scratch in Studio.
 */
const { createClient } = require('@sanity/client')
const path = require('path')
const dotenv = require('dotenv')

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const force = process.argv.includes('--force')

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'development',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
  apiVersion: '2025-09-06',
})

if (!process.env.SANITY_API_WRITE_TOKEN) {
  console.error('Missing SANITY_API_WRITE_TOKEN in .env.local')
  process.exit(1)
}

/**
 * Build a single course object. `items` is an array of [en, es] pairs.
 * `_key` is required for Sanity arrays — we hash the index in.
 */
function course(courseName_en, courseName_es, items) {
  return {
    _type: 'course',
    _key: `c-${courseName_en.toLowerCase().replace(/\W+/g, '-')}`,
    courseName_en,
    courseName_es,
    items_en: items.map((i) => i[0]),
    items_es: items.map((i) => i[1]),
  }
}

const MENUS = [
  // ------------------------------------------------------------------
  // BREAKFAST
  // ------------------------------------------------------------------
  {
    slug: 'welcome-breakfast',
    name_en: 'Welcome Breakfast',
    name_es: 'Desayuno de Bienvenida',
    description_en:
      'A relaxed first morning at the villa — fresh fruit, pastries, eggs how you like them, and proper coffee.',
    description_es:
      'Una primera mañana tranquila en la villa — fruta fresca, pastelería, huevos al gusto y buen café.',
    mealType: 'breakfast',
    cuisine: 'international',
    isFeatured: true,
    pricePerPerson: { amount: 45, currency: 'USD' },
    minGuests: 2,
    leadTimeHours: 12,
    courses: [
      course('To start', 'Para empezar', [
        ['Sliced tropical fruit (mango, papaya, pineapple)', 'Fruta tropical en rodajas (mango, papaya, piña)'],
        ['Greek yogurt with honey and granola', 'Yogur griego con miel y granola'],
        ['Fresh-squeezed orange juice', 'Jugo de naranja recién exprimido'],
      ]),
      course('Pastries', 'Pastelería', [
        ['Butter croissants', 'Croissants de mantequilla'],
        ['Pain au chocolat', 'Pain au chocolat'],
        ['Fresh banana bread', 'Pan de banana fresco'],
      ]),
      course('Hot', 'Caliente', [
        ['Eggs to order (scrambled, fried, omelette)', 'Huevos al gusto (revueltos, fritos, omelette)'],
        ['Crispy bacon', 'Tocineta crujiente'],
        ['Avocado toast on sourdough', 'Tostada de aguacate en pan de masa madre'],
      ]),
      course('Drinks', 'Bebidas', [
        ['Freshly brewed Dominican coffee', 'Café dominicano recién hecho'],
        ['Selection of teas', 'Selección de tés'],
      ]),
    ],
  },

  {
    slug: 'dominican-breakfast',
    name_en: 'Dominican Breakfast',
    name_es: 'Desayuno Dominicano',
    description_en:
      'Mangú, eggs, salami, fried cheese — the breakfast Dominicans actually eat. Strong coffee included.',
    description_es:
      'Mangú, huevos, salami, queso frito — el desayuno que los dominicanos realmente comen. Café fuerte incluido.',
    mealType: 'breakfast',
    cuisine: 'dominican',
    pricePerPerson: { amount: 35, currency: 'USD' },
    minGuests: 2,
    leadTimeHours: 12,
    courses: [
      course('Plate', 'Plato', [
        ['Mangú (mashed plantains with sautéed red onion)', 'Mangú (puré de plátano con cebolla salteada)'],
        ['Fried Dominican salami', 'Salami dominicano frito'],
        ['Fried white cheese (queso de freír)', 'Queso de freír'],
        ['Two eggs to order', 'Dos huevos al gusto'],
        ['Avocado slices', 'Aguacate en rodajas'],
      ]),
      course('On the side', 'Para acompañar', [
        ['Fresh-squeezed orange juice', 'Jugo de naranja recién exprimido'],
        ['Strong Dominican coffee with milk', 'Café dominicano fuerte con leche'],
      ]),
    ],
  },

  // ------------------------------------------------------------------
  // BRUNCH
  // ------------------------------------------------------------------
  {
    slug: 'tropical-brunch',
    name_en: 'Tropical Brunch',
    name_es: 'Brunch Tropical',
    description_en:
      'Late-morning spread for a slow Sunday — eggs Benedict, smoked salmon, mimosas optional.',
    description_es:
      'Spread de media mañana para un domingo tranquilo — huevos Benedict, salmón ahumado, mimosas opcionales.',
    mealType: 'brunch',
    cuisine: 'international',
    pricePerPerson: { amount: 65, currency: 'USD' },
    minGuests: 4,
    leadTimeHours: 24,
    courses: [
      course('Cold', 'Frío', [
        ['Smoked salmon platter with capers and red onion', 'Tabla de salmón ahumado con alcaparras y cebolla morada'],
        ['Fresh tropical fruit', 'Fruta tropical fresca'],
        ['Greek yogurt parfaits', 'Parfaits de yogur griego'],
      ]),
      course('Hot', 'Caliente', [
        ['Eggs Benedict with hollandaise', 'Huevos Benedict con holandesa'],
        ['Buttermilk pancakes with maple syrup', 'Panqueques con jarabe de arce'],
        ['Roasted breakfast potatoes', 'Papas asadas'],
      ]),
      course('Drinks', 'Bebidas', [
        ['Mimosa station (Prosecco + fresh OJ)', 'Estación de mimosas (Prosecco + jugo de naranja)'],
        ['Coffee, tea, juices', 'Café, té, jugos'],
      ]),
    ],
  },

  // ------------------------------------------------------------------
  // LUNCH
  // ------------------------------------------------------------------
  {
    slug: 'poolside-lunch',
    name_en: 'Poolside Lunch',
    name_es: 'Almuerzo Junto a la Piscina',
    description_en:
      'Light, fresh, easy to eat between dips — ceviche, a big salad, grilled fish tacos.',
    description_es:
      'Ligero, fresco, fácil de comer entre chapuzones — ceviche, ensalada grande, tacos de pescado a la parrilla.',
    mealType: 'lunch',
    cuisine: 'caribbean',
    pricePerPerson: { amount: 55, currency: 'USD' },
    minGuests: 4,
    leadTimeHours: 12,
    courses: [
      course('Starters', 'Entrantes', [
        ['Shrimp ceviche with avocado and lime', 'Ceviche de camarones con aguacate y limón'],
        ['Tostones with garlic mojo', 'Tostones con mojo de ajo'],
      ]),
      course('Mains', 'Platos principales', [
        ['Grilled mahi-mahi tacos with mango salsa', 'Tacos de dorado a la parrilla con salsa de mango'],
        ['Caribbean chopped salad with citrus vinaigrette', 'Ensalada caribeña con vinagreta cítrica'],
        ['Black beans and coconut rice', 'Habichuelas negras y arroz con coco'],
      ]),
      course('Sweet', 'Dulce', [
        ['Coconut flan', 'Flan de coco'],
      ]),
    ],
  },

  // ------------------------------------------------------------------
  // DINNER
  // ------------------------------------------------------------------
  {
    slug: 'italian-dinner',
    name_en: 'Italian Dinner',
    name_es: 'Cena Italiana',
    description_en:
      'A four-course dinner the way an Italian nonna would do it — handmade pasta, fish from the day, tiramisu.',
    description_es:
      'Cena de cuatro tiempos al estilo de una nonna italiana — pasta hecha a mano, pescado del día, tiramisu.',
    mealType: 'dinner',
    cuisine: 'italian',
    isFeatured: true,
    pricePerPerson: { amount: 120, currency: 'USD' },
    minGuests: 4,
    maxGuests: 14,
    leadTimeHours: 48,
    allergenInfo_en: 'Contains gluten, dairy, fish. Vegetarian version available.',
    allergenInfo_es: 'Contiene gluten, lácteos, pescado. Versión vegetariana disponible.',
    courses: [
      course('Antipasto', 'Antipasto', [
        ['Burrata with heirloom tomatoes and basil', 'Burrata con tomates heirloom y albahaca'],
        ['Prosciutto di Parma with fresh figs', 'Prosciutto di Parma con higos frescos'],
        ['Marinated olives and focaccia', 'Aceitunas marinadas y focaccia'],
      ]),
      course('Primo', 'Primer plato', [
        ['Handmade tagliatelle with white truffle butter', 'Tagliatelle hecho a mano con mantequilla de trufa blanca'],
      ]),
      course('Secondo', 'Segundo plato', [
        ['Whole roasted branzino with lemon and capers', 'Branzino entero al horno con limón y alcaparras'],
        ['Grilled vegetables with aged balsamic', 'Vegetales a la parrilla con balsámico añejado'],
      ]),
      course('Dolce', 'Postre', [
        ['Classic tiramisu', 'Tiramisu clásico'],
        ['Espresso and digestivo', 'Espresso y digestivo'],
      ]),
    ],
  },

  {
    slug: 'dominican-feast',
    name_en: 'Dominican Feast',
    name_es: 'Banquete Dominicano',
    description_en:
      'The full Dominican experience — sancocho, mofongo, slow-roasted pork, tres leches. Bring an appetite.',
    description_es:
      'La experiencia dominicana completa — sancocho, mofongo, cerdo asado, tres leches. Trae apetito.',
    mealType: 'dinner',
    cuisine: 'dominican',
    isFeatured: true,
    pricePerPerson: { amount: 95, currency: 'USD' },
    minGuests: 6,
    leadTimeHours: 48,
    courses: [
      course('To start', 'Para empezar', [
        ['Yaniqueques with avocado dip', 'Yaniqueques con dip de aguacate'],
        ['Quipes (Dominican kibbeh)', 'Quipes'],
      ]),
      course('Soup', 'Sopa', [
        ['Sancocho de siete carnes (seven-meat stew)', 'Sancocho de siete carnes'],
      ]),
      course('Main', 'Plato principal', [
        ['Slow-roasted pernil (Dominican pork shoulder)', 'Pernil asado lentamente'],
        ['Mofongo with garlic-shrimp sauce', 'Mofongo con salsa de ajo y camarones'],
        ['Moro de habichuelas (rice and beans)', 'Moro de habichuelas'],
        ['Ensalada verde', 'Ensalada verde'],
      ]),
      course('Dessert', 'Postre', [
        ['Tres leches cake', 'Pastel de tres leches'],
        ['Dulce de leche helado', 'Dulce de leche helado'],
      ]),
    ],
  },

  {
    slug: 'sushi-night',
    name_en: 'Sushi Night',
    name_es: 'Noche de Sushi',
    description_en:
      'Itamae chef on-site, knife-cut at the counter — sashimi, nigiri, signature rolls.',
    description_es:
      'Chef itamae en sitio, cortado al momento — sashimi, nigiri, rolls de la casa.',
    mealType: 'dinner',
    cuisine: 'japanese',
    pricePerPerson: { amount: 150, currency: 'USD' },
    minGuests: 4,
    maxGuests: 12,
    leadTimeHours: 72,
    allergenInfo_en: 'Contains raw fish, soy, sesame.',
    allergenInfo_es: 'Contiene pescado crudo, soya, ajonjolí.',
    courses: [
      course('Cold', 'Frío', [
        ['Edamame with sea salt', 'Edamame con sal marina'],
        ['Tuna tartare with avocado', 'Tartar de atún con aguacate'],
        ['Salmon sashimi platter', 'Tabla de sashimi de salmón'],
      ]),
      course('Sushi', 'Sushi', [
        ['Tuna nigiri', 'Nigiri de atún'],
        ['Salmon nigiri', 'Nigiri de salmón'],
        ['Spicy tuna roll', 'Roll de atún picante'],
        ['Dragon roll (eel + avocado)', 'Dragon roll (anguila + aguacate)'],
        ['Casa de Campo signature roll', 'Roll de la casa Casa de Campo'],
      ]),
      course('Hot', 'Caliente', [
        ['Miso-glazed black cod', 'Bacalao negro con miso'],
        ['Vegetable tempura', 'Tempura de vegetales'],
      ]),
      course('Sweet', 'Dulce', [
        ['Yuzu sorbet', 'Sorbete de yuzu'],
        ['Mochi assortment', 'Surtido de mochi'],
      ]),
    ],
  },

  // ------------------------------------------------------------------
  // BBQ
  // ------------------------------------------------------------------
  {
    slug: 'beachside-bbq',
    name_en: 'Beachside BBQ',
    name_es: 'BBQ en la Playa',
    description_en:
      'Grill master at the villa — ribs, chicken, sausages, all the sides. Casual, generous, perfect for a crowd.',
    description_es:
      'Parrillero en la villa — costillas, pollo, salchichas y todos los acompañamientos. Casual, abundante, ideal para un grupo grande.',
    mealType: 'bbq',
    cuisine: 'bbq',
    isFeatured: true,
    pricePerPerson: { amount: 75, currency: 'USD' },
    minGuests: 6,
    leadTimeHours: 24,
    courses: [
      course('From the grill', 'De la parrilla', [
        ['Slow-smoked baby back ribs', 'Costillas baby back ahumadas lentamente'],
        ['Grilled chicken with mojo', 'Pollo a la parrilla con mojo'],
        ['Hot dogs and bratwurst', 'Hot dogs y bratwurst'],
        ['Burgers with all the toppings', 'Hamburguesas con todos los acompañamientos'],
        ['Grilled corn on the cob', 'Maíz a la parrilla'],
      ]),
      course('Sides', 'Acompañantes', [
        ['Coleslaw', 'Ensalada de col'],
        ['Potato salad', 'Ensalada de papa'],
        ['Mac and cheese', 'Macarrones con queso'],
        ['Baked beans', 'Habichuelas al horno'],
      ]),
      course('Sweet', 'Dulce', [
        ['Watermelon platter', 'Tabla de sandía'],
        ['S\'mores station', 'Estación de s\'mores'],
      ]),
    ],
  },

  // ------------------------------------------------------------------
  // COCKTAIL HOUR
  // ------------------------------------------------------------------
  {
    slug: 'cocktail-canapes',
    name_en: 'Cocktail Hour & Canapés',
    name_es: 'Hora del Cóctel y Canapés',
    description_en:
      'Sunset spread on the terrace — passed canapés, a curated bar, room to mingle before dinner.',
    description_es:
      'Spread al atardecer en la terraza — canapés pasados, bar curado, espacio para socializar antes de la cena.',
    mealType: 'cocktail',
    cuisine: 'international',
    pricePerPerson: { amount: 60, currency: 'USD' },
    minGuests: 6,
    leadTimeHours: 24,
    courses: [
      course('Canapés', 'Canapés', [
        ['Tuna tartare on crispy wonton', 'Tartar de atún en wonton crujiente'],
        ['Beef carpaccio bites', 'Bocados de carpaccio de res'],
        ['Burrata crostini with truffle honey', 'Crostini de burrata con miel de trufa'],
        ['Coconut shrimp with mango chutney', 'Camarones de coco con chutney de mango'],
        ['Caprese skewers', 'Brochetas caprese'],
      ]),
      course('Bar', 'Bar', [
        ['Bartender + signature cocktail of your choice', 'Bartender + cóctel de la casa a tu elección'],
        ['Champagne, wine, and beer service', 'Servicio de champagne, vino y cerveza'],
      ]),
    ],
  },

  // ------------------------------------------------------------------
  // KIDS
  // ------------------------------------------------------------------
  {
    slug: 'kids-dinner',
    name_en: "Kids' Dinner",
    name_es: 'Cena para Niños',
    description_en:
      'Things kids actually eat — pizzas, chicken tenders, fries, ice cream. Served on a separate timing so adults can have their dinner in peace.',
    description_es:
      'Lo que los niños realmente comen — pizzas, deditos de pollo, papas fritas, helado. Servido en un horario aparte para que los adultos cenen tranquilos.',
    mealType: 'kids',
    cuisine: 'international',
    pricePerPerson: { amount: 35, currency: 'USD' },
    minGuests: 1,
    leadTimeHours: 12,
    courses: [
      course('Mains', 'Platos principales', [
        ['Mini margherita pizzas', 'Mini pizzas margherita'],
        ['Crispy chicken tenders', 'Deditos de pollo crujientes'],
        ['Mac and cheese', 'Macarrones con queso'],
      ]),
      course('Sides', 'Acompañantes', [
        ['Crinkle-cut fries', 'Papas fritas onduladas'],
        ['Carrot and cucumber sticks', 'Palitos de zanahoria y pepino'],
      ]),
      course('Sweet', 'Dulce', [
        ['Ice cream sundae bar', 'Barra de sundaes de helado'],
      ]),
    ],
  },

  // ------------------------------------------------------------------
  // DESSERT / SPECIAL
  // ------------------------------------------------------------------
  {
    slug: 'celebration-dessert-table',
    name_en: 'Celebration Dessert Table',
    name_es: 'Mesa de Postres para Celebraciones',
    description_en:
      'For birthdays, anniversaries, proposals — a curated dessert table with a custom cake at the centre.',
    description_es:
      'Para cumpleaños, aniversarios, propuestas — una mesa de postres curada con un pastel personalizado al centro.',
    mealType: 'dessert',
    cuisine: 'international',
    pricePerPerson: { amount: 40, currency: 'USD' },
    minGuests: 6,
    leadTimeHours: 72,
    courses: [
      course('Centerpiece', 'Pieza central', [
        ['Custom celebration cake (flavor of your choice)', 'Pastel personalizado (sabor a elegir)'],
      ]),
      course('Selection', 'Selección', [
        ['Macarons', 'Macarons'],
        ['Mini tiramisu cups', 'Mini copas de tiramisu'],
        ['Chocolate-dipped strawberries', 'Fresas con chocolate'],
        ['Tropical fruit pavlovas', 'Pavlovas de fruta tropical'],
        ['Dulce de leche profiteroles', 'Profiteroles de dulce de leche'],
      ]),
    ],
  },
]

async function run() {
  console.log(
    `Seeding ${MENUS.length} preset menus to dataset "${client.config().dataset}"…`
  )
  if (force) console.log('--force enabled: will overwrite existing menu docs')

  const existing = await client.fetch(
    `*[_type == "presetMenu" && defined(slug.current)]{ _id, "slug": slug.current }`
  )
  const existingBySlug = new Map(existing.map((s) => [s.slug, s._id]))

  let created = 0
  let updated = 0
  let skipped = 0

  // Per-meal-type ordering — first menu defined gets order 1 within
  // its category, etc. Lets us hand-curate the suggested order.
  const orderByMealType = new Map()

  for (const m of MENUS) {
    const order = (orderByMealType.get(m.mealType) ?? 0) + 1
    orderByMealType.set(m.mealType, order)

    const docId = `menu-${m.slug}`
    const doc = {
      _id: docId,
      _type: 'presetMenu',
      name_en: m.name_en,
      name_es: m.name_es,
      slug: { _type: 'slug', current: m.slug },
      description_en: m.description_en,
      description_es: m.description_es,
      mealType: m.mealType,
      cuisine: m.cuisine,
      courses: m.courses,
      isActive: true,
      isFeatured: !!m.isFeatured,
      order,
    }
    if (m.pricePerPerson) doc.pricePerPerson = m.pricePerPerson
    if (m.flatPrice) doc.flatPrice = m.flatPrice
    if (m.minGuests) doc.minGuests = m.minGuests
    if (m.maxGuests) doc.maxGuests = m.maxGuests
    if (m.leadTimeHours) doc.leadTimeHours = m.leadTimeHours
    if (m.allergenInfo_en) doc.allergenInfo_en = m.allergenInfo_en
    if (m.allergenInfo_es) doc.allergenInfo_es = m.allergenInfo_es

    const existingId = existingBySlug.get(m.slug)

    if (existingId && !force) {
      skipped++
      console.log(`  skip   ${m.mealType}/${m.slug}`)
      continue
    }

    if (existingId && force) {
      const patch = { ...doc }
      delete patch._id
      delete patch._type
      await client.patch(existingId).set(patch).commit()
      updated++
      console.log(`  update ${m.mealType}/${m.slug}`)
      continue
    }

    await client.createOrReplace(doc)
    created++
    console.log(`  create ${m.mealType}/${m.slug}`)
  }

  console.log(
    `\nDone. created=${created} updated=${updated} skipped=${skipped}`
  )
  console.log('Open Sanity Studio → Concierge → Preset Menus to add photos and pricing.')
}

run().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
