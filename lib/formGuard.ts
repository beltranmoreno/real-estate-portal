import 'server-only'
import type { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'

/**
 * Abuse limits for the public forms (/api/contact, /api/inquire).
 *
 * Two layers, no extra infrastructure:
 *  - Per IP, in memory. Fluid Compute reuses instances, so this stops a single
 *    script hammering the form, but it isn't shared between instances.
 *  - In the database (Inquiry rows), shared everywhere: a cap per email
 *    address and a site-wide cap per hour. Over a cap we stop sending the
 *    visitor confirmation email, so the forms can't be used to mail strangers.
 */

const IP_WINDOW_MS = 60 * 60 * 1000
const IP_MAX = 5
const hits = new Map<string, number[]>()

export function clientIp(req: NextRequest): string {
  return (
    req.headers.get('x-real-ip') ||
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown'
  )
}

/** True when this IP has sent too many submissions to `bucket` in the last hour. */
export function ipLimited(req: NextRequest, bucket: string): boolean {
  const key = `${bucket}:${clientIp(req)}`
  const now = Date.now()
  const recent = (hits.get(key) ?? []).filter((t) => now - t < IP_WINDOW_MS)
  if (recent.length >= IP_MAX) {
    hits.set(key, recent)
    return true
  }
  recent.push(now)
  hits.set(key, recent)
  // Keep the map from growing without bound.
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (!v.some((t) => now - t < IP_WINDOW_MS)) hits.delete(k)
  }
  return false
}

const PER_EMAIL_PER_HOUR = 3
const PER_EMAIL_PER_DAY = 6
const SITE_PER_HOUR = 60

/**
 * Whether we should still send a confirmation email to `email`. Counts the
 * inquiries already saved (call it before saving the new one).
 */
export async function mayEmailVisitor(email: string | null | undefined): Promise<boolean> {
  if (!email) return false
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000)
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
  try {
    const [hour, day, site] = await Promise.all([
      prisma.inquiry.count({ where: { email: { equals: email, mode: 'insensitive' }, createdAt: { gte: hourAgo }, createdByUserId: null } }),
      prisma.inquiry.count({ where: { email: { equals: email, mode: 'insensitive' }, createdAt: { gte: dayAgo }, createdByUserId: null } }),
      prisma.inquiry.count({ where: { createdAt: { gte: hourAgo }, createdByUserId: null } }),
    ])
    return hour < PER_EMAIL_PER_HOUR && day < PER_EMAIL_PER_DAY && site < SITE_PER_HOUR
  } catch {
    return false
  }
}

/** Site-wide flood check: too many public submissions in the last hour. */
export async function siteFlooded(): Promise<boolean> {
  try {
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000)
    const n = await prisma.inquiry.count({ where: { createdAt: { gte: hourAgo }, createdByUserId: null } })
    return n >= SITE_PER_HOUR * 3
  } catch {
    return false
  }
}

/**
 * The name to greet the visitor with in our emails. It's typed by whoever
 * submitted the form, so keep only a plain first name: no links, no domains,
 * no long text that could turn our email into someone else's message.
 */
export function greetingName(name: string | null | undefined): string {
  const first = (name ?? '').trim().split(/\s+/)[0] ?? ''
  // Anything that looks like a link or address: don't greet by name at all.
  if (/[./:@\\]|www/i.test(first)) return ''
  return first.replace(/[^\p{L}\p{M}'’-]/gu, '').slice(0, 30)
}
