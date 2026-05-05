import 'server-only'
import { prisma } from '@/lib/db'
import { deleteObject } from '@/lib/r2'

/**
 * Compliance retention sweep. Hard-deletes documents (R2 + DB) that have
 * passed their `expiresAt` timestamp. Used for sensitive doc kinds
 * (PASSPORT/ID/CONTRACT) which we set to expire 90 days after the
 * booking's checkOut at upload time.
 *
 * We delete the R2 blob first; if that fails, we leave the DB row in
 * place so the sweep retries tomorrow. Better than the inverse (DB row
 * gone but blob still in R2 — that's an orphan we'd never clean up).
 */
export async function purgeExpiredDocuments() {
  const now = new Date()

  const expired = await prisma.document.findMany({
    where: {
      expiresAt: { lt: now, not: null },
    },
    select: {
      id: true,
      storageKey: true,
      kind: true,
      bookingId: true,
    },
    // Cap the batch so a backlog doesn't blow the cron's 5-minute budget
    take: 500,
  })

  let purged = 0
  const failures: string[] = []

  for (const doc of expired) {
    try {
      await deleteObject(doc.storageKey)
    } catch (err) {
      console.error('[purgeDocuments] R2 delete failed', doc.id, err)
      failures.push(doc.id)
      continue
    }

    await prisma.$transaction([
      prisma.document.delete({ where: { id: doc.id } }),
      prisma.auditLog.create({
        data: {
          actorUserId: null,
          entity: 'document',
          entityId: doc.id,
          action: 'purged',
          payload: {
            reason: 'retention_expired',
            kind: doc.kind,
            bookingId: doc.bookingId,
          },
        },
      }),
    ])
    purged++
  }

  return { purged, candidates: expired.length, failures }
}
