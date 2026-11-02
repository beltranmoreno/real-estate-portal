import {defineType, defineField, defineArrayMember} from 'sanity'

const bi = (name: string, title: string, rows?: number) => [
  defineField({name: `${name}_en`, title: `${title} (English)`, type: rows ? 'text' : 'string', ...(rows ? {rows} : {})}),
  defineField({name: `${name}_es`, title: `${title} (Spanish)`, type: rows ? 'text' : 'string', ...(rows ? {rows} : {})}),
]
const inGroup = (group: string) => (f: any) => ({...f, group})

const linkRule = (Rule: any) =>
  Rule.required().custom((v?: string) =>
    !v || /^(\/|#|https?:\/\/)/.test(v) ? true : 'Use a path (/search) or a full link (https://…)'
  )

/** A numbered point: title and text. */
const point = defineArrayMember({
  type: 'object',
  name: 'point',
  fields: [...bi('title', 'Title'), ...bi('body', 'Text', 4)],
  preview: {select: {title: 'title_en', subtitle: 'body_en'}},
})

/**
 * The Owners page's sections below the hero (the hero itself is Page Heroes →
 * For owners): why owners work with us, what we do, how it works and the
 * contact intro. One fixed document (id "ownersPage"). Empty fields fall
 * back to the copy the site shipped with.
 */
export const ownersPage = defineType({
  name: 'ownersPage',
  title: 'Owners page',
  type: 'document',
  icon: () => '🔑',
  groups: [
    {name: 'why', title: 'Why us', default: true},
    {name: 'services', title: 'What we do'},
    {name: 'how', title: 'How it works'},
    {name: 'contact', title: 'Contact'},
  ],
  fields: [
    ...bi('whyEyebrow', 'Small label').map(inGroup('why')),
    ...bi('whyTitle', 'Title', 2).map(inGroup('why')),
    defineField({name: 'reasons', title: 'Reasons', type: 'array', group: 'why', of: [point]}),

    ...bi('servicesEyebrow', 'Small label').map(inGroup('services')),
    defineField({
      name: 'services',
      title: 'Columns',
      type: 'array',
      group: 'services',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'ownerService',
          fields: [
            ...bi('eyebrow', 'Small label'),
            ...bi('title', 'Title'),
            defineField({name: 'list_en', title: 'List (English)', type: 'array', of: [{type: 'string'}]}),
            defineField({name: 'list_es', title: 'List (Spanish)', type: 'array', of: [{type: 'string'}]}),
            ...bi('buttonLabel', 'Link label'),
            defineField({name: 'href', title: 'Link', type: 'string', validation: linkRule}),
          ],
          preview: {select: {title: 'title_en', subtitle: 'eyebrow_en'}},
        }),
      ],
    }),

    ...bi('howEyebrow', 'Small label').map(inGroup('how')),
    ...bi('howTitle', 'Title', 2).map(inGroup('how')),
    defineField({name: 'steps', title: 'Steps', type: 'array', group: 'how', of: [point]}),

    ...bi('contactEyebrow', 'Small label').map(inGroup('contact')),
    ...bi('contactTitle', 'Title', 2).map(inGroup('contact')),
    ...bi('contactBody', 'Text', 4).map(inGroup('contact')),
  ],
  preview: {prepare: () => ({title: 'Owners page'})},
})
