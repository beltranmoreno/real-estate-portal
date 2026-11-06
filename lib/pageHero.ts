import { client } from '@/sanity/lib/client'
import { fullImageUrl } from '@/sanity/lib/image'
import { SANITY_CACHE } from '@/lib/sanity/cache'
import { pageHeroId, type PageHeroKey } from '@/sanity/lib/pageHeroDefaults'

type Bi = { en?: string | null; es?: string | null }

/** A page's hero doc from Studio, ready for <PageHero>. null = no doc yet. */
export interface PageHeroDoc {
  eyebrow: Bi
  title: Bi
  subtitle: Bi
  introEyebrow: Bi
  introTitle: Bi
  primary: { label: Bi; href?: string | null }
  secondary: { label: Bi; href?: string | null }
  /** Background photos (cross-fade when more than one). */
  imageUrls: string[]
  /** Background video (uploaded file, else link); plays instead of the photos. */
  videoUrl: string | null
  overlay: number | null
}

export async function getPageHero(key: PageHeroKey): Promise<PageHeroDoc | null> {
  try {
    const d = await client.fetch(
      `*[_id == $id][0]{
        eyebrow_en, eyebrow_es, title_en, title_es, subtitle_en, subtitle_es,
        introEyebrow_en, introEyebrow_es, introTitle_en, introTitle_es,
        image, images, videoUrl, "videoFileUrl": videoFile.asset->url, overlay,
        primaryLabel_en, primaryLabel_es, primaryHref,
        secondaryLabel_en, secondaryLabel_es, secondaryHref
      }`,
      { id: pageHeroId(key) },
      { next: SANITY_CACHE }
    )
    if (!d) return null
    return {
      eyebrow: { en: d.eyebrow_en, es: d.eyebrow_es },
      title: { en: d.title_en, es: d.title_es },
      subtitle: { en: d.subtitle_en, es: d.subtitle_es },
      introEyebrow: { en: d.introEyebrow_en, es: d.introEyebrow_es },
      introTitle: { en: d.introTitle_en, es: d.introTitle_es },
      primary: { label: { en: d.primaryLabel_en, es: d.primaryLabel_es }, href: d.primaryHref },
      secondary: { label: { en: d.secondaryLabel_en, es: d.secondaryLabel_es }, href: d.secondaryHref },
      imageUrls: [...(d.images ?? []), ...(d.images?.length ? [] : d.image ? [d.image] : [])]
        .filter((i: any) => i?.asset)
        .map((i: any) => fullImageUrl(i)),
      // An uploaded video (About) wins over a link.
      videoUrl: d.videoFileUrl || d.videoUrl || null,
      overlay: typeof d.overlay === 'number' ? d.overlay : null,
    }
  } catch (err) {
    console.error('[pageHero] fetch failed', key, err)
    return null
  }
}
