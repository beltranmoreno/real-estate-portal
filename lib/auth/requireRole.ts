import 'server-only'
import { redirect } from 'next/navigation'
import type { User, UserRole } from '@prisma/client'
import { hasPermission, isAdminRole, isStaffOrAbove } from './permissions'
import { requireCurrentUser } from './getCurrentUser'

/**
 * Server-side guards for pages and route handlers. Each redirects (page)
 * or throws (route handler) when the user doesn't meet the requirement.
 *
 * Usage in a page:
 *   const user = await requireAdmin()
 *
 * Usage in a route handler:
 *   const user = await requireAdmin({ throwOnFail: true })
 */

interface Options {
  /** Throw a 403-style error instead of redirecting (for API routes). */
  throwOnFail?: boolean
}

export async function requireAdmin(opts: Options = {}): Promise<User> {
  const user = await requireCurrentUser()
  if (!isAdminRole(user.role)) return reject(opts)
  return user
}

export async function requireStaffOrAbove(opts: Options = {}): Promise<User> {
  const user = await requireCurrentUser()
  if (!isStaffOrAbove(user.role)) return reject(opts)
  return user
}

export async function requirePermission(
  action: string,
  opts: Options = {}
): Promise<User> {
  const user = await requireCurrentUser()
  if (!hasPermission(user.role, action)) return reject(opts)
  return user
}

export async function requireRoleOneOf(
  roles: UserRole[],
  opts: Options = {}
): Promise<User> {
  const user = await requireCurrentUser()
  if (!roles.includes(user.role)) return reject(opts)
  return user
}

function reject(opts: Options): never {
  if (opts.throwOnFail) {
    const err = new Error('Forbidden') as Error & { status?: number }
    err.status = 403
    throw err
  }
  redirect('/portal')
}
