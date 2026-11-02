import {defineType, defineField, defineArrayMember} from 'sanity'

const linkRule = (Rule: any) =>
  Rule.custom((v?: string) =>
    !v || /^(\/|#|https?:\/\/|mailto:|tel:)/.test(v)
      ? true
      : 'Use a path (/contact), an anchor (#contact) or a full link (https://…)'
  )

// English + Spanish pair of a text field, in one group.
const bi = (name: string, title: string, group: string, opts: {rows?: number; description?: string} = {}) => [
  defineField({
    name: `${name}_en`,
    title: `${title} (English)`,
    type: opts.rows ? 'text' : 'string',
    ...(opts.rows ? {rows: opts.rows} : {}),
    group,
    description: opts.description,
  }),
  defineField({
    name: `${name}_es`,
    title: `${title} (Spanish)`,
    type: opts.rows ? 'text' : 'string',
    ...(opts.rows ? {rows: opts.rows} : {}),
    group,
  }),
]

const photo = (name: string, title: string, group: string, description?: string) =>
  defineField({
    name,
    title,
    type: 'image',
    group,
    description,
    options: {hotspot: true},
    fields: [{name: 'alt', type: 'string', title: 'Alternative text'}],
  })

// A dated photo: archive pictures and Leticia's childhood photos.
const datedPhoto = defineArrayMember({
  type: 'object',
  name: 'datedPhoto',
  fields: [
    {name: 'image', title: 'Photo', type: 'image', options: {hotspot: true}, validation: (Rule: any) => Rule.required()},
    {name: 'year', title: 'Year', type: 'string', description: 'Shown on the photo, e.g. "1974" or "c. 1980".'},
    {name: 'caption_en', title: 'Caption (English)', type: 'string', description: 'Optional.'},
    {name: 'caption_es', title: 'Caption (Spanish)', type: 'string'},
  ],
  preview: {
    select: {year: 'year', caption: 'caption_en', media: 'image'},
    prepare: ({year, caption, media}) => ({title: year || 'No year', subtitle: caption, media}),
  },
})

/**
 * The Casa de Campo page (/casa-de-campo; The Resort in the nav). One fixed
 * document, listed under Page Heroes. Empty text fields fall back to the
 * launch copy; sections without photos simply show their text.
 */
export const casaDeCampoPage = defineType({
  name: 'casaDeCampoPage',
  title: 'Casa de Campo page',
  type: 'document',
  icon: () => '🏝️',
  groups: [
    {name: 'hero', title: 'Intro', default: true},
    {name: 'story', title: 'The story'},
    {name: 'archive', title: 'Archives'},
    {name: 'personal', title: 'Personal'},
    {name: 'cta', title: 'Closing'},
  ],
  fields: [
    // Intro
    ...bi('heroEyebrow', 'Small label above the title', 'hero'),
    ...bi('heroTitle', 'Title', 'hero', {rows: 2, description: 'Press Enter to start a new line.'}),
    ...bi('heroIntro', 'Intro', 'hero', {rows: 5}),
    defineField({
      name: 'heroImages',
      title: 'Background photos',
      type: 'array',
      group: 'hero',
      description: 'Optional. One photo, or several to cross-fade. With photos the intro becomes full-width with white text.',
      of: [{type: 'image', options: {hotspot: true}, fields: [{name: 'alt', type: 'string', title: 'Alternative text'}]}],
    }),
    defineField({
      name: 'heroOverlay',
      title: 'Darken the photo (0–70%)',
      type: 'number',
      group: 'hero',
      initialValue: 35,
      validation: (Rule) => Rule.min(0).max(70).integer(),
    }),

    // The story
    ...bi('storyEyebrow', 'Small label', 'story'),
    ...bi('storyTitle', 'Title', 'story', {rows: 2}),
    ...bi('storyBody', 'Text', 'story', {rows: 6, description: 'Leave a blank line between paragraphs.'}),
    photo('storyImage', 'Photo', 'story', 'Optional. Shown beside the text.'),

    // Archives
    ...bi('archiveEyebrow', 'Small label', 'archive'),
    ...bi('archiveTitle', 'Title', 'archive', {rows: 2}),
    ...bi('archiveIntro', 'Intro', 'archive', {rows: 4}),
    defineField({
      name: 'archivePhotos',
      title: 'Archive photos',
      type: 'array',
      group: 'archive',
      description: 'In the order they should appear. Add the year to each one.',
      of: [datedPhoto],
    }),

    // Personal
    ...bi('personalEyebrow', 'Small label', 'personal'),
    ...bi('personalTitle', 'Title', 'personal', {rows: 2}),
    ...bi('personalBody', 'Text', 'personal', {rows: 10, description: 'Leave a blank line between paragraphs.'}),
    defineField({
      name: 'personalPhotos',
      title: 'Photos',
      type: 'array',
      group: 'personal',
      description: 'Up to three. The first is shown largest.',
      of: [datedPhoto],
      validation: (Rule) => Rule.max(3),
    }),
    defineField({name: 'personalName', title: 'Signature — name', type: 'string', group: 'personal'}),
    ...bi('personalRole', 'Signature — role', 'personal'),

    // Closing
    photo('ctaImage', 'Photo', 'cta', 'Shown beside the closing text.'),
    ...bi('ctaEyebrow', 'Small label', 'cta'),
    ...bi('ctaTitle', 'Title', 'cta', {rows: 2}),
    ...bi('ctaBody', 'Text', 'cta', {rows: 3}),
    ...bi('ctaButtonLabel', 'Button — label', 'cta'),
    defineField({name: 'ctaButtonHref', title: 'Button — link', type: 'string', group: 'cta', validation: linkRule}),
  ],
  preview: {
    prepare: () => ({title: 'Casa de Campo page', subtitle: '/casa-de-campo'}),
  },
})
