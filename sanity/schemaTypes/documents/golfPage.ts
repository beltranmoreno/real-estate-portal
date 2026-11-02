import {defineType, defineField} from 'sanity'

/**
 * The Golf page's sections below the hero (the hero itself is Page Heroes →
 * Golf). One fixed document (id "golfPage"). Empty fields fall back to the
 * copy the site shipped with.
 */
export const golfPage = defineType({
  name: 'golfPage',
  title: 'Golf page',
  type: 'document',
  icon: () => '⛳',
  fields: [
    defineField({name: 'aboutEyebrow_en', title: 'About — small label (English)', type: 'string'}),
    defineField({name: 'aboutEyebrow_es', title: 'About — small label (Spanish)', type: 'string'}),
    defineField({
      name: 'aboutTitle_en',
      title: 'About — title (English)',
      type: 'text',
      rows: 2,
      description: 'Press Enter to start a new line.',
    }),
    defineField({name: 'aboutTitle_es', title: 'About — title (Spanish)', type: 'text', rows: 2}),
    defineField({
      name: 'aboutBody_en',
      title: 'About — text (English)',
      type: 'text',
      rows: 10,
      description: 'Leave a blank line between paragraphs.',
    }),
    defineField({name: 'aboutBody_es', title: 'About — text (Spanish)', type: 'text', rows: 10}),
  ],
  preview: {
    select: {title: 'aboutTitle_en'},
    prepare: ({title}) => ({title: 'Golf page', subtitle: title}),
  },
})
