import 'server-only'
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

/**
 * Cloudflare R2 client. R2 is S3-compatible so we use the AWS SDK,
 * pointed at the R2 endpoint. Bucket is private — every read goes through
 * a short-TTL signed URL (5 min default for downloads).
 *
 * Env vars expected:
 *   R2_ACCOUNT_ID
 *   R2_ACCESS_KEY_ID
 *   R2_SECRET_ACCESS_KEY
 *   R2_BUCKET_NAME
 */

const accountId = process.env.R2_ACCOUNT_ID
const accessKeyId = process.env.R2_ACCESS_KEY_ID
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY
export const R2_BUCKET = process.env.R2_BUCKET_NAME ?? ''

let _client: S3Client | null = null

function getClient(): S3Client {
  if (_client) return _client
  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error(
      'R2 client not configured — set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY'
    )
  }
  _client = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  })
  return _client
}

/**
 * Build a deterministic storage key for a document. We use:
 *   bookings/<bookingId>/<documentId>/<original-filename>
 * which makes it easy to list everything for a booking, debug, and
 * batch-delete on retention sweeps.
 */
export function buildDocumentKey(opts: {
  bookingId: string
  documentId: string
  filename: string
}): string {
  const safe = opts.filename.replace(/[^\w.\-]/g, '_')
  return `bookings/${opts.bookingId}/${opts.documentId}/${safe}`
}

/**
 * Generate a presigned PUT URL the browser uses to upload directly to R2.
 * Expires in 5 minutes — plenty for a single upload, short enough that a
 * leaked URL becomes useless quickly.
 */
export async function presignUploadUrl(opts: {
  key: string
  contentType: string
  contentLength: number
  /** Hard cap: refuse oversized uploads at presign time (10 MB default). */
  maxBytes?: number
}): Promise<{ url: string; expiresAt: Date }> {
  const max = opts.maxBytes ?? 10 * 1024 * 1024
  if (opts.contentLength > max) {
    throw new Error(`File too large (${opts.contentLength} > ${max} bytes)`)
  }

  const cmd = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: opts.key,
    ContentType: opts.contentType,
    ContentLength: opts.contentLength,
  })
  const url = await getSignedUrl(getClient(), cmd, { expiresIn: 300 })
  return { url, expiresAt: new Date(Date.now() + 300_000) }
}

/**
 * Generate a presigned GET URL for downloading a document. 5-minute TTL.
 * Every call should be paired with an audit log entry so we know who
 * downloaded what and when.
 */
export async function presignDownloadUrl(key: string): Promise<string> {
  const cmd = new GetObjectCommand({ Bucket: R2_BUCKET, Key: key })
  return getSignedUrl(getClient(), cmd, { expiresIn: 300 })
}

/**
 * Hard-delete an object from R2. Used by the retention cron and admin
 * "delete document" actions. Idempotent — succeeds if the object already
 * doesn't exist.
 */
export async function deleteObject(key: string): Promise<void> {
  const cmd = new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: key })
  await getClient().send(cmd)
}
