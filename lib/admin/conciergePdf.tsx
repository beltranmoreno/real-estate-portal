import 'server-only'
import React from 'react'
import { Document, Page, StyleSheet, Text, View, renderToBuffer } from '@react-pdf/renderer'
import { serviceDetailLines } from '@/lib/portal/serviceForms'
import { formatTime } from '@/lib/formatTime'
import { dbDateKey, keyToDayMonthYear } from '@/lib/dates'

export interface ConciergePdfRequest {
  serviceName: string
  serviceSlug: string | null
  kind: string
  status: string
  venueName: string | null
  attractionName: string | null
  preferredDate: Date | null
  endDate: Date | null
  preferredTime: string | null
  partySize: number | null
  details: unknown
  notes: string | null
  quotedAmount: { toString(): string } | null
  currency: string | null
  groceryItems: unknown
  plateItems: unknown
}

const STATUS: Record<string, { en: string; es: string }> = {
  REQUESTED: { en: 'Requested', es: 'Solicitado' },
  IN_PROGRESS: { en: 'In progress', es: 'En proceso' },
  CONFIRMED: { en: 'Confirmed', es: 'Confirmado' },
  COMPLETED: { en: 'Completed', es: 'Completado' },
  DECLINED: { en: 'Declined', es: 'Rechazado' },
  CANCELLED: { en: 'Cancelled', es: 'Cancelado' },
}

const s = StyleSheet.create({
  page: { paddingTop: 48, paddingHorizontal: 48, paddingBottom: 64, fontSize: 10, fontFamily: 'Helvetica', color: '#1c1917', lineHeight: 1.4 },
  eyebrow: { fontSize: 8, letterSpacing: 2, textTransform: 'uppercase', color: '#78716c' },
  title: { fontSize: 22, fontFamily: 'Times-Roman', marginTop: 8, lineHeight: 1.2 },
  meta: { fontSize: 10, color: '#57534e', marginTop: 6 },
  rule: { borderBottomWidth: 1, borderBottomColor: '#e7e5e4', marginVertical: 18 },
  day: { fontSize: 8, letterSpacing: 1.5, textTransform: 'uppercase', color: '#78716c', marginTop: 14, marginBottom: 6 },
  item: { borderTopWidth: 1, borderTopColor: '#e7e5e4', paddingVertical: 8, flexDirection: 'row' },
  when: { width: 70, color: '#57534e' },
  body: { flex: 1 },
  name: { fontSize: 11, fontFamily: 'Helvetica-Bold' },
  sub: { color: '#57534e', marginTop: 1 },
  detail: { flexDirection: 'row', marginTop: 2 },
  detailLabel: { width: 130, color: '#78716c' },
  detailValue: { flex: 1 },
  notes: { marginTop: 4, color: '#44403c' },
  status: { width: 70, textAlign: 'right', fontSize: 8, textTransform: 'uppercase', letterSpacing: 1, color: '#57534e' },
  footer: { position: 'absolute', bottom: 28, left: 48, right: 48, fontSize: 8, color: '#a8a29e' },
})

/**
 * The concierge plan for one booking: every live request, grouped by day,
 * with the service details the guest gave. No internal notes or vendor
 * costs — this is safe to send to the guest.
 */
