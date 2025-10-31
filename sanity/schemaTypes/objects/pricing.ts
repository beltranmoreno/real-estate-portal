import {defineType, defineField} from 'sanity'
import {priceField} from '../../lib/schemaHelpers'

export const pricing = defineType({
  name: 'pricing',
  title: 'Pricing',
  type: 'object',
  fields: [
    defineField({
      name: 'type',
      title: 'Listing Type',
      type: 'string',
      options: {
        list: [
          {title: 'Rental', value: 'rental'},
          {title: 'Sale', value: 'sale'},
          {title: 'Both', value: 'both'},
        ],
      },
      validation: (Rule) => Rule.required(),
      initialValue: 'rental',
    }),

    // Rental Pricing
    defineField({
      name: 'rentalPricing',
      title: 'Rental Pricing',
      type: 'object',
      hidden: ({parent}) => parent?.type === 'sale',
      fields: [
        defineField({
          name: 'priceOnRequest',
          title: 'Price on Request',
          type: 'boolean',
          initialValue: false,
          description: 'Enable this to show "Price on Request" instead of actual prices'
        }),
        priceField('nightlyRate', 'Nightly Rate', {
        }),
        priceField('weeklyRate', 'Weekly Rate', {
        }),
        priceField('monthlyRate', 'Monthly Rate', {
        }),
        
        defineField({
          name: 'minimumNights',
          title: 'Minimum Nights',
          type: 'number',
          validation: (Rule) => Rule.required().min(1).integer(),
          initialValue: 2,
        }),

        defineField({
          name: 'cleaningFee',
          title: 'Cleaning Fee',
          type: 'object',
          hidden: true,
          fields: [
            {
              name: 'amount',
              title: 'Amount',
              type: 'number',
              validation: (Rule) => Rule.min(0),
            },
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
          name: 'securityDeposit',
          title: 'Security Deposit',
          type: 'object',
          fields: [
            {
              name: 'amount',
              title: 'Amount',
              type: 'number',
              validation: (Rule) => Rule.min(0),
            },
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
          name: 'taxRate',
          title: 'Tax Rate (%)',
          type: 'number',
          validation: (Rule) => Rule.min(0).max(100),
          description: 'Tax percentage to be added to the rental price',
        }),

        defineField({
          name: 'seasonalPricing',
          title: 'Seasonal Pricing',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                {
                  name: 'name',
                  title: 'Season Name',
                  type: 'string',
                  validation: (Rule) => Rule.required(),
                },
                {
                  name: 'startDate',
                  title: 'Start Date',
                  type: 'date',
                  validation: (Rule) => Rule.required(),
                },
                {
                  name: 'endDate',
                  title: 'End Date',
                  type: 'date',
                  validation: (Rule) => Rule.required(),
                },
                priceField('nightlyRate', 'Nightly Rate', {required: true}),
                {
                  name: 'minimumNights',
                  title: 'Minimum Nights',
                  type: 'number',
                  validation: (Rule) => Rule.min(1).integer(),
                },
              ],
            },
          ],
        }),
      ],
    }),

    // Sale Pricing
    defineField({
      name: 'salePricing',
      title: 'Sale Pricing',
      type: 'object',
      hidden: ({parent}) => parent?.type === 'rental',
      fields: [
        defineField({
          name: 'priceOnRequest',
          title: 'Price on Request',
          type: 'boolean',
          initialValue: false,
          description: 'Enable this to show "Price on Request" instead of actual prices'
        }),
        priceField('salePrice', 'Sale Price'),
        
        defineField({
          name: 'pricePerSquareMeter',
          title: 'Price per Square Meter',
          type: 'number',
          // validation: (Rule) => Rule.min(0),
          description: 'Automatically calculated if square meters is provided',
        }),

        defineField({
          name: 'isNegotiable',
          title: 'Price Negotiable',
          type: 'boolean',
          initialValue: false,
        }),

        defineField({
          name: 'hoaFees',
          title: 'HOA/Maintenance Fees',
          type: 'object',
          fields: [
            {
              name: 'amount',
              title: 'Monthly Amount',
              type: 'number',
              // validation: (Rule) => Rule.min(0),
            },
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
          name: 'propertyTax',
          title: 'Annual Property Tax',
          type: 'object',
          fields: [
            {
              name: 'amount',
              title: 'Amount',
              type: 'number',
              validation: (Rule) => Rule.min(0),
            },
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
      ],
    }),

    // Discounts
    defineField({
      name: 'discounts',
      title: 'Discounts',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'type',
              title: 'Discount Type',
              type: 'string',
              options: {
                list: [
                  {title: 'Early Booking', value: 'earlyBooking'},
                  {title: 'Last Minute', value: 'lastMinute'},
                  {title: 'Long Stay', value: 'longStay'},
                  {title: 'Repeat Guest', value: 'repeatGuest'},
                  {title: 'Group', value: 'group'},
                ],
              },
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'percentage',
              title: 'Discount Percentage',
              type: 'number',
              validation: (Rule) => Rule.required().min(0).max(100),
            },
            {
              name: 'conditions',
              title: 'Conditions',
              type: 'text',
              rows: 2,
              description: 'Conditions for this discount to apply',
            },
          ],
        },
      ],
    }),
  ],
})