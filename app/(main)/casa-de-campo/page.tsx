import type { Metadata } from 'next'
import { client } from '@/sanity/lib/client'
import { urlFor, fullImageUrl } from '@/sanity/lib/image'
import { SANITY_REVALIDATE } from '@/lib/sanity/cache'
import { CASA_DE_CAMPO_ID } from '@/sanity/lib/casaDeCampoDefaults'
import { getResortNavGuides } from '@/lib/resortGuides'
import CasaDeCampoClient, { type CasaDeCampoData, type DatedPhoto } from './CasaDeCampoClient'

export const metadata: Metadata = {
  title: 'Casa de Campo · Leticia Coudray Real Estate',
  description:
    'Seven thousand acres on the Caribbean coast of La Romana: championship golf, private villas, a marina and Altos de Chavón — and the story of how it began.',
  alternates: { canonical: '/casa-de-campo' },
}

const bi = (d: any, key: string) => ({ en: d?.[`${key}_en`], es: d?.[`${key}_es`] })

const dated = (photos: any[] | undefined, width: number, height: number): DatedPhoto[] =>
  (photos ?? [])
    .filter((p) => p?.image?.asset)
    .map((p) => ({
      url: urlFor(p.image).width(width).height(height).quality(80).url(),
      year: p.year || null,
      caption: { en: p.caption_en, es: p.caption_es },
    }))

async function getPage(): Promise<CasaDeCampoData> {
  let d: any = null
  try {
    d = await client.fetch(`*[_id == $id][0]`, { id: CASA_DE_CAMPO_ID }, { next: { revalidate: SANITY_REVALIDATE } })
  } catch (err) {
    console.error('[casa-de-campo] fetch failed', err)
  }
  const img = (i: any, w: number, h: number) => (i?.asset ? urlFor(i).width(w).height(h).quality(80).url() : null)

  return {
    hero: {
      eyebrow: bi(d, 'heroEyebrow'),
      title: bi(d, 'heroTitle'),
      intro: bi(d, 'heroIntro'),
      images: (d?.heroImages ?? []).filter((i: any) => i?.asset).map((i: any) => fullImageUrl(i)),
      overlay: typeof d?.heroOverlay === 'number' ? d.heroOverlay : 35,
    },
    story: {
      eyebrow: bi(d, 'storyEyebrow'),
      title: bi(d, 'storyTitle'),
      body: bi(d, 'storyBody'),
      image: img(d?.storyImage, 1200, 1500),
      imageAlt: d?.storyImage?.alt ?? null,
    },
    archive: {
      eyebrow: bi(d, 'archiveEyebrow'),
      title: bi(d, 'archiveTitle'),
      intro: bi(d, 'archiveIntro'),
      photos: dated(d?.archivePhotos, 1200, 900),
    },
    personal: {
      eyebrow: bi(d, 'personalEyebrow'),
      title: bi(d, 'personalTitle'),
      body: bi(d, 'personalBody'),
      photos: dated(d?.personalPhotos, 1000, 1250),
      name: d?.personalName ?? null,
      role: bi(d, 'personalRole'),
    },
    cta: {
      eyebrow: bi(d, 'ctaEyebrow'),
      title: bi(d, 'ctaTitle'),
      body: bi(d, 'ctaBody'),
      buttonLabel: bi(d, 'ctaButtonLabel'),
      buttonHref: d?.ctaButtonHref ?? null,
      image: img(d?.ctaImage, 1600, 1200),
      imageAlt: d?.ctaImage?.alt ?? null,
    },
  }
}

export default async function CasaDeCampoPage() {
  const [data, guides] = await Promise.all([getPage(), getResortNavGuides()])
  return <CasaDeCampoClient data={data} guides={guides} />
}
