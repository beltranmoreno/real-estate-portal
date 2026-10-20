import {defineType, defineField} from 'sanity'
import {imageField} from '../../lib/schemaHelpers'
import {PAGE_HEROES, type PageHeroKey} from '../../lib/pageHeroDefaults'

const linkRule = (Rule: any) =>
  Rule.custom((v?: string) =>
    !v || /^(\/|#|https?:\/\/|mailto:|tel:)/.test(v)
      ? true
      : 'Use a path (/contact), an anchor (#contact) or a full link (https://…)'
  )

/**
 * The hero of one site page (Concierge, Restaurants, Golf, Contact, About,
 * Owners). One fixed document per page, listed under "Page Heroes" in Studio.
 * Without media the page keeps its editorial text hero; with photos (one or a
 * slideshow) or a video, the media becomes the background (or the band under
 * the text on About/Owners).
 */
export const pageHero = defineType({
  name: 'pageHero',
  title: 'Page Hero',
  type: 'document',
  icon: () => '🖼️',
  groups: [
    {name: 'text', title: 'Text', default: true},
    {name: 'background', title: 'Background'},
    {name: 'buttons', title: 'Buttons'},
  ],
  fields: [
    defineField({name: 'eyebrow_en', title: 'Small label above the title (English)', type: 'string', group: 'text'}),
    defineField({name: 'eyebrow_es', title: 'Small label above the title (Spanish)', type: 'string', group: 'text'}),
    defineField({
      name: 'title_en',
      title: 'Title (English)',
      type: 'text',
      rows: 2,
      group: 'text',
      description: 'Wrap words in *asterisks* to set them in italic.',
    }),
    defineField({name: 'title_es', title: 'Title (Spanish)', type: 'text', rows: 2, group: 'text'}),
    defineField({
      name: 'subtitle_en',
      title: 'Subtitle (English)',
      type: 'text',
      rows: 3,
      group: 'text',
      description: 'Leave empty to hide it.',
    }),
    defineField({name: 'subtitle_es', title: 'Subtitle (Spanish)', type: 'text', rows: 3, group: 'text'}),

    defineField({
      name: 'images',
      title: 'Background photos',
      type: 'array',
      group: 'background',
      description:
        'Optional. One photo, or several to cross-fade as a slideshow. With photos the hero becomes full-width with white text (on About and For owners they show as a band under the text).',
      of: [
        {
          type: 'image',
          options: {hotspot: true, metadata: ['blurhash', 'lqip']},
          fields: [{name: 'alt', type: 'string', title: 'Alternative text'}],
        },
      ],
    }),
    defineField({
      name: 'videoUrl',
      title: 'Background video',
      type: 'url',
      group: 'background',
      description:
        'Optional. A direct MP4 or hosted video link (e.g. Mux, a CDN). When set, the video plays instead of the photos — the first photo is shown while it loads.',
    }),
    // Single-photo field from the first version — still read, no longer shown.
    {...imageField('image', 'Background photo (legacy)'), group: 'background', hidden: true},
    defineField({
      name: 'overlay',
      title: 'Darken the photo (0–70%)',
      type: 'number',
      group: 'background',
      initialValue: 35,
      validation: (Rule) => Rule.min(0).max(70).integer(),
      description: 'Keeps white text readable over bright photos.',
    }),

    defineField({name: 'primaryLabel_en', title: 'Main button — label (English)', type: 'string', group: 'buttons', description: 'Leave empty to hide the button.'}),
    defineField({name: 'primaryLabel_es', title: 'Main button — label (Spanish)', type: 'string', group: 'buttons'}),
    defineField({name: 'primaryHref', title: 'Main button — link', type: 'string', group: 'buttons', validation: linkRule}),
    defineField({name: 'secondaryLabel_en', title: 'Second button — label (English)', type: 'string', group: 'buttons', description: 'Optional.'}),
    defineField({name: 'secondaryLabel_es', title: 'Second button — label (Spanish)', type: 'string', group: 'buttons'}),
    defineField({name: 'secondaryHref', title: 'Second button — link', type: 'string', group: 'buttons', validation: linkRule}),
  ],

  preview: {
    select: {id: '_id', title: 'title_en', media: 'images.0'},
    prepare({id, title, media}) {
      const key = String(id || '').replace(/^drafts\./, '').replace(/^pageHero-/, '') as PageHeroKey
      const page = PAGE_HEROES[key]
      return {
        title: page ? page.label : 'Page hero',
        subtitle: page ? `${page.path} · ${(title || '').replace(/\*/g, '')}` : title,
        media,
      }
    },
  },
})
