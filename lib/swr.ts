/**
 * Shared SWR fetcher. Throws on non-2xx so SWR surfaces `error` rather than
 * caching a failed response body.
 */
export async function fetcher<T = any>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) {
    const err = new Error(`Request failed: ${res.status}`) as Error & { status?: number }
    err.status = res.status
    throw err
  }
  return res.json()
}
