import 'server-only'
import { randomBytes } from 'crypto'

/**
 * The secret in a portal invitation link: 32 random bytes (256 bits),
 * URL-safe. Replaces the schema's cuid default, which is unique but not
 * designed to be unguessable. Links sent before this keep working.
 */
export function newInviteToken(): string {
  return randomBytes(32).toString('base64url')
}

/** "jane.doe@gmail.com" → "ja•••@gmail.com", for messages shown on screen. */
export function maskEmail(email: string): string {
  const [name, domain] = email.split('@')
  if (!domain) return '•••'
  return `${name.slice(0, Math.min(2, name.length))}•••@${domain}`
}
