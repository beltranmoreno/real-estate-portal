const { createClient } = require('@sanity/client')
const dotenv = require('dotenv')

dotenv.config({ path: '.env.local' })

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_WRITE_TOKEN,
  apiVersion: '2025-09-06',
  useCdn: false
})

// Casa de Campo Golf Courses Data
const golfCourses = [
  {
    _type: 'golfCourse',
    name_en: 'Teeth of the Dog',
    name_es: 'Dientes de Perro',
    slug: {
      _type: 'slug',
      current: 'teeth-of-the-dog'
    },
    location: {
      address_en: 'Casa de Campo Resort, La Romana, Dominican Republic',
      address_es: 'Casa de Campo Resort, La Romana, República Dominicana',
      coordinates: {
        lat: 18.4116,
        lng: -68.9117
      }
    },
    courseDetails: {
      holes: 18,
      par: 72,
      difficulty: 'professional',
      yardage: 7471,
      designer: 'Pete Dye'
    },
    summary_en: "Ranked #1 in the Caribbean and #39 in the world, Teeth of the Dog is Pete Dye's masterpiece with 7 holes directly on the Caribbean Sea.",
    summary_es: "Clasificado #1 en el Caribe y #39 en el mundo, Dientes de Perro es la obra maestra de Pete Dye con 7 hoyos directamente sobre el Mar Caribe.",
    highlights_en: [
      '7 oceanfront holes with dramatic sea views',
      'Consistently ranked #1 golf course in the Caribbean',
      'Host to PGA Tour events and celebrity tournaments',
      'Signature hole #5 with tee shot over the ocean',
      'Challenging coral-studded rough and ocean breezes',
      'Impeccable year-round playing conditions'
    ],
    highlights_es: [
      '7 hoyos frente al mar con vistas dramáticas',
      'Constantemente clasificado como el campo #1 del Caribe',
      'Anfitrión de eventos del PGA Tour y torneos de celebridades',
      'Hoyo emblemático #5 con tiro de salida sobre el océano',
      'Desafiante rough con coral y brisas oceánicas',
      'Condiciones de juego impecables todo el año'
    ],
    description_en: [
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: 'Teeth of the Dog is quite simply one of the best golf courses in the world. This Pete Dye masterpiece features seven holes that skirt the Caribbean Sea, with coral reefs and ocean waves creating a spectacular and challenging backdrop. The course has hosted numerous professional tournaments and continues to be ranked as the #1 course in the Caribbean by Golf Magazine.'
          }
        ]
      },
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: 'The name "Teeth of the Dog" comes from the coral rock formations that line the shore, resembling sharp teeth. These natural obstacles, combined with strategically placed bunkers and the ever-present ocean breeze, create a challenging yet fair test of golf that rewards precision and course management.'
          }
        ]
      }
    ],
    description_es: [
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: 'Dientes de Perro es simplemente uno de los mejores campos de golf del mundo. Esta obra maestra de Pete Dye cuenta con siete hoyos que bordean el Mar Caribe, con arrecifes de coral y olas del océano creando un telón de fondo espectacular y desafiante. El campo ha sido sede de numerosos torneos profesionales y continúa siendo clasificado como el campo #1 en el Caribe por Golf Magazine.'
          }
        ]
      }
    ],
    pricing: {
      greenFees: [
        {
          category_en: 'Resort Guest - Morning',
          category_es: 'Huésped del Resort - Mañana',
          price: 395,
          currency: 'USD'
        },
        {
          category_en: 'Resort Guest - Afternoon',
          category_es: 'Huésped del Resort - Tarde',
          price: 275,
          currency: 'USD'
        },
        {
          category_en: 'External Guest - Morning',
          category_es: 'Huésped Externo - Mañana',
          price: 495,
          currency: 'USD'
        }
      ]
    },
    amenities: [
      {
        name_en: 'Pro Shop',
        name_es: 'Tienda Pro',
        icon: '🏪'
      },
      {
        name_en: 'Practice Range',
        name_es: 'Campo de Práctica',
        icon: '⛳'
      },
      {
        name_en: 'Golf Carts',
        name_es: 'Carritos de Golf',
        icon: '🏌️'
      },
      {
        name_en: 'Caddie Service',
        name_es: 'Servicio de Caddie',
        icon: '👤'
      },
      {
        name_en: 'Club Rental',
        name_es: 'Alquiler de Palos',
        icon: '🏌️‍♂️'
      },
      {
        name_en: 'Restaurant',
        name_es: 'Restaurante',
        icon: '🍽️'
      }
    ],
    contact: {
      phone: '+1 809-523-8115',
      email: 'golf@casadecampo.com.do',
      website: 'https://www.casadecampo.com.do/golf',
      bookingUrl: 'https://www.casadecampo.com.do/golf/tee-times'
    },
    seo: {
      metaTitle_en: 'Teeth of the Dog Golf Course | #1 Caribbean Golf | Casa de Campo',
      metaTitle_es: 'Campo de Golf Dientes de Perro | #1 Golf del Caribe | Casa de Campo',
      metaDescription_en: 'Play the #1 ranked golf course in the Caribbean. Teeth of the Dog at Casa de Campo features 7 oceanfront holes designed by Pete Dye.',
      metaDescription_es: 'Juega en el campo de golf #1 del Caribe. Dientes de Perro en Casa de Campo cuenta con 7 hoyos frente al mar diseñados por Pete Dye.',
      keywords_en: ['Teeth of the Dog', 'Pete Dye golf course', 'Caribbean golf', 'oceanfront golf', 'Casa de Campo golf'],
      keywords_es: ['Dientes de Perro', 'campo de golf Pete Dye', 'golf Caribe', 'golf frente al mar', 'golf Casa de Campo']
    },
    status: 'published',
    featured: true,
    order: 1
  },
  {
    _type: 'golfCourse',
    name_en: 'Dye Fore',
    name_es: 'Dye Fore',
    slug: {
      _type: 'slug',
      current: 'dye-fore'
    },
    location: {
      address_en: 'Casa de Campo Resort, Altos de Chavón, La Romana',
      address_es: 'Casa de Campo Resort, Altos de Chavón, La Romana',
      coordinates: {
        lat: 18.4251,
        lng: -68.8892
      }
    },
    courseDetails: {
      holes: 27,
      par: 72,
      difficulty: 'advanced',
      yardage: 7770,
      designer: 'Pete Dye'
    },
    summary_en: "27 championship holes with breathtaking views of the Chavón River, Caribbean Sea, and Dominican mountains. Features the famous cliff-side holes.",
    summary_es: "27 hoyos de campeonato con vistas impresionantes del Río Chavón, Mar Caribe y montañas dominicanas. Cuenta con los famosos hoyos al borde del acantilado.",
    highlights_en: [
      'Spectacular 300-foot elevation changes',
      'Views of Chavón River and Caribbean Sea',
      '27 holes - Marina, Chavón, and Lagos nines',
      'Cliff-side holes overlooking the river canyon',
      'Most scenic inland course in the Caribbean',
      'Hosted Latin America Amateur Championship'
    ],
    highlights_es: [
      'Espectaculares cambios de elevación de 300 pies',
      'Vistas del Río Chavón y Mar Caribe',
      '27 hoyos - Marina, Chavón y Lagos',
      'Hoyos al borde del acantilado sobre el cañón del río',
      'El campo interior más escénico del Caribe',
      'Sede del Campeonato Amateur de América Latina'
    ],
    pricing: {
      greenFees: [
        {
          category_en: 'Resort Guest',
          category_es: 'Huésped del Resort',
          price: 295,
          currency: 'USD'
        },
        {
          category_en: 'External Guest',
          category_es: 'Huésped Externo',
          price: 395,
          currency: 'USD'
        }
      ]
    },
    contact: {
      phone: '+1 809-523-8115',
      email: 'golf@casadecampo.com.do',
      website: 'https://www.casadecampo.com.do/golf',
      bookingUrl: 'https://www.casadecampo.com.do/golf/tee-times'
    },
    status: 'published',
    featured: true,
    order: 2
  },
  {
    _type: 'golfCourse',
    name_en: 'The Links',
    name_es: 'The Links',
    slug: {
      _type: 'slug',
      current: 'the-links'
    },
    location: {
      address_en: 'Casa de Campo Resort, La Romana, Dominican Republic',
      address_es: 'Casa de Campo Resort, La Romana, República Dominicana',
      coordinates: {
        lat: 18.4186,
        lng: -68.9052
      }
    },
    courseDetails: {
      holes: 18,
      par: 71,
      difficulty: 'intermediate',
      yardage: 6891,
      designer: 'Pete Dye'
    },
    summary_en: "An inland course featuring rolling fairways and Pete Dye's signature design elements, perfect for players of all skill levels.",
    summary_es: "Un campo interior con calles ondulantes y los elementos de diseño característicos de Pete Dye, perfecto para jugadores de todos los niveles.",
    highlights_en: [
      'Inland links-style layout',
      'Five lagoon water features',
      'Strategic bunkering throughout',
      'Wide fairways suitable for all levels',
      'Less wind than oceanfront courses',
      'Excellent practice facilities'
    ],
    highlights_es: [
      'Diseño estilo links interior',
      'Cinco lagunas de agua',
      'Bunkers estratégicos en todo el campo',
      'Calles amplias adecuadas para todos los niveles',
      'Menos viento que los campos frente al mar',
      'Excelentes instalaciones de práctica'
    ],
    pricing: {
      greenFees: [
        {
          category_en: 'Resort Guest',
          category_es: 'Huésped del Resort',
          price: 195,
          currency: 'USD'
        },
        {
          category_en: 'External Guest',
          category_es: 'Huésped Externo',
          price: 250,
          currency: 'USD'
        }
      ]
    },
    contact: {
      phone: '+1 809-523-8115',
      email: 'golf@casadecampo.com.do',
      website: 'https://www.casadecampo.com.do/golf',
      bookingUrl: 'https://www.casadecampo.com.do/golf/tee-times'
    },
    status: 'published',
    featured: false,
    order: 3
  }
]

