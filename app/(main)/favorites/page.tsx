import { Metadata } from 'next'
import FavoritesPageClient from './FavoritesPageClient'

export const metadata: Metadata = {
  title: 'My Favorites | Caribbean Estates',
  description: 'View and manage your favorite properties',
}

export default function FavoritesPage() {
  return <FavoritesPageClient />
}
