const fs = require('fs')
const path = require('path')

// Sample data for generating realistic properties
const propertyTypes = ['villa', 'apartment', 'condo', 'townhouse', 'penthouse', 'studio', 'house']
const themes = ['luxury', 'beachfront', 'golf', 'family', 'romantic', 'business', 'adventure', 'wellness']
const areas = [
  { name: 'Casa de Campo', slug: 'casa-de-campo', region: 'La Romana' },
  { name: 'Punta Cana', slug: 'punta-cana', region: 'La Altagracia' },
  { name: 'La Romana', slug: 'la-romana', region: 'La Romana' },
  { name: 'Bavaro', slug: 'bavaro', region: 'La Altagracia' },
  { name: 'Cap Cana', slug: 'cap-cana', region: 'La Altagracia' },
  { name: 'Playa Dorada', slug: 'playa-dorada', region: 'Puerto Plata' },
  { name: 'Ocean World', slug: 'ocean-world', region: 'Puerto Plata' }
]

const propertyTitles = {
  villa: {
    en: ['Oceanfront Villa Paradise', 'Luxury Beachside Villa', 'Tropical Villa Retreat', 'Modern Villa Oasis', 'Elite Villa Estate'],
    es: ['Villa Paraíso Frente al Océano', 'Villa de Lujo Junto a la Playa', 'Retiro Villa Tropical', 'Oasis Villa Moderno', 'Villa Elite']
  },
  apartment: {
    en: ['Seaside Luxury Apartment', 'Modern City Apartment', 'Beachfront Apartment Suite', 'Premium Apartment Living', 'Contemporary Apartment'],
    es: ['Apartamento de Lujo Junto al Mar', 'Apartamento Moderno de Ciudad', 'Suite Apartamento Frente a la Playa', 'Vida Premium en Apartamento', 'Apartamento Contemporáneo']
  },
  condo: {
    en: ['Oceanview Luxury Condo', 'Beach Resort Condo', 'Premium Condo Living', 'Tropical Condo Paradise', 'Executive Condo Suite'],
    es: ['Condo de Lujo Vista al Océano', 'Condo Resort Playa', 'Vida Premium en Condo', 'Paraíso Condo Tropical', 'Suite Ejecutiva Condo']
  },
  townhouse: {
    en: ['Modern Townhouse Retreat', 'Beachside Townhouse', 'Luxury Townhouse Living', 'Contemporary Townhouse', 'Premium Townhouse Estate'],
    es: ['Retiro Casa Adosada Moderna', 'Casa Adosada Junto a la Playa', 'Vida de Lujo Casa Adosada', 'Casa Adosada Contemporánea', 'Urbanización Premium Casa Adosada']
  },
  penthouse: {
    en: ['Sky-High Penthouse Paradise', 'Luxury Penthouse Suite', 'Ocean Penthouse Living', 'Executive Penthouse Retreat', 'Premium Penthouse Estate'],
    es: ['Paraíso Penthouse en las Alturas', 'Suite Penthouse de Lujo', 'Vida Penthouse Océano', 'Retiro Penthouse Ejecutivo', 'Penthouse Premium']
  },
  studio: {
    en: ['Cozy Beach Studio', 'Modern Studio Apartment', 'Boutique Studio Living', 'Designer Studio Space', 'Premium Studio Suite'],
    es: ['Estudio Acogedor Playa', 'Estudio Apartamento Moderno', 'Vida Estudio Boutique', 'Espacio Estudio Diseñador', 'Suite Estudio Premium']
  },
  house: {
    en: ['Tropical Beach House', 'Modern Family House', 'Luxury Holiday House', 'Contemporary Beach House', 'Premium Vacation House'],
    es: ['Casa Tropical Playa', 'Casa Familiar Moderna', 'Casa Vacacional de Lujo', 'Casa Playa Contemporánea', 'Casa Vacacional Premium']
  }
}

