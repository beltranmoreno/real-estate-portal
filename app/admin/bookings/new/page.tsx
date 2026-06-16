import { getPropertyOptions } from '@/lib/portal/properties'
import { CreateBookingForm } from './CreateBookingForm'

export default async function NewBookingPage() {
  const properties = await getPropertyOptions()

  return (
    <div className="container mx-auto px-6 py-10 max-w-3xl">
      <p className="text-xs uppercase tracking-[0.25em] text-stone-500 mb-3">
        New booking
      </p>
      <h1 className="text-3xl font-light text-stone-900 tracking-tight mb-2">
        Invite a guest
      </h1>
      <p className="text-stone-600 font-light mb-10 max-w-2xl">
        Creates a pending booking and sends the guest a magic-link invitation
        to access their portal. They can sign in with email — no password.
      </p>

      <CreateBookingForm properties={properties} />
    </div>
  )
}
