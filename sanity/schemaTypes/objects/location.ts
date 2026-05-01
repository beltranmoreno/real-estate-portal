import {defineType, defineField} from 'sanity'
import {bilingualTextField} from '../../lib/schemaHelpers'

export const location = defineType({
  name: 'location',
  title: 'Location',
  type: 'object',
  fields: [
    defineField({
      name: 'street',
      title: 'Street',
      type: 'string',
      description: 'Street address (e.g. "Calle Las Cerezas 12").',
    }),

    defineField({
      name: 'area',
      title: 'Area / Sector',
      type: 'reference',
      to: [{type: 'area'}],
      description:
        'The Casa de Campo sector. Pick from the existing areas. Leave blank and fill in "Custom area name" below if the sector is not in the list.',
    }),

    defineField({
      name: 'customArea',
      title: 'Custom area name',
      type: 'string',
      description:
        'Free-form area name to use when the sector is not in the dropdown above. Ignored when an Area reference is set.',
      hidden: ({parent}) => Boolean(parent?.area),
    }),

    defineField({
      name: 'city',
      title: 'City',
      type: 'string',
      initialValue: 'La Romana',
    }),

    defineField({
      name: 'country',
      title: 'Country',
      type: 'string',
      initialValue: 'Dominican Republic',
      options: {
        list: [
          {title: 'Dominican Republic', value: 'Dominican Republic'},
          {title: 'United States', value: 'United States'},
          {title: 'Mexico', value: 'Mexico'},
          {title: 'Puerto Rico', value: 'Puerto Rico'},
          {title: 'Other', value: 'Other'},
        ],
      },
    }),

    defineField({
      name: 'postcode',
      title: 'Postcode / ZIP',
      type: 'string',
      initialValue: '22000',
    }),

    defineField({
      name: 'isPrivateAddress',
      title: 'Private Address',
      type: 'boolean',
      initialValue: false,
      description:
        'When enabled, the exact address is hidden on the public property page and in search. It will still be visible inside private (access-code-gated) collections.',
    }),

    defineField({
      name: 'coordinates',
      title: 'Map Coordinates',
      type: 'geopoint',
      description: 'Used for map display and distance calculations',
    }),

    defineField({
      name: 'nearbyAttractions',
      title: 'Nearby Attractions',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            ...bilingualTextField('name', 'Attraction Name', {required: true}),
            {
              name: 'distance',
              title: 'Distance (km)',
              type: 'number',
              validation: (Rule) => Rule.min(0),
            },
            {
              name: 'type',
              title: 'Type',
              type: 'string',
              options: {
                list: [
                  {title: 'Beach', value: 'beach'},
                  {title: 'Golf Course', value: 'golf'},
                  {title: 'Restaurant', value: 'restaurant'},
                  {title: 'Shopping', value: 'shopping'},
                  {title: 'Airport', value: 'airport'},
                  {title: 'Hospital', value: 'hospital'},
                  {title: 'Marina', value: 'marina'},
                  {title: 'Casino', value: 'casino'},
                  {title: 'Nightlife', value: 'nightlife'},
                  {title: 'Other', value: 'other'},
                ],
              },
            },
          ],
        },
      ],
    }),

    defineField({
      name: 'distanceToBeach',
      title: 'Distance to Beach',
      type: 'object',
      fields: [
        {
          name: 'distance',
          title: 'Distance (km)',
          type: 'number',
          validation: (Rule) => Rule.min(0),
        },
        {
          name: 'golfCartTime',
          title: 'Golf Cart Time (minutes)',
          type: 'number',
          validation: (Rule) => Rule.min(0),
        },
      ],
      description: 'Distance and golf cart travel time to the nearest beach',
    }),

    defineField({
      name: 'distanceToLaMarina',
      title: 'Distance to La Marina',
      type: 'object',
      fields: [
        {
          name: 'distance',
          title: 'Distance (km)',
          type: 'number',
          validation: (Rule) => Rule.min(0),
        },
        {
          name: 'golfCartTime',
          title: 'Golf Cart Time (minutes)',
          type: 'number',
          validation: (Rule) => Rule.min(0),
        },
      ],
      description: 'Distance and golf cart travel time to La Marina',
    }),

    defineField({
      name: 'distanceToChavon',
      title: 'Distance to Altos de Chavón',
      type: 'object',
      fields: [
        {
          name: 'distance',
          title: 'Distance (km)',
          type: 'number',
          validation: (Rule) => Rule.min(0),
        },
        {
          name: 'golfCartTime',
          title: 'Golf Cart Time (minutes)',
          type: 'number',
          validation: (Rule) => Rule.min(0),
        },
      ],
      description: 'Distance and golf cart travel time to Altos de Chavón',
    }),

    defineField({
      name: 'distanceToAirport',
      title: 'Distance to Airport (km)',
      type: 'number',
      validation: (Rule) => Rule.min(0),
      description: 'Distance in kilometers to the nearest airport',
    }),

    defineField({
      name: 'isBeachfront',
      title: 'Beachfront Property',
      type: 'boolean',
      initialValue: false,
      description: 'Property is directly on the beach',
    }),

    defineField({
      name: 'isGolfCourse',
      title: 'Golf Course Property',
      type: 'boolean',
      initialValue: false,
      description: 'Property is on or adjacent to a golf course',
    }),

    ...bilingualTextField('locationHighlights', 'Location Highlights', {
      rows: 3,
      description: 'Key selling points about the location',
    }),
  ],
})