const descriptions = {
  en: [
    "Experience the ultimate in luxury living with breathtaking ocean views, world-class amenities, and impeccable design. This stunning property offers the perfect blend of comfort and elegance.",
    "Discover your own slice of paradise in this beautifully appointed residence featuring modern amenities, stunning architecture, and prime location. Perfect for creating unforgettable memories.",
    "Indulge in luxury at this exceptional property boasting panoramic views, premium finishes, and resort-style amenities. An ideal retreat for discerning guests.",
    "Escape to this magnificent property where luxury meets comfort. Featuring state-of-the-art amenities, elegant interiors, and spectacular views of the Caribbean.",
    "Immerse yourself in the beauty of the Dominican Republic at this exquisite property. With its perfect location and luxury amenities, it's your gateway to paradise."
  ],
  es: [
    "Experimenta lo último en vida de lujo con vistas impresionantes al océano, amenidades de clase mundial y diseño impecable. Esta propiedad ofrece la mezcla perfecta de comodidad y elegancia.",
    "Descubre tu propio pedazo de paraíso en esta residencia bellamente decorada con amenidades modernas, arquitectura impresionante y ubicación privilegiada. Perfecta para crear recuerdos inolvidables.",
    "Déjate consentir con lujo en esta propiedad excepcional con vistas panorámicas, acabados premium y amenidades estilo resort. Un retiro ideal para huéspedes exigentes.",
    "Escápate a esta magnífica propiedad donde el lujo se encuentra con la comodidad. Con amenidades de vanguardia, interiores elegantes y vistas espectaculares del Caribe.",
    "Sumérgete en la belleza de República Dominicana en esta propiedad exquisita. Con su ubicación perfecta y amenidades de lujo, es tu puerta de entrada al paraíso."
  ]
}

// Fixed list of 10 Unsplash URLs - add your URLs here
const unsplashImageUrls = [
  'https://images.unsplash.com/photo-1516156008625-3a9d6067fab5?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8aG91c2VzfGVufDB8fDB8fHww', // Replace with actual Unsplash URL
  'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8dmlsbGFzfGVufDB8fDB8fHww', // Replace with actual Unsplash URL
  'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8dmlsbGFzfGVufDB8fDB8fHww', // Replace with actual Unsplash URL
  'https://images.unsplash.com/photo-1613977257365-aaae5a9817ff?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8dmlsbGFzfGVufDB8fDB8fHww', // Replace with actual Unsplash URL
  'https://images.unsplash.com/photo-1582610116397-edb318620f90?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8dmlsbGFzfGVufDB8fDB8fHww', // Replace with actual Unsplash URL
  'https://images.unsplash.com/photo-1723110994499-df46435aa4b3?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8dmlsbGFzfGVufDB8fDB8fHww', // Replace with actual Unsplash URL
  'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fHZpbGxhc3xlbnwwfHwwfHx8MA%3D%3D', // Replace with actual Unsplash URL
  'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fHZpbGxhc3xlbnwwfHwwfHx8MA%3D%3D', // Replace with actual Unsplash URL
  'https://images.unsplash.com/photo-1628870571248-4f5db428986c?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fHZpbGxhc3xlbnwwfHwwfHx8MA%3D%3D', // Replace with actual Unsplash URL
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjF8fHZpbGxhc3xlbnwwfHwwfHx8MA%3D%3D', // Replace with actual Unsplash URL
]

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function generatePropertyCode() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const numbers = '0123456789'
  let code = ''
  for (let i = 0; i < 2; i++) {
    code += letters[Math.floor(Math.random() * letters.length)]
  }
  for (let i = 0; i < 4; i++) {
    code += numbers[Math.floor(Math.random() * numbers.length)]
  }
  return code
}

function generateSlug(title, propertyCode) {
  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
  
  // Add property code to ensure uniqueness
  return `${baseSlug}-${propertyCode.toLowerCase()}`
}

function getRandomImageUrl() {
  // Pick a random URL from the list
  return getRandomElement(unsplashImageUrls)
}

