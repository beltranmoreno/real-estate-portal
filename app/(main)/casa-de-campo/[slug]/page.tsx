import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getResortGuide, getResortGuideSlugs, getResortNavGuides } from '@/lib/resortGuides'
import ResortGuideClient from './ResortGuideClient'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return (await getResortGuideSlugs()).map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const guide = await getResortGuide((await params).slug).catch(() => null)
  if (!guide) return {}
  const name = guide.label.en || guide.eyebrow.en || 'Casa de Campo'
  return {
    title: `${name} · Casa de Campo · Leticia Coudray Real Estate`,
    description: guide.seoDescription.en || guide.intro.en?.split('\n')[0] || undefined,
    alternates: { canonical: `/casa-de-campo/${guide.slug}` },
  }
}

export default async function ResortGuidePage({ params }: Props) {
  const { slug } = await params
  const [guide, nav] = await Promise.all([getResortGuide(slug).catch(() => null), getResortNavGuides()])
  if (!guide) notFound()
  return <ResortGuideClient guide={guide} others={nav.filter((g) => g.slug !== slug)} />
}
