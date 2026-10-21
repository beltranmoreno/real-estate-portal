import {defineType, defineField} from 'sanity'
import {bilingualTextField} from '../../lib/schemaHelpers'
import {DEFAULT_AIRPORTS} from '../../lib/airportDefaults'
import {MapPinInput} from '../../components/MapPinInput'

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
      name: 'locationVisibility',
      title: 'Location visibility',
      type: 'string',
      initialValue: 'full',
      options: {
        list: [
          {title: 'Show full address', value: 'full'},
          {title: 'Show area / sector only', value: 'sector'},
          {title: "Don't show location", value: 'hidden'},
        ],
        layout: 'radio',
      },
      description:
        'Controls how much of the location is shown on the public property page and in search. "Sector only" shows an approximate map centered on the area (no street). "Don\'t show" hides the map and address entirely. Full address is always visible inside private (access-code-gated) collections.',
    }),

    defineField({
      name: 'coordinates',
      title: 'Map Coordinates',
      type: 'geopoint',
      description: 'Click the map to drop the pin, drag it to adjust, or search an address. Used for the property map and distances.',
      components: {input: MapPinInput},
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
      name: 'airports',
      title: 'Nearby Airports',
      type: 'array',
      description:
        'New properties start with La Romana, Punta Cana and Santo Domingo — adjust the distance and drive time for this house. Airports themselves are managed under Local Guide → Airports.',
      // Pre-filled for every new property (see sanity/lib/airportDefaults.ts).
      initialValue: DEFAULT_AIRPORTS.map((a) => ({
        _key: a.code.toLowerCase(),
        _type: 'airportDistance',
        airport: {_type: 'reference', _ref: a.id},
        distanceKm: a.distanceKm,
        driveTime: a.driveTime,
      })),
      of: [
        {
          name: 'airportDistance',
          title: 'Airport',
          type: 'object',
          fields: [
            {
              name: 'airport',
              title: 'Airport',
              type: 'reference',
              to: [{type: 'airport'}],
              options: {disableNew: true},
              validation: (Rule: any) =>
                Rule.custom((value: unknown, context: any) =>
                  value || context.parent?.name ? true : 'Choose an airport'
                ),
            },
            {
              name: 'distanceKm',
              title: 'Distance (km)',
              type: 'number',
              validation: (Rule: any) => Rule.min(0),
            },
            {
              name: 'driveTime',
              title: 'Drive time (minutes)',
              type: 'number',
              validation: (Rule: any) => Rule.min(0).integer(),
            },
            // Free-text name from before airports were documents. Still read
            // as a fallback; hidden once an airport is chosen.
            {
              name: 'name',
              title: 'Airport (old free-text entry)',
              type: 'string',
              readOnly: true,
              hidden: ({parent}: any) => !parent?.name || Boolean(parent?.airport),
            },
          ],
          preview: {
            select: {
              title: 'airport.name',
              code: 'airport.code',
              legacy: 'name',
              distance: 'distanceKm',
              drive: 'driveTime',
            },
            prepare({title, code, legacy, distance, drive}: any) {
              const parts = [distance != null && `${distance} km`, drive != null && `${drive} min`].filter(Boolean)
              return {
                title: title ? `${title}${code ? ` (${code})` : ''}` : legacy || 'Airport',
                subtitle: parts.join(' · ') || undefined,
              }
            },
          },
        },
      ],
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