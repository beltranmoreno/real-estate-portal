import { serverClient } from '@/sanity/lib/serverClient'

export interface AreaOption {
  _id: string
  title_en?: string
  title_es?: string
  slug?: string
}

/**
 * Fetch the area dropdown options for the owner completion form.
 * Sorted alphabetically by English title for predictable UX.
 */
export async function getAreaOptions(): Promise<AreaOption[]> {
  const query = `*[_type == "area" && defined(title_en)] | order(title_en asc) {
    _id,
    title_en,
    title_es,
    "slug": slug.current
  }`
  try {
    const results = (await (serverClient.fetch as unknown as (
      q: string
    ) => Promise<AreaOption[]>)(query)) as AreaOption[]
    return Array.isArray(results) ? results : []
  } catch (err) {
    console.error('[getAreaOptions] failed', err)
    return []
  }
}

export interface CompletionProperty {
  _id: string
  title_es?: string
  title_en?: string
  propertyCode?: string
  propertyType?: string
  description_es?: string
  description_en?: string
  shortDescription_es?: string
  shortDescription_en?: string
  status?: string
  location?: any
  amenities?: any
  pricing?: any
  availability?: any
  houseRules?: any
  contactInfo?: any
  mainImage?: any
  completionToken?: string
  completionTokenExpiresAt?: string
  completionDraft?: { data?: string; lastSavedAt?: string }
  completedBy?: { name?: string; email?: string; submittedAt?: string }
}

/**
 * Look up a property by its completion token. Returns null if the token
 * is missing, expired, or doesn't match any property. This is the ONLY
 * way the public completion endpoints verify authorization.
 */
export async function getPropertyByCompletionToken(
  token: string | undefined | null
): Promise<CompletionProperty | null> {
  if (!token || typeof token !== 'string' || token.length < 16) {
    return null
  }

  // Fetch every document that matches the token. With the `raw`
  // perspective this can return up to two results for the same
  // property: the draft (`_id` starts with `drafts.`) and the
  // published version. We prefer the draft because that's where the
  // agent's latest edits live, and Sanity will publish those changes
  // when the agent next clicks Publish.
  const query = `*[_type == "property" && completionToken == $token]{
    _id,
    title_es,
    title_en,
    propertyCode,
    propertyType,
    description_es,
    description_en,
    shortDescription_es,
    shortDescription_en,
    status,
    location,
    amenities,
    pricing,
    availability,
    houseRules,
    contactInfo,
    mainImage,
    completionToken,
    completionTokenExpiresAt,
    completionDraft,
    completedBy
  }`

  // next-sanity's typed GROQ returns `never` for queries it can't infer,
  // which makes passing a params object fail typecheck. The codebase isn't
  // using Sanity codegen yet, so cast through `unknown`.
  const results = (await (serverClient.fetch as unknown as (
    query: string,
    params: Record<string, unknown>
  ) => Promise<CompletionProperty[]>)(query, { token })) as CompletionProperty[]

  if (!results || results.length === 0) return null

  const draft = results.find((d) => d._id?.startsWith('drafts.'))
  const published = results.find((d) => !d._id?.startsWith('drafts.'))
  const property = draft ?? published ?? null

  if (!property) return null

  // Expiry check
  if (property.completionTokenExpiresAt) {
    const expiresAt = new Date(property.completionTokenExpiresAt).getTime()
    if (Number.isFinite(expiresAt) && expiresAt < Date.now()) {
      return null
    }
  }

  return property
}