function generateProperty(index) {
  const propertyType = getRandomElement(propertyTypes)
  const area = getRandomElement(areas)
  const selectedThemes = []
  
  // Add 1-3 themes
  const themeCount = getRandomNumber(1, 3)
  for (let i = 0; i < themeCount; i++) {
    const theme = getRandomElement(themes)
    if (!selectedThemes.includes(theme)) {
      selectedThemes.push(theme)
    }
  }

  const titleEn = getRandomElement(propertyTitles[propertyType].en)
  const titleEs = getRandomElement(propertyTitles[propertyType].es)
  
  const bedrooms = propertyType === 'studio' ? 0 : getRandomNumber(1, 8)
  const bathrooms = getRandomNumber(1, bedrooms + 2)
  const maxGuests = propertyType === 'studio' ? 2 : getRandomNumber(bedrooms * 2, bedrooms * 3)
  
  const listingType = getRandomElement(['rental', 'sale', 'both'])
  const nightlyRate = getRandomNumber(150, 2500)
  const salePrice = getRandomNumber(200000, 5000000)
  
  // Generate property code first (needed for unique slug)
  const propertyCode = generatePropertyCode()
  
  // Store image URLs to be uploaded during import
  const mainImageUrl = getRandomImageUrl()
  const galleryUrls = []
  const galleryCount = getRandomNumber(3, 8) // 3-8 gallery images
  for (let i = 0; i < galleryCount; i++) {
    galleryUrls.push(getRandomImageUrl())
  }

  return {
    _id: `property-${index + 1}`,
    _type: 'property',
    title_en: titleEn,
    title_es: titleEs,
    slug: {
      _type: 'slug',
      current: generateSlug(titleEn, propertyCode)
    },
    description_en: getRandomElement(descriptions.en),
    description_es: getRandomElement(descriptions.es),
    shortDescription_en: getRandomElement(descriptions.en).substring(0, 150) + '...',
    shortDescription_es: getRandomElement(descriptions.es).substring(0, 150) + '...',
    propertyCode: propertyCode,
    propertyType,
    themes: selectedThemes,
    status: 'active',
    isFeatured: Math.random() < 0.3, // 30% chance of being featured
    
    // Store URLs for import processing
    _mainImageUrl: mainImageUrl,
    _galleryUrls: galleryUrls,
    mainImage: null,
    gallery: [],
    
    location: {
      _type: 'location',
      area: {
        _type: 'reference',
        _ref: `area-${area.slug}`
      },
      address_en: `${getRandomNumber(100, 9999)} Ocean Drive, ${area.name}, ${area.region}`,
      address_es: `${getRandomNumber(100, 9999)} Avenida del Océano, ${area.name}, ${area.region}`,
      coordinates: {
        _type: 'geopoint',
        lat: getRandomNumber(180, 190) / 10, // Approximate DR coordinates
        lng: getRandomNumber(-710, -680) / 10
      },
      isBeachfront: selectedThemes.includes('beachfront') || Math.random() < 0.4,
      isGolfCourse: selectedThemes.includes('golf') || Math.random() < 0.2,
      distanceToBeach: getRandomNumber(0, 2000),
      distanceToAirport: getRandomNumber(5000, 50000),
      nearbyAttractions: [
        'Private Beach Access',
        'Golf Course',
        'Marina',
        'Shopping Center',
        'Restaurants'
      ].slice(0, getRandomNumber(2, 5))
    },
    
    amenities: {
      _type: 'amenities',
      bedrooms,
      bathrooms,
      maxGuests,
      
      // Premium Features
      hasPrivatePool: Math.random() < 0.7,
      hasHotTub: Math.random() < 0.5,
      hasPrivateBeach: selectedThemes.includes('beachfront') || Math.random() < 0.3,
      hasGolfCart: selectedThemes.includes('golf') || Math.random() < 0.4,
      hasGenerator: Math.random() < 0.6,
      hasStaff: Math.random() < 0.4,
      hasSecurity: Math.random() < 0.5,
      
      // Climate Control
      hasAirConditioning: true,
      hasCeilingFans: Math.random() < 0.8,
      hasHeating: Math.random() < 0.3,
      
      // Kitchen & Dining
      hasFullKitchen: Math.random() < 0.9,
      hasDishwasher: Math.random() < 0.7,
      hasMicrowave: Math.random() < 0.9,
      hasRefrigerator: Math.random() < 0.95,
      hasCoffeeMaker: Math.random() < 0.9,
      
      // Entertainment
      hasWifi: true,
      hasCableTV: Math.random() < 0.8,
      hasStreamingServices: Math.random() < 0.7,
      hasSoundSystem: Math.random() < 0.6,
      hasGameRoom: Math.random() < 0.3,
      
      // Outdoor
      hasBeachAccess: selectedThemes.includes('beachfront') || Math.random() < 0.6,
      hasPool: Math.random() < 0.8,
      hasBarbecue: Math.random() < 0.7,
      hasOutdoorDining: Math.random() < 0.8,
      hasGarden: Math.random() < 0.5
    },
    
    pricing: {
      _type: 'pricing',
      type: listingType,
      rentalPricing: {
        _type: 'rentalPricing',
        nightlyRate: {
          amount: nightlyRate,
          currency: 'USD'
        },
        minimumNights: getRandomNumber(2, 7),
        cleaningFee: {
          amount: getRandomNumber(50, 200),
          currency: 'USD'
        },
        securityDeposit: {
          amount: getRandomNumber(200, 1000),
          currency: 'USD'
        }
      },
      salePricing: listingType !== 'rental' ? {
        _type: 'salePricing',
        salePrice: {
          amount: salePrice,
          currency: 'USD'
        },
        pricePerSqft: {
          amount: Math.round(salePrice / getRandomNumber(1500, 8000)),
          currency: 'USD'
        }
      } : undefined
    },
    
    availability: {
      _type: 'availability',
      isAvailable: Math.random() < 0.8,
      instantBooking: Math.random() < 0.5,
      checkInTime: '15:00',
      checkOutTime: '11:00',
      advanceBookingDays: getRandomNumber(1, 365)
    },
    
    houseRules: {
      _type: 'houseRules',
      smokingAllowed: Math.random() < 0.2,
      petsAllowed: Math.random() < 0.3,
      eventsAllowed: Math.random() < 0.4,
      childrenAllowed: Math.random() < 0.9,
      quietHours: {
        start: '22:00',
        end: '08:00'
      }
    },
    
    contactInfo: {
      _type: 'contactInfo',
      primaryContact: {
        name: 'Property Manager',
        email: 'manager@example.com',
        phone: '+1-809-555-' + getRandomNumber(1000, 9999)
      }
    },
    
    seo: {
      _type: 'seo',
      metaTitle_en: `${titleEn} - Luxury Vacation Rental in ${area.name}`,
      metaTitle_es: `${titleEs} - Alquiler de Lujo en ${area.name}`,
      metaDescription_en: `Book this stunning ${propertyType} in ${area.name}. ${getRandomElement(descriptions.en).substring(0, 120)}...`,
      metaDescription_es: `Reserva este impresionante ${propertyType} en ${area.name}. ${getRandomElement(descriptions.es).substring(0, 120)}...`
    },
    
    _createdAt: new Date(Date.now() - getRandomNumber(0, 365) * 24 * 60 * 60 * 1000).toISOString(),
    _updatedAt: new Date().toISOString()
  }
}

