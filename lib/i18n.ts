export type Locale = 'en' | 'es'

/** Normalize any stored locale string to a supported Locale. */
export function toLocale(value?: string | null): Locale {
  return value === 'es' ? 'es' : 'en'
}

/**
 * Build a translate helper: `const t = tFor(locale); t('English', 'Español')`.
 * Same pattern used across the guest portal — shared so the admin can use it
 * in both server pages and client components (it's a pure function).
 */
export function tFor(locale: Locale) {
  return (en: string, es: string) => (locale === 'es' ? es : en)
}
