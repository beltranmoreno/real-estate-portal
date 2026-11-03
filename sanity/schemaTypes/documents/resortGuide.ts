import {defineType, defineField, defineArrayMember} from 'sanity'

const linkRule = (Rule: any) =>
  Rule.custom((v?: string) =>
    !v || /^(\/|#|https?:\/\/|mailto:|tel:)/.test(v)
      ? true
      : 'Use a path (/restaurants), an anchor (#marina-guide) or a full link (https://…)'
  )

// English + Spanish pair. `rows` makes it a multi-line text field.
const bi = (name: string, title: string, opts: {rows?: number; description?: string; group?: string} = {}) =>
  (['en', 'es'] as const).map((lang) =>
    defineField({
      name: `${name}_${lang}`,
      title: `${title} (${lang === 'en' ? 'English' : 'Spanish'})`,
      type: opts.rows ? 'text' : 'string',
      ...(opts.rows ? {rows: opts.rows} : {}),
      ...(opts.group ? {group: opts.group} : {}),
      description: lang === 'en' ? opts.description : undefined,
    })
  )

const VENUE_TYPES = [{type: 'restaurant'}, {type: 'shop'}, {type: 'landmark'}, {type: 'activity'}]

const buttonFields = [
  ...bi('buttonLabel', 'Button — label', {description: 'Leave the link empty to hide the button.'}),
  defineField({
    name: 'buttonHref',
    title: 'Button — link',
    type: 'string',
    description: 'A page (/restaurants#area-marina), an anchor on this page (#marina-guide) or a full link.',
    validation: linkRule,
  }),
]

const anchorField = defineField({
  name: 'anchor',
  title: 'Anchor',
  type: 'string',
  description: 'Optional. Lets buttons jump here with "#anchor", e.g. "marina-guide".',
  validation: (Rule) => Rule.regex(/^[a-z0-9-]+$/, {name: 'lowercase letters, numbers and dashes'}),
})

/** One entry in a list: a restaurant, shop or place, or just a name. */
const guideItem = defineArrayMember({
  type: 'object',
  name: 'guideItem',
  title: 'Entry',
  fields: [
    defineField({
      name: 'venue',
      title: 'Restaurant, shop or place',
      type: 'reference',
      to: VENUE_TYPES,
      description: 'Pick one so the name, photo and link stay in sync. Or leave empty and type a name below.',
    }),
    ...bi('name', 'Name', {description: 'Only needed without a venue above (e.g. "Pottery workshops").'}),
    ...bi('note', 'Description', {
      rows: 3,
      description: 'Optional. Shown under the name; replaces the venue’s own short description.',
    }),
  ],
  preview: {
    select: {venueEn: 'venue.name_en', venueName: 'venue.name', name: 'name_en', note: 'note_en', media: 'venue.image'},
    prepare: ({venueEn, venueName, name, note, media}) => ({
      title: venueEn || venueName || name || 'Untitled',
      subtitle: note,
      media,
    }),
  },
})

/** Text and a photo side by side, with a button. */
const featureSection = defineArrayMember({
  type: 'object',
  name: 'guideFeature',
  title: 'Feature (text + photo)',
  fields: [
    ...bi('eyebrow', 'Small label'),
    ...bi('title', 'Title', {rows: 2}),
    ...bi('body', 'Text', {rows: 6, description: 'Leave a blank line between paragraphs.'}),
    defineField({
      name: 'venue',
      title: 'About a venue (optional)',
      type: 'reference',
      to: VENUE_TYPES,
      description:
        'If this feature is about one place: the button links to it, its details (e.g. how to get there) show under the text, and its photo is used when none is set below.',
    }),
    defineField({name: 'image', title: 'Photo', type: 'image', options: {hotspot: true}, fields: [{name: 'alt', type: 'string', title: 'Alternative text'}]}),
    ...bi('highlightsLabel', 'Label above the highlights', {description: 'e.g. "Experience highlights".'}),
    defineField({
      name: 'highlights',
      title: 'Highlights',
      type: 'array',
      of: [guideItem],
      description: 'Optional short list under the text. Type a name, or pick a restaurant, shop or place to link it.',
    }),
    ...buttonFields,
    anchorField,
  ],
  preview: {
    select: {title: 'title_en', eyebrow: 'eyebrow_en', media: 'image'},
    prepare: ({title, eyebrow, media}) => ({title: title || eyebrow || 'Feature', subtitle: `Feature${eyebrow ? ` · ${eyebrow}` : ''}`, media}),
  },
})

/** A heading and a list of venues (or plain names). */
const venuesSection = defineArrayMember({
  type: 'object',
  name: 'guideVenues',
  title: 'List of venues',
  fields: [
    ...bi('eyebrow', 'Small label'),
    ...bi('title', 'Title', {rows: 2}),
    ...bi('intro', 'Intro', {rows: 4}),
    ...bi('listLabel', 'Label above the list', {description: 'e.g. "Featured boutiques".'}),
    defineField({name: 'items', title: 'Entries', type: 'array', of: [guideItem]}),
    ...buttonFields,
    anchorField,
  ],
  preview: {
    select: {title: 'title_en', eyebrow: 'eyebrow_en', items: 'items'},
    prepare: ({title, eyebrow, items}) => ({
      title: title || eyebrow || 'List of venues',
      subtitle: `List · ${(items ?? []).length} entries`,
    }),
  },
})

/** Several titled groups of venues — e.g. the Marina guide. */
const directorySection = defineArrayMember({
  type: 'object',
  name: 'guideDirectory',
  title: 'Directory (groups of venues)',
  fields: [
    ...bi('eyebrow', 'Small label'),
    ...bi('title', 'Title', {rows: 2}),
    ...bi('intro', 'Intro', {rows: 4}),
    defineField({
      name: 'groups',
      title: 'Groups',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'guideGroup',
          fields: [
            ...bi('title', 'Group title'),
            ...bi('description', 'Description', {rows: 2}),
            ...bi('listLabel', 'Label above the list', {description: 'e.g. "Featured venues". Optional.'}),
            defineField({name: 'items', title: 'Entries', type: 'array', of: [guideItem]}),
          ],
          preview: {
            select: {title: 'title_en', items: 'items'},
            prepare: ({title, items}) => ({title, subtitle: `${(items ?? []).length} entries`}),
          },
        }),
      ],
    }),
    ...buttonFields,
    anchorField,
  ],
  preview: {
    select: {title: 'title_en', groups: 'groups'},
    prepare: ({title, groups}) => ({title: title || 'Directory', subtitle: `Directory · ${(groups ?? []).length} groups`}),
  },
})

