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
      required: true,
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
      name: 'distanceFromAirport',
      title: 'Distance from Airport',
      type: 'object',
      fields: [
        {
          name: 'airport',
          title: 'Airport Name',
          type: 'string',
        },
        {
          name: 'distance',
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