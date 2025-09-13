import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'homepageMediaConfig',
  title: 'Homepage Media Configuration',
  type: 'document',
  icon: () => '🏠',
  fields: [
    defineField({
      name: 'title',
      title: 'Configuration Name',
      type: 'string',
      initialValue: 'Homepage Media Settings',
      readOnly: true
    }),

    defineField({
      name: 'topicsToShow',
      title: 'Topics to Display on Homepage',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'Golf', value: 'golf' },
          { title: 'Beach', value: 'beach' },
          { title: 'Activities', value: 'activities' },
          { title: 'Restaurants', value: 'restaurants' },
          { title: 'Properties', value: 'properties' },
          { title: 'Lifestyle', value: 'lifestyle' },
          { title: 'Sports', value: 'sports' },
          { title: 'Nature', value: 'nature' },
          { title: 'Luxury', value: 'luxury' },
          { title: 'Family', value: 'family' },
          { title: 'Romance', value: 'romance' },
          { title: 'Adventure', value: 'adventure' },
          { title: 'Relaxation', value: 'relaxation' },
          { title: 'Nightlife', value: 'nightlife' },
          { title: 'Culture', value: 'culture' },
          { title: 'Wellness', value: 'wellness' },
          { title: 'Water Sports', value: 'water-sports' },
          { title: 'Events', value: 'events' }
        ]
      },
      validation: Rule => Rule.required().min(1).error('Please select at least one topic'),
      initialValue: ['golf', 'beach', 'luxury', 'lifestyle']
    }),

    defineField({
      name: 'locationsToShow',
      title: 'Locations to Display on Homepage',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'Casa de Campo Resort', value: 'casa-de-campo' },
          { title: 'La Romana', value: 'la-romana' },
          { title: 'La Marina', value: 'la-marina' },
          { title: 'Bayahibe', value: 'bayahibe' },
          { title: 'Saona Island', value: 'saona-island' },
          { title: 'Catalina Island', value: 'catalina-island' },
          { title: 'Altos de Chavon', value: 'altos-de-chavon' },
          { title: 'Minitas Beach', value: 'minitas-beach' },
          { title: 'Racket Center', value: 'racket-center' },
          { title: 'Punta Cana', value: 'punta-cana' },
          { title: 'Puerto Plata', value: 'puerto-plata' },
          { title: 'Samaná', value: 'samana' },
          { title: 'Santiago', value: 'santiago' },
          { title: 'Cabarete', value: 'cabarete' },
          { title: 'Sosúa', value: 'sosua' },
          { title: 'Other', value: 'other' }
        ]
      },
      description: 'Select which locations to show. Leave empty to show all locations.',
      initialValue: ['casa-de-campo', 'la-marina', 'altos-de-chavon', 'minitas-beach']
    }),

    defineField({
      name: 'maxItems',
      title: 'Maximum Items to Show',
      type: 'number',
      validation: Rule => Rule.min(6).max(20).integer(),
      initialValue: 12
    })
  ],

  preview: {
    select: {
      topics: 'topicsToShow',
      locations: 'locationsToShow',
      maxItems: 'maxItems'
    },
    prepare({ topics, locations, maxItems }) {
      const topicsList = topics ? topics.slice(0, 2).join(', ') : 'All topics'
      const locationsList = locations ? locations.slice(0, 2).join(', ') : 'All locations'
      const moreItems = (topics && topics.length > 2) || (locations && locations.length > 2)
      
      return {
        title: 'Homepage Media Configuration',
        subtitle: `${topicsList} • ${locationsList}${moreItems ? ' • +more' : ''} (max ${maxItems})`
      }
    }
  }
})