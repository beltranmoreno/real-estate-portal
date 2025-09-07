import {defineType, defineField} from 'sanity'
import {dateRangeField} from '../../lib/schemaHelpers'

export const availability = defineType({
  name: 'availability',
  title: 'Availability',
  type: 'object',
  fields: [
    defineField({
      name: 'isAvailable',
      title: 'Currently Available',
      type: 'boolean',
      initialValue: true,
      description: 'Master switch for property availability',
    }),

    defineField({
      name: 'availableFrom',
      title: 'Available From',
      type: 'date',
      description: 'Date when property becomes available',
    }),

    defineField({
      name: 'availableUntil',
      title: 'Available Until',
      type: 'date',
      description: 'Date when property is no longer available (for seasonal properties)',
    }),

    defineField({
      name: 'blockedDates',
      title: 'Blocked Date Ranges',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
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
              validation: (Rule) => 
                Rule.required().custom((endDate: string, context: any) => {
                  const {startDate} = context.parent
                  if (!startDate || !endDate) return true
                  return new Date(endDate) >= new Date(startDate) 
                    ? true 
                    : 'End date must be on or after start date'
                }),
            },
            {
              name: 'reason',
              title: 'Reason',
              type: 'string',
              options: {
                list: [
                  {title: 'Booked', value: 'booked'},
                  {title: 'Maintenance', value: 'maintenance'},
                  {title: 'Owner Use', value: 'owner'},
                  {title: 'Other', value: 'other'},
                ],
              },
              initialValue: 'booked',
            },
            {
              name: 'note',
              title: 'Internal Note',
              type: 'string',
              description: 'Internal note about this blocking (not shown to users)',
            },
          ],
          preview: {
            select: {
              startDate: 'startDate',
              endDate: 'endDate',
              reason: 'reason',
            },
            prepare({startDate, endDate, reason}) {
              return {
                title: `${startDate} - ${endDate}`,
                subtitle: reason ? reason.charAt(0).toUpperCase() + reason.slice(1) : '',
              }
            },
          },
        },
      ],
    }),

    defineField({
      name: 'checkInTime',
      title: 'Check-in Time',
      type: 'string',
      initialValue: '15:00',
      description: 'Default check-in time (24-hour format)',
    }),

    defineField({
      name: 'checkOutTime',
      title: 'Check-out Time',
      type: 'string',
      initialValue: '11:00',
      description: 'Default check-out time (24-hour format)',
    }),

    defineField({
      name: 'flexibleCheckIn',
      title: 'Flexible Check-in',
      type: 'boolean',
      initialValue: false,
      description: 'Allow flexible check-in times',
    }),

    defineField({
      name: 'instantBooking',
      title: 'Instant Booking',
      type: 'boolean',
      initialValue: false,
      description: 'Allow instant booking without approval',
    }),

    defineField({
      name: 'advanceBookingDays',
      title: 'Advance Booking Days',
      type: 'number',
      validation: (Rule) => Rule.min(0).integer(),
      description: 'How many days in advance can guests book',
    }),

    defineField({
      name: 'preparationTime',
      title: 'Preparation Time (days)',
      type: 'number',
      validation: (Rule) => Rule.min(0).integer(),
      initialValue: 1,
      description: 'Days needed between bookings for cleaning/preparation',
    }),

    defineField({
      name: 'bookingWindow',
      title: 'Booking Window (months)',
      type: 'number',
      validation: (Rule) => Rule.min(1).max(24).integer(),
      initialValue: 12,
      description: 'How many months ahead can the property be booked',
    }),
  ],
})