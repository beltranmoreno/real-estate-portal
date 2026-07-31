/**
 * Seed classic à-la-carte plates into Sanity, plus a few "classic" menus
 * composed from those plates (via presetMenu.plates references).
 *
 * Usage:
 *   yarn seed-plates          # creates missing, leaves existing alone
 *   yarn seed-plates --force  # overwrites existing plate + menu docs
 *
 * Plates are the reusable building blocks: a dish authored once, referenced
 * by any number of menus and offered à-la-carte so guests can mix-and-match
 * their own menu. Editors can add photos, tweak dietary tags, or build new
 * menus from these plates in Studio.
 *
 * Deterministic ids (`plate-<slug>` / `menu-<slug>`) make this idempotent and
 * let the menus reference plates by id without a lookup round-trip.
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

// ---------------------------------------------------------------------------
// Plates — the reusable dishes. `[en, es]` pairs keep the bilingual copy
// side-by-side.
// ---------------------------------------------------------------------------
const PLATES = [
  // --- Starters -----------------------------------------------------------
  {
    slug: 'burrata-heirloom-tomatoes',
    courseType: 'starter',
    name: ['Burrata with heirloom tomatoes', 'Burrata con tomates heirloom'],
    description: [
      'Creamy burrata, heirloom tomatoes, basil, and aged balsamic.',
      'Burrata cremosa, tomates heirloom, albahaca y balsámico añejado.',
    ],
    cuisine: 'italian',
    dietaryOptions: ['vegetarian', 'gluten_free'],
    allergen: ['Contains dairy.', 'Contiene lácteos.'],
    price: 18,
  },
  {
    slug: 'shrimp-ceviche',
    courseType: 'starter',
    name: ['Shrimp ceviche', 'Ceviche de camarones'],
    description: [
      'Lime-cured shrimp with avocado, red onion, and cilantro.',
      'Camarones curados en limón con aguacate, cebolla morada y cilantro.',
    ],
    cuisine: 'caribbean',
    dietaryOptions: ['gluten_free', 'dairy_free'],
    allergen: ['Contains shellfish.', 'Contiene mariscos.'],
    price: 20,
  },
  {
    slug: 'tuna-tartare',
    courseType: 'starter',
    name: ['Tuna tartare', 'Tartar de atún'],
    description: [
      'Hand-cut tuna, avocado, sesame, and soy-citrus dressing.',
      'Atún cortado a mano, aguacate, ajonjolí y aderezo de soya y cítricos.',
    ],
    cuisine: 'japanese',
    dietaryOptions: ['dairy_free'],
    allergen: ['Contains raw fish, soy, sesame.', 'Contiene pescado crudo, soya, ajonjolí.'],
    price: 22,
  },
  // --- Salads -------------------------------------------------------------
  {
    slug: 'caesar-salad',
    courseType: 'salad',
    name: ['Caesar salad', 'Ensalada César'],
    description: [
      'Crisp romaine, parmesan, croutons, and classic Caesar dressing.',
      'Lechuga romana crujiente, parmesano, croutones y aderezo César clásico.',
    ],
    cuisine: 'international',
    dietaryOptions: ['vegetarian'],
    allergen: ['Contains gluten, dairy, egg, fish (anchovy).', 'Contiene gluten, lácteos, huevo, pescado (anchoa).'],
    price: 14,
  },
  {
    slug: 'garden-salad',
    courseType: 'salad',
    name: ['Garden salad', 'Ensalada de la huerta'],
    description: [
      'Mixed greens, cucumber, cherry tomato, and citrus vinaigrette.',
      'Mezcla de verdes, pepino, tomate cherry y vinagreta cítrica.',
    ],
    cuisine: 'international',
    dietaryOptions: ['vegan', 'gluten_free', 'dairy_free', 'nut_free'],
    price: 12,
  },
  // --- Soups --------------------------------------------------------------
  {
    slug: 'pumpkin-soup',
    courseType: 'soup',
    name: ['Roasted pumpkin soup', 'Crema de auyama asada'],
    description: [
      'Silky roasted pumpkin soup with a touch of coconut and ginger.',
      'Crema sedosa de auyama asada con un toque de coco y jengibre.',
    ],
    cuisine: 'international',
    dietaryOptions: ['vegan', 'gluten_free', 'dairy_free'],
    price: 12,
  },
  // --- Mains --------------------------------------------------------------
  {
    slug: 'filet-mignon',
    courseType: 'main',
    name: ['Grilled filet mignon', 'Filete miñón a la parrilla'],
    description: [
      'Center-cut filet, red wine reduction, seasonal garnish.',
      'Corte central de filete, reducción de vino tinto y guarnición de temporada.',
    ],
    cuisine: 'international',
    dietaryOptions: ['gluten_free'],
    price: 48,
  },
  {
    slug: 'grilled-branzino',
    courseType: 'main',
    name: ['Whole grilled branzino', 'Branzino entero a la parrilla'],
    description: [
      'Mediterranean sea bass grilled whole with lemon and herbs.',
      'Lubina mediterránea a la parrilla entera con limón y hierbas.',
    ],
    cuisine: 'mediterranean',
    dietaryOptions: ['gluten_free', 'dairy_free'],
    allergen: ['Contains fish.', 'Contiene pescado.'],
    price: 42,
  },
  {
    slug: 'roast-chicken',
    courseType: 'main',
    name: ['Herb roast chicken', 'Pollo asado a las hierbas'],
    description: [
      'Free-range chicken roasted with garlic, lemon, and rosemary.',
      'Pollo de campo asado con ajo, limón y romero.',
    ],
    cuisine: 'international',
    dietaryOptions: ['gluten_free', 'dairy_free'],
    price: 34,
  },
  {
    slug: 'truffle-tagliatelle',
    courseType: 'main',
    name: ['Truffle tagliatelle', 'Tagliatelle a la trufa'],
    description: [
      'Handmade tagliatelle tossed in white truffle butter and parmesan.',
      'Tagliatelle hecho a mano en mantequilla de trufa blanca y parmesano.',
    ],
    cuisine: 'italian',
    dietaryOptions: ['vegetarian'],
    allergen: ['Contains gluten, dairy, egg.', 'Contiene gluten, lácteos, huevo.'],
    price: 30,
  },
  {
    slug: 'mahi-tacos',
    courseType: 'main',
    name: ['Grilled mahi-mahi tacos', 'Tacos de dorado a la parrilla'],
    description: [
      'Grilled mahi-mahi, mango salsa, cabbage slaw, corn tortillas.',
      'Dorado a la parrilla, salsa de mango, ensalada de repollo, tortillas de maíz.',
    ],
    cuisine: 'caribbean',
    dietaryOptions: ['dairy_free'],
    allergen: ['Contains fish.', 'Contiene pescado.'],
    price: 28,
  },
  {
    slug: 'mushroom-risotto',
    courseType: 'main',
    name: ['Wild mushroom risotto', 'Risotto de hongos silvestres'],
    description: [
      'Carnaroli rice slow-cooked with wild mushrooms and parmesan.',
      'Arroz carnaroli cocido lentamente con hongos silvestres y parmesano.',
    ],
    cuisine: 'italian',
    dietaryOptions: ['vegetarian', 'gluten_free'],
    allergen: ['Contains dairy.', 'Contiene lácteos.'],
    price: 26,
  },
  // --- Sides --------------------------------------------------------------
  {
    slug: 'garlic-mashed-potatoes',
    courseType: 'side',
    name: ['Garlic mashed potatoes', 'Puré de papa al ajo'],
    description: [
      'Buttery mashed potatoes with roasted garlic.',
      'Puré de papa mantecoso con ajo asado.',
    ],
    dietaryOptions: ['vegetarian', 'gluten_free'],
    allergen: ['Contains dairy.', 'Contiene lácteos.'],
    price: 9,
  },
  {
    slug: 'roasted-vegetables',
    courseType: 'side',
    name: ['Roasted seasonal vegetables', 'Vegetales de temporada asados'],
    description: [
      'Market vegetables roasted with olive oil and herbs.',
      'Vegetales del mercado asados con aceite de oliva y hierbas.',
    ],
    dietaryOptions: ['vegan', 'gluten_free', 'dairy_free', 'nut_free'],
    price: 9,
  },
  {
    slug: 'coconut-rice',
    courseType: 'side',
    name: ['Coconut rice', 'Arroz con coco'],
    description: [
      'Fragrant rice simmered in coconut milk.',
      'Arroz aromático cocido en leche de coco.',
    ],
    cuisine: 'caribbean',
    dietaryOptions: ['vegan', 'gluten_free', 'dairy_free'],
    price: 8,
  },
  {
    slug: 'tostones',
    courseType: 'side',
    name: ['Tostones with garlic mojo', 'Tostones con mojo de ajo'],
    description: [
      'Twice-fried green plantains with garlic dipping sauce.',
      'Plátano verde frito dos veces con salsa de ajo.',
    ],
    cuisine: 'dominican',
    dietaryOptions: ['vegan', 'gluten_free', 'dairy_free'],
    price: 7,
  },
  // --- Desserts -----------------------------------------------------------
  {
    slug: 'tiramisu',
    courseType: 'dessert',
    name: ['Classic tiramisu', 'Tiramisu clásico'],
    description: [
      'Espresso-soaked ladyfingers layered with mascarpone cream.',
      'Bizcochos empapados en espresso con crema de mascarpone.',
    ],
    cuisine: 'italian',
    dietaryOptions: ['vegetarian'],
    allergen: ['Contains gluten, dairy, egg.', 'Contiene gluten, lácteos, huevo.'],
    price: 12,
  },
  {
    slug: 'coconut-flan',
    courseType: 'dessert',
    name: ['Coconut flan', 'Flan de coco'],
    description: [
      'Silky coconut custard with caramel.',
      'Flan sedoso de coco con caramelo.',
    ],
    cuisine: 'caribbean',
    dietaryOptions: ['vegetarian', 'gluten_free'],
    allergen: ['Contains dairy, egg.', 'Contiene lácteos, huevo.'],
    price: 10,
  },
  {
    slug: 'chocolate-fondant',
    courseType: 'dessert',
    name: ['Chocolate fondant', 'Fondant de chocolate'],
    description: [
      'Warm molten-centre chocolate cake with vanilla ice cream.',
      'Pastel de chocolate con centro fundido y helado de vainilla.',
    ],
    cuisine: 'french',
    dietaryOptions: ['vegetarian'],
    allergen: ['Contains gluten, dairy, egg.', 'Contiene gluten, lácteos, huevo.'],
    price: 12,
  },
  {
    slug: 'tropical-fruit-plate',
    courseType: 'dessert',
    name: ['Tropical fruit plate', 'Plato de fruta tropical'],
    description: [
      'Fresh mango, papaya, pineapple, and passion fruit.',
      'Mango, papaya, piña y maracuyá frescos.',
    ],
    cuisine: 'caribbean',
    dietaryOptions: ['vegan', 'gluten_free', 'dairy_free', 'nut_free'],
    price: 8,
  },
]

// ---------------------------------------------------------------------------
// Menus composed from the plates above. `plates` lists plate slugs; the
// script turns them into references. These sit alongside the free-form
// course menus from seed-preset-menus.js.
// ---------------------------------------------------------------------------
const MENUS = [
  {
    slug: 'classic-three-course-dinner',
    name: ['Classic Three-Course Dinner', 'Cena Clásica de Tres Tiempos'],
    description: [
      'A timeless plated dinner — starter, main with sides, and dessert.',
      'Una cena emplatada atemporal — entrada, principal con acompañantes y postre.',
    ],
    mealType: 'dinner',
    cuisine: 'international',
    isFeatured: true,
    price: 95,
    minGuests: 2,
    leadTimeHours: 48,
    plates: [
      'burrata-heirloom-tomatoes',
      'filet-mignon',
      'garlic-mashed-potatoes',
      'roasted-vegetables',
      'chocolate-fondant',
    ],
  },
  {
    slug: 'mediterranean-dinner',
    name: ['Mediterranean Dinner', 'Cena Mediterránea'],
    description: [
      'Light and coastal — fresh fish, bright vegetables, a simple sweet finish.',
      'Ligera y costera — pescado fresco, vegetales vibrantes y un final dulce sencillo.',
    ],
    mealType: 'dinner',
    cuisine: 'mediterranean',
    price: 90,
    minGuests: 2,
    leadTimeHours: 48,
    plates: [
      'garden-salad',
      'grilled-branzino',
      'coconut-rice',
      'roasted-vegetables',
      'tropical-fruit-plate',
    ],
  },
  {
    slug: 'vegetarian-tasting',
    name: ['Vegetarian Tasting', 'Degustación Vegetariana'],
    description: [
      'A satisfying meat-free menu built around seasonal produce.',
      'Un menú sin carne y satisfactorio en torno a productos de temporada.',
    ],
    mealType: 'dinner',
    cuisine: 'vegetarian',
    price: 75,
    minGuests: 2,
    leadTimeHours: 48,
    plates: [
      'garden-salad',
      'pumpkin-soup',
      'mushroom-risotto',
      'roasted-vegetables',
      'coconut-flan',
    ],
  },
  {
    slug: 'caribbean-lunch',
    name: ['Caribbean Lunch', 'Almuerzo Caribeño'],
    description: [
      'Bright island flavors, easy to eat between dips in the pool.',
      'Sabores isleños vibrantes, fáciles de comer entre chapuzones en la piscina.',
    ],
    mealType: 'lunch',
    cuisine: 'caribbean',
    isFeatured: true,
    price: 60,
    minGuests: 2,
    leadTimeHours: 24,
    plates: ['shrimp-ceviche', 'mahi-tacos', 'tostones', 'coconut-flan'],
  },
]

function plateDoc(p, order) {
  const doc = {
    _id: `plate-${p.slug}`,
    _type: 'presetPlate',
    name_en: p.name[0],
    name_es: p.name[1],
    slug: { _type: 'slug', current: p.slug },
    courseType: p.courseType,
    isActive: true,
    order,
  }
  if (p.description) {
    doc.description_en = p.description[0]
    doc.description_es = p.description[1]
  }
  if (p.mealType) doc.mealType = p.mealType
  if (p.cuisine) doc.cuisine = p.cuisine
  if (p.dietaryOptions) doc.dietaryOptions = p.dietaryOptions
  if (p.allergen) {
    doc.allergenInfo_en = p.allergen[0]
    doc.allergenInfo_es = p.allergen[1]
  }
  if (typeof p.price === 'number') {
    doc.pricePerPerson = { amount: p.price, currency: 'USD' }
  }
  return doc
}

function menuDoc(m, order) {
  const doc = {
    _id: `menu-${m.slug}`,
    _type: 'presetMenu',
    name_en: m.name[0],
    name_es: m.name[1],
    slug: { _type: 'slug', current: m.slug },
    description_en: m.description[0],
    description_es: m.description[1],
    mealType: m.mealType,
    cuisine: m.cuisine,
    isActive: true,
    isFeatured: !!m.isFeatured,
    order,
    plates: m.plates.map((slug) => ({
      _type: 'reference',
      _ref: `plate-${slug}`,
      _key: `p-${slug}`,
    })),
  }
  if (typeof m.price === 'number') {
    doc.pricePerPerson = { amount: m.price, currency: 'USD' }
  }
  if (m.minGuests) doc.minGuests = m.minGuests
  if (m.maxGuests) doc.maxGuests = m.maxGuests
  if (m.leadTimeHours) doc.leadTimeHours = m.leadTimeHours
  return doc
}

async function upsert(docs, typeLabel, existingBySlug) {
  let created = 0
  let updated = 0
  let skipped = 0
  for (const { doc, slug } of docs) {
    const existingId = existingBySlug.get(slug)
    if (existingId && !force) {
      skipped++
      console.log(`  skip   ${typeLabel}/${slug}`)
      continue
    }
    if (existingId && force && existingId !== doc._id) {
      // A pre-existing doc with a different id owns this slug — patch it in
      // place so we don't create a duplicate slug.
      const patch = { ...doc }
      delete patch._id
      delete patch._type
      delete patch.slug
      await client.patch(existingId).set(patch).commit()
      updated++
      console.log(`  update ${typeLabel}/${slug} (existing id)`)
      continue
    }
    await client.createOrReplace(doc)
    if (existingId) {
      updated++
      console.log(`  update ${typeLabel}/${slug}`)
    } else {
      created++
      console.log(`  create ${typeLabel}/${slug}`)
    }
  }
  return { created, updated, skipped }
}

async function run() {
  const dataset = client.config().dataset
  console.log(
    `Seeding ${PLATES.length} plates + ${MENUS.length} plate-based menus to dataset "${dataset}"…`
  )
  if (force) console.log('--force enabled: will overwrite existing docs')

  // --- Plates ---
  const existingPlates = await client.fetch(
    `*[_type == "presetPlate" && defined(slug.current)]{ _id, "slug": slug.current }`
  )
  const platesBySlug = new Map(existingPlates.map((p) => [p.slug, p._id]))

  // Order per course type — first plate defined in a course gets order 1.
  const orderByCourse = new Map()
  const plateDocs = PLATES.map((p) => {
    const order = (orderByCourse.get(p.courseType) ?? 0) + 1
    orderByCourse.set(p.courseType, order)
    return { doc: plateDoc(p, order), slug: p.slug }
  })

  console.log('\nPlates:')
  const pRes = await upsert(plateDocs, 'plate', platesBySlug)

  // --- Menus (reference the plates just created) ---
  const existingMenus = await client.fetch(
    `*[_type == "presetMenu" && defined(slug.current)]{ _id, "slug": slug.current }`
  )
  const menusBySlug = new Map(existingMenus.map((m) => [m.slug, m._id]))

  const orderByMeal = new Map()
  const menuDocs = MENUS.map((m) => {
    // Start plate-based menus at order 50 so they sort after the free-form
    // seed menus within a meal type (which use 1..n).
    const order = 50 + (orderByMeal.get(m.mealType) ?? 0) + 1
    orderByMeal.set(m.mealType, (orderByMeal.get(m.mealType) ?? 0) + 1)
    return { doc: menuDoc(m, order), slug: m.slug }
  })

  console.log('\nMenus:')
  const mRes = await upsert(menuDocs, 'menu', menusBySlug)

  console.log(
    `\nDone.\n  plates: created=${pRes.created} updated=${pRes.updated} skipped=${pRes.skipped}` +
      `\n  menus:  created=${mRes.created} updated=${mRes.updated} skipped=${mRes.skipped}`
  )
  console.log(
    '\nOpen Sanity Studio → Plate / Dish and Preset Menu to add photos and fine-tune pricing.' +
      '\nThen attach them to a property (Available chef menus / Available à-la-carte plates) or to a booking in the admin.'
  )
}

run().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
