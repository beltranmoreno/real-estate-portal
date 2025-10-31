import {defineType, defineField} from 'sanity'
import {bilingualTextField} from '../../lib/schemaHelpers'

export const review = defineType({
  name: 'review',
  title: 'Review',
  type: 'document',
  fields: [
    defineField({
      name: 'property',
      title: 'Property',
      type: 'reference',
      to: [{type: 'property'}],
      validation: (Rule) => Rule.required(),
      description: 'Property being reviewed',
    }),

    defineField({
      name: 'rating',
      title: 'Rating',
      type: 'number',
      validation: (Rule) => Rule.required().min(1).max(5),
      description: 'Rating out of 5 stars',
    }),

    defineField({
      name: 'reviewerName',
      title: 'Reviewer Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
      description: 'Name of the person leaving the review',
    }),

    defineField({
      name: 'reviewerLocation',
      title: 'Reviewer Location',
      type: 'string',
      description: 'City and country of reviewer (e.g., "New York, USA")',
    }),

    defineField({
      name: 'stayDate',
      title: 'Stay Date',
      type: 'date',
      description: 'Month/Year when they stayed at the property',
    }),

    defineField({
      name: 'reviewDate',
      title: 'Review Date',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
      initialValue: () => new Date().toISOString(),
      description: 'Date when the review was posted',
    }),

    ...bilingualTextField('title', 'Review Title', {
      description: 'Short title/summary of the review',
    }),

    ...bilingualTextField('content', 'Review Content', {
      required: true,
      rows: 6,
      description: 'Full text content of the review',
    }),

    defineField({
      name: 'verified',
      title: 'Verified Stay',
      type: 'boolean',
      initialValue: false,
      description: 'Mark if this is a verified guest who actually stayed',
    }),

    defineField({
      name: 'featured',
      title: 'Featured Review',
      type: 'boolean',
      initialValue: false,
      description: 'Highlight this review on the property page',
    }),

    defineField({
      name: 'isPublished',
      title: 'Published',
      type: 'boolean',
      initialValue: true,
      description: 'Show this review publicly',
    }),

    defineField({
      name: 'response',
      title: 'Host Response',
      type: 'object',
      fields: [
        {
          name: 'content_en',
          title: 'Response (English)',
          type: 'text',
          rows: 4,
        },
        {
          name: 'content_es',
          title: 'Response (Español)',
          type: 'text',
          rows: 4,
        },
        {
          name: 'responseDate',
          title: 'Response Date',
          type: 'datetime',
        },
      ],
      description: 'Optional response from property host/manager',
    }),
  ],

  preview: {
    select: {
      title: 'reviewerName',
      rating: 'rating',
      property: 'property.title_en',
      date: 'reviewDate',
    },
    prepare({title, rating, property, date}) {
      const stars = '⭐'.repeat(Math.round(rating || 0))
      return {
        title: `${title} - ${stars}`,
        subtitle: `${property} • ${date ? new Date(date).toLocaleDateString() : ''}`,
      }
    },
  },

  orderings: [
    {
      title: 'Review Date, Newest First',
      name: 'reviewDateDesc',
      by: [{field: 'reviewDate', direction: 'desc'}],
    },
    {
      title: 'Rating, Highest First',
      name: 'ratingDesc',
      by: [{field: 'rating', direction: 'desc'}],
    },
  ],
})
