import { defineField, defineType } from 'sanity'

/**
 * A photo for the homepage carousel. Just the image and, optionally, where in
 * Casa de Campo it was taken (a Map Attraction); the location's name doubles
 * as the caption shown on hover.
 */
export default defineType({
  name: 'featuredMedia',
  title: 'Featured Media',
  type: 'document',
  icon: () => '📸',
  fields: [
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {
        hotspot: true,
        metadata: ['blurhash', 'lqip', 'palette']
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative text',
          description: 'Optional. Describe the photo for screen readers; the location is used if empty.'
        }
      ],
      validation: Rule => Rule.required()
    }),

    defineField({
      name: 'location',
      title: 'Location',
      type: 'reference',
      to: [{ type: 'attraction' }],
      description: 'Optional. Where in Casa de Campo the photo was taken, shown as its caption. Locations are managed under Map Attractions.',
      options: {
        disableNew: true,
        filter: 'category != "airport"'
      }
    }),

    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
      description: 'Position in the homepage carousel. Lower numbers come first; photos without a number go last, newest first.',
      validation: Rule => Rule.integer().min(0)
    })
  ],

  preview: {
    select: {
      location: 'location.name_en',
      order: 'order',
      media: 'image'
    },
    prepare({ location, order, media }) {
      return {
        title: location || 'Photo',
        subtitle: typeof order === 'number' ? `Order ${order}` : undefined,
        media
      }
    }
  },

  orderings: [
    {
      title: 'Carousel order',
      name: 'orderAsc',
      by: [
        { field: 'order', direction: 'asc' },
        { field: '_createdAt', direction: 'desc' }
      ]
    },
    {
      title: 'Newest first',
      name: 'createdDesc',
      by: [{ field: '_createdAt', direction: 'desc' }]
    }
  ]
})
