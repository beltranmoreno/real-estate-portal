import {defineType, defineField} from 'sanity'
import {imageField} from '../../lib/schemaHelpers'
import {PAGE_HEROES, pageHeroId, type PageHeroKey} from '../../lib/pageHeroDefaults'

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
/** Pages whose intro text stays in the hero (no label / title). */
const HERO_ONLY_INTRO = ['pageHero-about', 'pageHero-owners', 'pageHero-search']

export const pageHero = defineType({
  name: 'pageHero',
  title: 'Page Hero',
  type: 'document',
  icon: () => '🖼️',
  groups: [
    {name: 'text', title: 'Text', default: true},
    {name: 'intro', title: 'Intro section'},
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
      description: 'Wrap words in *asterisks* to set them in italic. Press Enter to start a new line.',
    }),
    defineField({name: 'title_es', title: 'Title (Spanish)', type: 'text', rows: 2, group: 'text'}),
    // The intro: on most pages the first section under the hero (small label
    // and title on the left, text on the right). About, For owners and Search
    // keep it in the hero, so they don't use the label / title.
    defineField({
      name: 'introEyebrow_en',
      title: 'Small label (English)',
      type: 'string',
      group: 'intro',
      description: 'The intro is the first section under the hero, laid out like the sections below it. Leave label and title empty to use the launch wording.',
      hidden: ({document}) => HERO_ONLY_INTRO.includes(String(document?._id ?? '').replace(/^drafts\./, '')),
    }),
    defineField({name: 'introEyebrow_es', title: 'Small label (Spanish)', type: 'string', group: 'intro', hidden: ({document}) => HERO_ONLY_INTRO.includes(String(document?._id ?? '').replace(/^drafts\./, ''))}),
    defineField({
      name: 'introTitle_en',
      title: 'Title (English)',
      type: 'text',
      rows: 2,
      group: 'intro',
      hidden: ({document}) => HERO_ONLY_INTRO.includes(String(document?._id ?? '').replace(/^drafts\./, '')),
    }),
    defineField({name: 'introTitle_es', title: 'Title (Spanish)', type: 'text', rows: 2, group: 'intro', hidden: ({document}) => HERO_ONLY_INTRO.includes(String(document?._id ?? '').replace(/^drafts\./, ''))}),
    defineField({
      name: 'subtitle_en',
      title: 'Text (English)',
      type: 'text',
      rows: 5,
      group: 'intro',
      description: 'Leave a blank line between paragraphs. Leave empty to hide the intro. (On About, For owners and Search this text sits in the hero.)',
    }),
    defineField({name: 'subtitle_es', title: 'Text (Spanish)', type: 'text', rows: 5, group: 'intro'}),

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
    // Upload is About-only for now; other pages use the link below.
    defineField({
      name: 'videoFile',
      title: 'Background video (upload)',
      type: 'file',
      group: 'background',
      options: {accept: 'video/mp4,video/webm'},
      hidden: ({document}) => String(document?._id ?? '').replace(/^drafts\./, '') !== pageHeroId('about'),
      description:
        'Optional. Plays instead of the photos, and before the link below. Use a short silent loop: MP4 (H.264), 1080p, "web optimized", ideally under 10 MB. Keep a photo too — it shows while the video loads.',
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
      title: 'Darken behind the text (0–70%)',
      type: 'number',
      group: 'background',
      initialValue: 35,
      validation: (Rule) => Rule.min(0).max(70).integer(),
      description: 'How dark the bottom of the photo gets, behind the text. The top stays clear.',
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
