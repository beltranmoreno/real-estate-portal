import {defineType, defineField, defineArrayMember} from 'sanity'

const bi = (name: string, title: string, rows?: number) => [
  defineField({name: `${name}_en`, title: `${title} (English)`, type: rows ? 'text' : 'string', ...(rows ? {rows} : {})}),
  defineField({name: `${name}_es`, title: `${title} (Spanish)`, type: rows ? 'text' : 'string', ...(rows ? {rows} : {})}),
]

/**
 * The About page's sections below the hero (the hero itself is Page Heroes →
 * About): the founder heading, the figures, the brand story and the
 * philosophy. One fixed document (id "aboutPage"). Empty fields fall back to
 * the copy the site shipped with. The founder's name, photo and bio come
 * from her Agent document.
 */
export const aboutPage = defineType({
  name: 'aboutPage',
  title: 'About page',
  type: 'document',
  icon: () => '👋',
  groups: [
    {name: 'founder', title: 'Founder', default: true},
    {name: 'brand', title: 'Brand'},
    {name: 'philosophy', title: 'Philosophy'},
    {name: 'whatWeDo', title: 'What we do'},
    {name: 'contact', title: 'Contact'},
    {name: 'owners', title: 'For owners'},
  ],
  fields: [
    ...bi('founderEyebrow', 'Founder — small label').map((f) => ({...f, group: 'founder'})),
    ...bi('founderTitle', 'Founder — title', 2).map((f) => ({...f, group: 'founder'})),
    defineField({
      name: 'propertiesStat',
      title: 'Figure — properties represented',
      type: 'string',
      description: 'e.g. "300+".',
      group: 'founder',
    }),
    defineField({
      name: 'bookingsStat',
      title: 'Figure — bookings',
      type: 'string',
      description: 'e.g. "400+".',
      group: 'founder',
    }),

    ...bi('brandEyebrow', 'Brand — small label').map((f) => ({...f, group: 'brand'})),
    ...bi('brandTitle', 'Brand — title', 2).map((f) => ({...f, group: 'brand'})),
    ...bi('brandBody', 'Brand — text', 14).map((f) => ({
      ...f,
      group: 'brand',
      description: f.name.endsWith('_en') ? 'Leave a blank line between paragraphs.' : undefined,
    })),

    ...bi('philosophyTitle', 'Philosophy — title').map((f) => ({...f, group: 'philosophy'})),
    defineField({
      name: 'philosophy',
      title: 'Philosophy — principles',
      type: 'array',
      group: 'philosophy',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'principle',
          fields: [...bi('title', 'Title'), ...bi('body', 'Text', 4)],
          preview: {select: {title: 'title_en', subtitle: 'body_en'}},
        }),
      ],
    }),

    ...bi('whatWeDoEyebrow', 'What we do — small label').map((f) => ({...f, group: 'whatWeDo'})),
    defineField({
      name: 'offerings',
      title: 'What we do — cards',
      type: 'array',
      group: 'whatWeDo',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'offering',
          fields: [
            ...bi('eyebrow', 'Small label'),
            ...bi('title', 'Title'),
            ...bi('body', 'Text', 3),
            ...bi('buttonLabel', 'Link label'),
            defineField({
              name: 'href',
              title: 'Link',
              type: 'string',
              description: 'A page on the site (/search) or a full link.',
              validation: (Rule) =>
                Rule.required().custom((v?: string) =>
                  !v || /^(\/|#|https?:\/\/)/.test(v) ? true : 'Use a path (/search) or a full link (https://…)'
                ),
            }),
          ],
          preview: {select: {title: 'title_en', subtitle: 'eyebrow_en'}},
        }),
      ],
    }),

    ...bi('contactEyebrow', 'Contact — small label').map((f) => ({...f, group: 'contact'})),
    ...bi('contactTitle', 'Contact — title', 2).map((f) => ({...f, group: 'contact'})),
    ...bi('contactBody', 'Contact — text', 4).map((f) => ({...f, group: 'contact'})),

    ...bi('ownersEyebrow', 'For owners — small label').map((f) => ({...f, group: 'owners'})),
    ...bi('ownersTitle', 'For owners — title', 2).map((f) => ({...f, group: 'owners'})),
    ...bi('ownersBody', 'For owners — text', 4).map((f) => ({...f, group: 'owners'})),
  ],
  preview: {prepare: () => ({title: 'About page'})},
})
