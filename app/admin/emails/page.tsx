import Link from 'next/link'
import { requireAdmin } from '@/lib/auth/requireRole'
import { toLocale, tFor } from '@/lib/i18n'
import { EMAILS, STAGES, type EmailEntry } from '@/lib/admin/emailCatalog'
import { getWelcomePickIds, getWelcomePickOptions, WELCOME_PICKS_MAX } from '@/lib/email/welcomePicks'
import { WelcomePicksEditor } from './WelcomePicksEditor'

export const dynamic = 'force-dynamic'

const TRIGGER = {
  automatic: { en: 'Automatic', es: 'Automático', cls: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  admin: { en: 'You send it', es: 'Lo envías tú', cls: 'bg-amber-50 text-amber-800 border-amber-200' },
  form: { en: 'Website form', es: 'Formulario web', cls: 'bg-sky-50 text-sky-800 border-sky-200' },
} as const

export default async function AdminEmailsPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>
}) {
  const me = await requireAdmin()
  const locale = toLocale(me?.locale)
  const t = tFor(locale)
  const { lang: langParam } = await searchParams
  // Language of the sample emails (independent of the admin UI language).
  const lang: 'en' | 'es' = langParam === 'es' ? 'es' : langParam === 'en' ? 'en' : locale

  const AREA: Record<string, string> = {
    'altos-de-chavon': 'Altos de Chavón',
    marina: 'Marina',
    hotel: 'Hotel',
    'golf-club': 'Golf Club',
    'beach-club': 'Minitas Beach',
  }
  const [pickIds, pickOptions] = await Promise.all([
    getWelcomePickIds(),
    getWelcomePickOptions().catch((err) => {
      console.error('[admin/emails] pick options failed', err)
      return { restaurants: [], activities: [] }
    }),
  ])
  const picksEditor = (
    <WelcomePicksEditor
      restaurants={pickOptions.restaurants.map((x) => ({
        id: x._id,
        name: x.name_en?.trim(),
        meta: [AREA[x.area ?? ''], x.featured ? t('Featured', 'Destacado') : null].filter(Boolean).join(' · ') || null,
      }))}
      activities={pickOptions.activities.map((x) => ({ id: x._id, name: x.name_en?.trim(), meta: x.group ?? null }))}
      initialRestaurantIds={pickIds.restaurantIds}
      initialActivityIds={pickIds.activityIds}
      max={WELCOME_PICKS_MAX}
      locale={locale}
    />
  )

  const rendered = await Promise.all(
    EMAILS.map(async (e) => {
      const l = e.englishOnly ? 'en' : lang
      try {
        return { e, subject: e.subject(l), html: await e.html(l) }
      } catch (err) {
        console.error('[admin/emails] render failed', e.id, err)
        return { e, subject: e.subject(l), html: null }
      }
    })
  )

  return (
    <div className="container mx-auto px-6 py-10 max-w-5xl">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-stone-500 mb-3">{t('Emails', 'Correos')}</p>
          <h1 className="text-3xl font-light text-stone-900 tracking-tight">
            {t('Every email we send', 'Todos los correos que enviamos')}
          </h1>
          <p className="text-stone-600 font-light mt-2 max-w-2xl">
            {t(
              'In the order a guest receives them, with when each one goes out. Open any of them to see a sample with made-up details.',
              'En el orden en que los recibe un huésped, con cuándo sale cada uno. Abre cualquiera para ver un ejemplo con datos inventados.'
            )}
          </p>
        </div>
        <div className="flex items-center gap-1 text-sm" role="group" aria-label={t('Sample language', 'Idioma del ejemplo')}>
          <span className="text-stone-500 font-light mr-2">{t('Samples in', 'Ejemplos en')}</span>
          {(['en', 'es'] as const).map((l) => (
            <Link
              key={l}
              href={`/admin/emails?lang=${l}`}
              aria-current={lang === l ? 'true' : undefined}
              className={`px-3 py-1.5 border rounded-sm ${
                lang === l ? 'bg-stone-900 text-white border-stone-900' : 'border-stone-300 text-stone-700 hover:bg-stone-100'
              }`}
            >
              {l === 'en' ? 'English' : 'Español'}
            </Link>
          ))}
        </div>
      </div>

      <div className="space-y-10">
        {STAGES.map((stage) => {
          const items = rendered.filter((x) => x.e.stage === stage.key)
          if (items.length === 0) return null
          return (
            <section key={stage.key}>
              <h2 className="text-xs uppercase tracking-[0.2em] text-stone-500 mb-3">{stage.label[locale]}</h2>
              <div className="bg-white border border-stone-200 divide-y divide-stone-200">
                {items.map(({ e, subject, html }) => (
                  <EmailRow
                    key={e.id}
                    e={e}
                    subject={subject}
                    html={html}
                    locale={locale}
                    extra={e.id === 'invitation' ? picksEditor : undefined}
                  />
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}

function EmailRow({
  e,
  subject,
  html,
  locale,
  extra,
}: {
  e: EmailEntry
  subject: string
  html: string | null
  locale: 'en' | 'es'
  /** Settings shown under the sample (e.g. the welcome email's picks). */
  extra?: React.ReactNode
}) {
  const t = (en: string, es: string) => (locale === 'es' ? es : en)
  const trig = TRIGGER[e.trigger]
  return (
    <details className="group">
      <summary className="cursor-pointer list-none px-5 py-4 hover:bg-stone-50 [&::-webkit-details-marker]:hidden">
        <div className="flex flex-wrap items-start gap-x-4 gap-y-2">
          <div className="flex-1 min-w-[16rem]">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-stone-900 font-normal">{e.name[locale]}</span>
              <span className={`text-[11px] px-2 py-0.5 border rounded-full ${trig.cls}`}>{trig[locale]}</span>
              <span className="text-[11px] px-2 py-0.5 border border-stone-200 rounded-full text-stone-600">
                {e.to === 'guest' ? t('To the guest', 'Al huésped') : t('To the team', 'Al equipo')}
              </span>
            </div>
            <p className="text-sm text-stone-600 font-light mt-1.5">{e.when[locale]}</p>
            {e.notes && <p className="text-xs text-stone-500 font-light mt-1">{e.notes[locale]}</p>}
          </div>
          <span className="text-sm text-stone-500 font-light group-open:hidden">{t('View sample', 'Ver ejemplo')} ↓</span>
          <span className="text-sm text-stone-500 font-light hidden group-open:inline">{t('Hide', 'Ocultar')} ↑</span>
        </div>
      </summary>
      <div className="px-5 pb-6">
        <div className="border border-stone-200 rounded-sm overflow-hidden">
          <div className="px-4 py-3 bg-stone-50 border-b border-stone-200 text-sm">
            <p className="text-stone-500 font-light">
              {t('Subject', 'Asunto')}: <span className="text-stone-900 font-normal">{subject}</span>
            </p>
            {e.englishOnly && (
              <p className="text-xs text-stone-500 font-light mt-1">{t('Internal — always in English.', 'Interno — siempre en inglés.')}</p>
            )}
          </div>
          {html ? (
            <iframe
              title={e.name[locale]}
              srcDoc={html}
              sandbox=""
              loading="lazy"
              className="w-full h-[640px] bg-white"
            />
          ) : (
            <p className="p-4 text-sm text-red-700">{t('Could not render this sample.', 'No se pudo generar este ejemplo.')}</p>
          )}
        </div>
        {extra && <div className="mt-4">{extra}</div>}
      </div>
    </details>
  )
}
