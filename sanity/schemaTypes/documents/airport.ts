import {defineType, defineField} from 'sanity'

/**
 * An airport serving the resort. Properties list their nearby airports by
 * referencing these (with the distance from that house), so the name and
 * code are entered once.
 */
export const airport = defineType({
  name: 'airport',
  title: 'Airport',
  type: 'document',
  icon: () => '✈️',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      description: 'Short name shown on the site, e.g. "La Romana".',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'code',
      title: 'Code',
      type: 'string',
      description: 'IATA code, e.g. LRM.',
      validation: (Rule) => Rule.required().uppercase().length(3),
    }),
    defineField({name: 'order', title: 'Order', type: 'number'}),
  ],
  orderings: [{title: 'Order', name: 'orderAsc', by: [{field: 'order', direction: 'asc'}]}],
  preview: {
    select: {title: 'name', code: 'code'},
    prepare({title, code}) {
      return {title: code ? `${title} (${code})` : title}
    },
  },
})
