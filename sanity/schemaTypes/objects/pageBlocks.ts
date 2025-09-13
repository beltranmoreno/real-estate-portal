import { defineType, defineField } from 'sanity'

export const pageBlocks = defineType({
  name: 'pageBlocks',
  type: 'array',
  title: 'Page Content',
  of: [
    // Hero Block
    {
      type: 'object',
      name: 'hero',
      title: 'Hero Section',
      fields: [
        defineField({
          name: 'title_en',
          title: 'Title (English)',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'title_es',
          title: 'Title (Spanish)',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'subtitle_en',
          title: 'Subtitle (English)',
          type: 'text',
          rows: 3
        }),
        defineField({
          name: 'subtitle_es',
          title: 'Subtitle (Spanish)',
          type: 'text',
          rows: 3
        }),
        defineField({
          name: 'image',
          title: 'Hero Image',
          type: 'image',
          options: {
            hotspot: true
          }
        }),
        defineField({
          name: 'cta',
          title: 'Call to Action',
          type: 'object',
          fields: [
            defineField({
              name: 'text_en',
              title: 'Button Text (English)',
              type: 'string'
            }),
            defineField({
              name: 'text_es',
              title: 'Button Text (Spanish)',
              type: 'string'
            }),
            defineField({
              name: 'url',
              title: 'Button URL',
              type: 'url'
            })
          ]
        })
      ],
      preview: {
        select: {
          title: 'title_en',
          media: 'image'
        },
        prepare(selection) {
          const { title, media } = selection
          return {
            title: title || 'Hero Section',
            media
          }
        }
      }
    },
    
    // Rich Text Block
    {
      type: 'object',
      name: 'richText',
      title: 'Rich Text Content',
      fields: [
        defineField({
          name: 'title_en',
          title: 'Section Title (English)',
          type: 'string'
        }),
        defineField({
          name: 'title_es',
          title: 'Section Title (Spanish)',
          type: 'string'
        }),
        defineField({
          name: 'content_en',
          title: 'Content (English)',
          type: 'array',
          of: [
            {
              type: 'block',
              styles: [
                { title: 'Normal', value: 'normal' },
                { title: 'H1', value: 'h1' },
                { title: 'H2', value: 'h2' },
                { title: 'H3', value: 'h3' },
                { title: 'H4', value: 'h4' },
                { title: 'Quote', value: 'blockquote' }
              ],
              lists: [
                { title: 'Bullet', value: 'bullet' },
                { title: 'Numbered', value: 'number' }
              ],
              marks: {
                decorators: [
                  { title: 'Strong', value: 'strong' },
                  { title: 'Emphasis', value: 'em' },
                  { title: 'Code', value: 'code' }
                ],
                annotations: [
                  {
                    title: 'URL',
                    name: 'link',
                    type: 'object',
                    fields: [
                      {
                        title: 'URL',
                        name: 'href',
                        type: 'url'
                      }
                    ]
                  }
                ]
              }
            },
            {
              type: 'image',
              options: { hotspot: true }
            }
          ]
        }),
        defineField({
          name: 'content_es',
          title: 'Content (Spanish)',
          type: 'array',
          of: [
            {
              type: 'block',
              styles: [
                { title: 'Normal', value: 'normal' },
                { title: 'H1', value: 'h1' },
                { title: 'H2', value: 'h2' },
                { title: 'H3', value: 'h3' },
                { title: 'H4', value: 'h4' },
                { title: 'Quote', value: 'blockquote' }
              ],
              lists: [
                { title: 'Bullet', value: 'bullet' },
                { title: 'Numbered', value: 'number' }
              ],
              marks: {
                decorators: [
                  { title: 'Strong', value: 'strong' },
                  { title: 'Emphasis', value: 'em' },
                  { title: 'Code', value: 'code' }
                ],
                annotations: [
                  {
                    title: 'URL',
                    name: 'link',
                    type: 'object',
                    fields: [
                      {
                        title: 'URL',
                        name: 'href',
                        type: 'url'
                      }
                    ]
                  }
                ]
              }
            },
            {
              type: 'image',
              options: { hotspot: true }
            }
          ]
        })
      ],
      preview: {
        select: {
          title: 'title_en'
        },
        prepare(selection) {
          const { title } = selection
          return {
            title: title || 'Rich Text Content'
          }
        }
      }
    },
    
    // Image Gallery Block
    {
      type: 'object',
      name: 'imageGallery',
      title: 'Image Gallery',
      fields: [
        defineField({
          name: 'title_en',
          title: 'Gallery Title (English)',
          type: 'string'
        }),
        defineField({
          name: 'title_es',
          title: 'Gallery Title (Spanish)',
          type: 'string'
        }),
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
          name: 'layout',
          title: 'Gallery Layout',
          type: 'string',
          options: {
            list: [
              { title: 'Grid', value: 'grid' },
              { title: 'Carousel', value: 'carousel' },
              { title: 'Masonry', value: 'masonry' }
            ]
          },
          initialValue: 'grid'
        })
      ],
      preview: {
        select: {
          title: 'title_en',
          images: 'images'
        },
        prepare(selection) {
          const { title, images } = selection
          return {
            title: title || 'Image Gallery',
            subtitle: images ? `${images.length} images` : 'No images'
          }
        }
      }
    },
    
    // Video Block
    {
      type: 'object',
      name: 'video',
      title: 'Video',
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
          title: 'Video URL (YouTube, Vimeo)',
          type: 'url'
        }),
        defineField({
          name: 'thumbnail',
          title: 'Video Thumbnail',
          type: 'image',
          options: {
            hotspot: true
          }
        }),
        defineField({
          name: 'description_en',
          title: 'Description (English)',
          type: 'text',
          rows: 3
        }),
        defineField({
          name: 'description_es',
          title: 'Description (Spanish)',
          type: 'text',
          rows: 3
        })
      ],
      preview: {
        select: {
          title: 'title_en',
          media: 'thumbnail'
        },
        prepare(selection) {
          const { title, media } = selection
          return {
            title: title || 'Video',
            media
          }
        }
      }
    },
    
    // FAQ Block
    {
      type: 'object',
      name: 'faq',
      title: 'FAQ Section',
      fields: [
        defineField({
          name: 'title_en',
          title: 'FAQ Title (English)',
          type: 'string'
        }),
        defineField({
          name: 'title_es',
          title: 'FAQ Title (Spanish)',
          type: 'string'
        }),
        defineField({
          name: 'questions',
          title: 'Questions',
          type: 'array',
          of: [
            {
              type: 'object',
              name: 'faqItem',
              title: 'FAQ Item',
              fields: [
                defineField({
                  name: 'question_en',
                  title: 'Question (English)',
                  type: 'string',
                  validation: Rule => Rule.required()
                }),
                defineField({
                  name: 'question_es',
                  title: 'Question (Spanish)',
                  type: 'string',
                  validation: Rule => Rule.required()
                }),
                defineField({
                  name: 'answer_en',
                  title: 'Answer (English)',
                  type: 'text',
                  rows: 4,
                  validation: Rule => Rule.required()
                }),
                defineField({
                  name: 'answer_es',
                  title: 'Answer (Spanish)',
                  type: 'text',
                  rows: 4,
                  validation: Rule => Rule.required()
                })
              ],
              preview: {
                select: {
                  title: 'question_en'
                },
                prepare(selection) {
                  const { title } = selection
                  return {
                    title: title || 'FAQ Item'
                  }
                }
              }
            }
          ]
        })
      ],
      preview: {
        select: {
          title: 'title_en',
          questions: 'questions'
        },
        prepare(selection) {
          const { title, questions } = selection
          return {
            title: title || 'FAQ Section',
            subtitle: questions ? `${questions.length} questions` : 'No questions'
          }
        }
      }
    },
    
    // CTA Banner Block
    {
      type: 'object',
      name: 'ctaBanner',
      title: 'CTA Banner',
      fields: [
        defineField({
          name: 'title_en',
          title: 'Banner Title (English)',
          type: 'string'
        }),
        defineField({
          name: 'title_es',
          title: 'Banner Title (Spanish)',
          type: 'string'
        }),
        defineField({
          name: 'description_en',
          title: 'Description (English)',
          type: 'text',
          rows: 3
        }),
        defineField({
          name: 'description_es',
          title: 'Description (Spanish)',
          type: 'text',
          rows: 3
        }),
        defineField({
          name: 'backgroundImage',
          title: 'Background Image',
          type: 'image',
          options: {
            hotspot: true
          }
        }),
        defineField({
          name: 'primaryCta',
          title: 'Primary Call to Action',
          type: 'object',
          fields: [
            defineField({
              name: 'text_en',
              title: 'Button Text (English)',
              type: 'string'
            }),
            defineField({
              name: 'text_es',
              title: 'Button Text (Spanish)',
              type: 'string'
            }),
            defineField({
              name: 'url',
              title: 'Button URL',
              type: 'url'
            })
          ]
        }),
        defineField({
          name: 'secondaryCta',
          title: 'Secondary Call to Action',
          type: 'object',
          fields: [
            defineField({
              name: 'text_en',
              title: 'Button Text (English)',
              type: 'string'
            }),
            defineField({
              name: 'text_es',
              title: 'Button Text (Spanish)',
              type: 'string'
            }),
            defineField({
              name: 'url',
              title: 'Button URL',
              type: 'url'
            })
          ]
        })
      ],
      preview: {
        select: {
          title: 'title_en',
          media: 'backgroundImage'
        },
        prepare(selection) {
          const { title, media } = selection
          return {
            title: title || 'CTA Banner',
            media
          }
        }
      }
    }
  ]
})