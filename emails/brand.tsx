import { Img } from '@react-email/components'
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
