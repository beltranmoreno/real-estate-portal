import { client } from '@/sanity/lib/client'
import { urlFor } from '@/sanity/lib/image'
import { SANITY_REVALIDATE } from '@/lib/sanity/cache'

export type Bi = { en?: string | null; es?: string | null }

/** A resort guide as a menu entry / card. */
export interface ResortGuideLink {
  slug: string
  label: Bi
  title: Bi
  imageUrl: string | null
}

/** One entry in a list, with its venue already resolved. */
export interface GuideEntry {
  key: string
  name: Bi
  note: Bi
  /** Restaurant page, or the shop's / place's website. */
  href: string | null
  external: boolean
  imageUrl: string | null
  /** Extra lines from a place, e.g. a mass schedule. */
  details: { label: Bi; value: Bi }[]
  mapsUrl: string | null
}

interface Button {
  label: Bi
  href: string | null
}

export type GuideSection =
  | {
      kind: 'feature'
      key: string
      anchor: string | null
      eyebrow: Bi
      title: Bi
      body: Bi
      imageUrl: string | null
      imageAlt: string | null
      /** The venue's extra lines, e.g. how to get there. */
      details: { label: Bi; value: Bi }[]
      mapsUrl: string | null
      highlightsLabel: Bi
      highlights: GuideEntry[]
      button: Button
    }
  | {
      kind: 'venues'
      key: string
      anchor: string | null
      eyebrow: Bi
      title: Bi
      intro: Bi
      listLabel: Bi
      items: GuideEntry[]
      button: Button
    }
  | {
      kind: 'directory'
      key: string
      anchor: string | null
      eyebrow: Bi
      title: Bi
      intro: Bi
      groups: { key: string; title: Bi; description: Bi; listLabel: Bi; items: GuideEntry[] }[]
      button: Button
    }

export interface ResortGuide {
  slug: string
  label: Bi
  eyebrow: Bi
  title: Bi
  intro: Bi
  heroImages: string[]
  heroOverlay: number
  button: Button
  seoDescription: Bi
  sections: GuideSection[]
}

// A venue, whichever document type it is. Hidden venues come back null.
const VENUE = `{
  _type,
  "hidden": isActive == false,
  "name_en": coalesce(name_en, name),
  "name_es": coalesce(name_es, name),
  "slug": slug.current,
  status,
  website,
  summary_en,
  summary_es,
  "image": coalesce(media.featuredImage, image),
  details,
  "mapsUrl": coalesce(googleMapsUrl, contact.googleMapsUrl)
}`

const ITEM = `{ _key, name_en, name_es, note_en, note_es, "venue": venue->${VENUE} }`

const bi = (d: any, key: string): Bi => ({ en: d?.[`${key}_en`], es: d?.[`${key}_es`] })
const detailLines = (v: any) => (v?.details ?? []).map((d: any) => ({ label: bi(d, 'label'), value: bi(d, 'value') }))
const button = (d: any): Button => ({ label: bi(d, 'buttonLabel'), href: d?.buttonHref?.trim() || null })

/** Where a venue links to: its restaurant page, or its own website. */
function venueLink(v: any): { href: string | null; external: boolean } {
  if (!v) return { href: null, external: false }
  if (v._type === 'restaurant') {
    return v.status === 'published' && v.slug ? { href: `/restaurants/${v.slug}`, external: false } : { href: null, external: false }
  }
  return v.website ? { href: v.website, external: true } : { href: null, external: false }
}

function entries(items: any[] | undefined): GuideEntry[] {
  return (items ?? [])
    .filter((i) => !i?.venue?.hidden)
    .map((i) => {
      const v = i.venue
      const { href, external } = venueLink(v)
      return {
        key: i._key,
        name: { en: v?.name_en || i.name_en, es: v?.name_es || i.name_es },
        // The guide's own description. A place (museum, church…) falls back
        // to its description; restaurants and shops don't, so plain lists of
        // names stay plain.
        note:
          i.note_en || i.note_es || v?._type !== 'landmark'
            ? { en: i.note_en, es: i.note_es }
            : { en: v?.summary_en, es: v?.summary_es },
        href,
        external,
        imageUrl: v?.image?.asset ? urlFor(v.image).width(800).height(600).quality(80).url() : null,
        details: detailLines(v),
        mapsUrl: v?.mapsUrl || null,
      }
    })
    .filter((e) => e.name.en || e.name.es)
}

