import { NextResponse } from 'next/server'
import { releaseKeys } from '@/lib/portal/cron/releaseKeys'
import { sendReminders } from '@/lib/portal/cron/sendReminders'
import { expireInvitations } from '@/lib/portal/cron/expireInvitations'
import { purgeExpiredDocuments } from '@/lib/portal/cron/purgeDocuments'

/**
 * Daily portal sweep. Wired in vercel.json to run at 13:00 UTC = 9am AST.
 *
 * Protected by CRON_SECRET — Vercel's cron service automatically attaches
 * `Authorization: Bearer <CRON_SECRET>` to every request. Anyone hitting
 * this URL without that header gets 401.
 *
 * Runs each sweep sequentially. Failures in one sweep don't block the
 * others; we collect them in `errors` and return a summary so the Vercel
 * Cron logs surface anything that went sideways.
 *
 * Force-execute manually:
 *   curl -H "Authorization: Bearer <secret>" https://<site>/api/cron/daily
 */

// Allow up to 5 minutes — most sweeps finish in seconds, but a big
// document purge could need more.
export const maxDuration = 300

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret) {
    console.error('[cron/daily] CRON_SECRET not set')
    return NextResponse.json({ error: 'Misconfigured' }, { status: 500 })
  }

  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const startedAt = Date.now()
  const errors: Array<{ sweep: string; message: string }> = []
  const results: Record<string, unknown> = {}

  for (const [name, fn] of Object.entries({
    releaseKeys,
    sendReminders,
    expireInvitations,
    purgeExpiredDocuments,
  })) {
    try {
      results[name] = await fn()
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      console.error(`[cron/daily] ${name} failed:`, err)
      errors.push({ sweep: name, message })
    }
  }

  const durationMs = Date.now() - startedAt
  return NextResponse.json({ ok: true, durationMs, results, errors })
}
