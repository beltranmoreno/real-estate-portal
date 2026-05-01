import { defineField, defineType } from 'sanity'

/**
 * leticiaRecommendation is used both as a standalone document AND as an
 * inline field on property/restaurant/info documents. When used inline
 * and left empty, we don't want strict required validation to block the
 * parent document from saving. So we use a "required only if any field
 * is filled" pattern: an entirely empty recommendation is fine, but a
 * partially-filled one will surface missing required fields.
 */
const requiredIfStarted = (Rule: any, max?: number) =>
  Rule.custom((value: any, context: any) => {
    const parent = (context?.parent || {}) as Record<string, unknown>
    // Consider the recommendation "started" if any visible field has content.
    const started = ['title_en', 'title_es', 'type', 'recommendation_en', 'recommendation_es']
      .some((k) => {
        const v = parent[k]
        return typeof v === 'string' ? v.trim().length > 0 : v !== undefined && v !== null
      })
    if (!started) return true
    if (value === undefined || value === null || value === '') {
      return 'Required when filling out a recommendation'
    }
    if (max && typeof value === 'string' && value.length > max) {
      return `Must be ${max} characters or fewer`
    }
    return true
  })

export default defineType({
  name: 'leticiaRecommendation',
  title: "Leticia's Recommendation",
  type: 'document',
  icon: () => '💡',
  fields: [
    defineField({
      name: 'title_en',
      title: 'Title (English)',
      type: 'string',
      validation: Rule => requiredIfStarted(Rule)
    }),
    defineField({
      name: 'title_es',
      title: 'Title (Spanish)',
      type: 'string',
      validation: Rule => requiredIfStarted(Rule)
    }),
    defineField({
      name: 'type',
      title: 'Recommendation Type',
      type: 'string',
      options: {
        list: [
          { title: 'Restaurant', value: 'restaurant' },
          { title: 'Golf Course', value: 'golf' },
          { title: 'Property', value: 'property' },
          { title: 'Location', value: 'location' },
          { title: 'Activity', value: 'activity' },
          { title: 'General', value: 'general' }
        ]
      },
      validation: Rule => requiredIfStarted(Rule)
    }),
    defineField({
      name: 'recommendation_en',
      title: 'Recommendation Text (English)',
      type: 'text',
      rows: 4,
      validation: Rule => requiredIfStarted(Rule, 500)
    }),
    defineField({
      name: 'recommendation_es',
      title: 'Recommendation Text (Spanish)',
      type: 'text',
      rows: 4,
      validation: Rule => requiredIfStarted(Rule, 500)
    }),
    defineField({
      name: 'highlight_en',
      title: 'Pro Tip/Highlight (English)',
      type: 'text',
      rows: 2,
      description: 'Optional pro tip or key highlight'
    }),
    defineField({
      name: 'highlight_es',
      title: 'Pro Tip/Highlight (Spanish)',
      type: 'text',
      rows: 2,
      description: 'Optional pro tip or key highlight'
    }),
    defineField({
      name: 'variant',
      title: 'Display Variant',
      type: 'string',
      options: {
        list: [
          { title: 'Default', value: 'default' },
          { title: 'Compact', value: 'compact' },
          { title: 'Banner', value: 'banner' }
        ]
      },
      initialValue: 'default'
    }),
    defineField({
      name: 'targetContent',
      title: 'Link to Content',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [
            { type: 'golfCourse' },
            { type: 'restaurant' },
            { type: 'property' },
            { type: 'infoPage' }
          ]
        }
      ],
      description: 'Optional: Link this recommendation to specific content items'
    }),
    defineField({
      name: 'isActive',
      title: 'Active',
      type: 'boolean',
      initialValue: true,
      description: 'Toggle to show/hide this recommendation'
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      description: 'Order for displaying multiple recommendations (lower numbers first)'
    })
  ],
  preview: {
    select: {
      title: 'title_en',
      subtitle: 'type',
      active: 'isActive'
    },
    prepare({ title, subtitle, active }) {
      return {
        title: active ? title : `${title} (Inactive)`,
        subtitle: `${subtitle?.charAt(0)?.toUpperCase()}${subtitle?.slice(1)} Recommendation`
      }
    }
  }
})