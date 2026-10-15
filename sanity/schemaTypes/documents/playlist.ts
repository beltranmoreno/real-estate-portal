import {defineType, defineField} from 'sanity'
import {bilingualTextField} from '../../lib/schemaHelpers'

/**
 * One of Leticia's Spotify playlists, shown to guests in the portal's
 * "Music for the house" section. Cover art and the Spotify title are read
 * from Spotify itself, so only the link is required here.
 */
export const playlist = defineType({
  name: 'playlist',
  title: 'Playlist',
  type: 'document',
  icon: () => '🎧',
  fields: [
    defineField({
      name: 'spotifyUrl',
      title: 'Spotify playlist link',
      type: 'url',
      description: 'Share → Copy link to playlist, e.g. https://open.spotify.com/playlist/…',
      validation: (Rule) =>
        Rule.required().custom((url?: string) =>
          !url || /open\.spotify\.com\/playlist\/[A-Za-z0-9]{22}/.test(url)
            ? true
            : 'Must be an open.spotify.com/playlist/… link'
        ),
    }),

    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Optional. Leave empty to use the playlist’s name on Spotify.',
    }),

    ...bilingualTextField('moment', 'When to play it', {
      rows: 2,
      description: 'Optional one-liner, e.g. “Long lunches by the pool.”',
    }),

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
    }),
  ],

  orderings: [
    {title: 'Order', name: 'orderAsc', by: [{field: 'order', direction: 'asc'}]},
  ],

  preview: {
    select: {title: 'title', url: 'spotifyUrl', active: 'isActive'},
    prepare({title, url, active}) {
      const name = title || 'Spotify playlist'
      return {title: active === false ? `${name} (hidden)` : name, subtitle: url}
    },
  },
})
