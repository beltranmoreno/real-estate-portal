import type { Metadata } from 'next'
import { getPageHero } from '@/lib/pageHero'
import ContactPageClient from './ContactPageClient'

export const metadata: Metadata = {
  title: 'Contact · Leticia Coudray Real Estate',
  description: 'Get in touch with Leticia Coudray Real Estate about renting, buying or selling in Casa de Campo.',
}

export default async function ContactPage() {
  const hero = await getPageHero('contact')
  return <ContactPageClient hero={hero} />
}
