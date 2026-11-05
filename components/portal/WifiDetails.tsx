'use client'

import { useState } from 'react'
import QRCode from 'react-qr-code'
import { Check, Copy, QrCode } from 'lucide-react'

/** Escape a value for the WIFI: QR payload (\ ; , : " must be backslashed). */
function esc(v: string) {
  return v.replace(/([\\;,:"])/g, '\\$1')
}

/**
 * Wi-Fi network + password with one-tap copy, and a "Show QR to connect"
 * toggle. Scanning the QR with a phone camera (iOS or Android) offers
 * "Join network" — no typing.
 */
export function WifiDetails({
  network,
  password,
  locale,
}: {
  network?: string | null
  password?: string | null
  locale: 'en' | 'es'
}) {
  const t = (en: string, es: string) => (locale === 'es' ? es : en)
  const [showQr, setShowQr] = useState(false)
  const qrValue = network
    ? `WIFI:T:${password ? 'WPA' : 'nopass'};S:${esc(network)};${password ? `P:${esc(password)};` : ''};`
    : null

  return (
    <div className="py-5 border-b border-line">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
        {network && <CopyRow label={t('Wi-Fi network', 'Red Wi-Fi')} value={network} locale={locale} />}
        {password && <CopyRow label={t('Wi-Fi password', 'Contraseña Wi-Fi')} value={password} locale={locale} />}
      </div>

      {qrValue && (
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setShowQr((v) => !v)}
            aria-expanded={showQr}
            className="inline-flex items-center gap-2 text-sm font-light text-body-strong hover:text-ink underline underline-offset-4"
          >
            <QrCode className="w-4 h-4" />
            {showQr ? t('Hide QR code', 'Ocultar código QR') : t('Show QR to connect', 'Mostrar QR para conectarse')}
          </button>
          {showQr && (
            <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="bg-white p-4 border border-line rounded-sm w-fit">
                <QRCode value={qrValue} size={184} fgColor="#1c1917" bgColor="#ffffff" />
              </div>
              <p className="text-sm text-muted font-light max-w-xs leading-relaxed">
                {t(
                  'Point another phone’s camera at this code and tap “Join network”. Works on iPhone and Android.',
                  'Apunta la cámara de otro teléfono a este código y toca “Unirse a la red”. Funciona en iPhone y Android.'
                )}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function CopyRow({ label, value, locale }: { label: string; value: string; locale: 'en' | 'es' }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
    } catch {
      // Older browsers: fall back to a hidden textarea.
      const ta = document.createElement('textarea')
      ta.value = value
      ta.setAttribute('readonly', '')
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div>
      <p className="eyebrow mb-1.5">{label}</p>
      <button
        type="button"
        onClick={copy}
        className="group flex w-full items-center justify-between gap-3 px-3 py-2.5 border border-line rounded-sm text-left hover:bg-sand transition-colors"
        aria-label={`${label}: ${value}. ${locale === 'es' ? 'Toca para copiar' : 'Tap to copy'}`}
      >
        <span className="font-mono text-[15px] tracking-wide text-ink break-all">{value}</span>
        <span className="shrink-0 inline-flex items-center gap-1 text-xs text-muted group-hover:text-ink">
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? (locale === 'es' ? 'Copiado' : 'Copied') : locale === 'es' ? 'Copiar' : 'Copy'}
        </span>
      </button>
    </div>
  )
}
