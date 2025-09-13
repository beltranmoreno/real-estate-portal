const { createClient } = require('@sanity/client')
require('dotenv').config({ path: '.env.local' })

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
  apiVersion: '2025-09-06'
})

const infoPages = [
  {
    _type: 'infoPage',
    title_en: 'Beaches of Casa de Campo',
    title_es: 'Playas de Casa de Campo',
    slug: { _type: 'slug', current: 'beaches' },
    intro_en: 'Discover the pristine beaches and crystal-clear waters that make Casa de Campo a Caribbean paradise. From secluded coves to vibrant beach clubs, explore the coastal beauty that defines our resort.',
    intro_es: 'Descubre las playas vírgenes y las aguas cristalinas que hacen de Casa de Campo un paraíso caribeño. Desde calas apartadas hasta vibrantes clubes de playa, explora la belleza costera que define nuestro resort.',
    content: [
      {
        _type: 'richText',
        _key: 'intro',
        title_en: 'Paradise Beaches at Your Doorstep',
        title_es: 'Playas Paradisíacas a Tu Puerta',
        content_en: [
          {
            _type: 'block',
            children: [
              {
                _type: 'span',
                text: 'Casa de Campo boasts some of the most beautiful beaches in the Dominican Republic. Our pristine stretches of white sand and turquoise waters offer the perfect backdrop for relaxation, water sports, and unforgettable memories.'
              }
            ]
          },
          {
            _type: 'block',
            children: [
              {
                _type: 'span',
                text: 'Minitas Beach, our main beach area, features calm waters perfect for swimming and snorkeling. The beach club offers luxurious amenities including beach service, water sports equipment rentals, and beachside dining.'
              }
            ]
          }
        ],
        content_es: [
          {
            _type: 'block',
            children: [
              {
                _type: 'span',
                text: 'Casa de Campo cuenta con algunas de las playas más hermosas de la República Dominicana. Nuestros tramos vírgenes de arena blanca y aguas turquesas ofrecen el telón de fondo perfecto para la relajación, deportes acuáticos y recuerdos inolvidables.'
              }
            ]
          }
        ]
      },
      {
        _type: 'ctaBanner',
        _key: 'cta',
        title_en: 'Book Your Beach Experience',
        title_es: 'Reserve Su Experiencia en la Playa',
        description_en: 'Reserve beach chairs, water sports equipment, and beachside dining to make the most of your beach day.',
        description_es: 'Reserve sillas de playa, equipo de deportes acuáticos y comida junto a la playa para aprovechar al máximo su día de playa.',
        primaryCta: {
          text_en: 'Reserve Beach Services',
          text_es: 'Reservar Servicios de Playa',
          url: '/contact'
        }
      }
    ],
    status: 'published',
    publishedAt: new Date().toISOString(),
    seo: {
      metaTitle_en: 'Beautiful Beaches | Casa de Campo Resort',
      metaTitle_es: 'Hermosas Playas | Casa de Campo Resort',
      metaDescription_en: 'Discover the stunning beaches of Casa de Campo with pristine white sand, crystal-clear waters, and world-class beach amenities.',
      metaDescription_es: 'Descubra las impresionantes playas de Casa de Campo con arena blanca prístina, aguas cristalinas y comodidades de playa de clase mundial.'
    }
  },
  {
    _type: 'infoPage',
    title_en: 'Nightlife & Entertainment',
    title_es: 'Vida Nocturna y Entretenimiento',
    slug: { _type: 'slug', current: 'nightlife' },
    intro_en: 'Experience the vibrant nightlife of Casa de Campo and La Romana. From sophisticated cocktail lounges to lively bars and cultural performances, discover entertainment options that cater to every taste.',
    intro_es: 'Experimente la vibrante vida nocturna de Casa de Campo y La Romana. Desde sofisticados salones de cócteles hasta bares animados y actuaciones culturales, descubra opciones de entretenimiento que satisfacen todos los gustos.',
    content: [
      {
        _type: 'richText',
        _key: 'venues',
        title_en: 'Premium Entertainment Venues',
        title_es: 'Lugares de Entretenimiento Premium',
        content_en: [
          {
            _type: 'block',
            children: [
              {
                _type: 'span',
                text: 'Casa de Campo offers sophisticated entertainment venues throughout the resort. Enjoy craft cocktails at our rooftop bars, dance the night away at our beachfront lounges, or experience live music performances in intimate settings.'
              }
            ]
          }
        ]
      },
      {
        _type: 'faq',
        _key: 'faq',
        title_en: 'Nightlife Information',
        title_es: 'Información de Vida Nocturna',
        questions: [
          {
            question_en: 'What are the operating hours for nightlife venues?',
            question_es: '¿Cuáles son los horarios de funcionamiento de los lugares de vida nocturna?',
            answer_en: [
              {
                _type: 'block',
                children: [
                  {
                    _type: 'span',
                    text: 'Most bars and lounges are open from 6 PM to 2 AM. Specific hours may vary by venue and season.'
                  }
                ]
              }
            ],
            answer_es: [
              {
                _type: 'block',
                children: [
                  {
                    _type: 'span',
                    text: 'La mayoría de bares y salones están abiertos de 6 PM a 2 AM. Los horarios específicos pueden variar según el lugar y la temporada.'
                  }
                ]
              }
            ]
          },
          {
            question_en: 'Is there live entertainment?',
            question_es: '¿Hay entretenimiento en vivo?',
            answer_en: [
              {
                _type: 'block',
                children: [
                  {
                    _type: 'span',
                    text: 'Yes, we feature live music, cultural performances, and special events throughout the week. Check with concierge for the current schedule.'
                  }
                ]
              }
            ],
            answer_es: [
              {
                _type: 'block',
                children: [
                  {
                    _type: 'span',
                    text: 'Sí, presentamos música en vivo, actuaciones culturales y eventos especiales durante toda la semana. Consulte con el conserje para el horario actual.'
                  }
                ]
              }
            ]
          }
        ]
      }
    ],
    status: 'published',
    publishedAt: new Date().toISOString(),
    seo: {
      metaTitle_en: 'Nightlife & Entertainment | Casa de Campo Resort',
      metaTitle_es: 'Vida Nocturna y Entretenimiento | Casa de Campo Resort',
      metaDescription_en: 'Experience vibrant nightlife at Casa de Campo with sophisticated bars, live entertainment, and cultural performances.',
      metaDescription_es: 'Experimente la vibrante vida nocturna en Casa de Campo con bares sofisticados, entretenimiento en vivo y actuaciones culturales.'
    }
  },
  {
    _type: 'infoPage',
    title_en: 'Local Tips & Recommendations',
    title_es: 'Consejos Locales y Recomendaciones',
    slug: { _type: 'slug', current: 'local-tips' },
    intro_en: 'Make the most of your stay with insider tips from our local experts. Discover hidden gems, cultural experiences, and practical advice to enhance your Casa de Campo adventure.',
    intro_es: 'Aproveche al máximo su estancia con consejos de expertos locales. Descubra gemas ocultas, experiencias culturales y consejos prácticos para mejorar su aventura en Casa de Campo.',
    content: [
      {
        _type: 'richText',
        _key: 'tips',
        title_en: 'Essential Local Knowledge',
        title_es: 'Conocimiento Local Esencial',
        content_en: [
          {
            _type: 'block',
            children: [
              {
                _type: 'span',
                text: 'Our local experts have compiled essential tips to help you navigate the Dominican culture and make the most of your Casa de Campo experience. From the best times to visit attractions to local customs and etiquette.'
              }
            ]
          }
        ]
      },
      {
        _type: 'faq',
        _key: 'local-faq',
        title_en: 'Frequently Asked Questions',
        title_es: 'Preguntas Frecuentes',
        questions: [
          {
            question_en: 'What currency should I bring?',
            question_es: '¿Qué moneda debo traer?',
            answer_en: [
              {
                _type: 'block',
                children: [
                  {
                    _type: 'span',
                    text: 'US Dollars are widely accepted throughout Casa de Campo and La Romana. Dominican Pesos are also used locally. Credit cards are accepted at most establishments.'
                  }
                ]
              }
            ],
            answer_es: [
              {
                _type: 'block',
                children: [
                  {
                    _type: 'span',
                    text: 'Los dólares estadounidenses son ampliamente aceptados en Casa de Campo y La Romana. Los pesos dominicanos también se usan localmente. Las tarjetas de crédito son aceptadas en la mayoría de establecimientos.'
                  }
                ]
              }
            ]
          },
          {
            question_en: 'What is the best way to get around?',
            question_es: '¿Cuál es la mejor manera de moverse?',
            answer_en: [
              {
                _type: 'block',
                children: [
                  {
                    _type: 'span',
                    text: 'Golf carts are the primary mode of transportation within Casa de Campo. We also provide shuttle services to key areas. For exploring La Romana, taxis and rental cars are available.'
                  }
                ]
              }
            ],
            answer_es: [
              {
                _type: 'block',
                children: [
                  {
                    _type: 'span',
                    text: 'Los carritos de golf son el principal medio de transporte dentro de Casa de Campo. También proporcionamos servicios de transporte a áreas clave. Para explorar La Romana, están disponibles taxis y autos de alquiler.'
                  }
                ]
              }
            ]
          }
        ]
      }
    ],
    status: 'published',
    publishedAt: new Date().toISOString(),
    seo: {
      metaTitle_en: 'Local Tips & Travel Guide | Casa de Campo Resort',
      metaTitle_es: 'Consejos Locales y Guía de Viaje | Casa de Campo Resort',
      metaDescription_en: 'Get insider tips and local recommendations to make the most of your Casa de Campo vacation with expert guidance.',
      metaDescription_es: 'Obtenga consejos de expertos y recomendaciones locales para aprovechar al máximo sus vacaciones en Casa de Campo con orientación experta.'
    }
  },
  {
    _type: 'infoPage',
    title_en: 'Excursions & Activities',
    title_es: 'Excursiones y Actividades',
    slug: { _type: 'slug', current: 'excursions' },
    intro_en: 'Explore the Dominican Republic with our curated selection of excursions and activities. From adventure tours to cultural experiences, discover the natural beauty and rich heritage of this Caribbean paradise.',
    intro_es: 'Explore la República Dominicana con nuestra selección curada de excursiones y actividades. Desde tours de aventura hasta experiencias culturales, descubra la belleza natural y el rico patrimonio de este paraíso caribeño.',
    content: [
      {
        _type: 'richText',
        _key: 'activities',
        title_en: 'Curated Experiences',
        title_es: 'Experiencias Curadas',
        content_en: [
          {
            _type: 'block',
            children: [
              {
                _type: 'span',
                text: 'Our excursion program offers carefully selected experiences that showcase the best of the Dominican Republic. Whether you seek adventure, culture, or relaxation, our expert guides will ensure unforgettable memories.'
              }
            ]
          }
        ]
      },
      {
        _type: 'ctaBanner',
        _key: 'booking',
        title_en: 'Book Your Adventure',
        title_es: 'Reserve Su Aventura',
        description_en: 'Contact our concierge team to book excursions and create your perfect itinerary.',
        description_es: 'Contacte a nuestro equipo de conserjería para reservar excursiones y crear su itinerario perfecto.',
        primaryCta: {
          text_en: 'Contact Concierge',
          text_es: 'Contactar Conserjería',
          url: '/contact'
        },
        secondaryCta: {
          text_en: 'View All Activities',
          text_es: 'Ver Todas las Actividades',
          url: '/activities'
        }
      }
    ],
    status: 'published',
    publishedAt: new Date().toISOString(),
    seo: {
      metaTitle_en: 'Excursions & Activities | Casa de Campo Resort',
      metaTitle_es: 'Excursiones y Actividades | Casa de Campo Resort',
      metaDescription_en: 'Discover amazing excursions and activities in the Dominican Republic with expert guides and curated experiences.',
      metaDescription_es: 'Descubra increíbles excursiones y actividades en la República Dominicana con guías expertos y experiencias curadas.'
    }
  },
  {
    _type: 'infoPage',
    title_en: 'Yacht Charters & Marina',
    title_es: 'Alquiler de Yates y Marina',
    slug: { _type: 'slug', current: 'yacht-charters' },
    intro_en: 'Experience luxury on the water with our yacht charter services and world-class marina facilities. Explore the Caribbean waters in style with premium vessels and professional crew.',
    intro_es: 'Experimente el lujo en el agua con nuestros servicios de alquiler de yates e instalaciones de marina de clase mundial. Explore las aguas del Caribe con estilo con embarcaciones premium y tripulación profesional.',
    content: [
      {
        _type: 'richText',
        _key: 'marina',
        title_en: 'World-Class Marina Facilities',
        title_es: 'Instalaciones de Marina de Clase Mundial',
        content_en: [
          {
            _type: 'block',
            children: [
              {
                _type: 'span',
                text: 'Casa de Campo Marina is a full-service marina offering premium berthing, fuel services, and maintenance facilities. Our marina can accommodate vessels up to 250 feet and provides 24-hour security and concierge services.'
              }
            ]
          }
        ]
      },
      {
        _type: 'faq',
        _key: 'yacht-faq',
        title_en: 'Charter Information',
        title_es: 'Información de Alquiler',
        questions: [
          {
            question_en: 'What types of yachts are available for charter?',
            question_es: '¿Qué tipos de yates están disponibles para alquiler?',
            answer_en: [
              {
                _type: 'block',
                children: [
                  {
                    _type: 'span',
                    text: 'We offer a range of luxury yachts from 40 to 150 feet, including motor yachts, sailing yachts, and catamarans. All vessels come with experienced crew and can be customized for your preferences.'
                  }
                ]
              }
            ],
            answer_es: [
              {
                _type: 'block',
                children: [
                  {
                    _type: 'span',
                    text: 'Ofrecemos una gama de yates de lujo de 40 a 150 pies, incluyendo yates a motor, yates de vela y catamaranes. Todas las embarcaciones vienen con tripulación experimentada y pueden personalizarse según sus preferencias.'
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        _type: 'ctaBanner',
        _key: 'charter-cta',
        title_en: 'Charter Your Perfect Yacht',
        title_es: 'Alquile Su Yate Perfecto',
        description_en: 'Contact our marina concierge to explore charter options and plan your perfect day on the water.',
        description_es: 'Contacte a nuestro conserje de marina para explorar opciones de alquiler y planificar su día perfecto en el agua.',
        primaryCta: {
          text_en: 'Charter Inquiry',
          text_es: 'Consulta de Alquiler',
          url: '/contact'
        }
      }
    ],
    status: 'published',
    publishedAt: new Date().toISOString(),
    seo: {
      metaTitle_en: 'Yacht Charters & Marina | Casa de Campo Resort',
      metaTitle_es: 'Alquiler de Yates y Marina | Casa de Campo Resort',
      metaDescription_en: 'Charter luxury yachts and enjoy world-class marina facilities at Casa de Campo with premium vessels and professional service.',
      metaDescription_es: 'Alquile yates de lujo y disfrute de instalaciones de marina de clase mundial en Casa de Campo con embarcaciones premium y servicio profesional.'
    }
  }
]

async function importInfoPages() {
  try {
    console.log('Starting info pages import...')
    
    // Delete existing info pages
    const existingPages = await client.fetch('*[_type == "infoPage"]._id')
    if (existingPages.length > 0) {
      console.log(`Deleting ${existingPages.length} existing info pages...`)
      await client.delete({ query: '*[_type == "infoPage"]' })
    }

    // Import new info pages
    console.log(`Importing ${infoPages.length} info pages...`)
    for (const page of infoPages) {
      const result = await client.create(page)
      console.log(`✓ Created info page: ${page.title_en} (${result._id})`)
    }

    console.log('✅ Info pages import completed successfully!')
    
  } catch (error) {
    console.error('❌ Import failed:', error)
    process.exit(1)
  }
}

// Run the import
importInfoPages()