import { redirect } from 'next/navigation'
import Link from 'next/link'
import { UserButton } from '@clerk/nextjs'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import { PortalHeader } from '@/components/portal/PortalHeader'
import { PortalFooter } from '@/components/portal/PortalFooter'
import { PortalLocaleSwitcher } from '@/components/portal/PortalLocaleSwitcher'
import { ProfileForm } from './ProfileForm'

export const metadata = {
  title: 'Your details · Leticia Coudray Real Estate',
  robots: { index: false, follow: false },
}

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string }>
}) {
  const user = await getCurrentUser()
  if (!user) redirect('/portal/sign-in')

  const { returnTo } = await searchParams
  const locale: 'en' | 'es' = user.locale === 'es' ? 'es' : 'en'
  const t = (en: string, es: string) => (locale === 'es' ? es : en)
  // Only allow internal return paths.
  const safeReturn =
    returnTo && returnTo.startsWith('/') ? returnTo : undefined

  return (
    <div className="min-h-screen bg-stone-50">
      <PortalHeader>
        <PortalLocaleSwitcher current={locale} />
        <UserButton />
      </PortalHeader>

      <main className="container mx-auto px-6 py-12 max-w-xl">
        {safeReturn && (
          <Link
            href={safeReturn}
            className="text-xs uppercase tracking-[0.25em] text-stone-500 hover:text-stone-700"
          >
            ← {t('Back', 'Atrás')}
          </Link>
        )}
        <h1 className="text-3xl font-light text-stone-900 tracking-tight mt-3 mb-2">
          {t('Your details', 'Tus datos')}
        </h1>
        <p className="text-sm text-stone-600 font-light mb-8 leading-relaxed">
          {t(
            'This is how our team knows who they’re helping. Please keep it up to date.',
            'Así nuestro equipo sabe a quién está atendiendo. Mantén tus datos actualizados.'
          )}
        </p>

        <div className="bg-white border border-stone-200 rounded-sm p-6">
          <ProfileForm
            locale={locale}
            email={user.email}
            initialFirstName={user.firstName ?? ''}
            initialLastName={user.lastName ?? ''}
            initialPhone={user.phone ?? ''}
            returnTo={safeReturn}
          />
        </div>
      </main>

      <PortalFooter locale={locale} />
    </div>
  )
}
