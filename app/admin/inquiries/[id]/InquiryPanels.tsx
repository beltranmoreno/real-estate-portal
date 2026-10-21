'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Copy, ExternalLink } from 'lucide-react'
import type { InquiryStatus } from '@prisma/client'
import type { PropertyOption } from '@/lib/portal/properties'
import { tFor } from '@/lib/i18n'
import { whatsappLink } from '@/lib/inquiry'
import { PropertyMultiPicker } from '../PropertyMultiPicker'
import { INQUIRY_STATUSES, inquiryStatusLabel } from '../labels'

const inputClass =
  'w-full rounded-sm border border-stone-300 px-3 py-2.5 text-sm font-light focus:outline-none focus:ring-2 focus:ring-stone-800'
const primaryButton =
  'px-4 py-2 bg-stone-800 text-white text-xs font-light tracking-wide rounded-sm hover:bg-stone-900 disabled:opacity-60 disabled:cursor-not-allowed'
const secondaryButton =
  'px-4 py-2 border border-stone-300 text-stone-800 text-xs font-light tracking-wide rounded-sm hover:bg-stone-100'
const linkButton = 'text-xs uppercase tracking-[0.15em] text-stone-500 hover:text-stone-900 underline underline-offset-4'

async function patchInquiry(id: string, body: Record<string, unknown>) {
  const res = await fetch(`/api/admin/inquiries/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error || 'Request failed')
  }
}

export function StatusSelect({ id, status, locale = 'en' }: { id: string; status: InquiryStatus; locale?: 'en' | 'es' }) {
  const t = tFor(locale)
  const router = useRouter()
  const [value, setValue] = useState(status)
  const [saving, setSaving] = useState(false)

  return (
    <select
      value={value}
      disabled={saving}
      onChange={async (e) => {
        const next = e.target.value as InquiryStatus
        const prev = value
        setValue(next)
        setSaving(true)
        try {
          await patchInquiry(id, { status: next })
          router.refresh()
        } catch {
          setValue(prev)
        } finally {
          setSaving(false)
        }
      }}
      className="rounded-sm border border-stone-300 bg-white px-3 py-2 text-sm font-light focus:outline-none focus:ring-2 focus:ring-stone-800"
    >
      {INQUIRY_STATUSES.map((s) => (
        <option key={s} value={s}>
          {inquiryStatusLabel(t, s)}
        </option>
      ))}
    </select>
  )
}

export function NotesEditor({ id, initialValue, locale = 'en' }: { id: string; initialValue: string; locale?: 'en' | 'es' }) {
  const t = tFor(locale)
  const [value, setValue] = useState(initialValue)
  const [saved, setSaved] = useState(initialValue)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!editing) {
    return (
      <div>
        {saved ? (
          <p className="text-sm text-stone-700 font-light whitespace-pre-wrap leading-relaxed mb-3">{saved}</p>
        ) : (
          <p className="text-sm text-stone-400 font-light italic mb-3">
            {t('No notes yet. Only admins see these.', 'Sin notas todavía. Solo los administradores las ven.')}
          </p>
        )}
        <button type="button" onClick={() => setEditing(true)} className={linkButton}>
          {saved ? t('Edit notes', 'Editar notas') : t('+ Add notes', '+ Agregar notas')}
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <textarea value={value} onChange={(e) => setValue(e.target.value)} rows={5} autoFocus className={inputClass} />
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={saving}
          className={primaryButton}
          onClick={async () => {
            setSaving(true)
            setError(null)
            try {
              await patchInquiry(id, { notes: value })
              setSaved(value)
              setEditing(false)
            } catch (err: any) {
              setError(err?.message ?? t('Something went wrong', 'Algo salió mal'))
            } finally {
              setSaving(false)
            }
          }}
        >
          {saving ? t('Saving…', 'Guardando…') : t('Save', 'Guardar')}
        </button>
        <button
          type="button"
          className={secondaryButton}
          onClick={() => {
            setValue(saved)
            setEditing(false)
          }}
        >
          {t('Cancel', 'Cancelar')}
        </button>
      </div>
      {error && <p className="text-xs text-red-600 font-light">{error}</p>}
    </div>
  )
}

/** Add or remove houses (before a collection exists; afterwards, edit the collection in Sanity). */
export function HousesEditor({
  id,
  properties,
  value,
  locale = 'en',
}: {
  id: string
  properties: PropertyOption[]
  value: string[]
  locale?: 'en' | 'es'
}) {
  const t = tFor(locale)
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [ids, setIds] = useState(value)
  const [saving, setSaving] = useState(false)

  if (!editing) {
    return (
      <button type="button" onClick={() => setEditing(true)} className={linkButton}>
        {value.length ? t('Edit houses', 'Editar casas') : t('+ Add houses', '+ Agregar casas')}
      </button>
    )
  }

  return (
    <div className="space-y-3 pt-2">
      <PropertyMultiPicker properties={properties} value={ids} onChange={setIds} locale={locale} />
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={saving}
          className={primaryButton}
          onClick={async () => {
            setSaving(true)
            try {
              await patchInquiry(id, { propertyIds: ids })
              setEditing(false)
              router.refresh()
            } finally {
              setSaving(false)
            }
          }}
        >
          {saving ? t('Saving…', 'Guardando…') : t('Save houses', 'Guardar casas')}
        </button>
        <button
          type="button"
          className={secondaryButton}
          onClick={() => {
            setIds(value)
            setEditing(false)
          }}
        >
          {t('Cancel', 'Cancelar')}
        </button>
      </div>
    </div>
  )
}

interface CollectionPanelProps {
  id: string
  houseCount: number
  guestName: string
  guestEmail: string | null
  guestWhatsapp: string | null
  guestLocale: 'en' | 'es'
  collection: {
    url: string
    studioUrl: string
    accessCode: string | null
    sentAt: string | null
    sentTo: string | null
  } | null
  locale?: 'en' | 'es'
}

/** Create the private collection, link to it in Sanity, and send it to the guest. */
export function CollectionPanel({
  id,
  houseCount,
  guestName,
  guestEmail,
  guestWhatsapp,
  guestLocale,
  collection,
  locale = 'en',
}: CollectionPanelProps) {
  const t = tFor(locale)
  const router = useRouter()
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [to, setTo] = useState(guestEmail ?? '')
  const [note, setNote] = useState('')
  const [emailLocale, setEmailLocale] = useState(guestLocale)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  if (!collection) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-stone-600 font-light leading-relaxed">
          {t(
            "Creates a private collection in Sanity with this inquiry's houses, a welcome message and an access code. You can add more houses and details in Sanity before sending it.",
            'Crea una colección privada en Sanity con las casas de esta consulta, un mensaje de bienvenida y un código de acceso. Puedes agregar más casas y detalles en Sanity antes de enviarla.'
          )}
        </p>
        <button
          type="button"
          disabled={creating || houseCount === 0}
          className={primaryButton}
          onClick={async () => {
            setCreating(true)
            setError(null)
            try {
              const res = await fetch(`/api/admin/inquiries/${id}/collection`, { method: 'POST' })
              const data = await res.json()
              if (!res.ok) throw new Error(data.error || 'Request failed')
              router.refresh()
            } catch (err: any) {
              setError(err?.message ?? t('Something went wrong', 'Algo salió mal'))
            } finally {
              setCreating(false)
            }
          }}
        >
          {creating ? t('Creating…', 'Creando…') : t('Create private collection', 'Crear colección privada')}
        </button>
        {houseCount === 0 && (
          <p className="text-xs text-stone-500 font-light">{t('Add at least one house first.', 'Agrega al menos una casa primero.')}</p>
        )}
        {error && <p className="text-xs text-red-600 font-light">{error}</p>}
      </div>
    )
  }

  const firstName = guestName.trim().split(/\s+/)[0]
  const waText =
    guestLocale === 'es'
      ? `Hola ${firstName}, te preparé una selección de casas: ${collection.url}`
      : `Hi ${firstName}, I've put together a selection of houses for you: ${collection.url}`

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <input readOnly value={collection.url} className={`${inputClass} text-stone-600`} onFocus={(e) => e.target.select()} />
          <button
            type="button"
            aria-label={t('Copy link', 'Copiar enlace')}
            className="p-2.5 border border-stone-300 rounded-sm hover:bg-stone-100"
            onClick={async () => {
              await navigator.clipboard.writeText(collection.url)
              setCopied(true)
              setTimeout(() => setCopied(false), 1500)
            }}
          >
            {copied ? <Check className="w-4 h-4 text-green-700" /> : <Copy className="w-4 h-4 text-stone-600" />}
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={collection.studioUrl} target="_blank" rel="noopener noreferrer" className={`${secondaryButton} inline-flex items-center gap-1.5`}>
            <ExternalLink className="w-3.5 h-3.5" />
            {t('Edit in Sanity', 'Editar en Sanity')}
          </a>
          <a href={collection.url} target="_blank" rel="noopener noreferrer" className={`${secondaryButton} inline-flex items-center gap-1.5`}>
            <ExternalLink className="w-3.5 h-3.5" />
            {t('Preview', 'Ver')}
          </a>
          {guestWhatsapp && (
            <a
              href={whatsappLink(waText, guestWhatsapp)}
              target="_blank"
              rel="noopener noreferrer"
              className={`${secondaryButton} inline-flex items-center gap-1.5`}
            >
              {t('Send on WhatsApp', 'Enviar por WhatsApp')}
            </a>
          )}
        </div>
        {collection.accessCode && (
          <p className="text-xs text-stone-500 font-light">
            {t('Access code', 'Código de acceso')}: <span className="tracking-wider text-stone-800">{collection.accessCode}</span>{' '}
            {t('(already included in the link)', '(ya incluido en el enlace)')}
          </p>
        )}
      </div>

      <div className="border-t border-stone-200 pt-5 space-y-3">
        <h3 className="text-xs uppercase tracking-[0.2em] text-stone-500 font-light">{t('Send by email', 'Enviar por correo')}</h3>
        {collection.sentAt && !sent && (
          <p className="text-xs text-stone-500 font-light">
            {t(`Last sent to ${collection.sentTo} on ${collection.sentAt}.`, `Enviada a ${collection.sentTo} el ${collection.sentAt}.`)}
          </p>
        )}
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <input type="email" value={to} onChange={(e) => setTo(e.target.value)} placeholder="guest@email.com" className={inputClass} />
          <select
            value={emailLocale}
            onChange={(e) => setEmailLocale(e.target.value as 'en' | 'es')}
            className="rounded-sm border border-stone-300 bg-white px-3 text-sm font-light"
          >
            <option value="en">EN</option>
            <option value="es">ES</option>
          </select>
        </div>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={4}
          placeholder={t('A personal note (optional) — shown above the link.', 'Una nota personal (opcional) — aparece sobre el enlace.')}
          className={inputClass}
        />
        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={sending || !to.trim()}
            className={primaryButton}
            onClick={async () => {
              setSending(true)
              setError(null)
              try {
                const res = await fetch(`/api/admin/inquiries/${id}/send`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ to: to.trim(), note, locale: emailLocale }),
                })
                const data = await res.json()
                if (!res.ok) throw new Error(data.error || 'Request failed')
                setSent(true)
                router.refresh()
              } catch (err: any) {
                setError(err?.message ?? t('Something went wrong', 'Algo salió mal'))
              } finally {
                setSending(false)
              }
            }}
          >
            {sending ? t('Sending…', 'Enviando…') : collection.sentAt ? t('Send again', 'Enviar de nuevo') : t('Send collection', 'Enviar colección')}
          </button>
          {sent && <span className="text-xs text-green-700 font-light">{t(`Sent to ${to}.`, `Enviada a ${to}.`)}</span>}
        </div>
        {error && <p className="text-xs text-red-600 font-light">{error}</p>}
      </div>
    </div>
  )
}
