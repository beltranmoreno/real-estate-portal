export function getBaseUrl() {
  if (typeof window !== 'undefined') {
    return ''
  }

  // In production/preview, use the deployment URL
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  // Allow override with custom URL
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL
  }

  // Fallback to localhost for development
  return `http://localhost:${process.env.PORT ?? 3000}`
}

export function getApiUrl(path: string) {
  const baseUrl = getBaseUrl()
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${baseUrl}${cleanPath}`
}