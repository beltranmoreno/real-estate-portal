import {defineType, defineField} from 'sanity'
import {bilingualTextField, slugField, imageField, seoFields} from '../../lib/schemaHelpers'

export const property = defineType({
  name: 'property',
  title: 'Properties',
  type: 'document',
  groups: [
    {name: 'basic', title: 'Basic Info'},
    {name: 'location', title: 'Location'},
    {name: 'amenities', title: 'Amenities'},
    {name: 'pricing', title: 'Pricing'},
    {name: 'availability', title: 'Availability'},
    {name: 'media', title: 'Media'},
    {name: 'seo', title: 'SEO'},
  ],
  fields: [
    // Basic Info
    {
      ...bilingualTextField('title', 'Property Title', {required: true})[0],
      group: 'basic',
    },
    {
      ...bilingualTextField('title', 'Property Title', {required: true})[1],
      group: 'basic',
    },
    {
      ...slugField('title_en'),
      group: 'basic',
    },

    defineField({
      name: 'propertyCode',
      title: 'Property Code',
      type: 'string',
      group: 'basic',
      validation: (Rule) => Rule.required(),
      description: 'Unique identifier for internal use',
    }),

    {
      ...bilingualTextField('description', 'Description', {rows: 6})[0],
      group: 'basic',
    },
    {
      ...bilingualTextField('description', 'Description', {rows: 6})[1],
      group: 'basic',
    },

    {
      ...bilingualTextField('shortDescription', 'Short Description', {rows: 2})[0],
      group: 'basic',
    },
    {
      ...bilingualTextField('shortDescription', 'Short Description', {rows: 2})[1],
      group: 'basic',
    },

    defineField({
      name: 'status',
      title: 'Property Status',
      type: 'string',
      group: 'basic',
      options: {
        list: [
          {title: 'Active', value: 'active'},
          {title: 'Inactive', value: 'inactive'},
          {title: 'Pending', value: 'pending'},
          {title: 'Sold', value: 'sold'},
        ],
      },
      initialValue: 'active',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'propertyType',
      title: 'Property Type',
      type: 'string',
      group: 'basic',
      options: {
        list: [
          {title: 'Villa', value: 'villa'},
          {title: 'Apartment', value: 'apartment'},
          {title: 'Condo', value: 'condo'},
          {title: 'House', value: 'house'},
          {title: 'Penthouse', value: 'penthouse'},
          {title: 'Townhouse', value: 'townhouse'},
          {title: 'Studio', value: 'studio'},
          {title: 'Loft', value: 'loft'},
        ],
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'themes',
      title: 'Property Themes',
      type: 'array',
      group: 'basic',
      of: [{type: 'string'}],
      options: {
        list: [
          {title: 'Family Friendly', value: 'family'},
          {title: 'Golf', value: 'golf'},
          {title: 'Beachfront', value: 'beachfront'},
          {title: 'Remote Work', value: 'remote-work'},
          {title: 'Events', value: 'events'},
          {title: 'Luxury', value: 'luxury'},
          {title: 'Budget', value: 'budget'},
          {title: 'Pet Friendly', value: 'pet-friendly'},
          {title: 'Eco-Friendly', value: 'eco-friendly'},
          {title: 'Romantic', value: 'romantic'},
        ],
      },
      description: 'Themes for categorizing and filtering',
    }),

    defineField({
      name: 'isFeatured',
      title: 'Featured Property',
      type: 'boolean',
      group: 'basic',
      initialValue: false,
      description: 'Show in featured properties section',
    }),

    // Location
    defineField({
      name: 'location',
      title: 'Location',
      type: 'location',
      group: 'location',
      validation: (Rule) => Rule.required(),
    }),

    // Amenities
    defineField({
      name: 'amenities',
      title: 'Amenities',
      type: 'amenities',
      group: 'amenities',
      validation: (Rule) => Rule.required(),
    }),

    // Pricing
    defineField({
      name: 'pricing',
      title: 'Pricing',
      type: 'pricing',
      group: 'pricing',
      validation: (Rule) => Rule.required(),
    }),

    // Availability
    defineField({
      name: 'availability',
      title: 'Availability',
      type: 'availability',
      group: 'availability',
      validation: (Rule) => Rule.required(),
    }),

    // Media
    {
      ...imageField('mainImage', 'Main Image', {
        required: true,
        description: 'Primary image shown in listings',
      }),
      group: 'media',
    },

    defineField({
      name: 'gallery',
      title: 'Photo Gallery',
      type: 'array',
      group: 'media',
      of: [
        {
          type: 'image',
          options: {
            hotspot: true,
            metadata: ['blurhash', 'lqip', 'palette'],
          },
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Alternative text',
            },
            {
              name: 'caption',
              type: 'string',
              title: 'Caption',
            },
            {
              name: 'category',
              type: 'string',
              title: 'Category',
              options: {
                list: [
                  {title: 'Exterior', value: 'exterior'},
                  {title: 'Interior', value: 'interior'},
                  {title: 'Bedroom', value: 'bedroom'},
                  {title: 'Bathroom', value: 'bathroom'},
                  {title: 'Kitchen', value: 'kitchen'},
                  {title: 'Living Area', value: 'living'},
                  {title: 'Dining', value: 'dining'},
                  {title: 'Pool', value: 'pool'},
                  {title: 'View', value: 'view'},
                  {title: 'Amenities', value: 'amenities'},
                ],
              },
            },
          ],
        },
      ],
      validation: (Rule) => Rule.min(4).error('At least 4 gallery images required'),
    }),

    defineField({
      name: 'virtualTourUrl',
      title: 'Virtual Tour URL',
      type: 'url',
      group: 'media',
      description: 'Link to 360° virtual tour or video walkthrough',
    }),

    defineField({
      name: 'videoUrl',
      title: 'Property Video URL',
      type: 'url',
      group: 'media',
      description: 'YouTube or Vimeo video URL',
    }),

    defineField({
      name: 'floorPlan',
      title: 'Floor Plan',
      type: 'image',
      group: 'media',
      options: {
        hotspot: false,
      },
    }),

    // House Rules
    defineField({
      name: 'houseRules',
      title: 'House Rules',
      type: 'object',
      group: 'basic',
      fields: [
        {
          name: 'smokingAllowed',
          title: 'Smoking Allowed',
          type: 'boolean',
          initialValue: false,
        },
        {
          name: 'petsAllowed',
          title: 'Pets Allowed',
          type: 'boolean',
          initialValue: false,
        },
        {
          name: 'eventsAllowed',
          title: 'Events Allowed',
          type: 'boolean',
          initialValue: false,
        },
        {
          name: 'maxEventGuests',
          title: 'Maximum Event Guests',
          type: 'number',
          hidden: ({parent}) => !parent?.eventsAllowed,
          validation: (Rule) => Rule.min(0).integer(),
        },
        {
          name: 'quietHoursStart',
          title: 'Quiet Hours Start',
          type: 'string',
          description: '24-hour format (e.g., 22:00)',
        },
        {
          name: 'quietHoursEnd',
          title: 'Quiet Hours End',
          type: 'string',
          description: '24-hour format (e.g., 08:00)',
        },
        ...bilingualTextField('additionalRules', 'Additional Rules', {rows: 3}),
      ],
    }),

    // Agent Assignment
    defineField({
      name: 'agent',
      title: 'Assigned Agent',
      type: 'reference',
      to: [{type: 'agent'}],
      group: 'basic',
      description: 'Real estate agent responsible for this property',
    }),

    // Contact
    defineField({
      name: 'contactInfo',
      title: 'Contact Information (Fallback)',
      type: 'object',
      group: 'basic',
      fields: [
        {
          name: 'hostName',
          title: 'Host/Owner Name',
          type: 'string',
        },
        {
          name: 'phone',
          title: 'Phone Number',
          type: 'string',
        },
        {
          name: 'whatsapp',
          title: 'WhatsApp Number',
          type: 'string',
        },
        {
          name: 'email',
          title: 'Email',
          type: 'email',
        },
        {
          name: 'responseTime',
          title: 'Average Response Time (hours)',
          type: 'number',
          validation: (Rule) => Rule.min(0),
        },
        ...bilingualTextField('languages', 'Languages Spoken'),
      ],
    }),

    // Reviews
    defineField({
      name: 'reviews',
      title: 'Reviews',
      type: 'object',
      group: 'basic',
      fields: [
        {
          name: 'averageRating',
          title: 'Average Rating',
          type: 'number',
          validation: (Rule) => Rule.min(0).max(5),
        },
        {
          name: 'totalReviews',
          title: 'Total Reviews',
          type: 'number',
          validation: (Rule) => Rule.min(0).integer(),
        },
      ],
    }),

    // SEO
    ...(seoFields().map(field => ({...field, group: 'seo'}))),
  ],

  preview: {
    select: {
      title: 'title_en',
      subtitle: 'propertyCode',
      media: 'mainImage',
      featured: 'isFeatured',
      status: 'status',
      bedrooms: 'amenities.bedrooms',
    },
    prepare({title, subtitle, media, featured, status, bedrooms}) {
      const statusEmoji = status === 'active' ? '🟢' : status === 'inactive' ? '🔴' : '🟡'
      return {
        title: `${featured ? '⭐ ' : ''}${title}`,
        subtitle: `${statusEmoji} ${subtitle} • ${bedrooms} BR`,
        media,
      }
    },
  },
})