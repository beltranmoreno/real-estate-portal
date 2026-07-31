import {defineType, defineField} from 'sanity'
import {bilingualTextField, slugField, imageField} from '../../lib/schemaHelpers'
import {MEAL_TYPES, COURSE_TYPES, CUISINES, DIETARY_OPTIONS} from '../../lib/menuOptions'

/**
 * A single dish. Plates are the atomic building block of in-villa dining:
 * they get referenced by presetMenu docs to compose a curated menu, and
 * they can be offered à la carte so a renter can mix-and-match their own
 * menu for a given day.
 *
 * Dietary / allergen info lives here (on the plate) so it aggregates up to
 * any menu that includes the plate — author the dish once, reuse it
 * everywhere.
 */
export const presetPlate = defineType({
  name: 'presetPlate',
  title: 'Plate / Dish',
  type: 'document',
  icon: () => '🍜',
  groups: [
    {name: 'basic', title: 'Basic'},
    {name: 'dietary', title: 'Dietary & allergens'},
    {name: 'display', title: 'Display'},
  ],
  fields: [
    ...bilingualTextField('name', 'Dish name', {required: true}).map((f) => ({
      ...f,
      group: 'basic',
    })),

    {
      ...slugField('name_en'),
      group: 'basic',
    },

    ...bilingualTextField('description', 'Description', {
      rows: 2,
      description: 'Optional. One- or two-line description of the dish.',
    }).map((f) => ({...f, group: 'basic'})),

    defineField({
      name: 'courseType',
      title: 'Course type',
      type: 'string',
      group: 'basic',
      description:
        'The dish’s role within a menu (starter, main, side, dessert…). Shared with the menu taxonomy so à-la-carte browsing groups plates the same way.',
      options: {list: [...COURSE_TYPES]},
    }),

    defineField({
      name: 'mealType',
      title: 'Meal type',
      type: 'string',
      group: 'basic',
      description:
        'Optional. Which meal this dish belongs to — used to group plates on the renter side.',
      options: {list: [...MEAL_TYPES]},
    }),

    defineField({
      name: 'cuisine',
      title: 'Cuisine',
      type: 'string',
      group: 'basic',
      description: 'Optional secondary tag for filtering.',
      options: {list: [...CUISINES]},
    }),

    imageField('image', 'Dish photo', {
      description: 'Optional photo of the plated dish. 4:3 ratio looks best.',
    }),

    defineField({
      name: 'pricePerPerson',
      title: 'Price per person (optional)',
      type: 'object',
      group: 'basic',
      description: 'Leave blank for "Quoted on request".',
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

    // -- Dietary & allergens --
    defineField({
      name: 'dietaryOptions',
      title: 'Dietary options',
      type: 'array',
      group: 'dietary',
      of: [{type: 'string'}],
      options: {list: [...DIETARY_OPTIONS]},
      description:
        'Optional. Dietary styles this dish is / can be prepared as. Used to filter out allergens on the renter side.',
    }),

    ...bilingualTextField('allergenInfo', 'Allergen / dietary notes', {
      rows: 2,
      description:
        'Optional. e.g. "Contains shellfish, nuts. Gluten-free version available on request."',
    }).map((f) => ({...f, group: 'dietary'})),

    // -- Display --
    defineField({
      name: 'isActive',
      title: 'Active',
      type: 'boolean',
      group: 'display',
      initialValue: true,
      description: 'Hide this dish from the renter portal when off.',
    }),

    defineField({
      name: 'order',
      title: 'Display order',
      type: 'number',
      group: 'display',
      description: 'Lower numbers appear first within a course type.',
    }),
  ],

  preview: {
    select: {
      title: 'name_en',
      courseType: 'courseType',
      mealType: 'mealType',
      media: 'image',
      active: 'isActive',
    },
    prepare({title, courseType, mealType, media, active}) {
      const tags = [courseType, mealType].filter(Boolean).join(' · ')
      return {
        title,
        subtitle: [tags, active === false ? '(inactive)' : '']
          .filter(Boolean)
          .join(' '),
        media,
      }
    },
  },

  orderings: [
    {
      title: 'Course type, then order',
      name: 'courseOrder',
      by: [
        {field: 'courseType', direction: 'asc'},
        {field: 'order', direction: 'asc'},
        {field: 'name_en', direction: 'asc'},
      ],
    },
  ],
})
