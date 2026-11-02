/**
 * The Owners page's sections (the hero lives in Page Heroes → For owners),
 * as the site shipped them. Pre-fills the Studio doc
 * (scripts/update-owners.ts) and stands in for any field left empty there.
 */
export const OWNERS_PAGE_ID = 'ownersPage'

type Bi = { en: string; es: string }
const b = (en: string, es: string): Bi => ({ en, es })

export const OWNERS_PAGE_DEFAULTS = {
  why: {
    eyebrow: b('Why owners work with us', 'Por qué nos eligen'),
    title: b('Fewer houses, more attention.', 'Menos casas, más atención.'),
    items: [
      {
        title: b('A selective portfolio', 'Una cartera selectiva'),
        body: b(
          'We represent a select portfolio of villas, giving each property the attention it deserves. Every home is thoughtfully presented and positioned, rather than simply added to a list.',
          'Representamos una cartera selecta de villas, dedicando a cada propiedad la atención que merece. Cada casa se presenta y posiciona con cuidado, en lugar de simplemente añadirse a una lista.'
        ),
      },
      {
        title: b('Guests we know before they arrive', 'Huéspedes que conocemos antes de su llegada'),
        body: b(
          'Every stay begins with a personal enquiry, allowing us to understand who is travelling, what they need and whether the property is the right fit before a booking is confirmed.',
          'Cada estadía comienza con una consulta personal, lo que nos permite entender quién viaja, qué necesita y si la propiedad es la adecuada antes de confirmar una reserva.'
        ),
      },
      {
        title: b('Looked after throughout the stay', 'Atendidos durante toda la estadía'),
        body: b(
          'From arrival arrangements to concierge assistance throughout the stay, we coordinate the details and remain the point of contact for your guests, so you don’t have to be.',
          'Desde los preparativos de llegada hasta la asistencia de conserjería durante la estadía, coordinamos cada detalle y somos el punto de contacto de tus huéspedes, para que tú no tengas que serlo.'
        ),
      },
      {
        title: b('Discretion', 'Discreción'),
        body: b(
          'Your property is marketed according to your preferences, with options for discreet exposure. For sales, we can also present it privately to suitable buyers through our personal network.',
          'Tu propiedad se promociona según tus preferencias, con opciones de exposición discreta. Para ventas, también podemos presentarla en privado a compradores adecuados a través de nuestra red personal.'
        ),
      },
    ],
  },
  services: {
    eyebrow: b('What we do for owners', 'Qué hacemos por los propietarios'),
    items: [
      {
        eyebrow: b('Rentals', 'Alquileres'),
        title: b('Your villa, rented with care', 'Tu villa, alquilada con cuidado'),
        list: [
          b('Photography and presentation on the site', 'Fotografía y presentación en el sitio'),
          b('Personal vetting of every enquiry', 'Revisión personal de cada consulta'),
          b('Check-in and welcome', 'Check-in y bienvenida'),
          b('Concierge for guests during the stay', 'Conserjería para los huéspedes durante la estadía'),
          b('A guest portal for each booking', 'Un portal de huésped para cada reserva'),
        ],
        buttonLabel: b('See the concierge', 'Ver la conserjería'),
        href: '/services/concierge',
      },
      {
        eyebrow: b('Sales', 'Ventas'),
        title: b('Sales, on or off the market', 'Ventas, publicadas o fuera del mercado'),
        list: [
          b('A considered asking price and presentation', 'Un precio y una presentación bien pensados'),
          b('Public listing among our properties for sale', 'Publicación entre nuestras propiedades en venta'),
          b('Or a private, off-market sale', 'O una venta privada, fuera del mercado'),
          b('Private viewings with qualified buyers', 'Visitas privadas con compradores calificados'),
          b('One person beside you through closing', 'Una sola persona a tu lado hasta el cierre'),
        ],
        buttonLabel: b('Properties for sale', 'Propiedades en venta'),
        href: '/search?listingType=sale',
      },
      {
        eyebrow: b('Owner portal', 'Portal de propietarios'),
        title: b('Your properties, in one place', 'Tus propiedades, en un solo lugar'),
        list: [
          b('Private sign-in, by invitation', 'Acceso privado, por invitación'),
          b('The properties we represent for you', 'Las propiedades que representamos para ti'),
          b('Notes from us on each property', 'Notas nuestras sobre cada propiedad'),
        ],
        buttonLabel: b('Owner sign-in', 'Acceso de propietarios'),
        href: '/portal/sign-in',
      },
    ],
  },
  how: {
    eyebrow: b('How it works', 'Cómo funciona'),
    title: b('Four steps, no rush.', 'Cuatro pasos, sin prisa.'),
    items: [
      {
        title: b('A conversation', 'Una conversación'),
        body: b(
          'Tell us about your property and what you have in mind — rental income, a sale, or both.',
          'Cuéntanos sobre tu propiedad y lo que tienes en mente — ingresos por alquiler, una venta, o ambos.'
        ),
      },
      {
        title: b('A visit and photographs', 'Una visita y fotografías'),
        body: b(
          'We visit your property, agree on how it should be presented, and arrange professional photography.',
          'Visitamos tu propiedad, acordamos cómo presentarla y organizamos una sesión de fotografía profesional.'
        ),
      },
      {
        title: b('The listing', 'La publicación'),
        body: b(
          'Your property is presented on our website or offered privately, according to the approach we agree on together.',
          'Tu propiedad se presenta en nuestro sitio web o se ofrece en privado, según el enfoque que acordemos juntos.'
        ),
      },
      {
        title: b('Ongoing management', 'Gestión continua'),
        body: b(
          'We handle enquiries, guest arrangements and viewings, keeping you informed along the way.',
          'Nos encargamos de consultas, preparativos para huéspedes y visitas, manteniéndote informado en todo momento.'
        ),
      },
    ],
  },
  contact: {
    eyebrow: b('Contact', 'Contacto'),
    title: b('Let’s talk about your property.', 'Hablemos de tu propiedad.'),
    body: b(
      'Whether you’re considering renting, selling or exploring your options, we’d be pleased to hear from you. Every conversation begins with understanding your property and your priorities.',
      'Ya sea que estés pensando en alquilar, vender o explorar tus opciones, nos encantará escucharte. Cada conversación comienza por entender tu propiedad y tus prioridades.'
    ),
  },
}
