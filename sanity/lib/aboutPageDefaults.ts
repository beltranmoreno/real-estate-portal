/**
 * The About page's own sections (the hero lives in Page Heroes → About), as
 * the site shipped them. Pre-fills the Studio doc (scripts/update-about.ts)
 * and stands in for any field left empty there.
 */
export const ABOUT_PAGE_ID = 'aboutPage'

export const ABOUT_PAGE_DEFAULTS = {
  founder: {
    eyebrow: { en: 'Meet Our Founder', es: 'Conoce a Nuestra Fundadora' },
    title: {
      en: 'A Local Perspective. A Tailored Experience.',
      es: 'Una Perspectiva Local. Una Experiencia Hecha a tu Medida',
    },
  },
  stats: { properties: '300+', bookings: '400+' },
  brand: {
    eyebrow: { en: 'Meet Our Brand', es: 'Conoce nuestra marca' },
    title: {
      en: 'More Than a Destination. A Place We Call Home.',
      es: 'Más que un Destino. Un Lugar al que Llamamos Hogar.',
    },
    body: {
      en: 'Luxury is not measured by what you own, but by how you feel.\n\nAt Leticia Coudray Saladin Real Estate, we believe the most memorable experiences begin with genuine local knowledge, meaningful relationships, and a deeply personal approach to hospitality.\n\nBorn in Casa de Campo, our brand was created with a simple philosophy: to share the destination we know and love through exceptional homes, bespoke experiences, and a level of service that feels thoughtful, effortless, and entirely personal.\n\nRather than offering an extensive catalogue, we intentionally represent a carefully curated collection of private villas whose owners share our values of quality, trust, and authenticity. Every home has been personally selected, every relationship built over time, and every recommendation made with confidence.\n\nWhether welcoming families for an unforgettable Caribbean escape or guiding clients through one of life’s most important investments, our commitment remains the same—to create experiences defined by discretion, integrity, and genuine care.\n\nFor us, luxury is not about excess.\n\nIt is about feeling at home from the moment you arrive.',
      es: 'El verdadero lujo no se mide por lo que se posee, sino por cómo te hace sentir.\n\nEn Leticia Coudray Saladin Real Estate creemos que las experiencias más memorables nacen del conocimiento genuino del destino, de relaciones construidas con confianza y de una forma profundamente personal de entender la hospitalidad.\n\nNacida en Casa de Campo, nuestra marca surge con una filosofía muy clara: compartir el destino que conocemos y amamos a través de villas excepcionales, experiencias cuidadosamente diseñadas y un servicio que se siente cercano, natural y completamente personalizado.\n\nEn lugar de representar un amplio catálogo de propiedades, elegimos trabajar con una colección cuidadosamente seleccionada de villas privadas cuyos propietarios comparten nuestros mismos valores de calidad, confianza y autenticidad. Cada propiedad ha sido elegida personalmente, cada relación se ha construido con el tiempo y cada recomendación nace del conocimiento y la experiencia.\n\nYa sea recibiendo familias que desean vivir unas vacaciones inolvidables o acompañando a nuestros clientes en una de las decisiones de inversión más importantes de su vida, nuestro compromiso siempre es el mismo: ofrecer experiencias guiadas por la discreción, la integridad y una atención genuina.\n\nPara nosotros, el lujo nunca consiste en hacer más.\n\nConsiste en hacer que cada persona se sienta como en casa desde el primer momento.',
    },
  },
  whatWeDo: {
    eyebrow: { en: 'What we do', es: 'Qué hacemos' },
    items: [
      {
        eyebrow: { en: 'Stays', es: 'Estancias' },
        title: { en: 'Villas for a week or a season', es: 'Villas por una semana o una temporada' },
        body: {
          en: 'Exceptional private villas, matched to your dates, your group and the way you want to experience Casa de Campo.',
          es: 'Villas privadas excepcionales, elegidas según tus fechas, tu grupo y la forma en que quieres vivir Casa de Campo.',
        },
        buttonLabel: { en: 'Browse properties', es: 'Ver propiedades' },
        href: '/search',
      },
      {
        eyebrow: { en: 'Concierge', es: 'Conserjería' },
        title: { en: 'Every detail, thoughtfully arranged', es: 'Cada detalle, cuidadosamente organizado' },
        body: {
          en: 'From airport transfers and golf carts to culinary experiences, boat trips and restaurant reservations, we take care of the details around your stay.',
          es: 'Desde traslados al aeropuerto y carritos de golf hasta experiencias gastronómicas, paseos en barco y reservas en restaurantes, nos ocupamos de cada detalle de tu estadía.',
        },
        buttonLabel: { en: 'Concierge services', es: 'Servicios de conserjería' },
        href: '/services/concierge',
      },
      {
        eyebrow: { en: 'Buying & selling', es: 'Compra y venta' },
        title: { en: 'Exceptional homes, discreetly represented', es: 'Casas excepcionales, representadas con discreción' },
        body: {
          en: 'Explore selected properties on and off the market, with personal guidance throughout the buying or selling process.',
          es: 'Descubre propiedades seleccionadas, publicadas y fuera del mercado, con acompañamiento personal durante todo el proceso de compra o venta.',
        },
        buttonLabel: { en: 'Properties for sale', es: 'Propiedades en venta' },
        href: '/search?listingType=sale',
      },
    ],
  },
  contact: {
    eyebrow: { en: 'Contact', es: 'Contacto' },
    title: { en: 'Your Stay Begins Here.', es: 'Tu Estadía Comienza Aquí.' },
    body: {
      en: 'Tell us your dates and what you have in mind, from the right villa for your group to the details that would make your stay special. We’ll help you find the right fit and take care of the arrangements.',
      es: 'Cuéntanos tus fechas y lo que tienes en mente, desde la villa ideal para tu grupo hasta los detalles que harían tu estadía especial. Te ayudaremos a encontrar la opción perfecta y nos encargaremos de cada preparativo.',
    },
  },
  owners: {
    eyebrow: { en: 'For owners', es: 'Para propietarios' },
    title: { en: 'Your property, in trusted hands.', es: 'Tu propiedad, en manos de confianza.' },
    body: {
      en: 'We manage a select portfolio of properties in Casa de Campo for rental and sale. With one dedicated point of contact, your property receives personal attention and consistent oversight from the very beginning.',
      es: 'Gestionamos una cartera selecta de propiedades en Casa de Campo para alquiler y venta. Con un único punto de contacto dedicado, tu propiedad recibe atención personal y una supervisión constante desde el primer día.',
    },
  },
  philosophy: {
    title: { en: 'Our Philosophy', es: 'Nuestra Filosofía' },
    items: [
      {
        title: { en: 'Personal by Nature', es: 'Personal por Naturaleza' },
        body: {
          en: 'Luxury should never feel transactional. Every relationship is built personally, offering continuity, familiarity, and a single trusted point of contact from your first conversation to long after your stay.',
          es: 'El lujo nunca debería sentirse impersonal. Cada relación se construye de manera cercana, ofreciendo continuidad y un único punto de contacto de confianza desde la primera conversación hasta mucho después de tu estadía.',
        },
      },
      {
        title: { en: 'Local by Heart', es: 'Local de Corazón' },
        body: {
          en: 'Casa de Campo is more than where we work—it is where we grew up, where we built lasting relationships, and where our local insight becomes your greatest advantage.',
          es: 'Casa de Campo no es simplemente el lugar donde trabajamos; es donde crecimos, donde construimos nuestras relaciones y donde nuestro conocimiento del destino se convierte en tu mayor ventaja.',
        },
      },
      {
        title: { en: 'Curated with Intention', es: 'Curado con Intención' },
        body: {
          en: 'We believe exceptional quality comes from careful selection, not endless choice. Every villa, experience, and recommendation reflects the standards we proudly stand behind.',
          es: 'Creemos que la excelencia nace de una selección cuidadosa, no de una oferta ilimitada. Cada villa, experiencia y recomendación responde a los estándares que representan nuestra marca.',
        },
      },
      {
        title: { en: 'Guided by Trust', es: 'Guiados por la Confianza' },
        body: {
          en: 'Discretion, transparency, and integrity shape every relationship we build—with homeowners, guests, and investors alike.',
          es: 'La discreción, la transparencia y la integridad definen cada relación que construimos con propietarios, huéspedes e inversionistas.',
        },
      },
    ],
  },
}
