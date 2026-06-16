import {defineType, defineField} from 'sanity'
import {bilingualTextField, slugField, imageField} from '../../lib/schemaHelpers'

/**
 * A curated chef menu the renter can pick from when requesting in-villa
 * dining. Categorised by meal type (breakfast/lunch/dinner/cocktail) so
 * the renter UI can group them, and tagged with a cuisine for filtering.
 *
 * Courses are structured (course name + items) rather than a free-form
 * blob so the menu always renders consistently across the renter
 * portal, the email confirmation, and any printed brief for the chef.
 */
export const presetMenu = defineType({
  name: 'presetMenu',
  title: 'Preset Menu',
  type: 'document',
  icon: () => '🍽️',
  groups: [
    {name: 'basic', title: 'Basic'},
    {name: 'menu', title: 'Menu items'},
    {name: 'logistics', title: 'Pricing & logistics'},
    {name: 'display', title: 'Display'},
  ],
  fields: [
    ...bilingualTextField('name', 'Menu name', {required: true}).map((f) => ({
      ...f,
      group: 'basic',
    })),

    {
      ...slugField('name_en'),
      group: 'basic',
    },

    ...bilingualTextField('description', 'Short description', {
      rows: 2,
      description:
        'One- or two-line summary shown on the menu card on the renter side.',
    }).map((f) => ({...f, group: 'basic'})),

    defineField({
      name: 'mealType',
      title: 'Meal type',
      type: 'string',
      group: 'basic',
      description:
        'Used to group menus on the renter side — e.g. all "Dinner" menus together.',
      options: {
        list: [
          {title: 'Breakfast', value: 'breakfast'},
          {title: 'Brunch', value: 'brunch'},
          {title: 'Lunch', value: 'lunch'},
          {title: 'Dinner', value: 'dinner'},
          {title: 'Cocktail hour / canapés', value: 'cocktail'},
          {title: 'BBQ', value: 'bbq'},
          {title: 'Dessert / sweet table', value: 'dessert'},
          {title: 'Late-night', value: 'late_night'},
          {title: "Kids' menu", value: 'kids'},
        ],
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'cuisine',
      title: 'Cuisine',
      type: 'string',
      group: 'basic',
      description: 'Optional secondary tag for filtering.',
      options: {
        list: [
          {title: 'Dominican', value: 'dominican'},
          {title: 'Italian', value: 'italian'},
          {title: 'French', value: 'french'},
          {title: 'Mediterranean', value: 'mediterranean'},
          {title: 'Spanish / tapas', value: 'spanish'},
          {title: 'American', value: 'american'},
          {title: 'BBQ / grill', value: 'bbq'},
          {title: 'Seafood', value: 'seafood'},
          {title: 'Sushi / Japanese', value: 'japanese'},
          {title: 'Asian fusion', value: 'asian'},
          {title: 'Mexican', value: 'mexican'},
          {title: 'Caribbean', value: 'caribbean'},
          {title: 'Vegetarian / plant-based', value: 'vegetarian'},
          {title: 'International', value: 'international'},
        ],
      },
    }),

    imageField('image', 'Menu photo', {
      description:
        'Optional hero photo for the menu card. 4:3 ratio looks best.',
    }),

    // -- Menu items / courses --
    defineField({
      name: 'courses',
      title: 'Courses',
      type: 'array',
      group: 'menu',
      description:
        'Each course has a name (e.g. "Antipasto", "Main", or simply "Menu" if you want a flat list) and a list of items in EN and ES. For a flat menu, create one course called "Menu" and list the items in it.',
      of: [
        {
          type: 'object',
          name: 'course',
          title: 'Course',
          fields: [
            ...bilingualTextField('courseName', 'Course title', {
              required: true,
              description:
                'e.g. "First course", "Main", "Side", "Dessert". For breakfast/BBQ, use "Menu" as a single course.',
            }),
            defineField({
              name: 'items_en',
              title: 'Items (English)',
              type: 'array',
              of: [{type: 'string'}],
              validation: (Rule) => Rule.min(1),
              description:
                'One dish per line. e.g. "Burrata with heirloom tomatoes".',
            }),
            defineField({
              name: 'items_es',
              title: 'Items (Spanish)',
              type: 'array',
              of: [{type: 'string'}],
              description:
                'Same items in Spanish, in the same order. Optional but recommended.',
            }),
          ],
          preview: {
            select: {
              title: 'courseName_en',
              items: 'items_en',
            },
            prepare({title, items}) {
              const count = Array.isArray(items) ? items.length : 0
              return {
                title: title || 'Course',
                subtitle: `${count} item${count === 1 ? '' : 's'}`,
              }
            },
          },
        },
      ],
      validation: (Rule) => Rule.min(1).error('Add at least one course'),
    }),

    ...bilingualTextField('allergenInfo', 'Allergen / dietary notes', {
      rows: 2,
      description:
        'Optional. e.g. "Contains shellfish, nuts. Gluten-free version available on request."',
    }).map((f) => ({...f, group: 'menu'})),

    // -- Pricing & logistics --
    defineField({
      name: 'pricePerPerson',
      title: 'Price per person (optional)',
      type: 'object',
      group: 'logistics',
      description:
        'Leave both blank for "Quoted on request". Use either per-person OR flat — not both.',
      fields: [
        {name: 'amount', title: 'Amount', type: 'number'},
        {
          name: 'currency',
          title: 'Currency',
          type: 'string',
          options: {
            list: [
              {title: 'USD', value: 'USD'},
              {title: 'DOP', value: 'DOP'},
            ],
          },
          initialValue: 'USD',
        },
      ],
    }),

    defineField({
      name: 'flatPrice',
      title: 'Flat price (optional)',
      type: 'object',
      group: 'logistics',
      description: 'Use when the menu is priced for the whole group.',
      fields: [
        {name: 'amount', title: 'Amount', type: 'number'},
        {
          name: 'currency',
          title: 'Currency',
          type: 'string',
          options: {
            list: [
              {title: 'USD', value: 'USD'},
              {title: 'DOP', value: 'DOP'},
            ],
          },
          initialValue: 'USD',
        },
      ],
    }),

    defineField({
      name: 'minGuests',
      title: 'Minimum guests',
      type: 'number',
      group: 'logistics',
      validation: (Rule) => Rule.integer().positive(),
    }),

    defineField({
      name: 'maxGuests',
      title: 'Maximum guests',
      type: 'number',
      group: 'logistics',
      validation: (Rule) => Rule.integer().positive(),
    }),

    defineField({
      name: 'leadTimeHours',
      title: 'Lead time (hours)',
      type: 'number',
      group: 'logistics',
      initialValue: 24,
      description:
        'Minimum notice required. 24h is a reasonable default for plated dinners; less for cocktail spreads.',
      validation: (Rule) => Rule.integer().min(0),
    }),

    // -- Display --
    defineField({
      name: 'isFeatured',
      title: 'Featured',
      type: 'boolean',
      group: 'display',
      initialValue: false,
      description: 'Highlight this menu at the top of its meal-type group.',
    }),

    defineField({
      name: 'isActive',
      title: 'Active',
      type: 'boolean',
      group: 'display',
      initialValue: true,
      description: 'Hide this menu from the renter portal when off.',
    }),

    defineField({
      name: 'order',
      title: 'Display order',
      type: 'number',
      group: 'display',
      description: 'Lower numbers appear first within a meal type.',
    }),
  ],

  preview: {
    select: {
      title: 'name_en',
      mealType: 'mealType',
      cuisine: 'cuisine',
      media: 'image',
      active: 'isActive',
      featured: 'isFeatured',
    },
    prepare({title, mealType, cuisine, media, active, featured}) {
      const tags = [mealType, cuisine].filter(Boolean).join(' · ')
      const flags: string[] = []
      if (featured) flags.push('★')
      if (!active) flags.push('inactive')
      return {
        title,
        subtitle: [tags, flags.length ? `(${flags.join(' ')})` : '']
          .filter(Boolean)
          .join(' '),
        media,
      }
    },
  },

  orderings: [
    {
      title: 'Meal type, then order',
      name: 'mealOrder',
      by: [
        {field: 'mealType', direction: 'asc'},
        {field: 'order', direction: 'asc'},
        {field: 'name_en', direction: 'asc'},
      ],
    },
  ],
})
