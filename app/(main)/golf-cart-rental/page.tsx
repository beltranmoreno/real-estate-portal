import { Metadata } from 'next'
import GolfCartRentalClient from './GolfCartRentalClient'

export const metadata: Metadata = {
  title: 'Golf Cart Rental | Casa de Campo Resort',
  description: 'Rent premium golf carts for convenient transportation around Casa de Campo Resort. Choose from various models for your perfect resort experience.',
  openGraph: {
    title: 'Golf Cart Rental | Casa de Campo Resort',
    description: 'Rent premium golf carts for convenient transportation around Casa de Campo Resort.',
    type: 'website'
  }
}

export default function GolfCartRentalPage() {
  return <GolfCartRentalClient />
}