import type { Metadata } from 'next'
import { getAreaOptions, getPropertyByCompletionToken } from '@/lib/listingCompletion'
import { completionTranslations, getLocale, type Locale } from './translations'
import { CompleteListingForm } from './CompleteForm'

export const dynamic = 'force-dynamic'

// These pages are private owner-completion links — never index them.
export const metadata: Metadata = {
  title: 'Complete Listing',
  robots: { index: false, follow: false, nocache: true },
}

interface PageProps {
  params: Promise<{ token: string }>
  searchParams: Promise<{ lang?: string | string[] }>
}

export default async function CompleteListingPage({
  params,
  searchParams,
}: PageProps) {
  const { token } = await params
  const { lang } = await searchParams
  const locale: Locale = getLocale(lang)
  const t = completionTranslations[locale]

  const [property, areaOptions] = await Promise.all([
    getPropertyByCompletionToken(token),
    getAreaOptions(),
  ])

  // Invalid / expired token, or owner already submitted (token cleared).
  if (!property) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-6 py-16 bg-stone-50">
        <div className="max-w-lg w-full bg-white border border-stone-200 rounded-xs p-10 text-center">
          <h1 className="text-2xl font-light text-stone-900 mb-3">{t.invalidTitle}</h1>
          <p className="text-stone-600 font-light">{t.invalidBody}</p>
        </div>
      </div>
    )
  }

  // Owner already submitted (completedBy set but token still present = rare
  // window; handle gracefully)
  if (property.completedBy?.submittedAt) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-6 py-16 bg-stone-50">
        <div className="max-w-lg w-full bg-white border border-stone-200 rounded-xs p-10 text-center">
          <h1 className="text-2xl font-light text-stone-900 mb-3">{t.completedTitle}</h1>
          <p className="text-stone-600 font-light">{t.completedBody}</p>
        </div>
      </div>
    )
  }

  // Parse any previously-saved draft so the form can resume where the
  // owner left off.
  let initialDraft: Record<string, unknown> = {}
  if (property.completionDraft?.data) {
    try {
      initialDraft = JSON.parse(property.completionDraft.data)
    } catch {
      initialDraft = {}
    }
  }

  const propertyTitle = locale === 'es'
    ? property.title_es || property.title_en || ''
    : property.title_en || property.title_es || ''

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Page header — sits between the site Navbar and the form. The
          ?lang=es|en toggle is the only escape hatch the owner needs;
          the site Navbar's locale switcher is also wired through the
          shared LocaleProvider. */}
      <div className="bg-white border-b border-stone-200">
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              {property.propertyCode && (
                <p className="text-xs text-stone-500 uppercase tracking-[0.15em] mb-2">
                  {property.propertyCode}
                </p>
              )}
              <h1 className="text-2xl sm:text-3xl font-light text-stone-900">
                {t.pageTitle}
              </h1>
              {propertyTitle && (
                <p className="text-base text-stone-700 mt-1 font-light">
                  {propertyTitle}
                </p>
              )}
              <p className="text-sm text-stone-600 mt-3 font-light">
                {t.pageSubtitle}
              </p>
            </div>
            <LocaleToggle currentLocale={locale} t={t} />
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="container mx-auto px-4 py-10 max-w-3xl">
        <CompleteListingForm
          token={token}
          locale={locale}
          areaOptions={areaOptions}
          initialProperty={{
            propertyType: property.propertyType ?? '',
            amenities: property.amenities ?? {},
            pricing: property.pricing ?? {},
            location: property.location ?? {},
            houseRules: property.houseRules ?? {},
            contactInfo: property.contactInfo ?? {},
          }}
          initialDraft={initialDraft}
          lastSavedAt={property.completionDraft?.lastSavedAt}
        />
      </div>
    </div>
  )
}

function LocaleToggle({
  currentLocale,
  t,
}: {
  currentLocale: Locale
  t: (typeof completionTranslations)[Locale]
}) {
  const otherLocale: Locale = currentLocale === 'en' ? 'es' : 'en'
  const label = otherLocale === 'es' ? t.switchToSpanish : t.switchToEnglish
  return (
    <a
      href={`?lang=${otherLocale}`}
      className="inline-flex items-center px-3 py-1.5 text-xs font-light tracking-wide rounded-full border border-stone-300 text-stone-700 hover:bg-stone-100 transition-colors whitespace-nowrap"
    >
      {label}
    </a>
  )
}
