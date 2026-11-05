import { Img, Text } from '@react-email/components'
import * as React from 'react'

/**
 * Always the live site: email clients can't load images from localhost,
 * and the www host avoids a redirect on every image request.
 */
const ASSET_BASE = 'https://www.leticiacoudrayrealestate.com'

export const LOGO_URL = `${ASSET_BASE}/Logo_LCS_Real_Estate.png`

/** Logo for the top of guest-facing emails (source is 4268×1149). */
export function EmailLogo() {
  return (
    <Img
      src={LOGO_URL}
      width="220"
      height="59"
      alt="Leticia Coudray Saladin Real Estate"
      style={{ display: 'block', margin: '0 0 32px 0', height: 'auto' }}
    />
  )
}

/**
 * The sign-off every email ends with:
 *   Warm regards,
 *   The Leticia Coudray Saladin Team
 *   Real Estate | Casa de Campo
 */
export function EmailSignature({ locale = 'en' }: { locale?: 'en' | 'es' }) {
  const es = locale === 'es'
  return (
    <>
      <Text style={{ color: '#44403c', fontSize: 16, lineHeight: 1.6, margin: '28px 0 12px 0', fontWeight: 300 }}>
        {es ? 'Un cordial saludo,' : 'Warm regards,'}
      </Text>
      <Text style={{ color: '#1c1917', fontSize: 16, lineHeight: 1.5, margin: 0 }}>
        {es ? 'El equipo de Leticia Coudray Saladin' : 'The Leticia Coudray Saladin Team'}
      </Text>
      <Text style={{ color: '#78716c', fontSize: 14, lineHeight: 1.5, margin: '2px 0 0 0', fontWeight: 300 }}>
        Real Estate | Casa de Campo
      </Text>
    </>
  )
}
