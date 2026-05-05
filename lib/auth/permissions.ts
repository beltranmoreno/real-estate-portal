import type { UserRole } from '@prisma/client'

/**
 * Role hierarchy — when a user has role X, they implicitly have all the
 * permissions of every role they inherit from. Lets us write STAFF features
 * once and have AGENT/ADMIN automatically pick them up.
 */
const ROLE_INHERITANCE: Record<UserRole, UserRole[]> = {
  ADMIN: ['ADMIN', 'AGENT', 'STAFF'],
  AGENT: ['AGENT', 'STAFF'],
  STAFF: ['STAFF'],
  RENTER: ['RENTER', 'ADDITIONAL_GUEST'],
  ADDITIONAL_GUEST: ['ADDITIONAL_GUEST'],
  OWNER: ['OWNER'],
}

const PERMISSIONS: Record<UserRole, string[]> = {
  ADMIN: ['*'],

  AGENT: [
    'booking.create',
    'booking.read',
    'booking.update',
    'guest.*',
    'request.*',
    'document.*',
    'invitation.create',
    'invitation.read',
    'invitation.revoke',
    // Notably missing vs ADMIN:
    //   - user.* (no role changes / can't promote others)
    //   - booking.delete
    //   - financial.read.commission
    //   - audit.purge
  ],

  STAFF: [
    'booking.read.upcoming',
    'guest.read',
    'request.read',
    'request.fulfill',
    'document.read.non_sensitive',
  ],

  RENTER: [
    'booking.read.own',
    'guest.read.own_booking',
    'request.read.own',
    'request.fulfill.own',
    'document.upload.own',
    'document.read.own',
  ],

  ADDITIONAL_GUEST: [
    'booking.read.own_limited',
    'guest.read.self',
    'document.upload.self',
    'document.read.self',
  ],

  OWNER: [
    'booking.read.owned_property',
    'document.read.owned_property.non_sensitive',
    'property.update.owned',
  ],
}

/** Document kinds whose contents are sensitive — passport-grade. */
export const SENSITIVE_DOCUMENT_KINDS = new Set([
  'PASSPORT',
  'ID',
  'CONTRACT',
])

/**
 * Match a granted permission like `request.*` against a requested action
 * like `request.fulfill`. The wildcard segment must be the last segment.
 */
function matches(granted: string, requested: string): boolean {
  if (granted === '*') return true
  if (granted === requested) return true
  if (granted.endsWith('.*')) {
    const prefix = granted.slice(0, -2)
    return requested === prefix || requested.startsWith(`${prefix}.`)
  }
  return false
}

export function hasPermission(role: UserRole, action: string): boolean {
  const inherited = ROLE_INHERITANCE[role] ?? [role]
  for (const r of inherited) {
    const grants = PERMISSIONS[r] ?? []
    if (grants.some((g) => matches(g, action))) return true
  }
  return false
}

export function isAdminRole(role: UserRole): boolean {
  return role === 'ADMIN' || role === 'AGENT'
}

export function isStaffOrAbove(role: UserRole): boolean {
  return role === 'ADMIN' || role === 'AGENT' || role === 'STAFF'
}
