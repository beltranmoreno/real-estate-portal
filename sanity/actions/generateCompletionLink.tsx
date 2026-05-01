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
    | {
        completionToken?: string
        completionTokenExpiresAt?: string
        completedBy?: { submittedAt?: string }
      }
    | null

  const existingToken =
    existing?.completionToken && existing?.completionTokenExpiresAt
      ? existing.completionToken
      : null
  const existingExpired = Boolean(
    existing?.completionTokenExpiresAt &&
      new Date(existing.completionTokenExpiresAt).getTime() < Date.now()
  )
  const hasValidToken = Boolean(existingToken && !existingExpired)
  const hasPriorSubmission = Boolean(existing?.completedBy?.submittedAt)

  // Label clarifies what the click will do:
  // - Owner already submitted → "Generate new owner link" (fresh send)
  // - Valid token outstanding  → "Copy owner link" (re-share the live link)
  // - No token / expired       → "Generate owner link"
  let label: string
  if (hasValidToken) label = 'Copy owner link'
  else if (hasPriorSubmission) label = 'Generate new owner link'
  else label = 'Generate owner link'

  return {
    label,
    icon: LinkIcon,
    disabled: busy || !docId,
    onHandle: async () => {
      setBusy(true)
      try {
        let token = existingToken
        // Generate a new token whenever there isn't a valid one. After
        // owner submission the token is unset by the complete endpoint,
        // so this branch handles the "send again" flow automatically.
        if (!hasValidToken) {
          token = randomToken()
          const expiresAt = new Date(
            Date.now() + TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000
          ).toISOString()

          // The server-side completion lookup uses the `raw`
          // perspective, so patching whichever id we have (draft or
          // published) is sufficient for the public link to resolve.
          await client
            .patch(docId)
            .set({
              completionToken: token,
              completionTokenExpiresAt: expiresAt,
            })
            // Clear any leftover audit data from the previous submission
            // so the new link doesn't trip the "already submitted" guard
            // on the public completion page.
            .unset(hasPriorSubmission ? ['completedBy'] : [])
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
