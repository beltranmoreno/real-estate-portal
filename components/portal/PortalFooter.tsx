/**
 * Portal footer — houses the "Back to website" link (moved out of the
 * header) plus a small copyright line. Takes `locale` for the label.
 */
export function PortalFooter({ locale = 'en' }: { locale?: 'en' | 'es' }) {
  const t = (en: string, es: string) => (locale === 'es' ? es : en)
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-line mt-16">
      <div className="container mx-auto px-6 py-8 max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <a
          href="/"
          className="text-xs uppercase tracking-[0.2em] text-muted-2 hover:text-ink transition-colors"
        >
          ← {t('Back to website', 'Volver a la web')}
        </a>
        <p className="text-xs text-faint font-light">
          © {year} Leticia Coudray Real Estate
        </p>
      </div>
    </footer>
  )
}
