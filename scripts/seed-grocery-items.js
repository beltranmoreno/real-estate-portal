/**
 * Seed default grocery / drinks / household items into Sanity.
 *
 * Usage:
 *   yarn seed-groceries          # creates missing, leaves existing alone
 *   yarn seed-groceries --force  # overwrites existing item docs
 *
 * The catalog skews toward what's commonly requested at Casa de Campo —
 * tropical produce, Dominican beer & rum, household basics. Editors can
 * add/remove items in Sanity Studio after seeding.
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

// Shorthand: [slug, en, es, category, defaultUnit, brand, isPopular]
// `null` for unused fields. `popular: true` shows up in the renter
// "Popular" tab — keep this list curated to ~15-20 items max.
const ITEMS = [
  // ---- Fresh produce ----
  ['mango', 'Mango', 'Mango', 'produce', 'each', null, true],
  ['pineapple', 'Pineapple', 'Piña', 'produce', 'each', null, true],
  ['papaya', 'Papaya', 'Papaya', 'produce', 'each', null, false],
  ['watermelon', 'Watermelon', 'Sandía', 'produce', 'each', null, false],
  ['banana', 'Bananas', 'Guineos', 'produce', 'bunch', null, true],
  ['plantain', 'Plantains', 'Plátanos', 'produce', 'each', null, false],
  ['avocado', 'Avocados', 'Aguacates', 'produce', 'each', null, true],
  ['lime', 'Limes', 'Limones', 'produce', 'each', null, true],
  ['lemon', 'Lemons', 'Limones amarillos', 'produce', 'each', null, false],
  ['orange', 'Oranges', 'Naranjas', 'produce', 'each', null, false],
  ['strawberries', 'Strawberries', 'Fresas', 'produce', 'pack', null, false],
  ['blueberries', 'Blueberries', 'Arándanos', 'produce', 'pack', null, false],
  ['coconut-young', 'Young coconut', 'Coco verde', 'produce', 'each', null, false],
  ['tomato', 'Tomatoes', 'Tomates', 'produce', 'lb', null, true],
  ['onion-yellow', 'Yellow onions', 'Cebollas amarillas', 'produce', 'each', null, true],
  ['onion-red', 'Red onions', 'Cebollas moradas', 'produce', 'each', null, false],
  ['garlic', 'Garlic', 'Ajo', 'produce', 'each', null, false],
  ['bell-pepper', 'Bell peppers', 'Pimientos', 'produce', 'each', null, false],
  ['cucumber', 'Cucumber', 'Pepino', 'produce', 'each', null, false],
  ['lettuce', 'Lettuce', 'Lechuga', 'produce', 'each', null, false],
  ['cilantro', 'Cilantro', 'Cilantro', 'produce', 'bunch', null, false],
  ['mint', 'Mint', 'Hierbabuena', 'produce', 'bunch', null, false],
  ['basil', 'Basil', 'Albahaca', 'produce', 'bunch', null, false],
  ['ginger', 'Ginger', 'Jengibre', 'produce', 'each', null, false],

  // ---- Dairy & eggs ----
  ['milk-whole', 'Whole milk', 'Leche entera', 'dairy', 'gallon', null, true],
  ['milk-skim', 'Skim milk', 'Leche descremada', 'dairy', 'gallon', null, false],
  ['eggs-large', 'Large eggs', 'Huevos grandes', 'dairy', 'dozen', null, true],
  ['butter', 'Butter', 'Mantequilla', 'dairy', 'pack', null, true],
  ['greek-yogurt', 'Greek yogurt', 'Yogur griego', 'dairy', 'each', 'Chobani', false],
  ['cheddar', 'Cheddar cheese', 'Queso cheddar', 'dairy', 'pack', null, false],
  ['mozzarella', 'Fresh mozzarella', 'Mozzarella fresca', 'dairy', 'pack', null, false],
  ['parmesan', 'Parmesan', 'Parmesano', 'dairy', 'pack', null, false],
  ['cream-cheese', 'Cream cheese', 'Queso crema', 'dairy', 'pack', null, false],
  ['heavy-cream', 'Heavy cream', 'Crema de leche', 'dairy', 'each', null, false],

  // ---- Meat & poultry ----
  ['chicken-breast', 'Chicken breast', 'Pechuga de pollo', 'meat', 'lb', null, true],
  ['chicken-whole', 'Whole chicken', 'Pollo entero', 'meat', 'each', null, false],
  ['beef-tenderloin', 'Beef tenderloin', 'Solomillo de res', 'meat', 'lb', null, false],
  ['ground-beef', 'Ground beef', 'Carne molida', 'meat', 'lb', null, true],
  ['pork-chops', 'Pork chops', 'Chuletas de cerdo', 'meat', 'lb', null, false],
  ['bacon', 'Bacon', 'Tocineta', 'meat', 'pack', null, true],
  ['sausage-italian', 'Italian sausage', 'Salchicha italiana', 'meat', 'pack', null, false],

  // ---- Seafood ----
  ['shrimp', 'Shrimp', 'Camarones', 'seafood', 'lb', null, true],
  ['lobster', 'Lobster', 'Langosta', 'seafood', 'each', null, false],
  ['mahi-mahi', 'Mahi-mahi (dorado)', 'Dorado', 'seafood', 'lb', null, false],
  ['tuna-steak', 'Tuna steak', 'Atún', 'seafood', 'lb', null, false],
  ['salmon', 'Salmon', 'Salmón', 'seafood', 'lb', null, false],

  // ---- Bakery ----
  ['bread-sourdough', 'Sourdough loaf', 'Pan de masa madre', 'bakery', 'each', null, false],
  ['bread-sliced', 'Sliced bread', 'Pan de molde', 'bakery', 'each', null, true],
  ['croissants', 'Croissants', 'Croissants', 'bakery', 'pack', null, true],
  ['bagels', 'Bagels', 'Bagels', 'bakery', 'pack', null, false],
  ['tortillas-flour', 'Flour tortillas', 'Tortillas de harina', 'bakery', 'pack', null, false],

  // ---- Pantry & dry goods ----
  ['rice-white', 'White rice', 'Arroz blanco', 'pantry', 'lb', null, true],
  ['rice-brown', 'Brown rice', 'Arroz integral', 'pantry', 'lb', null, false],
  ['pasta', 'Pasta', 'Pasta', 'pantry', 'pack', null, true],
  ['olive-oil', 'Olive oil', 'Aceite de oliva', 'pantry', 'bottle', null, true],
  ['salt', 'Salt', 'Sal', 'pantry', 'each', null, false],
  ['black-pepper', 'Black pepper', 'Pimienta negra', 'pantry', 'each', null, false],
  ['sugar', 'Sugar', 'Azúcar', 'pantry', 'pack', null, false],
  ['coffee-beans', 'Coffee (whole bean)', 'Café en grano', 'pantry', 'pack', null, true],
  ['coffee-ground', 'Coffee (ground)', 'Café molido', 'pantry', 'pack', null, false],
  ['tea-bags', 'Tea bags', 'Té en bolsa', 'pantry', 'box', null, false],
  ['cereal', 'Cereal', 'Cereal', 'pantry', 'box', null, false],
  ['granola', 'Granola', 'Granola', 'pantry', 'pack', null, false],
  ['honey', 'Honey', 'Miel', 'pantry', 'bottle', null, false],
  ['black-beans', 'Black beans', 'Habichuelas negras', 'pantry', 'pack', null, false],
  ['red-beans', 'Red beans', 'Habichuelas rojas', 'pantry', 'pack', null, false],
  ['pasta-sauce', 'Pasta sauce', 'Salsa para pasta', 'pantry', 'each', null, false],

  // ---- Frozen ----
  ['ice-cream-vanilla', 'Vanilla ice cream', 'Helado de vainilla', 'frozen', 'each', null, false],
  ['ice', 'Ice', 'Hielo', 'frozen', 'bag', null, true],
  ['frozen-berries', 'Frozen berries', 'Bayas congeladas', 'frozen', 'pack', null, false],

  // ---- Snacks & sweets ----
  ['potato-chips', 'Potato chips', 'Papitas', 'snacks', 'bag', null, false],
  ['tortilla-chips', 'Tortilla chips', 'Totopos', 'snacks', 'bag', null, false],
  ['salsa', 'Salsa', 'Salsa', 'snacks', 'each', null, false],
  ['guacamole', 'Guacamole', 'Guacamole', 'snacks', 'each', null, false],
  ['hummus', 'Hummus', 'Hummus', 'snacks', 'each', null, false],
  ['almonds', 'Almonds', 'Almendras', 'snacks', 'pack', null, false],
  ['dark-chocolate', 'Dark chocolate', 'Chocolate negro', 'snacks', 'each', null, false],

  // ---- Non-alcoholic drinks ----
  ['water-still', 'Still water (large)', 'Agua sin gas (grande)', 'beverages_nonalcoholic', 'each', 'Crystal', true],
  ['water-sparkling', 'Sparkling water', 'Agua con gas', 'beverages_nonalcoholic', 'bottle', 'San Pellegrino', true],
  ['perrier', 'Perrier', 'Perrier', 'beverages_nonalcoholic', 'bottle', 'Perrier', false],
  ['coca-cola', 'Coca-Cola', 'Coca-Cola', 'beverages_nonalcoholic', 'pack', null, true],
  ['diet-coke', 'Diet Coke', 'Coca-Cola Light', 'beverages_nonalcoholic', 'pack', null, false],
  ['sprite', 'Sprite', 'Sprite', 'beverages_nonalcoholic', 'pack', null, false],
  ['orange-juice', 'Orange juice', 'Jugo de naranja', 'beverages_nonalcoholic', 'each', null, true],
  ['apple-juice', 'Apple juice', 'Jugo de manzana', 'beverages_nonalcoholic', 'each', null, false],
  ['coconut-water', 'Coconut water', 'Agua de coco', 'beverages_nonalcoholic', 'each', null, true],
  ['cranberry-juice', 'Cranberry juice', 'Jugo de arándano', 'beverages_nonalcoholic', 'each', null, false],
  ['tonic-water', 'Tonic water', 'Agua tónica', 'beverages_nonalcoholic', 'pack', null, false],
  ['club-soda', 'Club soda', 'Soda', 'beverages_nonalcoholic', 'pack', null, false],
  ['ginger-ale', 'Ginger ale', 'Ginger ale', 'beverages_nonalcoholic', 'pack', null, false],

  // ---- Beer ----
  ['presidente', 'Presidente', 'Presidente', 'beer', 'case', 'Presidente', true],
  ['presidente-light', 'Presidente Light', 'Presidente Light', 'beer', 'case', 'Presidente', false],
  ['bohemia', 'Bohemia', 'Bohemia', 'beer', 'case', 'Bohemia', false],
  ['modelo', 'Modelo Especial', 'Modelo Especial', 'beer', 'case', 'Modelo', false],
  ['corona', 'Corona', 'Corona', 'beer', 'case', 'Corona', false],
  ['heineken', 'Heineken', 'Heineken', 'beer', 'case', 'Heineken', false],

  // ---- Wine ----
  ['sauvignon-blanc', 'Sauvignon Blanc', 'Sauvignon Blanc', 'wine', 'bottle', null, true],
  ['chardonnay', 'Chardonnay', 'Chardonnay', 'wine', 'bottle', null, false],
  ['rose', 'Rosé (Provence)', 'Rosé (Provenza)', 'wine', 'bottle', null, true],
  ['malbec', 'Malbec', 'Malbec', 'wine', 'bottle', null, false],
  ['cabernet', 'Cabernet Sauvignon', 'Cabernet Sauvignon', 'wine', 'bottle', null, false],
  ['pinot-noir', 'Pinot Noir', 'Pinot Noir', 'wine', 'bottle', null, false],
  ['champagne-veuve', 'Veuve Clicquot', 'Veuve Clicquot', 'wine', 'bottle', 'Veuve Clicquot', true],
  ['champagne-dom', 'Dom Pérignon', 'Dom Pérignon', 'wine', 'bottle', 'Dom Pérignon', false],
  ['prosecco', 'Prosecco', 'Prosecco', 'wine', 'bottle', null, false],

  // ---- Spirits ----
  ['brugal-anejo', 'Brugal Añejo', 'Brugal Añejo', 'spirits', 'bottle', 'Brugal', true],
  ['brugal-1888', 'Brugal 1888', 'Brugal 1888', 'spirits', 'bottle', 'Brugal', true],
  ['barcelo-imperial', 'Barceló Imperial', 'Barceló Imperial', 'spirits', 'bottle', 'Barceló', false],
  ['bacardi', 'Bacardí Superior', 'Bacardí Superior', 'spirits', 'bottle', 'Bacardí', false],
  ['don-julio-blanco', 'Don Julio Blanco', 'Don Julio Blanco', 'spirits', 'bottle', 'Don Julio', false],
  ['casamigos-reposado', 'Casamigos Reposado', 'Casamigos Reposado', 'spirits', 'bottle', 'Casamigos', true],
  ['grey-goose', 'Grey Goose', 'Grey Goose', 'spirits', 'bottle', 'Grey Goose', false],
  ['titos', "Tito's", "Tito's", 'spirits', 'bottle', "Tito's", false],
  ['tanqueray', 'Tanqueray', 'Tanqueray', 'spirits', 'bottle', 'Tanqueray', false],
  ['hendricks', "Hendrick's", "Hendrick's", 'spirits', 'bottle', "Hendrick's", false],
  ['bombay-sapphire', 'Bombay Sapphire', 'Bombay Sapphire', 'spirits', 'bottle', 'Bombay Sapphire', false],
  ['jack-daniels', "Jack Daniel's", "Jack Daniel's", 'spirits', 'bottle', "Jack Daniel's", false],
  ['makers-mark', "Maker's Mark", "Maker's Mark", 'spirits', 'bottle', "Maker's Mark", false],
  ['aperol', 'Aperol', 'Aperol', 'spirits', 'bottle', 'Aperol', false],
  ['campari', 'Campari', 'Campari', 'spirits', 'bottle', 'Campari', false],

  // ---- Mixers & bar ----
  ['lime-juice', 'Lime juice', 'Jugo de limón', 'mixers', 'bottle', null, false],
  ['simple-syrup', 'Simple syrup', 'Jarabe de azúcar', 'mixers', 'bottle', null, false],
  ['bitters', 'Angostura bitters', 'Amargo de Angostura', 'mixers', 'bottle', 'Angostura', false],
  ['olives', 'Cocktail olives', 'Aceitunas para cóctel', 'mixers', 'each', null, false],
  ['cocktail-cherries', 'Cocktail cherries', 'Cerezas marrasquino', 'mixers', 'each', null, false],

  // ---- Household & cleaning ----
  ['toilet-paper', 'Toilet paper', 'Papel higiénico', 'household', 'pack', null, true],
  ['paper-towels', 'Paper towels', 'Toallas de papel', 'household', 'pack', null, true],
  ['trash-bags', 'Trash bags', 'Bolsas de basura', 'household', 'pack', null, false],
  ['dish-soap', 'Dish soap', 'Jabón de platos', 'household', 'each', null, false],
  ['laundry-detergent', 'Laundry detergent', 'Detergente para ropa', 'household', 'each', null, false],
  ['aluminum-foil', 'Aluminum foil', 'Papel aluminio', 'household', 'each', null, false],
  ['plastic-wrap', 'Plastic wrap', 'Plástico de envolver', 'household', 'each', null, false],
  ['ziplock-bags', 'Ziplock bags', 'Bolsas Ziploc', 'household', 'pack', null, false],

  // ---- Personal care ----
  ['sunscreen', 'Sunscreen (SPF 50)', 'Protector solar (SPF 50)', 'personal_care', 'each', null, true],
  ['after-sun', 'Aloe / after-sun gel', 'Gel de aloe / después del sol', 'personal_care', 'each', null, false],
  ['bug-spray', 'Bug spray', 'Repelente de insectos', 'personal_care', 'each', null, true],
  ['shampoo', 'Shampoo', 'Champú', 'personal_care', 'each', null, false],
  ['conditioner', 'Conditioner', 'Acondicionador', 'personal_care', 'each', null, false],
  ['body-wash', 'Body wash', 'Gel de baño', 'personal_care', 'each', null, false],
  ['toothpaste', 'Toothpaste', 'Pasta dental', 'personal_care', 'each', null, false],
  ['deodorant', 'Deodorant', 'Desodorante', 'personal_care', 'each', null, false],
  ['razors', 'Razors', 'Rasuradoras', 'personal_care', 'pack', null, false],
  ['feminine-products', 'Feminine hygiene', 'Higiene femenina', 'personal_care', 'pack', null, false],

  // ---- Baby ----
  ['diapers-newborn', 'Diapers (Newborn)', 'Pañales (recién nacido)', 'baby', 'pack', null, false],
  ['diapers-size3', 'Diapers (size 3)', 'Pañales (talla 3)', 'baby', 'pack', null, false],
  ['diapers-size4', 'Diapers (size 4)', 'Pañales (talla 4)', 'baby', 'pack', null, false],
  ['baby-wipes', 'Baby wipes', 'Toallitas húmedas', 'baby', 'pack', null, false],
  ['baby-formula', 'Baby formula', 'Fórmula de bebé', 'baby', 'each', null, false],
  ['baby-food', 'Baby food', 'Comida de bebé', 'baby', 'each', null, false],

  // ---- Pet ----
  ['dog-food', 'Dog food', 'Comida para perros', 'pet', 'bag', null, false],
  ['cat-food', 'Cat food', 'Comida para gatos', 'pet', 'bag', null, false],
  ['pet-treats', 'Pet treats', 'Premios para mascotas', 'pet', 'pack', null, false],
]

async function run() {
  console.log(
    `Seeding ${ITEMS.length} grocery items to dataset "${client.config().dataset}"…`
  )
  if (force) console.log('--force enabled: will overwrite existing item docs')

  const existing = await client.fetch(
    `*[_type == "groceryItem" && defined(slug.current)]{ _id, "slug": slug.current }`
  )
  const existingBySlug = new Map(existing.map((s) => [s.slug, s._id]))

  let created = 0
  let updated = 0
  let skipped = 0

  // Track per-category order so items within a category are listed in
  // the order they appear above.
  const orderByCategory = new Map()

  for (const tuple of ITEMS) {
    const [slug, name_en, name_es, category, defaultUnit, brand, isPopular] = tuple
    const order = (orderByCategory.get(category) ?? 0) + 1
    orderByCategory.set(category, order)

    const docId = `grocery-${slug}`
    const doc = {
      _id: docId,
      _type: 'groceryItem',
      name_en,
      name_es,
      slug: { _type: 'slug', current: slug },
      category,
      isActive: true,
      order,
    }
    if (defaultUnit) doc.defaultUnit = defaultUnit
    if (brand) doc.brand = brand
    if (isPopular) doc.isPopular = true

    const existingId = existingBySlug.get(slug)

    if (existingId && !force) {
      skipped++
      continue
    }

    if (existingId && force) {
      const patch = { ...doc }
      delete patch._id
      delete patch._type
      await client.patch(existingId).set(patch).commit()
      updated++
      console.log(`  update ${category}/${slug}`)
      continue
    }

    await client.createOrReplace(doc)
    created++
    console.log(`  create ${category}/${slug}`)
  }

  console.log(
    `\nDone. created=${created} updated=${updated} skipped=${skipped}`
  )
  console.log('Open Sanity Studio → Concierge → Grocery & Drinks to edit.')
}

run().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
