import { defineType, defineField } from 'sanity'
import { PlayIcon } from '@sanity/icons'

export const golfCourse = defineType({
  name: 'golfCourse',
  title: 'Golf Course',
  type: 'document',
  icon: PlayIcon,
  fields: [
    defineField({
      name: 'name_en',
      title: 'Course Name (English)',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'name_es',
      title: 'Course Name (Spanish)',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name_en',
        maxLength: 96
      },
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'object',
      fields: [
        defineField({
          name: 'address_en',
          title: 'Address (English)',
          type: 'text',
          rows: 2
        }),
        defineField({
          name: 'address_es',
          title: 'Address (Spanish)',
          type: 'text',
          rows: 2
        }),
        defineField({
          name: 'coordinates',
          title: 'GPS Coordinates',
          type: 'object',
          fields: [
            defineField({
              name: 'lat',
              title: 'Latitude',
              type: 'number',
              validation: Rule => Rule.min(-90).max(90)
            }),
            defineField({
              name: 'lng',
              title: 'Longitude',
              type: 'number',
              validation: Rule => Rule.min(-180).max(180)
            })
          ]
        })
      ]
    }),
    defineField({
      name: 'courseDetails',
      title: 'Course Details',
      type: 'object',
      fields: [
        defineField({
          name: 'holes',
          title: 'Number of Holes',
          type: 'number',
          validation: Rule => Rule.required().positive()
        }),
        defineField({
          name: 'par',
          title: 'Par',
          type: 'number',
          validation: Rule => Rule.required().positive()
        }),
        defineField({
          name: 'difficulty',
          title: 'Difficulty Level',
          type: 'string',
          options: {
            list: [
              { title: 'Beginner', value: 'beginner' },
              { title: 'Intermediate', value: 'intermediate' },
              { title: 'Advanced', value: 'advanced' },
              { title: 'Professional', value: 'professional' }
            ]
          }
        }),
        defineField({
          name: 'yardage',
          title: 'Total Yardage',
          type: 'number'
        }),
        defineField({
          name: 'designer',
          title: 'Course Designer',
          type: 'string'
        })
      ]
    }),
    defineField({
      name: 'summary_en',
      title: 'Course Summary (English)',
      type: 'text',
      rows: 4,
      description: 'Brief overview of the golf course'
    }),
    defineField({
      name: 'summary_es',
      title: 'Course Summary (Spanish)',
      type: 'text',
      rows: 4,
      description: 'Brief overview of the golf course'
    }),
    defineField({
      name: 'highlights_en',
      title: 'Course Highlights (English)',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Key features and highlights of the course'
    }),
    defineField({
      name: 'highlights_es',
      title: 'Course Highlights (Spanish)',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Key features and highlights of the course'
    }),
    defineField({
      name: 'description_en',
      title: 'Detailed Description (English)',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'H1', value: 'h1' },
            { title: 'H2', value: 'h2' },
            { title: 'H3', value: 'h3' },
            { title: 'Quote', value: 'blockquote' }
          ],
          lists: [
            { title: 'Bullet', value: 'bullet' },
            { title: 'Numbered', value: 'number' }
          ]
        },
        {
          type: 'image',
          options: { hotspot: true }
        }
      ]
    }),
    defineField({
      name: 'description_es',
      title: 'Detailed Description (Spanish)',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'H1', value: 'h1' },
            { title: 'H2', value: 'h2' },
            { title: 'H3', value: 'h3' },
            { title: 'Quote', value: 'blockquote' }
          ],
          lists: [
            { title: 'Bullet', value: 'bullet' },
            { title: 'Numbered', value: 'number' }
          ]
        },
        {
          type: 'image',
          options: { hotspot: true }
        }
      ]
    }),
    defineField({
      name: 'media',
      title: 'Media Gallery',
      type: 'object',
      fields: [
        defineField({
          name: 'images',
          title: 'Images',
          type: 'array',
          of: [
            {
              type: 'image',
              options: {
                hotspot: true
              },
              fields: [
                defineField({
                  name: 'caption_en',
                  title: 'Caption (English)',
                  type: 'string'
                }),
                defineField({
                  name: 'caption_es',
                  title: 'Caption (Spanish)',
                  type: 'string'
                })
              ]
            }
          ]
        }),
        defineField({
          name: 'videos',
          title: 'Videos',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                defineField({
                  name: 'title_en',
                  title: 'Video Title (English)',
                  type: 'string'
                }),
                defineField({
                  name: 'title_es',
                  title: 'Video Title (Spanish)',
                  type: 'string'
                }),
                defineField({
                  name: 'videoUrl',
                  title: 'Video URL',
                  type: 'url'
                }),
                defineField({
                  name: 'thumbnail',
                  title: 'Video Thumbnail',
                  type: 'image',
                  options: { hotspot: true }
                })
              ]
            }
          ]
        })
      ]
    }),
    defineField({
      name: 'contact',
      title: 'Contact Information',
      type: 'object',
      fields: [
        defineField({
          name: 'phone',
          title: 'Phone Number',
          type: 'string'
        }),
        defineField({
          name: 'email',
          title: 'Email',
          type: 'email'
        }),
        defineField({
          name: 'website',
          title: 'Website',
          type: 'url'
        }),
        defineField({
          name: 'bookingUrl',
          title: 'Booking URL',
          type: 'url',
          description: 'Direct link to book tee times'
        })
      ]
    }),
    defineField({
      name: 'pricing',
      title: 'Pricing Information',
      type: 'object',
      fields: [
        defineField({
          name: 'greenFees',
          title: 'Green Fees',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                defineField({
                  name: 'category_en',
                  title: 'Category (English)',
                  type: 'string',
                  description: 'e.g., "Weekday", "Weekend", "Twilight"'
                }),
                defineField({
                  name: 'category_es',
                  title: 'Category (Spanish)',
                  type: 'string'
                }),
                defineField({
                  name: 'price',
                  title: 'Price',
                  type: 'number'
                }),
                defineField({
                  name: 'currency',
                  title: 'Currency',
                  type: 'string',
                  initialValue: 'USD'
                })
              ]
            }
          ]
        })
      ]
    }),
    defineField({
      name: 'amenities',
      title: 'Course Amenities',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'name_en',
              title: 'Amenity (English)',
              type: 'string'
            }),
            defineField({
              name: 'name_es',
              title: 'Amenity (Spanish)',
              type: 'string'
            }),
            defineField({
              name: 'icon',
              title: 'Icon',
              type: 'string',
              description: 'Icon name or emoji'
            })
          ]
        }
      ]
    }),
    defineField({
      name: 'seo',
      title: 'SEO Settings',
      type: 'seo'
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Draft', value: 'draft' },
          { title: 'Published', value: 'published' }
        ]
      },
      initialValue: 'draft'
    }),
    defineField({
      name: 'featured',
      title: 'Featured Course',
      type: 'boolean',
      description: 'Show this course prominently on listings',
      initialValue: false
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      description: 'Order in which courses appear (lower numbers first)'
    })
  ],
  preview: {
    select: {
      title: 'name_en',
      holes: 'courseDetails.holes',
      par: 'courseDetails.par',
      media: 'media.images.0',
      status: 'status',
      featured: 'featured'
    },
    prepare(selection) {
      const { title, holes, par, media, status, featured } = selection
      const subtitle = [
        holes && `${holes} holes`,
        par && `Par ${par}`,
        status === 'published' ? '● Published' : '○ Draft',
        featured && '⭐ Featured'
      ].filter(Boolean).join(' • ')
      
      return {
        title: title || 'Untitled Course',
        subtitle,
        media
      }
    }
  },
  orderings: [
    {
      title: 'Display Order',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }]
    },
    {
      title: 'Name A-Z',
      name: 'nameAsc',
      by: [{ field: 'name_en', direction: 'asc' }]
    },
    {
      title: 'Featured First',
      name: 'featuredFirst',
      by: [
        { field: 'featured', direction: 'desc' },
        { field: 'order', direction: 'asc' }
      ]
    }
  ]
})