/** Guides shown under The Resort in the navbar, in menu order. */
export async function getResortNavGuides(): Promise<ResortGuideLink[]> {
  try {
    const rows = await client.fetch(
      `*[_type == "resortGuide" && isActive != false && showInNav != false && defined(slug.current)]
        | order(coalesce(navOrder, 999) asc, navLabel_en asc) {
          "slug": slug.current, navLabel_en, navLabel_es, title_en, title_es, "image": heroImages[0]
        }`,
      {},
      { next: { revalidate: SANITY_REVALIDATE } }
    )
    return rows.map((r: any) => ({
      slug: r.slug,
      label: bi(r, 'navLabel'),
      title: bi(r, 'title'),
      imageUrl: r.image?.asset ? urlFor(r.image).width(1000).height(1250).quality(80).url() : null,
    }))
  } catch (err) {
    console.error('[resortGuides] nav fetch failed', err)
    return []
  }
}

export async function getResortGuideSlugs(): Promise<string[]> {
  try {
    return await client.fetch(`*[_type == "resortGuide" && isActive != false && defined(slug.current)].slug.current`)
  } catch {
    return []
  }
}

export async function getResortGuide(slug: string): Promise<ResortGuide | null> {
  const d = await client.fetch(
    `*[_type == "resortGuide" && slug.current == $slug && isActive != false][0]{
      ...,
      sections[]{
        ...,
        "venue": venue->${VENUE},
        items[]${ITEM},
        highlights[]${ITEM},
        groups[]{ ..., items[]${ITEM} }
      }
    }`,
    { slug },
    { next: { revalidate: SANITY_REVALIDATE } }
  )
  if (!d) return null

  const sections: GuideSection[] = (d.sections ?? []).flatMap((s: any): GuideSection[] => {
    const common = { key: s._key, anchor: s.anchor || null, eyebrow: bi(s, 'eyebrow'), title: bi(s, 'title'), button: button(s) }
    if (s._type === 'guideFeature') {
      const venue = s.venue?.hidden ? null : s.venue
      const image = s.image?.asset ? s.image : venue?.image?.asset ? venue.image : null
      const fallback = venueLink(venue)
      return [
        {
          ...common,
          kind: 'feature',
          body: bi(s, 'body'),
          imageUrl: image ? urlFor(image).width(1400).height(1050).quality(80).url() : null,
          imageAlt: s.image?.alt || null,
          details: detailLines(venue),
          mapsUrl: venue?.mapsUrl || null,
          highlightsLabel: bi(s, 'highlightsLabel'),
          highlights: entries(s.highlights),
          // Without a link of its own, the button goes to the venue.
          button: { label: common.button.label, href: common.button.href || fallback.href },
        },
      ]
    }
    if (s._type === 'guideVenues') {
      return [{ ...common, kind: 'venues', intro: bi(s, 'intro'), listLabel: bi(s, 'listLabel'), items: entries(s.items) }]
    }
    if (s._type === 'guideDirectory') {
      return [
        {
          ...common,
          kind: 'directory',
          intro: bi(s, 'intro'),
          groups: (s.groups ?? []).map((g: any) => ({
            key: g._key,
            title: bi(g, 'title'),
            description: bi(g, 'description'),
            listLabel: bi(g, 'listLabel'),
            items: entries(g.items),
          })),
        },
      ]
    }
    return []
  })

  return {
    slug: d.slug.current,
    label: bi(d, 'navLabel'),
    eyebrow: bi(d, 'eyebrow'),
    title: bi(d, 'title'),
    intro: bi(d, 'intro'),
    heroImages: (d.heroImages ?? []).filter((i: any) => i?.asset).map((i: any) => urlFor(i).width(2400).quality(80).url()),
    heroOverlay: typeof d.heroOverlay === 'number' ? d.heroOverlay : 35,
    button: button(d),
    seoDescription: bi(d, 'seoDescription'),
    sections,
  }
}
