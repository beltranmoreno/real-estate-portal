import {defineType, defineField} from 'sanity'

export const amenities = defineType({
  name: 'amenities',
  title: 'Amenities',
  type: 'object',
  fields: [
    // Essential Amenities
    defineField({
      name: 'bedrooms',
      title: 'Bedrooms',
      type: 'number',
      validation: (Rule) => Rule.required().min(0).integer(),
    }),
    defineField({
      name: 'bathrooms',
      title: 'Bathrooms',
      type: 'number',
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: 'maxGuests',
      title: 'Maximum Guests',
      type: 'number',
      validation: (Rule) => Rule.required().min(1).integer(),
    }),
    defineField({
      name: 'squareMeters',
      title: 'Square Meters',
      type: 'number',
      validation: (Rule) => Rule.min(0),
    }),

    // Bed Breakdown
    defineField({
      name: 'roomBreakdown',
      title: 'Room & Bed Breakdown',
      type: 'array',
      description: 'Detailed breakdown of rooms and bed types',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'roomName_es',
              title: 'Room Name (Español)',
              type: 'string',
              placeholder: 'e.g., Habitación Principal, Habitación 2',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'roomName_en',
              title: 'Room Name (English)',
              type: 'string',
              placeholder: 'e.g., Master Bedroom, Bedroom 2',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'bathrooms',
              title: 'Bathrooms in this Room',
              type: 'number',
              description: 'Number of bathrooms (full or half) in this room',
              validation: (Rule) => Rule.min(0),
              initialValue: 0,
            },
            {
              name: 'beds',
              title: 'Beds in this Room',
              type: 'array',
              of: [
                {
                  type: 'object',
                  fields: [
                    {
                      name: 'bedType',
                      title: 'Bed Type',
                      type: 'string',
                      options: {
                        list: [
                          { title: 'King', value: 'king' },
                          { title: 'Queen', value: 'queen' },
                          { title: 'Full/Double', value: 'full' },
                          { title: 'Twin/Single', value: 'twin' },
                          { title: 'Bunk Bed', value: 'bunk' },
                          { title: 'Sofa Bed', value: 'sofa' },
                          { title: 'Crib', value: 'crib' },
                        ],
                      },
                      validation: (Rule) => Rule.required(),
                    },
                    {
                      name: 'quantity',
                      title: 'Quantity',
                      type: 'number',
                      validation: (Rule) => Rule.required().min(1).integer(),
                      initialValue: 1,
                    },
                  ],
                  preview: {
                    select: {
                      bedType: 'bedType',
                      quantity: 'quantity',
                    },
                    prepare({bedType, quantity}) {
                      const displayType = bedType ? bedType.charAt(0).toUpperCase() + bedType.slice(1) : 'Bed'
                      return {
                        title: `${quantity || 1}x ${displayType}`,
                      }
                    },
                  },
                },
              ],
              validation: (Rule) => Rule.required().min(1),
            },
          ],
          preview: {
            select: {
              roomName_en: 'roomName_en',
              beds: 'beds',
              bathrooms: 'bathrooms',
            },
            prepare({roomName_en, beds, bathrooms}) {
              const bedCount = beds?.length || 0
              const parts = [`${bedCount} bed type${bedCount !== 1 ? 's' : ''}`]
              if (bathrooms > 0) {
                parts.push(`${bathrooms} bath${bathrooms !== 1 ? 's' : ''}`)
              }
              return {
                title: roomName_en,
                subtitle: parts.join(' • '),
              }
            },
          },
        },
      ],
    }),

    // Premium Features
    defineField({
      name: 'hasGolfCart',
      title: 'Golf Cart Included',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'hasGenerator',
      title: 'Backup Generator',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'hasPool',
      title: 'Swimming Pool',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'hasBeachAccess',
      title: 'Beach Access',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'hasGym',
      title: 'Gym',
      type: 'boolean',
      initialValue: false,
    }),

    // Climate Control
    defineField({
      name: 'hasAirConditioning',
      title: 'Air Conditioning',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'hasHeating',
      title: 'Heating',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'hasCeilingFans',
      title: 'Ceiling Fans',
      type: 'boolean',
      initialValue: false,
    }),

    // Kitchen & Dining
    defineField({
      name: 'hasFullKitchen',
      title: 'Full Kitchen',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'hasDishwasher',
      title: 'Dishwasher',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'hasCoffeeMaker',
      title: 'Coffee Maker',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'hasWineCooler',
      title: 'Wine Cooler',
      type: 'boolean',
      initialValue: false,
    }),

    // Entertainment
    defineField({
      name: 'hasWifi',
      title: 'WiFi Internet',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'hasCableTV',
      title: 'Cable TV',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'hasSmartTV',
      title: 'Smart TV',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'hasGameRoom',
      title: 'Game Room',
      type: 'boolean',
      initialValue: false,
    }),

    // Outdoor
    defineField({
      name: 'hasBBQ',
      title: 'BBQ Grill',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'hasGarden',
      title: 'Garden',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'hasTerrace',
      title: 'Terrace/Balcony',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'hasOutdoorShower',
      title: 'Outdoor Shower',
      type: 'boolean',
      initialValue: false,
    }),

    // Services & Security
    defineField({
      name: 'hasParking',
      title: 'Parking',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'parkingSpaces',
      title: 'Number of Parking Spaces',
      type: 'number',
      hidden: ({parent}) => !parent?.hasParking,
      validation: (Rule) => Rule.min(0).integer(),
    }),
    defineField({
      name: 'hasSecuritySystem',
      title: 'Security System',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'hasGatedCommunity',
      title: 'Gated Community',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'hasHousekeeping',
      title: 'Housekeeping Service',
      type: 'boolean',
      initialValue: false,
      description: 'General housekeeping/cleaning service',
    }),
    defineField({
      name: 'hasChef',
      title: 'Private Chef',
      type: 'boolean',
      initialValue: false,
      description: 'Professional chef service available',
    }),
    defineField({
      name: 'hasCook',
      title: 'Cook',
      type: 'boolean',
      initialValue: false,
      description: 'Cook service available',
    }),
    defineField({
      name: 'hasHousekeeper',
      title: 'Housekeeper',
      type: 'boolean',
      initialValue: false,
      description: 'Dedicated housekeeper service',
    }),
    defineField({
      name: 'hasButler',
      title: 'Butler Service',
      type: 'boolean',
      initialValue: false,
      description: 'Professional butler service',
    }),
    defineField({
      name: 'hasConcierge',
      title: 'Concierge Service',
      type: 'boolean',
      initialValue: false,
    }),

    // Laundry
    defineField({
      name: 'hasWasher',
      title: 'Washing Machine',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'hasDryer',
      title: 'Dryer',
      type: 'boolean',
      initialValue: false,
    }),

    // Accessibility
    defineField({
      name: 'isWheelchairAccessible',
      title: 'Wheelchair Accessible',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'hasElevator',
      title: 'Elevator',
      type: 'boolean',
      initialValue: false,
    }),

    // Family
    defineField({
      name: 'hasCrib',
      title: 'Baby Crib',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'hasHighChair',
      title: 'High Chair',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'hasChildSafety',
      title: 'Child Safety Features',
      type: 'boolean',
      initialValue: false,
    }),

    // Work
    defineField({
      name: 'hasWorkspace',
      title: 'Dedicated Workspace',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'hasHighSpeedInternet',
      title: 'High-Speed Internet (50+ Mbps)',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'hasHotTub',
      title: 'Hot Tub',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'hasOutdoorDining',
      title: 'Outdoor Dining',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'hasPrivatePool',
      title: 'Private Pool',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'hasPrivateBeach',
      title: 'Private Beach',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'hasStaff',
      title: 'Staff',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'hasSecurity',
      title: 'Security',
      type: 'boolean',
      initialValue: false,
    }),

    // Custom amenities list
    defineField({
      name: 'customAmenities',
      title: 'Additional Amenities',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'name_es',
              title: 'Name (Español)',
              type: 'string',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'name_en',
              title: 'Name (English)',
              type: 'string',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'icon',
              title: 'Icon Name',
              type: 'string',
              description: 'Optional icon identifier',
            },
          ],
        },
      ],
    }),
  ],
})