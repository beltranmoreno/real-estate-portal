import { redirect } from 'next/navigation'
import Image from 'next/image'
import { UserButton } from '@clerk/nextjs'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import { getPropertyOptions } from '@/lib/portal/properties'
import { urlFor } from '@/sanity/lib/image'
import { PortalHeader } from '@/components/portal/PortalHeader'

export const metadata = {
  title: 'Owner Portal · Leticia Coudray Real Estate',
  robots: { index: false, follow: false },
}

/**
 * Owner dashboard — lists the properties this owner is linked to via the
 * OwnedProperty join table. Property content itself lives in Sanity.
 */
export default async function OwnerPortalPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/portal/sign-in')

  const locale: 'en' | 'es' = user.locale === 'es' ? 'es' : 'en'
  const t = (en: string, es: string) => (locale === 'es' ? es : en)

  const owned = await prisma.ownedProperty.findMany({
    where: { ownerUserId: user.id },
    orderBy: { createdAt: 'asc' },
  })

  const options = await getPropertyOptions()
  const byId = new Map(options.map((p) => [p._id, p]))

  return (
    <div className="min-h-screen bg-stone-50">
      <PortalHeader>
        <a
          href="/"
          className="text-xs uppercase tracking-[0.2em] text-stone-500 hover:text-stone-900 transition-colors"
        >
          ← {t('Back to website', 'Volver al sitio')}
        </a>
        <UserButton />
      </PortalHeader>

      <main className="container mx-auto px-6 py-12 max-w-5xl">
        <h1 className="text-3xl font-light text-stone-900 tracking-tight">
          {t('Welcome', 'Bienvenido')}
          {user.firstName ? `, ${user.firstName}` : ''}.
        </h1>
        <p className="text-stone-600 font-light mt-2">
          {t('Your properties', 'Tus propiedades')}
        </p>

        {owned.length === 0 ? (
          <div className="mt-10 p-8 bg-white border border-stone-200 rounded-sm text-center">
            <p className="text-stone-700 font-light">
              {t(
                'No properties are linked to your account yet.',
                'Aún no hay propiedades vinculadas a tu cuenta.'
              )}
            </p>
            <p className="text-sm text-stone-500 font-light mt-2">
              {t(
                'Please contact us and we will connect your listings.',
                'Contáctanos y vincularemos tus propiedades.'
              )}
            </p>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-stone-800 text-white text-sm font-light tracking-wide rounded-sm hover:bg-stone-900 transition-colors"
            >
              {t('Get in touch', 'Contáctanos')}
            </a>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {owned.map((op) => {
              const p = byId.get(op.propertySanityId)
              const title =
                (locale === 'es' ? p?.title_es : p?.title_en) ||
                p?.title_en ||
                p?.title_es ||
                t('Property', 'Propiedad')
              return (
                <div
                  key={op.id}
                  className="bg-white border border-stone-200 rounded-sm overflow-hidden"
                >
                  <div className="relative aspect-[4/3] bg-stone-100">
                    {p?.mainImage && (
                      <Image
                        src={urlFor(p.mainImage).width(800).height(600).fit('crop').url()}
                        alt={title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, 50vw"
                      />
                    )}
                  </div>
                  <div className="p-5">
                    <h2 className="font-light text-stone-900">{title}</h2>
                    {p?.propertyCode && (
                      <p className="text-xs text-stone-500 font-light mt-1 tracking-wide">
                        {p.propertyCode}
                      </p>
                    )}
                    {op.notes && (
                      <p className="text-sm text-stone-600 font-light mt-3 leading-relaxed">
                        {op.notes}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
