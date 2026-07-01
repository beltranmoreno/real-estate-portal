import {defineType, defineField} from 'sanity'
import {bilingualTextField, slugField, imageField, seoFields} from '../../lib/schemaHelpers'

export const area = defineType({
  name: 'area',
  title: 'Areas',
  type: 'document',
  fields: [
    ...bilingualTextField('title', 'Area Name', {required: true}),
    slugField('title_en'),
    
    ...bilingualTextField('description', 'Description', {
      rows: 4,
      description: 'Brief description of the area',
    }),

    imageField('coverImage', 'Cover Image', {
      description: 'Main image for the area (used in area cards)',
    }),

    defineField({
      name: 'gallery',
      title: 'Gallery',
      type: 'array',
      of: [imageField('image', 'Image')],
      description: 'Additional images showcasing the area',
    }),

    defineField({
      name: 'region',
      title: 'Region',
      type: 'string',
      options: {
        list: [
          {title: 'La Romana', value: 'la-romana'},
          {title: 'Punta Cana', value: 'punta-cana'},
          {title: 'Santo Domingo', value: 'santo-domingo'},
          {title: 'Puerto Plata', value: 'puerto-plata'},
          {title: 'Samaná', value: 'samana'},
          {title: 'Santiago', value: 'santiago'},
          {title: 'Bayahibe', value: 'bayahibe'},
          {title: 'Juan Dolio', value: 'juan-dolio'},
          {title: 'Las Terrenas', value: 'las-terrenas'},
          {title: 'Cabarete', value: 'cabarete'},
          {title: 'Sosúa', value: 'sosua'},
        ],
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'coordinates',
      title: 'Center Coordinates',
      type: 'geopoint',
      description: 'Center point for map display',
    }),

    defineField({
      name: 'mapZoom',
      title: 'Default Map Zoom Level',
      type: 'number',
      validation: (Rule) => Rule.min(1).max(20),
      initialValue: 12,
    }),

    defineField({
      name: 'sectorBoundary',
      title: 'Sector boundary (GeoJSON)',
      type: 'text',
      rows: 4,
      description:
        'Optional. Paste a GeoJSON Polygon/MultiPolygon (e.g. draw the sector at geojson.io and copy the result) to outline this sector on property maps when a listing is set to "Show area / sector only". If empty, the circle radius below is used instead.',
      validation: (Rule) =>
        Rule.custom((value) => {
          if (!value || (typeof value === 'string' && !value.trim())) return true
          let parsed: any
          try {
            parsed = JSON.parse(value as string)
          } catch {
            return 'Not valid JSON. Paste the GeoJSON exactly as exported.'
          }
          const types = new Set<string>()
          const collect = (node: any) => {
            if (!node || typeof node !== 'object') return
            if (node.type === 'FeatureCollection') (node.features || []).forEach(collect)
            else if (node.type === 'Feature') collect(node.geometry)
            else if (node.type) types.add(node.type)
          }
          collect(parsed)
          if (!types.has('Polygon') && !types.has('MultiPolygon')) {
            return 'GeoJSON must contain a Polygon or MultiPolygon.'
          }
          return true
        }),
    }),

    defineField({
      name: 'sectorRadiusKm',
      title: 'Sector highlight radius (km)',
      type: 'number',
      validation: (Rule) => Rule.min(0.1).max(10),
      initialValue: 0.6,
      description:
        'Fallback radius for the shaded circle shown when "Show area / sector only" is set and no Sector boundary above is drawn. Larger = more approximate.',
    }),

    ...bilingualTextField('highlights', 'Area Highlights', {
      rows: 5,
      description: 'Key features and attractions of this area',
    }),

    defineField({
      name: 'amenityHighlights',
      title: 'Amenity Highlights',
      type: 'array',
      of: [{type: 'string'}],
      options: {
        list: [
          {title: 'Beach Access', value: 'beach'},
          {title: 'Golf Courses', value: 'golf'},
          {title: 'Marina', value: 'marina'},
          {title: 'Shopping', value: 'shopping'},
          {title: 'Restaurants', value: 'restaurants'},
          {title: 'Nightlife', value: 'nightlife'},
          {title: 'Airport Nearby', value: 'airport'},
          {title: 'Medical Facilities', value: 'medical'},
          {title: 'Schools', value: 'schools'},
          {title: 'Gated Community', value: 'gated'},
        ],
      },
    }),

    defineField({
      name: 'popularFor',
      title: 'Popular For',
      type: 'array',
      of: [{type: 'string'}],
      options: {
        list: [
          {title: 'Families', value: 'family'},
          {title: 'Golf', value: 'golf'},
          {title: 'Beach', value: 'beach'},
          {title: 'Remote Work', value: 'remote-work'},
          {title: 'Events', value: 'events'},
          {title: 'Luxury', value: 'luxury'},
          {title: 'Budget', value: 'budget'},
          {title: 'Long-term Stays', value: 'long-term'},
        ],
      },
      description: 'What this area is popular for',
    }),

    defineField({
      name: 'airports',
      title: 'Nearby Airports',
      type: 'array',
      description: 'Airports serving this area, with distance and drive time.',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'name',
              title: 'Airport',
              type: 'string',
              description: 'e.g. "La Romana (LRM)" or "Punta Cana (PUJ)"',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'distanceKm',
              title: 'Distance (km)',
              type: 'number',
              validation: (Rule) => Rule.min(0),
            },
            {
              name: 'driveTime',
              title: 'Drive Time (minutes)',
              type: 'number',
              validation: (Rule) => Rule.min(0),
            },
          ],
          preview: {
            select: {title: 'name', distance: 'distanceKm', drive: 'driveTime'},
            prepare({title, distance, drive}) {
              const parts = [
                distance ? `${distance} km` : null,
                drive ? `${drive} min` : null,
              ].filter(Boolean)
              return {
                title: title || 'Airport',
                subtitle: parts.join(' · ') || undefined,
              }
            },
          },
        },
      ],
    }),

    defineField({
      name: 'weatherInfo',
      title: 'Weather Information',
      type: 'object',
      fields: [
        ...bilingualTextField('bestTime', 'Best Time to Visit', {rows: 2}),
        {
          name: 'averageTemp',
          title: 'Average Temperature (°C)',
          type: 'object',
          fields: [
            {name: 'summer', title: 'Summer', type: 'number'},
            {name: 'winter', title: 'Winter', type: 'number'},
          ],
        },
      ],
    }),

    defineField({
      name: 'isPopular',
      title: 'Popular Area',
      type: 'boolean',
      initialValue: false,
      description: 'Show this area prominently on homepage',
    }),

    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      validation: (Rule) => Rule.integer(),
      description: 'Order in which areas appear (lower numbers first)',
    }),

    ...seoFields(),
  ],

  preview: {
    select: {
      title: 'title_en',
      subtitle: 'region',
      media: 'coverImage',
      popular: 'isPopular',
    },
    prepare({title, subtitle, media, popular}) {
      return {
        title: `${popular ? '⭐ ' : ''}${title}`,
        subtitle,
        media,
      }
    },
  },
})