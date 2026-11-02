import {defineType, defineField} from 'sanity'
import {bilingualTextField, slugField, imageField, googleMapsField} from '../../lib/schemaHelpers'
import {SHOP_LOCATIONS} from './shop'

/**
 * A place in the resort that isn't a restaurant or a shop: a museum, the
 * church, the amphitheater, a wellness studio, a workshop. Listed on the
 * resort guides (The Resort → Altos de Chavón, …) by reference, so its name,
 * description and photo are edited once here.
 */
export const landmark = defineType({
  name: 'landmark',
  title: 'Place',
  type: 'document',
  icon: () => '🏛️',
  fields: [
    ...bilingualTextField('name', 'Name', {required: true}),
    slugField('name_en'),
    defineField({
      name: 'kind',
      title: 'Kind of place',
      type: 'string',
      options: {
        list: [
          {title: 'Beach', value: 'beach'},
          {title: 'Island / sandbank', value: 'island'},
          {title: 'Museum', value: 'museum'},
          {title: 'Church', value: 'church'},
          {title: 'Venue (concerts, events)', value: 'venue'},
          {title: 'Gallery', value: 'gallery'},
          {title: 'Workshop / experience', value: 'experience'},
          {title: 'Wellness', value: 'wellness'},
          {title: 'Service', value: 'service'},
          {title: 'Other', value: 'other'},
        ],
      },
      initialValue: 'other',
    }),
    defineField({
      name: 'location',
      title: 'Where',
      type: 'string',
      options: {list: [...SHOP_LOCATIONS, {title: 'Outside the resort', value: 'off-resort'}]},
    }),
    ...bilingualTextField('summary', 'Description', {rows: 4}),
    defineField({
      name: 'details',
      title: 'Details',
      type: 'array',
      description:
        'Optional extra lines, e.g. a mass schedule ("Saturday — 5:00 PM") or how to get there ("Approximately 30 minutes by private boat…").',
      of: [
        {
          type: 'object',
          name: 'detailLine',
          fields: [
            {name: 'label_en', title: 'Label (English)', type: 'string', description: 'e.g. "Mass schedule". Optional.'},
            {name: 'label_es', title: 'Label (Spanish)', type: 'string'},
            {name: 'value_en', title: 'Text (English)', type: 'string'},
            {name: 'value_es', title: 'Text (Spanish)', type: 'string'},
          ],
          preview: {select: {title: 'value_en', subtitle: 'label_en'}},
        },
      ],
    }),
    imageField('image', 'Photo', {description: 'Optional.'}),
    defineField({name: 'website', title: 'Website or Instagram', type: 'url'}),
    googleMapsField(),
    defineField({
      name: 'isActive',
      title: 'Active',
      type: 'boolean',
      initialValue: true,
      description: 'Untick to hide it from the site without deleting it.',
    }),
  ],
  preview: {
    select: {title: 'name_en', location: 'location', media: 'image', active: 'isActive'},
    prepare: ({title, location, media, active}) => ({
      title: active === false ? `${title} (hidden)` : title,
      subtitle: location === 'off-resort' ? 'Outside the resort' : SHOP_LOCATIONS.find((l) => l.value === location)?.title,
      media,
    }),
  },
})
