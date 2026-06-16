import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import '../globals.css'

export const metadata: Metadata = {
  title: 'Portal · Leticia Coudray Real Estate',
  description: 'Your stay in Casa de Campo',
  robots: { index: false, follow: false, nocache: true },
}

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <div className="min-h-screen bg-stone-50">{children}</div>
    </ClerkProvider>
  )
}
