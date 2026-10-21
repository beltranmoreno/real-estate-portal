import { getPropertyOptions } from '@/lib/portal/properties'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import { toLocale, tFor } from '@/lib/i18n'
import { NewInquiryForm } from './NewInquiryForm'

export default async function NewInquiryPage() {
  const admin = await getCurrentUser()
  const locale = toLocale(admin?.locale)
  const t = tFor(locale)
  const properties = await getPropertyOptions()

  return (
    <div className="container mx-auto px-6 py-10 max-w-3xl">
      <p className="text-xs uppercase tracking-[0.25em] text-stone-500 mb-3">{t('New inquiry', 'Nueva consulta')}</p>
      <h1 className="text-3xl font-light text-stone-900 tracking-tight mb-2">{t('Log an inquiry', 'Registrar una consulta')}</h1>
      <p className="text-stone-600 font-light mb-10 max-w-2xl">
        {t(
          "For guests who reached out off the site — WhatsApp, a call, a referral. Add the houses you're thinking of; you can turn them into a private collection next.",
          'Para huéspedes que escribieron fuera del sitio — WhatsApp, una llamada, una referencia. Agrega las casas que tienes en mente; luego puedes convertirlas en una colección privada.'
        )}
      </p>
      <NewInquiryForm properties={properties} locale={locale} />
    </div>
  )
}
