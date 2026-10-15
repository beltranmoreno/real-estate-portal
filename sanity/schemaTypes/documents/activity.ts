import {defineType, defineField} from 'sanity'
import {bilingualTextField, slugField, imageField} from '../../lib/schemaHelpers'

/**
 * Things to do in and around Casa de Campo — sports, water activities,
 * excursions. Listed on the Activities guide page (/info/activities),
 * grouped by category. Not concierge services: these describe what's
 * available, not something a guest requests through the portal.
 */
export const ACTIVITY_CATEGORIES = [
  {title: 'Sports', value: 'sports'},
  {title: 'On the water', value: 'water'},
  {title: 'On land', value: 'land'},
  {title: 'Excursions', value: 'excursion'},
  {title: 'For families', value: 'family'},
] as const

export const activity = defineType({
  name: 'activity',
  title: 'Activity',
  type: 'document',
  icon: () => '🎾',
  fields: [
    ...bilingualTextField('name', 'Name', {required: true}),

    slugField('name_en'),

    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {list: [...ACTIVITY_CATEGORIES], layout: 'radio'},
      validation: (Rule) => Rule.required(),
    }),

    ...bilingualTextField('summary', 'Short description', {
      rows: 2,
      description: 'One or two sentences shown in the list.',
    }),

    imageField('image', 'Photo', {description: 'Optional. Shown beside the activity in the list.'}),

    defineField({
      name: 'location',
      title: 'Where',
      type: 'reference',
      to: [{type: 'attraction'}],
      description: 'Optional. The Map Attraction where it happens (e.g. Shooting Center, La Marina).',
      options: {disableNew: true},
    }),

    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
      description: 'Lower numbers come first within their category.',
    }),

    defineField({
      name: 'isActive',
      title: 'Active',
      type: 'boolean',
      initialValue: true,
      description: 'Untick to hide it from the site without deleting it.',
    }),
  ],

  orderings: [
    {
      title: 'Category, then order',
      name: 'categoryOrder',
      by: [
        {field: 'category', direction: 'asc'},
        {field: 'order', direction: 'asc'},
        {field: 'name_en', direction: 'asc'},
      ],
    },
  ],

  preview: {
    select: {title: 'name_en', category: 'category', media: 'image', active: 'isActive'},
    prepare({title, category, media, active}) {
      const label = ACTIVITY_CATEGORIES.find((c) => c.value === category)?.title
      return {
        title: active === false ? `${title} (hidden)` : title,
        subtitle: label,
        media,
      }
    },
  },
})
