import {defineType, defineField} from 'sanity'
import {bilingualTextField, slugField, imageField} from '../../lib/schemaHelpers'

/**
 * A shop or boutique inside Casa de Campo. Listed on the Activities guide
 * (/info/activities) under "Shopping", grouped by where in the resort it is.
 */
export const SHOP_CATEGORIES = [
  {title: 'Fashion', value: 'fashion'},
  {title: 'Swim & resortwear', value: 'resortwear'},
  {title: 'Jewelry', value: 'jewelry'},
  {title: 'Art & crafts', value: 'art'},
  {title: 'Home & linens', value: 'home'},
  {title: 'Gifts & souvenirs', value: 'gifts'},
  {title: 'Cigars', value: 'cigars'},
  {title: 'Wine & spirits', value: 'wine'},
  {title: 'Groceries & market', value: 'groceries'},
  {title: 'Sports & pro shop', value: 'sports'},
  {title: 'Other', value: 'other'},
] as const

export const SHOP_LOCATIONS = [
  {title: 'La Marina', value: 'marina'},
  {title: 'Altos de Chavón', value: 'altos-de-chavon'},
  {title: 'Hotel', value: 'hotel'},
  {title: 'Minitas Beach', value: 'beach'},
  {title: 'Golf courses', value: 'golf'},
  {title: 'Sports facilities', value: 'sports'},
] as const

export const shop = defineType({
  name: 'shop',
  title: 'Shop',
  type: 'document',
  icon: () => '🛍️',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),

    slugField('name'),

    defineField({
      name: 'location',
      title: 'Where in the resort',
      type: 'string',
      options: {list: [...SHOP_LOCATIONS]},
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'category',
      title: 'What it sells',
      type: 'string',
      options: {list: [...SHOP_CATEGORIES]},
      validation: (Rule) => Rule.required(),
    }),

    ...bilingualTextField('summary', 'Short description', {rows: 2}),

    defineField({
      name: 'hours',
      title: 'Hours',
      type: 'string',
      description: 'Free text, e.g. "10am–8pm daily" or "Mon–Sat 8am–9pm, Sun 8am–7pm".',
    }),

    defineField({name: 'website', title: 'Website or Instagram', type: 'url'}),

    imageField('image', 'Photo', {description: 'Optional.'}),

    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
      description: 'Lower numbers come first within their location.',
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
      title: 'Location, then name',
      name: 'locationName',
      by: [
        {field: 'location', direction: 'asc'},
        {field: 'name', direction: 'asc'},
      ],
    },
  ],

  preview: {
    select: {title: 'name', location: 'location', category: 'category', media: 'image', active: 'isActive'},
    prepare({title, location, category, media, active}) {
      const where = SHOP_LOCATIONS.find((l) => l.value === location)?.title
      const what = SHOP_CATEGORIES.find((c) => c.value === category)?.title
      return {
        title: active === false ? `${title} (hidden)` : title,
        subtitle: [where, what].filter(Boolean).join(' · '),
        media,
      }
    },
  },
})
