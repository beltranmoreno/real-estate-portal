import 'server-only'
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
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
 * File types we accept. Guests send passports, IDs and receipts (PDF or a
 * photo); admins and staff can also share Word and Excel files. Anything else
 * — HTML, SVG, scripts — is refused, so a booking's files can't be used to
 * show someone a web page.
 */
const GUEST_TYPES: Record<string, string[]> = {
  'application/pdf': ['pdf'],
  'image/jpeg': ['jpg', 'jpeg'],
  'image/png': ['png'],
  'image/webp': ['webp'],
  'image/heic': ['heic'],
  'image/heif': ['heif'],
}
const ADMIN_TYPES: Record<string, string[]> = {
  ...GUEST_TYPES,
  'application/msword': ['doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['docx'],
  'application/vnd.ms-excel': ['xls'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['xlsx'],
}

/** Types a browser can safely show in a tab; everything else downloads. */
const INLINE_TYPES = new Set(Object.keys(GUEST_TYPES))

/**
 * The content type to sign an upload with, or null when the file isn't
 * allowed. Uses the browser's type when it's on the list, otherwise the file
 * extension (some browsers send no type for HEIC photos). The extension must
 * match the type, so "photo.html" sent as image/png is refused.
 */
export function resolveUploadType(
  filename: string,
  browserType: string,
  who: 'guest' | 'admin'
): string | null {
  const allowed = who === 'guest' ? GUEST_TYPES : ADMIN_TYPES
  const ext = filename.toLowerCase().split('.').pop() ?? ''
  let type = browserType.toLowerCase().split(';')[0].trim()
  // Non-standard names some phones send for the same formats.
  if (type === 'image/jpg' || type === 'image/pjpeg') type = 'image/jpeg'
  if (type === 'image/heic-sequence') type = 'image/heic'
  if (type === 'image/heif-sequence') type = 'image/heif'
  if (allowed[type]) return allowed[type].includes(ext) ? type : null
  if (type && type !== 'application/octet-stream') return null
  return Object.keys(allowed).find((t) => allowed[t].includes(ext)) ?? null
}

/** Whether a stored file's type is one we accept at all. */
export function isAllowedStoredType(contentType: string | null | undefined): boolean {
  return Boolean(contentType && ADMIN_TYPES[contentType.toLowerCase().split(';')[0].trim()])
}

/**
 * Generate a presigned GET URL for downloading a document. 5-minute TTL.
 * Every call should be paired with an audit log entry so we know who
 * downloaded what and when.
 *
 * PDFs and photos open in the browser (with their real type); anything else,
 * including files stored before the type list existed, always downloads.
 */
export async function presignDownloadUrl(
  key: string,
  opts: { contentType?: string | null; filename?: string | null } = {}
): Promise<string> {
  const type = opts.contentType?.toLowerCase().split(';')[0].trim() ?? ''
  const inline = INLINE_TYPES.has(type)
  const name = (opts.filename || key.split('/').pop() || 'document').replace(/[^\w.\-]/g, '_')
  const cmd = new GetObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    ResponseContentType: inline ? type : 'application/octet-stream',
    ResponseContentDisposition: `${inline ? 'inline' : 'attachment'}; filename="${name}"`,
  })
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

/** Ids handed out by the upload sign routes: `doc_` + 24 hex characters. */
const DOCUMENT_ID = /^doc_[a-f0-9]{24}$/

/**
 * Step 2 of an upload, before the Document row is written: never trust the
 * key the browser sends back. It must be the one the sign route built for
 * this booking and this document id (bookings/<bookingId>/<documentId>/…),
 * and the file must really be in the bucket. Returns the stored size and
 * type — use those, not the browser's numbers — or an error to send back.
 */
export async function verifyUploadedObject(opts: {
  bookingId: string
  documentId: string
  storageKey: string
}): Promise<{ ok: true; size: number; contentType: string | null } | { ok: false; error: string }> {
  const prefix = `bookings/${opts.bookingId}/${opts.documentId}/`
  const name = opts.storageKey.slice(prefix.length)
  if (
    !DOCUMENT_ID.test(opts.documentId) ||
    !opts.storageKey.startsWith(prefix) ||
    !name ||
    name.includes('/') ||
    name.includes('..')
  ) {
    return { ok: false, error: 'Invalid upload' }
  }
  try {
    const head = await getClient().send(new HeadObjectCommand({ Bucket: R2_BUCKET, Key: opts.storageKey }))
    if (!isAllowedStoredType(head.ContentType)) {
      return { ok: false, error: 'This type of file isn’t accepted' }
    }
    return { ok: true, size: Number(head.ContentLength ?? 0), contentType: head.ContentType ?? null }
  } catch {
    return { ok: false, error: 'The upload didn’t reach storage — please try again' }
  }
}
