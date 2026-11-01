import {defineType, defineField} from 'sanity'

const linkRule = (Rule: any) =>
  Rule.custom((v?: string) =>
    !v || /^(\/|#|https?:\/\/|mailto:|tel:)/.test(v)
      ? true
      : 'Use a path (/about), an anchor (#contact) or a full link (https://…)'
  )

/**
 * The homepage "The resort" band: a photo beside a dark panel of text, below
 * the concierge section. One fixed document (id "estateBand"), listed under
 * Page Heroes → "Homepage · The resort band". Empty fields fall back to the
 * copy the site shipped with.
 */
export const estateBand = defineType({
  name: 'estateBand',
  title: 'Homepage · The resort band',
  type: 'document',
  icon: () => '🌴',
  fields: [
    defineField({
      name: 'image',
      title: 'Photo',
      type: 'image',
      options: {hotspot: true},
      description:
        'Shown on the left half (on top on phones). Set the hotspot to keep the subject in frame. Without a photo, the second homepage hero photo is used.',
      fields: [{name: 'alt', type: 'string', title: 'Alternative text'}],
    }),
    defineField({name: 'eyebrow_en', title: 'Small label above the title (English)', type: 'string'}),
    defineField({name: 'eyebrow_es', title: 'Small label above the title (Spanish)', type: 'string'}),
    defineField({
      name: 'title_en',
      title: 'Title (English)',
      type: 'text',
      rows: 2,
      description: 'Press Enter to start a new line.',
    }),
    defineField({name: 'title_es', title: 'Title (Spanish)', type: 'text', rows: 2}),
    defineField({
      name: 'body_en',
      title: 'Text (English)',
      type: 'text',
      rows: 4,
      description: 'Press Enter to start a new line.',
    }),
    defineField({name: 'body_es', title: 'Text (Spanish)', type: 'text', rows: 4}),
    defineField({name: 'buttonLabel_en', title: 'Button — label (English)', type: 'string'}),
    defineField({name: 'buttonLabel_es', title: 'Button — label (Spanish)', type: 'string'}),
    defineField({
      name: 'buttonHref',
      title: 'Button — link',
      type: 'string',
      description: 'A page on the site (/about) or a full link.',
      validation: linkRule,
    }),
  ],
  preview: {
    select: {title: 'title_en', media: 'image'},
    prepare: ({title, media}) => ({title: 'The resort band', subtitle: title, media}),
  },
})
