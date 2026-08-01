import {defineType, defineField} from 'sanity'
import {bilingualTextField, slugField} from '../../lib/schemaHelpers'

/**
 * A resort landmark / point of interest shown as an extra pin on property
 * maps — La Marina, Altos de Chavón, Minitas Beach Club, the golf courses,
 * the airport, etc. Resort-wide: every property map shows all active ones.
 * The category drives the pin colour; the popover shows the name, blurb, and
 * an optional photo.
 */
export const attraction = defineType({
  name: 'attraction',
  title: 'Map Attraction',
  type: 'document',
  icon: () => '📍',
  fields: [
    ...bilingualTextField('name', 'Name', {required: true}),

    slugField('name_en'),

    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      description: 'Drives the pin colour and grouping.',
      options: {
        list: [
          {title: 'Marina', value: 'marina'},
          {title: 'Beach club', value: 'beach_club'},
          {title: 'Culture (e.g. Altos de Chavón)', value: 'culture'},
          {title: 'Dining', value: 'dining'},
          {title: 'Golf', value: 'golf'},
          {title: 'Activity (horseback, shooting, tennis…)', value: 'activity'},
          {title: 'Shopping', value: 'shopping'},
          {title: 'Airport', value: 'airport'},
          {title: 'Other', value: 'other'},
        ],
      },
      initialValue: 'other',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'coordinates',
      title: 'Coordinates',
      type: 'object',
      description: 'Pin location. Copy lat/long from Google Maps.',
      fields: [
        {
          name: 'lat',
          title: 'Latitude',
          type: 'number',
          validation: (Rule) => Rule.required().min(-90).max(90),
        },
        {
          name: 'lng',
          title: 'Longitude',
          type: 'number',
          validation: (Rule) => Rule.required().min(-180).max(180),
        },
      ],
      validation: (Rule) => Rule.required(),
    }),

    ...bilingualTextField('shortDescription', 'Short description', {
      rows: 2,
      description: 'One- or two-line blurb shown in the map popover.',
    }),

    defineField({
      name: 'images',
      title: 'Photos',
      type: 'array',
      description:
        'Optional. Shown in the map popover — the first is the hero, the rest as thumbnails.',
      of: [
        {
          type: 'image',
          options: {hotspot: true, metadata: ['blurhash', 'lqip']},
          fields: [
            {
              name: 'alt',
              title: 'Alternative text',
              type: 'string',
              description: 'Important for SEO and accessibility',
            },
          ],
        },
      ],
    }),

    defineField({
      name: 'link',
      title: 'Link (optional)',
      type: 'url',
      description: 'Optional "Learn more" URL shown in the popover.',
    }),

    defineField({
      name: 'isActive',
      title: 'Active',
      type: 'boolean',
      initialValue: true,
      description: 'Hide this pin from all maps when off.',
    }),

    defineField({
      name: 'order',
      title: 'Display order',
      type: 'number',
      description: 'Lower numbers appear first in legends/lists.',
    }),
  ],

  preview: {
    select: {title: 'name_en', subtitle: 'category', media: 'images.0', active: 'isActive'},
    prepare({title, subtitle, media, active}) {
      return {
        title: active === false ? `${title} (inactive)` : title,
        subtitle,
        media,
      }
    },
  },

  orderings: [
    {
      title: 'Category, then order',
      name: 'categoryOrder',
      by: [
        {field: 'category', direction: 'asc'},
        {field: 'order', direction: 'asc'},
        {field: 'name_en', direction: 'asc'},
      ],
    },
  ],
})
