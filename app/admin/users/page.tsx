import Link from 'next/link'
import { format } from 'date-fns'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/auth/requireRole'
import { toLocale, tFor } from '@/lib/i18n'
import { UserRoleSelect } from './UserRoleSelect'

export default async function AdminUsersPage() {
  const me = await requireAdmin()
  const locale = toLocale(me?.locale)
  const t = tFor(locale)

  const users = await prisma.user.findMany({
    orderBy: [{ role: 'asc' }, { createdAt: 'desc' }],
    take: 200,
    include: {
      _count: { select: { bookingsAsPrimary: true } },
    },
  })

  return (
    <div className="container mx-auto px-6 py-10 max-w-6xl">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.25em] text-stone-500 mb-3">
          {t('Users', 'Usuarios')}
        </p>
        <h1 className="text-3xl font-light text-stone-900 tracking-tight">
          {t('People with access', 'Personas con acceso')}
        </h1>
        <p className="text-stone-600 font-light mt-2 max-w-2xl">
          {t(
            'Promote a user to grant additional capabilities. Role changes take effect on their next page load.',
            'Promueve a un usuario para otorgarle capacidades adicionales. Los cambios de rol se aplican en su próxima carga de página.'
          )}
        </p>
      </div>

      {/* Legend */}
      <div className="bg-white border border-stone-200 rounded-xs p-5 mb-6">
        <p className="text-xs uppercase tracking-[0.2em] text-stone-500 font-light mb-3">
          {t('What each role can do', 'Qué puede hacer cada rol')}
        </p>
        <ul className="text-sm font-light text-stone-700 space-y-1">
          <li><strong className="font-medium">{t('Admin', 'Administrador')}</strong> — {t('full access, including managing users and roles', 'acceso total, incluida la gestión de usuarios y roles')}</li>
          <li><strong className="font-medium">{t('Agent', 'Agente')}</strong> — {t('same as admin minus user management and sensitive financials', 'igual que el administrador salvo la gestión de usuarios y la información financiera sensible')}</li>
          <li><strong className="font-medium">{t('Staff', 'Personal')}</strong> — {t('read upcoming bookings, fulfill requests, see non-sensitive docs only', 'ver próximas reservas, atender solicitudes y ver solo documentos no sensibles')}</li>
          <li><strong className="font-medium">{t('Renter', 'Arrendatario')}</strong> — {t('sees only their own bookings (default for guests)', 've solo sus propias reservas (predeterminado para huéspedes)')}</li>
          <li><strong className="font-medium">{t('Owner', 'Propietario')}</strong> — {t('sees only properties they own (no UI yet)', 've solo las propiedades que posee (aún sin interfaz)')}</li>
          <li><strong className="font-medium">{t('Additional guest', 'Huésped adicional')}</strong> — {t('secondary guest on a booking (no UI yet)', 'huésped secundario en una reserva (aún sin interfaz)')}</li>
        </ul>
      </div>

      <div className="bg-white border border-stone-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-200">
              <Th>{t('Name', 'Nombre')}</Th>
              <Th>{t('Email', 'Correo')}</Th>
              <Th>{t('Bookings', 'Reservas')}</Th>
              <Th>{t('Joined', 'Registrado')}</Th>
              <Th>{t('Role', 'Rol')}</Th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const isPlaceholder = u.clerkId.startsWith('pending:')
              return (
                <tr
                  key={u.id}
                  className="border-b border-stone-100 hover:bg-stone-50 transition-colors"
                >
                  <Td>
                    <Link
                      href={`/admin/users/${u.id}`}
                      className="hover:underline underline-offset-4"
                    >
                      {[u.firstName, u.lastName].filter(Boolean).join(' ') || (
                        <span className="text-stone-400">—</span>
                      )}
                    </Link>
                    {isPlaceholder && (
                      <span className="ml-2 text-xs uppercase tracking-wider text-amber-700">
                        {t('invited', 'invitado')}
                      </span>
                    )}
                  </Td>
                  <Td className="text-stone-900">
                    <Link
                      href={`/admin/users/${u.id}`}
                      className="hover:underline underline-offset-4"
                    >
                      {u.email}
                    </Link>
                  </Td>
                  <Td>
                    {u._count.bookingsAsPrimary > 0 ? (
                      u._count.bookingsAsPrimary
                    ) : (
                      <span className="text-stone-300">—</span>
                    )}
                  </Td>
                  <Td>{format(u.createdAt, 'MMM d, yyyy')}</Td>
                  <Td>
                    {u.id === me.id ? (
                      <span className="text-xs uppercase tracking-wider text-stone-700">
                        {u.role} {t('(you)', '(tú)')}
                      </span>
                    ) : isPlaceholder ? (
                      <span className="text-xs uppercase tracking-wider text-stone-400">
                        {t('— pending signup —', '— registro pendiente —')}
                      </span>
                    ) : (
                      <UserRoleSelect
                        userId={u.id}
                        initialRole={u.role}
                        locale={locale}
                      />
                    )}
                  </Td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-stone-500 font-light">
      {children}
    </th>
  )
}

function Td({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <td className={`px-4 py-3 font-light text-stone-700 ${className}`}>{children}</td>
  )
}