// Generate properties
const numberOfProperties = 50
const properties = []

console.log(`🏠 Generating ${numberOfProperties} test properties...`)

for (let i = 0; i < numberOfProperties; i++) {
  properties.push(generateProperty(i))
  if ((i + 1) % 10 === 0) {
    console.log(`✅ Generated ${i + 1}/${numberOfProperties} properties`)
  }
}

// Also generate area documents
const areaDocuments = areas.map(area => ({
  _id: `area-${area.slug}`,
  _type: 'area',
  title_en: area.name,
  title_es: area.name,
  slug: {
    _type: 'slug',
    current: area.slug
  },
  region: area.region,
  description_en: `Discover the beauty of ${area.name}, one of the most sought-after destinations in the Dominican Republic.`,
  description_es: `Descubre la belleza de ${area.name}, uno de los destinos más buscados en República Dominicana.`,
  _createdAt: new Date().toISOString(),
  _updatedAt: new Date().toISOString()
}))

// Create output directory
const outputDir = path.join(__dirname, 'test-data')
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

// Write properties to file
fs.writeFileSync(
  path.join(outputDir, 'properties.json'),
  JSON.stringify(properties, null, 2)
)

// Write areas to file
fs.writeFileSync(
  path.join(outputDir, 'areas.json'),
  JSON.stringify(areaDocuments, null, 2)
)

// Create a summary file
const summary = {
  totalProperties: properties.length,
  totalAreas: areaDocuments.length,
  propertyTypes: [...new Set(properties.map(p => p.propertyType))],
  themes: [...new Set(properties.flatMap(p => p.themes))],
  areas: areas.map(a => a.name),
  listingTypes: [...new Set(properties.map(p => p.pricing.type))],
  priceRange: {
    rental: {
      min: Math.min(...properties.filter(p => p.pricing.rentalPricing).map(p => p.pricing.rentalPricing.nightlyRate.amount)),
      max: Math.max(...properties.filter(p => p.pricing.rentalPricing).map(p => p.pricing.rentalPricing.nightlyRate.amount))
    },
    sale: {
      min: Math.min(...properties.filter(p => p.pricing.salePricing).map(p => p.pricing.salePricing.salePrice.amount)),
      max: Math.max(...properties.filter(p => p.pricing.salePricing).map(p => p.pricing.salePricing.salePrice.amount))
    }
  },
  featuredProperties: properties.filter(p => p.isFeatured).length,
  generatedAt: new Date().toISOString()
}

fs.writeFileSync(
  path.join(outputDir, 'summary.json'),
  JSON.stringify(summary, null, 2)
)

console.log('\n🎉 Test data generation complete!')
console.log(`📁 Files created in: ${outputDir}`)
console.log(`📊 Properties: ${properties.length}`)
console.log(`📍 Areas: ${areaDocuments.length}`)
console.log(`🌟 Featured properties: ${summary.featuredProperties}`)
console.log(`💰 Price range (rental): $${summary.priceRange.rental.min} - $${summary.priceRange.rental.max} per night`)
console.log(`🏠 Price range (sale): $${summary.priceRange.sale.min.toLocaleString()} - $${summary.priceRange.sale.max.toLocaleString()}`)
console.log('\n📝 Next steps:')
console.log('1. Import areas.json to your Sanity dataset first')
console.log('2. Then import properties.json to your Sanity dataset')
console.log('3. Update image references in Sanity Studio as needed')
console.log('\nNote: Images are using Unsplash source URLs and will load dynamically')