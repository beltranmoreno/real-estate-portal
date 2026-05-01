export type Locale = 'en' | 'es'

export interface CompletionCopy {
  pageTitle: string
  pageSubtitle: string
  savedJustNow: string
  savedAt: string
  saving: string
  saveFailed: string
  switchToSpanish: string
  switchToEnglish: string

  invalidTitle: string
  invalidBody: string
  completedTitle: string
  completedBody: string

  sectionBasics: string
  sectionDescription: string
  sectionAmenities: string
  sectionRoomsBeds: string
  sectionFeatures: string
  sectionPricing: string
  sectionRules: string
  sectionContact: string
  sectionLocation: string
  sectionStaff: string
  staffHelp: string
  staffOptionNone: string
  staffOptionIncluded: string
  staffOptionOnRequest: string

  propertyType: string
  propertyTypePlaceholder: string
  propertyTypeOptions: Record<
    'villa' | 'apartment' | 'condo' | 'house' | 'penthouse' | 'townhouse' | 'studio' | 'loft' | 'plot',
    string
  >

  descriptionEn: string
  descriptionEs: string
  descriptionHelp: string

  bedrooms: string
  bathrooms: string
  maxGuests: string
  squareMeters: string

  street: string
  area: string
  areaPlaceholder: string
  areaOther: string
  customArea: string
  customAreaPlaceholder: string
  city: string
  country: string
  postcode: string
  privateAddress: string
  privateAddressHelp: string

  amenityGroups: Record<
    'climate' | 'kitchen' | 'entertainment' | 'outdoor' | 'services' | 'laundry' | 'family' | 'work' | 'premium',
    string
  >

  nightlyRate: string
  minimumNights: string
  priceOnRequest: string

  smokingAllowed: string
  petsAllowed: string
  eventsAllowed: string
  maxEventGuests: string

  hostName: string
  email: string
  phone: string
  whatsapp: string

  submit: string
  submitting: string
  submitError: string
  requiredField: string
  sectionRoomBreakdown: string
  roomBreakdownHelp: string
  addRoom: string
  removeRoom: string
  roomName: string
  roomBathrooms: string
  bedsInRoom: string
  addBed: string
  bedTypes: Record<
    'king' | 'queen' | 'full' | 'twin' | 'bunk' | 'sofa' | 'crib',
    string
  >
  bedQuantity: string
  baseRate: string
  baseRateHelp: string
  seasonalPricing: string
  seasonalPricingHelp: string
  addSeason: string
  removeSeason: string
  seasonName: string
  seasonStart: string
  seasonEnd: string
  golfCartIncluded: string
  numberOfGolfCarts: string
}

