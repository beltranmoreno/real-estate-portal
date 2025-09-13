import { defineType, defineField } from 'sanity'
import { DocumentTextIcon } from '@sanity/icons'

export const infoPage = defineType({
  name: 'infoPage',
  title: 'Info Page',
  type: 'document',
  icon: DocumentTextIcon,
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
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title_en',
        maxLength: 96
      },
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero Image',
      type: 'image',
      options: {
        hotspot: true
      }
    }),
    defineField({
      name: 'intro_en',
      title: 'Introduction (English)',
      type: 'text',
      rows: 4,
      description: 'Brief introduction or summary of the page'
    }),
    defineField({
      name: 'intro_es',
      title: 'Introduction (Spanish)',
      type: 'text',
      rows: 4,
      description: 'Brief introduction or summary of the page'
    }),
    defineField({
      name: 'content',
      title: 'Page Content',
      type: 'pageBlocks'
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
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      initialValue: () => new Date().toISOString()
    })
  ],
  preview: {
    select: {
      title: 'title_en',
      media: 'heroImage',
      status: 'status'
    },
    prepare(selection) {
      const { title, media, status } = selection
      return {
        title: title || 'Untitled',
        subtitle: status === 'published' ? '● Published' : '○ Draft',
        media
      }
    }
  },
  orderings: [
    {
      title: 'Title A-Z',
      name: 'titleAsc',
      by: [{ field: 'title_en', direction: 'asc' }]
    },
    {
      title: 'Published Date (Newest)',
      name: 'publishedDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }]
    }
  ]
})