import { useState } from 'react'
import { LinkIcon } from '@sanity/icons'
import type { DocumentActionComponent, DocumentActionProps } from 'sanity'
import { useClient } from 'sanity'

/**
 * Studio document action that:
 *   1. Generates a random completion token (browser-side crypto).
 *   2. Patches the property with the token + 14-day expiry using the
 *      current user's authenticated Sanity session (no shared secret).
 *   3. Copies a link to the clipboard that the agent can send to the
 *      property owner via WhatsApp / email.
 *
 * The owner uses the link at /complete-listing/[token] to fill in the
 * rest of the property details without ever touching the Studio.
 */
const TOKEN_TTL_DAYS = 14

function randomToken(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

function getSiteUrl(): string {
  // Configured via NEXT_PUBLIC_SITE_URL (same var used elsewhere in the app).
  // Available in the Studio bundle because it's a NEXT_PUBLIC_ variable.
  const fromEnv =
    (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SITE_URL) ||
    undefined
  if (fromEnv) return fromEnv.replace(/\/$/, '')
  if (typeof window !== 'undefined') return window.location.origin
  return ''
}

export const generateCompletionLink: DocumentActionComponent = (
  props: DocumentActionProps
) => {
  const { id, type, published, draft, onComplete } = props
  const client = useClient({ apiVersion: '2025-09-06' })
  const [busy, setBusy] = useState(false)

  // Only show on property documents that have been saved (have a real id).
  if (type !== 'property') return null

  // Use the published id if available; otherwise patch the draft id.
  const docId = published?._id || draft?._id || id
  const existing = (published || draft) as
    | { completionToken?: string; completionTokenExpiresAt?: string }
    | null

  const existingToken =
    existing?.completionToken && existing?.completionTokenExpiresAt
      ? existing.completionToken
      : null
  const existingExpired =
    existing?.completionTokenExpiresAt &&
    new Date(existing.completionTokenExpiresAt).getTime() < Date.now()

  return {
    label: existingToken && !existingExpired ? 'Copy owner link' : 'Generate owner link',
    icon: LinkIcon,
    disabled: busy || !docId,
    onHandle: async () => {
      setBusy(true)
      try {
        let token = existingToken
        if (!token || existingExpired) {
          token = randomToken()
          const expiresAt = new Date(
            Date.now() + TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000
          ).toISOString()

          // The server-side completion lookup uses the `drafts`
          // perspective, so patching whichever id we have (draft or
          // published) is sufficient for the public link to resolve.
          await client
            .patch(docId)
            .set({
              completionToken: token,
              completionTokenExpiresAt: expiresAt,
            })
            .commit({ autoGenerateArrayKeys: true })
        }

        const url = `${getSiteUrl()}/complete-listing/${token}`

        // Copy to clipboard and show the URL via a simple prompt fallback.
        try {
          await navigator.clipboard.writeText(url)
          window.alert(`Link copied to clipboard:\n\n${url}`)
        } catch {
          window.prompt('Copy this link and send it to the property owner:', url)
        }
      } catch (err) {
        console.error('[generateCompletionLink] error', err)
        window.alert('Could not generate link. Check the console for details.')
      } finally {
        setBusy(false)
        onComplete()
      }
    },
  }
}