// Casa de Campo Restaurants Data
const restaurants = [
  {
    _type: 'restaurant',
    name_en: 'La Casita',
    name_es: 'La Casita',
    slug: {
      _type: 'slug',
      current: 'la-casita'
    },
    area: 'marina',
    cuisine: ['spanish', 'seafood', 'mediterranean'],
    vibes: ['fine-dining', 'romantic', 'scenic', 'luxury'],
    summary_en: 'Elegant Spanish seafood restaurant at the Marina with stunning sunset views and fresh catch of the day.',
    summary_es: 'Elegante restaurante español de mariscos en la Marina con impresionantes vistas del atardecer y pesca fresca del día.',
    highlights_en: [
      'Fresh seafood flown in daily',
      'Extensive Spanish wine collection',
      'Signature paella and tapas',
      'Marina and sunset views',
      'Live flamenco on weekends'
    ],
    highlights_es: [
      'Mariscos frescos traídos diariamente',
      'Extensa colección de vinos españoles',
      'Paella y tapas emblemáticas',
      'Vistas a la Marina y atardeceres',
      'Flamenco en vivo los fines de semana'
    ],
    description_en: [
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: 'La Casita brings the flavors of coastal Spain to Casa de Campo Marina. With its prime waterfront location, the restaurant offers an unforgettable dining experience featuring the freshest seafood, authentic Spanish cuisine, and breathtaking sunset views over the marina.'
          }
        ]
      }
    ],
    description_es: [
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: 'La Casita trae los sabores de la costa española a Casa de Campo Marina. Con su ubicación privilegiada frente al agua, el restaurante ofrece una experiencia gastronómica inolvidable con los mariscos más frescos, auténtica cocina española y vistas impresionantes del atardecer sobre la marina.'
          }
        ]
      }
    ],
    hours: {
      schedule: [
        {
          day_en: 'Monday',
          day_es: 'Lunes',
          closed: true
        },
        {
          day_en: 'Tuesday',
          day_es: 'Martes',
          openTime: '6:00 PM',
          closeTime: '11:00 PM',
          closed: false
        },
        {
          day_en: 'Wednesday',
          day_es: 'Miércoles',
          openTime: '6:00 PM',
          closeTime: '11:00 PM',
          closed: false
        },
        {
          day_en: 'Thursday',
          day_es: 'Jueves',
          openTime: '6:00 PM',
          closeTime: '11:00 PM',
          closed: false
        },
        {
          day_en: 'Friday',
          day_es: 'Viernes',
          openTime: '6:00 PM',
          closeTime: '12:00 AM',
          closed: false
        },
        {
          day_en: 'Saturday',
          day_es: 'Sábado',
          openTime: '6:00 PM',
          closeTime: '12:00 AM',
          closed: false
        },
        {
          day_en: 'Sunday',
          day_es: 'Domingo',
          openTime: '12:00 PM',
          closeTime: '11:00 PM',
          closed: false
        }
      ]
    },
    contact: {
      phone: '+1 809-523-2222',
      email: 'lacasita@casadecampo.com.do',
      reservationUrl: 'https://www.casadecampo.com.do/dining/reservations',
      address_en: 'Casa de Campo Marina, La Romana',
      address_es: 'Casa de Campo Marina, La Romana',
      coordinates: {
        lat: 18.3742,
        lng: -68.9086
      }
    },
    pricing: {
      priceRange: '$$$',
      averagePrice: 75,
      currency: 'USD'
    },
    features: [
      {
        feature_en: 'Waterfront Dining',
        feature_es: 'Comedor Frente al Mar',
        icon: '🌊'
      },
      {
        feature_en: 'Wine Cellar',
        feature_es: 'Cava de Vinos',
        icon: '🍷'
      },
      {
        feature_en: 'Private Dining',
        feature_es: 'Comedor Privado',
        icon: '🏠'
      },
      {
        feature_en: 'Live Music',
        feature_es: 'Música en Vivo',
        icon: '🎵'
      }
    ],
    status: 'published',
    featured: true,
    order: 1
  },
  {
    _type: 'restaurant',
    name_en: 'Beach Club by Le Cirque',
    name_es: 'Beach Club by Le Cirque',
    slug: {
      _type: 'slug',
      current: 'beach-club-le-cirque'
    },
    area: 'beach-club',
    cuisine: ['mediterranean', 'italian', 'seafood'],
    vibes: ['beachfront', 'casual', 'scenic', 'family'],
    summary_en: 'Beachfront dining by the renowned Le Cirque, offering Mediterranean cuisine with Caribbean flair.',
    summary_es: 'Comedor frente a la playa del renombrado Le Cirque, ofreciendo cocina mediterránea con toque caribeño.',
    highlights_en: [
      'Beachfront location on Minitas Beach',
      'Casual lunch and elegant dinner service',
      'Wood-fired pizzas and fresh pasta',
      'Signature cocktails and frozen drinks',
      'Kids menu available'
    ],
    highlights_es: [
      'Ubicación frente a la playa en Playa Minitas',
      'Almuerzo casual y servicio de cena elegante',
      'Pizzas al horno de leña y pasta fresca',
      'Cócteles emblemáticos y bebidas frozen',
      'Menú para niños disponible'
    ],
    hours: {
      schedule: [
        {
          day_en: 'Monday',
          day_es: 'Lunes',
          openTime: '11:00 AM',
          closeTime: '10:00 PM',
          closed: false
        },
        {
          day_en: 'Tuesday',
          day_es: 'Martes',
          openTime: '11:00 AM',
          closeTime: '10:00 PM',
          closed: false
        },
        {
          day_en: 'Wednesday',
          day_es: 'Miércoles',
          openTime: '11:00 AM',
          closeTime: '10:00 PM',
          closed: false
        },
        {
          day_en: 'Thursday',
          day_es: 'Jueves',
          openTime: '11:00 AM',
          closeTime: '10:00 PM',
          closed: false
        },
        {
          day_en: 'Friday',
          day_es: 'Viernes',
          openTime: '11:00 AM',
          closeTime: '11:00 PM',
          closed: false
        },
        {
          day_en: 'Saturday',
          day_es: 'Sábado',
          openTime: '11:00 AM',
          closeTime: '11:00 PM',
          closed: false
        },
        {
          day_en: 'Sunday',
          day_es: 'Domingo',
          openTime: '11:00 AM',
          closeTime: '10:00 PM',
          closed: false
        }
      ]
    },
    contact: {
      phone: '+1 809-523-3333',
      address_en: 'Minitas Beach, Casa de Campo',
      address_es: 'Playa Minitas, Casa de Campo',
      coordinates: {
        lat: 18.4147,
        lng: -68.9167
      }
    },
    pricing: {
      priceRange: '$$',
      averagePrice: 45,
      currency: 'USD'
    },
    status: 'published',
    featured: true,
    order: 2
  },
  {
    _type: 'restaurant',
    name_en: 'La Piazzetta',
    name_es: 'La Piazzetta',
    slug: {
      _type: 'slug',
      current: 'la-piazzetta'
    },
    area: 'altos-de-chavon',
    cuisine: ['italian', 'mediterranean'],
    vibes: ['romantic', 'scenic', 'fine-dining', 'luxury'],
    summary_en: 'Romantic Italian dining in the medieval village of Altos de Chavón with spectacular views of the Chavón River.',
    summary_es: 'Cena italiana romántica en el pueblo medieval de Altos de Chavón con vistas espectaculares del Río Chavón.',
    highlights_en: [
      'Authentic Italian cuisine',
      'Homemade pasta and risottos',
      'Extensive Italian wine selection',
      'Panoramic river canyon views',
      'Live music on special occasions'
    ],
    highlights_es: [
      'Auténtica cocina italiana',
      'Pasta y risottos caseros',
      'Extensa selección de vinos italianos',
      'Vistas panorámicas del cañón del río',
      'Música en vivo en ocasiones especiales'
    ],
    hours: {
      schedule: [
        {
          day_en: 'Monday',
          day_es: 'Lunes',
          closed: true
        },
        {
          day_en: 'Tuesday',
          day_es: 'Martes',
          closed: true
        },
        {
          day_en: 'Wednesday',
          day_es: 'Miércoles',
          openTime: '6:00 PM',
          closeTime: '11:00 PM',
          closed: false
        },
        {
          day_en: 'Thursday',
          day_es: 'Jueves',
          openTime: '6:00 PM',
          closeTime: '11:00 PM',
          closed: false
        },
        {
          day_en: 'Friday',
          day_es: 'Viernes',
          openTime: '6:00 PM',
          closeTime: '11:00 PM',
          closed: false
        },
        {
          day_en: 'Saturday',
          day_es: 'Sábado',
          openTime: '6:00 PM',
          closeTime: '11:00 PM',
          closed: false
        },
        {
          day_en: 'Sunday',
          day_es: 'Domingo',
          openTime: '6:00 PM',
          closeTime: '11:00 PM',
          closed: false
        }
      ]
    },
    contact: {
      phone: '+1 809-523-4444',
      address_en: 'Altos de Chavón, Casa de Campo',
      address_es: 'Altos de Chavón, Casa de Campo',
      coordinates: {
        lat: 18.4512,
        lng: -68.8795
      }
    },
    pricing: {
      priceRange: '$$$',
      averagePrice: 65,
      currency: 'USD'
    },
    status: 'published',
    featured: false,
    order: 3
  },
  {
    _type: 'restaurant',
    name_en: 'SBG (Seagrapes Beach Grill)',
    name_es: 'SBG (Seagrapes Beach Grill)',
    slug: {
      _type: 'slug',
      current: 'sbg-seagrapes'
    },
    area: 'hotel',
    cuisine: ['caribbean', 'international', 'seafood'],
    vibes: ['beachfront', 'casual', 'family', 'lively'],
    summary_en: 'Casual beachfront grill with Caribbean favorites, fresh seafood, and tropical cocktails.',
    summary_es: 'Parrilla casual frente a la playa con favoritos caribeños, mariscos frescos y cócteles tropicales.',
    highlights_en: [
      'Beachfront location',
      'Fresh grilled seafood',
      'Caribbean specialties',
      'Tropical cocktail menu',
      'Live music Thursday-Saturday'
    ],
    highlights_es: [
      'Ubicación frente a la playa',
      'Mariscos frescos a la parrilla',
      'Especialidades caribeñas',
      'Menú de cócteles tropicales',
      'Música en vivo jueves a sábado'
    ],
    hours: {
      schedule: [
        {
          day_en: 'Monday',
          day_es: 'Lunes',
          openTime: '12:00 PM',
          closeTime: '10:00 PM',
          closed: false
        },
        {
          day_en: 'Tuesday',
          day_es: 'Martes',
          openTime: '12:00 PM',
          closeTime: '10:00 PM',
          closed: false
        },
        {
          day_en: 'Wednesday',
          day_es: 'Miércoles',
          openTime: '12:00 PM',
          closeTime: '10:00 PM',
          closed: false
        },
        {
          day_en: 'Thursday',
          day_es: 'Jueves',
          openTime: '12:00 PM',
          closeTime: '11:00 PM',
          closed: false
        },
        {
          day_en: 'Friday',
          day_es: 'Viernes',
          openTime: '12:00 PM',
          closeTime: '11:00 PM',
          closed: false
        },
        {
          day_en: 'Saturday',
          day_es: 'Sábado',
          openTime: '12:00 PM',
          closeTime: '11:00 PM',
          closed: false
        },
        {
          day_en: 'Sunday',
          day_es: 'Domingo',
          openTime: '12:00 PM',
          closeTime: '10:00 PM',
          closed: false
        }
      ]
    },
    contact: {
      phone: '+1 809-523-5555',
      address_en: 'Casa de Campo Hotel, La Romana',
      address_es: 'Casa de Campo Hotel, La Romana',
      coordinates: {
        lat: 18.4125,
        lng: -68.9089
      }
    },
    pricing: {
      priceRange: '$$',
      averagePrice: 35,
      currency: 'USD'
    },
    status: 'published',
    featured: false,
    order: 4
  }
]

