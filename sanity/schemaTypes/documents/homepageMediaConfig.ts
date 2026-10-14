import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'homepageMediaConfig',
  title: 'Homepage Media Configuration',
  type: 'document',
  icon: () => '🏠',
  fields: [
    defineField({
      name: 'title',
      title: 'Configuration Name',
      type: 'string',
      initialValue: 'Homepage Media Settings',
      readOnly: true
    }),

    // ─────────────── Hero background ───────────────
    defineField({
      name: 'heroMediaType',
      title: 'Hero background — type',
      type: 'string',
      description: 'Use image(s) now; switch to Video later without code changes.',
      options: {
        list: [
          { title: 'Image(s)', value: 'image' },
          { title: 'Video', value: 'video' }
        ],
        layout: 'radio'
      },
      initialValue: 'image'
    }),

    defineField({
      name: 'heroImages',
      title: 'Hero background image(s)',
      type: 'array',
      description:
        'The first image is the background. Add more than one and they cross-fade as a slideshow.',
      of: [
        {
          type: 'image',
          options: { hotspot: true, metadata: ['blurhash', 'lqip'] },
          fields: [
            { name: 'alt', type: 'string', title: 'Alternative text' }
          ]
        }
      ],
      hidden: ({ parent }) => parent?.heroMediaType === 'video'
    }),

    defineField({
      name: 'heroVideoUrl',
      title: 'Hero background video URL',
      type: 'url',
      description:
        'Direct MP4 / hosted video URL (e.g. a Mux or CDN link). Used when the type is Video.',
      hidden: ({ parent }) => parent?.heroMediaType !== 'video'
    }),

    defineField({
      name: 'heroOverlay',
      title: 'Overlay darkness (0–70%)',
      type: 'number',
      description:
        'Darkens the background a touch so the search bar stays readable. 20 is a good default.',
      initialValue: 20,
      validation: Rule => Rule.min(0).max(70).integer()
    }),

    defineField({
      name: 'maxItems',
      title: 'Homepage carousel — maximum photos',
      type: 'number',
      description: 'How many Featured Media photos the homepage carousel shows, in their Order.',
      validation: Rule => Rule.min(6).max(20).integer(),
      initialValue: 12
    })
  ],

  preview: {
    prepare() {
      return { title: 'Homepage Media Configuration' }
    }
  }
})