export const completionTranslations: Record<Locale, CompletionCopy> = {
  en: {
    pageTitle: 'Complete your property listing',
    pageSubtitle: 'Fill in the details below. Your progress is saved automatically.',
    savedJustNow: 'Saved just now',
    savedAt: 'Draft saved at',
    saving: 'Saving…',
    saveFailed: 'Could not save draft',
    switchToSpanish: 'Español',
    switchToEnglish: 'English',

    invalidTitle: 'This link is no longer valid',
    invalidBody: 'The completion link has expired or been revoked. Please contact your agent for a new link.',
    completedTitle: 'Thank you!',
    completedBody: 'Your listing details have been submitted. Our team will review and publish it shortly.',

    sectionBasics: 'Basics',
    sectionDescription: 'Description',
    sectionAmenities: 'Amenities',
    sectionRoomsBeds: 'Rooms & Capacity',
    sectionFeatures: 'Features',
    sectionPricing: 'Pricing',
    sectionRules: 'House Rules',
    sectionContact: 'Contact Information',
    sectionLocation: 'Location',
    sectionStaff: 'Staff & Services',
    staffHelp:
      'For each staff role, choose whether it is included with the rental, available upon request (extra fee), or not available.',
    staffOptionNone: 'Not available',
    staffOptionIncluded: 'Included',
    staffOptionOnRequest: 'On request',

    propertyType: 'Property Type',
    propertyTypePlaceholder: 'Select a type',
    propertyTypeOptions: {
      villa: 'Villa',
      apartment: 'Apartment',
      condo: 'Condo',
      house: 'House',
      penthouse: 'Penthouse',
      townhouse: 'Townhouse',
      studio: 'Studio',
      loft: 'Loft',
      plot: 'Plot of Land',
    },

    descriptionEn: 'Description (English)',
    descriptionEs: 'Description (Spanish)',
    descriptionHelp: 'A couple of paragraphs describing the property, the neighborhood, and what makes it special.',

    bedrooms: 'Bedrooms',
    bathrooms: 'Bathrooms',
    maxGuests: 'Maximum guests',
    squareMeters: 'Square meters',

    street: 'Street',
    area: 'Area / Sector',
    areaPlaceholder: 'Select an area',
    areaOther: 'Other (specify below)',
    customArea: 'Custom area name',
    customAreaPlaceholder: 'e.g. Hispaniola Hills',
    city: 'City',
    country: 'Country',
    postcode: 'Postcode / ZIP',
    privateAddress: 'Hide my address publicly',
    privateAddressHelp:
      'When enabled, the exact address is hidden on the public property page and search results. It will still be visible inside private (access-code-protected) collections.',

    amenityGroups: {
      climate: 'Climate',
      kitchen: 'Kitchen',
      entertainment: 'Entertainment',
      outdoor: 'Outdoor',
      services: 'Services',
      laundry: 'Laundry',
      family: 'Family',
      work: 'Work',
      premium: 'Premium',
    },

    nightlyRate: 'Nightly rate (USD)',
    minimumNights: 'Minimum nights',
    priceOnRequest: 'Price on request (hide rate publicly)',

    smokingAllowed: 'Smoking allowed',
    petsAllowed: 'Pets allowed',
    eventsAllowed: 'Events allowed',
    maxEventGuests: 'Max event guests',

    hostName: 'Host / Owner name',
    email: 'Email',
    phone: 'Phone',
    whatsapp: 'WhatsApp',

    submit: 'Submit listing',
    submitting: 'Submitting…',
    submitError: 'Could not submit. Please review the form and try again.',
    requiredField: 'This field is required',

    sectionRoomBreakdown: 'Rooms & Beds',
    roomBreakdownHelp:
      'Add each bedroom or sleeping area, the bathrooms inside that room, and the beds it has.',
    addRoom: '+ Add room',
    removeRoom: 'Remove',
    roomName: 'Room name (e.g. Master Bedroom)',
    roomBathrooms: 'Bathrooms in this room',
    bedsInRoom: 'Beds in this room',
    addBed: '+ Add bed',
    bedTypes: {
      king: 'King',
      queen: 'Queen',
      full: 'Full / Double',
      twin: 'Twin / Single',
      bunk: 'Bunk bed',
      sofa: 'Sofa bed',
      crib: 'Crib',
    },
    bedQuantity: 'Quantity',
    baseRate: 'Base nightly rate (USD)',
    baseRateHelp: 'The default price per night when no seasonal rule applies.',
    seasonalPricing: 'Seasonal pricing',
    seasonalPricingHelp:
      'Optional. Add date ranges with different rates (e.g. high season, holidays).',
    addSeason: '+ Add season',
    removeSeason: 'Remove',
    seasonName: 'Season name',
    seasonStart: 'Start date',
    seasonEnd: 'End date',
    golfCartIncluded: 'Golf cart included',
    numberOfGolfCarts: 'Number of golf carts',
  },
  es: {
    pageTitle: 'Completa tu propiedad',
    pageSubtitle: 'Llena los datos a continuación. Tu progreso se guarda automáticamente.',
    savedJustNow: 'Guardado hace un momento',
    savedAt: 'Borrador guardado el',
    saving: 'Guardando…',
    saveFailed: 'No se pudo guardar el borrador',
    switchToSpanish: 'Español',
    switchToEnglish: 'English',

    invalidTitle: 'Este enlace ya no es válido',
    invalidBody: 'El enlace ha expirado o fue revocado. Contacta a tu agente para recibir uno nuevo.',
    completedTitle: '¡Gracias!',
    completedBody: 'Los datos de tu propiedad fueron enviados. Nuestro equipo los revisará y los publicará pronto.',

    sectionBasics: 'Datos básicos',
    sectionDescription: 'Descripción',
    sectionAmenities: 'Comodidades',
    sectionRoomsBeds: 'Habitaciones y capacidad',
    sectionFeatures: 'Características',
    sectionPricing: 'Precio',
    sectionRules: 'Reglas de la casa',
    sectionContact: 'Información de contacto',
    sectionLocation: 'Ubicación',
    sectionStaff: 'Personal y servicios',
    staffHelp:
      'Para cada miembro del personal, elige si está incluido en el alquiler, disponible bajo petición (cargo adicional) o no disponible.',
    staffOptionNone: 'No disponible',
    staffOptionIncluded: 'Incluido',
    staffOptionOnRequest: 'Bajo petición',

    propertyType: 'Tipo de propiedad',
    propertyTypePlaceholder: 'Selecciona un tipo',
    propertyTypeOptions: {
      villa: 'Villa',
      apartment: 'Apartamento',
      condo: 'Condominio',
      house: 'Casa',
      penthouse: 'Penthouse',
      townhouse: 'Townhouse',
      studio: 'Estudio',
      loft: 'Loft',
      plot: 'Lote de terreno',
    },

    descriptionEn: 'Descripción (Inglés)',
    descriptionEs: 'Descripción (Español)',
    descriptionHelp: 'Un par de párrafos describiendo la propiedad, la zona y lo que la hace especial.',

    bedrooms: 'Habitaciones',
    bathrooms: 'Baños',
    maxGuests: 'Huéspedes máximos',
    squareMeters: 'Metros cuadrados',

    street: 'Calle',
    area: 'Área / Sector',
    areaPlaceholder: 'Selecciona un área',
    areaOther: 'Otra (especificar abajo)',
    customArea: 'Nombre del área',
    customAreaPlaceholder: 'ej. Lomas Hispanas',
    city: 'Ciudad',
    country: 'País',
    postcode: 'Código postal',
    privateAddress: 'Ocultar mi dirección al público',
    privateAddressHelp:
      'Cuando se activa, la dirección exacta se oculta en la página pública de la propiedad y en los resultados de búsqueda. Seguirá siendo visible dentro de colecciones privadas (protegidas con código de acceso).',

    amenityGroups: {
      climate: 'Clima',
      kitchen: 'Cocina',
      entertainment: 'Entretenimiento',
      outdoor: 'Exterior',
      services: 'Servicios',
      laundry: 'Lavandería',
      family: 'Familia',
      work: 'Trabajo',
      premium: 'Premium',
    },

    nightlyRate: 'Tarifa por noche (USD)',
    minimumNights: 'Noches mínimas',
    priceOnRequest: 'Precio a solicitud (ocultar tarifa al público)',

    smokingAllowed: 'Se permite fumar',
    petsAllowed: 'Se permiten mascotas',
    eventsAllowed: 'Se permiten eventos',
    maxEventGuests: 'Máximo de invitados a eventos',

    hostName: 'Nombre del anfitrión / dueño',
    email: 'Correo electrónico',
    phone: 'Teléfono',
    whatsapp: 'WhatsApp',

    submit: 'Enviar propiedad',
    submitting: 'Enviando…',
    submitError: 'No se pudo enviar. Revisa el formulario e inténtalo de nuevo.',
    requiredField: 'Este campo es obligatorio',

    sectionRoomBreakdown: 'Habitaciones y camas',
    roomBreakdownHelp:
      'Agrega cada habitación o área para dormir, los baños dentro de esa habitación y las camas que tiene.',
    addRoom: '+ Añadir habitación',
    removeRoom: 'Eliminar',
    roomName: 'Nombre de la habitación (ej. Habitación principal)',
    roomBathrooms: 'Baños en esta habitación',
    bedsInRoom: 'Camas en esta habitación',
    addBed: '+ Añadir cama',
    bedTypes: {
      king: 'King',
      queen: 'Queen',
      full: 'Doble',
      twin: 'Sencilla',
      bunk: 'Litera',
      sofa: 'Sofá cama',
      crib: 'Cuna',
    },
    bedQuantity: 'Cantidad',
    baseRate: 'Tarifa base por noche (USD)',
    baseRateHelp: 'Precio por noche por defecto cuando no aplica una regla de temporada.',
    seasonalPricing: 'Precios por temporada',
    seasonalPricingHelp:
      'Opcional. Agrega rangos de fechas con tarifas diferentes (ej. temporada alta, días festivos).',
    addSeason: '+ Añadir temporada',
    removeSeason: 'Eliminar',
    seasonName: 'Nombre de la temporada',
    seasonStart: 'Fecha de inicio',
    seasonEnd: 'Fecha de fin',
    golfCartIncluded: 'Carrito de golf incluido',
    numberOfGolfCarts: 'Cantidad de carritos de golf',
  },
}

export function getLocale(input: string | string[] | undefined): Locale {
  const raw = Array.isArray(input) ? input[0] : input
  return raw === 'es' ? 'es' : 'en'
}
