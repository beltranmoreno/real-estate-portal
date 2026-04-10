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

  propertyType: string
  propertyTypePlaceholder: string
  propertyTypeOptions: Record<
    'villa' | 'apartment' | 'condo' | 'house' | 'penthouse' | 'townhouse' | 'studio' | 'loft',
    string
  >

  descriptionEn: string
  descriptionEs: string
  descriptionHelp: string

  bedrooms: string
  bathrooms: string
  maxGuests: string
  squareMeters: string

  addressEn: string
  addressEs: string

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
  quietHoursStart: string
  quietHoursEnd: string

  hostName: string
  email: string
  phone: string
  whatsapp: string

  submit: string
  submitting: string
  submitError: string
  requiredField: string
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
    },

    descriptionEn: 'Description (English)',
    descriptionEs: 'Description (Spanish)',
    descriptionHelp: 'A couple of paragraphs describing the property, the neighborhood, and what makes it special.',

    bedrooms: 'Bedrooms',
    bathrooms: 'Bathrooms',
    maxGuests: 'Maximum guests',
    squareMeters: 'Square meters (optional)',

    addressEn: 'Street address (English)',
    addressEs: 'Street address (Spanish)',

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
    quietHoursStart: 'Quiet hours start',
    quietHoursEnd: 'Quiet hours end',

    hostName: 'Host / Owner name',
    email: 'Email',
    phone: 'Phone',
    whatsapp: 'WhatsApp',

    submit: 'Submit listing',
    submitting: 'Submitting…',
    submitError: 'Could not submit. Please review the form and try again.',
    requiredField: 'This field is required',
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
    },

    descriptionEn: 'Descripción (Inglés)',
    descriptionEs: 'Descripción (Español)',
    descriptionHelp: 'Un par de párrafos describiendo la propiedad, la zona y lo que la hace especial.',

    bedrooms: 'Habitaciones',
    bathrooms: 'Baños',
    maxGuests: 'Huéspedes máximos',
    squareMeters: 'Metros cuadrados (opcional)',

    addressEn: 'Dirección (Inglés)',
    addressEs: 'Dirección (Español)',

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
    quietHoursStart: 'Horas de silencio (inicio)',
    quietHoursEnd: 'Horas de silencio (fin)',

    hostName: 'Nombre del anfitrión / dueño',
    email: 'Correo electrónico',
    phone: 'Teléfono',
    whatsapp: 'WhatsApp',

    submit: 'Enviar propiedad',
    submitting: 'Enviando…',
    submitError: 'No se pudo enviar. Revisa el formulario e inténtalo de nuevo.',
    requiredField: 'Este campo es obligatorio',
  },
}

export function getLocale(input: string | string[] | undefined): Locale {
  const raw = Array.isArray(input) ? input[0] : input
  return raw === 'es' ? 'es' : 'en'
}
