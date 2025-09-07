import {defineField, defineType} from 'sanity'

/**
 * Creates a bilingual text field with ES and EN versions
 */
export const bilingualTextField = (
  name: string,
  title: string,
  options?: {
    required?: boolean
    rows?: number
    description?: string
  }
) => {
  const baseValidation = options?.required 
    ? (Rule: any) => Rule.required() 
    : undefined

  return [
    defineField({
      name: `${name}_es`,
      title: `${title} (Español)`,
      type: options?.rows ? 'text' : 'string',
      description: options?.description,
      validation: baseValidation,
      ...(options?.rows && { rows: options.rows }),
    }),
    defineField({
      name: `${name}_en`,
      title: `${title} (English)`,
      type: options?.rows ? 'text' : 'string',
      description: options?.description,
      validation: baseValidation,
      ...(options?.rows && { rows: options.rows }),
    }),
  ]
}

/**
 * Creates a slug field with auto-generation from a source field
 */
export const slugField = (source: string = 'title_en') =>
  defineField({
    name: 'slug',
    title: 'URL Slug',
    type: 'slug',
    validation: (Rule) => Rule.required(),
    options: {
      source: source,
      maxLength: 96,
      slugify: (input: string) =>
        input
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^\w\-]+/g, '')
          .replace(/\-\-+/g, '-')
          .trim(),
    },
  })

/**
 * Creates an image field with metadata
 */
export const imageField = (
  name: string,
  title: string,
  options?: {
    required?: boolean
    description?: string
    hotspot?: boolean
  }
) =>
  defineField({
    name,
    title,
    type: 'image',
    description: options?.description,
    validation: options?.required ? (Rule) => Rule.required() : undefined,
    options: {
      hotspot: options?.hotspot ?? true,
      metadata: ['blurhash', 'lqip', 'palette'],
    },
    fields: [
      {
        name: 'alt',
        type: 'string',
        title: 'Alternative text',
        description: 'Important for SEO and accessibility',
      },
    ],
  })

/**
 * Creates a reference field to another document
 */
export const referenceField = (
  name: string,
  title: string,
  documentType: string | string[],
  options?: {
    required?: boolean
    description?: string
  }
) =>
  defineField({
    name,
    title,
    type: 'reference',
    to: Array.isArray(documentType) 
      ? documentType.map(type => ({ type }))
      : [{ type: documentType }],
    description: options?.description,
    validation: options?.required ? (Rule) => Rule.required() : undefined,
  })

/**
 * Creates a price field with currency
 */
export const priceField = (
  name: string,
  title: string,
  options?: {
    required?: boolean
    description?: string
  }
) =>
  defineField({
    name,
    title,
    type: 'object',
    description: options?.description,
    validation: options?.required ? (Rule) => Rule.required() : undefined,
    fields: [
      {
        name: 'amount',
        title: 'Amount',
        type: 'number',
        validation: (Rule) => Rule.positive(),
      },
      {
        name: 'currency',
        title: 'Currency',
        type: 'string',
        options: {
          list: [
            { title: 'USD', value: 'USD' },
            { title: 'DOP', value: 'DOP' },
          ],
        },
        initialValue: 'USD',
        validation: (Rule) => Rule.required(),
      },
    ],
  })

/**
 * Creates a date range field for availability
 */
export const dateRangeField = (
  name: string,
  title: string,
  options?: {
    required?: boolean
    description?: string
  }
) =>
  defineField({
    name,
    title,
    type: 'object',
    description: options?.description,
    validation: options?.required ? (Rule) => Rule.required() : undefined,
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
            return new Date(endDate) > new Date(startDate) 
              ? true 
              : 'End date must be after start date'
          }),
      },
    ],
  })

/**
 * Creates a SEO metadata object
 */
export const seoFields = () => [
  defineField({
    name: 'seo',
    title: 'SEO Metadata',
    type: 'object',
    fields: [
      ...bilingualTextField('metaTitle', 'Meta Title', {
        description: 'Title for search engines (50-60 characters)',
      }),
      ...bilingualTextField('metaDescription', 'Meta Description', {
        rows: 3,
        description: 'Description for search engines (150-160 characters)',
      }),
      defineField({
        name: 'ogImage',
        title: 'Social Share Image',
        type: 'image',
        description: 'Image for social media sharing (1200x630px recommended)',
        options: {
          hotspot: true,
        },
      }),
    ],
  }),
]