/**
 * The "Casa de Campo" page (The Resort → Casa de Campo), as written for
 * launch. Pre-fills the Studio doc (scripts/seed-casa-de-campo.ts) and stands
 * in for any text field left empty there. Photos are added in Studio.
 */
export const CASA_DE_CAMPO_ID = 'casaDeCampoPage'

type Bi = { en: string; es: string }

export const CASA_DE_CAMPO_DEFAULTS: {
  hero: { eyebrow: Bi; title: Bi; introEyebrow: Bi; introTitle: Bi; intro: Bi }
  story: { eyebrow: Bi; title: Bi; body: Bi }
  archive: { eyebrow: Bi; title: Bi; intro: Bi }
  personal: { eyebrow: Bi; title: Bi; body: Bi; name: string; role: Bi }
  cta: { eyebrow: Bi; title: Bi; body: Bi; buttonLabel: Bi; buttonHref: string }
} = {
  hero: {
    eyebrow: { en: 'About Casa de Campo', es: 'Sobre Casa de Campo' },
    title: { en: 'A place to discover. A place to belong.', es: 'Un lugar para descubrir. Un lugar al que pertenecer.' },
    introEyebrow: { en: 'The resort', es: 'El resort' },
    introTitle: { en: 'Seven Thousand Acres of Caribbean Coast', es: 'Siete Mil Acres de Costa Caribeña' },
    intro: {
      en: 'Set along the Caribbean coast of La Romana, Casa de Campo is a world of its own. Across 7,000 acres, championship golf, private villas, a vibrant marina and the Mediterranean-inspired village of Altos de Chavón come together in a destination renowned for its approach to luxury, sport and hospitality. For some, it is a remarkable place to visit. For others, it becomes home.',
      es: 'A orillas del Caribe, en La Romana, Casa de Campo es un mundo propio. En 7,000 acres se reúnen golf de campeonato, villas privadas, una marina llena de vida y Altos de Chavón, un pueblo de inspiración mediterránea, en un destino reconocido por su manera de entender el lujo, el deporte y la hospitalidad. Para algunos, es un lugar extraordinario que visitar. Para otros, se convierte en su hogar.',
    },
  },
  story: {
    eyebrow: { en: 'The story', es: 'La historia' },
    title: { en: 'From Sugar Fields to Caribbean Icon', es: 'De los cañaverales a un ícono del Caribe' },
    body: {
      en: 'What began among the sugar fields of La Romana grew into one of the Caribbean’s most distinctive destinations. First envisioned in the 1960s, Casa de Campo took shape around a bold idea: a different kind of retreat, where sport, landscape and exceptional living belonged together. The opening of Teeth of the Dog in 1971, followed by the resort’s debut as a private executive retreat in 1974, marked the beginning of a legacy that continues to evolve.',
      es: 'Lo que comenzó entre los cañaverales de La Romana se convirtió en uno de los destinos más singulares del Caribe. Imaginada por primera vez en los años sesenta, Casa de Campo tomó forma en torno a una idea audaz: un refugio distinto, donde el deporte, el paisaje y una forma excepcional de vivir fueran de la mano. La apertura de Teeth of the Dog en 1971, seguida del debut del resort como retiro ejecutivo privado en 1974, marcó el inicio de un legado que sigue evolucionando.',
    },
  },
  archive: {
    eyebrow: { en: 'From the archives', es: 'Del archivo' },
    title: { en: 'A glimpse of the beginning', es: 'Una mirada a los comienzos' },
    intro: {
      en: 'A look back at Casa de Campo through photographs of its early years. Familiar places take on a different character, revealing the landscape, architecture and everyday moments that have shaped the destination.',
      es: 'Un recorrido por Casa de Campo a través de fotografías de sus primeros años. Lugares conocidos adquieren otro carácter y revelan el paisaje, la arquitectura y los momentos cotidianos que han dado forma al destino.',
    },
  },
  personal: {
    eyebrow: { en: 'A personal connection', es: 'Una conexión personal' },
    title: { en: 'Before it was my work, it was my home.', es: 'Antes de ser mi trabajo, fue mi hogar.' },
    body: {
      en: 'I grew up in Casa de Campo. It is where my story began, where my understanding of this community took shape, and where I came to appreciate what makes this place so special beyond its villas, golf courses and beautiful surroundings.\n\nToday, that lifelong connection informs the way I work. Through real estate and personalized hospitality, I guide owners through sales and rentals, and help guests discover Casa de Campo through thoughtfully arranged stays. For me, it has always been about more than finding the right villa. It is about sharing a place that means so much to me, and helping others create memories of their own.',
      es: 'Crecí en Casa de Campo. Aquí comenzó mi historia, aquí aprendí a conocer esta comunidad y aquí descubrí lo que hace a este lugar tan especial, más allá de sus villas, sus campos de golf y su belleza.\n\nHoy, esa conexión de toda una vida guía mi manera de trabajar. A través de los bienes raíces y una hospitalidad personalizada, acompaño a propietarios en la venta y el alquiler de sus villas, y ayudo a los huéspedes a descubrir Casa de Campo con estancias pensadas al detalle. Para mí, siempre ha sido algo más que encontrar la villa adecuada. Se trata de compartir un lugar que significa tanto para mí y de ayudar a otros a crear sus propios recuerdos.',
    },
    name: 'Leticia Coudray Saladin',
    role: { en: 'Founder', es: 'Fundadora' },
  },
  cta: {
    eyebrow: { en: 'Your connection to Casa de Campo', es: 'Tu conexión con Casa de Campo' },
    title: { en: 'Find your place here.', es: 'Encuentra tu lugar aquí.' },
    body: {
      en: 'Whether you are planning a stay, searching for a home or entrusting us with your property, we bring local understanding and personal attention to every step.',
      es: 'Ya sea que planees una estancia, busques un hogar o nos confíes tu propiedad, te acompañamos en cada paso con conocimiento local y atención personal.',
    },
    buttonLabel: { en: 'Start a conversation', es: 'Iniciar una conversación' },
    buttonHref: '/about#contact',
  },
}
