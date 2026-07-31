import {defineType, defineField} from 'sanity'
import {bilingualTextField, slugField} from '../../lib/schemaHelpers'

/**
 * A single grocery / drinks / household item that renters can add to a
 * shopping-list service request from their portal. Categorised so the
 * portal UI can group and filter (Produce, Wine, Cleaning, etc.).
 *
 * Snapshotted at request time onto the `ServiceRequest.notes` field —
 * the row in Postgres records what was asked for at that moment, so
 * editing the catalog later doesn't rewrite history.
 */
export const groceryItem = defineType({
  name: 'groceryItem',
  title: 'Grocery Item',
  type: 'document',
  icon: () => '🛒',
  groups: [
    {name: 'basic', title: 'Basic'},
    {name: 'shopping', title: 'Shopping'},
    {name: 'display', title: 'Display'},
  ],
  fields: [
    ...bilingualTextField('name', 'Item name', {required: true}).map((f) => ({
      ...f,
      group: 'basic',
    })),

    {
      ...slugField('name_en'),
      group: 'basic',
    },

    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      group: 'basic',
      options: {
        list: [
          // Fresh
          {title: 'Fresh produce', value: 'produce'},
          {title: 'Dairy & eggs', value: 'dairy'},
          {title: 'Meat & poultry', value: 'meat'},
          {title: 'Seafood', value: 'seafood'},
          // Pantry / dry
          {title: 'Bakery', value: 'bakery'},
          {title: 'Pantry & dry goods', value: 'pantry'},
          {title: 'Frozen', value: 'frozen'},
          {title: 'Snacks & sweets', value: 'snacks'},
          // Drinks
          {title: 'Non-alcoholic drinks', value: 'beverages_nonalcoholic'},
          {title: 'Beer', value: 'beer'},
          {title: 'Wine', value: 'wine'},
          {title: 'Spirits', value: 'spirits'},
          {title: 'Mixers & bar', value: 'mixers'},
          // Non-food
          {title: 'Household & cleaning', value: 'household'},
          {title: 'Personal care', value: 'personal_care'},
          {title: 'Baby', value: 'baby'},
          {title: 'Pet', value: 'pet'},
        ],
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'defaultUnit',
      title: 'Default unit',
      type: 'string',
      group: 'shopping',
      description:
        'How this item is usually quantified — shown next to the qty input on the renter side. Optional.',
      options: {
        list: [
          {title: 'each', value: 'each'},
          {title: 'pack', value: 'pack'},
          {title: 'dozen', value: 'dozen'},
          {title: 'bottle', value: 'bottle'},
          {title: 'case', value: 'case'},
          {title: 'lb', value: 'lb'},
          {title: 'kg', value: 'kg'},
          {title: 'oz', value: 'oz'},
          {title: 'litre', value: 'litre'},
          {title: 'gallon', value: 'gallon'},
          {title: 'bunch', value: 'bunch'},
          {title: 'bag', value: 'bag'},
          {title: 'box', value: 'box'},
        ],
      },
    }),

    defineField({
      name: 'brand',
      title: 'Brand or specific product (optional)',
      type: 'string',
      group: 'shopping',
      description:
        'Use only when the item refers to a specific brand (e.g. "Brugal 1888", "Presidente"). Leave blank for generic items like "Eggs".',
    }),

    ...bilingualTextField('shopperNote', 'Shopper note', {
      rows: 2,
      description:
        'Internal hint for the staffer doing the shopping (e.g. "Buy ripe", "Ask the deli counter"). Not shown to renters.',
    }).map((f) => ({...f, group: 'shopping'})),

    defineField({
      name: 'isPopular',
      title: 'Popular request',
      type: 'boolean',
      group: 'display',
      initialValue: false,
      description:
        'Surface this item in the "Popular" suggestions on the renter side.',
    }),

    defineField({
      name: 'isActive',
      title: 'Active',
      type: 'boolean',
      group: 'display',
      initialValue: true,
      description: 'Hide from the renter dropdown when off.',
    }),

    defineField({
      name: 'order',
      title: 'Display order',
      type: 'number',
      group: 'display',
      description: 'Lower numbers appear first within a category.',
    }),
  ],

  preview: {
    select: {
      title: 'name_en',
      subtitle: 'category',
      brand: 'brand',
      active: 'isActive',
      popular: 'isPopular',
    },
    prepare({title, subtitle, brand, active, popular}) {
      const parts = [subtitle, brand].filter(Boolean)
      const flags: string[] = []
      if (popular) flags.push('★')
      if (!active) flags.push('inactive')
      return {
        title,
        subtitle: [parts.join(' · '), flags.length ? `(${flags.join(' ')})` : '']
          .filter(Boolean)
          .join(' '),
      }
    },
  },

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
})