/**
 * A page about one part of the resort — The Marina, Altos de Chavón, the
 * Hotel, Nightlife — at /casa-de-campo/<slug>. An intro, then any mix of
 * sections. Venues are references, so restaurants, shops, places and
 * activities are edited once and stay in sync across guides. Guides with "Show in the menu"
 * appear under The Resort in the navbar, in menu order.
 */
export const resortGuide = defineType({
  name: 'resortGuide',
  title: 'Resort guide',
  type: 'document',
  icon: () => '🧭',
  groups: [
    {name: 'intro', title: 'Intro', default: true},
    {name: 'sections', title: 'Sections'},
    {name: 'menu', title: 'Menu & page'},
  ],
  fields: [
    ...bi('eyebrow', 'Small label above the title', {group: 'intro'}),
    ...bi('title', 'Title', {rows: 2, group: 'intro', description: 'Press Enter to start a new line.'}),
    ...bi('intro', 'Intro', {rows: 6, group: 'intro', description: 'Leave a blank line between paragraphs.'}),
    defineField({
      name: 'heroImages',
      title: 'Background photos',
      type: 'array',
      group: 'intro',
      description: 'Optional. One photo, or several to cross-fade. With photos the intro becomes full-width with white text.',
      of: [{type: 'image', options: {hotspot: true}, fields: [{name: 'alt', type: 'string', title: 'Alternative text'}]}],
    }),
    defineField({
      name: 'heroOverlay',
      title: 'Darken behind the text (0–70%)',
      type: 'number',
      group: 'intro',
      initialValue: 35,
      validation: (Rule) => Rule.min(0).max(70).integer(),
    }),
    ...buttonFields.map((f) => ({...f, group: 'intro'})),

    defineField({
      name: 'sections',
      title: 'Sections',
      type: 'array',
      group: 'sections',
      description: 'Shown in this order under the intro. Drag to reorder.',
      of: [featureSection, venuesSection, directorySection],
    }),

    ...bi('navLabel', 'Name in the menu', {group: 'menu', description: 'e.g. "The Marina". Also used on cards linking here.'}),
    defineField({
      name: 'slug',
      title: 'URL',
      type: 'slug',
      group: 'menu',
      description: 'The page lives at /casa-de-campo/<this>.',
      options: {source: 'navLabel_en', maxLength: 64},
      validation: (Rule) => Rule.required(),
    }),
    defineField({name: 'showInNav', title: 'Show in the menu', type: 'boolean', group: 'menu', initialValue: true}),
    defineField({name: 'navOrder', title: 'Menu order', type: 'number', group: 'menu', description: 'Lower numbers come first.'}),
    defineField({
      name: 'isActive',
      title: 'Published',
      type: 'boolean',
      group: 'menu',
      initialValue: true,
      description: 'Untick to take the page offline without deleting it.',
    }),
    ...bi('seoDescription', 'Search description', {rows: 2, group: 'menu', description: 'Shown by Google under the page title. Optional.'}),
  ],
  orderings: [{title: 'Menu order', name: 'navOrder', by: [{field: 'navOrder', direction: 'asc'}]}],
  preview: {
    select: {title: 'navLabel_en', slug: 'slug.current', media: 'heroImages.0', active: 'isActive'},
    prepare: ({title, slug, media, active}) => ({
      title: `${title || 'Resort guide'}${active === false ? ' (offline)' : ''}`,
      subtitle: slug ? `/casa-de-campo/${slug}` : undefined,
      media,
    }),
  },
})
