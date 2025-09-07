import {defineType, defineField} from 'sanity'
import {bilingualTextField, slugField, imageField} from '../../lib/schemaHelpers'

export const collection = defineType({
  name: 'collection',
  title: 'Collections',
  type: 'document',
  description: 'Curated property collections for special events or groups',
  fields: [
    ...bilingualTextField('title', 'Collection Title', {required: true}),
    slugField('title_en'),

    ...bilingualTextField('description', 'Description', {
      rows: 3,
      description: 'Brief description of this collection',
    }),

    defineField({
      name: 'collectionType',
      title: 'Collection Type',
      type: 'string',
      options: {
        list: [
          {title: 'Wedding', value: 'wedding'},
          {title: 'Corporate Event', value: 'corporate'},
          {title: 'Family Reunion', value: 'family-reunion'},
          {title: 'Group Travel', value: 'group'},
          {title: 'Seasonal', value: 'seasonal'},
          {title: 'Curated Selection', value: 'curated'},
          {title: 'Special Offer', value: 'offer'},
        ],
      },
      validation: (Rule) => Rule.required(),
    }),

    imageField('coverImage', 'Cover Image', {
      description: 'Image shown at the top of the collection page',
    }),

    defineField({
      name: 'properties',
      title: 'Properties',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{type: 'property'}],
          options: {
            disableNew: true,
          },
        },
      ],
      validation: (Rule) => Rule.required().min(1).error('At least one property required'),
    }),

    defineField({
      name: 'dateRange',
      title: 'Event Date Range',
      type: 'object',
      fields: [
        {
          name: 'startDate',
          title: 'Start Date',
          type: 'date',
        },
        {
          name: 'endDate',
          title: 'End Date',
          type: 'date',
        },
      ],
      description: 'Optional: Specific dates for this collection (e.g., wedding dates)',
    }),

    defineField({
      name: 'expiresAt',
      title: 'Expiration Date',
      type: 'datetime',
      description: 'When this collection should no longer be accessible',
    }),

    defineField({
      name: 'isActive',
      title: 'Active',
      type: 'boolean',
      initialValue: true,
      description: 'Whether this collection is currently active',
    }),

    defineField({
      name: 'isPublic',
      title: 'Public Collection',
      type: 'boolean',
      initialValue: false,
      description: 'Whether this collection is publicly discoverable',
    }),

    defineField({
      name: 'accessCode',
      title: 'Access Code',
      type: 'string',
      description: 'Optional access code for private collections',
      hidden: ({document}) => document?.isPublic === true,
    }),

    ...bilingualTextField('welcomeMessage', 'Welcome Message', {
      rows: 4,
      description: 'Message shown at the top of the collection page',
    }),

    defineField({
      name: 'organizer',
      title: 'Organizer Information',
      type: 'object',
      fields: [
        {
          name: 'name',
          title: 'Organizer Name',
          type: 'string',
        },
        {
          name: 'email',
          title: 'Email',
          type: 'email',
        },
        {
          name: 'phone',
          title: 'Phone',
          type: 'string',
        },
        {
          name: 'company',
          title: 'Company/Organization',
          type: 'string',
        },
      ],
    }),

    defineField({
      name: 'customization',
      title: 'Customization',
      type: 'object',
      fields: [
        {
          name: 'primaryColor',
          title: 'Primary Color',
          type: 'string',
          description: 'Custom brand color for this collection (hex code)',
          validation: (Rule: any) => Rule.regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
            name: 'hex color',
            invert: false
          }).error('Must be a valid hex color code (e.g., #FF5733)'),
        },
        {
          name: 'logo',
          title: 'Custom Logo',
          type: 'image',
          options: {
            hotspot: true,
          },
          description: 'Custom logo for the collection page',
        },
        {
          name: 'backgroundImage',
          title: 'Background Image',
          type: 'image',
          options: {
            hotspot: true,
          },
          description: 'Background image for the collection page',
        },
      ],
    }),

    defineField({
      name: 'features',
      title: 'Collection Features',
      type: 'object',
      fields: [
        {
          name: 'showPricing',
          title: 'Show Pricing',
          type: 'boolean',
          initialValue: true,
        },
        {
          name: 'allowInquiries',
          title: 'Allow Direct Inquiries',
          type: 'boolean',
          initialValue: true,
        },
        {
          name: 'showAvailability',
          title: 'Show Availability',
          type: 'boolean',
          initialValue: true,
        },
        {
          name: 'enableSharing',
          title: 'Enable Sharing',
          type: 'boolean',
          initialValue: true,
        },
        {
          name: 'requireLogin',
          title: 'Require Login',
          type: 'boolean',
          initialValue: false,
        },
      ],
    }),

    defineField({
      name: 'metadata',
      title: 'Metadata',
      type: 'object',
      fields: [
        {
          name: 'expectedGuests',
          title: 'Expected Number of Guests',
          type: 'number',
          validation: (Rule) => Rule.min(0).integer(),
        },
        {
          name: 'budget',
          title: 'Budget Range',
          type: 'object',
          fields: [
            {
              name: 'min',
              title: 'Minimum',
              type: 'number',
            },
            {
              name: 'max',
              title: 'Maximum',
              type: 'number',
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
        },
        ...bilingualTextField('notes', 'Internal Notes', {
          rows: 3,
          description: 'Internal notes about this collection',
        }),
      ],
    }),

    defineField({
      name: 'analytics',
      title: 'Analytics',
      type: 'object',
      readOnly: true,
      fields: [
        {
          name: 'views',
          title: 'Total Views',
          type: 'number',
          initialValue: 0,
        },
        {
          name: 'shares',
          title: 'Total Shares',
          type: 'number',
          initialValue: 0,
        },
        {
          name: 'inquiries',
          title: 'Total Inquiries',
          type: 'number',
          initialValue: 0,
        },
        {
          name: 'lastViewed',
          title: 'Last Viewed',
          type: 'datetime',
        },
      ],
    }),
  ],

  preview: {
    select: {
      title: 'title_en',
      subtitle: 'collectionType',
      media: 'coverImage',
      active: 'isActive',
      propertyCount: 'properties.length',
      expiresAt: 'expiresAt',
    },
    prepare({title, subtitle, media, active, propertyCount, expiresAt}) {
      const isExpired = expiresAt && new Date(expiresAt) < new Date()
      const status = !active ? '🔴' : isExpired ? '⏰' : '🟢'
      return {
        title: `${status} ${title}`,
        subtitle: `${subtitle} • ${propertyCount || 0} properties`,
        media,
      }
    },
  },
})