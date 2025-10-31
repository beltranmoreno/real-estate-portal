import {defineType, defineField} from 'sanity'
import {bilingualTextField} from '../../lib/schemaHelpers'

export const location = defineType({
  name: 'location',
  title: 'Location',
  type: 'object',
  fields: [
    ...bilingualTextField('address', 'Address', {
      required: true,
      description: 'Street address of the property',
    }),
    
    defineField({
      name: 'area',
      title: 'Area',
      type: 'reference',
      to: [{type: 'area'}],
      // validation: (Rule) => Rule.required(),
      description: 'Main area/region where the property is located',
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