import {defineType, defineField} from 'sanity'
import {bilingualTextField, slugField} from '../../lib/schemaHelpers'

/**
 * A single concierge add-on service that Leticia offers to renters.
 * Examples: airport transfer, grocery stocking, private chef, boat
 * charter. Rendered in a grid on /services/concierge.
 */
export const conciergeService = defineType({
  name: 'conciergeService',
  title: 'Concierge Service',
  type: 'document',
  icon: () => '🛎️',
  groups: [
    {name: 'basic', title: 'Basic'},
    {name: 'display', title: 'Display'},
    {name: 'detail', title: 'Detail page'},
  ],
  fields: [
    ...bilingualTextField('name', 'Service Name', {required: true}).map(
      (f) => ({...f, group: 'basic'})
    ),

    {
      ...slugField('name_en'),
      group: 'basic',
    },

    ...bilingualTextField('shortDescription', 'Short Description', {
      rows: 2,
      description:
        'One-liner shown directly on the service card. Keep under ~120 characters.',
    }).map((f) => ({...f, group: 'basic'})),

    ...bilingualTextField('description', 'Full Description', {
      rows: 5,
      description: 'Optional longer copy for the card hover or detail view.',
    }).map((f) => ({...f, group: 'basic'})),

    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      group: 'display',
      options: {
        list: [
          {title: 'Transport & Transfers', value: 'transport'},
          {title: 'Food & Beverage', value: 'food'},
          {title: 'Experiences & Activities', value: 'experiences'},
          {title: 'Home & Lifestyle', value: 'home'},
          {title: 'Wellness & Family', value: 'wellness'},
        ],
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      group: 'display',
      description:
        'Optional photo for the service card. Recommended 4:3 ratio. The icon below is used as a fallback when no image is set.',
      options: {
        hotspot: true,
        metadata: ['blurhash', 'lqip'],
      },
      fields: [
        {
          name: 'alt',
          title: 'Alternative text',
          type: 'string',
          description: 'Important for SEO and accessibility',
        },
      ],
    }),

    defineField({
      name: 'icon',
      title: 'Icon',
      type: 'string',
      group: 'display',
      description: 'Lucide icon name. Always required — used in the card header alongside the image (or as the visual when no image is set).',
      options: {
        list: [
          // Transport
          {title: 'Plane (airport / flights)', value: 'plane'},
          {title: 'Car (rental / transfer)', value: 'car'},
          {title: 'Car taxi (private driver)', value: 'car-taxi'},
          {title: 'Bike', value: 'bike'},
          {title: 'Golf cart', value: 'golf-cart'},
          {title: 'Ship / yacht', value: 'ship'},
          {title: 'Sailboat', value: 'sailboat'},
          // Food & beverage
          {title: 'Shopping cart (groceries)', value: 'shopping-cart'},
          {title: 'Wine glass', value: 'wine'},
          {title: 'Chef hat', value: 'chef-hat'},
          {title: 'Utensils (restaurant)', value: 'utensils'},
          {title: 'Cake', value: 'cake'},
          // Experiences
          {title: 'Trophy (golf)', value: 'trophy'},
          {title: 'Map (excursions)', value: 'map'},
          {title: 'Camera (tours)', value: 'camera'},
          {title: 'Music (entertainment)', value: 'music'},
          {title: 'Calendar (events)', value: 'calendar'},
          {title: 'Tickets', value: 'ticket'},
          // Home
          {title: 'House', value: 'home'},
          {title: 'Sparkles (cleaning)', value: 'sparkles'},
          {title: 'Flower (florist)', value: 'flower'},
          {title: 'Gift', value: 'gift'},
          // Wellness & family
          {title: 'Heart (spa)', value: 'heart'},
          {title: 'Baby', value: 'baby'},
          {title: 'Users (group / nanny)', value: 'users'},
          {title: 'Dog (pet care)', value: 'dog'},
          // Generic
          {title: 'Concierge bell', value: 'concierge-bell'},
        ],
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'priceFrom',
      title: 'Starting price (optional)',
      type: 'object',
      group: 'display',
      description:
        'Optional. Shown as "from $X" on the card. Leave blank for "Quoted on request".',
      fields: [
        {name: 'amount', title: 'Amount', type: 'number'},
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
        {
          name: 'unit',
          title: 'Unit',
          type: 'string',
          options: {
            list: [
              {title: 'per request', value: 'request'},
              {title: 'per person', value: 'person'},
              {title: 'per hour', value: 'hour'},
              {title: 'per day', value: 'day'},
              {title: 'per trip', value: 'trip'},
            ],
          },
          initialValue: 'request',
        },
      ],
    }),

    defineField({
      name: 'isFeatured',
      title: 'Featured',
      type: 'boolean',
      group: 'display',
      initialValue: false,
      description: 'Highlight this service at the top of its category.',
    }),

    defineField({
      name: 'isActive',
      title: 'Active',
      type: 'boolean',
      group: 'display',
      initialValue: true,
      description: 'Hide this service from the public page when off.',
    }),

    defineField({
      name: 'order',
      title: 'Display order',
      type: 'number',
      group: 'display',
      description: 'Lower numbers appear first within a category.',
    }),

    // ─────────────────── Detail page ───────────────────
    // Optional fields that "upgrade" a concierge service into a full
    // detail page at /services/concierge/<slug>. When `hasDetailPage`
    // is off, the card on /services/concierge stays non-clickable.
    defineField({
      name: 'hasDetailPage',
      title: 'Has detail page',
      type: 'boolean',
      group: 'detail',
      initialValue: false,
      description:
        'When on, the catalog card links to /services/concierge/<slug>. Make sure the fields below are filled before turning it on.',
    }),

    defineField({
      name: 'heroImage',
      title: 'Hero image',
      type: 'image',
      group: 'detail',
      description: 'Large image at the top of the detail page (3:2 looks best).',
      options: {
        hotspot: true,
        metadata: ['blurhash', 'lqip'],
      },
      fields: [
        {name: 'alt', title: 'Alternative text', type: 'string'},
      ],
    }),

    defineField({
      name: 'gallery',
      title: 'Gallery',
      type: 'array',
      group: 'detail',
      description: 'Additional images shown in a grid below the hero.',
      of: [
        {
          type: 'image',
          options: {hotspot: true, metadata: ['blurhash', 'lqip']},
          fields: [
            {name: 'alt', title: 'Alternative text', type: 'string'},
            {name: 'caption_en', title: 'Caption (English)', type: 'string'},
            {name: 'caption_es', title: 'Caption (Spanish)', type: 'string'},
          ],
        },
      ],
    }),

    ...bilingualTextField('longDescription', 'Long description', {
      rows: 6,
      description:
        'Multi-paragraph copy for the detail page hero. Plain text — separate paragraphs with a blank line.',
    }).map((f) => ({...f, group: 'detail'})),

    defineField({
      name: 'tiers',
      title: 'Tiers / packages',
      type: 'array',
      group: 'detail',
      description:
        'Optional. Use for services that come in flavors — e.g. 2-/4-/6-seater golf carts, or chef cuisine options. Rendered as cards on the detail page.',
      of: [
        {
          type: 'object',
          name: 'tier',
          fields: [
            ...bilingualTextField('name', 'Tier name', {required: true}),
            ...bilingualTextField('description', 'Description', {rows: 2}),
            defineField({
              name: 'features_en',
              title: 'Features (English)',
              type: 'array',
              of: [{type: 'string'}],
              description: 'Short bullets — one feature per line.',
            }),
            defineField({
              name: 'features_es',
              title: 'Features (Spanish)',
              type: 'array',
              of: [{type: 'string'}],
            }),
            defineField({
              name: 'priceLabel',
              title: 'Price label',
              type: 'string',
              description: 'Free-form, e.g. "$40–60/day" or "From $200".',
            }),
            defineField({
              name: 'image',
              title: 'Image',
              type: 'image',
              options: {hotspot: true, metadata: ['blurhash', 'lqip']},
              fields: [
                {name: 'alt', title: 'Alternative text', type: 'string'},
              ],
            }),
          ],
          preview: {
            select: {
              title: 'name_en',
              subtitle: 'priceLabel',
              media: 'image',
            },
          },
        },
      ],
    }),

    ...bilingualTextField('contactCtaLabel', 'Contact CTA label (optional)', {
      description:
        'Overrides the default "Get in touch" button label on the detail page.',
    }).map((f) => ({...f, group: 'detail'})),
  ],

  preview: {
    select: {
      title: 'name_en',
      subtitle: 'category',
      icon: 'icon',
      active: 'isActive',
    },
    prepare({title, subtitle, icon, active}) {
      const status = active ? '' : ' (inactive)'
      return {
        title: `${title}${status}`,
        subtitle: [icon, subtitle].filter(Boolean).join(' · '),
      }
    },
  },

  orderings: [
    {
      title: 'Category, then order',
      name: 'categoryOrder',
      by: [
        {field: 'category', direction: 'asc'},
        {field: 'order', direction: 'asc'},
        {field: 'name_en', direction: 'asc'},
      ],
    },
  ],
})
