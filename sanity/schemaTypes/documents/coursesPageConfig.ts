import { defineField, defineType } from 'sanity'

/**
 * Singleton configuration for the /courses index hero. Lets an editor set a
 * background image (or slideshow) or video behind the golf landing hero,
 * plus optional bilingual copy overrides. Mirrors the homepageMediaConfig
 * hero fields so the switch from image → video is a content change, not code.
 */
export default defineType({
  name: 'coursesPageConfig',
  title: 'Golf Page',
  type: 'document',
  icon: () => '⛳',
  fields: [
    defineField({
      name: 'title',
      title: 'Configuration Name',
      type: 'string',
      initialValue: 'Golf Page Settings',
      readOnly: true,
    }),

    // ─────────────── Hero background ───────────────
    defineField({
      name: 'heroMediaType',
      title: 'Hero background — type',
      type: 'string',
      description: 'Use image(s) now; switch to Video later without code changes.',
      options: {
        list: [
          { title: 'None (plain surface)', value: 'none' },
          { title: 'Image(s)', value: 'image' },
          { title: 'Video', value: 'video' },
        ],
        layout: 'radio',
      },
      initialValue: 'none',
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
          fields: [{ name: 'alt', type: 'string', title: 'Alternative text' }],
        },
      ],
      hidden: ({ parent }) => parent?.heroMediaType !== 'image',
    }),

    defineField({
      name: 'heroVideoUrl',
      title: 'Hero background video URL',
      type: 'url',
      description: 'Direct MP4 / hosted video URL (e.g. a Mux or CDN link). Used when the type is Video.',
      hidden: ({ parent }) => parent?.heroMediaType !== 'video',
    }),

    defineField({
      name: 'heroOverlay',
      title: 'Overlay darkness (0–80%)',
      type: 'number',
      description: 'Darkens the background so the headline stays readable. 35 is a good default over photos.',
      initialValue: 35,
      validation: (Rule) => Rule.min(0).max(80).integer(),
      hidden: ({ parent }) => parent?.heroMediaType === 'none',
    }),

    // ─────────────── Optional copy overrides ───────────────
    defineField({
      name: 'eyebrow_en',
      title: 'Eyebrow (EN)',
      type: 'string',
      description: 'Small label above the headline. Leave blank to use the default.',
    }),
    defineField({
      name: 'eyebrow_es',
      title: 'Eyebrow (ES)',
      type: 'string',
    }),
    defineField({
      name: 'heading_en',
      title: 'Headline (EN)',
      type: 'text',
      rows: 2,
      description: 'Leave blank to use the built-in default headline.',
    }),
    defineField({
      name: 'heading_es',
      title: 'Headline (ES)',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'subheading_en',
      title: 'Subheading (EN)',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'subheading_es',
      title: 'Subheading (ES)',
      type: 'text',
      rows: 3,
    }),
  ],

  preview: {
    select: { mediaType: 'heroMediaType', media: 'heroImages.0' },
    prepare({ mediaType, media }) {
      return {
        title: 'Golf Page',
        subtitle: `Hero background: ${mediaType || 'none'}`,
        media,
      }
    },
  },
})
