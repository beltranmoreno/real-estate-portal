import { defineField, defineType } from 'sanity'
import { bilingualTextField } from '../../lib/schemaHelpers'

export default defineType({
  name: 'featuredMedia',
  title: 'Featured Media',
  type: 'document',
  icon: () => '📸',
  fields: [
    // Basic Info
    ...bilingualTextField('title', 'Media Title', { required: true }),
    ...bilingualTextField('description', 'Description', { rows: 3 }),

    defineField({
      name: 'mediaType',
      title: 'Media Type',
      type: 'string',
      options: {
        list: [
          { title: 'Image', value: 'image' },
          { title: 'Video', value: 'video' }
        ]
      },
      validation: Rule => Rule.required()
    }),

    // Image field (only shown for image type)
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
          validation: Rule => Rule.required()
        }
      ],
      hidden: ({ parent }) => parent?.mediaType !== 'image',
      validation: Rule => Rule.custom((image, context) => {
        const { parent } = context
        if (parent?.mediaType === 'image' && !image) {
          return 'Image is required when media type is image'
        }
        return true
      })
    }),

    // Video fields (only shown for video type)
    defineField({
      name: 'videoUrl',
      title: 'Video URL',
      type: 'url',
      description: 'YouTube, Vimeo, or direct video URL',
      hidden: ({ parent }) => parent?.mediaType !== 'video',
      validation: Rule => Rule.custom((url, context) => {
        const { parent } = context
        if (parent?.mediaType === 'video' && !url) {
          return 'Video URL is required when media type is video'
        }
        return true
      })
    }),

    defineField({
      name: 'videoThumbnail',
      title: 'Video Thumbnail',
      type: 'image',
      options: {
        hotspot: true,
        metadata: ['blurhash', 'lqip', 'palette']
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative text'
        }
      ],
      hidden: ({ parent }) => parent?.mediaType !== 'video',
      description: 'Custom thumbnail for video (optional - will use video platform thumbnail if not provided)'
    }),

    defineField({
      name: 'videoDuration',
      title: 'Video Duration (seconds)',
      type: 'number',
      hidden: ({ parent }) => parent?.mediaType !== 'video',
      validation: Rule => Rule.min(0).integer()
    }),

    // Topic Tags
    defineField({
      name: 'topics',
      title: 'Topics/Tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'Golf', value: 'golf' },
          { title: 'Beach', value: 'beach' },
          { title: 'Activities', value: 'activities' },
          { title: 'Restaurants', value: 'restaurants' },
          { title: 'Properties', value: 'properties' },
          { title: 'Lifestyle', value: 'lifestyle' },
          { title: 'Sports', value: 'sports' },
          { title: 'Nature', value: 'nature' },
          { title: 'Luxury', value: 'luxury' },
          { title: 'Family', value: 'family' },
          { title: 'Romance', value: 'romance' },
          { title: 'Adventure', value: 'adventure' },
          { title: 'Relaxation', value: 'relaxation' },
          { title: 'Nightlife', value: 'nightlife' },
          { title: 'Culture', value: 'culture' },
          { title: 'Wellness', value: 'wellness' },
          { title: 'Water Sports', value: 'water-sports' },
          { title: 'Events', value: 'events' }
        ]
      },
      validation: Rule => Rule.required().min(1).error('Please select at least one topic')
    }),

    // Featured & Priority
    defineField({
      name: 'isFeatured',
      title: 'Featured Media',
      type: 'boolean',
      initialValue: false,
      description: 'Mark as featured to prioritize in galleries'
    }),

    defineField({
      name: 'priority',
      title: 'Display Priority',
      type: 'number',
      validation: Rule => Rule.min(0).max(100).integer(),
      initialValue: 50,
      description: 'Higher numbers appear first (0-100)'
    }),

    // Location Context
    defineField({
      name: 'location',
      title: 'Location Context',
      type: 'string',
      options: {
        list: [
          { title: 'Casa de Campo Resort', value: 'casa-de-campo' },
          { title: 'La Romana', value: 'la-romana' },
          { title: 'Bayahibe', value: 'bayahibe' },
          { title: 'Saona Island', value: 'saona-island' },
          { title: 'Catalina Island', value: 'catalina-island' },
          { title: 'Altos de Chavon', value: 'altos-de-chavon' },
          { title: 'Other', value: 'other' }
        ]
      }
    }),

    // Publication Status
    defineField({
      name: 'status',
      title: 'Publication Status',
      type: 'string',
      options: {
        list: [
          { title: 'Published', value: 'published' },
          { title: 'Draft', value: 'draft' },
          { title: 'Archived', value: 'archived' }
        ]
      },
      initialValue: 'published',
      validation: Rule => Rule.required()
    }),

    // Technical metadata
    defineField({
      name: 'photographer',
      title: 'Photographer/Videographer',
      type: 'string',
      description: 'Credit for the media creator'
    }),

    defineField({
      name: 'captureDate',
      title: 'Capture Date',
      type: 'date',
      description: 'When the media was captured'
    }),

    // Usage Rights
    defineField({
      name: 'usageRights',
      title: 'Usage Rights',
      type: 'string',
      options: {
        list: [
          { title: 'Full Rights', value: 'full' },
          { title: 'Limited Use', value: 'limited' },
          { title: 'Attribution Required', value: 'attribution' }
        ]
      },
      initialValue: 'full'
    })
  ],

  preview: {
    select: {
      title: 'title_en',
      subtitle: 'mediaType',
      media: 'image',
      videoThumbnail: 'videoThumbnail',
      topics: 'topics',
      featured: 'isFeatured',
      status: 'status'
    },
    prepare({ title, subtitle, media, videoThumbnail, topics, featured, status }) {
      const topicsList = topics ? topics.slice(0, 3).join(', ') : ''
      const featuredText = featured ? 'Featured' : ''
      const statusEmoji = status === 'published' ? '✅' : status === 'draft' ? '📝' : '📦'
      
      return {
        title: `${statusEmoji} ${title}`,
        subtitle: `${subtitle?.toUpperCase()} • ${featuredText} • ${topicsList}`,
        media: media || videoThumbnail
      }
    }
  },

  orderings: [
    {
      title: 'Priority (High to Low)',
      name: 'priorityDesc',
      by: [
        { field: 'priority', direction: 'desc' },
        { field: 'title_en', direction: 'asc' }
      ]
    },
    {
      title: 'Featured First',
      name: 'featuredFirst',
      by: [
        { field: 'isFeatured', direction: 'desc' },
        { field: 'priority', direction: 'desc' },
        { field: 'title_en', direction: 'asc' }
      ]
    }
  ]
})