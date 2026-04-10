import { getPropertyByCompletionToken } from '@/lib/listingCompletion'
import { completionTranslations, getLocale, type Locale } from './translations'
import { CompleteListingForm } from './CompleteForm'

export const dynamic = 'force-dynamic'

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

  const property = await getPropertyByCompletionToken(token)

  // Invalid / expired token, or owner already submitted (token cleared).
  if (!property) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6 py-12 bg-neutral-50">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-sm border border-neutral-200 p-8 text-center">
          <LocaleToggle currentLocale={locale} t={t} />
          <h1 className="text-2xl font-semibold mt-6 mb-3">{t.invalidTitle}</h1>
          <p className="text-neutral-600">{t.invalidBody}</p>
        </div>
      </main>
    )
  }

  // Owner already submitted (completedBy set but token still present = rare
  // window; handle gracefully)
  if (property.completedBy?.submittedAt) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6 py-12 bg-neutral-50">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-sm border border-neutral-200 p-8 text-center">
          <LocaleToggle currentLocale={locale} t={t} />
          <h1 className="text-2xl font-semibold mt-6 mb-3">{t.completedTitle}</h1>
          <p className="text-neutral-600">{t.completedBody}</p>
        </div>
      </main>
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
    <main className="min-h-screen bg-neutral-50">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-sm text-neutral-500 uppercase tracking-wide">
              {property.propertyCode}
            </p>
            <h1 className="text-3xl font-semibold mt-1">{t.pageTitle}</h1>
            {propertyTitle && (
              <p className="text-lg text-neutral-700 mt-1">{propertyTitle}</p>
            )}
            <p className="text-neutral-600 mt-2">{t.pageSubtitle}</p>
          </div>
          <LocaleToggle currentLocale={locale} t={t} />
        </div>

        <CompleteListingForm
          token={token}
          locale={locale}
          initialProperty={{
            propertyType: property.propertyType ?? '',
            description_es: property.description_es ?? '',
            description_en: property.description_en ?? '',
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
    </main>
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
      className="inline-flex items-center px-3 py-1.5 text-sm rounded-full border border-neutral-300 hover:bg-neutral-100 transition-colors"
    >
      {label}
    </a>
  )
}
