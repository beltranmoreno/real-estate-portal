import { DocumentLink } from '@/components/portal/DocumentLink'

export interface StayCostLine {
  id: string
  /** ISO date the cost was incurred, if known. */
  date: string | null
  label: string
  category: 'GROCERIES' | 'ALCOHOL' | 'SERVICE' | 'EXTRA'
  amount: number
  currency: string
  receipt: { id: string; filename: string } | null
}

const CATEGORY_LABELS: Record<StayCostLine['category'], { en: string; es: string }> = {
  GROCERIES: { en: 'Groceries', es: 'Supermercado' },
  ALCOHOL: { en: 'Wine & spirits', es: 'Vinos y licores' },
  SERVICE: { en: 'Services', es: 'Servicios' },
  EXTRA: { en: 'Extras', es: 'Extras' },
}
const CATEGORY_ORDER: StayCostLine['category'][] = ['GROCERIES', 'ALCOHOL', 'SERVICE', 'EXTRA']

function money(amount: number, currency: string, locale: 'en' | 'es') {
  try {
    return new Intl.NumberFormat(locale === 'es' ? 'es-DO' : 'en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(amount)
  } catch {
    return `${currency} ${amount.toFixed(2)}`
  }
}

function fmtDay(iso: string, locale: 'en' | 'es') {
  return new Date(iso).toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

/**
 * Running costs of a stay, grouped by category, with the receipt behind each
 * line when there is one and a total per currency. Used on the guest's stay
 * page and the admin booking page (`scope` picks the document endpoint).
 */
export function StayCosts({
  lines,
  locale,
  scope = 'renter',
}: {
  lines: StayCostLine[]
  locale: 'en' | 'es'
  scope?: 'renter' | 'admin'
}) {
  const t = (en: string, es: string) => (locale === 'es' ? es : en)
  if (lines.length === 0) return null

  const totals = new Map<string, number>()
  for (const l of lines) totals.set(l.currency, (totals.get(l.currency) ?? 0) + l.amount)

  const groups = CATEGORY_ORDER.map((cat) => ({
    cat,
    items: lines
      .filter((l) => l.category === cat)
      .sort((a, b) => (a.date ?? '').localeCompare(b.date ?? '')),
  })).filter((g) => g.items.length > 0)

  return (
    <div>
      {groups.map((g) => (
        <div key={g.cat} className="mb-8 last:mb-6">
          <p className="eyebrow mb-3">{t(CATEGORY_LABELS[g.cat].en, CATEGORY_LABELS[g.cat].es)}</p>
          <ul className="border-t border-line">
            {g.items.map((l) => (
              <li
                key={l.id}
                className="grid grid-cols-[3.5rem_1fr_auto] items-baseline gap-3 py-3 border-b border-line text-sm font-light"
              >
                <span className="text-xs uppercase tracking-wider text-muted-2 tabular-nums">
                  {l.date ? fmtDay(l.date, locale) : '—'}
                </span>
                <span className="min-w-0">
                  <span className="text-ink">{l.label}</span>
                  {l.receipt && (
                    <span className="ml-2 text-xs">
                      <DocumentLink documentId={l.receipt.id} scope={scope} filename={l.receipt.filename}>
                        {t('Receipt', 'Recibo')}
                      </DocumentLink>
                    </span>
                  )}
                </span>
                <span className="text-ink tabular-nums whitespace-nowrap">{money(l.amount, l.currency, locale)}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}

      <div className="flex flex-wrap items-baseline justify-between gap-4 border-t border-line pt-4">
        <span className="eyebrow">{t('Total so far', 'Total hasta ahora')}</span>
        <span className="flex flex-col items-end gap-1">
          {Array.from(totals.entries()).map(([currency, total]) => (
            <span key={currency} className="font-display text-2xl text-ink tabular-nums">
              {money(total, currency, locale)}
            </span>
          ))}
        </span>
      </div>
    </div>
  )
}
