import { serverClient } from '@/sanity/lib/serverClient'

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

  const query = `*[_type == "property" && completionToken == $token][0]{
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
  const property = (await (serverClient.fetch as unknown as (
    query: string,
    params: Record<string, unknown>
  ) => Promise<CompletionProperty | null>)(query, { token })) as
    | CompletionProperty
    | null

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
