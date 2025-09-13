import { defineType, defineField } from 'sanity'

export const seo = defineType({
  name: 'seo',
  title: 'SEO Settings',
  type: 'object',
  fields: [
    defineField({
      name: 'metaTitle_en',
      title: 'Meta Title (English)',
      type: 'string',
      description: 'Title tag for search engines (recommended: 50-60 characters)',
      validation: Rule => Rule.max(60).warning('Meta titles over 60 characters may be truncated')
    }),
    defineField({
      name: 'metaTitle_es',
      title: 'Meta Title (Spanish)',
      type: 'string',
      description: 'Title tag for search engines (recommended: 50-60 characters)',
      validation: Rule => Rule.max(60).warning('Meta titles over 60 characters may be truncated')
    }),
    defineField({
      name: 'metaDescription_en',
      title: 'Meta Description (English)',
      type: 'text',
      rows: 3,
      description: 'Description for search engines (recommended: 150-160 characters)',
      validation: Rule => Rule.max(160).warning('Meta descriptions over 160 characters may be truncated')
    }),
    defineField({
      name: 'metaDescription_es',
      title: 'Meta Description (Spanish)',
      type: 'text',
      rows: 3,
      description: 'Description for search engines (recommended: 150-160 characters)',
      validation: Rule => Rule.max(160).warning('Meta descriptions over 160 characters may be truncated')
    }),
    defineField({
      name: 'canonicalUrl',
      title: 'Canonical URL',
      type: 'url',
      description: 'The canonical URL for this page (optional)'
    }),
    defineField({
      name: 'ogImage',
      title: 'Open Graph Image',
      type: 'image',
      description: 'Image for social media sharing (recommended: 1200x630px)',
      options: {
        hotspot: true
      }
    }),
    defineField({
      name: 'keywords_en',
      title: 'Focus Keywords (English)',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Keywords this page should rank for',
      options: {
        layout: 'tags'
      }
    }),
    defineField({
      name: 'keywords_es',
      title: 'Focus Keywords (Spanish)',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Keywords this page should rank for',
      options: {
        layout: 'tags'
      }
    }),
    defineField({
      name: 'noIndex',
      title: 'No Index',
      type: 'boolean',
      description: 'Prevent search engines from indexing this page',
      initialValue: false
    }),
    defineField({
      name: 'noFollow',
      title: 'No Follow',
      type: 'boolean',
      description: 'Prevent search engines from following links on this page',
      initialValue: false
    })
  ]
})