// Info Pages Data
const infoPages = [
  {
    _type: 'infoPage',
    title_en: 'How to Get Here',
    title_es: 'Cómo Llegar',
    slug: {
      _type: 'slug',
      current: 'how-to-get-here'
    },
    intro_en: 'Casa de Campo is easily accessible from major cities worldwide. Located just 70 miles from Santo Domingo and minutes from La Romana International Airport.',
    intro_es: 'Casa de Campo es fácilmente accesible desde las principales ciudades del mundo. Ubicado a solo 70 millas de Santo Domingo y minutos del Aeropuerto Internacional de La Romana.',
    content: [
      {
        _type: 'richText',
        _key: 'section1',
        title_en: 'By Air',
        title_es: 'Por Aire',
        content_en: [
          {
            _type: 'block',
            style: 'h3',
            children: [{ _type: 'span', text: 'La Romana International Airport (LRM)' }]
          },
          {
            _type: 'block',
            style: 'normal',
            children: [
              {
                _type: 'span',
                text: 'The closest airport to Casa de Campo, located just 10 minutes away. Direct flights available from Miami, New York, and other major cities. Private jets and charters welcome with FBO services available.'
              }
            ]
          },
          {
            _type: 'block',
            style: 'h3',
            children: [{ _type: 'span', text: 'Las Américas International Airport (SDQ)' }]
          },
          {
            _type: 'block',
            style: 'normal',
            children: [
              {
                _type: 'span',
                text: 'Located in Santo Domingo, approximately 90 minutes from Casa de Campo. More international flight options available. Complimentary shuttle service for villa owners and resort guests can be arranged.'
              }
            ]
          }
        ],
        content_es: [
          {
            _type: 'block',
            style: 'h3',
            children: [{ _type: 'span', text: 'Aeropuerto Internacional de La Romana (LRM)' }]
          },
          {
            _type: 'block',
            style: 'normal',
            children: [
              {
                _type: 'span',
                text: 'El aeropuerto más cercano a Casa de Campo, ubicado a solo 10 minutos. Vuelos directos disponibles desde Miami, Nueva York y otras ciudades principales. Jets privados y charters bienvenidos con servicios FBO disponibles.'
              }
            ]
          }
        ]
      },
      {
        _type: 'faq',
        _key: 'faq1',
        title_en: 'Frequently Asked Questions',
        title_es: 'Preguntas Frecuentes',
        questions: [
          {
            question_en: 'Do I need a visa to visit the Dominican Republic?',
            question_es: '¿Necesito visa para visitar República Dominicana?',
            answer_en: 'Most visitors from North America and Europe do not need a visa for stays up to 30 days. A tourist card is required and can be purchased online or upon arrival.',
            answer_es: 'La mayoría de visitantes de América del Norte y Europa no necesitan visa para estadías de hasta 30 días. Se requiere una tarjeta de turista que se puede comprar en línea o al llegar.'
          },
          {
            question_en: 'Is there transportation from the airport?',
            question_es: '¿Hay transporte desde el aeropuerto?',
            answer_en: 'Yes, Casa de Campo offers shuttle services from both La Romana and Santo Domingo airports. Private transfers, rental cars, and helicopter transfers are also available.',
            answer_es: 'Sí, Casa de Campo ofrece servicios de transporte desde los aeropuertos de La Romana y Santo Domingo. También están disponibles traslados privados, autos de alquiler y traslados en helicóptero.'
          },
          {
            question_en: 'How long is the drive from Santo Domingo?',
            question_es: '¿Cuánto dura el viaje desde Santo Domingo?',
            answer_en: 'The drive from Santo Domingo to Casa de Campo takes approximately 90 minutes via the modern highway. The route is well-marked and scenic.',
            answer_es: 'El viaje desde Santo Domingo a Casa de Campo toma aproximadamente 90 minutos por la autopista moderna. La ruta está bien señalizada y es escénica.'
          }
        ]
      }
    ],
    seo: {
      metaTitle_en: 'How to Get to Casa de Campo Resort | Travel Information',
      metaTitle_es: 'Cómo Llegar a Casa de Campo Resort | Información de Viaje',
      metaDescription_en: 'Complete travel guide to Casa de Campo Resort. Information on flights, airports, transportation, and visa requirements for your Dominican Republic vacation.',
      metaDescription_es: 'Guía completa de viaje a Casa de Campo Resort. Información sobre vuelos, aeropuertos, transporte y requisitos de visa para sus vacaciones en República Dominicana.',
      keywords_en: ['Casa de Campo travel', 'La Romana airport', 'Dominican Republic visa', 'airport transfer'],
      keywords_es: ['viaje Casa de Campo', 'aeropuerto La Romana', 'visa República Dominicana', 'traslado aeropuerto']
    },
    status: 'published',
    publishedAt: new Date().toISOString()
  },
  {
    _type: 'infoPage',
    title_en: 'Golf Cart Rentals',
    title_es: 'Alquiler de Carritos de Golf',
    slug: {
      _type: 'slug',
      current: 'golf-cart-rentals'
    },
    intro_en: 'Navigate Casa de Campo in style with our golf cart rental service. The preferred way to explore our 7,000-acre resort community.',
    intro_es: 'Navegue Casa de Campo con estilo con nuestro servicio de alquiler de carritos de golf. La forma preferida de explorar nuestra comunidad resort de 7,000 acres.',
    content: [
      {
        _type: 'richText',
        _key: 'section1',
        title_en: 'Golf Cart Options',
        title_es: 'Opciones de Carritos de Golf',
        content_en: [
          {
            _type: 'block',
            style: 'normal',
            children: [
              {
                _type: 'span',
                text: 'Golf carts are the primary mode of transportation within Casa de Campo. We offer 4-seater and 6-seater electric carts, all equipped with lights for evening use. Carts can be rented daily, weekly, or monthly with special rates for extended rentals.'
              }
            ]
          }
        ],
        content_es: [
          {
            _type: 'block',
            style: 'normal',
            children: [
              {
                _type: 'span',
                text: 'Los carritos de golf son el principal medio de transporte dentro de Casa de Campo. Ofrecemos carritos eléctricos de 4 y 6 plazas, todos equipados con luces para uso nocturno. Los carritos se pueden alquilar por día, semana o mes con tarifas especiales para alquileres prolongados.'
              }
            ]
          }
        ]
      },
      {
        _type: 'ctaBanner',
        _key: 'cta1',
        title_en: 'Reserve Your Golf Cart',
        title_es: 'Reserve Su Carrito de Golf',
        description_en: 'Book in advance to ensure availability during your stay',
        description_es: 'Reserve con anticipación para garantizar disponibilidad durante su estadía',
        primaryCta: {
          text_en: 'Reserve Now',
          text_es: 'Reservar Ahora',
          url: 'https://www.casadecampo.com.do/golf-carts'
        }
      }
    ],
    status: 'published',
    publishedAt: new Date().toISOString()
  }
]

