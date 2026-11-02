import {defineType, defineField} from 'sanity'
import {bilingualTextField, slugField, imageField} from '../../lib/schemaHelpers'

/**
 * Things to do in and around Casa de Campo — sports, water activities,
 * excursions. Listed on the Activities guide page (/info/activities) under
 * their Activity group. Not concierge services: these describe what's
 * available, not something a guest requests through the portal.
 *
 * Activities without a group don't appear on the site.
 */
export const ACTIVITY_CATEGORIES = [
  {title: 'Sports', value: 'sports'},
  {title: 'On the water', value: 'water'},
  {title: 'On land', value: 'land'},
  {title: 'Excursions', value: 'excursion'},
  {title: 'Shopping', value: 'shopping'},
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
      name: 'group',
      title: 'Group',
      type: 'reference',
      to: [{type: 'activityGroup'}],
      description: 'The section of the Activities page it appears in. Without a group it isn’t shown on the site.',
      options: {disableNew: true},
    }),

    // Replaced by "Group"; kept hidden so older activities don't show an
    // unknown-field warning.
    defineField({
      name: 'category',
      title: 'Category (old)',
      type: 'string',
      options: {list: [...ACTIVITY_CATEGORIES]},
      hidden: true,
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
      title: 'Group, then order',
      name: 'groupOrder',
      by: [
        {field: 'group.order', direction: 'asc'},
        {field: 'order', direction: 'asc'},
        {field: 'name_en', direction: 'asc'},
      ],
    },
  ],

  preview: {
    select: {title: 'name_en', group: 'group.name_en', media: 'image', active: 'isActive'},
    prepare({title, group, media, active}) {
      return {
        title: active === false ? `${title} (hidden)` : title,
        subtitle: group || 'No group — not shown on the site',
        media,
      }
    },
  },
})
