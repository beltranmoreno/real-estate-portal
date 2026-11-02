import {defineType, defineField} from 'sanity'
import {bilingualTextField, slugField, imageField} from '../../lib/schemaHelpers'

/**
 * A section of the Activities page (Racket Sports, Equestrian & Polo…): its
 * label, title and intro. Activities join a group from their own "Group"
 * field; the page and the homepage teaser show groups in this order.
 */
export const activityGroup = defineType({
  name: 'activityGroup',
  title: 'Activity group',
  type: 'document',
  icon: () => '🗂️',
  fields: [
    ...bilingualTextField('name', 'Name', {
      required: true,
      description: 'Shown as the small label above the title, and as the column heading on the homepage, e.g. "Racket Sports".',
    }),
    slugField('name_en'),
    ...bilingualTextField('title', 'Title', {rows: 2, description: 'e.g. "Game. Set. Caribbean."'}),
    ...bilingualTextField('intro', 'Intro', {rows: 4}),
    imageField('image', 'Photo', {description: 'Optional. Shown beside the group’s intro.'}),
    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
      description: 'Lower numbers come first.',
    }),
    defineField({
      name: 'isActive',
      title: 'Active',
      type: 'boolean',
      initialValue: true,
      description: 'Untick to hide the whole group from the site.',
    }),
  ],
  orderings: [{title: 'Order', name: 'order', by: [{field: 'order', direction: 'asc'}]}],
  preview: {
    select: {title: 'name_en', subtitle: 'title_en', media: 'image', active: 'isActive'},
    prepare: ({title, subtitle, media, active}) => ({
      title: active === false ? `${title} (hidden)` : title,
      subtitle,
      media,
    }),
  },
})