async function importData() {
  console.log('🚀 Starting data import to Sanity...\n')

  try {
    // Import Golf Courses
    console.log('⛳ Importing golf courses...')
    for (const course of golfCourses) {
      const result = await client.createOrReplace({
        ...course,
        _id: `golf-course-${course.slug.current}`
      })
      console.log(`  ✅ Imported: ${course.name_en}`)
    }
    console.log(`  📊 Total golf courses imported: ${golfCourses.length}\n`)

    // Import Restaurants
    console.log('🍽️ Importing restaurants...')
    for (const restaurant of restaurants) {
      const result = await client.createOrReplace({
        ...restaurant,
        _id: `restaurant-${restaurant.slug.current}`
      })
      console.log(`  ✅ Imported: ${restaurant.name_en}`)
    }
    console.log(`  📊 Total restaurants imported: ${restaurants.length}\n`)

    // Import Info Pages
    console.log('📄 Importing info pages...')
    for (const page of infoPages) {
      const result = await client.createOrReplace({
        ...page,
        _id: `info-page-${page.slug.current}`
      })
      console.log(`  ✅ Imported: ${page.title_en}`)
    }
    console.log(`  📊 Total info pages imported: ${infoPages.length}\n`)

    console.log('🎉 Data import completed successfully!')
    console.log(`
Summary:
--------
⛳ Golf Courses: ${golfCourses.length}
🍽️ Restaurants: ${restaurants.length}
📄 Info Pages: ${infoPages.length}
--------
Total Documents: ${golfCourses.length + restaurants.length + infoPages.length}
    `)

  } catch (error) {
    console.error('❌ Error importing data:', error)
    process.exit(1)
  }
}

// Run the import
importData()