export async function renderConciergePdf(opts: {
  propertyTitle: string
  guestName: string
  checkIn: Date
  checkOut: Date
  requests: ConciergePdfRequest[]
  locale: 'en' | 'es'
}): Promise<Buffer> {
  const { locale } = opts
  const t = (en: string, es: string) => (locale === 'es' ? es : en)
  const day = (d: Date) => keyToDayMonthYear(dbDateKey(d))

  // Live requests, dated first in date/time order, undated at the end.
  const live = opts.requests
    .filter((r) => r.status !== 'CANCELLED' && r.status !== 'DECLINED')
    .sort((a, b) => {
      const ak = a.preferredDate ? dbDateKey(a.preferredDate) : '9999'
      const bk = b.preferredDate ? dbDateKey(b.preferredDate) : '9999'
      return ak.localeCompare(bk) || (a.preferredTime ?? '').localeCompare(b.preferredTime ?? '')
    })
  const groups = new Map<string, ConciergePdfRequest[]>()
  for (const r of live) {
    const key = r.preferredDate ? day(r.preferredDate) : t('Date to be confirmed', 'Fecha por confirmar')
    groups.set(key, [...(groups.get(key) ?? []), r])
  }

  const doc = (
    <Document title={`${t('Concierge plan', 'Plan de conserjería')} — ${opts.propertyTitle}`} author="Leticia Coudray Real Estate">
      <Page size="A4" style={s.page}>
        <Text style={s.eyebrow}>{t('Concierge plan', 'Plan de conserjería')}</Text>
        <Text style={s.title}>{opts.propertyTitle}</Text>
        <Text style={s.meta}>
          {opts.guestName} · {day(opts.checkIn)} – {day(opts.checkOut)}
        </Text>
        <View style={s.rule} />

        {live.length === 0 && <Text>{t('No concierge services yet.', 'Aún no hay servicios de conserjería.')}</Text>}

        {Array.from(groups.entries()).map(([label, items]) => (
          <View key={label}>
            <Text style={s.day}>{label}</Text>
            {items.map((r, i) => (
              <RequestBlock key={i} r={r} locale={locale} day={day} />
            ))}
          </View>
        ))}

        <Text style={[s.footer, { textAlign: 'left' }]} fixed>
          Leticia Coudray Real Estate
        </Text>
      </Page>
    </Document>
  )
  return renderToBuffer(doc)
}

function RequestBlock({ r, locale, day }: { r: ConciergePdfRequest; locale: 'en' | 'es'; day: (d: Date) => string }) {
  const t = (en: string, es: string) => (locale === 'es' ? es : en)
  const lines = serviceDetailLines(r.serviceSlug, r.details, locale)
  const where = [r.venueName, r.attractionName].filter(Boolean).join(' · ')
  const sub = [
    r.endDate ? `${t('Until', 'Hasta')} ${day(r.endDate)}` : null,
    r.partySize ? t(`${r.partySize} people`, `${r.partySize} personas`) : null,
    r.quotedAmount ? `${r.currency ?? 'USD'} ${Number(r.quotedAmount.toString()).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : null,
  ].filter(Boolean)

  const grocery = Array.isArray(r.groceryItems) ? (r.groceryItems as Array<Record<string, unknown>>) : []
  const plates = Array.isArray(r.plateItems) ? (r.plateItems as Array<Record<string, unknown>>) : []
  const itemName = (i: Record<string, unknown>) =>
    String((locale === 'es' ? i.name_es || i.name_en : i.name_en || i.name_es) || i.slug || '')

  return (
    <View style={s.item} wrap={false}>
      <Text style={s.when}>{formatTime(r.preferredTime) || '—'}</Text>
      <View style={s.body}>
        <Text style={s.name}>{r.serviceName}</Text>
        {where ? <Text style={s.sub}>{where}</Text> : null}
        {sub.length > 0 && <Text style={s.sub}>{sub.join(' · ')}</Text>}
        {lines.map((l) => (
          <View key={l.label} style={s.detail}>
            <Text style={s.detailLabel}>{l.label}</Text>
            <Text style={s.detailValue}>{l.value}</Text>
          </View>
        ))}
        {grocery.length > 0 && (
          <Text style={s.notes}>
            {grocery.map((g) => `${itemName(g)} ×${g.qty ?? 1}`).join(', ')}
          </Text>
        )}
        {plates.length > 0 && <Text style={s.notes}>{plates.map(itemName).join(', ')}</Text>}
        {r.notes ? <Text style={s.notes}>{r.notes}</Text> : null}
      </View>
      <Text style={s.status}>{STATUS[r.status]?.[locale] ?? r.status}</Text>
    </View>
  )
}
