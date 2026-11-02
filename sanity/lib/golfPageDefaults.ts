/**
 * The Golf page's own sections (the hero lives in Page Heroes → Golf), as the
 * site shipped them. Pre-fills the Studio doc (scripts/seed-golf-page.ts) and
 * stands in for any field left empty there.
 */
export const GOLF_PAGE_ID = 'golfPage'

export const GOLF_PAGE_DEFAULTS = {
  about: {
    eyebrow: { en: 'About golf at Casa de Campo', es: 'El golf en Casa de Campo' },
    title: { en: 'More Than a Golf Destination', es: 'Mucho Más que un Destino de Golf' },
    body: {
      en: 'Golf has been part of Casa de Campo’s identity for more than five decades.\n\nWhat began with the opening of Teeth of the Dog in 1971 transformed a quiet corner of the Dominican coastline into one of the most respected golf destinations in the world. Designed by legendary architect Pete Dye, the resort’s collection of championship courses has welcomed generations of players drawn by a rare combination of challenge, beauty, and Caribbean hospitality.\n\nToday, Casa de Campo is home to 63 holes of championship golf, including courses consistently ranked among the finest in the Caribbean and Latin America. Whether playing along dramatic oceanfront cliffs, above the Chavón River, or across rolling fairways inspired by the great links courses of Scotland, every round offers a distinctly different perspective of the destination.',
      es: 'El golf forma parte de la identidad de Casa de Campo desde hace más de cinco décadas.\n\nLo que comenzó con la inauguración de Teeth of the Dog en 1971 transformó un tranquilo rincón de la costa dominicana en uno de los destinos de golf más reconocidos del mundo. Diseñados por el legendario arquitecto Pete Dye, los campos de Casa de Campo han atraído durante generaciones a jugadores que buscan una combinación única de desafío, belleza natural y hospitalidad caribeña.\n\nHoy, Casa de Campo cuenta con 63 hoyos de campeonato, incluyendo campos considerados entre los mejores del Caribe y Latinoamérica. Ya sea jugando junto al mar Caribe, sobre los acantilados del río Chavón o recorriendo fairways inspirados en los clásicos links escoceses, cada recorrido revela una faceta distinta del destino.',
    },
  },
}
