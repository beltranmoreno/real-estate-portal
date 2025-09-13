import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/sanity/lib/client'
import { notFound } from 'next/navigation'

export const revalidate = 3600 // Revalidate every hour

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const query = `*[_type == "infoPage" && slug.current == $slug && status == "published"][0] {
      _id,
      title_en,
      title_es,
      "slug": slug.current,
      heroImage,
      intro_en,
      intro_es,
      content[] {
        _type,
        _key,
        _type == "hero" => {
          title_en,
          title_es,
          subtitle_en,
          subtitle_es,
          image,
          cta {
            text_en,
            text_es,
            url
          }
        },
        _type == "richText" => {
          title_en,
          title_es,
          content_en,
          content_es
        },
        _type == "imageGallery" => {
          title_en,
          title_es,
          layout,
          images[] {
            ...,
            caption_en,
            caption_es
          }
        },
        _type == "video" => {
          title_en,
          title_es,
          videoUrl,
          thumbnail,
          description_en,
          description_es
        },
        _type == "faq" => {
          title_en,
          title_es,
          questions[] {
            question_en,
            question_es,
            answer_en,
            answer_es
          }
        },
        _type == "ctaBanner" => {
          title_en,
          title_es,
          description_en,
          description_es,
          backgroundImage,
          primaryCta {
            text_en,
            text_es,
            url
          },
          secondaryCta {
            text_en,
            text_es,
            url
          }
        }
      },
      seo {
        metaTitle_en,
        metaTitle_es,
        metaDescription_en,
        metaDescription_es,
        canonicalUrl,
        ogImage,
        keywords_en,
        keywords_es,
        noIndex,
        noFollow
      },
      publishedAt
    }`

    const infoPage = await client.fetch(query, { slug })

    if (!infoPage) {
      return NextResponse.json(
        { error: 'Info page not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(infoPage)
  } catch (error) {
    console.error('Error fetching info page:', error)
    return NextResponse.json(
      { error: 'Failed to fetch info page' },
      { status: 500 }
    )
  }
}