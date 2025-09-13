import { defineType, defineField } from 'sanity'
import { HomeIcon } from '@sanity/icons'

export const restaurant = defineType({
  name: 'restaurant',
  title: 'Restaurant',
  type: 'document',
  icon: HomeIcon,
  fields: [
    defineField({
      name: 'name_en',
      title: 'Restaurant Name (English)',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'name_es',
      title: 'Restaurant Name (Spanish)',
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
      name: 'area',
      title: 'Area/Location',
      type: 'string',
      options: {
        list: [
          { title: 'Altos de Chavón', value: 'altos-de-chavon' },
          { title: 'Marina', value: 'marina' },
          { title: 'Hotel', value: 'hotel' },
          { title: 'Golf Club', value: 'golf-club' },
          { title: 'Beach Club', value: 'beach-club' },
          { title: 'Other', value: 'other' }
        ]
      },
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'cuisine',
      title: 'Cuisine Type',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'Italian', value: 'italian' },
          { title: 'Mediterranean', value: 'mediterranean' },
          { title: 'Caribbean', value: 'caribbean' },
          { title: 'Dominican', value: 'dominican' },
          { title: 'Asian', value: 'asian' },
          { title: 'Japanese', value: 'japanese' },
          { title: 'Mexican', value: 'mexican' },
          { title: 'American', value: 'american' },
          { title: 'International', value: 'international' },
          { title: 'Seafood', value: 'seafood' },
          { title: 'Steakhouse', value: 'steakhouse' },
          { title: 'French', value: 'french' },
          { title: 'Spanish', value: 'spanish' },
          { title: 'Fusion', value: 'fusion' }
        ]
      }
    }),
    defineField({
      name: 'vibes',
      title: 'Restaurant Vibes',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'Romantic', value: 'romantic' },
          { title: 'Family-Friendly', value: 'family' },
          { title: 'Trendy', value: 'trendy' },
          { title: 'Casual', value: 'casual' },
          { title: 'Fine Dining', value: 'fine-dining' },
          { title: 'Lively', value: 'lively' },
          { title: 'Scenic Views', value: 'scenic' },
          { title: 'Healthy Options', value: 'healthy' },
          { title: 'Local Favorite', value: 'local' },
          { title: 'Luxury', value: 'luxury' },
          { title: 'Beachfront', value: 'beachfront' },
          { title: 'Garden Setting', value: 'garden' }
        ],
        layout: 'tags'
      },
      description: 'Select the vibes/atmosphere that best describe this restaurant'
    }),
    defineField({
      name: 'summary_en',
      title: 'Restaurant Summary (English)',
      type: 'text',
      rows: 4,
      description: 'Brief overview of the restaurant'
    }),
    defineField({
      name: 'summary_es',
      title: 'Restaurant Summary (Spanish)',
      type: 'text',
      rows: 4,
      description: 'Brief overview of the restaurant'
    }),
    defineField({
      name: 'highlights_en',
      title: 'Restaurant Highlights (English)',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Key features, signature dishes, or special attributes'
    }),
    defineField({
      name: 'highlights_es',
      title: 'Restaurant Highlights (Spanish)',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Key features, signature dishes, or special attributes'
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
          name: 'featuredImage',
          title: 'Featured Image',
          type: 'image',
          options: { hotspot: true },
          description: 'Main restaurant image for listings and headers'
        }),
        defineField({
          name: 'gallery',
          title: 'Photo Gallery',
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
                }),
                defineField({
                  name: 'category',
                  title: 'Image Category',
                  type: 'string',
                  options: {
                    list: [
                      { title: 'Exterior', value: 'exterior' },
                      { title: 'Interior', value: 'interior' },
                      { title: 'Food', value: 'food' },
                      { title: 'Ambiance', value: 'ambiance' },
                      { title: 'Staff', value: 'staff' }
                    ]
                  }
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
      name: 'hours',
      title: 'Operating Hours',
      type: 'object',
      fields: [
        defineField({
          name: 'schedule',
          title: 'Weekly Schedule',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                defineField({
                  name: 'day_en',
                  title: 'Day (English)',
                  type: 'string',
                  options: {
                    list: [
                      { title: 'Monday', value: 'Monday' },
                      { title: 'Tuesday', value: 'Tuesday' },
                      { title: 'Wednesday', value: 'Wednesday' },
                      { title: 'Thursday', value: 'Thursday' },
                      { title: 'Friday', value: 'Friday' },
                      { title: 'Saturday', value: 'Saturday' },
                      { title: 'Sunday', value: 'Sunday' }
                    ]
                  }
                }),
                defineField({
                  name: 'day_es',
                  title: 'Day (Spanish)',
                  type: 'string',
                  options: {
                    list: [
                      { title: 'Lunes', value: 'Lunes' },
                      { title: 'Martes', value: 'Martes' },
                      { title: 'Miércoles', value: 'Miércoles' },
                      { title: 'Jueves', value: 'Jueves' },
                      { title: 'Viernes', value: 'Viernes' },
                      { title: 'Sábado', value: 'Sábado' },
                      { title: 'Domingo', value: 'Domingo' }
                    ]
                  }
                }),
                defineField({
                  name: 'openTime',
                  title: 'Opening Time',
                  type: 'string',
                  description: 'e.g., "7:00 AM"'
                }),
                defineField({
                  name: 'closeTime',
                  title: 'Closing Time',
                  type: 'string',
                  description: 'e.g., "11:00 PM"'
                }),
                defineField({
                  name: 'closed',
                  title: 'Closed',
                  type: 'boolean',
                  description: 'Is the restaurant closed on this day?',
                  initialValue: false
                })
              ]
            }
          ]
        }),
        defineField({
          name: 'specialHours_en',
          title: 'Special Hours Notes (English)',
          type: 'text',
          rows: 2,
          description: 'Holiday hours, seasonal changes, etc.'
        }),
        defineField({
          name: 'specialHours_es',
          title: 'Special Hours Notes (Spanish)',
          type: 'text',
          rows: 2,
          description: 'Holiday hours, seasonal changes, etc.'
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
          name: 'reservationUrl',
          title: 'Reservation URL',
          type: 'url',
          description: 'Direct link to make reservations'
        }),
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
      name: 'pricing',
      title: 'Pricing Information',
      type: 'object',
      fields: [
        defineField({
          name: 'priceRange',
          title: 'Price Range',
          type: 'string',
          options: {
            list: [
              { title: '$ - Budget (Under $20)', value: '$' },
              { title: '$$ - Moderate ($20-50)', value: '$$' },
              { title: '$$$ - Expensive ($50-100)', value: '$$$' },
              { title: '$$$$ - Very Expensive ($100+)', value: '$$$$' }
            ]
          }
        }),
        defineField({
          name: 'averagePrice',
          title: 'Average Price Per Person',
          type: 'number',
          description: 'Average cost per person in USD'
        }),
        defineField({
          name: 'currency',
          title: 'Currency',
          type: 'string',
          initialValue: 'USD'
        })
      ]
    }),
    defineField({
      name: 'features',
      title: 'Restaurant Features',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'feature_en',
              title: 'Feature (English)',
              type: 'string'
            }),
            defineField({
              name: 'feature_es',
              title: 'Feature (Spanish)',
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
      title: 'Featured Restaurant',
      type: 'boolean',
      description: 'Show this restaurant prominently on listings',
      initialValue: false
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      description: 'Order in which restaurants appear within their area (lower numbers first)'
    }),
    defineField({
      name: 'leticiaRecommendation',
      title: 'Leticia Recommendation',
      type: 'leticiaRecommendation',
      description: 'Leticia\'s recommendation for this restaurant',
    })
  ],
  preview: {
    select: {
      title: 'name_en',
      area: 'area',
      cuisine: 'cuisine',
      priceRange: 'pricing.priceRange',
      media: 'media.featuredImage',
      status: 'status',
      featured: 'featured'
    },
    prepare(selection) {
      const { title, area, cuisine, priceRange, media, status, featured } = selection
      const areaLabel = area?.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
      const cuisineTypes = Array.isArray(cuisine) ? cuisine.slice(0, 2).join(', ') : ''
      
      const subtitle = [
        areaLabel,
        cuisineTypes,
        priceRange,
        status === 'published' ? '● Published' : '○ Draft',
        featured && '⭐ Featured'
      ].filter(Boolean).join(' • ')
      
      return {
        title: title || 'Untitled Restaurant',
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
      title: 'Area, then Name',
      name: 'areaName',
      by: [
        { field: 'area', direction: 'asc' },
        { field: 'name_en', direction: 'asc' }
      ]
    },
    {
      title: 'Featured First',
      name: 'featuredFirst',
      by: [
        { field: 'featured', direction: 'desc' },
        { field: 'area', direction: 'asc' },
        { field: 'order', direction: 'asc' }
      ]
    }
  ]
})